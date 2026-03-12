const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Mood = require('../models/Mood');
const Career = require('../models/Career');
const { protect } = require('../middleware/auth');

// GET /api/students/:id — full student profile
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email avatar language')
      .populate('scmId', 'name email');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/students/:id — update student profile
router.put('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/students/:id/grades
router.get('/:id/grades', protect, async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.id }).sort({ semester: 1, subject: 1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/students/:id/attendance
router.get('/:id/attendance', protect, async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.params.id }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/students/:id/mood
router.get('/:id/mood', protect, async (req, res) => {
  try {
    const moods = await Mood.find({ studentId: req.params.id }).sort({ recordedAt: -1 }).limit(30);
    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/students/:id/mood — log today's mood
router.post('/:id/mood', protect, async (req, res) => {
  try {
    const { mood, label, note, isShared } = req.body;
    const moodDoc = await Mood.create({ studentId: req.params.id, mood, label, note, isShared });
    
    // Update student's last mood
    await Student.findByIdAndUpdate(req.params.id, { moodToday: mood, lastMoodDate: new Date() });
    
    // Award XP
    await Student.findByIdAndUpdate(req.params.id, { $inc: { xpPoints: 10 } });
    
    res.status(201).json(moodDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/students/:id/academic-dna
router.get('/:id/academic-dna', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const grades = await Grade.find({ studentId: req.params.id });
    const moods = await Mood.find({ studentId: req.params.id }).sort({ recordedAt: -1 }).limit(30);
    const attendance = await Attendance.find({ studentId: req.params.id });

    // Calculate 8 DNA dimensions
    const gradeAvgs = grades.length ? grades.reduce((a, g) => a + g.percentage, 0) / grades.length : 50;
    const attendAvg = attendance.length ? attendance.filter(a => a.status === 'present').length / attendance.length * 100 : 75;
    const moodAvg = moods.length ? moods.reduce((a, m) => a + m.mood, 0) / moods.length : 3;

    const dna = {
      consistency: Math.min(100, Math.round(attendAvg * 0.8 + gradeAvgs * 0.2)),
      pressurePerformance: Math.min(100, Math.round(gradeAvgs * 0.9)),
      collaborativeTendency: Math.min(100, 60 + Math.random() * 30),
      selfDirection: Math.min(100, Math.round((student.streakDays / 30) * 100)),
      recoveryAbility: Math.min(100, Math.round(moodAvg * 20)),
      subjectDiversity: Math.min(100, grades.length > 5 ? 80 : grades.length * 15),
      earlyWarningResponsiveness: Math.min(100, 70 + Math.random() * 25),
      growthMomentum: Math.min(100, Math.round(gradeAvgs))
    };

    res.json({ dna, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/students/:id/achievements
router.get('/:id/achievements', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    const allBadges = [
      { id: 'first_login', name: 'First Step', icon: '🌟', category: 'Platform Engagement', description: 'Logged in for the first time' },
      { id: 'streak_7', name: '7-Day Streak', icon: '🔥', category: 'Streak', description: 'Logged in 7 days in a row' },
      { id: 'streak_30', name: 'On Fire', icon: '⚡', category: 'Streak', description: '30-day login streak' },
      { id: 'top_cluster', name: 'Top Performer', icon: '🏆', category: 'Academic Excellence', description: 'Placed in Top cluster' },
      { id: 'perfect_attendance', name: 'Attendance Champion', icon: '📅', category: 'Attendance Champion', description: '100% attendance in a subject' },
      { id: 'career_explorer', name: 'Career Explorer', icon: '🎯', category: 'Career Explorer', description: 'Generated your career paths' },
      { id: 'comeback_kid', name: 'Comeback Kid', icon: '💪', category: 'Comeback Kid', description: 'Moved up from Below Average cluster' },
      { id: 'mood_master', name: 'Mood Master', icon: '😊', category: 'Platform Engagement', description: 'Logged mood for 10 consecutive days' },
      { id: 'grade_ace', name: 'Grade Ace', icon: '📚', category: 'Academic Excellence', description: 'Achieved A+ in any subject' },
      { id: 'sparky_friend', name: 'Sparky\'s Friend', icon: '🤖', category: 'Platform Engagement', description: 'Had 10 conversations with Sparky' }
    ];

    const earnedIds = student.badges.map(b => b.id);
    const badgesWithStatus = allBadges.map(b => ({
      ...b, earned: earnedIds.includes(b.id),
      earnedAt: student.badges.find(sb => sb.id === b.id)?.earnedAt || null
    }));

    res.json({
      badges: badgesWithStatus,
      xpPoints: student.xpPoints,
      level: student.level,
      streakDays: student.streakDays
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
