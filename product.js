function selectOption(btn) {
  btn.parentElement.querySelectorAll('.option-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function renderProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const product = products.find(p => p.id === id);

  if (!product) {
    window.location.href = 'index.html#products';
    return;
  }

  document.title = `${product.name} — Elvique`;


  document.getElementById('productCat').textContent = product.cat;
  document.getElementById('productTitle').textContent = product.name;
  document.getElementById('productDesc').textContent = product.description || '';

  document.getElementById('productMainImage').innerHTML = product.image
    ? `<img src="${product.image}" alt="${product.name}">`
    : `<span>${product.emoji}</span>`;

  const badge = document.getElementById('productBadge');
  if (product.badge) {
    badge.textContent = product.badge;
    badge.className = `product-badge product-detail-badge ${product.badgeClass}`;
    badge.style.display = 'block';
  }

  document.getElementById('productPrice').innerHTML =
    `Rs. ${product.price.toLocaleString()}` +
    (product.oldPrice ? `<del>Rs. ${product.oldPrice.toLocaleString()}</del>` : '');

  if (product.sizes?.length) {
    document.getElementById('productSizes').style.display = 'block';
    document.getElementById('sizePills').innerHTML = product.sizes.map((s, i) =>
      `<button type="button" class="option-pill${i === 0 ? ' active' : ''}" onclick="selectOption(this)">${s}</button>`
    ).join('');
  }

  if (product.colors?.length) {
    document.getElementById('productColors').style.display = 'block';
    document.getElementById('colorPills').innerHTML = product.colors.map((c, i) =>
      `<button type="button" class="option-pill${i === 0 ? ' active' : ''}" onclick="selectOption(this)">${c}</button>`
    ).join('');
  }

  document.getElementById('addToCartBtn').onclick = () => addToCart(product.name);
}

renderProductPage();
