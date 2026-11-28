// Learn tab (module B): your learning plan (4 roadmap styles), the plan reveal, lessons, adaptive stops,
// light sheets after lesson 1, the pace check-in, and the course end with your next course.
// Content lives in learn/content.js (window.LEARN). Talks to other modules only via Bus, Store and App.
// Small illustrations are painted (OrbGlyphs 'ii'). Particles appear only in the collectible at the end.
(function () {
  const L = window.LEARN || { terms: {}, lessons: {}, review: [], final: [], short: {}, plan: {} };
  const P = new URLSearchParams(location.search);
  const docEl = document.documentElement;
  const still = () => docEl.classList.contains('still');
  const reducedQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const calm = () => still() || reducedQ.matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const say = (m) => window.toast && window.toast(m);
  const brain = () => window.Brain || null;
  const S = () => window.Store.get();
  const gate = (m, o) => (window.App && App.gate ? App.gate(m, o) : Promise.resolve(true));
  const tabBar = (v) => { if (window.App && App.setTabBar) App.setTabBar(v); };
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  let uid = 0;

  // Timers are grouped so closing a lesson cancels its pending choreography.
  const T = { home: [], play: [] };
  const after = (g, fn, ms) => { const id = setTimeout(fn, still() ? 0 : ms); T[g].push(id); return id; };
  const clearT = (g) => { T[g].forEach(clearTimeout); T[g] = []; };

  // ───────── Icons ─────────
  const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const IC = {
    x: ['M18 6L6 18', 'M6 6l12 12'],
    check: ['M20 6L9 17l-5-5'],
    chev: ['M9 18l6-6-6-6'],
    caret: ['M6 9l6 6 6-6'],
    lock: ['M7.5 11V8a4.5 4.5 0 0 1 9 0v3', 'M6.5 11h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-7A1.5 1.5 0 0 1 6.5 11z'],
    shuffle: ['M16 3h5v5', 'M4 20L21 3', 'M21 16v5h-5', 'M15 15l6 6', 'M4 4l5 5'],
    clock: [circ(12, 12, 9.5), 'M12 7v5l3.5 2'],
    sparkle: ['M12 3l1.9 5.8L20 10.8l-6.1 2L12 19l-1.9-6.2L4 10.8l6.1-2z'],
    hand: ['M18 11V6a2 2 0 0 0-4 0v5', 'M14 10V4a2 2 0 0 0-4 0v6', 'M10 10.5V6a2 2 0 0 0-4 0v8', 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'],
    alert: [circ(12, 12, 9.5), 'M12 7.5v5', 'M12 16.2v.01'],
    plus: ['M12 5v14', 'M5 12h14'],
    share: ['M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7', 'M16 6l-4-4-4 4', 'M12 2v13'],
    heart: ['M12 20.5s-8-4.6-8-10.6A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8 2.6c0 6-8 10.6-8 10.6z'],
    zap: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
    door: ['M13 4h3a2 2 0 0 1 2 2v14', 'M2 20h3', 'M13 20h9', 'M10 12v.01', 'M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56z'],
    drop: ['M12 2.7s6.5 6.8 6.5 11.8a6.5 6.5 0 0 1-13 0c0-5 6.5-11.8 6.5-11.8z'],
    moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z'],
    route: [circ(6, 19, 2.5), 'M8.5 19h8a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7h8', circ(18, 5, 2.5)],
    walk: [circ(13.5, 4, 2), 'M10 21l2-6 3 3v3', 'M7.5 12.5l3-4 4 1 2.5 3', 'M12 15l1.5-6.5'],
    shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
    up: ['M12 19V5', 'M5 12l7-7 7 7'],
    down: ['M12 5v14', 'M19 12l-7 7-7-7'],
    gauge: ['M3.5 16a8.5 8.5 0 1 1 17 0', 'M12 16l4.2-5.2'],
    wave: ['M2 12h3.5l2.5-6 4 12 3-9 2 3H22'],
    grid: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
    nodes: [circ(6, 6, 2.5), circ(18, 8, 2.5), circ(10, 18, 2.5), 'M8.3 7l7.3.8', 'M7 8.3l2.2 7.4', 'M16.4 10l-4.6 6.2'],
    arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
    mail: ['M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z', 'M3.5 7l8.5 6 8.5-6'],
    bell: ['M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z', 'M10 20.5a2 2 0 0 0 4 0'],
    minus: ['M5 12h14'],
    slow: [circ(12, 12, 9.5), 'M8 12h8'],
  };
  const ic = (n, size = 20, sw = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(IC[n] || IC.sparkle).map((d) => `<path d="${d}"/>`).join('')}</svg>`;
  const APPLE = '<svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.72-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.3-.88-2.32-3.5zM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.66.97.07 1.96-.49 2.56-1.21z"/></svg>';
  const GOOGLE = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.74 2.98-4.3 2.98-7.35zM12 22c2.7 0 4.96-.9 6.62-2.42l-3.23-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.81-1.76-5.6-4.12H3.07v2.6A10 10 0 0 0 12 22zM6.4 13.91a6 6 0 0 1 0-3.82v-2.6H3.07a10 10 0 0 0 0 9.02zM12 5.98c1.47 0 2.79.5 3.83 1.5l2.86-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.33 2.6C7.19 7.74 9.4 5.98 12 5.98z"/></svg>';
  function flameSVG(size = 20) {
    const id = 'lnf' + (++uid);
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC078"/><stop offset="1" stop-color="#E8590C"/></linearGradient></defs>
      <path d="M12 2c.7 3.3 2.5 5 4.1 6.7C17.8 10.5 19 12.5 19 15a7 7 0 0 1-14 0c0-2.4 1-4.2 2.5-5.5.3 1.6 1.1 2.8 2.4 3.4C9.4 9.1 10.4 5.2 12 2z" fill="url(#${id})"/>
      <path d="M12 13.3c1.5 1.3 2.5 2.4 2.5 3.9a2.5 2.5 0 0 1-5 0c0-1.4.9-2.6 2.5-3.9z" fill="#FFF0DC"/></svg>`;
  }

  // ───────── Painted illustrations (OrbGlyphs 'ii') ─────────
  const SUBJECTS = ['body', 'mind', 'space', 'tech', 'nature', 'arts', 'society', 'history'];
  const SUBJ_ALIAS = { biology: 'body', health: 'body', medicine: 'body', fitness: 'body', language: 'society', languages: 'society', business: 'society', money: 'society', finance: 'society', economics: 'society', work: 'society', ai: 'tech', technology: 'tech', computing: 'tech', coding: 'tech', science: 'space', physics: 'space', astronomy: 'space', psychology: 'mind', art: 'arts', photography: 'arts', music: 'arts', design: 'arts', ecology: 'nature', animals: 'nature' };
  const subjOf = (d) => { const s = String((d && d.subject) || 'body').toLowerCase(); return SUBJECTS.includes(s) ? s : SUBJ_ALIAS[s] || 'mind'; };
  function paint(id, size, o = {}) {
    const OG = window.OrbGlyphs;
    if (!OG) return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" fill="#F3E3CF"/><circle cx="24" cy="24" r="12" fill="#D4502F"/></svg>`;
    const motif = o.motif && OG.motifs.includes(o.motif) ? o.motif : undefined;
    return OG.svg(id, 'ii', o.subject || 'body', size, { motif, label: o.label });
  }
  // The painted drawing for a stop on the plan
  function artOf(x, d, size) {
    d = d || courseData(course());
    const pl = planFor(d), subject = subjOf(d);
    if (x.kind === 'recap' && x.from) { const src = (d.lessons || []).find((y) => y.id === x.from); if (src) return paint(src.id, size, { subject, motif: glyphKey(src, d), label: src.title }); }
    const OG = window.OrbGlyphs, hub = OG ? OG.motif(d.id, subject, d.title) : null;
    const motif = x.glyph || (pl && pl.glyph && pl.glyph[x.id]) || (x.kind === 'review' ? 'forget' : x.kind === 'final' ? (d.glyph || hub) : null);
    return paint(x.id, size, { subject, motif, label: x.title });
  }
  const glyphKey = (x, d) => x.glyph || (planFor(d) && planFor(d).glyph && planFor(d).glyph[x.id]) || null;
  const artBox = (x, d, size, cls = '') => `<span class="ln-art ${cls}" data-keep-colour>${artOf(x, d, size)}</span>`;

  // ───────── Course data ─────────
  function course() {
    const s = S(); if (!s.courses || !s.courses.length) return null;
    return s.courses.find((c) => c.id === s.activeCourse) || s.courses[0];
  }
  const courseData = (c) => (window.COURSES && c && (COURSES[c.id] || COURSES.heart)) || null;
  const planFor = (d) => (d && L.plan && L.plan[d.id]) || null;
  const goalId = () => S().goal || 'how';
  const dailyText = () => { const v = S().daily || (S().profile && S().profile.daily) || 10; return typeof v === 'number' || /^\d+$/.test(v) ? `${v} min a day` : String(v); };
  function summaryOf(d) {
    const pl = planFor(d);
    if (d.summary) return d.summary;
    if (pl && pl.summary) return pl.summary[goalId()] || pl.summary.how;
    const p = S().profile;
    return p && p.roleText ? `Built for a ${p.roleText.toLowerCase()} who wants to ${goalShortOf(d)}.` : `Built around what you told us: ${goalShortOf(d)}.`;
  }
  function goalShortOf(d) {
    const pl = planFor(d), p = S().profile;
    if (d.goalShort) return d.goalShort;
    if (pl && pl.goalShort) return pl.goalShort[goalId()] || pl.goalShort.how;
    if (p && p.goalText) return p.goalText.replace(/\.$/, '').replace(/^./, (m) => m.toLowerCase());
    return 'learn ' + String(d.topic || d.title || 'this').toLowerCase();
  }
  // The base plan: a built (personalised) course is used as it is; the heart demo is cut to goal and span.
  function baseStops(c) {
    const d = courseData(c); if (!d) return [];
    if (d.summary || d.persona || d.built || !d.spans || !window.courseRoadmap) return (d.lessons || []).slice();
    return courseRoadmap(d, S().goal, S().span);
  }
  // What Learn changed for you: added stops, skipped stops, minutes, tags, a note. Kept on the Store course entry.
  function adapt(c = course()) {
    if (!c) return { added: [], skip: {}, mins: {}, tags: {}, why: {}, changed: [] };
    return c.adapt || (c.adapt = { added: [], skip: {}, mins: {}, tags: {}, why: {}, pace: null, note: null, changed: [] });
  }
  function stops(c = course()) {
    if (!c) return [];
    const a = adapt(c), out = [];
    baseStops(c).forEach((x) => {
      if (a.skip[x.id]) return;
      out.push(x);
      const chain = (id) => a.added.filter((r) => r.after === id).forEach((r) => { out.push(r); chain(r.id); });
      chain(x.id);
    });
    return out;
  }
  const progress = (c = course()) => { if (!c) return {}; return c.progress || (c.progress = {}); };
  function states(list, c = course()) {
    const p = progress(c); let cur = false;
    return list.map((st) => { if (p[st.id] === 'done') return 'done'; if (!cur) { cur = true; return 'current'; } return 'locked'; });
  }
  let muted = false;
  function saveCourses() { muted = true; window.Store.set({ courses: S().courses }); muted = false; }

  // Lessons: the heart course has rich content; any other course gets a light generic lesson from its plan.
  const content = (st) => L.lessons[st.id] || genericLesson(st);
  const isHeartLesson = (st) => !!L.lessons[st.id];
  function genericLesson(st) {
    const peers = (courseData(course()).lessons || []).filter((x) => x.kind !== 'review' && x.kind !== 'final' && x.id !== st.id && x.hook);
    const quiz = st.quiz || (st.hook && peers.length >= 2 ? [autoQ(st, peers)] : []);
    return { min: st.min || 4, answer: st.answer || st.hook || st.title, blocks: st.points ? [{ type: 'points', eyebrow: 'The key ideas', title: st.title, items: st.points }] : [], extra: [], recap: st.recap || [st.hook || st.title], quiz };
  }
  function autoQ(st, peers) {
    const seed = [...st.id].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const others = [peers[seed % peers.length], peers[(seed + 1) % peers.length]].filter((x, i, a) => a.indexOf(x) === i).map((x) => x.hook);
    const opts = others.slice(0, 2); const at = seed % (opts.length + 1); opts.splice(at, 0, st.hook);
    return { q: `Which line sums up “${st.title}”?`, options: opts, answer: at, explain: st.hook };
  }
  function baseMinutes(st) {
    if (st.kind === 'recap') return 1;
    if (st.kind === 'review') return st.min || 2;
    if (st.kind === 'final') return st.min || 3;
    return (L.lessons[st.id] && L.lessons[st.id].min) || st.min || 4;
  }
  function minutes(st) { const a = adapt(); return a.mins[st.id] != null ? a.mins[st.id] : baseMinutes(st); }
  function lessonNo(list, st) { let n = 0; for (const x of list) { if (x.kind === 'lesson' || !x.kind) n++; if (x.id === st.id) return n; } return n; }
  const isLesson = (x) => !x.kind || x.kind === 'lesson';
  function stopMeta(list, st) {
    if (st.kind === 'review') return `Review · ${minutes(st)} min`;
    if (st.kind === 'final') return `Final challenge · ${minutes(st)} min`;
    if (st.kind === 'recap') return `Recap · ${minutes(st)} min`;
    return `Lesson ${lessonNo(list, st)} · ${minutes(st)} min`;
  }
  const shortOf = (st) => L.short[st.id] || st.title;
  // Why this stop is in your plan
  function becauseOf(x, list, d) {
    const a = adapt(), pl = planFor(d);
    if (a.why[x.id]) return a.why[x.id];
    if (x.because) return x.because;
    if (pl && pl.because && pl.because[x.id]) return pl.because[x.id];
    const i = list.indexOf(x), prev = list.slice(0, Math.max(0, i)).reverse().find(isLesson);
    if (x.kind === 'review') return 'Brings back what you have covered before it fades';
    if (x.kind === 'final') return 'Shows it stuck, and earns your collectible';
    return prev ? `Builds on “${prev.title}”` : 'Starts from what you already know';
  }
  function forYouOf(x, d) {
    const pl = planFor(d);
    if (x.forYou) return x.forYou;
    if (pl && pl.forYou && pl.forYou[x.id]) return pl.forYou[x.id];
    return `As you go, think about how you would use this to ${goalShortOf(d)}.`;
  }
  const tagOf = (x) => (x.added ? 'Added for you' : adapt().tags[x.id] || '');

  // ───────── State ─────────
  let viewEl, root, home, dock, goBtn, play, stage, bar, cta, cta2, tagline, popEl = null, panel, confetti, sheet = null;
  let PL = null;              // the open player (lesson, review, recap or finale)
  let shown = false, hooksRan = false, chOpen = null, revealRan = false, revealAt = 0;

  // ───────── Rich text with glowing terms ─────────
  function termBtn(id, txt) {
    const seen = PL && PL.seen.has(id);
    return `<button type="button" class="ln-term${seen ? ' is-done' : ''}" data-act="term" data-term="${id}"><span class="ln-term-ic">${ic(seen ? 'check' : 'sparkle', 12, 2.6)}</span>${esc(txt)}</button>`;
  }
  const rich = (s) => esc(s).replace(/\[\[(\w+)(?:\|([^\]]+))?\]\]/g, (m, id, txt) => (L.terms[id] ? termBtn(id, txt || L.terms[id].label) : (txt || id)));

  // ═════════════════════════ HOME: YOUR LEARNING PLAN ═════════════════════════
  const RM_STYLES = ['stack', 'timeline', 'chapters', 'path'];
  const rmStyle = () => { const v = S().variants && S().variants.roadmap; return RM_STYLES.includes(v) ? v : 'stack'; };
  const isReveal = () => !!S().justBuilt;

  function renderHome(o = {}) {
    clearT('home');
    const keep = o.keepScroll ? home.scrollTop : null;
    const c = P.has('empty') ? null : course();
    root.classList.toggle('is-reveal', false);
    if (!c) { home.innerHTML = emptyHTML(); setDock(null); return; }
    const d = courseData(c), list = stops(c), st = states(list, c), reveal = isReveal(), v = rmStyle();
    const doneN = st.filter((x) => x === 'done').length, curI = st.indexOf('current'), total = list.length;
    const ctx = { d, reveal, doneN, curI, changed: o.changed || [], arrive: o.added || null };
    const a = adapt(c);
    if (reveal && !revealRan) revealAt = performance.now();
    root.classList.toggle('is-reveal', reveal && !calm() && performance.now() - revealAt < 400);
    root.classList.toggle('is-planview', reveal);
    root.dataset.rm = v;
    home.innerHTML = `
      <header class="ln-ph">
        <div class="ln-ph-top"><p class="ln-ph-eb">Your learning plan</p>${reveal ? '' : `<button type="button" class="ln-streak" data-act="streak" aria-label="${S().streak}-day streak">${flameSVG(18)}<b>${S().streak}</b></button>`}</div>
        ${reveal ? `<h1 class="ln-ph-t">${esc(c.title || d.title)}</h1>`
          : `<button type="button" class="ln-ph-t ln-ph-sw" data-act="switch" aria-haspopup="dialog" aria-label="Switch course. Now: ${esc(c.title || d.title)}"><span>${esc(c.title || d.title)}</span><i>${ic('caret', 18, 2.6)}</i></button>`}
        ${reveal ? `<p class="ln-ph-sum">${esc(summaryOf(d))}</p><p class="ln-ph-meta">${list.length} stops · about ${list.reduce((n, x) => n + minutes(x), 0)} min · ${esc(dailyText())}</p>`
          : `<div class="ln-ph-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${doneN}" aria-label="${doneN} of ${total} stops done"><p><b>${doneN} of ${total}</b><span aria-hidden="true"> · </span>${esc(goalShortOf(d))}</p><div class="ln-meter"><i style="width:${Math.round(doneN / total * 100)}%"></i></div></div>`}
      </header>
      ${!reveal && a.note ? `<div class="ln-adnote${o.noteIn ? ' is-in' : ''}" role="status"><span class="ln-adnote-ic">${ic(a.pace === 'hard' ? 'slow' : a.pace === 'easy' ? 'zap' : 'check', 16, 2.4)}</span><p>${esc(a.note)}</p><button type="button" class="ln-adnote-x" data-act="note-x" aria-label="Dismiss">${ic('x', 15, 2.6)}</button></div>` : ''}
      <div class="ln-map ln-rm-${v}" data-map>${RM[v](list, st, ctx)}</div>`;
    if (reveal) { tabBar(false); revealRan = true; }
    const cur = curI >= 0 ? list[curI] : null;
    setDock(reveal ? 'reveal' : cur ? (doneN ? 'continue' : 'start') : 'complete', cur, list.length);
    if (o.justDone) celebrateStop(o.justDone, o.added);
    else if (keep != null) home.scrollTop = keep;
    else if (reveal) home.scrollTop = 0;
    else settleOn(home.querySelector('[data-cur]'));
  }

  function emptyHTML() {
    return `<div class="ln-empty">
      <span class="ln-art ln-empty-art" data-keep-colour>${paint('brain', 150, { subject: 'mind', motif: 'brain' })}</span>
      <h1 class="ln-h1">Build your first course</h1>
      <p class="ln-lead">Tell Cortex what you want to learn. It turns it into a short plan with a clear finish line.</p>
      <button type="button" class="btn-lit" data-act="build">Build a course</button></div>`;
  }

  // The sticky CTA: "Start learning" in the reveal and before lesson 1, then "Continue"
  function setDock(mode, cur, n) {
    if (!mode) { dock.hidden = true; return; }
    dock.hidden = false; dock.dataset.mode = mode;
    dock.style.setProperty('--n', Math.min(n || 6, 8));
    const label = { reveal: 'Start learning', start: 'Start learning', continue: 'Continue', complete: 'See your next course' }[mode];
    goBtn.textContent = label;
    goBtn.setAttribute('aria-label', cur && mode === 'continue' ? `Continue: ${cur.title}` : label);
  }

  // Shared bits for the four styles
  const tagsHTML = (x, s, ctx) => {
    const t = [];
    if (s === 'current' && !ctx.noCurTag) t.push(`<span class="ln-tag is-dark">${ctx.doneN && !ctx.reveal ? 'Up next' : 'Start here'}</span>`);
    const tg = tagOf(x); if (tg) t.push(`<span class="ln-tag is-for${ctx.changed.includes(x.id) || ctx.arrive === x.id ? ' is-pop' : ''}">${ic(x.added ? 'plus' : 'sparkle', 11, 2.8)}${esc(tg)}</span>`);
    return t.length ? `<span class="ln-tags">${t.join('')}</span>` : '';
  };
  const showWhy = (x, s, ctx) => ctx.reveal || x.added || s === 'current' || !!adapt().tags[x.id];
  const whyHTML = (x, list, ctx, cls = '') => `<span class="ln-why ${cls}">${esc(becauseOf(x, list, ctx.d))}</span>`;
  const stateWord = (s) => ({ done: 'Done', current: 'Start here', locked: 'Later' }[s]);
  const kindCls = (x) => (x.kind === 'review' ? ' is-review' : x.kind === 'final' ? ' is-final' : x.kind === 'recap' ? ' is-recap' : '') + (x.added ? ' is-added' : '');
  const doneMark = () => `<span class="ln-donemark" aria-hidden="true">${ic('check', 14, 3.2)}</span>`;
  const rowAttrs = (x, s, i, ctx, list) => `data-act="open" data-id="${esc(x.id)}"${s === 'current' ? ' data-cur' : ''} aria-label="${esc(x.title)}. ${stopMeta(list, x)}. ${stateWord(s)}${tagOf(x) ? '. ' + tagOf(x) : ''}"`;
  const arriveCls = (x, ctx) => (ctx.arrive === x.id ? ' is-arrive' : '') + (ctx.changed.includes(x.id) ? ' is-changed' : '');

  // Style 1 · Stack (default): full-width cards joined by a thin connector, like a learning plan
  function rmStack(list, st, ctx) {
    return `<ol class="ln-sk">${list.map((x, i) => {
      const s = st[i];
      return `<li class="ln-sk-i is-${s}${kindCls(x)}${arriveCls(x, ctx)} ln-in" style="--i:${i}">
        <button type="button" class="ln-sk-c" ${rowAttrs(x, s, i, ctx, list)}>
          ${artBox(x, ctx.d, 52, 'ln-sk-art')}
          <span class="ln-sk-tx">${tagsHTML(x, s, ctx)}<b>${esc(x.title)}</b><span class="ln-meta">${stopMeta(list, x)}</span>${showWhy(x, s, ctx) ? whyHTML(x, list, ctx) : ''}</span>
          ${s === 'done' ? doneMark() : ''}
        </button></li>`;
    }).join('')}</ol>`;
  }

  // Style 2 · Timeline: a thin line with numbered dots, a small painted thumbnail, the title and minutes
  function rmTimeline(list, st, ctx) {
    return `<ol class="ln-tl">${list.map((x, i) => {
      const s = st[i];
      return `<li class="ln-tl-i is-${s}${kindCls(x)}${arriveCls(x, ctx)} ln-in" style="--i:${i}">
        <button type="button" class="ln-tl-r" ${rowAttrs(x, s, i, ctx, list)}>
          <span class="ln-tl-dot" aria-hidden="true">${s === 'done' ? ic('check', 13, 3.2) : i + 1}</span>
          ${artBox(x, ctx.d, 40, 'ln-tl-art')}
          <span class="ln-tl-tx">${tagsHTML(x, s, ctx)}<b>${esc(x.title)}</b><span class="ln-meta">${stopMeta(list, x)}</span>${ctx.reveal || x.added ? whyHTML(x, list, ctx) : ''}</span>
          ${s === 'current' && !ctx.reveal ? `<span class="ln-tl-go" aria-hidden="true">${ic('chev', 16, 2.6)}</span>` : ''}
        </button></li>`;
    }).join('')}</ol>`;
  }

  // Style 3 · Chapters: 3 or 4 named chapters, one painting each. The current chapter is open.
  function chaptersOf(list, d) {
    const pl = planFor(d), defs = d.chapters || (pl && pl.chapters);
    let groups = [];
    if (defs) {
      groups = defs.map((g) => ({ name: g.name, items: [] }));
      let last = 0;
      list.forEach((x, i) => {
        let k = defs.findIndex((g) => g.ids.includes(x.id));
        if (k < 0) k = last; last = k; groups[k].items.push(i);
      });
      groups = groups.filter((g) => g.items.length);
    } else {
      const fin = list.findIndex((x) => x.kind === 'final'), body = list.map((x, i) => i).filter((i) => i !== fin);
      const n = body.length >= 9 ? 3 : 2, size = Math.ceil(body.length / n), names = ['The basics', 'Going deeper', 'Putting it to work'];
      for (let k = 0; k < n; k++) groups.push({ name: names[k], items: body.slice(k * size, (k + 1) * size) });
      groups = groups.filter((g) => g.items.length);
      if (fin >= 0) groups.push({ name: 'Finish line', items: [fin] });
    }
    return groups;
  }
  function rmChapters(list, st, ctx) {
    ctx = Object.assign({}, ctx, { noCurTag: !ctx.reveal });
    const groups = chaptersOf(list, ctx.d);
    const curG = groups.findIndex((g) => g.items.some((i) => st[i] === 'current'));
    return `<ol class="ln-ch">${groups.map((g, k) => {
      const dn = g.items.filter((i) => st[i] === 'done').length, all = dn === g.items.length, cur = k === curG;
      const open = ctx.reveal || (chOpen ? chOpen.has(k) : cur);
      const lead = list[g.items.find((i) => isLesson(list[i])) != null ? g.items.find((i) => isLesson(list[i])) : g.items[0]];
      const mins = g.items.reduce((n, i) => n + minutes(list[i]), 0), state = all ? 'done' : cur ? 'current' : 'locked';
      return `<li class="ln-ch-i is-${state}${open ? ' is-open' : ''} ln-in" style="--i:${k * 2}">
        <button type="button" class="ln-ch-h" data-act="chap" data-ch="${k}" aria-expanded="${open}" ${ctx.reveal ? 'tabindex="-1"' : ''}>
          ${artBox(lead, ctx.d, 56, 'ln-ch-art')}
          <span class="ln-ch-tx"><span class="ln-ch-k">Chapter ${k + 1} · ${g.items.length} stop${g.items.length === 1 ? '' : 's'} · ${mins} min</span><b>${esc(g.name)}</b></span>
          <span class="ln-ch-st">${all ? doneMark() : dn ? `<span class="ln-ch-n">${dn}/${g.items.length}</span>` : ''}${ctx.reveal ? '' : `<i class="ln-ch-car">${ic('caret', 16, 2.6)}</i>`}</span>
        </button>
        <div class="ln-ch-body"${open ? '' : ' hidden'}><ol class="ln-ch-l">${g.items.map((i) => {
          const x = list[i], s = st[i];
          return `<li class="ln-ch-r is-${s}${kindCls(x)}${arriveCls(x, ctx)}"><button type="button" class="ln-ch-rb" ${rowAttrs(x, s, i, ctx, list)}>
            <span class="ln-ch-dot" aria-hidden="true">${s === 'done' ? ic('check', 12, 3.4) : ''}</span>
            <span class="ln-ch-rt">${tagsHTML(x, s, ctx)}<b>${esc(x.title)}</b><span class="ln-meta">${stopMeta(list, x)}</span>${ctx.reveal || x.added ? whyHTML(x, list, ctx) : ''}</span>
            ${s === 'current' && !ctx.reveal ? '<span class="ln-ch-go">Start</span>' : ''}
          </button></li>`;
        }).join('')}</ol></div></li>`;
    }).join('')}</ol>`;
  }

  // Style 4 · Path: the winding path, quiet, with painted stops
  function rmPath(list, st, ctx) {
    const top = 52, last = list.length - 1;
    // room for each label: a tag line, a long title, the reason in the reveal
    const need = list.map((x, i) => 104 + (ctx.reveal ? 34 : 0) + ((tagOf(x) || st[i] === 'current') ? 16 : 0) + (x.title.length > 34 ? 14 : 0));
    let y = top; const pos = list.map((x, i) => { const p = { x: i % 2 ? 254 : 74, y }; y += Math.max(need[i], need[i + 1] || 0); return p; });
    pos[last] = { x: 164, y: pos[last].y + 18 };
    const H = pos[last].y + (ctx.reveal ? 150 : 120);
    let paths = '';
    for (let i = 0; i < last; i++) {
      const a = pos[i], b = pos[i + 1], dy = b.y - a.y;
      paths += `<path class="ln-pa-ln${st[i] === 'done' ? ' is-lit' : ''}" d="M${a.x} ${a.y}C${a.x} ${a.y + dy * 0.62} ${b.x} ${b.y - dy * 0.62} ${b.x} ${b.y}"/>`;
    }
    const nodes = list.map((x, i) => {
      const p = pos[i], s = st[i], side = i === last ? 'is-c' : i % 2 ? 'is-l' : 'is-r';
      const tag = tagOf(x) ? `<span class="ln-tags"><span class="ln-tag is-for${ctx.arrive === x.id || ctx.changed.includes(x.id) ? ' is-pop' : ''}">${ic(x.added ? 'plus' : 'sparkle', 11, 2.8)}${esc(tagOf(x))}</span></span>` : s === 'current' ? `<span class="ln-tags"><span class="ln-tag is-dark">${ctx.doneN && !ctx.reveal ? 'Up next' : 'Start here'}</span></span>` : '';
      return `<button type="button" class="ln-pa-s is-${s}${kindCls(x)}${arriveCls(x, ctx)} ln-in" style="left:${p.x}px;top:${p.y}px;--i:${i}" ${rowAttrs(x, s, i, ctx, list)}>
        <span class="ln-pa-art">${artBox(x, ctx.d, 64)}${s === 'done' ? doneMark() : ''}</span>
        <span class="ln-pa-lab ${side}">${tag}<b>${esc(x.title)}</b><span class="ln-meta">${stopMeta(list, x)}</span>${ctx.reveal ? whyHTML(x, list, ctx) : ''}</span>
      </button>`;
    }).join('');
    return `<div class="ln-pa" style="height:${H}px"><svg class="ln-pa-svg" width="328" height="${H}" viewBox="0 0 328 ${H}" aria-hidden="true">${paths}</svg>${nodes}</div>`;
  }
  const RM = { stack: rmStack, timeline: rmTimeline, chapters: rmChapters, path: rmPath };

  // After a stop: it fills, the next one is current, a new stop slides in if one was added
  function celebrateStop(id, addedId) {
    const map = home.querySelector('[data-map]'); if (!map) return;
    const done = map.querySelector(`[data-id="${CSS.escape(id)}"]`), cur = map.querySelector('[data-cur]');
    const el = (b) => b && (b.closest('li') || b);
    if (!calm()) { if (done) el(done).classList.add('is-justdone'); if (cur) el(cur).classList.add('is-unlock'); }
    scrollToEl(cur || done, !calm());
  }
  // Keep the header in view when the stop fits above the button; otherwise bring the stop up to sit just above it
  function scrollTarget(el) {
    const hr = home.getBoundingClientRect(), er = el.getBoundingClientRect(), k = hr.height / home.offsetHeight || 1;
    const top = home.scrollTop + (er.top - hr.top) / k, bottom = top + er.height / k, H = home.offsetHeight, room = H - (isReveal() ? 150 : 236);
    return bottom <= room ? 0 : Math.max(0, Math.min(top - 90, bottom - room));
  }
  function settleOn(el) { home.scrollTop = el ? scrollTarget(el) : 0; }
  function scrollToEl(el, smooth) {
    if (!el) return;
    home.scrollTo({ top: scrollTarget(el.closest('li') || el), behavior: smooth ? 'smooth' : 'auto' });
  }

  // The big button under the plan
  async function onGo() {
    if (goBtn.disabled) return;
    const c = course(); if (!c) return;
    const list = stops(c), st = states(list, c), cur = list[st.indexOf('current')];
    if (isReveal()) {
      goBtn.disabled = true;
      const ok = await gate('start');
      goBtn.disabled = false;
      if (!ok) return;
      muted = true; window.Store.set({ justBuilt: false }); muted = false;
      tabBar(true);
      renderHome();
      if (cur) openStop(cur.id);
      return;
    }
    if (!cur) { const fin = list.find((x) => x.kind === 'final'); if (fin) { startQuiz('final', fin, { at: 'next' }); PL.finished = PL.completed = true; } return; }
    openStop(cur.id);
  }

  // ═════════════════════════ COURSE SWITCHER SHEET ═════════════════════════
  function openSheet() {
    closeSheet(true);
    const layer = document.getElementById('sheetLayer'); if (!layer) return;
    const s = S(), plus = window.Store.isPlus(), act = course();
    const rows = s.courses.map((c) => {
      const d = courseData(c), list = stops(c), dn = list.filter((x) => (c.progress || {})[x.id] === 'done').length, on = c.id === act.id;
      return `<button type="button" class="ln-crow" data-sact="pick" data-id="${esc(c.id)}" aria-pressed="${on}">
        <span class="ln-crow-ic" data-keep-colour>${paint(d.id, 50, { subject: subjOf(d), motif: d.glyph, label: d.title })}</span>
        <span class="ln-crow-tx"><b>${esc(c.title)}</b><span>${dn} of ${list.length} done${on ? ' · Current' : ''}</span></span>
        <span class="ln-crow-chk">${on ? ic('check', 18, 3) : ''}</span></button>`;
    }).join('');
    const wrap = document.createElement('div'); wrap.className = 'ln-sheetwrap';
    wrap.innerHTML = `<div class="ln-sh-bd" data-sact="close"></div>
      <div class="ln-sh" role="dialog" aria-modal="true" aria-label="Your courses">
        <div class="ln-sh-grab" aria-hidden="true"></div>
        <button type="button" class="ln-sh-x" data-sact="close" aria-label="Close">${ic('x', 16, 2.6)}</button>
        <h2 class="ln-sh-t">Your courses</h2>
        <p class="ln-sh-s">${plus ? 'Plus: as many courses as you like.' : `Free plan · ${s.courses.length} of 3 courses`}</p>
        <div class="ln-sh-list">${rows}</div>
        <button type="button" class="ln-crow ln-crow-new" data-sact="new"><span class="ln-crow-ic is-new">${ic('plus', 22, 2.6)}</span><span class="ln-crow-tx"><b>New course</b><span>Type any topic. Cortex builds the plan.</span></span><span class="ln-crow-chk">${ic('chev', 18, 2.4)}</span></button>
      </div>`;
    layer.appendChild(wrap); sheet = wrap;
    if (still()) wrap.classList.add('is-open'); else requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('is-open')));
    wrap.addEventListener('click', (e) => {
      const t = e.target.closest('[data-sact]'); if (!t) return;
      const a = t.dataset.sact;
      if (a === 'close') closeSheet();
      if (a === 'pick') { if (t.dataset.id !== act.id) window.Store.set({ activeCourse: t.dataset.id }); closeSheet(); }
      if (a === 'new') { closeSheet(true); newCourse(); }
    });
    dragToClose(wrap.querySelector('.ln-sh'), () => closeSheet());
  }
  function dragToClose(sh, close) {
    let y0 = null, dy = 0;
    sh.addEventListener('pointerdown', (e) => { if (e.target.closest('button, input')) return; y0 = e.clientY; dy = 0; sh.setPointerCapture(e.pointerId); sh.style.transition = 'none'; });
    sh.addEventListener('pointermove', (e) => { if (y0 == null) return; dy = Math.max(0, (e.clientY - y0) / (window.PS || 1)); sh.style.transform = `translateY(${dy}px)`; });
    const end = () => { if (y0 == null) return; y0 = null; sh.style.transition = ''; if (dy > 80) close(); else sh.style.transform = ''; };
    sh.addEventListener('pointerup', end); sh.addEventListener('pointercancel', end);
  }
  function closeSheet(now) {
    if (!sheet) return; const w = sheet; sheet = null;
    if (now || still()) { w.remove(); return; }
    w.classList.remove('is-open'); setTimeout(() => w.remove(), 320);
  }
  function newCourse() {
    if (!window.Store.isPlus() && S().courses.length >= 3) { window.App.paywall('courses'); return; }
    if (window.App && App.showOnboarding) App.showOnboarding(0); else say('Course builder opens here');
  }

  // ───────── Light sheets: save progress, reminder, pace check-in ─────────
  // ask(html, label, onAct) resolves with the value of the [data-sval] tapped, or null when dismissed.
  function ask(html, label, onAct) {
    return new Promise((resolve) => {
      closeSheet(true);
      const layer = document.getElementById('sheetLayer'); if (!layer) return resolve(null);
      const wrap = document.createElement('div'); wrap.className = 'ln-sheetwrap ln-light';
      wrap.innerHTML = `<div class="ln-sh-bd" data-sval=""></div><div class="ln-sh" role="dialog" aria-modal="true" aria-label="${esc(label)}"><div class="ln-sh-grab" aria-hidden="true"></div>${html}</div>`;
      layer.appendChild(wrap); sheet = wrap;
      if (still()) wrap.classList.add('is-open'); else requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('is-open')));
      let done = false;
      const finish = (v) => { if (done) return; done = true; if (sheet === wrap) closeSheet(); else wrap.remove(); resolve(v); };
      wrap._finish = finish;
      wrap.addEventListener('click', (e) => {
        const t = e.target.closest('[data-sval], [data-sact]'); if (!t || t.disabled) return;
        if (t.dataset.sact && onAct) { onAct(t, wrap); return; }
        if (t.dataset.sval != null) finish(t.dataset.sval || null);
      });
      dragToClose(wrap.querySelector('.ln-sh'), () => finish(null));
      const sh = wrap.querySelector('.ln-sh'); sh.tabIndex = -1; setTimeout(() => sh.focus({ preventScroll: true }), still() ? 0 : 360);
    });
  }
  async function saveSheet() {
    const v = await ask(`<p class="ln-eyebrow ln-sh-eb">Lesson 1 done</p>
      <h2 class="ln-sh-t">Save your progress</h2>
      <p class="ln-sh-s">Keep your plan, your streak and what you earn, on any device.</p>
      <div class="ln-auth">
        <button type="button" class="ln-auth-b is-dark" data-sval="Apple">${APPLE}Continue with Apple</button>
        <button type="button" class="ln-auth-b" data-sval="Google">${GOOGLE}Continue with Google</button>
        <button type="button" class="ln-auth-b" data-sval="email">${ic('mail', 19, 2)}Continue with email</button>
      </div>
      <button type="button" class="ln-sh-later" data-sval="later">Not now</button>`, 'Save your progress');
    window.Store.set({ savedWith: v || 'later' });
    return v && v !== 'later' ? (v === 'email' ? 'Saved. Check your inbox to confirm' : `Saved with ${v}`) : '';
  }
  const TIMES = [['morning', 'Morning', '8:00 am'], ['lunch', 'Lunch', '12:30 pm'], ['evening', 'Evening', '7:00 pm'], ['custom', 'Pick a time', 'Custom']];
  async function reminderSheet(saved) {
    let pick = null, inp = null;
    const fmt12 = (t) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };
    const v = await ask(`<p class="ln-eyebrow ln-sh-eb">${saved ? `${ic('check', 13, 3)} ${esc(saved)}` : 'One nudge a day'}</p>
      <h2 class="ln-sh-t">When should we remind you?</h2>
      <p class="ln-sh-s">A short reminder at the same time each day. ${esc(dailyText())} is all it takes.</p>
      <div class="ln-times" role="radiogroup" aria-label="Reminder time">${TIMES.map(([id, l, t]) => `<button type="button" role="radio" aria-checked="false" class="ln-time" data-sact="time" data-time="${id}"><b>${l}</b><span>${t}</span></button>`).join('')}</div>
      <label class="ln-custom" hidden><span>Time</span><input type="time" value="21:00" data-ctime></label>
      <button type="button" class="btn-lit ln-sh-go" data-sval="set" disabled>Remind me</button>
      <button type="button" class="ln-sh-later" data-sval="skip">Not now</button>`, 'When should we remind you?', (t, wrap) => {
      pick = t.dataset.time; inp = wrap.querySelector('[data-ctime]');
      wrap.querySelectorAll('.ln-time').forEach((b) => b.setAttribute('aria-checked', String(b === t)));
      const cu = wrap.querySelector('.ln-custom'); cu.hidden = pick !== 'custom';
      wrap.querySelector('[data-sval="set"]').disabled = false;
      if (pick === 'custom') wrap.querySelector('[data-ctime]').focus();
    });
    if (v !== 'set' || !pick) { if (saved) say(saved); return; }
    const t = pick === 'custom' ? fmt12((inp && inp.value) || '21:00') : TIMES.find((x) => x[0] === pick)[2];
    window.Store.set({ reminder: { slot: pick, time: t } });
    say(saved && saved.startsWith('Saved with') ? `${saved}. Reminder at ${t}` : `We’ll remind you at ${t}`);
  }
  async function checkinSheet() {
    const a = adapt(); a.checkinAsked = true;
    const v = await ask(`<p class="ln-eyebrow ln-sh-eb">3 lessons in</p>
      <h2 class="ln-sh-t">How’s the pace?</h2>
      <p class="ln-sh-s">Tell us and we’ll reshape the rest of your plan.</p>
      <div class="ln-pace">
        <button type="button" class="ln-pace-b" data-sval="easy"><span class="ln-pace-ic">${ic('zap', 18, 2.2)}</span><span><b>Too easy</b><span>Speed it up</span></span></button>
        <button type="button" class="ln-pace-b" data-sval="right"><span class="ln-pace-ic">${ic('check', 18, 2.6)}</span><span><b>Just right</b><span>Keep it as it is</span></span></button>
        <button type="button" class="ln-pace-b" data-sval="hard"><span class="ln-pace-ic">${ic('slow', 18, 2.2)}</span><span><b>Too hard</b><span>Slow it down</span></span></button>
      </div>
      <button type="button" class="ln-sh-later" data-sval="">Ask me later</button>`, 'How is the pace?');
    if (!v) { a.checkinAsked = false; a.later = true; return; }
    applyPace(v);
  }
  // Reshape what's left: faster drops a stop and trims minutes; slower adds practice and minutes.
  function applyPace(v) {
    const c = course(), a = adapt(c), list = stops(c), st = states(list, c);
    const rest = list.filter((x, i) => st[i] !== 'done' && x.kind !== 'final');
    const lessons = rest.filter(isLesson), changed = [];
    a.pace = v; a.checkinAsked = true;
    const doShape = () => {
      if (v === 'easy') {
        const drop = rest.find((x) => x.kind === 'review') || (lessons.length >= 3 ? lessons[lessons.length - 1] : null);
        if (drop) a.skip[drop.id] = true;
        lessons.filter((x) => x !== drop).forEach((x) => { a.mins[x.id] = Math.max(2, baseMinutes(x) - 1); a.tags[x.id] = 'Shortened for you'; a.why[x.id] = 'You said the pace felt easy, so this one is a minute shorter'; changed.push(x.id); });
        const trimmed = lessons.some((x) => x !== drop);
        a.note = drop ? `Faster pace. We took out “${drop.title}”${trimmed ? ' and trimmed each lesson by a minute' : ''}.` : trimmed ? 'Faster pace. We trimmed each lesson left by a minute.' : 'Faster pace. Your last stops already move fast.';
      } else if (v === 'hard') {
        const at = lessons[0];
        if (at && !a.added.some((r) => r.id === 'practice-pace')) a.added.push({ id: 'practice-pace', kind: 'review', title: 'Extra practice', hook: 'A slower round on what you have covered.', added: true, after: at.id, because: 'You said the pace felt hard, so here is a slower round' });
        lessons.forEach((x) => { a.mins[x.id] = baseMinutes(x) + 1; a.tags[x.id] = 'One more example'; a.why[x.id] = 'You said the pace felt hard, so this one has an extra worked example'; changed.push(x.id); });
        a.note = 'Slower pace. We added a practice stop and one more example to each lesson.';
      } else {
        a.note = `Keeping your pace. ${rest.length + 1} stops to go.`;
      }
      a.changed = changed;
      saveCourses();
      say(v === 'easy' ? 'Plan updated for a faster pace' : v === 'hard' ? 'Plan updated for a slower pace' : 'Keeping your pace');
      renderHome({ keepScroll: true, changed, added: v === 'hard' ? 'practice-pace' : null, noteIn: true });
      const first = home.querySelector('.is-changed, .is-arrive'); if (first) scrollToEl(first, !calm());
    };
    // the stop that goes, goes visibly
    const dropId = ((rest.find((x) => x.kind === 'review') || (lessons.length >= 3 ? lessons[lessons.length - 1] : null)) || {}).id || '';
    const gone = v === 'easy' && dropId && home.querySelector(`[data-map] [data-id="${CSS.escape(dropId)}"]`);
    if (gone && !calm()) { const li = gone.closest('li') || gone; scrollToEl(li, true); setTimeout(() => li.classList.add('is-leave'), 380); setTimeout(doShape, 900); }
    else doShape();
  }

  // ═════════════════════════ PLAYER ═════════════════════════
  // mode: 'paced' | 'cards' | 'connect' | 'long' (lessons); 'quiz' for review, recap and finale
  const style = () => S().style || 'connect';
  function lessonMode() {
    const v = S().variants.lesson;
    if (v === '2') return 'cards';
    if (v === '3') return { quick: 'cards', connect: 'connect', roadmap: 'long' }[style()] || 'paced';
    return 'paced';
  }
  const PICK = { quick: ['Card stack', 'you like quick bites'], connect: ['Branching', 'you like connecting ideas'], roadmap: ['Longer steps', 'you like a full roadmap'] };

  function openStop(id, o = {}) {
    const list = stops(), st = states(list), i = list.findIndex((x) => x.id === id);
    if (i < 0) return;
    if (st[i] === 'locked' && !o.force) {
      const el = home.querySelector(`[data-id="${CSS.escape(id)}"]`);
      if (el) { const n = el.closest('li') || el; n.classList.remove('is-nope'); void n.offsetWidth; n.classList.add('is-nope'); }
      say(list[i].kind === 'final' ? 'Finish every stop to reach the final challenge' : 'Finish the stop before this one first');
      return;
    }
    const stop = list[i];
    if (stop.kind === 'review') startQuiz('review', stop);
    else if (stop.kind === 'recap') startQuiz('recap', stop);
    else if (stop.kind === 'final') { if (st[i] === 'done' && !o.force) { startQuiz('final', stop, { at: 'gift' }); PL.finished = PL.completed = true; } else startQuiz('final', stop, o); }
    else startLesson(stop);
  }

  function newPL(stop, kind, mode) {
    return { stop, kind, mode, steps: [], i: 0, right: 0, total: 0, missed: [], seen: new Set(), q: {}, qn: 0, gate: true, completed: false, ci: 0, cards: null };
  }
  function enterPlayer() {
    clearT('play'); closePop(); closePanel(); closeSheet(true);
    play.hidden = false; play.className = 'ln-play';
    tabBar(false);
    if (calm()) play.classList.add('is-in'); else requestAnimationFrame(() => requestAnimationFrame(() => play.classList.add('is-in')));
  }

  function startLesson(stop, keep) {
    const mode = lessonMode();
    PL = newPL(stop, 'lesson', mode);
    if (!keep) enterPlayer(); else { clearT('play'); closePop(); closePanel(); }
    play.className = 'ln-play is-in';
    const v3 = S().variants.lesson === '3';
    play.classList.toggle('has-tag', v3);
    tagline.innerHTML = v3 ? `<span class="ln-tagchip">${ic('sparkle', 13, 2.4)}<span><b>${PICK[style()][0]}</b> · ${PICK[style()][1]}</span></span>` : '';
    if (mode === 'cards') return buildCards();
    PL.steps = lessonSteps(stop, mode).concat([{ t: 'done' }]);
    showStep(0, 'none');
  }

  function lessonSteps(stop, mode) {
    const c = content(stop), steps = [{ t: 'intro' }];
    (c.blocks || []).forEach((b) => steps.push({ t: 'block', b }));
    if (mode === 'long') { (c.extra || []).forEach((b) => steps.push({ t: 'block', b })); if ((c.recap || []).length) steps.push({ t: 'recap' }); }
    (c.quiz || []).forEach((q, k) => steps.push({ t: 'quiz', q, k, n: c.quiz.length }));
    return steps;
  }

  function quizPool(beforeIdx, list) {
    const before = list.slice(0, beforeIdx).filter(isLesson), pool = [];
    before.forEach((x) => (content(x).quiz || []).forEach((q) => pool.push(q)));
    const ids = before.map((x) => x.id);
    (L.review || []).forEach((q) => { if (q.from && ids.includes(q.from)) pool.push(q); });
    return pool;
  }
  function startQuiz(kind, stop, o = {}) {
    PL = newPL(stop, kind, 'quiz');
    enterPlayer(); play.classList.remove('has-tag'); tagline.innerHTML = '';
    const list = stops(), idx = list.findIndex((x) => x.id === stop.id);
    if (kind === 'review') {
      const qs = shuffle(quizPool(idx, list)).slice(0, 5);
      PL.steps = qs.map((q, k) => ({ t: 'quiz', q, k, n: qs.length })).concat([{ t: 'result' }]);
    } else if (kind === 'recap') {
      const qs = (stop.missed && stop.missed.length ? stop.missed : (content({ id: stop.from }).quiz || []).slice(0, 1));
      PL.steps = [{ t: 'recapcard' }].concat(qs.map((q, k) => ({ t: 'quiz', q, k, n: qs.length })), [{ t: 'result' }]);
    } else {
      const heart = list.some((x) => isHeartLesson(x)) && courseData(course()).id === 'heart';
      const qs = heart && L.final.length ? L.final.slice(0, 3) : shuffle(quizPool(idx, list)).slice(0, 3);
      PL.steps = qs.map((q, k) => ({ t: 'quiz', q, k, n: qs.length, fin: true })).concat([{ t: 'gift' }, { t: 'next' }]);
    }
    const at = o.at ? PL.steps.findIndex((s) => s.t === o.at) : 0;
    showStep(Math.max(0, at), 'none');
  }
  function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

  const LEARN_STEPS = { intro: 1, block: 1, quiz: 1, recap: 1, recapcard: 1 };
  const isGated = (step) => step.t === 'quiz' || (step.t === 'block' && step.b.type === 'guess');

  function showStep(i, dir = 'fwd') {
    PL.i = i; closePop();
    const step = PL.steps[i];
    if (step.t === 'done' || step.t === 'result') completeStop();
    const old = stage.querySelector('.ln-page:not(.is-out)');
    const el = document.createElement('div');
    el.className = 'ln-page ln-page-' + step.t;
    el.innerHTML = `<div class="ln-pg">${stepHTML(step)}</div>`;
    stage.appendChild(el);
    if (old) {
      if (calm() || dir === 'none') old.remove();
      else { el.classList.add('in-' + dir); old.classList.add('is-out', 'out-' + dir); void el.offsetWidth; el.classList.remove('in-' + dir); setTimeout(() => old.remove(), 560); }
    }
    const dark = step.t === 'gift';
    play.classList.toggle('is-dark', dark);
    play.classList.toggle('is-finale', !LEARN_STEPS[step.t]);
    const scr = document.getElementById('screen'); if (scr) scr.classList.toggle('is-dark', dark);
    PL.gate = !isGated(step);
    renderBar();
    renderCTA();
    if (step.t === 'gift') runGift(el);
  }

  function stepHTML(step) {
    const stop = PL.stop, c = content(stop), d = courseData(course()), list = stops();
    switch (step.t) {
      case 'intro':
        return `<p class="ln-eyebrow">Lesson ${lessonNo(list, stop)} · ${minutes(stop)} min</p>
          <h1 class="ln-h1">${esc(stop.title)}</h1>
          <div class="ln-hero-art">${artBox(stop, d, 160)}</div>
          <p class="ln-answer">${rich(c.answer)}</p>
          ${forYouHTML(stop, d)}
          ${PL.mode === 'connect' ? `<p class="ln-hint">${ic('sparkle', 14, 2.4)} Tap a glowing term to branch off to the side.</p>` : ''}`;
      case 'block': {
        const b = step.b;
        return `<div class="ln-sechead"><p class="ln-eyebrow">${esc(b.eyebrow)}</p><h2 class="ln-h2">${esc(b.title)}</h2></div>
          ${b.intro ? `<p class="ln-intro">${rich(b.intro)}</p>` : ''}
          <div class="ln-block" data-type="${b.type}">${BLOCK[b.type] ? BLOCK[b.type](b) : ''}</div>`;
      }
      case 'quiz': {
        const label = PL.kind === 'review' ? `Review · ${step.k + 1} of ${step.n}` : PL.kind === 'final' ? `Final challenge · ${step.k + 1} of ${step.n}` : PL.kind === 'recap' ? 'One more try' : `Quick check · ${step.k + 1} of ${step.n}`;
        return `<div class="ln-sechead"><p class="ln-eyebrow">${label}</p><h2 class="ln-h2 ln-qh">${esc(step.q.q)}</h2></div>${quizHTML(step.q, true)}`;
      }
      case 'recap':
        return `<div class="ln-sechead"><p class="ln-eyebrow">Before the checks</p><h2 class="ln-h2">What to keep</h2></div>
          <ul class="ln-recap">${(c.recap || []).map((r, k) => `<li style="--d:${k * 90}ms"><span class="ln-recap-ic">${ic('check', 15, 3)}</span><span>${esc(r)}</span></li>`).join('')}</ul>`;
      case 'recapcard': {
        const src = list.find((x) => x.id === stop.from) || (d.lessons || []).find((x) => x.id === stop.from) || stop, sc = content(src);
        return `<p class="ln-eyebrow">Recap · 1 min · Added for you</p>
          <h1 class="ln-h1">${esc(src.title)}, in three lines</h1>
          <div class="ln-hero-art is-sm">${artBox(src, d, 112)}</div>
          <ul class="ln-recap">${(sc.recap || [src.hook]).slice(0, 3).map((r, k) => `<li style="--d:${k * 90}ms"><span class="ln-recap-ic">${ic('check', 15, 3)}</span><span>${esc(r)}</span></li>`).join('')}</ul>
          <p class="ln-recap-next">${ic('arrow', 15, 2.4)}<span>Then one more try at the check you missed.</span></p>`;
      }
      case 'done': return doneHTML('lesson');
      case 'result': return doneHTML(PL.kind);
      case 'gift': return giftHTML();
      case 'next': return nextHTML();
    }
    return '';
  }
  const forYouHTML = (stop, d) => `<aside class="ln-fy"><p class="ln-fy-k">${ic('sparkle', 13, 2.6)}For you</p><p class="ln-fy-t">${esc(forYouOf(stop, d))}</p></aside>`;

  // ───────── Quizzes ─────────
  function quizHTML(q, scored) {
    const key = 'q' + (++PL.qn); PL.q[key] = q;
    return `<div class="ln-quiz" data-quiz="${key}" data-scored="${scored ? 1 : 0}">
      <div class="ln-opts">${q.options.map((o, k) => `<button type="button" class="ln-opt" data-act="answer" data-i="${k}"><span class="ln-opt-l">${'ABCD'[k]}</span><span class="ln-opt-t">${esc(o)}</span><span class="ln-opt-mark" aria-hidden="true"></span></button>`).join('')}</div>
      <div class="ln-reveal" data-reveal aria-live="polite"></div></div>`;
  }
  function answer(btn) {
    const box = btn.closest('[data-quiz]'); if (!box || box.classList.contains('is-answered')) return;
    const q = PL.q[box.dataset.quiz], i = +btn.dataset.i, right = i === q.answer;
    box.classList.add('is-answered');
    box.querySelectorAll('.ln-opt').forEach((o, k) => {
      o.disabled = true;
      const mark = o.querySelector('.ln-opt-mark');
      if (k === q.answer) { o.classList.add('is-right'); mark.innerHTML = ic('check', 16, 3); }
      else if (k === i) { o.classList.add('is-wrong'); mark.innerHTML = ic('x', 16, 3); }
      else o.classList.add('is-dim');
      if (k === i) o.setAttribute('aria-pressed', 'true');
    });
    box.querySelector('[data-reveal]').innerHTML = `<div class="ln-reveal-card ${right ? 'ok' : 'no'}"><p class="ln-reveal-k"><span class="ln-reveal-badge">${ic(right ? 'check' : 'x', 13, 3.2)}</span>${right ? 'That’s right' : 'Not quite'}</p><p class="ln-body">${right || String(q.explain).toLowerCase().includes(String(q.options[q.answer]).toLowerCase()) ? '' : `Right answer: <b>${esc(q.options[q.answer])}</b>. `}${rich(q.explain)}</p></div>`;
    if (box.dataset.scored === '1') { PL.total++; if (right) PL.right++; else if (!PL.missed.includes(q)) PL.missed.push(q); }
    PL.gate = true; renderCTA(true);
    const page = box.closest('.ln-card') || box.closest('.ln-page');
    if (page) setTimeout(() => { const r = box.querySelector('.ln-reveal-card'); if (r) revealInto(page, r, page.classList.contains('ln-card') ? 16 : 130); }, still() ? 0 : 120);
  }
  function revealInto(scroller, el, pad = 130) {
    const sr = scroller.getBoundingClientRect(), er = el.getBoundingClientRect(), k = sr.height / scroller.offsetHeight || 1;
    const over = (er.bottom - sr.bottom) / k + pad;
    if (over > 0) scroller.scrollBy({ top: over, behavior: calm() ? 'auto' : 'smooth' });
  }

  // ───────── Interactive blocks ─────────
  const segHTML = (labels, act, on = 0) => `<div class="ln-seg" role="tablist" style="--n:${labels.length};--i:${on}"><i class="ln-seg-thumb" aria-hidden="true"></i>${labels.map((l, k) => `<button type="button" role="tab" data-act="${act}" data-i="${k}" aria-selected="${k === on}">${esc(l)}</button>`).join('')}</div>`;
  const BLOCK = {
    guess(b) {
      const key = 'q' + (++PL.qn); PL.q[key] = { options: b.options.map((o) => o.text), answer: b.answer, explain: b.explain };
      return `<div class="ln-quiz" data-quiz="${key}" data-scored="0"><div class="ln-opts">${b.options.map((o, k) => `<button type="button" class="ln-opt" data-act="answer" data-i="${k}"><span class="ln-opt-ic">${ic(o.icon, 20)}</span><span class="ln-opt-t">${esc(o.text)}</span><span class="ln-opt-mark" aria-hidden="true"></span></button>`).join('')}</div><div class="ln-reveal" data-reveal aria-live="polite"></div></div>`;
    },
    scale(b) {
      const o = b.options[0];
      return `${segHTML(b.options.map((x) => x.label), 'scale', 0)}
        <div class="ln-stats">
          <div class="ln-stat"><span class="ln-stat-ic is-pink">${ic('heart', 18, 2.4)}</span><b data-n="beats">${fmt(o.beats)}</b><span>heartbeats</span></div>
          <div class="ln-stat"><span class="ln-stat-ic is-blue">${ic('drop', 18, 2.4)}</span><b data-n="litres">${fmt(o.litres)}</b><span>litres of blood</span></div>
        </div>
        <p class="ln-note" data-note>${rich(o.note)}</p>`;
    },
    compare(b) {
      return `${segHTML([b.a, b.b], 'cmp', 0)}
        <div class="ln-cmp" data-side="0">
          <div class="ln-cmp-head" aria-hidden="true"><span class="c0">${esc(b.a)}</span><span class="c1">${esc(b.b)}</span></div>
          ${b.rows.map((r) => `<div class="ln-cmp-row"><p class="ln-cmp-k">${esc(r[0])}</p><div class="ln-cmp-cells"><p class="c0">${rich(r[1])}</p><p class="c1">${rich(r[2])}</p></div></div>`).join('')}
        </div>
        <p class="ln-verdict" data-verdict data-side="0">${ic('sparkle', 16, 2.2)}<span>${esc(b.verdict[0])}</span></p>`;
    },
    rooms(b) {
      const R = { ra: [0, 'Right atrium'], la: [2, 'Left atrium'], rv: [1, 'Right ventricle'], lv: [3, 'Left ventricle'] };
      const room = (id, cls) => `<button type="button" class="ln-room ${cls}" data-act="room" data-i="${R[id][0]}" data-r="${id}"><span class="ln-room-n">${R[id][1].replace(' ', '<br>')}</span><span class="ln-room-no">${R[id][0] + 1}</span></button>`;
      return `<div class="ln-rooms" data-room="ra">
          <div class="ln-rooms-k"><span>Their right</span><span>Their left</span></div>
          <div class="ln-rooms-grid">${room('ra', 'is-poor is-top')}${room('la', 'is-rich is-top')}${room('rv', 'is-poor')}${room('lv', 'is-rich is-lv')}</div>
          <div class="ln-rooms-leg"><span><i class="is-poor"></i>Low in oxygen</span><span><i class="is-rich"></i>Full of oxygen</span></div>
        </div>
        <div class="ln-roomcard is-pop" data-roomcard>${roomCard(b.steps[0])}</div>
        <div class="ln-roomnav"><span class="ln-roomdots">${b.steps.map((s, k) => `<i class="${k === 0 ? 'is-on' : ''}"></i>`).join('')}</span><button type="button" class="ln-chipbtn" data-act="room-next">Next step ${ic('arrow', 16, 2.4)}</button></div>`;
    },
    steps(b) {
      return `<div class="ln-steps" style="--i:0;--n:${b.steps.length}"><div class="ln-steps-line" aria-hidden="true"><i></i></div>
          ${b.steps.map((s, k) => `<button type="button" class="ln-step" data-act="stp" data-i="${k}" aria-selected="${k === 0}"><span class="ln-step-dot">${ic(s.icon, 19, 2.2)}</span><span class="ln-step-n">${esc(s.name)}</span></button>`).join('')}</div>
        <div class="ln-stepcard is-pop" data-stepcard><p class="ln-stepcard-k">Step 1 of ${b.steps.length}</p><p class="ln-stepcard-t">${rich(b.steps[0].text)}</p></div>
        <div class="ln-roomnav"><span></span><button type="button" class="ln-chipbtn" data-act="stp-next">Next ${ic('arrow', 16, 2.4)}</button></div>`;
    },
    points(b) {
      return `<ul class="ln-points">${b.items.map((p, k) => `<li style="--d:${k * 80}ms"><span class="ln-points-ic">${ic(p[0], 19, 2.2)}</span><div><h3 class="ln-h4">${esc(p[1])}</h3><p class="ln-body">${rich(p[2])}</p></div></li>`).join('')}</ul>`;
    },
  };
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const roomCard = (s) => `<p class="ln-roomcard-k">${esc(s.tag)}</p><h3 class="ln-h3">${esc(s.name)}</h3><p class="ln-body">${rich(s.text)}</p>`;

  function currentBlock(t) { const step = PL.steps[PL.i]; return step && step.b && step.b.type === t ? step.b : null; }
  function setSeg(sec, act, i) {
    const s = sec.querySelector(`[data-act="${act}"]`).closest('.ln-seg');
    s.style.setProperty('--i', i);
    s.querySelectorAll('button').forEach((x, k) => x.setAttribute('aria-selected', k === i));
  }
  function setScale(sec, i) {
    const b = currentBlock('scale'); if (!b) return;
    setSeg(sec, 'scale', i);
    const o = b.options[i];
    countTo(sec.querySelector('[data-n="beats"]'), o.beats); countTo(sec.querySelector('[data-n="litres"]'), o.litres);
    const n = sec.querySelector('[data-note]'); n.innerHTML = rich(o.note); pop(n);
  }
  function countTo(el, to) {
    const from = +(el.dataset.v || el.textContent.replace(/,/g, '')) || 0; el.dataset.v = to;
    if (calm()) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 700;
    const tick = (now) => { const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3); el.textContent = fmt(from + (to - from) * e); if (t < 1 && el.isConnected) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  function setCompare(sec, i) {
    const b = currentBlock('compare') || (PL.steps[PL.i].b); setSeg(sec, 'cmp', i);
    sec.querySelector('.ln-cmp').dataset.side = i;
    const v = sec.querySelector('[data-verdict]'); v.dataset.side = i; v.querySelector('span').textContent = b.verdict[i]; pop(v);
  }
  function setRoom(sec, i) {
    const b = currentBlock('rooms'); if (!b) return;
    i = (i + b.steps.length) % b.steps.length;
    const s = b.steps[i]; sec.dataset.ri = i;
    sec.querySelector('.ln-rooms').dataset.room = s.room;
    sec.querySelectorAll('.ln-room').forEach((r) => r.classList.toggle('is-on', r.dataset.r === s.room));
    const card = sec.querySelector('[data-roomcard]'); card.innerHTML = roomCard(s); pop(card);
    sec.querySelectorAll('.ln-roomdots i').forEach((d, k) => d.classList.toggle('is-on', k === i));
    const nx = sec.querySelector('[data-act="room-next"]'); nx.innerHTML = i === b.steps.length - 1 ? `Start again ${ic('shuffle', 15, 2.4)}` : `Next step ${ic('arrow', 16, 2.4)}`;
  }
  function setStp(sec, i) {
    const b = currentBlock('steps'); if (!b) return;
    i = (i + b.steps.length) % b.steps.length; sec.dataset.si = i;
    sec.querySelector('.ln-steps').style.setProperty('--i', i);
    sec.querySelectorAll('.ln-step').forEach((x, k) => { x.setAttribute('aria-selected', k === i); x.classList.toggle('is-past', k < i); });
    const card = sec.querySelector('[data-stepcard]'); card.innerHTML = `<p class="ln-stepcard-k">Step ${i + 1} of ${b.steps.length} · ${esc(b.steps[i].name)}</p><p class="ln-stepcard-t">${rich(b.steps[i].text)}</p>`; pop(card);
    const nx = sec.querySelector('[data-act="stp-next"]'); nx.innerHTML = i === b.steps.length - 1 ? `Start again ${ic('shuffle', 15, 2.4)}` : `Next ${ic('arrow', 16, 2.4)}`;
  }
  const pop = (el) => { el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop'); };

  // ───────── Card stack ─────────
  function autoCards(c, stop) {
    const out = [{ idea: c.answer, first: true }];
    (c.blocks || []).forEach((b) => {
      if (b.type === 'points') b.items.slice(0, 3).forEach((p) => out.push({ idea: `${p[1]}: ${p[2]}` }));
      else if (b.type === 'steps') b.steps.forEach((s) => out.push({ idea: s.text, k: s.name }));
      else if (b.type === 'compare') b.verdict.forEach((v) => out.push({ idea: v }));
    });
    const ideas = out.slice(0, 5), q = c.quiz || [];
    const res = [];
    ideas.forEach((x, k) => { res.push(x); if (k === 1 && q[0]) res.push({ quiz: 0 }); });
    if (q[1]) res.push({ quiz: 1 }); else if (q[0] && !res.some((x) => x.quiz === 0)) res.push({ quiz: 0 });
    return res;
  }
  function buildCards() {
    const c = content(PL.stop), d = courseData(course());
    const raw = c.cards || autoCards(c, PL.stop);
    PL.cards = raw.map((x) => (x.quiz != null ? Object.assign({ isQ: true }, c.quiz[x.quiz]) : x.q ? Object.assign({ isQ: true }, x) : x));
    PL.ci = 0; PL.mode = 'cards';
    const ideas = PL.cards.filter((x) => !x.isQ).length; let ideaN = 0;
    stage.innerHTML = `<div class="ln-page ln-page-cards"><div class="ln-stack" data-stack>${PL.cards.map((cd, k) => {
      if (cd.isQ) return `<article class="ln-card is-q" data-k="${k}"><div class="ln-card-head"><p class="ln-eyebrow">Quick check</p></div><h3 class="ln-card-q">${esc(cd.q)}</h3>${quizHTML(cd, true)}</article>`;
      ideaN++;
      return `<article class="ln-card" data-k="${k}"><div class="ln-card-vis">${artBox(PL.stop, d, k === 0 ? 150 : 120)}</div>
        <p class="ln-card-k">${k === 0 ? esc(PL.stop.title) : `Idea ${ideaN} of ${ideas}`}</p><p class="ln-card-idea">${rich(cd.idea)}</p>${k === 0 ? `<p class="ln-card-fy"><b>For you</b> ${esc(forYouOf(PL.stop, d))}</p>` : ''}</article>`;
    }).join('')}</div><p class="ln-swipe">${ic('hand', 15, 2)} Swipe the card, or tap Next</p></div>`;
    layoutStack();
    bindSwipe(stage.querySelector('[data-stack]'));
    renderBar(); renderCTA();
  }
  function layoutStack() {
    const cards = stage.querySelectorAll('.ln-card');
    cards.forEach((el, k) => {
      const d = k - PL.ci; el.classList.toggle('is-top', d === 0); el.classList.toggle('is-gone', d < 0);
      el.style.zIndex = 100 - k; el.setAttribute('aria-hidden', d !== 0);
      el.querySelectorAll('button').forEach((b) => { b.tabIndex = d === 0 ? 0 : -1; });
      if (d < 0) { el.style.transform = `translateX(${el.dataset.out === '1' ? 440 : -440}px) rotate(${el.dataset.out === '1' ? 14 : -14}deg)`; el.style.opacity = 0; }
      else { el.style.transform = `translateY(${Math.min(d, 2) * 14}px) scale(${1 - Math.min(d, 2) * 0.05})`; el.style.opacity = d > 2 ? 0 : 1; }
    });
    const top = cards[PL.ci];
    if (top) PL.gate = !top.classList.contains('is-q') || !!top.querySelector('.is-answered');
  }
  function advanceCard(dir) {
    if (!PL || !PL.gate) { nudgeCTA(); return; }
    const cards = stage.querySelectorAll('.ln-card'), top = cards[PL.ci];
    if (top) top.dataset.out = dir > 0 ? '1' : '0';
    if (PL.ci >= PL.cards.length - 1) {
      if (top && !calm()) { top.style.transform = `translateX(${dir > 0 ? 440 : -440}px) rotate(${dir > 0 ? 14 : -14}deg)`; top.style.opacity = 0; }
      PL.mode = 'cards-done'; PL.steps = [{ t: 'done' }];
      setTimeout(() => { if (PL && PL.mode === 'cards-done') showStep(0, 'fwd'); }, calm() ? 0 : 260);
      return;
    }
    PL.ci++; layoutStack(); renderBar(); renderCTA();
  }
  function bindSwipe(stack) {
    let drag = null;
    stack.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.ln-card.is-top'); if (!card || e.target.closest('button')) return;
      drag = { x0: e.clientX, card, dx: 0, id: e.pointerId }; card.setPointerCapture(e.pointerId); card.style.transition = 'none';
    });
    stack.addEventListener('pointermove', (e) => {
      if (!drag) return; drag.dx = (e.clientX - drag.x0) / (window.PS || 1);
      const dx = PL.gate ? drag.dx : drag.dx * 0.25;
      drag.card.style.transform = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
    });
    const end = () => {
      if (!drag) return; const { card, dx } = drag; drag = null; card.style.transition = '';
      if (Math.abs(dx) > 80 && PL.gate) advanceCard(Math.sign(dx));
      else { layoutStack(); if (Math.abs(dx) > 30 && !PL.gate) nudgeCTA(); }
    };
    stack.addEventListener('pointerup', end); stack.addEventListener('pointercancel', end);
  }

  // ───────── Top bar + CTA ─────────
  function renderBar() {
    let n, at;
    if (PL.mode === 'cards') { n = PL.cards.length; at = PL.ci; }
    else { const learn = PL.steps.filter((s) => LEARN_STEPS[s.t]); n = learn.length; at = PL.steps.slice(0, PL.i).filter((s) => LEARN_STEPS[s.t]).length; if (!LEARN_STEPS[PL.steps[PL.i].t]) at = n; }
    if (PL.mode === 'cards-done') { n = PL.cards.length; at = n; }
    bar.querySelector('.ln-psegs').innerHTML = Array.from({ length: n }, (_, k) => `<i class="${k < at ? 'is-on' : k === at ? 'is-cur' : ''}"></i>`).join('');
    bar.querySelector('.ln-pcount').textContent = at < n ? `${at + 1}/${n}` : '';
    bar.querySelector('.ln-psegs').setAttribute('aria-label', `Step ${Math.min(at + 1, n)} of ${n}`);
  }
  function renderCTA(glow) {
    let label = 'Continue', enabled = PL.gate, second = '';
    if (PL.mode === 'cards') {
      const top = PL.cards[PL.ci];
      label = PL.ci === PL.cards.length - 1 ? 'Finish lesson' : 'Next';
      if (top && top.isQ && !PL.gate) label = 'Pick an answer';
    } else {
      const step = PL.steps[PL.i], nextStep = PL.steps[PL.i + 1];
      if (isGated(step) && !PL.gate) label = 'Pick an answer';
      else if (step.t === 'done' || step.t === 'result') label = 'Back to your plan';
      else if (step.t === 'gift') { label = 'See your next course'; enabled = !!PL.giftReady; }
      else if (step.t === 'next') { label = 'Start your next course'; second = 'Back to my plan'; enabled = !PL.going; }
      else if (nextStep && nextStep.t === 'done') label = 'Finish lesson';
      else if (nextStep && nextStep.t === 'result') label = PL.kind === 'recap' ? 'Finish the recap' : 'Finish the review';
      else if (nextStep && nextStep.t === 'gift') label = 'Finish the course';
    }
    cta.className = 'btn-lit ln-cta' + (glow && enabled ? ' is-ready' : '');
    cta.disabled = !enabled; cta.textContent = label;
    cta2.hidden = !second; cta2.textContent = second;
    play.classList.toggle('has-cta2', !!second);
  }
  function nudgeCTA() { cta.classList.remove('is-nudge'); void cta.offsetWidth; cta.classList.add('is-nudge'); }
  async function onCTA() {
    if (!PL || cta.disabled) return;
    if (PL.mode === 'cards') return advanceCard(-1);
    const step = PL.steps[PL.i];
    if (step.t === 'done' || step.t === 'result') {
      if (PL.leaving) return; PL.leaving = true; cta.disabled = true;
      const me = PL;
      if (me.kind === 'lesson') await gate('lesson-done');   // the soft-paywall hook: Learn just waits
      if (PL === me) closePlayer();
      return;
    }
    if (step.t === 'next') return startNext();
    if (PL.i < PL.steps.length - 1) showStep(PL.i + 1, 'fwd');
  }

  // ───────── Completion + adapting to the checks ─────────
  function markDone(id) {
    const c = course(); if (!c) return;
    c.progress = c.progress || {}; c.progress[id] = 'done';
    saveCourses();
  }
  function completeStop() {
    if (PL.completed) return; PL.completed = true;
    const stop = PL.stop, c = course(), d = courseData(c);
    PL.adapt = adaptToChecks(stop);
    markDone(stop.id);
    window.Bus.emit('lesson:done', { courseId: c.id, lessonId: stop.id });
    if (isLesson(stop)) {
      const ex = S().explored;
      if (!ex.includes(stop.id)) window.Store.set({ explored: ex.concat([stop.id]) });
      window.Bus.emit('explored', { id: stop.id, label: stop.title, subject: d.subject || 'Body', shape: d.shape || 'heart', palette: d.palette || 'body', from: 'learn' });
    }
    PL.justDone = stop.id;
  }
  // Missed a check: a 1-minute recap is added after this lesson. Aced them: the next stop gets shorter.
  function adaptToChecks(stop) {
    if (!isLesson(stop) || !PL.total) return null;
    const a = adapt(), list = stops(), i = list.findIndex((x) => x.id === stop.id);
    if (PL.right < PL.total) {
      const id = 'recap-' + stop.id;
      if (!a.added.some((r) => r.id === id)) a.added.push({ id, kind: 'recap', title: `Recap of lesson ${lessonNo(list, stop)}`, hook: 'The three things to keep, and one more try.', added: true, after: stop.id, from: stop.id, missed: PL.missed.slice(), because: `You missed a check in “${stop.title}”, so here is a 1 minute recap` });
      return { kind: 'added', id, missed: PL.total - PL.right };
    }
    const nx = list.slice(i + 1).find((x) => x.kind !== 'final' && !x.added);
    if (nx && !a.tags[nx.id]) {
      a.mins[nx.id] = Math.max(isLesson(nx) ? 2 : 1, baseMinutes(nx) - (isLesson(nx) ? 2 : 1));
      a.tags[nx.id] = 'Shortened for you';
      a.why[nx.id] = `You got every check right in “${stop.title}”, so this one skips the basics`;
      return { kind: 'short', id: nx.id, title: nx.title };
    }
    return { kind: 'aced' };
  }
  function finishCourse() {
    if (PL.finished) return; PL.finished = true;
    const stop = PL.stop, c = course(), g = giftOf();
    markDone(stop.id); PL.justDone = stop.id;
    window.Bus.emit('lesson:done', { courseId: c.id, lessonId: stop.id });
    const col = S().collectibles || [];
    if (!col.some((x) => x.id === g.id)) window.Store.set({ collectibles: col.concat([{ id: g.id, title: g.title, shape: g.shape, palette: g.palette }]) });
    window.Bus.emit('course:finished', { courseId: c.id, gift: g });
  }
  function giftOf() {
    const d = courseData(course());
    return d.gift || { id: d.id + '-gift', title: `The ${String(d.title).toLowerCase()} collectible`, sub: 'A one-of-a-kind collectible, made from your course.', shape: d.shape || 'heart', palette: d.palette || 'body' };
  }

  function doneHTML(kind) {
    const list = stops(), st = states(list).map((s, i) => (list[i].id === PL.stop.id ? 'done' : s));
    const dn = st.filter((x) => x === 'done').length, nx = list[st.indexOf('current')];
    const d = courseData(course());
    const stats = [[PL.total ? `${PL.right}/${PL.total}` : '–', kind === 'lesson' ? 'checks right' : 'right'], [`${dn} of ${list.length}`, 'plan done']];
    const title = kind === 'review' ? (PL.right >= PL.total - 1 ? 'Review done. That stuck.' : 'Review done') : kind === 'recap' ? 'Recap done' : 'Lesson done';
    const ad = PL.adapt;
    const adLine = !ad ? '' : ad.kind === 'added'
      ? `<p class="ln-done-ad">${ic('plus', 15, 2.6)}<span>You missed ${ad.missed === 1 ? 'a check' : ad.missed + ' checks'}, so we added a <b>1 minute recap</b> to your plan, right after this lesson.</span></p>`
      : ad.kind === 'short' ? `<p class="ln-done-ad">${ic('zap', 15, 2.4)}<span>Every check right, so <b>${esc(ad.title)}</b> is now shorter.</span></p>` : '';
    return `<div class="ln-done">
      <div class="ln-done-art">${artBox(PL.stop.kind === 'recap' ? PL.stop : PL.stop, d, 120)}<span class="ln-done-badge">${ic('check', 20, 3.2)}</span></div>
      <p class="ln-eyebrow">${esc(PL.stop.title)}</p>
      <h1 class="ln-h1 ln-done-t">${title}</h1>
      <div class="ln-done-stats">${stats.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>
      ${adLine}
      ${nx && nx.id !== PL.stop.id ? `<p class="ln-done-next">${ic('arrow', 15, 2.4)}<span>Next in your plan: <b>${esc(nx.title)}</b></span></p>` : ''}
    </div>`;
  }

  // ───────── The finish: the collectible (particles live here), then your next course ─────────
  function giftHTML() {
    const g = giftOf();
    return `<div class="ln-gift">
      <div class="ln-gift-stage"><div class="ln-gift-halo" aria-hidden="true"></div><div class="ln-vis" data-vis data-shape="scatter" data-pal="${esc(g.palette || 'body')}" style="--k:.92"></div><div class="ln-gift-glint" aria-hidden="true"></div>
        <span class="ln-spark s1" aria-hidden="true"></span><span class="ln-spark s2" aria-hidden="true"></span><span class="ln-spark s3" aria-hidden="true"></span><span class="ln-spark s4" aria-hidden="true"></span></div>
      <div class="ln-gift-tx">
        <p class="ln-eyebrow is-light">Course complete</p>
        <h1 class="ln-h1">${esc(g.title)}</h1>
        <p class="ln-gift-sub">${esc(g.sub || 'A one-of-a-kind collectible, made from your course.')}</p>
        <div class="ln-gift-row"><span class="ln-added">${ic('check', 15, 3)} Added to your Profile</span><button type="button" class="ln-share" data-act="share">${ic('share', 15, 2.2)} Share</button></div>
      </div></div>`;
  }
  function runGift(el) {
    finishCourse();
    PL.giftReady = false; renderCTA();
    const B = brain(), g = giftOf(), vis = el.querySelector('[data-vis]');
    const shape = B && B.has && B.has(g.shape) ? g.shape : 'heart';
    el.classList.remove('is-revealed');
    if (B && vis) { B.moveTo(vis); B.setMode('idle'); B.setSpin(false); B.setShape('scatter', g.palette || 'body', 10); }
    after('play', () => { if (B) B.setShape(shape, g.palette || 'body', 2200); }, 350);
    after('play', () => { el.classList.add('is-formed'); if (B) { B.setSpin(true); B.pulse(); } burst(184, 290, 140, true); }, 2300);
    after('play', () => { el.classList.add('is-revealed'); PL.giftReady = true; renderCTA(true); }, 2700);
    if (still()) { el.classList.add('is-formed', 'is-revealed'); PL.giftReady = true; renderCTA(); }
  }

  // The next course, already shaped by what they did and who they are
  const ROLE_WORK = { pm: 'product', 'product manager': 'product', designer: 'design', engineer: 'engineering', developer: 'engineering', marketing: 'marketing', marketer: 'marketing', founder: 'startup', finance: 'finance', teacher: 'teaching', researcher: 'research', business: 'business' };
  function nextSpec() {
    const c = course(), d = courseData(c), a = adapt(c), p = S().profile, pl = planFor(d);
    const recap = a.added.find((r) => r.kind === 'recap'), shortened = Object.values(a.tags).includes('Shortened for you');
    const doneLessons = stops(c).filter(isLesson);
    const base = d.next || (pl && pl.next) || null;
    let spec;
    if (base) spec = Object.assign({}, base);
    else {
      const info = p && window.topicInfo ? topicInfo(p) : null;
      const topic = (info && info.short) || d.title, role = p && String(p.roleText || p.role || '').toLowerCase();
      const work = ROLE_WORK[role] || (Object.entries(ROLE_WORK).find(([k]) => role && role.includes(k)) || [])[1];
      const reason = (p && p.reason) || 'life';
      const title = reason === 'work' ? `Use ${topic} in your ${work ? work + ' ' : ''}work`
        : reason === 'exam' ? `${cap(topic)}: practice for the exam` : reason === 'career' ? `${cap(topic)} for your next role` : `${cap(topic)}: the next step`;
      spec = { id: d.id + '-next', title, subject: d.subject, glyph: d.glyph, goalShort: title.replace(/^./, (m) => m.toLowerCase()), summary: `Built for ${p && p.roleText ? 'a ' + p.roleText.toLowerCase() : 'you'}, straight after ${d.title}.` };
      // With the catalog builder: the same person, pointed at their next outcome, one level up, without the lessons they just did
      const alt = p && window.outcomesFor && window.buildCourse ? outcomesFor(p).find((o) => o.id !== p.goal) : null;
      if (alt) {
        let bid = null;
        try { bid = buildCourse(Object.assign({}, p, { goal: alt.id, goalText: alt.label, level: { new: 'bit', bit: 'basics', basics: 'deep' }[p.level] || p.level })); } catch (e) { bid = null; }
        const B = bid && bid !== c.id && window.COURSES[bid];
        if (B) {
          const had = new Set((d.lessons || []).map((x) => x.id));
          let ls = B.lessons.filter((x) => !isLesson(x) || !had.has(x.id));
          if (ls.filter(isLesson).length < 3) ls = B.lessons.slice();
          if (reason !== 'work') { spec.title = cap(alt.label); spec.goalShort = alt.short || alt.label.replace(/^./, (m) => m.toLowerCase()); }
          Object.assign(spec, { id: bid + '-next', subject: B.subject, glyph: (B.lessons.find((x) => x.kind === 'final') || {}).glyph, lessons: ls, gift: B.gift });
        }
      }
    }
    const lines = spec.because ? spec.because.slice() : [];
    const built = [
      `Picks up where “${(doneLessons[doneLessons.length - 1] || {}).title || d.title}” left off`,
      recap ? `Opens with a refresher on ${shortOf(stops(c).find((x) => x.id === recap.from) || recap).toLowerCase()}, the part you found tricky` : shortened ? 'Moves faster through the basics you got right' : 'Skips what you already know',
      p && p.roleText ? `Examples from a ${p.roleText.toLowerCase()}’s week, at ${dailyText()}` : `Same ${dailyText()} you picked`,
    ];
    if (!spec.because) spec.because = built;
    else if (recap) spec.because[1] = built[1];
    spec.because = spec.because.slice(0, 3);
    return spec;
  }
  function nextLessons(spec) {
    if (spec.lessons) return spec.lessons;
    const t = spec.title.replace(/^Use /, '').replace(/ in your .*$/, '');
    return [
      { id: spec.id + '-l1', title: `Where ${t} fits in your week`, hook: 'Find the three tasks it helps with most.' },
      { id: spec.id + '-l2', title: 'Your first real task', hook: 'One task, start to finish, with a template you keep.' },
      { id: spec.id + '-l3', title: 'Check what you get back', hook: 'How to spot what is wrong before anyone else does.' },
      { id: spec.id + '-review1', kind: 'review', title: 'Quick review', hook: 'Three fast questions.' },
      { id: spec.id + '-l4', title: 'Make it a habit', hook: 'A five minute routine you can run every day.' },
      { id: spec.id + '-l5', title: 'Bring your team along', hook: 'Show what works, and what to watch out for.' },
      { id: spec.id + '-final', kind: 'final', title: 'Final challenge', hook: 'Do one real task, start to finish.' },
    ];
  }
  function nextHTML() {
    const spec = PL.next || (PL.next = nextSpec()), d = courseData(course());
    const lessons = nextLessons(spec), nd = { id: spec.id, subject: spec.subject || d.subject, glyph: spec.glyph, title: spec.title, lessons };
    const mins = lessons.reduce((n, x) => n + (x.kind === 'review' ? 2 : x.kind === 'final' ? 3 : x.min || 4), 0);
    return `<div class="ln-next">
      <p class="ln-eyebrow">Your next course</p>
      <h1 class="ln-h1">Already built, from what you just did</h1>
      <article class="ln-nc">
        <div class="ln-nc-top">${artBox({ id: spec.id, glyph: spec.glyph, title: spec.title }, nd, 64, 'ln-nc-art')}<span class="ln-nc-k">${lessons.length} stops · about ${mins} min</span></div>
        <h2 class="ln-nc-t">${esc(spec.title)}</h2>
        <p class="ln-nc-s">${esc(spec.summary)}</p>
        <ul class="ln-nc-why">${spec.because.map((b) => `<li><span class="ln-nc-dot">${ic('check', 12, 3.2)}</span><span>${esc(b)}</span></li>`).join('')}</ul>
        <ol class="ln-nc-peek">${lessons.filter(isLesson).slice(0, 3).map((x, k) => `<li>${artBox(x, nd, 34)}<span><b>${esc(x.title)}</b></span><span class="ln-nc-n">${k + 1}</span></li>`).join('')}</ol>
      </article>
    </div>`;
  }
  async function startNext() {
    if (!PL || PL.going) return;
    PL.going = true; renderCTA();
    const me = PL, ok = await gate('next-course');
    if (PL !== me) return;
    PL.going = false;
    if (!ok) { renderCTA(); return; }
    const id = registerNext(PL.next || nextSpec());
    if (window.addCourse) window.addCourse(id);
    else { const s = S(); if (!s.courses.some((c) => c.id === id)) s.courses.push({ id, title: COURSES[id].title, progress: {} }); }
    revealRan = false;
    muted = true; window.Store.set({ activeCourse: id, justBuilt: true }); muted = false;
    window.Bus.emit('course:created', { id });
    closePlayer({ quiet: true });
  }
  // Register the next course. With buildCourse, build from the profile pointed at the new goal; otherwise build it here.
  function registerNext(spec) {
    const c = course(), d = courseData(c), p = S().profile;
    if (window.COURSES[spec.id] && spec.id !== c.id) return spec.id;
    let built = null;
    if (!spec.lessons && window.buildCourse && p) {
      const keep = window.COURSES[c.id];
      try { built = buildCourse(Object.assign({}, p, { goal: 'next', goalText: spec.title, next: true })); } catch (e) { built = null; }
      if (keep) window.COURSES[c.id] = keep;
      if (built === c.id || !window.COURSES[built]) built = null;
    }
    const src = built ? window.COURSES[built] : d;
    const lessons = built ? src.lessons : nextLessons(spec).map((x) => Object.assign({ kind: 'lesson' }, x));
    window.COURSES[spec.id] = Object.assign({}, src, {
      id: spec.id, title: spec.title, topic: spec.title, subject: spec.subject || src.subject, glyph: spec.glyph, built: true,
      summary: spec.summary, goalShort: spec.goalShort || spec.title.replace(/^./, (m) => m.toLowerCase()), lessons, next: null,
      gift: spec.gift || { id: spec.id + '-gift', title: `The ${spec.title.toLowerCase()} collectible`, sub: 'A one-of-a-kind collectible, made from your course.', shape: src.shape || 'heart', palette: src.palette || 'body' },
    });
    return spec.id;
  }

  // Particle confetti for the collectible only (canvas, not emoji)
  let cfx = null;
  function burst(x, y, n, dark) {
    if (calm() || !confetti) return;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    if (!cfx) { confetti.width = 368 * DPR; confetti.height = 822 * DPR; cfx = { g: confetti.getContext('2d'), parts: [], raf: 0, DPR }; }
    const cols = ['#F783AC', '#FFB3CF', '#FFFFFF', '#FFD43B', '#FF8FB8', '#FFC9A0'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 2.5 + Math.random() * 7.5;
      cfx.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3.2, r: 1.4 + Math.random() * 2.8, c: cols[i % cols.length], life: 1, decay: 0.006 + Math.random() * 0.008, tw: Math.random() * 6 });
    }
    cfx.dark = dark;
    if (!cfx.raf) cfx.raf = requestAnimationFrame(stepConfetti);
  }
  function stepConfetti() {
    const { g, DPR } = cfx; g.clearRect(0, 0, confetti.width, confetti.height);
    g.globalCompositeOperation = cfx.dark ? 'lighter' : 'source-over';
    cfx.parts = cfx.parts.filter((p) => p.life > 0);
    for (const p of cfx.parts) {
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.16; p.x += p.vx; p.y += p.vy; p.life -= p.decay; p.tw += 0.2;
      const a = Math.max(0, p.life) * (0.7 + 0.3 * Math.sin(p.tw));
      g.globalAlpha = a; g.fillStyle = p.c;
      g.beginPath(); g.arc(p.x * DPR, p.y * DPR, p.r * DPR, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
    cfx.raf = cfx.parts.length ? requestAnimationFrame(stepConfetti) : 0;
  }
  function stopConfetti() { if (cfx) { cancelAnimationFrame(cfx.raf); cfx.raf = 0; cfx.parts = []; cfx.g.clearRect(0, 0, confetti.width, confetti.height); } }

  // ───────── Close ─────────
  function closePlayer(o = {}) {
    if (!PL) return;
    const justDone = PL.justDone, ad = PL.adapt, kind = PL.kind;
    clearT('play'); closePop(); closePanel(); stopConfetti();
    const B = brain(); if (B) { B.setSpin(false); B.setDark(false); B.setMode('idle'); }
    const scr = document.getElementById('screen'); if (scr) scr.classList.remove('is-dark');
    PL = null;
    play.classList.remove('is-in');
    setTimeout(() => { if (!PL) { play.hidden = true; stage.innerHTML = ''; play.className = 'ln-play'; } }, calm() ? 0 : 520);
    if (!window.App || !App.current || App.current() === 'learn') tabBar(true);
    renderHome({ justDone: o.quiet ? null : justDone, added: ad && ad.kind === 'added' ? ad.id : null, changed: ad && ad.kind === 'short' ? [ad.id] : [] });
    if (!o.quiet && justDone) after('home', () => followUps(kind), 1100);
  }
  // After a lesson: lesson 1 → save progress + reminder sheets; about lesson 3 → the pace check-in
  async function followUps(kind) {
    if (PL || !shown || isReveal()) return;
    const c = course(), list = stops(c), p = progress(c), a = adapt(c);
    const lessonsDone = list.filter((x) => isLesson(x) && p[x.id] === 'done').length;
    if (kind === 'lesson' && lessonsDone >= 1 && S().savedWith == null) {
      const saved = await saveSheet();
      if (S().reminder == null && !PL) await reminderSheet(saved); else if (saved) say(saved);
      return;
    }
    if (lessonsDone >= 3 && !a.pace && !a.checkinAsked && !a.later && kind === 'lesson') await checkinSheet();
  }

  // ───────── Glowing terms: popover (paced/cards/long) or side panel (connect) ─────────
  function localRect(el) {
    const R = root.getBoundingClientRect(), k = R.width / root.offsetWidth || 1, r = el.getBoundingClientRect();
    return { left: (r.left - R.left) / k, top: (r.top - R.top) / k, width: r.width / k, height: r.height / k };
  }
  function seeTerm(id) {
    if (!PL) return;
    PL.seen.add(id);
    root.querySelectorAll(`.ln-term[data-term="${id}"]`).forEach((b) => { b.classList.add('is-done'); b.querySelector('.ln-term-ic').innerHTML = ic('check', 12, 3); });
  }
  function openPop(btn) {
    const id = btn.dataset.term, t = L.terms[id]; if (!t) return;
    closePop();
    popEl = document.createElement('div'); popEl.className = 'ln-pop'; popEl.setAttribute('role', 'dialog'); popEl.setAttribute('aria-label', t.label);
    popEl.innerHTML = `<p class="ln-pop-k"><span class="ln-term-ic">${ic('sparkle', 14, 2.4)}</span>${esc(cap(t.label))}</p><p class="ln-pop-def">${esc(t.def)}</p>
      <div class="ln-pop-row"><button type="button" class="ln-ask" data-act="ask" data-term="${id}">${ic('sparkle', 15, 2.4)} Ask about this</button><button type="button" class="ln-pop-ok" data-act="pop-close">Got it</button></div>`;
    root.appendChild(popEl);
    const r = localRect(btn), W = 300, H = popEl.offsetHeight;
    const left = Math.max(14, Math.min(368 - 14 - W, r.left + r.width / 2 - W / 2));
    const below = r.top + r.height + 10 + H < 822 - 110;
    const top = below ? r.top + r.height + 10 : r.top - 10 - H;
    Object.assign(popEl.style, { left: left + 'px', top: Math.max(104, top) + 'px', width: W + 'px' });
    popEl.style.setProperty('--ox', `${r.left + r.width / 2 - left}px`); popEl.classList.add(below ? 'is-below' : 'is-above');
    btn.classList.add('is-open'); popEl._btn = btn;
    if (still()) popEl.classList.add('is-in'); else requestAnimationFrame(() => popEl && popEl.classList.add('is-in'));
    seeTerm(id);
  }
  function closePop() {
    if (!popEl) return; const p = popEl; popEl = null;
    if (p._btn) p._btn.classList.remove('is-open');
    p.classList.remove('is-in'); setTimeout(() => p.remove(), still() ? 0 : 180);
  }
  function openPanel(id) {
    const t = L.terms[id]; if (!t) return;
    closePop();
    panel.innerHTML = `<div class="ln-panel-bd" data-act="panel-close"></div>
      <aside class="ln-panel-sh" role="dialog" aria-modal="true" aria-label="${esc(t.label)}">
        <button type="button" class="ln-round ln-panel-x" data-act="panel-close" aria-label="Close">${ic('x', 18, 2.4)}</button>
        <p class="ln-eyebrow">Side path</p>
        <div class="ln-panel-g"><span class="ln-art" data-keep-colour>${paint('dive:' + id, 120, { subject: subjOf(courseData(course())), label: t.label })}</span></div>
        <h2 class="ln-h2">${esc(cap(t.label))}</h2>
        <p class="ln-panel-def">${esc(t.def)}</p>
        <p class="ln-body">${esc(t.more || '')}</p>
        <div class="ln-panel-acts">
          <button type="button" class="btn-lit ln-panel-go" data-act="ask" data-term="${id}">Ask about this</button>
          <button type="button" class="btn-carved ln-panel-go" data-act="panel-close">Back to the lesson</button>
        </div>
      </aside>`;
    panel.hidden = false;
    if (still()) panel.classList.add('is-open'); else requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('is-open')));
    seeTerm(id);
  }
  function closePanel() {
    if (!panel || panel.hidden) return;
    panel.classList.remove('is-open');
    setTimeout(() => { if (!panel.classList.contains('is-open')) { panel.hidden = true; panel.innerHTML = ''; } }, still() ? 0 : 420);
  }
  function askAbout(id) {
    const t = L.terms[id]; if (!t) return;
    closePop(); closePanel();
    window.Bus.emit('ask:open', { question: t.ask || `Tell me more about ${t.label}` });
    if (window.App && App.showTab) App.showTab('ask');
  }

  // ═════════════════════════ CLICKS ═════════════════════════
  function onClick(e) {
    const t = e.target.closest('[data-act]');
    if (popEl && !e.target.closest('.ln-pop') && !(t && t.dataset.act === 'term')) closePop();
    if (!t || t.disabled) return;
    const act = t.dataset.act, i = +t.dataset.i, sec = t.closest('.ln-block');
    switch (act) {
      case 'open': if (isReveal()) { nudgeGo(); break; } openStop(t.dataset.id); break;
      case 'go': onGo(); break;
      case 'switch': openSheet(); break;
      case 'streak': { const n = S().streak; say(`${n}-day streak. Learn tomorrow to make it ${n + 1}`); break; }
      case 'build': if (window.App && App.showOnboarding) App.showOnboarding(0); break;
      case 'chap': {
        if (isReveal()) break;
        const k = +t.dataset.ch, li = t.closest('.ln-ch-i'), open = !li.classList.contains('is-open');
        if (!chOpen) { chOpen = new Set(); home.querySelectorAll('.ln-ch-i.is-open').forEach((x) => chOpen.add(+x.querySelector('[data-ch]').dataset.ch)); }
        if (open) chOpen.add(k); else chOpen.delete(k);
        li.classList.toggle('is-open', open); t.setAttribute('aria-expanded', String(open));
        li.querySelector('.ln-ch-body').hidden = !open;
        break;
      }
      case 'note-x': { const a = adapt(); a.note = null; const n = t.closest('.ln-adnote'); if (n) n.remove(); break; }
      case 'close': closePlayer(); break;
      case 'cta': onCTA(); break;
      case 'cta2': closePlayer({ quiet: true }); break;
      case 'answer': answer(t); break;
      case 'term': {
        if (popEl && popEl._btn === t) { closePop(); break; }
        if (PL && PL.mode === 'connect') openPanel(t.dataset.term); else openPop(t);
        break;
      }
      case 'pop-close': closePop(); break;
      case 'panel-close': closePanel(); break;
      case 'ask': askAbout(t.dataset.term); break;
      case 'scale': setScale(sec, i); break;
      case 'cmp': setCompare(sec, i); break;
      case 'room': setRoom(sec, i); break;
      case 'room-next': setRoom(sec, (+sec.dataset.ri || 0) + 1); break;
      case 'stp': setStp(sec, i); break;
      case 'stp-next': setStp(sec, (+sec.dataset.si || 0) + 1); break;
      case 'share': say('Your share card is ready to send'); break;
    }
  }
  // In the reveal, the plan is for reading: the one action is Start learning
  function nudgeGo() { goBtn.classList.remove('is-nudge'); void goBtn.offsetWidth; goBtn.classList.add('is-nudge'); }

  // ═════════════════════════ MOUNT / SHOW / HIDE ═════════════════════════
  function mount(el) {
    viewEl = el;
    root = document.createElement('div'); root.className = 'ln-root' + (window.THEME === 'living' ? ' is-living' : '');
    root.innerHTML = `
      <div class="ln-home" data-home></div>
      <div class="ln-topfade" aria-hidden="true"></div>
      <div class="ln-dock" hidden><button type="button" class="btn-lit ln-go" data-act="go">Start learning</button></div>
      <div class="ln-play" hidden>
        <div class="ln-stage" data-stage></div>
        <header class="ln-pbar">
          <button type="button" class="ln-round" data-act="close" aria-label="Close">${ic('x', 20, 2.4)}</button>
          <div class="ln-psegs" role="progressbar"></div>
          <span class="ln-pcount"></span>
        </header>
        <div class="ln-tagline" aria-live="polite"></div>
        <div class="ln-pfoot"><button type="button" class="btn-lit ln-cta" data-act="cta">Continue</button><button type="button" class="ln-cta2" data-act="cta2" hidden></button></div>
        <canvas class="ln-confetti" aria-hidden="true"></canvas>
      </div>
      <div class="ln-panel" hidden></div>`;
    el.appendChild(root);
    home = root.querySelector('[data-home]'); dock = root.querySelector('.ln-dock'); goBtn = root.querySelector('.ln-go');
    play = root.querySelector('.ln-play'); stage = root.querySelector('[data-stage]');
    bar = root.querySelector('.ln-pbar'); cta = root.querySelector('.ln-cta'); cta2 = root.querySelector('.ln-cta2');
    tagline = root.querySelector('.ln-tagline'); panel = root.querySelector('.ln-panel'); confetti = root.querySelector('.ln-confetti');
    root.addEventListener('click', onClick);
    stage.addEventListener('scroll', () => { if (popEl) closePop(); }, { passive: true, capture: true });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || viewEl.hidden) return;
      if (popEl) closePop(); else if (!panel.hidden) closePanel(); else if (sheet) { if (sheet._finish) sheet._finish(null); else closeSheet(); } else if (PL) closePlayer();
    });

    const B = window.Bus;
    B.on('variant:change', ({ key }) => {
      if (key === 'roadmap') { chOpen = null; if (shown && !PL) renderHome(); return; }
      if (key !== 'lesson' || !PL || PL.kind !== 'lesson' || PL.completed) return;
      startLesson(PL.stop, true);
    });
    B.on('store:change', ({ patch }) => {
      if (!shown || muted) return;
      if ('style' in patch) {
        if (PL && PL.kind === 'lesson' && !PL.completed && S().variants.lesson === '3') startLesson(PL.stop, true);
        if (!PL) renderHome();
      } else if (!PL && ('courses' in patch || 'activeCourse' in patch || 'goal' in patch || 'span' in patch || 'justBuilt' in patch)) {
        if ('justBuilt' in patch && patch.justBuilt) revealRan = false;
        if ('activeCourse' in patch) chOpen = null;
        renderHome();
        if ('justBuilt' in patch && !patch.justBuilt) tabBar(true);
      }
    });
    B.on('course:created', () => { revealRan = false; if (shown && !PL) renderHome(); });
  }

  function show() {
    shown = true;
    const B = brain(); if (B) { B.setSpin(false); B.setDark(false); B.setMode('idle'); }
    if (PL) {
      tabBar(false);
      const step = PL.steps && PL.steps[PL.i];
      if (PL.mode === 'cards') layoutStack();
      if (step && step.t === 'gift') { const scr = document.getElementById('screen'); if (scr) scr.classList.add('is-dark'); const v = stage.querySelector('[data-vis]'); if (B && v) B.moveTo(v); }
    } else renderHome();
    if (!hooksRan) { hooksRan = true; setTimeout(testHooks, 60); }
  }
  function hide() {
    shown = false; closePop();
    if (sheet) { if (sheet._finish) sheet._finish(null); else closeSheet(true); }
  }

  // ───────── URL params for demos and screenshots ─────────
  // ?reveal=1 · ?done=N · ?added=1 · ?pace=easy|right|hard · ?checkin=1 · ?after=1 (save + reminder sheets)
  // ?finish=1|gift|next · ?play=<stopId> · ?review=1 · ?step=N · ?card=N · ?answer=right|wrong · ?pop=<term> · ?panel=<term> · ?sheet=courses · ?empty=1
  // (?roadmap=stack|timeline|chapters|path is read by the Store)
  function testHooks() {
    if (P.has('empty') || !course()) return;
    if (P.has('reveal')) { revealRan = false; window.Store.set({ justBuilt: true }); }
    let list = stops();
    const c = course();
    if (P.has('done')) {
      const n = Math.min(list.length, +P.get('done') || 0); c.progress = c.progress || {};
      list.slice(0, n).forEach((x) => { c.progress[x.id] = 'done'; });
    }
    if (P.has('added')) {
      const a = adapt(c), p = progress(c);
      const from = list.filter((x) => isLesson(x) && p[x.id] === 'done').pop() || list.find(isLesson);
      if (from && !a.added.some((r) => r.from === from.id)) {
        const q = (content(from).quiz || [])[0];
        a.added.push({ id: 'recap-' + from.id, kind: 'recap', title: `Recap of lesson ${lessonNo(list, from)}`, hook: 'The three things to keep, and one more try.', added: true, after: from.id, from: from.id, missed: q ? [q] : [], because: `You missed a check in “${from.title}”, so here is a 1 minute recap` });
      }
    }
    saveCourses(); renderHome();
    if (P.get('pace')) applyPace(P.get('pace'));
    if (P.get('sheet') === 'courses') openSheet();
    if (P.has('checkin')) checkinSheet();
    if (P.has('after')) followUps('lesson');
    list = stops();
    const fin = P.get('finish');
    if (fin) {
      const f = list.find((x) => x.kind === 'final');
      if (f) { const at = { gift: 'gift', next: 'next' }[fin]; startQuiz('final', f, at ? { at } : {}); if (at === 'next') finishCourse(); }
    } else if (P.has('review')) {
      const r = list.find((x) => x.kind === 'review'); if (r) startQuiz('review', r);
    } else if (P.get('play')) {
      const s = list.find((x) => x.id === P.get('play')) || list[0]; if (isLesson(s)) startLesson(s); else openStop(s.id, { force: true });
    }
    if (!PL) return;
    if (PL.mode === 'cards' && P.has('card')) { const n = +P.get('card') || 0; for (let k = 0; k < n && PL.ci < PL.cards.length - 1; k++) { PL.gate = true; PL.ci++; } layoutStack(); renderBar(); renderCTA(); }
    if (PL.mode !== 'cards' && P.has('step')) { const n = Math.min(PL.steps.length - 1, +P.get('step') || 0); if (n) showStep(n, 'none'); }
    const ans = P.get('answer');
    if (ans) {
      const scope = PL.mode === 'cards' ? stage.querySelector('.ln-card.is-top') : stage.querySelector('.ln-page:not(.is-out)');
      const box = scope && scope.querySelector('[data-quiz]');
      if (box) { const q = PL.q[box.dataset.quiz]; const k = ans === 'right' ? q.answer : (q.answer + 1) % q.options.length; const b = box.querySelector(`[data-i="${k}"]`); if (b) answer(b); }
    }
    if (P.get('block')) { const sec = stage.querySelector('.ln-page:not(.is-out) .ln-block'); const k = +P.get('block'); if (sec) { const t = sec.dataset.type; if (t === 'scale') setScale(sec, k); if (t === 'compare') setCompare(sec, k); if (t === 'rooms') setRoom(sec, k); if (t === 'steps') setStp(sec, k); } }
    const pt = P.get('pop') || P.get('panel');
    if (pt) { const b = stage.querySelector(`.ln-page:not(.is-out) [data-term="${pt}"], .ln-card.is-top [data-term="${pt}"]`); if (b) { if (P.get('panel')) openPanel(pt); else setTimeout(() => openPop(b), 80); } }
  }

  // A small hook for other modules and tests
  window.Learn = { mount, show, hide, stops: () => stops(), adapt: () => adapt(), followUps, applyPace };
})();
