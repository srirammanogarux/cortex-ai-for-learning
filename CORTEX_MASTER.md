# CORTEX — Master brief

Attach this file to any chat or agent working on Cortex. It is the source of truth: if a chat's idea conflicts with it, this file wins until it is updated. Last updated: 2026-11-27.

Related files:
- `research/decisions.md`: full decision log (D1–D28+).
- `research/design-system-breakdown.md`: material recipes, with exact CSS.
- `research/onboarding-inspiration.md`: Quest / Wondering / Wabi teardowns.
- `research/00-synthesis.md` and `research/01–03`: market research.
- **Paper file:** https://app.paper.design/file/01M8BYJ54Z6P1RYBKXQXFK6YCH

---

## 1. The product in one paragraph
Cortex is a mobile-first **curiosity app**. People who open ChatGPT to understand something come to Cortex instead. They get a **visual, interactive answer**, can follow **rabbit holes** at any time, and Cortex **remembers and revisits** what they learned through quick practice. **Positioning:** *the place you go when you're curious.* Courses are what a curiosity grows into; they are not the front door.

## 2. Users
| Persona | Wide↔deep · joy↔use | Asks like | Feels it worked when |
|---|---|---|---|
| **Wanderer** (Riya, 27, designer) | wide · joy | "Why do we dream?" after a reel | "I have to send this to someone" |
| **Builder** (Sam, 34, PM) | deep · use | "How do interest rates hit startups?" | "I can explain it in tomorrow's meeting" |
| **Student** (Meera, 19) | deep · mastery | "Explain entropy intuitively" | "I get it, and I can answer questions" |
| **Specialist** (doctor, engineer; V1) | deep · rigor | "New mechanism of X?" | Precise, sourced, no dumbing down |

V0 targets the first three. iOS and Android, India and global.

## 3. Information architecture
Tabs (floating pill bar, icons, label shown on the selected tab only): **Ask · Explore · Practice · Memory**
- **Ask (home, first tab, like ChatGPT):**
  - The orb, plus "What are you curious about?" and a composer at the bottom (type or voice).
  - Floating **sparks** (your unfinished questions) and a **Continue** chip.
  - Answers come as a quick visual answer card, then "Explore it" opens the full **Exploration**.
- **Explore:** a **For you** strip (Continue + sparks), trending rabbit holes, 8 subject shelves, and "Make it mine" on other people's Explorations.
- **Practice:** the 2-minute **Daily mix** of due concepts, plus practising any single Exploration.
- **Memory:** a canvas of everything explored, as bubbles clustered by subject. Zoom levels go subject → Exploration → cards. Filters, plus profile behind the avatar.
- There is **no Today tab.**

## 4. The Exploration (core content unit)
- **Card flow:** Hook (one-line answer + illustration) → Aha (interactive diagram) → Unfold (2–4 cards) → Quick check (1 question) → Next (3 rabbit holes · "Make it a deep dive" · "Practise later").
- **Branching:**
  - Glowing terms open a peek sheet with "Explore this", which creates a branch.
  - A trail (Heart › Valves › Murmurs) shows the path.
  - Pinching out shows the branches.
- **Lead card type depends on the question:**
  - living model (how it works)
  - story trail (why)
  - analogy flip (what is it)
  - scale zoom (how big)
  - map (where)
  - versus (comparisons)
  - myth vs fact (misconceptions)
- **Visuals:** the LLM fills JSON specs for ~10 diagram templates and the app renders them. Illustrations are painterly, generated per topic, and tinted to the subject colour.
- **Questions:**
  - V0 formats are tap-only: multiple choice, select-all, true/false, fill-in-the-blank with a word bank, put in order, match pairs, tap the diagram, guess-then-reveal, spot the mistake, confidence rating.
  - Every wrong option has its own "why not" explanation.

## 5. Activation, monetisation, retention
- **Activation:** in the first session, the user finishes their first Exploration, taps its interactive diagram and follows one rabbit hole.
- **Paywall:** soft. It appears at the rabbit-holes screen of the first Exploration, offering a 3-day trial with an ×. Sign-in happens after the wow.
- **Free tier (proposed):** 3 Explorations a day, unlimited quick answers and practice. Deep dives are paid.
- **Retention:**
  - Daily mix with a streak that allows a freeze day.
  - At most 1 notification a day, leading with curiosity ("your heart question has a next chapter"), never guilt.

## 6. Character: the orb (in exploration)
- **No cartoon mascot.** Cortex is a **cobalt glass orb**.
- **Leading proposal ("The Cortex"):** a glass orb that **fills with your curiosity**. Every topic drops in as a tiny bubble in its subject colour. It is the character, a progress signal and the doorway to Memory, all in one.
- **States:** idle (breathing), listening (rings pulse with your voice), thinking (light swirls while AI generates), filled, happy/hint (brightens).
- **Build:** one Rive file.
- **Paper:** see the *04 Orb character* page (6 directions plus the converge proposal).
- **Candidate under review (2026-11-27): a particle "Speaking Orb"** (MIT, aqualang89/shipnotes-components).
  - **What it is:** a WebGL sphere of 6–12k particles that morphs per state: sphere (listening), tangled ribbons (thinking), gyroscope rings (searching), a tick (done). While speaking, syllables send rings through it, and it can build caption words out of particles.
  - **Strengths:** it fits the name Cortex (particles = neurons), and particles can form *any* shape (a heart, the curiosity map).
  - **Weaknesses:** it glows on dark but washes out on light. It's web WebGL, so React Native needs a Skia/GL port.
  - **Siri-style conic-gradient orb (CSS):** cheap, and works on light backgrounds. It's generic (Siri/Gemini look), so it's only a small-size fallback.
  - **Render:** `.context/orb-preview.png`.
- **Brain variant (prototype 2026-11-27, `.context/brain-orb-v2.png`):** the same particles fold into a brain, and "thinking" sends light pulses along the folds, like neurons firing.
  - **Proposed use:** the sphere at rest; it becomes a brain while thinking or learning; then it forms the topic's shape (for example a heart).
  - **Onboarding reveal:** your imported questions light up "lobes" in subject colours.
  - **Production:** sample the particles from a real 3D brain model, not maths.

## 7. Design system (summary; exact values in Paper › 01 Foundations and in tokens)
- **Look:** Quest-grade physical UI. Objects have soft carved faces, white rims, inner light and soft double shadows. The background is a cool lilac-grey studio with warm fog.
- **Type:**
  - **Bricolage Grotesque 600:** titles, numbers, card titles, button labels. Tracking −3% (−1% on buttons).
  - **Inter Display 500–600:** body, labels, tabs, fields, eyebrows.
- **Text sizes:**
  - Screen title 32–36
  - Section 22–24
  - Card title 17–24
  - Body 15–17 with line-height ~1.4
  - Meta 12–13
- **Colour layers:**
  1. **Neutrals** (≈90% of every screen):
     - Ink `#141211`
     - Strong `#3B3936`
     - Secondary on background `#625E5A`
     - Secondary on cards `#736F6B`
     - Eyebrow `#77736E`
     - Muted `#B9B5B0`
     - Card `#FFFFFF`, Soft `#F6F3F0`, Carved `#E4E1E6`
     - Ground gradient `#E4E1E6 → #DADCE1 → #D5D5D5`
  2. **Brand: Electric cobalt.**
     - 500 `#1F5BE0`, 600 `#1F55D6`, 700 `#1A47B8` (links), 900 `#0B2A66`, 300 `#7FA3FF`, 50 `#EEF3FF`
     - Used only for: Ask, the main button, streak, links, hints, celebrations.
     - It is the only electric blue in the app.
  3. **Subjects** (deep / base). White text goes on deep only.

     | Subject | Deep | Base |
     |---|---|---|
     | Body | `#A3264F` | `#D84A72` |
     | Mind | `#4A30B0` | `#7457E0` |
     | Space (midnight) | `#2F3766` | `#56619A` |
     | Tech | `#165F87` | `#2A8FC4` |
     | Nature | `#22692F` | `#3F9E52` |
     | Society | `#526612` | `#7E9A2A` |
     | History | `#7E5408` | `#C8922A` |
     | Arts | `#7E2777` | `#B04AA8` |
  4. **Feedback** (practice only, always with an icon): right `#12A58A`, wrong `#E5484D`, hint = cobalt.
- **Rules:**
  - Browsing screens stay grey. An Exploration takes on its subject's colour.
  - Features have no colour of their own.
  - No halos or radial blobs on covers.
- **Materials:**
  - **CarvedChip** (buttons, keys, selected tab): face `#E4E1E6`, 1px white rim, a stack of 7 inner shadows, drop `-1px 2px 6.6px` + `0 7px 25.6px` at 25%. Press = scale .965.
  - **Lit door** (coloured primary): gradient `#0B2A66 → #1F5BE0 → #CFDDFF` with the same carved stack.
  - **Bezel:** an 8px white ring around an inner card. Inner radius = outer − padding.
  - **Fields:** flat, translucent white, radius 16.
- **Cards:** image or illustration on top, fading into a footer in the same colour (Quest style). Glass tags on colour, carved white chip for actions.
- **Radius:** tag/pill 999 · tile 12 · field 16 · card 18–24 · bezel 32 · sheet 40.
- **Spacing:** 4pt grid. Screen margin 20–24, card padding 16–20.
- **Backgrounds:** studio light (default) · colour scene (moments) · dark blueprint/aurora (onboarding and reveals).

## 8. References (what to borrow)
- **Quest:** onboarding as a moment. Understanding meter → founder letter → **Reveal** as cinematic story chapters (a Wrapped-style profile). Dark → light transition. Glowing orbs. Native surfaces.
- **Wondering:** conversational acknowledgements, ≤3 questions, the first lesson generated **before** signup, "one step away" sign-in gate, notifications after value, ask-first landing.
- **Wabi:** a rain of glossy image spheres, a one-line promise, native sign-in.

Full teardown: `research/onboarding-inspiration.md`.

## 9. Core flows: status
| # | Flow | Status | Paper page |
|---|---|---|---|
| 1 | Onboarding → first wow → paywall | **In exploration** (directions A–C) | 05 Onboarding directions |
| 2 | Ask (home) | Defined at text-map level | — |
| 3 | Exploration | Defined at text-map level | 01 Style v1 (old heart drafts) |
| 4 | Explore | Defined at text-map level | 03 Screens (card language) |
| 5 | Practice | Defined at text-map level | — |
| 6 | Memory | Defined at text-map level | — |
| 7 | Coming back (notifications, streak) | Defined at text-map level | — |
| 8 | Limits & paywall | Defined at text-map level | — |

### Onboarding directions under exploration
- **A · Curiosity Wrapped (Quest-style):**
  1. Dark intro with the orb: "What were you curious about this year?"
  2. Understanding meter + imports (ChatGPT, Claude, YouTube), each charging the meter.
  3. Reveal: cinematic chapters ("You're a rabbit-holer", "38 of your questions were pure curiosity", "the question you keep coming back to").
  4. Light world: the orb fills with bubbles → "You never finished: Why do we dream?" → before/after → first Exploration.
- **B · Bubble rain (Wabi-style):**
  1. White screen, glossy curiosity spheres raining down, the orb.
  2. "Tap what pulls you" (spheres with topics).
  3. Spheres fly into the orb, which thinks.
  4. The first Exploration grows out of the orb.
- **C · Conversation with the orb (Wondering-style):**
  1. The orb speaks: three quick questions with acknowledgements (what made you curious, how you like explanations, why you learn).
  2. Live build: "Drawing the heart ✓ Writing the aha…".
  3. "Your first exploration is ready" → sign in.
- **Likely converge:** A's structure (meter → reveal → first spark) + B's opening image + C's acknowledgements and speed. The ChatGPT import path is optional, with C's questions as the fallback.

## 10. How to run a flow exploration (instructions for any chat or agent)
1. **Read** this file and `research/decisions.md`. Don't re-decide settled items; list conflicts under "Open questions" instead.
2. **Work in Paper** on **your own page**, named `NN <Flow> · <your name>`. Never edit Foundations or Components. Copy components instead of redrawing them, and use the tokens.
3. **Diverge:** 2–3 genuinely different directions, 3–5 key frames each, at 390×844.
4. **Converge:** pick one, with a one-line reason per rejected direction.
5. **Specify** every screen in the chosen direction:
   - purpose
   - entry and exit
   - elements, top to bottom
   - copy
   - states (empty, loading, error, success)
   - motion (what moves, the duration, which spring)
   - haptics
   - analytics event
6. **Edge cases:** no import, slow AI, offline, returning user, free-limit hit.
7. **Output:** a short summary in chat, plus `research/flows/<flow>.md` using the template below.
8. **Images:** generate only when asked, in the painterly gouache style, tinted to the subject family. At most 4 per run.

### Flow spec template (`research/flows/<flow>.md`)
```
# Flow: <name>
Goal · success metric · entry points · exit points
## Direction chosen (+ why the others were rejected)
## Screens
### <n> · <screen name>
Purpose · Elements (top→bottom) · Copy · States · Motion · Haptics · Event
## Edge cases
## Open questions for the coordinator
```

## 11. Open decisions
- **Orb:** confirm "The Cortex" (glass + curiosity bubbles), or pick another of the 6 directions.
- **Subject cover style:** linear / enamel / arcs / soft tint.
- **Ask button style** inside the tab bar: now that Ask is the first tab, does it still need its own button?
- **Onboarding direction:** A / B / C / converged.
- **Free-tier numbers and price** (placeholder: $9.99/mo, $59.99/yr; ₹299/mo).
