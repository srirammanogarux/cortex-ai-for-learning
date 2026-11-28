# Cortex v4 app · module contract

**What this is.** One app prototype: onboarding builds your first course, then you land in **Learn · Ask · Profile**. It's plain HTML/CSS/JS with no build step and no frameworks.
- It runs inside a phone frame. The screen is **368 × 822 px** (`#screen`, `overflow: hidden`, radius 46).
- Open it at `prototypes/cortex-app/index.html`. Serve it with `python3 -m http.server`; the particle icons need same-origin.

Read `research/flows/plan-v4-app.md` for the decisions behind it.

## Files and owners
**Edit only your own files.** Talk to other modules through `Bus`, `Store` and `App`.

| Files | Owner |
|---|---|
| `index.html`, `core/*`, `data/heart.js`, `brain.js`, `icons.js`, `CONTRACT.md` | Lead |
| `onboarding/onboarding.js`, `onboarding/onboarding.css` | A · Onboarding |
| `learn/learn.js`, `learn/learn.css`, `learn/content.js` | B · Learn |
| `ask/ask.js`, `ask/ask.css`, `ask/content.js` | C · Ask |
| `profile/profile.js`, `profile/profile.css` | D · Profile |
| `brand/*` (a separate page: `brand/index.html`) | E · Brand |

`assets/` holds shared images: thought orbs `orb-*.jpg`, plus 3D images from the earlier habits exploration. Add new assets under your own folder.

Prefix every CSS class with your module: `ob-`, `ln-`, `ak-`, `pf-`, `br-`. Scope global selectors under your root element.

## Globals
- **`Brain`** (`brain.js`): the particle character. **There is ONE canvas.** Move it into your container with `Brain.moveTo(el)` when your view shows. It renders at 320 × 320 CSS px; scale your container with a transform.
  - `setShape(name, palette, ms)`. Shapes: `brain`, `heart`, `ring`, `spike`, `curve`, `wave`, `grid`, `split`, `steps`, `burst`, `target`, `funnel`, `bars`, `scatter`, `qmark`, and solid colour icons `f-work`, `f-exam`, `f-school`, `f-sharpen`, `f-fun`, `f-engineer`, `f-student`, `f-business`, `f-pm`, `f-designer`, `f-researcher`, `f-finance`, `f-founder`, `f-marketing`, `f-teacher`, `f-other`.
  - Palettes: `cobalt`, `mind`, `arts`, `society`, `tech`, `body`, `space`.
  - `defineIcon(name, drawFn(ctx, size), { grad: [c1, c2] })` makes NEW shapes from any canvas drawing. Use it for your own particle forms: a roadmap, a web, letters.
  - Also: `setMode('idle'|'think'|'listen')`, `pulse()`, `setLobes(0..1)`, `setSpin(bool)`, `setDark(bool)`, `form()` (gather from scattered), `scatter(ms)`.
  - `sample(name, n)` gives `[[x, y, depth]]` in −1..1, for static dot-glyph SVGs; `palette(name)` gives the colours.
- **`FICONS`, `fillSVG(name, size)`**: solid colour-gradient icons (icon style A, chosen). Also `ICONS` / `iconSVG(name)` line icons for small UI.
- **`Bus.on / Bus.emit`**, **`Store`**, **`App`**, **`toast(msg)`**, **`COURSES.heart`**, **`courseRoadmap(course, goal, span)`**, **`TOPIC_SUGGESTIONS`**.

## Store (`core/bus.js`)
`Store.get()` returns:
- `style`: `'quick' | 'connect' | 'roadmap'`
- `topic`, `goal`, `span`, `daily`
- `plan`: `'free' | 'plus'`
- `courses`: `[{ id, title, progress: { [lessonId]: 'done' } }]`
- `activeCourse`
- `explored`: ids
- `collectibles`: `[{ id, title, shape, palette }]`
- `streak`
- `branchesUsed`: `{ [questionId]: n }`
- `paywallSeen`
- `variants`: `{ askHome: 'A'|'B'|'C', lesson: '1'|'2'|'3' }`

Change state only with `Store.set(patch)`, which emits `store:change`. `Store.variant(key, value)` emits `variant:change`. `Store.isPlus()`.

## App (`core/shell.js`)
- `App.showOnboarding(step)` · `App.showTab('learn'|'ask'|'profile')` · `App.setTabBar(visible)` (hide it for full-screen moments, e.g. a lesson).
- `App.paywall(reason)`: reason is `'onboarding' | 'ask' | 'branch' | 'graph' | 'courses'`. The shell owns the paywall sheet, emits `paywall:open`, then `paywall:close { reason, upgraded }`. It does nothing on Plus.
- The tab bar is 70px tall at `bottom: 22px`. **Keep the bottom 100px clear** on tab screens, or pad your scroll.

## Required module API
| Module | API |
|---|---|
| Onboarding | `window.Onboarding = { mount(layerEl), start(stepIndex), steps: [names], index() }`. Call `Bus.emit('onboarding:step', { index })` on every step change (the side panel lists the steps). When done: `Bus.emit('onboarding:done', { style, topic, goal, span, daily })`. The shell then adds the heart course, shows Learn, and opens the paywall. |
| Learn | `window.Learn = { mount(viewEl), show(), hide() }` |
| Ask | `window.Ask = { mount(viewEl), show(), hide() }` |
| Profile | `window.Profile = { mount(viewEl), show(), hide() }` |

- `show()` is called every time the tab opens: re-read `Store`, take the brain canvas if you use it.
- A module must not crash if the others are missing.

## Events
| Event | From | Payload |
|---|---|---|
| `route` | shell | `{ screen: 'onboarding' \| 'tab', tab, step }` |
| `onboarding:step` | Onboarding | `{ index }` |
| `onboarding:done` | Onboarding | `{ style, topic, goal, span, daily }` |
| `course:created` | shell | `{ id }` |
| `lesson:done` | Learn | `{ courseId, lessonId }` |
| `course:finished` | Learn | `{ courseId, gift }` (Learn also adds the gift to `Store.collectibles` via `Store.set`) |
| `explored` | Learn, Ask | `{ id, label, subject, shape, palette, from }`. Each module also pushes the id into `Store.explored`. Profile listens to grow the graph. |
| `ask:open` | anyone | `{ question }` asks Ask to open with this question (e.g. from a Learn "keep pondering" row). The shell switches to the Ask tab first. |
| `store:change`, `variant:change`, `paywall:open`, `paywall:close` | core | see above |

## Design language (match exactly)
- **Font:** **Geist** for everything. Titles are 600 with letter-spacing −0.03em. Sizes are sleek: screen titles 26–28, card titles 17–20, body 15–16.
- **Colour:**
  - Ink `#141211`; secondary text `#57534F`. Never lighter than `#5C5854` for text on light backgrounds.
  - Cobalt `#1F5BE0` (700 `#1A47B8`, 900 `#0B2A66`, 300 `#7FA3FF`).
  - Right `#12A58A`, wrong `#E5484D`, always with an icon.
- **Surfaces:**
  - Canvas: `var(--canvas)`.
  - White cards: radius 24–28, `var(--card-shadow)`.
  - Buttons: carved secondary `.btn-carved`; primary `.btn-lit` (58px tall, never shrinks).
  - Selected states are a **fill** (cobalt with white text). Never border-only.
- **Icons:** solid colour gradient glyphs (`fillSVG`) on white tiles for anything with personality. Thin line icons only for small UI chrome. **No emojis. No 3D clay images** (rejected).
- **The particles are the character:** brand-neutral and fluid. Use them for wow moments: morphing into the topic, building things, reacting to touch.
- **Motion:**
  - Ease-out `var(--out)`, glide `var(--glide)`. Animate transform and opacity.
  - Support the `.still` class on `<html>` (`?still=1`: no animation, final states) and `prefers-reduced-motion`.
- **Every visible control works,** or it doesn't exist. Tap targets ≥ 44px. No dead buttons; a toast is OK for out-of-scope actions.
- **Copy:** plain, short, friendly. No jargon.

## Testing
- **Serve it:** `cd prototypes/cortex-app && python3 -m http.server 8790`, then open `http://localhost:8790/index.html`.
- **Jump straight in:** `?tab=learn` / `?tab=ask` / `?tab=profile` skips onboarding with demo data (heart course, style connect). `?ob=N` starts onboarding at step N. `?ask=B`, `?lesson=2`, `?style=quick`, `?plan=plus` set variants. `?paywall=ask` opens a paywall.
- **Screenshots:** use Playwright: `import { chromium } from '/Users/sriram/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'`. Give each run its own `--user-data-dir`-free context (Playwright does this already).
  - Clip to the phone: `await page.locator('.phone').boundingBox()`.
  - Wrap node runs with `perl -e 'alarm 120; exec @ARGV' node script.mjs`; macOS has no `timeout`.
  - Headless Chrome's `--virtual-time-budget` hangs on this app, so use Playwright with real waits.
- Check the console for errors on every run.
