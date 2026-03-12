const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rollNumber: { type: String, unique: true },
  institution: { type: String, default: 'Demo College' },
  department: { type: String },
  semester: { type: Number },
  class: { type: String }, // '3'-'12' or 'college'
  section: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentEmail: { type: String },  // direct email for alerts (no join needed)
  scmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  academicHealthScore: { type: Number, default: 50, min: 0, max: 100 },
  cluster: { type: String, enum: ['top', 'medium', 'below'], default: 'medium' },
  clusterHistory: [{
    cluster: String,
    date: Date,
    score: Number
  }],
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'flexible'],
    default: 'flexible'
  },
  attendancePercentage: { type: Number, default: 100 },
  streakDays: { type: Number, default: 0 },
  xpPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{
    id: String,
    name: String,
    icon: String,
    category: String,
    earnedAt: Date
  }],
  placementReadinessScore: { type: Number, default: 0 },
  moodToday: { type: Number, min: 1, max: 5 },
  lastMoodDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
