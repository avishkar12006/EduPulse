const mongoose = require('mongoose');

const moodTimelineSchema = new mongoose.Schema({
  timestamp:     { type: Date, default: Date.now },
  mood:          { type: String, required: true },  // e.g. 'engaged', 'focused', 'struggling'
  numericScore:  { type: Number, min: 1, max: 5, default: 3 },
  source:        { type: String, enum: ['checkin', 'opencv', 'manual'], default: 'checkin' },
  frameBase64:   { type: String, select: false },   // raw frame, excluded by default
  adjustmentMade: { type: String },                 // what the system did in response
}, { _id: false });

const moodSessionSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  sessionType:  { type: String, enum: ['study', 'class', 'free', 'exam'], default: 'study' },
  startTime:    { type: Date, default: Date.now },
  endTime:      { type: Date },
  durationMins: { type: Number, default: 0 },

  moodTimeline: [moodTimelineSchema],
  averageMood:  { type: String, default: 'focused' },
  avgNumericScore: { type: Number, default: 3 },
  dominantMood: { type: String, default: 'focused' },
  engagementScore: { type: Number, min: 0, max: 100, default: 50 },

  // Content adaptations made during session
  contentAdjustmentsMade: [{
    at: Date, action: String, reason: String,
  }],

  // Alert tracking
  teacherAlerted:    { type: Boolean, default: false },
  teacherAlertedAt:  { type: Date },
  alertReason:       { type: String },
  parentAlerted:     { type: Boolean, default: false },

  // Frustration tracking (consecutive frames)
  frustratedFrames:   { type: Number, default: 0 },
  strugglingMinutes:  { type: Number, default: 0 },

  // Session summary (populated at end)
  summary: { type: String },
  recommendedDifficulty: { type: String, enum: ['easier', 'same', 'harder'], default: 'same' },
  moodDistribution: {
    engaged:     { type: Number, default: 0 },
    focused:     { type: Number, default: 0 },
    struggling:  { type: Number, default: 0 },
    anxious:     { type: Number, default: 0 },
    bored:       { type: Number, default: 0 },
    frustrated:  { type: Number, default: 0 },
    curious:     { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('MoodSession', moodSessionSchema);
