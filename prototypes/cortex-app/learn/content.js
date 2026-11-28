// Learn · lesson content for the heart course. Owned by the Learn module (B).
// Inline glowing terms use [[termId|shown text]] (or [[termId]] for the term's own label).
// Facts are plain, rounded and standard (textbook / WHO / AHA). Nothing here is invented.
window.LEARN = (function () {
  const terms = {
    cardiac: { label: 'cardiac muscle', def: 'The muscle only your heart is made of. It squeezes to its own rhythm and rests between beats, so it doesn’t tire.', more: 'Its cells are packed with mitochondria, the parts of a cell that make energy, and it gets a steady supply of oxygen from its own arteries.', ask: 'Why doesn’t heart muscle ever get tired?', shape: 'heart' },
    atria: { label: 'atria', def: 'The two upper chambers. They collect blood coming back to the heart and top up the ventricles below.', more: 'Their walls are thin, because they only push blood a few centimetres, down into the ventricles.', ask: 'What do the atria actually do?', shape: 'ln-rooms' },
    ventricles: { label: 'ventricles', def: 'The two lower chambers: the real pumps. The left one pushes blood out to your whole body.', more: 'The left ventricle’s wall is roughly two to three times thicker than the right’s, because its trip is so much longer.', ask: 'Why is the left ventricle so much stronger?', shape: 'ln-rooms' },
    valves: { label: 'valves', def: 'Four flaps that only open one way, so blood can’t flow backwards.', more: 'Two sit between the upper and lower chambers, and two guard the exits. Their closing makes the “lub-dub” sound.', ask: 'What happens when a heart valve leaks?', shape: 'ln-rooms' },
    sa: { label: 'SA node', def: 'A small patch of cells in the wall of the right atrium that fires each heartbeat. Your natural pacemaker.', more: 'At rest it fires about 60 to 100 times a minute. Nerves and hormones can nudge it faster or slower.', ask: 'How does the SA node keep time?', shape: 'spike' },
    av: { label: 'AV node', def: 'A relay between the upper and lower chambers. It holds the signal for a split second so the ventricles can fill.', more: 'If the SA node fails, the AV node can set a slower back-up rhythm of its own.', ask: 'What happens if the AV node stops working?', shape: 'spike' },
    aorta: { label: 'aorta', def: 'Your body’s main artery. It leaves the left ventricle and carries oxygen-rich blood to the rest of you.', more: 'It’s the widest blood vessel in the body, about 2.5 cm across.', ask: 'Why is the aorta so big?', shape: 'curve' },
    pulmonary: { label: 'pulmonary artery', def: 'Carries oxygen-poor blood from the right ventricle to the lungs. One of the few arteries with low-oxygen blood.', more: 'It still counts as an artery because arteries are defined by direction: they lead away from the heart.', ask: 'Why is the pulmonary artery called an artery?', shape: 'split' },
    systole: { label: 'systole', def: 'The squeeze: when the ventricles contract and push blood out.', more: 'It sets the top number of your blood pressure.', ask: 'What happens in the heart during systole?', shape: 'ring' },
    diastole: { label: 'diastole', def: 'The rest: when the heart relaxes and fills with blood again.', more: 'At rest, the heart spends about two-thirds of every beat in diastole.', ask: 'Why does the heart spend so long relaxing?', shape: 'ring' },
    coronary: { label: 'coronary arteries', def: 'Small arteries on the surface of the heart that feed the heart muscle itself.', more: 'The heart can’t use the blood inside its chambers for fuel. It relies on these arteries, like any other organ.', ask: 'How do the coronary arteries get blocked?', shape: 'burst' },
    plaque: { label: 'plaque', def: 'A fatty build-up inside an artery wall. If it cracks, a clot can form on top of it.', more: 'Plaque builds slowly over years. Smoking, high blood pressure and high cholesterol all speed it up.', ask: 'What makes plaque build up in arteries?', shape: 'burst' },
    mmhg: { label: 'mmHg', def: 'Millimetres of mercury, the unit for blood pressure.', more: 'It comes from the first pressure gauges, which measured how high blood pressure could push a column of mercury.', ask: 'Why is blood pressure measured in mercury?', shape: 'wave' },
    arrhythmia: { label: 'arrhythmia', def: 'Any heartbeat that’s too fast, too slow, or irregular.', more: 'Many are harmless, like the odd skipped beat. An ECG shows doctors which kind it is.', ask: 'Which arrhythmias are dangerous?', shape: 'spike' },
    afib: { label: 'atrial fibrillation', def: 'A common arrhythmia where the atria quiver instead of beating in step, so the pulse turns irregular.', more: 'Blood can pool in a quivering atrium and form clots, which is why it’s linked to strokes.', ask: 'Why is atrial fibrillation linked to strokes?', shape: 'spike' },
    output: { label: 'cardiac output', def: 'How much blood the heart pumps each minute. About 5 litres at rest in an adult.', more: 'During hard exercise it can rise to four or five times that.', ask: 'How does the heart pump more during exercise?', shape: 'heart' },
    lubdub: { label: 'lub-dub', def: 'The two heart sounds: “lub” as the inner valves shut, “dub” as the exit valves shut.', more: 'Doctors listen for extra sounds between them. A “whoosh” can mean a valve is leaking.', ask: 'What does a heart murmur sound like?', shape: 'ring' },
    rhr: { label: 'resting heart rate', def: 'How many times your heart beats a minute while you’re calm and still. For most adults, 60 to 100.', more: 'Regular exercise tends to lower it, because a fitter heart moves more blood with each beat.', ask: 'What does my resting heart rate say about me?', shape: 'bars' },
  };

  const lessons = {
    // ───────────── Lesson 1 · full ─────────────
    pump: {
      min: 5, dive: 'cardiac',
      answer: 'Your heart is a [[cardiac|muscle]] about the size of your fist. It squeezes about once a second, around 100,000 times a day, and you never have to ask it to.',
      blocks: [
        { type: 'guess', shape: 'spike', eyebrow: 'Guess first', title: 'How many times does it beat in a day?',
          intro: 'Take a guess before you see the answer.',
          options: [{ icon: 'clock', text: 'About 10,000' }, { icon: 'heart', text: 'About 100,000' }, { icon: 'zap', text: 'About 1 million' }],
          answer: 1,
          explain: 'About 100,000. At around 70 beats a minute, that’s 70 × 60 × 24. Over a lifetime it adds up to more than 2.5 billion beats.' },
        { type: 'scale', shape: 'heart', eyebrow: 'Zoom out', title: 'What one heart does',
          intro: 'Pick a stretch of time. These are rough numbers for an adult at rest.',
          options: [
            { label: 'A minute', beats: 70, litres: 5, note: 'About all the blood in your body, every single minute. That’s your [[output]].' },
            { label: 'An hour', beats: 4200, litres: 300, note: 'Asleep or awake, the work goes on at the same steady pace.' },
            { label: 'A day', beats: 100000, litres: 7500, note: 'About 7,500 litres of blood, moved by a muscle about the size of your fist.' },
          ] },
      ],
      extra: [
        { type: 'compare', shape: 'heart', eyebrow: 'Why it never tires', title: 'Heart muscle vs arm muscle',
          intro: 'Your heart is made of [[cardiac]]. Compare it with the muscle in your arm.',
          a: 'Heart', b: 'Arm',
          rows: [
            ['Who’s in charge', 'Itself: it has a built-in pacemaker', 'You: your brain sends the signal'],
            ['Resting', 'Rests a little between every beat', 'Can clench until it gives out'],
            ['Fuel', 'Steady oxygen from its own arteries', 'Can run short of oxygen and burn'],
          ],
          verdict: ['Built for one job: a short squeeze, a short rest, forever.', 'Strong in bursts, but it needs long breaks.'] },
      ],
      quiz: [
        { q: 'About how much blood does your heart pump in a day?', options: ['About 75 litres', 'About 750 litres', 'About 7,500 litres'], answer: 2,
          explain: 'About 5 litres a minute adds up to roughly 7,500 litres a day.' },
        { q: 'Why doesn’t your heart tire out like your arm does?', options: ['It rests between beats and gets steady oxygen', 'It only works hard while you’re awake', 'One side rests while the other side works'], answer: 0,
          explain: 'Each beat is a short squeeze and a short rest. Its own arteries keep the oxygen coming, so it never runs short.' },
      ],
      recap: ['Your heart is a fist-sized muscle that beats about 100,000 times a day.', 'It moves about 5 litres a minute: roughly 7,500 litres a day.', 'Cardiac muscle rests between beats, so it doesn’t tire.'],
      cards: [
        { idea: 'Your heart is a muscle about the size of your fist.', shape: 'heart' },
        { idea: 'It beats about 100,000 times a day, and you never have to ask it to.', shape: 'spike' },
        { q: 'How many times does it beat in a day?', options: ['About 10,000', 'About 100,000', 'About 1 million'], answer: 1, explain: 'About 100,000: roughly 70 beats a minute, all day long.' },
        { idea: 'Each minute it moves about 5 litres. That’s about all the blood in your body.', shape: 'wave' },
        { idea: 'It’s made of [[cardiac]], which rests a little between every beat.', shape: 'heart' },
        { quiz: 1 },
        { idea: 'All together, that’s about 7,500 litres of blood a day.', shape: 'bars' },
        { quiz: 0 },
      ],
    },

    // ───────────── Lesson 2 · full ─────────────
    rooms: {
      min: 6, dive: 'valves', shape: 'ln-rooms',
      answer: 'Your heart has four rooms: two [[atria]] on top that receive blood, and two [[ventricles]] below that pump it out. Four [[valves]] work like one-way doors between them.',
      blocks: [
        { type: 'rooms', shape: 'ln-rooms', eyebrow: 'Follow one drop', title: 'A trip through the four rooms',
          intro: 'Tap through the steps, or tap a room. Shown as if you’re facing someone, so their right side is on your left.',
          steps: [
            { room: 'ra', name: 'Right atrium', tag: 'Step 1 · In from the body', text: 'Blood that has used up its oxygen comes back from your body and fills the right atrium.' },
            { room: 'rv', name: 'Right ventricle', tag: 'Step 2 · Off to the lungs', text: 'A valve opens, blood drops into the right ventricle, and it pumps the blood out to your lungs.' },
            { room: 'la', name: 'Left atrium', tag: 'Step 3 · Back with oxygen', text: 'Fresh from the lungs and full of oxygen, the blood comes back into the left atrium.' },
            { room: 'lv', name: 'Left ventricle', tag: 'Step 4 · Out to everything', text: 'The strongest room pumps it out through the [[aorta]], to every part of your body.' },
          ] },
        { type: 'guess', shape: 'ln-rooms', eyebrow: 'Guess first', title: 'Why is the left ventricle’s wall the thickest?',
          intro: 'One room has much more muscle than the others.',
          options: [{ icon: 'route', text: 'It pumps blood to the whole body' }, { icon: 'drop', text: 'It holds the most blood' }, { icon: 'door', text: 'It’s the first room blood enters' }],
          answer: 0,
          explain: 'The right ventricle only sends blood next door to the lungs. The left one pushes it around your entire body, so its wall is roughly two to three times thicker.' },
      ],
      extra: [
        { type: 'points', shape: 'ln-rooms', eyebrow: 'The four doors', title: 'Each room has a one-way exit',
          intro: 'The [[lubdub]] you hear is these doors snapping shut.',
          items: [
            ['door', 'Tricuspid valve', 'Right atrium to right ventricle.'],
            ['door', 'Pulmonary valve', 'Right ventricle out to the lungs.'],
            ['door', 'Mitral valve', 'Left atrium to left ventricle.'],
            ['door', 'Aortic valve', 'Left ventricle out to the body.'],
          ] },
      ],
      quiz: [
        { q: 'Which room sends blood out to your whole body?', options: ['Right atrium', 'Right ventricle', 'Left ventricle', 'Left atrium'], answer: 2,
          explain: 'The left ventricle. It’s the strongest room, and it pumps through the aorta to everywhere else.' },
        { q: 'What makes the “lub-dub” sound?', options: ['Valves snapping shut', 'Blood hitting the walls', 'The muscle squeezing'], answer: 0,
          explain: '“Lub” is the inner valves shutting as the ventricles squeeze. “Dub” is the exit valves shutting as they relax.' },
      ],
      recap: ['Two atria on top receive blood. Two ventricles below pump it out.', 'The right side sends blood to the lungs. The left side sends it everywhere else.', 'Four one-way valves stop blood flowing backwards.'],
      cards: [
        { idea: 'Your heart has four rooms: two on top, two below.', shape: 'ln-rooms' },
        { idea: 'The top rooms, the [[atria]], receive blood coming back.', shape: 'ln-rooms' },
        { idea: 'The bottom rooms, the [[ventricles]], pump it out.', shape: 'ln-rooms' },
        { quiz: 0 },
        { idea: 'The right side sends blood to your lungs. The left side sends it everywhere else.', shape: 'split' },
        { idea: 'Four [[valves]] only open one way, so blood never flows backwards.', shape: 'ln-rooms' },
        { quiz: 1 },
      ],
    },

    // ───────────── Shorter lessons ─────────────
    spark: {
      min: 4, dive: 'sa',
      answer: 'Each beat starts with an electrical spark from the [[sa]], a tiny patch of cells in the right atrium. At rest it fires about 60 to 100 times a minute, all on its own.',
      blocks: [
        { type: 'steps', shape: 'spike', eyebrow: 'Follow the spark', title: 'One signal, four moves',
          steps: [
            { icon: 'zap', name: 'Fire', text: 'The SA node fires in the wall of the right atrium.' },
            { icon: 'grid', name: 'Spread', text: 'The signal spreads across both atria, and they squeeze blood down.' },
            { icon: 'clock', name: 'Pause', text: 'The [[av]] holds the signal for a split second, so the ventricles can fill.' },
            { icon: 'heart', name: 'Squeeze', text: 'Fast wiring carries it into the ventricles. They squeeze from the bottom up, like a tube of toothpaste.' },
          ] },
      ],
      extra: [
        { type: 'points', shape: 'spike', eyebrow: 'Good to know', title: 'The spark is built in',
          items: [
            ['heart', 'It runs itself', 'A transplanted heart has no nerve links at first, and it still beats.'],
            ['zap', 'The brain only adjusts', 'Nerves and adrenaline speed it up or slow it down, but don’t start each beat.'],
            ['wave', 'An ECG draws it', 'Each bump on an ECG is one part of the spark’s trip.'],
          ] },
      ],
      quiz: [
        { q: 'Where does each heartbeat start?', options: ['In the brain', 'In the SA node', 'In the left ventricle'], answer: 1,
          explain: 'In the SA node, in the wall of the right atrium. The brain can change the pace, but the spark is built into the heart.' },
        { q: 'Why does the signal pause at the AV node?', options: ['To let the ventricles fill first', 'To let the muscle rest', 'To check the blood’s oxygen'], answer: 0,
          explain: 'The short pause lets the atria finish topping up the ventricles before they squeeze.' },
      ],
      recap: ['Each beat starts in the SA node, your natural pacemaker.', 'The AV node pauses the signal so the ventricles can fill.', 'The brain adjusts the pace, but the spark is built in.'],
    },

    circuits: {
      min: 4, dive: 'pulmonary',
      answer: 'Your blood runs two loops. The right side pumps it on a short trip through the lungs to pick up oxygen. The left side pumps it on the long trip around your body.',
      blocks: [
        { type: 'compare', shape: 'split', eyebrow: 'Two loops', title: 'The short trip and the long trip',
          a: 'Lungs loop', b: 'Body loop',
          rows: [
            ['Pumped by', 'The right ventricle', 'The left ventricle'],
            ['Goes to', 'The lungs, and straight back', 'Every organ, brain to toes'],
            ['Pressure', 'Low: the lungs are close and delicate', 'High: it has a long way to push'],
          ],
          verdict: ['The short loop refills the blood with oxygen.', 'The long loop delivers it, which is why the left side is stronger.'] },
      ],
      extra: [],
      quiz: [
        { q: 'Which side of the heart pumps blood to the lungs?', options: ['The right side', 'The left side', 'Neither: the lungs pull it in'], answer: 0,
          explain: 'The right side. It only needs a gentle push, because the lungs are right next door.' },
        { q: 'Arteries are the vessels that…', options: ['Carry blood away from the heart', 'Always carry oxygen-rich blood', 'Carry blood back to the heart'], answer: 0,
          explain: 'Arteries lead away from the heart, veins lead back. That’s why the [[pulmonary]] is an artery, even though its blood is low in oxygen.' },
      ],
      recap: ['The right side pumps blood through the lungs: the short loop.', 'The left side pumps it around the body: the long loop.', 'Arteries lead away from the heart, veins lead back.'],
    },

    pressure: {
      min: 4, dive: 'mmhg',
      answer: 'Blood pressure is how hard blood pushes on your artery walls. The top number is the push during a beat. The bottom number is the push between beats, while the heart rests.',
      blocks: [
        { type: 'points', shape: 'wave', eyebrow: 'Reading 120/80', title: 'What the two numbers mean',
          items: [
            ['up', '120 · the top number', 'The pressure as the ventricles squeeze, during [[systole]].'],
            ['down', '80 · the bottom number', 'The pressure as the heart relaxes and refills, during [[diastole]].'],
            ['gauge', 'The unit', 'Both are in [[mmhg]]. Around 120/80 or a little lower is usually seen as healthy for adults.'],
            ['alert', 'Often silent', 'High blood pressure usually has no symptoms. The only way to know is to measure it.'],
          ] },
      ],
      extra: [],
      quiz: [
        { q: 'In a reading of 120/80, what does 120 measure?', options: ['The pressure during a beat', 'The pressure between beats', 'Your heart rate'], answer: 0,
          explain: 'The top number is the pressure while the ventricles squeeze. The bottom one is while the heart rests.' },
        { q: 'Why is high blood pressure called a silent problem?', options: ['It usually has no symptoms', 'It only happens while you sleep', 'It can’t be measured at home'], answer: 0,
          explain: 'Most people with high blood pressure feel fine, which is why regular checks matter.' },
      ],
      recap: ['The top number is the push during a beat.', 'The bottom number is the push between beats.', 'High blood pressure is usually silent, so measure it.'],
    },

    wrong: {
      min: 4, dive: 'afib',
      answer: 'An [[arrhythmia]] is a beat that’s too fast, too slow, or out of step. Many are harmless, some need treatment, and an ECG can tell them apart.',
      blocks: [
        { type: 'points', shape: 'spike', eyebrow: 'Three ways it goes wrong', title: 'Too fast, too slow, out of step',
          items: [
            ['up', 'Too fast', 'Tachycardia: over 100 beats a minute at rest.'],
            ['down', 'Too slow', 'Bradycardia: under 60 at rest. Many fit athletes sit here and are fine.'],
            ['shuffle', 'Out of step', '[[afib]] is the most common kind: the atria quiver instead of squeezing.'],
          ] },
      ],
      extra: [],
      quiz: [
        { q: 'A resting pulse of 115 beats a minute is called…', options: ['Tachycardia', 'Bradycardia', 'Fibrillation'], answer: 0,
          explain: 'Tachycardia means a resting rate over 100. Exercise raises it too, but that’s normal.' },
        { q: 'In atrial fibrillation, what happens?', options: ['The atria quiver instead of beating in step', 'The heart stops completely', 'The valves stop closing'], answer: 0,
          explain: 'The upper chambers quiver, so the pulse turns irregular. The heart keeps pumping, just less well.' },
      ],
      recap: ['An arrhythmia is a beat that’s too fast, too slow or irregular.', 'Over 100 at rest is tachycardia; under 60 is bradycardia.', 'Atrial fibrillation is the most common irregular rhythm.'],
    },

    attack: {
      min: 5, dive: 'coronary',
      answer: 'A heart attack happens when one of the [[coronary]] is blocked, usually by a clot on cracked [[plaque]]. The muscle beyond it runs short of oxygen, and the longer it lasts, the more muscle is lost.',
      blocks: [
        { type: 'compare', shape: 'burst', eyebrow: 'Often mixed up', title: 'Heart attack vs cardiac arrest',
          a: 'Heart attack', b: 'Cardiac arrest',
          rows: [
            ['What fails', 'The plumbing: a blocked artery', 'The wiring: the rhythm collapses'],
            ['The heart', 'Usually keeps beating', 'Stops pumping blood'],
            ['What to do', 'Call emergency services now', 'Call, start CPR, use a defibrillator'],
          ],
          verdict: ['A heart attack is a blood-supply problem.', 'Cardiac arrest is an electrical problem. A heart attack can trigger one.'] },
      ],
      extra: [],
      quiz: [
        { q: 'What usually causes a heart attack?', options: ['A blocked artery feeding the heart', 'The rhythm suddenly stopping', 'A valve that won’t open'], answer: 0,
          explain: 'A clot blocks a coronary artery, and the muscle it feeds starts to starve.' },
        { q: 'Why do doctors say “time is muscle”?', options: ['The longer the blockage, the more muscle dies', 'Exercise builds heart muscle over time', 'The heart beats faster during an attack'], answer: 0,
          explain: 'Opening the artery quickly saves heart muscle. That’s why you call for help straight away.' },
      ],
      recap: ['A heart attack is a blocked coronary artery.', 'Cardiac arrest is the rhythm failing, and the heart stops pumping.', 'Time is muscle: call for help straight away.'],
    },

    strong: {
      min: 4, dive: 'rhr',
      answer: 'Your heart gets stronger with use, like any muscle. Moving most days, not smoking, sleeping well and going easy on salt all take strain off it.',
      blocks: [
        { type: 'points', shape: 'bars', eyebrow: 'What the evidence says', title: 'Four habits that help',
          items: [
            ['walk', 'Move', 'The WHO suggests at least 150 minutes of moderate activity a week, like brisk walking.'],
            ['drop', 'Less salt', 'The WHO advises under 5 g of salt a day, about a teaspoon. Too much raises blood pressure.'],
            ['moon', 'Sleep', 'Most adults need 7 hours or more. Short sleep is linked to higher blood pressure.'],
            ['shield', 'Don’t smoke', 'Smoking damages artery walls. Quitting starts lowering the risk quickly.'],
          ] },
      ],
      extra: [],
      quiz: [
        { q: 'How much moderate activity does the WHO suggest each week?', options: ['At least 30 minutes', 'At least 150 minutes', 'At least 600 minutes'], answer: 1,
          explain: 'At least 150 minutes, so about 30 minutes on five days. More brings extra benefit.' },
        { q: 'Why does too much salt strain the heart?', options: ['It raises blood pressure', 'It thickens the valves', 'It slows the SA node'], answer: 0,
          explain: 'Salt makes the body hold on to water, which raises blood pressure, so the heart works harder.' },
      ],
      recap: ['Aim for at least 150 minutes of moderate activity a week.', 'Keep salt under about a teaspoon a day.', 'Sleep well and don’t smoke.'],
    },

    cycle: {
      min: 4, dive: 'lubdub',
      answer: 'Each beat is a cycle: [[systole]], when the ventricles squeeze, then [[diastole]], when the heart relaxes and fills. At 75 beats a minute, one full cycle takes about 0.8 seconds.',
      blocks: [
        { type: 'steps', shape: 'ring', eyebrow: 'One beat', title: 'Four moments in 0.8 seconds',
          steps: [
            { icon: 'drop', name: 'Fill', text: 'The heart relaxes and blood flows in from the veins, into the ventricles.' },
            { icon: 'down', name: 'Top up', text: 'The atria squeeze and push the last of the blood down.' },
            { icon: 'door', name: 'Lub', text: 'The ventricles squeeze. The inner valves snap shut: “lub”.' },
            { icon: 'up', name: 'Dub', text: 'Blood rushes out. As the ventricles relax, the exit valves shut: “dub”.' },
          ] },
      ],
      extra: [],
      quiz: [
        { q: 'What happens during systole?', options: ['The ventricles squeeze blood out', 'The heart relaxes and fills', 'All the valves open at once'], answer: 0,
          explain: 'Systole is the squeeze. Diastole is the relax-and-fill that follows.' },
        { q: 'At rest, which part of the beat takes longer?', options: ['Diastole, the relaxing', 'Systole, the squeeze', 'They take the same time'], answer: 0,
          explain: 'At rest the heart spends about two-thirds of each beat relaxing and filling.' },
      ],
      recap: ['Systole is the squeeze, diastole is the relax and fill.', 'One beat takes about 0.8 seconds at 75 beats a minute.', '“Lub” and “dub” are two sets of valves shutting.'],
    },
  };

  // Extra review questions (mixed in with earlier lesson quizzes)
  const review = [
    { from: 'rooms', q: 'Which rooms collect blood coming back to the heart?', options: ['The atria', 'The ventricles', 'The valves'], answer: 0, explain: 'The atria, on top, receive the blood. The ventricles below pump it out.' },
    { from: 'rooms', q: 'Where does oxygen-rich blood from the lungs enter the heart?', options: ['The right atrium', 'The left atrium', 'The right ventricle'], answer: 1, explain: 'The left atrium. From there it drops into the left ventricle and goes out to the body.' },
    { from: 'pump', q: 'About how much blood does your heart move each minute at rest?', options: ['About half a litre', 'About 5 litres', 'About 50 litres'], answer: 1, explain: 'About 5 litres, roughly all the blood in an adult body.' },
    { from: 'spark', q: 'What does the brain do to your heartbeat?', options: ['Starts every beat', 'Speeds it up or slows it down', 'Nothing at all'], answer: 1, explain: 'The SA node starts each beat. Nerves and hormones only adjust the pace.' },
  ];

  // Final challenge: 3 quick questions that join the course together
  const final = [
    { q: 'Blood coming back from your body goes first to…', options: ['The right atrium', 'The left atrium', 'The lungs'], answer: 0, explain: 'The right atrium. Then the right ventricle sends it to the lungs for oxygen.' },
    { q: 'What sets the pace of your heartbeat?', options: ['The aorta', 'The SA node', 'The valves'], answer: 1, explain: 'The SA node, your built-in pacemaker in the right atrium.' },
    { q: 'About how many times does your heart beat in a day?', options: ['About 100,000', 'About 10,000', 'About 1 million'], answer: 0, explain: 'About 100,000. You’ve earned your heart.' },
  ];

  // Short names (graph labels, recap titles)
  const short = { pump: 'The pump', rooms: '4 rooms', spark: 'The spark', circuits: '2 circuits', pressure: 'Pressure', wrong: 'Rhythm', attack: 'Heart attack', strong: 'Keeping fit', cycle: 'The cycle' };

  // The plan, personalised. Placeholder lines for the heart course until data/courses-catalog.js (buildCourse) supplies them.
  // because: why this stop is in *your* plan · forYou: the "For you" callout inside the lesson · glyph: an OrbGlyphs drawing.
  const plan = {
    heart: {
      summary: { how: 'Built for someone who wants to know how their heart actually works.', condition: 'Built for someone trying to understand a heart condition.', healthy: 'Built for someone who wants to keep their heart healthy.', exam: 'Built for a student revising the heart for an exam.' },
      goalShort: { how: 'understand how your heart works', condition: 'understand a heart condition', healthy: 'keep your heart healthy', exam: 'know the heart for your exam' },
      because: {
        pump: 'Starts with the one fact everything else hangs on',
        rooms: 'You need the layout before the rhythm makes sense',
        spark: 'Explains the beat you can feel in your wrist',
        circuits: 'Joins the heart to your lungs, so the loop clicks',
        review1: 'Brings back the first four ideas before they fade',
        pressure: 'Turns a blood pressure reading into plain words',
        wrong: 'Covers the rhythm problems people ask about most',
        attack: 'So you know what is happening if it ever matters',
        strong: 'What actually helps, for your own heart',
        cycle: 'Puts every part together in one beat',
        review2: 'A last pass on what you are most likely to forget',
        final: 'Proves it stuck, and earns you the living heart',
      },
      forYou: {
        pump: 'You said you want to know how it really works. This is the base every other lesson builds on.',
        rooms: 'Picture your own heart as you go. The left side is the one doing the long, hard push.',
        spark: 'Put two fingers on your wrist while you read. Every tap you feel started in one small patch of cells.',
        circuits: 'This is the lesson that makes the rest click for most people. Take it slowly.',
        pressure: 'Next time someone reads you two numbers, you will know exactly what each one means.',
        wrong: 'Most skipped beats are harmless. This lesson shows you which ones are worth a check.',
        attack: 'The one thing to keep from this lesson: call for help straight away.',
        strong: 'Pick one habit from this lesson to try this week. One is enough.',
        cycle: 'This joins everything you have learned into one 0.8 second beat.',
      },
      glyph: { pump: 'pump', rooms: 'rooms', spark: 'spark', circuits: 'circuits', pressure: 'gauge', wrong: 'monitor', attack: 'broken', strong: 'dumbbell', cycle: 'cycle', final: 'heartbeat' },
      chapters: [
        { name: 'The pump', ids: ['pump', 'rooms'] },
        { name: 'The beat and the flow', ids: ['spark', 'circuits', 'review1'] },
        { name: 'When things go wrong', ids: ['pressure', 'wrong', 'attack', 'strong', 'cycle', 'review2'] },
        { name: 'Finish line', ids: ['final'] },
      ],
      // The course that comes after this one, already shaped by what you did
      next: {
        id: 'lungs', title: 'How your lungs work', subject: 'Body', glyph: 'lungs', goalShort: 'understand how your lungs work',
        summary: 'Built for someone who just learned how their heart works.',
        gift: { id: 'living-lungs', title: 'The living lungs', sub: 'The second piece of your body collection.', shape: 'split', palette: 'body' },
        because: ['Picks up the short loop from your heart course, right where it stopped', 'Goes faster through the basics you got right', 'Same 10 minutes a day you picked'],
        lessons: [
          { id: 'lungs-air', title: 'The air you breathe in', hook: 'About 11,000 litres a day, mostly without a thought.', glyph: 'lungs', because: 'Starts from the short loop you just learned' },
          { id: 'lungs-tree', title: 'A tree turned upside down', hook: 'Windpipe, bronchi, and about 300 million tiny air sacs.', glyph: 'tree', because: 'The same branching idea as your arteries' },
          { id: 'lungs-swap', title: 'The oxygen swap', hook: 'Where the right side of your heart hands off its blood.', glyph: 'drop', because: 'Picks up exactly where the heart course stopped' },
          { id: 'lungs-review', kind: 'review', title: 'Quick review', hook: 'Three fast questions.', because: 'Locks in the first three ideas' },
          { id: 'lungs-breath', title: 'Who decides when you breathe', hook: 'The brainstem, carbon dioxide, and a reflex you can override.', glyph: 'brain', because: 'Like the heart, it runs itself. Mostly' },
          { id: 'lungs-strong', title: 'Keeping them clear', hook: 'Smoke, exercise and air: what the evidence says.', glyph: 'leaf', because: 'You liked the practical lesson on your heart' },
          { id: 'lungs-final', kind: 'final', title: 'Final challenge', hook: 'Heart and lungs, joined up.', glyph: 'lungs', because: 'Earns the second piece of your body collection' },
        ],
      },
    },
  };

  return { terms, lessons, review, final, short, plan };
})();
