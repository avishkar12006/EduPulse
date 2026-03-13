import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CareerTimeMachine from '../../components/CareerTimeMachine';
import MoodFaces         from '../../components/MoodFaces';
import MoodCamera        from '../../components/MoodCamera';
import SparkyChat        from '../../components/SparkyChat';
import API from '../../utils/api';

/* ── Design: Midnight Blue + Neon Emerald command center ─────────────────── */
const BG      = '#020818';
const CARD    = 'rgba(255,255,255,0.03)';
const BORDER  = '1px solid rgba(255,255,255,0.07)';
const ACCENT  = '#3B82F6';
const EMERALD = '#10b981';
const GOLD    = '#F59E0B';
const glass   = (p='20px') => ({ background:CARD, border:BORDER, borderRadius:'12px', backdropFilter:'blur(10px)', padding:p });

const NAV = [
  { id:'command',    icon:'⚙️', label:'Command Deck'   },
  { id:'career',     icon:'🎯', label:'Mission Career'  },
  { id:'planner',    icon:'📅', label:'Exam Planner'    },
  { id:'mood',       icon:'📡', label:'Mood Radar'      },
  { id:'subjects',   icon:'📊', label:'Subject Intel'   },
];

const STREAMS = [
  { label:'Science',           color:'#38bdf8', icon:'⚗️',  careers:['Engineer','Doctor','Researcher','Data Scientist','Pilot'] },
  { label:'Commerce',          color:'#f59e0b', icon:'📈',  careers:['CA','MBA','Banker','Entrepreneur','Economist'] },
  { label:'Arts & Humanities', color:'#ec4899', icon:'🎨',  careers:['Lawyer','Journalist','Designer','Civil Services','Psychologist'] },
];

const DEMO_SUBJECTS = [
  { name:'Mathematics',   code:'041', score:74, trend:+4, nepLevel:'Achieving',  predictedBoard:76, attendance:81, icon:'📐', color:'#38bdf8' },
  { name:'Physics',       code:'042', score:68, trend:+2, nepLevel:'Developing', predictedBoard:70, attendance:77, icon:'⚡', color:'#f59e0b' },
  { name:'Chemistry',     code:'043', score:71, trend:-1, nepLevel:'Achieving',  predictedBoard:69, attendance:83, icon:'🧪', color:'#10b981' },
  { name:'Biology',       code:'044', score:82, trend:+6, nepLevel:'Mastering',  predictedBoard:84, attendance:90, icon:'🔬', color:'#ec4899' },
  { name:'English',       code:'301', score:85, trend:+1, nepLevel:'Mastering',  predictedBoard:86, attendance:92, icon:'📖', color:'#a78bfa' },
];

const EXAM_DEFAULTS = [
  { subject:'Mathematics', date:'2027-03-05', board:'CBSE' },
  { subject:'Physics',     date:'2027-03-07', board:'CBSE' },
  { subject:'Chemistry',   date:'2027-03-10', board:'CBSE' },
  { subject:'Biology',     date:'2027-03-12', board:'CBSE' },
  { subject:'English',     date:'2027-03-15', board:'CBSE' },
];

export default function CareerCommand() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [nav, setNav]               = useState('command');
  const [mood, setMood]             = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [careers, setCareers]       = useState([]);
  const [careerLoading, setCareerLoading] = useState(false);
  const [studyPlan, setStudyPlan]   = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [streamPick, setStreamPick] = useState(null);
  const [probability, setProbability] = useState(62);

  const firstName = user?.name?.split(' ')[0] || 'Cadet';

  useEffect(() => {
    const token = localStorage.getItem('ep_token') || sessionStorage.getItem('ep_token');
    if (!token) return;
    fetch('/api/auth/me', { headers:{ Authorization:`Bearer ${token}` }})
      .then(r=>r.json()).then(d => {
        if (d.studentData) {
          setStudentData(d.studentData);
          if (d.studentData.successProbability) setProbability(d.studentData.successProbability);
        }
      }).catch(() => {});
  }, []);

  const classNum = parseInt(studentData?.class || '10');
  const xp       = studentData?.xpPoints || 450;
  const level    = studentData?.level    || 3;
  const streak   = studentData?.streakDays || 12;
  const health   = studentData?.academicHealthScore || 74;

  const handleMood = async (val) => {
    setMood(val);
    try { await API.post('/school/mood/log', { studentId: studentData?._id || user?._id, numericScore: val, mood: val>=4?'focused':val<=2?'struggling':'neutral', note:'' }); } catch {}
  };

  const loadCareers = async () => {
    if (careers.length || careerLoading) return;
    setCareerLoading(true);
    try {
      const { data } = await API.get(`/school/career/${studentData?._id || user?._id}`);
      setCareers(data.careers || []);
    } catch {
      setCareers([
        { title:'Software Engineer',  industry:'Technology',     successProbability:78, salaryStart:'₹8-20 LPA',  salaryGrowth:'₹25-70 LPA',  topSkills:[{name:'DSA',matched:60},{name:'System Design',matched:30}], timelineMonths:24 },
        { title:'Data Scientist',     industry:'Analytics',      successProbability:68, salaryStart:'₹10-25 LPA', salaryGrowth:'₹30-80 LPA',  topSkills:[{name:'Python',matched:40},{name:'ML',matched:35}],          timelineMonths:24 },
        { title:'Product Manager',    industry:'Business & Tech', successProbability:62, salaryStart:'₹12-25 LPA', salaryGrowth:'₹30-90 LPA', topSkills:[{name:'Strategy',matched:30},{name:'Analytics',matched:45}], timelineMonths:24 },
      ]);
    }
    setCareerLoading(false);
  };

  const generatePlan = async () => {
    if (studyPlan || planLoading) return;
    setPlanLoading(true);
    try {
      const { data } = await API.post('/school/planner/generate', {
        studentId: studentData?._id || user?._id,
        examDates: EXAM_DEFAULTS,
      });
      setStudyPlan(data.plan);
    } catch { setStudyPlan({ dailyPlan: EXAM_DEFAULTS.map((e,i) => ({ date: e.date, subject: e.subject, topic: `${e.subject} Chapter ${i+1}`, duration:90, priority:'high', type:'learn' })), totalHoursPlanned:120 }); }
    setPlanLoading(false);
  };

  useEffect(() => { if (nav === 'career') loadCareers(); }, [nav]);

  if (!user) { navigate('/login'); return null; }

  return (
    <div style={{ minHeight:'100vh', background:BG, color:'#f8fafc', fontFamily:"'Space Mono', 'Courier New', monospace", display:'flex', flexDirection:'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @keyframes scanline{0%{top:0}100%{top:100%}}
        @keyframes glitch{0%,100%{clip-path:none}50%{clip-path:inset(30% 0 50% 0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes barFill{from{width:0%}to{width:var(--w)}}
        .cmd-nav-btn:hover{border-color:${ACCENT}!important;color:${ACCENT}!important;}
        .career-card:hover{border-color:${ACCENT}44!important;background:rgba(59,130,246,0.05)!important;}
        .plan-row:hover{background:rgba(255,255,255,0.04)!important;}
      `}</style>

      {/* Scanline overlay */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.012) 2px,rgba(255,255,255,0.012) 4px)', pointerEvents:'none', zIndex:0 }} />

      {/* ── TOP NAV ─────────────────────────────────────── */}
      <header style={{ padding:'16px 32px', display:'flex', alignItems:'center', gap:'24px', background:'rgba(0,0,0,0.5)', borderBottom:BORDER, zIndex:20, position:'sticky', top:0 }}>
        {/* Logo */}
        <div style={{ fontSize:'11px', fontWeight:700, color:EMERALD, letterSpacing:'3px', whiteSpace:'nowrap' }}>EDUPULSE//CAREER-CMD</div>
        {/* Nav */}
        <div style={{ display:'flex', gap:'4px', flex:1 }}>
          {NAV.map(n => (
            <button key={n.id} className="cmd-nav-btn" onClick={() => setNav(n.id)} style={{ background:'transparent', border:`1px solid ${nav===n.id?ACCENT:'rgba(255,255,255,0.1)'}`, borderRadius:'6px', padding:'7px 14px', color:nav===n.id?ACCENT:'rgba(255,255,255,0.5)', fontSize:'11px', fontWeight:700, cursor:'pointer', letterSpacing:'1px', transition:'all 0.15s' }}>
              {n.icon} {n.label.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Status bar */}
        <div style={{ display:'flex', alignItems:'center', gap:'16px', fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>
          <span style={{ color:EMERALD }}>● ONLINE</span>
          <span>LVL {level}</span>
          <span style={{ color:GOLD }}>🔥{streak}D</span>
          <span>XP:{xp}</span>
          <button onClick={logout} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'6px', padding:'6px 12px', color:'#ef4444', fontSize:'10px', cursor:'pointer' }}>LOGOUT</button>
        </div>
      </header>

      {/* ── CONTENT ─────────────────────────────────────── */}
      <main style={{ flex:1, padding:'32px', position:'relative', zIndex:1 }}>

        {/* COMMAND DECK */}
        {nav === 'command' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ fontSize:'11px', color:EMERALD, letterSpacing:'2px', marginBottom:'4px' }}>MISSION BRIEFING // CLASS {classNum}</div>
            <div style={{ fontSize:'28px', fontWeight:700, marginBottom:'8px', lineHeight:1.2 }}>Good day, Cadet {firstName}.</div>
            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.45)', marginBottom:'32px', lineHeight:1.7 }}>
              Your academic mission is in progress. Success probability: <span style={{ color:EMERALD, fontWeight:700 }}>{probability}%</span>. Focus on Mathematics and Physics today.
            </div>

            {/* Top metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
              {[
                { label:'ACADEMIC HEALTH', value:`${health}%`,  color:health>=70?EMERALD:GOLD, icon:'📊' },
                { label:'SUCCESS PROBABILITY', value:`${probability}%`, color:ACCENT, icon:'🎯' },
                { label:'MISSION STREAK',  value:`${streak}d`,  color:GOLD,    icon:'🔥' },
                { label:'SUBJECTS CLEAR',  value:`${DEMO_SUBJECTS.filter(s=>s.attendance>=75).length}/${DEMO_SUBJECTS.length}`, color:EMERALD, icon:'✅' },
              ].map((m,i) => (
                <div key={i} style={{ ...glass(), borderLeft:`2px solid ${m.color}`, position:'relative', overflow:'hidden' }}>
                  <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', letterSpacing:'2px', marginBottom:'8px' }}>{m.label}</div>
                  <div style={{ fontSize:'30px', fontWeight:700, color:m.color }}>{m.value}</div>
                  <div style={{ position:'absolute', top:'10px', right:'14px', fontSize:'24px', opacity:0.1 }}>{m.icon}</div>
                </div>
              ))}
            </div>

            {/* Subject intel table */}
            <div style={glass()}>
              <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', letterSpacing:'2px', marginBottom:'16px' }}>SUBJECT PERFORMANCE MATRIX</div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12px' }}>
                  <thead>
                    <tr style={{ color:'rgba(255,255,255,0.3)', fontSize:'9px', letterSpacing:'1px' }}>
                      {['SUBJECT','SCORE','TREND','PREDICTED BOARD','ATTENDANCE','NEP LEVEL'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'8px 12px', fontWeight:700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_SUBJECTS.map(s => (
                      <tr key={s.name} className="plan-row" style={{ borderTop:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}>
                        <td style={{ padding:'10px 12px' }}><span style={{ marginRight:'8px' }}>{s.icon}</span>{s.name}</td>
                        <td style={{ padding:'10px 12px', color:s.color, fontWeight:700 }}>{s.score}%</td>
                        <td style={{ padding:'10px 12px', color:s.trend>0?EMERALD:s.trend<0?'#ef4444':'rgba(255,255,255,0.4)' }}>{s.trend>0?`+${s.trend}`:s.trend}%</td>
                        <td style={{ padding:'10px 12px' }}>{s.predictedBoard}%</td>
                        <td style={{ padding:'10px 12px' }}>
                          <span style={{ color:s.attendance>=85?EMERALD:s.attendance>=75?GOLD:'#ef4444' }}>{s.attendance}%</span>
                          {s.attendance<75 && <span style={{ marginLeft:'8px', fontSize:'9px', color:'#ef4444', background:'rgba(239,68,68,0.1)', padding:'2px 6px', borderRadius:'4px' }}>AT RISK</span>}
                        </td>
                        <td style={{ padding:'10px 12px' }}>
                          <span style={{ background:`${s.color}22`, border:`1px solid ${s.color}44`, borderRadius:'4px', padding:'2px 8px', color:s.color, fontSize:'10px' }}>{s.nepLevel}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Learning Zones Quick Access */}
            <div style={{ ...glass(), marginTop:'16px' }}>
              <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', letterSpacing:'2px', marginBottom:'14px' }}>LEARNING ZONE ACCESS</div>
              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                {[
                  { icon:'💻', label:'Programming Lab', path:'/school/programming', color:EMERALD, sub:'Python & CS' },
                  { icon:'⚛️', label:'Science Pro',      path:'#',                  color:'#38bdf8', sub:'Coming Soon' },
                  { icon:'∫',  label:'Math Pro',          path:'#',                  color:'#c084fc', sub:'Coming Soon' },
                ].map(zone => (
                  <div key={zone.label} onClick={()=>zone.path!=='#'&&navigate(zone.path)} style={{ background:`${zone.color}0d`, border:`2px solid ${zone.color}33`, borderRadius:'10px', padding:'12px 16px', cursor:zone.path!=='#'?'pointer':'default', display:'flex', alignItems:'center', gap:'10px', opacity:zone.path==='#'?0.45:1, transition:'all 0.2s', minWidth:'180px' }}
                    onMouseEnter={e=>{ if(zone.path!=='#') e.currentTarget.style.borderColor=zone.color; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${zone.color}33`; }}>
                    <span style={{ fontSize:'20px' }}>{zone.icon}</span>
                    <div>
                      <div style={{ fontSize:'12px', fontWeight:700, color:zone.color }}>{zone.label}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>{zone.sub}</div>
                    </div>
                    {zone.path!=='#' && <span style={{ marginLeft:'auto', color:zone.color, fontSize:'12px' }}>&gt;</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CAREER MISSION */}
        {nav === 'career' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ fontSize:'11px', color:EMERALD, letterSpacing:'2px', marginBottom:'4px' }}>MISSION: CAREER DISCOVERY</div>
            <div style={{ fontSize:'22px', fontWeight:700, marginBottom:'24px' }}>Choose Your Stream</div>

            {/* Stream selector */}
            <div style={{ display:'flex', gap:'16px', marginBottom:'32px', flexWrap:'wrap' }}>
              {STREAMS.map(s => (
                <button key={s.label} onClick={() => setStreamPick(s.label)}
                  style={{ background:streamPick===s.label?`${s.color}22`:'transparent', border:`1px solid ${streamPick===s.label?s.color:'rgba(255,255,255,0.1)'}`, borderRadius:'8px', padding:'14px 20px', color:streamPick===s.label?s.color:'rgba(255,255,255,0.5)', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:'10px', fontFamily:"'Space Mono', monospace", fontWeight:700, fontSize:'12px', boxShadow:streamPick===s.label?`0 0 20px ${s.color}22`:'none' }}>
                  <span style={{ fontSize:'20px' }}>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>

            {/* Career cards */}
            {careerLoading ? (
              <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.4)', animation:'pulse 1s ease-in-out infinite' }}>⚙️ GENERATING CAREER MISSIONS...</div>
            ) : (
              <div style={{ display:'grid', gap:'16px' }}>
                {careers.map((c, i) => (
                  <div key={i} className="career-card" style={{ ...glass(), display:'flex', alignItems:'flex-start', gap:'24px', transition:'all 0.2s', cursor:'pointer', border:`1px solid ${i===0?ACCENT+'33':'rgba(255,255,255,0.07)'}` }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
                        <span style={{ fontSize:'11px', fontWeight:700, color:i===0?GOLD:'rgba(255,255,255,0.4)', letterSpacing:'1px' }}>MISSION-0{i+1}</span>
                        {i===0 && <span style={{ background:GOLD+'22', border:`1px solid ${GOLD}44`, borderRadius:'4px', padding:'2px 8px', fontSize:'9px', color:GOLD, fontWeight:700 }}>RECOMMENDED</span>}
                      </div>
                      <div style={{ fontSize:'18px', fontWeight:700, marginBottom:'4px' }}>{c.title}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'12px' }}>{c.industry}</div>

                      {/* Skills */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'12px' }}>
                        {(c.topSkills||[]).map((sk,j) => (
                          <div key={j} style={{ background:'rgba(255,255,255,0.04)', border:BORDER, borderRadius:'6px', padding:'4px 10px' }}>
                            <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.5)', marginBottom:'2px' }}>{sk.name}</div>
                            <div style={{ height:'3px', width:'60px', background:'rgba(255,255,255,0.06)', borderRadius:'2px' }}>
                              <div style={{ height:'100%', width:`${sk.matched}%`, background:ACCENT, borderRadius:'2px' }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>{c.reasoning}</div>
                    </div>

                    <div style={{ textAlign:'right', minWidth:'160px' }}>
                      {/* Probability ring */}
                      <div style={{ position:'relative', width:'70px', height:'70px', margin:'0 0 12px auto' }}>
                        <svg viewBox="0 0 70 70" style={{ transform:'rotate(-90deg)' }}>
                          <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                          <circle cx="35" cy="35" r="28" fill="none" stroke={c.successProbability>=70?EMERALD:GOLD} strokeWidth="5"
                            strokeDasharray={`${2*Math.PI*28}`}
                            strokeDashoffset={`${2*Math.PI*28*(1-(c.successProbability||60)/100)}`}
                            strokeLinecap="round" style={{ transition:'stroke-dashoffset 1.2s ease' }} />
                        </svg>
                        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ fontSize:'16px', fontWeight:700, color:c.successProbability>=70?EMERALD:GOLD }}>{c.successProbability||60}%</span>
                        </div>
                      </div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginBottom:'4px' }}>ENTRY SALARY</div>
                      <div style={{ fontSize:'12px', fontWeight:700, color:EMERALD }}>{c.salaryStart}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'4px', marginBottom:'4px' }}>GROWTH</div>
                      <div style={{ fontSize:'12px', fontWeight:700, color:GOLD }}>{c.salaryGrowth}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'8px', marginBottom:'4px' }}>TIMELINE</div>
                      <div style={{ fontSize:'12px', fontWeight:700 }}>{c.timelineMonths} months</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Career Time Machine */}
            {careers.length > 0 && (
              <div style={{ ...glass(), marginTop:'32px' }}>
                <div style={{ fontSize:'11px', color:EMERALD, letterSpacing:'2px', marginBottom:'16px' }}>CAREER ROADMAP // 24-MONTH MISSION</div>
                <CareerTimeMachine
                  milestones={studentData?.careerMilestones}
                  studentId={studentData?._id || user?._id}
                  successProbability={probability}
                  onComplete={(m,d) => { if (d?.successProbability) setProbability(d.successProbability); }}
                />
              </div>
            )}
          </div>
        )}

        {/* EXAM PLANNER */}
        {nav === 'planner' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ fontSize:'11px', color:EMERALD, letterSpacing:'2px', marginBottom:'4px' }}>MISSION: BOARD EXAM PREP</div>
            <div style={{ fontSize:'22px', fontWeight:700, marginBottom:'24px' }}>AI Study Planner</div>

            {/* Exam dates */}
            <div style={{ display:'grid', gap:'10px', marginBottom:'24px' }}>
              {EXAM_DEFAULTS.map((e,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'16px', ...glass('12px 20px') }}>
                  <span style={{ fontSize:'18px' }}>{DEMO_SUBJECTS.find(s=>s.name===e.subject)?.icon||'📋'}</span>
                  <span style={{ flex:1, fontSize:'14px', fontWeight:700 }}>{e.subject}</span>
                  <span style={{ fontSize:'12px', color:ACCENT }}>{e.date}</span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', background:`${ACCENT}11`, padding:'3px 10px', borderRadius:'5px' }}>{e.board}</span>
                </div>
              ))}
            </div>

            <button onClick={generatePlan} disabled={planLoading||!!studyPlan} style={{ background:studyPlan?'rgba(16,185,129,0.1)':ACCENT, border:`1px solid ${studyPlan?EMERALD:ACCENT}`, borderRadius:'8px', padding:'12px 28px', color:studyPlan?EMERALD:'#fff', fontSize:'12px', fontWeight:700, cursor:studyPlan?'default':'pointer', letterSpacing:'1px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'10px' }}>
              {planLoading ? '⚙️ GENERATING...' : studyPlan ? '✅ PLAN ACTIVE' : '⚙️ GENERATE AI STUDY PLAN'}
            </button>

            {studyPlan && (
              <div style={glass()}>
                <div style={{ fontSize:'11px', color:EMERALD, letterSpacing:'2px', marginBottom:'16px' }}>DAILY MISSION SCHEDULE // TOTAL: {Math.round(studyPlan.totalHoursPlanned)}h</div>
                <div style={{ maxHeight:'480px', overflowY:'auto' }}>
                  {(studyPlan.dailyPlan||[]).slice(0,30).map((block,i) => {
                    const subj = DEMO_SUBJECTS.find(s=>s.name===block.subject);
                    const typeColor = block.type==='rest'?'rgba(255,255,255,0.3)':block.priority==='high'?'#ef4444':block.priority==='medium'?GOLD:EMERALD;
                    return (
                      <div key={i} className="plan-row" style={{ display:'flex', alignItems:'center', gap:'16px', padding:'10px', borderRadius:'6px', marginBottom:'2px', transition:'background 0.15s' }}>
                        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', minWidth:'80px' }}>{block.date}</span>
                        <span style={{ fontSize:'16px' }}>{subj?.icon||'📋'}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'13px', fontWeight:700 }}>{block.subject}</div>
                          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{block.topic}</div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontSize:'11px', color:typeColor, fontWeight:700, letterSpacing:'0.5px' }}>{block.type.toUpperCase()}</div>
                          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>{block.duration}min</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MOOD RADAR */}
        {nav === 'mood' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ fontSize:'11px', color:EMERALD, letterSpacing:'2px', marginBottom:'4px' }}>SIGNAL: MOOD RADAR</div>
            <div style={{ fontSize:'22px', fontWeight:700, marginBottom:'24px' }}>Daily Check-in</div>
            <div style={{ ...glass(), maxWidth:'480px' }}>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', letterSpacing:'1px', marginBottom:'16px' }}>CURRENT STATUS</div>
              <MoodFaces variant="emoji" size="md" selected={mood} onSelect={handleMood} />
              {mood && (
                <div style={{ marginTop:'20px', padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:'8px', border:BORDER }}>
                  <div style={{ fontSize:'11px', color:EMERALD, fontWeight:700, marginBottom:'8px' }}>SYSTEM RESPONSE</div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.7)', lineHeight:1.7 }}>
                    {mood>=4 ? 'Optimal performance state detected. Initiate deep study mode. 🚀' : mood<=2 ? 'Sub-optimal state detected. Recommend 5-minute break protocol before continuing. ⚡' : 'Stable signal. Continue current mission parameters.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBJECT INTEL */}
        {nav === 'subjects' && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <div style={{ fontSize:'11px', color:EMERALD, letterSpacing:'2px', marginBottom:'4px' }}>INTELLIGENCE: SUBJECT ANALYSIS</div>
            <div style={{ fontSize:'22px', fontWeight:700, marginBottom:'24px' }}>Subject Performance Intel</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' }}>
              {DEMO_SUBJECTS.map(s => (
                <div key={s.name} style={{ ...glass(), borderLeft:`2px solid ${s.color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
                    <div>
                      <span style={{ fontSize:'22px' }}>{s.icon}</span>
                      <div style={{ fontSize:'16px', fontWeight:700, marginTop:'4px' }}>{s.name}</div>
                      <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', letterSpacing:'1px' }}>CODE: {s.code}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'28px', fontWeight:700, color:s.color }}>{s.score}%</div>
                      <div style={{ fontSize:'11px', color:s.trend>0?EMERALD:s.trend<0?'#ef4444':'rgba(255,255,255,0.4)', fontWeight:700 }}>{s.trend>0?`+${s.trend}`:s.trend}% TREND</div>
                    </div>
                  </div>
                  {/* Score bar */}
                  <div style={{ marginBottom:'10px' }}>
                    <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', marginBottom:'4px', display:'flex', justifyContent:'space-between' }}>
                      <span>CURRENT</span><span>PREDICTED BOARD: {s.predictedBoard}%</span>
                    </div>
                    <div style={{ height:'5px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${s.score}%`, background:s.color, borderRadius:'3px', boxShadow:`0 0 6px ${s.color}88` }} />
                    </div>
                  </div>
                  {/* Attendance */}
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px' }}>
                    <span style={{ color:'rgba(255,255,255,0.4)' }}>Attendance</span>
                    <span style={{ color:s.attendance>=75?EMERALD:'#ef4444', fontWeight:700 }}>{s.attendance}%{s.attendance<75?' ⚠️':''}</span>
                  </div>
                  {/* NEP */}
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', marginTop:'6px' }}>
                    <span style={{ color:'rgba(255,255,255,0.4)' }}>NEP Level</span>
                    <span style={{ background:`${s.color}22`, border:`1px solid ${s.color}44`, borderRadius:'4px', padding:'2px 8px', color:s.color, fontWeight:700 }}>{s.nepLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <MoodCamera studentId={studentData?._id || user?._id} sessionId={null} world="9-12" onMood={() => {}} />
      <SparkyChat world="9-12" subject="Class 9-12 Physics, Chemistry, Math, Biology, CS" studentName={firstName} />
    </div>
  );
}
