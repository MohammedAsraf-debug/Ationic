(function() {
  'use strict';

  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var incomeData = [42100,45800,48200,46500,50100,49800,52400,51200,54600,53900,55800,57400];
  var expenseData = [29600,31600,32400,30200,32800,30100,32000,30500,33200,32400,33600,35000];
  var profitData = [12500,14200,15800,16300,17300,19700,20400,20700,21400,21500,22200,22400];
  window.months = months; window.incomeData = incomeData; window.expenseData = expenseData; window.profitData = profitData;

  function $(sel, ctx) { return (ctx||document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx||document).querySelectorAll(sel)); }
  window.$ = $; window.$$ = $$;

  function formatCurrency(val) {
    if (val >= 1000) return '$' + (val/1000).toFixed(1) + 'K';
    return '$' + val.toLocaleString();
  }
  window.formatCurrency = formatCurrency;

  window.addEventListener('load', function() {
    setTimeout(function() {
      var loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
      highlightActiveNav(); setupMenuToggle(); setCurrentDate();
    }, 800);
  });

  function highlightActiveNav() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav-item').forEach(function(item) {
      var href = item.getAttribute('href');
      if (href === page) item.classList.add('active');
      else item.classList.remove('active');
    });
  }

  function setCurrentDate() {
    var el = document.getElementById('currentDate');
    if (!el) return;
    el.textContent = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  }

  function animateCounters() {
    $$('.card-value[data-target]').forEach(function(el) {
      var target = parseFloat(el.getAttribute('data-target'));
      var suffix = el.getAttribute('data-suffix') || '';
      var isCurrency = el.textContent.indexOf('$') !== -1;
      var duration = 1500, startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / duration, 1);
        var e = 1 - Math.pow(1 - p, 3);
        var c = Math.round(e * target);
        el.textContent = isCurrency ? '$' + c.toLocaleString() : c.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = isCurrency ? '$' + target.toLocaleString() : target.toLocaleString() + suffix;
      }
      requestAnimationFrame(step);
    });
  }
  window.animateCounters = animateCounters;

  function renderBarChart() {
    var container = document.getElementById('barChart');
    if (!container) return;
    var w = container.clientWidth || 600, h = container.clientHeight || 280;
    var pad = { top:20, right:20, bottom:50, left:60 };
    var cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;
    var maxVal = Math.max.apply(null, incomeData.concat(expenseData));
    var stepH = ch / maxVal, barW = cw / months.length / 3;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    for (var i = 0; i <= 5; i++) {
      var val = Math.round((maxVal / 5) * i), y = pad.top + ch - (val / maxVal) * ch;
      var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('x1', pad.left); ln.setAttribute('y1', y);
      ln.setAttribute('x2', w - pad.right); ln.setAttribute('y2', y);
      ln.setAttribute('stroke', 'rgba(255,255,255,0.06)'); ln.setAttribute('stroke-width', '1');
      svg.appendChild(ln);
      var tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tx.setAttribute('x', pad.left - 10); tx.setAttribute('y', y + 4);
      tx.setAttribute('text-anchor', 'end'); tx.setAttribute('fill', '#6b7280');
      tx.setAttribute('font-size', '11'); tx.textContent = '$' + (val/1000).toFixed(0) + 'K';
      svg.appendChild(tx);
    }
    months.forEach(function(m, i) {
      var x = pad.left + i * (cw / months.length) + (cw / months.length - barW * 2) / 2;
      [[incomeData[i], '#22c55e'], [expenseData[i], '#ef4444']].forEach(function(d, j) {
        var r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('x', x + j * (barW + 2)); r.setAttribute('y', pad.top + ch);
        r.setAttribute('width', barW); r.setAttribute('height', '0');
        r.setAttribute('fill', d[1]); r.setAttribute('rx', '3');
        r.setAttribute('data-target-height', d[0] * stepH);
        svg.appendChild(r);
      });
      var tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tx.setAttribute('x', x + barW); tx.setAttribute('y', pad.top + ch + 18);
      tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('fill', '#6b7280');
      tx.setAttribute('font-size', '10'); tx.textContent = m;
      svg.appendChild(tx);
    });
    [['Income', '#22c55e', pad.left], ['Expenses', '#ef4444', pad.left + 80]].forEach(function(g) {
      var lg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      lg.setAttribute('x', g[2]); lg.setAttribute('y', 8);
      lg.setAttribute('width', '10'); lg.setAttribute('height', '10');
      lg.setAttribute('fill', g[1]); lg.setAttribute('rx', '2');
      svg.appendChild(lg);
      var lt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lt.setAttribute('x', g[2] + 16); lt.setAttribute('y', 17);
      lt.setAttribute('fill', '#6b7280'); lt.setAttribute('font-size', '11');
      lt.textContent = g[0]; svg.appendChild(lt);
    });
    container.innerHTML = ''; container.appendChild(svg);
    setTimeout(function() {
      svg.querySelectorAll('rect[data-target-height]').forEach(function(rect) {
        var th = parseFloat(rect.getAttribute('data-target-height'));
        rect.setAttribute('y', pad.top + ch - th); rect.setAttribute('height', th);
      });
    }, 300);
  }
  window.renderBarChart = renderBarChart;

  function renderLineChart() {
    var container = document.getElementById('lineChart');
    if (!container) return;
    var w = container.clientWidth || 600, h = container.clientHeight || 280;
    var pad = { top:30, right:50, bottom:50, left:50 };
    var cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;
    var projection = [23100, 23900, 24800];
    var allData = profitData.concat(projection);
    var maxVal = Math.max.apply(null, allData) * 1.15, minVal = Math.min.apply(null, profitData) * 0.85, range = maxVal - minVal;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    for (var i = 0; i <= 4; i++) {
      var val = minVal + (range / 4) * i, y = pad.top + ch - ((val - minVal) / range) * ch;
      var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('x1', pad.left); ln.setAttribute('y1', y);
      ln.setAttribute('x2', w - pad.right); ln.setAttribute('y2', y);
      ln.setAttribute('stroke', 'rgba(255,255,255,0.06)'); ln.setAttribute('stroke-width', '1');
      svg.appendChild(ln);
      var tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tx.setAttribute('x', pad.left - 8); tx.setAttribute('y', y + 4);
      tx.setAttribute('text-anchor', 'end'); tx.setAttribute('fill', '#6b7280');
      tx.setAttribute('font-size', '10'); tx.textContent = '$' + (val/1000).toFixed(1) + 'K';
      svg.appendChild(tx);
    }
    function getX(i) { return pad.left + (i / 14) * cw; }
    function getY(v) { return pad.top + ch - ((v - minVal) / range) * ch; }
    var areaPath = 'M ' + getX(0) + ' ' + getY(0);
    for (i = 0; i < profitData.length; i++) areaPath += ' L ' + getX(i) + ' ' + getY(profitData[i]);
    areaPath += ' L ' + getX(profitData.length - 1) + ' ' + (pad.top + ch) + ' Z';
    var area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaPath); area.setAttribute('fill', 'rgba(234,179,8,0.08)');
    svg.appendChild(area);
    var path = 'M ' + getX(0) + ' ' + getY(profitData[0]);
    for (i = 1; i < profitData.length; i++) path += ' L ' + getX(i) + ' ' + getY(profitData[i]);
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', path); line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#eab308'); line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-linecap', 'round'); line.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(line);
    var projPath = 'M ' + getX(11) + ' ' + getY(profitData[11]);
    for (i = 0; i < projection.length; i++) projPath += ' L ' + getX(12 + i) + ' ' + getY(projection[i]);
    var projLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    projLine.setAttribute('d', projPath); projLine.setAttribute('fill', 'none');
    projLine.setAttribute('stroke', '#eab308'); projLine.setAttribute('stroke-width', '2');
    projLine.setAttribute('stroke-dasharray', '6,4'); projLine.setAttribute('opacity', '0.5');
    svg.appendChild(projLine);
    profitData.forEach(function(val, i) {
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', getX(i)); c.setAttribute('cy', getY(val));
      c.setAttribute('r', '4'); c.setAttribute('fill', '#eab308'); svg.appendChild(c);
    });
    projection.forEach(function(val, i) {
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', getX(12 + i)); c.setAttribute('cy', getY(val));
      c.setAttribute('r', '3'); c.setAttribute('fill', '#eab308'); c.setAttribute('opacity', '0.5'); svg.appendChild(c);
    });
    months.forEach(function(m, i) {
      if (i % 2 === 0) {
        var tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tx.setAttribute('x', getX(i)); tx.setAttribute('y', pad.top + ch + 18);
        tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('fill', '#6b7280');
        tx.setAttribute('font-size', '10'); tx.textContent = m; svg.appendChild(tx);
      }
    });
    container.innerHTML = ''; container.appendChild(svg);
  }
  window.renderLineChart = renderLineChart;

  function renderDonutChart() {
    var container = document.getElementById('donutChart');
    if (!container) return;
    var categories = [
      { label:'Payroll', pct:42, color:'#ef4444' }, { label:'Operations', pct:18, color:'#f59e0b' },
      { label:'Marketing', pct:15, color:'#3b82f6' }, { label:'Tech', pct:12, color:'#22c55e' },
      { label:'Admin', pct:8, color:'#8b5cf6' }, { label:'Other', pct:5, color:'#ec4899' }
    ];
    var w = Math.min(container.clientWidth || 400, 400), h = 260, cx = w/2, cy = 130, r = 90, ir = 55;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    var currentAngle = -90;
    categories.forEach(function(cat) {
      var angle = (cat.pct / 100) * 360, sr = (currentAngle * Math.PI) / 180, er = ((currentAngle + angle) * Math.PI) / 180;
      var x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr);
      var x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er);
      var x1i = cx + ir * Math.cos(sr), y1i = cy + ir * Math.sin(sr);
      var x2i = cx + ir * Math.cos(er), y2i = cy + ir * Math.sin(er);
      var la = angle > 180 ? 1 : 0;
      var d = 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + la + ' 1 ' + x2 + ' ' + y2 +
              ' L ' + x2i + ' ' + y2i + ' A ' + ir + ' ' + ir + ' 0 ' + la + ' 0 ' + x1i + ' ' + y1i + ' Z';
      var e = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      e.setAttribute('d', d); e.setAttribute('fill', cat.color); e.setAttribute('opacity', '0');
      svg.appendChild(e);
      setTimeout(function() { e.setAttribute('opacity', '1'); }, 200 + categories.indexOf(cat) * 100);
      currentAngle += angle;
    });
    container.innerHTML = ''; container.appendChild(svg);
    var legendEl = document.getElementById('donutLegend');
    if (legendEl) legendEl.innerHTML = categories.map(function(c) {
      return '<span class="legend-item"><span class="legend-dot" style="background:' + c.color + '"></span>' + c.label + ' ' + c.pct + '%</span>';
    }).join('');
  }
  window.renderDonutChart = renderDonutChart;

  function renderStackedChart() {
    var container = document.getElementById('stackedChart');
    if (!container) return;
    var w = container.clientWidth || 500, h = container.clientHeight || 280;
    var pad = { top:20, right:20, bottom:50, left:50 };
    var cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;
    var sources = [
      { label:'Product Sales', pct:48, color:'#eab308' }, { label:'Services', pct:30, color:'#3b82f6' },
      { label:'Subscriptions', pct:15, color:'#22c55e' }, { label:'Other', pct:7, color:'#8b5cf6' }
    ];
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    sources.forEach(function(s, i) {
      var y = pad.top + 20 + i * 55;
      var tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tx.setAttribute('x', pad.left); tx.setAttribute('y', y + 12);
      tx.setAttribute('fill', '#6b7280'); tx.setAttribute('font-size', '12');
      tx.textContent = s.label; svg.appendChild(tx);
      var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', pad.left + 120); bg.setAttribute('y', y);
      bg.setAttribute('width', cw - 120); bg.setAttribute('height', '22');
      bg.setAttribute('fill', '#131823'); bg.setAttribute('rx', '4');
      svg.appendChild(bg);
      var fill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      fill.setAttribute('x', pad.left + 120); fill.setAttribute('y', y);
      fill.setAttribute('width', '0'); fill.setAttribute('height', '22');
      fill.setAttribute('fill', s.color); fill.setAttribute('rx', '4');
      fill.setAttribute('data-target-width', (s.pct / 100) * (cw - 120));
      svg.appendChild(fill);
      var pt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pt.setAttribute('x', pad.left + 125); pt.setAttribute('y', y + 15);
      pt.setAttribute('fill', '#e6edf3'); pt.setAttribute('font-size', '11');
      pt.setAttribute('font-weight', '600'); pt.textContent = s.pct + '%';
      svg.appendChild(pt);
    });
    container.innerHTML = ''; container.appendChild(svg);
    setTimeout(function() {
      svg.querySelectorAll('rect[data-target-width]').forEach(function(rect) {
        rect.setAttribute('width', parseFloat(rect.getAttribute('data-target-width')));
      });
    }, 500);
    var legendEl = document.getElementById('stackedLegend');
    if (legendEl) legendEl.innerHTML = sources.map(function(s) {
      return '<span class="legend-item"><span class="legend-dot" style="background:' + s.color + '"></span>' + s.label + ' ' + s.pct + '%</span>';
    }).join('');
  }
  window.renderStackedChart = renderStackedChart;

  var transactions = [
    { date:'2026-07-22', desc:'Product Sale - Enterprise License', cat:'Product Sales', type:'income', amount:28500, status:'completed' },
    { date:'2026-07-21', desc:'Monthly Retainer - Client A', cat:'Services', type:'income', amount:12000, status:'completed' },
    { date:'2026-07-21', desc:'AWS Cloud Infrastructure', cat:'Tech', type:'expense', amount:4800, status:'completed' },
    { date:'2026-07-20', desc:'Google Ads Campaign', cat:'Marketing', type:'expense', amount:6200, status:'pending' },
    { date:'2026-07-19', desc:'Subscription Revenue - Premium Tier', cat:'Subscriptions', type:'income', amount:8400, status:'completed' },
    { date:'2026-07-18', desc:'Office Lease Payment', cat:'Operations', type:'expense', amount:11500, status:'completed' },
    { date:'2026-07-18', desc:'Consulting Services - Project Beta', cat:'Services', type:'income', amount:18500, status:'pending' },
    { date:'2026-07-17', desc:'Payroll - July', cat:'Payroll', type:'expense', amount:42000, status:'completed' },
    { date:'2026-07-17', desc:'Product Sale - SaaS License', cat:'Product Sales', type:'income', amount:9500, status:'completed' },
    { date:'2026-07-16', desc:'LinkedIn Ad Campaign', cat:'Marketing', type:'expense', amount:3400, status:'completed' }
  ];
  window.transactions = transactions;

  function renderTransactions(filter) {
    filter = filter || { search:'', type:'all', status:'all' };
    var tbody = document.getElementById('transactionsBody');
    if (!tbody) return;
    var filtered = transactions.filter(function(t) {
      if (filter.type !== 'all' && t.type !== filter.type) return false;
      if (filter.status !== 'all' && t.status !== filter.status) return false;
      if (filter.search) {
        var s = filter.search.toLowerCase();
        if (t.desc.toLowerCase().indexOf(s) === -1 && t.cat.toLowerCase().indexOf(s) === -1) return false;
      }
      return true;
    });
    tbody.innerHTML = filtered.map(function(t) {
      var sc = 'status-' + t.status, sign = t.type === 'income' ? '+' : '-', cls = t.type === 'income' ? 'positive' : 'negative';
      return '<tr><td>' + t.date + '</td><td>' + t.desc + '</td><td>' + t.cat + '</td><td>' + t.type.charAt(0).toUpperCase() + t.type.slice(1) + '</td><td class="' + cls + '">' + sign + '$' + t.amount.toLocaleString() + '</td><td><span class="status-badge ' + sc + '">' + t.status.charAt(0).toUpperCase() + t.status.slice(1) + '</span></td></tr>';
    }).join('');
  }
  window.renderTransactions = renderTransactions;

  var invoices = [
    { num:'INV-2026-0421', client:'TechNova Solutions', amount:28500, issue:'2026-07-15', due:'2026-08-14', status:'Paid' },
    { num:'INV-2026-0420', client:'GreenField Enterprises', amount:12000, issue:'2026-07-14', due:'2026-08-13', status:'Paid' },
    { num:'INV-2026-0419', client:'DataStream Inc.', amount:18500, issue:'2026-07-12', due:'2026-08-11', status:'Unpaid' },
    { num:'INV-2026-0418', client:'CloudBase Technologies', amount:24000, issue:'2026-07-10', due:'2026-08-09', status:'Paid' },
    { num:'INV-2026-0417', client:'Alpha Digital Group', amount:9500, issue:'2026-07-08', due:'2026-08-07', status:'Overdue' },
    { num:'INV-2026-0416', client:'Meridian Consulting', amount:15000, issue:'2026-07-05', due:'2026-08-04', status:'Unpaid' },
    { num:'INV-2026-0415', client:'NexGen Systems', amount:31000, issue:'2026-07-03', due:'2026-08-02', status:'Draft' },
    { num:'INV-2026-0414', client:'Pinnacle Media Group', amount:8400, issue:'2026-07-01', due:'2026-07-31', status:'Paid' }
  ];
  window.invoices = invoices;

  function renderInvoices() {
    var tbody = document.getElementById('invoicesBody');
    if (!tbody) return;
    tbody.innerHTML = invoices.map(function(inv) {
      return '<tr><td><strong>' + inv.num + '</strong></td><td>' + inv.client + '</td><td>$' + inv.amount.toLocaleString() + '</td><td>' + inv.issue + '</td><td>' + inv.due + '</td><td><span class="status-badge status-' + inv.status.toLowerCase() + '">' + inv.status + '</span></td><td><button class="action-btn" title="View">View</button><button class="action-btn" title="Download">DL</button></td></tr>';
    }).join('');
  }
  window.renderInvoices = renderInvoices;

  function setupMenuToggle() {
    var btn = document.getElementById('menuToggle'), sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', function() { sidebar.classList.toggle('open'); });
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !btn.contains(e.target)) sidebar.classList.remove('open');
    });
  }

  function exportCSV() {
    var rows = [['Date','Description','Category','Type','Amount','Status'].join(',')];
    transactions.forEach(function(t) { rows.push([t.date,'"'+t.desc+'"',t.cat,t.type,t.amount,t.status].join(',')); });
    var csv = rows.join('\n'), blob = new Blob([csv], { type:'text/csv' }), url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'fincontrol_transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  }
  window.exportCSV = exportCSV;

  function setupExportButtons() {
    var pdfBtn = document.getElementById('exportPdf'), csvBtn = document.getElementById('exportCsv'), printBtn = document.getElementById('exportPrint');
    if (pdfBtn) pdfBtn.addEventListener('click', function() { alert('PDF export initiated.'); });
    if (csvBtn) csvBtn.addEventListener('click', function() { exportCSV(); });
    if (printBtn) printBtn.addEventListener('click', function() { window.print(); });
  }
  window.setupExportButtons = setupExportButtons;

  function setupGlobalSearch() {
    var input = document.getElementById('globalSearch');
    if (!input) return;
    input.addEventListener('input', function() {
      var q = input.value.toLowerCase();
      $$('.data-table tbody tr').forEach(function(tr) {
        tr.style.display = tr.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }
  window.setupGlobalSearch = setupGlobalSearch;

  function setupFilters() {
    var si = document.getElementById('transactionSearch'), tf = document.getElementById('transactionFilter'), sf = document.getElementById('statusFilter');
    function apply() { renderTransactions({ search: si ? si.value : '', type: tf ? tf.value : 'all', status: sf ? sf.value : 'all' }); }
    if (si) si.addEventListener('input', apply);
    if (tf) tf.addEventListener('change', apply);
    if (sf) sf.addEventListener('change', apply);
  }
  window.setupFilters = setupFilters;

  function animateBars() {
    $$('.budget-fill').forEach(function(fill) {
      var w = fill.style.width; fill.style.width = '0%';
      setTimeout(function() { fill.style.width = w; }, 800);
    });
  }
  window.animateBars = animateBars;

  $$('.filter-select').forEach(function(sel) {
    sel.addEventListener('change', function() { this.style.color = '#e6edf3'; });
  });
})();
