(function () {
  const DIRS = ['seen', 'ask', 'wonder'];
  const PIDS = ['riya', 'sam', 'meera', 'dev'];
  const LAYOUT = { // centre x, centre y, scale inside the 368×822 screen
    hero: [184, 400, 0.8], mid: [184, 220, 0.8], top: [184, 215, 0.6], small: [184, 140, 0.5],
    corner: [318, 92, 0.2], badge: [322, 80, 0.18], home: [184, 220, 0.6], off: [184, 220, 0.8],
  };
  const quoteIt = (t) => (t.startsWith('“') ? t : `“${t}”`);
  const FEEL = { '-2': 'Frustrated', '-1': 'Annoyed', '0': 'Neutral', '1': 'Good', '2': 'Delighted' };

  const params = new URLSearchParams(location.search);
  const st = { dir: DIRS[(parseInt(params.get('v'), 10) || 1) - 1] || 'seen', pid: PIDS.includes(params.get('p')) ? params.get('p') : 'riya', step: Math.max(0, (parseInt(params.get('s'), 10) || 1) - 1), run: {} };
  let timers = [], cleanups = [];

  const root = document.getElementById('screenRoot');
  const stage = document.getElementById('stage');
  const wrap = document.getElementById('brainWrap');
  const caption = document.getElementById('brainCaption');
  const statusbar = document.getElementById('statusbar');
  Brain.mount(document.getElementById('brain'));
  if (params.has('still')) { // debug: no animations, brain drawn on a timer (for headless screenshots)
    document.documentElement.classList.add('still');
    setInterval(() => Brain.snap(), 250);
  }
  if (params.get('click')) setTimeout(() => params.get('click').split('|').forEach((sel, i) => setTimeout(() => { const n = document.querySelector(sel); n && n.click(); }, i * 400)), 600);

  function setBrain(b) {
    const [cx, cy, s] = LAYOUT[b.at || 'mid'];
    wrap.style.transform = `translate(${cx - 160}px, ${cy - 160}px) scale(${s})`;
    wrap.style.opacity = b.at === 'off' ? 0 : 1;
    wrap.style.pointerEvents = b.at === 'off' ? 'none' : 'auto';
    caption.style.top = (cy + 160 * s + 2) + 'px';
    if (b.form) Brain.form(); else Brain.setShape(b.shape || 'brain', b.palette || 'cobalt');
    Brain.setMode(b.mode || 'idle');
    Brain.setLobes(b.lobes || 0);
  }
  function setCaption(t) { caption.textContent = t || ''; caption.style.opacity = t ? 1 : 0; }

  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
    root.appendChild(t); setTimeout(() => t.remove(), 2500);
  }
  const X_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function closeSheet(immediate) {
    const nodes = root.querySelectorAll('.sheet, .sheet-backdrop');
    nodes.forEach((n) => { if (immediate) n.remove(); else { n.classList.add('closing'); setTimeout(() => n.remove(), 220); } });
  }
  // A dialog: { title?, body, cta? }. The CTA area is pinned; the body scrolls.
  function sheet(o, mount) {
    closeSheet(true);
    if (typeof o === 'string') o = { body: o };
    const bd = document.createElement('div'); bd.className = 'sheet-backdrop'; bd.addEventListener('click', () => closeSheet());
    const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
    sh.innerHTML = `<div class="sheet-head"><div class="grabber"></div>${o.title ? `<p class="sheet-title">${o.title}</p>` : ''}<button class="sheet-x" aria-label="Close">${X_ICON}</button></div>
      <div class="sheet-body">${o.body}</div>${o.cta ? `<div class="sheet-cta">${o.cta}</div>` : ''}`;
    if (o.title) sh.setAttribute('aria-label', o.title);
    sh.querySelector('.sheet-x').addEventListener('click', () => closeSheet());
    root.appendChild(bd); root.appendChild(sh); mount && mount(sh);
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

  const steps = () => DIRECTIONS[st.dir].steps;
  function go(i) { st.step = Math.max(0, Math.min(steps().length - 1, i)); render(); }
  function next() { if (st.step < steps().length - 1) go(st.step + 1); else toast('End of onboarding. ↻ replays it.'); }

  function ctx() {
    return {
      p: PERSONAS[st.pid], pid: st.pid, dir: st.dir, run: st.run, root,
      next, back: () => go(st.step - 1), goId: (id) => go(steps().findIndex((s) => s.id === id)),
      toast, sheet, closeSheet, setBrain, caption: setCaption,
      brain: { setMode: Brain.setMode, setLobes: Brain.setLobes, touch: () => Brain.pulse() },
      later: (fn, ms) => { timers.push(setTimeout(fn, ms)); },
      onCleanup: (fn) => cleanups.push(fn),
      setPersona: (id, advance) => { st.pid = id; if (advance) next(); else render(); },
      switchDir: (d) => setDir(DIRS.indexOf(d)),
    };
  }

  function render() {
    timers.forEach(clearTimeout); timers = []; cleanups.forEach((f) => f()); cleanups = [];
    closeSheet(true); setCaption('');
    const def = steps()[st.step], scr = SCREENS[def.id], c = ctx();
    const old = stage.firstElementChild;
    if (old) { old.classList.add('leaving'); setTimeout(() => old.remove(), 160); }
    const el = document.createElement('div'); el.className = 'screen'; el.innerHTML = scr.render(c);
    stage.appendChild(el);
    statusbar.classList.toggle('light', !!scr.light);
    setBrain(scr.brain ? scr.brain(c) : { at: 'off' });
    scr.mount && scr.mount(el, c);
    // Long screens scroll behind the pinned CTA; short ones let taps reach the brain.
    const fitScroll = () => { el.style.pointerEvents = el.scrollHeight > el.clientHeight + 1 ? 'auto' : ''; };
    fitScroll(); [300, 1200, 3000, 6000].forEach((ms) => timers.push(setTimeout(fitScroll, ms)));
    const mo = new MutationObserver(fitScroll); mo.observe(el, { childList: true, subtree: true }); cleanups.push(() => mo.disconnect());
    el.querySelectorAll('[data-next]').forEach((b) => b.addEventListener('click', () => { if (!b.disabled) next(); }));
    renderPanels();
    const url = new URL(location); url.searchParams.set('v', DIRS.indexOf(st.dir) + 1); url.searchParams.set('p', st.pid); url.searchParams.set('s', st.step + 1); history.replaceState(null, '', url);
  }

  // ---------- Panels ----------
  function renderPanels() {
    const p = PERSONAS[st.pid], D = DIRECTIONS[st.dir], def = D.steps[st.step];
    document.documentElement.style.setProperty('--pc', p.color); document.documentElement.style.setProperty('--pcd', p.deep);

    document.getElementById('personaPanel').innerHTML = `
      <p class="eyebrow">Who’s using it</p>
      <h2>Switch persona at any step</h2>
      <p class="hint">The same screen, seen by four different people. Their content, tone and feelings change.</p>
      ${PIDS.map((id) => { const q = PERSONAS[id]; return `<button class="persona-card" data-pid="${id}" aria-pressed="${id === st.pid}" style="--pc:${q.color};--pcd:${q.deep}">
        <div class="pc-top"><span class="pc-dot">${q.name[0]}</span><div><div class="pc-name">${q.name}</div><div class="pc-role">${q.role} · ${q.meta}</div></div></div>
        <p class="pc-job"><b>Job:</b> ${q.job}</p><p class="pc-leave"><b>Leaves if:</b> ${q.leaves}</p></button>`; }).join('')}
      <div class="dir-card"><p class="eyebrow">Direction ${DIRS.indexOf(st.dir) + 1} of 3</p><h3>${D.name}: ${D.tag.toLowerCase()}</h3><p>The wow: ${D.wow}</p><p style="margin-top:8px">Keys: 1–3 or ←/→ switch direction · B / N step back and forward · R replays.</p></div>`;
    document.querySelectorAll('[data-pid]').forEach((b) => b.addEventListener('click', () => { st.pid = b.dataset.pid; render(); }));

    const f = def.feel[st.pid], wow = (def.wow || []).includes(st.pid);
    const curve = curveSVG(D);
    document.getElementById('journeyPanel').innerHTML = `
      <div class="step-now">
        <p class="eyebrow">Step ${st.step + 1} of ${D.steps.length} · ${D.name}</p>
        <p class="title">${def.title}</p>
        <span class="job-pill">Job: ${JOBS[def.job]}</span>${def.risk ? `<span class="risk-pill">${def.risk}</span>` : ''}
        <div class="thought"><div class="who">${p.name} thinks</div><q>${def.think[st.pid]}</q>${wow ? '<span class="wow-tag">★ This is ' + p.name + '’s wow</span>' : ''}
          <div class="meter">${[-2, -1, 0, 1, 2].map((v) => `<span class="${v === f ? (v < 0 ? 'neg' : 'on') : ''}"></span>`).join('')}</div>
          <div class="meter-label"><span>−2</span><span style="color:var(--ink);font-weight:600">Feels: ${FEEL[f].toLowerCase()}</span><span>+2</span></div>
        </div>
        <div class="others">${PIDS.filter((id) => id !== st.pid).map((id) => `<button class="other" data-pid2="${id}"><span class="d" style="background:${PERSONAS[id].color}"></span><span><b>${PERSONAS[id].name}</b> · ${FEEL[def.feel[id]]}${(def.wow || []).includes(id) ? ' ★' : ''}<br>${quoteIt(def.think[id])}</span></button>`).join('')}</div>
      </div>
      <div class="curve-card"><p class="eyebrow">How ${p.name} feels across ${D.name}</p>${curve}</div>
      <div class="steps-list">${D.steps.map((s, i) => `<button data-step="${i}" ${i === st.step ? 'aria-current="step"' : ''}><span class="n">${i + 1}</span>${s.title}${(s.wow || []).includes(st.pid) ? '<span class="star">★ wow</span>' : ''}</button>`).join('')}</div>
      <div class="nav-row"><button data-b>← Back</button><button data-n>Next →</button></div>`;
    document.querySelectorAll('[data-pid2]').forEach((b) => b.addEventListener('click', () => { st.pid = b.dataset.pid2; render(); }));
    document.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => go(+b.dataset.step)));
    document.querySelector('[data-b]').addEventListener('click', () => go(st.step - 1));
    document.querySelector('[data-n]').addEventListener('click', next);
  }

  function curveSVG(D) {
    const n = D.steps.length, w = 300, h = 110, px = 12, top = 14, bot = 96;
    const x = (i) => px + i * (w - 2 * px) / (n - 1), y = (v) => top + (2 - v) / 4 * (bot - top);
    const line = (id) => D.steps.map((s, i) => `${x(i).toFixed(1)},${y(s.feel[id]).toFixed(1)}`).join(' ');
    const others = PIDS.filter((id) => id !== st.pid).map((id) => `<polyline points="${line(id)}" fill="none" stroke="${PERSONAS[id].color}" stroke-opacity=".28" stroke-width="2" stroke-linejoin="round"/>`).join('');
    const wows = D.steps.map((s, i) => (s.wow || []).includes(st.pid) ? `<circle cx="${x(i)}" cy="${y(s.feel[st.pid])}" r="7" fill="none" stroke="#1F5BE0" stroke-width="2"/>` : '').join('');
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display:block;margin-top:8px" aria-label="Feeling curve">
      <line x1="0" x2="${w}" y1="${y(0)}" y2="${y(0)}" stroke="#141211" stroke-opacity=".2" stroke-dasharray="3 5"/>
      <rect x="${x(st.step) - 9}" y="4" width="18" height="${h - 8}" rx="9" fill="rgba(31,91,224,.10)"/>
      ${others}
      <polyline points="${line(st.pid)}" fill="none" stroke="${PERSONAS[st.pid].color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      ${wows}
      <circle cx="${x(st.step)}" cy="${y(D.steps[st.step].feel[st.pid])}" r="5" fill="${PERSONAS[st.pid].color}" stroke="#fff" stroke-width="2"/>
      <text x="2" y="${top - 4}" font-size="9" font-weight="600" fill="#77736E" font-family="Inter">+2</text><text x="2" y="${bot + 12}" font-size="9" font-weight="600" fill="#77736E" font-family="Inter">−2</text>
    </svg>`;
  }

  // ---------- Picker (reference wiring, adapted: a variant = a direction) ----------
  const picker = document.querySelector('.proto-picker');
  const highlight = picker.querySelector('.proto-picker-highlight');
  const items = [...picker.querySelectorAll('.proto-picker-item:not(.proto-picker-replay)')];
  const replay = picker.querySelector('.proto-picker-replay');
  let current = DIRS.indexOf(st.dir);
  function moveHighlight() { const el = items[current]; highlight.style.width = el.offsetWidth + 'px'; highlight.style.transform = `translateX(${el.offsetLeft}px)`; }
  function setDir(i, keepStep) {
    if (i < 0 || i >= DIRS.length) return;
    current = i; st.dir = DIRS[i]; if (!keepStep) st.step = 0; st.run = {};
    items.forEach((el, j) => { el.toggleAttribute('data-active', j === i); if (j === i) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current'); });
    moveHighlight(); render();
  }
  items.forEach((el, i) => el.addEventListener('click', () => setDir(i)));
  replay.addEventListener('click', () => { st.step = 0; st.run = {}; render(); });
  window.addEventListener('resize', () => { moveHighlight(); fit(); });
  document.addEventListener('keydown', (e) => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= DIRS.length) setDir(num - 1);
    else if (e.key === 'ArrowRight') setDir((current + 1) % DIRS.length);
    else if (e.key === 'ArrowLeft') setDir((current - 1 + DIRS.length) % DIRS.length);
    else if (e.key === 'r' || e.key === 'R') { st.step = 0; st.run = {}; render(); }
    else if (e.key === 'n' || e.key === 'N') next();
    else if (e.key === 'b' || e.key === 'B') go(st.step - 1);
  });

  function fit() {
    const pw = document.getElementById('phoneWrap'), holder = document.getElementById('phoneHolder');
    const s = Math.min(1, (window.innerHeight - 100) / 844);
    pw.style.transform = `scale(${s})`; holder.style.width = 390 * s + 'px'; holder.style.height = 844 * s + 'px';
  }
  fit();
  setDir(current, true);
  requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute('data-ready', '')));
})();
