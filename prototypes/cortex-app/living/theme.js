// Living Matter theme for the Cortex app (living/index.html only; the shared modules stay untouched).
// Loaded after living/brain.js and ../icons.js, before the modules. It:
//   1. warms every colour the modules hardcode: stylesheet rules, inline styles and SVG attributes,
//      and canvas drawing (blues become ember, cool greys become bone and bark, navy nights become humus);
//   2. swaps Geist for Figtree wherever it is set from JS (canvas text, inline styles);
//   3. recolours the solid FICONS in warm brand tones, keeping each icon's own personality;
//   4. redraws the "?" particle shape in Fraunces.
// living/theme.css then hand-styles the brand components on top.
(function () {
  window.THEME = 'living';

  // ---------- Colour mapping ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return [h, s, l, d];
  }
  function hsl2rgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }
  // Returns the warm twin of a colour, or null to keep it (personality colours: pinks, greens, oranges, right/wrong).
  function warm(r, g, b) {
    const [h, s, l, chroma] = rgb2hsl(r, g, b);
    if (l > 0.985 && chroma < 0.06) return [255, 248, 241];                         // white → Shell
    const cool = h >= 180 && h <= 330;
    if (chroma < 0.07 || (cool && chroma < 0.16 && (l > 0.8 || l < 0.2))) {          // neutrals → bone · bark · humus
      if (l <= 0.15) return hsl2rgb(20, 0.41, clamp(0.05 + l, 0, 0.2));
      if (l < 0.6) return hsl2rgb(20, 0.33, l);
      return hsl2rgb(30, 0.2 + (l - 0.6) / 0.4 * 0.45, l);
    }
    if (h >= 160 && h < 185 && s > 0.6 && l >= 0.37 && l <= 0.6) return hsl2rgb(38, 0.85, Math.min(0.62, l + 0.1)); // bright teal → saffron (right-answer green is darker and stays)
    if (h >= 185 && h < 258) {                                                       // blues → ember family
      if (l < 0.16) return hsl2rgb(16, clamp(s, 0.35, 0.6), l * 1.05);               // navy night → deep humus/ember
      if (l < 0.62) return hsl2rgb(12, clamp(s, 0.55, 0.78), l * 0.86);              // cobalt → ember
      if (l < 0.86) return hsl2rgb(14, clamp(s, 0.6, 0.85), l * 0.9);                // cobalt-300 → coral
      return hsl2rgb(22, clamp(s, 0.6, 0.9), Math.max(l * 0.985, 0.88));             // pale blue tints → peach
    }
    if ((h >= 322 || h < 2) && s > 0.45 && l > 0.3) {                                // hot pinks (the old course accent) → coral · ember
      if (l > 0.84) return hsl2rgb(24, clamp(s, 0.6, 0.9), l);
      if (l > 0.66) return hsl2rgb(13, 0.83, l * 0.93);
      return hsl2rgb(12, clamp(s * 0.95, 0.6, 0.78), l * 0.92);
    }
    if (h >= 258 && h < 300 && l < 0.3) return hsl2rgb(10, clamp(s, 0.4, 0.6), l);  // dark violet night → ember night
    if (h >= 250 && h < 322 && s > 0.3) return hsl2rgb(326, clamp(s * 0.6, 0.35, 0.5), l * 0.92); // violets → warm plum (Mind keeps its own hue)
    return null;
  }
  const HEX = /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
  const RGB = /rgba?\(\s*(-?\d+(?:\.\d+)?)[\s,]+(-?\d+(?:\.\d+)?)[\s,]+(-?\d+(?:\.\d+)?)\s*(?:[,/]\s*([\d.]+%?))?\s*\)/gi;
  const toHex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  const cache = new Map();
  function remap(str) {
    if (typeof str !== 'string' || !str) return str;
    let out = cache.get(str); if (out !== undefined) return out;
    out = str;
    if (/geist/i.test(out)) out = out.replace(/["']?Geist["']?/gi, '"Figtree"');
    if (out.indexOf('#') >= 0) out = out.replace(HEX, (m, hx) => {
      if (hx.length <= 4) hx = hx.split('').map((c) => c + c).join('');
      const w = warm(parseInt(hx.slice(0, 2), 16), parseInt(hx.slice(2, 4), 16), parseInt(hx.slice(4, 6), 16));
      return w ? toHex(w) + (hx.length === 8 ? hx.slice(6) : '') : m;
    });
    if (/-rgb\s*:/.test(out)) out = out.replace(/(-rgb\s*:\s*)(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g, (m, k, r, g, b) => { // bare "r,g,b" tokens
      const w = warm(+r, +g, +b); return w ? k + w.join(',') : m;
    });
    if (/rgb/i.test(out)) out = out.replace(RGB, (m, r, g, b, a) => {
      const w = warm(clamp(+r, 0, 255), clamp(+g, 0, 255), clamp(+b, 0, 255)); if (!w) return m;
      return a != null ? `rgba(${w[0]}, ${w[1]}, ${w[2]}, ${a})` : `rgb(${w[0]}, ${w[1]}, ${w[2]})`;
    });
    if (cache.size > 6000) cache.clear();
    cache.set(str, out); return out;
  }
  window.livingWarm = remap;

  // ---------- 1a. Stylesheets: rewrite every rule of the shared module CSS in place ----------
  function walk(rules) {
    for (const rule of rules) {
      if (rule.cssRules && !(rule.style)) { walk(rule.cssRules); continue; }
      if (rule.cssRules) walk(rule.cssRules);
      const st = rule.style; if (!st) continue;
      // cssText keeps shorthands that use var() (their longhands read back empty), and !important
      const v = st.cssText, nv = remap(v);
      if (nv !== v) st.cssText = nv;
    }
  }
  const done = new WeakSet();
  function warmSheets() {
    for (const sh of document.styleSheets) {
      if (done.has(sh)) continue;
      if (sh.href && /\/living\//.test(sh.href)) { done.add(sh); continue; }
      if (sh.href && !sh.href.startsWith(location.origin)) { done.add(sh); continue; } // Google Fonts
      try { walk(sh.cssRules); done.add(sh); } catch (e) { /* not loaded yet */ }
    }
  }
  warmSheets();
  window.addEventListener('load', warmSheets);

  // ---------- 1b. Inline styles and SVG colour attributes written by the modules ----------
  const ATTRS = ['style', 'fill', 'stroke', 'stop-color', 'flood-color', 'color'];
  const SEL = '[style],[fill],[stroke],[stop-color],[flood-color]';
  function fixEl(el) {
    if (el.nodeType !== 1) return;
    for (const a of ATTRS) {
      const v = el.getAttribute(a); if (!v) continue;
      const nv = remap(v); if (nv !== v) el.setAttribute(a, nv);
    }
  }
  function fixTree(el) { if (el.nodeType !== 1) return; fixEl(el); el.querySelectorAll(SEL).forEach(fixEl); }
  const mo = new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'attributes') fixEl(m.target);
      else m.addedNodes.forEach(fixTree);
    }
  });
  function observe() { fixTree(document.body); mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ATTRS }); }
  if (document.body) observe(); else document.addEventListener('DOMContentLoaded', observe);

  // ---------- 1c. Canvas drawing (maps, graphs, sparks) ----------
  const C2D = CanvasRenderingContext2D.prototype;
  ['fillStyle', 'strokeStyle', 'shadowColor', 'font'].forEach((p) => {
    const d = Object.getOwnPropertyDescriptor(C2D, p); if (!d || !d.set) return;
    Object.defineProperty(C2D, p, { configurable: true, enumerable: d.enumerable, get: d.get, set(v) { d.set.call(this, typeof v === 'string' ? remap(v) : v); } });
  });
  const addStop = CanvasGradient.prototype.addColorStop;
  CanvasGradient.prototype.addColorStop = function (o, c) { return addStop.call(this, o, remap(c)); };

  // ---------- 3. FICONS in warm brand tones (each keeps its own character) ----------
  const WARM_ICONS = {
    exam: ['#F7907A', '#C8402A'], school: ['#A9C26A', '#5E7A2A'], sharpen: ['#E99AB4', '#A3305E'],
    fun: ['#F8CF6A', '#E08A1E'], engineer: ['#E8946A', '#A8442A'], student: ['#8CCBB0', '#2F7A66'],
    business: ['#C9936E', '#7A4630'], researcher: ['#EFB43E', '#B8731C'], finance: ['#B9C76A', '#6E8424'],
    founder: ['#FF9A7A', '#D84A2E'], teacher: ['#E3A0C0', '#8E3B6E'], other: ['#F7A07A', '#C2305A'],
  };
  if (window.FICONS && window.Brain) {
    Object.entries(WARM_ICONS).forEach(([k, c]) => {
      const ic = FICONS[k]; if (!ic) return; ic.c = c;
      Brain.defineIcon('f-' + k, (x, S) => {
        x.save(); x.translate(S * 0.08, S * 0.08); x.scale(S * 0.84 / 24, S * 0.84 / 24);
        ic.s.forEach(([d, o = {}]) => { x.globalCompositeOperation = o.hole ? 'destination-out' : 'source-over'; x.globalAlpha = 1; x.fill(new Path2D(d)); });
        x.restore(); x.globalCompositeOperation = 'source-over';
      }, { grad: c, scale: 0.95 });
    });
  }

  // ---------- 4. The "?" in Fraunces ----------
  if (window.Brain) {
    const q = () => Brain.defineIcon('qmark', (x, S) => { x.font = `600 ${S * 0.92}px "Fraunces", Georgia, serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', S / 2, S * 0.56); }, { scale: 0.92 });
    q();
    if (document.fonts) document.fonts.load('600 200px "Fraunces"').then(q).catch(() => {});
  }
})();
