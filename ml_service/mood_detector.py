"""
EduPulse ML Service — Mood Detector
Uses OpenCV + DeepFace for real-time emotion analysis
"""
import cv2
import numpy as np
import base64
import os

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False
    print("⚠️  DeepFace not installed. Using fallback mood detection.")


class MoodDetector:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.current_mood   = 'neutral'
        self.mood_history   = []
        self.confusion_count = 0

        # Session state
        self.frustrated_consecutive = 0
        self.struggling_minutes     = 0
        self._last_mood_time        = None

    # ── Decode base64 image to cv2 frame ──────────────────────────────────

    def decode_frame(self, base64_str: str):
        """Decode base64 image string to numpy array for cv2."""
        try:
            # Strip data URI prefix if present
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1]
            img_bytes = base64.b64decode(base64_str)
            arr       = np.frombuffer(img_bytes, np.uint8)
            frame     = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            return frame
        except Exception as e:
            print(f"Frame decode error: {e}")
            return None

    # ── Core emotion analysis ─────────────────────────────────────────────

    def analyze_frame(self, frame):
        """
        Analyze a cv2 frame for emotion using DeepFace.
        Falls back to face detection heuristics if DeepFace is unavailable.
        """
        if frame is None:
            return 'focused'

        if DEEPFACE_AVAILABLE:
            try:
                result = DeepFace.analyze(
                    frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    silent=True
                )
                if isinstance(result, list):
                    result = result[0]
                emotion = result['dominant_emotion']
                return self.map_emotion(emotion)
            except Exception:
                pass

        # Fallback: basic face presence detection
        return self._fallback_detect(frame)

    def _fallback_detect(self, frame):
        """Simple heuristic mood based on face detection only."""
        gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 5)
        if len(faces) == 0:
            return 'bored'       # No face visible = likely distracted
        return 'focused'         # Face present = assume focused

    # ── Emotion mapping ───────────────────────────────────────────────────

    def map_emotion(self, deepface_emotion: str) -> str:
        """Map DeepFace emotion labels to our internal mood vocabulary."""
        mapping = {
            'happy':     'engaged',
            'neutral':   'focused',
            'sad':       'struggling',
            'fearful':   'anxious',
            'disgusted': 'bored',
            'angry':     'frustrated',
            'surprised': 'curious',
        }
        mood = mapping.get(deepface_emotion.lower(), 'focused')
        self._update_history(mood)
        return mood

    def _update_history(self, mood: str):
        """Track consecutive moods for alerting logic."""
        self.mood_history.append(mood)
        if len(self.mood_history) > 20:
            self.mood_history.pop(0)

        if mood == 'frustrated':
            self.frustrated_consecutive += 1
        else:
            self.frustrated_consecutive = 0

        if mood == 'struggling':
            self.struggling_minutes += 2   # incremented every analysis call (≈2 min)
        else:
            self.struggling_minutes = 0

    # ── Content adjustment logic ──────────────────────────────────────────

    def get_content_adjustment(self, mood: str) -> dict:
        """Return content adaptation instructions based on detected mood."""
        adjustments = {
            'engaged': {
                'difficulty': 'increase',
                'pace':       'faster',
                'action':     'advance_content',
                'message':    None,
            },
            'focused': {
                'difficulty': 'maintain',
                'pace':       'normal',
                'action':     'continue',
                'message':    None,
            },
            'struggling': {
                'difficulty': 'decrease',
                'pace':       'slower',
                'action':     'simplify_and_encourage',
                'message':    "You're doing great! Let's try a simpler approach. 💪",
            },
            'anxious': {
                'difficulty': 'decrease',
                'pace':       'slower',
                'action':     'send_calm_message',
                'message':    "Take a deep breath. You've got this! 🌟",
            },
            'bored': {
                'difficulty': 'increase',
                'pace':       'faster',
                'action':     'add_interactive_element',
                'message':    "Let's make this more exciting! 🚀",
            },
            'frustrated': {
                'difficulty': 'decrease',
                'pace':       'pause',
                'action':     'alert_teacher_and_break',
                'message':    "Let's take a quick break! 😊 You deserve it.",
            },
            'curious': {
                'difficulty': 'increase',
                'pace':       'faster',
                'action':     'show_extension_content',
                'message':    "Love the curiosity! Here's something extra! 🔍",
            },
        }
        adj = adjustments.get(mood, adjustments['focused']).copy()

        # Add alert flags
        adj['alert_teacher'] = self.frustrated_consecutive >= 3
        adj['auto_simplify'] = self.struggling_minutes >= 5

        return adj

    # ── Session summary ───────────────────────────────────────────────────

    def get_session_summary(self) -> dict:
        """Aggregate mood distribution for the current session."""
        if not self.mood_history:
            return {'dominant': 'focused', 'distribution': {}, 'engagementScore': 50}

        from collections import Counter
        counts      = Counter(self.mood_history)
        total       = len(self.mood_history)
        distribution = {k: round(v / total * 100, 1) for k, v in counts.items()}
        dominant    = counts.most_common(1)[0][0]

        # Engagement score: weighted average
        weights = {'engaged': 100, 'curious': 95, 'focused': 75,
                   'bored': 40, 'anxious': 30, 'struggling': 25, 'frustrated': 10}
        score = sum(weights.get(m, 50) * c for m, c in counts.items()) / total

        return {
            'dominant':       dominant,
            'distribution':   distribution,
            'engagementScore': round(score),
            'frustratedFrames': self.frustrated_consecutive,
            'strugglingMinutes': self.struggling_minutes,
        }
