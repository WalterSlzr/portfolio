/* main.js — renders the work grid, filters, project viewer,
   language toggle, header state, mobile menu and scroll reveals.
   No dependencies; copy comes from i18n.js and projects.js. */

(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  const i18n = window.I18N;
  const t = i18n.t;
  const projects = window.PROJECTS || [];
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  // A project's text in the active language (Spanish is the base copy).
  const field = (p, key) => (i18n.lang === "en" && p.en && p.en[key] !== undefined ? p.en[key] : p[key]);

  /* ── Marquee ───────────────────────────────────────────── */
  const marquee = $("[data-marquee]");
  function renderMarquee() {
    const items = t("marquee").map((w) => `<span>${esc(w)}</span><b>✦</b>`).join("");
    marquee.innerHTML = items + items; // doubled for a seamless loop
  }

  /* ── Work grid ─────────────────────────────────────────── */
  const grid = $("[data-works]");
  let activeFilter = "all";

  function renderGrid(animate) {
    grid.innerHTML = projects.map((p, i) => {
      const title = esc(field(p, "title"));
      return `
      <li class="work${animate ? "" : " is-in"}" data-category="${p.category}" data-reveal>
        <button class="work__btn" type="button" data-open="${i}" aria-label="${esc(t("work.open"))} ${title}">
          <div class="work__media">
            <span class="work__num">${pad(i + 1)}</span>
            <img src="assets/img/covers/${p.slug}.jpg" width="808" height="632"
                 alt="${esc(t("work.cover"))} ${title}" loading="lazy" decoding="async">
            <span class="work__cta">${esc(t("work.view"))}
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
            </span>
          </div>
          <div class="work__info">
            <div>
              <h3 class="work__title">${title}</h3>
              <p class="work__sub">${esc(field(p, "discipline"))} — ${esc(field(p, "summary"))}</p>
              <div class="swatches" aria-hidden="true">
                ${p.palette.map((c) => `<i style="background:${c}"></i>`).join("")}
              </div>
            </div>
            <span class="work__tag">${esc(t("cat." + p.category))} · ${p.year}</span>
          </div>
        </button>
      </li>`;
    }).join("");
    applyFilter(activeFilter);
  }

  /* ── Filters ───────────────────────────────────────────── */
  const counts = { all: projects.length };
  projects.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
  $$("[data-count]").forEach((el) => { el.textContent = pad(counts[el.dataset.count] || 0); });
  const statProjects = $('[data-stat="projects"]');
  if (statProjects) statProjects.textContent = projects.length;

  function applyFilter(filter) {
    activeFilter = filter;
    $$("[data-filter]").forEach((b) => {
      const on = b.dataset.filter === filter;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    $$(".work", grid).forEach((li) => {
      li.hidden = filter !== "all" && li.dataset.category !== filter;
    });
    // The staggered editorial layout only reads well with the full set.
    grid.classList.toggle("is-editorial", filter === "all");
  }
  $("[data-filters]").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (btn) applyFilter(btn.dataset.filter);
  });

  /* ── Project viewer ────────────────────────────────────── */
  const viewer = $("[data-viewer]");
  const body = $("[data-v-body]");
  let current = 0;
  let opener = null;

  function render(i, keepScroll) {
    current = (i + projects.length) % projects.length;
    const p = projects[current];
    const title = field(p, "title");
    $("[data-v-index]").textContent = `${pad(current + 1)} / ${pad(projects.length)} — ${t("cat." + p.category)}`;
    $("[data-v-title]").textContent = title;
    $("[data-v-desc]").textContent = field(p, "description");
    $("[data-v-link]").href = p.url;
    $("[data-v-meta]").innerHTML = `
      <div><dt>${esc(t("viewer.discipline"))}</dt><dd>${esc(field(p, "discipline"))}</dd></div>
      <div><dt>${esc(t("viewer.deliverables"))}</dt><dd>${field(p, "deliverables").map(esc).join(" · ")}</dd></div>
      <div><dt>${esc(t("viewer.year"))}</dt><dd>${p.year}</dd></div>
      <div><dt>${esc(t("viewer.palette"))}</dt><dd class="swatches">${p.palette.map((c) => `<i style="background:${c}" title="${c}"></i>`).join("")}</dd></div>`;
    $("[data-v-media]").innerHTML = p.images.map((src, n) =>
      `<img src="${src}" alt="${esc(title)} — ${esc(t("viewer.board"))} ${n + 1}" decoding="async">`).join("");
    if (!keepScroll) body.scrollTop = 0;
  }

  function open(i, from) {
    opener = from || null;
    render(i);
    viewer.showModal();
    document.body.classList.add("is-locked");
  }

  viewer.addEventListener("close", () => {
    document.body.classList.remove("is-locked");
    if (opener && opener.isConnected) opener.focus();
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open]");
    if (btn) open(Number(btn.dataset.open), btn);
  });
  $("[data-v-close]").addEventListener("click", () => viewer.close());
  $("[data-v-prev]").addEventListener("click", () => render(current - 1));
  $("[data-v-next]").addEventListener("click", () => render(current + 1));
  viewer.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") render(current - 1);
    if (e.key === "ArrowRight") render(current + 1);
  });

  /* ── Header + mobile menu ──────────────────────────────── */
  const header = $("[data-header]");
  const hero = $(".hero");
  const nav = $("[data-nav]");
  const menu = $("[data-menu]");

  new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-solid", !entry.isIntersecting);
  }, { rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10) || 68}px 0px 0px 0px` })
    .observe(hero);

  function setMenu(openState) {
    nav.classList.toggle("is-open", openState);
    menu.setAttribute("aria-expanded", String(openState));
    menu.setAttribute("aria-label", t(openState ? "menu.close" : "menu.open"));
  }
  menu.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ── Language toggle ───────────────────────────────────── */
  const langBtn = $("[data-lang-toggle]");
  function syncLangButton() {
    $$("[data-lang]", langBtn).forEach((el) => {
      el.classList.toggle("is-active", el.dataset.lang === i18n.lang);
    });
  }
  langBtn.addEventListener("click", () => i18n.toggle());

  i18n.onChange(() => {
    syncLangButton();
    renderMarquee();
    renderGrid(false);
    setMenu(nav.classList.contains("is-open"));
    if (viewer.open) render(current, true);
  });

  /* ── First paint ───────────────────────────────────────── */
  i18n.apply();
  syncLangButton();
  renderMarquee();
  renderGrid(true);
  setMenu(false);

  /* ── Reveal on scroll ──────────────────────────────────── */
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        reveal.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$("[data-reveal]").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    reveal.observe(el);
  });

  $("[data-year]").textContent = new Date().getFullYear();
})();
