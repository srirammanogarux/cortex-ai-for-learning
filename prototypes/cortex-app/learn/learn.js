// Learn tab (module B): the course roadmap, three lesson styles, review stops, and the course-end gift.
// Content lives in learn/content.js (window.LEARN). Talks to other modules only via Bus, Store and App.
(function () {
  const L = window.LEARN || { terms: {}, lessons: {}, review: [], final: [], packs: {}, short: {}, widenShape: {} };
  const P = new URLSearchParams(location.search);
  const docEl = document.documentElement;
  const still = () => docEl.classList.contains('still');
  const reducedQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const calm = () => still() || reducedQ.matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const say = (m) => window.toast && window.toast(m);
  const brain = () => window.Brain || null;
  const S = () => window.Store.get();
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
  };
  const ic = (n, size = 20, sw = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(IC[n] || IC.sparkle).map((d) => `<path d="${d}"/>`).join('')}</svg>`;

  // Solid colour-gradient art (fillSVG style): gift box, review shuffle, streak flame
  function giftSVG(size = 48, muted = false) {
    const id = 'lng' + (++uid);
    const box = muted ? ['#D9D6DD', '#B3AFB8'] : ['#FF9EC2', '#D6336C'], lid = muted ? ['#E4E1E7', '#C2BEC7'] : ['#FFB8D2', '#E64980'], rib = muted ? ['#CFCBD3', '#A9A5AE'] : ['#FFE066', '#F59F00'];
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true"><defs>
      <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${box[0]}"/><stop offset="1" stop-color="${box[1]}"/></linearGradient>
      <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lid[0]}"/><stop offset="1" stop-color="${lid[1]}"/></linearGradient>
      <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rib[0]}"/><stop offset="1" stop-color="${rib[1]}"/></linearGradient></defs>
      <rect x="8" y="21" width="32" height="21" rx="4.5" fill="url(#${id}b)"/>
      <rect x="5" y="14" width="38" height="9.5" rx="3.8" fill="url(#${id}l)"/>
      <rect x="21" y="14" width="6" height="28" fill="url(#${id}r)"/>
      <path d="M24 14.2c-2.6-5.8-9.6-7.6-10.4-3.4-.6 3.2 5 4.2 10.4 3.4zM24 14.2c2.6-5.8 9.6-7.6 10.4-3.4.6 3.2-5 4.2-10.4 3.4z" fill="url(#${id}r)"/>
      <rect x="10.5" y="24" width="3.6" height="14" rx="1.8" fill="#fff" opacity=".28"/></svg>`;
  }
  function shuffleSVG(size = 28, tone = 'color') {
    const id = 'lns' + (++uid), c = tone === 'white' ? ['#fff', '#fff'] : tone === 'muted' ? ['#A9A5AE', '#8C8892'] : ['#A78BFA', '#6D4AE0'];
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="url(#${id})" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs><linearGradient id="${id}" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs>${IC.shuffle.map((d) => `<path d="${d}"/>`).join('')}</svg>`;
  }
  function flameSVG(size = 20) {
    const id = 'lnf' + (++uid);
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC078"/><stop offset="1" stop-color="#E8590C"/></linearGradient></defs>
      <path d="M12 2c.7 3.3 2.5 5 4.1 6.7C17.8 10.5 19 12.5 19 15a7 7 0 0 1-14 0c0-2.4 1-4.2 2.5-5.5.3 1.6 1.1 2.8 2.4 3.4C9.4 9.1 10.4 5.2 12 2z" fill="url(#${id})"/>
      <path d="M12 13.3c1.5 1.3 2.5 2.4 2.5 3.9a2.5 2.5 0 0 1-5 0c0-1.4.9-2.6 2.5-3.9z" fill="#FFF0DC"/></svg>`;
  }

  // Static dot glyph of a particle shape (the character, frozen): tone = palette name | 'white' | 'muted'
  const gCache = {};
  function glyph(shape, tone = 'body', n = 110, rk = 1) {
    const key = shape + '|' + tone + '|' + n + '|' + rk;
    if (gCache[key]) return gCache[key];
    const B = brain(); if (!B || !B.sample) return '';
    let a, b;
    if (tone === 'white') { a = [255, 255, 255]; b = [255, 255, 255]; }
    else if (tone === 'muted') { a = [200, 196, 205]; b = [128, 124, 134]; }
    else if (tone === 'glow') { a = [255, 190, 214]; b = [255, 255, 255]; }
    else { const p = B.palette(tone); a = p[0]; b = p[1]; }
    const pts = B.sample(shape, n);
    const out = `<svg viewBox="-1.15 -1.15 2.3 2.3" aria-hidden="true">${pts.map(([x, y, d]) => {
      const c = a.map((v, j) => Math.round(v + (b[j] - v) * d)).join(',');
      return `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${((0.03 + 0.032 * d) * rk).toFixed(3)}" fill="rgb(${c})" opacity="${(0.42 + 0.58 * d).toFixed(2)}"/>`;
    }).join('')}</svg>`;
    gCache[key] = out; return out;
  }

  // ───────── Course data ─────────
  const style = () => S().style || 'connect';
  function course() {
    const s = S(); if (!s.courses || !s.courses.length) return null;
    return s.courses.find((c) => c.id === s.activeCourse) || s.courses[0];
  }
  const courseData = (c) => (window.COURSES && (COURSES[c.id] || COURSES.heart)) || null;
  function stops() {
    const c = course(); if (!c || !window.courseRoadmap) return [];
    return courseRoadmap(courseData(c), S().goal, S().span);
  }
  const progress = () => { const c = course(); if (!c) return {}; return c.progress || (c.progress = {}); };
  function states(list) {
    const p = progress(); let cur = false;
    return list.map((st) => { if (p[st.id] === 'done') return 'done'; if (!cur) { cur = true; return 'current'; } return 'locked'; });
  }
  const content = (st) => L.lessons[st.id] || genericLesson(st);
  function genericLesson(st) {
    return { min: 4, answer: st.hook || st.title, blocks: [], extra: [], recap: [st.hook || st.title], quiz: [] };
  }
  function minutes(st) { if (st.kind === 'review') return 2; if (st.kind === 'final') return 3; return content(st).min || 4; }
  function lessonNo(list, st) { let n = 0; for (const x of list) { if (x.kind === 'lesson') n++; if (x.id === st.id) return n; } return n; }
  function stopMeta(list, st) {
    if (st.kind === 'review') return `Review · ${minutes(st)} min`;
    if (st.kind === 'final') return 'Earn your gift';
    return `Lesson ${lessonNo(list, st)} · ${minutes(st)} min`;
  }
  const stopShape = (st) => st.kind === 'review' ? 'qmark' : st.kind === 'final' ? 'heart' : ((L.lessons[st.id] && L.lessons[st.id].shape) || st.shape || 'heart');
  const isCourseDone = (list, st) => st.every((x) => x === 'done');

  // ───────── State ─────────
  let viewEl, root, home, play, stage, bar, foot, cta, tagline, popEl = null, panel, confetti, sheet = null;
  let PL = null;              // the open player (lesson, review or finale)
  let shown = false, hooksRan = false;

  // ───────── Rich text with glowing terms ─────────
  function termBtn(id, txt) {
    const seen = PL && PL.seen.has(id);
    return `<button type="button" class="ln-term${seen ? ' is-done' : ''}" data-act="term" data-term="${id}"><span class="ln-term-ic">${ic(seen ? 'check' : 'sparkle', 12, 2.6)}</span>${esc(txt)}</button>`;
  }
  const rich = (s) => esc(s).replace(/\[\[(\w+)(?:\|([^\]]+))?\]\]/g, (m, id, txt) => (L.terms[id] ? termBtn(id, txt || L.terms[id].label) : (txt || id)));

  // ═════════════════════════ HOME ═════════════════════════
  function renderHome(o = {}) {
    clearT('home');
    const c = P.has('empty') ? null : course();
    if (!c) { home.innerHTML = emptyHTML(); takeVis(home); return; }
    const list = stops(), st = states(list), s = S();
    const doneN = st.filter((x) => x === 'done').length, curI = st.indexOf('current'), sty = style();
    const STYLE = { roadmap: ['route', 'Full roadmap'], connect: ['nodes', 'Connect the dots'], quick: ['zap', 'Quick bites'] }[sty];
    home.innerHTML = `
      <header class="ln-head">
        <button type="button" class="ln-switch" data-act="switch" aria-haspopup="dialog" aria-label="Switch course. Now: ${esc(c.title)}">
          <span class="ln-switch-ic">${glyph('heart', 'body', 240, 1.2)}</span><span class="ln-switch-t">${esc(c.title)}</span><span class="ln-switch-car">${ic('caret', 16, 2.6)}</span>
        </button>
        <button type="button" class="ln-streak" data-act="streak" aria-label="${s.streak}-day streak">${flameSVG(20)}<b>${s.streak}</b></button>
      </header>
      <div class="ln-prog" aria-label="${doneN} of ${list.length} stops done">
        <p class="ln-prog-t"><b>${doneN} of ${list.length}</b> stops done</p>
        <p class="ln-prog-p">${Math.round(doneN / list.length * 100)}%</p>
        <div class="ln-segs">${list.map((x, i) => `<i class="is-${st[i]}${x.kind !== 'lesson' ? ' is-' + x.kind : ''}"></i>`).join('')}</div>
      </div>
      ${curI >= 0 ? nextCard(list, list[curI], doneN) : completeCard()}
      <div class="ln-maphead"><h2 class="ln-h-map">Your path</h2><span class="ln-styletag">${ic(STYLE[0], 14, 2.2)}${STYLE[1]}</span></div>
      <div class="ln-map ln-map-${sty}" data-map>${sty === 'quick' ? mapQuick(list, st) : sty === 'connect' ? mapConnect(list, st) : mapRoadmap(list, st)}</div>
      <p class="ln-mapfoot">${sty === 'connect' ? 'Side stops are optional deeper dives. They open as you finish each lesson.' : sty === 'quick' ? 'Short packs you can finish in a few minutes each.' : 'One path, start to finish. Every stop builds on the last.'}</p>`;
    takeVis(home);
    if (o.justDone) celebrateStop(o.justDone, list, st);
  }

  function emptyHTML() {
    return `<div class="ln-empty">
      <div class="ln-empty-vis"><div class="ln-glow" aria-hidden="true"></div><div class="ln-vis" data-vis data-shape="brain" data-pal="cobalt" style="--k:.7"></div></div>
      <h1 class="ln-h1">Build your first course</h1>
      <p class="ln-lead">Tell Cortex what you’re curious about. It turns it into a short course with a clear finish line.</p>
      <button type="button" class="btn-lit" data-act="build">Build a course</button></div>`;
  }

  function nextCard(list, st, doneN) {
    const kind = st.kind, first = doneN === 0;
    const eyebrow = kind === 'review' ? 'Up next · Review' : kind === 'final' ? 'Up next · The finish' : `Up next · Lesson ${lessonNo(list, st)}`;
    const go = kind === 'review' ? 'Start the review' : kind === 'final' ? 'Start the final challenge' : first ? 'Start your first lesson' : 'Start lesson';
    const checks = kind === 'lesson' ? (content(st).quiz || []).length : kind === 'review' ? 5 : 3;
    return `<section class="ln-next${kind !== 'lesson' ? ' is-' + kind : ''}" aria-label="Up next">
      <div class="ln-next-top">
        <div class="ln-next-txt">
          <p class="ln-eyebrow">${eyebrow}</p>
          <h1 class="ln-next-t">${esc(st.title)}</h1>
          <p class="ln-next-hook">${esc(st.hook)}</p>
        </div>
        <div class="ln-next-vis"><div class="ln-glow" aria-hidden="true"></div><div class="ln-vis" data-vis data-shape="${stopShape(st)}" data-pal="${kind === 'review' ? 'cobalt' : 'body'}" style="--k:.4"></div></div>
      </div>
      <div class="ln-next-meta"><span>${ic('clock', 15, 2.2)}${minutes(st)} min</span><span>${ic('sparkle', 15, 2.2)}${checks} quick check${checks === 1 ? '' : 's'}</span></div>
      <button type="button" class="btn-lit ln-next-go" data-act="open" data-id="${st.id}">${go}</button>
    </section>`;
  }
  function completeCard() {
    const g = courseData(course()).gift;
    return `<section class="ln-next is-complete" aria-label="Course complete">
      <div class="ln-next-top">
        <div class="ln-next-txt"><p class="ln-eyebrow">Course complete</p><h1 class="ln-next-t">You earned ${esc(g.title.toLowerCase())}</h1><p class="ln-next-hook">It’s on your Profile shelf. Here’s where to go next.</p></div>
        <div class="ln-next-vis"><div class="ln-glow" aria-hidden="true"></div><div class="ln-vis" data-vis data-shape="heart" data-pal="body" style="--k:.4"></div></div>
      </div>
      <button type="button" class="btn-lit ln-next-go" data-act="widen-open">See what’s next</button>
    </section>`;
  }

  // Stop tiles (shared by all three map shapes)
  function tileHTML(st, state, size = '') {
    const badge = state === 'done' ? `<span class="ln-badge is-done">${ic('check', 13, 3.2)}</span>` : state === 'locked' ? `<span class="ln-badge is-lock">${ic('lock', 12, 2.4)}</span>` : '';
    const halo = state === 'current' ? '<span class="ln-halo" aria-hidden="true"></span><span class="ln-halo is-2" aria-hidden="true"></span>' : '';
    if (st.kind === 'final') return `<span class="ln-tile ln-tile-final is-${state} ${size}">${halo}<span class="ln-gift-art">${giftSVG(size === 'is-sm' ? 30 : 50, false)}</span><span class="ln-twinkle t1"></span><span class="ln-twinkle t2"></span><span class="ln-twinkle t3"></span>${badge}</span>`;
    if (st.kind === 'review') return `<span class="ln-tile ln-tile-review is-${state} ${size}">${halo}${shuffleSVG(size === 'is-sm' ? 20 : 26, state === 'locked' ? 'muted' : state === 'current' || state === 'done' ? 'white' : 'color')}${badge}</span>`;
    return `<span class="ln-tile is-${state} ${size}">${halo}<span class="ln-tile-g">${glyph(stopShape(st), state === 'locked' ? 'muted' : 'white', 240, 1.25)}</span>${badge}</span>`;
  }
  const startPill = (state) => state === 'current' ? '<span class="ln-start">Start</span>' : '';
  const stateWord = (s) => ({ done: 'Done', current: 'Up next', locked: 'Locked' }[s]);

  // Shape 1 · Full roadmap: one long winding path
  function mapRoadmap(list, st) {
    const gap = 128, top = 62, last = list.length - 1;
    const pos = list.map((x, i) => ({ x: i % 2 ? 258 : 70, y: top + i * gap }));
    pos[last] = { x: 164, y: top + last * gap + 22 };
    const H = pos[last].y + 120;
    let paths = '', glint = '';
    for (let i = 0; i < last; i++) {
      const a = pos[i], b = pos[i + 1], dy = b.y - a.y;
      const d = `M${a.x} ${a.y}C${a.x} ${a.y + dy * 0.6} ${b.x} ${b.y - dy * 0.6} ${b.x} ${b.y}`;
      const lit = st[i] === 'done';
      paths += `<path class="ln-trk" d="${d}"/>` + (lit ? `<path class="ln-seg-glow" d="${d}"/><path class="ln-seg is-lit" data-seg="${i + 1}" pathLength="1" d="${d}"/>` : `<path class="ln-seg is-dim" d="${d}"/>`);
      if (lit && st[i + 1] === 'current' && !calm()) glint = `<circle class="ln-glintdot" r="3.2"><animateMotion dur="2.6s" repeatCount="indefinite" path="${d}" keyPoints="0;1" keyTimes="0;1" calcMode="linear"/></circle>`;
    }
    const svg = `<svg class="ln-map-svg" width="328" height="${H}" viewBox="0 0 328 ${H}" aria-hidden="true"><defs><linearGradient id="lnLit" x1="0" y1="0" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F783AC"/><stop offset="1" stop-color="#D6336C"/></linearGradient></defs>${paths}${glint}</svg>`;
    const nodes = list.map((x, i) => {
      const p = pos[i], final = x.kind === 'final', side = final ? 'is-c' : i % 2 ? 'is-l' : 'is-r';
      const lab = `<span class="ln-lab ${side} is-${st[i]}"><b>${esc(x.title)}</b><span>${st[i] === 'current' ? 'Up next · ' + minutes(x) + ' min' : stopMeta(list, x)}</span></span>`;
      return `<button type="button" class="ln-stop is-${st[i]}${final ? ' is-final' : ''}${x.kind === 'review' ? ' is-review' : ''}" style="left:${p.x}px;top:${p.y}px" data-act="open" data-id="${x.id}" aria-label="${esc(x.title)}. ${stateWord(st[i])}">${tileHTML(x, st[i])}${startPill(st[i])}${lab}</button>`;
    }).join('');
    return `<div class="ln-map-in" style="height:${H}px">${svg}${nodes}</div>`;
  }

  // Shape 2 · Connect the dots: a spine with optional side dives
  function diveState(st, parentState) {
    const t = content(st).dive; if (!t || !L.terms[t]) return null;
    if (S().explored.includes('dive:' + t)) return 'explored';
    return parentState === 'done' ? 'open' : 'locked';
  }
  function mapConnect(list, st) {
    const gap = 148, top = 58, spine = 164, last = list.length - 1;
    const pos = list.map((x, i) => ({ x: spine, y: top + i * gap + (x.kind === 'final' ? 16 : 0) }));
    const H = pos[last].y + 116;
    let paths = '', dives = '';
    for (let i = 0; i < last; i++) {
      const a = pos[i], b = pos[i + 1];
      const d = `M${a.x} ${a.y}L${b.x} ${b.y}`;
      const lit = st[i] === 'done';
      paths += `<path class="ln-trk" d="${d}"/>` + (lit ? `<path class="ln-seg-glow" d="${d}"/><path class="ln-seg is-lit" data-seg="${i + 1}" pathLength="1" d="${d}"/>` : `<path class="ln-seg is-dim" d="${d}"/>`);
    }
    list.forEach((x, i) => {
      if (x.kind !== 'lesson') return;
      const ds = diveState(x, st[i]); if (!ds) return;
      const t = content(x).dive, right = i % 2 === 0, dx = right ? 276 : 52, dy = pos[i].y + 30, sx = spine + (right ? 32 : -32);
      const d = `M${sx} ${pos[i].y}C${(sx + dx) / 2} ${pos[i].y} ${(sx + dx) / 2} ${dy} ${dx} ${dy}`;
      paths += `<path class="ln-branch is-${ds}" d="${d}"/>`;
      dives += `<button type="button" class="ln-dive is-${ds}" style="left:${dx}px;top:${dy}px" data-act="dive" data-term="${t}" data-parent="${x.id}" aria-label="Deeper dive: ${esc(L.terms[t].label)}. ${ds === 'locked' ? 'Opens after this lesson' : ds === 'explored' ? 'Explored' : 'Optional'}">
        <span class="ln-dive-t">${ds === 'explored' ? ic('check', 18, 3) : glyph(L.terms[t].shape || 'heart', ds === 'locked' ? 'muted' : 'body', 240, 1.2)}</span>
        <span class="ln-dive-l"><b>${esc(cap(L.terms[t].label))}</b><span>${ds === 'locked' ? 'After this lesson' : ds === 'explored' ? 'Explored' : 'Deeper dive'}</span></span></button>`;
    });
    const svg = `<svg class="ln-map-svg" width="328" height="${H}" viewBox="0 0 328 ${H}" aria-hidden="true"><defs><linearGradient id="lnLit" x1="0" y1="0" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F783AC"/><stop offset="1" stop-color="#D6336C"/></linearGradient></defs>${paths}</svg>`;
    const nodes = list.map((x, i) => {
      const p = pos[i], final = x.kind === 'final', side = final ? 'is-c' : i % 2 === 0 ? 'is-l' : 'is-r';
      const lab = `<span class="ln-lab ln-lab-c ${side} is-${st[i]}"><b>${esc(x.title)}</b><span>${st[i] === 'current' ? 'Up next · ' + minutes(x) + ' min' : stopMeta(list, x)}</span></span>`;
      return `<button type="button" class="ln-stop is-${st[i]}${final ? ' is-final' : ''}${x.kind === 'review' ? ' is-review' : ''}" style="left:${p.x}px;top:${p.y}px" data-act="open" data-id="${x.id}" aria-label="${esc(x.title)}. ${stateWord(st[i])}">${tileHTML(x, st[i])}${startPill(st[i])}${lab}</button>`;
    }).join('');
    return `<div class="ln-map-in" style="height:${H}px">${svg}${nodes}${dives}</div>`;
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Shape 3 · Quick bites: short separate packs
  function mapQuick(list, st) {
    const chunks = [];
    list.forEach((x, i) => {
      if (x.kind !== 'lesson') { chunks.push({ kind: x.kind, items: [i] }); return; }
      const name = L.packs[x.id] || 'More bites', lastC = chunks[chunks.length - 1];
      if (lastC && lastC.kind === 'pack' && lastC.name === name && lastC.items.length < 3) lastC.items.push(i);
      else chunks.push({ kind: 'pack', name, items: [i] });
    });
    let packN = 0;
    return chunks.map((ch, ci) => {
      const link = ci ? `<div class="ln-pack-link${st[ch.items[0]] !== 'locked' ? ' is-lit' : ''}" aria-hidden="true"><i></i><i></i><i></i></div>` : '';
      if (ch.kind === 'review' || ch.kind === 'final') {
        const i = ch.items[0], x = list[i], s = st[i];
        return `${link}<button type="button" class="ln-pack ln-pack-${ch.kind} is-${s}" data-act="open" data-id="${x.id}" aria-label="${esc(x.title)}. ${stateWord(s)}">
          ${tileHTML(x, s)}
          <span class="ln-pack-tx"><b>${esc(x.title)}</b><span>${esc(x.hook)}</span></span>
          ${s === 'current' ? '<span class="ln-pill-start">Start</span>' : s === 'done' ? `<span class="ln-state is-done">${ic('check', 16, 3)}</span>` : `<span class="ln-state">${ic('lock', 15, 2.4)}</span>`}
        </button>`;
      }
      packN++;
      const dn = ch.items.filter((i) => st[i] === 'done').length, mins = ch.items.reduce((a, i) => a + minutes(list[i]), 0);
      return `${link}<section class="ln-pack${ch.items.some((i) => st[i] === 'current') ? ' is-live' : ''}">
        <header class="ln-pack-h"><div><p class="ln-pack-k">Pack ${packN} · ${ch.items.length} bite${ch.items.length === 1 ? '' : 's'} · ${mins} min</p><h3 class="ln-pack-n">${esc(ch.name)}</h3></div>
          <span class="ln-ring" style="--p:${dn / ch.items.length}" aria-label="${dn} of ${ch.items.length} done"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15"/>${dn ? '<circle class="v" cx="18" cy="18" r="15" pathLength="1"/>' : ''}</svg><b>${dn}/${ch.items.length}</b></span></header>
        <div class="ln-bites">${ch.items.map((i) => {
          const x = list[i], s = st[i];
          return `<button type="button" class="ln-bite is-${s}" data-act="open" data-id="${x.id}" aria-label="${esc(x.title)}. ${stateWord(s)}">
            ${tileHTML(x, s, 'is-sm')}
            <span class="ln-bite-tx"><b>${esc(x.title)}</b><span>Bite ${lessonNo(list, x)} · ${minutes(x)} min</span></span>
            ${s === 'current' ? '<span class="ln-pill-start">Start</span>' : s === 'done' ? `<span class="ln-state is-done">${ic('check', 16, 3)}</span>` : `<span class="ln-state">${ic('lock', 15, 2.4)}</span>`}
          </button>`;
        }).join('')}</div></section>`;
    }).join('');
  }

  // After a lesson: the stop fills, the path draws, the next stop unlocks
  function celebrateStop(id, list, st) {
    const map = home.querySelector('[data-map]'); if (!map) return;
    const i = list.findIndex((x) => x.id === id); if (i < 0) return;
    const done = map.querySelector(`[data-id="${id}"]`), next = map.querySelector(`[data-id="${list[i + 1] && list[i + 1].id}"]`);
    const seg = map.querySelector(`[data-seg="${i + 1}"]`);
    if (calm()) { scrollToEl(next || done, false); return; }
    if (done) done.classList.add('is-justdone');
    if (seg) seg.classList.add('is-draw');
    if (next && st[i + 1] === 'current') next.classList.add('is-unlock');
    scrollToEl(next || done, true);
    after('home', () => { const B = brain(); if (B) B.pulse(); }, 700);
  }
  function scrollToEl(el, smooth) {
    if (!el) return;
    const hr = home.getBoundingClientRect(), er = el.getBoundingClientRect(), k = hr.height / home.offsetHeight || 1;
    const y = home.scrollTop + (er.top - hr.top) / k - 330;
    home.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'auto' });
  }

  // ═════════════════════════ COURSE SWITCHER SHEET ═════════════════════════
  function openSheet() {
    closeSheet(true);
    const layer = document.getElementById('sheetLayer'); if (!layer) return;
    const s = S(), plus = window.Store.isPlus(), act = course();
    const rows = s.courses.map((c) => {
      const list = c.id === act.id ? stops() : [], dn = Object.values(c.progress || {}).filter((v) => v === 'done').length;
      const on = c.id === act.id;
      return `<button type="button" class="ln-crow" data-sact="pick" data-id="${c.id}" aria-pressed="${on}">
        <span class="ln-crow-ic">${glyph((COURSES[c.id] || COURSES.heart).shape || 'heart', on ? 'white' : 'body', 240, 1.2)}</span>
        <span class="ln-crow-tx"><b>${esc(c.title)}</b><span>${dn} of ${list.length || '–'} done${on ? ' · Current' : ''}</span></span>
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
        <button type="button" class="ln-crow ln-crow-new" data-sact="new"><span class="ln-crow-ic is-new">${ic('plus', 22, 2.6)}</span><span class="ln-crow-tx"><b>New course</b><span>Type any topic. Cortex builds the course.</span></span><span class="ln-crow-chk">${ic('chev', 18, 2.4)}</span></button>
      </div>`;
    layer.appendChild(wrap); sheet = wrap;
    requestAnimationFrame(() => wrap.classList.add('is-open')); if (still()) wrap.classList.add('is-open');
    wrap.addEventListener('click', (e) => {
      const t = e.target.closest('[data-sact]'); if (!t) return;
      const a = t.dataset.sact;
      if (a === 'close') closeSheet();
      if (a === 'pick') { if (t.dataset.id !== act.id) window.Store.set({ activeCourse: t.dataset.id }); closeSheet(); }
      if (a === 'new') { closeSheet(true); newCourse(); }
    });
    const sh = wrap.querySelector('.ln-sh'), grab = wrap.querySelector('.ln-sh-grab');
    let y0 = null, dy = 0;
    sh.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; sh.setPointerCapture(e.pointerId); sh.style.transition = 'none'; });
    sh.addEventListener('pointermove', (e) => { if (y0 == null) return; dy = Math.max(0, (e.clientY - y0) / (window.PS || 1)); sh.style.transform = `translateY(${dy}px)`; });
    const end = () => { if (y0 == null) return; y0 = null; sh.style.transition = ''; if (dy > 80) closeSheet(); else sh.style.transform = ''; };
    sh.addEventListener('pointerup', end); sh.addEventListener('pointercancel', end);
    grab.style.cursor = 'grab';
  }
  function closeSheet(now) {
    if (!sheet) return; const w = sheet; sheet = null;
    if (now || still()) { w.remove(); return; }
    w.classList.remove('is-open'); setTimeout(() => w.remove(), 320);
  }
  function newCourse() {
    if (!window.Store.isPlus() && S().courses.length >= 3) { window.App.paywall('courses'); return; }
    say('Course builder opens here');
  }

  // ═════════════════════════ PLAYER ═════════════════════════
  // mode: 'paced' | 'cards' | 'connect' | 'long' (lessons); 'quiz' for review + finale
  function lessonMode() {
    const v = S().variants.lesson;
    if (v === '2') return 'cards';
    if (v === '3') return { quick: 'cards', connect: 'connect', roadmap: 'long' }[style()];
    return 'paced';
  }
  const PICK = {
    quick: ['Card stack', 'you like quick bites'],
    connect: ['Branching', 'you like connecting ideas'],
    roadmap: ['Longer steps', 'you like a full roadmap'],
  };

  function openStop(id, o = {}) {
    const list = stops(), st = states(list), i = list.findIndex((x) => x.id === id);
    if (i < 0) return;
    if (st[i] === 'locked' && !o.force) {
      const el = home.querySelector(`[data-id="${id}"]`);
      if (el) { el.classList.remove('is-nope'); void el.offsetWidth; el.classList.add('is-nope'); }
      say(list[i].kind === 'final' ? 'Finish every stop to unlock your gift' : 'Finish the stop before this one to unlock it');
      return;
    }
    const stop = list[i];
    if (stop.kind === 'review') startQuiz('review', stop);
    else if (stop.kind === 'final') { if (st[i] === 'done' && !o.force) startQuiz('final', stop, { at: 'gift' }); else startQuiz('final', stop, o); }
    else startLesson(stop);
  }

  function newPL(stop, kind, mode) {
    return { stop, kind, mode, steps: [], i: 0, right: 0, total: 0, seen: new Set(), q: {}, qn: 0, gate: true, completed: false, ci: 0, cards: null };
  }
  function enterPlayer() {
    clearT('play'); closePop(); closePanel();
    play.hidden = false; play.className = 'ln-play';
    if (window.App && App.setTabBar) App.setTabBar(false);
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

  function startQuiz(kind, stop, o = {}) {
    PL = newPL(stop, kind, 'quiz');
    enterPlayer(); play.classList.remove('has-tag'); tagline.innerHTML = '';
    let qs;
    if (kind === 'review') {
      const list = stops(), idx = list.findIndex((x) => x.id === stop.id), before = list.slice(0, idx).filter((x) => x.kind === 'lesson').map((x) => x.id);
      const pool = [];
      before.forEach((id) => (L.lessons[id] && L.lessons[id].quiz || []).forEach((q) => pool.push(q)));
      L.review.forEach((q) => { if (!q.from || before.includes(q.from)) pool.push(q); });
      qs = shuffle(pool).slice(0, 5);
      PL.steps = qs.map((q, k) => ({ t: 'quiz', q, k, n: qs.length })).concat([{ t: 'result' }]);
    } else {
      qs = L.final.slice(0, 3);
      PL.steps = qs.map((q, k) => ({ t: 'quiz', q, k, n: qs.length, fin: true })).concat([{ t: 'gift' }, { t: 'graph' }, { t: 'widen' }]);
    }
    const at = o.at ? PL.steps.findIndex((s) => s.t === o.at) : 0;
    showStep(Math.max(0, at), 'none');
  }
  function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }

  const LEARN_STEPS = { intro: 1, block: 1, quiz: 1, recap: 1 };
  const isGated = (step) => step.t === 'quiz' || (step.t === 'block' && step.b.type === 'guess');

  function showStep(i, dir = 'fwd') {
    PL.i = i; closePop();
    const step = PL.steps[i];
    const old = stage.querySelector('.ln-page:not(.is-out)');
    const el = document.createElement('div');
    el.className = 'ln-page ln-page-' + step.t;
    el.innerHTML = `<div class="ln-pg">${stepHTML(step)}</div>`;
    stage.appendChild(el);
    if (old) {
      if (calm() || dir === 'none') old.remove();
      else { el.classList.add('in-' + dir); old.classList.add('is-out', 'out-' + dir); void el.offsetWidth; el.classList.remove('in-' + dir); setTimeout(() => old.remove(), 560); }
    }
    const dark = step.t === 'gift' || step.t === 'graph';
    play.classList.toggle('is-dark', dark);
    play.classList.toggle('is-finale', !LEARN_STEPS[step.t]);
    const scr = document.getElementById('screen'); if (scr) scr.classList.toggle('is-dark', dark);
    takeVis(el);
    initStep(el, step);
    PL.gate = !isGated(step);
    renderBar();
    renderCTA();
    if (step.t === 'done' || step.t === 'result') completeStop();
    if (step.t === 'gift') runGift(el);
    if (step.t === 'graph') runGraph(el);
    if (step.t === 'done' || step.t === 'result') runDone(el);
  }

  function stepTitleBits() {
    const list = stops(), st = PL.stop;
    return { n: lessonNo(list, st), min: minutes(st) };
  }

  function stepHTML(step) {
    const stop = PL.stop, c = content(stop), shape = stopShape(stop);
    switch (step.t) {
      case 'intro': {
        const b = stepTitleBits();
        return `<p class="ln-eyebrow">Lesson ${b.n} · ${b.min} min</p>
          <h1 class="ln-h1">${esc(stop.title)}</h1>
          <div class="ln-hero-vis"><div class="ln-glow" aria-hidden="true"></div><div class="ln-vis" data-vis data-shape="${shape}" data-pal="body" style="--k:.64"></div></div>
          <p class="ln-touch">${ic('hand', 15, 2)} Touch it</p>
          <p class="ln-answer">${rich(c.answer)}</p>
          ${PL.mode === 'connect' ? `<p class="ln-hint">${ic('sparkle', 14, 2.4)} Tap a glowing term to branch off to the side.</p>` : ''}`;
      }
      case 'block': {
        const b = step.b;
        return `<div class="ln-sechead"><div><p class="ln-eyebrow">${esc(b.eyebrow)}</p><h2 class="ln-h2">${esc(b.title)}</h2></div><div class="ln-mini-vis"><div class="ln-vis" data-vis data-shape="${b.shape || shape}" data-pal="body" style="--k:.34"></div></div></div>
          ${b.intro ? `<p class="ln-intro">${rich(b.intro)}</p>` : ''}
          <div class="ln-block" data-type="${b.type}">${BLOCK[b.type] ? BLOCK[b.type](b) : ''}</div>`;
      }
      case 'quiz': {
        const label = PL.kind === 'review' ? `Review · ${step.k + 1} of ${step.n}` : PL.kind === 'final' ? `Final challenge · ${step.k + 1} of ${step.n}` : `Quick check · ${step.k + 1} of ${step.n}`;
        return `<div class="ln-sechead"><div><p class="ln-eyebrow">${label}</p><h2 class="ln-h2 ln-qh">${esc(step.q.q)}</h2></div><div class="ln-mini-vis"><div class="ln-vis" data-vis data-shape="qmark" data-pal="cobalt" style="--k:.34"></div></div></div>
          ${quizHTML(step.q, true)}`;
      }
      case 'recap':
        return `<div class="ln-sechead"><div><p class="ln-eyebrow">Before the checks</p><h2 class="ln-h2">What to keep</h2></div><div class="ln-mini-vis"><div class="ln-vis" data-vis data-shape="${shape}" data-pal="body" style="--k:.34"></div></div></div>
          <ul class="ln-recap">${(c.recap || []).map((r, k) => `<li style="--d:${k * 90}ms"><span class="ln-recap-ic">${ic('check', 15, 3)}</span><span>${esc(r)}</span></li>`).join('')}</ul>`;
      case 'done': return doneHTML('lesson');
      case 'result': return doneHTML('review');
      case 'gift': return giftHTML();
      case 'graph': return graphHTML();
      case 'widen': return widenHTML();
    }
    return '';
  }

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
    box.querySelector('[data-reveal]').innerHTML = `<div class="ln-reveal-card ${right ? 'ok' : 'no'}"><p class="ln-reveal-k"><span class="ln-reveal-badge">${ic(right ? 'check' : 'x', 13, 3.2)}</span>${right ? 'That’s right' : 'Not quite'}</p><p class="ln-body">${right || q.explain.toLowerCase().includes(q.options[q.answer].toLowerCase()) ? '' : `Right answer: <b>${esc(q.options[q.answer])}</b>. `}${rich(q.explain)}</p></div>`;
    if (box.dataset.scored === '1') { PL.total++; if (right) PL.right++; }
    const B = brain();
    if (B) { B.pulse(); const v = box.closest('.ln-page, .ln-card'); const vis = v && v.querySelector('[data-vis]'); if (vis && vis.dataset.shape === 'qmark' && right) B.setShape(PL.kind === 'lesson' ? stopShape(PL.stop) : 'heart', 'body', 900); }
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

  function initStep(el, step) { /* blocks start in their first state; nothing to do yet */ }
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
    const B = brain(); if (B) B.pulse();
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
    const B = brain(); if (B) B.pulse();
  }
  function setStp(sec, i) {
    const b = currentBlock('steps'); if (!b) return;
    i = (i + b.steps.length) % b.steps.length; sec.dataset.si = i;
    sec.querySelector('.ln-steps').style.setProperty('--i', i);
    sec.querySelectorAll('.ln-step').forEach((x, k) => { x.setAttribute('aria-selected', k === i); x.classList.toggle('is-past', k < i); });
    const card = sec.querySelector('[data-stepcard]'); card.innerHTML = `<p class="ln-stepcard-k">Step ${i + 1} of ${b.steps.length} · ${esc(b.steps[i].name)}</p><p class="ln-stepcard-t">${rich(b.steps[i].text)}</p>`; pop(card);
    const nx = sec.querySelector('[data-act="stp-next"]'); nx.innerHTML = i === b.steps.length - 1 ? `Start again ${ic('shuffle', 15, 2.4)}` : `Next ${ic('arrow', 16, 2.4)}`;
    const B = brain(); if (B) B.pulse();
  }
  const pop = (el) => { el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop'); };

  // ───────── Card stack ─────────
  function autoCards(c, stop) {
    const out = [{ idea: c.answer, shape: stopShape(stop) }];
    (c.blocks || []).forEach((b) => {
      if (b.type === 'points') b.items.slice(0, 3).forEach((p) => out.push({ idea: `${p[1]}: ${p[2]}`, shape: b.shape }));
      else if (b.type === 'steps') b.steps.forEach((s) => out.push({ idea: s.text, shape: b.shape, k: s.name }));
      else if (b.type === 'compare') b.verdict.forEach((v) => out.push({ idea: v, shape: b.shape }));
    });
    const ideas = out.slice(0, 5), q = c.quiz || [];
    const res = [];
    ideas.forEach((x, k) => { res.push(x); if (k === 1 && q[0]) res.push({ quiz: 0 }); });
    if (q[1]) res.push({ quiz: 1 }); else if (q[0] && !res.some((x) => x.quiz === 0)) res.push({ quiz: 0 });
    return res;
  }
  function buildCards() {
    const c = content(PL.stop);
    const raw = c.cards || autoCards(c, PL.stop);
    PL.cards = raw.map((x) => (x.quiz != null ? Object.assign({ isQ: true }, c.quiz[x.quiz]) : x.q ? Object.assign({ isQ: true }, x) : x));
    PL.ci = 0; PL.mode = 'cards';
    const ideas = PL.cards.filter((x) => !x.isQ).length; let ideaN = 0, qN = 0;
    stage.innerHTML = `<div class="ln-page ln-page-cards"><div class="ln-stack" data-stack>${PL.cards.map((cd, k) => {
      if (cd.isQ) { qN++; return `<article class="ln-card is-q" data-k="${k}"><div class="ln-card-head"><p class="ln-eyebrow">Quick check</p><div class="ln-card-mini"><div class="ln-vis" data-vis data-shape="qmark" data-pal="cobalt" style="--k:.25"></div></div></div><h3 class="ln-card-q">${esc(cd.q)}</h3>${quizHTML(cd, true)}</article>`; }
      ideaN++;
      return `<article class="ln-card" data-k="${k}"><div class="ln-card-vis"><div class="ln-glow" aria-hidden="true"></div><span class="ln-card-g">${glyph(cd.shape || stopShape(PL.stop), 'body', 480, 0.8)}</span><div class="ln-vis" data-vis data-shape="${cd.shape || stopShape(PL.stop)}" data-pal="body" style="--k:.7"></div></div>
        <p class="ln-card-k">${k === 0 ? esc(PL.stop.title) : `Idea ${ideaN} of ${ideas}`}</p><p class="ln-card-idea">${rich(cd.idea)}</p></article>`;
    }).join('')}</div><p class="ln-swipe">${ic('hand', 15, 2)} Swipe the card, or tap Next</p></div>`;
    layoutStack(true);
    bindSwipe(stage.querySelector('[data-stack]'));
    renderBar(); renderCTA();
  }
  function layoutStack(first) {
    const cards = stage.querySelectorAll('.ln-card');
    cards.forEach((el, k) => {
      const d = k - PL.ci; el.classList.toggle('is-top', d === 0); el.classList.toggle('is-gone', d < 0);
      el.style.zIndex = 100 - k; el.setAttribute('aria-hidden', d !== 0);
      el.querySelectorAll('button').forEach((b) => { b.tabIndex = d === 0 ? 0 : -1; });
      if (d < 0) { el.style.transform = `translateX(${el.dataset.out === '1' ? 440 : -440}px) rotate(${el.dataset.out === '1' ? 14 : -14}deg)`; el.style.opacity = 0; }
      else { el.style.transform = `translateY(${Math.min(d, 2) * 14}px) scale(${1 - Math.min(d, 2) * 0.05})`; el.style.opacity = d > 2 ? 0 : 1; }
    });
    const top = cards[PL.ci];
    if (top) {
      const vis = top.querySelector('[data-vis]');
      const B = brain(); if (B && vis) { B.moveTo(vis); B.setShape(vis.dataset.shape, vis.dataset.pal, first ? 1200 : 900); }
      PL.gate = !top.classList.contains('is-q') || !!top.querySelector('.is-answered');
    }
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
    let label = 'Continue', carved = false, enabled = PL.gate;
    if (PL.mode === 'cards') {
      const top = PL.cards[PL.ci];
      label = PL.ci === PL.cards.length - 1 ? 'Finish lesson' : 'Next';
      if (top && top.isQ && !PL.gate) label = 'Pick an answer';
    } else {
      const step = PL.steps[PL.i], nextStep = PL.steps[PL.i + 1];
      if (isGated(step) && !PL.gate) label = 'Pick an answer';
      else if (step.t === 'done' || step.t === 'result') label = 'Back to your course';
      else if (step.t === 'gift') { label = 'See your graph grow'; enabled = !!PL.giftReady; }
      else if (step.t === 'graph') label = 'See what’s next';
      else if (step.t === 'widen') { label = 'Back to your course'; carved = true; }
      else if (nextStep && nextStep.t === 'done') label = 'Finish lesson';
      else if (nextStep && nextStep.t === 'result') label = 'Finish the review';
      else if (nextStep && nextStep.t === 'gift') label = 'Finish the course';
    }
    cta.className = (carved ? 'btn-carved' : 'btn-lit') + ' ln-cta' + (glow && enabled ? ' is-ready' : '');
    cta.disabled = !enabled; cta.textContent = label;
  }
  function nudgeCTA() { cta.classList.remove('is-nudge'); void cta.offsetWidth; cta.classList.add('is-nudge'); }
  function onCTA() {
    if (!PL || cta.disabled) return;
    if (PL.mode === 'cards') return advanceCard(-1);
    const step = PL.steps[PL.i];
    if (step.t === 'done' || step.t === 'result' || step.t === 'widen') return closePlayer();
    if (PL.i < PL.steps.length - 1) showStep(PL.i + 1, 'fwd');
  }

  // ───────── Completion ─────────
  function markDone(id) {
    const c = course(); if (!c) return;
    c.progress = c.progress || {}; c.progress[id] = 'done';
    window.Store.set({ courses: S().courses });
  }
  function completeStop() {
    if (PL.completed) return; PL.completed = true;
    const stop = PL.stop, c = course();
    markDone(stop.id);
    window.Bus.emit('lesson:done', { courseId: c.id, lessonId: stop.id });
    if (stop.kind === 'lesson') {
      const ex = S().explored;
      if (!ex.includes(stop.id)) window.Store.set({ explored: ex.concat([stop.id]) });
      window.Bus.emit('explored', { id: stop.id, label: stop.title, subject: 'Body', shape: stopShape(stop), palette: 'body', from: 'learn' });
    }
    PL.justDone = stop.id;
  }
  function finishCourse() {
    if (PL.finished) return; PL.finished = true;
    const stop = PL.stop, c = course(), d = courseData(c), g = d.gift;
    markDone(stop.id); PL.justDone = stop.id;
    window.Bus.emit('lesson:done', { courseId: c.id, lessonId: stop.id });
    const col = S().collectibles || [];
    if (!col.some((x) => x.id === g.id)) window.Store.set({ collectibles: col.concat([{ id: g.id, title: g.title, shape: g.shape, palette: g.palette }]) });
    window.Bus.emit('course:finished', { courseId: c.id, gift: g });
  }

  function doneHTML(kind) {
    const list = stops(), st = states(list).map((s, i) => (list[i].id === PL.stop.id ? 'done' : s));
    const dn = st.filter((x) => x === 'done').length, nx = list[st.indexOf('current')] || list.find((x, i) => st[i] !== 'done');
    const stats = kind === 'review'
      ? [[PL.total ? `${PL.right}/${PL.total}` : '–', 'right'], [`${dn} of ${list.length}`, 'course done']]
      : [[PL.total ? `${PL.right}/${PL.total}` : '–', 'checks right'], [`${PL.seen.size}`, `term${PL.seen.size === 1 ? '' : 's'} tapped`], [`${dn} of ${list.length}`, 'course done']];
    const title = kind === 'review' ? (PL.right >= PL.total - 1 ? 'Review done. That stuck.' : 'Review done') : 'Lesson done';
    return `<div class="ln-done">
      <div class="ln-done-vis"><span class="ln-ring-pulse" aria-hidden="true"></span><span class="ln-ring-pulse is-2" aria-hidden="true"></span><div class="ln-glow" aria-hidden="true"></div><div class="ln-vis" data-vis data-shape="${kind === 'review' ? 'heart' : stopShape(PL.stop)}" data-pal="body" style="--k:.7"></div></div>
      <p class="ln-eyebrow">${esc(PL.stop.title)}</p>
      <h1 class="ln-h1 ln-done-t">${title}</h1>
      <div class="ln-done-stats">${stats.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div>
      ${nx && nx.id !== PL.stop.id ? `<p class="ln-done-next">${ic('arrow', 15, 2.4)}<span>Next on your path: <b>${esc(nx.title)}</b></span></p>` : ''}
    </div>`;
  }
  function runDone(el) {
    const B = brain(); if (!B) return;
    B.pulse(); after('play', () => B.pulse(), 520); after('play', () => B.pulse(), 1040);
    burst(184, 300, 90, false);
  }

  // ───────── The finale: gift, graph, widen ─────────
  function giftHTML() {
    const g = courseData(course()).gift;
    return `<div class="ln-gift">
      <div class="ln-gift-stage"><div class="ln-gift-halo" aria-hidden="true"></div><div class="ln-vis" data-vis data-shape="scatter" data-pal="body" style="--k:.92"></div><div class="ln-gift-glint" aria-hidden="true"></div>
        <span class="ln-spark s1" aria-hidden="true"></span><span class="ln-spark s2" aria-hidden="true"></span><span class="ln-spark s3" aria-hidden="true"></span><span class="ln-spark s4" aria-hidden="true"></span></div>
      <div class="ln-gift-tx">
        <p class="ln-eyebrow is-light">Course complete</p>
        <h1 class="ln-h1">${esc(g.title)}</h1>
        <p class="ln-gift-sub">${esc(g.sub)}</p>
        <div class="ln-gift-row"><span class="ln-added">${ic('check', 15, 3)} Added to your Profile</span><button type="button" class="ln-share" data-act="share">${ic('share', 15, 2.2)} Share</button></div>
      </div></div>`;
  }
  function runGift(el) {
    finishCourse();
    PL.giftReady = false; renderCTA();
    const B = brain(); el.classList.remove('is-revealed');
    if (B) { B.setSpin(false); B.setShape('scatter', 'body', 10); }
    after('play', () => { if (B) B.setShape('heart', 'body', 2200); }, 350);
    after('play', () => { el.classList.add('is-formed'); if (B) { B.setSpin(true); B.pulse(); } burst(184, 290, 170, true); }, 2300);
    after('play', () => { burst(184, 290, 90, true); if (B) B.pulse(); }, 2900);
    after('play', () => { el.classList.add('is-revealed'); PL.giftReady = true; renderCTA(true); }, 2700);
    if (still()) { el.classList.add('is-formed', 'is-revealed'); }
  }
  function graphHTML() {
    const lessons = stops().filter((x) => x.kind === 'lesson');
    const cx = 164, cy = 168, R = 112, n = lessons.length;
    const nodes = lessons.map((x, k) => { const a = -Math.PI / 2 + k * 2 * Math.PI / n; return { a, x: cx + R * Math.cos(a), y: cy + R * 0.86 * Math.sin(a), label: L.short[x.id] || x.title }; });
    let stars = ''; for (let k = 0; k < 34; k++) { const sx = (Math.sin(k * 12.9898) * 43758.5453 % 1 + 1) % 1, sy = (Math.sin(k * 78.233) * 12543.23 % 1 + 1) % 1; stars += `<circle class="ln-star" cx="${(sx * 328).toFixed(1)}" cy="${(sy * 340).toFixed(1)}" r="${(0.8 + (k % 3) * 0.5).toFixed(1)}" style="--d:${(k % 7) * 0.4}s"/>`; }
    const ghosts = [{ x: 34, y: 318, l: 'Lungs' }, { x: 294, y: 318, l: 'Blood' }];
    let lines = '', ring = '', dots = '', labs = '';
    nodes.forEach((p, k) => {
      const q = nodes[(k + 1) % n];
      lines += `<path class="ln-gl" pathLength="1" d="M${cx} ${cy}L${p.x.toFixed(1)} ${p.y.toFixed(1)}" style="--d:${300 + k * 140}ms"/>`;
      ring += `<path class="ln-gl is-ring" pathLength="1" d="M${p.x.toFixed(1)} ${p.y.toFixed(1)}L${q.x.toFixed(1)} ${q.y.toFixed(1)}" style="--d:${900 + k * 110}ms"/>`;
      dots += `<g class="ln-gn" style="--d:${420 + k * 140}ms;transform-origin:${p.x.toFixed(1)}px ${p.y.toFixed(1)}px"><circle class="ln-gn-h" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="11"/><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5.5"/></g>`;
      const ca = Math.cos(p.a), anchor = ca > 0.3 ? 'start' : ca < -0.3 ? 'end' : 'middle';
      const lx = p.x + 13 * ca, ly = p.y + 13 * Math.sin(p.a) * 0.86 + (anchor === 'middle' ? (Math.sin(p.a) > 0 ? 12 : -4) : 4);
      labs += `<text class="ln-gt" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" style="--d:${520 + k * 140}ms">${esc(p.label)}</text>`;
    });
    const gh = ghosts.map((g, k) => `<path class="ln-gl is-ghost" d="M${cx} ${cy}L${g.x} ${g.y}" style="--d:${1700 + k * 160}ms"/><g class="ln-gn is-ghost" style="--d:${1800 + k * 160}ms;transform-origin:${g.x}px ${g.y}px"><circle cx="${g.x}" cy="${g.y}" r="9"/></g><text class="ln-gt is-ghost" x="${g.x}" y="${g.y + 26}" text-anchor="middle" style="--d:${1900 + k * 160}ms">${g.l}</text>`).join('');
    return `<div class="ln-graph">
      <p class="ln-eyebrow is-light">Your graph grew</p>
      <h1 class="ln-h1">A new Body cluster: ${n} ideas</h1>
      <p class="ln-gift-sub">Every lesson you finished is now a node. The dotted ones are gaps worth filling next.</p>
      <svg class="ln-graph-svg" viewBox="0 0 328 350" role="img" aria-label="Your knowledge graph with a new Body cluster of ${n} ideas">
        ${stars}${gh}${lines}${ring}
        <g class="ln-gn is-core" style="--d:120ms;transform-origin:${cx}px ${cy}px"><circle class="ln-gn-h" cx="${cx}" cy="${cy}" r="26"/><circle cx="${cx}" cy="${cy}" r="15"/></g>
        <text class="ln-gt is-core" x="${cx}" y="${cy + 38}" text-anchor="middle" style="--d:200ms">Heart</text>
        ${dots}${labs}
      </svg></div>`;
  }
  function runGraph(el) {
    const B = brain(); if (B) { B.setSpin(false); }
    burst(164 + 20, 380, 50, true);
  }
  function widenHTML() {
    const d = courseData(course()), w = d.widen || [];
    const small = w.filter((x) => !x.big), big = w.find((x) => x.big);
    return `<div class="ln-widen">
      <p class="ln-eyebrow">What’s next</p>
      <h1 class="ln-h1">Widen what you know</h1>
      <p class="ln-lead">Your heart course connects to these. Each one fills a gap in your graph.</p>
      <p class="ln-wk">Next door to the heart</p>
      <div class="ln-wlist">${small.map((x) => `<button type="button" class="ln-wcard" data-act="widen" data-id="${x.id}">
        <span class="ln-wcard-g">${glyph(L.widenShape[x.id] || 'heart', 'body', 240, 1.15)}</span>
        <span class="ln-wcard-tx"><b>${esc(x.title)}</b><span>${esc(x.why)}</span></span>
        <span class="ln-wcard-go">${ic('plus', 18, 2.6)}</span></button>`).join('')}</div>
      ${big ? `<p class="ln-wk">Or go bigger</p>
      <button type="button" class="ln-track" data-act="widen" data-id="${big.id}">
        <span class="ln-track-art" aria-hidden="true"><span class="g1">${glyph('heart', 'glow', 240, 1)}</span><span class="g2">${glyph('split', 'glow', 240, 1)}</span><span class="g3">${glyph('ring', 'glow', 240, 1)}</span></span>
        <span class="ln-track-k">${ic('route', 14, 2.4)} Track · 3 courses</span>
        <b class="ln-track-t">${esc(big.title.replace(/^Track:\s*/, ''))}</b>
        <span class="ln-track-s">${esc(big.why)}</span>
        <span class="ln-track-row"><span class="is-done">${ic('check', 12, 3.2)} Heart</span><span>Lungs</span><span>Blood</span></span>
        <span class="ln-track-go">Start the track ${ic('arrow', 16, 2.4)}</span>
      </button>` : ''}
    </div>`;
  }
  function widenPick(id) {
    const d = courseData(course()), x = (d.widen || []).find((w) => w.id === id); if (!x) return;
    if (x.big) { if (!window.Store.isPlus()) window.App.paywall('courses'); else say('Track builder opens here'); return; }
    newCourse();
  }

  // Particle confetti (canvas, not emoji)
  let cfx = null;
  function burst(x, y, n, dark) {
    if (calm() || !confetti) return;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    if (!cfx) { confetti.width = 368 * DPR; confetti.height = 822 * DPR; cfx = { g: confetti.getContext('2d'), parts: [], raf: 0, DPR }; }
    const cols = dark ? ['#F783AC', '#FFB3CF', '#FFFFFF', '#FFD43B', '#FF8FB8', '#9FBAFF'] : ['#F783AC', '#D6336C', '#FFB3CF', '#7FA3FF', '#1F5BE0', '#FFD43B'];
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
      if (cfx.dark && p.r > 3) { g.globalAlpha = a * 0.25; g.beginPath(); g.arc(p.x * DPR, p.y * DPR, p.r * 3 * DPR, 0, 6.283); g.fill(); }
    }
    g.globalAlpha = 1;
    cfx.raf = cfx.parts.length ? requestAnimationFrame(stepConfetti) : 0;
  }
  function stopConfetti() { if (cfx) { cancelAnimationFrame(cfx.raf); cfx.raf = 0; cfx.parts = []; cfx.g.clearRect(0, 0, confetti.width, confetti.height); } }

  // ───────── Close ─────────
  function closePlayer() {
    if (!PL) return;
    const justDone = PL.justDone;
    clearT('play'); closePop(); closePanel(); stopConfetti();
    const B = brain(); if (B) { B.setSpin(false); B.setDark(false); B.setMode('idle'); }
    const scr = document.getElementById('screen'); if (scr) scr.classList.remove('is-dark');
    PL = null;
    play.classList.remove('is-in');
    setTimeout(() => { if (!PL) { play.hidden = true; stage.innerHTML = ''; play.className = 'ln-play'; } }, calm() ? 0 : 520);
    if (window.App && App.setTabBar && (!App.current || App.current() === 'learn')) App.setTabBar(true);
    renderHome({ justDone });
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
  function openPanel(id, o = {}) {
    const t = L.terms[id]; if (!t) return;
    closePop();
    const explored = S().explored.includes('dive:' + id);
    panel.innerHTML = `<div class="ln-panel-bd" data-act="panel-close"></div>
      <aside class="ln-panel-sh" role="dialog" aria-modal="true" aria-label="${esc(t.label)}">
        <button type="button" class="ln-round ln-panel-x" data-act="panel-close" aria-label="Close">${ic('x', 18, 2.4)}</button>
        <p class="ln-eyebrow">${o.dive ? 'Deeper dive' : 'Side path'}</p>
        <div class="ln-panel-g">${glyph(t.shape || 'heart', 'body', 480, 0.62)}</div>
        <h2 class="ln-h2">${esc(cap(t.label))}</h2>
        <p class="ln-panel-def">${esc(t.def)}</p>
        <p class="ln-body">${esc(t.more || '')}</p>
        <div class="ln-panel-acts">
          ${o.dive ? `<button type="button" class="btn-lit ln-panel-go" data-act="dive-done" data-term="${id}">${explored ? 'Explored' : 'Got it, add to my graph'}</button>` : ''}
          <button type="button" class="${o.dive ? 'btn-carved' : 'btn-lit'} ln-panel-go" data-act="ask" data-term="${id}">Ask about this</button>
          ${o.dive ? '' : '<button type="button" class="btn-carved ln-panel-go" data-act="panel-close">Back to the lesson</button>'}
        </div>
      </aside>`;
    panel.hidden = false; panel.dataset.dive = o.dive ? '1' : '';
    if (o.dive && window.App && App.setTabBar) App.setTabBar(false);
    if (still()) panel.classList.add('is-open'); else requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('is-open')));
    if (!o.dive) seeTerm(id);
  }
  function closePanel() {
    if (!panel || panel.hidden) return;
    const wasDive = panel.dataset.dive === '1';
    panel.classList.remove('is-open');
    setTimeout(() => { if (!panel.classList.contains('is-open')) { panel.hidden = true; panel.innerHTML = ''; } }, still() ? 0 : 420);
    if (wasDive && !PL && window.App && App.setTabBar && (!App.current || App.current() === 'learn')) App.setTabBar(true);
  }
  function diveDone(id) {
    const ex = S().explored, key = 'dive:' + id, t = L.terms[id];
    if (!ex.includes(key)) {
      window.Store.set({ explored: ex.concat([key]) });
      window.Bus.emit('explored', { id: key, label: cap(t.label), subject: 'Body', shape: t.shape || 'heart', palette: 'body', from: 'learn' });
      say(`${cap(t.label)} added to your graph`);
    }
    closePanel(); if (!PL) renderHome();
  }
  function askAbout(id) {
    const t = L.terms[id]; if (!t) return;
    closePop(); closePanel();
    window.Bus.emit('ask:open', { question: t.ask || `Tell me more about ${t.label}` });
    if (window.App && App.showTab) App.showTab('ask');
  }

  // ───────── Particle visual ─────────
  function takeVis(scope) {
    const v = scope.querySelector('[data-vis]'), B = brain();
    if (!v || !B) return;
    B.moveTo(v); B.setMode('idle');
    if (!(PL && PL.steps[PL.i] && PL.steps[PL.i].t === 'gift')) { B.setDark(false); }
    B.setShape(v.dataset.shape || 'heart', v.dataset.pal || 'body', 1300);
  }

  // ═════════════════════════ CLICKS ═════════════════════════
  function onClick(e) {
    const t = e.target.closest('[data-act]');
    if (popEl && !e.target.closest('.ln-pop') && !(t && t.dataset.act === 'term')) closePop();
    if (!t || t.disabled) return;
    const act = t.dataset.act, i = +t.dataset.i, sec = t.closest('.ln-block');
    switch (act) {
      case 'open': openStop(t.dataset.id); break;
      case 'switch': openSheet(); break;
      case 'streak': { const n = S().streak; say(`${n}-day streak. Learn tomorrow to make it ${n + 1}`); break; }
      case 'build': if (window.App && App.showOnboarding) App.showOnboarding(0); break;
      case 'widen-open': {
        const list = stops(), fin = list.find((x) => x.kind === 'final');
        if (fin) { startQuiz('final', fin, { at: 'widen' }); PL.finished = true; PL.completed = true; }
        break;
      }
      case 'dive': {
        if (t.classList.contains('is-locked')) { t.classList.remove('is-nope'); void t.offsetWidth; t.classList.add('is-nope'); say('This deeper dive opens after its lesson'); break; }
        openPanel(t.dataset.term, { dive: true }); break;
      }
      case 'dive-done': diveDone(t.dataset.term); break;
      case 'close': closePlayer(); break;
      case 'cta': onCTA(); break;
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
      case 'widen': widenPick(t.dataset.id); break;
    }
  }

  // ═════════════════════════ MOUNT / SHOW / HIDE ═════════════════════════
  // Our own particle form: four chambers (two small atria on top, two big ventricles below)
  function defineShapes() {
    const B = brain(); if (!B || !B.defineIcon || B.has('ln-rooms')) return;
    B.defineIcon('ln-rooms', (x, S) => {
      const k = S / 220, rr = (a, b, w, h, r) => { x.beginPath(); x.roundRect(a * k, b * k, w * k, h * k, [].concat(r).map((v) => v * k)); x.fill(); };
      rr(36, 26, 68, 58, 24); rr(116, 26, 68, 58, 24); rr(36, 94, 68, 98, [12, 12, 34, 40]); rr(116, 94, 68, 98, [12, 12, 40, 34]);
    });
  }

  function mount(el) {
    viewEl = el; defineShapes();
    root = document.createElement('div'); root.className = 'ln-root';
    root.innerHTML = `
      <div class="ln-home" data-home></div>
      <div class="ln-topfade" aria-hidden="true"></div>
      <div class="ln-play" hidden>
        <div class="ln-stage" data-stage></div>
        <header class="ln-pbar">
          <button type="button" class="ln-round" data-act="close" aria-label="Close lesson">${ic('x', 20, 2.4)}</button>
          <div class="ln-psegs" role="progressbar"></div>
          <span class="ln-pcount"></span>
        </header>
        <div class="ln-tagline" aria-live="polite"></div>
        <div class="ln-pfoot"><button type="button" class="btn-lit ln-cta" data-act="cta">Continue</button></div>
        <canvas class="ln-confetti" aria-hidden="true"></canvas>
      </div>
      <div class="ln-panel" hidden></div>`;
    el.appendChild(root);
    home = root.querySelector('[data-home]'); play = root.querySelector('.ln-play'); stage = root.querySelector('[data-stage]');
    bar = root.querySelector('.ln-pbar'); foot = root.querySelector('.ln-pfoot'); cta = root.querySelector('.ln-cta');
    tagline = root.querySelector('.ln-tagline'); panel = root.querySelector('.ln-panel'); confetti = root.querySelector('.ln-confetti');
    root.addEventListener('click', onClick);
    stage.addEventListener('scroll', () => { if (popEl) closePop(); }, { passive: true, capture: true });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || viewEl.hidden) return;
      if (popEl) closePop(); else if (!panel.hidden) closePanel(); else if (sheet) closeSheet(); else if (PL) closePlayer();
    });

    const B = window.Bus;
    B.on('variant:change', ({ key }) => {
      if (key !== 'lesson' || !PL || PL.kind !== 'lesson' || PL.completed) return;
      startLesson(PL.stop, true);
    });
    B.on('store:change', ({ patch }) => {
      if (!shown) return;
      if ('style' in patch) {
        if (PL && PL.kind === 'lesson' && !PL.completed && S().variants.lesson === '3') startLesson(PL.stop, true);
        if (!PL) renderHome();
      } else if (!PL && ('courses' in patch || 'activeCourse' in patch || 'goal' in patch || 'span' in patch)) renderHome();
    });
    B.on('course:created', () => { if (shown && !PL) renderHome(); });
  }

  function show() {
    shown = true;
    const B = brain(); if (B) { B.setSpin(false); B.setDark(false); B.setMode('idle'); }
    if (PL) {
      if (window.App && App.setTabBar) App.setTabBar(false);
      const step = PL.steps && PL.steps[PL.i];
      if (PL.mode === 'cards') layoutStack(); else { const pg = stage.querySelector('.ln-page:not(.is-out)'); if (pg) takeVis(pg); }
      if (step && (step.t === 'gift' || step.t === 'graph')) { const scr = document.getElementById('screen'); if (scr) scr.classList.add('is-dark'); }
    } else renderHome();
    if (!hooksRan) { hooksRan = true; setTimeout(testHooks, 60); }
  }
  function hide() {
    shown = false; closePop(); closeSheet(true);
    if (panel && !panel.hidden && panel.dataset.dive === '1') closePanel();
  }

  // ───────── URL params for demos and screenshots ─────────
  // ?finish=1|gift|graph|widen · ?play=<stopId> · ?review=1 · ?done=N · ?step=N · ?card=N · ?answer=right|wrong · ?pop=<term> · ?panel=<term> · ?sheet=courses · ?dive=<term> · ?empty=1
  function testHooks() {
    if (P.has('empty') || !course()) return;
    const list = stops();
    if (P.has('done')) { const n = Math.min(list.length, +P.get('done') || 0); const c = course(); c.progress = c.progress || {}; list.slice(0, n).forEach((x) => { c.progress[x.id] = 'done'; }); window.Store.set({ courses: S().courses }); renderHome(); }
    if (P.get('sheet') === 'courses') openSheet();
    if (P.get('dive')) openPanel(P.get('dive'), { dive: true });
    const fin = P.get('finish');
    if (fin) {
      const f = list.find((x) => x.kind === 'final');
      if (f) { const at = { gift: 'gift', graph: 'graph', widen: 'widen' }[fin]; startQuiz('final', f, at ? { at } : {}); if (at === 'graph' || at === 'widen') finishCourse(); }
    } else if (P.has('review')) {
      const r = list.find((x) => x.kind === 'review'); if (r) startQuiz('review', r);
    } else if (P.get('play')) {
      const s = list.find((x) => x.id === P.get('play')) || list[0]; if (s.kind === 'lesson') startLesson(s); else openStop(s.id, { force: true });
    }
    if (!PL) return;
    if (PL.mode === 'cards' && P.has('card')) { const n = +P.get('card') || 0; for (let k = 0; k < n && PL.ci < PL.cards.length - 1; k++) { PL.gate = true; PL.ci++; } layoutStack(); renderBar(); renderCTA(); }
    if (PL.mode !== 'cards' && P.has('step')) { const n = Math.min(PL.steps.length - 1, +P.get('step') || 0); if (n) showStep(n, 'none'); }
    const a = P.get('answer');
    if (a) {
      const scope = PL.mode === 'cards' ? stage.querySelector('.ln-card.is-top') : stage.querySelector('.ln-page:not(.is-out)');
      const box = scope && scope.querySelector('[data-quiz]');
      if (box) { const q = PL.q[box.dataset.quiz]; const k = a === 'right' ? q.answer : (q.answer + 1) % q.options.length; const b = box.querySelector(`[data-i="${k}"]`); if (b) answer(b); }
    }
    if (P.get('block')) { const sec = stage.querySelector('.ln-page:not(.is-out) .ln-block'); const k = +P.get('block'); if (sec) { const t = sec.dataset.type; if (t === 'scale') setScale(sec, k); if (t === 'cmp' || t === 'compare') setCompare(sec, k); if (t === 'rooms') setRoom(sec, k); if (t === 'steps') setStp(sec, k); } }
    const pt = P.get('pop') || P.get('panel');
    if (pt) { const b = stage.querySelector(`.ln-page:not(.is-out) [data-term="${pt}"], .ln-card.is-top [data-term="${pt}"]`); if (b) { if (P.get('panel')) openPanel(pt); else setTimeout(() => openPop(b), 80); } }
  }

  window.Learn = { mount, show, hide };
})();
