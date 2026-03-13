const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const emailService = require('../services/emailService');
const geminiService = require('../services/geminiService');

// POST /api/alerts/demo-alert (no auth — Hawkathon demo)
router.post('/demo-alert', async (req, res) => {
  try {
    const { studentName, parentEmail, parentName = 'Parent/Guardian', reason,
      alertType = 'attendance', attendance = 0, healthScore = 0, scmName = 'Dr. Rajesh Kumar' } = req.body;

    if (!studentName || !parentEmail) {
      return res.status(400).json({ message: 'studentName and parentEmail are required' });
    }

    const subject = `🚨 EduPulse Alert: ${studentName} — Attention Required`;

    let emailContent;
    try {
      emailContent = await geminiService.generateParentAlert({
        studentName, parentName, semester: 3, department: 'Computer Science',
        triggerReason: reason || `${studentName} requires academic intervention.`,
        alertType, attendancePercentage: attendance, academicHealthScore: healthScore, language: 'en',
      });
    } catch {
      emailContent = `Dear ${parentName},\n\nThis is an important update about ${studentName}'s academic progress.\n\nReason: ${reason || 'Academic intervention required.'}\nAttendance: ${attendance}% | Health Score: ${healthScore}/100\n\nPlease contact ${scmName} for a meeting.\n\nEduPulse Team`;
    }

    await emailService.sendAlertEmail({
      to: parentEmail, subject, content: emailContent, studentName, scmName, scmEmail: 'scm@demo.com',
    });

    res.json({ success: true, message: `📧 Alert sent to ${parentEmail}`, to: parentEmail, student: studentName });
  } catch (err) {
    console.error('Demo alert error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/alerts/send (protected)
router.post('/send', protect, async (req, res) => {
  try {
    const { studentId, alertType, triggerReason, severity, language } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const parent = await User.findById(student.parentId);
    const scm = await User.findById(student.scmId);
    const emailSubject = `EduPulse Alert: ${student.name} — ${alertType}`;

    let emailContent;
    try {
      emailContent = await geminiService.generateParentAlert({
        studentName: student.name, parentName: parent?.name || 'Parent',
        semester: student.semester, department: student.department,
        triggerReason, alertType,
        attendancePercentage: student.attendancePercentage,
        academicHealthScore: student.academicHealthScore, language: language || 'en',
      });
    } catch {
      emailContent = `Dear ${parent?.name || 'Parent'},\n\n${triggerReason}\n\nEduPulse Team`;
    }

    const alert = await Alert.create({
      studentId, alertType, triggerReason, severity: severity || 'medium',
      parentId: student.parentId, scmId: student.scmId,
      emailSubject, emailContent, sentAt: new Date(),
    });

    const toEmail = parent?.email || student.parentEmail;
    if (toEmail) {
      try {
        await emailService.sendAlertEmail({ to: toEmail, subject: emailSubject, content: emailContent, studentName: student.name, scmName: scm?.name, scmEmail: scm?.email });
        alert.deliveredAt = new Date();
        await alert.save();
      } catch (e) { console.error('Email error:', e.message); }
    }

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/alerts/:parentId
router.get('/:parentId', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ parentId: req.params.parentId })
      .populate('studentId', 'name rollNumber department semester')
      .sort({ sentAt: -1 });
    res.json(alerts);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// GET /api/alerts/student/:studentId
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ studentId: req.params.studentId }).sort({ sentAt: -1 });
    res.json(alerts);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// PUT /api/alerts/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(alert);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
