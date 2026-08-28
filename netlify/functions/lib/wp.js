'use strict';

// WordPress REST API client for the public blog frontend.
//
// Configuration (Netlify UI > Site settings > Environment variables):
//   WORDPRESS_API_URL   e.g. https://public-api.wordpress.com/wp/v2/sites/ationicagency.wordpress.com  (required)
//   WORDPRESS_TIMEOUT_MS  optional, default 20000
//
// Only the PUBLIC REST API is used. No credentials are stored or sent.
// Only published posts are returned by default (WordPress unauthenticated API filter).

const sanitize = require('./sanitize');
const { smartFormat } = require('./formatter');
const { isValidSlug, slugify } = require('./util');

const FRESH_MS = 60 * 1000;        // cache fresh window: new WP posts appear within ~60s
const STALE_MS = 15 * 60 * 1000;   // serve stale up to this age while revalidating
const MAX_LIST_POSTS = 300;

function apiUrl() {
  return String(process.env.WORDPRESS_API_URL || '').trim().replace(/\/+$/, '');
}

function isConfigured() {
  return apiUrl() !== '';
}

function timeoutMs() {
  const n = parseInt(process.env.WORDPRESS_TIMEOUT_MS || '20000', 10);
  return isFinite(n) && n > 0 ? n : 20000;
}

async function wpFetch(pathAndQuery) {
  const base = apiUrl();
  if (!base) throw new Error('WORDPRESS_API_URL is not configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());
  let res;
  try {
    res = await fetch(base + pathAndQuery, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
  } catch (err) {
    clearTimeout(timer);
    if (err && err.name === 'AbortError') {
      console.error('[wp] timeout: WordPress API request aborted after ' + timeoutMs() + 'ms (' + pathAndQuery.split('?')[0] + ')');
      throw new Error('WordPress API request timed out');
    }
    console.error('[wp] network error: cannot reach WordPress API (' + ((err && err.message) || err) + ')');
    throw new Error('WordPress API is unreachable');
  }
  clearTimeout(timer);
  if (!res.ok) {
    let detail = '';
    try { detail = String(await res.text()).slice(0, 140); } catch (e) { /* body unreadable */ }
    console.error('[wp] http error: WordPress API responded HTTP ' + res.status + ' for ' + pathAndQuery.split('?')[0] + (detail ? ' — ' + detail : ''));
    throw new Error('WordPress API responded ' + res.status);
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error('[wp] malformed json: WordPress API returned non-JSON payload (' + text.slice(0, 80) + ')');
    throw new Error('Malformed response from WordPress API');
  }
  return { data, headers: res.headers };
}

// ---- normalization into the shape used by lib/render.js and lib/pages.js ----

function decodeText(s) {
  return String(s == null ? '' : s);
}

function cleanText(s) {
  return decodeText(s)
    .replace(/\s+/g, ' ')
    .trim();
}

function wpDate(raw, gmtKey, localKey) {
  let v = raw[gmtKey] || raw[localKey] || '';
  v = String(v).trim();
  if (!v) return '';
  if (!/[zZ]|[+-]\d\d:?\d\d$/.test(v)) v += 'Z';
  const d = new Date(v);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

function normalizePost(raw) {
  if (!raw || typeof raw !== 'object' || !raw.id || !raw.slug) return null;
  const emb = raw._embedded || {};
  const mediaList = emb['wp:featuredmedia'] || [];
  const media = Array.isArray(mediaList) ? mediaList[0] : null;
  const termGroups = emb['wp:term'];
  const catGroup = Array.isArray(termGroups) && termGroups[0] ? termGroups[0] : [];
  const tagGroup = Array.isArray(termGroups) && termGroups[1] ? termGroups[1] : [];
  const authorList = emb.author || [];
  const author = Array.isArray(authorList) ? authorList[0] : null;

  const title = cleanText(sanitize.decodeEntities(raw.title && raw.title.rendered)) || '(Untitled)';
  const excerptHtml = raw.excerpt && raw.excerpt.rendered ? String(raw.excerpt.rendered) : '';
  const bodyHtmlRaw = raw.content && raw.content.rendered ? String(raw.content.rendered) : '';
  // Content flows through the smart formatter: it decodes HTML entities
  // (fixing literal &#8217; etc.), detects Markdown vs. already-valid HTML
  // (never double-processing), and converts plain/AI text into semantic HTML.
  // The formatter returns only sanitized output.
  const bodyHtml = smartFormat(bodyHtmlRaw);

  const { stripTags, makeExcerpt } = require('./util');
  const bodyText = stripTags(bodyHtml);
  const excerpt = excerptHtml
    ? makeExcerpt(cleanText(sanitize.decodeEntities(excerptHtml)), 240)
    : makeExcerpt(bodyText, 240);

  let coverImage = media && media.source_url ? String(media.source_url) : '';
  if (!/^https?:\/\//i.test(coverImage)) coverImage = '';

  const primaryCat = catGroup.length ? catGroup[0] : null;
  const publishedAt = wpDate(raw, 'date_gmt', 'date');
  const updatedAt = wpDate(raw, 'modified_gmt', 'modified') || publishedAt;

  return {
    id: raw.id,
    slug: isValidSlug(String(raw.slug)) ? String(raw.slug) : slugify(raw.slug),
    title,
    link: raw.link ? String(raw.link) : '',
    excerpt,
    excerptSource: excerptHtml ? 'excerpt' : (bodyText ? 'content' : 'none'),
    bodyHtml,
    bodyText,
    coverImage,
    coverAlt: cleanText(media && media.alt_text ? sanitize.decodeEntities(media.alt_text) : title),
    category: primaryCat ? String(primaryCat.slug) : '',
    categoryLabel: primaryCat ? cleanText(sanitize.decodeEntities(primaryCat.name)) : '',
    categoryId: primaryCat ? primaryCat.id : null,
    tags: tagGroup.map((t) => cleanText(sanitize.decodeEntities(t.name))).filter(Boolean),
    author: (author && author.name ? cleanText(sanitize.decodeEntities(author.name)) : '') || 'Ationic Team',
    publishedAt,
    updatedAt
  };
}

// ------------------------------- tiny cache ---------------------------------

const cache = new Map();

async function cached(key, loader) {
  const now = Date.now();
  const entry = cache.get(key);
  if (entry) {
    const age = now - entry.fetchedAt;
    if (age < FRESH_MS) return entry.data;
    if (age < STALE_MS) {
      if (!entry.refreshing) {
        entry.refreshing = loader()
          .then((data) => { cache.set(key, { data, fetchedAt: Date.now(), refreshing: null }); })
          .catch((err) => { console.error('[wp] revalidation failed, keeping stale copy: ' + ((err && err.message) || err)); })
          .finally(() => {
            const cur = cache.get(key);
            if (cur) cur.refreshing = null;
          });
      }
      return entry.data;
    }
    try {
      const data = await loader();
      cache.set(key, { data, fetchedAt: Date.now() });
      return data;
    } catch (err) {
      console.error('[wp] refresh failed: ' + ((err && err.message) || err));
      if (entry.data) return entry.data;
      throw err;
    }
  }
  const data = await loader();
  cache.set(key, { data, fetchedAt: Date.now() });
  return data;
}

function clearCache() {
  cache.clear();
}

// ------------------------------ public API ----------------------------------

async function listPosts(opts) {
  opts = opts || {};
  const page = Math.max(1, parseInt(opts.page || '1', 10) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(opts.perPage || '9', 10) || 9));
  const key = 'posts:' + page + ':' + perPage + ':' + (opts.categoryId || '');
  return cached(key, async () => {
    let q = '/posts?_embed=1&orderby=date&order=desc&per_page=' + perPage;
    if (page > 1) q += '&page=' + page;
    if (opts.categoryId) q += '&categories=' + encodeURIComponent(opts.categoryId);
    const res = await wpFetch(q);
    const arr = res.data;
    if (!Array.isArray(arr)) {
      console.error('[wp] invalid response: expected JSON array for /posts, got ' + typeof arr);
      throw new Error('Unexpected posts payload from WordPress API');
    }
    const posts = arr.map(normalizePost).filter(Boolean);
    const total = parseInt(res.headers.get('x-wp-total') || String(posts.length), 10) || posts.length;
    const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10) || 1;
    return { posts, total, totalPages };
  });
}

async function getPostBySlug(slug) {
  const cleanSlug = String(slug || '').toLowerCase().replace(/\/+$/, '');
  if (!isValidSlug(cleanSlug.replace(/_/g, '-'))) return null;
  return cached('post:' + cleanSlug, async () => {
    const res = await wpFetch('/posts?slug=' + encodeURIComponent(cleanSlug) + '&_embed=1&per_page=1');
    const arr = res.data;
    if (!Array.isArray(arr)) {
      console.error('[wp] invalid response: expected JSON array for /posts?slug=, got ' + typeof arr);
      throw new Error('Unexpected post payload from WordPress API');
    }
    return arr.length ? normalizePost(arr[0]) : null;
  });
}

async function getCategories(perPage) {
  const n = Math.min(100, Math.max(1, parseInt(perPage || '100', 10) || 100));
  return cached('categories:' + n, async () => {
    const res = await wpFetch('/categories?per_page=' + n + '&orderby=count&order=desc');
    const arr = res.data;
    if (!Array.isArray(arr)) {
      console.error('[wp] invalid response: expected JSON array for /categories, got ' + typeof arr);
      throw new Error('Unexpected categories payload from WordPress API');
    }
    return arr
      .filter((c) => c && c.slug && c.id)
      .map((c) => ({ id: c.id, slug: String(c.slug), label: cleanText(sanitize.decodeEntities(c.name)) }));
  });
}

async function listAllPosts(maxPosts) {
  const cap = Math.min(MAX_LIST_POSTS, Math.max(1, parseInt(maxPosts || String(MAX_LIST_POSTS), 10) || MAX_LIST_POSTS));
  return cached('all-posts:' + cap, async () => {
    const out = [];
    let page = 1;
    while (out.length < cap) {
      const res = await wpFetch('/posts?orderby=date&order=desc&per_page=100&page=' + page + '&_embed=0&_fields=id,slug,date,date_gmt,modified,modified_gmt,title,excerpt,categories,tags');
      const arr = res.data;
      if (!Array.isArray(arr)) {
        console.error('[wp] invalid response: expected JSON array for /posts (sitemap), got ' + typeof arr);
        throw new Error('Unexpected posts payload from WordPress API');
      }
      for (const raw of arr) {
        const p = normalizePost(raw);
        if (p) out.push(p);
      }
      const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10) || 1;
      if (page >= totalPages || arr.length === 0) break;
      page++;
    }
    return out.slice(0, cap);
  });
}

module.exports = {
  isConfigured,
  listPosts,
  listAllPosts,
  getPostBySlug,
  getCategories,
  normalizePost,
  clearCache
};
