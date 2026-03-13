import { useState } from 'react';
import API from '../utils/api';

/**
 * CareerTimeMachine — Interactive 24-month career roadmap
 * Props:
 *   milestones: [{ month, action, detail, hours, completed, completedAt }]
 *   studentId: string
 *   successProbability: number (0-100)
 *   onComplete: (month, updatedData) => void
 */

// ── Default milestone template if none provided ────────────────────────────
const DEFAULT_MILESTONES = [
  { month: 1,  action: 'Discover your path', detail: 'Complete career assessment, finalize target role', hours: 10, category: 'explore' },
  { month: 2,  action: 'Learn foundations',   detail: 'Online course — fundamentals of your field', hours: 40, category: 'learn' },
  { month: 3,  action: 'First project',       detail: 'Build a small demo project and share on GitHub', hours: 30, category: 'build' },
  { month: 4,  action: 'Skill up — Core',     detail: 'Deep dive into the #1 skill needed for your career', hours: 60, category: 'learn' },
  { month: 5,  action: 'Join a community',    detail: 'Find mentors, online groups, or local meetups', hours: 10, category: 'network' },
  { month: 6,  action: 'Portfolio project 1', detail: 'Build your first portfolio-worthy project', hours: 80, category: 'build' },
  { month: 7,  action: 'Write & share',       detail: 'Publish a blog post or video explaining what you built', hours: 15, category: 'share' },
  { month: 8,  action: 'Advanced skill',      detail: 'Learn advanced concept in your domain', hours: 60, category: 'learn' },
  { month: 9,  action: 'Internship prep',     detail: 'Resume, LinkedIn, mock interviews', hours: 25, category: 'career' },
  { month: 10, action: 'Apply — Internships', detail: 'Submit 30+ applications, target 3 interviews', hours: 20, category: 'career' },
  { month: 11, action: 'Portfolio project 2', detail: 'More complex project, incorporate feedback', hours: 100, category: 'build' },
  { month: 12, action: '1-Year Review',       detail: 'Audit your progress, update goals, celebrate!', hours: 5, category: 'reflect' },
  { month: 13, action: 'Master domain skill', detail: 'Certification or advanced course completion', hours: 80, category: 'learn' },
  { month: 14, action: 'Contribute OSS',      detail: 'Make first open-source contribution', hours: 30, category: 'build' },
  { month: 15, action: 'Freelance project',   detail: 'Take on a small paid project to build experience', hours: 60, category: 'career' },
  { month: 16, action: 'Competitive prep',    detail: 'Hackathon, competition, or case study challenge', hours: 40, category: 'compete' },
  { month: 17, action: 'Portfolio revamp',    detail: 'Update all projects, add case studies', hours: 20, category: 'share' },
  { month: 18, action: 'Full-time prep',      detail: 'Intensive interview prep — DSA, system design, etc.', hours: 80, category: 'career' },
  { month: 19, action: 'Apply — Full-time',   detail: '50+ applications, target top companies', hours: 30, category: 'career' },
  { month: 20, action: 'Soft skills',         detail: 'Communication, leadership, team dynamics', hours: 20, category: 'grow' },
  { month: 21, action: 'Mentor others',       detail: 'Help juniors, teach what you know', hours: 15, category: 'network' },
  { month: 22, action: 'Final projects',      detail: 'Flagship project showcasing full skills', hours: 120, category: 'build' },
  { month: 23, action: 'Interview season',    detail: 'Final interview rounds, negotiate offers', hours: 30, category: 'career' },
  { month: 24, action: '🎯 TARGET ROLE',      detail: 'Your first professional role in your chosen career', hours: 0, category: 'goal' },
];

const CATEGORY_COLORS = {
  explore: '#38bdf8', learn: '#a78bfa', build: '#10b981', share: '#f59e0b',
  career: '#3b82f6', network: '#ec4899', reflect: '#06b6d4', compete: '#f97316',
  grow: '#84cc16', goal: '#ffd700',
};

const CATEGORY_ICONS = {
  explore: '🔭', learn: '📚', build: '🔨', share: '📣',
  career: '💼', network: '🤝', reflect: '🪞', compete: '🏆',
  grow: '🌱', goal: '🎯',
};

export default function CareerTimeMachine({
  milestones: propMilestones,
  studentId,
  successProbability: initProb = 50,
  onComplete,
}) {
  const milestones = (propMilestones?.length ? propMilestones : DEFAULT_MILESTONES);
  const [completing, setCompleting] = useState(null);
  const [probability, setProbability] = useState(initProb);
  const [confettiMonth, setConfettiMonth] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const completedCount = milestones.filter(m => m.completed).length;
  const totalHours     = milestones.reduce((a, m) => a + (m.hours || 0), 0);
  const doneHours      = milestones.filter(m => m.completed).reduce((a, m) => a + (m.hours || 0), 0);

  const handleComplete = async (month) => {
    setCompleting(month);
    try {
      const { data } = await API.post('/school/milestone/complete', { studentId, monthNumber: month });
      setProbability(data.successProbability || probability + 2);
      setConfettiMonth(month);
      setTimeout(() => setConfettiMonth(null), 2500);
      onComplete?.(month, data);
    } catch {}
    setCompleting(null);
  };

  return (
    <div style={{ fontFamily: "'Space Mono', monospace" }}>
      {/* Header stats */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ color: '#10b981', fontWeight: 700 }}>{completedCount}</span>/{milestones.length} milestones
        </div>
        <div style={{ height: '4px', flex: 1, minWidth: '120px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(completedCount / milestones.length) * 100}%`, background: 'linear-gradient(90deg,#3b82f6,#10b981)', transition: 'width 0.8s ease', borderRadius: '2px' }} />
        </div>
        {/* Success probability gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            fontSize: '11px', color: 'rgba(255,255,255,0.4)',
            letterSpacing: '1px',
          }}>SUCCESS</div>
          <div style={{
            fontSize: '20px', fontWeight: 700,
            color: probability >= 75 ? '#10b981' : probability >= 50 ? '#f59e0b' : '#ef4444',
          }}>{probability}%</div>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
          {doneHours}/{totalHours}h
        </div>
      </div>

      {/* Horizontal scrollable timeline */}
      <div style={{
        overflowX: 'auto', paddingBottom: '16px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent',
      }}>
        <div style={{ display: 'flex', gap: '0', alignItems: 'flex-start', minWidth: `${milestones.length * 100}px`, position: 'relative' }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute', top: '28px', left: '24px', right: '24px', height: '2px',
            background: 'linear-gradient(90deg, #3b82f6, rgba(255,255,255,0.1))',
            zIndex: 0,
          }} />

          {milestones.map((m, i) => {
            const isComplete  = m.completed;
            const isCurrent   = !isComplete && (i === 0 || milestones[i-1].completed);
            const isLocked    = !isComplete && !isCurrent;
            const color       = CATEGORY_COLORS[m.category] || '#38bdf8';
            const isExpanded  = expanded === m.month;
            const isConfetti  = confettiMonth === m.month;

            return (
              <div key={m.month} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                width: '90px', minWidth: '90px', position: 'relative', zIndex: 1,
                cursor: 'pointer',
              }} onClick={() => setExpanded(isExpanded ? null : m.month)}>
                {/* Confetti burst */}
                {isConfetti && (
                  <div style={{ position: 'absolute', top: '-20px', fontSize: '20px', animation: 'tmConfetti 2s ease-out' }}>🎉</div>
                )}
                <style>{`
                  @keyframes tmConfetti { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(2) translateY(-30px)} }
                  @keyframes tmPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
                `}</style>

                {/* Node */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: isComplete ? color
                    : isCurrent ? `${color}22`
                    : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isComplete ? color : isCurrent ? color : 'rgba(255,255,255,0.12)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: 700,
                  color: isComplete ? '#fff' : isCurrent ? color : 'rgba(255,255,255,0.25)',
                  boxShadow: isCurrent ? `0 0 16px ${color}44` : isComplete ? `0 0 8px ${color}66` : 'none',
                  transition: 'all 0.3s',
                  animation: isCurrent ? 'tmPulse 2s ease-in-out infinite' : 'none',
                  marginBottom: '8px',
                }}>
                  {isComplete ? '✓' : CATEGORY_ICONS[m.category] || '○'}
                </div>

                {/* Month label */}
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '4px' }}>M{m.month}</div>

                {/* Action short */}
                <div style={{
                  fontSize: '9px', textAlign: 'center', lineHeight: 1.3,
                  color: isComplete ? color : isCurrent ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
                  width: '80px', wordBreak: 'break-word',
                }}>
                  {m.action}
                </div>

                {/* Expanded detail card */}
                {isExpanded && (
                  <div onClick={e => e.stopPropagation()} style={{
                    position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)',
                    width: '200px', zIndex: 50,
                    background: '#0f172a', border: `1px solid ${color}50`,
                    borderRadius: '12px', padding: '14px', boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color, marginBottom: '6px' }}>
                      Month {m.month} — {m.action}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '10px' }}>
                      {m.detail}
                    </div>
                    {m.hours > 0 && (
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>
                        ⏱️ ~{m.hours}h estimated
                      </div>
                    )}
                    {isCurrent && !isComplete && (
                      <button
                        disabled={completing === m.month}
                        onClick={() => handleComplete(m.month)}
                        style={{
                          width: '100%', padding: '8px', background: `${color}22`,
                          border: `1px solid ${color}`, borderRadius: '8px', color,
                          fontSize: '10px', fontWeight: 700, cursor: 'pointer', letter: '1px',
                        }}
                      >
                        {completing === m.month ? '⏳ ...' : '✓ MARK COMPLETE'}
                      </button>
                    )}
                    {isComplete && (
                      <div style={{ fontSize: '10px', color: '#10b981', textAlign: 'center' }}>
                        ✅ Completed {m.completedAt ? new Date(m.completedAt).toLocaleDateString('en-IN') : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
        {Object.entries(CATEGORY_ICONS).slice(0, 6).map(([cat, icon]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
            <span>{icon}</span><span style={{ color: CATEGORY_COLORS[cat] }}>{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
