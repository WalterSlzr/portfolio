/* i18n.js — language state and DOM translation.
   The copy itself lives in js/locales/<lang>.js, one file per language.

   Language is chosen in this order:
   1. ?lang=en|es in the URL (handy for sending a client a direct link)
   2. the visitor's last choice, saved in localStorage
   3. otherwise English — the default for international clients

   Markup hooks:
   data-i18n="key"            → textContent
   data-i18n-html="key"       → innerHTML (dictionary is trusted, static copy)
   data-i18n-attr="attr:key"  → attribute; several separated by ";" */

(function () {
  "use strict";

  const STORAGE_KEY = "ws-lang";
  const SUPPORTED = ["en", "es"];

  const DICT = window.LOCALES || {};

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function store(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode: choice lasts this page view */ }
  }

  function initialLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (SUPPORTED.includes(fromUrl)) { store(fromUrl); return fromUrl; }
    const saved = readStored();
    return SUPPORTED.includes(saved) ? saved : "en";
  }

  const listeners = [];
  let lang = initialLang();

  function t(key) {
    const v = (DICT[lang] || {})[key];
    return v !== undefined ? v : DICT.en[key];
  }

  function apply(root = document) {
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = t("meta.description");

    root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
  }

  function set(next) {
    if (!SUPPORTED.includes(next) || next === lang) return;
    lang = next;
    store(lang);
    // Keep a shared ?lang= link in sync with the visible language.
    const url = new URL(location.href);
    if (url.searchParams.has("lang")) {
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    }
    apply();
    listeners.forEach((fn) => fn(lang));
  }

  window.I18N = {
    get lang() { return lang; },
    t,
    apply,
    set,
    toggle() { set(lang === "en" ? "es" : "en"); },
    onChange(fn) { listeners.push(fn); }
  };

  document.documentElement.lang = lang;
})();
