'use strict';

const projects = [
    { id: 1, name: 'Meridian Tower', location: 'New York, NY', date: 'Mar 2024', budget: '$120M', desc: 'A 52-story mixed-use commercial tower featuring a triple-height lobby, rooftop garden, and LEED Platinum certification. Home to Fortune 500 corporate headquarters and luxury retail spaces.', client: 'Meridian Properties', img: '\u{1F3E2}', category: 'Commercial', status: 'award' },
    { id: 2, name: 'Riverside Residences', location: 'Chicago, IL', date: 'Nov 2023', budget: '$85M', desc: 'A 340-unit luxury residential complex with resort-style amenities including a pool, fitness center, concierge services, and riverfront access across four interconnected buildings.', client: 'Riverside Development LLC', img: '\u{1F3D8}\uFE0F', category: 'Residential', status: 'completed' },
    { id: 3, name: 'St. Luke\'s Medical Center', location: 'Houston, TX', date: 'Aug 2023', budget: '$95M', desc: 'A 200-bed state-of-the-art hospital with advanced surgical suites, diagnostic imaging, emergency department, and outpatient clinics designed for patient-centered care.', client: 'St. Luke\'s Health System', img: '\u{1F3E5}', category: 'Commercial', status: 'award' },
    { id: 4, name: 'Lincoln Academy', location: 'Boston, MA', date: 'Jun 2023', budget: '$45M', desc: 'A 1,200-student K-12 campus with smart classrooms, performing arts center, athletic facilities, and sustainable design featuring geothermal heating and solar panels.', client: 'Lincoln School District', img: '\u{1F3EB}', category: 'Institutional', status: 'completed' },
    { id: 5, name: 'Bay Bridge Expansion', location: 'San Francisco, CA', date: 'Feb 2024', budget: '$210M', desc: 'A 1.8-mile bridge expansion adding four lanes, a pedestrian walkway, and seismic retrofitting using advanced cable-stayed design to withstand 8.0 magnitude earthquakes.', client: 'California DOT', img: '\u{1F309}', category: 'Infrastructure', status: 'completed' },
    { id: 6, name: 'Phoenix Industrial Park', location: 'Phoenix, AZ', date: 'Oct 2023', budget: '$65M', desc: 'A 500,000 sq ft industrial complex with manufacturing facilities, warehousing, distribution centers, and rail access, built on a 40-acre brownfield redevelopment site.', client: 'Phoenix Industrial Trust', img: '\u{1F3ED}', category: 'Infrastructure', status: 'completed' },
    { id: 7, name: 'The Grand Venezia Hotel', location: 'Miami, FL', date: 'Jan 2024', budget: '$150M', desc: 'A 5-star 280-room oceanfront hotel with ballroom, spa, infinity pools, fine dining restaurants, and a 10,000 sq ft rooftop event space with panoramic ocean views.', client: 'Venezia Hospitality Group', img: '\u{1F3E8}', category: 'Commercial', status: 'award' },
    { id: 8, name: 'National Sports Arena', location: 'Atlanta, GA', date: 'May 2024', budget: '$300M', desc: 'A 65,000-seat multipurpose stadium with retractable roof, premium suites, LED display systems, and sustainable operations targeting zero waste certification.', client: 'Metro Sports Authority', img: '\u{1F3DF}\uFE0F', category: 'Commercial', status: 'award' }
];

const services = [
    { icon: '\u{1F3D7}\uFE0F', title: 'General Contracting', desc: 'End-to-end construction management from site preparation through final commissioning. We coordinate all trades, manage budgets, and deliver on schedule.', steps: ['Pre-construction planning & estimating', 'Subcontractor procurement & management', 'Schedule & budget oversight', 'Quality control & inspections', 'Project closeout & handover'] },
    { icon: '\u{1F4D0}', title: 'Design-Build', desc: 'Integrated project delivery with a single point of responsibility. Our in-house design team collaborates with construction from day one for faster, cost-efficient results.', steps: ['Feasibility & site analysis', 'Conceptual & schematic design', 'Value engineering', 'Construction documentation', 'Permitting & approvals'] },
    { icon: '\u{1F4CA}', title: 'Project Management', desc: 'Expert oversight of schedule, budget, quality, and safety. Our PMs use industry-leading software to provide real-time reporting and proactive risk management.', steps: ['Project charter & team assembly', 'Detailed scheduling (CPM)', 'Budget & cost control', 'Risk assessment & mitigation', 'Progress reporting & communication'] },
    { icon: '\u{1F331}', title: 'Green Building (LEED)', desc: 'Sustainable construction certified by the USGBC. We specialize in LEED, WELL, and Net Zero Energy projects that reduce environmental impact and operating costs.', steps: ['Sustainability goal setting', 'Energy modeling & analysis', 'Sustainable material sourcing', 'Indoor environmental quality', 'LEED certification management'] },
    { icon: '\u{1F528}', title: 'Renovation & Restoration', desc: 'Breathing new life into existing structures. From historic preservation to modern adaptive reuse, we transform spaces while respecting their architectural heritage.', steps: ['Structural assessment & survey', 'Historic preservation planning', 'Selective demolition & abatement', 'Restoration & modernization', 'Certificate of occupancy'] },
    { icon: '\u{1F6E3}\uFE0F', title: 'Infrastructure Development', desc: 'Large-scale civil projects including roads, bridges, tunnels, utilities, and transit systems. We deliver public and private infrastructure that communities depend on.', steps: ['Route & site selection studies', 'Environmental impact assessment', 'Geotechnical investigation', 'Utility & drainage engineering', 'Construction & traffic management'] }
];

const industries = [
    { icon: '\u{1F3E5}', name: 'Healthcare', desc: 'Hospitals, clinics, medical offices, and specialized care facilities designed for patient well-being and operational efficiency.', example: 'St. Luke\'s Medical Center, 200-bed hospital' },
    { icon: '\u{1F4DA}', name: 'Education', desc: 'K-12 schools, university buildings, research labs, libraries, and student housing that inspire learning and collaboration.', example: 'Lincoln Academy, 1,200-student campus' },
    { icon: '\u{1F3E2}', name: 'Commercial', desc: 'Office towers, retail centers, hotels, and mixed-use developments that drive economic growth and community vitality.', example: 'Meridian Tower, 52-story commercial tower' },
    { icon: '\u{1F3E0}', name: 'Residential', desc: 'Luxury condominiums, apartment complexes, townhomes, and master-planned communities with premium amenities.', example: 'Riverside Residences, 340-unit complex' },
    { icon: '\u{1F3ED}', name: 'Industrial', desc: 'Manufacturing plants, warehouses, distribution centers, and industrial parks built for efficiency and scalability.', example: 'Phoenix Industrial Park, 500K sq ft' },
    { icon: '\u{1F37D}\uFE0F', name: 'Hospitality', desc: 'Hotels, resorts, restaurants, entertainment venues, and event spaces delivering exceptional guest experiences.', example: 'The Grand Venezia Hotel, 5-star resort' },
    { icon: '\u{1F3DB}\uFE0F', name: 'Government', desc: 'Federal, state, and municipal buildings, courthouses, public safety facilities, and civic infrastructure.', example: 'City Hall Annex, municipal office complex' },
    { icon: '\u{1F686}', name: 'Transportation', desc: 'Roads, bridges, tunnels, airports, transit stations, and logistics hubs connecting people and commerce.', example: 'Bay Bridge Expansion, 1.8-mile bridge' }
];

const timeline = [
    { year: 1995, title: 'Founded in New York City', desc: 'James Atlas Sr. establishes Atlas Construction Group with a single project and a vision to redefine quality in commercial construction.' },
    { year: 1998, title: 'First $10M Project Completed', desc: 'Completed the Madison Office Tower, marking our first eight-figure project and establishing our reputation for large-scale delivery.' },
    { year: 2001, title: 'Expansion to 5 States', desc: 'Opened regional offices in Chicago, Boston, Atlanta, and Houston, growing our footprint across the northeastern and southern United States.' },
    { year: 2004, title: 'Launched Design-Build Division', desc: 'Added in-house architectural and engineering services, enabling integrated project delivery and reducing client timelines by 20%.' },
    { year: 2007, title: '100th Project Milestone', desc: 'Celebrated our 100th completed project with a company-wide initiative to donate 1% of profits to building trades education.' },
    { year: 2010, title: 'First LEED Platinum Certification', desc: 'Delivered our first LEED Platinum project, the EcoCenter, establishing our green building expertise and sustainability commitment.' },
    { year: 2013, title: 'Revenue Exceeds $500M', desc: 'Annual revenue surpassed $500M for the first time, driven by major infrastructure and healthcare projects across 12 states.' },
    { year: 2016, title: 'ISO 45001 & OSHA VPP Status', desc: 'Achieved ISO 45001 certification and OSHA Voluntary Protection Program Star status, setting the industry benchmark for safety.' },
    { year: 2019, title: '200th Project & National Recognition', desc: 'Completed our 200th project and were named Top 50 General Contractors by Engineering News-Record.' },
    { year: 2022, title: 'Technology Innovation Hub', desc: 'Launched our BIM-VDC center and drone survey program, integrating AI-driven project management and 3D modeling across all sites.' },
    { year: 2025, title: 'Sustainability Pledge 2030', desc: 'Committed to achieving Net Zero operations by 2030, with all new projects targeting LEED Gold or higher certification.' },
    { year: 2026, title: 'Present Day', desc: 'Operating in 15 states with $850M annual revenue, 2,400 employees, and a pipeline of landmark projects defining the future of construction.' }
];

const faqs = [
    { q: 'What is the typical timeline for a commercial construction project?', a: 'Timelines vary significantly based on project scope and complexity. A typical office build-out may take 4-8 months, while a new commercial building can take 12-24 months from design through completion. Infrastructure projects like bridges typically span 24-48 months.' },
    { q: 'How do you handle project budgeting and cost control?', a: 'We provide detailed line-item estimates during pre-construction and use real-time cost tracking software throughout the project. Our team conducts weekly budget reviews and provides monthly progress reports.' },
    { q: 'What permits and approvals do I need for my project?', a: 'We manage all permitting requirements including building permits, zoning approvals, environmental clearances, and utility connections. Our permitting specialists have established relationships with municipal agencies across 15 states.' },
    { q: 'Does Atlas Construction handle projects outside the United States?', a: 'Our primary operations are in the United States across 15 states. For international projects, we partner with established local construction firms to provide project management, design-build, and consulting services.' },
    { q: 'What insurance coverage does Atlas Construction carry?', a: 'We carry comprehensive general liability insurance ($10M), workers\' compensation, builders\' risk, professional liability ($5M), and umbrella coverage ($25M).' },
    { q: 'What warranty do you provide on completed projects?', a: 'We provide a standard 1-year warranty on all workmanship and materials from the date of substantial completion. Structural components carry extended warranties.' },
    { q: 'How do you ensure safety on construction sites?', a: 'Safety is our top priority. Every project has a dedicated safety officer who conducts daily briefings, weekly inspections, and monthly audits. All site personnel complete OSHA 10/30 training.' },
    { q: 'What is the Design-Build approach and how is it different?', a: 'Design-Build integrates design and construction under a single contract, unlike traditional design-bid-build where they are separate. This approach reduces project delivery time by 20-30%.' },
    { q: 'Can you build on a brownfield or contaminated site?', a: 'Yes. Our environmental division specializes in brownfield remediation and site redevelopment. We manage environmental assessments, remediation planning, regulatory compliance, and sustainable redevelopment.' },
    { q: 'Do you offer financing or help clients secure construction loans?', a: 'While we do not directly finance projects, we have strong relationships with commercial lenders and can facilitate introductions. We also provide detailed project budgets and schedules that lenders require.' },
    { q: 'How do you handle changes or unexpected issues during construction?', a: 'We use a formal change order process that documents the change, provides cost and schedule impact analysis, and requires client approval before proceeding.' },
    { q: 'What makes Atlas Construction different from other general contractors?', a: 'Three things set us apart: our safety record (5+ years without lost-time incident), our technology integration (BIM, drones, AI project management), and our sustainability commitment (all projects target LEED certification).' }
];

const loader = document.getElementById('loader');
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('load', () => {
    setTimeout(() => { if (loader) loader.classList.add('hidden'); }, 2200);
});

window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        if (navLinks) navLinks.classList.toggle('open');
    });
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navLinks) navLinks.classList.remove('open');
    });
});

const currentFile = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentFile) link.classList.add('active');
});

function animateCounters() {
    document.querySelectorAll('[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        if (target === 0) { el.textContent = '0'; return; }
        const duration = 2000;
        const start = performance.now();
        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('hero-stats') || entry.target.closest('.safety-stats')) {
                animateCounters();
            }
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.animate-fade-up').forEach(el => observer.observe(el));

function renderProjects(filter) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    const filtered = !filter || filter === 'all' ? projects : projects.filter(p => p.category === filter);
    grid.innerHTML = filtered.map(p => `
        <div class="project-card">
            <div class="project-img">
                <div class="img-placeholder-pattern"></div>
                <div class="project-img-placeholder">
                    <span>${p.img}</span>
                    <small>${p.name}</small>
                </div>
                <span class="project-badge ${p.status === 'award' ? 'award' : 'completed'}">${p.status === 'award' ? 'Award-Winning' : 'Completed'}</span>
            </div>
            <div class="project-body">
                <h3>${p.name}</h3>
                <div class="project-meta">
                    <span>\u{1F4CD} ${p.location}</span>
                    <span>\u{1F4C5} ${p.date}</span>
                    <span>\u{1F4B0} ${p.budget}</span>
                </div>
                <p>${p.desc}</p>
                <div class="project-client">Client: ${p.client}</div>
            </div>
        </div>
    `).join('');
    document.querySelectorAll('.project-card').forEach(card => observer.observe(card));
}

function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    grid.innerHTML = services.map(s => `
        <div class="service-card">
            <div class="service-icon">${s.icon}</div>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
            <ol class="service-steps">
                ${s.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
    `).join('');
    document.querySelectorAll('.service-card').forEach(card => observer.observe(card));
}

function renderIndustries() {
    const grid = document.getElementById('industriesGrid');
    if (!grid) return;
    grid.innerHTML = industries.map(ind => `
        <div class="industry-card">
            <div class="industry-icon">${ind.icon}</div>
            <h3>${ind.name}</h3>
            <p>${ind.desc}</p>
            <div class="industry-example">${ind.example}</div>
        </div>
    `).join('');
    document.querySelectorAll('.industry-card').forEach(c => observer.observe(c));
}

function renderTimeline() {
    const track = document.getElementById('timelineTrack');
    if (!track) return;
    track.innerHTML = timeline.map(t => `
        <div class="timeline-item">
            <div class="timeline-content">
                <div class="timeline-year">${t.year}</div>
                <div class="timeline-title">${t.title}</div>
                <div class="timeline-desc">${t.desc}</div>
            </div>
            <div class="timeline-dot"></div>
        </div>
    `).join('');
    const tlObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.timeline-item').forEach(item => tlObserver.observe(item));
}

function renderFaqs() {
    const list = document.getElementById('faqList');
    if (!list) return;
    list.innerHTML = faqs.map((faq, i) => `
        <div class="faq-item">
            <div class="faq-question" data-index="${i}">
                <span>${faq.q}</span>
                <span class="faq-toggle">+</span>
            </div>
            <div class="faq-answer">${faq.a}</div>
        </div>
    `).join('');
    document.querySelectorAll('#faqList .faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('#faqList .faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}
