const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Mood = require('../models/Mood');

// ── DEMO ENDPOINT (no auth) ────────────────────────────
// POST /api/ai/demo-chat
// Sparky chat for demo — passes student context to Gemini, gets real response.
router.post('/demo-chat', async (req, res) => {
  try {
    const { message, studentName, semester, cluster, attendancePercentage, moodToday, chatHistory } = req.body;
    const response = await geminiService.sparkyChatResponse({
      message,
      studentName: studentName || 'Student',
      semester: semester || 3,
      cluster: cluster || 'medium',
      attendancePercentage: attendancePercentage || 75,
      moodToday: moodToday || 3,
      chatHistory: chatHistory || []
    });
    res.json({ response });
  } catch (err) {
    console.error('Demo chat error:', err.message);
    // Fallback so chat never breaks
    const fallbacks = [
      "Hey there! 😊 I'm Sparky, your AI buddy! Keep pushing — every day counts! 🚀",
      "Great question! 🤖 You've got this — stay consistent and the results will follow! 💪",
      "Hi! 🌟 Remember: progress, not perfection. You're doing better than you think! 🎯"
    ];
    res.json({ response: fallbacks[Math.floor(Math.random() * fallbacks.length)], fallback: true });
  }
});



// POST /api/ai/chat — Sparky conversation
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
      chatHistory
    });
    
    // Award XP for engaging with Sparky
    await Student.findByIdAndUpdate(studentId, { $inc: { xpPoints: 2 } });
    
    res.json({ response, studentContext: { name: student.name, cluster: student.cluster } });
  } catch (error) {
    // Fallback response if Gemini not configured
    const fallbacks = [
      "Hey there! 😊 I'm Sparky, your AI buddy! To unlock my full powers, the admin needs to configure the Gemini API key. But I'm still here to cheer you on! 🚀",
      "Great to see you! 🤖 I'm running in demo mode right now. Your academic journey looks amazing — keep pushing forward! 💪",
      "Hi! 🌟 Sparky here! Once the Gemini API is set up, I can give you personalized advice. For now: You've got this! 🎯"
    ];
    res.json({ response: fallbacks[Math.floor(Math.random() * fallbacks.length)], demo: true });
  }
});

// POST /api/ai/career-roadmap
router.post('/career-roadmap', protect, async (req, res) => {
  try {
    const { studentId, interests } = req.body;
    const student = await Student.findById(studentId);
    const grades = await Grade.find({ studentId });
    const paths = await geminiService.generateCareerRoadmap({ student, grades, interests });
    res.json({ paths });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/parent-alert-content
router.post('/parent-alert-content', protect, async (req, res) => {
  try {
    const content = await geminiService.generateParentAlert(req.body);
    res.json({ content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/voice-command
router.post('/voice-command', protect, async (req, res) => {
  try {
    const { voiceText } = req.body;
    const result = await geminiService.parseVoiceCommand(voiceText);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/weekly-insight
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
      cluster: student.cluster
    });
    
    res.json({ insight });
  } catch (error) {
    res.json({ insight: "Keep up the great work this week! 🌟 Every step forward, no matter how small, brings you closer to your goals.", demo: true });
  }
});

module.exports = router;
