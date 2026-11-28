# CORTEX — Master brief

Attach this file to any chat or agent working on Cortex. It is the source of truth: if a chat's idea conflicts with it, this file wins until it is updated. Last updated: 2026-11-28, after Anesh's handoff (`.context/attachments/W8zsoO/handoff-for-sriram.md`) and the v4 plan (`research/flows/plan-v4-app.md`).

Related files:
- `research/decisions.md`: full decision log (D1–D33+).
- `research/flows/plan-v4-app.md`: the current plan (one app: onboarding → Learn · Ask · Profile).
- `research/design-system-breakdown.md`: material recipes, with exact CSS.
- `research/onboarding-inspiration.md`: Quest / Wondering / Wabi teardowns.
- `research/00-synthesis.md` and `research/01–03`: market research.
- **Paper file:** https://app.paper.design/file/01M8BYJ54Z6P1RYBKXQXFK6YCH

---

## 1. The product in one paragraph
**Come here, not ChatGPT, for any curious thought.** Cortex is a mobile-first curiosity app. The first answer has to make three things felt, never said:
- **You can see it:** visual and interactive, not a wall of text.
- **It stays with you:** everything joins your knowledge graph.
- **You can branch anywhere** without losing your place.

You can **learn anything** here. A skill becomes a finite **course**; a curiosity becomes a living **explanation**; "make me something" becomes a quirky **artifact**.

## 2. Users
| Persona | Wide↔deep · joy↔use | Asks like | Feels it worked when |
|---|---|---|---|
| **Wanderer** (Riya, 27, designer) | wide · joy | "Why do we dream?" after a reel | "I have to send this to someone" |
| **Builder** (Sam, 34, PM) | deep · use | "How do interest rates hit startups?" | "I can explain it in tomorrow's meeting" |
| **Student** (Meera, 19) | deep · mastery | "Explain entropy intuitively" | "I get it, and I can answer questions" |
| **Specialist** (doctor, engineer; V1) | deep · rigor | "New mechanism of X?" | Precise, sourced, no dumbing down |

- **Learning style, asked once in onboarding:** Quick bites · Connect the dots · Full roadmap. It sets the format of the first course.
- **Archetype = learning style × knowledge-graph shape.** This is the retention moat.
  - Two axes: **breadth ↔ depth** (from the graph) × **guided ↔ self-directed** (from the style).
  - That gives 4 archetypes. It shows as "forming…" until about 5 explorations, then it's revealed.
  - "Polymath" is not an archetype name, because it's a brand candidate.

## 3. Information architecture
Three tabs: **Learn · Ask · Profile.** Practice is dropped; Memory = Profile.
- **Learn (first tab):**
  - Your courses as a roadmap, with one active course and a switcher at the top left. Free users get up to 3 courses.
  - Lessons work like Explorations, with quizzes along the path and review as stops on the roadmap.
  - **Courses are finite.** The end brings a unique **particle collectible** (e.g. the living heart), your graph visibly grows, and suggestions widen into bigger tracks.
- **Ask:**
  - A chat layout like ChatGPT. **Tap a word to branch**: the branch chat takes over the whole screen.
  - A trail at the top plus a corner map lets you zoom out to the whole tree.
  - **The answer type matches the question type** (see §4).
  - The home screen is still being explored: A box + one live wonder · B your map as home · C the character you talk to, type to or show things.
- **Profile:** your knowledge graph across subjects (free users see a preview), your archetype, collectibles, courses and streak.
- **Not yet placed:** the old Explore content (For you, trending, subject shelves).

## 4. The Exploration (core content unit)
- **Card flow:** Hook (one-line answer + illustration) → Aha (interactive diagram) → Unfold (2–4 cards) → Quick check (1 question) → Next (3 rabbit holes · "Make it a deep dive" · "Practise later").
- **Branching:**
  - Glowing terms open a peek sheet with "Explore this", which creates a branch.
  - A trail (Heart › Valves › Murmurs) shows the path.
  - Pinching out shows the branches.
- **The answer type matches the question type** (Anesh, 2.9): why/how → an interactive visual · teach me a skill → a course · A vs B → a comparison card · what happened → a story or timeline · how big → a scale zoom · is it true → myth vs fact · help me decide → a small decision tool · make me something → a quirky artifact (a quiz to send, a cheat sheet, a trading card, a comic, a mini game, flashcards).
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
- **Onboarding order (decided):**
  1. Curiosity trailer
  2. Learning style
  3. "What do you want to learn?": typing first, suggestions second
  4. Course questions: goal and time
  5. **The course builds itself in front of you** (the particles build the roadmap)
  6. Land on Learn
  7. **Paywall**
- **Activation:** build a course and finish lesson 1.

**Free vs Plus:**

| | Free | Plus |
|---|---|---|
| Ask | You can type, and the answer starts to form, then the paywall appears | Full |
| Knowledge graph | Preview | Whole graph |
| Branching | 3 branches per question, any depth | Unlimited |
| Courses | Up to 3 | More |

More paid features and pricing are still open. The placeholder price is $49.99/yr with a 3-day trial.

- **Retention:** finite courses that lead to the next one, the archetype that grows, the streak, and collectibles.

## 6. Character: the particles
- **The particle system is the character.** It is brand-neutral and fluid. It forms any shape: a brain, a "?", icons, a heart, a roadmap, letters.
- **Behaviour:**
  - It reacts to touch (scatters and springs back).
  - It listens and thinks (neurons firing).
  - It morphs into the topic.
  - It takes on each icon's own colours.
- **Brand open:** the name may move beyond "brain" (Cortex · Curious · Rabbit hole · Polymath). Whatever the name, the particles keep, and are styled per brand.
- **History:** the glass orb → a brain particle orb (D29) → particles as a brand-neutral character (D33).
- **Engine:** `prototypes/cortex-app/brain.js`.

## 7. Design system (summary; exact values in Paper › 01 Foundations and in tokens)
- **Look:** Quest-grade physical UI. Objects have soft carved faces, white rims, inner light and soft double shadows. The background is a cool lilac-grey studio with warm fog.
- **Type: Geist** for everything (D32). Titles are 600 with −3% tracking. Sizes are sleek: screen titles 26–28, card titles 17–20, body 15–16.
- **Icons:** solid glyphs in their own colour gradient, on white tiles (style A, D32). No emojis, no 3D clay.
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
- **Wondering:** the closest competitor once we add courses. Map Cortex against it 1:1 (Anesh 2.14).
- **Brilliant / Duolingo:** the roadmap pattern for Learn, in our own design.
- **Wondering (onboarding):** conversational acknowledgements, ≤3 questions, the first lesson generated **before** signup, "one step away" sign-in gate, notifications after value, ask-first landing.
- **Wabi:** a rain of glossy image spheres, a one-line promise, native sign-in.

Full teardown: `research/onboarding-inspiration.md`.

## 9. Core flows: status
| # | Flow | Status | Where |
|---|---|---|---|
| 1 | Onboarding → course build → Learn → paywall | **Building (v4)** | `prototypes/cortex-app` |
| 2 | Learn: roadmap, lessons (3 styles explored), review, course end + gift, widen | **Building** | `cortex-app/learn` |
| 3 | Ask: 3 home directions, answer types, tap-to-branch, zoom-out, free preview → paywall | **Building** | `cortex-app/ask` |
| 4 | Profile: knowledge graph, emerging archetype, collectibles | **Building** | `cortex-app/profile` |
| 5 | Brand: 4 names × styles | **Exploring** | `cortex-app/brand` |
| — | Earlier: onboarding v1–v3, idea map | Archived | Paper › Early explorations + Onboarding · initial flows |

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
- **Ask home:** A / B / C (prototyped side by side).
- **Lesson style:** paced exploration / card stack / mixed by learning style (prototyped side by side).
- **Brand:** the name, the style, and the character treatment.
- **Where review lives:** roadmap stops (current) and/or a "fading ideas" shuffle in Profile.
- **A home for the old Explore content.**
- **More paid features and pricing.**
