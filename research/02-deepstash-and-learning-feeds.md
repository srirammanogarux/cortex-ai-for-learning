# 02 — Deepstash and "social media replacement" learning feeds

Research date: 2026-11-18. Written for Cortex AI's planned revision feed: a vertical, Reels-style feed that remixes concepts from a user's own generated courses, uses variable rewards, and renders the same concept in about 10 formats.

**How to read this:**
- Every factual claim has a source link, and all links are listed at the end.
- **[unverified]** means the claim comes from a single secondary, competitor-written, AI-written, or marketing source that I couldn't confirm elsewhere.
- **[est.]** means a third-party tracker estimate. Different trackers often disagree by 10x or more.
- **Competitor-blog caveat:** many detailed "reviews" of these apps are published by rival apps, mainly Nibble's blog and Headway's blog. They are useful for feature lists, but they are biased. I flag them where they matter.

---

## TL;DR

1. **Deepstash is alive and growing in 2026, and the growth is paid.**
   - Android pulls about 103K installs a week (414K over 4 weeks), which AppGoblin flags as above-average growth [est.].
   - It has 4.6–4.7★ ratings across more than 330K store ratings.
   - In October 2025 it took $9M of performance-based user-acquisition financing.
   - The product has moved from user-generated "ideas from articles" toward curated book content: "5K+ books" and multi-slide "idea slides" per book.
   - There is no spaced repetition and no quizzes. Its main failure modes are shallow content, repetition when a user follows few topics, and billing anger.
2. **Every app in the category treats the feed as discovery. Almost none treat it as revision of what the user already studied.**
   - The closest things to Cortex's idea are Hivemind (type a topic, get an AI feed, plus spaced-repetition flashcards), ScrollEd (upload a PDF and get a feed: swipe up for a new topic, swipe sideways to go deeper, quiz at the end) and Coursera's Ollie (90-second lessons, each paired with a quiz, an AI chat and a follow-up lesson).
   - Duolingo, Quizlet, Blinkist and Brilliant have not shipped vertical feeds, as far as I could find.
   - "Revision feed of the courses you generated" is still an open position.
3. **ScrollEd and Netflix already use the "go deeper without scrolling away" pattern Cortex wants.**
   - ScrollEd: vertical swipe = next topic, horizontal swipe = deeper on this one, with a quiz at the end.
   - Netflix Clips (shipped April 2026, the successor to Fast Laughs): tap to watch the whole title, add to My List, or share.
4. **The evidence is a real warning.**
   - Pure short-video feeds raise engagement and preference. In matched experiments they *lower* memory: one study measured 43% vs 66% correct recall after fragmented clips vs one continuous video ([Wei et al., npj Sci. Learn., via PsyPost](https://www.psypost.org/brain-scans-reveal-how-short-videos-impair-memory-and-disrupt-neural-pathways/)).
   - Retrieval practice, spacing and (for similar concepts) interleaving are among the most robust findings in learning science.
   - So the feed should be a **retrieval-and-spacing engine dressed as a feed**, not a stream of mini-explainers.

---

## 1. Deepstash deep dive

### 1.1 What it is

- **Company:** Built by Brainstash Inc. (Romania). Founded in 2019 by Vladimir Oane, previously a founder of UberVu, which Hootsuite bought in 2014. Co-founders are Dan Ciotu and Cristian Mezei ([HowToWeb](https://www.howtoweb.co/speaker/vladimir-oane), [CB Insights](https://www.cbinsights.com/company/deepstash)).
- **Positioning today:** "Replace doomscrolling with microlearning. Learn from thousands of top nonfiction books in minutes a day." The website claims "10M+ downloads", "#1 Microlearning App Worldwide" and "5K+ books" ([deepstash.com](https://deepstash.com/)).
- **Store pitch:** "Stop Scrolling Social Media -> Download Deepstash -> Use it for 5 min/day -> Become the smartest person in the room." The listing claims "11 million+ people" ([App Store](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295)).
- **Earlier positioning (still visible on AlternativeTo):** an "escape the negativity of social media" app built on curated articles, focused on soft skills ([AlternativeTo](https://alternativeto.net/software/deepstash/about)).

### 1.2 Format: ideas, stashes, idea slides

- **Idea card.** A short, visual note that condenses one thought, paired with artwork. It is usually a bold headline plus 1–5 short lines with key phrases bolded ([App Store](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295)). Public topic pages show real examples, such as "The 'fish in water' effect" and "Environment shapes human behavior" ([deepstash.com/topic/psychology](https://deepstash.com/topic/psychology)).
- **Book → main ideas → "idea slides".** Book pages list 4–5 "Main Ideas", for example Atomic Habits: Tiny Changes, Big Results / You Fall to Your Systems / Identity Shapes Behavior / Your Brain Runs on Loops.
  - Each main idea is a multi-paragraph, story-driven sequence (the British Cycling anecdote, for instance), and the app continues it as "full idea slides" ([deepstash.com/book/…/atomic-habits](https://deepstash.com/book/291592/atomic-habits)).
  - This is a newer, more narrative format than the original single cards.
- **Stash.** A user-made collection of saved ideas. Users can "create stashes for work projects, personal growth goals", and search and filter them ([Google Play](https://play.google.com/store/apps/details?id=com.deepstash&hl=en_US)).
- **Sources:** "200,000+ powerful ideas from top books, articles, podcasts, and videos" ([App Store](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295)).
- **Audio:** "Listen & Grow" audio playback of ideas is a Pro feature (same source).

### 1.3 Feed mechanics and personalisation

- **Onboarding:** pick topics such as productivity, leadership, psychology or philosophy. "As you read and save ideas, we learn what resonates with you… We refresh your recommendations multiple times a day so you never run out of fresh ideas" ([App Store](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295)).
- **Ranking signals:** followed topics and saved cards. Reviewers compare it to "a music app tun[ing] your playlist" ([Nibble blog review, competitor](https://nibble-app.com/blog/deepstash-review)).
- **Explore tab:** lists trending ideas "but offers little structure" (same source).
- **Unlimited History (Pro):** "go back to everything you've read, organized by day" ([Google Play](https://play.google.com/store/apps/details?id=com.deepstash&hl=en_US)). A read log like this is what a resurfacing system would need, but Deepstash doesn't use it for review.
- **Habit loop:** streaks, upvotes and comments ([Nibble, competitor](https://nibble-app.com/blog/is-deepstash-worth-it)). The help center lists a "Reading Goal and Reading Streak" article, but its content couldn't be retrieved [unverified] ([Deepstash Help Center](https://deepstash.notion.site/Help-Center-e3fdf92e3ec64ebea90a1c0c56ebf3bc)).
- **Gamification pushback:** one AlternativeTo user called the level-up modal and sound "annoying" and said the app "should be less noisy" ([AlternativeTo](https://alternativeto.net/software/deepstash/about)).

### 1.4 Social and creator/UGC model

- **UGC exists but is no longer the headline.**
  - The free tier still includes "Create and share your own ideas" ([App Store](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295)).
  - Topic pages count "52.3k community ideas" in Psychology alone ([deepstash.com/topic/psychology](https://deepstash.com/topic/psychology)).
  - Similarweb describes ideas as "created by users just like you" ([Similarweb](https://www.similarweb.com/app/google/com.deepstash)).
- **Social layer:** follow other users and share stashes ([Nibble, competitor](https://nibble-app.com/blog/deepstash-review)). Users can share out to WhatsApp, Instagram, TikTok, LinkedIn and others ([Google Play](https://play.google.com/store/apps/details?id=com.deepstash&hl=en_US)).
- **The cost of UGC:** "Content quality varies since cards are user-curated" ([Nibble, competitor](https://nibble-app.com/blog/deepstash-review)).
- **Strategic shift:** the 2026 marketing is all about bestselling books, "5K+ books" and editorial collections such as "Wanted: Outlaw Reads", not UGC ([deepstash.com](https://deepstash.com/), [App Store](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295)). My read is that the UGC idea graph became a long-tail SEO and back-catalogue asset, and growth now comes from curated book content plus paid acquisition [interpretation].
- **No creator monetisation:** I found no evidence of a creator revenue-share or creator program.

### 1.5 Pricing

- **Free tier:** ad-supported, with ideas and limited saving ([App Store](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295)). Reviewers say daily reads and saves are capped [competitor source] ([Nibble](https://nibble-app.com/blog/is-deepstash-worth-it)).
- **Pro:** no ads, audio, offline downloads and unlimited history.
- **US App Store IAP price points:** yearly $69.99 / $89.99 / $99.99; monthly $12.99 / $19.99; 3-month $19.99 / $29.99 / $59.99 ([App Store](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295)). That spread suggests heavy price testing.
- **Trial:** "try-and-buy". You enter card details for a 7-day trial, and cancelling triggers aggressive retention offers ([AlternativeTo](https://alternativeto.net/software/deepstash/about)).

### 1.6 Scale

| Metric | Value | Source |
|---|---|---|
| Claimed users | "11 million+ people" (store), "10M+ downloads" (site) | [App Store](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295), [deepstash.com](https://deepstash.com/) |
| Android installs | 5M+ (Play badge); about 6.5M+ [est.] | [Google Play](https://play.google.com/store/apps/details?id=com.deepstash&hl=en_US), [AppGoblin Android](https://appgoblin.info/apps/com.deepstash) |
| iOS ratings | 4.67★ from 133K ratings | [AppGoblin iOS](https://appgoblin.info/apps/1445023295) |
| Android ratings | 4.57★ from 206K ratings | [AppGoblin Android](https://appgoblin.info/apps/com.deepstash) |
| Trustpilot | 4.5/5 from 2,413 reviews | [Trustpilot](https://www.trustpilot.com/review/deepstash.com) |
| MAU | about 438K iOS + about 226K Android [est.] | AppGoblin [iOS](https://appgoblin.info/apps/1445023295), [Android](https://appgoblin.info/apps/com.deepstash) |
| Revenue | $50K+/mo iOS [est., AppGoblin] vs $840K/mo [est., ScreensDesign]. The trackers disagree by more than 10x, so treat revenue as unknown. | [AppGoblin](https://appgoblin.info/apps/1445023295), [ScreensDesign](https://screensdesign.com/apps/deepstash-smarter-every-day/?vs=247018) |
| Funding | €3M seed (Connect Ventures, GapMinder, Cultivate); CB Insights total $11.71M over 4 rounds; plus $9M UA financing from PvX (Oct 2025) | [Romania Insider](https://www.romania-insider.com/content-aggregation-deepstash-financing), [CB Insights](https://www.cbinsights.com/company/deepstash/financials), [IT Brief](https://itbrief.co.uk/story/pvx-partners-backs-brainstash-with-9m-in-ua-financing-to-accelerate-global-growth-of-deepstash) |

Inconsistency to note: the October 2025 PvX press release says "over 3 million installs" ([IT Brief](https://itbrief.co.uk/story/pvx-partners-backs-brainstash-with-9m-in-ua-financing-to-accelerate-global-growth-of-deepstash)), while the store pages say "11 million+ people". Both are marketing numbers.

### 1.7 Is it still growing in 2026?

Yes, and the growth looks driven by paid acquisition. The evidence:

- **Android installs:** about 103K installs this week and 414K over 4 weeks, flagged as "above average growth" [est.] ([AppGoblin Android](https://appgoblin.info/apps/com.deepstash)).
- **Rating velocity:** about 3K new iOS ratings and 2.7K Android ratings per week [est.]. For comparison, Imprint gets about 748/week and Headway about 33/week on iOS ([AppGoblin](https://appgoblin.info/apps/1445023295), [Imprint](https://appgoblin.info/apps/1482780647), [Headway](https://appgoblin.info/apps/1457185832)).
- **Active development:** store updated 16 Nov 2026 ([Google Play](https://play.google.com/store/apps/details?id=com.deepstash&hl=en_US)). The latest iOS release notes say "Deepstash just got a fresh new look!" ([App Store](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295)).
- **Paid acquisition:** $9M of user-acquisition financing that is repaid from cohort revenue (Oct 2025) ([IT Brief](https://itbrief.co.uk/story/pvx-partners-backs-brainstash-with-9m-in-ua-financing-to-accelerate-global-growth-of-deepstash)). That only works if paid cohorts pay back.
- **Video ads:** a recent Play review mentions persistent video ads ("the coyote looking guy and woman talking") and says the app is "not as interesting as the ads were" ([Google Play](https://play.google.com/store/apps/details?id=com.deepstash&hl=en_US)).

### 1.8 What reviewers like and dislike

**Likes:**
- Fits into short gaps and "helped me get off social media" ([App Store testimonial](https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295)).
- Clean, visual card design that is easy to swipe one-handed ([Nibble, competitor](https://nibble-app.com/blog/is-deepstash-worth-it)).
- Topic breadth ([Trustpilot summary](https://www.trustpilot.com/review/deepstash.com)).
- Good for talking points.

**Dislikes:**
- **Billing:** charges after trials, missing reminders, refund refusals. This is the #1 negative theme ([Trustpilot](https://www.trustpilot.com/review/deepstash.com); [Play review, 634 "helpful" votes](https://play.google.com/store/apps/details?id=com.deepstash&hl=en_US)).
- **Shallow content:** "Cards give you the 'what,' but rarely the 'how'"; "stronger on inspiration than on retention" ([Nibble, competitor](https://nibble-app.com/blog/is-deepstash-worth-it)). Also: "Just a list of quotes… any A.I. could choose" ([Trustpilot](https://www.trustpilot.com/review/deepstash.com)).
- **No recall system:** "no dedicated spaced repetition or retrieval practice" ([Nibble, competitor](https://nibble-app.com/blog/is-deepstash-worth-it)).
- **Repetition:** "Interesting ideas but sometimes repetitive". With only 1–2 followed categories, "the daily feed can start repeating the same themes" ([Trustpilot via search](https://www.trustpilot.com/review/deepstash.com), [Nibble](https://nibble-app.com/blog/deepstash-review)).
- **Ads vs product gap:** "In the ads its more like I can replace insta with this but this is not the case… would've given 5 stars if it was more of a Instagramable app" ([Trustpilot](https://www.trustpilot.com/review/deepstash.com)).
- **Noisy gamification:** see 1.3 ([AlternativeTo](https://alternativeto.net/software/deepstash/about)).

### 1.9 How Deepstash fights repetition and boredom

- **Corpus size:** 200K+ ideas, plus community ideas (52.3K in Psychology alone).
- **Refresh:** recommendations refresh "multiple times a day".
- **Editorial variety:** themed collections such as "Wanted: Outlaw Reads".
- **Art:** a unique artwork per idea.
- **Format variety:** single cards, book "idea slides" and audio.

All of these are **content-volume** strategies. None is a **format-variety-per-concept** or **scheduling** strategy. Deepstash never deliberately re-shows a concept, so its "repetition" is accidental (the same theme from different cards) rather than designed spaced review. Cortex's corpus is the opposite: small and personal. Cortex can't win on volume, so it has to win on formats and scheduling.

---

## 2. Comparison table: feed-style learning apps

Legend for "Order": **Algo** = engagement/interest ranked; **Topic** = user picks; **Random** = no personalisation; **SRS** = spaced-repetition scheduling; **Path** = linear course.

| App | Positioning | Core format | Order | Active recall in feed? | "Go deeper" affordance | Monetisation | Traction signal | Top complaints |
|---|---|---|---|---|---|---|---|---|
| **Deepstash** | Replace doomscrolling with book ideas | Idea cards, book "idea slides", audio | Algo + Topic | No | Card → book page / slides; save to stash | Freemium + ads; Pro $69.99–99.99/yr | 4.6–4.7★, about 340K ratings; about 100K Android installs/week [est.] | Billing, shallow, repetitive |
| **Imprint** (Polywise) | "Learn visually" | Tap-forward animated story cards, courses, book guides | Path + goals | Yes: in-lesson checks + daily quizzes | Lesson → course chapters | Hard trial; about $99.99/yr, $15.99/mo [competitor source] | 4.74★, 90K iOS ratings | Thin depth, small library, upsell |
| **Headway** | #1 book-summary app, self-growth | 15-min summaries, daily tap-through microlearning, challenges | Personalised by goals | Spaced-repetition flashcards (opt-in) | Daily card → full summary | Trial → subscription | Claims 50M+ users; 4.53★, 221K iOS ratings | Thin AI summaries, AI narration [aggregator] |
| **Blinkist** | 15-min book summaries | Text + audio "Blinks"; Pro adds AI summaries of your own uploads [unverified] | Library / Topic | Minimal (highlighting) | n/a | Premium about $99.99/yr | 43M users claimed; bought back from Go1 Apr 2026 | Price; AI substitution risk |
| **Nibble** | All-round curiosity; anti-doomscroll | Interactive lessons, videos, audio, 5 game types, AI chats with historical figures | "For You" by onboarding interests | Yes: quizzes and games per topic | Lesson ↔ other formats of same topic | Subscription about $49.99–89.99/yr | 680+ content items; small revenue [est.] | Mostly self-published reviews; no independent data |
| **Uptime** | 5-min "knowledge hacks" | Card summaries of books, courses, docs | Topic | Limited | n/a | Freemium | $16M seed (2021); recent revenue <$5K/mo [est.] | Looks dormant |
| **Kinnu** | Spaced-repetition microlearning | Tiles → "Orbs" (short reading + MCQ) | Path + SRS | Yes, SRS reviews | Pathways | Subscription | n/a | n/a |
| **Readwise** (pattern ref) | Resurface your highlights | Finite Daily Review deck + "Bonus Highlight" | SRS (recall half-life) + frequency tuning | Optional Q&A "Mastery" cards | Card → source doc | Subscription | n/a | n/a |
| **Duolingo** | Language and more | Path lessons; no vertical feed found | Path + SRS | Everything is recall | n/a | Freemium + Super | Streak research (below) | n/a |
| **Quizlet** | Study sets | Flashcards; 2026: Spaced Repetition, "Charms" game, ChatGPT app; bought Coconote | SRS | Yes | n/a | Freemium + Plus | n/a | No feed shipped |
| **Brilliant** | Learn by doing (STEM) | Interactive problem lessons; daily problems | Path | Yes, every screen | n/a | About $149.88/yr [competitor source] | "Millions of problem tries every day" | Billing [aggregator] |
| **Elevate** | Brain training | 40+ games, daily workouts | Personalised workout | Games | n/a | Subscription | 4.74★, 879K ratings | Not a feed |
| **Coursera Ollie** | "Coursera built from scratch today" | 90-sec clips + AI explainers, each with quiz + AI chat + follow-up lesson | Algo on interests, watches, skips, quiz performance | **Yes, every video** | Follow-up lesson; AI conversation | Included in Coursera Plus | Beta; "replaced doomscrolling" anecdotes | Unknown (beta) |
| **Oboe** | AI course on anything | Prompt → course: text+visuals, 2 audio formats, games, quizzes, flashcards | Course chapters | Yes, in course | Planned "go deeper" rec engine | Free create; paid exports/limits; $16M Series A (a16z) | n/a | n/a |
| **ScrollEd** | "Textbook → TikTok" | AI video, audio, text, quizzes from your PDF | Vertical = new topic | **Quiz at end of each deep-dive** | **Swipe sideways = deeper** | Free + Pro (about $6.99/mo [unverified]) + institutional | Launched at TC Disrupt Oct 2026 | No outcome data yet |
| **Hivemind** | "AI social media for learning" | Type a topic → feed of memes, micro-lessons, quizzes; podcast/PDF → posts | Per-topic feeds + blended "Main Feed" | Yes: SRS flashcards, mini-tests, "Feynman Mode" | Topic feed | Subscription only, $8.99–21.99/mo, credits | Small [no data] | n/a |
| **Studii** | "Doomscroll & learn" | 2-min AI video micro-lessons; Brainrot vs Study mode | Swipe + Explore | Quiz section recently added | Mini-courses | Free | Tiny [no data] | n/a |
| **Doomersion** (YC W26) | TikTok for language learners | Level-matched native videos + tappable subtitles → flashcards | Comprehensible-input level + passive SRS [unverified] | Word capture → SRS | Tap word | Freemium subscription | 15K downloads in 2 weeks [unverified, AI-written analysis] | n/a |
| **Keet** (YC S24) | Video course on anything | Roadmap of short explainer videos (Remotion/Manim) + games (MCQ, swipe, order, connections) | Path | Yes, after each video | Roadmap | Credit subscription (planned) | Private TestFlight beta | n/a |
| **WikiTok** | Wikipedia as a feed | Full-screen image + excerpt | **Random (anti-algorithm)** | No | "Read More" → full article | Free, open source | Viral Feb 2025; no usage data | No personalisation by design |
| **TikTok STEM feed** | STEM tab beside For You | Creator short video | Algo; fact-checked by Poynter | No | Creator profile | Ads (TikTok) | 25% of teens weekly (global); default-on in US/UK/IE/CA | n/a |
| **YouTube Shorts / Courses** | Shorts as funnel to long-form | Short video + "related video" link; Courses with quizzes | Algo | Courses have quizzes | Shorts → related long video | Ads; paid Courses | n/a | Low Shorts RPM |
| **Instagram carousels** | Format, not an app | 2–20 swipeable slides | Algo | Polls / "save" | Swipe sideways within a post | n/a | Carousels: most saves and highest engagement per reach in several benchmarks | n/a |
| **Netflix Clips** (inspiration) | Discovery feed for long-form titles | 30s–1min clips | Algo | n/a | **Tap → whole title / My List / share** | Subscription | Shipped Apr 30 2026 | n/a |

Sources for each row are in the per-app notes below.

---

## 3. Per-app notes

### 3.1 Book-summary and microlearning incumbents

**Imprint (Polywise)**
- **Format:** "visual micro learning". Chapters take "two minutes or less", with "challenging daily quizzes" and saved insights ([App Store](https://apps.apple.com/us/app/imprint-visual-micro-learning/id1482780647)).
- **Teardown highlights** ([ScreensDesign](https://screensdesign.com/showcase/imprint-learn-visually)):
  - 25-step onboarding quiz that turns interests into goals ("Build leadership skills") before a soft paywall.
  - Tap-forward animated story lessons.
  - Key cards **auto-saved** into a review deck ("Card Saved" toast).
  - Knowledge checks embedded in the lesson flow.
  - Invite-a-friend 7-day guest pass.
- **Scale:** 4.74★ from 90K iOS ratings [est.] ([AppGoblin](https://appgoblin.info/apps/1482780647)). ScreensDesign estimates about $400K/month revenue [est.].
- **Complaints:** content can feel like "scrolling attractive graphics than deep learning"; small library; upsell pressure; about $99.99/yr [competitor sources] ([Nibble Imprint review](https://nibble-app.com/blog/imprint-review)).
- **What to steal:** auto-save into a review deck, and goal-framed onboarding.

**Headway (GTHW App Ltd / Headway Inc.)**
- **Features:** "1700+ book summaries", a "Daily microlearning session — tapping through a portion of bite-sized ideas", self-growth challenges, a **Spaced Repetition feature** that turns favourite insights (or unknown English words) into flashcards, and lock-screen widgets ([App Store](https://apps.apple.com/us/app/headway-daily-micro-learning/id1457185832)).
- **Scale:** claims 50M+ users ([App Store](https://apps.apple.com/us/app/headway-daily-micro-learning/id1457185832)); 4.53★ from 221K iOS ratings [est.] ([AppGoblin](https://appgoblin.info/apps/1457185832)). The company says it has 500+ staff ([makeheadway.com](https://makeheadway.com/blog/is-headway-legit/), self-published).
- **Complaints:** thin AI summaries and AI-sounding narration [aggregator] ([AppTail](https://apptail.io/app/headway-daily-micro-learning-crr/norway)).
- **What to steal:** widgets as a passive resurfacing channel. A concept on the lock screen is a feed card without opening the app.

**Blinkist**
- **Ownership:** founders Holger Seim and Tobias Balling bought Blinkist back from Go1 in April 2026. Go1 had bought it in 2023 for about €200M ([Blinkist Magazine](https://www.blinkist.com/magazine/posts/ein-neues-kapitel-schreiben-holger-seim-firmen-rueckkauf-interviewformat-v1)).
- **Scale (company-stated):** 43M users, about 10K titles, 27 categories, 30 new titles/month (same source).
- **AI and feed:** a Pro tier with AI summaries of user uploads (PDFs, YouTube, podcasts) and an AI discovery feed are reported only by review blogs [unverified] ([Nibble Blinkist cost](https://nibble-app.com/blog/blinkist-cost)).
- **Takeaway:** even the category leader is reframing around "AI can summarise anything". The summary format alone is commoditised.

**Uptime**
- **History:** "5-minute knowledge hacks" from books, courses and documentaries; raised a $16M seed in 2021 ([TechCrunch](https://techcrunch.com/2021/02/10/uptime)).
- **Now:** ScreensDesign lists it at under $5K/month revenue and under 5K installs [est.] ([ScreensDesign](https://screensdesign.com/apps/deepstash-smarter-every-day/?vs=247018)). Effectively dormant, a cautionary tale for well-funded summary apps without a retention mechanic.

**Nibble (Kremital Ltd)**
- **Format:** 35+ topics and 680+ content items in five formats: interactive lessons, short animated videos, about 10-min audio, games ("Complete the Picture, Build Up, This or That, Trivia Quiz, Match the Pairs") and an AI tutor that chats as historical figures.
- **Feed:** a personalised "For You" feed built from onboarding interests, which users can edit. Users "re-read favorite topics in a different format to reinforce" ([Nibble features](https://nibble-app.com/nibble-app-features)).
- **Size:** ScreensDesign estimates about $94K/month revenue [est.] ([ScreensDesign](https://screensdesign.com/apps/deepstash-smarter-every-day/?vs=247018)).
- **Note:** Nibble runs an aggressive SEO content farm reviewing every competitor. It is the source of many "reviews" in this space.
- **What to steal:** the game-type names are a ready-made list of quiz-card formats, and "same topic, different format" is already the stated reinforcement strategy.

**Clone tier.** ScreensDesign's "similar apps" list shows how crowded the daily-microlearning market is: SmartyMe, Yuno, MyGrowth, Wiser, GenK, BeFreed, 12min, Bookey, LeapAhead, "Micro Learning Daily – Sparkle" and more ([ScreensDesign](https://screensdesign.com/apps/deepstash-smarter-every-day/?vs=247018)). "Sparkle" from the brief appears to be this small app (under $5K/month [est.]).

### 3.2 Active-learning incumbents (no vertical feed found)

**Duolingo**
- **No feed:** I found no vertical-video or scroll feed in 2025–2026 ([search summary; Duolingo blog](https://blog.duolingo.com/new-duolingo-features/)).
- **Streak data (relevant):**
  - Streak Wager A/B test: Day-7 retention **+14%**.
  - Weekend Amulet (streak freeze): learners were 4% more likely to return a week later and 5% less likely to lose their streak.
  - "Learners who binge on Duolingo lessons were much more likely to abandon the app than learners who pace themselves" ([Duolingo blog](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)).
- **Spaced-repetition model:** Duolingo's half-life regression model is the published reference for "predict when a learner will forget" ([Settles & Meeder 2016, ACL](https://aclanthology.org/P16-1174/)).

**Quizlet**
- **2026 moves:**
  - A conversational AI study experience and the acquisition of Coconote, which turns recordings into notes, quizzes and podcasts (Feb) ([THE Journal](https://thejournal.com/Articles/2026/02/13/Quizlet-Adds-AI-Powered-Tools-for-Active-Practice-Notetaking.aspx), [Pulse2](https://pulse2.com/quizlet-acquires-coconote-and-adds-new-ai-study-experience)).
  - A native ChatGPT app (Mar) ([StreetInsider/PRN](https://www.streetinsider.com/PRNewswire/Quizlet+Launches+as+Native+App+in+ChatGPT+to+Transform+AI-Powered+Learning/26142955.html)).
  - Spaced Repetition scheduling and the "Charms" puzzle game (Aug) [search summary, not opened].
- **No feed:** none found. Quizlet is betting on spaced repetition plus AI generation, not scroll.

**Brilliant**
- **Format:** interactive problem-based lessons. The free tier has rotating daily problems ([Nibble, competitor](https://nibble-app.com/blog/is-brilliant-worth-it)). The company says it gets "millions of problem tries every day" ([brilliant.org/about](https://brilliant.org/about/)).
- **No feed:** none found.
- **Relevant pattern:** every screen is a problem, never passive.

**Elevate**
- **Format:** 40+ brain games, personalised daily workouts of 3–5 games, adaptive difficulty, streak calendar ([App Store](https://apps.apple.com/us/app/elevate-brain-training-games/id875063456)).
- **Scale:** 4.74★ from 879K ratings [est.] ([AppGoblin](https://appgoblin.info/apps/875063456)).
- **Fit:** not a feed. The relevant pattern is a **finite daily workout** of a few varied mini-formats.

### 3.3 Incumbents that *did* ship a learning feed

**Coursera feed → "Ollie"**
- **Launch:** June 2026, an AI-curated scrollable feed of short videos personalised by "interests, learning habits, career goals, and previous course activity". Framed as an **entry point** into full courses ([Digital Trends](https://www.digitaltrends.com/cool-tech/coursera-wants-users-to-learn-through-shorter-faster-content/)).
- **Ollie** (standalone app, Coursera Plus only, beta) ([Business Today](https://www.businesstoday.in/technology/artificial-intelligence/story/courseras-ollie-borrows-social-medias-playbook-and-even-replaced-its-ctos-tiktok-habit-542816-2026-07-14)):
  - 90-second lessons, plus AI-generated lessons on new topics.
  - "Every video in Ollie is paired with quizzes, AI conversations and follow-up lessons."
  - Streaks, leaderboards and endless scroll.
  - Personalisation from onboarding interests, then "what they watch, what they skip and how they perform on quizzes".
  - Quality control: "LLM as a judge" plus a human teaching team.
- **CTO quote:** "short-form video with practice leads to learning… If you have a really long video, you're likely going to lose attention." He also calls Ollie a first step "for Coursera and Udemy as a combined company" (same source).
- **Takeaway:** this is the closest incumbent analogue to Cortex's feed, and it validates "quiz paired with every clip" and "quiz performance as a ranking signal".

**TikTok STEM feed**
- **Launch:** US in March 2023, Europe in 2024.
- **Scale:** "globally, 25% of teens visit the STEM feed on a weekly basis". It is now default-on for all users in the UK, Ireland, US and Canada. STEM content grew 35% globally since launch ([TikTok Newsroom](https://newsroom.tiktok.com/tiktok-stem-feed-now-available-to-all-users-by-default?lang=en-GB)).
- **Quality:** content is screened by Common Sense Networks and fact-checked by Poynter ([search summary of TikTok/press](https://www.tubefilter.com/2024/10/24/tiktok-stem-feed-adults-science-technology-engineering-math/)).
- **Early results:** about 30% lift in STEM hashtag views ([Tubefilter 2023](https://www.tubefilter.com/2023/06/30/tiktok-stem-feed-science-kat-voltage-chem-teacher-phil/)).
- **Gap:** no recall layer.

**YouTube Shorts + Courses**
- **Related-video link:** creators can attach a persistent "related video" link from a Short to a long video [secondhand] ([search summary](https://recapio.com/digest/youtubes-new-changes-are-huge-by-lmg-clips)).
- **Courses:** packages of videos with a badge, a channel tab and **quizzes linked to videos** ([PhoneArena](https://www.phonearena.com/news/youtube-expands-courses-feature-to-more-of-its-creators-rolling-out-gradually_id161949)).
- **Pattern:** Shorts are the hook and long-form is the depth. This is the same funnel as Netflix Clips.

**Netflix Clips (the team's "Fast Laughs" reference)**
- **Launch:** shipped April 30, 2026 in a mobile redesign with a bottom-nav "Clips" tab. "Watch a continuous stream of short clips from popular shows, movies, and podcasts… **Tap to watch the whole title, add it to My List, or share**" ([Netflix Help](https://help.netflix.com/en/node/575087423404644)).
- **Clip length:** 30s to over a minute [secondary] ([search summary](https://www.republicworld.com/tech/netflix-rolls-out-clips-feature-on-mobile-to-make-finding-shows-easier)).
- **Origins:** tested from May 2025 ([TechCrunch](https://techcrunch.com/2025/05/07/netflix-is-getting-into-short-videos-with-a-new-vertical-feed-for-mobile)) and announced as "deeper integration" in January 2026 ([Engadget](https://www.engadget.com/entertainment/streaming/netflix-mobile-app-redesign-will-offer-deeper-integration-of-vertical-video-120000820.html)).
- **Note:** Fast Laughs has effectively been absorbed into Clips. The "feed as a door into the long-form object" pattern maps directly to "feed card → open the lesson in my course".

**Disney+ "Verts"**: also a vertical discovery feed ([NewsBytes](https://www.newsbytesapp.com/news/science/disney-is-rolling-out-verts-a-tiktok-like-short-form-video-feed/story)).

### 3.4 AI-native course and feed generators

**Oboe** (Anchor co-founders)
- **Launch:** September 2025. Prompt → course, initially in 9 formats: text and visuals, two audio formats (lecture and two-host podcast), games and tests. Built on a parallel multi-agent generation pipeline that pulls in real images. "Working on a recommendation engine that will help you continually go deeper" ([TechCrunch](https://techcrunch.com/2025/09/10/after-selling-to-spotify-anchors-co-founders-are-back-with-oboe-an-ai-powered-app-for-learning/)).
- **January 2026 redesign + $16M Series A (a16z):**
  - "over two-thirds of prompts… are goal-oriented"; courses are now chapters you can consume as text or podcast.
  - Quizzes, flashcards and visuals are embedded in courses.
  - Unlimited free course creation; non-subscribers get limited chapters ([ETIH](https://www.edtechinnovationhub.com/news/oboe-rolls-out-major-platform-update-alongside-16-million-series-a)).
- **No feed:** I found no evidence of a scroll feed. The "go deeper on a card" behaviour the team cited is the course or deep-dive view, not a feed [interpretation].

**ScrollEd**
- **Launch:** Palo Alto, bootstrapped by Stanford/Penn students; launched consumer at TechCrunch Disrupt (Oct 13–15, 2026).
- **Mechanics:** "As you scroll, the content shows up as AI-generated video, audio, text, or even interactive quizzes. **Swiping up surfaces a new topic, while swiping sideways lets you go deeper into the one you're on, with a quiz waiting for you at the end.**"
- **Founder quote:** "We wanted going deeper to be as easy as moving to the next video." They say they "choose not to maximize engagement."
- **Business:** freemium, Pro and institutional licences that come with engagement and progress reports ([TechCrunch](https://techcrunch.com/2026/09/20/scrolled-wants-to-turn-textbooks-into-tiktok/)). A $6.99/mo price is reported only secondarily [unverified] ([RuntimeWire](https://runtimewire.com/article/scrolled-turns-textbooks-into-swipeable-learning-feed)).
- **Takeaway:** this is the most direct UX precedent for Cortex.

**Hivemind: Study by Scrolling** (Aether Technologies, Germany) ([App Store](https://apps.apple.com/us/app/hivemind-study-by-scrolling/id6737344456)):
- "AI Study Feeds": type a topic and get a feed of "memes, exercises, examples and quick takes".
- A blended "Main Feed" across all topics.
- Podcast, PDF and web pages converted into posts.
- "Spaced-repetition flashcards and mini-tests"; "Feynman Mode" (teach the AI).
- The feed now pulls new research papers and news on your topics.
- Subscription only (Starter $8.99/mo up to Premium $179.99/yr, plus credit packs).
- **Takeaway:** feature-for-feature the closest to Cortex's vision (generated topic → feed + spaced repetition + blended feed). No traction data found.

**Studii**
- Every topic becomes "a 2-minute AI-generated micro-lesson you learn by swiping". The **dual modes** are "Brainrot Mode for fast, high-energy, dopamine-heavy lessons" and "Study Mode for calm, focused" learning.
- Progress tracking and streaks; latest release adds a quiz section ([App Store](https://apps.apple.com/ca/app/studii-doomscroll-learn/id6755154363)).
- **Takeaway:** the mode toggle is a cheap way to serve both tastes.

**Keet** (YC S24)
- Topic → roadmap of short explainer videos rendered with **Remotion + Manim (not generative video)**, each followed by games (MCQ, swipe, order, connections). Depth and narration are adjustable. Private iOS beta (Aug 2026) with planned credit pricing ([Kompozy](https://kompozy.io/news/keet-yc-video-course-app-launch)).
- **Takeaway:** directly relevant to Cortex's vector/SVG approach. Programmatic animation keeps cost and consistency under control.

**Doomersion** (YC W26)
- TikTok-style feed of level-matched target-language videos; tap a word to capture it into flashcards.
- The algorithm reportedly balances comprehensibility, engagement, novelty and spaced re-exposure. Claimed 15K downloads in 2 weeks.
- **[unverified]:** source is an AI-written analysis piece ([StartupHub "Claude's Corner"](https://www.startuphub.ai/ai-news/claudes-corner/2026/claudes-corner-doomersion-yc-w2026.md)).

**Long tail of "scroll-to-study" launches.** All show low traction where visible (1–2 HN points):
- Brainjuice ([MWM](https://mwm.ai/apps/brainjuice-scroll-to-study/6759610120)), BrainBeats ([App Store](https://apps.apple.com/us/app/-/id6742924412)), SmartScroll ([AppsHunter](https://appshunter.io/ios/app/smartscroll-quit-doomscroll/id6740744254)), BrainScroller ([HN](https://news.ycombinator.com/item?id=46037005)), Million Whys ([HN](https://news.ycombinator.com/item?id=46912413)), ScrollMind ([HN](https://news.ycombinator.com/item?id=46512544)), CogniScroll (about 300 cards, XP, streaks, rarity-tiered "drops") ([AlternativeTo](https://alternativeto.net/software/cogniscroll/about)), Fenne video overviews ([App Store](https://apps.apple.com/us/app/fenne-learn-anything-fast/id6746964450)), Mindrot ([TrendHunter](https://www.trendhunter.com/trends/mindrot)), Brainrot AI ([Product Hunt](https://www.producthunt.com/products/brainrot-ai/launches)), LangFlick and LingoDrip (language) ([HN](https://news.ycombinator.com/item?id=44178383), [HN](https://news.ycombinator.com/item?id=46793534)).
- Revyze (France, 2024) is a "TikTok for education" that borrows from Duolingo ([TechCrunch, title only](https://techcrunch.com/2024/10/07/revyze-a-tiktok-for-education-startup-draws-on-duolingo-to-add-bite-sized-learning-too/)).
- **"Atoms", "Dex", "Lumi", "Fable":** I found no learning-feed products under these names [not found].

### 3.5 Open, non-personalised feeds

**WikiTok**
- Built in about 2 hours (Feb 2025) by Isaac Gemal after a tweet by Tyler Angert. Random Wikipedia articles appear as full-screen image plus excerpt, with "Read More" opening the full article. Translates into 14 languages, open source.
- **Deliberately "anti-algorithm":** "we're already ruled by ruthless, opaque algorithms… why can't we just have one little corner… without them?" ([Tubefilter](https://www.tubefilter.com/2025/02/11/wikitok-tiktok-wikipedia-scrolling-learning-project-isaac-gemal/), [PC Gamer](https://pcgamer.com/hardware/give-your-wikipedia-rabbit-hole-deep-dives-a-dollop-of-dopamine-by-reading-them-in-an-anti-algorithm-tiktok-style-feed)).
- **Proof point:** with a corpus of millions, pure randomness alone produces novelty. Cortex's personal corpus is small, so randomness alone will repeat fast.

**Instagram educational carousels (format)**
- **Benchmarks:** carousels have the highest average engagement (0.55% vs Reels 0.50%, images 0.45%) ([Socialinsider 2025](https://www.socialinsider.io/data-geeks/instagram_benchmarks_2025.pdf)). Buffer finds a 6.9% median engagement-by-reach for carousels vs 3.3% for Reels, while Reels win on reach ([Buffer](https://buffer.com/resources/data-best-content-format-social-media/)).
- **Saves:** Metricool reports that carousels generate 9x more saves than single images [secondary].
- **Takeaway:** a horizontal multi-slide card inside a vertical feed is a proven "go deeper / save for later" format. It is exactly what ScrollEd's sideways swipe and Deepstash's "idea slides" are.

---

## 4. Feed design patterns worth stealing

### 4.1 Navigation grammar: vertical = breadth, horizontal = depth
- **ScrollEd:** swipe up for a new topic, sideways to go deeper, quiz at the end of the sideways sequence ([TechCrunch](https://techcrunch.com/2026/09/20/scrolled-wants-to-turn-textbooks-into-tiktok/)).
- **Instagram carousels and Deepstash "idea slides":** horizontal multi-slide depth inside a vertical feed.
- **Netflix Clips:** tap → full title / My List / share. One primary "commit" action, one "later" action, one social action ([Netflix Help](https://help.netflix.com/en/node/575087423404644)).
- **WikiTok:** "Read More" → full source ([Tubefilter](https://www.tubefilter.com/2025/02/11/wikitok-tiktok-wikipedia-scrolling-learning-project-isaac-gemal/)).
- **YouTube Shorts:** related-video link → long-form ([secondhand](https://recapio.com/digest/youtubes-new-changes-are-huge-by-lmg-clips)).
- **For Cortex:** vertical swipe = next concept; horizontal swipe = more formats of *this* concept (analogy → diagram → worked example → quiz); a pinned "Open in course" chip = Netflix "watch the whole title"; a bookmark = "My List".

### 4.2 Card types seen across the category
- **Idea / headline card:** title + 1–5 lines + art (Deepstash).
- **Story sequence:** tap-forward animated slides (Imprint; Deepstash book slides; Headway daily session).
- **Short explainer video:** Ollie, Studii, Keet (programmatic animation), ScrollEd.
- **Audio card:** Deepstash Pro "Listen", Oboe podcast, Nibble audio.
- **Quiz cards:** MCQ, true/false, "This or That", match pairs, complete the picture, order/sequence, connections, trivia (Nibble, Keet, Imprint).
- **Meme / quick take:** Hivemind.
- **Teach-back:** Hivemind "Feynman Mode".
- **Persona chat:** Nibble historical figures; Ollie AI conversation.
- **Lock-screen widget card:** Headway.
- **Rarity "drop" card:** CogniScroll.

### 4.3 Active recall inside the feed
- **Paired recall:** Ollie pairs *every* clip with a quiz ([Business Today](https://www.businesstoday.in/technology/artificial-intelligence/story/courseras-ollie-borrows-social-medias-playbook-and-even-replaced-its-ctos-tiktok-habit-542816-2026-07-14)).
- **Recall at the end of depth:** ScrollEd puts the quiz at the end of the deep-dive.
- **Lesson-embedded checks:** Imprint embeds checks in lessons and runs daily quizzes.
- **Quiz as signal:** Ollie uses quiz performance as a ranking signal.
- **Gap:** Deepstash, WikiTok and TikTok STEM have no recall at all. This is the biggest gap reviewers name.

### 4.4 Spaced repetition inside a feed
- **Readwise Daily Review** ([Readwise docs](https://docs.readwise.io/readwise/docs/faqs/reviewing-highlights)):
  - A **finite** daily deck.
  - "Each time a highlight is shown, its probability of resurfacing is significantly decreased."
  - Mastery cards use a recall-probability **half-life** (initial 7/14/28 days for soon/later/someday). Cards at 50% or lower predicted recall become candidates, and the lowest-recall cards resurface first.
  - Per-source "Frequency Tuning".
  - A "Bonus Highlight" slot at the end that is either a recommendation or a tip.
- **Duolingo half-life regression:** the trainable model behind "when will this learner forget this item" ([Settles & Meeder 2016](https://aclanthology.org/P16-1174/)).
- **Headway, Hivemind, Kinnu, Quizlet:** all bolt spaced repetition on as a separate flashcard mode, not woven into the main feed. Doomersion reportedly weaves re-exposure into the feed itself [unverified].

### 4.5 Avoiding "the same reel twice"
- **Volume strategy** (Deepstash: 200K+ ideas; WikiTok: all of Wikipedia). This doesn't work for a personal corpus.
- **Refresh cadence:** "refresh your recommendations multiple times a day" (Deepstash).
- **Decay on exposure:** Readwise drops resurfacing probability each time an item is shown.
- **Same concept, different format:** Nibble users "re-read favorite topics in a different format to reinforce" ([Nibble](https://nibble-app.com/nibble-app-features)). Oboe: "People learn best when they can immerse themselves in different forms of the same material" ([ETIH](https://www.edtechinnovationhub.com/news/oboe-rolls-out-major-platform-update-alongside-16-million-series-a)).
- **Evidence for format rotation:** a meta-analysis of 192 transfer effect sizes found transfer is greatest **across test formats** and to application/inference questions ([Pan & Rickard 2018](https://sc-pan.github.io/pdf/PR_2018.pdf)). A TES summary of 2015 work reports that students wrongly believed they retained more when asked the *same* question repeatedly ([TES](https://www.tes.com/magazine/teaching-learning/general/what-is-variable-retrieval-practice)).

### 4.6 Variable reward and novelty
- **Surprise slots:** Readwise "Bonus Highlight" at the end of a finite deck; CogniScroll rarity-tiered "drops" ([AlternativeTo](https://alternativeto.net/software/cogniscroll/about)).
- **Mode toggle:** Studii's Brainrot vs Study mode.
- **Persona chats:** Nibble.
- **Editorial themes:** Deepstash "Wanted: Outlaw Reads".
- **Restraint matters:** Deepstash's level-up modal and sound annoyed users ([AlternativeTo](https://alternativeto.net/software/deepstash/about)). Nibble's own guide warns that "too many rewards or notifications can turn learning into another attention trap" ([Nibble](https://nibble-app.com/blog/educational-scrolling-apps)).

### 4.7 Streaks and habit
- **Streak results:** Duolingo's Streak Wager gave +14% Day-7 retention. Its streak-freeze-style "Weekend Amulet" gave +4% week-later return. **Pacing beats bingeing** for retention ([Duolingo blog](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)).
- **Prevalence:** nearly every app here has streaks. They are table stakes, not a differentiator.

### 4.8 Onboarding and cold start
- **Interest pickers:** Deepstash, Nibble and Ollie use topic pickers. Imprint uses a 25-step goal quiz before the paywall ([ScreensDesign](https://screensdesign.com/showcase/imprint-learn-visually)). Ollie starts from interests, then learns from watches, skips and quiz scores.
- **Cortex is different:** the user's generated courses *are* the interest signal. The real cold-start problem is **a small concept pool**: after one course with about 15 concepts, a random feed repeats within minutes. This is exactly Deepstash's "one or two categories → repetition" failure, at much smaller scale.

### 4.9 Save, collect, own
- **Deepstash stashes** (manual collections) and **Imprint auto-save** ("Card Saved") into a review deck.
- **Netflix "My List"** from the clip.
- Saved items become the spaced-repetition queue (Headway, Readwise).

### 4.10 Monetisation norms
- **Model:** almost all are trial → annual subscription, with $50–100/yr typical (Deepstash, Imprint, Headway, Nibble, Blinkist). Coursera bundles Ollie into Plus. AI generators use credits (Hivemind, Keet; Oboe has paid tiers).
- **Billing is the #1 complaint category** across Deepstash, Headway and Imprint reviews (sources above).

---

## 5. Evidence: do learning feeds produce retention or just engagement?

**Short answer:** feeds reliably raise engagement. Passive short-form *explainers* show no retention advantage and sometimes a retention penalty. The proven learning gains come from retrieval practice, spacing and (for similar items) interleaving. Those mechanics can live inside a feed, but they aren't the feed itself.

### 5.1 Fragmented short video vs continuous video (direct evidence)
- **Wei, Dong et al., *Communications Psychology* (2026):** "Learning via short videos impairs memory accuracy and reduces brain synchrony". Content was matched, a 10-min documentary vs 5–7 short clips with the same words and facts.
  - 180 students (incidental learning) and 185 (intentional learning). The short-clip group scored lower on immediate tests and **forgot more overnight** even when told they'd be tested.
  - fMRI showed reduced higher-order neural synchrony ([PsyPost](https://www.psypost.org/the-illusion-of-learning-from-short-videos/)).
- **Wei et al., *npj Science of Learning* (2026):** 57 students, **66% vs 43%** correct recall for continuous vs fragmented video. Reduced claustrum, caudate and MTG activation at retrieval ([PsyPost](https://www.psypost.org/brain-scans-reveal-how-short-videos-impair-memory-and-disrupt-neural-pathways/)).
  - Caveats: college students only, no physical swiping, between-subjects design.
- **INTED 2026 quasi-experiment (n=68):** four 1-min videos vs one 8-min video gave **higher engagement and satisfaction for short, but no significant retention difference** ([IATED library](https://library.iated.org/view/MCKEOWN2026DES)).
- **Chiossi et al., CHI '23 (n=60):** TikTok-style use significantly degraded *prospective memory* (remembering to do something later), while Twitter and YouTube use did not. The authors attribute this to short duration *plus* rapid context switching ([arXiv](https://arxiv.org/abs/2302.03714)).

### 5.2 Population-level association
- **Nguyen et al., *Psychological Bulletin* (2025):** meta-analysis of 71 studies, n=98,299. Short-form video use was associated with poorer cognition (r = −.34), mainly attention (r = −.38) and inhibitory control (r = −.41). Mostly cross-sectional, so not causal ([NYU IFP abstract](https://ifp.nyu.edu/2025/journal-article-abstracts/bul0000498/), [PsyPost](https://www.psypost.org/large-meta-analysis-links-tiktok-and-instagram-reels-to-poorer-cognitive-and-mental-health/)).
- **Compulsive vs heavy use:** secondary coverage says *compulsive* use matters more than time spent [secondary] ([Silicon Canals](https://siliconcanals.com/s-is-all-that-scrolling-really-dulling-your-attention-researchers-combed-71-studies-the-link-is-real-but-how-compulsively-you-scroll-matters-more-than-how-long/)).

### 5.3 What does work (and can be put in a feed)
- **Retrieval practice:** practice tests beat restudying and other comparison conditions ([Adesope, Trevisan & Sundararajan 2017, RER](https://education.wsu.edu/documents/2018/01/rethinking-use-tests.pdf/)). Multiple-choice practice showed *larger* effects than other formats in that meta-analysis ([Learning Scientists summary](https://www.learningscientists.org/blog/2017/2/9-1)), which is good news for Cortex's MCQ-first V0. The classic demonstration is [Roediger & Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x).
- **Spacing:** the meta-analysis of 317 experiments shows spaced beats massed review ([Cepeda et al. 2006](https://doi.org/10.1037/0033-2909.132.3.354)).
- **Interleaving:** moderate overall effect (g ≈ 0.42), strongest when categories are *similar to each other* and the material is complex. Blocking wins for simple word lists (g = −0.39), with high heterogeneity ([Brunmair & Richter 2019](https://pubmed.ncbi.nlm.nih.gov/31556629/)). Learners also *judge* interleaving as less effective even when it works better ([Kornell & Bjork 2008](https://doi.org/10.1111/j.1467-9280.2008.02127.x)), so a randomised remix may *feel* less productive than it is.
- **Varied question formats** improve transfer ([Pan & Rickard 2018](https://sc-pan.github.io/pdf/PR_2018.pdf)). This supports the "10 formats per concept" idea, *provided the formats are retrieval formats and not just re-explanations*.
- **Questions interspersed in short videos:** an Adelaide 2024–25 crossover study is testing whether they help two months later; results weren't available ([Sydney open journals](https://openjournals.library.sydney.edu.au/IISME/article/view/21175)).
- **Microlearning per se:** thin evidence. One small meta-analysis covers only 5 studies; vendor "80% retention" claims are untraceable ([search summary; Kelaniya JMTR](https://journals.kln.ac.lk/jmtr/media/attachments/2026/06/30/jmtr_24_22.pdf)). The benefit of "micro" seems to come through spacing and retrieval, not shortness itself.
- **Seductive details:** interesting but irrelevant additions reduce retention (small to medium effect) and transfer (medium effect) ([Rey 2012, via Learning Scientists](https://www.learningscientists.org/blog/2019/6/20-1)). A March 2026 multilevel meta-analysis confirms a small negative effect ([EurekAlert](https://www.eurekalert.org/news-releases/1127304)). Novelty formats (memes, brainrot voice, flashy transitions) hurt if they are decoration rather than the concept itself.
- **Industry claims:** Coursera's CTO says "short-form video with practice leads to learning" (internal data, not published) ([Business Today](https://www.businesstoday.in/technology/artificial-intelligence/story/courseras-ollie-borrows-social-medias-playbook-and-even-replaced-its-ctos-tiktok-habit-542816-2026-07-14)). ScrollEd has no outcome data yet ([TechCrunch](https://techcrunch.com/2026/09/20/scrolled-wants-to-turn-textbooks-into-tiktok/)).

### 5.4 Why Cortex's use case is the defensible one
Cortex's feed is for **revision of concepts the user has already studied**. In that use case the feed's job is retrieval and spacing, which are the strongest effects in the literature. Encoding new material through fragments is the weakest, per Wei et al. The risk is letting it drift into "mini re-explanations" (passive re-exposure, which gives the fluency illusion) instead of "make me retrieve it" cards.

---

## 6. Implications for the Cortex reels feed

**Positioning**
- **Own the "revision feed of *my* courses" slot.** Every competitor's feed is discovery-first: Deepstash, TikTok STEM, WikiTok, Ollie (which feeds into courses), Studii. The closest are Hivemind and ScrollEd, both small or new. Ollie is the incumbent to watch.
- **Copy-wise:** "the feed that quizzes you on what you learned" beats "TikTok for learning". The second phrase is saturated by dozens of low-traction launches.
- **Avoid the ad/product gap Deepstash suffers from** ("in the ads… I can replace insta… not the case"). If the marketing promises a TikTok replacement, the product has to feel like one.

**Navigation and "go deeper"**
- **Use ScrollEd's grammar:** vertical = next concept, horizontal = the same concept in the next format.
- **End each horizontal run with a recall card.** Add a persistent "Open lesson" chip that deep-links to the exact section of the source course (the Netflix Clips "watch the whole title" equivalent) and **returns to the same feed position**.
- **Add a bookmark** ("My List" / Deepstash stash) that feeds the review queue.
- **Prefer in-place expansion** (bottom sheet or sideways slides) over navigating away, so going deeper costs no context. This is the Oboe/Netflix inspiration done without leaving the feed.

**Scheduler (the actual moat)**
- **Model per concept, not per card.** Keep a recall half-life per concept, Readwise/Duolingo style. Pick concepts whose predicted recall is near threshold, then pick a **format not yet used for that concept** (track a `(concept, format)` exposure log). Decay resurfacing probability after each exposure, as Readwise does.
- **Interleave across courses, but not randomly.** Interleaving helps most for *similar, confusable* concepts and can hurt for simple items. Group sibling concepts (e.g., "mitosis vs meiosis") into adjacent slots. Learners will feel interleaving is less effective, so show proof of progress, such as "recall up from 60% → 85% on Course X".
- **Randomise the presentation, not the pedagogy.** Variable reward should come from *which* format appears, surprise "bonus" slots and occasional wildcard cards. Due-date discipline stays deterministic.

**Card mix (about 10 formats)**
- **Retrieval-heavy:** at least 1 in 3 cards should demand an answer. Ollie pairs every clip with a quiz; MCQ is fine and arguably strongest per Adesope 2017. Rotate MCQ, true/false, "This or That" (pick which of two concepts applies), match pairs, order the steps, fill the blank, predict-the-outcome and "explain it back" (Hivemind Feynman Mode) for transfer.
- **Explanation formats** should be short and *concept-carrying*: analogy, SVG diagram build, worked example, myth vs fact, one-line "headline + 3 bullets" (the Deepstash idea card), mini story (Deepstash idea slides, Imprint).
- **No decorative formats:** given the seductive-details evidence, every format must encode the concept itself. A "brainrot" voice or meme only works if the joke *is* the concept.
- **Studii's mode toggle** ("Brainrot" vs "Study") is a cheap way to serve both moods without diluting the default.

**Session shape: finite first, infinite optional**
- **Default to a finite daily set** (Readwise Daily Review, Headway daily session, Elevate 3–5-game workout) of about 10–15 cards, ending in a reward slot (Readwise "Bonus Highlight" / CogniScroll "drop").
- **After that, offer "keep going"** with lighter or new-preview cards.
- **Why:** Duolingo found that bingers churn more. Wei et al. show fragmented rapid switching harms memory. The Psychological Bulletin meta-analysis ties *compulsive* use to attention costs. A finite default protects learning, user trust and the brand promise.

**Cold start with a small concept pool**
- **Repetition risk:** with one course of about 15 concepts, a random feed repeats within minutes, which is Deepstash's "few categories → repetitive" failure.
- **Feed eligibility:** gate it until about 20–30 concept-format pairs exist, or pad with (a) format variants, which is cheap with generated SVG/text, (b) "preview" cards for the user's *next* unstudied lesson (curiosity hooks, clearly labelled) and (c) prerequisite or adjacent concepts the course generator already knows.
- **Re-exposure cap:** at most N appearances of the same concept per session.
- **Onboarding:** skip the interest picker (courses are the signal). Steal Imprint's goal framing ("Revise for my exam on X") to set review intensity.

**Rendering cost**
- **Programmatic animation:** Keet renders explainers with Remotion/Manim instead of generative video for cost and consistency. Cortex's vector/SVG pipeline is the same bet, and it suits "same concept, 10 formats" because each format is a template, not a video generation.

**Habit and monetisation**
- **Streaks with a freeze** (Duolingo Weekend Amulet: +4% week-later return). Keep celebrations quiet (Deepstash's "noisy" level-up got complaints).
- **Lock-screen widget** showing a due concept or a one-tap question (Headway widgets) as an out-of-app feed card.
- **Billing:** a trial reminder before charge and one-tap cancel. Billing is the top complaint category for Deepstash, Headway and Imprint. Doing this well is a cheap trust advantage.

**Measure learning, not just engagement**
- **Delayed recall probes:** put probe cards in the feed (the same concept, new format, days later) and track recall accuracy per concept over time as the north-star metric alongside DAU and time-in-feed.
- **Why:** this is what Ollie uses as a ranking signal, and it is the evidence ScrollEd and the whole category currently lack.

---

## 7. Sources

**Deepstash**
- https://deepstash.com/
- https://deepstash.com/topic/psychology
- https://deepstash.com/book/291592/atomic-habits
- https://apps.apple.com/us/app/deepstash-smarter-every-day/id1445023295
- https://play.google.com/store/apps/details?id=com.deepstash&hl=en_US
- https://appgoblin.info/apps/1445023295
- https://appgoblin.info/apps/com.deepstash
- https://screensdesign.com/apps/deepstash-smarter-every-day/?vs=247018
- https://www.trustpilot.com/review/deepstash.com
- https://alternativeto.net/software/deepstash/about
- https://nibble-app.com/blog/deepstash-review (competitor)
- https://nibble-app.com/blog/is-deepstash-worth-it (competitor)
- https://www.similarweb.com/app/google/com.deepstash
- https://deepstash.notion.site/Help-Center-e3fdf92e3ec64ebea90a1c0c56ebf3bc
- https://itbrief.co.uk/story/pvx-partners-backs-brainstash-with-9m-in-ua-financing-to-accelerate-global-growth-of-deepstash
- https://www.romania-insider.com/content-aggregation-deepstash-financing
- https://www.cbinsights.com/company/deepstash
- https://www.cbinsights.com/company/deepstash/financials
- https://www.howtoweb.co/speaker/vladimir-oane
- https://start-up.ro/rd36098

**Incumbents**
- https://apps.apple.com/us/app/imprint-visual-micro-learning/id1482780647
- https://screensdesign.com/showcase/imprint-learn-visually
- https://appgoblin.info/apps/1482780647
- https://nibble-app.com/blog/imprint-review (competitor)
- https://apps.apple.com/us/app/headway-daily-micro-learning/id1457185832
- https://appgoblin.info/apps/1457185832
- https://makeheadway.com/blog/is-headway-legit/ (self-published)
- https://apptail.io/app/headway-daily-micro-learning-crr/norway
- https://www.blinkist.com/magazine/posts/ein-neues-kapitel-schreiben-holger-seim-firmen-rueckkauf-interviewformat-v1
- https://nibble-app.com/blog/blinkist-cost (competitor)
- https://techcrunch.com/2021/02/10/uptime
- https://nibble-app.com/nibble-app-features
- https://nibble-app.com/blog/educational-scrolling-apps
- https://nibble-app.com/blog/kinnu-app-review (competitor)
- https://docs.readwise.io/readwise/docs/faqs/reviewing-highlights
- https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/
- https://blog.duolingo.com/new-duolingo-features/
- https://aclanthology.org/P16-1174/
- https://thejournal.com/Articles/2026/02/13/Quizlet-Adds-AI-Powered-Tools-for-Active-Practice-Notetaking.aspx
- https://pulse2.com/quizlet-acquires-coconote-and-adds-new-ai-study-experience
- https://www.streetinsider.com/PRNewswire/Quizlet+Launches+as+Native+App+in+ChatGPT+to+Transform+AI-Powered+Learning/26142955.html
- https://brilliant.org/about/
- https://nibble-app.com/blog/is-brilliant-worth-it (competitor)
- https://apps.apple.com/us/app/elevate-brain-training-games/id875063456
- https://appgoblin.info/apps/875063456

**Feeds by incumbents and platforms**
- https://www.digitaltrends.com/cool-tech/coursera-wants-users-to-learn-through-shorter-faster-content/
- https://www.businesstoday.in/technology/artificial-intelligence/story/courseras-ollie-borrows-social-medias-playbook-and-even-replaced-its-ctos-tiktok-habit-542816-2026-07-14
- https://newsroom.tiktok.com/tiktok-stem-feed-now-available-to-all-users-by-default?lang=en-GB
- https://www.tubefilter.com/2023/06/30/tiktok-stem-feed-science-kat-voltage-chem-teacher-phil/
- https://www.tubefilter.com/2024/10/24/tiktok-stem-feed-adults-science-technology-engineering-math/
- https://www.phonearena.com/news/youtube-expands-courses-feature-to-more-of-its-creators-rolling-out-gradually_id161949
- https://recapio.com/digest/youtubes-new-changes-are-huge-by-lmg-clips
- https://help.netflix.com/en/node/575087423404644
- https://www.engadget.com/entertainment/streaming/netflix-mobile-app-redesign-will-offer-deeper-integration-of-vertical-video-120000820.html
- https://techcrunch.com/2025/05/07/netflix-is-getting-into-short-videos-with-a-new-vertical-feed-for-mobile
- https://www.republicworld.com/tech/netflix-rolls-out-clips-feature-on-mobile-to-make-finding-shows-easier
- https://www.newsbytesapp.com/news/science/disney-is-rolling-out-verts-a-tiktok-like-short-form-video-feed/story
- https://www.socialinsider.io/data-geeks/instagram_benchmarks_2025.pdf
- https://buffer.com/resources/data-best-content-format-social-media/

**AI-native and startups**
- https://techcrunch.com/2025/09/10/after-selling-to-spotify-anchors-co-founders-are-back-with-oboe-an-ai-powered-app-for-learning/
- https://www.edtechinnovationhub.com/news/oboe-rolls-out-major-platform-update-alongside-16-million-series-a
- https://techcrunch.com/2026/09/20/scrolled-wants-to-turn-textbooks-into-tiktok/
- https://runtimewire.com/article/scrolled-turns-textbooks-into-swipeable-learning-feed
- https://apps.apple.com/us/app/hivemind-study-by-scrolling/id6737344456
- https://apps.apple.com/ca/app/studii-doomscroll-learn/id6755154363
- https://kompozy.io/news/keet-yc-video-course-app-launch
- https://www.startuphub.ai/ai-news/claudes-corner/2026/claudes-corner-doomersion-yc-w2026.md (AI-written analysis; unverified)
- https://mwm.ai/apps/brainjuice-scroll-to-study/6759610120
- https://apps.apple.com/us/app/-/id6742924412
- https://appshunter.io/ios/app/smartscroll-quit-doomscroll/id6740744254
- https://apps.apple.com/us/app/fenne-learn-anything-fast/id6746964450
- https://www.trendhunter.com/trends/mindrot
- https://www.producthunt.com/products/brainrot-ai/launches
- https://alternativeto.net/software/cogniscroll/about
- https://news.ycombinator.com/item?id=46037005
- https://news.ycombinator.com/item?id=46912413
- https://news.ycombinator.com/item?id=46512544
- https://news.ycombinator.com/item?id=44178383
- https://news.ycombinator.com/item?id=46793534
- https://techcrunch.com/2024/10/07/revyze-a-tiktok-for-education-startup-draws-on-duolingo-to-add-bite-sized-learning-too/
- https://www.tubefilter.com/2025/02/11/wikitok-tiktok-wikipedia-scrolling-learning-project-isaac-gemal/
- https://pcgamer.com/hardware/give-your-wikipedia-rabbit-hole-deep-dives-a-dollop-of-dopamine-by-reading-them-in-an-anti-algorithm-tiktok-style-feed

**Evidence**
- https://www.psypost.org/the-illusion-of-learning-from-short-videos/
- https://www.psypost.org/brain-scans-reveal-how-short-videos-impair-memory-and-disrupt-neural-pathways/
- https://library.iated.org/view/MCKEOWN2026DES
- https://arxiv.org/abs/2302.03714
- https://ifp.nyu.edu/2025/journal-article-abstracts/bul0000498/
- https://www.psypost.org/large-meta-analysis-links-tiktok-and-instagram-reels-to-poorer-cognitive-and-mental-health/
- https://siliconcanals.com/s-is-all-that-scrolling-really-dulling-your-attention-researchers-combed-71-studies-the-link-is-real-but-how-compulsively-you-scroll-matters-more-than-how-long/
- https://education.wsu.edu/documents/2018/01/rethinking-use-tests.pdf/
- https://www.learningscientists.org/blog/2017/2/9-1
- https://doi.org/10.1111/j.1467-9280.2006.01693.x
- https://doi.org/10.1037/0033-2909.132.3.354
- https://pubmed.ncbi.nlm.nih.gov/31556629/
- https://doi.org/10.1111/j.1467-9280.2008.02127.x
- https://sc-pan.github.io/pdf/PR_2018.pdf
- https://www.tes.com/magazine/teaching-learning/general/what-is-variable-retrieval-practice
- https://openjournals.library.sydney.edu.au/IISME/article/view/21175
- https://journals.kln.ac.lk/jmtr/media/attachments/2026/06/30/jmtr_24_22.pdf
- https://www.learningscientists.org/blog/2019/6/20-1
- https://www.eurekalert.org/news-releases/1127304
