'use strict';

const store = require('./lib/store');
const auth = require('./lib/auth');
const { layout, postCard, pagination, SITE_URL } = require('./lib/render');
const pages = require('./lib/pages');
const { escapeHtml, categoryBySlug, normalizePath } = require('./lib/util');

const POSTS_PER_PAGE = 9;

function html(statusCode, bodyHtml, extraHeaders) {
  return {
    statusCode,
    headers: Object.assign({ 'Content-Type': 'text/html; charset=utf-8' }, extraHeaders || {}),
    body: bodyHtml
  };
}

function redirect(location, statusCode) {
  return {
    statusCode: statusCode || 301,
    headers: { Location: location, 'Cache-Control': 'public, max-age=86400' },
    body: ''
  };
}

function sortPublished(posts) {
  return posts
    .filter((p) => p.status === 'published')
    .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));
}

function relatedPosts(posts, current, limit) {
  const sameCat = posts.filter((p) => p.slug !== current.slug && p.category === current.category);
  const others = posts.filter((p) => p.slug !== current.slug && p.category !== current.category);
  return sameCat.concat(others).slice(0, limit);
}

async function renderPost(post, allPosts, isPreview) {
  const page = pages.postPage(post, { related: relatedPosts(allPosts, post, 3) });
  const seoTitle = (post.seo && post.seo.title) || post.title;
  const seoDesc = (post.seo && post.seo.description) || post.excerpt || '';
  const noindex = isPreview || !!(post.seo && post.seo.noindex);
  const canonicalPath = '/blog/' + encodeURIComponent(post.slug) + '/';
  const body = layout({
    title: seoTitle + ' | Ationic Blog',
    description: seoDesc,
    canonicalPath,
    ogType: 'article',
    ogImage: post.coverImage,
    jsonLd: page.jsonLd,
    noindex,
    active: 'blog',
    content: page.body
  });
  const headers = isPreview ? { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' } : { 'Cache-Control': 'public, max-age=300' };
  return html(200, body, headers);
}

async function route(event) {
  const rawPath = event.path || '/';
  let path = normalizePath(rawPath.replace(/^\/\.netlify\/functions\/blog/, '').replace(/^\/blog/, '')) || '/';
  if (path.startsWith('/rss.xml')) path = '/rss.xml';
  const params = event.queryStringParameters || {};

  if (path === '/') {
    if (params.page && params.page !== '1') return redirect('/blog/', 301);
    const posts = sortPublished(await store.listPosts());
    const page = pages.listingPage(posts, 1, POSTS_PER_PAGE, '/blog', 'Insights That <span class="highlight">Drive Growth</span>', 'Practical guides, strategies, and behind-the-scenes lessons from a performance-driven digital marketing agency.');
    const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
    return html(200, layout({
      title: 'Blog | Ationic Digital Marketing Agency',
      description: 'Digital marketing insights from Ationic — SEO, Google Ads, Meta Ads, web development, and lead generation strategies that drive measurable growth.',
      canonicalPath: '/blog/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Ationic Blog',
        url: SITE_URL + '/blog/',
        publisher: { '@type': 'Organization', name: 'Ationic' }
      },
      active: 'blog',
      content: page.body
    }), { 'Cache-Control': 'public, max-age=300' });
  }

  const pageMatch = /^\/page\/(\d+)\/?$/.exec(path);
  if (pageMatch) {
    const n = parseInt(pageMatch[1], 10);
    if (n === 1) return redirect('/blog/', 301);
    const posts = sortPublished(await store.listPosts());
    const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
    if (n > totalPages) return pages.notFoundPage().statusCode ? html(pages.notFoundPage().statusCode, layout({ title: 'Not Found | Ationic Blog', description: '', canonicalPath: '/blog/404/', noindex: true, content: pages.notFoundPage().body })) : null;
    const page = pages.listingPage(posts, n, POSTS_PER_PAGE, '/blog', 'Insights That <span class="highlight">Drive Growth</span>', 'All articles — page ' + n + '.');
    return html(200, layout({
      title: 'Blog - Page ' + n + ' | Ationic',
      description: 'Digital marketing insights from Ationic.',
      canonicalPath: '/blog/page/' + n + '/',
      active: 'blog',
      content: page.body
    }), { 'Cache-Control': 'public, max-age=300' });
  }

  const catMatch = /^\/category\/([^\/]+)(?:\/page\/(\d+))?\/?$/.exec(path);
  if (catMatch) {
    const catSlug = catMatch[1];
    const cat = categoryBySlug(catSlug);
    if (!cat) return html(404, layout({ title: 'Category Not Found | Ationic Blog', description: '', canonicalPath: '/blog/category/' + encodeURIComponent(catSlug) + '/', noindex: true, content: pages.notFoundPage('Unknown category.').body }));
    const pageNum = parseInt(catMatch[2] || '1', 10);
    if (pageNum === 1 && catMatch[2]) return redirect('/blog/category/' + catSlug + '/', 301);
    const posts = sortPublished(await store.listPosts()).filter((p) => p.category === catSlug);
    const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
    if (pageNum > totalPages) return html(404, layout({ title: 'Not Found | Ationic Blog', description: '', canonicalPath: '/blog/category/' + catSlug + '/', noindex: true, content: pages.notFoundPage().body }));
    const page = pages.listingPage(posts, pageNum, POSTS_PER_PAGE, '/blog/category/' + catSlug, cat.label, 'Articles filed under ' + cat.label + '.');
    return html(200, layout({
      title: cat.label + ' Articles | Ationic Blog',
      description: 'Browse all ' + cat.label + ' articles from the Ationic blog.',
      canonicalPath: '/blog/category/' + catSlug + '/' + (pageNum > 1 ? 'page/' + pageNum + '/' : ''),
      active: 'blog',
      content: page.body
    }), { 'Cache-Control': 'public, max-age=300' });
  }

  if (path === '/rss.xml') {
    const posts = sortPublished(await store.listPosts())
      .filter((p) => !(p.seo && p.seo.noindex))
      .slice(0, 20);
    const items = posts.map((p) =>
      '<item><title>' + escapeHtml(p.title) + '</title>' +
      '<link>' + SITE_URL + '/blog/' + encodeURIComponent(p.slug) + '/</link>' +
      '<guid isPermaLink="true">' + SITE_URL + '/blog/' + encodeURIComponent(p.slug) + '/</guid>' +
      '<pubDate>' + new Date(p.publishedAt || p.createdAt).toUTCString() + '</pubDate>' +
      '<description>' + escapeHtml(p.excerpt || '') + '</description></item>'
    ).join('');
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>' +
      '<title>Ationic Blog</title><link>' + SITE_URL + '/blog/</link>' +
      '<description>Digital marketing insights from Ationic.</description><language>en</language>' +
      items + '</channel></rss>';
    return { statusCode: 200, headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' }, body: xml };
  }

  const slugDecode = decodeURIComponent(path.slice(1));
  let post = await store.getPost(slugDecode);
  if (post) {
    const previewToken = params.preview;
    if (post.status === 'published') {
      return renderPost(post, sortPublished(await store.listPosts()), false);
    }
    if (previewToken) {
      const secret = process.env.BLOG_SESSION_SECRET;
      const valid = secret && auth.verifyPreviewToken(previewToken, secret, slugDecode);
      if (valid) return renderPost(post, [], true);
    }
    return html(404, layout({ title: 'Not Found | Ationic Blog', description: '', canonicalPath: '/blog/', noindex: true, content: pages.notFoundPage().body }), { 'X-Robots-Tag': 'noindex, nofollow' });
  }

  for (const candidate of await store.listPosts()) {
    if (((candidate.slugHistory || []).includes(slugDecode)) && candidate.status === 'published') {
      return redirect('/blog/' + encodeURIComponent(candidate.slug) + '/', 301);
    }
  }

  const nf = pages.notFoundPage();
  return html(404, layout({ title: 'Post Not Found | Ationic Blog', description: '', canonicalPath: '/blog/', noindex: true, content: nf.body }));
}

exports.handler = async (event) => {
  try {
    if ((event.httpMethod || 'GET') !== 'GET' && (event.httpMethod || '').toUpperCase() !== 'HEAD') {
      return { statusCode: 405, headers: { Allow: 'GET' }, body: '' };
    }
    return await route(event);
  } catch (err) {
    console.error('[blog] unhandled error:', err && err.message);
    return { statusCode: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: '<!DOCTYPE html><html><head><meta name="robots" content="noindex"></head><body><h1>Something went wrong</h1><p><a href="/blog/">Back to blog</a></p></body></html>' };
  }
};
