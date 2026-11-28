# Plan · Cortex v4: one app (onboarding → Learn · Ask · Profile)

Date: 28 Nov 2026. Built from Anesh's handoff (`.context/attachments/W8zsoO/handoff-for-sriram.md`) and three rounds of decisions with Sriram.

## Strategy in one line
Come here, not ChatGPT, for any curious thought. Every screen has to prove three things: **you can see it**, **it stays with you**, **you can branch anywhere**. Onboarding ends with a course **you** made, and the particle character is how the product feels alive.

## Decisions
| Area | Decision |
|---|---|
| Scope | Build all of it: onboarding v4 plus the Learn, Ask and Profile tabs, as **one app** at one link |
| Style | The current style (Geist, cobalt, light premium surfaces, solid colour icons). Restyle once a brand wins |
| Character | **The particles are the character.** Brand-neutral and fluid; they form any shape (icons, letters, a roadmap) |
| Brand | 4 names × styles explored **in parallel**: Cortex, Curious, Rabbit hole, Polymath |
| Demo topic | **The human heart.** Generation is faked, so this course is fully prepared |
| Opening | Keep the dark trailer, tightened. The orb world shows **range** (space, food, history, skills), so it reads "learn anything" |
| Learning style | 3 options: Quick bites · Connect the dots · Full roadmap. The **particles reshape live** for each one (many small bites / a connected web / one winding path), and that shape becomes the course format |
| Course build (the wow) | **The particles build the roadmap:** they stream out and settle into lesson stops one by one, each label landing as it does, then the path lights up end to end |
| Paywall | Right after you land on your Learn roadmap. Free continues with up to 3 courses |
| Free Ask | Free users can type a question and see the answer **start to form**, then the paywall appears. Never a locked box |
| Ask home | **Explore all three** behind a picker: (A) box + one live wonder, (B) your curiosity map as home, (C) the character talks to you |
| Lesson style | **Explore all three** behind a picker: (1) our exploration, paced into steps with a quiz, (2) a short card stack, (3) mixed by learning style |
| Course gift | A one-of-a-kind **particle collectible** made from the course (a glowing heart) goes onto your Profile shelf, and your graph visibly grows a new cluster |
| Archetype | **2 axes, emerging:** breadth ↔ depth (from your graph) × guided ↔ self-directed (from your style) gives 4 archetypes. Shown as "forming…" at first, revealed after about 5 explorations. No "Polymath" (it's a brand candidate) |
| Free vs Plus | Ask: preview, then paywall · whole graph: Plus (free sees a preview) · branches: 3 per question for free · courses: 3 for free |

## Execution: one shell, five parallel builders
- **Lead (me):** the app shell (phone frame, router, tab bar, shared state, paywall, side panel with step jumps, variant pickers and a Free/Plus toggle), the heart course outline, the integration, QA, deploy, and the docs update (`CORTEX_MASTER.md` + `decisions.md`).
- **A · Onboarding v4:** the tightened trailer → learning style with the particle reshape → "What do you want to learn?" (typing first, suggestions second) → goal + time questions → particles build the roadmap → hand-off to Learn.
- **B · Learn:** course switcher, a roadmap whose format follows your style, the 3 lesson styles (picker), quizzes, review stops, the course-end gift moment, and suggestions that widen the course.
- **C · Ask:** the 3 home directions (picker), a chat where tapping a word branches full-screen, a trail + corner map zoom-out, answer types matched to the question, and free → preview → paywall.
- **D · Profile:** the knowledge graph (preview vs whole), the emerging archetype, the collectible shelf, courses and streak.
- **E · Brand:** the same 2 key screens (Welcome + Learn roadmap) in the 4 name × style variants, each with its own particle-character treatment.

Contract between modules: `prototypes/cortex-app/CONTRACT.md`.
