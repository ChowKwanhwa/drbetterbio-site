// Page language switching. English lives in the HTML markup; other
// languages come from assets/js/i18n/*.js (window.YANIAER_LOCALES).
(() => {
  'use strict';

  const STORAGE_KEY = 'yaniaer-lang';
  const DEFAULT_LANG = 'en';
  const LANGS = Object.freeze([
    { code: 'en', short: 'EN', label: 'English' },
    { code: 'zh-Hant', short: '繁', label: '繁體中文' },
    { code: 'vi', short: 'VI', label: 'Tiếng Việt' }
  ]);

  // Strings built in JavaScript (the markup has no English copy of these).
  const EN_UI = Object.freeze({
    'lang.label': 'Language',
    'ui.all': 'All',
    'cat.Masks': 'Masks',
    'cat.Eye Care': 'Eye Care',
    'ui.addToBag': 'Add to Bag',
    'ui.added': 'Added ✓',
    'ui.comingSoon': 'Coming Soon',
    'ui.arrivingSoon': 'Arriving soon',
    'ui.no': 'No. {no}',
    'ui.count.one': '{n} product',
    'ui.count.other': '{n} products',
    'ui.noMatch': 'No products match this filter.',
    'ui.unavailable': 'Products are unavailable right now. Please refresh the page.',
    'ui.toastAdded': '{name} added to your bag',
    'ui.nlInvalid': 'Please enter a valid email address.',
    'ui.nlThanks': 'Thanks! Check your inbox for your welcome code.'
  });

  const locales = window.YANIAER_LOCALES || {};
  const isSupported = (code) => LANGS.some((l) => l.code === code);
  const listeners = [];
  const originals = new Map();
  let current = DEFAULT_LANG;

  function detectLang() {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (isSupported(fromUrl)) return fromUrl;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isSupported(saved)) return saved;
    } catch (err) {
      console.warn('Language preference unavailable:', err);
    }
    const browser = (navigator.language || '').toLowerCase();
    if (browser.startsWith('zh')) return 'zh-Hant';
    if (browser.startsWith('vi')) return 'vi';
    return DEFAULT_LANG;
  }

  function lookup(key) {
    const dict = locales[current] || {};
    if (key in dict) return dict[key];
    if (key in EN_UI) return EN_UI[key];
    return null;
  }

  function t(key, vars = {}) {
    const found = lookup(key);
    const template = found === null ? key : found;
    return template.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
  }

  // Remember the English markup once so switching back restores it exactly.
  function original(el) {
    if (!originals.has(el)) {
      const attrs = {};
      (el.dataset.i18nAttr || '').split(';').filter(Boolean).forEach((pair) => {
        const [attr] = pair.split(':');
        attrs[attr] = el.getAttribute(attr);
      });
      originals.set(el, { html: el.innerHTML, attrs });
    }
    return originals.get(el);
  }

  function translated(key, fallback) {
    const dict = locales[current] || {};
    return current !== DEFAULT_LANG && key in dict ? dict[key] : fallback;
  }

  function applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.innerHTML = translated(el.dataset.i18n, original(el).html);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const saved = original(el).attrs;
      el.dataset.i18nAttr.split(';').filter(Boolean).forEach((pair) => {
        const [attr, key] = pair.split(':');
        el.setAttribute(attr, translated(key, saved[attr]));
      });
    });
  }

  const descMeta = document.querySelector('meta[name="description"]');
  const meta = {
    title: document.title,
    desc: descMeta ? descMeta.getAttribute('content') : ''
  };

  function applyMeta() {
    document.documentElement.lang = current;
    document.title = translated('meta.title', meta.title);
    if (descMeta) descMeta.setAttribute('content', translated('meta.desc', meta.desc));
  }

  function renderSwitcher() {
    const lang = LANGS.find((l) => l.code === current);
    document.querySelectorAll('[data-lang-current]').forEach((el) => { el.textContent = lang.short; });
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      if (btn.dataset.lang === current) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.setAttribute('aria-label', `${t('lang.label')}: ${lang.label}`);
    });
  }

  function setLang(code) {
    if (!isSupported(code)) return;
    current = code;
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch (err) {
      console.warn('Could not save language preference:', err);
    }
    applyMeta();
    applyStatic();
    renderSwitcher();
    listeners.forEach((fn) => fn(code));
  }

  function bindSwitcher() {
    const root = document.querySelector('[data-lang-switch]');
    if (!root) return;
    const toggle = root.querySelector('[data-lang-toggle]');
    const menu = root.querySelector('[data-lang-menu]');
    const close = () => {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang]');
      if (!btn) return;
      setLang(btn.dataset.lang);
      close();
      toggle.focus();
    });
    document.addEventListener('click', (e) => { if (!root.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { close(); toggle.focus(); } });
  }

  window.I18N = Object.freeze({
    t,
    get lang() { return current; },
    setLang,
    onChange: (fn) => { listeners.push(fn); }
  });

  bindSwitcher();
  setLang(detectLang());
})();
