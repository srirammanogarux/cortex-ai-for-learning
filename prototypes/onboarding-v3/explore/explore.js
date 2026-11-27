// Explore: the full-screen exploration for the exploration. Mounts into #exploreLayer.
// Content lives in content.js (window.CONTENT). Talks to other modules only through Bus (see CONTRACT.md).
(function () {
  const C = window.CONTENT, N = C.nodes, ROOT = C.root;
  const P = new URLSearchParams(location.search);
  const isStill = () => document.documentElement.classList.contains('still');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smooth = () => (isStill() || reduced ? 'auto' : 'smooth');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const GAIN = { block: 0.07, term: 0.03, dive: 0.12 };
  const FAM = {
    mind: ['Psychology', '#4A30B0', '#7457E0', '#EEEAFD'],
    arts: ['Design', '#7E2777', '#B04AA8', '#F8E9F6'],
    society: ['Business', '#526612', '#7E9A2A', '#EFF3E1'],
    tech: ['Data', '#165F87', '#2A8FC4', '#E4F1F8'],
  };

  // ───────── Icons (24×24 line icons; extends ../icons.js) ─────────
  const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const IC = {
    x: ['M18 6L6 18', 'M6 6l12 12'],
    back: ['M15 18l-6-6 6-6'],
    chev: ['M9 18l6-6-6-6'],
    bookmark: ['M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'],
    check: ['M20 6L9 17l-5-5'],
    up: ['M12 19V5', 'M5 12l7-7 7 7'],
    alert: [circ(12, 12, 9.5), 'M12 7.5v5', 'M12 16.2v.01'],
    minus: ['M5 12h14'],
    hand: ['M18 11V6a2 2 0 0 0-4 0v5', 'M14 10V4a2 2 0 0 0-4 0v6', 'M10 10.5V6a2 2 0 0 0-4 0v8', 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'],
    bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'],
    tap: ['M9 9.5V4.5a1.5 1.5 0 0 1 3 0v6', 'M12 9.5a1.5 1.5 0 0 1 3 0v1', 'M15 10a1.5 1.5 0 0 1 3 0v1', 'M18 11a1.5 1.5 0 0 1 3 0v3.5a7.5 7.5 0 0 1-7.5 7.5h-1a7 7 0 0 1-5.6-2.8L4 15.2a1.6 1.6 0 0 1 2.4-2.1L9 15.5'],
    gift: ['M20 12v9H4v-9', 'M2 7h20v5H2z', 'M12 21V7', 'M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z', 'M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z'],
    sprout: ['M7 20h10', 'M10 20c5.5-2.5.8-6.4 3-10', 'M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z', 'M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z'],
    repeat: ['M17 2l4 4-4 4', 'M3 11V9a3 3 0 0 1 3-3h15', 'M7 22l-4-4 4-4', 'M21 13v2a3 3 0 0 1-3 3H3'],
    hash: ['M4 9h16', 'M4 15h16', 'M10 3L8 21', 'M16 3l-2 18'],
    dice: ['M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z', 'M8.5 8.5h.01', 'M15.5 15.5h.01', 'M12 12h.01', 'M15.5 8.5h.01', 'M8.5 15.5h.01'],
    shuffle: ['M16 3h5v5', 'M4 20L21 3', 'M21 16v5h-5', 'M15 15l6 6', 'M4 4l5 5'],
    clock: [circ(12, 12, 9.5), 'M12 7v5l3.5 2'],
    scale: ['M12 3v18', 'M7 21h10', 'M3 7h18', 'M6 7l-3 7a3.5 3.5 0 0 0 6 0z', 'M18 7l-3 7a3.5 3.5 0 0 0 6 0z'],
    flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
    shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
    snow: ['M12 2v20', 'M3.3 7l17.4 10', 'M3.3 17L20.7 7', 'M9 4l3 2 3-2', 'M9 20l3-2 3 2'],
    coins: [circ(8, 8, 6), 'M18.09 10.37A6 6 0 1 1 10.34 18', 'M7 6h1v4', 'M16.7 13.9l.7.7-2.8 2.8'],
    moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z'],
    route: [circ(6, 19, 2.5), 'M8.5 19h8a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7h8', circ(18, 5, 2.5)],
    split: ['M16 3h5v5', 'M8 3H3v5', 'M12 22v-8.3a4 4 0 0 0-1.2-2.9L3 3', 'M15 9l6-6'],
    door: ['M13 4h3a2 2 0 0 1 2 2v14', 'M2 20h3', 'M13 20h9', 'M10 12v.01', 'M13 4.56v16.16a1 1 0 0 1-1.24.97L5 20V5.56a2 2 0 0 1 1.52-1.94l4-1A2 2 0 0 1 13 4.56z'],
    frown: [circ(12, 12, 9.5), 'M16 16s-1.5-2-4-2-4 2-4 2', 'M9 9h.01', 'M15 9h.01'],
    cart: [circ(8, 21, 1), circ(19, 21, 1), 'M2 2h2l2.7 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.9-1.6L22 7H5.1'],
    star: ['M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z'],
    diamond: ['M12 2.5l8.5 9.5-8.5 9.5L3.5 12z'],
    lens: [circ(11, 11, 7.5), 'M21 21l-4.6-4.6'],
    zap: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
    ig: ['M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10a4.5 4.5 0 0 1-4.5 4.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5z', circ(12, 12, 4), 'M17.5 6.5h.01'],
  };
  const ic = (name, size = 20, sw = 2) => {
    const paths = IC[name] || (window.ICONS && ICONS[name]) || IC.check;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.map((d) => `<path d="${d}"/>`).join('')}</svg>`;
  };
  IC.sparkle = (window.ICONS && ICONS.sparkle) || IC.star; IC.bolt = (window.ICONS && ICONS.bolt) || IC.zap;
  IC.target = (window.ICONS && ICONS.target) || IC.lens; IC.search = (window.ICONS && ICONS.search) || IC.lens;
  const img = (src, cls = 'ex-img') => `<img class="${cls}" src="${src}" alt="" draggable="false" onerror="this.classList.add('is-miss')">`;

  // ───────── State ─────────
  let layer, root, pagesEl, page = null, cur = null, backBtn, saveBtn, meterBtn, meterInfo, sheetWrap, sheetBody, pop = null, celebrate;
  let hist = [];
  let S;
  const fresh = () => ({ visited: [], parentOf: {}, credited: new Set(), value: 0, saved: new Set(), celebrated: false, popTerm: null });
  S = fresh();

  // ───────── Rich text with glowing terms ─────────
  const termHTML = (id, txt) => {
    const done = S.visited.includes(id);
    return `<button type="button" class="ex-term${done ? ' is-done' : ''}" data-act="term" data-term="${id}"><span class="ex-term-ic">${ic(done ? 'check' : 'sparkle', 13, 2.3)}</span>${txt}</button>`;
  };
  const rich = (s) => esc(s).replace(/\[\[(\w+)(?:\|([^\]]+))?\]\]/g, (m, id, txt) => (C.terms[id] ? termHTML(id, txt || C.terms[id].label) : txt || id));
  function refreshTerms() {
    root.querySelectorAll('.ex-term').forEach((b) => {
      const done = S.visited.includes(b.dataset.term);
      if (b.classList.contains('is-done') === done) return;
      b.classList.toggle('is-done', done);
      b.querySelector('.ex-term-ic').innerHTML = ic(done ? 'check' : 'sparkle', 13, 2.3);
    });
    root.querySelectorAll('[data-act="go"]').forEach((b) => b.classList.toggle('is-done', S.visited.includes(b.dataset.id)));
  }

  // ───────── Block renderers ─────────
  const head = (b) => `<header class="ex-sec-head"><p class="ex-eyebrow">${esc(b.eyebrow)}</p><h2 class="ex-h2">${esc(b.title)}</h2>${b.intro ? `<p class="ex-intro">${rich(b.intro)}</p>` : ''}</header>`;
  const seg = (labels, act, on = 0, cls = '') => `<div class="ex-seg ${cls}" role="tablist" style="--n:${labels.length};--i:${on}"><i class="ex-seg-thumb" aria-hidden="true"></i>${labels.map((l, k) => `<button type="button" role="tab" data-act="${act}" data-i="${k}" aria-selected="${k === on}">${esc(l)}</button>`).join('')}</div>`;
  const chips = (labels, act, on = -1, cls = '') => `<div class="ex-chips ${cls}" role="tablist">${labels.map((l, k) => `<button type="button" class="ex-chip" role="tab" data-act="${act}" data-i="${k}" aria-selected="${k === on}">${esc(l)}</button>`).join('')}</div>`;
  const SHORT = ['Trigger', 'Action', 'Reward', 'Investment'];

  const R = {
    stages(b) {
      return `${head(b)}
      <div class="ex-steps" role="tablist" style="--i:0;--n:${b.steps.length}">
        <div class="ex-steps-line" aria-hidden="true"><i></i></div>
        ${b.steps.map((s, k) => `<button type="button" class="ex-step" role="tab" data-act="step" data-i="${k}" aria-selected="${k === 0}" aria-label="Step ${k + 1}: ${esc(s.name)}"><span class="ex-step-dot">${ic(s.icon, 20)}</span><span class="ex-step-name">${SHORT[k] || esc(s.name)}</span></button>`).join('')}
      </div>
      <div class="ex-carousel" data-carousel>
        ${b.steps.map((s, k) => `<article class="ex-stage${k === 0 ? ' is-on' : ''}" data-i="${k}">
          <div class="ex-stage-top"><span class="ex-tile ex-tile-88">${img(s.img)}</span><div><p class="ex-stage-tag">${esc(s.tag)}</p><h3 class="ex-h3">${esc(s.name)}</h3></div></div>
          <p class="ex-body">${rich(s.text)}</p>
          <div class="ex-example"><p class="ex-example-k">${ic('ig', 15)} On Instagram</p><p>${esc(s.ex)}</p></div>
        </article>`).join('')}
        <span class="ex-carousel-end" aria-hidden="true"></span>
      </div>`;
    },
    guess(b) {
      return `${head(b)}
      <div class="ex-opts">${b.options.map((o, k) => `<button type="button" class="ex-opt" data-act="guess" data-i="${k}"><span class="ex-opt-ic">${ic(o.icon, 20)}</span><span class="ex-opt-t">${esc(o.text)}</span><span class="ex-opt-mark" aria-hidden="true"></span></button>`).join('')}</div>
      <div class="ex-reveal" data-reveal></div>`;
    },
    tiles(b) {
      return `${head(b)}
      <div class="ex-tiles">${b.items.map((t, k) => `<button type="button" class="ex-tilecard" data-act="tile" data-i="${k}"><span class="ex-tile ex-tile-full">${img(t.img)}<span class="ex-seen" aria-hidden="true">${ic('check', 12, 3)}</span></span><span class="ex-tilecard-name">${esc(t.name)}</span><span class="ex-tilecard-sub">${esc(t.sub)}</span></button>`).join('')}</div>`;
    },
    compare(b) {
      return `${head(b)}
      ${seg([b.a, b.b], 'cmp', 0, 'ex-seg-cmp')}
      <div class="ex-cmp" data-side="0">
        <div class="ex-cmp-head" aria-hidden="true"><span class="c0">${esc(b.a)}</span><span class="c1">${esc(b.b)}</span></div>
        ${b.rows.map((r) => `<div class="ex-cmp-row"><p class="ex-cmp-k">${esc(r[0])}</p><div class="ex-cmp-cells"><p class="c0">${rich(r[1])}</p><p class="c1">${rich(r[2])}</p></div></div>`).join('')}
      </div>
      <p class="ex-verdict" data-verdict>${ic('sparkle', 16)}<span>${esc(b.verdict[0])}</span></p>`;
    },
    cases(b) {
      return `${head(b)}
      <div class="ex-hscroll">${b.items.map((c, k) => `<button type="button" class="ex-case" data-act="case" data-i="${k}"><span class="ex-case-img">${img(c.img)}</span><span class="ex-case-name">${esc(c.name)}</span><span class="ex-case-sub">${esc(c.sub)}</span><span class="ex-case-more">Read the story ${ic('chev', 14, 2.4)}</span></button>`).join('')}<span class="ex-carousel-end" aria-hidden="true"></span></div>`;
    },
    apply(b) {
      return `${head(b)}
      ${chips(b.options.map((o) => o.label), 'apply', -1, 'ex-chips-stack')}
      <div class="ex-apply" data-apply>
        <div class="ex-loop4">${b.loop.map((l, k) => `<div class="ex-loopcell" data-k="${k}"><span class="ex-loopcell-ic">${ic(['bell', 'tap', 'gift', 'sprout'][k], 18)}</span><span>${esc(l)}</span></div>`).join('')}</div>
        <p class="ex-apply-why" data-why>Pick a moment above to check its loop.</p>
      </div>`;
    },
    chart(b) {
      const labels = b.options.map((o) => o.label);
      return `${head(b)}
      ${labels.length > 3 ? chips(labels, 'chart', 0, 'ex-chips-grid') : seg(labels, 'chart', 0)}
      <figure class="ex-chart"><svg viewBox="0 0 304 172" data-svg role="img" aria-label="${esc(b.title)}">${chartSVG(b, 0)}</svg></figure>
      <p class="ex-chart-text" data-text>${rich(b.options[0].text)}</p>
      ${b.note ? `<p class="ex-note">${esc(b.note)}</p>` : ''}`;
    },
    fogg(b) {
      return `${head(b)}
      <div class="ex-fogg-ctrls">
        <div class="ex-ctrl"><span class="ex-ctrl-k">Motivation</span>${seg(['Low', 'High'], 'fm', 0, 'ex-seg-sm')}</div>
        <div class="ex-ctrl"><span class="ex-ctrl-k">Ability</span>${seg(['Hard', 'Easy'], 'fa', 0, 'ex-seg-sm')}</div>
      </div>
      <figure class="ex-chart"><svg viewBox="0 0 304 190" data-svg role="img" aria-label="Fogg behaviour model chart">${foggSVG()}</svg></figure>
      <div class="ex-fogg-out" data-out></div>`;
    },
    streak() {
      return `${head(arguments[0])}
      ${seg(['Freeze off', 'Freeze on'], 'freeze', 0)}
      <div class="ex-week" data-week></div>
      <div class="ex-streak-out" data-out></div>`;
    },
    reels(b) {
      return `${head(b)}
      ${seg(b.options.map((o) => o.label), 'reel', 0)}
      <div class="ex-reels" data-reels></div>
      <p class="ex-chart-text" data-text></p>`;
    },
    matrix(b) {
      return `${head(b)}
      <div class="ex-mx">
        <p class="ex-mx-colk">${esc(b.colLabel)}</p>
        <div class="ex-mx-grid">
          <span class="ex-mx-corner">${esc(b.rowLabel)}</span><span class="ex-mx-h">Yes</span><span class="ex-mx-h">No</span>
          <span class="ex-mx-rk">Yes</span>
          ${b.cells.slice(0, 2).map((c, k) => mxCell(c, k)).join('')}
          <span class="ex-mx-rk">No</span>
          ${b.cells.slice(2).map((c, k) => mxCell(c, k + 2)).join('')}
        </div>
      </div>
      <div class="ex-mx-out" data-out><p class="ex-chart-text">Tap a box to see what it means.</p></div>`;
    },
    table(b) {
      return `${head(b)}
      <div class="ex-table">
        <div class="ex-tr ex-th"><span>${esc(b.cols[0])}</span><span>${esc(b.cols[1])}</span></div>
        ${b.rows.map((r) => `<div class="ex-tr"><b>${esc(r[0])}</b><span>${rich(r[1])}</span></div>`).join('')}
      </div>
      ${b.note ? `<p class="ex-note">${rich(b.note)}</p>` : ''}`;
    },
    points(b) {
      return `${head(b)}
      <ul class="ex-points">${b.items.map((p) => `<li><span class="ex-points-ic">${ic(p[0], 20)}</span><div><h3 class="ex-h4">${esc(p[1])}</h3><p class="ex-body">${rich(p[2])}</p></div></li>`).join('')}</ul>`;
    },
  };
  const prow = (q, id) => `<button type="button" class="ex-prow${S.visited.includes(id) ? ' is-done' : ''}" data-act="go" data-id="${id}"><span class="ex-prow-ic"><i class="i-new">${ic('sparkle', 18)}</i><i class="i-done">${ic('check', 18, 2.6)}</i></span><span class="ex-prow-q">${esc(q)}</span><span class="ex-prow-chev">${ic('chev', 18, 2.2)}</span></button>`;
  const mxCell = (c, k) => `<button type="button" class="ex-mx-cell" data-act="mx" data-i="${k}" aria-pressed="false">${esc(c[0])}</button>`;

  // ───────── Charts ─────────
  const PLOT = { x0: 40, x1: 292, y0: 14, y1: 136 };
  const px = (x) => PLOT.x0 + x * (PLOT.x1 - PLOT.x0), py = (y) => PLOT.y1 - y * (PLOT.y1 - PLOT.y0);
  function series(s) {
    const pts = [], dots = [], n = 90;
    const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    if (s.kind === 'bumps') for (let i = 0; i <= n; i++) { const x = i / n; pts.push([x, s.base + s.bumps.reduce((a, [c, amp, w]) => a + amp * Math.exp(-Math.pow((x - c) / w, 2)), 0)]); }
    else if (s.kind === 'decay') for (let i = 0; i <= n; i++) { const x = i / n; pts.push([x, s.floor + (1 - s.floor) * Math.exp(-s.k * x) + (s.rise || 0) * ss(0.42, 1, x)]); }
    else if (s.kind === 'fr') { let x = 0, y = 0.04; pts.push([x, y]); for (let c = 0; c < 5; c++) { x += 0.075; y += 0.17; pts.push([x, y]); dots.push([x, y]); x += 0.125; pts.push([x, y]); } }
    else if (s.kind === 'fi') { let y = 0.04; for (let c = 0; c < 5; c++) { for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push([c * 0.2 + t * 0.2, y + 0.15 * Math.pow(t, 2.6)]); } y += 0.15; dots.push([(c + 1) * 0.2, y]); } }
    else if (s.kind === 'vr' || s.kind === 'vi') {
      const top = s.kind === 'vr' ? 0.95 : 0.5, at = s.kind === 'vr' ? [0.06, 0.13, 0.31, 0.36, 0.58, 0.69, 0.75, 0.92] : [0.11, 0.34, 0.47, 0.8, 0.9];
      const f = (x) => 0.04 + (top - 0.04) * x; pts.push([0, f(0)], [1, f(1)]); at.forEach((x) => dots.push([x, f(x)]));
    }
    return { pts, dots };
  }
  function chartSVG(b, k) {
    const o = b.options[k], { pts, dots } = series(o.series);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${px(p[0]).toFixed(1)} ${py(Math.max(0, Math.min(1.02, p[1]))).toFixed(1)}`).join('');
    const area = `${d}L${px(1)} ${py(0)}L${px(0)} ${py(0)}Z`;
    let s = `<line class="ex-ax" x1="${PLOT.x0}" y1="${py(0)}" x2="${PLOT.x1}" y2="${py(0)}"/><line class="ex-ax" x1="${PLOT.x0}" y1="${PLOT.y0 - 4}" x2="${PLOT.x0}" y2="${py(0)}"/>`;
    if (b.baseline != null) s += `<line class="ex-dash" x1="${PLOT.x0}" y1="${py(b.baseline)}" x2="${PLOT.x1}" y2="${py(b.baseline)}"/><text class="ex-tx ex-tx-s" x="${PLOT.x1}" y="${py(b.baseline) - 6}" text-anchor="end">normal</text>`;
    (b.marks || []).forEach(([x, l]) => { s += `<line class="ex-mark" x1="${px(x)}" y1="${PLOT.y0}" x2="${px(x)}" y2="${py(0)}"/><text class="ex-tx ex-tx-b" x="${px(x)}" y="${py(0) + 15}" text-anchor="middle">${esc(l)}</text>`; });
    s += `<path class="ex-area" d="${area}"/><path class="ex-line" pathLength="1" d="${d}"/>`;
    dots.forEach(([x, y], i) => { s += `<circle class="ex-dot" style="animation-delay:${300 + i * 60}ms" cx="${px(x)}" cy="${py(y)}" r="4"/>`; });
    if (dots.length) s += `<circle class="ex-dot" cx="${PLOT.x0 + 8}" cy="${PLOT.y0 + 2}" r="4"/><text class="ex-tx ex-tx-s" x="${PLOT.x0 + 17}" y="${PLOT.y0 + 6}">reward</text>`;
    if (!b.marks) s += `<text class="ex-tx" x="${PLOT.x1}" y="${py(0) + 16}" text-anchor="end">${esc(b.xLabel)} →</text>`;
    s += `<text class="ex-tx" transform="translate(${PLOT.x0 - 12} ${py(0)}) rotate(-90)">${esc(b.yLabel)} →</text>`;
    return s;
  }
  // Fogg: x = ability (hard → easy), y = motivation (low → high)
  const FX = { x0: 42, x1: 292, y0: 12, y1: 150 };
  const fx = (a) => FX.x0 + a * (FX.x1 - FX.x0), fy = (m) => FX.y1 - m * (FX.y1 - FX.y0);
  const actionLine = (a) => 0.16 / (a + 0.04) - 0.05;
  const FOGG_DOT = { 'high-easy': [0.82, 0.82], 'high-hard': [0.2, 0.86], 'low-easy': [0.86, 0.26], 'low-hard': [0.2, 0.26] };
  function foggSVG() {
    const pts = []; for (let i = 0; i <= 60; i++) { const a = 0.12 + i / 60 * 0.88; pts.push([a, Math.min(1, actionLine(a))]); }
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${fx(p[0]).toFixed(1)} ${fy(p[1]).toFixed(1)}`).join('');
    const below = `${d}L${fx(1)} ${fy(0)}L${fx(0.12)} ${fy(0)}Z`;
    return `<path class="ex-fogg-below" d="${below}"/>
      <line class="ex-ax" x1="${FX.x0}" y1="${fy(0)}" x2="${FX.x1}" y2="${fy(0)}"/><line class="ex-ax" x1="${FX.x0}" y1="${FX.y0 - 4}" x2="${FX.x0}" y2="${fy(0)}"/>
      <path class="ex-fogg-line" d="${d}"/>
      <text class="ex-tx ex-tx-b" x="${fx(0.5)}" y="${fy(actionLine(0.5)) - 8}">Action line</text>
      <text class="ex-tx ex-tx-ok" x="${fx(0.5)}" y="${fy(0.62)}">Prompts work</text>
      <text class="ex-tx ex-tx-no" x="${fx(0.12) + 6}" y="${fy(0.06)}">Prompts fail</text>
      <text class="ex-tx" x="${FX.x1}" y="${fy(0) + 17}" text-anchor="end">Ability: hard → easy</text>
      <text class="ex-tx" transform="translate(${FX.x0 - 12} ${fy(0)}) rotate(-90)">Motivation: low → high</text>
      <g class="ex-fogg-dot" data-dot><circle r="15" class="ex-fogg-halo"/><circle r="8"/></g>`;
  }

  // ───────── Page ─────────
  function buildPage(node) {
    const f = FAM[node.cl] || FAM.mind, isRoot = node.id === ROOT;
    const parent = S.parentOf[node.id];
    const el = document.createElement('div');
    el.className = 'ex-page'; el.dataset.node = node.id;
    el.style.cssText = `--fd:${f[1]};--fm:${f[2]};--ft:${f[3]}`;
    const crumb = !isRoot && parent && N[parent]
      ? `<button type="button" class="ex-crumb" data-act="crumb">${ic('back', 15, 2.4)}<span>From <b>${esc(N[parent].label)}</b></span></button>` : '';
    const blocks = (node.blocks || []).map((b, k) => `<section class="ex-sec" data-block="${k}" data-type="${b.type}">${R[b.type](b)}</section>`).join('');
    const ponder = (node.ponder || []).map(([q, id]) => prow(q, id)).join('');
    el.innerHTML = `<div class="ex-inner">
      <div class="ex-hero">
        <div class="ex-meta">${crumb}<span class="ex-fam"><i></i>${f[0]}</span></div>
        <h1 class="ex-title">${esc(node.q)}</h1>
        <div class="ex-visual"><div class="ex-glow" aria-hidden="true"></div><div class="ex-brain" data-brain></div></div>
        <p class="ex-touch">${ic('hand', 15, 2)} Touch it</p>
        <p class="ex-answer">${rich(node.answer)}</p>
      </div>
      ${blocks}
      ${ponder ? `<section class="ex-sec ex-sec-ponder"><header class="ex-sec-head"><p class="ex-eyebrow">Keep pondering</p><h2 class="ex-h2">Where to go next</h2></header><div class="ex-ponder">${ponder}</div></section>` : ''}
      <p class="ex-foot">Cortex checks claims against named sources. Tap any glowing term to branch off.</p>
    </div>`;
    // initial states of interactive blocks
    el.querySelectorAll('.ex-sec[data-block]').forEach((sec) => {
      const b = node.blocks[+sec.dataset.block];
      if (b.type === 'fogg') setFogg(sec, b, false);
      if (b.type === 'streak') setStreak(sec, 0, false);
      if (b.type === 'reels') setReel(sec, b, 0, false);
    });
    el.querySelectorAll('[data-carousel]').forEach((car) => {
      let t = 0; car.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => { const i = Math.round(car.scrollLeft / stepW(car)); setStep(car.closest('.ex-sec'), i, { scroll: false, user: true }); }, 70); }, { passive: true });
    });
    el.addEventListener('scroll', () => { if (pop) closePop(); }, { passive: true });
    return el;
  }
  const stepW = (car) => { const c = car.querySelector('.ex-stage'); return c ? c.offsetWidth + 12 : 296; };
  const blockOf = (el) => { const sec = el.closest('.ex-sec'); const pg = el.closest('.ex-page'); return sec && pg ? [sec, N[pg.dataset.node].blocks[+sec.dataset.block], pg.dataset.node] : [null, null, null]; };
  const engage = (nodeId, sec) => credit(`b:${nodeId}:${sec.dataset.block}`, GAIN.block);

  // ───────── Block interactions ─────────
  function setStep(sec, i, o = {}) {
    const steps = sec.querySelectorAll('.ex-step'); i = Math.max(0, Math.min(steps.length - 1, i));
    const prev = +sec.querySelector('.ex-steps').style.getPropertyValue('--i');
    sec.querySelector('.ex-steps').style.setProperty('--i', i);
    steps.forEach((s, k) => { s.setAttribute('aria-selected', k === i); s.classList.toggle('is-past', k < i); });
    sec.querySelectorAll('.ex-stage').forEach((c, k) => c.classList.toggle('is-on', k === i));
    if (o.scroll !== false) { const car = sec.querySelector('[data-carousel]'); car.scrollTo({ left: i * stepW(car), behavior: smooth() }); }
    if (i !== prev) { Brain.pulse(); if (o.user) engage(sec.closest('.ex-page').dataset.node, sec); }
  }
  function pickGuess(sec, b, i, nodeId) {
    if (sec.classList.contains('is-answered')) return;
    sec.classList.add('is-answered');
    const right = i === b.answer;
    sec.querySelectorAll('.ex-opt').forEach((o, k) => {
      o.disabled = true;
      const mark = o.querySelector('.ex-opt-mark');
      if (k === b.answer) { o.classList.add('is-right'); mark.innerHTML = ic('check', 18, 2.6); }
      else if (k === i) { o.classList.add('is-wrong'); mark.innerHTML = ic('x', 18, 2.6); }
      else o.classList.add('is-dim');
      if (k === i) o.setAttribute('aria-pressed', 'true');
    });
    const rv = sec.querySelector('[data-reveal]');
    rv.innerHTML = `<div class="ex-reveal-card ${right ? 'ok' : 'no'}"><p class="ex-reveal-k">${ic(right ? 'check' : 'alert', 16, 2.6)}${right ? 'You got it' : 'Not quite'}</p><p class="ex-body">${rich(b.explain)}</p><button type="button" class="ex-link" data-act="guess-reset">Try again</button></div>`;
    Brain.pulse(); engage(nodeId, sec);
  }
  function resetGuess(sec) {
    sec.classList.remove('is-answered');
    sec.querySelectorAll('.ex-opt').forEach((o) => { o.disabled = false; o.classList.remove('is-right', 'is-wrong', 'is-dim'); o.removeAttribute('aria-pressed'); o.querySelector('.ex-opt-mark').innerHTML = ''; });
    sec.querySelector('[data-reveal]').innerHTML = '';
  }
  function setSeg(sec, act, i) {
    const s = sec.querySelector(`[data-act="${act}"]`).closest('.ex-seg, .ex-chips');
    if (s.classList.contains('ex-seg')) s.style.setProperty('--i', i);
    s.querySelectorAll('button').forEach((x, k) => x.setAttribute('aria-selected', k === i));
  }
  function setCompare(sec, b, i) {
    setSeg(sec, 'cmp', i);
    sec.querySelector('.ex-cmp').dataset.side = i;
    const v = sec.querySelector('[data-verdict]'); v.dataset.side = i;
    v.querySelector('span').textContent = b.verdict[i];
    v.classList.remove('is-pop'); void v.offsetWidth; v.classList.add('is-pop');
  }
  function setChart(sec, b, i) {
    setSeg(sec, 'chart', i);
    sec.querySelector('[data-svg]').innerHTML = chartSVG(b, i);
    const t = sec.querySelector('[data-text]'); t.innerHTML = rich(b.options[i].text); t.classList.remove('is-pop'); void t.offsetWidth; t.classList.add('is-pop');
  }
  function setFogg(sec, b, user) {
    const m = +(sec.querySelector('[data-act="fm"][aria-selected="true"]') || {}).dataset?.i || 0;
    const a = +(sec.querySelector('[data-act="fa"][aria-selected="true"]') || {}).dataset?.i || 0;
    const key = `${m ? 'high' : 'low'}-${a ? 'easy' : 'hard'}`, st = b.states[key], p = FOGG_DOT[key];
    const dot = sec.querySelector('[data-dot]');
    dot.style.transform = `translate(${fx(p[0])}px, ${fy(p[1])}px)`; dot.classList.toggle('is-no', !st[2]);
    const out = sec.querySelector('[data-out]');
    out.className = `ex-fogg-out ${st[2] ? 'ok' : 'no'}${user ? ' is-pop' : ''}`;
    out.innerHTML = `<span class="ex-fogg-badge">${ic(st[2] ? 'check' : 'x', 16, 2.8)}</span><div><b>${esc(st[0])}</b><p>${esc(st[1])}</p></div>`;
  }
  const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  function setStreak(sec, on, user) {
    setSeg(sec, 'freeze', on);
    const st = (k) => (k < 3 ? 'done' : k === 3 ? (on ? 'frozen' : 'miss') : on ? 'done' : 'lost');
    const icn = { done: 'flame', frozen: 'snow', miss: 'x', lost: 'minus' };
    sec.querySelector('[data-week]').innerHTML = WEEK.map((d, k) => `<div class="ex-day is-${st(k)}" style="animation-delay:${user ? k * 50 : 0}ms"><span class="ex-day-ic">${ic(icn[st(k)], 16, 2.4)}</span><span class="ex-day-n">${d}</span></div>`).join('');
    sec.querySelector('[data-out]').innerHTML = on
      ? `<p class="ex-streak-n"><b>6</b> day streak</p><p class="ex-body">The freeze covered Thursday. One miss didn’t end the habit, and the count kept its pull.</p>`
      : `<p class="ex-streak-n is-zero"><b>0</b> day streak</p><p class="ex-body">Thursday wiped out three days. This is where many people stop: it’s ruined anyway, so why bother?</p>`;
  }
  const SYM = { seven: '<b class="ex-sym7">7</b>', star: ic('star', 30, 2), diamond: ic('diamond', 30, 2) };
  const REEL_EDGE = ['diamond', 'star', 'seven'];
  function setReel(sec, b, i, user) {
    setSeg(sec, 'reel', i);
    const o = b.options[i];
    sec.querySelector('[data-reels]').innerHTML = o.reels.map((s, k) => {
      const below = i === 1 && k === 2 ? 'seven' : REEL_EDGE[(k + 1) % 3], above = REEL_EDGE[(k + 2) % 3];
      return `<div class="ex-reel${user ? ' is-spin' : ''}" style="animation-delay:${k * 90}ms"><span class="ex-reel-e">${SYM[above]}</span><span class="ex-reel-c is-${s}">${SYM[s]}</span><span class="ex-reel-e${i === 1 && k === 2 ? ' is-near' : ''}">${SYM[below]}</span></div>`;
    }).join('') + `<span class="ex-reel-line" aria-hidden="true"></span>`;
    const t = sec.querySelector('[data-text]'); t.innerHTML = `<b>${esc(o.label)}.</b> ${rich(o.text)}`;
  }
  function setApply(sec, b, i) {
    setSeg(sec, 'apply', i);
    const o = b.options[i];
    sec.querySelectorAll('.ex-loopcell').forEach((c, k) => {
      const miss = k === o.missing;
      c.className = `ex-loopcell ${miss ? 'is-miss' : 'is-ok'}`;
      c.querySelector('.ex-loopcell-ic').innerHTML = ic(miss ? 'alert' : 'check', 18, 2.4);
    });
    const w = sec.querySelector('[data-why]');
    w.className = 'ex-apply-why is-pop';
    w.innerHTML = `<b>Missing: ${esc(b.loop[o.missing])}.</b> ${esc(o.why)}`;
    let fix = sec.querySelector('.ex-fix');
    if (!fix) { fix = document.createElement('div'); fix.className = 'ex-fix'; sec.querySelector('[data-apply]').appendChild(fix); }
    fix.innerHTML = `<span class="ex-fix-ic">${ic('bolt', 18)}</span><div><p class="ex-fix-k">One fix to try</p><p class="ex-body">${esc(o.fix)}</p></div>`;
    fix.classList.remove('is-pop'); void fix.offsetWidth; fix.classList.add('is-pop');
  }
  function setMatrix(sec, b, i) {
    sec.querySelectorAll('.ex-mx-cell').forEach((c, k) => c.setAttribute('aria-pressed', k === i));
    const c = b.cells[i], tone = { good: ['check', 'ok'], mid: ['minus', 'mid'], bad: ['x', 'no'] }[c[2]];
    sec.querySelector('[data-out]').innerHTML = `<div class="ex-mx-res ${tone[1]} is-pop"><span class="ex-fogg-badge">${ic(tone[0], 16, 2.8)}</span><div><b>${esc(c[0])}</b><p>${esc(c[1])}</p></div></div>`;
  }

  // ───────── Sheets ─────────
  function openSheet(html, kind) {
    closePop();
    sheetBody.innerHTML = html; sheetBody.scrollTop = 0;
    sheetWrap.dataset.kind = kind || '';
    sheetWrap.classList.add('is-open'); sheetWrap.setAttribute('aria-hidden', 'false');
    setTimeout(() => { const f = sheetBody.querySelector('input'); if (f && !isStill()) f.focus({ preventScroll: true }); }, isStill() ? 0 : 420);
  }
  function closeSheet() {
    if (!sheetWrap.classList.contains('is-open')) return;
    sheetWrap.classList.remove('is-open'); sheetWrap.setAttribute('aria-hidden', 'true');
    const s = sheetWrap.querySelector('.ex-sheet'); s.style.transform = ''; s.style.transition = '';
  }
  function tileSheet(t) {
    const s = t.sheet;
    return `<div class="ex-sh-head"><span class="ex-tile ex-tile-88">${img(t.img)}</span><div><p class="ex-eyebrow">Reward type</p><h2 class="ex-sh-title">${esc(s.title)}</h2></div></div>
      <p class="ex-sh-lead">${rich(s.def)}</p>
      <div class="ex-facts">${s.facts.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>
      <h3 class="ex-sh-sub">In real products</h3>
      <div class="ex-exrows">${s.examples.map(([n, x]) => `<div class="ex-exrow"><span class="ex-mono">${esc(n[0])}</span><div><b>${esc(n)}</b><p>${rich(x)}</p></div></div>`).join('')}</div>`;
  }
  function caseSheet(c) {
    const n = N[c.node];
    return `<div class="ex-sh-hero">${img(c.img)}</div>
      <p class="ex-eyebrow">Real case</p><h2 class="ex-sh-title">${esc(c.name)}</h2>
      <p class="ex-sh-lead ex-sh-story">${rich(c.story)}</p>
      <div class="ex-steal"><p class="ex-steal-k">${ic('bolt', 16)} What to steal for your product</p><p>${esc(c.steal)}</p></div>
      ${n ? prow(`Dive deeper: ${n.q}`, n.id) : ''}`;
  }
  function composeSheet() {
    const sug = (N[ROOT].suggest || []).concat((cur.ponder || []).map(([q, id]) => [q, id])).filter(([, id]) => id !== cur.id);
    const seen = new Set(), list = sug.filter(([, id]) => !seen.has(id) && seen.add(id)).slice(0, 3);
    return `<p class="ex-eyebrow">Ask a follow-up</p><h2 class="ex-sh-title">What are you wondering?</h2>
      <form class="ex-ask" data-ask autocomplete="off"><label class="ex-sr" for="exAsk">Your question</label><input id="exAsk" name="q" type="text" placeholder="Type your own question…" enterkeyhint="send"><button type="submit" class="ex-ask-go" aria-label="Ask" disabled>${ic('up', 20, 2.4)}</button></form>
      <h3 class="ex-sh-sub">Or try one of these</h3>
      <div class="ex-ponder">${list.map(([q, id]) => prow(q, id)).join('')}</div>`;
  }

  // ───────── Term popover ─────────
  function localRect(el) {
    const L = root.getBoundingClientRect(), k = L.width / root.offsetWidth, r = el.getBoundingClientRect();
    return { left: (r.left - L.left) / k, top: (r.top - L.top) / k, width: r.width / k, height: r.height / k };
  }
  function openPop(btn) {
    const id = btn.dataset.term, t = C.terms[id]; if (!t) return;
    closePop();
    const here = cur && cur.id === id, done = S.visited.includes(id);
    pop = document.createElement('div'); pop.className = 'ex-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', t.label);
    pop.innerHTML = `<p class="ex-pop-k"><span class="ex-term-ic">${ic(done ? 'check' : 'sparkle', 14, 2.3)}</span>${esc(t.label)}</p><p class="ex-pop-def">${esc(t.def)}</p>
      ${here ? `<p class="ex-pop-here">${ic('check', 15, 2.6)} You’re exploring this now</p>` : `<div class="ex-pop-row"><button type="button" class="ex-lit ex-lit-sm" data-act="dive" data-id="${id}">${ic('sparkle', 16)} <span>${done ? 'Open again' : 'Dive deeper'}</span></button>${done ? `<span class="ex-pop-done">${ic('check', 14, 2.6)} Explored</span>` : ''}</div>`}`;
    root.appendChild(pop);
    const r = localRect(btn), W = 296, H = pop.offsetHeight;
    const left = Math.max(16, Math.min(368 - 16 - W, r.left + r.width / 2 - W / 2));
    const below = r.top + r.height + 10 + H < 822 - 120;
    const top = below ? r.top + r.height + 10 : r.top - 10 - H;
    pop.style.left = left + 'px'; pop.style.top = Math.max(110, top) + 'px'; pop.style.width = W + 'px';
    pop.style.setProperty('--ox', `${r.left + r.width / 2 - left}px`); pop.classList.add(below ? 'is-below' : 'is-above');
    S.popTerm = id; btn.classList.add('is-open'); pop._btn = btn;
    requestAnimationFrame(() => pop && pop.classList.add('is-in')); if (isStill()) pop.classList.add('is-in');
    credit(`t:${id}`, GAIN.term);
  }
  function closePop() {
    if (!pop) return; const p = pop; pop = null; S.popTerm = null;
    if (p._btn) p._btn.classList.remove('is-open');
    p.classList.remove('is-in'); setTimeout(() => p.remove(), isStill() ? 0 : 180);
  }

  // ───────── Meter ─────────
  function credit(key, amt) {
    if (S.credited.has(key)) return;
    S.credited.add(key); setMeter(S.value + amt);
  }
  function setMeter(v) {
    v = Math.max(0, Math.min(1, Math.round(v * 100) / 100));
    const changed = v !== S.value; S.value = v; renderMeter();
    if (changed) emitMeter();
    if (v >= 1 && !S.celebrated) { S.celebrated = true; setTimeout(showCelebrate, isStill() ? 0 : 700); }
  }
  const emitMeter = () => Bus.emit('meter', { value: S.value, explored: S.visited.length });
  function renderMeter() {
    const pct = Math.round(S.value * 100);
    meterBtn.querySelector('b').textContent = pct + '%';
    meterBtn.querySelector('.ex-meter-bar i').style.transform = `scaleX(${S.value})`;
    meterBtn.classList.toggle('is-full', S.value >= 1);
    meterBtn.setAttribute('aria-label', `Pondering ${pct}%. How it fills`);
    if (meterBtn.dataset.last !== String(pct)) { meterBtn.classList.remove('is-bump'); void meterBtn.offsetWidth; if (meterBtn.dataset.last) meterBtn.classList.add('is-bump'); meterBtn.dataset.last = pct; }
    if (meterInfo.classList.contains('is-open')) fillMeterInfo();
  }
  function fillMeterInfo() {
    const n = S.visited.length;
    meterInfo.innerHTML = `<p class="ex-mi-t">Your pondering meter</p><p class="ex-mi-s">Explore, interact and dive deeper to fill it.</p>
      <ul><li><span>${ic('tap', 16)}</span>Try a block<b>+7%</b></li><li><span>${ic('sparkle', 16)}</span>Peek at a glowing term<b>+3%</b></li><li><span>${ic('route', 16)}</span>Dive into a new idea<b>+12%</b></li></ul>
      <p class="ex-mi-f">${Math.round(S.value * 100)}% so far · ${n} idea${n === 1 ? '' : 's'} explored</p>`;
  }
  function toggleMeterInfo(force) {
    const open = force != null ? force : !meterInfo.classList.contains('is-open');
    if (open && S.value >= 1) { showCelebrate(); return; }
    if (open) fillMeterInfo();
    meterInfo.classList.toggle('is-open', open); meterBtn.setAttribute('aria-expanded', open);
  }
  function glyph(shape, palette, n) {
    const pal = Brain.palette(palette), pts = Brain.sample(shape, n);
    return `<svg viewBox="-1.15 -1.15 2.3 2.3" aria-hidden="true">${pts.map(([x, y, d]) => { const c = pal[0].map((v, j) => Math.round(v + (pal[1][j] - v) * d)); return `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${(0.018 + 0.02 * d).toFixed(3)}" fill="rgb(${c})" opacity="${(0.45 + 0.55 * d).toFixed(2)}"/>`; }).join('')}</svg>`;
  }
  function showCelebrate() {
    toggleMeterInfo(false);
    const n = S.visited.length;
    celebrate.innerHTML = `<button type="button" class="ex-done-x" data-act="done-x" aria-label="Hide for now">${ic('x', 18, 2.4)}</button>
      <div class="ex-done-glyph">${glyph('brain', 'cobalt', 260)}</div>
      <p class="ex-done-t">That’s a great pondering session.</p>
      <p class="ex-done-s">You explored ${n} idea${n === 1 ? '' : 's'}.</p>
      <button type="button" class="ex-lit" data-act="session"><span>See what you explored</span></button>`;
    celebrate.classList.add('is-on'); Brain.pulse();
  }
  const hideCelebrate = () => celebrate.classList.remove('is-on');

  // ───────── Navigation ─────────
  const payload = (id) => ({ id, label: N[id].label, question: N[id].q, parent: S.parentOf[id] ?? null, shape: N[id].shape, palette: N[id].palette });
  function go(id, dir = 'fwd', o = {}) {
    if (!N[id]) return;
    closePop(); closeSheet(); toggleMeterInfo(false);
    if (cur && cur.id === id) { page.scrollTo({ top: 0, behavior: smooth() }); return; }
    if (o.push !== false && cur) hist.push(cur.id);
    const first = !S.visited.includes(id);
    if (first) { S.visited.push(id); S.parentOf[id] = o.parent !== undefined ? o.parent : cur ? cur.id : null; }
    cur = N[id];
    showPage(cur, dir);
    backBtn.innerHTML = id === ROOT && !hist.length ? ic('x', 20, 2.2) : ic('back', 22, 2.4);
    backBtn.setAttribute('aria-label', hist.length ? 'Back' : 'Close');
    saveBtn.classList.toggle('is-on', S.saved.has(id)); saveBtn.setAttribute('aria-pressed', S.saved.has(id));
    refreshTerms();
    Bus.emit('node:open', payload(id));
    if (first && id !== ROOT) credit(`d:${id}`, GAIN.dive); else emitMeter();
  }
  function showPage(node, dir) {
    const el = buildPage(node), old = page;
    pagesEl.appendChild(el); page = el;
    Brain.moveTo(el.querySelector('[data-brain]'));
    Brain.setShape(node.shape, node.palette, 1400); Brain.pulse();
    if (!old) return;
    if (isStill() || dir === 'none') { old.remove(); return; }
    el.classList.add(`in-${dir}`); old.classList.add(`out-${dir}`);
    void el.offsetWidth; el.classList.remove(`in-${dir}`);
    setTimeout(() => old.remove(), 620);
  }
  function back() {
    if (hist.length) go(hist.pop(), 'back', { push: false });
    else toast('Back to Ask home');
  }
  function restoreBrain() {
    if (!page || !cur) return;
    Brain.moveTo(page.querySelector('[data-brain]'));
    Brain.setShape(cur.shape, cur.palette, 900);
  }
  function reset() {
    closePop(); closeSheet(); toggleMeterInfo(false); hideCelebrate();
    S = fresh(); hist = []; cur = null;
    pagesEl.innerHTML = ''; page = null;
    Brain.setDark(false); Brain.setSpin(false); Brain.setMode('idle'); Brain.setLobes(0);
    renderMeter();
    go(ROOT, 'none');
  }

  // ───────── Clicks (one delegated handler) ─────────
  function onClick(e) {
    const t = e.target.closest('[data-act]');
    if (pop && !e.target.closest('.ex-pop') && !(t && t.dataset.act === 'term')) closePop();
    if (meterInfo.classList.contains('is-open') && !e.target.closest('.ex-meterinfo') && !(t && t.dataset.act === 'meter')) toggleMeterInfo(false);
    if (!t || t.disabled) return;
    const act = t.dataset.act, i = +t.dataset.i;
    const [sec, b, nodeId] = blockOf(t);
    switch (act) {
      case 'back': back(); break;
      case 'crumb': { const p = S.parentOf[cur.id]; if (hist[hist.length - 1] === p) back(); else go(p, 'back'); break; }
      case 'save': {
        const on = !S.saved.has(cur.id); on ? S.saved.add(cur.id) : S.saved.delete(cur.id);
        saveBtn.classList.toggle('is-on', on); saveBtn.setAttribute('aria-pressed', on); toast(on ? 'Saved' : 'Removed from saved'); break;
      }
      case 'meter': toggleMeterInfo(); break;
      case 'term': if (pop && pop._btn === t) closePop(); else openPop(t); break;
      case 'dive': go(t.dataset.id, 'fwd'); break;
      case 'go': go(t.dataset.id, 'fwd'); break;
      case 'step': setStep(sec, i, { user: true }); break;
      case 'guess': pickGuess(sec, b, i, nodeId); break;
      case 'guess-reset': resetGuess(sec); break;
      case 'tile': { t.classList.add('is-seen'); openSheet(tileSheet(b.items[i]), 'tile'); engage(nodeId, sec); break; }
      case 'case': { t.classList.add('is-seen'); openSheet(caseSheet(b.items[i]), 'case'); engage(nodeId, sec); break; }
      case 'cmp': setCompare(sec, b, i); engage(nodeId, sec); break;
      case 'chart': setChart(sec, b, i); Brain.pulse(); engage(nodeId, sec); break;
      case 'fm': case 'fa': setSeg(sec, act, i); setFogg(sec, b, true); Brain.pulse(); engage(nodeId, sec); break;
      case 'freeze': setStreak(sec, i, true); engage(nodeId, sec); break;
      case 'reel': setReel(sec, b, i, true); Brain.pulse(); engage(nodeId, sec); break;
      case 'apply': setApply(sec, b, i); Brain.pulse(); engage(nodeId, sec); break;
      case 'mx': setMatrix(sec, b, i); engage(nodeId, sec); break;
      case 'compose': openSheet(composeSheet(), 'compose'); break;
      case 'sheet-close': closeSheet(); break;
      case 'done-x': hideCelebrate(); break;
      case 'session': {
        hideCelebrate();
        Bus.emit('session:done', { nodes: S.visited.map((id) => ({ id, label: N[id].label, question: N[id].q, shape: N[id].shape, palette: N[id].palette, img: N[id].img })) });
        break;
      }
    }
  }

  // ───────── Mount ─────────
  function mount(layerEl) {
    layer = layerEl;
    root = document.createElement('div'); root.className = 'ex-root';
    root.innerHTML = `
      <div class="ex-pages" data-pages></div>
      <header class="ex-bar">
        <button type="button" class="ex-round" data-act="back" aria-label="Close">${ic('x', 20, 2.2)}</button>
        <button type="button" class="ex-meter" data-act="meter" aria-expanded="false"><span class="ex-meter-l">Pondering · <b>0%</b></span><span class="ex-meter-bar" aria-hidden="true"><i></i></span></button>
        <button type="button" class="ex-round" data-act="save" aria-label="Save" aria-pressed="false">${ic('bookmark', 20, 2.2)}</button>
      </header>
      <div class="ex-meterinfo" role="status"></div>
      <div class="ex-fade" aria-hidden="true"></div>
      <div class="ex-done" role="status"></div>
      <button type="button" class="ex-composer" data-act="compose"><span class="ex-composer-ic">${ic('sparkle', 18)}</span><span class="ex-composer-t">Ask a follow-up…</span></button>
      <div class="ex-sheetwrap" aria-hidden="true">
        <div class="ex-backdrop" data-act="sheet-close"></div>
        <div class="ex-sheet" role="dialog" aria-modal="true">
          <div class="ex-grab-zone"><span class="ex-grab"></span></div>
          <button type="button" class="ex-sheet-x" data-act="sheet-close" aria-label="Close">${ic('x', 18, 2.4)}</button>
          <div class="ex-sheet-body"></div>
        </div>
      </div>`;
    layer.appendChild(root);
    pagesEl = root.querySelector('[data-pages]');
    [backBtn, , saveBtn] = root.querySelectorAll('.ex-bar > button'); meterBtn = root.querySelector('.ex-meter');
    meterInfo = root.querySelector('.ex-meterinfo'); celebrate = root.querySelector('.ex-done');
    sheetWrap = root.querySelector('.ex-sheetwrap'); sheetBody = root.querySelector('.ex-sheet-body');
    root.addEventListener('click', onClick);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePop(); closeSheet(); toggleMeterInfo(false); } });
    // Ask form
    root.addEventListener('input', (e) => { if (e.target.id === 'exAsk') root.querySelector('.ex-ask-go').disabled = !e.target.value.trim(); });
    root.addEventListener('submit', (e) => {
      if (!e.target.matches('[data-ask]')) return; e.preventDefault();
      const f = e.target.q; if (!f.value.trim()) return;
      f.value = ''; e.target.querySelector('.ex-ask-go').disabled = true; f.blur(); closeSheet();
      toast('In the app, Cortex would explore this live');
    });
    // Drag the sheet down to dismiss
    const sheet = root.querySelector('.ex-sheet'), zone = root.querySelector('.ex-grab-zone');
    let y0 = null, dy = 0;
    zone.addEventListener('pointerdown', (e) => { y0 = e.clientY; dy = 0; zone.setPointerCapture(e.pointerId); sheet.style.transition = 'none'; });
    zone.addEventListener('pointermove', (e) => { if (y0 == null) return; dy = Math.max(0, (e.clientY - y0) / (window.PS || 1)); sheet.style.transform = `translateY(${dy}px)`; });
    const end = () => { if (y0 == null) return; y0 = null; sheet.style.transition = ''; if (dy > 90) closeSheet(); else sheet.style.transform = ''; };
    zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);

    Bus.on('map:goto', (d) => { if (d && N[d.id]) go(d.id, 'fwd'); });
    Bus.on('map:state', (d) => { if (d && d.open) { closePop(); closeSheet(); toggleMeterInfo(false); } else restoreBrain(); });
    Bus.on('reset', reset);
  }

  function start() {
    Brain.setDark(false); Brain.setSpin(false); Brain.setMode('idle');
    go(ROOT, 'none');
    testHooks();
  }

  // ───────── URL params for headless screenshots (see report) ─────────
  function testHooks() {
    const q = (s) => page.querySelector(s);
    const path = (P.get('path') || '').split(',').filter((id) => N[id]);
    path.forEach((id) => go(id, 'fwd'));
    if (P.get('ex') && N[P.get('ex')]) go(P.get('ex'), 'fwd');
    if (P.has('act')) {
      const a = P.get('act');
      const click = (s) => { const el = q(s); if (el) el.click(); };
      if (cur.id === ROOT) {
        click('[data-act="step"][data-i="2"]'); click(`[data-act="guess"][data-i="${a === 'right' ? 2 : 0}"]`);
        click('[data-act="cmp"][data-i="1"]'); click('[data-act="apply"][data-i="1"]');
      } else {
        click('[data-act="chart"][data-i="1"]'); click('[data-act="fm"][data-i="1"]'); click('[data-act="freeze"][data-i="1"]');
        click('[data-act="reel"][data-i="1"]'); click('[data-act="mx"][data-i="0"]'); click('[data-act="guess"][data-i="1"]');
      }
    }
    if (P.has('scroll')) page.scrollTop = +P.get('scroll');
    if (P.has('meter')) setMeter(+P.get('meter') / 100);
    if (P.get('pop')) { const t = q(`[data-term="${P.get('pop')}"]`); if (t) { t.scrollIntoView({ block: 'center' }); setTimeout(() => openPop(t), 120); } }
    const sh = P.get('sheet');
    if (sh === 'compose') openSheet(composeSheet(), 'compose');
    else if (sh) { const [k, i] = sh.split(':'); const el = q(`[data-act="${k}"][data-i="${i || 0}"]`); if (el) el.click(); }
    if (P.has('info')) toggleMeterInfo(true);
  }

  window.Explore = { mount, start };
})();
