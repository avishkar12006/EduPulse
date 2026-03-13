const express       = require('express');
const router        = express.Router();
const axios         = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect, authorize } = require('../middleware/auth');
const SchoolStudent = require('../models/SchoolStudent');
const MoodSession   = require('../models/MoodSession');
const StudyPlan     = require('../models/StudyPlan');
const Quest         = require('../models/Quest');
const User          = require('../models/User');
const { sendSchoolAlert } = require('../services/schoolAlerts');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function gemini(prompt) {
  try {
    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    return null;
  }
}

// ── Helper: get age group from class ─────────────────────────────────────
function ageGroup(cls) {
  const n = parseInt(cls);
  if (n <= 5)  return '3-5';
  if (n <= 8)  return '6-8';
  return '9-12';
}

// ── GET /api/school/student/:id/dashboard ────────────────────────────────
router.get('/student/:id/dashboard', protect, async (req, res) => {
  try {
    const student = await SchoolStudent.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const quests = await Quest.find({
      ageGroup: ageGroup(student.class),
      isActive: true,
    }).limit(5);

    // Generate a personalized AI insight if Gemini available
    let insight = null;
    const group = ageGroup(student.class);
    if (group === '3-5') {
      insight = `Hi ${student.name.split(' ')[0]}! 🌟 You're doing amazing today! Keep exploring!`;
    } else {
      const promptText = group === '6-8'
        ? `Generate a short (2 sentences), motivating daily message for a Class ${student.class} student named ${student.name.split(' ')[0]} who has a ${student.gradeAverage}% average and ${student.attendancePercentage}% attendance. Use friendly teen language.`
        : `Generate a concise (2 sentences) strategic insight for Class ${student.class} student ${student.name.split(' ')[0]} with ${student.gradeAverage}% average. Career-focused, professional tone.`;
      insight = await gemini(promptText);
    }

    res.json({ student, quests, insight });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/school/mood/log ─────────────────────────────────────────────
router.post('/mood/log', protect, async (req, res) => {
  try {
    const { studentId, mood, numericScore, note } = req.body;
    const student = await SchoolStudent.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.moodToday      = numericScore || mood;
    student.moodSource     = 'checkin';
    student.averageMoodScore = Math.round(
      (student.averageMoodScore * 0.8 + (numericScore || 3) * 0.2)
    );
    await student.save();

    // If private journal note
    if (note) {
      const sentiment = numericScore >= 4 ? 'positive' : numericScore <= 2 ? 'negative' : 'neutral';
      student.moodJournal.push({ entry: note, sentiment, date: new Date() });
      await student.save();
    }

    // Check if consistently low mood (7+ days) → alert parents
    const lowMoodDays = student.moodJournal
      .filter(j => j.sentiment === 'negative' && j.date > new Date(Date.now() - 7 * 86400000))
      .length;

    let parentAlerted = false;
    if (lowMoodDays >= 7 && student.parentEmail) {
      await sendSchoolAlert(
        student.parentEmail, student.name, student.class,
        'mood', { lowMoodDays, note }, 'en'
      );
      parentAlerted = true;
    }

    // Gemini encouragement message
    const group = ageGroup(student.class);
    let encouragement;
    if (group === '3-5') {
      const messages = {
        1: "Sparky sends you a big hug! 🤗 Tomorrow will be sunny again!",
        2: "It's okay to feel sad sometimes. Sparky believes in you! 💙",
        3: "You're doing great, explorer! Keep going! ⭐",
        4: "Wow, you're feeling good! Let's have an amazing adventure! 🌟",
        5: "You're a SUPERSTAR today! Sparky is doing a happy dance! 🎉",
      };
      encouragement = messages[numericScore] || messages[3];
    } else {
      const prompt = `A Class ${student.class} student logged mood ${numericScore}/5. Write one friendly, genuine 1-sentence encouragement. No emojis for Class 9–12, use emojis for Class 6–8.`;
      encouragement = await gemini(prompt) || 'Keep going! Every day is a new opportunity. 💪';
    }

    res.json({ success: true, encouragement, parentAlerted });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/school/mood/opencv ──────────────────────────────────────────
// Receives base64 image, forwards to ML service, handles alerts
router.post('/mood/opencv', protect, async (req, res) => {
  try {
    const { studentId, frameBase64, sessionId } = req.body;

    // Forward to Flask ML service
    let moodResult = { mood: 'focused', adjustment: { action: 'continue', difficulty: 'maintain', pace: 'normal' } };
    try {
      const mlRes = await axios.post(`${ML_URL}/mood/analyze`, { image: frameBase64 }, { timeout: 10000 });
      moodResult = mlRes.data;
    } catch {
      // ML service unavailable — use neutral mood
    }

    const { mood, adjustment } = moodResult;

    // Update or create session
    let session = await MoodSession.findById(sessionId);
    if (!session) {
      session = await MoodSession.create({
        studentId, sessionType: 'study', startTime: new Date(),
        moodTimeline: [],
        moodDistribution: { engaged:0,focused:0,struggling:0,anxious:0,bored:0,frustrated:0,curious:0 },
      });
    }

    const numericMap = { engaged:5, curious:5, focused:4, bored:3, anxious:2, struggling:2, frustrated:1 };
    session.moodTimeline.push({
      timestamp: new Date(), mood, numericScore: numericMap[mood] || 3,
      source: 'opencv', adjustmentMade: adjustment.action,
    });
    if (session.moodDistribution[mood] !== undefined) session.moodDistribution[mood]++;

    // Frustration tracking
    if (mood === 'frustrated') {
      session.frustratedFrames = (session.frustratedFrames || 0) + 1;
    } else {
      session.frustratedFrames = 0;
    }

    // Alert teacher after 3 consecutive frustrated frames
    if (session.frustratedFrames >= 3 && !session.teacherAlerted) {
      session.teacherAlerted   = true;
      session.teacherAlertedAt = new Date();
      session.alertReason      = 'Frustrated for 3+ consecutive OpenCV frames';
      // In production: emit Socket.io event to teacher dashboard
    }

    await session.save();

    // Update student's live mood
    const student = await SchoolStudent.findById(studentId);
    if (student) {
      student.moodToday  = numericMap[mood] || 3;
      student.moodSource = 'opencv';
      await student.save();
    }

    res.json({
      mood,
      adjustment,
      sessionId: session._id,
      teacherAlerted: session.teacherAlerted,
      frustratedFrames: session.frustratedFrames,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── GET /api/school/mood/session-summary/:sessionId ───────────────────────
router.get('/mood/session-summary/:sessionId', protect, async (req, res) => {
  try {
    const session = await MoodSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const entries = session.moodTimeline.length;
    const avgScore = entries
      ? session.moodTimeline.reduce((a, m) => a + m.numericScore, 0) / entries
      : 3;

    const engagementScore = Math.round(
      ((session.moodDistribution.engaged || 0) * 100 +
       (session.moodDistribution.curious  || 0) * 90 +
       (session.moodDistribution.focused  || 0) * 75) /
      Math.max(entries, 1)
    );

    const dominant = Object.entries(session.moodDistribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'focused';

    const difficulty = avgScore >= 4 ? 'harder' : avgScore <= 2 ? 'easier' : 'same';

    session.endTime              = new Date();
    session.avgNumericScore      = Math.round(avgScore * 10) / 10;
    session.dominantMood         = dominant;
    session.engagementScore      = Math.min(100, engagementScore);
    session.recommendedDifficulty = difficulty;
    await session.save();

    res.json({
      sessionId: session._id,
      avgScore,
      engagementScore: session.engagementScore,
      dominantMood: dominant,
      distribution: session.moodDistribution,
      recommendedDifficulty: difficulty,
      teacherAlerted: session.teacherAlerted,
      adjustmentsMade: session.contentAdjustmentsMade.length,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/school/quest/complete ──────────────────────────────────────
router.post('/quest/complete', protect, async (req, res) => {
  try {
    const { studentId, questId } = req.body;
    const [student, quest] = await Promise.all([
      SchoolStudent.findById(studentId),
      Quest.findById(questId),
    ]);
    if (!student || !quest) return res.status(404).json({ message: 'Not found' });

    // Award XP
    student.xpPoints        += quest.xpReward;
    student.questsCompleted += 1;
    const newLevel = Math.floor(student.xpPoints / 500) + 1;
    student.level  = newLevel;

    // Update NIPUN levels if applicable (Class 3-5)
    let newBadges = [];
    if (quest.nipunCompetency && ageGroup(student.class) === '3-5') {
      const current = student.nipunLevels?.[quest.nipunCompetency] || 1;
      student.nipunLevels[quest.nipunCompetency] = Math.min(5, current + 1);
    }

    // Check badge unlocks
    const BADGE_RULES = [
      { id: 'reading_star', name: 'Reading Star ⭐', icon: '⭐', cond: s => s.questsCompleted >= 5 && quest.subject === 'English' },
      { id: 'math_wizard', name: 'Math Wizard 🧙', icon: '🧙', cond: s => s.questsCompleted >= 20 },
      { id: 'quest_champion', name: 'Quest Champion 🏆', icon: '🏆', cond: s => s.questsCompleted >= 10 },
      { id: 'mood_master', name: 'Mood Master 😊', icon: '😊', cond: s => s.moodJournal.length >= 7 },
    ];
    for (const rule of BADGE_RULES) {
      if (rule.cond(student) && !student.badges.find(b => b.id === rule.id)) {
        student.badges.push({ id: rule.id, name: rule.name, icon: rule.icon, earnedAt: new Date() });
        newBadges.push({ id: rule.id, name: rule.name, icon: rule.icon });
      }
    }

    await student.save();
    res.json({ success: true, xpAwarded: quest.xpReward, newBadges, newLevel });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── GET /api/school/nipun/:studentId ─────────────────────────────────────
router.get('/nipun/:studentId', protect, async (req, res) => {
  try {
    const student = await SchoolStudent.findById(req.params.studentId).select('nipunLevels name class');
    if (!student) return res.status(404).json({ message: 'Not found' });
    res.json(student);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/school/stream/recommend ────────────────────────────────────
router.post('/stream/recommend', protect, async (req, res) => {
  try {
    const { studentId } = req.body;
    const student       = await SchoolStudent.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Not found' });

    const subjectText = student.subjects.map(s =>
      `${s.name}: ${s.score}%`
    ).join(', ');

    const prompt = `You are an Indian school career counselor. A Class 9 student named ${student.name.split(' ')[0]} has these Class 6-8 grades: ${subjectText || 'Math: 78%, Science: 82%, English: 75%'}, attendance ${student.attendancePercentage}%. 

    Recommend 3 streams (Science, Commerce, Arts & Humanities) with:
    - matchScore (0-100)
    - reasoning (2 sentences)  
    - careerPathsCount (realistic number)
    - salaryRange (₹ Indian format)
    - badge: "RECOMMENDED" / "POSSIBLE" / "CONSIDER"
    
    Return ONLY valid JSON: {"streams": [{"name":"Science","matchScore":87,"reasoning":"...","careerPathsCount":12,"salaryRange":"₹8-50 LPA","badge":"RECOMMENDED"}, ...]}`;

    const raw = await gemini(prompt);
    let recommendation = { streams: [
      { name: 'Science', matchScore: 75, reasoning: 'Strong analytical foundation.', careerPathsCount: 12, salaryRange: '₹8-50 LPA', badge: 'RECOMMENDED' },
      { name: 'Commerce', matchScore: 60, reasoning: 'Good communication skills.', careerPathsCount: 8, salaryRange: '₹5-30 LPA', badge: 'POSSIBLE' },
      { name: 'Arts & Humanities', matchScore: 45, reasoning: 'Creative subjects available.', careerPathsCount: 10, salaryRange: '₹4-25 LPA', badge: 'CONSIDER' },
    ]};

    if (raw) {
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) recommendation = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    student.streamRecommendation = recommendation;
    await student.save();

    res.json(recommendation);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/school/planner/generate ────────────────────────────────────
router.post('/planner/generate', protect, async (req, res) => {
  try {
    const { studentId, examDates } = req.body;
    const student = await SchoolStudent.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Not found' });

    const examText = examDates.map(e => `${e.subject} on ${e.date}`).join(', ');
    const weakSubjects = student.subjects
      .filter(s => s.score < 70)
      .map(s => s.name).join(', ') || 'All subjects';

    const prompt = `Create a board exam study plan for Class ${student.class} student ${student.name.split(' ')[0]}.
Exams: ${examText}
Current grades: ${student.subjects.map(s => `${s.name} ${s.score}%`).join(', ')}
Weak subjects needing priority: ${weakSubjects}

Generate a JSON daily study plan from today to the first exam. Include rest days, mock tests, and revision sessions.
Return ONLY valid JSON: {"dailyPlan": [{"date":"2026-03-14","subject":"Mathematics","topic":"Quadratic Equations","duration":90,"priority":"high","type":"learn"}, ...], "totalHoursPlanned": 120}`;

    const raw = await gemini(prompt);
    let planData = { dailyPlan: [], totalHoursPlanned: 0 };

    if (raw) {
      try {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) planData = JSON.parse(match[0]);
      } catch {}
    }

    // Fallback plan if Gemini fails
    if (!planData.dailyPlan.length) {
      const today = new Date();
      planData.dailyPlan = examDates.flatMap((exam, i) =>
        Array.from({ length: 14 }, (_, d) => ({
          date: new Date(today.getTime() + (i * 14 + d) * 86400000).toISOString().split('T')[0],
          subject: exam.subject,
          topic: `${exam.subject} Revision Block ${d + 1}`,
          duration: 60, priority: 'medium', type: d % 7 === 6 ? 'rest' : 'learn',
        }))
      );
    }

    const plan = await StudyPlan.create({
      studentId: student._id,
      examDates,
      dailyPlan: planData.dailyPlan,
      totalHoursPlanned: planData.totalHoursPlanned || planData.dailyPlan.reduce((a, d) => a + (d.duration || 60) / 60, 0),
    });

    student.studyPlanId    = plan._id;
    student.boardExamDates = examDates;
    await student.save();

    res.json({ planId: plan._id, plan });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── GET /api/school/career/:studentId ────────────────────────────────────
router.get('/career/:studentId', protect, async (req, res) => {
  try {
    const student = await SchoolStudent.findById(req.params.studentId);
    if (!student) return res.status(404).json({ message: 'Not found' });

    const subjectText = student.subjects.map(s => `${s.name}: ${s.score}%`).join(', ')
      || 'Math: 85%, Science: 78%, English: 82%';

    const prompt = `You are a career counselor for Indian Class ${student.class} students. 
Student: ${student.name.split(' ')[0]}, Stream: ${student.selectedStream || 'Science'}, Grades: ${subjectText}

Generate exactly 3 career path "missions" as JSON:
{"careers": [{"title":"Full-Stack Developer","industry":"Technology","successProbability":78,"reasoning":"Your consistent CS and Math scores...","salaryStart":"₹8-25 LPA","salaryGrowth":"₹25-80 LPA","topSkills":[{"name":"React","matched":40},{"name":"Node.js","matched":25}],"timelineMonths":24}]}

Return ONLY valid JSON.`;

    const raw = await gemini(prompt);
    let careers = [];

    if (raw) {
      try {
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) careers = JSON.parse(match[0]).careers || [];
      } catch {}
    }

    // Fallback careers
    if (!careers.length) {
      careers = [
        { title: 'Software Engineer', industry: 'Technology', successProbability: 75, reasoning: 'Strong Math and Science foundation aligns well with CS careers.', salaryStart: '₹8-20 LPA', salaryGrowth: '₹25-70 LPA', topSkills: [{ name: 'DSA', matched: 60 }, { name: 'System Design', matched: 20 }], timelineMonths: 24 },
        { title: 'Data Scientist', industry: 'Analytics', successProbability: 68, reasoning: 'Interest in Mathematics and logical reasoning are key strengths.', salaryStart: '₹10-25 LPA', salaryGrowth: '₹30-80 LPA', topSkills: [{ name: 'Python', matched: 40 }, { name: 'Statistics', matched: 50 }], timelineMonths: 24 },
        { title: 'Product Manager', industry: 'Business & Tech', successProbability: 62, reasoning: 'Communication skills and analytical mindset suit PM roles.', salaryStart: '₹12-25 LPA', salaryGrowth: '₹30-90 LPA', topSkills: [{ name: 'Strategy', matched: 30 }, { name: 'Analytics', matched: 45 }], timelineMonths: 24 },
      ];
    }
    res.json({ careers });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/school/milestone/complete ───────────────────────────────────
router.post('/milestone/complete', protect, async (req, res) => {
  try {
    const { studentId, monthNumber } = req.body;
    const student = await SchoolStudent.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Not found' });

    const milestone = student.careerMilestones.find(m => m.month === monthNumber);
    if (milestone) {
      milestone.completed   = true;
      milestone.completedAt = new Date();
    }

    student.milestonesCompleted += 1;
    student.xpPoints            += 100;
    student.successProbability   = Math.min(99, student.successProbability + 2);
    await student.save();

    res.json({
      success: true,
      xpAwarded: 100,
      milestonesCompleted: student.milestonesCompleted,
      successProbability: student.successProbability,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── GET /api/school/cluster/:class/:section ───────────────────────────────
router.get('/cluster/:class/:section', protect, async (req, res) => {
  try {
    const students = await SchoolStudent.find({
      class:   req.params.class,
      section: req.params.section,
    }).select('name cluster academicHealthScore attendancePercentage gradeAverage');

    const grouped = { top: [], medium: [], below: [] };
    students.forEach(s => grouped[s.cluster || 'medium'].push(s));

    res.json({ grouped, total: students.length });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/school/attendance/mark ──────────────────────────────────────
router.post('/attendance/mark', protect, async (req, res) => {
  try {
    const { records } = req.body;
    // records: [{ studentId, present, subject, date }]
    for (const rec of records) {
      const student = await SchoolStudent.findById(rec.studentId);
      if (!student) continue;

      const subj = student.subjects.find(s => s.name === rec.subject);
      if (subj) {
        const total   = (subj.totalClasses || 10) + 1;
        const present = (subj.classesPresent || Math.round((subj.attendance / 100) * 10)) + (rec.present ? 1 : 0);
        subj.attendance = Math.round((present / total) * 100);
      }

      // Recalculate overall attendance
      const avg = student.subjects.length
        ? student.subjects.reduce((a, s) => a + s.attendance, 0) / student.subjects.length
        : 0;
      student.attendancePercentage = Math.round(avg);

      // Trigger alert if below 75%
      if (student.attendancePercentage < 75 && student.parentEmail) {
        await sendSchoolAlert(
          student.parentEmail, student.name, student.class,
          'attendance', { percentage: student.attendancePercentage, subject: rec.subject }, 'en'
        ).catch(() => {});
      }
      await student.save();
    }
    res.json({ success: true, updated: records.length });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/school/alert/send ───────────────────────────────────────────
router.post('/alert/send', protect, async (req, res) => {
  try {
    const { studentId, alertType, language } = req.body;
    const student = await SchoolStudent.findById(studentId);
    if (!student || !student.parentEmail) return res.status(400).json({ message: 'No parent email' });

    await sendSchoolAlert(
      student.parentEmail, student.name, student.class,
      alertType, { student }, language || 'en'
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── GET /api/school/quests/:ageGroup ──────────────────────────────────────
router.get('/quests/:ageGroup', protect, async (req, res) => {
  try {
    const quests = await Quest.find({ ageGroup: req.params.ageGroup, isActive: true });
    res.json(quests);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/school/quest/create ─────────────────────────────────────────
router.post('/quest/create', protect, authorize('scm', 'admin'), async (req, res) => {
  try {
    const quest = await Quest.create(req.body);
    res.status(201).json(quest);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
