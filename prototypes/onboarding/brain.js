// Cortex brain orb: light-mode particle brain that can listen, think, and morph into a topic.
(function () {
  const N = 6000;
  const rnd = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

  // Fibonacci seeds on a sphere
  const seeds = [];
  for (let i = 0; i < N; i++) {
    const y = Math.max(-1, Math.min(1, 1 - 2 * (i + 0.5) / N + (rnd(i + 0.37) - 0.5) * 0.03));
    const a = i * 2.399963 + (rnd(i) - 0.5) * 0.6, r = Math.sqrt(1 - y * y);
    seeds.push([Math.cos(a) * r, y, Math.sin(a) * r]);
  }

  function brainPoint(p, i) {
    let [x, y, z] = p; const side = x < 0 ? -1 : 1;
    const temporal = Math.max(0, -y - 0.15) * Math.max(0, z + 0.2) * 0.6;
    const yy = y < -0.35 ? -0.35 + (y + 0.35) * 0.45 : y;
    let px = x * 0.62 * (1 + temporal) + side * 0.10, py = yy * 0.70, pz = z * (1 - 0.08 * y);
    const th = Math.atan2(y, z), ph = Math.atan2(x, Math.hypot(y, z));
    const fold = Math.sin(9 * th + 3.2 * Math.sin(5 * ph + 2 * th)) * Math.sin(7 * ph + 2.5 * Math.cos(4 * th));
    const d = 1 + 0.07 * fold; px *= d; py *= d; pz *= d;
    if (rnd(i + 3.1) < 0.11) {
      const a = rnd(i) * 6.283, b = Math.acos(2 * rnd(i + 1.7) - 1);
      return [0.42 * Math.sin(b) * Math.cos(a), -0.42 + 0.2 * Math.cos(b), -0.62 + 0.28 * Math.sin(b) * Math.sin(a), 0.6];
    }
    return [px, py, pz, fold];
  }
  function heartPoint(i) {
    const t = rnd(i + 9.1) * 6.283, k = Math.sqrt(rnd(i + 4.4));
    const hx = 16 * Math.pow(Math.sin(t), 3), hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [hx / 17 * k * 0.95, (hy / 17 * k + 0.1) * 0.95, (rnd(i + 2.2) * 2 - 1) * 0.3 * Math.sqrt(Math.max(0, 1 - k * k * 0.6)), 1];
  }
  function boxSurface(i, cx, cy, cz, w, h, d) {
    const f = Math.floor(rnd(i + 5.5) * 5), u = rnd(i + 6.6) - 0.5, v = rnd(i + 7.7) - 0.5;
    let x, y, z;
    if (f === 0) { x = cx + u * w; y = cy + h / 2; z = cz + v * d; }
    else if (f === 1) { x = cx + u * w; y = cy + (v + 0.5) * h - h / 2; z = cz + d / 2; }
    else if (f === 2) { x = cx + u * w; y = cy + (v + 0.5) * h - h / 2; z = cz - d / 2; }
    else if (f === 3) { x = cx + w / 2; y = cy + (u + 0.5) * h - h / 2; z = cz + v * d; }
    else { x = cx - w / 2; y = cy + (u + 0.5) * h - h / 2; z = cz + v * d; }
    return [x, y, z, 1];
  }
  function barsPoint(i) { // falling valuations
    const H = [1.3, 1.08, 0.86, 0.66, 0.48, 0.34], k = i % 6, base = -0.68;
    return boxSurface(i, -0.78 + k * 0.31, base + H[k] / 2, 0, 0.2, H[k], 0.2);
  }
  const CUBE_L = 16, CUBE_Z = Math.floor((N - 100) / 256), CUBE_N = CUBE_L * CUBE_L * CUBE_Z;
  function cubePoint(i) { // ordered lattice, a few escaped particles
    if (i >= CUBE_N) { const a = rnd(i) * 6.283, r = 0.85 + rnd(i + 1) * 0.35; return [Math.cos(a) * r, (rnd(i + 2) - 0.5) * 1.3, Math.sin(a) * r * 0.6, 1]; }
    const gx = i % 16, gy = Math.floor(i / 16) % 16, gz = Math.floor(i / 256);
    return [(gx - 7.5) * 0.062, (gy - 7.5) * 0.062, (gz - (CUBE_Z - 1) / 2) * 0.062, 1];
  }
  function tokensPoint(i) { // draft row above, verified row below
    const row = i % 2, k = Math.floor(i / 2) % 5;
    return boxSurface(i, -0.72 + k * 0.36, row ? -0.32 : 0.36, 0, 0.24, 0.24, 0.24);
  }
  function scatterPoint(i) {
    const b = Math.acos(2 * rnd(i + 8.8) - 1), a = rnd(i + 9.9) * 6.283, r = 1.5 + rnd(i + 1.1) * 0.9;
    return [r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a), 1];
  }
  const SHAPES = { brain: (i) => brainPoint(seeds[i], i), heart: heartPoint, bars: barsPoint, cube: cubePoint, tokens: tokensPoint, scatter: scatterPoint };

  function lobeColor(p) {
    const [x, y, z] = p;
    if (y < -0.3 && z < -0.4) return 0; // nature
    if (z > 0.35) return 1;             // mind
    if (y < -0.1 && z > -0.4) return 2; // body
    if (z < -0.35) return 3;            // arts
    return 4;                           // space
  }
  const LOBES = ['#22692F', '#4A30B0', '#A3264F', '#7E2777', '#2F3766'];
  const PALETTES = {
    cobalt: [[127, 163, 255], [26, 71, 184]],
    body: [[245, 155, 179], [163, 38, 79]],
    society: [[140, 168, 52], [61, 77, 12]],
    space: [[110, 122, 186], [36, 42, 84]],
    tech: [[90, 170, 220], [18, 80, 115]],
  };
  const VIEWS = { brain: [-0.55, 0.62], heart: [-0.35, 0.05], bars: [-0.45, 0.28], cube: [-0.6, 0.45], tokens: [-0.4, 0.3], scatter: [0, 0.3] };

  const brainSrc = seeds.map((s, i) => brainPoint(s, i));
  const lobe = brainSrc.map(lobeColor);
  const phase = brainSrc.map((p) => p[0] * 9 + p[1] * 5 - p[2] * 4);
  const delay = new Float32Array(N).map((_, i) => rnd(i + 0.77) * 0.35);

  const from = new Float32Array(N * 4), to = new Float32Array(N * 4), cur = new Float32Array(N * 4);
  const sx = new Float32Array(N), sy = new Float32Array(N), sz = new Float32Array(N), sf = new Float32Array(N);
  const order = new Uint16Array(N).map((_, i) => i);

  let canvas, g, W = 0, DPR = 1;
  let shape = 'brain', morphT = 1, morphStart = 0, morphDur = 1400;
  let palFrom = PALETTES.cobalt, palTo = PALETTES.cobalt;
  let viewFrom = VIEWS.brain, viewTo = VIEWS.brain;
  let mode = 'idle', lobesP = 0, lobesTarget = 0, energy = 0;
  let ripples = [];
  let fadeIn = 1, formStart = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fill(arr, name) { const fn = SHAPES[name]; for (let i = 0; i < N; i++) { const p = fn(i); arr[i * 4] = p[0]; arr[i * 4 + 1] = p[1]; arr[i * 4 + 2] = p[2]; arr[i * 4 + 3] = p[3]; } }
  fill(cur, 'brain'); fill(to, 'brain'); from.set(cur);

  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  function setShape(name, palette, dur) {
    palette = palette || (name === 'brain' ? 'cobalt' : 'cobalt');
    if (name === shape && PALETTES[palette] === palTo) return;
    from.set(cur);
    const pf = currentPalette(); palFrom = pf; palTo = PALETTES[palette] || PALETTES.cobalt;
    viewFrom = currentView(); viewTo = VIEWS[name] || VIEWS.brain;
    fill(to, name); shape = name; morphT = 0; morphStart = performance.now(); morphDur = dur || 1500;
  }
  function currentPalette() { const t = ease(Math.min(1, morphT)); return [mix(palFrom[0], palTo[0], t), mix(palFrom[1], palTo[1], t)]; }
  function currentView() { const t = ease(Math.min(1, morphT)); return [viewFrom[0] + (viewTo[0] - viewFrom[0]) * t, viewFrom[1] + (viewTo[1] - viewFrom[1]) * t]; }

  function form() { // gather from scattered dots
    fill(cur, 'scatter'); from.set(cur); fill(to, 'brain'); shape = 'brain';
    palFrom = palTo = PALETTES.cobalt; viewFrom = viewTo = VIEWS.brain;
    morphT = 0; morphStart = performance.now(); morphDur = 2200; fadeIn = 0; formStart = performance.now();
  }

  function resize() {
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.round(320 * DPR); canvas.width = W; canvas.height = W;
  }

  function touch(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    const x = (clientX - r.left) / r.width * W, y = (clientY - r.top) / r.height * W;
    ripples.push({ x, y, t: performance.now() }); energy = 1;
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!g) return;
    const t = now / 1000;
    if (morphT < 1) morphT = Math.min(1, (now - morphStart) / morphDur);
    if (fadeIn < 1) fadeIn = Math.min(1, (now - formStart) / 900);
    lobesP += (lobesTarget - lobesP) * 0.04;
    energy *= 0.96;

    const view = currentView();
    const wob = reduced ? 0 : Math.sin(t * 0.3) * 0.45;
    const ry = view[0] + wob, rx = view[1];
    const cry = Math.cos(ry), sry = Math.sin(ry), crx = Math.cos(rx), srx = Math.sin(rx);
    const breathe = reduced ? 1 : 1 + 0.014 * Math.sin(t * 1.7);
    const S = W * 0.37;
    const listenAmp = mode === 'listen' ? 0.05 + 0.04 * Math.abs(Math.sin(t * 2.3)) * Math.abs(Math.sin(t * 5.1)) : 0;

    for (let i = 0; i < N; i++) {
      const k = i * 4;
      let local = morphT >= 1 ? 1 : Math.max(0, Math.min(1, (morphT - delay[i]) / 0.65));
      local = ease(local);
      let x = from[k] + (to[k] - from[k]) * local, y = from[k + 1] + (to[k + 1] - from[k + 1]) * local, z = from[k + 2] + (to[k + 2] - from[k + 2]) * local;
      const f = from[k + 3] + (to[k + 3] - from[k + 3]) * local;
      cur[k] = x; cur[k + 1] = y; cur[k + 2] = z; cur[k + 3] = f;
      if (listenAmp) { const m = 1 + listenAmp * Math.sin(y * 14 + z * 3 - t * 7); x *= m; y *= m; z *= m; }
      x *= breathe; y *= breathe; z *= breathe;
      let X = x * cry + z * sry, Z = -x * sry + z * cry;
      const Y = y * crx - Z * srx; Z = y * srx + Z * crx;
      sx[i] = W / 2 + X * S; sy[i] = W / 2 - Y * S; sz[i] = Z; sf[i] = f;
    }
    // ripples (screen space)
    ripples = ripples.filter((r) => now - r.t < 1300);
    for (const r of ripples) {
      const age = (now - r.t) / 1000, R = age * 300 * DPR, life = 1 - age / 1.3;
      for (let i = 0; i < N; i++) {
        const dx = sx[i] - r.x, dy = sy[i] - r.y, d = Math.hypot(dx, dy) + 0.001;
        const w = 9 * DPR * life * Math.exp(-Math.pow((d - R) / (26 * DPR), 2));
        sx[i] += dx / d * w; sy[i] += dy / d * w;
      }
    }
    order.sort((a, b) => sz[a] - sz[b]);

    g.clearRect(0, 0, W, W);
    const pal = currentPalette();
    const brainness = shape === 'brain' ? ease(morphT) : 1 - ease(morphT);
    const lobeAmt = lobesP;
    const thinking = mode === 'think';
    for (let n = 0; n < N; n++) {
      const i = order[n];
      const depth = (sz[i] + 1) / 2;
      let r = (0.6 + 1.25 * depth) * DPR, a = (0.26 + 0.7 * depth) * fadeIn;
      // sulci gaps on the brain only
      const f = sf[i];
      if (shape === 'brain' && f < -0.35 && f > -0.99) a *= 1 - brainness;
      let c = mix(pal[0], pal[1], depth);
      if (shape === 'brain' && f > 0.2) c = mix(c, [11, 42, 102], 0.3 * brainness);
      if (lobeAmt > 0.01 && shape === 'brain' && rnd(i + 0.5) < lobeAmt) {
        g.fillStyle = LOBES[lobe[i]]; g.globalAlpha = a;
      } else {
        if (thinking || energy > 0.05) {
          const pulse = Math.pow(Math.max(0, Math.sin(phase[i] + t * 3.2)), 12) * (thinking ? 1 : energy);
          if (pulse > 0.25) {
            g.globalAlpha = 0.16 * pulse; g.fillStyle = '#1F5BE0';
            g.beginPath(); g.arc(sx[i], sy[i], r * 3.4, 0, 6.283); g.fill();
            c = [31, 91, 224]; r *= 1.5; a = Math.min(1, a + 0.4);
          }
        }
        g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; g.globalAlpha = a;
      }
      g.beginPath(); g.arc(sx[i], sy[i], r, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
  }

  window.Brain = {
    mount(el) {
      canvas = el; g = canvas.getContext('2d'); resize();
      canvas.addEventListener('pointerdown', (e) => touch(e.clientX, e.clientY));
      window.addEventListener('resize', resize);
      requestAnimationFrame(frame);
    },
    setShape, form, touch,
    setMode(m) { mode = m || 'idle'; },
    setLobes(p) { lobesTarget = p; },
    pulse() { energy = 1; },
    // Debug: draw without requestAnimationFrame (headless screenshots)
    snap() { morphT = 1; fadeIn = 1; lobesP = lobesTarget; frame(performance.now()); },
    get shape() { return shape; },
  };
})();
