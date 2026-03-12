const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// POST /api/grades/add
router.post('/add', protect, async (req, res) => {
  try {
    const { studentId, semester, subject, subjectCode, internalMarks, externalMarks, maxMarks, examDate } = req.body;
    const totalMarks = internalMarks + externalMarks;
    
    const grade = await Grade.create({
      studentId, semester, subject, subjectCode,
      internalMarks, externalMarks, totalMarks, maxMarks: maxMarks || 100, examDate
    });
    
    // Update academic health score
    await updateAcademicHealth(studentId);
    
    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/grades/:studentId
router.get('/:studentId', protect, async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId }).sort({ semester: 1 });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/grades/:studentId/semester/:sem
router.get('/:studentId/semester/:sem', protect, async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId, semester: req.params.sem });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/grades/:studentId/summary
router.get('/:studentId/summary', protect, async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId });
    const semesters = [...new Set(grades.map(g => g.semester))].sort();
    
    const semesterSummary = semesters.map(sem => {
      const semGrades = grades.filter(g => g.semester === sem);
      const avg = semGrades.reduce((a, g) => a + g.percentage, 0) / semGrades.length;
      return { semester: sem, average: Math.round(avg), subjectCount: semGrades.length };
    });
    
    const overall = grades.length ? Math.round(grades.reduce((a, g) => a + g.percentage, 0) / grades.length) : 0;
    
    res.json({ semesterSummary, overall, grades });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function updateAcademicHealth(studentId) {
  const grades = await Grade.find({ studentId });
  const student = await Student.findById(studentId);
  if (!grades.length || !student) return;
  
  const gradeAvg = grades.reduce((a, g) => a + g.percentage, 0) / grades.length;
  const attendanceScore = student.attendancePercentage;
  const moodScore = ((student.moodToday || 3) / 5) * 100;
  
  const healthScore = Math.round(
    gradeAvg * 0.5 + attendanceScore * 0.35 + moodScore * 0.15
  );
  
  await Student.findByIdAndUpdate(studentId, {
    academicHealthScore: Math.min(100, Math.max(0, healthScore)),
    placementReadinessScore: Math.min(100, Math.round(gradeAvg * 0.7 + attendanceScore * 0.3))
  });
}

module.exports = router;
