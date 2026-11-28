// Line icons (24×24, stroke). The same paths draw the option icons and become particle shapes for the brain.
(function () {
  const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const rect = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
  window.ICONS = {
    briefcase: [rect(2, 7, 20, 14, 2.5), 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16', 'M2 13h20'],
    target: [circ(12, 12, 10), circ(12, 12, 6), circ(12, 12, 2)],
    book: ['M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z', 'M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z'],
    bolt: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
    sparkle: ['M12 3l1.9 5.8L20 10.8l-6.1 2L12 19l-1.9-6.2L4 10.8l6.1-2z', 'M19 2v4', 'M21 4h-4', 'M5 18v4', 'M7 20H3'],
    code: ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6', 'M14 4l-4 16'],
    cap: ['M22 10L12 5 2 10l10 5 10-5z', 'M6 12v5c3 3 9 3 12 0v-5', 'M22 10v6'],
    building: ['M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z', 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', 'M10 6h4', 'M10 10h4', 'M10 14h4', 'M10 18h4'],
    map: ['M9 4L3 7v13l6-3 6 3 6-3V4l-6 3-6-3z', 'M9 4v13', 'M15 7v13'],
    pen: ['M12 19l7-7 3 3-7 7-3-3z', 'M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z', 'M2 2l7.6 7.6', circ(11, 11, 2)],
    search: [circ(11, 11, 7.5), 'M21 21l-4.6-4.6'],
    trend: ['M22 7l-8.5 8.5-5-5L2 17', 'M16 7h6v6'],
    rocket: ['M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z', 'M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z', 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0', 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'],
    megaphone: ['M3 11l18-5v12L3 14v-3z', 'M11.6 16.8a3 3 0 1 1-5.8-1.6'],
    board: ['M2 3h20', 'M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3', 'M7 21l5-5 5 5'],
  };
  window.iconSVG = (name, size = 22, sw = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name].map((d) => `<path d="${d}"/>`).join('')}</svg>`;

  // Register every icon (and a big "?") as a particle shape
  function register() {
    Object.entries(ICONS).forEach(([name, paths]) => Brain.defineIcon(name, (x, S) => {
      x.save(); x.translate(S * 0.08, S * 0.08); x.scale(S * 0.84 / 24, S * 0.84 / 24); x.lineWidth = 2.6;
      paths.forEach((d) => x.stroke(new Path2D(d))); x.restore();
    }));
    const q = () => Brain.defineIcon('qmark', (x, S) => { x.font = `800 ${S * 0.9}px "Geist", ui-sans-serif, system-ui`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', S / 2, S * 0.54); }, { scale: 0.92 });
    q();
    if (document.fonts) document.fonts.load('800 200px "Geist"').then(q).catch(() => {});
  }
  register();
})();

// ---------- Solid colour icons (style A): own colour gradient on a white tile ----------
// Each icon: { c: [light, deep], s: [[pathD, opts]] } — opts.hole cuts the shape (white), opts.op = opacity
(function () {
  const R = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
  const C = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
  const H = { hole: true };
  const SPARK = [['M10.5 2.5l2.1 5.9 5.9 2.1-5.9 2.1-2.1 5.9-2.1-5.9-5.9-2.1 5.9-2.1z'], ['M18.6 13.6l1.1 3 3 1.1-3 1.1-1.1 3-1.1-3-3-1.1 3-1.1z']];
  window.FICONS = {
    work: { c: ['#F5A524', '#E0662E'], s: [['M9 3.2h6a2.2 2.2 0 0 1 2.2 2.2V7h-2.4V5.6H9.2V7H6.8V5.4A2.2 2.2 0 0 1 9 3.2z'], [R(2, 7, 20, 13.8, 3.6)], [R(2, 12.2, 20, 1.6, 0), H], [R(10.4, 11.2, 3.2, 3.6, 1)]] },
    exam: { c: ['#FF8A80', '#E5484D'], s: [[C(12, 12, 10)], [C(12, 12, 6.8), H], [C(12, 12, 4.4)], [C(12, 12, 1.8), H]] },
    school: { c: ['#5CCB8A', '#1F9D63'], s: [[R(3, 15.2, 18, 5.6, 1.8)], [R(5, 9.2, 15, 5.2, 1.8), { op: 0.85 }], [R(3.8, 3.4, 15.4, 5, 1.8), { op: 0.7 }]] },
    sharpen: { c: ['#A78BFA', '#6D4AE0'], s: [['M12 2a7 7 0 0 0-4.2 12.6V17a1.2 1.2 0 0 0 1.2 1.2h6a1.2 1.2 0 0 0 1.2-1.2v-2.4A7 7 0 0 0 12 2z'], [R(9, 19.4, 6, 2.6, 1.3)], ['M12.9 5.6l-3.4 4.9h2.3l-.9 4 3.4-4.9h-2.3z', H]] },
    fun: { c: ['#5FD0F2', '#1A8FD0'], s: SPARK },
    engineer: { c: ['#818CF8', '#4F46E5'], s: [[R(2, 3.5, 20, 13.5, 2.6)], [R(8, 19, 8, 2.2, 1.1)], ['M9.3 7.4l1 1-1.9 1.9 1.9 1.9-1 1-2.9-2.9z', H], ['M14.7 7.4l2.9 2.9-2.9 2.9-1-1 1.9-1.9-1.9-1.9z', H]] },
    student: { c: ['#4FD1C5', '#0F9F9A'], s: [['M12 3.5L1.5 8.5 12 13.5l10.5-5z'], ['M5.5 11.2v4.3c0 1.6 2.9 3 6.5 3s6.5-1.4 6.5-3v-4.3L12 14.3z', { op: 0.85 }], [R(20.4, 8.6, 1.4, 6.4, 0.7)]] },
    business: { c: ['#6A93E0', '#2E5AAC'], s: [[R(4.5, 2.5, 10.5, 19, 1.8)], [R(15.6, 8, 4.4, 13.5, 1.4), { op: 0.7 }], [R(7, 5.6, 2, 2, 0.5), H], [R(10.6, 5.6, 2, 2, 0.5), H], [R(7, 9.6, 2, 2, 0.5), H], [R(10.6, 9.6, 2, 2, 0.5), H], [R(7, 13.6, 2, 2, 0.5), H], [R(10.6, 13.6, 2, 2, 0.5), H], [R(8.7, 18, 2.2, 3.5, 0.5), H]] },
    pm: { c: ['#FFA94D', '#E8590C'], s: [[R(2.5, 3.5, 19, 17, 3)], [R(5, 7, 4, 3.2, 0.9), H], [R(5, 11.6, 4, 3.2, 0.9), H], [R(10, 7, 4, 5.2, 0.9), H], [R(15, 7, 4, 3.2, 0.9), H], [R(15, 11.6, 4, 5.6, 0.9), H]] },
    designer: { c: ['#F783AC', '#D6336C'], s: [['M12 2.2l6.4 7.6L12 21.8 5.6 9.8z'], [C(12, 11.2, 1.7), H], [R(11.35, 2.2, 1.3, 8.2, 0.6), H]] },
    researcher: { c: ['#5FD0F2', '#1A8FD0'], s: [[C(10, 10, 7.4)], [C(10, 10, 4.8), H], ['M14.6 16.4l1.8-1.8 5.4 5.4a1.27 1.27 0 0 1-1.8 1.8z']] },
    finance: { c: ['#5CCB8A', '#1F9D63'], s: [[R(3, 14, 4.4, 7, 1.3), { op: 0.65 }], [R(9.8, 9.6, 4.4, 11.4, 1.3), { op: 0.82 }], [R(16.6, 4.6, 4.4, 16.4, 1.3)]] },
    founder: { c: ['#FF8A80', '#E5484D'], s: [['M12 2c3.3 2.3 5 5.8 5 10.2 0 1.6-.2 3-.6 4.3H7.6c-.4-1.3-.6-2.7-.6-4.3C7 7.8 8.7 4.3 12 2z'], ['M7.4 12.6L4 16.4v3.6l4-2.3z', { op: 0.8 }], ['M16.6 12.6l3.4 3.8v3.6l-4-2.3z', { op: 0.8 }], ['M10 17.6h4l-.9 4h-2.2z', { op: 0.7 }], [C(12, 9.4, 1.9), H]] },
    marketing: { c: ['#FFD43B', '#E8A10E'], s: [['M3 9.5h3.5l9-5.5v16l-9-5.5H3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z'], ['M6.6 15l1.8 5.2a1 1 0 0 0 1 .7h1.7l-1.9-5.9z', { op: 0.8 }], [R(17.4, 9.9, 2.6, 4.2, 1.3)]] },
    teacher: { c: ['#A78BFA', '#6D4AE0'], s: [[R(2, 3, 20, 13, 2.4)], [R(5, 6.4, 9, 1.7, 0.85), H], [R(5, 9.8, 6, 1.7, 0.85), H], [R(11.2, 16, 1.6, 3.4, 0.4)], ['M7.6 21.6l3.2-3h2.4l3.2 3z']] },
    other: { c: ['#F783AC', '#845EF7'], s: SPARK },
  };
  // SVG for a tile icon (own gradient glyph; holes become white)
  let uid = 0;
  window.fillSVG = (name, size = 28) => {
    const ic = FICONS[name], id = 'fg' + (++uid);
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ic.c[0]}"/><stop offset="1" stop-color="${ic.c[1]}"/></linearGradient></defs>` +
      ic.s.map(([d, o = {}]) => `<path d="${d}" fill="${o.hole ? '#fff' : `url(#${id})`}"${o.op ? ` opacity="${o.op}"` : ''}/>`).join('') + '</svg>';
  };
  // Particle shapes 'f-<name>' coloured with the icon's own gradient
  Object.entries(FICONS).forEach(([name, ic]) => Brain.defineIcon('f-' + name, (x, S) => {
    x.save(); x.translate(S * 0.08, S * 0.08); x.scale(S * 0.84 / 24, S * 0.84 / 24);
    ic.s.forEach(([d, o = {}]) => { x.globalCompositeOperation = o.hole ? 'destination-out' : 'source-over'; x.globalAlpha = 1; x.fill(new Path2D(d)); });
    x.restore(); x.globalCompositeOperation = 'source-over';
  }, { grad: ic.c, scale: 0.95 }));
})();
