const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, required: true },
  subject: { type: String, required: true },
  subjectCode: { type: String },
  internalMarks: { type: Number, default: 0 },
  externalMarks: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  maxMarks: { type: Number, default: 100 },
  percentage: { type: Number, default: 0 },
  grade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'] },
  competencyLevel: {
    type: String,
    enum: ['notAchieved', 'developing', 'achieved', 'mastered'],
    default: 'developing'
  },
  examDate: { type: Date },
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

gradeSchema.pre('save', function (next) {
  this.percentage = this.maxMarks > 0
    ? Math.round((this.totalMarks / this.maxMarks) * 100)
    : 0;
  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 80) this.grade = 'A';
  else if (this.percentage >= 70) this.grade = 'B+';
  else if (this.percentage >= 60) this.grade = 'B';
  else if (this.percentage >= 50) this.grade = 'C';
  else if (this.percentage >= 40) this.grade = 'D';
  else this.grade = 'F';
  
  if (this.percentage >= 80) this.competencyLevel = 'mastered';
  else if (this.percentage >= 60) this.competencyLevel = 'achieved';
  else if (this.percentage >= 40) this.competencyLevel = 'developing';
  else this.competencyLevel = 'notAchieved';
  
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
