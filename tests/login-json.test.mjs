import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
process.env.LOCAL_DATA_DIR = mkdtempSync(join(tmpdir(), 'ationic-login-json-'));
process.env.BLOG_SESSION_SECRET = 'login-json-suite-secret';
process.env.BLOG_ADMIN_USER = 'admin';
process.env.SITE_URL = 'https://ationic.agency';

const storeMod = require('../netlify/functions/lib/store.js');
const authLib = require('../netlify/functions/lib/auth.js');
process.env.BLOG_ADMIN_PASSWORD_HASH = authLib.scryptHashPassword('json-suite-pass');

const api = require('../netlify/functions/api.js');

function event(method, suffix, opts) {
  opts = opts || {};
  return {
    httpMethod: method,
    path: '/.netlify/functions/api' + suffix,
    headers: opts.headers || {},
    queryStringParameters: opts.query || null,
    body: opts.body !== undefined ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : null,
    isBase64Encoded: !!opts.isBase64Encoded
  };
}

let jarCookie = '';
let csrf = '';

async function login(bodyObj) {
  return api.handler(event('POST', '/admin/login', {
    headers: { 'content-type': 'application/json' },
    body: bodyObj === undefined ? '{invalid-json' : bodyObj
  }));
}

function assertNetlifyResponseShape(res, label) {
  assert.equal(typeof res.statusCode, 'number', label + ': statusCode must be a number');
  assert.ok(res.body === null || res.body === undefined || typeof res.body === 'string', label + ': body must be a string');
  const single = res.headers || {};
  for (const key of Object.keys(single)) {
    const v = single[key];
    assert.equal(typeof v, 'string', label + ': header "' + key + '" must be a string, got ' + (Array.isArray(v) ? 'Array' : typeof v));
  }
  if (res.multiValueHeaders) {
    for (const key of Object.keys(res.multiValueHeaders)) {
      assert.ok(Array.isArray(res.multiValueHeaders[key]), label + ': multiValueHeaders."' + key + '" must be an array');
      for (const v of res.multiValueHeaders[key]) {
        assert.equal(typeof v, 'string', label + ': multiValueHeaders."' + key + '" entries must be strings');
      }
    }
  }
}

function assertJsonContract(res, label) {
  assertNetlifyResponseShape(res, label);
  const ct = String((res.headers && (res.headers['Content-Type'] || res.headers['content-type'])) || '');
  assert.match(ct, /^application\/json/i, label + ': Content-Type must be application/json, got "' + ct + '"');
  const body = String(res.body || '');
  assert.ok(!/^\s*</.test(body), label + ': response body must never start with HTML');
  assert.doesNotMatch(body, /<!DOCTYPE|<html/i, label + ': HTML found in API response');
  JSON.parse(body);
}

let passed = 0;
let failed = 0;
async function ok(name, fn) {
  try { await fn(); passed++; console.log('  PASS ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + (e && e.message).split('\n').slice(0, 3).join('\n       ')); }
}

console.log('\n=== Login JSON contract regression suite ===\n');

await ok('POST /api/admin/login success => 200 application/json', async () => {
  const res = await login({ username: 'admin', password: 'json-suite-pass' });
  assert.equal(res.statusCode, 200);
  assertJsonContract(res, 'success');
  const data = JSON.parse(res.body);
  assert.ok(data.csrfToken);
  csrf = data.csrfToken;
  const raw = [].concat(
    (res.multiValueHeaders && res.multiValueHeaders['Set-Cookie']) || [],
    res.headers['Set-Cookie'] || res.headers['set-cookie'] || []
  );
  jarCookie = raw.map((c) => c.split(';')[0]).join('; ');
});

await ok('POST /api/admin/login wrong password => 401 application/json', async () => {
  const res = await login({ username: 'admin', password: 'definitely-wrong' });
  assert.equal(res.statusCode, 401);
  assertJsonContract(res, 'login-wrong-pass');
  assert.ok(!res.multiValueHeaders || !res.multiValueHeaders['Set-Cookie'], 'failed login must not set cookies');
});

await ok('login success => exactly two Set-Cookie values via multiValueHeaders (never arrays in single-value headers)', async () => {
  const res = await login({ username: 'admin', password: 'json-suite-pass' });
  assert.equal(res.statusCode, 200);
  assertJsonContract(res, 'login-success-shape');
  assert.ok(!res.headers['Set-Cookie'] && !res.headers['set-cookie'], 'Set-Cookie must NOT appear in single-value headers');
  const mvh = res.multiValueHeaders || {};
  const cookies = mvh['Set-Cookie'] || mvh['set-cookie'];
  assert.ok(Array.isArray(cookies), 'multiValueHeaders.Set-Cookie must be an array');
  assert.equal(cookies.length, 2, 'expected exactly 2 Set-Cookie values, got ' + cookies.length);
  const session = cookies.find((c) => c.startsWith('blog_session='));
  const csrfCookie = cookies.find((c) => c.startsWith('blog_csrf='));
  assert.ok(session && csrfCookie, 'both blog_session and blog_csrf cookies present');
  for (const c of [session, csrfCookie]) {
    assert.match(c, /HttpOnly/i, 'cookie must be HttpOnly: ' + c.slice(0, 40));
    assert.match(c, /SameSite=Lax/i, 'cookie must be SameSite=Lax');
  }
  assert.match(session, /Path=\//, 'session cookie must be Path=/');
  assert.match(csrfCookie, /Path=\/admin/, 'csrf cookie must be scoped to /admin');
  const sVal = session.split(';')[0].split('=')[1];
  const cVal = csrfCookie.split(';')[0].split('=')[1];
  assert.notEqual(sVal, cVal, 'session and csrf token values must differ');
  assert.ok(sVal.length >= 40 && cVal.length >= 24, 'token lengths sane');
});

await ok('POST /api/admin/login malformed JSON body => 400 application/json', async () => {
  const res = await login(undefined);
  assert.equal(res.statusCode, 400);
  assertJsonContract(res, '400-malformed');
});

await ok('POST /api/admin/login missing body treated as empty credentials => 401 application/json', async () => {
  const res = await api.handler(event('POST', '/admin/login', { headers: {} }));
  assert.equal(res.statusCode, 401);
  assertJsonContract(res, '401-missing-body');
});

await ok('unknown API endpoint => 404 application/json (never HTML)', async () => {
  const res = await api.handler(event('GET', '/does-not-exist'));
  assert.equal(res.statusCode, 404);
  assertJsonContract(res, '404-endpoint');
});

await ok('authenticated request without session => 401 application/json', async () => {
  const res = await api.handler(event('GET', '/admin/posts'));
  assert.equal(res.statusCode, 401);
  assertJsonContract(res, '401-posts');
});

await ok('CSRF failure => 403 application/json', async () => {
  const res = await api.handler(event('POST', '/admin/posts', {
    headers: { cookie: jarCookie },
    body: { title: 'x' }
  }));
  assert.equal(res.statusCode, 403);
  assertJsonContract(res, '403');
});

await ok('internal storage failure still returns JSON 500 (never HTML)', async () => {
  const originalPut = storeMod.putPost;
  storeMod.putPost = async () => { throw new Error('simulated storage outage'); };
  try {
    const res = await api.handler(event('POST', '/admin/posts', {
      headers: { cookie: jarCookie, 'x-csrf-token': csrf, 'content-type': 'application/json' },
      body: { title: 'Outage Probe', slug: 'outage-probe', bodyHtml: '<p>b</p>' }
    }));
    assert.equal(res.statusCode, 500);
    assertJsonContract(res, '500-storage');
  } finally {
    storeMod.putPost = originalPut;
  }
});

console.log('\n=================================');
console.log('Login JSON contract suite: ' + passed + ' passed, ' + failed + ' failed');
console.log('=================================\n');
process.exit(failed ? 1 : 0);
