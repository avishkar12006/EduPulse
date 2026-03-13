"""
EduPulse ML Service — Flask Application
Mounts all ML endpoints: mood analysis, K-Means clustering, adaptive learning
"""
from flask import Flask, request, jsonify
from flask_cors import CORS

from mood_detector  import MoodDetector
from kmeans_cluster import StudentClusterer
from adaptive_engine import AdaptiveEngine

app      = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://localhost:5174'])

detector  = MoodDetector()
clusterer = StudentClusterer(n_clusters=3)
engine    = AdaptiveEngine()


# ── Health check ──────────────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'EduPulse ML Service',
        'version': '1.0.0',
        'endpoints': [
            '/mood/analyze',
            '/mood/session-summary',
            '/cluster/run',
            '/cluster/student',
            '/adaptive/learning-style',
            '/adaptive/difficulty-adjust',
            '/adaptive/recommend-content',
        ],
    })


# ─────────────────────────────────────────────────────────────────────────────
# MOOD ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/mood/analyze', methods=['POST'])
def mood_analyze():
    """
    POST { image: <base64_string> }
    Returns mood + content adjustment instruction.
    """
    data = request.get_json(force=True)
    if not data or 'image' not in data:
        return jsonify({'error': 'Missing image field'}), 400

    frame      = detector.decode_frame(data['image'])
    mood       = detector.analyze_frame(frame)
    adjustment = detector.get_content_adjustment(mood)

    return jsonify({
        'mood':       mood,
        'adjustment': adjustment,
        'raw': {
            'frustratedConsecutive': detector.frustrated_consecutive,
            'strugglingMinutes':     detector.struggling_minutes,
        },
    })


@app.route('/mood/session-summary', methods=['GET'])
def mood_session_summary():
    """GET — returns aggregated mood stats for the current detector session."""
    return jsonify(detector.get_session_summary())


@app.route('/mood/reset', methods=['POST'])
def mood_reset():
    """POST — resets detector state for a new study session."""
    detector.__init__()
    return jsonify({'status': 'reset'})


# ─────────────────────────────────────────────────────────────────────────────
# K-MEANS CLUSTERING ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/cluster/run', methods=['POST'])
def cluster_run():
    """
    POST { students: [...], batchId: "..." }
    Clusters all students and returns labels.
    """
    data = request.get_json(force=True)
    if not data or 'students' not in data:
        return jsonify({'error': 'Missing students array'}), 400

    students = data['students']
    if len(students) == 0:
        return jsonify({'results': [], 'message': 'No students provided'}), 200

    results = clusterer.cluster(students)

    return jsonify({
        'batchId':  data.get('batchId', 'manual'),
        'results':  results,
        'total':    len(results),
        'summary': {
            'top':    sum(1 for r in results if r['cluster'] == 'top'),
            'medium': sum(1 for r in results if r['cluster'] == 'medium'),
            'below':  sum(1 for r in results if r['cluster'] == 'below'),
        },
    })


@app.route('/cluster/student', methods=['POST'])
def cluster_student():
    """
    POST { student: {...} }
    Risk assessment for a single student.
    """
    data = request.get_json(force=True)
    if not data or 'student' not in data:
        return jsonify({'error': 'Missing student object'}), 400

    result = clusterer.assess_single(data['student'])
    return jsonify(result)


# ─────────────────────────────────────────────────────────────────────────────
# ADAPTIVE LEARNING ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/adaptive/learning-style', methods=['POST'])
def adaptive_learning_style():
    """
    POST { studentId, videoTime, textTime, interactiveTime, quizScore }
    Detects and updates VAK learning style.
    """
    data = request.get_json(force=True)
    if not data or 'studentId' not in data:
        return jsonify({'error': 'Missing studentId'}), 400

    result = engine.detect_learning_style(
        student_id    = data['studentId'],
        video_time_s  = float(data.get('videoTime',       0)),
        text_time_s   = float(data.get('textTime',        0)),
        interactive_s = float(data.get('interactiveTime', 0)),
        quiz_score    = float(data.get('quizScore',       0.5)),
    )
    return jsonify(result)


@app.route('/adaptive/difficulty-adjust', methods=['POST'])
def adaptive_difficulty():
    """
    POST { studentId, quizScore (0-1), mood, timeOnTask }
    Returns new difficulty level and action.
    """
    data = request.get_json(force=True)
    if not data or 'studentId' not in data:
        return jsonify({'error': 'Missing studentId'}), 400

    result = engine.adjust_difficulty(
        student_id   = data['studentId'],
        quiz_score   = float(data.get('quizScore',   0.7)),
        mood         = data.get('mood', 'focused'),
        time_on_task = float(data.get('timeOnTask',  30)),
    )
    return jsonify(result)


@app.route('/adaptive/recommend-content', methods=['POST'])
def adaptive_recommend():
    """
    POST { studentId, subject, weakTopics: [...] }
    Returns prioritized content recommendations.
    """
    data = request.get_json(force=True)
    if not data or 'studentId' not in data:
        return jsonify({'error': 'Missing studentId'}), 400

    recommendations = engine.recommend_content(
        student_id  = data['studentId'],
        subject     = data.get('subject',    'General'),
        weak_topics = data.get('weakTopics', []),
    )

    state = engine.get_student_state(data['studentId'])
    return jsonify({
        'studentId':       data['studentId'],
        'learningStyle':   state['learningStyle'],
        'currentDifficulty': state['difficulty'],
        'recommendations': recommendations,
    })


@app.route('/adaptive/state/<student_id>', methods=['GET'])
def adaptive_state(student_id):
    """GET — returns adaptive learning state for a student."""
    return jsonify(engine.get_student_state(student_id))


# ─────────────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    print(f"""
🤖 EduPulse ML Service
   PORT: {port}
   Endpoints: /mood/analyze, /cluster/run, /adaptive/*
   Starting on http://localhost:{port}
""")
    app.run(host='0.0.0.0', port=port, debug=False)
