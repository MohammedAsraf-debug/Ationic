'use strict';

const ASCII_MAP = {
  à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a', è: 'e', é: 'e', ê: 'e', ë: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i', ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o',
  ù: 'u', ú: 'u', û: 'u', ü: 'u', ñ: 'n', ç: 'c', š: 's', ž: 'z', œ: 'oe', æ: 'ae'
};

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(input) {
  const folded = String(input || '')
    .toLowerCase()
    .replace(/[\u00c0-\u017f]/g, (ch) => ASCII_MAP[ch] || ch)
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return folded || 'post';
}

function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug || '')) && String(slug).length <= 96;
}

function normalizePath(p) {
  let out = String(p || '/');
  if (!out.startsWith('/')) out = '/' + out;
  while (out.length > 1 && out.endsWith('/')) out = out.slice(0, -1);
  return out;
}

function stripTags(html) {
  return String(html || '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeExcerpt(html, max) {
  const text = stripTags(html);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '\u2026';
}

function readingMinutes(html) {
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
}

function isoDate(d) {
  return (d instanceof Date ? d : new Date(d)).toISOString();
}

function nowIso() {
  return new Date().toISOString();
}

const CATEGORIES = [
  { slug: 'digital-marketing', label: 'Digital Marketing' },
  { slug: 'seo', label: 'SEO' },
  { slug: 'google-ads', label: 'Google Ads' },
  { slug: 'meta-ads', label: 'Meta Ads' },
  { slug: 'web-development', label: 'Web Development' },
  { slug: 'lead-generation', label: 'Lead Generation' },
  { slug: 'case-studies', label: 'Case Studies' },
  { slug: 'guides', label: 'Guides' },
  { slug: 'agency-news', label: 'Agency News' }
];

function categoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

module.exports = {
  escapeHtml,
  slugify,
  isValidSlug,
  normalizePath,
  stripTags,
  makeExcerpt,
  readingMinutes,
  formatDate,
  isoDate,
  nowIso,
  CATEGORIES,
  categoryBySlug
};
