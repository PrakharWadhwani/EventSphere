// Demo data: 10 KIIT societies and 50+ events spread over the coming weeks.
// Dates are generated relative to "today" so the feed always has upcoming events.

export const INTEREST_TAGS = [
  "Coding", "AI/ML", "Web Dev", "Robotics", "Photography", "Drama",
  "Music", "Dance", "Debating", "Finance", "Quizzing", "Public Speaking", "Design",
];

export const CATEGORIES = ["Technical", "Cultural", "Workshops"];

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const SOCIETIES = [
  { id: "soc_krs", name: "KIIT Robotics Society", tags: ["Robotics", "AI/ML", "Coding"], description: "Building bots, drones and autonomous systems since 2011." },
  { id: "soc_fed", name: "FED KIIT", tags: ["Web Dev", "Coding", "Design"], description: "Frontend Developers community: web, app and UI engineering." },
  { id: "soc_gdg", name: "GDG on Campus KIIT", tags: ["Coding", "AI/ML", "Web Dev"], description: "Google Developer Group: talks, study jams and hackathons." },
  { id: "soc_kalakaar", name: "Kalakaar Drama Society", tags: ["Drama", "Public Speaking"], description: "Street plays, stage productions and improv nights." },
  { id: "soc_kmc", name: "KIIT Music Club", tags: ["Music"], description: "Bands, acoustic jams and the annual battle of bands." },
  { id: "soc_kfs", name: "KIIT Film & Photography Society", tags: ["Photography", "Design"], description: "Photowalks, short films and editing workshops." },
  { id: "soc_mun", name: "KIIT MUN Society", tags: ["Debating", "Public Speaking"], description: "Model United Nations conferences and debate training." },
  { id: "soc_fin", name: "KIIT Finance Club", tags: ["Finance"], description: "Markets, investing simulations and case competitions." },
  { id: "soc_quiz", name: "KIIT Quiz Club", tags: ["Quizzing"], description: "General, tech and pop-culture quizzes every week." },
  { id: "soc_dance", name: "KIIT Dance Crew", tags: ["Dance", "Music"], description: "Hip-hop, contemporary and classical dance crews." },
];

const VENUES = [
  "Campus 6 Auditorium", "Campus 15 Seminar Hall", "KSAC Main Stage", "Campus 3 Lab Complex",
  "Campus 17 Convention Hall", "Campus 25 Amphitheatre", "Central Library Hall", "Campus 14 Room 101",
];

// [societyId, title, category, tags, imageId, description]
const TEMPLATES = [
  ["soc_krs", "RoboWars 2026", "Technical", ["Robotics"], "photo-1485827404703-89b55fcc595e", "Combat robotics championship. Build a 15kg bot and battle it out in the arena."],
  ["soc_krs", "Intro to ROS Workshop", "Workshops", ["Robotics", "Coding"], "photo-1561144257-e32e8efc6c4f", "Hands-on introduction to the Robot Operating System. Laptops required."],
  ["soc_krs", "Line Follower Sprint", "Technical", ["Robotics"], "photo-1581091226825-a6a2a5aee158", "Design the fastest line-following robot. Kits provided for first-years."],
  ["soc_krs", "Drone Building Bootcamp", "Workshops", ["Robotics", "AI/ML"], "photo-1473968512647-3e447244af8f", "Two-day bootcamp on assembling and flying quadcopters safely."],
  ["soc_krs", "Computer Vision for Robots", "Workshops", ["AI/ML", "Robotics"], "photo-1555255707-c07966088b7b", "Use OpenCV to give your robot eyes. Python basics expected."],
  ["soc_fed", "Hack the Frontend", "Technical", ["Web Dev", "Coding"], "photo-1498050108023-c5249f4df085", "12-hour frontend hackathon. Build a polished web app from a surprise brief."],
  ["soc_fed", "React from Zero", "Workshops", ["Web Dev", "Coding"], "photo-1633356122544-f134324a6cee", "Beginner-friendly React workshop covering components, state and hooks."],
  ["soc_fed", "UI/UX Design Sprint", "Workshops", ["Design", "Web Dev"], "photo-1561070791-2526d30994b5", "Learn Figma and design a mobile app prototype in one afternoon."],
  ["soc_fed", "Open Source Day", "Technical", ["Coding", "Web Dev"], "photo-1556075798-4825dfaaf498", "Make your first open-source pull request with mentors on hand."],
  ["soc_fed", "Portfolio Website Clinic", "Workshops", ["Web Dev", "Design"], "photo-1467232004584-a241de8bcf5d", "Get your personal portfolio reviewed and deployed before placement season."],
  ["soc_gdg", "InnovateX: AI & ML Hackathon", "Technical", ["AI/ML", "Coding"], "photo-1517245386807-bb43f82c33c4", "KIIT's flagship 24-hour hackathon. Turn ideas into working AI prototypes. Prizes worth ₹50,000."],
  ["soc_gdg", "Gemini API Study Jam", "Workshops", ["AI/ML", "Coding"], "photo-1677442136019-21780ecad995", "Build an LLM-powered app end-to-end in a guided study jam."],
  ["soc_gdg", "Flutter Forward", "Workshops", ["Coding", "Web Dev"], "photo-1512941937669-90a1b58e7e9c", "Cross-platform app development with Flutter and Firebase."],
  ["soc_gdg", "Cloud Career Talk", "Technical", ["Coding", "Public Speaking"], "photo-1451187580459-43490279c0fa", "Alumni from top cloud teams talk about careers, interviews and certifications."],
  ["soc_gdg", "DSA Contest Night", "Technical", ["Coding"], "photo-1504639725590-34d0984388bd", "Three-hour competitive programming contest. Top 10 win swag."],
  ["soc_gdg", "Kaggle Kickstart", "Workshops", ["AI/ML"], "photo-1551288049-bebda4e38f71", "Your first Kaggle competition: EDA, baselines and submissions."],
  ["soc_kalakaar", "Nukkad Natak Festival", "Cultural", ["Drama"], "photo-1503095396549-807759245b35", "Street play festival with teams from across campuses."],
  ["soc_kalakaar", "Improv Night", "Cultural", ["Drama", "Public Speaking"], "photo-1507676184212-d03ab07a01bf", "Unscripted comedy. Audience suggestions drive every scene."],
  ["soc_kalakaar", "Acting Fundamentals Workshop", "Workshops", ["Drama"], "photo-1460723237483-ff2c1d5b4a8f", "Voice, movement and character work with senior theatre members."],
  ["soc_kalakaar", "Annual Stage Production", "Cultural", ["Drama"], "photo-1514306191717-452ec28c7814", "Kalakaar's full-length annual play. Free entry for KIIT students."],
  ["soc_kalakaar", "Monologue Slam", "Cultural", ["Drama", "Public Speaking"], "photo-1516307365426-bea591f05011", "Perform a two-minute monologue. Judges pick the best three."],
  ["soc_kmc", "Acoustica: Sunset Unplugged", "Cultural", ["Music"], "photo-1511671782779-c97d3d27a1d4", "Open-air acoustic night with student vocalists and guitarists."],
  ["soc_kmc", "Battle of Bands", "Cultural", ["Music"], "photo-1501386761578-eac5c94b800a", "Campus bands compete for the title and a studio recording session."],
  ["soc_kmc", "Music Production 101", "Workshops", ["Music", "Design"], "photo-1598488035139-bdbb2231ce04", "Make your first beat in a DAW. Headphones recommended."],
  ["soc_kmc", "Karaoke Evening", "Cultural", ["Music"], "photo-1516280440614-37939bbacd81", "Grab the mic. Bollywood, indie and everything in between."],
  ["soc_kmc", "Open Mic: Songwriters' Circle", "Cultural", ["Music", "Public Speaking"], "photo-1525926477800-7a3b10316ac6", "Share original songs and poetry in an intimate setting."],
  ["soc_kfs", "Campus Photowalk", "Workshops", ["Photography"], "photo-1452587925148-ce544e77e70d", "Golden-hour photowalk across campus with composition tips."],
  ["soc_kfs", "Short Film Screening", "Cultural", ["Photography", "Drama"], "photo-1489599849927-2ee91cede3ba", "Screening of student short films followed by a director Q&A."],
  ["soc_kfs", "Lightroom Editing Masterclass", "Workshops", ["Photography", "Design"], "photo-1542038784456-1ea8e935640e", "Colour grading and retouching workflow in Lightroom."],
  ["soc_kfs", "48-Hour Film Challenge", "Cultural", ["Photography", "Drama"], "photo-1478720568477-152d9b164e26", "Write, shoot and edit a short film in 48 hours."],
  ["soc_kfs", "Mobile Photography Contest", "Cultural", ["Photography"], "photo-1512499617640-c74ae3a79d37", "Theme revealed on the day. Phones only."],
  ["soc_mun", "KIIT MUN 2026", "Cultural", ["Debating", "Public Speaking"], "photo-1540575467063-178a50c2df87", "Three-day Model UN conference with six committees."],
  ["soc_mun", "Parliamentary Debate Open", "Cultural", ["Debating"], "photo-1475721027785-f74eccf877e2", "British Parliamentary format debate tournament."],
  ["soc_mun", "Public Speaking Bootcamp", "Workshops", ["Public Speaking"], "photo-1505373877841-8d25f7d46678", "Beat stage fright. Structure, voice and body language drills."],
  ["soc_mun", "Policy Paper Writing", "Workshops", ["Debating"], "photo-1455390582262-044cdead277a", "How to research and write position papers for MUN."],
  ["soc_mun", "Mock Press Conference", "Cultural", ["Public Speaking", "Debating"], "photo-1559223607-a43c990c692c", "Face tough questions from a simulated press corps."],
  ["soc_fin", "Stock Market Simulation", "Technical", ["Finance"], "photo-1611974789855-9c2a0a7236a3", "Trade on a live-market simulator. Highest portfolio wins."],
  ["soc_fin", "Personal Finance for Students", "Workshops", ["Finance"], "photo-1554224155-6726b3ff858f", "Budgeting, SIPs and avoiding common money mistakes."],
  ["soc_fin", "Case Study Competition", "Technical", ["Finance", "Public Speaking"], "photo-1552664730-d307ca884978", "Crack a real business case and pitch to a jury of alumni."],
  ["soc_fin", "Crypto & Blockchain Explained", "Workshops", ["Finance", "Coding"], "photo-1639762681485-074b7f938ba0", "What blockchains actually are, without the hype."],
  ["soc_fin", "Excel for Analysts", "Workshops", ["Finance"], "photo-1543286386-713bdd548da4", "Pivot tables, lookups and financial modelling basics."],
  ["soc_quiz", "General Quiz Open", "Cultural", ["Quizzing"], "photo-1606326608606-aa0b62935f2b", "Teams of up to three. Open to all years."],
  ["soc_quiz", "Tech Quiz", "Technical", ["Quizzing", "Coding"], "photo-1518770660439-4636190af475", "Gadgets, startups and computing history."],
  ["soc_quiz", "Pop Culture Quiz", "Cultural", ["Quizzing"], "photo-1489599849927-2ee91cede3ba", "Movies, music, memes and more."],
  ["soc_quiz", "Sports Quiz", "Cultural", ["Quizzing"], "photo-1461896836934-ffe607ba8211", "Cricket, football and everything sporty."],
  ["soc_quiz", "Quiz Writing Workshop", "Workshops", ["Quizzing"], "photo-1434030216411-0b793f4b4173", "Learn to write connect-the-dots questions like a pro."],
  ["soc_dance", "Dance Off 2026", "Cultural", ["Dance"], "photo-1508700929628-666bc8bd84ea", "Solo and crew categories across all styles."],
  ["soc_dance", "Hip-Hop Basics", "Workshops", ["Dance"], "photo-1535525153412-5a42439a210d", "Grooves, footwork and freestyle foundations."],
  ["soc_dance", "Classical Evening", "Cultural", ["Dance", "Music"], "photo-1547153760-18fc86324498", "Odissi, Kathak and Bharatanatyam performances."],
  ["soc_dance", "Flash Mob Rehearsal", "Workshops", ["Dance"], "photo-1504609813442-a8924e83f76e", "Join the fest flash mob. No experience needed."],
  ["soc_dance", "Contemporary Showcase", "Cultural", ["Dance"], "photo-1518834107812-67b0b7c58434", "An evening of contemporary pieces choreographed by students."],
  ["soc_gdg", "Web3 & Security CTF", "Technical", ["Coding"], "photo-1550751827-4bd374c3f58b", "Capture-the-flag security contest for beginners and pros."],
  ["soc_fed", "Accessibility in Web Apps", "Workshops", ["Web Dev", "Design"], "photo-1531403009284-440f080d1e12", "Make your apps usable by everyone: ARIA, contrast and keyboard nav."],
  ["soc_krs", "Arduino for Absolute Beginners", "Workshops", ["Robotics", "Coding"], "photo-1553406830-ef2513450d76", "Blink an LED, read a sensor, build a mini project."],
];

const pad = (n) => String(n).padStart(2, "0");
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function buildSeed(now = new Date()) {
  const societies = SOCIETIES.map((s) => ({ ...s }));

  const events = TEMPLATES.map(([societyId, title, category, tags, imageId, description], i) => {
    // Every 11th event (mixed societies) happens today; the rest spread across ~6 weeks.
    const offset = i % 11 === 0 ? 0 : 1 + ((i * 7) % 42);
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const startHour = 9 + (i % 9);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return {
      id: `evt_${pad(i + 1)}${slug.slice(0, 20)}`,
      title,
      societyId,
      category,
      tags,
      bannerImageUrl: img(imageId),
      venue: VENUES[i % VENUES.length],
      date: toDateStr(date),
      startTime: `${pad(startHour)}:00`,
      endTime: `${pad(Math.min(startHour + 2 + (i % 3), 23))}:00`,
      description,
      registrationLink: `https://forms.gle/eventsphere-${slug}`,
      status: "Published",
      createdBy: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  });

  return { societies, events, users: [], pushSubscriptions: [] };
}
