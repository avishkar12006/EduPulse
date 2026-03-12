// ═══════════════════════════════════════════════════
//  EDUPULSE — COMPLETE DEMO DATA (No backend needed)
// ═══════════════════════════════════════════════════

export const DEMO_USERS = {
  // ── College Students ──────────────────────────────
  'aarav@demo.com': {
    _id: 'student_aarav',
    email: 'aarav@demo.com',
    password: 'demo123',
    name: 'Aarav Sharma',
    role: 'college_student',
    avatar: '👨‍💻',
    studentId: 'stu_aarav',
  },
  'priya@demo.com': {
    _id: 'student_priya',
    email: 'priya@demo.com',
    password: 'demo123',
    name: 'Priya Patel',
    role: 'college_student',
    avatar: '👩‍🔬',
    studentId: 'stu_priya',
  },
  // ── School Students ───────────────────────────────
  'riya@demo.com': {
    _id: 'student_riya',
    email: 'riya@demo.com',
    password: 'demo123',
    name: 'Riya Gupta',
    role: 'school_student',
    avatar: '👧',
    studentId: 'stu_riya',
    studentData: { class: 7 },
  },
  // ── Parent ────────────────────────────────────────
  'parent@demo.com': {
    _id: 'user_parent',
    email: 'parent@demo.com',
    password: 'demo123',
    name: 'Mr. Ramesh Sharma',
    role: 'parent',
    avatar: '👨',
    parentOf: ['stu_aarav'],
  },
  // ── SCM ───────────────────────────────────────────
  'scm@demo.com': {
    _id: 'user_scm',
    email: 'scm@demo.com',
    password: 'demo123',
    name: 'Prof. Ananya Sharma',
    role: 'scm',
    avatar: '👩‍🏫',
  },
  // ── Admin ─────────────────────────────────────────
  'admin@demo.com': {
    _id: 'user_admin',
    email: 'admin@demo.com',
    password: 'demo123',
    name: 'Principal Dr. Mehta',
    role: 'admin',
    avatar: '👨‍💼',
  },
};

// ── Student profiles (full data) ──────────────────
export const DEMO_STUDENTS = {
  'stu_aarav': {
    _id: 'stu_aarav',
    name: 'Aarav Sharma',
    rollNumber: 'CS21034',
    department: 'Computer Science',
    semester: 5,
    section: 'A',
    cluster: 'below',
    academicHealthScore: 52,
    attendancePercentage: 68,
    moodToday: 2,
    xpPoints: 320,
    level: 3,
    streakDays: 2,
    badges: [{ name: 'First Login', icon: '🚀' }],
    clusterHistory: [{ cluster: 'medium' }, { cluster: 'below' }],
    reasons: ['Attendance below 75%', 'Failed Mathematics mid-term'],
    subjects: [
      { name: 'Data Structures', grade: 52, attendance: 65, code: 'CS301' },
      { name: 'Mathematics', grade: 48, attendance: 70, code: 'MA301' },
      { name: 'Physics', grade: 55, attendance: 68, code: 'PH101' },
      { name: 'Communication Skills', grade: 61, attendance: 72, code: 'HS201' },
    ],
    grades: { semesterSummary: [{ semester: 3, average: 78 }, { semester: 4, average: 65 }, { semester: 5, average: 51 }] },
    attendance: { overall: 68, summary: [
      { subject: 'Data Structures', percentage: 65 },
      { subject: 'Mathematics', percentage: 70 },
      { subject: 'Physics', percentage: 68 },
      { subject: 'Communication Skills', percentage: 72 },
    ]},
    careerInsight: 'Focus on strengthening fundamentals. Consider seeking extra help from your SCM.',
  },
  'stu_priya': {
    _id: 'stu_priya',
    name: 'Priya Patel',
    rollNumber: 'EC21012',
    department: 'Electronics & Comm.',
    semester: 5,
    section: 'B',
    cluster: 'top',
    academicHealthScore: 91,
    attendancePercentage: 94,
    moodToday: 5,
    xpPoints: 1850,
    level: 9,
    streakDays: 21,
    badges: [{ name: 'Top Performer', icon: '🏆' }, { name: 'Perfect Week', icon: '⭐' }, { name: 'Helper', icon: '🤝' }],
    clusterHistory: [{ cluster: 'top' }, { cluster: 'top' }],
    reasons: [],
    subjects: [
      { name: 'Circuit Theory', grade: 92, attendance: 96, code: 'EC301' },
      { name: 'Signals & Systems', grade: 89, attendance: 94, code: 'EC302' },
      { name: 'Microprocessors', grade: 91, attendance: 92, code: 'EC303' },
      { name: 'Mathematics', grade: 88, attendance: 95, code: 'MA301' },
    ],
    grades: { semesterSummary: [{ semester: 3, average: 85 }, { semester: 4, average: 88 }, { semester: 5, average: 91 }] },
    attendance: { overall: 94, summary: [
      { subject: 'Circuit Theory', percentage: 96 },
      { subject: 'Signals & Systems', percentage: 94 },
      { subject: 'Microprocessors', percentage: 92 },
      { subject: 'Mathematics', percentage: 95 },
    ]},
    careerInsight: 'You are on an excellent trajectory. Explore research internships this summer.',
  },
  'stu_rohan': {
    _id: 'stu_rohan',
    name: 'Rohan Mehta',
    rollNumber: 'ME21078',
    department: 'Mechanical Engineering',
    semester: 3,
    section: 'A',
    cluster: 'medium',
    academicHealthScore: 70,
    attendancePercentage: 78,
    moodToday: 3,
    xpPoints: 740,
    level: 5,
    streakDays: 7,
    badges: [{ name: 'Consistent', icon: '📅' }],
    clusterHistory: [{ cluster: 'medium' }, { cluster: 'medium' }],
    reasons: ['Moderate attendance - improve to 80%+'],
    subjects: [
      { name: 'Engineering Mechanics', grade: 70, attendance: 78, code: 'ME201' },
      { name: 'Thermodynamics', grade: 68, attendance: 75, code: 'ME202' },
      { name: 'Manufacturing Process', grade: 72, attendance: 80, code: 'ME203' },
      { name: 'Mathematics', grade: 69, attendance: 76, code: 'MA201' },
    ],
    grades: { semesterSummary: [{ semester: 1, average: 70 }, { semester: 2, average: 68 }, { semester: 3, average: 72 }] },
    attendance: { overall: 78, summary: [
      { subject: 'Engineering Mechanics', percentage: 78 },
      { subject: 'Thermodynamics', percentage: 75 },
      { subject: 'Manufacturing Process', percentage: 80 },
      { subject: 'Mathematics', percentage: 76 },
    ]},
    careerInsight: 'Consistent performance. Focus on project work to stand out.',
  },
  'stu_sneha': {
    _id: 'stu_sneha',
    name: 'Sneha Iyer',
    rollNumber: 'CS21056',
    department: 'Computer Science',
    semester: 5,
    section: 'C',
    cluster: 'medium',
    academicHealthScore: 74,
    attendancePercentage: 82,
    moodToday: 4,
    xpPoints: 960,
    level: 6,
    streakDays: 12,
    badges: [{ name: 'Recovery Star', icon: '⬆️' }, { name: 'Helper', icon: '🤝' }],
    clusterHistory: [{ cluster: 'below' }, { cluster: 'medium' }],
    reasons: [],
    subjects: [
      { name: 'Algorithm Design', grade: 74, attendance: 83, code: 'CS401' },
      { name: 'Database Systems', grade: 78, attendance: 82, code: 'CS402' },
      { name: 'Web Technologies', grade: 70, attendance: 80, code: 'CS403' },
      { name: 'Computer Networks', grade: 73, attendance: 84, code: 'CS404' },
    ],
    grades: { semesterSummary: [{ semester: 3, average: 55 }, { semester: 4, average: 63 }, { semester: 5, average: 74 }] },
    attendance: { overall: 82, summary: [
      { subject: 'Algorithm Design', percentage: 83 },
      { subject: 'Database Systems', percentage: 82 },
      { subject: 'Web Technologies', percentage: 80 },
      { subject: 'Computer Networks', percentage: 84 },
    ]},
    careerInsight: 'Great recovery trajectory! You can reach Top cluster this semester.',
  },
  'stu_vikram': {
    _id: 'stu_vikram',
    name: 'Vikram Singh',
    rollNumber: 'IT21089',
    department: 'Information Technology',
    semester: 1,
    section: 'A',
    cluster: null,
    academicHealthScore: null,
    attendancePercentage: null,
    moodToday: 3,
    xpPoints: 50,
    level: 1,
    streakDays: 1,
    badges: [],
    clusterHistory: [],
    reasons: [],
    isNew: true,
    subjects: [],
    grades: { semesterSummary: [] },
    attendance: { overall: 0, summary: [] },
    careerInsight: 'Welcome to EduPulse! Complete your profile to get personalized insights.',
  },
};

// ── School Student ────────────────────────────────
export const DEMO_SCHOOL_STUDENT = {
  'stu_riya': {
    _id: 'stu_riya',
    name: 'Riya Gupta',
    class: 7,
    section: 'B',
    school: "St. Mary's High School",
    rollNo: 'VII-B-14',
    moodToday: 4,
    xpPoints: 480,
    level: 4,
    streakDays: 9,
    badges: [
      { name: 'Science Star', icon: '🔬' },
      { name: 'Quiz Champion', icon: '🏆' },
      { name: 'Helper', icon: '🤝' },
    ],
    subjects: [
      { name: 'Mathematics', mastery: 78, color: '#3b82f6' },
      { name: 'Science', mastery: 92, color: '#10b981' },
      { name: 'English', mastery: 65, color: '#f59e0b' },
      { name: 'Social Studies', mastery: 70, color: '#8b5cf6' },
    ],
  }
};

// ── SCM Data ──────────────────────────────────────
export const DEMO_SCM = {
  name: 'Prof. Ananya Sharma',
  designation: 'Student Counseling Mentor',
  department: 'Computer Science',
  email: 'ananya.sharma@college.edu',
  phone: '+91 98765 43210',
  office: 'Admin Block, Room 204',
  students: ['stu_aarav', 'stu_priya', 'stu_rohan', 'stu_sneha', 'stu_vikram'],
  sessionsThisMonth: 14,
  alertsSent: 8,
};

// Returns an array of all SCM students
export const getSCMStudents = () => {
  return Object.values(DEMO_STUDENTS);
};

// Returns students grouped by cluster
export const getClusteredStudents = () => ({
  top: Object.values(DEMO_STUDENTS).filter(s => s.cluster === 'top'),
  medium: Object.values(DEMO_STUDENTS).filter(s => s.cluster === 'medium'),
  below: Object.values(DEMO_STUDENTS).filter(s => s.cluster === 'below'),
});

// ── Admin Stats ───────────────────────────────────
export const DEMO_ADMIN_STATS = {
  totalStudents: 12450,
  totalParents: 10200,
  totalSCMs: 45,
  totalColleges: 8,
  avgHealthScore: 68,
  activeAlerts: 142,
  platformUsage: 89,
  dropoutRisk: 312,
  clusters: { top: 4150, medium: 5800, below: 2500 },
  attendanceTrend: [92, 88, 85, 91, 89, 93, 90, 87],
  dropoutRiskTrend: [45, 52, 48, 61, 58, 55, 62, 59],
  departments: [
    { name: 'Computer Science', students: 2400, avgHealth: 72, alerts: 38 },
    { name: 'Electronics', students: 1800, avgHealth: 69, alerts: 30 },
    { name: 'Mechanical', students: 2100, avgHealth: 65, alerts: 42 },
    { name: 'Civil', students: 1600, avgHealth: 71, alerts: 25 },
    { name: 'Information Technology', students: 2200, avgHealth: 74, alerts: 28 },
  ],
  careerReadiness: { readyNow: 28, onTrack: 45, needsSupport: 27 },
  nepCompliance: 87,
  sdgContributions: {
    sdg4: { label: 'Quality Education', score: 82 },
    sdg3: { label: 'Good Health & Wellbeing', score: 74 },
    sdg10: { label: 'Reduced Inequalities', score: 67 },
    sdg17: { label: 'Partnerships for Goals', score: 78 },
  },
  monthlyEngagement: [3200, 4100, 3800, 4600, 5100, 4800, 5600, 6200],
};

// ── Parent Data ───────────────────────────────────
export const DEMO_PARENT = {
  name: 'Mr. Ramesh Sharma',
  childId: 'stu_aarav',
  hasUnreadAlert: true,
  alerts: [
    { id: 1, type: 'attendance', message: 'Aarav\'s attendance dropped to 68% — below required 75%', date: '2026-03-10', read: false, severity: 'high' },
    { id: 2, type: 'academics', message: 'Mathematics mid-term result: 48/100 — Needs improvement', date: '2026-03-08', read: false, severity: 'high' },
    { id: 3, type: 'mood', message: 'Aarav reported feeling stressed for 3 consecutive days', date: '2026-03-06', read: true, severity: 'medium' },
  ],
  scm: {
    name: 'Prof. Ananya Sharma',
    email: 'ananya.sharma@college.edu',
    phone: '+91 98765 43210',
    office: 'Admin Block, Room 204',
    availability: 'Mon-Fri, 10 AM – 4 PM',
  },
};

export default {
  DEMO_USERS,
  DEMO_STUDENTS,
  DEMO_SCHOOL_STUDENT,
  DEMO_SCM,
  DEMO_ADMIN_STATS,
  DEMO_PARENT,
};
