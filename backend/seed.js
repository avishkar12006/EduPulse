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

  // Clear all existing data
  await Promise.all([
    User.deleteMany({}), Student.deleteMany({}),
    Grade.deleteMany({}), Attendance.deleteMany({}),
    Mood.deleteMany({}), Alert.deleteMany({}), Career.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  const PLAIN_PASS = 'demo123'; // User model pre-save hook handles hashing — do NOT pre-hash here


  // ── SCM ────────────────────────────────────────────
  const scmUser = await User.create({
    name: 'Dr. Rajesh Kumar', email: 'scm@demo.com',
    password: PLAIN_PASS, role: 'scm', language: 'en', avatar: '👨‍🏫',
  });

  // ── ADMIN ──────────────────────────────────────────
  await User.create({
    name: 'Principal Dr. Mehta', email: 'admin@demo.com',
    password: PLAIN_PASS, role: 'admin', avatar: '👨‍💼',
  });

  // ── PARENT USERS ───────────────────────────────────
  const [parentAarav, parentPriya, parentRohan, parentSneha, parentVikram] = await Promise.all([
    User.create({ name: 'Suresh Sharma',  email: 'parent.aarav@demo.com',  password: PLAIN_PASS, role: 'parent', avatar: '👨‍👦' }),
    User.create({ name: 'Meena Patel',   email: 'parent.priya@demo.com',  password: PLAIN_PASS, role: 'parent', avatar: '👩‍👧' }),
    User.create({ name: 'Kiran Mehta',   email: 'parent.rohan@demo.com',  password: PLAIN_PASS, role: 'parent', avatar: '👨‍👦' }),
    User.create({ name: 'Lakshmi Iyer', email: 'parent.sneha@demo.com',  password: PLAIN_PASS, role: 'parent', avatar: '👩‍👧' }),
    User.create({ name: 'Harjit Singh',  email: 'parent.vikram@demo.com', password: PLAIN_PASS, role: 'parent', avatar: '👨‍👦' }),
  ]);


  // ── COLLEGE STUDENT USERS ──────────────────────────
  const [uAarav, uPriya, uRohan, uSneha, uVikram] = await Promise.all([
    User.create({ name: 'Aarav Sharma', email: 'aarav@demo.com',  password: PLAIN_PASS, role: 'college_student', avatar: '🧑‍💻', language: 'en' }),
    User.create({ name: 'Priya Patel',  email: 'priya@demo.com',  password: PLAIN_PASS, role: 'college_student', avatar: '👩‍🔬', language: 'en' }),
    User.create({ name: 'Rohan Mehta', email: 'rohan@demo.com',  password: PLAIN_PASS, role: 'college_student', avatar: '🧑‍🔧', language: 'en' }),
    User.create({ name: 'Sneha Iyer',  email: 'sneha@demo.com',  password: PLAIN_PASS, role: 'college_student', avatar: '👩‍💼', language: 'en' }),
    User.create({ name: 'Vikram Singh',email: 'vikram@demo.com', password: PLAIN_PASS, role: 'college_student', avatar: '🧑‍🎓', language: 'en' }),
  ]);


  // ── STUDENT PROFILES ──────────────────────────────
  const [sAarav, sPriya, sRohan, sSneha, sVikram] = await Student.insertMany([
    {
      userId: uAarav._id, name: 'Aarav Sharma', rollNumber: 'CS2023001',
      institution: 'Demo Engineering College', department: 'Computer Science',
      semester: 3, class: 'college', section: 'A', gender: 'male',
      parentId: parentAarav._id, parentEmail: 'parent.aarav@demo.com', scmId: scmUser._id,
      academicHealthScore: 42, cluster: 'below', attendancePercentage: 68,
      streakDays: 2, xpPoints: 85, level: 1, moodToday: 2, learningStyle: 'visual',
      clusterHistory: [
        { cluster: 'medium', date: new Date(Date.now() - 90 * 86400000), score: 61 },
        { cluster: 'medium', date: new Date(Date.now() - 60 * 86400000), score: 55 },
        { cluster: 'below', date: new Date(Date.now() - 30 * 86400000), score: 45 },
        { cluster: 'below', date: new Date(), score: 42 },
      ],
      badges: [{ id: 'first_login', name: 'First Step', icon: '🌟', category: 'Platform Engagement', earnedAt: new Date() }],
    },
    {
      userId: uPriya._id, name: 'Priya Patel', rollNumber: 'EC2022042',
      institution: 'Demo Engineering College', department: 'Electronics',
      semester: 4, class: 'college', section: 'B', gender: 'female',
      parentId: parentPriya._id, parentEmail: 'parent.priya@demo.com', scmId: scmUser._id,
      academicHealthScore: 91, cluster: 'top', attendancePercentage: 94,
      streakDays: 28, xpPoints: 1250, level: 5, moodToday: 5, learningStyle: 'kinesthetic',
      clusterHistory: [
        { cluster: 'top', date: new Date(Date.now() - 90 * 86400000), score: 85 },
        { cluster: 'top', date: new Date(Date.now() - 60 * 86400000), score: 88 },
        { cluster: 'top', date: new Date(), score: 91 },
      ],
      badges: [
        { id: 'first_login', name: 'First Step', icon: '🌟', category: 'Platform Engagement', earnedAt: new Date() },
        { id: 'top_cluster', name: 'Top Performer', icon: '🏆', category: 'Academic Excellence', earnedAt: new Date() },
        { id: 'streak_7', name: '7-Day Streak', icon: '🔥', category: 'Streak', earnedAt: new Date() },
        { id: 'career_explorer', name: 'Career Explorer', icon: '🎯', category: 'Career Explorer', earnedAt: new Date() },
      ],
    },
    {
      userId: uRohan._id, name: 'Rohan Mehta', rollNumber: 'ME2024018',
      institution: 'Demo Engineering College', department: 'Mechanical',
      semester: 2, class: 'college', section: 'A', gender: 'male',
      parentId: parentRohan._id, parentEmail: 'parent.rohan@demo.com', scmId: scmUser._id,
      academicHealthScore: 65, cluster: 'medium', attendancePercentage: 78,
      streakDays: 8, xpPoints: 320, level: 2, moodToday: 3, learningStyle: 'auditory',
      clusterHistory: [
        { cluster: 'medium', date: new Date(Date.now() - 60 * 86400000), score: 62 },
        { cluster: 'medium', date: new Date(), score: 65 },
      ],
      badges: [{ id: 'first_login', name: 'First Step', icon: '🌟', category: 'Platform Engagement', earnedAt: new Date() }],
    },
    {
      userId: uSneha._id, name: 'Sneha Iyer', rollNumber: 'IT2023067',
      institution: 'Demo Engineering College', department: 'Information Technology',
      semester: 3, class: 'college', section: 'C', gender: 'female',
      parentId: parentSneha._id, parentEmail: 'parent.sneha@demo.com', scmId: scmUser._id,
      academicHealthScore: 72, cluster: 'medium', attendancePercentage: 82,
      streakDays: 14, xpPoints: 580, level: 3, moodToday: 4, learningStyle: 'visual',
      clusterHistory: [
        { cluster: 'below', date: new Date(Date.now() - 90 * 86400000), score: 38 },
        { cluster: 'below', date: new Date(Date.now() - 60 * 86400000), score: 45 },
        { cluster: 'medium', date: new Date(Date.now() - 30 * 86400000), score: 60 },
        { cluster: 'medium', date: new Date(), score: 72 },
      ],
      badges: [
        { id: 'first_login', name: 'First Step', icon: '🌟', category: 'Platform Engagement', earnedAt: new Date() },
        { id: 'comeback_kid', name: 'Comeback Kid', icon: '💪', category: 'Comeback Kid', earnedAt: new Date() },
        { id: 'streak_7', name: '7-Day Streak', icon: '🔥', category: 'Streak', earnedAt: new Date() },
      ],
    },
    {
      userId: uVikram._id, name: 'Vikram Singh', rollNumber: 'CS2026001',
      institution: 'Demo Engineering College', department: 'Computer Science',
      semester: 1, class: 'college', section: 'A', gender: 'male',
      parentId: parentVikram._id, parentEmail: 'parent.vikram@demo.com', scmId: scmUser._id,
      academicHealthScore: 55, cluster: 'medium', attendancePercentage: 88,
      streakDays: 1, xpPoints: 35, level: 1, moodToday: 3, learningStyle: 'flexible',
      clusterHistory: [{ cluster: 'medium', date: new Date(), score: 55 }],
      badges: [],
    },
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

  // ── GRADES ────────────────────────────────────────
  const gradeData = [
    // Aarav — declining
    { studentId: sAarav._id, semester: 1, subject: 'Engg Mathematics', subjectCode: 'MA101', internalMarks: 35, externalMarks: 43, maxMarks: 100 },
    { studentId: sAarav._id, semester: 1, subject: 'Physics', subjectCode: 'PH101', internalMarks: 28, externalMarks: 50, maxMarks: 100 },
    { studentId: sAarav._id, semester: 2, subject: 'Data Structures', subjectCode: 'CS201', internalMarks: 30, externalMarks: 35, maxMarks: 100 },
    { studentId: sAarav._id, semester: 2, subject: 'Digital Electronics', subjectCode: 'CS202', internalMarks: 25, externalMarks: 26, maxMarks: 100 },
    { studentId: sAarav._id, semester: 3, subject: 'Database Systems', subjectCode: 'CS301', internalMarks: 18, externalMarks: 28, maxMarks: 100 },
    { studentId: sAarav._id, semester: 3, subject: 'Operating Systems', subjectCode: 'CS302', internalMarks: 14, externalMarks: 25, maxMarks: 100 },
    // Priya — top performer
    { studentId: sPriya._id, semester: 1, subject: 'Circuit Theory', subjectCode: 'EC101', internalMarks: 40, externalMarks: 45, maxMarks: 100 },
    { studentId: sPriya._id, semester: 2, subject: 'Analog Electronics', subjectCode: 'EC201', internalMarks: 43, externalMarks: 45, maxMarks: 100 },
    { studentId: sPriya._id, semester: 3, subject: 'VLSI Design', subjectCode: 'EC301', internalMarks: 46, externalMarks: 44, maxMarks: 100 },
    { studentId: sPriya._id, semester: 3, subject: 'Communication Systems', subjectCode: 'EC302', internalMarks: 45, externalMarks: 46, maxMarks: 100 },
    { studentId: sPriya._id, semester: 4, subject: 'Microprocessors', subjectCode: 'EC401', internalMarks: 47, externalMarks: 47, maxMarks: 100 },
    { studentId: sPriya._id, semester: 4, subject: 'Embedded Systems', subjectCode: 'EC402', internalMarks: 48, externalMarks: 45, maxMarks: 100 },
    // Rohan — stable medium
    { studentId: sRohan._id, semester: 1, subject: 'Engg Mechanics', subjectCode: 'ME101', internalMarks: 33, externalMarks: 37, maxMarks: 100 },
    { studentId: sRohan._id, semester: 2, subject: 'Fluid Mechanics', subjectCode: 'ME201', internalMarks: 34, externalMarks: 36, maxMarks: 100 },
    // Sneha — recovering
    { studentId: sSneha._id, semester: 1, subject: 'Programming Fundamentals', subjectCode: 'IT101', internalMarks: 18, externalMarks: 22, maxMarks: 100 },
    { studentId: sSneha._id, semester: 2, subject: 'Web Technologies', subjectCode: 'IT201', internalMarks: 28, externalMarks: 32, maxMarks: 100 },
    { studentId: sSneha._id, semester: 3, subject: 'Software Engineering', subjectCode: 'IT301', internalMarks: 36, externalMarks: 39, maxMarks: 100 },
    { studentId: sSneha._id, semester: 3, subject: 'Computer Networks', subjectCode: 'IT302', internalMarks: 35, externalMarks: 37, maxMarks: 100 },
  ];

  for (const g of gradeData) {
    const grade = new Grade({ ...g, totalMarks: g.internalMarks + g.externalMarks });
    await grade.save();
  }
  console.log('📊 Grades created');

  // ── ATTENDANCE ────────────────────────────────────
  const addAttendance = async (studentId, subject, subjectCode, total, presentCount) => {
    const records = [];
    const now = new Date();
    for (let i = 0; i < total; i++) {
      const date = new Date(now.getTime() - (total - i) * 2 * 86400000);
      const status = i < presentCount ? 'present' : 'absent';
      records.push({ studentId, subject, subjectCode, date, status, recordedBy: scmUser._id });
    }
    await Attendance.insertMany(records, { ordered: false }).catch(() => {});
  };

  await addAttendance(sAarav._id, 'Database Systems', 'CS301', 50, 34);
  await addAttendance(sAarav._id, 'Operating Systems', 'CS302', 48, 33);
  await addAttendance(sPriya._id, 'Microprocessors', 'EC401', 50, 47);
  await addAttendance(sPriya._id, 'Embedded Systems', 'EC402', 50, 47);
  await addAttendance(sRohan._id, 'Fluid Mechanics', 'ME201', 50, 39);
  await addAttendance(sSneha._id, 'Software Engineering', 'IT301', 50, 41);
  await addAttendance(sSneha._id, 'Computer Networks', 'IT302', 50, 41);
  await addAttendance(sVikram._id, 'Engg Mathematics', 'MA101', 25, 22);
  console.log('📅 Attendance created');

  // ── MOODS ─────────────────────────────────────────
  for (let i = 8; i >= 0; i--) {
    await Mood.create({ studentId: sAarav._id, mood: 2, label: 'stressed', note: i === 0 ? 'Exams coming and I feel unprepared' : '', recordedAt: new Date(Date.now() - i * 86400000) });
  }
  for (let i = 7; i >= 0; i--) {
    await Mood.create({ studentId: sPriya._id, mood: 5, label: 'excellent', recordedAt: new Date(Date.now() - i * 86400000) });
  }
  for (let i = 7; i >= 0; i--) {
    await Mood.create({ studentId: sSneha._id, mood: Math.min(5, 2 + Math.floor((7 - i) / 2)), label: 'okay', recordedAt: new Date(Date.now() - i * 86400000) });
  }
  console.log('😊 Moods created');

  // ── ALERTS ────────────────────────────────────────
  await Alert.insertMany([
    {
      studentId: sAarav._id, parentId: parentAarav._id, scmId: scmUser._id,
      alertType: 'attendance', severity: 'critical',
      triggerReason: "Aarav's attendance has dropped to 68% — below the 75% threshold.",
      emailSubject: 'EduPulse Alert: Aarav Sharma — Critical Attendance',
      emailContent: 'Dear Suresh Sharma,\n\nAarav\'s attendance is 68%, below the required 75%. He has missed 16 of 50 classes.\n\nPlease speak with Aarav and schedule a meeting with Dr. Rajesh Kumar.\n\nEduPulse Team',
      sentAt: new Date(Date.now() - 2 * 86400000), deliveredAt: new Date(Date.now() - 2 * 86400000), isRead: false,
    },
    {
      studentId: sAarav._id, parentId: parentAarav._id, scmId: scmUser._id,
      alertType: 'performance', severity: 'high',
      triggerReason: 'Grade average dropped from 65% to 51% this semester.',
      emailSubject: 'EduPulse Alert: Aarav Sharma — Grade Decline',
      emailContent: 'Grade decline alert for Aarav Sharma.',
      sentAt: new Date(Date.now() - 7 * 86400000), deliveredAt: new Date(Date.now() - 7 * 86400000), isRead: true,
    },
  ]);
  console.log('🚨 Alerts created');

  // ── SCHOOL STUDENTS ────────────────────────────────────────────────────
  // Require the new SchoolStudent model
  const SchoolStudent = require('./models/SchoolStudent');
  await SchoolStudent.deleteMany({});

  const schoolUsers = await User.insertMany([
    { name: 'Aryan Gupta',  email: 'aryan@demo.com', password: PLAIN_PASS, role: 'school_student', avatar: '🧒', studentClass: '5' },
    { name: 'Riya Sharma',  email: 'riya@demo.com',  password: PLAIN_PASS, role: 'school_student', avatar: '👧', studentClass: '7' },
    { name: 'Dev Patel',    email: 'dev@demo.com',   password: PLAIN_PASS, role: 'school_student', avatar: '🧑‍🎓', studentClass: '10' },
    { name: 'Anika Singh',  email: 'anika@demo.com', password: PLAIN_PASS, role: 'school_student', avatar: '👩', studentClass: '4' },
    { name: 'Kabir Mehta',  email: 'kabir@demo.com', password: PLAIN_PASS, role: 'school_student', avatar: '🧑', studentClass: '11' },
  ]);
  const [aryan, riya, dev, anika, kabir] = schoolUsers;

  await SchoolStudent.insertMany([
    // ── ARYAN — Class 5, Sparky World ──────────────────────────────────────
    {
      userId: aryan._id, name: 'Aryan Gupta', rollNumber: 'SSCH2026001',
      class: '5', section: 'A', school: 'EduPulse Model School', scmId: scmUser._id,
      parentEmail: 'parent.aarav@demo.com',
      subjects: [
        { name: 'English',  code: 'ENG', score: 74, trend: 'up',   attendance: 90, nepLevel: 'Achieving'  },
        { name: 'Math',     code: 'MTH', score: 68, trend: 'up',   attendance: 88, nepLevel: 'Developing' },
        { name: 'EVS',      code: 'EVS', score: 80, trend: 'stable',attendance: 92, nepLevel: 'Achieving' },
      ],
      gradeAverage: 74, gradeTrend: 4, academicHealthScore: 72, attendancePercentage: 90,
      cluster: 'medium', xpPoints: 150, level: 2, streakDays: 3,
      nipunLevels: { reading: 3, numberSense: 2, oralComm: 4 },
      moodToday: 4, averageMoodScore: 4,
      academicDNA: { focusPower:60, pressurePerformer:48, teamPlayer:72, selfNavigator:50, comebackKid:65, subjectExplorer:78, quickResponder:55, growthSeeker:60 },
      badges: [
        { id: 'first_login',  name: 'First Step ⭐', icon: '⭐', earnedAt: new Date() },
        { id: 'reading_star', name: 'Reading Star',  icon: '📖', earnedAt: new Date() },
      ],
      clusterHistory: [{ cluster: 'medium', score: 72, date: new Date() }],
    },
    // ── ANIKA — Class 4, Sparky World ──────────────────────────────────────
    {
      userId: anika._id, name: 'Anika Singh', rollNumber: 'SSCH2026004',
      class: '4', section: 'B', school: 'EduPulse Model School', scmId: scmUser._id,
      parentEmail: 'parent.priya@demo.com',
      subjects: [
        { name: 'English', code: 'ENG', score: 88, trend: 'up',   attendance: 95, nepLevel: 'Mastering'  },
        { name: 'Math',    code: 'MTH', score: 85, trend: 'up',   attendance: 93, nepLevel: 'Achieving'  },
        { name: 'EVS',     code: 'EVS', score: 91, trend: 'stable',attendance: 96, nepLevel: 'Mastering' },
      ],
      gradeAverage: 88, gradeTrend: 5, academicHealthScore: 90, attendancePercentage: 95,
      cluster: 'top', xpPoints: 320, level: 3, streakDays: 14,
      nipunLevels: { reading: 5, numberSense: 5, oralComm: 4 },
      moodToday: 5, averageMoodScore: 4.5,
      academicDNA: { focusPower:88, pressurePerformer:75, teamPlayer:82, selfNavigator:78, comebackKid:70, subjectExplorer:90, quickResponder:85, growthSeeker:92 },
      badges: [
        { id: 'first_login',   name: 'First Step',       icon: '⭐', earnedAt: new Date() },
        { id: 'nipun_reading', name: 'NIPUN Reading Star',icon: '📚', earnedAt: new Date() },
        { id: 'top_cluster',   name: 'Top Explorer',      icon: '🏆', earnedAt: new Date() },
      ],
      clusterHistory: [{ cluster: 'top', score: 90, date: new Date() }],
    },
    // ── RIYA — Class 7, Explorer Hub ────────────────────────────────────────
    {
      userId: riya._id, name: 'Riya Sharma', rollNumber: 'SSCH2026002',
      class: '7', section: 'B', school: 'EduPulse Model School', scmId: scmUser._id,
      parentEmail: 'parent.priya@demo.com',
      subjects: [
        { name: 'Mathematics',    code: 'MTH', score: 65, trend: 'down', attendance: 78, nepLevel: 'Developing' },
        { name: 'Science',        code: 'SCI', score: 72, trend: 'up',   attendance: 85, nepLevel: 'Achieving'  },
        { name: 'English',        code: 'ENG', score: 80, trend: 'up',   attendance: 90, nepLevel: 'Mastering'  },
        { name: 'Social Studies', code: 'SST', score: 61, trend: 'stable',attendance: 77, nepLevel: 'Developing'},
      ],
      gradeAverage: 70, gradeTrend: 1, academicHealthScore: 68, attendancePercentage: 83,
      cluster: 'medium', xpPoints: 280, level: 2, streakDays: 5,
      moodToday: 3, averageMoodScore: 3.2,
      academicDNA: { focusPower:55, pressurePerformer:45, teamPlayer:80, selfNavigator:60, comebackKid:70, subjectExplorer:75, quickResponder:50, growthSeeker:65 },
      careerFamilies: { scienceTech: 72, creativeArts: 55, business: 60, socialImpact: 80, sportsWellness: 40 },
      badges: [
        { id: 'first_login',    name: 'First Step',   icon: '⭐', earnedAt: new Date() },
        { id: 'explorer_badge', name: 'Star Explorer', icon: '🌍', earnedAt: new Date() },
      ],
      clusterHistory: [
        { cluster: 'below',  score: 55, date: new Date(Date.now() - 60 * 86400000) },
        { cluster: 'medium', score: 68, date: new Date() },
      ],
    },
    // ── DEV — Class 10, Career Command ──────────────────────────────────────
    {
      userId: dev._id, name: 'Dev Patel', rollNumber: 'SSCH2026003',
      class: '10', section: 'A', school: 'EduPulse Model School', scmId: scmUser._id,
      parentEmail: 'parent.aarav@demo.com',
      subjects: [
        { name: 'Mathematics', code: '041', score: 74, trend: 'up',   attendance: 81, nepLevel: 'Achieving', predictedBoard: 76 },
        { name: 'Science',     code: '086', score: 70, trend: 'stable',attendance: 83, nepLevel: 'Achieving', predictedBoard: 72 },
        { name: 'English',     code: '301', score: 83, trend: 'up',   attendance: 91, nepLevel: 'Mastering', predictedBoard: 85 },
        { name: 'Hindi',       code: '302', score: 68, trend: 'down', attendance: 77, nepLevel: 'Developing', predictedBoard: 66},
        { name: 'Social Sc.',  code: '087', score: 72, trend: 'up',   attendance: 79, nepLevel: 'Achieving', predictedBoard: 74 },
      ],
      gradeAverage: 73, gradeTrend: 3, academicHealthScore: 76, attendancePercentage: 82,
      cluster: 'medium', xpPoints: 450, level: 3, streakDays: 12,
      selectedStream: 'Science',
      moodToday: 4, averageMoodScore: 3.8,
      successProbability: 64,
      boardExamDates: [
        { subject: 'Mathematics', date: new Date('2027-03-05') },
        { subject: 'Science',     date: new Date('2027-03-07') },
        { subject: 'English',     date: new Date('2027-03-10') },
      ],
      careerMilestones: [
        { month: 1, action: 'Discover path',     detail: 'Complete career assessment', hours: 10, completed: true,  completedAt: new Date() },
        { month: 2, action: 'Learn foundations', detail: 'Start course on Coursera',   hours: 40, completed: false },
        { month: 3, action: 'First project',     detail: 'Build small GitHub project', hours: 30, completed: false },
      ],
      milestonesCompleted: 1,
      academicDNA: { focusPower:70, pressurePerformer:60, teamPlayer:65, selfNavigator:75, comebackKid:68, subjectExplorer:72, quickResponder:65, growthSeeker:78 },
      careerFamilies: { scienceTech: 80, creativeArts: 35, business: 65, socialImpact: 50, sportsWellness: 42 },
      badges: [
        { id: 'first_login',    name: 'First Step',      icon: '⭐', earnedAt: new Date() },
        { id: 'career_explorer',name: 'Career Explorer', icon: '🎯', earnedAt: new Date() },
        { id: 'streak_7',       name: '7-Day Streak',    icon: '🔥', earnedAt: new Date() },
      ],
      clusterHistory: [
        { cluster: 'below',  score: 58, date: new Date(Date.now() - 90 * 86400000) },
        { cluster: 'medium', score: 73, date: new Date() },
      ],
    },
    // ── KABIR — Class 11, Career Command ────────────────────────────────────
    {
      userId: kabir._id, name: 'Kabir Mehta', rollNumber: 'SSCH2026005',
      class: '11', section: 'A', school: 'EduPulse Model School', scmId: scmUser._id,
      parentEmail: 'parent.rohan@demo.com',
      subjects: [
        { name: 'Mathematics', code: '041', score: 88, trend: 'up',    attendance: 92, nepLevel: 'Mastering',  predictedBoard: 90 },
        { name: 'Physics',     code: '042', score: 82, trend: 'up',    attendance: 90, nepLevel: 'Achieving',  predictedBoard: 84 },
        { name: 'Chemistry',   code: '043', score: 75, trend: 'stable',attendance: 87, nepLevel: 'Achieving',  predictedBoard: 76 },
        { name: 'English',     code: '301', score: 79, trend: 'stable',attendance: 85, nepLevel: 'Achieving',  predictedBoard: 80 },
      ],
      gradeAverage: 81, gradeTrend: 5, academicHealthScore: 84, attendancePercentage: 89,
      cluster: 'top', xpPoints: 680, level: 4, streakDays: 22,
      selectedStream: 'Science',
      moodToday: 4, averageMoodScore: 4.1,
      successProbability: 79,
      academicDNA: { focusPower:82, pressurePerformer:78, teamPlayer:60, selfNavigator:85, comebackKid:72, subjectExplorer:80, quickResponder:75, growthSeeker:88 },
      careerFamilies: { scienceTech: 90, creativeArts: 30, business: 55, socialImpact: 50, sportsWellness: 35 },
      badges: [
        { id: 'first_login',  name: 'First Step',    icon: '⭐', earnedAt: new Date() },
        { id: 'top_cluster',  name: 'Top Performer', icon: '🏆', earnedAt: new Date() },
        { id: 'streak_7',     name: '7-Day Streak',  icon: '🔥', earnedAt: new Date() },
        { id: 'streak_14',    name: '14-Day Streak', icon: '⚡', earnedAt: new Date() },
      ],
      clusterHistory: [{ cluster: 'top', score: 84, date: new Date() }],
    },
  ]);
  console.log('🏫 School students (SchoolStudent model) created — 5 students across classes 4,5,7,10,11');


  console.log('\n✅ SEED COMPLETE!\n');
  console.log('═══════════════════════════════════════');
  console.log('DEMO CREDENTIALS (all passwords: demo123)');
  console.log('─────────────────────────────────────');
  console.log('College Students:');
  console.log('  aarav@demo.com   (Below Avg — at risk, 68% attendance)');
  console.log('  priya@demo.com   (Top Performer, 94% attendance)');
  console.log('  rohan@demo.com   (Medium Cluster)');
  console.log('  sneha@demo.com   (Recovering — Medium)');
  console.log('  vikram@demo.com  (New Student)');
  console.log('SCM:   scm@demo.com');
  console.log('Admin: admin@demo.com');
  console.log('Parents:');
  console.log('  parent.aarav@demo.com (has 2 unread alerts)');
  console.log('  parent.priya@demo.com');
  console.log('School Students (SchoolStudent model — use each world):');
  console.log('  aryan@demo.com  / demo123 — Class 5  → SPARKY WORLD  (NIPUN: Reading 3/5, Math 2/5)');
  console.log('  anika@demo.com  / demo123 — Class 4  → SPARKY WORLD  (Top student, all NIPUN 5/5)');
  console.log('  riya@demo.com   / demo123 — Class 7  → EXPLORER HUB  (Academic DNA + Career Families)');
  console.log('  dev@demo.com    / demo123 — Class 10 → CAREER COMMAND (64% success prob, 1 milestone done)');
  console.log('  kabir@demo.com  / demo123 — Class 11 → CAREER COMMAND (Top cluster, 79% success prob)');
  console.log('═══════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
