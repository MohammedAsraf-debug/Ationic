import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize, sep } from 'node:path';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const ROOT = process.cwd();

process.env.LOCAL_DATA_DIR = mkdtempSync(join(tmpdir(), 'ationic-ui-'));
process.env.BLOG_SESSION_SECRET = 'ui-test-secret-do-not-use';
process.env.BLOG_ADMIN_USER = 'admin';
process.env.SITE_URL = 'http://127.0.0.1';

const authLib = require('../netlify/functions/lib/auth.js');
process.env.BLOG_ADMIN_PASSWORD_HASH = authLib.scryptHashPassword('ui-test-password');

const apiFn = require('../netlify/functions/api.js');
const blogFn = require('../netlify/functions/blog.js');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json'
};

function safeJoin(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let p = decoded.endsWith('/') ? decoded + 'index.html' : decoded;
  const abs = normalize(join(ROOT, p));
  if (!abs.startsWith(ROOT + sep)) return null;
  return abs;
}

const server = createServer((req, res) => {
  const file = safeJoin(req.url);
  if (!file || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
console.log('static server on http://127.0.0.1:' + PORT);

const jars = new Map();
let capturedWrites = [];

function getJarCookieHeader(cookieHeaderValue) {
  if (!cookieHeaderValue) return '';
  const pairs = cookieHeaderValue.split(';');
  for (const pair of pairs) {
    const [k, v] = pair.trim().split('=');
    if (k === '__e2e_jar' && jars.has(v)) return jars.get(v);
  }
  return '';
}

async function lambdaFromApiRequest(request) {
  const url = new URL(request.url());
  const headers = {};
  const cookieHeader = request.headers()['cookie'] || '';
  const jarContents = getJarCookieHeader(cookieHeader);
  if (jarContents) headers.cookie = jarContents;
  for (const name of ['content-type', 'x-csrf-token', 'x-file-name', 'content-length']) {
    const v = await request.headerValue(name);
    if (v) headers[name] = v;
  }
  const method = request.method();
  let body = null;
  let isBase64Encoded = false;
  if (method !== 'GET' && method !== 'HEAD') {
    const buf = request.postDataBuffer();
    if (buf) {
      const ct = (headers['content-type'] || '').toLowerCase();
      if (ct.includes('octet-stream')) {
        body = buf.toString('utf8');
        isBase64Encoded = true;
      } else {
        body = buf.toString('utf8');
      }
    }
  }
  const q = {};
  url.searchParams.forEach((v, k) => { q[k] = v; });
  const event = {
    httpMethod: method,
    path: '/.netlify/functions/api' + url.pathname.replace(/^\/api/, ''),
    headers,
    queryStringParameters: Object.keys(q).length ? q : null,
    body,
    isBase64Encoded
  };
  const res = await apiFn.handler(event);
  if (res.statusCode >= 400) {
    console.log('    [bridge] ' + method + ' ' + event.path + ' -> ' + res.statusCode + ' ' + String(res.body).slice(0, 160));
  }
  const rawCookies = [].concat(res.headers['Set-Cookie'] || res.headers['set-cookie'] || []);
  let jarId = null;
  if (rawCookies.length) {
    const current = getJarCookieHeader(cookieHeader);
    const merged = new Map();
    for (const c of (current ? current.split('; ') : [])) {
      const eq = c.indexOf('=');
      if (eq > 0) merged.set(c.slice(0, eq), c.slice(eq + 1));
    }
    for (const c of rawCookies) {
      const pair = c.split(';')[0];
      const eq = pair.indexOf('=');
      const key = pair.slice(0, eq);
      const val = pair.slice(eq + 1);
      if (val === '') merged.delete(key);
      else merged.set(key, val);
    }
    jarId = randomUUID();
    jars.set(jarId, Array.from(merged.entries()).map(([k, v]) => k + '=' + v).join('; '));
  }
  capturedWrites.push({ method, path: event.path, headers, body: event.body });
  return { res, jarId };
}

let passed = 0;
let failed = 0;
async function ok(name, fn) {
  try { await fn(); passed++; console.log('  PASS ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + (e && e.message).split('\n').slice(0, 4).join('\n       ')); }
}

console.log('\n=== Admin UI (browser) suite ===\n');

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await context.newPage();
page.setDefaultTimeout(8000);

await context.route('**/api/**', async (route) => {
  const { res, jarId } = await lambdaFromApiRequest(route.request());
  const headers = { 'content-type': 'application/json; charset=utf-8' };
  if (jarId) headers['set-cookie'] = '__e2e_jar=' + jarId + '; Path=/';
  await route.fulfill({ status: res.statusCode, headers, body: res.body });
});

await context.route(/\/blog($|[/?])/, async (route) => {
  const url = new URL(route.request().url());
  const q = {};
  url.searchParams.forEach((v, k) => { q[k] = v; });
  const res = await blogFn.handler({
    httpMethod: 'GET',
    path: '/.netlify/functions/blog' + url.pathname.replace(/^\/blog/, ''),
    headers: {},
    queryStringParameters: Object.keys(q).length ? q : null,
    body: null,
    isBase64Encoded: false
  });
  await route.fulfill({
    status: res.statusCode,
    headers: { 'content-type': res.headers['Content-Type'] || 'text/html; charset=utf-8' },
    body: res.body
  });
});

await ok('loads /admin/ showing injected login screen', async () => {
  await page.goto('http://127.0.0.1:' + PORT + '/admin/');
  await page.waitForSelector('#loginForm', { state: 'visible' });
});

let htmlInterceptArmed = false;
await page.route('**/api/**', async (route) => {
  const req = route.request();
  if (htmlInterceptArmed && req.method() === 'POST' && req.url().includes('/api/admin/login')) {
    htmlInterceptArmed = false;
    await route.fulfill({
      status: 404,
      contentType: 'text/html; charset=utf-8',
      body: '<!DOCTYPE html><html><head><title>Page Not Found</title></head><body><h1>404</h1></body></html>'
    });
    return;
  }
  await route.fallback();
});

await ok('HTML response from API shows friendly error with HTTP status (no JSON crash)', async () => {
  htmlInterceptArmed = true;
  await page.fill('#l-user', 'admin');
  await page.fill('#l-pass', 'whatever');
  await page.click('#loginBtn');
  await page.waitForFunction(() => {
    const e = document.getElementById('loginError');
    return e && !e.hidden && /HTTP 404/.test(e.textContent) && /HTML/i.test(e.textContent);
  });
});

await ok('wrong password surfaces backend error inline', async () => {
  await page.fill('#l-user', 'admin');
  await page.fill('#l-pass', 'definitely-wrong');
  await page.click('#loginBtn');
  await page.waitForFunction(() => {
    const e = document.getElementById('loginError');
    return e && !e.hidden && /invalid/i.test(e.textContent);
  });
});

await ok('correct credentials reach dashboard with stats', async () => {
  await page.fill('#l-pass', 'ui-test-password');
  await page.click('#loginBtn');
  await page.waitForSelector('#view-dashboard:not([hidden])', { state: 'attached' });
  await page.waitForFunction(() => document.querySelectorAll('#statsRow .stat-box').length === 3);
  const who = await page.textContent('#whoami');
  assert.match(who, /Signed in as admin/);
  await page.waitForSelector('#emptyMsg:not([hidden])');
});

await ok('New Post opens editor and autogenerates slug', async () => {
  await page.click('#newPostBtn');
  await page.waitForSelector('#view-editor:not([hidden])', { state: 'attached' });
  await page.fill('#f-title', 'Playwright UI Post');
  await page.waitForFunction(() => document.getElementById('f-slug').value === 'playwright-ui-post');
});

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

await ok('rich text editing works (typing + bold)', async () => {
  await page.click('#rteEditor');
  await page.keyboard.type('Hello body ');
  await page.click('.rte-toolbar button[data-cmd="bold"]');
  await page.keyboard.type('bolded words');
  await page.waitForFunction(() =>
    document.getElementById('rteEditor').innerHTML.includes('<strong>') ||
    document.getElementById('rteEditor').innerHTML.includes('<b>')
  );
});

await ok('HTML source toggle round-trips markup', async () => {
  await page.click('#srcToggle');
  await page.waitForSelector('#rteWrap.mode-src');
  const src = await page.inputValue('#rteSource');
  assert.ok(src.includes('<strong>') || src.includes('<b>'), 'source missing bold markup');
  await page.fill('#rteSource', src + '<script>alert(7)</script><img src="/uploads/srcmode.png" alt="src">');
  await page.click('#srcToggle');
  await page.waitForFunction(() => !document.getElementById('rteWrap').classList.contains('mode-src'));
  await page.waitForFunction(() => document.getElementById('rteEditor').innerHTML.includes('srcmode.png'));
});

await ok('save creates draft (POST with CSRF header)', async () => {
  await page.click('#saveBtn');
  await page.waitForFunction(() => document.getElementById('toast').classList.contains('show'));
  await page.waitForFunction(() => !document.getElementById('previewBtn').disabled);
  const write = capturedWrites.filter((w) => w.method === 'POST' && w.path.endsWith('/admin/posts')).pop();
  assert.ok(write, 'no POST captured');
  assert.ok(write.headers['x-csrf-token'], 'CSRF header missing');
  const parsed = JSON.parse(write.body);
  assert.equal(parsed.status, 'draft');
  assert.equal(parsed.slug, 'playwright-ui-post');
  assert.ok(parsed.seo, 'seo object missing');
});

await ok('reopened draft is sanitized (script stripped)', async () => {
  await page.click('#backBtn');
  await page.waitForSelector('#view-dashboard:not([hidden])', { state: 'attached' });
  await page.click('#postsTbody tr[data-slug="playwright-ui-post"] button[data-act="edit"]');
  await page.waitForSelector('#view-editor:not([hidden])', { state: 'attached' });
  await page.waitForFunction(() => document.getElementById('rteEditor').innerHTML.length > 10);
  const html = await page.evaluate(() => document.getElementById('rteEditor').innerHTML);
  assert.ok(!html.includes('<script'), 'script survived roundtrip into editor');
  assert.ok(html.includes('srcmode.png'), 'image lost in roundtrip');
});

await ok('cover upload populates URL + preview', async () => {
  await page.setInputFiles('#coverFileInput', { name: 'Cover Image.png', mimeType: 'image/png', buffer: PNG_1PX });
  await page.waitForFunction(() => /^\/uploads\/.+\.png$/.test(document.getElementById('f-coverUrl').value));
  await page.waitForFunction(() => document.getElementById('coverPreview').style.display === 'block');
});

await ok('SEO/category/tags/status fields save as publish (PUT)', async () => {
  await page.selectOption('#f-category', 'seo');
  await page.fill('#f-tags', 'alpha, beta');
  await page.fill('#f-seoTitle', 'UI SEO Title');
  await page.fill('#f-seoDesc', 'UI meta description.');
  await page.selectOption('#f-status', 'published');
  const putCountBefore = capturedWrites.filter((w) => w.method === 'PUT').length;
  await page.click('#saveBtn');
  for (let i = 0; i < 50; i++) {
    if (capturedWrites.filter((w) => w.method === 'PUT').length > putCountBefore) break;
    await page.waitForTimeout(100);
  }
  await page.waitForFunction(() => document.getElementById('toast').classList.contains('show'));
  const write = capturedWrites.filter((w) => w.method === 'PUT').pop();
  assert.ok(write, 'no PUT captured');
  const parsed = JSON.parse(write.body);
  assert.equal(parsed.status, 'published');
  assert.equal(parsed.category, 'seo');
  assert.deepEqual(parsed.tags, ['alpha', 'beta']);
  assert.equal(parsed.seo.title, 'UI SEO Title');
  assert.ok(parsed.coverImage && parsed.coverImage.startsWith('/uploads/'), 'coverImage missing in PUT');
});

await ok('preview opens signed draft-style URL rendering the post', async () => {
  const popupPromise = context.waitForEvent('page');
  await page.click('#previewBtn');
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  assert.match(popup.url(), /\/blog\/playwright-ui-post\/\?preview=/);
  const content = await popup.content();
  assert.ok(content.includes('Playwright UI Post'));
  await popup.close();
});

await ok('public published page renders through blog function', async () => {
  const res = await blogFn.handler({
    httpMethod: 'GET',
    path: '/.netlify/functions/blog/playwright-ui-post/',
    headers: {}, queryStringParameters: null, body: null, isBase64Encoded: false
  });
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.includes('<title>UI SEO Title | Ationic Blog</title>'));
  assert.ok(res.body.includes('"@type":"BlogPosting"'));
});

await ok('dashboard lists row with published badge', async () => {
  await page.click('#backBtn');
  await page.waitForSelector('#view-dashboard:not([hidden])', { state: 'attached' });
  await page.waitForSelector('#postsTbody tr[data-slug="playwright-ui-post"] .badge-published');
});

await ok('search narrows rows', async () => {
  await page.fill('#searchInput', 'zzz-no-match');
  await page.waitForSelector('#postsTbody tr[data-slug="playwright-ui-post"]', { state: 'detached' });
  await page.waitForSelector('#emptyMsg:not([hidden])');
  await page.fill('#searchInput', '');
  await page.waitForSelector('#postsTbody tr[data-slug="playwright-ui-post"]');
});

await ok('status filter Drafts hides published row', async () => {
  await page.selectOption('#statusFilter', 'draft');
  await page.waitForSelector('#postsTbody tr[data-slug="playwright-ui-post"]', { state: 'detached' });
  await page.selectOption('#statusFilter', '');
  await page.waitForSelector('#postsTbody tr[data-slug="playwright-ui-post"]');
});

await ok('row unpublish flips status to draft publicly', async () => {
  await page.click('#postsTbody tr[data-slug="playwright-ui-post"] button[data-act="toggle"]');
  await page.waitForSelector('#postsTbody tr[data-slug="playwright-ui-post"] .badge-draft');
  const pub = await blogFn.handler({
    httpMethod: 'GET',
    path: '/.netlify/functions/blog/playwright-ui-post/',
    headers: {}, queryStringParameters: null, body: null, isBase64Encoded: false
  });
  assert.equal(pub.statusCode, 404);
});

await ok('row re-publish restores public availability', async () => {
  await page.click('#postsTbody tr[data-slug="playwright-ui-post"] button[data-act="toggle"]');
  await page.waitForSelector('#postsTbody tr[data-slug="playwright-ui-post"] .badge-published');
  const pub = await blogFn.handler({
    httpMethod: 'GET',
    path: '/.netlify/functions/blog/playwright-ui-post/',
    headers: {}, queryStringParameters: null, body: null, isBase64Encoded: false
  });
  assert.equal(pub.statusCode, 200);
});

await ok('delete asks for confirmation then removes row', async () => {
  await page.click('#postsTbody tr[data-slug="playwright-ui-post"] button[data-act="delete"]');
  await page.waitForSelector('#confirmModal.open', { state: 'attached' });
  await page.click('#confirmOk');
  await page.waitForSelector('#postsTbody tr[data-slug="playwright-ui-post"]', { state: 'detached' });
  const pub = await blogFn.handler({
    httpMethod: 'GET',
    path: '/.netlify/functions/blog/playwright-ui-post/',
    headers: {}, queryStringParameters: null, body: null, isBase64Encoded: false
  });
  assert.equal(pub.statusCode, 404);
});

await ok('logout returns to login screen', async () => {
  await page.click('#logoutBtn');
  await page.waitForSelector('#loginForm', { state: 'visible' });
});

await ok('expired session bounces writes back to login', async () => {
  await page.fill('#l-user', 'admin');
  await page.fill('#l-pass', 'ui-test-password');
  await page.click('#loginBtn');
  await page.waitForSelector('#view-dashboard:not([hidden])', { state: 'attached' });
  await page.evaluate(() => {
    for (const c of document.cookie.split(';')) {
      const k = c.split('=')[0].trim();
      document.cookie = k + '=; Path=/; Max-Age=0';
    }
  });
  await page.click('#newPostBtn');
  await page.fill('#f-title', 'Session Probe Post');
  await page.click('#rteEditor');
  await page.keyboard.type('probe body');
  await page.click('#saveBtn');
  await page.waitForSelector('#loginForm', { state: 'visible' });
});

await browser.close();
server.close();

console.log('\n=================================');
console.log('Admin UI suite: ' + passed + ' passed, ' + failed + ' failed');
console.log('=================================\n');
process.exit(failed ? 1 : 0);
