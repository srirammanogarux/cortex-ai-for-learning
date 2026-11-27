# Exploration · module contract

The exploration is a single page: `explore/index.html`. It's plain HTML/CSS/JS, with no build step and no frameworks. It runs inside a phone frame, and the screen area is **368 × 822 px** (`#screen`, `overflow: hidden`, `border-radius: 46px`). Everything is mobile-first, at 1× CSS px.

## Files and owners
| File | Owner | What it is |
|---|---|---|
| `index.html`, `shell.css`, `shell.js`, `bus.js` | lead | Frame, side panel, wiring, sequencing |
| `content.js` | Explore agent | All exploration content (main question + branch pages) |
| `explore.js`, `explore.css` | Explore agent | Full-screen exploration UI. Mounts into `#exploreLayer` |
| `map.js`, `map.css` | Map agent | Corner mini-map + full zoom-out map. Mounts into `#mapLayer` |
| `finale.js`, `finale.css` | Finale agent | 3D brain + gyroscope of explored cards, save → sign-in → Today. Mounts into `#finaleLayer` |
| `assets/` | lead | Generated images (see list below) |

**Do not edit files you don't own.** If you need something from another module, use the bus.

## Globals available
- `Brain`: particle brain (`../brain.js`). **There is ONE canvas** (`#brain`). Use `Brain.moveTo(el)` to move it into your container; it renders at 320 × 320 CSS px, so scale its parent with a CSS transform. API:
  - `setShape(name, palette, ms)`: shapes include `brain`, `ring`, `spike`, `curve`, `wave`, `grid`, `split`, `steps`, `burst`, `target`, `funnel`, `bars`, `heart`, and icon names from `../icons.js`.
  - Palettes: `cobalt`, `mind`, `arts`, `society`, `tech`, `body`, `space`.
  - `setMode('idle'|'think'|'listen')`, `pulse()`, `setLobes(0..1)`, `setSpin(bool)`, `form()`, `scatter(ms)`.
  - `sample(name, n)` returns `[[x, y, depth]]` in −1..1 (for drawing static dot-glyphs as SVG), and `palette(name)` returns `[[r,g,b], [r,g,b]]`.
- `ICONS`, `iconSVG(name, size, strokeWidth)`: line icons.
- `Bus.on(event, fn)` / `Bus.emit(event, data)`, and `toast(msg)`.

## Required module API
- `Explore = { mount(layerEl), start() }`
- `MapUI = { mount(layerEl), demo() }`: `demo()` opens the full map seeded with sample nodes (used by the side panel's "Zoom out to the map").
- `Finale = { mount(layerEl), demo() }`: `demo()` plays the finale with sample nodes.

Each module must work on its own, even when the other modules' files are missing (the shell skips modules that aren't loaded). Each module must also handle `reset`.

## Events
| Event | Emitted by | Payload | Meaning |
|---|---|---|---|
| `node:open` | Explore | `{ id, label, parent, shape, palette }` | The user is now on this node. `parent` is null for the root. Emitted on first open and on revisits. |
| `map:goto` | Map | `{ id }` | The user tapped a node in the map. Explore must show it. |
| `map:state` | Map | `{ open: bool }` | The full map is open or closed (Explore may pause the brain). |
| `meter` | Explore | `{ value: 0..1, explored: n }` | Pondering progress. |
| `session:done` | Explore | `{ nodes: [{ id, label, shape, palette, img }] }` | The meter is full and the user tapped "See what you explored". |
| `finale:done` | Finale | `{}` | The user finished sign-in and saw Today. |
| `reset` | shell | `{}` | Replay: every module resets to its initial state. |

## Design language (match exactly)
- **Fonts:**
  - Titles, numbers and buttons: `'Bricolage Grotesque'` 600, letter-spacing −0.03em (−0.01em on buttons).
  - UI text: `'Inter'` 500–600.
- **Ink:** `#141211`. Secondary text: `#57534F`. Never go lighter than `#5C5854` for text on light backgrounds (WCAG AA).
- **Brand:** cobalt `#1F5BE0` (700 `#1A47B8`, 900 `#0B2A66`, 300 `#7FA3FF`).
- **Subject families** (deep / mid / tint):

  | Family | Deep | Mid | Tint |
  |---|---|---|---|
  | Psychology (mind) | `#4A30B0` | `#7457E0` | `#EEEAFD` |
  | Design (arts) | `#7E2777` | `#B04AA8` | `#F8E9F6` |
  | Business (society) | `#526612` | `#7E9A2A` | `#EFF3E1` |
  | Data (tech) | `#165F87` | `#2A8FC4` | `#E4F1F8` |

- **Background canvas:** `linear-gradient(180deg,#ECEAEE,#E2E3E7 55%,#DCDCDE)`. Cards: white, radius 24–28, shadow `0 1px 2px rgba(20,18,17,.05), 0 10px 30px rgba(20,18,17,.08)`.
- **Primary button ("lit"):** height 56–58, pill. `background: linear-gradient(180deg,#0B2A66 0%,#1F5BE0 55%,#8FB0FF 100%)`, `box-shadow: inset 0 0 0 1.6px rgba(255,255,255,.55), inset 0 -6px 13px rgba(255,255,255,.35), 0 10px 26px rgba(31,91,224,.38)`. Press: `scale(.965)`.
- **Secondary button ("carved"):** `background:#EEECF0; box-shadow: inset 0 0 0 1px #fff, inset -1px -4px 3.6px rgba(61,61,61,.2), inset 1px 2px 1.2px rgba(255,255,255,.81), inset 0 0 20px #fff, 0 6px 18px rgba(0,0,0,.07)`.
- **Selection is always a FILL** (cobalt background, white text). No border-only selected states.
- **Motion:**
  - Ease-out `cubic-bezier(0.23,1,0.32,1)`; glide `cubic-bezier(0.32,0.72,0,1)`.
  - Animate transform and opacity only.
  - Respect `prefers-reduced-motion`.
  - Support the `.still` class on `<html>` (set by `?still=1` for headless screenshots): no animations or transitions, final states shown.
- **No emojis as icons.** Use `iconSVG` or inline SVG. No sound.
- **Every visible control must work, or not exist.** No dead buttons. Tap targets ≥ 44px.

## Images (lead generates into `explore/assets/`)
Use exactly these paths. Until they exist, the `<img>` should still lay out at its fixed size, with a soft tint background.

| Path | What it shows |
|---|---|
| `assets/hook-trigger.png` | 3D icon: a phone with a notification bubble |
| `assets/hook-action.png` | 3D icon: a finger tapping |
| `assets/hook-reward.png` | 3D icon: a gift box bursting with sparkles |
| `assets/hook-invest.png` | 3D icon: a growing plant / piggy bank |
| `assets/reward-tribe.png` | 3D icon: hearts and speech bubbles (rewards of the tribe) |
| `assets/reward-hunt.png` | 3D icon: treasure chest (rewards of the hunt) |
| `assets/reward-self.png` | 3D icon: trophy / puzzle piece (rewards of the self) |
| `assets/case-skinner.png` | Illustration: pigeon pecking a lever in a box (Skinner box) |
| `assets/case-slot.png` | Illustration: slot machine |
| `assets/case-streak.png` | Illustration: a streak flame with a calendar |

The 3D icons are square (1:1), on a light neutral background `#EFEDF1`. Show them inside rounded tiles (radius 20) like Monogram's.
