(function () {
  const G = GRAPH, IDS = Object.keys(G), TYPE_NAME = Object.fromEntries(LINK_TYPES);
  const W = 368, H = 822, CX = W / 2, CY = H / 2 - 8;
  const SIZES = [140, 86, 60, 38], RAD = [0, 196, 338, 470];
  const params = new URLSearchParams(location.search), STILL = params.has('still');
  if (STILL) document.documentElement.classList.add('still');

  const $ = (id) => document.getElementById(id);
  const mapEl = $('map'), nodesEl = $('nodes'), edgesEl = $('edges'), worldEl = $('world'), wScroll = $('wScroll');
  const introEl = $('intro'), screenEl = $('screen'), hintEl = $('hint');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  let PS = 1; // phone scale on the page

  Brain.mount($('brain'));
  if (STILL) setInterval(() => Brain.snap(), 200);

  // ---------- Glyphs: each question drawn as a tiny particle world ----------
  const glyphCache = {};
  function glyph(id) {
    if (glyphCache[id]) return glyphCache[id];
    const n = G[id], pal = Brain.palette(CLUSTERS[n.cl].palette);
    let s = '<svg viewBox="-1.15 -1.15 2.3 2.3" aria-hidden="true">';
    for (const [x, y, z] of Brain.sample(n.shape, 170)) {
      const c = pal[0].map((v, i) => Math.round(v + (pal[1][i] - v) * z)).join(',');
      s += `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${(0.024 + 0.03 * z).toFixed(3)}" fill="rgb(${c})" opacity="${(0.35 + 0.65 * z).toFixed(2)}"/>`;
    }
    return (glyphCache[id] = s + '</svg>');
  }
  function neighbors(id) {
    const out = [], L = G[id].links;
    for (const [t] of LINK_TYPES) (L[t] || []).forEach((n) => { if (n !== id && G[n] && !out.find((o) => o.id === n)) out.push({ id: n, type: t }); });
    return out;
  }

  // ---------- Nodes ----------
  const S = {};
  IDS.forEach((id) => {
    const el = document.createElement('div'); el.className = 'node'; el.dataset.id = id;
    el.style.setProperty('--tint', CLUSTERS[G[id].cl].tint);
    el.innerHTML = `<div class="bub" role="button" aria-label="${G[id].label}">${glyph(id)}</div><div class="lab"><b>${G[id].label}</b><span></span><button class="dive">Dive in →</button></div>`;
    nodesEl.appendChild(el);
    S[id] = { id, el, bub: el.querySelector('.bub'), lab: el.querySelector('.lab'), sub: el.querySelector('.lab span'), x: 0, y: 0, d: 0, fx: 0, fy: 0, fd: 0, tx: 0, ty: 0, td: 0, t0: 0, dur: 1, delay: 0, ring: 3, type: null, parent: null, sx: CX, sy: CY, dpx: 0 };
    el.querySelector('.dive').addEventListener('click', (e) => { e.stopPropagation(); openWorld(id); });
  });

  function computeLayout(c) {
    const pos = { [c]: { x: 0, y: 0, ring: 0 } };
    const all = neighbors(c), r1 = all.slice(0, 6), extra = all.slice(6), n1 = r1.length;
    const off = n1 % 2 === 0 ? Math.PI / n1 : 0; // keep the slot under the centre label free
    r1.forEach((o, k) => { const a = -Math.PI / 2 + off + (k * 2 * Math.PI) / n1; pos[o.id] = { x: Math.cos(a) * RAD[1] * 0.9, y: Math.sin(a) * RAD[1] * 1.14, ring: 1, type: o.type, parent: c, a }; });
    extra.forEach((o, k) => { const a = -Math.PI / 2 + off + ((k + 0.5) * 2 * Math.PI) / n1; pos[o.id] = { x: Math.cos(a) * (RAD[2] - 40), y: Math.sin(a) * (RAD[2] - 40) * 1.08, ring: 2, type: o.type, parent: c, a }; });
    r1.forEach((o) => {
      const kids = neighbors(o.id).filter((n) => !pos[n.id]).slice(0, n1 > 6 ? 2 : 3);
      const base = pos[o.id].a, slot = (2 * Math.PI) / n1;
      kids.forEach((kd, j) => {
        const a = base + (j - (kids.length - 1) / 2) * (slot * 0.62), r = RAD[2] + (j % 2) * 46;
        pos[kd.id] = { x: Math.cos(a) * r, y: Math.sin(a) * r * 1.08, ring: 2, type: kd.type, parent: o.id, a };
      });
    });
    const rest = IDS.filter((i) => !pos[i]);
    rest.forEach((id, k) => { const a = -Math.PI / 2 + ((k + 0.5) * 2 * Math.PI) / rest.length + 0.2, r = RAD[3] + (k % 2) * 70; pos[id] = { x: Math.cos(a) * r, y: Math.sin(a) * r * 1.08, ring: 3, a }; });
    return pos;
  }

  let center = null, filter = null, trail = [];
  function applyLayout(c, o = {}) {
    const pos = computeLayout(c), now = performance.now();
    IDS.forEach((id) => {
      const s = S[id], p = pos[id];
      Object.assign(s, { fx: o.bloom ? 0 : s.x, fy: o.bloom ? 0 : s.y, fd: o.bloom ? 0 : s.d, tx: p.x, ty: p.y, td: SIZES[p.ring], ring: p.ring, type: p.type || null, parent: p.parent || null, t0: now, dur: STILL ? 1 : o.dur || 950, delay: STILL ? 0 : o.bloom ? p.ring * 150 + Math.random() * 140 : 0 });
      s.el.classList.toggle('center', p.ring === 0);
      s.sub.textContent = p.ring === 1 ? TYPE_NAME[p.type] : p.ring === 3 ? '' : CLUSTERS[G[id].cl].name;
      s.sub.className = p.ring === 1 ? 'ty' : '';
    });
    center = c;
  }

  // ---------- Camera + render loop ----------
  let cam = { x: 0, y: 0, z: 1 }, camAnim = null, vel = { x: 0, y: 0 }, dragging = false;
  function animateCam(to, dur) { camAnim = { from: { ...cam }, to, t0: performance.now(), dur: STILL ? 1 : dur }; }
  const pBase = document.createElementNS('http://www.w3.org/2000/svg', 'path'), pHi = pBase.cloneNode(), pTrail = pBase.cloneNode();
  pBase.setAttribute('stroke', 'rgba(20,18,17,.10)'); pBase.setAttribute('stroke-width', '1.5');
  pHi.setAttribute('stroke', 'rgba(31,91,224,.5)'); pHi.setAttribute('stroke-width', '2');
  pTrail.setAttribute('stroke', '#1F5BE0'); pTrail.setAttribute('stroke-width', '2.5'); pTrail.setAttribute('stroke-dasharray', '1 7'); pTrail.setAttribute('stroke-linecap', 'round');
  [pBase, pHi, pTrail].forEach((p) => { p.setAttribute('fill', 'none'); edgesEl.appendChild(p); });
  const seg = (a, b) => {
    const dx = b.sx - a.sx, dy = b.sy - a.sy, L = Math.hypot(dx, dy) || 1, ra = a.dpx / 2 + 5, rb = b.dpx / 2 + 5;
    if (L < ra + rb || a.dpx < 4 || b.dpx < 4) return '';
    return `M${(a.sx + (dx / L) * ra).toFixed(1)} ${(a.sy + (dy / L) * ra).toFixed(1)}L${(b.sx - (dx / L) * rb).toFixed(1)} ${(b.sy - (dy / L) * rb).toFixed(1)}`;
  };

  function step(now) {
    if (camAnim) {
      const k = ease(clamp((now - camAnim.t0) / camAnim.dur));
      cam = { x: lerp(camAnim.from.x, camAnim.to.x, k), y: lerp(camAnim.from.y, camAnim.to.y, k), z: lerp(camAnim.from.z, camAnim.to.z, k) };
      if (k >= 1) camAnim = null;
    } else if (!dragging && (Math.abs(vel.x) > 0.05 || Math.abs(vel.y) > 0.05)) {
      cam.x -= vel.x / cam.z; cam.y -= vel.y / cam.z; vel.x *= 0.93; vel.y *= 0.93;
    }
    for (const id of IDS) {
      const s = S[id], k = ease(clamp((now - s.t0 - s.delay) / s.dur));
      s.x = lerp(s.fx, s.tx, k); s.y = lerp(s.fy, s.ty, k); s.d = lerp(s.fd, s.td, k);
      const sx = (s.x - cam.x) * cam.z + CX, sy = (s.y - cam.y) * cam.z + CY, dist = Math.hypot(sx - CX, sy - CY);
      const fish = 1.12 - 0.58 * smooth(60, 400, dist);
      const dpx = s.d * Math.min(cam.z, 1.25) * fish;
      s.sx = sx; s.sy = sy; s.dpx = dpx;
      let op = clamp(1.4 - dist / 470) * clamp(s.d / 6);
      if (filter && s.ring !== 0 && !(s.ring === 1 && s.type === filter)) op *= 0.2;
      s.el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
      s.el.style.opacity = op.toFixed(3);
      s.el.style.zIndex = Math.round(dpx);
      s.bub.style.transform = `scale(${(dpx / 120).toFixed(4)})`;
      s.lab.style.top = (dpx / 2 + 8).toFixed(1) + 'px';

      s.lab.style.opacity = clamp((dpx - 54) / 20).toFixed(2);
      s.lab.style.transform = `scale(${clamp(0.78 + dpx / 420, 0.8, 1.05).toFixed(3)})`;
    }
    let d = '', dh = '', dt = '';
    for (const id of IDS) {
      const s = S[id]; if (!s.parent || s.ring > 2) continue;
      const l = seg(S[s.parent], s);
      if (filter && s.ring === 1 && s.type === filter) dh += l; else d += l;
    }
    for (let i = 1; i < trail.length; i++) dt += seg(S[trail[i - 1]], S[trail[i]]);
    pBase.setAttribute('d', d); pHi.setAttribute('d', dh); pTrail.setAttribute('d', dt);
  }
  if (STILL) setInterval(() => step(performance.now()), 50);
  else { const loop = (t) => { step(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

  // ---------- Gestures ----------
  const pts = new Map(); let down = null, moved = 0, pinch = null;
  const pdist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  mapEl.addEventListener('pointerdown', (e) => {
    if (worldOpen) return;
    mapEl.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    camAnim = null; vel = { x: 0, y: 0 };
    if (pts.size === 1) { down = { target: e.target }; moved = 0; } else if (pts.size === 2) { pinch = { d: pdist(), z: cam.z }; dragging = true; }
  });
  mapEl.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId); if (!p) return;
    const dx = (e.clientX - p.x) / PS, dy = (e.clientY - p.y) / PS; p.x = e.clientX; p.y = e.clientY;
    if (pts.size === 1) {
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 6 && !dragging) { dragging = true; mapEl.classList.add('dragging'); hint(null); }
      if (dragging) { cam.x -= dx / cam.z; cam.y -= dy / cam.z; vel = { x: dx, y: dy }; }
    } else if (pts.size === 2 && pinch) cam.z = clamp((pinch.z * pdist()) / pinch.d, 0.5, 1.7);
  });
  const end = (e) => {
    if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId);
    if (pts.size === 0) {
      if (!dragging && down) { const n = down.target.closest && down.target.closest('.node'); if (n && !down.target.closest('.dive')) tapNode(n.dataset.id); }
      dragging = false; pinch = null; down = null; mapEl.classList.remove('dragging');
    }
  };
  mapEl.addEventListener('pointerup', end); mapEl.addEventListener('pointercancel', end);
  mapEl.addEventListener('wheel', (e) => {
    e.preventDefault(); camAnim = null;
    if (e.ctrlKey || e.metaKey) cam.z = clamp(cam.z * Math.exp(-e.deltaY * 0.01), 0.5, 1.7);
    else { cam.x += e.deltaX / cam.z / PS; cam.y += e.deltaY / cam.z / PS; }
  }, { passive: false });

  function tapNode(id) { if (id === center) openWorld(id); else travel(id); }
  function travel(id, then) {
    trail.push(id); S[id].el.classList.add('visited'); $('trailN').textContent = new Set(trail).size;
    filter = null; renderChips();
    applyLayout(id); animateCam({ x: 0, y: 0, z: 1 }, 950);
    hint(firstOpen ? 'Tap the centre to dive in' : null);
    if (then) setTimeout(then, STILL ? 10 : 980);
  }

  // ---------- Worlds ----------
  let worldOpen = null, firstOpen = true;
  function openWorld(id) {
    if (worldOpen) return;
    const s = S[id], n = G[id], cl = CLUSTERS[n.cl];
    worldOpen = id; firstOpen = false; hint(null);
    worldEl.style.setProperty('--wtint', cl.tint);
    renderWorld(id);
    worldEl.classList.add('instant'); worldEl.style.clipPath = `circle(${s.dpx / 2}px at ${s.sx}px ${s.sy}px)`;
    worldEl.getBoundingClientRect(); worldEl.classList.remove('instant');
    requestAnimationFrame(() => { worldEl.style.clipPath = `circle(900px at ${s.sx}px ${s.sy}px)`; });
    if (STILL) worldEl.style.clipPath = `circle(900px at ${s.sx}px ${s.sy}px)`;
    worldEl.classList.add('open'); worldEl.setAttribute('aria-hidden', 'false');
    animateCam({ x: s.x, y: s.y, z: 2.4 }, 560);
    Brain.moveTo($('worldBrain')); Brain.setShape(n.shape, cl.palette, 1500); Brain.setMode('idle');
  }
  function closeWorld(then) {
    if (!worldOpen) return;
    const s = S[worldOpen];
    animateCam({ x: s.x, y: s.y, z: 1 }, 560);
    worldEl.style.clipPath = `circle(${(SIZES[0] * 1.12) / 2}px at ${CX}px ${CY}px)`;
    worldEl.classList.remove('open'); worldEl.setAttribute('aria-hidden', 'true');
    setTimeout(() => { worldOpen = null; then && then(); }, STILL ? 10 : 560);
  }
  function diverge(id) { if (worldOpen) closeWorld(() => travel(id, () => openWorld(id))); else travel(id, () => openWorld(id)); }

  const ICON_BACK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const ICON_MAP = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><circle cx="4.5" cy="7" r="2"/><circle cx="19.5" cy="7" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="17.5" r="2"/><circle cx="12" cy="3" r="1.4"/></svg>';
  const ICON_SAVE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
  function renderWorld(id) {
    const n = G[id], cl = CLUSTERS[n.cl], leads = neighbors(id).slice(0, 6);
    const next = leads.find((l) => l.type === 'deeper') || leads.find((l) => l.type === 'leads') || leads[0];
    wScroll.innerHTML = `
      <div class="w-top"><button class="circ" data-close aria-label="Back to the map">${ICON_BACK}</button><span class="w-tag" style="background:${cl.d}">${cl.name}</span><button class="circ" data-save aria-label="Save">${ICON_SAVE}</button></div>
      <div id="worldBrain"></div>
      <p class="w-touch">Touch it</p>
      <h2 class="w-title">${n.label}</h2>
      <p class="w-one">${n.one}</p>
      ${n.loop ? `<div class="loop" role="group" aria-label="The habit loop">${n.loop.map(([a], i) => `<button class="opt" data-loop="${i}" aria-pressed="${i === 0}">${i + 1} · ${a}</button>`).join('')}</div><p class="loopcap" data-loopcap>${n.loop[0][1]}</p>` : ''}
      <div class="beats">${n.beats.map((b, i) => `<div class="beat"><span class="n">${i + 1} of ${n.beats.length}</span><h3>${b.h}</h3><p>${b.p}</p></div>`).join('')}</div>
      <p class="sec">Where this leads</p>
      ${leads.map((l) => `<button class="lead" data-go="${l.id}" style="--tint:${CLUSTERS[G[l.id].cl].tint}"><span class="mini">${glyph(l.id)}</span><span class="tx"><span>${TYPE_NAME[l.type]}</span><b>${G[l.id].label}</b></span><span class="ar" aria-hidden="true">→</span></button>`).join('')}
      <div class="w-cta"><p class="next">Next: ${G[next.id].label}</p><div class="row"><button class="circ" data-close aria-label="Back to the map">${ICON_MAP}</button><button class="btn-lit" data-go="${next.id}">Follow the thread</button></div></div>`;
    wScroll.scrollTop = 0;
    wScroll.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => closeWorld()));
    wScroll.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => diverge(b.dataset.go)));
    wScroll.querySelector('[data-save]').addEventListener('click', () => toast('Saved to your Memory'));
    wScroll.querySelectorAll('[data-loop]').forEach((b) => b.addEventListener('click', () => {
      wScroll.querySelectorAll('[data-loop]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      wScroll.querySelector('[data-loopcap]').textContent = n.loop[+b.dataset.loop][1]; Brain.pulse();
    }));
  }

  // ---------- Chrome ----------
  function renderChips() {
    const el = $('chips');
    el.innerHTML = [['all', 'All'], ...LINK_TYPES].map(([k, v]) => `<button class="chip" data-f="${k}" aria-pressed="${(filter || 'all') === k}">${v}</button>`).join('');
    el.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.f === 'all' ? null : b.dataset.f; renderChips(); }));
  }
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status'); screenEl.appendChild(t); setTimeout(() => t.remove(), 2500); }
  function hint(text) { if (text) { hintEl.textContent = text; hintEl.classList.remove('hide'); } else hintEl.classList.add('hide'); }
  $('trailBtn').addEventListener('click', () => toast(`Your trail: ${new Set(trail).size} questions, saved to Memory`));
  $('backBtn').addEventListener('click', () => toast('Back goes to Ask home'));
  $('searchBtn').addEventListener('click', () => toast('Search your map (not in this prototype)'));
  $('askBtn').addEventListener('click', () => toast('Ask your own question (not in this prototype)'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeWorld(); });

  // ---------- Intro: the brain becomes your question, then the map blooms ----------
  let introTimers = [];
  const T = (ms, fn) => introTimers.push(setTimeout(fn, STILL ? 0 : ms));
  const cap = (t) => { $('introCap').textContent = t; };
  function startMap() {
    introTimers.forEach(clearTimeout); introTimers = [];
    introEl.classList.add('out');
    trail = ['habit']; S.habit.el.classList.add('visited'); $('trailN').textContent = 1;
    cam = { x: 0, y: 0, z: 1 }; filter = null; renderChips();
    applyLayout('habit', { bloom: true, dur: 1100 });
    hint('Drag to explore · tap a question to travel');
    Brain.moveTo(document.createElement('div')); // park the canvas until a world opens
    if (params.get('go')) setTimeout(() => travel(params.get('go'), params.has('open') ? () => openWorld(params.get('go')) : null), 50);
    else if (params.has('open')) setTimeout(() => openWorld('habit'), 50);
  }
  function intro() {
    if (worldOpen) { worldOpen = null; worldEl.classList.remove('open'); worldEl.style.clipPath = 'circle(0px at 50% 50%)'; }
    IDS.forEach((id) => { Object.assign(S[id], { x: 0, y: 0, d: 0, fx: 0, fy: 0, fd: 0, tx: 0, ty: 0, td: 0 }); S[id].el.classList.remove('visited'); });
    introEl.classList.remove('out'); Brain.moveTo($('introBrain')); Brain.form(); cap('');
    if (params.has('skip')) return startMap();
    T(500, () => { Brain.setMode('think'); cap('Thinking…'); });
    T(2100, () => { Brain.setMode('idle'); Brain.setShape('ring', 'mind', 1500); cap('Here’s your question…'); });
    T(3700, () => cap('…and everything it connects to.'));
    T(4900, startMap);
  }
  $('skipIntro').addEventListener('click', startMap);
  $('replay').addEventListener('click', intro);

  function fit() {
    PS = Math.min(1, (window.innerHeight - 48) / 844);
    $('phoneWrap').style.transform = `scale(${PS})`; $('phoneHolder').style.width = 390 * PS + 'px'; $('phoneHolder').style.height = 844 * PS + 'px';
  }
  window.addEventListener('resize', fit); fit();
  renderChips(); intro();
})();
