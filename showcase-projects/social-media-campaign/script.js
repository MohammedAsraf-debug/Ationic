document.addEventListener('DOMContentLoaded', function () {
  var loader = document.getElementById('loader');
  var navbar = document.querySelector('.navbar');
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  var statNums = document.querySelectorAll('.stat-num');
  var filterBtns = document.querySelectorAll('.filter-btn');
  var feedGrid = document.getElementById('feedGrid');
  var calFilters = document.querySelectorAll('.cal-filter');
  var calendarGrid = document.getElementById('calendarGrid');
  var weekBtns = document.querySelectorAll('.week-btn');

  setTimeout(function () {
    loader.classList.add('hidden');
  }, 2200);

  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
    });
  });

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  function animateCounter(el, target) {
    var current = 0;
    var increment = target / 60;
    var timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 20);
  }

  var statsAnimated = false;
  function checkStats() {
    if (statsAnimated) return;
    var hero = document.querySelector('.hero');
    var rect = hero.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      statsAnimated = true;
      statNums.forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-target'));
        animateCounter(el, target);
      });
    }
  }

  checkStats();
  window.addEventListener('scroll', checkStats);

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      feedGrid.querySelectorAll('.feed-post').forEach(function (post) {
        if (filter === 'all' || post.getAttribute('data-type') === filter) {
          post.classList.remove('hidden');
        } else {
          post.classList.add('hidden');
        }
      });
    });
  });

  calFilters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      calFilters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-cal');
      calendarGrid.querySelectorAll('.cal-day:not(.cal-header)').forEach(function (day) {
        if (day.classList.contains('empty')) return;
        if (filter === 'all' || day.getAttribute('data-pillar') === filter) {
          day.style.display = 'block';
        } else {
          day.style.display = 'none';
        }
      });
    });
  });

  weekBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      weekBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  var observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.strategy-card, .feed-post, .ad-card, .story-card, .reel-card, .result-card, .test-card, .insight-card, .top-post-item').forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});
