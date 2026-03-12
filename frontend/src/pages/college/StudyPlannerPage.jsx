import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SUBJECTS = ['Database Systems', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Design & Analysis of Algorithms'];
const HOURS = [1, 2, 3, 4, 5, 6];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIPS = [
  { icon: '⏱️', tip: 'Use the Pomodoro technique: 25 min focus + 5 min break' },
  { icon: '📖', tip: 'Spend 70% time practising problems, 30% reading theory' },
  { icon: '🌙', tip: 'Study complex topics when you\'re most alert (morning for most)' },
  { icon: '🔁', tip: 'Revise yesterday\'s notes for 10 mins before new topic' },
  { icon: '💤', tip: '7-8 hours sleep improves memory retention by 40%' }
];

const DEFAULT_PLAN = DAYS.map(day => ({
  day,
  tasks: day === 'Sun' ? [] : [
    { subject: SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)], hours: HOURS[Math.floor(Math.random() * 3)], done: false }
  ]
}));

export default function StudyPlannerPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [showAddTask, setShowAddTask] = useState(null);
  const [newSubject, setNewSubject] = useState(SUBJECTS[0]);
  const [newHours, setNewHours] = useState(1);
  const [tipIdx, setTipIdx] = useState(0);

  const toggleTask = (dayIdx, taskIdx) => {
    const next = plan.map((d, di) => di !== dayIdx ? d : {
      ...d, tasks: d.tasks.map((t, ti) => ti !== taskIdx ? t : { ...t, done: !t.done })
    });
    setPlan(next);
  };

  const addTask = (dayIdx) => {
    const next = plan.map((d, di) => di !== dayIdx ? d : {
      ...d, tasks: [...d.tasks, { subject: newSubject, hours: newHours, done: false }]
    });
    setPlan(next);
    setShowAddTask(null);
  };

  const removeTask = (dayIdx, taskIdx) => {
    const next = plan.map((d, di) => di !== dayIdx ? d : {
      ...d, tasks: d.tasks.filter((_, ti) => ti !== taskIdx)
    });
    setPlan(next);
  };

  const totalHours = plan.reduce((sum, d) => sum + d.tasks.reduce((s, t) => s + t.hours, 0), 0);
  const doneHours = plan.reduce((sum, d) => sum + d.tasks.filter(t => t.done).reduce((s, t) => s + t.hours, 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', fontFamily: "'Nunito', sans-serif" }}>
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/student" style={{ color: '#00BFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← Dashboard</Link>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', margin: 0 }}>📚 Study Planner</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: '#FFD700' }}>{doneHours}/{totalHours} hrs done</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>this week</div>
          </div>
          <div style={{ width: '100px', height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${totalHours > 0 ? (doneHours / totalHours) * 100 : 0}%`, borderRadius: '99px', background: 'linear-gradient(90deg,#10B981,#059669)', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: '24px' }}>
        {/* ── Weekly grid ─────────────────────────── */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
            {plan.map((dayPlan, di) => {
              const dayDone = dayPlan.tasks.filter(t => t.done).length;
              const dayTotal = dayPlan.tasks.length;
              const today = new Date().toLocaleDateString('en', { weekday: 'short' }).slice(0, 3);
              const isToday = dayPlan.day === today;
              return (
                <div key={di} style={{
                  background: isToday ? 'rgba(0,191,255,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isToday ? 'rgba(0,191,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '16px', padding: '16px', minHeight: '200px',
                  position: 'relative'
                }}>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', color: isToday ? '#00BFFF' : 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>{dayPlan.day}</div>
                  {dayTotal > 0 && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>{dayDone}/{dayTotal} done</div>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    {dayPlan.tasks.map((task, ti) => (
                      <div key={ti} style={{
                        background: task.done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${task.done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '10px', padding: '8px 10px', position: 'relative'
                      }}>
                        <button onClick={() => removeTask(di, ti)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '12px', lineHeight: 1 }}>×</button>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: task.done ? '#6ee7b7' : 'rgba(255,255,255,0.8)', textDecoration: task.done ? 'line-through' : 'none', marginBottom: '4px', paddingRight: '16px' }}>{task.subject}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{task.hours}h</div>
                        <button onClick={() => toggleTask(di, ti)} style={{
                          width: '100%', marginTop: '6px', padding: '4px', background: task.done ? 'rgba(16,185,129,0.2)' : 'rgba(0,191,255,0.1)', border: `1px solid ${task.done ? 'rgba(16,185,129,0.3)' : 'rgba(0,191,255,0.2)'}`, borderRadius: '6px', color: task.done ? '#10B981' : '#00BFFF', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif"
                        }}>
                          {task.done ? '✅ Done!' : '○ Mark Done'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add task button */}
                  {showAddTask === di ? (
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px' }}>
                      <select value={newSubject} onChange={e => setNewSubject(e.target.value)}
                        style={{ width: '100%', marginBottom: '6px', padding: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px', fontFamily: "'Nunito', sans-serif" }}>
                        {SUBJECTS.map(s => <option key={s} value={s} style={{ background: '#0A1628' }}>{s}</option>)}
                      </select>
                      <select value={newHours} onChange={e => setNewHours(Number(e.target.value))}
                        style={{ width: '100%', marginBottom: '8px', padding: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'white', fontSize: '11px', fontFamily: "'Nunito', sans-serif" }}>
                        {HOURS.map(h => <option key={h} value={h} style={{ background: '#0A1628' }}>{h}h</option>)}
                      </select>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => addTask(di)} style={{ flex: 1, padding: '5px', background: '#10B981', border: 'none', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>Add</button>
                        <button onClick={() => setShowAddTask(null)} style={{ padding: '5px 8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '11px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddTask(di)} style={{ width: '100%', padding: '8px', background: 'rgba(0,191,255,0.08)', border: '1px dashed rgba(0,191,255,0.3)', borderRadius: '10px', color: '#00BFFF', fontSize: '13px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>+ Add Task</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Sidebar: Tips ────────────────────────── */}
        <div>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', color: '#FFD700', margin: '0 0 16px' }}>🧠 Study Tips</h3>
            {TIPS.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px', borderRadius: '10px', marginBottom: '8px', background: i === tipIdx ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '20px' }}>{t.icon}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{t.tip}</span>
              </div>
            ))}
          </div>

          {/* Pomodoro counter */}
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🍅</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', color: '#fca5a5' }}>Pomodoro Timer</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Use browser focus timer to track 25-min study sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
