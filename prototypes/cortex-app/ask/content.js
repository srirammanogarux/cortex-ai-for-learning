// Ask tab content. Owned by C · Ask. Data only: ask.js renders it.
// Rich text: [[termId]] or [[termId|shown text]] makes a glowing, tappable term.
// Facts are checked against named sources (listed per answer). Illustrations are labelled as such.
window.ASK_CONTENT = (function () {
  // ───────── Prepared answers (one per question type) ─────────
  const answers = {
    // why / how → interactive visual explanation
    purr: {
      id: 'purr', type: 'explain', q: 'Why do cats purr?', short: 'Cats purr', label: 'Why cats purr',
      subject: 'Animals', shape: 'ak-cat', palette: 'arts',
      match: [/\bpurr/],
      lead: 'Muscles in a cat’s [[larynx]] twitch very fast, snapping its vocal folds open and shut. The air rushing past them [[vibration|vibrates]], and that buzz is the purr.',
      blocks: [
        { type: 'larynx', eyebrow: 'See it', title: 'Hold to purr',
          intro: 'A cat’s voice box, seen from above. Press and hold.',
          idle: 'The vocal folds rest open, so air flows through quietly.',
          on: 'Muscles snap the folds shut and open again, about 25 to 150 times a second. Each snap buzzes the air.',
          breath: ['Breathing in', 'Breathing out'],
          breathText: ['The purr keeps going as the cat breathes in…', '…and as it breathes out, with only a tiny pause in between.'] },
        { type: 'guess', eyebrow: 'Guess first', title: 'When do cats purr?',
          options: [['heart', 'Only when they’re happy'], ['pulse', 'When happy, hurt or stressed'], ['bowl', 'Only when they want food']],
          answer: 1,
          explain: 'Cats purr when they’re content, but also when they’re hurt, frightened or giving birth. One idea is that purring helps them calm themselves. Kittens can purr when they’re only a few days old.' },
        { type: 'points', eyebrow: 'Three more', title: 'Purrs are stranger than they sound',
          items: [
            ['bowl', 'The purr that asks', 'When cats want food, many hide a high cry inside the purr. It’s called a [[solicit|solicitation purr]].'],
            ['crown', 'Big cats can’t', 'Cats that [[roar]], like lions and tigers, can’t purr the way a house cat does.'],
            ['pad', 'Built-in pads', 'A 2023 study found pads of tissue in cats’ [[vocalfolds|vocal folds]] that help them reach such low notes.'],
          ] },
      ],
      sources: 'Remmers & Gautier, 1972 · McComb et al., Current Biology 2009 · Herbst et al., Current Biology 2023',
    },

    // the "show" mode sample (camera → a leaf)
    leaf: {
      id: 'leaf', type: 'explain', q: 'Why do leaves change colour?', short: 'Leaves change colour', label: 'Why leaves change colour',
      subject: 'Nature', shape: 'ak-leaf', palette: 'society',
      match: [/\bleaf|\bleaves|autumn|\bfall colou?r/],
      lead: 'Leaves are green because of [[chlorophyll]]. As autumn days shorten, trees stop making it. The green fades, and the yellow [[carotenoids]] that were there all along show through. Reds come from [[anthocyanins]], which some trees make fresh.',
      blocks: [
        { type: 'pigments', eyebrow: 'See it', title: 'Watch a leaf turn',
          note: 'An illustration of which colours show, not measurements.',
          stages: [
            { name: 'Summer', col: ['#5FB34A', '#2F7D32'], chl: 1, car: 0.3, ant: 0, cap: 'All summer the leaf keeps making chlorophyll, and its green hides every other colour.' },
            { name: 'Early autumn', col: ['#E2C044', '#9A9B2A'], chl: 0.4, car: 0.3, ant: 0.15, cap: 'Days get shorter. The tree stops making chlorophyll, so the yellows start to show.' },
            { name: 'Late autumn', col: ['#F08A3C', '#B8321F'], chl: 0.04, car: 0.3, ant: 0.7, cap: 'The green is gone. Yellows show, and some trees add fresh reds from sugars trapped in the leaf.' },
          ] },
        { type: 'points', eyebrow: 'Two more', title: 'Why some autumns are brighter',
          items: [
            ['sun', 'Sunny days, cool nights', 'A run of bright days and cool nights tends to make the reddest autumns.'],
            ['leaf', 'Then they let go', 'A layer of cells grows where the leaf meets the twig and seals it off, until the leaf drops.'],
          ] },
      ],
      sources: 'US Forest Service · Lee & Gould, American Scientist 2002',
    },

    // A vs B → comparison card
    croc: {
      id: 'croc', type: 'compare', q: 'Crocodile vs alligator', short: 'Croc vs gator', label: 'Crocodile vs alligator',
      subject: 'Animals', shape: 'ak-snouts', palette: 'society',
      match: [/crocodile|alligator|\bcroc\b|\bgator\b/],
      lead: 'The quickest tell is the snout. An alligator’s is wide and U-shaped, a crocodile’s is narrow and V-shaped. Both are [[crocodilians]].',
      blocks: [
        { type: 'compare', eyebrow: 'Side by side', title: 'How to tell them apart', a: 'Alligator', b: 'Crocodile',
          rows: [
            ['Snout', 'Wide and rounded, like a U', 'Narrow and pointed, like a V'],
            ['Mouth shut', 'Lower teeth hide inside the upper jaw', 'A big lower tooth sticks up outside: a toothy grin'],
            ['Colour', 'Dark, almost black', 'Lighter, olive or tan'],
            ['Water', 'Mostly fresh water', 'Fresh and salt water, thanks to [[saltglands|salt glands]]'],
            ['Where', 'The south-east US and China', 'Africa, Asia, Australia and the Americas'],
          ],
          verdict: ['Alligator: wide snout, lower teeth hidden.', 'Crocodile: pointed snout, toothy grin.'] },
        { type: 'spot', eyebrow: 'Try it', title: 'Spot which one',
          rounds: [{ snout: 'v', answer: 1 }, { snout: 'u', answer: 0 }] },
        { type: 'points', eyebrow: 'Good to know', title: 'Where they meet',
          items: [
            ['pin', 'One place, both', 'South Florida, around the [[everglades|Everglades]], is the only place wild alligators and crocodiles live side by side.'],
            ['crown', 'The biggest reptile', 'The saltwater crocodile is the largest living reptile.'],
          ] },
      ],
      sources: 'US National Park Service, Everglades · Smithsonian’s National Zoo',
    },

    // how big / far → scale zoom
    sun: {
      id: 'sun', type: 'scale', q: 'How big is the sun?', short: 'The Sun', label: 'How big the Sun is',
      subject: 'Space', shape: 'ak-sun', palette: 'space',
      match: [/\bsun\b/],
      lead: 'About 1.4 million km across, roughly 109 Earths side by side. Its light takes about [[light|8 minutes]] to reach us. And some stars dwarf it, like a [[supergiant|red supergiant]].',
      blocks: [
        { type: 'scale', eyebrow: 'Zoom out', title: 'From Earth to a giant star',
          bodies: [
            { id: 'moon', name: 'Moon', km: 3474, col: ['#D9D6DE', '#8E8A96'] },
            { id: 'earth', name: 'Earth', km: 12742, col: ['#6FB7FF', '#1F5BE0'] },
            { id: 'jupiter', name: 'Jupiter', km: 139820, col: ['#F2D3A8', '#B9784A'] },
            { id: 'sun', name: 'Sun', km: 1392700, col: ['#FFE27A', '#F08A1C'] },
            { id: 'betel', name: 'Betelgeuse', km: 1392700 * 764, col: ['#FF9A7A', '#C7362B'] },
          ],
          steps: [
            { focus: 'earth', cap: 'Earth is about 12,700 km wide. The Moon is about a quarter of that.' },
            { focus: 'jupiter', cap: 'Jupiter, the biggest planet, is about 11 Earths wide.' },
            { focus: 'sun', cap: 'The Sun is about 109 Earths wide. Earth is now a dot.' },
            { focus: 'betel', cap: 'Betelgeuse is hundreds of times wider than the Sun. Estimates vary.' },
          ] },
        { type: 'stats', eyebrow: 'In numbers', title: 'Just how big',
          items: [['109', 'Earths across'], ['1.3M', 'Earths would fit inside'], ['99.8%', 'of the solar system’s mass']] },
        { type: 'points', eyebrow: 'What keeps it shining', title: 'A star, not a fire',
          items: [['bolt', 'Powered by fusion', 'In its core, the Sun squeezes hydrogen into helium. That’s [[fusion]], not burning.']] },
      ],
      sources: 'NASA Sun fact sheet · NASA Solar System Exploration',
    },

    // is it true → myth vs fact
    brain: {
      id: 'brain', type: 'myth', q: 'Do we only use 10% of our brain?', short: 'The 10% myth', label: 'The 10% brain myth',
      subject: 'Mind', shape: 'brain', palette: 'mind', lobes: true,
      match: [/10 ?%|ten percent|10 percent|10 per ?cent/],
      lead: 'Myth. Brain scans such as [[fmri|fMRI]] show activity across the whole brain, and over a day you use virtually all of it. A brain is also too costly to carry spare parts: it burns about [[energy|a fifth of your energy]].',
      blocks: [
        { type: 'verdict', kind: 'myth', title: 'Myth', text: 'You use virtually all of your brain.' },
        { type: 'lobes', eyebrow: 'See it', title: 'What lights up',
          options: [['One task', 0.4, 'Any one task, like reading, uses a set of areas working together.'], ['A whole day', 1, 'Across a day, you use virtually all of it.']] },
        { type: 'myths', eyebrow: 'Myth or fact?', title: 'Test your brain on brains',
          items: [
            ['Your brain uses about a fifth of your body’s energy.', true, 'It’s about 2% of your weight, but uses roughly 20% of your energy at rest.'],
            ['You have ten glial cells for every neuron.', false, 'Newer counts find roughly one [[glia|glial cell]] for each neuron. There are about 86 billion neurons.'],
            ['Your brain stays busy while you sleep.', true, 'Sleep has its own patterns of activity, and the brain does important work then, like storing memories.'],
          ] },
        { type: 'points', eyebrow: 'Where it came from', title: 'Why the myth stuck',
          items: [
            ['book', 'A misread quote', 'No one knows for sure. It may have grown from misreadings of the psychologist William James, who wrote that people use only a small part of their mental potential.'],
            ['bolt', 'Not all at once', 'Your neurons don’t all fire at the same moment, and that’s good. A seizure is what happens when too many fire together.'],
          ] },
      ],
      sources: 'Azevedo et al., 2009 · Raichle & Gusnard, PNAS 2002 · Scientific American',
    },

    // teach me a skill → course offer
    photo: {
      id: 'photo', type: 'course', q: 'Teach me photography', short: 'Photography', label: 'Learn photography',
      subject: 'Skills', shape: 'ak-road', palette: 'cobalt',
      match: [/photo|camera/],
      lead: 'Photography is a skill, and skills stick best with practice. Here’s a short course I can build for you.',
      blocks: [
        { type: 'course', eyebrow: 'This sounds like a course', title: 'Photography, step by step',
          meta: '5 lessons · 10 min a day · practise with your own photos',
          stops: [
            ['See the light', 'Why light makes or breaks a photo'],
            ['The exposure triangle', 'Aperture, shutter speed and ISO'],
            ['Sharp where it matters', 'Focus and depth of field'],
            ['Frame it', 'The rule of thirds and leading lines'],
            ['Your first photo walk', 'Practise it all in one go'],
          ],
          tip: { title: 'One tip to start', lead: 'Three settings decide how bright a photo is. Together they’re called the [[exposure|exposure triangle]].',
            items: [['ring', 'Aperture', 'How wide the lens opens. Wider lets in more light and blurs the background.'], ['clock', 'Shutter speed', 'How long the shot lasts. Faster freezes motion.'], ['sun', 'ISO', 'How sensitive the sensor is. Higher is brighter, but grainier.']],
            after: 'Then try the [[thirds|rule of thirds]] on your next shot.' } },
      ],
      sources: '',
    },

    // make me something → quirky artifact
    octo: {
      id: 'octo', type: 'artifact', q: 'Make me something about octopuses', short: 'Octopus card', label: 'An octopus trading card',
      subject: 'Animals', shape: 'ak-octo', palette: 'arts',
      match: [/octop/],
      lead: 'Here’s a trading card for the octopus. Flip it, or turn it into a quiz to send a friend.',
      blocks: [
        { type: 'card', name: 'Octopus', tag: 'Cephalopod · Every ocean', no: 'No. 001 · Ocean set',
          stats: [['3', 'hearts'], ['8', 'arms'], ['Blue', 'blood'], ['500M', 'neurons']],
          back: [
            ['[[hearts|Three hearts]]', 'Two pump blood through the gills, one round the body.'],
            ['[[hemocyanin|Blue blood]]', 'It carries oxygen with copper, not iron.'],
            ['Brains in its arms', 'About two-thirds of its neurons are in its arms.'],
            ['[[chromatophores|Instant camouflage]]', 'Its skin changes colour in a fraction of a second.'],
          ],
          quiz: [
            ['How many hearts does an octopus have?', ['One', 'Two', 'Three'], 2],
            ['What colour is octopus blood?', ['Red', 'Blue', 'Green'], 1],
            ['Where are most of its neurons?', ['In its head', 'In its arms', 'In its hearts'], 1],
          ] },
      ],
      sources: 'Smithsonian Ocean · Godfrey-Smith, Other Minds (2016)',
    },
  };

  // ───────── Glowing terms. Each one opens a branch chat. ─────────
  const terms = {
    // purr
    larynx: { label: 'larynx', def: 'The voice box: a short tube of cartilage and muscle at the top of the windpipe.',
      q: 'What is the larynx?', shape: 'ring', palette: 'body', subject: 'Body',
      lead: 'The larynx is your voice box: a short tube of cartilage and muscle at the top of the windpipe. Air from your lungs passes through it, and its [[vocalfolds|vocal folds]] turn that air into sound when they [[vibration|vibrate]].',
      points: [
        ['shield', 'It guards your airway', 'When you swallow, a flap called the epiglottis folds over it, so food goes down the right pipe.'],
        ['wave', 'It makes your voice', 'Tighter folds vibrate faster and sound higher. That’s how you change pitch.'],
        ['pad', 'It’s how cats purr', 'A cat’s larynx muscles twitch many times a second, so its folds flutter and buzz.'],
      ] },
    vibration: { label: 'vibration', def: 'A fast back-and-forth movement. Sound is vibration travelling through the air.',
      q: 'What is a vibration?', shape: 'wave', palette: 'tech', subject: 'Physics',
      lead: 'A vibration is a quick back-and-forth movement. When something vibrates, it pushes the air in waves. When those waves reach your ear, you hear sound. How many vibrations happen each second is measured in [[hertz]].',
      block: { type: 'wave', eyebrow: 'Try it', title: 'Slow to fast', lo: 'Lower sound', hi: 'Higher sound', cap: ['Fewer vibrations each second: a deep, low sound, like a purr.', 'More vibrations each second: a higher sound, like a whistle.'] },
      points: [
        ['wave', 'Faster sounds higher', 'More vibrations per second means a higher pitch.'],
        ['pad', 'Purrs are low', 'A house cat purrs at roughly 25 to 150 vibrations a second.'],
      ] },
    hertz: { label: 'hertz', def: 'A hertz (Hz) is one vibration, or cycle, per second.',
      q: 'What is a hertz?', shape: 'spike', palette: 'tech', subject: 'Physics',
      lead: 'A hertz is one vibration, or cycle, every second. It’s named after Heinrich Hertz, who proved in the 1880s that radio waves exist.',
      points: [
        ['pad', 'A cat’s purr', 'About 25 to 150 Hz.'],
        ['note', 'Middle C on a piano', 'About 262 Hz.'],
        ['ear', 'What people hear', 'Roughly 20 to 20,000 Hz, for young, healthy ears.'],
        ['wifi', 'Wi-Fi', 'Radio waves at 2.4 or 5 billion Hz.'],
      ] },
    vocalfolds: { label: 'vocal folds', def: 'Two bands of tissue in the larynx that vibrate to make sound. Also called vocal cords.',
      q: 'What are vocal folds?', shape: 'split', palette: 'body', subject: 'Body',
      lead: 'Vocal folds are two small bands of muscle and tissue stretched across the [[larynx]]. They swing apart when you breathe, and come together to make sound, [[vibration|vibrating]] as air pushes past.',
      points: [
        ['wave', 'Folds, not cords', 'They’re folds of tissue, which is why scientists prefer “vocal folds”.'],
        ['pad', 'Cats have extra pads', 'In 2023, researchers found pads of tissue in cats’ vocal folds. They help make such low sounds from such a small voice box.'],
      ] },
    solicit: { label: 'solicitation purr', def: 'A purr with a high cry hidden inside, used when a cat wants something.',
      q: 'What is a solicitation purr?', shape: 'spike', palette: 'arts', subject: 'Animals',
      lead: 'It’s the purr cats use when they want something, usually food. In 2009, Karen McComb’s team found that cats hide a high-pitched cry inside it, a bit like a baby’s.',
      points: [
        ['bell', 'Hard to ignore', 'People rated these purrs as more urgent and less pleasant than ordinary purrs.'],
        ['heart', 'Even non-owners notice', 'People who had never owned a cat still heard them as more urgent.'],
      ] },
    roar: { label: 'roar', def: 'Lions, tigers, jaguars and leopards can roar. They can’t purr like a house cat.',
      q: 'Can big cats purr?', shape: 'burst', palette: 'arts', subject: 'Animals',
      lead: 'Mostly, it’s one or the other. The big cats that roar, like lions, tigers, jaguars and leopards, can’t purr the way a house cat does. Many cats that purr, like cheetahs and pumas, can’t roar.',
      points: [
        ['pad', 'Cheetahs purr', 'They’re big, but they can’t roar. They purr, chirp and hiss instead.'],
        ['wave', 'It’s in the throat', 'The difference comes from the [[larynx]] and the tissue around it.'],
      ] },
    // leaf
    chlorophyll: { label: 'chlorophyll', def: 'The green pigment plants use to catch sunlight and make food.',
      q: 'What is chlorophyll?', shape: 'burst', palette: 'society', subject: 'Nature',
      lead: 'Chlorophyll is the green pigment in leaves. It soaks up red and blue light to power photosynthesis, and reflects green, which is the colour you see.',
      points: [
        ['sun', 'Light into food', 'Plants use the energy it catches to turn water and carbon dioxide into sugar.'],
        ['leaf', 'Always being replaced', 'Leaves keep making fresh chlorophyll all summer, because it breaks down in sunlight.'],
      ] },
    carotenoids: { label: 'carotenoids', def: 'Yellow and orange pigments that sit in the leaf all summer.',
      q: 'What are carotenoids?', shape: 'funnel', palette: 'society', subject: 'Nature',
      lead: 'Carotenoids are yellow and orange pigments, the same family that colours carrots. They’re in the leaf all summer, hidden by the green of [[chlorophyll]], and show through once it fades.',
      points: [['sun', 'Helpers', 'They catch some extra light and protect the leaf from too much sun.']] },
    anthocyanins: { label: 'anthocyanins', def: 'Red and purple pigments that some trees make fresh in autumn.',
      q: 'What are anthocyanins?', shape: 'steps', palette: 'arts', subject: 'Nature',
      lead: 'Anthocyanins are red and purple pigments. Unlike [[carotenoids]], many trees make them fresh in autumn, from sugars trapped in the leaf. They also colour cherries, blueberries and red cabbage.',
      points: [['sun', 'Bright and cool', 'Sunny days and cool nights trap more sugar in leaves, which makes the reds brighter.']] },
    // croc
    crocodilians: { label: 'crocodilians', def: 'The reptile group of crocodiles, alligators, caimans and gharials.',
      q: 'What are crocodilians?', shape: 'grid', palette: 'society', subject: 'Animals',
      lead: 'Crocodilians are a group of reptiles: crocodiles, alligators, caimans and gharials. Surprisingly, their closest living relatives are birds.',
      points: [
        ['fish', 'Gharials fish', 'They have very long, thin snouts, built for snapping up fish.'],
        ['pin', 'Caimans', 'Close cousins of alligators, from Central and South America.'],
      ] },
    saltglands: { label: 'salt glands', def: 'Glands on a crocodile’s tongue that get rid of extra salt.',
      q: 'How do crocodiles live in salt water?', shape: 'wave', palette: 'tech', subject: 'Animals',
      lead: 'Crocodiles have salt glands on their tongue that push out extra salt. That lets many of them live where rivers meet the sea, and some swim along the coast.',
      points: [
        ['drop', 'Alligators have weak ones', 'Theirs barely work, so alligators mostly stay in fresh water.'],
        ['pin', 'Long-distance swimmers', 'Saltwater crocodiles have been tracked travelling long distances along coasts, riding the currents.'],
      ] },
    everglades: { label: 'Everglades', def: 'A huge wetland in south Florida, where alligators and crocodiles live side by side.',
      q: 'Where do alligators and crocodiles live together?', shape: 'target', palette: 'society', subject: 'Places',
      lead: 'South Florida, around the Everglades, is the only place where wild alligators and crocodiles live side by side.',
      points: [
        ['drop', 'Alligators inland', 'They live in the freshwater marshes and swamps.'],
        ['wave', 'Crocodiles by the coast', 'American crocodiles live in the brackish and salty water along the coast.'],
      ] },
    // sun
    light: { label: '8 minutes', def: 'Sunlight takes about 8 minutes and 20 seconds to reach Earth.',
      q: 'How far away is the Sun?', shape: 'funnel', palette: 'space', subject: 'Space',
      lead: 'About 150 million km. Light covers that in about 8 minutes and 20 seconds, so you always see the Sun as it was a few minutes ago.',
      points: [
        ['ruler', 'One AU', 'Astronomers call this distance one astronomical unit.'],
        ['car', 'By car', 'Driving nonstop at 100 km/h, you’d arrive in about 170 years.'],
      ] },
    supergiant: { label: 'red supergiant', def: 'A huge star that has swelled up near the end of its life.',
      q: 'What is a red supergiant?', shape: 'ring', palette: 'space', subject: 'Space',
      lead: 'A red supergiant is a huge star that has swelled up near the end of its life. Betelgeuse, the bright red star at Orion’s shoulder, is one of the best known.',
      points: [
        ['ruler', 'Past Mars', 'Put Betelgeuse where the Sun is, and it would reach out past the orbit of Mars.'],
        ['burst', 'It will explode', 'It’s expected to end as a supernova, probably within the next 100,000 years.'],
      ] },
    fusion: { label: 'fusion', def: 'Squeezing atoms together so hard they merge and release energy.',
      q: 'How does the Sun make energy?', shape: 'burst', palette: 'space', subject: 'Space',
      lead: 'Deep in its core, the Sun squeezes hydrogen atoms together so hard that they fuse into helium. Each fusion releases a little energy, and it happens an enormous number of times every second.',
      points: [
        ['flame', 'A very hot core', 'About 15 million °C at the centre.'],
        ['bolt', 'Mass into light', 'Every second, about 4 million tonnes of the Sun’s mass turns into energy.'],
      ] },
    // brain
    fmri: { label: 'fMRI', def: 'A scan that shows which parts of the brain are working, by tracking blood flow.',
      q: 'How does an fMRI scan work?', shape: 'target', palette: 'mind', subject: 'Mind',
      lead: 'Busy brain areas use more oxygen, so fresh blood flows there. An fMRI scanner picks up that change in the blood and turns it into a map of activity.',
      points: [
        ['magnet', 'Magnets, not X-rays', 'It uses a strong magnetic field and radio waves.'],
        ['clock', 'A slight delay', 'The change in blood flow lags a few seconds behind the brain activity.'],
      ] },
    energy: { label: 'a fifth of your energy', def: 'Your brain is about 2% of your weight but uses about 20% of your energy at rest.',
      q: 'Why does the brain use so much energy?', shape: 'bars', palette: 'mind', subject: 'Mind',
      lead: 'Neurons are always busy keeping themselves charged and ready to fire. Pumping charged particles in and out of cells takes a lot of energy, even when you’re resting.',
      points: [['bolt', 'About a fifth', 'The brain uses roughly 20% of your body’s energy at rest.'], ['moon', 'Even asleep', 'It keeps working through the night.']] },
    glia: { label: 'glial cells', def: 'Cells that support and protect neurons. There are about as many as there are neurons.',
      q: 'What are glial cells?', shape: 'grid', palette: 'mind', subject: 'Mind',
      lead: 'Glial cells are the brain’s support crew. They feed and protect neurons, clear away waste, and wrap nerve fibres in insulation so signals travel fast.',
      points: [
        ['scale', 'About one to one', 'Your brain has roughly as many glial cells as neurons.'],
        ['pad', 'Not just glue', '“Glia” comes from the Greek for glue, but they do far more than hold things together.'],
      ] },
    // octopus
    hearts: { label: 'three hearts', def: 'Two hearts pump blood through the gills, and one pumps it round the body.',
      q: 'Why do octopuses have three hearts?', shape: 'heart', palette: 'body', subject: 'Animals',
      lead: 'Two small hearts push blood through the gills, where it picks up oxygen. A third, bigger heart pumps it round the rest of the body.',
      points: [['wave', 'It pauses when they swim', 'The main heart stops beating while an octopus swims, which may be why they’d rather crawl.']] },
    hemocyanin: { label: 'blue blood', def: 'Octopus blood carries oxygen with copper-based hemocyanin, which turns it blue.',
      q: 'Why is octopus blood blue?', shape: 'wave', palette: 'tech', subject: 'Animals',
      lead: 'Our blood carries oxygen with iron-based haemoglobin, which makes it red. Octopuses use hemocyanin, which is based on copper, so their blood is blue.',
      points: [['drop', 'Horseshoe crabs too', 'Their blood is blue for the same reason.']] },
    chromatophores: { label: 'chromatophores', def: 'Tiny sacs of colour in the skin that octopuses stretch or squeeze to change colour.',
      q: 'How do octopuses change colour?', shape: 'grid', palette: 'arts', subject: 'Animals',
      lead: 'Their skin is packed with chromatophores: tiny sacs of colour, each ringed by muscles. Pull the muscles and a sac stretches wide to show its colour. Relax them and it shrinks to a dot.',
      points: [['bolt', 'Fast', 'They can change in a fraction of a second.'], ['leaf', 'Texture too', 'Many octopuses also raise bumps on their skin to match rock or coral.']] },
    // photography
    exposure: { label: 'exposure triangle', def: 'The three settings that decide how bright a photo is: aperture, shutter speed and ISO.',
      q: 'What is the exposure triangle?', shape: 'target', palette: 'cobalt', subject: 'Skills',
      lead: 'Three settings decide how bright a photo is: [[aperture]], shutter speed and ISO. Change one, and you balance it with another.',
      points: [['ring', 'Aperture', 'The size of the lens opening.'], ['clock', 'Shutter speed', 'How long the sensor collects light.'], ['sun', 'ISO', 'How sensitive the sensor is.']] },
    aperture: { label: 'aperture', def: 'The opening in the lens that lets light in. It’s measured in f-numbers.',
      q: 'What is aperture?', shape: 'ring', palette: 'cobalt', subject: 'Skills',
      lead: 'Aperture is the opening in the lens that lets light through. It’s measured in f-numbers, and the confusing part is that a smaller number means a wider opening.',
      points: [['ring', 'f/1.8 is wide', 'Lots of light, and a soft, blurry background.'], ['ring', 'f/16 is narrow', 'Less light, and more of the scene in focus.']] },
    thirds: { label: 'rule of thirds', def: 'Split the frame into a 3 × 3 grid, and put your subject on the lines.',
      q: 'What is the rule of thirds?', shape: 'grid', palette: 'cobalt', subject: 'Skills',
      lead: 'Picture two lines across and two lines down, splitting the frame into nine parts. Putting your subject on a line, or where two lines cross, often feels more balanced than dead centre.',
      points: [['grid', 'Your phone can show it', 'Turn on the grid in your camera settings.'], ['bolt', 'It’s a guide', 'Breaking it on purpose can work too.']] },
  };

  // ───────── Homes ─────────
  const wonder = { id: 'purr', eyebrow: 'Today’s wonder', hint: 'Poke it, or tap to open' };
  const suggestions = ['croc', 'leaf', 'photo', 'octo'];
  // Your past questions (demo history). Seeded branches are terms you already explored.
  const history = [
    { id: 'sun', when: 'Tuesday', branches: ['light', 'supergiant'] },
    { id: 'brain', when: 'Last week', branches: ['glia'] },
  ];
  // C · talk mode: what the simulated mic "hears"
  const talk = { transcript: 'What’s the difference between a crocodile and an alligator?' };
  // C · show mode: the sample object the simulated camera sees
  const show = { object: 'a leaf', say: 'That’s a leaf. Want to know why it changes colour?', ask: 'leaf' };

  // ───────── Generic answers: what each question type becomes ─────────
  const kinds = {
    explain: { name: 'a how-it-works question', gets: 'a visual you can poke, then the idea step by step', shape: 'burst', near: ['purr', 'leaf'] },
    compare: { name: 'a this-or-that question', gets: 'a side-by-side card that shows the difference', shape: 'split', near: ['croc'] },
    scale: { name: 'a how-big question', gets: 'a zoom from small to huge, all to scale', shape: 'target', near: ['sun'] },
    myth: { name: 'an is-it-true question', gets: 'a clear myth-or-fact verdict, with the evidence', shape: 'qmark', near: ['brain'] },
    course: { name: 'a skill to learn', gets: 'a short course with practice', shape: 'ak-road', near: ['photo'] },
    artifact: { name: 'something to make', gets: 'something to keep or share, like a card or a quiz', shape: 'ak-card', near: ['octo'] },
  };

  return { answers, terms, wonder, suggestions, history, talk, show, kinds };
})();
