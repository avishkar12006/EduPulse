const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  mood: { type: Number, min: 1, max: 5, required: true },
  label: {
    type: String,
    enum: ['stressed', 'sad', 'okay', 'good', 'excellent'],
    required: true
  },
  note: { type: String, maxlength: 500 },
  isShared: { type: Boolean, default: false },
  sessionDuration: { type: Number, default: 0 },
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Mood', moodSchema);
