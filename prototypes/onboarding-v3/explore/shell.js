// Shell: frame scaling, side panel, wiring between modules.
(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  if (params.has('still')) document.documentElement.classList.add('still');

  function fit() { const s = Math.min(1, (window.innerHeight - 48) / 844); window.PS = s; $('phoneWrap').style.transform = `scale(${s})`; $('phoneHolder').style.width = 390 * s + 'px'; $('phoneHolder').style.height = 844 * s + 'px'; }
  window.addEventListener('resize', fit); fit();

  Brain.mount($('brain')); $('brain').style.display = 'block';
  if (params.has('still')) setInterval(() => Brain.snap(), 150);

  const mods = [window.Explore, window.MapUI, window.Finale].filter(Boolean);
  if (window.Explore) Explore.mount($('exploreLayer'));
  if (window.MapUI) MapUI.mount($('mapLayer'));
  if (window.Finale) Finale.mount($('finaleLayer'));

  const PARTS = [['Exploration', () => Bus.emit('reset', {})], ['Zoom out to your map', () => window.MapUI && MapUI.demo && MapUI.demo()], ['Save to your brain', () => window.Finale && Finale.demo && Finale.demo()]];
  let cur = 0;
  function renderJump() {
    const A = ["Your brain asks millions", "A world of questions", "What if…", "Welcome to Cortex", "A few quick questions", "Main learning goal", "What do you do?", "What to ponder"];
    $('jump').innerHTML = A.map((n, k) => `<button onclick="location.href='../?s=${k + 1}'"><i>${k + 1}</i>${n}</button>`).join('') +
      PARTS.map((p, k) => `<button data-j="${k}" ${k === cur ? 'aria-current="step"' : ''}><i>${A.length + k + 1}</i>${p[0]}</button>`).join('');
    $('jump').querySelectorAll('[data-j]').forEach((b) => b.addEventListener('click', () => { cur = +b.dataset.j; renderJump(); PARTS[cur][1](); }));
  }
  Bus.on('map:state', ({ open }) => { cur = open ? 1 : 0; renderJump(); });
  Bus.on('session:done', () => { cur = 2; renderJump(); });
  Bus.on('reset', () => { cur = 0; renderJump(); });
  $('replay').addEventListener('click', () => Bus.emit('reset', {}));
  renderJump();

  if (window.Explore && Explore.start) Explore.start();
  const j = parseInt(params.get('part'), 10); if (j > 1) setTimeout(() => PARTS[j - 1][1](), 300);
})();
