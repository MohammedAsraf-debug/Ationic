(function() {
  'use strict';

  // ====== DATA ======
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [18500, 22100, 20800, 25400, 28900, 31200, 33800, 36500, 38900, 40200, 41500, 42300],
    color: '#6366f1'
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    current: [2000, 3200, 4100, 5300, 6200, 7400, 8500, 9400, 10300, 11200, 12000, 12847],
    projected: [2000, 3200, 4100, 5300, 6200, 7400, 8500, 9400, 10300, 11200, 12000, 12847, 13800, 14800]
  };

  const invoices = [
    { id: 'INV-2025-001', customer: 'Sarah Mitchell', amount: 2400, status: 'paid', date: '2025-07-21' },
    { id: 'INV-2025-002', customer: 'James Thompson', amount: 5800, status: 'pending', date: '2025-07-20' },
    { id: 'INV-2025-003', customer: 'Emily Chen', amount: 1200, status: 'paid', date: '2025-07-19' },
    { id: 'INV-2025-004', customer: 'Robert Kim', amount: 3500, status: 'overdue', date: '2025-07-15' },
    { id: 'INV-2025-005', customer: 'Lisa Patel', amount: 1800, status: 'paid', date: '2025-07-18' },
    { id: 'INV-2025-006', customer: 'Michael Torres', amount: 4200, status: 'pending', date: '2025-07-17' },
    { id: 'INV-2025-007', customer: 'Amanda Foster', amount: 980, status: 'cancelled', date: '2025-07-16' },
    { id: 'INV-2025-008', customer: 'David Wagner', amount: 7500, status: 'paid', date: '2025-07-14' },
    { id: 'INV-2025-009', customer: 'Jessica Nguyen', amount: 2100, status: 'pending', date: '2025-07-13' },
    { id: 'INV-2025-010', customer: 'Brian Sullivan', amount: 3600, status: 'paid', date: '2025-07-12' }
  ];

  const projects = [
    { name: 'CloudSync Platform', status: 'active', progress: 72, team: 8, due: '2025-09-15', budget: '$180,000' },
    { name: 'DataVault Migration', status: 'on hold', progress: 45, team: 5, due: '2025-10-01', budget: '$95,000' },
    { name: 'AI Analytics Engine', status: 'active', progress: 28, team: 12, due: '2025-12-01', budget: '$350,000' },
    { name: 'Mobile App Redesign', status: 'completed', progress: 100, team: 6, due: '2025-06-30', budget: '$120,000' },
    { name: 'API Gateway v3', status: 'active', progress: 61, team: 4, due: '2025-08-20', budget: '$75,000' },
    { name: 'Security Audit Suite', status: 'on hold', progress: 15, team: 3, due: '2025-11-15', budget: '$60,000' }
  ];

  const activities = [
    { text: '<strong>Sarah Mitchell</strong> signed up for the Pro plan', time: '2 minutes ago', type: 'signup' },
    { text: '<strong>Invoice INV-2025-003</strong> was paid successfully', time: '15 minutes ago', type: 'payment' },
    { text: '<strong>James Thompson</strong> upgraded from Basic to Pro', time: '1 hour ago', type: 'upgrade' },
    { text: '<strong>Lisa Patel</strong> cancelled their Enterprise subscription', time: '3 hours ago', type: 'cancellation' },
    { text: '<strong>David Wagner</strong> signed up for the Enterprise plan', time: '5 hours ago', type: 'signup' },
    { text: '<strong>Invoice INV-2025-008</strong> was paid successfully', time: '6 hours ago', type: 'payment' },
    { text: '<strong>Amanda Foster</strong> upgraded from Free to Basic', time: '8 hours ago', type: 'upgrade' },
    { text: '<strong>Robert Kim</strong> cancelled their Pro subscription', time: '1 day ago', type: 'cancellation' }
  ];

  // ====== DOM REFS ======
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const loadingScreen = $('#loading-screen');
  const sidebar = $('#sidebar');
  const mobileMenuBtn = $('#mobileMenuBtn');
  const darkToggle = $('#darkToggle');
  const navItems = $$('.nav-item');
  const sections = $$('.section');
  const pageTitle = $('#pageTitle');
  const revenueCanvas = $('#revenueChart');
  const usersCanvas = $('#usersChart');
  const subCanvas = $('#subscriptionChart');
  const revenueTooltip = $('#revenueTooltip');
  const revenueTooltipLabel = $('#revenueTooltipLabel');
  const revenueTooltipValue = $('#revenueTooltipValue');
  const invoiceBody = $('#invoiceBody');
  const invoiceSearch = $('#invoiceSearch');
  const invoiceFilter = $('#invoiceFilter');
  const projectsGrid = $('#projectsGrid');
  const activityFeed = $('#activityFeed');
  const toastContainer = $('#toastContainer');

  // ====== LOADING ======
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      initDashboard();
    }, 1200);
  });

  // ====== THEME ======
  function initTheme() {
    const saved = localStorage.getItem('nexus-theme');
    if (saved === 'light') {
      document.body.classList.add('light-mode');
    }
  }
  initTheme();

  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('nexus-theme', isLight ? 'light' : 'dark');
    redrawCharts();
  });

  // ====== SIDEBAR ======
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 && !sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  // ====== NAVIGATION (multi-page links) ======
  // Real href links handle page navigation

  // ====== ANIMATED COUNTERS ======
  function animateCounters() {
    const counters = $$('.stat-value[data-target]');
    counters.forEach(counter => {
      const target = parseFloat(counter.dataset.target);
      const prefix = counter.dataset.prefix || '';
      const suffix = counter.dataset.suffix || '';
      const fixed = parseInt(counter.dataset.fixed) || 0;
      const duration = 2000;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        if (fixed > 0) {
          counter.textContent = prefix + current.toFixed(fixed) + suffix;
        } else {
          counter.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          if (fixed > 0) {
            counter.textContent = prefix + target.toFixed(fixed) + suffix;
          } else {
            counter.textContent = prefix + Math.floor(target).toLocaleString() + suffix;
          }
        }
      }
      requestAnimationFrame(update);
    });
  }

  // ====== CANVAS CHARTS ======
  function getComputedStyles() {
    const isLight = document.body.classList.contains('light-mode');
    return {
      bg: isLight ? '#ffffff' : '#151726',
      text: isLight ? '#475569' : '#94a3b8',
      line: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)',
      tooltipBg: isLight ? '#ffffff' : '#151726',
      gridLine: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)'
    };
  }

  function redrawCharts() {
    drawRevenueChart();
    drawUsersChart();
    drawSubscriptionChart();
  }

  function setupCanvas(canvas, width, height) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
  }

  function drawRevenueChart() {
    if (!revenueCanvas) return;
    const styles = getComputedStyles();
    const w = revenueCanvas.parentElement.clientWidth - 32 || 700;
    const h = 260;
    const ctx = setupCanvas(revenueCanvas, w, h);

    const padding = { top: 30, right: 20, bottom: 36, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxVal = Math.max(...revenueData.values) * 1.1;
    const points = revenueData.values.map((v, i) => ({
      x: padding.left + (i / (revenueData.values.length - 1)) * chartW,
      y: padding.top + chartH - (v / maxVal) * chartH,
      value: v,
      label: revenueData.labels[i]
    }));

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = styles.gridLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = styles.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('$' + Math.round((maxVal - (i / 4) * maxVal) / 1000) + 'k', padding.left - 8, y + 4);
    }
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = styles.text;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    points.forEach((p, i) => {
      if (i % 2 === 0) {
        ctx.fillText(p.label, p.x, h - padding.bottom + 18);
      }
    });

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Points
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.strokeStyle = styles.bg;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Hover interaction
    revenueCanvas.onmousemove = (e) => {
      const rect = revenueCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const scaleX = w / rect.width;

      let closest = null;
      let minDist = Infinity;
      points.forEach(p => {
        const d = Math.abs(p.x - (mx / scaleX));
        if (d < minDist) { minDist = d; closest = p; }
      });

      if (closest && minDist < 30) {
        revenueTooltip.style.left = (closest.x + 10) + 'px';
        revenueTooltip.style.top = (closest.y - 10) + 'px';
        revenueTooltipLabel.textContent = closest.label;
        revenueTooltipValue.textContent = '$' + closest.value.toLocaleString();
        revenueTooltip.classList.add('visible');
      } else {
        revenueTooltip.classList.remove('visible');
      }
    };

    revenueCanvas.onmouseleave = () => {
      revenueTooltip.classList.remove('visible');
    };
  }

  function drawUsersChart() {
    if (!usersCanvas) return;
    const styles = getComputedStyles();
    const w = usersCanvas.parentElement.clientWidth - 32 || 700;
    const h = 260;
    const ctx = setupCanvas(usersCanvas, w, h);

    const padding = { top: 30, right: 20, bottom: 36, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const allVals = [...userGrowthData.current, ...userGrowthData.projected];
    const maxVal = Math.max(...allVals) * 1.1;

    const currentPoints = userGrowthData.current.map((v, i) => ({
      x: padding.left + (i / (userGrowthData.current.length - 1)) * chartW,
      y: padding.top + chartH - (v / maxVal) * chartH,
      value: v,
      label: userGrowthData.labels[i]
    }));

    const projectedLabels = [...userGrowthData.labels, 'Jan', 'Feb'];
    const projectedPoints = userGrowthData.projected.map((v, i) => ({
      x: padding.left + (i / (userGrowthData.projected.length - 1)) * chartW,
      y: padding.top + chartH - (v / maxVal) * chartH,
      value: v,
      label: projectedLabels[i] || ''
    }));

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = styles.gridLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = styles.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (i / 4) * maxVal), padding.left - 8, y + 4);
    }
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = styles.text;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    currentPoints.forEach((p, i) => {
      if (i % 2 === 0) ctx.fillText(p.label, p.x, h - padding.bottom + 18);
    });

    // Current area
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

    ctx.beginPath();
    ctx.moveTo(currentPoints[0].x, padding.top + chartH);
    currentPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(currentPoints[currentPoints.length - 1].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Current line
    ctx.beginPath();
    ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
    currentPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();

    currentPoints.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.strokeStyle = styles.bg;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Projected line (dashed)
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.moveTo(projectedPoints[0].x, projectedPoints[0].y);
    projectedPoints.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    projectedPoints.forEach((p, i) => {
      if (i > 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }

  function drawSubscriptionChart() {
    if (!subCanvas) return;
    const size = 160;
    const ctx = setupCanvas(subCanvas, size, size);

    const data = [
      { label: 'Basic', value: 35, color: '#6366f1' },
      { label: 'Pro', value: 45, color: '#8b5cf6' },
      { label: 'Enterprise', value: 20, color: '#22d3ee' }
    ];

    const total = data.reduce((s, d) => s + d.value, 0);
    const cx = size / 2;
    const cy = size / 2;
    const radius = 68;
    const innerRadius = 44;

    ctx.clearRect(0, 0, size, size);

    let startAngle = -Math.PI / 2;

    data.forEach(d => {
      const sliceAngle = (d.value / total) * Math.PI * 2;

      // Outer arc
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = d.color;
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Inner text
    ctx.fillStyle = getComputedStyles().text;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('12,847', cx, cy - 6);
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Total Users', cx, cy + 12);
  }

  // ====== INVOICES TABLE ======
  function renderInvoices(data) {
    invoiceBody.innerHTML = '';
    data.forEach(inv => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="invoice-id">${inv.id}</td>
        <td>${inv.customer}</td>
        <td>$${inv.amount.toLocaleString()}</td>
        <td><span class="status-badge ${inv.status}">${inv.status}</span></td>
        <td>${new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
        <td>
          <button class="action-icon-btn" title="View Invoice" data-action="view" data-id="${inv.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="action-icon-btn" title="Download" data-action="download" data-id="${inv.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </td>
      `;
      invoiceBody.appendChild(row);
    });

    invoiceBody.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', () => showToast('Viewing invoice ' + btn.dataset.id, 'info'));
    });
    invoiceBody.querySelectorAll('[data-action="download"]').forEach(btn => {
      btn.addEventListener('click', () => showToast('Downloading ' + btn.dataset.id, 'success'));
    });
  }

  function filterInvoices() {
    const search = invoiceSearch.value.toLowerCase();
    const status = invoiceFilter.value;
    let filtered = invoices.filter(inv => {
      const matchSearch = inv.id.toLowerCase().includes(search) || inv.customer.toLowerCase().includes(search);
      const matchStatus = status === 'all' || inv.status === status;
      return matchSearch && matchStatus;
    });
    renderInvoices(filtered);
  }

  if (invoiceSearch) invoiceSearch.addEventListener('input', filterInvoices);
  if (invoiceFilter) invoiceFilter.addEventListener('change', filterInvoices);

  // ====== PROJECTS ======
  function renderProjects() {
    projectsGrid.innerHTML = '';
    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.style.animationDelay = Math.random() * 0.3 + 's';

      const statusClass = p.status.replace(' ', '-');
      card.innerHTML = `
        <div class="project-card-header">
          <span class="project-name">${p.name}</span>
          <span class="status-badge ${statusClass}">${p.status}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
        <div class="project-details">
          <div class="project-detail">Progress <span>${p.progress}%</span></div>
          <div class="project-detail">Team <span>${p.team} members</span></div>
          <div class="project-detail">Due <span>${new Date(p.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
          <div class="project-detail">Budget <span>${p.budget}</span></div>
        </div>
      `;
      projectsGrid.appendChild(card);

      // Animate progress bar
      setTimeout(() => {
        const fill = card.querySelector('.progress-fill');
        fill.style.width = p.progress + '%';
      }, 300);
    });
  }

  // ====== ACTIVITY FEED ======
  function renderActivities() {
    activityFeed.innerHTML = '';
    activities.forEach((act, i) => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      item.style.animationDelay = (i * 0.08) + 's';
      item.innerHTML = `
        <div class="activity-dot ${act.type}"></div>
        <div class="activity-content">
          <div class="activity-text">${act.text}</div>
          <div class="activity-time">${act.time}</div>
        </div>
      `;
      activityFeed.appendChild(item);
    });
  }

  // ====== QUICK ACTIONS ======
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const labels = {
        'add-user': 'Opening new user creation form...',
        'send-invoice': 'Opening invoice composer...',
        'create-project': 'Opening project creation wizard...',
        'generate-report': 'Generating your report...'
      };
      showToast(labels[action] || 'Action triggered', 'info');
    });
  });

  // ====== TOAST ======
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ====== WINDOW RESIZE ======
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(redrawCharts, 250);
  });

  // ====== PAGE-SPECIFIC INIT ======
  function initSaaSDashboard() {
    animateCounters();
    renderInvoices(invoices);
    renderProjects();
    renderActivities();
    redrawCharts();
  }

  function initAnalyticsPage() {
    animateCounters();

    // Use existing canvas IDs for charts with same data
    const ac = document.getElementById('analyticsRevenueChart');
    const uc = document.getElementById('analyticsUsersChart');
    const sc = document.getElementById('analyticsSubChart');

    // Redirect chart drawing to these canvases
    const origRevenue = revenueCanvas;
    const origUsers = usersCanvas;
    const origSub = subCanvas;

    if (ac) { revenueCanvas = ac; }
    if (uc) { usersCanvas = uc; }
    if (sc) { subCanvas = sc; }

    if (ac || uc || sc) redrawCharts();

    revenueCanvas = origRevenue;
    usersCanvas = origUsers;
    subCanvas = origSub;
  }

  function initUsersPage() {
    animateCounters();

    // User list data
    const userList = [
      { name: 'Sarah Mitchell', email: 'sarah@example.com', plan: 'pro', status: 'active', joined: '2025-01-15' },
      { name: 'James Thompson', email: 'james@example.com', plan: 'enterprise', status: 'active', joined: '2024-11-20' },
      { name: 'Emily Chen', email: 'emily@example.com', plan: 'basic', status: 'active', joined: '2025-03-08' },
      { name: 'Robert Kim', email: 'robert@example.com', plan: 'pro', status: 'inactive', joined: '2024-09-12' },
      { name: 'Lisa Patel', email: 'lisa@example.com', plan: 'enterprise', status: 'active', joined: '2024-06-01' },
      { name: 'Michael Torres', email: 'michael@example.com', plan: 'basic', status: 'active', joined: '2025-05-22' },
      { name: 'Amanda Foster', email: 'amanda@example.com', plan: 'pro', status: 'active', joined: '2025-02-14' },
      { name: 'David Wagner', email: 'david@example.com', plan: 'enterprise', status: 'active', joined: '2024-08-30' },
      { name: 'Jessica Nguyen', email: 'jessica@example.com', plan: 'basic', status: 'inactive', joined: '2025-04-17' },
      { name: 'Brian Sullivan', email: 'brian@example.com', plan: 'pro', status: 'active', joined: '2024-12-05' }
    ];

    const tbody = document.getElementById('userListBody');
    const searchInput = document.getElementById('userListSearch');
    const planFilter = document.getElementById('userPlanFilter');

    function renderUserList(data) {
      tbody.innerHTML = '';
      data.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="invoice-id">${u.name}</td>
          <td>${u.email}</td>
          <td><span class="status-badge ${u.plan}">${u.plan}</span></td>
          <td><span class="status-badge ${u.status}">${u.status}</span></td>
          <td>${new Date(u.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
          <td><button class="action-icon-btn" onclick="showToast('Viewing ${u.name}','info')"><i class="fas fa-eye"></i></button></td>
        `;
        tbody.appendChild(tr);
      });
    }

    function filterUsers() {
      const q = searchInput.value.toLowerCase();
      const p = planFilter.value;
      let filtered = userList.filter(u => {
        return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
               (p === 'all' || u.plan === p);
      });
      renderUserList(filtered);
    }

    searchInput.addEventListener('input', filterUsers);
    planFilter.addEventListener('change', filterUsers);
    renderUserList(userList);

    // Subscription chart
    const uc = document.getElementById('usersSubChart');
    if (uc) {
      const orig = subCanvas;
      subCanvas = uc;
      drawSubscriptionChart();
      subCanvas = orig;
    }

    // Activity feed
    const feed = document.getElementById('usersActivityFeed');
    if (feed) {
      const act = [
        { text: '<strong>Sarah Mitchell</strong> signed up for Pro', time: '2 min ago', type: 'signup' },
        { text: '<strong>James Thompson</strong> upgraded to Enterprise', time: '1 hr ago', type: 'upgrade' },
        { text: '<strong>Lisa Patel</strong> cancelled subscription', time: '3 hr ago', type: 'cancellation' },
        { text: '<strong>David Wagner</strong> signed up for Enterprise', time: '5 hr ago', type: 'signup' },
        { text: '<strong>Amanda Foster</strong> upgraded to Pro', time: '8 hr ago', type: 'upgrade' }
      ];
      feed.innerHTML = '';
      act.forEach((a, i) => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.style.animationDelay = (i * 0.08) + 's';
        item.innerHTML = `<div class="activity-dot ${a.type}"></div><div class="activity-content"><div class="activity-text">${a.text}</div><div class="activity-time">${a.time}</div></div>`;
        feed.appendChild(item);
      });
    }
  }

  function initBillingPage() {
    animateCounters();
    // Re-use invoice rendering from shared data
    const ib = document.getElementById('billingInvoiceBody');
    const is = document.getElementById('billingSearch');
    const f = document.getElementById('billingFilter');

    if (ib) {
      const origBody = invoiceBody;
      invoiceBody = ib;

      function filterBill() {
        const q = is.value.toLowerCase();
        const s = f.value;
        let filtered = invoices.filter(inv => {
          return (inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q)) &&
                 (s === 'all' || inv.status === s);
        });
        renderInvoices(filtered);
      }

      is.addEventListener('input', filterBill);
      f.addEventListener('change', filterBill);
      renderInvoices(invoices);

      invoiceBody = origBody;
    }
  }

  function initSettingsPage() {
    const toggle = document.getElementById('settingsDarkToggle');
    if (toggle) {
      toggle.checked = document.body.classList.contains('light-mode');
      toggle.addEventListener('change', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('nexus-theme', toggle.checked ? 'light' : 'dark');
      });
    }
  }

  // Expose toast globally for inline use
  window.showToast = showToast;

})();
