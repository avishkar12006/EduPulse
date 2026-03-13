/**
 * ProgrammingLab — Career Command Zone for Class 9-12
 * Python programming with adaptive mistake tracking:
 * - Tracks wrong answers per concept using localStorage
 * - If mistakes ≥ 2 on a topic → automatically generates a simpler AI explanation (Gemini)
 * - Includes coding challenges, output prediction, debugging exercises
 * - Gemini chatbot for coding help
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SparkyChat from '../../../../components/SparkyChat';
import { useAuth } from '../../../../context/AuthContext';

const FONT   = "'Space Mono', monospace";
const SFONT  = "'Nunito', sans-serif";
const BG     = 'linear-gradient(135deg,#0a0a0f 0%,#0f1923 60%,#050d1a 100%)';
const ACCENT = '#00ff88';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/* ── Programming Topics (Class 9-12 CBSE/Python) ──────────────────────────── */
const TOPICS = [
  {
    id:'variables', icon:'📦', title:'Variables & Data Types', level:'Foundation', color:'#00ff88',
    concept:`# Variables & Data Types in Python

## What is a Variable?
A variable is a **named container** that stores data in memory.

\`\`\`python
name = "Aryan"      # String (text)
age  = 17           # Integer (whole number)
gpa  = 9.5          # Float (decimal)
isStudent = True    # Boolean (True/False)
\`\`\`

## Data Types
| Type    | Example        | Use Case              |
|---------|----------------|-----------------------|
| int     | 17, -5, 0      | Count, age, scores    |
| float   | 3.14, 9.5      | Measurements, marks   |
| str     | "Hello", 'Hi'  | Text, names           |
| bool    | True, False    | Conditions, flags     |
| list    | [1, 2, 3]      | Multiple items        |
| dict    | {"a": 1}       | Key-value pairs       |

## Type Conversion
\`\`\`python
x = int("42")       # String → Integer: 42
y = str(3.14)       # Float → String: "3.14"
z = float("9.5")    # String → Float: 9.5
\`\`\`

## Rules for Variable Names
✅ Can use letters, digits, underscore
✅ Must start with letter or underscore
❌ Cannot start with a digit
❌ Cannot use keywords (if, for, while, class, etc.)`,
    simple_concept:`Think of a variable like a labeled box! 📦

\`\`\`python
name = "Aryan"    ← You put "Aryan" in a box labeled "name"
age  = 17         ← You put 17 in a box labeled "age"
\`\`\`

**4 types of boxes:**
📝 string = words/text → "Hello"
🔢 int = whole numbers → 42
💧 float = decimal numbers → 3.14
✅ bool = yes/no → True or False

You can always check the type:
\`\`\`python
print(type(name))   # <class 'str'>
print(type(age))    # <class 'int'>
\`\`\``,
    quiz:[
      { q:"What does this print?\nx = 5\ny = '5'\nprint(x + int(y))", opts:['5','55','10','Error'], ans:2, exp:"int('5') converts string '5' to integer 5. Then 5 + 5 = 10." },
      { q:'Which variable name is INVALID?', opts:['my_score','_name','2day','topStudent'], ans:2, exp:"Variable names cannot start with a digit. '2day' is invalid." },
      { q:"What type is: x = 3.14", opts:['int','str','float','bool'], ans:2, exp:'Any number with a decimal point is a float in Python.' },
      { q:"What does bool('') return?", opts:['True','False','Error','None'], ans:1, exp:"Empty string is falsy in Python → bool('') = False." },
    ],
  },
  {
    id:'loops', icon:'🔄', title:'Loops & Iteration', level:'Intermediate', color:'#38bdf8',
    concept:`# Loops in Python

## for Loop
Used when you know how many times to repeat.

\`\`\`python
# Print numbers 1 to 5
for i in range(1, 6):
    print(i)
# Output: 1 2 3 4 5

# Loop through a list
fruits = ["apple", "banana", "mango"]
for fruit in fruits:
    print(fruit)
\`\`\`

## while Loop
Used when you repeat until a condition becomes False.

\`\`\`python
count = 1
while count <= 5:
    print(count)
    count += 1      # IMPORTANT: update the variable!
# Output: 1 2 3 4 5
\`\`\`

## Loop Control Statements
\`\`\`python
for i in range(10):
    if i == 5:
        break       # Stop the loop completely
    if i % 2 == 0:
        continue    # Skip even numbers, go to next iteration
    print(i)
# Output: 1 3
\`\`\`

## Nested Loops (Loop inside loop)
\`\`\`python
for i in range(1, 4):       # Outer loop
    for j in range(1, 4):   # Inner loop
        print(i * j, end=" ")
    print()
# Output: multiplication table!
\`\`\``,
    simple_concept:`A loop is like telling your friend to do something again and again! 🔄

**for loop** = "Do this exactly N times"
\`\`\`python
for i in range(5):      # Do 5 times
    print("Hello!")     # Prints Hello 5 times
\`\`\`

**while loop** = "Keep doing this UNTIL condition is False"
\`\`\`python
water = 10
while water > 0:
    print("Drinking water...")
    water = water - 1
# Stops when water reaches 0
\`\`\`

**Key difference:**
- for: you know the count (5 times, 10 times)
- while: you don't know exact count, just a condition`,
    quiz:[
      { q:"Output of: for i in range(2, 8, 2): print(i)", opts:['2 4 6','2 4 6 8','1 3 5 7','0 2 4 6'], ans:0, exp:'range(2,8,2) = 2, 4, 6 (starts at 2, stops BEFORE 8, step=2).' },
      { q:'What happens if you forget to update the variable in a while loop?', opts:['Loop runs once','SyntaxError','Infinite loop','Loop is skipped'], ans:2, exp:'Without updating the variable, the condition never becomes False → infinite loop!' },
      { q:'Which statement exits a loop immediately?', opts:['continue','pass','stop','break'], ans:3, exp:'break immediately terminates the innermost loop.' },
      { q:"How many times does this run?\nfor i in range(5):\n    if i == 3: break", opts:['5','3','4','2'], ans:2, exp:'i = 0, 1, 2, 3 — loops 4 times, then break at i=3 (the 4th iteration).' },
    ],
  },
  {
    id:'functions', icon:'⚙️', title:'Functions & Scope', level:'Intermediate', color:'#c084fc',
    concept:`# Functions in Python

## Defining and Calling Functions
\`\`\`python
def greet(name):          # Define function
    """Greets a person."""
    message = f"Hello, {name}!"
    return message

result = greet("Aryan")   # Call function
print(result)              # Output: Hello, Aryan!
\`\`\`

## Parameters vs Arguments
\`\`\`python
def add(a, b):    # a, b are PARAMETERS (names in definition)
    return a + b

sum = add(5, 3)   # 5, 3 are ARGUMENTS (actual values passed)
\`\`\`

## Default Parameters
\`\`\`python
def power(base, exp=2):    # exp has default value 2
    return base ** exp

print(power(3))     # 9  (3^2)
print(power(3, 3))  # 27 (3^3)
\`\`\`

## *args and **kwargs
\`\`\`python
def total(*args):           # Accept any number of arguments
    return sum(args)

print(total(1, 2, 3))      # 6
print(total(10, 20, 30, 40)) # 100

def info(**kwargs):          # Accept keyword arguments as dict
    for key, val in kwargs.items():
        print(f"{key}: {val}")

info(name="Dev", age=17)    # name: Dev  age: 17
\`\`\`

## Scope: Local vs Global
\`\`\`python
x = 10          # Global variable

def func():
    x = 20      # Local variable (shadow of global)
    print(x)    # 20

func()
print(x)        # 10 (global unchanged)
\`\`\``,
    simple_concept:`A function is like a RECIPE! 📖
You write it once, use it many times.

\`\`\`python
def make_tea(cups):         # Recipe (function)
    water = cups * 200      # Steps inside
    return f"Made {cups} cups!"

result = make_tea(3)        # Use the recipe!
print(result)               # "Made 3 cups!"
\`\`\`

**Why use functions?**
✅ Write once, reuse anywhere
✅ Makes code organized
✅ Easy to test and fix

**Return** = the function gives you back a value
If no return, it gives you **None**`,
    quiz:[
      { q:"What is the output?\ndef f(x, y=10):\n    return x + y\nprint(f(5))", opts:['5','10','15','Error'], ans:2, exp:'y defaults to 10. f(5) → 5 + 10 = 15.' },
      { q:'What is *args used for?', opts:['Return multiple values','Accept any number of positional args','Handle errors','Create loops'], ans:1, exp:'*args packs all positional arguments into a tuple.' },
      { q:"Scope: What prints?\nx = 5\ndef f():\n    x = 99\nf()\nprint(x)", opts:['99','5','None','Error'], ans:1, exp:'Assigning x inside function creates a LOCAL x. Global x stays 5.' },
      { q:'What does a function return if there is no return statement?', opts:['0','""','None','Error'], ans:2, exp:'Python functions implicitly return None if no return statement.' },
    ],
  },
  {
    id:'dsa', icon:'🗂️', title:'Data Structures: Lists & Dicts', level:'Advanced', color:'#f97316',
    concept:`# Data Structures in Python

## Lists (Ordered, Mutable)
\`\`\`python
marks = [85, 92, 78, 95, 88]

# Indexing (starts at 0)
print(marks[0])       # 85 (first)
print(marks[-1])      # 88 (last)
print(marks[1:3])     # [92, 78] (slice)

# Methods
marks.append(91)      # Add to end
marks.insert(2, 80)   # Add at index 2
marks.remove(78)      # Remove first occurrence of 78
marks.sort()          # Sort ascending
marks.reverse()       # Reverse order
print(len(marks))     # Length
\`\`\`

## Dictionaries (Key-Value, Mutable)
\`\`\`python
student = {
    "name": "Kabir",
    "class": 12,
    "marks": {"Math": 95, "Physics": 88}
}

print(student["name"])          # Kabir
print(student["marks"]["Math"]) # 95

# Operations
student["age"] = 17             # Add new key
student.pop("class")            # Remove key
keys = student.keys()           # All keys
values = student.values()       # All values

# Iterate
for key, value in student.items():
    print(f"{key}: {value}")
\`\`\`

## List Comprehension (Pythonic!)
\`\`\`python
squares = [x**2 for x in range(1, 6)]
# [1, 4, 9, 16, 25]

even_squares = [x**2 for x in range(1, 11) if x%2==0]
# [4, 16, 36, 64, 100]
\`\`\``,
    simple_concept:`Lists = Shopping lists! 🛒
Dicts = Address books! 📒

**List (ordered box of items):**
\`\`\`python
fruits = ["apple", "banana", "mango"]
#          index 0    index 1   index 2

print(fruits[0])         # "apple"
fruits.append("grape")   # Add "grape" to end
\`\`\`

**Dictionary (label → value):**
\`\`\`python
person = {
    "name": "Aryan",   # "name" is the KEY
    "age": 17          # 17 is the VALUE
}
print(person["name"])   # "Aryan"
\`\`\`

Think: List = numbered positions, Dict = named labels.`,
    quiz:[
      { q:"Output of: x = [1,2,3,4,5]\nprint(x[1:4])", opts:['[1,2,3]','[2,3,4]','[1,2,3,4]','[2,3,4,5]'], ans:1, exp:'Slicing x[1:4] gives elements at index 1, 2, 3 — which are 2, 3, 4.' },
      { q:'How to add key "score":100 to dict d = {}?', opts:["d.append('score',100)","d['score'] = 100","d.add('score',100)","d.insert('score',100)"], ans:1, exp:"Dictionary assignment: d['key'] = value." },
      { q:"What is [x**2 for x in range(4)]?", opts:['[0,1,2,3]','[1,4,9,16]','[0,1,4,9]','[1,2,3,4]'], ans:2, exp:'range(4) = 0,1,2,3. Squared: 0,1,4,9.' },
      { q:'Which method removes a key from a dict?', opts:['remove()','delete()','pop()','discard()'], ans:2, exp:'dict.pop(key) removes and returns the value at that key.' },
    ],
  },
];

const LEVEL_COLOR = { Foundation:'#00ff88', Intermediate:'#38bdf8', Advanced:'#f97316' };

export default function ProgrammingLab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView]         = useState('list');
  const [active, setActive]     = useState(null);
  const [qIdx, setQIdx]         = useState(0);
  const [picked, setPicked]     = useState(null);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState({});
  const [simpleMode, setSimple] = useState({});
  const [aiHelp, setAiHelp]     = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [mistakesByTopic, setMistakes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('prog_mistakes') || '{}'); } catch { return {}; }
  });

  const saveMistakes = (m) => { setMistakes(m); localStorage.setItem('prog_mistakes', JSON.stringify(m)); };

  const getMistakeCount = (topicId) => mistakesByTopic[topicId] || 0;
  const needsSimpleMode = (topicId) => getMistakeCount(topicId) >= 2;

  const openTopic = (t) => {
    setActive(t);
    setView('topic');
    setAiHelp('');
    if (needsSimpleMode(t.id)) setSimple(s => ({...s, [t.id]: true}));
  };
  const startQuiz = () => { setView('quiz'); setQIdx(0); setPicked(null); setScore(0); };

  const pickAns = async(i) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === active.quiz[qIdx].ans;
    if (!correct) {
      const newM = {...mistakesByTopic, [active.id]: (mistakesByTopic[active.id]||0)+1};
      saveMistakes(newM);
      const newCount = newM[active.id];
      // Trigger AI simplification after 2 mistakes on same topic
      if (newCount >= 2 && !aiHelp) {
        await generateSimpleHelp(active);
      }
    } else {
      setScore(s=>s+1);
    }
  };

  const generateSimpleHelp = async (topic) => {
    if (!GEMINI_KEY || loadingAI) return;
    setLoadingAI(true);
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model:'gemini-1.5-flash' });
      const prompt = `A Class 11-12 student is struggling with "${topic.title}" in Python programming. 
They have made 2+ mistakes on quiz questions about this topic.
Please provide a super simple, clear re-explanation of "${topic.title}" in Python.
Use very simple language, concrete analogies, and a tiny code example.
Keep it under 150 words. Format beautifully with emojis.`;
      const result = await model.generateContent(prompt);
      setAiHelp(result.response.text());
    } catch (e) {
      setAiHelp('💡 Tip: Review the simple explanation above and try the quiz again!');
    } finally {
      setLoadingAI(false);
    }
  };

  const nextQ = () => {
    if (qIdx+1 < active.quiz.length) { setQIdx(q=>q+1); setPicked(null); }
    else { setView('result'); setDone(d=>({...d,[active.id]:true})); }
  };

  const resetMistakes = (id) => {
    const m = {...mistakesByTopic}; delete m[id];
    saveMistakes(m);
    setSimple(s => ({...s, [id]: false}));
    setAiHelp('');
  };

  const q = active?.quiz?.[qIdx];
  const isSimple = active && simpleMode[active.id];

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, paddingBottom:'80px', color:'#e2e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Nunito:wght@600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanline{0%{top:0%}100%{top:100%}}
        @keyframes glow{0%,100%{text-shadow:0 0 8px #00ff88}50%{text-shadow:0 0 20px #00ff88}}
        .topic-card:hover{border-color:#00ff8844!important;transform:translateY(-3px);transition:all 0.2s;}
        pre{background:rgba(0,255,136,0.06);border:1px solid rgba(0,255,136,0.2);border-radius:10px;padding:16px;overflow-x:auto;font-size:13px;line-height:1.8;white-space:pre-wrap;}
        code{background:rgba(0,255,136,0.08);padding:2px 6px;border-radius:4px;color:#00ff88;}
      `}</style>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(12px)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'14px', borderBottom:'1px solid rgba(0,255,136,0.15)', position:'sticky', top:0, zIndex:50 }}>
        <button onClick={() => view==='list'?navigate('/school/career'):setView('list')} style={{ background:'rgba(0,255,136,0.1)', border:'2px solid #00ff88', borderRadius:'50px', padding:'8px 20px', color:'#00ff88', fontSize:'13px', fontFamily:SFONT, fontWeight:700, cursor:'pointer' }}>{view==='list'?'← Career Command':'← Topics'}</button>
        <span style={{ fontSize:'22px' }}>💻</span>
        <span style={{ fontSize:'18px', color:'#00ff88', fontWeight:700, animation:'glow 2s ease-in-out infinite' }}>PROGRAMMING LAB</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:'10px', alignItems:'center' }}>
          <div style={{ fontSize:'11px', color:'rgba(0,255,136,0.6)', fontFamily:SFONT }}>Adaptive Learning ON</div>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#00ff88', boxShadow:'0 0 8px #00ff88' }} />
        </div>
      </div>

      {/* Topic List */}
      {view==='list' && (
        <div style={{ maxWidth:'900px', margin:'0 auto', padding:'36px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div style={{ fontSize:'26px', fontWeight:700, color:'#00ff88', marginBottom:'8px' }}>{'> PYTHON_PROGRAMMING'}</div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)', fontFamily:SFONT }}>Class 11-12 CBSE • Adaptive Difficulty • Mistake-Based Learning</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'18px' }}>
            {TOPICS.map(t=>{
              const mistakes = getMistakeCount(t.id);
              const needsHelp = mistakes >= 2;
              return (
                <div key={t.id} className="topic-card" onClick={()=>openTopic(t)} style={{ background:'rgba(255,255,255,0.03)', border:`2px solid ${done[t.id]?'#10b981':needsHelp?'#fbbf24':'rgba(0,255,136,0.15)'}`, borderRadius:'18px', padding:'24px', cursor:'pointer' }}>
                  {done[t.id] && <span style={{ background:'#10b981', borderRadius:'99px', padding:'2px 10px', fontSize:'10px', fontWeight:700, fontFamily:SFONT, marginBottom:'10px', display:'inline-block' }}>✅ Mastered</span>}
                  {needsHelp && !done[t.id] && <span style={{ background:'rgba(251,191,36,0.2)', border:'1px solid #fbbf24', borderRadius:'99px', padding:'2px 10px', fontSize:'10px', fontFamily:SFONT, color:'#fbbf24', marginBottom:'10px', display:'inline-block' }}>⚠️ Need Revision ({mistakes} mistakes)</span>}
                  <div style={{ fontSize:'36px', marginBottom:'12px' }}>{t.icon}</div>
                  <div style={{ fontSize:'10px', color:LEVEL_COLOR[t.level], letterSpacing:'2px', marginBottom:'4px', fontFamily:SFONT }}>{t.level.toUpperCase()}</div>
                  <div style={{ fontSize:'18px', fontWeight:700, marginBottom:'8px', color:'#e2e8f0' }}>{t.title}</div>
                  <div style={{ background:`rgba(0,255,136,0.08)`, border:'1px solid rgba(0,255,136,0.2)', borderRadius:'10px', padding:'9px', textAlign:'center', fontSize:'12px', color:'#00ff88', fontFamily:SFONT, fontWeight:700 }}>
                    {needsHelp ? '🤖 Get AI Help' : '> Start Coding'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Topic Detail */}
      {view==='topic' && active && (
        <div style={{ maxWidth:'860px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.02)', border:`2px solid ${active.color}33`, borderRadius:'20px', padding:'32px' }}>
            <div style={{ display:'flex', gap:'12px', alignItems:'center', marginBottom:'24px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'36px' }}>{active.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'10px', color:LEVEL_COLOR[active.level], letterSpacing:'2px', fontFamily:SFONT }}>{active.level.toUpperCase()}</div>
                <div style={{ fontSize:'22px', fontWeight:700, color:'#e2e8f0' }}>{active.title}</div>
              </div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <button onClick={()=>setSimple(s=>({...s,[active.id]:!isSimple}))} style={{ background:isSimple?active.color:'rgba(255,255,255,0.06)', border:`2px solid ${active.color}`, borderRadius:'50px', padding:'6px 16px', color:isSimple?'#000':active.color, fontSize:'12px', fontFamily:SFONT, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                  {isSimple?'🔬 Full Mode':'💡 Simple Mode'}
                </button>
                {getMistakeCount(active.id)>0 && (
                  <button onClick={()=>resetMistakes(active.id)} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'50px', padding:'5px 12px', color:'rgba(255,255,255,0.4)', fontSize:'11px', fontFamily:SFONT, cursor:'pointer' }}>Reset ×</button>
                )}
              </div>
            </div>

            {/* AI Adaptive Help Panel */}
            {(loadingAI || aiHelp) && (
              <div style={{ background:'rgba(0,255,136,0.06)', border:'2px solid rgba(0,255,136,0.3)', borderRadius:'14px', padding:'16px', marginBottom:'20px' }}>
                <div style={{ fontSize:'13px', color:'#00ff88', fontWeight:700, fontFamily:SFONT, marginBottom:'8px' }}>🤖 AI Adaptive Re-explanation (Generated just for you)</div>
                {loadingAI ? (
                  <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                    {[0,1,2].map(i=><div key={i} style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#00ff88', animation:`fadeUp 0.6s ease-in-out ${i*0.2}s infinite` }} />)}
                    <span style={{ fontSize:'12px', color:'rgba(0,255,136,0.6)', fontFamily:SFONT, marginLeft:'8px' }}>Generating simplified explanation...</span>
                  </div>
                ) : (
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.8)', lineHeight:1.8, whiteSpace:'pre-line', fontFamily:SFONT }}>{aiHelp}</div>
                )}
              </div>
            )}

            {/* Content */}
            <div style={{ lineHeight:1.8, fontSize:'14px', whiteSpace:'pre-wrap', fontFamily:SFONT, color:'rgba(255,255,255,0.8)' }}>
              {(isSimple ? active.simple_concept : active.concept)}
            </div>

            <button onClick={startQuiz} style={{ width:'100%', marginTop:'24px', background:`linear-gradient(135deg,${active.color},${active.color}bb)`, border:'none', borderRadius:'14px', padding:'14px', fontSize:'16px', fontFamily:SFONT, fontWeight:800, cursor:'pointer', color:'#000' }}>
              &gt; Run Quiz Test
            </button>
          </div>
        </div>
      )}

      {/* Quiz */}
      {view==='quiz' && active && q && (
        <div style={{ maxWidth:'680px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.02)', border:`2px solid ${active.color}33`, borderRadius:'20px', padding:'32px' }}>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              {active.quiz.map((_,i)=><div key={i} style={{ flex:1, height:'4px', borderRadius:'2px', background:i<qIdx?'#00ff88':i===qIdx?active.color:'rgba(255,255,255,0.08)' }} />)}
            </div>
            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', fontFamily:SFONT, marginBottom:'14px' }}>Question {qIdx+1} / {active.quiz.length}</div>
            <pre style={{ marginBottom:'20px' }}>{q.q}</pre>

            {/* AI help panel if triggered */}
            {aiHelp && !loadingAI && (
              <div style={{ background:'rgba(0,255,136,0.06)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'12px', padding:'12px 14px', marginBottom:'16px', fontSize:'12px', color:'rgba(0,255,136,0.8)', fontFamily:SFONT, lineHeight:1.7 }}>
                🤖 <strong>AI tip:</strong> {aiHelp.slice(0,200)}...
              </div>
            )}

            <div style={{ display:'grid', gap:'10px' }}>
              {q.opts.map((opt,i)=>{
                const isCorrect=i===q.ans, isPicked=i===picked, revealed=picked!==null;
                return (
                  <button key={i} disabled={revealed} onClick={()=>pickAns(i)} style={{ background:!revealed?'rgba(255,255,255,0.04)':isCorrect?'rgba(0,255,136,0.15)':isPicked?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.02)', border:`2px solid ${!revealed?'rgba(255,255,255,0.08)':isCorrect?'#00ff88':isPicked?'#ef4444':'rgba(255,255,255,0.04)'}`, borderRadius:'12px', padding:'12px 16px', fontSize:'13px', color:!revealed?'#e2e8f0':isCorrect?'#00ff88':isPicked?'#ef4444':'rgba(255,255,255,0.3)', fontFamily:'monospace', cursor:revealed?'default':'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'10px', transition:'all 0.2s' }}>
                    <span style={{ color:active.color, fontSize:'11px', fontWeight:700, minWidth:'20px' }}>{['A','B','C','D'][i]}</span>
                    {opt}
                    {revealed&&isCorrect&&<span style={{marginLeft:'auto'}}>✅</span>}
                    {revealed&&isPicked&&!isCorrect&&<span style={{marginLeft:'auto'}}>❌</span>}
                  </button>
                );
              })}
            </div>
            {picked!==null && (
              <div style={{ marginTop:'14px' }}>
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'12px', fontFamily:SFONT }}>
                  💡 {q.exp}
                </div>
                {loadingAI && <div style={{ fontSize:'12px', color:'#00ff88', fontFamily:SFONT, marginBottom:'10px' }}>🤖 AI generating simpler explanation...</div>}
                <button onClick={nextQ} style={{ width:'100%', background:active.color, border:'none', borderRadius:'12px', padding:'12px', fontSize:'14px', fontFamily:SFONT, fontWeight:800, cursor:'pointer', color:'#000' }}>
                  {qIdx+1<active.quiz.length?'> Next':'> See Results'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {view==='result' && active && (
        <div style={{ maxWidth:'480px', margin:'0 auto', padding:'32px 24px', textAlign:'center', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.02)', border:`2px solid ${active.color}44`, borderRadius:'20px', padding:'40px 32px' }}>
            <div style={{ fontSize:'56px', marginBottom:'16px' }}>{score===4?'🏆':score>=3?'⚡':'🔄'}</div>
            <div style={{ fontSize:'22px', fontWeight:700, color:score>=3?'#00ff88':'#fbbf24', marginBottom:'8px', fontFamily:SFONT }}>
              {score===4?'Perfect! Code Ninja!':score>=3?'Great Work!':'More Practice Needed'}
            </div>
            <div style={{ fontSize:'15px', color:'rgba(255,255,255,0.5)', marginBottom:'20px', fontFamily:SFONT }}>Score: <strong style={{color:active.color}}>{score}/4</strong></div>
            {score<3 && <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', fontFamily:SFONT, marginBottom:'20px' }}>
              🤖 AI will generate a simpler explanation next time you open this topic.
            </div>}
            <div style={{ display:'flex', gap:'10px', flexDirection:'column' }}>
              <button onClick={()=>{setView('topic')}} style={{ background:active.color, border:'none', borderRadius:'12px', padding:'12px', fontSize:'14px', fontFamily:SFONT, fontWeight:700, cursor:'pointer', color:'#000' }}>{'> Review Topic'}</button>
              <button onClick={()=>setView('list')} style={{ background:'transparent', border:`2px solid ${active.color}44`, borderRadius:'12px', padding:'12px', fontSize:'13px', fontFamily:SFONT, cursor:'pointer', color:active.color }}>{'> More Topics'}</button>
            </div>
          </div>
        </div>
      )}

      <SparkyChat world="9-12" subject="Python Programming & Computer Science" studentName={user?.name?.split(' ')[0]||'Coder'} />
    </div>
  );
}
