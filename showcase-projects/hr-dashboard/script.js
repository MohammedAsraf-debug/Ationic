(function() {
  'use strict';

  // ====== DATA ======
  const employees = [
    { name: 'Elena Vasquez', dept: 'Engineering', position: 'Senior Frontend Developer', email: 'elena.v@atlas.com', phone: '+1 (555) 123-4567', status: 'active', joined: '2021-03-15' },
    { name: 'Marcus Johnson', dept: 'Engineering', position: 'Backend Lead', email: 'marcus.j@atlas.com', phone: '+1 (555) 234-5678', status: 'active', joined: '2020-06-01' },
    { name: 'Priya Sharma', dept: 'Marketing', position: 'Brand Director', email: 'priya.s@atlas.com', phone: '+1 (555) 345-6789', status: 'active', joined: '2022-01-10' },
    { name: 'Daniel O\'Brien', dept: 'Sales', position: 'Account Executive', email: 'daniel.o@atlas.com', phone: '+1 (555) 456-7890', status: 'active', joined: '2023-04-22' },
    { name: 'Sophie Laurent', dept: 'Engineering', position: 'Full Stack Developer', email: 'sophie.l@atlas.com', phone: '+1 (555) 567-8901', status: 'active', joined: '2022-09-05' },
    { name: 'Alex Kim', dept: 'Operations', position: 'Operations Manager', email: 'alex.k@atlas.com', phone: '+1 (555) 678-9012', status: 'active', joined: '2019-11-18' },
    { name: 'Rachel Green', dept: 'Human Resources', position: 'HR Coordinator', email: 'rachel.g@atlas.com', phone: '+1 (555) 789-0123', status: 'active', joined: '2023-02-14' },
    { name: 'Thomas Wright', dept: 'Finance', position: 'Financial Analyst', email: 'thomas.w@atlas.com', phone: '+1 (555) 890-1234', status: 'active', joined: '2021-07-26' },
    { name: 'Nina Patel', dept: 'Marketing', position: 'Content Strategist', email: 'nina.p@atlas.com', phone: '+1 (555) 901-2345', status: 'on-leave', joined: '2022-05-30' },
    { name: 'Carlos Mendez', dept: 'Sales', position: 'Sales Manager', email: 'carlos.m@atlas.com', phone: '+1 (555) 012-3456', status: 'active', joined: '2020-10-12' },
    { name: 'Yuki Tanaka', dept: 'Engineering', position: 'DevOps Engineer', email: 'yuki.t@atlas.com', phone: '+1 (555) 111-2222', status: 'inactive', joined: '2021-12-01' },
    { name: 'Olivia Foster', dept: 'Finance', position: 'Payroll Specialist', email: 'olivia.f@atlas.com', phone: '+1 (555) 222-3333', status: 'active', joined: '2023-08-20' }
  ];

  const leaveRequests = [
    { name: 'Elena Vasquez', type: 'Vacation', from: '2025-07-28', to: '2025-08-01', status: 'approved' },
    { name: 'Nina Patel', type: 'Sick', from: '2025-07-22', to: '2025-07-23', status: 'approved' },
    { name: 'Thomas Wright', type: 'Personal', from: '2025-07-25', to: '2025-07-25', status: 'pending' },
    { name: 'Rachel Green', type: 'Vacation', from: '2025-08-05', to: '2025-08-09', status: 'pending' },
    { name: 'Marcus Johnson', type: 'Maternity', from: '2025-09-01', to: '2025-11-30', status: 'approved' },
    { name: 'Daniel O\'Brien', type: 'Sick', from: '2025-07-15', to: '2025-07-16', status: 'rejected' },
    { name: 'Sophie Laurent', type: 'Vacation', from: '2025-08-12', to: '2025-08-14', status: 'pending' },
    { name: 'Alex Kim', type: 'Personal', from: '2025-07-30', to: '2025-07-31', status: 'approved' }
  ];

  const leaveBalances = [
    { type: 'Vacation', used: 8, total: 20 },
    { type: 'Sick', used: 4, total: 12 },
    { type: 'Personal', used: 3, total: 6 },
    { type: 'Maternity', used: 60, total: 120 }
  ];

  const attendanceData = {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    present: [285, 278, 290, 282, 275],
    absent: [18, 22, 15, 20, 25],
    late: [8, 12, 7, 10, 12]
  };

  const payrollDepts = [
    { name: 'Engineering', amount: 620000, pct: 33.6 },
    { name: 'Marketing', amount: 340000, pct: 18.5 },
    { name: 'Sales', amount: 280000, pct: 15.2 },
    { name: 'Operations', amount: 250000, pct: 13.6 },
    { name: 'Finance', amount: 192500, pct: 10.4 },
    { name: 'HR', amount: 160000, pct: 8.7 }
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Calendar events
  const calendarEvents = [
    { date: 8, month: 6, year: 2025, title: 'Sarah\'s Birthday', type: 'birthday' },
    { date: 15, month: 6, year: 2025, title: 'Independence Day (Observed)', type: 'holiday' },
    { date: 22, month: 6, year: 2025, title: 'All-Hands Meeting', type: 'meeting' },
    { date: 25, month: 6, year: 2025, title: 'Quarterly Review', type: 'meeting' },
    { date: 1, month: 7, year: 2025, title: 'New Hire Orientation', type: 'event' },
    { date: 5, month: 7, year: 2025, title: 'Team Building Workshop', type: 'meeting' },
    { date: 10, month: 7, year: 2025, title: 'Marketing Sprint Review', type: 'meeting' },
    { date: 15, month: 7, year: 2025, title: 'Payroll Processing Day', type: 'event' },
    { date: 18, month: 7, year: 2025, title: 'Elena\'s Birthday', type: 'birthday' },
    { date: 22, month: 7, year: 2025, title: 'Board Meeting', type: 'meeting' },
    { date: 25, month: 7, year: 2025, title: '1-on-1 Reviews Due', type: 'event' },
    { date: 4, month: 7, year: 2025, title: 'Independence Day', type: 'holiday' },
    { date: 12, month: 7, year: 2025, title: 'Ben\'s Birthday', type: 'birthday' }
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
  const attendanceCanvas = $('#attendanceChart');
  const payrollCanvas = $('#payrollChart');

  const empGrid = $('#employeeGrid');
  const empSearch = $('#empSearch');
  const deptFilter = $('#deptFilter');
  const statusFilter = $('#statusFilter');

  const leaveBodyDashboard = $('#leaveBodyDashboard');
  const leaveBodyFull = $('#leaveBodyFull');
  const leaveFilter = $('#leaveFilter');
  const leaveBalanceList = $('#leaveBalanceList');

  const reportType = $('#reportType');
  const reportFrom = $('#reportFrom');
  const reportTo = $('#reportTo');
  const reportFormat = $('#reportFormat');
  const generateReportBtn = $('#generateReportBtn');
  const reportPreviewBody = $('#reportPreviewBody');

  const calendarGrid = $('#calendarGrid');
  const calMonthLabel = $('#calMonthLabel');
  const calPrev = $('#calPrev');
  const calNext = $('#calNext');
  const eventsDate = $('#eventsDate');
  const eventsList = $('#eventsList');

  const toastContainer = $('#toastContainer');

  let calendarDate = new Date(2025, 6, 1);
  let selectedDate = new Date(2025, 6, 22);

  // ====== LOADING ======
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      initDashboard();
    }, 1200);
  });

  // ====== THEME ======
  function initTheme() {
    const saved = localStorage.getItem('atlas-theme');
    if (saved === 'light') document.body.classList.add('light-mode');
  }
  initTheme();

  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('atlas-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    redrawCharts();
  });

  // ====== SIDEBAR ======
  mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 && !sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  // ====== NAVIGATION (multi-page links) ======
  // Remove SPA navigation; real href links handle page changes

  // ====== ANIMATED COUNTERS ======
  function animateCounters() {
    $$('.stat-value[data-target]').forEach(counter => {
      const target = parseFloat(counter.dataset.target);
      const duration = 2000;
      const startTime = performance.now();
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else counter.textContent = Math.floor(target).toLocaleString();
      }
      requestAnimationFrame(update);
    });
  }

  // ====== CANVAS HELPERS ======
  function getComputedStyles() {
    const isLight = document.body.classList.contains('light-mode');
    return {
      bg: isLight ? '#ffffff' : '#ffffff',
      text: isLight ? '#475569' : '#475569',
      gridLine: isLight ? '#f1f5f9' : '#e2e8f0'
    };
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

  // ====== ATTENDANCE CHART (BAR) ======
  function drawAttendanceChart() {
    if (!attendanceCanvas) return;
    const styles = getComputedStyles();
    const w = attendanceCanvas.parentElement.clientWidth - 32 || 700;
    const h = 260;
    const ctx = setupCanvas(attendanceCanvas, w, h);

    const padding = { top: 20, right: 20, bottom: 36, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxVal = Math.max(...attendanceData.present) * 1.2;
    const groupW = chartW / attendanceData.days.length;
    const barW = groupW * 0.22;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = styles.gridLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke();
      ctx.fillStyle = styles.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (i / 4) * maxVal), padding.left - 8, y + 4);
    }
    ctx.setLineDash([]);

    const colors = { present: '#14b8a6', absent: '#f43f5e', late: '#eab308' };

    attendanceData.days.forEach((day, i) => {
      const cx = padding.left + i * groupW + groupW / 2;
      ctx.fillStyle = styles.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day, cx, h - padding.bottom + 18);

      const datasets = [
        { key: 'present', data: attendanceData.present, color: colors.present },
        { key: 'absent', data: attendanceData.absent, color: colors.absent },
        { key: 'late', data: attendanceData.late, color: colors.late }
      ];

      datasets.forEach((ds, di) => {
        const barX = cx - barW * 1.5 + di * barW;
        const barH = (ds.data[i] / maxVal) * chartH;
        const barY = padding.top + chartH - barH;

        ctx.fillStyle = ds.color;
        ctx.globalAlpha = 0.85;
        const radius = 3;
        const bw = barW - 4;
        ctx.beginPath();
        ctx.moveTo(barX + radius, barY);
        ctx.lineTo(barX + bw - radius, barY);
        ctx.quadraticCurveTo(barX + bw, barY, barX + bw, barY + radius);
        ctx.lineTo(barX + bw, padding.top + chartH);
        ctx.lineTo(barX, padding.top + chartH);
        ctx.lineTo(barX, barY + radius);
        ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    });

    // Legend
    const legendX = w - 160;
    const legendY = 10;
    const legendItems = [
      { label: 'Present', color: colors.present },
      { label: 'Absent', color: colors.absent },
      { label: 'Late', color: colors.late }
    ];
    legendItems.forEach((li, i) => {
      const lx = legendX + i * 55;
      ctx.fillStyle = li.color;
      ctx.fillRect(lx, legendY, 10, 10);
      ctx.fillStyle = styles.text;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(li.label, lx + 14, legendY + 9);
    });
  }

  // ====== PAYROLL CHART (HORIZONTAL BAR) ======
  function drawPayrollChart() {
    if (!payrollCanvas) return;
    const styles = getComputedStyles();
    const w = payrollCanvas.parentElement.clientWidth - 32 || 700;
    const h = 260;
    const ctx = setupCanvas(payrollCanvas, w, h);

    const padding = { top: 10, right: 20, bottom: 10, left: 110 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxAmt = Math.max(...payrollDepts.map(d => d.amount));
    const barH = chartH / payrollDepts.length * 0.65;
    const gap = chartH / payrollDepts.length;

    ctx.clearRect(0, 0, w, h);

    const colors = ['#14b8a6', '#0d9488', '#f43f5e', '#eab308', '#22c55e', '#14b8a6'];

    payrollDepts.forEach((dept, i) => {
      const y = padding.top + i * gap + (gap - barH) / 2;
      const barW = (dept.amount / maxAmt) * chartW;

      // Label
      ctx.fillStyle = styles.text;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(dept.name, padding.left - 10, y + barH / 2 + 4);

      // Bar
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, colors[i % colors.length]);
      grad.addColorStop(1, colors[i % colors.length] + '88');
      ctx.fillStyle = grad;
      ctx.beginPath();
      const r = 4;
      ctx.moveTo(padding.left + r, y);
      ctx.lineTo(padding.left + barW - r, y);
      ctx.quadraticCurveTo(padding.left + barW, y, padding.left + barW, y + r);
      ctx.lineTo(padding.left + barW, y + barH - r);
      ctx.quadraticCurveTo(padding.left + barW, y + barH, padding.left + barW - r, y + barH);
      ctx.lineTo(padding.left + r, y + barH);
      ctx.quadraticCurveTo(padding.left, y + barH, padding.left, y + barH - r);
      ctx.lineTo(padding.left, y + r);
      ctx.quadraticCurveTo(padding.left, y, padding.left + r, y);
      ctx.fill();

      // Amount
      ctx.fillStyle = styles.text;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('$' + (dept.amount / 1000).toFixed(0) + 'k', padding.left + barW + 8, y + barH / 2 + 4);
    });
  }

  function redrawCharts() {
    drawAttendanceChart();
    drawPayrollChart();
  }

  // ====== EMPLOYEE DIRECTORY ======
  function renderEmployees(data) {
    empGrid.innerHTML = '';
    data.forEach((emp, i) => {
      const card = document.createElement('div');
      card.className = 'employee-card';
      card.style.animationDelay = (i * 0.05) + 's';
      const initials = emp.name.split(' ').map(n => n[0]).join('');
      card.innerHTML = `
        <div class="emp-avatar">${initials}</div>
        <div class="emp-info">
          <div class="emp-name">${emp.name}</div>
          <div class="emp-role">${emp.position}</div>
          <div class="emp-dept">${emp.dept}</div>
          <div class="emp-contact">${emp.email} &middot; ${emp.phone}</div>
        </div>
        <span class="status-badge ${emp.status}">${emp.status === 'on-leave' ? 'On Leave' : emp.status}</span>
      `;
      empGrid.appendChild(card);
    });
  }

  function filterEmployees() {
    const search = empSearch.value.toLowerCase();
    const dept = deptFilter.value;
    const status = statusFilter.value;
    const filtered = employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(search) || emp.email.toLowerCase().includes(search) || emp.position.toLowerCase().includes(search);
      const matchDept = dept === 'all' || emp.dept.toLowerCase() === dept;
      const matchStatus = status === 'all' || emp.status === status;
      return matchSearch && matchDept && matchStatus;
    });
    renderEmployees(filtered);
  }

  if (empSearch) empSearch.addEventListener('input', filterEmployees);
  if (deptFilter) deptFilter.addEventListener('change', filterEmployees);
  if (statusFilter) statusFilter.addEventListener('change', filterEmployees);

  // ====== LEAVE TABLE ======
  function renderLeaveTable(container, data, showActions) {
    container.innerHTML = '';
    data.forEach(lr => {
      const row = document.createElement('tr');
      const fromDate = new Date(lr.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const toDate = new Date(lr.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const dates = lr.from === lr.to ? fromDate : `${fromDate} - ${toDate}`;
      let actionsHtml = '';
      if (showActions) {
        if (lr.status === 'pending') {
          actionsHtml = `
            <button class="action-sm-btn approve" data-action="approve" data-name="${lr.name}">Approve</button>
            <button class="action-sm-btn reject" data-action="reject" data-name="${lr.name}">Reject</button>
          `;
        } else {
          actionsHtml = `<span style="font-size:0.78rem;color:var(--text-muted)">No action needed</span>`;
        }
      }
      const cols = showActions ? 6 : 4;
      row.innerHTML = `
        <td class="emp-name-cell">${lr.name}</td>
        <td>${lr.type}</td>
        <td>${fromDate}</td>
        ${showActions ? `<td>${toDate}</td>` : ''}
        <td><span class="status-badge ${lr.status}">${lr.status}</span></td>
        <td>${actionsHtml}</td>
      `;
      container.appendChild(row);

      if (showActions) {
        row.querySelectorAll('[data-action="approve"]').forEach(btn => {
          btn.addEventListener('click', () => { showToast(`Leave approved for ${lr.name}`, 'success'); lr.status = 'approved'; renderFullLeave(); renderDashLeave(); });
        });
        row.querySelectorAll('[data-action="reject"]').forEach(btn => {
          btn.addEventListener('click', () => { showToast(`Leave rejected for ${lr.name}`, 'warning'); lr.status = 'rejected'; renderFullLeave(); renderDashLeave(); });
        });
      }
    });
  }

  function renderDashLeave() {
    leaveBodyDashboard.innerHTML = '';
    leaveRequests.slice(0, 5).forEach(lr => {
      const row = document.createElement('tr');
      const fromDate = new Date(lr.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const toDate = new Date(lr.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dates = lr.from === lr.to ? fromDate : `${fromDate} - ${toDate}`;
      row.innerHTML = `
        <td class="emp-name-cell">${lr.name}</td>
        <td>${lr.type}</td>
        <td>${dates}</td>
        <td><span class="status-badge ${lr.status}">${lr.status}</span></td>
      `;
      leaveBodyDashboard.appendChild(row);
    });
  }

  function renderFullLeave() {
    leaveBodyFull.innerHTML = '';
    const status = leaveFilter.value;
    const filtered = status === 'all' ? leaveRequests : leaveRequests.filter(lr => lr.status === status);
    renderLeaveTable(leaveBodyFull, filtered, true);
  }

  leaveFilter.addEventListener('change', renderFullLeave);

  // ====== LEAVE BALANCES ======
  function renderLeaveBalances() {
    leaveBalanceList.innerHTML = '';
    leaveBalances.forEach(lb => {
      const item = document.createElement('div');
      item.className = 'leave-balance-item';
      const pct = (lb.used / lb.total) * 100;
      item.innerHTML = `
        <span class="balance-type">${lb.type}</span>
        <div class="balance-bar"><div class="balance-fill" style="width: ${pct}%"></div></div>
        <span class="balance-used">${lb.used} used</span>
        <span class="balance-total">${lb.total} days</span>
      `;
      leaveBalanceList.appendChild(item);
    });
  }

  // ====== REPORTS ======
  if (generateReportBtn) generateReportBtn.addEventListener('click', () => {
    const type = reportType.value;
    const from = reportFrom.value;
    const to = reportTo.value;
    const format = reportFormat.value;
    const fromD = new Date(from).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const toD = new Date(to).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const previews = {
      attendance: `<strong>Attendance Report</strong><br><br>
        Period: ${fromD} — ${toD}<br>
        Total Working Days: 21<br>
        Average Present: 282 (87.1%)<br>
        Average Absent: 20 (6.1%)<br>
        Average Late: 10 (3.1%)<br>
        Highest Attendance: Wednesday (290 present)<br>
        Lowest Attendance: Friday (275 present)<br><br>
        <span style="color:var(--text-muted)">Summary: Attendance remains strong with mid-week peaks. Friday absenteeism is slightly elevated.</span>`,
      payroll: `<strong>Payroll Report</strong><br><br>
        Period: ${fromD} — ${toD}<br>
        Total Payroll: $1,842,500<br>
        Total Employees: 342<br>
        Average Salary: $64,681<br>
        Largest Department: Engineering ($620,000)<br>
        Pending Payments: $124,800<br><br>
        <span style="color:var(--text-muted)">Payroll distribution is balanced across departments. No anomalies detected.</span>`,
      performance: `<strong>Performance Report</strong><br><br>
        Period: ${fromD} — ${toD}<br>
        Reviews Completed: 48 of 52<br>
        Top Performers: 12<br>
        Meets Expectations: 28<br>
        Needs Improvement: 8<br>
        Average Rating: 4.1 / 5.0<br><br>
        <span style="color:var(--text-muted)">Team performance is strong. Engineering and Sales lead in ratings.</span>`,
      turnover: `<strong>Turnover Report</strong><br><br>
        Period: ${fromD} — ${toD}<br>
        Current Turnover Rate: 1.8%<br>
        New Hires: 5<br>
        Departures: 3<br>
        Voluntary: 2<br>
        Involuntary: 1<br>
        Avg Tenure of Departures: 2.4 years<br><br>
        <span style="color:var(--text-muted)">Turnover remains below industry average of 3.5%. Retention efforts are effective.</span>`
    };

    reportPreviewBody.innerHTML = previews[type] || 'Select report parameters and generate.';
    if (reportPreviewBody) showToast(`Report generated in ${format.toUpperCase()} format`, 'success');
  });

  // ====== CALENDAR ======
  function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    calMonthLabel.textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const today = new Date();
    const selected = selectedDate;

    let html = '';
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(d => {
      html += `<div class="cal-day-header">${d}</div>`;
    });

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      html += `<div class="cal-day other-month">${daysInPrev - i}</div>`;
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const classes = ['cal-day'];
      if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) classes.push('today');
      if (year === selected.getFullYear() && month === selected.getMonth() && d === selected.getDate()) classes.push('selected');

      const dayEvents = calendarEvents.filter(e => e.date === d && e.month === month && e.year === year);
      if (dayEvents.length > 0) {
        const hasBirthday = dayEvents.some(e => e.type === 'birthday');
        const hasHoliday = dayEvents.some(e => e.type === 'holiday');
        const hasMeeting = dayEvents.some(e => e.type === 'meeting');
        if (hasBirthday) classes.push('birthday');
        else if (hasHoliday) classes.push('holiday');
        else classes.push('has-event');
      }

      html += `<div class="${classes.join(' ')}" data-day="${d}">${d}</div>`;
    }

    // Next month
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - totalCells % 7) % 7;
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="cal-day other-month">${i}</div>`;
    }

    calendarGrid.innerHTML = html;

    // Click handlers
    calendarGrid.querySelectorAll('.cal-day:not(.other-month)').forEach(el => {
      el.addEventListener('click', () => {
        const day = parseInt(el.dataset.day);
        selectedDate = new Date(year, month, day);
        renderCalendar();
        renderEventsForDate(day, month, year);
      });
    });

    // Show events for selected date
    renderEventsForDate(selected.getDate(), selected.getMonth(), selected.getFullYear());
  }

  function renderEventsForDate(day, month, year) {
    const dateObj = new Date(year, month, day);
    eventsDate.textContent = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const dayEvents = calendarEvents.filter(e => e.date === day && e.month === month && e.year === year);

    eventsList.innerHTML = '';
    if (dayEvents.length === 0) {
      eventsList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No events scheduled for this day.</p>';
      return;
    }

    dayEvents.forEach(ev => {
      const item = document.createElement('div');
      item.className = 'event-item';
      item.innerHTML = `
        <div class="event-dot ${ev.type}"></div>
        <div class="event-text"><strong>${ev.title}</strong><br><span style="font-size:0.78rem;color:var(--text-muted);text-transform:capitalize">${ev.type}</span></div>
      `;
      eventsList.appendChild(item);
    });
  }

  if (calPrev) calPrev.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  });

  if (calNext) calNext.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
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
  function initHRDashboard() {
    animateCounters();
    renderEmployees(employees);
    renderDashLeave();
    renderFullLeave();
    renderLeaveBalances();
    renderCalendar();
    redrawCharts();
  }

  function initHREmployeesPage() {
    renderEmployees(employees);
    if (empSearch) empSearch.addEventListener('input', filterEmployees);
    if (deptFilter) deptFilter.addEventListener('change', filterEmployees);
    if (statusFilter) statusFilter.addEventListener('change', filterEmployees);
  }

  function initHRAttendancePage() {
    animateCounters();
    drawAttendanceChart();

    // Department attendance chart
    const deptCanvas = document.getElementById('deptAttendanceChart');
    if (deptCanvas) {
      const styles = getComputedStyles();
      const w = deptCanvas.parentElement.clientWidth - 32 || 700;
      const h = 260;
      const ctx = setupCanvas(deptCanvas, w, h);
      const padding = { top: 20, right: 100, bottom: 36, left: 60 };
      const chartW = w - padding.left - padding.right;
      const chartH = h - padding.top - padding.bottom;

      const depts = [
        { name: 'Engineering', rate: 94 },
        { name: 'Marketing', rate: 88 },
        { name: 'Sales', rate: 85 },
        { name: 'Operations', rate: 91 },
        { name: 'Finance', rate: 89 },
        { name: 'HR', rate: 93 }
      ];

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = styles.gridLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (i / 4) * chartH;
        ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke();
        ctx.fillStyle = styles.text;
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText((100 - (i / 4) * 100) + '%', padding.left - 8, y + 4);
      }
      ctx.setLineDash([]);

      depts.forEach((d, i) => {
        const barX = padding.left + (i / depts.length) * chartW + 4;
        const barW2 = (chartW / depts.length) - 8;
        const barH2 = (d.rate / 100) * chartH;
        const barY = padding.top + chartH - barH2;

        const colors = ['#14b8a6', '#0d9488', '#f43f5e', '#eab308', '#22c55e', '#14b8a6'];

        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        const r = 4;
        ctx.moveTo(barX + r, barY);
        ctx.lineTo(barX + barW2 - r, barY);
        ctx.quadraticCurveTo(barX + barW2, barY, barX + barW2, barY + r);
        ctx.lineTo(barX + barW2, padding.top + chartH);
        ctx.lineTo(barX, padding.top + chartH);
        ctx.lineTo(barX, barY + r);
        ctx.quadraticCurveTo(barX, barY, barX + r, barY);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = styles.text;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.name, barX + barW2 / 2, h - padding.bottom + 16);
        ctx.fillText(d.rate + '%', barX + barW2 / 2, barY - 6);
      });
    }
  }

  function initHRLeavePage() {
    renderFullLeave();
    renderLeaveBalances();
    renderCalendar();

  if (leaveFilter) leaveFilter.addEventListener('change', renderFullLeave);
    calPrev.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendar(); });
    calNext.addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendar(); });
  }

  function initHRPayrollPage() {
    animateCounters();
  }

  function initHRReportsPage() {
    generateReportBtn.addEventListener('click', () => {
      const type = reportType.value;
      const from = reportFrom.value;
      const to = reportTo.value;
      const format = reportFormat.value;
      const fromD = new Date(from).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const toD = new Date(to).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      const previews = {
        attendance: `<strong>Attendance Report</strong><br><br>
          Period: ${fromD} — ${toD}<br>
          Total Working Days: 21<br>
          Average Present: 282 (87.1%)<br>
          Average Absent: 20 (6.1%)<br>
          Average Late: 10 (3.1%)<br>
          Highest Attendance: Wednesday (290 present)<br>
          Lowest Attendance: Friday (275 present)<br><br>
          <span style="color:var(--text-muted)">Summary: Attendance remains strong with mid-week peaks.</span>`,
        payroll: `<strong>Payroll Report</strong><br><br>
          Period: ${fromD} — ${toD}<br>
          Total Payroll: $1,842,500<br>
          Total Employees: 342<br>
          Average Salary: $64,681<br>
          Largest Department: Engineering ($620,000)<br>
          Pending Payments: $124,800<br><br>
          <span style="color:var(--text-muted)">Payroll distribution is balanced across departments.</span>`,
        performance: `<strong>Performance Report</strong><br><br>
          Period: ${fromD} — ${toD}<br>
          Reviews Completed: 48 of 52<br>
          Top Performers: 12<br>
          Meets Expectations: 28<br>
          Needs Improvement: 8<br>
          Average Rating: 4.1 / 5.0<br><br>
          <span style="color:var(--text-muted)">Team performance is strong. Engineering and Sales lead in ratings.</span>`,
        turnover: `<strong>Turnover Report</strong><br><br>
          Period: ${fromD} — ${toD}<br>
          Current Turnover Rate: 1.8%<br>
          New Hires: 5<br>
          Departures: 3<br>
          Voluntary: 2<br>
          Involuntary: 1<br>
          Avg Tenure of Departures: 2.4 years<br><br>
          <span style="color:var(--text-muted)">Turnover remains below industry average of 3.5%.</span>`
      };

      reportPreviewBody.innerHTML = previews[type] || 'Select report parameters and generate.';
      showToast(`Report generated in ${format.toUpperCase()} format`, 'success');
    });
  }

  // Expose toast globally for inline use
  window.showToast = showToast;

})();
