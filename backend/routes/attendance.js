const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// POST /api/attendance/mark — mark single attendance record
router.post('/mark', protect, async (req, res) => {
  try {
    const { studentId, subject, subjectCode, date, status, classId, section } = req.body;
    
    const existing = await Attendance.findOne({ studentId, subject, date: new Date(date) });
    if (existing) {
      existing.status = status;
      existing.recordedBy = req.user._id;
      await existing.save();
      return res.json(existing);
    }
    
    const record = await Attendance.create({
      studentId, subject, subjectCode, date: new Date(date), status,
      recordedBy: req.user._id, classId, section
    });

    // Recalculate attendance percentage for this student+subject
    await recalculateAttendance(studentId, subject);

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/attendance/bulk-mark — mark entire class at once
router.post('/bulk-mark', protect, async (req, res) => {
  try {
    const { records, subject, subjectCode, date, classId, section } = req.body;
    // records = [{ studentId, status }]
    
    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, subject, date: new Date(date) },
        update: {
          $set: {
            studentId: r.studentId, subject, subjectCode,
            date: new Date(date), status: r.status,
            recordedBy: req.user._id, classId, section
          }
        },
        upsert: true
      }
    }));
    
    await Attendance.bulkWrite(ops);
    
    // Recalculate for all students
    for (const r of records) {
      await recalculateAttendance(r.studentId, subject);
    }
    
    res.json({ message: `Marked attendance for ${records.length} students`, count: records.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/attendance/:studentId — all attendance records
router.get('/:studentId', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/attendance/:studentId/summary — aggregated per-subject summary
router.get('/:studentId/summary', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId });
    
    const bySubject = {};
    records.forEach(r => {
      if (!bySubject[r.subject]) {
        bySubject[r.subject] = { subject: r.subject, subjectCode: r.subjectCode, total: 0, present: 0, absent: 0, late: 0 };
      }
      bySubject[r.subject].total++;
      bySubject[r.subject][r.status]++;
    });
    
    const summary = Object.values(bySubject).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round(((s.present + s.late * 0.5) / s.total) * 100) : 0
    }));
    
    const overall = records.length > 0
      ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100)
      : 100;
    
    res.json({ summary, overall });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/attendance/:studentId/calendar — calendar view data
router.get('/:studentId/calendar', protect, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    const records = await Attendance.find({
      studentId: req.params.studentId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const calendar = {};
    records.forEach(r => {
      const key = r.date.toISOString().split('T')[0];
      if (!calendar[key]) calendar[key] = [];
      calendar[key].push({ subject: r.subject, status: r.status });
    });
    
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/attendance/class/:classId/date/:date — for SCM to view attendance of class on a date
router.get('/class/:classId/date/:date', protect, async (req, res) => {
  try {
    const records = await Attendance.find({
      classId: req.params.classId,
      date: new Date(req.params.date)
    }).populate('studentId', 'name rollNumber');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function recalculateAttendance(studentId, subject) {
  const allRecords = await Attendance.find({ studentId, subject });
  const total = allRecords.length;
  const present = allRecords.filter(r => r.status === 'present').length;
  const pct = total > 0 ? Math.round((present / total) * 100) : 100;
  
  // Update student overall attendance
  const allStudentRecords = await Attendance.find({ studentId });
  const totalAll = allStudentRecords.length;
  const presentAll = allStudentRecords.filter(r => r.status === 'present').length;
  const overallPct = totalAll > 0 ? Math.round((presentAll / totalAll) * 100) : 100;
  
  await Student.findByIdAndUpdate(studentId, { attendancePercentage: overallPct });
  return pct;
}

module.exports = router;
