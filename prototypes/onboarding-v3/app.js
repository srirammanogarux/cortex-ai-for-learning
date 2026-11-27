(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search), STILL = params.has('still');
  if (STILL) document.documentElement.classList.add('still');
  const W = 368, H = 822;

  const screen = $('screen'), night = $('night'), space = $('space'), wrap = $('brainWrap'), hint = $('touchHint');
  const scrim = $('scrim'), tline = $('tline'), tsub = $('tsub'), tap = $('tap'), aurora = $('aurora');
  const qtop = $('qtop'), barFill = $('barFill'), callout = $('callout'), calloutTxt = $('calloutTxt');
  const opts = $('opts'), ponder = $('ponder'), cta = $('cta'), ctaBtn = $('ctaBtn'), ctaLabel = $('ctaLabel'), endA = $('endA');
  Brain.mount($('brain')); Brain.setDark(true);
  if (STILL) setInterval(() => Brain.snap(), 150);

  let PS = 1, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, STILL ? Math.min(ms, 20) : ms));
  const auto = (fn, ms) => { if (!STILL) later(fn, ms); };
  window.PARTB_READY = true;
  const st = { i: 0, goal: null, role: null };

  // ---------- Brain placement ----------
  let orb = { x: 184, y: 360, s: 0.95 };
  function place(x, y, s, o = {}) {
    orb = { x, y, s };
    wrap.classList.toggle('zoom', !!o.zoom); wrap.classList.toggle('snap', !!o.snap);
    wrap.style.transform = `translate(${x - 160}px, ${y - 160}px) scale(${s})`;
    wrap.style.opacity = o.hidden ? 0 : 1; wrap.style.pointerEvents = o.hidden ? 'none' : 'auto';
    hint.style.top = y + 160 * s + 6 + 'px';
  }

  // ---------- Lines that build word by word ----------
  function setLine(text, top) {
    if (top != null) tline.style.top = top + 'px';
    const write = () => {
      tline.classList.remove('out');
      tline.innerHTML = text ? text.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ') : '';
      [...tline.children].forEach((w, k) => setTimeout(() => w.classList.add('on'), STILL ? 0 : 60 + k * 55));
    };
    if (tline.children.length) { tline.classList.add('out'); setTimeout(write, STILL ? 0 : 380); } else write();
  }
  function setSub(text, top) { tsub.style.top = top + 'px'; tsub.textContent = text || ''; tsub.classList.toggle('on', !!text); }

  // ---------- Orb space (screen 1) ----------
  const IMGS = ['phone', 'whale', 'rocket', 'coffee', 'chart', 'bulb', 'city', 'slots', 'brain', 'hourglass'];
  const PILLS = ['Why do I keep checking my phone?', 'How do whales sleep?', 'Will AI take my job?', 'Why do launches flop?', 'What’s inside a black hole?', 'Why does coffee wake me up?', 'How do habits form?', 'Why was Rome so powerful?', 'What makes an idea stick?', 'Why do I forget names?'];
  const items = [];
  const rnd = (a, b) => a + Math.random() * (b - a);
  IMGS.forEach((n) => items.push({ html: `<img src="assets/orb-${n}.jpg" alt="">`, img: true }));
  PILLS.forEach((p) => items.push({ html: `<span class="pill">${p}</span>`, img: false }));
  items.forEach((it, k) => {
    it.el = document.createElement('div'); it.el.className = 't'; it.el.innerHTML = it.html; space.appendChild(it.el);
    reset(it, true, k);
  });
  function reset(it, first, k = 0) {
    const a = Math.random() * 6.283, r = it.img ? rnd(130, 420) : rnd(70, 330);
    it.x = Math.cos(a) * r; it.y = Math.sin(a) * r * 1.5; it.z = first ? -3000 + (k / items.length) * 3000 + rnd(-150, 150) : -3000;
  }
  let fieldOn = false, fieldSpeed = 0, fieldLast = 0;
  function fieldLoop(t) {
    if (!STILL) requestAnimationFrame(fieldLoop);
    const dt = fieldLast ? Math.min(0.05, (t - fieldLast) / 1000) : 0; fieldLast = t;
    if (!fieldOn) return;
    fieldSpeed += (520 - fieldSpeed) * 0.02;
    items.forEach((it) => {
      it.z += fieldSpeed * dt * (it.img ? 1 : 1.15);
      if (it.z > 420) reset(it);
      const near = it.z > 120 ? 1 - (it.z - 120) / 300 : 1, far = Math.min(1, (it.z + 3000) / 900);
      it.el.style.transform = `translate3d(${it.x}px, ${it.y}px, ${it.z}px)`;
      it.el.style.opacity = Math.max(0, Math.min(near, far)).toFixed(3);
    });
  }
  if (!STILL) requestAnimationFrame(fieldLoop);
  if (STILL) setInterval(() => fieldLoop(performance.now()), 40);
  function fieldStart() {
    items.forEach((it, k) => { it.el.style.transition = 'none'; reset(it, true, k); });
    fieldSpeed = 2600; fieldOn = true; space.style.opacity = 1;
    if (STILL) { items.forEach((it, k) => { it.z = -2200 + (k / items.length) * 2400; }); fieldSpeed = 0; }
  }
  function fieldCollapse() {
    fieldOn = false;
    items.forEach((it, k) => {
      it.el.style.transition = `transform 1150ms cubic-bezier(.7,0,.25,1) ${k * 22}ms, opacity 900ms ease-in ${200 + k * 22}ms`;
      it.el.style.transform = 'translate3d(0px, -18px, -260px) scale(.04)'; it.el.style.opacity = 0;
    });
  }
  function fieldHide() { fieldOn = false; items.forEach((it) => { it.el.style.transition = 'opacity 400ms'; it.el.style.opacity = 0; }); }

  // ---------- Particle FX: an option dissolves into the orb ----------
  const fx = $('fx'), fg = fx.getContext('2d'); let parts = [];
  const DPR = Math.min(2, window.devicePixelRatio || 1); fx.width = W * DPR; fx.height = H * DPR;
  function relRect(el) { const a = el.getBoundingClientRect(), b = screen.getBoundingClientRect(); return { x: (a.left - b.left) / PS, y: (a.top - b.top) / PS, w: a.width / PS, h: a.height / PS }; }
  function burst(r, onArrive) {
    const n = Math.round(Math.min(110, Math.max(50, (r.w * r.h) / 140))), t0 = performance.now(); let arrived = 0, fired = false;
    for (let i = 0; i < n; i++) {
      const sx = r.x + Math.random() * r.w, sy = r.y + Math.random() * r.h, tx = orb.x + rnd(-14, 14) * orb.s * 3, ty = orb.y + rnd(-14, 14) * orb.s * 3;
      const mx = (sx + tx) / 2 + rnd(-110, 110), my = (sy + ty) / 2 + rnd(-90, 40);
      parts.push({ sx, sy, tx, ty, mx, my, t0: t0 + rnd(0, 220), dur: rnd(620, 980), r: rnd(1.2, 2.8), c: Math.random() < 0.5 ? '255,255,255' : '127,163,255',
        done: () => { arrived++; if (!fired && arrived > n * 0.45) { fired = true; onArrive && onArrive(); } } });
    }
  }
  function fxLoop(now) {
    if (!STILL) requestAnimationFrame(fxLoop);
  if (STILL) setInterval(() => fxLoop(performance.now()), 30);
    if (!parts.length) return;
    fg.setTransform(DPR, 0, 0, DPR, 0, 0); fg.clearRect(0, 0, W, H);
    parts = parts.filter((p) => {
      const k = (now - p.t0) / p.dur; if (k < 0) return true;
      if (k >= 1) { p.done(); return false; }
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, u = 1 - e;
      const x = u * u * p.sx + 2 * u * e * p.mx + e * e * p.tx, y = u * u * p.sy + 2 * u * e * p.my + e * e * p.ty;
      fg.globalAlpha = Math.min(1, (1 - k) * 2.2); fg.fillStyle = `rgb(${p.c})`;
      fg.shadowColor = 'rgba(31,91,224,.9)'; fg.shadowBlur = 6;
      fg.beginPath(); fg.arc(x, y, p.r * (1 - k * 0.5), 0, 6.283); fg.fill();
      return true;
    });
    if (!parts.length) fg.clearRect(0, 0, W, H);
  }
  if (!STILL) requestAnimationFrame(fxLoop);
  if (STILL) setInterval(() => fxLoop(performance.now()), 30);

  // ---------- Questions data ----------
  // [value, label, icon key in FICONS]. The brain morphs into 'f-<key>' in that icon's own colours.
  const GOALS = [['work', 'Get better at work', 'work'], ['exam', 'Prepare for an exam', 'exam'], ['school', 'Learn something for school', 'school'], ['sharpen', 'Sharpen my mind', 'sharpen'], ['fun', 'Learn for fun', 'fun']];
  const ROLES = [['Engineer', 'Engineer', 'engineer'], ['Student', 'Student', 'student'], ['Business', 'Business', 'business'], ['Product manager', 'Product manager', 'pm'], ['Designer', 'Designer', 'designer'], ['Researcher', 'Researcher', 'researcher'], ['Finance', 'Finance', 'finance'], ['Founder', 'Founder', 'founder'], ['Marketing', 'Marketing', 'marketing'], ['Teacher', 'Teacher', 'teacher'], ['Something else', 'Something else', 'other']];
  const shapeFor = (r) => 'f-' + r[2];
  const PONDER = [
    ['Why do some products become habits?', 98, 200, 156, '#7457E0', '#1F5BE0'],
    ['How do you know a customer really wants it?', 274, 216, 160, '#7E9A2A', '#2A8FC4'],
    ['How do you decide what not to build?', 88, 574, 150, '#E07A57', '#B04AA8'],
    ['Why do most launches flatline in week 2?', 280, 602, 158, '#2A8FC4', '#3F9E52'],
    ['What makes someone actually do something?', 184, 730, 148, '#B04AA8', '#7457E0'],
  ];

  function renderOptions(list, key, grid) {
    opts.classList.remove('leave'); opts.classList.toggle('grid', !!grid);
    opts.setAttribute('aria-label', key === 'goal' ? 'Your main learning goal' : 'What you do');
    opts.innerHTML = list.map(([v, label, ic], k) =>
      `<button class="opt" role="radio" data-v="${v}" aria-pressed="${st[key] === v}" aria-checked="${st[key] === v}" style="animation-delay:${120 + k * 50}ms"><span class="ic">${fillSVG(ic, grid ? 22 : 26)}</span>${label}</button>`).join('');
    opts.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.v, row = list.find((r) => r[0] === v), icon = shapeFor(row);
      opts.querySelectorAll('.opt').forEach((x) => { x.setAttribute('aria-pressed', x === b); x.setAttribute('aria-checked', x === b); });
      b.classList.remove('flare'); void b.offsetWidth; b.classList.add('flare');
      st[key] = v; setCta('Continue', true);
      burst(relRect(b), () => { Brain.setShape(icon, 'cobalt', 1100); Brain.pulse(); });
    }));
  }
  function leaveOptions() { if (opts.children.length) { opts.classList.add('leave'); const old = opts.innerHTML; setTimeout(() => { if (opts.innerHTML === old) opts.innerHTML = ''; }, 330); } }
  function setCallout(text, mode) {
    callout.className = 'callout ' + mode;
    if (text != null) calloutTxt.innerHTML = `<span class="swap">${text}</span>`;
  }
  function setCta(label, enabled, show = true) {
    cta.classList.toggle('hide', !show); ctaLabel.textContent = label; ctaBtn.disabled = !enabled;
    ctaBtn.classList.toggle('glow', !!enabled);
  }
  const bar = (p) => { barFill.style.width = p + '%'; };

  // ---------- Scenes ----------
  function dark(on) { space.style.opacity = on ? 1 : 0; if (!on) fieldOn = false; screen.classList.toggle('is-dark', on); night.style.opacity = on ? 1 : 0; Brain.setDark(on); cta.classList.toggle('on-dark', on); }
  function chrome(o) {
    qtop.style.opacity = o.q ? 1 : 0; qtop.style.pointerEvents = o.q ? 'auto' : 'none';
    aurora.classList.toggle('on', !!o.aurora);
    scrim.style.opacity = o.scrim ? 1 : 0; tap.style.opacity = 0; hint.style.opacity = 0;
    if (!o.callout) callout.classList.add('hide');
    if (!o.opts) leaveOptions();
    if (!o.ponder) clearPonder();
    if (!o.cta) setCta(ctaLabel.textContent, false, false);
    if (!o.line) { setLine(''); setSub(''); }
    endA.classList.remove('on');
  }

  const SCENES = [
    { name: 'Your brain asks millions', enter() {
        dark(true); chrome({ skip: true, line: true }); fieldHide(); Brain.setSpin(false);
        place(184, 350, 0.95, { snap: true }); Brain.form(); setSub('');
        later(() => setLine('Every single day, your brain asks millions of questions.', 548), 700);
        auto(() => go(1), 4600);
      } },
    { name: 'A world of questions', enter() {
        dark(true); chrome({ skip: true, scrim: true }); Brain.setSpin(false);
        place(184, 350, 0.95, { snap: true });
        requestAnimationFrame(() => requestAnimationFrame(() => { place(184, 380, 9, { zoom: true, hidden: true }); Brain.scatter(1600); }));
        later(fieldStart, 500);
        later(() => { tap.style.opacity = 1; }, 1800);
        auto(() => go(2), 7200);
      } },
    { name: 'What if…', enter() {
        dark(true); chrome({ skip: true, line: true }); Brain.setSpin(false);
        fieldCollapse();
        place(184, 360, 0.2, { snap: true, hidden: true });
        later(() => { place(184, 360, 0.95); Brain.form(); }, 450);
        later(() => setLine('What if you could capture, learn and play with every question?', 560), 250);
        later(() => { hint.style.opacity = 1; }, 2200);
        auto(() => go(3), 6200);
      } },
    { name: 'Welcome to Cortex', enter() {
        fieldHide(); dark(false); chrome({ line: true, cta: true, aurora: true });
        place(184, 330, 1); Brain.setShape('brain', 'cobalt', 900); Brain.setSpin(true);
        setLine('Welcome to Cortex', 540);
        later(() => setSub('Explore your curiosity. Learn it, play with it, and put it to use.', 596), 700);
        later(() => setCta('Get started', true), 900);
      },
      next() { go(4); } },
    { name: 'A few quick questions', enter() {
        fieldHide(); dark(false); chrome({ callout: true, q: true });
        Brain.setSpin(false); place(184, 330, 0.9); Brain.setShape('qmark', 'cobalt', 1300); bar(0);
        setCallout('Answer a few quick questions, and you’ll learn something great today.', 'center');
        auto(() => go(5), 3400);
      } },
    { name: 'Main learning goal', enter() {
        dark(false); chrome({ callout: true, q: true, opts: true, cta: true }); Brain.setSpin(false);
        place(66, 150, 0.33);
        const g = GOALS.find((x) => x[0] === st.goal);
        Brain.setShape(g ? shapeFor(g) : 'qmark', 'cobalt', 1100);
        setCallout('What’s your main learning goal?', 'top'); bar(33);
        later(() => renderOptions(GOALS, 'goal'), 350);
        setCta('Continue', !!st.goal);
      },
      next() { go(6); }, back() { go(3); } },
    { name: 'What do you do?', enter() {
        dark(false); chrome({ callout: true, q: true, opts: true, cta: true }); Brain.setSpin(false);
        place(66, 150, 0.33);
        const r = ROLES.find((x) => x[0] === st.role);
        if (r) Brain.setShape(shapeFor(r), 'cobalt', 1100); else if (!st.goal) Brain.setShape('qmark', 'cobalt', 900);
        setCallout('What do you do?', 'top'); bar(66);
        leaveOptions(); later(() => renderOptions(ROLES, 'role', true), 340);
        setCta('Continue', !!st.role);
      },
      next() { go(7); }, back() { go(5); } },
    { name: 'What to ponder', enter() {
        dark(false); chrome({ q: true, ponder: true }); Brain.setSpin(false); bar(100);
        callout.classList.add('hide');
        place(184, 352, 0.25); Brain.setShape('brain', 'cobalt', 1300);
        later(drawPonder, 250);
      },
      back() { go(6); } },
  ];

  // ---------- Pondering orbs ----------
  function clearPonder() { ponder.innerHTML = ''; }
  function drawPonder() {
    ponder.innerHTML = `<p class="key" id="key"><span class="swap">What would be helpful to ponder now?</span></p>` +
      PONDER.map(([q, x, y, d, t1, t2]) => `<button class="porb" style="left:${x}px;top:${y}px;width:${d}px;height:${d}px;--t1:${t1};--t2:${t2}"><span>${q}</span></button>`).join('');
    ponder.querySelectorAll('.porb').forEach((b, k) => {
      setTimeout(() => b.classList.add('in'), STILL ? 0 : 200 + k * 120);
      b.style.animationDelay = `${k * -1.2}s`;
      b.addEventListener('click', () => dive(b));
    });
  }
  function dive(b) {
    if (ponder.dataset.diving) return; ponder.dataset.diving = 1;
    const q = b.textContent;
    ponder.querySelectorAll('.porb').forEach((o) => { if (o !== b) o.classList.add('gone'); });
    $('key').style.opacity = 0; place(orb.x, orb.y, orb.s, { hidden: true });
    qtop.style.opacity = 0;
    b.style.left = '184px'; b.style.top = '411px'; b.classList.add('dive');
    if (/habits/.test(q) && window.PARTB_READY) { auto(() => { location.href = 'partb/'; }, 1150); }
    later(() => {
      endA.innerHTML = `<p class="eb">You chose to ponder</p><h1>${q}</h1>
        <div class="note"><b>This prototype explores one question in full:</b> “Why do some products become habits?”. ${window.PARTB_READY ? 'Pick that orb to continue into Part B.' : 'Part B (the exploration) is being built and will open from here.'}</div>
        ${window.PARTB_READY ? '<a class="btn" href="partb/" style="margin-top:14px;display:grid;place-items:center;text-decoration:none"><span>Open the habits exploration</span></a>' : ''}
        <button class="btn" style="margin-top:10px;background:#EEECF0;color:#141211;box-shadow:none" id="againA"><span>↻ Replay Part A</span></button>`;
      endA.classList.add('on'); $('againA').addEventListener('click', replay);
      delete ponder.dataset.diving;
    }, 1050);
  }

  // ---------- Engine ----------
  function go(i) {
    if (i < 0 || i >= SCENES.length) return;
    timers.forEach(clearTimeout); timers = [];
    st.i = i; SCENES[i].enter();
    renderJump();
    const url = new URL(location); url.searchParams.set('s', i + 1); history.replaceState(null, '', url);
  }
  ctaBtn.addEventListener('click', () => { if (ctaBtn.disabled) return; const s = SCENES[st.i]; if (s.next) s.next(); });
  $('back').addEventListener('click', () => { const s = SCENES[st.i]; if (s.back) s.back(); });
  screen.addEventListener('click', (e) => {
    if (st.i > 2 || e.target.closest('#brain') || e.target.closest('button')) return;
    go(st.i + 1);
  });

  function renderJump() {
    $('jump').innerHTML = SCENES.map((s, k) => `<button data-j="${k}" ${k === st.i ? 'aria-current="step"' : ''}><i>${k + 1}</i>${s.name}</button>`).join('');
    $('jump').querySelectorAll('[data-j]').forEach((b) => b.addEventListener('click', () => {
      const k = +b.dataset.j; if (k >= 6 && !st.goal) st.goal = 'work'; if (k >= 7 && !st.role) st.role = 'Product manager'; go(k);
    }));
  }
  function replay() { Object.assign(st, { goal: null, role: null }); endA.classList.remove('on'); delete ponder.dataset.diving; go(0); }
  $('replay').addEventListener('click', replay);

  function fit() { PS = Math.min(1, (window.innerHeight - 48) / 844); $('phoneWrap').style.transform = `scale(${PS})`; $('phoneHolder').style.width = 390 * PS + 'px'; $('phoneHolder').style.height = 844 * PS + 'px'; }
  window.addEventListener('resize', fit); fit();

  const start = Math.max(0, Math.min(SCENES.length - 1, (parseInt(params.get('s'), 10) || 1) - 1));
  if (start >= 6) st.goal = 'work'; if (start >= 7) st.role = 'Product manager';
  if (params.get('pick') === '1') { st.goal = null; }
  go(start);
  if (params.has('clickopt')) setTimeout(() => { const b = opts.querySelectorAll('.opt')[+params.get('clickopt')]; b && b.click(); }, 800);
})();
