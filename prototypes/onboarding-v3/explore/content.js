// Exploration content for the exploration. Owned by the Explore module.
// Inline glowing terms use [[nodeId|shown text]] (or [[nodeId]] to show the term's own label).
// Every term opens a node of the same id. Facts are attributed; nothing here is invented.
window.CONTENT = (function () {
  // Glowing terms: one per node. `def` is the one-line popover definition.
  const terms = {
    habit: { label: 'habit loop', def: 'Trigger, action, variable reward, investment: the loop behind habit-forming products.' },
    variable: { label: 'variable reward', def: 'A reward that changes each time, so you can’t predict what you’ll get.' },
    dopamine: { label: 'dopamine', def: 'A brain signal that spikes when you expect a reward. It drives wanting more than pleasure.' },
    fogg: { label: 'Fogg behaviour model', def: 'Behaviour happens when motivation, ability and a prompt meet at the same moment: B = MAP.' },
    streaks: { label: 'streaks', def: 'A count of days in a row. It makes stopping feel like losing something.' },
    slots: { label: 'slot machines', def: 'Machines that pay out at random: the purest variable reward ever built.' },
    retention: { label: 'retention curve', def: 'The share of new users still active over time. Its shape shows whether a habit formed.' },
    aha: { label: 'aha moment', def: 'The moment a new user first feels the product’s value.' },
    darkpatterns: { label: 'dark patterns', def: 'Designs that trick people into choices they didn’t mean to make.' },
  };

  const nodes = {
    // ───────────────────────── Root ─────────────────────────
    habit: {
      label: 'Why products become habits', q: 'Why do some products become habits?',
      shape: 'ring', palette: 'mind', cl: 'mind', img: 'assets/hook-reward.png',
      answer: 'They run a loop: a trigger, an easy action, a [[variable|variable reward]], and a small investment that pulls you back.',
      blocks: [
        { type: 'stages', eyebrow: 'Stages', title: 'The habit loop',
          intro: 'Nir Eyal calls it the Hook model. Swipe through one loop, using Instagram.',
          steps: [
            { icon: 'bell', name: 'Trigger', tag: 'Step 1 · The prompt', img: 'assets/hook-trigger.png',
              text: 'Something cues you to act: a notification at first, later a feeling like boredom.',
              ex: 'A push says “maya and 3 others liked your photo.” Months later, boredom alone opens the app.' },
            { icon: 'tap', name: 'Action', tag: 'Step 2 · The easy part', img: 'assets/hook-action.png',
              text: 'The simplest thing you can do in hope of a reward: open, scroll, tap. See the [[fogg]].',
              ex: 'One thumb opens the feed and keeps it moving. No decisions needed.' },
            { icon: 'gift', name: 'Variable reward', tag: 'Step 3 · The itch', img: 'assets/hook-reward.png',
              text: 'What you get changes every time. The not-knowing is what keeps you checking.',
              ex: 'Each refresh is different: new posts, a comment, a message from a friend. Or nothing.' },
            { icon: 'sprout', name: 'Investment', tag: 'Step 4 · The pull back', img: 'assets/hook-invest.png',
              text: 'You put something in that makes the product better for you, and sets up the next trigger.',
              ex: 'You post, follow and comment. Each one brings new notifications back to you.' },
          ] },
        { type: 'guess', eyebrow: 'Guess first', title: 'Which keeps pigeons pecking the longest?',
          intro: 'In the 1950s B. F. Skinner fed pigeons for pecking a key, on different schedules.',
          options: [
            { icon: 'repeat', text: 'A reward every time' },
            { icon: 'hash', text: 'A reward every 10th peck' },
            { icon: 'dice', text: 'A reward at random' },
          ],
          answer: 2,
          explain: 'At random. On a variable schedule the birds pecked fast and steadily, and kept going long after the food stopped. A reward every time fades fastest once it stops; a fixed count brings a pause after each reward. It’s the logic of [[slots|slot machines]] (Ferster & Skinner, 1957).' },
        { type: 'tiles', eyebrow: 'Three kinds of reward', title: 'What the reward can be',
          intro: 'Eyal sorts variable rewards into three kinds. Tap one.',
          items: [
            { id: 'tribe', name: 'The tribe', sub: 'Being seen', img: 'assets/reward-tribe.png',
              sheet: { title: 'Rewards of the tribe', def: 'Feeling accepted, liked and important to other people.',
                facts: [['Example', 'A like or a reply'], ['Feels like', 'Belonging'], ['Product', 'Instagram']],
                examples: [['Instagram', 'Likes and comments arrive unpredictably, so you check back to see who noticed.'], ['Stack Overflow', 'Upvotes and reputation reward people for answering strangers’ questions.']] } },
            { id: 'hunt', name: 'The hunt', sub: 'Finding more', img: 'assets/reward-hunt.png',
              sheet: { title: 'Rewards of the hunt', def: 'The search for resources and information: the next thing might be the good one.',
                facts: [['Example', 'The next post'], ['Feels like', 'The chase'], ['Product', 'TikTok']],
                examples: [['TikTok', 'Every swipe might bring a great video, so one more swipe always feels worth it.'], ['Pinterest', 'Scrolling down keeps revealing new pins, some of exactly what you wanted.']] } },
            { id: 'self', name: 'The self', sub: 'Getting good', img: 'assets/reward-self.png',
              sheet: { title: 'Rewards of the self', def: 'Mastery, competence and completion: proof that you can do it.',
                facts: [['Example', 'Finishing a lesson'], ['Feels like', 'Mastery'], ['Product', 'Duolingo']],
                examples: [['Duolingo', 'Finishing a lesson, levelling up and keeping your [[streaks|streak]] all say “you’re getting better.”'], ['Codecademy', 'Each exercise you solve is small proof that you can code.']] } },
          ] },
        { type: 'compare', eyebrow: 'Compare', title: 'Habit vs addiction',
          intro: 'Same loop, very different outcome. Switch sides to contrast them, and watch for [[darkpatterns]].',
          a: 'Habit', b: 'Addiction',
          rows: [
            ['Who it serves', 'You. It helps you get something you want.', 'The product, often at your expense.'],
            ['Can you stop', 'Yes, whenever you choose to.', 'Hard, even when you want to.'],
            ['How it feels after', 'Glad you did it.', 'Regret, or a sense of lost time.'],
            ['Design question', 'Would people still use it if they knew exactly how it was designed?', 'Would people feel tricked if they knew how it was designed?'],
          ],
          verdict: ['A habit is a loop you’d choose again.', 'An addiction keeps going even when it hurts.'] },
        { type: 'cases', eyebrow: 'Real cases', title: 'Where the loop came from',
          items: [
            { id: 'skinner', name: 'Skinner’s pigeons', sub: 'Random rewards, endless pecking', img: 'assets/case-skinner.png',
              story: 'B. F. Skinner trained pigeons to peck a key for food. When food came after an unpredictable number of pecks, the birds pecked fastest and kept pecking long after the food stopped. He and Charles Ferster logged it all in Schedules of Reinforcement (1957).',
              steal: 'Vary what people find each time they come back, not whether the product works.', node: 'variable' },
            { id: 'slot', name: 'The slot machine', sub: 'Near misses that feel like wins', img: 'assets/case-slot.png',
              story: 'Slot machines pay out on a random schedule. Near misses, two sevens and a blank, recruit some of the same reward circuitry as a win and raise the urge to play again (Clark et al., 2009). Anthropologist Natasha Dow Schüll found players chasing “the zone” more than the money.',
              steal: 'Borrow the anticipation, never the trap: a reveal can feel good without making losing look like winning.', node: 'slots' },
            { id: 'streak', name: 'Duolingo’s streak', sub: 'Investment you can see', img: 'assets/case-streak.png',
              story: 'Duolingo counts the days in a row you’ve done a lesson. The longer the streak, the more it hurts to lose, so people come back. Because one missed day can end the habit entirely, it sells Streak Freezes that protect the count.',
              steal: 'Make the investment visible, and give people a gentle way back after a miss.', node: 'streaks' },
          ] },
        { type: 'apply', eyebrow: 'Try it on your product', title: 'Find the missing step',
          intro: 'Pick a moment from your product. Cortex shows which part of the loop is missing.',
          loop: ['Trigger', 'Action', 'Reward', 'Investment'],
          options: [
            { label: 'Sign-up done, then silence', missing: 0,
              why: 'Nothing brings them back after day one, so the loop never starts.',
              fix: 'Send one prompt tied to why they signed up, at the moment they’d need it. Not a feature tour.' },
            { label: 'Tasks finish with no payoff', missing: 2,
              why: 'They do the work and get the same flat screen every time. Nothing to look forward to.',
              fix: 'After each task, show something that varies: a teammate’s reaction, an insight from their data.' },
            { label: 'Use it, but nothing builds up', missing: 3,
              why: 'Every visit starts from zero, so leaving costs nothing.',
              fix: 'Ask for one small input that makes next time better: a saved view, a template, a follow.' },
          ] },
      ],
      ponder: [
        ['Why does wanting feel better than getting?', 'dopamine'],
        ['Why do streaks work, and when do they backfire?', 'streaks'],
        ['What’s an aha moment, and how do you find it?', 'aha'],
        ['Where does good design become a trick?', 'darkpatterns'],
      ],
      suggest: [
        ['What makes someone actually do something?', 'fogg'],
        ['Why do retention curves flatten?', 'retention'],
        ['Why are slot machines so hard to quit?', 'slots'],
      ],
    },

    // ───────────────────────── Branches ─────────────────────────
    variable: {
      label: 'Variable reward', q: 'Why are unpredictable rewards so powerful?',
      shape: 'burst', palette: 'mind', cl: 'mind', img: 'assets/case-skinner.png',
      answer: 'Rewards that arrive unpredictably keep us trying far longer than rewards we can count on. Not knowing is the pull, and [[dopamine]] tracks it.',
      blocks: [
        { type: 'chart', eyebrow: 'Interact', title: 'Four ways to hand out a reward',
          intro: 'Skinner’s cumulative records: the steeper the line, the faster the pecking. Tap a schedule.',
          xLabel: 'Time', yLabel: 'Total pecks', note: 'Illustrative shapes, after Ferster & Skinner (1957)',
          options: [
            { label: 'Fixed count', series: { kind: 'fr' }, text: 'A reward every 10th peck. Fast pecking, then a pause after each reward.' },
            { label: 'Random count', series: { kind: 'vr' }, text: 'A reward after an unpredictable number of pecks. The fastest, steadiest line, and the hardest to stop. This is the [[slots|slot machine]].' },
            { label: 'Fixed time', series: { kind: 'fi' }, text: 'A reward for the first peck after, say, a minute. Slow after each reward, then speeding up: a “scallop.”' },
            { label: 'Random time', series: { kind: 'vi' }, text: 'A reward for the first peck after an unpredictable wait. Moderate and steady, like checking email.' },
          ] },
        { type: 'points', eyebrow: 'Use it well', title: 'Vary what, not whether',
          items: [
            ['shuffle', 'Vary the content', 'A feed, a match, a recommendation: what people find should change each time.'],
            ['check', 'Keep the core reliable', 'If the product randomly fails, that isn’t a variable reward. It just feels broken.'],
            ['clock', 'Expect it to wear off', 'Eyal calls it finite variability: once a game is mastered, the surprise fades and so does the pull.'],
          ] },
      ],
      ponder: [['Why are slot machines so hard to quit?', 'slots'], ['Why does wanting feel better than getting?', 'dopamine'], ['Why do streaks work, and when do they backfire?', 'streaks']],
    },

    dopamine: {
      label: 'Dopamine & wanting', q: 'Why does wanting feel better than getting?',
      shape: 'spike', palette: 'mind', cl: 'mind', img: '../assets/orb-brain.jpg',
      answer: 'Dopamine fires most when you expect a reward, not when you get it. It’s less a pleasure chemical than a “this matters, go get it” signal.',
      blocks: [
        { type: 'chart', eyebrow: 'Interact', title: 'Where the spike moves',
          intro: 'Wolfram Schultz recorded dopamine cells in monkeys: a light came on, then juice arrived. Tap each stage.',
          xLabel: 'Time', yLabel: 'Dopamine firing', note: 'Illustrative, after Schultz, Dayan & Montague (1997)', marks: [[0.3, 'Light'], [0.72, 'Juice']], baseline: 0.34,
          options: [
            { label: 'Surprise', series: { kind: 'bumps', base: 0.34, bumps: [[0.72, 0.55, 0.035]] }, text: 'Juice out of nowhere: dopamine spikes when the reward arrives.' },
            { label: 'Learned', series: { kind: 'bumps', base: 0.34, bumps: [[0.3, 0.55, 0.035]] }, text: 'Once the light predicts juice, the spike jumps to the light. The juice itself barely registers.' },
            { label: 'No reward', series: { kind: 'bumps', base: 0.34, bumps: [[0.3, 0.55, 0.035], [0.72, -0.26, 0.04]] }, text: 'Light, then no juice: firing dips below normal right when the reward was due. That’s the sting of refreshing and finding nothing.' },
          ] },
        { type: 'compare', eyebrow: 'Compare', title: 'Wanting vs liking',
          intro: 'Kent Berridge showed these run on different systems in the brain.',
          a: 'Wanting', b: 'Liking',
          rows: [
            ['Feels like', 'An urge, a pull toward something.', 'Pleasure while you have it.'],
            ['Runs on', 'Dopamine, widely across the brain.', 'Small “hotspots” using opioids and other signals.'],
            ['With repetition', 'Can grow stronger (sensitisation).', 'Often stays flat, or fades.'],
            ['Design lesson', 'Cues and anticipation drive the urge.', 'Only real value makes it worth it.'],
          ],
          verdict: ['Wanting gets people to come back.', 'Liking decides if they’re glad they did.'] },
      ],
      ponder: [['Why are unpredictable rewards so powerful?', 'variable'], ['Why are slot machines so hard to quit?', 'slots'], ['Why do retention curves flatten?', 'retention']],
    },

    fogg: {
      label: 'Fogg behaviour model', q: 'What makes someone actually do something?',
      shape: 'steps', palette: 'mind', cl: 'mind', img: 'assets/hook-action.png',
      answer: 'BJ Fogg’s model: a behaviour happens when motivation, ability and a prompt meet at the same moment. B = MAP.',
      blocks: [
        { type: 'fogg', eyebrow: 'Interact', title: 'Above or below the action line?',
          intro: 'Set how much someone wants it and how easy it is. A prompt only works above the line.',
          states: {
            'high-easy': ['Above the line', 'Prompt them now and they’ll act.', true],
            'high-hard': ['Just above the line', 'People push through hard tasks, but only while motivation lasts.', true],
            'low-easy': ['Just above the line', 'Easy is enough. A prompt works even on a low day.', true],
            'low-hard': ['Below the line', 'Prompts here only annoy people. Make it easier first.', false],
          } },
        { type: 'table', eyebrow: 'Key idea', title: 'Three kinds of prompt',
          cols: ['Prompt', 'Use it when'],
          rows: [['Spark', 'They can do it, but don’t want it enough. Add a reason.'], ['Facilitator', 'They want it, but it’s hard. Make it easier.'], ['Signal', 'They want it and can do it. Just remind them.']],
          note: 'From Fogg’s behaviour model. Fix ability before motivation: it’s more reliable. Then build toward an [[aha|aha moment]].' },
      ],
      ponder: [['What’s an aha moment, and how do you find it?', 'aha'], ['Why do streaks work, and when do they backfire?', 'streaks']],
    },

    streaks: {
      label: 'Streaks', q: 'Why do streaks work, and when do they backfire?',
      shape: 'bars', palette: 'arts', cl: 'arts', img: 'assets/case-streak.png',
      answer: 'A streak turns a habit into something you’d hate to lose. But once it breaks, some people quit entirely.',
      blocks: [
        { type: 'streak', eyebrow: 'Interact', title: 'Miss one day',
          intro: 'Thursday got busy. Switch the Streak Freeze on and off to see what happens next.' },
        { type: 'points', eyebrow: 'Why', title: 'Why it works, and breaks',
          items: [
            ['scale', 'Loss aversion', 'Losses loom larger than equal gains, roughly twice as large (Kahneman & Tversky). Losing day 30 hurts more than day 31 pleases.'],
            ['flame', 'The what-the-hell effect', 'Dieting researchers Janet Polivy and Peter Herman named it: once the rule is broken, people give up altogether.'],
            ['shield', 'Repair beats punishment', 'Freezes, weekends off and gentle restarts keep one miss from ending the habit.'],
          ] },
      ],
      ponder: [['Why do retention curves flatten?', 'retention'], ['Why are unpredictable rewards so powerful?', 'variable'], ['Where does good design become a trick?', 'darkpatterns']],
    },

    slots: {
      label: 'Slot machines', q: 'Why are slot machines so hard to quit?',
      shape: 'grid', palette: 'arts', cl: 'arts', img: 'assets/case-slot.png',
      answer: 'They pay out on a random schedule, the strongest [[variable|variable reward]] there is, and near misses feel almost like wins.',
      blocks: [
        { type: 'reels', eyebrow: 'Interact', title: 'Win, near miss, or miss?',
          intro: 'Pull each result and see what it does to the player.',
          options: [
            { label: 'Win', reels: ['seven', 'seven', 'seven'], text: 'Reward circuits fire, and you want to play again.' },
            { label: 'Near miss', reels: ['seven', 'seven', 'star'], text: 'Rated less pleasant than a clear miss, yet it raises the urge to play and lights up win-related brain areas (Clark et al., 2009).' },
            { label: 'Clear miss', reels: ['star', 'diamond', 'seven'], text: 'A plain loss. Less pull to keep going than after a near miss.' },
          ] },
        { type: 'points', eyebrow: 'The tricks', title: 'What else keeps people playing',
          items: [
            ['coins', 'Losses disguised as wins', 'Lights and sounds celebrate a “win” that pays back less than you bet. Players react to them much like real wins (Dixon et al., 2010).'],
            ['bolt', 'Speed', 'A spin takes seconds, so there’s no natural moment to stop.'],
            ['moon', 'The machine zone', 'Natasha Dow Schüll found many players chase a trance-like flow more than the money (Addiction by Design, 2012).'],
          ] },
      ],
      ponder: [['Where does good design become a trick?', 'darkpatterns'], ['Why does wanting feel better than getting?', 'dopamine']],
    },

    retention: {
      label: 'Retention curves', q: 'Why do retention curves flatten?',
      shape: 'curve', palette: 'tech', cl: 'tech', img: '../assets/orb-chart.jpg',
      answer: 'A curve that levels off means some people found lasting value. A curve that slides to zero means nobody formed the habit.',
      blocks: [
        { type: 'chart', eyebrow: 'Interact', title: 'Read the shape',
          intro: 'Everyone drops at first. What matters is what happens next. Tap each shape.',
          xLabel: 'Weeks since sign-up', yLabel: 'Still active', note: 'Illustrative curves, not real data',
          options: [
            { label: 'Leaky', series: { kind: 'decay', floor: 0.02, k: 4.2 }, text: 'It slides toward zero. People tried it, but nothing brought them back.' },
            { label: 'Flattens', series: { kind: 'decay', floor: 0.3, k: 5 }, text: 'It levels off. That flat part is your product: people who built a habit.' },
            { label: 'Smile', series: { kind: 'decay', floor: 0.24, k: 5.5, rise: 0.16 }, text: 'It flattens, then rises as lapsed users come back. Rare, and a great sign.' },
          ] },
        { type: 'points', eyebrow: 'At work', title: 'Lift the flat line',
          items: [
            ['target', 'Match the cadence', 'Measure at the product’s natural rhythm. A tax app isn’t a daily app.'],
            ['search', 'Study who stayed', 'Find what the flat-line users did in week one: often an [[aha|aha moment]].'],
            ['route', 'Steer everyone there', 'Redesign onboarding so new users reach that action faster.'],
          ] },
      ],
      ponder: [['What’s an aha moment, and how do you find it?', 'aha'], ['Why do streaks work, and when do they backfire?', 'streaks']],
    },

    aha: {
      label: 'Aha moments', q: 'What’s an aha moment, and how do you find it?',
      shape: 'sparkle', palette: 'society', cl: 'society', img: '../assets/orb-bulb.jpg',
      answer: 'It’s when a new user first gets the value. Find the early action that best predicts who stays, then get everyone there faster.',
      blocks: [
        { type: 'table', eyebrow: 'Famous ones', title: 'What growth teams found',
          cols: ['Product', 'Users who…'],
          rows: [['Facebook', 'Added 7 friends in 10 days tended to stay.'], ['Slack', 'Were on teams that sent 2,000 messages tended to stick.'], ['Twitter', 'Followed about 30 accounts became regulars.']],
          note: 'As described by people from those teams. These are correlations: the action predicts staying, it doesn’t guarantee it.' },
        { type: 'points', eyebrow: 'Try it', title: 'Find yours in three steps',
          items: [
            ['split', 'Split by outcome', 'Compare the first week of users who stayed with those who left.'],
            ['search', 'Find the difference', 'Look for an action most stayers did and most leavers didn’t.'],
            ['route', 'Remove the steps', 'Cut everything between sign-up and that action. Watch the [[retention|retention curve]].'],
          ] },
      ],
      ponder: [['Why do retention curves flatten?', 'retention'], ['What makes someone actually do something?', 'fogg']],
    },

    darkpatterns: {
      label: 'Dark patterns', q: 'Where does good design become a trick?',
      shape: 'split', palette: 'body', cl: 'arts', img: '../assets/orb-hourglass.jpg',
      answer: 'When it works against the user. Dark patterns trick people into choices they didn’t mean to make, like hidden costs or impossible cancellations.',
      blocks: [
        { type: 'guess', eyebrow: 'Spot it', title: '“No thanks, I don’t like saving money.” What is this?',
          intro: 'Designer Harry Brignull coined “dark patterns” in 2010 and named the common ones.',
          options: [
            { icon: 'door', text: 'Roach motel' },
            { icon: 'frown', text: 'Confirmshaming' },
            { icon: 'cart', text: 'Sneak into basket' },
          ],
          answer: 1,
          explain: 'Confirmshaming: the “no” button is worded to make you feel bad for declining. A roach motel is easy to get into and hard to leave. In 2023 the US FTC sued Amazon over how hard Prime was to cancel.' },
        { type: 'matrix', eyebrow: 'Interact', title: 'Eyal’s manipulation matrix',
          intro: 'Two questions to ask before you build a habit loop: would you use it yourself, and does it improve people’s lives? Tap a box.',
          colLabel: 'Would you use it yourself?', rowLabel: 'Improves lives?',
          cells: [
            ['Facilitator', 'You’d use it, and it helps people. Build habits here.', 'good'],
            ['Peddler', 'It helps people, but you wouldn’t use it. Good intentions, often weak products.', 'mid'],
            ['Entertainer', 'You’d use it, but it doesn’t improve lives. Fun, and often short-lived.', 'mid'],
            ['Dealer', 'You wouldn’t use it, and it doesn’t help. That’s exploitation.', 'bad'],
          ] },
      ],
      ponder: [['Why are slot machines so hard to quit?', 'slots'], ['Why do streaks work, and when do they backfire?', 'streaks']],
    },
  };

  Object.keys(nodes).forEach((id) => { nodes[id].id = id; });
  return { root: 'habit', nodes, terms };
})();
