// Display names and icons for the interest tags served by /auth/config.
export const TAG_META = {
  Coding: { name: 'Coding & CP', icon: '👨‍💻' },
  'AI/ML': { name: 'AI & Machine Learning', icon: '🤖' },
  'Web Dev': { name: 'Web & App Development', icon: '💻' },
  Robotics: { name: 'Robotics & Hardware', icon: '⚙️' },
  Photography: { name: 'Photography & Film', icon: '📷' },
  Drama: { name: 'Drama & Theatre', icon: '🎭' },
  Music: { name: 'Music & Bands', icon: '🎸' },
  Dance: { name: 'Dance', icon: '💃' },
  Debating: { name: 'Debating & MUN', icon: '🎙️' },
  Finance: { name: 'Finance & Markets', icon: '📈' },
  Quizzing: { name: 'Quizzing & Trivia', icon: '🧠' },
  'Public Speaking': { name: 'Public Speaking', icon: '📢' },
  Design: { name: 'Design & UI/UX', icon: '🎨' },
};

export const tagMeta = (id) => TAG_META[id] || { name: id, icon: '✨' };
