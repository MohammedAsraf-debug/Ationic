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

function assertJsonContract(res, label) {
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
  const raw = [].concat(res.headers['Set-Cookie'] || []);
  jarCookie = raw.map((c) => c.split(';')[0]).join('; ');
});

await ok('POST /api/admin/login wrong password => 401 application/json', async () => {
  const res = await login({ username: 'admin', password: 'wrong' });
  assert.equal(res.statusCode, 401);
  assertJsonContract(res, '401');
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
