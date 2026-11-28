// Profile: your knowledge graph, your learning shape (archetype), your collectibles and your courses.
// API: window.Profile = { mount(viewEl), show(), hide() }. See CONTRACT.md.
//
// The graph is one world layout (subject clusters around the course you're on) seen through a camera.
// Free: the course's cluster is crisp, everything else sits under a fog, plus "See your whole graph".
// Plus: the fog lifts, the camera fits the whole graph, drag to pan, pinch or ⌘-scroll to zoom, tap a node.
// It grows live: `explored` events pop new nodes in; the 5th idea reveals your archetype.
(function () {
  'use strict';

  // ---------- Tokens ----------
  const FAM = {
    body: { name: 'Body', mid: '#D84A72', deep: '#A3264F', shape: 'heart' },
    mind: { name: 'Mind', mid: '#7457E0', deep: '#4A30B0', shape: 'brain' },
    space: { name: 'Space', mid: '#56619A', deep: '#2F3766', shape: 'ring' },
    tech: { name: 'Tech', mid: '#2A8FC4', deep: '#165F87', shape: 'grid' },
    nature: { name: 'Nature', mid: '#3F9E52', deep: '#22692F', shape: 'burst' },
    society: { name: 'Society', mid: '#7E9A2A', deep: '#526612', shape: 'split' },
    history: { name: 'History', mid: '#C8922A', deep: '#7E5408', shape: 'steps' },
    arts: { name: 'Arts', mid: '#B04AA8', deep: '#7E2777', shape: 'curve' },
  };
  // Where each subject's cluster sits around the centre cluster (degrees, screen space: 0 = right, 90 = down)
  const ANG = { mind: -38, tech: 12, society: 58, arts: 104, nature: 148, history: 196, space: -128, body: -84 };
  const PAL2SUBJ = { body: 'body', mind: 'mind', space: 'space', tech: 'tech', society: 'society', arts: 'arts', nature: 'nature', history: 'history', cobalt: 'mind' };
  const SIZE = { hub: 64, idea: 46, lesson: 46, ghost: 26 };
  const AHEAD = 3; // how many upcoming lessons show as faint ghosts
  const REVEAL_AT = 5;

  // Archetypes: breadth ↔ depth (graph shape) × guided ↔ self-directed (style + behaviour)
  const ARCH = {
    wanderer: { name: 'The Wanderer', short: 'Wanderer', line: 'You roam across subjects and follow your own questions wherever they lead.', grad: ['#FFB547', '#E0662E'], wide: true, self: true },
    diver: { name: 'The Diver', short: 'Diver', line: 'You pick one thing and keep going down, asking your own questions on the way.', grad: ['#9C88FF', '#4A30B0'], wide: false, self: true },
    voyager: { name: 'The Voyager', short: 'Voyager', line: 'You cover a lot of ground, and you like a clear route through each place.', grad: ['#5FD0F2', '#1A6FD0'], wide: true, self: false },
    builder: { name: 'The Builder', short: 'Builder', line: 'You go deep, one solid step at a time, and like a plan to build on.', grad: ['#4FD1A5', '#0F8F6A'], wide: false, self: false },
  };
  const STYLE = {
    quick: { name: 'Quick bites', y: 0.3, wide: true, self: true },
    connect: { name: 'Connect the dots', y: 0.72, wide: false, self: true },
    roadmap: { name: 'Full roadmap', y: -0.72, wide: false, self: false },
  };

  const SEED = {
    base: [
      { id: 'pf-race', label: 'Why does my heart race when I’m nervous?', subj: 'body', shape: 'spike', ago: 1 },
      { id: 'pf-dream', label: 'Why do we dream?', subj: 'mind', shape: 'wave', ago: 9 },
      { id: 'pf-song', label: 'Why do songs get stuck in your head?', subj: 'mind', shape: 'curve', ago: 4, links: ['pf-dream'] },
      { id: 'pf-blackhole', label: 'How do black holes bend light?', subj: 'space', shape: 'ring', ago: 12 },
    ],
    revealed: [
      { id: 'pf-forget', label: 'Why do we forget things?', subj: 'mind', shape: 'scatter', ago: 3, links: ['pf-dream'] },
      { id: 'pf-dark', label: 'What is dark matter?', subj: 'space', shape: 'burst', ago: 2, links: ['pf-blackhole'] },
      { id: 'pf-purr', label: 'Why do cats purr?', subj: 'nature', shape: 'wave', ago: 5 },
      { id: 'pf-trees', label: 'How do trees share food?', subj: 'nature', shape: 'split', ago: 4, links: ['pf-purr'] },
      { id: 'pf-octo', label: 'Why does an octopus have three hearts?', subj: 'nature', shape: 'heart', ago: 0, links: ['pf-race'] },
      { id: 'pf-stress', label: 'What does stress do to your body?', subj: 'body', shape: 'bars', ago: 6, links: ['pf-race', 'pf-forget'] },
    ],
  };

  // ---------- Helpers ----------
  const P = new URLSearchParams(location.search);
  const ARCH_MODE = P.get('arch') === 'revealed' ? 'revealed' : 'forming';
  const docEl = document.documentElement;
  const reducedMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const instant = () => docEl.classList.contains('still') || reducedMQ.matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const glide = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const back = (t) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mixc = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = (c) => `rgb(${c.join(',')})`;
  const S = () => (window.Store ? Store.get() : {});
  const isPlus = () => !!(window.Store && Store.isPlus());
  const say = (m) => window.toast && window.toast(m);
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, cls) => { const e = document.createElementNS(SVGNS, tag); if (cls) e.setAttribute('class', cls); return e; };
  const when = (ago) => (ago == null || ago <= 0 ? 'today' : ago === 1 ? 'yesterday' : `${ago} days ago`);
  const plural = (n, a, b) => `${n} ${n === 1 ? a : b || a + 's'}`;

  const ICON = {
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10V7.5a5 5 0 0 1 10 0V10h.5A2.5 2.5 0 0 1 20 12.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-7A2.5 2.5 0 0 1 6.5 10zm2.4 0h5.2V7.5a2.6 2.6 0 0 0-5.2 0z"/></svg>',
    x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    fit: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>',
    replay: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    flame: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="pfFlame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB547"/><stop offset="1" stop-color="#E0462E"/></linearGradient></defs><path fill="url(#pfFlame)" d="M12.6 1.8c.4 3-1 4.8-2.6 6.6-1.5 1.7-3.2 3.5-3.2 6.5A5.2 5.2 0 0 0 12 20.2a5.2 5.2 0 0 0 5.2-5.3c0-2.2-1-3.7-1.9-4.9-.2 1.3-.8 2.3-1.8 2.8.5-3.9-.3-8-.9-11z"/><path fill="#fff" opacity=".85" d="M12 20.2a2.7 2.7 0 0 1-2.7-2.8c0-1.7 1.4-2.7 2.3-4 .4 1.4 1.6 1.9 2.4 3a2.7 2.7 0 0 1-2 3.8z"/></svg>',
  };

  // Static dot-glyph of a particle shape, coloured by subject. dark: light dots for a solid hub.
  const glyphCache = {};
  function glyph(shape, subj, n, dark) {
    const key = [shape, subj, n, dark ? 1 : 0].join('|');
    if (glyphCache[key]) return glyphCache[key];
    const f = FAM[subj] || FAM.mind;
    const a = dark ? mixc(hex(f.mid), [255, 255, 255], 0.55) : mixc(hex(f.mid), [255, 255, 255], 0.38);
    const b = dark ? [255, 255, 255] : hex(f.deep);
    let pts = [];
    try { if (window.Brain && Brain.sample) pts = Brain.sample(shape || 'brain', n || 70); } catch (e) { pts = []; }
    let s = '<svg viewBox="-1.14 -1.14 2.28 2.28" aria-hidden="true" focusable="false">';
    for (const [x, y, z] of pts) {
      s += `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${((dark ? 0.04 : 0.034) + 0.036 * z).toFixed(3)}" fill="${rgb(mixc(a, b, z))}" opacity="${(0.42 + 0.58 * z).toFixed(2)}"/>`;
    }
    return (glyphCache[key] = s + '</svg>');
  }
  // A collectible's particle art. mode: 'glow' (on a dark tile) | 'locked' (grey silhouette)
  function artSVG(shape, pal, n, mode) {
    let pts = [];
    try { if (window.Brain && Brain.sample) pts = Brain.sample(shape || 'heart', n); } catch (e) { pts = []; }
    const B = window.Brain && Brain.palette ? Brain.palette(pal || 'body') : [[245, 155, 179], [163, 38, 79]];
    const lo = mode === 'locked' ? [196, 192, 200] : mixc(B[1], B[0], 0.55);
    const hi = mode === 'locked' ? [150, 146, 156] : mixc(B[0], [255, 255, 255], 0.55);
    let s = '<svg viewBox="-1.12 -1.12 2.24 2.24" aria-hidden="true" focusable="false">';
    for (const [x, y, z] of pts) {
      s += `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${(0.022 + 0.03 * z).toFixed(3)}" fill="${rgb(mixc(lo, hi, z))}" opacity="${(mode === 'locked' ? 0.35 + 0.5 * z : 0.4 + 0.6 * z).toFixed(2)}"/>`;
    }
    return s + '</svg>';
  }

  // ---------- Archetype emblems (particle shapes) ----------
  let emblemsDone = false;
  function defineEmblems() {
    if (emblemsDone || !window.Brain || !Brain.defineIcon) return;
    emblemsDone = true;
    Brain.defineIcon('pf-wanderer', (x, s) => { // a compass: ring + four-point star
      const c = s / 2; x.lineWidth = s * 0.07;
      x.beginPath(); x.arc(c, c, s * 0.42, 0, Math.PI * 2); x.stroke();
      x.beginPath();
      const R = s * 0.33, r = s * 0.075;
      for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + k * Math.PI / 4, rr = k % 2 ? r : R; x.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr); }
      x.closePath(); x.fill();
    }, { grad: ARCH.wanderer.grad, scale: 0.96 });
    Brain.defineIcon('pf-voyager', (x, s) => { // a globe: ring, meridian, two latitudes
      const c = s / 2, R = s * 0.42; x.lineWidth = s * 0.065;
      x.beginPath(); x.arc(c, c, R, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.ellipse(c, c, R * 0.45, R, 0, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.moveTo(c - R, c); x.lineTo(c + R, c); x.stroke();
      [-0.5, 0.5].forEach((k) => { const y = c + R * k, w = Math.sqrt(1 - k * k) * R; x.beginPath(); x.moveTo(c - w, y); x.lineTo(c + w, y); x.stroke(); });
    }, { grad: ARCH.voyager.grad, scale: 0.96 });
    Brain.defineIcon('pf-diver', (x, s) => { // waves on top, a long arrow diving down
      x.lineWidth = s * 0.06;
      [0.2, 0.33].forEach((yy) => { x.beginPath(); for (let k = 0; k <= 40; k++) { const t = k / 40, px = s * (0.14 + 0.72 * t), py = s * yy + Math.sin(t * Math.PI * 3) * s * 0.03; if (k) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); });
      x.lineWidth = s * 0.08;
      x.beginPath(); x.moveTo(s / 2, s * 0.42); x.lineTo(s / 2, s * 0.8); x.stroke();
      x.beginPath(); x.moveTo(s * 0.33, s * 0.7); x.lineTo(s / 2, s * 0.88); x.lineTo(s * 0.67, s * 0.7); x.stroke();
    }, { grad: ARCH.diver.grad, scale: 0.96 });
    Brain.defineIcon('pf-builder', (x, s) => { // bricks stacked 3-2-1
      const bw = s * 0.25, bh = s * 0.16, g = s * 0.035;
      [[3, 0.78], [2, 0.59], [1, 0.4]].forEach(([n, y]) => {
        const total = n * bw + (n - 1) * g, x0 = (s - total) / 2;
        for (let k = 0; k < n; k++) { x.beginPath(); x.roundRect ? x.roundRect(x0 + k * (bw + g), s * y - bh, bw, bh, s * 0.02) : x.rect(x0 + k * (bw + g), s * y - bh, bw, bh); x.fill(); }
      });
      x.beginPath(); x.arc(s / 2, s * 0.14, s * 0.05, 0, Math.PI * 2); x.fill();
    }, { grad: ARCH.builder.grad, scale: 0.96 });
  }

  // ---------- Graph model ----------
  const nodes = new Map(); // id -> node
  const edges = new Map(); // 'a|b' -> edge
  const meta = {}; // explored event payloads by id
  const heard = []; // explored before Profile was first opened: they pop in on first show
  const pending = []; // ids that grew while Profile was hidden
  let built = false;

  function subjOf(d) {
    const raw = String(d.subject || d.subj || '').toLowerCase().trim();
    if (FAM[raw]) return raw;
    for (const k in FAM) if (raw && (raw.includes(k) || raw.includes(FAM[k].name.toLowerCase()))) return k;
    return PAL2SUBJ[d.palette] || 'mind';
  }
  function hubId(subj) { return 'H:' + subj; }
  function ensureHub(subj) {
    const id = hubId(subj);
    if (!nodes.has(id)) addNode({ id, kind: 'hub', subj, label: FAM[subj].name, shape: FAM[subj].shape });
    return nodes.get(id);
  }
  function addNode(o) {
    const n = Object.assign({ links: [], x: 0, y: 0, tx: 0, ty: 0, ph: Math.random() * 6.283, born: 0, ord: 0 }, o);
    n.ord = [...nodes.values()].filter((m) => m.subj === n.subj && m.kind !== 'hub').length;
    nodes.set(n.id, n);
    if (n.kind !== 'hub') ensureHub(n.subj);
    return n;
  }
  function link(a, b, kind) {
    if (!a || !b || a === b || !nodes.has(a) || !nodes.has(b)) return;
    const k = a < b ? a + '|' + b : b + '|' + a;
    if (edges.has(k)) return;
    const A = nodes.get(a), B = nodes.get(b);
    edges.set(k, { k, a, b, kind: kind || (A.subj !== B.subj ? 'cross' : 'in'), born: 0 });
  }
  const isIdea = (n) => n.kind === 'idea' || n.kind === 'lesson';
  const extraDone = new Set(); // lessons heard as done before their node exists

  // Is this id one of the course's lessons (even one we haven't drawn yet)?
  function courseLesson(id) {
    const s = String(id);
    for (const c of S().courses || []) {
      const C = window.COURSES && COURSES[c.id];
      if (!C) continue;
      for (const l of C.lessons) if (l.kind === 'lesson' && [l.id, 'L:' + l.id, c.id + ':' + l.id, c.id + '-' + l.id, c.id + '/' + l.id, c.id + '_' + l.id].includes(s)) return l.id;
    }
    return null;
  }

  // Which lesson does an explored id refer to? Accepts 'pump', 'heart:pump', 'heart-pump', 'L:pump'.
  function lessonMatch(id) {
    const s = String(id);
    for (const n of nodes.values()) {
      if (!n.lessonId) continue;
      const L = n.lessonId, C = n.courseId;
      if (s === L || s === 'L:' + L || s === C + ':' + L || s === C + '-' + L || s === C + '/' + L || s === C + '_' + L) return n;
    }
    return null;
  }

  // Courses become a chain of lessons in their subject: done = solid, ahead = faint ghosts.
  function syncCourses(animate) {
    const st = S();
    (st.courses || []).forEach((c) => {
      const C = window.COURSES && COURSES[c.id];
      if (!C) return;
      const subj = subjOf({ subject: C.subject, palette: C.palette });
      const hub = ensureHub(subj);
      hub.course = c.id; hub.courseTitle = C.title;
      let list = [];
      try { list = (window.courseRoadmap ? courseRoadmap(C, st.goal, st.span) : C.lessons).filter((l) => l.kind === 'lesson'); } catch (e) { list = C.lessons.filter((l) => l.kind === 'lesson'); }
      let prev = hub.id, ahead = 0;
      list.forEach((l, i) => {
        const id = 'L:' + l.id;
        const done = (c.progress && c.progress[l.id] === 'done') || extraDone.has(l.id);
        if (!done && !nodes.has(id) && ahead >= AHEAD) return; // only the next few stops show as ghosts
        if (!done) ahead++;
        if (!nodes.has(id)) addNode({ id, kind: 'ghost', subj, label: l.title, shape: l.shape || FAM[subj].shape, lessonId: l.id, courseId: c.id, step: i + 1, steps: list.length, courseTitle: C.title });
        link(prev, id, 'chain'); prev = id;
        if (done) markLesson(nodes.get(id), 0, animate);
      });
    });
  }
  function markLesson(n, ago, animate) {
    if (!n || n.kind !== 'ghost') return;
    n.kind = 'lesson'; n.ago = ago == null ? 0 : ago;
    if (animate) n.born = performance.now();
    if (n.el) n.el.classList.remove('is-ghost');
  }

  function addIdea(d, animate) {
    const id = String(d.id);
    let L = lessonMatch(id);
    if (!L) { const lid = courseLesson(id); if (lid) { extraDone.add(lid); syncCourses(false); L = nodes.get('L:' + lid); if (L && L.kind === 'lesson' && animate) { L.born = performance.now(); return L; } } }
    if (L) { const wasGhost = L.kind === 'ghost'; markLesson(L, 0, animate); return wasGhost ? L : null; }
    if (nodes.has(id)) return null;
    const subj = subjOf(d);
    const hub = ensureHub(subj);
    const parentId = d.parent != null && nodes.has(String(d.parent)) ? String(d.parent) : d.from != null && nodes.has(String(d.from)) ? String(d.from) : null;
    const n = addNode({ id, kind: 'idea', subj, label: d.label || 'Something you explored', shape: d.shape || FAM[subj].shape, ago: d.ago == null ? 0 : d.ago, src: d.src || (d.from === 'learn' ? 'learn' : 'ask') });
    // start where it grows out of
    const from = nodes.get(parentId) || hub;
    n.x = n.tx = from.x; n.y = n.ty = from.y;
    if (animate) n.born = performance.now();
    link(hub.id, id);
    if (parentId) link(parentId, id);
    (d.links || []).forEach((l) => link(l, id));
    return n;
  }

  function buildModel() {
    if (built) { syncCourses(true); syncStoreExplored(true); return; }
    built = true;
    syncCourses(false);
    // Demo history: things you asked before today. Lessons only count when the course says they're done.
    // ?arch=forming (default) has 4 explored ideas; ?arch=revealed has 10.
    const seed = ARCH_MODE === 'revealed' ? SEED.base.concat(SEED.revealed) : SEED.base;
    seed.forEach((d) => addIdea(Object.assign({ src: 'ask' }, d), false));
    syncStoreExplored(false);
    heard.splice(0).forEach((d) => { const n = addIdea(d, false); if (n) pending.push(n.id); });
    layout(true);
  }
  function syncStoreExplored(animate) {
    const ids = S().explored || [];
    let grew = [];
    ids.forEach((id) => {
      const m = meta[id];
      if (m) { const n = addIdea(m, animate); if (n) grew.push(n); }
      else { const L = lessonMatch(id); if (L && L.kind === 'ghost') { markLesson(L, 0, animate); grew.push(L); } }
    });
    return grew;
  }

  // ---------- Layout: clusters around the course's subject, then a short relaxation ----------
  let focusSubj = 'body';
  function layout(snap) {
    const list = [...nodes.values()];
    const subs = [...new Set(list.map((n) => n.subj))];
    const count = (s) => list.filter((n) => n.subj === s && n.kind !== 'hub').length;
    const courseHub = list.find((n) => n.kind === 'hub' && n.course);
    focusSubj = courseHub ? courseHub.subj : subs.slice().sort((a, b) => count(b) - count(a))[0] || 'body';
    const rc = (s) => 36 + 17 * Math.sqrt(count(s) + 1);
    // the other clusters share the circle evenly, in a stable order, starting at the upper right
    const centre = { [focusSubj]: [0, 0] };
    const others = subs.filter((s) => s !== focusSubj).sort((a, b) => ANG[a] - ANG[b]);
    const step = 360 / Math.max(others.length, 1), start = others.length === 2 ? -52 : others.length === 1 ? -60 : -56;
    others.forEach((s, i) => {
      const a = ((start + i * step) * Math.PI) / 180, d = rc(focusSubj) + rc(s) + 46;
      centre[s] = [Math.cos(a) * d, Math.sin(a) * d];
    });
    // start positions: hub on its centre, members on a sunflower
    const pos = new Map();
    list.forEach((n) => {
      const c = centre[n.subj];
      if (n.kind === 'hub') { pos.set(n.id, [c[0], c[1]]); return; }
      const i = n.ord + 1, r = 40 + 19 * Math.sqrt(i), a = i * 2.39996 + (ANG[n.subj] || 0) * 0.02 + 0.7;
      pos.set(n.id, [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
    });
    const rad = (n) => SIZE[n.kind] / 2;
    const E = [...edges.values()];
    for (let it = 0; it < 220; it++) {
      const cool = 1 - it / 260;
      // springs
      E.forEach((e) => {
        const A = nodes.get(e.a), B = nodes.get(e.b);
        if (e.kind === 'cross') return;
        const pa = pos.get(e.a), pb = pos.get(e.b);
        const dx = pb[0] - pa[0], dy = pb[1] - pa[1], d = Math.hypot(dx, dy) || 1;
        const rest = rad(A) + rad(B) + (e.kind === 'chain' ? 14 : 30);
        const f = ((d - rest) / d) * 0.06 * cool;
        if (A.kind !== 'hub') { pa[0] += dx * f; pa[1] += dy * f; }
        if (B.kind !== 'hub') { pb[0] -= dx * f; pb[1] -= dy * f; }
      });
      // repulsion
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const A = list[i], B = list[j], pa = pos.get(A.id), pb = pos.get(B.id);
        const same = A.subj === B.subj;
        const min = rad(A) + rad(B) + (same ? (A.kind === 'ghost' || B.kind === 'ghost' ? 12 : 26) : 46);
        let dx = pb[0] - pa[0], dy = pb[1] - pa[1], d = Math.hypot(dx, dy);
        if (d < 0.01) { dx = 0.5; dy = 0.3; d = 0.58; }
        if (d < min) {
          const push = ((min - d) / d) * 0.5;
          const wa = A.kind === 'hub' ? 0 : B.kind === 'hub' ? 1 : 0.5, wb = 1 - wa;
          pa[0] -= dx * push * wa; pa[1] -= dy * push * wa; pb[0] += dx * push * wb; pb[1] += dy * push * wb;
        }
      }
      // gravity to the cluster centre; keep the space under each hub free for its label
      list.forEach((n) => {
        if (n.kind === 'hub') return;
        const p = pos.get(n.id), c = centre[n.subj];
        p[0] += (c[0] - p[0]) * 0.012; p[1] += (c[1] - p[1]) * 0.012;
        const lx = c[0], ly = c[1] + SIZE.hub / 2 + 12, dx = p[0] - lx, dy = p[1] - ly, d = Math.hypot(dx, dy) || 0.01, min = rad(n) + 22;
        if (d < min) { p[0] += (dx / d) * (min - d) * 0.5; p[1] += (dy / d) * (min - d) * 0.5; }
      });
    }
    list.forEach((n) => {
      const p = pos.get(n.id);
      n.tx = p[0]; n.ty = p[1];
      if (snap && !n.born) { n.x = n.tx; n.y = n.ty; }
    });
    computeFit();
  }

  // ---------- Archetype ----------
  function shape() {
    const ideas = [...nodes.values()].filter(isIdea);
    const n = ideas.length, counts = {};
    ideas.forEach((d) => { counts[d.subj] = (counts[d.subj] || 0) + 1; });
    const subs = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    let H = 0; subs.forEach((s) => { const p = counts[s] / n; H -= p * Math.log(p); });
    const w = n > 1 ? H / Math.log(Math.min(8, n)) : 0.5;
    const x = clamp((w - 0.5) / 0.38, -1, 1); // +1 = wide
    const asked = ideas.filter((d) => d.kind === 'idea').length;
    const st = STYLE[S().style] || STYLE.quick;
    const y = clamp(0.68 * st.y + 0.32 * ((n ? asked / n : 0.5) * 2 - 1), -1, 1); // +1 = self-directed
    const key = x >= 0 ? (y >= 0 ? 'wanderer' : 'voyager') : (y >= 0 ? 'diver' : 'builder');
    return { n, counts, subs, x, y, key, asked, style: S().style };
  }
  function compareLine(sh) {
    const st = STYLE[sh.style];
    if (!st) return null;
    const A = ARCH[sh.key];
    const k = sh.subs.length, top = FAM[sh.subs[0]] ? FAM[sh.subs[0]].name : '';
    if (st.wide !== A.wide) {
      return { said: st.name, says: A.wide ? 'Roaming wide' : 'Digging deep', note: A.wide ? `${plural(k, 'subject')}, a few ideas in each. You’ve been roaming more than digging.` : `Most of your ideas sit in ${top}. You’ve been digging more than roaming.`, agree: false };
    }
    if (st.self !== A.self) {
      return { said: st.name, says: A.self ? 'Your own questions' : 'The course path', note: A.self ? 'Most of what you explore starts with a question of your own.' : 'Most of what you explore comes from your course.', agree: false };
    }
    return { said: st.name, says: A.wide ? 'Roaming wide' : 'Digging deep', note: 'Your graph matches the style you picked.', agree: true };
  }

  // ---------- DOM ----------
  let view, root, scroller, stage, layFog, layMain, edgFog, edgMain, veil, unlockBtn, fitBtn, nodeCard, newCap, titleSub, legend;
  let archEl, charHolder, charIn, shelfEl, coursesEl, statsEl, streakEl, viewer;
  let visible = false, selected = null, plusShown = null, liftTimer = 0;
  let W = 344, H = 420;
  const gradDefs = {};

  function mount(viewEl) {
    if (root) return;
    view = viewEl;
    root = document.createElement('div');
    root.className = 'pf';
    root.innerHTML = `
      <div class="pf-scroll" data-scroll>
        <header class="pf-head">
          <div class="pf-avatar" aria-hidden="true">S</div>
          <div class="pf-who"><h1 class="pf-name">Sam</h1><p class="pf-since">Since November</p></div>
          <div class="pf-streak" data-streak></div>
        </header>
        <div class="pf-stats" data-stats></div>
        <section class="pf-gcard" aria-label="Your knowledge graph">
          <div class="pf-gtitle"><h2>Your knowledge graph</h2><p data-gsub></p></div>
          <button class="pf-fit" data-fit aria-label="Show the whole graph" hidden>${ICON.fit}</button>
          <div class="pf-stage" data-stage>
            <svg class="pf-edges pf-fogged" data-efog aria-hidden="true"></svg>
            <div class="pf-layer pf-fogged" data-lfog></div>
            <div class="pf-veil" data-veil aria-hidden="true"></div>
            <svg class="pf-edges" data-emain aria-hidden="true"><defs data-defs></defs></svg>
            <div class="pf-layer" data-lmain></div>
          </div>
          <p class="pf-newcap" data-newcap role="status" aria-live="polite"></p>
          <button class="pf-unlock" data-unlock>${ICON.lock}<span>See your whole graph</span></button>
          <div class="pf-ncard" data-ncard hidden></div>
        </section>
        <div class="pf-legend" data-legend></div>
        <section class="pf-arch" data-arch aria-label="Your learning shape"></section>
        <section class="pf-sec">
          <h2 class="pf-h2">Collectibles</h2>
          <div data-shelf></div>
        </section>
        <section class="pf-sec">
          <h2 class="pf-h2">Your courses</h2>
          <div class="pf-courses" data-courses></div>
        </section>
      </div>
      <div class="pf-topfade" aria-hidden="true"></div>`;
    view.appendChild(root);
    const q = (s) => root.querySelector(s);
    scroller = q('[data-scroll]'); stage = q('[data-stage]');
    layFog = q('[data-lfog]'); layMain = q('[data-lmain]'); edgFog = q('[data-efog]'); edgMain = q('[data-emain]');
    veil = q('[data-veil]'); unlockBtn = q('[data-unlock]'); fitBtn = q('[data-fit]'); nodeCard = q('[data-ncard]');
    newCap = q('[data-newcap]'); titleSub = q('[data-gsub]'); legend = q('[data-legend]');
    archEl = q('[data-arch]'); shelfEl = q('[data-shelf]'); coursesEl = q('[data-courses]'); statsEl = q('[data-stats]'); streakEl = q('[data-streak]');

    unlockBtn.addEventListener('click', () => { if (window.App) App.paywall('graph'); });
    fitBtn.addEventListener('click', () => { camT = { ...fit }; momentum = null; kick(); });
    bindStage();
    bindBus();
  }

  function bindBus() {
    if (!window.Bus) return;
    Bus.on('explored', (d) => {
      if (!d || d.id == null) return;
      meta[d.id] = d;
      if (!built) { heard.push(d); return; }
      const n = addIdea(d, true);
      if (!n) return;
      layout(false);
      if (visible) grewNow([n]); else pending.push(n.id);
    });
    Bus.on('lesson:done', (d) => {
      if (!d || !built) return;
      extraDone.add(d.lessonId);
      let n = nodes.get('L:' + d.lessonId);
      if (!n) { syncCourses(false); n = nodes.get('L:' + d.lessonId); if (n) n.kind = 'ghost'; }
      if (n && n.kind === 'ghost') { markLesson(n, 0, true); syncCourses(false); layout(false); if (visible) grewNow([n]); else pending.push(n.id); }
    });
    Bus.on('course:finished', () => { if (visible) { renderShelf(true); renderStats(); } });
    Bus.on('store:change', ({ patch } = {}) => {
      if (!patch || !root) return;
      if ('plan' in patch && visible) applyPlan(true);
      if ('style' in patch && visible) renderArch();
      if ('courses' in patch || 'explored' in patch) {
        if (!built) return;
        const before = nodes.size;
        syncCourses(true);
        const grew = syncStoreExplored(true);
        if (nodes.size !== before || grew.length) layout(false);
        if (visible) { if (grew.length) grewNow(grew); renderCourses(); renderStats(); } else grew.forEach((n) => pending.push(n.id));
      }
      if ('collectibles' in patch && visible) { renderShelf(true); renderStats(); }
      if ('streak' in patch && visible) renderHead();
    });
    Bus.on('paywall:close', ({ reason, upgraded } = {}) => { if (reason === 'graph' && upgraded && visible) applyPlan(true); });
  }

  // ---------- Show / hide ----------
  let revealSeen = false;
  function show() {
    if (!root) return;
    visible = true;
    defineEmblems();
    buildModel();
    measure();
    renderHead(); renderStats(); renderCourses(); renderShelf(false);
    applyPlan(false);
    renderLegend();
    renderArch();
    if (window.Brain) { Brain.moveTo(charIn); Brain.setDark(false); Brain.setSpin(false); Brain.setLobes(0); }
    setCharShape(false);
    // anything explored while we were away pops in now (and if it crossed 5 ideas, the reveal plays after)
    const crossed = pending.length && archState === 'revealed' && shape().n - pending.filter((id) => nodes.has(id) && isIdea(nodes.get(id))).length < REVEAL_AT;
    if (crossed) setTimeout(() => {
      if (!visible) return;
      scroller.scrollTo({ top: Math.max(0, archEl.offsetTop - 64), behavior: instant() ? 'auto' : 'smooth' });
      setTimeout(playReveal, instant() ? 0 : 650);
    }, instant() ? 0 : 2100);
    if (pending.length) {
      const list = pending.splice(0).map((id) => nodes.get(id)).filter(Boolean);
      const t0 = performance.now() + 420;
      list.forEach((n, i) => { n.born = t0 + i * 160; const h = nodes.get(hubId(n.subj)); if (h && n.kind === 'idea') { n.x = h.x; n.y = h.y; } });
      if (list.length) setTimeout(() => caption(list[list.length - 1]), 420);
    }
    snapAll();
    kick();
    // ?arch=revealed plays the reveal once when you first land here
    if (ARCH_MODE === 'revealed' && !revealSeen && shape().n >= REVEAL_AT) { revealSeen = true; playReveal(); }
  }
  function hide() {
    visible = false;
    closeViewer(true);
    stopLoop();
    if (window.Brain) Brain.setMode('idle');
  }
  function measure() {
    const r = stage.getBoundingClientRect(), k = (window.PS || 1);
    W = r.width / k || 344; H = r.height / k || 420;
    if (W < 50) { W = 344; H = 420; }
    computeFit();
  }

  // ---------- Header, stats ----------
  function renderHead() {
    const s = S().streak || 1;
    streakEl.innerHTML = `${ICON.flame}<span><b>${s}</b> day streak</span>`;
    streakEl.setAttribute('aria-label', `${s} day streak`);
  }
  function renderStats() {
    const ideas = [...nodes.values()].filter(isIdea).length;
    const c = (S().courses || []).length, col = (S().collectibles || []).length;
    statsEl.innerHTML = [[ideas, ideas === 1 ? 'Idea explored' : 'Ideas explored'], [c, c === 1 ? 'Course' : 'Courses'], [col, col === 1 ? 'Collectible' : 'Collectibles']]
      .map(([n, l]) => `<div class="pf-stat"><b>${n}</b><span>${l}</span></div>`).join('');
    const subs = new Set([...nodes.values()].filter(isIdea).map((n) => n.subj)).size;
    titleSub.textContent = `${plural(ideas, 'idea')} across ${plural(subs, 'subject')}`;
  }

  // ---------- Plan: free preview vs whole graph ----------
  function applyPlan(animated) {
    const plus = isPlus();
    const changed = plusShown !== plus;
    plusShown = plus;
    root.classList.toggle('is-plus', plus);
    root.classList.toggle('is-free', !plus);
    stage.style.touchAction = plus ? 'none' : 'pan-y';
    // move nodes and edges between the fog layer and the crisp layer. Upgrading: the fog lifts first, then they move.
    const sort = () => {
      nodes.forEach((n) => { ensureNodeEl(n); const target = fogged(n) ? layFog : layMain; if (n.el.parentElement !== target) target.appendChild(n.el); });
      edges.forEach((e) => { ensureEdgeEl(e); const target = edgeFogged(e) ? edgFog : edgMain; if (e.el.parentNode !== target) target.appendChild(e.el); });
    };
    if (animated && plus && changed && !instant()) {
      root.classList.add('is-lifting');
      clearTimeout(liftTimer);
      liftTimer = setTimeout(() => { sort(); root.classList.remove('is-lifting'); }, 1150);
    } else { clearTimeout(liftTimer); root.classList.remove('is-lifting'); sort(); }
    if (changed || !animated) {
      if (plus) { camT = { ...fit }; if (!animated) cam = { ...camT }; }
      else { camT = { ...freeCam() }; if (!animated) cam = { ...camT }; }
    }
    closeCard();
    renderLegend();
    fitBtn.hidden = !plus;
    kick();
  }
  const fogged = (n) => !isPlus() && n.subj !== focusSubj;
  const edgeFogged = (e) => fogged(nodes.get(e.a)) || fogged(nodes.get(e.b));

  // ---------- Legend: subject chips (Plus: fly to a cluster; free: the fogged ones open the paywall) ----------
  function renderLegend() {
    const counts = {};
    nodes.forEach((n) => { if (n.kind !== 'hub') counts[n.subj] = counts[n.subj] || 0; if (isIdea(n)) counts[n.subj]++; });
    const subs = Object.keys(counts).sort((a, b) => (a === focusSubj ? -1 : b === focusSubj ? 1 : counts[b] - counts[a]));
    const chip = (s) => `<button class="pf-chip" data-subj="${s}" aria-label="${FAM[s].name}, ${plural(counts[s], 'idea')}" style="--mid:${FAM[s].mid};--deep:${FAM[s].deep}"><i></i>${FAM[s].name}</button>`;
    if (isPlus()) legend.innerHTML = subs.map(chip).join('');
    else {
      // free: your course's subject, plus one locked chip for everything under the fog
      const hidden = subs.filter((s) => s !== focusSubj);
      legend.innerHTML = chip(focusSubj) + (hidden.length ? `<button class="pf-chip is-locked" data-more aria-label="${plural(hidden.length, 'more subject')}, locked">
        <span class="pf-chip-dots">${hidden.slice(0, 4).map((s) => `<i style="--mid:${FAM[s].mid};--deep:${FAM[s].deep}"></i>`).join('')}</span>${plural(hidden.length, 'more subject')}${ICON.lock}</button>` : '');
      const more = legend.querySelector('[data-more]');
      if (more) more.addEventListener('click', () => window.App && App.paywall('graph'));
    }
    legend.querySelectorAll('[data-subj]').forEach((b) => b.addEventListener('click', () => {
      const s = b.dataset.subj;
      flyTo(nodes.get(hubId(s)), 1.05);
      scroller.scrollTo({ top: Math.max(0, stage.closest('.pf-gcard').offsetTop - 70), behavior: instant() ? 'auto' : 'smooth' });
    }));
  }

  // ---------- Node + edge elements ----------
  function ensureNodeEl(n) {
    if (n.el) return n.el;
    const f = FAM[n.subj];
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `pf-node k-${n.kind === 'lesson' ? 'idea' : n.kind}${n.kind === 'ghost' ? ' is-ghost' : ''}`;
    el.dataset.id = n.id;
    el.style.setProperty('--mid', f.mid); el.style.setProperty('--deep', f.deep);
    el.style.width = el.style.height = SIZE[n.kind === 'ghost' || n.kind === 'hub' ? n.kind : 'idea'] + 'px';
    el.style.marginLeft = el.style.marginTop = -SIZE[n.kind === 'ghost' || n.kind === 'hub' ? n.kind : 'idea'] / 2 + 'px';
    const g = n.kind === 'hub' ? glyph(n.shape, n.subj, 90, true) : glyph(n.shape, n.subj, n.kind === 'ghost' ? 40 : 70, false);
    el.innerHTML = `<span class="pf-bub">${g}</span><span class="pf-lab">${n.kind === 'ghost' ? '<em>Up next</em>' : ''}${esc(n.label)}</span>`;
    el.setAttribute('aria-label', n.kind === 'hub' ? `${n.label} cluster` : n.label);
    el.addEventListener('click', (e) => { if (e.detail === 0) tapNode(n); }); // keyboard; pointer taps go through the stage
    n.el = el; n.lab = el.querySelector('.pf-lab');
    (fogged(n) ? layFog : layMain).appendChild(el);
    return el;
  }
  function ensureEdgeEl(e) {
    if (e.el) return e.el;
    const p = svgEl('path', 'pf-edge e-' + e.kind);
    const A = nodes.get(e.a), B = nodes.get(e.b);
    if (e.kind === 'cross') {
      const gid = 'pfg-' + e.k.replace(/[^a-z0-9]/gi, '');
      const lg = svgEl('linearGradient'); lg.setAttribute('id', gid); lg.setAttribute('gradientUnits', 'userSpaceOnUse');
      lg.innerHTML = `<stop offset="0" stop-color="${FAM[A.subj].mid}"/><stop offset="1" stop-color="${FAM[B.subj].mid}"/>`;
      edgMain.querySelector('[data-defs]').appendChild(lg);
      p.setAttribute('stroke', `url(#${gid})`); e.grad = lg;
    } else p.style.stroke = FAM[A.kind === 'hub' ? A.subj : B.subj].mid;
    e.el = p;
    (edgeFogged(e) ? edgFog : edgMain).appendChild(p);
    return p;
  }

  // ---------- Camera ----------
  let cam = { x: 0, y: 0, z: 1 }, camT = { x: 0, y: 0, z: 1 }, fit = { x: 0, y: 0, z: 0.7, zMin: 0.4, zMax: 1.8, x0: -200, x1: 200, y0: -200, y1: 200 };
  const VC = () => ({ x: W / 2, y: isPlus() ? H / 2 + 16 : H / 2 - 2 });
  function computeFit() {
    const list = [...nodes.values()];
    if (!list.length) return;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    list.forEach((n) => { const r = SIZE[n.kind] / 2 + (n.kind === 'ghost' ? 6 : 26); x0 = Math.min(x0, n.tx - r); x1 = Math.max(x1, n.tx + r); y0 = Math.min(y0, n.ty - r); y1 = Math.max(y1, n.ty + r + 14); });
    const z = clamp(Math.min((W - 28) / (x1 - x0), (H - 104) / (y1 - y0)), 0.36, 1.1);
    fit = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z, zMin: z * 0.85, zMax: Math.max(1.5, z * 1.6), x0, x1, y0, y1 };
  }
  function freeCam() {
    const list = [...nodes.values()].filter((n) => n.subj === focusSubj);
    if (!list.length) return { x: 0, y: 0, z: 1 };
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    list.forEach((n) => { x0 = Math.min(x0, n.tx); x1 = Math.max(x1, n.tx); y0 = Math.min(y0, n.ty); y1 = Math.max(y1, n.ty); });
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 + 6, z: 1.08 };
  }
  function flyTo(n, z) { if (!n) return; momentum = null; camT = { x: n.tx, y: n.ty, z: isPlus() ? clamp(z || cam.z, fit.zMin, fit.zMax) : freeCam().z }; if (!isPlus()) camT = freeCam(); kick(); }
  function clampCam(c) {
    c.z = clamp(c.z, fit.zMin, fit.zMax);
    c.x = clamp(c.x, fit.x0 + 20, fit.x1 - 20); c.y = clamp(c.y, fit.y0 + 20, fit.y1 - 20);
    return c;
  }

  // ---------- Loop ----------
  let raf = 0, lastT = 0, gest = null, momentum = null;
  const ptrs = new Map();
  function kick() {
    if (!visible) return;
    if (instant()) { cam = { ...camT }; nodes.forEach((n) => { n.x = n.tx; n.y = n.ty; }); render(performance.now() + 1e6, 0); return; }
    if (!raf) { lastT = 0; raf = requestAnimationFrame(frame); }
  }
  function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function snapAll() { nodes.forEach((n) => { if (!n.born || n.born < performance.now() - 2000) { n.x = n.tx; n.y = n.ty; } }); }
  function frame(now) {
    raf = 0;
    if (!visible) return;
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016; lastT = now;
    stepCamera(dt);
    const k = 1 - Math.exp(-dt * 5.5);
    nodes.forEach((n) => { if (n.born && now < n.born) return; n.x += (n.tx - n.x) * k; n.y += (n.ty - n.y) * k; });
    render(now, dt);
    raf = requestAnimationFrame(frame); // the graph is alive: it always breathes a little while visible
  }
  function stepCamera(dt) {
    if (gest) return;
    if (momentum) {
      cam.x -= momentum.vx * dt * 1000 / cam.z; cam.y -= momentum.vy * dt * 1000 / cam.z;
      const decay = Math.exp(-dt / 0.33); momentum.vx *= decay; momentum.vy *= decay;
      if (Math.hypot(momentum.vx, momentum.vy) < 0.02) { momentum = null; camT = clampCam({ ...cam }); } else { camT = { ...cam }; return; }
    }
    const k = 1 - Math.exp(-dt * 6.5);
    cam.x += (camT.x - cam.x) * k; cam.y += (camT.y - cam.y) * k;
    cam.z = Math.exp(lerp(Math.log(cam.z), Math.log(camT.z), k));
    if (isPlus()) fitBtn.classList.toggle('is-on', Math.abs(camT.z - fit.z) > 0.04 || Math.hypot(camT.x - fit.x, camT.y - fit.y) > 24);
  }

  function render(now, dt) {
    const vc = VC(), t = now / 1000, calm = instant();
    const nextStop = [...nodes.values()].filter((n) => n.kind === 'ghost').sort((a, b) => a.step - b.step)[0];
    nodes.forEach((n) => {
      ensureNodeEl(n);
      const base = SIZE[n.kind];
      // gentle drift: the graph breathes
      const amp = calm ? 0 : n.kind === 'hub' ? 1.2 : 2.6;
      const wx = n.x + Math.sin(t * 0.55 + n.ph) * amp, wy = n.y + Math.cos(t * 0.47 + n.ph * 1.3) * amp;
      let sx = vc.x + (wx - cam.x) * cam.z, sy = vc.y + (wy - cam.y) * cam.z;
      const dist = Math.hypot(sx - vc.x, (sy - vc.y) * 0.85);
      const fish = 1.16 - 0.34 * smooth(50, 230, dist); // near the middle a little larger, like a lens
      let k = cam.z * fish;
      // pop-in
      let pop = 1;
      if (n.born) {
        const p = clamp((now - n.born) / 720);
        pop = p <= 0 ? 0 : back(p);
        if (p >= 1) n.born = 0;
      }
      k *= pop;
      n.sx = sx; n.sy = sy; n.D = base * k;
      n.el.style.transform = `translate3d(${sx.toFixed(2)}px,${sy.toFixed(2)}px,0) scale(${Math.max(k, 0.001).toFixed(4)})`;
      n.el.style.zIndex = n.id === selected ? 400 : n.kind === 'hub' ? 300 : Math.round(n.D) + 10;
      // labels: hubs always; ideas when big enough and near the middle; ghosts only when picked.
      // Whether a wanted label actually shows is decided below, so labels never overlap.
      if (n.kind === 'hub') n.want = n.D > 16 ? 10 : 0;
      else if (n.kind === 'ghost') n.want = n === nextStop ? 0.8 : 0;
      else n.want = n.D >= 29 && dist < 175 ? 1 + n.D / 100 - dist / 1000 : 0;
      // with a node picked, its card carries the words: only hub tags stay
      if (fogged(n) || pop < 0.6 || (selected && n.kind !== 'hub')) n.want = 0;
      n.ls = clamp(cam.z * fish, 0.9, 1.08); // keep text a readable size whatever the zoom
      n.k = k;
      n.lab.style.transform = `translateX(-50%) scale(${(n.ls / Math.max(k, 0.05)).toFixed(4)})`;
      n.el.classList.toggle('is-sel', n.id === selected);
      n.el.classList.toggle('is-dim', !!selected && n.id !== selected && !isNeighbour(n.id, selected));
      n.el.classList.toggle('is-fading', n.kind !== 'ghost' && n.kind !== 'hub' && (n.ago || 0) >= 7);
    });
    placeLabels(dt);
    edges.forEach((e) => {
      ensureEdgeEl(e);
      const A = nodes.get(e.a), B = nodes.get(e.b);
      const d = curve(A, B);
      e.el.setAttribute('d', d);
      const alpha = Math.min(edgeAlpha(A), edgeAlpha(B));
      const hot = selected && (e.a === selected || e.b === selected);
      e.el.style.opacity = (selected ? (hot ? 1 : 0.25) : 1) * alpha;
      e.el.classList.toggle('is-hot', !!hot);
      if (e.grad) { e.grad.setAttribute('x1', A.sx.toFixed(1)); e.grad.setAttribute('y1', A.sy.toFixed(1)); e.grad.setAttribute('x2', B.sx.toFixed(1)); e.grad.setAttribute('y2', B.sy.toFixed(1)); }
      if (e.kind === 'chain') e.el.classList.toggle('is-ahead', A.kind === 'ghost' || B.kind === 'ghost');
      if (e.born) {
        const p = clamp((now - e.born) / 900);
        e.el.setAttribute('pathLength', '1');
        e.el.style.strokeDasharray = '1'; e.el.style.strokeDashoffset = (1 - easeOut(p)).toFixed(3);
        if (p >= 1) { e.born = 0; e.el.removeAttribute('pathLength'); e.el.style.strokeDasharray = ''; e.el.style.strokeDashoffset = ''; }
      }
    });
  }
  // Greedy label placement: most important first; a label shows only if it clears every placed label and every bubble.
  const mctx = document.createElement('canvas').getContext('2d');
  function labelBox(n) {
    if (!n.lw) {
      mctx.font = n.kind === 'hub' ? "600 13px 'Geist', sans-serif" : "600 12px 'Geist', sans-serif";
      const maxW = n.kind === 'hub' ? 90 : 124, words = ((n.kind === 'ghost' ? 'Up next ' : '') + n.label).split(/\s+/);
      let lines = 1, line = '', widest = 0;
      for (const w of words) { const t = line ? line + ' ' + w : w; if (line && mctx.measureText(t).width > maxW) { widest = Math.max(widest, mctx.measureText(line).width); lines++; line = w; } else line = t; }
      widest = Math.max(widest, mctx.measureText(line).width);
      n.lw = Math.min(maxW, widest); n.lh = Math.min(3, lines) * (n.kind === 'hub' ? 16 : 15);
    }
    if (n.kind === 'hub') { const w = (n.lw + 20) * n.ls, top = n.sy + n.D / 2 - 11 * n.ls; return [n.sx - w / 2, top, n.sx + w / 2, top + 24 * n.ls]; }
    const w = n.lw * n.ls, h = n.lh * n.ls, top = n.sy + n.D / 2 + 5 * n.ls;
    return [n.sx - w / 2 - 3, top - 1, n.sx + w / 2 + 3, top + h + 1];
  }
  function placeLabels(dt) {
    const list = [...nodes.values()].filter((n) => n.el);
    const placed = isPlus() ? [] : [[W / 2 - 120, H - 70, W / 2 + 120, H]]; // keep clear of "See your whole graph"
    const hit = (r, q) => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1];
    list.slice().sort((a, b) => b.want - a.want).forEach((n) => {
      let show = false;
      if (n.want > 0) {
        const r = labelBox(n);
        show = r[3] < H - 4 && r[0] > -20 && r[2] < W + 20 && !placed.some((q) => hit(r, q)) &&
          !list.some((m) => m !== n && m.D > 6 && !fogged(m) && hit(r, [m.sx - m.D / 2, m.sy - m.D / 2, m.sx + m.D / 2, m.sy + m.D / 2]));
        if (show || n.want >= 9) { placed.push(r); show = true; }
        else if (n.kind === 'hub') show = true;
      }
      const target = show ? 1 : 0;
      n.la = n.la == null || instant() ? target : n.la + (target - n.la) * (1 - Math.exp(-(dt || 0.016) * 12));
      n.lab.style.opacity = n.la.toFixed(3);
      n.lab.style.visibility = n.la < 0.01 ? 'hidden' : '';
    });
  }
  function edgeAlpha(n) { return n.born ? 0 : n.kind === 'ghost' ? 0.7 : 1; }
  function isNeighbour(a, b) { const k = a < b ? a + '|' + b : b + '|' + a; return edges.has(k); }
  // A soft bow from bubble edge to bubble edge
  function curve(a, b) {
    const dx = b.sx - a.sx, dy = b.sy - a.sy, L = Math.hypot(dx, dy) || 1;
    const ra = a.D / 2 + 3, rb = b.D / 2 + 3;
    if (L < ra + rb + 4) return '';
    const bow = 0.12 * L * (a.id < b.id ? 1 : -1);
    const qx = (a.sx + b.sx) / 2 - (dy / L) * bow, qy = (a.sy + b.sy) / 2 + (dx / L) * bow;
    const to = (n, r) => { const ux = qx - n.sx, uy = qy - n.sy, u = Math.hypot(ux, uy) || 1; return [n.sx + (ux / u) * r, n.sy + (uy / u) * r]; };
    const p0 = to(a, ra), p1 = to(b, rb), f = (v) => v.toFixed(1);
    return `M${f(p0[0])} ${f(p0[1])}Q${f(qx)} ${f(qy)} ${f(p1[0])} ${f(p1[1])}`;
  }

  // ---------- Growth ----------
  function grewNow(list) {
    const now = performance.now();
    list.forEach((n, i) => {
      n.born = now + 120 + i * 160;
      edges.forEach((e) => { if (e.a === n.id || e.b === n.id) e.born = n.born + 200; });
      ensureNodeEl(n);
      n.el.classList.remove('is-ghost');
      const r = document.createElement('span'); r.className = 'pf-ripple'; n.el.appendChild(r); setTimeout(() => r.remove(), 1500);
    });
    // keep the camera honest: Plus fits the new shape; free stays on the course cluster
    camT = isPlus() ? { ...fit } : freeCam();
    applyPlan(true);
    caption(list[list.length - 1]);
    renderStats(); renderLegend();
    const before = archState;
    renderArch();
    if (before === 'forming' && archState === 'revealed') {
      setTimeout(() => {
        if (!visible) return;
        scroller.scrollTo({ top: Math.max(0, archEl.offsetTop - 64), behavior: instant() ? 'auto' : 'smooth' });
        setTimeout(playReveal, instant() ? 0 : 650);
      }, instant() ? 0 : 2100);
    }
    kick();
  }
  let capTimer = 0;
  function caption(n) {
    if (!n) return;
    newCap.innerHTML = `<i style="background:${FAM[n.subj].mid}"></i><span>New in ${FAM[n.subj].name}</span><b>${esc(n.label)}</b>`;
    newCap.classList.remove('is-on'); void newCap.offsetWidth; newCap.classList.add('is-on');
    clearTimeout(capTimer); capTimer = setTimeout(() => newCap.classList.remove('is-on'), 3200);
  }

  // ---------- Tap a node ----------
  function tapNode(n) {
    if (!n) return;
    if (fogged(n)) { if (window.App) App.paywall('graph'); return; }
    if (n.kind === 'hub') { closeCard(); if (isPlus()) flyTo(n, Math.max(cam.z, 1.05)); return; }
    openCard(n);
  }
  function openCard(n) {
    selected = n.id;
    const f = FAM[n.subj];
    const fading = n.kind !== 'ghost' && (n.ago || 0) >= 7;
    let metaLine, action;
    if (n.kind === 'ghost') { metaLine = `${f.name} · Lesson ${n.step} of ${n.steps}, coming up`; action = 'Start lesson'; }
    else if (n.kind === 'lesson') { metaLine = `${f.name} · Lesson ${n.step} · ${cap(when(n.ago))}`; action = 'Revisit'; }
    else { metaLine = `${f.name} · Asked ${when(n.ago)}`; action = 'Revisit'; }
    nodeCard.style.setProperty('--mid', f.mid); nodeCard.style.setProperty('--deep', f.deep);
    nodeCard.innerHTML = `
      <span class="pf-nc-glyph">${glyph(n.shape, n.subj, 70, false)}</span>
      <div class="pf-nc-txt"><p class="pf-nc-title">${esc(n.label)}</p><p class="pf-nc-meta">${esc(metaLine)}</p>
        ${fading ? '<p class="pf-nc-fade"><i></i>Fading. A quick revisit brings it back.</p>' : ''}</div>
      <button class="pf-nc-x" data-x aria-label="Close">${ICON.x}</button>
      <button class="pf-nc-go" data-go>${n.kind === 'ghost' ? '' : ICON.replay}${action}</button>`;
    nodeCard.hidden = false;
    nodeCard.classList.remove('is-in'); void nodeCard.offsetWidth; nodeCard.classList.add('is-in');
    nodeCard.querySelector('[data-x]').addEventListener('click', closeCard);
    nodeCard.querySelector('[data-go]').addEventListener('click', () => revisit(n));
    // nudge the camera so the picked node sits above the card
    if (isPlus()) { const vc = VC(); const want = (vc.y - 70 - vc.y) / cam.z; camT = clampCam({ x: n.tx, y: n.ty - want, z: Math.max(cam.z, fit.z) }); }
    kick();
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function closeCard() { selected = null; if (nodeCard) { nodeCard.hidden = true; nodeCard.classList.remove('is-in'); } kick(); }
  function revisit(n) {
    if (n.kind !== 'ghost') { n.ago = 0; }
    closeCard();
    if (!window.App) return;
    if (n.kind === 'ghost' || n.kind === 'lesson') {
      if (n.courseId && window.Store) Store.set({ activeCourse: n.courseId });
      App.showTab('learn');
    } else {
      App.showTab('ask');
      Bus.emit('ask:open', { question: n.label });
    }
  }

  // ---------- Gestures ----------
  function local(e) { const r = stage.getBoundingClientRect(), k = r.width / W || 1; return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; }
  function bindStage() {
    const worldAt = (x, y, c) => { const vc = VC(); return [c.x + (x - vc.x) / c.z, c.y + (y - vc.y) / c.z]; };
    const pair = () => { const [a, b] = [...ptrs.values()]; return { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 }; };
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const [x, y] = local(e);
      const nodeEl = e.target.closest('.pf-node');
      ptrs.set(e.pointerId, [x, y]);
      if (isPlus()) { try { stage.setPointerCapture(e.pointerId); } catch (err) { /* noop */ } }
      momentum = null; camT = { ...cam };
      if (ptrs.size === 1) gest = { type: 'pan', lx: x, ly: y, moved: 0, node: nodeEl, hist: [[performance.now(), x, y]] };
      else if (ptrs.size === 2 && isPlus()) { const m = pair(); gest = { type: 'pinch', d0: m.d, z0: cam.z, w: worldAt(m.x, m.y, cam), moved: 99 }; }
      kick();
    });
    stage.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId) || !gest) return;
      const [x, y] = local(e); ptrs.set(e.pointerId, [x, y]);
      if (gest.type === 'pan') {
        const dx = x - gest.lx, dy = y - gest.ly; gest.lx = x; gest.ly = y;
        gest.moved += Math.abs(dx) + Math.abs(dy);
        if (gest.moved < 6 || !isPlus()) return;
        stage.classList.add('is-grabbing');
        const rb = (lo, hi, v, d) => ((v < lo && d > 0) || (v > hi && d < 0) ? 0.4 : 1);
        cam.x -= (dx * rb(fit.x0, fit.x1, cam.x, dx)) / cam.z; cam.y -= (dy * rb(fit.y0, fit.y1, cam.y, dy)) / cam.z; camT = { ...cam };
        const now = performance.now(); gest.hist.push([now, x, y]); while (gest.hist.length > 2 && now - gest.hist[0][0] > 90) gest.hist.shift();
      } else if (gest.type === 'pinch' && ptrs.size >= 2) {
        const m = pair(), vc = VC();
        let z = gest.z0 * m.d / gest.d0;
        if (z < fit.zMin) z = fit.zMin * Math.pow(z / fit.zMin, 0.35); if (z > fit.zMax) z = fit.zMax * Math.pow(z / fit.zMax, 0.35);
        cam.z = z; cam.x = gest.w[0] - (m.x - vc.x) / z; cam.y = gest.w[1] - (m.y - vc.y) / z; camT = { ...cam };
      }
      kick();
    });
    const end = (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      if (!gest) return;
      if (gest.type === 'pinch' && ptrs.size === 1) { const [p] = [...ptrs.values()]; gest = { type: 'pan', lx: p[0], ly: p[1], moved: 99, node: null, hist: [[performance.now(), p[0], p[1]]] }; return; }
      if (gest.type === 'pan' && gest.moved < 6 && e.type === 'pointerup') {
        const el = gest.node; gest = null; ptrs.clear(); stage.classList.remove('is-grabbing');
        if (el) tapNode(nodes.get(el.dataset.id)); else if (selected) closeCard();
        return;
      }
      if (gest.type === 'pan' && isPlus()) {
        const h = gest.hist, a = h[0], b = h[h.length - 1], dtm = b[0] - a[0];
        if (dtm > 8 && performance.now() - b[0] < 60) { const vx = (b[1] - a[1]) / dtm, vy = (b[2] - a[2]) / dtm; if (Math.hypot(vx, vy) > 0.12) momentum = { vx: clamp(vx, -3, 3), vy: clamp(vy, -3, 3) }; }
      }
      if (ptrs.size === 0) { gest = null; stage.classList.remove('is-grabbing'); if (!momentum) camT = clampCam({ ...cam }); kick(); }
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    // ⌘/ctrl + scroll (and trackpad pinch) zooms; a plain scroll keeps scrolling the page
    stage.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      if (!isPlus()) return;
      momentum = null;
      const [x, y] = local(e), vc = VC();
      const w = [camT.x + (x - vc.x) / camT.z, camT.y + (y - vc.y) / camT.z];
      const z = clamp(camT.z * Math.exp(-e.deltaY * 0.01), fit.zMin, fit.zMax);
      camT = clampCam({ z, x: w[0] - (x - vc.x) / z, y: w[1] - (y - vc.y) / z });
      kick();
    }, { passive: false });
  }

  // ---------- Archetype card ----------
  let archState = null, archKey = null, dotRaf = 0;
  function renderArch() {
    const sh = shape();
    const state = sh.n >= REVEAL_AT ? 'revealed' : 'forming';
    const keyChanged = archKey && archKey !== sh.key && state === 'revealed' && archState === 'revealed';
    archState = state; archKey = sh.key;
    const A = ARCH[sh.key];
    const left = Math.max(0, REVEAL_AT - sh.n);
    const C = 2 * Math.PI * 64;
    const cmp = compareLine(sh);
    const ring = `<svg class="pf-ring" viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="64" class="pf-ring-bg"/><circle cx="70" cy="70" r="64" class="pf-ring-fg" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - Math.min(sh.n, REVEAL_AT) / REVEAL_AT)).toFixed(1)}"/></svg>`;
    const head = state === 'forming'
      ? `<p class="pf-eyebrow">Your learning shape</p><h2 class="pf-atitle">Your shape is forming…</h2><p class="pf-asub">Explore ${plural(left, 'more idea')} to see what kind of learner you are.</p><p class="pf-count"><b>${sh.n}</b> of ${REVEAL_AT}</p>`
      : `<p class="pf-eyebrow">Your learning shape</p><h2 class="pf-atitle">${A.name}</h2><p class="pf-asub">${A.line}</p>`;
    const charWrap = archEl.querySelector('.pf-char');
    archEl.className = `pf-arch is-${state}`;
    archEl.style.setProperty('--a0', A.grad[0]); archEl.style.setProperty('--a1', A.grad[1]);
    archEl.innerHTML = `
      <div class="pf-arow">
        <div class="pf-char-slot" data-slot>${state === 'forming' ? ring : ''}</div>
        <div class="pf-ahead">${head}</div>
      </div>
      ${chartSVG(sh, state)}
      ${state === 'revealed' && cmp ? `<div class="pf-cmp${cmp.agree ? ' is-agree' : ''}"><div><span>You said</span><b>${esc(cmp.said)}</b></div><i aria-hidden="true">${ICON.chev}</i><div><span>Your graph says</span><b>${esc(cmp.says)}</b></div></div><p class="pf-cmp-note">${esc(cmp.note)}</p>` : ''}
      ${state === 'forming' ? '<p class="pf-anote">It comes from two things: how wide or deep your graph grows, and whether you follow a plan or your own questions.</p>' : ''}`;
    // the particle character keeps living in the same holder across re-renders
    const slot = archEl.querySelector('[data-slot]');
    if (charWrap) slot.appendChild(charWrap); else {
      charHolder = document.createElement('div'); charHolder.className = 'pf-char';
      charIn = document.createElement('div'); charIn.className = 'pf-char-in';
      charHolder.appendChild(charIn); slot.appendChild(charHolder);
    }
    if (window.Brain && visible) {
      Brain.moveTo(charIn);
      if (keyChanged) Brain.setShape('pf-' + sh.key, 'cobalt', 1500);
      else setCharShape(false);
    }
    startDot(sh, state);
  }
  function setCharShape() {
    if (!window.Brain) return;
    if (archState === 'revealed') { Brain.setMode('idle'); Brain.setShape('pf-' + archKey, 'cobalt', 1400); }
    else { Brain.setMode('think'); Brain.setShape('brain', 'cobalt', 1200); }
  }
  // The 2-axis chart. Wide → right, self-directed → up.
  const CW = 296, CH = 150, PADX = 14, PADY = 12;
  const cx = (x) => PADX + ((x + 1) / 2) * (CW - 2 * PADX), cy = (y) => PADY + ((1 - y) / 2) * (CH - 2 * PADY);
  function chartSVG(sh, state) {
    const q = { wanderer: [1, 1], diver: [-1, 1], voyager: [1, -1], builder: [-1, -1] };
    const [qx, qy] = q[sh.key];
    const mx = CW / 2, my = CH / 2;
    const quad = state === 'revealed' ? `<rect class="pf-q-on" x="${qx > 0 ? mx : PADX}" y="${qy > 0 ? PADY : my}" width="${mx - PADX}" height="${my - PADY}" rx="14"/>` : '';
    const names = Object.entries(q).map(([k, [x, y]]) => `<text class="pf-qname${k === sh.key && state === 'revealed' ? ' is-on' : ''}" x="${x > 0 ? CW - PADX - 10 : PADX + 10}" y="${y > 0 ? PADY + 20 : CH - PADY - 10}" text-anchor="${x > 0 ? 'end' : 'start'}">${ARCH[k].short}</text>`).join('');
    return `<div class="pf-chart">
      <span class="pf-ax pf-ax-t">Self-directed</span><span class="pf-ax pf-ax-b">Guided</span>
      <span class="pf-ax pf-ax-l">Deep</span><span class="pf-ax pf-ax-r">Wide</span>
      <svg viewBox="0 0 ${CW} ${CH}" width="100%" aria-label="${state === 'revealed' ? `Your dot sits in ${ARCH[sh.key].short}` : 'Your dot is still moving'}" role="img">
        ${quad}
        <path class="pf-axis" d="M${PADX} ${my}H${CW - PADX}M${mx} ${PADY}V${CH - PADY}"/>
        ${names}
        <g class="pf-dot" data-dot><circle r="15" class="pf-dot-halo"/><circle r="7" class="pf-dot-core"/></g>
      </svg></div>`;
  }
  let dotPos = null;
  function startDot(sh, state) {
    cancelAnimationFrame(dotRaf);
    const g = archEl.querySelector('[data-dot]');
    if (!g) return;
    const tx = cx(sh.x * 0.6), ty = cy(sh.y * 0.62);
    if (!dotPos) dotPos = [cx(0), cy(0)];
    const t0 = performance.now(), amp = state === 'forming' ? lerp(46, 16, sh.n / REVEAL_AT) : 0;
    const tick = (now) => {
      const t = (now - t0) / 1000;
      let x = tx, y = ty;
      if (amp) { x += (Math.sin(t * 0.7) + Math.sin(t * 1.13 + 1.7) * 0.6) * amp * 0.7; y += (Math.cos(t * 0.53 + 0.4) + Math.sin(t * 0.91) * 0.5) * amp * 0.4; }
      x = clamp(x, PADX + 8, CW - PADX - 8); y = clamp(y, PADY + 8, CH - PADY - 8);
      const k = instant() ? 1 : 0.06;
      dotPos[0] += (x - dotPos[0]) * k; dotPos[1] += (y - dotPos[1]) * k;
      g.setAttribute('transform', `translate(${dotPos[0].toFixed(2)} ${dotPos[1].toFixed(2)})`);
      if (!instant() && visible) dotRaf = requestAnimationFrame(tick);
    };
    if (instant()) { dotPos = [clamp(tx, PADX + 8, CW - PADX - 8), clamp(ty, PADY + 8, CH - PADY - 8)]; }
    tick(performance.now());
  }
  // The reveal: the particles gather, burst, and settle into your archetype's emblem.
  function playReveal() {
    if (!visible) return;
    archEl.classList.remove('is-revealing'); void archEl.offsetWidth; archEl.classList.add('is-revealing');
    setTimeout(() => archEl.classList.remove('is-revealing'), 2600);
    if (!window.Brain) return;
    Brain.moveTo(charIn); Brain.setMode('idle');
    if (instant()) { Brain.setShape('pf-' + archKey, 'cobalt', 10); return; }
    Brain.setShape('burst', 'cobalt', 520);
    setTimeout(() => { Brain.pulse(); Brain.setShape('pf-' + archKey, 'cobalt', 1500); }, 560);
  }

  // ---------- Collectibles ----------
  function renderShelf(animate) {
    const list = S().collectibles || [];
    const course = (S().courses || [])[0];
    const C = course && window.COURSES && COURSES[course.id];
    if (!list.length) {
      const gift = C && C.gift ? C.gift : { title: 'The living heart', shape: 'heart', palette: 'body' };
      shelfEl.innerHTML = `<button class="pf-locked" data-locked>
        <span class="pf-art is-locked">${artSVG(gift.shape, gift.palette, 260, 'locked')}<i>${ICON.lock}</i></span>
        <span class="pf-lk-txt"><b>${esc(gift.title)}</b><span>Finish your course to earn the living heart.</span><em>Go to your course${ICON.chev}</em></span>
      </button>`;
      shelfEl.querySelector('[data-locked]').addEventListener('click', () => window.App && App.showTab('learn'));
      return;
    }
    shelfEl.innerHTML = `<div class="pf-shelf">${list.map((c, i) => `<button class="pf-tile${animate && i === list.length - 1 ? ' is-new' : ''}" data-col="${i}">
      <span class="pf-art is-glow" style="--g:${rgb(Brain.palette(c.palette || 'body')[0])}">${artSVG(c.shape, c.palette, 300, 'glow')}</span>
      <b>${esc(c.title)}</b></button>`).join('')}</div>`;
    shelfEl.querySelectorAll('[data-col]').forEach((b) => b.addEventListener('click', () => openViewer(list[+b.dataset.col])));
  }
  function openViewer(c) {
    if (!c) return;
    closeViewer(true);
    const course = (S().courses || []).find((k) => window.COURSES && COURSES[k.id] && COURSES[k.id].gift && COURSES[k.id].gift.id === c.id) || (S().courses || [])[0];
    const from = course ? course.title : 'your course';
    viewer = document.createElement('div');
    viewer.className = 'pf-viewer';
    viewer.setAttribute('role', 'dialog'); viewer.setAttribute('aria-modal', 'true'); viewer.setAttribute('aria-label', c.title);
    viewer.innerHTML = `<button class="pf-v-x" data-vx aria-label="Close">${ICON.x}</button>
      <div class="pf-v-stage"><div class="pf-v-glow" style="--g:${rgb(Brain.palette(c.palette || 'body')[0])}"></div><div class="pf-v-in" data-vin></div></div>
      <p class="pf-v-eb">Collectible</p><h2 class="pf-v-title">${esc(c.title)}</h2><p class="pf-v-sub">Earned by finishing ${esc(from)}. Touch it.</p>`;
    root.appendChild(viewer);
    if (window.App) App.setTabBar(false);
    const scr = document.getElementById('screen'); if (scr) scr.classList.add('is-dark');
    if (window.Brain) { Brain.moveTo(viewer.querySelector('[data-vin]')); Brain.setMode('idle'); Brain.setShape(c.shape || 'heart', c.palette || 'body', 1300); }
    viewer.querySelector('[data-vx]').addEventListener('click', () => closeViewer(false));
    requestAnimationFrame(() => viewer && viewer.classList.add('is-in'));
  }
  function closeViewer(quick) {
    if (!viewer) return;
    const v = viewer; viewer = null;
    if (window.App && visible) App.setTabBar(true);
    const scr = document.getElementById('screen'); if (scr) scr.classList.remove('is-dark');
    const done = () => { v.remove(); if (visible && window.Brain && charIn) { Brain.moveTo(charIn); setCharShape(); } };
    if (quick || instant()) done(); else { v.classList.remove('is-in'); setTimeout(done, 260); }
  }

  // ---------- Courses ----------
  function renderCourses() {
    const st = S(), list = st.courses || [];
    if (!list.length) { coursesEl.innerHTML = '<p class="pf-empty">Your courses will show up here.</p>'; return; }
    coursesEl.innerHTML = list.map((c) => {
      const C = window.COURSES && COURSES[c.id];
      let total = 0, done = 0;
      try { const rm = C ? (window.courseRoadmap ? courseRoadmap(C, st.goal, st.span) : C.lessons) : []; total = rm.length; done = rm.filter((l) => c.progress && c.progress[l.id] === 'done').length; } catch (e) { /* noop */ }
      const subj = C ? subjOf({ subject: C.subject, palette: C.palette }) : 'mind';
      const pct = total ? Math.round((done / total) * 100) : 0;
      return `<button class="pf-course" data-course="${esc(c.id)}" style="--mid:${FAM[subj].mid};--deep:${FAM[subj].deep}">
        <span class="pf-c-glyph">${glyph(C ? C.shape : 'brain', subj, 80, false)}</span>
        <span class="pf-c-txt"><b>${esc(c.title)}</b><span>${total ? `${done} of ${total} stops` : 'Just started'}${c.id === st.activeCourse ? ' · Active' : ''}</span>
          <span class="pf-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${Math.max(pct, 3)}%"></i></span></span>
        <span class="pf-c-chev">${ICON.chev}</span></button>`;
    }).join('');
    coursesEl.querySelectorAll('[data-course]').forEach((b) => b.addEventListener('click', () => {
      if (window.Store) Store.set({ activeCourse: b.dataset.course });
      if (window.App) App.showTab('learn');
    }));
  }

  window.Profile = { mount, show, hide };
})();
