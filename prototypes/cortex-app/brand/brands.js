// Brand explorations: 4 names × 4 premium styles. Each brand renders a brand card + 3 phone screens.
(function () {
  // ---------- Shared content ----------
  const STYLES = [
    { id: 'quick', t: 'Quick bites', s: 'Short pieces, a few minutes each.', shape: 'bites' },
    { id: 'connect', t: 'Connect the dots', s: 'See how each idea links to the next.', shape: 'web' },
    { id: 'roadmap', t: 'Full roadmap', s: 'One clear path, from start to finish.', shape: 'path' },
  ];
  const STOPS = [
    { t: 'The pump that never stops', m: '6 min', st: 'done' },
    { t: 'Four rooms and four doors', m: '7 min', st: 'done' },
    { t: 'The spark that starts each beat', m: '6 min', st: 'current' },
    { t: 'Two circuits: lungs and body', m: '8 min', st: 'locked' },
    { t: 'Quick review', m: '5 questions', st: 'locked', kind: 'review' },
    { t: 'Blood pressure, explained', m: '6 min', st: 'locked' },
    { t: 'Final challenge', m: 'Finish to get your gift', st: 'locked', kind: 'final' },
  ];
  const TABS = ['Learn', 'Ask', 'Profile'];

  // ---------- Small line icons ----------
  const P = {
    check: 'M5 12.5l4.2 4.2L19 7',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13z',
    down: 'M6 9l6 6 6-6',
    right: 'M5 12h14M13 6l6 6-6 6',
    back: 'M15 5l-7 7 7 7',
    learn: 'M4 5h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v13h-6a2 2 0 0 0-2 2 2 2 0 0 0-2-2H4z',
    ask: 'M4 5h16v11H9l-5 4z',
    profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    gift: 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0',
    play: 'M8 5v14l11-7z',
  };
  const ic = (n, s = 20, w = 2) => `<svg class="br-ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
  const tabIcon = { Learn: 'learn', Ask: 'ask', Profile: 'profile' };
  const status = () => `<div class="br-status"><span class="br-time">9:41</span><span class="br-island"></span><span class="br-sys"><svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden="true"><rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/><rect x="24" y="4" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".45"/></svg></span></div>`;
  const toastEl = '<div class="br-toast" role="status" aria-live="polite"></div>';
  const phone = (n, cap, inner, cls) => `<figure class="br-phone-wrap"><figcaption class="br-cap"><span class="br-cap-n">0${n}</span>${cap}</figcaption><div class="br-phone"><div class="br-screen ${cls}" data-screen="${n}">${status()}${inner}${toastEl}<div class="br-home"></div></div></div></figure>`;
  const selIdx = (b) => STYLES.findIndex((s) => s.id === b.sel);
  const stopIcon = (s) => s.st === 'done' ? ic('check', 22, 2.6) : s.st === 'current' ? ic('play', 20, 0) : s.kind === 'final' ? ic('gift', 20, 1.8) : ic('lock', 18, 2);

  // ---------- Brand definitions ----------
  const BRANDS = [
    {
      key: 'cx', name: 'Cortex', style: 'Living Matter', sel: 'connect',
      adjectives: ['Warm', 'Alive', 'Tactile'],
      type: [['Fraunces', 'Display · soft optical serif', '"Fraunces"'], ['Figtree', 'Text · rounded grotesk', '"Figtree"']],
      palette: [['Bone', '#F6ECE1'], ['Shell', '#FFF8F1'], ['Humus', '#2B1A12'], ['Bark', '#6A4636'], ['Ember', '#B83A1C'], ['Coral', '#F07B5A'], ['Saffron', '#EFB43E']],
      why: ['Cortex is the one name that already means a mind, so it keeps the brain, but as living tissue instead of a diagram.',
        'The character is a colony of backlit cells: they breathe, reach toward your finger, and regrow into any icon you are curious about.'],
      welcome: 'brain', heart: 'heart',
      cycle: [['brain', 'a brain'], ['i-heart', 'a heart'], ['i-planet', 'a planet'], ['i-leaf', 'a leaf'], ['i-bulb', 'an idea']],
    },
    {
      key: 'cu', name: 'Curious', style: 'Future Gallery', sel: 'quick',
      adjectives: ['Quiet', 'Considered', 'Open'],
      type: [['Instrument Serif', 'Display · condensed editorial serif', '"Instrument Serif"'], ['Geist', 'Text · neutral grotesk', '"Geist"']],
      palette: [['Gallery', '#F8F7F4'], ['Paper', '#FFFFFF'], ['Ink', '#111111'], ['Graphite', '#55544F'], ['Hairline', '#E2E0D9'], ['Klein', '#002FA7']],
      why: ['Curious names a feeling, not a thing, so the design steps back and lets one idea sit on the wall at a time.',
        'The character is stippled in ink on paper and hung like a work in a show, with a small label beside it.'],
      welcome: 'sphere', heart: 'heart',
    },
    {
      key: 'rh', name: 'Rabbit hole', style: 'Liquid Glass', sel: 'connect',
      adjectives: ['Playful', 'Deep', 'Iridescent'],
      type: [['Bricolage Grotesque', 'Display · characterful grotesk', '"Bricolage Grotesque"'], ['Manrope', 'Text · open geometric sans', '"Manrope"']],
      palette: [['Night', '#120B33'], ['Dusk', '#2A1560'], ['Pearl', '#F6EEFF'], ['Magenta', '#FF5FA2'], ['Cyan', '#5BE2FF'], ['Lime', '#C8F36A']],
      why: ['A rabbit hole is the moment one question pulls you into the next, so the whole product is about depth.',
        'Glass gives that depth for free: layers you see through, light that bends, and a tunnel of glass beads that pours inward.'],
      welcome: 'vortex', heart: 'heart',
    },
    {
      key: 'pm', name: 'Polymath', style: 'Precision Instrument', sel: 'roadmap',
      adjectives: ['Exact', 'Calm', 'Capable'],
      type: [['Space Grotesk', 'Display · technical grotesk', '"Space Grotesk"'], ['JetBrains Mono', 'Readouts · monospace', '"JetBrains Mono"']],
      palette: [['Carbon', '#0B0D10'], ['Panel', '#14171C'], ['Rule', '#2A3039'], ['Signal', '#E8EAED'], ['Dim', '#9AA3AE'], ['Amber', '#FFB020'], ['Cobalt', '#4C86FF']],
      why: ['A polymath works across many fields and wants to know exactly where they stand, so the app becomes a well-made instrument.',
        'The character is a field of sample points on a grid, swept by a scan line. Touch it and you get a crosshair and coordinates.'],
      welcome: 'globe', heart: 'heart',
    },
  ];

  // ---------- Brand card ----------
  const lum = (h) => { const c = [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16) / 255).map((v) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  function card(b, i) {
    return `<section class="br-card">
      <div class="br-card-id"><span class="br-card-n">0${i + 1} / 04</span><h1 class="br-card-name">${b.name}</h1><p class="br-card-style">× ${b.style}</p></div>
      <div class="br-card-col"><h2 class="br-card-h">Feels</h2><ul class="br-adj">${b.adjectives.map((a) => `<li>${a}</li>`).join('')}</ul>
        <h2 class="br-card-h">Type</h2><ul class="br-type">${b.type.map(([n, r, f]) => `<li><span class="br-type-n" style="font-family:${f}">${n}</span><span class="br-type-r">${r}</span></li>`).join('')}</ul></div>
      <div class="br-card-col"><h2 class="br-card-h">Palette</h2><ul class="br-pal">${b.palette.map(([n, h]) => `<li><span class="br-sw" style="background:${h};color:${lum(h) > 0.35 ? '#111' : '#fff'}"></span><span class="br-pal-n">${n}</span><span class="br-pal-h">${h}</span></li>`).join('')}</ul></div>
      <div class="br-card-col br-card-why"><h2 class="br-card-h">Why this name × style</h2>${b.why.map((w) => `<p>${w}</p>`).join('')}</div>
    </section>`;
  }

  // ---------- Per-brand screens ----------
  const S = {};

  // ===== 1 · Cortex × Living Matter =====
  S.cx = {
    welcome: (b) => `
      <div class="br-cx-glow"></div>
      <div class="br-cx-char"><canvas data-char="welcome" aria-label="The Cortex character, a colony of living cells"></canvas></div>
      <p class="br-cx-now" aria-live="polite">Right now, <em data-now>a brain</em></p>
      <div class="br-cx-foot">
        <h2 class="br-cx-word">cortex</h2>
        <p class="br-cx-promise">Learn anything you’re curious about, and watch what you know grow.</p>
        <button class="br-cx-btn" data-toast="Next: how do you like to learn?">Get started</button>
        <button class="br-cx-link" data-toast="Sign in is out of scope here">I already have an account</button>
      </div>`,
    style: (b) => `
      <div class="br-cx-bar"><button class="br-cx-round" aria-label="Back" data-toast="Back to welcome">${ic('back', 20)}</button>
        <div class="br-cx-steps" aria-label="Step 2 of 5">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= 2 ? 'on' : ''}"></i>`).join('')}</div><span class="br-cx-bar-sp"></span></div>
      <h2 class="br-cx-title">How do you like to learn?</h2>
      <p class="br-cx-sub">Pick one. You can change it any time.</p>
      <div class="br-cx-char br-cx-char-sm"><canvas data-char="style"></canvas></div>
      <div class="br-cx-opts" role="radiogroup" aria-label="Learning style">${STYLES.map((s, k) => `
        <button class="br-cx-opt" role="radio" data-style="${k}" aria-checked="${k === selIdx(b)}">
          <span class="br-cx-opt-glyph">${glyph(s.id)}</span>
          <span class="br-cx-opt-txt"><b>${s.t}</b><span>${s.s}</span></span>
          <span class="br-cx-opt-tick">${ic('check', 16, 2.6)}</span></button>`).join('')}</div>
      <button class="br-cx-btn br-cx-btn-dark" data-toast="Next: what do you want to learn?">Continue</button>`,
    learn: (b) => `
      <header class="br-cx-lh">
        <div><button class="br-cx-switch" data-toast="Your courses: 1 of 3 on the free plan">How your heart works ${ic('down', 18, 2.4)}</button>
        <p class="br-cx-meta">Lesson 3 of 12 · 2 done</p>
        <div class="br-cx-prog"><i style="width:17%"></i></div></div>
        <div class="br-cx-mini"><canvas data-char="learn"></canvas></div>
      </header>
      <div class="br-cx-road">${vine()}${STOPS.map((s, k) => `
        <div class="br-cx-stop br-cx-${s.st}" style="--x:${stopX(k)}px">
          <button class="br-cx-node" aria-label="${s.t}, ${s.st}" data-toast="${s.st === 'locked' ? 'Finish the earlier lessons first' : s.st === 'done' ? 'Replay: ' + s.t : 'Starting lesson 3'}">${stopIcon(s)}</button>
          <div class="br-cx-lbl"><span class="br-cx-lbl-k">${s.kind === 'review' ? 'Review' : s.kind === 'final' ? 'Finale' : 'Lesson ' + (k < 4 ? k + 1 : k)}</span><b>${s.t}</b><span>${s.m}</span>
          ${s.st === 'current' ? `<button class="br-cx-btn br-cx-btn-sm" data-toast="Starting lesson 3">Start</button>` : ''}</div>
        </div>`).join('')}</div>
      ${tabbar('cx')}`,
  };
  const stopX = (k) => Math.round(34 + 26 * Math.sin(k * 1.15));
  function vine() { // organic path through every stop
    let y = 0; const pts = STOPS.map((st, k) => { const h = st.st === 'current' ? 156 : 92; const pt = [stopX(k) + 32, y + h / 2]; y += h; return pt; });
    let d = `M${pts[0][0]} ${pts[0][1]}`; for (let k = 1; k < pts.length; k++) { const a = pts[k - 1], c = pts[k], my = (a[1] + c[1]) / 2; d += ` C${a[0]} ${my} ${c[0]} ${my} ${c[0]} ${c[1]}`; }
    let dd = `M${pts[0][0]} ${pts[0][1]}`; for (let k = 1; k <= 2; k++) { const a = pts[k - 1], c = pts[k], my = (a[1] + c[1]) / 2; dd += ` C${a[0]} ${my} ${c[0]} ${my} ${c[0]} ${c[1]}`; }
    return `<svg class="br-cx-vine" width="140" height="${pts[pts.length - 1][1] + 40}" aria-hidden="true"><path d="${d}" class="br-cx-vine-rest"/><path d="${dd}" class="br-cx-vine-done"/></svg>`;
  }
  function glyph(id) { // tiny diagrams of each learning format
    if (id === 'quick') return `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">${[[7, 8], [17, 7], [9, 18], [20, 18], [14, 13]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="currentColor"/>`).join('')}</svg>`;
    if (id === 'connect') return `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M14 14L6 7M14 14l9-5M14 14l-5 9M14 14l8 8M6 7l3 16"/>${[[14, 14, 3.4], [6, 7, 2.4], [23, 9, 2.4], [9, 23, 2.4], [22, 22, 2.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`).join('')}</svg>`;
    return `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 24c0-6 16-4 16-10S6 10 6 4"/><circle cx="6" cy="24" r="2.6" fill="currentColor"/><circle cx="22" cy="14" r="2.6" fill="currentColor"/><circle cx="6" cy="4" r="2.6" fill="currentColor"/></svg>`;
  }
  function tabbar(p) {
    return `<nav class="br-${p}-tabs" aria-label="Tabs">${TABS.map((t, k) => `<button class="br-${p}-tab" ${k === 0 ? 'aria-current="page"' : ''} data-toast="${k === 0 ? 'You are on Learn' : t + ' is built by another module'}">${p === 'pm' ? '' : ic(tabIcon[t], 20, 1.9)}<span>${p === 'pm' ? t.toUpperCase() : t}</span></button>`).join('')}</nav>`;
  }

  // ===== 2 · Curious × Future Gallery =====
  S.cu = {
    welcome: () => `
      <div class="br-cu-top"><span class="br-cu-label">Curious</span><span class="br-cu-label">No. 001</span></div>
      <figure class="br-cu-art"><div class="br-cu-frame"><canvas data-char="welcome" aria-label="The Curious character, stippled in ink"></canvas></div>
        <figcaption><span><i>Fig. 1</i> Curiosity, at rest</span><span>Ink on paper, 2,600 dots. Touch to disturb.</span></figcaption></figure>
      <div class="br-cu-foot">
        <h2 class="br-cu-word">Curious</h2>
        <p class="br-cu-promise">Follow any question as far as it goes.</p>
        <button class="br-cu-btn" data-toast="Next: how do you like to learn?"><span>Get started</span>${ic('right', 20, 1.6)}</button>
        <button class="br-cu-link" data-toast="Sign in is out of scope here">I already have an account</button>
      </div>`,
    style: (b) => `
      <div class="br-cu-top"><button class="br-cu-back" data-toast="Back to welcome">${ic('back', 16, 1.6)}<span>Back</span></button><span class="br-cu-label br-cu-num">02 / 05</span></div>
      <h2 class="br-cu-title">How do you like to learn?</h2>
      <figure class="br-cu-art br-cu-art-sm"><div class="br-cu-frame"><canvas data-char="style"></canvas></div>
        <figcaption><span><i>Fig. 2</i> <span data-figname>${STYLES[selIdx(b)].t}</span></span></figcaption></figure>
      <div class="br-cu-opts" role="radiogroup" aria-label="Learning style">${STYLES.map((s, k) => `
        <button class="br-cu-opt" role="radio" data-style="${k}" aria-checked="${k === selIdx(b)}">
          <span class="br-cu-opt-n">${['I', 'II', 'III'][k]}.</span><span class="br-cu-opt-txt"><b>${s.t}</b><span>${s.s}</span></span></button>`).join('')}</div>
      <button class="br-cu-btn" data-toast="Next: what do you want to learn?"><span>Continue</span>${ic('right', 20, 1.6)}</button>`,
    learn: () => `
      <header class="br-cu-lh">
        <div class="br-cu-lh-txt"><span class="br-cu-label">Now showing</span>
          <button class="br-cu-switch" data-toast="Your courses: 1 of 3 on the free plan">How your heart works ${ic('down', 18, 1.6)}</button>
          <p class="br-cu-meta">12 rooms · about two weeks · 2 seen</p></div>
        <div class="br-cu-frame br-cu-mini"><canvas data-char="learn"></canvas></div>
      </header>
      <ol class="br-cu-list">${STOPS.map((s, k) => `
        <li class="br-cu-row br-cu-${s.st}">
          <span class="br-cu-row-n">${String(k + 1).padStart(2, '0')}</span>
          <span class="br-cu-row-t"><b>${s.t}</b><span>${s.kind === 'review' ? 'Review · ' : ''}${s.m}</span></span>
          ${s.st === 'current' ? `<button class="br-cu-begin" data-toast="Starting room 03">Begin</button>` : s.st === 'done'
            ? `<button class="br-cu-state" data-toast="Revisit: ${s.t}"><i class="br-cu-sq"></i>Seen</button>`
            : `<button class="br-cu-state" data-toast="Opens after room 03">${s.kind === 'final' ? ic('gift', 15, 1.6) : ic('lock', 14, 1.6)}<span class="br-vh">Locked</span></button>`}
        </li>`).join('')}</ol>
      ${tabbar('cu')}`,
  };

  // ===== 3 · Rabbit hole × Liquid Glass =====
  S.rh = {
    welcome: () => `
      <div class="br-rh-sky"></div>
      <div class="br-rh-hole"><canvas data-char="welcome" aria-label="The Rabbit hole character, glass beads falling into a tunnel"></canvas></div>
      <div class="br-rh-glass br-rh-foot">
        <h2 class="br-rh-word">rabbit hole</h2>
        <p class="br-rh-promise">Start with one question. Fall as deep as you like.</p>
        <button class="br-rh-btn" data-toast="Next: how do you like to learn?">Get started</button>
        <button class="br-rh-link" data-toast="Sign in is out of scope here">I already have an account</button>
      </div>`,
    style: (b) => `
      <div class="br-rh-sky"></div>
      <div class="br-rh-bar"><button class="br-rh-round br-rh-glass" aria-label="Back" data-toast="Back to welcome">${ic('back', 20)}</button>
        <div class="br-rh-track br-rh-glass" aria-label="Step 2 of 5"><i style="width:40%"></i></div><span class="br-rh-bar-sp"></span></div>
      <h2 class="br-rh-title">How do you like to learn?</h2>
      <div class="br-rh-char"><canvas data-char="style"></canvas></div>
      <div class="br-rh-opts" role="radiogroup" aria-label="Learning style">${STYLES.map((s, k) => `
        <button class="br-rh-opt br-rh-glass" role="radio" data-style="${k}" aria-checked="${k === selIdx(b)}">
          <span class="br-rh-opt-glyph">${glyph(s.id)}</span><span class="br-rh-opt-txt"><b>${s.t}</b><span>${s.s}</span></span></button>`).join('')}</div>
      <button class="br-rh-btn" data-toast="Next: what do you want to learn?">Continue</button>`,
    learn: () => `
      <div class="br-rh-sky br-rh-sky-deep"></div>
      <header class="br-rh-lh">
        <div><button class="br-rh-switch" data-toast="Your courses: 1 of 3 on the free plan">How your heart works ${ic('down', 18, 2.2)}</button>
        <p class="br-rh-meta"><span class="br-rh-chip br-rh-glass">Depth 3 of 12</span> 2 done</p></div>
        <div class="br-rh-mini"><canvas data-char="learn"></canvas></div>
      </header>
      <div class="br-rh-road">${STOPS.map((s, k) => `
        <div class="br-rh-stop br-rh-${s.st} ${k % 2 ? 'br-rh-r' : ''}" style="--d:${k}">
          <button class="br-rh-orb" aria-label="${s.t}, ${s.st}" data-toast="${s.st === 'locked' ? 'Finish the earlier lessons first' : s.st === 'done' ? 'Replay: ' + s.t : 'Starting lesson 3'}">${stopIcon(s)}</button>
          <div class="br-rh-lbl br-rh-glass"><b>${s.t}</b><span>${s.kind === 'review' ? 'Review · ' : ''}${s.m}</span>${s.st === 'current' ? `<button class="br-rh-btn br-rh-btn-sm" data-toast="Starting lesson 3">Start</button>` : ''}</div>
        </div>`).join('')}</div>
      ${tabbar('rh')}`,
  };

  // ===== 4 · Polymath × Precision Instrument =====
  const brackets = '<i class="br-pm-br tl"></i><i class="br-pm-br tr"></i><i class="br-pm-br bl"></i><i class="br-pm-br br"></i>';
  S.pm = {
    welcome: () => `
      <div class="br-pm-top"><span class="br-pm-mono">POLYMATH</span><span class="br-pm-mono"><i class="br-pm-led"></i>READY</span></div>
      <div class="br-pm-view">${brackets}
        <span class="br-pm-ro tl">CH 01 · CHARACTER</span><span class="br-pm-ro tr">2,295 PTS</span>
        <canvas data-char="welcome" aria-label="The Polymath character, a field of sample points"></canvas>
        <span class="br-pm-ro bl">MODE · IDLE</span><span class="br-pm-ro br">MOVE TO PROBE</span></div>
      <div class="br-pm-foot">
        <h2 class="br-pm-word">Polymath</h2>
        <p class="br-pm-def"><span>noun</span> a person who knows about many things</p>
        <p class="br-pm-promise">Learn across every field, and see exactly how far you’ve come.</p>
        <button class="br-pm-btn" data-toast="Next: how do you like to learn?"><span>Get started</span><span class="br-pm-mono">ENTER ${ic('right', 16, 2)}</span></button>
        <button class="br-pm-link" data-toast="Sign in is out of scope here">I already have an account</button>
      </div>`,
    style: (b) => `
      <div class="br-pm-top"><button class="br-pm-back br-pm-mono" data-toast="Back to welcome">${ic('back', 14, 2)} BACK</button>
        <span class="br-pm-mono">STEP 02/05</span></div>
      <div class="br-pm-seg" aria-hidden="true">${[1, 2, 3, 4, 5].map((k) => `<i class="${k < 2 ? 'on' : k === 2 ? 'now' : ''}"></i>`).join('')}</div>
      <h2 class="br-pm-title">How do you like to learn?</h2>
      <div class="br-pm-view br-pm-view-sm">${brackets}<span class="br-pm-ro tl">SHAPE · <b data-figname>${STYLES[selIdx(b)].t.toUpperCase()}</b></span><canvas data-char="style"></canvas></div>
      <div class="br-pm-opts" role="radiogroup" aria-label="Learning style">${STYLES.map((s, k) => `
        <button class="br-pm-opt" role="radio" data-style="${k}" aria-checked="${k === selIdx(b)}">
          <span class="br-pm-opt-n br-pm-mono">0${k + 1}</span><span class="br-pm-opt-txt"><b>${s.t}</b><span>${s.s}</span></span>
          <span class="br-pm-opt-v br-pm-mono">${['5 MIN', '9 NODES', '12 STOPS'][k]}</span></button>`).join('')}</div>
      <button class="br-pm-btn" data-toast="Next: what do you want to learn?"><span>Continue</span><span class="br-pm-mono">${ic('right', 16, 2)}</span></button>`,
    learn: () => `
      <header class="br-pm-lh">
        <div class="br-pm-lh-txt"><span class="br-pm-mono br-pm-dim">COURSE 01 / 03</span>
          <button class="br-pm-switch" data-toast="Your courses: 1 of 3 on the free plan">How your heart works ${ic('down', 18, 2)}</button>
          <div class="br-pm-seg br-pm-seg-12" aria-label="2 of 12 done">${Array.from({ length: 12 }, (_, k) => `<i class="${k < 2 ? 'on' : k === 2 ? 'now' : ''}"></i>`).join('')}</div>
          <p class="br-pm-mono br-pm-dim">PROGRESS 02/12 · 17%</p></div>
        <div class="br-pm-view br-pm-mini">${brackets}<canvas data-char="learn"></canvas><span class="br-pm-ro bl"><b data-bpm>72</b> BPM</span></div>
      </header>
      <ol class="br-pm-rail">${STOPS.map((s, k) => `
        <li class="br-pm-row br-pm-${s.st}"><span class="br-pm-tick"></span>
          <span class="br-pm-code br-pm-mono">${s.kind === 'review' ? 'R01' : s.kind === 'final' ? 'FIN' : 'L' + String(k < 4 ? k + 1 : k).padStart(2, '0')}</span>
          <span class="br-pm-row-t"><b>${s.t}</b><span class="br-pm-mono">${s.m.toUpperCase()}</span></span>
          ${s.st === 'current' ? `<button class="br-pm-btn br-pm-btn-sm" data-toast="Starting L03">Start</button>`
            : `<button class="br-pm-state br-pm-mono" data-toast="${s.st === 'done' ? 'Replay: ' + s.t : 'Finish L03 first'}">${s.st === 'done' ? 'DONE' : s.kind === 'final' ? ic('gift', 15, 1.8) : ic('lock', 14, 2)}${s.st === 'done' ? '' : '<span class="br-vh">Locked</span>'}</button>`}
        </li>`).join('')}</ol>
      ${tabbar('pm')}`,
  };

  // ---------- Render ----------
  function render(i) {
    const b = BRANDS[i], s = S[b.key];
    return `<div class="br-page br-${b.key}">
      ${card(b, i)}
      <div class="br-row-fit"><div class="br-row">
        ${phone(1, 'Welcome', s.welcome(b), `br-${b.key}-screen br-${b.key}-welcome`)}
        ${phone(2, 'How do you like to learn?', s.style(b), `br-${b.key}-screen br-${b.key}-style`)}
        ${phone(3, 'Learn roadmap', s.learn(b), `br-${b.key}-screen br-${b.key}-learn`)}
      </div></div>
      <p class="br-hint">Move your pointer over a character to see how it reacts. Tap the options on screen 2 to reshape it.</p>
    </div>`;
  }

  const TREATMENT = { cx: 'cells', cu: 'ink', rh: 'glass', pm: 'readout' };
  const timers = [];
  function afterMount(i) {
    timers.splice(0).forEach(clearInterval);
    const b = BRANDS[i], root = document.querySelector('.br-page'), tr = TREATMENT[b.key];
    const make = (name, shape, size, extra = {}) => {
      const cv = root.querySelector(`canvas[data-char="${name}"]`);
      return BrandCharacter.create(cv, Object.assign({ treatment: tr, shape, size, hit: cv.closest('.br-screen') }, extra));
    };
    const welcomeSize = { cx: 356, cu: 300, rh: 390, pm: 330 }[b.key];
    const w = make('welcome', b.welcome, welcomeSize, { zoom: b.key === 'rh' ? 1.05 : 1, spin: b.key === 'pm', density: b.key === 'pm' ? 1.35 : 1 });
    const st = make('style', STYLES[selIdx(b)].shape, { cx: 210, cu: 196, rh: 236, pm: 200 }[b.key], { delay: 250 });
    make('learn', b.heart, { cx: 96, cu: 104, rh: 110, pm: 112 }[b.key], { delay: 400, density: b.key === 'cu' ? 0.6 : 0.7 });

    if (b.cycle && !BrandCharacter.STILL) { // Living Matter: the cells regrow into the icon of whatever you are curious about
      let k = 0; const now = root.querySelector('[data-now]');
      timers.push(setInterval(() => { k = (k + 1) % b.cycle.length; w.setShape(b.cycle[k][0], 1600); now.textContent = b.cycle[k][1]; }, 3600));
    }
    const bpm = root.querySelector('[data-bpm]');
    if (bpm && !BrandCharacter.STILL) timers.push(setInterval(() => { bpm.textContent = 70 + Math.round(Math.random() * 5); }, 1100));

    root.querySelectorAll('[data-style]').forEach((el) => el.addEventListener('click', () => {
      const k = +el.dataset.style;
      root.querySelectorAll('[data-style]').forEach((o) => o.setAttribute('aria-checked', String(o === el)));
      st.setShape(STYLES[k].shape, 1300);
      const fig = root.querySelector('[data-figname]'); if (fig) fig.textContent = b.key === 'pm' ? STYLES[k].t.toUpperCase() : STYLES[k].t;
    }));
    root.querySelectorAll('[data-toast]').forEach((el) => el.addEventListener('click', (e) => {
      e.stopPropagation();
      const t = el.closest('.br-screen').querySelector('.br-toast'); t.textContent = el.dataset.toast; t.classList.add('on');
      clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1800);
    }));
    fit();
  }

  function fit() { // scale the three phones to fit the window
    const fitEl = document.querySelector('.br-row-fit'), row = document.querySelector('.br-row'); if (!row) return;
    const natW = row.scrollWidth, natH = row.scrollHeight, sc = Math.min(1, (window.innerWidth - 64) / natW);
    row.style.transform = `scale(${sc})`; fitEl.style.height = natH * sc + 'px'; fitEl.style.width = natW * sc + 'px';
    document.documentElement.style.setProperty('--br-fit', natW * sc + 'px');
  }
  window.addEventListener('resize', fit);

  // ---------- Picker (reference wiring from PICKER.md; the URL param is ?b= as asked, ?v= also read) ----------
  const variants = BRANDS.map((_, i) => () => render(i));
  const stage = document.getElementById('stage');
  const picker = document.querySelector('.proto-picker');
  const highlight = picker.querySelector('.proto-picker-highlight');
  const items = [...picker.querySelectorAll('.proto-picker-item:not(.proto-picker-replay)')];
  const replay = picker.querySelector('.proto-picker-replay');
  let current = 0;

  function moveHighlight() {
    const el = items[current];
    highlight.style.width = el.offsetWidth + 'px';
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }
  function mount(i) {
    BrandCharacter.destroyAll();
    stage.innerHTML = '';
    // Clear first, render next frame, so entrance animations re-run.
    requestAnimationFrame(() => { stage.innerHTML = variants[i](); document.body.dataset.brand = BRANDS[i].key; afterMount(i); });
  }
  function setActive(i) {
    if (i < 0 || i >= variants.length) return;
    current = i;
    items.forEach((el, j) => {
      el.toggleAttribute('data-active', j === i);
      if (j === i) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
    moveHighlight();
    const url = new URL(location);
    url.searchParams.set('b', i + 1); url.searchParams.delete('v');
    history.replaceState(null, '', url);
    mount(i);
  }
  items.forEach((el, i) => el.addEventListener('click', () => setActive(i)));
  replay?.addEventListener('click', () => mount(current));
  document.addEventListener('keydown', (e) => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= variants.length) setActive(num - 1);
    else if (e.key === 'ArrowRight') setActive((current + 1) % variants.length);
    else if (e.key === 'ArrowLeft') setActive((current - 1 + variants.length) % variants.length);
    else if (e.key === 'r' || e.key === 'R') mount(current);
  });
  window.addEventListener('resize', moveHighlight);
  const q = new URLSearchParams(location.search);
  const start = () => {
    setActive((parseInt(q.get('b') || q.get('v'), 10) || 1) - 1);
    requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute('data-ready', '')));
  };
  // Wait for fonts so the picker highlight measures correctly and canvas text uses the brand fonts.
  (document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve()).then(start);
})();
