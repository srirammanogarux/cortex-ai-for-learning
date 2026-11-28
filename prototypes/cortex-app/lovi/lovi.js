// Cortex × Lovi: a type, component and spacing exploration (lovi/index.html only; the shared modules stay untouched).
// Colours are exactly Living Matter's: ../living/theme.js warms everything and ../living/theme.css sets the tokens.
// Loaded after core/bus.js and before the modules. This file:
//   1. loads the body font (the Geist file that keeps its stylistic sets ss01 ss02 ss06) as "Lovi Text";
//   2. lets Cortex host onboarding, Lovi-style: big on the welcome, then docked at the left edge beside each
//      question bubble, reacting once per answer, and "building" at the build step;
//   3. adds thin line icons and descriptor lines to option cards, and arrows to suggestion chips;
//   4. adds the round floating Cortex button over the tab bar on Learn and Profile (it opens Ask);
//   5. adds a side-panel toggle for the mascot: Particle or Line.
(function () {
  'use strict';
  window.THEME_VARIANT = 'lovi';
  const P = new URLSearchParams(location.search);
  const STILL = P.has('still') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---------- 1. Fonts ----------
  // Google's Geist build strips the stylistic sets, so the variable file comes from the geist npm package.
  // "Figtree" is aliased to the same file: living/theme.js rewrites every JS-set Geist (canvas labels) to Figtree,
  // so in this build those labels land on Geist too. The display face is set in theme.css (--lovi-display).
  const BODY_SRC = 'url(https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/Geist-Variable.woff2) format("woff2")';
  if (window.FontFace && document.fonts) {
    ['Lovi Text', 'Figtree'].forEach((fam) => {
      const f = new FontFace(fam, BODY_SRC, { weight: '100 900', style: 'normal', display: 'swap' });
      document.fonts.add(f); f.load().catch(() => {});
    });
  }
  // The "?" particle shape, in the display face
  if (window.Brain) {
    const q = () => Brain.defineIcon('qmark', (x, S) => { x.font = `480 ${S * 0.92}px "Hanken Grotesk", ui-sans-serif, system-ui`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', S / 2, S * 0.56); }, { scale: 0.92 });
    q(); if (document.fonts) document.fonts.load('480 200px "Hanken Grotesk"').then(q).catch(() => {});
  }

  // ---------- Thin line icons (24 grid, 1.5 stroke), Lovi's option-card style ----------
  const I = {
    work: '<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17"/>',
    cap: '<path d="M2.5 9.5 12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5V16c1.5 1.6 3.3 2.4 5.5 2.4s4-.8 5.5-2.4v-4.5M21.5 9.5v5"/>',
    route: '<path d="M4 19c4 0 4-7 8-7s4-7 8-7"/><path d="M15.5 5H20v4.5"/><circle cx="4" cy="19" r="1.2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    seed: '<path d="M12 20.5V12"/><path d="M12 12c0-3.5-2.5-6-7-6 0 4 2.5 6 7 6zM12 14c0-3 2-5.5 6.5-5.5 0 3.5-2.5 5.5-6.5 5.5z"/>',
    spark: '<path d="M12 3.5c.6 4.4 2.5 6.3 7 7-4.5.7-6.4 2.6-7 7-.6-4.4-2.5-6.3-7-7 4.5-.7 6.4-2.6 7-7z"/>',
    book: '<path d="M4 5.5c2.8-1 5.5-.8 8 1 2.5-1.8 5.2-2 8-1V19c-2.8-1-5.5-.8-8 1-2.5-1.8-5.2-2-8-1z"/><path d="M12 6.5V20"/>',
    peak: '<path d="M2.5 19.5 9 9l3.5 5.5L15 11l6.5 8.5z"/>',
    pen: '<path d="M4.5 19.5l1-4L16 5l3 3L8.5 18.5z"/><path d="M14 7l3 3"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".9"/>',
    talk: '<path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4 3.5v-3.5a2 2 0 0 1-1.5-2z"/>',
    bulb: '<path d="M9.5 17.5h5M10.5 20.5h3"/><path d="M12 3.5a5.5 5.5 0 0 0-3.2 10c.7.5 1.2 1.3 1.2 2.2v.3h4v-.3c0-.9.5-1.7 1.2-2.2A5.5 5.5 0 0 0 12 3.5z"/>',
    chart: '<path d="M4 19.5h16M7 16v-4M12 16V8M17 16v-7"/>',
    code: '<path d="M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.5 6l-3 12"/>',
    heart: '<path d="M12 19.5s-7.5-4.6-7.5-10A4 4 0 0 1 12 7a4 4 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z"/>',
    palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.9 1.4-1.9-.5-1.2.3-2.6 1.6-2.6h1.8a3.7 3.7 0 0 0 3.7-3.7C20.5 7.4 16.7 3.5 12 3.5z"/><circle cx="8" cy="11" r=".9"/><circle cx="11" cy="7.5" r=".9"/><circle cx="15.5" cy="8.5" r=".9"/>',
    board: '<rect x="3.5" y="4.5" width="17" height="11" rx="1.5"/><path d="M12 15.5v4M8.5 20.5l3.5-1 3.5 1"/>',
    dots: '<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>',
    arrow: '<path d="M7.5 16.5l9-9M9.5 7.5h7v7"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    flag: '<path d="M5.5 20.5v-16M5.5 4.5h11l-2 4 2 4h-11"/>',
  };
  const svg = (n, s = 24, w = 1.5) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || I.dots}</svg>`;
  window.LoviIcon = svg;
  const OPT_ICON = { work: 'work', exam: 'cap', career: 'route', life: 'sun', new: 'seed', bit: 'spark', basics: 'book', deep: 'peak', other: 'pen' };
  const GOAL_ICONS = ['target', 'talk', 'bulb', 'chart', 'flag', 'spark'];
  const CHIP_ICON = { student: 'cap', tech: 'code', business: 'chart', health: 'heart', creative: 'palette', teaching: 'board', other: 'dots' };
  // Lovi's cards carry a grey descriptor line. Only these answers lack one.
  const OPT_SUB = { work: 'Get better at what I do', exam: 'Pass a test or keep up in class', career: 'Move into a new field', life: 'Because I’m curious' };

  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const later = (fn, ms) => setTimeout(fn, STILL ? Math.min(ms, 30) : ms);

  // ---------- 2. Cortex hosts onboarding ----------
  const STEP = { TRAILER: 0, WELCOME: 1, BUILD: 8 };
  const PEARL = 200;                     // the host's full size (welcome); docked it scales down
  const DOCK_S = 0.38, DOCK_X = 28;      // docked: a 76px pearl whose centre sits 28px in from the screen edge
  let host = null, pearl = null, ms = null, say = null, stepNow = -1, idleT = 0;
  function obRoot() { return $('#onboardingLayer .ob'); }
  function ensureHost() {
    const root = obRoot(); if (!root) return null;
    if (host && host.parentNode === root) return host;
    host = el('div', 'lv-host');
    host.setAttribute('aria-hidden', 'true');
    pearl = el('div', 'lv-pearl');
    const m = el('div', 'lv-ms');
    pearl.appendChild(m); host.appendChild(pearl);
    say = el('p', 'lv-say');
    root.appendChild(host); root.appendChild(say);
    if (window.Mascot) ms = Mascot.create(m, { size: 168, state: 'hello', decorative: true });
    // One reaction per answer
    root.addEventListener('click', (e) => {
      const b = e.target.closest('.ob-pane [role="radio"]'); if (!b || !ms) return;
      react(b.getAttribute('aria-checked') === 'true' ? 'happy' : 'happy');
    });
    root.addEventListener('input', (e) => {
      if (!ms || !e.target.matches('.ob-pane input')) return;
      if (ms.state !== 'listening') ms.setState('listening');
      clearTimeout(idleT); idleT = later(() => { if (ms) ms.setState('idle'); }, 1400);
    });
    return host;
  }
  function react(state) {
    if (!ms) return;
    ms.setState(state, { restart: true });
    pearl.classList.remove('lv-hop'); void pearl.offsetWidth; pearl.classList.add('lv-hop');
    clearTimeout(idleT); idleT = later(() => { if (ms && stepNow !== STEP.BUILD) ms.setState('idle'); }, 1500);
  }
  function placeHost(cx, cy, s, o = {}) {
    host.classList.toggle('lv-snap', !!o.snap);
    host.style.transform = `translate(${cx - PEARL / 2}px, ${cy - PEARL / 2}px) scale(${s})`;
    host.style.opacity = o.hidden ? '0' : '1';
  }
  function setSay(text, cy) {
    if (!text) { say.classList.remove('is-on'); return; }
    say.textContent = text; say.style.top = (cy - 26) + 'px'; say.classList.add('is-on');
  }
  // Where the question bubble's centre is, in screen px (the pane animates in, so read offsets, not rects)
  function bubbleY(root) {
    const pane = $('.ob-pane', root), head = pane && $('.ob-head', pane);
    if (!head) return 170;
    return pane.offsetTop + head.offsetTop + head.offsetHeight / 2;
  }
  function onStep(i) {
    const root = obRoot(); if (!root || !ensureHost()) return;
    const prev = stepNow; stepNow = i;
    for (let k = 0; k <= 8; k++) root.classList.toggle('lv-s' + k, k === i);
    const q = i > STEP.WELCOME && i < STEP.BUILD;
    root.classList.toggle('lv-q', q);
    root.classList.toggle('lv-hosted', i >= STEP.WELCOME);
    decorate(root, i);
    if (i === STEP.TRAILER) { placeHost(184, 300, 1, { hidden: true, snap: true }); setSay(''); return; }
    if (i === STEP.WELCOME) {
      placeHost(184, 292, 1, { snap: prev < STEP.WELCOME });
      setSay('');
      if (ms) { ms.setState('hello', { restart: true }); clearTimeout(idleT); idleT = later(() => ms && stepNow === STEP.WELCOME && ms.setState('idle'), 2600); }
      return;
    }
    if (q) {
      const y = bubbleY(root);
      placeHost(DOCK_X, y, DOCK_S, { snap: prev > STEP.WELCOME && prev < STEP.BUILD ? false : false });
      setSay('');
      if (ms && prev !== i) { ms.setState(prev === STEP.WELCOME ? 'curious' : 'idle', { restart: true }); clearTimeout(idleT); idleT = later(() => ms && stepNow === i && ms.setState('idle'), 1400); }
      // The heading can reflow once the display font lands: settle the dock again
      later(() => { if (stepNow === i) placeHost(DOCK_X, bubbleY(root), DOCK_S); }, 420);
      return;
    }
    if (i === STEP.BUILD) {
      const y = 158;
      placeHost(DOCK_X, y, DOCK_S);
      setSay('One moment. I’m shaping it around you.', y);
      if (ms) ms.setState('building', { restart: true });
    }
  }
  function decorate(root, i) {
    const pane = $('.ob-pane', root); if (!pane) return;
    if (i === STEP.WELCOME) {
      const t = $('.ob-title', pane), l = $('.ob-lede', pane);
      if (t) t.textContent = 'Hi, I’m Cortex';
      if (l) l.textContent = 'Tell me what you want to learn, and I’ll build the course around you.';
    }
    let g = 0;
    pane.querySelectorAll('.ob-opt').forEach((b) => {
      if (b.querySelector('.lv-oic')) return;
      const v = b.dataset.v, name = OPT_ICON[v] || GOAL_ICONS[g++ % GOAL_ICONS.length];
      b.insertAdjacentHTML('afterbegin', `<span class="lv-oic">${svg(name, 26, 1.4)}</span>`);
      const ot = b.querySelector('.ob-ot');
      if (ot && !ot.querySelector('small') && OPT_SUB[v]) ot.insertAdjacentHTML('beforeend', `<small>${OPT_SUB[v]}</small>`);
    });
    pane.querySelectorAll('.ob-chip').forEach((b) => {
      const n = CHIP_ICON[b.dataset.v]; if (!n || b.querySelector('.lv-cic') || b.closest('.ob-row')) return;
      b.insertAdjacentHTML('afterbegin', `<span class="lv-cic">${svg(n, 18, 1.5)}</span>`);
    });
    pane.querySelectorAll('.ob-sug').forEach((b) => {
      if (b.querySelector('.lv-arr')) return;
      b.innerHTML = `<span class="lv-sug-t">${b.innerHTML}</span><span class="lv-arr">${svg('arrow', 16, 1.6)}</span>`;
    });
  }
  Bus.on('onboarding:step', ({ index }) => onStep(index));

  // ---------- 4. The floating Cortex button (Learn, Profile) ----------
  let fab = null, fabMs = null, onTab = null;
  function ensureFab() {
    if (fab) return fab;
    const scr = $('#screen'); if (!scr) return null;
    fab = el('button', 'lv-fab'); fab.type = 'button'; fab.setAttribute('aria-label', 'Ask Cortex');
    const m = el('span', 'lv-fab-ms'); fab.appendChild(m); scr.appendChild(fab);
    if (window.Mascot) fabMs = Mascot.create(m, { size: 46, state: 'idle', decorative: true });
    fab.addEventListener('click', () => {
      if (fabMs) fabMs.setState('hello', { restart: true });
      setTimeout(() => { if (window.App) App.showTab('ask'); }, STILL ? 0 : 160);
    });
    // Full-screen moments (a lesson) hide the tab bar; the button goes with it
    const bar = $('#tabbar');
    if (bar) new MutationObserver(syncFab).observe(bar, { attributes: true, attributeFilter: ['class'] });
    return fab;
  }
  function syncFab() {
    if (!ensureFab()) return;
    const bar = $('#tabbar'), barOn = bar && !bar.classList.contains('hide');
    fab.classList.toggle('is-on', !!barOn && (onTab === 'learn' || onTab === 'profile'));
  }
  Bus.on('route', (r) => { onTab = r.screen === 'tab' ? r.tab : null; syncFab(); });

  // ---------- 5. Side panel: the mascot direction ----------
  function renderPanel() {
    const box = $('#lvPanel'); if (!box || !window.Store) return;
    const v = Store.get().variants.mascot === 'A' ? 'A' : 'F';
    box.innerHTML = `<h3>Mascot</h3><div class="seg" role="group" aria-label="Mascot">${[['F', 'Particle'], ['A', 'Line']].map(([k, l]) => `<button data-lv-ms="${k}" aria-pressed="${v === k}">${l}</button>`).join('')}</div>
      <p class="seg-note">Cortex hosts onboarding, floats over Learn and Profile, and explains in Ask.</p>`;
    box.querySelectorAll('[data-lv-ms]').forEach((b) => b.addEventListener('click', () => { Store.variant('mascot', b.dataset.lvMs); }));
  }
  Bus.on('variant:change', ({ key, value }) => {
    if (key !== 'mascot') return;
    renderPanel();
    document.querySelectorAll('#variants [data-v^="mascot:"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === 'mascot:' + value)));
  });

  // Thin line icons in the tab bar (the shell's buttons and their listeners stay; only the drawing changes)
  const TAB_ICON = {
    learn: '<circle cx="6" cy="5" r="1.8"/><circle cx="18" cy="12" r="1.8"/><circle cx="6" cy="19" r="1.8"/><path d="M7.8 5.4c5 1 8.4 2.6 8.4 4.9M16.2 13.7c0 2.3-3.4 3.9-8.4 4.9"/>',
    ask: '<path d="M12 3c.7 4.6 2.6 6.6 8.5 9-5.9 2.4-7.8 4.4-8.5 9-.7-4.6-2.6-6.6-8.5-9 5.9-2.4 7.8-4.4 8.5-9z"/>',
    profile: '<circle cx="12" cy="12" r="2.6"/><circle cx="4.8" cy="6.5" r="1.7"/><circle cx="19.2" cy="6.5" r="1.7"/><circle cx="5.2" cy="18" r="1.7"/><circle cx="18.8" cy="17.6" r="1.7"/><path d="M6.2 7.5l3.7 2.8M17.8 7.5l-3.7 2.8M6.6 16.9l3.4-2.9M17.4 16.6l-3.3-2.6"/>',
  };
  function tabIcons() {
    document.querySelectorAll('#tabbar [data-tab]').forEach((b) => {
      const s = b.querySelector('svg'), d = TAB_ICON[b.dataset.tab]; if (!s || !d || s.dataset.lv) return;
      s.outerHTML = `<svg data-lv="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    });
  }

  function boot() { tabIcons(); renderPanel(); syncFab(); const r = obRoot(); if (r && window.Onboarding && App.current && App.current() === 'onboarding') onStep(Onboarding.index()); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
