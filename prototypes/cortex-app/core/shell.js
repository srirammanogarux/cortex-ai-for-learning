// App shell: frame scaling, router (onboarding → tabs), tab bar, paywall, side panel. See CONTRACT.md.
(function () {
  const $ = (id) => document.getElementById(id);
  const P = new URLSearchParams(location.search);
  if (P.has('still')) document.documentElement.classList.add('still');
  const screen = $('screen');

  function fit() { const s = Math.min(1, (window.innerHeight - 48) / 844); window.PS = s; $('phoneWrap').style.transform = `scale(${s})`; $('phoneHolder').style.width = 390 * s + 'px'; $('phoneHolder').style.height = 844 * s + 'px'; }
  window.addEventListener('resize', fit); fit();

  // One brain canvas for the whole app. Modules move it into their own container with Brain.moveTo(el).
  Brain.mount($('brain'));
  if (P.has('still')) setInterval(() => Brain.snap(), 150);

  const TABS = ['learn', 'ask', 'profile'];
  const MODS = { learn: () => window.Learn, ask: () => window.Ask, profile: () => window.Profile };
  const ICON = {
    learn: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="6" cy="19" r="2"/><path d="M8 5.6c5 1 8 2.6 8 5M16 13.4c0 2.4-3 4-8 5"/></svg>',
    ask: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c.6 4.8 2.7 6.9 9.5 9.5-6.8 2.6-8.9 4.7-9.5 9.5-.6-4.8-2.7-6.9-9.5-9.5 6.8-2.6 8.9-4.7 9.5-9.5z"/></svg>',
    profile: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><circle cx="4.5" cy="7" r="2"/><circle cx="19.5" cy="7" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="17.5" r="2"/></svg>',
  };
  const LABEL = { learn: 'Learn', ask: 'Ask', profile: 'Profile' };
  let current = null; // 'onboarding' | tab name

  // ---------- Tab bar ----------
  const bar = $('tabbar');
  bar.innerHTML = TABS.map((t) => `<button data-tab="${t}">${ICON[t]}${LABEL[t]}</button>`).join('');
  bar.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => App.showTab(b.dataset.tab)));

  // ---------- Router ----------
  const App = (window.App = {
    showOnboarding(step = 0) {
      current = 'onboarding';
      $('onboardingLayer').hidden = false; bar.classList.add('hide');
      TABS.forEach((t) => { const m = MODS[t](); if (m && m.hide) m.hide(); $(t + 'View').hidden = true; });
      if (window.Onboarding) Onboarding.start(step);
      Bus.emit('route', { screen: 'onboarding', step }); renderSide();
    },
    showTab(name) {
      if (!TABS.includes(name)) name = 'learn';
      const prev = current; current = name;
      $('onboardingLayer').hidden = true; bar.classList.remove('hide'); screen.classList.remove('is-dark');
      TABS.forEach((t) => {
        const on = t === name; $(t + 'View').hidden = !on;
        const m = MODS[t](); if (m) { if (on && m.show) m.show(); if (!on && t === prev && m.hide) m.hide(); }
      });
      bar.querySelectorAll('[data-tab]').forEach((b) => { if (b.dataset.tab === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
      Bus.emit('route', { screen: 'tab', tab: name }); renderSide();
    },
    setTabBar(visible) { bar.classList.toggle('hide', !visible); },
    paywall,
    gate,
    current: () => current,
  });

  // Finish onboarding → Learn opens on the plan reveal ("Your learning plan"). The paywall depends on the variant.
  Bus.on('onboarding:done', (d) => {
    const id = (window.buildCourse && d.profile) ? buildCourse(d.profile) : registerCatalogCourse(d.courseId);
    addCourse(id);
    Store.set({ style: 'roadmap', topic: d.topic, goal: d.goal, span: d.span, daily: d.daily, activeCourse: id, profile: d.profile || null, justBuilt: true });
    Bus.emit('course:created', { id });
    App.showTab('learn');
    if (Store.get().variants.paywall === 'onboarding') setTimeout(() => { if (!Store.get().paywallSeen) paywall('onboarding'); }, P.has('still') ? 50 : 2600);
  });
  function addCourse(id) {
    const s = Store.get(); if (s.courses.find((c) => c.id === id)) return;
    const c = COURSES[id]; s.courses.push({ id, title: c.title, progress: {} }); Store.set({ courses: s.courses, activeCourse: id });
  }
  window.addCourse = addCourse;
  // A course picked from the catalog becomes a real course for Learn: heart's structure, the catalog's titles.
  function registerCatalogCourse(cid) {
    const cat = window.CATALOG && CATALOG[cid];
    if (!cid || cid === 'heart' || !cat || !cat.lessons) return 'heart';
    if (COURSES[cid]) return cid;
    const H = COURSES.heart, shapes = ['heart', 'grid', 'spike', 'split', 'wave', 'spike', 'burst', 'bars', 'ring'];
    const lessons = [];
    cat.lessons.forEach((l, i) => {
      lessons.push({ id: cid + '-l' + (i + 1), kind: 'lesson', title: l.title, hook: l.hook, shape: cat.shape || shapes[i % shapes.length] });
      if (i === 3) lessons.push({ id: cid + '-review1', kind: 'review', title: 'Quick review', hook: 'Five fast questions on what you’ve covered.' });
    });
    lessons.push({ id: cid + '-final', kind: 'final', title: 'Final challenge', hook: 'Put it all together, and earn your collectible.' });
    COURSES[cid] = Object.assign({}, H, {
      id: cid, title: cat.title, topic: cat.outcome, subject: cat.subject, palette: cat.palette, color: cat.color, shape: cat.shape,
      goals: (cat.goals || H.goals).map((g, i) => Object.assign({}, g, { id: H.goals[i] ? H.goals[i].id : g.id })),
      lessons, gift: Object.assign({}, H.gift, { title: 'The ' + cat.title.toLowerCase() + ' badge', shape: cat.shape, palette: cat.palette }),
    });
    return cid;
  }
  Bus.on('ask:open', () => { if (current !== 'ask') App.showTab('ask'); });

  // ---------- Gates: where the paywall can interrupt. Modules ask; the shell decides by Store.variants.paywall. ----------
  // 'tab' (default): Learn after the first course (next-course), Ask after FREE.asks questions / FREE.branches per question.
  // 'hard': nothing past the plan without Plus. 'onboarding': a dismissible paywall on landing. 'soft': dismissible after every lesson.
  const FREE = { asks: 4, branches: 4 };
  window.FREE_LIMITS = FREE;
  function gate(moment, opts = {}) {
    const s = Store.get(), v = s.variants.paywall;
    if (Store.isPlus()) return Promise.resolve(true);
    const open = (reason, o) => new Promise((res) => { const off = Bus.on('paywall:close', (e) => { off(); res(!!e.upgraded); }); paywall(reason, o); });
    if (moment === 'start') return v === 'hard' ? open('hard', { hard: true }) : Promise.resolve(true);
    if (moment === 'lesson-done') return v === 'soft' ? open('lesson').then(() => true) : Promise.resolve(true);
    if (moment === 'next-course') return open('courses');
    if (moment === 'ask') { if (s.asksUsed < FREE.asks) { Store.set({ asksUsed: s.asksUsed + 1 }); return Promise.resolve(true); } return open('ask'); }
    if (moment === 'branch') {
      const q = opts.qid || 'q', n = s.branchesUsed[q] || 0;
      if (n < FREE.branches) { s.branchesUsed[q] = n + 1; Store.set({ branchesUsed: s.branchesUsed }); return Promise.resolve(true); }
      return open('branch');
    }
    if (moment === 'graph') return open('graph');
    return Promise.resolve(true);
  }

  // ---------- Paywall (shell-owned, any module can open it) ----------
  const PERKS = {
    onboarding: ['Ask anything, answered in visuals you can play with', 'Branch as deep and as wide as you like', 'See your whole knowledge graph grow', 'More than 3 courses'],
    ask: ['Ask anything, answered in visuals you can play with', 'Branch from any word, as far as you like', 'Everything you ask joins your knowledge graph'],
    branch: ['Unlimited branches on every question', 'Zoom out to your whole tree', 'Every branch joins your knowledge graph'],
    graph: ['Your whole knowledge graph, across every subject', 'Watch your archetype take shape', 'See what you’re about to forget'],
    courses: ['Your next course, already built for you', 'As many courses as you like', 'Every course grows your graph'],
    hard: ['Your plan, every lesson in it', 'Ask anything, answered in visuals', 'Your knowledge graph, growing as you learn'],
    lesson: ['Every lesson in your plan', 'Ask anything, branch anywhere', 'Your whole knowledge graph'],
  };
  const TITLES = { onboarding: 'Your course is ready. Go further with Plus', ask: 'You’ve used your free questions', branch: 'Keep branching', graph: 'See your whole graph', courses: 'Your next course is ready', hard: 'Start your plan with Plus', lesson: 'Enjoying it? Keep going with Plus' };
  function paywall(reason = 'onboarding', opts = {}) {
    if (Store.isPlus()) return;
    Store.set({ paywallSeen: true });
    const L = $('sheetLayer'); L.innerHTML = '';
    const bd = document.createElement('div'); bd.className = 'pw-backdrop';
    const sh = document.createElement('div'); sh.className = 'pw-sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-label', 'Cortex Plus');
    sh.innerHTML = `<div class="pw-grab"></div><button class="pw-x" aria-label="Close" data-close><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <p class="pw-eyebrow">CORTEX PLUS</p><h2 class="pw-title">${TITLES[reason] || TITLES.onboarding}</h2>
      <p class="pw-sub">3 days free, then $49.99 a year. Prices are placeholders.</p>
      <div class="pw-perks">${(PERKS[reason] || PERKS.onboarding).map((p) => `<div class="pw-perk"><i><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></i>${p}</div>`).join('')}</div>
      <button class="btn-lit" data-trial>Start 3 days free</button>${opts.hard ? '<button class="pw-free" data-close>Not now</button>' : '<button class="pw-free" data-close>Continue with the free plan</button>'}
      <p class="pw-fine">${opts.hard ? 'Plus is needed to start lessons in this test.' : 'Free: your first course · 4 questions with 4 branches each · a preview of your graph.'}</p>`;
    L.appendChild(bd); L.appendChild(sh);
    const close = (upgraded) => { sh.classList.add('closing'); bd.classList.add('closing'); setTimeout(() => { L.innerHTML = ''; Bus.emit('paywall:close', { reason, upgraded }); }, 220); };
    if (!opts.hard) bd.addEventListener('click', () => close(false));
    sh.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => close(false)));
    sh.querySelector('[data-trial]').addEventListener('click', () => { Store.set({ plan: 'plus' }); toast('Plus is on. 3 days free'); close(true); });
    Bus.emit('paywall:open', { reason });
  }

  // ---------- Side panel ----------
  const VARIANTS = [
    ['askHome', 'Ask home', [['A', 'Box + wonder'], ['B', 'Map home'], ['C', 'Character']]],
    ['lesson', 'Lesson style', [['1', 'Paced'], ['2', 'Cards'], ['3', 'By style']]],
    ['persona', 'Persona', [['priya', 'Priya'], ['arjun', 'Arjun'], ['maya', 'Maya'], ['tom', 'Tom'], ['lena', 'Lena']]],
    ['roadmap', 'Roadmap', [['stack', 'Stack'], ['timeline', 'Timeline'], ['chapters', 'Chapters'], ['path', 'Path']]],
    ['paywall', 'Paywall', [['tab', 'By tab'], ['hard', 'Hard'], ['onboarding', 'On landing'], ['soft', 'Soft']]],
    ['mascot', 'Mascot (Ask)', [['A', 'Line'], ['F', 'Particle']]],
    ['orbs', 'Graph orbs', [['i', 'Drawn'], ['ii', 'Painted'], ['iii', 'Duotone'], ['iv', 'Scenes']]],
  ];
  function renderSide() {
    const s = Store.get(), obSteps = (window.Onboarding && Onboarding.steps) || [];
    const obIdx = window.Onboarding && Onboarding.index ? Onboarding.index() : -1;
    $('jump').innerHTML = obSteps.map((n, k) => `<button data-ob="${k}" ${current === 'onboarding' && obIdx === k ? 'aria-current="step"' : ''}><i>${k + 1}</i>${n}</button>`).join('') +
      TABS.map((t, k) => `<button data-t="${t}" ${current === t ? 'aria-current="step"' : ''}><i>${obSteps.length + k + 1}</i>${LABEL[t]} tab</button>`).join('');
    $('jump').querySelectorAll('[data-ob]').forEach((b) => b.addEventListener('click', () => App.showOnboarding(+b.dataset.ob)));
    $('jump').querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => { ensureDemo(); App.showTab(b.dataset.t); }));
    $('variants').innerHTML = VARIANTS.map(([key, label, opts]) => `<h3>${label}</h3><div class="seg" role="group" aria-label="${label}">${opts.map(([v, l]) => `<button data-v="${key}:${v}" aria-pressed="${s.variants[key] === v}">${l}</button>`).join('')}</div>`).join('') +
      `<h3>Learning style</h3><div class="seg">${[['quick', 'Quick'], ['connect', 'Connect'], ['roadmap', 'Roadmap']].map(([v, l]) => `<button data-style="${v}" aria-pressed="${s.style === v}">${l}</button>`).join('')}</div>` +
      `<h3>Plan</h3><div class="seg">${[['free', 'Free'], ['plus', 'Plus']].map(([v, l]) => `<button data-plan="${v}" aria-pressed="${s.plan === v}">${l}</button>`).join('')}</div><p class="seg-note">Prototype controls. Switch any time.</p>`;
    $('variants').querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => { const [k, v] = b.dataset.v.split(':'); Store.variant(k, v); renderSide(); }));
    $('variants').querySelectorAll('[data-style]').forEach((b) => b.addEventListener('click', () => { Store.set({ style: b.dataset.style }); renderSide(); }));
    $('variants').querySelectorAll('[data-plan]').forEach((b) => b.addEventListener('click', () => { Store.set({ plan: b.dataset.plan }); renderSide(); }));
  }
  Bus.on('onboarding:step', renderSide);
  Bus.on('store:change', ({ patch }) => { if ('plan' in patch || 'style' in patch) renderSide(); });
  $('restart').addEventListener('click', () => location.href = location.pathname);

  // Jumping straight into the app: fill in a believable onboarding result.
  function ensureDemo(force) {
    const s = Store.get();
    if (s.courses.length && !force) return;
    const per = window.PERSONAS && PERSONAS[s.variants.persona];
    if (per && window.buildCourse) {
      const p = per.profile, id = buildCourse(p);
      Store.set({ courses: [], activeCourse: null });
      addCourse(id);
      Store.set({ style: 'roadmap', topic: p.topicLabel, goal: p.goal, span: p.span, daily: typeof p.daily === 'number' ? p.daily + ' min a day' : p.daily, profile: p, paywallSeen: true, activeCourse: id });
      return;
    }
    if (!s.courses.length) { addCourse('heart'); Store.set({ style: s.style || 'connect', topic: 'How the human heart works', goal: s.goal || 'how', span: s.span || 'twoweeks', daily: '10 min a day', paywallSeen: true }); }
  }
  // Switching persona in the side panel: on a tab, rebuild that persona's course and reopen the tab.
  Bus.on('variant:change', ({ key }) => { if (key === 'persona' && current && current !== 'onboarding') { ensureDemo(true); App.showTab(current); } });
  window.ensureDemo = ensureDemo;

  // ---------- Mount modules ----------
  if (window.Onboarding) Onboarding.mount($('onboardingLayer'));
  TABS.forEach((t) => { const m = MODS[t](); if (m) m.mount($(t + 'View')); });

  // Start: ?tab=learn|ask|profile skips onboarding; ?ob=N starts at an onboarding step.
  const tab = P.get('tab');
  if (tab) { ensureDemo(); App.showTab(tab); } else App.showOnboarding(parseInt(P.get('ob'), 10) || 0);
  if (P.get('paywall')) setTimeout(() => paywall(P.get('paywall')), 100);
})();
