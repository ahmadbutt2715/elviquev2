/* ===========================================================
   Elvique — script.js
   Shared JavaScript for index.html, about.html, contact.html
   =========================================================== */

/* ── PRODUCTS DATA ── */
const products = [
  { id:1, name:'Signature Tote Bag', cat:'bags', emoji:'👜', image:'images/signature_tote_bag.png', price:8500, oldPrice:11000, badge:'New', badgeClass:'new', description:'Premium handcrafted leather tote with gold-tone hardware. Spacious interior fits daily essentials with an interior zip pocket.', sizes:['One Size'], colors:['Black','Tan'] },
  { id:2, name:'Luxe Crossbody', cat:'bags', emoji:'👝', image:'images/luxe_crossbody.png', price:5500, oldPrice:7200, badge:'Sale', badgeClass:'sale', description:'Compact crossbody crafted from soft pebbled leather. Adjustable strap and magnetic flap closure for effortless everyday elegance.', sizes:['One Size'], colors:['Burgundy','Black'] },
  { id:3, name:'Leather Clutch', cat:'bags', emoji:'💼', image:'images/leather_clutch.png', price:3800, badge:'', badgeClass:'', description:'Sleek evening clutch in smooth calf leather. Slim profile with a detachable wrist strap — perfect for nights out.', sizes:['One Size'], colors:['Black','Gold'] },
  { id:4, name:'Sneakers Pro X', cat:'shoes', emoji:'👟', image:'images/sneakers_pro_x.png', price:6500, oldPrice:8500, badge:'Hot', badgeClass:'sale', description:'Lightweight performance sneakers with cushioned sole and breathable mesh upper. Street-ready style meets all-day comfort.', sizes:['38','39','40','41','42'], colors:['White','Black'] },
  { id:5, name:'Block Heel Pumps', cat:'shoes', emoji:'👠', image:'images/block_heel_pumps.png', price:4200, badge:'New', badgeClass:'new', description:'Classic block heel pumps in patent leather. Stable 7cm heel and padded insole for confident, comfortable wear.', sizes:['36','37','38','39','40'], colors:['Nude','Black'] },
  { id:6, name:'Diamond Ring', cat:'jewelry', emoji:'💍', image:'images/diamond_ring.png', price:45000, badge:'Exclusive', badgeClass:'', description:'Exquisite solitaire ring set in 18k white gold with a brilliant-cut center stone. A timeless symbol of elegance.', sizes:['6','7','8','9'], colors:['White Gold'] },
  { id:7, name:'Gold Layered Chain', cat:'jewelry', emoji:'📿', image:'images/gold_layered_chain.png', price:12500, oldPrice:16000, badge:'Sale', badgeClass:'sale', description:'Delicate triple-layer chain necklace in 14k gold vermeil. Adjustable length for versatile layering.', sizes:['16"','18"','20"'], colors:['Gold'] },
  { id:8, name:'Oversized Sunglasses', cat:'accessories', emoji:'🕶️', image:'images/oversized_sunglasses.png', price:2200, badge:'New', badgeClass:'new', description:'Bold oversized frames with UV400 protection lenses. Acetate construction with a sculpted silhouette.', sizes:['One Size'], colors:['Black','Tortoise'] },
];

function goToProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

function renderProducts(filter) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return; // products grid only exists on index.html
  const list = filter === 'all' ? products : products.filter(p => p.cat === filter);
  grid.innerHTML = list.map(p => `
    <div class="product-card" data-cat="${p.cat}" onclick="goToProduct(${p.id})">
      <div class="product-img">
        ${p.image ? `<img src="${p.image}" alt="${p.name}">` : `<span>${p.emoji}</span>`}
        ${p.badge ? `<span class="product-badge ${p.badgeClass}">${p.badge}</span>` : ''}
        <div class="product-wish" onclick="event.stopPropagation(); toggleWish(this)">🤍</div>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-footer">
          <div class="product-price">Rs. ${p.price.toLocaleString()}${p.oldPrice ? `<del>Rs. ${p.oldPrice.toLocaleString()}</del>` : ''}</div>
          <button class="product-add" onclick="event.stopPropagation(); addToCart('${p.name}')">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterProducts(cat, btn) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat);
}

function toggleWish(el) { el.textContent = el.textContent === '🤍' ? '❤️' : '🤍'; }

/* ── CART STATE & LOGIC ── */
let cart = JSON.parse(localStorage.getItem('elvique_cart')) || [];

function saveCart() {
  localStorage.setItem('elvique_cart', JSON.stringify(cart));
}

let toastTimer;
function addToCart(name) {
  // Find product by name
  let product = products.find(p => p.name === name);
  // Support clicking mock product in the phone visual
  if (!product && name === 'Designer Tote Bag') {
    product = products.find(p => p.id === 1); // Signature Tote Bag
  }
  
  if (product) {
    const cartItem = cart.find(item => item.id === product.id);
    if (cartItem) {
      cartItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    renderCart();
  }

  // Display toast
  const toast = document.getElementById('cartToast');
  if (toast) {
    document.getElementById('toastName').textContent = product ? product.name : name;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

function toggleCartDrawer(isOpen) {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    if (isOpen) {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
}

function updateQuantity(productId, amount) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += amount;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    saveCart();
    renderCart();
  }
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function renderCart() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update nav badges
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  }

  // Update drawer header count
  const headerCount = document.getElementById('cartCountHeader');
  if (headerCount) {
    headerCount.textContent = totalCount;
  }

  // Update subtotal
  const subtotalEl = document.getElementById('cartSubtotal');
  if (subtotalEl) {
    subtotalEl.textContent = 'Rs. ' + subtotal.toLocaleString();
  }

  // Render items list
  const container = document.getElementById('cartDrawerItems');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message">
        <span class="cart-empty-icon">🛍️</span>
        <p>Your cart is empty.</p>
        <p style="margin-top: .4rem; font-size: .85rem; color: var(--muted);">Explore our premium collections!</p>
        <button class="cart-empty-shop-btn" onclick="toggleCartDrawer(false); window.location.href='index.html#products';">Shop Now</button>
      </div>
    `;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-emoji">${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">` : item.emoji}</div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
          <div class="cart-item-actions">
            <div class="cart-qty-selector">
              <button class="cart-qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Remove item">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // If on checkout page, render checkout summary as well
  if (typeof renderCheckoutSummary === 'function') {
    renderCheckoutSummary();
  }
}

function checkoutCart() {
  if (cart.length === 0) {
    alert("Your cart is empty! Add some items before checking out.");
    return;
  }
  window.location.href = 'checkout.html';
}

/* ── CHECKOUT PAGE ACTIONS & RENDERING ── */



function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target;
  btn.textContent = '✓ Message Sent!';
  btn.style.background = 'linear-gradient(135deg,#00c9a7,#009e87)';
  setTimeout(() => {
    btn.textContent = 'Send Message →';
    btn.style.background = '';
  }, 3000);
}

/* ── HAMBURGER MENU ── */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.querySelector('.nav-links');

if (hamburger && navLinksEl) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', isOpen);
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinksEl.classList.remove('mobile-open');
      hamburger.classList.remove('open');
    });
  });
}

/* ── NAV ACTIVE STATE ──
   On index.html: highlight link based on which section is in view.
   On about.html / contact.html: the active class is set directly
   in the HTML, but we still keep scroll handling for index sections. */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

if (sections.length && navLinks.length) {
  // Find only the section IDs that actually exist as anchor links in the navbar
  const activeSectionIds = Array.from(navLinks)
    .map(a => {
      const href = a.getAttribute('href') || '';
      const hashIndex = href.indexOf('#');
      return hashIndex !== -1 ? href.substring(hashIndex + 1) : null;
    })
    .filter(id => id !== null);

  window.addEventListener('scroll', () => {
    let cur = '';
    // Only track sections that have matching navbar anchor links
    sections.forEach(s => {
      if (activeSectionIds.includes(s.id) && window.scrollY >= s.offsetTop - 80) {
        cur = s.id;
      }
    });
    
    if (!cur) return;
    
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.includes('#')) {
        a.classList.toggle('active', href.endsWith('#' + cur));
      }
    });
  });
}

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── INIT ── */
renderProducts('all');
renderCart();
