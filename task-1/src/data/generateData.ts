// Fake data generator for leaderboard — no real names or data
// Uses randomuser.me portrait URLs for realistic fake photos

const MALE_FIRST_NAMES = [
  'James', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Steven', 'Andrew', 'Paul',
  'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason',
  'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Nicholas', 'Gary', 'Eric', 'Jonathan',
  'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond',
  'Gregory', 'Frank', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Nathan', 'Peter',
  'Zachary', 'Tyler', 'Aaron', 'Henry', 'Douglas', 'Adam', 'Kyle', 'Noah',
  'Ethan', 'Jeremy', 'Walter', 'Christian', 'Keith', 'Roger', 'Terry', 'Austin',
  'Sean', 'Gerald', 'Carl', 'Harold', 'Dylan', 'Arthur', 'Lawrence', 'Jordan',
  'Jesse', 'Bryan', 'Billy', 'Bruce', 'Gabriel', 'Joe', 'Logan', 'Albert',
  'Willie', 'Alan', 'Eugene', 'Russell', 'Vincent', 'Philip', 'Bobby', 'Harry',
  'Johnny', 'Howard', 'Roy', 'Ralph', 'Wayne', 'Randy', 'Louis', 'Martin',
  'Victor', 'Caleb', 'Oscar', 'Leonard',
];

const FEMALE_FIRST_NAMES = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica',
  'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley',
  'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa',
  'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy',
  'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
  'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine',
  'Maria', 'Heather', 'Diane', 'Ruth', 'Julie', 'Olivia', 'Joyce', 'Virginia',
  'Victoria', 'Kelly', 'Lauren', 'Christina', 'Joan', 'Evelyn', 'Judith', 'Megan',
  'Andrea', 'Cheryl', 'Hannah', 'Jacqueline', 'Martha', 'Gloria', 'Teresa', 'Ann',
  'Sara', 'Madison', 'Frances', 'Kathryn', 'Janice', 'Jean', 'Abigail', 'Alice',
  'Judy', 'Sophia', 'Grace', 'Denise', 'Amber', 'Doris', 'Marilyn', 'Danielle',
  'Beverly', 'Isabella', 'Theresa', 'Diana', 'Natalie', 'Brittany', 'Charlotte', 'Marie',
  'Kayla', 'Alexis', 'Lori', 'Haley',
];

const LAST_NAMES = [
  'Anderson', 'Brooks', 'Campbell', 'Dawson', 'Edwards', 'Foster', 'Griffin',
  'Harrison', 'Ingram', 'Jensen', 'Keller', 'Lambert', 'Mitchell', 'Norton',
  'Owens', 'Palmer', 'Quinn', 'Reynolds', 'Stevens', 'Thompson', 'Underwood',
  'Voss', 'Wallace', 'Xu', 'York', 'Zimmerman', 'Abbott', 'Bennett', 'Chase',
  'Donovan', 'Ellis', 'Fitzgerald', 'Grant', 'Howell', 'Irwin', 'Jacobs',
  'Knox', 'Lawson', 'Marsh', 'Nash', 'Ortega', 'Pierce', 'Ramsey', 'Sawyer',
  'Turner', 'Upton', 'Vaughn', 'Webb', 'Xiong', 'Young', 'Archer', 'Blake',
  'Connors', 'Drake', 'Everett', 'Floyd', 'Gallagher', 'Hayes', 'Ives',
  'Jordan', 'Kent', 'Lowe', 'Monroe', 'Nichols', 'Odom', 'Pratt', 'Reeves',
  'Shelton', 'Tate', 'Ulrich', 'Vernon', 'Winters', 'Yates', 'Zane',
  'Barton', 'Cross', 'Dunn', 'Emerson', 'Frost', 'Gibson', 'Hart', 'Ingalls',
  'James', 'King', 'Lang', 'Maxwell', 'Neal', 'Oliver', 'Page', 'Rich',
  'Stone', 'Terrell', 'Unger', 'Vale', 'Walsh', 'Xiao', 'Yoder', 'Zeller',
  'Arnold', 'Burke', 'Clay', 'Doyle',
];

const ROLES = [
  'Software Engineer', 'Senior Software Engineer', 'Staff Engineer',
  'QA Engineer', 'Senior QA Engineer', 'DevOps Engineer',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Tech Lead', 'Engineering Manager', 'Group Manager',
  'Product Manager', 'Senior Product Manager', 'Project Manager',
  'UX Designer', 'Senior UX Designer', 'UI Designer',
  'Data Analyst', 'Data Engineer', 'ML Engineer',
  'HR Specialist', 'Recruiter', 'People Partner',
  'Business Analyst', 'Solutions Architect', 'Cloud Engineer',
  'Security Engineer', 'Platform Engineer', 'Mobile Developer',
];

const CATEGORIES = ['Education', 'Public Speaking', 'University Partnership'] as const;
export type Category = typeof CATEGORIES[number];

const ACTIVITY_TEMPLATES: Record<Category, string[]> = {
  'Education': [
    '[EDU] Introduction to Cloud Architecture',
    '[EDU] Advanced TypeScript Patterns Workshop',
    '[EDU] React Performance Optimization',
    '[EDU] Docker & Kubernetes Fundamentals',
    '[EDU] GraphQL Best Practices',
    '[EDU] Design Systems Workshop',
    '[EDU] AI/ML Foundations Course',
    '[EDU] Clean Code Principles Session',
    '[EDU] Microservices Architecture Overview',
    '[EDU] Testing Strategies & TDD Workshop',
    '[EDU] Security Awareness Training',
    '[EDU] Agile & Scrum Methodology',
    '[EDU] Database Optimization Techniques',
    '[EDU] CI/CD Pipeline Masterclass',
    '[EDU] Web Accessibility Standards',
    '[EDU] Python for Data Science',
    '[EDU] System Design Interview Prep',
    '[EDU] Git Advanced Workflows',
    '[EDU] API Design Principles',
    '[EDU] Observability & Monitoring',
  ],
  'Public Speaking': [
    '[EDU] Tech Talk: Future of Web Development',
    '[EDU] Lightning Talk: State Management Patterns',
    '[REG] Conference Presentation: DevOps Practices',
    '[EDU] Knowledge Sharing: API Gateway Patterns',
    '[EDU] Panel Discussion: Engineering Culture',
    '[REG] Meetup Talk: Modern CSS Techniques',
    '[EDU] Workshop: Building Scalable Systems',
    '[REG] Webinar: Cloud Migration Strategies',
    '[EDU] Brown Bag: Mobile Development Trends',
    '[EDU] Tech Digest Weekly Presentation',
    '[REG] Offline Meetup: Code Quality & Reviews',
    '[EDU] Demo Day: Internal Tools Showcase',
    '[REG] Community Talk: Open Source Contributions',
    '[EDU] Fireside Chat: Career Growth in Tech',
    '[EDU] Roundtable: Cross-Team Collaboration',
  ],
  'University Partnership': [
    '[UNI] Guest Lecture: Software Engineering 101',
    '[UNI] Student Mentoring Program Session',
    '[UNI] Career Fair Booth Volunteering',
    '[UNI] Hackathon Mentor & Judge',
    '[UNI] University Workshop: Intro to React',
    '[UNI] Internship Program Coordination',
    '[UNI] Campus Tech Talk: Industry Trends',
    '[UNI] Thesis Review & Advisory',
    '[UNI] University Lab Partnership Meeting',
    '[UNI] Student Project Code Review',
  ],
};

const POINTS = [8, 16, 32, 64];
const POINT_WEIGHTS: Record<Category, number[]> = {
  'Education': [0.4, 0.35, 0.2, 0.05],
  'Public Speaking': [0.1, 0.3, 0.35, 0.25],
  'University Partnership': [0.2, 0.3, 0.3, 0.2],
};

export interface Activity {
  id: string;
  title: string;
  category: Category;
  date: string; // ISO date
  dateFormatted: string; // DD-Mon-YYYY
  points: number;
  year: number;
  quarter: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl: string;
  activities: Activity[];
  totalScore: number;
  initials: string;
  gender: 'male' | 'female';
}

// Seeded PRNG for reproducible data
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const mon = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${mon}-${year}`;
}

function getQuarter(month: number): number {
  return Math.floor(month / 3) + 1;
}

function pickWeighted(random: () => number, weights: number[]): number {
  const r = random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (r < sum) return i;
  }
  return weights.length - 1;
}

function generateDeptCode(random: () => number): string {
  const units = ['EN', 'PM', 'DS', 'QA', 'HR', 'UX', 'OPS', 'SEC'];
  const unit = units[Math.floor(random() * units.length)];
  const u = Math.floor(random() * 5) + 1;
  const d = Math.floor(random() * 8) + 1;
  const g = Math.floor(random() * 4) + 1;
  return `${unit}.U${u}.D${d}.G${g}`;
}

// randomuser.me portraits: men/0-99, women/0-99 — 100 each, we cycle through
function getAvatarUrl(gender: 'male' | 'female', index: number): string {
  const folder = gender === 'male' ? 'men' : 'women';
  const id = index % 100; // 0-99 available per gender
  return `https://randomuser.me/api/portraits/${folder}/${id}.jpg`;
}

export function generateData(count = 300, seed = 42): Employee[] {
  const random = mulberry32(seed);
  const usedNames = new Set<string>();
  const employees: Employee[] = [];
  let maleIdx = 0;
  let femaleIdx = 0;

  for (let i = 0; i < count; i++) {
    // Alternate genders roughly 50/50
    const gender: 'male' | 'female' = random() < 0.5 ? 'male' : 'female';
    const firstNames = gender === 'male' ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;

    // Generate unique name
    let name: string;
    let attempts = 0;
    do {
      const first = firstNames[Math.floor(random() * firstNames.length)];
      const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
      name = `${first} ${last}`;
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    usedNames.add(name);

    const role = ROLES[Math.floor(random() * ROLES.length)];
    const department = generateDeptCode(random);
    const parts = name.split(' ');
    const initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

    // Assign portrait photo with sequential index per gender
    let avatarUrl: string;
    if (gender === 'male') {
      avatarUrl = getAvatarUrl('male', maleIdx++);
    } else {
      avatarUrl = getAvatarUrl('female', femaleIdx++);
    }

    // Generate activities (1–20 per person)
    const activityCount = Math.floor(random() * 20) + 1;
    const activities: Activity[] = [];

    for (let j = 0; j < activityCount; j++) {
      const catIdx = Math.floor(random() * CATEGORIES.length);
      const category = CATEGORIES[catIdx];

      const templates = ACTIVITY_TEMPLATES[category];
      const template = templates[Math.floor(random() * templates.length)];

      const pointIdx = pickWeighted(random, POINT_WEIGHTS[category]);
      const points = POINTS[pointIdx];

      const year = random() < 0.35 ? 2024 : 2025;
      const month = Math.floor(random() * 12);
      const day = Math.floor(random() * 28) + 1;
      const date = new Date(year, month, day);
      const quarter = getQuarter(month);

      activities.push({
        id: `${i}-${j}`,
        title: template,
        category,
        date: date.toISOString().slice(0, 10),
        dateFormatted: formatDate(date),
        points,
        year,
        quarter,
      });
    }

    // Sort activities by date descending
    activities.sort((a, b) => b.date.localeCompare(a.date));

    const totalScore = activities.reduce((sum, a) => sum + a.points, 0);

    employees.push({
      id: String(i),
      name,
      role,
      department,
      avatarUrl,
      activities,
      totalScore,
      initials,
      gender,
    });
  }

  // Sort by total score descending
  employees.sort((a, b) => b.totalScore - a.totalScore);

  return employees;
}

// Pre-generated static data
export const employees = generateData(300);
