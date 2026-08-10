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

    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item.active').forEach(el => el.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    const calcSpend = document.getElementById('monthly-spend');
    const calcRoas = document.getElementById('roas-estimate');
    const spendRange = document.getElementById('spend-range');
    const roasRange = document.getElementById('roas-range');
    const calcRevenue = document.getElementById('calc-revenue');

    if (calcSpend && calcRoas && spendRange && roasRange && calcRevenue) {
        const updateCalc = () => {
            const spend = parseFloat(calcSpend.value) || 0;
            const roas = parseFloat(calcRoas.value) || 0;
            const revenue = spend * roas;
            calcRevenue.textContent = revenue.toLocaleString('en-US');
        };
        calcSpend.addEventListener('input', () => { spendRange.value = calcSpend.value; updateCalc(); });
        calcRoas.addEventListener('input', () => { roasRange.value = calcRoas.value; updateCalc(); });
        spendRange.addEventListener('input', () => { calcSpend.value = spendRange.value; updateCalc(); });
        roasRange.addEventListener('input', () => { calcRoas.value = roasRange.value; updateCalc(); });
        updateCalc();
    }

    const animateOnScroll = () => {
        const reveals = document.querySelectorAll('.benefit-card, .case-card, .pricing-card, .process-step, .testimonial-card, .case-detail-card');
        reveals.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 60;
            if (isVisible) el.style.opacity = '1';
            else if (!el.style.opacity || el.style.opacity === '1') el.style.opacity = '0';
        });
        requestAnimationFrame(animateOnScroll);
    };
    document.querySelectorAll('.benefit-card, .case-card, .pricing-card, .process-step, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    animateOnScroll();

})();
