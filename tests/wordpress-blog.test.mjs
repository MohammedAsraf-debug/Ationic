import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
process.env.LOCAL_DATA_DIR = process.env.LOCAL_DATA_DIR || '';
process.env.SITE_URL = 'https://ationic.agency';

// ----------------------------- mock WordPress --------------------------------

const NOW = '2026-08-20T10:00:00';
const OLDER = '2026-07-01T09:00:00';
const OLDEST = '2026-05-15T08:00:00';

function wpPost(over) {
  over = over || {};
  return Object.assign({
    id: 101,
    date: NOW,
    date_gmt: NOW,
    modified: NOW,
    modified_gmt: NOW,
    slug: '10-digital-marketing-strategies-to-grow-your-business-in-2026',
    status: 'publish',
    link: 'https://cms.example.com/10-digital-marketing-strategies-to-grow-your-business-in-2026/',
    title: { rendered: '10 Digital Marketing Strategies to Grow Your Business in 2026' },
    excerpt: { rendered: '<p>Practical strategies that move the needle &#8212; from SEO to paid social.</p>' },
    content: { rendered: '<p>Welcome to the <strong>full article</strong> body.</p><h2>Strategy One</h2><p>Details here.</p>' },
    featured_media: 55,
    categories: [12],
    tags: [31],
    _embedded: {
      author: [{ name: 'Jane Writer' }],
      'wp:featuredmedia': [{ source_url: 'https://cms.example.com/wp-content/uploads/cover.jpg', alt_text: 'Cover alt text' }],
      'wp:term': [
        [{ id: 12, name: 'Digital Marketing', slug: 'digital-marketing' }],
        [{ id: 31, name: 'Growth', slug: 'growth' }]
      ]
    }
  }, over);
}

const POSTS = [
  wpPost(),
  wpPost({
    id: 102,
    slug: 'older-post',
    date: OLDER,
    date_gmt: OLDER,
    modified: OLDER,
    modified_gmt: OLDER,
    title: { rendered: 'Older Post About &#8220;SEO&#8221;' },
    excerpt: { rendered: '' }, // forces content-derived description
    featured_media: 0,
    categories: [7],
    _embedded: {
      author: [{ name: 'John Author' }],
      'wp:featuredmedia': [],
      'wp:term': [[{ id: 7, name: 'SEO', slug: 'seo' }], []]
    }
  }),
  wpPost({
    id: 103,
    slug: 'oldest-post',
    date: OLDEST,
    date_gmt: OLDEST,
    modified: OLDEST,
    modified_gmt: OLDEST,
    title: { rendered: 'Oldest Post' },
    content: { rendered: '<p>Fine content.</p><script>alert("xss")</script><p onclick="evil()">Click</p>' }
  })
];

const CATEGORIES = [
  { id: 12, name: 'Digital Marketing', slug: 'digital-marketing' },
  { id: 7, name: 'SEO', slug: 'seo' }
];

let mode = 'ok'; // ok | empty | malformed | slow
let server = null;
let requestCount = 0;

function startMock(port) {
  return new Promise((resolve) => {
    server = createServer((req, res) => {
      requestCount++;
      const url = new URL(req.url, 'http://x');
      if (mode === 'slow') { setTimeout(() => { try { res.writeHead(200, {'Content-Type':'application/json'}); res.end('[]'); } catch(e){} }, 3000); return; }
      if (mode === 'malformed') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end('<not-json>');
        return;
      }
      const send = (obj, headers) => {
        const body = JSON.stringify(obj);
        res.writeHead(200, Object.assign({ 'Content-Type': 'application/json; charset=UTF-8' }, headers || {}));
        res.end(body);
      };
      if (url.pathname.endsWith('/categories')) return send(CATEGORIES.slice(0, Math.max(1, parseInt(url.searchParams.get('per_page') || '100', 10))));
      if (url.pathname.endsWith('/posts')) {
        const slug = url.searchParams.get('slug');
        if (slug) return send(POSTS.filter((p) => p.slug === slug));
        let list = mode === 'empty' ? [] : POSTS;
        const catId = url.searchParams.get('categories');
        if (catId) list = list.filter((p) => (p.categories || []).includes(parseInt(catId, 10)));
        const perPage = parseInt(url.searchParams.get('per_page') || '10', 10);
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const totalPages = Math.max(1, Math.ceil(list.length / perPage));
        const slice = list.slice((page - 1) * perPage, page * perPage);
        return send(slice, { 'X-WP-Total': String(list.length), 'X-WP-TotalPages': String(totalPages) });
      }
      res.writeHead(404); res.end('{}');
    });
    server.listen(port, '127.0.0.1', () => resolve());
  });
}

await startMock(0);
const port = server.address().port;
process.env.WORDPRESS_API_URL = 'http://127.0.0.1:' + port + '/wp-json/wp/v2';
process.env.WORDPRESS_TIMEOUT_MS = '800';

const blogFn = require('../netlify/functions/blog.js');
const sitemapFn = require('../netlify/functions/sitemap.js');
const wpLib = require('../netlify/functions/lib/wp.js');

// Point the client at a port with no listener to simulate a real outage.
function useDeadApi() {
  process.env.WORDPRESS_API_URL = 'http://127.0.0.1:9/wp-json/wp/v2';
  wpLib.clearCache();
}
function useMockApi() {
  process.env.WORDPRESS_API_URL = 'http://127.0.0.1:' + port + '/wp-json/wp/v2';
  wpLib.clearCache();
}

// ------------------------------- harness -------------------------------------

let passed = 0;
let failed = 0;
async function ok(name, fn) {
  try { await fn(); passed++; console.log('  PASS ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + String(e && e.message).split('\n').slice(0, 3).join('\n       ')); }
}

function event(suffix) {
  return { httpMethod: 'GET', path: '/.netlify/functions/blog' + suffix, headers: {}, queryStringParameters: null };
}

console.log('\n=== WordPress blog integration suite ===\n');

// ------------------------------ WP API success -------------------------------

await ok('listing fetches published posts from WordPress REST API (newest first)', async () => {
  const res = await blogFn.handler(event(''));
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Content-Type'], /text\/html/);
  const i1 = res.body.indexOf('/blog/10-digital-marketing-strategies-to-grow-your-business-in-2026/');
  const i2 = res.body.indexOf('/blog/older-post/');
  const i3 = res.body.indexOf('/blog/oldest-post/');
  assert.ok(i1 !== -1 && i2 !== -1 && i3 !== -1, 'all three post links present');
  assert.ok(i1 < i2 && i2 < i3, 'posts ordered newest first, got ' + [i1, i2, i3].join(','));
});

await ok('listing shows featured image, title, excerpt, date and category', async () => {
  const res = await blogFn.handler(event(''));
  assert.ok(res.body.includes('https://cms.example.com/wp-content/uploads/cover.jpg'), 'featured image missing');
  assert.ok(res.body.includes('10 Digital Marketing Strategies to Grow Your Business in 2026'), 'title missing');
  assert.ok(res.body.includes('Practical strategies that move the needle'), 'excerpt missing');
  assert.ok(res.body.includes('<time datetime="2026-08-20T10:00:00.000Z"'), 'publish date missing');
  assert.ok(res.body.includes('Digital Marketing'), 'category label missing');
});

await ok('individual post renders at /blog/<wordpress-slug>/ with full content', async () => {
  const res = await blogFn.handler(event('/10-digital-marketing-strategies-to-grow-your-business-in-2026'));
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.includes('<h1>10 Digital Marketing Strategies to Grow Your Business in 2026</h1>'), 'h1 missing');
  assert.ok(res.body.includes('full article'), 'content body missing');
  assert.ok(res.body.includes('Jane Writer'), 'author missing');
  assert.ok(res.body.includes('>Growth</span>'), 'tags missing');
  assert.ok(res.body.includes('https://cms.example.com/wp-content/uploads/cover.jpg'), 'featured image in article missing');
});

// ------------------------------ SEO metadata ---------------------------------

await ok('article SEO: title, meta description, canonical, OG tags, article dates', async () => {
  const res = await blogFn.handler(event('/10-digital-marketing-strategies-to-grow-your-business-in-2026'));
  const b = res.body;
  assert.ok(b.includes('<title>10 Digital Marketing Strategies to Grow Your Business in 2026 | Ationic Blog</title>'), 'title tag');
  assert.match(b, /<meta name="description" content="Practical strategies[^"]+"/, 'meta description from WP excerpt');
  assert.ok(b.includes('<link rel="canonical" href="https://ationic.agency/blog/10-digital-marketing-strategies-to-grow-your-business-in-2026/">'), 'canonical URL');
  assert.match(b, /<meta property="og:title" content="10 Digital Marketing/, 'og:title');
  assert.match(b, /<meta property="og:description"/, 'og:description');
  assert.ok(b.includes('<meta property="og:image" content="https://cms.example.com/wp-content/uploads/cover.jpg">'), 'og:image uses featured media');
  assert.ok(b.includes('<meta property="article:published_time" content="2026-08-20T10:00:00.000Z">'), 'article published time');
  assert.ok(b.includes('<meta property="article:modified_time"'), 'article modified time');
  assert.ok(b.includes('"@type":"BlogPosting"'), 'BlogPosting JSON-LD');
  assert.ok(b.includes('"datePublished":"2026-08-20T10:00:00.000Z"'), 'JSON-LD datePublished');
  assert.ok(b.includes('"author":{"@type":"Person","name":"Jane Writer"}'), 'JSON-LD author');
});

await ok('description falls back to content when WP excerpt is empty', async () => {
  const res = await blogFn.handler(event('/older-post'));
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /<meta name="description" content="[^"]{20,}"/, 'derived description too short/missing');
  assert.ok(!res.body.includes('undefined'), 'undefined leaked into output');
});

await ok('WP HTML is sanitized: script tags and inline handlers stripped', async () => {
  const res = await blogFn.handler(event('/oldest-post'));
  assert.equal(res.statusCode, 200);
  assert.ok(!res.body.includes('<script>alert', 'script tag survived'), 'script tag survived sanitization');
  assert.ok(!res.body.includes('onclick='), 'inline handler survived');
  assert.ok(res.body.includes('Fine content.'), 'legit content lost');
});

// ------------------------------ slug routing ---------------------------------

await ok('unknown slug => styled 404 page, noindex', async () => {
  const res = await blogFn.handler(event('/this-post-does-not-exist'));
  assert.equal(res.statusCode, 404);
  assert.ok(res.headers['X-Robots-Tag'].includes('noindex'));
  assert.ok(res.body.includes('Post Not'), '404 template not used');
  assert.ok(res.body.includes('href="/blog/"'), 'back-to-blog link present');
});

await ok('trailing slash on post URL resolves the same post', async () => {
  const res = await blogFn.handler(event('/older-post/'));
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.includes('<h1>Older Post About \u201cSEO\u201d</h1>'), 'decoded entity title mismatch');
});

await ok('invalid slug characters never reach WordPress (safe routing)', async () => {
  const before = requestCount;
  const a = await blogFn.handler(event('/%3Cscript%3E'));
  assert.equal(a.statusCode, 404);
  const b = await blogFn.handler(event('/..%2Fetc%2Fpasswd'));
  assert.equal(b.statusCode, 404);
  assert.equal(requestCount, before, 'WP should not have been queried for invalid slugs');
});

// --------------------------- pagination & category ---------------------------

await ok('pagination: /blog/page/2/ serves second slice; beyond range => 404', async () => {
  const p1 = await blogFn.handler(event('/page/1'));
  assert.equal(p1.statusCode, 301);
  const p2 = await blogFn.handler(event('/page/2'));
  assert.equal(p2.statusCode, 404, 'only one WP page of results in mock, so page 2 must 404');
  const p9 = await blogFn.handler(event('/page/99'));
  assert.equal(p9.statusCode, 404);
});

await ok('category page filters posts via WP categories endpoint', async () => {
  const res = await blogFn.handler(event('/category/digital-marketing'));
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.includes('/blog/10-digital-marketing-strategies-to-grow-your-business-in-2026/'), 'matching post listed');
  assert.ok(!res.body.includes('/blog/older-post/'), 'non-matching post leaked into category view');
  const unknown = await blogFn.handler(event('/category/nope-nope'));
  assert.equal(unknown.statusCode, 404);
});

// ------------------------- empty / malformed / down --------------------------

await ok('empty posts response => clean "no articles yet" state (200)', async () => {
  mode = 'empty';
  wpLib.clearCache();
  const res = await blogFn.handler(event(''));
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.includes('No articles published yet'), 'empty state message missing');
  assert.ok(res.body.includes('</html>'), 'page incomplete');
});

await ok('malformed API response => clean fallback, no stack trace, noindex', async () => {
  mode = 'malformed';
  wpLib.clearCache();
  const res = await blogFn.handler(event(''));
  assert.equal(res.statusCode, 503);
  assert.ok(res.headers['X-Robots-Tag'].includes('noindex'));
  assert.ok(res.headers['Retry-After']);
  assert.ok(res.body.includes('Temporarily'), 'friendly fallback message missing');
  assert.ok(!res.body.includes('Malformed'), 'internal error wording leaked');
  assert.doesNotMatch(res.body, /\bat\s+[\w$.]+ \(?|\bError:\s/, 'stack trace fragments leaked');
});

await ok('WordPress unreachable => clean fallback for listing AND article', async () => {
  useDeadApi();
  const listing = await blogFn.handler(event(''));
  assert.equal(listing.statusCode, 503);
  assert.ok(listing.body.includes('could not load our articles'), 'fallback message missing');
  assert.ok(listing.headers['X-Robots-Tag'].includes('noindex'));
  const post = await blogFn.handler(event('/older-post'));
  assert.equal(post.statusCode, 503);
  assert.ok(post.body.includes('could not load this article'));
  const rss = await blogFn.handler(event('/rss.xml'));
  assert.equal(rss.statusCode, 503);
});

await ok('slow WordPress response aborts at timeout and degrades gracefully', async () => {
  mode = 'slow';
  wpLib.clearCache();
  const t0 = Date.now();
  const res = await blogFn.handler(event(''));
  const elapsed = Date.now() - t0;
  assert.equal(res.statusCode, 503);
  assert.ok(elapsed < 5000, 'timeout took too long: ' + elapsed + 'ms');
});

// ---------------------------------- sitemap ----------------------------------

await ok('sitemap includes WordPress posts automatically', async () => {
  mode = 'ok';
  useMockApi();
  const res = await sitemapFn.handler({});
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Content-Type'], /xml/);
  assert.ok(res.body.includes('<loc>https://ationic.agency/blog/10-digital-marketing-strategies-to-grow-your-business-in-2026/</loc>'), 'WP post missing from sitemap');
  assert.ok(res.body.includes('<lastmod>2026-07-01</lastmod>'), 'modified date not reflected');
  assert.ok(res.body.includes('<loc>https://ationic.agency/services/seo.html</loc>'), 'static pages lost');
});

await ok('sitemap degrades to static-only URLs when WordPress is down', async () => {
  useDeadApi();
  const res = await sitemapFn.handler({});
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.startsWith('<?xml'));
  assert.ok(res.body.includes('/services/seo.html'));
  assert.ok(!res.body.includes('/blog/older-post'), 'stale post URLs served during outage');
});

// ----------------------------------- RSS -------------------------------------

await ok('RSS feed lists latest WP posts', async () => {
  mode = 'ok';
  useMockApi();
  const res = await blogFn.handler(event('/rss.xml'));
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Content-Type'], /rss\+xml/);
  assert.ok(res.body.includes('<title>10 Digital Marketing Strategies to Grow Your Business in 2026</title>'));
  assert.ok(res.body.includes('pubDate'));
});

// -------------------------- old CMS fully removed ----------------------------

await ok('old CMS artifacts are gone from the repository source', async () => {
  const { readFileSync, readdirSync, existsSync } = await import('node:fs');
  const root = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  assert.ok(!existsSync(root + '/admin'), 'admin/ directory still exists');
  assert.ok(!existsSync(root + '/netlify/functions/api.js'), 'api.js still exists');
  assert.ok(!existsSync(root + '/netlify/functions/media.js'), 'media.js still exists');
  assert.ok(!existsSync(root + '/netlify/functions/lib/store.js'), 'store.js still exists');
  assert.ok(!existsSync(root + '/netlify/functions/lib/auth.js'), 'auth.js still exists');
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(!pkg.dependencies || !pkg.dependencies['@netlify/blobs'], '@netlify/blobs still a dependency');
  const toml = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
  assert.ok(!toml.includes('/api/*'), 'old /api redirect still present');
  assert.ok(!toml.includes('/uploads/*'), 'old /uploads redirect still present');
  assert.ok(toml.includes('/blog'), 'blog redirects missing');
  for (const f of ['netlify/functions/blog.js', 'netlify/functions/sitemap.js']) {
    const src = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    assert.ok(!src.includes('BLOG_ADMIN') && !src.includes('BLOG_SESSION_SECRET') && !src.includes('@netlify/blobs'), f + ' still references old CMS');
  }
});

await ok('public frontend never embeds WordPress credentials', async () => {
  const { readFileSync } = await import('node:fs');
  const wpSrc = readFileSync(new URL('../netlify/functions/lib/wp.js', import.meta.url), 'utf8');
  assert.ok(!/(password|secret|token|authorization)\s*[:=]/i.test(wpSrc.replace(/\/\/[^\n]*/g, '')), 'credential-like identifier found in WP client');
  const renderSrc = readFileSync(new URL('../netlify/functions/lib/render.js', import.meta.url), 'utf8');
  assert.ok(!renderSrc.includes('WORDPRESS_API_URL'), 'API URL leaked into public-facing renderer');
});

server.close();
console.log('\n=================================');
console.log('WordPress blog suite: ' + passed + ' passed, ' + failed + ' failed');
console.log('=================================\n');
process.exit(failed ? 1 : 0);
