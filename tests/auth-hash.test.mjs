import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const auth = require('../netlify/functions/lib/auth.js');

let passed = 0;
let failed = 0;
async function ok(name, fn) {
  try { await fn(); passed++; console.log('  PASS ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + (e && e.message).split('\n')[0]); }
}

console.log('\n=== Auth hash & primitives suite ===\n');

await ok('generated hash ALWAYS verifies with same password (required assertion)', async () => {
  const hash = auth.scryptHashPassword('TestPassword@123');
  assert.equal(auth.verifyPassword('TestPassword@123', hash), true);
});

await ok('wrong password returns false (required assertion)', async () => {
  const hash = auth.scryptHashPassword('TestPassword@123');
  assert.equal(auth.verifyPassword('WrongPassword', hash), false);
});

await ok('multiple generated hashes for the same password all verify, salts unique', async () => {
  const hashes = new Set();
  for (let i = 0; i < 5; i++) {
    const h = auth.scryptHashPassword('TestPassword@123');
    hashes.add(h);
    assert.equal(auth.verifyPassword('TestPassword@123', h), true, 'hash #' + (i + 1) + ' failed to verify');
    assert.equal(auth.verifyPassword('testpassword@123', h), false, 'case-sensitivity broken');
    assert.equal(auth.verifyPassword('TestPassword@123 ', h), false, 'whitespace must stay part of the password');
    assert.equal(auth.verifyPassword('', h), false);
  }
  assert.equal(hashes.size, 5, 'salt reuse detected - hashes must be unique per call');
});

await ok('hash format preserved: s2$32-hex$128-hex (compat requirement)', async () => {
  const h = auth.scryptHashPassword('Format@Check1');
  assert.match(h, /^s2\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  const parts = h.split('$');
  assert.equal(parts.length, 3);
  assert.equal(Buffer.from(parts[1], 'hex').length, 16, 'salt must remain 16 bytes');
  assert.equal(Buffer.from(parts[2], 'hex').length, 64, 'derived key must remain 64 bytes');
});

await ok('paste artifacts tolerated on stored value only', async () => {
  const h = auth.scryptHashPassword('Paste@Test99');
  assert.equal(auth.verifyPassword('Paste@Test99', h + '\n'), true);
  assert.equal(auth.verifyPassword('Paste@Test99', '  ' + h + '  '), true);
  assert.equal(auth.verifyPassword('Paste@Test99', "'" + h + "'"), true);
  assert.equal(auth.verifyPassword('Paste@Test99', '"' + h + '"'), true);
});

await ok('tampered single hex character fails (comparison is exact, timing-safe path)', async () => {
  const h = auth.scryptHashPassword('Tamper@Test11');
  const parts = h.split('$');
  const last = parts[2][parts[2].length - 1];
  const flipped = last === 'a' ? 'b' : 'a';
  const tampered = parts[0] + '$' + parts[1] + '$' + parts[2].slice(0, -1) + flipped;
  assert.notEqual(tampered, h);
  assert.equal(auth.verifyPassword('Tamper@Test11', tampered), false);
  const saltFlip = parts[0] + '$' + (parts[1][0] === 'a' ? 'b' : 'a') + parts[1].slice(1) + '$' + parts[2];
  assert.equal(auth.verifyPassword('Tamper@Test11', saltFlip), false);
});

await ok('malformed stored values all return false without throwing', async () => {
  const candidates = [null, undefined, '', '   ', 's2$', '$$', 's2$$', 'plaintext', 's2$zz$zz', 's2$abcd$abcd',
    's1$' + 'a'.repeat(32) + '$' + 'b'.repeat(128), 's2$' + 'a'.repeat(31) + '$' + 'b'.repeat(128),
    's2$' + 'a'.repeat(32) + '$' + 'b'.repeat(127)];
  for (const c of candidates) {
    assert.equal(auth.verifyPassword('x', c), false, JSON.stringify(c) + ' should be false');
  }
  assert.equal(auth.verifyPassword(null, null), false);
});

await ok('unicode and long passwords work', async () => {
  const pw = '\u00e5\u4e16\u754c\ud83d\ude00 Passw\u00f8rd!'.repeat(4);
  const h = auth.scryptHashPassword(pw);
  assert.equal(auth.verifyPassword(pw, h), true);
  assert.equal(auth.verifyPassword(pw + '!', h), false);
});

await ok('no plaintext password or secret logging in auth module', async () => {
  const src = readFileSync(new URL('../netlify/functions/lib/auth.js', import.meta.url), 'utf8');
  assert.ok(!/console\.(log|info|debug|warn|error)/.test(src), 'auth.js must not log');
  assert.ok(!/password\s*[=+]\s*['"]/.test(src.replace(/String\(password\)|verifyPassword\(|scryptHashPassword\(/g, '')), 'hard-coded password pattern found');
  assert.ok(!/(secret|password)\s*[:=]\s*["'][^"']{8,}["']/i.test(src), 'hard-coded secret found');
});

await ok('session signing/verification unaffected (regression)', async () => {
  const secret = 'suite-secret-' + Date.now();
  const tok = auth.signSession(secret, 'admin');
  assert.ok(tok.includes('.'));
  assert.deepEqual(auth.verifySession(tok, secret), { sub: 'admin' });
  assert.equal(auth.verifySession(tok, 'other-secret'), null);
  assert.equal(auth.verifySession(tok.slice(0, -2) + 'zz', secret), null);
  const expired = auth.signSession(secret, 'admin', -10);
  assert.equal(auth.verifySession(expired, secret), null);
  const forged = Buffer.from(JSON.stringify({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + 9999 })).toString('base64url') + '.' + tok.split('.')[1];
  assert.equal(auth.verifySession(forged, secret), null);
});

await ok('preview tokens still bound to slug with expiry', async () => {
  const secret = 'suite-secret-preview';
  const t = auth.signPreviewToken(secret, 'my-post', 60);
  assert.deepEqual(auth.verifyPreviewToken(t, secret, 'my-post'), { slug: 'my-post' });
  assert.equal(auth.verifyPreviewToken(t, secret, 'other-post'), null);
  assert.equal(auth.verifyPreviewToken(t, 'wrong', 'my-post'), null);
  assert.equal(auth.verifyPreviewToken(auth.signPreviewToken(secret, 'p', -5), secret, 'p'), null);
});

await ok('CSRF primitives intact (randomToken + safeEqualStr)', async () => {
  const a = auth.randomToken(24);
  const b = auth.randomToken(24);
  assert.match(a, /^[0-9a-f]{48}$/);
  assert.notEqual(a, b);
  assert.equal(auth.safeEqualStr(a, a.slice()), true);
  assert.equal(auth.safeEqualStr(a, b), false);
  assert.equal(auth.safeEqualStr('abc', 'abcd'), false);
});

console.log('\n=================================');
console.log('Auth suite: ' + passed + ' passed, ' + failed + ' failed');
console.log('=================================\n');
process.exit(failed ? 1 : 0);
