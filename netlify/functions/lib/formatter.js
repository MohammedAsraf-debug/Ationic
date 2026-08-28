'use strict';

// Smart article formatter.
//
// Detects whether incoming content is already valid/safe HTML (e.g. from the
// WordPress visual editor) or plain text / loose Markdown (e.g. pasted from an
// AI assistant), and converts the latter into clean semantic HTML that matches
// the Ationic blog design system.
//
// Pipeline (see also lib/wp.js):
//   raw content -> normalize newlines -> if HTML skip formatting -> else
//   markdown + structure detection -> paragraph assembly -> safe text encoding
//   -> sanitize -> semantic HTML.
//
// The formatter changes PRESENTATION only. It never rewrites the author's
// words, adds claims, or invents statistics.

const sanitize = require('./sanitize');

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

const HTML_RE = /<\s*(p|h[1-6]|div|ul|ol|li|blockquote|table|figure|img|strong|em|a)\b[^>]*>/i;

// Content from the WP block/visual editor is already HTML. We render it as-is
// through the sanitizer (single-pass, entities decoded by the sanitizer).
function looksLikeHtml(input) {
  return HTML_RE.test(input);
}

// ---------------------------------------------------------------------------
// Line normalization
// ---------------------------------------------------------------------------

function normalizeLines(input) {
  return String(input == null ? '' : input)
    .replace(/\r\n?/g, '\n')
    .split('\n');
}

function isBlank(line) {
  return String(line).trim() === '';
}

// ---------------------------------------------------------------------------
// Markdown inline formatting -> HTML inline, using the safe-text pass
// ---------------------------------------------------------------------------

// Convert **bold**, *italic*, `code` and [text](url) into sanitized HTML.
// Operates on already-entity-decoded text and produces safe markup that the
// sanitizer will later accept (URLs are validated here, then again by the
// sanitizer as defense in depth).
function renderInline(text) {
  // Decode any HTML entities that slipped into plain text (e.g. &#8217;).
  const base = sanitize.decodeEntities(String(text == null ? '' : text));

  // Tokenize: split into markdown-token runs and plain text runs. Plain text
  // is escaped (safe), generated markup is kept as-is. Non-generated literal
  // '<' '>' '&' in the source become safe entities.
  const tokens = [];
  let cursor = 0;
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+?\*|`[^`]+`|\[[^\[\]]+\]\([^)\s]+\))/g;
  let m;
  while ((m = re.exec(base)) !== null) {
    if (m.index > cursor) tokens.push({ type: 'text', value: base.slice(cursor, m.index) });
    tokens.push({ type: 'md', value: m[0] });
    cursor = m.index + m[0].length;
  }
  if (cursor < base.length) tokens.push({ type: 'text', value: base.slice(cursor) });

  let out = '';
  for (const t of tokens) {
    if (t.type === 'text') {
      out += sanitize.safeText(t.value);
    } else {
      const md = t.value;
      if (/^\*\*/.test(md)) {
        out += '<strong>' + sanitize.safeText(md.slice(2, -2)) + '</strong>';
      } else if (/^`/.test(md)) {
        out += '<code>' + sanitize.safeText(md.slice(1, -1)) + '</code>';
      } else if (/^\[/.test(md)) {
        const link = /^\[([^\[\]]+)\]\(([^)\s]+)\)$/.exec(md);
        if (link && sanitize.isSafeUrl(link[2])) {
          out += '<a href="' + sanitize.safeText(link[2]) + '">' + sanitize.safeText(link[1]) + '</a>';
        } else {
          out += sanitize.safeText(md);
        }
      } else if (/^\*/.test(md)) {
        out += '<em>' + sanitize.safeText(md.slice(1, -1)) + '</em>';
      } else {
        out += sanitize.safeText(md);
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Block-level structure detection and assembly
// ---------------------------------------------------------------------------

const KEY_TAKEAWAY_TITLES = ['key takeaway', 'key takeaways', 'takeaway', 'takeaways', 'remember', 'the important point', 'bottom line'];
const CTA_TITLES = ['need a', 'ready to', 'want to', 'get your', 'let us', 'get started', 'cta:', 'book a', 'schedule a'];
const EXAMPLE_PREFIXES = ['example:', 'for example:', 'example –', 'example —', 'here\u2019s a quick example'];

function linesWithIndex(lines) {
  return lines;
}

// Detect a standalone quoted line: "..." possibly spanning, or a line that is
// a question in quotes.
function isBlockQuote(line) {
  // Decode leading entities so `&#8220;...` is detected as a quote.
  const decoded = sanitize.decodeEntities(String(line || ''));
  const t = decoded.trim();
  if (!/^[\u201c"]/.test(t)) return false;
  // Only treat as blockquote if the whole line is essentially the quote
  const stripped = t.replace(/^[\u201c"]|[\u201d"]$/g, '');
  return stripped.trim().length > 0 && stripped.trim().length < 220;
}

function isHeading(line, prevWasHeading, index, total, lines) {
  const t = line.trim();
  // Explicit markdown heading markers
  const md = /^#{1,4}\s+/.exec(t);
  if (md) return { level: md[0].trim().length, text: t.replace(/^#{1,4}\s+/, '').trim() };

  // Numbered section headings like "1. Your Website Doesn't..." — treat as H3
  // (subsections under the H2 article). Only when short and single-line, and NOT
  // part of a consecutive numbered list (those are handled as <ol> elsewhere).
  const isInNumberedRun =
    (index + 1 < total && parseNumberedLine(lines[index + 1])) ||
    (index > 0 && parseNumberedLine(lines[index - 1]));
  const num = /^(\d{1,2})[.)]\s+(?![a-z])/.exec(t);
  if (num && t.length <= 130 && !isInNumberedRun) {
    return { level: 3, text: t.trim() };
  }

  // Title-case / strong section header (short, no sentence punctuation, and at
  // least half the words are capitalized => it reads like a heading rather than
  // a running sentence).
  if (t.length <= 100 && !/[.!?]$/.test(t) && /^[A-Z0-9\u201c"]/.test(t)) {
    // Yield to dedicated block handlers (CTA, key takeaway, example).
    const low = t.toLowerCase();
    if (
      CTA_TITLES.some((p) => low.startsWith(p)) ||
      KEY_TAKEAWAY_TITLES.some((p) => low === p || low.startsWith(p + ':') || low.startsWith(p + ' ')) ||
      EXAMPLE_PREFIXES.some((p) => low.startsWith(p))
    ) {
      return null;
    }
    const words = t.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w));
    const capitalized = words.filter((w) => /^[A-Z]/.test(w)).length;
    // A heading usually has >=2 capitalized words OR is mostly uppercase.
    if (words.length >= 2 && capitalized >= Math.max(2, Math.ceil(words.length * 0.5))) {
      return { level: prevWasHeading ? 4 : 2, text: t.trim() };
    }
  }
  return null;
}

function classifyListLine(line) {
  const t = line.trim();
  const bullet = /^[-*•]\s+/.exec(t);
  if (bullet) return { type: 'ul', text: t.replace(/^[-*•]\s+/, '') };
  const number = /^\d{1,2}[.)]\s+/.exec(t);
  if (number) return { type: 'ol', text: t.replace(/^\d{1,2}[.)]\s+/, '') };
  // checklist: "- [ ]" or "- [x]"
  const check = /^[-*]\s*\[\s*x?\s*\]\s+/.exec(t);
  if (check) return { type: 'checklist', text: t.replace(/^[-*]\s*\[\s*x?\s*\]\s+/, '') };
  return null;
}

// Numbered-line parsing shared by both the heading heuristic and the ordered
// list detector. Returns { text, next } where next is the expected next ordinal
// (for 1. 2. 3. sequences) or null for single/standalone headings.
function parseNumberedLine(line) {
  const t = String(line || '').trim();
  const m = /^(\d{1,2})[.)]\s+(.*)$/.exec(t);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return { text: m[2].trim(), next: n + 1, raw: t, n };
}

// A numbered line is part of an ordered list when it (a) is strictly sequential
// from the running counter or (b) is one of a block of 2+ consecutive,
// short, sentence-like numbered items (steps).
function classifyNumberedLines(lines, i) {
  const first = parseNumberedLine(lines[i]);
  if (!first) return null;
  // Require a following consecutive numbered line to form a list.
  const second = parseNumberedLine(lines[i + 1]);
  if (!second) return null;
  return first;
}

function classifyNumberedLine(line, expect) {
  const p = parseNumberedLine(line);
  if (!p) return null;
  return { text: p.text, next: p.next };
}

function looksLikeExampleBlock(lines, i) {
  const t = String(lines[i] || '').trim().toLowerCase();
  if (!EXAMPLE_PREFIXES.some((p) => t.startsWith(p))) return false;
  // Look ahead for "weak:/stronger:" structure within a few lines
  let j = i + 1;
  let found = false;
  while (j < lines.length && j < i + 14) {
    const lt = String(lines[j] || '').trim().toLowerCase();
    if (/^(weak|stronger|better|instead)\s*[::\-]/.test(lt)) { found = true; break; }
    if (isBlank(lines[j])) { j++; continue; }
    if (lt.startsWith('example')) break;
    j++;
  }
  return found;
}

function extractExample(lines, i) {
  // Collect lines until blank line or ~14 lines.
  const block = [];
  let j = i + 1;
  while (j < lines.length && block.length < 14 && !isBlank(lines[j])) {
    block.push(String(lines[j]));
    j++;
  }
  // group into "weak" and "strong" pairs by label
  let weak = [];
  let strong = [];
  let current = null;
  for (const raw of block) {
    const t = raw.trim().toLowerCase();
    if (/^weak\s*[::\-]/.test(t)) { current = 'weak'; weak.push(raw.replace(/^weak\s*[::\-]/i, '').trim()); continue; }
    if (/^(stronger|better|instead)\s*[::\-]/.test(t)) { current = 'strong'; strong.push(raw.replace(/^(stronger|better|instead)\s*[::\-]/i, '').trim()); continue; }
    if (current === 'weak') weak.push(raw.trim());
    else if (current === 'strong') strong.push(raw.trim());
  }
  return { weak, strong, advanceTo: j };
}

function looksLikeCta(lines, i) {
  const t = String(lines[i] || '').trim().toLowerCase();
  if (CTA_TITLES.some((p) => t.startsWith(p))) return true;
  return false;
}

function looksLikeKeyTakeaway(lines, i) {
  const t = String(lines[i] || '').trim().toLowerCase();
  return KEY_TAKEAWAY_TITLES.some((p) => t === p || t.startsWith(p + ':') || t.startsWith(p + ' '));
}

function looksLikeFaqHeading(line) {
  const t = String(line || '').trim();
  // "Frequently Asked Questions" / "FAQ:" banner then a question, OR a direct
  // question line starting with a question word.
  if (/^(faq\s*[:]?|frequently asked questions(\s*[:]?)?)\b/i.test(t)) return true;
  return /^(why|how|what|when|where|can|is|are|do|does|should|which|who)[\s\u2019]/.test(t) && /[\?]\s*$/.test(t);
}

function isTableDelimiter(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(String(line || ''));
}

function isTableRow(line) {
  return /\|/.test(String(line || '')) && /^\s*\|/.test(String(line || '')) || /\|\s*$/.test(String(line || '')) && /\|/.test(String(line || ''));
}

function renderTable(headers, rows) {
  let out = '<table><thead><tr>';
  for (const h of headers) out += '<th>' + renderInline(h) + '</th>';
  out += '</tr></thead><tbody>';
  for (const row of rows) {
    out += '<tr>';
    for (const cell of row) out += '<td>' + renderInline(cell) + '</td>';
    out += '</tr>';
  }
  out += '</tbody></table>';
  return out;
}

function splitRow(line) {
  return String(line || '')
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function looksLikeTableStart(lines, i) {
  if (i + 1 >= lines.length) return false;
  const header = String(lines[i] || '').trim();
  const delim = String(lines[i + 1] || '').trim();
  return /\|/.test(header) && isTableDelimiter(delim);
}

function readTable(lines, i) {
  const headers = splitRow(lines[i]);
  const rows = [];
  let j = i + 2;
  while (j < lines.length) {
    const t = String(lines[j]).trim();
    if (isBlank(t)) break;
    if (!/\|/.test(t)) break;
    if (isTableDelimiter(t)) { j++; continue; }
    rows.push(splitRow(t));
    j++;
  }
  return { headers, rows, advanceTo: j };
}

// ---------------------------------------------------------------------------
// Main formatter
// ---------------------------------------------------------------------------

function smartFormat(input) {
  if (looksLikeHtml(input)) {
    // Already HTML from the editor: sanitize in place (this decodes entities
    // in text nodes while preserving structure).
    return sanitize.sanitizeHtml(input);
  }
  return formatText(input);
}

function formatText(input) {
  const lines = normalizeLines(input);
  const out = [];
  const max = lines.length;
  let i = 0;
  let prevHeading = false;

  while (i < max) {
    const raw = lines[i];
    if (isBlank(raw)) { i++; prevHeading = false; continue; }

    const line = raw.trim();

    // horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) { out.push('<hr>'); i++; continue; }

    // example block
    if (looksLikeExampleBlock(lines, i)) {
      const { weak, strong, advanceTo } = extractExample(lines, i);
      if (strong.length) {
        let html = '<div class="example-block"><span class="example-label">Example</span>';
        if (weak.length) html += '<div class="example-pair"><span class="example-weak">' + joinParas(weak) + '</span></div>';
        html += '<div class="example-pair example-strong"><span class="example-strong">' + joinParas(strong, true) + '</span></div>';
        html += '</div>';
        out.push(html);
      }
      i = advanceTo;
      prevHeading = false;
      continue;
    }

    // Ordered step list: two or more consecutive numbered lines form an <ol>,
    // not H3 headings. This must run before isHeading so "1. .. 2. .." sequences
    // become real ordered lists instead of numbered subheadings.
    const firstNumbered = classifyNumberedLines(lines, i);
    if (firstNumbered) {
      const items = [];
      let j = i;
      let expect = 1;
      while (j < max) {
        const li = classifyNumberedLine(String(lines[j]).trim(), expect);
        if (!li) break;
        items.push(li.text);
        expect = li.next;
        j++;
      }
      out.push('<ol>' + items.map((it) => '<li>' + renderInline(it) + '</li>').join('') + '</ol>');
      i = j;
      prevHeading = false;
      continue;
    }

    // heading
    const heading = isHeading(line, prevHeading, i, max, lines);
    if (heading) {
      out.push('<h' + heading.level + '>' + sanitize.safeText(heading.text) + '</h' + heading.level + '>');
      i++;
      prevHeading = true;
      continue;
    }
    prevHeading = false;

    // CTA block
    if (looksLikeCta(lines, i)) {
      const cta = collectUntilBlank(lines, i);
      out.push(renderCta(cta));
      i += cta.length;
      continue;
    }

    // key takeaway
    if (looksLikeKeyTakeaway(lines, i)) {
      const tk = collectUntilBlank(lines, i);
      out.push(renderKeyTakeaway(tk));
      i += tk.length;
      continue;
    }

    // standalone quote
    if (isBlockQuote(line)) {
      const qText = sanitize.decodeEntities(String(line).replace(/^[\u201c"]+|[\u201d"]+$/g, ''));
      out.push('<blockquote><p>' + sanitize.safeText(qText) + '</p></blockquote>');
      i++;
      continue;
    }

    // Markdown table: header row then delimiter row then body rows
    if (looksLikeTableStart(lines, i)) {
      const { headers, rows, advanceTo } = readTable(lines, i);
      out.push(renderTable(headers, rows));
      i = advanceTo;
      prevHeading = false;
      continue;
    }

    // list detection (consume consecutive list lines)
    const first = classifyListLine(line);
    if (first) {
      const items = [];
      let type = first.type;
      let j = i;
      while (j < max) {
        const li = classifyListLine(String(lines[j]).trim());
        if (!li) break;
        if (type === 'ul' && li.type === 'checklist') type = 'checklist';
        if (type === 'checklist' && li.type === 'ul') type = 'ul';
        if (li.type === 'ol' && type !== 'ol') { /* mixed list: treat as ul */ if (type !== 'checklist') type = 'ul'; }
        if (li.type !== type && type !== 'checklist' && !(type === 'ul' && li.type === 'checklist')) break;
        items.push(li);
        j++;
      }
      out.push(renderList(items, type));
      i = j;
      continue;
    }

    // FAQ heading (question line followed by an answer paragraph)
    if (looksLikeFaqHeading(line) && i + 1 < max && !isBlank(lines[i + 1]) && !isHeading(lines[i + 1], false, i, max, lines)) {
      const answerLines = collectUntilBlank(lines, i + 1);
      out.push('<h3>' + sanitize.safeText(line) + '</h3><p>' + sanitize.safeText(String(lines[i + 1]).trim()) + '</p>');
      i += 1 + 1; // consume heading + first answer line
      // consume the rest of the answer paragraphs leading up to blank
      let k = i;
      while (k < max && !isBlank(lines[k])) { out.push('<p>' + sanitize.safeText(String(lines[k]).trim()) + '</p>'); k++; }
      i = k;
      continue;
    }

    // default: paragraph (collect consecutive non-blank non-special lines)
    const paraLines = [];
    let k = i;
    while (k < max) {
      const l = String(lines[k]).trim();
      if (isBlank(l)) break;
      if (classifyListLine(l)) break;
      if (isHeading(l, false, k, max, lines)) break;
      if (isBlockQuote(l)) break;
      if (looksLikeKeyTakeaway(lines, k)) break;
      if (looksLikeCta(lines, k)) break;
      if (looksLikeExampleBlock(lines, k)) break;
      paraLines.push(l);
      k++;
    }
    if (paraLines.length) {
      out.push('<p>' + renderInline(paraLines.join(' ')) + '</p>');
      i = k;
      continue;
    }
    i++;
  }
  return out.join('\n');
}

function collectUntilBlank(lines, start) {
  const collected = [];
  let j = start;
  while (j < lines.length && !isBlank(lines[j])) {
    collected.push(String(lines[j]).trim());
    j++;
  }
  return collected;
}

function joinParas(lines, strong) {
  const text = lines.map((l) => sanitize.safeText(l)).join(' ');
  return text;
}

function renderList(items, type) {
  if (type === 'checklist') {
    return '<ul class="checklist">' + items.map((it) => '<li>' + renderInline(it.text) + '</li>').join('') + '</ul>';
  }
  const tag = type === 'ol' ? 'ol' : 'ul';
  return '<' + tag + '>' + items.map((it) => '<li>' + renderInline(it.text) + '</li>').join('') + '</' + tag + '>';
}

function renderKeyTakeaway(lines) {
  const title = String(lines[0] || '').trim();
  const body = lines.slice(1);
  const inner = body.length ? '<p>' + renderInline(body.join(' ')) + '</p>' : '';
  return '<div class="key-takeaway"><div class="key-takeaway-title">' + sanitize.safeText(title) + '</div>' + inner + '</div>';
}

function renderCta(lines) {
  const title = String(lines[0] || '').trim();
  const body = lines.slice(1).join(' ');
  return '<div class="cta-block"><div class="cta-title">' + sanitize.safeText(title) + '</div>' +
    (body ? '<p class="cta-text">' + renderInline(body) + '</p>' : '') +
    '<a class="btn btn-primary btn-lg cta-link" href="/contact.html">Get Your Free Consultation <i class="fas fa-arrow-right"></i></a>' +
    '</div>';
}

module.exports = { smartFormat, formatText };
