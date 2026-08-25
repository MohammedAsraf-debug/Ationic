'use strict';

const { escapeHtml, formatDate } = require('./util');

function notFoundPage(message) {
  const content =
    '<section class="blog-hero">' +
    '<div class="container"><div class="blog-hero__inner">' +
    '<span class="section-tag">404</span>' +
    '<h1>Post Not <span class="highlight">Found</span></h1>' +
    '<p class="blog-hero__sub">' + escapeHtml(message || 'The article you are looking for does not exist or has been moved.') + '</p>' +
    '<div class="hero-actions"><a href="/blog/" class="btn btn-primary btn-lg">Back to Blog <i class="fas fa-arrow-right"></i></a><a href="/contact.html" class="btn btn-outline btn-lg">Contact Us</a></div>' +
    '</div></div></section>';
  return { statusCode: 404, body: content };
}

function listingPage(posts, page, perPage, basePath, heading, subheading, categories) {
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const slice = posts.slice((current - 1) * perPage, current * perPage);
  const cards = slice.map((p) => require('./render').postCard(p)).join('\n');
  const chips = (categories && categories.length ? categories : require('./util').CATEGORIES);
  const catChips = chips.map(
    (c) => '<a class="cat-chip" href="/blog/category/' + encodeURIComponent(c.slug) + '/">' + escapeHtml(c.label) + '</a>'
  ).join('');
  const content =
    '<section class="blog-hero">' +
    '<div class="container"><div class="blog-hero__inner">' +
    '<span class="section-tag">Ationic Blog</span>' +
    '<h1>' + heading + '</h1>' +
    '<p class="blog-hero__sub">' + escapeHtml(subheading) + '</p>' +
    '</div></div></section>' +
    '<section class="section section--top blog-listing"><div class="container">' +
    '<div class="cat-chips">' + catChips + '</div>' +
    (slice.length
      ? '<div class="post-grid">' + cards + '</div>'
      : '<p class="empty-state">No articles published yet. Check back soon.</p>') +
    require('./render').pagination(current, totalPages, basePath) +
    '</div></section>';
  return { statusCode: 200, body: content };
}

function postPage(post, opts) {
  opts = opts || {};
  const url = '/blog/' + encodeURIComponent(post.slug) + '/';
  const date = post.publishedAt || post.createdAt;
  const coverImg = post.coverImage
    ? '<img src="' + escapeHtml(post.coverImage) + '" alt="' + escapeHtml(post.coverAlt || post.title) + '" width="1200" height="630" decoding="async">'
    : '';
  const tags = (post.tags || []).map((t) => '<span class="tag-chip">' + escapeHtml(t) + '</span>').join('');
  const related = (opts.related || []).map((p) => require('./render').postCard(p)).join('\n');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.coverImage ? (post.coverImage.startsWith('http') ? post.coverImage : require('./render').SITE_URL + post.coverImage) : undefined,
    datePublished: date,
    dateModified: post.updatedAt || date,
    author: { '@type': 'Person', name: post.author || 'Ationic Team' },
    publisher: {
      '@type': 'Organization',
      name: 'Ationic',
      logo: { '@type': 'ImageObject', url: require('./render').SITE_URL + '/images/ationic.png' }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': require('./render').SITE_URL + url }
  };
  const content =
    '<article class="single-post">' +
    '<header class="post-header"><div class="container container--narrow">' +
    (post.category ? '<a class="post-card__tag" href="/blog/category/' + escapeHtml(post.category) + '/">' + escapeHtml(post.categoryLabel || post.category) + '</a>' : '') +
    '<h1>' + escapeHtml(post.title) + '</h1>' +
    '<div class="post-meta"><time datetime="' + escapeHtml(date) + '">' + escapeHtml(formatDate(date)) + '</time><span aria-hidden="true">&middot;</span><span>' + escapeHtml(post.author || 'Ationic Team') + '</span><span aria-hidden="true">&middot;</span><span>' + require('./util').readingMinutes(post.bodyHtml) + ' min read</span></div>' +
    '</div></header>' +
    (coverImg ? '<figure class="post-cover container container--narrow">' + coverImg + '</figure>' : '') +
    '<div class="container container--narrow post-content">' + post.bodyHtml + '</div>' +
    (tags ? '<div class="container container--narrow post-tags">' + tags + '</div>' : '') +
    (related ? '<aside class="related-posts"><div class="container"><h2>Keep Reading</h2><div class="post-grid">' + related + '</div></div></aside>' : '') +
    '</article>';
  return { statusCode: 200, body: content, jsonLd };
}

module.exports = { notFoundPage, listingPage, postPage };
