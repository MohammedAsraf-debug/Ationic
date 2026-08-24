'use strict';

const store = require('./lib/store');

exports.handler = async (event) => {
  try {
    const rawPath = event.path || '';
    const name = decodeURIComponent(rawPath.replace(/^\/(?:\.netlify\/functions\/media)?\/?uploads\//, '').split('?')[0]);
    if (!name || name.includes('..')) return { statusCode: 404, body: '' };
    const media = await store.getMedia(name);
    if (!media) return { statusCode: 404, body: '' };
    return {
      statusCode: 200,
      headers: {
        'Content-Type': media.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox"
      },
      body: media.buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    console.error('[media] error:', err && err.message);
    return { statusCode: 500, body: '' };
  }
};
