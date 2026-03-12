const express = require('express');
const router = express.Router();
const Career = require('../models/Career');
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const { protect } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

// ── DEMO ENDPOINT (no auth) ────────────────────────────
// POST /api/career/demo-generate
// Frontend sends student data directly, gets back 3 Gemini career paths.
router.post('/demo-generate', async (req, res) => {
  try {
    const { student, grades = [], interests = [] } = req.body;
    if (!student) return res.status(400).json({ message: 'student data required' });

    const paths = await geminiService.generateCareerRoadmap({ student, grades, interests });
    res.json({ paths, generatedAt: new Date(), source: 'gemini' });
  } catch (err) {
    console.error('Demo career error:', err.message);
    res.status(500).json({ message: err.message });
  }
});



// POST /api/career/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const { studentId, interests } = req.body;
    const student = await Student.findById(studentId);
    const grades = await Grade.find({ studentId });
    
    // Call Gemini to generate career paths
    const paths = await geminiService.generateCareerRoadmap({ student, grades, interests });
    
    // Save or update career document
    const career = await Career.findOneAndUpdate(
      { studentId },
      { studentId, paths, generatedAt: new Date(), lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    
    // Award XP for exploring career
    await Student.findByIdAndUpdate(studentId, { $inc: { xpPoints: 15 } });
    
    res.json(career);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/career/:studentId
router.get('/:studentId', protect, async (req, res) => {
  try {
    const career = await Career.findOne({ studentId: req.params.studentId });
    if (!career) return res.status(404).json({ message: 'No career roadmap generated yet' });
    res.json(career);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/career/:studentId/select-path
router.put('/:studentId/select-path', protect, async (req, res) => {
  try {
    const { pathIndex } = req.body;
    const career = await Career.findOneAndUpdate(
      { studentId: req.params.studentId },
      { selectedPathIndex: pathIndex },
      { new: true }
    );
    res.json(career);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/career/:studentId/milestone/:milestoneId/complete
router.put('/:studentId/milestone/:pathIndex/:milestoneIndex/complete', protect, async (req, res) => {
  try {
    const career = await Career.findOne({ studentId: req.params.studentId });
    if (!career) return res.status(404).json({ message: 'Career not found' });
    
    const pathIdx = parseInt(req.params.pathIndex);
    const milIdx = parseInt(req.params.milestoneIndex);
    
    career.paths[pathIdx].milestones[milIdx].completed = true;
    career.paths[pathIdx].milestones[milIdx].completedAt = new Date();
    await career.save();
    
    // Award XP
    await Student.findByIdAndUpdate(req.params.studentId, { $inc: { xpPoints: 25 } });
    
    res.json(career);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
