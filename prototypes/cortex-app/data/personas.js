// Personas: five people a reviewer can step into. Owner: A · Onboarding. See CONTRACT.md (v5).
// Each profile is exactly what that person would answer in onboarding (the Store.profile shape):
//   persona, topic, topicLabel, reason ('work'|'exam'|'career'|'life'), role, roleText, level ('new'|'bit'|'basics'|'deep'),
//   goal (an outcome id from data/courses-catalog.js), goalText, daily (minutes a day), span ('week'|'twoweeks'|'month').
window.PERSONAS = {
  priya: {
    name: 'Priya', age: 28,
    blurb: 'Product manager. AI comes up in every meeting and she nods along.',
    profile: { persona: 'priya', topic: 'ai', topicLabel: 'Learn how AI actually works', reason: 'work', role: 'tech', roleText: 'Product manager', level: 'bit', goal: 'explain', goalText: 'Explain AI to my team', daily: 10, span: 'twoweeks' },
  },
  arjun: {
    name: 'Arjun', age: 17,
    blurb: 'Class 12. His board exam is in 10 weeks.',
    profile: { persona: 'arjun', topic: 'physio', topicLabel: 'Learn about the physiology of the human body', reason: 'exam', role: 'student', roleText: '', level: 'basics', goal: 'fullmarks', goalText: 'Score full marks on physiology', daily: 15, span: 'month' },
  },
  maya: {
    name: 'Maya', age: 33,
    blurb: 'Operations lead, moving into data.',
    profile: { persona: 'maya', topic: 'sql', topicLabel: 'Learn SQL for a data job', reason: 'career', role: 'business', roleText: 'Operations lead', level: 'new', goal: 'interview', goalText: 'Pass a SQL interview', daily: 20, span: 'month' },
  },
  tom: {
    name: 'Tom', age: 45,
    blurb: 'His savings have sat in a bank account for years.',
    profile: { persona: 'tom', topic: 'invest', topicLabel: 'Learn how investing works', reason: 'life', role: null, roleText: '', level: 'new', goal: 'savings', goalText: 'Put my savings to work without guessing', daily: 10, span: 'twoweeks' },
  },
  lena: {
    name: 'Lena', age: 29,
    blurb: 'Moving to Madrid in three months.',
    profile: { persona: 'lena', topic: 'spanish', topicLabel: 'Learn Spanish for daily life', reason: 'life', role: null, roleText: '', level: 'bit', goal: 'flatdoctor', goalText: 'Handle renting a flat and a doctor’s visit', daily: 15, span: 'month' },
  },
};
