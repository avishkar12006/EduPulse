const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// ── Pure JS K-Means (k=3) ─────────────────────────────
// Features: [academicHealthScore, attendancePercentage]
function kMeans(data, k = 3, maxIter = 20) {
  if (data.length < k) return data.map((_, i) => i % k);

  // Normalize to 0–1
  const normalize = (val, min, max) => max === min ? 0.5 : (val - min) / (max - min);
  const scores = data.map(d => d.academicHealthScore ?? 50);
  const attends = data.map(d => d.attendancePercentage ?? 75);
  const minS = Math.min(...scores), maxS = Math.max(...scores);
  const minA = Math.min(...attends), maxA = Math.max(...attends);

  const points = data.map(d => [
    normalize(d.academicHealthScore ?? 50, minS, maxS),
    normalize(d.attendancePercentage ?? 75, minA, maxA)
  ]);

  // Seed centroids: low, mid, high by score
  const sorted = [...points].map((p, i) => ({ p, i })).sort((a, b) => a.p[0] - b.p[0]);
  let centroids = [
    sorted[0].p,
    sorted[Math.floor(sorted.length / 2)].p,
    sorted[sorted.length - 1].p
  ];

  let assignments = new Array(data.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign each point to nearest centroid
    const newAssign = points.map(p => {
      let minDist = Infinity, best = 0;
      centroids.forEach((c, ci) => {
        const d = Math.hypot(p[0] - c[0], p[1] - c[1]);
        if (d < minDist) { minDist = d; best = ci; }
      });
      return best;
    });

    // Recompute centroids
    const newCentroids = Array.from({ length: k }, (_, ci) => {
      const clusterPts = points.filter((_, pi) => newAssign[pi] === ci);
      if (!clusterPts.length) return centroids[ci];
      const mean = clusterPts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
      return [mean[0] / clusterPts.length, mean[1] / clusterPts.length];
    });

    // Check convergence
    const moved = centroids.some((c, ci) =>
      Math.hypot(c[0] - newCentroids[ci][0], c[1] - newCentroids[ci][1]) > 0.0001
    );
    assignments = newAssign;
    centroids = newCentroids;
    if (!moved) break;
  }

  return { assignments, centroids };
}

// Map centroid index → cluster name (sorted by centroid score)
function mapClusters(assignments, centroids) {
  // Sort centroids by x (academicHealthScore) ascending: 0=below, 1=medium, 2=top
  const order = centroids.map((c, i) => ({ i, score: c[0] + c[1] }))
    .sort((a, b) => a.score - b.score)
    .map(o => o.i);
  const names = { [order[0]]: 'below', [order[1]]: 'medium', [order[2]]: 'top' };
  return assignments.map(a => names[a]);
}

// POST /api/cluster/run — no auth (demo-safe)
router.post('/run', async (req, res) => {
  try {
    const students = await Student.find({}).select(
      'name academicHealthScore attendancePercentage cluster clusterHistory'
    );

    if (!students.length) {
      return res.status(404).json({ message: 'No students found. Run seed.js first.' });
    }

    const { assignments, centroids } = kMeans(students, 3);
    const clusterNames = mapClusters(assignments, centroids);

    // Update each student
    const now = new Date();
    const updates = students.map(async (s, i) => {
      const newCluster = clusterNames[i];
      const changed = s.cluster !== newCluster;
      await Student.findByIdAndUpdate(s._id, {
        cluster: newCluster,
        $push: changed ? {
          clusterHistory: { cluster: newCluster, date: now, score: s.academicHealthScore }
        } : undefined
      });
      return { id: s._id, name: s.name, cluster: newCluster, score: s.academicHealthScore, attendance: s.attendancePercentage };
    });

    const results = await Promise.all(updates);

    // Group by cluster for response
    const grouped = { top: [], medium: [], below: [] };
    results.forEach(r => grouped[r.cluster].push(r));

    res.json({
      success: true,
      message: `K-Means clustering complete. ${students.length} students assigned.`,
      summary: {
        top: grouped.top.length,
        medium: grouped.medium.length,
        below: grouped.below.length
      },
      clusters: grouped,
      centroids,
      timestamp: now
    });
  } catch (err) {
    console.error('Cluster error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cluster/status — current cluster state
router.get('/status', async (req, res) => {
  try {
    const students = await Student.find({}).select('name academicHealthScore attendancePercentage cluster');
    const grouped = { top: [], medium: [], below: [] };
    students.forEach(s => {
      if (grouped[s.cluster]) grouped[s.cluster].push({
        name: s.name, score: s.academicHealthScore, attendance: s.attendancePercentage
      });
    });
    res.json({ clusters: grouped, total: students.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
