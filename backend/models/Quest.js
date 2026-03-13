const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  type:        { type: String, enum: ['daily', 'weekly', 'milestone', 'nipun'], required: true },
  subject:     { type: String },
  ageGroup:    { type: String, enum: ['3-5', '6-8', '9-12'], required: true },
  xpReward:    { type: Number, default: 50 },
  dueDate:     { type: Date },
  icon:        { type: String, default: '⭐' },
  // NIPUN competency this quest maps to (Class 3-5 only)
  nipunCompetency: {
    type: String,
    enum: ['reading', 'numberSense', 'oralComm', ''],
    default: '',
  },
  completionCriteria: { type: String },
  isActive: { type: Boolean, default: true },
  // Per-student completion status stored separately to avoid bloat
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);
