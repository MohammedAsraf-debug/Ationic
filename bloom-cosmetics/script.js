// ===== script.js · Bloom Cosmetics =====
// shared interactive functions — product data, mobile menu, form handling

// ---------- PRODUCT CATALOG (shared data) ----------
const products = [
    {
        id: 1,
        name: "Rosy Lip & Cheek Tint",
        category: "face",
        price: 26,
        icon: "fas fa-paint-brush",
        featured: true
    },
    {
        id: 2,
        name: "Calendula Cream Blush",
        category: "cheek",
        price: 32,
        icon: "fas fa-circle",
        featured: true
    },
    {
        id: 3,
        name: "Wild Pansy Highlighter",
        category: "face",
        price: 34,
        icon: "fas fa-star",
        featured: true
    },
    {
        id: 4,
        name: "Bloom Petal Mist",
        category: "skincare",
        price: 28,
        icon: "fas fa-spray-can",
        featured: false
    },
    {
        id: 5,
        name: "Dewy Foundation",
        category: "base",
        price: 42,
        icon: "fas fa-blender",
        featured: false
    },
    {
        id: 6,
        name: "Rosehip Serum",
        category: "skincare",
        price: 48,
        icon: "fas fa-oil-can",
        featured: true
    },
    {
        id: 7,
        name: "Petal-Soft Mascara",
        category: "eyes",
        price: 24,
        icon: "fas fa-eye",
        featured: false
    },
    {
        id: 8,
        name: "Honeysuckle Balm",
        category: "lips",
        price: 19,
        icon: "fas fa-heart",
        featured: true
    }
];

// ---------- RENDER PRODUCT CARDS (HOME: featured only) ----------
function renderFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    
    const featuredItems = products.filter(p => p.featured === true).slice(0, 4);
    container.innerHTML = featuredItems.map(createProductCard).join('');
}

// ---------- RENDER FULL SHOP (all products) ----------
function renderAllProducts() {
    const container = document.getElementById('allProductsGrid');
    if (!container) return;
    container.innerHTML = products.map(createProductCard).join('');
}

// ---------- CARD HTML TEMPLATE ----------
function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-icon"><i class="${product.icon}"></i></div>
            <h3>${product.name}</h3>
            <div class="product-category">${product.category}</div>
            <div class="product-price">$${product.price}</div>
            <a href="#" class="btn-small">add to bag</a>
        </div>
    `;
}

// ---------- MOBILE NAVIGATION TOGGLE ----------
function initMobileNav() {
    const toggleBtn = document.getElementById('mobileToggle');
    const nav = document.querySelector('.nav-links');
    if (!toggleBtn || !nav) return;

    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        nav.classList.toggle('active');
    });

    // close when clicking outside
    document.addEventListener('click', function(event) {
        if (!nav.contains(event.target) && !toggleBtn.contains(event.target)) {
            nav.classList.remove('active');
        }
    });
}

// ---------- NEWSLETTER FORM (prevent default + feedback) ----------
function initNewsletter() {
    const forms = document.querySelectorAll('#newsletterForm');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input[type="email"]');
            if (input.value.trim() !== '') {
                alert(`🌸 thank you for blooming with us! (${input.value})`);
                input.value = '';
            } else {
                alert('please enter your email to receive petal updates.');
            }
        });
    });
}

// ---------- CONTACT FORM (contact.html) ----------
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const message = document.getElementById('message')?.value.trim();
        const feedback = document.getElementById('formFeedback');

        if (name && email && message) {
            feedback.style.color = '#4a4b3a';
            feedback.textContent = `🌼 thank you, ${name}! your message has bloomed. we’ll reply within 2 petal-days.`;
            contactForm.reset();
        } else {
            feedback.style.color = '#b35e4a';
            feedback.textContent = 'please fill all fields.';
        }
    });
}

// ---------- ACTIVE PAGE HIGHLIGHT (in case) ----------
function setActiveNav() {
    const currentLocation = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentLocation) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ---------- RUN ALL ----------
document.addEventListener('DOMContentLoaded', function() {
    renderFeaturedProducts();
    renderAllProducts();
    initMobileNav();
    initNewsletter();
    initContactForm();
    setActiveNav();

    // minor fix: active class on homepage when no path
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        const homeLink = document.querySelector('.nav-links a[href="index.html"]');
        if (homeLink) homeLink.classList.add('active');
    }
});