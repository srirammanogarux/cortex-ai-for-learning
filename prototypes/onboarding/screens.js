// Every onboarding screen. Each: brain(ctx) -> brain layout/state, render(ctx) -> html, mount(el, ctx).
(function () {
  const I = {
    send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    mic: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    share: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
    star: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c.6 4.8 2.7 6.9 9.5 9.5-6.8 2.6-8.9 4.7-9.5 9.5-.6-4.8-2.7-6.9-9.5-9.5 6.8-2.6 8.9-4.7 9.5-9.5z"/></svg>',
    compass: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor"/></svg>',
    target: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    memory: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="2"/><circle cx="16" cy="7" r="2"/><circle cx="12" cy="13" r="2"/><circle cx="6" cy="16" r="2"/><circle cx="17" cy="16" r="2"/></svg>',
    apple: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.2 5.8c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.6 2.8-1.3z"/></svg>',
  };
  const ORB = (size = 64) => { // static dot brain for dialogs
    let d = ''; const r = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
    for (let i = 0; i < 240; i++) { const a = r(i) * 6.283, k = Math.sqrt(r(i + 1)); const x = 50 + Math.cos(a) * k * 40, y = 50 + Math.sin(a) * k * 32; const z = r(i + 2); d += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.9 + z * 1.4).toFixed(2)}" fill="${z > 0.5 ? '#1F5BE0' : '#7FA3FF'}" opacity="${(0.45 + z * 0.55).toFixed(2)}"/>`; }
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">${d}</svg>`;
  };
  const GOOGLE = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  const AVATAR = (p, s = 32) => `<span style="width:${s}px;height:${s}px;border-radius:50%;background:linear-gradient(160deg,${p.color},${p.deep});color:#fff;display:inline-grid;place-items:center;font-family:var(--title);font-weight:600;font-size:${Math.round(s * 0.45)}px;flex-shrink:0">${p.name[0]}</span>`;
  const INTERESTS = { riya: 'animals, food science, design history, space', sam: 'startups, AI tools, finance, product strategy', meera: 'physics, electronics, biology, maths', dev: 'LLM inference, training methods, GPU systems, evals' };
  const QSET = { riya: ['riya', 'sam', 'meera'], sam: ['riya', 'sam', 'meera'], meera: ['riya', 'sam', 'meera'], dev: ['riya', 'dev', 'meera'] };
  const SPARK_LABEL = { riya: 'For fun', sam: 'For work', meera: 'For study', dev: 'For work' };

  function typeInto(ctx, el, text, done) {
    el.classList.remove('ph'); el.textContent = ''; let i = 0;
    const caret = document.createElement('span'); caret.className = 'caret';
    const tick = () => {
      el.textContent = text.slice(0, ++i); el.appendChild(caret);
      if (i < text.length) ctx.later(tick, 26 + Math.random() * 30); else { ctx.later(() => { caret.remove(); done && done(); }, 350); }
    };
    tick();
  }
  function composer(ph) {
    return `<div class="composer ia"><button class="field ph" data-field>${ph}</button><button class="mic" aria-label="Speak your question">${I.mic}</button><button class="send" data-send aria-label="Send" disabled>${I.send}</button></div>`;
  }
  function wireComposer(el, ctx, onSend) {
    const field = el.querySelector('[data-field]'), send = el.querySelector('[data-send]'), mic = el.querySelector('.mic');
    let typed = false;
    const fillQ = () => { if (typed) return; typed = true; ctx.brain.setMode('listen'); typeInto(ctx, field, ctx.p.q, () => { send.disabled = false; ctx.brain.setMode('idle'); }); };
    field.addEventListener('click', fillQ);
    mic.addEventListener('click', () => { ctx.toast('Listening… (simulated)'); fillQ(); });
    send.addEventListener('click', () => onSend(ctx.p.q));
  }
  function sparksHTML(ctx, list, opts = {}) {
    return list.map((s, i) => `<button class="chip ${s.hint ? 'hinted' : ''} rise" style="animation-delay:${(opts.delay || 0) + i * 80}ms" data-spark="${i}">${s.label ? `<span class="t-eyebrow" style="display:block;margin-bottom:3px;color:${s.hint ? 'var(--cobalt-700)' : 'var(--ink-3)'}">${s.label}</span>` : ''}${s.text}</button>`).join('');
  }
  function userBubble(text) {
    return `<div style="align-self:flex-end;max-width:80%;background:#fff;border-radius:22px 22px 6px 22px;padding:12px 16px;font-size:16px;line-height:22px;font-weight:500;box-shadow:var(--card-shadow)" class="rise">${text}</div>`;
  }
  const subjectTag = (p) => `<span class="tag" style="background:${p.subjectColor}">${p.subject}</span>`;
  const rangeFill = (r) => { const p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty('--p', p + '%'); };

  // ---------------- Persona explorations ----------------
  const EXPLORE = {};

  EXPLORE.riya = {
    html: (ctx) => `
      <div class="card rise" style="animation-delay:80ms"><p class="t-eyebrow">The short answer</p><p class="t-card" style="margin-top:6px">About 180 kg, and taller than a kitchen counter.</p><p class="t-body" style="margin-top:6px">It’s the biggest heart of any animal alive. Here’s what that actually looks like.</p></div>
      <div class="bezel rise" style="margin-top:14px;animation-delay:160ms"><div class="card">
        <p class="t-card">Stand next to it</p>
        <svg viewBox="0 0 320 200" width="100%" style="margin-top:10px;display:block" aria-label="A person standing next to a heart drawn to scale">
          <line x1="10" y1="182" x2="310" y2="182" stroke="#141211" stroke-opacity=".15" stroke-width="2"/>
          <g fill="#C9C5C0"><circle cx="86" cy="45" r="13"/><rect x="72" y="62" width="28" height="68" rx="13"/><rect x="74" y="122" width="11" height="60" rx="5"/><rect x="87" y="122" width="11" height="60" rx="5"/></g>
          <text x="86" y="198" text-anchor="middle" font-size="11" font-weight="600" fill="#625E5A" font-family="Inter">You · 1.75 m</text>
          <g class="hs" data-heart style="transform-origin:215px 182px;transform:scale(.09);transition:transform 1000ms cubic-bezier(0.32,0.72,0,1)">
            <path transform="translate(155,76) scale(1.2)" d="M50 88 C 20 65, 0 45, 0 25 C 0 10, 12 0, 27 0 C 38 0, 46 7, 50 15 C 54 7, 62 0, 73 0 C 88 0, 100 10, 100 25 C 100 45, 80 65, 50 88 Z" fill="#D84A72"/>
          </g>
          <text x="215" y="198" text-anchor="middle" font-size="11" font-weight="600" fill="#A3264F" font-family="Inter" data-hlabel>Your heart · 0.3 kg</text>
        </svg>
        <div class="ia" role="group" aria-label="Compare hearts" style="display:flex;gap:6px;margin-top:12px">
          <button class="chip sm" data-hs="you" aria-pressed="true" style="flex:1;text-align:center">Your heart</button>
          <button class="chip sm" data-hs="whale" aria-pressed="false" style="flex:1;text-align:center">A whale’s heart</button>
        </div>
        <p class="t-small" data-hcap style="margin-top:10px">Tap “A whale’s heart”.</p>
      </div></div>
      <div class="bezel rise" style="margin-top:14px;animation-delay:240ms"><div class="card">
        <p class="t-card">Feel the beat</p>
        <div style="display:flex;align-items:center;gap:14px;margin-top:14px">
          <span style="width:40px;height:40px;display:grid;place-items:center"><span style="width:22px;height:22px;border-radius:50%;background:#D84A72;animation:beat .857s ease-out infinite"></span></span>
          <div><p style="margin:0;font-weight:600">You, resting</p><p class="t-small">About 70 beats a minute</p></div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;margin-top:12px">
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="none" stroke="rgba(20,18,17,.08)" stroke-width="4"/><circle data-ring cx="20" cy="20" r="17" fill="none" stroke="#A3264F" stroke-width="4" stroke-linecap="round" stroke-dasharray="106.8" stroke-dashoffset="106.8" transform="rotate(-90 20 20)"/><circle data-thump cx="20" cy="20" r="8" fill="#A3264F"/></svg>
          <div><p style="margin:0;font-weight:600">A blue whale, diving</p><p class="t-small">As slow as 2 a minute. One every 30 seconds.</p></div>
        </div>
        <p class="t-small" style="margin-top:12px">Slowing down saves oxygen on long dives. Then it races back up to around 30 a minute at the surface.</p>
      </div></div>
      <div class="rise" style="margin-top:14px;animation-delay:320ms;border-radius:28px;padding:22px;color:#fff;background:radial-gradient(120% 80% at 10% 0%, ${ctx.p.deep}, #5E1A58 60%, #3B1037)">
        <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:.1em">DID YOU KNOW?</p>
        <p style="margin:8px 0 0;font-family:var(--title);font-weight:600;font-size:22px;line-height:27px;letter-spacing:-.02em">A blue whale’s heart weighs as much as two grown men, and can beat just twice a minute.</p>
        <button class="ia" data-share style="margin-top:16px;height:40px;padding:0 16px;border-radius:999px;border:0;background:rgba(255,255,255,.18);color:#fff;font-weight:600;display:inline-flex;align-items:center;gap:8px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)">${I.share} Send to a friend</button>
      </div>
      <p class="t-small" style="margin-top:14px">Sources: Goldbogen et al., PNAS 2019 (heart rate) · Royal Ontario Museum (heart size)</p>`,
    mount(el, ctx) {
      const heart = el.querySelector('[data-heart]'), lab = el.querySelector('[data-hlabel]'), cap = el.querySelector('[data-hcap]');
      el.querySelectorAll('[data-hs]').forEach((b) => b.addEventListener('click', () => {
        const whale = b.dataset.hs === 'whale';
        el.querySelectorAll('[data-hs]').forEach((x) => x.setAttribute('aria-pressed', x === b));
        heart.style.transform = whale ? 'scale(1)' : 'scale(.09)';
        lab.textContent = whale ? 'Whale heart · 180 kg · 1.5 m' : 'Your heart · 0.3 kg';
        cap.textContent = whale ? 'About 600 times heavier than yours. You could hug it.' : 'About the size of your fist.';
      }));
      const ring = el.querySelector('[data-ring]'), thump = el.querySelector('[data-thump]'); const start = performance.now(); let raf;
      const loop = (now) => { const t = ((now - start) / 30000) % 1; ring.setAttribute('stroke-dashoffset', 106.8 * (1 - t)); const k = t > 0.985 || t < 0.02 ? 1.35 : 1; thump.setAttribute('r', 8 * k); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop); ctx.onCleanup(() => cancelAnimationFrame(raf));
      el.querySelector('[data-share]').addEventListener('click', () => ctx.toast('Share card saved to Photos'));
    },
  };

  EXPLORE.sam = {
    html: () => `
      <div class="card rise" style="animation-delay:80ms"><p class="t-eyebrow">The model</p><p class="t-card" style="margin-top:6px">When safe money pays more, risky bets have to work harder.</p><p class="t-body" style="margin-top:6px">Drag the rate and follow the chain from the Fed to your next round.</p></div>
      <div class="bezel rise" style="margin-top:14px;animation-delay:160ms"><div class="card">
        <div style="display:flex;justify-content:space-between;align-items:baseline"><p class="t-card">Interest rate</p><p data-rv style="margin:0;font-family:var(--title);font-weight:600;font-size:28px;letter-spacing:-.03em;color:#526612">0.0%</p></div>
        <input class="ia" type="range" min="0" max="5.5" step="0.25" value="0" data-rate aria-label="Interest rate" style="--fill:#7E9A2A;margin-top:6px">
        <div style="display:flex;justify-content:space-between" class="t-small"><span>2021 · ~0%</span><span>2023 · ~5.5%</span></div>
        <div data-chain style="margin-top:14px;display:grid;gap:6px"></div>
        <p class="t-small" style="margin-top:10px">Assumes investors want about 15% on top of the safe rate for startup risk. Illustrative.</p>
      </div></div>
      <div class="card rise" style="margin-top:14px;animation-delay:240ms">
        <p class="t-card">Say it in your meeting</p>
        <ol style="margin:10px 0 0;padding-left:20px;display:grid;gap:8px" class="t-body"><li>Higher rates make future profits worth less today.</li><li>So the same startup gets a lower valuation and smaller rounds.</li><li>That’s why runway and profitability matter more now than growth at any cost.</li></ol>
      </div>
      <div class="card rise" style="margin-top:14px;animation-delay:300ms">
        <p class="t-card">Sources</p>
        ${[['F', 'Federal Reserve', 'FOMC statements, 2022–23: rates raised from ~0% to 5.25–5.5%'], ['D', 'Aswath Damodaran, NYU', 'Cost of capital and how discount rates move valuations'], ['C', 'Carta', 'State of Private Markets reports, 2023: fewer, smaller rounds']].map(([a, b, c]) => `<div style="display:flex;gap:12px;margin-top:12px"><span style="width:32px;height:32px;border-radius:10px;background:#EEF1E3;color:#526612;display:grid;place-items:center;font-weight:700;flex-shrink:0">${a}</span><div><p style="margin:0;font-weight:600;font-size:15px">${b}</p><p class="t-small">${c}</p></div></div>`).join('')}
      </div>
      <div class="bezel rise" style="margin-top:14px;animation-delay:360ms"><div class="card">
        <p class="t-eyebrow" style="color:var(--cobalt-700)">Deep dive · 3 days</p>
        <p class="t-card" style="margin-top:6px">Rates and startups, properly</p>
        <div style="display:grid;gap:8px;margin-top:12px" class="t-body"><div>Day 1 · Discount rates, without the maths</div><div>Day 2 · Venture debt and why it’s back</div><div>Day 3 · What this means for your roadmap</div></div>
        <button class="btn-carved" data-deep style="margin-top:14px">Make it a deep dive</button>
      </div></div>`,
    mount(el, ctx) {
      const r = el.querySelector('[data-rate]'), rv = el.querySelector('[data-rv]'), chain = el.querySelector('[data-chain]');
      const pv = (x) => 1e6 / Math.pow(1 + 0.15 + x / 100, 10);
      const draw = () => {
        const x = +r.value; rangeFill(r); rv.textContent = x.toFixed(1) + '%';
        const val = Math.round((pv(x) / pv(0) - 1) * 100);
        const act = x < 1 ? 'Raise big, grow fast' : x < 3 ? 'Raise carefully' : 'Cut burn, extend runway';
        const rows = [['Safe return (government bonds)', x.toFixed(1) + '%'], ['What investors want from startups', (15 + x).toFixed(1) + '%'], ['$1M profit in 10 years, worth today', '$' + Math.round(pv(x) / 1000) + 'k'], ['Startup valuations', (val === 0 ? '±0' : val) + '%'], ['What founders do', act]];
        chain.innerHTML = rows.map(([a, b], i) => `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:${x > 0 && i > 0 ? 'rgba(126,154,42,' + (0.06 + x / 5.5 * 0.12) + ')' : '#F4F2F0'}"><span style="width:20px;height:20px;border-radius:50%;background:#7E9A2A;color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;flex-shrink:0">${i + 1}</span><span style="flex:1;font-size:14px;font-weight:500">${a}</span><b style="font-size:14px;font-variant-numeric:tabular-nums">${b}</b></div>${i < 4 ? '<div style="text-align:center;color:#7E9A2A;font-size:12px;line-height:8px">↓</div>' : ''}`).join('');
      };
      r.addEventListener('input', draw); draw();
      el.querySelector('[data-deep]').addEventListener('click', () => ctx.toast('Day 1 arrives tomorrow at 8:00'));
    },
  };

  EXPLORE.meera = {
    html: () => `
      <div class="card rise" style="animation-delay:80ms"><p class="t-eyebrow">The idea</p><p class="t-card" style="margin-top:6px">Why your room gets messy by itself, and never tidies itself.</p></div>
      <div class="bezel rise" style="margin-top:14px;animation-delay:160ms"><div class="card">
        <p class="t-card">Remove the wall</p>
        <canvas data-box width="600" height="360" style="width:100%;aspect-ratio:5/3;margin-top:12px;border-radius:16px;background:#F1F2F7;display:block" aria-label="Particles in a box"></canvas>
        <div style="display:flex;justify-content:space-between;margin-top:10px" class="t-small"><span data-left>On the left: 60 of 60</span><span data-ways>Ways: just 1</span></div>
        <div class="ia" style="display:flex;gap:8px;margin-top:12px"><button class="btn-lit" data-wall style="height:46px;font-size:15px">Remove the wall</button><button class="btn-carved" data-reset style="height:46px;width:110px;font-size:15px">Reset</button></div>
      </div></div>
      <div class="card rise" style="margin-top:14px;animation-delay:240ms">
        <p class="t-card">Entropy is counting the ways</p>
        <p class="t-body" style="margin-top:8px">There’s exactly 1 way to have all 60 particles on the left. There are about a billion billion ways to have them spread out. So they spread out. They don’t “want” to; messy is just far more likely.</p>
      </div>
      <div class="card rise" style="margin-top:14px;animation-delay:300ms">
        <p class="t-eyebrow">For your exam</p>
        <p style="margin:10px 0 0;font-family:var(--title);font-weight:600;font-size:34px;letter-spacing:-.02em;text-align:center" class="ia">S = <button class="sym" data-sym="k">k</button> ln <button class="sym" data-sym="W">W</button></p>
        <p class="t-small center" data-symcap style="margin-top:8px">Tap k or W.</p>
      </div>
      <div class="bezel rise" style="margin-top:14px;animation-delay:360ms"><div class="card" data-check>
        <p class="t-eyebrow" style="color:var(--cobalt-700)">Quick check</p>
        <p class="t-card" style="margin-top:6px">An ice cube melts in a warm room. What happens to the water’s entropy?</p>
        <div class="ia" style="display:grid;gap:8px;margin-top:12px">
          <button class="chip" data-opt="up">It goes up</button><button class="chip" data-opt="down">It goes down</button><button class="chip" data-opt="same">It stays the same</button>
        </div>
        <div data-fb></div>
      </div></div>
      <style>.sym{border:0;background:rgba(31,91,224,.1);color:var(--cobalt-700);border-radius:10px;padding:0 8px;font:inherit}.sym:active{transform:scale(.95)}</style>`,
    mount(el, ctx) {
      const cv = el.querySelector('[data-box]'), g = cv.getContext('2d');
      const n = 60; let wall = true; let P = [];
      const reset = () => { wall = true; P = Array.from({ length: n }, (_, i) => ({ x: 20 + Math.random() * 260, y: 20 + Math.random() * 320, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3 })); };
      reset(); let raf;
      const leftEl = el.querySelector('[data-left]'), waysEl = el.querySelector('[data-ways]');
      const loop = () => {
        g.clearRect(0, 0, 600, 360);
        if (wall) { g.fillStyle = '#2F3766'; g.fillRect(298, 0, 4, 360); }
        let left = 0;
        for (const p of P) {
          p.vx += (Math.random() - 0.5) * 0.4; p.vy += (Math.random() - 0.5) * 0.4; p.vx *= 0.99; p.vy *= 0.99;
          p.x += p.vx; p.y += p.vy;
          const maxX = wall ? 290 : 590;
          if (p.x < 10) { p.x = 10; p.vx *= -1; } if (p.x > maxX) { p.x = maxX; p.vx *= -1; }
          if (p.y < 10) { p.y = 10; p.vy *= -1; } if (p.y > 350) { p.y = 350; p.vy *= -1; }
          if (p.x < 300) left++;
          g.fillStyle = '#56619A'; g.beginPath(); g.arc(p.x, p.y, 7, 0, 6.283); g.fill();
        }
        leftEl.textContent = `On the left: ${left} of 60`;
        waysEl.textContent = left === 60 ? 'Ways: just 1' : left > 50 ? 'Ways: millions' : 'Ways: ~a billion billion';
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop); ctx.onCleanup(() => cancelAnimationFrame(raf));
      el.querySelector('[data-wall]').addEventListener('click', () => { wall = false; });
      el.querySelector('[data-reset]').addEventListener('click', reset);
      const cap = el.querySelector('[data-symcap]');
      el.querySelectorAll('[data-sym]').forEach((b) => b.addEventListener('click', () => {
        cap.textContent = b.dataset.sym === 'k' ? 'k is Boltzmann’s constant: it turns “number of ways” into energy units.' : 'W is the number of ways the particles can be arranged. Your box just showed it.';
      }));
      const fb = el.querySelector('[data-fb]');
      el.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => {
        const right = b.dataset.opt === 'up';
        el.querySelectorAll('[data-opt]').forEach((x) => { x.disabled = true; x.style.opacity = x === b ? 1 : 0.5; });
        b.style.background = right ? 'var(--right)' : 'var(--wrong)'; b.style.color = '#fff';
        fb.innerHTML = `<p class="rise" style="margin:12px 0 0;font-size:15px;line-height:21px;font-weight:600;color:${right ? '#0B7A66' : '#B4282D'}">${right ? '✓ Right.' : '✕ Not quite.'} <span style="font-weight:500;color:var(--ink-2)">Liquid water has far more ways to arrange its molecules than ice, so entropy goes up.</span></p><button class="btn-carved rise" data-practice style="margin-top:12px">Add to practice</button>`;
        fb.querySelector('[data-practice]').addEventListener('click', () => ctx.toast('Added. I’ll ask you again in 2 days.'));
        if (right) ctx.brain.touch(0, 0);
      }));
    },
  };

  EXPLORE.dev = {
    html: () => `
      <div class="card rise" style="animation-delay:80ms"><p class="t-eyebrow">The mechanism</p><p class="t-card" style="margin-top:6px">Guess cheap, verify in parallel, keep what the big model would have said anyway.</p></div>
      <div class="bezel rise" style="margin-top:14px;animation-delay:160ms"><div class="card">
        <p class="t-card">One verify pass</p>
        <p class="t-small" style="margin-top:4px">Context: “The cat sat on”. The draft model proposes 5 tokens.</p>
        <div data-toks class="ia" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px"></div>
        <p class="t-small" data-tokcap style="margin-top:10px">&nbsp;</p>
        <div class="ia" style="display:flex;gap:8px;margin-top:10px"><button class="btn-lit" data-verify style="height:46px;font-size:15px">Run the big model once</button><button class="btn-carved" data-treset style="height:46px;width:100px;font-size:15px">Reset</button></div>
      </div></div>
      <div class="bezel rise" style="margin-top:14px;animation-delay:240ms"><div class="card">
        <p class="t-card">Expected tokens per big-model pass</p>
        <p style="margin:10px 0 0;font-family:ui-monospace,Menlo,monospace;font-size:14px;color:var(--ink-2)">E = (1 − α<sup>γ+1</sup>) / (1 − α)</p>
        <p data-e style="margin:6px 0 0;font-family:var(--title);font-weight:600;font-size:40px;letter-spacing:-.03em;color:#165F87">3.69</p>
        <label class="t-small" style="display:block;margin-top:8px">Acceptance rate α: <b data-av>0.80</b></label>
        <input class="ia" type="range" min="0.5" max="0.95" step="0.01" value="0.8" data-a style="--fill:#2A8FC4" aria-label="Acceptance rate">
        <label class="t-small" style="display:block;margin-top:4px">Draft length γ: <b data-gv>5</b></label>
        <input class="ia" type="range" min="1" max="10" step="1" value="5" data-g style="--fill:#2A8FC4" aria-label="Draft length">
        <p class="t-small" style="margin-top:8px">Real speed-up also depends on how cheap the draft model is. Long drafts stop paying off when α is low.</p>
      </div></div>
      <div class="card rise" style="margin-top:14px;animation-delay:300ms">
        <p class="t-card">Evidence</p>
        ${[['Leviathan, Kalman & Matias · ICML 2023', '2–3× faster on T5-XXL, with identical outputs.'], ['Chen et al. · DeepMind 2023', '2–2.5× faster decoding on Chinchilla 70B.']].map(([a, b]) => `<div style="margin-top:12px;padding:12px 14px;border-radius:14px;background:#EEF4F9"><p style="margin:0;font-weight:600;font-size:14px;color:#165F87">${a}</p><p class="t-small" style="margin-top:2px;color:var(--ink)">${b}</p></div>`).join('')}
      </div>
      <div class="card rise" style="margin-top:14px;animation-delay:360ms">
        <p class="t-card">Reading list</p>
        ${[['Stern et al. · NeurIPS 2018', 'Blockwise parallel decoding: the idea before the idea'], ['Cai et al. · 2024', 'Medusa: extra heads instead of a draft model'], ['Li et al. · 2024', 'EAGLE: drafting at the feature level']].map(([a, b], i) => `<div style="display:flex;gap:12px;margin-top:12px"><span style="width:26px;height:26px;border-radius:8px;background:#EEF4F9;color:#165F87;font-weight:700;font-size:13px;display:grid;place-items:center;flex-shrink:0">${i + 1}</span><div><p style="margin:0;font-weight:600;font-size:14px">${a}</p><p class="t-small">${b}</p></div></div>`).join('')}
        <button class="btn-carved" data-why style="margin-top:14px">Go deeper: why the output stays exact</button>
      </div>`,
    mount(el, ctx) {
      const box = el.querySelector('[data-toks]'), cap = el.querySelector('[data-tokcap]');
      const draft = ['the', 'mat', 'and', 'purred', 'loudly'];
      const tok = (t, st) => { const s = { draft: 'background:#fff;border:1.5px dashed #7CBEE6;color:#165F87', ok: 'background:#1F75A6;color:#fff;border:1.5px solid #1F75A6', bad: 'background:#fff;border:1.5px solid #E5484D;color:#E5484D;text-decoration:line-through', fix: 'background:#165F87;color:#fff;border:1.5px solid #165F87', gone: 'background:#F4F2F0;border:1.5px dashed #C9C5C0;color:#57534F;text-decoration:line-through' }[st]; return `<span style="padding:7px 11px;border-radius:10px;font-family:ui-monospace,Menlo,monospace;font-size:14px;transition:all 200ms ease-out;${s}">${t}</span>`; };
      const reset = () => { box.innerHTML = draft.map((t) => tok(t, 'draft')).join(''); cap.innerHTML = '&nbsp;'; };
      reset();
      el.querySelector('[data-verify]').addEventListener('click', () => {
        reset(); const states = ['draft', 'draft', 'draft', 'draft', 'draft']; let words = [...draft];
        const paint = () => { box.innerHTML = words.map((t, i) => tok(t, states[i])).join(''); };
        [0, 1, 2].forEach((i) => ctx.later(() => { states[i] = 'ok'; paint(); }, 300 + i * 250));
        ctx.later(() => { states[3] = 'bad'; states[4] = 'gone'; paint(); cap.textContent = 'The big model disagrees at “purred”. Everything after it is thrown away.'; }, 1150);
        ctx.later(() => { words = ['the', 'mat', 'and', 'slept']; states.splice(3, 2, 'fix'); paint(); cap.textContent = '4 new tokens from 1 big-model pass, instead of 1. The output is exactly what the big model would have sampled.'; ctx.brain.touch(0, 0); }, 1900);
      });
      el.querySelector('[data-treset]').addEventListener('click', reset);
      const a = el.querySelector('[data-a]'), gm = el.querySelector('[data-g]'), E = el.querySelector('[data-e]');
      const calc = () => { rangeFill(a); rangeFill(gm); const al = +a.value, g = +gm.value; el.querySelector('[data-av]').textContent = al.toFixed(2); el.querySelector('[data-gv]').textContent = g; E.textContent = ((1 - Math.pow(al, g + 1)) / (1 - al)).toFixed(2); };
      a.addEventListener('input', calc); gm.addEventListener('input', calc); calc();
      el.querySelector('[data-why]').addEventListener('click', () => ctx.toast('Opens the rejection-sampling proof (next prototype)'));
    },
  };

  // ---------------- Screens ----------------
  const S = {};

  S.hello = {
    brain: () => ({ at: 'mid', form: true }),
    render: () => `
      <div class="spacer"></div>
      <div class="center rise" style="animation-delay:1500ms">
        <p class="t-eyebrow">Cortex</p>
        <h1 class="t-display" style="margin-top:10px">Every question you’ve asked says something about you.</h1>
        <p class="t-body" style="margin-top:12px">Let’s find out what yours say.</p>
      </div>
      <div class="cta"><button class="btn-lit rise" style="animation-delay:1800ms" data-next>Show me</button>
      <p class="t-small center rise" style="animation-delay:2100ms">Psst. Tap the brain.</p></div>`,
  };

  S.where = {
    brain: () => ({ at: 'small' }),
    render: (ctx) => {
      const pref = ctx.pid === 'dev' ? 'Claude' : 'ChatGPT';
      return `<div style="height:170px"></div>
      <h1 class="t-title center rise">Where do you go when you’re curious?</h1>
      <p class="t-body center rise" style="margin-top:8px;animation-delay:60ms">That’s where your questions live.</p>
      <div class="ia" style="display:grid;gap:10px;margin-top:24px">
        ${['ChatGPT', 'Claude', 'Gemini', 'Google'].map((x, i) => `<button class="chip ${x === pref ? 'hinted' : ''} rise" style="animation-delay:${120 + i * 60}ms" data-app="${x}">${x}</button>`).join('')}
        <button class="chip rise" style="animation-delay:360ms" data-none>I don’t, really</button>
      </div>
      <div class="spacer"></div>
      <p class="t-small center" data-ack style="min-height:20px;color:var(--cobalt-700);font-weight:600"></p>`;
    },
    mount(el, ctx) {
      el.querySelectorAll('[data-app]').forEach((b) => b.addEventListener('click', () => {
        b.setAttribute('aria-pressed', 'true'); ctx.brain.setMode('listen'); ctx.brain.touch(0, 0);
        el.querySelector('[data-ack]').textContent = `${b.dataset.app}. Perfect, that’s where your curiosity lives.`;
        ctx.later(() => ctx.next(), 1100);
      }));
      el.querySelector('[data-none]').addEventListener('click', () => { ctx.toast('No history? Let’s discover it together.'); ctx.later(() => ctx.switchDir('wonder'), 700); });
    },
  };

  S.import = {
    brain: () => ({ at: 'corner' }),
    render: () => `
      <div style="height:64px"></div>
      <h1 class="t-title rise">Bring your questions</h1>
      <p class="t-body rise" style="margin-top:8px;animation-delay:60ms">Three steps, about a minute.</p>
      <div class="card rise" style="margin-top:16px;padding:16px;animation-delay:100ms;background:rgba(255,255,255,.7)">
        ${['I only read your questions, never your answers.', 'You see everything before I keep it.', 'Delete it any time, in one tap.'].map((t) => `<div style="display:flex;gap:10px;align-items:center;margin:4px 0;font-size:14px;font-weight:500"><span style="color:var(--right)">${I.check}</span>${t}</div>`).join('')}
      </div>
      <div class="ia" style="display:grid;gap:10px;margin-top:14px">
        ${[['1', 'Copy the prompt', 'copy', 'Copy'], ['2', 'Run it in ChatGPT', 'open', 'Open'], ['3', 'Paste the answer here', 'paste', 'Paste']].map(([n, t, k, b], i) => `
        <div class="card rise" style="padding:14px 14px 14px 16px;display:flex;align-items:center;gap:12px;animation-delay:${160 + i * 60}ms" data-row="${k}">
          <span data-n style="width:28px;height:28px;border-radius:50%;background:rgba(20,18,17,.06);display:grid;place-items:center;font-weight:700;font-size:13px;flex-shrink:0">${n}</span>
          <span style="flex:1;font-weight:600;font-size:15px">${t}</span>
          <button class="chip sm" data-act="${k}" ${k !== 'copy' ? 'disabled' : ''}>${b}</button>
        </div>`).join('')}
      </div>
      <div class="cta"><button class="btn-lit" data-go disabled>Read my questions</button>
      <div class="ia" style="display:flex;justify-content:space-between;margin-top:-4px"><button class="link-btn" data-shot style="font-size:14px;white-space:nowrap">Use a screenshot</button><button class="link-btn" data-skip style="font-size:14px;white-space:nowrap">Skip, show me instead</button></div></div>`,
    mount(el, ctx) {
      const done = (k) => { const row = el.querySelector(`[data-row="${k}"]`); const n = row.querySelector('[data-n]'); n.innerHTML = I.check; n.style.background = 'var(--right)'; n.style.color = '#fff'; const b = row.querySelector('[data-act]'); b.disabled = true; b.classList.remove('hinted'); b.textContent = 'Done'; };
      const enable = (k) => { const b = el.querySelector(`[data-act="${k}"]`); b.disabled = false; b.classList.add('hinted'); };
      el.querySelector('[data-act="copy"]').addEventListener('click', () => { try { navigator.clipboard.writeText('List every question I asked you this year, grouped as INTERESTS, QUESTIONS, UNFINISHED…'); } catch (e) {} ctx.toast('Prompt copied'); done('copy'); enable('open'); });
      el.querySelector('[data-act="open"]').addEventListener('click', () => {
        const p = ctx.p;
        ctx.sheet({ title: 'ChatGPT · simulated', body: `
          <div style="display:flex;justify-content:flex-end;margin-top:6px"><div style="max-width:84%;background:#E9E9EB;border-radius:20px 20px 6px 20px;padding:11px 14px;font-size:14px;line-height:20px;font-weight:500">List every question I asked you this year, grouped as INTERESTS, QUESTIONS, UNFINISHED…</div></div>
          <div style="display:flex;gap:10px;margin-top:14px"><span style="width:28px;height:28px;border-radius:50%;background:#141211;color:#fff;display:grid;place-items:center;font-size:12px;font-weight:700;flex-shrink:0">G</span>
          <pre style="flex:1;margin:0;white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;line-height:18px;background:#fff;border-radius:16px;padding:14px;box-shadow:inset 0 0 0 1px rgba(20,18,17,.08)">CORTEX PROFILE
INTERESTS: ${INTERESTS[p.id]}
QUESTIONS (${p.count}):
${p.sampleQs.map((q) => '· ' + q).join('\n')}
· …
UNFINISHED: ${p.q}</pre></div>`,
          cta: `<button class="btn-lit" data-copyout>Copy answer and go back</button><p class="fine">In the real flow you’d switch apps. Here it’s simulated.</p>` }, (sh) => {
          sh.querySelector('[data-copyout]').addEventListener('click', () => { ctx.closeSheet(); done('open'); enable('paste'); ctx.toast('Answer copied'); });
        });
      });
      const ready = () => { el.querySelector('[data-go]').disabled = false; ctx.brain.touch(0, 0); };
      el.querySelector('[data-act="paste"]').addEventListener('click', () => { done('paste'); ready(); ctx.toast(`${ctx.p.count} questions pasted`); });
      el.querySelector('[data-shot]').addEventListener('click', () => { ['copy', 'open', 'paste'].forEach(done); ready(); ctx.toast('Screenshot added'); });
      el.querySelector('[data-skip]').addEventListener('click', () => ctx.switchDir('wonder'));
      el.querySelector('[data-go]').addEventListener('click', () => ctx.next());
    },
  };

  S.meter = {
    brain: () => ({ at: 'mid', mode: 'think', lobes: 0 }),
    render: (ctx) => `
      <div style="height:360px"></div>
      <p class="t-eyebrow center">Reading your questions</p>
      <p class="center" style="margin:8px 0 0;font-family:var(--title);font-weight:600;font-size:56px;letter-spacing:-.03em;font-variant-numeric:tabular-nums" data-count>0</p>
      <div style="height:8px;border-radius:4px;background:rgba(20,18,17,.08);margin-top:14px;overflow:hidden"><div data-bar style="height:100%;width:0;background:var(--cobalt-500);border-radius:4px;transition:width 120ms linear"></div></div>
      <p class="t-small center" style="margin-top:8px" data-lab>Understanding you… 0%</p>
      <div data-qs style="height:40px;margin-top:12px;position:relative"></div>
      <div class="cta"><button class="btn-lit" data-go disabled>See what I found</button></div>`,
    mount(el, ctx) {
      const total = ctx.p.count, dur = 3800, t0 = performance.now();
      const c = el.querySelector('[data-count]'), bar = el.querySelector('[data-bar]'), lab = el.querySelector('[data-lab]'), qs = el.querySelector('[data-qs]');
      let qi = 0;
      const tick = () => {
        const k = Math.min(1, (performance.now() - t0) / dur), e = 1 - Math.pow(1 - k, 2);
        c.textContent = Math.round(total * e); bar.style.width = e * 100 + '%'; lab.textContent = `Understanding you… ${Math.round(e * 100)}%`;
        ctx.brain.setLobes(e * 0.85);
        if (k < 1) ctx.later(tick, 60); else { lab.textContent = 'Got it. I know what makes you curious.'; ctx.brain.setMode('idle'); el.querySelector('[data-go]').disabled = false; }
      };
      tick();
      const showQ = () => { if (qi >= ctx.p.sampleQs.length) return; qs.innerHTML = `<p class="t-small center fade" style="color:var(--ink)">“${ctx.p.sampleQs[qi++]}”</p>`; ctx.later(showQ, 620); };
      showQ();
      el.querySelector('[data-go]').addEventListener('click', () => ctx.next());
    },
  };

  S.wrapped = {
    light: true,
    brain: () => ({ at: 'off', lobes: 0.85 }),
    render: (ctx) => `
      <div class="ia" data-bg style="position:absolute;inset:0;background:radial-gradient(90% 60% at 15% 10%, ${ctx.p.deep}, transparent 65%), radial-gradient(80% 60% at 90% 85%, #0B2A66, transparent 60%), linear-gradient(160deg, ${ctx.p.deep}, #141211 75%);"></div>
      <div style="position:relative;display:flex;gap:4px;margin-top:4px" data-bars>${[0, 1, 2].map(() => '<span style="flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.3);overflow:hidden"><i style="display:block;height:100%;width:0;background:#fff"></i></span>').join('')}</div>
      <p style="position:relative;margin:14px 0 0;color:#fff;font-size:12px;font-weight:600;letter-spacing:.1em">YOUR CURIOSITY, WRAPPED</p>
      <div style="position:relative;flex:1;display:flex;flex-direction:column;justify-content:center" data-ch></div>
      <div class="cta dark"><div style="display:flex;gap:10px"><button class="btn-glass" data-nextch>Next</button><button class="btn-icon-glass" data-shr aria-label="Share">${I.share}</button></div>
        <p style="margin:0;text-align:center;color:#fff;font-size:13px;font-weight:500">Or tap anywhere</p></div>`,
    mount(el, ctx) {
      let i = 0; const ch = el.querySelector('[data-ch]'), bars = el.querySelectorAll('[data-bars] i');
      const show = () => {
        const w = ctx.p.wrapped[i];
        bars.forEach((b, j) => { b.style.transition = 'none'; b.style.width = j < i ? '100%' : '0'; });
        requestAnimationFrame(() => { bars[i].style.transition = 'width 5s linear'; bars[i].style.width = '100%'; });
        ch.innerHTML = `<p class="rise" style="margin:0;color:#fff;font-family:var(--title);font-weight:600;font-size:${w.big.length > 4 ? 64 : 96}px;line-height:1;letter-spacing:-.04em">${w.big}</p>
          <p class="rise" style="margin:12px 0 0;color:#fff;font-family:var(--title);font-weight:600;font-size:30px;line-height:34px;letter-spacing:-.03em;animation-delay:120ms">${w.line}</p>
          <p class="rise" style="margin:14px 0 0;color:#fff;font-size:17px;line-height:24px;font-weight:500;animation-delay:240ms">${w.sub}</p>`;
      };
      show();
      const adv = () => { i++; if (i >= ctx.p.wrapped.length) ctx.next(); else show(); };
      el.querySelector('[data-bg]').addEventListener('click', adv); el.querySelector('[data-nextch]').addEventListener('click', adv);
      el.querySelector('[data-shr]').addEventListener('click', () => ctx.toast('Saved to Photos'));
    },
  };

  S.confirm = {
    brain: () => ({ at: 'small', lobes: 0.85 }),
    render: (ctx) => `
      <div style="height:200px"></div>
      <p class="t-eyebrow center rise">One last thing</p>
      <h1 class="t-title center rise" style="margin-top:8px;animation-delay:60ms">Looks like ${ctx.p.confirm.charAt(0).toLowerCase() + ctx.p.confirm.slice(1, -1)}. Right?</h1>
      <p class="t-body center rise" style="margin-top:10px;animation-delay:120ms">I’ll shape every answer around that.</p>
      <div data-alt class="ia" style="display:none;gap:8px;margin-top:20px;flex-wrap:wrap;justify-content:center">
        ${['For fun', 'For work', 'For study', 'To go deep'].map((x) => `<button class="chip sm" data-pick>${x}</button>`).join('')}
      </div>
      <div class="cta"><button class="btn-lit" data-yes>Yes, that’s me</button>
      <button class="btn-carved" data-no>Not quite</button></div>`,
    mount(el, ctx) {
      el.querySelector('[data-yes]').addEventListener('click', () => { ctx.brain.touch(0, 0); ctx.later(() => ctx.next(), 300); });
      el.querySelector('[data-no]').addEventListener('click', () => { el.querySelector('[data-alt]').style.display = 'flex'; });
      el.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => { b.setAttribute('aria-pressed', 'true'); ctx.later(() => ctx.next(), 450); }));
    },
  };

  S.beforeafter = {
    brain: () => ({ at: 'off' }),
    render: (ctx) => `
      <div style="height:20px"></div>
      <p class="t-eyebrow rise">The one you never finished</p>
      <h1 class="t-title rise" style="margin-top:6px;animation-delay:60ms">${ctx.p.q}</h1>
      <div data-old class="card rise" style="margin-top:16px;animation-delay:140ms;background:#EFEDEB;box-shadow:none;overflow:hidden;max-height:330px;transition:max-height 700ms var(--sheet), padding 700ms var(--sheet), opacity 400ms">
        <p class="t-eyebrow">What ChatGPT gave you</p>
        <p data-oldtext style="margin:8px 0 0;font-size:14px;line-height:20px;color:#57534F">${ctx.p.chatgpt}</p>
      </div>
      <div data-pill style="display:none;margin-top:12px;align-self:flex-start;padding:8px 14px;border-radius:999px;background:#EFEDEB;font-size:13px;font-weight:600;color:#57534F">ChatGPT · ${ctx.p.chatgptWords} words · skimmed once</div>
      <div class="cta" data-after style="opacity:0;transition:opacity 500ms ease-out">
        <p class="t-eyebrow center" style="color:var(--cobalt-700)">Here’s how Cortex explains it</p>
        <button class="btn-lit" data-next>Open it</button>
      </div>`,
    mount(el, ctx) {
      const old = el.querySelector('[data-old]');
      ctx.later(() => { old.style.maxHeight = '0px'; old.style.paddingTop = '0'; old.style.paddingBottom = '0'; old.style.opacity = '0'; el.querySelector('[data-pill]').style.display = 'inline-block'; el.querySelector('[data-pill]').classList.add('fade'); }, 2200);
      ctx.later(() => { ctx.setBrain({ at: 'hero', mode: 'think' }); ctx.caption('Thinking…'); }, 2700);
      ctx.later(() => { ctx.setBrain({ at: 'hero', shape: ctx.p.shape, palette: ctx.p.palette, mode: 'idle' }); ctx.caption(ctx.p.thinking); }, 4300);
      ctx.later(() => { ctx.caption(''); el.querySelector('[data-after]').style.opacity = 1; }, 5800);
    },
  };

  S.explore = {
    brain: (ctx) => ({ at: 'badge', shape: ctx.p.shape, palette: ctx.p.palette }),
    render: (ctx) => {
      const p = ctx.p, wonder = ctx.dir === 'wonder';
      const styleName = { story: 'stories', diagram: 'pictures', analogy: 'analogies' }[ctx.run.style || p.style];
      return `<div class="scroll ia">
        <div class="topbar"><button class="close-btn" aria-label="Close" data-x>${I.close}</button><span style="width:70px"></span></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap" class="rise">${subjectTag(p)}${p.id === 'dev' ? '<span class="tag" style="background:#141211">Expert depth</span>' : ''}${wonder ? `<span class="tag" style="background:var(--cobalt-500)">With ${styleName}, your way</span>` : ''}</div>
        <h1 class="t-title rise" style="margin-top:10px;animation-delay:40ms">${p.q}</h1>
        <div style="margin-top:16px">${EXPLORE[p.id].html(ctx)}</div>
      </div>
      <div class="dock-cta"><button class="btn-lit" data-next>Keep going</button></div>`;
    },
    mount(el, ctx) {
      EXPLORE[ctx.p.id].mount(el, ctx);
      el.querySelector('[data-x]').addEventListener('click', () => ctx.toast('Close goes back to Ask home'));
    },
  };

  S.paywall = {
    brain: (ctx) => ({ at: 'small', shape: ctx.p.shape, palette: ctx.p.palette }),
    render: (ctx) => `
      <div style="height:200px"></div>
      <p class="t-eyebrow center rise">Keep going</p>
      <h1 class="t-title center rise" style="margin-top:6px;animation-delay:60ms">3 threads pulling from here</h1>
      <div class="ia" style="display:grid;gap:10px;margin-top:20px">
        ${ctx.p.rabbit.map((r, i) => `<button class="card rise" data-hole style="border:0;text-align:left;display:flex;align-items:center;gap:12px;padding:16px 18px;animation-delay:${120 + i * 70}ms"><span style="flex:1;font-family:var(--title);font-weight:600;font-size:17px;letter-spacing:-.015em;line-height:22px">${r}</span><span style="color:var(--cobalt-500)">${I.arrow}</span></button>`).join('')}
      </div>
      <div class="cta"><button class="btn-lit" data-keep>Keep exploring</button><p class="t-small center">Or tap a thread to follow it.</p></div>`,
    mount(el, ctx) {
      const p = ctx.p;
      const signIn = () => ctx.sheet({ body: `
          <div class="center" style="margin-top:4px">${ORB(72)}</div>
          <h2 class="t-title center" style="margin-top:6px">Save your brain</h2>
          <p class="t-body center" style="margin-top:8px">Your questions, threads and progress, kept safe and here tomorrow.</p>`,
        cta: `<button class="btn-apple" data-si>${I.apple} Continue with Apple</button>
          <button class="btn-google" data-si>${GOOGLE} Continue with Google</button>
          <button class="link-btn" data-si>Use email instead</button>
          <p class="fine">By continuing you agree to the Terms and Privacy Policy.</p>` },
        (sh) => sh.querySelectorAll('[data-si]').forEach((b) => b.addEventListener('click', () => { ctx.closeSheet(); ctx.later(() => ctx.next(), 230); })));
      const student = p.id === 'meera';
      const plans = student ? [['Yearly', '$2.08 a month, billed $24.99', 'Save 30%'], ['Monthly', '$2.99 a month', '']] : [['Yearly', '$4.17 a month, billed $49.99', 'Save 48%'], ['Monthly', '$7.99 a month', '']];
      const perkIc = [I.star, I.arrow, I.check];
      const pay = () => ctx.sheet({ body: `
          <div class="center" style="margin-top:2px">${ORB(64)}</div>
          <p class="t-eyebrow center" style="color:var(--cobalt-700);margin-top:4px">Cortex Plus${student ? ' · student price' : ''}</p>
          <h2 class="t-title center" style="margin-top:6px">${p.paywall.title}</h2>
          <p class="t-body center" style="margin-top:6px">${p.paywall.sub}</p>
          <div style="display:grid;gap:12px;margin:20px 0 18px">${p.paywall.perks.map((x, i) => `<div class="perk"><span class="perk-ic">${perkIc[i]}</span><b>${x}</b></div>`).join('')}</div>
          <div style="display:grid;gap:10px" role="radiogroup" aria-label="Plan">${plans.map(([a, b, c], i) => `<button class="plan" data-plan role="radio" aria-pressed="${i === 0}" aria-checked="${i === 0}"><span class="radio"></span><span class="pl"><b>${a}</b><span>${b}</span></span>${c ? `<span class="save">${c}</span>` : ''}</button>`).join('')}</div>
          <p class="fine" style="margin-top:12px">Cancel any time. I’ll remind you a day before the trial ends.</p>`,
        cta: `<button class="btn-lit" data-trial>Start 3 days free</button>
          <button class="link-btn" data-free>Continue with the free plan</button>
          <p class="fine">Free: 3 explorations a day. Prices are placeholders.</p>` }, (sh) => {
        sh.querySelectorAll('[data-plan]').forEach((b) => b.addEventListener('click', () => sh.querySelectorAll('[data-plan]').forEach((x) => { x.setAttribute('aria-pressed', x === b); x.setAttribute('aria-checked', x === b); })));
        sh.querySelector('[data-trial]').addEventListener('click', () => { ctx.closeSheet(); ctx.later(signIn, 260); });
        sh.querySelector('[data-free]').addEventListener('click', () => { ctx.closeSheet(); ctx.later(signIn, 260); });
      });
      el.querySelectorAll('[data-hole],[data-keep]').forEach((b) => b.addEventListener('click', pay));
    },
  };

  S.notif = {
    brain: () => ({ at: 'mid' }),
    render: (ctx) => `
      <div style="height:360px"></div>
      <h1 class="t-title center rise">Can I nudge you?</h1>
      <p class="t-body center rise" style="margin-top:10px;animation-delay:60ms">${ctx.p.notif}</p>
      <div class="cta"><button class="btn-lit" data-on>Turn on notifications</button>
      <button class="link-btn" data-next>Not now</button></div>`,
    mount(el, ctx) {
      el.querySelector('[data-on]').addEventListener('click', () => {
        const a = document.createElement('div');
        a.innerHTML = `<div class="sheet-backdrop" style="z-index:44"></div><div class="ios-alert"><div class="body"><b>“Cortex” Would Like to Send You Notifications</b><p>Notifications may include alerts, sounds and icon badges.</p></div><div class="row"><button data-n>Don’t Allow</button><button data-n>Allow</button></div></div>`;
        ctx.root.appendChild(a); ctx.onCleanup(() => a.remove());
        a.querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => { a.remove(); ctx.next(); }));
      });
    },
  };

  S.home = {
    brain: (ctx) => ({ at: 'home', lobes: ctx.dir === 'seen' ? 0.85 : 0.2 }),
    render: (ctx) => {
      const h = new Date().getHours(), greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
      return `<div style="display:flex;align-items:center;justify-content:space-between" class="rise"><span style="font-family:var(--title);font-weight:600;font-size:20px;letter-spacing:-.02em">${greet}, ${ctx.p.greet}</span>${AVATAR(ctx.p, 34)}</div>
      <div style="height:240px"></div>
      <h1 class="t-title center rise" style="animation-delay:80ms">What are you curious about?</h1>
      <div style="margin-top:16px" class="rise">${composer('Ask anything')}</div>
      <p class="t-eyebrow" style="margin-top:18px">${ctx.dir === 'seen' ? 'From your questions' : 'For you'}</p>
      <div class="ia" style="display:grid;gap:8px;margin-top:8px">${ctx.p.homeSparks.map((s, i) => `<button class="chip sm rise" style="animation-delay:${160 + i * 60}ms" data-hs>${s}</button>`).join('')}</div>
      <nav class="tabbar" aria-label="Tabs">
        <button aria-current="page">${I.star}Ask</button><button data-tab>${I.compass}Explore</button><button data-tab>${I.target}Practice</button><button data-tab>${I.memory}Memory</button>
      </nav>`;
    },
    mount(el, ctx) {
      const end = () => ctx.toast('End of onboarding. ↻ replays it.');
      el.querySelector('[data-field]').addEventListener('click', end);
      el.querySelectorAll('[data-hs],[data-tab],.send,.mic').forEach((b) => b.addEventListener('click', end));
    },
  };

  // ---- Ask direction ----
  S.askhello = {
    brain: () => ({ at: 'mid' }),
    render: (ctx) => {
      const set = QSET[ctx.pid].map((id) => ({ text: PERSONAS[id].q, label: SPARK_LABEL[id], hint: id === ctx.pid, id }));
      return `<div style="height:300px"></div>
      <h1 class="t-title center rise">What are you curious about?</h1>
      <p class="t-body center rise" style="margin-top:6px;animation-delay:60ms">Ask anything. I’ll show you, not just tell you.</p>
      <div style="margin-top:16px" class="rise">${composer('Ask anything')}</div>
      <div class="ia" style="display:grid;gap:8px;margin-top:12px">${sparksHTML(ctx, set, { delay: 120 })}</div>`;
    },
    mount(el, ctx) {
      wireComposer(el, ctx, () => ctx.next());
      const ids = QSET[ctx.pid];
      el.querySelectorAll('[data-spark]').forEach((b) => b.addEventListener('click', () => {
        const id = ids[+b.dataset.spark];
        if (id !== ctx.pid) { ctx.toast(`That spark says “${SPARK_LABEL[id].toLowerCase()}”, so this is ${PERSONAS[id].name}’s path`); ctx.setPersona(id, true); }
        else ctx.next();
      }));
    },
  };

  S.thinking = {
    brain: () => ({ at: 'mid', mode: 'listen' }),
    render: (ctx) => `<div style="display:flex;flex-direction:column;margin-top:20px">${userBubble(ctx.p.q)}</div><div class="spacer"></div><p class="t-small center">Tap the brain while it thinks.</p>`,
    mount(el, ctx) {
      ctx.caption('Listening…');
      ctx.later(() => { ctx.setBrain({ at: 'mid', mode: 'think' }); ctx.caption('Thinking…'); }, 900);
      ctx.later(() => { ctx.setBrain({ at: 'mid', mode: 'idle', shape: ctx.p.shape, palette: ctx.p.palette }); ctx.caption(ctx.p.thinking); }, 2600);
      ctx.later(() => { ctx.caption(''); ctx.next(); }, 4600);
    },
  };

  S.quick = {
    brain: (ctx) => ({ at: 'top', shape: ctx.p.shape, palette: ctx.p.palette }),
    render: (ctx) => `<div style="display:flex;flex-direction:column;margin-top:4px">${userBubble(ctx.p.q)}</div>
      <div style="height:250px"></div>
      <div class="bezel rise"><div class="card">${subjectTag(ctx.p)}<p class="t-card" style="margin-top:10px;font-size:19px;line-height:25px">${ctx.p.quick}</p></div></div>
      <div class="cta"><button class="btn-lit" data-next>Explore it</button>
      <button class="btn-carved" data-quiz>${ctx.p.id === 'dev' ? 'Go deeper: expert mode' : 'Quiz me'}</button></div>`,
    mount(el, ctx) { el.querySelector('[data-quiz]').addEventListener('click', () => { ctx.toast(ctx.p.id === 'dev' ? 'Expert depth on' : 'The quick check is inside the Exploration'); ctx.later(() => ctx.next(), 600); }); },
  };

  S.teach = {
    brain: () => ({ at: 'small' }),
    render: (ctx) => {
      const why = { riya: 'For fun', sam: 'For work', meera: 'For study', dev: 'To go deep' }[ctx.pid];
      const how = { riya: 'Stories', sam: 'Pictures', meera: 'Pictures', dev: 'The maths' }[ctx.pid];
      return `<div style="height:166px"></div>
      <h1 class="t-title center rise">Want answers shaped to you?</h1>
      <p class="t-body center rise" style="margin-top:6px;animation-delay:60ms">Two taps. Then watch this card change.</p>
      <p class="t-eyebrow" style="margin-top:18px">Why do you explore?</p>
      <div class="ia" data-g1 style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">${['For fun', 'For work', 'For study', 'To go deep'].map((x) => `<button class="chip sm ${x === why ? 'hinted' : ''}">${x}</button>`).join('')}</div>
      <p class="t-eyebrow" style="margin-top:14px">How do you like it explained?</p>
      <div class="ia" data-g2 style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">${['Stories', 'Pictures', 'Analogies', 'The maths'].map((x) => `<button class="chip sm ${x === how ? 'hinted' : ''}">${x}</button>`).join('')}</div>
      <div class="card" data-rc style="margin-top:16px;padding:16px;transition:opacity 260ms"><p class="t-eyebrow">Before</p><p style="margin:6px 0 0;font-size:15px;line-height:21px;font-weight:500">${ctx.p.quick}</p></div>
      <div class="cta"><button class="btn-lit" data-next disabled data-cont>Continue</button></div>`;
    },
    mount(el, ctx) {
      let a = false, b = false;
      const pick = (grp, setFlag) => el.querySelectorAll(`[data-${grp}] button`).forEach((btn) => btn.addEventListener('click', () => {
        el.querySelectorAll(`[data-${grp}] button`).forEach((x) => x.setAttribute('aria-pressed', x === btn)); setFlag(); ctx.brain.touch(0, 0);
        if (a && b) {
          const rc = el.querySelector('[data-rc]'); rc.style.opacity = 0;
          ctx.later(() => { rc.innerHTML = `<p class="t-eyebrow" style="color:var(--cobalt-700)">Now, your way · ${ctx.p.yourWay.label}</p><p style="margin:6px 0 0;font-size:15px;line-height:21px;font-weight:500">${ctx.p.yourWay.text}</p>`; rc.style.boxShadow = 'inset 0 0 0 2px var(--cobalt-500), var(--card-shadow)'; rc.style.opacity = 1; el.querySelector('[data-cont]').disabled = false; }, 280);
        }
      }));
      pick('g1', () => { a = true; }); pick('g2', () => { b = true; });
    },
  };

  S.importoffer = {
    brain: () => ({ at: 'mid', lobes: 0.15 }),
    render: () => `<div style="height:360px"></div>
      <h1 class="t-title center rise">Bring your ChatGPT questions?</h1>
      <p class="t-body center rise" style="margin-top:8px;animation-delay:60ms">I’ll find the ones you never finished, and light up your brain with what you’re curious about.</p>
      <p class="t-small center" data-st style="margin-top:12px;min-height:18px;color:var(--cobalt-700);font-weight:600"></p>
      <div class="cta"><button class="btn-lit" data-bring>Bring them</button>
      <button class="btn-carved" data-next>Maybe later</button></div>`,
    mount(el, ctx) {
      el.querySelector('[data-bring]').addEventListener('click', (e) => {
        e.currentTarget.disabled = true; ctx.brain.setMode('think'); const st = el.querySelector('[data-st]'); st.textContent = 'Reading your questions…';
        ctx.brain.setLobes(0.85);
        ctx.later(() => { ctx.brain.setMode('idle'); st.textContent = `${ctx.p.count} questions. I’ll remember what you never finished.`; }, 2200);
        ctx.later(() => ctx.next(), 3800);
      });
    },
  };

  // ---- Wonder direction ----
  const SPHERES = [['Why is the sky blue?', 12, 120], ['Do fish sleep?', 250, 100], ['What is déjà vu?', 4, 420], ['Why do we yawn?', 260, 430], ['Can plants hear?', 30, 250], ['What’s inside the sun?', 238, 270]];
  S.spheres = {
    brain: () => ({ at: 'mid' }),
    render: () => `
      ${SPHERES.map(([t, x, y], i) => `<button class="ia sphere" data-sph style="left:${x}px;top:${y}px;animation-delay:${i * -1.3}s, ${i * 90}ms">${t}</button>`).join('')}
      <style>.sphere{position:absolute;width:108px;height:108px;border-radius:50%;border:0;padding:12px;font-size:12.5px;line-height:15px;font-weight:600;color:var(--ink);background:radial-gradient(circle at 32% 28%,#fff 0,#F1EEF4 35%,#D6D3E0 100%);box-shadow:inset -6px -10px 18px rgba(20,18,17,.08),inset 4px 6px 8px rgba(255,255,255,.9),0 12px 24px rgba(20,18,17,.12);animation:float 7s ease-in-out infinite, rise 600ms var(--out) both;}
      .sphere[aria-pressed=true]{background:radial-gradient(circle at 32% 28%,#CFDDFF 0,#7FA3FF 45%,#1F5BE0 100%);color:#fff}
      @keyframes float{50%{transform:translateY(-12px)}}</style>
      <div class="spacer"></div>
      <h1 class="t-title center rise" style="animation-delay:300ms">Let’s see how your brain likes to learn.</h1>
      <div class="cta"><button class="btn-lit rise" style="animation-delay:400ms" data-next>Let’s go</button>
      <button class="link-btn rise" style="animation-delay:460ms" data-skip>Skip to my question</button></div>`,
    mount(el, ctx) {
      el.querySelectorAll('[data-sph]').forEach((b) => b.addEventListener('click', () => { b.setAttribute('aria-pressed', 'true'); ctx.toast('Saved for later'); }));
      el.querySelector('[data-skip]').addEventListener('click', () => ctx.goId('yours'));
    },
  };

  S.guess = {
    brain: () => ({ at: 'small' }),
    render: () => `<div style="height:180px"></div>
      <p class="t-eyebrow center rise">Guess first</p>
      <h1 class="t-title center rise" style="margin-top:6px;animation-delay:60ms">How much blood does your heart pump in a day?</h1>
      <div data-ask class="ia" style="margin-top:26px">
        <p class="center" style="margin:0;font-family:var(--title);font-weight:600;font-size:52px;letter-spacing:-.03em;font-variant-numeric:tabular-nums" data-v>100 L</p>
        <input type="range" min="0" max="100" value="38" data-r aria-label="Your guess, in litres" style="margin-top:10px">
        <div class="t-small" style="display:flex;justify-content:space-between"><span>1 litre</span><span>20,000 litres</span></div>
      </div>
      <div data-rev style="display:none;margin-top:10px"></div>
      <div class="cta"><button class="btn-lit" data-lock>Lock it in</button></div>`,
    mount(el, ctx) {
      const r = el.querySelector('[data-r]'), v = el.querySelector('[data-v]');
      const val = () => Math.round(Math.pow(10, (r.value / 100) * Math.log10(20000)));
      const fmt = (n) => n.toLocaleString('en-US') + ' L';
      const upd = () => { rangeFill(r); v.textContent = fmt(val()); }; r.addEventListener('input', upd); upd();
      const lock = el.querySelector('[data-lock]');
      lock.addEventListener('click', () => {
        if (lock.dataset.done) return ctx.next();
        const g = val(), ratio = 7500 / g;
        el.querySelector('[data-ask]').style.display = 'none';
        const rev = el.querySelector('[data-rev]'); rev.style.display = 'block';
        rev.innerHTML = `<div class="bezel rise"><div class="card center">
          <p class="t-eyebrow">The answer</p>
          <p style="margin:6px 0 0;font-family:var(--title);font-weight:600;font-size:52px;letter-spacing:-.03em;color:#A3264F">7,500 L</p>
          <p class="t-card" style="margin-top:6px">A home swimming pool, every week.</p>
          <p class="t-small" style="margin-top:8px">You guessed ${fmt(g)}${ratio > 1.3 ? `, about ${Math.round(ratio)}× too low` : ratio < 0.77 ? `, about ${Math.round(1 / ratio)}× too high` : '. Close!'}. Most people guess way low.</p>
        </div></div>`;
        ctx.setBrain({ at: 'small', shape: 'heart', palette: 'body' });
        lock.textContent = 'Next'; lock.dataset.done = 1;
      });
    },
  };

  const TASTE = [
    { k: 'story', label: 'A story', body: 'Your heart started beating before you were born and hasn’t paused since. About 100,000 beats today.' },
    { k: 'diagram', label: 'A picture', body: '<svg viewBox="0 0 200 120" width="100%" style="max-height:96px;display:block" aria-label="Diagram: the right side pumps to the lungs, the left side to the body"><rect x="40" y="30" width="54" height="64" rx="16" fill="#F6C9D5"/><rect x="106" y="30" width="54" height="64" rx="16" fill="#D84A72"/><text x="67" y="66" text-anchor="middle" font-size="11" font-weight="700" fill="#A3264F" font-family="Inter">Right</text><text x="133" y="66" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="Inter">Left</text><path d="M67 28 C67 8, 30 8, 20 20" stroke="#7FA3FF" stroke-width="4" fill="none" stroke-linecap="round"/><text x="10" y="14" font-size="10" font-weight="600" fill="#1A47B8" font-family="Inter">to lungs</text><path d="M133 28 C133 6, 175 6, 186 22" stroke="#A3264F" stroke-width="4" fill="none" stroke-linecap="round"/><text x="150" y="112" font-size="10" font-weight="600" fill="#A3264F" font-family="Inter">to body</text></svg>' },
    { k: 'analogy', label: 'An analogy', body: 'Two pumps glued together. The right one does the short trip to your lungs; the left one does the long trip to everything else, so it’s stronger.' },
  ];
  S.taste = {
    brain: () => ({ at: 'off', shape: 'heart', palette: 'body' }),
    render: (ctx) => `<div style="height:14px"></div>
      <h1 class="t-title rise">Which explanation clicks?</h1>
      <p class="t-body rise" style="margin-top:6px;animation-delay:60ms">Same idea, three ways. Tap the one that feels right.</p>
      <div class="ia" style="display:grid;gap:10px;margin-top:16px">
        ${TASTE.map((t, i) => `<button class="card rise" data-t="${t.k}" style="border:0;text-align:left;padding:14px 16px;animation-delay:${120 + i * 80}ms;${t.k === (ctx.p.style) ? 'box-shadow:inset 0 0 0 2px rgba(31,91,224,.35),var(--card-shadow)' : ''}"><p class="t-eyebrow">${t.label}</p><div style="margin-top:4px;font-size:14px;line-height:20px;font-weight:500">${t.body}</div></button>`).join('')}
      </div>
      <div class="cta"><p class="t-card center" data-ack style="margin:0;min-height:24px;color:var(--cobalt-700)"></p>
      <button class="btn-lit" data-next data-c disabled>Continue</button></div>`,
    mount(el, ctx) {
      el.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
        el.querySelectorAll('[data-t]').forEach((x) => { x.style.boxShadow = x === b ? 'inset 0 0 0 2.5px var(--cobalt-500), var(--card-shadow)' : 'var(--card-shadow)'; x.setAttribute('aria-pressed', x === b); });
        ctx.run.style = b.dataset.t; ctx.brain.touch(0, 0);
        el.querySelector('[data-ack]').textContent = { story: 'Got it. You think in stories.', diagram: 'Got it. You think in pictures.', analogy: 'Got it. You think in analogies.' }[b.dataset.t];
        el.querySelector('[data-c]').disabled = false;
      }));
    },
  };

  S.why = {
    brain: () => ({ at: 'small', shape: 'heart', palette: 'body' }),
    render: (ctx) => `<div style="height:190px"></div>
      <h1 class="t-title center rise">Why do you explore?</h1>
      <div class="ia" style="display:grid;gap:10px;margin-top:22px">
        ${[['joy', 'For the joy', 'Things that make me go “whoa”'], ['work', 'For work', 'Get up to speed, fast'], ['study', 'For study', 'Understand it, then prove it']].map(([k, a, b], i) => `<button class="chip rise ${k === ctx.p.why ? 'hinted' : ''}" data-w="${k}" style="padding:16px 18px;animation-delay:${80 + i * 70}ms"><b style="display:block;font-family:var(--title);font-size:18px;letter-spacing:-.015em">${a}</b><span class="t-small">${b}</span></button>`).join('')}
      </div>
      <p class="t-card center" data-ack style="margin-top:18px;min-height:48px;color:var(--cobalt-700)"></p>
      <div class="cta"><button class="btn-lit" data-next data-c disabled>Continue</button></div>`,
    mount(el, ctx) {
      const ack = { joy: 'Joy. I’ll find things that make you go whoa.', work: ctx.pid === 'dev' ? 'Work. I’ll go technical and cite the papers.' : 'Work. I’ll use examples from your world, with sources.', study: 'Study. I’ll explain it, then check you’ve got it.' };
      el.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => {
        el.querySelectorAll('[data-w]').forEach((x) => x.setAttribute('aria-pressed', x === b));
        ctx.brain.setMode('listen'); ctx.later(() => ctx.brain.setMode('idle'), 900);
        el.querySelector('[data-ack]').textContent = ack[b.dataset.w]; el.querySelector('[data-c]').disabled = false;
      }));
    },
  };

  S.yours = {
    brain: () => ({ at: 'mid' }),
    render: (ctx) => `<div style="height:300px"></div>
      <h1 class="t-title center rise">Now yours. What have you always wondered about?</h1>
      <div style="margin-top:16px" class="rise">${composer('Type or say it')}</div>
      <div class="ia" style="display:grid;gap:8px;margin-top:12px">${sparksHTML(ctx, [{ text: ctx.p.q, hint: true }, { text: ctx.p.homeSparks[0] }, { text: ctx.p.homeSparks[1] }], { delay: 120 })}</div>`,
    mount(el, ctx) {
      wireComposer(el, ctx, () => ctx.next());
      el.querySelectorAll('[data-spark]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.spark === '0') ctx.next(); else ctx.toast('Only the highlighted spark is built in this prototype'); }));
    },
  };

  window.SCREENS = S;
})();
