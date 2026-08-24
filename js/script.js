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
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
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
  function setFormMessage(container, html) {
    if (!container) return;
    container.innerHTML = html;
    const msg = container.querySelector('[role="status"], [role="alert"]');
    if (msg) msg.focus({ preventScroll: true });
  }

  function handleFormSubmit(formEl, successMsg, statusElId) {
    if (!formEl) return;
    formEl.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('.btn');
      const original = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      const status = document.getElementById(statusElId);
      document.getElementById('time') && (document.getElementById('time').value = new Date().toLocaleString());
      const subj = document.getElementById('subject');
      const custom = document.getElementById('subject_custom');
      if (subj && subj.value === 'custom' && custom && custom.value.trim()) {
        subj.value = 'Custom: ' + custom.value.trim();
      }
      if (typeof emailjs !== 'undefined') {
        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this)
          .then(() => {
            this.innerHTML = '<p role="status" tabindex="-1" style="color:var(--yellow);text-align:center;font-size:1rem;outline:none;">' + successMsg + '</p>';
            const msg = this.querySelector('[role="status"]');
            if (msg) msg.focus({ preventScroll: true });
          })
          .catch(() => {
            btn.innerHTML = original;
            btn.disabled = false;
            setFormMessage(status, '<p role="alert" style="color:#ff6b6b;">Failed to send. Please email us directly at hello@ationic.agency.</p>');
          });
      } else {
        btn.innerHTML = original;
        btn.disabled = false;
        setFormMessage(status, '<p role="alert" style="color:#ff6b6b;">Email service is unavailable right now. Please email us directly at hello@ationic.agency.</p>');
      }
    });
  }

  // ── Contact Form ──
  handleFormSubmit(document.getElementById('ationic-contact-form'), 'Thank you! We\'ll reach out within 2 hours.', 'form-status');

  // ── Popup ──
  let popupTimer = null;
  let lastFocused = null;
  const contactPopup = document.getElementById('contactPopup');
  const popupBg = document.getElementById('popupBg');
  const popupCloseBtn = document.getElementById('popupClose');

  function getFocusable(el) {
    return Array.from(el.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(n => n.offsetParent !== null);
  }

  function showPopup() {
    if (!contactPopup) return;
    lastFocused = document.activeElement;
    contactPopup.classList.add('active');
    contactPopup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const focusable = getFocusable(contactPopup);
    (focusable[0] || contactPopup).focus();
  }
  function hidePopup() {
    if (!contactPopup) return;
    contactPopup.classList.remove('active');
    contactPopup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function dismissPopup() { hidePopup(); clearTimeout(popupTimer); sessionStorage.setItem('popupShown', '1'); }

  if (contactPopup) {
    contactPopup.setAttribute('aria-hidden', 'true');
    if (!sessionStorage.getItem('popupShown')) {
      popupTimer = setTimeout(() => { showPopup(); sessionStorage.setItem('popupShown', '1'); }, 10000);
    }
    popupBg?.addEventListener('click', dismissPopup);
    popupCloseBtn?.addEventListener('click', dismissPopup);
    document.addEventListener('keydown', function(e) {
      if (!contactPopup.classList.contains('active')) return;
      if (e.key === 'Escape') { dismissPopup(); return; }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable(contactPopup);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.getElementById('popup-contact-form')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('.btn');
      const original = btn.innerHTML;
      btn.innerHTML = 'Sending...';
      btn.disabled = true;
      const btnWrap = btn.parentElement;
      if (typeof emailjs !== 'undefined') {
        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this)
          .then(() => {
            this.innerHTML = '<p role="status" tabindex="-1" style="color:var(--yellow);text-align:center;font-size:1rem;outline:none;">Thank you! We\'ll reach out within 2 hours.</p>';
            const msg = this.querySelector('[role="status"]');
            if (msg) msg.focus({ preventScroll: true });
            setTimeout(hidePopup, 3000);
          })
          .catch(() => {
            btn.innerHTML = original;
            btn.disabled = false;
            if (btnWrap) {
              let err = btnWrap.querySelector('.popup-error');
              if (!err) {
                err = document.createElement('p');
                err.className = 'popup-error';
                err.setAttribute('role', 'alert');
                btnWrap.appendChild(err);
              }
              err.textContent = 'Failed to send. Please email us directly at hello@ationic.agency.';
            }
          });
      } else {
        btn.innerHTML = original;
        btn.disabled = false;
        alert('Email service is unavailable right now. Please email us directly at hello@ationic.agency.');
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

// ── Native Service Select ├─ Custom Service reveal ──
document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'subject') {
    const showCustom = e.target.value === 'custom';
    const customGroup = document.getElementById('custom-service-group');
    const customInput = document.getElementById('subject_custom');
    if (customGroup) customGroup.style.display = showCustom ? 'block' : 'none';
    if (customInput && !showCustom) customInput.value = '';
  }
});

(function () {
  var emailLinks = document.querySelectorAll('a[data-email]');
  for (var i = 0; i < emailLinks.length; i++) {
    var link = emailLinks[i];
    var email = link.getAttribute('data-email');
    if (!email) continue;
    link.setAttribute('href', 'mailto:' + email);
    if (link.hasAttribute('data-email-text')) link.textContent = email;
  }
})();
