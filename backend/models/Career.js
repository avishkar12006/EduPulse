const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  generatedAt: { type: Date, default: Date.now },
  paths: [{
    title: String,
    industry: String,
    icon: String,
    whyThisStudent: String,
    successProbability: Number,
    strongAreas: [String],
    gapAreas: [String],
    milestones: [{
      month: Number,
      action: String,
      skill: String,
      difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
      resource: String,
      completed: { type: Boolean, default: false },
      completedAt: Date
    }],
    certifications: [{
      name: String,
      link: String,
      cost: String
    }],
    salaryRange: String,
    growthProjection: String
  }],
  selectedPathIndex: { type: Number, default: -1 },
  streamRecommendation: { type: String }, // for Class 9
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Career', careerSchema);
