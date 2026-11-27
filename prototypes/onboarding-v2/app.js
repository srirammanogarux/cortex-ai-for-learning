(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search), STILL = params.has('still');
  if (STILL) document.documentElement.classList.add('still');
  const TYPE_NAME = Object.fromEntries(LINK_TYPES);

  const screen = $('screen'), stage = $('stage'), wrap = $('brainWrap'), statusEl = $('status');
  const top = $('top'), back = $('back'), skip = $('skip'), progress = $('progress');
  const cta = $('cta'), ctaBtn = $('ctaBtn'), ubub = $('ubub'), mapviz = $('mapviz'), mapLines = $('mapLines');
  Brain.mount($('brain'));
  if (STILL) setInterval(() => Brain.snap(), 200);

  // ---------- Persistent actor: the brain glides between positions ----------
  const POS = { hero: [184, 330, 1], touch: [184, 360, 1.05], small: [184, 150, 0.42], tiny: [184, 128, 0.3], answer: [184, 262, 0.78], map: [184, 380, 0.33], home: [184, 230, 0.62] };
  function brain(b) {
    const [x, y, s] = POS[b.at];
    wrap.style.transform = `translate(${x - 160}px, ${y - 160}px) scale(${s})`;
    wrap.style.opacity = b.hidden ? 0 : 1; wrap.style.pointerEvents = b.hidden ? 'none' : 'auto';
    statusEl.style.top = y + 160 * s + 6 + 'px';
    if (b.form) Brain.form(); else if (b.shape) Brain.setShape(b.shape, b.palette || 'cobalt', 1500);
    Brain.setMode(b.mode || 'idle'); Brain.setLobes(b.lobes || 0);
  }
  const status = (t) => { statusEl.style.opacity = t ? 1 : 0; if (t) statusEl.textContent = t; };

  // ---------- State ----------
  const st = { i: 0, goal: null, role: null, q: null, touched: false, peek: null };
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, STILL ? Math.min(ms, 30) : ms));
  const toast = (m) => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; t.setAttribute('role', 'status'); screen.appendChild(t); setTimeout(() => t.remove(), 2500); };

  const GOALS = [['work', 'Get better at work', 'Ideas I can use tomorrow', 'Work it is. I’ll use examples you can use tomorrow.'], ['exam', 'Prepare for an exam', 'Understand it, then prove it', 'Exams. I’ll explain it, then check you’ve got it.'], ['school', 'Learn for school', 'Make class make sense', 'School. I’ll make class make sense.'], ['sharpen', 'Sharpen my mind', 'Think clearer, decide better', 'Sharpen it is. Ideas you can think with.'], ['curious', 'Just curious', 'Things that make me go “whoa”', 'Curious. My favourite kind of person.']];
  const ROLES = ['Product manager', 'Engineer', 'Designer', 'Founder', 'Marketing', 'Data & analytics', 'Finance', 'Researcher', 'Teacher', 'Something else'];
  const QS = [['habit', 'The Hook model'], ['mom', 'The Mom Test'], ['notbuild', 'Prioritising'], ['aha', 'Activation'], ['friction', 'Conversion'], ['pmf', 'Product–market fit']];
  const neighbors = (id) => { const out = [], L = GRAPH[id].links; for (const [t] of LINK_TYPES) (L[t] || []).forEach((n) => { if (GRAPH[n] && !out.find((o) => o.id === n)) out.push({ id: n, type: t }); }); return out; };
  const glyph = (id, n = 150) => {
    const g = GRAPH[id], pal = Brain.palette(CLUSTERS[g.cl].palette);
    let s = '<svg viewBox="-1.15 -1.15 2.3 2.3" aria-hidden="true">';
    for (const [x, y, z] of Brain.sample(g.shape, n)) { const c = pal[0].map((v, i) => Math.round(v + (pal[1][i] - v) * z)).join(','); s += `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${(0.026 + 0.03 * z).toFixed(3)}" fill="rgb(${c})" opacity="${(0.35 + 0.65 * z).toFixed(2)}"/>`; }
    return s + '</svg>';
  };

  // ---------- Scenes ----------
  const SCENES = [
    { id: 'open', name: 'Cold open', top: 'skip',
      brain: { at: 'hero', form: true },
      render: () => `<div style="height:540px"></div><p class="line in" data-line></p>`,
      enter(el) {
        const line = el.querySelector('[data-line]');
        const say = (t) => { line.classList.remove('swap'); void line.offsetWidth; line.textContent = t; line.classList.add('swap'); };
        later(() => say('You ask questions all day.'), 900);
        later(() => say('Most of the answers, you forget.'), 2700);
        later(() => say('What if you could see them?'), 4500);
        later(() => go(1), 6600);
      } },
    { id: 'touch', name: 'Touch it',
      brain: { at: 'touch' },
      render: () => `<div style="height:96px"></div><h1 class="h1 center in">Go on. Touch it.</h1><p class="sub center in" data-s>Drag across the brain.</p>`,
      cta: () => ({ label: 'Continue', hidden: !st.touched }),
      enter(el) { if (st.touched) unlockTouch(el); } },
    { id: 'goal', name: 'What brings you here?', top: 'progress', step: 1, scroll: true,
      brain: { at: 'tiny', lobes: 0.2 },
      render: () => `<div style="height:194px"></div><h2 class="h2 in">What brings you here?</h2>
        <p class="${st.goal ? 'reply' : 'sub'} in" data-r>${st.goal ? GOALS.find((g) => g[0] === st.goal)[3] : 'I’ll shape every answer around it.'}</p>
        <div class="opts in" role="radiogroup" aria-label="Your goal">${GOALS.map(([k, a, b]) => `<button class="opt" role="radio" data-k="${k}" aria-pressed="${st.goal === k}" aria-checked="${st.goal === k}"><b>${a}</b><span>${b}</span></button>`).join('')}</div>`,
      cta: () => ({ label: 'Continue', disabled: !st.goal }),
      enter(el) { pick(el, (k) => { st.goal = k; const r = el.querySelector('[data-r]'); r.className = 'reply'; r.textContent = GOALS.find((g) => g[0] === k)[3]; Brain.setLobes(0.3); }); },
      next() { if (st.goal !== 'work') toast('This prototype follows the Work path'); go(3); } },
    { id: 'role', name: 'What do you do?', top: 'progress', step: 2, scroll: true,
      brain: { at: 'tiny', lobes: 0.3 },
      render: () => `<div style="height:194px"></div><h2 class="h2 in">What do you do?</h2>
        <p class="${st.role ? 'reply' : 'sub'} in" data-r>${st.role ? roleReply(st.role) : 'So my examples come from your world.'}</p>
        <div class="opts two in" role="radiogroup" aria-label="Your role">${ROLES.map((r) => `<button class="opt" role="radio" data-k="${r}" aria-pressed="${st.role === r}" aria-checked="${st.role === r}"><b>${r}</b></button>`).join('')}</div>`,
      cta: () => ({ label: 'Continue', disabled: !st.role }),
      enter(el) { pick(el, (k) => { st.role = k; const r = el.querySelector('[data-r]'); r.className = 'reply'; r.textContent = roleReply(k); Brain.setLobes(0.55); }); } },
    { id: 'curious', name: 'What’s on your mind?', top: 'progress', step: 3, scroll: true,
      brain: { at: 'tiny', lobes: 0.55 },
      render: () => `<div style="height:194px"></div><h2 class="h2 in">What’s on your mind lately?</h2>
        <p class="sub in">Questions ${st.role && st.role !== 'Something else' ? st.role.toLowerCase() + 's' : 'people like you'} bring me. Pick one.</p>
        <div class="opts in" role="radiogroup" aria-label="Questions">${QS.map(([id, tag]) => `<button class="opt q" role="radio" data-k="${id}" aria-pressed="${st.q === id}" aria-checked="${st.q === id}"><b>${GRAPH[id].label}</b><span>${tag}</span></button>`).join('')}</div>
        <p class="sec in">Or bring your own</p>
        <div class="byo in"><button data-byo>Type a question</button><button data-byo>Paste a link</button><button data-byo>Connect ChatGPT</button></div>
        <p class="sub in" data-byonote style="font-size:14px;line-height:20px;min-height:20px"></p>`,
      cta: () => ({ label: 'Show me', disabled: !st.q }),
      enter(el) {
        pick(el, (k) => { st.q = k; Brain.setLobes(0.75); });
        el.querySelectorAll('[data-byo]').forEach((b) => b.addEventListener('click', () => { el.querySelector('[data-byonote]').textContent = 'In the app you can type, paste a link, or connect ChatGPT. For this prototype, pick a question above.'; }));
      } },
    { id: 'build', name: 'Building your answer', bubble: true,
      brain: { at: 'hero', mode: 'think' },
      render: () => `<div></div>`,
      enter() {
        const g = GRAPH[st.q || 'habit'];
        status('Reading your question…');
        later(() => status(`Picking examples from ${st.role === 'Product manager' || !st.role ? 'product work' : 'your world'}…`), 1500);
        later(() => { Brain.setMode('idle'); Brain.setShape(g.shape, CLUSTERS[g.cl].palette, 1600); status('Drawing it…'); }, 3000);
        later(() => go(6), 5000);
      } },
    { id: 'answer', name: 'The answer', bubble: true,
      brain: { at: 'answer' },
      render: () => {
        const g = GRAPH[st.q || 'habit'];
        return `<div style="height:424px"></div>
          <div class="answer in"><p class="one">${g.one}</p>
          ${g.loop ? `<div class="loop" role="group" aria-label="The loop">${g.loop.map(([a], i) => `<button class="opt" data-loop="${i}" aria-pressed="false"><b>${i + 1} · ${a}</b></button>`).join('')}</div><p class="loopcap" data-cap>Tap each step of the loop.</p>`
            : `<div class="beats">${g.beats.map((b) => `<div class="beat"><h3>${b.h}</h3><p>${b.p}</p></div>`).join('')}</div>`}</div>`;
      },
      cta: () => ({ label: 'See where it leads' }),
      enter(el) {
        const g = GRAPH[st.q || 'habit'];
        if (!g.shape) return;
        Brain.setShape(g.shape, CLUSTERS[g.cl].palette, 1);
        status('Touch it');
        el.querySelectorAll('[data-loop]').forEach((b) => b.addEventListener('click', () => {
          el.querySelectorAll('[data-loop]').forEach((x) => x.setAttribute('aria-pressed', x === b));
          el.querySelector('[data-cap]').textContent = g.loop[+b.dataset.loop][1]; Brain.pulse();
        }));
      } },
    { id: 'map', name: 'Your curiosity map',
      brain: { at: 'map', hidden: true },
      render: () => `<div style="height:70px"></div><h2 class="h2 center in">Your curiosity map starts here.</h2>
        <div style="flex:1;min-height:20px"></div><div class="peek in" data-peek style="margin-bottom:-24px"><span>Your question</span><p>${GRAPH[st.q || 'habit'].label} Tap any bubble around it to peek inside.</p></div>`,
      cta: () => ({ label: 'Save my map' }),
      enter(el) { status(''); drawMap(el); },
      leave() { mapviz.classList.remove('show'); later(() => { mapviz.querySelectorAll('.mn').forEach((n) => n.remove()); mapLines.innerHTML = ''; }, 300); },
      next() { signIn(); } },
    { id: 'home', name: 'Ask home',
      brain: { at: 'home', lobes: 0.85 },
      render: () => `<div style="height:400px"></div><h2 class="h2 center in">Your brain is ready.</h2>
        <p class="sub center in">Ask anything. I’ll show you, and remember where it leads.</p>
        <div class="composer in" style="margin-top:20px"><span>Ask anything</span><button class="send" aria-label="Send" data-end><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></div>
        <div class="opts in" style="gap:8px;margin-top:14px">${['aha', 'notbuild'].filter((k) => k !== st.q).concat(['jtbd']).slice(0, 2).map((k) => `<button class="spark" data-end>${GRAPH[k].label}</button>`).join('')}</div>`,
      enter(el) { el.querySelectorAll('[data-end]').forEach((b) => b.addEventListener('click', () => toast('End of onboarding · ↻ Replay to start again'))); } },
  ];
  const roleReply = (r) => (r === 'Something else' ? 'Got it. I’ll keep examples broad.' : `${r}. I’ll pick examples from ${r === 'Product manager' ? 'product work' : 'your world'}.`);

  // single-choice options: fill on select, brain reacts
  function pick(el, onPick) {
    el.querySelectorAll('.opt[data-k]').forEach((b) => b.addEventListener('click', () => {
      el.querySelectorAll('.opt[data-k]').forEach((x) => { x.setAttribute('aria-pressed', x === b); x.setAttribute('aria-checked', x === b); });
      onPick(b.dataset.k); Brain.pulse(); setCta(SCENES[st.i].cta());
    }));
  }

  // ---------- Touch scene unlock ----------
  let travel = 0, last = null;
  const canvas = $('brain');
  function unlockTouch(el) {
    st.touched = true; const s = (el || stage).querySelector('[data-s]');
    if (s) { s.textContent = 'It reacts to you. So will every answer.'; s.className = 'reply center in'; }
    setCta({ label: 'Continue' });
  }
  canvas.addEventListener('pointermove', (e) => {
    if (SCENES[st.i].id !== 'touch' || st.touched) return;
    if (last) travel += Math.hypot(e.clientX - last.x, e.clientY - last.y); last = { x: e.clientX, y: e.clientY };
    if (travel > 260) unlockTouch();
  });
  canvas.addEventListener('pointerdown', () => { if (SCENES[st.i].id === 'touch' && !st.touched) setTimeout(unlockTouch, 700); });

  // ---------- Map reveal ----------
  function drawMap() {
    const id = st.q || 'habit', ns = neighbors(id).slice(0, 6), C = [184, 380], rx = 124, ry = 162;
    const nodes = [{ id, x: C[0], y: C[1], d: 104, c: true }].concat(ns.map((n, k) => { const a = -Math.PI / 2 + Math.PI / 6 + (k * 2 * Math.PI) / 6; return { id: n.id, type: n.type, x: C[0] + Math.cos(a) * rx, y: C[1] + Math.sin(a) * ry, d: 72 }; }));
    let paths = '';
    nodes.slice(1).forEach((n) => { const dx = n.x - C[0], dy = n.y - C[1], L = Math.hypot(dx, dy); paths += `<path d="M${C[0] + (dx / L) * 58} ${C[1] + (dy / L) * 58}L${n.x - (dx / L) * 42} ${n.y - (dy / L) * 42}"/>`; });
    mapLines.innerHTML = paths;
    nodes.forEach((n, k) => {
      const el = document.createElement('div'); el.className = 'mn' + (n.c ? ' c' : ''); el.style.left = n.x + 'px'; el.style.top = n.y + 'px';
      el.style.setProperty('--tint', CLUSTERS[GRAPH[n.id].cl].tint);
      const lab = n.c ? '' : `${GRAPH[n.id].label}`;
      el.innerHTML = `<div class="b" style="width:${n.d}px;height:${n.d}px;left:${-n.d / 2}px;top:${-n.d / 2}px;transition-delay:${n.c ? 0 : 250 + k * 80}ms">${glyph(n.id, n.c ? 170 : 120)}</div><div class="l" style="top:${n.d / 2 + 8}px;transition-delay:${n.c ? 150 : 450 + k * 80}ms;${n.c ? 'display:none' : 'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden'}">${lab}</div>`;
      el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-label', GRAPH[n.id].label);
      const peekIt = () => {
        mapviz.querySelectorAll('.mn').forEach((m) => m.classList.toggle('sel', m === el));
        const p = stage.querySelector('[data-peek]'); if (!p) return;
        p.innerHTML = `<span>${n.c ? 'Your question' : TYPE_NAME[n.type]}</span><p>${GRAPH[n.id].one}</p>`;
      };
      el.addEventListener('click', peekIt); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); peekIt(); } });
      mapviz.appendChild(el);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => mapviz.classList.add('show')));
    if (STILL) mapviz.classList.add('show');
  }

  // ---------- Sign-in sheet ----------
  function signIn() {
    const bd = document.createElement('div'); bd.className = 'backdrop';
    const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-label', 'Save your map');
    sh.innerHTML = `<div class="grab"></div><button class="x" aria-label="Close" data-x><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <h3>Save your map</h3><p>So your questions, answers and where they lead are here tomorrow.</p>
      <button class="apple" data-go><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.2 5.8c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.6 2.8-1.3z"/></svg>Continue with Apple</button>
      <button class="google" data-go><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Continue with Google</button>
      <button class="email" data-go>Use email instead</button>
      <p class="fine">By continuing you agree to the Terms and Privacy Policy.</p>`;
    screen.appendChild(bd); screen.appendChild(sh);
    const close = (then) => { sh.classList.add('closing'); bd.classList.add('closing'); setTimeout(() => { sh.remove(); bd.remove(); then && then(); }, 220); };
    bd.addEventListener('click', () => close()); sh.querySelector('[data-x]').addEventListener('click', () => close());
    sh.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => close(() => go(8))));
  }

  // ---------- Chrome ----------
  function setCta(c) {
    if (!c || c.hidden) { cta.classList.add('hide'); return; }
    cta.classList.remove('hide'); ctaBtn.textContent = c.label; ctaBtn.disabled = !!c.disabled;
  }
  ctaBtn.addEventListener('click', () => { const s = SCENES[st.i]; if (ctaBtn.disabled) return; if (s.next) s.next(); else go(st.i + 1); });
  back.addEventListener('click', () => go(st.i - 1));
  skip.addEventListener('click', () => go(1));

  // ---------- Scene engine ----------
  function go(i) {
    if (i < 0 || i >= SCENES.length) return;
    timers.forEach(clearTimeout); timers = [];
    const prev = SCENES[st.i], s = SCENES[i];
    if (prev && prev !== s && prev.leave) prev.leave();
    st.i = i;
    const old = stage.firstElementChild;
    if (old) { old.classList.add('out'); setTimeout(() => old.remove(), STILL ? 0 : 260); }
    const el = document.createElement('div'); el.className = 'scene' + (s.scroll ? ' scroll' : '');
    el.innerHTML = s.render();
    [...el.children].forEach((c, k) => { if (c.classList.contains('in')) c.style.animationDelay = 120 + k * 55 + 'ms'; });
    stage.appendChild(el);
    // chrome
    top.classList.toggle('hide', !s.top);
    skip.style.display = s.top === 'skip' ? '' : 'none';
    back.classList.toggle('hide', s.top !== 'progress');
    progress.style.visibility = s.top === 'progress' ? 'visible' : 'hidden';
    progress.querySelectorAll('i').forEach((b, k) => { b.style.width = s.step && k < s.step ? '100%' : '0'; });
    ubub.textContent = GRAPH[st.q || 'habit'].label;
    ubub.classList.toggle('hide', !s.bubble);
    status('');
    brain(s.brain);
    setCta(s.cta ? s.cta() : { hidden: true });
    if (s.enter) s.enter(el);
    renderJump();
    const url = new URL(location); url.searchParams.set('s', i + 1); history.replaceState(null, '', url);
  }

  function renderJump() {
    $('jump').innerHTML = SCENES.map((s, k) => `<button data-j="${k}" ${k === st.i ? 'aria-current="step"' : ''}><i>${k + 1}</i>${s.name}</button>`).join('');
    $('jump').querySelectorAll('[data-j]').forEach((b) => b.addEventListener('click', () => { const k = +b.dataset.j; if (k >= 3 && !st.goal) st.goal = 'work'; if (k >= 4 && !st.role) st.role = 'Product manager'; if (k >= 5 && !st.q) st.q = 'habit'; if (k > 1) st.touched = true; go(k); }));
  }
  $('replay').addEventListener('click', () => { Object.assign(st, { goal: null, role: null, q: null, touched: false }); travel = 0; last = null; go(0); });

  function fit() { const s = Math.min(1, (window.innerHeight - 48) / 844); $('phoneWrap').style.transform = `scale(${s})`; $('phoneHolder').style.width = 390 * s + 'px'; $('phoneHolder').style.height = 844 * s + 'px'; }
  window.addEventListener('resize', fit); fit();

  const start = Math.max(0, Math.min(SCENES.length - 1, (parseInt(params.get('s'), 10) || 1) - 1));
  if (start >= 2) { st.touched = true; st.goal = 'work'; } if (start >= 3) st.role = 'Product manager'; if (start >= 4) st.q = params.get('q') || 'habit';
  go(start);
})();
