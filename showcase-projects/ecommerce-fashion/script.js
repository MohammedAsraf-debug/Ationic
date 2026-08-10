'use strict';

const products = [
    { id: 1, name: 'Silk Evening Gown', brand: 'Velour Signature', category: 'women', price: 395, sale: 295, rating: 4.8, reviews: 24, colors: ['#000', '#c9a96e', '#8b0000'], sizes: ['XS','S','M','L','XL'], desc: 'Floor-length silk charmeuse gown with a cowl neckline and open back. Features a concealed side zipper and fully lined interior.', care: 'Dry clean only. Store on padded hanger.', img: '\u{1F457}', badge: 'new', date: '2026-07-01' },
    { id: 2, name: 'Wool Tailored Blazer', brand: 'Savile Row Edition', category: 'women', price: 550, sale: null, rating: 4.7, reviews: 18, colors: ['#2c3e50', '#000', '#8b7355'], sizes: ['XS','S','M','L','XL','XXL'], desc: 'Single-breasted blazer in Italian wool fabric with notched lapels, padded shoulders, and a flattering nipped waist.', care: 'Dry clean only. Iron on low heat.', img: '\u{1F9E5}', badge: null, date: '2026-06-15' },
    { id: 3, name: 'Cashmere Crewneck Sweater', brand: 'Loro Collection', category: 'women', price: 280, sale: 210, rating: 4.9, reviews: 32, colors: ['#f5f5dc', '#000', '#8b4513', '#708090'], sizes: ['XS','S','M','L','XL'], desc: 'Luxuriously soft 100% Mongolian cashmere sweater. Ribbed cuffs and hem with a relaxed yet refined fit.', care: 'Hand wash cold. Lay flat to dry.', img: '\u{1F9F6}', badge: 'sale', date: '2026-06-20' },
    { id: 4, name: 'Leather Tote Bag', brand: 'Velour Signature', category: 'accessories', price: 450, sale: null, rating: 4.6, reviews: 15, colors: ['#000', '#8b4513', '#2c3e50'], sizes: ['One Size'], desc: 'Full-grain leather tote with gold-toned hardware, interior zip pocket, and detachable shoulder strap. Fits a 15" laptop.', care: 'Wipe clean with damp cloth. Condition leather regularly.', img: '\u{1F45C}', badge: null, date: '2026-07-05' },
    { id: 5, name: 'Linen Blend Trousers', brand: 'Studio Velour', category: 'women', price: 195, sale: 145, rating: 4.5, reviews: 20, colors: ['#f5f5dc', '#000', '#708090'], sizes: ['XS','S','M','L','XL','XXL'], desc: 'High-waisted wide-leg trousers in a lightweight linen-cotton blend. Elastic back waistband for comfort.', care: 'Machine wash cold. Tumble dry low.', img: '\u{1F456}', badge: 'sale', date: '2026-06-10' },
    { id: 6, name: 'Silk Pocket Square', brand: 'Loro Collection', category: 'accessories', price: 65, sale: null, rating: 4.3, reviews: 8, colors: ['#c9a96e', '#000', '#8b0000', '#fff'], sizes: ['One Size'], desc: 'Hand-rolled Italian silk pocket square with a subtle geometric pattern.', care: 'Dry clean only.', img: '\u{1F9E3}', badge: null, date: '2026-07-08' },
    { id: 7, name: 'Merino Wool Suit', brand: 'Savile Row Edition', category: 'men', price: 895, sale: null, rating: 4.9, reviews: 28, colors: ['#2c3e50', '#000', '#4a4a4a'], sizes: ['S','M','L','XL','XXL','3XL'], desc: 'Two-piece suit in super 150s Merino wool. Slim-fit jacket with two buttons, notch lapels, and flat-front trousers.', care: 'Dry clean only. Steam to refresh.', img: '\u{1F935}', badge: null, date: '2026-06-25' },
    { id: 8, name: 'Italian Leather Loafers', brand: 'Artisan Footwear', category: 'men', price: 380, sale: 320, rating: 4.7, reviews: 14, colors: ['#000', '#8b4513', '#2c3e50'], sizes: ['7','8','9','10','11','12','13'], desc: 'Handcrafted suede loafers with leather soles and a cushioned insole.', care: 'Use suede protector. Brush gently.', img: '\u{1F45E}', badge: 'sale', date: '2026-07-12' },
    { id: 9, name: 'Silk Tie Collection', brand: 'Velour Signature', category: 'accessories', price: 95, sale: null, rating: 4.4, reviews: 12, colors: ['#c9a96e', '#8b0000', '#2c3e50', '#000'], sizes: ['One Size'], desc: 'Seven-fold silk tie handcrafted in Como, Italy. Lined with virgin wool for a perfect knot and drape.', care: 'Dry clean only. Untie after use.', img: '\u{1F454}', badge: null, date: '2026-07-02' },
    { id: 10, name: 'Cashmere Overcoat', brand: 'Loro Collection', category: 'men', price: 1200, sale: 950, rating: 4.8, reviews: 22, colors: ['#2c3e50', '#000', '#8b7355'], sizes: ['S','M','L','XL','XXL'], desc: 'Double-faced cashmere overcoat with a notch lapel, two-button closure, and interior pockets.', care: 'Dry clean only. Store in breathable garment bag.', img: '\u{1F9E5}', badge: 'sale', date: '2026-06-30' },
    { id: 11, name: 'Gold Hoop Earrings', brand: 'Velour Signature', category: 'accessories', price: 185, sale: null, rating: 4.6, reviews: 9, colors: ['#c9a96e'], sizes: ['One Size'], desc: '18K gold-plated sterling silver hoop earrings with a textured hammered finish.', care: 'Store in pouch. Avoid contact with perfumes.', img: '\u{1F4BF}', badge: null, date: '2026-07-10' },
    { id: 12, name: 'Linen Shirt', brand: 'Studio Velour', category: 'men', price: 165, sale: null, rating: 4.5, reviews: 17, colors: ['#f5f5dc', '#fff', '#000', '#87ceeb'], sizes: ['S','M','L','XL','XXL','3XL'], desc: 'Relaxed-fit button-down shirt in premium Irish linen. Mother-of-pearl buttons and a spread collar.', care: 'Machine wash warm. Iron while damp.', img: '\u{1F455}', badge: 'new', date: '2026-07-15' },
    { id: 13, name: 'Cocktail Dress', brand: 'Velour Signature', category: 'women', price: 345, sale: null, rating: 4.7, reviews: 19, colors: ['#000', '#8b0000', '#2c3e50'], sizes: ['XS','S','M','L','XL'], desc: 'Knee-length cocktail dress in sculpted crepe with a bateau neckline, three-quarter sleeves.', care: 'Dry clean only.', img: '\u{1F457}', badge: null, date: '2026-06-18' },
    { id: 14, name: 'Leather Belt', brand: 'Artisan Footwear', category: 'accessories', price: 120, sale: 90, rating: 4.4, reviews: 11, colors: ['#000', '#8b4513'], sizes: ['S','M','L','XL'], desc: 'Italian calfskin leather belt with a brushed brass buckle. 35mm width.', care: 'Condition leather every 6 months.', img: '\u{1F517}', badge: 'sale', date: '2026-07-04' },
    { id: 15, name: 'Knit Polo Shirt', brand: 'Studio Velour', category: 'men', price: 145, sale: 115, rating: 4.3, reviews: 13, colors: ['#000', '#f5f5dc', '#87ceeb', '#8b4513'], sizes: ['S','M','L','XL','XXL'], desc: 'Pima cotton knit polo with a two-button placket, ribbed collar, and side vents.', care: 'Machine wash cold. Hang to dry.', img: '\u{1F455}', badge: null, date: '2026-06-22' },
    { id: 16, name: 'Silk Scarf', brand: 'Loro Collection', category: 'accessories', price: 210, sale: null, rating: 4.8, reviews: 7, colors: ['#c9a96e', '#8b0000', '#2c3e50'], sizes: ['One Size'], desc: '90cm square silk twill scarf hand-rolled edges. Original abstract print.', care: 'Dry clean only.', img: '\u{1F9E3}', badge: null, date: '2026-07-18' },
    { id: 17, name: 'Structured Blazer', brand: 'Savile Row Edition', category: 'men', price: 650, sale: null, rating: 4.6, reviews: 16, colors: ['#2c3e50', '#000', '#4a4a4a'], sizes: ['S','M','L','XL','XXL'], desc: 'Unlined unstructured blazer in wool hopsack. Patch pockets, mother-of-pearl buttons.', care: 'Dry clean only.', img: '\u{1F9E5}', badge: null, date: '2026-06-28' },
    { id: 18, name: 'Wide Leg Jumpsuit', brand: 'Velour Signature', category: 'women', price: 295, sale: null, rating: 4.5, reviews: 21, colors: ['#000', '#2c3e50', '#8b4513'], sizes: ['XS','S','M','L','XL'], desc: 'One-piece jumpsuit in fluid crepe with a wrap-style bodice, wide leg, and self-tie belt.', care: 'Dry clean only.', img: '\u{1F457}', badge: 'new', date: '2026-07-20' },
    { id: 19, name: 'Cufflinks Set', brand: 'Artisan Footwear', category: 'accessories', price: 75, sale: null, rating: 4.2, reviews: 6, colors: ['#c9a96e', '#000'], sizes: ['One Size'], desc: 'Set of two pairs of cufflinks in enamel and brass. Presentation box included.', care: 'Wipe with soft cloth.', img: '\u{1F48E}', badge: null, date: '2026-07-06' },
    { id: 20, name: 'Chino Pants', brand: 'Studio Velour', category: 'men', price: 125, sale: null, rating: 4.4, reviews: 25, colors: ['#8b7355', '#000', '#2c3e50', '#f5f5dc'], sizes: ['S','M','L','XL','XXL','3XL'], desc: 'Classic five-pocket chino in stretch cotton twill. Mid-rise with a straight leg.', care: 'Machine wash cold. Tumble dry low.', img: '\u{1F456}', badge: null, date: '2026-06-05' },
    { id: 21, name: 'Evening Clutch', brand: 'Velour Signature', category: 'accessories', price: 275, sale: 220, rating: 4.7, reviews: 10, colors: ['#000', '#c9a96e'], sizes: ['One Size'], desc: 'Satin evening clutch with crystal-embellished frame. Features a chain strap and interior card slots.', care: 'Store in dust bag. Avoid moisture.', img: '\u{1F45B}', badge: 'sale', date: '2026-07-14' },
    { id: 22, name: 'Wool Turtleneck', brand: 'Loro Collection', category: 'men', price: 230, sale: null, rating: 4.6, reviews: 14, colors: ['#000', '#2c3e50', '#708090', '#8b4513'], sizes: ['S','M','L','XL','XXL'], desc: 'Ribbed Merino wool turtleneck with a tall collar and seamless construction.', care: 'Hand wash cold. Lay flat to dry.', img: '\u{1F9F6}', badge: null, date: '2026-06-12' },
    { id: 23, name: 'Pleated Midi Skirt', brand: 'Studio Velour', category: 'women', price: 185, sale: 150, rating: 4.5, reviews: 16, colors: ['#000', '#2c3e50', '#8b7355'], sizes: ['XS','S','M','L','XL','XXL'], desc: 'Midi-length skirt with knife-edge pleats in satin-back crepe. Elastic waistband with side zip.', care: 'Dry clean only.', img: '\u{1F457}', badge: 'sale', date: '2026-06-08' },
    { id: 24, name: 'Sunglasses', brand: 'Velour Signature', category: 'accessories', price: 160, sale: null, rating: 4.3, reviews: 5, colors: ['#000', '#8b4513', '#c9a96e'], sizes: ['One Size'], desc: 'Cat-eye acetate sunglasses with UV400 polarized lenses. Gold-toned temple accents.', care: 'Clean with microfiber cloth. Use case when not wearing.', img: '\u{1F576}\uFE0F', badge: 'new', date: '2026-07-22' }
];

const faqs = [
    { q: 'What is the shipping policy?', a: 'We offer free standard shipping on all orders over $100. Standard shipping takes 5-7 business days. Express shipping (2-3 business days) is available for $15.' },
    { q: 'How do I return an item?', a: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and with tags attached. Return shipping is free for domestic orders.' },
    { q: 'What is the sizing like?', a: 'We follow standard US sizing (XS-3XL). Our size guide provides detailed measurements. Many styles run true to size.' },
    { q: 'Do you offer gift wrapping?', a: 'Yes, all orders include complimentary gift wrapping with our signature cream box and gold ribbon.' },
    { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, and Google Pay.' },
    { q: 'How can I track my order?', a: 'Once your order ships, you will receive a confirmation email with a tracking number.' },
    { q: 'What is your warranty on products?', a: 'If you experience any manufacturing defects within 90 days of purchase, we will replace the item or issue a full refund.' },
    { q: 'Can I change or cancel my order?', a: 'Orders can be modified or cancelled within 2 hours of placement. After that, we cannot guarantee changes.' },
    { q: 'Do you offer sustainability information?', a: 'Yes. Our Velour Signature line uses eco-friendly materials, and we offset carbon emissions on all deliveries.' },
    { q: 'What is your return policy for sale items?', a: 'Sale items are eligible for return within 30 days for store credit only. Final sale items are non-returnable.' }
];

const categories = {
    women: { title: 'Women', desc: 'Curated womenswear from everyday essentials to evening elegance.' },
    men: { title: 'Men', desc: 'Refined menswear crafted for the modern gentleman.' },
    accessories: { title: 'Accessories', desc: 'The finishing touches that define your personal style.' },
    sale: { title: 'Sale', desc: 'Exceptional pieces at exceptional values. Limited quantities.' }
};

const reviews = [
    { productId: 1, name: 'Claire M.', date: 'Jul 2026', stars: 5, text: 'Absolutely stunning gown. The silk drapes beautifully and the color is even richer in person. Wore it to a gala and received countless compliments.' },
    { productId: 1, name: 'Sarah K.', date: 'Jun 2026', stars: 4, text: 'Beautiful quality and fit. Runs slightly large, so I would recommend sizing down. The fabric feels incredibly luxurious.' },
    { productId: 3, name: 'Emma L.', date: 'Jul 2026', stars: 5, text: 'The softest cashmere I have ever owned. Perfect weight for layering. Already ordered another color.' },
    { productId: 3, name: 'Rachel T.', date: 'Jun 2026', stars: 5, text: 'Worth every penny. This sweater is my new wardrobe staple. The cream color goes with everything.' },
    { productId: 7, name: 'James D.', date: 'Jul 2026', stars: 5, text: 'Exceptional suit. The wool is high quality and the tailoring is impeccable. Perfect for important meetings.' },
    { productId: 7, name: 'Michael R.', date: 'Jun 2026', stars: 4, text: 'Great fit off the rack. The trousers needed slight hemming but the jacket fits perfectly. Outstanding value for the quality.' },
    { productId: 10, name: 'David W.', date: 'Jul 2026', stars: 5, text: 'The cashmere overcoat is an investment piece that will last a lifetime. Warm, elegant, and beautifully constructed.' },
    { productId: 13, name: 'Jessica P.', date: 'Jun 2026', stars: 5, text: 'Perfect little black dress. The crepe fabric is forgiving and the cut is flattering. Wore it to a wedding and felt amazing.' },
    { productId: 4, name: 'Olivia N.', date: 'Jul 2026', stars: 4, text: 'Stunning leather tote that fits everything I need. The leather is soft but sturdy. Would love more interior pockets.' },
    { productId: 2, name: 'Aisha B.', date: 'Jun 2026', stars: 5, text: 'This blazer transforms any outfit. The navy color is classic and the fit is incredibly flattering. My new power piece.' },
    { productId: 5, name: 'Hannah G.', date: 'Jul 2026', stars: 4, text: 'Great summer trousers. The linen blend keeps me cool and the wide leg is very on-trend. Runs slightly large in the waist.' },
    { productId: 12, name: 'Chris A.', date: 'Jul 2026', stars: 5, text: 'The perfect white linen shirt. High quality fabric that actually breathes. True to size and looks crisp all day.' }
];

let state = {
    cart: JSON.parse(localStorage.getItem('velourCart')) || [],
    wishlist: JSON.parse(localStorage.getItem('velourWishlist')) || [],
    appliedPromo: null
};

function saveState() {
    localStorage.setItem('velourCart', JSON.stringify(state.cart));
    localStorage.setItem('velourWishlist', JSON.stringify(state.wishlist));
}

const loader = document.getElementById('loader');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('load', () => setTimeout(() => { if (loader) loader.classList.add('hidden'); }, 1800));

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        if (navLinks) navLinks.classList.toggle('open');
    });
}

const currentFile = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentFile) link.classList.add('active');
});

function updateCounts() {
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = state.cart.reduce((sum, item) => sum + item.qty, 0);
    });
    document.querySelectorAll('.wishlist-count').forEach(el => {
        el.textContent = state.wishlist.length;
    });
}

function addToCart(productId, size, color) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = state.cart.find(item => item.id === productId && item.size === size && item.color === color);
    if (existing) { existing.qty += 1; }
    else { state.cart.push({ ...product, size, color, qty: 1 }); }
    saveState();
    updateCounts();
}

function removeFromCart(index) { state.cart.splice(index, 1); saveState(); updateCounts(); }

function updateCartQty(index, delta) {
    if (state.cart[index].qty + delta <= 0) { removeFromCart(index); return; }
    state.cart[index].qty += delta;
    saveState();
    updateCounts();
}

function toggleWishlist(productId) {
    const idx = state.wishlist.indexOf(productId);
    if (idx > -1) state.wishlist.splice(idx, 1);
    else state.wishlist.push(productId);
    saveState();
    updateCounts();
}

function renderProductCard(p) {
    const inWishlist = state.wishlist.includes(p.id);
    const displayPrice = p.sale ? `<span class="sale">$${p.sale}</span><span class="original">$${p.price}</span>` : `$${p.price}`;
    const badgeHtml = p.badge ? `<span class="product-badge ${p.badge}">${p.badge === 'sale' ? 'Sale' : 'New'}</span>` : '';
    const swatches = p.colors.slice(0, 4).map(c => `<span class="color-swatch" style="background:${c}" data-color="${c}"></span>`).join('');
    return `
        <div class="product-card" data-id="${p.id}">
            <div class="product-img">
                <div class="product-img-placeholder"><span class="icon">${p.img}</span><span class="label">${p.name}</span></div>
                ${badgeHtml}
                <div class="product-actions">
                    <button class="quick-view" title="Quick view" onclick="window.location.href='product.html?id=${p.id}'">\u{1F441}\uFE0F</button>
                    <button class="wishlist-toggle ${inWishlist ? 'wishlisted' : ''}" title="Wishlist" onclick="event.stopPropagation();toggleWishlist(${p.id});this.classList.toggle('wishlisted');this.textContent=this.classList.contains('wishlisted')?'\u2665':'\u2661'">${inWishlist ? '\u2665' : '\u2661'}</button>
                </div>
            </div>
            <div class="product-body">
                <div class="product-category">${p.category}</div>
                <h3>${p.name}</h3>
                <div class="brand">${p.brand}</div>
                <div class="price">${displayPrice}</div>
                <div class="rating">${'\u2605'.repeat(Math.floor(p.rating))}${p.rating % 1 >= 0.5 ? '\u00BD' : ''} <span>(${p.reviews})</span></div>
                ${swatches ? `<div class="color-swatches">${swatches}</div>` : ''}
            </div>
        </div>
    `;
}

function applyPromo() {
    const input = document.querySelector('.cart-promo input');
    const msg = document.querySelector('.promo-msg');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    if (code === 'VELOUR15') {
        state.appliedPromo = 0.15;
        if (msg) { msg.textContent = '15% discount applied!'; msg.className = 'promo-msg success'; }
        renderCartPage();
    } else {
        if (msg) { msg.textContent = 'Invalid promo code'; msg.className = 'promo-msg error'; }
    }
    input.value = '';
}

function renderCartPage() {
    const el = document.getElementById('cartPageContent');
    if (!el) return;
    if (state.cart.length === 0) {
        el.innerHTML = `<div class="cart-empty-page"><p>Your cart is empty</p><a href="category.html" class="btn btn-outline">Start Shopping</a></div>`;
        return;
    }
    let subtotal = 0;
    const itemsHtml = state.cart.map((item, i) => {
        const price = item.sale || item.price;
        subtotal += price * item.qty;
        return `
            <div class="cart-page-item">
                <div class="cart-page-item-img">${item.img}</div>
                <div class="cart-page-item-info">
                    <h3>${item.name}</h3>
                    <div class="variant">${item.size || ''}${item.size && item.color ? ' / ' : ''}${item.color ? '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:'+item.color+';vertical-align:middle;margin-right:4px;"></span>' : ''}</div>
                    <div class="price">$${price}</div>
                    <div class="cart-page-item-qty">
                        <button onclick="updateCartQty(${i}, -1);renderCartPage();">\u2212</button>
                        <span>${item.qty}</span>
                        <button onclick="updateCartQty(${i}, 1);renderCartPage();">+</button>
                    </div>
                    <button class="cart-page-item-remove" onclick="removeFromCart(${i});renderCartPage();">Remove</button>
                </div>
            </div>
        `;
    }).join('');

    const discount = state.appliedPromo ? subtotal * state.appliedPromo : 0;
    const shipping = subtotal >= 100 ? 0 : 12;
    const tax = (subtotal - discount) * 0.08875;
    const total = subtotal - discount + shipping + tax;

    el.innerHTML = `
        <div class="cart-page-layout">
            <div class="cart-page-items">${itemsHtml}</div>
            <div class="cart-page-summary">
                <h3>Order Summary</h3>
                <div class="cart-promo">
                    <input type="text" placeholder="Promo code" id="promoInput">
                    <button onclick="applyPromo();renderCartPage();">Apply</button>
                </div>
                <div class="promo-msg"></div>
                <div class="summary-detail"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
                ${discount > 0 ? `<div class="summary-detail" style="color:#22c55e"><span>Discount (15%)</span><span>-$${discount.toFixed(2)}</span></div>` : ''}
                <div class="summary-detail"><span>Shipping</span><span>${shipping === 0 ? 'Free' : '$'+shipping.toFixed(2)}</span></div>
                <div class="summary-detail"><span>Tax</span><span>$${tax.toFixed(2)}</span></div>
                <div class="summary-detail total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
                <a href="checkout.html" class="btn btn-primary btn-full" style="margin-top:20px;">Proceed to Checkout</a>
                <a href="category.html" class="btn btn-outline btn-full" style="margin-top:10px;">Continue Shopping</a>
            </div>
        </div>
    `;
}

function renderCheckout(step) {
    const content = document.getElementById('checkoutContent');
    if (!content) return;
    step = step || 1;
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active', 'completed');
        const sn = parseInt(s.dataset.step);
        if (sn < step) s.classList.add('completed');
        else if (sn === step) s.classList.add('active');
    });
    if (step === 1) {
        content.innerHTML = `
            <form class="checkout-form" id="checkoutForm1">
                <h3>Shipping Information</h3>
                <div class="form-row">
                    <div class="form-group"><label>First Name</label><input type="text" required placeholder="Jane"></div>
                    <div class="form-group"><label>Last Name</label><input type="text" required placeholder="Doe"></div>
                </div>
                <div class="form-group"><label>Address</label><input type="text" required placeholder="123 Main Street"></div>
                <div class="form-group"><label>Apartment / Suite</label><input type="text" placeholder="Apt 4B"></div>
                <div class="form-row">
                    <div class="form-group"><label>City</label><input type="text" required placeholder="New York"></div>
                    <div class="form-group"><label>State</label><select><option>New York</option><option>California</option><option>Texas</option><option>Florida</option><option>Illinois</option></select></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>ZIP Code</label><input type="text" required placeholder="10003"></div>
                    <div class="form-group"><label>Country</label><input type="text" value="United States" readonly></div>
                </div>
                <div class="form-actions">
                    <a href="cart.html" class="btn btn-outline">Back to Cart</a>
                    <button type="submit" class="btn btn-primary">Continue to Payment</button>
                </div>
            </form>
        `;
        document.getElementById('checkoutForm1').addEventListener('submit', (e) => { e.preventDefault(); renderCheckout(2); });
    } else if (step === 2) {
        content.innerHTML = `
            <form class="checkout-form" id="checkoutForm2">
                <h3>Payment Information</h3>
                <p style="color:var(--muted);font-size:0.85rem;margin-bottom:20px;">Secure demo form. No real payment is processed.</p>
                <div class="form-group"><label>Cardholder Name</label><input type="text" required placeholder="Jane Doe"></div>
                <div class="form-group"><label>Card Number</label><input type="text" required placeholder="4242 4242 4242 4242" maxlength="19"></div>
                <div class="form-row">
                    <div class="form-group"><label>Expiry Date</label><input type="text" required placeholder="MM/YY"></div>
                    <div class="form-group"><label>CVV</label><input type="text" required placeholder="123" maxlength="4"></div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="renderCheckout(1)">Back</button>
                    <button type="submit" class="btn btn-primary">Review Order</button>
                </div>
            </form>
        `;
        document.getElementById('checkoutForm2').addEventListener('submit', (e) => { e.preventDefault(); renderCheckout(3); });
    } else if (step === 3) {
        const subtotal = state.cart.reduce((sum, item) => sum + (item.sale || item.price) * item.qty, 0);
        const discount = state.appliedPromo ? subtotal * state.appliedPromo : 0;
        const shipping = subtotal >= 100 ? 0 : 12;
        const tax = (subtotal - discount) * 0.08875;
        const total = subtotal - discount + shipping + tax;
        content.innerHTML = `
            <div class="checkout-form">
                <h3>Review Your Order</h3>
                <div class="review-section"><h4>Items (${state.cart.length})</h4>${state.cart.map(item => `<p>${item.name} \u00D7 ${item.qty} \u2014 $${((item.sale || item.price) * item.qty).toLocaleString()}</p>`).join('')}</div>
                <div class="review-section"><h4>Shipping</h4><p>Jane Doe<br>123 Main Street<br>New York, NY 10003</p></div>
                <div class="review-section"><h4>Payment</h4><p>Visa ending in 4242</p></div>
                <div class="review-section">
                    <h4>Order Summary</h4>
                    <p>Subtotal: $${subtotal.toFixed(2)}</p>
                    ${discount > 0 ? `<p style="color:#22c55e">Discount: -$${discount.toFixed(2)}</p>` : ''}
                    <p>Shipping: ${shipping === 0 ? 'Free' : '$'+shipping.toFixed(2)}</p>
                    <p>Tax: $${tax.toFixed(2)}</p>
                    <p style="font-weight:700;font-size:1.1rem;">Total: $${total.toFixed(2)}</p>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="renderCheckout(2)">Back</button>
                    <button type="button" class="btn btn-primary" id="placeOrderBtn">Place Order</button>
                </div>
            </div>
        `;
        document.getElementById('placeOrderBtn').addEventListener('click', () => {
            const orderNum = 'VB-' + Date.now().toString(36).toUpperCase();
            state.cart = [];
            state.appliedPromo = null;
            saveState();
            updateCounts();
            const modal = document.createElement('div');
            modal.className = 'modal-overlay open';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-icon">\u2713</div>
                    <h2>Order Confirmed</h2>
                    <p>Thank you for your purchase!</p>
                    <div class="order-num">${orderNum}</div>
                    <p style="color:var(--muted);font-size:0.85rem;">A confirmation email will be sent to<br>jane@example.com</p>
                    <br>
                    <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
            document.getElementById('checkoutContent').innerHTML = '';
        });
    }
}

updateCounts();
