'use strict';

const ALLOWED_TAGS = new Set([
  'p', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'br', 'hr',
  'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
]);
const VOID_TAGS = new Set(['br', 'hr', 'img']);
const ALLOWED_ATTRS = {
  a: new Set(['href', 'title']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding']),
  th: new Set(['scope']),
  td: new Set(['colspan', 'rowspan'])
};
const SAFE_URL_SCHEMES = new Set(['http:', 'https:', 'mailto:']);
const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '\u00a9' };

function decodeEntities(s) {
  return String(s).replace(/&(#[xX][0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]{1,31});/g, (m, body) => {
    if (body[0] === '#') {
      let code;
      if (body[1] === 'x' || body[1] === 'X') code = parseInt(body.slice(2), 16);
      else code = parseInt(body.slice(1), 10);
      if (!isFinite(code) || code < 0 || code > 0x10ffff) return '\uFFFD';
      try { return String.fromCodePoint(code); } catch (e) { return '\uFFFD'; }
    }
    const lower = body.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, lower)) return NAMED_ENTITIES[lower];
    return m;
  });
}

function isSafeUrl(raw) {
  const decoded = decodeEntities(String(raw == null ? '' : raw)).trim().replace(/[\u0000-\u0020]+/g, (ch, off, str) => (off === 0 || off + 1 === str.length ? '' : ch));
  const cleaned = decoded.replace(/[\u0000-\u001f\u007f]/g, '').toLowerCase();
  if (cleaned === '') return true;
  if (cleaned.startsWith('/') && !cleaned.startsWith('//')) return true;
  if (cleaned.startsWith('#')) return true;
  const colon = cleaned.indexOf(':');
  if (colon === -1) return true;
  const scheme = cleaned.slice(0, colon + 1);
  return SAFE_URL_SCHEMES.has(scheme) && !/^javascript:/i.test(cleaned) && !/^data:/i.test(cleaned) && !/^vbscript:/i.test(cleaned) && !/^file:/i.test(cleaned);
}

function escapeAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeText(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function tokenizeAttrs(tagBody) {
  const attrs = [];
  let i = 0;
  const n = tagBody.length;
  while (i < n) {
    while (i < n && /[\s\u0000]/.test(tagBody[i])) i++;
    if (i >= n) break;
    let name = '';
    while (i < n && /[^\s=/>]/.test(tagBody[i])) { name += tagBody[i]; i++; }
    if (!name) { i++; continue; }
    while (i < n && /[\s]/.test(tagBody[i])) i++;
    if (tagBody[i] === '=') {
      i++;
      while (i < n && /\s/.test(tagBody[i])) i++;
      let value = '';
      if (tagBody[i] === '"' || tagBody[i] === "'") {
        const quote = tagBody[i];
        i++;
        while (i < n && tagBody[i] !== quote) { value += tagBody[i]; i++; }
        if (i < n) i++;
      } else {
        while (i < n && !/[\s>]/.test(tagBody[i])) { value += tagBody[i]; i++; }
      }
      attrs.push({ name: name.toLowerCase(), value });
    } else {
      attrs.push({ name: name.toLowerCase(), value: null });
    }
  }
  return attrs;
}

function sanitizeHtml(input) {
  const src = String(input == null ? '' : input);
  let out = '';
  const openStack = [];
  let i = 0;
  const n = src.length;

  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt === -1) { out += escapeText(src.slice(i)); break; }
    if (lt > i) out += escapeText(src.slice(i, lt));

    if (src.startsWith('<!--', lt)) {
      const end = src.indexOf('-->', lt + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (src.startsWith('<!', lt) || src.startsWith('<?', lt)) {
      const end = src.indexOf('>', lt);
      i = end === -1 ? n : end + 1;
      continue;
    }

    const tagMatch = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/.exec(src.slice(lt));
    if (!tagMatch) {
      out += '&lt;';
      i = lt + 1;
      continue;
    }

    const closing = tagMatch[1] === '/';
    const tagName = tagMatch[2].toLowerCase();
    const attrBody = tagMatch[3];
    i = lt + tagMatch[0].length;

    if (!ALLOWED_TAGS.has(tagName)) continue;

    if (closing) {
      if (VOID_TAGS.has(tagName)) continue;
      const idx = openStack.lastIndexOf(tagName);
      if (idx !== -1) {
        while (openStack.length > idx) {
          out += '</' + openStack.pop() + '>';
        }
      }
      continue;
    }

    if (VOID_TAGS.has(tagName)) {
      const attrs = tokenizeAttrs(attrBody).filter((a) => (ALLOWED_ATTRS[tagName] || new Set()).has(a.name));
      let attrStr = '';
      for (const a of attrs) {
        if (a.value == null) continue;
        if (a.name === 'href' || a.name === 'src') {
          if (!isSafeUrl(a.value)) continue;
          if (tagName === 'img' && a.name === 'src') {
            const v = decodeEntities(a.value).trim();
            if (/^(https?:)?\/\//i.test(v) && !/^https?:\/\//i.test(v)) continue;
            if (!v.startsWith('/uploads/') && !/^https?:\/\//i.test(v)) continue;
          }
        }
        attrStr += ' ' + a.name + '="' + escapeAttr(a.value) + '"';
      }
      if (tagName === 'a') attrStr += ' rel="noopener"';
      if (tagName === 'img') {
        if (!/\sloading="/.test(attrStr)) attrStr += ' loading="lazy"';
        if (!/\sdecoding="/.test(attrStr)) attrStr += ' decoding="async"';
      }
      out += '<' + tagName + attrStr + '>';
      continue;
    }

    if (tagName === 'a') {
      const attrs = tokenizeAttrs(attrBody);
      let href = null;
      let title = null;
      for (const a of attrs) {
        if (a.name === 'href' && a.value != null && isSafeUrl(a.value)) href = a.value;
        else if (a.name === 'title' && a.value != null) title = a.value;
      }
      let attrStr = '';
      if (href != null) attrStr += ' href="' + escapeAttr(href) + '"';
      if (title != null) attrStr += ' title="' + escapeAttr(title) + '"';
      if (href != null && /^https?:\/\//i.test(decodeEntities(href).trim())) attrStr += ' target="_blank" rel="noopener noreferrer"';
      else if (href != null) attrStr += ' rel="noopener"';
      out += '<a' + attrStr + '>';
      openStack.push('a');
      continue;
    }

    const allowedSet = ALLOWED_ATTRS[tagName];
    if (allowedSet) {
      const attrs = tokenizeAttrs(attrBody).filter((a) => allowedSet.has(a.name));
      let attrStr = '';
      for (const a of attrs) {
        if (a.value == null) continue;
        attrStr += ' ' + a.name + '="' + escapeAttr(a.value) + '"';
      }
      out += '<' + tagName + attrStr + '>';
    } else {
      out += '<' + tagName + '>';
    }
    openStack.push(tagName);
  }

  while (openStack.length) out += '</' + openStack.pop() + '>';
  return out;
}

module.exports = { sanitizeHtml, decodeEntities, isSafeUrl };
