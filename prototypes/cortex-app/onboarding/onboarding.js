// Onboarding v4 · trailer → welcome → learning style → what to learn → goal → time → the course builds itself.
// Owner: A · Onboarding. See CONTRACT.md. Talks to the app only through Bus, Store and Brain.
(function () {
  const W = 368, H = 822;
  const P = new URLSearchParams(location.search);
  const STILL = P.has('still');
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INSTANT = STILL || REDUCED;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mixHex = (a, b, t) => { const A = hex(a), B = hex(b); return A.map((v, i) => Math.round(v + (B[i] - v) * t)); };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const STEPS = ['Trailer', 'Welcome', 'Learning style', 'What to learn', 'Your goal', 'Your time', 'Building your course'];
  const SCENE_OF_STEP = [0, 3, 4, 5, 6, 7, 8];
  const STEP_OF_SCENE = [0, 0, 0, 1, 2, 3, 4, 5, 6];

  // ---------- Learning styles: each one is a particle shape ----------
  const STYLES = [
    { id: 'quick', label: 'Quick bites', sub: 'A little about a lot', shape: 'style-quick', grad: ['#FFB23E', '#EF4D7E'], line: 'Your course will be many short bites' },
    { id: 'connect', label: 'Connect the dots', sub: 'Link ideas, go deeper on your own', shape: 'style-connect', grad: ['#9A78FF', '#1F5BE0'], line: 'Your course will be a map you can explore' },
    { id: 'roadmap', label: 'Full roadmap', sub: 'A long, structured path', shape: 'style-roadmap', grad: ['#16C2A3', '#1F5BE0'], line: 'Your course will be one clear path' },
  ];
  const sc = (S) => (v) => (v * S) / 220;
  Brain.defineIcon('style-quick', (x, S) => {
    const k = sc(S);
    [[38, 44, 21], [106, 30, 15], [172, 50, 23], [62, 116, 15], [134, 106, 22], [196, 134, 13], [30, 184, 16], [100, 182, 21], [168, 190, 17]]
      .forEach(([cx, cy, r]) => { x.beginPath(); x.arc(k(cx), k(cy), k(r), 0, 6.283); x.fill(); });
  }, { grad: STYLES[0].grad });
  Brain.defineIcon('style-connect', (x, S) => {
    const k = sc(S);
    const N = [[110, 112, 21], [36, 58, 14], [124, 24, 13], [196, 76, 15], [184, 176, 13], [100, 200, 15], [24, 152, 13]];
    const L = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 2], [2, 3], [3, 4], [5, 6], [6, 1], [4, 5]];
    x.lineWidth = k(5.5);
    L.forEach(([a, b]) => { x.beginPath(); x.moveTo(k(N[a][0]), k(N[a][1])); x.lineTo(k(N[b][0]), k(N[b][1])); x.stroke(); });
    N.forEach(([cx, cy, r]) => { x.beginPath(); x.arc(k(cx), k(cy), k(r), 0, 6.283); x.fill(); });
  }, { grad: STYLES[1].grad });
  Brain.defineIcon('style-roadmap', (x, S) => {
    const k = sc(S);
    x.lineWidth = k(12);
    x.beginPath(); x.moveTo(k(30), k(36)); x.lineTo(k(160), k(36));
    x.arc(k(160), k(72), k(36), -Math.PI / 2, Math.PI / 2);
    x.lineTo(k(60), k(108));
    x.arc(k(60), k(144), k(36), -Math.PI / 2, Math.PI / 2, true);
    x.lineTo(k(172), k(180)); x.stroke();
    [[30, 36, 13], [96, 36, 9], [196, 72, 9], [110, 108, 9], [24, 144, 9], [104, 180, 9]].forEach(([cx, cy, r]) => { x.beginPath(); x.arc(k(cx), k(cy), k(r), 0, 6.283); x.fill(); });
    x.beginPath(); x.arc(k(184), k(180), k(19), 0, 6.283); x.fill();
  }, { grad: STYLES[2].grad });

  const GOAL_SHAPE = { how: 'heart', condition: 'spike', healthy: 'wave', exam: 'grid' };
  const BODY = ['#F783AC', '#D6336C'];

  // A small static dot glyph of any particle shape, for option tiles
  function glyph(shape, colour, size = 34, n = 230) {
    if (!Brain.has(shape)) return '';
    const pts = Brain.sample(shape, n);
    return `<svg width="${size}" height="${size}" viewBox="-1.02 -1.02 2.04 2.04" aria-hidden="true">${pts.map(([x, y, d]) => {
      const c = colour(x, y, d);
      return `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="0.052" fill="rgb(${c.join(',')})" opacity="${(0.55 + 0.45 * d).toFixed(2)}"/>`;
    }).join('')}</svg>`;
  }
  const gradColour = (g) => (x, y) => mixHex(g[0], g[1], Math.max(0, Math.min(1, (x + y + 1.72) / 3.44)));
  const bodyColour = (x, y, d) => mixHex('#F59BB3', '#A3264F', Math.max(0, Math.min(1, 0.25 + d * 0.75)));

  // ---------- Trailer field: thought orbs + question pills showing range ----------
  const ORBS = ['rocket', 'whale', 'coffee', 'city', 'bulb', 'hourglass', 'brain', 'chart'];
  const PILLS = ['How do black holes bend light?', 'Why does bread rise?', 'How do I take sharper photos?', 'Why did Rome fall?', 'Why do we dream?',
    'How does compound interest work?', 'What makes a song catchy?', 'Is there life on Mars?', 'Why is spicy food hot?', 'How do I learn guitar fast?',
    'Why is the Mona Lisa famous?', 'Who built the pyramids?', 'How does my heart keep time?', 'Where does money come from?'];

  // ---------- State ----------
  const st = { scene: 0, style: null, topic: '', goal: null, span: null, daily: '10 min a day', busy: false };
  let root, $, timers = [], orb = { x: 184, y: 350, s: 0.95 }, mounted = false;
  const later = (fn, ms) => { timers.push(setTimeout(fn, STILL ? Math.min(ms, 20) : ms)); };
  const auto = (fn, ms) => { if (!STILL) later(fn, ms); };

  const TEMPLATE = `
    <div class="ob-day"></div>
    <div class="ob-aurora"><i class="a1"></i><i class="a2"></i><i class="a3"></i><i class="a4"></i></div>
    <div class="ob-night"></div>
    <div class="ob-space" aria-hidden="true"></div>
    <svg class="ob-map" viewBox="0 0 ${W} ${H}" aria-hidden="true"></svg>
    <div class="ob-stops" role="list" aria-label="Your course"></div>
    <div class="ob-card" aria-live="polite"></div>
    <div class="ob-brain"><div class="ob-halo"></div></div>
    <div class="ob-hint">Touch it</div>
    <div class="ob-scrim"></div>
    <div class="ob-tline" aria-live="polite"></div>
    <div class="ob-tsub"></div>
    <div class="ob-tap">Tap to continue</div>
    <button class="ob-skip" type="button">Skip</button>
    <div class="ob-qtop">
      <button class="ob-back" type="button" aria-label="Back"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
      <div class="ob-bar" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100"><i></i></div>
    </div>
    <h1 class="ob-head"></h1>
    <div class="ob-callout"><p class="ob-ceb"></p><p class="ob-ctx"></p></div>
    <div class="ob-opts" role="radiogroup"></div>
    <p class="ob-explain" aria-live="polite"></p>
    <div class="ob-ask">
      <label class="ob-field"><textarea rows="3" placeholder="Anything. A topic, a skill, a question" aria-label="What do you want to learn?" spellcheck="false" autocomplete="off"></textarea></label>
      <p class="ob-try">Or try one</p>
      <div class="ob-suggs"></div>
    </div>
    <div class="ob-daily"><p class="ob-dl">Each day</p><div class="ob-chips" role="radiogroup" aria-label="Minutes a day"></div></div>
    <div class="ob-narr" aria-live="polite"><p></p><div class="ob-np"><i></i></div></div>
    <p class="ob-fine"></p>
    <div class="ob-cta"><button class="ob-btn" type="button"><span>Continue</span></button></div>
    <canvas class="ob-fx" aria-hidden="true"></canvas>`;

  // ---------- Mount ----------
  function mount(layer) {
    if (mounted) return; mounted = true;
    root = document.createElement('div'); root.className = 'ob'; root.innerHTML = TEMPLATE; layer.appendChild(root);
    const q = (s) => root.querySelector(s);
    $ = {
      space: q('.ob-space'), map: q('.ob-map'), stops: q('.ob-stops'), card: q('.ob-card'), brain: q('.ob-brain'), hint: q('.ob-hint'),
      scrim: q('.ob-scrim'), tline: q('.ob-tline'), tsub: q('.ob-tsub'), tap: q('.ob-tap'), skip: q('.ob-skip'), qtop: q('.ob-qtop'),
      back: q('.ob-back'), bar: q('.ob-bar'), barFill: q('.ob-bar i'), head: q('.ob-head'), callout: q('.ob-callout'), ceb: q('.ob-ceb'), ctx: q('.ob-ctx'),
      opts: q('.ob-opts'), explain: q('.ob-explain'), ask: q('.ob-ask'), field: q('.ob-field'), input: q('.ob-field textarea'), suggs: q('.ob-suggs'),
      daily: q('.ob-daily'), chips: q('.ob-chips'), narr: q('.ob-narr'), narrTxt: q('.ob-narr p'), narrFill: q('.ob-np i'), fine: q('.ob-fine'),
      cta: q('.ob-cta'), btn: q('.ob-btn'), btnLabel: q('.ob-btn span'), fx: q('.ob-fx'), aurora: q('.ob-aurora'),
    };
    buildField(); setupFx(); wireTopic();
    // The screen clips its content; never let focus or scroll-into-view shift it while onboarding shows
    const scr = document.getElementById('screen');
    if (scr) scr.addEventListener('scroll', () => { if (scr.scrollTop && root.offsetParent) scr.scrollTop = 0; });
    $.btn.addEventListener('click', () => { if ($.btn.disabled || st.busy) return; const s = SCENES[st.scene]; if (s.next) s.next(); });
    $.back.addEventListener('click', () => { if (st.busy) return; const s = SCENES[st.scene]; if (s.back) s.back(); });
    $.skip.addEventListener('click', (e) => { e.stopPropagation(); go(3); });
    root.addEventListener('click', (e) => {
      if (st.scene > 2 || e.target.closest('button') || e.target.closest('canvas')) return;
      go(st.scene + 1);
    });
  }

  // ---------- Brain placement (one canvas, glides between spots) ----------
  function place(x, y, s, o = {}) {
    orb = { x, y, s };
    $.brain.classList.toggle('zoom', !!o.zoom); $.brain.classList.toggle('snap', !!o.snap);
    $.brain.style.transform = `translate(${x - 160}px, ${y - 160}px) scale(${s})`;
    $.brain.style.opacity = o.hidden ? 0 : 1; $.brain.style.pointerEvents = o.hidden ? 'none' : '';
    $.hint.style.top = y + 132 * s + 'px';
  }

  // ---------- Trailer lines that build word by word ----------
  function setLine(text, top) {
    if (top != null) $.tline.style.top = top + 'px';
    const write = () => {
      $.tline.classList.remove('out');
      $.tline.innerHTML = text ? text.split(' ').map((w) => `<span class="w">${esc(w)}</span>`).join(' ') : '';
      [...$.tline.children].forEach((w, k) => setTimeout(() => w.classList.add('on'), STILL ? 0 : 60 + k * 50));
    };
    if ($.tline.children.length && !STILL) { $.tline.classList.add('out'); setTimeout(write, 340); } else write();
  }
  function setSub(text, top) { if (top != null) $.tsub.style.top = top + 'px'; $.tsub.textContent = text || ''; $.tsub.classList.toggle('on', !!text); }

  // ---------- Orb space ----------
  const items = [];
  function buildField() {
    ORBS.forEach((n) => items.push({ html: `<img src="assets/orb-${n}.jpg" alt="">`, img: true }));
    PILLS.forEach((p) => items.push({ html: `<span class="ob-pill">${esc(p)}</span>`, img: false }));
    items.forEach((it, k) => { it.el = document.createElement('div'); it.el.className = 'ob-t'; it.el.innerHTML = it.html; $.space.appendChild(it.el); reset(it, true, k); });
    requestAnimationFrame(fieldLoop);
    if (STILL) setInterval(() => fieldLoop(performance.now()), 40);
  }
  function reset(it, first, k = 0) {
    const a = Math.random() * 6.283, r = it.img ? rnd(130, 400) : rnd(60, 300);
    it.x = Math.cos(a) * r * (it.img ? 1 : 0.8); it.y = Math.sin(a) * r * 1.5;
    it.z = first ? -3000 + (k / items.length) * 3000 + rnd(-150, 150) : -3000;
  }
  let fieldOn = false, fieldSpeed = 0, fieldLast = 0;
  function fieldLoop(t) {
    if (!STILL) requestAnimationFrame(fieldLoop);
    const dt = fieldLast ? Math.min(0.05, (t - fieldLast) / 1000) : 0; fieldLast = t;
    if (!fieldOn) return;
    fieldSpeed += (560 - fieldSpeed) * 0.02;
    items.forEach((it) => {
      it.z += fieldSpeed * dt * (it.img ? 1 : 1.15);
      if (it.z > 420) reset(it);
      const near = it.z > 120 ? 1 - (it.z - 120) / 300 : 1, far = Math.min(1, (it.z + 3000) / 900);
      it.el.style.transform = `translate3d(${it.x}px, ${it.y}px, ${it.z}px)`;
      it.el.style.opacity = Math.max(0, Math.min(near, far)).toFixed(3);
    });
  }
  function fieldStart() {
    items.forEach((it, k) => { it.el.style.transition = 'none'; reset(it, true, k); });
    fieldSpeed = 2800; fieldOn = true; $.space.style.opacity = 1;
    if (STILL) { items.forEach((it, k) => { it.z = -2200 + (k / items.length) * 2400; }); fieldSpeed = 0; }
  }
  function fieldCollapse() {
    fieldOn = false;
    items.forEach((it, k) => {
      it.el.style.transition = `transform 1000ms cubic-bezier(.7,0,.25,1) ${k * 18}ms, opacity 800ms ease-in ${160 + k * 18}ms`;
      it.el.style.transform = 'translate3d(0px, -18px, -260px) scale(.04)'; it.el.style.opacity = 0;
    });
  }
  function fieldHide() { fieldOn = false; items.forEach((it) => { it.el.style.transition = 'opacity 400ms'; it.el.style.opacity = 0; }); }

  // ---------- Particle FX canvas: bursts into the character, streams out of it ----------
  let fg, parts = [], comet = null, fxDirty = false;
  const DPR = Math.min(2, window.devicePixelRatio || 1), SPR = {};
  function setupFx() {
    $.fx.width = W * DPR; $.fx.height = H * DPR; fg = $.fx.getContext('2d');
    requestAnimationFrame(fxLoop);
  }
  function sprite(c) {
    if (SPR[c]) return SPR[c];
    const cv = document.createElement('canvas'); cv.width = cv.height = 48; const x = cv.getContext('2d');
    const g = x.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, `rgba(${c},1)`); g.addColorStop(0.22, `rgba(${c},.95)`); g.addColorStop(0.5, `rgba(${c},.28)`); g.addColorStop(1, `rgba(${c},0)`);
    x.fillStyle = g; x.fillRect(0, 0, 48, 48); return (SPR[c] = cv);
  }
  const rgb = (h) => hex(h).join(',');
  function relRect(el) {
    const a = el.getBoundingClientRect(), b = root.getBoundingClientRect(), s = b.width / W || 1;
    return { x: (a.left - b.left) / s, y: (a.top - b.top) / s, w: a.width / s, h: a.height / s };
  }
  // An option dissolves and flies into the character
  function burst(r, colours, onArrive) {
    if (INSTANT) { onArrive && onArrive(); return; }
    const n = Math.round(Math.min(110, Math.max(55, (r.w * r.h) / 140))), t0 = performance.now(); let arrived = 0, fired = false;
    const cols = colours.map(rgb).concat(['255,255,255']);
    for (let i = 0; i < n; i++) {
      const sx = r.x + Math.random() * r.w, sy = r.y + Math.random() * r.h;
      const tx = orb.x + rnd(-40, 40) * orb.s, ty = orb.y + rnd(-40, 40) * orb.s;
      parts.push({ sx, sy, tx, ty, mx: (sx + tx) / 2 + rnd(-110, 110), my: (sy + ty) / 2 + rnd(-90, 40), t0: t0 + rnd(0, 200), dur: rnd(600, 920), r: rnd(1.3, 2.8),
        c: cols[i % cols.length], done: () => { arrived++; if (!fired && arrived > n * 0.4) { fired = true; onArrive && onArrive(); } } });
    }
    setTimeout(() => { if (!fired) { fired = true; onArrive && onArrive(); } }, 1300);
  }
  // A stream of particles from the character to a point; onLand fires as the bulk settles
  function stream(to, k, onLand) {
    const n = 120, t0 = performance.now(); let arrived = 0, fired = false;
    const cols = ['247,131,172', '214,51,108', '255,158,187', '127,163,255', '31,91,224', '247,131,172'];
    const bend = (k % 2 ? 1 : -1) * rnd(40, 90);
    const fire = () => { if (!fired) { fired = true; onLand(); } };
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, rr = Math.sqrt(Math.random()) * 46 * orb.s / 0.56;
      const sx = orb.x + Math.cos(a) * rr, sy = orb.y + Math.sin(a) * rr * 0.9;
      const tx = to.x + rnd(-3, 3), ty = to.y + rnd(-3, 3);
      const dx = tx - sx, dy = ty - sy, len = Math.hypot(dx, dy) || 1, px = -dy / len, py = dx / len, off = bend + rnd(-28, 28);
      parts.push({ sx, sy, tx, ty, mx: (sx + tx) / 2 + px * off, my: (sy + ty) / 2 + py * off, t0: t0 + rnd(0, 260), dur: rnd(560, 860), r: rnd(1.4, 3.4), trail: true,
        c: cols[i % cols.length], done: () => { arrived++; if (arrived > n * 0.45) fire(); } });
    }
    setTimeout(fire, 1250);
  }
  function sparks(x, y, colours, n = 16, spread = 30) {
    if (INSTANT) return;
    const t0 = performance.now(), cols = colours.map(rgb);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + rnd(-0.2, 0.2), d = rnd(spread * 0.6, spread);
      parts.push({ spark: true, sx: x, sy: y, tx: x + Math.cos(a) * d, ty: y + Math.sin(a) * d, t0, dur: rnd(420, 640), r: rnd(1, 2.1), c: cols[i % cols.length], done() {} });
    }
  }
  function fxLoop(now) {
    requestAnimationFrame(fxLoop);
    if (!parts.length && !comet) { if (fxDirty) { fg.setTransform(1, 0, 0, 1, 0, 0); fg.clearRect(0, 0, $.fx.width, $.fx.height); fxDirty = false; } return; }
    fxDirty = true;
    fg.setTransform(DPR, 0, 0, DPR, 0, 0); fg.clearRect(0, 0, W, H);
    if (comet) comet.tick(now);
    parts = parts.filter((p) => {
      const k = (now - p.t0) / p.dur; if (k < 0) return true;
      if (k >= 1) { p.done(); return false; }
      let x, y, a, s;
      if (p.spark) {
        const e = 1 - Math.pow(1 - k, 3); x = p.sx + (p.tx - p.sx) * e; y = p.sy + (p.ty - p.sy) * e; a = 1 - k; s = p.r * 5;
      } else {
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, u = 1 - e;
        x = u * u * p.sx + 2 * u * e * p.mx + e * e * p.tx; y = u * u * p.sy + 2 * u * e * p.my + e * e * p.ty;
        a = Math.min(1, k * 8, (1 - k) * 3); s = p.r * 5 * (1 - k * 0.45);
        if (p.trail && k > 0.06) { // a short motion streak behind each particle
          const k2 = k - 0.06, e2 = k2 < 0.5 ? 2 * k2 * k2 : 1 - Math.pow(-2 * k2 + 2, 2) / 2, u2 = 1 - e2;
          const x2 = u2 * u2 * p.sx + 2 * u2 * e2 * p.mx + e2 * e2 * p.tx, y2 = u2 * u2 * p.sy + 2 * u2 * e2 * p.my + e2 * e2 * p.ty;
          fg.globalAlpha = a * 0.35; fg.drawImage(sprite(p.c), (x + x2) / 2 - s * 0.4, (y + y2) / 2 - s * 0.4, s * 0.8, s * 0.8);
          fg.globalAlpha = a * 0.18; fg.drawImage(sprite(p.c), x2 - s * 0.35, y2 - s * 0.35, s * 0.7, s * 0.7);
        }
      }
      fg.globalAlpha = a; fg.drawImage(sprite(p.c), x - s / 2, y - s / 2, s, s);
      return true;
    });
    if (comet && comet.head) {
      const { x, y } = comet.head; fg.globalAlpha = 1;
      fg.drawImage(sprite('255,190,210'), x - 22, y - 22, 44, 44); fg.drawImage(sprite('255,255,255'), x - 9, y - 9, 18, 18);
    }
    fg.globalAlpha = 1;
  }

  // ---------- Shared UI pieces ----------
  function setCta(label, enabled, show = true) {
    $.cta.classList.toggle('hide', !show);
    if (label != null) $.btnLabel.textContent = label;
    $.btn.disabled = !enabled; $.btn.classList.toggle('glow', !!enabled);
  }
  function bar(p) { $.barFill.style.width = p + '%'; $.bar.setAttribute('aria-valuenow', p); }
  function setHead(text, top) {
    if (top != null) $.head.style.top = top + 'px';
    if ($.head.dataset.t !== text) { $.head.dataset.t = text; $.head.innerHTML = `<span class="ob-swap">${esc(text)}</span>`; }
  }
  function setExplain(text, strong) { $.explain.innerHTML = `<span class="ob-swap">${esc(text)}</span>`; $.explain.classList.toggle('strong', !!strong); }
  function setCallout(eyebrow, text) {
    $.ceb.textContent = eyebrow;
    if ($.ctx.dataset.t !== text) { $.ctx.dataset.t = text; $.ctx.innerHTML = `<span class="ob-swap">${esc(text)}</span>`; }
  }
  function leaveOptions() {
    if (!$.opts.children.length) return;
    $.opts.classList.add('leave'); const old = $.opts.innerHTML;
    setTimeout(() => { if ($.opts.innerHTML === old) $.opts.innerHTML = ''; }, 300);
  }
  function renderOpts(list, key, onPick) {
    $.opts.classList.remove('leave'); $.opts.dataset.key = key;
    $.opts.setAttribute('aria-label', { style: 'How you like to learn', goal: 'What you want from this', span: 'How much time you have' }[key]);
    $.opts.innerHTML = list.map((o, k) => `<button type="button" class="ob-opt" role="radio" data-v="${o.id}" aria-checked="${st[key] === o.id}" style="animation-delay:${80 + k * 50}ms">
      <span class="ob-ic">${o.icon}</span><span class="ob-ot"><b>${esc(o.label)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span></button>`).join('');
    $.opts.querySelectorAll('.ob-opt').forEach((b) => b.addEventListener('click', () => {
      if (st.busy) return;
      $.opts.querySelectorAll('.ob-opt').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      b.classList.remove('flare'); void b.offsetWidth; b.classList.add('flare');
      st[key] = b.dataset.v; onPick(b.dataset.v, b);
    }));
  }
  const topicLabel = () => (st.topic || 'How the human heart works').trim();
  const isHeart = (t) => /heart|cardi|pulse|blood|beat/i.test(t || '');
  const stopsFor = (goal, span) => courseRoadmap(COURSES.heart, goal || 'how', span || 'twoweeks');
  const lessonCount = (stops) => stops.filter((s) => s.kind === 'lesson').length;

  // ---------- Scenes ----------
  function dark(on) {
    root.classList.toggle('ob-dark', on);
    const scr = document.getElementById('screen'); if (scr) scr.classList.toggle('is-dark', on);
    Brain.setDark(on); if (!on) fieldOn = false;
  }
  // Show only what a scene asks for
  function ui(o) {
    $.skip.classList.toggle('on', !!o.skip);
    $.scrim.classList.toggle('on', !!o.scrim);
    $.tap.classList.remove('on'); $.hint.classList.remove('on');
    $.aurora.classList.toggle('on', !!o.aurora); $.aurora.classList.toggle('build', !!o.build);
    $.qtop.classList.toggle('on', !!o.q);
    $.head.classList.toggle('on', !!o.head);
    $.callout.classList.toggle('on', !!o.callout);
    $.explain.classList.toggle('on', !!o.explain);
    $.ask.classList.toggle('on', !!o.ask); $.ask.classList.remove('sent');
    $.daily.classList.toggle('on', !!o.daily);
    if (!o.opts) leaveOptions();
    if (!o.build) clearBuild();
    if (!o.cta) setCta(null, false, false);
    if (!o.line) { setLine(''); setSub(''); }
    if (!o.ask) $.input.blur();
    root.classList.toggle('ob-trailer', st.scene <= 2);
  }

  const SCENES = [
    { // 0 · Your brain asks millions
      enter() {
        dark(true); ui({ skip: true, line: true }); fieldHide(); Brain.setSpin(false); Brain.setMode('idle');
        place(184, 340, 0.95, { snap: true }); Brain.form();
        later(() => setLine('Every single day, your brain asks millions of questions.', 536), 450);
        auto(() => go(1), 3900);
      },
    },
    { // 1 · A world of questions (no headline)
      enter() {
        dark(true); ui({ skip: true, scrim: true }); Brain.setSpin(false);
        place(184, 340, 0.95, { snap: true });
        requestAnimationFrame(() => requestAnimationFrame(() => { place(184, 380, 9, { zoom: true, hidden: true }); Brain.scatter(1500); }));
        later(fieldStart, 380);
        later(() => $.tap.classList.add('on'), 1300);
        auto(() => go(2), 5600);
      },
    },
    { // 2 · What if…
      enter() {
        dark(true); ui({ skip: true, line: true }); Brain.setSpin(false);
        fieldCollapse();
        place(184, 350, 0.2, { snap: true, hidden: true });
        later(() => { place(184, 350, 0.95); Brain.form(); }, 380);
        later(() => setLine('What if you could capture, learn and play with every question?', 548), 220);
        later(() => $.hint.classList.add('on'), 2000);
        auto(() => go(3), 5400);
      },
    },
    { // 3 · Welcome to Cortex
      enter() {
        fieldHide(); dark(false); ui({ line: true, cta: true, aurora: true });
        Brain.setMode('idle'); place(184, 318, 1); Brain.setShape('brain', 'cobalt', 900); Brain.setSpin(true);
        setLine('Welcome to Cortex', 528);
        later(() => setSub('Learn anything. See it, play with it, and make it stick.', 578), 600);
        setCta('Get started', false);
        later(() => setCta('Get started', true), 800);
      },
      next() { go(4); },
    },
    { // 4 · How do you like to learn?
      enter() {
        dark(false); ui({ q: true, head: true, opts: true, explain: true, cta: true }); Brain.setSpin(false); Brain.setMode('idle');
        place(184, 290, 0.9); bar(25);
        const s = STYLES.find((x) => x.id === st.style);
        Brain.setShape(s ? s.shape : 'brain', 'cobalt', 1100);
        setHead('How do you like to learn?', 116);
        setExplain(s ? s.line : 'Pick one. You can change it any time.', !!s);
        later(() => renderOpts(STYLES.map((x) => ({ ...x, icon: glyph(x.shape, gradColour(x.grad)) })), 'style', (v, b) => {
          const sty = STYLES.find((x) => x.id === v);
          setExplain(sty.line, true); setCta('Continue', true);
          if (window.Store) Store.set({ style: v });
          burst(relRect(b), sty.grad, () => { Brain.setShape(sty.shape, 'cobalt', 1000); Brain.pulse(); });
        }), 260);
        setCta('Continue', !!st.style);
      },
      next() { go(5); }, back() { go(3); },
    },
    { // 5 · What do you want to learn?
      enter() {
        dark(false); ui({ q: true, head: true, ask: true, cta: true }); Brain.setSpin(false);
        place(184, 178, 0.48); Brain.setShape('brain', 'cobalt', 1100); bar(50);
        setHead('What do you want to learn?', 258);
        $.input.value = st.topic || ''; renderSuggs();
        const has = !!$.input.value.trim(); setCta('Build my course', has);
        Brain.setMode(has ? 'listen' : 'idle');
        later(() => { if (st.scene === 5) $.input.focus({ preventScroll: true }); }, INSTANT ? 0 : 520);
      },
      next() { commitTopic(); }, back() { Brain.setMode('idle'); go(4); },
    },
    { // 6 · Goal
      enter() {
        dark(false); ui({ q: true, callout: true, opts: true, cta: true }); Brain.setSpin(false); Brain.setMode('idle');
        place(70, 158, 0.36); bar(75);
        Brain.setShape(GOAL_SHAPE[st.goal] || 'heart', 'body', 1100);
        setCallout(`For “${topicLabel()}”`, 'What do you most want from this?');
        later(() => renderOpts(COURSES.heart.goals.map((g) => ({ ...g, icon: glyph(GOAL_SHAPE[g.id], bodyColour) })), 'goal', (v, b) => {
          setCta('Continue', true);
          burst(relRect(b), BODY, () => { Brain.setShape(GOAL_SHAPE[v], 'body', 1000); Brain.pulse(); });
        }), 260);
        setCta('Continue', !!st.goal);
      },
      next() { go(7); }, back() { go(5); },
    },
    { // 7 · Time
      enter() {
        dark(false); ui({ q: true, callout: true, opts: true, daily: true, cta: true }); Brain.setSpin(false); Brain.setMode('idle');
        place(70, 158, 0.36); bar(100);
        Brain.setShape('heart', 'body', 1100);
        setCallout(`For “${topicLabel()}”`, 'How much time do you have?');
        later(() => renderOpts(COURSES.heart.spans.map((s) => {
          const n = lessonCount(stopsFor(st.goal, s.id));
          return { id: s.id, label: s.label, sub: `${n} lessons, then a final challenge`, icon: `<span class="ob-num">${n}</span>` };
        }), 'span', (v, b) => {
          timeValid(); burst(relRect(b), BODY, () => { Brain.setShape('heart', 'body', 600); Brain.pulse(); });
        }), 260);
        renderDaily(); timeValid();
      },
      next() { go(8); }, back() { go(6); },
    },
    { // 8 · The course builds itself
      enter() {
        dark(false); ui({ aurora: true, build: true }); Brain.setSpin(false);
        runBuild();
      },
      next() { finish(); },
    },
  ];
  function timeValid() { setCta('Build it', !!(st.span && st.daily)); }

  // ---------- What do you want to learn? ----------
  let listenT = 0;
  function wireTopic() {
    $.input.addEventListener('input', () => {
      st.topic = $.input.value;
      const has = !!$.input.value.trim();
      setCta('Build my course', has);
      Brain.setMode('listen'); Brain.pulse();
      clearTimeout(listenT); listenT = setTimeout(() => { if (st.scene === 5 && !$.input.value.trim()) Brain.setMode('idle'); }, 1200);
    });
    $.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if ($.input.value.trim() && !st.busy) commitTopic(); }
    });
    $.input.addEventListener('focus', () => { if (st.scene === 5) Brain.setMode('listen'); });
  }
  function renderSuggs() {
    const list = window.TOPIC_SUGGESTIONS || [];
    $.suggs.innerHTML = list.map((t, k) => `<button type="button" class="ob-sugg" style="animation-delay:${200 + k * 40}ms">${esc(t)}</button>`).join('');
    packChips(); if (document.fonts) document.fonts.ready.then(packChips);
    $.suggs.querySelectorAll('.ob-sugg').forEach((b) => b.addEventListener('click', () => {
      if (st.busy) return;
      $.input.value = b.textContent; st.topic = b.textContent;
      $.input.dispatchEvent(new Event('input')); $.input.focus({ preventScroll: true });
      $.field.classList.remove('flare'); void $.field.offsetWidth; $.field.classList.add('flare');
    }));
  }
  // Pack the suggestion chips into as few rows as possible (first fit, widest first)
  function packChips() {
    const chips = [...$.suggs.children], cap = $.suggs.clientWidth || W - 36, gap = 8;
    if (!chips.length || !cap) return;
    const rows = [];
    chips.map((c) => ({ c, w: c.offsetWidth })).sort((a, b) => b.w - a.w).forEach((it) => {
      const row = rows.find((r) => r.w + gap + it.w <= cap);
      if (row) { row.items.push(it); row.w += gap + it.w; } else rows.push({ w: it.w, items: [it] });
    });
    let o = 0; rows.forEach((r) => r.items.forEach((it) => { it.c.style.order = o; it.c.style.animationDelay = 200 + o * 40 + 'ms'; o++; }));
  }
  function commitTopic() {
    const t = $.input.value.trim(); if (!t) return;
    st.topic = t; st.busy = true; setCta('Build my course', false); $.btn.classList.add('busy');
    $.input.blur(); $.ask.classList.add('sent');
    setHead('Got it. Let’s shape it.', 258);
    Brain.setMode('idle');
    burst(relRect($.field), ['#7FA3FF', '#1F5BE0', ...BODY], () => { Brain.setShape('heart', 'body', 1300); Brain.pulse(); });
    later(() => { st.busy = false; $.btn.classList.remove('busy'); go(6); }, INSTANT ? 0 : 1500);
  }

  // ---------- Daily minutes ----------
  function renderDaily() {
    $.chips.innerHTML = COURSES.heart.daily.map((d) => `<button type="button" class="ob-chip" role="radio" aria-checked="${st.daily === d}" data-v="${esc(d)}">${esc(d.replace(' a day', ''))}</button>`).join('');
    $.chips.querySelectorAll('.ob-chip').forEach((b) => b.addEventListener('click', () => {
      st.daily = b.dataset.v;
      $.chips.querySelectorAll('.ob-chip').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      Brain.pulse(); timeValid();
    }));
  }

  // ---------- THE BUILD: particles stream out and settle into the roadmap ----------
  const Y0 = 258, Y1 = 664;
  const LAYOUTS = {
    // One long winding path, labels to the open side
    roadmap(stops) {
      const n = stops.length, nodes = stops.map((s, k) => {
        const y = Y0 + (k * (Y1 - Y0)) / (n - 1), x = 184 + 82 * Math.sin(k * 1.05 + 0.3);
        const side = x >= 184 ? 'l' : 'r', w = side === 'l' ? x - 24 - 16 : W - 16 - (x + 24);
        return { x, y, side, w };
      });
      const edges = nodes.slice(1).map((b, i) => [i, i + 1, curve(nodes[i], b)]);
      return { nodes, edges, isles: [], spine: true };
    },
    // A branching map: rows that link to each other, labels as chips
    connect(stops) {
      const n = stops.length, rows = [1]; let left = n - 2;
      while (left > 0) { if (left === 1) { rows.push(1); left = 0; } else { rows.push(2); left -= 2; } }
      rows.push(1);
      const OFF = [[-4, 4], [6, -6], [-6, 6], [4, -4]], gap = (Y1 - 30 - Y0) / (rows.length - 1);
      const nodes = [], rowOf = [];
      rows.forEach((c, r) => {
        const y = Y0 + r * gap;
        if (c === 1) { nodes.push({ x: 184, y, side: 'b', w: 200 }); rowOf.push([nodes.length - 1]); }
        else { const o = OFF[r % 4]; nodes.push({ x: 94 + o[0], y, side: 'b', w: 160 }); nodes.push({ x: 274 + o[1], y, side: 'b', w: 160 }); rowOf.push([nodes.length - 2, nodes.length - 1]); }
      });
      const edges = [];
      for (let r = 1; r < rowOf.length; r++) {
        const A = rowOf[r - 1], B = rowOf[r];
        if (A.length === 2 && B.length === 2) { edges.push([A[0], B[0]], [A[1], B[1]], r % 2 ? [A[0], B[1]] : [A[1], B[0]]); }
        else A.forEach((a) => B.forEach((b) => edges.push([a, b])));
        if (B.length === 2 && r % 2 === 0) edges.push([B[0], B[1]]);
      }
      return { nodes, edges: edges.map(([a, b]) => [Math.min(a, b), Math.max(a, b), line(nodes[a], nodes[b])]), isles: [] };
    },
    // Separate short clusters: islands of two bites
    quick(stops) {
      const n = stops.length, groups = [];
      for (let i = 0; i < n; i += 2) groups.push(stops.slice(i, i + 2).map((_, j) => i + j));
      if (groups.length > 1 && groups[groups.length - 1].length === 1) groups[groups.length - 2].push(groups.pop()[0]);
      const G = groups.length, step = G > 1 ? (Y1 - Y0 - 36) / (G - 1) : 0, nodes = [], edges = [], isles = [];
      groups.forEach((g, i) => {
        const m = g.length, cy = Y0 + 10 + i * step, cx = m === 3 ? 184 : i % 2 ? 228 : 140, wide = (m - 1) * 112 + 120;
        g.forEach((idx, j) => { nodes[idx] = { x: cx + (j - (m - 1) / 2) * 112, y: cy - 12, side: 'b', w: 108 }; });
        for (let j = 1; j < m; j++) edges.push([g[j - 1], g[j], line(nodes[g[j - 1]], nodes[g[j]])]);
        isles.push({ x: cx - wide / 2, y: cy - 42, w: wide, h: 84, members: g });
      });
      return { nodes, edges, isles };
    },
  };
  function curve(a, b) { const dy = b.y - a.y; return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}C${a.x.toFixed(1)} ${(a.y + dy * 0.55).toFixed(1)} ${b.x.toFixed(1)} ${(b.y - dy * 0.55).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`; }
  function line(a, b) { return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`; }

  const ICON_CHECK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_HEART = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.4C.9 8 3 4.5 6.6 4.5c2.2 0 3.8 1.2 5.4 3.1 1.6-1.9 3.2-3.1 5.4-3.1 3.6 0 5.7 3.5 4.2 7.1C19.5 16.4 12 21 12 21z"/></svg>';

  let B = null; // the current build
  function clearBuild() {
    if (!B) return;
    B = null; comet = null;
    $.map.innerHTML = ''; $.stops.innerHTML = ''; $.card.classList.remove('on'); $.narr.classList.remove('on'); $.fine.classList.remove('on');
    root.classList.remove('ob-building', 'ob-built');
  }
  function runBuild() {
    clearBuild(); parts = [];
    const style = st.style || 'connect', stops = stopsFor(st.goal, st.span), n = stops.length, L = LAYOUTS[style](stops);
    const nLessons = lessonCount(stops);
    B = { style, stops, L, n, landed: 0 };
    root.classList.add('ob-building'); root.dataset.style = style;

    // Edges: a faint base that draws as stops land, and a lit copy for the end-to-end glow
    const spineD = L.spine ? L.edges.map((e, i) => (i ? e[2].replace(/^M[^C]+/, '') : e[2])).join('') : '';
    $.map.innerHTML = `<defs><linearGradient id="obLit" gradientUnits="userSpaceOnUse" x1="0" y1="${Y0}" x2="0" y2="${Y1}"><stop offset="0" stop-color="#F783AC"/><stop offset=".5" stop-color="#C04AA0"/><stop offset="1" stop-color="#1F5BE0"/></linearGradient></defs>` +
      L.edges.map((e, i) => `<path class="ob-e" data-i="${i}" d="${e[2]}" pathLength="1"/>`).join('') +
      (L.spine ? `<path class="ob-el ob-spine" d="${spineD}" pathLength="1"/>` : L.edges.map((e, i) => `<path class="ob-el" data-i="${i}" d="${e[2]}" pathLength="1"/>`).join(''));

    let num = 0;
    $.stops.innerHTML = L.isles.map((s, i) => `<div class="ob-isle" data-i="${i}" style="left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px"></div>`).join('') +
      stops.map((s, k) => {
        const nd = L.nodes[k], inner = s.kind === 'lesson' ? `<span>${++num}</span>` : s.kind === 'review' ? ICON_CHECK : ICON_HEART;
        const pos = nd.side === 'b' ? `left:${-nd.w / 2}px;width:${nd.w}px` : nd.side === 'l' ? `right:24px;width:${nd.w}px` : `left:24px;width:${nd.w}px`;
        return `<div class="ob-stop ob-k-${s.kind} ob-s-${nd.side}" role="listitem" data-k="${k}" style="left:${nd.x.toFixed(1)}px;top:${nd.y.toFixed(1)}px">
          <i class="ob-dot">${inner}</i><span class="ob-lab" style="${pos}">${style === 'connect' ? `<span class="ob-chiplab">${esc(s.title)}</span>` : esc(s.title)}</span></div>`;
      }).join('');

    const span = COURSES.heart.spans.find((s) => s.id === st.span) || COURSES.heart.spans[1];
    $.card.innerHTML = `<p class="ob-card-eb">Your course</p><h2>${esc(COURSES.heart.title)}</h2><p class="ob-card-meta">${nLessons} lessons · ${esc(st.daily || '10 min a day')}</p>`;
    $.fine.textContent = isHeart(st.topic) ? `Made for you · ${span.label.toLowerCase()} · ${COURSES.heart.goals.find((g) => g.id === (st.goal || 'how')).label.toLowerCase()}` : 'Here’s a sample course while we’re in prototype';
    setCta('Start learning', false, false);

    if (INSTANT) { // final state, no motion
      Brain.setShape('heart', 'body', 10); Brain.setMode('idle');
      $.stops.querySelectorAll('.ob-stop, .ob-isle').forEach((el) => el.classList.add('in', 'lit'));
      $.map.querySelectorAll('path').forEach((p) => { p.classList.add('on'); if (p.classList.contains('ob-spine')) p.style.strokeDashoffset = 0; });
      reveal(); return;
    }

    Brain.setShape('heart', 'body', 900); Brain.setMode('idle'); place(184, 150, 0.56);
    const LINE2 = { roadmap: 'Ordering them so each builds on the last…', connect: 'Linking them so you can explore…', quick: 'Cutting them into quick bites…' }[style];
    const k1 = Math.round(n * 0.36), k2 = Math.round(n * 0.72);
    $.narrFill.style.width = '0%';
    later(() => { $.narr.classList.add('on'); narrate(`Picking the ${nLessons} ideas that matter for you…`); }, 250);
    const gap = Math.max(380, Math.min(560, 4300 / n)), T0 = 750;
    stops.forEach((s, k) => later(() => {
      if (k === k1) narrate(LINE2);
      if (k === k2) narrate('Adding quick checks…');
      if (k % 2 === 0) Brain.pulse();
      stream(L.nodes[k], k, () => land(k));
    }, T0 + k * gap));
    const tEnd = T0 + (n - 1) * gap + 1050;
    later(() => { narrate('Lighting up your path…'); lightUp(); }, tEnd);
    later(reveal, tEnd + (L.spine ? 1500 : n * 110 + 600));
  }
  function narrate(text) { $.narrTxt.innerHTML = `<span class="ob-swap">${esc(text)}</span>`; }
  function land(k) {
    if (!B) return;
    const el = $.stops.querySelector(`.ob-stop[data-k="${k}"]`); if (!el || el.classList.contains('in')) return;
    el.classList.add('in'); B.landed++;
    $.narrFill.style.width = (B.landed / B.n) * 100 + '%';
    B.L.edges.forEach((e, i) => { if (e[1] === k) { const p = $.map.querySelector(`.ob-e[data-i="${i}"]`); p && p.classList.add('on'); } });
    B.L.isles.forEach((s, i) => { if (s.members[0] === k) $.stops.querySelector(`.ob-isle[data-i="${i}"]`).classList.add('in'); });
    const nd = B.L.nodes[k], kind = B.stops[k].kind;
    sparks(nd.x, nd.y, kind === 'review' ? ['#7FA3FF', '#1F5BE0'] : kind === 'final' ? ['#F783AC', '#7FA3FF', '#FFFFFF'] : BODY, kind === 'final' ? 26 : 16, kind === 'final' ? 44 : 30);
  }
  // The path lights up end to end
  function lightUp() {
    if (!B) return;
    const nodes = [...$.stops.querySelectorAll('.ob-stop')];
    nodes.forEach((el) => el.classList.add('in'));
    $.map.querySelectorAll('.ob-e').forEach((p) => p.classList.add('on'));
    if (B.L.spine) {
      const spine = $.map.querySelector('.ob-spine'), total = spine.getTotalLength();
      const segs = [...$.map.querySelectorAll('.ob-e')].map((p) => p.getTotalLength());
      const at = [0]; segs.forEach((l, i) => at.push(at[i] + l));
      const dur = 1300, t0 = performance.now(); let lit = -1;
      spine.classList.add('on');
      comet = {
        head: null,
        tick(now) {
          const p = Math.min(1, (now - t0) / dur), e = ease(p), len = e * total, pt = spine.getPointAtLength(len);
          comet.head = { x: pt.x, y: pt.y }; spine.style.strokeDashoffset = 1 - e;
          for (let i = 0; i < 3; i++) parts.push({ spark: true, sx: pt.x, sy: pt.y, tx: pt.x + rnd(-14, 14), ty: pt.y + rnd(-14, 14), t0: now, dur: rnd(360, 620), r: rnd(0.9, 1.8), c: i % 2 ? '247,131,172' : '127,163,255', done() {} });
          while (lit + 1 < nodes.length && at[lit + 1] <= len + 1) { lit++; nodes[lit].classList.add('lit'); }
          if (p >= 1) { nodes.forEach((el) => el.classList.add('lit')); comet = null; sparks(B.L.nodes[B.n - 1].x, B.L.nodes[B.n - 1].y, ['#F783AC', '#7FA3FF', '#FFFFFF'], 30, 56); Brain.pulse(); }
        },
      };
    } else {
      const lits = [...$.map.querySelectorAll('.ob-el')];
      nodes.forEach((el, k) => later(() => {
        el.classList.add('lit');
        B && B.L.isles.forEach((s, i) => { if (s.members[0] === k) $.stops.querySelector(`.ob-isle[data-i="${i}"]`).classList.add('lit'); });
        B && B.L.edges.forEach((e, i) => { if (e[1] === k) lits[i].classList.add('on'); });
        if (k === nodes.length - 1 && B) { sparks(B.L.nodes[k].x, B.L.nodes[k].y, ['#F783AC', '#7FA3FF', '#FFFFFF'], 30, 56); Brain.pulse(); }
      }, k * 110));
    }
  }
  // Title card: the character glides into it and becomes the course icon
  function reveal() {
    if (!B) return;
    root.classList.add('ob-built');
    $.narr.classList.remove('on'); $.card.classList.add('on'); $.fine.classList.add('on');
    Brain.setMode('idle'); place(62, 128, 0.25); Brain.pulse();
    setCta('Start learning', false);
    later(() => setCta('Start learning', true), INSTANT ? 0 : 450);
  }
  function finish() {
    st.busy = true; root.classList.add('ob-leave');
    const payload = { style: st.style || 'connect', topic: topicLabel(), goal: st.goal || 'how', span: st.span || 'twoweeks', daily: st.daily || '10 min a day' };
    setTimeout(() => {
      st.busy = false; timers.forEach(clearTimeout); timers = []; comet = null; parts = [];
      Brain.setMode('idle'); Brain.setSpin(false); Brain.setDark(false);
      Bus.emit('onboarding:done', payload);
    }, INSTANT ? 0 : 280);
  }

  // ---------- Engine ----------
  function go(i) {
    if (i < 0 || i >= SCENES.length) return;
    timers.forEach(clearTimeout); timers = []; st.busy = false; $.btn.classList.remove('busy');
    const scr = document.getElementById('screen'); if (scr) scr.scrollTop = 0;
    st.scene = i; SCENES[i].enter();
    if (window.Bus) Bus.emit('onboarding:step', { index: STEP_OF_SCENE[i] });
  }
  function start(step) {
    if (!mounted) return;
    step = Math.max(0, Math.min(STEPS.length - 1, parseInt(step, 10) || 0));
    root.classList.remove('ob-leave');
    Brain.moveTo($.brain);
    if (step === 0) Object.assign(st, { style: null, topic: '', goal: null, span: null, daily: '10 min a day' });
    const S = (window.Store && Store.get()) || {};
    if (step === 2 && !st.style) st.style = P.get('style') || null;
    if (step >= 3) st.style = st.style || S.style || 'connect';
    if (step >= 4) st.topic = (st.topic || '').trim() || 'How the human heart works';
    if (step >= 5) st.goal = st.goal || S.goal || 'how';
    if (step >= 6) st.span = st.span || S.span || 'twoweeks';
    st.daily = st.daily || '10 min a day';
    go(SCENE_OF_STEP[step]);
  }

  window.Onboarding = { mount, start, steps: STEPS, index: () => STEP_OF_SCENE[st.scene] };
})();
