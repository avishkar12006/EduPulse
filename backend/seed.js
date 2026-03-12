const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Grade = require('./models/Grade');
const Attendance = require('./models/Attendance');
const Mood = require('./models/Mood');
const Alert = require('./models/Alert');
const Career = require('./models/Career');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Student.deleteMany({}),
    Grade.deleteMany({}), Attendance.deleteMany({}),
    Mood.deleteMany({}), Alert.deleteMany({}), Career.deleteMany({})
  ]);
  console.log('🗑️  Cleared existing data');

  const hashedPass = await bcrypt.hash('demo123', 12);

  // ── SCM USER ──────────────────────────────
  const scmUser = await User.create({
    name: 'Dr. Rajesh Kumar', email: 'scm@demo.com',
    password: hashedPass, role: 'scm', language: 'en', avatar: '👨‍🏫'
  });

  // ── PARENT USERS ──────────────────────────
  const [parentAarav, parentPriya, parentRohan, parentSneha, parentVikram] = await User.insertMany([
    { name: 'Suresh Sharma', email: 'parent.aarav@demo.com', password: hashedPass, role: 'parent', avatar: '👨‍👦' },
    { name: 'Meena Patel', email: 'parent.priya@demo.com', password: hashedPass, role: 'parent', avatar: '👩‍👧' },
    { name: 'Kiran Mehta', email: 'parent.rohan@demo.com', password: hashedPass, role: 'parent', avatar: '👨‍👦' },
    { name: 'Lakshmi Iyer', email: 'parent.sneha@demo.com', password: hashedPass, role: 'parent', avatar: '👩‍👧' },
    { name: 'Harjit Singh', email: 'parent.vikram@demo.com', password: hashedPass, role: 'parent', avatar: '👨‍👦' }
  ]);

  // ── COLLEGE STUDENT USERS ─────────────────
  const [uAarav, uPriya, uRohan, uSneha, uVikram] = await User.insertMany([
    { name: 'Aarav Sharma', email: 'aarav@demo.com', password: hashedPass, role: 'college_student', avatar: '🧑‍💻', language: 'en' },
    { name: 'Priya Patel', email: 'priya@demo.com', password: hashedPass, role: 'college_student', avatar: '👩‍🔬', language: 'en' },
    { name: 'Rohan Mehta', email: 'rohan@demo.com', password: hashedPass, role: 'college_student', avatar: '🧑‍🔧', language: 'en' },
    { name: 'Sneha Iyer', email: 'sneha@demo.com', password: hashedPass, role: 'college_student', avatar: '👩‍💼', language: 'en' },
    { name: 'Vikram Singh', email: 'vikram@demo.com', password: hashedPass, role: 'college_student', avatar: '🧑‍🎓', language: 'en' }
  ]);

  // ── STUDENT PROFILES ──────────────────────
  const [sAarav, sPriya, sRohan, sSneha, sVikram] = await Student.insertMany([
    {
      userId: uAarav._id, name: 'Aarav Sharma', rollNumber: 'CS2023001',
      institution: 'Demo Engineering College', department: 'Computer Science',
      semester: 3, class: 'college', section: 'A', gender: 'male',
      parentId: parentAarav._id, parentEmail: 'parent.aarav@demo.com', scmId: scmUser._id,
      academicHealthScore: 42, cluster: 'below', attendancePercentage: 68,
      streakDays: 2, xpPoints: 85, level: 1, moodToday: 2,
      learningStyle: 'visual',
      clusterHistory: [
        { cluster: 'medium', date: new Date(Date.now() - 90 * 86400000), score: 61 },
        { cluster: 'medium', date: new Date(Date.now() - 60 * 86400000), score: 55 },
        { cluster: 'below', date: new Date(Date.now() - 30 * 86400000), score: 45 },
        { cluster: 'below', date: new Date(), score: 42 }
      ],
      badges: [{ id: 'first_login', name: 'First Step', icon: '🌟', category: 'Platform Engagement', earnedAt: new Date() }]
    },
    {
      userId: uPriya._id, name: 'Priya Patel', rollNumber: 'EC2022042',
      institution: 'Demo Engineering College', department: 'Electronics',
      semester: 4, class: 'college', section: 'B', gender: 'female',
      parentId: parentPriya._id, parentEmail: 'parent.priya@demo.com', scmId: scmUser._id,
      academicHealthScore: 91, cluster: 'top', attendancePercentage: 94,
      streakDays: 28, xpPoints: 1250, level: 5, moodToday: 5,
      learningStyle: 'kinesthetic',
      clusterHistory: [
        { cluster: 'top', date: new Date(Date.now() - 90 * 86400000), score: 85 },
        { cluster: 'top', date: new Date(Date.now() - 60 * 86400000), score: 88 },
        { cluster: 'top', date: new Date(), score: 91 }
      ],
      badges: [
        { id: 'first_login', name: 'First Step', icon: '🌟', category: 'Platform Engagement', earnedAt: new Date() },
        { id: 'top_cluster', name: 'Top Performer', icon: '🏆', category: 'Academic Excellence', earnedAt: new Date() },
        { id: 'streak_7', name: '7-Day Streak', icon: '🔥', category: 'Streak', earnedAt: new Date() },
        { id: 'career_explorer', name: 'Career Explorer', icon: '🎯', category: 'Career Explorer', earnedAt: new Date() },
        { id: 'grade_ace', name: 'Grade Ace', icon: '📚', category: 'Academic Excellence', earnedAt: new Date() }
      ]
    },
    {
      userId: uRohan._id, name: 'Rohan Mehta', rollNumber: 'ME2024018',
      institution: 'Demo Engineering College', department: 'Mechanical',
      semester: 2, class: 'college', section: 'A', gender: 'male',
      parentId: parentRohan._id, parentEmail: 'parent.rohan@demo.com', scmId: scmUser._id,
      academicHealthScore: 65, cluster: 'medium', attendancePercentage: 78,
      streakDays: 8, xpPoints: 320, level: 2, moodToday: 3,
      learningStyle: 'auditory',
      clusterHistory: [
        { cluster: 'medium', date: new Date(Date.now() - 60 * 86400000), score: 62 },
        { cluster: 'medium', date: new Date(), score: 65 }
      ],
      badges: [
        { id: 'first_login', name: 'First Step', icon: '🌟', category: 'Platform Engagement', earnedAt: new Date() }
      ]
    },
    {
      userId: uSneha._id, name: 'Sneha Iyer', rollNumber: 'IT2023067',
      institution: 'Demo Engineering College', department: 'Information Technology',
      semester: 3, class: 'college', section: 'C', gender: 'female',
      parentId: parentSneha._id, parentEmail: 'parent.sneha@demo.com', scmId: scmUser._id,
      academicHealthScore: 72, cluster: 'medium', attendancePercentage: 82,
      streakDays: 14, xpPoints: 580, level: 3, moodToday: 4,
      learningStyle: 'visual',
      clusterHistory: [
        { cluster: 'below', date: new Date(Date.now() - 90 * 86400000), score: 38 },
        { cluster: 'below', date: new Date(Date.now() - 60 * 86400000), score: 45 },
        { cluster: 'medium', date: new Date(Date.now() - 30 * 86400000), score: 60 },
        { cluster: 'medium', date: new Date(), score: 72 }
      ],
      badges: [
        { id: 'first_login', name: 'First Step', icon: '🌟', category: 'Platform Engagement', earnedAt: new Date() },
        { id: 'comeback_kid', name: 'Comeback Kid', icon: '💪', category: 'Comeback Kid', earnedAt: new Date() },
        { id: 'streak_7', name: '7-Day Streak', icon: '🔥', category: 'Streak', earnedAt: new Date() }
      ]
    },
    {
      userId: uVikram._id, name: 'Vikram Singh', rollNumber: 'CS2026001',
      institution: 'Demo Engineering College', department: 'Computer Science',
      semester: 1, class: 'college', section: 'A', gender: 'male',
      parentId: parentVikram._id, parentEmail: 'parent.vikram@demo.com', scmId: scmUser._id,
      academicHealthScore: 55, cluster: 'medium', attendancePercentage: 88,
      streakDays: 1, xpPoints: 35, level: 1, moodToday: 3,
      learningStyle: 'flexible',
      clusterHistory: [{ cluster: 'medium', date: new Date(), score: 55 }],
      badges: []
    }
  ]);

  // Link student IDs to user accounts
  await User.findByIdAndUpdate(uAarav._id, { studentId: sAarav._id });
  await User.findByIdAndUpdate(uPriya._id, { studentId: sPriya._id });
  await User.findByIdAndUpdate(uRohan._id, { studentId: sRohan._id });
  await User.findByIdAndUpdate(uSneha._id, { studentId: sSneha._id });
  await User.findByIdAndUpdate(uVikram._id, { studentId: sVikram._id });
  await User.findByIdAndUpdate(parentAarav._id, { parentOf: [sAarav._id] });
  await User.findByIdAndUpdate(parentPriya._id, { parentOf: [sPriya._id] });
  await User.findByIdAndUpdate(parentRohan._id, { parentOf: [sRohan._id] });
  await User.findByIdAndUpdate(parentSneha._id, { parentOf: [sSneha._id] });
  await User.findByIdAndUpdate(parentVikram._id, { parentOf: [sVikram._id] });
  console.log('👤 Users and Students created');

  // ── GRADES ────────────────────────────────
  const gradeData = [
    // Aarav - declining
    { studentId: sAarav._id, semester: 1, subject: 'Engineering Mathematics', subjectCode: 'MA101', internalMarks: 35, externalMarks: 43, maxMarks: 100 },
    { studentId: sAarav._id, semester: 1, subject: 'Physics', subjectCode: 'PH101', internalMarks: 28, externalMarks: 50, maxMarks: 100 },
    { studentId: sAarav._id, semester: 2, subject: 'Data Structures', subjectCode: 'CS201', internalMarks: 30, externalMarks: 35, maxMarks: 100 },
    { studentId: sAarav._id, semester: 2, subject: 'Digital Electronics', subjectCode: 'CS202', internalMarks: 25, externalMarks: 26, maxMarks: 100 },
    { studentId: sAarav._id, semester: 3, subject: 'Database Systems', subjectCode: 'CS301', internalMarks: 18, externalMarks: 28, maxMarks: 100 },
    { studentId: sAarav._id, semester: 3, subject: 'Operating Systems', subjectCode: 'CS302', internalMarks: 14, externalMarks: 25, maxMarks: 100 },
    // Priya - improving
    { studentId: sPriya._id, semester: 1, subject: 'Circuit Theory', subjectCode: 'EC101', internalMarks: 40, externalMarks: 45, maxMarks: 100 },
    { studentId: sPriya._id, semester: 1, subject: 'Engineering Mathematics', subjectCode: 'MA101', internalMarks: 42, externalMarks: 43, maxMarks: 100 },
    { studentId: sPriya._id, semester: 2, subject: 'Analog Electronics', subjectCode: 'EC201', internalMarks: 43, externalMarks: 45, maxMarks: 100 },
    { studentId: sPriya._id, semester: 2, subject: 'Signals & Systems', subjectCode: 'EC202', internalMarks: 44, externalMarks: 44, maxMarks: 100 },
    { studentId: sPriya._id, semester: 3, subject: 'VLSI Design', subjectCode: 'EC301', internalMarks: 46, externalMarks: 44, maxMarks: 100 },
    { studentId: sPriya._id, semester: 3, subject: 'Communication Systems', subjectCode: 'EC302', internalMarks: 45, externalMarks: 46, maxMarks: 100 },
    { studentId: sPriya._id, semester: 4, subject: 'Microprocessors', subjectCode: 'EC401', internalMarks: 47, externalMarks: 47, maxMarks: 100 },
    { studentId: sPriya._id, semester: 4, subject: 'Embedded Systems', subjectCode: 'EC402', internalMarks: 48, externalMarks: 45, maxMarks: 100 },
    // Rohan - stable
    { studentId: sRohan._id, semester: 1, subject: 'Engineering Mechanics', subjectCode: 'ME101', internalMarks: 33, externalMarks: 37, maxMarks: 100 },
    { studentId: sRohan._id, semester: 1, subject: 'Thermodynamics', subjectCode: 'ME102', internalMarks: 30, externalMarks: 40, maxMarks: 100 },
    { studentId: sRohan._id, semester: 2, subject: 'Fluid Mechanics', subjectCode: 'ME201', internalMarks: 34, externalMarks: 36, maxMarks: 100 },
    { studentId: sRohan._id, semester: 2, subject: 'Manufacturing Processes', subjectCode: 'ME202', internalMarks: 35, externalMarks: 35, maxMarks: 100 },
    // Sneha - recovering  
    { studentId: sSneha._id, semester: 1, subject: 'Programming Fundamentals', subjectCode: 'IT101', internalMarks: 18, externalMarks: 22, maxMarks: 100 },
    { studentId: sSneha._id, semester: 2, subject: 'Web Technologies', subjectCode: 'IT201', internalMarks: 28, externalMarks: 32, maxMarks: 100 },
    { studentId: sSneha._id, semester: 3, subject: 'Software Engineering', subjectCode: 'IT301', internalMarks: 36, externalMarks: 39, maxMarks: 100 },
    { studentId: sSneha._id, semester: 3, subject: 'Computer Networks', subjectCode: 'IT302', internalMarks: 35, externalMarks: 37, maxMarks: 100 }
  ];

  for (const g of gradeData) {
    const grade = new Grade({ ...g, totalMarks: g.internalMarks + g.externalMarks });
    await grade.save(); // Uses pre-save hook for auto grade/competency
  }
  console.log('📊 Grades created');

  // ── ATTENDANCE ────────────────────────────
  const addAttendance = async (studentId, subject, subjectCode, total, presentCount) => {
    const records = [];
    const now = new Date();
    for (let i = 0; i < total; i++) {
      const date = new Date(now.getTime() - (total - i) * 2 * 86400000);
      const status = i < presentCount ? 'present' : (Math.random() > 0.5 ? 'absent' : 'absent');
      records.push({ studentId, subject, subjectCode, date, status, recordedBy: scmUser._id });
    }
    await Attendance.insertMany(records, { ordered: false }).catch(() => {});
  };

  // Aarav - 68% attendance (critical)
  await addAttendance(sAarav._id, 'Database Systems', 'CS301', 50, 34);
  await addAttendance(sAarav._id, 'Operating Systems', 'CS302', 48, 33);
  // Priya - 94% attendance (excellent)
  await addAttendance(sPriya._id, 'Microprocessors', 'EC401', 50, 47);
  await addAttendance(sPriya._id, 'Embedded Systems', 'EC402', 50, 47);
  // Rohan - 78% attendance
  await addAttendance(sRohan._id, 'Fluid Mechanics', 'ME201', 50, 39);
  await addAttendance(sRohan._id, 'Manufacturing Processes', 'ME202', 50, 39);
  // Sneha - 82% attendance
  await addAttendance(sSneha._id, 'Software Engineering', 'IT301', 50, 41);
  await addAttendance(sSneha._id, 'Computer Networks', 'IT302', 50, 41);
  // Vikram - 88% (new student)
  await addAttendance(sVikram._id, 'Engineering Mathematics', 'MA101', 25, 22);
  console.log('📅 Attendance created');

  // ── MOODS ─────────────────────────────────
  // Aarav - stressed for 8 days
  for (let i = 8; i >= 0; i--) {
    await Mood.create({
      studentId: sAarav._id, mood: 2, label: 'stressed',
      note: i === 0 ? 'Exams are coming and I feel unprepared' : '',
      recordedAt: new Date(Date.now() - i * 86400000)
    });
  }
  // Priya - excellent mood
  for (let i = 7; i >= 0; i--) {
    await Mood.create({
      studentId: sPriya._id, mood: 5, label: 'excellent',
      recordedAt: new Date(Date.now() - i * 86400000)
    });
  }
  // Sneha - improving mood
  for (let i = 7; i >= 0; i--) {
    await Mood.create({
      studentId: sSneha._id, mood: Math.min(5, 2 + Math.floor((7 - i) / 2)), label: 'okay',
      recordedAt: new Date(Date.now() - i * 86400000)
    });
  }
  console.log('😊 Moods created');

  // ── ALERTS ────────────────────────────────
  await Alert.insertMany([
    {
      studentId: sAarav._id, parentId: parentAarav._id, scmId: scmUser._id,
      alertType: 'attendance', severity: 'critical',
      triggerReason: `Aarav's attendance has dropped to 68% — below the critical 75% threshold.`,
      emailSubject: 'EduPulse Alert: Aarav Sharma — Critical Attendance',
      emailContent: `Dear Suresh Sharma,\n\nWHAT IS HAPPENING:\nYour son Aarav's attendance has dropped to 68% this semester, below the required 75% minimum. He has missed 16 out of 50 classes.\n\nWHAT YOU CAN DO:\n1. Check in with Aarav about any challenges he's facing at college.\n2. Set up a daily check-in routine to ensure he leaves for college.\n3. Book a meeting with Dr. Rajesh Kumar (SCM) to discuss a support plan.\n\nWHAT TO AVOID:\n1. Avoid confrontational conversations that may increase his stress.\n2. Don't ignore this alert — attendance below 75% can prevent him from appearing in exams.\n\nContact SCM: Dr. Rajesh Kumar | scm@demo.com\n\nWarm regards,\nEduPulse Team`,
      sentAt: new Date(Date.now() - 2 * 86400000), deliveredAt: new Date(Date.now() - 2 * 86400000), isRead: false
    },
    {
      studentId: sAarav._id, parentId: parentAarav._id, scmId: scmUser._id,
      alertType: 'performance', severity: 'high',
      triggerReason: 'Grade average dropped from 65% to 51% this semester',
      emailSubject: 'EduPulse Alert: Aarav Sharma — Grade Decline',
      emailContent: 'Grade decline alert content for Aarav...',
      sentAt: new Date(Date.now() - 7 * 86400000), deliveredAt: new Date(Date.now() - 7 * 86400000), isRead: true
    }
  ]);
  console.log('🚨 Alerts created');

  // ── CAREER PATHS (for Priya) ──────────────
  await Career.create({
    studentId: sPriya._id, generatedAt: new Date(),
    selectedPathIndex: 0,
    paths: [
      {
        title: 'VLSI Design Engineer', industry: 'Semiconductor', icon: '🔬',
        whyThisStudent: 'Priya\'s 94% attendance and 91% academic health score demonstrate exceptional dedication. Her top performance in VLSI Design (93%) and Embedded Systems (93%) makes her a natural fit for semiconductor careers.',
        successProbability: 88,
        strongAreas: ['VLSI Design', 'Embedded Systems', 'Circuit Theory'],
        gapAreas: ['Hardware Description Languages (VHDL/Verilog)', 'FPGA Programming', 'Industry EDA Tools'],
        milestones: [
          { month: 1, action: 'Master Verilog HDL', skill: 'Hardware Description', difficulty: 'Medium', resource: 'NPTEL VLSI Course', completed: true, completedAt: new Date() },
          { month: 3, action: 'Complete FPGA project', skill: 'FPGA Design', difficulty: 'Hard', resource: 'Intel FPGA Academy', completed: true, completedAt: new Date() },
          { month: 6, action: 'Internship at semiconductor company', skill: 'Industry Experience', difficulty: 'Hard', resource: 'LinkedIn, Internshala', completed: false },
          { month: 9, action: 'Get Cadence certification', skill: 'EDA Tools', difficulty: 'Medium', resource: 'Cadence Academic Network', completed: false },
          { month: 12, action: 'Apply to VLSI companies', skill: 'Job Search', difficulty: 'Medium', resource: 'LinkedIn, Naukri', completed: false },
          { month: 18, action: 'Specialize in ASIC design', skill: 'Advanced VLSI', difficulty: 'Hard', resource: 'Synopsys Learning Portal', completed: false }
        ],
        certifications: [
          { name: 'Cadence Functional Verification', link: 'https://www.cadence.com', cost: '₹25,000' },
          { name: 'Xilinx FPGA Developer', link: 'https://www.xilinx.com/training', cost: 'Free' },
          { name: 'NPTEL VLSI Technology', link: 'https://nptel.ac.in', cost: 'Free (₹1000 cert fee)' }
        ],
        salaryRange: '₹8 LPA - ₹35 LPA', growthProjection: 'India\'s semiconductor mission targets $300B sector by 2047, with VLSI engineers in extreme demand.'
      }
    ]
  });
  console.log('🎯 Career paths created');

  // ── ADMIN USER ────────────────────────────
  await User.create({
    name: 'Admin User', email: 'admin@demo.com',
    password: hashedPass, role: 'admin', avatar: '👨‍💼'
  });

  // ── SCHOOL STUDENT USERS ──────────────────
  const schoolUsers = await User.insertMany([
    { name: 'Aryan Gupta', email: 'aryan@demo.com', pin: '2468', password: hashedPass, role: 'school_student', avatar: '🧒' },
    { name: 'Riya Sharma', email: 'riya@demo.com', pin: '1357', password: hashedPass, role: 'school_student', avatar: '👧' },
    { name: 'Dev Patel', email: 'dev@demo.com', password: hashedPass, role: 'school_student', avatar: '🧑‍🎓' }
  ]);
  const [aryan, riya, dev] = schoolUsers;

  await Student.insertMany([
    { userId: aryan._id, name: 'Aryan Gupta', rollNumber: 'SCH2026001', class: '5', section: 'A', scmId: scmUser._id, academicHealthScore: 72, attendancePercentage: 90, streakDays: 3, xpPoints: 150, level: 2 },
    { userId: riya._id, name: 'Riya Sharma', rollNumber: 'SCH2026002', class: '7', section: 'B', scmId: scmUser._id, academicHealthScore: 68, attendancePercentage: 85, streakDays: 5, xpPoints: 280, level: 2 },
    { userId: dev._id, name: 'Dev Patel', rollNumber: 'SCH2026003', class: '10', section: 'A', scmId: scmUser._id, academicHealthScore: 78, attendancePercentage: 88, streakDays: 12, xpPoints: 450, level: 3 }
  ]);
  
  console.log('🏫 School students created');
  console.log('\n✅ SEED COMPLETE!\n');
  console.log('═══════════════════════════════════════');
  console.log('DEMO CREDENTIALS:');
  console.log('─────────────────────────────────────');
  console.log('College Students:');
  console.log('  aarav@demo.com      / demo123  (Below Average — at risk)');
  console.log('  priya@demo.com      / demo123  (Top Performer)');
  console.log('  rohan@demo.com      / demo123  (Medium Cluster)');
  console.log('  sneha@demo.com      / demo123  (Recovering — Medium)');
  console.log('  vikram@demo.com     / demo123  (New Student)');
  console.log('SCM:');
  console.log('  scm@demo.com        / demo123');
  console.log('Parents:');
  console.log('  parent.aarav@demo.com / demo123 (has unread alert)');
  console.log('  parent.priya@demo.com / demo123 (positive updates)');
  console.log('Admin:');
  console.log('  admin@demo.com      / demo123');
  console.log('School Students:');
  console.log('  aryan@demo.com (PIN: 2468) — Class 5');
  console.log('  riya@demo.com  (PIN: 1357) — Class 7');
  console.log('  dev@demo.com   / demo123   — Class 10');
  console.log('═══════════════════════════════════════\n');
  
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
