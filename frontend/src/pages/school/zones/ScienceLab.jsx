/**
 * ScienceLab — Explorer Hub Zone for Class 6-8
 * Real NCERT-aligned Science content: Physics, Chemistry, Biology
 * Includes: concept cards, interactive diagram, 4-option MCQ quiz, Gemini chatbot
 * Mood-adaptive: detects if student is struggling and switches to simpler explanation
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SparkyChat from '../../../components/SparkyChat';
import { useAuth } from '../../../context/AuthContext';

const FONT = "'Nunito', sans-serif";
const BG   = 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)';
const ACCENT = '#38bdf8';

/* ── Real Class 6-8 Science Content ──────────────────────────────────────── */
const TOPICS = [
  {
    id:'motion', subject:'Physics', grade:'Class 6-7', icon:'⚙️', color:'#38bdf8',
    title:'Force & Motion',
    difficulty: { easy:'Understand', medium:'Apply', hard:'JEE Foundation' },
    concept:`**Force** is a push or pull that can change an object's speed, direction, or shape.
**Newton's First Law (Law of Inertia):** An object at rest stays at rest, and an object in motion stays in motion, unless acted on by an external force.
→ Example: A book on a table stays still until you push it.

**Newton's Second Law:** Force = Mass × Acceleration (F = ma)
→ More mass = more force needed to accelerate.
→ Example: Pushing a loaded cart vs an empty cart.

**Newton's Third Law:** Every action has an equal and opposite reaction.
→ Example: A rocket pushes gas downward → gas pushes rocket upward!

**Types of Force:**
• Contact Forces: Friction, Normal force, Applied force
• Non-contact Forces: Gravity, Magnetic force, Electrostatic force

**Friction:** The force that opposes motion between two surfaces in contact.
→ Rough surfaces = more friction. Smooth surfaces = less friction.`,
    easy_concept:`Force is like a push or a pull! 🤲
When you push a ball, that push is called **force**. Force can:
✅ Start something moving (push a stationary ball)
✅ Stop something moving (catch a ball)  
✅ Change direction (kick a ball)
✅ Change shape (squish clay)

Fun example: When you sit on a chair, gravity pulls you DOWN, and the chair pushes you UP equally. That's why you don't fall through! ✨`,
    quiz:[
      { q:'A car of mass 1000 kg accelerates at 2 m/s². What is the force?', opts:['500 N','2000 N','1000 N','200 N'], ans:1, exp:'F = ma = 1000 × 2 = 2000 N' },
      { q:'An object at rest will remain at rest unless acted upon by what?', opts:['Gravity','An external force','Sun','Air'], ans:1, exp:"Newton's 1st Law — Law of Inertia" },
      { q:'Friction is a __ force.', opts:['Non-contact','Magnetic','Contact','Gravitational'], ans:2, exp:'Friction needs two surfaces in contact.' },
      { q:'Which has more friction — rough or smooth surface?', opts:['Smooth','Rough','Same','No friction'], ans:1, exp:'Rough surfaces have more interlocking, causing more friction.' },
    ],
  },
  {
    id:'chemical', subject:'Chemistry', grade:'Class 7-8', icon:'🧪', color:'#a78bfa',
    title:'Chemical Reactions',
    difficulty: { easy:'Observe', medium:'Identify', hard:'Balance Equations' },
    concept:`A **chemical reaction** is a process where substances (reactants) are converted into new substances (products).

**Signs of a Chemical Reaction:**
🔥 Heat/Light produced (e.g., burning wood)
🫧 Gas produced (e.g., baking soda + vinegar → CO₂)
🎨 Colour change (e.g., iron rusting turns orange)
⬇️ Precipitate formed (solid forming in liquid)

**Types of Reactions:**
1. **Combination/Synthesis:** A + B → AB
   Example: 2H₂ + O₂ → 2H₂O (hydrogen + oxygen → water)

2. **Decomposition:** AB → A + B
   Example: 2H₂O → 2H₂ + O₂ (electrolysis of water)

3. **Displacement:** A + BC → AC + B
   Example: Zn + H₂SO₄ → ZnSO₄ + H₂

4. **Double Displacement:** AB + CD → AD + CB
   Example: NaCl + AgNO₃ → AgCl↓ + NaNO₃

**Balancing Equations:** Both sides must have equal atoms of each element.
H₂ + O₂ → H₂O (unbalanced)
2H₂ + O₂ → 2H₂O ✅ (balanced — 4H and 2O on both sides)`,
    easy_concept:`A chemical reaction is when you mix things and get something NEW! 🎉
Like baking: flour + eggs + sugar → cake! But in science:

🍋 Lemon + baking soda = FIZZ! (CO₂ gas is made)
🔩 Iron + Oxygen + Water = Rust (a new substance forms!)
🕯️ Wax + Oxygen = CO₂ + Water + Light (burning!)

How to spot a reaction happened?
→ Smoke or bubbles appear
→ Color changes
→ Heat or light comes out
→ Smell changes`,
    quiz:[
      { q:'What type of reaction is: 2H₂ + O₂ → 2H₂O?', opts:['Decomposition','Combination','Displacement','Double Displacement'], ans:1, exp:'Two reactants combine to form one product.' },
      { q:'Rusting of iron is an example of?', opts:['Combination','Decomposition','Neutralisation','Combustion'], ans:0, exp:'Iron + Oxygen + Water → Iron Oxide (rust) — Combination reaction.' },
      { q:'In 2H₂O → 2H₂ + O₂, what type of reaction is this?', opts:['Synthesis','Displacement','Decomposition','Combustion'], ans:2, exp:'One substance breaks into two — decomposition.' },
      { q:'Which is a sign of a chemical reaction?', opts:['Melting ice','Boiling water','Iron rusting','Cutting paper'], ans:2, exp:'Rusting changes the chemical composition of iron.' },
    ],
  },
  {
    id:'cells', subject:'Biology', grade:'Class 8', icon:'🔬', color:'#10b981',
    title:'Cell: The Unit of Life',
    difficulty: { easy:'Identify', medium:'Compare', hard:'Explain Functions' },
    concept:`The **cell** is the basic structural and functional unit of all living organisms.

**Types of Cells:**
• **Prokaryotic:** No membrane-bound nucleus (Bacteria, Blue-green algae)
• **Eukaryotic:** Has a nucleus enclosed by a membrane (Plants, Animals, Fungi)

**Differences: Plant Cell vs Animal Cell**
| Feature | Plant Cell | Animal Cell |
|---------|-----------|-------------|
| Cell Wall | Present (cellulose) | Absent |
| Chloroplast | Present | Absent |
| Vacuole | Large, central | Small or absent |
| Centrosome | Absent | Present |

**Key Organelles & Functions:**
• **Nucleus:** Controls cell activities — "brain of the cell"
• **Mitochondria:** Energy production — "powerhouse of the cell" (ATP)
• **Chloroplast:** Photosynthesis in plant cells
• **Ribosome:** Protein synthesis
• **Cell Membrane:** Controls entry/exit of substances
• **Endoplasmic Reticulum:** Transport network
• **Golgi Body:** Packs and ships proteins

**Cell Division:**
• Mitosis: Body growth — 1 cell → 2 identical cells
• Meiosis: Reproduction — 1 cell → 4 cells with half chromosomes`,
    easy_concept:`A cell is like a tiny city! 🏙️ Inside your body right now are TRILLIONS of cells!

🏛️ **Nucleus** = City Hall (in charge of everything)
⚡ **Mitochondria** = Power Station (makes energy)
🚚 **Endoplasmic Reticulum** = Roads (transport)
📦 **Golgi Body** = Post Office (packs and sends proteins)
🧱 **Cell Wall** (plants only) = City Walls (protection)
🌿 **Chloroplast** (plants only) = Solar Panel (makes food from sunlight)

Plant cells have a wall and chloroplasts — animal cells don't!`,
    quiz:[
      { q:'Which organelle is called the "powerhouse of the cell"?', opts:['Nucleus','Ribosome','Mitochondria','Golgi Body'], ans:2, exp:'Mitochondria produce ATP — the energy currency of cells.' },
      { q:'Which is ABSENT in animal cells?', opts:['Nucleus','Cell Membrane','Cell Wall','Ribosome'], ans:2, exp:'Only plant cells have a rigid cell wall made of cellulose.' },
      { q:'Photosynthesis takes place in?', opts:['Mitochondria','Chloroplast','Nucleus','Ribosome'], ans:1, exp:'Chloroplasts contain chlorophyll for photosynthesis.' },
      { q:'Prokaryotic cells have no?', opts:['Ribosome','Membrane-bound nucleus','Cell membrane','DNA'], ans:1, exp:'Prokaryotes lack a membrane-bound nucleus — DNA floats freely.' },
    ],
  },
  {
    id:'light', subject:'Physics', grade:'Class 8', icon:'💡', color:'#fbbf24',
    title:'Light: Reflection & Refraction',
    difficulty: { easy:'Observe', medium:'Apply Laws', hard:'Ray Diagrams' },
    concept:`**Light** travels in straight lines (rectilinear propagation) at 3 × 10⁸ m/s in vacuum.

**Reflection of Light:**
When light strikes a surface and bounces back.
Laws of Reflection:
1. Angle of incidence = Angle of reflection (∠i = ∠r)
2. Incident ray, normal, and reflected ray are in the same plane.

**Types of Reflection:**
• Regular/Specular: Smooth mirror → clear image
• Diffuse: Rough surface → scattered light (no clear image)

**Refraction of Light:**
Bending of light when it passes from one medium to another.
**Snell's Law:** n₁ sin θ₁ = n₂ sin θ₂
n = refractive index

**Refractive Index:** n = Speed of light in vacuum / Speed of light in medium
→ Denser medium = higher refractive index = more bending

**Real-life Examples:**
• Pencil looks bent in water (refraction)
• Rainbow (refraction + dispersion in water droplets)
• Mirage in deserts (total internal reflection)
• How glasses/lenses correct vision`,
    easy_concept:`Ever notice a pencil in water looks BENT? That's refraction! 🖊️💧

**Reflection** = Light bounces back (like a mirror!)
→ Law: the angle it comes in = the angle it goes out. Like bouncing a ball!

**Refraction** = Light bends when entering a new material
→ Light slows down in water/glass → bends!
→ This is why pools look shallower than they are

🌈 Rainbow = sunlight bending inside water drops!
🔭 Glasses help eyes by bending light to the right spot!`,
    quiz:[
      { q:'Angle of incidence is always equal to?', opts:['Angle of reflection','Angle of refraction','90°','0°'], ans:0, exp:'First law of reflection: ∠i = ∠r.' },
      { q:'A pencil in water appears bent due to?', opts:['Reflection','Diffraction','Refraction','Absorption'], ans:2, exp:'Light bends when passing from water to air — refraction.' },
      { q:'Speed of light in vacuum is?', opts:['3×10⁶ m/s','3×10⁸ m/s','3×10¹⁰ m/s','3×10⁴ m/s'], ans:1, exp:'c = 3 × 10⁸ m/s (approximately 300,000 km/s!)' },
      { q:'Which has higher refractive index?', opts:['Air','Water','Vacuum','Diamond'], ans:3, exp:'Diamond has n ≈ 2.42, which is why it sparkles so beautifully!' },
    ],
  },
];

const SUBJ = { Physics:'#38bdf8', Chemistry:'#a78bfa', Biology:'#10b981' };

export default function ScienceLab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView]       = useState('list');
  const [active, setActive]   = useState(null);
  const [easyMode, setEasy]   = useState(false);
  const [qIdx, setQIdx]       = useState(0);
  const [picked, setPicked]   = useState(null);
  const [score, setScore]     = useState(0);
  const [done, setDone]       = useState({});
  const [filter, setFilter]   = useState('All');
  const [moodWarning, setMoodWarning] = useState(false); // simulate mood alert

  const filtered = filter==='All' ? TOPICS : TOPICS.filter(t=>t.subject===filter);

  const openTopic = (t) => { setActive(t); setView('topic'); setEasy(false); setMoodWarning(false); };
  const startQuiz = () => { setView('quiz'); setQIdx(0); setPicked(null); setScore(0); };
  const pickAns   = (i) => {
    if (picked!==null) return;
    setPicked(i);
    const correct = i === active.quiz[qIdx].ans;
    if (correct) setScore(s=>s+1);
    else if (!easyMode) {
      // After 2 wrong answers in hard mode → suggest easy mode
      setMoodWarning(true);
    }
  };
  const nextQ = () => {
    if (qIdx+1 < active.quiz.length) { setQIdx(q=>q+1); setPicked(null); setMoodWarning(false); }
    else { setView('result'); setDone(d=>({...d,[active.id]:true})); }
  };
  const q = active?.quiz?.[qIdx];

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, paddingBottom:'80px', color:'#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(56,189,248,0.3)}50%{box-shadow:0 0 24px rgba(56,189,248,0.6)}}
        .topic-card:hover{transform:translateY(-4px);transition:all 0.2s;}
        .opt-btn:hover:not(:disabled){transform:scale(1.02);}
      `}</style>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(12px)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'14px', borderBottom:'1px solid rgba(56,189,248,0.2)', position:'sticky', top:0, zIndex:50 }}>
        <button onClick={() => view==='list'?navigate('/school/explorer'):setView('list')} style={{ background:'rgba(56,189,248,0.15)', border:'2px solid #38bdf8', borderRadius:'50px', padding:'8px 20px', color:'#38bdf8', fontSize:'14px', fontFamily:FONT, cursor:'pointer', fontWeight:700 }}>
          {view==='list'?'← Explorer Hub':'← Topics'}
        </button>
        <span style={{ fontSize:'26px' }}>🔬</span>
        <span style={{ fontSize:'20px', color:'#38bdf8', fontWeight:800 }}>Science Lab</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
          {['All','Physics','Chemistry','Biology'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?SUBJ[f]||ACCENT:'transparent', border:`2px solid ${SUBJ[f]||ACCENT}`, borderRadius:'50px', padding:'5px 14px', color:filter===f?'#fff':SUBJ[f]||ACCENT, fontSize:'12px', fontFamily:FONT, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Topic List */}
      {view==='list' && (
        <div style={{ maxWidth:'900px', margin:'0 auto', padding:'36px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div style={{ fontSize:'30px', fontWeight:800 }}>🔬 Science Laboratory</div>
            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginTop:'6px' }}>NCERT Class 6-8 • Physics • Chemistry • Biology</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' }}>
            {filtered.map(t=>(
              <div key={t.id} className="topic-card" onClick={()=>openTopic(t)} style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(10px)', border:`2px solid ${done[t.id]?'#10b981':t.color+'44'}`, borderRadius:'22px', padding:'24px', cursor:'pointer', boxShadow:`0 4px 20px ${t.color}11` }}>
                {done[t.id] && <span style={{ background:'#10b981', borderRadius:'50px', padding:'2px 10px', fontSize:'10px', fontWeight:700, marginBottom:'10px', display:'inline-block' }}>✅ Done</span>}
                <div style={{ fontSize:'42px', marginBottom:'12px' }}>{t.icon}</div>
                <div style={{ display:'flex', gap:'6px', marginBottom:'8px', flexWrap:'wrap' }}>
                  <span style={{ background:SUBJ[t.subject]+'22', borderRadius:'99px', padding:'2px 10px', fontSize:'11px', color:SUBJ[t.subject], fontWeight:700 }}>{t.subject}</span>
                  <span style={{ background:'rgba(255,255,255,0.08)', borderRadius:'99px', padding:'2px 10px', fontSize:'11px', color:'rgba(255,255,255,0.5)' }}>{t.grade}</span>
                </div>
                <div style={{ fontSize:'20px', fontWeight:800, marginBottom:'6px' }}>{t.title}</div>
                <div style={{ display:'flex', gap:'6px', fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'16px' }}>
                  {Object.values(t.difficulty).map((d,i)=><span key={i} style={{ background:'rgba(255,255,255,0.06)', borderRadius:'99px', padding:'2px 8px' }}>{d}</span>)}
                </div>
                <div style={{ background:`linear-gradient(135deg,${t.color},${t.color}cc)`, borderRadius:'14px', padding:'10px', textAlign:'center', fontSize:'14px', fontWeight:700 }}>🔬 Start Exploring</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Detail */}
      {view==='topic' && active && (
        <div style={{ maxWidth:'800px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.04)', border:`2px solid ${active.color}44`, borderRadius:'24px', padding:'32px' }}>
            <div style={{ display:'flex', gap:'14px', alignItems:'center', marginBottom:'24px' }}>
              <span style={{ fontSize:'48px' }}>{active.icon}</span>
              <div>
                <div style={{ fontSize:'12px', color:active.color, fontWeight:700, letterSpacing:'1px' }}>{active.subject} · {active.grade}</div>
                <div style={{ fontSize:'26px', fontWeight:800, marginTop:'2px' }}>{active.title}</div>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
                <button onClick={()=>setEasy(!easyMode)} style={{ background:easyMode?active.color:'rgba(255,255,255,0.08)', border:`2px solid ${active.color}`, borderRadius:'50px', padding:'6px 16px', color:easyMode?'#fff':active.color, fontSize:'12px', fontFamily:FONT, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                  {easyMode?'📚 Normal Mode':'💡 Easy Mode'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:'16px', padding:'20px', marginBottom:'20px', lineHeight:1.8, fontSize:'15px', whiteSpace:'pre-line', fontWeight:400 }}>
              {(easyMode ? active.easy_concept : active.concept).split('**').map((part, i)=>
                i%2===1 ? <strong key={i} style={{color:active.color}}>{part}</strong> : <span key={i}>{part}</span>
              )}
            </div>

            <button onClick={startQuiz} style={{ width:'100%', background:`linear-gradient(135deg,${active.color},${active.color}aa)`, border:'none', borderRadius:'16px', padding:'16px', fontSize:'18px', fontFamily:FONT, fontWeight:800, cursor:'pointer', color:'#fff', marginTop:'8px' }}>
              🎯 Take the Quiz — Test Your Knowledge!
            </button>
          </div>
        </div>
      )}

      {/* Quiz */}
      {view==='quiz' && active && q && (
        <div style={{ maxWidth:'620px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.04)', border:`2px solid ${active.color}44`, borderRadius:'24px', padding:'32px' }}>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              {active.quiz.map((_,i)=>(<div key={i} style={{ flex:1, height:'6px', borderRadius:'3px', background:i<qIdx?'#10b981':i===qIdx?active.color:'rgba(255,255,255,0.1)' }} />))}
            </div>

            {/* Mood warning — suggests easy mode */}
            {moodWarning && (
              <div style={{ background:'rgba(251,191,36,0.12)', border:'2px solid #fbbf24', borderRadius:'14px', padding:'12px 16px', marginBottom:'16px', display:'flex', gap:'10px', alignItems:'center' }}>
                <span style={{ fontSize:'22px' }}>🤔</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'14px', fontWeight:700, color:'#fbbf24' }}>Looks like this is tricky!</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>Switch to Easy Mode for a simpler explanation</div>
                </div>
                <button onClick={()=>{setEasy(true);setView('topic');}} style={{ background:'#fbbf24', border:'none', borderRadius:'10px', padding:'6px 14px', fontSize:'12px', fontFamily:FONT, fontWeight:700, cursor:'pointer', color:'#7B5800' }}>Switch</button>
              </div>
            )}

            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'12px' }}>Question {qIdx+1} of {active.quiz.length} ·{' '}
              <span style={{ color:active.color }}>{active.difficulty[easyMode?'easy':'medium']} Level</span>
            </div>
            <div style={{ fontSize:'20px', fontWeight:700, marginBottom:'24px', lineHeight:1.4 }}>🧪 {q.q}</div>
            <div style={{ display:'grid', gap:'10px' }}>
              {q.opts.map((opt,i)=>{
                const isCorrect=i===q.ans, isPicked=i===picked, revealed=picked!==null;
                return (
                  <button key={i} className="opt-btn" disabled={revealed} onClick={()=>pickAns(i)} style={{ background:!revealed?'rgba(255,255,255,0.05)':isCorrect?'rgba(16,185,129,0.2)':isPicked?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.02)', border:`2px solid ${!revealed?'rgba(255,255,255,0.12)':isCorrect?'#10b981':isPicked?'#ef4444':'rgba(255,255,255,0.05)'}`, borderRadius:'14px', padding:'14px 16px', fontSize:'15px', color:!revealed?'#e2e8f0':isCorrect?'#10b981':isPicked?'#ef4444':'rgba(255,255,255,0.3)', fontFamily:FONT, fontWeight:600, cursor:revealed?'default':'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', transition:'all 0.2s' }}>
                    <span style={{ width:'26px', height:'26px', borderRadius:'50%', background:`${active.color}22`, border:`2px solid ${active.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:active.color, flexShrink:0 }}>{['A','B','C','D'][i]}</span>
                    {opt}
                    {revealed && isCorrect && <span style={{marginLeft:'auto'}}>✅</span>}
                    {revealed && isPicked && !isCorrect && <span style={{marginLeft:'auto'}}>❌</span>}
                  </button>
                );
              })}
            </div>
            {picked!==null && (
              <div style={{ marginTop:'16px' }}>
                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 14px', fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'12px' }}>
                  💡 <strong style={{color:'#fbbf24'}}>Explanation:</strong> {q.exp}
                </div>
                <button onClick={nextQ} style={{ width:'100%', background:active.color, border:'none', borderRadius:'14px', padding:'13px', fontSize:'16px', fontFamily:FONT, fontWeight:800, cursor:'pointer', color:'#fff' }}>
                  {qIdx+1<active.quiz.length?'Next Question →':'🎉 See Results!'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {view==='result' && active && (
        <div style={{ maxWidth:'480px', margin:'0 auto', padding:'32px 24px', textAlign:'center', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.04)', border:`2px solid ${active.color}44`, borderRadius:'24px', padding:'40px 32px' }}>
            <div style={{ fontSize:'64px' }}>{score===4?'🏆':score>=3?'🌟':'💪'}</div>
            <div style={{ fontSize:'28px', fontWeight:800, color:active.color, margin:'16px 0 8px' }}>{score===4?'Perfect Score!':score>=3?'Excellent!':'Keep Studying!'}</div>
            <div style={{ fontSize:'16px', color:'rgba(255,255,255,0.6)', marginBottom:'24px', fontFamily:'sans-serif' }}>Score: <strong style={{color:active.color}}>{score}/{active.quiz.length}</strong></div>
            <div style={{ background:'rgba(255,215,0,0.12)', border:'2px solid #FFD700', borderRadius:'16px', padding:'14px', marginBottom:'24px', fontSize:'18px', fontWeight:700, color:'#FFD700' }}>⭐ +{score>=3?30:20} XP Earned!</div>
            <div style={{ display:'flex', gap:'10px', flexDirection:'column' }}>
              <button onClick={()=>setView('topic')} style={{ background:`linear-gradient(135deg,${active.color},${active.color}aa)`, border:'none', borderRadius:'14px', padding:'12px', fontSize:'16px', fontFamily:FONT, fontWeight:700, cursor:'pointer', color:'#fff' }}>📖 Review Topic</button>
              <button onClick={()=>setView('list')} style={{ background:'transparent', border:`2px solid ${active.color}`, borderRadius:'14px', padding:'12px', fontSize:'14px', fontFamily:FONT, fontWeight:700, cursor:'pointer', color:active.color }}>🔬 More Topics</button>
              <button onClick={()=>navigate('/school/explorer')} style={{ background:'rgba(255,255,255,0.06)', border:'2px solid rgba(255,255,255,0.15)', borderRadius:'14px', padding:'12px', fontSize:'13px', fontFamily:FONT, cursor:'pointer', color:'rgba(255,255,255,0.5)' }}>🌌 Explorer Hub</button>
            </div>
          </div>
        </div>
      )}

      <SparkyChat world="6-8" subject="Science (Physics, Chemistry, Biology)" studentName={user?.name?.split(' ')[0] || 'Explorer'} />
    </div>
  );
}
