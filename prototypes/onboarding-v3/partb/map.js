// Map: the corner mini-map and the full zoom-out map. Mounts into #mapLayer. See CONTRACT.md.
//
// One world layout (a radial tree) is viewed through two cameras:
//   - the mini camera: tiny scale, centred on the current node, inside the 76px glass circle;
//   - the full camera: fit to the whole tree, pannable and zoomable.
// Opening the map interpolates from the mini camera to the full camera while a clip circle
// grows from the corner, so it reads as a real zoom-out. Closing is the exact reverse.
(function () {
  'use strict';

  // ---------- Tokens ----------
  const FAM = { // deep, mid, tint
    mind: ['#4A30B0', '#7457E0', '#EEEAFD'],
    arts: ['#7E2777', '#B04AA8', '#F8E9F6'],
    society: ['#526612', '#7E9A2A', '#EFF3E1'],
    tech: ['#165F87', '#2A8FC4', '#E4F1F8'],
    cobalt: ['#1A47B8', '#1F5BE0', '#E8EEFD'],
    body: ['#A3264F', '#C94A72', '#FBE8EE'],
    space: ['#2F3766', '#4B57A0', '#E9EAF5'],
  };
  const fam = (p) => FAM[p] || FAM.cobalt;
  const SIZE = [120, 76, 56, 48];
  const sizeOf = (d) => SIZE[Math.min(d, 3)];
  // Rings are tall ellipses (the screen is tall). The lower half of the first ring is wider so those
  // children clear the root's label.
  const RX = (d, a) => (d === 0 ? 0 : d === 1 ? (Math.sin(a) > 0.2 ? 150 : 128) : 160 + (d - 2) * 40);
  const RY = (d) => (d === 0 ? 0 : d === 1 ? 175 : 345 + (d - 2) * 125);
  const LABW = (d) => (d === 0 ? 176 : d === 1 ? 128 : 116);
  const FONT = (d) => (d === 0 ? "600 14px 'Geist', sans-serif" : "600 13px 'Geist', sans-serif");
  const LINEH = (d) => (d === 0 ? 18 : 17);
  const MINI_R = 38, MINI_K = 0.15, MINI_RIGHT = 16, MINI_BOTTOM = 30;
  const TOP = 124, BOTTOM = 34; // free area for the full map, under the header
  const TAG_H = 22, TAG_GAP = 6, LAB_GAP = 7;

  // ---------- Small helpers ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  function bezier(x1, y1, x2, y2) {
    const B = (a, b, s) => 3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * b + s * s * s;
    return (t) => {
      if (t <= 0) return 0; if (t >= 1) return 1;
      let lo = 0, hi = 1, s = t;
      for (let i = 0; i < 22; i++) { s = (lo + hi) / 2; if (B(x1, x2, s) < t) lo = s; else hi = s; }
      return B(y1, y2, s);
    };
  }
  const glide = bezier(0.32, 0.72, 0, 1);
  const easeOut = bezier(0.23, 1, 0.32, 1);
  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, cls) => { const e = document.createElementNS(SVGNS, tag); if (cls) e.setAttribute('class', cls); return e; };
  const reducedMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const params = new URLSearchParams(location.search);
  const instant = () => document.documentElement.classList.contains('still') || reducedMQ.matches;

  // Text measuring for the layout (labels wrap to at most 2 lines)
  const mctx = document.createElement('canvas').getContext('2d');
  function measure(text, d) {
    mctx.font = FONT(d);
    const maxW = LABW(d), words = String(text).split(/\s+/);
    let n = 1, line = '', widest = 0;
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (line && mctx.measureText(t).width > maxW) { widest = Math.max(widest, mctx.measureText(line).width); n++; line = w; } else line = t;
    }
    widest = Math.max(widest, mctx.measureText(line).width);
    return { n: Math.min(2, n), w: Math.min(maxW, widest) };
  }

  // Dot-glyph of a node's shape, drawn once as static SVG
  const glyphCache = {};
  function glyph(shape, pal, count) {
    const key = shape + '|' + pal + '|' + count;
    if (glyphCache[key]) return glyphCache[key];
    let pts = [];
    try { if (window.Brain && Brain.sample) pts = Brain.sample(shape, count); } catch (e) { pts = []; }
    const P = window.Brain && Brain.palette ? Brain.palette(pal) : [[150, 130, 240], [74, 48, 176]];
    let s = '<svg viewBox="-1.12 -1.12 2.24 2.24" aria-hidden="true" focusable="false">';
    for (const [x, y, z] of pts) {
      const c = P[0].map((v, i) => Math.round(v + (P[1][i] - v) * z)).join(',');
      s += `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${(0.03 + 0.03 * z).toFixed(3)}" fill="rgb(${c})" opacity="${(0.4 + 0.6 * z).toFixed(2)}"/>`;
    }
    return (glyphCache[key] = s + '</svg>');
  }

  // ---------- State ----------
  const nodes = new Map(); // id -> node
  let order = [], visits = [], rootId = null, currentId = null;
  let layer, root, mini, miniEdges, miniDots, miniHalo, full, stage, edgesSvg, nodesEl, headSub, head, fadeEl, closeBtn;
  let W = 368, H = 822;
  let isOpen = false, doneHidden = false, tl = null, pendingLayout = false;
  const mf = { x: 0, y: 0 }; // mini focus (world)
  let cam = { fx: 0, fy: 0, z: 1 }, camT = { fx: 0, fy: 0, z: 1 };
  let fit = { fx: 0, fy: 0, z: 1, x0: 0, x1: 0, y0: 0, y1: 0, zMin: 0.5, zMax: 2.2 };
  let gest = null, momentum = null, kbOpen = false, edgeGap = 4;
  const ptrs = new Map();

  const VC = () => ({ x: W / 2, y: (TOP + H - BOTTOM) / 2 }); // full-map view centre
  const MC = () => ({ x: W - MINI_RIGHT - MINI_R, y: H - MINI_BOTTOM - MINI_R }); // mini centre

  // ---------- Data ----------
  function addOrVisit(d) {
    if (!d || d.id == null) return;
    const id = String(d.id);
    let n = nodes.get(id), isNew = false;
    if (!n) {
      isNew = true;
      n = { id, label: d.label || id, parent: d.parent == null ? null : String(d.parent), shape: d.shape || 'brain', palette: d.palette || 'cobalt',
        depth: 0, kids: [], x: 0, y: 0, tx: 0, ty: 0, mr: 0, ma: 0 };
      if (n.parent === null && rootId && rootId !== id) n.parent = rootId; // only one root
      if (n.parent === null) rootId = id;
      nodes.set(id, n); order.push(id);
      // start a new node at its parent so it grows out of it
      const p = nodes.get(n.parent);
      if (p) { n.x = p.x; n.y = p.y; }
      buildNode(n);
    } else {
      if (d.label) n.label = d.label;
      if (d.shape) n.shape = d.shape;
      if (d.palette) n.palette = d.palette;
    }
    currentId = id; visits.push(id);
    relayout(false);
    if (isNew) {
      if (!mf.init) { mf.x = n.tx; mf.y = n.ty; mf.init = true; }
      popMini(n);
    }
    updateMiniVis(); kick();
  }

  function seedDemo() {
    const R = 'habits';
    const seed = [
      { id: R, label: 'Why do some products become habits?', parent: null, shape: 'ring', palette: 'mind' },
      { id: 'variable-rewards', label: 'Variable rewards', parent: R, shape: 'grid', palette: 'mind' },
      { id: 'slot-machines', label: 'Slot machines', parent: 'variable-rewards', shape: 'grid', palette: 'mind' },
      { id: 'dopamine', label: 'Dopamine and wanting', parent: R, shape: 'spike', palette: 'mind' },
      { id: 'fogg', label: 'Fogg behaviour model', parent: R, shape: 'steps', palette: 'arts' },
      { id: 'streaks', label: 'Streaks', parent: R, shape: 'bars', palette: 'arts' },
      { id: 'retention-curves', label: 'Retention curves', parent: 'streaks', shape: 'curve', palette: 'tech' },
    ];
    const keepCurrent = currentId;
    const labels = new Set([...nodes.values()].map((n) => n.label.trim().toLowerCase()));
    const remap = {};
    if (rootId) remap[R] = rootId; // merge under the exploration's own root
    for (const s of seed) {
      if (s.parent === null && rootId) continue;
      if (labels.has(s.label.toLowerCase())) { const ex = [...nodes.values()].find((n) => n.label.trim().toLowerCase() === s.label.toLowerCase()); remap[s.id] = ex.id; continue; }
      if (nodes.has(s.id)) continue;
      const n = { ...s, parent: s.parent ? remap[s.parent] || s.parent : null, depth: 0, kids: [], x: 0, y: 0, tx: 0, ty: 0, mr: 0, ma: 0 };
      if (n.parent === null) rootId = n.id;
      nodes.set(n.id, n); order.push(n.id); visits.push(n.id); buildNode(n);
    }
    currentId = keepCurrent || 'variable-rewards';
    if (!keepCurrent) visits.push(currentId);
    relayout(true);
    const c = nodes.get(currentId); if (c) { mf.x = c.x; mf.y = c.y; mf.init = true; }
    nodes.forEach((n) => { const t = target(n); n.mr = t.r; n.ma = t.a; });
  }

  function clearAll() {
    nodes.forEach((n) => { n.el.remove(); n.dot.remove(); if (n.edge) n.edge.remove(); if (n.medge) n.medge.remove(); });
    nodes.clear(); order = []; visits = []; rootId = null; currentId = null; mf.init = false;
  }

  // ---------- Layout: radial tree on a tall ellipse, then de-overlap ----------
  function parentOf(n) { return n.parent != null ? nodes.get(n.parent) || (n.id !== rootId ? nodes.get(rootId) : null) : null; }

  function relayout(snapNew) {
    if (tl && tl.kind === 'goto') { pendingLayout = true; return; }
    layout(snapNew);
  }

  function layout(snapNew) {
    const r = nodes.get(rootId); if (!r) return;
    nodes.forEach((n) => { n.kids = []; });
    order.forEach((id) => { const n = nodes.get(id); if (n === r) return; const p = parentOf(n); if (p && p !== n) p.kids.push(n); });
    const walk = (n, d) => { n.depth = d; n.leaves = 0; for (const k of n.kids) n.leaves += walk(k, d + 1); n.leaves = Math.max(1, n.leaves); return n.leaves; };
    walk(r, 0);
    const place = (n, a0, a1) => {
      const a = (a0 + a1) / 2;
      if (n.depth === 0) { n.tx = 0; n.ty = 0; } else { n.tx = Math.cos(a) * RX(n.depth, a); n.ty = Math.sin(a) * RY(n.depth); }
      const tot = n.kids.reduce((s, k) => s + k.leaves, 0) || 1;
      // children of the root share the full circle; deeper nodes stay inside their parent's wedge (capped so they fan, not spread)
      const span = n.depth === 0 ? Math.PI * 2 : Math.min(a1 - a0, 0.5 * n.kids.length + 0.2);
      let s = a - span / 2;
      if (n.depth === 0) { // rotate so a wedge boundary sits straight below the root: no child under its label
        let cum = 0, best = 0, bestD = Infinity;
        for (let j = 0; j <= n.kids.length; j++) { const dd = Math.abs(cum / tot - 0.5); if (dd < bestD - 1e-6) { bestD = dd; best = cum; } if (j < n.kids.length) cum += n.kids[j].leaves; }
        s = Math.PI / 2 - (best / tot) * span;
      }
      for (const k of n.kids) { const w = (k.leaves / tot) * span; place(k, s, s + w); s += w; }
    };
    place(r, -Math.PI / 2, Math.PI * 1.5);

    // Label side: under the bubble (like Quest) unless edges arrive from below and none leave from above,
    // e.g. a leaf hanging above its parent. Then the label goes on top, so no line ever runs through it.
    order.forEach((id) => {
      const n = nodes.get(id); if (n.depth == null) return;
      let b = 0, t = 0;
      const look = (o) => { const sc = sector(o.tx - n.tx, o.ty - n.ty); if (sc === 'b') b++; else if (sc === 't') t++; };
      const p = n === r ? null : parentOf(n); if (p) look(p); n.kids.forEach(look);
      n.up = n.depth > 0 && b > 0 && t === 0;
    });
    // De-overlap: each node's footprint is its bubble, label and (if current) the "You are here" tag
    const list = order.map((id) => nodes.get(id)).filter((n) => n.depth != null);
    const fp = list.map((n) => {
      const s = sizeOf(n.depth), m = measure(n.label, n.depth);
      const lab = LAB_GAP + m.n * LINEH(n.depth) + (n.id === currentId ? TAG_GAP + TAG_H : 0);
      return { n, hw: Math.max(s, m.w) / 2 + 8, up: s / 2 + (n.up ? lab : 0) + 8, down: s / 2 + (n.up ? 0 : lab) + 8 };
    });
    for (let it = 0; it < 90; it++) {
      let moved = false;
      for (let i = 0; i < fp.length; i++) for (let j = i + 1; j < fp.length; j++) {
        const A = fp[i], B = fp[j];
        const e = A.n.id === B.n.parent || B.n.id === A.n.parent ? 14 : 0; // linked pairs keep room for a readable line
        const ax0 = A.n.tx - A.hw - e, ax1 = A.n.tx + A.hw + e, ay0 = A.n.ty - A.up - e, ay1 = A.n.ty + A.down + e;
        const bx0 = B.n.tx - B.hw, bx1 = B.n.tx + B.hw, by0 = B.n.ty - B.up, by1 = B.n.ty + B.down;
        const ox = Math.min(ax1, bx1) - Math.max(ax0, bx0), oy = Math.min(ay1, by1) - Math.max(ay0, by0);
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        // the shallower node holds; equal depth share the push
        const wa = A.n.depth === 0 ? 0 : A.n.depth < B.n.depth ? 0.2 : A.n.depth > B.n.depth ? 0.8 : 0.5, wb = 1 - wa;
        if (ox < oy * 0.45) { const sg = (B.n.tx >= A.n.tx ? 1 : -1) * ox; A.n.tx -= sg * wa; B.n.tx += sg * wb; }
        else { const sg = ((B.n.ty + (B.down - B.up) / 2) >= (A.n.ty + (A.down - A.up) / 2) ? 1 : -1) * oy; A.n.ty -= sg * wa; B.n.ty += sg * wb; }
      }
      if (!moved) break;
    }
    // bounds and fit
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    fp.forEach((f) => { x0 = Math.min(x0, f.n.tx - f.hw); x1 = Math.max(x1, f.n.tx + f.hw); y0 = Math.min(y0, f.n.ty - f.up); y1 = Math.max(y1, f.n.ty + f.down); });
    const aw = W - 24, ah = H - TOP - BOTTOM;
    const z = clamp(Math.min(1, aw / (x1 - x0), ah / (y1 - y0)), 0.6, 1);
    fit = { fx: (x0 + x1) / 2, fy: (y0 + y1) / 2, z, x0, x1, y0, y1, zMin: Math.min(z, 1) * 0.78, zMax: 2.2 };

    list.forEach((n) => {
      if (snapNew === true && !n.el.dataset.placed) { n.x = n.tx; n.y = n.ty; }
      n.el.dataset.placed = '1';
      n.el.classList.toggle('is-here', n.id === currentId); n.el.classList.toggle('is-up', !!n.up);
      n.el.className = n.el.className.replace(/\bd\d\b/g, '').trim() + ' d' + Math.min(n.depth, 3);
      const s = sizeOf(n.depth);
      n.el.style.width = n.el.style.height = s + 'px';
      n.el.style.margin = `${-s / 2}px 0 0 ${-s / 2}px`;
      n.lab.style.width = LABW(n.depth) + 'px';
      if (n.glyphFor !== n.depth + n.shape + n.palette) {
        n.glyphFor = n.depth + n.shape + n.palette;
        n.bub.innerHTML = glyph(n.shape, n.palette, n.depth === 0 ? 170 : n.depth === 1 ? 120 : 90);
      }
      n.txt.textContent = n.label;
      n.el.setAttribute('aria-label', `${n.label}${n.id === currentId ? ', you are here' : ''}. Go to this idea`);
    });
    if (instant()) nodes.forEach((n) => { n.x = n.tx; n.y = n.ty; });
    if (isOpen && !tl && !gest) { camT = { fx: fit.fx, fy: fit.fy, z: fit.z }; }
  }

  // ---------- DOM ----------
  function buildNode(n) {
    const [deep, mid, tint] = fam(n.palette);
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'mp-node'; el.dataset.id = n.id;
    el.style.setProperty('--tint', tint); el.style.setProperty('--deep', deep); el.style.setProperty('--mid', mid);
    el.innerHTML = '<span class="mp-bub"></span><i class="mp-fill" aria-hidden="true"></i><span class="mp-lab"><span class="mp-txt"></span><span class="mp-here">You are here</span></span>';
    el.addEventListener('click', (e) => { if (e.detail === 0) goto(n.id); }); // keyboard; pointer taps go through the stage
    nodesEl.appendChild(el);
    n.el = el; n.bub = el.querySelector('.mp-bub'); n.fill = el.querySelector('.mp-fill'); n.lab = el.querySelector('.mp-lab'); n.txt = el.querySelector('.mp-txt');
    n.dot = svgEl('circle', 'mp-dot'); n.dot.setAttribute('r', '0');
    miniDots.appendChild(n.dot);
    n.deep = deep; n.mid = mid;
    if (n.parent != null || n.id !== rootId) {
      n.edge = svgEl('path', 'mp-edge'); edgesSvg.appendChild(n.edge);
      n.medge = svgEl('line', 'mp-medge'); miniEdges.appendChild(n.medge);
    }
  }

  function mountDOM(layerEl) {
    layer = layerEl;
    root = document.createElement('div');
    root.className = 'mp';
    root.innerHTML = `
      <button type="button" class="mp-mini is-hidden" aria-label="Zoom out to your map">
        <svg class="mp-mini-svg" viewBox="-38 -38 76 76" aria-hidden="true" focusable="false">
          <circle class="mp-halo" r="9" cx="0" cy="0"/>
          <g class="mp-medges"></g><g class="mp-mdots"></g>
        </svg>
      </button>
      <section class="mp-full" role="dialog" aria-modal="true" aria-label="Your map" inert>
        <div class="mp-bg"></div>
        <div class="mp-stage">
          <svg class="mp-edges" aria-hidden="true" focusable="false"></svg>
          <div class="mp-nodes"></div>
        </div>
        <div class="mp-fade" aria-hidden="true"></div>
        <header class="mp-head"><h2>Your map</h2><p></p></header>
        <button type="button" class="mp-close" aria-label="Close map">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </section>`;
    layer.appendChild(root);
    const q = (s) => root.querySelector(s);
    mini = q('.mp-mini'); miniEdges = q('.mp-medges'); miniDots = q('.mp-mdots'); miniHalo = q('.mp-halo');
    full = q('.mp-full'); stage = q('.mp-stage'); edgesSvg = q('.mp-edges'); nodesEl = q('.mp-nodes');
    head = q('.mp-head'); headSub = q('.mp-head p'); fadeEl = q('.mp-fade'); closeBtn = q('.mp-close');
    measureLayer();
    bindMini(); bindStage();
    closeBtn.addEventListener('click', () => close());
    full.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
    window.addEventListener('resize', () => { measureLayer(); if (nodes.size) { relayout(); kick(); } });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (nodes.size) { relayout(); kick(); } });
  }
  function measureLayer() {
    W = layer.offsetWidth || 368; H = layer.offsetHeight || 822;
    edgesSvg.setAttribute('width', W); edgesSvg.setAttribute('height', H); edgesSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  }
  function local(e) {
    const r = layer.getBoundingClientRect(), s = r.width / (layer.offsetWidth || r.width) || 1;
    return [(e.clientX - r.left) / s, (e.clientY - r.top) / s];
  }

  function updateMiniVis() {
    if (!mini) return;
    const show = nodes.size > 0 && !doneHidden && !isOpen;
    mini.classList.toggle('is-hidden', !show);
    mini.tabIndex = show ? 0 : -1;
    mini.setAttribute('aria-hidden', show ? 'false' : 'true');
  }
  function popMini(n) {
    if (instant() || !mini) return;
    n.dot.classList.remove('is-pop'); void n.dot.getBoundingClientRect(); n.dot.classList.add('is-pop');
    mini.classList.remove('is-pulse'); void mini.offsetWidth; mini.classList.add('is-pulse');
    clearTimeout(popMini.t); popMini.t = setTimeout(() => { mini.classList.remove('is-pulse'); nodes.forEach((m) => m.dot.classList.remove('is-pop')); }, 900);
  }

  // ---------- Animation loop ----------
  let rafOn = false, last = 0;
  function kick() {
    if (instant()) { snapAll(); render(performance.now()); return; }
    if (rafOn) return;
    rafOn = true; last = performance.now();
    schedule();
  }
  function schedule() { // rAF, with a timer fallback for environments where rAF is paused (headless)
    let fired = false;
    const go = () => { if (fired) return; fired = true; frame(performance.now()); }; // one clock for every timeline
    requestAnimationFrame(go);
    setTimeout(go, 100);
  }
  function snapAll() {
    nodes.forEach((n) => { n.x = n.tx; n.y = n.ty; const t = target(n); n.mr = t.r; n.ma = t.a; });
    const c = nodes.get(currentId); if (c) { mf.x = c.tx; mf.y = c.ty; }
    if (isOpen && !gest) cam = { ...camT };
    momentum = null;
  }

  function target(n) { // mini-map dot: current / neighbour / other
    const c = nodes.get(currentId);
    if (n === c) return { r: 5, a: 1 };
    const near = c && (n.id === c.parent || n.parent === c.id);
    return near ? { r: 3.3, a: 0.95 } : { r: 2.4, a: 0.45 };
  }

  function frame(now) {
    const dt = clamp((now - last) / 1000, 0.001, 0.05); last = now;
    let busy = false;
    const kPos = 1 - Math.exp(-dt * 10), kMini = 1 - Math.exp(-dt * 12);
    nodes.forEach((n) => {
      n.x += (n.tx - n.x) * kPos; n.y += (n.ty - n.y) * kPos;
      if (Math.abs(n.tx - n.x) > 0.05 || Math.abs(n.ty - n.y) > 0.05) busy = true; else { n.x = n.tx; n.y = n.ty; }
      const t = target(n);
      n.mr += (t.r - n.mr) * kMini; n.ma += (t.a - n.ma) * kMini;
      if (Math.abs(t.r - n.mr) > 0.01 || Math.abs(t.a - n.ma) > 0.005) busy = true;
    });
    const c = nodes.get(currentId);
    if (c) {
      mf.x += (c.x - mf.x) * kPos; mf.y += (c.y - mf.y) * kPos;
      if (Math.abs(c.x - mf.x) > 0.05 || Math.abs(c.y - mf.y) > 0.05) busy = true;
    }
    if (isOpen && !tl) busy = stepCamera(dt) || busy;
    render(now);
    if (busy || tl || gest || momentum) schedule(); else rafOn = false;
  }

  function stepCamera(dt) {
    if (gest) return true;
    if (momentum) {
      cam.fx -= momentum.vx * dt * 1000 / cam.z; cam.fy -= momentum.vy * dt * 1000 / cam.z;
      const decay = Math.exp(-dt / 0.325);
      momentum.vx *= decay; momentum.vy *= decay;
      // hitting the edge: stop and spring back
      const out = cam.fx < fit.x0 - 40 || cam.fx > fit.x1 + 40 || cam.fy < fit.y0 - 40 || cam.fy > fit.y1 + 40;
      if (Math.hypot(momentum.vx, momentum.vy) < 0.02 || out) { momentum = null; camT = clampCam({ ...cam }); }
      else { camT = { ...cam }; return true; }
    }
    const k = 1 - Math.exp(-dt * 11);
    cam.fx += (camT.fx - cam.fx) * k; cam.fy += (camT.fy - cam.fy) * k;
    cam.z = Math.exp(lerp(Math.log(cam.z), Math.log(camT.z), k));
    const moving = Math.abs(camT.fx - cam.fx) > 0.05 || Math.abs(camT.fy - cam.fy) > 0.05 || Math.abs(camT.z - cam.z) > 0.0005;
    if (!moving) cam = { ...camT };
    return moving;
  }
  function clampCam(c) {
    c.z = clamp(c.z, fit.zMin, fit.zMax);
    c.fx = clamp(c.fx, fit.x0, fit.x1); c.fy = clamp(c.fy, fit.y0, fit.y1);
    return c;
  }

  // ---------- Render ----------
  function render(now) {
    renderMini();
    if (!isOpen) return;
    const vc = VC(), mc = MC();
    let v;
    if (tl && (tl.kind === 'open' || tl.kind === 'close')) {
      const t = clamp((now - tl.t0) / tl.dur);
      const p = tl.kind === 'open' ? glide(t) : 1 - glide(t);
      v = { cx: lerp(mc.x, vc.x, p), cy: lerp(mc.y, vc.y, p), fx: lerp(mf.x, cam.fx, p), fy: lerp(mf.y, cam.fy, p),
        z: Math.exp(lerp(Math.log(MINI_K), Math.log(cam.z), p)), p, lab: smooth(0.55, 1, p), others: 1, target: 1, bg: 1, head: smooth(0.5, 1, p) };
      const rMax = Math.hypot(Math.max(mc.x, W - mc.x), Math.max(mc.y, H - mc.y)) + 4;
      full.style.clipPath = `circle(${lerp(MINI_R, rMax, p).toFixed(1)}px at ${mc.x}px ${mc.y}px)`;
      if (t >= 1) {
        const k = tl.kind; tl = null;
        if (k === 'open') { full.style.clipPath = ''; full.classList.remove('is-busy'); focusIn(); }
        else finishClose();
        if (k === 'close') return;
      }
    } else if (tl && tl.kind === 'goto') {
      const t = clamp((now - tl.t0) / tl.dur), n = nodes.get(tl.id);
      const pf = easeOut(clamp(t / 0.55)), pz = inOut(clamp(t / 0.78));
      const zEnd = 1150 / sizeOf(n.depth);
      v = { cx: vc.x, cy: vc.y, fx: lerp(tl.from.fx, n.x, pf), fy: lerp(tl.from.fy, n.y, pf), z: Math.exp(lerp(Math.log(tl.from.z), Math.log(zEnd), pz)), p: 1,
        lab: 1 - smooth(0, 0.18, t), others: 1 - smooth(0, 0.32, t), target: 1 - smooth(0.66, 1, t), bg: 1 - smooth(0.34, 0.66, t), head: 1 - smooth(0, 0.25, t), targetId: n.id };
      if (!tl.emitted && t >= 0.42) { tl.emitted = true; arrive(n.id); }
      if (t >= 1) { tl = null; finishGoto(); return; }
    } else {
      v = { cx: vc.x, cy: vc.y, fx: cam.fx, fy: cam.fy, z: cam.z, p: 1, lab: 1, others: 1, target: 1, bg: 1, head: 1 };
    }
    renderFull(v, vc);
  }

  function renderFull(v, vc) {
    full.style.setProperty('--bg-a', v.bg.toFixed(3));
    head.style.opacity = v.head.toFixed(3);
    head.style.transform = `translateY(${((1 - v.head) * -6).toFixed(2)}px)`;
    fadeEl.style.opacity = Math.min(v.head, v.bg).toFixed(3);
    closeBtn.style.opacity = v.head.toFixed(3);
    closeBtn.style.transform = `scale(${lerp(0.8, 1, v.head).toFixed(3)})`;
    const here = new Set(); // edges on the path from the root to the current node
    for (let c = nodes.get(currentId); c && c.parent != null; c = parentOf(c)) { here.add(c.id); if (c.id === rootId) break; }

    nodes.forEach((n) => {
      const s = sizeOf(n.depth);
      const sx = v.cx + (n.x - v.fx) * v.z, sy = v.cy + (n.y - v.fy) * v.z;
      const dist = Math.hypot(sx - vc.x, sy - vc.y);
      const fish = 1.07 - 0.24 * smooth(70, 430, dist); // near the centre a bit larger, like Quest
      let D = s * v.z * fish;
      if (v.p < 1) D = lerp(n.mr * 2, D, v.p);
      let a = 1 - 0.55 * smooth(320, 560, dist);
      const top = sy - D / 2 - (n.up ? 34 : 0); // slide under the header: fade out instead of colliding with the title
      if (v.p >= 1) a *= 0.08 + 0.92 * smooth(92, 150, top);
      if (v.targetId) a *= n.id === v.targetId ? v.target : v.others;
      n.sx = sx; n.sy = sy; n.D = D; n.a = a;
      // while flying into one idea, the others only fade: cap their growth so we never paint huge layers
      const k = v.targetId && n.id !== v.targetId ? Math.min(Math.max(D / s, 0.001), 2.2) : Math.max(D / s, 0.001);
      n.el.style.visibility = a < 0.004 ? 'hidden' : '';
      if (n.id === v.targetId) { // the fill floods the screen; the glyph only grows to about the size of the brain
        const g = n.bub.firstElementChild, gk = Math.min(1, 240 / (0.66 * s) / k);
        if (g) g.style.transform = `scale(${gk.toFixed(4)})`;
      }
      n.el.style.transform = `translate(${sx.toFixed(2)}px,${sy.toFixed(2)}px) scale(${k.toFixed(4)})`;
      n.el.style.opacity = a.toFixed(3);
      n.el.style.zIndex = n.id === v.targetId ? 999 : Math.round(D);
      n.fill.style.opacity = v.p < 1 ? (1 - smooth(0.04, 0.42, v.p)).toFixed(3) : '0'; // tiny = a solid mini-map dot
      const ls = clamp(v.z * fish, 0.84, 1.1);
      n.lab.style.transform = `translate(-50%, ${((n.up ? -LAB_GAP : LAB_GAP) / k).toFixed(2)}px) scale(${(ls / k).toFixed(4)})`;
      const la = v.lab * smooth(16, 30, D) * (1 - 0.5 * smooth(300, 520, dist));
      n.lab.style.opacity = la.toFixed(3);
      n.lab.style.visibility = la < 0.004 ? 'hidden' : '';
    });
    edgeGap = lerp(1, 4, smooth(0, 0.5, v.p));
    edgesSvg.style.setProperty('--ew', lerp(0.55, 1, v.p).toFixed(3));
    nodes.forEach((n) => {
      if (!n.edge) return;
      const p = parentOf(n);
      if (!p) { n.edge.setAttribute('d', ''); return; }
      n.edge.setAttribute('d', curve(p, n));
      n.edge.classList.toggle('is-path', here.has(n.id));
      n.edge.style.opacity = (Math.min(p.a, n.a) * (v.p < 1 ? lerp(0.5, 1, v.p) : v.lab) * (v.targetId ? v.others : 1)).toFixed(3);
    });
  }

  // Edges: a soft curve from the parent's edge to the child's edge. If the straight way in or out would cross that
  // node's label, the line uses the side of the bubble instead and bends round in a single elbow arc.
  function sector(dx, dy) {
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    return deg > 28 && deg < 152 ? 'b' : deg < -28 && deg > -152 ? 't' : 's';
  }
  const TILT = Math.sin((22 * Math.PI) / 180), TCOS = Math.cos((22 * Math.PI) / 180);
  function port(n, dx, dy) {
    const L = Math.hypot(dx, dy) || 1, sc = sector(dx, dy);
    const sx = dx > 0.5 || (Math.abs(dx) <= 0.5 && n.tx >= 0) ? 1 : -1;
    if (sc === 'b' && !n.up) return { u: [sx * TCOS, TILT], side: true };   // lower side, above the label
    if (sc === 't' && n.up) return { u: [sx * TCOS, -TILT], side: true };   // upper side, under the label
    return { u: [dx / L, dy / L], side: false };
  }
  function curve(a, b) {
    const dx = b.sx - a.sx, dy = b.sy - a.sy, L = Math.hypot(dx, dy) || 1;
    const ra = a.D / 2 + edgeGap, rb = b.D / 2 + edgeGap;
    if (L < ra + rb + 6) return '';
    const pa = port(a, dx, dy), pb = port(b, -dx, -dy);
    const f = (v) => v.toFixed(1);
    const toward = (n, r, qx, qy) => { const u = Math.hypot(qx - n.sx, qy - n.sy) || 1; return [n.sx + ((qx - n.sx) / u) * r, n.sy + ((qy - n.sy) / u) * r]; };
    if (!pa.side && !pb.side) { // a gentle bow
      const bow = 0.1 * L, qx = (a.sx + b.sx) / 2 - (dy / L) * bow, qy = (a.sy + b.sy) / 2 + (dx / L) * bow;
      const p0 = toward(a, ra, qx, qy), p1 = toward(b, rb, qx, qy);
      return `M${f(p0[0])} ${f(p0[1])}Q${f(qx)} ${f(qy)} ${f(p1[0])} ${f(p1[1])}`;
    }
    if (pa.side !== pb.side) { // one arc, leaving the blocked end sideways
      const S = pa.side ? a : b, F = pa.side ? b : a, u = pa.side ? pa.u : pb.u, rs = pa.side ? ra : rb, rf = pa.side ? rb : ra;
      const p0 = [S.sx + u[0] * rs, S.sy + u[1] * rs];
      const k = clamp(Math.abs(F.sx - p0[0]) * 0.8, 12, 0.5 * Math.hypot(F.sx - p0[0], F.sy - p0[1])); // never swing past the other end
      const qx = p0[0] + u[0] * k, qy = p0[1] + u[1] * k, p1 = toward(F, rf, qx, qy);
      const [A, B] = pa.side ? [p0, p1] : [p1, p0];
      return `M${f(A[0])} ${f(A[1])}Q${f(qx)} ${f(qy)} ${f(B[0])} ${f(B[1])}`;
    }
    const x0 = a.sx + pa.u[0] * ra, y0 = a.sy + pa.u[1] * ra, x1 = b.sx + pb.u[0] * rb, y1 = b.sy + pb.u[1] * rb;
    const k = Math.min(0.4 * Math.hypot(x1 - x0, y1 - y0), 90);
    return `M${f(x0)} ${f(y0)}C${f(x0 + pa.u[0] * k)} ${f(y0 + pa.u[1] * k)} ${f(x1 + pb.u[0] * k)} ${f(y1 + pb.u[1] * k)} ${f(x1)} ${f(y1)}`;
  }

  function renderMini() {
    if (!mini) return;
    const c = nodes.get(currentId);
    nodes.forEach((n) => {
      const mx = (n.x - mf.x) * MINI_K, my = (n.y - mf.y) * MINI_K;
      const d = Math.hypot(mx, my), fade = 1 - smooth(24, 35, d);
      n.mx = mx; n.my = my; n.mfade = fade;
      const isCur = n === c;
      n.dot.setAttribute('cx', mx.toFixed(2)); n.dot.setAttribute('cy', my.toFixed(2));
      n.dot.setAttribute('r', Math.max(0, n.mr).toFixed(2));
      n.dot.setAttribute('fill', isCur ? n.deep : n.mid);
      n.dot.classList.toggle('is-cur', isCur);
      n.dot.style.opacity = (n.ma * fade).toFixed(3);
    });
    nodes.forEach((n) => {
      if (!n.medge) return;
      const p = parentOf(n); if (!p) return;
      n.medge.setAttribute('x1', p.mx.toFixed(2)); n.medge.setAttribute('y1', p.my.toFixed(2));
      n.medge.setAttribute('x2', n.mx.toFixed(2)); n.medge.setAttribute('y2', n.my.toFixed(2));
      const touches = c && (n === c || p === c);
      n.medge.style.opacity = ((touches ? 0.55 : 0.22) * Math.min(p.mfade, n.mfade) * Math.min(p.ma, n.ma) / 0.9).toFixed(3);
    });
    if (c) {
      miniHalo.setAttribute('cx', c.mx.toFixed(2)); miniHalo.setAttribute('cy', c.my.toFixed(2));
      miniHalo.setAttribute('fill', c.deep);
    }
  }

  // ---------- Open / close / goto ----------
  function open() {
    if (isOpen || tl || !nodes.size || !full) return;
    layout(); if (instant()) snapAll();
    cam = { fx: fit.fx, fy: fit.fy, z: fit.z }; camT = { ...cam };
    isOpen = true; gest = null; momentum = null;
    const n = nodes.size;
    headSub.textContent = `${n} ${n === 1 ? 'idea' : 'ideas'} explored`;
    full.classList.add('is-open'); full.inert = false;
    updateMiniVis();
    Bus.emit('map:state', { open: true });
    if (instant()) { full.style.clipPath = ''; render(performance.now()); focusIn(); return; }
    full.classList.add('is-busy');
    tl = { kind: 'open', t0: performance.now(), dur: 640 };
    render(performance.now()); kick();
  }

  function close(opts) {
    if (!isOpen) return;
    if ((opts && opts.instant) || instant()) { tl = null; finishClose(); return; }
    if (tl) return;
    full.classList.add('is-busy'); gest = null; momentum = null;
    tl = { kind: 'close', t0: performance.now(), dur: 560 };
    kick();
  }
  function finishClose() {
    const hadFocus = full.contains(document.activeElement);
    isOpen = false; full.classList.remove('is-open', 'is-busy'); full.inert = true; full.style.clipPath = '';
    updateMiniVis();
    Bus.emit('map:state', { open: false });
    if (hadFocus && !mini.classList.contains('is-hidden')) mini.focus({ preventScroll: true });
  }
  function focusIn() { if (!kbOpen) return; kbOpen = false; try { closeBtn.focus({ preventScroll: true }); } catch (e) { /* noop */ } }

  function goto(id) {
    const n = nodes.get(id);
    if (!isOpen || tl || !n) return;
    gest = null; momentum = null;
    if (instant()) { arrive(id); finishGoto(); return; }
    full.classList.add('is-busy'); n.el.classList.add('is-target');
    tl = { kind: 'goto', id, t0: performance.now(), dur: 900, from: { ...cam }, emitted: false };
    kick();
  }
  function arrive(id) { // the bubble now fills the screen: the exploration swaps underneath
    currentId = id; visits.push(id);
    Bus.emit('map:goto', { id });
  }
  function finishGoto() {
    isOpen = false;
    full.classList.remove('is-open', 'is-busy'); full.inert = true; full.style.clipPath = '';
    full.style.setProperty('--bg-a', '1');
    nodes.forEach((n) => { n.el.classList.remove('is-target'); n.el.style.visibility = ''; n.lab.style.visibility = ''; const g = n.bub.firstElementChild; if (g) g.style.transform = ''; });
    pendingLayout = false; layout();
    const c = nodes.get(currentId);
    if (c) { mf.x = c.tx; mf.y = c.ty; }
    nodes.forEach((n) => { const t = target(n); n.mr = t.r; n.ma = t.a; });
    Bus.emit('map:state', { open: false });
    updateMiniVis();
    if (!instant()) { mini.classList.remove('is-arrive'); void mini.offsetWidth; mini.classList.add('is-arrive'); setTimeout(() => mini.classList.remove('is-arrive'), 700); }
    kick();
  }

  // ---------- Gestures: mini-map ----------
  function bindMini() {
    mini.addEventListener('click', (e) => { kbOpen = e.detail === 0; open(); });
    mini.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) > 2) open();
    }, { passive: false });
    const mp = new Map(); let d0 = 0;
    mini.addEventListener('pointerdown', (e) => { mp.set(e.pointerId, local(e)); if (mp.size === 2) { const [a, b] = [...mp.values()]; d0 = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
    mini.addEventListener('pointermove', (e) => {
      if (!mp.has(e.pointerId)) return; mp.set(e.pointerId, local(e));
      if (mp.size === 2) { const [a, b] = [...mp.values()]; if (Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1]) - d0) > 14) { mp.clear(); open(); } }
    });
    const up = (e) => mp.delete(e.pointerId);
    mini.addEventListener('pointerup', up); mini.addEventListener('pointercancel', up);
  }

  // ---------- Gestures: full map (pan with momentum, pinch / ⌘+scroll zoom, tap a node) ----------
  function bindStage() {
    const worldAt = (x, y, c) => { const vc = VC(); return [c.fx + (x - vc.x) / c.z, c.fy + (y - vc.y) / c.z]; };
    const pair = () => { const [a, b] = [...ptrs.values()]; return { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 }; };
    const startPan = (x, y, node) => { gest = { type: 'pan', lx: x, ly: y, moved: 0, node, hist: [[performance.now(), x, y]] }; };

    stage.addEventListener('pointerdown', (e) => {
      if (!isOpen || tl) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      const [x, y] = local(e);
      ptrs.set(e.pointerId, [x, y]);
      momentum = null; camT = { ...cam };
      if (ptrs.size === 1) startPan(x, y, e.target.closest('.mp-node'));
      else if (ptrs.size === 2) { const m = pair(); gest = { type: 'pinch', d0: m.d, z0: cam.z, w: worldAt(m.x, m.y, cam), moved: 99 }; }
      stage.classList.add('is-grabbing');
      kick();
    });
    stage.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId) || !gest) return;
      const [x, y] = local(e); ptrs.set(e.pointerId, [x, y]);
      const vc = VC();
      if (gest.type === 'pan') {
        let dx = x - gest.lx, dy = y - gest.ly; gest.lx = x; gest.ly = y;
        gest.moved += Math.abs(dx) + Math.abs(dy);
        if (gest.moved < 6) return;
        // rubber band past the edges
        if ((cam.fx < fit.x0 && dx > 0) || (cam.fx > fit.x1 && dx < 0)) dx *= 0.4;
        if ((cam.fy < fit.y0 && dy > 0) || (cam.fy > fit.y1 && dy < 0)) dy *= 0.4;
        cam.fx -= dx / cam.z; cam.fy -= dy / cam.z; camT = { ...cam };
        const now = performance.now(); gest.hist.push([now, x, y]); while (gest.hist.length > 2 && now - gest.hist[0][0] > 90) gest.hist.shift();
      } else if (gest.type === 'pinch' && ptrs.size >= 2) {
        const m = pair();
        let z = gest.z0 * m.d / gest.d0;
        if (z < fit.zMin) z = fit.zMin * Math.pow(z / fit.zMin, 0.35); if (z > fit.zMax) z = fit.zMax * Math.pow(z / fit.zMax, 0.35);
        cam.z = z; cam.fx = gest.w[0] - (m.x - vc.x) / z; cam.fy = gest.w[1] - (m.y - vc.y) / z; camT = { ...cam };
      }
      kick();
    });
    const end = (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      if (!gest) return;
      if (gest.type === 'pinch') {
        if (ptrs.size === 1) { const [p] = [...ptrs.values()]; startPan(p[0], p[1], null); gest.moved = 99; return; }
      } else if (gest.type === 'pan') {
        if (gest.moved < 6 && gest.node && e.type === 'pointerup') { const id = gest.node.dataset.id; gest = null; ptrs.clear(); stage.classList.remove('is-grabbing'); goto(id); return; }
        const h = gest.hist, a = h[0], b = h[h.length - 1], dtm = b[0] - a[0];
        if (dtm > 8 && performance.now() - b[0] < 60) {
          const vx = (b[1] - a[1]) / dtm, vy = (b[2] - a[2]) / dtm;
          if (Math.hypot(vx, vy) > 0.12) momentum = { vx: clamp(vx, -3, 3), vy: clamp(vy, -3, 3) };
        }
      }
      if (ptrs.size === 0) {
        gest = null; stage.classList.remove('is-grabbing');
        if (!momentum) camT = clampCam({ ...cam });
        kick();
      }
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (!isOpen || tl) return;
      momentum = null;
      const [x, y] = local(e), vc = VC();
      if (e.ctrlKey || e.metaKey) {
        const w = worldAt(x, y, camT);
        const z = clamp(camT.z * Math.exp(-e.deltaY * 0.012), fit.zMin, fit.zMax);
        camT = { z, fx: w[0] - (x - vc.x) / z, fy: w[1] - (y - vc.y) / z };
      } else {
        camT.fx += e.deltaX / camT.z; camT.fy += e.deltaY / camT.z;
      }
      camT = clampCam(camT);
      kick();
    }, { passive: false });
  }

  // ---------- Public API ----------
  function mount(layerEl) {
    if (!layerEl || root) return;
    mountDOM(layerEl);
    if (!window.Bus) return;
    Bus.on('node:open', addOrVisit);
    Bus.on('session:done', () => { close({ instant: true }); doneHidden = true; updateMiniVis(); });
    Bus.on('reset', () => {
      tl = null; gest = null; momentum = null; ptrs.clear();
      if (isOpen) finishClose();
      clearAll(); doneHidden = false; updateMiniVis(); renderMini();
    });
  }
  function demo() {
    if (!root) return;
    if (nodes.size < 5) seedDemo();
    doneHidden = false;
    updateMiniVis();
    if (instant()) { snapAll(); render(performance.now()); }
    kick();
    if (params.has('mapclosed')) return;
    open();
  }

  window.MapUI = { mount, demo };
})();
