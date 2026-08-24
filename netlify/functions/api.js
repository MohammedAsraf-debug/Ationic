'use strict';

const store = require('./lib/store');
const auth = require('./lib/auth');
const { sanitizeHtml } = require('./lib/sanitize');
const { slugify, isValidSlug, makeExcerpt, nowIso, categoryBySlug } = require('./lib/util');

const MAX_BODY_BYTES = 6 * 1024 * 1024;
const MAX_TITLE = 120;
const MAX_EXCERPT = 400;

function json(statusCode, obj, extraHeaders) {
  return {
    statusCode,
    headers: Object.assign(
      {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      },
      extraHeaders || {}
    ),
    body: JSON.stringify(obj)
  };
}

function getSecret() {
  return process.env.BLOG_SESSION_SECRET || null;
}

function getPasswordHash() {
  return process.env.BLOG_ADMIN_PASSWORD_HASH || null;
}

function getUsername() {
  return process.env.BLOG_ADMIN_USER || 'admin';
}

const loginAttempts = new Map();

function clientIp(event) {
  const h = event.headers || {};
  return (h['x-nf-client-connection-ip'] || h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}

function isLockedOut(ip) {
  const rec = loginAttempts.get(ip);
  if (!rec) return false;
  if (rec.lockUntil && Date.now() < rec.lockUntil) return true;
  if (rec.lockUntil && Date.now() >= rec.lockUntil) {
    loginAttempts.delete(ip);
    return false;
  }
  rec.fails = Math.max(0, rec.fails - Math.floor((Date.now() - rec.lastFail) / 60000));
  rec.lastFail = Date.now();
  return false;
}

function recordFailure(ip) {
  const rec = loginAttempts.get(ip) || { fails: 0, lockUntil: 0, lastFail: 0 };
  rec.fails += 1;
  rec.lastFail = Date.now();
  if (rec.fails >= 5) {
    rec.lockUntil = Date.now() + 15 * 60 * 1000;
    rec.fails = 0;
  }
  loginAttempts.set(ip, rec);
}

function clearFailures(ip) {
  loginAttempts.delete(ip);
}

function parseCookies(event) {
  const header = (event.headers && (event.headers.cookie || event.headers.Cookie)) || '';
  const out = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

function sessionFromEvent(event) {
  const secret = getSecret();
  if (!secret) return null;
  const cookies = parseCookies(event);
  return auth.verifySession(cookies[auth.SESSION_COOKIE], secret);
}

function requireAuth(event) {
  const session = sessionFromEvent(event);
  if (!session) return { ok: false, response: json(401, { error: 'Not authenticated' }) };
  return { ok: true, session };
}

function requireCsrf(event) {
  const cookies = parseCookies(event);
  const cookieToken = cookies[auth.CSRF_COOKIE];
  const headerToken = (event.headers && (event.headers['x-csrf-token'] || event.headers['X-CSRF-Token'])) || '';
  if (!cookieToken || !headerToken || !auth.safeEqualStr(cookieToken, headerToken)) {
    return { ok: false, response: json(403, { error: 'CSRF validation failed' }) };
  }
  return { ok: true };
}

function validatePostPayload(body, existing) {
  const errors = [];
  const title = String(body.title == null ? '' : body.title).trim();
  if (!title) errors.push('Title is required.');
  if (title.length > MAX_TITLE) errors.push('Title must be at most ' + MAX_TITLE + ' characters.');

  let slug;
  if (body.slug != null && String(body.slug).trim() !== '') {
    slug = slugify(String(body.slug));
  } else {
    slug = slugify(title);
  }
  if (!isValidSlug(slug)) errors.push('Slug contains invalid characters.');

  const bodyHtmlRaw = String(body.bodyHtml == null ? '' : body.bodyHtml);
  if (!bodyHtmlRaw.trim()) errors.push('Body content is required.');

  const status = body.status === 'published' ? 'published' : 'draft';
  const categorySlug = body.category ? slugify(String(body.category)) : '';
  if (categorySlug && !categoryBySlug(categorySlug)) errors.push('Unknown category: ' + categorySlug);

  let tags = [];
  if (Array.isArray(body.tags)) tags = body.tags;
  else if (typeof body.tags === 'string') tags = body.tags.split(',');
  tags = [...new Set(tags.map((t) => String(t).trim().slice(0, 40)).filter(Boolean))].slice(0, 10);

  const seo = {};
  if (body.seo && typeof body.seo === 'object') {
    if (body.seo.title != null) seo.title = String(body.seo.title).slice(0, 200);
    if (body.seo.description != null) seo.description = String(body.seo.description).slice(0, 320);
    seo.noindex = !!body.seo.noindex;
  }

  const coverAlt = body.coverAlt != null ? String(body.coverAlt).slice(0, 300) : existing ? existing.coverAlt || '' : '';

  return {
    errors,
    value: {
      title,
      slug,
      bodyHtmlRaw,
      excerptRaw: body.excerpt != null ? String(body.excerpt).slice(0, MAX_EXCERPT) : '',
      status,
      category: categorySlug,
      categoryLabel: categorySlug ? (categoryBySlug(categorySlug) || {}).label || '' : '',
      tags,
      coverImage: body.coverImage != null && String(body.coverImage).startsWith('/uploads/') ? String(body.coverImage) : existing ? existing.coverImage || null : null,
      coverAlt,
      author: body.author != null ? String(body.author).trim().slice(0, 80) || 'Ationic Team' : 'Ationic Team',
      seo
    }
  };
}

async function handleLogin(event) {
  const ip = clientIp(event);
  if (isLockedOut(ip)) return json(429, { error: 'Too many failed attempts. Try again in 15 minutes.' });
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'Invalid JSON body.' });
  }
  const hash = getPasswordHash();
  const secret = getSecret();
  if (!hash || !secret) return json(503, { error: 'Blog admin is not configured. Set BLOG_ADMIN_PASSWORD_HASH and BLOG_SESSION_SECRET environment variables.' });
  const username = String(body.username || '');
  const password = String(body.password || '');
  const userOk = username === getUsername();
  const passOk = auth.verifyPassword(password, hash);
  if (!userOk || !passOk) {
    recordFailure(ip);
    return json(401, { error: 'Invalid username or password.' });
  }
  clearFailures(ip);
  const token = auth.signSession(secret, 'admin');
  const csrf = auth.randomToken(24);
  return json(200, { ok: true, csrfToken: csrf }, { 'Set-Cookie': [auth.sessionCookie(token), auth.csrfCookie(csrf)] });
}

async function route(event) {
  const method = (event.httpMethod || 'GET').toUpperCase();
  const rawPath = event.path || '/';
  const path = rawPath.replace(/^\/(?:\.netlify\/functions\/)?api/, '') || '/';
  const segments = path.split('/').filter(Boolean);

  if (segments[0] !== 'admin') return json(404, { error: 'Unknown API endpoint.' });
  const rest = segments.slice(1);

  if (rest.length === 1 && rest[0] === 'login' && method === 'POST') return handleLogin(event);

  if (rest.length === 1 && rest[0] === 'me' && method === 'GET') {
    const session = sessionFromEvent(event);
    if (!session) return json(401, { error: 'Not authenticated' });
    return json(200, { ok: true, username: getUsername(), csrfFromCookie: parseCookies(event)[auth.CSRF_COOKIE] || null });
  }

  if (rest.length === 1 && rest[0] === 'logout' && method === 'POST') {
    return json(200, { ok: true }, { 'Set-Cookie': auth.clearSessionCookie() });
  }

  const gate = requireAuth(event);
  if (!gate.ok) return gate.response;

  if (rest.length === 2 && rest[0] === 'preview-token' && method === 'GET') {
    const slug = rest[1];
    const secret = getSecret();
    const token = auth.signPreviewToken(secret, slug, 3600);
    return json(200, { ok: true, url: '/blog/' + encodeURIComponent(slug) + '/?preview=' + encodeURIComponent(token), expiresIn: 3600 });
  }

  if (rest.length >= 1 && rest[0] === 'posts') {
    if (rest.length === 1 && method === 'GET') {
      const params = event.queryStringParameters || {};
      const q = (params.q || '').toLowerCase();
      const statusFilter = params.status || '';
      const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
      const perPage = 20;
      let posts = await store.listPosts();
      posts.sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
      if (statusFilter === 'published' || statusFilter === 'draft') posts = posts.filter((p) => p.status === statusFilter);
      if (q) posts = posts.filter((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q));
      const total = posts.length;
      const items = posts.slice((page - 1) * perPage, page * perPage).map((p) => ({
        slug: p.slug,
        title: p.title,
        status: p.status,
        category: p.category,
        categoryLabel: p.categoryLabel,
        updatedAt: p.updatedAt,
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        hasCover: !!p.coverImage
      }));
      return json(200, { ok: true, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)), items });
    }

    if (rest.length === 1 && method === 'POST') {
      const csrf = requireCsrf(event);
      if (!csrf.ok) return csrf.response;
      if ((event.headers['content-length'] || 0) > MAX_BODY_BYTES) return json(413, { error: 'Body too large.' });
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        return json(400, { error: 'Invalid JSON body.' });
      }
      const check = validatePostPayload(body, null);
      if (check.errors.length) return json(422, { error: check.errors.join(' '), details: check.errors });

      const existingSameSlug = await store.getPost(check.value.slug);
      if (existingSameSlug) return json(409, { error: 'A post with this slug already exists.' });

      const now = nowIso();
      const v = check.value;
      const post = {
        slug: v.slug,
        title: v.title,
        excerpt: v.excerptRaw.trim() || makeExcerpt(v.bodyHtmlRaw, 180),
        bodyHtml: sanitizeHtml(v.bodyHtmlRaw),
        coverImage: v.coverImage,
        coverAlt: v.coverAlt,
        category: v.category,
        categoryLabel: v.categoryLabel,
        tags: v.tags,
        status: v.status,
        author: v.author,
        seo: v.seo,
        publishedAt: v.status === 'published' ? now : null,
        createdAt: now,
        updatedAt: now,
        slugHistory: []
      };
      await store.putPost(post);
      return json(201, { ok: true, post: publicPost(post) });
    }

    if (rest.length === 2 && method === 'GET') {
      const post = await store.getPost(decodeURIComponent(rest[1]));
      if (!post) return json(404, { error: 'Post not found.' });
      return json(200, { ok: true, post });
    }

    if (rest.length === 2 && method === 'PUT') {
      const csrf = requireCsrf(event);
      if (!csrf.ok) return csrf.response;
      if ((event.headers['content-length'] || 0) > MAX_BODY_BYTES) return json(413, { error: 'Body too large.' });
      const oldSlug = decodeURIComponent(rest[1]);
      const existing = await store.getPost(oldSlug);
      if (!existing) return json(404, { error: 'Post not found.' });
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        return json(400, { error: 'Invalid JSON body.' });
      }
      const check = validatePostPayload(body, existing);
      if (check.errors.length) return json(422, { error: check.errors.join(' '), details: check.errors });

      if (check.value.slug !== oldSlug) {
        const clash = await store.getPost(check.value.slug);
        if (clash) return json(409, { error: 'A post with this slug already exists.' });
      }

      const v = check.value;
      const wasPublished = existing.status === 'published';
      const now = nowIso();
      const updated = {
        slug: v.slug,
        title: v.title,
        excerpt: v.excerptRaw.trim() || makeExcerpt(v.bodyHtmlRaw, 180),
        bodyHtml: sanitizeHtml(v.bodyHtmlRaw),
        coverImage: v.coverImage,
        coverAlt: v.coverAlt,
        category: v.category,
        categoryLabel: v.categoryLabel,
        tags: v.tags,
        status: v.status,
        author: v.author,
        seo: Object.keys(v.seo).length ? v.seo : existing.seo || {},
        publishedAt: v.status === 'published' ? existing.publishedAt || now : null,
        createdAt: existing.createdAt,
        updatedAt: now,
        slugHistory: Array.from(new Set([].concat(existing.slugHistory || [], oldSlug !== v.slug ? [oldSlug] : [])))
      };
      await store.putPostKeepKey(oldSlug, updated);
      const redirectChanged = wasPublished && updated.slug !== oldSlug;
      return json(200, { ok: true, post: publicPost(updated), redirectCreated: redirectChanged, from: redirectChanged ? '/blog/' + oldSlug + '/' : null });
    }

    if (rest.length === 2 && method === 'DELETE') {
      const csrf = requireCsrf(event);
      if (!csrf.ok) return csrf.response;
      const slug = decodeURIComponent(rest[1]);
      const existing = await store.getPost(slug);
      if (!existing) return json(404, { error: 'Post not found.' });
      await store.deletePost(slug);
      return json(200, { ok: true, deleted: slug });
    }
  }

  if (rest.length === 1 && rest[0] === 'upload' && method === 'POST') {
    const csrf = requireCsrf(event);
    if (!csrf.ok) return csrf.response;
    const headers = event.headers || {};
    const fileNameHeader = headers['x-file-name'] || headers['X-File-Name'] || '';
    if (!fileNameHeader) return json(400, { error: 'Missing X-File-Name header.' });
    if (!event.isBase64Encoded) return json(400, { error: 'Upload must be base64-encoded binary.' });
    const buffer = Buffer.from(event.body || '', 'base64');
    try {
      const result = await store.putMedia(fileNameHeader, buffer);
      return json(201, { ok: true, file: result });
    } catch (e) {
      const map = {
        TOO_LARGE: 'File exceeds the 5 MB limit.',
        UNSUPPORTED_TYPE: 'Only PNG, JPEG, GIF, or WebP images are allowed.',
        EMPTY_FILE: 'Uploaded file is empty.',
        INVALID_BUFFER: 'Invalid upload payload.'
      };
      return json(400, { error: map[e.message] || 'Upload failed.' });
    }
  }

  return json(404, { error: 'Unknown API endpoint.' });
}

function publicPost(p) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    coverAlt: p.coverAlt,
    category: p.category,
    categoryLabel: p.categoryLabel,
    tags: p.tags,
    status: p.status,
    author: p.author,
    seo: p.seo || {},
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    slugHistory: p.slugHistory
  };
}

exports.handler = async (event) => {
  try {
    return await route(event);
  } catch (err) {
    console.error('[api] unhandled error:', err && err.message);
    return json(500, { error: 'Internal server error.' });
  }
};
