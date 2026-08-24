'use strict';

const crypto = require('crypto');

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const PREVIEW_TTL_SECONDS = 60 * 60;
const SESSION_COOKIE = 'blog_session';
const CSRF_COOKIE = 'blog_csrf';

function scryptHashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return 's2$' + salt.toString('hex') + '$' + hash.toString('hex');
}

function normalizeStoredHash(stored) {
  let s = String(stored == null ? '' : stored).trim();
  if (s.length >= 2 && ((s[0] === "'" && s[s.length - 1] === "'") || (s[0] === '"' && s[s.length - 1] === '"'))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function verifyPassword(password, stored) {
  try {
    const parts = normalizeStoredHash(stored).split('$');
    if (parts.length !== 3 || parts[0] !== 's2') return false;
    const salt = Buffer.from(parts[1], 'hex');
    const expected = Buffer.from(parts[2], 'hex');
    if (salt.length !== 16 || expected.length !== KEYLEN) return false;
    const actual = crypto.scryptSync(String(password), salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
    return crypto.timingSafeEqual(actual, expected);
  } catch (e) {
    return false;
  }
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  return Buffer.from(String(str).replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

function hmacSign(payload, secret) {
  return b64url(crypto.createHmac('sha256', secret).update(payload).digest());
}

function safeEqualStr(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function signSession(secret, subject, ttlSeconds) {
  const payload = b64url(JSON.stringify({ sub: String(subject), exp: Math.floor(Date.now() / 1000) + (ttlSeconds || SESSION_TTL_SECONDS), jti: crypto.randomBytes(8).toString('hex') }));
  return payload + '.' + hmacSign(payload, secret);
}

function verifySession(token, secret) {
  try {
    if (!token || typeof token !== 'string') return null;
    const dot = token.lastIndexOf('.');
    if (dot < 1) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    if (!safeEqualStr(sig, hmacSign(payload, secret))) return null;
    const data = JSON.parse(b64urlDecode(payload).toString('utf8'));
    if (!data || data.sub !== 'admin' || typeof data.exp !== 'number') return null;
    if (data.exp * 1000 < Date.now()) return null;
    return { sub: data.sub };
  } catch (e) {
    return null;
  }
}

function signPreviewToken(secret, slug, ttlSeconds) {
  const payload = b64url(JSON.stringify({ p: String(slug), exp: Math.floor(Date.now() / 1000) + (ttlSeconds || PREVIEW_TTL_SECONDS), k: 'preview' }));
  return payload + '.' + hmacSign(payload, secret);
}

function verifyPreviewToken(token, secret, slug) {
  try {
    if (!token || typeof token !== 'string') return null;
    const dot = token.lastIndexOf('.');
    if (dot < 1) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    if (!safeEqualStr(sig, hmacSign(payload, secret))) return null;
    const data = JSON.parse(b64urlDecode(payload).toString('utf8'));
    if (!data || data.k !== 'preview' || typeof data.exp !== 'number') return null;
    if (data.exp * 1000 < Date.now()) return null;
    if (slug != null && data.p !== String(slug)) return null;
    return { slug: data.p };
  } catch (e) {
    return null;
  }
}

function randomToken(bytes) {
  return crypto.randomBytes(bytes || 32).toString('hex');
}

function sessionCookie(value, maxAgeSeconds) {
  const parts = [SESSION_COOKIE + '=' + value, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=' + (maxAgeSeconds == null ? SESSION_TTL_SECONDS : maxAgeSeconds)];
  if (process.env.NETLIFY === 'true' || process.env.CONTEXT === 'production') parts.push('Secure');
  return parts.join('; ');
}

function clearSessionCookie() {
  return SESSION_COOKIE + '=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

function csrfCookie(value) {
  const parts = [CSRF_COOKIE + '=' + value, 'Path=/admin', 'SameSite=Lax', 'Max-Age=' + SESSION_TTL_SECONDS];
  if (process.env.NETLIFY === 'true' || process.env.CONTEXT === 'production') parts.push('Secure');
  return parts.join('; ');
}

module.exports = {
  scryptHashPassword,
  verifyPassword,
  signSession,
  verifySession,
  signPreviewToken,
  verifyPreviewToken,
  randomToken,
  safeEqualStr,
  sessionCookie,
  clearSessionCookie,
  csrfCookie,
  SESSION_COOKIE,
  CSRF_COOKIE,
  SESSION_TTL_SECONDS
};
