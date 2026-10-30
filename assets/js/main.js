(() => {
  'use strict';

  const DATA_URL = 'assets/data/products.json';
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
  const { t } = window.I18N;

  const state = { products: [], sort: 'featured', category: ALL, cart: 0 };

  const money = (n) => `$${n.toFixed(2)}`;
  const isAvailable = (p) => p.status === 'available' && typeof p.price === 'number';

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  // Products without a price (coming soon) always sort after purchasable ones.
  const byPrice = (dir) => (a, b) => {
    if (isAvailable(a) !== isAvailable(b)) return isAvailable(a) ? -1 : 1;
    return isAvailable(a) ? dir * (a.price - b.price) : 0;
  };

  const SORTERS = {
    featured: () => 0,
    'price-asc': byPrice(1),
    'price-desc': byPrice(-1),
    name: (a, b) => a.name.localeCompare(b.name, window.I18N.lang)
  };

  // Overlay the current language's name/size/desc/badge onto the English record.
  const localize = (p) => ({ ...p, ...((p.i18n && p.i18n[window.I18N.lang]) || {}) });

  function visibleProducts({ products, sort, category }) {
    const filtered = category === ALL ? products : products.filter((p) => p.category === category);
    return filtered.map(localize).sort(SORTERS[sort] || SORTERS.featured);
  }

  function cardHtml(p) {
    const name = escapeHtml(p.name);
    const id = escapeHtml(p.id);
    const available = isAvailable(p);
    const badge = p.badge
      ? `<span class="badge${available ? '' : ' badge--soon'}">${escapeHtml(p.badge)}</span>`
      : '';
    const detail = p.imageDetail
      ? `<img class="product-card__alt" src="${escapeHtml(p.imageDetail)}" alt="" width="900" height="900" loading="lazy" decoding="async">`
      : '';
    const price = available
      ? `<p class="product-card__price">${money(p.price)}</p>`
      : `<p class="product-card__price product-card__price--soon">${escapeHtml(t('ui.arrivingSoon'))}</p>`;
    const action = available
      ? `<button class="add-btn" type="button" data-add="${id}">${escapeHtml(t('ui.addToBag'))}</button>`
      : `<button class="add-btn" type="button" disabled>${escapeHtml(t('ui.comingSoon'))}</button>`;
    return `
      <article class="product-card${available ? '' : ' is-soon'}" id="${id}">
        <a class="product-card__media" href="#${id}" aria-label="${name}">
          <img src="${escapeHtml(p.image)}" alt="${name}" width="900" height="900" loading="lazy" decoding="async">
          ${detail}
          ${badge}
        </a>
        <p class="product-card__no">${escapeHtml(t('ui.no', { no: p.no }))}</p>
        <h2 class="product-card__title"><a href="#${id}">${name}</a></h2>
        <p class="product-card__size">${escapeHtml(p.size)}</p>
        <p class="product-card__desc">${escapeHtml(p.desc)}</p>
        ${price}
        ${action}
      </article>`;
  }

  function render() {
    const items = visibleProducts(state);
    grid.innerHTML = items.length
      ? items.map(cardHtml).join('')
      : `<p class="grid-status">${escapeHtml(t('ui.noMatch'))}</p>`;
    countEl.textContent = t(items.length === 1 ? 'ui.count.one' : 'ui.count.other', { n: items.length });
  }

  function renderFilters() {
    const categories = [ALL, ...new Set(state.products.map((p) => p.category))];
    filterRow.innerHTML = categories.map((c) =>
      `<button type="button" class="chip" data-category="${escapeHtml(c)}" aria-pressed="${c === state.category}">${escapeHtml(c === ALL ? t('ui.all') : t(`cat.${c}`))}</button>`
    ).join('');
  }

  function setCategory(category) {
    state.category = category;
    $$('[data-category]', filterRow).forEach((c) =>
      c.setAttribute('aria-pressed', String(c.dataset.category === state.category)));
    $$('[data-nav-category]').forEach((link) => {
      if (link.dataset.navCategory === state.category) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    render();
  }

  let toastTimer;
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, TOAST_MS);
  }

  function addToCart(id, button) {
    const found = state.products.find((p) => p.id === id);
    const product = found && localize(found);
    if (!product || !isAvailable(product)) return;
    state.cart += 1;
    cartCountEl.textContent = String(state.cart);
    cartCountEl.hidden = false;
    const original = button.innerHTML;
    button.classList.add('is-added');
    button.textContent = t('ui.added');
    setTimeout(() => {
      button.classList.remove('is-added');
      button.innerHTML = original;
    }, 1600);
    showToast(t('ui.toastAdded', { name: product.name }));
  }

  function bindEvents() {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      render();
    });

    filterRow.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-category]');
      if (chip) setCategory(chip.dataset.category);
    });

    $$('[data-nav-category]').forEach((link) => {
      link.addEventListener('click', () => {
        setCategory(link.dataset.navCategory);
        $('#primary-nav').classList.remove('is-open');
        $('.menu-toggle').setAttribute('aria-expanded', 'false');
      });
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
        msg.textContent = t('ui.nlInvalid');
        return;
      }
      msg.textContent = t('ui.nlThanks');
      form.reset();
    });
  }

  async function init() {
    $('[data-year]').textContent = String(new Date().getFullYear());
    bindEvents();
    window.I18N.onChange(() => {
      if (!state.products.length) return;
      renderFilters();
      render();
    });
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
      grid.innerHTML = `<p class="grid-status">${escapeHtml(t('ui.unavailable'))}</p>`;
    }
  }

  init();
})();
