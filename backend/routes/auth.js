const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, pin, language } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, pin, role, language });

    // Create student profile if applicable
    if (role === 'college_student' || role === 'school_student') {
      const student = await Student.create({
        userId: user._id,
        name: user.name,
        rollNumber: `EP${Date.now().toString().slice(-6)}`,
        class: role === 'college_student' ? 'college' : req.body.class || '9'
      });
      user.studentId = student._id;
      await user.save();
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, pin, role } = req.body;
    
    let user;
    
    // PIN login for young school students
    if (pin && !email) {
      user = await User.findOne({ pin, role: 'school_student' });
      if (!user) return res.status(401).json({ message: 'Invalid PIN' });
    } else {
      user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });
      
      const isMatch = await user.matchPassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    // Fetch student data if applicable
    let studentData = null;
    if (user.studentId) {
      studentData = await Student.findById(user.studentId);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      language: user.language,
      studentId: user.studentId,
      parentOf: user.parentOf,
      studentData,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    let studentData = null;
    if (user.studentId) {
      studentData = await Student.findById(user.studentId);
    }
    
    res.json({ ...user.toObject(), studentData });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
