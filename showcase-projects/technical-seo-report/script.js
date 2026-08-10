document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const loader = document.getElementById('app-loader');
    const app = document.getElementById('app');
    if (loader) loader.classList.add('hidden');
    if (app) app.style.display = 'block';
  }, 1000);

  const now = new Date();
  const dateEl = document.getElementById('report-date');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const idEl = document.getElementById('report-id');
  if (idEl) idEl.textContent = 'ATS-' + now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + '-' +
    String(Math.floor(Math.random() * 9000) + 1000);

  setTimeout(() => {
    const gauge = document.getElementById('gauge-score');
    if (gauge) animateCounter(gauge, 68, 2000);

    const gaugeFill = document.querySelector('.gauge-fill');
    if (gaugeFill) {
      const circumference = 251.33;
      const offset = circumference - (68 / 100) * circumference;
      gaugeFill.style.strokeDashoffset = offset;
    }

    const radarData = document.querySelector('.radar-polygon-data');
    const radarPoints = document.querySelector('.radar-points');
    if (radarData) radarData.style.opacity = '1';
    if (radarPoints) radarPoints.style.opacity = '1';
  }, 600);

  setTimeout(() => {
    document.querySelectorAll('.score-category .cat-fill').forEach((bar, i) => {
      const targets = [82, 74, 65, 58, 71, 95];
      if (i < targets.length) bar.style.width = targets[i] + '%';
    });
  }, 800);

  setTimeout(() => {
    document.querySelectorAll('.dist-bar-fill').forEach((bar, i) => {
      const targets = [15, 32, 28, 18, 7];
      if (i < targets.length) bar.style.width = targets[i] + '%';
    });
  }, 1000);

  const tabs = document.querySelectorAll('.issue-tab');
  const categories = {
    critical: document.getElementById('issues-critical'),
    high: document.getElementById('issues-high'),
    medium: document.getElementById('issues-medium'),
    low: document.getElementById('issues-low')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      Object.values(categories).forEach(c => { if (c) c.classList.remove('active'); });
      const cat = categories[tab.dataset.category];
      if (cat) cat.classList.add('active');
    });
  });

  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  function animateCounter(el, target, duration) {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }
});