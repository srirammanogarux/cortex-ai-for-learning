// Outcome courses offered under "What do you want to learn?". Owner: A · Onboarding.
// Generation is still faked: the build reuses the heart roadmap's structure (COURSES.heart + courseRoadmap)
// and swaps in these lesson titles. Learn keeps reading COURSES.heart; `courseId` in onboarding:done lets the lead wire more later.
//
// Each course: title, outcome (what the user picks), level, subject, palette (Brain palette), shape (particle shape),
// color [light, deep] + ink (text accent), span (default length), intents (which "What brings you here?" answers it suits,
// best first), match (typed-text keywords), goals (4, mapped in order to the heart goals how/condition/healthy/exam),
// lessons (8 to 10, { title, hook }).
(function () {
  const C = {
    heart: {
      id: 'heart', title: 'How your heart works', outcome: 'Understand your heart health', level: 'Beginner', subject: 'Body',
      palette: 'body', shape: 'heart', color: ['#F783AC', '#D6336C'], ink: '#A3264F', span: '2 weeks',
      intents: ['life', 'curious', 'exam'], match: /heart|cardi|pulse|blood\s*pressure|heartbeat|beat/i,
      goals: null, // uses COURSES.heart.goals
      lessons: null, // uses COURSES.heart.lessons
    },
    bio12: {
      id: 'bio12', title: 'Class 12 Biology: the heart', outcome: 'Pass your Class 12 biology exam', level: 'Exam prep', subject: 'Biology',
      palette: 'body', shape: 'c-flask', color: ['#F783AC', '#C2255C'], ink: '#A3264F', span: '2 weeks',
      intents: ['exam', 'curious'], match: /class\s*1[12]|biology|bio\b|board exam|neet|circulat/i,
      goals: [
        { id: 'marks', label: 'Score well on the paper', sub: 'Key answers, diagrams, past questions', shape: 'c-flask' },
        { id: 'weak', label: 'Fix a chapter I’m weak in', sub: 'Go back over what didn’t click', shape: 'f-sharpen' },
        { id: 'diagrams', label: 'Draw and label diagrams', sub: 'The ones examiners always ask for', shape: 'f-teacher' },
        { id: 'revise', label: 'Quick revision before the exam', sub: 'Just the must-knows', shape: 'f-exam' },
      ],
      lessons: [
        { title: 'The heart’s four chambers', hook: 'The diagram you’ll draw in the exam, built up piece by piece.' },
        { title: 'Valves and why blood goes one way', hook: 'Tricuspid, bicuspid, semilunar: what each one guards.' },
        { title: 'Double circulation', hook: 'Why mammals run two loops, and fish only one.' },
        { title: 'The SA node and the beat', hook: 'The pacemaker, the AV node, and the bundle of His.' },
        { title: 'The cardiac cycle', hook: 'Systole and diastole in 0.8 seconds.' },
        { title: 'Reading an ECG', hook: 'P, QRS and T: what each wave means.' },
        { title: 'Cardiac output', hook: 'Stroke volume × heart rate, with worked examples.' },
        { title: 'Disorders on the syllabus', hook: 'Hypertension, angina and heart failure, in two lines each.' },
        { title: 'Past paper practice', hook: 'Five questions that come up almost every year.' },
      ],
    },
    photo: {
      id: 'photo', title: 'Phone photography', outcome: 'Shoot great photos on your phone', level: 'Beginner', subject: 'Arts',
      palette: 'arts', shape: 'c-camera', color: ['#FFB23E', '#EF5B3A'], ink: '#B23A16', span: '2 weeks',
      intents: ['skill', 'curious', 'career'], match: /photo|camera|picture|shoot|instagram|portrait|selfie/i,
      goals: [
        { id: 'better', label: 'Better everyday photos', sub: 'Friends, food, travel, pets', shape: 'c-camera' },
        { id: 'people', label: 'Portraits of people', sub: 'Faces that look like them, only better', shape: 'f-other' },
        { id: 'edit', label: 'Editing that looks good', sub: 'Light, colour, crop, without the filters', shape: 'f-designer' },
        { id: 'post', label: 'Photos worth posting', sub: 'For a feed, a shop or a portfolio', shape: 'f-marketing' },
      ],
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
    spanish: {
      id: 'spanish', title: 'Conversational Spanish', outcome: 'Speak conversational Spanish', level: 'Beginner', subject: 'Language',
      palette: 'society', shape: 'c-speech', color: ['#FFD43B', '#F08C00'], ink: '#8F5400', span: '1 month',
      intents: ['skill', 'career', 'curious', 'exam'], match: /spanish|español|espanol|spain|mexic|language/i,
      goals: [
        { id: 'travel', label: 'Get by on a trip', sub: 'Order, ask, get around', shape: 'c-speech' },
        { id: 'chat', label: 'Hold a real conversation', sub: 'With friends, family or a partner', shape: 'f-fun' },
        { id: 'work', label: 'Use it at work', sub: 'Meetings, customers, emails', shape: 'f-work' },
        { id: 'exam', label: 'Pass a language test', sub: 'Like the DELE A2', shape: 'f-exam' },
      ],
      lessons: [
        { title: 'Hola, and the first ten words', hook: 'The ten words that carry half of every conversation.' },
        { title: 'Say who you are', hook: 'Name, home, work: your first real exchange.' },
        { title: 'Ser and estar', hook: 'Two ways to say “is”, and how to pick the right one.' },
        { title: 'Ordering food and drinks', hook: 'Quiero, me pones, la cuenta, por favor.' },
        { title: 'Asking for directions', hook: 'And understanding the answer.' },
        { title: 'Talking about yesterday', hook: 'The past tense you’ll use the most.' },
        { title: 'Listening at real speed', hook: 'Native speakers, slowed down, then not.' },
        { title: 'Keeping a chat going', hook: 'Fillers and questions that buy you time.' },
        { title: 'Your first five-minute chat', hook: 'Put it together, out loud.' },
      ],
    },
    invest: {
      id: 'invest', title: 'Investing, simply', outcome: 'Understand how investing works', level: 'Beginner', subject: 'Money',
      palette: 'society', shape: 'c-growth', color: ['#5CCB8A', '#1F9D63'], ink: '#13744A', span: '2 weeks',
      intents: ['life', 'career', 'curious'], match: /invest|stock|share|money|finance|index fund|crypto|savings|compound|retire/i,
      goals: [
        { id: 'start', label: 'Start investing safely', sub: 'Where to begin, and what to avoid', shape: 'c-growth' },
        { id: 'news', label: 'Follow the money news', sub: 'Rates, markets, what it all means', shape: 'f-researcher' },
        { id: 'plan', label: 'Plan for a big goal', sub: 'A house, a family, retiring', shape: 'f-founder' },
        { id: 'work', label: 'For work or a course', sub: 'Terms you’re expected to know', shape: 'f-finance' },
      ],
      lessons: [
        { title: 'Why money grows', hook: 'Compound interest, and why starting early wins.' },
        { title: 'Stocks, bonds and cash', hook: 'Owning, lending and keeping. That’s most of it.' },
        { title: 'Risk and reward', hook: 'Why a smoother ride usually earns less.' },
        { title: 'Index funds', hook: 'Buy the whole market and stop guessing.' },
        { title: 'Fees that eat returns', hook: '1% a year sounds small. Over 30 years it isn’t.' },
        { title: 'Inflation and interest rates', hook: 'Why your cash slowly shrinks.' },
        { title: 'When markets fall', hook: 'What history says about staying in.' },
        { title: 'Build a simple plan', hook: 'How much, how often, into what.' },
        { title: 'Spot a bad deal', hook: 'Five signs an “opportunity” isn’t one.' },
      ],
    },
    python: {
      id: 'python', title: 'Python from scratch', outcome: 'Learn the basics of Python', level: 'Beginner', subject: 'Tech',
      palette: 'tech', shape: 'c-code', color: ['#5FD0F2', '#1A8FD0'], ink: '#0F5F94', span: '1 month',
      intents: ['career', 'skill', 'exam', 'curious'], match: /python|cod(e|ing)|program|software|script|develop|computer science/i,
      goals: [
        { id: 'basics', label: 'Write my first programs', sub: 'Variables, loops, functions', shape: 'c-code' },
        { id: 'auto', label: 'Automate boring tasks', sub: 'Files, spreadsheets, emails', shape: 'f-engineer' },
        { id: 'data', label: 'Work with data', sub: 'Lists, tables, simple charts', shape: 'f-finance' },
        { id: 'class', label: 'For a class or interview', sub: 'The concepts they test', shape: 'f-student' },
      ],
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
      id: 'speak', title: 'Speak with confidence', outcome: 'Get confident with public speaking', level: 'Beginner', subject: 'Communication',
      palette: 'mind', shape: 'c-mic', color: ['#B197FC', '#7048E8'], ink: '#5235B8', span: '2 weeks',
      intents: ['career', 'skill', 'life'], match: /speak|speech|present|talk|public|stage|confiden|pitch/i,
      goals: [
        { id: 'nerves', label: 'Calm my nerves', sub: 'Stop the shaky voice and blank mind', shape: 'f-fun' },
        { id: 'work', label: 'Present at work', sub: 'Meetings, updates, pitches', shape: 'f-work' },
        { id: 'story', label: 'Tell a good story', sub: 'Keep a room listening', shape: 'f-teacher' },
        { id: 'event', label: 'A big talk coming up', sub: 'A wedding, a class, a stage', shape: 'c-mic' },
      ],
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
  window.CATALOG = C;

  // Which courses to offer first for each "What brings you here?" answer
  window.CATALOG_ORDER = {
    career: ['speak', 'python', 'invest', 'spanish', 'photo'],
    exam: ['bio12', 'python', 'spanish', 'heart'],
    skill: ['photo', 'spanish', 'python', 'speak'],
    life: ['heart', 'invest', 'speak', 'photo'],
    curious: ['heart', 'photo', 'invest', 'spanish'],
  };

  // Typed text or a picked outcome → a catalog id. Falls back to 'heart' (the demo course).
  window.courseFor = function (text) {
    const t = String(text || '').trim();
    if (!t) return 'heart';
    const lower = t.toLowerCase();
    for (const id in C) if (C[id].outcome.toLowerCase() === lower || C[id].title.toLowerCase() === lower || id === lower) return id;
    if (C.bio12.match.test(t)) return 'bio12'; // check the exam course before the general heart one
    for (const id in C) if (C[id].match.test(t)) return id;
    return 'heart';
  };

  // Particle shapes for the catalog courses: solid drawings the character can become, and crisp tile icons
  const DRAW = {};
  const HEART = new Path2D('M12 21s-7.5-4.6-9.6-9.4C.9 8 3 4.5 6.6 4.5c2.2 0 3.8 1.2 5.4 3.1 1.6-1.9 3.2-3.1 5.4-3.1 3.6 0 5.7 3.5 4.2 7.1C19.5 16.4 12 21 12 21z');
  DRAW.heart = (x, S) => { x.save(); x.scale(S / 24, S / 24); x.fill(HEART); x.restore(); };
  const k = (S) => (v) => (v * S) / 220;
  const rr = (x, X, Y, w, h, r) => { x.beginPath(); x.roundRect ? x.roundRect(X, Y, w, h, r) : x.rect(X, Y, w, h); };
  DRAW['c-camera'] = (x, S) => {
    const s = k(S);
    rr(x, s(78), s(40), s(64), s(30), s(10)); x.fill();
    rr(x, s(18), s(58), s(184), s(132), s(28)); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(s(110), s(124), s(46), 0, 6.283); x.fill();
    x.globalCompositeOperation = 'source-over'; x.beginPath(); x.arc(s(110), s(124), s(30), 0, 6.283); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(s(100), s(114), s(9), 0, 6.283); x.fill();
    x.beginPath(); x.arc(s(170), s(84), s(8), 0, 6.283); x.fill(); x.globalCompositeOperation = 'source-over';
  };
  DRAW['c-speech'] = (x, S) => {
    const s = k(S);
    rr(x, s(14), s(26), s(132), s(92), s(30)); x.fill();
    x.beginPath(); x.moveTo(s(40), s(110)); x.lineTo(s(30), s(146)); x.lineTo(s(76), s(114)); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.lineWidth = s(14); rr(x, s(82), s(96), s(124), s(86), s(28)); x.stroke();
    x.globalCompositeOperation = 'source-over'; rr(x, s(82), s(96), s(124), s(86), s(28)); x.fill();
    x.beginPath(); x.moveTo(s(176), s(176)); x.lineTo(s(190), s(206)); x.lineTo(s(150), s(180)); x.fill();
    x.globalCompositeOperation = 'destination-out';
    [114, 144, 174].forEach((cx) => { x.beginPath(); x.arc(s(cx), s(140), s(9), 0, 6.283); x.fill(); });
    x.globalCompositeOperation = 'source-over';
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
  DRAW['c-flask'] = (x, S) => {
    const s = k(S);
    rr(x, s(68), s(14), s(84), s(20), s(10)); x.fill();
    x.beginPath(); x.moveTo(s(84), s(30)); x.lineTo(s(136), s(30)); x.lineTo(s(136), s(84)); x.lineTo(s(200), s(186));
    x.quadraticCurveTo(s(212), s(208), s(186), s(208)); x.lineTo(s(34), s(208)); x.quadraticCurveTo(s(8), s(208), s(20), s(186));
    x.lineTo(s(84), s(84)); x.closePath(); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.lineWidth = s(8);
    x.beginPath(); x.moveTo(s(58), s(140)); x.quadraticCurveTo(s(84), s(126), s(110), s(140)); x.quadraticCurveTo(s(136), s(154), s(162), s(140)); x.stroke();
    x.beginPath(); x.arc(s(96), s(176), s(9), 0, 6.283); x.fill(); x.beginPath(); x.arc(s(132), s(168), s(6), 0, 6.283); x.fill();
    x.globalCompositeOperation = 'source-over';
  };
  if (window.Brain && Brain.defineIcon) Object.values(C).forEach((c) => { if (DRAW[c.shape] && c.shape !== 'heart') Brain.defineIcon(c.shape, DRAW[c.shape], { grad: c.color }); });

  // A solid colour-gradient tile icon for a course (like fillSVG), as an <img>
  const TILE = {};
  window.catalogTile = function (id, size = 28) {
    const c = C[id]; if (!c) return '';
    const draw = DRAW[c.shape === 'heart' ? 'heart' : c.shape]; if (!draw) return '';
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
