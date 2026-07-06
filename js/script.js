// ========== GLOBAL SCRIPT – ATIONIC ==========
document.addEventListener('DOMContentLoaded', function() {

    // ---------- PRELOADER ----------
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', function() {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        });
        // fallback
        setTimeout(() => {
            preloader.classList.add('fade-out');
        }, 1000);
    }

    // ---------- PAGE TRANSITION / FADE IN ----------
    document.body.classList.add('loaded');

    // ---------- STICKY NAVBAR ----------
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ---------- ACTIVE PAGE HIGHLIGHT ----------
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ---------- MOBILE MENU TOGGLE ----------
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // ---------- SMOOTH SCROLL FOR ANCHOR LINKS (internal) ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== "#" && href.startsWith("#")) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ---------- BACK TO TOP BUTTON ----------
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTop.style.display = 'flex';
        } else {
            backToTop.style.display = 'none';
        }
    });
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---------- SCROLL REVEAL (Intersection Observer) ----------
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));

    // ---------- STATS COUNTER (increment when visible) ----------
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                let count = 0;
                const updateCounter = () => {
                    const increment = target / 80;
                    if (count < target) {
                        count += increment;
                        counter.innerText = Math.ceil(count);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(counter => counterObserver.observe(counter));

    // ---------- TESTIMONIAL SLIDER ----------
    const slides = document.querySelectorAll('.testimonial-slide');
    const wrapper = document.getElementById('testimonial-wrapper');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    if (slides.length) {
        let currentIndex = 0;
        function showSlide(index) {
            if (index >= slides.length) currentIndex = 0;
            else if (index < 0) currentIndex = slides.length - 1;
            else currentIndex = index;
            wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
        }
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => showSlide(i));
        });
        // Auto-slide every 5 seconds
        setInterval(() => showSlide(currentIndex + 1), 5000);
    }

    // ---------- FAQ ACCORDION ----------
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const body = this.nextElementSibling;
            if (body.style.maxHeight) {
                body.style.maxHeight = null;
            } else {
                body.style.maxHeight = body.scrollHeight + 'px';
            }
            // close other accordions (optional)
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== this && otherHeader.classList.contains('active')) {
                    otherHeader.classList.remove('active');
                    otherHeader.nextElementSibling.style.maxHeight = null;
                }
            });
        });
    });

    // ---------- PORTFOLIO FILTER (optional) ----------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item[data-category]');
    if (filterBtns.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                portfolioItems.forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // ---------- CONTACT FORM (UI demo, prevents actual submit) ----------
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const feedback = document.getElementById('form-feedback');
            feedback.style.display = 'block';
            feedback.textContent = 'Thank you! Your message has been sent (demo).';
            feedback.style.color = 'green';
            contactForm.reset();
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 4000);
        });
    }

    // ---------- CLOSE MOBILE MENU ON LINK CLICK ----------
    const navMenuLinks = document.querySelectorAll('.nav-menu a');
    navMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
});

// ========== EMAILJS INTEGRATION – ATIONIC CONTACT FORM ==========

const EMAILJS_CONFIG = {
  SERVICE_ID: "service_kf8hlym",     //SERVICE ID
  TEMPLATE_ID: "template_l3zz2cs",   //TEMPLATE ID
  PUBLIC_KEY: "M3-yivo_eRFPPL1t6"    //PUBLIC KEY
};

// Initialize EmailJS on page load
document.addEventListener('DOMContentLoaded', function() {
  
  // Only initialize if the contact form exists on this page
  if (document.getElementById('ationic-contact-form')) {
    
    // Initialize EmailJS with your Public Key
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.log('✅ EmailJS initialized successfully');
    
    // Attach form submit handler
    document.getElementById('ationic-contact-form').addEventListener('submit', handleFormSubmit);
  }
});

/**
 * Handle form submission with EmailJS
 * Uses async/await for cleaner error handling
 */
async function handleFormSubmit(event) {
  // IMPORTANT: Prevent page refresh
  event.preventDefault();
  
  // Get form elements
  const form = event.target;
  const submitBtn = document.getElementById('form-submit-btn');
  const statusDiv = document.getElementById('form-status');
  
  // Store original button text
  const originalBtnText = submitBtn.innerHTML;
  
  try {
    // Show loading state
    submitBtn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;
    statusDiv.innerHTML = '<div style="color: #FFD400; padding: 10px; background: rgba(255,212,0,0.1);">⏳ Sending your message...</div>';
    
    // ⚡ THE MAGIC HAPPENS HERE – EmailJS sendForm method
    const response = await emailjs.sendForm(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      form
    );
    
    // SUCCESS! 🎉
    console.log('✅ Email sent successfully!', response);
    
    // Show success message
    statusDiv.innerHTML = `
      <div style="color: #00ff00; padding: 15px; background: rgba(0,255,0,0.1); border-left: 4px solid #00ff00;">
        <strong>✓ Message sent successfully!</strong><br>
        Thank you for contacting Ationic. We'll reply within 24 hours.
      </div>
    `;
    
    // Reset the form
    form.reset();
    
  } catch (error) {
    // ERROR HANDLING – Specific error messages
    console.error('❌ EmailJS Error:', error);
    
    let errorMessage = 'Failed to send message. ';
    
    // Provide specific, helpful error messages
    if (error.text?.includes('service')) {
      errorMessage += 'Invalid Service ID. Please check your EmailJS configuration.';
    } else if (error.text?.includes('template')) {
      errorMessage += 'Invalid Template ID. Please verify your template settings.';
    } else if (error.text?.includes('permission')) {
      errorMessage += 'Gmail permission error. Reconnect your service with "Send on your behalf" checked.';
    } else {
      errorMessage += 'Please try again or email us directly at hello@ationic.com.';
    }
    
    statusDiv.innerHTML = `
      <div style="color: #ff6b6b; padding: 15px; background: rgba(255,0,0,0.1); border-left: 4px solid #ff6b6b;">
        <strong>✗ Error</strong><br>
        ${errorMessage}
      </div>
    `;
    
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
    
    // Auto-hide success message after 8 seconds
    if (!statusDiv.innerHTML.includes('Error')) {
      setTimeout(() => {
        statusDiv.style.opacity = '0';
        setTimeout(() => {
          statusDiv.innerHTML = '';
          statusDiv.style.opacity = '1';
        }, 500);
      }, 8000);
    }
  }
}