const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const User    = require('../models/User');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const { sendOtpEmail } = require('../services/emailService');

// ── Helpers ────────────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Roles that CANNOT self-register — must be seeded or added by an admin
const ADMIN_ONLY_ROLES = ['admin', 'scm'];

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, role,
      pin, language, department, institution, class: cls,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const assignedRole = role || 'college_student';

    // Block admin / scm self-registration
    if (ADMIN_ONLY_ROLES.includes(assignedRole)) {
      return res.status(403).json({
        message: 'Admin and SCM accounts must be created by an institution administrator. Please contact your admin.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      pin,
      role: assignedRole,
      language: language || 'en',
      avatar: assignedRole === 'college_student' ? '🎓'
             : assignedRole === 'school_student'  ? '🏫'
             : assignedRole === 'parent'           ? '👨‍👩‍👧'
             : '⚡',
    });

    // Auto-create student profile for student roles
    let studentData = null;
    if (assignedRole === 'college_student' || assignedRole === 'school_student') {
      const rollNumber = `EP${Date.now().toString().slice(-6)}`;
      studentData = await Student.create({
        userId: user._id,
        name: user.name,
        rollNumber,
        institution: institution || 'EduPulse Institution',
        department: department || (assignedRole === 'college_student' ? 'General' : undefined),
        class: assignedRole === 'school_student' ? (cls || '9') : 'college',
        semester: 1,
        section: 'A',
        academicHealthScore: 60,
        attendancePercentage: 0,
        cluster: 'medium',
        streakDays: 0,
        xpPoints: 0,
        level: 1,
      });
      user.studentId = studentData._id;
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      language: user.language,
      studentId: user.studentId,
      studentData,
      token,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, pin, role } = req.body;

    let user;

    // PIN login for young school students
    if (pin && !email) {
      user = await User.findOne({ pin, role: 'school_student' });
      if (!user) return res.status(401).json({ message: 'Invalid PIN' });
    } else {
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      user = await User.findOne({ email: email.toLowerCase() });

      // ── DEMO BYPASS: auto-create @demo.com accounts on first login ──────
      const emailPrefix = email.toLowerCase().split('@')[0]; // handles parent.aarav etc.
      const DEMO_MAP = {
        // prefix : [role, name, class/null, healthScore, attendance, cluster]
        'scm':          ['scm',             'Prof. Ananya Sharma',    null, null, null,  null],
        'admin':        ['admin',           'Admin User',             null, null, null,  null],
        'parent.aarav': ['parent',          "Suresh Sharma (Aarav's Dad)", null, null, null, null],
        'parent.priya': ['parent',          "Meena Nair (Priya's Mom)",   null, null, null, null],
        'aarav':        ['college_student', 'Aarav Sharma',           'college', 52,  68,  'below'],
        'priya':        ['college_student', 'Priya Nair',             'college', 91,  94,  'top'],
        'rohan':        ['college_student', 'Rohan Mehta',            'college', 68,  72,  'medium'],
        'sneha':        ['college_student', 'Sneha Patil',            'college', 74,  79,  'medium'],
        'vikram':       ['college_student', 'Vikram Singh',           'college', 60,  75,  'medium'],
        'aryan':        ['school_student',  'Aryan Verma',            '5',  75, 82, 'top'],
        'anika':        ['school_student',  'Anika Gupta',            '4',  88, 90, 'top'],
        'riya':         ['school_student',  'Riya Joshi',             '7',  65, 70, 'medium'],
        'dev':          ['school_student',  'Dev Patel',              '10', 71, 76, 'medium'],
        'kabir':        ['school_student',  'Kabir Singh',            '11', 58, 65, 'below'],
      };
      const demoAvatars = {
        school_student:'🏫', college_student:'🎓', parent:'👨‍👩‍👧', scm:'👩‍🏫', admin:'🛡️'
      };
      const isDemo = email.toLowerCase().endsWith('@demo.com') && password === 'demo123';

      if (isDemo && DEMO_MAP[emailPrefix]) {
        const [demoRole, demoName, demoClass, demoHealth, demoAttend, demoCluster] = DEMO_MAP[emailPrefix];
        // If existing user has wrong role, delete and recreate
        if (user && user.role !== demoRole) {
          await User.deleteOne({ _id: user._id });
          user = null;
        }
        if (!user) {
          user = await User.create({
            name: demoName,
            email: email.toLowerCase(),
            password,
            role: demoRole,
            avatar: demoAvatars[demoRole] || '⚡',
            language: 'en',
            isActive: true,
          });
          if (demoRole === 'school_student' || demoRole === 'college_student') {
            const rollNumber = `DEMO${Date.now().toString().slice(-4)}`;
            const studentData = await Student.create({
              userId: user._id,
              name: user.name,
              rollNumber,
              institution: 'EduPulse Demo Institution',
              class: demoClass || 'college',
              semester: 1,
              section: 'A',
              academicHealthScore: demoHealth || 65,
              attendancePercentage: demoAttend || 75,
              cluster: demoCluster || 'medium',
              streakDays: 3,
              xpPoints: 150,
              level: 2,
            });
            user.studentId = studentData._id;
            await user.save();
          }
        }
      }
      // ── END DEMO BYPASS ──────────────────────────────────────────────────



      // Use same error for wrong email AND wrong password (prevent user enumeration)
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });

      const isMatch = await user.matchPassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

      // ── Role check ──────────────────────────────────────────────────────
      // If the client sent a role (login form role selector), verify it matches
      // the account's actual role. Use same generic error to avoid leaking info.
      if (role && user.role !== role) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }


    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact support.' });
    }

    user.lastLogin = new Date();
    await user.save();

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
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetOtp -resetOtpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let studentData = null;
    if (user.studentId) {
      studentData = await Student.findById(user.studentId);
    }

    res.json({ ...user.toObject(), studentData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/auth/refresh-token ────────────────────────────────────────────
// Call with Authorization: Bearer <existing valid token> → get a fresh token
router.post('/refresh-token', protect, async (req, res) => {
  try {
    const newToken = generateToken(req.user._id);
    res.json({ token: newToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/auth/forgot-password ─────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond with success to avoid user enumeration
    if (!user) {
      return res.json({ message: 'If an account exists for this email, an OTP has been sent.' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store hashed OTP + 10-minute expiry
    user.resetOtp       = await bcrypt.hash(otp, 10);
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp, user.name);

    res.json({ message: 'If an account exists for this email, an OTP has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// ── POST /api/auth/reset-password ──────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > user.resetOtpExpiry) {
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // Update password and clear OTP
    user.password       = newPassword;          // pre-save hook will hash it
    user.resetOtp       = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    // Return fresh token so the user is immediately logged in
    let studentData = null;
    if (user.studentId) {
      studentData = await Student.findById(user.studentId);
    }

    res.json({
      message: 'Password reset successfully.',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      language: user.language,
      studentId: user.studentId,
      studentData,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── PUT /api/auth/update-profile ────────────────────────────────────────────
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, avatar, language, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (name)     user.name     = name.trim();
    if (avatar)   user.avatar   = avatar;
    if (language) user.language = language;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }
      user.password = newPassword; // pre-save hook hashes it
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      language: user.language,
      studentId: user.studentId,
      token: generateToken(user._id), // fresh token with updated info
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
