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

## Mascot (`mascot/mascot.js`, `mascot/mascot.css`)
The brain buddy. It is a sidekick, not the hero: it shows what the app is doing with shape and timing, takes on the shape of what you're exploring, and steps aside while you read. Load `mascot/mascot.css` and `mascot/mascot.js` before any module that uses it. Classes are prefixed `ms-`. Lab page: `living/mascot.html`.

**API**
- `const m = Mascot.create(el, { size, direction, state, topic, label, decorative })` draws into `el` (which becomes `size` × `size` px; default 120). Many instances can coexist; each owns its own SVG or canvas (it never uses the shared `#brain` canvas). One shared rAF drives them all; off-screen ones pause.
  - `direction`: `'A'…'E'`. Leave it out to follow `Store.get().variants.mascot` (default `'E'`): the instance then switches smoothly on `variant:change { key: 'mascot' }`. Passing it pins the instance.
  - `decorative: true` hides it from screen readers (use it inside a labelled button). Otherwise it is `role="img"` with `label` (default "Cortex").
- `m.setState(name, { restart })` · `m.setTopic(name | null, { ms, instant })` (`null` or `'brain'` = itself) · `m.setDirection(d | null)` (`null` = follow the Store again)
- `m.say(text, ms)`: a small speech bubble at its top right; `say()` hides it.
- `m.setLevel(0..1)`: input level while `listening` (voice or typing). `m.look(x, y)`: eyes look toward −1..1 (`look()` releases).
- `m.play('hop' | 'bounce' | 'nod' | 'wave' | 'shake' | 'blink')`: one-off gestures.
- `m.destroy()`. Instances whose element leaves the DOM clean themselves up.
- `m.state`, `m.topic`, `m.direction` read back the current values.
- `Mascot.icon(topic, size)`: a static SVG string of the topic silhouette with two eyes, for pills and lists.
- `Mascot.setAll({ state, topic })` applies to every visible instance. `Mascot.all()`, `Mascot.STATES`, `Mascot.TOPICS`, `Mascot.DIRECTIONS`, `Mascot.LABELS`, `Mascot.topic(alias)` (e.g. `'sun'` → `'planet'`).
- URL: `?mascot=A..E` (Store), `?mstate=<state>`, `?mtopic=<topic>` set the starting pose of the lab, the side-panel preview and the Ask home C hero. `.still` on `<html>` and `prefers-reduced-motion` render the final pose with no motion.

**Directions** (one shared vocabulary; every state and topic exists in all five)
| | Name | Drawing |
|---|---|---|
| A | Living line | One ember stroke with an inked, varying width. It draws and undraws itself into states and topics. |
| B | The cell | Warm backlit cells (the Living brain's cell look) with two cell eyes. It swells, divides and regroups. |
| C | Brain buddy | A flat, Notion-like ink brain with dot eyes and little arms that hold the props. |
| D | Line + cells | An ember line skeleton with cells flowing along it. The line carries the state; the cells carry the energy. |
| E | Soft (default) | A glossy pearl brain with arc eyes, a smile, a warm glow halo and squash and stretch. |

**States**: `idle` (breathes, blinks, glances) · `hello` (hop and rock) · `listening` (leans in, follows `setLevel`) · `thinking` (thought bubbles) · `searching` (magnifier) · `reading` (a page; eyes scan) · `analysing` (the hemispheres come apart and regroup) · `building` (blocks stack) · `loading` (a ring runs round) · `ready` (a nod and a check: small, not a party) · `happy` · `proud` (sparkles, glow: use sparingly, e.g. streaks, a finished course) · `curious` (tilt, raised brow) · `surprised` · `confused` · `error` (calm: dim, a little cloud) · `sleepy` (z's) · `aside` (shrinks and docks while the user reads).

**Topics**: `brain` (itself), `heart`, `planet`, `cat`, `crocodile`, `octopus`, `leaf`, `camera`, `atom`, `book`, `music`. The body morphs into the topic's silhouette and keeps its face. Map content to topics in your module (Ask keeps its map in `ask/content.js` → `mascot`).

**Where it is used**: Ask home C (big hello, `curious` on focus, `listening` while typing or holding to talk), every Ask answer (48 px, docked by the status line: thinking → searching → reading → connecting ideas → ready, morphs to the answer's topic, then `aside`), and the side panel's `#mascotPanel` (state and topic chips plus a preview). Onboarding can use the same `Mascot.create` API.

## v5 additions (course-first personalisation)
**Build that matters:** `living/index.html` (Living Matter: Fraunces + Figtree, warm palette). The root `index.html` must not break.

**Visual rules:**
- **Particles** appear only in three places: onboarding, collectibles, and the central node of the Ask map and the Profile graph.
- **Small illustrations** (roadmap stops, Ask map nodes, graph orbs) are **painted**: `OrbGlyphs.svg(id, 'ii', subject, size)` from `profile/orb-glyphs.js`, now loaded before `learn/`.
- **The mascot lives only in the Ask tab** (main app). Directions: `A` Line (default), `F` Particle.
- Never write "Touch it" anywhere.

**Store additions:**
- `profile`: `{ persona, topic, topicLabel, reason: 'work'|'exam'|'career'|'life', role, roleText, level, goal, goalText, daily, span }`
- `justBuilt`: `true` right after onboarding. Learn shows the plan reveal, then sets it to `false`.
- `asksUsed`
- `variants.roadmap`: `'stack'|'timeline'|'chapters'|'path'`
- `variants.paywall`: `'tab'|'hard'|'onboarding'|'soft'` (URL `?pw=`)
- `variants.persona`: `'priya'|'arjun'|'maya'|'tom'|'lena'`
- Defaults change: `mascot` is now `'A'`, `orbs` is now `'ii'`.

**Course shape:** `COURSES[id]` may add:
- `summary`: the one line on the plan, e.g. "Built for a product manager who wants to explain AI to the team."
- `goalShort`: for the progress line, e.g. "explain AI to your team".
- `persona`
- `lessons[i].because`: the reason this stop is in *your* plan.
- `lessons[i].glyph`: an OrbGlyphs id.
- `lessons[i].forYou`: one "for you" line.
- `lessons[i].added`: `true` if it was added adaptively.

`window.buildCourse(profile)` (in `data/courses-catalog.js`) builds and registers a personalised course and returns its id. The shell calls it on `onboarding:done` when `d.profile` is present. Otherwise it falls back to the catalog.

**`onboarding:done` payload:** adds `profile`.

**`App.gate(moment, opts)` → `Promise<boolean>`** (may I continue?). The shell decides by `variants.paywall`, and Plus always passes.

| moment | Who calls it | Behaviour |
|---|---|---|
| `'start'` | Learn, on "Start learning" in the plan reveal | `hard` → a non-dismissible paywall; continue only if upgraded |
| `'lesson-done'` | Learn, after each lesson's finish screen | `soft` → a dismissible paywall; always resolves `true` |
| `'next-course'` | Learn, on "Start your next course" at the end of a course | paywall; continue only if upgraded |
| `'ask'` | Ask, **once per new question** | The first 4 are free (counts `Store.asksUsed`), then the paywall |
| `'branch'`, `{ qid }` | Ask, **once per new branch** | 4 per question are free, then the paywall |
| `'graph'` | Profile | paywall |

`variants.paywall === 'onboarding'`: the shell opens a dismissible paywall about 2.6s after landing on the plan.

**Personas:** `window.PERSONAS = { priya: { name, age, blurb, profile: {…} }, arjun, maya, tom, lena }`, defined in `data/personas.js` (owned by Onboarding). `?tab=…` uses `ensureDemo()`, which builds the course for `variants.persona` with `buildCourse`. Switching persona in the side panel while you're on a tab rebuilds that persona's course.

**v5 integration notes:**
- **`onboarding:done` payload:** `{ style: 'roadmap', topic, goal, span, daily: '10 min a day', courseId, profile }`.
  - `profile.daily` is a number (minutes).
  - Span ids are `week | twoweeks | month`.
- **New Store keys from Learn:** `savedWith`, `reminder`, and `courses[i].adapt` (per-course adaptations).
- **`lessons[i].glyph`** is an OrbGlyphs **motif** name (e.g. `sine`, `neuron`).
- **`courseFor(text)`** returns `'custom'` for unknown text.
- **Mascot:** `A` (Line) is the default and `F` (Particle) is the alternative; B–E stay only in `living/mascot.html`.
  - New `sun` topic and `m.setLit(0..1)`.
  - In Ask answers the mascot itself is the explainer: it works small, then grows to about 220px and draws the topic. One character per answer.
- **Streak:** `streak/streak.js` exposes `window.Streak.flame / chip / widget / moment`. Lab: `living/streak.html`. It's not wired into the app yet.
