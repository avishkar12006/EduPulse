const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  alertType: {
    type: String,
    enum: ['performance', 'attendance', 'mood', 'cluster_change', 'login_inactive'],
    required: true
  },
  triggerReason: { type: String, required: true },
  emailSubject: { type: String },
  emailContent: { type: String },
  sentAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },
  isRead: { type: Boolean, default: false },
  parentResponse: { type: String },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
