# Onboarding v2 · "The trailer"

Status: proposal for alignment (2026-11-27). Replaces the Seen / Ask / Wonder prototype, which was rejected as unintuitive and over-built.

## The idea in one line
Onboarding is a short film. **You touch the brain, you feed it, it learns you, and then it becomes the answer to your question.** Every scene builds toward that last moment.

## Three rules
1. **One beat per scene.** One line, one action. Nothing to read twice.
2. **Every question has to visibly change the brain now AND change the wow later.** If it doesn't do both, cut it.
3. **The brain never leaves.** It's the main character. It moves, grows and reacts between scenes. Screens don't cut; they flow.

## The story arc
| Act | Scenes | What the person feels |
|---|---|---|
| 1 · Hook | Cold open, Touch it | “What is this? It’s alive.” |
| 2 · Build | Curious about, Why, Connect (optional) | “It’s becoming mine.” |
| 3 · Climax | Ask, The answer | “Whoa. I’ve never seen it explained like this.” |
| 4 · Resolve | Keep it, Plus, Home | “I want to come back.” |

## Scene by scene

**0 · Cold open** (about 5s, no buttons)
- **See:** darkness. Dots drift in and gather into the brain. Lines appear one at a time: *“You ask a lot of questions.” → “Most answers, you forget.” → “Let’s change that.”*
- **Why:** sets the tone like a trailer. One idea: curiosity that sticks.

**1 · Touch it**
- **See:** “Go on. Touch it.” Drag across the brain and the dots scatter from your finger, then spring back. Tap and it ripples. Hold and it leans in and listens.
- **Why:** it teaches the one gesture the whole app uses. The same gesture explores answers later. Pure play, no questions.
- **Builds toward:** the wow, where this gesture unlocks the answer.

**2 · “What do you wonder about?”** (from Wondering's goal and topic questions, reframed as curiosity)
- **See:** about 9 glossy subject orbs (Space, Body, Mind, Money, Tech, History, Nature, Food, Art). Pick 3 or more. Each one you pick flies into the brain and lights a region in its colour.
- **Why:** it decides what your starter questions are about, and the brain starts looking like *yours*.
- **Changes the wow:** your sparks in scene 5 come from these picks.

**3 · “What brings you here?”** (Wondering's goal question)
- **See:** four tall options. *For the joy of it · For work · For study · To go deep*. The brain answers in one line, e.g. “Work. I’ll use examples from your world, with sources.”
- **Why:** it sets how the first answer is told: tone, depth, and how it ends.
- **Changes the wow:** a story-style ending with something to share, versus a model with sources, versus a quick check.

**4 · “Bring your curiosity”** (our own step: connect ChatGPT, Quest's meter. Optional.)
- **See:** an understanding meter, already at about 40% from scenes 2–3. “You’ve asked ChatGPT hundreds of things. Bring them and I’ll find the ones you never finished.” Two options: connect (copy prompt or screenshot), or “Not now”.
- **If connected:** your questions rain into the brain and the meter jumps to about 85%.
- **Why:** the deepest personalisation, plus the “you never finished this” hook. It's optional, so it never blocks.
- **Changes the wow:** your unfinished question is offered first in scene 5.

**5 · “Ask me anything”**
- **See:** the brain plus a composer. Three sparks built from scenes 2–4. If you connected, the first one is tagged *You never finished this*.
- **Why:** the wow has to be *their* question.

**6 · The answer (the wow)**
- **See:** the brain listens, thinks (neurons fire), dissolves, and re-forms as the answer: a beating heart, a falling-rates chart, a token pipeline.
  - One line of caption.
  - Then “Touch it”: the same gesture from scene 1. Touch a part and it zooms in, and the caption explains just that part. Drag and time moves.
- **Why:** this is the reason for onboarding. Scene 1 set it up; this pays it off.

**7 · Keep it**
- **See:** after 2–3 touches, “This is yours now.” The answer shrinks into a glowing node inside your brain. Button: **Save my brain** (Apple / Google).
- **Why:** sign-in comes after value, when there's something to lose (Wondering's trick).

**8 · Plus** (soft)
- **See:** one screen. The pitch matches scene 3 (“Keep wandering” / “Go deep for work” / “Ace your exams”). Start the trial, or “Maybe later”.

**9 · Home**
- **See:** your brain, lit in your colours, with a composer and your sparks.
- Notifications are asked later, after the second exploration, not here.

**Length:** about 60–90 seconds. Seven scenes if you skip connecting.

## How each question earns its place
| Scene | What it changes on screen now | What it changes in the wow | What we learn |
|---|---|---|---|
| Touch it | The brain reacts to you | You already know how to explore the answer | That they engage |
| Wonder about | Regions light up in subject colours | Which sparks they see | Interests |
| Brings you here | The brain answers out loud | Tone, depth, ending, paywall pitch | Why they explore |
| Connect | The meter jumps, questions rain in | “You never finished this” comes first | History, unfinished threads |
| Ask | The brain listens | It *is* the wow | The actual curiosity |

## Interaction and design fixes (apply everywhere)
- **The brain is touchable, not clickable.**
  - Pointer and finger move: dots near it scatter, then spring back.
  - Tap: ripple.
  - Hold: listen.
  - Fast drag: swirl.
  - Hover works on desktop too.
- **One selection style: fill.** A selected option is a cobalt fill with white text. No border-only states, and no “hint” rings.
- **Taller options:** about 64px minimum, 18–20px vertical padding, 17px text, with room to breathe between them.
- **Fluid transitions:**
  - The brain stays on screen and moves between positions.
  - Text crossfades.
  - One sticky primary button per scene.

## Open decisions
1. **Dark to light?** Open in the dark (cinematic), and the lights come on at the wow (“understanding = light”). The app itself stays light.
2. **Connect before or after the wow?** Before: Quest-style build-up and a better first answer. After: lower friction, offered as a bonus.
3. **Plus in onboarding, or after the 3rd question?**
