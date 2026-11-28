// Cortex streak · v2 painted styles. Registers into window.Streak (load after streak/streak.js, with streak/v2.css).
//
//   Streak.flame(el, { style: 'ember' | 'jar' | 'sun' | 'ink' | 'numeral' | 'candle', days, state, heat, size })
//   Streak.chip / widget / moment take the same style keys. Streak.STYLES2 lists them with their notes.
//
// No cells, no particles. Each style is a small gouache still life in the OrbGlyphs language:
// layered SVG shapes, the same paint (rim light, shade, grain, wobble) and wash filters.
// How it stays fast: every painted, filtered layer is its own self-contained SVG (with its own filter defs)
// placed as an <image>, so it is rasterised once. Per frame only cheap, unfiltered things change:
// glows, ink strokes, fireflies, transforms and opacity. One shared rAF; ≤ 80px instances run at 30fps.
// `.still` on <html> (or ?still, or prefers-reduced-motion) renders final poses only.
(function () {
  'use strict';
  const S = window.Streak;
  if (!S || !S.register) { console.error('styles-v2.js: load streak/streak.js first'); return; }
  if (S.STYLES2) return; // already loaded
  const HTML = document.documentElement;
  const RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const isStill = S.isStill;
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const easeInOut = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const backOut = (t) => { t = clamp(t); const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const now = () => performance.now();
  const f1 = (v) => Math.round(v * 10) / 10;
  const f2 = (v) => Math.round(v * 100) / 100;
  function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ───────── The six directions ─────────
  const STYLES2 = [
    { key: 'ember', id: 'A', name: 'Painted ember', verb: 'glows',
      note: 'A coal painted in gouache. The brand colour is literally Ember. Heat is how hot it glows, from deep red to a saffron-white core.',
      medium: 'Gouache stone, light from inside', tiers: 'Veins crack open at 7 · a small hearth at 30 · a ring of embers at 100 · a warm halo at 365',
      distinct: 'There is no flame shape at all. Heat is light inside a stone, so it can never read as Duolingo’s cartoon flame or Snapchat’s fire emoji.' },
    { key: 'jar', id: 'B', name: 'Firefly jar', verb: 'fills',
      note: 'A painted glass jar. Each lit day adds one firefly. They sleep at the bottom until you show up, and fly out to wait when you’re away.',
      medium: 'Gouache glass, living light', tiers: 'Up to 6 fireflies · a lantern at 7 · a string of three lanterns at 30 · five at 100 · a lit string with a glow at 365',
      distinct: 'It collects light instead of burning. The count is literal for the first week, which no fire icon can do.' },
    { key: 'sun', id: 'C', name: 'Rising sun', verb: 'rises',
      note: 'A saffron sun over a small painted hill. The streak raises it a little higher. Through the day it sinks, and at 6 PM it starts to set.',
      medium: 'Gouache landscape roundel', tiers: 'Painted rays at 7 · a halo at 30 · a corona at 100 · full corona at the top of the sky at 365',
      distinct: 'Time of day is built into the metaphor: a setting sun says “at risk” without a timer. No streak app uses the sky.' },
    { key: 'ink', id: 'D', name: 'Ink shell', verb: 'draws',
      note: 'One ember ink line, the app’s line language. Each day adds a chamber to a spiral shell, so you can count the days in the drawing.',
      medium: 'Ember ink line with a gouache wash', tiers: 'A first loop at 7 · the shell closes at 30 · it is inked and striped at 100 · an ensō circle closes around it at 365',
      distinct: 'The streak is a drawing you make, not a fire you feed. It grows by addition, like learning, and keeps every day visible.' },
    { key: 'numeral', id: 'E', name: 'Lit numeral', verb: 'is lit',
      note: 'The number itself, in Fraunces, is the flame. Heat glows inside the numerals like warm metal. Purely typographic.',
      medium: 'Painted Fraunces numerals', tiers: 'A halo at 7 · laurel sprigs at 30 · a laurel wreath at 100 · a wreath with a star at 365',
      distinct: 'No icon at all. It owns the brand’s display type, so it looks like Cortex and nothing else.' },
    { key: 'candle', id: 'F', name: 'Painted candle', verb: 'burns',
      note: 'The control: the closest to a flame. A gouache candle that burns lower but brighter as the streak grows.',
      medium: 'Gouache wax, small soft flame', tiers: 'A second candle at 7 · three at 30 · a candelabra at 100 · five arms at 365',
      distinct: 'The flame is small and the object carries it: wax, wick and dish, painted. It is a still life, not a cartoon flame with a face.' },
  ];
  const KEYS2 = STYLES2.map((s) => s.key);
  const LIGHT_GROUND = { sun: 1, ink: 1, numeral: 1 }; // their full-screen moments sit on paper, not night

  // What each style looks like in each state, in plain words (for the lab).
  const READS2 = {
    ember: { unlit: 'Deep red stone, the glow fading through the day. Never grey.', lit: 'Saffron-white core, glowing veins, a warm halo.', risk: 'Dark stone. One seam still glows and pulses.', frozen: 'Frost on the stone, a pale blue cast.', broken: 'A small new ember, warm, ready to light.', winback: 'Banked under ash. Glints of heat wait underneath.', repaired: 'Lit, with a gold seam where it was mended.', born: 'A small fresh ember with two sparks.', milestone: 'Brighter, with heat shimmer rising.' },
    jar: { unlit: 'Fireflies asleep at the bottom, dimming as the day goes.', lit: 'Fireflies awake and glowing, the jar filled with light.', risk: 'Nearly dark. One firefly blinks slowly.', frozen: 'Frosted glass, fireflies still and pale.', broken: 'An empty jar, lid off, one firefly arriving.', winback: 'Your fireflies hover outside, waiting to come back.', repaired: 'Lit, with a gold mend on the glass.', born: 'One firefly in a fresh jar.', milestone: 'The jar glows as a lantern, with rays.' },
    sun: { unlit: 'The sun sinks and pales as the day goes on.', lit: 'High saffron sun with a warm glow.', risk: 'Setting: half below the hill, in a red sky.', frozen: 'A pale winter sun over a snowy hill.', broken: 'Dawn: the first rim of a new sun.', winback: 'Twilight. A dashed sun marks where it was.', repaired: 'Up again, inside a dashed ring.', born: 'A new sun just risen, with sparks.', milestone: 'Rays, halo and a flare.' },
    ink: { unlit: 'Dry ink, and a dotted guide for today’s chamber.', lit: 'Today’s chamber in fresh, wet ember ink.', risk: 'The latest stroke fades in and out.', frozen: 'The line turns frost blue, ice on the newest stroke.', broken: 'A single drop of ink: the pen is down.', winback: 'The shell waits as a dotted line, the pen at its tip.', repaired: 'The missing strokes mended in gold.', born: 'A first fresh curl, with sparks.', milestone: 'A painted wash fills the shell.' },
    numeral: { unlit: 'Dark ember numerals, the glow fading through the day.', lit: 'Saffron light glowing inside the number.', risk: 'The glow drains down and out of the number.', frozen: 'Frosted numerals with a rime edge.', broken: 'A dotted 1 with a spark: day 1 is ready.', winback: 'Your number as a dashed outline, waiting.', repaired: 'Lit, with a gold seam through it.', born: 'A freshly lit 1 with sparks.', milestone: 'Halo and laurels, extra glow.' },
    candle: { unlit: 'A low, dim flame, smaller through the day.', lit: 'A bright flame and a warm glow.', risk: 'A tiny guttering flame.', frozen: 'A still, ice-blue flame and frost on the wax.', broken: 'A fresh tall candle, a spark at the wick.', winback: 'Just blown out: a thread of smoke, the wick still warm.', repaired: 'Lit, with a gold band on the candle.', born: 'A new candle with a small new flame.', milestone: 'Taller flames and a halo.' },
  };

  // ───────── Painted layers: self-contained SVGs, rasterised once ─────────
  // The OrbGlyphs paint filter, rescaled from its 48 box to this 100 box. Each document carries its own defs.
  const paintF = (id, shade, sa, lite, la, wob, sp = 1.7, bl = 0.45) => `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="ab"/>
<feOffset in="ab" dx="-2.8" dy="-3.6" result="ul"/><feComposite in="SourceAlpha" in2="ul" operator="out" result="rimBR"/>
<feFlood flood-color="${shade}" flood-opacity="${sa}"/><feComposite in2="rimBR" operator="in" result="shade"/>
<feOffset in="ab" dx="2.8" dy="3.6" result="dr"/><feComposite in="SourceAlpha" in2="dr" operator="out" result="rimUL"/>
<feFlood flood-color="${lite}" flood-opacity="${la}"/><feComposite in2="rimUL" operator="in" result="lite"/>
<feTurbulence type="fractalNoise" baseFrequency=".42" numOctaves="2" seed="9" result="n2"/>
<feColorMatrix in="n2" type="matrix" values="0 0 0 0 .2  0 0 0 0 .1  0 0 0 0 .05  ${sp} 0 0 0 ${f2(-0.62 * sp - 0.2)}" result="speck"/>
<feComposite in="speck" in2="SourceAlpha" operator="in" result="speckIn"/>
<feMerge result="m"><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="lite"/><feMergeNode in="speckIn"/></feMerge>
<feTurbulence type="fractalNoise" baseFrequency=".065" numOctaves="2" seed="4" result="n1"/>
<feDisplacementMap in="m" in2="n1" scale="${wob}" xChannelSelector="R" yChannelSelector="G" result="wob"/>
<feGaussianBlur in="wob" stdDeviation="${bl}"/></filter>`;
  const PDEFS = paintF('p', '#3A1608', 0.32, '#FFF6E6', 0.5, 4) + paintF('pc', '#24465E', 0.3, '#FFFFFF', 0.7, 4) + paintF('pg', '#3A1608', 0.16, '#FFF6E6', 0.35, 2.4, 1.1) +
    `<filter id="w" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.3"/></filter>
<filter id="ws" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".9"/></filter>
<filter id="gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .36  0 0 0 0 .2  0 0 0 0 .1  2.2 0 0 0 -1.32" result="g"/><feComposite in="g" in2="SourceAlpha" operator="in"/></filter>`;
  const URLS = new Map();
  function durl(inner, defs) {
    const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs>${PDEFS}${defs || ''}</defs>${inner}</svg>`;
    let u = URLS.get(s);
    if (!u) { u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); if (URLS.size > 900) URLS.clear(); URLS.set(s, u); }
    return u;
  }
  const IMG = (n, inner, defs, attrs) => `<image${n ? ` data-n="${n}"` : ''} href="${durl(inner, defs)}" x="0" y="0" width="100" height="100" preserveAspectRatio="none"${attrs ? ' ' + attrs : ''}/>`;
  const rg = (id, stops, cx = 0.5, cy = 0.5, r = 0.5, fx, fy) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;

  // ───────── Geometry ─────────
  function smooth(p, closed) {
    const n = p.length; if (n < 2) return '';
    const P = (i) => (closed ? p[(i + n) % n] : p[clamp(i, 0, n - 1)]);
    let d = `M${f1(p[0][0])} ${f1(p[0][1])}`;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
    }
    return closed ? d + 'Z' : d;
  }
  function blob(cx, cy, rx, ry, seed, amt = 0.08, n = 9, flat = 1) {
    const R = mulberry(seed), pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.3, k = 1 + (R() * 2 - 1) * amt; let y = Math.sin(a) * ry * k; if (y > 0) y *= flat; pts.push([cx + Math.cos(a) * rx * k, cy + y]); }
    return smooth(pts, true);
  }
  const star4 = (x, y, r) => `M${f1(x)} ${f1(y - r)}Q${f1(x)} ${f1(y)} ${f1(x + r)} ${f1(y)}Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y + r)}Q${f1(x)} ${f1(y)} ${f1(x - r)} ${f1(y)}Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y - r)}Z`;
  const circ = (cx, cy, r) => `M${f1(cx - r)} ${f1(cy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`;
  const at = (x, y, s, ax = 50, ay = 50) => `translate(${f2(x)} ${f2(y)}) scale(${f2(s)}) translate(${-ax} ${-ay})`;
  // tapered brush rays around (cx, cy)
  function rayPath(cx, cy, r1, r2, n, w, a0 = 0, alt = 0) {
    let d = '';
    for (let k = 0; k < n; k++) {
      const a = a0 + k / n * TAU, L = alt && k % 2 ? r1 + (r2 - r1) * 0.62 : r2, c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
      const x1 = cx + c * r1, y1 = cy + s * r1, x2 = cx + c * L, y2 = cy + s * L;
      d += `M${f1(x1 + px * w)} ${f1(y1 + py * w)}L${f1(x2)} ${f1(y2)}L${f1(x1 - px * w)} ${f1(y1 - py * w)}Z`;
    }
    return d;
  }

  // ───────── Colour ─────────
  const C = {
    shell: '#FFF8F1', cream: '#FBEEDC', bone: '#F3E3CF', humus: '#3E2317', bark: '#6A4636', ink: '#2B1A12',
    ember: '#B83A1C', ember7: '#9A2F15', ember9: '#5A1D0C', coral: '#F07B5A', saffron: '#EFB43E', gold: '#D9A53A', goldHi: '#FFE7A8',
    frost: '#3F7CA6', frostL: '#E4EFF5', frostM: '#BFD9E8',
  };
  // live gradients every live SVG carries (ids prefixed per instance)
  const LIVE_GRADS = (k) => rg(k + 'gw', [[0, '#FFC867', 0.9], [0.42, '#F59A4A', 0.42], [1, '#F07B5A', 0]]) +
    rg(k + 'gc', [[0, '#FFF8E6', 1], [0.32, '#FFD98A', 0.9], [0.7, '#FFB347', 0.25], [1, '#FFB347', 0]]) +
    rg(k + 'gf', [[0, '#E8F2F8', 0.95], [0.5, '#BFD9E8', 0.45], [1, '#BFD9E8', 0]]) +
    rg(k + 'gr', [[0, '#F07B5A', 0.75], [0.5, '#D9553A', 0.3], [1, '#B83A1C', 0]]);

  // ───────── Instances ─────────
  const LIVE = new Set(); let raf = 0, frameN = 0, seq = 0;
  function tick(ts) { raf = 0; frameN++; LIVE.forEach((I) => { try { I.frame(ts); } catch (e) { console.error('Streak v2', e); I.destroy(); } }); ensure(); }
  function ensure() { if (!raf && LIVE.size) raf = requestAnimationFrame(tick); }
  const IO = window.IntersectionObserver ? new IntersectionObserver((es) => es.forEach((e) => { const I = e.target._sk2; if (I) { I.visible = e.isIntersecting; I.dirty = true; } }), { rootMargin: '80px' }) : null;
  if (RM.addEventListener) RM.addEventListener('change', () => LIVE.forEach((I) => { I.dirty = true; }));
  if (window.MutationObserver) new MutationObserver(() => LIVE.forEach((I) => { I.dirty = true; })).observe(HTML, { attributes: true, attributeFilter: ['class'] });
  const tg = (o) => Object.assign(S.targets(o), { days: Math.max(0, Math.round(+o.days || 0)) });
  const keyOf = (s) => (KEYS2.includes(s) ? s : 'ember');
  const ENV = S.envAt;

  // Set an attribute only when it changes (cheap per-frame updates)
  function O(n, v) {
    if (!n) return; v = v < 0.006 ? 0 : v > 0.995 ? 1 : Math.round(v * 400) / 400;
    if (n._o === v) return; n._o = v;
    n.setAttribute('opacity', v); const vis = v > 0 ? 'visible' : 'hidden';
    if (n._v !== vis) { n._v = vis; n.setAttribute('visibility', vis); }
  }
  function A(n, k, v) { if (!n) return; const c = n._a || (n._a = {}); if (c[k] === v) return; c[k] = v; n.setAttribute(k, v); }
  const TF = (n, v) => A(n, 'transform', v);

  class V2 {
    constructor(el, o) {
      this.el = el; this.id = ++seq; this.k = `k${this.id}-`;
      this.o = Object.assign({ style: 'ember', days: 4, state: 'lit', heat: 1, size: 0, dark: false }, o || {});
      this.size = Math.round(this.o.size || el.getBoundingClientRect().width || 120);
      this.small = this.size <= 34;
      this.key = keyOf(this.o.style);
      el.classList.add('sk-flame', 'sk2');
      el.style.setProperty('--sk-size', this.size + 'px');
      if (this.o.decorative) el.setAttribute('aria-hidden', 'true'); else el.setAttribute('role', 'img');
      this.box = document.createElement('div'); this.box.className = 'sk2-box'; el.appendChild(this.box);
      this.T = tg(this.o); this.P = Object.assign({}, this.T);
      this.tw = null; this.beat = null; this.env = null; this.boost = 1; this.flareT = -1e9; this.grewAt = -1e9;
      this.visible = true; this.dirty = true; this.last = 0; this.alive = true; this.lost = 0; this.sig = null; this.n = {};
      this.context(); this.label(); this.build();
      el._sk2 = this; if (IO) IO.observe(el); LIVE.add(this); ensure();
      const self = this;
      this.api = {
        el, canvas: null, get svg() { return self.svg; }, get o() { return Object.assign({}, self.o); }, get params() { return Object.assign({}, self.P); },
        set: (p, opt) => { self.set(p, opt); return self.api; }, extend: (opt) => self.extend(opt), snap: () => self.snap(), destroy: () => self.destroy(),
      };
    }
    get dark() { return !!this.o.dark && !LIGHT_GROUND[this.key]; }
    label() { if (!this.o.decorative) this.el.setAttribute('aria-label', this.o.label || `Streak: ${S.copy(this.o.state, this.o).title}. ${S.LABELS[this.o.state] || ''}`); }
    // Tag the chip / widget / moment we live in, so v2.css can adapt it (e.g. the lit numeral replaces the number).
    context() {
      const tag = (root, pre) => { if (!root) return; KEYS2.forEach((k) => root.classList.remove(`${pre}-${k}`)); root.classList.add('sk2-host', `${pre}-${this.key}`); };
      tag(this.el.closest('.sk-chip'), 'sk2-chip');
      tag(this.el.closest('.sk-wd'), 'sk2-wd');
      const mo = this.el.closest('.sk-mo');
      if (mo) { tag(mo, 'sk2-mo'); mo.classList.toggle('sk2-light', !!LIGHT_GROUND[this.key]); }
    }
    set(p, opt) {
      p = p || {}; opt = opt || {};
      const prevDays = this.o.days;
      Object.assign(this.o, p);
      if (p.style != null && KEYS2.includes(p.style) && p.style !== this.key) { this.key = p.style; this.context(); this.sig = null; }
      const T = tg(this.o);
      if (opt.ms && !isStill() && !opt.instant) this.tw = { from: Object.assign({}, this.P), to: T, t0: now(), ms: opt.ms, ease: opt.ease === 'back' ? backOut : easeInOut };
      else { this.tw = null; if (opt.instant || isStill()) Object.assign(this.P, T); }
      this.T = T; this.dirty = true; this.label();
      if (p.days != null && +p.days === (+prevDays || 0) + 1 && !isStill()) this.grewAt = now();
      this.build();
    }
    // The same beat as the cell flames: crouch (250ms) · pop · hang (250ms) · squash on landing · the number rolls on impact.
    extend(opt) {
      opt = opt || {};
      return new Promise((res) => {
        if (this.beat) this.finishBeat();
        const from = Math.round(+this.o.days || 0), to = opt.to != null ? opt.to : from + 1;
        const ignite = opt.ignite != null ? opt.ignite : (from === 0 || this.o.state === 'broken' || this.T.ember > 0.5);
        const state = opt.state || (S.MILESTONES.includes(to) ? 'milestone' : 'lit');
        this.beat = { t0: now(), ignite, to, state, onImpact: opt.onImpact, fired: false, popped: false, res };
        this.dirty = true;
        if (isStill()) this.finishBeat();
      });
    }
    finishBeat() {
      const b = this.beat; if (!b) return;
      this.beat = null; this.env = null; this.boost = 1; this.box.style.transform = '';
      if (!b.fired) { b.fired = true; this.set({ days: b.to, state: b.state }, { instant: true }); if (b.onImpact) b.onImpact(b.to); }
      b.res();
    }
    snap() { if (this.beat) this.finishBeat(); this.tw = null; Object.assign(this.P, this.T); this.grewAt = -1e9; this.flareT = -1e9; this.dirty = true; }

    // Rebuild the SVG only when the structure changes (style, tier, count, size). States morph by opacity.
    build() {
      const st = STY[this.key], sig = this.key + '|' + st.sig(this, this.T) + '|' + this.size + '|' + (this.dark ? 1 : 0);
      if (sig === this.sig) return;
      const old = this.svg, swap = this.sig && this.sig.split('|')[0] === this.key ? (st.swap || 'fade') : 'fade';
      this.sig = sig;
      const k = this.k, out = st.build(this, this.T);
      const anc = st.anchor(this, this.T);
      const wrap = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      wrap.setAttribute('viewBox', (this.small && st.smallView && st.smallView(this.T)) || '0 0 100 100'); wrap.setAttribute('width', this.size); wrap.setAttribute('height', this.size);
      wrap.setAttribute('class', 'sk2-svg'); wrap.setAttribute('aria-hidden', 'true'); wrap.setAttribute('focusable', 'false');
      const spark = this.small ? '' : [[-0.62, -0.5, 0.11], [0.66, -0.7, 0.08], [0.58, 0.22, 0.065]].map(([dx, dy, r], i) =>
        `<path data-n="sp${i}" d="${star4(anc[0] + dx * anc[2], anc[1] + dy * anc[2], r * anc[2] * 1.4)}" fill="${this.dark ? '#FFD98A' : '#E0901C'}" opacity="0"/>`).join('');
      wrap.innerHTML = `<defs>${LIVE_GRADS(k)}${out.defs || ''}</defs>${out.body}` +
        `<circle data-n="flare" cx="${anc[0]}" cy="${anc[1]}" r="10" fill="none" stroke="${this.dark || this.key === 'jar' ? '#FFD98A' : '#F2A54A'}" stroke-width="3" opacity="0"/>${spark}`;
      this.box.appendChild(wrap); this.svg = wrap;
      this.n = {}; wrap.querySelectorAll('[data-n]').forEach((e) => { this.n[e.dataset.n] = e; });
      this.dirty = true;
      if (old) {
        if (isStill() || swap === 'cut') old.remove();
        else {
          old.classList.add(swap === 'roll' ? 'sk2-roll-out' : 'sk2-out'); old.style.pointerEvents = 'none';
          if (swap === 'roll') { wrap.classList.add('sk2-roll-in'); requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove('sk2-roll-in'))); }
          setTimeout(() => old.remove(), 420);
        }
      }
      if (this.last) this.render(this.lastT || 0, 0, isStill());
    }
    frame(ts) {
      if (!this.alive) return;
      if ((frameN & 63) === 0) { if (!this.el.isConnected) { if (++this.lost > 2) { this.destroy(); return; } } else this.lost = 0; }
      const still = isStill();
      const busy = !!(this.beat || this.tw || ts - this.grewAt < 900 || ts - this.flareT < 800);
      if (!this.visible && !this.dirty && !this.beat) return;
      if (still && !this.dirty && !busy) return;
      if (!still && this.size <= 80 && !busy && !this.dirty && ((frameN + this.id) & 1)) return; // small ones: 30fps, staggered
      const dt = this.last ? Math.min(0.1, (ts - this.last) / 1000) : 0.016; this.last = ts; this.dirty = false;
      if (this.beat) {
        const b = this.beat, ms = ts - b.t0;
        if (!b.popped && ms >= 250) {
          b.popped = true; this.flareT = ts;
          if (b.ignite) this.set({ days: b.to, state: b.state }, { ms: 700, ease: 'back' });
        }
        if (!b.fired && ms >= 617) {
          b.fired = true;
          if (!b.ignite) this.set({ days: b.to, state: b.state }, { ms: 650, ease: 'back' });
          if (b.onImpact) b.onImpact(b.to);
        }
        this.env = ENV(ms);
        if (!this.env && b.fired) { this.beat = null; b.res(); }
      } else this.env = null;
      this.boost = this.env ? this.env[2] : 1;
      if (this.tw) {
        const k = clamp((ts - this.tw.t0) / this.tw.ms), e = this.tw.ease(k);
        for (const key in this.P) this.P[key] = lerp(this.tw.from[key], this.tw.to[key], e);
        if (k >= 1) { this.tw = null; Object.assign(this.P, this.T); }
      } else if (still) Object.assign(this.P, this.T);
      else {
        const k = 1 - Math.exp(-dt * 5);
        for (const key in this.P) { const d = this.T[key] - this.P[key]; if (Math.abs(d) > 2e-4) { this.P[key] += d * k; this.dirty = this.dirty || !this.visible; } else this.P[key] = this.T[key]; }
      }
      this.render(ts, still ? 0 : dt, still);
    }
    render(ts, dt, still) {
      this.lastT = ts;
      const t = still ? 0 : ts / 1000, P = this.P;
      const G = {
        t, dt, still, small: this.small, dark: this.dark, boost: this.boost,
        br: still ? 0.6 : 0.5 + 0.5 * Math.sin(t * 1.7),
        beat: still ? 0.4 : Math.pow(Math.max(0, Math.sin(t * 4.2)), 6),
        grow: still ? 1 : clamp((ts - this.grewAt) / 620),
        flare: still ? 1 : clamp((ts - this.flareT) / 640),
      };
      STY[this.key].draw(this, P, G, this.n);
      // shared: pop flare ring, new-streak sparkles
      const n = this.n, fk = G.flare;
      if (n.flare) { if (fk < 1) { A(n.flare, 'r', f1(8 + 40 * easeOut(fk))); A(n.flare, 'stroke-width', f1(3 * (1 - fk) + 0.4)); } O(n.flare, fk < 1 ? 0.5 * (1 - fk) * (1 - fk) : 0); }
      for (let i = 0; i < 3; i++) { const sp = n['sp' + i]; if (sp) O(sp, P.born * (still ? 0.85 : 0.5 + 0.5 * Math.sin(t * 2.6 + i * 1.9))); }
      if (this.env) { const e = this.env, oy = STY[this.key].origin || 88; this.box.style.transformOrigin = `50% ${oy}%`; this.box.style.transform = `scale(${f2(e[0])}, ${f2(e[1])})`; }
      else if (this.box.style.transform) this.box.style.transform = '';
    }
    destroy() {
      if (!this.alive) return; this.alive = false;
      LIVE.delete(this); if (IO) IO.unobserve(this.el);
      if (this.beat) { const b = this.beat; this.beat = null; b.res(); }
      this.box.remove(); this.el.classList.remove('sk-flame', 'sk2'); delete this.el._sk2;
    }
  }

  // Shared derived values: how much warmth, life and light to show.
  function mood(P) {
    const heat = clamp(P.heat, 0, 1.2), fr = clamp(P.frost), gh = clamp(P.ghost), em = clamp(P.ember), lit = clamp(P.lit);
    const warm = (1 - fr) * (1 - gh);
    return { heat, fr, gh, em, lit, warm, glow: lit * Math.min(1, heat) * warm, jit: clamp(P.jitter), ring: clamp(P.ring), cor: clamp(P.corona), born: clamp(P.born), tier: P.tier };
  }
  const tierI = (T) => Math.round(T.tier);

  // ═════════ A · Painted ember ═════════
  // A coal with a crust. The hot skin shows through a face and through veins; heat sets how bright the skin is.
  const STONE = 'M21 68C19 57 29 47 43 45C55 43 68 45 76 52C83 58 82 70 74 76C66 82 52 83 40 81C29 79 22 75 21 68Z';
  const CRACKS = [
    'M27 70C34 67 38 71 45 68C50 66 52 70 57 72',
    'M57 72C62 66 66 64 73 64',
    'M45 68L47 76L44 81',
    'M62 50C61 55 63 58 61 62C60 66 57 68 57 72',
    'M33 56C36 60 40 61 45 68',
  ];
  const EMBER_SCALE = [0.52, 0.92, 1, 0.86, 0.8, 0.84];
  const ember = {
    origin: 84,
    smallView: (T) => (tierI(T) <= 2 ? (tierI(T) === 0 ? '24 50 52 52' : '14 31 72 72') : '4 22 92 92'),
    sig: (I, T) => `${tierI(T)}`,
    anchor: (I, T) => [50, tierI(T) === 0 ? 74 : 60, 34],
    build(I, T) {
      const k = I.k, tier = tierI(T), sm = I.small, dark = I.dark;
      const sc = EMBER_SCALE[tier], cracks = tier <= 1 ? CRACKS.slice(0, 2) : tier === 2 ? CRACKS.slice(0, 4) : CRACKS;
      const cw = sm ? 3.6 : tier <= 1 ? 2.4 : 2.8;
      const face = blob(44, 59, tier <= 1 ? 16 : 13, tier <= 1 ? 9 : 7.5, 17, 0.3, 7);
      const sdef = rg('h', [[0, '#FFF3CF'], [0.24, '#FFC867'], [0.52, '#F28A45'], [0.8, '#C9472B'], [1, '#8E2A12']], 0.44, 0.38, 0.62) +
        rg('c', [[0, '#C9472B'], [0.6, '#7A2410'], [1, '#4A170A']], 0.44, 0.38, 0.62) +
        lg('cr', [[0, '#6E2C17'], [0.55, '#4A1A0C'], [1, '#33110A']], 0.7, 1) +
        `<mask id="m"><rect width="100" height="100" fill="#fff"/><path d="${face}" fill="#000"/><path d="${cracks.join('')}" fill="none" stroke="#000" stroke-width="${cw}" stroke-linecap="round" stroke-linejoin="round"/></mask>`;
      const skinH = IMG('skinH', `<path d="${STONE}" fill="url(#h)" filter="url(#p)"/>`, sdef);
      const skinC = IMG('skinC', `<path d="${STONE}" fill="url(#c)" filter="url(#p)"/>`, sdef);
      const crust = IMG('crust', `<g filter="url(#p)"><path d="${STONE}" fill="url(#cr)" mask="url(#m)"/><path d="M30 60C34 54 40 51 46 50" fill="none" stroke="#7A3A22" stroke-width="1.6" stroke-linecap="round" opacity=".7"/></g>`, sdef);
      const vein = IMG('vein', `<g filter="url(#ws)"><path d="${cracks.join('')}" fill="none" stroke="#F59A4A" stroke-width="${cw + 2.6}" stroke-linecap="round" opacity=".7"/></g><path d="${cracks.join('')}" fill="none" stroke="#FFE29A" stroke-width="${cw * 0.5}" stroke-linecap="round"/><path d="${face}" fill="#FFD98A" opacity=".55" filter="url(#ws)"/>`);
      const ash = IMG('ash', `<g filter="url(#pg)"><path d="M22 64C22 54 31 47 43 45C55 43 68 45 76 52C80 56 81.5 61 80.5 65C76 62 72 66 67 63C62 67 57 63 52 66C47 63 42 67 37 64C32 67 27 63 22 64Z" fill="#DCCDBE"/><path d="M28 57C34 52 42 50 50 50M56 49C62 49 68 51 72 55" fill="none" stroke="#C3B1A1" stroke-width="2" stroke-linecap="round"/></g>`);
      const glint = IMG('glint', `<path d="M33 66.5L38 65M50 67L55 66M64 64.5L69 63.5" fill="none" stroke="#FFB45E" stroke-width="2.2" stroke-linecap="round" filter="url(#ws)"/><path d="M33 66.5L38 65M50 67L55 66M64 64.5L69 63.5" fill="none" stroke="#FFE29A" stroke-width="1" stroke-linecap="round"/>`);
      const frost = IMG('frost', `<path d="${STONE}" fill="#9CC0D8" opacity=".38"/><g filter="url(#pc)"><path d="M22 63C22 54 31 47 43 45C55 43 68 45 76 52C80 56 81.5 60 80.5 63C77 60.5 74 63 70 60.5C66 63.5 62 60 57.5 62.5C53 59.5 48 63 43.5 60.5C39 63.5 34 60 30 62.5C27 60 24.5 63 22 63Z" fill="#EEF5F9"/></g><path d="${star4(36, 52, 4.2)}${star4(63, 49, 3.2)}${star4(51, 55, 2.4)}" fill="#fff"/>`);
      const gold = IMG('gold', `<path d="M40 45.5C43 52 38.5 57 45 62C51 66.5 46.5 73 51.5 81" fill="none" stroke="#A8741E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/><path d="M40 45.5C43 52 38.5 57 45 62C51 66.5 46.5 73 51.5 81" fill="none" stroke="${C.gold}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" filter="url(#pg)"/><path d="M40.6 47C42.6 52 39.6 56.5 45 61" fill="none" stroke="${C.goldHi}" stroke-width=".9" stroke-linecap="round"/>`);
      let back = '', front = '';
      // 30: a hearth (bed of embers and two stones). 100: a ring of embers around the bed. 365: plus a warm halo.
      if (tier >= 5) back += IMG('halo', `<circle cx="50" cy="56" r="40" fill="#FFD27A" opacity=".55" filter="url(#w)"/><circle cx="50" cy="56" r="27" fill="#FFE6B0" opacity=".6" filter="url(#w)"/>`);
      if (tier >= 3) {
        const bed = 'M9 86C12 78 27 74 50 74C73 74 88 78 91 86C80 90.5 20 90.5 9 86Z';
        back += IMG('', `<path d="${bed}" fill="#3A160C" filter="url(#p)"/><path d="M14 82C24 79 36 77.5 50 77.5C64 77.5 76 79 86 82" fill="none" stroke="#6A2A16" stroke-width="2" stroke-linecap="round" opacity=".8"/>`);
        back += IMG('bedH', `<g filter="url(#ws)">${[[18, 82, 4], [28, 79, 3.5], [40, 77.5, 3], [61, 77.5, 3], [72, 79, 3.6], [82, 82, 3.8], [50, 84, 5]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.5}" fill="#F59A4A"/>`).join('')}</g>${[[18, 82, 1.8], [28, 79, 1.5], [72, 79, 1.6], [82, 82, 1.6]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.5}" fill="#FFE29A"/>`).join('')}`);
        if (tier === 3) back += IMG('', `<path d="${blob(14, 79, 10, 7.5, 21, 0.1, 8, 0.8)}" fill="#8E6B57" filter="url(#p)"/><path d="${blob(86, 79, 10, 7.5, 23, 0.1, 8, 0.8)}" fill="#7E5E4C" filter="url(#p)"/>`);
      }
      if (tier >= 4) {
        const pts = []; for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.39; pts.push([50 + Math.cos(a) * 41, 80 + Math.sin(a) * 9, Math.sin(a), i]); }
        const peb = (q, fill) => `<path d="${blob(q[0], q[1], 6.4, 4.6, 40 + q[3], 0.12, 7, 0.8)}" fill="${fill}"/>`;
        const bk = pts.filter((q) => q[2] < 0), fr = pts.filter((q) => q[2] >= 0);
        back += IMG('', `<g filter="url(#p)">${bk.map((q) => peb(q, '#3E160B')).join('')}</g>`) + IMG('rbH', `<g filter="url(#p)">${bk.map((q) => peb(q, '#E8743C')).join('')}</g>${bk.map((q) => `<ellipse cx="${f1(q[0] - 1.4)}" cy="${f1(q[1] - 1)}" rx="2.4" ry="1.4" fill="#FFE29A"/>`).join('')}`);
        front += IMG('', `<g filter="url(#p)">${fr.map((q) => peb(q, '#3E160B')).join('')}</g>`) + IMG('rfH', `<g filter="url(#p)">${fr.map((q) => peb(q, '#E8743C')).join('')}</g>${fr.map((q) => `<ellipse cx="${f1(q[0] - 1.4)}" cy="${f1(q[1] - 1)}" rx="2.4" ry="1.4" fill="#FFE29A"/>`).join('')}`);
      }
      const lift = tier >= 3 ? -5 : 0;
      const shimmer = sm || I.size < 56 ? '' : [0, 1, 2].map((i) => `<path data-n="sh${i}" d="M${42 + i * 8} 44C${38 + i * 8} 38 ${46 + i * 8} 34 ${42 + i * 8} 27C${39 + i * 8} 22 ${44 + i * 8} 18 ${42 + i * 8} 14" fill="none" stroke="${dark ? '#FFB45E' : '#E8743C'}" stroke-width="1.1" stroke-linecap="round" opacity="0"/>`).join('');
      const body = `
        <ellipse data-n="glow" cx="50" cy="${tier === 0 ? 74 : 62}" rx="${tier === 0 ? 30 : 49}" ry="${tier === 0 ? 24 : 40}" fill="url(#${k}gw)" opacity="0"/>
        <ellipse data-n="cglow" cx="50" cy="62" rx="44" ry="36" fill="url(#${k}gf)" opacity="0"/>
        <ellipse cx="50" cy="${tier >= 3 ? 88 : 84}" rx="${tier >= 3 ? 42 : 30 * sc + 4}" ry="${tier >= 3 ? 3.4 : 3.6}" fill="${dark ? '#000' : C.bark}" opacity="${dark ? 0.35 : 0.2}"/>
        ${back}
        <g transform="translate(0 ${lift}) ${at(50, 84, sc, 50, 84)}">
          ${skinC}${skinH}
          <ellipse data-n="core" cx="44" cy="58" rx="16" ry="10" fill="url(#${k}gc)" opacity="0"/>
          ${crust}${vein}${ash}${glint}${frost}${gold}
        </g>
        ${front}${shimmer}`;
      return { body };
    },
    draw(I, P, G, n) {
      const m = mood(P), t = G.t;
      const flick = G.still ? 0 : 0.06 * Math.sin(t * 5.3) * Math.sin(t * 2.1 + 1);
      const hot = clamp((m.lit ? 0.35 + 0.65 * m.heat : 0) * m.lit + (1 - m.lit) * (0.18 + 0.55 * clamp((m.heat - 0.14) / 0.6)) + m.em * 0.4) * (1 - m.fr * 0.85) * (1 - m.gh * 0.85);
      const riskSeam = m.jit * (0.25 + 0.75 * G.beat);
      O(n.skinH, clamp(hot * (1 + flick) - riskSeam * 0.1 + (G.boost - 1) * 0.25));
      O(n.skinC, 1); O(n.crust, 1 - 0.32 * m.glow - 0.12 * (1 - m.lit) * m.warm * clamp(m.heat - 0.3));
      O(n.vein, clamp(Math.max(m.glow * (0.85 + 0.15 * G.br), (1 - m.lit) * m.warm * clamp(m.heat - 0.2) * 0.7, riskSeam, m.em * 0.5) + (G.boost - 1) * 0.3));
      O(n.core, clamp(m.glow * (0.8 + 0.2 * G.br) + (G.boost - 1) * 0.4 + m.em * 0.3 * (0.7 + 0.3 * G.br)));
      O(n.glow, clamp((m.glow * (0.7 + 0.3 * G.br) + m.em * 0.45 * (0.7 + 0.3 * G.br) + m.jit * G.beat * 0.25 + (G.boost - 1) * 0.3) * (I.dark ? 1 : 0.85)));
      O(n.cglow, m.fr * 0.7);
      O(n.ash, m.gh); O(n.glint, m.gh * (0.55 + 0.45 * Math.sin(t * 2.2)));
      O(n.frost, m.fr); O(n.gold, m.ring);
      O(n.halo, m.glow * (0.8 + 0.2 * G.br) + m.cor * 0.3);
      const ringHot = clamp(m.glow * 0.9 + (1 - m.lit) * m.warm * m.heat * 0.5);
      O(n.bedH, ringHot * (0.85 + 0.15 * Math.sin(t * 3.1)));
      O(n.rbH, ringHot * (0.8 + 0.2 * Math.sin(t * 2.3 + 1))); O(n.rfH, ringHot * (0.8 + 0.2 * Math.sin(t * 2.7)));
      const shK = clamp(m.cor * m.glow) * 0.55;
      for (let i = 0; i < 3; i++) {
        const sh = n['sh' + i]; if (!sh) continue;
        const p = G.still ? 0.4 + i * 0.15 : (t * 0.45 + i / 3) % 1;
        TF(sh, `translate(0 ${f1(-p * 14)})`); O(sh, shK * Math.sin(Math.PI * p) * 0.75);
      }
    },
  };

  // ═════════ B · Firefly jar ═════════
  const JAR = 'M31 41C31 36 35 34 38.5 34H61.5C65 34 69 36 69 41V80C69 85.5 65 88 59.5 88H40.5C35 88 31 85.5 31 80Z';
  function jarArt(tier, sm, opts) {
    // glass body: back pane, then (after the light) the front pane with highlights
    const lantern = tier >= 2;
    const back = `<path d="${JAR}" fill="#F4E9DD" opacity=".5"/><path d="M34 80C34 84 37 85.5 41 85.5H59C63 85.5 66 84 66 80" fill="none" stroke="#C9B29E" stroke-width="2" opacity=".6"/>`;
    const front = `<g filter="url(#pg)"><path d="${JAR}" fill="none" stroke="#9E8270" stroke-width="${sm ? 3.4 : 2}" opacity=".85"/><path d="M35.5 44V77" stroke="#fff" stroke-width="${sm ? 3.6 : 3}" stroke-linecap="round" opacity=".75"/><path d="M64.5 46V56" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/></g><rect x="35" y="28" width="30" height="7" rx="3" fill="#E9DACB" stroke="#9E8270" stroke-width="1.6" filter="url(#pg)"/>`;
    const lid = lantern
      ? `<g filter="url(#p)"><path d="M33 29C33 24 38 21.5 50 21.5C62 21.5 67 24 67 29Z" fill="#4A2A1C"/><rect x="34" y="28" width="32" height="5" rx="2" fill="#3E2317"/></g><path d="M38 23C38 8 62 8 62 23" fill="none" stroke="#3E2317" stroke-width="2.4" stroke-linecap="round" filter="url(#pg)"/><circle cx="50" cy="8.6" r="2.2" fill="none" stroke="#3E2317" stroke-width="1.6"/>`
      : `<g filter="url(#p)"><path d="M32 24.5C38 19 62 19 68 24.5L66 31H34Z" fill="${C.coral}"/><path d="M33.5 30.5H66.5" stroke="#8E2A12" stroke-width="2"/></g><path d="M66 30C70 32 71 35 69.5 38" fill="none" stroke="#8E2A12" stroke-width="1.4" stroke-linecap="round"/>`;
    return { back, front, lid, lantern };
  }
  const FF_IN = [[44, 66], [56, 54], [50, 76], [40, 50], [60, 72], [47, 46], [57, 63]];
  const FF_REST = [[42, 84], [52, 85], [60, 84], [47, 82.5], [37, 83.5], [56, 82], [63, 83]];
  const FF_OUT = [[50, 14], [34, 18], [65, 13], [42, 7], [58, 5], [28, 9], [72, 21]];
  const jar = {
    origin: 90, swap: 'cut',
    sig: (I, T) => { const t = tierI(T), d = Math.round(T.days || 0); return `${t}|${t <= 1 ? Math.max(1, Math.min(6, d)) : 7}`; },
    anchor: (I, T) => (tierI(T) >= 3 ? [50, 46, 30] : [50, 58, 34]),
    count(T) { const t = tierI(T), d = Math.round(T.days || 0); return t <= 1 ? Math.max(1, Math.min(6, d)) : 7; },
    build(I, T) {
      const k = I.k, tier = tierI(T), sm = I.small, dark = I.dark, nFF = this.count(T);
      const art = jarArt(tier, sm);
      // main jar placement: alone it fills the box; on a string it hangs smaller in the middle
      const strung = tier >= 3 && !sm;
      const mainT = strung ? at(50, 20, 0.62, 50, 8) : sm ? at(50, 52, 1.12, 50, 52) : '';
      let string = '', others = '', othersGlow = '';
      if (strung) {
        const pos = tier >= 4 ? [[16, 17, 0.42], [33, 22, 0.48], [67, 22, 0.48], [84, 17, 0.42]] : [[22, 19, 0.46], [78, 19, 0.46]];
        string = IMG('', `<path d="M2 9C24 27 76 27 98 9" fill="none" stroke="${dark ? '#C9A88E' : '#6A4636'}" stroke-width="1.3" stroke-linecap="round" filter="url(#pg)"/>`);
        const a2 = jarArt(2, false);
        others = IMG('', pos.map(([x, y, s]) => `<g transform="${at(x, y, s, 50, 8)}">${a2.back}<path d="${JAR}" fill="#FFD98A" opacity=".35"/>${a2.front}${a2.lid}</g>`).join(''));
        othersGlow = pos.map(([x, y, s], i) => `<ellipse data-n="og${i}" cx="${x}" cy="${f1(y + 48 * s)}" rx="${f1(30 * s)}" ry="${f1(34 * s)}" fill="url(#${k}gc)" opacity="0"/>`).join('');
      }
      const ffs = FF_IN.slice(0, 7).map((_, i) => `<g data-n="ff${i}"><circle r="${sm ? 9 : 7}" fill="url(#${k}gc)"/><circle r="${sm ? 2.6 : 1.7}" fill="#FFF6D8"/>${sm || I.size < 90 ? '' : `<ellipse cx="-2.4" cy="-1" rx="1.6" ry="1" fill="#5A3A28" opacity=".7"/>`}</g>`).join('');
      const frost = IMG('frost', `<path d="${JAR}" fill="#E8F1F6" opacity=".72" filter="url(#ws)"/><path d="M36 50L41 46M38 60L44 55M55 76L61 71M58 44L63 40M45 81L50 77" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="${star4(42, 64, 3.4)}${star4(58, 58, 2.6)}" fill="#fff"/>`);
      const gold = IMG('gold', `<path d="M60 40L55 52L61 60L55.5 73" fill="none" stroke="${C.gold}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#pg)"/><path d="M60 40L55 52L61 60" fill="none" stroke="${C.goldHi}" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>`);
      const lidOff = art.lantern ? '' : IMG('lidoff', `<g transform="rotate(-24 82 80)"><g filter="url(#p)"><path d="M70 79C75 74.5 89 74.5 94 79L92.5 84H71.5Z" fill="${C.coral}"/></g></g>`);
      const rays = sm ? '' : `<path data-n="rays" d="${rayPath(50, 60, 30, 40, 12, 1.6, 0.13, 1)}" fill="${dark ? '#FFD98A' : '#F2A54A'}" opacity="0"/>`;
      const defs = `<clipPath id="${k}jc"><path d="${JAR}"/></clipPath>`;
      const body = `
        ${othersGlow}
        <ellipse data-n="halo" cx="50" cy="${strung ? 48 : 60}" rx="${strung ? 28 : 46}" ry="${strung ? 30 : 42}" fill="url(#${k}gw)" opacity="0"/>
        <ellipse data-n="cglow" cx="50" cy="60" rx="42" ry="40" fill="url(#${k}gf)" opacity="0"/>
        ${rays}${string}${others}
        ${strung ? '' : `<ellipse cx="50" cy="${sm ? 92 : 89}" rx="${sm ? 24 : 24}" ry="3.2" fill="${dark ? '#000' : C.bark}" opacity="${dark ? 0.35 : 0.2}"/>`}
        <g transform="${mainT}">
          ${IMG('', art.back)}
          <g clip-path="url(#${k}jc)"><ellipse data-n="fill" cx="50" cy="70" rx="26" ry="30" fill="url(#${k}gc)" opacity="0"/></g>
          <g data-n="ffin" clip-path="url(#${k}jc)">${ffs}</g>
          ${IMG('', art.front)}${frost}${gold}
          ${IMG('lid', art.lid)}
          <g data-n="ffout"></g>
        </g>
        ${lidOff}`;
      return { body, defs, nFF };
    },
    draw(I, P, G, n) {
      const m = mood(P), t = G.t, T = I.T, nFF = this.count(T), tier = tierI(T);
      const out = Math.max(m.gh, m.em), rest = (1 - m.lit) * (1 - out);
      const live = m.lit + (1 - m.lit) * (1 - out) * (1 - m.fr) * m.heat * 0.75;
      // fireflies that leave the jar (win back, fresh start) move to the outside layer so the glass doesn't clip them
      const shown = m.em > 0.5 ? 1 : nFF;
      for (let i = 0; i < 7; i++) {
        const f = n['ff' + i]; if (!f) continue;
        if (i >= shown || (m.em > 0.5 && i > 0)) { O(f, 0); continue; }
        const wantOut = out > 0.5 ? n.ffout : n.ffin;
        if (f.parentNode !== wantOut) wantOut.appendChild(f);
        const ph = i * 1.7, dx = G.still ? 0 : Math.sin(t * 0.9 + ph) * 3, dy = G.still ? 0 : Math.cos(t * 0.7 + ph * 1.3) * 3;
        const a = FF_IN[i], r = FF_REST[i], o = FF_OUT[i];
        let x = lerp(a[0] + dx, r[0], rest), y = lerp(a[1] + dy, r[1], rest);
        x = lerp(x, o[0] + dx * 1.4, out); y = lerp(y, o[1] + dy, out);
        // the newest firefly flies in from above when the jar fills
        if (i === nFF - 1 && G.grow < 1 && m.lit > 0.5 && tier <= 1) { const g = easeOut(G.grow); x = lerp(50, x, g); y = lerp(-6, y, g); }
        const blink = G.still ? 0.8 : clamp(0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(t * (1.1 + i * 0.13) + ph), 2));
        let a2 = m.lit * (0.55 + 0.45 * blink) + (1 - m.lit) * (1 - out) * (1 - m.fr) * (0.12 + 0.5 * clamp((m.heat - 0.14) / 0.6)) * (0.7 + 0.3 * blink);
        a2 += m.jit * (i === 0 ? 0.65 * G.beat : 0) + out * (0.75 * blink) + m.fr * 0.28;
        TF(f, `translate(${f1(x)} ${f1(y)}) scale(${f2(0.55 + 0.45 * clamp(a2 + 0.2))})`); O(f, clamp(a2 + (G.boost - 1) * 0.3));
      }
      O(n.fill, clamp((tier >= 2 ? 0.9 : 0.12 + 0.11 * nFF) * live * (1 - m.fr) * (1 - out) * (0.85 + 0.15 * G.br) + (G.boost - 1) * 0.3));
      O(n.halo, clamp(m.glow * (tier >= 2 ? 0.95 : 0.5 + 0.06 * nFF) * (0.8 + 0.2 * G.br) + m.cor * 0.3 + (I.dark ? out * 0.25 : 0)));
      for (let i = 0; i < 4; i++) O(n['og' + i], clamp(live * (1 - m.fr) * (1 - out) * (0.75 + 0.25 * Math.sin(t * 1.3 + i * 1.6))));
      O(n.cglow, m.fr * 0.7); O(n.frost, m.fr); O(n.gold, m.ring);
      O(n.lid, 1 - (tier <= 1 ? out : 0)); O(n.lidoff, tier <= 1 ? out : 0);
      if (n.rays) { O(n.rays, m.cor * 0.8 * m.glow); TF(n.rays, G.still ? '' : `rotate(${f1(t * 6)} 50 60)`); }
    },
  };

  // ═════════ C · Rising sun ═════════
  const SKY = { cx: 50, cy: 52, r: 44 };
  const HILL_Y = 70;
  const sun = {
    origin: 90,
    sig: (I, T) => `${tierI(T)}`,
    anchor: () => [50, 46, 34],
    build(I, T) {
      const k = I.k, tier = tierI(T), sm = I.small;
      const R = 12 + Math.min(tier, 5) * 0.8 + (sm ? 3 : 0);
      const skyShape = blob(SKY.cx, SKY.cy, SKY.r, SKY.r, 5, 0.035, 12);
      const sky = (n, stops) => IMG(n, `<path d="${skyShape}" fill="url(#s)" filter="url(#ws)"/><path d="${skyShape}" fill="#000" filter="url(#gr)" opacity=".35"/>`, lg('s', stops));
      // the hill fills the bottom of the roundel; its top edge is the horizon
      const hillD = `M2 ${HILL_Y + 2}C16 ${HILL_Y - 6} 30 ${HILL_Y - 7} 46 ${HILL_Y - 1}C60 ${HILL_Y + 4} 76 ${HILL_Y - 4} 98 ${HILL_Y}V100H2Z`;
      const clip = `<clipPath id="c"><path d="${skyShape}"/></clipPath>`;
      const hill = IMG('', `<g clip-path="url(#c)"><g filter="url(#p)"><path d="${hillD}" fill="url(#h)"/><path d="M-4 ${HILL_Y + 13}C20 ${HILL_Y + 6} 50 ${HILL_Y + 10} 104 ${HILL_Y + 5}V100H-4Z" fill="#B9774A" opacity=".75"/></g></g>`, clip + lg('h', [[0, '#E9B57E'], [1, '#C98A55']]));
      const snow = IMG('snow', `<g clip-path="url(#c)"><g filter="url(#pc)"><path d="M2 ${HILL_Y + 2}C16 ${HILL_Y - 6} 30 ${HILL_Y - 7} 46 ${HILL_Y - 1}C60 ${HILL_Y + 4} 76 ${HILL_Y - 4} 98 ${HILL_Y}V${HILL_Y + 8}C84 ${HILL_Y + 3} 72 ${HILL_Y + 9} 58 ${HILL_Y + 6}C44 ${HILL_Y + 3} 30 ${HILL_Y + 7} 2 ${HILL_Y + 9}Z" fill="#F4F8FA"/></g></g>`, clip);
      const disc = (n, stops, f = 'p') => IMG(n, `<circle cx="50" cy="50" r="${R}" fill="url(#d)" filter="url(#${f})"/>`, rg('d', stops, 0.42, 0.38, 0.62));
      const rays = tier >= 2 ? IMG('rays', `<path d="${rayPath(50, 50, R + 4, R + (tier >= 4 ? 17 : 11), tier >= 4 ? 16 : 8, tier >= 4 ? 2.1 : 2.6, -Math.PI / 2, tier >= 4 ? 1 : 0)}" fill="#F2A54A" filter="url(#pg)"/>`) : '';
      const halo = tier >= 3 ? IMG('halo', `<circle cx="50" cy="50" r="${R + (tier >= 5 ? 22 : 15)}" fill="#FFE2A0" opacity=".75" filter="url(#w)"/>`) : '';
      const defs = `<clipPath id="${k}sky"><path d="${skyShape}"/></clipPath>`;
      const body = `
        ${sky('', [[0, '#FCEDD3'], [1, '#F8D7A0']])}
        ${sky('skyK', [[0, '#E9906A'], [0.6, '#F2A66E'], [1, '#F8C98A']])}
        ${sky('skyW', [[0, '#D6E3EB'], [1, '#EEF2F1']])}
        ${sky('skyA', [[0, '#E3B4A6'], [0.62, '#F6CDA8'], [1, '#FBE0B4']])}
        ${sky('skyT', [[0, '#9A7088'], [0.6, '#D88C7A'], [1, '#F0A87A']])}
        <g clip-path="url(#${k}sky)">
          <circle data-n="ghost" cx="50" cy="40" r="${R}" fill="none" stroke="${C.ember}" stroke-width="${sm ? 3.4 : 1.8}" stroke-dasharray="${sm ? '5 4' : '3.2 3.4'}" stroke-linecap="round" opacity="0"/>
          <g data-n="sun">
            <circle data-n="glow" cx="50" cy="50" r="${R + 24}" fill="url(#${k}gw)" opacity="0"/>
            ${halo}${rays}
            ${disc('sunM', [[0, '#FBE7B8'], [1, '#E8B66A']])}
            ${disc('sunY', [[0, '#FFF1C2'], [0.45, '#FFC955'], [1, '#EA9A2E']])}
            ${disc('sunR', [[0, '#FFC08A'], [0.5, '#F07B5A'], [1, '#C9472B']])}
            ${disc('sunP', [[0, '#FFFFFF'], [1, '#E9EEE6']], 'pc')}
            <circle data-n="mend" cx="50" cy="50" r="${R + 7}" fill="none" stroke="${C.gold}" stroke-width="${sm ? 3.2 : 1.9}" stroke-dasharray="${sm ? '5 4' : '3.4 3'}" stroke-linecap="round" opacity="0"/>
          </g>
        </g>
        ${hill}${snow}`;
      return { body, defs, R };
    },
    draw(I, P, G, n) {
      const m = mood(P), t = G.t, tier = P.tier;
      const climb = clamp((clamp(tier, 1, 5) - 1 + P.grow) / 4.2); // how high the streak has raised it
      const streakAlt = lerp(0.5, 1, climb);
      const dayF = clamp((m.heat - 0.12) / 0.63, -0.25, 1); // through the day it sinks
      let alt = streakAlt * lerp(dayF, 1, m.lit);
      alt = lerp(alt, 0.42 * streakAlt, m.fr);
      alt = lerp(alt, -0.28, m.em); alt = lerp(alt, -0.62, m.gh * (1 - m.em));
      alt += (G.boost - 1) * 0.06 + (G.grow < 1 && m.lit > 0.5 ? -0.08 * (1 - easeOut(G.grow)) : 0);
      const yc = HILL_Y - alt * 34;
      TF(n.sun, `translate(0 ${f1(yc - 50)})`);
      const low = clamp(1 - alt / 0.42);
      const warmAway = (1 - m.fr);
      O(n.sunY, clamp(m.lit + (1 - m.lit) * 0.35) * warmAway);
      O(n.sunM, (1 - m.lit) * warmAway * (1 - low) * (1 - m.gh));
      O(n.sunR, clamp(low * warmAway * (1 - m.lit * 0.6) + m.jit * 0.6 + m.em * 0.3));
      O(n.sunP, m.fr);
      O(n.glow, clamp((m.lit * (0.75 + 0.25 * G.br) + m.jit * G.beat * 0.5 + m.em * 0.4 + (G.boost - 1) * 0.4) * warmAway));
      O(n.rays, clamp(m.lit * warmAway * (1 - m.gh) + m.cor * 0.2) * (1 - m.em));
      if (n.rays && !G.still) TF(n.rays, `rotate(${f1(t * 4)} 50 50)`);
      O(n.halo, clamp(m.glow * (0.85 + 0.15 * G.br) + m.cor * 0.25));
      O(n.mend, m.ring);
      O(n.ghost, m.gh * (1 - m.em)); A(n.ghost, 'cy', f1(HILL_Y - streakAlt * 34));
      // skies: dusk as it sets, winter when frozen, dawn for a fresh start, twilight while it waits
      O(n.skyK, clamp(low * (1 - m.lit) + m.jit * 0.6) * (1 - m.fr) * (1 - m.em) * (1 - m.gh));
      O(n.skyW, m.fr); O(n.skyA, m.em * (1 - m.fr)); O(n.skyT, m.gh * (1 - m.em) * (1 - m.fr));
      O(n.snow, m.fr);
    },
  };

  // ═════════ D · Ink shell ═════════
  // A logarithmic spiral. Day i adds a chamber wall at θ(i); day 7 closes the first loop, day 30 the shell.
  // Then the line keeps growing: an outer contour until 100, an ensō around it until 365.
  const SP = { r0: 3.4, k: 0.1748, th30: 13.8, p: 0.54, ts: -3.2 };
  const thOf = (i) => (i <= 0 ? SP.ts : Math.max(1.6, SP.th30 * Math.pow(Math.min(i, 30) / 30, SP.p)));
  const rOf = (th) => SP.r0 * Math.exp(SP.k * th);
  const spPt = (th, sc = 1) => { const r = rOf(th) * sc, a = th + 2.2; return [Math.cos(a) * r, -Math.sin(a) * r]; };
  function spLine(a, b, sc = 1) { const pts = [], n = Math.max(3, Math.ceil((b - a) / 0.12)); for (let i = 0; i <= n; i++) pts.push(spPt(a + (b - a) * i / n, sc)); return pts; }
  function septum(i) { const th = thOf(i), o = spPt(th), inner = spPt(th - TAU); const mx = (o[0] + inner[0]) / 2, my = (o[1] + inner[1]) / 2, ang = Math.atan2(o[1] - inner[1], o[0] - inner[0]) + Math.PI / 2, L = Math.hypot(o[0] - inner[0], o[1] - inner[1]) * 0.16; return [o, [mx + Math.cos(ang) * L, my + Math.sin(ang) * L], inner]; }
  const ink = {
    origin: 60, swap: 'cut',
    sig(I, T) { const d = T.ember > 0.5 ? 0 : Math.max(1, Math.round(T.days || 0)); return `${d}|${T.lit > 0.5 ? 1 : 0}|${tierI(T)}`; },
    anchor: () => [50, 50, 36],
    build(I, T) {
      const k = I.k, sm = I.small, tier = tierI(T), dark = I.dark;
      const D = T.ember > 0.5 ? 0 : Math.max(1, Math.round(T.days || 0)), litMode = T.lit > 0.5;
      const lw = Math.max(2.5, 1.7 * 100 / I.size), lwS = lw * 0.62;
      // shell space → box: fit the drawn part (plus the ghost of the whole streak) into the box
      const shellD = Math.min(Math.max(D, 1) + (litMode ? 0 : 1), 30);
      const thEnd = thOf(shellD);
      const all = spLine(SP.ts, thEnd);
      for (let i = 1; i <= Math.min(shellD, 30); i++) all.push(...septum(i));
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; all.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
      const room = tier >= 4 ? 52 : sm ? 82 : 66, s = Math.min(room / Math.max(x1 - x0, 1), room / Math.max(y1 - y0, 1), 7.5);
      const ox = 50 - (x0 + x1) / 2 * s, oy = (tier >= 4 ? 50 : 51) - (y0 + y1) / 2 * s;
      const M = (p) => [ox + p[0] * s, oy + p[1] * s];
      const path = (pts) => smooth(pts.map(M), false);
      const sept = (i) => { const [a, b, c] = septum(i).map(M); return `M${f1(a[0])} ${f1(a[1])}Q${f1(b[0])} ${f1(b[1])} ${f1(c[0])} ${f1(c[1])}`; };
      // the day segments: wall from θ(i-1) to θ(i) plus the chamber wall at i
      const seg = (i) => (i <= 30 ? path(spLine(thOf(i - 1), thOf(i))) + (sm ? '' : sept(i)) : '');
      let old = '', last = '', guide = '';
      const upto = Math.min(D, 30);
      if (D >= 1) { old = path(spLine(SP.ts, thOf(Math.max(0, upto - 1)))); for (let i = 1; i < upto; i++) if (!sm) old += sept(i); }
      // Beyond 30 the newest stroke lives on the outer contour (to 100) or on the ensō (to 365).
      let extraOld = '', extraLast = '', extraGuide = '';
      const contour = (a, b) => path(spLine(SP.th30 - TAU * 1.05 + (TAU * 1.05) * a, SP.th30 - TAU * 1.05 + (TAU * 1.05) * b, 1.1));
      const ensoR = 46, ensoA0 = -1.9, ensoSpan = TAU - 0.42;
      const enso = (a, b) => { const pts = []; const n = Math.max(2, Math.ceil((b - a) * 40)); for (let i = 0; i <= n; i++) { const u = ensoA0 + ensoSpan * (a + (b - a) * i / n); pts.push([50 + Math.cos(u) * ensoR, 50 + Math.sin(u) * ensoR]); } return smooth(pts, false); };
      if (D <= 30) { last = D >= 1 ? seg(upto) : ''; guide = !litMode && D < 30 ? seg(D + 1) : ''; }
      else {
        last = seg(30); old += last; last = '';
        old += sm ? '' : `M${M(spPt(SP.th30)).map(f1).join(' ')}L${M(spPt(SP.th30 - TAU, 1)).map(f1).join(' ')}`; // the aperture lip
        const inc = (lo, hi, d) => [clamp((d - 1 - lo) / (hi - lo)), clamp((d - lo) / (hi - lo))];
        if (D <= 100) { const [a, b] = inc(30, 100, D); const b2 = Math.max(b, a + 0.03); extraOld = contour(0, a); extraLast = contour(a, b2); if (!litMode) extraGuide = contour(b2, Math.min(1, b2 + 0.03)); }
        else {
          extraOld = contour(0, 1);
          if (!sm) { const [a, b] = inc(100, 365, D); const b2 = Math.max(b, a + 0.025); extraOld += a > 0 ? enso(0, a) : ''; extraLast = enso(a, Math.min(1, b2)); if (!litMode && b2 < 1) extraGuide = enso(b2, Math.min(1, b2 + 0.025)); }
        }
      }
      old += extraOld; last += extraLast; guide += extraGuide;
      if (litMode === false && D <= 30 && D >= 1) { /* in unlit mode the newest drawn stroke is `last` (dry), today is the guide */ }
      // the whole shell, dotted, for win back
      let ghost = ''; if (D >= 1) { ghost = path(spLine(SP.ts, thOf(upto))); if (!sm) for (let i = 1; i <= upto; i++) ghost += sept(i); }
      // painted wash inside the finished shell (30+), stripes at 100+
      let wash = '';
      if (tier >= 3) {
        const outer = spLine(SP.ts, SP.th30).map(M), innerW = spLine(SP.th30 - TAU, SP.ts + 0.01).map(M);
        const shellArea = smooth(outer, false) + 'L' + innerW.map((p) => `${f1(p[0])} ${f1(p[1])}`).join('L') + 'Z';
        const fill = smooth(spLine(SP.ts, SP.th30).map(M), false) + 'Z';
        let stripes = '';
        if (tier >= 4) { for (let i = 0; i < 9; i++) { const th = SP.th30 - 0.3 - i * 0.55, a = M(spPt(th, 1)), b = M(spPt(th - 0.42, 0.84)); stripes += `M${f1(a[0])} ${f1(a[1])}Q${f1((a[0] + b[0]) / 2 + 2)} ${f1((a[1] + b[1]) / 2)} ${f1(b[0])} ${f1(b[1])}`; } }
        wash = IMG('wash', `<path d="${fill}" fill="#F8DCC2" filter="url(#w)" opacity=".95"/><path d="${shellArea}" fill="#F6C9A6" opacity=".6" filter="url(#ws)"/>${stripes ? `<path d="${stripes}" fill="none" stroke="#E07A55" stroke-width="3.4" stroke-linecap="round" opacity=".75" filter="url(#ws)"/>` : ''}`);
      }
      const tip = D >= 1 ? M(spPt(thOf(upto))) : [50, 54];
      const dropAt = D >= 1 ? tip : [50, 56];
      const drop = IMG('drop', `<g filter="url(#p)"><path d="${blob(dropAt[0], dropAt[1], D >= 1 ? (sm ? 8 : 5.4) : (sm ? 13 : 9), D >= 1 ? (sm ? 7.2 : 4.8) : (sm ? 11.5 : 8), 31, 0.12, 8)}" fill="${C.ember}"/></g><ellipse cx="${f1(dropAt[0] - (D >= 1 ? 1.6 : 3))}" cy="${f1(dropAt[1] - (D >= 1 ? 1.6 : 3))}" rx="${D >= 1 ? 1.4 : 2.6}" ry="${D >= 1 ? 1 : 1.8}" fill="#FFB89A"/>`);
      const INK = dark ? '#E9876A' : '#8E3A22', FRESH = dark ? '#FF9B76' : C.ember, FROST = dark ? '#A9CBE2' : '#4F86AE';
      const st = (n, d, col, w, extra = '') => d ? `<path data-n="${n}" d="${d}" fill="none" stroke="${col}" stroke-width="${f2(w)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>` : '';
      const body = `
        <ellipse data-n="glow" cx="50" cy="50" rx="44" ry="44" fill="url(#${k}gw)" opacity="0"/>
        ${wash}
        ${st('ghost', ghost, C.ember, lw * 0.8, `stroke-dasharray="${f2(lw * 0.1)} ${f2(lw * 1.5)}" opacity="0"`)}
        ${st('old', old, INK, lw)}
        ${st('last', last, INK, lw)}
        ${st('lastF', last, FRESH, lw * 1.08, 'pathLength="1" stroke-dasharray="1 1"')}
        ${st('sheen', last, '#FFC3A0', lwS * 0.45, 'pathLength="1" stroke-dasharray="1 1" opacity=".7"')}
        ${st('gold', last, C.gold, lw * 1.1, 'opacity="0"')}
        ${st('guide', guide, C.ember, lw * 0.7, `stroke-dasharray="${f2(lw * 0.1)} ${f2(lw * 1.4)}"`)}
        ${st('frost', old + last, FROST, lw, 'opacity="0"')}
        ${last ? IMG('ice', `<path d="${last}" fill="none" stroke="#E4EFF5" stroke-width="${f2(lw * 2.8)}" stroke-linecap="round" filter="url(#ws)" opacity=".9"/>`) : ''}
        ${drop}`;
      return { body, D, litMode };
    },
    draw(I, P, G, n) {
      const m = mood(P), t = G.t;
      const solid = (1 - m.gh) * (1 - m.em);
      O(n.old, solid * (1 - m.fr));
      // fresh, wet ink on the newest stroke when lit; it draws itself on when the day lands
      const draw = m.lit > 0.5 ? easeInOut(G.grow) : 1;
      A(n.lastF, 'stroke-dashoffset', f2(1 - draw)); A(n.sheen, 'stroke-dashoffset', f2(1 - draw));
      O(n.lastF, solid * m.lit * (1 - m.fr) * (1 - m.ring));
      O(n.sheen, solid * m.lit * (1 - m.fr) * (1 - m.ring) * 0.7);
      // when not lit the latest stroke dries; from 6 PM it fades in and out
      const fade = m.jit * (0.55 - 0.45 * G.beat);
      O(n.last, solid * (1 - m.lit) * (1 - m.fr) * (1 - fade));
      O(n.gold, solid * m.ring);
      O(n.guide, solid * (1 - m.lit) * (1 - m.fr) * (0.3 + 0.5 * clamp((m.heat - 0.1) / 0.6) + m.jit * 0.4 * G.beat));
      if (n.guide) A(n.guide, 'stroke', m.jit > 0.5 ? '#D9861A' : C.ember);
      O(n.frost, solid * m.fr); O(n.ice, solid * m.fr);
      O(n.ghost, m.gh * (1 - m.em) * 0.9);
      O(n.drop, Math.max(m.em, m.gh) * (G.still ? 1 : 0.85 + 0.15 * Math.sin(t * 2.2)));
      O(n.wash, solid * (0.55 + 0.45 * m.lit) * (1 - m.fr * 0.5) * (1 - m.jit * 0.3) + m.cor * 0.2);
      O(n.glow, clamp(m.cor * 0.7 + (G.boost - 1) * 0.3 + m.glow * 0.15));
    },
  };

  // ═════════ E · Lit numeral ═════════
  const FONT = `font-family="Fraunces, Georgia, serif" font-weight="600" text-anchor="middle" style="font-variation-settings:'SOFT' 100,'opsz' 144,'WONK' 0;letter-spacing:-.04em"`;
  // a laurel sprig on the right; leaves point along the stem toward its tip
  function sprig(r, a0, a1, n, cy) {
    const stem = []; let d = '';
    for (let i = 0; i <= 24; i++) { const a = a0 + (a1 - a0) * i / 24; stem.push([50 + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    const sg = Math.sign(a1 - a0);
    for (let i = 0; i < n; i++) {
      const u = (i + 0.55) / n, a = a0 + (a1 - a0) * u, x = 50 + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      const tx = -Math.sin(a) * sg, ty = Math.cos(a) * sg, L = 9 - u * 2.6, w = 2.7 - u * 0.6;
      for (const o of [-0.62, 0.62]) {
        const dx = tx * Math.cos(o) - ty * Math.sin(o), dy = tx * Math.sin(o) + ty * Math.cos(o);
        const ex = x + dx * L, ey = y + dy * L, mx = (x + ex) / 2, my = (y + ey) / 2, px = -dy * w, py = dx * w;
        d += `M${f1(x)} ${f1(y)}Q${f1(mx + px)} ${f1(my + py)} ${f1(ex)} ${f1(ey)}Q${f1(mx - px)} ${f1(my - py)} ${f1(x)} ${f1(y)}Z`;
      }
    }
    return { leaves: d, stem: smooth(stem, false) };
  }
  const numeral = {
    origin: 70, swap: 'roll',
    text: (T) => (T.ember > 0.5 ? '1' : String(Math.max(1, Math.round(T.days || 0)))),
    sig(I, T) { return `${this.text(T)}|${tierI(T)}`; },
    anchor: () => [50, 50, 34],
    build(I, T) {
      const k = I.k, tier = tierI(T), sm = I.small, txt = this.text(T), nd = txt.length;
      const orn = tier >= 3 && !sm ? 0.8 : 1;
      const fs = (nd === 1 ? 90 : nd === 2 ? 74 : nd === 3 ? 56 : 44) * orn * (sm ? 1.08 : 1);
      const cy = tier >= 3 && !sm ? 48 : 50, base = f1(cy + fs * 0.355);
      const text = (extra) => `<text x="50" y="${base}" font-size="${f1(fs)}" ${FONT} ${extra}>${txt}</text>`;
      let halo = '', wreath = '';
      if (tier >= 2 && !sm) halo = IMG('halo', `<circle cx="50" cy="${cy}" r="${tier >= 5 ? 48 : 44}" fill="url(#hl)"/>${tier >= 5 ? `<path d="${rayPath(50, cy, 40, 47, 24, 1.3, 0, 1)}" fill="#F2A54A" opacity=".8" filter="url(#pg)"/>` : ''}`, rg('hl', [[0, '#FFE2A0', 0.85], [0.6, '#FFE2A0', 0.5], [1, '#FFE2A0', 0]]));
      if (tier >= 3 && !sm) {
        const R = sprig(42, 1.25, tier >= 4 ? -0.95 : -0.15, tier >= 4 ? 8 : 5, cy + 2);
        const lv = `<path d="${R.stem}" fill="none" stroke="#8A5A0C" stroke-width="1.6" stroke-linecap="round"/><path d="${R.leaves}" fill="#D69A2D"/>`;
        const ribbon = tier >= 4 ? `<path d="M44 93.5L50 90L56 93.5L54.5 98L50 95.5L45.5 98Z" fill="${C.ember}"/>` : '';
        const star = tier >= 5 ? `<path d="${star4(50, 7, 5.5)}" fill="#F2A54A"/>` : '';
        wreath = IMG('wreath', `<g filter="url(#p)">${lv}<g transform="translate(100 0) scale(-1 1)">${lv}</g>${ribbon}${star}</g>`);
      }
      const defs = `<clipPath id="${k}tc">${text('')}</clipPath>
        <clipPath id="${k}dr"><rect data-n="drain" x="0" y="0" width="100" height="100"/></clipPath>
        ${rg(k + 'hot', [[0, '#FFF1C2'], [0.32, '#FFC24A'], [0.66, '#E2702C'], [1, '#B83A1C']], 0.5, 0.45, 0.58)}
        ${lg(k + 'fr', [[0, '#F7FBFD'], [1, '#B9D4E6']])}
        ${sm ? '' : paintF(k + 'p', '#5A1D0C', 0.3, '#FFF3DC', 0.35, 1.1, 0.7, 0.15)}`;
      const DEEP = I.dark ? '#7A2C16' : '#6B2410';
      const body = `
        ${halo}${wreath}
        <ellipse data-n="glow" cx="50" cy="${cy}" rx="46" ry="40" fill="url(#${k}gw)" opacity="0"/>
        <g ${sm ? '' : `filter="url(#${k}p)"`}>
          <g data-n="base">${text(`fill="${DEEP}"`)}</g>
          <g clip-path="url(#${k}dr)"><g data-n="hot">${text(`fill="url(#${k}hot)"`)}</g></g>
          <g clip-path="url(#${k}tc)"><ellipse data-n="spot" cx="46" cy="${cy}" rx="22" ry="16" fill="url(#${k}gc)" opacity="0"/>
            <path data-n="gold" d="M30 ${cy - 30}L40 ${cy - 12}L33 ${cy}L46 ${cy + 12}L40 ${cy + 30}" fill="none" stroke="${C.gold}" stroke-width="${sm ? 4 : 2.8}" stroke-linecap="round" stroke-linejoin="round" opacity="0"/></g>
          <g data-n="frost">${text(`fill="url(#${k}fr)"`)}</g>
        </g>
        <g data-n="rime">${text(`fill="none" stroke="#fff" stroke-width="${sm ? 2 : 1.3}" stroke-dasharray="0.4 2.6" stroke-linecap="round"`)}</g>
        <g data-n="ol">${text(`fill="${I.dark ? 'rgba(255,240,228,.06)' : 'rgba(255,248,241,.7)'}" stroke="${C.ember}" stroke-width="${sm ? 3 : 1.6}" stroke-dasharray="${sm ? '4 3' : '3 2.6'}" stroke-linecap="round"`)}</g>
        ${sm ? '' : `<path data-n="spark" d="${star4(50 + fs * 0.12, cy - fs * 0.44, 5)}" fill="#E0901C" opacity="0"/>`}`;
      return { body, defs, cy, fs };
    },
    draw(I, P, G, n) {
      const m = mood(P), t = G.t;
      const outline = Math.max(m.gh, m.em);
      const solid = 1 - outline;
      const hot = clamp((m.lit * (0.6 + 0.4 * m.heat) + (1 - m.lit) * (0.12 + 0.6 * clamp((m.heat - 0.14) / 0.6))) * (1 - m.fr) + (G.boost - 1) * 0.3);
      O(n.base, solid); O(n.hot, solid * hot);
      // at risk the glow drains down out of the number
      const level = m.jit > 0.01 ? lerp(0, 1 - clamp((m.heat - 0.08) / 0.4) * 0.75 - 0.08 * G.beat, m.jit) : 0;
      A(n.drain, 'y', f1(level * 100));
      O(n.spot, solid * m.glow * (0.3 + 0.2 * G.br));
      if (n.spot && !G.still) { A(n.spot, 'cx', f1(46 + Math.sin(t * 0.7) * 10)); }
      O(n.glow, clamp(m.glow * (0.55 + 0.25 * G.br) + m.cor * 0.25 + (G.boost - 1) * 0.3 + m.jit * G.beat * 0.2));
      O(n.frost, solid * m.fr); O(n.rime, solid * m.fr);
      O(n.ol, outline); O(n.spark, m.em * (G.still ? 1 : 0.6 + 0.4 * Math.sin(t * 3)));
      O(n.gold, solid * m.ring);
      O(n.halo, clamp(m.glow * 0.9 + m.cor * 0.3) * solid);
      O(n.wreath, solid * (0.55 + 0.45 * (1 - m.fr * 0.4)));
    },
  };

  // ═════════ F · Painted candle ═════════
  // Flame drawn with its base (the wick tip) at (50, 70) in its own box.
  const FLAME_O = 'M50 26C53.5 39 61 49.5 61 59C61 65.5 56 70 50 70C44 70 39 65.5 39 59C39 49.5 46.5 39 50 26Z';
  const FLAME_I = 'M50 43C51.8 50 55.5 54.5 55.5 60C55.5 63.8 53 66.4 50 66.4C47 66.4 44.5 63.8 44.5 60C44.5 54.5 48.2 50 50 43Z';
  function candleLayout(tier, days) {
    const H = 50 - 18 * clamp(Math.log(Math.max(1, days)) / Math.log(100));
    if (tier <= 0) return { c: [[50, 50, 9]], holder: 'dish' };
    if (tier === 1) return { c: [[50, H, 9]], holder: 'dish' };
    if (tier === 2) return { c: [[58, H, 8.5], [36, H * 0.74, 7.5]], holder: 'dish' };
    if (tier === 3) return { c: [[50, H, 8.5], [29, H * 0.72, 7], [71, H * 0.8, 7]], holder: 'dish' };
    if (tier === 4) return { c: [[50, 26, 6.6, 50], [26, 22, 6, 58], [74, 22, 6, 58]], holder: 'cande3' };
    return { c: [[50, 24, 6, 46], [33, 20, 5.4, 53], [67, 20, 5.4, 53], [16, 17, 5, 61], [84, 17, 5, 61]], holder: 'cande5' };
  }
  const candle = {
    origin: 88,
    smallView: (T) => (tierI(T) <= 1 ? '16 14 68 80' : '6 12 88 88'),
    sig(I, T) { const tier = tierI(T); return `${tier}|${tier <= 3 ? Math.round(candleLayout(tier, T.days || 1).c[0][1]) : 0}`; },
    anchor(I, T) { const L = candleLayout(tierI(T), T.days || 1), c = L.c[0], base = c[3] || 84; return [50, base - c[1] - 12, 30]; },
    build(I, T) {
      const k = I.k, tier = tierI(T), sm = I.small, dark = I.dark;
      const L = candleLayout(tier, T.days || 1);
      let wax = '', tops = '', holder = '';
      const fl = [];
      L.c.forEach(([x, h, w, base], i) => {
        base = base || 84; const top = base - h;
        wax += `<path d="M${x - w} ${top + 2}C${x - w} ${top} ${x + w} ${top} ${x + w} ${top + 2}V${base}H${x - w}Z" fill="url(#wx)"/>`;
        tops += `<ellipse cx="${x}" cy="${top + 1.6}" rx="${w - 1.2}" ry="${f1(w * 0.26)}" fill="#FFF6E8"/>`;
        if (!sm) tops += `<path d="M${x + w * 0.4} ${top + 2.6}C${x + w * 0.5} ${top + 7} ${x + w * 0.2} ${top + 9} ${x + w * 0.42} ${top + 12}" fill="none" stroke="#F6C9A6" stroke-width="${f1(w * 0.36)}" stroke-linecap="round"/>`;
        fl.push([x, top - 5, w / 9, i]);
      });
      if (L.holder === 'dish') {
        const xs = L.c.map((c) => c[0]), lo = Math.min(...xs) - 18, hi = Math.max(...xs) + 18;
        holder = `<path d="M${lo} 84C${lo} 91 ${hi} 91 ${hi} 84Z" fill="#7A5444"/><ellipse cx="50" cy="84" rx="${(hi - lo) / 2}" ry="3.4" fill="#9A7262"/><ellipse cx="50" cy="83.4" rx="${(hi - lo) / 2 - 3}" ry="2" fill="#B58A76"/>`;
      } else {
        const arms = L.c.slice(1).map((c) => `M50 ${tier === 4 ? 72 : 74}C${50 + (c[0] - 50) * 0.2} ${c[3] + 18} ${c[0]} ${c[3] + 14} ${c[0]} ${c[3] + 2}`).join('');
        holder = `<path d="${arms}" fill="none" stroke="#5A3A28" stroke-width="3.2" stroke-linecap="round"/><path d="M48 ${L.c[0][3]}V86M40 92C40 86 60 86 60 92Z" fill="none" stroke="#5A3A28" stroke-width="3.6" stroke-linecap="round"/><path d="M38 92H62" stroke="#5A3A28" stroke-width="3.6" stroke-linecap="round"/>${L.c.map(([x, , w, b]) => `<path d="M${x - w - 2.4} ${b}H${x + w + 2.4}L${x + w} ${b + 4}H${x - w}Z" fill="#6E4A34"/>`).join('')}`;
      }
      const wdef = lg('wx', [[0, '#FFF4E2'], [0.5, '#F7E3C9'], [1, '#E7C7A4']], 1, 0);
      const wicks = fl.map(([x, y, s]) => `<path d="M${x} ${f1(y + 5.4)}C${x} ${f1(y + 3)} ${f1(x + 0.8 * s)} ${f1(y + 1.6)} ${f1(x + 0.6 * s)} ${f1(y + 0.4)}" fill="none" stroke="#2B1A12" stroke-width="${f1(sm ? 2.4 : 1.4 * s + 0.3)}" stroke-linecap="round"/>`).join('');
      const flameImg = IMG('', `<path d="${FLAME_O}" fill="#FFB347" opacity=".55" filter="url(#w)"/><g filter="url(#pg)"><path d="${FLAME_O}" fill="url(#f)"/><path d="${FLAME_I}" fill="#FFF6DE"/></g>`, lg('f', [[0, '#FFD98A'], [0.55, '#F6A04D'], [1, '#E8653A']]));
      const iceImg = IMG('', `<g filter="url(#pc)"><path d="${FLAME_O}" fill="url(#f)"/><path d="${FLAME_I}" fill="#FFFFFF"/></g>`, lg('f', [[0, '#F2F8FC'], [1, '#9CC0D8']]));
      const flames = fl.map(([x, y, s, i]) => `
        <ellipse data-n="g${i}" cx="${x}" cy="${f1(y - 8 * s)}" rx="${f1(30 * s + 4)}" ry="${f1(32 * s + 4)}" fill="url(#${k}gw)" opacity="0"/>
        <g data-n="f${i}">${flameImg}</g><g data-n="i${i}">${iceImg}</g>
        <circle data-n="w${i}" cx="${f1(x + 0.6 * s)}" cy="${f1(y + 0.6)}" r="${f1(sm ? 4 : 2.2 * s + 0.6)}" fill="url(#${k}gc)" opacity="0"/>`).join('');
      const f0 = fl[0];
      const smoke = sm ? '' : `<path data-n="smoke" d="M${f0[0] + 0.6} ${f0[1]}c-3 -5 4 -8 0 -13s-4 -8 1 -13" fill="none" stroke="${dark ? '#C9B3A2' : '#9C8574'}" stroke-width="1.6" stroke-linecap="round" opacity="0"/>`;
      const c0 = L.c[0], top0 = (c0[3] || 84) - c0[1];
      const frost = IMG('frost', `<g filter="url(#pc)">${L.c.map(([x, h, w, b]) => { const tp = (b || 84) - h; return `<path d="M${x - w - 0.6} ${tp + 1}C${x - w} ${tp - 1.4} ${x + w} ${tp - 1.4} ${x + w + 0.6} ${tp + 1}V${tp + 5}C${x + w * 0.5} ${tp + 3.6} ${x} ${tp + 6.4} ${x - w * 0.4} ${tp + 4}C${x - w * 0.7} ${tp + 6} ${x - w} ${tp + 4} ${x - w - 0.6} ${tp + 5}Z" fill="#F2F8FB"/>`; }).join('')}</g>`);
      const gold = IMG('gold', `<rect x="${c0[0] - c0[2] - 0.5}" y="${f1(top0 + c0[1] * 0.5)}" width="${c0[2] * 2 + 1}" height="${sm ? 6 : 4.2}" fill="${C.gold}" filter="url(#pg)"/><path d="M${c0[0] - c0[2] + 1} ${f1(top0 + c0[1] * 0.5 + 1.2)}H${c0[0] + c0[2] - 2}" stroke="${C.goldHi}" stroke-width=".9" stroke-linecap="round"/>`);
      const halo = tier >= 2 && !sm ? `<ellipse data-n="halo" cx="50" cy="${f1(f0[1] - 4)}" rx="46" ry="40" fill="url(#${k}gw)" opacity="0"/>` : '';
      const body = `
        ${halo}
        <ellipse data-n="cglow" cx="50" cy="${f1(f0[1])}" rx="30" ry="30" fill="url(#${k}gf)" opacity="0"/>
        <ellipse cx="50" cy="${L.holder === 'dish' ? 89 : 93}" rx="${L.holder === 'dish' ? 30 : 22}" ry="3" fill="${dark ? '#000' : C.bark}" opacity="${dark ? 0.35 : 0.18}"/>
        ${IMG('', `<g filter="url(#p)">${holder}</g><g filter="url(#p)">${wax}</g>${tops}`, wdef)}
        ${frost}${gold}${wicks}${smoke}${flames}`;
      return { body, fl };
    },
    draw(I, P, G, n) {
      const m = mood(P), t = G.t, L = candleLayout(tierI(I.T), I.T.days || 1);
      const on = (1 - m.gh) * (1 - m.em) * (1 - m.fr);
      // size of the flame: full when lit, low and dimming through the day, guttering at risk; brighter with tiers
      const bright = 0.92 + 0.04 * Math.min(4, P.tier);
      const fh = clamp(m.lit * bright + (1 - m.lit) * (0.3 + 0.55 * clamp((m.heat - 0.14) / 0.6)) - m.jit * 0.12, 0.12, 1.1) + (G.boost - 1) * 0.18;
      L.c.forEach(([x, h, w, base], i) => {
        const s = w / 9, y = (base || 84) - h - 5;
        const fq = G.still ? 0 : 1, rk = m.jit;
        const sy = fh * (1 + fq * (0.05 * Math.sin(t * 7 + i) + 0.03 * Math.sin(t * 13.3 + i * 2) + rk * 0.22 * Math.sin(t * 17 + i)));
        const sx = (0.86 + 0.14 * fh) * (1 + fq * 0.03 * Math.sin(t * 9 + i));
        const sk = fq * (2.4 * Math.sin(t * 2.3 + i * 1.3) + rk * 7 * Math.sin(t * 11));
        const tf = `translate(${f1(x)} ${f1(y)}) scale(${f2(sx * s * 0.5)} ${f2(sy * s * 0.5)}) skewX(${f1(sk)}) translate(-50 -70)`;
        TF(n['f' + i], tf); O(n['f' + i], on * (i === 0 ? 1 : clamp(m.lit + (1 - m.lit) * 0.85)));
        TF(n['i' + i], `translate(${f1(x)} ${f1(y)}) scale(${f2(s * 0.36)} ${f2(s * 0.36)}) translate(-50 -70)`); O(n['i' + i], m.fr);
        O(n['g' + i], clamp(on * (m.lit * (0.65 + 0.2 * G.br) + (1 - m.lit) * 0.35 * fh + m.jit * G.beat * 0.4) + (G.boost - 1) * 0.3));
        O(n['w' + i], clamp((m.em + m.gh * 0.8) * (0.55 + 0.45 * (G.still ? 1 : Math.sin(t * 2.4 + i) * 0.5 + 0.5))));
      });
      O(n.halo, clamp(m.glow * 0.7 + m.cor * 0.35));
      O(n.cglow, m.fr * 0.6);
      O(n.frost, m.fr); O(n.gold, m.ring);
      if (n.smoke) { const p = G.still ? 0.4 : (t * 0.35) % 1; TF(n.smoke, `translate(${f1(Math.sin(t) * 1.2)} ${f1(-p * 8)})`); O(n.smoke, m.gh * (1 - m.em) * (G.still ? 0.8 : Math.sin(Math.PI * p) * 0.9)); }
    },
  };

  const STY = { ember, jar, sun, ink, numeral, candle };

  // ───────── Words: the new metaphors need their own verbs ─────────
  const FIRST = { ember: ['Light your first ember', 'Your ember is glowing'], jar: ['Catch your first firefly', 'Your first firefly is in'], sun: ['Raise your first sun', 'Your sun is up'], ink: ['Draw your first line', 'You drew your first line'], numeral: ['Light day 1', 'Day 1 is lit'], candle: ['Light your first candle', 'You lit your first candle'] };
  const GREW = { ember: 'It’s a hearth now.', jar: 'Your jar became a string of lanterns.', sun: 'Your sun has a halo now.', ink: 'Your shell is complete.', numeral: 'It earned its laurels.', candle: 'Three candles now.' };
  function words(key) {
    return (kind, name, r, o) => {
      if (kind === 'copy') { if (r.title === 'Light your first flame') return Object.assign({}, r, { title: FIRST[key][0] }); return r; }
      const cfg = Object.assign({}, r);
      if (name === 'ignite' && cfg.title === 'You lit your first flame') cfg.title = FIRST[key][1];
      if (name === 'milestone' && /Your flame grew\./.test(cfg.body)) cfg.body = cfg.body.replace('Your flame grew.', GREW[key]);
      return cfg;
    };
  }
  STYLES2.forEach((s) => S.register(s.key, V2, words(s.key)));
  S.STYLES2 = STYLES2; S.READS2 = READS2; S.FIRST2 = FIRST; S.isV2 = (k) => KEYS2.includes(k);
  Object.defineProperty(S, 'live2', { get: () => LIVE.size });
})();
