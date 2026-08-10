(function() {
    'use strict';

    const loader = document.getElementById('loader');
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    window.formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    window.addEventListener('load', function() {
        setTimeout(function() { loader.classList.add('hidden'); }, 800);
    });

    window.addEventListener('scroll', function() {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', nav.classList.contains('active'));
        });
    }

    if (nav) {
        nav.querySelectorAll('.nav-link').forEach(function(link) {
            link.addEventListener('click', function() {
                if (hamburger) {
                    hamburger.classList.remove('active');
                    nav.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    window.animateCounters = function() {
        document.querySelectorAll('.hero-stat-num').forEach(function(counter) {
            var target = parseInt(counter.getAttribute('data-count'));
            var current = 0;
            var increment = Math.ceil(target / 60);
            function update() {
                current += increment;
                if (current >= target) { counter.textContent = target; return; }
                counter.textContent = current;
                requestAnimationFrame(update);
            }
            update();
        });
    };

    window.setupObserver = function(selector) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll(selector || '.fade-up').forEach(function(el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    };
})();
