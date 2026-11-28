// Onboarding v5 · trailer → welcome → what to learn → why now → what you do (work and career only) → where you are
// → what would make it worth it → time → the course builds → hand off to Learn's plan reveal. Owner: A · Onboarding.
// One question per screen. The particles (Brain) take the shape of the topic and react to each answer.
// Data: data/courses-catalog.js (topics, outcomes, buildCourse) and data/personas.js. Talks to the app through Bus, Store and Brain.
(function () {
  const W = 368, H = 822;
  const P = new URLSearchParams(location.search);
  const STILL = P.has('still');
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INSTANT = STILL || REDUCED;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

  // ---------- Steps (the side panel lists these) ----------
  const STEPS = ['Trailer', 'Welcome', 'What to learn', 'Why now', 'What you do', 'Where you are', 'What would make it worth it', 'Your time', 'Building your course'];
  const TRAILER = 0, WELCOME = 1, TOPIC = 2, REASON = 3, ROLE = 4, LEVEL = 5, GOAL = 6, TIME = 7, BUILD = 8;

  const REASONS = [
    { id: 'work', label: 'For my work', shape: 'f-work' },
    { id: 'exam', label: 'For an exam or class', shape: 'f-exam' },
    { id: 'career', label: 'To change careers', shape: 'f-founder' },
    { id: 'life', label: 'For my own life', shape: 'f-fun' },
  ];
  const ROLES = [['student', 'Student'], ['tech', 'Product & tech'], ['business', 'Business'], ['health', 'Health'], ['creative', 'Creative'], ['teaching', 'Teaching'], ['other', 'Other']];
  const LEVELS = [['new', 'New to it'], ['bit', 'I’ve used it a bit'], ['basics', 'I know the basics'], ['deep', 'I want to go deep']];
  const MINUTES = [5, 10, 15, 20];
  const SPANS = [['week', 'A week', 7], ['twoweeks', 'Two weeks', 14], ['month', 'A month', 30]];
  const SPAN_FOR = { 5: 'month', 10: 'twoweeks', 15: 'twoweeks', 20: 'week' }; // more minutes a day, sooner done
  const needsRole = () => st.reason === 'work' || st.reason === 'career';

  // ---------- State: the answers ----------
  const blank = () => ({ persona: null, pick: null, text: '', reason: null, role: null, roleText: '', level: null, goal: null, otherText: '', daily: null, span: null, spanSet: false });
  let st = Object.assign(blank(), { step: 0, busy: false, courseId: null });
  let root, $, timers = [], mounted = false, orb = { x: 184, y: 330, s: 1 };
  const later = (fn, ms) => { timers.push(setTimeout(fn, STILL ? Math.min(ms, 20) : ms)); };

  const SUG = () => window.TOPIC_SUGGEST || [];
  // The profile so far, in the CONTRACT shape
  function prof() {
    const typed = st.text.trim(), sug = st.pick && SUG().find((s) => s.id === st.pick);
    const topic = st.pick || (typed && window.courseFor ? courseFor(typed) : typed ? 'custom' : null);
    const role = st.reason === 'exam' ? 'student' : needsRole() ? st.role : null;
    const outs = topic && st.reason && window.outcomesFor ? outcomesFor({ topic, topicLabel: sug ? sug.label : typed, reason: st.reason, role }) : [];
    const o = outs.find((x) => x.id === st.goal);
    return {
      persona: st.persona, topic, topicLabel: sug ? sug.label : typed, reason: st.reason, role,
      roleText: needsRole() ? st.roleText.trim() : '', level: st.level,
      goal: st.goal, goalText: st.goal === 'other' ? st.otherText.trim() : o ? o.label : '',
      daily: st.daily, span: st.span,
    };
  }
  const info = () => (window.topicInfo ? topicInfo(prof()) : { id: 'custom', short: 'this', palette: 'mind', shape: null, levels: {}, levelLabels: {} });

  // ---------- Personas: pre-fill every answer so a reviewer can click Continue through ----------
  function seed(id) {
    const per = window.PERSONAS && PERSONAS[id]; if (!per) return false;
    const p = per.profile, sug = SUG().find((s) => s.label === p.topicLabel);
    st = Object.assign(st, blank(), {
      persona: p.persona || id, pick: sug ? sug.id : null, text: sug ? '' : p.topicLabel, reason: p.reason, role: p.role || null, roleText: p.roleText || '',
      level: p.level, goal: p.goal, otherText: p.goal === 'other' ? p.goalText : '', daily: p.daily, span: p.span, spanSet: true,
    });
    return true;
  }

  // ---------- Template ----------
  const BACK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const TEMPLATE = `
    <div class="ob-day"></div>
    <div class="ob-glow"></div>
    <div class="ob-night"></div>
    <div class="ob-brain"><div class="ob-halo"></div></div>
    <div class="ob-tline" aria-live="polite"></div>
    <button class="ob-skip" type="button">Skip</button>
    <div class="ob-qtop">
      <button class="ob-back" type="button" aria-label="Back">${BACK}</button>
      <div class="ob-bar" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100"><i></i></div>
    </div>
    <div class="ob-pane"></div>
    <div class="ob-cta">
      <button class="ob-btn" type="button"><span>Continue</span></button>
      <button class="ob-link" type="button">I have an account</button>
    </div>
    <canvas class="ob-fx" aria-hidden="true"></canvas>`;

  function mount(layer) {
    if (mounted) return; mounted = true;
    root = document.createElement('div'); root.className = 'ob'; root.innerHTML = TEMPLATE; layer.appendChild(root);
    const q = (s) => root.querySelector(s);
    $ = { brain: q('.ob-brain'), tline: q('.ob-tline'), skip: q('.ob-skip'), qtop: q('.ob-qtop'), back: q('.ob-back'), bar: q('.ob-bar'), barFill: q('.ob-bar i'),
      pane: q('.ob-pane'), cta: q('.ob-cta'), btn: q('.ob-btn'), btnLabel: q('.ob-btn span'), link: q('.ob-link'), fx: q('.ob-fx') };
    setupFx();
    const scr = document.getElementById('screen');
    if (scr) scr.addEventListener('scroll', () => { if (scr.scrollTop && root.offsetParent) scr.scrollTop = 0; });
    $.btn.addEventListener('click', () => { if ($.btn.disabled || st.busy) return; const s = SCENES[st.step]; if (s.next) s.next(); });
    $.back.addEventListener('click', () => { if (st.busy) return; const s = SCENES[st.step]; if (s.back) s.back(); });
    $.skip.addEventListener('click', (e) => { e.stopPropagation(); go(WELCOME); });
    $.link.addEventListener('click', () => { if (window.toast) toast('Signing in isn’t part of this prototype yet'); });
    root.addEventListener('click', (e) => { if (st.step === TRAILER && !e.target.closest('button')) go(WELCOME); });
    // Persona picked in the side panel: start again at "What to learn" with their answers chosen
    if (window.Bus) Bus.on('variant:change', ({ key, value }) => {
      if (key !== 'persona' || (window.App && App.current && App.current() !== 'onboarding')) return;
      if (seed(value)) go(TOPIC);
    });
  }

  // ---------- The particles: one canvas, glides between spots ----------
  function place(x, y, s, o = {}) {
    orb = { x, y, s };
    $.brain.classList.toggle('snap', !!o.snap);
    $.brain.style.transform = `translate(${x - 160}px, ${y - 160}px) scale(${s})`;
    $.brain.style.opacity = o.hidden ? 0 : 1;
  }
  const Q_SPOT = [184, 172, 0.36], T_SPOT = [184, 152, 0.3]; // questions; "What do you want to learn?" (more answers, smaller mark)
  // The seed the course condenses into at the end of the build, in the topic's colours
  const seedShape = (grad) => { Brain.defineIcon('ob-seed', (x, S) => { x.beginPath(); x.arc(S / 2, S / 2, S * 0.42, 0, 6.283); x.fill(); }, { scale: 0.34, grad }); return 'ob-seed'; };
  // Unknown topics: the particles spell the word you typed (two slots so it can morph word to word)
  let wordKey = '', wordSlot = 0;
  function wordShape(word) {
    if (word === wordKey) return 'ob-word-' + wordSlot;
    wordKey = word; wordSlot = 1 - wordSlot;
    const name = 'ob-word-' + wordSlot;
    Brain.defineIcon(name, window.textShape ? textShape(word, 560) : (x, S) => { x.font = `600 ${S * 0.5}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(word, S / 2, S / 2); }, { grad: ['#F07B5A', '#B83A1C'] });
    return name;
  }
  function topicShape(i) { return i.shape && Brain.has(i.shape) ? i.shape : wordShape(i.word || '?'); }
  // Where the mark sits on a question screen. A typed word is wide and short, so it gets more room.
  function spot() {
    const base = st.step === TOPIC ? T_SPOT : Q_SPOT, p = prof(), word = p.topic && !(info().shape && Brain.has(info().shape));
    return word ? [base[0], base[1], base[2] * 1.6] : base;
  }
  function showTopic(ms = 1200) {
    const p = prof();
    if (st.step >= TOPIC && st.step < BUILD) place(...spot());
    if (!p.topic) { Brain.setShape('brain', 'cobalt', ms); return; }
    const i = info(); Brain.setShape(topicShape(i), i.palette || 'cobalt', ms);
  }

  // ---------- Particle FX: a tapped answer dissolves and flies into the shape ----------
  let fg, parts = [], fxDirty = false;
  const DPR = Math.min(2, window.devicePixelRatio || 1), SPR = {};
  function setupFx() { $.fx.width = W * DPR; $.fx.height = H * DPR; fg = $.fx.getContext('2d'); requestAnimationFrame(fxLoop); }
  function sprite(c) {
    if (SPR[c]) return SPR[c];
    const cv = document.createElement('canvas'); cv.width = cv.height = 48; const x = cv.getContext('2d');
    const g = x.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, `rgba(${c},1)`); g.addColorStop(0.22, `rgba(${c},.95)`); g.addColorStop(0.5, `rgba(${c},.28)`); g.addColorStop(1, `rgba(${c},0)`);
    x.fillStyle = g; x.fillRect(0, 0, 48, 48); return (SPR[c] = cv);
  }
  function relRect(el) {
    const a = el.getBoundingClientRect(), b = root.getBoundingClientRect(), s = b.width / W || 1;
    return { x: (a.left - b.left) / s, y: (a.top - b.top) / s, w: a.width / s, h: a.height / s };
  }
  function burst(el, colours, onArrive) {
    if (INSTANT || !el) { if (onArrive) onArrive(); return; }
    const r = relRect(el), n = Math.round(Math.min(90, Math.max(45, (r.w * r.h) / 160))), t0 = performance.now(); let arrived = 0, fired = false;
    const cols = colours.map((h) => hex(h).join(',')).concat(['255,248,241']);
    const fire = () => { if (!fired) { fired = true; if (onArrive) onArrive(); } };
    for (let i = 0; i < n; i++) {
      const sx = r.x + Math.random() * r.w, sy = r.y + Math.random() * r.h, tx = orb.x + rnd(-36, 36) * orb.s, ty = orb.y + rnd(-36, 36) * orb.s;
      parts.push({ sx, sy, tx, ty, mx: (sx + tx) / 2 + rnd(-90, 90), my: (sy + ty) / 2 + rnd(-60, 30), t0: t0 + rnd(0, 160), dur: rnd(520, 800), r: rnd(1.2, 2.6), c: cols[i % cols.length], done: () => { if (++arrived > n * 0.4) fire(); } });
    }
    setTimeout(fire, 1100);
  }
  function fxLoop(now) {
    requestAnimationFrame(fxLoop);
    if (!parts.length) { if (fxDirty) { fg.setTransform(1, 0, 0, 1, 0, 0); fg.clearRect(0, 0, $.fx.width, $.fx.height); fxDirty = false; } return; }
    fxDirty = true; fg.setTransform(DPR, 0, 0, DPR, 0, 0); fg.clearRect(0, 0, W, H);
    parts = parts.filter((p) => {
      const k = (now - p.t0) / p.dur; if (k < 0) return true;
      if (k >= 1) { p.done(); return false; }
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, u = 1 - e;
      const x = u * u * p.sx + 2 * u * e * p.mx + e * e * p.tx, y = u * u * p.sy + 2 * u * e * p.my + e * e * p.ty;
      const s = p.r * 5 * (1 - k * 0.45);
      fg.globalAlpha = Math.min(1, k * 8, (1 - k) * 3); fg.drawImage(sprite(p.c), x - s / 2, y - s / 2, s, s);
      return true;
    });
    fg.globalAlpha = 1;
  }
  const accent = () => { const i = info(); return i.color || ['#F07B5A', '#B83A1C']; };
  // An answer was tapped: fly it into the particles, which pulse
  function feed(el, then) { burst(el, accent(), () => { if (then) then(); Brain.pulse(); }); }

  // ---------- Shared pieces ----------
  function dark(on) {
    root.classList.toggle('ob-dark', on);
    const scr = document.getElementById('screen'); if (scr) scr.classList.toggle('is-dark', on);
    Brain.setDark(on);
  }
  function chrome(o) {
    $.skip.classList.toggle('on', !!o.skip);
    $.qtop.classList.toggle('on', !!o.q);
    $.cta.classList.toggle('hide', !o.cta);
    $.cta.classList.toggle('with-link', !!o.link);
    root.classList.toggle('ob-trailer', st.step === TRAILER);
    root.classList.toggle('ob-building', st.step === BUILD);
    if (!o.line) setLine('');
    if (o.q) progress();
  }
  function setCta(label, enabled) { if (label != null) $.btnLabel.textContent = label; $.btn.disabled = !enabled; }
  // Progress over the questions this person will actually see
  function qSteps() { return [TOPIC, REASON].concat(needsRole() ? [ROLE] : []).concat([LEVEL, GOAL, TIME]); }
  function progress() {
    const list = qSteps(), i = Math.max(0, list.indexOf(st.step)), pct = Math.round(((i + 1) / list.length) * 100);
    $.barFill.style.width = pct + '%'; $.bar.setAttribute('aria-valuenow', pct);
  }
  // Trailer line, word by word
  function setLine(text) {
    $.tline.innerHTML = text ? text.split(' ').map((w) => `<span class="w">${esc(w)}</span>`).join(' ') : '';
    [...$.tline.children].forEach((w, k) => setTimeout(() => w.classList.add('on'), STILL ? 0 : 80 + k * 90));
  }
  // A question screen: room for the particles, one heading, the answers
  function pane(html, cls = '') {
    $.pane.className = 'ob-pane ' + cls;
    $.pane.innerHTML = html;
    $.pane.classList.remove('in'); void $.pane.offsetWidth; $.pane.classList.add('in');
  }
  const question = (head, body, cls) => pane(`<div class="ob-vis" aria-hidden="true"></div><h1 class="ob-head">${esc(head)}</h1>${body}`, 'ob-q ' + (cls || ''));
  const opt = (id, label, sub, on, extra = '') => `<button type="button" class="ob-opt" role="radio" data-v="${esc(id)}" aria-checked="${!!on}" ${extra}><span class="ob-ot"><b>${esc(label)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></button>`;
  const chip = (id, label, on) => `<button type="button" class="ob-chip" role="radio" data-v="${esc(id)}" aria-checked="${!!on}">${esc(label)}</button>`;
  function radios(group, onPick) {
    group.querySelectorAll('[role="radio"]').forEach((b) => b.addEventListener('click', () => {
      if (st.busy) return;
      group.querySelectorAll('[role="radio"]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      onPick(b.dataset.v, b);
    }));
  }
  // One-tap answers move on by themselves, after a beat to see the choice land
  function advance(to) { st.busy = true; later(() => { st.busy = false; go(to); }, INSTANT ? 180 : 560); }

  // ---------- Scenes ----------
  const SCENES = [];
  SCENES[TRAILER] = { // Particles drift, then gather. One line.
    enter() {
      dark(true); chrome({ skip: true, line: true }); pane('');
      place(184, 340, 1, { snap: true }); Brain.setSpin(false); Brain.setMode('idle');
      Brain.setShape('scatter', 'cobalt', 10);
      later(() => Brain.setShape('brain', 'cobalt', 2600), 900);
      later(() => setLine('Learn anything. Made for you.'), 2300);
      if (!STILL) later(() => go(WELCOME), 6200);
    },
  };
  SCENES[WELCOME] = {
    enter() {
      dark(false); chrome({ cta: true, link: true });
      place(184, 300, 1); Brain.setMode('idle'); Brain.setShape('brain', 'cobalt', 900); Brain.setSpin(true);
      pane(`<h1 class="ob-head ob-title">Welcome to Cortex</h1><p class="ob-lede">Tell us what you want to learn. We’ll build the course around you.</p>`, 'ob-welcome');
      setCta('Get started', true);
    },
    next() { go(TOPIC); },
  };
  SCENES[TOPIC] = {
    enter() {
      dark(false); chrome({ q: true, cta: true }); Brain.setSpin(false); Brain.setMode('idle');
      showTopic();
      question('What do you want to learn?', `
        <label class="ob-field"><input type="text" placeholder="Type anything" aria-label="What do you want to learn?" autocomplete="off" spellcheck="false" enterkeyhint="next" value="${esc(st.text)}"></label>
        <div class="ob-sugs" role="radiogroup" aria-label="Suggestions">${SUG().map((s) => `<button type="button" class="ob-sug" role="radio" data-v="${s.id}" aria-checked="${st.pick === s.id}">${esc(s.label)}</button>`).join('')}</div>`, 'ob-topic');
      const input = $.pane.querySelector('input'), sugs = $.pane.querySelector('.ob-sugs');
      let t = 0;
      input.addEventListener('input', () => {
        st.text = input.value;
        if (st.pick && input.value.trim()) { st.pick = null; sugs.querySelectorAll('.ob-sug').forEach((x) => x.setAttribute('aria-checked', 'false')); }
        valid(); Brain.setMode('listen');
        clearTimeout(t); t = setTimeout(() => { if (st.step !== TOPIC) return; Brain.setMode('idle'); showTopic(1300); Brain.pulse(); }, INSTANT ? 0 : 520);
      });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (!$.btn.disabled) SCENES[TOPIC].next(); } });
      radios(sugs, (v, b) => {
        st.pick = v; st.text = ''; input.value = ''; input.blur(); valid();
        feed(b, () => showTopic(1100));
      });
      const valid = () => setCta('Continue', !!(st.pick || st.text.trim()));
      valid();
    },
    next() { go(REASON); },
    back() { go(WELCOME); },
  };
  SCENES[REASON] = {
    enter() {
      question(`Why ${info().short}, why now?`, `<div class="ob-opts" role="radiogroup" aria-label="Why now">${REASONS.map((r) => opt(r.id, r.label, '', st.reason === r.id)).join('')}</div>`);
      qScene();
      radios($.pane.querySelector('.ob-opts'), (v, b) => {
        st.reason = v;
        if (v === 'exam') st.role = 'student'; else if (v === 'life') st.role = null; else if (st.role === 'student' && !st.roleText) st.role = null;
        progress(); setCta('Continue', true); feed(b); advance(needsRole() ? ROLE : LEVEL);
      });
      setCta('Continue', !!st.reason);
    },
    next() { go(needsRole() ? ROLE : LEVEL); },
    back() { go(TOPIC); },
  };
  SCENES[ROLE] = {
    enter() {
      question('What do you do?', `
        <div class="ob-chips" role="radiogroup" aria-label="What you do">${ROLES.map(([id, l]) => chip(id, l, st.role === id)).join('')}</div>
        <label class="ob-field ob-small"><span class="ob-flabel">Your role <i>optional</i></span><input type="text" placeholder="e.g. Product manager" autocomplete="organization-title" value="${esc(st.roleText)}"></label>`, 'ob-role');
      qScene();
      const input = $.pane.querySelector('input');
      radios($.pane.querySelector('.ob-chips'), (v, b) => { st.role = v; valid(); feed(b); });
      input.addEventListener('input', () => { st.roleText = input.value; valid(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (!$.btn.disabled) SCENES[ROLE].next(); } });
      const valid = () => setCta('Continue', !!(st.role || st.roleText.trim()));
      valid();
    },
    next() { if (!st.role) st.role = 'other'; go(LEVEL); },
    back() { go(REASON); },
  };
  SCENES[LEVEL] = {
    enter() {
      const i = info(), head = i.custom && i.verb ? 'How far along are you?' : `Where are you with ${i.short}?`;
      question(head, `<div class="ob-opts" role="radiogroup" aria-label="Where you are">${LEVELS.map(([id, l]) => opt(id, (i.levelLabels || {})[id] || l, (i.levels || {})[id], st.level === id)).join('')}</div>`);
      qScene();
      radios($.pane.querySelector('.ob-opts'), (v, b) => { st.level = v; setCta('Continue', true); feed(b); advance(GOAL); });
      setCta('Continue', !!st.level);
    },
    next() { go(GOAL); },
    back() { go(needsRole() ? ROLE : REASON); },
  };
  SCENES[GOAL] = {
    enter() {
      const outs = window.outcomesFor ? outcomesFor(prof()) : [];
      if (st.goal && st.goal !== 'other' && !outs.find((o) => o.id === st.goal)) st.goal = null; // the topic or reason changed
      const other = st.goal === 'other';
      question('What would make this worth it?', `<div class="ob-opts" role="radiogroup" aria-label="What would make this worth it">${outs.map((o) => opt(o.id, o.label, '', st.goal === o.id)).join('')}
        <div class="ob-other${other ? ' open' : ''}">${opt('other', 'Something else', '', other, 'aria-controls="obOther"')}
          <label class="ob-field ob-small ob-otherfield"><input id="obOther" type="text" placeholder="Say it in your own words" aria-label="What would make it worth it" autocomplete="off" value="${esc(st.otherText)}"></label></div></div>`, 'ob-goal');
      qScene();
      const box = $.pane.querySelector('.ob-other'), input = box.querySelector('input');
      const valid = () => setCta('Continue', !!st.goal && (st.goal !== 'other' || !!st.otherText.trim()));
      radios($.pane.querySelector('.ob-opts'), (v, b) => {
        st.goal = v; box.classList.toggle('open', v === 'other'); valid();
        if (v === 'other') { setTimeout(() => input.focus(), INSTANT ? 0 : 220); return; }
        feed(b); advance(TIME);
      });
      input.addEventListener('input', () => { st.otherText = input.value; valid(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (!$.btn.disabled) SCENES[GOAL].next(); } });
      valid();
    },
    next() { go(TIME); },
    back() { go(LEVEL); },
  };
  SCENES[TIME] = {
    enter() {
      question('How much time?', `
        <p class="ob-glabel" id="obDaily">Each day</p>
        <div class="ob-chips ob-row" role="radiogroup" aria-labelledby="obDaily">${MINUTES.map((m) => chip(m, m + ' min', st.daily === m)).join('')}</div>
        <p class="ob-glabel" id="obSpan">Finish in</p>
        <div class="ob-chips ob-row" role="radiogroup" aria-labelledby="obSpan">${SPANS.map(([id, l]) => chip(id, l, st.span === id)).join('')}</div>
        <p class="ob-note" aria-live="polite"></p>`, 'ob-time');
      qScene();
      const [daily, span] = $.pane.querySelectorAll('.ob-chips');
      const mark = (g, v) => g.querySelectorAll('[role="radio"]').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.v === String(v))));
      radios(daily, (v, b) => {
        st.daily = +v;
        if (!st.spanSet) { st.span = SPAN_FOR[st.daily]; mark(span, st.span); }
        note(); valid(); feed(b);
      });
      radios(span, (v, b) => { st.span = v; st.spanSet = true; note(); valid(); feed(b); });
      const valid = () => setCta('Build my course', !!(st.daily && st.span));
      note(); valid();
    },
    next() { go(BUILD); },
    back() { go(GOAL); },
  };
  // "7 stops, done by 12 December."
  function note() {
    const el = $.pane.querySelector('.ob-note'); if (!el) return;
    if (!st.daily || !st.span) { el.textContent = ''; return; }
    const n = window.planLength ? planLength(st.daily, st.span) : 8, days = (SPANS.find((s) => s[0] === st.span) || SPANS[1])[2];
    const d = new Date(Date.now() + days * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    el.textContent = `${n} stops, done by ${d}.`;
  }
  function qScene() { dark(false); chrome({ q: true, cta: true }); Brain.setSpin(false); Brain.setMode('idle'); showTopic(); }

  SCENES[BUILD] = { // The particles form the topic, then condense into your course. One line says who it's for.
    enter() {
      dark(false); chrome({}); Brain.setSpin(false);
      const p = prof(), i = info(), shape = topicShape(i), pal = i.palette || 'cobalt';
      st.courseId = window.buildCourse ? buildCourse(p) : null;
      const c = st.courseId && window.COURSES ? COURSES[st.courseId] : null;
      pane(`<p class="ob-eyebrow">Building your course</p><p class="ob-summary" aria-live="polite"></p>`, 'ob-build');
      place(184, 318, 1); Brain.setMode('think');
      Brain.setShape('scatter', pal, 700);
      later(() => { Brain.setShape(shape, pal, 1600); Brain.pulse(); }, 650);
      later(() => { Brain.setMode('idle'); Brain.setShape(seedShape(i.color || ['#F07B5A', '#B83A1C']), pal, 1100); place(184, 286, 0.7); $.pane.classList.add('built'); }, 2900);
      const line = c ? c.summary : 'Built for you.', words = line.split(/\s+/).length;
      later(() => writeSummary(line, c ? c.summaryKeys : []), 3300);
      // Hand off once the line has been written and there's been time to read it
      if (STILL) { $.cta.classList.remove('hide'); setCta('See my plan', true); } else later(finish, 3300 + words * 55 + 600 + Math.max(1700, words * 150));
    },
    next() { finish(); },
  };
  // The line, word by word, with the words you said lit up
  function writeSummary(text, keys) {
    const el = $.pane.querySelector('.ob-summary'); if (!el) return;
    const marks = []; (keys || []).forEach((k) => { const at = text.indexOf(k); if (k && at >= 0) marks.push([at, at + k.length]); });
    let html = '', pos = 0;
    text.split(/(\s+)/).forEach((tok) => {
      const start = pos; pos += tok.length; if (!tok.trim()) { html += ' '; return; }
      const em = marks.some(([a, b]) => start >= a && start < b);
      html += `<span class="w${em ? ' em' : ''}">${esc(tok)}</span>`;
    });
    el.innerHTML = html;
    [...el.querySelectorAll('.w')].forEach((w, k) => setTimeout(() => w.classList.add('on'), STILL ? 0 : 60 + k * 55));
  }
  function finish() {
    if (st.step !== BUILD || st.done) return;
    st.done = true; root.classList.add('ob-leave');
    const p = prof();
    const payload = { style: 'roadmap', topic: (st.courseId && COURSES[st.courseId] ? COURSES[st.courseId].title : p.topicLabel), goal: p.goal, span: p.span,
      daily: p.daily + ' min a day', courseId: p.topic, profile: p };
    setTimeout(() => {
      timers.forEach(clearTimeout); timers = []; parts = []; st.done = false;
      Brain.setMode('idle'); Brain.setSpin(false); Brain.setDark(false);
      Bus.emit('onboarding:done', payload);
    }, INSTANT ? 0 : 320);
  }

  // ---------- Engine ----------
  function go(i) {
    if (i < 0 || i >= SCENES.length) return;
    timers.forEach(clearTimeout); timers = []; st.busy = false; st.done = false;
    root.classList.remove('ob-leave');
    const scr = document.getElementById('screen'); if (scr) scr.scrollTop = 0;
    st.step = i; SCENES[i].enter();
    if (window.Bus) Bus.emit('onboarding:step', { index: i });
  }
  // Which earlier answers a step needs
  const ready = (step) => (step < REASON || !!prof().topic) && (step < ROLE || !!st.reason) && (step < GOAL || !!st.level) && (step < TIME || !!st.goal) && (step < BUILD || !!(st.daily && st.span));
  let seededFromUrl = false;
  function start(step) {
    if (!mounted) return;
    step = Math.max(0, Math.min(STEPS.length - 1, parseInt(step, 10) || 0));
    Brain.moveTo($.brain);
    // ?persona=… fills every answer; jumping past a question nobody answered fills it from the current persona
    if (!seededFromUrl && P.get('persona')) { seededFromUrl = true; seed(P.get('persona')); }
    if (!ready(step)) seed((window.Store && Store.get().variants.persona) || 'priya');
    go(step);
  }

  window.Onboarding = { mount, start, steps: STEPS, index: () => st.step };
})();
