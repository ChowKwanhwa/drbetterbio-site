(() => {
  'use strict';

  const DATA_URL = 'assets/data/products.json';
  const SUBSCRIBE_DISCOUNT = 0.1;
  const ALL = 'All';
  const TOAST_MS = 2400;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const grid = $('[data-grid]');
  const sortSelect = $('[data-sort]');
  const filterRow = $('[data-filters]');
  const countEl = $('[data-count]');
  const cartCountEl = $('[data-cart-count]');
  const toastEl = $('[data-toast]');

  const state = { products: [], sort: 'featured', category: ALL, cart: 0 };

  const money = (n) => `$${n.toFixed(2)}`;

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const SORTERS = {
    featured: () => 0,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name)
  };

  function visibleProducts({ products, sort, category }) {
    const filtered = category === ALL ? products : products.filter((p) => p.category === category);
    return [...filtered].sort(SORTERS[sort] || SORTERS.featured);
  }

  function cardHtml(p) {
    const name = escapeHtml(p.name);
    const sub = money(p.price * (1 - SUBSCRIBE_DISCOUNT));
    const badge = p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : '';
    return `
      <article class="product-card">
        <a class="product-card__media" href="#${escapeHtml(p.id)}" aria-label="${name}">
          <img src="${escapeHtml(p.image)}" alt="${name}" width="900" height="900" loading="lazy" decoding="async">
          ${badge}
        </a>
        <h2 class="product-card__title"><a href="#${escapeHtml(p.id)}">${name}</a></h2>
        <p class="product-card__desc">${escapeHtml(p.desc)}</p>
        <p class="product-card__price">${money(p.price)}</p>
        <button class="subscribe-btn" type="button" data-add="${escapeHtml(p.id)}">Subscribe &amp; Save · ${sub}</button>
        <a class="learn-more" href="#${escapeHtml(p.id)}">Learn more →</a>
      </article>`;
  }

  function render() {
    const items = visibleProducts(state);
    grid.innerHTML = items.length
      ? items.map(cardHtml).join('')
      : '<p class="grid-status">No products match this filter.</p>';
    countEl.textContent = `${items.length} product${items.length === 1 ? '' : 's'}`;
  }

  function renderFilters() {
    const categories = [ALL, ...new Set(state.products.map((p) => p.category))];
    filterRow.innerHTML = categories.map((c) =>
      `<button type="button" class="chip" data-category="${escapeHtml(c)}" aria-pressed="${c === state.category}">${escapeHtml(c)}</button>`
    ).join('');
  }

  let toastTimer;
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, TOAST_MS);
  }

  function addToCart(id, button) {
    const product = state.products.find((p) => p.id === id);
    if (!product) return;
    state.cart += 1;
    cartCountEl.textContent = String(state.cart);
    cartCountEl.hidden = false;
    const original = button.innerHTML;
    button.classList.add('is-added');
    button.textContent = 'Added ✓';
    setTimeout(() => {
      button.classList.remove('is-added');
      button.innerHTML = original;
    }, 1600);
    showToast(`${product.name} added to your bag`);
  }

  function bindEvents() {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      render();
    });

    filterRow.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-category]');
      if (!chip) return;
      state.category = chip.dataset.category;
      $$('[data-category]', filterRow).forEach((c) =>
        c.setAttribute('aria-pressed', String(c.dataset.category === state.category)));
      render();
    });

    const refineBtn = $('[data-refine-toggle]');
    const refinePanel = $('#refine-panel');
    refineBtn.addEventListener('click', () => {
      const open = refineBtn.getAttribute('aria-expanded') !== 'true';
      refineBtn.setAttribute('aria-expanded', String(open));
      refinePanel.hidden = !open;
    });

    $$('button[data-density]').forEach((btn) => {
      btn.addEventListener('click', () => {
        grid.dataset.density = btn.dataset.density;
        $$('button[data-density]').forEach((b) => b.classList.toggle('is-active', b === btn));
      });
    });

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (btn) addToCart(btn.dataset.add, btn);
    });

    const menuBtn = $('.menu-toggle');
    const nav = $('#primary-nav');
    menuBtn.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
    });

    const form = $('[data-newsletter]');
    const msg = $('[data-newsletter-msg]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      if (!EMAIL_RE.test(email)) {
        msg.textContent = 'Please enter a valid email address.';
        return;
      }
      msg.textContent = 'Thanks! Check your inbox for your welcome code.';
      form.reset();
    });
  }

  async function init() {
    $('[data-year]').textContent = String(new Date().getFullYear());
    bindEvents();
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid product data');
      state.products = Object.freeze(data.map((p) => Object.freeze({ ...p })));
      renderFilters();
      render();
    } catch (err) {
      console.error('Failed to load products:', err);
      grid.innerHTML = '<p class="grid-status">Products are unavailable right now. Please refresh the page.</p>';
    }
  }

  init();
})();
