const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Mood = require('../models/Mood');

// ════════════════════════════════════════════════════
// DEMO ENDPOINTS (no auth required — for Hawkathon demo)
// ════════════════════════════════════════════════════

// POST /api/ai/demo-chat
// Sparky AI chat powered by Gemini. No JWT required.
router.post('/demo-chat', async (req, res) => {
  try {
    const {
      message,
      studentName = 'Student',
      semester = 3,
      cluster = 'medium',
      attendancePercentage = 75,
      moodToday = 3,
      chatHistory = [],
    } = req.body;

    if (!message) return res.status(400).json({ message: 'message is required' });

    const response = await geminiService.sparkyChatResponse({
      message,
      studentName,
      semester,
      cluster,
      attendancePercentage,
      moodToday,
      chatHistory,
    });

    res.json({ response, source: 'gemini' });
  } catch (err) {
    console.error('demo-chat error:', err.message);
    const fallbacks = [
      "Hey there! 😊 I'm Sparky, your AI buddy! Keep pushing — every day counts! 🚀",
      "Great question! 🤖 You've got this — stay consistent and the results will follow! 💪",
      "Hi! 🌟 Remember: progress, not perfection. You're doing better than you think! 🎯",
    ];
    res.json({ response: fallbacks[Math.floor(Math.random() * fallbacks.length)], source: 'fallback' });
  }
});

// POST /api/ai/demo-career
// Generate 3 Gemini career paths. No JWT required.
router.post('/demo-career', async (req, res) => {
  try {
    const { student, grades = [], interests = [] } = req.body;
    if (!student) return res.status(400).json({ message: 'student data required' });

    const paths = await geminiService.generateCareerRoadmap({ student, grades, interests });
    res.json({ paths, generatedAt: new Date(), source: 'gemini' });
  } catch (err) {
    console.error('demo-career error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════
// PROTECTED ENDPOINTS (require JWT)
// ════════════════════════════════════════════════════

// POST /api/ai/chat — Sparky chat (authenticated)
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, studentId, chatHistory } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const response = await geminiService.sparkyChatResponse({
      message,
      studentName: student.name,
      semester: student.semester,
      cluster: student.cluster,
      attendancePercentage: student.attendancePercentage,
      moodToday: student.moodToday,
      chatHistory,
    });

    await Student.findByIdAndUpdate(studentId, { $inc: { xpPoints: 2 } });
    res.json({ response, studentContext: { name: student.name, cluster: student.cluster } });
  } catch (err) {
    const fallbacks = [
      "Hey there! 😊 I'm Sparky! Keep pushing — every day counts! 🚀",
      "Great to see you! 🤖 You've got this! 💪",
      "Hi! 🌟 Sparky here! You're doing amazing — keep going! 🎯",
    ];
    res.json({ response: fallbacks[Math.floor(Math.random() * fallbacks.length)], demo: true });
  }
});

// POST /api/ai/career-roadmap (authenticated)
router.post('/career-roadmap', protect, async (req, res) => {
  try {
    const { studentId, interests } = req.body;
    const student = await Student.findById(studentId);
    const grades = await Grade.find({ studentId });
    const paths = await geminiService.generateCareerRoadmap({ student, grades, interests });
    res.json({ paths });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/parent-alert-content (authenticated)
router.post('/parent-alert-content', protect, async (req, res) => {
  try {
    const content = await geminiService.generateParentAlert(req.body);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/voice-command (authenticated)
router.post('/voice-command', protect, async (req, res) => {
  try {
    const { voiceText } = req.body;
    const result = await geminiService.parseVoiceCommand(voiceText);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/weekly-insight (authenticated)
router.post('/weekly-insight', protect, async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId);
    const grades = await Grade.find({ studentId });
    const moods = await Mood.find({ studentId }).sort({ recordedAt: -1 }).limit(7);

    const gradeAvg = grades.length ? Math.round(grades.reduce((a, g) => a + g.percentage, 0) / grades.length) : 0;
    const moodAvg = moods.length ? (moods.reduce((a, m) => a + m.mood, 0) / moods.length).toFixed(1) : 3;

    const insight = await geminiService.generateWeeklyInsight({
      studentName: student.name,
      gradeAvg,
      attendancePercentage: student.attendancePercentage,
      streakDays: student.streakDays,
      moodAvg,
      cluster: student.cluster,
    });

    res.json({ insight });
  } catch {
    res.json({ insight: 'Keep up the great work this week! 🌟 Every step forward brings you closer to your goals.', demo: true });
  }
});

module.exports = router;
