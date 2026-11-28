// Orb glyphs: one small drawing per idea, in four styles, for the Profile knowledge graph (and its detail card).
// Owner: D · Profile. Global: window.OrbGlyphs.
//
//   OrbGlyphs.svg(ideaId, style, subject, size, opts) → '<svg …>' string
//     style   'i' Drawn (ember ink line, draws itself on) · 'ii' Painted (gouache, grain) ·
//             'iii' Duotone (two tones of the subject) · 'iv' Scenes (hubs are little scenes; ideas use iii)
//     subject 'body' | 'mind' | 'space' | 'tech' | 'nature' | 'arts' | 'society' | 'history'
//     size    the px size the glyph renders at (sets stroke weight)
//     opts    { hub, ghost, label, draw (animate the ink on), delay (ms), motif (force a drawing key) }
//   OrbGlyphs.motif(ideaId, subject, label) → the drawing key (id map → label keywords → subject fallback)
//   OrbGlyphs.colours(subject) → { name, mid, deep, light, tint } for the current theme (Living or the original)
//
// Every drawing is a list of parts with a role. Each style paints the same parts its own way:
//   b body fill · d deep fill · p pale fill · l deep line · m mid line · c light "cut" line · o dot
// so one set of drawings gives four looks that still name the same idea.
(function () {
  'use strict';

  // ---------- Colours ----------
  const LIVING = () => window.THEME === 'living';
  const PAL = {
    // Living Matter: seven warm, earthy hues that sit inside the bone/ember world
    living: {
      space: ['Space', '#5D4380', '#3A2657'],    // dusk indigo-plum
      nature: ['Nature', '#6A8A34', '#42601D'],  // moss
      body: ['Body', '#D4502F', '#A0301A'],      // ember coral
      mind: ['Mind', '#C25B80', '#8C3458'],      // clay rose
      tech: ['Tech', '#D69A2D', '#8A5A0C'],      // ochre
      arts: ['Arts', '#3F8A82', '#235F59'],      // verdigris teal
      society: ['Society', '#5F7389', '#3A4A5E'], // slate
      history: ['History', '#9A6B45', '#674125'], // sepia
    },
    // The original Geist/cobalt build keeps its own colours
    classic: {
      body: ['Body', '#D84A72', '#A3264F'], mind: ['Mind', '#7457E0', '#4A30B0'], space: ['Space', '#56619A', '#2F3766'],
      tech: ['Tech', '#2A8FC4', '#165F87'], nature: ['Nature', '#3F9E52', '#22692F'], society: ['Society', '#7E9A2A', '#526612'],
      history: ['History', '#C8922A', '#7E5408'], arts: ['Arts', '#B04AA8', '#7E2777'],
    },
  };
  const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const toHex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  const mix = (a, b, t) => toHex(hx(a).map((v, i) => v + (hx(b)[i] - v) * t));
  const colourCache = {};
  function colours(subj) {
    const theme = LIVING() ? 'living' : 'classic', key = theme + subj;
    if (colourCache[key]) return colourCache[key];
    const row = PAL[theme][subj] || PAL[theme].mind, paper = theme === 'living' ? '#FFF8F1' : '#FFFFFF';
    return (colourCache[key] = { name: row[0], mid: row[1], deep: row[2], light: mix(row[1], paper, 0.6), tint: mix(row[1], paper, 0.86), paper });
  }
  const WARM = { shell: '#FFF8F1', cream: '#FBEEDC', bone: '#F3E3CF', humus: '#3E2317', bark: '#6A4636', saffron: '#EFB43E', coral: '#F07B5A' };
  const ink = () => (LIVING() ? '#A93519' : '#1A47B8');

  // ---------- Geometry helpers ----------
  const n2 = (v) => +v.toFixed(2);
  const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  // move + scale an absolute M/L/C/Q/Z path drawn around (24, 24)
  function xf(d, cx, cy, s) {
    let i = 0;
    return d.replace(/-?\d*\.?\d+/g, (m) => { const v = +m; const out = i % 2 === 0 ? cx + (v - 24) * s : cy + (v - 24) * s; i++; return n2(out); });
  }
  const HEART = 'M24 39.5C14 32.5 7 26.5 7 18.5C7 12.5 11.5 9 16 9C19.5 9 22 11 24 14C26 11 28.5 9 32 9C36.5 9 41 12.5 41 18.5C41 26.5 34 32.5 24 39.5Z';
  const heart = (cx, cy, s) => xf(HEART, cx, cy, s);
  const star4 = (x, y, r) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;
  function rays(cx, cy, r1, r2, n, a0 = 0) {
    let d = '';
    for (let k = 0; k < n; k++) { const a = a0 + (k / n) * Math.PI * 2; d += `M${n2(cx + Math.cos(a) * r1)} ${n2(cy + Math.sin(a) * r1)}L${n2(cx + Math.cos(a) * r2)} ${n2(cy + Math.sin(a) * r2)}`; }
    return d;
  }
  function spiral(cx, cy, r0, r1, turns, a0 = 0) {
    const n = Math.round(48 * turns); let d = '';
    for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + t * turns * Math.PI * 2, r = r0 + (r1 - r0) * t; d += (i ? 'L' : 'M') + n2(cx + Math.cos(a) * r) + ' ' + n2(cy + Math.sin(a) * r); }
    return d;
  }
  function polar(cx, cy, fr, n = 120) {
    let d = '';
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = fr(a); d += (i ? 'L' : 'M') + n2(cx + Math.cos(a) * r) + ' ' + n2(cy + Math.sin(a) * r); }
    return d + 'Z';
  }
  const ring = (cx, cy, R, r) => `M${cx - R} ${cy}A${R} ${R} 0 1 0 ${cx + R} ${cy}A${R} ${R} 0 1 0 ${cx - R} ${cy}ZM${cx - r} ${cy}A${r} ${r} 0 1 1 ${cx + r} ${cy}A${r} ${r} 0 1 1 ${cx - r} ${cy}Z`;

  // ---------- Parts ----------
  const P = (r, d, o) => Object.assign({ r, d }, o);
  const C = (r, cx, cy, rad, o) => Object.assign({ r, c: [cx, cy, rad] }, o);
  const E = (r, cx, cy, rx, ry, rot, o) => Object.assign({ r, e: [cx, cy, rx, ry, rot || 0] }, o);

  // ---------- The drawings (48 × 48) ----------
  const M = {
    // Body
    heartbeat: () => [P('b', HEART), P('c', 'M10.5 23H16.5L19 17.5L23 30L26.5 19.5L29 24H37.5', { w: 0.95 })],
    racing: () => [P('l', 'M3 17H9M2 24H7.5M4 31H10', { w: 0.9 }), P('b', heart(27, 24, 0.86)), P('c', 'M16.5 23.5H21L23 19L26.5 29.5L29.5 21L31.5 24H37', { w: 0.9 }), P('d', 'M41 4.5C41 4.5 37.5 9 37.5 11.2A3.5 3.5 0 0 0 44.5 11.2C44.5 9 41 4.5 41 4.5Z')],
    pump: () => [P('b', heart(24, 28, 0.8)), P('l', 'M18.5 16V4.5M14.5 8.5L18.5 4.5L22.5 8.5M29.5 16V4.5M25.5 8.5L29.5 4.5L33.5 8.5', { w: 1 }), P('c', 'M15 24C15 22 16.4 20.6 18.4 20.6', { w: 0.85 })],
    heart: () => [P('b', HEART), P('c', 'M13.5 18.5C13.5 15.5 15.5 13.5 18 13.5', { w: 0.9 })],
    muscle: () => [P('b', HEART), P('c', 'M12 19C18 23 30 23 36 19M14.5 25.5C20 29 28 29 33.5 25.5M19 31.5C22.5 33.5 25.5 33.5 29 31.5', { w: 0.85 })],
    rooms: () => [P('b', HEART), P('c', 'M24 15V37M9 22.5H39', { w: 0.95 }), C('o', 17, 17, 1.6), C('o', 31, 17, 1.6), C('o', 17.5, 28, 1.6), C('o', 30.5, 28, 1.6)],
    valve: () => [C('b', 24, 24, 15), P('c', 'M24 24V9.5M24 24L36.6 31.2M24 24L11.4 31.2'), C('o', 24, 24, 2.4)],
    spark: () => [P('b', 'M27 5L12 27H22L19 43L36 19H26Z'), P('l', 'M38 8L41.5 4.5M40.5 14.5H45M8 37L4.5 40.5'), P('c', 'M24 12L18.5 24', { w: 0.8 })],
    circuits: () => [P('m', 'M24 24C19 14.5 6.5 14.5 6.5 24C6.5 33.5 19 33.5 24 24', { w: 1.5 }), P('l', 'M24 24C29 14.5 41.5 14.5 41.5 24C41.5 33.5 29 33.5 24 24', { w: 1.5 }), P('l', 'M13 15.5L16.5 17.6L13.8 20.5M35 32.5L31.5 30.4L34.2 27.5'), C('o', 24, 24, 3)],
    gauge: () => [P('b', 'M5.5 34A18.5 18.5 0 0 1 42.5 34Z'), P('c', 'M10.5 27.5L13.5 29M24 18.5V21.5M37.5 27.5L34.5 29', { w: 0.9 }), P('l', 'M24 34L33 21.5', { w: 1.2 }), C('o', 24, 34, 3.4)],
    monitor: () => [P('b', rr(5, 11, 38, 26, 5)), P('c', 'M9 26H13.5L15.5 19.5L18.5 31L21 15.5L24 33L26 22L27.5 26H31L32.8 21.5L34.6 28.5L36.2 26H39', { w: 0.9 }), P('l', 'M18 42H30')],
    broken: () => [P('b', HEART), P('c', 'M23 13.5L27.5 20.5L21 25.5L27 31L24 38', { w: 1.05 })],
    coronary: () => [P('b', HEART), P('c', 'M23.5 14.5C22 20 18 22.5 13 22.5M20.5 20.5C20.5 26 18.5 30 16.5 32M26 16C28 22 32.5 24.5 36.5 23.5M30.5 23.5C30.5 28.5 29 31 27.5 34', { w: 0.85 })],
    plaque: () => [C('b', 24, 24, 16), C('p', 24, 24, 10.5), P('d', 'M13.6 25.5A10.5 10.5 0 0 0 34.4 25.5C30 22 18 22 13.6 25.5Z'), C('o', 19, 21, 1.4), C('o', 28.5, 19.5, 1)],
    dumbbell: () => [P('l', 'M15 24H33', { w: 1.6 }), P('b', rr(5, 14, 7.5, 20, 2.5)), P('b', rr(35.5, 14, 7.5, 20, 2.5)), P('d', rr(12, 17.5, 4, 13, 1.5)), P('d', rr(32, 17.5, 4, 13, 1.5))],
    cycle: () => [P('l', 'M24 7A17 17 0 0 1 41 24M24 41A17 17 0 0 1 7 24', { w: 1.1 }), P('l', 'M36.5 22L41 26.5L44.5 21.5M11.5 26L7 21.5L3.5 26.5', { w: 1.1 }), P('b', heart(24, 24.5, 0.42))],
    lungs: () => [P('b', 'M21 15C15 14 8 23 8 32C8 38 12 40.5 16 39.5C20 38.5 21 35 21 31Z'), P('b', 'M27 15C33 14 40 23 40 32C40 38 36 40.5 32 39.5C28 38.5 27 35 27 31Z'), P('l', 'M24 5V20M24 20L19.5 25M24 20L28.5 25'), P('c', 'M15 26L13 31M33 26L35 31', { w: 0.8 })],
    aorta: () => [P('m', 'M21 30V18C21 8.5 37 8.5 37 18V27', { w: 2.2 }), P('l', 'M25.5 11V4.5M29 9.6V3.5M32.5 11V4.5'), P('b', heart(20, 34, 0.5))],
    stethoscope: () => [P('l', 'M13 6V15C13 23 25 23 25 15V6M19 21.5V30C19 38.5 34 40.5 34 30V27.5', { w: 1.05 }), C('b', 34, 22.5, 5.5), C('o', 34, 22.5, 2), C('o', 13, 5.5, 2.2), C('o', 25, 5.5, 2.2)],
    watch: () => [P('d', rr(17.5, 4, 13, 9, 2.5)), P('d', rr(17.5, 35, 13, 9, 2.5)), C('b', 24, 24, 13), P('c', 'M14.5 24H18.5L20.5 19.5L24 29L26.2 21.5L27.8 24H33.5', { w: 0.9 })],
    drop: () => [P('b', 'M24 5.5C24 5.5 11 20.5 11 29A13 13 0 0 0 37 29C37 20.5 24 5.5 24 5.5Z'), P('c', 'M17 29A7 7 0 0 0 21.5 35.5', { w: 0.9 })],
    saltdrop: () => [P('b', 'M21 6C21 6 9 20 9 28A12 12 0 0 0 33 28C33 20 21 6 21 6Z'), P('c', 'M14.5 28A6.5 6.5 0 0 0 18.5 34', { w: 0.9 }), P('d', rr(35, 26, 6, 6, 1.2)), P('d', rr(37, 36, 5, 5, 1)), P('l', star4(39, 15, 4.5), { w: 0.7 })],
    flask: () => [P('b', 'M20 6.5H28V18.5L39 37.5C40.5 40.5 38.5 42.5 36 42.5H12C9.5 42.5 7.5 40.5 9 37.5L20 18.5Z'), P('d', 'M14 29.5H34L39 37.5C40.5 40.5 38.5 42.5 36 42.5H12C9.5 42.5 7.5 40.5 9 37.5Z'), P('l', 'M17.5 6.5H30.5'), C('c', 21, 35.5, 1.9, { w: 0.8 }), C('c', 28, 33, 1.3, { w: 0.8 })],
    dna: () => [P('m', 'M15 4C15 16 33 16 33 24C33 32 15 32 15 44', { w: 1.35 }), P('l', 'M33 4C33 16 15 16 15 24C15 32 33 32 33 44', { w: 1.35 }), P('c', 'M18 9.5H30M19.5 19H28.5M19.5 29H28.5M18 38.5H30', { w: 0.9 })],
    larynx: () => [P('b', rr(15, 6, 18, 6, 3)), P('b', rr(15, 15, 18, 6, 3)), P('b', rr(15, 24, 18, 6, 3)), P('b', rr(15, 33, 18, 6, 3)), P('l', 'M24 3V45', { w: 0.8 })],
    folds: () => [E('b', 24, 24, 13, 18), P('d', 'M24 9C18 17 16.5 30 18.5 38.5H22C21 30 21.5 18 24 9ZM24 9C30 17 31.5 30 29.5 38.5H26C27 30 26.5 18 24 9Z')],
    // Mind
    brain: () => [P('b', 'M24 10C20 7 13 8 12 13C7 14 5 20 8 24C5 28 8 34 13 34C14 39 20 40.5 24 37.5C28 40.5 34 39 35 34C40 34 43 28 40 24C43 20 41 14 36 13C35 8 28 7 24 10Z'),
      P('c', 'M24 11V36.5M14 20C17 19 19.5 21 19.5 24M34 20C31 19 28.5 21 28.5 24M15 29.5C18 28.5 20 30.5 20 32.5M33 29.5C30 28.5 28 30.5 28 32.5', { w: 0.85 })],
    neuron: () => [P('l', 'M21 18L17 9M17 9L12.5 6M17 9L18 4M18.5 25L9 27.5M9 27.5L5 24M9 27.5L6.5 32M28 17L36 9.5M36 9.5L41 10M36 9.5L37 5M28.5 28L38 40M38 40H43.5M38 40L39 45M33 34L37.5 32.5'),
      C('b', 24, 22, 8), C('o', 24, 22, 2.6)],
    glia: () => [P('l', rays(24, 24, 7, 18.5, 6, -Math.PI / 2), { w: 1.25 }), C('b', 24, 24, 9), ...[0, 1, 2, 3, 4, 5].map((k) => { const a = -Math.PI / 2 + (k / 6) * Math.PI * 2; return C('o', n2(24 + Math.cos(a) * 19.5), n2(24 + Math.sin(a) * 19.5), 2.4); }), C('c', 24, 24, 3, { w: 0.8 })],
    moon: () => [P('b', 'M29 7A17 17 0 1 0 41 33A14 14 0 1 1 29 7Z'), P('o', star4(36, 12, 4.2)), P('o', star4(41.5, 21, 2.6)), C('c', 15, 22, 2, { w: 0.75 }), C('c', 19, 31, 1.3, { w: 0.75 })],
    notes: () => [E('b', 15, 35, 5.5, 4.2, -20), E('b', 32, 31, 5.5, 4.2, -20), P('l', 'M20 34V12.5M37 30V9', { w: 0.9 }), P('d', 'M19 11L38 7.5V13.5L19 17Z')],
    forget: () => [P('b', 'M13 31C7 31 5.5 23.5 10.5 21.5C10 15 17 12 20.5 15C22.5 10 31 9.5 33 15C38 14 42 19 39.5 24C42.5 28.5 38 32.5 34 31Z'), P('c', 'M20.5 20.5C20.5 17.5 27.5 17.5 27.5 21C27.5 24 24 24 24 26.5', { w: 0.9 }), C('o', 24, 29.2, 1.5),
      C('o', 15, 37, 2.6, { op: 0.75 }), C('o', 10, 41.5, 1.9, { op: 0.5 }), C('o', 6, 45, 1.3, { op: 0.3 })],
    scanner: () => [P('b', ring(24, 22, 17, 10), { er: 1 }), P('d', rr(3, 31, 42, 5, 2.5)), C('o', 24, 22, 3.6)],
    battery: () => [P('b', rr(5, 14, 33, 20, 4)), P('d', rr(38, 19.5, 5, 9, 2)), P('c', 'M24.5 17.5L18.5 25H24.5L21 31', { w: 1 })],
    // Space
    planet: () => [E('l', 24, 25, 21, 6.5, -18, { w: 0.9 }), C('b', 24, 25, 11.5), P('c', 'M14 21.5C20 24 28 24 34 21', { w: 0.8 }), P('l', 'M4.1 31.2C6.5 35.5 22 32.5 34 27.5', { w: 0.9 }), C('o', 39, 9, 1.8), C('o', 9, 11, 1.2)],
    blackhole: () => [P('l', spiral(24, 24, 3, 19, 2.2, 0.4), { w: 1 }), C('d', 24, 24, 5.5)],
    galaxy: () => [C('l', 24, 24, 20.5, { dash: '2.2 3.6', w: 0.75 }), E('b', 24, 24, 16, 6.5, -28), P('c', 'M12 29.5C16 23 26 19.5 35.5 18.2M12.5 30.2C20 28.5 30 25 36 18.5', { w: 0.75 }), C('d', 24, 24, 4.2), C('o', 9, 12, 1.3), C('o', 39, 36, 1.3), C('o', 38, 9.5, 1)],
    sun: () => [P('l', rays(24, 24, 13.5, 19.5, 8, Math.PI / 8), { w: 1.05 }), C('b', 24, 24, 9.5), P('c', 'M19 21A6 6 0 0 1 23 18', { w: 0.85 })],
    sunclock: () => [P('l', rays(24, 24, 15, 20, 12), { w: 0.85 }), C('b', 24, 24, 12.5), P('c', 'M24 24V15.5M24 24L29.5 27', { w: 1.05 }), C('o', 24, 24, 1.8)],
    giant: () => [C('b', 20, 27, 16), P('c', 'M10 22A11 11 0 0 1 16 15', { w: 0.9 }), C('d', 40.5, 9, 3.2), P('l', 'M40.5 2.5V4.2M40.5 13.8V15.5M34 9H35.7M45.3 9H47', { w: 0.6 })],
    atom: () => [E('l', 24, 24, 19.5, 7.5, 0, { w: 0.85 }), E('l', 24, 24, 19.5, 7.5, 60, { w: 0.85 }), E('l', 24, 24, 19.5, 7.5, -60, { w: 0.85 }), C('b', 21.5, 24, 5), C('d', 27, 24, 5)],
    // Tech
    chip: () => [P('l', 'M18 6V13M24 6V13M30 6V13M18 35V42M24 35V42M30 35V42M6 18H13M6 24H13M6 30H13M35 18H42M35 24H42M35 30H42'), P('b', rr(12.5, 12.5, 23, 23, 3.5)), P('d', rr(18.5, 18.5, 11, 11, 2))],
    fork: () => [P('m', 'M18 5V20C18 26.5 30 26.5 30 20V5', { w: 1.6 }), P('l', 'M24 26V43', { w: 1.6 }), P('l', 'M11.5 9C8.5 13 8.5 17 11.5 21M36.5 9C39.5 13 39.5 17 36.5 21M6.5 6C2.5 12 2.5 18 6.5 24M41.5 6C45.5 12 45.5 18 41.5 24', { w: 0.8 })],
    sine: () => [P('c', 'M4 24H44', { w: 0.7, dash: '1.5 3' }), P('l', 'M4 24C8 9 12 9 16 24C20 39 24 39 28 24C32 9 36 9 40 24C41.5 29.6 43 32 44 33', { w: 1.3 }), C('b', 10, 12.8, 3.4), C('b', 34, 12.8, 3.4)],
    code: () => [P('l', 'M15.5 13L6.5 24L15.5 35M32.5 13L41.5 24L32.5 35', { w: 1.5 }), P('m', 'M27.5 9.5L20.5 38.5', { w: 1.5 })],
    // Nature
    leaf: () => [P('b', 'M9.5 38.5C7.5 22 18 8.5 40 7.5C41 28.5 28 40.5 9.5 38.5Z'), P('c', 'M9.5 38.5C17.5 30 26 21 35 12.5M17 31L16.5 23.5M22.5 25.5L22.5 17.5M28 20.5L29 14M17 31L24.5 32M22.5 25.5L30.5 26.5M28 20.5L34 21', { w: 0.85 }), P('l', 'M9.5 38.5L5 43')],
    leafsun: () => [P('l', rays(36, 12, 7.5, 11.5, 8), { w: 0.8 }), C('d', 36, 12, 5), P('b', 'M7 42C5.5 29 13.5 18.5 31 17.5C32 34 21.5 43.5 7 42Z'), P('c', 'M7 42C13.5 35.5 20 28.5 27 22M14 36.5L13.5 30.5M19.5 31L20 25M14 36.5L20.5 37M19.5 31L26 31.5', { w: 0.8 })],
    carrot: () => [P('l', 'M33.5 14.5C32 10 33.5 5.5 37 4M34.5 15.5C38.5 12 42.5 11.5 44.5 13M34.5 15.5C38 15 41 17 42 20.5', { w: 1.05 }), P('b', 'M8 41C12 34 25 19.5 31 15C34 13 37.5 16 35.5 19.5C31 26 17 38 8 41Z'), P('c', 'M19.5 31L22.5 33.5M25 25L28 27.5M14.5 36.5L16.5 38', { w: 0.85 })],
    berries: () => [P('l', 'M24 12V5C24 5 30 3.5 34 7', { w: 0.95 }), P('d', 'M24 6C28 2.5 35 3 37 7.5C32 9.5 27 9 24 6Z'), C('b', 17, 31, 7.5), C('b', 31, 31, 7.5), C('b', 24, 19, 7.5), C('c', 15, 29, 1.6, { w: 0.75 }), C('c', 29, 29, 1.6, { w: 0.75 }), C('c', 22, 17, 1.6, { w: 0.75 })],
    tree: () => [P('l', 'M14 25V35M34 24V35', { w: 1.3 }), P('l', 'M6 36H42', { w: 0.8 }), P('m', 'M14 35C17 43 31 43 34 35', { w: 0.9, dash: '2 2.6' }), C('b', 14, 17, 8.5), C('b', 34, 15, 9.5), P('c', 'M10 15A4.5 4.5 0 0 1 13.5 11.5M29.5 13A5 5 0 0 1 33 9', { w: 0.8 })],
    sprout: () => [P('l', 'M24 42V22', { w: 1.2 }), P('b', 'M24 27C22 18.5 14 15 7 17C8 24.5 15.5 29 24 27Z'), P('d', 'M24 22.5C26 13 33.5 8.5 41 10.5C40 19 32.5 23.5 24 22.5Z'), P('l', 'M13 42.5H35', { w: 1.2 })],
    cat: () => [P('b', 'M10 18.5L11 6L19.5 12C22.5 11 25.5 11 28.5 12L37 6L38 18.5C40 22.5 40 28 38 32C35 39 29.5 42 24 42C18.5 42 13 39 10 32C8 28 8 22.5 10 18.5Z'),
      C('o', 18, 24.5, 2.3), C('o', 30, 24.5, 2.3), P('d', 'M21.8 29H26.2L24 31.6Z'), P('l', 'M24 31.6C24 34 21.5 35 20 33.5M24 31.6C24 34 26.5 35 28 33.5', { w: 0.65 }), P('l', 'M3 27.5L13.5 29M3.5 33.5L13.5 31.5M45 27.5L34.5 29M44.5 33.5L34.5 31.5', { w: 0.65 })],
    catcall: () => [P('b', 'M7 15L8 5.5L14.5 10H33.5L40 5.5L41 15V28A4.5 4.5 0 0 1 36.5 32.5H21L13 40V32.5H11.5A4.5 4.5 0 0 1 7 28Z'), C('o', 18, 20, 2.1), C('o', 30, 20, 2.1), P('c', 'M20.5 25.5C22 27 26 27 27.5 25.5', { w: 0.85 }), P('l', 'M44 37L46 35M41 42L44 42', { w: 0.7 })],
    lion: () => [P('d', polar(24, 24, (a) => 18.5 + 2.6 * Math.cos(a * 11), 132)), C('b', 24, 25, 11), C('o', 20, 23, 1.8), C('o', 28, 23, 1.8), P('l', 'M22 28.5H26L24 31ZM24 31V33M24 33C22.5 34.5 21 34.5 20 33.5M24 33C25.5 34.5 27 34.5 28 33.5', { w: 0.65 })],
    octopus: () => [P('m', 'M15 29C13 35 7 34 6 39.5M20 30C19 37 14 38 15 43M28 30C29 37 34 38 33 43M33 29C35 35 41 34 42 39.5', { w: 1.6 }), P('b', 'M24 5.5C33 5.5 37.5 12.5 37.5 20C37.5 25 35.5 28.5 33 31H15C12.5 28.5 10.5 25 10.5 20C10.5 12.5 15 5.5 24 5.5Z'), C('o', 19, 19.5, 2.4), C('o', 29, 19.5, 2.4), P('c', 'M14.5 13.5C15.5 11 17.5 9.5 20 9', { w: 0.8 })],
    threehearts: () => [P('d', heart(11.5, 31, 0.36)), P('d', heart(36.5, 31, 0.36)), P('b', heart(24, 20, 0.6)), P('c', 'M16 17.5C16 15.5 17.5 14 19.5 14', { w: 0.8 })],
    tentacle: () => [P('m', 'M8 44C8 30 16 22 26 20C35 18.5 40 24 37 30C34.5 35 27.5 33 28.5 28.5C29 26 32 25.5 33 27.5', { w: 3.2 }), C('c', 13.5, 33, 1.7, { w: 0.75 }), C('c', 18.5, 26.5, 1.7, { w: 0.75 }), C('c', 25, 23.5, 1.6, { w: 0.75 }), C('c', 32, 22.8, 1.4, { w: 0.75 }), C('o', 40, 10, 2.6), C('o', 34, 7, 1.7), C('o', 44, 16, 1.4)],
    croc: () => [P('l', 'M21.5 28L19.5 34.5M31 28L33 34.5', { w: 1.1 }), P('b', 'M3 25.5C5.5 21.5 11 21 16 21L23 19C30 17.5 36.5 19 40.5 22C43.5 24.5 45.5 27.5 46 31C41.5 28.5 37.5 28 33 28H16C11 28 5.5 28 3 25.5Z'),
      P('c', 'M25 19.6L27 17.6L29 19.4L31 17.6L33 19.6L35 18.2', { w: 0.75 }), P('c', 'M4.5 24.6L6 26.2L7.5 24.6L9 26.2L10.5 24.6', { w: 0.7 }), C('o', 17.5, 18.8, 2.1), C('o', 4.8, 23.3, 0.9)],
    reeds: () => [P('l', 'M13.5 34C13.5 25 12.5 19 10.5 13M20 34V10M27 34C27 27 28.5 21.5 31.5 16', { w: 0.95 }), P('b', rr(8.3, 7.5, 4.4, 10, 2.2)), P('b', rr(17.8, 4.5, 4.4, 10, 2.2)), P('d', 'M31 18C34 12 39 10 42 11C40 15 35.5 18 31 18Z'),
      P('m', 'M4 37C7 35 10 35 13 37C16 39 19 39 22 37C25 35 28 35 31 37C34 39 37 39 40 37C41.5 36 43 35.5 44 35.8', { w: 1 }), C('o', 33, 34, 1.5), C('o', 37.5, 34, 1.5)],
    // Arts
    camera: () => [P('d', 'M16 14L19 9H29L32 14Z'), P('b', rr(5, 13.5, 38, 26, 5.5)), C('d', 24, 26.5, 8.5), C('c', 24, 26.5, 4.2, { w: 0.9 }), C('o', 37, 19, 1.8)],
    iris: () => {
      const parts = [C('b', 24, 24, 17)];
      let d = '';
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2, b = a + 1.25; d += `M${n2(24 + Math.cos(a) * 6)} ${n2(24 + Math.sin(a) * 6)}L${n2(24 + Math.cos(b) * 16.5)} ${n2(24 + Math.sin(b) * 16.5)}`; }
      parts.push(P('c', d, { w: 0.85 }), P('d', polar(24, 24, () => 6, 6)));
      return parts;
    },
    triangle: () => [P('b', 'M24 6L43 39H5Z'), C('c', 24, 28, 5, { w: 0.9 }), C('o', 24, 6.5, 3), C('o', 42.5, 39, 3), C('o', 5.5, 39, 3)],
    thirds: () => [P('b', rr(5, 10, 38, 28, 4)), P('c', 'M17.7 10V38M30.3 10V38M5 19.3H43M5 28.7H43', { w: 0.8 }), C('o', 30.3, 19.3, 3.4)],
    brush: () => [P('b', 'M37 5C39 3.2 43 7 41.2 9L27 25L22.5 20.5Z'), P('d', 'M22.5 20.5L27 25L24 28L19.5 23.5Z'), P('d', 'M19.5 23.5L24 28C22.5 35 15 39 7.5 40.5C9 33.5 12.5 25.5 19.5 23.5Z'), P('m', 'M5 45C13 43 21 45.5 29.5 42.5', { w: 1.2 })],
    frame: () => [P('b', rr(7, 7, 34, 34, 3)), P('p', rr(12, 12, 24, 24, 1.5)), P('m', 'M15 30C19 22 24 33 33 18', { w: 1.6 }), C('o', 30, 17, 2.4)],
    // Society / talk / money
    people: () => [C('o', 16, 14.5, 5.2), C('o', 32, 14.5, 5.2), P('b', 'M6.5 38C6.5 28 10.5 23.5 16 23.5C21.5 23.5 25.5 28 25.5 38Z'), P('b', 'M22.5 38C22.5 28 26.5 23.5 32 23.5C37.5 23.5 41.5 28 41.5 38Z'), C('d', 24, 22, 4.4), P('d', 'M15.5 41C15.5 33 19 29 24 29C29 29 32.5 33 32.5 41Z')],
    houses: () => [P('b', 'M5 40V24L14 16L23 24V40Z'), P('d', 'M23 40V20L33.5 10L44 20V40Z'), P('c', rr(11, 30, 6, 10, 1), { w: 0.8 }), P('c', rr(30, 22, 7, 6, 1) + rr(30, 31, 7, 6, 1), { w: 0.8 }), P('l', 'M3 41H45')],
    speech: () => [P('b', 'M6 8H30A4 4 0 0 1 34 12V24A4 4 0 0 1 30 28H15L9 33V28H6A4 4 0 0 1 2 24V12A4 4 0 0 1 6 8Z'), P('d', 'M20 22H42A4 4 0 0 1 46 26V36A4 4 0 0 1 42 40H39V45L33 40H20A4 4 0 0 1 16 36V26A4 4 0 0 1 20 22Z'), C('c', 25, 31, 1.4, { w: 0.9 }), C('c', 31, 31, 1.4, { w: 0.9 }), C('c', 37, 31, 1.4, { w: 0.9 })],
    mic: () => [P('l', 'M11 22C11 37 37 37 37 22M24 33V41.5M16.5 42H31.5', { w: 1.05 }), P('b', rr(16.5, 5, 15, 24, 7.5)), P('c', 'M17.5 13H23M17.5 19H23', { w: 0.85 })],
    growth: () => [P('b', rr(6, 30, 8, 12, 2)), P('b', rr(18, 23, 8, 19, 2)), P('d', rr(30, 15, 8, 27, 2)), P('l', 'M5 23L16 14L23 18L38 6M31 6H38V13', { w: 1.05 })],
    hourglass: () => [P('l', 'M10 6H38M10 42H38', { w: 1.3 }), P('b', 'M14 7C14 17 21.5 20.5 21.5 24C21.5 27.5 14 31 14 41H34C34 31 26.5 27.5 26.5 24C26.5 20.5 34 17 34 7Z'), P('d', 'M17.5 41C18.5 35.5 21.5 33 24 33C26.5 33 29.5 35.5 30.5 41Z'), P('d', 'M18 12.5H30C29 17 25.5 19.5 24 21.5C22.5 19.5 19 17 18 12.5Z')],
    storm: () => [P('b', 'M13 28C7 28 5.5 20.5 10.5 18.5C10 11.5 18.5 8.5 22.5 12.5C24.5 7.5 33.5 7.5 35 14.5C40 14.5 43.5 19.5 41.5 23.5C41.5 26.5 38.5 28 36 28Z'), P('d', 'M25.5 22.5L17.5 35H24L21 45L32 30.5H25.5L29 22.5Z')],
  };

  // Which drawing each idea gets. Ids are matched after stripping 'ask:', 'dive:', 'L:', 'pf-'.
  const IDS = {
    // demo history on Profile
    race: 'racing', dream: 'moon', song: 'notes', blackhole: 'blackhole', forget: 'forget', dark: 'galaxy', purr: 'cat', trees: 'tree', octo: 'octopus', stress: 'storm',
    // the heart course
    pump: 'pump', rooms: 'rooms', spark: 'spark', circuits: 'circuits', pressure: 'gauge', wrong: 'monitor', attack: 'broken', strong: 'dumbbell', cycle: 'cycle',
    // Ask answers
    leaf: 'leaf', croc: 'croc', sun: 'sun', brain: 'brain', photo: 'camera',
    // Ask branch terms
    larynx: 'larynx', vibration: 'fork', hertz: 'sine', vocalfolds: 'folds', solicit: 'catcall', roar: 'lion', chlorophyll: 'leafsun', carotenoids: 'carrot', anthocyanins: 'berries',
    crocodilians: 'croc', saltglands: 'saltdrop', everglades: 'reeds', light: 'sunclock', supergiant: 'giant', fusion: 'atom', fmri: 'scanner', energy: 'battery', glia: 'glia',
    hearts: 'threehearts', hemocyanin: 'drop', chromatophores: 'tentacle', exposure: 'triangle', aperture: 'iris', thirds: 'thirds',
    // Learn deeper dives (heart course terms)
    cardiac: 'muscle', atria: 'rooms', ventricles: 'rooms', valves: 'valve', sa: 'spark', av: 'spark', aorta: 'aorta', pulmonary: 'lungs', systole: 'cycle', diastole: 'cycle',
    coronary: 'coronary', plaque: 'plaque', mmhg: 'gauge', arrhythmia: 'monitor', afib: 'monitor', output: 'drop', lubdub: 'stethoscope', rhr: 'watch',
    // catalog courses (and their lessons, 'photo-l3' → photo)
    heart: 'heartbeat', bio12: 'flask', spanish: 'speech', invest: 'growth', python: 'code', speak: 'mic',
  };
  const HUB = { body: 'heartbeat', mind: 'brain', space: 'planet', tech: 'chip', nature: 'sprout', arts: 'brush', society: 'people', history: 'hourglass' };
  const FALLBACK = { body: 'dna', mind: 'neuron', space: 'planet', tech: 'chip', nature: 'sprout', arts: 'frame', society: 'houses', history: 'hourglass' };
  const WORDS = [
    [/black hole/i, 'blackhole'], [/galax|dark matter/i, 'galaxy'], [/\bsun\b|solar|star/i, 'sun'], [/planet|space|orbit|moon/i, 'planet'], [/dream|sleep/i, 'moon'],
    [/octop/i, 'octopus'], [/\bcats?\b|purr|kitten/i, 'cat'], [/lion|tiger|roar/i, 'lion'], [/croc|alligator|gator/i, 'croc'], [/tree|forest|root/i, 'tree'], [/leaf|leaves|plant|flower/i, 'leaf'],
    [/heart|pulse|beat/i, 'heartbeat'], [/blood/i, 'drop'], [/lung|breath/i, 'lungs'], [/gene|dna|cell/i, 'dna'], [/stress|anxi|nervous/i, 'storm'],
    [/brain|neuro/i, 'brain'], [/memor|forget/i, 'forget'], [/song|music|sound|voice/i, 'notes'], [/photo|camera|picture/i, 'camera'], [/paint|draw|art/i, 'brush'],
    [/code|python|program|computer|chip/i, 'code'], [/money|invest|stock|price/i, 'growth'], [/speak|talk|speech/i, 'mic'], [/language|spanish|word/i, 'speech'],
    [/city|town|house/i, 'houses'], [/people|friend|social/i, 'people'], [/history|ancient|rome|war/i, 'hourglass'], [/energy|battery|power/i, 'battery'], [/atom|fusion|physics/i, 'atom'],
  ];
  function motif(id, subj, label) {
    let s = String(id == null ? '' : id);
    if (s.startsWith('H:')) return HUB[s.slice(2)] || HUB[subj] || 'neuron';
    s = s.replace(/^(ask|dive|L|C|pf)[:-]/, '').replace(/^(heart|photo|bio12|spanish|invest|python|speak)[:/_]/, '');
    if (IDS[s]) return IDS[s];
    const course = s.match(/^([a-z0-9]+)-(l\d+|review\d*|final)$/i);
    if (course && IDS[course[1]]) return IDS[course[1]];
    if (label) for (const [re, k] of WORDS) if (re.test(label)) return k;
    return FALLBACK[subj] || 'neuron';
  }

  // ---------- Shared SVG defs (filters, scene gradients). One hidden <svg> in the page. ----------
  let defsEl = null;
  const gradDone = new Set();
  function defs() {
    if (defsEl && defsEl.isConnected) return defsEl;
    defsEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    defsEl.setAttribute('width', '0'); defsEl.setAttribute('height', '0'); defsEl.setAttribute('aria-hidden', 'true');
    defsEl.setAttribute('data-keep-colour', '');
    defsEl.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    defsEl.innerHTML = `<defs>
      <filter id="og-paint" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="ab"/>
        <feOffset in="ab" dx="-1.4" dy="-1.8" result="ul"/>
        <feComposite in="SourceAlpha" in2="ul" operator="out" result="rimBR"/>
        <feFlood flood-color="#3A1608" flood-opacity=".3"/><feComposite in2="rimBR" operator="in" result="shade"/>
        <feOffset in="ab" dx="1.4" dy="1.8" result="dr"/>
        <feComposite in="SourceAlpha" in2="dr" operator="out" result="rimUL"/>
        <feFlood flood-color="#FFF6E6" flood-opacity=".5"/><feComposite in2="rimUL" operator="in" result="lite"/>
        <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9" result="n2"/>
        <feColorMatrix in="n2" type="matrix" values="0 0 0 0 .2  0 0 0 0 .1  0 0 0 0 .05  2.4 0 0 0 -1.45" result="speck"/>
        <feComposite in="speck" in2="SourceAlpha" operator="in" result="speckIn"/>
        <feMerge result="m"><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="lite"/><feMergeNode in="speckIn"/></feMerge>
        <feTurbulence type="fractalNoise" baseFrequency=".13" numOctaves="2" seed="4" result="n1"/>
        <feDisplacementMap in="m" in2="n1" scale="1.9" xChannelSelector="R" yChannelSelector="G" result="wob"/>
        <feGaussianBlur in="wob" stdDeviation=".22"/>
      </filter>
      <filter id="og-paper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="3" seed="2" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 .36  0 0 0 0 .2  0 0 0 0 .1  2.2 0 0 0 -1.32" result="g"/>
        <feComposite in="g" in2="SourceAlpha" operator="in"/>
      </filter>
      <filter id="og-wash" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="w"/>
        <feGaussianBlur in="w" stdDeviation="1.1"/>
      </filter>
    </defs>`;
    (document.body || document.documentElement).appendChild(defsEl);
    gradDone.clear();
    return defsEl;
  }
  function grad(id, stops, x2 = 0, y2 = 1) {
    defs();
    if (gradDone.has(id)) return `url(#${id})`;
    gradDone.add(id);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    g.setAttribute('id', id); g.setAttribute('x1', '0'); g.setAttribute('y1', '0'); g.setAttribute('x2', String(x2)); g.setAttribute('y2', String(y2));
    g.innerHTML = stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
    defsEl.querySelector('defs').appendChild(g);
    return `url(#${id})`;
  }

  // ---------- Painting parts ----------
  const LINE_ROLES = { l: 1, m: 1, c: 1 };
  function shapeEl(p, attrs) {
    const a = Object.entries(attrs).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}="${v}"`).join(' ');
    if (p.c) return `<circle cx="${p.c[0]}" cy="${p.c[1]}" r="${p.c[2]}" ${a}/>`;
    if (p.e) return `<ellipse cx="${p.e[0]}" cy="${p.e[1]}" rx="${p.e[2]}" ry="${p.e[3]}"${p.e[4] ? ` transform="rotate(${p.e[4]} ${p.e[0]} ${p.e[1]})"` : ''} ${a}/>`;
    return `<path d="${p.d}" ${a}/>`;
  }
  // tones: { b, d, p, l, m, c, o } → colours; sw = base line width
  function paintParts(parts, tones, sw, extra) {
    return parts.map((p, i) => {
      const isLine = LINE_ROLES[p.r], w = sw * (p.w || 1);
      const attrs = isLine
        ? { fill: 'none', stroke: tones[p.r], 'stroke-width': n2(w), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': p.dash || null }
        : { fill: tones[p.r], 'fill-rule': p.er ? 'evenodd' : null };
      if (p.op != null) attrs.opacity = p.op;
      return shapeEl(p, Object.assign(attrs, extra ? extra(p, i) : {}));
    }).join('');
  }

  // i · Drawn: one ember ink weight, round caps, every outline draws itself on.
  function drawn(parts, c, size, o) {
    const hub = !!o.hub, INK = hub ? c.paper : ink();
    const sw = size <= 34 ? 2.9 : size <= 50 ? 2.55 : size <= 70 ? 2.2 : 1.9;
    const paper = hub ? c.mid : c.paper;
    const wash = hub ? c.deep : mix(c.mid, c.paper, 0.8);
    let k = 0;
    const body = parts.map((p) => {
      const line = LINE_ROLES[p.r], dot = p.r === 'o';
      const attrs = dot
        ? { fill: INK, stroke: 'none', class: 'og-f' }
        : { fill: line ? 'none' : p.r === 'd' ? wash : paper, stroke: INK, 'stroke-width': n2(sw * (line ? Math.min(1.15, Math.max(0.85, p.w || 1)) : 1)), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'fill-rule': p.er ? 'evenodd' : null, class: p.dash ? 'og-f' : 'og-s', pathLength: p.dash ? null : '1', 'stroke-dasharray': p.dash || null };
      if (p.op != null) attrs.opacity = p.op;
      attrs.style = `--k:${k++}`;
      return shapeEl(p, attrs);
    }).join('');
    return { inner: body, cls: 'og-drawn' };
  }

  // iii · Duotone: chunky solid shapes in two tones of the subject colour.
  function duotone(parts, c, size, o) {
    const hub = !!o.hub;
    const t = hub
      ? { b: c.light, d: c.paper, p: c.paper, l: c.paper, m: c.light, c: c.deep, o: c.deep }
      : { b: c.mid, d: c.deep, p: c.paper, l: c.deep, m: c.mid, c: c.tint, o: c.deep };
    return { inner: paintParts(parts, t, 3.2), cls: 'og-duo' };
  }

  // ii · Painted: a little gouache still life. Warm paper, a soft wash of the subject, the object with volume and grain.
  function painted(parts, c, size, o, id) {
    const hub = !!o.hub;
    const t = hub
      ? { b: mix(c.light, WARM.cream, 0.35), d: WARM.cream, p: WARM.cream, l: WARM.humus, m: mix(c.light, WARM.cream, 0.2), c: c.deep, o: WARM.humus }
      : { b: c.mid, d: c.deep, p: WARM.cream, l: WARM.humus, m: c.mid, c: WARM.cream, o: WARM.humus };
    defs();
    const seed = [...String(id)].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const tilt = ((seed % 7) - 3) * 2.2, bx = 10 + (seed % 5) * 4, by = 8 + (seed % 3) * 3;
    const back = hub
      ? `<rect width="48" height="48" fill="${c.mid}"/><ellipse cx="${bx + 6}" cy="${by + 4}" rx="22" ry="17" fill="${c.light}" opacity=".42" filter="url(#og-wash)"/><ellipse cx="30" cy="44" rx="30" ry="12" fill="${c.deep}" opacity=".55" filter="url(#og-wash)"/>`
      : `<rect width="48" height="48" fill="${WARM.bone}"/><ellipse cx="${bx + 8}" cy="${by + 4}" rx="20" ry="15" fill="${c.light}" opacity=".7" filter="url(#og-wash)"/><ellipse cx="38" cy="40" rx="16" ry="12" fill="${mix(WARM.saffron, WARM.bone, 0.55)}" opacity=".55" filter="url(#og-wash)"/>`;
    const ground = `<ellipse cx="24" cy="44" rx="14" ry="2.6" fill="${hub ? c.deep : WARM.bark}" opacity="${hub ? 0.5 : 0.22}" filter="url(#og-wash)"/>`;
    const obj = `<g transform="translate(24 23.5) rotate(${tilt}) scale(.86) translate(-24 -24)" filter="url(#og-paint)">${paintParts(parts, t, 2.6)}</g>`;
    const grain = '<rect width="48" height="48" fill="#000" filter="url(#og-paper)" opacity=".5"/>';
    return { inner: back + ground + obj + grain, cls: 'og-paint', bleed: true };
  }

  // iv · Scenes: each subject hub is a little world.
  const SCENES = {
    space: (c) => `<rect width="48" height="48" fill="${grad('og-sky-space', [[0, c.deep], [1, c.mid]])}"/>
      ${[[8, 10, 0.9], [16, 5, 0.6], [38, 7, 0.8], [43, 18, 0.6], [6, 30, 0.7], [12, 40, 0.5], [41, 38, 0.7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${WARM.shell}" opacity=".85"/>`).join('')}
      <path d="${star4(33, 12, 2.6)}" fill="${WARM.saffron}"/>
      <ellipse cx="24" cy="27" rx="19" ry="5.5" transform="rotate(-16 24 27)" fill="none" stroke="${WARM.cream}" stroke-width="1.5" opacity=".65"/>
      <circle cx="24" cy="27" r="10" fill="${WARM.coral}"/><path d="M14.6 24C19 26 29 26 33.6 23.4M15.6 31.2C20 32.6 28 32.6 32.4 30.6" fill="none" stroke="${mix(WARM.coral, c.deep, 0.35)}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="21" cy="23" r="3.2" fill="#FFD9B8" opacity=".55"/>
      <path d="M5.3 32.6C9 36 26 32 40 25" fill="none" stroke="${WARM.cream}" stroke-width="1.5" stroke-linecap="round"/>`,
    nature: (c) => `<rect width="48" height="48" fill="${grad('og-sky-nature', [[0, '#FBEAC6'], [1, mix(c.light, '#FBEAC6', 0.4)]])}"/>
      <path d="${rays(35, 13, 7.5, 11, 8)}" stroke="${WARM.saffron}" stroke-width="1.6" stroke-linecap="round"/><circle cx="35" cy="13" r="5.5" fill="${WARM.saffron}"/>
      <ellipse cx="14" cy="50" rx="30" ry="15" fill="${c.mid}"/><ellipse cx="40" cy="52" rx="24" ry="14" fill="${c.deep}"/>
      <path d="M21 38V25" stroke="${c.deep}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M21 29C19.5 22.5 13.5 19.5 8.5 21C9.5 26.5 15 30 21 29Z" fill="${c.mid}"/><path d="M21 25.5C22.5 18.5 28 15 33 16.5C32 22.5 26.5 26 21 25.5Z" fill="${mix(c.mid, '#FBEAC6', 0.15)}"/>
      <path d="M21 29C17 26 14 24 11 23.5M21 25.5C25 22.5 28 20 30.5 19" stroke="${c.deep}" stroke-width=".9" stroke-linecap="round" fill="none"/>`,
    body: (c) => `<rect width="48" height="48" fill="${grad('og-sky-body', [[0, mix(c.light, WARM.shell, 0.3)], [1, c.light]])}"/>
      <circle cx="24" cy="24" r="17" fill="${c.mid}" opacity=".18"/>
      <path d="${heart(24, 24, 0.78)}" fill="${c.mid}"/><path d="${heart(24, 24, 0.78)}" fill="none" stroke="${c.deep}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M0 26H11L14 21L18.5 33L23 15L26.5 30L29 26H48" fill="none" stroke="${WARM.shell}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 16.5C17 14.5 18.5 13.2 20.5 13.2" fill="none" stroke="${WARM.shell}" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>`,
    mind: (c) => `<rect width="48" height="48" fill="${grad('og-sky-mind', [[0, c.deep], [1, c.mid]])}"/>
      <path d="M21 18L16 8M16 8L10.5 4.5M16 8L17 2M18 25L6 28M6 28L1 24M6 28L3 34M28 17L37.5 8M37.5 8L44 9M37.5 8L38.5 2M28.5 28.5L39.5 43M39.5 43H47M39.5 43L40.5 49M20 30L13 42" stroke="${WARM.cream}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <circle cx="24" cy="23" r="8" fill="${WARM.cream}"/><circle cx="24" cy="23" r="3" fill="${c.mid}"/>
      ${[[10.5, 4.5], [1, 24], [44, 9], [47, 43], [13, 42], [17, 2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${WARM.saffron}"/><circle cx="${x}" cy="${y}" r="4.6" fill="${WARM.saffron}" opacity=".28"/>`).join('')}`,
    tech: (c) => `<rect width="48" height="48" fill="${grad('og-sky-tech', [[0, c.mid], [1, c.deep]])}"/>
      <path d="M0 14H10L15 19M0 34H8L13 29M48 12H38L33 17M48 32H40L35 27M17 0V8M31 0V8M24 48V40M16 48V42L19 39" stroke="${WARM.cream}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".9"/>
      ${[[10, 14], [8, 34], [38, 12], [40, 32], [17, 8], [31, 8], [24, 40], [19, 39]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9" fill="${WARM.cream}"/>`).join('')}
      <rect x="14" y="15" width="20" height="18" rx="3.5" fill="${WARM.humus}"/><rect x="19" y="19.5" width="10" height="9" rx="1.8" fill="${WARM.saffron}"/>
      <path d="M19 15V12.5M24 15V12.5M29 15V12.5M19 33V35.5M24 33V35.5M29 33V35.5" stroke="${WARM.humus}" stroke-width="1.6" stroke-linecap="round"/>`,
    arts: (c) => `<rect width="48" height="48" fill="${grad('og-sky-arts', [[0, c.mid], [1, c.deep]])}"/>
      <rect x="8" y="9" width="27" height="27" rx="2" fill="${WARM.cream}"/><rect x="8" y="9" width="27" height="27" rx="2" fill="none" stroke="${WARM.saffron}" stroke-width="2.4"/>
      <path d="M12 30C15.5 21 20.5 32 31 15" fill="none" stroke="${WARM.coral}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="28" cy="14.5" r="2.6" fill="${c.mid}"/>
      <path d="M44 22C45.5 20.5 48 23 46.5 24.5L35 37L31.5 33.5Z" fill="${WARM.saffron}"/><path d="M31.5 33.5L35 37C33.5 42 28.5 44 24 44.5C25 40 27 35 31.5 33.5Z" fill="${WARM.humus}"/>`,
    society: (c) => `<rect width="48" height="48" fill="${grad('og-sky-society', [[0, mix(c.light, WARM.saffron, 0.25)], [0.62, c.light], [1, c.mid]])}"/>
      <circle cx="35" cy="14" r="5" fill="${WARM.cream}" opacity=".9"/>
      <path d="M2 40V26L10 19L18 26V40Z" fill="${c.mid}"/><path d="M16 40V21L25.5 12L35 21V40Z" fill="${c.deep}"/><path d="M33 40V28L40 22L47 28V40Z" fill="${c.mid}"/>
      ${[[7.5, 29], [22.5, 24], [27, 24], [22.5, 31], [27, 31], [38.5, 31]].map(([x, y]) => `<rect x="${x - 1.7}" y="${y - 1.7}" width="3.4" height="3.4" rx=".7" fill="${WARM.saffron}"/>`).join('')}
      <rect y="40" width="48" height="8" fill="${c.deep}"/>
      <circle cx="11" cy="37.5" r="2.2" fill="${WARM.humus}"/><path d="M8 44C8 40.5 9.5 39.5 11 39.5C12.5 39.5 14 40.5 14 44Z" fill="${WARM.humus}"/>
      <circle cx="38" cy="37.5" r="2.2" fill="${WARM.humus}"/><path d="M35 44C35 40.5 36.5 39.5 38 39.5C39.5 39.5 41 40.5 41 44Z" fill="${WARM.humus}"/>`,
    history: (c) => `<rect width="48" height="48" fill="${grad('og-sky-history', [[0, c.light], [1, c.mid]])}"/>
      <path d="M6 18L24 8L42 18Z" fill="${WARM.cream}"/><rect x="7" y="18" width="34" height="3" fill="${WARM.cream}"/>
      ${[11, 19, 27, 35].map((x) => `<rect x="${x}" y="22" width="3.4" height="15" fill="${WARM.cream}"/>`).join('')}
      <rect x="5" y="37" width="38" height="3.5" fill="${WARM.cream}"/><rect y="41" width="48" height="7" fill="${c.deep}"/>`,
  };

  // ---------- Public ----------
  function svg(id, style, subj, size, opts) {
    const o = opts || {};
    const c = colours(subj);
    size = size || 30;
    const key = o.motif && M[o.motif] ? o.motif : motif(id, subj, o.label);
    const parts = (M[key] || M.neuron)();
    let out;
    if (style === 'iv' && o.hub && SCENES[subj]) out = { inner: SCENES[subj](c), cls: 'og-scene', bleed: true };
    else if (style === 'ii') out = painted(parts, c, size, o, id);
    else if (style === 'iii' || style === 'iv') out = duotone(parts, c, size, o);
    else out = drawn(parts, c, size, o);
    const cls = ['og', out.cls, out.bleed ? 'og-bleed' : '', o.draw && out.cls === 'og-drawn' ? 'og-draw' : '', o.ghost ? 'og-ghost' : ''].filter(Boolean).join(' ');
    const delay = o.delay ? ` style="--og-d:${Math.max(0, Math.round(o.delay))}ms"` : '';
    return `<svg class="${cls}" data-motif="${key}" viewBox="0 0 48 48" width="${size}" height="${size}"${delay} aria-hidden="true" focusable="false">${out.inner}</svg>`;
  }

  window.OrbGlyphs = { svg, motif, colours, motifs: Object.keys(M), ids: IDS, hubs: HUB, fallbacks: FALLBACK, styles: ['i', 'ii', 'iii', 'iv'] };
})();
