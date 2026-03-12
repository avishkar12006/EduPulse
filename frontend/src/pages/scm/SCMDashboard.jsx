import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSCMStudents, getClusteredStudents, DEMO_SCM } from '../../data/demoData';
import API from '../../utils/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

export default function SCMDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alertSending, setAlertSending] = useState(null);
  const [alertSuccess, setAlertSuccess] = useState('');

  // Load demo data directly — no backend needed
  const allStudents = getSCMStudents();
  const clusters = getClusteredStudents();
  const priorityQueue = allStudents.filter(s => s.cluster === 'below' || (s.attendancePercentage && s.attendancePercentage < 75));
  const analytics = { avgHealthScore: 71, dropoutRiskPercentage: 20 };
  const loading = false;

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
      // Send real email via backend demo-alert endpoint (no auth required)
      const parentEmail = student._id === 'stu_aarav' ? 'kapadnisvijay331@gmail.com' : 'kapadnisvijay331@gmail.com';
      const res = await fetch('http://localhost:8000/api/alerts/demo-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          parentEmail,
          parentName: student._id === 'stu_aarav' ? 'Mr. Ramesh Sharma' : 'Parent/Guardian',
          reason: student.reasons?.[0] || `${student.name} requires academic intervention.`,
          alertType: student.attendancePercentage < 75 ? 'attendance' : 'academics',
          attendance: student.attendancePercentage || 0,
          healthScore: student.academicHealthScore || 0,
          scmName: user?.name || 'Prof. Ananya Sharma',
        })
      });
      const data = await res.json();
      if (data.success) {
        setAlertSuccess(`📧 Real email sent to ${parentEmail}! Check inbox.`);
      } else {
        setAlertSuccess(`⚠️ Email error: ${data.message}`);
      }
    } catch (err) {
      // Fallback: simulate if backend unreachable
      setAlertSuccess(`✅ Alert logged for ${student.name} (backend offline — check server)`);
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
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#0f172a' }}>
      {/* ── TOP NAV (Premium Glass) ─────────────────────────────── */}
      <nav style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', padding: '0 32px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}>🎓</div>
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800, color: '#1e40af', letterSpacing: '-0.5px' }}>EduPulse Command</div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>SCM OVERSEER HUB</div>
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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/scm/attendance" style={{ padding: '10px 20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', color: '#1d4ed8', fontWeight: 700, fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)' }} onMouseEnter={e=>e.target.style.background='#dbeafe'} onMouseLeave={e=>e.target.style.background='#eff6ff'}>
            📅 Attendance Terminal
          </Link>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', position: 'relative', transition: 'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
            🔔
            {priorityQueue.length > 0 && <span style={{ position: 'absolute', top: -2, right: -4, background: '#ef4444', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, border: '2px solid white', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>{priorityQueue.length}</span>}
          </button>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#0f172a', fontWeight: 700, fontSize: '15px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800 }}>👨‍🏫</div>
          </button>
        </div>
      </nav>

      {alertSuccess && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: alertSuccess.startsWith('✅') ? '#064e3b' : '#7f1d1d', color: 'white', padding: '16px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'slideUpFade 0.4s ease forwards', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {alertSuccess}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px', padding: '40px', maxWidth: '1800px', margin: '0 auto' }}>
        
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
                      <button onClick={() => sendAlert(s)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid transparent', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }} onMouseEnter={e=>{e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 6px 15px rgba(239,68,68,0.4)'}} onMouseLeave={e=>{e.target.style.transform='none'; e.target.style.boxShadow='0 2px 8px rgba(239,68,68,0.3)'}}>
                        Emit Parent Alert
                      </button>
                      <button onClick={() => navigate(`/scm/student/${s._id}`)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s' }} onMouseEnter={e=>{e.target.style.background='#dbeafe'}} onMouseLeave={e=>{e.target.style.background='#eff6ff'}}>
                        Inspect Dossier
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
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Macro Cohort Telemetry</h3>
                <span style={{ fontSize: '18px' }}>🛰️</span>
              </div>
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Doughnut data={clusterData} options={{ cutout: '70%', plugins: { legend: { position: 'right', labels: { font: { family: "'Plus Jakarta Sans'", size: 12, weight: 600 }, padding: 12, usePointStyle: true, boxWidth: 8 } }, tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleFont: { family: "'Outfit'", size: 14 }, bodyFont: { family: "'Outfit'", size: 14 }, padding: 12, cornerRadius: 12 } }, responsive: true, maintainAspectRatio: false }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))', borderRadius: '14px', padding: '16px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '28px', color: '#10B981', lineHeight: 1 }}>{analytics.avgHealthScore}%</div>
                  <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 600, marginTop: '8px', letterSpacing: '0.5px' }}>GLOBAL AVG HEALTH</div>
                </div>
                <div style={{ background: analytics.dropoutRiskPercentage > 20 ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))' : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))', borderRadius: '14px', padding: '16px', textAlign: 'center', border: `1px solid ${analytics.dropoutRiskPercentage > 20 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '28px', color: analytics.dropoutRiskPercentage > 20 ? '#ef4444' : '#10B981', lineHeight: 1 }}>{analytics.dropoutRiskPercentage}%</div>
                  <div style={{ fontSize: '12px', color: analytics.dropoutRiskPercentage > 20 ? '#991b1b' : '#065f46', fontWeight: 600, marginTop: '8px', letterSpacing: '0.5px' }}>ATTRITION RISK</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─ RIGHT: NEURAL CLUSTERING ENGINE ───────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animationDelay: '0.3s' }} className="animate-entrance">
          <div className="metric-glass" style={{ padding: '32px 40px', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>K-Means Neural Stratification</h2>
                <p style={{ color: '#64748b', fontSize: '15px', fontWeight: 500, margin: 0 }}>Real-time algorithmic bucketing of your mentor cohort based on academic health and attendance vectors.</p>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button style={{ padding: '12px 24px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '18px' }}>⚙️</span> Refresh Matrix
                </button>
              </div>
            </div>

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
    </div>
  );
}
