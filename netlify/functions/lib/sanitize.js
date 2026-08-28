'use strict';

// Security-focused HTML sanitizer with correct HTML-entity handling.
//
// Design notes:
// - Parses the input tag-by-tag, keeping only an allow-list of elements and
//   attributes, and validating every URL scheme (blocks javascript:, data:,
//   vbscript:, file:).
// - HTML entities that appear in TEXT NODES are decoded to their real
//   characters (so WordPress smart quotes like &#8217; render as ' instead of
//   the literal string "&#8217;"). This is done globally, no per-entity
//   hardcoding, and only after the structural tag parsing -- so decoded text
//   can never form new tags or attributes.
// - Literal stray '&', '<' or '>' in text are still escaped so raw input can
//   never break out into markup.

const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'br', 'hr',
  'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', 'small'
]);
const VOID_TAGS = new Set(['br', 'hr', 'img']);
const ALLOWED_ATTRS = {
  a: new Set(['href', 'title']),
  img: new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding']),
  th: new Set(['scope', 'colspan', 'rowspan']),
  td: new Set(['colspan', 'rowspan']),
  div: new Set(['class', 'data-label', 'data-type']),
  span: new Set(['class'])
};
const ALLOWED_CLASSES = new Set([
  'example-block', 'example-label', 'example-pair', 'example-weak', 'example-strong',
  'key-takeaway', 'key-takeaway-title', 'cta-block', 'cta-title', 'cta-text',
  'note', 'tip', 'warning', 'question', 'callout', 'callout-title', 'checklist',
  'faq', 'faq-item', 'h3'
]);
const SAFE_URL_SCHEMES = new Set(['http:', 'https:', 'mailto:']);
const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  nbsp: '\u00a0', copy: '\u00a9', reg: '\u00ae', trade: '\u2122',
  hellip: '\u2026', mdash: '\u2014', ndash: '\u2013', rsquo: '\u2019',
  lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', bull: '\u2022',
  middot: '\u00b7', times: '\u00d7', divide: '\u00f7', deg: '\u00b0',
  plusmn: '\u00b1', micro: '\u00b5', para: '\u00b6', sect: '\u00a7',
  laquo: '\u00ab', raquo: '\u00bb', iexcl: '\u00a1', iquest: '\u00bf',
  sbquo: '\u201a', bdquo: '\u201e', dagger: '\u2020', Dagger: '\u2021',
  permil: '\u2030', prime: '\u2032', Prime: '\u2033', lsaquo: '\u2039',
  rsaquo: '\u203a', oline: '\u203e', frasl: '\u2044', euro: '\u20ac',
  pound: '\u00a3', yen: '\u00a5', cent: '\u00a2', curren: '\u00a4'
};
// Also handle common numeric/named entities not explicitly listed: numeric
// entities are handled by the decimal/hex branch below.

function decodeEntities(str) {
  return String(str).replace(/&(#[xX][0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]{1,31});/g, (m, body) => {
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

// Decode only the safe, valid entities. Stray '&' not part of an entity is
// left untouched so it can be re-escaped safely downstream.
function decodeTextContent(s) {
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
  const decoded = decodeTextContent(String(raw == null ? '' : raw)).trim()
    .replace(/[\u0000-\u0020]+/g, (ch, off, str) => (off === 0 || off + 1 === str.length ? '' : ch));
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

// Escape the literal text that flows into the output. Entities were already
// decoded by decodeTextContent, so only genuinely stray &/< > need escaping.
function escapeText(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Combined: decode valid entities, then escape anything that would still be
// dangerous (stray & that formed no entity, plus < >). Order matters:
// 1. decode entities -> turn &#8217; into '   (text only)
// 2. escape remaining raw &, <, >  -> safe literal text
function safeText(s) {
  return escapeText(decodeTextContent(s));
}

function tokenizeAttrs(tagBody) {
  const out = [];
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
      out.push({ name: name.toLowerCase(), value });
    } else {
      out.push({ name: name.toLowerCase(), value: null });
    }
  }
  return out;
}

function allowClass(value) {
  const classes = String(value || '').split(/\s+/).filter(Boolean);
  const kept = classes.filter((c) => ALLOWED_CLASSES.has(c));
  return kept.join(' ');
}

function sanitizeHtml(input) {
  const s = String(input == null ? '' : input);
  let out = '';
  const stack = [];
  let i = 0;
  const len = s.length;

  while (i < len) {
    const lt = s.indexOf('<', i);
    if (lt === -1) {
      out += safeText(s.slice(i));
      break;
    }
    if (lt > i) {
      out += safeText(s.slice(i, lt));
    }
    if (s.startsWith('<!--', lt)) {
      const end = s.indexOf('-->', lt + 4);
      i = end === -1 ? len : end + 3;
      continue;
    }
    if (s.startsWith('<!', lt) || s.startsWith('<?', lt)) {
      const end = s.indexOf('>', lt);
      i = end === -1 ? len : end + 1;
      continue;
    }
    const tagMatch = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/.exec(s.slice(lt));
    if (!tagMatch) {
      out += '&lt;';
      i = lt + 1;
      continue;
    }
    const closing = tagMatch[1] === '/';
    const tagName = tagMatch[2].toLowerCase();
    const tagBody = tagMatch[3];
    i = lt + tagMatch[0].length;

    if (!ALLOWED_TAGS.has(tagName)) continue;

    if (closing) {
      if (VOID_TAGS.has(tagName)) continue;
      const idx = stack.lastIndexOf(tagName);
      if (idx !== -1) {
        while (stack.length > idx) out += '</' + stack.pop() + '>';
      }
      continue;
    }

    if (VOID_TAGS.has(tagName)) {
      const attrs = tokenizeAttrs(tagBody);
      let attrStr = '';
      for (const a of attrs) {
        if (!(ALLOWED_ATTRS[tagName] || new Set()).has(a.name)) continue;
        if (a.value == null) continue;
        if (a.name === 'class') {
          const cls = allowClass(a.value);
          if (cls) attrStr += ' class="' + escapeAttr(cls) + '"';
          continue;
        }
        if (a.name === 'href' || a.name === 'src') {
          if (!isSafeUrl(a.value)) continue;
          if (tagName === 'img' && a.name === 'src') {
            const src = decodeTextContent(a.value).trim();
            if (!src) continue;
            if ((/^(https?:)?\/\//i.test(src) && !/^https?:\/\//i.test(src)) ||
                (!src.startsWith('/uploads/') && !/^https?:\/\//i.test(src))) {
              continue;
            }
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
      const attrs = tokenizeAttrs(tagBody);
      let href = null;
      let title = null;
      let cls = '';
      for (const a of attrs) {
        if (a.name === 'href' && a.value != null) href = a.value;
        else if (a.name === 'title' && a.value != null) title = a.value;
        else if (a.name === 'class') cls = allowClass(a.value);
      }
      if (href == null || !isSafeUrl(href)) {
        // Unsafe/unlinked anchor rendered as literal text. `i` already points
        // past the closing '>' of the tag (see above), so emit the tag source
        // escaped as text without re-scanning it.
        out += safeText(s.slice(lt, i));
        continue;
      }
      let attrStr = ' href="' + escapeAttr(href) + '"';
      if (title != null) attrStr += ' title="' + escapeAttr(title) + '"';
      if (cls) attrStr += ' class="' + escapeAttr(cls) + '"';
      attrStr += ' rel="noopener"';
      if (/^https?:\/\//i.test(href)) attrStr += ' target="_blank"';
      out += '<a' + attrStr + '>';
      stack.push('a');
      continue;
    }

    // container element
    let attrStr = '';
    if (tagName === 'div' || tagName === 'span') {
      const attrs = tokenizeAttrs(tagBody);
      let cls = '';
      for (const a of attrs) {
        if (a.name === 'class') cls = allowClass(a.value);
        else if ((ALLOWED_ATTRS[tagName] || new Set()).has(a.name) && a.value != null) {
          attrStr += ' ' + a.name + '="' + escapeAttr(a.value) + '"';
        }
      }
      if (cls) attrStr += ' class="' + escapeAttr(cls) + '"';
    }
    out += '<' + tagName + attrStr + '>';
    stack.push(tagName);
  }

  while (stack.length) out += '</' + stack.pop() + '>';
  return out;
}

module.exports = { sanitizeHtml, decodeEntities, decodeTextContent, isSafeUrl, safeText };
