const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function createTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return null;
}

async function gemini(prompt) {
  try {
    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch { return null; }
}

// ── Age-appropriate subjects for email ─────────────────────────────────────

function getSubjectLine(alertType, studentName, language) {
  const subjects = {
    en: {
      attendance:  `📅 Attendance Update: ${studentName}`,
      performance: `📊 Academic Update: ${studentName}`,
      mood:        `💙 Wellness Check: ${studentName}`,
      cluster:     `📈 Academic Progress: ${studentName}`,
      nipun:       `🌟 Learning Milestone: ${studentName}`,
      weekly:      `📋 Weekly Report: ${studentName}`,
      achievement: `🏆 Great News About ${studentName}!`,
    },
    hi: {
      attendance:  `📅 उपस्थिति अपडेट: ${studentName}`,
      performance: `📊 शैक्षणिक अपडेट: ${studentName}`,
      mood:        `💙 भावनात्मक स्थिति: ${studentName}`,
      cluster:     `📈 शैक्षणिक प्रगति: ${studentName}`,
      nipun:       `🌟 निपुण मील का पत्थर: ${studentName}`,
      weekly:      `📋 साप्ताहिक रिपोर्ट: ${studentName}`,
      achievement: `🏆 ${studentName} की शानदार उपलब्धि!`,
    },
    mr: {
      attendance:  `📅 उपस्थिती अपडेट: ${studentName}`,
      performance: `📊 शैक्षणिक अपडेट: ${studentName}`,
      mood:        `💙 भावनिक स्थिती: ${studentName}`,
      cluster:     `📈 शैक्षणिक प्रगती: ${studentName}`,
      nipun:       `🌟 निपुण मैलाचा दगड: ${studentName}`,
      weekly:      `📋 साप्ताहिक अहवाल: ${studentName}`,
      achievement: `🏆 ${studentName} ची उत्तम कामगिरी!`,
    },
  };
  return (subjects[language] || subjects.en)[alertType] || `EduPulse Update: ${studentName}`;
}

// ── Email HTML template ─────────────────────────────────────────────────────

function buildEmailHtml(studentClass, alertType, content, studentName) {
  const classNum = parseInt(studentClass);
  const isYoung  = classNum <= 5;
  const isTeen   = classNum >= 9;

  const headerColor = alertType === 'achievement' ? '#10b981'
    : alertType === 'attendance' ? '#ef4444'
    : alertType === 'mood'       ? '#8b5cf6'
    : '#3b82f6';

  const headerIcon  = alertType === 'achievement' ? '🏆'
    : alertType === 'attendance' ? '📅'
    : alertType === 'mood'       ? '💙'
    : alertType === 'nipun'      ? '⭐'
    : '📊';

  const tagline = isYoung
    ? 'EduPulse — Your Child\'s Happy Learning Companion'
    : isTeen
    ? 'EduPulse — Powering Your Child\'s Academic Future'
    : 'EduPulse — Smart Learning for Growing Minds';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,${headerColor},${headerColor}99);padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">${headerIcon}</div>
      <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);letter-spacing:2px;text-transform:uppercase;">EduPulse School</div>
    </div>
    <!-- Content -->
    <div style="padding:32px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <div style="font-size:12px;color:#94a3b8;">${tagline}</div>
      <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">© 2026 EduPulse. This is an automated message.</div>
    </div>
  </div>
</body>
</html>`;
}

// ── Build alert prompt for Gemini ──────────────────────────────────────────

function buildAlertPrompt(studentName, studentClass, alertType, data, language) {
  const classNum = parseInt(studentClass);
  const first    = studentName.split(' ')[0];
  const langNote = language === 'hi' ? 'Write in simple Hindi.' : language === 'mr' ? 'Write in simple Marathi.' : 'Write in clear English.';

  const toneNote = classNum <= 5
    ? 'Use warm, caring, parent-friendly language. Keep it simple. No scary numbers.'
    : classNum <= 8
    ? 'Use friendly, supportive language with some data.'
    : 'Use professional, data-driven language appropriate for senior school parents.';

  const prompts = {
    attendance: `Write a parent email about ${first}'s attendance: ${data.percentage}% in ${data.subject || 'school'} (minimum required: 75%). ${toneNote} ${langNote} Include: what was noticed, what to do at home, encouragement. 3 short paragraphs. HTML format with <p> tags.`,
    performance: `Write a parent email about ${first}'s academic performance change: from ${data.previousScore}% to ${data.currentScore}% in ${data.subject}. ${toneNote} ${langNote} Include: what changed, why it might have happened, 3 concrete suggestions. HTML format.`,
    mood: `Write a gentle parent email: ${first} has shown low mood/stress for ${data.lowMoodDays || 7}+ days as detected by our wellness system. ${toneNote} ${langNote} Three sections: What we noticed, What you can do at home, What NOT to do. Be sensitive. HTML format.`,
    cluster: `Write a parent email: ${first} has moved to the 'Needs Support' academic cluster. ${toneNote} ${langNote} Be encouraging, not alarming. Include specific action steps. HTML format.`,
    nipun: `Write a parent email about ${first}'s NIPUN Bharat learning milestones for Class ${studentClass}. Reading level: ${data.reading}/5, Number sense: ${data.numberSense}/5. ${toneNote} ${langNote} Simple activities parents can do at home. HTML format.`,
    achievement: `Write a celebratory parent email: ${first} just earned the "${data.badgeName}" achievement badge! ${toneNote} ${langNote} Make it joyful and motivating. HTML format.`,
    weekly: `Write a weekly progress report email for ${first} (Class ${studentClass}). Attendance: ${data.attendance}%, Average score: ${data.average}%, Mood this week: ${data.mood}. ${toneNote} ${langNote} Make it informative and encouraging. HTML format.`,
  };

  return prompts[alertType] || prompts.weekly;
}

// ── Main exported function ─────────────────────────────────────────────────

async function sendSchoolAlert(parentEmail, studentName, studentClass, alertType, data, language = 'en') {
  try {
    const transporter = createTransporter();
    const subject     = getSubjectLine(alertType, studentName, language);

    // Generate age-appropriate content via Gemini
    const prompt  = buildAlertPrompt(studentName, studentClass, alertType, data, language);
    let content   = await gemini(prompt);

    // Fallback content
    if (!content) {
      content = `<p>Dear Parent,</p>
<p>We wanted to share an important update about <strong>${studentName}</strong>. Please log in to your EduPulse dashboard for full details.</p>
<p>If you have questions, please contact your child's teacher.</p>
<p>Warm regards,<br>The EduPulse Team</p>`;
    }

    const html = buildEmailHtml(studentClass, alertType, content, studentName);

    if (!transporter) {
      // Dev fallback
      console.log(`\n📧 [SCHOOL ALERT — dev console]`);
      console.log(`   To: ${parentEmail}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Type: ${alertType} | Class: ${studentClass}`);
      console.log(`   Content preview: ${content.slice(0, 120).replace(/<[^>]+>/g, '')}...\n`);
      return;
    }

    await transporter.sendMail({
      from: `"EduPulse School" <${process.env.EMAIL_USER}>`,
      to:   parentEmail,
      subject,
      html,
    });

    console.log(`✅ School alert sent to ${parentEmail} (${alertType})`);
  } catch (err) {
    console.error(`❌ School alert failed:`, err.message);
    // Don't throw — don't crash the API call because email failed
  }
}

// ── Weekly report batch sender ─────────────────────────────────────────────

async function sendWeeklyReports(students) {
  console.log(`📬 Sending weekly reports to ${students.length} students...`);
  for (const student of students) {
    if (!student.parentEmail) continue;
    const data = {
      attendance: student.attendancePercentage,
      average:    student.gradeAverage,
      mood:       student.moodToday >= 4 ? 'positive' : student.moodToday <= 2 ? 'low' : 'okay',
    };
    await sendSchoolAlert(student.parentEmail, student.name, student.class, 'weekly', data, 'en');
    await new Promise(r => setTimeout(r, 500)); // Throttle
  }
}

module.exports = { sendSchoolAlert, sendWeeklyReports };
