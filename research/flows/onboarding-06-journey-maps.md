# Onboarding · Journey maps: 3 directions × 4 personas

Status: draft for review (2026-11-27). Builds on `onboarding-03-converged.md` (the directions) and `-04`, `-05` (personas and their question fingerprints).

**How to read this.**
- Each direction gets a step-by-step map: what the person **sees**, what they **do**, the **brain's state**, the **metric** to watch, and the **drop-off risk**.
- Under each map is a **feeling score per persona** (−2 frustrated … 0 neutral … +2 delighted), with ★ marking where their wow lands.
- These scores are hypotheses. The prototypes exist to check them.

---

## Direction 1 · "Seen": your past curiosity, revealed

| # | Step | Time | They see | They do | Brain | Metric | Drop-off risk |
|---|---|---|---|---|---|---|---|
| 1 | Hello | 0–8s | Dots gather into a brain. "Every question you've asked says something about you." | Watch, tap | Forms | — | Low |
| 2 | Where do you ask? | 8–15s | ChatGPT · Claude · Gemini · Google · "I don't" | Tap one | Listens | % choosing "I don't" (they go to Direction 3) | Low |
| 3 | Bring your questions | 15–75s | Founder letter → copy prompt → open ChatGPT → paste back (or a screenshot) | **Leaves the app**, pastes | Waits, breathes | **Import completion** | **High:** effort + privacy |
| 4 | Meter fills | 75–90s | Questions fly in as dots and settle into lobes, coloured by subject | Watch | Lobes light up | — | Low |
| 5 | Curiosity Wrapped | 90–120s | 3 chapters: "38 were pure curiosity" · "You're a rabbit-holer" · "The one you keep coming back to" | Swipe | Pulses per chapter | Chapter completion, screenshots | Medium (skippable) |
| 6 | Confirm | ~125s | "You explore mostly for **work**. Right?" | Tap yes / change | Nods | % who change it (inference accuracy) | Low |
| 7 | Before / after | ~135s | Their ChatGPT answer shrinks to grey; the brain forms the topic | Watch, tap | Forms topic | — | Low |
| 8 | First Exploration | 2.5–4 min | Hook → interactive aha → cards → persona ending | Drag, read, tap | Shapes the concept | **Aha interaction**, ending tap | Medium (length) |
| 9 | Rabbit holes → sign in + paywall | ~4 min | 3 rabbit holes; "Keep going": 3-day trial, × for free | Choose | Idles, warm | **Trial start**, sign-in rate | **High** |
| 10 | Notifications | — | "I'll tell you when a question you never finished has a next chapter." | Allow / later | — | Opt-in rate | Low |
| 11 | Ask home | — | The brain in their colours; 3 sparks from their history | — | Idle | Day-2 return | — |

**Feeling per persona**

| Step | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Riya | +1 | 0 | −1 | +1 | **+2 ★** | +1 | +1 | +2 | −1 | 0 | +1 |
| Sam | 0 | 0 | −1 | 0 | +1 | +1 | **+2 ★** | +2 | 0 | 0 | +1 |
| Meera | +1 | 0 | −1 | +1 | +1 | +1 | **+2 ★** | +2 | −2 | 0 | +1 |
| Dev | 0 | 0 | −2 | 0 | 0 | +1 | +1 | **+1 ★** | −1 | 0 | +1 |

**What the map says**
- **The wow arrives late (90–135s) and comes after the hardest step.** The whole direction depends on step 3. If import completion is under about 40%, this direction fails.
- **Riya's wow is the Wrapped reveal** ("it knows me"). **Sam's and Meera's is the before/after** ("that's so much better than what I got").
- **Dev is the least served:** the import feels like a privacy risk, and Wrapped feels like a gimmick unless it reflects his technical depth.
- **Fixes to prototype:**
  - a screenshot import (no copy-paste)
  - a 3-line privacy promise *above* the button, not in a letter
  - a "Skip, show me instead" path into Direction 3

---

## Direction 2 · "Ask": your curiosity right now

| # | Step | Time | They see | They do | Brain | Metric | Drop-off risk |
|---|---|---|---|---|---|---|---|
| 1 | Hello + composer | 0–5s | The brain (it responds to touch) · "What are you curious about?" · 3 sparks: fun / work / study | Type, speak or tap a spark | Idle → listens | % spark vs typed | **Medium:** blank page, "what do I ask?" |
| 2 | Brain forms it | 5–15s | Neurons fire → the brain *becomes* the topic (a heart, a rate curve) | Watch | Thinks → forms | — | Low |
| 3 | Quick answer card | 15–20s | A one-line answer + the visual aha · [Explore it] [Quiz me] | Tap | Settles | **% Explore it** | Low |
| 4 | First Exploration | 20s–2.5 min | Lead card set by intent × shape; tone from the spark they chose | Drag, read | Shapes the concept | Aha interaction, completion | Medium |
| 5 | Teach it about you | ~2.5 min | "Two quick taps": why you explore · how you like it explained → the next card re-renders | Tap twice | Listens, nods | **% answered**, re-render seen | Medium (feels like a form) |
| 6 | Optional import | — | "Bring your ChatGPT questions; I'll find the ones you never finished" | Most skip | — | Import opt-in | — (optional) |
| 7 | Rabbit holes → sign in + paywall | ~3 min | Same as Direction 1 | Choose | Warm idle | **Trial start** | **High** |
| 8 | Notifications → Ask home | — | Home with sparks | — | Idle | Day-2 return | — |

**Feeling per persona**

| Step | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Riya | 0 | **+2 ★** | +1 | +2 | 0 | +1 | −1 | +1 |
| Sam | +1 | +1 | **+2 ★** | +2 | −1 | 0 | 0 | +1 |
| Meera | +1 | **+2 ★** | +1 | +2 | +1 | 0 | −2 | +1 |
| Dev | +1 | +1 | **+1 ★** | +1 | 0 | −1 | −1 | +1 |

**What the map says**
- **The fastest wow of the three (~15s), for everyone.** It feels like ChatGPT, so there's nothing new to learn.
- **The weak spot is step 1 for Riya.** She opens the app *after* the moment of curiosity has passed, so she needs sparks that feel irresistible, not generic.
- **The second weak spot is the first answer.** It isn't personal yet, so it has to rely on the lead card (intent × shape) being right. The "person" part only arrives at step 5.
- **Dev and Sam like it best:** it respects their time. Dev only gets to +2 if the depth is right; a "Go deeper / expert" toggle on the quick answer card fixes that.
- **Fixes to prototype:**
  - Sparks rotate by time of day, with one "guess-first" spark (borrowed from Direction 3).
  - Step 5 becomes a *visible upgrade* ("watch this card change for you"), not a form.

---

## Direction 3 · "Wonder": a guided spark, then your way

| # | Step | Time | They see | They do | Brain | Metric | Drop-off risk |
|---|---|---|---|---|---|---|---|
| 1 | Hello, spheres | 0–6s | Curiosity spheres drift in around the brain · "Let's see how your brain likes to learn." | Watch | Idle | — | Medium for Sam and Dev ("not why I came") |
| 2 | Guess first | 6–25s | "How much blood does your heart pump a day?" Slider → "7,500 litres, a pool a week" | Drag, guess | Forms a heart | **Guess completion** | Low |
| 3 | Which explanation clicks? | 25–45s | The same idea three ways: story / diagram / analogy | Swipe, tap one | Mirrors the style | Style distribution | Medium ("quiz-y") |
| 4 | Why do you explore? | 45–55s | Joy · Work · Study → spoken acknowledgement | Tap | Nods | — | Low |
| 5 | Now yours | 55–70s | "What have you always wondered about?" Composer + 3 shaped sparks | Type or tap | Listens → thinks → forms | **% typing their own** | Low |
| 6 | First Exploration | 70s–3 min | Rendered in their chosen style + persona ending | Drag, read | Shapes the concept | Aha interaction | Low |
| 7 | Rabbit holes → sign in + paywall | ~3 min | Same | Choose | Warm idle | **Trial start** | **High** |
| 8 | Notifications → Ask home | — | Home; import offered later in Memory | — | Idle | Day-2 return | — |

**Feeling per persona**

| Step | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Riya | +2 | **+2 ★** | +1 | +1 | +1 | +2 | −1 | +1 |
| Sam | −1 | 0 | −1 | +1 | +1 | **+2 ★** | 0 | +1 |
| Meera | +1 | +2 | **+2 ★** | +1 | +1 | +2 | −2 | +1 |
| Dev | −1 | 0 | −1 | 0 | +1 | **+1 ★** | −1 | +1 |

**What the map says**
- **The best direction for Riya and Meera.**
  - Riya: the guess *is* her favourite kind of question (scale and myth).
  - Meera: the taste test makes her feel understood ("you think in pictures"), and that's her wow.
- **The worst for Sam and Dev.** About 55 seconds pass before their own question, and steps 1–3 read as a game.
- **Fixes to prototype:**
  - A permanent "Skip to my question" chip.
  - The guess question rotates by locale and audience: heart for general users, "how many tokens per second does a GPU…" for technical users who arrived from a dev referral.

---

## Across all three

### Time to wow
| | 1 · Seen | 2 · Ask | 3 · Wonder |
|---|---|---|---|
| Riya | ~100s (Wrapped) | ~15s (brain forms) | ~20s (guess reveal) |
| Sam | ~135s (before/after) | ~20s (quick answer) | ~90s (own Exploration) |
| Meera | ~135s (before/after) | ~15s (brain forms) | ~45s (taste test) |
| Dev | ~3 min, weak | ~20s | ~90s, weak |

### Best fit per persona
- **Riya:** 3 · Wonder, then 1 · Seen (for heavy ChatGPT users).
- **Sam:** 2 · Ask.
- **Meera:** 3 · Wonder, then 2 · Ask.
- **Dev:** 2 · Ask, with expert depth.

### Patterns that hold in every direction
1. **The paywall dip is universal, and deepest for Meera (−2).** Price sensitivity is the cause.
   - Test a student price or a "free while you practice" tier.
   - Never put the paywall in the way of her quick check.
2. **The Exploration is the emotional peak in every direction** (+2 almost everywhere). The paywall goes *right after* it, never before it.
3. **Dev is never above +1 before the Exploration.** For him, depth and evidence *are* the wow. Onboarding can only avoid losing him; it can't delight him first.
4. **Home after onboarding is +1, never +2.** The persona-specific **post-onboarding wow** (next step) has to close that gap on day 1–2:
   - Riya: "A spark you'll like".
   - Sam: "Part 2 is ready".
   - Meera: "3 concepts to check".
   - Dev: "New paper on X, explained".

### Where this likely converges
Use **Direction 2 as the spine** (fastest wow for all four).
- If the composer sits idle for about 4 seconds, **Direction 3's guess-first appears as a spark.** That fixes Riya's blank page.
- **Direction 3's taste test runs in Direction 2's step 5,** as a visible re-render.
- **Direction 1's Wrapped becomes the upgrade moment** (Memory tab, or a day-2 nudge), not the front door.

We still prototype all three, because the scores above are guesses and the prototypes test them.

---

## Next
1. Per-persona onboarding steps + screen-by-screen spec (components, interaction, dynamism, brain states) → `onboarding-07-screens.md`.
2. Diverge on themes and interaction per screen.
3. 3–4 clickable HTML prototypes with the live brain orb.
