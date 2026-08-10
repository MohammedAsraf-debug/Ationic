// ── EmailJS Config ──
const SERVICE_ID = 'service_kf8hlym';
const TEMPLATE_ID = 'template_l3zz2cs';
const PUBLIC_KEY = 'M3-yivo_eRFPPL1t6';

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', () => {
  try { emailjs.init(PUBLIC_KEY); } catch (e) {}
  // ── Preloader ──
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => preloader.classList.add('fade-out'));
    setTimeout(() => preloader.classList.add('fade-out'), 1000);
  }
  document.body.classList.add('loaded');

  // ── Navbar Scroll Effect ──
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    lastScroll = y;
  });

  // ── Mobile Menu Toggle ──
  const burger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      navMenu.classList.toggle('active');
      burger.setAttribute('aria-expanded', navMenu.classList.contains('active'));
    });
  }
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      burger?.classList.remove('active');
      navMenu?.classList.remove('active');
      burger?.setAttribute('aria-expanded', 'false');
    });
  });

  // ── Smooth Scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href !== '#' && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ── About Tabs ──
  const aboutTabs = document.querySelectorAll('.about-home-tab');
  if (aboutTabs.length > 1) {
    aboutTabs[0].classList.add('active');
    aboutTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        aboutTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  }

  // ── Scroll Reveal ──
  const revealSelector = '.section-head, .service-card, .case-card, .testimonial-card, .pricing-card, .team-card, .blog-card, .process-step, .industry-item, .extra-service, .comparison-table, .about-grid, .about-stat-card, .feature-card, .process-card, .about-home-grid, .about-home-tab, .accordion-item, .cta-section-inner, .contact-info-item, .about-home-image-box';
  const revealEls = document.querySelectorAll(revealSelector);
  revealEls.forEach(el => el.classList.add('reveal'));
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 60;
        entry.target.style.transitionDelay = delay + 'ms';
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // ── FAQ Accordion ──
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const isActive = header.classList.contains('active');
      document.querySelectorAll('.accordion-header.active').forEach(h => {
        h.classList.remove('active');
        h.setAttribute('aria-expanded', 'false');
        h.nextElementSibling.style.maxHeight = '0';
      });
      if (!isActive) {
        header.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        header.nextElementSibling.style.maxHeight = header.nextElementSibling.scrollHeight + 'px';
      }
    });
  });

  // ── Back to Top ──
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── Form Handler ──
  function handleFormSubmit(formEl, successMsg) {
    if (!formEl) return;
    formEl.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('.btn');
      const original = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      document.getElementById('time') && (document.getElementById('time').value = new Date().toLocaleString());
      const subj = document.getElementById('subject');
      const custom = document.getElementById('subject_custom');
      if (subj && subj.value === 'custom' && custom && custom.value.trim()) {
        subj.value = 'Custom: ' + custom.value.trim();
      }
      if (typeof emailjs !== 'undefined') {
        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this)
          .then(() => {
            this.innerHTML = '<p style="color:var(--yellow);text-align:center;font-size:1rem;">' + successMsg + '</p>';
          })
          .catch(() => {
            btn.innerHTML = original;
            btn.disabled = false;
            const status = document.getElementById('form-status');
            if (status) status.innerHTML = '<p style="color:#ff6b6b;">Failed to send. Please email us directly at hello@ationic.agency.</p>';
          });
      } else {
        btn.innerHTML = original;
        btn.disabled = false;
      }
    });
  }

  // ── Contact Form ──
  handleFormSubmit(document.getElementById('ationic-contact-form'), 'Thank you! We\'ll reach out within 2 hours.');

  // ── Popup ──
  let popupTimer = null;
  const contactPopup = document.getElementById('contactPopup');
  const popupBg = document.getElementById('popupBg');
  const popupCloseBtn = document.getElementById('popupClose');

  function showPopup() {
    if (contactPopup) contactPopup.classList.add('active');
  }
  function hidePopup() {
    if (contactPopup) contactPopup.classList.remove('active');
  }

  if (contactPopup && !sessionStorage.getItem('popupShown')) {
    popupTimer = setTimeout(() => { showPopup(); sessionStorage.setItem('popupShown', '1'); }, 10000);
    function dismissPopup() { hidePopup(); clearTimeout(popupTimer); sessionStorage.setItem('popupShown', '1'); }
    popupBg?.addEventListener('click', dismissPopup);
    popupCloseBtn?.addEventListener('click', dismissPopup);
    document.getElementById('popup-contact-form')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('.btn');
      const original = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      if (typeof emailjs !== 'undefined') {
        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this)
          .then(() => {
            this.innerHTML = '<p style="color:var(--yellow);text-align:center;font-size:1rem;">Thank you! We\'ll reach out within 2 hours.</p>';
            setTimeout(hidePopup, 3000);
          })
          .catch(() => {
            btn.innerHTML = original;
            btn.disabled = false;
          });
      } else {
        btn.innerHTML = original;
        btn.disabled = false;
      }
    });
  }

  // ── Chart Animation ──
  const dashBars = document.querySelectorAll('.dash-chart__bars span');
  if (dashBars.length) {
    const targets = [];
    dashBars.forEach(bar => {
      const match = bar.getAttribute('style')?.match(/height:\s*(\d+)%/);
      targets.push(match ? parseInt(match[1], 10) : 0);
      bar.style.height = '0%';
    });
    const dashObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          dashBars.forEach((bar, i) => {
            setTimeout(() => { bar.style.height = targets[i] + '%'; }, i * 100);
          });
          dashObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    const chart = document.querySelector('.dash-chart');
    if (chart) dashObserver.observe(chart);
  }
});

/* ── Custom Select ── */
function toggleSelect(el) {
  const parent = el.closest('.custom-select');
  if (!parent) return;
  const isOpen = parent.classList.contains('open');
  document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'));
  if (!isOpen) parent.classList.add('open');
}

function selectOption(el) {
  const parent = el.closest('.custom-select');
  if (!parent) return;
  const val = el.dataset.value;
  const text = el.textContent.trim();
  parent.querySelectorAll('.custom-select__option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  const trigger = parent.querySelector('.custom-select__text');
  if (trigger) {
    trigger.textContent = text;
    if (val === '') {
      trigger.classList.add('placeholder');
    } else {
      trigger.classList.remove('placeholder');
    }
  }
  const hidden = parent.querySelector('input[type="hidden"]');
  if (hidden) hidden.value = val;
  parent.classList.remove('open');
  const customGroup = document.getElementById('custom-service-group');
  const customInput = document.getElementById('subject_custom');
  if (customGroup && customInput) {
    customGroup.style.display = val === 'custom' ? 'block' : 'none';
    if (val !== 'custom') customInput.value = '';
  }
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.custom-select')) {
    document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'));
  }
});
