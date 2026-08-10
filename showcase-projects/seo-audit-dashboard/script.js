document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const loader = document.getElementById('app-loader');
    const app = document.getElementById('app');
    if (loader) loader.classList.add('hidden');
    if (app) app.style.display = 'flex';
  }, 800);

  if (window.innerWidth <= 768) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      const toggle = document.createElement('button');
      toggle.className = 'mobile-menu-btn';
      toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      toggle.style.cssText = 'position:fixed;top:16px;right:16px;z-index:200;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px;cursor:pointer;color:var(--text);';
      document.body.appendChild(toggle);
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      });
    }
  }

  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        document.querySelector('.contact-form-wrapper').style.display = 'none';
        document.querySelector('.contact-success').classList.add('show');
      }, 1500);
    });
  }

  const state = { running: false, completed: false };
  const urlInput = document.getElementById('url-input');
  const runBtn = document.getElementById('run-audit-btn');

  if (runBtn) {
    const results = document.getElementById('audit-results');
    const btnText = runBtn.querySelector('.btn-text');
    const btnLoader = runBtn.querySelector('.btn-loader');

    runBtn.addEventListener('click', runAudit);
    if (urlInput) urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') runAudit(); });

    function runAudit() {
      if (state.running) return;
      state.running = true;
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      runBtn.disabled = true;
      if (results) results.style.display = 'none';

      setTimeout(() => {
        btnText.style.display = 'inline-flex';
        btnLoader.style.display = 'none';
        runBtn.disabled = false;
        state.running = false;
        state.completed = true;
        if (results) results.style.display = 'block';
        animateCounters();
        animateBars();
        animateRings();
      }, 2200);
    }

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) exportBtn.addEventListener('click', () => window.print());

    const newAuditBtn = document.getElementById('new-audit-btn');
    if (newAuditBtn) {
      newAuditBtn.addEventListener('click', () => {
        state.completed = false;
        if (results) results.style.display = 'none';
        if (urlInput) { urlInput.value = ''; urlInput.focus(); }
      });
    }
  }

  if (document.getElementById('seo-score-ring') && !state.completed && !runBtn) {
    animateCounters();
    animateBars();
    animateRings();
  }

  function animateCounters() {
    const scoreEl = document.getElementById('seo-score-value');
    if (scoreEl) animateCounter(scoreEl, 72, 1500);
    const label = document.getElementById('seo-score-label');
    if (label) label.textContent = targetLabel(72);
    const perfBadge = document.getElementById('perf-badge');
    if (perfBadge) perfBadge.textContent = '65';
    const accBadge = document.getElementById('acc-badge');
    if (accBadge) accBadge.textContent = '88';
    const bpBadge = document.getElementById('bp-badge');
    if (bpBadge) bpBadge.textContent = '79';
  }

  function animateCounter(el, target, duration) {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  function targetLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  }

  function animateBars() {
    const perfBar = document.getElementById('perf-bar');
    if (perfBar) perfBar.style.width = '65%';
    const accBar = document.getElementById('acc-bar');
    if (accBar) accBar.style.width = '88%';
    const bpBar = document.getElementById('bp-bar');
    if (bpBar) bpBar.style.width = '79%';
  }

  function animateRings() {
    const ring = document.getElementById('seo-score-ring');
    if (!ring) return;
    const circumference = 376.99;
    const offset = circumference - (72 / 100) * circumference;
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = '#8b5cf6';
  }
});