import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { DEMO_STUDENTS, DEMO_PARENT } from '../../data/demoData';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Add global styles for animations
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes pulseGlow {
    0% { box-shadow: 0 0 15px rgba(249, 115, 22, 0.4); }
    50% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.8); }
    100% { box-shadow: 0 0 15px rgba(249, 115, 22, 0.4); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes gradientBg {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
    border-radius: 24px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .glass-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px 0 rgba(31, 38, 135, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.8);
  }
  
  .premium-text-gradient {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .animate-slide-up {
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
`;

const LANG = {
  en: {
    greeting: 'Welcome',
    academicHealth: 'Academic Health Profile',
    doingWell: 'On Track & Exceling',
    needsAttention: 'Action Required',
    needsImmediate: 'Immediate Support Needed',
    attendance: 'Attendance Overview',
    attendingRegularly: 'Excellent consistency.',
    missingSome: 'Irregular attendance detected.',
    attendanceCritical: 'Critical attendance risk.',
    recentAlerts: 'Priority Notifications',
    performance: 'Academic Performance',
    contactSCM: 'Contact Counselor',
    bookMeeting: 'Schedule Meeting',
    noAlerts: 'All systems green. No active alerts.',
    excellent: 'Excellent', good: 'Good', average: 'Average', belowAverage: 'Below Average'
  },
  hi: {
    greeting: 'स्वागत है',
    academicHealth: 'शैक्षणिक स्वास्थ्य प्रोफ़ाइल',
    doingWell: 'उत्कृष्ट प्रदर्शन',
    needsAttention: 'ध्यान देने योग्य',
    needsImmediate: 'तत्काल सहायता की आवश्यकता',
    attendance: 'उपस्थिति अवलोकन',
    attendingRegularly: 'शानदार निरंतरता',
    missingSome: 'अनियमित उपस्थिति का पता चला',
    attendanceCritical: 'उपस्थिति गंभीर रूप से कम',
    recentAlerts: 'प्राथमिक सूचनाएं',
    performance: 'शैक्षणिक प्रदर्शन',
    contactSCM: 'काउंसलर से संपर्क करें',
    bookMeeting: 'मीटिंग शेड्यूल करें',
    noAlerts: 'सब ठीक है। कोई अलर्ट नहीं।',
    excellent: 'उत्कृष्ट', good: 'अच्छा', average: 'औसत', belowAverage: 'औसत से नीचे'
  },
  mr: {
    greeting: 'स्वागत आहे',
    academicHealth: 'शैक्षणिक आरोग्य',
    doingWell: 'उत्कृष्ट कामगिरी',
    needsAttention: 'लक्ष देणे आवश्यक',
    needsImmediate: 'तातडीने मदत लागेल',
    attendance: 'उपस्थिती',
    attendingRegularly: 'उत्कृष्ट सातत्य आहे',
    missingSome: 'अनियमित उपस्थिती आढळली',
    attendanceCritical: 'उपस्थिती अत्यंत कमी आहे',
    recentAlerts: 'प्राधान्य सूचना',
    performance: 'शैक्षणिक कामगिरी',
    contactSCM: 'समुपदेशकास संपर्क करा',
    bookMeeting: 'भेट ठरवा',
    noAlerts: 'सर्व ठीक आहे. कोणताही अलर्ट नाही.',
    excellent: 'उत्कृष्ट', good: 'चांगले', average: 'सरासरी', belowAverage: 'सरासरीपेक्षा कमी'
  }
};

function GradeLabel({ pct, lang }) {
  const t = LANG[lang];
  if (pct >= 80) return <span style={{ color: '#10B981', fontWeight: 800 }}>{t.excellent}</span>;
  if (pct >= 65) return <span style={{ color: '#3B82F6', fontWeight: 800 }}>{t.good}</span>;
  if (pct >= 50) return <span style={{ color: '#F59E0B', fontWeight: 800 }}>{t.average}</span>;
  return <span style={{ color: '#EF4444', fontWeight: 800 }}>{t.belowAverage}</span>;
}

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const [lang, setLang] = useState(user?.language || 'en');
  const [alerts, setAlerts] = useState([]);

  const t = LANG[lang] || LANG.en;

  // Load demo data directly — no backend needed
  const childId = (user?.parentOf?.[0]) || 'stu_aarav';
  const student = DEMO_STUDENTS[childId] || DEMO_STUDENTS['stu_aarav'];
  const demoParent = DEMO_PARENT;

  useEffect(() => {
    // Load demo alerts from DEMO_PARENT
    setAlerts(demoParent.alerts.map(a => ({
      ...a,
      _id: a.id,
      alertType: a.type,
      emailSubject: a.type === 'attendance' ? 'Attendance Alert' : a.type === 'academics' ? 'Academic Alert' : 'Mood Alert',
      triggerReason: a.message,
      isRead: a.read,
      sentAt: a.date,
    })));
    // Inject global styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  const markAlertRead = (alertId) => {
    setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, isRead: true } : a));
  };

  // Derived from demo data
  const healthScore = student.academicHealthScore || 52;
  const overallAttendance = student.attendancePercentage || 68;
  const unreadAlerts = alerts.filter(a => !a.isRead);
  const healthLabel = healthScore >= 70 ? t.doingWell : healthScore >= 45 ? t.needsAttention : t.needsImmediate;
  const healthColor = healthScore >= 70 ? '#10B981' : healthScore >= 45 ? '#F59E0B' : '#ef4444';
  const healthGlow = healthScore >= 70 ? 'rgba(16,185,129,0.4)' : healthScore >= 45 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)';
  const attendanceMessage = overallAttendance >= 85 ? t.attendingRegularly : overallAttendance >= 75 ? t.missingSome : t.attendanceCritical;

  const radarData = {
    labels: ['STEM Subjects', 'Languages', 'Critical Thinking', 'Participation', 'Assignments'],
    datasets: [{
      label: 'Skill Proficiency',
      data: [healthScore + 5, healthScore - 10, healthScore + 15, overallAttendance, healthScore - 5],
      backgroundColor: `rgba(249, 115, 22, 0.15)`,
      borderColor: '#f97316',
      pointBackgroundColor: '#f97316',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#f97316',
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
      fill: true
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(0,0,0,0.08)' },
        grid: { color: 'rgba(0,0,0,0.08)', circular: true },
        pointLabels: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 700 }, color: '#475569' },
        ticks: { display: false, min: 0, max: 100 }
      }
    },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: "'Outfit', sans-serif", size: 13 },
        bodyFont: { family: "'Outfit', sans-serif", size: 13 },
        padding: 12,
        cornerRadius: 12,
        displayColors: false
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(-45deg, #fffbeb, #ffedd5, #f0fdfa, #eff6ff)',
      backgroundSize: '400% 400%',
      animation: 'gradientBg 15s ease infinite',
      fontFamily: "'Plus Jakarta Sans', sans-serif", 
      color: '#0f172a' 
    }}>
      {/* ── TOP NAV (Glassmorphic) ─────────────────────────────── */}
      <nav style={{ 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.5)', 
        padding: '0 40px', 
        height: '80px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            fontSize: '32px', 
            background: 'linear-gradient(135deg, #f97316, #ea580c)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            animation: 'float 6s ease-in-out infinite'
          }}>👨‍👩‍👧‍👦</div>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, color: '#ea580c', letterSpacing: '-0.5px' }}>EduPulse Guardian</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Premium Parent Portal</div>
          </div>
          {student && (
            <div style={{ marginLeft: '32px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 247, 237, 0.8)', border: '1px solid rgba(255, 237, 213, 0.8)', borderRadius: '16px', padding: '8px 20px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
              <span style={{ fontSize: '20px' }}>{student.userId?.avatar || '🧒'}</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#c2410c', fontSize: '15px' }}>{student.name}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <select value={lang} onChange={e => setLang(e.target.value)}
            style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', fontSize: '14px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", background: 'rgba(255,255,255,0.5)', cursor: 'pointer', outline: 'none', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
            onMouseEnter={e=>e.target.style.background='white'}
            onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.5)'}>
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 हिंदी</option>
            <option value="mr">🟠 मराठी</option>
          </select>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '26px', position: 'relative', transition: 'transform 0.2s' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
            🔔
            {unreadAlerts.length > 0 && <span style={{ position: 'absolute', top: -2, right: -4, background: '#ef4444', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, border: '2px solid white', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)' }}>{unreadAlerts.length}</span>}
          </button>
          <div style={{ width: '1px', height: '40px', background: 'rgba(226, 232, 240, 0.8)' }}></div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#0f172a', fontWeight: 700, fontSize: '15px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>{user?.name?.charAt(0)}</div>
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 40px' }}>
        <>
            {/* Header */}
            <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '48px', color: '#0f172a', margin: '0 0 12px', fontWeight: 800, letterSpacing: '-1px' }}>
                  {t.greeting}, <span className="premium-text-gradient">{user?.name?.split(' ')[0]}</span> 👋
                </h1>
                <p style={{ color: '#64748b', fontSize: '18px', margin: 0, fontWeight: 500 }}>Real-time comprehensive view of {student.name}'s academic journey.</p>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button style={{ 
                  padding: '14px 28px', 
                  background: 'white', 
                  border: '1px solid rgba(226, 232, 240, 0.8)', 
                  borderRadius: '16px', 
                  fontWeight: 700, 
                  color: '#0f172a', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '15px'
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 25px rgba(0,0,0,0.06)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 15px rgba(0,0,0,0.03)'}}>
                  <span style={{ fontSize: '20px' }}>📥</span> Download Full Report
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '32px', marginBottom: '32px' }}>
              
              {/* PRIMARY METRICS REIMAGINED */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', animationDelay: '0.1s' }} className="animate-slide-up">
                
                {/* Academic Health Card */}
                <div className="glass-card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: `radial-gradient(circle, ${healthGlow}, transparent 70%)`, transform: 'translate(30%, -30%)', filter: 'blur(10px)' }}></div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `rgba(${healthScore>=70?'16,185,129':healthScore>=45?'245,158,11':'239,68,68'}, 0.1)`, color: healthColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: `0 4px 12px ${healthGlow}` }}>📊</div>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{t.academicHealth}</h2>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
                      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 10px ${healthGlow})` }}>
                        <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(226, 232, 240, 0.5)" strokeWidth="12" />
                        <circle cx="70" cy="70" r="56" fill="none" stroke={healthColor} strokeWidth="12"
                          strokeDasharray={2 * Math.PI * 56} strokeDashoffset={2 * Math.PI * 56 - (healthScore / 100) * 2 * Math.PI * 56}
                          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '42px', fontWeight: 800, color: healthColor, lineHeight: 1, letterSpacing: '-1.5px' }}>{healthScore}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>{healthLabel}</div>
                      <div style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>
                        {student.cluster === 'top' ? 'Demonstrating exceptional academic mastery across core subjects. Maintain current trajectory.' :
                         student.cluster === 'below' ? 'Early intervention protocols recommended to stabilize performance metrics.' :
                         'Consistent academic delivery with specific, actionable areas for optimization.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Card */}
                <div className="glass-card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: `radial-gradient(circle, ${overallAttendance>=85?'rgba(16,185,129,0.3)':'rgba(245,158,11,0.3)'}, transparent 70%)`, transform: 'translate(30%, -30%)', filter: 'blur(10px)' }}></div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `rgba(${overallAttendance>=85?'16,185,129':'245,158,11'}, 0.1)`, color: overallAttendance>=85?'#10b981':'#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: `0 4px 12px rgba(${overallAttendance>=85?'16,185,129':'245,158,11'}, 0.2)` }}>📅</div>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{t.attendance}</h2>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '28px' }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '56px', fontWeight: 800, color: overallAttendance >= 85 ? '#10B981' : overallAttendance >= 75 ? '#F59E0B' : '#EF4444', lineHeight: 1, letterSpacing: '-2px', textShadow: `0 4px 12px rgba(${overallAttendance>=85?'16,185,129':'245,158,11'}, 0.3)` }}>{overallAttendance}</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#94a3b8' }}>%</div>
                  </div>

                  <div style={{ height: '10px', borderRadius: '5px', background: 'rgba(226, 232, 240, 0.5)', overflow: 'hidden', marginBottom: '24px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ height: '100%', borderRadius: '5px', width: `${overallAttendance}%`, background: overallAttendance >= 85 ? 'linear-gradient(90deg, #10B981, #059669)' : overallAttendance >= 75 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #EF4444, #DC2626)', transition: 'width 2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }} />
                  </div>

                  <div style={{ background: overallAttendance >= 85 ? 'rgba(236, 253, 245, 0.8)' : overallAttendance >= 75 ? 'rgba(255, 251, 235, 0.8)' : 'rgba(254, 242, 242, 0.8)', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', fontWeight: 700, color: overallAttendance >= 85 ? '#065f46' : overallAttendance >= 75 ? '#b45309' : '#991b1b', borderLeft: `4px solid ${overallAttendance >= 85 ? '#10B981' : overallAttendance >= 75 ? '#F59E0B' : '#EF4444'}` }}>
                    {attendanceMessage}
                  </div>
                </div>

                {/* Radar Chart (Skill Tree) */}
                <div className="glass-card" style={{ padding: '40px', gridColumn: 'span 2', display: 'flex', gap: '48px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>🎯</span> Skill Proficiency Matrix
                    </h2>
                    <p style={{ color: '#475569', fontSize: '16px', lineHeight: 1.7, margin: '0 0 32px', fontWeight: 500 }}>
                      A multidimensional cognitive mapping of {student.name}'s academic strengths against areas that could yield high growth upon targeted intervention.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div style={{ borderLeft: '4px solid #10b981', paddingLeft: '16px', background: 'linear-gradient(90deg, rgba(16,185,129,0.05), transparent)', padding: '16px' }}>
                        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Dominant Trait</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>Critical Thinking</div>
                      </div>
                      <div style={{ borderLeft: '4px solid #f97316', paddingLeft: '16px', background: 'linear-gradient(90deg, rgba(249,115,22,0.05), transparent)', padding: '16px' }}>
                        <div style={{ fontSize: '12px', color: '#f97316', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Alpha Growth Area</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>Assignments</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ width: '380px', height: '380px', flexShrink: 0, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle, rgba(249,115,22,0.05), transparent 70%)', zIndex: 0 }}></div>
                    <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                      <Radar data={radarData} options={radarOptions} />
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT SIDEBAR: Alerts + Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animationDelay: '0.2s' }} className="animate-slide-up">
                
                {/* Priority Alerts */}
                <div className="glass-card" style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🔔</span> {t.recentAlerts}
                    </div>
                    {unreadAlerts.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '99px', padding: '4px 14px', fontSize: '12px', fontWeight: 800, boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)', animation: 'pulseGlow 2s infinite' }}>{unreadAlerts.length} Action Required</span>}
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {alerts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '50px 0', border: '2px dashed rgba(226, 232, 240, 0.8)', borderRadius: '20px', background: 'rgba(248, 250, 252, 0.5)' }}>
                        <div style={{ fontSize: '42px', marginBottom: '16px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>✅</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#64748b' }}>{t.noAlerts}</div>
                      </div>
                    ) : (
                      alerts.map((alert, i) => (
                        <div key={i} onClick={() => markAlertRead(alert._id)} style={{
                          padding: '20px', borderRadius: '16px',
                          background: !alert.isRead ? 'rgba(255, 241, 242, 0.8)' : 'rgba(248, 250, 252, 0.6)',
                          border: `1px solid ${!alert.isRead ? 'rgba(254, 205, 211, 0.8)' : 'rgba(226, 232, 240, 0.5)'}`,
                          cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', position: 'relative',
                          boxShadow: !alert.isRead ? '0 4px 15px rgba(225, 29, 72, 0.05)' : 'none'
                        }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.06)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = !alert.isRead ? '0 4px 15px rgba(225, 29, 72, 0.05)' : 'none'; }}>
                          
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ fontSize: '28px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))', animation: !alert.isRead ? 'float 3s ease-in-out infinite' : 'none' }}>
                              {alert.alertType === 'attendance' ? '📅' : alert.alertType === 'performance' ? '📊' : alert.alertType === 'mood' ? '😔' : '⚠️'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: !alert.isRead ? '#be123c' : '#0f172a', fontSize: '16px', lineHeight: 1.4 }}>{alert.emailSubject || `${alert.alertType} Alert`}</div>
                                {!alert.isRead && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', flexShrink: 0, marginTop: '4px', boxShadow: '0 0 8px #ef4444' }}></div>}
                              </div>
                              <div style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px', fontWeight: 500 }}>{alert.triggerReason}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <span>{new Date(alert.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                <span style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '99px' }}>{alert.isRead ? 'Acknowledged' : 'Click to Acknowledge'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Contact SCM Action Card (Dark Premium Variant) */}
                <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.95))', padding: '40px', color: 'white', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.05, fontSize: '160px', transform: 'translate(20%, -20%)', filter: 'blur(2px)' }}>👨‍🏫</div>
                  <div style={{ position: 'absolute', bottom: -20, left: -20, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 70%)', filter: 'blur(20px)' }}></div>
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'inline-block', fontSize: '12px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#38bdf8', marginBottom: '16px', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 12px', borderRadius: '99px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>Direct Support Line</div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '26px', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>Initiate a dialogue regarding {student.name}'s trajectory?</h3>
                    <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.7, margin: '0 0 32px', fontWeight: 400 }}>Directly contact the Student Counselor / Mentor (SCM) to arrange a personalized, data-driven intervention strategy.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <a href="mailto:scm@demo.com" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '14px', textDecoration: 'none', color: 'white', fontWeight: 700, fontSize: '16px', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)' }} onMouseEnter={e=>{e.target.style.transform='translateY(-3px)'; e.target.style.boxShadow='0 8px 25px rgba(37, 99, 235, 0.6)'}} onMouseLeave={e=>{e.target.style.transform='none'; e.target.style.boxShadow='0 4px 15px rgba(37, 99, 235, 0.4)'}}>
                        <span>✉️</span> Message Counselor
                      </a>
                      <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: '16px', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.3s' }} onMouseEnter={e=>{e.target.style.background='rgba(255,255,255,0.08)'; e.target.style.borderColor='rgba(255,255,255,0.2)'}} onMouseLeave={e=>{e.target.style.background='rgba(255,255,255,0.03)'; e.target.style.borderColor='rgba(255,255,255,0.1)'}}>
                        <span>📅</span> Schedule a Virtual Visit
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </>
        </div>
    </div>
  );
}
