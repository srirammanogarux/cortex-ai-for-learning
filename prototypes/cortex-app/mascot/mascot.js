// Cortex mascot. window.Mascot. See CONTRACT.md § Mascot.
//
//   const m = Mascot.create(el, { size: 120, direction: 'A', state: 'idle', topic: null });
//   m.setState('thinking'); m.setTopic('cat'); m.say('Hi'); m.setLit(0.4); m.destroy();
//
// One brain-shaped character in six drawing directions (A line, chosen · B cell · C buddy · D line+cells · E soft · F particle).
// Every direction reads the same "pose" (outline points, face, props, timing), so they share one vocabulary
// of states and topics. Many instances can coexist: each owns its own SVG or canvas; one shared rAF drives them.
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const HTML = document.documentElement;
  const RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const isStill = () => HTML.classList.contains('still') || RM.matches;
  const Q = new URLSearchParams(location.search);
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const backOut = (t) => { if (t <= 0) return 0; if (t >= 1) return 1; const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const bounceOut = (t) => { t = clamp(t); const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; };
  function bezier(x1, y1, x2, y2) {
    const B = (a, b, s) => 3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * b + s * s * s;
    return (t) => { if (t <= 0) return 0; if (t >= 1) return 1; let lo = 0, hi = 1, s = t; for (let i = 0; i < 18; i++) { s = (lo + hi) / 2; if (B(x1, x2, s) < t) lo = s; else hi = s; } return B(y1, y2, s); };
  }
  const glide = bezier(0.32, 0.72, 0, 1);
  const r2 = (v) => Math.round(v * 100) / 100;
  const hash = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const now = () => performance.now();

  // ───────── Vocabulary ─────────
  const STATES = ['idle', 'hello', 'listening', 'thinking', 'searching', 'reading', 'analysing', 'building', 'loading', 'ready', 'happy', 'proud', 'curious', 'surprised', 'confused', 'error', 'sleepy', 'aside'];
  const TOPICS = ['brain', 'heart', 'planet', 'sun', 'cat', 'crocodile', 'octopus', 'leaf', 'camera', 'atom', 'book', 'music'];
  const LABELS = {
    idle: 'Idle', hello: 'Hello', listening: 'Listening', thinking: 'Thinking', searching: 'Searching', reading: 'Reading', analysing: 'Analysing',
    building: 'Building', loading: 'Loading', ready: 'Ready', happy: 'Happy', proud: 'Proud', curious: 'Curious', surprised: 'Surprised',
    confused: 'Confused', error: 'Error', sleepy: 'Sleepy', aside: 'Aside',
    brain: 'Brain', heart: 'Heart', planet: 'Planet', sun: 'Sun', cat: 'Cat', crocodile: 'Crocodile', octopus: 'Octopus', leaf: 'Leaf', camera: 'Camera', atom: 'Atom', book: 'Book', music: 'Music',
  };
  const DIRS = {
    A: { name: 'Living line', short: 'Line', rest: 'dot', note: 'One ember stroke that redraws itself.' },
    B: { name: 'The cell', short: 'Cell', rest: 'dot', note: 'Warm backlit cells that swell, divide and regroup.' },
    C: { name: 'Brain buddy', short: 'Buddy', rest: 'dot', note: 'A flat ink brain with dot eyes and props.' },
    D: { name: 'Line + cells', short: 'Line+cells', rest: 'dot', note: 'The line carries the state; cells carry the energy.' },
    E: { name: 'Soft', short: 'Soft', rest: 'arc', note: 'A glossy pearl brain with a warm glow.' },
    F: { name: 'Particle', short: 'Particle', rest: 'dot', note: 'A colony of warm cells. Feeling shows in how they gather and move.' },
  };
  const ALIAS = { solar: 'sun', star: 'sun', space: 'planet', croc: 'crocodile', alligator: 'crocodile', octo: 'octopus', photo: 'camera', photography: 'camera', purr: 'cat', note: 'music', self: 'brain' };
  function normTopic(t) {
    if (!t) return null;
    t = String(t).toLowerCase(); t = ALIAS[t] || t;
    return TOPIC_DEF[t] && t !== 'brain' ? t : null;
  }
  function storeDir() {
    const v = window.Store && Store.get && Store.get().variants && Store.get().variants.mascot;
    return DIRS[v] ? v : 'A';
  }

  // ───────── Shapes: every topic is one closed outline in a 100 × 100 box ─────────
  const M = 96; // outline points; all shapes share the count so any two can morph point by point
  function brainPoly() {
    const out = [];
    for (let i = 0; i < 360; i++) {
      const a = i / 360 * TAU, th = a - Math.PI / 2, c = Math.cos(th), s = Math.sin(th), n = 2.4, rx = 42, ry = 34;
      let r = 1 / Math.pow(Math.pow(Math.abs(c) / rx, n) + Math.pow(Math.abs(s) / ry, n), 1 / n);
      const up = 1 - 0.85 * sstep(0.05, 0.85, s);
      r *= 1 - 0.042 * Math.cos(10 * a) * up;                        // lobes: a soft bump every 36°, quieter underneath
      const w = a > Math.PI ? a - TAU : a;
      r *= 1 - 0.11 * Math.exp(-Math.pow(w / 0.13, 2));              // the cleft between the hemispheres
      let y = s * r; if (s > 0) y *= 0.93;
      out.push([50 + c * r, 53 + y]);
    }
    return out;
  }
  function heartPoly() {
    const out = [];
    for (let i = 0; i < 360; i++) {
      const t = i / 360 * TAU, x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      out.push([50 + x * 2.6, 45 - y * 2.45]);
    }
    return out;
  }
  const circlePoly = (cx, cy, r) => Array.from({ length: 240 }, (_, i) => [cx + Math.cos(i / 240 * TAU - Math.PI / 2) * r, cy + Math.sin(i / 240 * TAU - Math.PI / 2) * r]);
  const circ = (r, cx = 0, cy = 0) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  function ellArc(cx, cy, rx, ry, rot, a0, a1) {
    const c = Math.cos(rot), s = Math.sin(rot); let d = '';
    for (let i = 0; i <= 40; i++) { const a = lerp(a0, a1, i / 40), x = Math.cos(a) * rx, y = Math.sin(a) * ry; d += (i ? 'L' : 'M') + r2(cx + x * c - y * s) + ' ' + r2(cy + x * s + y * c); }
    return d;
  }
  const r2v = (v) => Math.round(v * 100) / 100;
  // det: decorative strokes. w: width factor · o: opacity · c: 'accent' · layer: 'back' draws behind the body
  const TOPIC_DEF = {
    brain: { poly: brainPoly, face: [50, 56, 1], det: [
      { d: 'M50 25 C47.4 29 52.6 32 50 37', w: 1.1 },
      { d: 'M23 34 C26 28.5 33 30.5 31.5 36 C30.5 40 35.5 43 40 39.5' }, { d: 'M77 34 C74 28.5 67 30.5 68.5 36 C69.5 40 64.5 43 60 39.5' },
      { d: 'M13.5 51 C16 46.5 22 47.5 21.5 52.5', o: 0.8 }, { d: 'M86.5 51 C84 46.5 78 47.5 78.5 52.5', o: 0.8 },
    ] },
    heart: { poly: heartPoly, face: [50, 50, 1], det: [{ d: 'M24 27 C28 22 34 21 38 23', o: 0.6 }] },
    planet: { poly: () => circlePoly(50, 53, 31), face: [50, 49, 0.92], det: [
      { d: ellArc(50, 66, 47, 9.5, -0.16, Math.PI, TAU), w: 1.6, c: 'accent', layer: 'back' },
      { d: ellArc(50, 66, 47, 9.5, -0.16, 0, Math.PI), w: 1.6, c: 'accent' },
      { d: 'M30 38 C34 34 40 32 45 32', o: 0.5 },
    ] },
    sun: { poly: () => circlePoly(50, 52, 25), face: [50, 54, 0.86], det: [
      { d: Array.from({ length: 12 }, (_, i) => { const a = i / 12 * TAU - Math.PI / 2, r1 = 31.5, r2 = i % 2 ? 38 : 42; return `M${r2v(50 + Math.cos(a) * r1)} ${r2v(52 + Math.sin(a) * r1)}L${r2v(50 + Math.cos(a) * r2)} ${r2v(52 + Math.sin(a) * r2)}`; }).join(''), w: 1.3, c: 'accent' },
      { d: 'M33 40 C36 35.5 41 33 46 32.5', o: 0.5 },
    ] },
    cat: { d: 'M50 30 C58 30 65 31 71 34 L79 15 Q81.5 11 84 15 L87 41 C92 48 94 57 92 66 C88 80 72 88 50 88 C28 88 12 80 8 66 C6 57 8 48 13 41 L16 15 Q18.5 11 21 15 L29 34 C35 31 42 30 50 30 Z',
      face: [50, 60, 1], det: [{ d: 'M15 62 L2 59 M15 68 L3 70' }, { d: 'M85 62 L98 59 M85 68 L97 70' }, { d: 'M20.5 22 L25 32.5 M79.5 22 L75 32.5', o: 0.55 }] },
    crocodile: { d: 'M7 62 C7 47 15 39 25 38 C26 30 33 28 37.5 33 C41.5 28 48.5 30 49 37 L85 45 C92 46 96 50 96 55.5 C96 61 92 64 86 65 L32 74 C17 77 7 72 7 62 Z',
      face: [37, 40, 0.62], det: [{ d: 'M44 57 C60 56 76 57 91 57.5' }, { d: 'M54 56.6 l2.2 3 l2.2 -3 M64 56.5 l2.2 3 l2.2 -3 M74 56.8 l2.2 3 l2.2 -3 M83 57.1 l2.2 3 l2.2 -3', w: 0.8 }, { d: 'M89.5 49.5 l.2 0', w: 2.2 }, { d: 'M12 52 C14 49 17 48 20 48', o: 0.5 }] },
    octopus: { d: 'M50 11 C72 11 84 27 84 45 C84 55 80 61 76 65 C80 71 88 73 93 69 C91 80 78 82 70 74 C70 82 66 88 59 91 C57 85 57 80 57 76 C55 80 52 85 50 93 C48 85 45 80 43 76 C43 80 43 85 41 91 C34 88 30 82 30 74 C22 82 9 80 7 69 C12 73 20 71 24 65 C20 61 16 55 16 45 C16 27 28 11 50 11 Z',
      face: [50, 44, 0.95], det: [{ d: 'M30 24 C34 19 40 16 46 16', o: 0.55 }, { d: 'M27 60 l.2 0 M73 60 l.2 0 M36 66 l.2 0 M64 66 l.2 0', w: 1.8, o: 0.6 }] },
    leaf: { d: 'M88 12 C91 46 78 76 46 84 C36 86 27 84 21 80 L11 90 Q9 92 7 90 Q5 88 7 86 L17 76 C12 65 12 52 20 40 C34 20 58 12 88 12 Z',
      face: [52, 50, 0.92], det: [{ d: 'M19 78 Q27 71 34 65.5' }, { d: 'M67 30.5 Q77 21.5 86 14' }, { d: 'M28 70 Q24.5 62 26 54 M75 25.5 Q77 32 84 34', o: 0.6 }] },
    camera: { d: 'M10 37 Q10 28 19 28 L32 28 L37 20.5 Q39 17 43.5 17 L56.5 17 Q61 17 63 20.5 L68 28 L81 28 Q90 28 90 37 L90 77 Q90 86 81 86 L19 86 Q10 86 10 77 Z',
      face: [50, 58, 0.88], det: [{ d: 'M70.5 58 A20.5 20.5 0 1 1 29.5 58 A20.5 20.5 0 1 1 70.5 58', w: 1.1 }, { d: 'M17 37 L25 37', w: 1.3 }, { d: 'M76 36 l.2 0', w: 2.4, c: 'accent' }] },
    atom: { poly: () => circlePoly(50, 53, 27), face: [50, 54, 0.85], det: [
      { d: ellArc(50, 53, 47, 14, 0, 0, TAU), c: 'accent', layer: 'back' },
      { d: ellArc(50, 53, 47, 14, Math.PI / 3, 0, TAU), c: 'accent', layer: 'back' },
      { d: ellArc(50, 53, 47, 14, -Math.PI / 3, 0, TAU), c: 'accent', layer: 'back' },
      { d: 'M97 53 l.2 0 M26.5 12.3 l.2 0 M26.5 93.7 l.2 0', w: 3, c: 'accent', layer: 'back' },
    ] },
    book: { d: 'M50 28 C40 21 25 19 9 23 L9 80 C25 76 40 78 50 86 C60 78 75 76 91 80 L91 23 C75 19 60 21 50 28 Z',
      face: [50, 53, 0.95], det: [{ d: 'M50 28 L50 41 M50 73 L50 86', w: 1.1 }, { d: 'M16 33 Q27 30 38 33 M16 40.5 Q22 38.5 29 40.5 M62 33 Q73 30 84 33 M71 40.5 Q77.5 38.5 84 40.5', o: 0.6 }, { d: 'M16 71 Q26 68 37 71 M63 71 Q74 68 84 71', o: 0.6 }] },
    music: { d: 'M56 15 Q57 10 62 12 C77 18 89 29 86 49 C82 39 74 33 65 33 L65 74 C65 86 52 92 37 92 C22 92 11 86 11 76 C11 64 25 57 40 57 C47 57 52 58 56 61 Z',
      face: [37, 75, 0.7], det: [{ d: 'M69 18 C74 21 79 25 82 30', o: 0.55 }] },
  };

  // Sample any SVG path into a polyline (a hidden <path> does the maths)
  let probe = null;
  function pathPoints(d, n) {
    if (!probe) {
      const s = document.createElementNS(NS, 'svg');
      s.setAttribute('aria-hidden', 'true'); s.setAttribute('width', '0'); s.setAttribute('height', '0');
      s.style.cssText = 'position:absolute;left:-99px;top:0;width:0;height:0;overflow:hidden';
      probe = document.createElementNS(NS, 'path'); s.appendChild(probe); (document.body || HTML).appendChild(s);
    }
    probe.setAttribute('d', d);
    const L = probe.getTotalLength(), out = [];
    for (let i = 0; i < n; i++) { const p = probe.getPointAtLength(L * i / Math.max(1, n - 1)); out.push([p.x, p.y]); }
    out.len = L;
    return out;
  }
  const PATHCACHE = new Map();
  function sampled(d, step = 3.2) {
    let s = PATHCACHE.get(d + '|' + step); if (s) return s;
    const L = pathPoints(d, 2).len; s = pathPoints(d, Math.max(2, Math.ceil(L / step) + 1));
    PATHCACHE.set(d + '|' + step, s); return s;
  }
  function resample(poly, m) {
    const n = poly.length, cum = [0];
    for (let i = 1; i <= n; i++) { const a = poly[i - 1], b = poly[i % n]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const L = cum[n], out = []; let j = 0;
    for (let k = 0; k < m; k++) {
      const s = L * k / m; while (j < n - 1 && cum[j + 1] < s) j++;
      const a = poly[j], b = poly[(j + 1) % n], u = (s - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
      out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]);
    }
    return out;
  }
  const SHAPES = {};
  function getShape(name) {
    name = name || 'brain';
    if (SHAPES[name]) return SHAPES[name];
    const def = TOPIC_DEF[name];
    let poly = def.poly ? def.poly() : pathPoints(def.d, 480);
    if (!def.poly) poly.pop(); // last sample repeats the first on a closed path
    poly = resample(poly, M);
    let area = 0, cx = 0, cy = 0;
    poly.forEach((p, i) => { const q = poly[(i + 1) % M]; area += p[0] * q[1] - q[0] * p[1]; cx += p[0]; cy += p[1]; });
    if (area < 0) poly.reverse();
    cx /= M; cy /= M;
    let best = 0, bd = 1e9;
    poly.forEach((p, i) => { const a = Math.atan2(p[1] - cy, p[0] - cx), d = Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))); if (d < bd) { bd = d; best = i; } });
    poly = poly.slice(best).concat(poly.slice(0, best));
    const pts = new Float32Array(M * 2); poly.forEach((p, i) => { pts[2 * i] = p[0]; pts[2 * i + 1] = p[1]; });
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; poly.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    return (SHAPES[name] = { name, pts, face: def.face, det: def.det || [], area: Math.abs(area) / 2, cx, cy, bb: [x0, y0, x1, y1] });
  }

  // Smooth closed path through points (Catmull-Rom → cubic). step 2 halves the segments for small sizes.
  function closedPath(P, m, step = 1) {
    const n = Math.floor(m / step), X = (k) => P[2 * ((k * step) % m)], Y = (k) => P[2 * ((k * step) % m) + 1];
    let d = 'M' + r2(X(0)) + ' ' + r2(Y(0));
    for (let i = 0; i < n; i++) {
      const i0 = (i - 1 + n) % n, i2 = (i + 1) % n, i3 = (i + 2) % n;
      const x1 = X(i), y1 = Y(i), x2 = X(i2), y2 = Y(i2);
      d += 'C' + r2(x1 + (x2 - X(i0)) / 6) + ' ' + r2(y1 + (y2 - Y(i0)) / 6) + ' ' + r2(x2 - (X(i3) - x1) / 6) + ' ' + r2(y2 - (Y(i3) - y1) / 6) + ' ' + r2(x2) + ' ' + r2(y2);
    }
    return d + 'Z';
  }
  // Catmull-Rom upsample ×2 (for the inked line)
  function upsample(P, m, out) {
    for (let i = 0; i < m; i++) {
      const a = (i - 1 + m) % m, b = i, c = (i + 1) % m, d = (i + 2) % m;
      out[4 * i] = P[2 * b]; out[4 * i + 1] = P[2 * b + 1];
      out[4 * i + 2] = (-P[2 * a] + 9 * P[2 * b] + 9 * P[2 * c] - P[2 * d]) / 16;
      out[4 * i + 3] = (-P[2 * a + 1] + 9 * P[2 * b + 1] + 9 * P[2 * c + 1] - P[2 * d + 1]) / 16;
    }
    return out;
  }
  function inside(P, m, x, y) {
    let c = false;
    for (let i = 0, j = m - 1; i < m; j = i++) { const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; }
    return c;
  }
  function edgeDist(P, m, x, y) {
    let best = 1e9;
    for (let i = 0; i < m; i++) {
      const j = (i + 1) % m, ax = P[2 * i], ay = P[2 * i + 1], bx = P[2 * j], by = P[2 * j + 1], dx = bx - ax, dy = by - ay;
      const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)); best = Math.min(best, Math.hypot(ax + dx * t - x, ay + dy * t - y));
    }
    return best;
  }

  // ───────── Faces and states ─────────
  //  eye  [half-width, curve up, stroke]   ·  mouth [half-width, curve 1, curve 2, stroke] (positive = smile)
  //  brow [opacity, lift, rotation°]
  const EYES = { arc: [4.4, 3.3, 2.1], dot: [0.01, 0, 5.4], wide: [0.01, 0, 7.4], line: [4.1, 0, 1.9], shut: [4.2, -1.3, 1.9], small: [0.01, 0, 4.4] };
  const MOUTHS = { smile: [4.4, 2.6, 2.6, 2], big: [6, 5, 5, 2.2], small: [2.4, 1.3, 1.3, 1.9], flat: [3.2, 0, 0, 1.9], o: [0.01, 0, 0, 4.8], wavy: [4.6, 2.2, -2.2, 1.9], sad: [3.4, -1.5, -1.5, 1.9] };
  const BROWS = { none: [[0, 0, 0], [0, 0, 0]], one: [[0, 0, 0], [1, -3.2, -12]], up: [[1, -3.4, -8], [1, -3.4, 8]], tilt: [[1, -0.6, 12], [1, -3.6, -8]], sad: [[1, -0.8, -15], [1, -0.8, 15]] };
  const ST = {
    idle:      { eyes: 'rest', mouth: 'smile', blush: 0.35, glow: 0.7, energy: 0.25 },
    hello:     { eyes: 'arc', mouth: 'big', blush: 0.7, glow: 1, energy: 0.7, prop: 'wave' },
    listening: { eyes: 'dot', mouth: 'small', blush: 0.35, glow: 0.95, energy: 0.5, look: [0, 0.35], prop: 'ears' },
    thinking:  { eyes: 'dot', mouth: 'small', blush: 0.2, glow: 0.85, energy: 0.45, look: [0.55, -0.8], prop: 'think' },
    searching: { eyes: 'dot', mouth: 'flat', blush: 0.15, glow: 0.85, energy: 0.7, prop: 'lens' },
    reading:   { eyes: 'dot', mouth: 'small', blush: 0.2, glow: 0.8, energy: 0.4, look: [0, 0.75], prop: 'page' },
    analysing: { eyes: 'dot', mouth: 'flat', blush: 0.15, glow: 0.9, energy: 0.75, prop: 'links' },
    building:  { eyes: 'dot', mouth: 'smile', blush: 0.25, glow: 0.9, energy: 0.65, look: [0.65, 0.2], prop: 'blocks' },
    loading:   { eyes: 'rest', mouth: 'small', blush: 0.2, glow: 0.8, energy: 0.55, prop: 'ring' },
    ready:     { eyes: 'arc', mouth: 'smile', blush: 0.5, glow: 0.95, energy: 0.35, prop: 'check' },
    happy:     { eyes: 'arc', mouth: 'big', blush: 0.75, glow: 1.05, energy: 0.6 },
    proud:     { eyes: 'arc', mouth: 'big', blush: 0.8, glow: 1.4, energy: 0.85, scale: 1.06, prop: 'stars' },
    curious:   { eyes: 'dot', mouth: 'small', blush: 0.3, glow: 0.85, energy: 0.4, tilt: -10, brows: 'one', look: [0.4, -0.3], prop: 'q' },
    surprised: { eyes: 'wide', mouth: 'o', blush: 0.3, glow: 1, energy: 0.6, brows: 'up', prop: 'bang' },
    confused:  { eyes: 'odd', mouth: 'wavy', blush: 0.15, glow: 0.6, energy: 0.35, tilt: 7, brows: 'tilt', look: [-0.3, -0.2], prop: 'swirl' },
    error:     { eyes: 'small', mouth: 'sad', blush: 0, glow: 0.3, energy: 0.12, dim: 1, brows: 'sad', look: [0, 0.55], prop: 'cloud' },
    sleepy:    { eyes: 'shut', mouth: 'small', blush: 0.2, glow: 0.35, energy: 0.06, prop: 'z' },
    aside:     { eyes: 'rest', mouth: 'smile', blush: 0.2, glow: 0.35, energy: 0.15, scale: 0.8, dock: 1 },
  };
  // The A line: how much of the outline is inked, per state
  const LINE = { error: 0.8, building: 1, loading: 0.34, aside: 0.97, sleepy: 0.97 };

  // ───────── Props: small drawings in one shared language (parts in local coords) ─────────
  //  k: 'line' stroke · 'shape' filled + stroked · 'dot' solid ink · 'spark' solid accent
  const appear = (age, at, dur = 0.3) => clamp((age - at) / dur);
  const BLOCK = 'M-4.6 -2.4 Q-4.6 -4.6 -2.4 -4.6 H2.4 Q4.6 -4.6 4.6 -2.4 V2.4 Q4.6 4.6 2.4 4.6 H-2.4 Q-4.6 4.6 -4.6 2.4 Z';
  const SPARK = 'M0 -6 Q1 -1 6 0 Q1 1 0 6 Q-1 1 -6 0 Q-1 -1 0 -6 Z';
  const lensPos = (t, still) => still ? [74, 40] : [70 + 13 * Math.sin(t * 1.5), 41 + 8 * Math.sin(t * 3)];
  const scanU = (t, still) => still ? [0, 0.55] : [Math.floor(t / 1.15) % 3, (t % 1.15) / 1.15];
  const PROPS = {
    think: { parts: [0, 1, 2].map((i) => ({ k: 'shape', d: circ([2.3, 3.3, 4.9][i]), x: [74, 81, 90][i], y: [27, 18, 7][i],
      anim: (c) => { const u = c.still ? 1 : backOut(appear(c.age, 0.15 + i * 0.24, 0.38)); return { s: u * (1 + (c.still ? 0 : 0.1 * Math.sin(c.t * 3 - i))), o: Math.min(1, u * 2) }; } })) },
    lens: { parts: [
      { k: 'shape', d: circ(7.4), glass: 1, anim: (c) => { const [x, y] = lensPos(c.t, c.still); const u = c.still ? 1 : backOut(appear(c.age, 0.05, 0.4)); return { x, y, s: u, o: u }; } },
      { k: 'line', d: 'M5.4 5.4 L11.6 11.6', w: 1.5, anim: (c) => { const [x, y] = lensPos(c.t, c.still); const u = c.still ? 1 : backOut(appear(c.age, 0.05, 0.4)); return { x, y, s: u, o: u }; } },
    ] },
    page: { parts: [
      { k: 'shape', d: 'M-13 -10 H13 Q16 -10 16 -7 V7 Q16 10 13 10 H-13 Q-16 10 -16 7 V-7 Q-16 -10 -13 -10 Z', x: 50, y: 83, anim: (c) => { const u = c.still ? 1 : easeOut(appear(c.age, 0, 0.45)); return { y: 83 + (1 - u) * 10, o: u }; } },
      { k: 'line', d: 'M-10 -4.5 H10 M-10 0.5 H10 M-10 5.5 H3', w: 0.62, x: 50, y: 83, anim: (c) => { const u = c.still ? 1 : easeOut(appear(c.age, 0, 0.45)); return { y: 83 + (1 - u) * 10, o: u * 0.8 }; } },
      { k: 'spark', d: circ(1.7), x: 50, y: 80, anim: (c) => { const u = c.still ? 1 : easeOut(appear(c.age, 0.2, 0.45)); const [ln, p] = scanU(c.t, c.still); return { x: 40 + (ln === 2 ? 13 : 20) * p, y: 83 + (1 - u) * 10 - 4.5 + ln * 5, o: u }; } },
    ] },
    links: { parts: [0, 1, 2].map((i) => ({ k: 'spark', d: circ(2), x: 50, y: 37 + i * 15,
      anim: (c) => { const sp = c.I.F.split; return { s: sp * (c.still ? 1 : 0.75 + 0.35 * Math.max(0, Math.sin(c.t * 5 - i * 1.1))), o: clamp(sp * 1.6 - 0.3) }; } })) },
    blocks: { parts: [0, 1, 2].map((i) => ({ k: 'shape', d: BLOCK, x: 86, y: 83 - i * 9.6,
      anim: (c) => {
        if (c.still) return { r: i === 2 ? 8 : 0 };
        const T = c.age % 3.6, u = appear(T, 0.25 + i * 0.7, 0.45), out = 1 - appear(T, 3.05, 0.35);
        return { y: 83 - i * 9.6 - 28 * (1 - bounceOut(u)), o: (u > 0 ? 1 : 0) * out, r: i === 2 ? 8 * u : 0 };
      } })) },
    ring: { parts: [{ k: 'line', d: circ(45, 50, 53), w: 1.15, arcRing: 1,
      anim: (c) => ({ x: 0, y: 0, draw: c.still ? 0.3 : 0.22 + 0.1 * Math.sin(c.t * 2.2), r: c.still ? -40 : c.t * 260, o: c.still ? 1 : appear(c.age, 0, 0.3) }) }] },
    check: { parts: [
      { k: 'shape', d: circ(8.6), x: 83, y: 23, anim: (c) => { const u = c.still ? 1 : backOut(appear(c.age, 0.05, 0.35)); return { s: u, o: Math.min(1, u * 2) }; } },
      { k: 'line', d: 'M-4.2 0.4 L-1.2 3.4 L4.4 -3', w: 1.15, x: 83, y: 23, anim: (c) => ({ draw: c.still ? 1 : easeOut(appear(c.age, 0.3, 0.35)), o: c.still || c.age > 0.3 ? 1 : 0 }) },
    ] },
    stars: { parts: [[15, 22, 1], [87, 14, 1.25], [92, 60, 0.8]].map(([x, y, s], i) => ({ k: 'spark', d: SPARK, x, y,
      anim: (c) => { const u = c.still ? 1 : backOut(appear(c.age, 0.2 + i * 0.18, 0.4)); return { s: s * u * (c.still ? 1 : 0.78 + 0.22 * Math.sin(c.t * 3.6 + i * 2)), r: c.still ? 0 : c.t * 30 * (i % 2 ? -1 : 1), o: Math.min(1, u * 2) }; } })) },
    q: { parts: [
      { k: 'line', d: 'M-3.6 -5 C-3.6 -10.4 4.2 -10.4 4.2 -5.4 C4.2 -2.2 0 -2 0 1.8', w: 1.1, x: 85, y: 19, anim: (c) => qAnim(c) },
      { k: 'dot', d: circ(1.6, 0, 6.4), x: 85, y: 19, anim: (c) => qAnim(c) },
    ] },
    bang: { parts: [
      { k: 'line', d: 'M0 -9 L0 1.5', w: 1.2, x: 86, y: 17, anim: (c) => bangAnim(c) },
      { k: 'dot', d: circ(1.7, 0, 6.6), x: 86, y: 17, anim: (c) => bangAnim(c) },
    ] },
    swirl: { parts: [{ k: 'line', d: 'M-1 0 C-1 -2.6 2.6 -2.6 2.6 0 C2.6 3.6 -3.6 4.2 -4.6 0 C-5.6 -5.2 1 -7.8 5.6 -4.6', w: 1, x: 80, y: 15,
      anim: (c) => { const u = c.still ? 1 : backOut(appear(c.age, 0.1, 0.4)); return { s: u * 1.15, r: c.still ? 0 : c.t * 70, o: u }; } }] },
    cloud: { parts: [
      { k: 'shape', d: 'M-8 5 H7 C10.5 5 11 0 7.5 -0.5 C7.5 -5 2 -7 -1 -3.8 C-3 -6 -8 -5 -8 -1 C-11 -0.5 -11 5 -8 5 Z', x: 80, y: 17,
        anim: (c) => { const u = c.still ? 1 : easeOut(appear(c.age, 0.1, 0.6)); return { x: 80 + (c.still ? 0 : 1.6 * Math.sin(c.t * 0.7)), y: 17 + (1 - u) * -5, o: u }; } },
      ...[0, 1].map((i) => ({ k: 'line', d: 'M0 0 L-0.7 2.6', w: 0.9, x: 76 + i * 7, y: 25,
        anim: (c) => { if (c.still) return { y: 26 + i * 2, o: 0.8 }; const u = ((c.t + i * 0.8) % 1.6) / 1.6; return { x: 76 + i * 7 + 1.6 * Math.sin(c.t * 0.7) - u * 1.2, y: 24 + u * 8, o: Math.sin(u * Math.PI) * appear(c.age, 0.6, 0.4) }; } })),
    ] },
    z: { parts: [0, 1].map((i) => ({ k: 'line', d: 'M-3 -3 H3 L-3 3 H3', w: 1, x: [73, 83][i], y: [27, 15][i],
      anim: (c) => { if (c.still) return { s: [0.85, 1.15][i], o: 1 }; const u = ((c.t * 0.38 + i * 0.5) % 1); return { x: 72 + u * 9, y: 30 - u * 18, s: 0.7 + u * 0.6, o: Math.sin(u * Math.PI) * appear(c.age, 0.3, 0.6) }; } })) },
    ears: { parts: [[93, 'M0 -4.5 Q2.8 0 0 4.5'], [97.5, 'M0 -7.5 Q4.6 0 0 7.5'], [7, 'M0 -4.5 Q-2.8 0 0 4.5'], [2.5, 'M0 -7.5 Q-4.6 0 0 7.5']].map(([x, d], i) => ({ k: 'line', d, w: 0.95, x, y: 52,
      anim: (c) => { const lv = c.I.lv, far = i % 2; const pulse = c.still ? 0.6 : 0.45 + 0.35 * Math.sin(c.t * 4 - far * 1.4); const o = clamp(Math.max(pulse * (far ? 0.6 : 1), lv * 1.4 - far * 0.3)); return { s: 1 + lv * 0.25, o: o * appear(c.age, 0, 0.25) }; } })) },
    wave: { parts: [[90, 'M0 -5 Q3 0 0 5'], [95, 'M0 -8.5 Q5 0 0 8.5']].map(([x, d], i) => ({ k: 'line', d, w: 0.95, x, y: 32,
      anim: (c) => { if (c.still) return { o: 1 - i * 0.3 }; const k = Math.max(0, Math.sin((c.age - 0.5) * TAU * 1.4 - i * 0.8)) * (1 - appear(c.age, 2.2, 0.5)) * appear(c.age, 0.5, 0.2); return { o: k, x: x + k * 1.5 }; } })) },
  };
  const GROW = { think: 1, check: 1, stars: 1, q: 1, bang: 1, swirl: 1, cloud: 1, z: 1, lens: 1 }; // read better a little bigger when small
  function qAnim(c) { const u = c.still ? 1 : backOut(appear(c.age, 0.12, 0.4)); return { s: u, r: 12, y: 19 + (c.still ? 0 : 1.4 * Math.sin(c.t * 2.2)), o: Math.min(1, u * 2) }; }
  function bangAnim(c) { const u = c.still ? 1 : backOut(appear(c.age, 0.04, 0.3)); return { s: u * 1.1, r: c.still ? 6 : 6 + 8 * Math.sin(c.age * 18) * Math.exp(-c.age * 5), o: Math.min(1, u * 2) }; }

  // ───────── Motion: how each state moves (timing carries the emotion) ─────────
  function motion(I, o, t, age, still) {
    o.tx = 0; o.ty = 0; o.rot = 0; o.sx = 1; o.sy = 1; o.lx = 0; o.ly = 0; o.split = 0;
    const st = I.state;
    if (st === 'analysing') o.split = still ? 1 : sstep(0, 1, 0.5 - 0.5 * Math.cos(Math.max(0, age - 0.1) * TAU / 2.6)) * 1.0;
    if (still) {
      if (st === 'searching') { const [x, y] = lensPos(0, true); o.lx = (x - I.F.face[0]) / 24; o.ly = (y - I.F.face[1]) / 22; }
      if (st === 'reading') { o.lx = 0.1; }
      if (st === 'hello' || st === 'happy' || st === 'proud') o.ty = -2;
      return o;
    }
    const slow = st === 'sleepy' ? 5.6 : st === 'aside' || st === 'error' ? 4.6 : 3.6;
    const b = Math.sin(t * TAU / slow), amp = st === 'sleepy' ? 0.035 : st === 'proud' ? 0.03 : 0.02;
    o.sx += b * amp * 0.55; o.sy += b * amp;
    switch (st) {
      case 'hello': hop(o, age, 0.1, 0.55, 10); if (age > 0.6) o.rot = 8 * Math.sin((age - 0.6) * TAU * 1.4) * Math.exp(-(age - 0.6) * 0.9); break;
      case 'listening': { const l = I.lv; o.rot = -3 + Math.sin(t * 2) * 1.2; o.sy += l * 0.08; o.sx -= l * 0.03; o.ty = -l * 2.5; break; }
      case 'thinking': o.rot = 3 * Math.sin(t * 1.3); o.lx = 0.15 * Math.sin(t * 0.9); o.ty = -1 + Math.sin(t * 1.7) * 0.8; break;
      case 'searching': { const [x, y] = lensPos(t, false); o.lx = (x - I.F.face[0]) / 24; o.ly = (y - I.F.face[1]) / 22; o.rot = 2.5 * Math.sin(t * 1.5); break; }
      case 'reading': { const [, p] = scanU(t, false); o.lx = -0.75 + 1.5 * p; o.rot = 1.5 * Math.sin(t * 0.8); break; }
      case 'analysing': o.rot = 1.5 * Math.sin(t * 2.4); break;
      case 'building': { const T = age % 3.6; for (let i = 0; i < 3; i++) { const u = (T - (0.25 + i * 0.7 + 0.42)) / 0.25; if (u > 0 && u < 1) { const k = Math.sin(u * Math.PI); o.sy -= k * 0.04; o.sx += k * 0.025; } } o.lx = 0.15 * Math.sin(t * 2); break; }
      case 'loading': o.rot = 2 * Math.sin(t * 2.2); o.ty = Math.sin(t * 4.4) * 0.8; break;
      case 'ready': { const u = clamp(age / 0.5); const k = Math.sin(u * Math.PI); o.ty = k * 3; o.sy -= k * 0.05; o.sx += k * 0.03; break; }
      case 'happy': { const k = Math.abs(Math.sin(t * 3.3)); o.ty = -k * 3.2; const land = Math.pow(1 - k, 6); o.sy -= land * 0.035; o.sx += land * 0.025; o.rot = Math.sin(t * 1.65) * 3; break; }
      case 'proud': hop(o, age, 0.05, 0.7, 13); o.ty += -2 - Math.sin(t * 1.8) * 1.2; break;
      case 'curious': o.rot = Math.sin(t * 1.5) * 2.5; o.ty = Math.sin(t * 3) * 0.6; break;
      case 'surprised': { const u = clamp(age / 0.45); const k = Math.sin(u * Math.PI); o.ty = -k * 8; o.sy += k * 0.1; o.sx -= k * 0.06; o.rot = Math.sin(age * 22) * 3 * Math.exp(-age * 4); break; }
      case 'confused': o.rot = 4 * Math.sin(t * 0.9); o.lx = 0.3 * Math.sin(t * 0.9 + 1); break;
      case 'error': o.ty = 2; o.sy -= 0.03; o.sx += 0.015; o.rot = Math.sin(t * 0.6) * 1.2; break;
      case 'sleepy': o.ty = 1.5; o.rot = Math.sin(t * 0.45) * 3; break;
      case 'aside': o.rot = Math.sin(t * 0.7) * 1; break;
      case 'idle': { o.rot = Math.sin(t * 0.8) * 1.2; break; }
    }
    // one-shot gestures
    const g = I.gest;
    if (g) {
      const ga = (now() - g.t0) / 1000;
      if (g.n === 'hop') hop(o, ga, 0, 0.55, 9);
      else if (g.n === 'bounce') { const u = clamp(ga / 0.42); o.ty -= Math.sin(u * Math.PI) * 4.5; const k = Math.sin(u * Math.PI * 2); o.sy -= k * 0.03; }
      else if (g.n === 'nod') { const u = clamp(ga / 0.45); const k = Math.sin(u * Math.PI); o.ty += k * 2.6; o.sy -= k * 0.05; }
      else if (g.n === 'wave') { o.rot += 8 * Math.sin(ga * TAU * 1.6) * Math.max(0, 1 - ga / 1.3); }
      else if (g.n === 'shake') { o.tx += 2.6 * Math.sin(ga * TAU * 3.2) * Math.max(0, 1 - ga / 0.7); }
      if (ga > 1.4) I.gest = null;
    }
    // topic morph squish
    if (I.morph) { const k = Math.sin(clamp(I.morph.u) * Math.PI); o.sy -= k * 0.1; o.sx += k * 0.07; }
    return o;
  }
  function hop(o, age, at, dur, h) {
    const u = (age - at) / dur; if (u < -0.25 || u > 1.3) return;
    if (u < 0) { const k = Math.sin((u + 0.25) / 0.25 * Math.PI) * 0.5; o.sy -= k * 0.08; o.sx += k * 0.05; return; } // anticipation
    if (u <= 1) { const k = Math.sin(u * Math.PI); o.ty -= k * h; o.sy += k * 0.07; o.sx -= k * 0.04; return; }
    const k = Math.sin((u - 1) / 0.3 * Math.PI); o.sy -= k * 0.09; o.sx += k * 0.06; // land
  }

  // ───────── Shared ticker ─────────
  const LIVE = new Set();
  let raf = 0, frameN = 0;
  function ensureTick() { if (!raf && LIVE.size) raf = requestAnimationFrame(tick); }
  function tick(ts) {
    raf = 0; frameN++;
    LIVE.forEach((I) => { try { I.frame(ts); } catch (e) { console.error('Mascot', e); I.destroy(); } });
    ensureTick();
  }
  const IO = window.IntersectionObserver ? new IntersectionObserver((es) => es.forEach((e) => { const I = e.target._ms; if (I) { I.visible = e.isIntersecting; if (I.visible) I.dirty = true; } }), { rootMargin: '80px' }) : null;
  if (Q.has('still')) HTML.classList.add('still');
  if (RM.addEventListener) RM.addEventListener('change', () => LIVE.forEach((I) => { I.dirty = true; }));

  // ───────── The instance ─────────
  const svg = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  function put(e, a, v) { const c = e._c || (e._c = {}); if (c[a] !== v) { c[a] = v; e.setAttribute(a, v); } }

  class Inst {
    constructor(el, o) {
      this.el = el; this.k = ++Inst.n; this.id = 'ms' + this.k;
      this.size = o.size || Math.round(el.getBoundingClientRect().width / ((window.PS) || 1)) || 120;
      this.pinned = !!(o.direction && DIRS[o.direction]);
      this.dir = this.pinned ? o.direction : storeDir();
      this.state = ST[o.state] ? o.state : 'idle'; this.st0 = now();
      this.topic = normTopic(o.topic);
      const sh = getShape(this.topic || 'brain');
      this.shape = sh; this.pts = Float32Array.from(sh.pts); this.ptsV = 0; this.morph = null;
      this.F = { face: sh.face.slice(), det: [{ sh, o: 1 }], split: 0 };
      this.dets = [{ sh, o: 1, from: 1, to: 1 }];
      this.pose = null; this.props = []; this.addProp(ST[this.state].prop, true);
      this.level = 0; this.lv = 0; this.lit = 0; this.litV = 0; this.shown = true; this.lookExt = null; this.lookT = 0; this.gest = null;
      this.blinkAt = now() + 1200 + Math.random() * 2000; this.blinkT0 = -1e9; this.glanceAt = now() + 3000 + Math.random() * 3000; this.glance = null;
      this.visible = true; this.dirty = true; this.last = 0; this.connectedOnce = el.isConnected; this.lost = 0; this.alive = true;
      el.classList.add('ms'); el.style.setProperty('--ms-size', this.size + 'px'); el.dataset.msDir = this.dir;
      if (o.decorative) el.setAttribute('aria-hidden', 'true'); else { el.setAttribute('role', 'img'); el.setAttribute('aria-label', o.label || 'Cortex'); }
      this.stage = document.createElement('div'); this.stage.className = 'ms-stage'; el.appendChild(this.stage);
      this.r = makeRenderer(this.dir, this); this.r.el.classList.add('ms-layer'); this.stage.appendChild(this.r.el);
      this.old = null;
      el._ms = this; if (IO) IO.observe(el);
      LIVE.add(this); ensureTick();
      const self = this;
      this.api = {
        el, get state() { return self.state; }, get topic() { return self.topic; }, get direction() { return self.dir; },
        setState: (s, opt) => self.setState(s, opt), setTopic: (t, opt) => self.setTopic(t, opt), setDirection: (d) => self.setDirection(d),
        say: (txt, ms) => self.say(txt, ms), setLevel: (v) => { self.level = clamp(+v || 0); }, look: (x, y) => self.look(x, y),
        play: (g) => self.play(g), setLit: (v) => { self.lit = clamp(+v || 0); self.dirty = true; }, destroy: () => self.destroy(),
      };
    }
    setState(s, opt = {}) {
      if (!ST[s]) return;
      if (s === this.state && !opt.restart) return;
      this.state = s; this.st0 = now(); this.dirty = true;
      this.props.forEach((p) => { if (!p.out) { p.out = true; p.t1 = now(); } });
      this.addProp(ST[s].prop);
      if (s === 'hello' || s === 'surprised' || s === 'proud') this.blinkAt = now() + 2500;
    }
    addProp(name, instant) {
      if (!name) return;
      const p = PROPS[name]; if (!p) return;
      const parts = (this.dir === 'C' && name === 'wave') ? [] : p.parts;
      this.props.push({ name, parts, t0: now(), k: instant ? 1 : 0, out: false, nodes: null });
    }
    setTopic(t, opt = {}) {
      const nt = normTopic(t);
      if (nt === this.topic) return;
      this.topic = nt; this.dirty = true;
      const sh = getShape(nt || 'brain');
      const ms = isStill() || opt.instant ? 0 : (opt.ms || 820);
      this.dets.forEach((d) => { d.from = d.o; d.to = 0; });
      this.dets.push({ sh, o: ms ? 0 : 1, from: 0, to: 1 });
      if (!ms) { this.pts.set(sh.pts); this.ptsV++; this.F.face = sh.face.slice(); this.dets = [this.dets[this.dets.length - 1]]; this.dets[0].o = 1; this.morph = null; }
      else this.morph = { from: Float32Array.from(this.pts), face0: this.F.face.slice(), to: sh, t0: now(), dur: ms, u: 0 };
      this.shape = sh;
      if (this.r.onShape) this.r.onShape(sh, ms);
    }
    setDirection(d) {
      if (d == null) { this.pinned = false; d = storeDir(); } else this.pinned = true;
      if (!DIRS[d] || d === this.dir) return;
      this.dir = d; this.el.dataset.msDir = d; this.dirty = true;
      if (this.old) { this.old.r.destroy(); this.old.r.el.remove(); }
      const prev = this.r; this.old = { r: prev, until: now() + 340 };
      prev.el.classList.add('ms-out');
      this.r = makeRenderer(d, this); this.r.el.classList.add('ms-layer', 'ms-in'); this.stage.appendChild(this.r.el);
      this.props.forEach((p) => { p.nodes = null; if (d === 'C' && p.name === 'wave') p.parts = []; else if (PROPS[p.name]) p.parts = PROPS[p.name].parts; });
      if (isStill()) { prev.destroy(); prev.el.remove(); this.old = null; }
    }
    look(x, y) { if (x == null) { this.lookExt = null; return; } this.lookExt = [clamp(+x, -1, 1), clamp(+y || 0, -1, 1)]; this.lookT = now(); }
    play(g) { if (g === 'blink') { this.blinkT0 = now(); return; } this.gest = { n: g, t0: now() }; }
    say(txt, ms) {
      clearTimeout(this.sayT);
      let b = this.el.querySelector(':scope > .ms-say');
      if (!txt) { if (b) b.classList.remove('is-on'); return; }
      if (!b) { b = document.createElement('p'); b.className = 'ms-say'; b.setAttribute('aria-live', 'polite'); this.el.appendChild(b); }
      b.textContent = txt; b.classList.remove('is-on'); void b.offsetWidth; b.classList.add('is-on');
      this.sayT = setTimeout(() => b.classList.remove('is-on'), isStill() ? 4000 : (ms || 2600));
    }
    destroy() {
      if (!this.alive) return; this.alive = false;
      LIVE.delete(this); if (IO) IO.unobserve(this.el);
      clearTimeout(this.sayT);
      this.r.destroy(); if (this.old) this.old.r.destroy();
      this.stage.remove(); const b = this.el.querySelector(':scope > .ms-say'); if (b) b.remove();
      this.el.classList.remove('ms'); delete this.el._ms;
    }

    targetPose() {
      const s = ST[this.state], rest = DIRS[this.dir].rest;
      const en = s.eyes === 'rest' ? rest : s.eyes;
      const eL = en === 'odd' ? EYES.dot : EYES[en], eR = en === 'odd' ? EYES.line : EYES[en];
      const br = BROWS[s.brows || 'none'];
      return { eL, eR, m: MOUTHS[s.mouth], bL: br[0], bR: br[1], blush: s.blush || 0, glow: s.glow, energy: s.energy, tilt: s.tilt || 0, scale: s.scale || 1, dock: s.dock || 0, dim: s.dim || 0, look: s.look || [0, 0], line: LINE[this.state] != null ? LINE[this.state] : 0.97 };
    }
    frame(ts) {
      if (!this.alive) return;
      if ((frameN & 31) === 0) {
        if (!this.el.isConnected) { if (this.connectedOnce && ++this.lost > 2) { this.destroy(); return; } }
        else { this.connectedOnce = true; this.lost = 0; }
      }
      // hidden pages (visibility: hidden, display: none) don't need frames; IntersectionObserver can't tell
      if ((frameN & 15) === (this.k & 15)) {
        const was = this.shown;
        this.shown = this.el.checkVisibility ? this.el.checkVisibility({ visibilityProperty: true }) : true;
        if (this.shown && !was) this.dirty = true;
      }
      if (!this.shown && !this.dirty) return;
      const still = isStill();
      if (this.old && (ts >= this.old.until || still)) { this.old.r.destroy(); this.old.r.el.remove(); this.old = null; }
      if (!this.visible && !this.dirty) return;
      if (still && !this.dirty) return;
      if (!still && this.size < 72 && !this.dirty && (frameN & 1)) return; // small ones run at 30fps
      const dt = this.last ? Math.min(0.1, (ts - this.last) / 1000) : 0.016; this.last = ts;
      this.dirty = false;
      const t = ts / 1000, age = (ts - this.st0) / 1000, F = this.F;
      F.t = t; F.age = age; F.still = still; F.state = this.state; F.size = this.size; F.dir = this.dir;
      F.sw = this.size < 72 ? 1.4 : this.size < 110 ? 1.15 : 1;

      // topic morph
      if (this.morph) {
        const mo = this.morph, u = still ? 1 : clamp((ts - mo.t0) / mo.dur), e = glide(u);
        mo.u = u;
        const A = mo.from, B = mo.to.pts;
        for (let i = 0; i < M * 2; i++) this.pts[i] = A[i] + (B[i] - A[i]) * e;
        for (let i = 0; i < 3; i++) F.face[i] = lerp(mo.face0[i], mo.to.face[i], e);
        this.dets.forEach((d) => { d.o = d.to ? lerp(d.from, 1, sstep(0.45, 1, u)) : lerp(d.from, 0, sstep(0, 0.45, u)); });
        this.ptsV++;
        if (u >= 1) { this.morph = null; this.dets = this.dets.filter((d) => d.to); }
        F.morphU = u;
      } else F.morphU = 1;
      F.pts = this.pts; F.ptsV = this.ptsV; F.dets = this.dets; F.shape = this.shape;

      // pose: ease toward the state's target
      const T = this.targetPose();
      if (!this.pose || still) this.pose = JSON.parse(JSON.stringify(T));
      else {
        const k = 1 - Math.exp(-dt * 11), kb = 1 - Math.exp(-dt * 6);
        const P = this.pose;
        ['eL', 'eR', 'm', 'bL', 'bR', 'look'].forEach((key) => { for (let i = 0; i < T[key].length; i++) P[key][i] += (T[key][i] - P[key][i]) * k; });
        ['blush', 'glow', 'energy', 'dim', 'line'].forEach((key) => { P[key] += (T[key] - P[key]) * k; });
        ['tilt', 'scale', 'dock'].forEach((key) => { P[key] += (T[key] - P[key]) * kb; });
      }
      const P = this.pose;
      this.lv += (this.level - this.lv) * (still ? 1 : 1 - Math.exp(-dt * 14));
      const mo = motion(this, F.mo || (F.mo = {}), t, age, still);
      F.split = mo.split;

      // blink + glance (only when the eyes are open-ish and nothing else is going on)
      let blink = 0;
      if (!still) {
        const n = now(), calm = ['idle', 'listening', 'curious', 'reading', 'aside', 'loading', 'building', 'searching'].includes(this.state);
        if (n > this.blinkAt) { if (calm) this.blinkT0 = n; this.blinkAt = n + 2600 + Math.random() * 3400; if (calm && Math.random() < 0.18) this.blinkT0b = n + 260; }
        const bu = (n - this.blinkT0) / 170, bu2 = this.blinkT0b ? (n - this.blinkT0b) / 170 : -1;
        if (bu >= 0 && bu < 1) blink = Math.sin(bu * Math.PI); else if (bu2 >= 0 && bu2 < 1) blink = Math.sin(bu2 * Math.PI);
        if (this.state === 'idle' && n > this.glanceAt) { this.glance = [(Math.random() - 0.5) * 1.4, (Math.random() - 0.6) * 0.8, n]; this.glanceAt = n + 3500 + Math.random() * 4000; }
      }
      // look: external pointer look wins in calm states for 2.5s
      let lx = P.look[0] + mo.lx, ly = P.look[1] + mo.ly;
      if (this.lookExt && now() - this.lookT < 2500 && ['idle', 'listening', 'curious', 'happy', 'hello'].includes(this.state)) { lx = this.lookExt[0]; ly = this.lookExt[1]; }
      else if (this.glance && this.state === 'idle' && now() - this.glance[2] < 1300) { lx += this.glance[0]; ly += this.glance[1]; }
      const fl = F.lk || (F.lk = [0, 0]);
      if (still) { fl[0] = lx; fl[1] = ly; } else { const kk = 1 - Math.exp(-dt * 9); fl[0] += (clamp(lx, -1, 1) - fl[0]) * kk; fl[1] += (clamp(ly, -1, 1) - fl[1]) * kk; }

      const blinkE = (e) => (blink && e[1] < 1.5 ? [lerp(e[0], 4, blink), lerp(e[1], 0, blink), lerp(e[2], 1.9, blink)] : e);
      F.eL = blinkE(P.eL); F.eR = blinkE(P.eR); F.m = P.m; F.bL = P.bL; F.bR = P.bR;
      F.blush = P.blush; F.glow = P.glow; F.energy = P.energy; F.dim = P.dim; F.line = P.line;
      F.lv = this.lv;
      this.litV += (this.lit - this.litV) * (still ? 1 : 1 - Math.exp(-dt * 4));
      if (Math.abs(this.lit - this.litV) > 0.002) this.dirty = true;
      F.lit = this.litV;
      // root transform: squash about the base, tilt, dock to the lower left
      const sc = P.scale * (1 - 0 * P.dock);
      F.root = F.root || {};
      Object.assign(F.root, { tx: mo.tx - P.dock * 5, ty: mo.ty + P.dock * 5, rot: mo.rot + P.tilt, sx: mo.sx, sy: mo.sy, sc });
      F.base = 87;
      // props
      const c = F.pc || (F.pc = { I: this });
      c.t = t; c.still = still;
      this.props = this.props.filter((p) => {
        if (p.out) p.k = still ? 0 : Math.max(0, 1 - (ts - p.t1) / 200);
        else p.k = still ? 1 : Math.min(1, (ts - p.t0) / 220);
        if (p.out && p.k <= 0) { if (this.r.dropProp) this.r.dropProp(p); if (this.old && this.old.r.dropProp) this.old.r.dropProp(p); return false; }
        c.age = still ? 10 : (ts - p.t0) / 1000;
        const g = this.size < 72 && GROW[p.name] ? 1.3 : 1;
        p.st = p.parts.map((part) => { const a = part.anim ? part.anim(c) : {}; return { x: a.x != null ? a.x : (part.x || 0), y: a.y != null ? a.y : (part.y || 0), s: (a.s != null ? a.s : 1) * g, r: a.r || 0, o: (a.o != null ? a.o : 1) * p.k, draw: a.draw != null ? a.draw : 1 }; });
        return true;
      });
      F.props = this.props;
      this.r.draw(F);
      if (this.old) this.old.r.draw(F);
      if (!still) this.dirty = false;
    }
  }
  Inst.n = 0;

  // ───────── Face geometry shared by every direction ─────────
  // Returns eye/mouth/brow/blush geometry in body space.
  function faceGeo(F) {
    const [fx, fy, fs] = F.face, lx = F.lk[0], ly = F.lk[1], sp = F.split * 8;
    const ox = fx + lx * 1.6 * fs, oy = fy + ly * 1.3 * fs;
    const eyes = [[-1, F.eL], [1, F.eR]].map(([sd, e]) => ({ x: ox + sd * 11 * fs + lx * 1.4 * fs + sd * sp, y: oy + ly * 1.4 * fs, w: e[0] * fs, c: e[1] * fs, sw: e[2] * fs }));
    const m = F.m;
    const mouth = { x: ox + lx * 0.6 * fs, y: oy + 9 * fs, w: m[0] * fs, c1: m[1] * fs, c2: m[2] * fs, sw: m[3] * fs, o: 1 - F.split };
    const brows = [[-1, F.bL], [1, F.bR]].map(([sd, b]) => ({ x: ox + sd * 11 * fs + sd * sp, y: oy - 8 * fs + b[1] * fs, r: b[2], o: b[0], w: 2.8 * fs }));
    const blush = [-1, 1].map((sd) => ({ x: ox + sd * 17 * fs + sd * sp, y: oy + 6 * fs, rx: 4.2 * fs, ry: 2.3 * fs }));
    return { eyes, mouth, brows, blush, fs };
  }
  const eyeD = (e) => 'M' + r2(e.x - e.w) + ' ' + r2(e.y) + 'C' + r2(e.x - e.w / 3) + ' ' + r2(e.y - e.c * 1.33) + ' ' + r2(e.x + e.w / 3) + ' ' + r2(e.y - e.c * 1.33) + ' ' + r2(e.x + e.w) + ' ' + r2(e.y);
  const mouthD = (m) => 'M' + r2(m.x - m.w) + ' ' + r2(m.y) + 'C' + r2(m.x - m.w / 3) + ' ' + r2(m.y + m.c1 * 1.33) + ' ' + r2(m.x + m.w / 3) + ' ' + r2(m.y + m.c2 * 1.33) + ' ' + r2(m.x + m.w) + ' ' + r2(m.y);
  const rootT = (R, B) => `translate(${r2(R.tx)} ${r2(R.ty)}) translate(50 ${B}) rotate(${r2(R.rot)}) scale(${r2(R.sx * R.sc)} ${r2(R.sy * R.sc)}) translate(-50 ${-B})`;
  const propT = (R, B) => `translate(${r2(R.tx)} ${r2(R.ty)}) translate(50 ${B}) scale(${r2(R.sc)}) translate(-50 ${-B})`;

  // ───────── Styles per direction ─────────
  const C = { bone: '#F6ECE1', shell: '#FFF8F1', humus: '#2B1A12', bark: '#6A4636', ember: '#B83A1C', coral: '#F07B5A', saffron: '#EFB43E' };
  const STY = {
    E: { ink: C.humus, det: '#D9805F', detO: 0.55, accent: '#E7A23A', pStroke: '#C9573A', pFill: null, pw: 1.7, spark: '#EFA93A' },
    C: { ink: C.humus, det: C.humus, detO: 1, accent: C.humus, pStroke: C.humus, pFill: C.shell, pw: 2.1, spark: C.saffron },
    A: { ink: C.ember, det: C.ember, detO: 1, accent: C.ember, pStroke: C.ember, pFill: 'none', pw: 2.1, spark: C.ember },
  };

  // ───────── SVG renderer (A line · C buddy · E soft) ─────────
  function svgRenderer(dir, I) {
    const S = STY[dir], id = I.id + dir, small = I.size < 72;
    const root = svg('svg', { viewBox: '0 0 100 100', class: 'ms-svg', overflow: 'inherit', 'aria-hidden': 'true', focusable: 'false' });
    const defs = svg('defs', null, root);
    let bodyG, fill, back, rim, hl, hl2, outline, shadowBody, ribbon;
    if (dir === 'E') {
      defs.innerHTML = `<radialGradient id="${id}p" cx=".38" cy=".3" r=".8" fx=".35" fy=".24"><stop offset="0" stop-color="#FFF7EF"/><stop offset=".34" stop-color="#FEEADB"/><stop offset=".68" stop-color="#FAD2BA"/><stop offset=".9" stop-color="#F3B293"/><stop offset="1" stop-color="#EC9C7C"/></radialGradient>
        <radialGradient id="${id}k" cx=".74" cy=".98" r=".8"><stop offset="0" stop-color="#F59A4A" stop-opacity=".5"/><stop offset=".5" stop-color="#F7A25C" stop-opacity=".14"/><stop offset="1" stop-color="#F7A25C" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}g"><stop offset="0" stop-color="#FFB27A" stop-opacity=".78"/><stop offset=".42" stop-color="#F7976C" stop-opacity=".34"/><stop offset=".72" stop-color="#F07B5A" stop-opacity=".1"/><stop offset="1" stop-color="#F07B5A" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}h"><stop offset="0" stop-color="#FFFFFF" stop-opacity="1"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity=".75"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}m" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFFDF8"/><stop offset=".6" stop-color="#FCE3D1"/><stop offset="1" stop-color="#F2B597"/></radialGradient>`;
    }
    svg('clipPath', { id: id + 'L' }, defs).appendChild(svg('rect', { x: -60, y: -60, width: 110, height: 220 }));
    svg('clipPath', { id: id + 'R' }, defs).appendChild(svg('rect', { x: 50, y: -60, width: 110, height: 220 }));
    bodyG = svg('g', { id: id + 'b' }, defs);
    if (dir === 'E') {
      fill = svg('path', { fill: `url(#${id}p)` }, bodyG);
      back = svg('path', { fill: `url(#${id}k)` }, bodyG);
      rim = svg('path', { fill: 'none', stroke: '#E38A6C', 'stroke-opacity': small ? '.7' : '.5', 'stroke-width': small ? '1.4' : '0.9' }, bodyG);
      hl = svg('ellipse', { fill: `url(#${id}h)` }, bodyG);
      hl2 = small ? null : svg('circle', { fill: '#FFFFFF', 'fill-opacity': '.9', r: '1.6' }, bodyG);
    } else if (dir === 'C') {
      fill = svg('path', { fill: C.shell, stroke: C.humus, 'stroke-width': r2(2.5 * I_sw(I)), 'stroke-linejoin': 'round' }, bodyG);
    } else {
      ribbon = svg('path', { fill: C.ember, 'fill-rule': 'evenodd' }, bodyG);
    }
    const detFront = svg('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bodyG);

    let shadow = null, halo = null;
    if (dir !== 'A') shadow = svg('ellipse', { cx: 50, cy: 91.5, rx: 25, ry: 3.4, fill: C.bark, 'fill-opacity': dir === 'C' ? '.16' : '.13' }, root);
    const rootG = svg('g', null, root);
    if (dir === 'E') halo = svg('circle', { cx: 50, cy: 54, r: 66, fill: `url(#${id}g)` }, rootG);
    const detBack = svg('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, rootG);
    let maskBody = null;
    if (dir === 'A') {
      const mk = svg('mask', { id: id + 'k', maskUnits: 'userSpaceOnUse', x: -60, y: -60, width: 220, height: 220 }, defs);
      svg('rect', { x: -60, y: -60, width: 220, height: 220, fill: 'white' }, mk); // keywords: the Living theme leaves them alone
      maskBody = svg('path', { fill: 'black', stroke: 'black', 'stroke-width': '2' }, mk);
      detBack.setAttribute('mask', `url(#${id}k)`);
    }
    if (dir === 'C') shadowBody = svg('path', { fill: '#F3CDB5' }, rootG);
    const u0 = svg('use', { href: '#' + id + 'b' }, rootG);
    const uL = svg('use', { href: '#' + id + 'b', 'clip-path': `url(#${id}L)`, visibility: 'hidden' }, rootG);
    const uR = svg('use', { href: '#' + id + 'b', 'clip-path': `url(#${id}R)`, visibility: 'hidden' }, rootG);
    let arms = null;
    if (dir === 'C') {
      const ag = svg('g', { fill: 'none', stroke: C.humus, 'stroke-width': r2(2.5 * I_sw(I)), 'stroke-linecap': 'round' }, rootG);
      arms = [0, 1].map(() => ({ p: svg('path', null, ag), cur: null }));
    }
    // setLit(v): small saffron sparks light up inside the body, a share of them at a time (A only)
    const litG = dir === 'A' ? svg('g', { stroke: 'none' }, rootG) : null;
    let litDots = [], litFor = '';
    const faceG = svg('g', { 'stroke-linecap': 'round', fill: 'none' }, rootG);
    const blush = dir === 'A' ? [] : [0, 1].map(() => svg('ellipse', { fill: C.coral, stroke: 'none' }, faceG));
    const eyes = [0, 1].map(() => svg('path', { stroke: S.ink }, faceG));
    const brows = [0, 1].map(() => svg('path', { stroke: S.ink, d: 'M-1 0 L1 0' }, faceG));
    const mouth = svg('path', { stroke: S.ink }, faceG);
    const propG = svg('g', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, root);

    const detNodes = new Map();
    let lastV = -1, smoothP = new Float32Array(M * 4);
    function detNode(sh, i, dd) {
      const key = sh.name + i;
      let n = detNodes.get(key);
      if (!n) {
        const w = (dd.w || 1) * (dir === 'E' ? (sh.name === 'brain' ? 1.5 : 1.7) : 2.1) * I_sw(I);
        const col = dd.c === 'accent' ? S.accent : S.det;
        const host = dd.layer === 'back' ? detBack : detFront;
        if (dir === 'E' && dd.c !== 'accent') {
          // a soft embossed groove: a light edge under a warm line
          n = svg('g', null, host);
          svg('path', { d: dd.d, stroke: '#FFFFFF', 'stroke-opacity': '.85', 'stroke-width': r2(w * 0.9), transform: 'translate(.5 .9)' }, n);
          svg('path', { d: dd.d, stroke: col, 'stroke-width': r2(w) }, n);
        } else n = svg('path', { d: dd.d, stroke: col, 'stroke-width': r2(w), pathLength: '1' }, host);
        n._base = (dir === 'E' ? (dd.c === 'accent' ? 0.9 : S.detO) : 1) * (dd.o != null ? dd.o : 1);
        detNodes.set(key, n);
      }
      return n;
    }
    const R = {
      el: root,
      draw(F) {
        const B = F.base;
        // body outline
        if (F.ptsV !== lastV || dir === 'A') {
          if (dir === 'A') {
            upsample(F.pts, M, smoothP);
            let frac = F.line, s0 = 0.985;
            if (F.state === 'loading' && !F.still) { s0 = F.t * 0.55; frac = 0.3 + 0.1 * Math.sin(F.t * 2.2); }
            if (F.state === 'building' && !F.still) { const T = F.age % 3.6; frac = T < 2.6 ? easeOut(T / 2.6) : 1 - sstep(3.05, 3.6, T) * 0.98; }
            if (F.morphU < 1) frac *= 1 - 0.55 * Math.sin(F.morphU * Math.PI);
            const W = (F.state === 'proud' ? 3.2 : F.state === 'sleepy' ? 1.9 : 2.6) * F.sw;
            put(ribbon, 'd', ribbonD(smoothP, M * 2, frac, s0, W));
            if (F.ptsV !== lastV) { lastV = F.ptsV; maskBody.setAttribute('d', closedPath(F.pts, M, 2)); }
          } else {
            lastV = F.ptsV;
            const d = closedPath(F.pts, M, small ? 2 : 1);
            fill.setAttribute('d', d);
            if (back) { back.setAttribute('d', d); rim.setAttribute('d', d); }
            if (shadowBody) shadowBody.setAttribute('d', d);
            if (hl) {
              const bb = bbox(F.pts);
              put(hl, 'cx', r2(lerp(bb[0], bb[2], 0.32))); put(hl, 'cy', r2(lerp(bb[1], bb[3], 0.2)));
              put(hl, 'rx', r2((bb[2] - bb[0]) * 0.17)); put(hl, 'ry', r2((bb[3] - bb[1]) * 0.1));
              put(hl, 'transform', `rotate(-24 ${r2(lerp(bb[0], bb[2], 0.32))} ${r2(lerp(bb[1], bb[3], 0.2))})`);
              if (hl2) { put(hl2, 'cx', r2(lerp(bb[0], bb[2], 0.24))); put(hl2, 'cy', r2(lerp(bb[1], bb[3], 0.3))); }
            }
          }
        }
        // decorations (cross-fade on topic change; A draws them on)
        const seen = new Set();
        F.dets.forEach(({ sh, o }) => sh.det.forEach((dd, i) => {
          const n = detNode(sh, i, dd); seen.add(n);
          const op = o * n._base * (dir === 'E' ? 1 - F.dim * 0.4 : 1);
          put(n, 'opacity', r2(op));
          if (dir === 'A' || dir === 'C') { const dr = F.still ? 1 : sstep(0, 1, o); put(n, 'stroke-dasharray', dr >= 0.999 ? 'none' : `${r2(dr)} 2`); }
          put(n, 'visibility', op < 0.01 ? 'hidden' : 'inherit');
        }));
        detNodes.forEach((n, k) => { if (!seen.has(n)) { n.remove(); detNodes.delete(k); } });
        // whole-body transform
        const R0 = F.root;
        put(rootG, 'transform', rootT(R0, B));
        put(propG, 'transform', propT(R0, B));
        if (shadow) { const lift = clamp(-R0.ty / 14); put(shadow, 'rx', r2(25 * R0.sc * (1 - lift * 0.35) * (1 + (R0.sx - 1)))); put(shadow, 'fill-opacity', r2((dir === 'C' ? 0.16 : 0.13) * (1 - lift * 0.5))); put(shadow, 'cx', r2(50 + R0.tx)); }
        if (halo) { const g = F.glow * (F.still ? 1 : 1 + 0.06 * Math.sin(F.t * (1.2 + F.energy * 3))); put(halo, 'opacity', r2(clamp(0.2 + 0.6 * g, 0, 1))); put(halo, 'r', r2(54 + 14 * Math.min(1.4, g))); }
        // split (analysing): two halves drift apart and regroup
        if (F.split > 0.01) {
          put(u0, 'visibility', 'hidden'); put(uL, 'visibility', 'inherit'); put(uR, 'visibility', 'inherit');
          const sp = F.split * 7;
          put(uL, 'transform', `translate(${r2(-sp)} 0) rotate(${r2(-F.split * 7)} 50 70)`); put(uR, 'transform', `translate(${r2(sp)} 0) rotate(${r2(F.split * 7)} 50 70)`);
          if (shadowBody) put(shadowBody, 'visibility', 'hidden');
        } else { put(u0, 'visibility', 'inherit'); put(uL, 'visibility', 'hidden'); put(uR, 'visibility', 'hidden'); if (shadowBody) put(shadowBody, 'visibility', 'inherit'); }
        if (shadowBody) put(shadowBody, 'transform', 'translate(2.4 3)');
        if (dir === 'E') put(fill, 'opacity', r2(1 - F.dim * 0.18));
        // face
        const G = faceGeo(F), sw = F.sw;
        G.eyes.forEach((e, i) => { put(eyes[i], 'd', eyeD(e)); put(eyes[i], 'stroke-width', r2(e.sw * sw * (dir === 'E' ? 0.95 : 1))); });
        put(mouth, 'd', mouthD(G.mouth)); put(mouth, 'stroke-width', r2(G.mouth.sw * sw)); put(mouth, 'opacity', r2(G.mouth.o));
        G.brows.forEach((b, i) => { put(brows[i], 'transform', `translate(${r2(b.x)} ${r2(b.y)}) rotate(${r2(b.r)}) scale(${r2(b.w)})`); put(brows[i], 'stroke-width', r2(1.8 * sw / b.w)); put(brows[i], 'opacity', r2(b.o)); });
        blush.forEach((b, i) => { const g = G.blush[i]; put(b, 'cx', r2(g.x)); put(b, 'cy', r2(g.y)); put(b, 'rx', r2(g.rx)); put(b, 'ry', r2(g.ry)); put(b, 'opacity', r2(F.blush * (dir === 'C' ? 0.45 : 0.5))); });
        if (arms) drawArms(arms, F, G);
        if (litG) {
          if (F.lit > 0.005 && litFor !== F.shape.name) {
            litFor = F.shape.name; litG.innerHTML = '';
            const [fx0, fy0, fs0] = F.shape.face;
            const pts = interior(F.shape, 40).filter(([x, y]) => !(Math.abs(x - fx0) < 21 * fs0 && y > fy0 - 9 * fs0 && y < fy0 + 15 * fs0)).sort((a, b) => hash(a[0] * 3.1 + a[1]) - hash(b[0] * 3.1 + b[1]));
            litDots = pts.map(([x, y], i) => ({ n: svg('circle', { cx: r2(x), cy: r2(y), r: '2.3', fill: i % 3 ? C.saffron : C.coral }, litG), k: i / pts.length, ph: hash(i + 0.3) * TAU }));
          }
          put(litG, 'visibility', F.lit > 0.005 ? 'inherit' : 'hidden');
          litDots.forEach((d) => { const on = sstep(d.k - 0.02, d.k + 0.06, F.lit); put(d.n, 'opacity', r2(on * (F.still ? 0.9 : 0.7 + 0.3 * Math.sin(F.t * 2.4 + d.ph)))); });
        }
        drawPropsSVG(propG, F, S, dir, I);
      },
      dropProp(p) { const n = p.nodes && p.nodes[dir]; if (n) n.g.remove(); if (p.nodes) delete p.nodes[dir]; },
      destroy() { I.props.forEach((p) => R.dropProp(p)); },
    };
    return R;
  }
  const I_sw = (I) => (I.size < 72 ? 1.35 : I.size < 110 ? 1.12 : 1);
  function bbox(P) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < M; i++) { const x = P[2 * i], y = P[2 * i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }

  // The A line as an inked ribbon: varying width, tapered ends when it isn't closed
  function ribbonD(P, m, frac, s0, W) {
    const closed = frac > 0.995, n = closed ? m : Math.max(3, Math.round(m * clamp(frac, 0.02, 1)));
    const start = Math.floor((((s0 % 1) + 1) % 1) * m);
    const Lx = [], Ly = [], Rx = [], Ry = [];
    for (let k = 0; k < (closed ? m : n + 1); k++) {
      const i = (start + k) % m, ip = (i - 1 + m) % m, inx = (i + 1) % m;
      const tx = P[2 * inx] - P[2 * ip], ty = P[2 * inx + 1] - P[2 * ip + 1], tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl, ny = tx / tl, u = i / m;
      let w = W * (0.78 + 0.26 * Math.sin(u * TAU * 3 + 0.6) + 0.1 * Math.sin(u * TAU * 7 + 1.3));
      if (!closed) { const a = k / n; w *= Math.min(1, 0.25 + a / 0.07 * 0.75, 0.25 + (1 - a) / 0.07 * 0.75); }
      const x = P[2 * i], y = P[2 * i + 1];
      Lx.push(x + nx * w / 2); Ly.push(y + ny * w / 2); Rx.push(x - nx * w / 2); Ry.push(y - ny * w / 2);
    }
    let d = 'M' + r2(Lx[0]) + ' ' + r2(Ly[0]);
    for (let k = 1; k < Lx.length; k++) d += 'L' + r2(Lx[k]) + ' ' + r2(Ly[k]);
    if (closed) { d += 'ZM' + r2(Rx[Rx.length - 1]) + ' ' + r2(Ry[Ry.length - 1]); for (let k = Rx.length - 2; k >= 0; k--) d += 'L' + r2(Rx[k]) + ' ' + r2(Ry[k]); return d + 'Z'; }
    // round-ish cap at the end, then back along the other side
    for (let k = Rx.length - 1; k >= 0; k--) d += 'L' + r2(Rx[k]) + ' ' + r2(Ry[k]);
    return d + 'Z';
  }

  // C buddy's little arms: rest by the sides, reach for the prop
  function drawArms(arms, F, G) {
    const P = F.pts, fy = F.face[1], fs = F.face[2];
    let li = 0, ri = 0, lx = 1e9, rx = -1e9;
    for (let i = 0; i < M; i++) { const x = P[2 * i], y = P[2 * i + 1]; if (Math.abs(y - (fy + 9 * fs)) < 9) { if (x < lx) { lx = x; li = i; } if (x > rx) { rx = x; ri = i; } } }
    if (lx > 1e8) { lx = 14; rx = 86; }
    const sy = (i, fb) => (i ? P[2 * i + 1] : fb);
    const S0 = [lx + 2.5, sy(li, fy + 9)], S1 = [rx - 2.5, sy(ri, fy + 9)];
    const st = F.state, t = F.t, still = F.still;
    let L = [S0[0] - 6, S0[1] + 11], Rr = [S1[0] + 6, S1[1] + 11];
    const findPart = (name, k) => { const p = F.props.find((q) => q.name === name && !q.out); return p && p.st[k]; };
    if (st === 'hello') Rr = [S1[0] + 11 + (still ? 0 : 2.5 * Math.sin(t * 11)), S1[1] - 19];
    else if (st === 'searching') { const q = findPart('lens', 0); if (q) Rr = [q.x + 11, q.y + 11]; }
    else if (st === 'reading') { const q = findPart('page', 0); if (q) { L = [q.x - 15, q.y + 1]; Rr = [q.x + 15, q.y + 1]; } }
    else if (st === 'building') { const p = F.props.find((q) => q.name === 'blocks' && !q.out); if (p) { let top = p.st[0]; p.st.forEach((s) => { if (s.o > 0.5 && s.y < top.y) top = s; }); Rr = [top.x - 5, top.y + 1]; } }
    else if (st === 'proud') { L = [S0[0] - 9, S0[1] - 17]; Rr = [S1[0] + 9, S1[1] - 17]; }
    else if (st === 'happy') { L = [S0[0] - 10, S0[1] - 3]; Rr = [S1[0] + 10, S1[1] - 3]; }
    else if (st === 'surprised') { L = [S0[0] - 11, S0[1] - 9]; Rr = [S1[0] + 11, S1[1] - 9]; }
    else if (st === 'confused') Rr = [S1[0] - 2 + (still ? 0 : 1.2 * Math.sin(t * 9)), S1[1] - 27];
    else if (st === 'listening') Rr = [S1[0] + 7, S1[1] - 13];
    else if (st === 'sleepy' || st === 'error') { L = [S0[0] - 3, S0[1] + 12]; Rr = [S1[0] + 3, S1[1] + 12]; }
    [[arms[0], S0, L, -1], [arms[1], S1, Rr, 1]].forEach(([a, s, h, sd]) => {
      if (!a.cur || still) a.cur = h.slice(); else { a.cur[0] += (h[0] - a.cur[0]) * 0.22; a.cur[1] += (h[1] - a.cur[1]) * 0.22; }
      const hx = a.cur[0], hy = a.cur[1], mx = (s[0] + hx) / 2, my = (s[1] + hy) / 2, dx = hx - s[0], dy = hy - s[1], len = Math.hypot(dx, dy) || 1;
      const bend = 3.5 * sd;
      put(a.p, 'd', `M${r2(s[0])} ${r2(s[1])}Q${r2(mx - dy / len * bend)} ${r2(my + dx / len * bend)} ${r2(hx)} ${r2(hy)}`);
    });
  }

  function drawPropsSVG(g, F, S, dir, I) {
    F.props.forEach((p) => {
      p.nodes = p.nodes || {};
      let n = p.nodes[dir];
      if (!n) {
        const pg = svg('g', null, g);
        n = p.nodes[dir] = { g: pg, parts: p.parts.map((part) => {
          const pp = svg('g', null, pg);
          const w = (part.w || 1) * S.pw * I_sw(I);
          let a;
          if (part.k === 'line') a = { fill: 'none', stroke: S.pStroke, 'stroke-width': r2(w) };
          else if (part.k === 'dot') a = { fill: S.pStroke, stroke: 'none' };
          else if (part.k === 'spark') a = { fill: S.spark, stroke: 'none' };
          else if (dir === 'E') a = { fill: part.glass ? '#FFF6EE' : `url(#${I.id}Em)`, 'fill-opacity': part.glass ? '.55' : '1', stroke: S.pStroke, 'stroke-width': r2(w * 0.8) };
          else a = { fill: part.glass ? (dir === 'C' ? C.shell : 'none') : S.pFill, 'fill-opacity': part.glass ? '.6' : '1', stroke: S.pStroke, 'stroke-width': r2(w) };
          if (part.arcRing || part.k === 'line') a.pathLength = '1';
          a.d = part.d;
          const path = svg('path', a, pp);
          return { pp, path };
        }) };
      }
      p.st.forEach((s, i) => {
        const q = n.parts[i];
        put(q.pp, 'transform', `translate(${r2(s.x)} ${r2(s.y)}) rotate(${r2(s.r)}${p.parts[i].arcRing ? ' 50 53' : ''}) scale(${r2(Math.max(0.001, s.s))})`);
        put(q.pp, 'opacity', r2(clamp(s.o)));
        if (p.parts[i].k === 'line' || p.parts[i].arcRing) put(q.path, 'stroke-dasharray', s.draw >= 0.999 ? 'none' : `${r2(s.draw)} 2`);
      });
    });
  }

  // ───────── Canvas renderer (B cell · D line+cells) ─────────
  const CELL = [[240, 123, 90], [242, 154, 74], [232, 104, 112], [239, 180, 62], [210, 82, 50]];
  const BCOL = [0, 1, 3, 0, 1, 2, 3, 0, 4, 1];
  const SPRITES = {};
  function spr(key, paint) { if (SPRITES[key]) return SPRITES[key]; const c = document.createElement('canvas'); c.width = c.height = 64; paint(c.getContext('2d'), 64); return (SPRITES[key] = c); }
  function cellSprite(i) {
    const [r, g, b] = CELL[i];
    return spr('c' + i, (x, S) => {
      const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      m.addColorStop(0, `rgba(${r},${g},${b},0.34)`); m.addColorStop(0.58, `rgba(${r},${g},${b},0.5)`); m.addColorStop(0.84, `rgba(${r},${g},${b},0.96)`); m.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = m; x.fillRect(0, 0, S, S);
      x.fillStyle = `rgba(${r * 0.55 | 0},${g * 0.4 | 0},${b * 0.4 | 0},0.62)`; x.beginPath(); x.arc(S * 0.46, S * 0.46, S * 0.13, 0, TAU); x.fill();
      const h = x.createRadialGradient(S * 0.36, S * 0.32, 0, S * 0.36, S * 0.32, S * 0.2); h.addColorStop(0, 'rgba(255,250,240,0.55)'); h.addColorStop(1, 'rgba(255,250,240,0)'); x.fillStyle = h; x.fillRect(0, 0, S, S);
    });
  }
  const eyeCellSprite = () => spr('eye', (x, S) => {
    const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    m.addColorStop(0, 'rgba(255,248,241,1)'); m.addColorStop(0.74, 'rgba(255,240,228,1)'); m.addColorStop(0.88, 'rgba(240,150,110,0.9)'); m.addColorStop(1, 'rgba(240,123,90,0)');
    x.fillStyle = m; x.fillRect(0, 0, S, S);
  });
  const glowSprite = () => spr('glow', (x, S) => {
    const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    m.addColorStop(0, 'rgba(255,178,122,0.7)'); m.addColorStop(0.45, 'rgba(247,151,108,0.3)'); m.addColorStop(0.75, 'rgba(240,123,90,0.08)'); m.addColorStop(1, 'rgba(240,123,90,0)');
    x.fillStyle = m; x.fillRect(0, 0, S, S);
  });

  function canvasRenderer(dir, I) {
    const cv = document.createElement('canvas'); cv.className = 'ms-cv'; cv.setAttribute('aria-hidden', 'true');
    const PAD = 0.3, size = I.size, dpr = Math.min(2, window.devicePixelRatio || 1) * (size < 72 ? 1.5 : 1);
    const css = size * (1 + PAD * 2);
    cv.width = Math.round(css * dpr); cv.height = Math.round(css * dpr);
    const ctx = cv.getContext('2d');
    const small = size < 72;
    const edgeN = dir === 'B' ? (small ? 26 : 46) : (small ? 16 : 30);
    const innerN = small ? 7 : 26;
    // B: interior cells (matched and moved on topic change). Edge cells ride the outline.
    let cells = [];
    const seedCells = (sh, instant, ms) => {
      if (dir !== 'B') return;
      const targets = interior(sh, innerN), t0 = now();
      const live = cells.filter((c) => !c.die), used = new Array(live.length).fill(false);
      targets.sort((a, b) => Math.hypot(a[0] - sh.cx, a[1] - sh.cy) - Math.hypot(b[0] - sh.cx, b[1] - sh.cy));
      targets.forEach(([x, y], k) => {
        let bi = -1, bd = 1e9;
        for (let j = 0; j < live.length; j++) if (!used[j]) { const d = Math.hypot(live[j].x - x, live[j].y - y); if (d < bd) { bd = d; bi = j; } }
        let c;
        if (bi >= 0) { c = live[bi]; used[bi] = true; } else { c = { x: sh.cx, y: sh.cy, s: 0, col: BCOL[(k * 7 + cells.length) % BCOL.length], ph: hash(cells.length + k) * TAU, rr: 0.85 + 0.3 * hash(k + 3.3) }; cells.push(c); }
        Object.assign(c, { fx: c.x, fy: c.y, fs: c.s, tx: x, ty: y, ts: 1, t0: t0 + (instant ? 0 : Math.hypot(x - sh.cx, y - sh.cy) * 7), d: instant ? 1 : ms * (0.6 + 0.3 * hash(k)), die: false, arc: instant ? 0 : (hash(k + 9) - 0.5) * 10 });
      });
      live.forEach((c, j) => { if (!used[j]) Object.assign(c, { fx: c.x, fy: c.y, fs: c.s, tx: sh.cx, ty: sh.cy, ts: 0, t0, d: ms * 0.5 || 1, die: true, arc: 0 }); });
    };
    seedCells(I.shape, true, 1);
    const smoothP = new Float32Array(M * 4);
    const R = {
      el: cv,
      onShape(sh, ms) { seedCells(sh, !ms, ms); },
      draw(F) {
        const W = cv.width, u = (size / 100) * dpr, off = PAD * size * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, W);
        ctx.setTransform(u, 0, 0, u, off, off);
        const R0 = F.root, B = F.base, t = F.t, still = F.still, en = F.energy;
        // glow
        const g = F.glow * (still ? 1 : 1 + 0.06 * Math.sin(t * (1.2 + en * 3)));
        ctx.save(); ctx.translate(R0.tx, R0.ty);
        const gr = (dir === 'B' ? 58 : 50) * Math.min(1.4, 0.75 + 0.35 * g) * R0.sc;
        ctx.globalAlpha = clamp((dir === 'B' ? 0.25 : 0.12) + (dir === 'B' ? 0.5 : 0.35) * g);
        ctx.drawImage(glowSprite(), 50 - gr, 54 - gr, gr * 2, gr * 2); ctx.restore();
        ctx.globalAlpha = 1;
        // ground shadow
        ctx.save(); const lift = clamp(-R0.ty / 14); ctx.globalAlpha = 0.12 * (1 - lift * 0.5); ctx.fillStyle = C.bark;
        ctx.beginPath(); ctx.ellipse(50 + R0.tx, 91.5, 24 * R0.sc * (1 - lift * 0.35), 3.2, 0, 0, TAU); ctx.fill(); ctx.restore();
        // body space
        ctx.save();
        ctx.translate(R0.tx, R0.ty); ctx.translate(50, B); ctx.rotate(R0.rot * Math.PI / 180); ctx.scale(R0.sx * R0.sc, R0.sy * R0.sc); ctx.translate(-50, -B);
        upsample(F.pts, M, smoothP);
        const P = F.pts, sp = F.split * 7, cx = F.shape.cx;
        const so = (x) => (sp ? (x < 50 ? -sp : sp) : 0);
        const dimA = 1 - F.dim * 0.35;
        if (dir === 'B') {
          // edge cells
          const per = perimeter(P), rEdge = per / edgeN * 0.6;
          drawDetCanvas(ctx, F, 'cells', so, 'back');
          // a soft membrane underneath keeps the brain silhouette readable
          ctx.save(); ctx.globalAlpha = 0.55 * dimA; ctx.fillStyle = '#FBD9C2';
          if (sp) { [-1, 1].forEach((sd) => { ctx.save(); ctx.beginPath(); ctx.rect(sd < 0 ? -60 : 50, -60, 110, 220); ctx.clip(); ctx.translate(sd * sp, 0); ctx.fill(path2d(closedPath(P, M, 2))); ctx.restore(); }); }
          else ctx.fill(new Path2D(closedPath(P, M, 2)));
          ctx.restore();
          ctx.globalAlpha = dimA;
          for (let k = 0; k < edgeN; k++) {
            const i = Math.round(k * M / edgeN) % M, ip = (i - 1 + M) % M, inx = (i + 1) % M;
            const tx = P[2 * inx] - P[2 * ip], ty = P[2 * inx + 1] - P[2 * ip + 1], tl = Math.hypot(tx, ty) || 1;
            const ph = hash(k + 0.5) * TAU, br = still ? 1 : 1 + 0.12 * Math.sin(t * 1.5 + ph) + F.lv * 0.2 * Math.sin(t * 9 + ph);
            const jit = still ? 0 : en * 0.6;
            let x = P[2 * i] - ty / tl * rEdge * 0.25 + Math.sin(t * 1.3 + ph) * jit, y = P[2 * i + 1] + tx / tl * rEdge * 0.25 + Math.cos(t * 1.1 + ph * 1.3) * jit;
            x += so(x);
            const r = rEdge * br * (0.85 + 0.3 * hash(k + 7.7));
            ctx.drawImage(cellSprite(BCOL[k % BCOL.length]), x - r, y - r, r * 2, r * 2);
          }
          // interior cells
          const tn = now(), rIn = Math.sqrt(F.shape.area / Math.max(8, innerN)) * 0.42;
          ctx.globalAlpha = 0.78 * dimA;
          cells = cells.filter((c) => {
            const uu = still ? 1 : clamp((tn - c.t0) / c.d), e = glide(uu);
            c.x = lerp(c.fx, c.tx, e) + (c.arc ? Math.sin(uu * Math.PI) * c.arc : 0); c.y = lerp(c.fy, c.ty, e); c.s = lerp(c.fs, c.ts, e);
            if (c.die && uu >= 1) return false;
            if (c.s < 0.02) return true;
            const jit = still ? 0 : en * 1.1;
            let x = c.x + Math.sin(t * 1.2 + c.ph) * jit, y = c.y + Math.cos(t * 1.05 + c.ph * 1.7) * jit;
            if (F.lv) { x += (x - cx) * F.lv * 0.06; y += (y - F.shape.cy) * F.lv * 0.06; }
            x += so(c.x);
            const r = rIn * c.rr * c.s * (still ? 1 : 1 + 0.1 * Math.sin(t * 1.4 + c.ph));
            ctx.drawImage(cellSprite(c.col), x - r, y - r, r * 2, r * 2);
            return true;
          });
          ctx.globalAlpha = 1;
          drawDetCanvas(ctx, F, 'cells', so, 'front');
        } else {
          // D: the ember line + cells flowing along it
          let frac = F.line, s0 = 0.985;
          if (F.state === 'loading' && !still) { s0 = t * 0.55; frac = 0.3 + 0.1 * Math.sin(t * 2.2); }
          if (F.state === 'building' && !still) { const T = F.age % 3.6; frac = T < 2.6 ? easeOut(T / 2.6) : 1 - sstep(3.05, 3.6, T) * 0.98; }
          if (F.morphU < 1) frac *= 1 - 0.5 * Math.sin(F.morphU * Math.PI);
          const m2 = M * 2, n = Math.max(2, Math.round(m2 * frac)), st = Math.floor((((s0 % 1) + 1) % 1) * m2);
          drawDetCanvas(ctx, F, 'line', so, 'back');
          const half = (side) => {
            ctx.save();
            if (sp) { ctx.beginPath(); ctx.rect(side < 0 ? -60 : 50, -60, 110, 220); ctx.clip(); ctx.translate(side * sp, 0); }
            ctx.strokeStyle = C.ember; ctx.lineWidth = (F.state === 'proud' ? 2.8 : 2.2) * F.sw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = dimA;
            ctx.beginPath();
            for (let k = 0; k <= (frac > 0.995 ? m2 : n); k++) { const i = (st + k) % m2; if (k) ctx.lineTo(smoothP[2 * i], smoothP[2 * i + 1]); else ctx.moveTo(smoothP[2 * i], smoothP[2 * i + 1]); }
            if (frac > 0.995) ctx.closePath();
            ctx.stroke(); ctx.restore();
          };
          if (sp) { half(-1); half(1); } else half(0);
          // cells along the visible line
          const speed = still ? 0 : 0.015 + en * 0.09, K = edgeN;
          ctx.globalAlpha = dimA;
          for (let k = 0; k < K; k++) {
            const ph = hash(k + 2.2);
            let s = ((k + 0.5) / K + t * speed * (k % 3 === 0 ? 1.4 : 1) + 1) % 1;
            const rel = ((s - (((s0 % 1) + 1) % 1)) + 1) % 1; if (frac < 0.995 && rel > frac) continue;
            const fi = s * m2, i = Math.floor(fi) % m2, j = (i + 1) % m2, f = fi - Math.floor(fi);
            let x = lerp(smoothP[2 * i], smoothP[2 * j], f), y = lerp(smoothP[2 * i + 1], smoothP[2 * j + 1], f);
            const tx = smoothP[2 * j] - smoothP[2 * i], ty = smoothP[2 * j + 1] - smoothP[2 * i + 1], tl = Math.hypot(tx, ty) || 1;
            const offN = (ph - 0.5) * 7 + (still ? 0 : Math.sin(t * (1.5 + en * 4) + ph * 9) * (0.6 + en * 1.6)) + F.lv * 3 * Math.sin(t * 10 + k);
            x += -ty / tl * offN; y += tx / tl * offN; x += so(x);
            const r = (1.3 + 2 * hash(k + 5.1)) * (small ? 1.5 : 1) * (still ? 1 : 1 + 0.15 * Math.sin(t * 2 + ph * 7));
            ctx.drawImage(cellSprite(k % CELL.length), x - r, y - r, r * 2, r * 2);
          }
          ctx.globalAlpha = 1;
          drawDetCanvas(ctx, F, 'line', so, 'front');
        }
        drawFaceCanvas(ctx, F, dir);
        ctx.restore();
        // props
        ctx.save(); ctx.translate(R0.tx, R0.ty); ctx.translate(50, B); ctx.scale(R0.sc, R0.sc); ctx.translate(-50, -B);
        drawPropsCanvas(ctx, F, dir);
        ctx.restore();
      },
      destroy() {},
    };
    return R;
  }
  function perimeter(P) { let L = 0; for (let i = 0; i < M; i++) { const j = (i + 1) % M; L += Math.hypot(P[2 * j] - P[2 * i], P[2 * j + 1] - P[2 * i + 1]); } return L; }
  const INNER = new Map();
  function interior(sh, count) {
    const key = sh.name + count; if (INNER.has(key)) return INNER.get(key);
    let h = Math.sqrt(2 * sh.area / (Math.sqrt(3) * count)), out = [];
    for (let tries = 0; tries < 4; tries++) {
      out = [];
      for (let row = 0, y = sh.bb[1] + h * 0.5; y < sh.bb[3]; y += h * 0.866, row++) {
        for (let x = sh.bb[0] + (row % 2 ? h * 0.5 : 0) + h * 0.25; x < sh.bb[2]; x += h) {
          const jx = x + (hash(row * 31 + x) - 0.5) * h * 0.3, jy = y + (hash(row * 17 + x * 3) - 0.5) * h * 0.3;
          if (inside(sh.pts, M, jx, jy) && edgeDist(sh.pts, M, jx, jy) > h * 0.55) out.push([jx, jy]);
        }
      }
      if (out.length >= count * 0.7) break;
      h *= 0.85;
    }
    INNER.set(key, out); return out;
  }
  function drawDetCanvas(ctx, F, mode, so, layer) {
    F.dets.forEach(({ sh, o }) => sh.det.forEach((dd) => {
      if (o < 0.02 || (dd.layer === 'back') !== (layer === 'back')) return;
      if (mode === 'line') {
        ctx.save(); ctx.globalAlpha = o * (dd.o != null ? dd.o : 1); ctx.strokeStyle = dd.c === 'accent' ? '#D9822A' : C.ember; ctx.lineWidth = (dd.w || 1) * 1.7 * F.sw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.stroke(path2d(dd.d)); ctx.restore();
      } else {
        const pts = sampled(dd.d, 2.4); ctx.save(); ctx.globalAlpha = o * 0.95 * (dd.o != null ? dd.o : 1);
        pts.forEach(([x, y], k) => { const r = (dd.w || 1) * 1.35 * F.sw * (dd.c === 'accent' ? 1.2 : 1); ctx.drawImage(cellSprite(dd.c === 'accent' ? 3 : 4 - (k % 3 === 0 ? 4 : 0)), x + so(x) - r, y - r, r * 2, r * 2); });
        ctx.restore();
      }
    }));
  }
  const P2D = new Map();
  const path2d = (d) => { let p = P2D.get(d); if (!p) { p = new Path2D(d); P2D.set(d, p); } return p; };
  function drawFaceCanvas(ctx, F, dir) {
    const G = faceGeo(F), sw = F.sw;
    ctx.save(); ctx.lineCap = 'round';
    G.eyes.forEach((e) => {
      if (dir === 'B') { const r = 6.6 * G.fs * (F.size < 72 ? 1.2 : 1) * (F.state === 'surprised' ? 1.12 : 1); ctx.drawImage(eyeCellSprite(), e.x - r, e.y - r, r * 2, r * 2); }
      ctx.strokeStyle = C.humus; ctx.lineWidth = e.sw * sw * (dir === 'B' ? 0.95 : 1);
      ctx.beginPath(); ctx.moveTo(e.x - e.w, e.y); ctx.bezierCurveTo(e.x - e.w / 3, e.y - e.c * 1.33, e.x + e.w / 3, e.y - e.c * 1.33, e.x + e.w, e.y); ctx.stroke();
    });
    G.brows.forEach((b) => { if (b.o < 0.02) return; ctx.save(); ctx.globalAlpha = b.o; ctx.translate(b.x, b.y); ctx.rotate(b.r * Math.PI / 180); ctx.strokeStyle = C.humus; ctx.lineWidth = 1.8 * sw; ctx.beginPath(); ctx.moveTo(-b.w, 0); ctx.lineTo(b.w, 0); ctx.stroke(); ctx.restore(); });
    if (dir === 'D') {
      const m = G.mouth; ctx.globalAlpha = m.o; ctx.strokeStyle = C.humus; ctx.lineWidth = m.sw * sw;
      ctx.beginPath(); ctx.moveTo(m.x - m.w, m.y); ctx.bezierCurveTo(m.x - m.w / 3, m.y + m.c1 * 1.33, m.x + m.w / 3, m.y + m.c2 * 1.33, m.x + m.w, m.y); ctx.stroke();
    }
    ctx.restore();
  }
  function drawPropsCanvas(ctx, F, dir) {
    F.props.forEach((p) => p.st.forEach((s, i) => {
      if (s.o < 0.01 || s.s < 0.01) return;
      const part = p.parts[i];
      ctx.save(); ctx.globalAlpha = clamp(s.o);
      if (part.arcRing) { ctx.translate(50, 53); ctx.rotate(s.r * Math.PI / 180); ctx.translate(-50, -53); } else { ctx.translate(s.x, s.y); ctx.rotate(s.r * Math.PI / 180); ctx.scale(s.s, s.s); }
      const pts = sampled(part.d, part.k === 'line' ? 2.6 : 2.2);
      const n = part.k === 'line' || part.arcRing ? Math.max(1, Math.round(pts.length * s.draw)) : pts.length;
      if (dir === 'D') {
        if (part.k === 'dot' || part.k === 'spark') { const r = 2.6; ctx.drawImage(cellSprite(part.k === 'spark' ? 3 : 4), -r + bcx(pts), -r + bcy(pts), r * 2, r * 2); }
        else {
          if (part.k === 'shape') { ctx.fillStyle = part.glass ? 'rgba(255,246,238,0.55)' : '#FFF3E8'; ctx.fill(path2d(part.d)); }
          ctx.strokeStyle = C.ember; ctx.lineWidth = (part.w || 1) * 1.9 * F.sw / Math.max(0.3, s.s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          if (s.draw < 0.999) { ctx.beginPath(); for (let k = 0; k < n; k++) { if (k) ctx.lineTo(pts[k][0], pts[k][1]); else ctx.moveTo(pts[k][0], pts[k][1]); } ctx.stroke(); }
          else ctx.stroke(path2d(part.d));
          const a = pts[0], b = pts[n - 1], r = 1.8;
          if (part.k !== 'shape') { ctx.drawImage(cellSprite(1), a[0] - r, a[1] - r, r * 2, r * 2); ctx.drawImage(cellSprite(3), b[0] - r, b[1] - r, r * 2, r * 2); }
        }
      } else {
        // B: props made of cells
        if (part.k === 'dot' || part.k === 'spark') { const r = part.k === 'spark' && part.d === SPARK ? 5 : 2.8; ctx.drawImage(cellSprite(part.k === 'spark' ? 3 : 4), -r + bcx(pts), -r + bcy(pts), r * 2, r * 2); }
        else {
          if (part.k === 'shape') { ctx.fillStyle = part.glass ? 'rgba(255,240,228,0.5)' : 'rgba(255,236,220,0.7)'; ctx.fill(path2d(part.d)); }
          const r = (part.w || 1) * 1.7 * F.sw * (part.k === 'shape' ? 0.85 : 1);
          for (let k = 0; k < n; k++) ctx.drawImage(cellSprite((k + i) % CELL.length), pts[k][0] - r, pts[k][1] - r, r * 2, r * 2);
        }
      }
      ctx.restore();
    }));
  }
  const bcx = (pts) => { let a = 0; pts.forEach((p) => { a += p[0]; }); return a / pts.length; };
  const bcy = (pts) => { let a = 0; pts.forEach((p) => { a += p[1]; }); return a / pts.length; };

  // ───────── F · Particle: a colony of warm backlit cells (the Living brain's look, one canvas per instance) ─────────
  // No drawn face. Feeling comes from four things only: how dense the colony is (it gathers, swells, thins, slumps),
  // how the cells move (calm drift, bursts, swirls, waves of light), how they cluster (into props, along details),
  // and two eye gaps, each with a small dark cluster in it that looks, blinks and squints.
  // Topics: the cells re-flow into the topic's silhouette (a rim of cells rides the outline; the rest fill it) and
  // take on the topic's colours; its details (whiskers, rays, rings) become lines of cells.
  const FPAL = { // [light, deep]
    brain: [[246, 170, 110], [184, 58, 28]], heart: [[248, 156, 150], [178, 40, 62]], planet: [[240, 190, 104], [120, 58, 70]],
    sun: [[255, 208, 100], [222, 98, 24]], cat: [[255, 186, 110], [196, 68, 14]], crocodile: [[178, 198, 96], [58, 102, 34]],
    octopus: [[248, 146, 140], [152, 46, 88]], leaf: [[232, 192, 76], [198, 72, 22]], camera: [[184, 140, 112], [78, 46, 32]],
    atom: [[246, 172, 106], [152, 52, 86]], book: [[234, 180, 120], [134, 66, 34]], music: [[246, 146, 116], [152, 44, 66]],
  };
  const FSPR = new Map();
  function fCell(r, g, b) {
    const q = (v) => Math.max(0, Math.min(255, ((v | 0) >> 4) * 16 + 8));
    r = q(r); g = q(g); b = q(b);
    const key = (r << 16) | (g << 8) | b;
    let s = FSPR.get(key); if (s) return s;
    if (FSPR.size > 3000) FSPR.clear();
    s = document.createElement('canvas'); s.width = s.height = 32;
    const x = s.getContext('2d'), m = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    m.addColorStop(0, `rgba(${r},${g},${b},0.34)`); m.addColorStop(0.6, `rgba(${r},${g},${b},0.5)`); m.addColorStop(0.84, `rgba(${r},${g},${b},0.96)`); m.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = m; x.fillRect(0, 0, 32, 32);
    x.fillStyle = `rgba(${r * 0.55 | 0},${g * 0.4 | 0},${b * 0.4 | 0},0.66)`; x.beginPath(); x.arc(14.7, 14.7, 4.4, 0, TAU); x.fill();
    FSPR.set(key, s); return s;
  }
  const fEye = () => spr('feye', (x, S) => {
    const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    m.addColorStop(0, 'rgba(43,26,18,1)'); m.addColorStop(0.62, 'rgba(43,26,18,0.97)'); m.addColorStop(0.84, 'rgba(70,36,22,0.55)'); m.addColorStop(1, 'rgba(70,36,22,0)');
    x.fillStyle = m; x.fillRect(0, 0, S, S);
  });
  const fShine = () => spr('fshine', (x, S) => {
    const m = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    m.addColorStop(0, 'rgba(255,250,242,1)'); m.addColorStop(0.5, 'rgba(255,250,242,0.85)'); m.addColorStop(1, 'rgba(255,250,242,0)');
    x.fillStyle = m; x.fillRect(0, 0, S, S);
  });
  // Blue-noise points inside a shape (best of 6 candidates), cached per shape and count
  const FSAMP = new Map();
  function fSample(sh, n) {
    const key = sh.name + '|' + n; if (FSAMP.has(key)) return FSAMP.get(key);
    const [x0, y0, x1, y1] = sh.bb, out = [];
    let seed = 1;
    const cand = () => { for (let k = 0; k < 60; k++) { const x = lerp(x0, x1, hash(seed++ * 1.37 + 0.1)), y = lerp(y0, y1, hash(seed++ * 2.11 + 0.7)); if (inside(sh.pts, M, x, y) && edgeDist(sh.pts, M, x, y) > 1.3) return [x, y]; } return null; };
    for (let i = 0; i < n; i++) {
      let best = null, bd = -1;
      for (let k = 0; k < 6; k++) {
        const c = cand(); if (!c) continue;
        let d = 1e9; for (let j = 0; j < out.length; j++) { const dx = out[j][0] - c[0], dy = out[j][1] - c[1], dd = dx * dx + dy * dy; if (dd < d) d = dd; }
        if (d > bd) { bd = d; best = c; }
      }
      out.push(best || [sh.cx + (hash(i) - 0.5) * 6, sh.cy + (hash(i + 0.5) - 0.5) * 6]);
    }
    FSAMP.set(key, out); return out;
  }
  // How each state moves the colony. exp: swell (+) or gather (−) · sag: slump · swirl · jit: drift · pulse: waves of light
  // tw: twinkle · lean: lean toward the look · flow: the rim runs round · drip: cells fall away · dim
  const FST = {
    idle: { jit: 0.5, tw: 0.15 }, hello: { jit: 0.8, tw: 0.6 }, listening: { jit: 0.55 }, thinking: { jit: 0.6, pulse: 1 },
    searching: { jit: 0.8, pulse: 0.45 }, reading: { jit: 0.35, pulse: 0.3 }, analysing: { jit: 0.9, pulse: 0.8 }, building: { jit: 0.7, tw: 0.3 },
    loading: { jit: 0.45, flow: 1 }, ready: { jit: 0.4, tw: 0.5 }, happy: { jit: 1, tw: 1, exp: 0.035 }, proud: { jit: 0.8, tw: 1, exp: 0.05 },
    curious: { jit: 0.5, lean: 1 }, surprised: { jit: 1.3, exp: 0.05 }, confused: { jit: 0.6, swirl: 1 }, error: { jit: 0.15, sag: 0.55, dim: 1, drip: 1 },
    sleepy: { jit: 0.1, sag: 1, dim: 0.55 }, aside: { jit: 0.25, dim: 0.3 },
  };
  const FKEYS = ['exp', 'sag', 'swirl', 'jit', 'pulse', 'tw', 'lean', 'flow', 'drip', 'dim'];
  const mixC = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const SAFFRON = [239, 180, 62], DUSK = [170, 142, 126];

  function particleRenderer(I) {
    const cv = document.createElement('canvas'); cv.className = 'ms-cv'; cv.setAttribute('aria-hidden', 'true');
    const PAD = 0.3, size = I.size, small = size < 72, dpr = Math.min(2, window.devicePixelRatio || 1) * (small ? 1.5 : 1);
    cv.width = cv.height = Math.round(size * (1 + PAD * 2) * dpr);
    const ctx = cv.getContext('2d');
    const NI = Math.round(clamp(size * 1.75, 70, 400)), NR = Math.round(clamp(size * 0.62, 34, 140));
    const P = Array.from({ length: NI }, (_, i) => ({ x: 50, y: 53, fx: 50, fy: 53, tx: 50, ty: 53, t0: 0, d: 1, arc: 0, z: 0.5, h: hash(i + 0.31), ph: hash(i + 0.77) * TAU, ci: Math.floor(hash(i + 0.21) * CELL.length) }));
    const RIM = Array.from({ length: NR }, (_, k) => ({ u: (k + 0.4 * hash(k + 1.9)) / NR, o: 0.4 + 1.5 * hash(k + 4.2), h: hash(k + 8.8), ph: hash(k + 2.6) * TAU, ci: Math.floor(hash(k + 5.5) * CELL.length) }));
    let rBase = 2, maxR = 40, cx = 50, cy = 53;
    let palA = FPAL[I.shape.name] || FPAL.brain, palB = palA, palT0 = 0, palDur = 1;
    const S = {}; FKEYS.forEach((k) => { S[k] = 0; });
    let last = 0;
    const smoothP = new Float32Array(M * 4);
    function retarget(sh, ms, instant) {
      const T = fSample(sh, NI).map((p) => p.slice());
      cx = sh.cx; cy = sh.cy;
      maxR = 1; T.forEach(([x, y]) => { maxR = Math.max(maxR, Math.hypot(x - cx, y - cy)); });
      rBase = (small ? 0.5 : 0.54) * Math.sqrt(sh.area / NI);
      T.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy));
      const used = new Uint8Array(NI), t0 = now();
      T.forEach(([x, y], k) => {
        let bi = 0, bd = 1e12;
        for (let j = 0; j < NI; j++) if (!used[j]) { const dx = P[j].x - x, dy = P[j].y - y, dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; bi = j; } }
        used[bi] = 1;
        const p = P[bi], dn = Math.hypot(x - cx, y - cy) / maxR;
        p.fx = p.x; p.fy = p.y; p.tx = x; p.ty = y; p.z = clamp(1 - dn * dn * 0.8 + (p.h - 0.5) * 0.3);
        if (instant) { p.x = x; p.y = y; p.t0 = 0; p.d = 1; p.arc = 0; }
        else { p.t0 = t0 + dn * ms * 0.32 + hash(k + 3.3) * 90; p.d = ms * (0.48 + 0.22 * hash(k)); p.arc = (hash(k + 9) - 0.5) * 16; }
      });
      palA = curPal(); palB = FPAL[sh.name] || FPAL.brain; palT0 = t0; palDur = instant ? 1 : ms;
    }
    function curPal() { const u = glide(clamp((now() - palT0) / palDur)); return [mixC(palA[0], palB[0], u), mixC(palA[1], palB[1], u)]; }
    retarget(I.shape, 1, true);
    const R = {
      el: cv,
      onShape(sh, ms) { retarget(sh, ms || 1, !ms); },
      draw(F) {
        const W = cv.width, uu = (size / 100) * dpr, off = PAD * size * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, W);
        ctx.setTransform(uu, 0, 0, uu, off, off);
        const R0 = F.root, B = F.base, t = F.t, still = F.still, age = F.age, st = F.state, en = F.energy;
        const dt = last ? clamp(t - last, 0, 0.1) : 0.016; last = t;
        const tg = FST[st] || FST.idle, ks = still ? 1 : 1 - Math.exp(-dt * 5);
        FKEYS.forEach((k) => { S[k] += ((tg[k] || 0) - S[k]) * ks; });
        // one-shot swells: hello bursts out and gathers, surprise jumps wide, ready gathers in for a beat
        let shot = 0;
        if (!still) {
          if (st === 'hello') shot = 0.13 * Math.sin(Math.PI * clamp((age - 0.08) / 0.6));
          else if (st === 'surprised') { const u = clamp(age / 0.42); shot = 0.2 * Math.sin(Math.PI * u) * (u < 1 ? 1 : 0); }
          else if (st === 'ready') shot = -0.07 * Math.sin(Math.PI * clamp(age / 0.5));
          else if (st === 'proud') shot = 0.04 * Math.sin(Math.PI * clamp(age / 0.7));
        }
        if (F.morphU < 1) shot += 0.05 * Math.sin(F.morphU * Math.PI); // the colony loosens as it re-flows
        const pal = curPal(), dimK = S.dim;
        // backlight
        const g = F.glow * (still ? 1 : 1 + 0.08 * Math.sin(t * (1.2 + en * 3)));
        ctx.save(); ctx.translate(R0.tx, R0.ty);
        const gr = 60 * Math.min(1.45, 0.72 + 0.4 * g) * R0.sc;
        ctx.globalAlpha = clamp(0.18 + 0.42 * g) * (1 - dimK * 0.5); ctx.drawImage(glowSprite(), 50 - gr, 54 - gr, gr * 2, gr * 2);
        ctx.restore();
        // ground shadow
        ctx.save(); const lift = clamp(-R0.ty / 14); ctx.globalAlpha = 0.1 * (1 - lift * 0.5); ctx.fillStyle = C.bark;
        ctx.beginPath(); ctx.ellipse(50 + R0.tx, 92, 23 * R0.sc * (1 - lift * 0.35), 3, 0, 0, TAU); ctx.fill(); ctx.restore();
        // body space
        ctx.save();
        ctx.translate(R0.tx, R0.ty); ctx.translate(50, B); ctx.rotate(R0.rot * Math.PI / 180); ctx.scale(R0.sx * R0.sc, R0.sy * R0.sc); ctx.translate(-50, -B);
        upsample(F.pts, M, smoothP);
        const sp = F.split * 8, so = (x) => (sp ? (x < 50 ? -sp : sp) : 0);
        const bb = F.shape.bb, bot = bb[3], hgt = Math.max(10, bb[3] - bb[1]);
        const G = faceGeo(F);
        // eye gaps: cells are pushed off each eye's stroke, which opens a hole the dark cluster sits in
        const gaps = G.eyes.map((e) => {
          const pts = [];
          const n = e.w > 0.6 ? 6 : 1;
          for (let i = 0; i < n; i++) { const s = n === 1 ? 0.5 : i / (n - 1), a = 1 - s; const x = a * a * a * (e.x - e.w) + 3 * a * a * s * (e.x - e.w / 3) + 3 * a * s * s * (e.x + e.w / 3) + s * s * s * (e.x + e.w), y = a * a * a * e.y + 3 * a * a * s * (e.y - e.c * 1.33) + 3 * a * s * s * (e.y - e.c * 1.33) + s * s * s * e.y; pts.push([x, y]); }
          return { pts, R: (e.sw * 0.5 + (e.w > 0.6 ? 2 : 2.6)) * (small ? 1.35 : 1) * F.sw, e };
        });
        const gap = (o) => {
          for (const gp of gaps) {
            let bx = 0, by = 0, bd = 1e9;
            for (const q of gp.pts) { const dx = o[0] - q[0], dy = o[1] - q[1], d = dx * dx + dy * dy; if (d < bd) { bd = d; bx = q[0]; by = q[1]; } }
            const d = Math.sqrt(bd);
            if (d < gp.R) { const k = (gp.R - d) * 0.95; if (d < 0.01) { o[1] -= k; } else { o[0] += (o[0] - bx) / d * k; o[1] += (o[1] - by) / d * k; } }
          }
        };
        const o = [0, 0], jit0 = (small ? 1.5 : 0.9) * S.jit, fq = 1 + en * 2.2;
        const field = (x, y, ph, h, rim) => {
          const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy) || 0.001;
          const ex = S.exp + shot;
          x += dx * ex; y += dy * ex;
          if (S.sag > 0.01) { const up = clamp((bot - y) / hgt); y += S.sag * (bot - y) * 0.17; x += S.sag * dx * 0.07 * (1 - up); }
          if (S.swirl > 0.01 && !still) { const a = S.swirl * 0.32 * Math.sin(t * 1.25 + r * 0.09) * (1 - Math.min(1, r / (maxR * 1.2))), ca = Math.cos(a), sa = Math.sin(a); const xx = cx + (x - cx) * ca - (y - cy) * sa; y = cy + (x - cx) * sa + (y - cy) * ca; x = xx; }
          if (S.lean > 0.01) x += S.lean * F.lk[0] * 3.4 * clamp((bot - y) / hgt);
          if (!still) { x += Math.sin(t * fq * 1.1 + ph) * jit0; y += Math.cos(t * fq * 0.9 + ph * 1.7) * jit0; }
          if (F.lv > 0.01) { const w = F.lv * 2.6 * Math.sin(r * 0.3 - t * 9); x += dx / r * w; y += dy / r * w; }
          if (S.drip > 0.01 && !rim && h < 0.06 && !still) { const u = (t * 0.32 + h * 17) % 1; y += u * u * 26 * S.drip; o.fade = 1 - u; } else o.fade = 1;
          x += so(x); o[0] = x; o[1] = y; gap(o);
        };
        const lightOf = (x, y, ph, h) => {
          let L = 0;
          if (S.pulse > 0.01 && !still) L = Math.pow(Math.max(0, Math.sin(x * 0.12 + y * 0.07 - t * 3.6)), 10) * S.pulse;
          if (S.tw > 0.01 && !still) L = Math.max(L, Math.pow(Math.max(0, Math.sin(t * 2.3 + ph * 7)), 26) * S.tw);
          if (F.lit > 0.005 && h < F.lit) L = Math.max(L, 0.75 + (still ? 0 : 0.25 * Math.sin(t * 2.4 + ph)));
          return L;
        };
        const dimC = (c) => (dimK > 0.01 ? mixC(c, DUSK, 0.5 * dimK) : c);
        const cellAt = (x, y, rad, c, a) => { ctx.globalAlpha = clamp(a); const rr = rad * 1.25; ctx.drawImage(fCell(c[0], c[1], c[2]), x - rr, y - rr, rr * 2, rr * 2); };
        const glowAt = (x, y, rad, a) => { ctx.globalAlpha = clamp(a); const gr2 = rad * 3.6; ctx.drawImage(glowSprite(), x - gr2, y - gr2, gr2 * 2, gr2 * 2); };
        const detLayer = (layer) => F.dets.forEach(({ sh, o: dop }) => sh.det.forEach((dd) => {
          if (dop < 0.02 || (dd.layer === 'back') !== (layer === 'back')) return;
          const pts = sampled(dd.d, small ? 3.4 : 2.1), n = Math.max(1, Math.round(pts.length * (still ? 1 : sstep(0, 1, dop))));
          const base = dd.c === 'accent' ? mixC(pal[0], SAFFRON, 0.35) : pal[1];
          const rad = Math.max(rBase * 0.62, 1.15) * (dd.w || 1) * (small ? 1.35 : 1);
          for (let k = 0; k < n; k++) {
            const [px, py] = pts[k], ph = hash(k * 1.3 + px) * TAU;
            const jx = still ? 0 : Math.sin(t * 1.4 + ph) * 0.35 * S.jit, jy = still ? 0 : Math.cos(t * 1.2 + ph) * 0.35 * S.jit;
            const L = lightOf(px, py, ph, 1);
            const c = dimC(L > 0.05 ? mixC(base, SAFFRON, L * 0.8) : base);
            cellAt(px + so(px) + jx, py + jy, rad * (1 + L * 0.3), c, (0.82 + 0.18 * hash(k)) * (dd.o != null ? dd.o : 1) * Math.min(1, dop * 1.4) * (1 - dimK * 0.35));
          }
        }));
        detLayer('back');
        // interior cells
        const tn = now();
        for (let i = 0; i < NI; i++) {
          const p = P[i];
          const u = still ? 1 : clamp((tn - p.t0) / p.d), e = glide(u);
          if (u < 1) { const ddx = p.tx - p.fx, ddy = p.ty - p.fy, dl = Math.hypot(ddx, ddy) || 1, a = Math.sin(u * Math.PI) * p.arc; p.x = lerp(p.fx, p.tx, e) - ddy / dl * a; p.y = lerp(p.fy, p.ty, e) + ddx / dl * a; }
          else { p.x = p.tx; p.y = p.ty; }
          field(p.x, p.y, p.ph, p.h, false);
          const L = lightOf(o[0], o[1], p.ph, p.h);
          let c = mixC(pal[1], pal[0], 0.2 + 0.7 * p.z); c = mixC(c, CELL[p.ci], 0.22);
          if (L > 0.05) { c = mixC(c, F.lit > 0.005 && p.h < F.lit ? SAFFRON : [255, 196, 120], L * 0.75); glowAt(o[0], o[1], rBase, 0.2 * L); }
          const rad = rBase * (0.72 + 0.46 * p.z) * (still ? 1 : 1 + 0.12 * Math.sin(t * 1.4 + p.ph)) * (1 + L * 0.35);
          cellAt(o[0], o[1], rad, dimC(c), (0.5 + 0.5 * p.z) * (1 - dimK * 0.38) * o.fade);
        }
        // rim: cells riding the outline keep the silhouette crisp
        const m2 = M * 2, flow = still ? 0 : S.flow * t * 0.09, lp = S.flow > 0.02 ? ((t * 0.55) % 1 + 1) % 1 : -9;
        for (let k = 0; k < NR; k++) {
          const q = RIM[k], s = (((q.u + flow) % 1) + 1) % 1, fi = s * m2, i = Math.floor(fi) % m2, j = (i + 1) % m2, f = fi - Math.floor(fi);
          const x = lerp(smoothP[2 * i], smoothP[2 * j], f), y = lerp(smoothP[2 * i + 1], smoothP[2 * j + 1], f);
          const tx = smoothP[2 * j] - smoothP[2 * i], ty = smoothP[2 * j + 1] - smoothP[2 * i + 1], tl = Math.hypot(tx, ty) || 1;
          field(x - ty / tl * q.o, y + tx / tl * q.o, q.ph, q.h, true);
          let L = lightOf(o[0], o[1], q.ph, 1);
          if (lp > -1) { const dd = ((s - lp) % 1 + 1) % 1; L = Math.max(L, S.flow * Math.pow(1 - Math.min(1, dd / 0.3), 2)); } // loading: a bright arc runs round
          let c = mixC(pal[1], CELL[q.ci], 0.14);
          if (L > 0.05) { c = mixC(c, [255, 190, 110], L * 0.7); glowAt(o[0], o[1], rBase, 0.18 * L); }
          cellAt(o[0], o[1], Math.max(rBase * 0.8, 1.2) * (small ? 0.82 : 1) * (0.85 + 0.3 * q.h) * (1 + L * 0.3), dimC(c), (small ? 0.8 : 0.9) * (1 - dimK * 0.3));
        }
        // analysing: sparks run across the gap between the two halves
        if (F.split > 0.05 && !still) for (let k = 0; k < 7; k++) {
          const u = (t * 0.9 + k / 7) % 1, dir = k % 2 ? 1 : -1, y = 34 + k * 6.5 + Math.sin(t * 2 + k) * 2;
          const x = 50 + dir * (u - 0.5) * 2 * (sp + 3);
          glowAt(x, y, 1.6, 0.4 * F.split); cellAt(x, y, 1.5, SAFFRON, F.split * Math.sin(u * Math.PI));
        }
        detLayer('front');
        // the eyes: a dark cluster in each gap (a round clump, or a line of cells when they curve or close)
        gaps.forEach(({ e }) => {
          const dk = 1 - dimK * 0.25;
          if (e.w <= 0.6) {
            const r = e.sw * 0.5 * F.sw * 1.12;
            ctx.globalAlpha = dk; ctx.drawImage(fEye(), e.x - r * 1.25, e.y - r * 1.25, r * 2.5, r * 2.5);
            const sr = r * 0.42; ctx.globalAlpha = 0.9 * dk; ctx.drawImage(fShine(), e.x - r * 0.42 - sr, e.y - r * 0.45 - sr, sr * 2, sr * 2);
          } else {
            const n = Math.max(3, Math.round(e.w * 1.1)), r = e.sw * 0.62 * F.sw;
            for (let i = 0; i < n; i++) {
              const s = i / (n - 1), a = 1 - s;
              const x = a * a * a * (e.x - e.w) + 3 * a * a * s * (e.x - e.w / 3) + 3 * a * s * s * (e.x + e.w / 3) + s * s * s * (e.x + e.w);
              const y = a * a * a * e.y + 3 * a * a * s * (e.y - e.c * 1.33) + 3 * a * s * s * (e.y - e.c * 1.33) + s * s * s * e.y;
              ctx.globalAlpha = dk; ctx.drawImage(fEye(), x - r * 1.25, y - r * 1.25, r * 2.5, r * 2.5);
            }
          }
        });
        ctx.globalAlpha = 1;
        ctx.restore();
        // props, made of cells
        ctx.save(); ctx.translate(R0.tx, R0.ty); ctx.translate(50, B); ctx.scale(R0.sc, R0.sc); ctx.translate(-50, -B);
        drawPropsF(ctx, F, pal, small);
        ctx.restore(); ctx.globalAlpha = 1;
      },
      destroy() {},
    };
    return R;
  }
  function drawPropsF(ctx, F, pal, small) {
    const t = F.t, still = F.still;
    F.props.forEach((p) => p.st.forEach((s, i) => {
      if (s.o < 0.01 || s.s < 0.01) return;
      const part = p.parts[i];
      ctx.save(); ctx.globalAlpha = clamp(s.o);
      if (part.arcRing) { ctx.translate(50, 53); ctx.rotate(s.r * Math.PI / 180); ctx.translate(-50, -53); } else { ctx.translate(s.x, s.y); ctx.rotate(s.r * Math.PI / 180); ctx.scale(s.s, s.s); }
      const pts = sampled(part.d, small ? 3 : 1.9);
      const n = part.k === 'line' || part.arcRing ? Math.max(1, Math.round(pts.length * s.draw)) : pts.length;
      const base = part.k === 'spark' ? SAFFRON : pal[1];
      if (part.k === 'dot' || part.k === 'spark') {
        const big = part.d === SPARK, mx = bcx(pts), my = bcy(pts), cnt = big ? 5 : 3;
        for (let k = 0; k < cnt; k++) {
          const a = k / cnt * TAU + (still ? 0 : t * 1.5), rr = k === 0 ? 0 : (big ? 2.2 : 1.1);
          const x = mx + (k ? Math.cos(a) * rr : 0), y = my + (k ? Math.sin(a) * rr : 0), r = (big ? 2.3 : 1.7) * (small ? 1.4 : 1);
          ctx.globalAlpha = clamp(s.o) * (k ? 0.85 : 1); ctx.drawImage(fCell(base[0], base[1], base[2]), x - r * 1.25, y - r * 1.25, r * 2.5, r * 2.5);
        }
      } else {
        if (part.k === 'shape') { ctx.globalAlpha = clamp(s.o) * 0.55; ctx.fillStyle = part.glass ? 'rgba(255,244,234,0.5)' : 'rgba(255,238,222,0.9)'; ctx.fill(path2d(part.d)); }
        const r = (part.w || 1) * 1.25 * F.sw * (small ? 1.25 : 1);
        for (let k = 0; k < n; k++) {
          const ph = hash(k + i * 7.1) * TAU, jx = still ? 0 : Math.sin(t * 2 + ph) * 0.25, jy = still ? 0 : Math.cos(t * 1.7 + ph) * 0.25;
          const c = mixC(base, CELL[(k + i) % CELL.length], 0.25);
          ctx.globalAlpha = clamp(s.o) * (0.8 + 0.2 * hash(k)); ctx.drawImage(fCell(c[0], c[1], c[2]), pts[k][0] + jx - r * 1.25, pts[k][1] + jy - r * 1.25, r * 2.5, r * 2.5);
        }
      }
      ctx.restore();
    }));
  }

  function makeRenderer(dir, I) {
    if (dir === 'F') return particleRenderer(I);
    return dir === 'B' || dir === 'D' ? canvasRenderer(dir, I) : svgRenderer(dir, I);
  }

  // ───────── Static topic icon (for pills, lists) ─────────
  function icon(topic, size = 20) {
    const sh = getShape(normTopic(topic) || 'brain');
    const [fx, fy, fs] = sh.face;
    return `<svg class="ms-icon" width="${size}" height="${size}" viewBox="-6 -6 112 112" aria-hidden="true" focusable="false"><path d="${closedPath(sh.pts, M, 2)}" fill="#FFF1E4" stroke="#B83A1C" stroke-width="7" stroke-linejoin="round"/><g fill="#2B1A12"><circle cx="${r2(fx - 11 * fs)}" cy="${r2(fy)}" r="${r2(4.6 * fs)}"/><circle cx="${r2(fx + 11 * fs)}" cy="${r2(fy)}" r="${r2(4.6 * fs)}"/></g></svg>`;
  }

  // ───────── Global: follow the Store's direction ─────────
  if (window.Bus) Bus.on('variant:change', ({ key, value }) => { if (key !== 'mascot') return; LIVE.forEach((I) => { if (!I.pinned && DIRS[value]) { I.setDirection(value); I.pinned = false; } }); });
  function visibleInstances() { return [...LIVE].filter((I) => I.el.isConnected && I.el.offsetParent !== null); }
  function setAll(o = {}) {
    visibleInstances().forEach((I) => { if ('topic' in o) I.setTopic(o.topic); if (o.state) I.setState(o.state, { restart: true }); });
  }

  // ───────── Side panel "mascot lab" (fills #mascotPanel when the page has one) ─────────
  const initial = { state: ST[Q.get('mstate')] ? Q.get('mstate') : null, topic: Q.get('mtopic') ? normTopic(Q.get('mtopic')) : null };
  function initPanel() {
    const host = document.getElementById('mascotPanel'); if (!host || host.dataset.msReady) return;
    host.dataset.msReady = '1';
    let cs = initial.state || 'idle', ct = initial.topic || 'brain';
    const chips = (list, key, cur) => list.map((s) => `<button type="button" class="ms-chip" data-ms-${key}="${s}" aria-pressed="${s === cur}">${LABELS[s]}</button>`).join('');
    host.innerHTML = `<div class="ms-panel">
      <div class="ms-pv"><div class="ms-pv-m"></div><p>Drives every mascot on screen. Pick the direction above.</p></div>
      <h3>Mascot state</h3><div class="ms-chips" role="group" aria-label="Mascot state">${chips(STATES, 'state', cs)}</div>
      <h3>Mascot topic</h3><div class="ms-chips" role="group" aria-label="Mascot topic">${chips(TOPICS, 'topic', ct)}</div>
    </div>`;
    const pv = create(host.querySelector('.ms-pv-m'), { size: 64, state: cs, topic: ct, label: 'Mascot preview' });
    host.addEventListener('click', (e) => {
      const b = e.target.closest('.ms-chip'); if (!b) return;
      if (b.dataset.msState) { cs = b.dataset.msState; setAll({ state: cs }); pv.setState(cs, { restart: true }); }
      if (b.dataset.msTopic) { ct = b.dataset.msTopic; setAll({ topic: ct }); pv.setTopic(ct); }
      host.querySelectorAll('[data-ms-state]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.msState === cs));
      host.querySelectorAll('[data-ms-topic]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.msTopic === ct));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPanel); else setTimeout(initPanel, 0);

  function create(el, o = {}) {
    if (!el) throw new Error('Mascot.create needs an element');
    if (el._ms) el._ms.destroy();
    return new Inst(el, o).api;
  }
  window.Mascot = { create, icon, setAll, all: () => [...LIVE].map((I) => I.api), STATES, TOPICS, DIRECTIONS: DIRS, LABELS, initial, topic: normTopic };
})();
