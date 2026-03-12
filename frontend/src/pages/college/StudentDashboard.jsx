import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_STUDENTS } from '../../data/demoData';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, PointElement, LineElement, Filler
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

const QUICK_ACTIONS = [
  { icon: '⌘', label: 'Academic Grades', path: '/student/grades', color: '#38bdf8' },
  { icon: '⏱', label: 'Attendance Log', path: '/student/attendance', color: '#10b981' },
  { icon: '⚲', label: 'Career Trajectory', path: '/student/career', color: '#c084fc' },
  { icon: '✧', label: 'AI Counselor', path: '/student/sparky', color: '#fb7185' },
  { icon: '★', label: 'Milestones', path: '/student/achievements', color: '#fbbf24' },
  { icon: '◱', label: 'Performance Analytics', path: '/student/progress', color: '#2dd4bf' },
  { icon: '▤', label: 'Study Planner', path: '/student/grades', color: '#f87171' },
  { icon: '⑆', label: 'Peer Network', path: '/student', color: '#fb923c' }
];

const MOODS = [
  { v: 1, label: 'Critical Stress' },
  { v: 2, label: 'Suboptimal' },
  { v: 3, label: 'Baseline' },
  { v: 4, label: 'Optimal' },
  { v: 5, label: 'Peak State' }
];

const CLUSTER_CONFIG = {
  top: { label: 'TOP QUARTILE', color: '#10B981', border: '#059669' },
  medium: { label: 'MEDIAN RANGE', color: '#F59E0B', border: '#D97706' },
  below: { label: 'INTERVENTION YIELD', color: '#EF4444', border: '#DC2626', pulse: true }
};

function HealthMeter({ score }) {
  const color = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="160" height="160" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
        <circle cx="80" cy="80" r="60" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 8px ${color}66)` }} />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '42px', fontWeight: 300, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '1px', marginTop: '4px', textTransform: 'uppercase' }}>Health Index</div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [moodLogged, setMoodLogged] = useState(false);

  // Load demo data directly based on logged-in student
  const student = DEMO_STUDENTS[user?.studentId] || DEMO_STUDENTS['stu_aarav'];
  const grades = student.grades || { semesterSummary: [] };
  const attendanceSummary = student.attendance || { overall: 0, summary: [] };
  const insight = student.careerInsight || '';

  const logMood = (moodVal) => { setMoodLogged(true); };

  const cluster = student?.cluster || 'medium';
  const cc = CLUSTER_CONFIG[cluster];
  const healthScore = student?.academicHealthScore || 50;
  const attendance = attendanceSummary?.overall ?? student?.attendancePercentage ?? 88;

  const semData = {
    labels: (grades?.semesterSummary || []).map(s => `S${s.semester}`),
    datasets: [{
      label: 'CGPA Equiv',
      data: (grades?.semesterSummary || []).map(s => s.average),
      fill: true,
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56, 189, 248, 0.05)',
      borderWidth: 2,
      tension: 0.4, 
      pointBackgroundColor: '#0f172a', 
      pointBorderColor: '#38bdf8',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Inter', size: 12 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'Inter', size: 10 } } },
      x: { grid: { display: false, drawBorder: false }, ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'Inter', size: 10 } } }
    }
  };

  if (!user) { navigate('/login'); return null; }

  // Sleek CSS block
  const sleekCard = { background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', backdropFilter: 'blur(20px)' };
  const labelStyle = { fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* ── TOP NAV ──────────────────────────────── */}
      <nav style={{ background: 'rgba(2, 6, 23, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', borderRadius: '6px' }}></div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>EduPulse</span>
          </Link>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['Overview', 'Academics', 'Intelligence', 'Network'].map((n, i) => (
              <div key={i} style={{ color: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', background: i === 0 ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'all 0.2s' }}>
                {n}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>SYS. STATUS:</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#10b981' }}>OPTIMAL</span>
          </div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>{user.name}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace" }}>{student?.rollNumber || 'GUEST'}</div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#38bdf8' }}>
              {user.name?.charAt(0)}
            </div>
          </button>
        </div>
      </nav>

      {/* ── MAIN LAYOUT ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: '24px', padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* ─ LEFT: IDENTITY & STATE ───────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={sleekCard}>
            <div style={labelStyle}><span style={{ color: '#38bdf8' }}>///</span> IDENTITY MATRIX</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <HealthMeter score={healthScore} />
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Designation</span>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{student?.department}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Cohort</span>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Semester {student?.semester}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Classification</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {cc.pulse && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cc.color, boxShadow: `0 0 8px ${cc.color}` }}></span>}
                  <span style={{ fontSize: '11px', fontWeight: 700, color: cc.color, letterSpacing: '0.5px' }}>{cc.label}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={sleekCard}>
            <div style={labelStyle}><span style={{ color: '#c084fc' }}>///</span> BIOMETRIC STATE</div>
            {!moodLogged ? (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '16px', lineHeight: 1.5 }}>Synchronize your cognitive state to calibrate AI recommendations.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {MOODS.map(m => (
                    <button key={m.v} onClick={() => logMood(m.v)} title={m.label}
                      style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', 
                        height: '48px', borderRadius: '8px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.4)', fontSize: '16px'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                      {m.v === 1 ? '一' : m.v === 2 ? '二' : m.v === 3 ? '三' : m.v === 4 ? '四' : '五'}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '16px' }}>✓</span>
                <span style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.5px' }}>STATE SYNCHRONIZED</span>
              </div>
            )}
          </div>

        </div>

        {/* ─ CENTER: COMMAND CENTER ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ ...sleekCard, background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(2, 6, 23, 0.9))', borderTop: '1px solid rgba(56, 189, 248, 0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1), transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
            <div style={labelStyle}><span style={{ color: '#38bdf8' }}>///</span> GEMINI INSIGHT PROTOCOL</div>
            <p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
              {insight || `System initialized, ${user.name?.split(' ')[0] || 'Operator'}. Attendance metrics detect a ${attendance}% participation rate. ${attendance >= 85 ? "Trajectory is nominal. No immediate corrections required." : attendance >= 75 ? "Sub-optimal trajectory detected. Recommend increased engagement." : "CRITICAL WARNING: Intervention protocol required to maintain academic standing."}`}
            </p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>INITIATE FULL ANALYSIS</button>
              <button style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>DISMISS</button>
            </div>
          </div>

          <div style={{ ...sleekCard, flex: 1 }}>
            <div style={labelStyle}><span style={{ color: '#f59e0b' }}>///</span> TACTICAL PROTOCOLS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
              {QUICK_ACTIONS.map((qa, i) => (
                <Link key={i} to={qa.path} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '12px', padding: '20px 16px', textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    height: '100%'
                  }}
                    onMouseEnter={e => { 
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; 
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; 
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.querySelector('.icon-cnt').style.color = qa.color;
                    }}
                    onMouseLeave={e => { 
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; 
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; 
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.querySelector('.icon-cnt').style.color = 'rgba(255,255,255,0.3)';
                    }}>
                    <div className="icon-cnt" style={{ fontSize: '24px', marginBottom: '12px', color: 'rgba(255,255,255,0.3)', transition: 'color 0.3s' }}>{qa.icon}</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{qa.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ─ RIGHT: TELEMETRY ──────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={sleekCard}>
            <div style={labelStyle}><span style={{ color: '#10b981' }}>///</span> PRESENCE TELEMETRY</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '16px' }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '48px', fontWeight: 300, color: attendance >= 85 ? '#10B981' : attendance >= 75 ? '#F59E0B' : '#EF4444', lineHeight: 0.9, letterSpacing: '-2px' }}>
                {attendance}<span style={{ fontSize: '24px', fontWeight: 400 }}>%</span>
              </div>
              <div style={{ paddingBottom: '4px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>System Average</div>
              </div>
            </div>
            
            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ height: '100%', width: `${attendance}%`, background: attendance >= 85 ? '#10B981' : attendance >= 75 ? '#F59E0B' : '#EF4444', transition: 'width 1s ease' }} />
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              {(attendanceSummary?.summary || []).slice(0, 3).map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{s.subject}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: s.percentage >= 85 ? '#10b981' : s.percentage >= 75 ? '#f59e0b' : '#ef4444' }}>{s.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{...sleekCard, flex: 1}}>
            <div style={labelStyle}><span style={{ color: '#38bdf8' }}>///</span> PERFORMANCE VECTOR</div>
            <div style={{ height: '160px', marginTop: '20px' }}>
              {(grades?.semesterSummary?.length > 0) ? (
                <Line data={semData} options={chartOptions} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.2)', fontSize: '12px', letterSpacing: '1px' }}>AWAITING DATA STREAM</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
