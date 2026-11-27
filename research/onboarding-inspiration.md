# Onboarding inspiration: Quest, Wondering, Wabi (teardown)

Sources:
- Quest showcase video (x.com/premiumtantan/status/2118391672430313700, 22s, 4K, three phones in parallel; frames in `.context/frames/quest/`)
- Wondering screen recording (IMG_1105, 172s)
- Wabi screen recording (IMG_1107, 30s)

## Quest: how the "cinematic" works

What happens on screen, in order:
1. **Onboarding starts inside iMessage, not the app.** Q (the agent) texts you a rich interactive card: dark glass, floating glowing orbs labelled *Fun Facts · Dream Quests · Journey · Personality*, and a white **Reveal** pill. Long-pressing gives the native iMessage menu. A later card says **"Sign in to Quest"**, with a glass Q. keycap tile.
2. **"Quest is blocked" gate.** A dark screen says *"Quest needs to get to know you to be helpful. Connect apps below to unlock Q."*
   - An **UNDERSTANDING meter** goes 0% → 20% → 40% toward an 80% target marker. It's a glowing multicolour bar (cobalt → violet → pink → white-hot tip) with a white % chip.
   - Below it: **"A letter, before you begin. From Quest's CEO, on what you share."** A dark card with an envelope and wax seal, plus a Read link.
   - Then **Recommended** connections: Gmail ("2 accounts connected"), X ("what you post and follow"), each with a carved **Connect** button.
   - **Reveal** stays disabled until the meter is high enough.
3. **The Reveal is a full-screen vertical story** (Exit Profile · Full Memory at the top, page dots on the right).
   - Each chapter is a saturated, blurred aurora: red, crimson, blue, purple.
   - One big serif line in the centre (*"You can handle the truth"*) plus a white pill naming the chapter (*Your Personality Analysis*).
   - The previous chapter's line fades out at the top (*"Believe in the beauty of your dreams"*) and the next one fades in at the bottom (*"Looking backwards to connect the dots"*). Swiping scrolls through chapters like a film credit roll.
   - Chapter pills seen: *Your Personality Analysis · Your Journey · Your Fun Facts* ("Based on a true story").
4. **It lands in the light app:** Main Quests as image cards, Side Quests list, Memory (Your People bubble canvas, Your Places map, Apps you've connected), and the CEO letter rendered as giant "Hi, Sriram".

**The wow mechanics, ranked**
1. **Being seen.** The payoff is a story *about you*, built from your data (the Wrapped effect). People screenshot and share it.
2. **The meter turns giving data into a game.** Each connection visibly charges it, and the target marker creates a goal.
3. **Gating builds anticipation.** "Blocked", "unlock", "Reveal": the reward is withheld until you've put something in.
4. **Trust before asking:** a personal letter from the founder about data.
5. **Cinematic pacing:** dark ground, glowing colour, one line per screen, previous and next lines visible, vertical swiping.
6. **Native surfaces** (iMessage cards, passkeys, system share) make it feel premium and effortless.

## Wondering: why the flow is shaped the way it is

1. **A mascot voice turns the form into a conversation.** Every answer is acknowledged ("Product manager. I'll pick examples that fit."). A progress bar shows there are only three questions.
2. **Three questions:**
   - **Goal:** work, exam, school, sharpen mind, fun.
   - **Role:** engineer, student, PM…
   - **Specific topic:** suggested titles, or paste a doc or link.

   Each answer immediately changes the next screen's options, so you feel the personalisation.
3. **It asks for a format:** Read, Listen or Watch.
4. **It generates the first lesson before signup** ("Got it! I'll use what you shared…"), then gates with **"Your first lesson is one step away"** (Google / email / Apple). This is sunk-cost conversion.
5. **It asks for notifications only after value** ("Get gentle reminders… never miss your streak").
6. **It lands on an ask-first screen** ("What do you want to learn?", composer, Canvas). Settings include *Import from your AI*, *Quick guess before lessons*, *Global review*.
7. **Weak spots:** generic chip lists, a dated monospace button style, and it feels like data entry, not a moment.

## Wabi: styling cues

- **Opening:** glossy 3D spheres, each holding a tiny image, rain down over white. A small "+" orb, one serif-light line ("The AI assistant that gets your life organized"), then a native sign-in stack (Google, black Apple pill, phone).
- **Native and fast:** native phone verification and passkey sheets; dark pill primary; it lands straight in a chat-first home.

## What Cortex takes
- **From Quest:** the meter, the letter, Reveal → Curiosity Wrapped chapters, the dark-to-light transition, glowing orb objects.
- **From Wondering:** conversational acknowledgements, ≤3 questions, value before signup, the sign-up gate ("your first exploration is ready"), notifications after value, ask-first landing.
- **From Wabi:** a rain of curiosity spheres as the opening image, a one-line promise, native sign-in.
