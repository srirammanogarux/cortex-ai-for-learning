# 01: Wondering and the AI "learn anything" competitors

Research date: 2026-11-18. All App Store numbers are US unless noted. They come from Apple's public lookup API (`https://itunes.apple.com/lookup?id=<id>&country=us`) and the reviews RSS feed (`https://itunes.apple.com/us/rss/customerreviews/page=1/id=<id>/sortby=mostrecent/json`), both pulled on 2026-11-18. Anything I could not confirm is marked **[UNVERIFIED]**. **[secondary]** means only a third-party aggregator or blog backs the claim.

## TL;DR

1. **Wondering is small, fast, and not hard-paywalled.**
   - Two founders (one ex-NotebookLM), in YC S26. iOS launch 2026-03-10, then 37 releases in 8 months.
   - YC launch post: about 12k users and "100+ paying." The site now claims "28,000+ users."
   - US App Store: 4.68★ from only 97 ratings. No Android app.
   - There is a real free tier (3 courses a month, 5 lessons a day), so the team's "charges upfront" belief is not supported by public evidence. A soft paywall during onboarding is still possible but **[UNVERIFIED]**.
2. **The best-funded direct competitor quit the category.** Oboe raised about $20M (a16z), then on 2026-11-03 pivoted from "AI course on anything" to a puzzle feed. The CEO said the course product was "undifferentiated in the age of LLMs," had "little organic incentive for people to return," and "not many people were motivated to actively learn every day." This is the single most important data point for Cortex.
3. **Google ships most of this for free.** Gemini Notebook (NotebookLM was renamed in July 2026) has audio, video and short-video overviews, quizzes and flashcards. Gemini's study notebooks (June 2026) give diagnostic-quiz-driven lessons. Both need you to bring sources or a syllabus first.
4. **The winners in adjacent spaces won on the loop, not the content.**
   - Gizmo: 13M users through lives, streaks and friend challenges.
   - Matiks: 300K DAU through rated 1v1 duels.
   - Imprint: 61k ratings for polished visual cards.
5. **No one owns curiosity capture.** ChatGPT and Gemini own the "first question." Every course app makes you commit to a course first. The open move is to answer like ChatGPT, then offer one tap to turn the answer into a path.

---

## 1. Wondering deep dive

### Basics

| Item | Finding | Source |
|---|---|---|
| What it is | "Duolingo for learning anything." Any topic, link, PDF, photo, YouTube video or podcast becomes a personalized course of about 3-minute lessons with visuals, podcasts, narrated video, practice questions, an AI tutor and FSRS spaced repetition. | [wondering.app](https://wondering.app/), [YC](https://www.ycombinator.com/companies/wondering), [blog](https://wondering.app/blog/turn-any-article-pdf-or-video-into-a-course) |
| Company | Wondering Labs, Inc. San Francisco, 2 employees, founded 2026 (per YC). | [YC](https://www.ycombinator.com/companies/wondering), [App Store](https://apps.apple.com/us/app/wondering-learn-anything/id6754904253) |
| Founders | **Cheng-Wei Hu** (CEO, previously at NotebookLM) and **Angelica Kosasih** (CTO, ex-Meta). They met at Cornell Tech and have been building together for 5+ years. | [YC](https://www.ycombinator.com/companies/wondering) |
| Accelerator | YC Summer 2026 (S26). The YC page data has `batch: S26`, and the X handle is "Wondering (YC S26)." | [YC](https://www.ycombinator.com/companies/wondering), [X](https://x.com/WonderingApp) |
| Funding | Dealroom lists a $125k seed with no date or investors **[secondary; Dealroom is login-walled, figure taken from search snippet]**. Presumably the YC deal. No priced round found. | [Dealroom](https://app.dealroom.co/companies/wondering) |
| Launch timeline | X account created Aug 2025. iOS released **2026-03-10**, announced as "early access, on iOS and web" on 2026-03-11. Show HN for the app on 2026-08-13. Show HN for Canvas on 2026-08-21. Product Hunt launch for "Wondering Canvas" on **2026-08-27** (111 upvotes, #12 of the day). Current version 1.37.0, released 2026-11-16. | [iTunes lookup](https://itunes.apple.com/lookup?id=6754904253&country=us), [X pinned post](https://x.com/WonderingApp), [HN 1](https://news.ycombinator.com/item?id=49282564), [HN 2](https://news.ycombinator.com/item?id=49391007), [hunted.space](https://www.hunted.space/product/wondering-2) |
| Platforms | iPhone and iPad (also runs on Apple Silicon Macs and Vision Pro) plus web. **No Android.** Wondering's own comparison page tells readers to "choose NerdSip if you need an Android app," and a Play Store search found nothing. | [App Store](https://apps.apple.com/us/app/wondering-learn-anything/id6754904253), [compare/nerdsip](https://wondering.app/compare/nerdsip) |
| Languages | App UI is in English and Traditional Chinese. Wondering says courses are available in "more than 70 languages." Taiwan is a strong second market: 57 TW ratings at 4.86★. | [App Store](https://apps.apple.com/us/app/wondering-learn-anything/id6754904253), [compare/nerdsip](https://wondering.app/compare/nerdsip), [iTunes TW lookup](https://itunes.apple.com/lookup?id=6754904253&country=tw) |

### Pricing and paywall

- **Free tier:** 3 of your own courses a month and 5 lessons a day. No ads on any plan. Lesson 1 of most public courses can be read on the web with no account. ([compare/notebooklm](https://wondering.app/compare/notebooklm), [compare/imprint](https://wondering.app/compare/imprint))
- **Pro:** $14.99 a month. The annual plan is $99.99 on the web and $107.99 on iPhone. Pro gives 15 courses a month and 150 lessons a day, plus "unlimited" AI chats and podcast episodes (subject to abuse guardrails) and jump-ahead controls. ([compare/notebooklm](https://wondering.app/compare/notebooklm), [App Store](https://apps.apple.com/us/app/wondering-learn-anything/id6754904253))
- **Max tier:** the App Store lists "Wondering Max" at $29.99 and $199.99, plus a "Pro Founding" plan at $107.99. Max's entitlements are not described publicly. ([App Store IAP list](https://apps.apple.com/us/app/wondering-learn-anything/id6754904253))
- **The team's "charges upfront" belief is not supported by public evidence.** The store listing says "Wondering is free to start," and the website and blog describe a working free tier. It is still possible the iOS onboarding shows a dismissable paywall or trial offer, but I could not confirm this without installing the app, and no App Store review mentions a paywall. **[UNVERIFIED]**

### Features and surfaces

| Team observation | What public evidence shows | Source |
|---|---|---|
| Duolingo-style roadmap tab | Confirmed. "Structured Roadmaps," sections then lessons, daily streaks, **friend streaks** (up to 3 mutual friends, nudges), XP, streak freezes, and an optional calendar slot. | [App Store](https://apps.apple.com/us/app/wondering-learn-anything/id6754904253), [wondering.app](https://wondering.app/) |
| Canvas / mind map | Confirmed, but **designed as a web/desktop feature**. The docs call it "a web workspace… Open Canvas from the desktop navigation." Each question is a draggable card; you can branch threads, highlight and take notes. Built with React Flow, React-component diagrams, GPT Image 2 for images, and Gemini 3.5 Flash Lite for speed. It launched on Product Hunt as "Visual ChatGPT in Parallel." | [docs](https://wondering.app/docs), [canvas](https://wondering.app/canvas), [Show HN](https://news.ycombinator.com/item?id=49391007), [hunted.space](https://www.hunted.space/product/wondering-2) |
| Browse/explore feed of others' courses you can import | Confirmed. `/explore` reads "Explore what others are wondering," with category pages (AI, startups, history…) and hundreds of public `/learn/<course>` pages in the sitemap, many in Chinese, Spanish, French and Hebrew. Courses based on popular books (Atomic Habits, Thinking Fast and Slow) are seeded. The ability to "personalize an imported course by asking questions" is **partly verified**: there is an in-lesson tutor ("pick a concept inside a lesson and ask it to go deeper") and personalization prompts such as "Explain using Batman as an example." I could not confirm that an imported course is re-generated for you. | [explore](https://wondering.app/explore), [sitemap via scout map](https://wondering.app/), [Show HN](https://news.ycombinator.com/item?id=49282564), [download page](https://wondering.app/download) |
| Comic-book-style reading lessons | **Partly verified.** No official page uses the word "comic." The public sample lesson is a sequence of short scene-based beats ("Imagine a guitarist plucking…"). Each beat is a header plus 2–3 sentences and ends with a question hook. Real Wikimedia photos sit alongside generated diagrams, then fill-in-the-blank and multiple-choice questions follow. A search summary cited one Product Hunt review describing the narration as "in the format of comics"; Product Hunt is bot-walled, so I could not read it directly. **[UNVERIFIED]** | [sample lesson](https://wondering.app/learn/how-music-is-built-b75bd21b727a7e33a51384c9/lesson) |
| AI video generation | Confirmed as "watch a narrated video" for each lesson. I found no public quality reviews of the video. | [wondering.app](https://wondering.app/), [compare/duolingo](https://wondering.app/compare/duolingo) |
| AI podcast | Confirmed. Each lesson has a 3–4 minute podcast and lessons autoplay in sequence. The founder calls it his "favourite feature." There is also a voice tutor ("chat or talk with"). | [Show HN](https://news.ycombinator.com/item?id=49282564), [compare/imprint](https://wondering.app/compare/imprint) |
| Other | Knowledge Cards library; FSRS global review across all courses; free SEO tools such as "AI news decoder" and "job course"; and a "Learn AI for your job" funnel. | [App Store](https://apps.apple.com/us/app/wondering-learn-anything/id6754904253), [wondering.app](https://wondering.app/) |

### Ratings and reviews

- **US:** 4.68★ from 97 ratings. **TW:** 4.86★ from 57. **GB:** 5.0★ from 12. ([iTunes lookup US](https://itunes.apple.com/lookup?id=6754904253&country=us))
- **The reviews skew friendly.** About 8 US and TW 5★ reviews landed on launch day (2026-03-11 to 03-13), several from self-described beta users, and one praises "the people who designed this software." Treat the average as inflated. ([reviews RSS](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6754904253/sortby=mostrecent/json), [TW RSS](https://itunes.apple.com/tw/rss/customerreviews/page=1/id=6754904253/sortby=mostrecent/json))
- **What reviewers praise:**
  - Instant personalized paths: "generate a personalized learning path in seconds… works much better than just using ChatGPT or Gemini."
  - "cute aesthetics"
  - "UX is excellent… like Instagram and ChatGPT combined but for learning"
  - Framing it as a doomscroll replacement: "Love this feeling over doom scrolling."
- **What reviewers complain about:**
  - **AI content and image quality.** A 1★ review: "content and imagery… is very clearly AI… they straight up don't make sense, along with clear photos of people with three arms."
  - **Diagrams.** A 5★ reviewer: "flowcharts… confusing and unintuitive… lines after the conditionals… don't go where they're supposed to go."
  - **Language setting ignored.** Content still appears in English after choosing Chinese (2 reviews).
  - **No back button** mid-exercise (TW).
  - **Web sign-in** doesn't work with an Apple account (IN).
  - A wish for sound effects.
- **Not found in any review:** complaints about the podcast voice, the video quality, or Canvas on mobile.

### Reception and traction

- **YC launch post** (date not shown, likely around Aug 2026): "more than 12k people complete over 42k lessons, with 687 learning with us this past week and 100+ paying." ([YC](https://www.ycombinator.com/companies/wondering))
- **Later claim:** "Join 28,000+ users on Wondering" on the download page (read via the reader proxy, so it may be cached). ([download](https://wondering.app/download))
- **Revenue estimate (mine, not sourced):** 100+ payers at $9–15 a month is roughly $1–1.5k MRR at YC launch. No Appfigures or Sensor Tower public data found. MWM shows the app "Outside top 30 · US Free · Education." ([MWM](https://mwm.ai/apps/wondering-learn-anything/6754904253))
- **Hacker News:** app Show HN got 3 points and no comments. Canvas Show HN got 7 points and 6 comments. Commenters asked for branching from mid-thread, suggested branches, search, node delete, and to "try it out before signing up." One asked how Canvas would unify with the Duolingo-style course flow. ([HN app](https://news.ycombinator.com/item?id=49282564), [HN canvas](https://news.ycombinator.com/item?id=49391007))
- **Product Hunt:** Canvas got 111 upvotes, #12 of the day. ([hunted.space](https://www.hunted.space/product/wondering-2))
- **X:** @WonderingApp has 4,386 followers and 154 posts. ([X](https://x.com/WonderingApp))
- **YouTube:** the "Meet Wondering" 53-second promo has about 28.8k views. I couldn't get the transcript because YouTube bot-walled it. ([YouTube](https://www.youtube.com/watch?v=uZ72r5-B3UM))
- **Reddit:** scout's Reddit reader was blocked (HTTP 404/429), and no Reddit threads surfaced in web search. **No Reddit signal found.**
- **SEO and content engine:** 10 "Wondering vs X" pages (Duolingo, Brilliant, Imprint, NerdSip, NotebookLM, Coursera, Khan, Deepstash, Headway, Elevate), around 20 blog posts dated Nov 2026, and every public course indexed with a free lesson 1. This is clearly their acquisition bet. ([compare](https://wondering.app/compare), [blog](https://wondering.app/blog))

### Verdict on the team's take

| Team claim | Verdict | Evidence |
|---|---|---|
| Shipped fast | **Supported** | 2 people; iOS 1.0 in Mar 2026, v1.37 by Nov; Canvas, video, voice tutor and friend streaks added along the way. ([lookup](https://itunes.apple.com/lookup?id=6754904253&country=us)) |
| Browse/import solves cold start | **Supported, and it doubles as SEO.** Public courses are indexed with a free first lesson that needs no account. | [explore](https://wondering.app/explore), [compare/notebooklm](https://wondering.app/compare/notebooklm) |
| Comic-style reading and diagrams are half-decent | **Mixed.** The lesson structure (scene, then hook, then answer, then check) is good. Diagrams draw specific complaints (flowcharts, broken connectors), and AI imagery gets "three arms" complaints. They mix in Wikimedia photos, probably to reduce AI-image risk. | [sample lesson](https://wondering.app/learn/how-music-is-built-b75bd21b727a7e33a51384c9/lesson), [reviews](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6754904253/sortby=mostrecent/json) |
| Video script and visual quality poor | **[UNVERIFIED] externally.** No reviews either way. For context, Google's own NotebookLM Video Overviews were called "dull PowerPoint presentations," so the whole industry's bar is low. | [TechRadar](https://www.techradar.com/ai-platforms-assistants/gemini/i-tried-using-notebooklms-new-ai-video-overviews-and-ended-up-with-some-usefully-informative-but-rather-dull-powerpoint-presentations) |
| Podcast is a boring TTS voice | **[UNVERIFIED].** No user complaints found; the founder calls it his favourite feature. | [Show HN](https://news.ycombinator.com/item?id=49282564) |
| Canvas is a nightmare on mobile | **Plausible, with a reason.** Wondering's docs describe Canvas as a desktop/web feature. It was not designed for phones. | [docs](https://wondering.app/docs) |
| Duolingo aesthetic copied badly | **Challenged by the evidence.** Reviewers specifically praise the "cute aesthetics" and the UX. This is subjective, and the review base is small and friendly. | [reviews](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6754904253/sortby=mostrecent/json) |
| Charges upfront | **Not supported.** There is a free tier of 3 courses a month and 5 lessons a day. An onboarding upsell is unverified. | [compare/notebooklm](https://wondering.app/compare/notebooklm) |

---

## 2. Must-cover competitors: where each competes with Cortex

| Competitor | Where it competes with Cortex | Lesson Cortex should take |
|---|---|---|
| **Oboe** | **Course generation** (prompt to multimodal course). It was the same thesis, better funded (~$20M), and it **abandoned it on 2026-11-03** for a puzzle feed. | Course quality was not the bottleneck; **return frequency and motivation were**. Ship the daily reason to come back (feed, game, social) in V0, not later. ([X post](https://x.com/NirZicherman/status/2117683979809890720)) |
| **Coursebox** | **Course generation engine, and SEO** for "AI course generator." It is B2B (trainers, HR, LMS, SCORM) and does not compete for consumer learners. | It gets about 90% of sales from organic SEO. A long tail of indexable topic/course pages is a cheap acquisition channel (Wondering and NerdSip do this too). ([Startup Daily](https://www.startupdaily.net/topic/funding/perths-coursebox-bags-750k-from-purpose-ventures-to-disrupt-corporate-training/)) |
| **NotebookLM / Gemini Notebook** | **Source-grounded study artifacts**: audio, video, short-video and cinematic overviews; quizzes and flashcards; voice chat with your notebook. Free, 30M+ users. | Don't fight on the number of formats. Win on **zero setup** (no sources needed), a course spine with progression, reliable mobile playback, and visuals tied to the lesson. Google's video and voice quality is a visible pain point. ([Google](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/), [App Store reviews](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6737527615/sortby=mostrecent/json)) |
| **Brilliant** | **Interactive problem-solving pedagogy**, plus Koji, a "graphical tutor" that annotates *inside* the interactive and speaks first. 10M+ people; "hundreds of thousands of paid subscribers." | Generated visuals should be **manipulable, and the tutor should point at them**, not chat in a side panel. Also avoid Brilliant's price and cancellation backlash. ([Brilliant blog](https://blog.brilliant.org/a-world-class-tutor-in-every-home/)) |
| **Matiks** | **Gamified habit and competition loop**: rated 1v1 duels (Blitz), daily challenges, streaks with shields, a global leaderboard, contests with prizes. 300K DAU and 2.2M MAU (Sep 2026); $10M from General Catalyst. | A **"duel a friend on today's topic"** quiz with skill-matched ratings could give Cortex the social pull course apps lack. Don't monetize streak loss and don't hard-paywall early; that is where Matiks is losing goodwill now. ([TechCrunch](https://techcrunch.com/2026/10/26/matiks-raises-10m-to-expand-its-math-and-puzzle-gaming-platform/), [App Store reviews](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6738620563/sortby=mostrecent/json)) |

### Oboe (oboe.com): pivoted away from courses

- **Who:** Nir Zicherman and Michael Mignano (Anchor co-founders). $4M seed led by Eniac, then a $16M Series A led by a16z in Dec 2025. ([TC Sep 2025](https://techcrunch.com/2025/09/10/after-selling-to-spotify-anchors-co-founders-are-back-with-oboe-an-ai-powered-app-for-learning/), [TC Dec 2025](https://techcrunch.com/2025/12/10/oboe-raises-16-million-from-a16z-for-its-ai-powered-course-generation-platform/))
- **Course era:**
  - Multi-agent generation in parallel: outline, writing, fact-check, podcast script, and *real web images* rather than generated ones. Courses arrived "within seconds."
  - Lecture and two-host podcast audio, plus games, quizzes and flashcards embedded in place.
  - Goal-first redesign in Dec 2025 (more than two-thirds of prompts were goals). Songs and diagrams added in Jun 2026.
  - Web-first.
  - Pricing: unlimited courses, with chapter depth gated at $15 or $40 a month.
  - ([TC](https://techcrunch.com/2025/12/10/oboe-raises-16-million-from-a16z-for-its-ai-powered-course-generation-platform/), [Oboe blog](https://oboe.com/blog/introducing-the-all-new-oboe), [songs & diagrams](https://oboe.com/blog/songs_and_diagrams))
- **Praise:** "design is world class"; inline flashcards are "genius"; podcasts are "very difficult to tell they're AI." **Complaints:** links to one source only; inconsistent quizzes. A user quoted by Oboe itself: "felt like a reading list vs. learning with a tutor." ([tremendous.blog](https://tremendous.blog/2025/12/12/how-to-make-a-great-ai-product-oboe/), [Oboe v4](https://oboe.com/blog/v4))
- **Now:** "Puzzles that sharpen your mind," a personalized feed of generated interactive challenges. The new iOS app launched 2026-10-31 and has 4.80★ from 182 ratings in 18 days. ([oboe.com](https://oboe.com/), [CEO post](https://x.com/NirZicherman/status/2117683979809890720), App Store id 6794063907)

### Coursebox (coursebox.ai): B2B course builder

- Perth, Australia. Founders Travis Clapp and Alex Hey. $750k seed from Purpose Ventures (Aug 2025). 100K+ sign-ups; about 90% of sales from organic SEO. ([Startup Daily](https://www.startupdaily.net/topic/funding/perths-coursebox-bags-750k-from-purpose-ventures-to-disrupt-corporate-training/))
- **Workflow:** prompt or documents, then an editable outline, then the course. Formats include AI-avatar video (500+ avatars), voiceover, quizzes, flipcards, scenarios, and SCORM export. An "Ask Coursebox" agent edits courses. ([about](https://www.coursebox.ai/about.md), [pricing](https://www.coursebox.ai/pricing))
- **Pricing:** free tier of 3 mini-courses with a watermark. Paid plans are reportedly about $40 a month (Creator) to about $300 (Pro) **[secondary]**. ([Capterra](https://www.capterra.com/p/276074/Coursebox/pricing/))
- **Weakness:** "generic or repetitive" output on technical topics. ([Software Advice](https://www.softwareadvice.com/lms/coursebox-profile/reviews/))
- **iOS app:** 3.0★ from 2 ratings.

### NotebookLM, now Gemini Notebook

- Renamed on 2026-07-16. Web, iOS and Android. Free tier: 100 notebooks with 50 sources each. Paid through Google AI Plus ($4.99) and Pro ($19.99). 30M+ users; iOS 4.86★ from 65k ratings. ([Google](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/), [plans](https://support.google.com/notebooklm/answer/16213268?hl=en), [lookup](https://itunes.apple.com/lookup?id=6737527615&country=us))
- **Formats:**
  - Audio Overviews (Brief, Critique, Debate).
  - Video Overviews (narrated slides).
  - **Cinematic Video Overviews** (Mar 2026; Veo 3 and Nano Banana Pro; Ultra plan only).
  - **About 60-second Short Video Overviews** in 80+ languages (Sep 2026).
  - Quizzes (short answer, multiple select, fill-in-the-blank), flashcards, mind maps, and real-time voice chat with the notebook on mobile.
  - ([cinematic](https://blog.google/innovation-and-ai/products/notebooklm/generate-your-own-cinematic-video-overviews-in-notebooklm/), [Sep 2026 study tools](https://blog.google/innovation-and-ai/products/gemini-notebook/new-study-tools-september-2026/))
- **Weaknesses:**
  - Video Overviews are "dull PowerPoint presentations."
  - Recent reviews: "Video overview doesn't work at all… uses all my video credits"; "Dislike New Male Voice"; "web browser wrapped as an app."
  - ([TechRadar](https://www.techradar.com/ai-platforms-assistants/gemini/i-tried-using-notebooklms-new-ai-video-overviews-and-ended-up-with-some-usefully-informative-but-rather-dull-powerpoint-presentations), [reviews](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6737527615/sortby=mostrecent/json))
- **Gemini app study notebooks (Jun 2026):** the closest Google product to Cortex, and free. Upload a syllabus or notes, take a diagnostic quiz, get bite-sized lessons with quizzes, and you can "pause at any time to ask questions." A dashboard tracks 100+ learning objectives. ([Google](https://blog.google/innovation-and-ai/products/gemini-app/gemini-study-notebooks/))

### Brilliant

- "Learn by doing": math, CS, data, physics and AI. Web, iOS and Android. US App Store prices: $24.99 a month or $149.99 a year; "Premium with Tutor" is $30 a month or $191.99 a year. The free tier is roughly one lesson a day plus ads **[secondary]**. ([App Store](https://apps.apple.com/us/app/brilliant-learn-math-coding/id913335252), [Headway review](https://makeheadway.com/blog/brilliant-review/))
- **Koji tutor** (May 2026): sees your wrong guesses and pauses, annotates inside the interactive, speaks first by default, and has a mascot form because users rejected "a generic sparkle button." Voice by ElevenLabs. ([Brilliant blog](https://blog.brilliant.org/a-world-class-tutor-in-every-home/), [ElevenLabs](https://elevenlabs.io/blog/brilliant-launches-personal-tutor-powered-by-elevenlabs))
- **Traction:** iOS 4.73★ from 33.5k ratings; 10M+ people; "hundreds of thousands of paid subscribers," "default alive." ([lookup](https://itunes.apple.com/lookup?id=913335252&country=us), [Index Ventures](https://www.indexventures.com/startup-jobs/remote/general-interest-engineering/))
- **Complaints:** price ("$100+ for AI is wild"), a "labyrinth to cancel," and that Koji "responds in the typical AI way." ([reviews](https://itunes.apple.com/us/rss/customerreviews/page=1/id=913335252/sortby=mostrecent/json))

### Matiks

- **What it is:** competitive mental math and brain games (Math, Puzzle, Memory, Logic). "Most brain training apps make you train alone. Matiks makes you compete." Made by an India-based company; founders Sudhanshu Bhatia, Mohan Kumar and Sushant Timmapur. iOS (since Dec 2024) and Android. ([lookup](https://itunes.apple.com/lookup?id=6738620563&country=us), [TechCrunch](https://techcrunch.com/2026/10/26/matiks-raises-10m-to-expand-its-math-and-puzzle-gaming-platform/))
- **Game loop:**
  - Play bots first, then real players.
  - Blitz online duels against players "of similar rating," with "fastest finger first."
  - Classical and Memory ("Flash") modes, daily challenges, CrossMath, Puzzle Rush.
  - "Compete" contests (including college contests) and "Nets" practice drills.
  - Friends, DMs and a global leaderboard. Numeric ratings are visible (players post "Crossed 3200 rating"); whether the rating is exactly Elo is **[UNVERIFIED]**.
  - Streaks with streak shields, and World Cup events with jersey prizes.
  - ([walkthrough video](https://www.youtube.com/watch?v=n5hY21gEYso), [rating video](https://www.youtube.com/watch?v=ArFMfif42mw), [reviews](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6738620563/sortby=mostrecent/json))
- **Traction:** DAU grew from 22K to 300K+ (Sep 2026), with 2.2M MAU. A $10M pre-Series A led by General Catalyst brings the total to $13.5M+. Play Store 5M+ downloads; US iOS 4.68★ from 530 ratings. It grew through sponsored YouTube creators. ([TechCrunch](https://techcrunch.com/2026/10/26/matiks-raises-10m-to-expand-its-math-and-puzzle-gaming-platform/), [Play](https://play.google.com/store/apps/details?id=com.matiks.app&hl=en_US), [YouTube](https://www.youtube.com/watch?v=4fIrDMXxUSk))
- **Pricing:** free with ads and in-app purchases. Subscription testing began Oct 2026: Pro at $6.99 a week, $19.99 a month or $59.99 a year.
- **Weaknesses since the subscription test:** an "unskippable payment required screen," undelivered prizes, and a 40-day streak lost to an outage that then cost coins to restore. ([App Store](https://apps.apple.com/us/app/id6738620563), [reviews](https://itunes.apple.com/us/rss/customerreviews/page=1/id=6738620563/sortby=mostrecent/json), [Play](https://play.google.com/store/apps/details?id=com.matiks.app&hl=en_US))

---

## 3. Competitor comparison table

Ratings are US iOS stars and rating counts, pulled 2026-11-18.

| Product | Positioning | Platforms | Pricing (US) | Standout format | Traction | Status |
|---|---|---|---|---|---|---|
| **Wondering** | Duolingo for anything (AI-generated) | iOS, web | Free 3 courses/mo + 5 lessons/day; Pro $14.99/mo, $99.99–107.99/yr; Max $29.99/$199.99 | 3-min visual lessons, narrated video, podcast, voice tutor, Canvas, FSRS | 4.68★/97; 12k→28k users (claimed); 100+ paying at YC launch | Active, YC S26 |
| **Oboe** | Was: AI course on anything. Now: puzzle feed | iOS, Android, web | New app is free | Was: podcast + inline quizzes/flashcards | ~$20M raised; new app 4.80★/182 | **Pivoted out 2026-11-03** |
| **NerdSip** | 5-min fact-checked AI courses, anti-doomscroll | iOS, Android, web | Free 1 sample/day; $7.99/mo, $49.99/yr | Swipe feed of upvoted user courses, mini-game per lesson, RPG loot | 4.74★/127; Android 10K+; ~$3.8k/30 days | Active, bootstrapped |
| **Imprint** | Curated visual courses on big ideas | iOS, Android | Hard paywall; $15.99/mo, $74.99–99.99/yr | Polished illustrated cards | 4.77★/61k; "4M+ learners" | Active, not AI-generated |
| **Gizmo** | Gamified AI flashcards and quizzes from your notes | iOS, Android, web | Free with lives; Unlimited $6.99–154.99 | Lives, streaks, friend challenges, live multiplayer | 13M users; $22M A; 4.79★/18k | Active |
| **Gemini Notebook (NotebookLM)** | Source-grounded research and study | Web, iOS, Android | Free; AI Plus $4.99, Pro $19.99 | Audio, video, short and cinematic video overviews, quizzes, voice | 30M+ users; 4.86★/65k | Active, Google |
| **Gemini Guided Learning + study notebooks** | Socratic tutor plus syllabus-to-lessons | Web, iOS, Android | Free | Diagnostic quiz, then lessons, then objectives dashboard | Gemini 950M+ MAU | Active, Google |
| **ChatGPT Study Mode** | Socratic mode in the default answer box | All | Free and paid | Inline interactive visuals (70+ concepts), flashcards, quizzes | 140M/week use it for math and science | Active, OpenAI |
| **Claude Learning mode** | Socratic style toggle | All | Free and paid | Text Socratic chat | n/a | Active |
| **Khanmigo** | AI tutor on top of Khan Academy | Web, iOS | $4/mo, $44/yr | Socratic tutor | Only ~15% of students with access engage | Active, being redesigned |
| **Brilliant** | Interactive problem solving | Web, iOS, Android | $24.99/mo, $149.99/yr; with tutor $30/$191.99 | Hand-built interactives + Koji graphical tutor | 10M+; 4.73★/33.5k | Active |
| **Matiks** | Competitive mental-math games | iOS, Android | Free + IAP; Pro $6.99/wk–$59.99/yr | Rated 1v1 duels, daily challenges, leaderboard | 300K DAU, 2.2M MAU; $13.5M raised | Active |
| **Coursebox** | B2B AI course builder + LMS | Web (iOS app negligible) | Free 3 mini-courses; ~$40–300/mo [secondary] | AI avatar video, SCORM | 100K+ sign-ups; $750k seed | Active, B2B |
| **Nibble** | Expert-made micro-lessons | iOS, Android, web | $19.99/mo; $12.99–89.99/yr | Animated video, audio, games, historical-figure chats | 4.34★/47k | Active, not generative |
| **StudyFetch** | Upload materials, get study tools + "Sparky" voice tutor | iOS, web | $19.99/mo, $96/yr; voice $7.49/hr | Voice tutor "on any topic" | 4.78★/15.9k; ~$10–11.5M A [partly unverified] | Active |
| **Mindgrasp** | Notes, summaries and quizzes from uploads | iOS, web | Trial only; $12.99–14.99/mo | Q&A on your material | 4.67★/1.1k | Active, commoditized |
| **Turbo AI** | Uploads become lessons, quizzes, flashcards, podcasts | iOS, Android | $9.99/wk–$119.99/yr | Study-tool bundle | 5M users; 8-figure ARR; $750k raised | Active |
| **Speechify** | Voice-first AI assistant and reader | All | $11.99–24.99/mo | AI podcasts from any doc, voice Q&A | 4.66★/529k; "60M+ users" | Active |
| **SUN (sunapp.ai)** | On-demand audio courses on any topic | iOS, Android | Pro $15/mo, $99/yr | Interruptible audio | 4.61★/36; a16z Speedrun | Early |
| **Revisely** | Web flashcard and quiz generator | Web | Pro ~$9/mo [secondary] | Flashcards | No signal | Minor |
| **Huxe** | Prompt-to-podcast by NotebookLM alumni | — | — | Interruptible podcasts | $4.6M raised | **Shut down May 2026** |
| **Learn.xyz** | AI "Curiosities" slide lessons | — | — | Slides + quiz | $3M seed (2023) | **Appears defunct** (site 404s) |
| **Uncommon** | — | — | — | — | — | **Not identified** as a learning app |

Sources for the table: see per-competitor notes in §2 and §4.

---

## 4. Per-competitor notes (non-must-cover)

- **NerdSip** is the closest live mobile clone of Cortex.
  - Every generated course flows into a shared, upvote-ranked swipe feed, so user prompts become a catalog anyone can browse.
  - Lessons are 1 minute each, in courses of 3, 5 or 10, with a challenge per lesson (fill the gap, fix the mistake, order, match). There is also a summary infographic, a TTS "podcast mode," and leagues and loot.
  - Claims courses are "written against live sources, then scored for accuracy."
  - Built by two physicists on under $500. Growth: SEO brings over 40% of new users and AI-search citations 28%; their TikTok content has 10M+ views. 384 active subscriptions.
  - Reviews: "It's literally all AI slop. They couldn't even take out the em dashes."
  - ([site](https://nerdsip.pages.dev/), [Indie Hackers](https://www.indiehackers.com/post/bootstrapping-brainpower-inside-nerdsip-s-organic-rise-to-10k-downloads-2f44bb40a4), [TrustMRR](https://trustmrr.com/startup/nerdsip), App Store id 6756797708)
- **Imprint** proves people will pay for visual, bite-size learning ($15.99 a month, 61k ratings, "4M+ learners"). But it is a fixed catalog with a hard paywall and November 2026 billing complaints: "approved a $.99 3-day trail… charged $64.99." Cortex's pitch can be "Imprint quality on any topic you type." ([imprintapp.com](https://www.imprintapp.com/), [App Store](https://apps.apple.com/hn/app/imprint-learn-visually/id1482780647?l=en-GB))
- **Gizmo** grew to 13M users and raised a $22M Series A (Shine) through lives, streaks, leaderboards and friend challenges on top of AI-generated flashcards. Weaknesses: crashes, and "generated random questions based on wrong topic." ([TechCrunch](https://techcrunch.com/2026/04/15/ai-learning-app-gizmo-levels-up-with-13m-users-and-a-22m-investment/))
- **Learn Your Way** (Google Research): re-renders textbook chapters into multiple representations, with grade-level adjustment and interest-based examples. It showed **+11 points retention** (78% vs 67%). It is limited to curated chapters. ([Google Research](https://research.google/blog/learn-your-way-reimagining-textbooks-with-generative-ai/))
- **Gemini Guided Learning:** free and Socratic, with images and YouTube. A reviewer found broad prompts "a little directionless" and it "could not… give a good definition of sine and cosine." ([Tech & Learning](https://www.techlearning.com/how-to/geminis-guided-learning-mode-from-google-ai-what-educators-need-to-know))
- **ChatGPT Study Mode:** runs on a system prompt and is free. Since Mar 2026 it shows interactive visual modules for 70+ math and science concepts automatically. It still has no persistent course or progression. ([OpenAI](https://openai.com/index/chatgpt-study-mode/), [OpenAI visuals](https://openai.com/index/new-ways-to-learn-math-and-science-in-chatgpt))
- **Khanmigo:** only ~15% of students with access engage. Students stopped using it when it withheld answers, and gains were no better than plain practice. ([Khan blog](https://blog.khanacademy.org/learning-in-the-open-what-ai-is-and-isnt-changing/), [Chalkbeat](https://www.chalkbeat.org/2026/08/25/ai-tutoring-students-khanmigo-khan-academy-engagement-study/))
- **Huxe:** NotebookLM alumni, $4.6M raised. Shut down on 2026-05-21, the day after Spotify launched personal podcasts; Apple licensed its IP. Audio-only "learn anything" is a commodity feature. ([TechCrunch](https://techcrunch.com/2026/05/22/audio-generation-app-huxe-founded-by-former-notebooklm-developers-shuts-down/))
- **Turbo AI:** 5M users and eight-figure ARR on $750k raised, as an upload-to-lessons study tool with weekly pricing. Shows how fast a viral student AI tool can grow. ([TechCrunch](https://techcrunch.com/2025/10/23/20-year-old-dropouts-built-ai-notetaker-turbo-ai-to-5-million-users/))
- **StudyFetch, Mindgrasp, Revisely:** study tools for uploaded material, now commoditized. One Mindgrasp review: "obsolete now that every single consumer facing AI offers a PDF parsing feature." (App Store reviews, ids 6663574866 / 1638182014)
- **Speechify:** repositioned in 2026 as a "voice-first AI assistant" aimed at ChatGPT. It offers AI podcasts from documents and voice Q&A. ([HRTech Edge](https://hrtechedge.com/ai-in-hr/speechify-reintroduces-itself-as-a-voice-first-ai-assistant-and-takes-aim-at-chatgpt-gemini-and-copilot/), [Speechify blog](https://speechify.com/blog/speechify-2026-update-features-products-use-cases/))
- **Nibble:** an expert-curated catalog at $19.99 a month; 4.34★ from 47k ratings. Complaints about auto-renew contracts. Not generative.
- **Long tail of new entrants:** SUN (a16z Speedrun, on-demand audio courses), CurioVerse (3 ratings), Octo AI (2 ratings). "Type a topic, get a course" is now a weekend-clone category.
- **Voice tutors** (Speak, Praktika, Fluently): high ratings from speaking-first practice with a persona. These are reference points for a future voice mode, not V0 competitors. ([TC Speak](https://techcrunch.com/2024/12/10/openai-backed-speak-raises-78m-at-1b-valuation-to-help-users-learn-languages-by-talking-out-loud))

---

## 5. Curiosity capture vs ChatGPT

**Where things stand:** ChatGPT (140M people a week for math and science alone) and Gemini own the first question. They are free, already installed, and now show inline visuals and quizzes. None of the course apps has a strong standalone "ask a one-off question" entry point.

| Pattern | Who does it | Does it work? |
|---|---|---|
| **Answer in a chat, and the visuals appear automatically** | ChatGPT interactive modules (70+ concepts, no toggle); Wondering Canvas answers with "interactive diagrams instead of a wall of text" | Strongest for capturing curiosity. It costs nothing to start and the answer is visibly better than text. ([OpenAI](https://openai.com/index/new-ways-to-learn-math-and-science-in-chatgpt), [hunted.space](https://www.hunted.space/product/wondering-2)) |
| **Branch a question into parallel threads** | Wondering Canvas (Product Hunt pitch: "Visual ChatGPT in Parallel") | Good for rabbit holes on desktop; weak on mobile. HN users asked to branch mid-thread and for suggested branches. ([HN](https://news.ycombinator.com/item?id=49391007)) |
| **Ask inside a lesson** ("go deeper on this concept") | Wondering, old Oboe, Gemini study notebooks ("pause at any time to ask questions"), Coursebox | Useful for retention but does not capture new curiosity; you must already be in a course. ([Google](https://blog.google/innovation-and-ai/products/gemini-app/gemini-study-notebooks/)) |
| **Describe a topic and the app finds the sources** | NotebookLM Discover / Fast Research, Deep Research | Removes the "bring your own sources" barrier, but the output is a notebook, not an answer. ([Google](https://blog.google/technology/google-labs/notebooklm-discover-sources/)) |
| **Paste a link, video or PDF and get a course** | Wondering (YouTube captions, Apple Podcasts transcripts, PDFs, photos), Turbo, Gizmo | Catches "I just watched or read X" moments. ([Wondering blog](https://wondering.app/blog/turn-any-article-pdf-or-video-into-a-course)) |
| **A voice tutor that speaks first** | Brilliant Koji, StudyFetch Sparky (metered), Speechify, Gemini Notebook voice | Koji's "speaks first" and mascot design came from Brilliant finding users ignore a generic AI button. Khanmigo is the cautionary case: an opt-in tutor reached only ~15% engagement. ([Brilliant](https://blog.brilliant.org/a-world-class-tutor-in-every-home/), [Khan](https://blog.khanacademy.org/learning-in-the-open-what-ai-is-and-isnt-changing/)) |
| **A feed instead of a question** | NerdSip upvoted course feed, Wondering Explore, new Oboe puzzle feed, Imprint | Captures idle time, which ChatGPT does not serve, rather than questions. Oboe reports "stark" retention gains after moving to a feed. ([CEO post](https://x.com/NirZicherman/status/2117683979809890720)) |
| **Tools aimed at one job** | Wondering "AI news decoder" and "job course" tools; SEO comparison pages | They catch search intent before ChatGPT does. ([wondering.app](https://wondering.app/)) |

**What works:** a zero-friction text box whose answer is visibly richer than ChatGPT's (a diagram or interactive, not a wall of text), followed by an obvious next step that ChatGPT doesn't offer: save it, turn it into a course, review it later, or duel a friend on it. Nobody has shipped a polished "answer card first, then course in one tap" flow on mobile. Wondering comes closest, but splits it across a desktop Canvas and a mobile course app.

---

## 6. What Cortex should steal and avoid

### Steal

- **A public course library with a free lesson 1 and no login.** It solves cold start and works as SEO (Wondering, NerdSip, Coursebox). Every generated course can become an indexable page.
- **Wondering's lesson rhythm:** a scene, then a question hook, then a short answer, then a bold takeaway, ending with fill-in-the-blank and multiple choice. Use real (Wikimedia) photos for factual imagery and generate only diagrams. This avoids "three arms" complaints. ([sample lesson](https://wondering.app/learn/how-music-is-built-b75bd21b727a7e33a51384c9/lesson))
- **Free-text personalization chips** on topic entry ("Explain using Batman," "Relate to my job as a surgeon," "TLDR first"). ([download](https://wondering.app/download))
- **Several input types:** topic, link, YouTube, PDF or photo, each turned into a course.
- **FSRS global review** across all courses. Plus **friend streaks** (Wondering) and a **rated 1v1 duel on lesson content** (Matiks, Gizmo), so the app has a reason to come back that ChatGPT can't copy.
- **Answer-first entry:** a ChatGPT-style box that returns a visual explainer card, with "Make this a course" and "Quiz me" as the next actions.
- **Interest-based example swapping** (Learn Your Way showed +11 points retention) and a **tutor that points at the visual** (Brilliant Koji).
- **Comparison and SEO pages** comparing Cortex with each named competitor once V0 ships.

### Avoid

- **Building Oboe's v1 again.** A great course generator with no daily loop failed even with $20M behind it. V0 needs a retention mechanic, not just generation quality.
- **Desktop-first features squeezed onto a phone** (Wondering Canvas). If Cortex does branching, make it a mobile-native stack or tree, not a pan-and-zoom board.
- **Leaning on AI video or podcasts for V0.** Huxe died once audio became commoditized. NotebookLM video gets "dull PowerPoint" reviews and credit-burning failures. Treat audio and video as optional formats, not the headline.
- **Opaque or upfront paywalls and monetized streak loss.** Imprint, Brilliant and Matiks are all collecting billing and "unskippable paywall" one-star reviews right now. Wondering's generous free tier (3 courses a month, 5 lessons a day) is the bar to match.
- **Generated flowcharts with broken connectors**, and language settings that don't apply to content (Wondering's two concrete review complaints).
- **Tutors that refuse to answer** (Khanmigo engagement collapse) and AI tells in the text ("couldn't even take out the em dashes" on NerdSip).
- **Competing with Google on format count.** Compete on zero-setup curiosity, then a course path, then the habit loop, all on mobile.

---

## 7. Open questions / unverified

- Whether Wondering's iOS onboarding shows a paywall or trial upsell before the first lesson (not checked by installing the app).
- How good Wondering's video and podcast voices are (no third-party reviews found). The team should screen-record a session for a side-by-side comparison.
- The "comic-book" label for Wondering lessons (one Product Hunt review, seen only through a search summary; Product Hunt is bot-walled).
- Wondering's funding beyond the reported $125k (Dealroom is login-walled), and the date of its YC launch post.
- Downloads and revenue estimates from Appfigures or Sensor Tower: no public posts found for Wondering, NerdSip or Oboe.
- Reddit reception: scout's Reddit access was blocked and web search surfaced no threads.
- "Uncommon": could not identify a learning app by that name.

---

## Sources

### Wondering
- https://wondering.app/
- https://wondering.app/download
- https://wondering.app/docs
- https://wondering.app/canvas
- https://wondering.app/explore
- https://wondering.app/compare
- https://wondering.app/compare/notebooklm
- https://wondering.app/compare/nerdsip
- https://wondering.app/compare/imprint
- https://wondering.app/compare/duolingo
- https://wondering.app/blog/apps-like-duolingo-for-other-subjects
- https://wondering.app/blog/turn-any-article-pdf-or-video-into-a-course
- https://wondering.app/blog/apps-to-learn-instead-of-doomscrolling
- https://wondering.app/learn/how-music-is-built-b75bd21b727a7e33a51384c9/lesson
- https://www.ycombinator.com/companies/wondering
- https://apps.apple.com/us/app/wondering-learn-anything/id6754904253
- https://itunes.apple.com/lookup?id=6754904253&country=us
- https://itunes.apple.com/us/rss/customerreviews/page=1/id=6754904253/sortby=mostrecent/json
- https://itunes.apple.com/tw/rss/customerreviews/page=1/id=6754904253/sortby=mostrecent/json
- https://news.ycombinator.com/item?id=49282564
- https://news.ycombinator.com/item?id=49391007
- https://www.hunted.space/product/wondering-2
- https://www.producthunt.com/products/wondering-2 (bot-walled)
- https://x.com/WonderingApp
- https://www.youtube.com/watch?v=uZ72r5-B3UM
- https://mwm.ai/apps/wondering-learn-anything/6754904253
- https://chatgate.ai/post/wondering
- https://app.dealroom.co/companies/wondering (login-walled)

### Oboe
- https://techcrunch.com/2025/09/10/after-selling-to-spotify-anchors-co-founders-are-back-with-oboe-an-ai-powered-app-for-learning/
- https://techcrunch.com/2025/12/10/oboe-raises-16-million-from-a16z-for-its-ai-powered-course-generation-platform/
- https://x.com/NirZicherman/status/2117683979809890720
- https://oboe.com/
- https://oboe.com/blog/introducing-the-all-new-oboe
- https://oboe.com/blog/v4
- https://oboe.com/blog/songs_and_diagrams
- https://oboe.com/blog/teachers
- https://tremendous.blog/2025/12/12/how-to-make-a-great-ai-product-oboe/

### Coursebox
- https://www.coursebox.ai/pricing
- https://www.coursebox.ai/about.md
- https://www.startupdaily.net/topic/funding/perths-coursebox-bags-750k-from-purpose-ventures-to-disrupt-corporate-training/
- https://www.capterra.com/p/276074/Coursebox/pricing/
- https://www.softwareadvice.com/lms/coursebox-profile/reviews/

### Google
- https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/
- https://workspaceupdates.googleblog.com/2026/07/notebooklm-now-gemini-notebook.html
- https://support.google.com/notebooklm/answer/16213268?hl=en
- https://blog.google/innovation-and-ai/products/gemini-notebook/new-study-tools-september-2026/
- https://blog.google/innovation-and-ai/products/notebooklm/generate-your-own-cinematic-video-overviews-in-notebooklm/
- https://blog.google/technology/google-labs/notebooklm-discover-sources/
- https://www.techradar.com/ai-platforms-assistants/gemini/i-tried-using-notebooklms-new-ai-video-overviews-and-ended-up-with-some-usefully-informative-but-rather-dull-powerpoint-presentations
- https://itunes.apple.com/us/rss/customerreviews/page=1/id=6737527615/sortby=mostrecent/json
- https://blog.google/innovation-and-ai/products/gemini-app/gemini-study-notebooks/
- https://research.google/blog/learn-your-way-reimagining-textbooks-with-generative-ai/
- https://blog.google/products-and-platforms/products/education/guided-learning/
- https://www.techlearning.com/how-to/geminis-guided-learning-mode-from-google-ai-what-educators-need-to-know
- https://blog.google/company-news/inside-google/message-ceo/alphabet-earnings-q2-2026/

### OpenAI, Anthropic, Khan
- https://openai.com/index/chatgpt-study-mode/
- https://openai.com/index/new-ways-to-learn-math-and-science-in-chatgpt
- https://openai.com/index/learning-never-stops/
- https://engadget.com/ai/anthropic-brings-claudes-learning-mode-to-regular-users-and-devs-170018471.html
- https://www.khanmigo.ai/pricing
- https://blog.khanacademy.org/learning-in-the-open-what-ai-is-and-isnt-changing/
- https://www.chalkbeat.org/2026/08/25/ai-tutoring-students-khanmigo-khan-academy-engagement-study/

### Brilliant
- https://blog.brilliant.org/a-world-class-tutor-in-every-home/
- https://brilliant.org/help/features/how-does-koji-work/
- https://elevenlabs.io/blog/brilliant-launches-personal-tutor-powered-by-elevenlabs
- https://apps.apple.com/us/app/brilliant-learn-math-coding/id913335252
- https://www.indexventures.com/startup-jobs/remote/general-interest-engineering/
- https://makeheadway.com/blog/brilliant-review/

### Matiks
- https://techcrunch.com/2026/10/26/matiks-raises-10m-to-expand-its-math-and-puzzle-gaming-platform/
- https://apps.apple.com/us/app/id6738620563
- https://itunes.apple.com/us/rss/customerreviews/page=1/id=6738620563/sortby=mostrecent/json
- https://play.google.com/store/apps/details?id=com.matiks.app&hl=en_US
- https://www.youtube.com/watch?v=n5hY21gEYso
- https://www.youtube.com/watch?v=ArFMfif42mw
- https://www.youtube.com/watch?v=4fIrDMXxUSk

### Others
- https://nerdsip.pages.dev/
- https://www.indiehackers.com/post/bootstrapping-brainpower-inside-nerdsip-s-organic-rise-to-10k-downloads-2f44bb40a4
- https://trustmrr.com/startup/nerdsip
- https://www.imprintapp.com/
- https://apps.apple.com/hn/app/imprint-learn-visually/id1482780647?l=en-GB
- https://techcrunch.com/2026/04/15/ai-learning-app-gizmo-levels-up-with-13m-users-and-a-22m-investment/
- https://gizmo.ai/
- https://nibble-app.com/nibble-app-features
- https://techcrunch.com/2026/05/22/audio-generation-app-huxe-founded-by-former-notebooklm-developers-shuts-down/
- https://cdomagazine.tech/others/learnxyz-bags-3m-seed-funding-rolls-out-first-of-its-kind-ai-powered-social-learning-app-globally
- https://www.revisely.com/
- https://speechify.com/blog/speechify-2026-update-features-products-use-cases/
- https://hrtechedge.com/ai-in-hr/speechify-reintroduces-itself-as-a-voice-first-ai-assistant-and-takes-aim-at-chatgpt-gemini-and-copilot/
- https://techcrunch.com/2025/10/23/20-year-old-dropouts-built-ai-notetaker-turbo-ai-to-5-million-users/
- https://speedrun.a16z.com/companies/sun
- https://techcrunch.com/2024/12/10/openai-backed-speak-raises-78m-at-1b-valuation-to-help-users-learn-languages-by-talking-out-loud
- https://techcrunch.com/2024/05/22/praktika-raises-35-5m-to-use-ai-avatars-to-make-learning-languages-feel-more-natural
- https://techcrunch.com/2024/06/28/yc-alum-fluentlys-ai-powered-english-coach-attracts-2m-seed-round
