/* ===========================================================
   Elvique — checkout.js
   Checkout page specific JavaScript logic
   =========================================================== */

function renderCheckoutSummary() {
  const container = document.getElementById('checkoutSummaryItems');
  if (!container) return; // Not on checkout page

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calc Shipping (Flat Rs. 150)
  // If cart is empty, shipping is 0
  const shippingFee = cart.length === 0 ? 0 : 150;
  
  const grandTotal = subtotal + shippingFee;

  // Update DOM summary items
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message" style="margin: 2rem 0;">
        <span class="cart-empty-icon" style="font-size: 2.2rem;">🛍️</span>
        <p style="font-size: .88rem;">Your cart is empty.</p>
        <button class="cart-empty-shop-btn" onclick="window.location.href='index.html#products';" style="margin-top: 1rem; padding: .5rem 1.2rem;">Shop Products</button>
      </div>
    `;
    const form = document.getElementById('checkoutForm');
    if (form) {
      const placeBtn = document.getElementById('placeOrderBtn');
      if (placeBtn) placeBtn.setAttribute('disabled', 'disabled');
    }
  } else {
    container.innerHTML = cart.map(item => `
      <div class="summary-item">
        <div class="summary-item-emoji">${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">` : item.emoji}</div>
        <div class="summary-item-details">
          <div class="summary-item-name">${item.name}</div>
          <div class="summary-item-qty-price">${item.quantity} × Rs. ${item.price.toLocaleString()}</div>
        </div>
        <div class="summary-item-total">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
      </div>
    `).join('');
    
    const placeBtn = document.getElementById('placeOrderBtn');
    if (placeBtn) placeBtn.removeAttribute('disabled');
  }

  // Update calculations
  const subEl = document.getElementById('checkoutSubtotal');
  const shipEl = document.getElementById('checkoutShipping');
  const totalEl = document.getElementById('checkoutGrandTotal');

  if (subEl) subEl.textContent = 'Rs. ' + subtotal.toLocaleString();
  if (shipEl) shipEl.textContent = shippingFee === 0 ? 'Rs. 0' : 'Rs. ' + shippingFee.toLocaleString();
  if (totalEl) totalEl.textContent = 'Rs. ' + Math.round(grandTotal).toLocaleString();
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  if (cart.length === 0) return;

  const btn = document.getElementById('placeOrderBtn');
  if (!btn) return;

  // Show spinner
  const originalText = btn.textContent;
  btn.innerHTML = `<span class="btn-spinner"></span> Processing...`;
  btn.setAttribute('disabled', 'disabled');

  setTimeout(() => {
    // Show success modal
    const emailVal = document.getElementById('email').value;
    const successEmail = document.getElementById('successEmail');
    if (successEmail) successEmail.textContent = emailVal;

    const modalOverlay = document.getElementById('successModalOverlay');
    if (modalOverlay) modalOverlay.classList.add('open');

    // Reset button
    btn.innerHTML = originalText;
    btn.removeAttribute('disabled');
  }, 1800);
}

function clearCartAndCloseModal(e) {
  // Clear cart and redirect
  cart = [];
  saveCart();
  renderCart();
  
  const modalOverlay = document.getElementById('successModalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('open');
}

/* ── INIT CHECKOUT SUMMARY ── */
renderCheckoutSummary();
