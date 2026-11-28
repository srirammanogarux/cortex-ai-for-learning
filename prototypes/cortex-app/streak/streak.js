// Cortex streak flame. window.Streak. Living Matter.
//
//   const f = Streak.flame(el, { style: 1..5, days: 12, state: 'lit', heat: 1, size: 120 });
//   f.set({ state: 'risk', heat: .3 }); f.extend().then(...); f.destroy();
//   Streak.chip(el, opts) · Streak.widget(el, opts) · Streak.moment(layerEl, name, opts) → Promise
//
// The flame is made of the brand's backlit cells. Heat is particle density, brightness and rise.
// Each instance owns one canvas; one shared rAF drives them all. Small ones (≤ 80px) run at 30fps, staggered across frames.
// `.still` on <html> (or ?still, or prefers-reduced-motion) renders final poses only.
(function () {
  'use strict';
  const HTML = document.documentElement;
  const RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const Q = new URLSearchParams(location.search);
  if (Q.has('still')) HTML.classList.add('still');
  const isStill = () => HTML.classList.contains('still') || RM.matches;
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const easeInOut = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const backOut = (t) => { t = clamp(t); const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const now = () => performance.now();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ───────── Vocabulary ─────────
  const STYLES = [
    { id: 1, key: 'swarm', name: 'Ember swarm', note: 'Warm cells rise and flicker inside a flame. More heat, more cells.' },
    { id: 2, key: 'cells', name: 'Cell flame', note: 'Big backlit cells packed around a glowing core. Buds drift off the tip.' },
    { id: 3, key: 'line', name: 'Living line', note: 'One ember line draws the flame. It fills with light when lit.' },
    { id: 4, key: 'brain', name: 'Spark brain', note: 'The brain lights up and sends a plume of sparks upward.' },
    { id: 5, key: 'bloom', name: 'Seed to bloom', note: 'A seed that opens into a flame flower. More days, more petals.' },
  ];
  const KEYS = STYLES.map((s) => s.key);
  const STATES = ['unlit', 'lit', 'risk', 'frozen', 'broken', 'winback', 'repaired', 'born', 'milestone'];
  const LABELS = { unlit: 'Not lit today', lit: 'Lit', risk: 'At risk', frozen: 'Frozen', broken: 'Broken', winback: 'Win back', repaired: 'Repaired', born: 'New streak', milestone: 'Milestone' };
  const MILESTONES = [7, 14, 30, 100];
  const TIER_DAYS = [0, 1, 7, 30, 100, 365];
  const TSCALE = [0.3, 0.56, 0.66, 0.75, 0.83, 0.9];
  const TSCALE_SMALL = [0.42, 0.74, 0.8, 0.85, 0.9, 0.94]; // chip size: fill the box so it reads at 24px
  function styleKey(s) { if (typeof s === 'number' || /^\d$/.test(String(s))) return KEYS[clamp((+s) - 1, 0, 4)]; return KEYS.includes(s) ? s : 'swarm'; }
  function tierOf(d) { let t = 0; for (let i = 1; i < TIER_DAYS.length; i++) if (d >= TIER_DAYS[i]) t = i; return t; }
  function growOf(d) {
    const t = tierOf(d); if (t === 0) return 0;
    if (t === 5) return clamp(Math.log(d / 365) / Math.log(3));
    return clamp(Math.log(d / TIER_DAYS[t]) / Math.log(TIER_DAYS[t + 1] / TIER_DAYS[t]));
  }
  const lerpArr = (A, x) => { x = clamp(x, 0, A.length - 1); const i = Math.min(A.length - 2, x | 0); return lerp(A[i], A[i + 1], x - i); };
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  // What the flame should look like for a given state. Every key is eased, so states morph.
  function targets(o) {
    const s = STATES.includes(o.state) ? o.state : 'lit', h = clamp(o.heat == null ? 1 : +o.heat);
    const d = Math.max(0, Math.round(+o.days || 0));
    const T = { tier: tierOf(d), grow: growOf(d), heat: 1, lit: 1, frost: 0, ghost: 0, ember: 0, jitter: 0, ring: 0, corona: 0, born: 0 };
    switch (s) {
      case 'unlit': T.lit = 0; T.heat = 0.32 + 0.43 * h; break;          // shrinks and dims through the day, never grey
      case 'risk': T.lit = 0; T.heat = 0.14 + 0.24 * h; T.jitter = 1; break;
      case 'frozen': T.lit = 0; T.heat = 0.66; T.frost = 1; break;
      case 'broken': T.lit = 0; T.heat = 0.75; T.ember = 1; T.tier = 0; T.grow = 0; break;
      case 'winback': T.lit = 0; T.heat = 0.62; T.ghost = 1; break;
      case 'repaired': T.ring = 1; break;
      case 'born': T.born = 1; T.tier = Math.max(1, T.tier); break;
      case 'milestone': T.corona = 1; break;
    }
    if (d === 0 && s !== 'broken' && s !== 'born') { T.ember = 1; T.tier = 0; } // nothing yet: an ember, waiting
    return T;
  }

  // ───────── Colour ─────────
  // Hot (0) to cool (1). Light ramps keep contrast on Bone; dark ramps glow on Humus.
  const WARM_L = [[252, 196, 84], [247, 160, 60], [240, 122, 80], [216, 80, 44], [184, 58, 28], [128, 36, 16]];
  const WARM_D = [[255, 242, 206], [255, 210, 124], [251, 164, 84], [242, 114, 64], [204, 68, 32], [150, 44, 20]];
  const FROST_L = [[146, 200, 228], [116, 178, 214], [90, 154, 196], [70, 128, 176], [54, 104, 152], [40, 82, 126]];
  const FROST_D = [[238, 249, 255], [204, 234, 250], [164, 210, 238], [126, 180, 222], [96, 150, 200], [74, 122, 172]];
  function ramp(R, u) { u = clamp(u) * (R.length - 1); const i = Math.min(R.length - 2, u | 0), f = u - i, a = R[i], b = R[i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]; }
  const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const lighten = (c, k) => [c[0] + (255 - c[0]) * k, c[1] + (255 - c[1]) * k, c[2] + (255 - c[2]) * k];
  const scale3 = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  const rgba = (c, a) => `rgba(${clamp(c[0], 0, 255) | 0},${clamp(c[1], 0, 255) | 0},${clamp(c[2], 0, 255) | 0},${a})`;

  // Sprites, cached by kind and 5-bit colour: 0 cell (membrane + nucleus), 1 empty membrane, 2 glow, 3 halo, 4 core
  const SPR = new Map();
  function sprite(kind, c) {
    const r = clamp(c[0], 0, 255) | 0, g = clamp(c[1], 0, 255) | 0, b = clamp(c[2], 0, 255) | 0;
    const key = kind * 32768 + (((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3));
    let s = SPR.get(key); if (s) return s;
    if (SPR.size > 5000) SPR.clear();
    const S = kind >= 3 ? 64 : 48;
    s = document.createElement('canvas'); s.width = s.height = S;
    const x = s.getContext('2d'), C = [r, g, b];
    if (kind === 0) {
      const m = x.createRadialGradient(S * 0.44, S * 0.42, 0, S / 2, S / 2, S / 2);
      m.addColorStop(0, rgba(lighten(C, 0.5), 0.92)); m.addColorStop(0.46, rgba(C, 0.84));
      m.addColorStop(0.78, rgba(scale3(C, 0.86), 0.98)); m.addColorStop(0.9, rgba(scale3(C, 0.78), 0.8)); m.addColorStop(1, rgba(C, 0));
      x.fillStyle = m; x.fillRect(0, 0, S, S);
      x.fillStyle = rgba(scale3(C, 0.55), 0.38); x.beginPath(); x.arc(S * 0.43, S * 0.43, S * 0.12, 0, TAU); x.fill();
    } else if (kind === 1) {
      const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      m.addColorStop(0, rgba(C, 0.04)); m.addColorStop(0.62, rgba(C, 0.1)); m.addColorStop(0.8, rgba(C, 0.92)); m.addColorStop(0.92, rgba(C, 0.55)); m.addColorStop(1, rgba(C, 0));
      x.fillStyle = m; x.fillRect(0, 0, S, S);
    } else if (kind === 2) {
      const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      m.addColorStop(0, 'rgba(255,244,224,1)'); m.addColorStop(0.28, rgba(C, 0.8)); m.addColorStop(1, rgba(C, 0));
      x.fillStyle = m; x.fillRect(0, 0, S, S);
    } else if (kind === 3) {
      const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      m.addColorStop(0, rgba(C, 0.62)); m.addColorStop(0.45, rgba(C, 0.26)); m.addColorStop(1, rgba(C, 0));
      x.fillStyle = m; x.fillRect(0, 0, S, S);
    } else {
      const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      m.addColorStop(0, 'rgba(255,251,236,1)'); m.addColorStop(0.3, rgba(lighten(C, 0.45), 0.9)); m.addColorStop(0.65, rgba(C, 0.32)); m.addColorStop(1, rgba(C, 0));
      x.fillStyle = m; x.fillRect(0, 0, S, S);
    }
    SPR.set(key, s); return s;
  }

  // The flame silhouette: half-width at height u (0 base → 1 tip), max 1 at u ≈ .31. Round bottom, pointed tip.
  const fs = (u) => (u <= 0 || u >= 1 ? 0 : Math.sqrt(u) * Math.pow(1 - u, 1.1) / 0.3702);
  const FS_AREA = (() => { let a = 0; for (let i = 0; i < 200; i++) a += fs((i + 0.5) / 200) / 200; return a; })();

  function dart(R, n, inside, minD, x0, x1, y0, y1) {
    const pts = []; let k = 0;
    while (pts.length < n && k < 9000) {
      k++; const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0);
      if (!inside(x, y)) continue;
      let ok = true; for (let i = 0; i < pts.length; i++) { const dx = pts[i][0] - x, dy = pts[i][1] - y; if (dx * dx + dy * dy < minD * minD) { ok = false; break; } }
      if (ok) pts.push([x, y]); else if (k > 6000) minD *= 0.995;
    }
    return pts;
  }
  function flow(R, n) { // a pool of rising particles: height u, lateral x, speed, ceiling, size, phase
    const A = { n, u: new Float32Array(n), x: new Float32Array(n), sp: new Float32Array(n), ce: new Float32Array(n), rs: new Float32Array(n), ph: new Float32Array(n) };
    for (let i = 0; i < n; i++) { A.ce[i] = 0.62 + 0.38 * R(); A.u[i] = R() * A.ce[i]; A.x[i] = R() + R() - 1; A.sp[i] = 0.3 + 0.42 * R(); A.rs[i] = 0.6 + 0.75 * R(); A.ph[i] = R() * TAU; }
    return A;
  }
  function stepFlow(A, i, I, spd, dt) {
    if (!dt) return;
    A.u[i] += A.sp[i] * spd * dt * 0.95;
    if (A.u[i] > A.ce[i]) { A.u[i] -= A.ce[i]; A.x[i] = I.rand() + I.rand() - 1; }
  }
  const lifeA = (u, ce) => { const l = u / ce; return clamp(l / 0.1) * (1 - clamp((l - 0.55) / 0.45)); };

  // ───────── The five styles ─────────
  const STY = {
    // 1 · Ember swarm: loose cells rise and flicker inside the flame shape; density = heat.
    swarm: {
      init(I) { const A = flow(I.rand, I.small ? 9 : Math.round(clamp(I.size * (I.size > 120 ? 2.6 : 1.7), 30, 760))); for (let i = 0; i < A.n; i++) A.rs[i] = 0.55 + 0.5 * I.rand(); return A; },
      draw(I, g, G, A) {
        const P = I.P;
        if (G.small) I.silhouette(g, G, 0.92);
        I.core(g, G.cx, G.by - G.H * 0.24, G.H * 0.46, P.lit * (1 - P.frost) * (1 - P.ghost) * G.heat * 0.9);
        const spd = (0.45 + 0.75 * G.heat) * (1 - P.frost) * (1 - 0.82 * P.ghost) * I.boost * (1 + P.jitter * 0.5);
        const act = Math.round(A.n * clamp((0.26 + 0.74 * G.heat) * (0.62 + 0.076 * P.tier)));
        for (let i = 0; i < A.n; i++) {
          stepFlow(A, i, I, spd, G.dt);
          if (i >= act) continue;
          const u = A.u[i], a = lifeA(u, A.ce[i]);
          const x = G.cx + A.x[i] * G.hw(u) * 0.9 + G.sway(u) + (G.still ? 0 : Math.sin(G.t * 6 + A.ph[i]) * 0.014 * G.H * u);
          const y = G.by - u * G.H;
          const r = Math.max(G.minR, G.H * (G.small ? 0.14 : (I.size > 120 ? 0.042 : 0.058)) * A.rs[i] * (1 - 0.6 * u) * (1 + 0.25 * (1 - Math.abs(A.x[i]))));
          I.dot(g, u * 0.85 + Math.abs(A.x[i]) * 0.22, x, y, r, a * G.alpha);
        }
      },
    },
    // 2 · Cell flame: big packed cells around a glowing core; buds drift off the tip.
    cells: {
      init(I) {
        const R = I.rand, K = I.small ? 6 : Math.round(clamp(9 + I.size * 0.16, 9, 58)), w = 0.36;
        const minD = Math.sqrt(2 * w * FS_AREA / K) * 0.9;
        const raw = dart(R, K, (x, u) => Math.abs(x) < w * fs(u) * 0.86, minD, -w, w, 0.05, 0.9);
        const pts = raw.map(([x, u]) => ({ u, rx: x / (w * fs(u)), r: minD * 0.7 * (1 - 0.28 * u), ph: R() * TAU }));
        pts.sort((a, b) => b.u - a.u || Math.abs(b.rx) - Math.abs(a.rx));
        return { pts };
      },
      draw(I, g, G, A) {
        const P = I.P, H = G.H, t = G.t;
        if (G.small) I.silhouette(g, G, 0.55);
        I.core(g, G.cx + G.sway(0.3), G.by - H * 0.3, H * 0.6 * (0.6 + 0.4 * G.heat), (0.3 + 0.7 * P.lit) * G.heat * (1 - P.frost * 0.7) * (1 - 0.7 * P.ghost));
        for (const p of A.pts) {
          const j = G.still ? 0 : 1;
          const x = G.cx + p.rx * G.hw(p.u) + G.sway(p.u) + j * Math.sin(t * 1.3 + p.ph) * 0.018 * H;
          const y = G.by - p.u * H + j * Math.cos(t * 1.1 + p.ph) * 0.012 * H;
          const r = Math.max(G.minR * 1.4, p.r * H * (1 + j * 0.07 * Math.sin(t * 1.7 + p.ph)));
          I.dot(g, p.u * 0.78 + Math.abs(p.rx) * 0.3, x, y, r, 0.96 * G.alpha);
        }
        if (G.small) return;
        // buds: cells pinch off the tip and float up
        const bk = (1 - P.frost) * (1 - P.ghost) * G.heat * (1 - P.ember);
        if (bk > 0.02) for (let k = 0; k < 3; k++) {
          const p = G.still ? 0.3 + k * 0.22 : (t * 0.34 * (0.7 + 0.6 * G.heat) + k / 3) % 1;
          const x = G.cx + G.sway(1) + Math.sin(t * 1.4 + k * 2.1) * 0.07 * H, y = G.by - H * (0.9 + p * 0.42);
          I.dot(g, 0.5 + p * 0.4, x, y, Math.max(0.8, H * 0.055 * (1 - p * 0.55)), Math.sin(Math.PI * p) * bk);
        }
        // higher tiers: a crown, then an outer ring of small cells
        const cr = clamp(P.tier - 3) * (1 - P.ember);
        if (cr > 0.01) for (let k = 0; k < 6; k++) {
          const a = -Math.PI / 2 + (k - 2.5) * 0.36, rr = H * 0.2;
          const x = G.cx + G.sway(0.9) + Math.cos(a) * rr * 1.4, y = G.by - H * 0.8 + Math.sin(a) * rr * 0.6 - (G.still ? 0 : Math.sin(t * 2 + k) * 0.02 * H);
          I.dot(g, 0.05, x, y, H * 0.045, cr * 0.95 * G.alpha);
        }
        const ring = clamp(P.tier - 4) * (1 - P.ember);
        if (ring > 0.01) for (let k = 0; k < 14; k++) {
          const a = k / 14 * TAU + (G.still ? 0 : t * 0.18);
          const RR = Math.min(H * 0.58, G.S * 0.44); I.dot(g, 0.15 + (k % 3) * 0.2, G.cx + Math.cos(a) * RR, G.S * 0.52 + Math.sin(a) * RR, H * 0.03, ring * 0.9);
        }
      },
    },
    // 3 · Living line: one ember stroke draws the flame; lit fills it with light; cells live inside.
    line: {
      init(I) { return flow(I.rand, I.small ? 0 : 26); },
      draw(I, g, G, A) {
        const P = I.P, t = G.t, S = G.S, H = G.small ? G.H : G.H / (1 + 0.27 * easeOut(clamp(P.tier - 2) * (1 - clamp(P.ember)))), w = G.W / G.H;
        const X = (x, u) => G.cx + x * H + G.sway(u, H), Y = (u) => G.by - u * H;
        const wob = (u, s) => (G.still ? 0 : 0.014 * Math.sin(u * 11 + t * 2.3 + s) * u);
        const M = G.small ? 16 : 40, out = [];
        for (let i = 0; i <= M; i++) { const u = i / M; out.push([X(-w * fs(u) + wob(u, 0), u), Y(u)]); }
        for (let i = M - 1; i >= 0; i--) { const u = i / M; out.push([X(w * fs(u) + wob(u, 2), u), Y(u)]); }
        // fill with light when lit
        const fillA = P.lit * (1 - P.frost) * (1 - P.ghost) * G.heat;
        if (fillA > 0.01) {
          g.beginPath(); smooth(g, out, true);
          const gr = g.createRadialGradient(G.cx, G.by - H * 0.26, 0, G.cx, G.by - H * 0.36, H * 0.74);
          gr.addColorStop(0, I.dark ? 'rgba(255,246,220,.95)' : 'rgba(255,228,160,.95)'); gr.addColorStop(0.45, I.dark ? 'rgba(255,190,100,.7)' : 'rgba(250,170,80,.62)'); gr.addColorStop(1, 'rgba(240,123,90,.12)');
          g.globalAlpha = Math.min(1, fillA); g.fillStyle = gr; g.fill();
        }
        // cells inside
        if (A.n) {
          const act = Math.min(A.n, Math.round((5 + 4 * P.tier) * (0.45 + 0.55 * G.heat)));
          const spd = (0.4 + 0.6 * G.heat) * (1 - P.frost) * (1 - 0.8 * P.ghost) * I.boost;
          for (let i = 0; i < A.n; i++) {
            stepFlow(A, i, I, spd, G.dt); if (i >= act) continue;
            const u = A.u[i] * 0.85;
            I.dot(g, 0.12 + u * 0.7, G.cx + A.x[i] * w * fs(u) * H * 0.55 + G.sway(u, H), G.by - u * H, Math.max(1, H * 0.06 * A.rs[i] * (1 - 0.4 * u)), lifeA(A.u[i], A.ce[i]) * G.alpha);
          }
        }
        // the line itself
        const lw = Math.max(1.7, S * 0.034), col = I.dark ? I.colAt(0.18) : I.colAt(0.8), la = 0.62 + 0.38 * G.heat;
        g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = lw; g.strokeStyle = rgba(col, 1);
        const strokeAll = (paths) => { g.beginPath(); paths.forEach((p) => smooth(g, p, false)); g.stroke(); };
        const paths = [out];
        const g2 = clamp(P.tier - 1) * (1 - clamp(P.ember));
        if (g2 > 0.02) { // inner tongue: the one line carries on up the middle
          const inner = [], h = 0.52 * easeOut(g2), iw = w * 0.46, n = G.small ? 8 : 18;
          inner.push(out[out.length - 1]);
          for (let i = 1; i <= n; i++) { const v = i / n; inner.push([X(-iw * fs(v) + wob(v, 4), v * h), Y(v * h)]); }
          for (let i = n - 1; i >= Math.round(n * 0.45); i--) { const v = i / n; inner.push([X(iw * fs(v) + wob(v, 5), v * h), Y(v * h)]); }
          paths.push(inner);
        }
        const g3 = clamp(P.tier - 2) * (1 - clamp(P.ember)), g4 = clamp(P.tier - 3) * (1 - clamp(P.ember));
        if (g3 > 0.02 && !G.small) { // a larger flame line embraces the first: open at 30 days, closed at 100
          const k = easeOut(g3), sc = 1 + 0.26 * k, outer = [], n = 34, from = 0.16, to = 0.16 + (1 - g4) * 0.5;
          for (let i = 0; i <= n; i++) { const u = from + (1 - from) * i / n; outer.push([X((-w * fs(u) - 0.05) * sc + wob(u, 6), u * sc), Y(u * sc)]); }
          for (let i = n; i >= 0; i--) { const u = to + (1 - to) * i / n; outer.push([X((w * fs(u) + 0.05) * sc + wob(u, 7), u * sc), Y(u * sc)]); }
          paths.push(outer);
        }
        g.globalAlpha = la * (1 - P.ghost);
        if (P.ghost < 0.98) strokeAll(paths);
        if (P.ghost > 0.02) { g.globalAlpha = la * P.ghost; g.setLineDash([lw * 0.2, lw * 2.1]); g.lineDashOffset = G.still ? 0 : -t * lw * 2; strokeAll(paths); g.setLineDash([]); }
        const g5 = clamp(P.tier - 4) * (1 - clamp(P.ember));
        if (g5 > 0.02 && !G.small) {
          g.globalAlpha = g5 * 0.8; g.lineWidth = lw * 0.5; g.strokeStyle = rgba(I.colAt(0.3), 1);
          const RR = S * 0.45, cy = S * 0.5;
          g.beginPath(); g.arc(G.cx, cy, RR, -Math.PI * 0.5 + 0.45, Math.PI * 1.5 - 0.45); g.stroke();
          for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + (G.still ? 0 : t * 0.2); I.dot(g, 0.1, G.cx + Math.cos(a) * RR, cy + Math.sin(a) * RR, lw * 1.1, g5); }
        }
        g.globalAlpha = 1;
      },
    },
    // 4 · Spark brain: the brain cluster glows and sends a plume of sparks up from its crown.
    brain: {
      init(I) {
        const R = I.rand, K = I.small ? 8 : Math.round(clamp(10 + I.size * 0.55, 18, 190));
        const inside = (x, y) => {
          const n = 2.4, r = Math.pow(Math.pow(Math.abs(x), n) + Math.pow(Math.abs(y / 0.74), n), 1 / n);
          const lobe = 1 - 0.05 * Math.cos(10 * Math.atan2(y, x)) * (y > -0.2 ? 1 : 0.3);
          const th = Math.atan2(y, x), fold = Math.sin(7 * th + 3 * r + 2.2 * Math.sin(4 * x)) * Math.sin(6 * y + 2 * x);
          return r < lobe * 0.95 && !(Math.abs(x) < 0.05 && y > 0.1);
        };
        const minD = Math.sqrt(4 * 0.74 * 0.86 / K) * 0.86;
        const pts = dart(R, K, inside, minD, -1, 1, -0.74, 0.74).map(([x, y]) => { const th = Math.atan2(y, x), rr = Math.hypot(x, y); return { x, y, r: minD * 0.62, ph: R() * TAU, fold: Math.sin(7 * th + 4 * rr + 2.2 * Math.sin(4 * x)) * Math.sin(5 * y + 2.5 * x) }; });
        pts.sort((a, b) => b.y - a.y);
        return { pts, F: flow(R, I.small ? 5 : Math.round(clamp(I.size * (I.size > 120 ? 1.5 : 1), 18, 450))) };
      },
      draw(I, g, G, A) {
        const P = I.P, S = G.S, t = G.t, F = A.F;
        const a = S * (G.small ? 0.2 : 0.19) * (0.94 + 0.03 * P.tier), b = a * 0.74, bcy = G.by - b;
        const Hp = Math.max(0, (G.H * 1.02 - b * 1.1) * (1 - clamp(P.ember))), y0 = bcy - b * 0.45;
        const g4 = clamp(P.tier - 3) * (1 - clamp(P.ember));
        const hwP = (u) => a * (0.55 + 0.05 * P.tier) * Math.pow(1 - u, 0.8) * (1 + 0.45 * Math.sin(Math.PI * Math.min(1, u * 1.4)));
        I.core(g, G.cx, y0 - Hp * 0.12, Math.max(a * 0.85, Hp * 0.42), P.lit * G.heat * (1 - P.frost) * (1 - P.ghost) * 0.9);
        if (G.small && Hp > 1) { // a crisp plume shape at chip size
          g.beginPath();
          for (let i = 0; i <= 10; i++) { const u = i / 10; g.lineTo(G.cx - hwP(u) + G.sway(u, Hp), y0 - u * Hp); }
          for (let i = 10; i >= 0; i--) { const u = i / 10; g.lineTo(G.cx + hwP(u) + G.sway(u, Hp), y0 - u * Hp); }
          const gr = g.createLinearGradient(0, y0, 0, y0 - Hp); gr.addColorStop(0, rgba(I.colAt(0.05), 1)); gr.addColorStop(1, rgba(I.colAt(0.6), 1));
          g.globalAlpha = 0.9 * G.alpha; g.fillStyle = gr; g.fill();
        }
        if (Hp > 0.5) {
          const spd = (0.5 + 0.8 * G.heat) * (1 - P.frost) * (1 - 0.82 * P.ghost) * I.boost * (1 + P.jitter * 0.5);
          const act = Math.round(F.n * clamp((0.28 + 0.72 * G.heat) * (0.62 + 0.076 * P.tier)));
          for (let i = 0; i < F.n; i++) {
            stepFlow(F, i, I, spd, G.dt); if (i >= act) continue;
            const u = F.u[i], lane = g4 > 0.02 ? (i % 4 === 0 ? -1 : i % 4 === 1 ? 1 : 0) : 0;
            const hl = lane ? Hp * 0.58 * g4 : Hp, wl = lane ? 0.6 : 1;
            const x = G.cx + lane * (a * 0.55 + u * hl * 0.22) + F.x[i] * hwP(u) * wl + G.sway(u, hl) + (G.still ? 0 : Math.sin(t * 6 + F.ph[i]) * 0.012 * hl * u);
            I.dot(g, u * 0.8 + Math.abs(F.x[i]) * 0.2 + (lane ? 0.08 : 0), x, y0 + (lane ? b * 0.25 : 0) - u * hl, Math.max(G.minR, a * (G.small ? 0.3 : S > 120 ? 0.1 : 0.14) * F.rs[i] * (1 - 0.6 * u)), lifeA(u, F.ce[i]) * G.alpha);
          }
        }
        // the brain, in front; a pulse of light travels up through it when lit
        const lit = P.lit * (1 - P.frost) * (1 - P.ghost);
        for (const p of A.pts) {
          const j = G.still ? 0 : 1;
          const pulse = lit > 0.01 ? Math.pow(Math.max(0, Math.sin(p.y * 4 - p.x * 1.2 - t * 3.2 * j)), 8) * lit : 0;
          const glow = P.ember * (0.5 + 0.5 * Math.sin(t * 2.2 * j - p.y * 2));
          const x = G.cx + (p.x + Math.sign(p.x) * 0.07) * a + j * Math.sin(t * 1.2 + p.ph) * a * 0.015, y = bcy - p.y * b / 0.74;
          const rim = clamp(P.tier - 2) * 0.25 * P.lit * (p.y > 0.25 ? 1 : 0);
          I.dot(g, 0.42 + (1 - p.y) * 0.12 + (p.fold < -0.2 ? 0.22 : -0.04) - pulse * 0.4 - glow * 0.22 - rim, x, y, Math.max(G.minR * 1.4, p.r * a * (p.fold < -0.2 ? 0.8 : 1) * (1 + 0.22 * pulse)), 0.95 * (0.6 + 0.4 * G.alpha));
        }
        if (P.ember > 0.05 && !G.small) { // a single spark waits above the brain
          const k = G.still ? 0.3 : (t * 0.5) % 1;
          I.dot(g, 0.05, G.cx + Math.sin(t * 1.7) * a * 0.2, bcy - b - a * (0.15 + k * 0.5), a * 0.12 * (1 - k * 0.5), P.ember * Math.sin(Math.PI * k));
        }
      },
    },
    // 5 · Seed to bloom: a seed opens into a flame flower. Petals: 1 → 3 → 5 → 7 → 9 across the tiers.
    bloom: {
      init(I) {
        const R = I.rand, petals = [];
        for (let k = -4; k <= 4; k++) petals.push({ k, F: flow(R, I.small ? 0 : Math.round(clamp(I.size * (I.size > 120 ? 0.55 : 0.32), 8, 130) * (1 - 0.1 * Math.abs(k)))) });
        petals.sort((a, b) => Math.abs(b.k) - Math.abs(a.k));
        return { petals };
      },
      draw(I, g, G, A) {
        const P = I.P, S = G.S, t = G.t, H = G.H;
        const rb = S * 0.07 * (1 + 0.05 * P.tier) * (1 + 0.3 * clamp(P.ember)), Bx = G.cx, By = G.by - rb * 1.15;
        const open = 0.32 + 0.68 * clamp(G.heat);
        const spread = (0.36 - 0.028 * P.tier) * open;
        I.core(g, Bx, By - H * 0.3, H * 0.55, P.lit * G.heat * (1 - P.frost) * (1 - P.ghost) * 0.85);
        for (const pt of A.petals) {
          const ak = Math.abs(pt.k), grow = clamp(P.tier - ak) * (1 - clamp(P.ember));
          if (grow < 0.01) continue;
          const L = H * 0.94 * (1 - 0.12 * ak) * easeOut(grow), ang = pt.k * spread, pw = L * 0.3, F = pt.F;
          const sw = (u) => G.sway(u, L) * 0.7;
          const at = (u, x) => { const au = ang * (1 + 0.4 * u); return [Bx + Math.sin(au) * u * L + Math.cos(ang) * x * pw * fs(u) + sw(u), By - Math.cos(au) * u * L + Math.sin(ang) * x * pw * fs(u)]; };
          // the petal's membrane
          g.beginPath();
          for (let i = 0; i <= 12; i++) { const p = at(i / 12, -1); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
          for (let i = 12; i >= 0; i--) { const p = at(i / 12, 1); g.lineTo(p[0], p[1]); }
          const c0 = I.colAt(0.08 + ak * 0.07), c1 = I.colAt(0.55 + ak * 0.08), tip = at(1, 0);
          const gr = g.createLinearGradient(Bx, By, tip[0], tip[1]); gr.addColorStop(0, rgba(c0, 1)); gr.addColorStop(1, rgba(c1, 1));
          g.fillStyle = gr; g.globalAlpha = (G.small ? 0.95 : 0.26 + 0.12 * P.lit) * G.alpha * (1 - 0.6 * P.ghost);
          g.fill();
          if (P.ghost > 0.02 && !G.small) { g.globalAlpha = P.ghost * 0.8; g.lineWidth = Math.max(1, S * 0.012); g.setLineDash([S * 0.012, S * 0.02]); g.strokeStyle = rgba(c1, 1); g.stroke(); g.setLineDash([]); }
          // cells flow up the petal
          const spd = (0.4 + 0.7 * G.heat) * (1 - P.frost) * (1 - 0.8 * P.ghost) * I.boost * (1 + P.jitter * 0.5);
          const act = Math.round(F.n * clamp(0.3 + 0.7 * G.heat));
          for (let i = 0; i < F.n; i++) {
            stepFlow(F, i, I, spd, G.dt); if (i >= act) continue;
            const u = F.u[i], p = at(u, F.x[i] * 0.85);
            I.dot(g, u * 0.75 + ak * 0.08, p[0], p[1], Math.max(G.minR, L * (S > 120 ? 0.045 : 0.065) * F.rs[i] * (1 - 0.5 * u)), lifeA(u, F.ce[i]) * G.alpha);
          }
        }
        // tier 5: a ring of seeds circles the flower
        const r5 = clamp(P.tier - 4) * (1 - clamp(P.ember));
        if (r5 > 0.01 && !G.small) for (let k = 0; k < 12; k++) {
          const a = k / 12 * TAU + (G.still ? 0 : t * 0.15);
          I.dot(g, 0.12 + (k % 2) * 0.3, G.cx + Math.cos(a) * S * 0.44, S * 0.52 + Math.sin(a) * S * 0.42, S * 0.02, r5 * 0.95);
        }
        // the seed
        const pulse = G.still ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.2);
        I.dot(g, 0.3 + 0.25 * (1 - P.lit), Bx, By + rb * 0.15, rb * (S > 120 ? 0.8 : 1) * (1 + 0.06 * pulse * P.ember), 1);
        if (P.ember > 0.05 && !G.small) { // a sprout waits in the seed
          g.globalAlpha = P.ember * 0.9; g.strokeStyle = rgba(I.colAt(0.7), 1); g.lineWidth = Math.max(1.2, S * 0.014); g.lineCap = 'round';
          g.beginPath(); g.moveTo(Bx, By - rb * 0.6); g.quadraticCurveTo(Bx + rb * 0.5, By - rb * 1.3, Bx + rb * 0.15, By - rb * 1.75); g.stroke();
        }
      },
    },
  };
  function smooth(g, p, close) {
    if (p.length < 2) return;
    g.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length - 1; i++) g.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
    g.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
    if (close) g.closePath();
  }
  function snowflake(g, x, y, R, lw) {
    g.lineWidth = lw; g.lineCap = 'round'; g.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * TAU - Math.PI / 2, cx = Math.cos(a), sy = Math.sin(a);
      g.moveTo(x, y); g.lineTo(x + cx * R, y + sy * R);
      const bx = x + cx * R * 0.58, by = y + sy * R * 0.58;
      for (const d of [-0.7, 0.7]) { g.moveTo(bx, by); g.lineTo(bx + Math.cos(a + d) * R * 0.32, by + Math.sin(a + d) * R * 0.32); }
    }
    g.stroke();
  }
  function sparkle(g, x, y, R) {
    g.beginPath(); g.moveTo(x, y - R); g.quadraticCurveTo(x, y, x + R, y); g.quadraticCurveTo(x, y, x, y + R); g.quadraticCurveTo(x, y, x - R, y); g.quadraticCurveTo(x, y, x, y - R); g.fill();
  }

  // ───────── Instances ─────────
  const LIVE = new Set(); let raf = 0, frameN = 0;
  function tick(ts) { raf = 0; frameN++; LIVE.forEach((I) => { try { I.frame(ts); } catch (e) { console.error('Streak', e); I.destroy(); } }); ensure(); }
  function ensure() { if (!raf && LIVE.size) raf = requestAnimationFrame(tick); }
  const IO = window.IntersectionObserver ? new IntersectionObserver((es) => es.forEach((e) => { const I = e.target._sk; if (I) { I.visible = e.isIntersecting; I.dirty = true; } }), { rootMargin: '80px' }) : null;
  if (RM.addEventListener) RM.addEventListener('change', () => LIVE.forEach((I) => { I.dirty = true; }));
  if (window.MutationObserver) new MutationObserver(() => LIVE.forEach((I) => { I.dirty = true; })).observe(HTML, { attributes: true, attributeFilter: ['class'] });

  let seq = 0;
  class Flame {
    constructor(el, o) {
      this.el = el; this.id = ++seq;
      this.o = Object.assign({ style: 1, days: 4, state: 'lit', heat: 1, size: 0, dark: false, overlays: true }, o || {});
      this.size = Math.round(this.o.size || el.getBoundingClientRect().width || 120);
      this.small = this.size <= 34;
      this.dark = !!this.o.dark;
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      const c = this.canvas = document.createElement('canvas'); c.className = 'sk-canvas';
      c.width = c.height = Math.round(this.size * this.dpr); c.style.width = c.style.height = this.size + 'px';
      el.classList.add('sk-flame'); el.style.setProperty('--sk-size', this.size + 'px'); el.appendChild(c);
      if (this.o.decorative) el.setAttribute('aria-hidden', 'true'); else el.setAttribute('role', 'img');
      this.g = c.getContext('2d');
      this.T = targets(this.o); this.P = Object.assign({}, this.T);
      this.tw = null; this.beat = null; this.env = null; this.sparks = []; this.boost = 1; this.lut = [];
      this.visible = true; this.dirty = true; this.last = 0; this.alive = true; this.lost = 0;
      this.setStyle(this.o.style); this.label();
      el._sk = this; if (IO) IO.observe(el); LIVE.add(this); ensure();
      const self = this;
      this.api = {
        el, canvas: c, get o() { return Object.assign({}, self.o); }, get params() { return Object.assign({}, self.P); },
        set: (p, opt) => { self.set(p, opt); return self.api; }, extend: (opt) => self.extend(opt), snap: () => self.snap(), destroy: () => self.destroy(),
      };
    }
    label() { if (!this.o.decorative) this.el.setAttribute('aria-label', this.o.label || ariaFor(this.o)); }
    setStyle(s) {
      this.key = styleKey(s); this.o.style = KEYS.indexOf(this.key) + 1;
      this.rand = mulberry(9001 + KEYS.indexOf(this.key) * 131 + this.size * 7);
      this.A = STY[this.key].init(this); this.dirty = true;
    }
    set(p, opt) {
      p = p || {}; opt = opt || {};
      Object.assign(this.o, p);
      if (p.style != null && styleKey(p.style) !== this.key) this.setStyle(p.style);
      if (p.dark != null) this.dark = !!p.dark;
      const T = targets(this.o);
      if (opt.ms && !isStill() && !opt.instant) this.tw = { from: Object.assign({}, this.P), to: T, t0: now(), ms: opt.ms, ease: opt.ease === 'back' ? backOut : easeInOut };
      else { this.tw = null; if (opt.instant || isStill()) Object.assign(this.P, T); }
      this.T = T; this.dirty = true; this.label();
    }
    // The extend beat: crouch (250ms) · pop (2 frames) · hang (250ms) · squash on landing · the number rolls on impact.
    // Day 1 (from an ember) grows ember → flame over ~700ms, starting at the pop.
    extend(opt) {
      opt = opt || {};
      return new Promise((res) => {
        if (this.beat) this.finishBeat();
        const from = Math.round(+this.o.days || 0), to = opt.to != null ? opt.to : from + 1;
        const ignite = opt.ignite != null ? opt.ignite : (from === 0 || this.o.state === 'broken' || this.T.ember > 0.5);
        const state = opt.state || (MILESTONES.includes(to) ? 'milestone' : 'lit');
        this.beat = { t0: now(), ignite, to, state, onImpact: opt.onImpact, fired: false, popped: false, res };
        this.dirty = true;
        if (isStill()) this.finishBeat();
      });
    }
    finishBeat() {
      const b = this.beat; if (!b) return;
      this.beat = null; this.env = null; this.boost = 1;
      if (!b.fired) { b.fired = true; this.set({ days: b.to, state: b.state }, { instant: true }); if (b.onImpact) b.onImpact(b.to); }
      b.res();
    }
    snap() { if (this.beat) this.finishBeat(); this.tw = null; Object.assign(this.P, this.T); this.sparks.length = 0; this.dirty = true; }
    envAt(ms) { // [scaleX, scaleY, boost]
      if (ms < 250) { const k = easeInOut(ms / 250); return [1 + 0.12 * k, 1 - 0.2 * k, 1 - 0.6 * k]; }
      if (ms < 284) return [0.86, 1.34, 2.6];
      if (ms < 534) { const k = easeOut((ms - 284) / 250); return [0.86 + 0.04 * k, 1.34 - 0.08 * k, 2 - 0.6 * k]; }
      if (ms < 617) { const k = (ms - 534) / 83, e = k * k; return [lerp(0.9, 1.16, e), lerp(1.26, 0.8, e), 1.4]; }
      const k = (ms - 617) / 430; if (k >= 1) return null;
      const d = Math.exp(-4.2 * k), c = Math.cos(k * 11);
      return [1 + 0.16 * d * c, 1 - 0.2 * d * c, 1 + 0.5 * d];
    }
    burst(kind, G) {
      if (this.small) return;
      const S = this.size, R = this.rand, n = kind === 'pop' ? 16 : 10;
      for (let i = 0; i < n; i++) {
        if (kind === 'pop') this.sparks.push({ x: S / 2 + (R() - 0.5) * S * 0.08, y: G.by - G.H * 0.85, vx: (R() - 0.5) * S * 1.1, vy: -(0.7 + R() * 0.9) * S, life: 0.55 + R() * 0.4, age: 0, r: S * (0.014 + R() * 0.022), u: R() * 0.3 });
        else { const s = i % 2 ? 1 : -1; this.sparks.push({ x: S / 2 + s * S * 0.06, y: G.by - S * 0.01, vx: s * (0.35 + R() * 0.7) * S, vy: -(0.05 + R() * 0.35) * S, life: 0.35 + R() * 0.25, age: 0, r: S * (0.01 + R() * 0.014), u: 0.3 + R() * 0.4 }); }
      }
    }
    frame(ts) {
      if (!this.alive) return;
      if ((frameN & 63) === 0) { if (!this.el.isConnected) { if (++this.lost > 2) { this.destroy(); return; } } else this.lost = 0; }
      const still = isStill();
      const busy = !!(this.beat || this.tw || this.sparks.length);
      if (!this.visible && !this.dirty && !this.beat) return;
      if (still && !this.dirty && !busy) return;
      if (!still && this.size <= 80 && !busy && !this.dirty && ((frameN + this.id) & 1)) return; // small ones: 30fps, staggered so frames share the load
      const dt = this.last ? Math.min(0.1, (ts - this.last) / 1000) : 0.016; this.last = ts; this.dirty = false;
      let G0 = null;
      if (this.beat) {
        const b = this.beat, ms = ts - b.t0;
        if (!b.popped && ms >= 250) {
          b.popped = true; G0 = this.geom(ts / 1000, 0, still); this.burst('pop', G0);
          if (b.ignite) this.set({ days: b.to, state: b.state }, { ms: 700, ease: 'back' });
        }
        if (!b.fired && ms >= 617) {
          b.fired = true;
          if (!b.ignite) this.set({ days: b.to, state: b.state }, { ms: 650, ease: 'back' });
          this.burst('land', G0 || this.geom(ts / 1000, 0, still));
          if (b.onImpact) b.onImpact(b.to);
        }
        this.env = this.envAt(ms);
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
      this.render(ts / 1000, still ? 0 : dt, still);
    }
    geom(t, dt, still) {
      const S = this.size, P = this.P;
      let heat = clamp(P.heat, 0, 1.4);
      if (P.jitter > 0.01 && !still) heat *= 1 - P.jitter * 0.22 * (0.5 + 0.5 * Math.sin(t * 9.3) * Math.sin(t * 3.7 + 1));
      const sc = lerpArr(this.small ? TSCALE_SMALL : TSCALE, clamp(P.tier, 0, 5) + 0.4 * P.grow);
      let H = S * sc * (this.small ? 0.6 + 0.4 * heat : 0.42 + 0.58 * heat);
      H += (S * (this.small ? 0.34 : 0.22) - H) * P.ember;
      const W = H * (0.34 + 0.012 * P.tier), sw = still ? 0 : 1, jit = P.jitter;
      const G = { S, cx: S / 2, by: S * (this.small ? 0.95 : 0.92), H, W, heat, t, dt, still, small: this.small, alpha: clamp(0.5 + 0.5 * heat), minR: this.small ? 1.4 : 0.8 };
      G.hw = (u) => W * fs(u);
      G.sway = (u, h) => { h = h || H; return u * u * h * (0.03 * u + sw * (0.05 * Math.sin(t * 1.9 + u * 2.4) + 0.022 * Math.sin(t * 3.7 + u * 5.1) + jit * 0.04 * Math.sin(t * 17 + u * 9))); };
      return G;
    }
    // A colour table for this frame: 32 steps hot → cool, with frost thawing bottom-up.
    buildLut() {
      const P = this.P, W = this.dark ? WARM_D : WARM_L, F = this.dark ? FROST_D : FROST_L;
      const shift = (1 - P.lit) * 0.12 + (1 - clamp(P.heat)) * 0.24 + P.ghost * 0.12;
      for (let k = 0; k < 32; k++) {
        const u = k / 31, uu = clamp(u + shift);
        let c = ramp(W, uu);
        const fr = P.frost <= 0.001 ? 0 : clamp(P.frost * 1.4 - 0.4 + u * 0.4);
        if (fr > 0) c = mix3(c, ramp(F, uu * 0.85), fr);
        const e = this.lut[k] || (this.lut[k] = {});
        e.c = c; e.cell = sprite(0, c); e.ring = P.ghost > 0.02 ? sprite(1, c) : null;
      }
    }
    colAt(u) { return this.lut[clamp(u) * 31 | 0].c; }
    dot(g, u, x, y, r, a) {
      if (a <= 0.01 || r <= 0.15) return;
      const e = this.lut[clamp(u) * 31 | 0], gh = this.P.ghost;
      if (gh < 0.98) { g.globalAlpha = Math.min(1, a * (1 - gh)); g.drawImage(e.cell, x - r, y - r, r * 2, r * 2); }
      if (gh > 0.02) { g.globalAlpha = Math.min(1, a * gh); g.drawImage(e.ring, x - r, y - r, r * 2, r * 2); }
    }
    core(g, x, y, R, a) {
      if (a <= 0.01) return;
      g.globalAlpha = Math.min(1, a * (this.dark ? 0.75 : 1));
      if (this.dark) g.globalCompositeOperation = 'lighter';
      g.drawImage(sprite(4, this.dark ? [255, 150, 70] : [250, 176, 70]), x - R, y - R, R * 2, R * 2);
      g.globalCompositeOperation = 'source-over';
    }
    silhouette(g, G, a) {
      g.beginPath();
      for (let i = 0; i <= 12; i++) { const u = i / 12; g.lineTo(G.cx - G.hw(u) + G.sway(u), G.by - u * G.H); }
      for (let i = 12; i >= 0; i--) { const u = i / 12; g.lineTo(G.cx + G.hw(u) + G.sway(u), G.by - u * G.H); }
      const gr = g.createLinearGradient(0, G.by, 0, G.by - G.H); gr.addColorStop(0, rgba(this.colAt(0.04), 1)); gr.addColorStop(1, rgba(this.colAt(0.66), 1));
      g.globalAlpha = a * G.alpha * (1 - 0.65 * this.P.ghost); g.fillStyle = gr; g.fill();
    }
    render(t, dt, still) {
      const g = this.g, S = this.size, P = this.P;
      this.buildLut();
      g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); g.clearRect(0, 0, S, S); g.globalCompositeOperation = 'source-over';
      const G = this.geom(t, dt, still);
      // backlight: a warm glow behind (pale blue when frozen)
      const hc = mix3(this.dark ? [255, 150, 80] : [255, 176, 110], this.dark ? [140, 200, 240] : [150, 200, 232], clamp(P.frost));
      const ha = (this.dark ? 0.75 : 0.42) * (0.4 + 0.6 * P.lit) * clamp(G.heat) * (1 - 0.5 * P.ghost) + P.frost * 0.2 + P.ember * 0.2;
      const hr = Math.max(G.H * 0.8, S * 0.24);
      g.globalAlpha = clamp(ha); g.drawImage(sprite(3, hc), G.cx - hr, G.by - G.H * 0.45 - hr, hr * 2, hr * 2);
      // a waiting ember at the base (broken, win back, nothing yet)
      const wait = Math.max(P.ember, P.ghost * 0.8);
      if (wait > 0.02) {
        const pr = S * 0.11 * (1 + (still ? 0 : 0.12 * Math.sin(t * 2.4)));
        g.globalAlpha = wait * (this.dark ? 0.95 : 0.8); g.drawImage(sprite(2, [240, 110, 50]), G.cx - pr, G.by - S * 0.07 - pr, pr * 2, pr * 2);
      }
      g.save();
      if (this.env) { g.translate(G.cx, G.by); g.scale(this.env[0], this.env[1]); g.translate(-G.cx, -G.by); }
      STY[this.key].draw(this, g, G, this.A);
      g.restore(); g.globalCompositeOperation = 'source-over';
      this.overlays(g, G);
      g.globalAlpha = 1;
    }
    overlays(g, G) {
      const P = this.P, S = G.S, t = G.t, big = !this.small && this.o.overlays !== false;
      // risk: a saffron arc runs down with the time left, and pulses like a heartbeat
      if (P.jitter > 0.02 && big) {
        const R = S * 0.43, lw = Math.max(1.6, S * 0.03), left = clamp(this.o.heat == null ? 0.6 : this.o.heat / 0.34, 0.08, 1); // 6 PM → full, midnight → empty
        const beat = G.still ? 0 : Math.pow(Math.max(0, Math.sin(t * 4.2)), 6);
        g.lineCap = 'round'; g.lineWidth = lw;
        g.globalAlpha = 0.22 * P.jitter; g.strokeStyle = this.dark ? '#FFC45E' : '#E5A12A';
        g.beginPath(); g.arc(G.cx, S * 0.5, R, 0, TAU); g.stroke();
        g.globalAlpha = P.jitter; g.strokeStyle = this.dark ? '#FFC45E' : '#D9861A'; g.lineWidth = lw * (1 + 0.35 * beat);
        g.beginPath(); g.arc(G.cx, S * 0.5, R, -Math.PI / 2, -Math.PI / 2 + TAU * left); g.stroke();
      }
      // repaired: a dashed ring, the same mark as a repaired day in the week strip
      if (P.ring > 0.02 && big) {
        const R = S * 0.43, lw = Math.max(1.4, S * 0.022);
        g.globalAlpha = P.ring; g.strokeStyle = this.dark ? '#FFB27A' : '#C9472B'; g.lineWidth = lw; g.lineCap = 'round';
        g.setLineDash([S * 0.05, S * 0.045]); g.lineDashOffset = G.still ? 0 : -t * S * 0.04;
        g.beginPath(); g.arc(G.cx, S * 0.5, R, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(P.ring)); g.stroke(); g.setLineDash([]);
      }
      // milestone: a corona of sparks
      if (P.corona > 0.02 && big) {
        const n = 12;
        for (let k = 0; k < n; k++) {
          const a = k / n * TAU + (G.still ? 0 : t * 0.25), p = G.still ? 0.5 : (t * 0.8 + k * 0.37) % 1;
          const R = S * (0.36 + 0.06 * p);
          g.globalAlpha = P.corona * (0.35 + 0.65 * Math.sin(Math.PI * p));
          const r = S * 0.03; g.drawImage(sprite(2, [246, 170, 60]), G.cx + Math.cos(a) * R - r, S * 0.5 + Math.sin(a) * R - r, r * 2, r * 2);
        }
      }
      // new streak: a few fresh sparkles
      if (P.born > 0.02 && big) {
        g.fillStyle = this.dark ? '#FFD27A' : '#E0901C';
        [[0.24, 0.42, 0], [0.78, 0.34, 1.7], [0.7, 0.66, 3.1]].forEach(([x, y, ph]) => {
          const k = G.still ? 0.8 : 0.5 + 0.5 * Math.sin(t * 2.6 + ph);
          g.globalAlpha = P.born * k; sparkle(g, S * x, S * y, S * 0.045 * (0.6 + 0.4 * k));
        });
      }
      // frozen: a snowflake mark
      if (P.frost > 0.3 && big && S >= 40) {
        g.globalAlpha = clamp((P.frost - 0.3) / 0.5); g.strokeStyle = this.dark ? '#CFEAF8' : '#3F7CA6';
        snowflake(g, S * 0.79, S * 0.79, S * 0.085, Math.max(1.2, S * 0.018));
      }
      // sparks from the extend beat
      if (this.sparks.length) {
        const dt = G.dt || 0.016;
        this.sparks = this.sparks.filter((s) => (s.age += dt) < s.life);
        for (const s of this.sparks) {
          s.vy += S * 1.7 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.97;
          g.globalAlpha = (1 - s.age / s.life); const r = s.r * (1 - 0.4 * s.age / s.life);
          g.drawImage(sprite(2, ramp(WARM_D, s.u)), s.x - r * 2, s.y - r * 2, r * 4, r * 4);
        }
        if (!this.sparks.length) this.dirty = true;
      }
    }
    destroy() {
      if (!this.alive) return; this.alive = false;
      LIVE.delete(this); if (IO) IO.unobserve(this.el);
      if (this.beat) { const b = this.beat; this.beat = null; b.res(); }
      this.canvas.remove(); this.el.classList.remove('sk-flame'); delete this.el._sk;
    }
  }

  // ───────── Copy (Cortex rule: never shame; returning users never see "lost" or "0") ─────────
  // Registered styles (streak/styles-v2.js) bring their own renderer and verbs.
  const EXT = Object.create(null), EXTW = Object.create(null);
  function make(el, o) { const C = o && o.style != null ? EXT[o.style] : null; return C ? new C(el, o) : new Flame(el, o); }
  function copy(state, o) { const r = copy0(state, o), w = o && EXTW[o.style]; return w ? w('copy', state, r, o || {}) : r; }
  function copy0(state, o) {
    o = o || {};
    const d = Math.max(0, Math.round(+o.days || 0)), best = Math.max(+o.best || 0, d), h = o.hoursLeft != null ? o.hoursLeft : 4, f = o.freezes != null ? +o.freezes : 1;
    const nd = plural(d, 'day'), dd = `${d}-day`;
    if (d === 0 && state !== 'broken' && state !== 'born') return { chip: 'Start', title: 'Light your first flame', status: 'Finish a lesson or ask one question to light it.', pill: null };
    switch (state) {
      case 'unlit': return { chip: String(d), title: `${dd} streak`, status: 'One session today keeps it going.', pill: null };
      case 'lit': return { chip: String(d), title: `${dd} streak`, status: 'Lit for today. See you tomorrow.', pill: null };
      case 'risk': return { chip: String(d), title: `${dd} streak`, status: 'Finish a lesson or ask one question.', pill: `${h} h left to keep your ${dd} streak` };
      case 'frozen': return { chip: String(d), title: `${dd} streak`, status: `Your freeze kept your ${nd} safe.`, pill: 'One session today keeps it going.' };
      case 'broken': return { chip: 'Start', title: 'A fresh start', status: best ? `Your best is ${plural(best, 'day')}. Let’s beat it.` : 'Explore anything to light day 1.', pill: 'Finish anything to light day 1.' };
      case 'winback': return { chip: String(d), title: `${dd} streak`, status: 'Win it back today: finish anything.', pill: `Your ${nd} are waiting` };
      case 'repaired': return { chip: String(d), title: `${dd} streak`, status: `Won back. ${nd} and counting.`, pill: null };
      case 'born': return { chip: String(Math.max(1, d)), title: 'Day 1', status: `Your best is ${plural(Math.max(best, 1), 'day')}. Let’s beat it.`, pill: null };
      case 'milestone': return { chip: String(d), title: `${dd} streak`, status: `${nd} in a row. ${f >= 2 ? 'Your freezes are full.' : 'You earned a freeze.'}`, pill: null };
    }
    return { chip: String(d), title: `${dd} streak`, status: '', pill: null };
  }
  function ariaFor(o) { const c = copy(o.state, o); return `Streak: ${c.chip === 'Start' ? 'not started' : c.title}. ${LABELS[o.state] || ''}`; }

  // ───────── Week strip ─────────
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  function week(state, o) {
    o = o || {};
    const d = Math.max(0, Math.round(+o.days || 0)), t = o.today != null ? o.today : 3;
    const cells = DAYS.map((_, i) => (i > t ? 'future' : 'off'));
    const runBack = (from, n) => { for (let i = from, k = 0; i >= 0 && k < n; i--, k++) cells[i] = 'lit'; };
    switch (state) {
      case 'lit': case 'milestone': runBack(t, d); break;
      case 'born': cells[t] = 'lit'; if (t > 0) cells[t - 1] = 'miss'; break;
      case 'unlit': case 'risk': cells[t] = 'today'; runBack(t - 1, d); break;
      case 'frozen': cells[t] = 'today'; if (t > 0) cells[t - 1] = 'frozen'; runBack(t - 2, d); break;
      case 'broken': cells[t] = 'today'; if (t > 0) cells[t - 1] = 'miss'; if (t > 1) cells[t - 2] = 'miss'; break;
      case 'winback': cells[t] = 'today'; if (t > 0) cells[t - 1] = 'miss'; runBack(t - 2, d); break;
      case 'repaired': cells[t] = 'lit'; if (t > 0) cells[t - 1] = 'repaired'; runBack(t - 2, Math.max(0, d - 1)); break;
    }
    if (d === 0 && state !== 'broken' && state !== 'born') { for (let i = 0; i < t; i++) cells[i] = 'off'; cells[t] = 'today'; }
    return cells;
  }
  const SNOW = (n) => `<svg width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.6 4.6 12 7l2.4-2.4M9.6 19.4 12 17l2.4 2.4M4.5 10.9l3.3.9-.9 3.3M19.5 13.1l-3.3-.9.9-3.3"/></svg>`;
  const TICK = (n) => `<svg width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12.5l4 4 8-9"/></svg>`;
  const FLAME = (n) => `<svg width="${n}" height="${n}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5c.8 3.4 2.7 5 4.3 6.8 1.5 1.7 2.7 3.6 2.7 5.9a7 7 0 0 1-14 0c0-2.3 1-4.1 2.5-5.4.3 1.6 1.1 2.7 2.4 3.3C9.4 9.5 10.3 5.6 12 2.5z"/></svg>`;
  function weekHTML(state, o) {
    const cells = week(state, o), on = (k) => k === 'lit' || k === 'frozen' || k === 'repaired';
    const NAMES = { lit: 'done', frozen: 'covered by a freeze', repaired: 'won back', miss: 'missed', today: 'today, not yet', future: 'later', off: 'no streak' };
    return `<ol class="sk-week" aria-label="This week">${cells.map((k, i) => {
      const L = on(k) && i > 0 && on(cells[i - 1]), R = on(k) && i < 6 && on(cells[i + 1]);
      const ic = k === 'lit' ? FLAME(15) : k === 'frozen' ? SNOW(15) : k === 'repaired' ? FLAME(13) : '';
      return `<li class="sk-wd-day is-${k}${L ? ' bl' : ''}${R ? ' br' : ''}${(o && o.today != null ? o.today : 3) === i ? ' is-now' : ''}"><span class="sk-wk-l">${DAYS[i]}</span><span class="sk-dot" aria-label="${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}: ${NAMES[k]}">${ic}</span></li>`;
    }).join('')}</ol>`;
  }

  // ───────── Number roll ─────────
  function rollTo(host, txt, instant) {
    const cur = host.querySelector('.sk-n:not(.is-out)');
    if (cur && cur.textContent === String(txt)) return;
    if (!cur || instant || isStill()) { host.innerHTML = `<span class="sk-n">${esc(txt)}</span>`; return; }
    const n = document.createElement('span'); n.className = 'sk-n is-in'; n.textContent = txt;
    host.appendChild(n); cur.classList.add('is-out');
    void n.offsetWidth; n.classList.remove('is-in');
    setTimeout(() => cur.remove(), 420);
  }

  // ───────── Chip: the top-bar counter (flame + number), reads at 24px ─────────
  function chip(el, o) {
    o = Object.assign({ style: 1, days: 4, state: 'lit', heat: 1, size: 24 }, o || {});
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sk-chip';
    b.innerHTML = '<span class="sk-chip-fl"></span><span class="sk-roll"></span>';
    el.appendChild(b);
    const fl = make(b.firstChild, { style: o.style, days: o.days, state: o.state, heat: o.heat, size: o.size, decorative: true, overlays: false });
    const roll = b.querySelector('.sk-roll');
    function paint(instant) {
      const c = copy(o.state, o);
      b.dataset.state = o.days === 0 && o.state !== 'born' ? 'broken' : o.state; b.classList.toggle('is-word', c.chip === 'Start');
      rollTo(roll, c.chip, instant);
      b.setAttribute('aria-label', c.chip === 'Start' ? 'Streak: start today. Open streak details' : `${c.title}. ${LABELS[o.state]}. Open streak details`);
      b.style.setProperty('--sk-chip-size', o.size + 'px');
    }
    paint(true);
    b.addEventListener('click', () => { if (o.onTap) o.onTap(); });
    return {
      el: b, flame: fl.api,
      set(p) { Object.assign(o, p); fl.set(p); paint(); return this; },
      extend(opt) {
        opt = opt || {};
        return fl.extend(Object.assign({}, opt, { onImpact: (d) => { o.days = d; o.state = fl.o.state; paint(); if (opt.onImpact) opt.onImpact(d); } }));
      },
      destroy() { fl.destroy(); b.remove(); },
    };
  }

  // ───────── Widget: number, one-line status, week strip, freezes, next goal ─────────
  function nextGoal(d) { for (const m of MILESTONES) if (d < m) return m; return d < 365 ? 365 : Math.ceil((d + 1) / 100) * 100; }
  function prevGoal(d) { let p = 0; for (const m of [...MILESTONES, 365]) if (d >= m) p = m; return p; }
  function widget(el, o) {
    o = Object.assign({ style: 1, days: 4, state: 'lit', heat: 1, freezes: 1, best: 0, today: 3, hoursLeft: 4 }, o || {});
    const root = document.createElement('div'); root.className = 'sk-wd';
    root.innerHTML = `
      <div class="sk-wd-top">
        <div class="sk-wd-fl"></div>
        <div class="sk-wd-head"><p class="sk-wd-num"><span class="sk-roll"></span><small class="sk-wd-unit"></small></p><p class="sk-wd-status" aria-live="polite"></p></div>
      </div>
      <p class="sk-pill" hidden></p>
      <div class="sk-wd-wk"></div>
      <div class="sk-wd-foot">
        <div class="sk-frz"></div>
        <div class="sk-next"></div>
      </div>`;
    el.appendChild(root);
    const fl = make(root.querySelector('.sk-wd-fl'), { style: o.style, days: o.days, state: o.state, heat: o.heat, size: 76, decorative: true });
    const $ = (s) => root.querySelector(s);
    function paint(instant) {
      const c = copy(o.state, o), word = c.chip === 'Start';
      root.dataset.state = o.state;
      rollTo($('.sk-roll'), word ? (o.state === 'broken' ? 'Day 1' : 'Day 1') : c.chip, instant);
      $('.sk-wd-unit').textContent = word ? 'starts today' : (o.days === 1 ? 'day streak' : 'day streak');
      $('.sk-wd-status').textContent = c.status;
      const pill = $('.sk-pill'); pill.hidden = !c.pill; pill.textContent = c.pill || '';
      $('.sk-wd-wk').innerHTML = weekHTML(o.state, o);
      const f = clamp(+o.freezes || 0, 0, 2);
      $('.sk-frz').innerHTML = `<span class="sk-frz-ic">${[0, 1].map((i) => `<i class="${i < f ? 'on' : ''}">${SNOW(14)}</i>`).join('')}</span><span><b>${f === 0 ? 'No freezes yet' : plural(f, 'freeze')}</b><small>${f === 2 ? 'Full. Used for you if you miss a day.' : f === 1 ? 'Used for you if you miss a day.' : 'Earn one at 7 days.'}</small></span>`;
      const base = o.state === 'broken' ? 0 : o.days, nx = nextGoal(base), pv = prevGoal(base), pct = clamp((base - pv) / (nx - pv)) * 100;
      const gift = MILESTONES.includes(nx);
      $('.sk-next').innerHTML = `<div class="sk-next-t"><b>Next goal · ${nx} days</b><span>${plural(nx - base, 'day')} to go</span></div><div class="sk-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${nx}" aria-valuenow="${base}"><i style="width:${pct.toFixed(1)}%"></i></div>${gift ? `<span class="sk-gift">${SNOW(12)}+1 freeze</span>` : ''}`;
    }
    paint(true);
    return {
      el: root, flame: fl.api,
      set(p) { Object.assign(o, p); fl.set(p); paint(); return this; },
      extend(opt) { opt = opt || {}; return fl.extend(Object.assign({}, opt, { onImpact: (d) => { o.days = d; o.state = fl.o.state; paint(); if (opt.onImpact) opt.onImpact(d); } })); },
      destroy() { fl.destroy(); root.remove(); },
    };
  }

  // ───────── Six full-screen moments ─────────
  // Tap anywhere to skip to the end. Continue fades in at ~600ms. Reduced motion: a 200ms crossfade to the final pose.
  const MOMENTS = {
    ignite(o) {
      const d = Math.max(1, o.days || 1), first = d === 1;
      return {
        start: { days: d - 1, state: first ? 'broken' : 'unlit', heat: 0.8 }, num: d - 1, numWord: first,
        title: first ? 'You lit your first flame' : `${d} days. Lit for today.`,
        body: first ? 'Explore something every day to keep it going. A lesson or one question counts.' : 'That counts. Come back tomorrow to keep it going.',
        steps: [[420, (c) => c.extend({ to: d, state: first ? 'born' : 'lit' })]],
      };
    },
    milestone(o) {
      const m = MILESTONES.includes(o.days) ? o.days : 7, f = clamp(o.freezes != null ? +o.freezes : 1, 0, 2), nx = nextGoal(m);
      const line = { 7: 'A full week of learning. That’s a habit forming.', 14: 'Two weeks. You keep showing up.', 30: 'A month of curiosity. Your flame grew.', 100: '100 days. Very few people get here.' }[m];
      const held = Math.min(2, f + 1);
      return {
        start: { days: m - 1, state: 'lit' }, num: m - 1,
        title: `${m} days in a row`, body: line,
        extra: `<div class="sk-mo-card">${SNOW(22)}<span><b>${f >= 2 ? 'Your freezes are full' : '+1 freeze'}</b><small>${f >= 2 ? 'You hold 2 of 2. They cover a day you miss.' : `It covers a day you miss, automatically. You hold ${held} of 2.`}</small></span></div>
                <div class="sk-mo-next"><div class="sk-next-t"><b>Next goal · ${nx} days</b><span>${nx - m} to go</span></div><div class="sk-bar"><i style="width:0%" data-w="0"></i></div></div>`,
        steps: [[420, (c) => c.extend({ to: m, state: 'milestone' })]],
      };
    },
    thaw(o) {
      const d = Math.max(1, o.days || 7), f = clamp(o.freezes != null ? +o.freezes : 1, 0, 2);
      return {
        start: { days: d, state: 'frozen' }, num: d,
        title: `Your freeze kept your ${plural(d, 'day')} safe`, body: 'You missed yesterday, so a freeze covered it. One session today keeps it going.',
        extra: `<p class="sk-mo-tag">${SNOW(14)}${f === 0 ? 'No freezes left. Earn one at your next milestone.' : `${plural(f, 'freeze')} left`}</p>`,
        week: 'frozen',
        steps: [[520, (c, instant) => c.fl.set({ state: 'unlit', heat: 0.85 }, { ms: instant ? 0 : 1700, instant })]],
      };
    },
    newstart(o) {
      const best = Math.max(1, o.best || o.days || 3);
      return {
        start: { days: 0, state: 'broken' }, num: '', numWord: true,
        title: 'Day 1. A fresh start.', body: `Your best is ${plural(best, 'day')}. Let’s beat it.`,
        steps: [[420, (c) => c.extend({ to: 1, state: 'born', ignite: true })]],
      };
    },
    winback(o) {
      const d = Math.max(1, o.days || 12);
      return {
        start: { days: d, state: 'winback' }, num: d,
        title: `Your ${plural(d, 'day')} are waiting`, body: 'Win it back today: finish anything. A lesson or one question counts. It’s free.',
        cta: 'Win it back', week: 'winback', steps: [],
      };
    },
    repaired(o) {
      const d = Math.max(1, o.days || 12);
      return {
        start: { days: d, state: 'winback' }, num: d,
        title: `Won back. ${d + 1} days.`, body: 'You kept your streak going. See you tomorrow.',
        week: 'repaired', weekDays: d + 1,
        steps: [[380, (c, instant) => c.fl.set({ state: 'repaired' }, { ms: instant ? 0 : 900, instant })], [1250, (c) => c.extend({ to: d + 1, state: 'repaired', ignite: false })]],
      };
    },
  };
  const MOMENT_NAMES = { ignite: 'Lighting up', milestone: 'Milestone', thaw: 'Thawing', newstart: 'New start', winback: 'Win back', repaired: 'Repaired' };

  function moment(layer, name, o) {
    o = Object.assign({ style: 1 }, o || {});
    const def = MOMENTS[name]; if (!def || !layer) return Promise.resolve({ name, skipped: false });
    let cfg = def(o); const reduced = isStill();
    if (EXTW[o.style]) cfg = EXTW[o.style]('moment', name, cfg, o);
    return new Promise((resolve) => {
      const m = document.createElement('div');
      m.className = `sk-mo sk-mo-${name}${reduced ? ' is-reduced' : ''}`;
      m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', cfg.title);
      m.innerHTML = `
        <div class="sk-mo-bg" aria-hidden="true"></div>
        <div class="sk-mo-main">
          <div class="sk-mo-fl"></div>
          <p class="sk-mo-num"><span class="sk-roll"></span><small>${cfg.numWord ? 'day streak' : 'day streak'}</small></p>
          <h2 class="sk-mo-t" data-in>${esc(cfg.title)}</h2>
          <p class="sk-mo-p" data-in>${esc(cfg.body)}</p>
          ${cfg.week ? `<div class="sk-mo-wk" data-in>${weekHTML(cfg.week, { days: cfg.weekDays || o.days, today: o.today != null ? o.today : 3 })}</div>` : ''}
          ${cfg.extra ? `<div class="sk-mo-extra" data-in>${cfg.extra}</div>` : ''}
        </div>
        <button type="button" class="sk-mo-go">${esc(cfg.cta || 'Continue')}</button>`;
      layer.appendChild(m);
      const roll = m.querySelector('.sk-roll');
      rollTo(roll, cfg.num === '' || cfg.num === 0 ? '' : cfg.num, true);
      if (cfg.num === '' || cfg.num === 0) m.querySelector('.sk-mo-num').classList.add('is-empty');
      const fl = make(m.querySelector('.sk-mo-fl'), Object.assign({ style: o.style, size: 232, dark: true, decorative: true }, cfg.start));
      const ctx = {
        fl: fl.api,
        extend: (opt) => fl.extend(Object.assign({}, opt, { onImpact: (d) => { m.querySelector('.sk-mo-num').classList.remove('is-empty'); rollTo(roll, d); bar(); } })),
      };
      const bar = () => { const i = m.querySelector('.sk-mo-next .sk-bar i'); if (i) i.style.width = '6%'; };
      const timers = [], ran = new Set();
      let finished = false, skipped = false, closing = false;
      const go = m.querySelector('.sk-mo-go');
      const reveal = () => m.querySelectorAll('[data-in]').forEach((e) => e.classList.add('is-in'));
      const showGo = () => { go.classList.add('is-on'); };
      function finish() {
        if (finished) return; finished = true;
        timers.forEach(clearTimeout);
        cfg.steps.forEach((s, i) => { if (!ran.has(i)) { ran.add(i); s[1](ctx, true); } });
        fl.snap(); m.querySelector('.sk-mo-num').classList.remove('is-empty'); reveal(); showGo(); m.classList.add('is-done');
      }
      requestAnimationFrame(() => m.classList.add('is-on'));
      if (reduced) finish();
      else {
        cfg.steps.forEach((s, i) => timers.push(setTimeout(() => { ran.add(i); s[1](ctx, false); }, s[0])));
        const ts = m.querySelectorAll('[data-in]');
        ts.forEach((e, i) => timers.push(setTimeout(() => e.classList.add('is-in'), 520 + i * 110)));
        timers.push(setTimeout(showGo, 600));
        const last = Math.max(0, ...cfg.steps.map((s) => s[0]));
        timers.push(setTimeout(() => { finished = true; m.classList.add('is-done'); }, last + 1400));
      }
      m.addEventListener('click', (e) => {
        if (e.target.closest('.sk-mo-go')) { close(); return; }
        if (!finished) { skipped = true; finish(); }
      });
      function close() {
        if (closing) return; closing = true; finish();
        m.classList.remove('is-on');
        setTimeout(() => { fl.destroy(); m.remove(); resolve({ name, skipped }); }, reduced ? 200 : 240);
      }
      setTimeout(() => { try { go.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, reduced ? 0 : 620);
    });
  }

  window.Streak = {
    STYLES, STATES, LABELS, MILESTONES, TIER_DAYS, MOMENTS: Object.keys(MOMENTS), MOMENT_NAMES,
    flame: (el, o) => make(el, o).api,
    register(key, Ctor, words) { EXT[key] = Ctor; if (words) EXTW[key] = words; }, targets, weekHTML, rollTo, envAt: (ms) => Flame.prototype.envAt(ms),
    chip, widget, moment, copy, week, tierOf, nextGoal, styleKey,
    isStill,
    get live() { return LIVE.size; },
  };
})();
