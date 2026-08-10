(function() {
    'use strict';

    var loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', function() {
            loader.classList.add('hidden');
        });
    }

    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    var aosElements = document.querySelectorAll('[data-aos]');
    function checkReveal() {
        var windowHeight = window.innerHeight;
        aosElements.forEach(function(el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < windowHeight - 120 && !el.classList.contains('aos-animate')) {
                el.classList.add('aos-animate');
            }
        });
    }
    window.addEventListener('scroll', checkReveal);
    window.addEventListener('resize', checkReveal);
    checkReveal();

    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function(item) {
        var question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                item.classList.toggle('active');
            });
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                var targetPos = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

})();
