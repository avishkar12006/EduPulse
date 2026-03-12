const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/auth');

// GET /api/scm/:id/students — all students assigned to this SCM
router.get('/:id/students', protect, async (req, res) => {
  try {
    const students = await Student.find({ scmId: req.params.id });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/scm/:id/priority-queue — top 5 at-risk students
router.get('/:id/priority-queue', protect, async (req, res) => {
  try {
    const students = await Student.find({ scmId: req.params.id });
    
    const scored = students.map(s => {
      let priority = 0;
      const reasons = [];
      
      if (s.cluster === 'below') { priority += 40; reasons.push('In Below Average cluster'); }
      else if (s.cluster === 'medium') priority += 15;
      
      if (s.attendancePercentage < 75) { priority += 25; reasons.push(`Attendance critical: ${s.attendancePercentage}%`); }
      else if (s.attendancePercentage < 85) { priority += 10; reasons.push(`Attendance warning: ${s.attendancePercentage}%`); }
      
      if (s.academicHealthScore < 40) { priority += 25; reasons.push(`Health score low: ${s.academicHealthScore}/100`); }
      else if (s.academicHealthScore < 60) priority += 10;
      
      if (s.moodToday && s.moodToday <= 2) { priority += 10; reasons.push('Mood: stressed/sad'); }
      
      return { ...s.toObject(), priorityScore: priority, reasons };
    });
    
    const queue = scored.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5);
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/scm/:id/cluster-view
router.get('/:id/cluster-view', protect, async (req, res) => {
  try {
    const students = await Student.find({ scmId: req.params.id });
    
    const clusters = {
      top: students.filter(s => s.cluster === 'top'),
      medium: students.filter(s => s.cluster === 'medium'),
      below: students.filter(s => s.cluster === 'below')
    };
    
    res.json(clusters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/scm/:id/department-analytics
router.get('/:id/department-analytics', protect, async (req, res) => {
  try {
    const students = await Student.find({ scmId: req.params.id });
    
    const totalStudents = students.length;
    const avgHealthScore = students.reduce((a, s) => a + s.academicHealthScore, 0) / totalStudents;
    const avgAttendance = students.reduce((a, s) => a + s.attendancePercentage, 0) / totalStudents;
    
    const clusterDist = {
      top: students.filter(s => s.cluster === 'top').length,
      medium: students.filter(s => s.cluster === 'medium').length,
      below: students.filter(s => s.cluster === 'below').length
    };
    
    const dropoutRisk = students.filter(s => s.academicHealthScore < 40 || s.attendancePercentage < 65).length;
    
    res.json({
      totalStudents,
      avgHealthScore: Math.round(avgHealthScore),
      avgAttendance: Math.round(avgAttendance),
      clusterDist,
      dropoutRisk,
      dropoutRiskPercentage: Math.round((dropoutRisk / totalStudents) * 100)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/scm/session/create  
router.post('/session/create', protect, async (req, res) => {
  try {
    const { studentId, sessionType, notes, actionItems, nextSessionDate } = req.body;
    // Session data stored in student notes for now
    const student = await Student.findByIdAndUpdate(studentId, {
      $push: { clusterHistory: { cluster: (await Student.findById(studentId)).cluster, date: new Date(), score: (await Student.findById(studentId)).academicHealthScore } }
    }, { new: true });
    res.json({ message: 'Session recorded', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
