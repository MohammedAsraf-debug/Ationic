(function() {
  'use strict';

  function $(sel, ctx) { return (ctx||document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx||document).querySelectorAll(sel)); }
  window.$ = $; window.$$ = $$;

  var days = [], currentVisitors = [], previousVisitors = [];
  var now = new Date();
  for (var i = 29; i >= 0; i--) {
    var d = new Date(now); d.setDate(d.getDate() - i);
    days.push(d.getDate() + '/' + (d.getMonth() + 1));
    currentVisitors.push(Math.floor(1800 + Math.random() * 2500));
    previousVisitors.push(Math.floor(1500 + Math.random() * 2200));
  }
  window.days = days; window.currentVisitors = currentVisitors; window.previousVisitors = previousVisitors;

  var peakIndices = [];
  var sorted = currentVisitors.slice().sort(function(a,b){return b-a});
  var top3 = sorted.slice(0,3);
  top3.forEach(function(v) {
    var idx = currentVisitors.indexOf(v);
    if (idx !== -1 && peakIndices.indexOf(idx) === -1) peakIndices.push(idx);
  });
  window.peakIndices = peakIndices;

  window.addEventListener('load', function() {
    setTimeout(function() {
      var loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
      highlightActiveNav(); setupMenuToggle();
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

  function animateCounters() {
    $$('.card-value[data-target]').forEach(function(el) {
      var target = parseFloat(el.getAttribute('data-target'));
      var isCurrency = el.textContent.indexOf('$') !== -1;
      var duration = 1500, startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / duration, 1);
        var e = 1 - Math.pow(1 - p, 3);
        var c = Math.round(e * target);
        el.textContent = isCurrency ? '$' + c.toLocaleString() : c.toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = isCurrency ? '$' + target.toLocaleString() : target.toLocaleString();
      }
      requestAnimationFrame(step);
    });
  }
  window.animateCounters = animateCounters;

  function renderAreaChart() {
    var container = document.getElementById('areaChart');
    if (!container) return;
    var w = container.clientWidth || 600, h = container.clientHeight || 280;
    var pad = { top:20, right:20, bottom:40, left:50 };
    var cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;
    var allVals = currentVisitors.concat(previousVisitors);
    var maxVal = Math.max.apply(null, allVals) * 1.12;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    for (var i = 0; i <= 4; i++) {
      var val = Math.round((maxVal / 4) * i), y = pad.top + ch - (val / maxVal) * ch;
      var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('x1', pad.left); ln.setAttribute('y1', y);
      ln.setAttribute('x2', w - pad.right); ln.setAttribute('y2', y);
      ln.setAttribute('stroke', '#e2e8f0'); ln.setAttribute('stroke-width', '1');
      svg.appendChild(ln);
      var tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tx.setAttribute('x', pad.left - 8); tx.setAttribute('y', y + 4);
      tx.setAttribute('text-anchor', 'end'); tx.setAttribute('fill', '#64748b');
      tx.setAttribute('font-size', '10'); tx.textContent = val.toLocaleString();
      svg.appendChild(tx);
    }
    function getX(i) { return pad.left + (i / 29) * cw; }
    function getY(v) { return pad.top + ch - (v / maxVal) * ch; }
    var prevArea = 'M ' + getX(0) + ' ' + (pad.top + ch);
    for (i = 0; i < previousVisitors.length; i++) prevArea += ' L ' + getX(i) + ' ' + getY(previousVisitors[i]);
    prevArea += ' L ' + getX(29) + ' ' + (pad.top + ch) + ' Z';
    var prevAreaEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    prevAreaEl.setAttribute('d', prevArea); prevAreaEl.setAttribute('fill', 'rgba(59,130,246,0.06)');
    svg.appendChild(prevAreaEl);
    var prevPath = 'M ' + getX(0) + ' ' + getY(previousVisitors[0]);
    for (i = 1; i < previousVisitors.length; i++) prevPath += ' L ' + getX(i) + ' ' + getY(previousVisitors[i]);
    var prevLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    prevLine.setAttribute('d', prevPath); prevLine.setAttribute('fill', 'none');
    prevLine.setAttribute('stroke', 'rgba(59,130,246,0.25)'); prevLine.setAttribute('stroke-width', '1.5');
    svg.appendChild(prevLine);
    var currArea = 'M ' + getX(0) + ' ' + (pad.top + ch);
    for (i = 0; i < currentVisitors.length; i++) currArea += ' L ' + getX(i) + ' ' + getY(currentVisitors[i]);
    currArea += ' L ' + getX(29) + ' ' + (pad.top + ch) + ' Z';
    var currAreaEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    currAreaEl.setAttribute('d', currArea); currAreaEl.setAttribute('fill', 'rgba(59,130,246,0.1)');
    svg.appendChild(currAreaEl);
    var currPath = 'M ' + getX(0) + ' ' + getY(currentVisitors[0]);
    for (i = 1; i < currentVisitors.length; i++) currPath += ' L ' + getX(i) + ' ' + getY(currentVisitors[i]);
    var currLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    currLine.setAttribute('d', currPath); currLine.setAttribute('fill', 'none');
    currLine.setAttribute('stroke', '#3b82f6'); currLine.setAttribute('stroke-width', '2.5');
    currLine.setAttribute('stroke-linecap', 'round'); currLine.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(currLine);
    peakIndices.forEach(function(idx) {
      if (idx < 0 || idx >= currentVisitors.length) return;
      var val = currentVisitors[idx], cx = getX(idx), cy = getY(val);
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', cx); c.setAttribute('cy', cy);
      c.setAttribute('r', '5'); c.setAttribute('fill', '#3b82f6');
      c.setAttribute('stroke', '#ffffff'); c.setAttribute('stroke-width', '2');
      svg.appendChild(c);
      var lb = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lb.setAttribute('x', cx); lb.setAttribute('y', cy - 12);
      lb.setAttribute('text-anchor', 'middle'); lb.setAttribute('fill', '#3b82f6');
      lb.setAttribute('font-size', '10'); lb.setAttribute('font-weight', '600');
      lb.textContent = val.toLocaleString(); svg.appendChild(lb);
    });
    for (i = 0; i < days.length; i += 5) {
      var tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tx.setAttribute('x', getX(i)); tx.setAttribute('y', pad.top + ch + 16);
      tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('fill', '#64748b');
      tx.setAttribute('font-size', '9'); tx.textContent = days[i];
      svg.appendChild(tx);
    }
    container.innerHTML = ''; container.appendChild(svg);
  }
  window.renderAreaChart = renderAreaChart;

  function renderHorizontalBarChart() {
    var container = document.getElementById('horizontalBarChart');
    if (!container) return;
    var w = container.clientWidth || 500, h = container.clientHeight || 280;
    var pad = { top:20, right:60, bottom:20, left:110 };
    var sources = [
      { label:'Organic Search', pct:45.2, color:'#3b82f6' }, { label:'Direct', pct:22.8, color:'#06b6d4' },
      { label:'Social Media', pct:15.6, color:'#8b5cf6' }, { label:'Referral', pct:10.4, color:'#22c55e' },
      { label:'Email', pct:6.0, color:'#f59e0b' }
    ];
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var barH = 30, gap = 16, startY = pad.top + 10;
    sources.forEach(function(s, i) {
      var y = startY + i * (barH + gap);
      var tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tx.setAttribute('x', pad.left - 10); tx.setAttribute('y', y + barH/2 + 4);
      tx.setAttribute('text-anchor', 'end'); tx.setAttribute('fill', '#64748b');
      tx.setAttribute('font-size', '11'); tx.textContent = s.label;
      svg.appendChild(tx);
      var maxW = w - pad.left - pad.right, fillW = (s.pct/100) * maxW;
      var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', pad.left); bg.setAttribute('y', y);
      bg.setAttribute('width', maxW); bg.setAttribute('height', barH);
      bg.setAttribute('fill', '#e2e8f0'); bg.setAttribute('rx', '4');
      svg.appendChild(bg);
      var fill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      fill.setAttribute('x', pad.left); fill.setAttribute('y', y);
      fill.setAttribute('width', '0'); fill.setAttribute('height', barH);
      fill.setAttribute('fill', s.color); fill.setAttribute('rx', '4');
      fill.setAttribute('data-target-width', fillW); svg.appendChild(fill);
      var pt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pt.setAttribute('x', pad.left + fillW + 8); pt.setAttribute('y', y + barH/2 + 4);
      pt.setAttribute('fill', '#64748b'); pt.setAttribute('font-size', '11');
      pt.setAttribute('font-weight', '600'); pt.textContent = s.pct + '%';
      svg.appendChild(pt);
    });
    container.innerHTML = ''; container.appendChild(svg);
    setTimeout(function() {
      svg.querySelectorAll('rect[data-target-width]').forEach(function(rect) {
        rect.setAttribute('width', parseFloat(rect.getAttribute('data-target-width')));
      });
    }, 400);
  }
  window.renderHorizontalBarChart = renderHorizontalBarChart;

  function renderPieChart() {
    var container = document.getElementById('pieChart');
    if (!container) return;
    var devices = [
      { label:'Desktop', pct:52, color:'#3b82f6' }, { label:'Mobile', pct:38, color:'#06b6d4' },
      { label:'Tablet', pct:10, color:'#8b5cf6' }
    ];
    var w = Math.min(container.clientWidth || 360, 360), h = 240, cx = w/2, cy = h/2, r = 90;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var currentAngle = -90;
    devices.forEach(function(dev) {
      var angle = (dev.pct/100)*360, sr = (currentAngle*Math.PI)/180, er = ((currentAngle+angle)*Math.PI)/180;
      var x1 = cx + r*Math.cos(sr), y1 = cy + r*Math.sin(sr);
      var x2 = cx + r*Math.cos(er), y2 = cy + r*Math.sin(er);
      var la = angle > 180 ? 1 : 0;
      var d = 'M ' + cx + ' ' + cy + ' L ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + la + ' 1 ' + x2 + ' ' + y2 + ' Z';
      var e = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      e.setAttribute('d', d); e.setAttribute('fill', dev.color);
      e.setAttribute('stroke', '#ffffff'); e.setAttribute('stroke-width', '2');
      e.setAttribute('opacity', '0'); svg.appendChild(e);
      setTimeout(function() { e.setAttribute('opacity', '1'); }, 200 + devices.indexOf(dev)*150);
      currentAngle += angle;
    });
    var cc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cc.setAttribute('cx', cx); cc.setAttribute('cy', cy); cc.setAttribute('r', '40');
    cc.setAttribute('fill', '#ffffff'); svg.appendChild(cc);
    var ct = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ct.setAttribute('x', cx); ct.setAttribute('y', cy + 4);
    ct.setAttribute('text-anchor', 'middle'); ct.setAttribute('fill', '#1e293b');
    ct.setAttribute('font-size', '14'); ct.setAttribute('font-weight', '700');
    ct.textContent = 'Devices'; svg.appendChild(ct);
    container.innerHTML = ''; container.appendChild(svg);
    var legendEl = document.getElementById('pieLegend');
    if (legendEl) legendEl.innerHTML = devices.map(function(d) {
      return '<span class="legend-item"><span class="legend-dot" style="background:' + d.color + '"></span>' + d.label + ' ' + d.pct + '%</span>';
    }).join('');
  }
  window.renderPieChart = renderPieChart;

  function renderConversionChart() {
    var container = document.getElementById('conversionBySource');
    if (!container) return;
    var data = [
      { label:'Organic', pct:42, color:'#3b82f6' }, { label:'Direct', pct:18, color:'#06b6d4' },
      { label:'Social', pct:16, color:'#8b5cf6' }, { label:'Referral', pct:14, color:'#22c55e' },
      { label:'Email', pct:10, color:'#f59e0b' }
    ];
    var w = container.clientWidth || 500, h = container.clientHeight || 280;
    var pad = { top:20, right:50, bottom:20, left:100 };
    var barH = 30, gap = 16, startY = pad.top + 10;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    data.forEach(function(d, i) {
      var y = startY + i * (barH + gap);
      var tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tx.setAttribute('x', pad.left - 10); tx.setAttribute('y', y + barH/2 + 4);
      tx.setAttribute('text-anchor', 'end'); tx.setAttribute('fill', '#64748b');
      tx.setAttribute('font-size', '11'); tx.textContent = d.label;
      svg.appendChild(tx);
      var maxW = w - pad.left - pad.right, fillW = (d.pct/100)*maxW;
      var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', pad.left); bg.setAttribute('y', y);
      bg.setAttribute('width', maxW); bg.setAttribute('height', barH);
      bg.setAttribute('fill', '#e2e8f0'); bg.setAttribute('rx', '4');
      svg.appendChild(bg);
      var fill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      fill.setAttribute('x', pad.left); fill.setAttribute('y', y);
      fill.setAttribute('width', '0'); fill.setAttribute('height', barH);
      fill.setAttribute('fill', d.color); fill.setAttribute('rx', '4');
      fill.setAttribute('data-target-width', fillW); svg.appendChild(fill);
      var pt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pt.setAttribute('x', pad.left + fillW + 8); pt.setAttribute('y', y + barH/2 + 4);
      pt.setAttribute('fill', '#64748b'); pt.setAttribute('font-size', '11');
      pt.setAttribute('font-weight', '600'); pt.textContent = d.pct + '%';
      svg.appendChild(pt);
    });
    container.innerHTML = ''; container.appendChild(svg);
    setTimeout(function() {
      svg.querySelectorAll('rect[data-target-width]').forEach(function(rect) {
        rect.setAttribute('width', parseFloat(rect.getAttribute('data-target-width')));
      });
    }, 400);
  }
  window.renderConversionChart = renderConversionChart;

  function setupMenuToggle() {
    var btn = document.getElementById('menuToggle'), sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', function() { sidebar.classList.toggle('open'); });
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !btn.contains(e.target)) sidebar.classList.remove('open');
    });
  }

  function setupDateRange() {
    var sel = document.getElementById('dateRangeSelect'), label = document.getElementById('dateRangeLabel');
    if (!sel || !label) return;
    sel.addEventListener('change', function() {
      var map = { '7':'Last 7 Days', '30':'Last 30 Days', '90':'Last 90 Days', '365':'Last Year' };
      label.textContent = map[this.value] || 'Last 30 Days';
    });
  }
  window.setupDateRange = setupDateRange;

  function setupReportButtons() {
    $$('.generate-report').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var card = this.closest('.report-card'), name = card ? card.querySelector('h3').textContent : 'Report';
        this.textContent = 'Generating...'; this.disabled = true;
        var self = this;
        setTimeout(function() {
          self.textContent = 'Download'; self.classList.remove('btn-primary'); self.classList.add('btn-outline');
          setTimeout(function() {
            self.textContent = 'Generate'; self.classList.remove('btn-outline'); self.classList.add('btn-primary'); self.disabled = false;
          }, 3000);
          alert(name + ' report generated successfully. Download starting...');
        }, 1500);
      });
    });
  }
  window.setupReportButtons = setupReportButtons;

  function setupGlobalSearch() {
    var input = document.getElementById('globalSearch');
    if (!input) return;
    input.addEventListener('input', function() {
      var q = input.value.toLowerCase();
      $$('.report-card').forEach(function(card) {
        card.style.display = card.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }
  window.setupGlobalSearch = setupGlobalSearch;

  function startRealtimeCounter() {
    var el = document.getElementById('liveCount');
    if (!el) return;
    var count = 247;
    setInterval(function() {
      var delta = Math.floor(Math.random() * 7) - 2;
      count = Math.max(180, count + delta);
      if (Math.random() < 0.05) count += Math.floor(Math.random() * 20);
      el.textContent = count;
    }, 3000);
  }
  window.startRealtimeCounter = startRealtimeCounter;
})();
