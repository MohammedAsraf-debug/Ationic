document.addEventListener('DOMContentLoaded', function () {
  const loader = document.getElementById('loader');
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const logoGrid = document.getElementById('logoGrid');
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const swatches = document.querySelectorAll('.swatch[data-hex]');
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.querySelector('.lightbox-content');
  const lightboxClose = document.querySelector('.lightbox-close');
  const appCards = document.querySelectorAll('.app-card');
  const packCards = document.querySelectorAll('.pack-card');
  const instaPosts = document.querySelectorAll('.insta-post');
  const fbCovers = document.querySelectorAll('.fb-cover');
  const liBanner = document.querySelector('.linkedin-banner');

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

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      toggleBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var bg = btn.getAttribute('data-bg');
      logoGrid.querySelectorAll('.logo-card').forEach(function (card) {
        card.setAttribute('data-bg', bg);
      });
    });
  });

  swatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      var hex = swatch.getAttribute('data-hex');
      if (!hex) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hex).then(function () {
          showToast(swatch, 'Copied ' + hex);
        }).catch(function () { fallbackCopy(hex, swatch); });
      } else {
        fallbackCopy(hex, swatch);
      }
    });
  });

  function fallbackCopy(text, el) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(el, 'Copied ' + text);
    } catch (e) {}
    document.body.removeChild(ta);
  }

  function showToast(el, msg) {
    var existing = el.querySelector('.copy-toast');
    if (existing) { existing.remove(); }
    var toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = msg;
    el.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('show');
    });
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 1500);
  }

  function openLightbox(html) {
    lightboxContent.innerHTML = html;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  appCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var clone = card.querySelector('.app-preview').cloneNode(true);
      clone.style.padding = '48px';
      clone.style.background = '#f5f0eb';
      clone.style.borderRadius = '12px';
      openLightbox(clone.outerHTML);
    });
  });

  packCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var clone = card.querySelector('.pack-preview').cloneNode(true);
      clone.style.padding = '48px';
      clone.style.borderRadius = '12px';
      openLightbox(clone.outerHTML);
    });
  });

  instaPosts.forEach(function (post) {
    post.addEventListener('click', function () {
      var clone = post.querySelector('.insta-image').cloneNode(true);
      clone.style.borderRadius = '12px';
      clone.style.maxWidth = '400px';
      clone.style.aspectRatio = '1';
      openLightbox(clone.outerHTML);
    });
  });

  fbCovers.forEach(function (cover) {
    cover.addEventListener('click', function () {
      var clone = cover.querySelector('.fb-cover-img').cloneNode(true);
      clone.style.borderRadius = '12px';
      clone.style.width = '600px';
      clone.style.aspectRatio = '2.2/1';
      openLightbox(clone.outerHTML);
    });
  });

  if (liBanner) {
    liBanner.addEventListener('click', function () {
      var clone = liBanner.querySelector('.li-banner-img').cloneNode(true);
      clone.style.borderRadius = '12px';
      clone.style.width = '800px';
      clone.style.aspectRatio = '4/1';
      openLightbox(clone.outerHTML);
    });
  }

  var observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.logo-card, .app-card, .pack-card, .insta-post, .swatch, .psych-card, .fb-cover').forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});
