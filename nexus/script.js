// NEXUS E-commerce - Complete JavaScript
// All functions included

// Global Cart State
let cart = JSON.parse(localStorage.getItem('nexusCart')) || [];

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    console.log('NEXUS E-commerce Initializing...');
    
    // Load products
    loadProducts();
    
    // Initialize features
    initAIAssistant();
    initMagneticButtons();
    initParallax();
    initMobileMenu();
    initPortalEntrance();
    initPageTransitions();
    updateCartCount();
    
    // Initialize 3D Portal
    if (document.getElementById('portalCanvas')) {
        init3DPortal();
    }
    
    console.log('NEXUS E-commerce Initialized Successfully!');
});

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
            { 
                id: 1, 
                name: "Quantum Watch Pro", 
                price: 1299, 
                image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&auto=format&fit=crop",
                description: "Smartwatch with holographic display"
            },
            { 
                id: 2, 
                name: "Nexus Headphones", 
                price: 899, 
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop",
                description: "Noise-cancelling spatial audio"
            },
            { 
                id: 3, 
                name: "Aero Sneakers", 
                price: 699, 
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop",
                description: "Self-lacing smart sneakers"
            }
        ];
        
        product = sampleProducts.find(p => p.id === productId);
    }
    
    if (product) {
        cart.push({
            ...product,
            quantity: 1,
            color: "#000000",
            size: "M",
            addedAt: new Date().toISOString()
        });
        
        updateCartCount();
        showAddToCartAnimation(product);
        showNotification('Added to cart!');
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
    flyingProduct.innerHTML = `
        <div style="
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            overflow: hidden; 
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        ">
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
    `;
    
    flyingProduct.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width/2 - 20}px;
        top: ${rect.top}px;
        z-index: 10000;
        pointer-events: none;
        transform: scale(1);
    `;
    
    document.body.appendChild(flyingProduct);
    
    // Animate with GSAP if available
    if (typeof gsap !== 'undefined') {
        gsap.to(flyingProduct, {
            x: cartRect.left - rect.left,
            y: cartRect.top - rect.top,
            scale: 0.5,
            rotation: 360,
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
        
        flyingProduct.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        flyingProduct.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.5) rotate(360deg)`;
        
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
                max-width: 80%;
                margin-left: auto;
            `;
            aiChat.appendChild(userMsg);
            
            // Clear input
            aiInput.value = '';
            
            // Scroll to bottom
            aiChat.scrollTop = aiChat.scrollHeight;
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'ai-message';
            typingIndicator.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
            typingIndicator.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 0.8rem;
                margin-bottom: 1rem;
                max-width: 80%;
            `;
            aiChat.appendChild(typingIndicator);
            aiChat.scrollTop = aiChat.scrollHeight;
            
            // Simulate AI response after delay
            setTimeout(() => {
                // Remove typing indicator
                typingIndicator.remove();
                
                const aiResponses = [
                    "I recommend checking out our Quantum Watch Pro with holographic display! It's perfect for tech enthusiasts.",
                    "The Nexus Headphones Elite have excellent noise cancellation and spatial audio. Great for music lovers!",
                    "Our Aero Sneakers Pro are currently trending with self-lacing technology and adaptive fit system.",
                    "For premium audio experience, try our Quantum Earbuds with lossless sound quality and 30-hour battery.",
                    "The Holo Glasses offer augmented reality experiences for daily use. Perfect for work and entertainment!"
                ];
                
                const aiMsg = document.createElement('div');
                aiMsg.className = 'ai-message';
                aiMsg.textContent = aiResponses[Math.floor(Math.random() * aiResponses.length)];
                aiChat.appendChild(aiMsg);
                
                aiChat.scrollTop = aiChat.scrollHeight;
            }, 1500);
        }
    }
    
    // Add typing indicator styles
    const style = document.createElement('style');
    style.textContent = `
        .typing {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .typing span {
            width: 8px;
            height: 8px;
            background: var(--gray);
            border-radius: 50%;
            display: inline-block;
            animation: typing 1.4s infinite ease-in-out both;
        }
        .typing span:nth-child(1) { animation-delay: -0.32s; }
        .typing span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Magnetic Button Effect
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.portal-btn, .preview-btn, .add-to-cart-btn');
    
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

// 3D Portal Animation
function init3DPortal() {
    if (typeof THREE === 'undefined') {
        console.log('Three.js not loaded yet');
        return;
    }
    
    const canvas = document.getElementById('portalCanvas');
    if (!canvas) return;
    
    try {
        // Scene
        const scene = new THREE.Scene();
        
        // Camera
        const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true,
            antialias: true 
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Create particles
        const particlesCount = 500;
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
            
            // Gradient colors
            colors[i] = 0.6 + Math.random() * 0.4;     // R
            colors[i + 1] = 0.3 + Math.random() * 0.3; // G
            colors[i + 2] = 0.8 + Math.random() * 0.2; // B
        }
        
        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);
        
        // Create central object
        const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            metalness: 0.7,
            roughness: 0.2,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.5,
            wireframe: false
        });
        
        const torusKnot = new THREE.Mesh(geometry, material);
        scene.add(torusKnot);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x6366f1, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        
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
            torusKnot.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
            
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

// Load Products
function loadProducts() {
    const grid = document.getElementById('previewGrid');
    if (!grid) return;
    
    const products = [
        {
            id: 1,
            name: "Quantum Watch Pro",
            price: 1299,
            image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&auto=format&fit=crop",
            description: "Smartwatch with holographic display"
        },
        {
            id: 2,
            name: "Nexus Headphones Elite",
            price: 899,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop",
            description: "Noise-cancelling spatial audio"
        },
        {
            id: 3,
            name: "Aero Sneakers Pro",
            price: 699,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
            description: "Self-lacing smart sneakers"
        },
        {
            id: 4,
            name: "Holo Glasses",
            price: 1599,
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop",
            description: "Augmented reality glasses"
        },
        {
            id: 5,
            name: "Quantum Earbuds",
            price: 499,
            image: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e7?w=800&auto=format&fit=crop",
            description: "True wireless earbuds"
        },
        {
            id: 6,
            name: "Cyber Runners",
            price: 799,
            image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop",
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
    const links = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="http"]):not([href^="mailto:"])');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href === 'index.html' || href === 'shop.html' || href === 'checkout.html') {
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
            }
        });
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Make functions globally available
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;

// Export cart for other pages
window.cart = cart;
window.showNotification = showNotification;


// =============================================
// ADVANCED AI SHOPPING ASSISTANT
// =============================================

class AIShoppingAssistant {
    constructor() {
        this.conversationHistory = [];
        this.userPreferences = {
            budget: null,
            category: null,
            color: null,
            brand: null
        };
        this.productsData = [];
        this.isTyping = false;
        this.init();
    }

    init() {
        // Load product data
        this.loadProducts();
        
        // Initialize chat interface
        this.initChatInterface();
        
        // Add AI thinking animation
        this.addTypingIndicator();
        
        console.log('AI Assistant Initialized');
    }

    loadProducts() {
        // Sample product database
        this.productsData = [
            {
                id: 1,
                name: "Quantum Watch Pro",
                category: "electronics",
                price: 1299,
                features: ["Holographic Display", "Health Monitoring", "7-day Battery"],
                description: "Premium smartwatch with advanced health tracking",
                rating: 4.8,
                colors: ["black", "blue", "silver"]
            },
            {
                id: 2,
                name: "Nexus Headphones Elite",
                category: "audio",
                price: 899,
                features: ["Noise Cancelling", "Spatial Audio", "30h Battery"],
                description: "Premium noise-cancelling headphones",
                rating: 4.7,
                colors: ["black", "blue", "white"]
            },
            {
                id: 3,
                name: "Aero Sneakers Pro",
                category: "footwear",
                price: 699,
                features: ["Auto-lacing", "Activity Tracking", "LED Lights"],
                description: "Smart self-lacing sneakers",
                rating: 4.6,
                colors: ["white", "black", "red"]
            },
            {
                id: 4,
                name: "Holo Glasses",
                category: "electronics",
                price: 1599,
                features: ["Augmented Reality", "Voice Control", "8h Battery"],
                description: "AR smart glasses for daily use",
                rating: 4.9,
                colors: ["black", "matte"]
            },
            {
                id: 5,
                name: "Quantum Earbuds",
                category: "audio",
                price: 499,
                features: ["Noise Cancelling", "Wireless Charging", "24h Battery"],
                description: "True wireless earbuds",
                rating: 4.5,
                colors: ["white", "black", "blue"]
            }
        ];
    }

    initChatInterface() {
        const aiWidget = document.getElementById('aiWidget');
        const closeBtn = document.querySelector('.close-ai');
        const aiInput = document.querySelector('.ai-input input');
        const aiSend = document.querySelector('.ai-input button');
        const aiChat = document.querySelector('.ai-chat');

        if (!aiWidget || !closeBtn || !aiInput || !aiSend || !aiChat) return;

        // Show AI widget after delay
        setTimeout(() => {
            aiWidget.classList.add('active');
            this.addMessage("Hi! I'm your Nexus Shopping Assistant. I can help you find products, compare features, and make recommendations. What are you looking for today?", 'ai');
        }, 2000);

        // Close button
        closeBtn.addEventListener('click', () => {
            aiWidget.classList.remove('active');
        });

        // Send message on button click
        aiSend.addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message on Enter key
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Make methods available globally
        window.sendAIMessage = () => this.sendMessage();
        window.toggleAIAssistant = () => {
            aiWidget.classList.toggle('active');
        };
    }

    sendMessage() {
        const aiInput = document.querySelector('.ai-input input');
        const message = aiInput.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        aiInput.value = '';
        
        // Process AI response
        this.processUserMessage(message);
    }

    addMessage(text, sender) {
        const aiChat = document.querySelector('.ai-chat');
        if (!aiChat) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        
        // Add timestamp
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content user">
                    <div class="message-text">${text}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
            messageDiv.style.cssText = `
                display: flex;
                justify-content: flex-end;
                margin-bottom: 1rem;
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content ai">
                    <div class="avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-bubble">
                        <div class="message-text">${text}</div>
                        <div class="message-time">${time}</div>
                    </div>
                </div>
            `;
        }
        
        aiChat.appendChild(messageDiv);
        aiChat.scrollTop = aiChat.scrollHeight;
        
        // Add to conversation history
        this.conversationHistory.push({
            sender: sender,
            text: text,
            time: time
        });
    }

    processUserMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate thinking time
        setTimeout(() => {
            this.hideTypingIndicator();
            
            // Analyze user message and generate response
            const response = this.generateResponse(lowerMessage);
            this.addMessage(response, 'ai');
            
            // Auto-suggest follow-up questions
            setTimeout(() => {
                this.suggestFollowUpQuestions(lowerMessage);
            }, 500);
        }, 1000 + Math.random() * 1000);
    }

    generateResponse(message) {
        // Greetings
        if (this.isGreeting(message)) {
            return this.getGreetingResponse();
        }
        
        // Product search
        if (this.isProductSearch(message)) {
            return this.searchProducts(message);
        }
        
        // Price/budget related
        if (this.isPriceQuestion(message)) {
            return this.handlePriceQuestion(message);
        }
        
        // Feature comparison
        if (this.isComparisonQuestion(message)) {
            return this.compareProducts(message);
        }
        
        // Recommendation request
        if (this.isRecommendationRequest(message)) {
            return this.makeRecommendations(message);
        }
        
        // Help request
        if (this.isHelpRequest(message)) {
            return this.getHelpResponse();
        }
        
        // Default - try to understand context
        return this.getContextualResponse(message);
    }

    // =============================================
    // NATURAL LANGUAGE PROCESSING FUNCTIONS
    // =============================================

    isGreeting(message) {
        const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(greet => message.includes(greet));
    }

    isProductSearch(message) {
        const keywords = ['watch', 'headphone', 'earbud', 'sneaker', 'shoe', 'glasses', 'tablet', 'laptop', 'camera', 'phone'];
        return keywords.some(keyword => message.includes(keyword));
    }

    isPriceQuestion(message) {
        const priceWords = ['price', 'cost', 'expensive', 'cheap', 'budget', 'affordable', 'how much'];
        return priceWords.some(word => message.includes(word));
    }

    isComparisonQuestion(message) {
        const compareWords = ['compare', 'difference', 'better', 'best', 'versus', 'vs', 'which one'];
        return compareWords.some(word => message.includes(word));
    }

    isRecommendationRequest(message) {
        const recommendWords = ['recommend', 'suggest', 'what should i buy', 'help me choose', 'looking for'];
        return recommendWords.some(word => message.includes(word));
    }

    isHelpRequest(message) {
        const helpWords = ['help', 'how to', 'what can you do', 'features', 'assist'];
        return helpWords.some(word => message.includes(word));
    }

    // =============================================
    // RESPONSE GENERATORS
    // =============================================

    getGreetingResponse() {
        const greetings = [
            "Hello! I'm your Nexus shopping assistant. How can I help you today?",
            "Hi there! Ready to find some amazing products?",
            "Welcome to Nexus! I'm here to help you discover premium tech products.",
            "Hey! Looking for something specific or need recommendations?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    searchProducts(query) {
        // Extract product type from query
        let productType = '';
        const productKeywords = {
            'watch': 'electronics',
            'headphone': 'audio',
            'earbud': 'audio',
            'sneaker': 'footwear',
            'shoe': 'footwear',
            'glasses': 'electronics',
            'tablet': 'electronics',
            'laptop': 'electronics'
        };
        
        for (const [keyword, category] of Object.entries(productKeywords)) {
            if (query.includes(keyword)) {
                productType = category;
                break;
            }
        }
        
        // Filter products
        const filteredProducts = this.productsData.filter(product => 
            product.category === productType || 
            product.name.toLowerCase().includes(query.split(' ').find(word => word.length > 3) || '')
        );
        
        if (filteredProducts.length > 0) {
            let response = `I found ${filteredProducts.length} product(s) for you:\n\n`;
            
            filteredProducts.slice(0, 3).forEach(product => {
                response += `✨ **${product.name}** - $${product.price}\n`;
                response += `   ⭐ ${product.rating}/5 | ${product.description}\n\n`;
            });
            
            if (filteredProducts.length > 3) {
                response += `...and ${filteredProducts.length - 3} more. Want to see all options?`;
            } else {
                response += `Need more details on any of these?`;
            }
            
            return response;
        } else {
            return "I couldn't find specific products matching your search. Could you describe what you're looking for? For example: 'smartwatch under $1000' or 'noise cancelling headphones'";
        }
    }

    handlePriceQuestion(query) {
        // Extract budget from query
        const budgetMatch = query.match(/\$?(\d+)/);
        const budget = budgetMatch ? parseInt(budgetMatch[1]) : null;
        
        // Extract product type
        let productType = '';
        const keywords = ['watch', 'headphone', 'earbud', 'sneaker', 'shoe'];
        for (const keyword of keywords) {
            if (query.includes(keyword)) {
                productType = keyword;
                break;
            }
        }
        
        // Filter products by budget
        let filteredProducts = this.productsData;
        
        if (productType) {
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(productType)
            );
        }
        
        if (budget) {
            filteredProducts = filteredProducts.filter(product => product.price <= budget);
            this.userPreferences.budget = budget;
        }
        
        if (filteredProducts.length > 0) {
            let response = `Here are products within your ${budget ? 'budget of $' + budget : 'price range'}:\n\n`;
            
            filteredProducts.slice(0, 3).forEach(product => {
                const savings = product.originalPrice ? 
                    ` (Save $${product.originalPrice - product.price})` : '';
                response += `✅ **${product.name}** - $${product.price}${savings}\n`;
            });
            
            return response;
        } else {
            return "I couldn't find products in that price range. Would you like me to suggest alternatives or increase your budget?";
        }
    }

    compareProducts(query) {
        // Extract product names for comparison
        const productsToCompare = [];
        
        for (const product of this.productsData) {
            if (query.includes(product.name.toLowerCase().split(' ')[0])) {
                productsToCompare.push(product);
            }
        }
        
        if (productsToCompare.length >= 2) {
            const [product1, product2] = productsToCompare;
            
            return `**Comparison: ${product1.name} vs ${product2.name}**\n\n` +
                   `💰 **Price:** $${product1.price} vs $${product2.price}\n` +
                   `⭐ **Rating:** ${product1.rating}/5 vs ${product2.rating}/5\n` +
                   `🎯 **Best for:** ${product1.description.split('.')[0]} vs ${product2.description.split('.')[0]}\n\n` +
                   `My recommendation: ${product1.rating > product2.rating ? product1.name : product2.name} ` +
                   `based on customer ratings.`;
        } else {
            return "I need more details to compare. Try asking: 'Compare smartwatches and headphones' or 'Which is better between Quantum Watch and Nexus Headphones?'";
        }
    }

    makeRecommendations(query) {
        // Extract user preferences
        let category = null;
        let maxPrice = null;
        
        // Check for category
        if (query.includes('watch')) category = 'electronics';
        else if (query.includes('headphone') || query.includes('earbud')) category = 'audio';
        else if (query.includes('sneaker') || query.includes('shoe')) category = 'footwear';
        
        // Check for budget
        const budgetMatch = query.match(/\$?(\d+)/);
        if (budgetMatch) maxPrice = parseInt(budgetMatch[1]);
        
        // Filter products
        let recommendations = this.productsData;
        
        if (category) {
            recommendations = recommendations.filter(p => p.category === category);
            this.userPreferences.category = category;
        }
        
        if (maxPrice) {
            recommendations = recommendations.filter(p => p.price <= maxPrice);
            this.userPreferences.budget = maxPrice;
        }
        
        // Sort by rating
        recommendations.sort((a, b) => b.rating - a.rating);
        
        if (recommendations.length > 0) {
            let response = `Based on your preferences, here are my top recommendations:\n\n`;
            
            recommendations.slice(0, 3).forEach((product, index) => {
                const rank = ['🥇', '🥈', '🥉'][index] || '✨';
                response += `${rank} **${product.name}** - $${product.price}\n`;
                response += `   ⭐ ${product.rating}/5 | ${product.features[0]}\n\n`;
            });
            
            response += `Want detailed reviews or comparisons?`;
            return response;
        } else {
            return "I need more details to give personalized recommendations. Try: 'Recommend headphones under $500' or 'Suggest the best smartwatch'";
        }
    }

    getHelpResponse() {
        return `**I can help you with:**\n\n` +
               `🔍 **Product Search** - "Find smartwatches"\n` +
               `💰 **Price Check** - "Headphones under $300"\n` +
               `⚖️ **Comparisons** - "Compare smartwatches"\n` +
               `🎯 **Recommendations** - "Recommend best earbuds"\n` +
               `📊 **Features** - "Tell me about Quantum Watch features"\n\n` +
               `Try asking me anything about our products!`;
    }

    getContextualResponse(message) {
        // Try to understand context from conversation history
        const lastMessages = this.conversationHistory.slice(-3);
        const lastUserMessage = lastMessages.find(msg => msg.sender === 'user');
        
        if (lastUserMessage) {
            // Check if this is a follow-up question
            const lastText = lastUserMessage.text.toLowerCase();
            
            if (lastText.includes('watch')) {
                return "You mentioned watches earlier. We have the Quantum Watch Pro ($1299) with holographic display, or the Smart Watch Classic ($399) for basic features. Which interests you more?";
            }
            else if (lastText.includes('headphone') || lastText.includes('earbud')) {
                return "For audio, we have Nexus Headphones Elite ($899) with noise cancellation or Quantum Earbuds ($499) for wireless freedom. Need comparisons?";
            }
        }
        
        // Default intelligent response
        const responses = [
            "I'm not sure I understand. Could you rephrase that? For example: 'Find me headphones' or 'Recommend a smartwatch'",
            "I specialize in product recommendations and comparisons. Try asking about specific products or features!",
            "Let me help you shop smarter! Ask me about products, prices, or recommendations.",
            "I'm here to assist with your shopping needs. What product category interests you?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    suggestFollowUpQuestions(originalMessage) {
        const aiChat = document.querySelector('.ai-chat');
        if (!aiChat) return;
        
        // Only suggest if last message was from AI
        const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
        if (!lastMessage || lastMessage.sender !== 'ai') return;
        
        let suggestions = [];
        
        if (originalMessage.includes('watch')) {
            suggestions = [
                "Compare with other smartwatches",
                "Show me cheaper alternatives",
                "What are the key features?"
            ];
        } else if (originalMessage.includes('headphone') || originalMessage.includes('earbud')) {
            suggestions = [
                "Best for noise cancellation?",
                "Wireless options?",
                "Battery life comparison"
            ];
        } else if (originalMessage.includes('price') || originalMessage.includes('cost')) {
            suggestions = [
                "Show me under $500",
                "Most expensive options",
                "Best value products"
            ];
        } else {
            suggestions = [
                "Recommend smartwatches",
                "Find headphones under $300",
                "Compare top products"
            ];
        }
        
        // Add suggestion buttons
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'ai-suggestions';
        suggestionDiv.innerHTML = `
            <div class="suggestion-title">Quick follow-up:</div>
            <div class="suggestion-buttons">
                ${suggestions.map(suggestion => 
                    `<button class="suggestion-btn" onclick="window.aiAssistant?.quickQuestion('${suggestion}')">
                        ${suggestion}
                    </button>`
                ).join('')}
            </div>
        `;
        
        aiChat.appendChild(suggestionDiv);
        aiChat.scrollTop = aiChat.scrollHeight;
    }

    quickQuestion(question) {
        const aiInput = document.querySelector('.ai-input input');
        aiInput.value = question;
        this.sendMessage();
    }

    // =============================================
    // UI ENHANCEMENTS
    // =============================================

    addTypingIndicator() {
        const style = document.createElement('style');
        style.textContent = `
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 10px 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                margin-bottom: 1rem;
                max-width: 80%;
            }
            
            .typing-indicator span {
                width: 8px;
                height: 8px;
                background: var(--primary);
                border-radius: 50%;
                display: inline-block;
                animation: typing 1.4s infinite ease-in-out both;
            }
            
            .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
            .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes typing {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
            
            .ai-message.user .message-content {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                padding: 12px 16px;
                border-radius: 18px 18px 4px 18px;
                max-width: 80%;
                margin-left: auto;
            }
            
            .ai-message.ai .message-content {
                display: flex;
                gap: 10px;
                align-items: flex-start;
                max-width: 90%;
            }
            
            .ai-message.ai .avatar {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
            }
            
            .ai-message.ai .message-bubble {
                background: rgba(255, 255, 255, 0.05);
                padding: 12px 16px;
                border-radius: 18px 18px 18px 4px;
                flex: 1;
            }
            
            .message-text {
                margin-bottom: 4px;
                line-height: 1.4;
                white-space: pre-wrap;
            }
            
            .message-time {
                font-size: 0.7rem;
                color: var(--gray);
                text-align: right;
            }
            
            .ai-suggestions {
                margin-top: 10px;
                margin-bottom: 15px;
            }
            
            .suggestion-title {
                font-size: 0.8rem;
                color: var(--gray);
                margin-bottom: 8px;
            }
            
            .suggestion-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .suggestion-btn {
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.3);
                color: var(--primary);
                padding: 6px 12px;
                border-radius: 15px;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .suggestion-btn:hover {
                background: rgba(99, 102, 241, 0.2);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    showTypingIndicator() {
        const aiChat = document.querySelector('.ai-chat');
        if (!aiChat) return;
        
        this.isTyping = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message ai typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-content ai">
                <div class="avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-bubble">
                    <div class="typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        aiChat.appendChild(typingDiv);
        aiChat.scrollTop = aiChat.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize AI Assistant when page loads
let aiAssistant = null;

function initAdvancedAIAssistant() {
    if (!aiAssistant) {
        aiAssistant = new AIShoppingAssistant();
        window.aiAssistant = aiAssistant; // Make globally available
        
        // Add AI toggle button to header
        addAIToggleButton();
        
        console.log('Advanced AI Assistant Loaded');
    }
}

function addAIToggleButton() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    const aiToggleBtn = document.createElement('button');
    aiToggleBtn.className = 'ai-toggle-btn';
    aiToggleBtn.innerHTML = '<i class="fas fa-robot"></i>';
    aiToggleBtn.title = 'AI Assistant';
    aiToggleBtn.onclick = () => window.toggleAIAssistant();
    
    aiToggleBtn.style.cssText = `
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 10px;
        transition: all 0.3s ease;
    `;
    
    // Add pulse animation
    aiToggleBtn.style.animation = 'pulse 2s infinite';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
            100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
    `;
    document.head.appendChild(style);
    
    navLinks.appendChild(aiToggleBtn);
}

// Update your main initialization to include AI
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...
    
    // Initialize AI Assistant
    initAdvancedAIAssistant();
    
    // ... rest of your code ...
});

// Enhanced Mobile Menu Functionality
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (!menuBtn || !navLinks) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    body.appendChild(overlay);
    
    // Toggle menu function
    function toggleMenu() {
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        
        // Update button icon
        const icon = menuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'fas fa-times';
            menuBtn.style.color = '#ef4444';
        } else {
            icon.className = 'fas fa-bars';
            menuBtn.style.color = 'white';
        }
    }
    
    // Event listeners
    menuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    
    // Close menu when clicking links
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
            const icon = menuBtn.querySelector('i');
            icon.className = 'fas fa-bars';
            menuBtn.style.color = 'white';
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });
}

// Admin Mobile Sidebar
function initAdminMobileMenu() {
    const adminContainer = document.querySelector('.admin-container');
    if (!adminContainer) return;
    
    const sidebar = document.querySelector('.admin-sidebar');
    const mainContent = document.querySelector('.admin-main');
    
    if (!sidebar || !mainContent) return;
    
    // Create toggle button for admin
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'admin-menu-toggle';
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mainContent.insertBefore(toggleBtn, mainContent.firstChild);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    adminContainer.appendChild(overlay);
    
    // Toggle sidebar
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close sidebar on overlay click
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Close sidebar when clicking menu items
    sidebar.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Initialize mobile menus when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initAdminMobileMenu();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const navLinks = document.querySelector('.nav-links');
        const overlay = document.querySelector('.mobile-menu-overlay');
        const adminSidebar = document.querySelector('.admin-sidebar');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (window.innerWidth > 768) {
            // Close mobile menu on larger screens
            if (navLinks) {
                navLinks.classList.remove('active');
            }
            if (overlay) {
                overlay.classList.remove('active');
            }
            if (adminSidebar) {
                adminSidebar.classList.remove('active');
            }
            document.body.style.overflow = '';
            
            // Reset menu button icon
            if (menuBtn) {
                const icon = menuBtn.querySelector('i');
                icon.className = 'fas fa-bars';
                menuBtn.style.color = 'white';
            }
        }
    });
});

// ==================== //
// MOBILE MENU FUNCTIONALITY //
// ==================== //

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const body = document.body;
    
    if (!mobileMenuBtn) return;
    
    // Create mobile menu container
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-nav-menu';
    
    // Get current nav links
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        // Copy nav links to mobile menu
        mobileMenu.innerHTML = navLinks.innerHTML;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        mobileMenu.prepend(closeBtn);
    }
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    
    // Add to body
    body.appendChild(mobileMenu);
    body.appendChild(overlay);
    
    // Open/close mobile menu
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
        
        // Button icon change
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = 'fas fa-times';
        mobileMenuBtn.style.color = '#ef4444';
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
        
        // Button icon change
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = 'fas fa-bars';
        mobileMenuBtn.style.color = 'white';
    }
    
    function toggleMobileMenu() {
        if (mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
    
    // Event listeners
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);
    
    // Close button in mobile menu
    const mobileCloseBtn = mobileMenu.querySelector('.mobile-close-btn');
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(closeMobileMenu, 300);
        });
    });
    
    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Window resize - close menu on desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

// Admin dashboard mobile menu
function initAdminMobileMenu() {
    const adminContainer = document.querySelector('.admin-container');
    if (!adminContainer) return;
    
    const sidebar = document.querySelector('.admin-sidebar');
    if (!sidebar) return;
    
    // Add mobile menu button to admin header
    const adminHeader = document.querySelector('.admin-header');
    if (adminHeader) {
        const mobileToggleBtn = document.createElement('button');
        mobileToggleBtn.className = 'mobile-menu-btn';
        mobileToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggleBtn.style.marginLeft = 'auto';
        
        adminHeader.querySelector('.admin-actions')?.prepend(mobileToggleBtn);
        
        // Create overlay for admin
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
        
        // Toggle sidebar
        mobileToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
            
            // Change icon
            const icon = mobileToggleBtn.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.className = 'fas fa-times';
                mobileToggleBtn.style.color = '#ef4444';
            } else {
                icon.className = 'fas fa-bars';
                mobileToggleBtn.style.color = 'white';
            }
        });
        
        // Close on overlay click
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            
            const icon = mobileToggleBtn.querySelector('i');
            icon.className = 'fas fa-bars';
            mobileToggleBtn.style.color = 'white';
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing mobile menu...');
    
    // Regular mobile menu
    initMobileMenu();
    
    // Admin mobile menu
    initAdminMobileMenu();
    
    // Add this to make sure mobile menu is properly initialized
    setTimeout(() => {
        // Force re-check after all elements are loaded
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (mobileBtn && window.innerWidth <= 768) {
            console.log('Mobile menu button found and initialized');
        }
    }, 100);
});

// Make sure mobile menu works even if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}

// ==================== //
// MOBILE MENU WITH ALL ITEMS //
// ==================== //

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (!mobileMenuBtn) return;
    
    const body = document.body;
    
    // Create mobile menu container
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-nav-menu';
    
    // Create FULL menu items for mobile/tablet
    mobileMenu.innerHTML = `
        <button class="mobile-close-btn">
            <i class="fas fa-times"></i>
        </button>
        
        <div class="mobile-menu-header">
            <h3>NEXUS</h3>
            <p style="color: var(--gray); font-size: 0.9rem; margin-bottom: 2rem;">Premium Shopping</p>
        </div>
        
        <a href="index.html" class="menu-item ${window.location.pathname.includes('index') ? 'active' : ''}">
            <i class="fas fa-home"></i>
            <span>Home</span>
        </a>
        
        <a href="shop.html" class="menu-item ${window.location.pathname.includes('shop') ? 'active' : ''}">
            <i class="fas fa-shopping-bag"></i>
            <span>Shop</span>
        </a>
        
        <a href="#features" class="menu-item">
            <i class="fas fa-star"></i>
            <span>Features</span>
        </a>
        
        <a href="#ai" class="menu-item">
            <i class="fas fa-robot"></i>
            <span>AI Assistant</span>
        </a>
        
        <a href="cart.html" class="menu-item ${window.location.pathname.includes('cart') ? 'active' : ''}">
            <i class="fas fa-shopping-cart"></i>
            <span>Cart</span>
            <span class="cart-count" style="margin-left: auto; background: var(--primary); color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">${cart.length}</span>
        </a>
        
        <a href="checkout.html" class="menu-item ${window.location.pathname.includes('checkout') ? 'active' : ''}">
            <i class="fas fa-credit-card"></i>
            <span>Checkout</span>
        </a>
        
        <!-- Admin link if available -->
        ${document.querySelector('.admin-container') ? `
        <a href="#" class="menu-item" onclick="openAdminMenu()">
            <i class="fas fa-user-shield"></i>
            <span>Admin Panel</span>
        </a>
        ` : ''}
        
        <div style="margin-top: auto; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="color: var(--gray); font-size: 0.8rem; text-align: center;">
                &copy; 2024 NEXUS
            </div>
        </div>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    
    // Add to body
    body.appendChild(mobileMenu);
    body.appendChild(overlay);
    
    // Open/close functions
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        body.style.overflow = 'hidden';
        
        // Update cart count in mobile menu
        const mobileCartCount = mobileMenu.querySelector('.cart-count');
        if (mobileCartCount) {
            mobileCartCount.textContent = cart.length;
        }
        
        // Button icon change
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = 'fas fa-times';
        mobileMenuBtn.style.color = '#ef4444';
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
        
        // Button icon change
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = 'fas fa-bars';
        mobileMenuBtn.style.color = 'white';
    }
    
    function toggleMobileMenu() {
        if (mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }
    
    // Event listeners
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);
    
    // Close button in mobile menu
    const mobileCloseBtn = mobileMenu.querySelector('.mobile-close-btn');
    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu when clicking links
    mobileMenu.querySelectorAll('.menu-item').forEach(link => {
        link.addEventListener('click', (e) => {
            // Don't close if it's a hash link (like #features, #ai)
            if (!link.getAttribute('href').startsWith('#')) {
                setTimeout(closeMobileMenu, 300);
            }
        });
    });
    
    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Window resize - close menu on desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992 && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    console.log('Mobile menu initialized for tablet & mobile');
}

// Admin mobile menu function
function initAdminMobileMenu() {
    const adminContainer = document.querySelector('.admin-container');
    if (!adminContainer) return;
    
    const sidebar = document.querySelector('.admin-sidebar');
    if (!sidebar) return;
    
    // Add mobile menu button to admin header
    const adminHeader = document.querySelector('.admin-header');
    if (adminHeader) {
        let mobileToggleBtn = adminHeader.querySelector('.admin-menu-toggle');
        
        if (!mobileToggleBtn) {
            mobileToggleBtn = document.createElement('button');
            mobileToggleBtn.className = 'admin-menu-toggle';
            mobileToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            adminHeader.querySelector('.admin-actions')?.prepend(mobileToggleBtn);
        }
        
        // Create overlay for admin
        let overlay = document.querySelector('.admin-menu-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'menu-overlay admin-menu-overlay';
            document.body.appendChild(overlay);
        }
        
        // Toggle sidebar
        mobileToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
            
            // Change icon
            const icon = mobileToggleBtn.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.className = 'fas fa-times';
                mobileToggleBtn.style.background = 'rgba(239, 68, 68, 0.2)';
            } else {
                icon.className = 'fas fa-bars';
                mobileToggleBtn.style.background = 'rgba(99, 102, 241, 0.2)';
            }
        });
        
        // Close on overlay click
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            
            const icon = mobileToggleBtn.querySelector('i');
            icon.className = 'fas fa-bars';
            mobileToggleBtn.style.background = 'rgba(99, 102, 241, 0.2)';
        });
        
        // Close when clicking menu items
        sidebar.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 991) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    const icon = mobileToggleBtn.querySelector('i');
                    icon.className = 'fas fa-bars';
                    mobileToggleBtn.style.background = 'rgba(99, 102, 241, 0.2)';
                }
            });
        });
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing responsive navigation...');
    
    // Check screen size and update menu
    function checkScreenSize() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (window.innerWidth <= 991) {
            // Tablet & Mobile: Show hamburger, hide regular nav
            if (mobileBtn) mobileBtn.style.display = 'flex';
            if (navLinks) navLinks.style.display = 'none';
        } else {
            // Desktop: Hide hamburger, show regular nav
            if (mobileBtn) mobileBtn.style.display = 'none';
            if (navLinks) navLinks.style.display = 'flex';
        }
    }
    
    // Initialize menus
    initMobileMenu();
    initAdminMobileMenu();
    
    // Check initial screen size
    checkScreenSize();
    
    // Check on resize
    window.addEventListener('resize', checkScreenSize);
    
    // Update cart count in mobile menu
    setInterval(() => {
        const mobileCartCount = document.querySelector('.mobile-nav-menu .cart-count');
        if (mobileCartCount) {
            mobileCartCount.textContent = cart.length;
        }
    }, 1000);
});

// Auto-initialize if DOM already loaded
if (document.readyState !== 'loading') {
    setTimeout(() => {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (mobileBtn) {
            initMobileMenu();
            initAdminMobileMenu();
        }
    }, 100);
}

