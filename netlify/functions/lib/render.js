'use strict';

const { escapeHtml, formatDate, readingMinutes } = require('./util');

const SITE_URL = (process.env.SITE_URL || 'https://ationic.agency').replace(/\/+$/, '');

function nav(active) {
  const link = (href, label, key) =>
    '<li><a href="' + href + '" class="nav-link' + (active === key ? ' active' : '') + '">' + label + '</a></li>';
  return (
    '<header class="navbar" id="navbar">' +
    '<div class="container nav-container">' +
    '<a href="/" class="logo">Ationic<span class="logo-accent">.</span></a>' +
    '<nav class="nav-menu" id="nav-menu"><ul>' +
    link('/', 'Home', 'home') +
    link('/services.html', 'Services', 'services') +
    link('/portfolio.html', 'Portfolio', 'portfolio') +
    link('/blog/', 'Blog', 'blog') +
    link('/about.html', 'About', 'about') +
    link('/contact.html', 'Contact', 'contact') +
    '<li class="theme-menu-item" role="none"><button type="button" class="theme-toggle" aria-label="Switch to light mode" title="Switch to light mode" aria-pressed="false"><i class="fas fa-moon" aria-hidden="true"></i><span class="theme-toggle__text">Light mode</span></button></li>' +
    '</ul></nav>' +
    '<div class="nav-actions">' +
    '<a href="/contact.html" class="btn btn-primary btn-sm">Free Consultation</a>' +
    '<button type="button" class="theme-toggle" aria-label="Switch to light mode" title="Switch to light mode" aria-pressed="false"><i class="fas fa-moon" aria-hidden="true"></i></button>' +
    '<button type="button" class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false"><span class="bar"></span><span class="bar"></span><span class="bar"></span></button>' +
    '</div>' +
    '</div>' +
    '</header>'
  );
}

function footer() {
  return (
    '<footer class="footer">' +
    '<div class="container">' +
    '<div class="footer-grid">' +
    '<div class="footer-brand">' +
    '<a href="/" class="logo">Ationic<span class="logo-accent">.</span></a>' +
    '<p>Digital marketing agency helping businesses grow with performance-driven strategies, creative content, and modern websites.</p>' +
    '<div class="footer-social">' +
    '<a href="https://www.facebook.com/ationic" target="_blank" rel="noopener noreferrer nofollow" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>' +
    '<a href="https://www.instagram.com/ationic_digital/" target="_blank" rel="noopener noreferrer nofollow" aria-label="Instagram"><i class="fab fa-instagram"></i></a>' +
    '<a href="https://www.linkedin.com/company/ationic" target="_blank" rel="noopener noreferrer nofollow" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>' +
    '<a href="https://x.com/Ationic_it" target="_blank" rel="noopener noreferrer nofollow" aria-label="Twitter"><i class="fab fa-x-twitter"></i></a>' +
    '</div>' +
    '</div>' +
    '<div class="footer-col"><h4>Quick Links</h4><ul>' +
    '<li><a href="/">Home</a></li><li><a href="/about.html">About Us</a></li><li><a href="/services.html">Services</a></li><li><a href="/portfolio.html">Portfolio</a></li><li><a href="/blog/">Blog</a></li><li><a href="/contact.html">Contact</a></li>' +
    '</ul></div>' +
    '<div class="footer-col"><h4>Services</h4><ul>' +
    '<li><a href="/services/performance-marketing.html">Performance Marketing</a></li>' +
    '<li><a href="/services/meta-ads.html">Meta Ads</a></li>' +
    '<li><a href="/services/google-ads.html">Google Ads</a></li>' +
    '<li><a href="/services/social-media-marketing.html">Social Media Marketing</a></li>' +
    '<li><a href="/services/branding-content.html">Branding &amp; Content</a></li>' +
    '<li><a href="/services/content-creation.html">Content Creation</a></li>' +
    '<li><a href="/services/video-editing.html">Video Editing</a></li>' +
    '<li><a href="/services/email-marketing.html">Email Marketing</a></li>' +
    '<li><a href="/services/web-development.html">Web Development</a></li>' +
    '<li><a href="/services/seo.html">SEO</a></li>' +
    '<li><a href="/services/lead-generation.html">Lead Generation</a></li>' +
    '<li><a href="/services/ecommerce-marketing.html">E-commerce Marketing</a></li>' +
    '</ul></div>' +
    '<div class="footer-col"><h4>Contact</h4><ul class="footer-contact">' +
    '<li><i class="fas fa-envelope"></i> <a href="/contact.html" data-email="hello@ationic.agency" data-email-text>Email us</a></li>' +
    '<li><i class="fas fa-phone"></i> <a href="tel:+918680060912">+91 86800 60912</a></li>' +
    '<li><i class="fab fa-whatsapp"></i> <a href="https://wa.me/918680060912" target="_blank" rel="noopener noreferrer nofollow">WhatsApp</a></li>' +
    '</ul></div>' +
    '</div>' +
    '<div class="footer-bottom">' +
    '<p>&copy; 2026 Ationic. All rights reserved.</p>' +
    '<div class="footer-legal"><a href="/privacy-policy.html">Privacy Policy</a><a href="/terms.html">Terms &amp; Conditions</a></div>' +
    '</div>' +
    '</div>' +
    '</footer>'
  );
}

function layout(opts) {
  const title = escapeHtml(opts.title);
  const description = escapeHtml(opts.description || '');
  const canonical = SITE_URL + opts.canonicalPath;
  const robots = opts.noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">';
  const ogType = opts.ogType || 'website';
  const articleMeta =
    (opts.articlePublished ? '<meta property="article:published_time" content="' + escapeHtml(opts.articlePublished) + '">\n' : '') +
    (opts.articleModified ? '<meta property="article:modified_time" content="' + escapeHtml(opts.articleModified) + '">\n<meta property="og:updated_time" content="' + escapeHtml(opts.articleModified) + '">\n' : '');
  const ogImage = opts.ogImage ? (opts.ogImage.startsWith('http') ? opts.ogImage : SITE_URL + opts.ogImage) : SITE_URL + '/images/og-image.jpg';
  const jsonLd = opts.jsonLd ? '<script type="application/ld+json">' + JSON.stringify(opts.jsonLd).replace(/</g, '\\u003c') + '</script>' : '';

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<meta name="theme-color" content="#0B0B0B">\n' +
    '<script src="/js/theme-init.js"></script>\n' +
    '<title>' + title + '</title>\n' +
    '<meta name="description" content="' + description + '">\n' +
    '<meta name="author" content="Ationic Digital Agency">\n' +
    robots + '\n' +
    '<link rel="canonical" href="' + escapeHtml(canonical) + '">\n' +
    '<link rel="icon" href="/images/A.png" type="image/png">\n' +
    '<meta property="og:title" content="' + title + '">\n' +
    '<meta property="og:description" content="' + description + '">\n' +
    '<meta property="og:url" content="' + escapeHtml(canonical) + '">\n' +
    '<meta property="og:type" content="' + ogType + '">\n' +
    '<meta property="og:site_name" content="Ationic">\n' +
    '<meta property="og:image" content="' + escapeHtml(ogImage) + '">\n' +
    articleMeta +
    '<meta name="twitter:card" content="summary_large_image">\n' +
    '<meta name="twitter:title" content="' + title + '">\n' +
    '<meta name="twitter:description" content="' + description + '">\n' +
    '<meta name="twitter:image" content="' + escapeHtml(ogImage) + '">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">\n' +
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">\n' +
    '<link rel="stylesheet" href="/css/style.css">\n' +
    '<link rel="stylesheet" href="/css/blog.css">\n' +
    '<link rel="alternate" type="application/rss+xml" title="Ationic Blog RSS" href="' + SITE_URL + '/blog/rss.xml">\n' +
    jsonLd + '\n' +
    '<script src="/js/analytics.js" defer data-clarity-off></script>\n' +
    '</head>\n<body class="blog-body">\n' +
    nav(opts.active || 'blog') +
    '<main>\n' + opts.content + '\n</main>\n' +
    footer() +
    '<script src="/js/enhancements.js" defer></script>\n' +
    '<script src="/js/theme.js" defer></script>\n' +
    '<script src="/js/script.js" defer></script>\n' +
    '</body>\n</html>';
}

function postCard(post) {
  const url = '/blog/' + encodeURIComponent(post.slug) + '/';
  const cover = post.coverImage
    ? '<img src="' + escapeHtml(post.coverImage) + '" alt="' + escapeHtml(post.coverAlt || '') + '" loading="lazy" decoding="async">'
    : '<div class="post-card__placeholder"><i class="fas fa-feather-alt"></i></div>';
  const date = post.publishedAt || post.createdAt;
  return (
    '<article class="post-card">' +
    '<a class="post-card__media" href="' + url + '" aria-hidden="true" tabindex="-1">' + cover + '</a>' +
    '<div class="post-card__body">' +
    (post.category ? '<a class="post-card__tag" href="/blog/category/' + escapeHtml(post.category) + '/">' + escapeHtml((post.categoryLabel || post.category)) + '</a>' : '') +
    '<h2 class="post-card__title"><a href="' + url + '">' + escapeHtml(post.title) + '</a></h2>' +
    '<p class="post-card__excerpt">' + escapeHtml(post.excerpt || '') + '</p>' +
    '<div class="post-card__meta">' +
    '<time datetime="' + escapeHtml(date) + '">' + escapeHtml(formatDate(date)) + '</time>' +
    '<span aria-hidden="true">&middot;</span><span>' + readingMinutes(post.bodyHtml) + ' min read</span>' +
    '</div>' +
    '</div>' +
    '</article>'
  );
}

function pagination(page, totalPages, basePath) {
  if (totalPages <= 1) return '';
  const base = basePath.endsWith('/') ? basePath : basePath + '/';
  const part = (label, target, current, disabled) => {
    const cls = 'page-btn' + (current ? ' page-btn--current' : '') + (disabled ? ' page-btn--disabled' : '');
    if (disabled) return '<span class="' + cls + '" aria-disabled="true">' + label + '</span>';
    const href = target === 1 ? base : base + 'page/' + target + '/';
    return '<a class="' + cls + '" href="' + href + '"' + (current ? ' aria-current="page"' : '') + '>' + label + '</a>';
  };
  let html = '<nav class="pagination" aria-label="Blog pages">';
  html += part('\u2039 Prev', Math.max(1, page - 1), false, page === 1);
  for (let p = 1; p <= totalPages; p++) html += part(String(p), p, p === page, false);
  html += part('Next \u203A', Math.min(totalPages, page + 1), false, page === totalPages);
  html += '</nav>';
  return html;
}

module.exports = { layout, postCard, pagination, SITE_URL };
