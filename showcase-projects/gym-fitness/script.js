(function() {
    'use strict';

    const loader = document.getElementById('loader');
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

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

    var styleSheet = document.createElement('style');
    styleSheet.textContent =
        '@keyframes floatParticle {' +
        '0%,100%{transform:translateY(0) translateX(0);opacity:0.2;}' +
        '25%{transform:translateY(-25px) translateX(15px);opacity:0.9;}' +
        '50%{transform:translateY(-15px) translateX(-15px);opacity:0.3;}' +
        '75%{transform:translateY(-35px) translateX(10px);opacity:0.6;}' +
        '}';
    document.head.appendChild(styleSheet);

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

    window.createParticles = function() {
        var container = document.getElementById('heroParticles');
        if (!container) return;
        for (var i = 0; i < 30; i++) {
            var particle = document.createElement('div');
            var size = Math.random() * 4 + 2;
            particle.style.cssText =
                'position:absolute;width:' + size + 'px;height:' + size + 'px;' +
                'background:rgba(255,60,0,' + (Math.random() * 0.3 + 0.05) + ');' +
                'border-radius:50%;' +
                'left:' + (Math.random() * 100) + '%;' +
                'top:' + (Math.random() * 100) + '%;' +
                'animation:floatParticle ' + (Math.random() * 6 + 4) + 's ease-in-out infinite;' +
                'animation-delay:' + (Math.random() * 4) + 's;';
            container.appendChild(particle);
        }
    };

    window.getLevelClass = function(level) {
        var map = { 'Beginner': 'level-beginner', 'Intermediate': 'level-intermediate', 'Advanced': 'level-advanced', 'All Levels': 'level-all' };
        return map[level] || 'level-all';
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
