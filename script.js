/* ===========================================================
   Elvique — script.js
   Shared JavaScript for index.html, about.html, contact.html
   =========================================================== */

/* ── PRODUCTS DATA ── */
const products = [
  { id:1, name:'Signature Tote Bag', cat:'bags', emoji:'👜', price:8500, oldPrice:11000, badge:'New', badgeClass:'new' },
  { id:2, name:'Luxe Crossbody', cat:'bags', emoji:'👝', price:5500, oldPrice:7200, badge:'Sale', badgeClass:'sale' },
  { id:3, name:'Leather Clutch', cat:'bags', emoji:'💼', price:3800, badge:'', badgeClass:'' },
  { id:4, name:'Sneakers Pro X', cat:'shoes', emoji:'👟', price:6500, oldPrice:8500, badge:'Hot', badgeClass:'sale' },
  { id:5, name:'Block Heel Pumps', cat:'shoes', emoji:'👠', price:4200, badge:'New', badgeClass:'new' },
  { id:6, name:'Diamond Ring', cat:'jewelry', emoji:'💍', price:45000, badge:'Exclusive', badgeClass:'' },
  { id:7, name:'Gold Layered Chain', cat:'jewelry', emoji:'📿', price:12500, oldPrice:16000, badge:'Sale', badgeClass:'sale' },
  { id:8, name:'Oversized Sunglasses', cat:'accessories', emoji:'🕶️', price:2200, badge:'New', badgeClass:'new' },
];

function renderProducts(filter) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return; // products grid only exists on index.html
  const list = filter === 'all' ? products : products.filter(p => p.cat === filter);
  grid.innerHTML = list.map(p => `
    <div class="product-card" data-cat="${p.cat}">
      <div class="product-img">
        <span>${p.emoji}</span>
        ${p.badge ? `<span class="product-badge ${p.badgeClass}">${p.badge}</span>` : ''}
        <div class="product-wish" onclick="toggleWish(this)">🤍</div>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-footer">
          <div class="product-price">Rs. ${p.price.toLocaleString()}${p.oldPrice ? `<del>Rs. ${p.oldPrice.toLocaleString()}</del>` : ''}</div>
          <button class="product-add" onclick="addToCart('${p.name}')">+</button>
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

let toastTimer;
function addToCart(name) {
  const toast = document.getElementById('cartToast');
  if (!toast) return;
  document.getElementById('toastName').textContent = name;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

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
  window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) cur = s.id; });
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
