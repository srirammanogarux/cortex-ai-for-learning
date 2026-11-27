# Cortex AI: interactive questions, feedback, mascot, and LLM-generated visuals

Research date: 2026-11-18. Audience: product, design, and Ankit (ML). V0 ships end of November 2026, so every section ends with a "V0 vs later" call.

---

## 0. TL;DR

1. **Don't build "a quiz at the end".** The evidence favors a question before the content (a prediction), small checks between chunks, and a short mixed recall set at the end. Then bring the same concepts back 1 to 6 days later. Practice testing and spaced practice are the two techniques Dunlosky et al. rated "high utility" ([APS](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)). The testing-effect meta-analysis found the largest effects when the gap between practice and the final test was 1 to 6 days ([Adesope et al. 2017 via Frontiers review](https://www.frontiersin.org/articles/10.3389/feduc.2019.00005)).
2. **V0 question set (8 formats, all tap-only, all generated as JSON):** single/multi choice, true/false, fill-in-blank with a word bank, tap-to-order, match pairs, tap-the-diagram hotspot, predict-then-reveal, spot-the-mistake. Add a one-tap confidence rating on some items. Later: slider/estimate, label-the-diagram, explain-in-your-own-words (LLM-graded), categorize, manipulable simulations.
3. **Every wrong answer needs an explanation of why that option is wrong.** Feedback that only says right or wrong had an effect size of about 0.05. Showing the correct answer had about 0.32. An explanation had about 0.49 ([Van der Kleij et al. 2015, ACER](https://people.acer.org/en/publications/effects-of-feedback-in-a-computer-based-learning-environment-on-s/)). So the generator must write a per-distractor "why not" for each wrong option.
4. **Don't let the LLM place pixels.** Benchmarks show LLMs are weaker at raw SVG than at higher-level formats, and they get worse as the drawing gets more complex ([VGBench](https://arxiv.org/abs/2407.10972v1), [SVGenius](https://arxiv.org/html/2506.03139v1)). Recommendation: the LLM fills a **typed JSON "visual spec"** that picks from a fixed library of diagram templates and an icon set. The app renders it with react-native-svg / Skia using our tokens. Allow a sanitized "freeform SVG" escape hatch only for simple spot illustrations, and log how often it gets used.
5. **Mascot: worth it, keep it restrained.** Brilliant nearly removed Koji and then kept him because students "kept asking for a character they could talk to" ([Brilliant blog](https://blog.brilliant.org/a-world-class-tutor-in-every-home/)). Learning gains from pedagogical agents are small but real ([Schroeder et al. 2013 summary](https://educationaltechnologyjournal.springeropen.com/articles/10.1186/s41239-021-00256-z)). For V0, ship about 8 static SVG poses swapped with spring transitions. Move to a Rive state machine in V1. **No guilt-trip notifications.**
6. **Delight without manipulation:** short success state with haptic and sound, an explanation-first wrong state, a mistakes review at the end, combo/XP and a streak *with built-in slack* (freezes). Don't use hearts that block learning. Duolingo itself moved away from them because beginners were "2X more likely to run out of hearts mid-lesson" ([Duolingo blog](https://blog.duolingo.com/duolingo-energy/)).

---

## 1. Interactive question formats

### 1.1 What the best apps actually do (observed)

| App | Formats observed | Notes / source |
|---|---|---|
| **Duolingo** | Tap the pairs (matching), word-bank tile building, "tap what you hear", select-image, speak, type, and in Math: numeric keypad entry over a visual ("Show the ratio of the parts") with a COMBO x4 counter | [Duolingo wiki: exercises](https://duolingo.fandom.com/wiki/Exercise), [Duolingo blog: practice](https://blog.duolingo.com/ways-to-practice-in-duolingo), Mobbin screens: [math ratio + combo](https://mobbin.com/screens/ef9d6413-1e91-4f2c-8317-25d63ceee5bf), [word bank + character](https://mobbin.com/screens/ed029f55-5e77-4189-984d-8649255c9d88). Characters "speak" the sentence and play a unique animation on correct answers ([blog](https://blog.duolingo.com/building-character/)). |
| **Brilliant** | Manipulate the visual: "move a point, test a pattern, estimate an answer, choose a strategy". Drag the tangent line; tap code blocks to build a program, then Check, then Run. Asks a question *before* teaching a procedure. | [How Brilliant teaches](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/), [Koji launch](https://blog.brilliant.org/a-world-class-tutor-in-every-home/), Mobbin: [tap blocks to program](https://mobbin.com/screens/f332bf9f-b059-4b2d-89aa-c9226ace3557), [solved state + explanation](https://mobbin.com/screens/e022666a-34f8-4241-8d48-9613e578b033), [Koji explains: "Does that make sense? Yes / Not really"](https://mobbin.com/screens/fa56eca9-cb28-4ed8-bc7b-115d4531df04) |
| **Quizlet** | Flashcards, Learn (mixes flashcards, T/F, MCQ, written), Test, Match (timed pairing), Gravity | [Quizlet help](https://help.quizlet.com/hc/articles/360030841732), Mobbin: [wrong-answer state: "No worries, learning is a process!"](https://mobbin.com/screens/4f303c97-3a12-49ee-83ab-97254c04e17b) |
| **Kahoot** | Quiz, True/False, Type answer (short), Puzzle (order 4 tiles), Slider (numeric scale), Poll | [Kahoot question types](https://support.kahoot.com/hc/articles/115002308428) |
| **Elevate** | 40+ short games: synonym matching speed (Agility), recall, estimation, comprehension passages | [Elevate games](https://elevateapp.com/brain-training-games), [Agility](https://elevateapp.com/blog/agility-brain-test) |
| **Nibble** | Text lessons with quizzes, "motion interactives", games, audio, video, chat with historical figures | [Nibble format](https://nibble-app.com/blog/nibble-interactive-learning-format) |
| **Imprint** | Illustrated swipeable cards, chapters under 2 minutes, "Review and Remember" quizzes | [App Store](https://apps.apple.com/app/id1482780647), [Nibble vs Imprint](https://nibble-app.com/blog/nibble-vs-imprint) (competitor source, one-sided) |
| **Oboe** | AI-generated courses: articles, audio lectures, slides, quizzes, a word game (Word Quest) | [TechRadar](https://www.techradar.com/ai-platforms-assistants/gemini/oboe-just-launched-its-an-ai-powered-platform-that-helps-you-learn-anything), [Tom's Guide](https://www.tomsguide.com/ai/i-spent-a-week-using-the-latest-ai-learning-tool-heres-why-it-is-replacing-chatgpt-for-me) |
| **Wondering** | Topic, link, or PDF in; short visual lessons (about 3 minutes), podcasts, exercises out | [Chatgate listing](https://chatgate.ai/post/wondering) |
| **Synthesis Tutor** | Adaptive AI math tutor for kids (fractions, place value) | [Neil Squire review](https://www.neilsquire.ca/synthesis-tutor-an-intelligent-math-tutoring-app/) |
| **Khan Academy Kids** | Kodi Bear "celebrates when children answer a question correctly" and "encourages children to try again" when wrong | [Khan Kids help](https://khankids.zendesk.com/hc/en-us/articles/360049358751-Learn-more-about-the-characters-inside-Khan-Academy-Kids) |

Pattern: the closest competitors to Cortex (Oboe, Wondering, Imprint, Nibble) mostly ship MCQ-style quizzes after content. Brilliant and Duolingo are the ones with real interaction depth. **Room to stand out: make the generated visual itself the answer surface** (tap the diagram, order the steps of the diagram, spot the wrong label). Brilliant does this with hand-built interactives. Cortex can do a lighter, generated version because the visual spec is structured (section 5).

### 1.2 Taxonomy

Legend. **Tests**: R = recall/recognition, U = understanding, A = application/transfer. **Mobile fit**: how good it is one-handed on a phone. **LLM-gen**: how reliably an LLM can produce it as validated JSON (plus a visual spec where needed) without a human checking it.

| # | Format | Tests | Mobile fit | LLM-gen feasibility | V0? | Notes |
|---|---|---|---|---|---|---|
| 1 | **Multiple choice (single)** | R, U (A if scenario-based) | Excellent (big tap targets) | **High.** Main risk is weak distractors and answer-length cues. Validate: exactly 1 correct, options similar length, no "all of the above". | **V0** | MCQ produced testing effects as large as or larger than free recall in the Adesope meta-analysis ([Frontiers summary](https://www.frontiersin.org/articles/10.3389/feduc.2019.00005)). Each distractor should be a *named misconception* with its own explanation. |
| 2 | **Multi-select ("select all that apply")** | U | Good | High. Needs a "select N" or "select all" rule. | V0 (sparingly) | Partial-credit feedback per option. |
| 3 | **True / false (tap or swipe)** | R | Excellent; swipe is fun but easy to trigger by accident | **High** | **V0** | 50% guess rate, so use it as a warm-up or with a confidence rating. Swipe must also have tap buttons (WCAG 2.5.7, see 1.4). |
| 4 | **Fill-in-the-blank, word bank** | R, U | Excellent (tiles) | **High.** Blank must be unambiguous. Distractor tiles from the same category. | **V0** | Duolingo word-bank pattern ([Mobbin](https://mobbin.com/screens/ed029f55-5e77-4189-984d-8649255c9d88)). |
| 5 | **Fill-in-the-blank, typed** | R (harder retrieval) | Medium (keyboard covers half the screen) | Medium. Needs an accepted-answers list plus fuzzy match or an LLM judge. | Later | Typing slows people down on mobile. Use for short terms or numbers (Duolingo Math uses a numeric keypad, [Mobbin](https://mobbin.com/screens/ef9d6413-1e91-4f2c-8317-25d63ceee5bf)). |
| 6 | **Order / sequence** (tap to place, drag optional) | U (process, causality, timelines) | Good if tap-to-place; drag is fiddly | **High.** Correct order is just an array. Validate that only one order is valid. | **V0** | Kahoot "Puzzle" is a 4-tile ordering ([Kahoot](https://support.kahoot.com/hc/articles/115002308428)). Pairs well with a flow or timeline diagram. |
| 7 | **Match pairs** (tap left, tap right) | R, U (term↔definition, cause↔effect, part↔function) | Excellent (Duolingo "tap the pairs") | **High** | **V0** | 4 to 5 pairs max on a phone. [Duolingo wiki](https://duolingo.fandom.com/wiki/Exercise), Quizlet Match. |
| 8 | **Tap-on-diagram hotspot** ("tap the mitochondria") | U, A | Excellent if hit areas ≥44pt | **Medium-high, only with templated visuals.** If the diagram is built from named primitives, the answer is just `targetId`. With raw LLM SVG it is unreliable. | **V0** (on templated diagrams) | The "make the visual interactive" differentiator. Brilliant's Koji can "highlight a region" of the interactive ([Brilliant](https://blog.brilliant.org/a-world-class-tutor-in-every-home/)). |
| 9 | **Predict-then-reveal** (ask before teaching) | U (activates prior knowledge) | Excellent | **High.** Any MCQ or slider placed *before* the content chunk. Graded softly, with no penalty. | **V0** | Strong evidence (pretesting effect, section 2). Brilliant "often asks a question before presenting a procedure" ([Brilliant](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/)). |
| 10 | **Spot the mistake** (tap the wrong step, label, or sentence) | U, A (error detection, evaluation) | Excellent (tap a line or a diagram part) | **Medium-high.** LLM writes a correct artifact, injects exactly one plausible error, and records its location. Needs a verifier pass. | **V0** | Same UI as hotspot / tap-a-line. |
| 11 | **Tap-to-reveal / flashcard flip** | R (self-graded) | Excellent | **High** | V0 for **review only** | Self-graded "Got it / Not yet" feeds the spaced-repetition scheduler. A weak in-lesson check because it relies on honest self-grading. |
| 12 | **Confidence rating** (modifier on any item: "Sure / Think so / Guessing") | Metacognition | Excellent (1 tap) | **Trivial** (UI, not generated) | **V0** (on ~1 in 3 items) | Confident errors get corrected more after feedback (hypercorrection, [PMC review](https://pmc.ncbi.nlm.nih.gov/articles/PMC4084803)). Also a better signal for the scheduler. |
| 13 | **Slider / estimate** (numeric on a scale) | U (magnitude intuition), A | Excellent | Medium. Needs a tolerance band and units. Easy to write ambiguous questions. | Later (V0.5) | Kahoot Slider ([Kahoot](https://support.kahoot.com/hc/articles/115002308428)); Elevate Estimation. Great as a predict-then-reveal ("guess how many..."). |
| 14 | **Categorize / sort into buckets** | U | Good (tap item, tap bucket) | High | Later (V0.5) | Generalizes match pairs. |
| 15 | **Label / build the diagram** (place labels onto slots, connect nodes) | U, A (generative) | Medium (precision taps) | Medium with templates (slots are known); low without them | Later | The diagram template removes labels and the learner puts them back. |
| 16 | **Explain in your own words** (LLM-graded free text or voice) | U, A (generative, self-explanation) | Medium (typing); good with voice | **Medium.** Grading reliability varies a lot by domain and rubric. Studies range from r≈0.93 agreement to near-zero agreement ([summary of studies](https://andrewomalley.substack.com/p/weekly-roundup-can-ai-grade-like), [arXiv 2511.10819](https://arxiv.org/html/2511.10819v2)). | Later (V1) | If shipped: rubric with 2 to 4 binary "key ideas", show which ideas were hit, never a hard fail, and let the user say "I think this was graded wrong". |
| 17 | **Manipulate a simulation** (drag a point, adjust a parameter, see the result) | U, A | Good if designed well | **Low** for generic generation. Needs hand-built interactive components. | Later (V2) | Brilliant's core. Could become a small library of parameterized interactives (e.g. "slider controls variable X in graph template Y"). |
| 18 | **Speak the answer** | R, U | Medium (public settings) | Medium (ASR plus judge) | Later | Duolingo lets you speak many written answers ([Duolingo blog](https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-speaking-skills)). |

### 1.3 Recommended lesson skeleton ("how do we test people?")

There is no research-backed "correct number" of questions per lesson. The numbers below are a heuristic built from the findings in section 2. Treat them as starting values to A/B test.

```
Lesson ≈ 3–5 min (Wondering uses ~3-min chunks; Imprint chapters <2 min)
┌─ 0. Hook: 1 predict-then-reveal (MCQ or slider). Ungraded, no penalty.
├─ 1. Chunk A: 60–90 s of text + visual
│     └─ 1 check (MCQ / T-F / hotspot on the chunk's visual)
├─ 2. Chunk B (+ check), Chunk C (+ check)
├─ 3. Wrap-up recall set: 3–4 items, MIXED formats, at least 1 generative-ish
│     (order / spot-the-mistake / hotspot). Include 1 item from a PREVIOUS
│     lesson (interleaving) once the learner has history.
├─ 4. Mistakes review: re-ask missed items in a different format (no penalty)
└─ 5. Celebrate + "come back tomorrow for a 2-min review" (spaced)
Next 1–6 days: review session pulls 3–5 due items across lessons (FSRS-scheduled).
```

So **about 6 to 8 interactions per lesson**: 1 prediction, 2 to 3 embedded checks, 3 to 4 wrap-up. Roughly one interaction every 30 to 45 seconds. Duolingo's "review your mistakes at the end of a lesson" step is explicitly free in its Energy system ([Duolingo](https://blog.duolingo.com/duolingo-energy/)), which signals how much they value it.

### 1.4 Mobile ergonomics rules for all formats

- **Tap-first, drag optional.** Every drag interaction needs a single-tap alternative. WCAG 2.2 SC 2.5.7 (Dragging Movements) requires this ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)). Tap-to-place is also faster one-handed.
- Answer controls go in the **bottom 40% of the screen** (thumb zone). The question and visual go on top. Every observed app uses a bottom feedback sheet plus a full-width Continue button ([Duolingo](https://mobbin.com/screens/ed029f55-5e77-4189-984d-8649255c9d88), [Brilliant](https://mobbin.com/screens/f332bf9f-b059-4b2d-89aa-c9226ace3557), [Speak](https://mobbin.com/screens/20e92afb-d1b9-47ed-8ef8-d2431ba3d88b)).
- Use an explicit **Check** button for anything with more than one action (ordering, multi-select, matching). Single-tap MCQ can auto-check, but a Check step allows a change of mind and gives the moment more weight.
- Hit targets ≥44×44pt, including diagram hotspots. Enlarge invisible hit areas beyond the drawn shape ([Apple HIG accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)).
- Max 4 MCQ options, 5 match pairs, 6 order items, and about 120 characters per stem (Kahoot caps T/F at 120 chars, [Kahoot](https://support.kahoot.com/hc/articles/115002308428)).

---

## 2. Learning-science backing (short, practical)

| Principle | Evidence | Practical rule for Cortex |
|---|---|---|
| **Retrieval practice (testing effect)** | Practice testing rated "high utility" ([Dunlosky et al. 2013, APS](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)). Meta-analysis (272 effect sizes): practice tests beat restudy; MCQ and mixed formats produced large effects; strongest when the final test is 1 to 6 days later ([Frontiers review of Adesope 2017](https://www.frontiersin.org/articles/10.3389/feduc.2019.00005), [Learning Scientists](https://www.learningscientists.org/blog/2017/2/9-1)). | Questions *are* the learning, not just the measurement. Every lesson ends with retrieval. MCQ is a legitimate V0 workhorse. |
| **Spaced repetition** | Distributed practice also rated "high utility" ([APS](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)). The optimal gap grows with how long you want to remember. About 20% of the retention interval at one year, with larger fractions for shorter horizons ([Cepeda et al. 2008](https://www.evullab.org/pdf/CepedaVulRohrerWixtedPashler-PS-2008.pdf)). FSRS is open source, opt-in in Anki since 23.10, and needs fewer reviews for the same retention ([Anki FAQ](https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm)). | Every question carries `conceptIds`. Feed results (plus confidence) to an FSRS scheduler. Offer a daily "2-minute review" of due items from past lessons. Don't build a custom algorithm; use FSRS. |
| **Interleaving** | Rated moderate utility ([APS](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)). Shuffled math practice beat blocked practice on a test a week later ([Rohrer & Taylor 2007](https://digitalcommons.usf.edu/psy_facpub/1767/), [Rohrer 2014 review](https://link.springer.com/article/10.3758/s13423-014-0588-3)). | Mix 1 or 2 items from earlier lessons into the wrap-up and into reviews. Mix formats inside a set. |
| **Pretesting / predict first** | Prequestions and pretests "can often enhance learning", for text, video and lectures ([Pan & Carpenter 2023](https://springerlink.bibliotecabuap.elogim.com/content/pdf/10.1007/s10648-023-09814-5.pdf)). Prequestion groups beat controls on prequestioned *and* new items ([Carpenter & Toftness 2017 via BPS](https://www.bps.org.uk/research-digest/heres-simple-way-boost-your-learning-videos-prequestion)). The benefit is mostly specific to the prequestioned content ([Learning Scientists](https://www.learningscientists.org/blog/2017/11/2-1)). | Open each lesson with one predict-then-reveal question on the *core* idea. Never penalize it. The content must then actually answer it. |
| **Generation & desirable difficulties** | Difficulties that cost short-term performance can help long-term retention (testing, generation, varied practice). Generation helps only if the learner *succeeds* at generating ([Bjork, via review](https://pmc.ncbi.nlm.nih.gov/articles/PMC6099118), [Teaching in Higher Ed](https://teachinginhighered.com/podcast/cognitive-psychology)). | Escalate difficulty inside the lesson: recognize, then order or spot the error, then explain. Give hints before revealing the answer so the learner still generates it. |
| **Elaborative interrogation / self-explanation** | Both rated moderate utility ([APS](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html)). | Use "Why does X happen?" MCQs whose options are *reasons*. Add explain-in-your-own-words later. |
| **Feedback content** | Elaborated feedback (explanation) ES 0.49 vs correct/incorrect only 0.05 vs show-correct-answer 0.32. The gap is bigger for higher-order outcomes ([Van der Kleij 2015](https://people.acer.org/en/publications/effects-of-feedback-in-a-computer-based-learning-environment-on-s/)). Good feedback answers "Where am I going? How am I doing? What next?" ([Hattie & Timperley, cited by Brilliant](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/)). | Every distractor gets its own 1 to 2 sentence "why not". Every item gets a general explanation shown on both correct and wrong. |
| **Feedback timing** | Delayed feedback lowered effects in computer-based settings overall; immediate tends to suit lower-order learning ([Van der Kleij 2015](https://people.acer.org/en/publications/effects-of-feedback-in-a-computer-based-learning-environment-on-s/)). Feedback right after reading works better than later ([Swart et al. 2019 summary](https://scholarlypublications.universiteitleiden.nl/access/item%3A3185633/view)). | **Immediate feedback per item** in lessons. Optional: in review sessions for strong learners, batch feedback at the end. |
| **Confidence & hypercorrection** | High-confidence errors are *more* likely to be corrected after feedback ([Butterfield & Metcalfe, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4084803)). | When a "Sure" answer is wrong, make the explanation more prominent (mascot "Ooh, surprising one!"). Never shame. |
| **Multimedia design** | Coherence (cut extraneous material) median d≈0.86; signaling d≈0.69; spatial contiguity (labels next to the parts) d≈0.82 ([Mayer, UNH PDF](https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-research-based-principles-for-designing-multimedia-instruction-mayer.pdf)). | This is the basis of the visual design guide: no decorative clutter, labels *on* the diagram, highlight what matters. |

---

## 3. Feedback & delight

### 3.1 Correct / wrong states (observed patterns)

- **Bottom sheet verdict + full-width Continue.** Duolingo shows a green sheet with "Correct!" or "Great!" and the character reacting ([Mobbin](https://mobbin.com/screens/ed029f55-5e77-4189-984d-8649255c9d88)). Speak shows a red "Incorrect" sheet with "Correct Answer: Salut." ([Mobbin](https://mobbin.com/screens/20e92afb-d1b9-47ed-8ef8-d2431ba3d88b)). The "Vocabulary" app adds the definition ([Mobbin](https://mobbin.com/screens/a3538d35-c422-40ed-b571-121b4b16a4fb)).
- **Show both the learner's pick and the right one.** Quizlet marks the wrong pick with an X and outlines the correct one, with the copy "No worries, learning is a process!" ([Mobbin](https://mobbin.com/screens/4f303c97-3a12-49ee-83ab-97254c04e17b)). Speechify does the same with red/green rows and a sad-target illustration ([Mobbin](https://mobbin.com/screens/b21ae278-14b8-4b81-b500-75189e6d23dc)).
- **Mascot delivers the "why".** Brainly's mascot pops up with "Ooops! Why? Passive transport always occurs down the concentration gradient..." ([Mobbin](https://mobbin.com/screens/c06406ea-5d58-452e-8aa0-859d93219090)). Brilliant's Koji explains and then asks "Does that make sense? [Yes, makes sense] [Not really]" ([Mobbin](https://mobbin.com/screens/fa56eca9-cb28-4ed8-bc7b-115d4531df04)). That "Not really" is a cheap, strong pattern: it opens a deeper explanation or a follow-up question.
- **Revise, don't just mark.** Brilliant's problems "respond while the learner's reasoning is still fresh, giving them a chance to revise rather than simply marking the attempt wrong" ([Brilliant](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/)). For Cortex: on a wrong MCQ, show the "why not" for the chosen option first and allow **one retry** before revealing the answer. That keeps generation alive (section 2).
- **Combo counter.** Duolingo Math shows "COMBO x4" above the progress bar ([Mobbin](https://mobbin.com/screens/ef9d6413-1e91-4f2c-8317-25d63ceee5bf)). Duolingo also plays mid-lesson interstitial animations after several correct answers in a row ([Duolingo](https://blog.duolingo.com/building-character/)).

### 3.2 Haptics & sound

- Apple's guidance: use haptics sparingly, map them to meaning (success, warning and error notification haptics), and never make them the only signal. Pair them with color, text and sound so the message survives silent mode and VoiceOver ([Apple HIG Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback.md), [UINotificationFeedbackGenerator summary](https://medium.com/naukri-engineering/implement-haptic-feedback-using-feedback-generators-in-ios-app-d7f6462a59a9)).
- Duolingo's correct-answer chime works as a conditioned reward cue. The wrong-answer tone is a short descending sound (third-party analysis: [Cognitive Load](https://thecognitiveload.substack.com/p/a-40-day-duolingo-streak), [Out of Scope](https://out-of-scope-product.beehiiv.com/p/duolingo-has-it-venmo-has-it-even-slack-has-it-your-product-doesn-t)). Duolingo's motion team gives every animation a "beat" even without sound ([60fps](https://60fpsdesign.substack.com/p/fun-in-every-frame) and related coverage).
- **Cortex V0:** success = `.success` notification haptic plus a short rising chime (<400 ms). Wrong = a single light impact (not `.error`, which feels like a punishment) plus a soft neutral "thunk". Lesson complete = a stronger pattern plus a longer sting. Sounds on by default with a toggle in the lesson header, and silent mode is respected.

### 3.3 Streaks, XP, hearts: what works and what backfires

| Mechanic | Evidence | Cortex V0 call |
|---|---|---|
| **Streak** | Learners who reach a 7-day streak are 3.6x more likely to complete their course. A streak animation raised 7-day retention of new learners by +1.7% ([Duolingo](https://blog.duolingo.com/how-duolingo-streak-builds-habit)). Duolingo itself says losing a streak can be demotivating and fear of losing one can stop people starting. | **Yes**, with slack built in. |
| **Streak freeze / slack** | Letting learners equip 2 freezes *raised* DAU by +0.38%. Grounded in research that "slack" beats rigid rules ([Duolingo](https://blog.duolingo.com/how-duolingo-streak-builds-habit)). Lowering the daily bar to "any one lesson" gave 40%+ more 7-day streaks ([Mobbin streak study](https://mobbin.com/blog/streaks-are-about-losing-a-study-of-859-streak-designs)). | **Yes.** Daily goal = 1 lesson *or* 1 review. 1 to 2 free freezes. |
| **Hearts (lose lives on mistakes)** | Duolingo replaced them with Energy because beginners were 2x more likely to run out mid-lesson and "mistakes are a natural part of learning" ([Duolingo](https://blog.duolingo.com/duolingo-energy/)). Energy then drew its own backlash for draining even on perfect lessons ([Android Authority](https://www.androidauthority.com/quitting-duolingo-energy-system-3599842/)). | **No.** Never block learning on mistakes. If you need a monetization gate, gate *lesson count*, not errors. |
| **XP / combo** | Cheap, legible progress signal. Brilliant uses a "lose your progress and XP" quit confirm ([Mobbin](https://mobbin.com/screens/d7d7f00a-f59b-4bf2-acfb-8cb35b147154)). | **Yes:** XP per lesson plus a combo bonus. No leaderboards in V0. |
| **Celebration animations** | The Duolingo S-1 describes end-of-lesson celebrations "tuned to maximize delight" ([Substack quoting S-1](https://jax.substack.com/p/changing-behaviour)). | One end-of-lesson celebration (mascot plus confetti, <2 s, skippable). A bigger one at streak milestones (3, 7, 30). |

### 3.4 Annoying or manipulative (avoid)

- **Guilt-trip pushes** ("You made Duo sad", "How do you say quitter?" sent to a 9-year-old). Widely criticized, including for upsetting children ([UniversityXP](https://www.universityxp.com/news/2025/7/25/we-havent-seen-you-in-a-while-duolingos-passive-aggressive-strategy-for-keeping-users-hooked), [Design Buddy](https://designbuddy.substack.com/p/is-duolingo-unethical)). Duolingo admits the persona grew out of a meme ([Business Insider](https://businessinsider.nl/duolingo-is-mean-whiny-and-annoying-gen-z-loves-it/)).
- **Late-night countdowns** ("13 minutes before your streak resets") turn a habit into loss-defense ([Mobbin streak study](https://mobbin.com/blog/streaks-are-about-losing-a-study-of-859-streak-designs)).
- **Penalizing mistakes** (hearts), **paywalling the mistakes review**, **forced ads after a wrong answer**.
- **Over-long celebrations** that block Continue. Over-frequent haptics (Apple: overuse "dilutes" meaning).
- **Rewarding the streak over the learning.** Critics argue Duolingo should "reward the habit and not the streak" ([Medium](https://medium.com/letter-from-taro/a-losing-streak-c72eeedf5c93)).
- Note: Duolingo's notifications use a bandit algorithm that rotates templates and demotes recently seen ones because of a "novelty effect" ([Duolingo blog](https://blog.duolingo.com/hi-its-duo-the-ai-behind-the-meme/), [KDD paper](https://research.duolingo.com/papers/yancey.kdd20.pdf)). Takeaway: variety matters more than intensity. Write 20+ friendly templates and rotate them; don't escalate guilt.

---

## 4. Mascot

### 4.1 How others use characters

| App | Character | Role(s) | Notable detail |
|---|---|---|---|
| **Duolingo** | Duo + 10 "World Characters" (Lily, Eddy, ...) | Guide, cheerleader, tutor voice (characters speak sentences), notification persona | Characters react with a unique animation on correct answers; idle behavior (nods, blinks); final state reacts to right or wrong ([Duolingo visemes](https://blog.duolingo.com/world-character-visemes)). Rive state machine. Lily: 8 head × 8 body idle animations, 64+ combinations; "if there's any processing delay, it looks like she's pondering what you said" ([Rive](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life)). Built from simple geometric shapes, big eyes ([Duolingo](https://blog.duolingo.com/building-character/)). |
| **Brilliant** | Koji (green "sentient particle") | AI tutor, guide | Nearly cut for seeming unserious. Kept because students wanted a face, and "they try harder when they feel like someone is looking". Speaks first on each page, noticing what changed. Can highlight or annotate the interactive. Steps back during tests ([Brilliant](https://blog.brilliant.org/a-world-class-tutor-in-every-home/)). Brilliant moved from Lottie to Rive for state-driven streak and path animations ([Rive](https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations)). |
| **Headspace** | No official mascot. Rounded, curved characters showing a range of moods. Ebb = "a friendly blob" AI companion | Emotional mirror, calm guide | No sharp edges, for warmth ([Advertising Week](https://advertisingweek.com/aw360/news/unlocking-headspaces-inner-brand-character/19717/), [Figma blog on Ebb](https://www.figma.com/blog/headspace-ebb-ai-companion/)). Two-person core illustration team ([Blush](https://blush.design/blog/post/headspace-mindfulness-app)). |
| **Finch** | Your pet bird | Emotional mirror / companion (you care for yourself, so the bird thrives) | The bird gets happier and goes on adventures as you complete self-care goals ([Internet Matters](https://www.internetmatters.org/advice/apps-and-platforms/wellbeing/finch/)). |
| **Khan Academy Kids** | Kodi Bear + 4 friends | Narrator, guide, cheerleader | Celebrates correct, encourages retry on wrong ([Khan Kids](https://khankids.zendesk.com/hc/en-us/articles/360049358751-Learn-more-about-the-characters-inside-Khan-Academy-Kids)). |
| **Habitica** | Your RPG avatar + pets | Progress avatar | Gains XP and gold for tasks, loses HP for failures. The pets split opinion ([App Store](https://apps.apple.com/app/994882113)). |
| **Brainly** | Purple blob | Feedback narrator | "Ooops! Why?" explanation card on wrong answers ([Mobbin](https://mobbin.com/screens/c06406ea-5d58-452e-8aa0-859d93219090)). |
| **Lingokids** | Character-driven stories | Story guide | Not much primary info found ([Pastory comparison](https://pastory.app/articles/lingokids-vs-khan-academy-kids/)). |

**Evidence on agents:** pedagogical agents give a small but significant learning benefit, larger for K-12 than adults ([Schroeder et al. 2013, as summarized](https://educationaltechnologyjournal.springeropen.com/articles/10.1186/s41239-021-00256-z)). Agents that *gesture or point* improved retention and near transfer, and all the gestures studied were deictic (pointing) ([Davis 2018 via same source](https://educationaltechnologyjournal.springeropen.com/articles/10.1186/s41239-021-00256-z)). How likable the agent is adds little to learning by itself ([Davis, Park & Vincent 2021](https://informahealthcare.com/doi/full/10.1080/15391523.2020.1830894)). **So the mascot's job is attention and emotional safety, not entertainment.** Make it point at the diagram.

### 4.2 Roles for the Cortex mascot (priority order)

1. **Guide / pointer:** points at the relevant part of the visual (the deictic gesture effect). Introduces the predict question.
2. **Emotional safety on errors:** a calm "hmm, let's see why" instead of judgment. Lowers the fear of mistakes, which Duolingo's art team names as a core hurdle ([Duolingo shape language](https://blog.duolingo.com/shape-language-duolingos-art-style/)).
3. **Cheerleader:** small on correct, big only at lesson end and milestones.
4. **Thinking indicator:** covers LLM latency ("pondering"), the Lily trick ([Rive](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life)). Very relevant for an AI-generated app.
5. **Notification persona (friendly, never guilt).** Later: **tutor voice** (Koji-style "Not really? Let me try another way").

### 4.3 Mascot interaction spec (states × triggers)

Design constraint: one character, built from simple geometric shapes (like Duo) so poses are cheap to draw and render well at 48 to 120pt. Rounded forms (Headspace). Big readable eyes, because the eyes carry most of the emotion.

| State | Trigger(s) | Visual / motion | Copy pattern (examples) | Duration | Haptic / sound | V0? |
|---|---|---|---|---|---|---|
| `idle` | Default while reading | Slow breathe, random blink every 3–6 s | — | loop | — | V0 (blink can be V1) |
| `greet` | Lesson start; app open after >1 day away | Wave | "Hey! Today: how vaccines train your immune system." | 1.2 s | — | V0 |
| `curious` | Predict-then-reveal question shown | Head tilt, "?" | "Quick guess before we start, no wrong answers." | hold | — | V0 |
| `thinking` | LLM generation or grading latency >400 ms | Eyes look up, dots | "Thinking..." | loop until done | — | V0 |
| `pointing` | Hotspot question; hint; explanation that references a diagram part | Arm or eye-line toward `targetId` (screen coords) | "Look at this part." | hold | — | V1 (V0: arrow overlay instead) |
| `watching` | Learner is answering (selection made, not checked) | Leans in slightly | — | hold | — | V1 |
| `happy` | Correct answer | Small hop | "Nice." / "Exactly." (rotate 10+ variants) | 0.6 s | success haptic + chime | V0 |
| `proud` | Combo ≥3 correct in a row (cap: once per lesson) | Bigger jump, sparkle | "3 in a row!" | 1.0 s | stronger chime | V0 |
| `surprised-kind` | Wrong answer that was rated "Sure" (hypercorrection moment) | Eyebrows up, not sad | "Ooh, this one surprises a lot of people. Here's why..." | 0.8 s → `explaining` | light tap | V0 |
| `encouraging` | Wrong answer (normal) | Gentle nod, open palm | "Close. Here's the catch: ..." / "Try once more?" | 0.8 s → `explaining` | light tap + soft tone | V0 |
| `explaining` | Explanation sheet open; "Not really" tapped | Talking loop (no lip sync in V0) | The per-distractor "why not" text | hold | — | V0 (static talking pose) |
| `celebrate` | Lesson complete | Full dance + confetti | "Lesson done! You got 6/7. That one about X comes back tomorrow." | 1.5–2 s, skippable | success pattern + sting | V0 |
| `milestone` | Streak 3 / 7 / 30, course complete | Special animation | "7 days. That's a habit forming." | 2 s | sting | V1 (V0 reuse `celebrate`) |
| `sleepy` | Return after a streak break | Yawn, then wave | "Welcome back! Let's pick up where you left off." (never "you abandoned me") | 1.2 s | — | V0 |
| `oops-system` | Generation failed / offline | Shrug | "My notes got scrambled. Trying again." | hold | — | V0 |

**Never states:** crying, angry, disappointed-at-you, fake-dying. No mascot copy that assigns blame ("you forgot me", "quitter").

**Notification persona rules:**
- Max 1 reminder per day, at the learner's usual time. Stop after 3 ignored days, then send a weekly digest.
- Rotate 20+ templates (novelty effect, [Duolingo](https://blog.duolingo.com/hi-its-duo-the-ai-behind-the-meme/)).
- Lead with curiosity tied to *their* topic ("Why do cats always land on their feet? Your 2-min review is ready"), not with guilt.
- No countdown timers. No push notifications after 9pm local time.

### 4.4 Animation implementation

- **Rive** is the standard for state-driven mascots. Duolingo picked it for its State Machine, small files, and clean animator-to-engineer handoff ([Duolingo](https://blog.duolingo.com/world-character-visemes)). Brilliant switched from Lottie because "Lottie's interactivity didn't allow for custom transitions between states without additional engineering effort" ([Rive/Brilliant](https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations)). Vendor-reported size wins (e.g. a 15x reduction for Duolingo) are unverified; benchmark your own files ([Callstack](https://callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation)).
- **Lottie** is fine for one-shot effects (confetti, celebration) that don't need states ([LottieFiles](https://lottiefiles.com/blog/lottie-animations/lottiefiles-or-rive)).
- **V0 (2 weeks): skip Rive.** Ship about 8 static SVG poses (`idle, greet, curious, thinking, happy, encouraging, celebrate, sleepy`) in the same visual language as the diagrams. Animate with spring scale and translate (Reanimated / SwiftUI springs), plus a two-frame blink. Use one Lottie confetti for `celebrate`.
- **V1:** one Rive file with inputs:
  - `state` (number enum matching the table)
  - triggers `onCorrect`, `onWrong`, `onCombo`, `onComplete`
  - boolean `isTalking`
  - numbers `lookX`/`lookY` for pointing at a diagram target

  Use modular head and body idle variations (the Lily approach) so the mascot doesn't loop visibly.
- **Lip sync:** not needed. Duolingo built it for TTS characters ([visemes](https://blog.duolingo.com/world-character-visemes)). Cortex should use the `isTalking` loop only, and only if audio narration ships.

### 4.5 Risks

- **Cringe / "not for serious learning".** Brilliant had exactly this worry ([Brilliant](https://blog.brilliant.org/a-world-class-tutor-in-every-home/)). Mitigations: an adult-friendly design (not babyish), sparse copy, and a setting for "fewer mascot reactions".
- **Repetition fatigue.** Rotate copy variants. Cap `proud` to once per lesson.
- **Guilt notifications.** Covered above. Children are especially sensitive ([UniversityXP](https://www.universityxp.com/news/2025/7/25/we-havent-seen-you-in-a-while-duolingos-passive-aggressive-strategy-for-keeping-users-hooked)).
- **Attention theft.** Under the coherence principle ([Mayer](https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-research-based-principles-for-designing-multimedia-instruction-mayer.pdf)), the mascot must never sit on top of the diagram or animate while the learner reads the explanation. It lives in a fixed slot (top-left of the feedback sheet).

---

## 5. LLM-generated vector visuals

### 5.1 What's known

- **VGBench (2024):** LLMs understand and generate TikZ and Graphviz much better than SVG, because those formats have "higher-level semantics" and SVG is "composed of low-level geometry primitives". Chain-of-thought and in-context examples help SVG significantly ([arXiv 2407.10972](https://arxiv.org/abs/2407.10972v1)).
- **SVGenius (2025, 22 models):** "all models exhibit systematic performance degradation with increasing complexity". Proprietary models lead. Reasoning-enhanced models do better. Style transfer (making output match a given style) is the hardest task for every model ([arXiv 2506.03139](https://arxiv.org/html/2506.03139v1), [project page](https://zju-real.github.io/SVGenius)). **This matters directly for a design guide: getting an LLM to follow a visual style in raw SVG is the weakest capability measured.**
- **StructEval:** LLMs "still struggle to correctly generate" SVG and Mermaid, among other formats ([arXiv 2505.20139](https://arxiv.org/pdf/2505.20139)).
- **Mermaid** is more checkable, but one bad character breaks the whole render, and it needs a headless browser to lay out. A university project raised Mermaid validity from about 70% to nearly 100% using a render-validate-repair loop ([HU Berlin experiment](https://llm-enabled-development-41d6d8.pages.cms.hu-berlin.de/en/experiments/diagram/diagram-long)). Practitioners report that raw SVG "fails silently": you get a picture, just a bad one, with overlapping boxes and labels spilling out ([DEV](https://dev.to/msteja/why-ai-agents-cant-draw-svg-and-what-to-do-instead-1ci)).
- **What works better in practice: separate meaning from layout.** The LLM emits typed JSON (nodes, edges, labels). A deterministic engine (ELK, d3-hierarchy, dagre) does the layout and draws the SVG. A schema validator returns errors the model can fix in one retry. One single-project report: 94% first-shot render success and 88% repaired on the first retry ([Diagram-Engine](https://vuihoc-web.pages.dev/blog/diagram-engine-text-to-diagram-for-ai-agents/), [Glyphic](https://dev.to/msteja/why-ai-agents-cant-draw-svg-and-what-to-do-instead-1ci)). Napkin AI's product follows the same idea: text in, a choice of generated layouts, styling from a constrained set ([Napkin review](https://edrawmax.wondershare.com/diagram-tools/napkin-ai-review.html)).
- Duolingo's own reason for a minimal art style was speed of production plus clarity: "If visuals are unclear or misinterpreted, learners might answer incorrectly... Our failure becomes our learners' failure" ([Duolingo shape language](https://blog.duolingo.com/shape-language-duolingos-art-style/)).

### 5.2 Options compared

| Approach | Reliability | Style consistency | Interactivity (hotspots, ordering) | Speed / cost | Verdict |
|---|---|---|---|---|---|
| A. LLM writes raw SVG | Low–medium; worse as complexity grows | Low (style transfer is the weakest skill) | Hard (IDs are unreliable; hit areas are guesses) | Slow (many tokens) | Escape hatch only |
| B. LLM writes Mermaid / Graphviz | Medium; needs a validate-repair loop | Medium (themeable) | Medium (node IDs exist) | Needs a layout runtime; Mermaid wants a browser | OK for flowcharts only |
| C. **LLM fills a JSON spec for a fixed template library** (our renderer) | **High** (schema-validated) | **High** (tokens are in the renderer, not the prompt) | **High** (every element has a semantic `id`; hotspots come free) | Fast, few tokens, renders on device | **Recommended core** |
| D. Icon set by name (Lucide/Phosphor) inside C | High | High | n/a | Fast | **Recommended** for "illustration" needs |
| E. Pre-made illustration library (human-drawn) | Perfect | Perfect | Low | Costly to grow | Later: mascot poses and hero images per domain |

### 5.3 Recommendation: "Visual Spec" plus template renderer, with a guarded freeform fallback

1. The LLM outputs `visual` objects (schema in section 6). Each one picks a `template` from an allow-list and fills in data. **No coordinates in the common case.** The app renders the template with react-native-svg (or Skia) using our design tokens. Layout comes from the template's own rules: fixed slots, or dagre/ELK for graphs.
2. **V0 template library (about 10, covering most "learn anything" lessons):**
   - `flow` (steps/process, linear or branching, ≤7 nodes)
   - `cycle` (3–6 stages in a loop: water cycle, Krebs, feedback loops)
   - `timeline` (≤8 events)
   - `comparison` (2–3 columns × ≤5 rows, or a Venn-2)
   - `hierarchy` (tree ≤3 levels, ≤12 nodes: taxonomy, org chart)
   - `labeled-parts` (a central shape built from primitives or an icon, with ≤6 callout labels: anatomy of X)
   - `quantity` (bar/compare ≤6 bars, or a simple number line / scale)
   - `cause-effect` (A → B → C chain, with optional ± signs)
   - `concept-map` (≤8 nodes, labeled edges)
   - `scene` (2–4 icons arranged with simple relations: "the sun heats the ocean")
3. **Icons:** one open-source outline set referenced by name, for example [Lucide](https://lucide.dev) (ISC license) or [Phosphor](https://phosphoricons.com) (MIT). Ship a curated allow-list of about 300 names in the prompt (or a retrieval step) so the model can't invent icon names.
4. **Freeform SVG fallback** (for `labeled-parts` where no icon fits, e.g. "cross-section of a leaf"):
   - Allowed only with `template: "freeform"`.
   - Sanitize: allow-list of tags (`svg, g, path, rect, circle, ellipse, line, polyline, polygon, text`), no `style`/`script`/`foreignObject`/`image`/external refs, `viewBox="0 0 320 240"`, colors must be palette tokens (fill references are swapped), max about 40 elements, max 4 KB.
   - Render-check on the server (resvg) and run a cheap vision-model "does this look like X? are labels overlapping?" check. If it fails, fall back to `labeled-parts` with an icon, or no visual.
   - Track the freeform rate as a quality KPI.
5. **Make visuals answerable.** Every node, part and label has a stable `id`, so the questions can reference them:
   - hotspot: `targetId`
   - order: the IDs of the flow steps
   - spot-the-mistake: the ID of the mislabeled node
   - label-the-diagram: hide `label` on chosen IDs

   This is how "make the questions as interactive as possible" falls out of the visual system almost for free.

### 5.4 Visual design guide outline (to hand to Ankit; goes into the system prompt and the renderer)

Most rules below live in the **renderer**. The prompt only needs the parts that affect *content choices* (marked ⟶P).

1. **Purpose & principles** ⟶P
   - Every visual must teach one idea. If removing it wouldn't hurt understanding, don't generate it (coherence, [Mayer](https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-research-based-principles-for-designing-multimedia-instruction-mayer.pdf)).
   - Labels go *on or next to* the thing they name, never in a legend (spatial contiguity).
   - Exactly one thing is highlighted: the concept of this chunk (signaling).
2. **Canvas & grid**
   - Fixed artboard 320×240 (4:3) for inline visuals, 320×400 for tall ones (timelines, hierarchies).
   - 8-pt grid, 16-pt outer padding, minimum 12 pt between elements.
   - Mobile-only: assume 343pt display width.
3. **Palette (semantic tokens, not hexes, in the prompt)** ⟶P
   - `ink` (strokes and text), `paper` (bg), `muted` (secondary shapes), `accent` (the ONE highlighted element), `accent-soft` (fills), `positive`, `negative` (only for ± / correct / incorrect), plus 3 categorical colors `cat-1..3` for comparisons.
   - Max 3 non-neutral colors per visual. Dark-mode variants are defined in the renderer.
   - Contrast ≥4.5:1 for text, ≥3:1 for meaningful strokes.
4. **Stroke & shape**
   - One stroke weight (2 pt), plus 3 pt for the accent element. Round caps and joins.
   - Corner radius 8 pt on boxes. Circles for states and stages, rounded rects for steps, pills for labels.
   - Flat fills, no gradients, shadows or textures. Arrows use one arrowhead style (open chevron) and are straight or single-curve.
5. **Typography** ⟶P
   - One family (the app's UI font), 2 sizes (13 pt labels, 11 pt captions), sentence case.
   - **Labels ≤3 words / ≤20 characters**, captions ≤60 characters, max 8 text items per visual, no paragraphs inside visuals.
   - No text rotated more than 0°. Numbers with units.
6. **Allowed diagram types** ⟶P: the template list in 5.3, with a one-line "when to use" for each and its max element counts. Anything else maps to the nearest template or to "no visual".
7. **Icons** ⟶P: from the allow-list only. Outline style, 24 pt base, scaled 32–64 pt. One icon per concept. Don't use icons as decoration.
8. **Interaction hooks**
   - Every element has a semantic `id` (kebab-case, e.g. `left-ventricle`).
   - Hotspot targets ≥44 pt (the renderer pads hit areas).
   - Elements a question will hide or ask about must be listed in `interactiveIds`.
9. **Accessibility** ⟶P
   - Every visual has `alt` (one sentence describing what it shows and why).
   - Don't encode meaning by color alone: add a label or icon.
   - Respect reduced motion. Diagram entry animation is a 200 ms fade or stagger only.
10. **Do / Don't** (with good and bad examples rendered from real specs)
    - Do:
      - Simplify to the 3 to 7 parts that matter.
      - Show process direction left to right or top to bottom.
      - Highlight the one thing being taught.
      - Use real relative sizes only in `quantity`.
    - Don't:
      - Draw realistic scenes, people with faces (use icons), or 3D or isometric views.
      - Show more than 7 nodes in a flow.
      - Put labels in a legend, use decorative backgrounds, or emoji.
      - Use text as a visual ("a box containing a paragraph"), or include anything that contradicts the lesson text.
11. **Validation checklist** (automated): schema valid, template in the allow-list, counts within limits, label lengths, icon names exist, all IDs referenced by questions exist, contrast check, and (freeform only) sanitizer plus render plus vision check.
12. **Prompt snippet** for Ankit (excerpt):
    > You produce `visual` objects for a mobile learning app. Choose the single best `template` from: flow, cycle, timeline, comparison, hierarchy, labeled-parts, quantity, cause-effect, concept-map, scene. Never output coordinates or colors; use roles (`emphasis: "accent"`). Labels ≤3 words. Max 7 nodes. Give every element a kebab-case `id`. Mark the one element this chunk teaches with `emphasis: "accent"`. If no template fits, return `null`. Do not invent a visual for decoration.

---

## 6. JSON schema sketch for generated questions (and the visuals they use)

TypeScript-style for readability. Convert to JSON Schema / Zod for structured output and validation. Use **structured outputs / tool-calling with a strict schema**, plus a second "verifier" LLM pass that answers each question blind and flags ambiguity.

```ts
type Lesson = {
  id: string;
  topic: string;
  conceptIds: string[];             // stable concept keys for spaced repetition
  chunks: Chunk[];                  // 2–4
  predict: Question;                // the hook, always role:"predict"
  wrapUp: Question[];               // 3–4, mixed formats
};

type Chunk = {
  id: string;
  text: string;                     // ≤ 90 words
  visual?: Visual | null;
  check?: Question;                 // 0–1 per chunk
};

/* ---------- Visuals ---------- */
type Visual =
  | { template: "flow" | "cycle" | "timeline" | "cause-effect";
      alt: string;
      nodes: { id: string; label: string; icon?: IconName; emphasis?: "accent" | "muted" }[];
      edges?: { from: string; to: string; label?: string; sign?: "+" | "-" }[];
      direction?: "lr" | "tb";
      interactiveIds?: string[]; }
  | { template: "labeled-parts";
      alt: string;
      base: { icon: IconName } | { freeformSvg: string };   // freeform is sanitized + render-checked
      parts: { id: string; label: string; anchor: "top"|"right"|"bottom"|"left"|"center"; emphasis?: "accent" }[];
      interactiveIds?: string[]; }
  | { template: "comparison"; alt: string;
      columns: { id: string; title: string; icon?: IconName }[];
      rows: { id: string; label: string; cells: string[] }[]; }
  | { template: "quantity"; alt: string;
      kind: "bars" | "number-line";
      unit?: string;
      items: { id: string; label: string; value: number; emphasis?: "accent" }[]; }
  | { template: "hierarchy" | "concept-map"; alt: string;
      nodes: { id: string; label: string; parentId?: string; icon?: IconName }[];
      edges?: { from: string; to: string; label?: string }[]; }
  | { template: "scene"; alt: string;
      items: { id: string; icon: IconName; label?: string }[];
      relations: { from: string; to: string; verb: string }[]; };

/* ---------- Questions ---------- */
type QuestionBase = {
  id: string;
  role: "predict" | "check" | "wrapup" | "review";
  conceptIds: string[];
  skill: "recall" | "understand" | "apply";       // what it tests
  difficulty: 1 | 2 | 3;
  stem: string;                                   // ≤ 120 chars
  visualRef?: { chunkId: string } | { inline: Visual };
  askConfidence?: boolean;                        // show Sure / Think so / Guessing
  hint?: string;                                  // shown before reveal, on 1st wrong
  explanation: string;                            // general "why", shown on correct AND wrong (≤ 2 sentences)
  sourceSpan?: string;                            // quote from chunk text that supports the answer (for verifier)
};

type Option = {
  id: string;
  text: string;                                   // ≤ 60 chars
  correct: boolean;
  whyNot?: string;                                // REQUIRED when correct=false: names the misconception
};

type Question = QuestionBase & (
  | { type: "mcq";        options: Option[]; /* 3–4, exactly 1 correct */ }
  | { type: "multi";      options: Option[]; minCorrect: 2 }
  | { type: "true_false"; statement: string; answer: boolean; whyNot: string }
  | { type: "fill_blank"; template: string;       // "Plants make food by {{b1}}."
                          blanks: { id: "b1"; answer: string; accept?: string[] }[];
                          wordBank: string[] }    // answers + 2–3 distractors
  | { type: "order";      items: { id: string; text: string }[];   // shuffled by client
                          correctOrder: string[];                   // item ids
                          bindToVisual?: boolean }                  // reorder the flow's nodes
  | { type: "match";      pairs: { leftId: string; left: string; rightId: string; right: string }[] } // 3–5
  | { type: "hotspot";    targetIds: string[];    // ids inside the referenced visual
                          distractorWhyNot?: Record<string, string> }  // tapped wrong id -> explanation
  | { type: "spot_mistake";
                          artifact: { kind: "steps" | "visual"; lines?: string[] };
                          mistakeId: string;      // line index or visual element id
                          correction: string }
  | { type: "slider";     min: number; max: number; step: number; unit?: string;
                          answer: number; tolerance: number }                 // later
  | { type: "flashcard";  front: string; back: string }                      // review only
  | { type: "free_text";  rubric: { id: string; idea: string }[];            // later, LLM-graded
                          minIdeas: number; exemplar: string }
);

/* ---------- Learner response (client -> server, feeds FSRS) ---------- */
type Attempt = {
  questionId: string;
  correct: boolean;
  attemptNumber: 1 | 2;
  confidence?: "sure" | "think" | "guess";
  latencyMs: number;
  chosen: unknown;                 // option id / order / tapped id
};
```

**Generation-time validators** (cheap, deterministic; reject and regenerate on failure):
- MCQ has exactly one `correct`. Every wrong option has `whyNot`. Option lengths are within ±40% of each other. No "all/none of the above".
- `order.correctOrder` is a permutation of the item IDs. `match` has unique sides.
- Every `targetIds` / `mistakeId` / `bindToVisual` ID exists in the referenced visual.
- `fill_blank` answers are in `wordBank`. Each blank has exactly one valid tile.
- Lesson mix: no more than 2 consecutive items of the same `type`. At least 1 item with `skill` ≠ `recall`. `predict.role === "predict"`.
- Verifier LLM answers each item without seeing the key. If it disagrees, or flags "ambiguous", regenerate the item.

---

## 7. V0 vs later (summary)

| Area | V0 (end Nov 2026) | V1 | Later |
|---|---|---|---|
| Question types | MCQ, multi, T/F, fill-blank (bank), order (tap), match, hotspot, predict-then-reveal, spot-the-mistake, confidence modifier, flashcard (review) | Slider/estimate, categorize, label-the-diagram, typed short answer | Free-text/voice LLM-graded, parameterized simulations |
| Flow | Predict → chunks with checks → mixed wrap-up → mistakes review | FSRS daily review across lessons; interleaving from past lessons | Adaptive difficulty per concept |
| Feedback | Per-distractor "why not", 1 retry, "Not really?" deeper explanation | Mascot points at diagram part | AI tutor chat in context (Koji-style) |
| Delight | Success/wrong haptics + sounds, combo, XP, end celebration, streak with freezes | Milestones, widget | Social (opt-in) |
| Mascot | ~8 static SVG poses + springs; friendly notification copy | Rive state machine (inputs above), pointing | Voice, personality per subject |
| Visuals | 10 JSON templates + icon allow-list + sanitized freeform fallback | Vision-model QA, more templates | Human-drawn domain illustration packs |

---

## 8. Sources

**Products and design**
- Duolingo: [Building character](https://blog.duolingo.com/building-character/) · [Shape language](https://blog.duolingo.com/shape-language-duolingos-art-style/) · [Visemes / Rive](https://blog.duolingo.com/world-character-visemes) · [Energy](https://blog.duolingo.com/duolingo-energy/) · [Streak research](https://blog.duolingo.com/how-duolingo-streak-builds-habit) · [Notifications AI](https://blog.duolingo.com/hi-its-duo-the-ai-behind-the-meme/) · [KDD paper](https://research.duolingo.com/papers/yancey.kdd20.pdf) · [Exercise wiki](https://duolingo.fandom.com/wiki/Exercise) · [Practice](https://blog.duolingo.com/ways-to-practice-in-duolingo) · [Speaking](https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-speaking-skills)
- Rive: [Duolingo Lily](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life) · [Brilliant](https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations) · [Callstack Lottie vs Rive](https://callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation) · [LottieFiles or Rive](https://lottiefiles.com/blog/lottie-animations/lottiefiles-or-rive)
- Brilliant: [How Brilliant teaches](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/) · [Koji launch](https://blog.brilliant.org/a-world-class-tutor-in-every-home/)
- Others: [Quizlet help](https://help.quizlet.com/hc/articles/360030841732) · [Kahoot types](https://support.kahoot.com/hc/articles/115002308428) · [Elevate](https://elevateapp.com/brain-training-games) · [Nibble format](https://nibble-app.com/blog/nibble-interactive-learning-format) · [Imprint App Store](https://apps.apple.com/app/id1482780647) · [Oboe TechRadar](https://www.techradar.com/ai-platforms-assistants/gemini/oboe-just-launched-its-an-ai-powered-platform-that-helps-you-learn-anything) · [Wondering](https://chatgate.ai/post/wondering) · [Synthesis Tutor](https://www.neilsquire.ca/synthesis-tutor-an-intelligent-math-tutoring-app/) · [Khan Kids characters](https://khankids.zendesk.com/hc/en-us/articles/360049358751-Learn-more-about-the-characters-inside-Khan-Academy-Kids) · [Finch](https://www.internetmatters.org/advice/apps-and-platforms/wellbeing/finch/) · [Headspace (Ad Week)](https://advertisingweek.com/aw360/news/unlocking-headspaces-inner-brand-character/19717/) · [Headspace Ebb (Figma)](https://www.figma.com/blog/headspace-ebb-ai-companion/) · [Habitica](https://apps.apple.com/app/994882113) · [60fps Duolingo](https://60fpsdesign.substack.com/p/fun-in-every-frame)
- Mobbin screens: [Duolingo math combo](https://mobbin.com/screens/ef9d6413-1e91-4f2c-8317-25d63ceee5bf) · [Duolingo word bank](https://mobbin.com/screens/ed029f55-5e77-4189-984d-8649255c9d88) · [Brilliant tap-blocks](https://mobbin.com/screens/f332bf9f-b059-4b2d-89aa-c9226ace3557) · [Brilliant solved](https://mobbin.com/screens/e022666a-34f8-4241-8d48-9613e578b033) · [Brilliant Koji explain](https://mobbin.com/screens/fa56eca9-cb28-4ed8-bc7b-115d4531df04) · [Brilliant quit confirm](https://mobbin.com/screens/d7d7f00a-f59b-4bf2-acfb-8cb35b147154) · [Quizlet wrong](https://mobbin.com/screens/4f303c97-3a12-49ee-83ab-97254c04e17b) · [Brainly mascot wrong](https://mobbin.com/screens/c06406ea-5d58-452e-8aa0-859d93219090) · [Speechify wrong](https://mobbin.com/screens/b21ae278-14b8-4b81-b500-75189e6d23dc) · [Speak wrong](https://mobbin.com/screens/20e92afb-d1b9-47ed-8ef8-d2431ba3d88b) · [Vocabulary wrong](https://mobbin.com/screens/a3538d35-c422-40ed-b571-121b4b16a4fb)
- Streaks and ethics: [Mobbin streak study](https://mobbin.com/blog/streaks-are-about-losing-a-study-of-859-streak-designs) · [UniversityXP](https://www.universityxp.com/news/2025/7/25/we-havent-seen-you-in-a-while-duolingos-passive-aggressive-strategy-for-keeping-users-hooked) · [Design Buddy](https://designbuddy.substack.com/p/is-duolingo-unethical) · [Business Insider](https://businessinsider.nl/duolingo-is-mean-whiny-and-annoying-gen-z-loves-it/) · [Android Authority on Energy](https://www.androidauthority.com/quitting-duolingo-energy-system-3599842/) · [A Losing Streak](https://medium.com/letter-from-taro/a-losing-streak-c72eeedf5c93)
- Platform guidance: [Apple HIG Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback.md) · [Apple HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) · [WCAG 2.5.7 Dragging](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)

**Learning science**
- [Dunlosky et al. 2013 (APS)](https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html) · [Adesope 2017 via Frontiers review](https://www.frontiersin.org/articles/10.3389/feduc.2019.00005) · [Learning Scientists on Adesope](https://www.learningscientists.org/blog/2017/2/9-1) · [Cepeda 2008](https://www.evullab.org/pdf/CepedaVulRohrerWixtedPashler-PS-2008.pdf) · [Rohrer & Taylor 2007](https://digitalcommons.usf.edu/psy_facpub/1767/) · [Rohrer 2014](https://link.springer.com/article/10.3758/s13423-014-0588-3) · [Pan & Carpenter 2023](https://springerlink.bibliotecabuap.elogim.com/content/pdf/10.1007/s10648-023-09814-5.pdf) · [BPS on prequestions](https://www.bps.org.uk/research-digest/heres-simple-way-boost-your-learning-videos-prequestion) · [Learning Scientists on prequestions](https://www.learningscientists.org/blog/2017/11/2-1) · [Desirable difficulties review](https://pmc.ncbi.nlm.nih.gov/articles/PMC6099118) · [Van der Kleij 2015](https://people.acer.org/en/publications/effects-of-feedback-in-a-computer-based-learning-environment-on-s/) · [Swart 2019](https://scholarlypublications.universiteitleiden.nl/access/item%3A3185633/view) · [Hypercorrection](https://pmc.ncbi.nlm.nih.gov/articles/PMC4084803) · [Mayer principles](https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-research-based-principles-for-designing-multimedia-instruction-mayer.pdf) · [Pedagogical agents review](https://educationaltechnologyjournal.springeropen.com/articles/10.1186/s41239-021-00256-z) · [Davis, Park & Vincent 2021](https://informahealthcare.com/doi/full/10.1080/15391523.2020.1830894) · [Anki FSRS FAQ](https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm)
- LLM grading: [O'Malley roundup](https://andrewomalley.substack.com/p/weekly-roundup-can-ai-grade-like) · [LLM-as-a-Grader arXiv 2511.10819](https://arxiv.org/html/2511.10819v2)

**Vector generation**
- [VGBench](https://arxiv.org/abs/2407.10972v1) · [SVGenius](https://arxiv.org/html/2506.03139v1) · [SVGenius site](https://zju-real.github.io/SVGenius) · [StarVector](https://arxiv.org/abs/2312.11556) · [StructEval](https://arxiv.org/pdf/2505.20139) · [HU Berlin Mermaid experiment](https://llm-enabled-development-41d6d8.pages.cms.hu-berlin.de/en/experiments/diagram/diagram-long) · [Why agents can't draw SVG / Glyphic](https://dev.to/msteja/why-ai-agents-cant-draw-svg-and-what-to-do-instead-1ci) · [Diagram-Engine](https://vuihoc-web.pages.dev/blog/diagram-engine-text-to-diagram-for-ai-agents/) · [Napkin AI review](https://edrawmax.wondershare.com/diagram-tools/napkin-ai-review.html) · [Lucide](https://lucide.dev) · [Phosphor](https://phosphoricons.com)

**Caveats:**
- Several figures come from vendor or secondary sources: Rive file-size claims, the Mobbin streak-study numbers, and Diagram-Engine's 94%.
- The "6–8 questions per lesson" structure is a heuristic built on the cited principles, not a measured optimum.
- Lingokids mascot details could not be confirmed from primary sources.
