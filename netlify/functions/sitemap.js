'use strict';

const store = require('./lib/store');

const STATIC_URLS = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/services.html', priority: '0.9', changefreq: 'monthly' },
  { path: '/portfolio.html', priority: '0.9', changefreq: 'monthly' },
  { path: '/about.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact.html', priority: '0.9', changefreq: 'monthly' },
  { path: '/privacy-policy.html', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms.html', priority: '0.3', changefreq: 'yearly' },
  { path: '/services/performance-marketing.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/meta-ads.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/google-ads.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/social-media-marketing.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/branding-content.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/content-creation.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/video-editing.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/email-marketing.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/web-development.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/seo.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/lead-generation.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/ecommerce-marketing.html', priority: '0.8', changefreq: 'monthly' },
  { path: '/case-studies/ationic-agency.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/bloom-cosmetics.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/bulk-mailer.html', priority: '0.5', changefreq: 'monthly' },
  { path: '/case-studies/construction-enterprise.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/delight-electricals.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/falling-pickaxe.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/four-tech.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/gamepodra-django.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/gamepodra-planner.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/gamepodra-ranks.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/gamepodra-store.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/ginger-pdf.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/hr-email.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/pdf-tools.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/student-management.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/case-studies/tropical-tourists.html', priority: '0.6', changefreq: 'monthly' },
  { path: '/showcase-projects/analytics-dashboard/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/branding-showcase/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/construction/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/dental-clinic/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/ecommerce-fashion/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/finance-dashboard/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/google-ads-landing/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/gym-fitness/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/hr-dashboard/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/luxury-restaurant/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/meta-ads-landing/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/real-estate/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/saas-dashboard/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/seo-audit-dashboard/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/social-media-campaign/index.html', priority: '0.4', changefreq: 'yearly' },
  { path: '/showcase-projects/technical-seo-report/index.html', priority: '0.4', changefreq: 'yearly' }
];

function xmlEscape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

exports.handler = async () => {
  try {
    const SITE_URL = (process.env.SITE_URL || 'https://ationic.agency').replace(/\/+$/, '');
    const today = new Date().toISOString().slice(0, 10);
    const urls = [];

    for (const u of STATIC_URLS) {
      urls.push('  <url><loc>' + SITE_URL + u.path + '</loc><lastmod>' + today + '</lastmod><changefreq>' + u.changefreq + '</changefreq><priority>' + u.priority + '</priority></url>');
    }

    urls.push('  <url><loc>' + SITE_URL + '/blog/</loc><lastmod>' + today + '</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>');

    const posts = (await store.listPosts())
      .filter((p) => p.status === 'published' && !(p.seo && p.seo.noindex))
      .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));

    for (const p of posts) {
      const lastmod = String(p.updatedAt || p.publishedAt || p.createdAt || today).slice(0, 10);
      urls.push('  <url><loc>' + SITE_URL + '/blog/' + encodeURIComponent(p.slug) + '/</loc><lastmod>' + xmlEscape(lastmod) + '</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>');
    }

    const seenCats = new Set();
    for (const p of posts) {
      if (!p.category || seenCats.has(p.category)) continue;
      seenCats.add(p.category);
      urls.push('  <url><loc>' + SITE_URL + '/blog/category/' + encodeURIComponent(p.category) + '/</loc><lastmod>' + today + '</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>');
    }

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
      body: xml
    };
  } catch (err) {
    console.error('[sitemap] error:', err && err.message);
    return { statusCode: 500, body: '' };
  }
};
