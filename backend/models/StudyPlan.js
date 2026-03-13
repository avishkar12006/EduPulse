const mongoose = require('mongoose');

const dailyBlockSchema = new mongoose.Schema({
  date:        { type: Date, required: true },
  subject:     { type: String, required: true },
  topic:       { type: String, required: true },
  duration:    { type: Number, default: 60 },  // minutes
  priority:    { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  type:        { type: String, enum: ['learn', 'revise', 'practice', 'rest', 'mock'], default: 'learn' },
  completed:   { type: Boolean, default: false },
  completedAt: { type: Date },
  notes:       { type: String },
}, { _id: true });

const studyPlanSchema = new mongoose.Schema({
  studentId:        { type: mongoose.Schema.Types.ObjectId, ref: 'SchoolStudent', required: true },
  generatedAt:      { type: Date, default: Date.now },
  lastRecalibrated: { type: Date },
  examDates: [{
    subject: { type: String, required: true },
    date:    { type: Date, required: true },
    board:   { type: String, default: 'CBSE' },
  }],
  dailyPlan: [dailyBlockSchema],
  totalHoursPlanned:    { type: Number, default: 0 },
  totalHoursCompleted:  { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 },
  geminiPromptSummary:  { type: String },  // Archived prompt for recalibration
  teacherApproved:      { type: Boolean, default: false },
  teacherNotes:         { type: String },
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
