import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/* ── TRANSLATIONS ─────────────────────────────────────────── */
const T = {
  en: {
    appName:'EduPulse Guardian', welcome:'Welcome back', updatedAgo:'Updated 2 minutes ago',
    downloadReport:'📄 Download Full Report', notifTitle:'Your Notifications',
    markRead:'Mark as read', noNotifs:'All caught up! No new alerts.',
    howDoing:'How is [name] doing?', attendanceTitle:'Is [name] going to school?',
    noticesTitle:'What You Need to Know 🔔', acknowledge:'✓ I Understand',
    acknowledged:'Acknowledged ✓', subjectsTitle:'How is [name] doing in each subject?',
    wellbeingTitle:'How is [name] feeling? 💙', skillsTitle:'What is [name] good at?',
    careerTitle:"[name]'s Future Paths 🚀", careerSub:'Based on current strengths',
    learnMore:'Learn More', contactTitle:'Talk to the School Counselor',
    scmName:'Prof. Ananya Sharma', scmRole:'Student Career Manager',
    scmAvail:'Available Mon–Fri, 9 AM – 5 PM', msgBtn:'💬 Message Counselor',
    meetBtn:'📅 Schedule a Meeting', viewReport:'📊 View Full Report',
    emailUpdates:'📧 Email Me Updates', snooze:'🔕 Snooze Alerts 24h',
    snoozed:'Alerts snoozed for 24 hours ✓', emailOn:'Daily updates ON ✓', emailOff:'Daily updates OFF',
    sendMsg:'Send Message', msgPlaceholder:'Write your message to the counselor...',
    msgSent:'Message sent! The counselor will reply within one school day. ✓',
    scheduleMeeting:'Schedule Meeting', meetSent:'Meeting scheduled! You will receive a confirmation email. ✓',
    selectDate:'Select a date', selectTime:'Select a time', confirm:'Confirm Booking',
    needsSupport:'Needs Your Support Right Now', needsAttention:'Needs Some Attention',
    doingGreat:'Doing Great! 🌟', wasLastMonth:'Was [x] last month',
    missingClasses:'[name] is missing too many classes. He needs to attend the next [x] classes to reach the safe zone.',
    safeZone:'Safe zone is 75% attendance.',
    excellent:'Excellent', good:'Good', average:'Average', needsHelp:'Needs Help',
    improving:'↑ Improving', declining:'↓ Declining', stable:'→ Stable',
    moodGood:'Good day 😊', moodOk:'Okay day 😐', moodStressed:'Stressed day 😔',
    stressedStreak:'[name] has felt stressed for [x] days in a row. Consider checking in with him today.',
    parentAdvice:'What You Can Do 💡',
    tip1:'Ask him how school went today (not about grades)',
    tip2:'Make sure he sleeps by 10 PM on school nights',
    tip3:'Reduce extra activities or screen time this week',
    aaravStrength:"[name]'s Strength", whereImprove:'Where to Improve',
    skillsDesc:'A picture of what [name] is good at across all subjects',
    sciMath:'Science & Math', english:'English & Languages', homework:'Homework',
    classActivity:'Class Activity', problemSolving:'Problem Solving',
    bestMatch:'Best Match ⭐', salaryPotential:'₹[x] LPA potential',
    logOut:'Log Out', myProfile:'My Profile', settings:'Settings',
    heroSubtitle:'Here is how [name] is doing today',
  },
  hi: {
    appName:'EduPulse गार्जियन', welcome:'वापस स्वागत है', updatedAgo:'2 मिनट पहले अपडेट हुआ',
    downloadReport:'📄 रिपोर्ट डाउनलोड करें', notifTitle:'आपकी सूचनाएं',
    markRead:'पढ़ा हुआ चिह्नित करें', noNotifs:'कोई नई सूचना नहीं।',
    howDoing:'[name] कैसा कर रहा है?', attendanceTitle:'क्या [name] स्कूल जा रहा है?',
    noticesTitle:'आपको क्या जानना चाहिए 🔔', acknowledge:'✓ समझ गया',
    acknowledged:'समझ गया ✓', subjectsTitle:'[name] हर विषय में कैसा कर रहा है?',
    wellbeingTitle:'[name] कैसा महसूस कर रहा है? 💙', skillsTitle:'[name] किसमें अच्छा है?',
    careerTitle:'[name] का भविष्य 🚀', careerSub:'वर्तमान प्रतिभाओं के आधार पर',
    learnMore:'और जानें', contactTitle:'स्कूल काउंसलर से बात करें',
    scmName:'प्रो. अनन्या शर्मा', scmRole:'छात्र कैरियर प्रबंधक',
    scmAvail:'सोम–शुक्र, सुबह 9 – शाम 5 बजे उपलब्ध', msgBtn:'💬 संदेश भेजें',
    meetBtn:'📅 मीटिंग शेड्यूल करें', viewReport:'📊 पूरी रिपोर्ट देखें',
    emailUpdates:'📧 अपडेट ईमेल करें', snooze:'🔕 24 घंटे अलर्ट बंद करें',
    snoozed:'24 घंटे के लिए अलर्ट बंद ✓', emailOn:'डेली अपडेट चालू ✓', emailOff:'डेली अपडेट बंद',
    sendMsg:'संदेश भेजें', msgPlaceholder:'काउंसलर को संदेश लिखें...',
    msgSent:'संदेश भेजा गया! काउंसलर एक दिन में जवाब देंगे। ✓',
    scheduleMeeting:'मीटिंग शेड्यूल करें', meetSent:'मीटिंग शेड्यूल हो गई! ✓',
    selectDate:'तारीख चुनें', selectTime:'समय चुनें', confirm:'बुकिंग की पुष्टि करें',
    needsSupport:'आपके सहयोग की जरूरत है', needsAttention:'थोड़ा ध्यान चाहिए',
    doingGreat:'बहुत अच्छा कर रहा है! 🌟', wasLastMonth:'पिछले महीने [x] था',
    missingClasses:'[name] बहुत कक्षाएं मिस कर रहा है। सुरक्षित क्षेत्र तक पहुंचने के लिए अगली [x] कक्षाएं जरूरी हैं।',
    safeZone:'75% उपस्थिति सुरक्षित सीमा है।',
    excellent:'उत्कृष्ट', good:'अच्छा', average:'औसत', needsHelp:'मदद चाहिए',
    improving:'↑ सुधर रहा है', declining:'↓ गिर रहा है', stable:'→ स्थिर',
    moodGood:'अच्छा दिन 😊', moodOk:'ठीक दिन 😐', moodStressed:'तनाव में 😔',
    stressedStreak:'[name] [x] दिनों से तनाव में है। आज उससे बात करें।',
    parentAdvice:'आप क्या कर सकते हैं 💡',
    tip1:'उससे पूछें आज स्कूल कैसा रहा (ग्रेड की बात नहीं)',
    tip2:'स्कूल की रातों में 10 बजे तक सोने दें',
    tip3:'इस हफ्ते अतिरिक्त गतिविधियां कम करें',
    aaravStrength:"[name] की खूबी", whereImprove:'कहां सुधार करें',
    skillsDesc:'[name] की प्रतिभाओं की तस्वीर',
    sciMath:'विज्ञान और गणित', english:'अंग्रेजी और भाषाएं', homework:'गृहकार्य',
    classActivity:'कक्षा गतिविधि', problemSolving:'समस्या समाधान',
    bestMatch:'सर्वश्रेष्ठ मिलान ⭐', salaryPotential:'₹[x] LPA संभावना',
    logOut:'लॉग आउट', myProfile:'मेरी प्रोफ़ाइल', settings:'सेटिंग्स',
    heroSubtitle:'[name] आज कैसा कर रहा है, यहां देखें',
  },
  mr: {
    appName:'EduPulse पालक', welcome:'परत स्वागत आहे', updatedAgo:'2 मिनिटांपूर्वी अपडेट',
    downloadReport:'📄 अहवाल डाउनलोड करा', notifTitle:'तुमच्या सूचना',
    markRead:'वाचले म्हणून चिन्हांकित करा', noNotifs:'कोणत्याही नवीन सूचना नाहीत.',
    howDoing:'[name] कसे करत आहे?', attendanceTitle:'[name] शाळेत जात आहे का?',
    noticesTitle:'तुम्हाला काय माहित असणे आवश्यक आहे 🔔', acknowledge:'✓ समजले',
    acknowledged:'समजले ✓', subjectsTitle:'[name] प्रत्येक विषयात कसे करत आहे?',
    wellbeingTitle:'[name] कसे वाटत आहे? 💙', skillsTitle:'[name] कशात चांगले आहे?',
    careerTitle:"[name] चे भविष्य 🚀", careerSub:'सध्याच्या गुणांवर आधारित',
    learnMore:'अधिक जाणून घ्या', contactTitle:'शाळा समुपदेशकाशी बोला',
    scmName:'प्रो. अनन्या शर्मा', scmRole:'विद्यार्थी करिअर व्यवस्थापक',
    scmAvail:'सोम–शुक्र, सकाळी 9 – संध्याकाळी 5 उपलब्ध', msgBtn:'💬 संदेश पाठवा',
    meetBtn:'📅 बैठक ठरवा', viewReport:'📊 संपूर्ण अहवाल पहा',
    emailUpdates:'📧 ईमेल अपडेट', snooze:'🔕 24 तास अलर्ट बंद करा',
    snoozed:'24 तासांसाठी अलर्ट बंद ✓', emailOn:'दैनंदिन अपडेट चालू ✓', emailOff:'दैनंदिन अपडेट बंद',
    sendMsg:'संदेश पाठवा', msgPlaceholder:'समुपदेशकाला संदेश लिहा...',
    msgSent:'संदेश पाठवला! समुपदेशक एक दिवसात उत्तर देतील. ✓',
    scheduleMeeting:'बैठक ठरवा', meetSent:'बैठक ठरवली! ✓',
    selectDate:'तारीख निवडा', selectTime:'वेळ निवडा', confirm:'बुकिंग निश्चित करा',
    needsSupport:'तुमच्या मदतीची गरज आहे', needsAttention:'थोडे लक्ष हवे',
    doingGreat:'खूप चांगले करत आहे! 🌟', wasLastMonth:'गेल्या महिन्यात [x] होते',
    missingClasses:'[name] खूप वर्ग चुकवत आहे. सुरक्षित क्षेत्रात येण्यासाठी पुढील [x] वर्ग आवश्यक आहेत.',
    safeZone:'75% उपस्थिती सुरक्षित आहे.',
    excellent:'उत्कृष्ट', good:'चांगले', average:'सरासरी', needsHelp:'मदत हवी',
    improving:'↑ सुधारत आहे', declining:'↓ घसरत आहे', stable:'→ स्थिर',
    moodGood:'चांगला दिवस 😊', moodOk:'ठीक दिवस 😐', moodStressed:'तणावाचा दिवस 😔',
    stressedStreak:'[name] [x] दिवसांपासून तणावात आहे. आज त्याच्याशी बोला.',
    parentAdvice:'तुम्ही काय करू शकता 💡',
    tip1:'आज शाळा कशी गेली ते विचारा (मार्कांबद्दल नाही)',
    tip2:'शाळेच्या रात्री 10 वाजेपर्यंत झोपायला लावा',
    tip3:'या आठवड्यात अतिरिक्त उपक्रम कमी करा',
    aaravStrength:"[name] ची उत्कृष्टता", whereImprove:'कुठे सुधारणा करायची',
    skillsDesc:'[name] कशात चांगले आहे याचे चित्र',
    sciMath:'विज्ञान आणि गणित', english:'इंग्रजी आणि भाषा', homework:'गृहपाठ',
    classActivity:'वर्ग उपक्रम', problemSolving:'समस्या निराकरण',
    bestMatch:'सर्वोत्तम जुळणी ⭐', salaryPotential:'₹[x] LPA संभावना',
    logOut:'लॉग आउट', myProfile:'माझी प्रोफाइल', settings:'सेटिंग्ज',
    heroSubtitle:'[name] आज कसे करत आहे, येथे पहा',
  },
};

/* ── DEMO DATA ────────────────────────────────────────────── */
const STUDENT = {
  name: 'Aarav', parentName: 'Suresh', healthScore: 52, prevHealthScore: 65,
  attendance: 68, targetAttendance: 75,
  subjects: [
    { name: 'Data Structures', pct: 51, attendance: 65, trend: 'declining', color: '#EF4444' },
    { name: 'Mathematics',     pct: 63, attendance: 70, trend: 'stable',   color: '#F59E0B' },
    { name: 'Physics',         pct: 58, attendance: 68, trend: 'declining', color: '#EF4444' },
    { name: 'Communication',   pct: 72, attendance: 72, trend: 'improving', color: '#10B981' },
  ],
  moods: [3,2,2,1,2,1,1], // last 7 days, 1=stressed 2=ok 3=good
  stressStreak: 8,
  skills: [72, 58, 65, 80, 55], // sciMath, english, homework, classActivity, problemSolving
  careers: [
    { icon:'💻', title:'Software Developer', match:true,  desc:'Build apps and websites that millions use.', salary:'8–25' },
    { icon:'📊', title:'Data Analyst',        match:false, desc:'Turn numbers into stories that help companies grow.', salary:'6–20' },
    { icon:'🎨', title:'UX/UI Designer',      match:false, desc:'Design beautiful, easy-to-use digital experiences.', salary:'5–18' },
  ],
};

const INIT_ALERTS = [
  { id:1, isRead:false, border:'#EF4444', icon:'⚠️', title:'Attendance is Critical',   body:"Aarav's attendance dropped to 68%. The minimum required is 75%.", date:'March 11' },
  { id:2, isRead:false, border:'#F97316', icon:'📉', title:'Grades Dropped This Semester', body:'Average grade fell from 65% to 51%. Some subjects need extra help.', date:'March 9' },
  { id:3, isRead:false, border:'#F59E0B', icon:'😔', title:'Aarav Has Been Stressed',  body:'He reported feeling stressed for 8 days in a row.', date:'March 8' },
];

/* ── HELPERS ──────────────────────────────────────────────── */
const C = { orange:'#F97316', blue:'#3B82F6', green:'#10B981', amber:'#F59E0B', red:'#EF4444', navy:'#0A1628', cream:'#FFFDF4' };
const card = { background:'#fff', borderRadius:16, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', padding:24 };
const btn = (bg, col='#fff') => ({ background:bg, color:col, border:'none', borderRadius:10, padding:'10px 20px', fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:15, cursor:'pointer', transition:'opacity .2s', display:'inline-flex', alignItems:'center', gap:6 });

function CircleMeter({ score }) {
  const r = 54; const circ = 2*Math.PI*r;
  const pct = Math.max(0, Math.min(100, score));
  const stroke = pct >= 70 ? C.green : pct >= 50 ? C.amber : C.red;
  return (
    <svg width={130} height={130} style={{ margin:'0 auto', display:'block' }}>
      <circle cx={65} cy={65} r={r} fill="none" stroke="#F3F4F6" strokeWidth={10}/>
      <circle cx={65} cy={65} r={r} fill="none" stroke={stroke} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
        strokeLinecap="round" transform="rotate(-90 65 65)" style={{ transition:'stroke-dashoffset 1s ease' }}/>
      <text x={65} y={60} textAnchor="middle" fontSize={28} fontWeight={800} fill={stroke} fontFamily="Nunito">{score}</text>
      <text x={65} y={80} textAnchor="middle" fontSize={11} fill="#6B7280" fontFamily="Nunito">/100</text>
    </svg>
  );
}

function MiniBar({ pct, color }) {
  return (
    <div style={{ background:'#F3F4F6', borderRadius:8, height:8, overflow:'hidden', flex:1 }}>
      <div style={{ width:`${pct}%`, background:color, height:'100%', borderRadius:8, transition:'width .8s ease' }}/>
    </div>
  );
}

/* ── MAIN COMPONENT ───────────────────────────────────────── */
export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang]         = useState(() => localStorage.getItem('parentLang') || 'en');
  const [alerts, setAlerts]     = useState(INIT_ALERTS);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [msgOpen, setMsgOpen]   = useState(false);
  const [meetOpen, setMeetOpen] = useState(false);
  const [careerModal, setCareerModal] = useState(null);
  const [msgText, setMsgText]   = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('09:00');
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [toast, setToast]       = useState(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const t = (key, name = STUDENT.name) =>
    (T[lang]?.[key] || T.en[key] || key).replace(/\[name\]/g, name).replace(/\[x\]/g, '...');
  const changeLang = (l) => { setLang(l); localStorage.setItem('parentLang', l); };
  const unread = alerts.filter(a => !a.isRead).length;
  const acknowledgeAlert = (id) => setAlerts(prev => prev.map(a => a.id===id ? {...a,isRead:true} : a));
  const showToast = (msg, color='#10B981') => { setToast({msg,color}); setTimeout(()=>setToast(null),3000); };

  // Close dropdowns on outside click
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ── DOWNLOAD REPORT ── */
  const downloadReport = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report – ${STUDENT.name}</title>
<style>body{font-family:Nunito,sans-serif;padding:40px;color:#1f2937;max-width:800px;margin:0 auto}
h1{color:#F97316}h2{color:#3B82F6;margin-top:32px;border-bottom:2px solid #F3F4F6;padding-bottom:8px}
.row{display:flex;gap:24px;margin:16px 0}.stat{flex:1;background:#F9FAFB;border-radius:12px;padding:16px;text-align:center}
.stat .num{font-size:36px;font-weight:800}.green{color:#10B981}.red{color:#EF4444}.amber{color:#F59E0B}
table{width:100%;border-collapse:collapse;margin-top:12px}td,th{padding:10px 14px;border:1px solid #E5E7EB;text-align:left}
th{background:#F9FAFB}@media print{body{padding:20px}}</style></head><body>
<h1>📊 EduPulse Student Report</h1>
<p><strong>Student:</strong> ${STUDENT.name} &nbsp;|&nbsp; <strong>Parent:</strong> ${STUDENT.parentName} &nbsp;|&nbsp; <strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
<div class="row">
  <div class="stat"><div class="num ${STUDENT.healthScore>=70?'green':STUDENT.healthScore>=50?'amber':'red'}">${STUDENT.healthScore}</div><div>Academic Health Score</div></div>
  <div class="stat"><div class="num ${STUDENT.attendance>=75?'green':'red'}">${STUDENT.attendance}%</div><div>Attendance</div></div>
  <div class="stat"><div class="num amber">${STUDENT.stressStreak}</div><div>Stress Days (streak)</div></div>
</div>
<h2>📚 Subject Performance</h2>
<table><tr><th>Subject</th><th>Grade %</th><th>Attendance %</th><th>Trend</th></tr>
${STUDENT.subjects.map(s=>`<tr><td>${s.name}</td><td>${s.pct}%</td><td>${s.attendance}%</td><td>${s.trend}</td></tr>`).join('')}
</table>
<h2>🔔 Alerts History</h2>
<table><tr><th>Alert</th><th>Details</th><th>Date</th><th>Status</th></tr>
${alerts.map(a=>`<tr><td>${a.icon} ${a.title}</td><td>${a.body}</td><td>${a.date}</td><td>${a.isRead?'Read':'Unread'}</td></tr>`).join('')}
</table>
<h2>🚀 Career Paths</h2>
<table><tr><th>Career</th><th>Salary Range</th></tr>
${STUDENT.careers.map(c=>`<tr><td>${c.icon} ${c.title}</td><td>₹${c.salary} LPA</td></tr>`).join('')}
</table>
<p style="margin-top:40px;color:#9CA3AF;font-size:13px">Generated by EduPulse · Hawkathon 2026</p>
<script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open('','_blank');
    w.document.write(html);
    w.document.close();
  };

  const scoreColor = STUDENT.healthScore >= 70 ? C.green : STUDENT.healthScore >= 50 ? C.amber : C.red;
  const attColor   = STUDENT.attendance  >= 75 ? C.green : STUDENT.attendance >= 60  ? C.amber : C.red;
  const classesNeeded = Math.ceil((0.75 * (100 + 15) - STUDENT.attendance * 1) / (1 - 0.75));

  return (
    <div style={{ background:C.cream, minHeight:'100vh', fontFamily:"'Nunito',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box} body{margin:0}
        .pd-btn:hover{opacity:.85!important;transform:scale(1.02)} .pd-card{transition:transform .2s} .pd-card:hover{transform:translateY(-3px)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease forwards}`}
      </style>

      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #F3F4F6', padding:'0 28px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
        {/* Left: logo + student chip */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontSize:22, fontWeight:900, color:C.orange }}>{t('appName')}</span>
          <div style={{ background:`${C.orange}15`, border:`1.5px solid ${C.orange}30`, borderRadius:50, padding:'4px 14px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>🧑‍🎓</span>
            <span style={{ fontWeight:700, color:C.orange, fontSize:15 }}>{STUDENT.name}</span>
          </div>
        </div>

        {/* Right: lang + bell + avatar */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Language selector */}
          {[['en','🇮🇳 EN'],['hi','हि'],['mr','म']].map(([code,label])=>(
            <button key={code} className="pd-btn" onClick={()=>changeLang(code)}
              style={{ background: lang===code ? C.orange : '#F9FAFB', color: lang===code ? '#fff' : '#374151', border:`1.5px solid ${lang===code ? C.orange : '#E5E7EB'}`, borderRadius:8, padding:'5px 12px', fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .2s' }}>
              {label}
            </button>
          ))}

          {/* Bell */}
          <div ref={notifRef} style={{ position:'relative' }}>
            <button className="pd-btn" onClick={()=>setNotifOpen(o=>!o)}
              style={{ background:'#F9FAFB', border:'1.5px solid #E5E7EB', borderRadius:10, width:40, height:40, fontSize:18, cursor:'pointer', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
              🔔
              {unread>0 && <span style={{ position:'absolute', top:4, right:4, background:C.red, color:'#fff', borderRadius:'50%', width:16, height:16, fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{unread}</span>}
            </button>
            {notifOpen && (
              <div style={{ position:'absolute', right:0, top:48, background:'#fff', borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.14)', width:320, zIndex:200, overflow:'hidden' }}>
                <div style={{ padding:'14px 18px', fontWeight:800, fontSize:15, borderBottom:'1px solid #F3F4F6', color:'#1F2937' }}>{t('notifTitle')}</div>
                {alerts.length===0 ? <div style={{ padding:18, color:'#9CA3AF', textAlign:'center' }}>{t('noNotifs')}</div> :
                  alerts.map(a=>(
                    <div key={a.id} style={{ padding:'12px 18px', borderBottom:'1px solid #F9FAFB', borderLeft:`4px solid ${a.isRead?'#E5E7EB':a.border}`, background:a.isRead?'#FAFAFA':'#fff' }}>
                      <div style={{ fontWeight:700, fontSize:14, color:'#1F2937' }}>{a.icon} {a.title}</div>
                      <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{a.date}</div>
                      {!a.isRead && <button className="pd-btn" onClick={()=>acknowledgeAlert(a.id)}
                        style={{ marginTop:6, background:`${C.orange}15`, color:C.orange, border:'none', borderRadius:6, padding:'4px 10px', fontSize:12, fontWeight:700, cursor:'pointer' }}>{t('markRead')}</button>}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          {/* Avatar */}
          <div ref={profileRef} style={{ position:'relative' }}>
            <button className="pd-btn" onClick={()=>setProfileOpen(o=>!o)}
              style={{ background:C.orange, color:'#fff', border:'none', borderRadius:'50%', width:40, height:40, fontSize:17, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {(user?.name||'P')[0].toUpperCase()}
            </button>
            {profileOpen && (
              <div style={{ position:'absolute', right:0, top:48, background:'#fff', borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,0.13)', width:200, zIndex:200, overflow:'hidden' }}>
                {[['👤',t('myProfile')],['⚙️',t('settings')]].map(([icon,label])=>(
                  <div key={label} style={{ padding:'12px 18px', cursor:'pointer', fontSize:14, fontWeight:600, color:'#374151', display:'flex', gap:10, transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#FFF7ED'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    {icon} {label}
                  </div>
                ))}
                <div onClick={()=>{logout?.(); navigate('/login');}} style={{ padding:'12px 18px', cursor:'pointer', fontSize:14, fontWeight:700, color:C.red, display:'flex', gap:10, borderTop:'1px solid #F3F4F6' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#FFF1F2'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  🚪 {t('logOut')}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════ */}
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'28px 20px' }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className="fade-up" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:28 }}>
          <div>
            <h1 style={{ margin:0, fontSize:28, fontWeight:900, color:'#1F2937' }}>{t('welcome')}, {STUDENT.parentName}! 👋</h1>
            <p style={{ margin:'6px 0 0', fontSize:17, color:'#6B7280', fontWeight:600 }}>{t('heroSubtitle',STUDENT.name)}</p>
            <p style={{ margin:'4px 0 0', fontSize:13, color:'#9CA3AF' }}>🕐 {t('updatedAgo')}</p>
          </div>
          <button className="pd-btn" onClick={downloadReport}
            style={{ ...btn(C.orange), fontSize:15, padding:'12px 24px', borderRadius:12, boxShadow:`0 4px 16px ${C.orange}40` }}>
            {t('downloadReport')}
          </button>
        </div>

        {/* ── ROW 1: THREE CARDS ───────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))', gap:20, marginBottom:24 }}>

          {/* CARD 1 — HEALTH SCORE */}
          <div className="pd-card fade-up" style={{ ...card }}>
            <h3 style={{ margin:'0 0 16px', fontSize:17, fontWeight:800, color:'#1F2937' }}>{t('howDoing',STUDENT.name)}</h3>
            <CircleMeter score={STUDENT.healthScore} />
            <div style={{ textAlign:'center', marginTop:14 }}>
              <div style={{ fontSize:20, fontWeight:900, color:scoreColor }}>
                {STUDENT.healthScore >= 70 ? t('doingGreat') : STUDENT.healthScore >= 50 ? t('needsAttention') : t('needsSupport')}
              </div>
              <div style={{ fontSize:13, color:'#9CA3AF', marginTop:6 }}>
                {t('wasLastMonth').replace('[x]', STUDENT.prevHealthScore)} {STUDENT.healthScore < STUDENT.prevHealthScore ? '↓' : '↑'}
              </div>
            </div>
            {/* Color scale */}
            <div style={{ marginTop:16, display:'flex', borderRadius:8, overflow:'hidden', height:10 }}>
              <div style={{ flex:49, background:C.red }}/><div style={{ flex:20, background:C.amber }}/><div style={{ flex:31, background:C.green }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9CA3AF', marginTop:4 }}>
              <span>0 – Needs Support</span><span>50 – Attention</span><span>70 – Great</span>
            </div>
          </div>

          {/* CARD 2 — ATTENDANCE */}
          <div className="pd-card fade-up" style={{ ...card }}>
            <h3 style={{ margin:'0 0 16px', fontSize:17, fontWeight:800, color:'#1F2937' }}>{t('attendanceTitle',STUDENT.name)}</h3>
            <div style={{ display:'flex', alignItems:'flex-end', gap:10, marginBottom:8 }}>
              <span style={{ fontSize:54, fontWeight:900, color:attColor, lineHeight:1 }}>{STUDENT.attendance}%</span>
              <span style={{ fontSize:14, color:'#9CA3AF', marginBottom:10 }}>/ 75% required</span>
            </div>
            <div style={{ background:'#F3F4F6', borderRadius:12, height:14, overflow:'hidden', marginBottom:12 }}>
              <div style={{ width:`${STUDENT.attendance}%`, background:attColor, height:'100%', borderRadius:12, transition:'width 1s ease' }}/>
            </div>
            <p style={{ margin:'0 0 14px', fontSize:14, color:'#374151', lineHeight:1.6 }}>
              {t('missingClasses').replace('[name]',STUDENT.name).replace('[x]',15)}
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {STUDENT.subjects.map(s=>(
                <div key={s.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#374151', minWidth:140 }}>{s.name}</span>
                  <MiniBar pct={s.attendance} color={s.attendance>=75?C.green:s.attendance>=60?C.amber:C.red}/>
                  <span style={{ fontSize:12, fontWeight:800, color:s.attendance>=75?C.green:s.attendance>=60?C.amber:C.red, minWidth:36, textAlign:'right' }}>
                    {s.attendance}% {s.attendance>=75?'🟢':s.attendance>=60?'🟡':'🔴'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 3 — ALERTS */}
          <div className="pd-card fade-up" style={{ ...card }}>
            <h3 style={{ margin:'0 0 14px', fontSize:17, fontWeight:800, color:'#1F2937' }}>{t('noticesTitle')}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {alerts.map(a=>(
                <div key={a.id} style={{ borderLeft:`4px solid ${a.border}`, background:`${a.border}0D`, borderRadius:'0 10px 10px 0', padding:'12px 14px' }}>
                  <div style={{ fontWeight:800, fontSize:14, color:'#1F2937', marginBottom:4 }}>{a.icon} {a.title}</div>
                  <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.5, marginBottom:a.isRead?0:10 }}>{a.body}</div>
                  <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:a.isRead?0:10 }}>{a.date}</div>
                  {!a.isRead ? (
                    <button className="pd-btn" onClick={()=>{acknowledgeAlert(a.id);showToast(t('acknowledged'));}}
                      style={{ background:a.border, color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                      {t('acknowledge')}
                    </button>
                  ) : (
                    <span style={{ fontSize:12, color:C.green, fontWeight:700 }}>{t('acknowledged')}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 2: SUBJECT PERFORMANCE ───────────────────── */}
        <div className="fade-up" style={{ ...card, marginBottom:24 }}>
          <h2 style={{ margin:'0 0 20px', fontSize:20, fontWeight:900, color:'#1F2937' }}>{t('subjectsTitle',STUDENT.name)}</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 }}>
            {STUDENT.subjects.map(s=>{
              const grade = s.pct>=90?t('excellent'):s.pct>=75?t('good'):s.pct>=60?t('average'):t('needsHelp');
              const gc    = s.pct>=90?C.green:s.pct>=75?C.blue:s.pct>=60?C.amber:C.red;
              const trendIcon = s.trend==='improving'?t('improving'):s.trend==='declining'?t('declining'):t('stable');
              const trendC = s.trend==='improving'?C.green:s.trend==='declining'?C.red:C.amber;
              return (
                <div key={s.name} className="pd-card" style={{ background:'#F9FAFB', border:`1.5px solid ${gc}30`, borderRadius:14, padding:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <span style={{ fontWeight:800, fontSize:15, color:'#1F2937' }}>{s.name}</span>
                    <span style={{ background:`${gc}20`, color:gc, fontSize:12, fontWeight:800, borderRadius:6, padding:'3px 10px' }}>{grade}</span>
                  </div>
                  <div style={{ fontSize:42, fontWeight:900, color:gc, lineHeight:1, marginBottom:8 }}>{s.pct}%</div>
                  <MiniBar pct={s.pct} color={gc}/>
                  <div style={{ marginTop:10, display:'flex', justifyContent:'space-between', fontSize:13, color:'#6B7280' }}>
                    <span>Attendance: <strong style={{color:s.attendance>=75?C.green:C.red}}>{s.attendance}%</strong></span>
                    <span style={{ fontWeight:800, color:trendC }}>{trendIcon}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ROW 3: WELLBEING ─────────────────────────────── */}
        <div className="fade-up" style={{ ...card, marginBottom:24 }}>
          <h2 style={{ margin:'0 0 20px', fontSize:20, fontWeight:900, color:'#1F2937' }}>{t('wellbeingTitle',STUDENT.name)}</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            {/* Mood timeline */}
            <div>
              <p style={{ margin:'0 0 14px', fontSize:15, fontWeight:700, color:'#374151' }}>Last 7 Days</p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
                {STUDENT.moods.map((m,i)=>{
                  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
                  const bg = m===3?C.green:m===2?C.amber:C.red;
                  const emoji = m===3?'😊':m===2?'😐':'😔';
                  return (
                    <div key={i} style={{ textAlign:'center' }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:`${bg}20`, border:`2.5px solid ${bg}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{emoji}</div>
                      <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4, fontWeight:700 }}>{dayNames[i]}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background:`${C.red}12`, border:`1.5px solid ${C.red}30`, borderRadius:12, padding:'14px 16px' }}>
                <p style={{ margin:0, fontSize:14, color:'#374151', lineHeight:1.6 }}>
                  {t('stressedStreak').replace('[name]',STUDENT.name).replace('[x]',STUDENT.stressStreak)}
                </p>
              </div>
            </div>
            {/* Parent advice */}
            <div style={{ background:`${C.orange}08`, border:`2px solid ${C.orange}25`, borderRadius:14, padding:20 }}>
              <p style={{ margin:'0 0 14px', fontSize:16, fontWeight:900, color:C.orange }}>{t('parentAdvice')}</p>
              {[t('tip1'),t('tip2'),t('tip3')].map((tip,i)=>(
                <div key={i} style={{ display:'flex', gap:10, marginBottom:12, alignItems:'flex-start' }}>
                  <span style={{ background:C.orange, color:'#fff', borderRadius:'50%', width:22, height:22, fontSize:12, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>✓</span>
                  <span style={{ fontSize:14, color:'#374151', lineHeight:1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 4: SKILLS RADAR ──────────────────────────── */}
        <div className="fade-up" style={{ ...card, marginBottom:24 }}>
          <h2 style={{ margin:'0 0 6px', fontSize:20, fontWeight:900, color:'#1F2937' }}>{t('skillsTitle',STUDENT.name)}</h2>
          <p style={{ margin:'0 0 20px', fontSize:14, color:'#9CA3AF' }}>{t('skillsDesc',STUDENT.name)}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'center' }}>
            <div style={{ maxWidth:320, margin:'0 auto', width:'100%' }}>
              <Radar
                data={{
                  labels:[t('sciMath'),t('english'),t('homework'),t('classActivity'),t('problemSolving')],
                  datasets:[{ label: STUDENT.name, data: STUDENT.skills,
                    backgroundColor:`${C.orange}25`, borderColor:C.orange, borderWidth:2.5,
                    pointBackgroundColor:C.orange, pointRadius:5 }]
                }}
                options={{ responsive:true, scales:{ r:{ min:0, max:100, ticks:{stepSize:25,font:{size:10}}, grid:{color:'#F3F4F6'}, pointLabels:{font:{size:12,weight:'bold'},color:'#374151'} }}, plugins:{legend:{display:false}} }}
              />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[t('sciMath'),t('english'),t('homework'),t('classActivity'),t('problemSolving')].map((skill,i)=>{
                const val = STUDENT.skills[i];
                const color = val>=75?C.green:val>=55?C.amber:C.red;
                return (
                  <div key={skill}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'#374151' }}>{skill}</span>
                      <span style={{ fontSize:14, fontWeight:800, color }}>{val}%</span>
                    </div>
                    <MiniBar pct={val} color={color}/>
                  </div>
                );
              })}
              <div style={{ marginTop:8, display:'flex', gap:12, flexWrap:'wrap' }}>
                <div style={{ background:`${C.green}15`, border:`1.5px solid ${C.green}30`, borderRadius:10, padding:'8px 14px', fontSize:13, color:C.green, fontWeight:700 }}>
                  🌟 {t('aaravStrength',STUDENT.name)}: {t('classActivity')}
                </div>
                <div style={{ background:`${C.orange}15`, border:`1.5px solid ${C.orange}30`, borderRadius:10, padding:'8px 14px', fontSize:13, color:C.orange, fontWeight:700 }}>
                  📈 {t('whereImprove')}: {t('problemSolving')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 5: CAREER PATHS ──────────────────────────── */}
        <div className="fade-up" style={{ ...card, marginBottom:24 }}>
          <h2 style={{ margin:'0 0 4px', fontSize:20, fontWeight:900, color:'#1F2937' }}>{t('careerTitle',STUDENT.name)}</h2>
          <p style={{ margin:'0 0 20px', fontSize:14, color:'#9CA3AF' }}>{t('careerSub')}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
            {STUDENT.careers.map((c,i)=>(
              <div key={i} className="pd-card" style={{ border:`2px solid ${c.match?C.orange:'#E5E7EB'}`, borderRadius:16, padding:20, background: c.match?`${C.orange}06`:'#FAFAFA', position:'relative' }}>
                {c.match && <span style={{ position:'absolute', top:12, right:12, background:C.orange, color:'#fff', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:800 }}>{t('bestMatch')}</span>}
                <div style={{ fontSize:36, marginBottom:10 }}>{c.icon}</div>
                <div style={{ fontWeight:900, fontSize:17, color:'#1F2937', marginBottom:6 }}>{c.title}</div>
                <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.5, marginBottom:12 }}>{c.desc}</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.green, marginBottom:12 }}>{t('salaryPotential').replace('[x]',c.salary)}</div>
                <button className="pd-btn" onClick={()=>setCareerModal(c)}
                  style={{ ...btn(C.blue), width:'100%', justifyContent:'center', fontSize:13, padding:'8px 0' }}>
                  {t('learnMore')} →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROW 6: CONTACT SCM ───────────────────────────── */}
        <div className="fade-up" style={{ background:C.navy, borderRadius:20, padding:32, marginBottom:24, color:'#fff' }}>
          <h2 style={{ margin:'0 0 24px', fontSize:20, fontWeight:900, color:'#fff' }}>{t('contactTitle')}</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:32, alignItems:'center' }}>
            {/* SCM info */}
            <div style={{ display:'flex', gap:16, alignItems:'center' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:`${C.orange}30`, border:`3px solid ${C.orange}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>👩‍🏫</div>
              <div>
                <div style={{ fontWeight:900, fontSize:17 }}>{t('scmName')}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginTop:3 }}>{t('scmRole')}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:2 }}>scm@edupulse.com</div>
                <div style={{ fontSize:12, color:C.green, marginTop:2, fontWeight:700 }}>● {t('scmAvail')}</div>
              </div>
            </div>
            {/* Main action buttons */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <button className="pd-btn" onClick={()=>setMsgOpen(true)}
                style={{ ...btn(C.orange), fontSize:15, padding:'13px 28px', borderRadius:12, boxShadow:`0 4px 16px ${C.orange}50` }}>
                {t('msgBtn')}
              </button>
              <button className="pd-btn" onClick={()=>setMeetOpen(true)}
                style={{ ...btn(C.blue), fontSize:15, padding:'13px 28px', borderRadius:12, boxShadow:`0 4px 16px ${C.blue}50` }}>
                {t('meetBtn')}
              </button>
            </div>
            {/* Quick actions */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="pd-btn" onClick={downloadReport}
                style={{ ...btn('rgba(255,255,255,0.1)'), border:'1.5px solid rgba(255,255,255,0.2)', justifyContent:'center' }}>
                {t('viewReport')}
              </button>
              <button className="pd-btn" onClick={()=>{ setEmailUpdates(e=>!e); showToast(emailUpdates?t('emailOff'):t('emailOn')); }}
                style={{ ...btn(emailUpdates?C.green:'rgba(255,255,255,0.1)'), border:`1.5px solid ${emailUpdates?C.green:'rgba(255,255,255,0.2)'}`, justifyContent:'center' }}>
                {t('emailUpdates')} {emailUpdates?'✓':''}
              </button>
              <button className="pd-btn" onClick={()=>showToast(t('snoozed'),C.amber)}
                style={{ ...btn('rgba(255,255,255,0.1)'), border:'1.5px solid rgba(255,255,255,0.2)', justifyContent:'center' }}>
                {t('snooze')}
              </button>
            </div>
          </div>
        </div>

      </div>{/* end main content */}

      {/* ══ MODAL: MESSAGE COUNSELOR ════════════════════════════ */}
      {msgOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:32, maxWidth:480, width:'100%', boxShadow:'0 16px 48px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin:'0 0 6px', fontSize:20, fontWeight:900, color:'#1F2937' }}>{t('msgBtn')}</h3>
            <p style={{ margin:'0 0 18px', fontSize:14, color:'#9CA3AF' }}>To: {t('scmName')} · {t('scmRole')}</p>
            <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder={t('msgPlaceholder')}
              style={{ width:'100%', minHeight:140, borderRadius:12, border:'1.5px solid #E5E7EB', padding:14, fontSize:15, fontFamily:"'Nunito',sans-serif", resize:'vertical', outline:'none', boxSizing:'border-box' }}/>
            <div style={{ display:'flex', gap:12, marginTop:16 }}>
              <button className="pd-btn" onClick={()=>{ if(msgText.trim()){ showToast(t('msgSent')); setMsgOpen(false); setMsgText(''); } }}
                style={{ ...btn(C.orange), flex:1, justifyContent:'center', fontSize:15, padding:13 }}>
                {t('sendMsg')} ✈️
              </button>
              <button className="pd-btn" onClick={()=>setMsgOpen(false)}
                style={{ ...btn('#F3F4F6','#374151'), padding:'13px 20px', fontSize:15 }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: SCHEDULE MEETING ═════════════════════════════ */}
      {meetOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:32, maxWidth:440, width:'100%', boxShadow:'0 16px 48px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin:'0 0 20px', fontSize:20, fontWeight:900, color:'#1F2937' }}>{t('meetBtn')}</h3>
            <label style={{ display:'block', fontWeight:700, fontSize:14, color:'#374151', marginBottom:6 }}>{t('selectDate')}</label>
            <input type="date" value={meetDate} onChange={e=>setMeetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ width:'100%', borderRadius:10, border:'1.5px solid #E5E7EB', padding:12, fontSize:15, fontFamily:"'Nunito',sans-serif", marginBottom:16, outline:'none', boxSizing:'border-box' }}/>
            <label style={{ display:'block', fontWeight:700, fontSize:14, color:'#374151', marginBottom:6 }}>{t('selectTime')}</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
              {['09:00','10:00','11:00','14:00','15:00','16:00'].map(slot=>(
                <button key={slot} className="pd-btn" onClick={()=>setMeetTime(slot)}
                  style={{ background: meetTime===slot?C.blue:'#F9FAFB', color: meetTime===slot?'#fff':'#374151',
                    border:`1.5px solid ${meetTime===slot?C.blue:'#E5E7EB'}`, borderRadius:8, padding:'8px 16px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                  {slot}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button className="pd-btn" onClick={()=>{ if(meetDate){ showToast(`${t('meetSent')} ${meetDate} at ${meetTime}`,C.blue); setMeetOpen(false); } }}
                style={{ ...btn(C.blue), flex:1, justifyContent:'center', fontSize:15, padding:13 }}>
                {t('confirm')} 📅
              </button>
              <button className="pd-btn" onClick={()=>setMeetOpen(false)}
                style={{ ...btn('#F3F4F6','#374151'), padding:'13px 20px', fontSize:15 }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: CAREER DETAIL ════════════════════════════════ */}
      {careerModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:32, maxWidth:440, width:'100%', boxShadow:'0 16px 48px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize:48, textAlign:'center', marginBottom:12 }}>{careerModal.icon}</div>
            <h3 style={{ margin:'0 0 6px', fontSize:22, fontWeight:900, color:'#1F2937', textAlign:'center' }}>{careerModal.title}</h3>
            <p style={{ margin:'0 0 20px', textAlign:'center', color:'#6B7280', fontSize:14 }}>{careerModal.desc}</p>
            <div style={{ display:'flex', gap:12, marginBottom:20 }}>
              <div style={{ flex:1, background:`${C.green}12`, border:`1.5px solid ${C.green}30`, borderRadius:12, padding:14, textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:900, color:C.green }}>₹{careerModal.salary} LPA</div>
                <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>Salary Range</div>
              </div>
              <div style={{ flex:1, background:`${C.blue}12`, border:`1.5px solid ${C.blue}30`, borderRadius:12, padding:14, textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:900, color:C.blue }}>3–5 yrs</div>
                <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>to full career</div>
              </div>
            </div>
            <div style={{ background:'#F9FAFB', borderRadius:12, padding:14, marginBottom:20 }}>
              <p style={{ margin:'0 0 8px', fontWeight:800, fontSize:14, color:'#374151' }}>Why this suits {STUDENT.name}:</p>
              <p style={{ margin:0, fontSize:14, color:'#6B7280', lineHeight:1.6 }}>
                Based on {STUDENT.name}'s strength in class participation and consistent attendance in Communication, this path leverages both social and analytical skills.
              </p>
            </div>
            <button className="pd-btn" onClick={()=>setCareerModal(null)}
              style={{ ...btn(C.orange), width:'100%', justifyContent:'center', fontSize:15, padding:13 }}>
              Close ✕
            </button>
          </div>
        </div>
      )}

      {/* ══ TOAST ═══════════════════════════════════════════════ */}
      {toast && (
        <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', background:toast.color, color:'#fff', borderRadius:12, padding:'13px 30px', fontWeight:700, fontSize:15, boxShadow:'0 4px 24px rgba(0,0,0,0.22)', zIndex:9999, whiteSpace:'nowrap', transition:'opacity .3s' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
