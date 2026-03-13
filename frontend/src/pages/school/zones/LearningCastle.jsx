import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../utils/api';

const FONT = "'Fredoka One', cursive";
const BG   = 'linear-gradient(180deg,#FFECD2 0%,#FCB69F 40%,#FFD700 100%)';

/* ── Real Class 3-5 Lessons (NCERT-aligned) ─────────────────────────────── */
const LESSONS = [
  {
    id:'eng1', subject:'English', icon:'📖', color:'#FF6B6B', title:'Nouns Around Us',
    grade:'Class 3', duration:'15 min', xp:30,
    content:[
      { type:'explain', text:'A NOUN is the name of a person, place, animal, or thing. Look around — everything has a name!', emoji:'💡' },
      { type:'examples', label:'Person', items:['Teacher', 'Doctor', 'Farmer', 'Aryan'] },
      { type:'examples', label:'Place',  items:['School', 'River', 'Market', 'India'] },
      { type:'examples', label:'Animal', items:['Lion', 'Elephant', 'Parrot', 'Fish'] },
      { type:'examples', label:'Thing',  items:['Book', 'Chair', 'Mango', 'Clock'] },
    ],
    quiz:[
      { q:"Which word is a PLACE noun?", opts:['Happy','Mumbai','Run','Beautiful'], ans:1 },
      { q:"'Dog' is a noun for which category?", opts:['Person','Place','Animal','Thing'], ans:2 },
      { q:"Which word is NOT a noun?", opts:['School','Riya','Jump','Pencil'], ans:2 },
    ],
  },
  {
    id:'eng2', subject:'English', icon:'✍️', color:'#FF6B6B', title:'Rhyming Words',
    grade:'Class 4', duration:'12 min', xp:25,
    content:[
      { type:'explain', text:'Rhyming words END with the same sound! They make poems fun and musical! 🎵', emoji:'🎵' },
      { type:'pairs', items:[['Cat','Bat'],['Ball','Wall'],['Rain','Train'],['Moon','Spoon'],['Day','Play'],['Night','Bright']] },
    ],
    quiz:[
      { q:"Which word rhymes with 'King'?", opts:['Queen','Ring','Sing','Both B & C'], ans:3 },
      { q:"Which rhymes with 'Star'?", opts:['Moon','Car','Night','Sun'], ans:1 },
      { q:"'Book' rhymes with...?", opts:['Cook','Look','Both A & B','None'], ans:2 },
    ],
  },
  {
    id:'math1', subject:'Math', icon:'🔢', color:'#00875A', title:'Multiplication Magic',
    grade:'Class 3', duration:'20 min', xp:40,
    content:[
      { type:'explain', text:'Multiplication is just FAST addition! 3 × 4 means adding 3 four times: 3+3+3+3 = 12 ⚡', emoji:'⚡' },
      { type:'table', label:'Times Table of 3', rows:[[3,1,3],[3,2,6],[3,3,9],[3,4,12],[3,5,15],[3,6,18],[3,7,21],[3,8,24],[3,9,27],[3,10,30]] },
    ],
    quiz:[
      { q:"3 × 7 = ?", opts:['18','21','24','27'], ans:1 },
      { q:"5 × 6 = ?", opts:['25','30','35','11'], ans:1 },
      { q:"4 × 8 = ?", opts:['28','32','36','42'], ans:1 },
    ],
  },
  {
    id:'math2', subject:'Math', icon:'📐', color:'#00875A', title:'Fun with Fractions',
    grade:'Class 5', duration:'18 min', xp:35,
    content:[
      { type:'explain', text:'A fraction shows PART of a whole. If you cut a pizza into 4 equal pieces and eat 1 piece, you ate 1/4!', emoji:'🍕' },
      { type:'visual_fraction', items:[{label:'1/2 = One Half',fill:50,color:'#FF6B6B'},{label:'1/4 = One Quarter',fill:25,color:'#FFD700'},{label:'3/4 = Three Quarters',fill:75,color:'#38bdf8'}] },
    ],
    quiz:[
      { q:"If you eat 2 slices from 8 equal slices, you ate:", opts:['1/4','1/2','2/4','Both A & C'], ans:3 },
      { q:"Which is bigger: 1/2 or 1/4?", opts:['1/4','1/2','Both equal','Cannot say'], ans:1 },
      { q:"3/3 = ?", opts:['0','1/3','1','3'], ans:2 },
    ],
  },
  {
    id:'evs1', subject:'EVS', icon:'🌿', color:'#10b981', title:'Parts of a Plant',
    grade:'Class 3', duration:'15 min', xp:30,
    content:[
      { type:'explain', text:'Every plant has different PARTS and each part has a special JOB to do! 🌱', emoji:'🌱' },
      { type:'parts_list', items:[
        { part:'🌰 Roots',  job:'Absorb water & minerals from soil. Hold the plant in place.' },
        { part:'🟫 Stem',   job:'Carries water from roots to leaves. Holds the plant upright.' },
        { part:'🍃 Leaves', job:'Make food using sunlight (Photosynthesis). Give out oxygen.' },
        { part:'🌸 Flower', job:'Used for reproduction. Attracts bees and butterflies.' },
        { part:'🍎 Fruit',  job:'Protects the seed. We eat many fruits!' },
        { part:'🌱 Seed',   job:'Grows into a new plant.' },
      ]},
    ],
    quiz:[
      { q:"Which part makes food for the plant?", opts:['Root','Stem','Leaf','Flower'], ans:2 },
      { q:"Which part absorbs water from soil?", opts:['Leaf','Root','Stem','Fruit'], ans:1 },
      { q:"Photosynthesis happens in the...?", opts:['Root','Seed','Leaf','Stem'], ans:2 },
    ],
  },
  {
    id:'evs2', subject:'EVS', icon:'🌍', color:'#10b981', title:'Our Solar System',
    grade:'Class 4-5', duration:'20 min', xp:40,
    content:[
      { type:'explain', text:'Our Solar System has 8 planets all going around the SUN! The Sun is a STAR — a huge ball of hot gas! ☀️', emoji:'☀️' },
      { type:'planets', items:[
        { name:'Mercury', emoji:'⚫', fact:'Closest to Sun. No atmosphere. Tiny!' },
        { name:'Venus',   emoji:'🟡', fact:'Hottest planet. Covered with thick clouds.' },
        { name:'Earth',   emoji:'🌍', fact:'Our home! Has water + oxygen = Life!' },
        { name:'Mars',    emoji:'🔴', fact:'Red planet. Has the tallest volcano.' },
        { name:'Jupiter', emoji:'🟠', fact:'Largest planet! Has the Great Red Spot storm.' },
        { name:'Saturn',  emoji:'💛', fact:'Has beautiful rings made of ice and rock.' },
        { name:'Uranus',  emoji:'🔵', fact:'Rotates on its side! Very cold.' },
        { name:'Neptune', emoji:'💙', fact:'Farthest planet. Stormy winds.' },
      ]},
    ],
    quiz:[
      { q:"Which planet is known as the Red Planet?", opts:['Venus','Mercury','Mars','Jupiter'], ans:2 },
      { q:"Which is the largest planet?", opts:['Saturn','Jupiter','Earth','Neptune'], ans:1 },
      { q:"Which planet do WE live on?", opts:['Mars','Venus','Earth','Saturn'], ans:2 },
    ],
  },
];

const SUBJ_COLORS = { English:'#FF6B6B', Math:'#00875A', EVS:'#10b981' };

export default function LearningCastle() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [view, setView]         = useState('list');  // 'list' | 'lesson' | 'quiz'
  const [active, setActive]     = useState(null);
  const [step, setStep]         = useState(0);
  const [quizIdx, setQuizIdx]   = useState(0);
  const [picked, setPicked]     = useState(null);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState({});
  const [filter, setFilter]     = useState('All');

  const filtered = filter === 'All' ? LESSONS : LESSONS.filter(l => l.subject === filter);

  const openLesson = (l) => { setActive(l); setView('lesson'); setStep(0); };
  const startQuiz  = () => { setView('quiz'); setQuizIdx(0); setPicked(null); setScore(0); };
  const pickAns    = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === active.quiz[quizIdx].ans) setScore(s => s + 1);
  };
  const nextQ = () => {
    if (quizIdx + 1 < active.quiz.length) { setQuizIdx(q => q+1); setPicked(null); }
    else {
      setView('result');
      if (score + (picked === active.quiz[quizIdx].ans ? 1 : 0) >= 2) {
        const xpEarned = active.xp;
        setDone(d => ({...d, [active.id]: true}));
        try { API.post('/school/mood/log', { studentId: user?._id, numericScore: 5, mood:'engaged', note:`Completed: ${active.title}` }); } catch {}
      }
    }
  };

  const q   = active?.quiz?.[quizIdx];
  const fin = score + (picked !== null && picked === active?.quiz?.[quizIdx]?.ans ? 1 : 0);

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, padding:'0 0 80px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .lesson-card:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 12px 36px rgba(0,0,0,0.15)!important; transition:all 0.2s;}
        .opt-btn:hover:not(:disabled){transform:scale(1.03);}
      `}</style>

      {/* ── HEADER ─────────────────────────────────── */}
      <div style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'14px', borderBottom:'3px solid rgba(255,255,255,0.6)', position:'sticky', top:0, zIndex:50 }}>
        <button onClick={() => view==='list' ? navigate('/school/sparky-world') : setView('list')} style={{ background:'#FF6B6B', border:'none', borderRadius:'50px', padding:'8px 20px', color:'#fff', fontSize:'15px', fontFamily:FONT, cursor:'pointer' }}>
          {view==='list'?'🌍 World Map':'← Back'}
        </button>
        <span style={{ fontSize:'28px' }}>🏰</span>
        <span style={{ fontSize:'22px', color:'#FF6B6B', fontWeight:700 }}>Learning Castle</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
          {['All','English','Math','EVS'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background:filter===f?SUBJ_COLORS[f]||'#FF6B6B':'rgba(255,255,255,0.6)', border:'none', borderRadius:'50px', padding:'6px 16px', color:filter===f?'#fff':'#555', fontSize:'13px', fontFamily:FONT, cursor:'pointer', transition:'all 0.2s' }}>{f}</button>
          ))}
        </div>
      </div>

      {/* ── LESSON LIST ───────────────────────────── */}
      {view === 'list' && (
        <div style={{ maxWidth:'900px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ fontSize:'28px', color:'#8B4513', textAlign:'center', marginBottom:'8px' }}>📚 Choose Your Lesson</div>
          <div style={{ fontSize:'14px', color:'#A0522D', textAlign:'center', marginBottom:'28px' }}>Click any lesson to start learning! 🌟</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'20px' }}>
            {filtered.map(l => (
              <div key={l.id} className="lesson-card" onClick={() => openLesson(l)} style={{ background:'rgba(255,255,255,0.92)', borderRadius:'24px', padding:'24px', cursor:'pointer', boxShadow:'0 6px 24px rgba(0,0,0,0.10)', position:'relative', overflow:'hidden', border:`3px solid ${done[l.id]?'#00E5A0':l.color+'44'}` }}>
                {done[l.id] && <div style={{ position:'absolute', top:'12px', right:'12px', background:'#00E5A0', borderRadius:'50px', padding:'3px 10px', fontSize:'11px', color:'#fff' }}>✅ Done</div>}
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>{l.icon}</div>
                <div style={{ display:'inline-block', background:l.color+'22', borderRadius:'50px', padding:'3px 12px', fontSize:'12px', color:l.color, fontWeight:700, marginBottom:'8px' }}>{l.subject} · {l.grade}</div>
                <div style={{ fontSize:'20px', color:'#333', marginBottom:'6px', lineHeight:1.2 }}>{l.title}</div>
                <div style={{ fontSize:'13px', color:'#888', fontFamily:'sans-serif', marginBottom:'14px' }}>⏱️ {l.duration}</div>
                <div style={{ background:l.color, borderRadius:'14px', padding:'10px', textAlign:'center', color:'#fff', fontSize:'15px' }}>
                  ⭐ Start Lesson · +{l.xp} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LESSON VIEW ───────────────────────────── */}
      {view === 'lesson' && active && (
        <div style={{ maxWidth:'720px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:'28px', padding:'32px', boxShadow:'0 8px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ display:'flex', gap:'12px', alignItems:'center', marginBottom:'24px' }}>
              <span style={{ fontSize:'44px' }}>{active.icon}</span>
              <div>
                <div style={{ fontSize:'11px', color:active.color, fontWeight:700, letterSpacing:'1px', marginBottom:'3px' }}>{active.subject} · {active.grade}</div>
                <div style={{ fontSize:'26px', color:'#333' }}>{active.title}</div>
              </div>
            </div>

            {/* Content blocks */}
            {active.content.map((block, bi) => (
              <div key={bi} style={{ marginBottom:'20px' }}>
                {block.type === 'explain' && (
                  <div style={{ background:active.color+'15', border:`2px solid ${active.color}44`, borderRadius:'16px', padding:'16px 20px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'28px' }}>{block.emoji}</span>
                    <p style={{ fontSize:'18px', color:'#333', lineHeight:1.7, margin:0, fontFamily:'sans-serif' }}>{block.text}</p>
                  </div>
                )}
                {block.type === 'examples' && (
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:active.color, marginBottom:'8px', letterSpacing:'1px' }}>{block.label.toUpperCase()}</div>
                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                      {block.items.map((item,i) => (
                        <span key={i} style={{ background:active.color+'22', border:`2px solid ${active.color}44`, borderRadius:'50px', padding:'6px 16px', fontSize:'15px', color:'#333', fontFamily:'sans-serif' }}>{item}</span>
                      ))}
                    </div>
                  </div>
                )}
                {block.type === 'pairs' && (
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:active.color, marginBottom:'10px' }}>RHYMING PAIRS 🎵</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
                      {block.items.map(([a,b],i) => (
                        <div key={i} style={{ background:'white', border:'2px solid #FFD700', borderRadius:'14px', padding:'10px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                          <span style={{ fontSize:'18px', color:'#FF6B6B' }}>{a}</span>
                          <span style={{ color:'#ccc', margin:'0 8px' }}>↔</span>
                          <span style={{ fontSize:'18px', color:'#00875A' }}>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {block.type === 'table' && (
                  <div>
                    <div style={{ fontSize:'16px', color:active.color, marginBottom:'10px' }}>{block.label}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'6px' }}>
                      {block.rows.map(([a,b,c],i) => (
                        <div key={i} style={{ background:'white', border:'2px solid #00875A33', borderRadius:'12px', padding:'10px 8px', textAlign:'center', boxShadow:'0 2px 6px rgba(0,0,0,0.06)' }}>
                          <span style={{ color:'#555', fontFamily:'sans-serif', fontSize:'14px' }}>{a} × {b} = </span>
                          <span style={{ color:'#00875A', fontFamily:'sans-serif', fontSize:'18px', fontWeight:700 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {block.type === 'visual_fraction' && (
                  <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                    {block.items.map((f,i) => (
                      <div key={i} style={{ background:'white', border:'2px solid #e2e8f0', borderRadius:'16px', padding:'16px', textAlign:'center', flex:1, minWidth:'140px' }}>
                        <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:`conic-gradient(${f.color} ${f.fill*3.6}deg, #e2e8f0 0deg)`, margin:'0 auto 12px', border:'3px solid white', boxShadow:'0 2px 10px rgba(0,0,0,0.1)' }} />
                        <div style={{ fontSize:'15px', color:'#333', fontFamily:'sans-serif' }}>{f.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                {block.type === 'parts_list' && (
                  <div style={{ display:'grid', gap:'10px' }}>
                    {block.items.map((item,i) => (
                      <div key={i} style={{ background:'white', border:'2px solid #10b98133', borderRadius:'14px', padding:'12px 16px', display:'flex', gap:'16px', alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize:'22px', minWidth:'32px' }}>{item.part.split(' ')[0]}</span>
                        <div>
                          <div style={{ fontSize:'16px', color:'#333', marginBottom:'2px' }}>{item.part.slice(2)}</div>
                          <div style={{ fontSize:'13px', color:'#777', fontFamily:'sans-serif', lineHeight:1.5 }}>{item.job}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {block.type === 'planets' && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
                    {block.items.map((p,i) => (
                      <div key={i} style={{ background:'white', border:'2px solid #38bdf833', borderRadius:'16px', padding:'14px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize:'32px', marginBottom:'6px' }}>{p.emoji}</div>
                        <div style={{ fontSize:'14px', color:'#333', fontWeight:700 }}>{p.name}</div>
                        <div style={{ fontSize:'11px', color:'#777', fontFamily:'sans-serif', lineHeight:1.5, marginTop:'4px' }}>{p.fact}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button onClick={startQuiz} style={{ width:'100%', background:'linear-gradient(135deg,#FF6B6B,#FF8E53)', border:'none', borderRadius:'18px', padding:'16px', color:'#fff', fontSize:'20px', fontFamily:FONT, cursor:'pointer', marginTop:'8px', boxShadow:'0 6px 20px rgba(255,107,107,0.4)' }}>
              🎯 Test Your Knowledge — Take the Quiz!
            </button>
          </div>
        </div>
      )}

      {/* ── QUIZ VIEW ─────────────────────────────── */}
      {view === 'quiz' && active && q && (
        <div style={{ maxWidth:'600px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:'28px', padding:'32px', boxShadow:'0 8px 40px rgba(0,0,0,0.12)' }}>
            {/* Progress */}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px' }}>
              {active.quiz.map((_,i) => (
                <div key={i} style={{ flex:1, height:'8px', borderRadius:'4px', background: i<quizIdx?'#00E5A0':i===quizIdx?active.color:'#e2e8f0', margin:'0 3px', transition:'background 0.4s' }} />
              ))}
            </div>
            <div style={{ fontSize:'13px', color:'#888', fontFamily:'sans-serif', marginBottom:'16px' }}>Question {quizIdx+1} of {active.quiz.length}</div>
            <div style={{ fontSize:'22px', color:'#333', marginBottom:'28px', lineHeight:1.4 }}>🤔 {q.q}</div>
            <div style={{ display:'grid', gap:'12px' }}>
              {q.opts.map((opt,i) => {
                const isCorrect = i === q.ans;
                const isPicked  = i === picked;
                const revealed  = picked !== null;
                return (
                  <button key={i} className="opt-btn" disabled={revealed} onClick={() => pickAns(i)} style={{ background: !revealed?'white': isPicked&&isCorrect?'#00E5A0': isPicked?'#FFE0E0': isCorrect?'#E8F5E9':'white', border:`3px solid ${!revealed?'#e2e8f0':isPicked&&isCorrect?'#00E5A0':isPicked?'#FF6B6B':isCorrect?'#00875A':'#e2e8f0'}`, borderRadius:'16px', padding:'14px 20px', fontSize:'16px', color:'#333', fontFamily:FONT, cursor:revealed?'default':'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', transition:'all 0.2s' }}>
                    <span style={{ width:'28px', height:'28px', borderRadius:'50%', background:active.color+'22', border:`2px solid ${active.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, color:active.color, flexShrink:0 }}>{['A','B','C','D'][i]}</span>
                    {opt}
                    {revealed && isCorrect && <span style={{ marginLeft:'auto' }}>✅</span>}
                    {revealed && isPicked && !isCorrect && <span style={{ marginLeft:'auto' }}>❌</span>}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <button onClick={nextQ} style={{ width:'100%', marginTop:'20px', background:'#FF6B6B', border:'none', borderRadius:'14px', padding:'14px', color:'#fff', fontSize:'18px', fontFamily:FONT, cursor:'pointer' }}>
                {quizIdx+1 < active.quiz.length ? 'Next Question →' : '🎉 See My Score!'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── RESULT ────────────────────────────────── */}
      {view === 'result' && active && (
        <div style={{ maxWidth:'520px', margin:'0 auto', padding:'32px 24px', textAlign:'center', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:'28px', padding:'40px 32px', boxShadow:'0 8px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize:'72px', animation:'bounce 1s ease-in-out infinite', display:'inline-block' }}>{score>=2?'🎉':'💪'}</div>
            <div style={{ fontSize:'28px', color:score>=2?'#00875A':'#FF6B6B', margin:'16px 0 8px' }}>{score>=2?'Amazing Work!':'Good Try!'}</div>
            <div style={{ fontSize:'18px', color:'#555', fontFamily:'sans-serif', marginBottom:'24px' }}>You scored <strong style={{ color:'#FF6B6B' }}>{score}</strong> out of <strong>{active.quiz.length}</strong>!</div>
            <div style={{ background:'#FFD700', borderRadius:'16px', padding:'16px', marginBottom:'24px', fontSize:'18px', color:'#7B5800' }}>⭐ +{score>=2?active.xp:Math.round(active.xp/2)} XP Earned!</div>
            <div style={{ display:'flex', gap:'12px', flexDirection:'column' }}>
              <button onClick={() => { setView('lesson'); setStep(0); }} style={{ background:'#FF6B6B', border:'none', borderRadius:'14px', padding:'12px', color:'#fff', fontSize:'16px', fontFamily:FONT, cursor:'pointer' }}>📖 Review Lesson</button>
              <button onClick={() => setView('list')} style={{ background:'white', border:'3px solid #FF6B6B', borderRadius:'14px', padding:'12px', color:'#FF6B6B', fontSize:'16px', fontFamily:FONT, cursor:'pointer' }}>🏰 More Lessons</button>
              <button onClick={() => navigate('/school/sparky-world')} style={{ background:'white', border:'3px solid #888', borderRadius:'14px', padding:'12px', color:'#888', fontSize:'14px', fontFamily:FONT, cursor:'pointer' }}>🌍 Back to World</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
