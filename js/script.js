document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => preloader.classList.add('fade-out'));
    setTimeout(() => preloader.classList.add('fade-out'), 1000);
  }
  document.body.classList.add('loaded');

  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    lastScroll = y;
  });

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

  const revealEls = document.querySelectorAll('.section-head, .service-card, .case-card, .testimonial-card, .pricing-card, .team-card, .blog-card, .process-step, .industry-item, .extra-service, .stat-item, .comparison-table, .about-grid, .about-stat-card');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal', 'active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        let count = 0;
        const update = () => {
          const step = Math.max(1, Math.ceil(target / 60));
          if (count < target) {
            count += step;
            if (count > target) count = target;
            el.textContent = count;
            requestAnimationFrame(update);
          } else {
            el.textContent = target;
          }
        };
        update();
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(c => counterObserver.observe(c));

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

  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
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
