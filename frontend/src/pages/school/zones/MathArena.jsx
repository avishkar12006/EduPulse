/**
 * MathArena — Explorer Hub Zone for Class 6-8
 * NCERT Math: Algebra, Geometry, Ratio & Proportion, Statistics
 * Features: Concept + worked examples + step-by-step solver + MCQ quiz
 * Gemini chatbot integrated
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SparkyChat from '../../../components/SparkyChat';
import { useAuth } from '../../../context/AuthContext';

const FONT  = "'Nunito', sans-serif";
const BG    = 'linear-gradient(135deg,#1a0533 0%,#2d1b69 60%,#1a0533 100%)';
const ACCENT= '#c084fc';

const TOPICS = [
  {
    id:'algebra', icon:'🔤', title:'Introduction to Algebra', grade:'Class 6-7', color:'#c084fc',
    concept:`**Algebra** uses letters (called variables) to represent unknown numbers in expressions and equations.

**Key Terms:**
• Variable: A letter representing an unknown value (x, y, n)
• Constant: A fixed number (5, -3, 100)
• Coefficient: Number before the variable (in 3x, the coefficient is 3)
• Expression: A combination of variables, constants, operators (3x + 5)
• Equation: An expression with an "=" sign (3x + 5 = 14)

**Solving One-Variable Equations:**
The goal: isolate the variable on one side.
Use inverse operations (addition ↔ subtraction, multiplication ↔ division).

Example: Solve 2x + 3 = 11
→ Step 1: Subtract 3 from both sides: 2x = 8
→ Step 2: Divide both sides by 2: x = 4 ✅
→ Check: 2(4) + 3 = 11 ✓

**Algebraic Identities (Class 8):**
• (a + b)² = a² + 2ab + b²
• (a - b)² = a² - 2ab + b²
• (a + b)(a - b) = a² - b²`,
    steps:[
      { label:'Identify variable', ex:'In 3x + 7 = 16, variable is x' },
      { label:'Move constants', ex:'3x = 16 - 7 = 9' },
      { label:'Divide by coefficient', ex:'x = 9 ÷ 3 = 3' },
      { label:'Verify', ex:'3(3) + 7 = 16 ✓' },
    ],
    quiz:[
      { q:'Solve: 5x - 3 = 12',          opts:['x = 2','x = 3','x = 4','x = 5'], ans:1, exp:'5x = 15 → x = 3' },
      { q:'Which is NOT a variable?',     opts:['x','y','5','n'], ans:2, exp:'5 is a constant — it has a fixed value.' },
      { q:'Expand: (a + b)²',             opts:['a² + b²','a² + 2ab + b²','2a + 2b','a² - b²'], ans:1, exp:'Standard identity: (a+b)² = a² + 2ab + b².' },
      { q:'Solve: 3y + 6 = 21',          opts:['y = 5','y = 6','y = 7','y = 9'], ans:0, exp:'3y = 15 → y = 5.' },
    ],
  },
  {
    id:'ratio', icon:'⚖️', title:'Ratio & Proportion', grade:'Class 6-7', color:'#f97316',
    concept:`**Ratio** compares two quantities of the same type.
Format: a : b (read as "a is to b") or as a fraction a/b

**Simplifying Ratios:** Divide by the HCF (Highest Common Factor)
Example: 12:18 → HCF = 6 → Simplified = 2:3

**Proportion:** Two ratios are proportional if they're equal.
a:b = c:d is written as a/b = c/d, called a proportion.

**Cross Multiplication (key trick!):**
If a/b = c/d then a × d = b × c

**Finding Unknown in Proportion:**
x/4 = 6/8 → 8x = 24 → x = 3

**Percentage:** A ratio out of 100.
45% = 45/100 = 9/20

**Percentage Formulas:**
• % increase = (increase/original) × 100
• % decrease = (decrease/original) × 100
• Finding % of a number: (P/100) × number

**Unitary Method:** Find value of 1 unit, then multiply.
5 pens cost ₹75. Cost of 8 pens?
1 pen = 75/5 = ₹15 → 8 pens = 15 × 8 = ₹120`,
    steps:[
      { label:'Write as ratio', ex:'15 boys, 10 girls → 15:10' },
      { label:'Find HCF', ex:'HCF(15,10) = 5' },
      { label:'Simplify', ex:'15:10 = 3:2' },
      { label:'Interpret', ex:'For every 3 boys there are 2 girls' },
    ],
    quiz:[
      { q:'Simplify ratio 24:36',                   opts:['4:6','2:3','3:4','6:9'], ans:1, exp:'HCF(24,36) = 12. 24/12 = 2, 36/12 = 3 → 2:3.' },
      { q:'If x/3 = 4/6, find x',                   opts:['1','2','3','4'], ans:1, exp:'Cross multiply: 6x = 12 → x = 2.' },
      { q:'Price rose from ₹200 to ₹250. % increase?', opts:['20%','25%','30%','50%'], ans:1, exp:'(50/200) × 100 = 25%.' },
      { q:'6 kg costs ₹90. Cost of 10 kg?',         opts:['₹135','₹150','₹180','₹120'], ans:1, exp:'1 kg = 90/6 = ₹15. 10 kg = ₹150.' },
    ],
  },
  {
    id:'geometry', icon:'📐', title:'Lines, Angles & Triangles', grade:'Class 6-7', color:'#38bdf8',
    concept:`**Angles:**
• Acute: < 90°
• Right: = 90°  
• Obtuse: 90°–180°
• Straight: = 180°
• Reflex: > 180°

**Key Angle Pairs:**
• Complementary: Two angles summing to 90°
• Supplementary: Two angles summing to 180°
• Vertically Opposite Angles: Equal when two lines intersect

**Parallel Lines with Transversal:**
• Alternate Interior Angles: Equal (Z-angles)
• Co-interior (Same-side) Angles: Sum = 180°
• Corresponding Angles: Equal (F-angles)

**Triangles:**
Properties:
1. Sum of all angles = 180°
2. Exterior angle = Sum of two non-adjacent interior angles

Types (by sides):
• Equilateral: All sides equal, all angles = 60°
• Isosceles: Two sides equal, base angles equal
• Scalene: No equal sides

Types (by angles):
• Acute, Right-angled, Obtuse

**Pythagorean Theorem (Right Triangle):**
a² + b² = c² (c = hypotenuse)
Example: 3² + 4² = 5² → 9 + 16 = 25 ✓`,
    steps:[
      { label:'Identify angle type', ex:'An angle of 65° is acute (< 90°)' },
      { label:'Apply properties', ex:'Angles on straight line: a + b = 180°' },
      { label:'Set up equation', ex:'If one angle = 55°, other = 180° - 55° = 125°' },
      { label:'Use Pythagoras for right triangles', ex:'Legs: 5, 12. Hyp = √(25+144) = 13' },
    ],
    quiz:[
      { q:'Angles on a straight line sum to?',     opts:['90°','180°','270°','360°'], ans:1 , exp:'A straight line = 180°.' },
      { q:'In a triangle, two angles are 60° and 80°. Third angle?', opts:['40°','30°','50°','20°'], ans:0, exp:'180 - 60 - 80 = 40°.' },
      { q:'A right triangle has legs 6 and 8. Hypotenuse?', opts:['10','12','14','9'], ans:0, exp:'√(36+64) = √100 = 10 (classic 3-4-5 scaled!)' },
      { q:'Vertically opposite angles are always?', opts:['Supplementary','Complementary','Equal','Unrelated'], ans:2, exp:'Vertical angles are always equal.' },
    ],
  },
  {
    id:'statistics', icon:'📊', title:'Data & Statistics', grade:'Class 7-8', color:'#10b981',
    concept:`**Statistics** is the science of collecting, organizing, analyzing data.

**Key Measures of Central Tendency:**

**Mean (Average):**
Mean = Sum of all values / Number of values
Example: 4, 6, 8, 10, 12 → Mean = 40/5 = 8

**Median (Middle Value):**
1. Arrange data in ascending order
2. If odd count: middle value
3. If even count: average of two middle values
Example: 3, 5, 7, 9, 11 → Median = 7 (3rd value)
Example: 2, 4, 6, 8 → Median = (4+6)/2 = 5

**Mode (Most Frequent):**
The value that appears most often.
Example: 2, 3, 3, 4, 5, 3 → Mode = 3
(Data can have no mode, one mode, or multiple modes)

**Range:** Difference between max and min values.
Example: Max = 20, Min = 4 → Range = 16

**Types of Graphs:**
• Bar Graph: Comparing categories
• Histogram: Continuous data ranges
• Pie Chart: Showing proportions (% of 360°)
• Line Graph: Changes over time`,
    steps:[
      { label:'Collect and list data', ex:'Scores: 72, 85, 90, 72, 68' },
      { label:'Sort in order', ex:'68, 72, 72, 85, 90' },
      { label:'Find Mean', ex:'(68+72+72+85+90)/5 = 387/5 = 77.4' },
      { label:'Find Median', ex:'Middle value (3rd) = 72' },
      { label:'Find Mode', ex:'72 appears twice → Mode = 72' },
    ],
    quiz:[
      { q:'Mean of 10, 20, 30, 40?', opts:['20','25','30','22'], ans:1, exp:'(10+20+30+40)/4 = 100/4 = 25.' },
      { q:'Median of 3, 5, 7, 9, 11?', opts:['5','7','9','6'], ans:1, exp:'Middle value (3rd): 7.' },
      { q:'Mode of 1, 2, 2, 3, 4, 4, 4, 5?', opts:['2','3','4','1'], ans:2, exp:'4 appears 3 times — most frequent.' },
      { q:'Range of 5, 12, 18, 3, 25?', opts:['20','22','25','15'], ans:1, exp:'Max(25) - Min(3) = 22.' },
    ],
  },
];

export default function MathArena() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView]       = useState('list');
  const [active, setActive]   = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  const [qIdx, setQIdx]       = useState(0);
  const [picked, setPicked]   = useState(null);
  const [score, setScore]     = useState(0);
  const [done, setDone]       = useState({});
  const [wrongCount, setWrongCount] = useState({});

  const openTopic = (t) => { setActive(t); setView('topic'); setShowSteps(false); };
  const startQuiz = () => { setView('quiz'); setQIdx(0); setPicked(null); setScore(0); };
  const pickAns   = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === active.quiz[qIdx].ans) setScore(s=>s+1);
    else {
      const key = active.id;
      setWrongCount(prev => ({...prev, [key]: (prev[key]||0)+1 }));
    }
  };
  const nextQ = () => {
    if (qIdx+1 < active.quiz.length) { setQIdx(q=>q+1); setPicked(null); }
    else { setView('result'); setDone(d=>({...d,[active.id]:true})); }
  };

  const tooManyWrong = active && (wrongCount[active.id]||0) >= 2;
  const q = active?.quiz?.[qIdx];

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, paddingBottom:'80px', color:'#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes stepIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        .topic-card:hover{transform:translateY(-4px) scale(1.02);transition:all 0.2s;}
        .opt-btn:hover:not(:disabled){transform:scale(1.02);}
      `}</style>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(12px)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'14px', borderBottom:'1px solid rgba(192,132,252,0.2)', position:'sticky', top:0, zIndex:50 }}>
        <button onClick={() => view==='list'?navigate('/school/explorer'):setView('list')} style={{ background:'rgba(192,132,252,0.15)', border:'2px solid #c084fc', borderRadius:'50px', padding:'8px 20px', color:'#c084fc', fontSize:'14px', fontFamily:FONT, fontWeight:700, cursor:'pointer' }}>{view==='list'?'← Explorer Hub':'← Topics'}</button>
        <span style={{ fontSize:'26px' }}>📐</span>
        <span style={{ fontSize:'20px', color:'#c084fc', fontWeight:800 }}>Math Arena</span>
        <div style={{ marginLeft:'auto', fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>Class 6-8 • NCERT</div>
      </div>

      {/* Topic List */}
      {view==='list' && (
        <div style={{ maxWidth:'900px', margin:'0 auto', padding:'36px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div style={{ fontSize:'30px', fontWeight:800 }}>📐 Math Arena</div>
            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginTop:'6px' }}>Algebra · Ratio & Proportion · Geometry · Statistics</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px' }}>
            {TOPICS.map(t=>(
              <div key={t.id} className="topic-card" onClick={()=>openTopic(t)} style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(10px)', border:`2px solid ${done[t.id]?'#10b981':t.color+'44'}`, borderRadius:'22px', padding:'24px', cursor:'pointer', boxShadow:`0 4px 20px ${t.color}11` }}>
                {done[t.id] && <span style={{ background:'#10b981', borderRadius:'99px', padding:'2px 10px', fontSize:'10px', fontWeight:700, marginBottom:'10px', display:'inline-block' }}>✅ Mastered</span>}
                <div style={{ fontSize:'42px', marginBottom:'12px' }}>{t.icon}</div>
                <div style={{ display:'flex', gap:'6px', marginBottom:'8px' }}>
                  <span style={{ background:t.color+'22', borderRadius:'99px', padding:'2px 10px', fontSize:'11px', color:t.color, fontWeight:700 }}>{t.grade}</span>
                </div>
                <div style={{ fontSize:'20px', fontWeight:800, marginBottom:'16px' }}>{t.title}</div>
                <div style={{ background:`linear-gradient(135deg,${t.color},${t.color}aa)`, borderRadius:'14px', padding:'10px', textAlign:'center', fontSize:'14px', fontWeight:700 }}>📐 Practice Now</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Detail */}
      {view==='topic' && active && (
        <div style={{ maxWidth:'800px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.04)', border:`2px solid ${active.color}44`, borderRadius:'24px', padding:'32px' }}>
            <div style={{ display:'flex', gap:'14px', alignItems:'center', marginBottom:'24px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'44px' }}>{active.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'12px', color:active.color, fontWeight:700, letterSpacing:'1px' }}>{active.grade}</div>
                <div style={{ fontSize:'24px', fontWeight:800 }}>{active.title}</div>
              </div>
              <button onClick={()=>setShowSteps(!showSteps)} style={{ background:showSteps?active.color:'rgba(255,255,255,0.08)', border:`2px solid ${active.color}`, borderRadius:'50px', padding:'7px 18px', color:showSteps?'#fff':active.color, fontSize:'13px', fontFamily:FONT, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                {showSteps?'📖 Full Notes':'🪜 Step-by-Step'}
              </button>
            </div>

            {/* Concept or Steps */}
            {!showSteps ? (
              <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:'16px', padding:'20px', marginBottom:'20px', lineHeight:1.85, fontSize:'15px', whiteSpace:'pre-line', fontWeight:400 }}>
                {active.concept.split('**').map((part,i)=>i%2===1 ? <strong key={i} style={{color:active.color}}>{part}</strong> : <span key={i}>{part}</span>)}
              </div>
            ) : (
              <div style={{ marginBottom:'20px' }}>
                <div style={{ fontSize:'16px', fontWeight:700, color:active.color, marginBottom:'12px' }}>🪜 Step-by-Step Method</div>
                {active.steps.map((step,i)=>(
                  <div key={i} style={{ display:'flex', gap:'14px', alignItems:'flex-start', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', animation:`stepIn 0.3s ease ${i*0.08}s both` }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:active.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:800, flexShrink:0 }}>{i+1}</div>
                    <div>
                      <div style={{ fontSize:'14px', fontWeight:700, marginBottom:'3px' }}>{step.label}</div>
                      <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', fontFamily:'monospace', background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'6px 10px' }}>{step.ex}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Adaptive hint */}
            {tooManyWrong && (
              <div style={{ background:'rgba(251,191,36,0.1)', border:'2px solid #fbbf2466', borderRadius:'14px', padding:'12px 16px', marginBottom:'16px', display:'flex', gap:'10px', alignItems:'center' }}>
                <span style={{ fontSize:'20px' }}>💡</span>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'#fbbf24' }}>Try the Step-by-Step view</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>Break it down into small steps — it helps!</div>
                </div>
                <button onClick={()=>setShowSteps(true)} style={{ background:'#fbbf24', border:'none', borderRadius:'10px', padding:'5px 14px', fontSize:'12px', fontFamily:FONT, fontWeight:700, cursor:'pointer', color:'#7B5800', marginLeft:'auto' }}>Open</button>
              </div>
            )}

            <button onClick={startQuiz} style={{ width:'100%', background:`linear-gradient(135deg,${active.color},${active.color}aa)`, border:'none', borderRadius:'16px', padding:'16px', fontSize:'18px', fontFamily:FONT, fontWeight:800, cursor:'pointer', color:'#fff', marginTop:'8px' }}>
              🎯 Take Practice Quiz!
            </button>
          </div>
        </div>
      )}

      {/* Quiz */}
      {view==='quiz' && active && q && (
        <div style={{ maxWidth:'620px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.04)', border:`2px solid ${active.color}44`, borderRadius:'24px', padding:'32px' }}>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              {active.quiz.map((_,i)=><div key={i} style={{ flex:1, height:'6px', borderRadius:'3px', background:i<qIdx?'#10b981':i===qIdx?active.color:'rgba(255,255,255,0.1)' }} />)}
            </div>
            <div style={{ fontSize:'20px', fontWeight:700, marginBottom:'24px', lineHeight:1.4 }}>📐 {q.q}</div>
            <div style={{ display:'grid', gap:'10px' }}>
              {q.opts.map((opt,i)=>{
                const isCorrect=i===q.ans, isPicked=i===picked, revealed=picked!==null;
                return (
                  <button key={i} className="opt-btn" disabled={revealed} onClick={()=>pickAns(i)} style={{ background:!revealed?'rgba(255,255,255,0.05)':isCorrect?'rgba(16,185,129,0.2)':isPicked?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.02)', border:`2px solid ${!revealed?'rgba(255,255,255,0.1)':isCorrect?'#10b981':isPicked?'#ef4444':'rgba(255,255,255,0.04)'}`, borderRadius:'14px', padding:'14px 16px', fontSize:'15px', color:'#e2e8f0', fontFamily:FONT, fontWeight:600, cursor:revealed?'default':'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', transition:'all 0.2s' }}>
                    <span style={{ width:'26px', height:'26px', borderRadius:'50%', background:`${active.color}22`, border:`2px solid ${active.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:active.color, flexShrink:0 }}>{['A','B','C','D'][i]}</span>
                    {opt}
                    {revealed&&isCorrect&&<span style={{marginLeft:'auto'}}>✅</span>}
                    {revealed&&isPicked&&!isCorrect&&<span style={{marginLeft:'auto'}}>❌</span>}
                  </button>
                );
              })}
            </div>
            {picked!==null && (
              <div style={{ marginTop:'16px' }}>
                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'12px', fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'12px' }}>
                  💡 <strong style={{color:'#fbbf24'}}>Solution:</strong> {q.exp}
                </div>
                <button onClick={nextQ} style={{ width:'100%', background:active.color, border:'none', borderRadius:'14px', padding:'13px', fontSize:'16px', fontFamily:FONT, fontWeight:800, cursor:'pointer', color:'#fff' }}>
                  {qIdx+1<active.quiz.length?'Next →':'🎉 Results!'}
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
            <div style={{ fontSize:'64px' }}>{score===4?'🏆':score>=3?'🌟':'📐'}</div>
            <div style={{ fontSize:'28px', fontWeight:800, color:active.color, margin:'16px 0 8px' }}>{score===4?'Math Genius!':score>=3?'Great Work!':'Keep Practising!'}</div>
            <div style={{ fontSize:'16px', color:'rgba(255,255,255,0.6)', marginBottom:'24px' }}>Score: <strong style={{color:active.color}}>{score}/4</strong></div>
            <div style={{ display:'flex', gap:'10px', flexDirection:'column' }}>
              <button onClick={()=>setView('list')} style={{ background:`linear-gradient(135deg,${active.color},${active.color}aa)`, border:'none', borderRadius:'14px', padding:'12px', fontSize:'16px', fontFamily:FONT, fontWeight:700, cursor:'pointer', color:'#fff' }}>📐 More Topics</button>
              <button onClick={()=>navigate('/school/explorer')} style={{ background:'rgba(255,255,255,0.06)', border:'2px solid rgba(255,255,255,0.15)', borderRadius:'14px', padding:'12px', fontSize:'13px', fontFamily:FONT, cursor:'pointer', color:'rgba(255,255,255,0.5)' }}>🌌 Explorer Hub</button>
            </div>
          </div>
        </div>
      )}

      <SparkyChat world="6-8" subject="Mathematics (Algebra, Geometry, Statistics, Ratio)" studentName={user?.name?.split(' ')[0]||'Explorer'} />
    </div>
  );
}
