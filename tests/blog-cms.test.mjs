import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const DATA_DIR = mkdtempSync(join(tmpdir(), 'ationic-cms-'));

process.env.LOCAL_DATA_DIR = DATA_DIR;
process.env.BLOG_SESSION_SECRET = 'unit-test-secret-do-not-use';
process.env.BLOG_ADMIN_USER = 'admin';
process.env.SITE_URL = 'https://ationic.agency';

const auth = require('../netlify/functions/lib/auth.js');
process.env.BLOG_ADMIN_PASSWORD_HASH = auth.scryptHashPassword('correct-horse-battery');

const api = require('../netlify/functions/api.js');
const blogFn = require('../netlify/functions/blog.js');
const sitemapFn = require('../netlify/functions/sitemap.js');
const mediaFn = require('../netlify/functions/media.js');
const store = require('../netlify/functions/lib/store.js');

let passed = 0;
let failed = 0;
function ok(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log('  PASS ' + name); })
    .catch((e) => { failed++; console.log('  FAIL ' + name + '\n       ' + (e && e.message)); });
}

function jsonHeaders(extra) {
  return Object.assign({ 'content-type': 'application/json' }, extra || {});
}

function apiEvent(method, pathSuffix, opts) {
  opts = opts || {};
  return {
    httpMethod: method,
    path: '/.netlify/functions/api' + pathSuffix,
    headers: opts.headers || {},
    queryStringParameters: opts.query || null,
    body: opts.body !== undefined ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : null,
    isBase64Encoded: !!opts.isBase64Encoded
  };
}

function blogEvent(pathSuffix, query) {
  return {
    httpMethod: 'GET',
    path: '/.netlify/functions/blog' + pathSuffix,
    headers: {},
    queryStringParameters: query || null,
    body: null,
    isBase64Encoded: false
  };
}

function parseSetCookies(res) {
  const raw = res.headers['Set-Cookie'] || res.headers['set-cookie'] || [];
  const list = Array.isArray(raw) ? raw : [raw];
  const jar = {};
  for (const c of list) {
    const pair = c.split(';')[0];
    const eq = pair.indexOf('=');
    if (eq > 0) jar[pair.slice(0, eq)] = pair.slice(eq + 1);
  }
  return jar;
}

console.log('\n=== Blog CMS integration suite ===\n');
console.log('-- auth --');

await ok('unauthenticated /me returns 401', async () => {
  const res = await api.handler(apiEvent('GET', '/admin/me'));
  assert.equal(res.statusCode, 401);
});

await ok('wrong password rejected 401', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/login', {
    body: { username: 'admin', password: 'wrong-pass' },
    headers: {}
  }));
  assert.equal(res.statusCode, 401);
});

let jar = {};
let csrfToken = '';
await ok('correct credentials issue session + csrf', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/login', {
    body: { username: 'admin', password: 'correct-horse-battery' },
    headers: {}
  }));
  assert.equal(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.ok(data.ok && data.csrfToken);
  csrfToken = data.csrfToken;
  jar = parseSetCookies(res);
  assert.ok(jar.blog_session && jar.blog_csrf);
});

const authedHeaders = () => ({
  cookie: 'blog_session=' + jar.blog_session + '; blog_csrf=' + jar.blog_csrf,
  'x-csrf-token': csrfToken
});

await ok('authenticated /me returns username', async () => {
  const res = await api.handler(apiEvent('GET', '/admin/me', { headers: { cookie: 'blog_session=' + jar.blog_session } }));
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).username, 'admin');
});

await ok('unauthenticated post listing denied', async () => {
  const res = await api.handler(apiEvent('GET', '/admin/posts'));
  assert.equal(res.statusCode, 401);
});

await ok('write without CSRF token rejected 403', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/posts', {
    headers: { cookie: 'blog_session=' + jar.blog_session },
    body: { title: 'x', bodyHtml: '<p>y</p>' }
  }));
  assert.equal(res.statusCode, 403);
});

await ok('write with bad CSRF token rejected 403', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/posts', {
    headers: { cookie: 'blog_session=' + jar.blog_session, 'x-csrf-token': 'nope' },
    body: { title: 'x', bodyHtml: '<p>y</p>' }
  }));
  assert.equal(res.statusCode, 403);
});

console.log('\n-- drafts, sanitization, uniqueness --');

const XSS_BODY = '<p onclick="alert(1)">Hello</p><script>alert(1)</script>' +
  '<img src="https://example.com/pic.png" onerror="alert(1)">' +
  '<a href="javascript:alert(2)">bad</a><a href="https://good.example">ok</a>';

let draftSlug = 'xss-draft-post';
await ok('create draft with XSS payload succeeds', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/posts', {
    headers: authedHeaders(),
    body: {
      title: 'XSS Draft Post',
      slug: draftSlug,
      bodyHtml: XSS_BODY,
      status: 'draft',
      category: 'guides',
      tags: ['sec', 'test']
    }
  }));
  assert.equal(res.statusCode, 201);
  assert.equal(JSON.parse(res.body).post.status, 'draft');
});

await ok('stored body is sanitized (no script/handlers/js: URLs)', async () => {
  const res = await api.handler(apiEvent('GET', '/admin/posts/' + draftSlug, { headers: authedHeaders() }));
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body).post.bodyHtml;
  assert.ok(!body.includes('<script'), 'script tag survived');
  assert.ok(!body.includes('onclick'), 'onclick survived');
  assert.ok(!body.includes('onerror'), 'onerror survived');
  assert.ok(!body.toLowerCase().includes('javascript:'), 'javascript: URL survived');
  assert.ok(body.includes('<p>Hello</p>'));
  assert.ok(body.includes('rel="noopener noreferrer"'), 'external link hardening missing');
});

await ok('duplicate slug rejected 409', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/posts', {
    headers: authedHeaders(),
    body: { title: 'Dup', slug: draftSlug, bodyHtml: '<p>b</p>' }
  }));
  assert.equal(res.statusCode, 409);
});

await ok('invalid category rejected 422', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/posts', {
    headers: authedHeaders(),
    body: { title: 'Bad cat', slug: 'bad-cat', bodyHtml: '<p>b</p>', category: 'not-a-cat' }
  }));
  assert.equal(res.statusCode, 422);
});

await ok('tag list capped at 10', async () => {
  const res = await api.handler(apiEvent('PUT', '/admin/posts/' + draftSlug, {
    headers: authedHeaders(),
    body: {
      title: 'XSS Draft Post',
      slug: draftSlug,
      bodyHtml: XSS_BODY,
      status: 'draft',
      category: 'guides',
      tags: ['t1','t2','t3','t4','t5','t6','t7','t8','t9','t10','t11','t12']
    }
  }));
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).post.tags.length, 10);
});

console.log('\n-- draft exclusion & previews --');

await ok('draft hidden from public blog listing', async () => {
  const res = await blogFn.handler(blogEvent('/'));
  assert.equal(res.statusCode, 200);
  assert.ok(!res.body.includes(draftSlug));
});

await ok('draft direct URL returns 404 + X-Robots-Tag', async () => {
  const res = await blogFn.handler(blogEvent('/' + draftSlug + '/'));
  assert.equal(res.statusCode, 404);
  assert.match(res.headers['X-Robots-Tag'] || '', /noindex/i);
});

let previewUrl = '';
await ok('preview token issued for authenticated user', async () => {
  const res = await api.handler(apiEvent('GET', '/admin/preview-token/' + draftSlug, { headers: authedHeaders() }));
  assert.equal(res.statusCode, 200);
  previewUrl = JSON.parse(res.body).url;
  assert.ok(previewUrl.startsWith('/blog/' + draftSlug + '/?preview='));
});

await ok('draft renders with valid preview token (noindex)', async () => {
  const token = previewUrl.split('preview=')[1];
  const res = await blogFn.handler(blogEvent('/' + draftSlug + '/', { preview: token }));
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['X-Robots-Tag'], /noindex/);
  assert.match(res.headers['Cache-Control'], /no-store/);
  assert.ok(res.body.includes('XSS Draft Post'));
});

await ok('preview token bound to its own slug', async () => {
  const token = previewUrl.split('preview=')[1];
  const res = await blogFn.handler(blogEvent('/some-other-slug/', { preview: token }));
  assert.equal(res.statusCode, 404);
});

await ok('tampered preview token rejected', async () => {
  const token = previewUrl.split('preview=')[1];
  const res = await blogFn.handler(blogEvent('/' + draftSlug + '/', { preview: token.slice(0, -2) + 'zz' }));
  assert.equal(res.statusCode, 404);
});

await ok('preview-token endpoint requires auth', async () => {
  const res = await api.handler(apiEvent('GET', '/admin/preview-token/' + draftSlug));
  assert.equal(res.statusCode, 401);
});

console.log('\n-- publish, SEO metadata, public rendering --');

const PUBLISH_SLUG = 'cms-test-article';
await ok('publish with SEO overrides succeeds', async () => {
  const res = await api.handler(apiEvent('PUT', '/admin/posts/' + draftSlug, {
    headers: authedHeaders(),
    body: {
      title: 'CMS Test Article',
      slug: PUBLISH_SLUG,
      bodyHtml: XSS_BODY + '<p>Fresh content for the public page.</p>',
      excerpt: '',
      status: 'published',
      category: 'seo',
      tags: ['seo', 'testing'],
      author: 'QA Bot',
      coverImage: '/uploads/cms-cover-ab12cd34.png',
      coverAlt: 'Test cover',
      seo: { title: 'Custom SEO Title', description: 'Custom meta description for testing.', noindex: false }
    }
  }));
  assert.equal(res.statusCode, 200);
  const post = JSON.parse(res.body).post;
  assert.equal(post.status, 'published');
  assert.ok(post.publishedAt);
});

await ok('public post page renders canonical, OG, BlogPosting, SEO fields', async () => {
  const res = await blogFn.handler(blogEvent('/' + PUBLISH_SLUG + '/'));
  assert.equal(res.statusCode, 200);
  const b = res.body;
  assert.ok(b.includes('<title>Custom SEO Title | Ationic Blog</title>'), 'seo title override missing');
  assert.ok(b.includes('content="Custom meta description for testing."'), 'meta description missing');
  assert.ok(b.includes('rel="canonical" href="https://ationic.agency/blog/' + PUBLISH_SLUG + '/"'), 'canonical missing');
  assert.ok(b.includes('property="og:type" content="article"'), 'og:type missing');
  assert.ok(b.includes('"@type":"BlogPosting"'), 'BlogPosting JSON-LD missing');
  assert.ok(b.includes('name="robots" content="index, follow"'));
  assert.ok(b.includes('FRESH CONTENT FOR THE PUBLIC PAGE'.toLowerCase()) || b.toLowerCase().includes('fresh content for the public page'));
  assert.ok(b.includes('rel="noopener noreferrer"'));
});

await ok('published post appears in blog listing with safe title markup', async () => {
  const res = await blogFn.handler(blogEvent('/'));
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.includes(PUBLISH_SLUG));
});

console.log('\n-- categories, pagination --');

await ok('category archive lists matching posts', async () => {
  const res = await blogFn.handler(blogEvent('/category/seo/'));
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.includes(PUBLISH_SLUG));
});

await ok('unknown category returns 404', async () => {
  const res = await blogFn.handler(blogEvent('/category/not-a-cat/'));
  assert.equal(res.statusCode, 404);
});

await ok('pagination renders second page when >9 posts exist', async () => {
  const now = new Date().toISOString();
  for (let i = 1; i <= 9; i++) {
    const n = String(i).padStart(2, '0');
    await store.putPost({
      slug: 'filler-post-' + n,
      title: 'Filler Post ' + n,
      excerpt: 'Filler',
      bodyHtml: '<p>filler ' + n + '</p>',
      coverImage: null,
      coverAlt: '',
      category: 'guides',
      categoryLabel: 'Guides',
      tags: [],
      status: 'published',
      author: 'QA Bot',
      seo: {},
      publishedAt: '2026-01-' + n + 'T00:00:00.000Z',
      createdAt: now,
      updatedAt: now,
      slugHistory: []
    });
  }
  const p1redirect = await blogFn.handler(blogEvent('/page/1'));
  const p2 = await blogFn.handler(blogEvent('/page/2/'));
  assert.equal(p1redirect.statusCode, 301);
  assert.equal(p1redirect.headers.Location, '/blog/');
  assert.equal(p2.statusCode, 200);
  assert.ok(p2.body.includes('filler-post'), 'page 2 lacks filler posts');
});

console.log('\n-- slug rename & redirects --');

await ok('rename published slug reports redirect creation', async () => {
  const full = await api.handler(apiEvent('GET', '/admin/posts/' + PUBLISH_SLUG, { headers: authedHeaders() }));
  const post = JSON.parse(full.body).post;
  post.slug = PUBLISH_SLUG + '-v2';
  const res = await api.handler(apiEvent('PUT', '/admin/posts/' + PUBLISH_SLUG, {
    headers: authedHeaders(),
    body: post
  }));
  assert.equal(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.equal(data.redirectCreated, true);
});

await ok('old slug 301-redirects to new slug', async () => {
  const res = await blogFn.handler(blogEvent('/' + PUBLISH_SLUG + '/'));
  assert.equal(res.statusCode, 301);
  assert.equal(res.headers.Location, '/blog/' + PUBLISH_SLUG + '-v2/');
});

console.log('\n-- unpublish & delete --');

await ok('unpublish hides post publicly but keeps preview', async () => {
  const full = await api.handler(apiEvent('GET', '/admin/posts/' + PUBLISH_SLUG + '-v2', { headers: authedHeaders() }));
  const post = JSON.parse(full.body).post;
  post.status = 'draft';
  const res = await api.handler(apiEvent('PUT', '/admin/posts/' + PUBLISH_SLUG + '-v2', {
    headers: authedHeaders(),
    body: post
  }));
  assert.equal(res.statusCode, 200);
  const pub = await blogFn.handler(blogEvent('/' + PUBLISH_SLUG + '-v2/'));
  assert.equal(pub.statusCode, 404);
  const tokRes = await api.handler(apiEvent('GET', '/admin/preview-token/' + PUBLISH_SLUG + '-v2', { headers: authedHeaders() }));
  const token = JSON.parse(tokRes.body).url.split('preview=')[1];
  const prev = await blogFn.handler(blogEvent('/' + PUBLISH_SLUG + '-v2/', { preview: token }));
  assert.equal(prev.statusCode, 200);
});

await ok('delete removes post permanently', async () => {
  const res = await api.handler(apiEvent('DELETE', '/admin/posts/' + PUBLISH_SLUG + '-v2', { headers: authedHeaders() }));
  assert.equal(res.statusCode, 200);
  const pub = await blogFn.handler(blogEvent('/' + PUBLISH_SLUG + '-v2/'));
  assert.equal(pub.statusCode, 404);
  const gone = await api.handler(apiEvent('DELETE', '/admin/posts/' + PUBLISH_SLUG + '-v2', { headers: authedHeaders() }));
  assert.equal(gone.statusCode, 404);
});

await ok('delete without session denied 401', async () => {
  const res = await api.handler(apiEvent('DELETE', '/admin/posts/filler-post-01'));
  assert.equal(res.statusCode, 401);
});

console.log('\n-- media uploads --');

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

let uploadedName = '';
await ok('valid PNG upload returns /uploads/ URL', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/upload', {
    headers: Object.assign({}, authedHeaders(), {
      'content-type': 'application/octet-stream',
      'x-file-name': encodeURIComponent('Cover Photo.PNG'),
      'content-length': String(PNG_1PX.length)
    }),
    body: PNG_1PX.toString('base64'),
    isBase64Encoded: true
  }));
  assert.equal(res.statusCode, 201);
  const file = JSON.parse(res.body).file;
  uploadedName = file.name;
  assert.ok(file.url.startsWith('/uploads/') && file.url.endsWith('.png'));
  assert.equal(file.contentType, 'image/png');
});

await ok('uploaded media served back via media function', async () => {
  const res = await mediaFn.handler({
    httpMethod: 'GET',
    path: '/.netlify/functions/media/uploads/' + uploadedName,
    headers: {},
    isBase64Encoded: false
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Content-Type'], 'image/png');
  assert.ok(res.isBase64Encoded);
  assert.deepEqual(Buffer.from(res.body, 'base64'), PNG_1PX);
});

await ok('media request for unknown file 404s', async () => {
  const res = await mediaFn.handler({
    httpMethod: 'GET',
    path: '/.netlify/functions/media/uploads/missing-file.png',
    headers: {}, isBase64Encoded: false
  });
  assert.equal(res.statusCode, 404);
});

await ok('non-image upload rejected', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/upload', {
    headers: Object.assign({}, authedHeaders(), {
      'content-type': 'application/octet-stream',
      'x-file-name': 'notes.txt'
    }),
    body: Buffer.from('hello world').toString('base64'),
    isBase64Encoded: true
  }));
  assert.equal(res.statusCode, 400);
  assert.match(JSON.parse(res.body).error, /PNG|JPEG|GIF|WebP/i);
});

await ok('oversized upload rejected (>5 MB)', async () => {
  const big = Buffer.alloc(5 * 1024 * 1024 + 1, 0xff);
  const res = await api.handler(apiEvent('POST', '/admin/upload', {
    headers: Object.assign({}, authedHeaders(), {
      'content-type': 'application/octet-stream',
      'x-file-name': 'big.png'
    }),
    body: big.toString('base64'),
    isBase64Encoded: true
  }));
  assert.equal(res.statusCode, 400);
  assert.match(JSON.parse(res.body).error, /5 MB/);
});

await ok('upload without filename header rejected', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/upload', {
    headers: Object.assign({}, authedHeaders(), { 'content-type': 'application/octet-stream' }),
    body: PNG_1PX.toString('base64'),
    isBase64Encoded: true
  }));
  assert.equal(res.statusCode, 400);
});

await ok('upload requires authentication', async () => {
  const res = await api.handler(apiEvent('POST', '/admin/upload', {
    headers: { 'content-type': 'application/octet-stream', 'x-file-name': 'x.png' },
    body: PNG_1PX.toString('base64'),
    isBase64Encoded: true
  }));
  assert.equal(res.statusCode, 401);
});

console.log('\n-- sitemap --');

const NOINDEX_SLUG = 'noindexed-article';
await store.putPost({
  slug: NOINDEX_SLUG,
  title: 'Noindexed Article',
  excerpt: 'hidden',
  bodyHtml: '<p>hidden</p>',
  category: 'guides',
  categoryLabel: 'Guides',
  tags: [],
  status: 'published',
  seo: { noindex: true },
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slugHistory: []
});
await store.putPost({
  slug: 'still-a-draft',
  title: 'Still a Draft',
  excerpt: 'd',
  bodyHtml: '<p>d</p>',
  category: '',
  tags: [],
  status: 'draft',
  seo: {},
  publishedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  slugHistory: []
});

await ok('sitemap includes static/service/case-study/showcase pages', async () => {
  const res = await sitemapFn.handler({});
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Content-Type'], /xml/);
  const b = res.body;
  for (const expected of [
    '<loc>https://ationic.agency/services/seo.html</loc>',
    '<loc>https://ationic.agency/case-studies/bloom-cosmetics.html</loc>',
    '<loc>https://ationic.agency/case-studies/gamepodra-store.html</loc>',
    '<loc>https://ationic.agency/showcase-projects/luxury-restaurant/index.html</loc>',
    '<loc>https://ationic.agency/portfolio.html</loc>'
  ]) assert.ok(b.includes(expected), 'missing ' + expected);
});

await ok('sitemap merges published posts, excludes drafts & noindex', async () => {
  const res = await sitemapFn.handler({});
  const b = res.body;
  assert.ok(b.includes('/blog/filler-post-05/'), 'published filler missing');
  assert.ok(!b.includes('still-a-draft'), 'draft leaked into sitemap');
  assert.ok(!b.includes(NOINDEX_SLUG), 'noindex leaked into sitemap');
  assert.ok(!b.includes('/blog/xss-draft-post/'), 'draft xss post leaked');
});

await ok('sitemap degrades to valid static-only XML when storage is unavailable', async () => {
  const originalList = store.listPosts;
  store.listPosts = async () => { throw new Error('simulated storage outage'); };
  try {
    const res = await sitemapFn.handler({});
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['Content-Type'], /xml/);
    assert.ok(res.body.startsWith('<?xml'));
    assert.ok(res.body.includes('<urlset'), 'urlset missing');
    assert.ok(res.body.includes('/services/seo.html'), 'static URLs missing during degradation');
    assert.ok(!res.body.includes('/blog/filler-post'), 'stale post URLs leaked during degradation');
  } finally {
    store.listPosts = originalList;
  }
});

await ok('RSS feed serves published posts only', async () => {
  const res = await blogFn.handler(blogEvent('/rss.xml'));
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Content-Type'], /rss\+xml/);
  assert.ok(res.body.includes('/blog/filler-post-09/'));
  assert.ok(!res.body.includes(NOINDEX_SLUG));
  assert.ok(!res.body.includes('still-a-draft'));
  assert.ok(!res.body.includes('xss-draft-post'));
});

await ok('sanitizer escapes hostile titles at render time', async () => {
  await store.putPost({
    slug: 'evil-title-post',
    title: '<script>alert(9)</script>Evil',
    excerpt: 'e',
    bodyHtml: '<p>e</p>',
    category: '',
    tags: [],
    status: 'published',
    seo: {},
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slugHistory: []
  });
  const res = await blogFn.handler(blogEvent('/'));
  assert.ok(!res.body.includes('<script>alert(9)'), 'raw script leaked into listing');
  assert.ok(res.body.includes('&lt;script&gt;'), 'escaped title missing');
});

console.log('\n-- logout & rate limiting --');

await ok('logout clears session cookie', async () => {
  const tempJar = parseSetCookies((await api.handler(apiEvent('POST', '/admin/login', {
    body: { username: 'admin', password: 'correct-horse-battery' }, headers: {}
  }))));
  const res = await api.handler(apiEvent('POST', '/admin/logout', {
    headers: { cookie: 'blog_session=' + tempJar.blog_session, 'x-csrf-token': 'x' },
    body: '{}'
  }));
  assert.equal(res.statusCode, 200);
  assert.match(String(res.headers['Set-Cookie']), /Max-Age=0/);
  const me = await api.handler(apiEvent('GET', '/admin/me', { headers: { cookie: 'blog_session=' + tempJar.blog_session } }));
  assert.notEqual(me.statusCode, 500);
});

await ok('5 failed logins trigger IP lockout (even for correct password)', async () => {
  let lastWrong = null;
  for (let i = 0; i < 4; i++) {
    lastWrong = await api.handler(apiEvent('POST', '/admin/login', {
      body: { username: 'admin', password: 'guess-' + i }, headers: {}
    }));
    assert.equal(lastWrong.statusCode, 401);
  }
  const fifth = await api.handler(apiEvent('POST', '/admin/login', {
    body: { username: 'admin', password: 'guess-4' }, headers: {}
  }));
  assert.equal(fifth.statusCode, 401);
  const locked = await api.handler(apiEvent('POST', '/admin/login', {
    body: { username: 'admin', password: 'correct-horse-battery' }, headers: {}
  }));
  assert.equal(locked.statusCode, 429);
});

console.log('\n=================================');
console.log('Blog CMS suite: ' + passed + ' passed, ' + failed + ' failed');
console.log('=================================\n');
process.exit(failed ? 1 : 0);
