"use strict";const{escapeHtml,formatDate,readingMinutes}=require("./util"),SITE_URL=(process.env.SITE_URL||"https://ationic.agency").replace(/\/+$/,"");function nav(e){const a=(t,n,r)=>'<li><a href="'+t+'" class="nav-link'+(e===r?" active":"")+'">'+n+"</a></li>";return'<header class="navbar" id="navbar"><div class="container nav-container"><a href="/" class="logo">Ationic<span class="logo-accent">.</span></a><nav class="nav-menu" id="nav-menu"><ul>'+a("/","Home","home")+a("/services.html","Services","services")+a("/portfolio.html","Portfolio","portfolio")+a("/blog/","Blog","blog")+a("/about.html","About","about")+a("/contact.html","Contact","contact")+'</ul></nav><div class="nav-actions"><a href="/contact.html" class="btn btn-primary btn-sm">Free Consultation</a><button type="button" class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false"><span class="bar"></span><span class="bar"></span><span class="bar"></span></button></div></div></header>'}function footer(){return'<footer class="footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><a href="/" class="logo">Ationic<span class="logo-accent">.</span></a><p>Digital marketing agency helping businesses grow with performance-driven strategies, creative content, and modern websites.</p><div class="footer-social"><a href="https://www.facebook.com/ationic" target="_blank" rel="noopener noreferrer nofollow" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a><a href="https://www.instagram.com/ationic_it/" target="_blank" rel="noopener noreferrer nofollow" aria-label="Instagram"><i class="fab fa-instagram"></i></a><a href="https://www.linkedin.com/company/ationic" target="_blank" rel="noopener noreferrer nofollow" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a><a href="https://x.com/Ationic_it" target="_blank" rel="noopener noreferrer nofollow" aria-label="Twitter"><i class="fab fa-x-twitter"></i></a></div></div><div class="footer-col"><h4>Quick Links</h4><ul><li><a href="/">Home</a></li><li><a href="/about.html">About Us</a></li><li><a href="/services.html">Services</a></li><li><a href="/portfolio.html">Portfolio</a></li><li><a href="/blog/">Blog</a></li><li><a href="/contact.html">Contact</a></li></ul></div><div class="footer-col"><h4>Services</h4><ul><li><a href="/services/performance-marketing.html">Performance Marketing</a></li><li><a href="/services/meta-ads.html">Meta Ads</a></li><li><a href="/services/google-ads.html">Google Ads</a></li><li><a href="/services/social-media-marketing.html">Social Media Marketing</a></li><li><a href="/services/branding-content.html">Branding &amp; Content</a></li><li><a href="/services/content-creation.html">Content Creation</a></li><li><a href="/services/video-editing.html">Video Editing</a></li><li><a href="/services/email-marketing.html">Email Marketing</a></li><li><a href="/services/web-development.html">Web Development</a></li><li><a href="/services/seo.html">SEO</a></li><li><a href="/services/lead-generation.html">Lead Generation</a></li><li><a href="/services/ecommerce-marketing.html">E-commerce Marketing</a></li></ul></div><div class="footer-col"><h4>Contact</h4><ul class="footer-contact"><li><i class="fas fa-envelope"></i> <a href="/contact.html" data-email="hello@ationic.agency" data-email-text>Email us</a></li><li><i class="fas fa-phone"></i> <a href="tel:+918680060912">+91 86800 60912</a></li><li><i class="fab fa-whatsapp"></i> <a href="https://wa.me/918680060912" target="_blank" rel="noopener noreferrer nofollow">WhatsApp</a></li></ul></div></div><div class="footer-bottom"><p>&copy; 2026 Ationic. All rights reserved.</p><div class="footer-legal"><a href="/privacy-policy.html">Privacy Policy</a><a href="/terms.html">Terms &amp; Conditions</a></div></div></div></footer>'}function layout(e){const a=escapeHtml(e.title),t=escapeHtml(e.description||""),n=SITE_URL+e.canonicalPath,r=e.noindex?'<meta name="robots" content="noindex, nofollow">':'<meta name="robots" content="index, follow">',o=e.ogType||"website",i=(e.articlePublished?'<meta property="article:published_time" content="'+escapeHtml(e.articlePublished)+`">
`:"")+(e.articleModified?'<meta property="article:modified_time" content="'+escapeHtml(e.articleModified)+`">
<meta property="og:updated_time" content="`+escapeHtml(e.articleModified)+`">
`:""),l=e.ogImage?e.ogImage.startsWith("http")?e.ogImage:SITE_URL+e.ogImage:SITE_URL+"/images/ationic.png",s=e.jsonLd?'<script type="application/ld+json">'+JSON.stringify(e.jsonLd).replace(/</g,"\\u003c")+"<\/script>":"";return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0B0B0B">
<title>`+a+`</title>
<meta name="description" content="`+t+`">
<meta name="author" content="Ationic Digital Agency">
`+r+`
<link rel="canonical" href="`+escapeHtml(n)+`">
<link rel="icon" href="/images/ationic.png" type="image/png">
<meta property="og:title" content="`+a+`">
<meta property="og:description" content="`+t+`">
<meta property="og:url" content="`+escapeHtml(n)+`">
<meta property="og:type" content="`+o+`">
<meta property="og:site_name" content="Ationic">
<meta property="og:image" content="`+escapeHtml(l)+`">
`+i+`<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="`+a+`">
<meta name="twitter:description" content="`+t+`">
<meta name="twitter:image" content="`+escapeHtml(l)+`">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/blog.css">
<link rel="alternate" type="application/rss+xml" title="Ationic Blog RSS" href="`+SITE_URL+`/blog/rss.xml">
`+s+`
<script async src="https://www.googletagmanager.com/gtag/js?id=G-JMY0RW5Z3X"><\/script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-JMY0RW5Z3X");<\/script>
</head>
<body class="blog-body">
`+nav(e.active||"blog")+`<main>
`+e.content+`
</main>
`+footer()+`<script src="/js/script.js" defer><\/script>
</body>
</html>`}function postCard(e){const a="/blog/"+encodeURIComponent(e.slug)+"/",t=e.coverImage?'<img src="'+escapeHtml(e.coverImage)+'" alt="'+escapeHtml(e.coverAlt||"")+'" loading="lazy" decoding="async">':'<div class="post-card__placeholder"><i class="fas fa-feather-alt"></i></div>',n=e.publishedAt||e.createdAt;return'<article class="post-card"><a class="post-card__media" href="'+a+'" aria-hidden="true" tabindex="-1">'+t+'</a><div class="post-card__body">'+(e.category?'<a class="post-card__tag" href="/blog/category/'+escapeHtml(e.category)+'/">'+escapeHtml(e.categoryLabel||e.category)+"</a>":"")+'<h2 class="post-card__title"><a href="'+a+'">'+escapeHtml(e.title)+'</a></h2><p class="post-card__excerpt">'+escapeHtml(e.excerpt||"")+'</p><div class="post-card__meta"><time datetime="'+escapeHtml(n)+'">'+escapeHtml(formatDate(n))+'</time><span aria-hidden="true">&middot;</span><span>'+readingMinutes(e.bodyHtml)+" min read</span></div></div></article>"}function pagination(e,a,t){if(a<=1)return"";const n=t.endsWith("/")?t:t+"/",r=(i,l,s,c)=>{const m="page-btn"+(s?" page-btn--current":"")+(c?" page-btn--disabled":"");if(c)return'<span class="'+m+'" aria-disabled="true">'+i+"</span>";const d=l===1?n:n+"page/"+l+"/";return'<a class="'+m+'" href="'+d+'"'+(s?' aria-current="page"':"")+">"+i+"</a>"};let o='<nav class="pagination" aria-label="Blog pages">';o+=r("\u2039 Prev",Math.max(1,e-1),!1,e===1);for(let i=1;i<=a;i++)o+=r(String(i),i,i===e,!1);return o+=r("Next \u203A",Math.min(a,e+1),!1,e===a),o+="</nav>",o}module.exports={layout,postCard,pagination,SITE_URL};
