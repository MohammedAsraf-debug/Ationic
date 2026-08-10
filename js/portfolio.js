/* ── Portfolio Data — Ationic Showcase Projects ── */
const portfolioData = [
  {
    id: 1,
    title: 'Luxury Restaurant',
    category: 'web-design',
    categoryLabel: 'Web Design',
    client: 'Le Château Noir',
    desc: 'Complete luxury restaurant website with online reservations, interactive menu, chef showcase, and event booking.',
    fullDesc: 'A premium dark-themed website for Le Château Noir, a Michelin-starred Parisian restaurant. Features online reservation system, categorized menu with dietary filters, chef biography with accolades, gallery with lightbox, event booking, and full contact information.',
    image: 'images/portfolio/luxury-restaurant.jpg',
    url: 'showcase-projects/luxury-restaurant/index.html',
    github: null,
    caseStudy: 'showcase-projects/luxury-restaurant/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Google Maps API', 'Google Fonts', 'Font Awesome', 'Parallax Scrolling'],
    results: [
      { label: 'Sections', value: '8' },
      { label: 'Menu Items', value: '32' },
      { label: 'Theme', value: 'Dark Luxury' },
      { label: 'Responsive', value: 'Yes' }
    ],
    problem: 'Le Château Noir needed a premium digital presence matching their Michelin-starred reputation, with online reservations and menu management.',
    solution: 'Built a dark luxury website with parallax scrolling, interactive menu filtering, reservation system, and gallery lightbox — all reflecting the restaurant\'s sophisticated brand.'
  },
  {
    id: 2,
    title: 'Dental Clinic',
    category: 'web-design',
    categoryLabel: 'Web Design',
    client: 'BrightSmile Dental',
    desc: 'Professional dental clinic website with appointment booking, doctor profiles, treatment listings, and insurance info.',
    fullDesc: 'A clean, professional website for BrightSmile Dental Clinic featuring online appointment scheduling, detailed doctor profiles with credentials, comprehensive treatment listings with pricing, insurance provider showcase, patient reviews, and emergency contact banner.',
    image: 'images/portfolio/dental-clinic.jpg',
    url: 'showcase-projects/dental-clinic/index.html',
    github: null,
    caseStudy: 'showcase-projects/dental-clinic/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Google Maps API', 'Google Fonts', 'Font Awesome', 'Responsive Framework'],
    results: [
      { label: 'Doctors', value: '3' },
      { label: 'Treatments', value: '8' },
      { label: 'Insurance', value: '10+' },
      { label: 'Reviews', value: '8' }
    ],
    problem: 'BrightSmile Dental needed a trustworthy online presence that made booking appointments easy and showcased their medical expertise.',
    solution: 'Designed a clean, professional website with an integrated appointment system, detailed doctor profiles, treatment pricing transparency, and insurance information to build patient trust.'
  },
  {
    id: 3,
    title: 'Prestige Properties',
    category: 'web-dev',
    categoryLabel: 'Web Development',
    client: 'Prestige Properties',
    desc: 'Full-featured real estate website with property listings, search filters, mortgage calculator, and agent profiles.',
    fullDesc: 'A comprehensive real estate platform for Prestige Properties featuring 12 property listings with filtering by type, price, bedrooms, and amenities. Includes an interactive mortgage calculator with amortization, 6 agent profiles with ratings and contact, property detail modals, and a full contact system.',
    image: 'images/portfolio/real-estate.jpg',
    url: 'showcase-projects/real-estate/index.html',
    github: null,
    caseStudy: 'showcase-projects/real-estate/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Google Maps API', 'Google Fonts', 'Font Awesome', 'Mortgage Calculator API'],
    results: [
      { label: 'Listings', value: '12' },
      { label: 'Agents', value: '6' },
      { label: 'Filters', value: '6 Types' },
      { label: 'Calculator', value: 'Mortgage' }
    ],
    problem: 'Prestige Properties needed a modern real estate platform that made property discovery easy and provided tools for buyers to make informed decisions.',
    solution: 'Built a feature-rich real estate website with advanced search filters, interactive mortgage calculator, agent showcase, and detailed property pages with all relevant information at buyers\' fingertips.'
  },
  {
    id: 4,
    title: 'Iron Forge Fitness',
    category: 'web-design',
    categoryLabel: 'Web Design',
    client: 'Iron Forge Fitness',
    desc: 'Modern gym website with membership plans, BMI calculator, trainer profiles, transformation gallery, and class schedule.',
    fullDesc: 'An athletic-themed website for Iron Forge Fitness featuring three membership tiers with feature comparison, BMI calculator with health tips, 6 trainer profiles with certifications, before/after transformation gallery, weekly class schedule, and contact system. Dark neon-accent design with particle effects.',
    image: 'images/portfolio/gym-fitness.jpg',
    url: 'showcase-projects/gym-fitness/index.html',
    github: null,
    caseStudy: 'showcase-projects/gym-fitness/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Particle.js', 'Google Fonts', 'Font Awesome', 'Canvas API'],
    results: [
      { label: 'Membership Plans', value: '3' },
      { label: 'Trainers', value: '6' },
      { label: 'Classes/Week', value: '50+' },
      { label: 'Members', value: '5000+' }
    ],
    problem: 'Iron Forge Fitness needed a high-energy website that drove membership sign-ups and showcased their facilities, trainers, and community.',
    solution: 'Created an immersive athletic-themed website with membership comparison, interactive BMI tool, trainer showcases, and a dynamic class schedule to convert visitors into members.'
  },
  {
    id: 5,
    title: 'Atlas Construction Group',
    category: 'web-dev',
    categoryLabel: 'Web Development',
    client: 'Atlas Construction Group',
    desc: 'Industrial construction company website with project portfolio, services, timeline, and safety certifications.',
    fullDesc: 'A robust industrial-themed website for Atlas Construction Group featuring 8 completed projects with category filters, 6 detailed service pages, company history timeline from 1995 to present, safety statistics and certifications, 8 industry sectors served, and a project inquiry form.',
    image: 'images/portfolio/construction.jpg',
    url: 'showcase-projects/construction/index.html',
    github: null,
    caseStudy: 'showcase-projects/construction/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Google Maps API', 'Google Fonts', 'Font Awesome', 'Timeline.js'],
    results: [
      { label: 'Projects', value: '200+' },
      { label: 'Years', value: '29' },
      { label: 'States', value: '15' },
      { label: 'Safety', value: 'Zero Incidents' }
    ],
    problem: 'Atlas Construction needed a website that established credibility, showcased their portfolio, and communicated their safety-first culture to potential clients.',
    solution: 'Developed a comprehensive industrial website with project portfolio filtering, company timeline, safety certifications showcase, and an easy project inquiry system that drives qualified leads.'
  },
  {
    id: 6,
    title: 'Velour Boutique',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce',
    client: 'Velour Boutique',
    desc: 'Premium fashion e-commerce website with product listings, cart, wishlist, and 3-step checkout — frontend only.',
    fullDesc: 'A complete frontend fashion e-commerce experience for Velour Boutique featuring 24 products with category/price/size/color filters, product detail pages with image gallery and size selector, wishlist management with localStorage, shopping cart with promo code support, and a 3-step checkout process with order confirmation.',
    image: 'images/portfolio/ecommerce-fashion.jpg',
    url: 'showcase-projects/ecommerce-fashion/index.html',
    github: null,
    caseStudy: 'showcase-projects/ecommerce-fashion/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'localStorage API', 'Google Fonts', 'Font Awesome', 'Flexbox Grid'],
    results: [
      { label: 'Products', value: '24' },
      { label: 'Categories', value: '4' },
      { label: 'Filters', value: '5 Types' },
      { label: 'Checkout Steps', value: '3' }
    ],
    problem: 'Velour Boutique needed an elegant online store that provided a seamless shopping experience with modern e-commerce features.',
    solution: 'Built a complete frontend e-commerce experience with advanced filtering, wishlist and cart persistence, promotional code engine, and a polished 3-step checkout flow.'
  },
  {
    id: 7,
    title: 'Google Ads Landing Page',
    category: 'marketing',
    categoryLabel: 'Marketing',
    client: 'GrowthStream Media',
    desc: 'High-converting Google Ads management landing page with ROI calculator, lead generation form, and pricing tiers.',
    fullDesc: 'A conversion-optimized landing page for GrowthStream Media\'s Google Ads management service. Features a lead capture form with industry and budget targeting, 3 pricing tiers with feature comparison, an interactive ROI calculator, 5-step process, benefits with statistics, case study snippets, trust badges, and urgency elements.',
    image: 'images/portfolio/google-ads-landing.jpg',
    url: 'showcase-projects/google-ads-landing/index.html',
    github: null,
    caseStudy: 'showcase-projects/google-ads-landing/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Google Analytics', 'Google Fonts', 'Font Awesome', 'A/B Testing'],
    results: [
      { label: 'Conversion Rate', value: 'Optimized' },
      { label: 'Tiers', value: '3' },
      { label: 'ROAS Target', value: '5x' },
      { label: 'Trust Badges', value: '5+' }
    ],
    problem: 'GrowthStream Media needed a dedicated landing page for their Google Ads service that captured qualified leads and demonstrated expertise through data and social proof.',
    solution: 'Designed a conversion-focused landing page with strategic lead form placement, ROI calculator for instant value demonstration, and comprehensive trust-building elements throughout the buyer journey.'
  },
  {
    id: 8,
    title: 'Meta Ads Landing Page',
    category: 'marketing',
    categoryLabel: 'Marketing',
    client: 'SocialPulse Agency',
    desc: 'Professional Meta Ads marketing landing page with creative showcase, audience strategies, and campaign process.',
    fullDesc: 'A visually rich landing page for SocialPulse Agency\'s Meta Ads solutions featuring 6 ad creative mockups (image, carousel, video, collection, stories, messenger), 4 audience targeting strategies, 6-step campaign process, animated result counters (500+ campaigns, 15M+ impressions), 5 client testimonials with slider, and 3 pricing tiers.',
    image: 'images/portfolio/meta-ads-landing.jpg',
    url: 'showcase-projects/meta-ads-landing/index.html',
    github: null,
    caseStudy: 'showcase-projects/meta-ads-landing/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Meta Pixel', 'Google Fonts', 'Font Awesome', 'AOS Library'],
    results: [
      { label: 'Campaigns', value: '500+' },
      { label: 'Impressions', value: '15M+' },
      { label: 'Avg ROAS', value: '4.8x' },
      { label: 'Clients', value: '200+' }
    ],
    problem: 'SocialPulse Agency needed a dedicated landing page to showcase their Meta advertising expertise and convert social media leads into clients.',
    solution: 'Created an engaging landing page with creative ad mockups, detailed audience strategy breakdown, transparent pricing, and compelling results data to build trust and drive conversions.'
  },
  {
    id: 9,
    title: 'SEO Audit Dashboard',
    category: 'saas',
    categoryLabel: 'SaaS',
    client: 'SearchMetrics Inc',
    desc: 'Interactive SEO audit tool that generates demo scores for SEO, performance, accessibility, and technical analysis.',
    fullDesc: 'A fully interactive SEO audit dashboard that simulates a real website audit. Generates scores across SEO (72/100), Performance (65/100), Accessibility (88/100), and Best Practices (79/100) with animated progress rings. Analyzes Core Web Vitals, technical SEO crawl stats, meta tags, heading structure, schema markup, and image optimization. Delivers 10+ prioritized recommendations.',
    image: 'images/portfolio/seo-audit-dashboard.jpg',
    url: 'showcase-projects/seo-audit-dashboard/index.html',
    github: null,
    caseStudy: 'showcase-projects/seo-audit-dashboard/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'SVG Charts', 'Google Fonts', 'Font Awesome', 'Intersection Observer'],
    results: [
      { label: 'Audit Categories', value: '4' },
      { label: 'Analyses', value: '10+' },
      { label: 'Recommendations', value: '10+' },
      { label: 'Vitals Checked', value: 'CWV' }
    ],
    problem: 'Businesses needed a quick, visual way to understand their website\'s SEO health without running complex technical tools.',
    solution: 'Built an interactive dashboard that presents comprehensive SEO audit data in a visually accessible format with color-coded scores, detailed breakdowns, and actionable recommendations.'
  },
  {
    id: 10,
    title: 'Technical SEO Report',
    category: 'saas',
    categoryLabel: 'SaaS',
    client: 'RankBoost Agency',
    desc: 'Professional PDF-style SEO audit report with charts, issue categorization, and prioritized recommendations.',
    fullDesc: 'A professional web-based SEO audit report designed to look like a printed PDF document. Features executive summary with score gauge (68/100), category scores with radar chart, 12 issues across 4 severity levels (Critical, High, Medium, Low), detailed issue cards with effort estimates and impact scores, and 10 prioritized recommendations. Print-friendly CSS makes it PDF-ready.',
    image: 'images/portfolio/technical-seo-report.jpg',
    url: 'showcase-projects/technical-seo-report/index.html',
    github: null,
    caseStudy: 'showcase-projects/technical-seo-report/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'SVG Charts', 'Google Fonts', 'Font Awesome', 'Print CSS'],
    results: [
      { label: 'Issues Analyzed', value: '12' },
      { label: 'Severity Levels', value: '4' },
      { label: 'Recommendations', value: '10' },
      { label: 'Print Ready', value: 'Yes' }
    ],
    problem: 'SEO professionals needed a clear, professional way to present audit findings to clients in a format that looked authoritative and was easy to understand.',
    solution: 'Designed a professional report-style web page with visual data representation (gauges, charts, radar), categorized issues with severity indicators, and print-optimized CSS for PDF export.'
  },
  {
    id: 11,
    title: 'SaaS Analytics Dashboard',
    category: 'saas',
    categoryLabel: 'SaaS',
    client: 'CloudMetrics Inc',
    desc: 'Modern analytics dashboard with revenue charts, user growth tracking, invoices, projects, and dark/light mode.',
    fullDesc: 'A production-quality SaaS analytics dashboard featuring real-time revenue line chart with Canvas rendering and gradient fill, user growth area chart with projections, 10-row invoice table with search/filter, 6 project cards with animated progress bars, user activity feed, subscription breakdown donut chart, and full dark/light theme toggle.',
    image: 'images/portfolio/saas-dashboard.jpg',
    url: 'showcase-projects/saas-dashboard/index.html',
    github: null,
    caseStudy: 'showcase-projects/saas-dashboard/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'Google Fonts', 'Font Awesome', 'CSS Variables'],
    results: [
      { label: 'Charts', value: '3' },
      { label: 'Theme', value: 'Dark/Light' },
      { label: 'MRR', value: '$42.3K' },
      { label: 'Users', value: '12.8K' }
    ],
    problem: 'SaaS companies needed a clean, comprehensive dashboard to monitor key metrics, track growth, and manage operations.',
    solution: 'Developed a feature-rich analytics dashboard with interactive Canvas charts, dark/light theme support, invoice management, and real-time data visualizations.'
  },
  {
    id: 12,
    title: 'HR Management Dashboard',
    category: 'saas',
    categoryLabel: 'SaaS',
    client: 'PeopleFirst HR',
    desc: 'Complete HR dashboard with employee directory, attendance tracking, leave management, payroll, and calendar.',
    fullDesc: 'A full-featured HR management dashboard for Atlas HR Portal featuring 342 employee directory with dual-filter (department, status), weekly attendance bar charts, leave management system with approve/reject actions, payroll departmental breakdown with bars, interactive monthly calendar with birthdays and events, and 4 report types with preview generation.',
    image: 'images/portfolio/hr-dashboard.jpg',
    url: 'showcase-projects/hr-dashboard/index.html',
    github: null,
    caseStudy: 'showcase-projects/hr-dashboard/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'Google Fonts', 'Font Awesome', 'Calendar API'],
    results: [
      { label: 'Employees', value: '342' },
      { label: 'Departments', value: '6' },
      { label: 'Report Types', value: '4' },
      { label: 'Theme', value: 'Teal/Dark' }
    ],
    problem: 'HR departments needed a centralized dashboard to manage employees, track attendance, process leave requests, and generate reports efficiently.',
    solution: 'Built a comprehensive HR dashboard with employee management, attendance tracking, leave workflow with approvals, payroll visualization, and multi-format report generation.'
  },
  {
    id: 13,
    title: 'Finance Control Dashboard',
    category: 'saas',
    categoryLabel: 'SaaS',
    client: 'FinControl',
    desc: 'Financial analytics dashboard with income/expense tracking, profit trends, invoices, and budget monitoring.',
    fullDesc: 'A comprehensive finance dashboard for FinControl featuring income vs expenses grouped bar chart, profit trend line chart with 3-month projection, expense breakdown donut chart, 15 searchable transactions, 8 invoices with status actions, 4 financial ratios, and 6-department budget vs actual tracking with variance indicators.',
    image: 'images/portfolio/finance-dashboard.jpg',
    url: 'showcase-projects/finance-dashboard/index.html',
    github: null,
    caseStudy: 'showcase-projects/finance-dashboard/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'SVG Charts', 'Google Fonts', 'Font Awesome', 'Data Export'],
    results: [
      { label: 'Charts', value: '5' },
      { label: 'Income', value: '$486K' },
      { label: 'Profit Margin', value: '35.7%' },
      { label: 'Export', value: 'PDF/CSV' }
    ],
    problem: 'Finance teams needed a clear dashboard to monitor income, expenses, profit trends, and budget adherence in real time.',
    solution: 'Created a data-rich finance dashboard with multiple chart types, transaction management, invoice tracking, budget monitoring, and export capabilities.'
  },
  {
    id: 14,
    title: 'Analytics Dashboard',
    category: 'saas',
    categoryLabel: 'SaaS',
    client: 'DataPulse Analytics',
    desc: 'Website analytics dashboard with visitor tracking, traffic sources, conversion funnels, and heatmap mockups.',
    fullDesc: 'An analytics dashboard for InsightPro featuring 30-day visitor area chart with previous period comparison, traffic sources by channel, device and geographic breakdowns, conversions tracking with table, 4-step funnel visualization with drop-off rates, 3 heatmap mockups with click intensity, 6 report types, and simulated real-time visitor counter.',
    image: 'images/portfolio/analytics-dashboard.jpg',
    url: 'showcase-projects/analytics-dashboard/index.html',
    github: null,
    caseStudy: 'showcase-projects/analytics-dashboard/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'Google Fonts', 'Font Awesome', 'Chart.js'],
    results: [
      { label: 'Visitors/Month', value: '84.7K' },
      { label: 'Charts', value: '6' },
      { label: 'Funnel Steps', value: '4' },
      { label: 'Reports', value: '6' }
    ],
    problem: 'Marketing teams needed a comprehensive analytics dashboard to track website performance, understand user behavior, and optimize conversion funnels.',
    solution: 'Developed a full analytics suite with traffic analysis, conversion funnel optimization, heatmap visualization, and real-time monitoring capabilities.'
  },
  {
    id: 15,
    title: 'Brand Identity Showcase',
    category: 'branding',
    categoryLabel: 'Branding',
    client: 'Studio Creativo',
    desc: 'Complete brand identity presentation with logo variations, typography, color palette, mockups, and guidelines.',
    fullDesc: 'A comprehensive brand identity showcase for Studio Creativo. Features animated SVG logo reveal, 5 logo variations with light/dark display, full typography scale with Playfair Display and Inter, 12-color palette with click-to-copy hex values, 3D flip business card, letterhead and envelope mockups, 3 packaging designs, 6 social media post concepts, and brand guidelines preview.',
    image: 'images/portfolio/branding-showcase.jpg',
    url: 'showcase-projects/branding-showcase/index.html',
    github: null,
    caseStudy: 'showcase-projects/branding-showcase/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'SVG Animation', 'Google Fonts', 'Font Awesome', 'CSS 3D Transforms'],
    results: [
      { label: 'Logo Variations', value: '5' },
      { label: 'Colors', value: '12' },
      { label: 'Mockups', value: '8+' },
      { label: 'Social Designs', value: '6' }
    ],
    problem: 'Clients need to visualize their complete brand identity before committing — logos alone don\'t convey the full brand experience.',
    solution: 'Built an immersive brand identity showcase demonstrating logos, typography, colors, stationery, packaging, and social media in one cohesive presentation.'
  },
  {
    id: 16,
    title: 'Social Media Campaign',
    category: 'marketing',
    categoryLabel: 'Marketing',
    client: 'BrandWave Media',
    desc: 'Complete social media campaign showcase with Instagram feed, Facebook ads, stories, reels, and results dashboard.',
    fullDesc: 'A full campaign showcase for Project Aura featuring 9 Instagram feed posts with content type filters, 4 Facebook ad variations with A/B test results, 6 interactive story mockups (poll, question, countdown), 4 Reel showcases with engagement stats, 28-day content calendar with pillar color-coding, and detailed results dashboard with follower growth chart and audience demographics.',
    image: 'images/portfolio/social-media-campaign.jpg',
    url: 'showcase-projects/social-media-campaign/index.html',
    github: null,
    caseStudy: 'showcase-projects/social-media-campaign/index.html',
    date: 'July 2026',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Masonry Layout', 'Google Fonts', 'Font Awesome', 'Calendar Grid'],
    results: [
      { label: 'Impressions', value: '2.4M' },
      { label: 'Engagements', value: '890K' },
      { label: 'ROAS', value: '340%' },
      { label: 'New Followers', value: '50K' }
    ],
    problem: 'Brands struggled to visualize the full scope of a social media campaign — from creative concepts to content calendar to post-campaign analytics.',
    solution: 'Created a comprehensive campaign showcase that walks through strategy, content creation, ad management, and results analysis in one seamless experience.'
  }
];

/* ── Render Portfolio Cards ── */
function renderPortfolio(projects) {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  grid.innerHTML = '';
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'portfolio-card reveal-fade-up';
    card.dataset.category = project.category;
    card.dataset.id = project.id;
    card.innerHTML = `
      <div class="portfolio-card__image">
        <img src="${project.image}" alt="${project.title}" class="portfolio-card__img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="portfolio-card__placeholder">
          <i class="fas fa-image"></i>
        </div>
        <div class="portfolio-card__overlay">
          <button class="portfolio-card__overlay-btn" data-id="${project.id}">View Project <i class="fas fa-eye"></i></button>
        </div>
      </div>
      <div class="portfolio-card__body">
        <span class="portfolio-card__badge">${project.categoryLabel}</span>
        <h3 class="portfolio-card__title">${project.title}</h3>
        <p class="portfolio-card__desc">${project.desc}</p>
        <div class="portfolio-card__tech">
          ${project.tech.slice(0, 4).map(t => `<span>${t}</span>`).join('')}
          ${project.tech.length > 4 ? `<span>+${project.tech.length - 4}</span>` : ''}
        </div>
        <div class="portfolio-card__actions">
          ${project.url ? `<a href="${project.url}" class="btn btn-outline btn-sm" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
          <a href="javascript:void(0)" class="btn btn-primary btn-sm" onclick="event.stopPropagation();openModal(${project.id})"><i class="fas fa-search"></i> Case Study</a>
          ${project.github ? `<a href="${project.github}" class="btn btn-outline btn-sm" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i></a>` : ''}
        </div>
      </div>
    `;
    card.addEventListener('click', () => openModal(project.id));
    grid.appendChild(card);
  });
  observeReveal();
}

/* ── Filter Logic ── */
function initFilter() {
  const filterBtns = document.querySelectorAll('.portfolio-filter__btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const cards = document.querySelectorAll('.portfolio-card');
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('filter-hide');
          card.classList.add('filter-show');
          card.style.position = '';
          card.style.visibility = '';
          card.style.opacity = '';
        } else {
          card.classList.add('filter-hide');
          card.classList.remove('filter-show');
        }
      });
    });
  });
}

/* ── Modal ── */
function openModal(id) {
  const project = portfolioData.find(p => p.id === id);
  if (!project) return;
  const modal = document.getElementById('portfolioModal');
  const body = document.getElementById('modalBody');
  document.body.style.overflow = 'hidden';

  body.innerHTML = `
    <div class="modal-hero" style="overflow:hidden;position:relative">
      <img src="${project.image}" alt="${project.title}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:4rem;color:var(--black-4);background:linear-gradient(135deg,var(--black-3),var(--black-4))"><i class="fas fa-image"></i></div>
      <span class="modal-hero__badge">${project.categoryLabel}</span>
    </div>
    <div class="modal-info">
      <h2>${project.title}</h2>
      <div class="modal-info__meta">
        <span><i class="fas fa-building"></i> ${project.client}</span>
        <span><i class="fas fa-tag"></i> ${project.categoryLabel}</span>
        <span><i class="fas fa-calendar"></i> ${project.date}</span>
      </div>
      <div class="modal-info__section">
        <h4>Problem</h4>
        <p>${project.problem}</p>
      </div>
      <div class="modal-info__section">
        <h4>Solution</h4>
        <p>${project.solution}</p>
      </div>
      <div class="modal-info__section">
        <h4>Technologies</h4>
        <div class="modal-tech">
          ${project.tech.map(t => `<span>${t}</span>`).join('')}
        </div>
      </div>
      <div class="modal-info__section">
        <h4>Business Impact</h4>
        <div class="modal-impact">
          ${project.results.map(r => `
            <div class="modal-impact__card">
              <i class="fas fa-chart-line"></i>
              <h5>${r.value}</h5>
              <p>${r.label}</p>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="modal-actions">
        ${project.url ? `<a href="${project.url}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Visit Website <i class="fas fa-external-link-alt"></i></a>` : ''}
        <a href="${project.caseStudy || '#'}" class="btn btn-outline" target="_blank" rel="noopener noreferrer">Full Case Study <i class="fas fa-arrow-right"></i></a>
        <button class="btn btn-outline" onclick="closeModal()">Close <i class="fas fa-times"></i></button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('portfolioModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ── Testimonial Slider ── */
function initTestimonials() {
  const dots = document.querySelectorAll('.portfolio-testimonials__dot');
  const track = document.getElementById('testimonialTrack');
  const slides = track?.querySelectorAll('.portfolio-testimonial');
  if (!dots.length || !slides.length) return;

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      const idx = parseInt(dot.dataset.slide);
      slides.forEach((slide, i) => {
        slide.style.opacity = i === idx ? '1' : '0';
        slide.style.transform = i === idx ? 'translateX(0)' : 'translateX(30px)';
      });
    });
  });

  slides.forEach((slide, i) => {
    slide.style.opacity = i === 0 ? '1' : '0';
    slide.style.transform = i === 0 ? 'translateX(0)' : 'translateX(30px)';
    slide.style.transition = 'all 0.5s var(--ease-out)';
  });
}

/* ── Reveal Observer ── */
function observeReveal() {
  const els = document.querySelectorAll('.reveal-fade-up, .reveal-slide-left, .reveal-slide-right, .reveal-stagger');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
}

/* ── Stat Counter Animation ── */
function animateStats() {
  const stat = document.querySelector('.portfolio-hero__stat-num[data-count]');
  if (!stat) return;
  const target = parseInt(stat.dataset.count);
  let current = 0;
  const step = Math.ceil(target / 40);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    stat.textContent = current + '+';
  }, 40);
}

/* ── Button Ripple ── */
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.classList.add('btn-ripple');
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      ripple.style.cssText = `
        position: absolute;
        width: 0; height: 0;
        left: ${e.clientX - rect.left}px;
        top: ${e.clientY - rect.top}px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
      `;
      this.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transition = 'all 0.6s cubic-bezier(0.16,1,0.3,1)';
        ripple.style.width = '300px';
        ripple.style.height = '300px';
        ripple.style.opacity = '0';
      });
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/* ── Modal Close Events ── */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('portfolioModal');
  const bg = document.getElementById('modalBg');
  const close = document.getElementById('modalClose');

  bg?.addEventListener('click', closeModal);
  close?.addEventListener('click', closeModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  renderPortfolio(portfolioData);
  initFilter();
  initTestimonials();
  initRipple();
  animateStats();

  const filterBtns = document.querySelectorAll('.portfolio-filter__btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(observeReveal, 300);
    });
  });
});
