/* ===========================================================
   Elvique — checkout.js
   Checkout page specific JavaScript logic
   =========================================================== */

/* ── ORDER ID GENERATOR ── 
   Format: ELV-XXXXXX (e.g. ELV-20260619-A3F7K)
*/
function generateOrderId() {
  const timestamp = Date.now().toString().slice(-4); // last 4 digits of current time (ms)
  const random = Math.floor(10 + Math.random() * 90); // 2-digit random number (10–99)
  return `ELV-${timestamp}${random}`;
}

/* ── WEBHOOK URL LOADER ──
   Priority order:
   1. window._elvique_config.webhookUrl  (set by config.js — local dev, git-ignored)
   2. window.__ENV__.WEBHOOK_URL         (injected by hosting platform at build/runtime)
   3. null → webhook silently skipped, order still completes
*/
function getWebhookUrl() {
  if (window._elvique_config && window._elvique_config.webhookUrl) {
    return window._elvique_config.webhookUrl;
  }
  if (window.__ENV__ && window.__ENV__.WEBHOOK_URL) {
    return window.__ENV__.WEBHOOK_URL;
  }
  return null;
}

/* ── WEBHOOK BASIC AUTH CREDENTIALS ──
   Priority order (same pattern as getWebhookUrl):
   1. window._elvique_config.webhookUser / webhookPass  (local dev, git-ignored)
   2. window.__ENV__.WEBHOOK_USER / WEBHOOK_PASS         (injected by hosting platform)
   3. Fallback defaults below.

   NOTE: This is client-side JS — anyone can view-source and read these values.
   Basic Auth here only stops casual/automated hits on the webhook URL; it is
   NOT a substitute for real security. Don't reuse this password anywhere else,
   and treat the webhook endpoint as effectively public.
*/
function getWebhookAuth() {
  if (window._elvique_config && window._elvique_config.webhookUser) {
    return { user: window._elvique_config.webhookUser, pass: window._elvique_config.webhookPass || '' };
  }
  if (window.__ENV__ && window.__ENV__.WEBHOOK_USER) {
    return { user: window.__ENV__.WEBHOOK_USER, pass: window.__ENV__.WEBHOOK_PASS || '' };
  }
  return { user: 'elviqueOnlineGitHub1', pass: 'Elv1que#Wh2026!Secure' };
}

/* ── SEND TO N8N WEBHOOK ──
   Returns a result object so the caller can decide whether the order
   actually succeeded instead of always assuming success:
   { success: true }
   { success: false, reason: 'no-url' | 'bad-status' | 'network-error', ... }
*/
async function sendToWebhook(orderPayload) {
  const url = getWebhookUrl();
  if (!url) {
    console.warn('[Elvique] No webhook URL configured — skipping webhook call.');
    return { success: false, reason: 'no-url' };
  }

  const { user, pass } = getWebhookAuth();
  const authHeader = 'Basic ' + btoa(`${user}:${pass}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      console.error('[Elvique] Webhook responded with error status:', response.status);
      return { success: false, reason: 'bad-status', status: response.status };
    }

    console.log('[Elvique] Webhook sent for order:', orderPayload['OrderID']);
    return { success: true };
  } catch (err) {
    console.error('[Elvique] Webhook failed:', err);
    return { success: false, reason: 'network-error', error: err };
  }
}

/* ── CHECKOUT SUMMARY RENDERER ── */
function renderCheckoutSummary() {
  const container = document.getElementById('checkoutSummaryItems');
  if (!container) return;

  const subtotal    = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = cart.length === 0 ? 0 : 150;
  const grandTotal  = subtotal + shippingFee;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message" style="margin: 2rem 0;">
        <span class="cart-empty-icon" style="font-size: 2.2rem;">🛍️</span>
        <p style="font-size: .88rem;">Your cart is empty.</p>
        <button class="cart-empty-shop-btn" onclick="window.location.href='index.html#products';" style="margin-top: 1rem; padding: .5rem 1.2rem;">Shop Products</button>
      </div>
    `;
    const placeBtn = document.getElementById('placeOrderBtn');
    if (placeBtn) placeBtn.setAttribute('disabled', 'disabled');
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

  const subEl   = document.getElementById('checkoutSubtotal');
  const shipEl  = document.getElementById('checkoutShipping');
  const totalEl = document.getElementById('checkoutGrandTotal');

  if (subEl)   subEl.textContent   = 'Rs. ' + subtotal.toLocaleString();
  if (shipEl)  shipEl.textContent  = shippingFee === 0 ? 'Rs. 0' : 'Rs. ' + shippingFee.toLocaleString();
  if (totalEl) totalEl.textContent = 'Rs. ' + Math.round(grandTotal).toLocaleString();
}

/* ── CHECKOUT FORM SUBMIT ── */
async function handleCheckoutSubmit(e) {
  e.preventDefault();
  if (cart.length === 0) return;

  const btn = document.getElementById('placeOrderBtn');
  if (!btn) return;

  // Clear any previous error message
  const errorMsg = document.getElementById('checkoutErrorMsg');
  if (errorMsg) {
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
  }

  const getValue = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

  const orderId      = generateOrderId();
  const subtotal     = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping     = 150;
  const grandTotal   = subtotal + shipping;
  const customerName = `${getValue('firstName')} ${getValue('lastName')}`.trim();
  const email        = getValue('email');
  const phone        = getValue('phone');
  const address      = getValue('address');
  const city         = getValue('city');
  const zipCode      = getValue('zipCode');

  /* ── GOOGLE SHEET PAYLOAD ──
     Single flat object — one row per order (1 product per checkout).
     n8n receives this directly and appends it as one sheet row.
  */
  const item = cart[0];
  const orderPayload = {
    'OrderID'               : orderId,
    'Customer Name'         : customerName,
    'Phone'                 : phone,
    'Email'                 : email,
    'Address'               : address,
    'City'                  : city,
    'Zip Code'              : zipCode,
    'Product'               : item.name,
    'Qty'                   : item.quantity,
    'Price 1 unit'          : item.price,
    'Subtotal'              : item.price * item.quantity,
    'Shipping Fee'          : shipping,
    'Grand Total'           : grandTotal,
    'Status'                : 'In Process',
    'Processing email'      : 'Not Sent',
    'Confirm email'         : 'Not Sent',
    'Out for Delivery email': 'Not Sent',
    'Delivered email'       : 'Not Sent',
    'Cancel email'          : 'Not Sent',
  };

  // Show spinner
  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<span class="btn-spinner"></span> Processing...`;
  btn.setAttribute('disabled', 'disabled');

  // Fire webhook and check whether it actually succeeded
  const webhookResult = await sendToWebhook(orderPayload);

  // "no-url" means webhook isn't configured (local dev) — treat as a silent
  // skip, not a failure, so dev environments without config.js still work.
  // Any other failure (network error / bad response) is a real failure.
  const orderSucceeded = webhookResult.success || webhookResult.reason === 'no-url';

  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.removeAttribute('disabled');

    if (!orderSucceeded) {
      // Don't show the success modal — show an error instead
      if (errorMsg) {
        errorMsg.textContent = '⚠️ We couldn\'t place your order — please check your connection and try again.';
        errorMsg.style.display = 'block';
      }
      return;
    }

    // Show order details in success modal
    const successOrderId = document.getElementById('successOrderId');
    if (successOrderId) successOrderId.textContent = orderId;

    const successProductName = document.getElementById('successProductName');
    if (successProductName) successProductName.textContent = item.name;

    const successProductQty = document.getElementById('successProductQty');
    if (successProductQty) successProductQty.textContent = item.quantity;

    const successEmail = document.getElementById('successEmail');
    if (successEmail) successEmail.textContent = email;

    const modalOverlay = document.getElementById('successModalOverlay');
    if (modalOverlay) modalOverlay.classList.add('open');
  }, 1800);
}

/* ── CLEAR CART & CLOSE MODAL ── */
function clearCartAndCloseModal() {
  cart = [];
  saveCart();
  renderCart();

  const modalOverlay = document.getElementById('successModalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('open');
}

/* ── INIT ── */
renderCheckoutSummary();
