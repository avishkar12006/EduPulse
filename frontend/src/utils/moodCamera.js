/**
 * EduPulse — Mood Camera Utility
 * Manages webcam access, frame capture, and ML service communication
 * for the OpenCV mood detection feature.
 */

const ML_URL = '/ml'; // Proxied through Vite config → http://localhost:5000

let _stream         = null;
let _videoElement   = null;
let _canvas         = null;
let _intervalId     = null;
let _sessionId      = null;
let _onMoodCallback = null;

// ── Emoji mapping ──────────────────────────────────────────────────────────

const MOOD_EMOJIS = {
  engaged:    '🤩',
  focused:    '😊',
  struggling: '😟',
  anxious:    '😰',
  bored:      '😑',
  frustrated: '😤',
  curious:    '🤔',
  neutral:    '😐',
};

const MOOD_COLORS = {
  engaged:    '#10b981',
  focused:    '#38bdf8',
  struggling: '#f59e0b',
  anxious:    '#a78bfa',
  bored:      '#94a3b8',
  frustrated: '#ef4444',
  curious:    '#06b6d4',
  neutral:    '#64748b',
};

// ── Camera lifecycle ───────────────────────────────────────────────────────

async function activateCamera(videoEl) {
  try {
    _stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
      audio: false,
    });
    _videoElement        = videoEl;
    _videoElement.srcObject = _stream;
    await _videoElement.play();

    // Create offscreen canvas for frame capture
    _canvas = document.createElement('canvas');
    _canvas.width  = 320;
    _canvas.height = 240;

    return true;
  } catch (err) {
    console.warn('Camera access denied:', err.message);
    return false;
  }
}

function deactivateCamera() {
  if (_stream) {
    _stream.getTracks().forEach(t => t.stop());
    _stream = null;
  }
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
  _videoElement = null;
  _canvas       = null;
}

// ── Frame capture ──────────────────────────────────────────────────────────

function captureFrame() {
  if (!_videoElement || !_canvas) return null;
  const ctx = _canvas.getContext('2d');
  ctx.drawImage(_videoElement, 0, 0, _canvas.width, _canvas.height);
  // Return base64, strip the header
  return _canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
}

// ── ML service communication ───────────────────────────────────────────────

async function sendForAnalysis(frameBase64) {
  try {
    const res = await fetch(`${ML_URL}/mood/analyze`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ image: frameBase64 }),
    });
    if (!res.ok) throw new Error('ML service error');
    return await res.json();
  } catch {
    return { mood: 'focused', adjustment: { action: 'continue', difficulty: 'maintain', pace: 'normal' } };
  }
}

async function saveToBackend(frameBase64, sessionId, studentId, token) {
  try {
    const res = await fetch('/api/school/mood/opencv', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ studentId, frameBase64, sessionId }),
    });
    return await res.json();
  } catch {
    return null;
  }
}

// ── Session management ─────────────────────────────────────────────────────

function getMoodAdjustment(mood) {
  const adjustments = {
    engaged:    { action: 'advance_content',        message: "You're on fire! 🔥 Let's go deeper!" },
    focused:    { action: 'continue',               message: null },
    struggling: { action: 'simplify_and_encourage', message: "Having trouble? Let's try a simpler approach 💙" },
    anxious:    { action: 'send_calm_message',       message: "Take a deep breath. You've got this! 🌟" },
    bored:      { action: 'add_interactive_element', message: "Let's spice things up! 🚀" },
    frustrated: { action: 'alert_teacher_and_break', message: "Time for a 5-minute break! 🧘 You deserve it." },
    curious:    { action: 'show_extension_content',  message: "Love the curiosity! Here's something extra! 🔍" },
  };
  return adjustments[mood] || adjustments.focused;
}

function getMoodEmoji(mood) {
  return MOOD_EMOJIS[mood] || '😐';
}

function getMoodColor(mood) {
  return MOOD_COLORS[mood] || '#64748b';
}

// ── Start continuous monitoring ────────────────────────────────────────────

function startMonitoring({ studentId, token, sessionId, intervalMs = 120000, onMood }) {
  _sessionId      = sessionId;
  _onMoodCallback = onMood;

  if (_intervalId) clearInterval(_intervalId);

  _intervalId = setInterval(async () => {
    const frame = captureFrame();
    if (!frame) return;

    const result = await saveToBackend(frame, _sessionId, studentId, token);
    if (result && _onMoodCallback) {
      _onMoodCallback({
        mood:           result.mood,
        adjustment:     result.adjustment,
        sessionId:      result.sessionId,
        teacherAlerted: result.teacherAlerted,
      });
    }
  }, intervalMs);
}

function stopMonitoring() {
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
}

// ── Session summary ────────────────────────────────────────────────────────

async function getSessionSummary(sessionId, token) {
  try {
    const res = await fetch(`/api/school/mood/session-summary/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return null;
  }
}

export {
  activateCamera,
  deactivateCamera,
  captureFrame,
  sendForAnalysis,
  saveToBackend,
  startMonitoring,
  stopMonitoring,
  getMoodAdjustment,
  getMoodEmoji,
  getMoodColor,
  getSessionSummary,
};
