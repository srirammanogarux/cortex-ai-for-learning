// The demo course. Generation is faked: whatever topic the user types, the prototype builds this course
// (unless the topic clearly matches another prepared one later). Shared by Onboarding, Learn and Profile.
window.COURSES = window.COURSES || {};
window.COURSES.heart = {
  id: 'heart',
  title: 'How your heart works',
  topic: 'The human heart',
  subject: 'Body', palette: 'body', color: ['#F783AC', '#D6336C'],
  shape: 'heart', // particle shape for the living visual / collectible

  // Course question 1 · the urgent goal (generated from the topic)
  goals: [
    { id: 'how', label: 'How it actually works', sub: 'The pump, the beat, the plumbing' },
    { id: 'condition', label: 'A condition someone has', sub: 'Like an arrhythmia or a heart attack' },
    { id: 'healthy', label: 'Keeping mine healthy', sub: 'What really helps, and what doesn’t' },
    { id: 'exam', label: 'For a class or exam', sub: 'Structure, cycle, key terms' },
  ],
  // Course question 2 · time
  spans: [
    { id: 'weekend', label: 'A weekend', lessons: 6 },
    { id: 'twoweeks', label: 'Two weeks', lessons: 8 },
    { id: 'month', label: 'A month', lessons: 10 },
  ],
  daily: ['5 min a day', '10 min a day', '20 min a day'],

  // The roadmap. kind: lesson | review | final. `goals` = which goals include this stop (omit = all).
  lessons: [
    { id: 'pump', kind: 'lesson', title: 'The pump that never stops', hook: 'About 100,000 beats today. Not one of them asked you.', shape: 'heart' },
    { id: 'rooms', kind: 'lesson', title: 'Four rooms and four doors', hook: 'Two atria, two ventricles, and valves that only open one way.', shape: 'grid' },
    { id: 'spark', kind: 'lesson', title: 'The spark that starts each beat', hook: 'A tiny patch of cells fires about once a second, on its own.', shape: 'spike' },
    { id: 'circuits', kind: 'lesson', title: 'Two circuits: lungs and body', hook: 'The right side does the short trip. The left side does the long one.', shape: 'split' },
    { id: 'review1', kind: 'review', title: 'Quick review', hook: 'Five fast questions on what you’ve covered.' },
    { id: 'pressure', kind: 'lesson', title: 'Blood pressure, explained', hook: 'What the two numbers actually measure.', shape: 'wave' },
    { id: 'wrong', kind: 'lesson', title: 'When the rhythm goes wrong', hook: 'Arrhythmias: too fast, too slow, or out of step.', shape: 'spike', goals: ['condition', 'how', 'exam'] },
    { id: 'attack', kind: 'lesson', title: 'What happens in a heart attack', hook: 'A blocked artery, a starving muscle, and why minutes matter.', shape: 'burst', goals: ['condition', 'healthy'] },
    { id: 'strong', kind: 'lesson', title: 'Keeping it strong', hook: 'Exercise, sleep, salt: what the evidence says.', shape: 'bars', goals: ['healthy', 'how'] },
    { id: 'cycle', kind: 'lesson', title: 'The cardiac cycle, step by step', hook: 'Systole, diastole, and the “lub-dub”.', shape: 'ring', goals: ['exam', 'how'] },
    { id: 'review2', kind: 'review', title: 'Review', hook: 'The ideas you’re about to forget, brought back.' },
    { id: 'final', kind: 'final', title: 'Final challenge', hook: 'Put it all together, and earn your heart.' },
  ],

  // Course end
  gift: { id: 'living-heart', title: 'The living heart', sub: 'A one-of-a-kind collectible, made from your course.', shape: 'heart', palette: 'body' },
  widen: [
    { id: 'lungs', title: 'How your lungs work', why: 'The other half of the short circuit' },
    { id: 'blood', title: 'What blood is made of', why: 'What the pump is actually moving' },
    { id: 'track', title: 'Track: How your body keeps you alive', why: 'Heart + Lungs + Blood, joined into one path', big: true },
  ],
};

// The roadmap for a goal and span: filter by goal, trim to the span's lesson count, always end with the final.
window.courseRoadmap = function (course, goalId, spanId) {
  const span = course.spans.find((s) => s.id === spanId) || course.spans[1];
  const list = course.lessons.filter((l) => l.kind === 'final' ? false : !l.goals || l.goals.includes(goalId || 'how'));
  const trimmed = list.slice(0, Math.max(3, span.lessons - 1));
  return trimmed.concat(course.lessons.filter((l) => l.kind === 'final'));
};

// Suggestions shown under "What do you want to learn?" (secondary to typing).
window.TOPIC_SUGGESTIONS = ['How the human heart works', 'Why black holes bend light', 'Cooking like a chef', 'The fall of Rome', 'Photography basics', 'How money really works'];
