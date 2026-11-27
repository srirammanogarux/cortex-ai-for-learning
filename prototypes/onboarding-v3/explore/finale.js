// Finale: zoom out to the brain with everything explored orbiting it as cards on a 3D sphere,
// save it (sign-in sheet), the cards spiral into the brain, then a dark-to-light zoom into Today.
// Mounts into #finaleLayer. API: Finale = { mount(layerEl), demo() }.
(function () {
  const DEMO = [
    { id: 'root', label: 'Why do some products become habits?', shape: 'ring', palette: 'mind' },
    { id: 'variable', label: 'Variable rewards', shape: 'grid', palette: 'mind' },
    { id: 'dopamine', label: 'Dopamine and wanting', shape: 'spike', palette: 'mind' },
    { id: 'fogg', label: 'Fogg behaviour model', shape: 'steps', palette: 'arts' },
    { id: 'streaks', label: 'Streaks', shape: 'bars', palette: 'arts' },
    { id: 'slots', label: 'Slot machines', shape: 'grid', palette: 'mind' },
    { id: 'retention', label: 'Retention curves', shape: 'curve', palette: 'tech' },
  ];
  const NEXT = [
    { q: 'Why do we put off things we actually want to do?', shape: 'wave', palette: 'mind' },
    { q: 'What makes a game hard to put down?', shape: 'target', palette: 'arts' },
    { q: 'How do defaults shape the choices we make?', shape: 'funnel', palette: 'society' },
  ];
  const TINT = { mind: '#EEEAFD', arts: '#F8E9F6', society: '#EFF3E1', tech: '#E4F1F8', cobalt: '#E8EEFD', body: '#FBE9EF', space: '#E9EBF5' };

  const SVG = {
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    apple: '<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.2 5.8c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.6 2.8-1.3z"/></svg>',
    google: '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>',
    spin: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>',
    chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    clock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    nodes: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="8" r="2.5"/><circle cx="10" cy="18" r="2.5"/><path d="M8.3 7l7.3.8M7 8.3l2.2 7.4M16.4 10l-4.6 6.2"/></svg>',
    replay: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  };
  const TABS = [
    ['today', 'Today', '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'],
    ['ask', 'Ask', '<path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.4A8.5 8.5 0 1 1 20.5 12z"/>'],
    ['practice', 'Practice', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'],
    ['memory', 'Memory', '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12.5l9 5 9-5"/><path d="M3 17l9 5 9-5"/>'],
  ];

  // Sphere geometry (screen is 368 × 822)
  const CX = 184, CY = 452, RX = 116, RY = 186, RZ = 140, FOC = 720, LIMX = 128, LIMY = 214;
  const AUTO_YAW = 0.26, AUTO_PITCH = 0.085;

  const docEl = document.documentElement;
  const isStill = () => docEl.classList.contains('still');
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeIn = (t) => t * t * t;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const param = (k) => new URLSearchParams(location.search).get(k);
  const say = (m) => window.toast && window.toast(m);

  let layer, root, S = null;
  const timers = [];
  const later = (fn, ms) => { timers.push(setTimeout(fn, isStill() ? 0 : ms)); };

  // Static dot-glyph of a node's shape. onDark: light dots in front.
  function glyph(shape, pal, n, onDark) {
    if (!window.Brain || !Brain.sample) return '';
    const P = Brain.palette(pal || 'cobalt');
    const lift = (c, t, k) => c.map((v, i) => v + (t[i] - v) * k);
    const a = onDark ? lift(P[1], P[0], 0.45) : P[0], b = onDark ? lift(P[0], [255, 255, 255], 0.3) : P[1];
    let s = '<svg viewBox="-1.15 -1.15 2.3 2.3" aria-hidden="true">';
    for (const [x, y, z] of Brain.sample(shape || 'brain', n || 80)) {
      const c = a.map((v, i) => Math.round(v + (b[i] - v) * z)).join(',');
      s += `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${((onDark ? 0.04 : 0.03) + 0.036 * z).toFixed(3)}" fill="rgb(${c})" opacity="${(0.45 + 0.55 * z).toFixed(2)}"/>`;
    }
    return s + '</svg>';
  }

  function fib(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - y * y), a = i * 2.399963 + 0.9;
      out.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
    return out;
  }

  // rotate (yaw about Y, then pitch about X); returns [x, y, z] with +z toward the camera
  function rot(p, yaw, pitch) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
    return [x1, p[1] * cp - z1 * sp, p[1] * sp + z1 * cp];
  }
  // push (0..1): keep cards off the brain by remapping the projected radius (in ellipse space) so the centre is empty
  function project(q, push) {
    const P = FOC / (FOC - q[2] * RZ);
    let dx = q[0] * RX * P, dy = -q[1] * RY * P;
    if (push > 0) {
      const u = Math.hypot(dx / LIMX, dy / LIMY) + 1e-4, u2 = Math.sqrt(push * push + u * u * (1 - push * push));
      dx *= u2 / u; dy *= u2 / u;
    }
    return [CX + dx, CY + dy, P];
  }

  // ---------- Build ----------
  function build(nodes) {
    const n = nodes.length;
    root.className = 'fin';
    root.innerHTML = `
      <div class="fin-scene">
        <div class="fin-bg"></div>
        <div class="fin-stage" data-stage aria-label="Everything you explored, orbiting your brain. Drag to spin.">
          <svg class="fin-rings back" data-rb width="368" height="822" viewBox="0 0 368 822" aria-hidden="true"></svg>
          <div class="fin-halo"></div>
          <div class="fin-brain" data-brain></div>
          <svg class="fin-rings front" data-rf width="368" height="822" viewBox="0 0 368 822" aria-hidden="true"></svg>
        </div>
        <div class="fin-light" aria-hidden="true"></div>
        <header class="fin-copy" data-copy>
          <p class="fin-eb">Today’s pondering</p>
          <h1 class="fin-title">You explored ${n} ideas</h1>
          <p class="fin-sub">Everything you just pondered, connected in your brain.</p>
        </header>
        <p class="fin-hint" data-hint>${SVG.spin}Drag to spin</p>
        <div class="fin-scrim"></div>
        <div class="fin-cta" data-cta><button class="fin-btn" data-save><span>Save this to your brain</span></button></div>
      </div>`;
    const stage = root.querySelector('[data-stage]');
    const pts = fib(n);
    const cards = nodes.map((nd, i) => {
      const el = document.createElement('div');
      el.className = 'fin-card' + (i === 0 ? ' is-root' : '');
      el.innerHTML = `<span class="fin-glyph" style="background:rgba(${(window.Brain ? Brain.palette(nd.palette)[0] : [127, 163, 255]).join(',')},${i === 0 ? '.2' : '.13'})">${glyph(nd.shape, nd.palette, i === 0 ? 110 : 80, true)}</span><span class="fin-label">${esc(nd.label)}</span>`;
      stage.appendChild(el);
      const a = (i / n) * Math.PI * 2 + 0.6;
      return { el, w: i === 0 ? 176 : 120, p: pts[i], from: [CX + Math.cos(a) * 330, CY + Math.sin(a) * 520], abs: 0, pulsed: false };
    });
    const RINGS = [[1, 0, 0], [0.5, 0.2, 0.84], [-0.55, 0.62, 0.55]].map((nv) => {
      const L = Math.hypot(...nv), N = nv.map((v) => v / L);
      const t = Math.abs(N[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      const u = [N[1] * t[2] - N[2] * t[1], N[2] * t[0] - N[0] * t[2], N[0] * t[1] - N[1] * t[0]], ul = Math.hypot(...u);
      const U = u.map((v) => v / ul), V = [N[1] * U[2] - N[2] * U[1], N[2] * U[0] - N[0] * U[2], N[0] * U[1] - N[1] * U[0]];
      const R = 1.08, out = [];
      for (let k = 0; k <= 72; k++) { const a = k / 72 * Math.PI * 2; out.push([0, 1, 2].map((j) => (U[j] * Math.cos(a) + V[j] * Math.sin(a)) * R)); }
      return out;
    });
    return {
      nodes, stage, cards, rings: RINGS,
      rb: root.querySelector('[data-rb]'), rf: root.querySelector('[data-rf]'),
      yaw: 0.35, pitch: 0.32, vYaw: reduced() ? 0 : AUTO_YAW, vPitch: reduced() ? 0 : AUTO_PITCH,
      drag: null, flyStart: 0, absStart: null, absFreeze: null, raf: 0, iv: 0, last: 0, running: false, today: false, sheet: null,
    };
  }

  // ---------- Sphere loop ----------
  function step(now) {
    if (!S || !S.running) return;
    const dt = S.last ? Math.min(0.05, (now - S.last) / 1000) : 0; S.last = now;
    if (!S.drag) {
      const k = 1 - Math.exp(-dt * 0.9), ay = reduced() ? 0 : AUTO_YAW, ap = reduced() ? 0 : AUTO_PITCH;
      S.vYaw += (ay - S.vYaw) * k; S.vPitch += (ap - S.vPitch) * k;
      S.yaw += S.vYaw * dt; S.pitch += S.vPitch * dt;
    }
    S.cards.forEach((c, i) => {
      // fly-in from the edges
      let f = 1;
      if (S.flyStart) f = easeOut(clamp((now - S.flyStart - i * 95) / 1100, 0, 1));
      // absorb: spiral into the brain
      let e = 0;
      if (S.absFreeze != null) e = S.absFreeze;
      else if (S.absStart) e = clamp((now - S.absStart - i * 85) / 1050, 0, 1);
      const ee = easeIn(e) * 0.35 + (e * e) * 0.65;
      const q = rot(c.p, S.yaw + ee * 2.8, S.pitch);
      const m = 1 - ee;
      const qq = [q[0] * m, q[1] * m, q[2] * m];
      const push = (0.4 + 0.34 * clamp(q[2], 0, 1)) * m;
      let [x, y, P] = project(qq, push);
      const d = (q[2] + 1) / 2;
      let s = (0.7 + 0.28 * d) * P * (1 - 0.78 * ee);
      const hw = c.w / 2 * s + 6; x = clamp(x, hw, 368 - hw);
      let o = (0.34 + 0.66 * Math.pow(d, 1.25)) * (1 - Math.pow(ee, 1.6));
      if (f < 1) { x = c.from[0] + (x - c.from[0]) * f; y = c.from[1] + (y - c.from[1]) * f; s *= 1.35 - 0.35 * f; o *= f; }
      const z = q[2] * m;
      c.el.style.zIndex = z < 0 ? 2 + Math.round((z + 1) * 47) : 52 + Math.round(z * 47);
      c.el.style.opacity = o.toFixed(3);
      c.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale(${s.toFixed(3)})`;
      if (S.absStart && e > 0.82 && !c.pulsed) { c.pulsed = true; if (window.Brain) Brain.pulse(); }
    });
    // orbit rings: back half behind the brain, front half over it
    const ringK = S.absStart ? 1 - clamp((now - S.absStart) / 900, 0, 1) : (S.flyStart ? easeOut(clamp((now - S.flyStart) / 1400, 0, 1)) : 1);
    let back = '', front = '';
    for (const ring of S.rings) {
      let prevFront = null;
      ring.forEach((p) => {
        const q = rot(p, S.yaw * 0.6, S.pitch * 0.8), [x, y] = project(q, 0), isF = q[2] >= 0;
        const pt = `${x.toFixed(1)} ${y.toFixed(1)}`;
        if (prevFront === null) { if (isF) front += `M${pt}`; else back += `M${pt}`; }
        else if (isF !== prevFront) { if (isF) { back += `L${pt}`; front += `M${pt}`; } else { front += `L${pt}`; back += `M${pt}`; } }
        else if (isF) front += `L${pt}`; else back += `L${pt}`;
        prevFront = isF;
      });
    }
    S.rb.innerHTML = `<path d="${back}" opacity="${(0.55 * ringK).toFixed(3)}"/>`;
    S.rf.innerHTML = `<path d="${front}" opacity="${ringK.toFixed(3)}"/>`;
  }
  function loop(now) { if (!S || !S.running) return; step(now); S.raf = requestAnimationFrame(loop); }
  function startLoop() {
    S.running = true;
    if (isStill()) { step(performance.now()); S.iv = setInterval(() => step(performance.now()), 40); }
    else S.raf = requestAnimationFrame(loop);
  }
  function stopLoop() { if (!S) return; S.running = false; cancelAnimationFrame(S.raf); clearInterval(S.iv); }

  function bindDrag() {
    const st = S.stage;
    const ps = () => window.PS || 1;
    st.addEventListener('pointerdown', (e) => {
      if (S.absStart || S.sheet || S.today) return;
      S.drag = { x: e.clientX, y: e.clientY, t: performance.now(), vy: 0, vp: 0 };
      try { st.setPointerCapture(e.pointerId); } catch (_) {}
      st.classList.add('is-drag');
      root.querySelector('[data-hint]').classList.add('gone');
    });
    st.addEventListener('pointermove', (e) => {
      const d = S && S.drag; if (!d) return;
      const now = performance.now(), dt = Math.max(1, now - d.t) / 1000;
      const dx = (e.clientX - d.x) / ps(), dy = (e.clientY - d.y) / ps();
      const ky = dx * 0.0085, kp = dy * 0.0085;
      S.yaw += ky; S.pitch += kp;
      d.vy = d.vy * 0.6 + (ky / dt) * 0.4; d.vp = d.vp * 0.6 + (kp / dt) * 0.4;
      d.x = e.clientX; d.y = e.clientY; d.t = now;
    });
    const end = () => {
      const d = S && S.drag; if (!d) return;
      const idle = performance.now() - d.t > 90;
      S.vYaw = idle ? 0 : clamp(d.vy, -5, 5); S.vPitch = idle ? 0 : clamp(d.vp, -5, 5);
      S.drag = null; st.classList.remove('is-drag');
    };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  }

  // ---------- Scene 1 ----------
  function play(nodes) {
    hardReset();
    nodes = (nodes && nodes.length ? nodes : DEMO).slice(0, 9);
    S = build(nodes);
    root.style.display = 'block';
    const screen = document.getElementById('screen'); if (screen) screen.classList.add('fin-dark');
    const host = root.querySelector('[data-brain]');
    if (window.Brain) {
      Brain.moveTo(host);
      Brain.setShape('brain', 'cobalt', 1200);
      Brain.setSpin(true); Brain.setLobes(0.6);
      if (Brain.setDark) Brain.setDark(true);
      if (Brain.setMode) Brain.setMode('idle');
    }
    root.querySelector('[data-save]').addEventListener('click', openSheet);
    bindDrag();
    const instant = isStill() || reduced();
    S.flyStart = instant ? 0 : performance.now() + 380;
    if (instant) root.classList.add('on', 'copy-in', 'cta-in');
    else {
      void root.offsetWidth;
      requestAnimationFrame(() => root.classList.add('on'));
      later(() => root.classList.add('copy-in'), 750);
      later(() => root.classList.add('cta-in'), 1250);
    }
    startLoop();
  }

  // ---------- Sign-in sheet ----------
  function openSheet() {
    if (!S || S.sheet || S.absStart) return;
    const scene = root.querySelector('.fin-scene');
    const bd = document.createElement('div'); bd.className = 'fin-backdrop';
    const sh = document.createElement('div'); sh.className = 'fin-sheet';
    sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-labelledby', 'finSheetTitle'); sh.tabIndex = -1;
    sh.innerHTML = `<div class="fin-grab" aria-hidden="true"></div>
      <button class="fin-x" data-x aria-label="Close">${SVG.x}</button>
      <h2 id="finSheetTitle">Save your brain</h2>
      <p class="fin-sheet-sub">So today’s ideas are here tomorrow, and keep connecting.</p>
      <div class="fin-auth">
        <button class="fin-apple" data-go>${SVG.apple}Continue with Apple</button>
        <button class="fin-google" data-go>${SVG.google}Continue with Google</button>
        <button class="fin-email" data-go>${SVG.mail}Use email instead</button>
      </div>
      <p class="fin-fine">By continuing, you agree to Cortex’s Terms and Privacy Policy.</p>`;
    scene.appendChild(bd); scene.appendChild(sh);
    S.sheet = { bd, sh };
    const close = (then) => {
      if (!S || !S.sheet) return;
      S.sheet = null; document.removeEventListener('keydown', onKey);
      sh.classList.add('closing'); bd.classList.add('closing');
      later(() => { sh.remove(); bd.remove(); root.querySelector('[data-save]').focus({ preventScroll: true }); if (then) then(); }, 240);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    bd.addEventListener('click', () => close());
    sh.querySelector('[data-x]').addEventListener('click', () => close());
    sh.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => close(save)));
    // simple swipe-down to dismiss from the grabber area
    let y0 = null;
    sh.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; y0 = e.clientY; });
    sh.addEventListener('pointerup', (e) => { if (y0 != null && (e.clientY - y0) / (window.PS || 1) > 60) close(); y0 = null; });
    sh.focus({ preventScroll: true });
  }

  // ---------- Saving: absorb, then dark-to-light into Today ----------
  function save() {
    if (!S || S.absStart) return;
    root.classList.add('saving');
    const copy = root.querySelector('[data-copy]');
    copy.querySelector('.fin-eb').textContent = 'Saving';
    copy.querySelector('.fin-title').textContent = 'Into your brain';
    copy.querySelector('.fin-sub').textContent = 'Every idea, linked to what you already know.';
    if (reduced()) { S.absFreeze = 1; later(toToday, 600); return; }
    S.absStart = performance.now() + 150;
    const total = 150 + (S.cards.length - 1) * 85 + 1050;
    later(() => { if (window.Brain) Brain.pulse(); root.classList.add('saved'); }, total);
    later(toToday, total + 520);
  }

  function toToday() {
    if (!S) return;
    root.classList.add('zoom');
    later(() => showToday(false), 650);
  }

  function showToday(instant) {
    if (!S || S.today) return;
    S.today = true;
    const nodes = S.nodes, n = nodes.length, mins = Math.max(3, Math.round(n * 1.7));
    const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const t = document.createElement('section');
    t.className = 'fin-today'; t.setAttribute('aria-label', 'Today');
    t.innerHTML = `
      <div class="fin-tscroll">
        <header class="fin-thead fin-rise" style="--d:0">
          <div><p class="fin-date">${esc(date)}</p><h1>Today</h1></div>
          <div class="fin-avatar" aria-label="Sam">S</div>
        </header>
        <article class="fin-hero fin-rise" style="--d:1">
          <div class="fin-const">${constellation(nodes)}<span class="fin-tag">Today’s exploration</span></div>
          <h2>${esc(nodes[0].label)}</h2>
          <p class="fin-meta"><span>${SVG.nodes}${n} ideas</span><i aria-hidden="true">·</i><span>${SVG.clock}${mins} min</span></p>
          <button class="fin-carved" data-cont>${SVG.play}Continue pondering</button>
        </article>
        <h3 class="fin-sec fin-rise" style="--d:2">Next to ponder</h3>
        <div class="fin-next fin-rise" style="--d:3">
          ${NEXT.slice(0, 2).map((x) => `<button class="fin-row" data-next><span class="fin-rglyph" style="background:${TINT[x.palette] || TINT.cobalt}">${glyph(x.shape, x.palette, 70, false)}</span><span class="fin-rq">${esc(x.q)}</span><span class="fin-chev">${SVG.chev}</span></button>`).join('')}
        </div>
        <button class="fin-replay fin-rise" style="--d:4" data-replay>${SVG.replay}Replay</button>
      </div>
      <nav class="fin-tabs fin-rise" style="--d:2" aria-label="Tabs">
        ${TABS.map(([id, label, path]) => `<button class="fin-tab" data-tab="${id}" ${id === 'today' ? 'aria-current="page"' : ''}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg><span>${label}</span></button>`).join('')}
      </nav>`;
    root.appendChild(t);
    t.querySelector('[data-cont]').addEventListener('click', () => say('Picks up where you left off'));
    t.querySelectorAll('[data-next]').forEach((b) => b.addEventListener('click', () => say('Opens a new exploration')));
    t.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.tab !== 'today') say('Not in this prototype'); }));
    t.querySelector('[data-replay]').addEventListener('click', () => window.Bus && Bus.emit('reset', {}));
    const screen = document.getElementById('screen'); if (screen) screen.classList.remove('fin-dark');
    const done = () => {
      root.classList.add('today');
      stopLoop();
      if (window.Brain) { Brain.setSpin(false); Brain.setLobes(0); if (Brain.setDark) Brain.setDark(false); }
    };
    if (instant || isStill()) { t.classList.add('in'); done(); }
    else { void t.offsetWidth; requestAnimationFrame(() => t.classList.add('in')); later(done, 900); }
    if (window.Bus) Bus.emit('finale:done', {});
  }

  // Small constellation of the explored nodes for the Today hero card (304 × 132)
  function constellation(nodes) {
    const W = 304, H = 132, cx = W / 2, cy = H / 2 + 2, n = nodes.length;
    const rnd = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
    const pos = nodes.map((_, i) => {
      if (i === 0) return [cx, cy];
      const a = -Math.PI / 2 + ((i - 1) / (n - 1)) * Math.PI * 2 + (rnd(i) - 0.5) * 0.5, r = 0.72 + rnd(i + 3) * 0.28;
      return [cx + Math.cos(a) * 118 * r, cy + Math.sin(a) * 44 * r];
    });
    const col = (p) => { const c = window.Brain ? Brain.palette(p || 'cobalt')[0] : [127, 163, 255]; return `rgb(${c.join(',')})`; };
    let s = `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" aria-label="Constellation of ${n} explored ideas" role="img">`;
    for (let k = 0; k < 18; k++) s += `<circle cx="${(rnd(k + 40) * W).toFixed(1)}" cy="${(rnd(k + 70) * H).toFixed(1)}" r="${(0.5 + rnd(k + 90) * 0.7).toFixed(2)}" fill="#fff" opacity="${(0.25 + rnd(k + 20) * 0.35).toFixed(2)}"/>`;
    for (let i = 1; i < n; i++) s += `<line x1="${cx}" y1="${cy}" x2="${pos[i][0].toFixed(1)}" y2="${pos[i][1].toFixed(1)}" stroke="rgba(160,185,255,.38)" stroke-width="1"/>`;
    for (let i = 1; i < n; i++) { const j = i === n - 1 ? 1 : i + 1; s += `<line x1="${pos[i][0].toFixed(1)}" y1="${pos[i][1].toFixed(1)}" x2="${pos[j][0].toFixed(1)}" y2="${pos[j][1].toFixed(1)}" stroke="rgba(160,185,255,.16)" stroke-width="1"/>`; }
    nodes.forEach((nd, i) => {
      const [x, y] = pos[i], c = i === 0 ? '#C9D8FF' : col(nd.palette), r = i === 0 ? 6.5 : 4;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r * 2.6}" fill="${c}" opacity=".16"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}"/>`;
    });
    return s + '</svg>';
  }

  // ---------- Reset ----------
  function hardReset() {
    while (timers.length) clearTimeout(timers.pop());
    if (S) { stopLoop(); if (S.sheet) S.sheet = null; }
    S = null;
  }
  function onReset() {
    const wasLive = S && !S.today;
    hardReset();
    if (!root) return;
    // Leave the brain canvas where it is; the exploration moves it back itself.
    root.style.display = 'none';
    root.className = 'fin';
    root.querySelectorAll('.fin-today, .fin-sheet, .fin-backdrop').forEach((el) => el.remove());
    const screen = document.getElementById('screen'); if (screen) screen.classList.remove('fin-dark');
    if (wasLive && window.Brain) { Brain.setSpin(false); Brain.setLobes(0); if (Brain.setDark) Brain.setDark(false); }
  }

  window.Finale = {
    mount(layerEl) {
      layer = layerEl;
      root = document.createElement('div');
      root.className = 'fin'; root.style.display = 'none';
      layer.appendChild(root);
      if (window.Bus) {
        Bus.on('session:done', (d) => play(d && d.nodes));
        Bus.on('reset', onReset);
      }
    },
    demo() {
      play(DEMO);
      const f = param('fin');
      if (f === 'sheet') openSheet();
      else if (f === 'today') showToday(true);
      else if (f === 'absorb') { save(); while (timers.length) clearTimeout(timers.pop()); S.absStart = null; S.absFreeze = 0.5; }
    },
  };
})();
