(() => {
    'use strict';

    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        if (loader) setTimeout(() => loader.classList.add('hidden'), 2200);
    });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }, { passive: true });

    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('active');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
    }

    const particleContainer = document.getElementById('particles');
    if (particleContainer) {
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'hero-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.width = (Math.random() * 4 + 2) + 'px';
            p.style.height = p.style.width;
            p.style.animationDuration = (Math.random() * 20 + 15) + 's';
            p.style.animationDelay = (Math.random() * 20) + 's';
            particleContainer.appendChild(p);
        }
    }

    const animateCounters = () => {
        document.querySelectorAll('[data-target]').forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const isDecimal = target % 1 !== 0;
            const duration = 2000;
            const start = performance.now();
            const update = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = eased * target;
                counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                if (progress < 1) requestAnimationFrame(update);
                else counter.textContent = isDecimal ? target.toFixed(1) : target;
            };
            requestAnimationFrame(update);
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.5 });
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) statsObserver.observe(heroStats);

    const resultObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.result-num[data-target]').forEach(counter => {
                    const target = parseFloat(counter.dataset.target);
                    const isDecimal = target % 1 !== 0;
                    const duration = 2000;
                    const start = performance.now();
                    const update = (now) => {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = eased * target;
                        counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                        if (progress < 1) requestAnimationFrame(update);
                        else counter.textContent = isDecimal ? target.toFixed(1) : target;
                    };
                    requestAnimationFrame(update);
                });
                resultObserver.disconnect();
            }
        });
    }, { threshold: 0.5 });
    const resultsSection = document.querySelector('.results-grid');
    if (resultsSection) resultObserver.observe(resultsSection);

    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item.active').forEach(el => el.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    const track = document.querySelector('.testimonial-track');
    const dots = document.querySelectorAll('.testimonial-dot');
    if (track && dots.length) {
        let currentSlide = 0;
        const totalSlides = dots.length;
        const goToSlide = (index) => {
            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
        };
        dots.forEach(dot => {
            dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.index)));
        });
        let autoSlide = setInterval(() => goToSlide((currentSlide + 1) % totalSlides), 5000);
        const slider = document.querySelector('.testimonial-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
            slider.addEventListener('mouseleave', () => {
                autoSlide = setInterval(() => goToSlide((currentSlide + 1) % totalSlides), 5000);
            });
        }
    }

    const animateOnScroll = () => {
        const reveals = document.querySelectorAll('.creative-card, .audience-card, .process-alt-step, .result-card, .pricing-card, .portfolio-item, .as-card');
        reveals.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 60;
            if (isVisible) el.style.opacity = '1';
            else if (!el.style.opacity || el.style.opacity === '1') el.style.opacity = '0';
        });
        requestAnimationFrame(animateOnScroll);
    };
    document.querySelectorAll('.creative-card, .audience-card, .process-alt-step, .result-card, .pricing-card, .portfolio-item, .as-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    animateOnScroll();

})();
