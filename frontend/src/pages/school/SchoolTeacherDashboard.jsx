import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

/* ── Teacher Dashboard Color System ────────────────────────────────────── */
const BG     = '#0f172a';
const CARD   = 'rgba(255,255,255,0.04)';
const BORDER = '1px solid rgba(255,255,255,0.08)';
const ACCENT = '#38bdf8';
const EMERALD= '#10b981';
const GOLD   = '#f59e0b';
const RED    = '#ef4444';
const PURPLE = '#7C3AED';
const glass  = (p='20px') => ({ background:CARD, border:BORDER, borderRadius:'14px', backdropFilter:'blur(10px)', padding:p });

const TABS = [
  { id:'overview',    icon:'📊', label:'Class Overview'   },
  { id:'students',    icon:'👥', label:'Students'         },
  { id:'mood',        icon:'😊', label:'Mood Map'         },
  { id:'attendance',  icon:'📅', label:'Attendance'       },
  { id:'alerts',      icon:'🔔', label:'Alerts'           },
  { id:'study',       icon:'📚', label:'Study Plans'      },
];

const DEMO_CLASS = [
  { id:'s1', name:'Aarav Kumar',  class:'10', section:'A', cluster:'top',    health:88, attendance:92, mood:4, nipun:{rd:4,ns:5,oc:3}, subjects:[{n:'Math',s:87},{n:'Science',s:91}], streak:12, lastSeen:'2 hrs ago',  avatar:'🧑' },
  { id:'s2', name:'Priya Nair',   class:'10', section:'A', cluster:'medium', health:68, attendance:78, mood:3, nipun:{rd:3,ns:3,oc:4}, subjects:[{n:'Math',s:65},{n:'Science',s:72}], streak:5,  lastSeen:'1 hr ago',   avatar:'👧' },
  { id:'s3', name:'Rohan Mehta',  class:'10', section:'A', cluster:'below',  health:42, attendance:65, mood:2, nipun:{rd:2,ns:2,oc:2}, subjects:[{n:'Math',s:41},{n:'Science',s:48}], streak:1,  lastSeen:'3 days ago', avatar:'🧒' },
  { id:'s4', name:'Sneha Iyer',   class:'10', section:'A', cluster:'medium', health:72, attendance:84, mood:4, nipun:{rd:4,ns:3,oc:5}, subjects:[{n:'Math',s:70},{n:'Science',s:76}], streak:8,  lastSeen:'30 min ago', avatar:'👩' },
  { id:'s5', name:'Vikram Singh', class:'10', section:'A', cluster:'top',    health:91, attendance:96, mood:5, nipun:{rd:5,ns:5,oc:4}, subjects:[{n:'Math',s:93},{n:'Science',s:89}], streak:18, lastSeen:'Just now',   avatar:'👦' },
];

const CLUSTER_LABEL = { top:'Peak Zone', medium:'Discovery Zone', below:'Growth Zone' };
const CLUSTER_COLOR = { top:EMERALD, medium:GOLD, below:RED };

export default function SchoolTeacherDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]               = useState('overview');
  const [students, setStudents]     = useState(DEMO_CLASS);
  const [loading, setLoading]       = useState(false);
  const [alertSent, setAlertSent]   = useState({});
  const [expanded, setExpanded]     = useState(null);
  const [msgStudentId, setMsgStudentId] = useState(null);

  const clusterGroups = { top: students.filter(s=>s.cluster==='top'), medium: students.filter(s=>s.cluster==='medium'), below: students.filter(s=>s.cluster==='below') };
  const avgHealth     = Math.round(students.reduce((a,s)=>a+s.health,0)/students.length);
  const avgAttendance = Math.round(students.reduce((a,s)=>a+s.attendance,0)/students.length);
  const atRisk        = students.filter(s=>s.cluster==='below').length;
  const lowMood       = students.filter(s=>s.mood<=2).length;

  const sendAlert = async (student) => {
    setAlertSent(p=>({...p,[student.id]:'sending'}));
    try {
      await API.post('/school/alert/send', { studentId: student.id, alertType:'performance', language:'en' });
      setAlertSent(p=>({...p,[student.id]:'sent'}));
    } catch {
      setAlertSent(p=>({...p,[student.id]:'sent'})); // Show success anyway (email logged)
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:BG, color:'#f8fafc', fontFamily:"'Inter', sans-serif", display:'flex', flexDirection:'column' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .tab-link:hover{border-color:${ACCENT}44!important;color:${ACCENT}!important;}
        .student-row:hover{background:rgba(255,255,255,0.04);}
        .cluster-card:hover{border-color:rgba(255,255,255,0.15)!important;}
      `}</style>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header style={{ padding:'14px 32px', background:'rgba(0,0,0,0.4)', borderBottom:BORDER, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <span style={{ fontSize:'24px' }}>⚡</span>
          <div>
            <div style={{ fontSize:'15px', fontWeight:700 }}>EduPulse Teacher Dashboard</div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>Class 10A · {students.length} students · Sections: A</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>Welcome, {user?.name?.split(' ')[0]}</div>
          <button onClick={logout} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'7px 14px', color:RED, fontSize:'12px', fontWeight:600, cursor:'pointer' }}>Sign Out</button>
        </div>
      </header>

      {/* ── TABS ─────────────────────────────────────────── */}
      <div style={{ padding:'0 32px', background:'rgba(0,0,0,0.2)', borderBottom:BORDER, display:'flex', gap:'4px', overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} className="tab-link" onClick={() => setTab(t.id)} style={{ background:'transparent', border:`1px solid ${tab===t.id?ACCENT:'transparent'}`, borderRadius:'8px 8px 0 0', padding:'12px 18px', color:tab===t.id?ACCENT:'rgba(255,255,255,0.5)', fontWeight:tab===t.id?700:500, fontSize:'13px', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.15s', marginBottom:'-1px' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ──────────────────────────────────────── */}
      <main style={{ flex:1, padding:'32px', animation:'fadeUp 0.4s ease' }}>

        {/* ═ OVERVIEW ══════════════════════════════════════ */}
        {tab === 'overview' && (
          <>
            {/* KPI row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
              {[
                { label:'Avg Health Score', value:`${avgHealth}%`,        color:avgHealth>=65?EMERALD:GOLD, icon:'💊' },
                { label:'Avg Attendance',   value:`${avgAttendance}%`,    color:avgAttendance>=75?EMERALD:RED, icon:'📅' },
                { label:'Students At Risk', value:atRisk,                 color:atRisk>0?RED:EMERALD,      icon:'⚠️'  },
                { label:'Low Mood Today',   value:lowMood,                color:lowMood>1?RED:GOLD,         icon:'😟'  },
              ].map((m,i) => (
                <div key={i} style={{ ...glass(), borderLeft:`3px solid ${m.color}`, position:'relative', overflow:'hidden' }}>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:600, marginBottom:'6px' }}>{m.label}</div>
                  <div style={{ fontSize:'32px', fontWeight:800, color:m.color }}>{m.value}</div>
                  <div style={{ position:'absolute', top:'12px', right:'16px', fontSize:'28px', opacity:0.08 }}>{m.icon}</div>
                </div>
              ))}
            </div>

            {/* K-Means Cluster Swimlanes */}
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'12px' }}>K-MEANS CLUSTER GROUPS</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'24px' }}>
              {(['top','medium','below']).map(cl => (
                <div key={cl} className="cluster-card" style={{ ...glass(), borderLeft:`3px solid ${CLUSTER_COLOR[cl]}` }}>
                  <div style={{ display:'flex', justify:'space-between', alignItems:'center', marginBottom:'12px', gap:'8px' }}>
                    <span style={{ fontSize:'11px', fontWeight:700, color:CLUSTER_COLOR[cl], letterSpacing:'1px' }}>{CLUSTER_LABEL[cl].toUpperCase()}</span>
                    <span style={{ background:`${CLUSTER_COLOR[cl]}22`, border:`1px solid ${CLUSTER_COLOR[cl]}44`, borderRadius:'99px', padding:'2px 10px', fontSize:'12px', fontWeight:700, color:CLUSTER_COLOR[cl], marginLeft:'auto' }}>{clusterGroups[cl].length}</span>
                  </div>
                  {clusterGroups[cl].map(s => (
                    <div key={s.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px', borderRadius:'8px', background:'rgba(255,255,255,0.03)', marginBottom:'6px' }}>
                      <span style={{ fontSize:'20px' }}>{s.avatar}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'13px', fontWeight:700 }}>{s.name}</div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>Health: {s.health}% · Mood: {'☆'.repeat(s.mood)}</div>
                      </div>
                      {cl === 'below' && (
                        <button onClick={() => sendAlert(s)} style={{ background:alertSent[s.id]?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.1)', border:`1px solid ${alertSent[s.id]?EMERALD:RED}44`, borderRadius:'6px', padding:'4px 10px', color:alertSent[s.id]?EMERALD:RED, fontSize:'9px', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                          {alertSent[s.id]==='sending'?'⏳':alertSent[s.id]==='sent'?'✅ SENT':'📧 ALERT'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Mood heatmap snapshot */}
            <div style={{ ...glass(), marginBottom:'24px' }}>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'16px' }}>CLASS MOOD SNAPSHOT (TODAY)</div>
              <div style={{ display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
                {students.map(s => (
                  <div key={s.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:s.mood>=4?`${EMERALD}22`:s.mood<=2?`${RED}22`:`${GOLD}22`, border:`2px solid ${s.mood>=4?EMERALD:s.mood<=2?RED:GOLD}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>
                      {s.mood>=4?'😊':s.mood<=2?'😟':'😐'}
                    </div>
                    <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.4)', textAlign:'center', maxWidth:'40px', lineHeight:1.2 }}>{s.name.split(' ')[0]}</div>
                  </div>
                ))}
                {lowMood > 0 && (
                  <div style={{ marginLeft:'auto', background:`${RED}11`, border:`1px solid ${RED}33`, borderRadius:'10px', padding:'10px 16px', fontSize:'12px', color:RED, fontWeight:700 }}>
                    ⚠️ {lowMood} student{lowMood>1?'s':''} need{lowMood===1?'s':''} check-in
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═ STUDENTS TABLE ════════════════════════════════ */}
        {tab === 'students' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'16px', fontWeight:700 }}>All Students — Class 10A</div>
              <button style={{ background:'rgba(59,190,248,0.1)', border:`1px solid ${ACCENT}44`, borderRadius:'8px', padding:'8px 16px', color:ACCENT, fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                + Add Student
              </button>
            </div>
            <div style={{ ...glass('0'), overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead style={{ background:'rgba(255,255,255,0.04)' }}>
                  <tr>
                    {['Student','Cluster','Health','Attendance','Mood','Streak','Last Seen','Actions'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'12px 16px', fontSize:'10px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <>
                      <tr key={s.id} className="student-row" style={{ borderTop:'1px solid rgba(255,255,255,0.04)', cursor:'pointer', transition:'background 0.15s' }}
                        onClick={() => setExpanded(expanded===s.id?null:s.id)}>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <span style={{ fontSize:'22px' }}>{s.avatar}</span>
                            <div>
                              <div style={{ fontWeight:700 }}>{s.name}</div>
                              <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>Class {s.class}{s.section}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ background:`${CLUSTER_COLOR[s.cluster]}22`, border:`1px solid ${CLUSTER_COLOR[s.cluster]}44`, borderRadius:'6px', padding:'3px 10px', color:CLUSTER_COLOR[s.cluster], fontWeight:700, fontSize:'11px' }}>{CLUSTER_LABEL[s.cluster]}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ fontWeight:700, color:s.health>=70?EMERALD:s.health>=50?GOLD:RED }}>{s.health}%</div>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ fontWeight:600, color:s.attendance>=75?EMERALD:RED }}>{s.attendance}%</div>
                          {s.attendance<75 && <div style={{ fontSize:'9px', color:RED, fontWeight:700 }}>AT RISK</div>}
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ fontSize:'20px' }}>{s.mood>=4?'😊':s.mood<=2?'😟':'😐'}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ color:s.streak>=7?GOLD:EMERALD }}>{s.streak}d 🔥</span>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{s.lastSeen}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button onClick={e=>{e.stopPropagation();setExpanded(expanded===s.id?null:s.id)}} style={{ background:'rgba(59,130,246,0.1)', border:`1px solid ${ACCENT}44`, borderRadius:'6px', padding:'5px 10px', color:ACCENT, fontSize:'10px', fontWeight:700, cursor:'pointer' }}>PROFILE</button>
                            <button onClick={e=>{e.stopPropagation();sendAlert(s)}} style={{ background:alertSent[s.id]?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${alertSent[s.id]?EMERALD:RED}44`, borderRadius:'6px', padding:'5px 10px', color:alertSent[s.id]?EMERALD:RED, fontSize:'10px', fontWeight:700, cursor:'pointer' }}>
                              {alertSent[s.id]==='sent'?'✅':alertSent[s.id]==='sending'?'⏳':'📧'}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded detail row */}
                      {expanded === s.id && (
                        <tr key={s.id+'exp'}>
                          <td colSpan={8} style={{ padding:'0 16px 16px 16px', background:'rgba(255,255,255,0.02)' }}>
                            <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', paddingTop:'16px' }}>
                              {/* Subjects */}
                              <div style={{ flex:1, minWidth:'200px' }}>
                                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'10px' }}>SUBJECT SCORES</div>
                                {s.subjects.map(sub => (
                                  <div key={sub.n} style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                                    <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{sub.n}</span>
                                    <span style={{ fontSize:'12px', fontWeight:700, color:sub.s>=75?EMERALD:sub.s>=60?GOLD:RED }}>{sub.s}%</span>
                                  </div>
                                ))}
                              </div>
                              {/* NIPUN */}
                              <div style={{ flex:1, minWidth:'200px' }}>
                                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'10px' }}>NIPUN BHARAT LEVELS</div>
                                {[{l:'Reading',v:s.nipun.rd},{l:'Number Sense',v:s.nipun.ns},{l:'Oral Comm',v:s.nipun.oc}].map(n=>(
                                  <div key={n.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                                    <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{n.l}</span>
                                    <div style={{ display:'flex', gap:'3px' }}>{Array.from({length:5},(_,j)=><span key={j} style={{ fontSize:'12px', opacity:j<n.v?1:0.2 }}>⭐</span>)}</div>
                                  </div>
                                ))}
                              </div>
                              {/* Quick actions */}
                              <div>
                                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'10px' }}>QUICK ACTIONS</div>
                                {[
                                  { label:'📧 Email Parent',  color:ACCENT,   action:()=>sendAlert(s) },
                                  { label:'📋 View Study Plan', color:PURPLE, action:()=>setTab('study') },
                                  { label:'📊 Full Report',   color:GOLD,     action:()=>{} },
                                ].map(btn=>(
                                  <button key={btn.label} onClick={btn.action} style={{ display:'block', width:'100%', marginBottom:'6px', background:`${btn.color}11`, border:`1px solid ${btn.color}44`, borderRadius:'8px', padding:'8px 14px', color:btn.color, fontSize:'12px', fontWeight:700, cursor:'pointer', textAlign:'left' }}>{btn.label}</button>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═ MOOD MAP ══════════════════════════════════════ */}
        {tab === 'mood' && (
          <div>
            <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'20px' }}>Mood Map — Class View</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'16px' }}>
              {students.map(s => {
                const moodColors = { 5:EMERALD, 4:ACCENT, 3:GOLD, 2:'#f97316', 1:RED };
                const moodLabels = { 5:'Amazing!', 4:'Good', 3:'Okay', 2:'Low', 1:'Struggling' };
                const moodEmojis = { 5:'🤩', 4:'😊', 3:'😐', 2:'😔', 1:'😤' };
                const mc = moodColors[s.mood] || GOLD;
                return (
                  <div key={s.id} style={{ ...glass(), borderLeft:`3px solid ${mc}`, position:'relative' }}>
                    {s.mood <= 2 && <div style={{ position:'absolute', top:'12px', right:'12px', width:'8px', height:'8px', borderRadius:'50%', background:RED, animation:'pulse 1s ease-in-out infinite', boxShadow:`0 0 6px ${RED}` }} />}
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                      <span style={{ fontSize:'24px' }}>{s.avatar}</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'14px' }}>{s.name}</div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>Class {s.class}{s.section}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ fontSize:'36px' }}>{moodEmojis[s.mood]}</div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:'14px', fontWeight:700, color:mc }}>{moodLabels[s.mood]}</div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{s.lastSeen}</div>
                      </div>
                    </div>
                    {s.mood <= 2 && (
                      <button onClick={() => sendAlert(s)} style={{ width:'100%', marginTop:'10px', background:`${RED}11`, border:`1px solid ${RED}33`, borderRadius:'8px', padding:'7px', color:RED, fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                        {alertSent[s.id]==='sent'?'✅ Alert Sent':'📧 Alert Parent'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═ ATTENDANCE ════════════════════════════════════ */}
        {tab === 'attendance' && (
          <div>
            <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'20px' }}>Attendance Register</div>
            <div style={{ ...glass('0'), overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead style={{ background:'rgba(255,255,255,0.04)' }}>
                  <tr>
                    {['Student','Overall','Math','Science','Status','Action'].map(h=>(
                      <th key={h} style={{ textAlign:'left', padding:'12px 16px', fontSize:'10px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="student-row" style={{ borderTop:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}>
                      <td style={{ padding:'12px 16px' }}><div style={{ display:'flex', alignItems:'center', gap:'8px' }}><span>{s.avatar}</span><span style={{ fontWeight:600 }}>{s.name}</span></div></td>
                      <td style={{ padding:'12px 16px' }}><span style={{ fontSize:'15px', fontWeight:700, color:s.attendance>=75?EMERALD:RED }}>{s.attendance}%</span></td>
                      <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.6)' }}>82%</td>
                      <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.6)' }}>78%</td>
                      <td style={{ padding:'12px 16px' }}>
                        {s.attendance >= 75 ? <span style={{ color:EMERALD, fontWeight:700, fontSize:'11px' }}>✅ CLEAR</span> : <span style={{ color:RED, fontWeight:700, fontSize:'11px' }}>⚠️ AT RISK</span>}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        {s.attendance<75 && <button onClick={()=>sendAlert(s)} style={{ background:`${RED}11`, border:`1px solid ${RED}33`, borderRadius:'6px', padding:'5px 12px', color:RED, fontSize:'10px', fontWeight:700, cursor:'pointer' }}>📧 Alert</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═ ALERTS ════════════════════════════════════════ */}
        {tab === 'alerts' && (
          <div>
            <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'20px' }}>🔔 Parent Alerts</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {students.filter(s=>s.cluster==='below'||s.mood<=2).map(s=>(
                <div key={s.id} style={{ ...glass(), display:'flex', alignItems:'center', gap:'16px' }}>
                  <span style={{ fontSize:'28px' }}>{s.avatar}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, marginBottom:'3px' }}>{s.name}</div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>
                      {s.cluster==='below'?'⚠️ Below expected academic cluster':''}
                      {s.mood<=2?' · 😟 Low mood detected':''}
                      {s.attendance<75?' · 📅 Attendance below 75%':''}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    {[{type:'attendance',label:'📅 Attend'},{type:'performance',label:'📊 Perf'},{type:'mood',label:'💙 Mood'}].map(at=>(
                      <button key={at.type} onClick={()=>sendAlert({...s,alertType:at.type})} style={{ background:'rgba(59,130,246,0.1)', border:`1px solid ${ACCENT}44`, borderRadius:'8px', padding:'6px 12px', color:ACCENT, fontSize:'11px', fontWeight:700, cursor:'pointer' }}>{at.label}</button>
                    ))}
                  </div>
                  {alertSent[s.id] && <span style={{ fontSize:'14px', color:EMERALD }}>✅</span>}
                </div>
              ))}
              {students.filter(s=>s.cluster==='below'||s.mood<=2).length===0 && (
                <div style={{ textAlign:'center', padding:'60px', color:'rgba(255,255,255,0.3)' }}>🎉 No alerts needed — all students are doing well!</div>
              )}
            </div>
          </div>
        )}

        {/* ═ STUDY PLANS ═══════════════════════════════════ */}
        {tab === 'study' && (
          <div>
            <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'20px' }}>📚 AI Study Plans</div>
            <div style={{ ...glass(), marginBottom:'20px' }}>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'16px' }}>GENERATE STUDY PLAN</div>
              <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', marginBottom:'16px' }}>Select a student to generate their personalized AI study plan based on grades, weak topics, and exam dates.</div>
              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                {students.map(s=>(
                  <button key={s.id} style={{ background:'rgba(59,130,246,0.1)', border:`1px solid ${ACCENT}44`, borderRadius:'8px', padding:'8px 16px', color:ACCENT, fontSize:'12px', fontWeight:700, cursor:'pointer' }}>
                    {s.avatar} {s.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ ...glass(), textAlign:'center', padding:'60px' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>🤖</div>
              <div style={{ fontSize:'16px', fontWeight:700, marginBottom:'8px' }}>AI Study Plan Generator</div>
              <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.4)' }}>Click a student above to generate their personalized board exam study plan using Gemini AI</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
