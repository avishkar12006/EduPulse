const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  pin: { type: String }, // For young school students (Classes 3-8)
  password: { type: String },
  role: {
    type: String,
    enum: ['college_student', 'school_student', 'parent', 'scm', 'admin'],
    required: true
  },
  avatar: { type: String, default: '' },
  language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  parentOf: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
