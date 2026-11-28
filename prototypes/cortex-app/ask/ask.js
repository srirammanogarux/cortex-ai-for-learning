// Ask tab (C · Ask). window.Ask = { mount(viewEl), show(), hide() }. Content lives in ask/content.js.
// Talks to the rest of the app only through Bus, Store, App and Brain (see CONTRACT.md).
//
//   Home (A box + wonder · B map home · C character)  →  chat page (question bubble, the character thinks,
//   morphs into the answer's shape, the answer streams in)  →  tap a glowing word → popover → "Branch here"
//   → a new full-screen chat zooms out of that word. A trail at the top and a corner mini-map (tap or pinch out)
//   show where you are in the tree.
(function () {
  'use strict';
  const C = window.ASK_CONTENT || { answers: {}, terms: {}, history: [], suggestions: [], kinds: {}, wonder: {}, talk: {}, show: {} };
  const A = C.answers, T = C.terms;
  const P = new URLSearchParams(location.search);
  const html = document.documentElement;
  const reducedMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const still = () => html.classList.contains('still') || reducedMQ.matches;
  const later = (fn, ms) => setTimeout(fn, still() ? 0 : ms);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const GLIDE = 'cubic-bezier(0.32, 0.72, 0, 1)', OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
  const SW = 368, SH = 822;
  const isPlus = () => !!(window.Store && Store.isPlus());
  const app = () => window.App || null;
  const say = (m) => { if (window.toast) toast(m); };
  const emit = (ev, d) => { if (window.Bus) Bus.emit(ev, d); };
  function bezier(x1, y1, x2, y2) {
    const B = (a, b, s) => 3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * b + s * s * s;
    return (t) => { if (t <= 0) return 0; if (t >= 1) return 1; let lo = 0, hi = 1, s = t; for (let i = 0; i < 20; i++) { s = (lo + hi) / 2; if (B(x1, x2, s) < t) lo = s; else hi = s; } return B(y1, y2, s); };
  }
  const glide = bezier(0.32, 0.72, 0, 1), easeOut = bezier(0.23, 1, 0.32, 1);
  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // ───────── Icons (24 × 24 line icons for small UI) ─────────
  const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const rect = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
  const IC = {
    x: ['M18 6L6 18', 'M6 6l12 12'], back: ['M15 18l-6-6 6-6'], chev: ['M9 18l6-6-6-6'], check: ['M20 6L9 17l-5-5'],
    up: ['M12 19V5', 'M5 12l7-7 7 7'], alert: [circ(12, 12, 9.5), 'M12 7.5v5', 'M12 16.2v.01'],
    sparkle: ['M12 3l1.9 5.8L20 10.8l-6.1 2L12 19l-1.9-6.2L4 10.8l6.1-2z', 'M19 2v4', 'M21 4h-4', 'M5 18v4', 'M7 20H3'],
    branch: ['M6 3v12', circ(18, 6, 3), circ(6, 18, 3), 'M18 9a9 9 0 0 1-9 9'],
    mic: [rect(9, 2, 6, 12, 3), 'M5 10v1a7 7 0 0 0 14 0v-1', 'M12 18v4'],
    camera: ['M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z', circ(12, 13, 3.5)],
    type: [rect(2, 5, 20, 14, 2.5), 'M6 9h.01', 'M10 9h.01', 'M14 9h.01', 'M18 9h.01', 'M7 15h10'],
    heart: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z'],
    pulse: ['M22 12h-4l-3 9L9 3l-3 9H2'],
    bowl: ['M2 12h20', 'M4 12a8 8 0 0 0 16 0', 'M9 8c0-1.5 1-2 1-3.5', 'M14 8c0-1.5 1-2 1-3.5'],
    crown: ['M2 20h20', 'M3 7l4 5 5-7 5 7 4-5-1.5 10h-15z'],
    pad: [circ(6.5, 9, 1.8), circ(12, 6, 1.8), circ(17.5, 9, 1.8), 'M12 11.5c-3 0-5.5 3.2-5.5 5.4 0 1.6 1.3 2.6 2.8 2.6 1 0 1.8-.6 2.7-.6s1.7.6 2.7.6c1.5 0 2.8-1 2.8-2.6 0-2.2-2.5-5.4-5.5-5.4z'],
    sun: [circ(12, 12, 4), 'M12 2v2', 'M12 20v2', 'M4.9 4.9l1.4 1.4', 'M17.7 17.7l1.4 1.4', 'M2 12h2', 'M20 12h2', 'M4.9 19.1l1.4-1.4', 'M17.7 6.3l1.4-1.4'],
    leaf: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z', 'M2 21c0-3 1.9-5.4 5.1-6'],
    pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', circ(12, 10, 3)],
    drop: ['M12 2.7l5.7 5.7a8 8 0 1 1-11.3 0z'],
    ring: [circ(12, 12, 9), circ(12, 12, 4)],
    clock: [circ(12, 12, 9.5), 'M12 7v5l3.5 2'],
    note: ['M9 18V5l12-2v13', circ(6, 18, 3), circ(18, 16, 3)],
    ear: ['M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0', 'M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4'],
    wifi: ['M5 12.55a11 11 0 0 1 14.08 0', 'M1.42 9a16 16 0 0 1 21.16 0', 'M8.53 16.11a6 6 0 0 1 6.95 0', 'M12 20h.01'],
    bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'],
    shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
    wave: ['M2 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0', 'M22 12h-0'],
    fish: ['M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6z', 'M18 12v.5', 'M2 9.5c1.5 1 2.5 1.5 4.5 2.5-2 1-3 1.5-4.5 2.5'],
    ruler: ['M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0z', 'M14.5 12.5l2-2', 'M11.5 9.5l2-2', 'M8.5 6.5l2-2', 'M17.5 15.5l2-2'],
    car: ['M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2', circ(7, 17, 2), 'M9 17h6', circ(17, 17, 2)],
    burst: ['M12 2v4', 'M12 18v4', 'M4.9 4.9l2.9 2.9', 'M16.2 16.2l2.9 2.9', 'M2 12h4', 'M18 12h4', 'M4.9 19.1l2.9-2.9', 'M16.2 7.8l2.9-2.9'],
    flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
    magnet: ['M6 15l-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3z', 'M5 8l4 4', 'M12 15l4 4'],
    moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z'],
    scale: ['M12 3v18', 'M7 21h10', 'M3 7h18', 'M6 7l-3 7a3.5 3.5 0 0 0 6 0z', 'M18 7l-3 7a3.5 3.5 0 0 0 6 0z'],
    grid: [rect(3, 3, 18, 18, 2.5), 'M3 9h18', 'M3 15h18', 'M9 3v18', 'M15 3v18'],
    book: ['M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z', 'M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z'],
    bolt: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
    flip: ['M3 12a9 9 0 0 1 15-6.7L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-15 6.7L3 16', 'M3 21v-5h5'],
    share: ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8', 'M16 6l-4-4-4 4', 'M12 2v13'],
    lock: [rect(4, 11, 16, 10, 2.5), 'M8 11V7a4 4 0 0 1 8 0v4'],
    map: ['M9 4L3 7v13l6-3 6 3 6-3V4l-6 3-6-3z', 'M9 4v13', 'M15 7v13'],
    hand: ['M18 11V6a2 2 0 0 0-4 0v5', 'M14 10V4a2 2 0 0 0-4 0v6', 'M10 10.5V6a2 2 0 0 0-4 0v8', 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'],
    stop: [rect(6, 6, 12, 12, 2.5)],
    redo: ['M21 12a9 9 0 1 1-3-6.7L21 8', 'M21 3v5h-5'],
  };
  const ic = (name, size = 20, sw = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(IC[name] || IC.sparkle).map((d) => `<path d="${d}"/>`).join('')}</svg>`;

  // ───────── Particle shapes for answers (the character morphs into these) ─────────
  const GRADS = {
    'ak-cat': ['#FFB86B', '#C2410C'], 'ak-sun': ['#FFE27A', '#F0661C'], 'ak-leaf': ['#8FCB4A', '#D9480F'],
    'ak-snouts': ['#A3C14A', '#2F6B1F'], 'ak-octo': ['#F783AC', '#7048E8'], 'ak-road': ['#8FB0FF', '#1A47B8'], 'ak-card': ['#F783AC', '#7048E8'],
  };
  function defineShapes() {
    if (!window.Brain || !Brain.defineIcon) return;
    const D = (name, fn) => Brain.defineIcon(name, fn, { grad: GRADS[name], scale: 0.95 });
    const hole = (x, on) => { x.globalCompositeOperation = on ? 'destination-out' : 'source-over'; };
    D('ak-cat', (x, S) => {
      x.beginPath(); x.arc(S * 0.5, S * 0.58, S * 0.3, 0, 6.283); x.fill();
      x.beginPath(); x.moveTo(S * 0.23, S * 0.48); x.lineTo(S * 0.25, S * 0.12); x.lineTo(S * 0.47, S * 0.32); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(S * 0.77, S * 0.48); x.lineTo(S * 0.75, S * 0.12); x.lineTo(S * 0.53, S * 0.32); x.closePath(); x.fill();
      x.lineWidth = S * 0.022;
      [[0.66, 0.04, 0.6], [0.7, 0.03, 0.72], [0.74, 0.06, 0.84]].forEach(([y, x2, y2]) => { x.beginPath(); x.moveTo(S * 0.3, S * y); x.lineTo(S * x2, S * y2 * 0.95); x.stroke(); x.beginPath(); x.moveTo(S * 0.7, S * y); x.lineTo(S * (1 - x2), S * y2 * 0.95); x.stroke(); });
      hole(x, true);
      x.beginPath(); x.ellipse(S * 0.39, S * 0.55, S * 0.04, S * 0.07, 0, 0, 6.283); x.fill();
      x.beginPath(); x.ellipse(S * 0.61, S * 0.55, S * 0.04, S * 0.07, 0, 0, 6.283); x.fill();
      x.beginPath(); x.moveTo(S * 0.46, S * 0.66); x.lineTo(S * 0.54, S * 0.66); x.lineTo(S * 0.5, S * 0.71); x.closePath(); x.fill();
      hole(x, false);
    });
    D('ak-sun', (x, S) => {
      x.beginPath(); x.arc(S / 2, S / 2, S * 0.3, 0, 6.283); x.fill();
      x.lineWidth = S * 0.05;
      for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; x.beginPath(); x.moveTo(S / 2 + Math.cos(a) * S * 0.38, S / 2 + Math.sin(a) * S * 0.38); x.lineTo(S / 2 + Math.cos(a) * S * 0.47, S / 2 + Math.sin(a) * S * 0.47); x.stroke(); }
    });
    D('ak-leaf', (x, S) => {
      x.beginPath(); x.moveTo(S * 0.5, S * 0.05); x.bezierCurveTo(S * 0.92, S * 0.24, S * 0.86, S * 0.7, S * 0.5, S * 0.86); x.bezierCurveTo(S * 0.14, S * 0.7, S * 0.08, S * 0.24, S * 0.5, S * 0.05); x.fill();
      x.lineWidth = S * 0.035; x.beginPath(); x.moveTo(S * 0.5, S * 0.84); x.lineTo(S * 0.5, S * 0.98); x.stroke();
      hole(x, true); x.lineWidth = S * 0.022;
      x.beginPath(); x.moveTo(S * 0.5, S * 0.16); x.lineTo(S * 0.5, S * 0.82); x.stroke();
      [0.3, 0.45, 0.6].forEach((y) => { x.beginPath(); x.moveTo(S * 0.5, S * (y + 0.1)); x.lineTo(S * 0.29, S * y); x.stroke(); x.beginPath(); x.moveTo(S * 0.5, S * (y + 0.1)); x.lineTo(S * 0.71, S * y); x.stroke(); });
      hole(x, false);
    });
    D('ak-snouts', (x, S) => {
      x.beginPath(); x.moveTo(S * 0.07, S * 0.92); x.lineTo(S * 0.07, S * 0.4); x.bezierCurveTo(S * 0.07, S * 0.12, S * 0.43, S * 0.12, S * 0.43, S * 0.4); x.lineTo(S * 0.43, S * 0.92); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(S * 0.57, S * 0.92); x.lineTo(S * 0.68, S * 0.22); x.quadraticCurveTo(S * 0.75, S * 0.05, S * 0.82, S * 0.22); x.lineTo(S * 0.93, S * 0.92); x.closePath(); x.fill();
      hole(x, true);
      [[0.2, 0.28], [0.3, 0.28], [0.72, 0.2], [0.78, 0.2]].forEach(([a, b]) => { x.beginPath(); x.arc(S * a, S * b, S * 0.018, 0, 6.283); x.fill(); });
      hole(x, false);
    });
    D('ak-octo', (x, S) => {
      x.beginPath(); x.ellipse(S * 0.5, S * 0.3, S * 0.21, S * 0.24, 0, 0, 6.283); x.fill();
      x.lineWidth = S * 0.05;
      for (let k = 0; k < 8; k++) {
        const u = (k - 3.5) / 3.5, sx = S * (0.5 + u * 0.15), ex = S * (0.5 + u * 0.44), ey = S * (0.86 - Math.abs(u) * 0.12);
        x.beginPath(); x.moveTo(sx, S * 0.46); x.bezierCurveTo(sx + u * S * 0.04, S * 0.66, ex - u * S * 0.14, S * 0.72, ex, ey);
        x.quadraticCurveTo(ex + u * S * 0.06, ey + S * 0.07, ex - u * S * 0.03, ey + S * 0.06); x.stroke();
      }
      hole(x, true); x.beginPath(); x.arc(S * 0.42, S * 0.33, S * 0.03, 0, 6.283); x.fill(); x.beginPath(); x.arc(S * 0.58, S * 0.33, S * 0.03, 0, 6.283); x.fill(); hole(x, false);
    });
    D('ak-road', (x, S) => {
      x.lineWidth = S * 0.05;
      x.beginPath(); x.moveTo(S * 0.14, S * 0.86); x.bezierCurveTo(S * 0.9, S * 0.86, S * 0.1, S * 0.5, S * 0.5, S * 0.5); x.bezierCurveTo(S * 0.9, S * 0.5, S * 0.1, S * 0.14, S * 0.86, S * 0.14); x.stroke();
      [[0.14, 0.86], [0.56, 0.75], [0.5, 0.5], [0.44, 0.25], [0.86, 0.14]].forEach(([a, b]) => { x.beginPath(); x.arc(S * a, S * b, S * 0.075, 0, 6.283); x.fill(); });
    });
    D('ak-card', (x, S) => {
      x.fill(new Path2D(rectPath(S * 0.22, S * 0.08, S * 0.56, S * 0.84, S * 0.07)));
      hole(x, true); x.lineWidth = S * 0.02; x.stroke(new Path2D(rectPath(S * 0.27, S * 0.13, S * 0.46, S * 0.74, S * 0.045)));
      x.beginPath(); const c = S / 2, r = S * 0.13; x.moveTo(c, c - r); x.quadraticCurveTo(c, c, c + r, c); x.quadraticCurveTo(c, c, c, c + r); x.quadraticCurveTo(c, c, c - r, c); x.quadraticCurveTo(c, c, c, c - r); x.fill();
      hole(x, false);
    });
  }
  const rectPath = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

  // Static dot-glyph of a shape (for places the one live canvas isn't)
  const glyphCache = {};
  function glyph(shape, palette, n = 520, r0 = 0.022) {
    const key = shape + '|' + palette + '|' + n;
    if (glyphCache[key]) return glyphCache[key];
    let pts = [];
    try { if (window.Brain && Brain.sample) pts = Brain.sample(Brain.has(shape) ? shape : 'brain', n); } catch (e) { pts = []; }
    const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const g = GRADS[shape] ? GRADS[shape].map(hex) : null;
    const pal = window.Brain && Brain.palette ? Brain.palette(palette) : [[127, 163, 255], [26, 71, 184]];
    let s = '<svg viewBox="-1.12 -1.12 2.24 2.24" aria-hidden="true" focusable="false">';
    for (const [x, y, z] of pts) {
      const t = g ? clamp((x + y + 2) / 4) : z, A0 = g ? g[0] : pal[0], A1 = g ? g[1] : pal[1];
      const c = A0.map((v, i) => Math.round(v + (A1[i] - v) * t)).join(',');
      s += `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${(r0 + r0 * z).toFixed(3)}" fill="rgb(${c})" opacity="${(0.5 + 0.5 * z).toFixed(2)}"/>`;
    }
    return (glyphCache[key] = s + '</svg>');
  }

  // ───────── The one brain canvas ─────────
  const BR = {
    host: null, lobes: 0,
    take(host, shape, palette, ms) {
      if (!window.Brain) return;
      if (this.host && this.host !== host && this.host.isConnected && this.host.dataset.glyph) parkGlyph(this.host);
      if (host) { const g = host.querySelector('.ak-glyph'); if (g) g.remove(); Brain.moveTo(host); }
      this.host = host;
      if (shape) this.shape(shape, palette, ms);
    },
    shape(name, palette, ms) {
      if (!window.Brain) return;
      if (name !== 'brain') this.setLobes(0);
      Brain.setShape(Brain.has(name) ? name : 'brain', palette || 'cobalt', ms || 1400);
    },
    mode(m) { if (window.Brain) Brain.setMode(m); },
    pulse() { if (window.Brain) Brain.pulse(); },
    setLobes(v) { this.lobes = v; if (window.Brain) Brain.setLobes(v); },
    form() { if (window.Brain && Brain.form) Brain.form(); },
  };
  function parkGlyph(host) {
    if (host.querySelector('.ak-glyph')) return;
    const d = document.createElement('div'); d.className = 'ak-glyph';
    d.innerHTML = glyph(host.dataset.shape || 'brain', host.dataset.palette || 'cobalt', 700, 0.02);
    host.appendChild(d);
  }

  // ───────── State ─────────
  let root, homeEl, chatEl, pagesEl, trailEl, backBtn, miniBtn, compForm, mapHost, popEl = null;
  let view = 'home', mounted = false, shown = false, hooksRan = false;
  const convos = new Map(); // rootKey → convo
  let order = [];           // convo keys, most recent first
  let cur = null;           // the open convo
  const EXP = new Set();    // explored keys (answers + terms): explored terms change style
  const emitted = new Set();
  let pendingBranch = null, mapView = null, histView = null, bView = null;
  const locked = new Set();
  let cState = { mode: 'type', timers: [] };

  // A convo is one tree: the root question and every branch off it. Each node owns one chat page.
  function newConvo(key, o = {}) {
    const a = A[key];
    const c = { key, nodes: new Map(), current: null, past: !!o.past, when: o.when || 'Just now', src: o.src };
    const label = a ? a.label : shortQ(o.q || key);
    c.nodes.set(key, { id: key, kind: a ? 'answer' : 'generic', parent: null, label, crumb: a ? a.short : shortQ(o.q || key, 22),
      q: o.q || (a ? a.q : key), shape: a ? a.shape : (C.kinds[o.type] || {}).shape || 'qmark', palette: a ? a.palette : 'cobalt', type: o.type, page: null, past: !!o.past });
    convos.set(key, c);
    order = [key].concat(order.filter((k) => k !== key));
    return c;
  }
  function addBranchNode(c, tid, parentId, o = {}) {
    const t = T[tid];
    const n = { id: tid, kind: 'term', parent: parentId, label: cap(t.label), crumb: t.label, q: t.q, shape: t.shape, palette: t.palette, page: null, past: !!o.past };
    c.nodes.set(tid, n);
    return n;
  }
  const shortQ = (q, n = 34) => { const s = String(q).replace(/\?$/, '').trim(); return s.length > n ? s.slice(0, n - 1).trim() + '…' : cap(s); };
  const rootOf = (c) => c.nodes.get(c.key);
  function pathTo(c, id) { const out = []; for (let n = c.nodes.get(id); n; n = n.parent ? c.nodes.get(n.parent) : null) out.unshift(n); return out; }

  // ───────── Classify a typed question (simple keyword rules) ─────────
  function kindOf(t) {
    if (/\b(vs\.?|versus)\b|difference between|compared? (to|with)|which is (better|bigger|faster|older)/.test(t)) return 'compare';
    if (/^how (big|far|old|small|long|tall|heavy|deep|hot|fast|many|much|wide)\b/.test(t)) return 'scale';
    if (/^(teach me|help me learn|i want to learn|how (do|can) i (learn|get better|start))|\blearn (to|how)\b|\bcourse\b|get (good|better) at/.test(t)) return 'course';
    if (/^(make|create|draw|design|write|build)\b|\bquiz me\b|\bposter\b|cheat ?sheet|flash ?cards?|trading card/.test(t)) return 'artifact';
    if (/^(is it true|is it a myth|is|are|do|does|did|can|will)\b|\bmyth\b|true that|\breally\b/.test(t)) return 'myth';
    return 'explain';
  }
  function classify(text) {
    const raw = String(text || '').trim(), t = raw.toLowerCase();
    if (A[t]) return { id: t };
    const hit = Object.values(A).find((a) => (a.match || []).some((r) => r.test(t)));
    if (hit && !(hit.id === 'sun' && !/(big|size|large|huge|wide|small)/.test(t))) return { id: hit.id };
    return { type: kindOf(t), q: raw };
  }

  // ───────── Rich text: glowing terms + word-by-word streaming ─────────
  function termHTML(id, txt, cls = '', style = '') {
    const done = EXP.has(id);
    return `<button type="button" class="ak-term${done ? ' is-done' : ''}${cls}" data-act="term" data-term="${id}"${style}><span class="ak-term-ic">${ic(done ? 'check' : 'sparkle', 12, 2.4)}</span>${esc(txt)}</button>`;
  }
  let wi = 0;
  function rich(s, stream = false) {
    return String(s).split(/(\[\[[^\]]+\]\])/).map((tok) => {
      const m = tok.match(/^\[\[(\w+)(?:\|([^\]]+))?\]\]$/);
      if (m) {
        if (!T[m[1]]) return esc(m[2] || m[1]);
        return stream ? termHTML(m[1], m[2] || T[m[1]].label, ' ak-w', ` style="--i:${wi++}"`) : termHTML(m[1], m[2] || T[m[1]].label);
      }
      if (!stream) return esc(tok);
      return tok.split(/(\s+)/).map((w) => (/^\s*$/.test(w) ? w : `<span class="ak-w" style="--i:${wi++}">${esc(w)}</span>`)).join('');
    }).join('');
  }
  function splitFirst(s) { // first sentence (visible on free) + the rest
    const m = String(s).match(/^(.+?[.!?])\s+(.+)$/s);
    return m ? [m[1], m[2]] : [s, ''];
  }
  function refreshTerms() {
    root.querySelectorAll('.ak-term').forEach((b) => {
      const done = EXP.has(b.dataset.term);
      if (b.classList.contains('is-done') === done) return;
      b.classList.toggle('is-done', done);
      b.querySelector('.ak-term-ic').innerHTML = ic(done ? 'check' : 'sparkle', 12, 2.4);
    });
  }

  // ───────── Blocks ─────────
  const head = (b) => (b.title ? `<header class="ak-sec-head">${b.eyebrow ? `<p class="ak-eyebrow">${esc(b.eyebrow)}</p>` : ''}<h3 class="ak-h3">${esc(b.title)}</h3>${b.intro ? `<p class="ak-intro">${rich(b.intro)}</p>` : ''}</header>` : '');
  const seg = (labels, act, on = 0, cls = '') => `<div class="ak-seg ${cls}" role="tablist" style="--n:${labels.length};--i:${on}"><i class="ak-seg-thumb" aria-hidden="true"></i>${labels.map((l, k) => `<button type="button" role="tab" data-act="${act}" data-i="${k}" aria-selected="${k === on}">${esc(l)}</button>`).join('')}</div>`;
  function setSeg(sec, act, i) {
    const s = sec.querySelector(`[data-act="${act}"]`).closest('.ak-seg');
    s.style.setProperty('--i', i);
    s.querySelectorAll('button').forEach((x, k) => x.setAttribute('aria-selected', k === i));
  }
  const pointsHTML = (items) => `<ul class="ak-points">${items.map((p) => `<li><span class="ak-points-ic">${ic(p[0], 19)}</span><div><h4 class="ak-h4">${rich(p[1])}</h4><p class="ak-body">${rich(p[2])}</p></div></li>`).join('')}</ul>`;
  const snoutSVG = (k, cls = '') => k === 'u'
    ? `<svg class="ak-snout ${cls}" viewBox="0 0 120 150" aria-hidden="true"><defs><linearGradient id="akSnU${cls}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E7D2A"/><stop offset="1" stop-color="#2B3F14"/></linearGradient></defs><path d="M14 150V64C14 22 106 22 106 64v86z" fill="url(#akSnU${cls})"/><circle cx="48" cy="40" r="3.5" fill="#1B2A0B"/><circle cx="72" cy="40" r="3.5" fill="#1B2A0B"/><ellipse cx="34" cy="118" rx="7" ry="9" fill="#C9D98F"/><ellipse cx="86" cy="118" rx="7" ry="9" fill="#C9D98F"/></svg>`
    : `<svg class="ak-snout ${cls}" viewBox="0 0 120 150" aria-hidden="true"><defs><linearGradient id="akSnV${cls}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9BA864"/><stop offset="1" stop-color="#56622C"/></linearGradient></defs><path d="M22 150L50 26Q60 4 70 26L98 150z" fill="url(#akSnV${cls})"/><circle cx="55" cy="26" r="3" fill="#2D3412"/><circle cx="65" cy="26" r="3" fill="#2D3412"/><ellipse cx="34" cy="122" rx="6" ry="9" fill="#E6E2B8"/><ellipse cx="86" cy="122" rx="6" ry="9" fill="#E6E2B8"/></svg>`;

  const R = {
    points: (b) => `${head(b)}${pointsHTML(b.items)}`,
    guess: (b) => `${head(b)}<div class="ak-opts">${b.options.map((o, k) => `<button type="button" class="ak-opt" data-act="guess" data-i="${k}"><span class="ak-opt-ic">${ic(o[0], 19)}</span><span class="ak-opt-t">${esc(o[1])}</span><span class="ak-opt-mark" aria-hidden="true"></span></button>`).join('')}</div><div data-reveal></div>`,
    larynx: (b) => `${head(b)}
      <div class="ak-lx" data-lx>
        <svg viewBox="0 0 300 176" class="ak-lx-svg" role="img" aria-label="A cat's vocal folds seen from above">
          <defs><radialGradient id="akLxBg" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#FBE3E8"/><stop offset="1" stop-color="#F2C2CD"/></radialGradient></defs>
          <ellipse cx="150" cy="86" rx="118" ry="74" fill="url(#akLxBg)"/>
          <ellipse cx="150" cy="86" rx="118" ry="74" fill="none" stroke="#E7A6B6" stroke-width="2"/>
          <path data-gap fill="#4A1426"/>
          <path data-fl fill="#FFF4F6" stroke="#E7A6B6" stroke-width="1.5"/>
          <path data-fr fill="#FFF4F6" stroke="#E7A6B6" stroke-width="1.5"/>
          <circle data-al cy="146" r="10" fill="#F4C3CF" stroke="#E7A6B6" stroke-width="1.5"/><circle data-ar cy="146" r="10" fill="#F4C3CF" stroke="#E7A6B6" stroke-width="1.5"/>
          <g data-air></g>
          <text x="150" y="20" text-anchor="middle" class="ak-lx-t">front</text>
          <text x="58" y="96" class="ak-lx-t">vocal fold</text><text x="242" y="96" text-anchor="end" class="ak-lx-t">vocal fold</text><text x="150" y="174" text-anchor="middle" class="ak-lx-t">back</text>
        </svg>
        <svg viewBox="0 0 300 40" class="ak-lx-wave" aria-hidden="true"><path data-wave d="M0 20H300"/></svg>
        <p class="ak-lx-slow" data-slow>Slowed down at least 10×</p>
      </div>
      <div class="ak-lx-ctrl">${seg(b.breath, 'breath', 1, 'ak-seg-sm')}<button type="button" class="ak-hold" data-act="hold" aria-pressed="false">${ic('pad', 20)}<span>Hold to purr</span></button></div>
      <p class="ak-cap" data-cap>${esc(b.idle)}</p>`,
    pigments: (b) => `${head(b)}
      <div class="ak-pg" data-pg>
        <svg viewBox="0 0 120 150" class="ak-pg-leaf" aria-hidden="true"><defs><linearGradient id="akPgG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" data-s0 style="stop-color:${b.stages[0].col[0]}"/><stop offset="1" data-s1 style="stop-color:${b.stages[0].col[1]}"/></linearGradient></defs>
          <path d="M60 6C104 26 100 96 60 128 20 96 16 26 60 6z" fill="url(#akPgG)"/><path d="M60 126v20" stroke="#6B4A2B" stroke-width="4" stroke-linecap="round"/>
          <path d="M60 22v100M60 50L36 38M60 50l24-12M60 72L32 60M60 72l28-12M60 94L38 84M60 94l22-10" stroke="rgba(255,255,255,.55)" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>
        <div class="ak-pg-bars">${[['chl', 'Chlorophyll', 'green'], ['car', 'Carotenoids', 'yellow'], ['ant', 'Anthocyanins', 'red']].map(([k, n, c]) => `<div class="ak-pg-row"><span class="ak-pg-k">${n}<i>${c}</i></span><span class="ak-pg-bar is-${k}"><b data-bar="${k}" style="transform:scaleX(${b.stages[0][k]})"></b></span></div>`).join('')}</div>
      </div>
      ${seg(b.stages.map((s) => s.name), 'stage', 0, 'ak-seg-sm')}
      <p class="ak-cap" data-cap>${esc(b.stages[0].cap)}</p>${b.note ? `<p class="ak-note">${esc(b.note)}</p>` : ''}`,
    compare: (b) => `${head(b)}${seg([b.a, b.b], 'cmp', 0)}
      <div class="ak-cmp" data-side="0">
        <div class="ak-cmp-head"><div class="c0">${snoutSVG('u', 'h0')}<span>${esc(b.a)}</span></div><div class="c1">${snoutSVG('v', 'h1')}<span>${esc(b.b)}</span></div></div>
        ${b.rows.map((r) => `<div class="ak-cmp-row"><p class="ak-cmp-k">${esc(r[0])}</p><div class="ak-cmp-cells"><p class="c0">${rich(r[1])}</p><p class="c1">${rich(r[2])}</p></div></div>`).join('')}
      </div>
      <p class="ak-verdict" data-verdict data-side="0">${ic('sparkle', 16)}<span>${esc(b.verdict[0])}</span></p>`,
    spot: (b) => `${head(b)}<div class="ak-spot" data-spot data-r="0"></div>`,
    scale: (b) => `${head(b)}
      <div class="ak-sc" data-sc><svg class="ak-sc-svg" data-scsvg aria-hidden="true"></svg><p class="ak-sc-scale" data-scl></p></div>
      ${seg(b.steps.map((s) => b.bodies.find((x) => x.id === s.focus).name), 'zoom', 0, 'ak-seg-sm ak-seg-4')}
      <p class="ak-cap" data-cap>${esc(b.steps[0].cap)}</p>`,
    stats: (b) => `${head(b)}<div class="ak-stats">${b.items.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('')}</div>`,
    verdict: (b) => `<div class="ak-myth is-${b.kind}"><span class="ak-myth-ic">${ic(b.kind === 'myth' ? 'x' : 'check', 18, 2.8)}</span><div><p class="ak-myth-k">${esc(b.title)}</p><p class="ak-myth-t">${esc(b.text)}</p></div></div>`,
    lobes: (b) => `${head(b)}${seg(b.options.map((o) => o[0]), 'lobes', 0)}<p class="ak-cap" data-cap>${esc(b.options[0][2])}</p>`,
    myths: (b) => `${head(b)}<div class="ak-mc" data-mc data-i="0" data-score="0"></div>`,
    course: (b) => `<div class="ak-course">
        <p class="ak-eyebrow">${ic('sparkle', 14)} ${esc(b.eyebrow)}</p><h3 class="ak-h3">${esc(b.title)}</h3><p class="ak-course-meta">${esc(b.meta)}</p>
        <ol class="ak-stops">${b.stops.map(([t, s], k) => `<li style="--i:${k}"><span class="ak-stop-n">${k + 1}</span><div><b>${esc(t)}</b><span>${esc(s)}</span></div></li>`).join('')}</ol>
        <button type="button" class="btn-lit ak-build" data-act="build">Build course</button>
        <button type="button" class="ak-ghost" data-act="tip">Just one tip for now</button>
      </div><div data-tipbox></div>`,
    card: (b) => `${seg(['Trading card', 'Friend quiz'], 'cardmode', 0)}
      <div class="ak-tc-wrap" data-tcwrap>
        <div class="ak-tc" data-tc>
          <div class="ak-tc-face ak-tc-front" data-act="flip" aria-hidden="true">
            <div class="ak-tc-top"><b>${esc(b.name)}</b><span>${esc(b.tag)}</span></div>
            <div class="ak-tc-art">${glyph('ak-octo', 'arts', 900, 0.022)}</div>
            <div class="ak-tc-stats">${b.stats.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('')}</div>
            <p class="ak-tc-no">${esc(b.no)}</p>
          </div>
          <div class="ak-tc-face ak-tc-back">
            <p class="ak-tc-bk">Superpowers</p>
            ${b.back.map(([t, d]) => `<div class="ak-tc-fact"><b>${rich(t)}</b><span>${esc(d)}</span></div>`).join('')}
            <p class="ak-tc-no">${esc(b.no)}</p>
          </div>
        </div>
        <button type="button" class="ak-ghost ak-flip" data-act="flip">${ic('flip', 17)} <span>Flip card</span></button>
      </div>
      <div class="ak-quiz" data-quiz hidden></div>`,
    wave: (b) => `${head(b)}<div class="ak-wv"><svg viewBox="0 0 300 90" aria-hidden="true"><path data-wv d=""/></svg></div>
      <div class="ak-range"><span>${esc(b.lo)}</span><input type="range" min="1" max="12" value="3" data-act="wave" aria-label="Vibrations per second"><span>${esc(b.hi)}</span></div>
      <p class="ak-cap" data-cap>${esc(b.cap[0])}</p>`,
  };

  // ───────── Chat pages and turns ─────────
  function buildPage(c, node) {
    const el = document.createElement('div');
    el.className = 'ak-page is-off'; el.dataset.node = node.id;
    el.innerHTML = `<div class="ak-thread"></div>`;
    el.addEventListener('scroll', () => { if (popEl) closePop(); }, { passive: true });
    pagesEl.appendChild(el);
    node.page = el; node.turns = [];
    return el;
  }
  function turnSpec(node) {
    if (node.kind === 'answer') return { kind: 'answer', a: A[node.id], q: node.q };
    if (node.kind === 'term') return { kind: 'term', t: T[node.id], tid: node.id, q: node.q };
    return { kind: 'generic', type: node.type, q: node.q };
  }
  function turnHTML(spec) {
    wi = 0;
    let lead, blocks = '', foot = '', shape, palette;
    if (spec.kind === 'answer') {
      const a = spec.a; shape = a.shape; palette = a.palette;
      lead = a.lead;
      blocks = a.blocks.map((b, k) => `<section class="ak-sec${['course', 'card', 'verdict'].includes(b.type) ? ' is-bare' : ''}" data-type="${b.type}" data-b="${k}">${R[b.type](b)}</section>`).join('');
      if (a.sources) foot = `<p class="ak-src">Sources: ${esc(a.sources)}</p>`;
    } else if (spec.kind === 'term') {
      const t = spec.t; shape = t.shape; palette = t.palette; lead = t.lead;
      if (t.block) blocks += `<section class="ak-sec" data-type="${t.block.type}" data-tb="1">${R[t.block.type](t.block)}</section>`;
      if (t.points) blocks += `<section class="ak-sec" data-type="points">${pointsHTML(t.points)}</section>`;
    } else {
      const k = C.kinds[spec.type] || C.kinds.explain; shape = k.shape; palette = 'cobalt';
      lead = `That’s ${k.name}. Here I’d answer it with ${k.gets}.`;
      blocks = `<section class="ak-sec" data-type="near"><header class="ak-sec-head"><p class="ak-eyebrow">Ready in this demo</p><h3 class="ak-h3">The closest answer I have</h3><p class="ak-intro">This prototype has a few answers fully built. The real app makes one for any question.</p></header>
        <div class="ak-rows">${k.near.map((id) => row(A[id].q, `data-act="ask" data-q="${id}"`)).join('')}</div></section>`;
    }
    const [l1, l2] = splitFirst(lead);
    const first = rich(l1, true), rest = l2 ? ' <span class="ak-lead-2">' + rich(l2, true) + '</span>' : '';
    return { shape, palette, html: `
      <div class="ak-q"><p>${esc(spec.q)}</p></div>
      <div class="ak-a">
        <div class="ak-vis"><div class="ak-host" data-glyph="1" data-shape="${shape}" data-palette="${palette}"></div><p class="ak-think" aria-live="polite">Thinking</p><p class="ak-touch">${ic('hand', 14, 2)} Touch it</p></div>
        <p class="ak-lead"><span class="ak-lead-1">${first}</span>${rest}</p>
        <div class="ak-rest">${blocks}${foot}</div>
        <div class="ak-lockpill"><button type="button" class="ak-unlock" data-act="unlock">${ic('lock', 16, 2.4)} Unlock with Plus</button></div>
      </div>` };
  }
  const row = (q, attrs, done = false) => `<button type="button" class="ak-row${done ? ' is-done' : ''}" ${attrs}><span class="ak-row-ic">${ic(done ? 'check' : 'sparkle', 18, done ? 2.6 : 2)}</span><span class="ak-row-q">${esc(q)}</span><span class="ak-row-chev">${ic('chev', 18, 2.2)}</span></button>`;

  // Add a turn to a page and play it: the bubble, the character thinking, the morph, the answer streaming in.
  function addTurn(node, spec, o = {}) {
    const page = node.page, th = page.querySelector('.ak-thread');
    const t = turnHTML(spec);
    const el = document.createElement('div'); el.className = 'ak-turn'; el.innerHTML = t.html;
    th.appendChild(el);
    const turn = { el, spec, node, shape: t.shape, palette: t.palette, host: el.querySelector('.ak-host'), key: spec.kind === 'answer' ? spec.a.id : spec.kind === 'term' ? spec.tid : null, isTerm: spec.kind === 'term' };
    node.turns.push(turn);
    initBlocks(el, turn);
    play(turn, o);
    return turn;
  }
  function play(turn, o) {
    const el = turn.el, instant = o.instant || still();
    const gate = !!o.gate;
    if (instant) {
      el.classList.add('is-q', 'is-shown', 'is-done', 'is-instant');
      BR.take(turn.host, turn.shape, turn.palette, o.instant ? 900 : 10);
      if (turn.key === 'brain') BR.setLobes(0.4);
      if (gate && !isPlus()) lock(turn, true); else reveal(turn);
      return;
    }
    requestAnimationFrame(() => el.classList.add('is-q'));
    const think = !o.noThink;
    BR.take(turn.host, think ? 'brain' : turn.shape, think ? 'cobalt' : turn.palette, think ? 700 : 900);
    BR.mode('idle');
    if (think) { el.classList.add('is-thinking'); BR.mode('think'); }
    later(() => {
      el.classList.remove('is-thinking'); el.classList.add('is-shown');
      BR.mode('idle'); BR.shape(turn.shape, turn.palette, 1500); BR.pulse();
      if (turn.key === 'brain') later(() => BR.setLobes(0.4), 900);
      later(() => {
        if (gate && !isPlus()) lock(turn);
        else { el.classList.add('is-done'); reveal(turn); }
      }, gate ? 1500 : 900);
    }, think ? 1150 : 120);
  }
  function reveal(turn) {
    if (turn.spec.kind === 'generic') return;
    markExplored(turn.key, turn.isTerm);
  }
  // Free plan: the answer starts to form, then blurs, then the paywall opens. Never a locked box up front.
  function lock(turn, quiet) {
    turn.el.classList.add('is-locked');
    locked.add(turn);
    const rest = turn.el.querySelector('.ak-rest'), pill = turn.el.querySelector('.ak-lockpill');
    if (rest && pill) pill.style.top = (rest.offsetTop + 36) + 'px';
    if (quiet) { turn.el.classList.add('is-pill'); return; }
    later(() => {
      if (!locked.has(turn)) return;
      const a = app();
      if (a && a.paywall && !isPlus()) a.paywall('ask'); else turn.el.classList.add('is-pill');
    }, 650);
  }
  function unlockAll() {
    locked.forEach((turn) => {
      turn.el.classList.remove('is-locked', 'is-pill');
      turn.el.classList.add('is-unlocking', 'is-done');
      setTimeout(() => turn.el.classList.remove('is-unlocking'), 900);
      reveal(turn);
    });
    locked.clear();
  }
  function markExplored(key, isTerm) {
    if (!key) return;
    const d = isTerm ? T[key] : A[key]; if (!d) return;
    EXP.add(key); refreshTerms();
    const id = 'ask:' + key;
    if (window.Store) { const s = Store.get(); if (!s.explored.includes(id)) Store.set({ explored: s.explored.concat(id) }); }
    if (emitted.has(id)) return; emitted.add(id);
    emit('explored', { id, label: isTerm ? cap(d.label) : d.label, subject: d.subject, shape: d.shape, palette: d.palette, from: 'ask' });
  }

  // ───────── Block behaviour ─────────
  function initBlocks(el, turn) {
    el.querySelectorAll('[data-spot]').forEach((s) => renderSpot(s, blockData(s)));
    el.querySelectorAll('[data-mc]').forEach((s) => renderMyth(s, blockData(s)));
    el.querySelectorAll('[data-sc]').forEach((s) => { const sec = s.closest('.ak-sec'); sec._sc = { z: 0, from: 0, to: 0, t0: 0 }; drawScale(sec, blockData(s), 0); });
    el.querySelectorAll('[data-lx]').forEach((s) => drawLarynx(s.closest('.ak-sec'), 1, 0));
    el.querySelectorAll('[data-wv]').forEach((p) => drawWave(p, 3));
    el.querySelectorAll('[data-tc]').forEach((s) => { s.closest('.ak-sec')._turn = turn; });
  }
  function blockData(elIn) {
    const sec = elIn.closest('.ak-sec'), turnEl = sec.closest('.ak-turn');
    const t = findTurn(turnEl); if (!t) return null;
    if (sec.dataset.tb) return t.spec.t.block;
    return t.spec.kind === 'answer' ? t.spec.a.blocks[+sec.dataset.b] : null;
  }
  function findTurn(turnEl) {
    for (const c of convos.values()) for (const n of c.nodes.values()) for (const t of n.turns || []) if (t.el === turnEl) return t;
    return null;
  }

  function pickGuess(sec, b, i) {
    if (sec.classList.contains('is-answered')) return;
    sec.classList.add('is-answered');
    sec.querySelectorAll('.ak-opt').forEach((o, k) => {
      o.disabled = true; const mark = o.querySelector('.ak-opt-mark');
      if (k === b.answer) { o.classList.add('is-right'); mark.innerHTML = ic('check', 17, 2.8); }
      else if (k === i) { o.classList.add('is-wrong'); mark.innerHTML = ic('x', 17, 2.8); }
      else o.classList.add('is-dim');
    });
    const right = i === b.answer;
    sec.querySelector('[data-reveal]').innerHTML = `<div class="ak-reveal ${right ? 'ok' : 'no'}"><p class="ak-reveal-k">${ic(right ? 'check' : 'alert', 16, 2.6)}${right ? 'You got it' : 'Not quite'}</p><p class="ak-body">${rich(b.explain)}</p><button type="button" class="ak-link" data-act="guess-reset">Try again</button></div>`;
    BR.pulse();
  }
  function resetGuess(sec) {
    sec.classList.remove('is-answered');
    sec.querySelectorAll('.ak-opt').forEach((o) => { o.disabled = false; o.classList.remove('is-right', 'is-wrong', 'is-dim'); o.querySelector('.ak-opt-mark').innerHTML = ''; });
    sec.querySelector('[data-reveal]').innerHTML = '';
  }

  // Larynx: the vocal folds snap open and shut while you hold
  function drawLarynx(sec, open, t) {
    const L = 150 - 4 - open * 40, Rr = 150 + 4 + open * 40, top = 34, bot = 140;
    const q = (s) => sec.querySelector(s);
    q('[data-gap]').setAttribute('d', `M150 ${top}L${L} ${bot}Q150 ${bot + 6} ${Rr} ${bot}Z`);
    q('[data-fl]').setAttribute('d', `M149 ${top}L${L} ${bot}Q${L - 13} ${bot + 6} ${L - 26} ${bot - 2}L143 ${top + 7}Z`);
    q('[data-fr]').setAttribute('d', `M151 ${top}L${Rr} ${bot}Q${Rr + 13} ${bot + 6} ${Rr + 26} ${bot - 2}L157 ${top + 7}Z`);
    q('[data-al]').setAttribute('cx', L - 12); q('[data-ar]').setAttribute('cx', Rr + 12);
  }
  function holdPurr(sec, on) {
    const st = sec._lx || (sec._lx = { on: false, raf: 0, t0: 0, dir: 1 });
    if (st.on === on) return;
    st.on = on;
    const btn = sec.querySelector('[data-act="hold"]'); btn.setAttribute('aria-pressed', on); btn.classList.toggle('is-on', on);
    const b = blockData(sec.querySelector('[data-lx]'));
    sec.querySelector('[data-cap]').textContent = on ? b.on : b.idle;
    sec.querySelector('[data-lx]').classList.toggle('is-on', on);
    const turn = findTurn(sec.closest('.ak-turn'));
    if (turn && BR.host === turn.host) BR.mode(on ? 'listen' : 'idle');
    if (on && !st.raf) { st.t0 = performance.now(); loop(); }
    function loop() {
      const now = performance.now(), t = (now - st.t0) / 1000;
      const amp = st.on ? 1 : Math.max(0, 1 - (now - (st.off || now)) / 300);
      const open = st.on ? 0.06 + 0.5 * Math.abs(Math.sin(t * Math.PI * 2.5)) : lerp(1, 0.3, amp);
      drawLarynx(sec, open, t);
      // the waveform: low and steady while purring
      let d = ''; for (let x = 0; x <= 300; x += 4) { const y = 20 + (st.on ? 12 * Math.sin((x / 300) * 6.283 * 5 - t * 9) * Math.sin(x / 300 * Math.PI) : 0); d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`; }
      sec.querySelector('[data-wave]').setAttribute('d', d);
      // air: dots drifting through the gap (up when breathing out)
      const air = sec.querySelector('[data-air]'), dir = st.dir;
      let s = ''; if (st.on) for (let k = 0; k < 7; k++) { const ph = ((t * 0.9 + k / 7) % 1), y = dir > 0 ? 140 - ph * 110 : 34 + ph * 110; s += `<circle cx="${(150 + Math.sin(k * 2.1 + t * 8) * 3 * (1 - Math.abs(y - 86) / 80)).toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="#fff" opacity="${(0.85 * Math.sin(ph * Math.PI)).toFixed(2)}"/>`; }
      air.innerHTML = s;
      if (st.on || amp > 0) st.raf = requestAnimationFrame(loop); else { st.raf = 0; drawLarynx(sec, 1, 0); sec.querySelector('[data-wave]').setAttribute('d', 'M0 20H300'); air.innerHTML = ''; }
    }
    if (!on) st.off = performance.now();
    if (still() && !on) { cancelAnimationFrame(st.raf); st.raf = 0; drawLarynx(sec, 1, 0); }
  }
  function setBreath(sec, i) {
    setSeg(sec, 'breath', i);
    const st = sec._lx || (sec._lx = { on: false, raf: 0, dir: 1 }); st.dir = i === 1 ? 1 : -1;
    const b = blockData(sec.querySelector('[data-lx]'));
    sec.querySelector('[data-cap]').textContent = b.breathText[i];
    pop(sec.querySelector('[data-cap]'));
  }
  const pop = (el) => { el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop'); };

  function setPigment(sec, b, i) {
    setSeg(sec, 'stage', i);
    const s = b.stages[i];
    sec.querySelector('[data-s0]').style.stopColor = s.col[0]; sec.querySelector('[data-s1]').style.stopColor = s.col[1];
    ['chl', 'car', 'ant'].forEach((k) => { sec.querySelector(`[data-bar="${k}"]`).style.transform = `scaleX(${s[k]})`; });
    const cp = sec.querySelector('[data-cap]'); cp.textContent = s.cap; pop(cp);
    BR.pulse();
  }
  function setCompare(sec, b, i) {
    setSeg(sec, 'cmp', i);
    sec.querySelector('.ak-cmp').dataset.side = i;
    const v = sec.querySelector('[data-verdict]'); v.dataset.side = i; v.querySelector('span').textContent = b.verdict[i]; pop(v);
  }
  function renderSpot(el, b) {
    if (!b) return;
    const r = +el.dataset.r;
    if (r >= b.rounds.length) {
      el.innerHTML = `<div class="ak-spot-end"><p class="ak-spot-score">${ic('check', 18, 2.8)} ${el.dataset.score || 0} of ${b.rounds.length}</p><p class="ak-body">Wide U: alligator. Narrow V: crocodile.</p><button type="button" class="ak-link" data-act="spot-again">Play again</button></div>`;
      return;
    }
    const rd = b.rounds[r];
    el.innerHTML = `<div class="ak-spot-pic">${snoutSVG(rd.snout, 'sp' + r)}<span class="ak-spot-n">${r + 1} of ${b.rounds.length}</span></div>
      <p class="ak-spot-q">Who’s this, seen from above?</p>
      <div class="ak-spot-opts"><button type="button" class="ak-opt ak-opt-c" data-act="spot" data-i="0">Alligator<span class="ak-opt-mark"></span></button><button type="button" class="ak-opt ak-opt-c" data-act="spot" data-i="1">Crocodile<span class="ak-opt-mark"></span></button></div>
      <p class="ak-spot-fb" data-fb></p>`;
  }
  function pickSpot(el, b, i) {
    const r = +el.dataset.r, rd = b.rounds[r]; if (el.dataset.locked) return;
    el.dataset.locked = '1';
    const right = i === rd.answer;
    el.querySelectorAll('[data-act="spot"]').forEach((o, k) => { o.disabled = true; if (k === rd.answer) { o.classList.add('is-right'); o.querySelector('.ak-opt-mark').innerHTML = ic('check', 16, 2.8); } else if (k === i) { o.classList.add('is-wrong'); o.querySelector('.ak-opt-mark').innerHTML = ic('x', 16, 2.8); } else o.classList.add('is-dim'); });
    if (right) el.dataset.score = (+el.dataset.score || 0) + 1;
    el.querySelector('[data-fb]').innerHTML = `${right ? 'Yes.' : 'Not this time.'} ${rd.snout === 'u' ? 'A wide, rounded U is an alligator.' : 'A narrow, pointed V is a crocodile.'} <button type="button" class="ak-link" data-act="spot-next">${r + 1 < b.rounds.length ? 'Next' : 'See score'}</button>`;
    BR.pulse();
  }
  // Scale zoom: every body drawn to scale; zooming out shrinks the last one to a dot
  function scaleLayout(b, fi) {
    const W = 304, H = 210, D = 150;
    const f = b.bodies.find((x) => x.id === b.steps[fi].focus);
    const k = D / f.km;
    let x = 0; const pos = b.bodies.map((bd) => { const r = (bd.km * k) / 2; const cx = x + r; x = cx + r + 8; return { bd, r, cx }; });
    const fp = pos.find((p) => p.bd.id === f.id);
    const shift = W * 0.56 - fp.cx;
    return { k, pos, shift, W, H, fid: f.id };
  }
  function drawScale(sec, b, z) { // z: fractional step index
    const i0 = Math.floor(z), i1 = Math.min(b.steps.length - 1, i0 + 1), t = z - i0;
    const A0 = scaleLayout(b, i0), A1 = scaleLayout(b, i1);
    const lk = Math.exp(lerp(Math.log(A0.k), Math.log(A1.k), t));
    const H = A0.H, W = A0.W, cy = H / 2 + 6;
    // positions at the interpolated scale, anchored so the focus slides smoothly
    let x = 0; const pos = b.bodies.map((bd) => { const r = (bd.km * lk) / 2; const cx = x + r; x = cx + r + 8; return { bd, r, cx }; });
    const fx0 = pos.find((p) => p.bd.id === A0.fid), fx1 = pos.find((p) => p.bd.id === A1.fid);
    const shift = lerp(W * 0.56 - fx0.cx, W * 0.56 - fx1.cx, inOut(t));
    let s = `<defs>${b.bodies.map((bd) => `<radialGradient id="akSc${bd.id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${bd.col[0]}"/><stop offset="1" stop-color="${bd.col[1]}"/></radialGradient>`).join('')}</defs>`;
    const prev = b.steps[Math.max(0, Math.round(z) - 1)].focus;
    pos.forEach((p) => {
      const cx = p.cx + shift, r = p.r, vis = r * 2 < H * 3.2;
      if (!vis) return;
      if (r > 0.7) s += `<circle cx="${cx.toFixed(2)}" cy="${cy}" r="${r.toFixed(2)}" fill="url(#akSc${p.bd.id})"${p.bd.id === 'sun' || p.bd.id === 'betel' ? ' class="ak-sc-glow"' : ''}/>`;
      else s += `<circle cx="${cx.toFixed(2)}" cy="${cy}" r="1.3" fill="${p.bd.col[0]}"/>`;
      if (cx > -20 && cx < W + 20) {
        if (r * 2 >= 26) s += `<text x="${cx.toFixed(1)}" y="${(cy + Math.min(r, H / 2 - 18) + 16).toFixed(1)}" text-anchor="middle" class="ak-sc-l">${p.bd.name}</text>`;
        else if (p.bd.id === prev || r * 2 >= 3) s += `<line x1="${cx.toFixed(1)}" y1="${cy - Math.max(r, 2) - 4}" x2="${cx.toFixed(1)}" y2="${cy - 30}" class="ak-sc-tick"/><text x="${cx.toFixed(1)}" y="${cy - 36}" text-anchor="middle" class="ak-sc-l ak-sc-s">${p.bd.name}</text>`;
      }
    });
    const svg = sec.querySelector('[data-scsvg]'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = s;
    const fb = b.bodies.find((x) => x.id === b.steps[Math.round(z)].focus);
    sec.querySelector('[data-scl]').textContent = fb.id === 'betel' ? 'Betelgeuse: hundreds of Suns wide' : `${fb.name}: about ${fb.km >= 1e6 ? (fb.km / 1e6).toFixed(1) + ' million' : (Math.round(fb.km / 100) * 100).toLocaleString('en-GB')} km wide`;
  }
  function zoomScale(sec, b, i) {
    setSeg(sec, 'zoom', i);
    const st = sec._sc; const from = st.z, to = i;
    const cp = sec.querySelector('[data-cap]'); cp.textContent = b.steps[i].cap; pop(cp);
    BR.pulse();
    if (still()) { st.z = to; drawScale(sec, b, to); return; }
    cancelAnimationFrame(st.raf);
    const t0 = performance.now(), dur = 900 + Math.abs(to - from) * 250;
    const step = (now) => {
      const t = clamp((now - t0) / dur), e = inOut(t);
      st.z = lerp(from, to, e);
      // draw between neighbouring steps so sizes interpolate in log space
      drawScale(sec, b, clamp(st.z, 0, b.steps.length - 1));
      if (t < 1) st.raf = requestAnimationFrame(step); else { st.z = to; drawScale(sec, b, to); }
    };
    st.raf = requestAnimationFrame(step);
  }
  function setLobesBlock(sec, b, i) {
    setSeg(sec, 'lobes', i);
    const turn = findTurn(sec.closest('.ak-turn'));
    if (turn && BR.host !== turn.host) BR.take(turn.host, 'brain', 'mind', 600);
    BR.setLobes(b.options[i][1]); BR.pulse();
    const cp = sec.querySelector('[data-cap]'); cp.textContent = b.options[i][2]; pop(cp);
  }
  function renderMyth(el, b) {
    if (!b) return;
    const i = +el.dataset.i, n = b.items.length;
    if (i >= n) {
      el.innerHTML = `<div class="ak-mc-card ak-mc-end"><p class="ak-mc-score"><b>${el.dataset.score}</b> of ${n}</p><p class="ak-body">${+el.dataset.score === n ? 'A perfect score. Your brain is clearly in use.' : 'Brains are full of surprises.'}</p><button type="button" class="ak-link" data-act="mc-again">Try again</button></div>`;
      return;
    }
    const it = b.items[i];
    el.innerHTML = `<div class="ak-mc-dots">${b.items.map((_, k) => `<i class="${k < i ? 'is-past' : k === i ? 'is-on' : ''}"></i>`).join('')}</div>
      <div class="ak-mc-card"><p class="ak-mc-s">“${esc(it[0])}”</p>
      <div class="ak-mc-btns"><button type="button" class="ak-opt ak-opt-c" data-act="mc" data-i="0">Myth<span class="ak-opt-mark"></span></button><button type="button" class="ak-opt ak-opt-c" data-act="mc" data-i="1">Fact<span class="ak-opt-mark"></span></button></div>
      <div data-mcout></div></div>`;
  }
  function pickMyth(el, b, i) {
    const k = +el.dataset.i, it = b.items[k]; if (el.dataset.locked === String(k)) return;
    el.dataset.locked = String(k);
    const ans = it[1] ? 1 : 0, right = i === ans;
    if (right) el.dataset.score = +el.dataset.score + 1;
    el.querySelectorAll('[data-act="mc"]').forEach((o, j) => { o.disabled = true; if (j === ans) { o.classList.add('is-right'); o.querySelector('.ak-opt-mark').innerHTML = ic('check', 16, 2.8); } else if (j === i) { o.classList.add('is-wrong'); o.querySelector('.ak-opt-mark').innerHTML = ic('x', 16, 2.8); } else o.classList.add('is-dim'); });
    el.querySelector('[data-mcout]').innerHTML = `<p class="ak-mc-why"><b>${it[1] ? 'Fact.' : 'Myth.'}</b> ${rich(it[2])}</p><button type="button" class="ak-link" data-act="mc-next">${k + 1 < b.items.length ? 'Next' : 'See score'}</button>`;
    BR.pulse();
  }
  function drawWave(p, f) {
    let d = ''; for (let x = 0; x <= 300; x += 3) { const y = 45 + 30 * Math.sin((x / 300) * 6.283 * f); d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`; }
    p.setAttribute('d', d);
  }
  function renderQuiz(el, b) {
    const i = +(el.dataset.i || 0), n = b.quiz.length, sc = +(el.dataset.score || 0);
    if (i >= n) {
      el.innerHTML = `<div class="ak-qz-end"><p class="ak-mc-score"><b>${sc}</b> of ${n}</p><p class="ak-body">Think a friend can beat that? Send them the same three questions.</p>
        <button type="button" class="btn-lit ak-send" data-act="send-quiz">${ic('share', 18, 2.2)} <span>Send to a friend</span></button><button type="button" class="ak-ghost" data-act="quiz-again">Play again</button></div>`;
      return;
    }
    const [q, opts, ans] = b.quiz[i];
    el.innerHTML = `<div class="ak-mc-dots">${b.quiz.map((_, k) => `<i class="${k < i ? 'is-past' : k === i ? 'is-on' : ''}"></i>`).join('')}</div><p class="ak-qz-q">${esc(q)}</p>
      <div class="ak-opts">${opts.map((o, k) => `<button type="button" class="ak-opt ak-opt-c" data-act="qz" data-i="${k}">${esc(o)}<span class="ak-opt-mark"></span></button>`).join('')}</div><div data-qzout></div>`;
    el.dataset.ans = ans;
  }
  function pickQuiz(el, b, i) {
    const k = +(el.dataset.i || 0); if (el.dataset.locked === String(k)) return; el.dataset.locked = String(k);
    const ans = b.quiz[k][2], right = i === ans; if (right) el.dataset.score = +(el.dataset.score || 0) + 1;
    el.querySelectorAll('[data-act="qz"]').forEach((o, j) => { o.disabled = true; if (j === ans) { o.classList.add('is-right'); o.querySelector('.ak-opt-mark').innerHTML = ic('check', 16, 2.8); } else if (j === i) { o.classList.add('is-wrong'); o.querySelector('.ak-opt-mark').innerHTML = ic('x', 16, 2.8); } else o.classList.add('is-dim'); });
    el.querySelector('[data-qzout]').innerHTML = `<button type="button" class="ak-link" data-act="qz-next">${k + 1 < b.quiz.length ? 'Next question' : 'See score'}</button>`;
  }
  function showTip(sec, b) {
    const box = sec.querySelector('[data-tipbox]'); if (box.innerHTML) return;
    const tp = b.tip;
    box.innerHTML = `<div class="ak-tip is-pop"><p class="ak-eyebrow">${esc(tp.title)}</p><p class="ak-tip-lead">${rich(tp.lead)}</p>${pointsHTML(tp.items.map(([i, t, d]) => [i, t, d]))}<p class="ak-body ak-tip-after">${rich(tp.after)}</p></div>`;
    const btn = sec.querySelector('[data-act="tip"]'); btn.remove();
    const pg = sec.closest('.ak-page'); later(() => smoothScrollTo(pg, box), 60);
  }
  function smoothScrollTo(pg, el) {
    const top = el.getBoundingClientRect().top - pg.getBoundingClientRect().top;
    const k = scaleOf(); pg.scrollTo({ top: pg.scrollTop + top / k - 130, behavior: still() ? 'auto' : 'smooth' });
  }
  const scaleOf = () => { const r = root.getBoundingClientRect(); return r.width / root.offsetWidth || 1; };
  function localPt(el) {
    const L = root.getBoundingClientRect(), k = L.width / root.offsetWidth || 1, r = el.getBoundingClientRect();
    return { x: (r.left - L.left + r.width / 2) / k, y: (r.top - L.top + r.height / 2) / k, w: r.width / k, h: r.height / k, left: (r.left - L.left) / k, top: (r.top - L.top) / k };
  }

  // ───────── Popover on a glowing term ─────────
  function openPop(btn) {
    const id = btn.dataset.term, t = T[id]; if (!t) return;
    closePop();
    const turnEl = btn.closest('.ak-turn'), tr = turnEl && findTurn(turnEl);
    const inLocked = turnEl && turnEl.classList.contains('is-locked');
    if (inLocked) { const a = app(); if (a && a.paywall) a.paywall('ask'); return; }
    const node = cur && cur.nodes.get(cur.current);
    const here = node && node.id === id, has = cur && cur.nodes.has(id);
    const isRootLevel = node && !node.parent;
    let note = '';
    if (!here && !has && isRootLevel && !isPlus()) {
      const left = Math.max(0, 3 - ((Store.get().branchesUsed || {})[cur.key] || 0));
      note = left ? `Free plan: ${left} of 3 branches left on this question` : 'You’ve used your 3 free branches on this question';
    }
    popEl = document.createElement('div'); popEl.className = 'ak-pop'; popEl.setAttribute('role', 'dialog'); popEl.setAttribute('aria-label', t.label);
    popEl.innerHTML = `<p class="ak-pop-k"><span class="ak-term-ic">${ic(EXP.has(id) ? 'check' : 'sparkle', 14, 2.3)}</span>${esc(cap(t.label))}</p><p class="ak-pop-def">${esc(t.def)}</p>
      ${here ? `<p class="ak-pop-here">${ic('check', 15, 2.6)} You’re here</p>` : `<div class="ak-pop-row"><button type="button" class="ak-lit-sm" data-act="branch" data-term="${id}">${ic('branch', 17, 2.2)} <span>${has ? 'Open again' : 'Branch here'}</span></button>${has ? `<span class="ak-pop-note is-done">${ic('check', 14, 2.6)} Explored</span>` : ''}</div>${note ? `<p class="ak-pop-free">${note}</p>` : ''}`}`;
    root.appendChild(popEl);
    const r = localPt(btn), W = 300, Hh = popEl.offsetHeight;
    const left = clamp(r.x - W / 2, 16, SW - 16 - W);
    const below = r.top + r.h + 10 + Hh < SH - 110;
    const top = below ? r.top + r.h + 10 : r.top - 10 - Hh;
    popEl.style.cssText = `left:${left}px;top:${Math.max(112, top)}px;width:${W}px;--ox:${r.x - left}px`;
    popEl.classList.add(below ? 'is-below' : 'is-above');
    popEl._btn = btn; btn.classList.add('is-open');
    requestAnimationFrame(() => popEl && popEl.classList.add('is-in')); if (still()) popEl.classList.add('is-in');
    void tr;
  }
  function closePop() {
    if (!popEl) return; const p = popEl; popEl = null;
    if (p._btn) p._btn.classList.remove('is-open');
    p.classList.remove('is-in'); setTimeout(() => p.remove(), still() ? 0 : 180);
  }

  // ───────── Branching ─────────
  function branch(tid, fromEl) {
    if (!cur) return;
    const node = cur.nodes.get(cur.current); if (!node || node.id === tid) return;
    const o = fromEl && fromEl.isConnected ? localPt(fromEl) : { x: SW / 2, y: SH / 2 };
    closePop();
    if (cur.nodes.has(tid)) { goNode(tid, { dir: 'in', o }); return; }
    if (!node.parent && !isPlus()) {
      const bu = Object.assign({}, Store.get().branchesUsed || {}), used = bu[cur.key] || 0;
      if (used >= 3) { pendingBranch = { tid, o, convo: cur.key }; const a = app(); if (a && a.paywall) a.paywall('branch'); return; }
      bu[cur.key] = used + 1; Store.set({ branchesUsed: bu });
    }
    addBranchNode(cur, tid, node.id);
    goNode(tid, { dir: 'in', o });
  }

  // ───────── Navigation inside a convo ─────────
  function ensurePage(n) {
    if (n.page) return false;
    buildPage(cur, n);
    return true;
  }
  function goNode(id, o = {}) {
    const n = cur.nodes.get(id); if (!n) return;
    closePop();
    const prev = cur.current ? cur.nodes.get(cur.current) : null;
    if (prev && prev.id === id) { n.page.scrollTo({ top: 0, behavior: still() ? 'auto' : 'smooth' }); return; }
    const fresh = ensurePage(n);
    cur.current = id;
    const enter = n.page, leave = prev ? prev.page : null;
    if (fresh) addTurn(n, turnSpec(n), { instant: n.past || o.instant, gate: n.kind !== 'term' && o.gate, noThink: o.noThink });
    else {
      const last = n.turns[n.turns.length - 1];
      if (last) { BR.take(last.host, last.shape, last.palette, 1100); BR.mode('idle'); if (last.key === 'brain') BR.setLobes(0.4); }
    }
    if (o.dir === 'out' && leave) {
      const term = enter.querySelector(`.ak-term[data-term="${prev.id}"]`);
      enter.classList.remove('is-off');
      const oo = term ? localPt(term) : { x: SW / 2, y: SH / 2 };
      zoom(enter, leave, oo, 'out');
    } else if (o.dir === 'jump') {
      fadeSwap(enter, leave);
    } else {
      zoom(enter, leave, o.o || { x: SW / 2, y: SH / 2 }, 'in');
    }
    renderTrail(o.dir); renderMini(true);
    emit('ask:node', { convo: cur.key, id });
  }

  // Zoom transition: "in" grows the new page out of a point (a word, a bubble); "out" shrinks it back.
  function zoom(enter, leave, o, dir) {
    enter.classList.remove('is-off'); enter.hidden = false;
    if (still() || !enter.animate) { if (leave && leave !== enter) offEl(leave); return; }
    const R = Math.hypot(Math.max(o.x, SW - o.x), Math.max(o.y, SH - o.y)) + 12;
    const org = `${o.x}px ${o.y}px`, dur = dir === 'in' ? 660 : 560;
    if (dir === 'in') {
      enter.style.zIndex = 3; if (leave) leave.style.zIndex = 2;
      enter.style.transformOrigin = org;
      enter.animate([{ clipPath: `circle(14px at ${org})`, transform: 'scale(.86)' }, { clipPath: `circle(${R}px at ${org})`, transform: 'scale(1)' }], { duration: dur, easing: GLIDE });
      if (leave) {
        leave.style.transformOrigin = org;
        const an = leave.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.14)', opacity: 0 }], { duration: dur, easing: GLIDE });
        an.onfinish = () => { offEl(leave); leave.style.zIndex = ''; leave.style.transformOrigin = ''; };
      }
      setTimeout(() => { enter.style.zIndex = ''; }, dur + 20);
    } else {
      leave.style.zIndex = 3; enter.style.zIndex = 2;
      leave.style.transformOrigin = org; enter.style.transformOrigin = org;
      const an = leave.animate([{ clipPath: `circle(${R}px at ${org})`, transform: 'scale(1)', opacity: 1, offset: 0 }, { opacity: 1, offset: 0.6 }, { clipPath: `circle(14px at ${org})`, transform: 'scale(.86)', opacity: 0, offset: 1 }], { duration: dur, easing: GLIDE });
      enter.animate([{ transform: 'scale(1.14)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: dur, easing: GLIDE });
      an.onfinish = () => { offEl(leave); leave.style.zIndex = ''; enter.style.zIndex = ''; leave.style.transformOrigin = ''; enter.style.transformOrigin = ''; };
    }
  }
  function fadeSwap(enter, leave) {
    enter.classList.remove('is-off');
    if (leave && leave !== enter) offEl(leave);
    if (!still() && enter.animate) enter.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: OUT });
  }
  const offEl = (el) => { if (el === homeEl) { el.hidden = true; } else el.classList.add('is-off'); };

  function back() {
    if (!cur) return goHome();
    const n = cur.nodes.get(cur.current);
    if (n && n.parent) goNode(n.parent, { dir: 'out' }); else goHome();
  }

  // ───────── Trail ─────────
  function renderTrail(dir) {
    const path = pathTo(cur, cur.current);
    trailEl.innerHTML = path.map((n, k) => {
      const last = k === path.length - 1;
      return `${k ? `<span class="ak-trail-sep" aria-hidden="true">${ic('chev', 13, 2.4)}</span>` : ''}<button type="button" class="ak-crumb${last ? ' is-cur' : ''}${last && dir === 'in' ? ' is-new' : ''}" data-act="crumb" data-id="${n.id}"${last ? ' aria-current="page"' : ''}>${esc(k ? n.crumb : n.crumb)}</button>`;
    }).join('');
    requestAnimationFrame(() => trailEl.scrollTo({ left: trailEl.scrollWidth, behavior: still() ? 'auto' : 'smooth' }));
    backBtn.setAttribute('aria-label', path.length > 1 ? 'Back' : 'Back to Ask home');
  }

  // ───────── Open a question ─────────
  // src: 'wonder' (free for everyone) · 'history' (yours already) · anything else is a new ask (Plus, or a preview on free)
  function openQuestion(text, o = {}) {
    const c0 = classify(text);
    const key = c0.id || 'q:' + c0.q.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    let c = convos.get(key), fresh = false;
    if (!c) { c = newConvo(key, { q: c0.id ? (A[String(text).trim()] ? A[c0.id].q : String(text).trim()) : c0.q, type: c0.type, src: o.src }); fresh = true; }
    else order = [key].concat(order.filter((k) => k !== key));
    enterChat(c, { o: o.o, src: o.src, fresh, gate: fresh && o.src !== 'wonder' && !isPlus(), noThink: o.noThink, instant: o.instant });
  }
  function enterChat(c, o = {}) {
    const wasChat = view === 'chat';
    if (cur && cur !== c) { cur.nodes.forEach((n) => { if (n.page) n.page.classList.add('is-off'); }); }
    cur = c; view = 'chat';
    closePop(); stopC();
    chatEl.hidden = false; chatEl.classList.remove('is-typing');
    if (app()) app().setTabBar(false);
    const target = c.current || c.key;
    c.current = null;
    const n = c.nodes.get(target);
    const fresh = ensurePage(n);
    c.current = target;
    const enter = n.page;
    if (fresh) addTurn(n, turnSpec(n), { instant: n.past || o.instant, gate: o.gate, noThink: o.noThink });
    else { const last = n.turns[n.turns.length - 1]; if (last) { BR.take(last.host, last.shape, last.palette, 1100); BR.mode('idle'); if (last.key === 'brain') BR.setLobes(0.4); } }
    if (wasChat) fadeSwap(enter, null);
    else {
      chatEl.classList.add('is-entering'); requestAnimationFrame(() => requestAnimationFrame(() => chatEl.classList.remove('is-entering')));
      c.o = o.o || { x: SW / 2, y: 300 };
      zoom(enter, homeEl, c.o, 'in');
    }
    renderTrail(); renderMini(true);
  }
  function goHome() {
    if (view === 'home') return;
    closePop(); closeMap(true);
    view = 'home';
    const n = cur && cur.nodes.get(cur.current);
    renderHome();
    homeEl.hidden = false;
    if (n && n.page) {
      const o = (cur && cur.o) || { x: SW / 2, y: 300 };
      if (still() || !n.page.animate) { n.page.classList.add('is-off'); chatEl.hidden = true; }
      else {
        zoom(homeEl, n.page, o, 'out');
        chatEl.classList.add('is-leaving');
        setTimeout(() => { chatEl.classList.remove('is-leaving'); if (view === 'home') chatEl.hidden = true; }, 560);
      }
    } else chatEl.hidden = true;
    if (app()) app().setTabBar(true);
    homeBrain();
  }

  // Follow-up typed in the chat: a new turn on the current page
  function followUp(text) {
    const node = cur && cur.nodes.get(cur.current); if (!node) return;
    const c0 = classify(text);
    const spec = c0.id ? { kind: 'answer', a: A[c0.id], q: text } : { kind: 'generic', type: c0.type, q: text };
    const turn = addTurn(node, spec, { gate: !isPlus() });
    later(() => smoothScrollTo(node.page, turn.el), 40);
  }

  // ───────── Mini-map + zoom-out map ─────────
  function convoMapData() {
    return [...cur.nodes.values()].map((n) => ({ id: n.id, label: n.kind === 'answer' ? A[n.id].q : n.kind === 'term' ? n.label : n.q, parent: n.parent, shape: n.shape, palette: n.palette }));
  }
  function renderMini(pulse) {
    if (!cur || !miniBtn) return;
    const nodes = convoMapData();
    const L = Layout(nodes, cur.current, { root: cur.key });
    const c = L.byId[cur.current] || L.byId[cur.key];
    const K = 0.15;
    let s = `<circle class="ak-mini-halo" cx="0" cy="0" r="9"/>`;
    L.list.forEach((n) => { const p = L.byId[n.parent]; if (!p) return; s += `<line x1="${((p.tx - c.tx) * K).toFixed(1)}" y1="${((p.ty - c.ty) * K).toFixed(1)}" x2="${((n.tx - c.tx) * K).toFixed(1)}" y2="${((n.ty - c.ty) * K).toFixed(1)}" class="ak-mini-e${n.id === c.id || p.id === c.id ? ' is-near' : ''}"/>`; });
    L.list.forEach((n) => { const isC = n === c; s += `<circle cx="${((n.tx - c.tx) * K).toFixed(1)}" cy="${((n.ty - c.ty) * K).toFixed(1)}" r="${isC ? 5 : 3}" fill="${fam(n.palette)[isC ? 0 : 1]}" class="ak-mini-d${isC ? ' is-cur' : ''}"/>`; });
    miniBtn.querySelector('svg').innerHTML = s;
    miniBtn.setAttribute('aria-label', `Zoom out to the map of this question. ${nodes.length} ${nodes.length === 1 ? 'idea' : 'ideas'}`);
    if (pulse && !still()) { miniBtn.classList.remove('is-pulse'); void miniBtn.offsetWidth; miniBtn.classList.add('is-pulse'); }
  }
  function openMap(fromPinch) {
    if (!cur || (mapView && mapView.isOpen())) return;
    closePop();
    if (!mapView) mapView = makeMap(mapHost, { overlay: true, title: 'This question', onPick: (id) => goNode(id, { dir: 'jump' }), onClose: () => chatEl.classList.remove('is-mapped') });
    const nodes = convoMapData();
    mapView.setData(nodes, cur.current);
    mapView.setTitle(rootOf(cur).crumb, `${nodes.length} ${nodes.length === 1 ? 'idea' : 'ideas'} · tap one to jump in`);
    chatEl.classList.add('is-mapped');
    mapView.open(localPt(miniBtn));
    void fromPinch;
  }
  function closeMap(instant) { if (mapView && mapView.isOpen()) mapView.close(instant); if (histView && histView.isOpen()) histView.close(instant); }

  // History: every question you've asked, and its branches, around you
  function histMapData(withHub) {
    const out = [];
    if (withHub) out.push({ id: '@you', label: 'You', parent: null, hub: true, shape: 'brain', palette: 'cobalt' });
    order.slice().reverse().forEach((k) => {
      const c = convos.get(k); if (!c) return;
      const r = rootOf(c); if (!hasSeen(c)) return;
      out.push({ id: k, label: r.kind === 'answer' ? A[k].q : r.q, parent: withHub ? '@you' : null, shape: r.shape, palette: r.palette, convo: k, node: k });
      c.nodes.forEach((n) => { if (n.parent) out.push({ id: k + '/' + n.id, label: n.label, parent: n.parent === k ? k : k + '/' + n.parent, shape: n.shape, palette: n.palette, convo: k, node: n.id }); });
    });
    if (withHub && !convos.has(C.wonder.id) && A[C.wonder.id]) out.push({ id: '@wonder', label: A[C.wonder.id].q, parent: '@you', shape: A[C.wonder.id].shape, palette: A[C.wonder.id].palette, tag: 'Today’s wonder', convo: C.wonder.id, node: C.wonder.id });
    return out;
  }
  const hasSeen = (c) => c.past || c.nodes.get(c.key).page; // seeded history, or opened this session
  function openHistMap(o) {
    if (!histView) histView = makeMap(root.querySelector('.ak-histmap'), { overlay: true, onPick: pickHist, onClose: () => { if (view === 'home' && shown && app()) app().setTabBar(true); } });
    const d = histMapData(true).filter((x) => x.id !== '@wonder');
    if (d.length < 2) return;
    histView.setData(d, null);
    const nq = d.filter((x) => x.parent === '@you').length, nb = d.length - 1 - nq;
    histView.setTitle('Your curiosity map', `${nq} ${nq === 1 ? 'question' : 'questions'}, ${nb} ${nb === 1 ? 'branch' : 'branches'}`);
    if (app()) app().setTabBar(false);
    histView.open(o || { x: SW / 2, y: SH - 160 });
  }
  function pickHist(id, pt) {
    if (id === '@you') { const f = root.querySelector('.ak-home .ak-box input'); if (f) f.focus({ preventScroll: true }); BR.pulse(); return; }
    const d = histMapData(true).find((x) => x.id === id); if (!d) return;
    const c = convos.get(d.convo);
    if (!c) { openQuestion(d.convo, { src: d.convo === C.wonder.id ? 'wonder' : 'history', o: pt, noThink: d.convo === C.wonder.id }); return; }
    order = [c.key].concat(order.filter((k) => k !== c.key));
    if (view === 'chat' && cur === c) { goNode(d.node, { dir: 'jump' }); return; }
    c.current = d.node;
    enterChat(c, { o: pt });
  }

  // ───────── Map renderer (radial tree on tall ellipses; adapted from the v3 map) ─────────
  const FAM = { mind: ['#4A30B0', '#7457E0', '#EEEAFD'], arts: ['#7E2777', '#B04AA8', '#F8E9F6'], society: ['#3F5A12', '#6E8A22', '#EEF3DF'], tech: ['#165F87', '#2A8FC4', '#E4F1F8'], cobalt: ['#1A47B8', '#1F5BE0', '#E8EEFD'], body: ['#A3264F', '#C94A72', '#FBE8EE'], space: ['#2F3766', '#4B57A0', '#E9EAF5'] };
  const fam = (p) => FAM[p] || FAM.cobalt;
  const mctx = document.createElement('canvas').getContext('2d');
  function measure(text, d) {
    mctx.font = d === 0 ? "600 14px 'Geist', sans-serif" : "600 13px 'Geist', sans-serif";
    const maxW = d === 0 ? 168 : 122, words = String(text).split(/\s+/);
    let n = 1, line = '', widest = 0;
    for (const w of words) { const t = line ? line + ' ' + w : w; if (line && mctx.measureText(t).width > maxW) { widest = Math.max(widest, mctx.measureText(line).width); n++; line = w; } else line = t; }
    widest = Math.max(widest, mctx.measureText(line).width);
    return { n: Math.min(2, n), w: Math.min(maxW, widest) };
  }
  function Layout(data, currentId, o = {}) {
    const SIZE = o.hub ? [112, 64, 52, 46] : [96, 64, 52, 46];
    const sizeOf = (d) => SIZE[Math.min(d, 3)];
    const RX = (d, a) => (d === 0 ? 0 : d === 1 ? (Math.sin(a) > 0.2 ? 146 : 126) : 170 + (d - 2) * 40);
    const RY = (d) => (d === 0 ? 0 : d === 1 ? 172 : 330 + (d - 2) * 120);
    const byId = {}, list = data.map((d) => (byId[d.id] = Object.assign({}, d, { kids: [], depth: 0, tx: 0, ty: 0 })));
    const r = list.find((n) => !n.parent || !byId[n.parent]) || list[0]; if (!r) return { list: [], byId, fit: null, sizeOf };
    list.forEach((n) => { if (n !== r) { const p = byId[n.parent] || r; p.kids.push(n); n.parent = p.id; } });
    const walk = (n, d) => { n.depth = d; n.leaves = 0; n.kids.forEach((k) => { n.leaves += walk(k, d + 1); }); n.leaves = Math.max(1, n.leaves); return n.leaves; };
    walk(r, 0);
    const place = (n, a0, a1) => {
      const a = (a0 + a1) / 2;
      if (n.depth) { n.tx = Math.cos(a) * RX(n.depth, a); n.ty = Math.sin(a) * RY(n.depth); }
      const tot = n.kids.reduce((s, k) => s + k.leaves, 0) || 1;
      const span = n.depth === 0 ? Math.PI * 2 : Math.min(a1 - a0, 0.5 * n.kids.length + 0.2);
      let s = a - span / 2;
      if (n.depth === 0) { let cum = 0, best = 0, bestD = 1e9; for (let j = 0; j <= n.kids.length; j++) { const dd = Math.abs(cum / tot - 0.5); if (dd < bestD - 1e-6) { bestD = dd; best = cum; } if (j < n.kids.length) cum += n.kids[j].leaves; } s = Math.PI / 2 - (best / tot) * span; }
      n.kids.forEach((k) => { const w = (k.leaves / tot) * span; place(k, s, s + w); s += w; });
    };
    place(r, -Math.PI / 2, Math.PI * 1.5);
    const sector = (dx, dy) => { const deg = (Math.atan2(dy, dx) * 180) / Math.PI; return deg > 28 && deg < 152 ? 'b' : deg < -28 && deg > -152 ? 't' : 's'; };
    list.forEach((n) => { let b = 0, t = 0; const look = (q) => { const sc = sector(q.tx - n.tx, q.ty - n.ty); if (sc === 'b') b++; else if (sc === 't') t++; }; if (n !== r) look(byId[n.parent]); n.kids.forEach(look); n.up = n.depth > 0 && b > 0 && t === 0; });
    const fp = list.map((n) => { const s = sizeOf(n.depth), m = measure(n.label, n.depth); n.lines = n.hub ? 0 : m.n; n.tagH = n.id === currentId || n.tag ? 28 : 0; const lab = 7 + m.n * (n.depth ? 17 : 18) + (n.id === currentId || n.tag ? 28 : 0); return { n, hw: Math.max(s, m.w) / 2 + 8, up: s / 2 + (n.up ? lab : 0) + 8, down: s / 2 + (n.up ? 0 : lab) + 8 }; });
    for (let it = 0; it < 90; it++) {
      let moved = false;
      for (let i = 0; i < fp.length; i++) for (let j = i + 1; j < fp.length; j++) {
        const P1 = fp[i], P2 = fp[j], e = P1.n.id === P2.n.parent || P2.n.id === P1.n.parent ? 14 : 0;
        const ox = Math.min(P1.n.tx + P1.hw + e, P2.n.tx + P2.hw) - Math.max(P1.n.tx - P1.hw - e, P2.n.tx - P2.hw);
        const oy = Math.min(P1.n.ty + P1.down + e, P2.n.ty + P2.down) - Math.max(P1.n.ty - P1.up - e, P2.n.ty - P2.up);
        if (ox <= 0 || oy <= 0) continue; moved = true;
        const wa = P1.n.depth === 0 ? 0 : P1.n.depth < P2.n.depth ? 0.2 : P1.n.depth > P2.n.depth ? 0.8 : 0.5, wb = 1 - wa;
        if (ox < oy * 0.45) { const sg = (P2.n.tx >= P1.n.tx ? 1 : -1) * ox; P1.n.tx -= sg * wa; P2.n.tx += sg * wb; }
        else { const sg = (P2.n.ty + (P2.down - P2.up) / 2 >= P1.n.ty + (P1.down - P1.up) / 2 ? 1 : -1) * oy; P1.n.ty -= sg * wa; P2.n.ty += sg * wb; }
      }
      if (!moved) break;
    }
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    fp.forEach((f) => { x0 = Math.min(x0, f.n.tx - f.hw); x1 = Math.max(x1, f.n.tx + f.hw); y0 = Math.min(y0, f.n.ty - f.up); y1 = Math.max(y1, f.n.ty + f.down); });
    return { list, byId, root: r, sizeOf, sector, bounds: { x0, x1, y0, y1 } };
  }

  function makeMap(host, opts) {
    const el = document.createElement('div');
    el.className = 'ak-map' + (opts.overlay ? ' is-overlay' : ' is-embed');
    el.innerHTML = `<div class="ak-map-bg"></div><div class="ak-map-stage"><svg class="ak-map-edges" aria-hidden="true"></svg><div class="ak-map-nodes"></div></div>
      ${opts.overlay ? `<div class="ak-map-fade" aria-hidden="true"></div><header class="ak-map-head"><h2></h2><p></p></header><button type="button" class="ak-map-x" aria-label="Close map">${ic('x', 18, 2.4)}</button>` : ''}`;
    host.appendChild(el);
    const stage = el.querySelector('.ak-map-stage'), edgesSvg = el.querySelector('.ak-map-edges'), nodesEl = el.querySelector('.ak-map-nodes');
    const TOP = opts.top != null ? opts.top : 128, BOT = opts.bottom != null ? opts.bottom : 40;
    let L = null, curId = null, isOpen = !opts.overlay, tl = null, raf = 0;
    let cam = { fx: 0, fy: 0, z: 1 }, fit = { fx: 0, fy: 0, z: 1, zMin: 0.5, zMax: 2 };
    const els = new Map();
    const W = () => host.offsetWidth || SW, H = () => host.offsetHeight || SH;
    const VC = () => ({ x: W() / 2, y: (TOP + H() - BOT) / 2 });
    edgesSvg.setAttribute('width', SW); edgesSvg.setAttribute('height', SH);

    function setData(data, currentId) {
      curId = currentId;
      L = Layout(data, currentId, { hub: !!data.find((d) => d.hub) });
      const seen = new Set();
      L.list.forEach((n) => {
        seen.add(n.id);
        let e = els.get(n.id);
        const s = L.sizeOf(n.depth), [deep, mid, tint] = fam(n.palette);
        if (!e) {
          e = { b: document.createElement('button'), path: document.createElementNS('http://www.w3.org/2000/svg', 'path') };
          e.b.type = 'button'; e.b.className = 'ak-mn'; e.b.dataset.id = n.id;
          e.b.innerHTML = `<span class="ak-mn-bub"></span><span class="ak-mn-lab"><span class="ak-mn-txt"></span><span class="ak-mn-tag"></span></span>`;
          e.b.addEventListener('click', (ev) => { if (ev.detail === 0) pick(n.id); });
          nodesEl.appendChild(e.b); e.path.setAttribute('class', 'ak-me'); edgesSvg.appendChild(e.path);
          els.set(n.id, e);
        }
        e.b.style.cssText = `width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;--deep:${deep};--mid:${mid};--tint:${tint}`;
        e.b.classList.toggle('is-here', n.id === currentId); e.b.classList.toggle('is-up', !!n.up); e.b.classList.toggle('is-hub', !!n.hub); e.b.classList.toggle('is-wonder', !!n.tag);
        e.b.className = e.b.className.replace(/\bd\d\b/g, '').trim() + ' d' + Math.min(n.depth, 3);
        const bub = e.b.querySelector('.ak-mn-bub');
        if (n.hub && opts.liveHub) { if (!bub.querySelector('.ak-mn-host')) bub.innerHTML = '<span class="ak-mn-host"></span>'; }
        else if (e.glyphFor !== n.shape + n.palette) { e.glyphFor = n.shape + n.palette; bub.innerHTML = glyph(n.shape, n.palette, n.depth === 0 ? 420 : 300, 0.03); }
        e.b.querySelector('.ak-mn-txt').textContent = n.label;
        e.b.querySelector('.ak-mn-tag').textContent = n.tag || (n.id === currentId && opts.overlay ? 'You are here' : '');
        e.b.setAttribute('aria-label', n.hub ? 'You. Ask something new' : `${n.label}${n.id === currentId ? ', you are here' : ''}. Open`);
      });
      els.forEach((e, id) => { if (!seen.has(id)) { e.b.remove(); e.path.remove(); els.delete(id); } });
      const bd = L.bounds, aw = W() - 24, ah = H() - TOP - BOT;
      const z = clamp(Math.min(1, aw / (bd.x1 - bd.x0), ah / (bd.y1 - bd.y0)), 0.55, 1);
      fit = { fx: (bd.x0 + bd.x1) / 2, fy: (bd.y0 + bd.y1) / 2, z, zMin: z * 0.75, zMax: 2.2, bd };
      if (!tl) cam = { fx: fit.fx, fy: fit.fy, z: fit.z };
      render();
    }
    function hubHost() { const e = els.get('@you'); return e ? e.b.querySelector('.ak-mn-host') : null; }
    function render(v) {
      if (!L) return;
      v = v || { fx: cam.fx, fy: cam.fy, z: cam.z, fade: 1, target: null, others: 1 };
      const vc = VC();
      L.list.forEach((n) => {
        const e = els.get(n.id), s = L.sizeOf(n.depth);
        const sx = vc.x + (n.tx - v.fx) * v.z, sy = vc.y + (n.ty - v.fy) * v.z;
        n.sx = sx; n.sy = sy; n.D = s * v.z;
        n.labS = n.lines ? (7 + n.lines * (n.depth ? 17 : 18) + (n.tagH && e.b.querySelector('.ak-mn-tag').textContent ? n.tagH : 0)) * clamp(v.z, 0.86, 1.05) + 6 : 0;
        let a = 1; if (opts.overlay) a *= 0.1 + 0.9 * smooth(TOP - 36, TOP + 10, sy - n.D / 2 - (n.up ? 34 : 0));
        if (v.target) a *= n.id === v.target ? 1 : v.others;
        n.a = a;
        e.b.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${v.z.toFixed(4)})`;
        e.b.style.opacity = a.toFixed(3); e.b.style.zIndex = n.id === v.target ? 99 : Math.round(n.D);
        const ls = clamp(v.z, 0.86, 1.05) / v.z;
        e.b.querySelector('.ak-mn-lab').style.transform = `translate(-50%, ${(n.up ? -7 : 7) / v.z}px) scale(${ls.toFixed(4)})`;
      });
      L.list.forEach((n) => { const e = els.get(n.id), p = L.byId[n.parent]; if (!p || n === L.root) { e.path.setAttribute('d', ''); return; } e.path.setAttribute('d', curve(p, n, L)); e.path.style.opacity = Math.min(p.a, n.a).toFixed(3); e.path.classList.toggle('is-path', onPath(n.id)); });
    }
    function onPath(id) { for (let c = L.byId[curId]; c; c = L.byId[c.parent]) { if (c.id === id) return true; if (c === L.root) break; } return false; }
    function port(n, dx, dy) {
      const sc = L.sector(dx, dy), sx = dx > 0.5 || (Math.abs(dx) <= 0.5 && n.tx >= 0) ? 1 : -1, T1 = Math.sin(0.384), TC = Math.cos(0.384);
      // the straight way out would cross this node's label: leave from beyond the label instead
      if ((sc === 'b' && !n.up) || (sc === 't' && n.up)) return n.labS ? { u: [0, sc === 'b' ? 1 : -1], side: true, lab: true } : { u: [sx * TC, sc === 'b' ? T1 : -T1], side: true };
      const Ln = Math.hypot(dx, dy) || 1; return { u: [dx / Ln, dy / Ln], side: false };
    }
    function curve(a, b) {
      const dx = b.sx - a.sx, dy = b.sy - a.sy, Ln = Math.hypot(dx, dy) || 1, ra = a.D / 2 + 4, rb = b.D / 2 + 4;
      if (Ln < ra + rb + 6) return '';
      const pa = port(a, dx, dy), pb = port(b, -dx, -dy), f = (v) => v.toFixed(1);
      const toward = (n, r, qx, qy) => { const u = Math.hypot(qx - n.sx, qy - n.sy) || 1; return [n.sx + ((qx - n.sx) / u) * r, n.sy + ((qy - n.sy) / u) * r]; };
      if (!pa.side && !pb.side) { const bow = 0.1 * Ln, qx = (a.sx + b.sx) / 2 - (dy / Ln) * bow, qy = (a.sy + b.sy) / 2 + (dx / Ln) * bow, p0 = toward(a, ra, qx, qy), p1 = toward(b, rb, qx, qy); return `M${f(p0[0])} ${f(p0[1])}Q${f(qx)} ${f(qy)} ${f(p1[0])} ${f(p1[1])}`; }
      if (pa.side !== pb.side) {
        const S = pa.side ? a : b, F = pa.side ? b : a, u = pa.side ? pa.u : pb.u, rs = pa.side ? ra : rb, rf = pa.side ? rb : ra;
        const lab = pa.side ? pa.lab : pb.lab;
        const p0 = lab ? [S.sx, S.sy + u[1] * (S.D / 2 + S.labS)] : [S.sx + u[0] * rs, S.sy + u[1] * rs];
        const k = lab ? clamp(Math.abs(F.sy - p0[1]) * 0.5, 10, 60) : clamp(Math.abs(F.sx - p0[0]) * 0.8, 12, 0.5 * Math.hypot(F.sx - p0[0], F.sy - p0[1]));
        const qx = p0[0] + u[0] * k, qy = p0[1] + u[1] * k, p1 = toward(F, rf, qx, qy), [P0, P1] = pa.side ? [p0, p1] : [p1, p0];
        return `M${f(P0[0])} ${f(P0[1])}Q${f(qx)} ${f(qy)} ${f(P1[0])} ${f(P1[1])}`;
      }
      const ea = pa.lab ? a.D / 2 + a.labS : ra, eb = pb.lab ? b.D / 2 + b.labS : rb;
      const x0 = a.sx + pa.u[0] * ea, y0 = a.sy + pa.u[1] * ea, x1 = b.sx + pb.u[0] * eb, y1 = b.sy + pb.u[1] * eb, k = Math.min(0.4 * Math.hypot(x1 - x0, y1 - y0), 90);
      return `M${f(x0)} ${f(y0)}C${f(x0 + pa.u[0] * k)} ${f(y0 + pa.u[1] * k)} ${f(x1 + pb.u[0] * k)} ${f(y1 + pb.u[1] * k)} ${f(x1)} ${f(y1)}`;
    }
    function run(dur, step, done) {
      cancelAnimationFrame(raf);
      if (still()) { step(1); done && done(); return; }
      const t0 = performance.now();
      const fr = (now) => { const t = clamp((now - t0) / dur); step(t); if (t < 1) raf = requestAnimationFrame(fr); else { raf = 0; done && done(); } };
      raf = requestAnimationFrame(fr);
    }
    // Open: start zoomed in on where you are, inside the corner circle, and pull back to the whole tree
    function open(o) {
      if (!opts.overlay || isOpen) return;
      isOpen = true; el.classList.add('is-open'); el.inert = false;
      const c = (L && L.byId[curId]) || (L && L.root) || { tx: 0, ty: 0 };
      const R = Math.hypot(Math.max(o.x, SW - o.x), Math.max(o.y, SH - o.y)) + 8;
      tl = 'open';
      run(620, (t) => {
        const p = glide(t);
        el.style.clipPath = `circle(${lerp(30, R, p).toFixed(1)}px at ${o.x}px ${o.y}px)`;
        render({ fx: lerp(c.tx, fit.fx, p), fy: lerp(c.ty, fit.fy, p), z: Math.exp(lerp(Math.log(fit.z * 2.6), Math.log(fit.z), p)), fade: 1 });
        el.style.setProperty('--head', smooth(0.45, 1, p).toFixed(3));
      }, () => { tl = null; el.style.clipPath = ''; cam = { fx: fit.fx, fy: fit.fy, z: fit.z }; render(); const x = el.querySelector('.ak-map-x'); if (x && kb) x.focus({ preventScroll: true }); });
      el._o = o;
    }
    let kb = false;
    function close(instant) {
      if (!isOpen || tl === 'close') return;
      const o = el._o || { x: SW - 48, y: SH - 52 };
      const R = Math.hypot(Math.max(o.x, SW - o.x), Math.max(o.y, SH - o.y)) + 8;
      const c = (L && L.byId[curId]) || { tx: cam.fx, ty: cam.fy }, from = Object.assign({}, cam);
      tl = 'close';
      const done = () => { tl = null; isOpen = false; el.classList.remove('is-open'); el.inert = true; el.style.clipPath = ''; el.style.opacity = ''; opts.onClose && opts.onClose(); };
      if (instant) { cancelAnimationFrame(raf); done(); return; }
      run(480, (t) => {
        const p = glide(t);
        el.style.clipPath = `circle(${lerp(R, 30, p).toFixed(1)}px at ${o.x}px ${o.y}px)`;
        render({ fx: lerp(from.fx, c.tx, p), fy: lerp(from.fy, c.ty, p), z: Math.exp(lerp(Math.log(from.z), Math.log(fit.z * 2.6), p)), fade: 1 });
        el.style.setProperty('--head', (1 - smooth(0, 0.5, p)).toFixed(3));
        el.style.opacity = (1 - smooth(0.7, 1, p)).toFixed(3);
      }, done);
    }
    // Pick: fly into the node; the page swaps in underneath as the map dissolves
    function pick(id) {
      if (tl) return;
      const n = L && L.byId[id]; if (!n) return;
      if (!opts.overlay) { opts.onPick && opts.onPick(id, { x: n.sx, y: n.sy }); return; }
      const from = Object.assign({}, cam); let fired = false;
      tl = 'pick'; el.classList.add('is-busy');
      run(780, (t) => {
        const pf = easeOut(clamp(t / 0.6)), pz = inOut(clamp(t / 0.85));
        render({ fx: lerp(from.fx, n.tx, pf), fy: lerp(from.fy, n.ty, pf), z: Math.exp(lerp(Math.log(from.z), Math.log(from.z * 3.4), pz)), target: id, others: 1 - smooth(0, 0.3, t) });
        el.style.opacity = (1 - smooth(0.5, 1, t)).toFixed(3);
        el.style.setProperty('--head', (1 - smooth(0, 0.25, t)).toFixed(3));
        if (!fired && t > 0.4) { fired = true; opts.onPick && opts.onPick(id, { x: n.sx, y: n.sy }); }
      }, () => { tl = null; isOpen = false; el.classList.remove('is-open', 'is-busy'); el.inert = true; el.style.opacity = ''; opts.onClose && opts.onClose(); });
    }
    // Gestures: drag to pan, pinch or ⌘/ctrl + scroll to zoom, tap a node to jump in
    const ptrs = new Map(); let g = null;
    const loc = (e) => { const r = host.getBoundingClientRect(), k = r.width / (host.offsetWidth || r.width) || 1; return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; };
    stage.addEventListener('pointerdown', (e) => {
      if (!isOpen || tl) return; if (e.pointerType === 'mouse' && e.button !== 0) return;
      const p = loc(e); ptrs.set(e.pointerId, p);
      try { stage.setPointerCapture(e.pointerId); } catch (er) { /* noop */ }
      if (ptrs.size === 1) g = { type: 'pan', lx: p[0], ly: p[1], moved: 0, node: e.target.closest('.ak-mn'), hubTouch: e.target.closest('.ak-mn-host') };
      else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; g = { type: 'pinch', d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z0: cam.z, moved: 99 }; }
    });
    stage.addEventListener('pointermove', (e) => {
      if (!g || !ptrs.has(e.pointerId)) return;
      const p = loc(e); ptrs.set(e.pointerId, p);
      if (g.type === 'pan') {
        const dx = p[0] - g.lx, dy = p[1] - g.ly; g.lx = p[0]; g.ly = p[1]; g.moved += Math.abs(dx) + Math.abs(dy);
        if (g.moved < 6 || g.hubTouch) return;
        cam.fx -= dx / cam.z; cam.fy -= dy / cam.z; render();
      } else if (ptrs.size >= 2) {
        const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        cam.z = clamp(g.z0 * d / g.d0, fit.zMin, fit.zMax); render();
      }
    });
    const end = (e) => {
      if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
      if (g && g.type === 'pan' && g.moved < 6 && g.node && e.type === 'pointerup') { const id = g.node.dataset.id; g = null; pick(id); return; }
      if (!ptrs.size) { g = null; settle(); }
    };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', (e) => {
      if (!isOpen || tl) return; e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        if (opts.overlay && e.deltaY < 0 && cam.z >= fit.zMax - 0.01) return;
        cam.z = clamp(cam.z * Math.exp(-e.deltaY * 0.01), fit.zMin, fit.zMax);
      } else { cam.fx += e.deltaX / cam.z; cam.fy += e.deltaY / cam.z; }
      clampCam(); render();
    }, { passive: false });
    function clampCam() { const b = fit.bd; if (!b) return; cam.fx = clamp(cam.fx, b.x0 + 40, b.x1 - 40); cam.fy = clamp(cam.fy, b.y0 + 40, b.y1 - 40); if (b.x1 - b.x0 < 80) cam.fx = fit.fx; if (b.y1 - b.y0 < 80) cam.fy = fit.fy; }
    function settle() {
      const from = Object.assign({}, cam); clampCam(); const to = Object.assign({}, cam); cam = from;
      run(380, (t) => { const p = easeOut(t); cam = { fx: lerp(from.fx, to.fx, p), fy: lerp(from.fy, to.fy, p), z: cam.z }; render(); });
    }
    if (opts.overlay) {
      el.inert = true;
      el.querySelector('.ak-map-x').addEventListener('click', (e) => { kb = e.detail === 0; close(); });
      el.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
    }
    return {
      setData, open, close, render, hubHost, el,
      isOpen: () => isOpen,
      setTitle(t, s) { const h = el.querySelector('.ak-map-head'); if (h) { h.querySelector('h2').textContent = t; h.querySelector('p').textContent = s; } },
      refit() { if (L) { cam = { fx: fit.fx, fy: fit.fy, z: fit.z }; render(); } },
    };
  }

  // ───────── Homes ─────────
  function boxHTML(ph = 'Ask anything…', cls = '') {
    return `<form class="ak-box ${cls}" data-form="ask" autocomplete="off"><label class="ak-sr" for="akIn${cls}">Your question</label><input id="akIn${cls}" name="q" type="text" placeholder="${esc(ph)}" enterkeyhint="send" autocomplete="off"><button type="submit" class="ak-send" aria-label="Ask" disabled>${ic('up', 20, 2.4)}</button></form>`;
  }
  function renderHome() {
    const v = (window.Store && Store.get().variants.askHome) || 'A';
    homeEl.className = 'ak-home is-' + v;
    homeEl.dataset.v = v;
    if (bView) { bView.el.remove(); bView = null; }
    if (v === 'B') renderB(); else if (v === 'C') renderC(); else renderA();
  }
  function renderA() {
    const w = A[C.wonder.id];
    const sug = C.suggestions.filter((id) => A[id] && !convos.has(id));
    homeEl.innerHTML = `<div class="ak-scroll">
      <h1 class="ak-title">What are you curious about?</h1>
      ${boxHTML('Ask anything…', 'a')}
      <div class="ak-wonder" data-act="wonder" role="button" tabindex="0" aria-label="${esc(C.wonder.eyebrow)}: ${esc(w.q)}. Open">
        <div class="ak-wonder-top"><p class="ak-eyebrow">${ic('sparkle', 14)} ${esc(C.wonder.eyebrow)}</p><span class="ak-wonder-go">${ic('chev', 18, 2.4)}</span></div>
        <h2 class="ak-wonder-q">${esc(w.q)}</h2>
        <div class="ak-wonder-vis"><div class="ak-glow" aria-hidden="true"></div><div class="ak-host ak-host-wonder" data-shape="${w.shape}" data-palette="${w.palette}"></div></div>
        <p class="ak-wonder-hint">${ic('hand', 14, 2)} ${esc(C.wonder.hint)}</p>
      </div>
      ${sug.length ? `<h2 class="ak-h2">Or try one of these</h2><div class="ak-sugs">${sug.map((id) => `<button type="button" class="ak-sug" data-act="ask" data-q="${id}"><span class="ak-sug-g">${glyph(A[id].shape, A[id].palette, 260, 0.04)}</span><span class="ak-sug-k">${esc(KIND_LABEL[A[id].type] || '')}</span><span class="ak-sug-q">${esc(A[id].q)}</span></button>`).join('')}</div>` : ''}
      ${recentHTML()}
    </div>`;
  }
  const KIND_LABEL = { explain: 'How it works', compare: 'This or that', scale: 'How big', myth: 'True or not', course: 'Learn a skill', artifact: 'Make and share' };
  function recentHTML() {
    const ks = order.filter((k) => convos.get(k) && hasSeen(convos.get(k))).slice(0, 3);
    if (!ks.length) return '';
    return `<section class="ak-recent"><div class="ak-recent-head"><h2 class="ak-h2">Your recent branches</h2><button type="button" class="ak-link ak-recent-all" data-act="histmap">${ic('map', 16, 2.2)} See map</button></div>
      <div class="ak-recent-card">${ks.map((k) => { const c = convos.get(k), r = rootOf(c), br = [...c.nodes.values()].filter((n) => n.parent);
        return `<button type="button" class="ak-tree" data-act="open-convo" data-k="${k}"><span class="ak-tree-root">${glyph(r.shape, r.palette, 260, 0.035)}</span><span class="ak-tree-main"><b>${esc(r.kind === 'answer' ? A[k].q : r.q)}</b>${br.length ? `<span class="ak-tree-br">${br.slice(0, 3).map((n) => `<i style="--c:${fam(n.palette)[1]}"></i>${esc(n.label)}`).join('<em aria-hidden="true">·</em>')}</span>` : `<span class="ak-tree-br is-none">${esc(c.when)}</span>`}</span><span class="ak-tree-chev">${ic('chev', 18, 2.2)}</span></button>`; }).join('')}</div></section>`;
  }
  function renderB() {
    homeEl.innerHTML = `<div class="ak-bmap"></div>
      <header class="ak-bhead"><h1 class="ak-title">Your curiosity map</h1><p>Every question you ask stays here. Tap one to pick it back up.</p></header>
      <div class="ak-bdock">${boxHTML('Ask anything new…', 'b')}</div>`;
    bView = makeMap(homeEl.querySelector('.ak-bmap'), { overlay: false, liveHub: true, top: 136, bottom: 186, onPick: pickHist });
    bView.setData(histMapData(true), null);
  }
  function renderC() {
    homeEl.innerHTML = `<div class="ak-c">
      <p class="ak-c-say" data-say aria-live="polite">Hi. What’s on your mind?</p>
      <p class="ak-c-sub" data-sub></p>
      <div class="ak-c-stage" data-stage>
        <div class="ak-glow" aria-hidden="true"></div>
        <div class="ak-host ak-host-c"></div>
        <div class="ak-cam" data-cam hidden>
          <div class="ak-cam-scene" aria-hidden="true"><svg viewBox="0 0 120 150" class="ak-cam-leaf"><defs><linearGradient id="akCamL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2A93B"/><stop offset="1" stop-color="#C2410C"/></linearGradient></defs><path d="M60 6C104 26 100 96 60 128 20 96 16 26 60 6z" fill="url(#akCamL)"/><path d="M60 126v20" stroke="#6B4A2B" stroke-width="4" stroke-linecap="round"/><path d="M60 22v100M60 50L36 38M60 50l24-12M60 72L32 60M60 72l28-12M60 94L38 84M60 94l22-10" stroke="rgba(255,255,255,.5)" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg></div>
          <i class="ak-cam-c tl"></i><i class="ak-cam-c tr"></i><i class="ak-cam-c bl"></i><i class="ak-cam-c br"></i>
          <p class="ak-cam-hint">Point at anything</p><div class="ak-cam-flash"></div>
        </div>
        <p class="ak-c-heard" data-heard></p>
      </div>
      <div class="ak-c-modes" role="tablist" style="--i:0"><i class="ak-seg-thumb" aria-hidden="true"></i>${[['type', 'Type'], ['talk', 'Talk'], ['show', 'Show']].map(([m, l], k) => `<button type="button" role="tab" data-act="cmode" data-m="${m}" data-i="${k}" aria-selected="${k === 0}">${ic(m === 'type' ? 'type' : m === 'talk' ? 'mic' : 'camera', 18, 2.2)}<span>${l}</span></button>`).join('')}</div>
      <div class="ak-c-panel" data-panel></div>
    </div>`;
    setCMode('type', true);
  }
  function setCMode(m, quiet) {
    stopC();
    cState.mode = m;
    const modes = homeEl.querySelector('.ak-c-modes'); if (!modes) return;
    const i = ['type', 'talk', 'show'].indexOf(m);
    modes.style.setProperty('--i', i);
    modes.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-selected', k === i));
    const panel = homeEl.querySelector('[data-panel]'), cam = homeEl.querySelector('[data-cam]'), heard = homeEl.querySelector('[data-heard]');
    heard.textContent = ''; heard.classList.remove('is-on');
    cam.hidden = m !== 'show'; homeEl.querySelector('.ak-c').classList.toggle('is-cam', m === 'show'); homeEl.querySelector('.ak-c').classList.remove('is-shot'); cam.classList.remove('is-shot');
    const sub = homeEl.querySelector('[data-sub]'); sub.textContent = { type: 'Type it, say it, or show me something.', talk: 'Tap the mic and ask out loud.', show: 'Point your camera at anything.' }[m];
    if (m === 'type') { panel.innerHTML = boxHTML('Type your question…', 'c'); sayC('Hi. What’s on your mind?'); }
    if (m === 'talk') { panel.innerHTML = `<button type="button" class="ak-mic" data-act="mic" aria-pressed="false"><span class="ak-mic-ring" aria-hidden="true"></span>${ic('mic', 26, 2.2)}</button><p class="ak-c-hint" data-hint>Tap to talk</p>`; sayC('Go ahead. I’m all ears.'); }
    if (m === 'show') { panel.innerHTML = `<button type="button" class="ak-shutter" data-act="shutter" aria-label="Take a photo"><i></i></button><p class="ak-c-hint" data-hint>Tap to snap</p>`; sayC('Show me something.'); }
    if (shown && view === 'home') { BR.mode(m === 'talk' ? 'idle' : 'idle'); if (m !== 'show') BR.shape('brain', 'cobalt', 900); }
    if (!quiet) BR.pulse();
  }
  const sayC = (t) => { const s = homeEl.querySelector('[data-say]'); if (s && s.textContent !== t) { s.textContent = t; pop(s); } };
  function stopC() { cState.timers.forEach(clearTimeout); cState.timers = []; cState.listening = false; }
  const cT = (fn, ms) => cState.timers.push(setTimeout(fn, still() ? 0 : ms));
  function micTap(btn) {
    if (cState.listening) { stopC(); btn.setAttribute('aria-pressed', 'false'); btn.classList.remove('is-on'); BR.mode('idle'); homeEl.querySelector('[data-hint]').textContent = 'Tap to talk'; sayC('No rush. Tap when you’re ready.'); homeEl.querySelector('[data-heard]').classList.remove('is-on'); return; }
    cState.listening = true; btn.setAttribute('aria-pressed', 'true'); btn.classList.add('is-on');
    BR.mode('listen'); BR.pulse(); sayC('I’m listening…');
    homeEl.querySelector('[data-hint]').textContent = 'Listening. Tap to stop';
    const heard = homeEl.querySelector('[data-heard]'), words = C.talk.transcript.split(' ');
    heard.innerHTML = ''; heard.classList.add('is-on');
    words.forEach((w, k) => cT(() => { if (k) heard.appendChild(document.createTextNode(' ')); const sp = document.createElement('span'); sp.textContent = w; heard.appendChild(sp); BR.pulse(); }, 700 + k * 210));
    const end = 700 + words.length * 210;
    cT(() => { BR.mode('think'); sayC('Got it. Let me show you.'); homeEl.querySelector('[data-hint]').textContent = 'Got it'; btn.classList.remove('is-on'); }, end + 250);
    cT(() => { cState.listening = false; openQuestion(C.talk.transcript, { o: localPt(homeEl.querySelector('.ak-c-stage')), src: 'talk' }); }, end + 1000);
  }
  function shutter() {
    const cam = homeEl.querySelector('[data-cam]'); if (cam.classList.contains('is-shot')) return;
    cam.classList.add('is-shot'); homeEl.querySelector('.ak-c').classList.add('is-shot');
    sayC('Let me look…'); homeEl.querySelector('[data-sub]').textContent = ''; BR.form(); BR.mode('think');
    cT(() => { BR.mode('idle'); BR.shape('ak-leaf', 'society', 1500); }, 650);
    cT(() => {
      sayC(C.show.say);
      homeEl.querySelector('[data-panel]').innerHTML = `<button type="button" class="btn-lit ak-c-ask" data-act="ask" data-q="${C.show.ask}">${esc(A[C.show.ask].q)}</button><button type="button" class="ak-ghost" data-act="retake">${ic('redo', 16, 2.2)} <span>Show something else</span></button>`;
    }, 1600);
  }

  // The character, wherever the home wants it
  function homeBrain() {
    if (view !== 'home' || !shown) return;
    const v = homeEl.dataset.v;
    if (v === 'A') {
      const h = homeEl.querySelector('.ak-host-wonder'), w = A[C.wonder.id];
      BR.take(h, w.shape, w.palette, 1100); BR.mode('listen');
    } else if (v === 'B') {
      const h = bView && bView.hubHost(); if (h) { BR.take(h, 'brain', 'cobalt', 900); BR.mode('idle'); }
    } else {
      BR.take(homeEl.querySelector('.ak-host-c'), cState.mode === 'show' && homeEl.querySelector('[data-cam].is-shot') ? 'ak-leaf' : 'brain', cState.mode === 'show' ? 'society' : 'cobalt', 900); BR.mode('idle');
    }
  }

  // ───────── Events ─────────
  function onClick(e) {
    const t = e.target.closest('[data-act]');
    if (popEl && !e.target.closest('.ak-pop') && !(t && t.dataset.act === 'term')) closePop();
    if (!t || t.disabled) return;
    const act = t.dataset.act, i = +t.dataset.i, sec = t.closest('.ak-sec');
    const b = sec ? blockData(t) : null;
    switch (act) {
      case 'wonder': if (wonderDrag) return; openQuestion(C.wonder.id, { src: 'wonder', o: localPt(homeEl.querySelector('.ak-host-wonder').parentElement), noThink: true }); break;
      case 'ask': if (view === 'chat' && t.closest('.ak-page')) followUp(A[t.dataset.q] ? A[t.dataset.q].q : t.dataset.q); else openQuestion(t.dataset.q, { src: t.closest('.ak-c') ? 'show' : 'suggest', o: localPt(t) }); break;
      case 'open-convo': { const c = convos.get(t.dataset.k); if (c) { c.current = c.current || c.key; enterChat(c, { o: localPt(t) }); } break; }
      case 'histmap': openHistMap(localPt(t)); break;
      case 'back': back(); break;
      case 'crumb': if (t.dataset.id !== cur.current) goNode(t.dataset.id, { dir: 'out' }); break;
      case 'mini': openMap(); break;
      case 'term': if (popEl && popEl._btn === t) closePop(); else openPop(t); break;
      case 'branch': branch(t.dataset.term, popEl && popEl._btn); break;
      case 'unlock': { const a = app(); if (a && a.paywall) a.paywall('ask'); break; }
      case 'guess': pickGuess(sec, b, i); break;
      case 'guess-reset': resetGuess(sec); break;
      case 'breath': setBreath(sec, i); break;
      case 'stage': setPigment(sec, b, i); break;
      case 'cmp': setCompare(sec, b, i); BR.pulse(); break;
      case 'spot': pickSpot(sec.querySelector('[data-spot]'), b, i); break;
      case 'spot-next': { const s = sec.querySelector('[data-spot]'); s.dataset.r = +s.dataset.r + 1; delete s.dataset.locked; renderSpot(s, b); break; }
      case 'spot-again': { const s = sec.querySelector('[data-spot]'); s.dataset.r = 0; s.dataset.score = 0; delete s.dataset.locked; renderSpot(s, b); break; }
      case 'zoom': zoomScale(sec, b, i); break;
      case 'lobes': setLobesBlock(sec, b, i); break;
      case 'mc': pickMyth(sec.querySelector('[data-mc]'), b, i); break;
      case 'mc-next': { const s = sec.querySelector('[data-mc]'); s.dataset.i = +s.dataset.i + 1; renderMyth(s, b); break; }
      case 'mc-again': { const s = sec.querySelector('[data-mc]'); s.dataset.i = 0; s.dataset.score = 0; delete s.dataset.locked; renderMyth(s, b); break; }
      case 'build': emit('course:build', { topic: 'Photography', title: b.title, from: 'ask' }); say('Course builder opens here'); break;
      case 'tip': showTip(sec, b); BR.pulse(); break;
      case 'flip': { const tc = sec.querySelector('[data-tc]'); tc.classList.toggle('is-flipped'); BR.pulse(); break; }
      case 'cardmode': {
        setSeg(sec, 'cardmode', i);
        sec.querySelector('[data-tcwrap]').hidden = i === 1;
        const qz = sec.querySelector('[data-quiz]'); qz.hidden = i !== 1;
        if (i === 1 && !qz.innerHTML) { qz.dataset.i = 0; qz.dataset.score = 0; renderQuiz(qz, b); }
        break;
      }
      case 'qz': pickQuiz(sec.querySelector('[data-quiz]'), b, i); break;
      case 'qz-next': { const q = sec.querySelector('[data-quiz]'); q.dataset.i = +q.dataset.i + 1; renderQuiz(q, b); break; }
      case 'quiz-again': { const q = sec.querySelector('[data-quiz]'); q.dataset.i = 0; q.dataset.score = 0; delete q.dataset.locked; renderQuiz(q, b); break; }
      case 'send-quiz': { try { if (navigator.clipboard) navigator.clipboard.writeText('cortex.app/quiz/octopus').catch(() => {}); } catch (er) { /* noop */ } say('Quiz link copied. Send it to a friend'); break; }
      case 'cmode': setCMode(t.dataset.m); homeBrain(); break;
      case 'mic': micTap(t); break;
      case 'shutter': shutter(); break;
      case 'retake': setCMode('show'); break;
    }
  }
  let wonderDrag = false;
  function onSubmit(e) {
    const f = e.target.closest('form'); if (!f) return;
    e.preventDefault();
    const inp = f.querySelector('input'), v = inp.value.trim(); if (!v) return;
    inp.value = ''; f.querySelector('button[type=submit]').disabled = true; inp.blur();
    if (f.dataset.form === 'follow') { chatEl.classList.remove('is-typing'); followUp(v); return; }
    openQuestion(v, { o: localPt(f), src: 'typed' });
  }
  let typeT = 0;
  function onInput(e) {
    const f = e.target.closest('form'); if (!f) return;
    const has = !!e.target.value.trim();
    f.querySelector('button[type=submit]').disabled = !has;
    if (view === 'home' && homeEl.dataset.v === 'C') {
      BR.mode(has ? 'listen' : 'idle'); if (has) BR.pulse();
      sayC(has ? 'I’m listening…' : 'Hi. What’s on your mind?');
      clearTimeout(typeT); if (has) typeT = setTimeout(() => { if (view === 'home') sayC('Ready when you are. Press send.'); }, 1600);
    }
  }

  // Pinch out (two fingers, or ⌘/ctrl + scroll) on a chat page opens the zoom-out map
  function bindPinch() {
    const ptrs = new Map(); let d0 = 0, acc = 0, accT = 0;
    pagesEl.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; d0 = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
    pagesEl.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d0 - d > 40) { ptrs.clear(); openMap(true); } }
    });
    const up = (e) => ptrs.delete(e.pointerId);
    pagesEl.addEventListener('pointerup', up); pagesEl.addEventListener('pointercancel', up);
    pagesEl.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const now = performance.now(); if (now - accT > 400) acc = 0; accT = now;
      if (e.deltaY > 0) { acc += e.deltaY; const pg = cur && cur.nodes.get(cur.current); if (pg && pg.page) pg.page.style.transform = `scale(${(1 - Math.min(acc, 60) / 600).toFixed(3)})`; if (acc > 50) { acc = 0; if (pg && pg.page) pg.page.style.transform = ''; openMap(true); } }
      clearTimeout(bindPinch.t); bindPinch.t = setTimeout(() => { const pg = cur && cur.nodes.get(cur.current); if (pg && pg.page) pg.page.style.transform = ''; }, 260);
    }, { passive: false });
  }

  // ───────── Mount / show / hide ─────────
  function mount(viewEl) {
    if (mounted) return; mounted = true;
    defineShapes();
    root = document.createElement('div'); root.className = 'ak-root';
    root.innerHTML = `
      <div class="ak-home"></div>
      <div class="ak-chat" hidden>
        <div class="ak-pages"></div>
        <header class="ak-bar"><button type="button" class="ak-round" data-act="back" aria-label="Back to Ask home">${ic('back', 22, 2.4)}</button><nav class="ak-trail" aria-label="Where you are"></nav></header>
        <div class="ak-fade" aria-hidden="true"></div>
        <form class="ak-comp" data-form="follow" autocomplete="off"><span class="ak-comp-ic">${ic('sparkle', 18)}</span><label class="ak-sr" for="akFollow">Ask a follow-up</label><input id="akFollow" type="text" placeholder="Ask a follow-up…" enterkeyhint="send" autocomplete="off"><button type="submit" class="ak-send" aria-label="Ask" disabled>${ic('up', 20, 2.4)}</button></form>
        <button type="button" class="ak-mini" data-act="mini" aria-label="Zoom out to the map"><svg viewBox="-32 -32 64 64" aria-hidden="true"></svg></button>
        <div class="ak-maphost"></div>
      </div>
      <div class="ak-histmap"></div>`;
    viewEl.appendChild(root);
    homeEl = root.querySelector('.ak-home'); chatEl = root.querySelector('.ak-chat'); pagesEl = root.querySelector('.ak-pages');
    trailEl = root.querySelector('.ak-trail'); backBtn = root.querySelector('[data-act="back"]'); miniBtn = root.querySelector('.ak-mini');
    compForm = root.querySelector('.ak-comp'); mapHost = root.querySelector('.ak-maphost');
    root.addEventListener('click', onClick);
    root.addEventListener('submit', onSubmit);
    root.addEventListener('input', onInput);
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closePop(); if (chatEl.classList.contains('is-typing')) { compForm.querySelector('input').blur(); } }
      const w = e.target.closest && e.target.closest('.ak-wonder'); if (w && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); w.click(); }
      const h = e.target.closest && e.target.closest('[data-act="hold"]'); if (h && (e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); holdPurr(h.closest('.ak-sec'), true); }
    });
    root.addEventListener('keyup', (e) => { const h = e.target.closest && e.target.closest('[data-act="hold"]'); if (h && (e.key === ' ' || e.key === 'Enter')) holdPurr(h.closest('.ak-sec'), false); });
    // hold-to-purr
    root.addEventListener('pointerdown', (e) => { const h = e.target.closest('[data-act="hold"]'); if (h) { e.preventDefault(); try { h.setPointerCapture(e.pointerId); } catch (er) { /* noop */ } holdPurr(h.closest('.ak-sec'), true); } });
    const release = (e) => { const h = e.target.closest && e.target.closest('[data-act="hold"]'); if (h) holdPurr(h.closest('.ak-sec'), false); };
    root.addEventListener('pointerup', release); root.addEventListener('pointercancel', release); root.addEventListener('lostpointercapture', release, true);
    root.addEventListener('input', (e) => { if (e.target.matches('[data-act="wave"]')) { const sec = e.target.closest('.ak-sec'), v = +e.target.value; drawWave(sec.querySelector('[data-wv]'), v); const b = blockData(e.target); sec.querySelector('[data-cap]').textContent = b.cap[v > 6 ? 1 : 0]; BR.pulse(); } });
    // the wonder: drag to poke the particles; a clean tap opens it
    let wd = null;
    root.addEventListener('pointerdown', (e) => { if (e.target.closest('.ak-wonder')) { wd = [e.clientX, e.clientY]; wonderDrag = false; } }, true);
    root.addEventListener('pointermove', (e) => { if (wd && Math.hypot(e.clientX - wd[0], e.clientY - wd[1]) > 10) wonderDrag = true; }, true);
    root.addEventListener('pointerup', () => { wd = null; setTimeout(() => { wonderDrag = false; }, 0); }, true);
    // the composer grows to full width while you type
    compForm.addEventListener('focusin', () => chatEl.classList.add('is-typing'));
    compForm.addEventListener('focusout', () => setTimeout(() => { if (!compForm.contains(document.activeElement)) chatEl.classList.remove('is-typing'); }, 0));
    bindPinch();
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && shown) closePop(); });

    // Demo history: questions you asked before, and the branches you took
    C.history.slice().reverse().forEach((h) => {
      if (!A[h.id]) return;
      const c = newConvo(h.id, { past: true, when: h.when });
      (h.branches || []).forEach((tid) => { if (T[tid]) { addBranchNode(c, tid, h.id, { past: true }); EXP.add(tid); } });
      EXP.add(h.id);
    });

    if (window.Bus) {
      Bus.on('variant:change', ({ key }) => { if (key !== 'askHome' || !mounted) return; if (view === 'chat') { closeMap(true); cur && cur.nodes.forEach((n) => n.page && n.page.classList.add('is-off')); chatEl.hidden = true; view = 'home'; homeEl.hidden = false; if (shown && app()) app().setTabBar(true); } renderHome(); homeBrain(); });
      Bus.on('store:change', ({ patch }) => {
        if (!patch || !('plan' in patch)) return;
        if (isPlus()) { unlockAll(); if (pendingBranch && cur && cur.key === pendingBranch.convo) { const pb = pendingBranch; pendingBranch = null; addBranchNode(cur, pb.tid, cur.current); goNode(pb.tid, { dir: 'in', o: pb.o }); } }
      });
      Bus.on('paywall:close', ({ reason, upgraded }) => {
        if (!upgraded) { locked.forEach((t) => t.el.classList.add('is-pill')); if (reason === 'branch') pendingBranch = null; }
      });
      Bus.on('ask:open', (d) => {
        if (!d || !d.question) return;
        const a = app(); if (a && a.current && a.current() !== 'ask') a.showTab('ask');
        if (view === 'chat') { closeMap(true); cur && cur.nodes.forEach((n) => n.page && n.page.classList.add('is-off')); chatEl.hidden = true; view = 'home'; homeEl.hidden = false; }
        openQuestion(d.question, { src: 'ask:open' });
      });
    }
    renderHome();
  }

  function show() {
    if (!mounted) return;
    shown = true;
    if (view === 'home') { renderHome(); if (app()) app().setTabBar(true); homeBrain(); }
    else {
      if (app()) app().setTabBar(false);
      const n = cur && cur.nodes.get(cur.current), last = n && n.turns && n.turns[n.turns.length - 1];
      if (last) { BR.take(last.host, last.shape, last.palette, 900); if (last.key === 'brain') BR.setLobes(0.4); }
    }
    if (!hooksRan) { hooksRan = true; testHooks(); }
  }
  function hide() {
    shown = false;
    closePop(); stopC(); closeMap(true);
    BR.mode('idle'); BR.setLobes(0);
  }

  // ───────── URL hooks for screenshots ─────────
  //   akq=<answer id or text>  open a question   ·  akpath=larynx,vibration  branch along a path
  //   akpop=<term id>  open a term's popover      ·  akmap=1  open the zoom-out map  ·  akhist=1  the history map
  //   akmode=talk|show  (home C)                  ·  akfollow=<text>  ask a follow-up
  function testHooks() {
    const q = P.get('akq'); const fast = still() ? 0 : 1;
    const steps = [];
    if (P.get('akmode') && homeEl.dataset.v === 'C') steps.push([0, () => { setCMode(P.get('akmode')); homeBrain(); }]);
    if (P.has('akhist')) steps.push([300, () => openHistMap()]);
    if (q) steps.push([100, () => openQuestion(q, { src: A[q] && q === C.wonder.id ? 'wonder' : 'typed', instant: P.has('akinstant') })]);
    (P.get('akpath') || '').split(',').filter((t) => T[t]).forEach((tid) => steps.push([P.has('akinstant') ? 200 : 2600, () => { const b = cur && cur.nodes.get(cur.current).page.querySelector(`.ak-term[data-term="${tid}"]`); branch(tid, b); }]));
    if (P.get('akfollow')) steps.push([2600, () => followUp(P.get('akfollow'))]);
    if (P.get('akpop')) steps.push([P.has('akinstant') ? 300 : 2800, () => { const pg = cur && cur.nodes.get(cur.current).page; const b = pg && pg.querySelector(`.ak-term[data-term="${P.get('akpop')}"]`); if (b) { b.scrollIntoView({ block: 'center' }); setTimeout(() => openPop(b), 120); } }]);
    if (P.has('akmap')) steps.push([P.has('akinstant') ? 300 : 2400, () => openMap()]);
    let tt = 0; steps.forEach(([d, fn]) => { tt += d * fast; setTimeout(fn, tt); });
  }

  window.Ask = { mount, show, hide };
})();
