const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  return transporter;
}

async function sendAlertEmail({ to, subject, content, studentName, scmName, scmEmail }) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0A1628 0%, #1a3a6b 100%); padding: 32px 24px; text-align: center; }
    .header h1 { color: #00BFFF; font-size: 28px; margin: 0 0 4px; font-family: Georgia, serif; }
    .header p { color: rgba(255,255,255,0.7); margin: 0; font-size: 14px; }
    .student-badge { background: rgba(0,191,255,0.15); border: 1px solid #00BFFF; border-radius: 8px; padding: 12px 20px; margin: 0 24px; transform: translateY(-20px); text-align: center; }
    .student-badge h2 { color: #0A1628; margin: 0; font-size: 20px; }
    .content { padding: 8px 24px 24px; }
    .section { background: #f8f9fa; border-left: 4px solid #00BFFF; border-radius: 0 8px 8px 0; padding: 16px; margin: 16px 0; }
    .section h3 { color: #0A1628; margin: 0 0 8px; font-size: 15px; }
    .section p { color: #444; line-height: 1.6; margin: 0; font-size: 14px; }
    .cta { display: flex; gap: 12px; margin: 24px 0; flex-wrap: wrap; }
    .btn { flex: 1; min-width: 150px; padding: 12px 20px; border-radius: 8px; text-align: center; text-decoration: none; font-weight: 600; font-size: 14px; }
    .btn-primary { background: #2563EB; color: white; }
    .btn-secondary { background: white; color: #2563EB; border: 2px solid #2563EB; }
    .footer { background: #f8f9fa; padding: 20px 24px; text-align: center; border-top: 1px solid #e9ecef; }
    .footer p { color: #888; font-size: 12px; margin: 4px 0; }
    .scm-info { background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px 16px; margin: 16px 0; }
    .scm-info h4 { margin: 0 0 6px; color: #444; font-size: 13px; }
    .scm-info p { color: #666; font-size: 13px; margin: 2px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EduPulse 🎓</h1>
      <p>Know Every Student. Guide Every Future.</p>
    </div>
    <div class="student-badge">
      <h2>📊 Academic Update: ${studentName}</h2>
    </div>
    <div class="content">
      <div style="white-space: pre-wrap; color: #333; line-height: 1.8; font-size: 14px;">${content}</div>
      
      ${scmName ? `
      <div class="scm-info">
        <h4>Your Student's Counselor & Mentor (SCM):</h4>
        <p>👤 ${scmName}</p>
        ${scmEmail ? `<p>📧 ${scmEmail}</p>` : ''}
      </div>` : ''}
      
      <div class="cta">
        <a href="http://localhost:5174/parent" class="btn btn-primary">📱 View Full Dashboard</a>
        <a href="http://localhost:5174/parent" class="btn btn-secondary">📅 Book a Meeting</a>
      </div>
    </div>
    <div class="footer">
      <p>EduPulse | Hawkathon 2026 | Aligned with NEP 2020 & UN SDG 4</p>
      <p>This is an automated alert from EduPulse Academic Monitoring System.</p>
    </div>
  </div>
</body>
</html>
  `;

  await getTransporter().sendMail({
    from: `"EduPulse 🎓" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html
  });
  
  console.log(`✅ Alert email sent to ${to}`);
}

module.exports = { sendAlertEmail };
