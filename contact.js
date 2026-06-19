/**
 * contact.js
 * Handles the contact form submission for Elvique.
 * Reads the webhook URL from window._elvique_contactUs_config (set in config.js).
 */

/**
 * Reads the contact form webhook URL from config.js.
 * @returns {string|null}
 */
function getContactConfig() {
  const config = window._elvique_contactUs_config;
  if (!config || !config.webhookUrl) {
    console.error('getContactConfig: webhookUrl not found in _elvique_contactUs_config.');
    return null;
  }
  return config;
}

function getContactAuthHeaders(config) {
  if (!config?.username || !config?.password) return {};
  return {
    Authorization: 'Basic ' + btoa(`${config.username}:${config.password}`),
  };
}

/**
 * Validates a single field — marks it red if empty, clears if valid.
 * @returns {boolean}
 */
function validateField(input, value) {
  if (!value) {
    input.style.borderColor = '#e74c3c';
    return false;
  }
  input.style.borderColor = '';
  return true;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Shows inline feedback below the submit button.
 * @param {'success'|'error'|'clear'} type
 * @param {string} [message]
 */
function showFormFeedback(type, message) {
  const form = document.querySelector('.contact-form');
  const existing = form.querySelector('.form-feedback');
  if (existing) existing.remove();
  if (type === 'clear') return;

  const el = document.createElement('p');
  el.className = 'form-feedback';
  el.textContent = message;
  el.style.cssText = `
    margin-top: 12px;
    font-size: 0.9rem;
    font-weight: 500;
    color: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
  `;
  form.appendChild(el);

  if (type === 'error') {
    setTimeout(() => el.remove(), 5000);
  }
}

async function handleContactSubmit(event) {
  event.preventDefault();
  event.stopPropagation();

  // 1. Get webhook URL and auth
  const config = getContactConfig();
  if (!config) {
    showFormFeedback('error', 'Configuration error. Please contact us directly via email.');
    return;
  }

  const webhookUrl = config.webhookUrl;
  const authHeaders = getContactAuthHeaders(config);

  // 2. Get form + fields by name/position
  const form = document.querySelector('.contact-form');
  const allInputs = form.querySelectorAll('input, textarea');
  const firstNameInput = allInputs[0];
  const lastNameInput  = allInputs[1];
  const emailInput     = allInputs[2];
  const messageInput   = allInputs[3];

  const firstName = firstNameInput.value.trim();
  const lastName  = lastNameInput.value.trim();
  const email     = emailInput.value.trim();
  const message   = messageInput.value.trim();

  // 3. Validate — check every field, collect all errors at once
  let valid = true;
  valid = validateField(firstNameInput, firstName) && valid;
  valid = validateField(lastNameInput, lastName)   && valid;
  valid = validateField(messageInput, message)     && valid;

  // Email needs extra format check
  if (!email) {
    emailInput.style.borderColor = '#e74c3c';
    valid = false;
  } else if (!isValidEmail(email)) {
    emailInput.style.borderColor = '#e74c3c';
    showFormFeedback('error', 'Please enter a valid email address.');
    valid = false;
  } else {
    emailInput.style.borderColor = '';
  }

  if (!valid) {
    if (!form.querySelector('.form-feedback')) {
      showFormFeedback('error', 'Please fill in all fields before sending.');
    }
    return;
  }

  // 4. Submit
  const submitBtn = form.querySelector('.form-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  showFormFeedback('clear');

  let success = false;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        'firstName' : firstName,
        'lastName': lastName,
        'email': email,
        'message': message,
        'submittedAt': new Date().toISOString(),
        'source': 'elvique-contact-form',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    success = true;

  } catch (err) {
    console.error('Contact form submission failed:', err);
    showFormFeedback('error', 'Something went wrong. Please try again or email us directly.');
  }

  // 5. Only update button/form on confirmed success
  if (success) {
    submitBtn.textContent = 'Message Sent ✓';
    submitBtn.style.background = '#2ecc71';
    showFormFeedback('success', "We'll get back to you soon. ✨");
    form.reset();
    allInputs.forEach(el => el.style.borderColor = '');

    // Reset button after 4 seconds
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message →';
      submitBtn.style.background = '';
    }, 4000);
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message →';
  }
}