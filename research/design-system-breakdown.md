# Design-system breakdown: reference app (Quest, iOS)

Source: 12 screenshots shared 2026-11-26 (Amazon connect, widget sheet, colour swatches, progress card, Workouts card, Kite Hill card, Fitness card, Yosemite / Hyrule cards, tab bar, Memory screens, "Nice job, Tan" onboarding, Locations).

**The one idea behind the finesse:** every control is built like a **physical object with an edge**. It's not a flat shape with a blurry shadow under it. Each object has:
1. a **face** (a gentle top-to-bottom gradient),
2. a **lit top edge** (a 1px white inner line),
3. a **wall or lip** (a solid, unblurred 2–3px darker band under the face, like the side of a keycap),
4. a **hairline outline** (1px at about 5% black),
5. a **contact shadow** (tight, dark) plus a **cast shadow** (wide, soft, about 12–18%).

My v1 skipped 2, 3 and 4 and used one big blurred shadow, which is why it looked "AI".

Containers use a **bezel**: a thick, bright outer ring (6–8px) around a slightly recessed inner surface, so objects sit *inside* frames. Radii are **concentric**: inner = outer − padding.

---

## 1. Background
- Not flat and not warm cream. A **cool, light studio grey** with soft ambient washes, like a room lit from the top left:
  - top: cool lilac-grey `#E3E3E8`
  - bottom: warm ivory `#EFECE6`
  - a faint peach wash on the right side (`rgba(240,214,196,.5)`) and a faint lavender wash at the top left
- Pushed screens are **sheets** with a 40pt top radius sitting over a darker grey (`#BDBDC2`).
- **Mood scenes:** the background can drop into a deep colour at the bottom (for example, indigo under Expert Mode) so the screen fades into a scene.
- **Onboarding "moment" screens:** near-black with a faint blueprint grid (hairlines, crosshair "+" marks), a light streak along a card's top edge, and skeleton bars.

## 2. Typography
- **Two families.**
  - Titles: a **crisp, contemporary serif at Regular weight (400), never bold**, with tight tracking (−0.01 to −0.02em). Tiempos Headline / Signifier class.
  - UI text: a **neo-grotesk** (Söhne / Saans class).
  - Big numbers ("10,245", "6/10", "20 miles", "$12,504") use the serif.
- **Hierarchy comes from size, not weight.** Titles are large and *light*; UI labels are medium (500).

| Role | Family | Size / line height | Weight | Colour | Notes |
|---|---|---|---|---|---|
| Screen title ("Amazon", "Locations") | Serif | 34–40 / 1.05 | 400 | ink | Often centred |
| Section title ("Your People", "Known places") | Serif | 22–24 / 1.15 | 400 | ink | Left; "See all ›" on the right in sans 16 |
| Card title ("Take tonight's sunset…") | Serif or sans | 20–26 / 1.15 | 400–500 | ink | Serif on widgets, sans on media cards |
| Big number | Serif | 28–44 | 400 | ink | Unit in sans caps 12 below ("STEPS") |
| Body / lead | Sans | 17 / 1.4 | 400 | ink or graphite | Centred on hero screens |
| Secondary | Sans | 15 / 1.35 | 400 | graphite `#8A8A8F` | "Since Sep 1", URLs |
| Eyebrow / overline | Sans caps | 12–13, tracking +0.12em | 500 | graphite | "LANDMARK", "EXPERT MODE", "FIND A NEW JOB" |
| Button label | Sans (sometimes serif) | 17 | 500 | `#2A2A2E`; disabled `#A9A9AE` | "Ask Q. to Add →" uses the serif |
| Tab label | Sans | 17 | 500 | active ink; inactive `#A1A1A6` | |
| Tag | Sans caps | 11–12, tracking +0.02em | 600 | white | |

**Free stand-ins** (the originals are licensed): **Source Serif 4** (optical size 60, Regular) for titles, and **Inter Display** or **Inter Tight** for UI text. If you want the exact feel, budget for Tiempos Headline + Söhne (Klim) or Season Serif + Saans (Displaay).

## 3. Colour
**Neutrals (cool, Apple-like):**

| Token | Hex | Use |
|---|---|---|
| ink | `#1C1C1E` | text |
| graphite | `#6E6E73` | secondary text |
| mute | `#A1A1A6` | inactive tabs, placeholders |
| line | `#E3E3E6` | dividers |
| tray | `#ECECEF` | recessed tracks |
| face | `#FFFFFF` → `#F2F2F4` | object faces |
| wall | `#D2D2D7` | the lip under objects |

**Hues: saturated and clean, not muted earth.** Six families × four steps (deep / base / light / tint):

| Family | Deep | Base | Light | Tint |
|---|---|---|---|---|
| Blue | `#1652A3` | `#1E6FD9` | `#4A8FE0` | `#EEF4FD` |
| Teal | `#0E8577` | `#12A594` | n/a | `#EEF8F6` |
| Purple | `#8A4FB5` | `#B356C0` | `#C084F5` | `#F6F0FD` |
| Red | `#B3322A` | `#E5554A` | n/a | `#FDEDEC` |
| Orange | `#C95A0A` | `#F07C0E` | `#FFAD1F` | `#FFF1D6` |
| Green | `#1E5E2A` | `#1F8A2E` | `#4CA64C` | `#E6F2E3` |

Hue appears **only** in tags, progress fills, media-card footers, image mats and full-colour "achievement" cards. The interface itself stays neutral.

## 4. Objects: recipes (CSS)

**Keycap button** (pill, height 48–52; also circle 44)
```css
background: linear-gradient(180deg,#FFFFFF 0%,#F4F4F6 55%,#E9E9EC 100%);
box-shadow:
  inset 0 1px 0 #FFFFFF,            /* lit top edge */
  inset 0 -1px 1px rgba(0,0,0,.05), /* face curvature */
  0 0 0 1px rgba(0,0,0,.06),        /* hairline */
  0 2px 0 #D2D2D7,                  /* the wall / lip (solid) */
  0 3px 2px rgba(0,0,0,.08),        /* contact */
  0 12px 20px -6px rgba(0,0,0,.20); /* cast */
```
- **Pressed:** drop the wall to `0 1px 0`, move the face down 1px, and darken the face to `#EDEDF0`.
- **Disabled:** the same object with label `#A9A9AE`. It never goes flat.
- There is **no black primary button.** Primary actions are the same white keycap, made wider (full width). Emphasis comes from size and position, not fill.

**Bezel** (tab bar, Ask orb, widget frames)
- Outer ring: 6–8px, `linear-gradient(180deg,#FFFFFF,#F1F1F3)`, hairline, cast shadow `0 16px 36px -10px rgba(0,0,0,.22)`, top-edge highlight.
- Inner well: `#F3F3F5` with `inset 0 1px 3px rgba(0,0,0,.10), inset 0 -1px 0 #FFF`.
- **Tab bar:** a bezel pill; the selected tab is a smaller keycap inside the well.
- **Ask orb:** a bezel circle (64) around a keycap circle (52) with a waveform icon.

**Field (text input)**: flat, the opposite of buttons
- Height 48, radius 16.
- Fill `rgba(255,255,255,.55)` on the gradient background; inner hairline `inset 0 0 0 1px rgba(255,255,255,.6)`.
- No drop shadow, no border colour.
- Text 17 sans 500 ink; placeholder `#B0B0B5`.
- Focus: fill goes to `rgba(255,255,255,.8)` and a 1px `rgba(0,0,0,.08)` ring appears.

**Tags**
- **Glossy hue tag:** height 22–24, padding 0 10, pill.
  - fill `linear-gradient(180deg, light, base)`;
  - `inset 0 1px 0 rgba(255,255,255,.35)`, `inset 0 -1px 0 rgba(0,0,0,.12)`, `0 1px 2px rgba(0,0,0,.15)`;
  - white sans caps 11–12 / 600.
- **Glass tag** (on colour): fill `rgba(255,255,255,.18)`, 1px `rgba(255,255,255,.7)` border, white text.
- **Neutral chip** ("Experimental", "10 mins" with an icon): a small keycap, height 28–32, sans 15 / 500 ink.
- **Calendar badge:** a tiny skeuomorphic calendar. Green header strip with the month in white caps, white body with the day and weekday, soft shadow.

**Cards**
- **Widget card (bezel):** outer radius 30, padding 8; inner radius 22, white, with a faint inner edge. Content padding 20.
- **Cushion card** (link / Hyrule): inner face `radial-gradient(#FBFBFB center → #DADADD edges)` with `inset 0 -10px 18px rgba(0,0,0,.10), inset 0 2px 2px #FFF`. It reads as a puffy pillow.
- **Media card:** the image fills the top 60%; the bottom is a solid hue footer with a white serif title and a small URL at 50% white. Outer white bezel 6px.
- **Framed image (mat):** a hue mat (padding 22, radius 26) with the photo inset (radius 18, `0 8px 18px rgba(0,0,0,.35)`, 1px `rgba(255,255,255,.2)` edge). It looks like gallery framing.
- **Achievement card:** full-hue gradient face, a luminous lighter rim (1–2px), an inner glow, white serif big number.
- **Dark glass card:** navy-to-black face, a 1px luminous blue rim, white serif title, an outline-glass pill button ("Access ›").
- **List-row card** ("Landmark / Palace of Fine Arts"): a keycap-style wide card with a raised icon tile on the left (a small keycap square, radius 12) and eyebrow, title and secondary text stacked.
- **Playful touches:** cards slightly rotated (−3°); a photo "polaroid" overlapping a card corner and tilted; a hue glow fading up behind a card's bottom button.

**Data**
- **Recessed track:** `#ECECEF` with `inset 0 1px 2px rgba(0,0,0,.10), inset 0 -1px 0 #FFF`.
- **Glossy fill:** a hue gradient capsule, `inset 0 1px 0 rgba(255,255,255,.5)`, and a hue glow `0 0 10px`.
- **Bar chart:** recessed grey pill bars; the active bar is a glossy hue capsule.
- **Graph / canvas:** circular avatars with a 3px white ring and soft shadow, 1px grey connecting lines, a label under the centre node.
- **Map pins:** white keycap label pills with a red pin icon.

**Icons:** 1.5–2px rounded strokes in ink, 18–20pt, inside keycap circles.

## 5. Spacing and shape
- Screen side margin 20–24. Section gap 32–40. Card internal padding 20.
- **Radii:**

  | Element | Radius |
  |---|---|
  | Tag | 999 |
  | Chip | 999 |
  | Field | 16 |
  | Icon tile | 12 |
  | Inner card | 22 |
  | Outer card | 30 |
  | Sheet | 40 |
  | Buttons | 999 or circle |
- **Tap sizes:** circle buttons 44; Ask orb 64; tab bar 64 high.

---

## 6. Verified from Quest's own code (new.quest CSS, read 2026-11-26)

Quest's website is built from the app's design system. Its CSS comments say so ("DreamCanvas colours from the app's asset catalogue", "CarvedChip on iOS"). These values **replace** the estimates above wherever they differ.

### Font: Season (Displaay), one variable family
- `@font-face { font-family: "Season"; font-weight: 300 900 }`. The family has a **serif axis `SERF`** (0 = sans, 50 = half-serif "Season Mix").
- **Interface and body:** `SERF 0`, weight **550** (body), 600–650 (labels, buttons).
- **Titles, quest card titles and signature buttons:** `SERF 50`, weight **600–670** ("Season Mix SemiBold"). Titles **are** semibold. My earlier "never bold" rule was wrong.
- Eyebrows: 650, 11–12px, uppercase, +0.06em.
- Licensing: a commercial font from Displaay (displaay.net). It must be bought and installed on this Mac before Paper can render it. Don't lift Quest's woff2.

### Colours
| Token | Value | Use |
|---|---|---|
| ground-top | `#E4E1E6` | background gradient 0% |
| ground-mid | `#DADCE1` | background gradient 55% |
| ground-bottom | `#D5D5D5` | background gradient 100% |
| sheen | `rgba(255,255,255,.5)` | blurred white capsules, ±18° |
| fog-rose | `#F3E9E3` | glow, bottom-left |
| fog-cream | `#F3EFE3` | glow, bottom-right |
| ember | `#FFD8B8` | warm glow at 45%, right |
| ink | `#141211` | text (warm black, not neutral) |
| text-strong | `#3B3936` | |
| text-2 | `#736F6B` | secondary, status |
| text-3 | `#8A8580` | tertiary, facts |
| text-4 | `#95918D` | eyebrows, dates |
| text-5 | `#B9B5B0` | markers, very muted |
| surface | `#FFFFFF` | cards |
| paper | `#FBFAF8` | chips on photos |
| soft | `#F6F3F0` | soft button fill |
| sheet | `#F2EFEA` | sheet paper (with a 22px grid at 5% ink) |
| carved | `#E4E1E6` | grey 3D button face |
| token | `rgba(255,255,255,.3)`, lit `.7` | translucent pills on the background |
| blue door | `#0A2C57 → #1066C0 → #DAE6F9` | the one lit primary (onboarding reveal) |
| orange | `#FF8100` | accent |

**Background (DreamCanvas)** on a 390×844 phone, centred coordinates:
- base: `linear-gradient(#E4E1E6 0%, #DADCE1 55%, #D5D5D5 100%)`
- sheen capsule 900×130, rotated −18°, at (−60, −270), blur 55
- sheen capsule 900×110, rotated 18°, at (60, 250), blur 50, opacity .7
- fog-rose oval 500×300 at (−110, 330), blur 70, opacity .9
- fog-cream oval 560×320 at (130, 400), blur 75, opacity .85
- ember circle 340 at (190, 30), blur 85, opacity .45
- Top and bottom "fog": backdrop blur 22px, saturate 1.4, with white at 40–45% masked to fade.

### CarvedChip: the grey 3D button
```css
background: #E4E1E6;
border-radius: 999px;            /* 11px for square keys */
box-shadow:
  inset 0 0 0 1px #FFFFFF,                    /* white rim */
  inset -1px -4px 3.6px rgba(61,61,61,.25),   /* carved shade, bottom-right */
  inset 1px 2px 1.2px rgba(255,255,255,.81),  /* lit top-left */
  inset 0 -2px 4.5px rgba(255,255,255,.78),   /* bottom bounce light */
  inset -3px 0 3px rgba(255,255,255,.47),     /* right rim light */
  inset -1px -4px 3.2px rgba(135,135,135,.25),
  inset 0 0 20px #FFFFFF,                     /* inner glow: makes it pillowy */
  -1px 2px 6.6px rgba(0,0,0,.25),             /* contact */
  0 7px 25.6px rgba(0,0,0,.25);               /* cast */
font: 600 15px/20px Season; font-variation-settings: "SERF" 50; color: #141211;
/* press */ scale: .965;   /* lit door: scale .94 + translateY(1px) */
```
- **Lit door (coloured primary):** the same stack on the blue gradient, with a 1.6px white rim and `inset 0 0 13px #FFF`, white Season Mix 670 18px label, and a slow "breathing" inner light (opacity .05 → .16, 1.9s).
- **White card:** `#FFFFFF`, radius 18, shadow `0 1px 2px rgba(20,18,17,.05), 0 8px 22px rgba(20,18,17,.06)`.
- **Panel:** radius 28, shadow `0 1px 2px rgba(20,18,17,.06), 0 18px 48px rgba(20,18,17,.14)`.
- **Token pill:** height 44, `rgba(255,255,255,.3)` (lit `.7`), shadow `0 1px 2px rgba(20,18,17,.06), 0 6px 18px rgba(20,18,17,.08)`.
- **Motion:** spring `cubic-bezier(.2,.8,.2,1)`, about 0.55s, no overshoot. The press spring is `cubic-bezier(.34,1.4,.64,1)`.
