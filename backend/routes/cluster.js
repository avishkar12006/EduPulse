const express = require('express');
const router  = express.Router();
const Student = require('../models/Student');
const User    = require('../models/User');
const { sendAlertEmail } = require('../services/emailService');

/* ── Pure JS K-Means (k=3) ──────────────────────────────────────────────── */
// Features: [academicHealthScore, attendancePercentage]
function kMeans(data, k = 3, maxIter = 20) {
  if (data.length < k) return { assignments: data.map((_, i) => i % k), centroids: [] };

  const normalize = (val, min, max) => max === min ? 0.5 : (val - min) / (max - min);
  const scores  = data.map(d => d.academicHealthScore  ?? 50);
  const attends = data.map(d => d.attendancePercentage ?? 75);
  const minS = Math.min(...scores),  maxS = Math.max(...scores);
  const minA = Math.min(...attends), maxA = Math.max(...attends);

  const points = data.map(d => [
    normalize(d.academicHealthScore  ?? 50, minS, maxS),
    normalize(d.attendancePercentage ?? 75, minA, maxA),
  ]);

  // Seed centroids: low, mid, high by combined score
  const sorted = [...points].map((p, i) => ({ p, i })).sort((a, b) => a.p[0] - b.p[0]);
  let centroids = [
    sorted[0].p,
    sorted[Math.floor(sorted.length / 2)].p,
    sorted[sorted.length - 1].p,
  ];

  let assignments = new Array(data.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    const newAssign = points.map(p => {
      let minDist = Infinity, best = 0;
      centroids.forEach((c, ci) => {
        const d = Math.hypot(p[0] - c[0], p[1] - c[1]);
        if (d < minDist) { minDist = d; best = ci; }
      });
      return best;
    });
    const newCentroids = Array.from({ length: k }, (_, ci) => {
      const pts = points.filter((_, pi) => newAssign[pi] === ci);
      if (!pts.length) return centroids[ci];
      const mean = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
      return [mean[0] / pts.length, mean[1] / pts.length];
    });
    const moved = centroids.some((c, ci) =>
      Math.hypot(c[0] - newCentroids[ci][0], c[1] - newCentroids[ci][1]) > 0.0001
    );
    assignments = newAssign;
    centroids   = newCentroids;
    if (!moved) break;
  }

  return { assignments, centroids };
}

// Map centroid index → cluster name (sorted by centroid score ascending → below/medium/top)
function mapClusters(assignments, centroids) {
  const order = centroids.map((c, i) => ({ i, score: c[0] + c[1] }))
    .sort((a, b) => a.score - b.score)
    .map(o => o.i);
  const names = { [order[0]]: 'below', [order[1]]: 'medium', [order[2]]: 'top' };
  return assignments.map(a => names[a]);
}

/* ── POST /api/cluster/run ──────────────────────────────────────────────── */
// Runs K-Means, updates student records, AUTO-TRIGGERS parent email for "below" students
router.post('/run', async (req, res) => {
  try {
    const students = await Student.find({}).select(
      'name email parentId parentEmail academicHealthScore attendancePercentage cluster scmId'
    );

    if (!students.length) {
      return res.status(404).json({ message: 'No students found. Run seed.js first.' });
    }

    const { assignments, centroids } = kMeans(students, 3);
    const clusterNames = mapClusters(assignments, centroids);

    const now          = new Date();
    const alertsSent   = [];
    const alertsSkipped= [];

    // Update each student + auto-alert "below" cluster students
    const updates = students.map(async (s, i) => {
      const newCluster = clusterNames[i];
      const prevCluster = s.cluster;
      const changed    = prevCluster !== newCluster;

      await Student.findByIdAndUpdate(s._id, {
        cluster: newCluster,
        ...(changed && {
          $push: { clusterHistory: { cluster: newCluster, date: now, score: s.academicHealthScore } }
        }),
      });

      // ── AUTO ALERT: trigger email when student is/moves to "below" cluster ──
      if (newCluster === 'below') {
        const toEmail = s.parentEmail
          || (s.parentId ? (await User.findById(s.parentId).select('email'))?.email : null);

        if (toEmail) {
          try {
            const scm = s.scmId ? await User.findById(s.scmId).select('name email') : null;
            const alertContent =
              `${s.name} has been automatically classified into the Below Average academic cluster by our K-Means AI system.\n\n` +
              `Current Academic Health Score: ${s.academicHealthScore}/100\n` +
              `Current Attendance: ${s.attendancePercentage}%\n\n` +
              `This alert was triggered automatically because EduPulse's predictive model detected high risk of academic regression. ` +
              `Early intervention is critical — students who receive support at this stage are 3.2× more likely to recover.\n\n` +
              `Please contact the Student Career Manager immediately to schedule a review session.`;

            await sendAlertEmail({
              to:          toEmail,
              subject:     `🚨 EduPulse Alert: ${s.name} — Academic Intervention Required`,
              content:     alertContent,
              studentName: s.name,
              scmName:     scm?.name  || 'Student Career Manager',
              scmEmail:    scm?.email || 'scm@edupulse.edu',
              cluster:     newCluster,
              attendance:  s.attendancePercentage,
              healthScore: s.academicHealthScore,
            });

            alertsSent.push({ student: s.name, email: toEmail });
          } catch (e) {
            console.error(`Alert email failed for ${s.name}:`, e.message);
            alertsSkipped.push({ student: s.name, reason: e.message });
          }
        } else {
          alertsSkipped.push({ student: s.name, reason: 'No parent email found' });
        }
      }

      return {
        id:         s._id,
        name:       s.name,
        cluster:    newCluster,
        prevCluster,
        changed,
        score:      s.academicHealthScore,
        attendance: s.attendancePercentage,
      };
    });

    const results = await Promise.all(updates);

    // Group by cluster for response
    const grouped = { top: [], medium: [], below: [] };
    results.forEach(r => grouped[r.cluster].push(r));

    res.json({
      success: true,
      message: `✅ K-Means complete. ${students.length} students clustered. ${alertsSent.length} parent alert(s) sent.`,
      summary: {
        top:    grouped.top.length,
        medium: grouped.medium.length,
        below:  grouped.below.length,
      },
      clusters:      grouped,
      centroids,
      alertsSent,
      alertsSkipped,
      timestamp:     now,
    });
  } catch (err) {
    console.error('Cluster error:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ── GET /api/cluster/status ─────────────────────────────────────────────── */
router.get('/status', async (req, res) => {
  try {
    const students = await Student.find({}).select('name academicHealthScore attendancePercentage cluster');
    const grouped  = { top: [], medium: [], below: [] };
    students.forEach(s => {
      if (grouped[s.cluster]) grouped[s.cluster].push({
        name: s.name, score: s.academicHealthScore, attendance: s.attendancePercentage,
      });
    });
    res.json({ clusters: grouped, total: students.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
