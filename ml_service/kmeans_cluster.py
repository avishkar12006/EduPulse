"""
EduPulse ML Service — K-Means Student Clustering
Uses scikit-learn for real multi-feature clustering.
Assigns students to top / medium / below clusters.
"""
import numpy as np
import requests
import os

try:
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️  scikit-learn not installed. Using heuristic clustering fallback.")


BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:8000')


class StudentClusterer:
    def __init__(self, n_clusters: int = 3):
        self.n_clusters = n_clusters
        self.scaler     = None
        self.model      = None
        self._init_model()

    def _init_model(self):
        if SKLEARN_AVAILABLE:
            self.scaler = StandardScaler()
            self.model  = KMeans(
                n_clusters=self.n_clusters,
                random_state=42,
                n_init=10,
                max_iter=300,
            )

    # ── Feature extraction ────────────────────────────────────────────────

    def prepare_features(self, students: list) -> np.ndarray:
        """
        Extract 8-dimensional feature vector per student.
        Features are designed to capture academic, behavioural, and wellness signals.
        """
        features = []
        for s in students:
            features.append([
                float(s.get('gradeAverage', 0)),           # Academic output
                float(s.get('gradeTrend', 0)),             # Improvement rate (-10 to +10)
                float(s.get('attendancePercentage', 0)),   # Class presence
                float(s.get('assignmentCompletion', 0)),   # Task completion
                float(s.get('averageMoodScore', 3)) * 20,  # Wellness (1-5 → 0-100)
                float(s.get('loginFrequency', 0)),         # Platform engagement
                float(s.get('sessionDuration', 0)),        # Time on platform (mins)
                float(s.get('streakDays', 0)),             # Consistency streak
            ])
        return np.array(features, dtype=float)

    # ── Main cluster function ─────────────────────────────────────────────

    def cluster(self, students: list) -> list:
        """
        Assign each student to a cluster (top / medium / below).
        Uses K-Means with StandardScaler normalization.
        Clusters are labeled by grade average of the centroid (highest = top).
        """
        if len(students) < 3:
            return self.fallback_cluster(students)

        features = self.prepare_features(students)

        if not SKLEARN_AVAILABLE:
            return self._heuristic_cluster(students, features)

        try:
            scaled = self.scaler.fit_transform(features)
            labels = self.model.fit_predict(scaled)

            # Rank clusters by centroid grade average (feature index 0)
            cluster_grade = {}
            for i in range(self.n_clusters):
                mask = labels == i
                cluster_grade[i] = float(features[mask, 0].mean()) if mask.any() else 0

            sorted_clusters = sorted(cluster_grade.items(), key=lambda x: x[1])
            label_map = {
                sorted_clusters[2][0]: 'top',
                sorted_clusters[1][0]: 'medium',
                sorted_clusters[0][0]: 'below',
            }

            # Compute confidence (distance to nearest centroid, inverted)
            distances = self.model.transform(scaled)
            results   = []
            for i, student in enumerate(students):
                cluster_label = label_map[int(labels[i])]
                confidence    = float(1 / (1 + distances[i].min()))  # 0-1, higher = more confident
                results.append({
                    'studentId':   str(student.get('_id', '')),
                    'cluster':     cluster_label,
                    'confidence':  round(confidence, 3),
                    'score':       round(float(features[i, 0]), 1),
                })
            return results

        except Exception as e:
            print(f"K-Means error: {e}")
            return self._heuristic_cluster(students, features)

    # ── Heuristic fallback (no sklearn) ──────────────────────────────────

    def _heuristic_cluster(self, students: list, features: np.ndarray) -> list:
        """Simple percentile-based clustering when sklearn is unavailable."""
        scores = features[:, 0]  # Use grade average
        p33    = np.percentile(scores, 33)
        p66    = np.percentile(scores, 66)

        results = []
        for i, student in enumerate(students):
            score   = scores[i]
            cluster = 'top' if score >= p66 else ('medium' if score >= p33 else 'below')
            results.append({
                'studentId':  str(student.get('_id', '')),
                'cluster':    cluster,
                'confidence': 0.7,
                'score':      round(float(score), 1),
            })
        return results

    # ── Fallback for tiny cohorts (<3 students) ───────────────────────────

    def fallback_cluster(self, students: list) -> list:
        """For cohorts smaller than n_clusters, use simple grade threshold."""
        results = []
        for s in students:
            grade = float(s.get('gradeAverage', 50))
            cluster = 'top' if grade >= 75 else ('medium' if grade >= 50 else 'below')
            results.append({
                'studentId':  str(s.get('_id', '')),
                'cluster':    cluster,
                'confidence': 1.0,
                'score':      grade,
            })
        return results

    # ── Single student risk assessment ────────────────────────────────────

    def assess_single(self, student: dict) -> dict:
        """Assess individual student risk without clustering the whole cohort."""
        grade      = float(student.get('gradeAverage', 50))
        attendance = float(student.get('attendancePercentage', 75))
        mood       = float(student.get('averageMoodScore', 3))
        streak     = float(student.get('streakDays', 0))

        # Weighted risk score (0-100, lower is worse)
        risk_score = (
            grade      * 0.40 +
            attendance * 0.30 +
            mood  * 20 * 0.15 +
            min(streak, 30) / 30 * 100 * 0.15
        )

        cluster    = 'top' if risk_score >= 75 else ('medium' if risk_score >= 50 else 'below')
        risk_level = 'low' if risk_score >= 75 else ('moderate' if risk_score >= 50 else 'high')

        factors = []
        if grade      < 60:  factors.append('Low grade average')
        if attendance < 75:  factors.append('Below attendance threshold')
        if mood       < 2.5: factors.append('Consistently low mood')
        if streak     < 3:   factors.append('Low platform engagement')

        return {
            'cluster':       cluster,
            'riskScore':     round(risk_score, 1),
            'riskLevel':     risk_level,
            'riskFactors':   factors,
            'confidence':    0.85 if SKLEARN_AVAILABLE else 0.6,
        }

    # ── Save results back to MongoDB (via backend API) ────────────────────

    def save_results(self, batch_id: str, results: list, token: str) -> bool:
        """POST cluster results back to the Node.js backend."""
        try:
            resp = requests.post(
                f"{BACKEND_URL}/api/cluster/save",
                json={'batchId': batch_id, 'results': results},
                headers={'Authorization': f'Bearer {token}'},
                timeout=15
            )
            return resp.status_code == 200
        except Exception as e:
            print(f"Failed to save cluster results: {e}")
            return False
