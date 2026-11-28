// Courses for onboarding v5, and the personalised course builder. Owner: A · Onboarding. See CONTRACT.md (v5).
//
// TOPICS: the five prepared topics (AI, physiology, SQL, investing, Spanish). Each has
//   - suggest: the "Learn …" line on the first question; short: the word used in "Why AI, why now?"
//   - levels: one topic-specific descriptor per level (new · bit · basics · deep)
//   - lessons: a pool of stops { title, hook, glyph (an OrbGlyphs motif), shape (a Brain shape), because, forYou }
//   - core: the teaching order; open: the first stop for each level; skip: stops a level doesn't need
//   - outcomes[reason]: the answers to "What would make this worth it?". Each has the stops it pulls in (focus),
//     its own because/forYou lines for them (b, fy), and the final stop.
// buildCourse(profile) turns a profile (CONTRACT: Store.profile) into COURSES[id] in the shape Learn plays.
// Anything typed that matches no topic gets a plain, honest course built around the words the person typed.
(function () {
  // ---------- Small text helpers ----------
  const lc1 = (s) => (s && s.length > 1 && /[a-z]/.test(s[1]) ? s[0].toLowerCase() + s.slice(1) : s || '');
  const an = (s) => (/^(a|e|i|o|u|hour|honest)/i.test(s) && !/^(uni|use|eu|one)/i.test(s) ? 'an ' : 'a ') + s;
  const val = (v, p, x) => (typeof v === 'function' ? v(p, x) : v);
  const byReason = (v, p) => (v && typeof v === 'object' && !Array.isArray(v) ? v[p.reason] || v.any : v);

  // Who someone is, for the summary line
  const ROLE_NOUN = { student: 'a student', tech: 'someone in product and tech', business: 'someone in business', health: 'someone in health care', creative: 'someone in a creative job', teaching: 'a teacher' };

  // ================= AI =================
  const AI = {
    id: 'ai', title: 'How AI actually works', finalGlyph: 'brain', suggest: 'Learn how AI actually works', short: 'AI', subject: 'Tech', palette: 'tech', shape: 'c-ai',
    color: ['#FFB547', '#E0662E'], ink: '#9A3A12',
    match: /\bai\b|a\.i\.|artificial intel|chat ?gpt|\bllms?\b|language model|machine learning|neural net|deep learning|\bgpt|claude|gemini|copilot|prompt/i,
    levels: { new: 'Never really tried it', bit: 'ChatGPT a few times', basics: 'I know what a model is', deep: 'Training, tokens, the lot' },
    levelClause: { new: 'is new to AI', bit: 'has used ChatGPT a few times', basics: 'knows the basics of AI', deep: 'wants to go deep on AI' },
    open: { new: 'ai-what', bit: 'ai-seen', basics: 'ai-predict', deep: 'ai-train' },
    openBecause: {
      new: 'Starts from zero: what AI is, and what it isn’t',
      bit: 'Starts from what you’ve already seen ChatGPT do',
      basics: 'You know the basics, so we start with the idea under all of it',
      deep: 'You want to go deep, so we start with how models are trained',
    },
    skip: { basics: ['ai-what', 'ai-seen'], deep: ['ai-what', 'ai-seen'] },
    core: ['ai-what', 'ai-seen', 'ai-predict', 'ai-learn', 'ai-wrong', 'ai-prompt', 'ai-limits', 'ai-save', 'ai-tools', 'ai-data', 'ai-agents', 'ai-build', 'ai-train'],
    lessons: {
      'ai-what': { title: 'What AI actually is', hook: 'Not a brain and not magic. Software that learned patterns from a huge pile of examples.', glyph: 'chip', shape: 'grid', because: 'Everything else in the plan builds on this', forYou: 'One sentence for when someone asks what AI is' },
      'ai-seen': { title: 'What happened when you asked ChatGPT', hook: 'You typed, it answered, it felt like it understood. Here’s what actually went on.', glyph: 'speech', shape: 'burst', because: 'Starts from what you’ve already seen it do', forYou: 'Uses the kind of chats you’ve already had as the examples' },
      'ai-predict': { title: 'It’s predicting the next word', hook: 'One idea explains most of what chatbots do, and most of what they get wrong.', glyph: 'sine', shape: 'wave', because: 'The one idea under every chatbot', forYou: 'The sentence to start any explanation of AI with' },
      'ai-learn': { title: 'How a model learns', hook: 'Billions of examples, and one small correction at a time.', glyph: 'neuron', shape: 'steps', because: 'Answers the question people ask next: where did it learn that?', forYou: 'A picture of training you can sketch on a whiteboard' },
      'ai-wrong': { title: 'Why it makes things up', hook: 'Fluent, confident and wrong. Where made-up answers come from, and how to catch them.', glyph: 'forget', shape: 'spike', because: 'So you know when not to trust it', forYou: 'Three checks to run before you rely on an answer' },
      'ai-prompt': { title: 'Asking it well', hook: 'Context, an example and a clear ask. Three changes fix most bad answers.', glyph: 'mic', shape: 'target', because: 'Better questions get better answers, fast', forYou: 'A prompt you can reuse tomorrow' },
      'ai-limits': { title: 'What it can’t do yet', hook: 'Maths, memory, last week’s news. The edges you’ll hit first.', glyph: 'battery', shape: 'split', because: 'Knowing the edges saves you from the worst surprises', forYou: 'A short list of what to double-check' },
      'ai-save': { title: 'Hand it the boring hours', hook: 'Find the tasks in your week it can take, and the ones it can’t.', glyph: 'hourglass', shape: 'curve', because: 'Where the time savings really are', forYou: 'You list your own week, it sorts what to hand over' },
      'ai-tools': { title: 'Judging an AI tool', hook: 'Most products are a model with a wrapper. Five questions show you which.', glyph: 'gauge', shape: 'bars', because: 'So a slick demo doesn’t do your thinking for you', forYou: 'A five-question checklist for any tool' },
      'ai-data': { title: 'What happens to your data', hook: 'What you paste in, where it goes, and when that matters.', glyph: 'iris', shape: 'ring', because: 'The question to ask before you paste anything in', forYou: 'A simple rule for what never goes in' },
      'ai-agents': { title: 'When AI starts doing things', hook: 'Agents click, search and act for you. Useful, and easy to oversell.', glyph: 'atom', shape: 'funnel', because: 'Where AI is heading next', forYou: 'How to tell a real agent from a renamed chatbot' },
      'ai-build': { title: 'Build a small prototype', hook: 'Connect a model to one real task in an afternoon. No team needed.', glyph: 'code', shape: 'steps', because: 'Making something teaches what reading can’t', forYou: 'A working thing at the end, not just notes' },
      'ai-train': { title: 'Tokens, training and fine-tuning', hook: 'What a token is, what training costs, and when fine-tuning is worth it.', glyph: 'dna', shape: 'grid', because: 'The machinery under every model', forYou: 'Real numbers on cost and size' },
    },
    outcomes: {
      work: [
        { id: 'explain', label: 'Explain AI to my team', short: 'explain AI to your team', wants: 'wants to explain AI to the team',
          focus: ['ai-predict', 'ai-wrong', 'ai-learn', 'ai-limits'],
          b: { 'ai-predict': 'The one idea you’ll use every time you explain it', 'ai-wrong': 'You’ll be asked whether to trust it. This is how to answer', 'ai-learn': 'Where it learned all this: the next question your team will ask', 'ai-limits': 'So you can say what it can’t do, before someone over-promises' },
          fy: { 'ai-predict': 'Ends with a one-line version you can say in a meeting', 'ai-wrong': 'Practise your answer to “can we trust this?”', 'ai-learn': 'A sketch of training that fits on one whiteboard', 'ai-limits': 'Three things to push back on when the hype starts' },
          final: { title: 'Your 2-minute AI explanation', hook: 'Put it together: the explanation you’ll give your team, out loud.', because: 'Your 2-minute explanation for the team: your goal', forYou: 'Say it out loud and we’ll point out what’s unclear' } },
        { id: 'save', label: 'Save hours each week with it', short: 'save hours each week with AI', wants: 'wants AI to save hours each week',
          focus: ['ai-prompt', 'ai-save', 'ai-wrong', 'ai-agents'],
          b: { 'ai-prompt': 'Most lost time comes from vague asks. This fixes that first', 'ai-save': 'Finds the hours in your own week it can take', 'ai-wrong': 'Time saved is gone if you have to redo its mistakes', 'ai-agents': 'Where it can take whole tasks, not just answer questions' },
          final: { title: 'Your first hour back', hook: 'Pick one weekly task and hand it over, start to finish.', because: 'Hours back each week: your goal', forYou: 'Uses a task from your own week' } },
        { id: 'judge', label: 'Judge AI tools before we buy', short: 'judge AI tools before you buy', wants: 'wants to judge AI tools before buying them',
          focus: ['ai-tools', 'ai-data', 'ai-wrong', 'ai-limits'],
          b: { 'ai-tools': 'Five questions to put to any vendor', 'ai-data': 'The question your security team will ask first', 'ai-wrong': 'Every demo looks perfect. This is how to find the cracks', 'ai-limits': 'So you can spot a promise no model can keep' },
          final: { title: 'Score a real tool', hook: 'Take a tool you’re looking at and run it through the checklist.', because: 'Judging tools before you buy: your goal', forYou: 'Bring the tool your team is considering' } },
        { id: 'build', roles: ['tech', 'student', 'other'], label: 'Build a small prototype', short: 'build a small AI prototype', wants: 'wants to build a small AI prototype',
          focus: ['ai-prompt', 'ai-agents', 'ai-build', 'ai-wrong'],
          b: { 'ai-prompt': 'A prototype is mostly good prompts', 'ai-agents': 'How to let it take actions safely', 'ai-build': 'The afternoon build, step by step', 'ai-wrong': 'Every prototype needs a check for made-up answers' },
          final: { title: 'Your working prototype', hook: 'Ship one small thing that uses a model for a real task.', because: 'A small prototype that works: your goal', forYou: 'You pick the task, we keep it small enough to finish' } },
        { id: 'case', roles: ['business'], label: 'Find where it pays off for us', short: 'find where AI pays off for your team', wants: 'wants to find where AI pays off for the team',
          focus: ['ai-save', 'ai-tools', 'ai-limits', 'ai-data'],
          b: { 'ai-save': 'Finds the work it can really take off people’s plates', 'ai-tools': 'So you can tell a good buy from a demo', 'ai-limits': 'Where it won’t pay off, so you can say so early', 'ai-data': 'The risk your boss will ask about' },
          final: { title: 'A one-page plan', hook: 'Where AI saves your team time or money, and where it doesn’t.', because: 'Finding where it pays off: your goal', forYou: 'Written for the people who sign off' } },
        { id: 'safe', roles: ['health'], label: 'Know where it’s safe to use at work', short: 'know where AI is safe to use at work', wants: 'wants to know where AI is safe to use at work',
          focus: ['ai-wrong', 'ai-data', 'ai-limits', 'ai-prompt'],
          b: { 'ai-wrong': 'In health care, a confident wrong answer is the real risk', 'ai-data': 'What happens to patient details you paste in', 'ai-limits': 'The tasks to keep away from it', 'ai-prompt': 'Asking well cuts down on bad answers' },
          final: { title: 'Your safe-use rules', hook: 'The few rules you’ll follow when using AI at work.', because: 'Knowing where it’s safe: your goal', forYou: 'Short enough to pin above your desk' } },
        { id: 'class', roles: ['teaching'], label: 'Use it well with my students', short: 'use AI well with your students', wants: 'wants to use AI well with students',
          focus: ['ai-wrong', 'ai-prompt', 'ai-limits', 'ai-save'],
          b: { 'ai-wrong': 'Students will trust it too much. This is how to show them why not', 'ai-prompt': 'Good asks are a skill your students can learn', 'ai-limits': 'Where it helps learning, and where it gets in the way', 'ai-save': 'Hours back from marking and planning' },
          final: { title: 'A lesson that uses AI', hook: 'Plan one class where students use AI and learn from its mistakes.', because: 'Using it well with students: your goal', forYou: 'Ready to teach next week' } },
        { id: 'craft', roles: ['creative'], label: 'Use it without losing my own style', short: 'use AI without losing your own style', wants: 'wants to use AI without losing their own style',
          focus: ['ai-predict', 'ai-prompt', 'ai-limits', 'ai-save'],
          b: { 'ai-predict': 'Why its output drifts toward the average, and how to pull it back', 'ai-prompt': 'Asking for your style, not its default', 'ai-limits': 'Where your judgement still wins', 'ai-save': 'Hand it the chores, keep the craft' },
          final: { title: 'Your own way of working', hook: 'Decide where AI helps your work and where it stays out.', because: 'Using it on your own terms: your goal', forYou: 'Built around a piece of your own work' } },
      ],
      exam: [
        { id: 'module', label: 'Do well in my AI module', short: 'do well in your AI module', wants: 'wants to do well in an AI module',
          focus: ['ai-predict', 'ai-learn', 'ai-train', 'ai-limits'],
          b: { 'ai-predict': 'The idea most exam questions come back to', 'ai-learn': 'Training is where the marks are', 'ai-train': 'The terms examiners expect you to use', 'ai-limits': 'Good for the “discuss” questions' },
          final: { title: 'A practice exam', hook: 'Exam-style questions on everything in your plan, timed.', because: 'Doing well in your module: your goal', forYou: 'Marked, with the reasons' } },
        { id: 'answers', label: 'Write clear exam answers on it', short: 'write clear exam answers on AI', wants: 'wants to write clear exam answers on AI',
          focus: ['ai-learn', 'ai-predict', 'ai-wrong'],
          b: { 'ai-learn': 'The answer that comes up most, written clearly', 'ai-predict': 'One idea that makes your answers make sense', 'ai-wrong': 'A strong example for any “limitations” question' },
          final: { title: 'Three model answers', hook: 'Write them, then compare with answers that got full marks.', because: 'Clear exam answers: your goal', forYou: 'Timed like the real thing' } },
        { id: 'project', label: 'Write a strong project on it', short: 'write a strong project on AI', wants: 'wants to write a strong project on AI',
          focus: ['ai-wrong', 'ai-data', 'ai-agents'],
          b: { 'ai-wrong': 'Made-up answers make a good project question', 'ai-data': 'Data and privacy give a project real stakes', 'ai-agents': 'The newest area, so less has been written' },
          final: { title: 'Your project outline', hook: 'A question, a method and a plan you can hand in.', because: 'A strong project: your goal', forYou: 'Shaped by what you found interesting' } },
      ],
      career: [
        { id: 'interview', label: 'Talk about AI well in interviews', short: 'talk about AI well in interviews', wants: 'wants to talk about AI well in interviews',
          focus: ['ai-predict', 'ai-learn', 'ai-wrong', 'ai-tools'],
          b: { 'ai-predict': 'The plain explanation interviewers want to hear', 'ai-learn': 'So you can go one level deeper when they push', 'ai-wrong': 'Shows judgement, not just enthusiasm', 'ai-tools': 'How to talk about tools you’d pick, and why' },
          final: { title: 'A mock interview', hook: 'Five real interview questions about AI, answered out loud.', because: 'Talking about AI well in interviews: your goal', forYou: 'Feedback on what to tighten' } },
        { id: 'show', label: 'Build a project I can show', short: 'build an AI project you can show', wants: 'wants to build an AI project to show',
          focus: ['ai-prompt', 'ai-build', 'ai-agents'],
          b: { 'ai-prompt': 'Good prompts are most of a good demo', 'ai-build': 'The build, step by step', 'ai-agents': 'What makes a project look current' },
          final: { title: 'A project to show', hook: 'One small, finished thing with a short write-up.', because: 'A project you can show: your goal', forYou: 'Ready for a CV or a portfolio' } },
        { id: 'roles', label: 'Know which AI jobs suit me', short: 'find the AI jobs that suit you', wants: 'wants to find the AI jobs that suit them',
          focus: ['ai-tools', 'ai-agents', 'ai-build'],
          b: { 'ai-tools': 'Most AI jobs are about choosing and using tools', 'ai-agents': 'Where new roles are appearing', 'ai-build': 'Try the hands-on side before you decide' },
          final: { title: 'Your shortlist of roles', hook: 'Three AI roles that fit what you already do, and the first step into each.', because: 'Finding the jobs that suit you: your goal', forYou: 'Starts from your current work' } },
      ],
      life: [
        { id: 'trust', label: 'Know what to trust it with', short: 'know what to trust AI with', wants: 'wants to know what to trust AI with',
          focus: ['ai-wrong', 'ai-data', 'ai-limits'],
          b: { 'ai-wrong': 'The main reason not to trust it blindly', 'ai-data': 'What happens to what you tell it', 'ai-limits': 'What to always double-check' },
          final: { title: 'Your own rules for it', hook: 'What you’ll use it for, and what you won’t.', because: 'Knowing what to trust it with: your goal', forYou: 'Your rules, in your words' } },
        { id: 'everyday', label: 'Use it for everyday things', short: 'use AI for everyday things', wants: 'wants to use AI for everyday things',
          focus: ['ai-prompt', 'ai-save', 'ai-wrong'],
          b: { 'ai-prompt': 'Asking well is most of the skill', 'ai-save': 'Finds the small jobs it’s good at', 'ai-wrong': 'So it doesn’t catch you out' },
          final: { title: 'Three real tasks', hook: 'Three things from your own week, done with AI.', because: 'Using it for everyday things: your goal', forYou: 'You choose the three' } },
        { id: 'news', label: 'Keep up when people talk about it', short: 'keep up when people talk about AI', wants: 'wants to keep up when people talk about AI',
          focus: ['ai-predict', 'ai-learn', 'ai-agents'],
          b: { 'ai-predict': 'The idea behind most of the headlines', 'ai-learn': 'What “trained on” actually means', 'ai-agents': 'What everyone is talking about next' },
          final: { title: 'Read a headline properly', hook: 'Take a real AI story and say what it really means.', because: 'Keeping up: your goal', forYou: 'A story from this week' } },
        { id: 'kids', label: 'Help my kids use it well', short: 'help your kids use AI well', wants: 'wants to help their kids use AI well',
          focus: ['ai-wrong', 'ai-data', 'ai-prompt'],
          b: { 'ai-wrong': 'The first thing kids need to know about it', 'ai-data': 'What not to tell it', 'ai-prompt': 'Using it to learn, not to skip learning' },
          final: { title: 'A family guide', hook: 'Five house rules, with the reasons, to talk through together.', because: 'Helping your kids use it well: your goal', forYou: 'Written so kids can read it too' } },
      ],
    },
    gift: { title: 'The spark', sub: 'A one-of-a-kind collectible, made from your course.', shape: 'burst', palette: 'cobalt' },
    widen: [
      { id: 'ai-fair', title: 'AI and fairness', why: 'Who it works well for, and who it doesn’t' },
      { id: 'ai-datasimple', title: 'Data, simply', why: 'What models learn from in the first place' },
      { id: 'track-ai', title: 'Track: Working with AI', why: 'Prompting, tools and building, joined into one path', big: true },
    ],
  };

  // ================= Physiology (the heart lessons are its backbone: same ids, so Learn plays their full content) =================
  const H = window.COURSES && COURSES.heart ? COURSES.heart.lessons.reduce((m, l) => ((m[l.id] = l), m), {}) : {};
  const heartL = (id, extra) => Object.assign({ title: (H[id] || {}).title || id, hook: (H[id] || {}).hook || '', shape: (H[id] || {}).shape || 'heart' }, extra);
  const PHYSIO = {
    id: 'physio', title: 'Human physiology', finalGlyph: 'heartbeat', suggest: 'Learn about the physiology of the human body', short: 'physiology', subject: 'Body', palette: 'body', shape: 'heart',
    color: ['#F783AC', '#D6336C'], ink: '#A3264F',
    match: /physiolog|anatomy|human body|\bbody\b|biology|\bbio\b|class\s*1[12]|neet|heart|cardi|pulse|lung|kidney|blood|organ|nervous system/i,
    levels: { new: 'Haven’t studied it yet', bit: 'Bits from school', basics: 'I know the main systems', deep: 'The why behind every process' },
    levelClause: { new: 'is new to physiology', bit: 'remembers bits from school', basics: 'knows the basics', deep: 'wants to go deep' },
    open: { new: 'ph-cells', bit: 'pump', basics: 'cycle', deep: 'ph-control' },
    openBecause: {
      new: 'Starts small: cells, then the organs they build',
      bit: 'Starts with the organ you’ll remember best from school',
      basics: { exam: 'You know the basics, so we start where marks are lost: the cardiac cycle', any: 'You know the basics, so we start with the cycle that drives it all' },
      deep: 'You want depth, so we start with how the body keeps itself steady',
    },
    skip: { basics: ['ph-cells', 'pump'], deep: ['ph-cells', 'pump', 'rooms'] },
    core: ['ph-cells', 'pump', 'rooms', 'spark', 'circuits', 'cycle', 'ph-lungs', 'ph-blood', 'pressure', 'ph-kidney', 'ph-nerves', 'ph-control', 'ph-digest', 'strong', 'ph-diagrams', 'ph-past'],
    lessons: {
      'ph-cells': { title: 'Cells, tissues, organs', hook: 'How 37 trillion cells organise into the parts you can name.', glyph: 'dna', shape: 'grid', because: 'Everything else is made of these', forYou: 'The one diagram that ties the course together' },
      pump: heartL('pump', { glyph: 'pump', because: 'The organ everything else depends on', forYou: 'Feel your own pulse while you read' }),
      rooms: heartL('rooms', { glyph: 'rooms', because: 'The layout you need before anything else about the heart', forYou: 'Build the diagram one part at a time' }),
      spark: heartL('spark', { glyph: 'spark', because: 'What keeps the beat going without you', forYou: 'Watch one beat start, step by step' }),
      circuits: heartL('circuits', { glyph: 'circuits', because: 'Why blood takes two routes, not one', forYou: 'Trace one drop of blood all the way round' }),
      cycle: heartL('cycle', { glyph: 'cycle', because: 'One full beat, in order', forYou: 'Every stage in under a second' }),
      pressure: heartL('pressure', { glyph: 'gauge', because: 'The two numbers on every check-up', forYou: 'Read your own numbers with it' }),
      strong: heartL('strong', { glyph: 'dumbbell', because: 'What the evidence says actually helps', forYou: 'Small changes, ranked by how much they help' }),
      'ph-lungs': { title: 'Breathing and gas exchange', hook: 'How oxygen gets from the air into your blood in under a second.', glyph: 'lungs', shape: 'split', because: 'The heart’s partner: one doesn’t make sense without the other', forYou: 'Follow one breath in and out' },
      'ph-blood': { title: 'What blood carries', hook: 'Red cells, white cells, platelets and plasma, and what each one is for.', glyph: 'drop', shape: 'scatter', because: 'What all that pumping is for', forYou: 'Make sense of a blood test line by line' },
      'ph-kidney': { title: 'How the kidneys clean your blood', hook: 'A million tiny filters working all day.', glyph: 'flask', shape: 'funnel', because: 'The body’s cleaning system', forYou: 'One nephron, drawn and explained' },
      'ph-nerves': { title: 'How a nerve signal travels', hook: 'Ions, a spike, and a jump across the gap.', glyph: 'neuron', shape: 'spike', because: 'How the body sends messages fast', forYou: 'Follow a signal from your fingertip to your brain' },
      'ph-control': { title: 'How the body keeps itself steady', hook: 'Feedback loops for temperature, sugar and water.', glyph: 'sine', shape: 'wave', because: 'The idea that links every system', forYou: 'One loop you can apply to any organ' },
      'ph-digest': { title: 'Digestion, start to finish', hook: 'Nine metres of gut, and what happens at each stop.', glyph: 'carrot', shape: 'curve', because: 'Where your energy comes from', forYou: 'Follow one meal through' },
      'ph-diagrams': { title: 'Diagrams examiners ask for', hook: 'The heart, the nephron, the alveolus. Drawn and labelled.', glyph: 'brush', shape: 'grid', because: 'Diagrams are quick marks if you know them cold', forYou: 'Draw each one from memory' },
      'ph-past': { title: 'Past paper practice', hook: 'The questions that come up almost every year.', glyph: 'hourglass', shape: 'bars', because: 'The questions that come up most', forYou: 'Timed, like the real paper' },
    },
    outcomes: {
      exam: [
        { id: 'fullmarks', label: 'Score full marks on physiology', short: 'score full marks on physiology', wants: 'wants full marks in physiology',
          focus: ['spark', 'circuits', 'ph-lungs', 'ph-kidney', 'ph-nerves', 'ph-past'],
          b: { spark: 'The SA node and the AV node: a short-answer question most years', circuits: 'Double circulation: the diagram you’ll be asked to draw', 'ph-lungs': 'Often asked next to the heart, so we learn them together', 'ph-kidney': 'Excretion carries big marks and is easy to lose', 'ph-nerves': 'Neural control: the chapter most students leave too late', 'ph-past': 'The questions that come up almost every year' },
          fy: { cycle: 'Ends with the timing table examiners love', spark: 'A two-line answer that gets both marks', circuits: 'Draw it from memory, then check it', 'ph-lungs': 'The labelled alveolus, step by step', 'ph-kidney': 'The nephron diagram, built up part by part', 'ph-nerves': 'The answer to “explain how an impulse travels”', 'ph-past': 'Marked like the real thing' },
          final: { title: 'Full marks practice paper', hook: 'A timed paper across every chapter in your plan, marked like the real thing.', because: 'Full marks on physiology: your goal', forYou: 'We show which answers would lose a mark, and why' } },
        { id: 'diagrams', label: 'Draw and label every diagram', short: 'draw and label every diagram', wants: 'wants to draw and label every diagram',
          focus: ['rooms', 'circuits', 'ph-kidney', 'ph-diagrams'],
          b: { rooms: 'The heart diagram, built from the inside', circuits: 'The circulation diagram, drawn in order', 'ph-kidney': 'The nephron, the one students mix up', 'ph-diagrams': 'Every diagram on the syllabus, in one place' },
          final: { title: 'Five diagrams from memory', hook: 'Draw and label them, then check every label.', because: 'Every diagram, drawn and labelled: your goal', forYou: 'Timed, one at a time' } },
        { id: 'weak', label: 'Fix the chapters I’m weak in', short: 'fix the chapters you’re weak in', wants: 'wants to fix the chapters they’re weak in',
          focus: ['ph-nerves', 'ph-kidney', 'ph-control'],
          b: { 'ph-nerves': 'The chapter students find hardest', 'ph-kidney': 'The one that’s easy to half-learn', 'ph-control': 'Joins the hard chapters together' },
          final: { title: 'A check on the hard chapters', hook: 'Questions only on the parts you found hard.', because: 'Fixing the weak chapters: your goal', forYou: 'We go back over any you miss' } },
        { id: 'revise', label: 'Revise fast before the exam', short: 'revise fast before the exam', wants: 'wants to revise fast before the exam',
          focus: ['cycle', 'ph-lungs', 'ph-kidney', 'ph-past'],
          b: { cycle: 'The topic most likely to come up', 'ph-lungs': 'Quick marks if you know it', 'ph-kidney': 'Worth revising twice', 'ph-past': 'The fastest way to see where you stand' },
          final: { title: 'A last-week revision paper', hook: 'Short, timed, and only the must-knows.', because: 'Fast revision: your goal', forYou: 'Under an hour' } },
      ],
      work: [
        { id: 'patients', roles: ['health'], label: 'Explain the body clearly to patients', short: 'explain the body clearly to patients', wants: 'wants to explain the body clearly to patients',
          focus: ['pressure', 'circuits', 'ph-kidney', 'ph-control'],
          b: { pressure: 'The numbers patients ask about most', circuits: 'A simple picture patients remember', 'ph-kidney': 'Hard to explain, so we practise it', 'ph-control': 'Why the body pushes back, in plain words' },
          final: { title: 'Three plain explanations', hook: 'Explain three things a patient might ask, in under a minute each.', because: 'Clear explanations for patients: your goal', forYou: 'No jargon allowed' } },
        { id: 'science', label: 'Keep up with the science at work', short: 'keep up with the science at work', wants: 'wants to keep up with the science at work',
          focus: ['ph-control', 'ph-nerves', 'ph-blood'],
          b: { 'ph-control': 'The idea behind most new findings', 'ph-nerves': 'A busy area of research', 'ph-blood': 'What most tests measure' },
          final: { title: 'Read a real study summary', hook: 'Take one recent finding and say what it means.', because: 'Keeping up with the science: your goal', forYou: 'A short one, in your area' } },
        { id: 'enough', label: 'Know the body well enough for my job', short: 'know the body well enough for your job', wants: 'wants to know the body well enough for work',
          focus: ['pump', 'ph-lungs', 'ph-blood', 'pressure'],
          b: { pump: 'The organ everyone asks about first', 'ph-lungs': 'The other half of keeping someone going', 'ph-blood': 'What the numbers on a test mean', pressure: 'The reading you’ll see most' },
          final: { title: 'A tour of the body', hook: 'Talk through each system in a sentence or two.', because: 'Knowing the body for your job: your goal', forYou: 'Short enough to say in a meeting' } },
      ],
      career: [
        { id: 'course', label: 'Get ready for a health course', short: 'get ready for a health course', wants: 'wants to get ready for a health course',
          focus: ['ph-cells', 'circuits', 'ph-lungs', 'ph-kidney'],
          b: { 'ph-cells': 'Where every health course starts', circuits: 'Comes up in the first weeks', 'ph-lungs': 'You’ll need it early', 'ph-kidney': 'The topic new students find hardest' },
          final: { title: 'An entry-style test', hook: 'Questions like the ones on a first-year paper.', because: 'Being ready for your course: your goal', forYou: 'See where you’d start' } },
        { id: 'job', label: 'Prepare for a health job interview', short: 'prepare for a health job interview', wants: 'wants to prepare for a health job interview',
          focus: ['pressure', 'ph-blood', 'ph-control'],
          b: { pressure: 'A classic interview question', 'ph-blood': 'Reading results is part of the job', 'ph-control': 'Shows you understand, not just remember' },
          final: { title: 'Interview questions on the body', hook: 'Five you’re likely to get, answered out loud.', because: 'Your health job interview: your goal', forYou: 'Feedback on each answer' } },
        { id: 'feel', label: 'Feel at home with the science', short: 'feel at home with the science', wants: 'wants to feel at home with the science',
          focus: ['ph-cells', 'pump', 'ph-nerves'],
          b: { 'ph-cells': 'The words the rest is built on', pump: 'A system you can see and feel', 'ph-nerves': 'The one that sounds hardest, made simple' },
          final: { title: 'Explain one system, start to end', hook: 'Pick a system and talk it through.', because: 'Feeling at home with it: your goal', forYou: 'You pick the system' } },
      ],
      life: [
        { id: 'mine', label: 'Understand my own body', short: 'understand your own body', wants: 'wants to understand their own body',
          focus: ['pump', 'ph-lungs', 'ph-digest', 'ph-control'],
          b: { pump: 'Starts with the beat you can feel right now', 'ph-lungs': 'What happens in every breath you take', 'ph-digest': 'Where your lunch goes', 'ph-control': 'Why you shiver, sweat and get thirsty' },
          final: { title: 'A tour of your own body', hook: 'Follow one day through your body, system by system.', because: 'Understanding your own body: your goal', forYou: 'Your day, not a textbook’s' } },
        { id: 'checkup', label: 'Make sense of a check-up', short: 'make sense of a check-up', wants: 'wants to make sense of a check-up',
          focus: ['pressure', 'ph-blood', 'ph-kidney'],
          b: { pressure: 'The first number they take', 'ph-blood': 'What the lines on a blood test mean', 'ph-kidney': 'The results people worry about most' },
          final: { title: 'Read a check-up report', hook: 'A real-looking report, read line by line.', because: 'Making sense of a check-up: your goal', forYou: 'Questions to ask your doctor' } },
        { id: 'healthy', label: 'Know what really keeps me healthy', short: 'know what really keeps you healthy', wants: 'wants to know what really keeps them healthy',
          focus: ['strong', 'ph-digest', 'pressure'],
          b: { strong: 'What the evidence says, not the adverts', 'ph-digest': 'Food, without the fads', pressure: 'The number most worth keeping an eye on' },
          final: { title: 'Your own short list', hook: 'The few habits worth keeping, and why.', because: 'Knowing what keeps you healthy: your goal', forYou: 'Ranked by how much they help' } },
      ],
    },
    gift: { title: 'The living heart', sub: 'A one-of-a-kind collectible, made from your course.' },
    widen: (window.COURSES && COURSES.heart && COURSES.heart.widen) || [],
  };

  // ================= SQL =================
  const SQL = {
    id: 'sql', title: 'SQL for a data job', finalGlyph: 'code', suggest: 'Learn SQL for a data job', short: 'SQL', subject: 'Tech', palette: 'tech', shape: 'c-db',
    color: ['#5FD0F2', '#1A8FD0'], ink: '#0F5F94',
    match: /\bsql\b|sequel|database|postgres|mysql|sqlite|query|queries|data analy|data job|data science|analytics/i,
    levels: { new: 'Never written a query', bit: 'Copied a query or two', basics: 'SELECT, WHERE, a simple join', deep: 'Window functions and speed' },
    levelLabels: { bit: 'I’ve seen a few queries' },
    levelClause: { new: 'is new to SQL', bit: 'has copied a query or two', basics: 'knows the basics of SQL', deep: 'wants to go deep on SQL' },
    open: { new: 'sql-tables', bit: 'sql-select', basics: 'sql-group', deep: 'sql-window' },
    openBecause: {
      new: 'You’re new to it, so we start with what a table really is',
      bit: 'Starts by making sense of the queries you’ve copied',
      basics: 'You know the basics, so we start with grouping',
      deep: 'You want depth, so we start with window functions',
    },
    skip: { basics: ['sql-tables', 'sql-select', 'sql-where'], deep: ['sql-tables', 'sql-select', 'sql-where', 'sql-sort'] },
    core: ['sql-tables', 'sql-select', 'sql-where', 'sql-sort', 'sql-group', 'sql-join', 'sql-null', 'sql-sub', 'sql-clean', 'sql-window', 'sql-dash', 'sql-speak'],
    lessons: {
      'sql-tables': { title: 'Tables, rows and columns', hook: 'What a database really is: spreadsheets that know about each other.', glyph: 'thirds', shape: 'grid', because: 'Every query starts here', forYou: 'Uses a small shop’s orders as the example' },
      'sql-select': { title: 'Your first query', hook: 'SELECT and FROM. Two words that get you any column you want.', glyph: 'code', shape: 'steps', because: 'The query you’ll write more than any other', forYou: 'You run it yourself in the lesson' },
      'sql-where': { title: 'Filtering with WHERE', hook: 'Only the rows you need: dates, ranges and text.', glyph: 'iris', shape: 'funnel', because: 'Almost every real question needs a filter', forYou: 'Last month’s orders, in one line' },
      'sql-sort': { title: 'Sorting and the top ten', hook: 'ORDER BY and LIMIT, for every “who are our best…” question.', glyph: 'growth', shape: 'bars', because: 'The fastest useful answer you can give', forYou: 'Your first top-ten list' },
      'sql-group': { title: 'Totals with GROUP BY', hook: 'Sums, counts and averages by team, month or product.', glyph: 'people', shape: 'bars', because: 'Turns rows into answers', forYou: 'Monthly totals, the report everyone asks for' },
      'sql-join': { title: 'Joins, without guessing', hook: 'Put two tables together and know exactly which rows you’ll get.', glyph: 'circuits', shape: 'split', because: 'Real data is always split across tables', forYou: 'Draw the join before you write it' },
      'sql-null': { title: 'NULLs and other traps', hook: 'Missing values that quietly break your counts.', glyph: 'forget', shape: 'scatter', because: 'The bug that makes numbers look right when they’re not', forYou: 'Find the trap in three real queries' },
      'sql-sub': { title: 'Queries inside queries', hook: 'Subqueries and CTEs: break a hard question into small ones.', glyph: 'atom', shape: 'steps', because: 'How to answer questions too big for one step', forYou: 'One hard question, three small steps' },
      'sql-clean': { title: 'Cleaning messy data', hook: 'Dates stored as text, duplicates, odd spellings. Fixed in SQL.', glyph: 'brush', shape: 'scatter', because: 'Real data is never clean', forYou: 'A messy table, tidied by you' },
      'sql-window': { title: 'Window functions', hook: 'Running totals and rankings without losing your rows.', glyph: 'sine', shape: 'wave', because: 'What separates a beginner from someone who’s ready', forYou: 'Rank, running total, change since last month' },
      'sql-dash': { title: 'From query to dashboard', hook: 'Turn a query into a chart your team checks every Monday.', glyph: 'monitor', shape: 'bars', because: 'Where your queries end up', forYou: 'One chart, built from your own query' },
      'sql-speak': { title: 'Talking through your query', hook: 'Say what you’re doing and why, the way interviewers want to hear it.', glyph: 'speech', shape: 'wave', because: 'How you explain counts as much as the answer', forYou: 'Practise out loud' },
    },
    outcomes: {
      career: [
        { id: 'interview', label: 'Pass a SQL interview', short: 'pass a SQL interview', wants: 'wants to pass a SQL interview',
          focus: ['sql-select', 'sql-where', 'sql-group', 'sql-join', 'sql-null', 'sql-window', 'sql-speak'],
          b: {
            'sql-select': (p) => (p.roleText ? `Your first query, on the kind of data ${an(lc1(p.roleText))} already works with` : 'Your first query, on the kind of data you already work with'),
            'sql-where': 'Filtering is in almost every interview task', 'sql-group': 'GROUP BY: the question behind half of all interview tasks', 'sql-join': 'Joins come up in nearly every SQL interview',
            'sql-null': 'The trap interviewers set on purpose', 'sql-window': 'The question that turns a pass into a strong pass', 'sql-speak': 'Interviewers grade how you explain, not just the answer' },
          fy: { 'sql-tables': 'Orders, products and customers: tables you’ll recognise from work', 'sql-select': 'Pull the numbers you’d normally wait for someone else to send', 'sql-group': 'The weekly report, written by you', 'sql-join': 'Draw it first, then write it', 'sql-null': 'Spot it before the interviewer does', 'sql-window': 'The three window questions interviewers ask most' },
          final: { title: 'A mock SQL interview', hook: 'Four real interview questions, timed, with feedback on how you explained them.', because: 'Pass a SQL interview: your goal', forYou: 'Timed like the real thing, then marked' } },
        { id: 'portfolio', label: 'Build a project I can show', short: 'build a SQL project you can show', wants: 'wants to build a SQL project to show',
          focus: ['sql-clean', 'sql-group', 'sql-join', 'sql-dash'],
          b: { 'sql-clean': 'Every good project starts with messy data', 'sql-group': 'Turns a dataset into findings', 'sql-join': 'Shows you can work across tables', 'sql-dash': 'The part people actually look at' },
          final: { title: 'A portfolio project', hook: 'A real dataset, three questions answered, one chart.', because: 'A project you can show: your goal', forYou: 'Ready to link from your CV' } },
        { id: 'answers', label: 'Answer real business questions with data', short: 'answer real business questions with data', wants: 'wants to answer real business questions with data',
          focus: ['sql-group', 'sql-join', 'sql-window', 'sql-sub'],
          b: { 'sql-group': 'Most business questions are a total by something', 'sql-join': 'The answer is usually in two tables', 'sql-window': 'For “compared with last month” questions', 'sql-sub': 'For questions with more than one step' },
          final: { title: 'Answer three real questions', hook: 'Three questions a manager might ask, answered with queries.', because: 'Answering real questions with data: your goal', forYou: 'Questions from a real business' } },
      ],
      work: [
        { id: 'self', label: 'Pull my own numbers without asking', short: 'pull your own numbers', wants: 'wants to pull their own numbers without asking',
          focus: ['sql-select', 'sql-where', 'sql-group', 'sql-join'],
          b: { 'sql-select': 'The first step to not waiting on anyone', 'sql-where': 'Just the rows you care about', 'sql-group': 'The totals you usually ask for', 'sql-join': 'When the answer is in two places' },
          final: { title: 'This week’s numbers, by you', hook: 'Write the queries behind a report you normally wait for.', because: 'Pulling your own numbers: your goal', forYou: 'Based on a report you already use' } },
        { id: 'dash', label: 'Build a simple dashboard', short: 'build a simple dashboard', wants: 'wants to build a simple dashboard',
          focus: ['sql-group', 'sql-sort', 'sql-dash'],
          b: { 'sql-group': 'Every chart starts as a total', 'sql-sort': 'What goes at the top', 'sql-dash': 'From query to chart' },
          final: { title: 'Your first dashboard', hook: 'Three charts your team can check every week.', because: 'A simple dashboard: your goal', forYou: 'Built around your own work' } },
        { id: 'check', label: 'Check the numbers I’m given', short: 'check the numbers you’re given', wants: 'wants to check the numbers they’re given',
          focus: ['sql-null', 'sql-join', 'sql-group'],
          b: { 'sql-null': 'The most common reason numbers are wrong', 'sql-join': 'Bad joins double-count quietly', 'sql-group': 'So you can redo a total yourself' },
          final: { title: 'Find the mistake', hook: 'A real-looking report with an error in it. Find it.', because: 'Checking the numbers: your goal', forYou: 'The mistakes people really make' } },
      ],
      exam: [
        { id: 'module', label: 'Pass my databases module', short: 'pass your databases module', wants: 'wants to pass a databases module',
          focus: ['sql-tables', 'sql-join', 'sql-sub', 'sql-null'],
          b: { 'sql-tables': 'The theory questions start here', 'sql-join': 'Always on the paper', 'sql-sub': 'Where the harder marks are', 'sql-null': 'A favourite trick question' },
          final: { title: 'A practice exam', hook: 'Exam-style questions, timed and marked.', because: 'Passing your module: your goal', forYou: 'With the reasons for every mark' } },
        { id: 'joins', label: 'Write joins without guessing', short: 'write joins without guessing', wants: 'wants to write joins without guessing',
          focus: ['sql-join', 'sql-null', 'sql-sub'],
          b: { 'sql-join': 'Draw it, then write it', 'sql-null': 'Why joins drop rows', 'sql-sub': 'When a join isn’t the right tool' },
          final: { title: 'Ten joins, no guessing', hook: 'Ten questions, each needing the right join.', because: 'Joins without guessing: your goal', forYou: 'Gets harder as you go' } },
        { id: 'design', label: 'Design a clean database', short: 'design a clean database', wants: 'wants to design a clean database',
          focus: ['sql-tables', 'sql-join', 'sql-clean'],
          b: { 'sql-tables': 'Good design starts with good tables', 'sql-join': 'Design decides how easy joins are', 'sql-clean': 'What bad design costs later' },
          final: { title: 'Design a small database', hook: 'Tables for a small shop, with your reasons.', because: 'A clean design: your goal', forYou: 'Checked against common mistakes' } },
      ],
      life: [
        { id: 'try', label: 'See if a data job suits me', short: 'see if a data job suits you', wants: 'wants to see if a data job suits them',
          focus: ['sql-select', 'sql-group', 'sql-dash'],
          b: { 'sql-select': 'What the work feels like from the first line', 'sql-group': 'The kind of question you’d answer all day', 'sql-dash': 'Where the work ends up' },
          final: { title: 'A day of data work, in small', hook: 'A question, a query and a chart.', because: 'Seeing if it suits you: your goal', forYou: 'An honest taste of the job' } },
        { id: 'spending', label: 'Analyse my own spending', short: 'analyse your own spending', wants: 'wants to analyse their own spending',
          focus: ['sql-select', 'sql-group', 'sql-clean'],
          b: { 'sql-select': 'Your first look at your own data', 'sql-group': 'Totals by month and by shop', 'sql-clean': 'Bank exports are always messy' },
          final: { title: 'Your spending, in one query', hook: 'Where your money went last month.', because: 'Analysing your spending: your goal', forYou: 'With your own data, if you like' } },
        { id: 'how', label: 'Understand how data is stored', short: 'understand how data is stored', wants: 'wants to understand how data is stored',
          focus: ['sql-tables', 'sql-join', 'sql-null'],
          b: { 'sql-tables': 'How almost every app keeps its data', 'sql-join': 'How the pieces connect', 'sql-null': 'What “missing” means to a computer' },
          final: { title: 'Explain a database to a friend', hook: 'In two minutes, with one example.', because: 'Understanding how data is stored: your goal', forYou: 'Your own example' } },
      ],
    },
    gift: { title: 'The perfect query', sub: 'A one-of-a-kind collectible, made from your course.' },
    widen: [
      { id: 'sql-py', title: 'Python for data', why: 'What to learn after SQL' },
      { id: 'sql-stats', title: 'Statistics, simply', why: 'Know when a difference is real' },
      { id: 'track-data', title: 'Track: Getting a data job', why: 'SQL, spreadsheets and charts, joined into one path', big: true },
    ],
  };

  // ================= Investing (refreshed) =================
  const INVEST = {
    id: 'invest', title: 'How investing works', finalGlyph: 'tree', suggest: 'Learn how investing works', short: 'investing', subject: 'Money', palette: 'society', shape: 'c-growth',
    color: ['#5CCB8A', '#1F9D63'], ink: '#13744A',
    match: /invest|stock|shares?\b|money|finance|index fund|crypto|savings|compound|retire|pension|etf|portfolio/i,
    levels: { new: 'Savings account only', bit: 'A pension or an app', basics: 'I know stocks from bonds', deep: 'Valuation and portfolios' },
    levelLabels: { bit: 'I’ve dabbled' },
    levelClause: { new: 'is new to investing', bit: 'has dabbled in investing', basics: 'knows the basics of investing', deep: 'wants to go deep on investing' },
    open: { new: 'inv-idle', bit: 'inv-kinds', basics: 'inv-risk', deep: 'inv-value' },
    openBecause: {
      new: { life: 'Starts with what your savings are doing right now', any: 'Starts with what cash does when it just sits there' },
      bit: 'Starts by sorting out what you already hold',
      basics: 'You know the basics, so we start with risk',
      deep: 'You want depth, so we start with what a company is worth',
    },
    skip: { basics: ['inv-idle', 'inv-kinds'], deep: ['inv-idle', 'inv-grow', 'inv-kinds'] },
    core: ['inv-idle', 'inv-grow', 'inv-kinds', 'inv-risk', 'inv-index', 'inv-fees', 'inv-falls', 'inv-accounts', 'inv-bad', 'inv-plan', 'inv-read', 'inv-value'],
    lessons: {
      'inv-idle': { title: 'What idle savings cost you', hook: 'Inflation in plain numbers: what cash loses each year.', glyph: 'hourglass', shape: 'curve', because: 'Why doing nothing is also a choice', forYou: 'Work out what your own savings lost last year' },
      'inv-grow': { title: 'Why money grows', hook: 'Compound growth, and why time beats picking winners.', glyph: 'growth', shape: 'steps', because: 'The idea that makes starting early matter', forYou: 'Try your own numbers in a simple calculator' },
      'inv-kinds': { title: 'Stocks, bonds and cash', hook: 'Owning, lending and keeping. That’s most of it.', glyph: 'triangle', shape: 'split', because: 'The three things almost everything is made of', forYou: 'Sort what you already hold into the three' },
      'inv-risk': { title: 'Risk and reward', hook: 'Why a smoother ride usually earns less, and how much bumpiness you can live with.', glyph: 'gauge', shape: 'wave', because: 'Decides how much goes where', forYou: 'A short quiz on how you’d feel in a bad year' },
      'inv-index': { title: 'Index funds', hook: 'Buy a little of everything and stop guessing.', glyph: 'growth', shape: 'bars', because: 'The simplest sensible option', forYou: 'How to read a fund’s fact sheet' },
      'inv-fees': { title: 'Fees that eat returns', hook: '1% a year sounds small. Over 20 years it isn’t.', glyph: 'drop', shape: 'funnel', because: 'The cost you can control', forYou: 'Find the fee on anything you already own' },
      'inv-falls': { title: 'When markets fall', hook: 'What history says about staying in.', glyph: 'storm', shape: 'spike', because: 'They will fall. This is what to do then', forYou: 'Your plan for a bad year, written in advance' },
      'inv-accounts': { title: 'Where to keep it', hook: 'Pensions, tax-free accounts and plain brokerage: which first.', glyph: 'houses', shape: 'grid', because: 'The right account can be worth more than the right fund', forYou: 'An order to fill them in' },
      'inv-bad': { title: 'Spot a bad deal', hook: 'Five signs an “opportunity” isn’t one.', glyph: 'iris', shape: 'target', because: 'Avoiding one bad deal beats finding a good one', forYou: 'Check a real advert against the five signs' },
      'inv-plan': { title: 'Build a simple plan', hook: 'How much, how often, into what.', glyph: 'tree', shape: 'steps', because: 'Turns what you know into what you do', forYou: 'Written down in one page' },
      'inv-read': { title: 'Reading a company’s numbers', hook: 'Revenue, profit and cash, from a real annual report.', glyph: 'monitor', shape: 'bars', because: 'What the headlines are really about', forYou: 'One real report, read together' },
      'inv-value': { title: 'What a company is worth', hook: 'Earnings, multiples, and why prices move before results do.', glyph: 'atom', shape: 'ring', because: 'The question under every share price', forYou: 'Value a company you’ve heard of' },
    },
    outcomes: {
      life: [
        { id: 'savings', label: 'Put my savings to work without guessing', short: 'put your savings to work without guessing', wants: 'wants to put their savings to work without guessing',
          focus: ['inv-grow', 'inv-risk', 'inv-index', 'inv-fees', 'inv-falls'],
          b: { 'inv-grow': 'Why time matters more than picking winners', 'inv-risk': 'So you know how much up and down you can live with', 'inv-index': 'The no-guessing option to know first', 'inv-fees': 'Small fees quietly take a big share of a beginner’s returns', 'inv-falls': 'Markets will fall at some point. This is how not to guess then either' },
          fy: { 'inv-idle': 'Uses your own savings as the example', 'inv-grow': 'See your savings over 10 and 20 years', 'inv-risk': 'Find the mix you could sleep with', 'inv-index': 'Compare two real funds side by side', 'inv-fees': 'What 1% would cost your savings' },
          final: { title: 'Your first simple plan', hook: 'How much of your savings, into what, and how often. Written down.', because: 'Your savings working, without guessing: your goal', forYou: 'One page you can act on this month' } },
        { id: 'retire', label: 'Plan for retiring', short: 'plan for retiring', wants: 'wants to plan for retiring',
          focus: ['inv-grow', 'inv-accounts', 'inv-index', 'inv-plan'],
          b: { 'inv-grow': 'Time is your biggest advantage', 'inv-accounts': 'Pensions first, usually. Here’s why', 'inv-index': 'Simple, cheap and hard to beat', 'inv-plan': 'Turns a far-off goal into a monthly number' },
          final: { title: 'Your retirement sketch', hook: 'How much, from when, and what that adds up to.', because: 'Planning for retiring: your goal', forYou: 'Your own numbers' } },
        { id: 'calm', label: 'Stop worrying when markets fall', short: 'stay calm when markets fall', wants: 'wants to stay calm when markets fall',
          focus: ['inv-risk', 'inv-falls', 'inv-index'],
          b: { 'inv-risk': 'Worry often means the mix is wrong', 'inv-falls': 'What history says about staying in', 'inv-index': 'Why owning everything is calmer' },
          final: { title: 'Your plan for the next fall', hook: 'What you’ll do, decided now, while you’re calm.', because: 'Staying calm when markets fall: your goal', forYou: 'Short enough to reread on a bad day' } },
        { id: 'bad', label: 'Spot a bad deal', short: 'spot a bad deal', wants: 'wants to spot a bad deal',
          focus: ['inv-bad', 'inv-fees', 'inv-risk'],
          b: { 'inv-bad': 'The five warning signs', 'inv-fees': 'Where bad deals hide their cost', 'inv-risk': 'High returns always mean high risk' },
          final: { title: 'Check a real offer', hook: 'Run a real advert through everything you’ve learned.', because: 'Spotting a bad deal: your goal', forYou: 'Bring one you’ve seen' } },
      ],
      work: [
        { id: 'follow', label: 'Follow money talk in meetings', short: 'follow money talk in meetings', wants: 'wants to follow money talk in meetings',
          focus: ['inv-kinds', 'inv-risk', 'inv-read'],
          b: { 'inv-kinds': 'The words that come up most', 'inv-risk': 'What people mean by “risk”', 'inv-read': 'The numbers they quote' },
          final: { title: 'Explain this week’s market news', hook: 'Take one story and say what it means for your work.', because: 'Following money talk: your goal', forYou: 'A story from this week' } },
        { id: 'results', label: 'Read a company’s results', short: 'read a company’s results', wants: 'wants to read a company’s results',
          focus: ['inv-read', 'inv-value', 'inv-risk'],
          b: { 'inv-read': 'Where to look first', 'inv-value': 'What the results mean for the price', 'inv-risk': 'What could go wrong next year' },
          final: { title: 'Read a real annual report', hook: 'The five numbers that matter, found and explained.', because: 'Reading a company’s results: your goal', forYou: 'A company you work with' } },
        { id: 'terms', label: 'Use the terms with confidence', short: 'use the terms with confidence', wants: 'wants to use money terms with confidence',
          focus: ['inv-kinds', 'inv-index', 'inv-fees'],
          b: { 'inv-kinds': 'The basic words, properly', 'inv-index': 'A term everyone uses loosely', 'inv-fees': 'The one people forget to ask about' },
          final: { title: 'The 20 words that matter', hook: 'Explain each one in a sentence.', because: 'Using the terms with confidence: your goal', forYou: 'Quick to revise' } },
      ],
      career: [
        { id: 'job', label: 'Get ready for a finance job', short: 'get ready for a finance job', wants: 'wants to get ready for a finance job',
          focus: ['inv-read', 'inv-value', 'inv-risk', 'inv-kinds'],
          b: { 'inv-read': 'The skill every finance job uses', 'inv-value': 'The question interviewers love', 'inv-risk': 'The language of the job', 'inv-kinds': 'The basics, said properly' },
          final: { title: 'A finance interview, practised', hook: 'Five common questions, answered out loud.', because: 'Getting ready for a finance job: your goal', forYou: 'Feedback on each answer' } },
        { id: 'numbers', label: 'Read a company’s numbers', short: 'read a company’s numbers', wants: 'wants to read a company’s numbers',
          focus: ['inv-read', 'inv-value'],
          b: { 'inv-read': 'Revenue, profit and cash, in order', 'inv-value': 'What those numbers are worth' },
          final: { title: 'Read a real annual report', hook: 'The five numbers that matter, found and explained.', because: 'Reading a company’s numbers: your goal', forYou: 'A company you’d like to work for' } },
        { id: 'advise', label: 'Help others invest sensibly', short: 'help others invest sensibly', wants: 'wants to help others invest sensibly',
          focus: ['inv-risk', 'inv-index', 'inv-fees', 'inv-bad'],
          b: { 'inv-risk': 'Every good conversation starts here', 'inv-index': 'The default worth knowing well', 'inv-fees': 'What people overpay', 'inv-bad': 'What to warn people about' },
          final: { title: 'Talk a friend through it', hook: 'A first conversation about investing, practised.', because: 'Helping others invest sensibly: your goal', forYou: 'Plain words only' } },
      ],
      exam: [
        { id: 'pass', label: 'Pass my finance course', short: 'pass your finance course', wants: 'wants to pass a finance course',
          focus: ['inv-risk', 'inv-value', 'inv-kinds', 'inv-read'],
          b: { 'inv-risk': 'Risk and return is on every paper', 'inv-value': 'Where the harder marks are', 'inv-kinds': 'The definitions you’ll need', 'inv-read': 'For the case-study questions' },
          final: { title: 'A practice exam', hook: 'Exam-style questions, timed and marked.', because: 'Passing your course: your goal', forYou: 'With worked answers' } },
        { id: 'riskreturn', label: 'Explain risk and return clearly', short: 'explain risk and return clearly', wants: 'wants to explain risk and return clearly',
          focus: ['inv-risk', 'inv-index', 'inv-falls'],
          b: { 'inv-risk': 'The core idea, step by step', 'inv-index': 'A clear example for your answers', 'inv-falls': 'What the theory says about bad years' },
          final: { title: 'Three exam answers', hook: 'Write them, then compare with full-mark answers.', because: 'Explaining risk and return: your goal', forYou: 'Timed' } },
        { id: 'valuation', label: 'Work through valuation questions', short: 'work through valuation questions', wants: 'wants to work through valuation questions',
          focus: ['inv-read', 'inv-value'],
          b: { 'inv-read': 'Find the numbers you’ll need', 'inv-value': 'The methods, one at a time' },
          final: { title: 'Valuation practice', hook: 'Five questions, from easy to hard.', because: 'Working through valuation: your goal', forYou: 'Worked answers for each' } },
      ],
    },
    gift: { title: 'The money tree', sub: 'A one-of-a-kind collectible, made from your course.' },
    widen: [
      { id: 'inv-tax', title: 'Tax, simply', why: 'Keep more of what you make' },
      { id: 'inv-house', title: 'Buying a home', why: 'The biggest money decision most people make' },
      { id: 'track-money', title: 'Track: Your money, sorted', why: 'Saving, investing and tax, joined into one path', big: true },
    ],
  };

  // ================= Spanish (refreshed) =================
  const SPANISH = {
    id: 'spanish', title: 'Spanish for daily life', finalGlyph: 'speech', suggest: 'Learn Spanish for daily life', short: 'Spanish', subject: 'Language', palette: 'society', shape: 'c-es',
    color: ['#FFD43B', '#F08C00'], ink: '#8F5400',
    match: /spanish|español|espanol|castellano|spain|madrid|mexic|latin america/i,
    levels: { new: 'Hola and gracias', bit: 'An app, a holiday or two', basics: 'I can order and ask the way', deep: 'Real conversations, at speed' },
    levelLabels: { bit: 'I’ve dabbled' },
    levelClause: { new: 'is new to Spanish', bit: 'has dabbled in Spanish', basics: 'can get by in Spanish', deep: 'wants real conversations in Spanish' },
    open: { new: 'es-sounds', bit: 'es-reboot', basics: 'es-past', deep: 'es-listen' },
    openBecause: {
      new: 'Starts from hola: the sounds and your first ten words',
      bit: 'You’ve dabbled, so we start by waking up what you know',
      basics: 'You can get by, so we start with the past tense',
      deep: 'You want real conversations, so we start at real speed',
    },
    skip: { basics: ['es-sounds', 'es-reboot', 'es-ser'], deep: ['es-sounds', 'es-reboot', 'es-ser', 'es-ask'] },
    core: ['es-sounds', 'es-reboot', 'es-ser', 'es-ask', 'es-numbers', 'es-food', 'es-past', 'es-flat', 'es-doctor', 'es-phone', 'es-listen', 'es-chat', 'es-work', 'es-exam'],
    lessons: {
      'es-sounds': { title: 'Sounds and the first ten words', hook: 'The ten words that carry half of every conversation.', glyph: 'speech', shape: 'wave', because: 'Everything else is built from these', forYou: 'Say each one out loud' },
      'es-reboot': { title: 'What you already know', hook: 'Wake up the Spanish you’ve picked up, and fix the bits that stuck wrong.', glyph: 'brain', shape: 'burst', because: 'Builds on what you already have', forYou: 'A quick check of what stuck' },
      'es-ser': { title: 'Ser and estar', hook: 'Two ways to say “is”, and how to pick.', glyph: 'fork', shape: 'split', because: 'The mistake that gives learners away', forYou: 'Ten sentences, sorted fast' },
      'es-ask': { title: 'Asking questions', hook: 'Qué, cuándo, cuánto, dónde. The words that get you answers.', glyph: 'forget', shape: 'target', because: 'Questions keep any conversation moving', forYou: 'The five questions you’ll ask most' },
      'es-numbers': { title: 'Numbers, dates and money', hook: 'Prices, times and dates, heard at full speed.', glyph: 'growth', shape: 'bars', because: 'Numbers go by fast and matter a lot', forYou: 'Listen for prices and times' },
      'es-food': { title: 'Ordering food and drinks', hook: 'Me pones, para llevar, la cuenta.', glyph: 'berries', shape: 'ring', because: 'The conversation you’ll have most', forYou: 'A café order, start to finish' },
      'es-past': { title: 'Talking about yesterday', hook: 'The past tense you’ll use the most.', glyph: 'hourglass', shape: 'steps', because: 'Most stories are about what already happened', forYou: 'Tell someone about your weekend' },
      'es-flat': { title: 'Renting a flat', hook: 'Viewings, deposits, contracts, and the questions to ask.', glyph: 'houses', shape: 'grid', because: 'Words for finding a place to live', forYou: 'A viewing, played out' },
      'es-doctor': { title: 'At the doctor’s', hook: 'Say what hurts, since when, and understand what to do next.', glyph: 'stethoscope', shape: 'heart', because: 'When you need to be understood, fast', forYou: 'Describe a symptom, step by step' },
      'es-phone': { title: 'Phone calls', hook: 'No faces, no gestures. How to book, check and confirm.', glyph: 'mic', shape: 'wave', because: 'The hardest kind of listening', forYou: 'Book something by phone' },
      'es-listen': { title: 'Listening at real speed', hook: 'Native speakers, slowed down, then not.', glyph: 'notes', shape: 'wave', because: 'Real people don’t slow down', forYou: 'The same clip at three speeds' },
      'es-chat': { title: 'Keeping a chat going', hook: 'Fillers and questions that buy you time.', glyph: 'people', shape: 'scatter', because: 'So a conversation doesn’t stop at hello', forYou: 'Phrases to use when you get stuck' },
      'es-work': { title: 'Emails and meetings', hook: 'Polite, clear and short, the way colleagues write.', glyph: 'speech', shape: 'bars', because: 'Work Spanish has its own rules', forYou: 'A real email, rewritten' },
      'es-exam': { title: 'Exam practice', hook: 'Reading, listening and speaking tasks in the exam format.', glyph: 'flask', shape: 'target', because: 'Knowing the format is half the battle', forYou: 'Timed like the real thing' },
    },
    outcomes: {
      life: [
        { id: 'flatdoctor', label: 'Handle renting a flat and a doctor’s visit', short: 'handle renting a flat and a doctor’s visit', wants: 'needs it for renting a flat and a doctor’s visit',
          focus: ['es-ask', 'es-numbers', 'es-flat', 'es-doctor', 'es-phone', 'es-listen'],
          b: { 'es-ask': 'Questions first: on viewings, you’ll be the one asking', 'es-numbers': 'Rent, deposits, dates: the numbers you’ll hear on viewings', 'es-flat': 'The words for viewings and contracts', 'es-doctor': 'How to say what hurts, and since when', 'es-phone': 'Booking the doctor usually means a phone call', 'es-listen': 'Landlords and doctors won’t slow down for you' },
          fy: { 'es-reboot': 'Keeps what you know, fixes what stuck wrong', 'es-ask': 'The questions to ask on any viewing', 'es-numbers': 'Hear a rent and a deposit and get them right', 'es-flat': 'A viewing, played out with a landlord', 'es-doctor': 'Describe a symptom and understand the answer', 'es-phone': 'Book an appointment, start to finish', 'es-listen': 'A landlord and a receptionist, at full speed' },
          final: { title: 'Two real conversations', hook: 'A flat viewing and a doctor’s visit, played out start to finish.', because: 'Renting a flat and a doctor’s visit: your goal', forYou: 'You speak, we tell you what landed' } },
        { id: 'friends', label: 'Make friends in Spanish', short: 'make friends in Spanish', wants: 'wants to make friends in Spanish',
          focus: ['es-chat', 'es-past', 'es-listen', 'es-ask'],
          b: { 'es-chat': 'So a chat doesn’t end at hello', 'es-past': 'Friends tell stories', 'es-listen': 'Friends talk fast', 'es-ask': 'Questions show you’re interested' },
          final: { title: 'A ten-minute chat', hook: 'A real conversation with someone new, practised first.', because: 'Making friends in Spanish: your goal', forYou: 'About your own life' } },
        { id: 'trip', label: 'Get by on a trip', short: 'get by on a trip', wants: 'wants to get by on a trip',
          focus: ['es-food', 'es-ask', 'es-numbers'],
          b: { 'es-food': 'You’ll order food every day', 'es-ask': 'For directions and help', 'es-numbers': 'Prices and times' },
          final: { title: 'A day out in Spanish', hook: 'Breakfast, a ticket, directions, dinner.', because: 'Getting by on a trip: your goal', forYou: 'A day in a real city' } },
        { id: 'speed', label: 'Follow people at full speed', short: 'follow people at full speed', wants: 'wants to follow people at full speed',
          focus: ['es-listen', 'es-past', 'es-chat'],
          b: { 'es-listen': 'Training your ear, step by step', 'es-past': 'Most fast talk is storytelling', 'es-chat': 'How to keep up when you miss a word' },
          final: { title: 'A conversation, no subtitles', hook: 'A real clip, understood at full speed.', because: 'Following people at full speed: your goal', forYou: 'Slowed down only if you ask' } },
      ],
      work: [
        { id: 'clients', label: 'Talk with Spanish-speaking clients', short: 'talk with Spanish-speaking clients', wants: 'wants to talk with Spanish-speaking clients',
          focus: ['es-ask', 'es-numbers', 'es-phone', 'es-work'],
          b: { 'es-ask': 'Clients expect questions', 'es-numbers': 'Prices, dates and deadlines', 'es-phone': 'Most client talk is by phone', 'es-work': 'The polite forms clients expect' },
          final: { title: 'A client call, practised', hook: 'A real-sounding call, start to finish.', because: 'Talking with clients: your goal', forYou: 'About your own work' } },
        { id: 'emails', label: 'Write clear emails in Spanish', short: 'write clear emails in Spanish', wants: 'wants to write clear emails in Spanish',
          focus: ['es-ser', 'es-work', 'es-past'],
          b: { 'es-ser': 'The mistake that shows most in writing', 'es-work': 'How colleagues really write', 'es-past': 'For updates on what happened' },
          final: { title: 'Three real emails', hook: 'Write them, then see a native rewrite.', because: 'Clear emails: your goal', forYou: 'Emails you’d really send' } },
        { id: 'meeting', label: 'Follow a meeting in Spanish', short: 'follow a meeting in Spanish', wants: 'wants to follow a meeting in Spanish',
          focus: ['es-listen', 'es-work', 'es-chat'],
          b: { 'es-listen': 'Meetings move fast', 'es-work': 'The phrases meetings run on', 'es-chat': 'How to get a word in' },
          final: { title: 'A short meeting', hook: 'Follow it, then say one thing.', because: 'Following a meeting: your goal', forYou: 'A meeting like yours' } },
      ],
      career: [
        { id: 'cv', label: 'Reach a level I can put on my CV', short: 'reach a level for your CV', wants: 'wants a level they can put on their CV',
          focus: ['es-ser', 'es-past', 'es-listen', 'es-exam'],
          b: { 'es-ser': 'Tested at every level', 'es-past': 'The step up from beginner', 'es-listen': 'Half of any level test', 'es-exam': 'Know the format before you book' },
          final: { title: 'A level check', hook: 'A short test that tells you where you are.', because: 'A level for your CV: your goal', forYou: 'With what to do next' } },
        { id: 'job', label: 'Interview for a job in Spanish', short: 'interview for a job in Spanish', wants: 'wants to interview for a job in Spanish',
          focus: ['es-past', 'es-work', 'es-chat'],
          b: { 'es-past': 'Interviews are about what you’ve done', 'es-work': 'The formal Spanish interviewers expect', 'es-chat': 'For when you need a moment to think' },
          final: { title: 'A mock interview in Spanish', hook: 'Five common questions, answered out loud.', because: 'Interviewing in Spanish: your goal', forYou: 'About your real experience' } },
        { id: 'abroad', label: 'Get ready to work abroad', short: 'get ready to work abroad', wants: 'wants to get ready to work abroad',
          focus: ['es-flat', 'es-work', 'es-phone'],
          b: { 'es-flat': 'The first thing you’ll need', 'es-work': 'Your first week at work', 'es-phone': 'Banks, landlords and offices all call' },
          final: { title: 'Your first week, practised', hook: 'A flat, a bank and a first day at work.', because: 'Getting ready to work abroad: your goal', forYou: 'In the order you’ll need it' } },
      ],
      exam: [
        { id: 'dele', label: 'Pass the DELE A2', short: 'pass the DELE A2', wants: 'wants to pass the DELE A2',
          focus: ['es-ser', 'es-past', 'es-listen', 'es-exam'],
          b: { 'es-ser': 'Tested on every A2 paper', 'es-past': 'A2 expects the past tense', 'es-listen': 'The part people find hardest', 'es-exam': 'The A2 format, task by task' },
          final: { title: 'A practice DELE paper', hook: 'All four parts, timed.', because: 'Passing the DELE A2: your goal', forYou: 'Marked like the real thing' } },
        { id: 'class', label: 'Pass my Spanish class', short: 'pass your Spanish class', wants: 'wants to pass a Spanish class',
          focus: ['es-ser', 'es-past', 'es-exam'],
          b: { 'es-ser': 'On every test', 'es-past': 'Usually the biggest unit', 'es-exam': 'Practice in the test format' },
          final: { title: 'A practice test', hook: 'Grammar, reading and a short talk.', because: 'Passing your class: your goal', forYou: 'With the reasons for every mark' } },
        { id: 'oral', label: 'Do well in the speaking exam', short: 'do well in the speaking exam', wants: 'wants to do well in a Spanish speaking exam',
          focus: ['es-chat', 'es-past', 'es-listen'],
          b: { 'es-chat': 'Keeps you talking when you blank', 'es-past': 'Examiners ask about your past', 'es-listen': 'You have to understand the question first' },
          final: { title: 'A mock speaking exam', hook: 'Ten minutes, with an examiner’s questions.', because: 'Doing well in the speaking exam: your goal', forYou: 'Feedback on what to fix' } },
      ],
    },
    gift: { title: 'The ñ', sub: 'A one-of-a-kind collectible, made from your course.' },
    widen: [
      { id: 'es-culture', title: 'Spain, explained', why: 'The culture behind the language' },
      { id: 'es-latam', title: 'Spanish across Latin America', why: 'Same language, different words' },
      { id: 'track-es', title: 'Track: Living in Spanish', why: 'Daily life, work and friends, joined into one path', big: true },
    ],
  };

  const TOPICS = { ai: AI, physio: PHYSIO, sql: SQL, invest: INVEST, spanish: SPANISH };
  window.TOPICS = TOPICS;
  // The suggestions under "What do you want to learn?", in order
  window.TOPIC_SUGGEST = ['ai', 'physio', 'sql', 'invest', 'spanish'].map((id) => ({ id, label: TOPICS[id].suggest }));

  // ---------- The older catalog (kept: the shell's fallback reads it; typed topics like photography still match it) ----------
  const C = {
    heart: { id: 'heart', title: 'How your heart works', outcome: 'Understand your heart health', subject: 'Body', palette: 'body', shape: 'heart', color: ['#F783AC', '#D6336C'], ink: '#A3264F', match: /heart|cardi|pulse|heartbeat/i, goals: null, lessons: null },
    photo: {
      id: 'photo', title: 'Phone photography', outcome: 'Take better photos on your phone', short: 'photography', subject: 'Arts', palette: 'arts', shape: 'c-camera', color: ['#FFB23E', '#EF5B3A'], ink: '#B23A16',
      match: /photo|camera|picture|shoot|instagram|portrait|selfie/i,
      lessons: [
        { title: 'Find the light first', hook: 'The same face at noon and at golden hour. Light is the whole trick.' },
        { title: 'The rule of thirds, and breaking it', hook: 'Turn on the grid. Then learn when to ignore it.' },
        { title: 'Tap to focus, slide to expose', hook: 'Two taps most people never make.' },
        { title: 'Get closer than feels normal', hook: 'Fill the frame and the photo tells one story.' },
        { title: 'Portrait mode, done right', hook: 'Distance, angle, and why the background matters.' },
        { title: 'Shooting at night', hook: 'Hold still, find a light source, and let night mode work.' },
        { title: 'Edit in three moves', hook: 'Exposure, warmth, crop. Stop there.' },
        { title: 'Tell a story in five frames', hook: 'Wide, middle, close, detail, moment.' },
        { title: 'Your best shot', hook: 'Pick one photo and make it great.' },
      ],
    },
    python: {
      id: 'python', title: 'Python from scratch', outcome: 'Learn the basics of Python', short: 'Python', subject: 'Tech', palette: 'tech', shape: 'c-code', color: ['#5FD0F2', '#1A8FD0'], ink: '#0F5F94',
      match: /python|cod(e|ing)|program|software|script|develop|computer science/i,
      lessons: [
        { title: 'Your first line of code', hook: 'print("hello"), and what actually happens.' },
        { title: 'Variables are labelled boxes', hook: 'Store a value, change it, use it again.' },
        { title: 'Making decisions with if', hook: 'Teach the program to choose.' },
        { title: 'Loops do the repeating', hook: 'One line that runs a thousand times.' },
        { title: 'Lists and dictionaries', hook: 'Keep many things in one place.' },
        { title: 'Functions you can reuse', hook: 'Name a piece of work and call it any time.' },
        { title: 'Reading and writing files', hook: 'Your program meets the real world.' },
        { title: 'Fixing errors calmly', hook: 'Reading a traceback, top to bottom.' },
        { title: 'Build a tiny project', hook: 'A to-do list that remembers.' },
      ],
    },
    speak: {
      id: 'speak', title: 'Speak with confidence', outcome: 'Get confident with public speaking', short: 'public speaking', subject: 'Communication', palette: 'mind', shape: 'c-mic', color: ['#B197FC', '#7048E8'], ink: '#5235B8',
      match: /speak|speech|present|public|stage|confiden|pitch/i,
      lessons: [
        { title: 'Why your body panics', hook: 'Fight or flight, and the breath that switches it off.' },
        { title: 'Start strong', hook: 'The first 15 seconds decide the rest.' },
        { title: 'One idea per talk', hook: 'If they remember one thing, make it this.' },
        { title: 'Tell it as a story', hook: 'Problem, struggle, change.' },
        { title: 'Pace, pause, volume', hook: 'Silence is louder than filler words.' },
        { title: 'Hands, eyes and feet', hook: 'What to do with your body.' },
        { title: 'Slides that help', hook: 'Fewer words, bigger pictures.' },
        { title: 'Handling questions', hook: 'Including the ones you can’t answer.' },
        { title: 'Your two-minute talk', hook: 'Record it, watch it, do it again.' },
      ],
    },
  };
  // The five topics also appear in the catalog shape, so registerCatalogCourse still works if buildCourse is missing
  Object.values(TOPICS).forEach((t) => {
    C[t.id] = { id: t.id, title: t.title, outcome: t.suggest, short: t.short, subject: t.subject, palette: t.palette, shape: t.shape, color: t.color, ink: t.ink, match: t.match,
      lessons: t.core.slice(0, 9).map((id) => ({ title: t.lessons[id].title, hook: t.lessons[id].hook })) };
  });
  window.CATALOG = C;
  window.CATALOG_ORDER = { work: ['ai', 'sql', 'invest', 'spanish'], exam: ['physio', 'sql', 'spanish', 'ai'], career: ['sql', 'ai', 'invest', 'spanish'], life: ['invest', 'spanish', 'physio', 'ai'] };

  // Typed text or a suggestion → a topic id ('ai', 'physio', 'sql', 'invest', 'spanish', 'photo', 'python', 'speak'), or 'custom'.
  const MATCH_ORDER = ['ai', 'sql', 'spanish', 'invest', 'physio', 'photo', 'python', 'speak'];
  window.courseFor = function (text) {
    const t = String(text || '').trim(); if (!t) return 'custom';
    const lower = t.toLowerCase();
    for (const id of MATCH_ORDER) { const c = C[id]; if (lower === id || lower === (c.outcome || '').toLowerCase() || lower === (c.title || '').toLowerCase()) return id; }
    for (const id of MATCH_ORDER) if (C[id].match && C[id].match.test(t)) return id;
    return 'custom';
  };

  // ---------- Custom topics: the words the person typed ----------
  const VERBS = /^(bake|play|cook|make|draw|write|code|speak|run|build|use|sing|paint|understand|get|become|start|do|read|fix|design|grow|train|swim|knit|sew|ride|drive|dance|edit|plan|manage|lead|sell|negotiate|meditate|garden|brew|fly|sail|climb|surf|ski|juggle|invest|learn)\b/i;
  const PROPER = /^(english|spanish|french|german|italian|portuguese|mandarin|chinese|cantonese|japanese|korean|arabic|hindi|urdu|tamil|bengali|russian|latin|greek|dutch|swedish|turkish|hebrew|python|excel|java|javascript|figma|photoshop|rome|roman|egypt|india|china|japan|europe|africa|america|shakespeare|bach|mozart)\b/i;
  const STOP = /^(the|a|an|of|to|for|and|my|how|in|on|with|about|at|is|it|i|be|better|basics|more|really|actually|properly)$/i;
  function cleanTopic(text) {
    let s = String(text || '').trim().replace(/[.?!]+$/, '');
    s = s.replace(/^(i\s+(want|would like|’d like|'d like)\s+to\s+)?(learn(ing)?\s+)?(how\s+to\s+|to\s+|about\s+|the\s+basics\s+of\s+)?/i, '').trim();
    return s;
  }
  // The short word for "Why X, why now?" and the particle word
  function customInfo(text) {
    const s = cleanTopic(text), words = s.split(/\s+/).filter(Boolean);
    const verb = VERBS.test(s);
    const short = s && words.length <= 3 && s.length <= 22 ? s : '';
    const nouns = words.filter((w) => !STOP.test(w) && !VERBS.test(w)).map((w) => w.replace(/[^\p{L}\p{N}’'-]/gu, ''));
    const best = nouns.filter((w) => w.length <= 10).sort((a, b) => b.length - a.length)[0] || '';
    const word = best ? best.charAt(0).toLowerCase() + best.slice(1) : (s.charAt(0) || '?').toUpperCase();
    // A capital at the very start is usually just the start of a sentence; names keep theirs
    const proper = PROPER.test(s);
    const fixed = proper ? s.charAt(0).toUpperCase() + s.slice(1) : lc1(s);
    const phrase = s && s.length <= 40 ? fixed : '';
    return { text: s || String(text || '').trim(), short: short ? fixed : '', phrase, verb, word: /^[A-Z]{2,}$/.test(best) ? best : word };
  }
  window.customTopic = customInfo;

  // A topic-like object for anything without a prepared plan: custom text, or the older catalog courses
  function genericTopic(id, label) {
    const cat = C[id];
    const ci = customInfo(label);
    // noun: what to call it in a sentence ("chess", "the history of the Roman empire"); act: a verb phrase ("bake sourdough bread")
    const noun = cat ? cat.short || lc1(cat.title) : (!ci.verb ? ci.phrase : '');
    const act = !cat && ci.verb ? lc1(ci.phrase || ci.text) : '';
    const short = cat ? cat.short || cat.title : ci.short; // for "Why X, why now?"
    const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
    let lessons = {}, core = [];
    if (cat && cat.lessons) {
      const shapes = ['burst', 'grid', 'spike', 'split', 'wave', 'steps', 'ring', 'bars', 'target'];
      const why = ['Where everyone starts', 'The first change you’ll notice', 'Builds on the stop before it', 'A skill you’ll use every time', 'Where most people get stuck', 'Puts the earlier stops together', 'The step that makes it yours', 'Brings it all together', 'Shows you how far you’ve come'];
      cat.lessons.forEach((l, i) => { const lid = `${id}-l${i + 1}`; core.push(lid); lessons[lid] = { title: l.title, hook: l.hook, glyph: (window.OrbGlyphs && OrbGlyphs.ids[id]) || 'neuron', shape: shapes[i % shapes.length], because: why[i] || why[2], forYou: 'Short, with one thing to try' }; });
    } else {
      const sn = ci.short && !ci.verb ? ci.short : '';
      const L = [
        ['cu-what', sn ? `What ${sn} is, in plain words` : 'The short version', 'Before anything else, the idea in a few sentences.', 'neuron', 'burst', 'Everything else hangs off this', 'Ends with one sentence you could say to a friend'],
        ['cu-ideas', 'The ideas it rests on', 'Three or four ideas that make the rest easy.', 'atom', 'grid', 'Learn these and the rest gets easier', 'Each idea with one clear example'],
        ['cu-words', 'The words people use', 'The terms you’ll hear, each explained once, properly.', 'speech', 'scatter', 'So the jargon stops getting in the way', 'A short list you can come back to'],
        ['cu-how', 'How it works, step by step', 'Slowly, in order, with nothing skipped.', 'cycle', 'steps', 'The part most explanations rush', 'One step at a time, at your pace'],
        ['cu-mistakes', 'Common beginner mistakes', 'What trips people up, and how to avoid it.', 'forget', 'spike', 'Saves you from the usual slips', 'Spot each mistake before we name it'],
        ['cu-try', 'Try it yourself', 'Put what you’ve learned to work on something small.', 'brush', 'target', 'Doing it is how it sticks', 'A small task you can finish today'],
        ['cu-real', sn ? `${cap(sn)} in real life` : 'In real life', 'Where it shows up outside the lesson.', 'houses', 'ring', 'Connects it to things you already know', 'Examples from everyday life'],
        ['cu-hard', 'The harder parts', 'The bits people avoid, taken slowly.', 'galaxy', 'wave', 'Where real understanding starts', 'Taken slowly, with checks along the way'],
        ['cu-next', 'Where to go from here', 'What to learn next, and what to skip.', 'tree', 'curve', 'So you know what comes after', 'A short list of next steps'],
      ];
      L.forEach(([lid, title, hook, glyph, shape, because, forYou]) => { core.push(lid); lessons[lid] = { title, hook, glyph, shape, because, forYou }; });
    }
    const k = core;
    // pick(noun version, verb version, plain version)
    const pick = (n, v, plain) => (noun ? n : act ? v : plain);
    const O = (oid, label2, short2, wants, focus, finalTitle) => ({ id: oid, label: label2, short: short2, wants, focus,
      b: { [focus[0]]: `Picked because you want to ${short2}` },
      final: { title: finalTitle, hook: 'Everything in your plan, put to work in one go.', because: `${cap(short2)}: your goal` } });
    const outcomes = {
      work: [
        O('use', pick(`Use ${noun} at work`, 'Use it at work', 'Use it at work'), pick(`use ${noun} at work`, `${act} for work`, 'use it at work'), pick(`wants to use ${noun} at work`, `wants to ${act} for work`, 'wants to use it at work'), [k[2], k[5], k[6]], 'Use it on a real task'),
        O('explain', 'Explain it to my team', pick(`explain ${noun} to your team`, `show your team how to ${act}`, 'explain it to your team'), pick(`wants to explain ${noun} to the team`, `wants to show the team how to ${act}`, 'wants to explain it to the team'), [k[1], k[2], k[4]], 'Your 2-minute explanation'),
        O('decide', 'Make better calls with it', 'make better calls with it', pick(`wants to make better calls with ${noun}`, `wants to ${act} with good judgement`, 'wants to make better calls with it'), [k[1], k[4], k[7]], 'One real decision, worked through')],
      exam: [
        O('pass', 'Pass my exam on it', 'pass your exam', pick(`wants to pass an exam on ${noun}`, 'wants to pass an exam on it', 'wants to pass an exam on it'), [k[1], k[3], k[7]], 'A practice exam'),
        O('weak', 'Fix the parts I’m weak in', 'fix the parts you’re weak in', 'wants to fix the parts they’re weak in', [k[3], k[4], k[7]], 'A check on the hard parts'),
        O('revise', 'Revise the essentials fast', 'revise the essentials fast', pick(`wants to revise ${noun} fast`, 'wants to revise the essentials fast', 'wants to revise the essentials fast'), [k[1], k[2], k[3]], 'A last-week revision check')],
      career: [
        O('hired', 'Get a job that uses it', 'get a job that uses it', pick(`wants a job that uses ${noun}`, `wants a job where they ${act}`, 'wants a job that uses it'), [k[2], k[5], k[6]], 'Talk about it like you do it'),
        O('show', 'Make something I can show', 'make something you can show', pick(`wants to make something with ${noun} to show`, `wants to ${act} well enough to show people`, 'wants to make something to show'), [k[3], k[5], k[7]], 'Something to show'),
        O('talk', 'Talk about it well in interviews', 'talk about it well in interviews', pick(`wants to talk about ${noun} well in interviews`, 'wants to talk about it well in interviews', 'wants to talk about it well in interviews'), [k[1], k[2], k[4]], 'A mock interview')],
      life: [
        O('understand', pick(`Understand ${noun} properly`, 'Learn to do it properly', 'Understand it properly'), pick(`understand ${noun} properly`, `${act} properly`, 'understand it properly'), pick(`wants to understand ${noun} properly`, `wants to ${act} properly`, 'wants to understand it properly'), [k[1], k[3], k[7]], pick('Explain it to a friend', 'Your best attempt yet', 'Explain it to a friend')),
        O('everyday', 'Use it in everyday life', 'use it in everyday life', pick(`wants to use ${noun} in everyday life`, `wants to ${act} as part of everyday life`, 'wants to use it in everyday life'), [k[5], k[6], k[4]], 'Use it on something real'),
        O('fun', 'Get good at it for fun', 'get good at it for fun', pick(`wants to get good at ${noun} for fun`, `wants to ${act} for fun`, 'wants to get good at it for fun'), [k[3], k[5], k[7]], 'Your best attempt yet')],
    };
    const title = cat ? cat.title : cap(ci.phrase || ci.text);
    return {
      id: cat ? id : 'custom', title, suggest: label, short: short || 'this', subject: cat ? cat.subject : 'Mind', palette: cat ? cat.palette : 'mind', shape: cat ? cat.shape : null, word: ci.word,
      color: cat ? cat.color : ['#F07B5A', '#B83A1C'], ink: cat ? cat.ink : '#9A2F15', custom: !cat, finalGlyph: 'sprout',
      levels: { new: 'Starting from zero', bit: 'Picked up a few things', basics: 'I know the basics', deep: 'Ready for the hard parts' },
      levelLabels: { bit: 'I’ve picked some up' },
      levelClause: { new: noun ? `is new to ${noun}` : 'is starting from zero', bit: 'has picked up a few things', basics: 'knows the basics', deep: 'wants to go deep' },
      open: { new: k[0], bit: k[0], basics: k[1], deep: k[3] },
      openBecause: { new: 'Starts from zero, with the short version', bit: 'Starts by tidying up what you’ve picked up', basics: 'You know the basics, so we skip the intro', deep: 'You want depth, so we go straight to how it works' },
      skip: { basics: [k[0]], deep: [k[0], k[1], k[2]] },
      core, lessons, outcomes,
      gift: { title: 'Your first collectible', sub: 'A one-of-a-kind collectible, made from your course.' },
      widen: [],
    };
  }

  // ---------- Public helpers onboarding uses ----------
  function topicFor(p) {
    const id = p && p.topic;
    if (TOPICS[id]) return TOPICS[id];
    return genericTopic(C[id] && C[id].lessons ? id : 'custom', (p && p.topicLabel) || '');
  }
  window.topicFor = topicFor;
  // What the questions need: names, levels, the particle shape
  window.topicInfo = function (p) {
    const T = topicFor(p);
    return { id: T.id, title: T.title, short: T.short, suggest: T.suggest, subject: T.subject, palette: T.palette, shape: T.shape, word: T.word, color: T.color, ink: T.ink, custom: !!T.custom, levels: T.levels, levelLabels: T.levelLabels || {}, verb: T.custom && customInfo(p.topicLabel).verb };
  };
  // "What would make this worth it?": 3 or 4 outcomes for this topic, reason and role
  function outcomeList(p, T) {
    const all = (T.outcomes[p.reason] || T.outcomes.life || []);
    return all.filter((o) => !o.roles || (p.role && o.roles.includes(p.role)) || (!p.role && o.roles.includes('other'))).slice(0, 4);
  }
  window.outcomesFor = function (p) { return outcomeList(p, topicFor(p)).map((o) => ({ id: o.id, label: o.label, short: o.short })); };
  // How many stops the plan has, from the time answers (6 to 9, including a review and a final)
  window.planLength = function (daily, span) {
    const d = +daily || 10, bonus = { week: 0, weekend: 0, twoweeks: 1, month: 2 }[span] || 1;
    return Math.max(6, Math.min(9, 6 + bonus + (d >= 15 ? 1 : 0)));
  };

  // ---------- The course builder ----------
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36).slice(0, 6); };
  const clean = (s) => String(s || '').trim().replace(/[.!]+$/, '');
  function summaryFor(p, T, out) {
    const roleT = clean(p.roleText);
    let who, clause = '';
    if (roleT) who = an(lc1(roleT));
    else if (p.reason === 'exam' || p.role === 'student') who = 'a student';
    else if (p.role && ROLE_NOUN[p.role] && (p.reason === 'work' || p.reason === 'career')) who = ROLE_NOUN[p.role];
    else who = p.level === 'new' ? 'a beginner' : 'someone';
    if (who === 'someone' || who === 'a student') clause = (T.levelClause || {})[p.level] || '';
    if (out.custom) {
      const g = clean(out.label);
      return { text: `Built for ${who}${clause ? ' who ' + clause : ''}, around one goal: “${g}”.`, keys: [roleT ? lc1(roleT) : '', g].filter(Boolean) };
    }
    const wants = out.wants;
    const core = wants.replace(/^(wants to|wants|needs it for|needs)\s+/, '');
    return { text: `Built for ${who} who ${clause ? clause + ' and ' : ''}${wants}.`, keys: [roleT ? lc1(roleT) : '', core].filter(Boolean) };
  }
  const REVIEW_BECAUSE = { exam: 'A timed check, like the real paper', work: 'Brings back the first half before you build on it', career: 'Brings back the first half before you build on it', life: 'A short check, so the first half sticks' };

  window.buildCourse = function (profile) {
    const p = Object.assign({ reason: 'life', level: 'new', daily: 10, span: 'twoweeks' }, profile || {});
    const T = topicFor(p);
    const list = outcomeList(p, T);
    let out = list.find((o) => o.id === p.goal) || (T.outcomes[p.reason] || []).find((o) => o.id === p.goal);
    if (!out && p.goal === 'other' && clean(p.goalText)) {
      const g = clean(p.goalText), base = list[0] || { focus: [] };
      out = { id: 'other', custom: true, label: g, short: lc1(g), focus: base.focus, final: { title: 'The goal you set', hook: `Everything in your plan, put to work on one thing: ${lc1(g)}.`, because: `${g}: your goal` } };
    }
    out = out || list[0];
    const n = window.planLength(p.daily, p.span), nLessons = n - 2;
    const skip = new Set((T.skip || {})[p.level] || []);
    const opener = (T.open || {})[p.level] || T.core[0];
    const picked = [opener];
    const add = (id) => { if (id && T.lessons[id] && !picked.includes(id) && !skip.has(id) && picked.length < nLessons) picked.push(id); };
    (out.focus || []).forEach(add);
    T.core.forEach(add);
    // The opener stays first; the rest follow the teaching order
    const rest = picked.slice(1).sort((a, b) => T.core.indexOf(a) - T.core.indexOf(b));
    const order = [opener].concat(rest);

    const S = summaryFor(p, T, out);
    const cid = 'my-' + T.id + '-' + hash(JSON.stringify([p.topic, p.topicLabel, p.reason, p.role, p.roleText, p.level, p.goal, p.goalText, p.daily, p.span]));
    const ctx = { p, T };
    const lessons = order.map((id, i) => {
      const L = T.lessons[id];
      let because = i === 0 ? byReason(T.openBecause[p.level], p) : (out.b && out.b[id]) || L.because;
      because = val(because, p, ctx);
      const forYou = val((out.fy && out.fy[id]) || L.forYou, p, ctx);
      return { id, kind: 'lesson', title: L.title, hook: L.hook, shape: L.shape || T.shape || 'burst', glyph: L.glyph || 'neuron', because, forYou, focus: (out.focus || []).includes(id) || undefined };
    });
    const half = Math.ceil(lessons.length / 2);
    lessons.splice(half, 0, { id: cid + '-review', kind: 'review', title: 'Quick review', hook: 'A few fast questions on what you’ve covered so far.', glyph: 'forget', shape: 'qmark', because: REVIEW_BECAUSE[p.reason] || REVIEW_BECAUSE.life, forYou: 'Only on the stops you’ve done' });
    const F = out.final || {};
    lessons.push({ id: cid + '-final', kind: 'final', title: F.title || 'Final challenge', hook: F.hook || 'Put it all together, and earn your collectible.', glyph: F.glyph || T.finalGlyph || 'sprout', shape: T.shape || 'burst',
      because: val(F.because, p, ctx) || `${out.short}: your goal`, forYou: val(F.forYou, p, ctx) || 'Earns your collectible' });

    const base = (window.COURSES && COURSES.heart) || {};
    const SP = (id, label) => ({ id, label, lessons: 99 });
    const course = Object.assign({}, base, {
      id: cid, title: T.title, topic: T.title, topicId: T.id, topicLabel: p.topicLabel || T.suggest, subject: T.subject, palette: T.palette, color: T.color, ink: T.ink,
      shape: T.shape || 'burst', word: T.word || null,
      persona: p.persona || null, profile: Object.assign({}, p),
      summary: S.text, summaryKeys: S.keys, goalShort: out.short, goalText: out.custom ? out.label : out.label,
      goals: list.map((o) => ({ id: o.id, label: o.label, sub: '' })),
      spans: [SP('week', 'A week'), SP('twoweeks', 'Two weeks'), SP('month', 'A month'), SP('weekend', 'A weekend')],
      daily: ['5 min a day', '10 min a day', '15 min a day', '20 min a day'],
      lessons,
      gift: { id: 'gift-' + T.id, title: (T.gift || {}).title || 'Your collectible', sub: (T.gift || {}).sub || 'A one-of-a-kind collectible, made from your course.', shape: (T.gift || {}).shape || T.shape || 'burst', palette: (T.gift || {}).palette || T.palette },
      widen: T.widen || [],
    });
    window.COURSES = window.COURSES || {};
    COURSES[cid] = course;
    return cid;
  };

  // ---------- Particle shapes for the courses ----------
  const DRAW = {};
  const k = (S) => (v) => (v * S) / 220;
  const rr = (x, X, Y, w, h, r) => { x.beginPath(); x.roundRect ? x.roundRect(X, Y, w, h, r) : x.rect(X, Y, w, h); };
  const displayFont = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--display').trim();
    return v || '"Geist", ui-sans-serif, system-ui, sans-serif';
  };
  const textShape = (txt, weight) => (x, S) => {
    // Fraunces has an optical-size axis (smaller text is relatively wider), so measure again until it fits
    let size = S * 0.9; x.font = `${weight} ${size}px ${displayFont()}`;
    for (let i = 0, w = x.measureText(txt).width; w > S * 0.92 && i < 6; i++, w = x.measureText(txt).width) { size *= ((S * 0.92) / w) * 0.98; x.font = `${weight} ${size}px ${displayFont()}`; }
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, S / 2, S * 0.52);
  };
  window.textShape = textShape;
  DRAW['c-ai'] = textShape('AI', 600);
  DRAW['c-es'] = textShape('ñ', 560);
  DRAW['c-db'] = (x, S) => {
    const s = k(S);
    [[150, 52], [104, 52], [58, 52]].forEach(([cy]) => { x.beginPath(); x.ellipse(s(110), s(cy + 20), s(80), s(24), 0, 0, 6.283); x.fill(); rr(x, s(30), s(cy - 4), s(160), s(24), 0); x.fill(); });
    x.beginPath(); x.ellipse(s(110), s(54), s(80), s(24), 0, 0, 6.283); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.lineWidth = s(9);
    [96, 142].forEach((cy) => { x.beginPath(); x.ellipse(s(110), s(cy), s(80), s(24), 0, 0.02 * Math.PI, 0.98 * Math.PI); x.stroke(); });
    x.beginPath(); x.ellipse(s(110), s(54), s(64), s(14), 0, 0, 6.283); x.stroke();
    x.globalCompositeOperation = 'source-over';
  };
  DRAW['c-camera'] = (x, S) => {
    const s = k(S);
    rr(x, s(78), s(40), s(64), s(30), s(10)); x.fill();
    rr(x, s(18), s(58), s(184), s(132), s(28)); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(s(110), s(124), s(46), 0, 6.283); x.fill();
    x.globalCompositeOperation = 'source-over'; x.beginPath(); x.arc(s(110), s(124), s(30), 0, 6.283); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(s(100), s(114), s(9), 0, 6.283); x.fill();
    x.beginPath(); x.arc(s(170), s(84), s(8), 0, 6.283); x.fill(); x.globalCompositeOperation = 'source-over';
  };
  DRAW['c-growth'] = (x, S) => {
    const s = k(S);
    [[22, 140, 36, 62], [74, 110, 36, 92], [126, 76, 36, 126]].forEach(([X, Y, w, h]) => { rr(x, s(X), s(Y), s(w), s(h), s(9)); x.fill(); });
    x.lineWidth = s(13); x.beginPath(); x.moveTo(s(26), s(96)); x.lineTo(s(84), s(54)); x.lineTo(s(118), s(76)); x.lineTo(s(184), s(24)); x.stroke();
    x.beginPath(); x.moveTo(s(204), s(8)); x.lineTo(s(198), s(58)); x.lineTo(s(156), s(26)); x.fill();
    rr(x, s(178), s(44), s(36), s(158), s(9)); x.fill();
  };
  DRAW['c-code'] = (x, S) => {
    const s = k(S);
    x.lineWidth = s(22);
    x.beginPath(); x.moveTo(s(68), s(48)); x.lineTo(s(16), s(110)); x.lineTo(s(68), s(172)); x.stroke();
    x.beginPath(); x.moveTo(s(152), s(48)); x.lineTo(s(204), s(110)); x.lineTo(s(152), s(172)); x.stroke();
    x.beginPath(); x.moveTo(s(128), s(30)); x.lineTo(s(92), s(190)); x.stroke();
  };
  DRAW['c-mic'] = (x, S) => {
    const s = k(S);
    rr(x, s(72), s(10), s(76), s(126), s(38)); x.fill();
    x.lineWidth = s(14); x.beginPath(); x.arc(s(110), s(96), s(62), 0.05 * Math.PI, 0.95 * Math.PI); x.stroke();
    rr(x, s(102), s(158), s(16), s(36), s(4)); x.fill();
    rr(x, s(62), s(188), s(96), s(18), s(9)); x.fill();
  };
  const SHAPED = [...Object.values(TOPICS), C.photo, C.python, C.speak];
  function defineShapes() {
    if (!window.Brain || !Brain.defineIcon) return;
    SHAPED.forEach((c) => { if (DRAW[c.shape] && c.shape !== 'heart') Brain.defineIcon(c.shape, DRAW[c.shape], { grad: c.color }); });
  }
  defineShapes();
  // The letter shapes use the display face: redraw them once it has loaded
  if (document.fonts && document.fonts.load) document.fonts.load(`600 200px ${displayFont()}`).then(() => {
    if (window.Brain && Brain.defineIcon) [AI, SPANISH].forEach((c) => Brain.defineIcon(c.shape, DRAW[c.shape], { grad: c.color }));
  }).catch(() => {});

  // A solid colour-gradient tile icon for a course, as an <img>
  const TILE = {};
  window.catalogTile = function (id, size = 28) {
    const c = TOPICS[id] || C[id]; if (!c) return '';
    const draw = DRAW[c.shape]; if (!draw) return '';
    if (!TILE[id]) {
      const S = 132, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d');
      x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineCap = 'round'; x.lineJoin = 'round';
      x.save(); x.translate(S * 0.06, S * 0.06); draw(x, S * 0.88); x.restore();
      x.globalCompositeOperation = 'source-in';
      const g = x.createLinearGradient(0, 0, S, S); g.addColorStop(0, c.color[0]); g.addColorStop(1, c.color[1]);
      x.fillStyle = g; x.fillRect(0, 0, S, S);
      TILE[id] = cv.toDataURL();
    }
    return `<img src="${TILE[id]}" width="${size}" height="${size}" alt="">`;
  };
})();
