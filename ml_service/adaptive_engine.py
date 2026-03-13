"""
EduPulse ML Service — Adaptive Learning Engine
Detects learning style and adjusts content difficulty dynamically.
"""
import time
import numpy as np
from collections import defaultdict


class AdaptiveEngine:
    """
    Tracks each student's learning style and manages difficulty adaptation.
    Supports Visual / Auditory / Kinesthetic classification.
    """

    # VAK feature weights: engagement (video, text, interactive)
    VAK_WEIGHTS = {
        'visual':      [0.7, 0.2, 0.1],
        'auditory':    [0.1, 0.7, 0.2],
        'kinesthetic': [0.1, 0.1, 0.8],
    }

    DIFFICULTY_LEVELS = ['very_easy', 'easy', 'medium', 'hard', 'very_hard']

    def __init__(self):
        # Per-student state: { student_id: {...} }
        self._state = defaultdict(lambda: {
            'learningStyle': 'visual',
            'vatScores':     {'visual': 0.33, 'auditory': 0.33, 'kinesthetic': 0.34},
            'difficulty':    'medium',
            'difficultyIdx': 2,
            'history':       [],          # (timestamp, difficulty, score)
            'sessions':      0,
        })

    # ── Learning style detection ──────────────────────────────────────────

    def detect_learning_style(
        self,
        student_id: str,
        video_time_s: float,     # seconds spent on video
        text_time_s:  float,     # seconds reading
        interactive_s: float,    # seconds in interactive exercises
        quiz_score:   float,     # 0-1 quiz performance
    ) -> dict:
        """
        Update learning style classification based on time-on-content signals.
        Uses a weighted exponential moving average to detect VAK preference.
        """
        state  = self._state[student_id]
        total  = video_time_s + text_time_s + interactive_s + 1e-9  # avoid div-by-zero

        obs = np.array([
            video_time_s  / total,
            text_time_s   / total,
            interactive_s / total,
        ])

        # EMA update (alpha = 0.3)
        alpha = 0.3
        for style, weights in self.VAK_WEIGHTS.items():
            engagement = float(np.dot(obs, weights))
            state['vatScores'][style] = (
                (1 - alpha) * state['vatScores'][style] + alpha * engagement
            )

        # Normalize
        total_score = sum(state['vatScores'].values()) or 1
        for k in state['vatScores']:
            state['vatScores'][k] /= total_score

        # Determine dominant style
        dominant = max(state['vatScores'], key=state['vatScores'].get)
        state['learningStyle'] = dominant

        return {
            'studentId':     student_id,
            'learningStyle': dominant,
            'vatScores':     {k: round(v, 3) for k, v in state['vatScores'].items()},
            'contentRec':    self._content_recommendation(dominant),
        }

    def _content_recommendation(self, style: str) -> dict:
        recs = {
            'visual': {
                'primary':   'video',
                'secondary': 'infographic',
                'avoid':     'long text blocks',
                'tip':       'Add more diagrams, flowcharts, and short video clips.',
            },
            'auditory': {
                'primary':   'audio_lecture',
                'secondary': 'discussion',
                'avoid':     'silent reading',
                'tip':       'Include audio explanations and verbal practice exercises.',
            },
            'kinesthetic': {
                'primary':   'interactive_sim',
                'secondary': 'practice_problems',
                'avoid':     'passive watching',
                'tip':       'Use drag-and-drop activities, labs, and problem sets.',
            },
        }
        return recs.get(style, recs['visual'])

    # ── Difficulty adjustment ─────────────────────────────────────────────

    def adjust_difficulty(
        self,
        student_id:   str,
        quiz_score:   float,   # 0-1
        mood:         str,
        time_on_task: float,   # minutes
    ) -> dict:
        """
        Adaptive difficulty algorithm:
        - Quiz score > 85% AND mood engaged → increase difficulty
        - Quiz score < 55% OR mood struggling/frustrated → decrease
        - Otherwise → maintain
        Applies cooldown (at least 1 session between changes).
        """
        state = self._state[student_id]

        current_idx = state['difficultyIdx']
        action      = 'maintain'

        mood_boost  = mood in ('engaged', 'curious')
        mood_reduce = mood in ('struggling', 'frustrated', 'anxious')

        if quiz_score >= 0.85 and mood_boost and current_idx < 4:
            current_idx += 1
            action = 'increase'
        elif (quiz_score < 0.55 or mood_reduce) and current_idx > 0:
            current_idx -= 1
            action = 'decrease'

        new_difficulty = self.DIFFICULTY_LEVELS[current_idx]
        state['difficultyIdx'] = current_idx
        state['difficulty']    = new_difficulty
        state['history'].append((time.time(), new_difficulty, quiz_score))
        state['sessions'] += 1

        return {
            'studentId':   student_id,
            'action':      action,
            'difficulty':  new_difficulty,
            'quizScore':   round(quiz_score * 100),
            'mood':        mood,
            'reasoning':   self._explain_adjustment(action, quiz_score, mood),
        }

    def _explain_adjustment(self, action: str, score: float, mood: str) -> str:
        pct = round(score * 100)
        if action == 'increase':
            return f"Quiz score {pct}% + engaged mood → content advanced to challenge you!"
        if action == 'decrease':
            return f"Quiz score {pct}% + {mood} mood → content simplified for better understanding."
        return f"Quiz score {pct}% is in the optimal range → continuing at current level."

    # ── Content recommendations ───────────────────────────────────────────

    def recommend_content(
        self,
        student_id: str,
        subject:    str,
        weak_topics: list,
    ) -> list:
        """
        Generate a prioritized list of content recommendations.
        Considers learning style, difficulty, and weak topics.
        """
        state  = self._state[student_id]
        style  = state['learningStyle']
        diff   = state['difficulty']
        result = []

        content_types = {
            'visual':      ['video', 'infographic', 'diagram_quiz'],
            'auditory':    ['audio_lecture', 'podcast', 'verbal_quiz'],
            'kinesthetic': ['interactive_sim', 'lab', 'drag_drop'],
        }

        types = content_types.get(style, content_types['visual'])

        for i, topic in enumerate(weak_topics[:5]):  # Top 5 weak topics
            result.append({
                'priority':     i + 1,
                'subject':      subject,
                'topic':        topic,
                'contentType':  types[i % len(types)],
                'difficulty':   diff,
                'estimatedMins': 20 if diff in ('easy', 'very_easy') else 35,
                'reason':       f'Weak area detected — {style} learner format selected.',
            })

        return result

    # ── State getter ──────────────────────────────────────────────────────

    def get_student_state(self, student_id: str) -> dict:
        s = self._state[student_id]
        return {
            'studentId':     student_id,
            'learningStyle': s['learningStyle'],
            'difficulty':    s['difficulty'],
            'vatScores':     {k: round(v, 3) for k, v in s['vatScores'].items()},
            'sessions':      s['sessions'],
        }
