# Cortex · Living Matter design system

The single source of truth for how the Living Matter build (`living/index.html`) looks. Every value below was read from the running app with `getComputedStyle` after `living/theme.js` warmed the colours, on 2026-11-28. Nothing is invented. When this file and the app disagree, the app wins: re-extract and update this file.

Paper mirror: file "Cortex AI", page **Design system · Living Matter**. Tokens there use the `lm-` prefix (`--color-lm-ember`, `--radius-lm-card`, …). The older tokens in that file (cobalt, Bricolage Grotesque, Inter Display) belong to a discarded system. Don't use them.

How the theme is built: `core/shell.css` sets the shared tokens and shell components, the module CSS (`onboarding/`, `learn/`, `ask/`, `profile/`) styles each tab, `living/theme.js` rewrites every hard-coded colour to its warm twin at runtime (blues become ember, cool greys become bone/bark, navy becomes humus), and `living/theme.css` hand-styles the brand components last. So a module that hard-codes `#1F5BE0` renders as `#C13C1B`, not as the theme's `#B83A1C`. See "Inconsistencies" at the end.

The screen is 368 × 822 (phone 390 × 844, screen radius 46).

---

## 1. Colour

### Core palette
| Token (Paper) | CSS var | Hex | Role |
|---|---|---|---|
| `--color-lm-bone` | `--bone` | `#F6ECE1` | Page ground (outside cards) |
| `--color-lm-shell` | `--shell` | `#FFF8F1` | Every surface: cards, options, fields, sheets. Also "white" text on ember/humus |
| `--color-lm-humus` | `--humus`, `--ink` | `#2B1A12` | Primary text, toast, dark tag, current-row ring |
| `--color-lm-bark` | `--bark`, `--ink-2` | `#6A4636` | Secondary text, subtitles, inactive tab label, disabled CTA label |
| `--color-lm-ink-3` | `--ink-3` | `#7A5444` | Tertiary text: fine print, placeholders (Ask), hints. Lightest text allowed |
| `--color-lm-ember` | `--ember`, `--cobalt-500` | `#B83A1C` | The one accent: selected fill, active tab, eyebrows, done marks, progress fill |
| `--color-lm-ember-700` | `--cobalt-700` | `#9A2F15` | Ember as small text on shell (letter tiles, callout eyebrow, counts) |
| `--color-lm-ember-900` | `--cobalt-900` | `#5A1D0C` | Defined; rarely rendered |
| `--color-lm-coral` | `--coral`, `--cobalt-300` | `#F07B5A` | Glows, halos, the "current" sphere. Never text |
| `--color-lm-saffron` | `--saffron` | `#EFB43E` | Start of progress gradients, warm wash. Never text |
| `--color-lm-ember-tint` | `--ember-tint` | `#F8E2CF` | Icon tiles (pebble), "For you" callout, paywall perk tiles |
| `--color-lm-carved` | (warmed `#EEECF0`) | `#F8EEE4` | Fill of carved controls in Learn/Ask: quiz options, round buttons, new-course row |
| `--color-lm-disabled` | | `#EADBCB` | Disabled primary button fill |
| `--color-lm-on-ember-sub` | | `#FFE4D6` | Subtitle text on a selected (ember) option |

### Gradients
- **Canvas** (`--canvas`): `radial-gradient(120% 70% at 50% 26%, #FFF5EA 0%, #F7E8D8 55%, #EFDDCA 100%)`. Tokens `--color-lm-canvas-top/-mid/-bottom`.
- **Lit** (`--lit-bg`, primary button, avatar): `linear-gradient(180deg, #C8482A, #B23718)`. Tokens `--color-lm-lit-top/-bottom`.
- **Dark** (`--dark-bg`): `linear-gradient(180deg, #3A2519, #2B1A12)`.
- **Progress fill (plan/build meters)**: `linear-gradient(90deg, #EFB43E, #C9472B)`.
- **Lesson segment fill** (`.ln-psegs i::after`): `linear-gradient(90deg, #9E3216, #C13C1B 60%, #F38665)`.
- **Sheet**: `linear-gradient(180deg, #FFF8F1, #F8EDE1)`.
- **Done sphere**: `radial-gradient(circle at 34% 30%, #E46A44, #B83A1C 70%)`. **Current sphere**: `radial-gradient(circle at 34% 30%, #FFD08A, #F07B5A 62%, #D9553A)`.

### Feedback
| Token | Hex | Used for |
|---|---|---|
| `--color-lm-right` | `#2F7A52` | Right option fill, "right" badge |
| `--color-lm-right-text` | `#0B7A66` | "That's right" label on shell |
| `--color-lm-wrong` | `#C8402A` | Wrong option fill, "wrong" badge, wrong mark icon |
| `--color-lm-wrong-text` | `#A34027` | "Not quite" label on shell |

Right and wrong always come with an icon (check / cross in a shell circle). Never colour alone.

### Subject hues (`OrbGlyphs.colours(subject)`, Living)
| Subject | mid | deep | light | tint |
|---|---|---|---|---|
| Body | `#D4502F` | `#A0301A` | `#EEB5A3` | `#F9E0D6` |
| Mind | `#C25B80` | `#8C3458` | `#E7B9C4` | `#F6E2E1` |
| Space | `#5D4380` | `#3A2657` | `#BEB0C4` | `#E8DFE1` |
| Tech | `#D69A2D` | `#8A5A0C` | `#EFD2A3` | `#F9EBD6` |
| Nature | `#6A8A34` | `#42601D` | `#C3CCA5` | `#EAE9D7` |
| Arts | `#3F8A82` | `#235F59` | `#B2CCC5` | `#E4E9E1` |
| Society | `#5F7389` | `#3A4A5E` | `#BFC3C7` | `#E9E5E2` |
| History | `#9A6B45` | `#674125` | `#D7C0AC` | `#F1E4D9` |

Subject hues are only for illustrations, graph nodes and legend dots. UI chrome stays ember.

### Allowed contrast pairs (WCAG ratio)
| Text on ground | Ratio | Use |
|---|---|---|
| humus on shell | 15.8 | All primary text |
| bark on shell | 7.9 | Secondary text |
| bark on bone | 7.1 | Secondary text on the page ground |
| ink-3 on shell | 6.3 | Tertiary / fine print (the lightest text allowed) |
| ember on shell | 5.5 | Eyebrows, links, small accents |
| ember-700 on shell | 7.2 | Small ember text (≤13px) |
| shell on ember | 5.5 | Selected fills, active tab, primary CTA (on lit 4.5+) |
| on-ember-sub on ember | 4.7 | Subtitle inside a selected option |
| shell on right | 5.0 / shell on wrong 4.7 | Feedback fills |
| bark on disabled | 6.1 | Disabled CTA label |
| shell on humus | 15.8 | Toast, dark tag |

Never: coral (2.6) or saffron (1.8) as text; any text lighter than ink-3 on light grounds.

---

## 2. Typography

Two families, loaded from Google Fonts: **Fraunces** (display) and **Figtree** (text). Geist is gone in this build.

### Fraunces (display)
Every display class renders at **weight 560, letter-spacing −0.03em, `font-variation-settings: "SOFT" 100, "opsz" 72`** (forced with `!important` in `theme.css`).

| Role | Class | Size / line-height |
|---|---|---|
| Hero (lesson done) | `.ln-done-t` | 32 / 36 |
| Plan title | `.ln-ph-t` | 31 / 35 |
| Screen title | `.ln-h1`, `.ak-title`, `.pw-title` (31), `.ob-tline` (33) | 28 / 32 |
| Onboarding question | `.ob-head` | 27 / 31 |
| Sheet title | `.ln-sh-t` | 24 / 28 |
| Callout / card title | `.ob-ctx`, `.ob-card h2`, `.pf-atitle` | 23 / 26–27 |
| Quiz question | `.ln-qh` (`.ln-h2`) | 22 / 27 |
| Card question, name, stat | `.ak-wonder-q`, `.pf-name`, `.ln-done-stats b` | 22 / 26 |
| Stat number | `.pf-stat b` | 21 / 25 |
| Section title | `.ak-h3` | 20 / 25 |
| Number in tile | `.ob-num` (weight 600, ember) | 20 |
| Small section | `.pf-h2` 19 / 24 · `.pf-gtitle h2` 18 / 22 · `.ln-switch-t` 18 |
| "Why" line | `.ln-why`: Fraunces **italic 450, opsz 14**, 14.5 / 19 |

### Figtree (text)
| Role | Example class | Size / lh · weight · tracking |
|---|---|---|
| Field input | `.ob-field textarea` | 21 / 28 · 600 (placeholder 500) · −0.02em |
| Lesson body | `.ln-answer` | 19 / 28 · 500 · −0.012em |
| Ask lead | `.ak-lead` | 18.5 / 27 · 500 · −0.012em |
| Card title | `.ln-sk-tx b` (current) | 18 / 23 · 650 · −0.015em |
| Button label | `.btn-lit`, `.ob-btn` | 17 · 650 · −0.01em |
| Section label | `.ak-h2` | 17 / 22 · 600 · −0.02em |
| Quiz option | `.ln-opt` | 16.5 / 21 · 600 |
| Option title | `.ob-ot b` | 16 / 20 · 600 · −0.015em |
| Body / sub-headline | `.ob-tsub` | 16 / 22 · 500 |
| Callout body | `.ln-fy-t` | 15.5 / 22 · 550 |
| Feedback body | `.ln-reveal-card .ln-body` | 15.5 / 22.5 · 500 |
| Explain / sheet sub | `.ob-explain`, `.pw-sub` | 15 / 20–21 · 500 |
| Feedback label | `.ln-reveal-k` | 15 · 700 |
| Progress line | `.ln-ph-prog` | 14.5 / 20 · 500 (count 700) |
| Option subtitle | `.ob-ot small` | 14 / 18 · 500 |
| Toast, chips, segmented | `.toast`, `.ak-seg button` | 14 · 600 |
| Meta | `.pf-since`, `.ln-crow-tx span` | 13.5 / 18 · 500 |
| Callout eyebrow | `.ob-ceb` | 13 / 17 · 600 · ember-700 |
| Meta (lesson) | `.ln-meta` | 13 / 17 · 550 |
| Tab label | `.tabbar button` | 12.5 · 650 |
| **Eyebrow** | `.ln-eyebrow` | 12 / 16 · 600 · **+0.09em · UPPERCASE · ember** |
| Fine print | `.pw-fine`, `.ob-fine` | 11.5–12 / 16 · 500 · ink-3 |
| Tag | `.ln-tag` | 10.5 · 750 · +0.08em · UPPERCASE |

Weights in use: 450 (italic only), 500 body, 550 meta, 560 display, 600 labels, 650 buttons/card titles, 700 counts/feedback, 750 tags.

---

## 3. Spacing
4-based with half steps. Values that recur:
- **Screen gutter**: onboarding 18, Learn 20, Ask 16, Profile 12 (see Inconsistencies).
- **Stack gaps**: options 10 · course rows / chips 8 · plan list 14 · perks 10 · sheet content 12.
- **Option padding**: onboarding `10 18 10 12` (icon tile 46) · quiz `8 14 8 10` (letter tile 40) · Ask option `8 14 8 9`.
- **Card padding**: 16 (feedback, plan row), 16 18 14 (wonder), 18 16 (Ask section), 13 16 15 (callouts).
- **Sheet padding**: `26 22 22` (paywall), `26 16 16` (course sheet).
- **Bottom dock**: CTA sits 32 from the bottom in onboarding (`.ob-cta`), and 30 inside the lesson foot (`.ln-pfoot` padding `36 20 30`). Tab bar is 70 tall at bottom 22: keep the bottom 100 clear.
- Tap targets ≥ 44 (round buttons 44, streak 44, field 62, CTA 58).

---

## 4. Radii
| Token | px | Used by |
|---|---|---|
| `--radius-lm-dot` | 50% | Round buttons (44), marks, badges, avatar |
| `--radius-lm-pebble` | `48% 52% 46% 54% / 54% 46% 52% 48%` | Icon tiles in onboarding options, paywall perks (not a Paper token: use the CSS value) |
| `--radius-lm-tile-sm` | 12 | Ask option icon, point icon |
| `--radius-lm-letter` | 13 | Quiz letter tile (40) |
| `--radius-lm-art` | 18 | Painted art at 60 px (16 at 52, 34 at 120, 42 at 160) |
| `--radius-lm-callout` | 20 | "For you" callout, done-stat card, Ask option, Ask demo panel |
| `--radius-lm-card` | 22 | Quiz option, plan row, feedback card, suggestion card, callout bubble (`22 22 22 6`) |
| `--radius-lm-field` | 24 | Question field, course row, recent card, collectible card |
| `--radius-lm-option` | 28 | Onboarding option/outcome, title card, wonder card, graph card, archetype card |
| `--radius-lm-sheet` | 40 | Paywall and course sheet |
| `--radius-lm-pill` | 999 | Buttons, chips, tab bar, toast, segmented control, trail |

---

## 5. Surfaces and elevation
All shadows are warm (`rgb(120,60,30)` or humus), with a 1px white inner top highlight.

| Name | Fill | `box-shadow` | Used by |
|---|---|---|---|
| **Card** (`--card-shadow`) | shell | `inset 0 1px 0 #fff, 0 1px 2px rgba(120,60,30,.06), 0 10px 24px -14px rgba(120,60,30,.5)` | Feedback card, wonder, suggestions, Ask section, done stats, callout bubble |
| **Carved** (`--carved`) | shell / carved | `inset 0 1px 0 #fff, inset 0 0 0 1px rgba(106,70,54,.08), 0 8px 20px -14px rgba(120,60,30,.55)` | Options (default), chips, round buttons, `.btn-carved` |
| **Selected** | ember | `inset 0 1px 0 rgba(255,255,255,.22), 0 12px 26px -12px rgba(184,58,28,.75)` | Selected option / chip / outcome |
| **Lit** (`--lit-shadow`) | lit gradient | `inset 0 1px 0 rgba(255,255,255,.3), 0 12px 26px -10px rgba(178,55,24,.7)` | Primary button, avatar, Ask "hold" button |
| **Field** | shell | `inset 0 1px 0 #fff, 0 12px 30px -16px rgba(120,60,30,.55)` | Question field |
| **Field focus** | shell | `0 0 0 2px #B83A1C, 0 0 0 7px rgba(184,58,28,.12), 0 14px 36px -16px rgba(184,58,28,.5)` | Field `:focus-within` |
| **Float** | `rgba(255,248,241,.9)` + `blur(18px) saturate(1.4)` | `inset 0 1px 0 #fff, 0 16px 34px -16px rgba(120,60,30,.55)` | Tab bar |
| **Soft pill** | `rgba(255,248,241,.92)` | `inset 0 1px 0 #fff, 0 8px 20px -14px rgba(120,60,30,.55)` | Streak pill, course switcher |
| **Current** | shell | `inset 0 0 0 2px #2B1A12, 0 1px 2px rgba(43,26,18,.05), 0 14px 30px -18px rgba(43,26,18,.5)` | The current plan row (ink ring) |
| **Sheet** | sheet gradient | `inset 0 1px 0 #fff, 0 30px 70px rgba(43,26,18,.38)` | Paywall, course sheet |
| **Back** | shell | `0 6px 16px -8px rgba(120,60,30,.45), inset 0 1px 0 #fff` | Onboarding back button |
| **Disabled** | `#EADBCB` | `inset 0 0 0 1px rgba(106,70,54,.12)` | Disabled primary |
| Backdrop | `rgba(43,26,18,.42)` + `blur(3px)` | | Behind sheets |

---

## 6. Motion
Easings (from `core/shell.css`):
- `--out`: `cubic-bezier(0.23, 1, 0.32, 1)`: everything that enters or responds.
- `--glide`: `cubic-bezier(0.32, 0.72, 0, 1)`: big moves (sheets, tab bar, title card).
- `ease-in` only for exits (sheet down 220ms, options out 300ms, lesson leave 480ms).
- Build zoom: `cubic-bezier(.55,0,.75,.2)` 1800ms; night fade `cubic-bezier(.4,0,.2,1)` 1600ms (onboarding only).

| Interaction | Spec |
|---|---|
| Press (buttons, chips) | `scale(.965)` 160ms `--out` (options `.975` 200ms, round `.93`) |
| Select (option fill) | background/color/box-shadow 220ms ease-out + `obFlare` 520ms `--out` (brightness 1.4, scale 1.02) |
| Option enter | `obOptIn` 520ms `--out`: from `translateY(16px)` opacity 0, staggered |
| Text swap | `obSwap` 600ms `--out`: blur 8px → 0, `translateY(6px)` → 0 |
| Card / feedback enter | `lnRise` 460–560ms `--out`: `translateY(10px)` → 0 |
| Mark / badge pop | `lnPopIn` 420–520ms `--out`: `scale(.6)` → 1 |
| Wrong answer | `lnShake` 420ms `--out` |
| CTA ready glow | `obGlow` 2.4s / `lnGlow` 2.6s ease-in-out infinite |
| Progress fill | width 900ms `--out` (build meter 420ms) |
| Sheet | up `pwUp` 480ms `--glide`; down 220ms ease-in; backdrop fade 260ms ease-out |
| Tab bar show/hide | transform 500ms `--glide`, opacity 300ms; tab fill 200ms |
| Toast | `toast` 2400ms `--out`: rises 10px, holds 10–85%, fades |
| Ask words | `akWord`: blur 4px → 0, opacity |

Animate transform and opacity. Support `.still` on `<html>` (`?still=1`) and `prefers-reduced-motion` (durations collapse to 1ms).

---

## 7. Components

### Buttons
**Primary · lit** (`.btn-lit`, `.ob-btn`, `.ln-cta`)
- 58 tall, full width, radius 999, **never shrinks** (`flex-shrink: 0`).
- Default: lit gradient, Lit shadow, Figtree 17/650, −0.01em, shell text.
- Pressed: `scale(.965)`.
- Ready (lesson after answering): adds `lnGlow`. Its peak shadow is `inset 0 0 0 1.6px rgba(255,248,241,.7), inset 0 -6px 13px rgba(255,248,241,.45), 0 12px 40px rgba(193,60,27,.62), 0 0 0 6px rgba(193,60,27,.12)`.
- Disabled: fill `#EADBCB`, `inset 0 0 0 1px rgba(106,70,54,.12)`, bark label. Copy says what's missing ("Pick an answer").

**Secondary · carved** (`.btn-carved`): 52 tall, radius 999, shell, Carved shadow, Figtree 15/650 humus.

**Text button** (`.pw-free`): 44 tall, transparent, Figtree 15/600 bark. Link style (`.ak-link`): 15/600, colour `#9E3216`.

**Icon button · round** (`.ln-round`, `.ak-round`, `.ob-back`): 44 × 44 circle, carved fill `#F8EEE4` + Carved shadow (onboarding back: shell + Back shadow). Icon 18–20, line, stroke 2.4, humus.

**Close in sheet** (`.pw-x` 40, `.ln-sh-x` 44): circle, `rgba(106,70,54,.08)`, bark icon.

**Send** (`.ak-send`): 44 circle; disabled `#F4E7DA` with `#B17E64` icon; enabled is ember.

### Chips and pills
- **Choice chip** (`.ob-chip`): 60 tall, flex 1, radius 999, shell + Carved, Figtree 16/600 −0.015em. Selected = ember fill + shell text + Selected shadow.
- **Legend chip** (`.pf-chip`): 40 tall, padding `0 13 0 11`, `rgba(255,248,241,.78)`, `inset 0 0 0 1px rgba(255,248,241,.9), 0 1px 2px rgba(44,27,18,.05)`, 13.5/600, 11px subject dot.
- **Streak pill** (`.ln-streak`): 44 tall, padding `0 15 0 12`, Soft pill, flame icon 18 + count 15/700.
- **Tag** (`.ln-tag.is-dark`): 22 tall, padding `0 9`, humus, shell text 10.5/750 +0.08em uppercase.
- **Term chip** (`.ak-term`): radius 9, padding `0 8 0 6`, `rgba(193,60,27,.09)`, `inset 0 0 0 1px rgba(193,60,27,.15)`, text `#9E3216` 600, sparkle icon 12.
- **Crumb** (`.ak-crumb.is-cur`): 34 tall, ember `#C13C1B`, shell 14/600, 26 icon circle.

### Segmented control (`.ak-seg`)
48 tall, padding 4, radius 999, track `rgba(44,27,18,.07)` + `inset 0 1px 2px rgba(44,27,18,.06)`. Thumb 40 tall ember `#C13C1B`, `inset 0 0 0 1px rgba(255,248,241,.3), 0 6px 14px rgba(193,60,27,.3)`. Labels 14/600: bark, selected shell.

No toggle/switch exists in the app.

### Fields
**Question field** (`.ob-field`): 62 tall, padding `17 20`, radius 24, shell, Field shadow; focus = Field focus. Text 21/28 600 −0.02em humus, placeholder 500 bark, caret ember.
**Ask box** (`.ak-box`): 60 tall, padding `0 8 0 20`, radius 30, shell, `inset 0 0 0 1px rgba(44,27,18,.05), 0 1px 2px rgba(44,27,18,.05), 0 10px 28px rgba(44,27,18,.09)`; input 16/500, placeholder ink-3; trailing 44 send.
**Follow-up bar** (`.ak-comp`): 58 tall, radius 999, `rgba(255,248,241,.9)` + blur 12.

### Selection
**Onboarding option** (`.ob-opt`; outcome `.ob-out` is the same at 62 tall with a 44 tile)
- Default: min-height 68, padding `10 18 10 12`, gap 14, radius 28, shell, Carved. Icon tile 46 pebble `#F8E2CF` holding a solid gradient icon (`fillSVG`, 28) or a Fraunces 20/600 ember number. Title 16/20 600 humus, subtitle 14/18 500 bark. Trailing check circle 26 with `inset 0 0 0 1.5px rgba(106,70,54,.3)`.
- **Selected = fill**: ember, shell text, subtitle `#FFE4D6`, Selected shadow, tile `rgba(255,248,241,.92)`, `scale(1.06) rotate(-4deg)`, check circle filled shell with an ember check (stroke 3).
- Onboarding has no disabled option state.

**Quiz option** (`.ln-opt`)
- Default: min-height 60, padding `8 14 8 10`, gap 12, radius 22, carved `#F8EEE4` + Carved. Letter tile 40, radius 13, shell, `#9A2F15` 15/700. Text 16.5/21 600 humus. (Guess-first options swap the letter for a line icon.)
- Right: fill `#2F7A52`, shell text, shadow `0 10px 24px rgba(18,165,138,.3)`, letter tile `rgba(255,248,241,.22)`, trailing mark 28 shell circle with a right-green check.
- Wrong (picked): fill `#C8402A`, shadow `0 10px 24px rgba(222,89,55,.28)`, mark 28 shell circle with a wrong-red cross.
- Disabled / dimmed (others after answering): carved fill, `inset 0 0 0 1px rgba(255,248,241,.7)`, text bark, letter tile `rgba(255,248,241,.6)` with ink-3.

**Ask option** (`.ak-opt`): 56 tall, padding `8 14 8 9`, radius 20, carved + Carved, icon tile 38 radius 12 shell with `#9E3216` icon, text 16/600.

**Course row** (`.ln-crow`): 70 tall, padding `10 14 10 10`, radius 24. Selected: ember fill, `inset 0 0 0 1px rgba(255,248,241,.3), 0 10px 24px rgba(193,60,27,.3)`, icon tile 50 radius 17 `rgba(255,248,241,.16)`, title 16.5/600, meta 13.5/500 at 82% shell, check. New: carved + Carved, tile `#FAF3ED` with ember-700 icon.

### Feedback (quiz)
After answering, the options lock (right fill, wrong fill if picked, others dimmed), a feedback card rises below (`lnRise`) and the CTA turns lit with `lnGlow`.
- Card (`.ln-reveal-card`): padding 16, radius 22, shell, Card shadow.
- Label row (`.ln-reveal-k`): gap 8, 15/700. Badge 22 circle, fill right/wrong, shell icon 13. Text `#0B7A66` "That's right" or `#A34027` "Not quite".
- Body: 15.5/22.5 500 bark. On wrong it starts "Right answer: **…**".

### Cards
- **Card** (feedback, suggestion, wonder, Ask section, done stat): shell + Card shadow, radius 20–28 by size.
- **Plan row** (`.ln-sk-c`): radius 22, padding 16 (12 when compact), gap 14, painted art 60 (52) radius 18 (16).
  - Current: shell + **Current** ink ring, tag, title 18/23 650, meta 13/550, italic Fraunces "why".
  - Done: `rgba(255,248,241,.62)`, no shadow, title 16.5/650, ember done mark 26 with check.
  - Locked: transparent, `inset 0 0 0 1.5px rgba(106,70,54,.17)`, title bark.
  - Rows are joined by a 2 × 14 connector: `rgba(106,70,54,.3)`, ember once reached.
- **Callout bubble** (`.ob-callout`): radius `22 22 22 6`, padding `13 16 15`, Card shadow; eyebrow 13/600 ember-700, title Fraunces 23.
- **"For you" callout** (`.ln-fy`): ember-tint `#F8E2CF`, radius 20, padding `13 16 15`; key 11.5/750 +0.09em uppercase ember with sparkle; text 15.5/22 550.
- **Stat tile** (`.pf-stat`): radius 18, padding `10 12 11`, `rgba(255,248,241,.72)`, `inset 0 0 0 1px rgba(255,248,241,.9), 0 1px 2px rgba(44,27,18,.04)`; number Fraunces 21, label 12/500 bark.

### Sheets
**Paywall** (`.pw-sheet`): inset 8 from the screen edges, radius 40, padding `26 22 22`, gap 12, Sheet gradient + Sheet shadow, `pwUp` 480ms glide.
- Grab 36 × 5 `rgba(44,27,18,.14)`; close 40.
- Eyebrow 12/700 +0.1em ember; title Fraunces 28/31; sub 15/21 500 bark.
- Perks: gap 10, 15/600 rows with 34 pebble ember-tint tiles (ember check).
- Then the lit CTA, the "Continue with the free plan" text button and fine print 11.5/500 ink-3.

**Course sheet** (`.ln-sh`): same shell; padding `26 16 16`; title Fraunces 24/28; backdrop `rgba(44,27,18,.36)`.

### Toast (`.toast`)
Humus pill, shell 14/600, padding `12 18`, centred at bottom 112, `toast` 2400ms.

### Progress
- **Onboarding dashes** (`.ob-bar`): 10 tall; 25 × 10 rounded dashes every 32 px (mask); track `rgba(106,70,54,.2)`, fill ember.
- **Lesson segments** (`.ln-psegs`): 6 tall, gap 5, radius 3, track `rgba(44,27,18,.1)`, fill the lesson-segment gradient (scaleX).
- **Plan meter** (`.ln-meter`): 4 tall, radius 2, track `rgba(106,70,54,.17)`, ember fill.
- **Build / course meter** (`.ob-np`, `.ln-bar`): 8 tall, radius 4, track `rgba(106,70,54,.15)`, saffron → `#C9472B` gradient.

### Lesson chrome (`.ln-pbar`)
At top 60, sides 16: a 44 round close (carved), segments (flex 1), a count `1/2` 13.5/600 bark (36 wide, right-aligned), gap 12. Content starts at 112 with the eyebrow. The foot (`.ln-pfoot`) fades from transparent to `#EEDDCC` behind the 58 CTA.

### Tab bar (`.tabbar`)
Left/right 16, bottom 22, 70 tall, padding 6, radius 999, Float. Three equal buttons, radius 28, 22 icon + 12.5/650 label, gap 3. Active: ember fill, shell, `inset 0 1px 0 rgba(255,255,255,.22), 0 8px 18px -8px rgba(184,58,28,.7)`. Inactive: bark. Icons: Learn (three nodes and a path, line), Ask (four-point star, solid), Profile (five dots, solid).

### List rows
Ask recent (`.ak-tree`): 66 tall, padding 10, gap 12, inside a card with 6 inset; 46 round glyph; title 15.5/600; branches 13/500 bark with 8 px dots; chevron ink-3. Profile course (`.pf-course`): 78 tall, padding 12, radius 22, Card; 54 glyph tile radius 17; title 16/600; meta 13/500; 6 px bar.

### Icon tiles
- Onboarding: 46/44 **pebble**, ember-tint, solid gradient icon (`fillSVG`) 28.
- Paywall perk: 34 pebble, ember-tint, ember line icon.
- Ask: 38 radius 12 shell or `#FAF3ED`, ember icon. Suggestion glyph 44 radius 14.

### Painted glyph tiles
`OrbGlyphs.svg(id, 'ii', subject, size)`: a 48-unit square painting (bone `#F3E3CF` ground, subject-light wash, saffron wash, ground shadow, the subject drawn in mid/deep with a gouache filter, paper grain). Clipped by the holder radius: 60 → 18, 52 → 16, 120 → 34, 160 → 42 (with `0 20px 40px -26px rgba(43,26,18,.6)`). The SVG uses shared filters `#og-paint`, `#og-paper`, `#og-wash`. Inline them when you copy a glyph out of the app, or the grain rect renders as a dark veil.

---

## 8. Rules (from `CONTRACT.md` and the theme)
1. **Selected = fill.** Ember with shell text. Never border-only.
2. **The primary CTA is 58 tall, full width, and never shrinks.** One lit button per screen.
3. **Contrast:** text never lighter than ink-3 `#7A5444` on light grounds. Coral and saffron are never text.
4. **No emojis.** Anywhere.
5. **No 3D clay or rendered images** (rejected). The `assets/*.png` habit renders are legacy.
6. **Illustrations are painted:** `OrbGlyphs.svg(id, 'ii', subject, size)`.
7. **Diagrams are ink line** (humus/ember strokes, like the Ask demo diagrams). No painted textures in diagrams.
8. **Particles only** in onboarding, collectibles, and the central node of the Ask map and Profile graph.
9. **The mascot lives only in the Ask tab.** Direction `A` (Line) by default; `F` Particle is the alternative.
10. **Line icons** only for small UI chrome (stroke 2–2.6, round caps). Solid gradient icons (`fillSVG`) for personality in onboarding.
11. Right and wrong always come with an icon.
12. Tap targets ≥ 44. Every visible control works.
13. Never write "Touch it".
14. Copy: plain, short, friendly.

---

## 9. Inconsistencies found (and what to do)
| What | Where | Recommendation |
|---|---|---|
| **Two embers.** Theme ember `#B83A1C` vs warmed cobalt `#C13C1B` (and `#9E3216` for 700) | Ask (question bubble, crumb, segmented thumb, term chips, links), lesson segments, `lnGlow`, course-row shadow | Use `#B83A1C` / `#9A2F15` everywhere; point those rules at `var(--ember)` |
| **Two carved fills.** Shell `#FFF8F1` (onboarding options, chips) vs `#F8EEE4` (quiz options, round buttons, Ask options) | onboarding vs learn/ask | Pick shell for all selectable rows; keep `#F8EEE4` for round icon buttons only |
| **Option radius** 28 (onboarding) vs 22 (quiz) vs 20 (Ask) | | One option radius: 22 for rows ≤ 68 tall |
| **Card radius** spread: 18, 20, 22, 24, 26, 28 | | Collapse to 20 (small), 24 (cards), 28 (hero cards), 40 (sheets) |
| **Eyebrow** has 5 variants: 12/600/.09em ember · 12/700/.11em bark (plan) · 12/600/.06em `#943B25` (title card) · 12/700/.1em ember (paywall) · 11.5/600/.08em ink-3 (profile) | | One eyebrow: 12/16 600 +0.09em ember |
| **Right/wrong shadows** are unwarmed `rgba(18,165,138,.3)` (old teal) and `rgba(222,89,55,.28)`; "That's right" text is teal `#0B7A66` while the fill is `#2F7A52` | `.ln-opt.is-right`, `.ln-reveal-k` | Derive both from `--right` / `--wrong` |
| **Ready CTA glow** (`lnGlow`) uses the old cobalt-era inset white rings instead of the Lit shadow | `.ln-cta.is-ready` | Reuse `obGlow` from `theme.css` |
| **Glyph palette** uses bone `#F3E3CF` and humus `#3E2317`, not the theme's `#F6ECE1` / `#2B1A12` | `profile/orb-glyphs.js` | Fine for the painting; don't reuse these as UI colours |
| **Streak flame** uses `#FFC078 → #E8590C` (old orange), not saffron/ember | `.ln-streak` | Use saffron → ember |
| **Build stop dots** use the old pink accent warmed to `#F28B6E/#C74C2D` | `.ob-dot` | Use ember/coral spheres like the roadmap |
| **Screen gutters** 18 / 20 / 16 / 12 | ob / ln / ak / pf | One gutter: 20 (16 for edge-to-edge cards) |
| `.ob-hint` still contains "Touch it" (hidden, opacity 0) | onboarding | Remove the string |
