# Cortex AI: competitive landscape and V0 direction

Research date: 2026-11-18. This is the summary. The detail and every source URL are in the three reports:

- [01: Wondering and the AI course competitors](01-wondering-and-ai-course-competitors.md) (includes Oboe, Coursebox, NotebookLM, Brilliant, Matiks)
- [02: Deepstash and learning feeds](02-deepstash-and-learning-feeds.md) (scroll-to-learn apps, feed patterns, evidence on retention)
- [03: Interactive questions, mascot, visuals](03-interactive-questions-mascot-visuals.md) (question formats, lesson skeleton, mascot spec, SVG design guide for Ankit, JSON schema)

---

## 1. The finding that should change the plan

**Oboe quit the "AI course on anything" business on 2026-11-03.** It was the best-funded version of our idea: the Anchor founders, about $20M, a16z. The CEO said the course product was "undifferentiated in the age of LLMs," had "little organic incentive for people to return," and "not many people were motivated to actively learn every day." Oboe is now a puzzle feed and reports "stark" retention gains. ([source](https://x.com/NirZicherman/status/2117683979809890720))

That matches what the team already said: people learn for a while, then go back to ChatGPT. The difference is timing. The team planned the reels feed as a *later* feature. Oboe's numbers say **the reason to come back has to ship in V0**, even in a small form. Course quality alone did not save a team with far more money.

The apps that grew in this space won on the loop, not the content:

| App | Loop | Scale |
|---|---|---|
| Gizmo | lives, streaks, friend challenges | 13M users |
| Matiks | rated 1v1 math duels, daily challenge, streak shields | 300K DAU, $10M from General Catalyst (Oct 2026) |
| Deepstash | daily refreshed idea-card feed (no quizzes) | 330K+ ratings, still growing through paid ads |

## 2. Wondering, checked against the team's notes

| Team's take | What the evidence says |
|---|---|
| Shipped a fast v0 | **True.** Two founders (one ex-NotebookLM), YC S26. iOS launched 2026-03-10; v1.37 by 2026-11-16. |
| Browse/import solves cold start | **True, and it's also their SEO.** Public courses are indexed with a free first lesson, no login needed. |
| Charges upfront | **Not supported.** Free tier: 3 courses a month, 5 lessons a day. Pro is $14.99 a month. An onboarding upsell is possible but unverified. |
| Canvas is bad on mobile | **True for a reason:** their docs describe Canvas as a desktop web feature. |
| Reading lessons and diagrams are half-decent | **Mixed.** The lesson rhythm (scene, question hook, answer, quick check) is good. Reviews complain about broken flowchart connectors and AI images of "people with three arms." They mix in Wikimedia photos. |
| Duolingo look copied badly | **Reviewers disagree.** They praise the "cute aesthetics." The review base is small (97 ratings) and friendly, so this is weak evidence either way. |
| Video and podcast quality is poor | **No outside evidence either way.** The industry bar is low: Google's NotebookLM video overviews get called "dull PowerPoint presentations." |

Traction: about 28K users claimed, 4.68★ from 97 US ratings, iPhone and web only, no Android app.

**Our gap against Wondering:** Android, a phone-native layout (no canvas), better diagrams, and a daily loop. Wondering has friend streaks but nothing like a duel or a revision feed.

## 3. Where each named competitor competes with us

| Competitor | Where it competes | What Cortex should take from it |
|---|---|---|
| **Wondering** | Same product, same audience | Copy the public library + free lesson 1 + personalization chips ("explain using cricket"). Beat it on mobile layout, diagrams and the daily loop. |
| **Oboe** | Course generation (now pivoted to puzzles) | Course quality wasn't the problem; nobody came back. Ship the loop in V0. |
| **Coursebox** | Course generation for businesses; not a consumer rival | About 90% of its sales come from search traffic. Every public Cortex course can become an indexable page. |
| **NotebookLM / Gemini Notebook** | Free audio, video, quizzes and flashcards from your own sources; 30M+ users | Don't compete on the number of formats. Win on zero setup (no uploads), a clear path, and good mobile playback. |
| **Brilliant** | Learning by doing; Koji tutor points *inside* the interactive | Visuals should be tappable, and the mascot/tutor should point at them, not chat in a side panel. Avoid its price and cancellation backlash. |
| **Matiks** | Habit and competition loop | A "duel a friend on today's topic" quiz gives the social pull course apps lack. Don't charge to restore a lost streak or show unskippable paywalls; Matiks is getting 1★ reviews for both right now. |
| **Deepstash** | Owns "scroll to learn instead of doomscrolling" for book ideas | Proves people will open a learning feed daily. Its failures are ours to avoid: no recall, repetition when the topic pool is small, billing anger. |

## 4. The open position

Two gaps came up independently in reports 01 and 02:

1. **Nobody owns the curious one-off question on mobile.** ChatGPT and Gemini own it, and every course app makes you commit to a course first. Nobody has shipped "answer first, with a diagram, then one tap to turn it into a course."
2. **Every learning feed is for discovery. None is for revising what *you* studied.** Deepstash, TikTok STEM, WikiTok and Coursera's Ollie all surface new material. The closest to our idea are Hivemind and ScrollEd, both tiny or new.

Cortex's position, in one line: **ask anything, get a visual answer, turn it into a path, and a feed that quizzes you on what you learned.**

A warning for the reels idea: in matched experiments, chopped short clips *lowered* recall (43% vs 66% for one continuous video). Feeds raise engagement; retrieval and spacing raise retention. So the feed should be **a spaced-recall engine dressed as a feed**: at least 1 in 3 cards asks for an answer, and the "same concept in 10 formats" idea works only if most formats make the user answer something, not just re-read it. Full rules in [02 §6](02-deepstash-and-learning-feeds.md#6-implications-for-the-cortex-reels-feed).

## 5. How we test people (the question from the meeting)

Spread questions through the lesson; don't put one quiz at the end. Full detail in [03 §1](03-interactive-questions-mascot-visuals.md#1-interactive-question-formats).

```
Lesson, 3–5 min
0. Hook: one "guess first" question. Ungraded.
1. Chunk A: short text + visual → 1 check
2. Chunk B → 1 check, Chunk C → 1 check
3. Wrap-up: 3–4 mixed questions (include 1 from an earlier lesson once there's history)
4. Mistakes review: re-ask what they missed, in a different format
5. Celebrate + "your 2-min review is ready tomorrow"
Next 1–6 days: short review of due concepts across all lessons
```

About 6–8 taps of interaction per lesson. That count is a starting value to A/B test; no study gives the right number.

**V0 question formats** (all tap-only, all generated as JSON): multiple choice, select-all, true/false, fill-in-the-blank with word tiles, tap-to-order, match pairs, tap the right part of the diagram, guess-then-reveal, spot the mistake, plus a one-tap "how sure are you?" on some items.

**One rule Ankit's generator must follow:** every wrong option needs its own short "why not" explanation. Right/wrong feedback alone barely helps (effect size about 0.05); feedback that explains reaches about 0.49.

## 6. Visuals: the design guide for Ankit

The meeting settled on vector over images. The research adds one change: **don't let the model draw raw SVG.** Benchmarks show LLMs get worse at SVG as drawings get more complex, and are worst at keeping a consistent style.

Instead:

- The model fills a JSON spec that picks one of about 10 diagram templates: flow, cycle, timeline, comparison, hierarchy, labeled parts, quantity, cause-effect, concept map, scene.
- It names icons from a fixed list (Lucide or Phosphor, about 300 names).
- The app draws everything with our design tokens, so every diagram matches the design guide automatically.
- Raw SVG is allowed only as a cleaned and render-checked fallback, and we track how often it's used.

The side effect matters most for the questions: every element in a diagram gets an ID, so "tap the part," "order the steps" and "spot the mistake" come almost free.

This also splits the work cleanly. Sriram and team design the templates and the guide in Paper; Ankit's prompts only choose a template and fill in data. The 12-part design guide outline, a sample prompt and the full question/visual JSON schema are in [03 §5–6](03-interactive-questions-mascot-visuals.md#54-visual-design-guide-outline-to-hand-to-ankit-goes-into-the-system-prompt-and-the-renderer).

## 7. Mascot

Worth doing, kept restrained. Brilliant nearly removed Koji, then kept him because students kept asking for a character to talk to. The research says the learning gain is small and comes mostly from the character *pointing* at things, so the mascot's jobs are, in order:

1. Point at the part of the diagram that matters.
2. Make mistakes feel safe ("Close. Here's the catch...").
3. Cheer, small on each correct answer, big only at lesson end.
4. Cover AI loading time with a "thinking" pose.
5. Send friendly reminders, never guilt ("you abandoned me").

**V0:** about 8 static SVG poses (idle, greet, curious, thinking, happy, encouraging, celebrate, sleepy) in the same style as the diagrams, animated with simple springs. **V1:** one Rive file driven by app state, with `lookX`/`lookY` so it can look at a diagram part. The full table of 15 states with triggers, copy and haptics is in [03 §4.3](03-interactive-questions-mascot-visuals.md#43-mascot-interaction-spec-states--triggers).

## 8. Recommended V0 scope (ship by end of November)

**In:**

- Topic entry with personalization chips → course path → lessons built on the skeleton in §5
- Text + templated vector diagrams + the V0 question formats
- **A daily 2-minute review** of due concepts across courses, with a streak that allows a freeze day. This is the smallest version of the loop Oboe lacked, and a test run for the reels feed.
- Public course library with a free first lesson (cold start + SEO)
- Static-pose mascot
- A free tier at least as generous as Wondering's (3 courses a month, 5 lessons a day)

**Next (V1):** an "ask anything" box that answers with a visual card and offers "Make this a course" / "Quiz me"; the revision feed (vertical swipe = next concept, sideways = same concept in another format, ending in a question); friend duels on a topic; Rive mascot.

**Not now:** AI video and podcast as headline features, a canvas/mind-map view, hearts that block learning, hard paywalls.

## 9. Still unverified

- Whether Wondering's iPhone onboarding shows a paywall before the first lesson. Someone should install it and screen-record onboarding plus one video and one podcast, for a side-by-side.
- Wondering's funding beyond a reported $125K seed.
- Reddit reception for all apps (access was blocked during research).
- Download and revenue estimates for Wondering, Oboe and NerdSip (none public).
