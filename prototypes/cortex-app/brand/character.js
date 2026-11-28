// Brand character: a multi-instance port of ../brain.js.
// Same idea (particles morph between shapes, react to the pointer), but each instance has its own canvas
// and a per-brand "treatment" that decides how a particle is drawn and how it reacts:
//   cells   · Living Matter      · backlit living cells that breathe and reach toward your finger
//   ink     · Future Gallery     · stippled ink dots on paper that part around your finger
//   glass   · Liquid Glass       · iridescent glass beads that magnify under your finger like a lens
//   readout · Precision Instrument · grid-snapped sample points, a sweep, a crosshair with coordinates
(function () {
  const TAU = Math.PI * 2;
  const rnd = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const STILL = /[?&]still=1/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/[?&]still=1/.test(location.search)) document.documentElement.classList.add('still');

  // ---------- Shapes: (i, N, t) -> [x, y, z, visibility] in about -1..1 ----------
  function ball(i, s, r) { const b = Math.acos(2 * rnd(i + s) - 1), a = rnd(i + s + 1.3) * TAU, k = r * Math.cbrt(rnd(i + s + 2.1)); return [k * Math.sin(b) * Math.cos(a), k * Math.cos(b), k * Math.sin(b) * Math.sin(a)]; }
  function fib(i, N) { const y = 1 - 2 * (i + 0.5) / N, a = i * 2.399963, r = Math.sqrt(Math.max(0, 1 - y * y)); return [Math.cos(a) * r, y, Math.sin(a) * r]; }

  const SH = {
    scatter(i) { const b = Math.acos(2 * rnd(i + 8.8) - 1), a = rnd(i + 9.9) * TAU, r = 1.6 + rnd(i + 1.1) * 0.8; return [r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a), 0]; },
    brain(i, N) { // from brain.js
      const jit = (rnd(i + 0.37) - 0.5) * 0.03; let [x, y, z] = fib(i, N); y = Math.max(-1, Math.min(1, y + jit));
      const side = x < 0 ? -1 : 1, temporal = Math.max(0, -y - 0.15) * Math.max(0, z + 0.2) * 0.6;
      const yy = y < -0.35 ? -0.35 + (y + 0.35) * 0.45 : y;
      let px = x * 0.62 * (1 + temporal) + side * 0.10, py = yy * 0.70, pz = z * (1 - 0.08 * y);
      const th = Math.atan2(y, z), ph = Math.atan2(x, Math.hypot(y, z));
      const fold = Math.sin(9 * th + 3.2 * Math.sin(5 * ph + 2 * th)) * Math.sin(7 * ph + 2.5 * Math.cos(4 * th));
      const d = 1 + 0.07 * fold; px *= d; py *= d; pz *= d;
      if (rnd(i + 3.1) < 0.11) { const a = rnd(i) * TAU, b = Math.acos(2 * rnd(i + 1.7) - 1); return [0.42 * Math.sin(b) * Math.cos(a), -0.42 + 0.2 * Math.cos(b), -0.62 + 0.28 * Math.sin(b) * Math.sin(a), 1]; }
      return [px * 1.02, py * 1.02, pz * 1.02, fold < -0.35 ? 0.12 : 1];
    },
    heart(i) { // from brain.js
      const t = rnd(i + 9.1) * TAU, k = Math.sqrt(rnd(i + 4.4));
      const hx = 16 * Math.pow(Math.sin(t), 3), hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      return [hx / 17 * k * 0.95, (hy / 17 * k + 0.1) * 0.95, (rnd(i + 2.2) * 2 - 1) * 0.3 * Math.sqrt(Math.max(0, 1 - k * k * 0.6)), 1];
    },
    sphere(i, N) { const p = fib(i, N), r = 0.86; return [p[0] * r, p[1] * r, p[2] * r, 1]; },
    globe(i) { // latitude and longitude lines, plus a few sample clusters
      const k = rnd(i + 0.4);
      if (k < 0.1) { const c = Math.floor(rnd(i + 5) * 5), la = [0.5, -0.3, 0.1, 0.9, -0.7][c], lo = [0.3, 2.1, 4.0, 5.2, 1.2][c], p = ball(i, 7, 0.07); return [Math.cos(la) * Math.cos(lo) * 0.84 + p[0], Math.sin(la) * 0.84 + p[1], Math.cos(la) * Math.sin(lo) * 0.84 + p[2], 1]; }
      const u = rnd(i + 2.2) * TAU, r = 0.84;
      if (k < 0.55) { const la = (Math.floor(rnd(i + 3.3) * 7) - 3) * 0.38; return [Math.cos(la) * Math.cos(u) * r, Math.sin(la) * r, Math.cos(la) * Math.sin(u) * r, 1]; }
      const lo = Math.floor(rnd(i + 4.4) * 10) * TAU / 10; return [Math.cos(u) * Math.cos(lo) * r, Math.sin(u) * r, Math.cos(u) * Math.sin(lo) * r, 1];
    },
    vortex(i, N, t) { // a tunnel you fall into: particles flow from the rim toward the centre
      const arms = 5, u = (rnd(i + 1.9) + t * 0.06) % 1, r = 0.05 + 1.0 * Math.pow(1 - u, 1.5);
      const a = (i % arms) * TAU / arms + u * 6.4 + t * 0.35 + (rnd(i + 2.6) - 0.5) * 0.5 * (1 - u * 0.6);
      return [Math.cos(a) * r, Math.sin(a) * r, 0.9 - u * 1.8, Math.pow(Math.sin(Math.PI * u), 0.6)];
    },
    bites(i) { // Quick bites: many small, separate pieces
      const k = i % 12, cx = (k % 4 - 1.5) * 0.5 + (rnd(k + 0.3) - 0.5) * 0.12, cy = (Math.floor(k / 4) - 1) * 0.52 + (rnd(k + 0.7) - 0.5) * 0.12;
      const p = ball(i, 3.3, 0.15 + rnd(k + 1.1) * 0.05); return [cx + p[0], cy + p[1], p[2] + (rnd(k + 2) - 0.5) * 0.3, 1];
    },
    web(i) { // Connect the dots: nodes and the links between them
      const k = rnd(i + 0.9);
      if (k < 0.38) { const n = i % WEB_N.length, p = ball(i, 4.1, n === 0 ? 0.15 : 0.09); return [WEB_N[n][0] + p[0], WEB_N[n][1] + p[1], WEB_N[n][2] + p[2], 1]; }
      const e = WEB_E[i % WEB_E.length], a = WEB_N[e[0]], b = WEB_N[e[1]], s = rnd(i + 6.6), j = 0.012;
      return [a[0] + (b[0] - a[0]) * s + (rnd(i + 7) - 0.5) * j, a[1] + (b[1] - a[1]) * s + (rnd(i + 8) - 0.5) * j, a[2] + (b[2] - a[2]) * s, 1];
    },
    path(i) { // Full roadmap: one winding path with stops along it
      const k = rnd(i + 0.6);
      const at = (s) => [0.62 * Math.sin(s * TAU * 1.1 + 0.4), 0.92 - 1.84 * s, 0.22 * Math.cos(s * TAU * 1.1)];
      if (k < 0.32) { const n = i % 7, c = at(n / 6), p = ball(i, 5.2, n === 6 ? 0.13 : 0.085); return [c[0] + p[0], c[1] + p[1], c[2] + p[2], 1]; }
      const s = rnd(i + 3.7), c = at(s); return [c[0] + (rnd(i + 1) - 0.5) * 0.03, c[1] + (rnd(i + 2) - 0.5) * 0.03, c[2], 1];
    },
  };
  const WEB_N = [[0, 0.02, 0], [-0.62, 0.5, 0.2], [0.58, 0.58, -0.15], [0.78, -0.12, 0.25], [0.34, -0.7, -0.2], [-0.4, -0.62, 0.1], [-0.82, -0.05, -0.25], [0.05, 0.86, 0.1], [-0.12, -0.3, 0.6]];
  const WEB_E = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 7], [2, 7], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1], [0, 8], [8, 5], [8, 3]];
  const DYNAMIC = new Set(['vortex']);
  const VIEW = { brain: [-1.2, 0.2, 0.3], heart: [-0.3, 0.05, 0.35], sphere: [0, 0.2, 0.4], globe: [0.3, 0.32, 1], vortex: [0, -0.1, 0.03],
    bites: [-0.25, 0.15, 0.3], web: [-0.2, 0.15, 0.45], path: [-0.1, 0.12, 0.35], scatter: [0, 0.3, 0.3] };

  // Icons: rasterise a 2D drawing, sample its pixels (from brain.js defineIcon)
  const ICON_PX = {};
  function defineIcon(name, draw) {
    const S = 180, c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d'); x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineCap = 'round'; x.lineJoin = 'round';
    draw(x, S);
    const d = x.getImageData(0, 0, S, S).data, px = [];
    for (let yy = 0; yy < S; yy += 2) for (let xx = 0; xx < S; xx += 2) if (d[(yy * S + xx) * 4 + 3] > 120) px.push([xx, yy]);
    let a = 1e9, b = -1e9, e = 1e9, f = -1e9; px.forEach(([u, v]) => { a = Math.min(a, u); b = Math.max(b, u); e = Math.min(e, v); f = Math.max(f, v); });
    const cx = (a + b) / 2, cy = (e + f) / 2, sc = 1.7 / Math.max(b - a, f - e);
    ICON_PX[name] = { px, cx, cy, sc };
    SH[name] = (i) => { const o = ICON_PX[name], p = o.px[Math.floor(rnd(i + 11.3) * o.px.length)]; return [(p[0] - o.cx + (rnd(i + 2.7) - 0.5) * 2.4) * o.sc, -(p[1] - o.cy + (rnd(i + 3.9) - 0.5) * 2.4) * o.sc, (rnd(i + 6.1) - 0.5) * 0.2, 1]; };
    VIEW[name] = [0, 0, 0.12];
  }
  defineIcon('i-heart', (x, S) => { x.save(); x.translate(S / 2, S * 0.54); x.scale(S / 40, S / 40); x.beginPath(); x.moveTo(0, 14); x.bezierCurveTo(-24, -2, -14, -20, 0, -9); x.bezierCurveTo(14, -20, 24, -2, 0, 14); x.fill(); x.restore(); });
  defineIcon('i-planet', (x, S) => { x.beginPath(); x.arc(S / 2, S / 2, S * 0.24, 0, TAU); x.fill(); x.lineWidth = S * 0.05; x.save(); x.translate(S / 2, S / 2); x.rotate(-0.4); x.beginPath(); x.ellipse(0, 0, S * 0.44, S * 0.12, 0, 0, TAU); x.stroke(); x.restore(); });
  defineIcon('i-leaf', (x, S) => { x.save(); x.translate(S / 2, S / 2); x.rotate(-0.7); x.beginPath(); x.moveTo(0, -S * 0.42); x.quadraticCurveTo(S * 0.34, 0, 0, S * 0.36); x.quadraticCurveTo(-S * 0.34, 0, 0, -S * 0.42); x.fill(); x.restore(); x.lineWidth = S * 0.045; x.beginPath(); x.moveTo(S * 0.32, S * 0.7); x.lineTo(S * 0.2, S * 0.84); x.stroke(); });
  defineIcon('i-bulb', (x, S) => { x.beginPath(); x.arc(S / 2, S * 0.4, S * 0.25, 0, TAU); x.fill(); x.fillRect(S * 0.38, S * 0.56, S * 0.24, S * 0.16); x.fillRect(S * 0.4, S * 0.76, S * 0.2, S * 0.06); });

  const cache = {};
  function targets(name, N) {
    const key = name + ':' + N; if (cache[key]) return cache[key];
    const a = new Float32Array(N * 4), fn = SH[name];
    for (let i = 0; i < N; i++) { const p = fn(i, N, 0); a.set([p[0], p[1], p[2], p[3] == null ? 1 : p[3]], i * 4); }
    return (cache[key] = a);
  }

  // ---------- Sprites ----------
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  function sprite(size, paint) { const c = document.createElement('canvas'); c.width = c.height = size; paint(c.getContext('2d'), size); return c; }
  function cellSprite(col) {
    const [r, g, b] = hex(col);
    return sprite(64, (x, S) => {
      const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      m.addColorStop(0, `rgba(${r},${g},${b},0.30)`); m.addColorStop(0.62, `rgba(${r},${g},${b},0.42)`);
      m.addColorStop(0.84, `rgba(${r},${g},${b},0.92)`); m.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = m; x.fillRect(0, 0, S, S);
      x.fillStyle = `rgba(${r * 0.55 | 0},${g * 0.4 | 0},${b * 0.4 | 0},0.75)`; x.beginPath(); x.arc(S * 0.46, S * 0.46, S * 0.13, 0, TAU); x.fill();
    });
  }
  function haloSprite(col) {
    const [r, g, b] = hex(col);
    return sprite(64, (x, S) => { const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); m.addColorStop(0, `rgba(${r},${g},${b},0.5)`); m.addColorStop(1, `rgba(${r},${g},${b},0)`); x.fillStyle = m; x.fillRect(0, 0, S, S); });
  }
  function beadSprite(h) {
    return sprite(64, (x, S) => {
      const c = S / 2, m = x.createRadialGradient(c * 0.9, c * 0.9, 0, c, c, c);
      m.addColorStop(0, 'hsla(0,0%,100%,0.10)'); m.addColorStop(0.55, `hsla(${h},95%,72%,0.22)`);
      m.addColorStop(0.82, `hsla(${h},100%,76%,0.85)`); m.addColorStop(0.93, `hsla(${(h + 60) % 360},100%,82%,0.9)`); m.addColorStop(1, `hsla(${(h + 60) % 360},100%,80%,0)`);
      x.fillStyle = m; x.beginPath(); x.arc(c, c, c, 0, TAU); x.fill();
      const s = x.createRadialGradient(c * 0.68, c * 0.62, 0, c * 0.68, c * 0.62, c * 0.34);
      s.addColorStop(0, 'rgba(255,255,255,0.95)'); s.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = s; x.beginPath(); x.arc(c * 0.68, c * 0.62, c * 0.34, 0, TAU); x.fill();
    });
  }

  const TREAT = {
    cells: {
      n: 1700, comp: 'multiply',
      init(st) {
        st.cols = ['#F07B5A', '#F29A4A', '#E0587A', '#EFB43E', '#C9472B'];
        st.spr = st.cols.map(cellSprite); st.halo = haloSprite('#FFB37A');
        st.ci = new Uint8Array(st.N).map((_, i) => Math.floor(rnd(i + 0.21) * 5));
      },
      pointer(st, i, dx, dy, d, R) { // living matter reaches toward you
        const f = 1 - d / R; return [-dx / d * f * f * 26, -dy / d * f * f * 26, f];
      },
      draw(g, st, t) {
        const D = st.DPR;
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 0.5; const hr = st.W * 0.42; g.drawImage(st.halo, st.W / 2 - hr, st.W / 2 - hr, hr * 2, hr * 2);
        g.globalCompositeOperation = 'multiply';
        for (let n = 0; n < st.N; n++) {
          const i = st.order[n], dep = st.dz[i], v = st.vis[i]; if (v < 0.2) continue; // gaps between the folds stay open
          const br = STILL ? 1 : 1 + 0.16 * Math.sin(t * 1.4 + i * 0.7);
          const r = (1.7 + 2.7 * dep) * D * (0.6 + 0.8 * rnd(i + 0.5)) * br * (1 + 0.7 * st.pk[i]) * st.scale;
          g.globalAlpha = (0.35 + 0.6 * dep) * v * st.fade;
          g.drawImage(st.spr[st.ci[i]], st.sx[i] - r, st.sy[i] - r, r * 2, r * 2);
        }
      },
    },
    ink: {
      n: 2600, comp: 'source-over',
      init(st) { st.blue = new Uint8Array(st.N).map((_, i) => rnd(i + 0.13) < 0.06 ? 1 : 0); },
      pointer(st, i, dx, dy, d, R) { const f = 1 - d / R; return [dx / d * f * f * 30, dy / d * f * f * 30, f]; },
      draw(g, st) {
        const D = st.DPR;
        for (let pass = 0; pass < 2; pass++) {
          g.fillStyle = pass ? '#002FA7' : '#141414'; g.beginPath();
          for (let n = 0; n < st.N; n++) {
            const i = st.order[n]; if (st.blue[i] !== pass) continue;
            const v = st.vis[i] * st.fade; if (v < 0.3 || st.dz[i] < 0.38) continue; // ink on the visible face only
            const r = (0.35 + 1.25 * st.shade[i]) * D * st.scale;
            g.moveTo(st.sx[i] + r, st.sy[i]); g.arc(st.sx[i], st.sy[i], r, 0, TAU);
          }
          g.globalAlpha = 0.92; g.fill();
        }
      },
    },
    glass: {
      n: 900, comp: 'source-over',
      init(st) { st.spr = Array.from({ length: 12 }, (_, k) => beadSprite(k * 30)); st.h0 = new Float32Array(st.N).map((_, i) => rnd(i + 0.33) * 140); },
      pointer(st, i, dx, dy, d, R) { const f = 1 - d / R; return [dx / d * f * 34, dy / d * f * 34, f]; }, // lens: push out and magnify
      draw(g, st, t) {
        const D = st.DPR, c = st.W / 2;
        for (let n = 0; n < st.N; n++) {
          const i = st.order[n], v = st.vis[i] * st.fade; if (v < 0.03) continue;
          const dep = st.dz[i], ang = Math.atan2(st.sy[i] - c, st.sx[i] - c) * 57.3;
          const h = ((st.h0[i] + ang + 180 + t * 24) % 360 + 360) % 360;
          const r = (1.6 + 3.6 * dep) * D * (0.7 + 0.6 * rnd(i + 0.8)) * (1 + 1.4 * st.pk[i]) * st.scale;
          g.globalAlpha = Math.min(1, (0.45 + 0.55 * dep) * v);
          g.drawImage(st.spr[Math.floor(h / 30) % 12], st.sx[i] - r, st.sy[i] - r, r * 2, r * 2);
        }
      },
    },
    readout: {
      n: 1700, comp: 'source-over',
      init(st) { st.amb = new Uint8Array(st.N).map((_, i) => rnd(i + 0.17) < 0.05 ? 1 : 0); },
      pointer(st, i, dx, dy, d, R) { return [0, 0, 1 - d / R]; },
      draw(g, st, t) {
        const D = st.DPR, c = st.W / 2, q = 3 * D, sweep = STILL ? 0.8 : (t * 1.1) % TAU;
        for (let n = 0; n < st.N; n++) {
          const i = st.order[n], v = st.vis[i] * st.fade; if (v < 0.05) continue;
          const dep = st.dz[i], hot = st.pk[i] > 0.02;
          const g2 = hot ? q * 2 : q, x = Math.round(st.sx[i] / g2) * g2, y = Math.round(st.sy[i] / g2) * g2;
          let da = ((Math.atan2(y - c, x - c) - sweep) % TAU + TAU) % TAU; da = TAU - da; // distance behind the sweep
          const lit = da < 0.9 ? 1 - da / 0.9 : 0;
          const s = (0.9 + 1.3 * dep) * D;
          if (hot || st.amb[i]) { g.fillStyle = '#FFB020'; g.globalAlpha = (hot ? 1 : 0.55 + 0.45 * lit) * v; }
          else { g.fillStyle = lit > 0.05 ? '#FFFFFF' : '#C9D1DA'; g.globalAlpha = Math.min(1, (0.22 + 0.55 * dep + 0.5 * lit) * v); }
          g.fillRect(x - s / 2, y - s / 2, s, s);
        }
        if (st.ptr.on) { // crosshair + coordinates
          const px = st.ptr.x, py = st.ptr.y; g.globalAlpha = 0.6; g.fillStyle = '#FFB020';
          g.fillRect(0, py, st.W, D); g.fillRect(px, 0, D, st.W);
          g.globalAlpha = 1; g.font = `500 ${10 * D}px "JetBrains Mono", ui-monospace, monospace`;
          const lx = ((px / st.W) * 2 - 1).toFixed(2), ly = (1 - (py / st.W) * 2).toFixed(2);
          g.fillText(`x ${lx}  y ${ly}`, Math.min(px + 8 * D, st.W - 100 * D), Math.max(py - 8 * D, 14 * D));
        }
      },
    },
  };

  const live = new Set();
  let rafOn = false;
  function loop(now) { live.forEach((c) => c.frame(now)); requestAnimationFrame(loop); }

  class Character {
    constructor(canvas, opts) {
      this.c = canvas; this.g = canvas.getContext('2d'); this.o = opts;
      const T = this.T = TREAT[opts.treatment]; const N = this.N = Math.round((opts.n || T.n) * (opts.density || 1));
      this.size = opts.size || 320; this.DPR = Math.min(2, devicePixelRatio || 1); this.W = Math.round(this.size * this.DPR);
      canvas.width = canvas.height = this.W; canvas.style.width = canvas.style.height = this.size + 'px';
      this.scale = this.size / 320; this.zoom = opts.zoom || 1;
      ['from', 'to', 'cur'].forEach((k) => (this[k] = new Float32Array(N * 4)));
      ['sx', 'sy', 'sz', 'dz', 'vis', 'shade', 'pk', 'ox', 'oy'].forEach((k) => (this[k] = new Float32Array(N)));
      this.order = new Uint16Array(N).map((_, i) => i);
      this.ptr = { x: 0, y: 0, on: false }; this.ripples = []; this.fade = 1;
      T.init(this);
      this.shape = opts.shape; this.view = VIEW[opts.shape] || [0, 0, 0.3]; this.viewFrom = this.view;
      if (STILL || opts.noForm) { this.from.set(targets(opts.shape, N)); this.morphT = 1; }
      else { this.from.set(targets('scatter', N)); this.morphT = 0; this.fade = 0; }
      this.to.set(this.targetsFor(opts.shape, 0)); this.cur.set(this.from);
      this.morphStart = performance.now() + (opts.delay || 0); this.morphDur = 2000;
      this.bind(opts.hit || canvas); live.add(this);
      if (!rafOn) { rafOn = true; requestAnimationFrame(loop); }
    }
    targetsFor(name, t) {
      if (!DYNAMIC.has(name)) return targets(name, this.N);
      const a = this._dyn || (this._dyn = new Float32Array(this.N * 4)), fn = SH[name];
      for (let i = 0; i < this.N; i++) { const p = fn(i, this.N, t); a[i * 4] = p[0]; a[i * 4 + 1] = p[1]; a[i * 4 + 2] = p[2]; a[i * 4 + 3] = p[3]; }
      return a;
    }
    bind(el) {
      const at = (e) => { const r = this.c.getBoundingClientRect(); this.ptr.x = (e.clientX - r.left) / r.width * this.W; this.ptr.y = (e.clientY - r.top) / r.height * this.W; };
      const pm = (e) => { at(e); this.ptr.on = true; };
      const pd = (e) => { at(e); this.ptr.on = true; this.ripples.push({ x: this.ptr.x, y: this.ptr.y, t: performance.now() }); };
      const pl = () => { this.ptr.on = false; };
      el.addEventListener('pointermove', pm); el.addEventListener('pointerdown', pd); el.addEventListener('pointerleave', pl);
      this.unbind = () => { el.removeEventListener('pointermove', pm); el.removeEventListener('pointerdown', pd); el.removeEventListener('pointerleave', pl); };
    }
    setShape(name, dur) {
      if (name === this.shape) return;
      this.from.set(this.cur); this.viewFrom = this.curView(); this.shape = name; this.view = VIEW[name] || [0, 0, 0.3];
      this.to.set(this.targetsFor(name, performance.now() / 1000));
      this.morphT = STILL ? 1 : 0; this.morphStart = performance.now(); this.morphDur = dur || 1400;
    }
    curView() { const k = ease(Math.min(1, this.morphT)); return this.view.map((v, j) => this.viewFrom[j] + (v - this.viewFrom[j]) * k); }
    destroy() { live.delete(this); this.unbind && this.unbind(); }
    frame(now) {
      if (!this.c.isConnected) return this.destroy();
      const t = now / 1000, N = this.N, W = this.W, D = this.DPR;
      if (this.morphT < 1) this.morphT = Math.max(0, Math.min(1, (now - this.morphStart) / this.morphDur));
      if (this.fade < 1) this.fade = Math.min(1, Math.max(0, (now - this.morphStart) / 700));
      const dyn = DYNAMIC.has(this.shape); if (dyn) this.to.set(this.targetsFor(this.shape, STILL ? 1.5 : t));
      const v = this.curView(), wob = STILL ? 0 : Math.sin(t * 0.55) * v[2];
      const ry = v[0] + wob + (this.o.spin && !STILL ? t * 0.25 : 0), rx = v[1];
      const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
      const breathe = STILL ? 1 : 1 + 0.012 * Math.sin(t * 1.6), S = W * 0.4 * this.zoom * breathe;
      const L = [-0.45, 0.55, 0.7]; // light from top-left-front (ink shading)
      const { from, to, cur } = this;
      for (let i = 0; i < N; i++) {
        const k = i * 4;
        let l = this.morphT >= 1 ? 1 : ease(Math.max(0, Math.min(1, (this.morphT - rnd(i + 0.77) * 0.35) / 0.65)));
        for (let j = 0; j < 4; j++) cur[k + j] = from[k + j] + (to[k + j] - from[k + j]) * l;
        const x = cur[k], y = cur[k + 1], z = cur[k + 2];
        let X = x * cy + z * sy, Z = -x * sy + z * cy; const Y = y * cx - Z * sx; Z = y * sx + Z * cx;
        this.sx[i] = W / 2 + X * S; this.sy[i] = W / 2 - Y * S; this.sz[i] = Z; this.dz[i] = Math.max(0, Math.min(1, (Z + 1) / 2));
        this.vis[i] = cur[k + 3];
        const len = Math.hypot(X, Y, Z) || 1, lam = (X * L[0] + Y * L[1] + Z * L[2]) / len;
        this.shade[i] = Math.max(0, Math.min(1, (1 - lam) / 1.6 + (rnd(i + 0.91) - 0.5) * 0.25));
      }
      // pointer
      const R = 70 * D * this.scale, p = this.ptr;
      for (let i = 0; i < N; i++) {
        let tx = 0, ty = 0, tk = 0;
        if (p.on) { const dx = this.sx[i] - p.x, dy = this.sy[i] - p.y, d2 = dx * dx + dy * dy; if (d2 < R * R) { const d = Math.sqrt(d2) + 0.001, r = this.T.pointer(this, i, dx, dy, d, R); tx = r[0] * D * this.scale; ty = r[1] * D * this.scale; tk = r[2]; } }
        this.ox[i] += (tx - this.ox[i]) * 0.12; this.oy[i] += (ty - this.oy[i]) * 0.12; this.pk[i] += (tk - this.pk[i]) * 0.15;
        this.sx[i] += this.ox[i]; this.sy[i] += this.oy[i];
      }
      this.ripples = this.ripples.filter((r) => now - r.t < 1300);
      for (const r of this.ripples) {
        const age = (now - r.t) / 1000, RR = age * 280 * D * this.scale, life = 1 - age / 1.3;
        for (let i = 0; i < N; i++) { const dx = this.sx[i] - r.x, dy = this.sy[i] - r.y, d = Math.hypot(dx, dy) + 0.001, w = 9 * D * life * Math.exp(-Math.pow((d - RR) / (24 * D), 2)); this.sx[i] += dx / d * w; this.sy[i] += dy / d * w; }
      }
      const sz = this.sz; this.order.sort((a, b) => sz[a] - sz[b]);
      const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, W);
      g.globalCompositeOperation = this.T.comp; this.T.draw(g, this, STILL ? 2 : t);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
  }

  window.BrandCharacter = {
    create: (canvas, opts) => new Character(canvas, opts),
    destroyAll() { live.forEach((c) => c.destroy()); },
    STILL,
  };
})();
