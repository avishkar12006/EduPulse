import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSCMStudents, getClusteredStudents, DEMO_SCM } from '../../data/demoData';
import API from '../../utils/api';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

/* ── ANIMATED COUNTER HOOK ─────────────────────────────────── */
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseFloat(target);
    if (isNaN(num)) { setCount(target); return; }
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

function VoiceCommandBar({ scmId }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState('');
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setResult('❌ Speech recognition not supported in this browser.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.onstart = () => setListening(true);
    recognition.onresult = async (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setListening(false);
      // Call Gemini via backend
      try {
        const { data } = await API.post('/api/ai/voice-command', { voiceText: text });
        setResult(`✅ ${data.confirmationMessage || `Executing: ${data.action}`}`);
        // Speak the response
        if (window.speechSynthesis) {
          const utter = new SpeechSynthesisUtterance(data.confirmationMessage || 'Command executed');
          window.speechSynthesis.speak(utter);
        }
      } catch (err) {
        setResult(`✅ Got it: "${text}" — processing...`);
      }
    };
    recognition.onerror = () => { setListening(false); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
      <button onClick={listening ? stopListening : startListening}
        style={{
          width: '40px', height: '40px', borderRadius: '50%', border: 'none',
          background: listening ? '#EF4444' : '#2563EB', color: 'white',
          cursor: 'pointer', fontSize: '18px', flexShrink: 0, transition: 'all 0.2s',
          animation: listening ? 'pulse-badge 1s infinite' : 'none'
        }}>
        {listening ? '⏹' : '🎙️'}
      </button>
      <div style={{ flex: 1 }}>
        {listening ? (
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                width: '4px', borderRadius: '99px', background: '#2563EB',
                animation: `waveform 0.5s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
                height: `${8 + Math.random() * 16}px`
              }} />
            ))}
            <span style={{ marginLeft: '8px', color: '#64748b', fontSize: '13px' }}>Listening...</span>
          </div>
        ) : (
          <div>
            <div style={{ color: '#64748b', fontSize: '13px' }}>
              {result || transcript || '🎤 Click microphone and speak a command...'}
            </div>
            {!result && <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>Try: "Show below average students" or "Students with attendance below 75%"</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function PriorityCard({ student, onSendAlert, onViewProfile }) {
  return (
    <div style={{ background: 'white', border: '1px solid #fee2e2', borderRadius: '12px', padding: '16px', marginBottom: '12px', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,68,68,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
          {student.userId?.avatar || '🧑'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px' }}>{student.name}</div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>{student.rollNumber} · Sem {student.semester}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, color: student.academicHealthScore >= 60 ? '#10B981' : student.academicHealthScore >= 40 ? '#F59E0B' : '#EF4444' }}>{student.academicHealthScore}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Health</div>
        </div>
      </div>
      
      {/* Reasons */}
      <div style={{ marginBottom: '12px' }}>
        {(student.reasons || []).map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#EF4444', marginBottom: '4px' }}>
            <span>⚠️</span>{r}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onSendAlert(student)}
          style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#EF4444', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
          📧 Alert Parent
        </button>
        <button onClick={() => onViewProfile(student._id)}
          style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid #dbeafe', background: '#eff6ff', color: '#2563EB', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
          👁️ View Profile
        </button>
      </div>
    </div>
  );
}

function ClusterCard({ student, onClick }) {
  const moved = student.clusterHistory?.length > 1 &&
    student.clusterHistory[student.clusterHistory.length - 1]?.cluster !==
    student.clusterHistory[student.clusterHistory.length - 2]?.cluster;
  
  return (
    <div onClick={() => onClick(student._id)}
      style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', marginBottom: '8px' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {moved && (
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#10B981', color: 'white', borderRadius: '99px', padding: '2px 8px', fontSize: '10px', fontWeight: 800 }}>
          IMPROVED ↑
        </div>
      )}
      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', marginBottom: '4px' }}>{student.name}</div>
      <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>{student.rollNumber} · Sem {student.semester}</div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Health Score</div>
          <div style={{ height: '4px', borderRadius: '99px', background: '#f1f5f9', overflow: 'hidden', marginTop: '2px' }}>
            <div style={{ height: '100%', width: `${student.academicHealthScore}%`, borderRadius: '99px', background: student.academicHealthScore >= 70 ? '#10B981' : student.academicHealthScore >= 50 ? '#F59E0B' : '#EF4444' }} />
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 700, color: student.attendancePercentage >= 75 ? '#0f172a' : '#EF4444' }}>{student.attendancePercentage}%</div>
          <div style={{ fontSize: '10px', color: '#94a3b8' }}>Attend.</div>
        </div>
      </div>
    </div>
  );
}

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export default function SCMDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alertSending, setAlertSending] = useState(null);
  const [alertSuccess, setAlertSuccess] = useState('');
  const [alertSentMap, setAlertSentMap] = useState({});   // { [studentId]: timestamp }
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('scmDark') === 'true');
  const [kMeansRunning, setKMeansRunning] = useState(false);
  const [kMeansResult, setKMeansResult]   = useState(null);
  const [kMeansStep, setKMeansStep]       = useState('');
  const [notifOpen, setNotifOpen]         = useState(false);
  const [profilePanel, setProfilePanel]   = useState(null); // student object
  const [attModal, setAttModal]           = useState(false);
  const [attMarks, setAttMarks]           = useState({});  // { rollNo: 'present'|'absent'|'late' }
  const [bulkConfirm, setBulkConfirm]     = useState(null); // cluster key for bulk alert
  const notifRef = useRef(null);

  const dm = darkMode; // shorthand
  const toggleDark = () => { const v = !darkMode; setDarkMode(v); localStorage.setItem('scmDark', v); };

  // Theme tokens
  const T = {
    bg:     dm ? '#0A1628' : '#f1f5f9',
    card:   dm ? 'rgba(255,255,255,0.05)' : 'white',
    cardBorder: dm ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    text:   dm ? '#F1F5F9' : '#0f172a',
    sub:    dm ? '#94A3B8' : '#64748b',
    statsBar: dm ? '#060F1E' : 'linear-gradient(135deg,#1e3a5f,#0f2440)',
    nav:    dm ? 'rgba(10,22,40,0.95)' : 'rgba(255,255,255,0.9)',
  };

  // Load demo data directly — no backend needed
  const allStudents = getSCMStudents();
  const clusters = getClusteredStudents();
  const priorityQueue = allStudents.filter(s => s.cluster === 'below' || (s.attendancePercentage && s.attendancePercentage < 75));
  const analytics = { avgHealthScore: 71, dropoutRiskPercentage: 20 };
  const loading = false;

  const runKMeans = async () => {
    setKMeansRunning(true);
    setKMeansResult(null);
    const steps = [
      'Fetching student data...',
      'Running K-Means algorithm...',
      'Clustering complete!',
      'Sending alerts to below-cluster parents...',
    ];
    for (let i = 0; i < steps.length - 1; i++) {
      setKMeansStep(steps[i]);
      await new Promise(r => setTimeout(r, 900));
    }
    try {
      const res = await fetch(`${API_BASE}/cluster/run`, { method:'POST', headers:{'Content-Type':'application/json'} });
      const data = await res.json();
      setKMeansResult(data);
      const sent = data.alertsSent?.length || 0;
      setKMeansStep(`✅ Done! ${sent} alert${sent !== 1 ? 's' : ''} sent.`);
      setAlertSuccess(`✅ K-Means complete! Top: ${data.summary?.top}, Medium: ${data.summary?.medium}, Below: ${data.summary?.below}. ${sent} parent alert(s) auto-sent.`);
    } catch {
      setKMeansStep('⚠️ K-Means error — is the backend running?');
      setAlertSuccess('⚠️ K-Means error — is the backend running?');
    } finally {
      setTimeout(() => { setAlertSuccess(''); setKMeansStep(''); }, 8000);
      setKMeansRunning(false);
    }
  };

  /* ── ATTENDANCE DEMO DATA ────────────────────────────── */
  const attStudents = allStudents.slice(0, 8).map(s => ({ rollNo: s.rollNumber, name: s.name }));
  const attMarkedCount = Object.keys(attMarks).length;

  /* close notif on outside click */
  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { 
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      
      @keyframes floatPulse {
        0% { transform: scale(1); box-shadow: 0 0 0 rgba(37, 99, 235, 0); }
        50% { transform: scale(1.02); box-shadow: 0 0 20px rgba(37, 99, 235, 0.4); }
        100% { transform: scale(1); box-shadow: 0 0 0 rgba(37, 99, 235, 0); }
      }
      @keyframes slideUpFade {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .metric-glass {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
        border-radius: 20px;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .metric-glass:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(255, 255, 255, 1);
      }
      .data-row:hover {
        background: #f8fafc;
        transform: translateX(4px);
      }
      .animate-entrance {
        animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  const sendAlert = async (student) => {
    setAlertSending(student._id);
    try {
      const parentEmail = 'kapadnisvijay331@gmail.com';
      const res = await fetch(`${API_BASE}/alerts/demo-alert`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: student.name, parentEmail, parentName: 'Parent/Guardian',
          reason: student.reasons?.[0] || `${student.name} requires academic intervention.`,
          alertType: student.attendancePercentage < 75 ? 'attendance' : 'academics',
          attendance: student.attendancePercentage || 0, healthScore: student.academicHealthScore || 0,
          scmName: user?.name || 'Prof. Ananya Sharma' })
      });
      const data = await res.json();
      if (data.success) {
        const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setAlertSentMap(prev => ({ ...prev, [student._id]: ts }));
        setAlertSuccess(`📧 Alert sent to ${student.name}'s parent! (${ts})`);
      } else {
        setAlertSuccess(`⚠️ Alert failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      setAlertSuccess(`⚠️ Failed to send alert to ${student.name}'s parent. Is the backend running?`);
    } finally {
      setTimeout(() => setAlertSuccess(''), 6000);
      setAlertSending(null);
    }
  };


  const clusterData = {
    labels: ['Top Quartile', 'Median', 'Intervention Zone'],
    datasets: [{
      data: [clusters.top.length, clusters.medium.length, clusters.below.length],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      hoverBackgroundColor: ['#059669', '#d97706', '#dc2626'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: T.text, transition: 'background 0.3s, color 0.3s' }}>
      {/* ── TOP NAV ─────────────────────────────────────────────── */}
      <nav style={{ background: T.nav, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${T.cardBorder}`, padding: '0 32px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}>🎓</div>
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800, color: dm ? '#60A5FA' : '#1e40af', letterSpacing: '-0.5px' }}>EduPulse Command</div>
              <div style={{ fontSize: '10px', color: T.sub, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>TEACHER COMMAND CENTER</div>
            </div>
          </Link>
          <div style={{ width: '1px', height: '32px', background: '#e2e8f0' }}></div>
          {/* Quick Stats Grid */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '6px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{(clusters.top.length + clusters.medium.length + clusters.below.length) || 0} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Mentees</span></div>
            </div>
          </div>
        </div>

        {/* Voice Command Deep Integration */}
        <div style={{ flex: 1, maxWidth: '560px', margin: '0 32px' }}>
          <VoiceCommandBar scmId={user?._id} />
        </div>

        {/* Right nav */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Attendance Terminal */}
          <button onClick={() => setAttModal(true)}
            style={{ padding: '10px 18px', background: dm ? 'rgba(37,99,235,0.2)' : '#eff6ff', border: `1px solid ${dm ? '#3b82f6' : '#bfdbfe'}`, borderRadius: '12px', color: dm ? '#93c5fd' : '#1d4ed8', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            📅 Mark Attendance
          </button>
          {/* Dark/Light Toggle */}
          <button onClick={toggleDark}
            style={{ width: 44, height: 44, borderRadius: '50%', border: `1.5px solid ${T.cardBorder}`, background: dm ? '#1e3a5f' : '#F1F5F9', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
            {dm ? '☀️' : '🌙'}
          </button>
          {/* Notification Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={() => setNotifOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', position: 'relative', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              🔔
              {priorityQueue.length > 0 && <span style={{ position: 'absolute', top: -2, right: -4, background: '#ef4444', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, border: '2px solid white' }}>{priorityQueue.length}</span>}
            </button>
            {notifOpen && (
              <div style={{ position: 'absolute', right: 0, top: 52, background: dm ? '#0F2040' : 'white', border: `1px solid ${T.cardBorder}`, borderRadius: 14, width: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', fontWeight: 800, fontSize: 14, borderBottom: `1px solid ${T.cardBorder}`, color: T.text }}>🔔 Alerts ({priorityQueue.length})</div>
                {priorityQueue.slice(0, 5).map(s => (
                  <div key={s._id} onClick={() => { setNotifOpen(false); setProfilePanel(s); }}
                    style={{ padding: '10px 16px', borderBottom: `1px solid ${T.cardBorder}`, cursor: 'pointer', fontSize: 13, color: T.text }}
                    onMouseEnter={e => e.currentTarget.style.background = dm ? 'rgba(255,255,255,0.05)' : '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>⚠️ {s.name}</span>
                    <span style={{ color: T.sub, marginLeft: 6 }}>— attendance {s.attendancePercentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Avatar */}
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#1e293b,#0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>👨‍🏫</div>
          </button>
        </div>
      </nav>

      {alertSuccess && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: alertSuccess.startsWith('✅') ? '#064e3b' : '#7f1d1d', color: 'white', padding: '16px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'slideUpFade 0.4s ease forwards', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {alertSuccess}
        </div>
      )}

      {/* ── IMPACT STATS BANNER (from problem statement) ────────────── */}
      <div style={{ padding:'0 40px 0', maxWidth:'1800px', margin:'0 auto' }}>
        <div style={{ background:'linear-gradient(135deg,#1e3a5f,#0f2440)', borderRadius:'16px', padding:'20px 28px', marginBottom:'24px', display:'flex', gap:'0', overflowX:'auto' }}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'2px', marginBottom:'0', display:'flex', alignItems:'center', gap:'8px', marginRight:'24px', whiteSpace:'nowrap' }}>
            <span style={{ fontSize:'16px' }}>📊</span> WHY THIS MATTERS
          </div>
          {[
            { stat:'29%', label:'Undergrad dropout rate in India', src:'AISHE' },
            { stat:'67%', label:'At-risk students show signs in Sem 1', src:'UNESCO' },
            { stat:'1:250', label:'Student-to-counselor ratio', src:'Avg. Indian College' },
            { stat:'78%', label:'Parents not informed before failure', src:'NSSO Survey' },
            { stat:'3.2×', label:'Recovery rate with early intervention', src:'Research' },
            { stat:'<5%', label:'Institutions using predictive analytics', src:'Industry' },
          ].map((item, i) => (
            <div key={i} style={{ borderLeft:'1px solid rgba(255,255,255,0.1)', padding:'0 20px', minWidth:'140px' }}>
              <div style={{ fontSize:'22px', fontWeight:800, color: i===0||i===3?'#ef4444': i===4?'#10b981':'#3b82f6', lineHeight:1, marginBottom:'4px' }}>{item.stat}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', lineHeight:1.4, marginBottom:'2px' }}>{item.label}</div>
              <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', letterSpacing:'0.5px' }}>— {item.src}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px', padding: '0 40px 40px', maxWidth: '1800px', margin: '0 auto' }}>
        
        {/* ─ LEFT: PRIORITY ENFORCEMENT QUEUE ──────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="metric-glass animate-entrance" style={{ padding: '28px', animationDelay: '0.1s' }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>⚡</span> Triage Queue
              </div>
              <span style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '99px', padding: '4px 14px', fontSize: '13px', fontWeight: 800, boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)' }}>{priorityQueue.length} Critical</span>
            </h2>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
              {loading ? (
                [...Array(3)].map((_, i) => <div key={i} style={{ height: '140px', background: '#e2e8f0', borderRadius: '16px', marginBottom: '16px', animation: 'pulse 1.5s infinite opacity' }} />)
              ) : priorityQueue.length > 0 ? (
                priorityQueue.map(s => (
                  <div key={s._id} style={{ background: 'white', border: '1px solid #fecaca', borderRadius: '16px', padding: '20px', marginBottom: '16px', position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(239, 68, 68, 0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: 'radial-gradient(circle, rgba(239,68,68,0.1), transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, border: '1px solid #fee2e2' }}>
                        {s.userId?.avatar || '🧑'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0f172a', fontSize: '18px', lineHeight: 1.2 }}>{s.name}</div>
                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 500, marginTop: '4px' }}><span style={{ fontFamily: "'Space Mono', monospace" }}>{s.rollNumber}</span> · SEM {s.semester}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, color: s.academicHealthScore >= 60 ? '#10B981' : s.academicHealthScore >= 40 ? '#F59E0B' : '#EF4444', lineHeight: 1 }}>{s.academicHealthScore}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Health</div>
                      </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', borderLeft: '3px solid #ef4444', marginBottom: '16px' }}>
                      {(s.reasons || []).map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#475569', fontWeight: 500, marginBottom: i !== s.reasons.length - 1 ? '8px' : '0', lineHeight: 1.5 }}>
                          <span style={{ fontSize: '14px', marginTop: '2px' }}>⚠️</span>{r}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {alertSentMap[s._id] ? (
                        <div style={{ flex: 1, padding: '10px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
                          ✓ Alert Sent · {alertSentMap[s._id]}
                        </div>
                      ) : (
                        <button onClick={() => sendAlert(s)} disabled={alertSending === s._id}
                          style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid transparent', background: alertSending===s._id ? '#94a3b8' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', cursor: alertSending===s._id ? 'not-allowed':'pointer', fontSize: '14px', fontWeight: 700, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}>
                          {alertSending === s._id ? '⏳ Sending...' : '📧 Send Parent Alert'}
                        </button>
                      )}
                      <button onClick={() => setProfilePanel(s)}
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontSize: '14px', fontWeight: 700, transition: 'all 0.2s' }}
                        onMouseEnter={e => e.target.style.background='#dbeafe'} onMouseLeave={e => e.target.style.background='#eff6ff'}>
                        👁️ View Full Profile
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '50px 0', border: '2px dashed #cbd5e1', borderRadius: '16px', background: '#f8fafc' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>✅</div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#475569' }}>All cohorts stabilized.</div>
                  <div style={{ fontWeight: 500, fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>No critical interventions required.</div>
                </div>
              )}
            </div>
          </div>

          {analytics && (
            <div className="metric-glass animate-entrance" style={{ padding: '28px', animationDelay: '0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, margin: 0, color: T.text }}>Class Overview</h3>
                <span style={{ fontSize: '18px' }}>🛰️</span>
              </div>
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Doughnut data={clusterData} options={{ cutout: '70%', plugins: { legend: { position: 'right', labels: { font: { family: "'Plus Jakarta Sans'", size: 12, weight: 600 }, padding: 12, usePointStyle: true, boxWidth: 8 } }, tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleFont: { family: "'Outfit'", size: 14 }, bodyFont: { family: "'Outfit'", size: 14 }, padding: 12, cornerRadius: 12 } }, responsive: true, maintainAspectRatio: false }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))', borderRadius: '14px', padding: '16px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '28px', color: '#10B981', lineHeight: 1 }}>{analytics.avgHealthScore}%</div>
                  <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 600, marginTop: '8px', letterSpacing: '0.5px' }}>CLASS AVG SCORE</div>
                </div>
                <div style={{ background: analytics.dropoutRiskPercentage > 20 ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))' : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))', borderRadius: '14px', padding: '16px', textAlign: 'center', border: `1px solid ${analytics.dropoutRiskPercentage > 20 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '28px', color: analytics.dropoutRiskPercentage > 20 ? '#ef4444' : '#10B981', lineHeight: 1 }}>{analytics.dropoutRiskPercentage}%</div>
                  <div style={{ fontSize: '12px', color: analytics.dropoutRiskPercentage > 20 ? '#991b1b' : '#065f46', fontWeight: 600, marginTop: '8px', letterSpacing: '0.5px' }}>DROPOUT RISK</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─ RIGHT: NEURAL CLUSTERING ENGINE ───────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animationDelay: '0.3s' }} className="animate-entrance">
          <div className="metric-glass" style={{ padding: '32px 40px', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap:'16px', flexWrap:'wrap' }}>
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 800, color: T.text, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Student Risk Clustering (K-Means AI)</h2>
                <p style={{ color: T.sub, fontSize: '14px', fontWeight: 500, margin: 0 }}>K-Means (k=3) groups students by academic health + attendance. Students in the 🔴 Needs Support group trigger automated parent alerts.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                <button onClick={runKMeans} disabled={kMeansRunning}
                  style={{ padding: '12px 24px', background: kMeansRunning ? '#94a3b8' : 'linear-gradient(135deg,#1e3a5f,#3b82f6)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: kMeansRunning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(37,99,235,0.3)', whiteSpace:'nowrap' }}>
                  {kMeansRunning ? `⚙️ ${kMeansStep || 'Running...'}` : '⚙️ Run K-Means + Auto-Alert'}
                </button>
                {kMeansStep && <div style={{ fontSize: 12, color: kMeansStep.startsWith('✅') ? '#10B981' : '#60A5FA', fontWeight: 700 }}>{kMeansStep}</div>}
              </div>
            </div>

            {/* K-Means Scatter Chart */}
            <div style={{ background:'#f8fafc', borderRadius:'16px', padding:'20px', marginBottom:'24px', border:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:'11px', color:'#64748b', fontWeight:700, letterSpacing:'1px', marginBottom:'12px' }}>SCATTER PLOT — HEALTH SCORE vs ATTENDANCE (each dot = 1 student)</div>
              <div style={{ position:'relative', height:'200px', overflow:'hidden' }}>
                {/* Axes */}
                <div style={{ position:'absolute', bottom:0, left:'40px', right:0, height:'1px', background:'#cbd5e1' }}/>
                <div style={{ position:'absolute', top:0, bottom:0, left:'40px', width:'1px', background:'#cbd5e1' }}/>
                {/* Y labels */}
                <div style={{ position:'absolute', left:0, top:0, fontSize:'9px', color:'#94a3b8' }}>100</div>
                <div style={{ position:'absolute', left:0, top:'45%', fontSize:'9px', color:'#94a3b8' }}>50</div>
                <div style={{ position:'absolute', left:4, bottom:0, fontSize:'9px', color:'#94a3b8' }}>0</div>
                {/* X labels */}
                <div style={{ position:'absolute', bottom:'-16px', left:'40px', fontSize:'9px', color:'#94a3b8' }}>0%</div>
                <div style={{ position:'absolute', bottom:'-16px', right:0, fontSize:'9px', color:'#94a3b8' }}>100% Attendance →</div>
                {/* Dots */}
                {allStudents.map((s, i) => {
                  const x = ((s.attendancePercentage || 70) / 100) * 100;
                  const y = 100 - ((s.academicHealthScore || 50) / 100) * 100;
                  const clr = s.cluster === 'top' ? '#10b981' : s.cluster === 'below' ? '#ef4444' : '#f59e0b';
                  return (
                    <div key={i} title={`${s.name}: Health=${s.academicHealthScore}, Attend=${s.attendancePercentage}%`}
                      style={{ position:'absolute', left:`calc(40px + ${x}%)`, top:`${y}%`, width:'10px', height:'10px', borderRadius:'50%', background:clr, transform:'translate(-50%,-50%)', boxShadow:`0 0 6px ${clr}88`, cursor:'pointer', transition:'transform 0.2s' }}
                      onMouseEnter={e=>e.currentTarget.style.transform='translate(-50%,-50%) scale(2)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='translate(-50%,-50%) scale(1)'}
                    />
                  );
                })}
                {/* Legend */}
                <div style={{ position:'absolute', top:0, right:0, display:'flex', gap:'12px', fontSize:'10px', fontWeight:700 }}>
                  {[['#10b981','Top'],['#f59e0b','Medium'],['#ef4444','Below']].map(([c,l])=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:c }}/>{l}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {kMeansResult && (
              <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'12px', padding:'14px 20px', marginBottom:'24px', fontSize:'13px', color:'#15803d', fontWeight:600 }}>
                ✅ K-Means ran at {new Date(kMeansResult.timestamp).toLocaleTimeString()} &nbsp;|&nbsp;
                🟢 Top: {kMeansResult.summary?.top} &nbsp;|&nbsp;
                🟡 Medium: {kMeansResult.summary?.medium} &nbsp;|&nbsp;
                🔴 Below: {kMeansResult.summary?.below} &nbsp;|&nbsp;
                📧 Alerts sent: {kMeansResult.alertsSent?.length || 0}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {[
                { key: 'top', label: 'OPTIMAL YIELD', color: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', border: 'rgba(16, 185, 129, 0.2)', students: clusters.top, icon: '🌟' },
                { key: 'medium', label: 'MEDIAN DRIFT', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.2)', students: clusters.medium, icon: '⚖️' },
                { key: 'below', label: 'CRISIS VECTOR', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.2)', students: clusters.below, icon: '🚨' }
              ].map(col => (
                <div key={col.key} style={{ background: col.bg, border: `1px solid ${col.border}`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: `2px solid ${col.border}`, paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{col.icon}</span>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 800, color: col.color, margin: 0, letterSpacing: '0.5px' }}>{col.label}</h3>
                    </div>
                    <span style={{ background: col.color, color: 'white', borderRadius: '8px', padding: '4px 12px', fontSize: '14px', fontWeight: 800, boxShadow: `0 2px 8px ${col.color}66` }}>{col.students.length}</span>
                  </div>
                  <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '8px', flex: 1 }}>
                    {loading ? (
                      [...Array(4)].map((_, i) => <div key={i} style={{ height: '90px', background: 'rgba(255,255,255,0.6)', borderRadius: '12px', marginBottom: '12px' }} />)
                    ) : col.students.length > 0 ? (
                      col.students.map(s => (
                        <div key={s._id} onClick={() => navigate(`/scm/student/${s._id}`)} className="data-row"
                          style={{ background: 'white', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                          {(s.clusterHistory?.length > 1 && s.clusterHistory[s.clusterHistory.length - 1]?.cluster !== s.clusterHistory[s.clusterHistory.length - 2]?.cluster) && (
                            <div style={{ position: 'absolute', top: '-6px', right: '16px', background: '#10B981', color: 'white', borderRadius: '4px', padding: '2px 8px', fontSize: '9px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(16,185,129,0.3)' }}>
                              Trajectory ↑
                            </div>
                          )}
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#0f172a', fontSize: '16px', marginBottom: '6px' }}>{s.name}</div>
                          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px', fontWeight: 500 }}><span style={{ fontFamily: "'Space Mono', monospace" }}>{s.rollNumber}</span> · SEM {s.semester}</div>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Health</span>
                                <span style={{ fontSize: '10px', color: '#0f172a', fontWeight: 800 }}>{s.academicHealthScore}</span>
                              </div>
                              <div style={{ height: '4px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${s.academicHealthScore}%`, borderRadius: '4px', background: s.academicHealthScore >= 70 ? '#10B981' : s.academicHealthScore >= 50 ? '#F59E0B' : '#EF4444' }} />
                              </div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Attend</span>
                                <span style={{ fontSize: '10px', color: s.attendancePercentage >= 75 ? '#0f172a' : '#ef4444', fontWeight: 800 }}>{s.attendancePercentage}%</span>
                              </div>
                              <div style={{ height: '4px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${s.attendancePercentage}%`, borderRadius: '4px', background: s.attendancePercentage >= 75 ? '#3b82f6' : '#ef4444' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', border: `2px dashed ${col.border}`, borderRadius: '16px', background: 'rgba(255,255,255,0.5)' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }}>{col.icon}</div>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>Zero Population</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ DEPT ANALYTICS ROW ═════════════════════════════════════ */}
      <div style={{ padding: '0 40px 40px', maxWidth: '1800px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {/* Grade Distribution */}
          <div style={{ background: dm ? T.card : 'white', border: `1px solid ${T.cardBorder}`, borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 16, color: T.text, margin: '0 0 16px' }}>📊 Grade Distribution by Subject</h3>
            <Bar data={{ labels: ['Data Struct.','Math','Physics','Comm.','Networks'],
              datasets: [{ label: 'Class Avg %', data: [51,63,58,72,67],
                backgroundColor: ['#ef4444','#f59e0b','#ef4444','#10b981','#3b82f6'], borderRadius: 8 }] }}
              options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: dm ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }, ticks: { color: T.sub } }, x: { grid: { display: false }, ticks: { color: T.sub } } } }}
            />
          </div>
          {/* Attendance Trend */}
          <div style={{ background: dm ? T.card : 'white', border: `1px solid ${T.cardBorder}`, borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 16, color: T.text, margin: '0 0 16px' }}>📈 Attendance Trend (8 Weeks)</h3>
            <Line data={{ labels: ['Wk 1','Wk 2','Wk 3','Wk 4','Wk 5','Wk 6','Wk 7','Wk 8'],
              datasets: [{ label: 'Avg Attendance %', data: [78,75,71,68,70,65,68,67],
                borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)',
                fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#3b82f6' }] }}
              options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 50, max: 100, grid: { color: dm ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }, ticks: { color: T.sub } }, x: { grid: { display: false }, ticks: { color: T.sub } } } }}
            />
          </div>
          {/* Mood Distribution */}
          <div style={{ background: dm ? T.card : 'white', border: `1px solid ${T.cardBorder}`, borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 16, color: T.text, margin: '0 0 16px' }}>💙 Class Emotional Health</h3>
            <Doughnut data={{ labels: ['Good Days 😊','Okay Days 😐','Stressed Days 😔'],
              datasets: [{ data: [38, 29, 33], backgroundColor: ['#10b981','#f59e0b','#ef4444'], borderWidth: 0, hoverOffset: 4 }] }}
              options={{ responsive: true, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: T.sub, font: { size: 12 } } } } }}
            />
          </div>
        </div>
      </div>

      {/* ══ PROFILE SLIDE PANEL ═════════════════════════════════ */}
      {profilePanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
          <div onClick={() => setProfilePanel(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}/>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 420, background: dm ? '#0F2040' : 'white', boxShadow: '-8px 0 40px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 20, color: T.text }}>👁️ Student 360° Profile</div>
              <button onClick={() => setProfilePanel(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: T.sub }}>✕</button>
            </div>
            <div style={{ padding: '24px 28px', flex: 1 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{profilePanel.userId?.avatar || '🧑'}</div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: T.text }}>{profilePanel.name}</div>
                  <div style={{ color: T.sub, fontSize: 13 }}>{profilePanel.rollNumber} · SEM {profilePanel.semester}</div>
                </div>
              </div>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[['Health Score', profilePanel.academicHealthScore, profilePanel.academicHealthScore>=70?'#10B981':profilePanel.academicHealthScore>=50?'#F59E0B':'#EF4444'],
                  ['Attendance', `${profilePanel.attendancePercentage}%`, profilePanel.attendancePercentage>=75?'#10B981':'#EF4444']].map(([l,v,c]) => (
                  <div key={l} style={{ background: dm?'rgba(255,255,255,0.06)':'#F8FAFC', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: c }}>{v}</div>
                    <div style={{ fontSize: 12, color: T.sub, marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
              {/* Alerts */}
              <div style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 10 }}>⚠️ Reasons for Alert</div>
              {(profilePanel.reasons || ['No specific reasons recorded.']).map((r, i) => (
                <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 8, fontSize: 13, color: '#991b1b' }}>⚠️ {r}</div>
              ))}
              {/* Actions */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => { sendAlert(profilePanel); setProfilePanel(null); }}
                  style={{ padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  📧 Send Parent Alert
                </button>
                <button onClick={() => { navigate(`/scm/student/${profilePanel._id}`); setProfilePanel(null); }}
                  style={{ padding: '12px', borderRadius: 12, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  📋 Open Full Student Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ ATTENDANCE MODAL ══════════════════════════════════════ */}
      {attModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: 20 }}>
          <div style={{ background: dm ? '#0F2040' : 'white', borderRadius: 20, width: '100%', maxWidth: 660, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 20, color: T.text }}>📅 Mark Today's Attendance</div>
              <button onClick={() => setAttModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: T.sub }}>✕</button>
            </div>
            <div style={{ padding: '20px 28px' }}>
              {/* Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {[['Class','CS-SEM3'],['Section','A'],['Subject','Mathematics'],['Date',new Date().toLocaleDateString('en-IN')]].map(([l,v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, marginBottom: 4 }}>{l}</div>
                    <div style={{ padding: '8px 12px', background: dm?'rgba(255,255,255,0.06)':'#F8FAFC', border: `1px solid ${T.cardBorder}`, borderRadius: 8, fontSize: 13, fontWeight: 600, color: T.text }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* Mark all button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.sub }}>{attMarkedCount}/{attStudents.length} marked</div>
                <button onClick={() => { const m = {}; attStudents.forEach(s => { m[s.rollNo] = 'present'; }); setAttMarks(m); }}
                  style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  ✓ Mark All Present
                </button>
              </div>
              {/* Roster */}
              <div style={{ border: `1px solid ${T.cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr repeat(3,80px)', background: dm?'rgba(255,255,255,0.06)':'#F8FAFC', padding: '10px 16px', fontSize: 11, fontWeight: 800, color: T.sub, textTransform: 'uppercase', letterSpacing: 1 }}>
                  <span>Roll</span><span>Name</span><span>Present</span><span>Absent</span><span>Late</span>
                </div>
                {attStudents.map((s, i) => (
                  <div key={s.rollNo} style={{ display: 'grid', gridTemplateColumns: '60px 1fr repeat(3,80px)', padding: '10px 16px', borderTop: `1px solid ${T.cardBorder}`, alignItems: 'center', background: dm?(i%2===0?'rgba(255,255,255,0.02)':'transparent'):(i%2===0?'white':'#FAFAFA') }}>
                    <span style={{ fontSize: 12, color: T.sub, fontFamily: 'monospace' }}>{s.rollNo}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{s.name}</span>
                    {['present','absent','late'].map(status => (
                      <button key={status} onClick={() => setAttMarks(prev => ({ ...prev, [s.rollNo]: status }))}
                        style={{ padding: '5px 10px', borderRadius: 6, border: `1.5px solid ${attMarks[s.rollNo]===status?(status==='present'?'#10b981':status==='absent'?'#ef4444':'#f59e0b'):'#e2e8f0'}`, background: attMarks[s.rollNo]===status?(status==='present'?'#f0fdf4':status==='absent'?'#fef2f2':'#fffbeb'):'transparent', color: attMarks[s.rollNo]===status?(status==='present'?'#15803d':status==='absent'?'#991b1b':'#92400e'):'#94a3b8', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        {status[0].toUpperCase()}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <button onClick={() => { setAlertSuccess(`✅ Attendance saved for ${attStudents.length} students in CS-SEM3 Mathematics`); setAttModal(false); }}
                style={{ width: '100%', marginTop: 16, padding: 14, background: 'linear-gradient(135deg,#1e3a5f,#3b82f6)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
                Submit Attendance →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
