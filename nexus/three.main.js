// NEXUS E-commerce - Complete JavaScript
// Includes Three.js and GSAP functionality

// Global Cart State
let cart = JSON.parse(localStorage.getItem('nexusCart')) || [];

// =============================================
// THREE.JS FUNCTIONALITY (Embedded)
// =============================================

class ThreeJSLoader {
    static async load() {
        if (typeof THREE === 'undefined') {
            // Load Three.js from CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => this.initialize();
            document.head.appendChild(script);
        } else {
            this.initialize();
        }
    }

    static initialize() {
        console.log('Three.js loaded successfully');
    }
}

// =============================================
// GSAP FUNCTIONALITY (Embedded)
// =============================================

class GSAPAnimator {
    static init() {
        if (typeof gsap === 'undefined') {
            // Load GSAP from CDN
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
            document.head.appendChild(script);
        }
    }

    static createPortalAnimation(canvasId) {
        if (!canvasId || typeof THREE === 'undefined') return;
        
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                alpha: true,
                antialias: true 
            });
            
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            // Create particles
            const particlesCount = 300;
            const positions = new Float32Array(particlesCount * 3);
            const colors = new Float32Array(particlesCount * 3);
            
            for(let i = 0; i < particlesCount * 3; i += 3) {
                // Random positions in a sphere
                const radius = 5;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                
                positions[i] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i + 2] = radius * Math.cos(phi);
                
                // Random colors
                colors[i] = Math.random() * 0.5 + 0.5;     // R
                colors[i + 1] = Math.random() * 0.3 + 0.3; // G
                colors[i + 2] = Math.random() * 0.8 + 0.2; // B
            }
            
            const particlesGeometry = new THREE.BufferGeometry();
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.05,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });
            
            const particles = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particles);
            
            // Create central torus knot
            const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
            const material = new THREE.MeshStandardMaterial({
                color: 0x8b5cf6,
                metalness: 0.7,
                roughness: 0.2,
                emissive: 0x4f46e5,
                emissiveIntensity: 0.5
            });
            
            const torusKnot = new THREE.Mesh(geometry, material);
            scene.add(torusKnot);
            
            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            const pointLight = new THREE.PointLight(0x6366f1, 1);
            pointLight.position.set(5, 5, 5);
            scene.add(pointLight);
            
            camera.position.z = 5;
            
            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                
                // Rotate particles
                particles.rotation.y += 0.001;
                particles.rotation.x += 0.0005;
                
                // Rotate torus knot
                torusKnot.rotation.x += 0.01;
                torusKnot.rotation.y += 0.005;
                
                // Pulsing effect
                const time = Date.now() * 0.001;
                torusKnot.scale.setScalar(1 + Math.sin(time) * 0.1);
                
                renderer.render(scene, camera);
            }
            
            animate();
            
            // Handle resize
            window.addEventListener('resize', () => {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            });
            
            console.log('3D Portal animation created');
        } catch (error) {
            console.error('Error creating 3D animation:', error);
        }
    }
}

// =============================================
// CORE FUNCTIONS
// =============================================

// Update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
        
        // Animation
        cartCount.style.transform = 'scale(1.5)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 300);
    }
    
    // Save to localStorage
    localStorage.setItem('nexusCart', JSON.stringify(cart));
}

// Add to cart with animation
function addToCart(productId, productData = null) {
    let product;
    
    if (productData) {
        product = productData;
    } else {
        // Find product in sample data
        const sampleProducts = [
            { id: 1, name: "Quantum Watch Pro", price: 1299, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400" },
            { id: 2, name: "Nexus Headphones", price: 899, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
            { id: 3, name: "Aero Sneakers", price: 699, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" }
        ];
        
        product = sampleProducts.find(p => p.id === productId);
    }
    
    if (product) {
        cart.push({
            ...product,
            quantity: 1,
            color: "#000000",
            size: "M"
        });
        
        updateCartCount();
        showAddToCartAnimation(product);
    }
}

// Show flying product animation
function showAddToCartAnimation(product) {
    const button = event?.target || document.querySelector('.add-to-cart-btn');
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const cartIcon = document.querySelector('.cart-btn');
    
    if (!cartIcon) return;
    
    const cartRect = cartIcon.getBoundingClientRect();
    
    // Create flying element
    const flyingProduct = document.createElement('div');
    flyingProduct.innerHTML = `<img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`;
    flyingProduct.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width/2 - 20}px;
        top: ${rect.top}px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        z-index: 10000;
        pointer-events: none;
        transform: scale(1);
    `;
    
    document.body.appendChild(flyingProduct);
    
    // Use GSAP if available, else use CSS animations
    if (typeof gsap !== 'undefined') {
        gsap.to(flyingProduct, {
            x: cartRect.left - rect.left,
            y: cartRect.top - rect.top,
            scale: 0.3,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                document.body.removeChild(flyingProduct);
                
                // Cart icon bounce
                gsap.to(cartIcon, {
                    scale: 1.3,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1
                });
            }
        });
    } else {
        // Fallback CSS animation
        const startX = rect.left + rect.width/2 - 20;
        const startY = rect.top;
        const endX = cartRect.left;
        const endY = cartRect.top;
        
        const distanceX = endX - startX;
        const distanceY = endY - startY;
        
        flyingProduct.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        flyingProduct.style.transform = `translate(${distanceX}px, ${distanceY}px) scale(0.3)`;
        
        setTimeout(() => {
            document.body.removeChild(flyingProduct);
            
            // Simple bounce animation
            cartIcon.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
            }, 200);
        }, 800);
    }
}

// AI Assistant
function initAIAssistant() {
    const aiWidget = document.getElementById('aiWidget');
    const closeBtn = document.querySelector('.close-ai');
    
    if (!aiWidget || !closeBtn) return;
    
    // Show AI widget after delay
    setTimeout(() => {
        aiWidget.classList.add('active');
    }, 3000);
    
    // Close AI widget
    closeBtn.addEventListener('click', () => {
        aiWidget.classList.remove('active');
    });
    
    // AI Chat functionality
    const aiInput = document.querySelector('.ai-input input');
    const aiSend = document.querySelector('.ai-input button');
    const aiChat = document.querySelector('.ai-chat');
    
    if (aiSend && aiInput && aiChat) {
        aiSend.addEventListener('click', sendAIMessage);
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendAIMessage();
        });
        
        function sendAIMessage() {
            const message = aiInput.value.trim();
            if (!message) return;
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'ai-message user';
            userMsg.textContent = message;
            userMsg.style.cssText = `
                background: rgba(99, 102, 241, 0.2);
                border-radius: 10px;
                padding: 0.8rem;
                margin-bottom: 1rem;
                text-align: right;
            `;
            aiChat.appendChild(userMsg);
            
            // Clear input
            aiInput.value = '';
            
            // Scroll to bottom
            aiChat.scrollTop = aiChat.scrollHeight;
            
            // Simulate AI response
            setTimeout(() => {
                const aiResponses = [
                    "I recommend checking out our Quantum Watch Pro with holographic display!",
                    "The Nexus Headphones Elite have excellent noise cancellation and spatial audio.",
                    "Our Aero Sneakers Pro are currently trending with self-lacing technology.",
                    "For premium audio, try our Quantum Earbuds with lossless sound quality.",
                    "The Holo Glasses offer augmented reality experiences for daily use."
                ];
                
                const aiMsg = document.createElement('div');
                aiMsg.className = 'ai-message';
                aiMsg.textContent = aiResponses[Math.floor(Math.random() * aiResponses.length)];
                aiChat.appendChild(aiMsg);
                
                aiChat.scrollTop = aiChat.scrollHeight;
            }, 1000);
        }
    }
}

// Magnetic Button Effect
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.portal-btn, .add-to-cart-btn, .preview-btn');
    
    buttons.forEach(button => {
        if (!button) return;
        
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            if (typeof gsap !== 'undefined') {
                gsap.to(button, {
                    x: deltaX * 10,
                    y: deltaY * 10,
                    duration: 0.5,
                    ease: "power2.out"
                });
            } else {
                button.style.transform = `translate(${deltaX * 10}px, ${deltaY * 10}px)`;
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (typeof gsap !== 'undefined') {
                gsap.to(button, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.5)"
                });
            } else {
                button.style.transform = 'translate(0, 0)';
                button.style.transition = 'transform 0.5s ease';
            }
        });
    });
}

// Parallax Effect
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const portalContent = document.querySelector('.portal-content');
        
        if (portalContent) {
            const rate = scrolled * -0.5;
            portalContent.style.transform = `translateY(${rate}px)`;
        }
        
        // Navbar effect
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (scrolled > 100) {
                navbar.style.background = 'rgba(15, 23, 42, 0.98)';
                navbar.style.padding = '0.5rem 0';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
                navbar.style.padding = '1rem 0';
            }
        }
    });
}

// Mobile Menu
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
}

// Portal Entrance Animation
function initPortalEntrance() {
    const portalBtn = document.getElementById('enterPortal');
    
    if (portalBtn) {
        portalBtn.addEventListener('click', () => {
            // Create portal transition effect
            const portalOverlay = document.createElement('div');
            portalOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
                z-index: 10000;
                transform: scale(0);
                border-radius: 50%;
                pointer-events: none;
            `;
            
            document.body.appendChild(portalOverlay);
            
            if (typeof gsap !== 'undefined') {
                // Animate portal expansion with GSAP
                gsap.to(portalOverlay, {
                    scale: 3,
                    duration: 1,
                    ease: "power2.inOut",
                    onComplete: () => {
                        // Redirect to shop page
                        window.location.href = 'shop.html';
                    }
                });
            } else {
                // Fallback CSS animation
                portalOverlay.style.transition = 'transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                portalOverlay.style.transform = 'scale(3)';
                
                setTimeout(() => {
                    window.location.href = 'shop.html';
                }, 1000);
            }
        });
    }
}

// Load Products
function loadProducts() {
    const grid = document.getElementById('previewGrid');
    if (!grid) return;
    
    const products = [
        {
            id: 1,
            name: "Quantum Watch Pro",
            price: 1299,
            image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
            description: "Smartwatch with holographic display"
        },
        {
            id: 2,
            name: "Nexus Headphones Elite",
            price: 899,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            description: "Noise-cancelling spatial audio"
        },
        {
            id: 3,
            name: "Aero Sneakers Pro",
            price: 699,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
            description: "Self-lacing smart sneakers"
        },
        {
            id: 4,
            name: "Holo Glasses",
            price: 1599,
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
            description: "Augmented reality glasses"
        },
        {
            id: 5,
            name: "Quantum Earbuds",
            price: 499,
            image: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e7?w=800",
            description: "True wireless earbuds"
        },
        {
            id: 6,
            name: "Cyber Runners",
            price: 799,
            image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
            description: "Smart running shoes"
        }
    ];
    
    grid.innerHTML = products.map(product => `
        <div class="preview-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">$${product.price}</div>
                <button class="preview-btn" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Page Transitions
function initPageTransitions() {
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Don't intercept external links or same page anchors
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
                return;
            }
            
            e.preventDefault();
            
            // Create transition overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
                z-index: 10000;
                transform: scale(0);
                border-radius: 50%;
                pointer-events: none;
            `;
            
            document.body.appendChild(overlay);
            
            if (typeof gsap !== 'undefined') {
                gsap.to(overlay, {
                    scale: 2,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        window.location.href = href;
                    }
                });
            } else {
                overlay.style.transition = 'transform 0.8s ease';
                overlay.style.transform = 'scale(2)';
                
                setTimeout(() => {
                    window.location.href = href;
                }, 800);
            }
        });
    });
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    console.log('NEXUS E-commerce Initializing...');
    
    // Load Three.js and GSAP
    ThreeJSLoader.load();
    GSAPAnimator.init();
    
    // Check if we're on homepage
    if (document.getElementById('portalCanvas')) {
        // Initialize 3D portal after Three.js loads
        setTimeout(() => {
            GSAPAnimator.createPortalAnimation('portalCanvas');
        }, 1000);
        
        initPortalEntrance();
    }
    
    // Initialize core features
    loadProducts();
    initAIAssistant();
    initMagneticButtons();
    initParallax();
    initMobileMenu();
    initPageTransitions();
    updateCartCount();
    
    console.log('NEXUS E-commerce Initialized Successfully!');
});

// Make functions globally available
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;

// Export cart for other pages
window.cart = cart;