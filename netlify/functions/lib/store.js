'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const POST_PREFIX = 'post:';
const MEDIA_PREFIX = 'media:';

let blobsStore = null;
let localDir = null;

function isProduction() {
  return process.env.NETLIFY === 'true' || !!process.env.NETLIFY_BLOBS_CONTEXT;
}

function getBlobs() {
  if (blobsStore) return blobsStore;
  const { getStore } = require('@netlify/blobs');
  blobsStore = {
    posts: getStore({ name: 'blog-posts', consistency: 'strong' }),
    media: getStore({ name: 'blog-media', consistency: 'strong' })
  };
  return blobsStore;
}

function getLocalDir() {
  if (localDir) return localDir;
  const root = process.env.LOCAL_DATA_DIR || path.join(process.cwd(), '.data');
  localDir = {
    root,
    postsFile: path.join(root, 'posts.json'),
    mediaDir: path.join(root, 'media')
  };
  fs.mkdirSync(localDir.mediaDir, { recursive: true });
  return localDir;
}

function readLocalPosts() {
  const dir = getLocalDir();
  try {
    return JSON.parse(fs.readFileSync(dir.postsFile, 'utf8'));
  } catch (e) {
    return {};
  }
}

function writeLocalPosts(map) {
  const dir = getLocalDir();
  const tmp = dir.postsFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(map, null, 2), 'utf8');
  fs.renameSync(tmp, dir.postsFile);
}

async function listPosts() {
  if (isProduction()) {
    const store = getBlobs().posts;
    const out = [];
    for await (const entry of store.list({ prefix: POST_PREFIX })) {
      const data = await store.get(entry.key, { type: 'json' });
      if (data && data.slug) out.push(data);
    }
    return out;
  }
  return Object.values(readLocalPosts());
}

async function getPost(slug) {
  if (isProduction()) {
    const store = getBlobs().posts;
    return store.get(POST_PREFIX + slug, { type: 'json' });
  }
  const map = readLocalPosts();
  return map[slug] || null;
}

async function putPost(post) {
  if (isProduction()) {
    await getBlobs().posts.setJSON(POST_PREFIX + post.slug, post);
    return post;
  }
  const map = readLocalPosts();
  delete map[post.slug];
  map[post.slug] = post;
  writeLocalPosts(map);
  return post;
}

async function putPostKeepKey(oldSlug, post) {
  if (oldSlug === post.slug) return putPost(post);
  if (isProduction()) {
    const store = getBlobs().posts;
    await store.setJSON(POST_PREFIX + post.slug, post);
    await store.delete(POST_PREFIX + oldSlug);
    return post;
  }
  const map = readLocalPosts();
  delete map[oldSlug];
  map[post.slug] = post;
  writeLocalPosts(map);
  return post;
}

async function deletePost(slug) {
  if (isProduction()) {
    await getBlobs().posts.delete(POST_PREFIX + slug);
    return true;
  }
  const map = readLocalPosts();
  if (map[slug]) {
    delete map[slug];
    writeLocalPosts(map);
  }
  return true;
}

function safeMediaName(name) {
  const base = String(name || 'image')
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+/, '')
    .slice(0, 64);
  return base || 'image';
}

const MAGIC = [
  { ext: 'png', type: 'image/png', test: (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: 'jpg', type: 'image/jpeg', test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'gif', type: 'image/gif', test: (b) => b.length > 6 && b.slice(0, 3).toString('ascii') === 'GIF' },
  {
    ext: 'webp', type: 'image/webp',
    test: (b) => b.length > 12 && b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP'
  }
];

function detectImage(buffer) {
  for (const m of MAGIC) {
    if (m.test(buffer)) return m;
  }
  return null;
}

async function putMedia(originalName, buffer) {
  if (!Buffer.isBuffer(buffer)) throw new Error('INVALID_BUFFER');
  if (buffer.length === 0) throw new Error('EMPTY_FILE');
  if (buffer.length > 5 * 1024 * 1024) throw new Error('TOO_LARGE');
  const kind = detectImage(buffer);
  if (!kind) throw new Error('UNSUPPORTED_TYPE');
  const cleanBase = safeMediaName(originalName).replace(/\.[a-z0-9]+$/, '');
  const name = cleanBase + '-' + crypto.randomBytes(4).toString('hex') + '.' + kind.ext;
  if (isProduction()) {
    await getBlobs().media.set(MEDIA_PREFIX + name, buffer, { contentType: kind.type });
  } else {
    fs.writeFileSync(path.join(getLocalDir().mediaDir, name), buffer);
  }
  return { name, url: '/uploads/' + name, contentType: kind.type, size: buffer.length };
}

async function getMedia(name) {
  if (!/^[a-z0-9][a-z0-9.\-]{0,80}$/.test(String(name || ''))) return null;
  if (isProduction()) {
    const store = getBlobs().media;
    const blob = await store.get(MEDIA_PREFIX + name, { type: 'arrayBuffer' });
    if (!blob) return null;
    const buf = Buffer.from(blob);
    const kind = detectImage(buf);
    return { buffer: buf, contentType: kind ? kind.type : 'application/octet-stream' };
  }
  const p = path.join(getLocalDir().mediaDir, name);
  if (!fs.existsSync(p)) return null;
  const buf = fs.readFileSync(p);
  const kind = detectImage(buf);
  return { buffer: buf, contentType: kind ? kind.type : 'application/octet-stream' };
}

module.exports = {
  listPosts,
  getPost,
  putPost,
  putPostKeepKey,
  deletePost,
  putMedia,
  getMedia,
  safeMediaName,
  detectImage
};
