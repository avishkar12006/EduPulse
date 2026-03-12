import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_STUDENTS } from '../../data/demoData';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function MilestoneLine({ milestone, index }) {
  const isCompleted = milestone.completed;
  const diffColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };
  return (
    <div style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: '24px' }}>
      {/* Vertical line */}
      <div style={{ position: 'absolute', left: '19px', top: '40px', bottom: 0, width: '2px', background: isCompleted ? '#10B981' : 'rgba(255,255,255,0.1)', zIndex: 0 }} />
      {/* Circle */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, zIndex: 1,
        background: isCompleted ? 'linear-gradient(135deg,#10B981,#059669)' : 'rgba(255,255,255,0.08)',
        border: `2px solid ${isCompleted ? '#10B981' : 'rgba(255,255,255,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
        boxShadow: isCompleted ? '0 0 12px rgba(16,185,129,0.4)' : 'none'
      }}>
        {isCompleted ? '✅' : `${milestone.month}m`}
      </div>
      {/* Content */}
      <div style={{ flex: 1, paddingTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: isCompleted ? '#6ee7b7' : 'white' }}>{milestone.action}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Skill: {milestone.skill}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ background: `${diffColor[milestone.difficulty]}20`, color: diffColor[milestone.difficulty], border: `1px solid ${diffColor[milestone.difficulty]}40`, borderRadius: '99px', padding: '2px 10px', fontSize: '12px', fontWeight: 700 }}>{milestone.difficulty}</span>
            {milestone.month && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600 }}>Month {milestone.month}</span>}
          </div>
        </div>
        {milestone.resource && (
          <div style={{ background: 'rgba(0,191,255,0.08)', border: '1px solid rgba(0,191,255,0.15)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#93C5FD' }}>
            📚 Resource: {milestone.resource}
          </div>
        )}
        {isCompleted && milestone.completedAt && (
          <div style={{ fontSize: '11px', color: '#10B981', marginTop: '6px', fontWeight: 600 }}>
            ✓ Completed {new Date(milestone.completedAt).toLocaleDateString('en-IN')}
          </div>
        )}
      </div>
    </div>
  );
}

// Build demo career paths from student data
function buildDemoPaths(student) {
  const isStrong = student.academicHealthScore >= 70;
  const dept = student.department || 'Computer Science';
  return [
    {
      title: isStrong ? 'Software Engineer @ FAANG' : 'Full-Stack Developer',
      industry: 'Technology',
      icon: '💻',
      successProbability: isStrong ? 78 : 52,
      salaryRange: isStrong ? '₹18–35 LPA' : '₹8–15 LPA',
      whyThisStudent: `Based on your ${dept} background, software development leverages your core strengths. ${isStrong ? 'Your strong GPA puts FAANG-level roles within reach.' : 'With focused skill-building, industry roles are very achievable.'}`,
      strongAreas: student.subjects.filter(s => s.grade >= 60).map(s => s.name),
      gapAreas: student.subjects.filter(s => s.grade < 60).map(s => `Improve ${s.name} (currently ${s.grade}%)`),
      certifications: [
        { name: 'AWS Cloud Practitioner', cost: 'Free tier available', link: 'https://aws.amazon.com/certification/' },
        { name: 'Meta React Developer', cost: '₹4,200', link: 'https://www.coursera.org/' },
      ],
      growthProjection: 'Software sector in India projected to grow 25% YoY through 2026. High demand for full-stack and cloud skills.',
      milestones: [
        { action: 'Complete DSA course on LeetCode', skill: 'Problem Solving', difficulty: 'Medium', month: 2, resource: 'NeetCode 150', completed: false },
        { action: 'Build 2 portfolio projects on GitHub', skill: 'Software Development', difficulty: 'Medium', month: 4, resource: 'GitHub Student Pack', completed: false },
        { action: 'Attempt first internship application', skill: 'Career Readiness', difficulty: 'Easy', month: 6, resource: 'LinkedIn Jobs', completed: false },
        { action: 'Complete System Design course', skill: 'Architecture', difficulty: 'Hard', month: 10, resource: 'Grokking System Design', completed: false },
      ],
    },
    {
      title: 'Data Scientist / ML Engineer',
      industry: 'Artificial Intelligence',
      icon: '🤖',
      successProbability: isStrong ? 65 : 40,
      salaryRange: '₹12–28 LPA',
      whyThisStudent: `AI/ML is one of the fastest growing fields. Your ${dept} foundation gives you the mathematical basis to excel.`,
      strongAreas: ['Mathematics', 'Analytical Thinking', 'Statistics'],
      gapAreas: ['Python proficiency', 'ML frameworks (PyTorch/TensorFlow)'],
      certifications: [
        { name: 'Google ML Crash Course', cost: 'Free', link: 'https://developers.google.com/machine-learning/crash-course' },
        { name: 'DeepLearning.AI Specialization', cost: '₹3,500/month', link: 'https://www.coursera.org/specializations/deep-learning' },
      ],
      growthProjection: 'India AI market expected to reach $7.8B by 2025. ML engineers among top 5 most in-demand roles.',
      milestones: [
        { action: 'Learn Python & NumPy/Pandas', skill: 'Programming', difficulty: 'Easy', month: 1, resource: 'Kaggle Learn', completed: false },
        { action: 'Complete Kaggle competition (Bronze+)', skill: 'ML Practice', difficulty: 'Medium', month: 5, resource: 'Kaggle.com', completed: false },
        { action: 'Build end-to-end ML project', skill: 'ML Engineering', difficulty: 'Hard', month: 8, resource: 'Fast.ai', completed: false },
      ],
    },
    {
      title: 'Product Manager / EdTech Founder',
      industry: 'Product & Entrepreneurship',
      icon: '🚀',
      successProbability: isStrong ? 55 : 58,
      salaryRange: '₹10–25 LPA (or equity)',
      whyThisStudent: `Your broad academic exposure makes you well-suited for product thinking. EdTech is a ₹360B opportunity in India.`,
      strongAreas: ['Communication', 'Cross-domain knowledge', 'Problem identification'],
      gapAreas: ['User research skills', 'Basic SQL/analytics', 'Product roadmap tools'],
      certifications: [
        { name: 'Google Product Management', cost: 'Free', link: 'https://grow.google/certificates/' },
        { name: 'Stanford Startup Engineering', cost: 'Free audit', link: 'https://www.coursera.org/' },
      ],
      growthProjection: 'India startup ecosystem added 25 unicorns in 2024. Product roles are critical entry points for future founders.',
      milestones: [
        { action: 'Complete Product Management fundamentals', skill: 'Product Thinking', difficulty: 'Easy', month: 2, resource: 'Reforge / Lenny Newsletter', completed: false },
        { action: 'Build and launch a micro-product (app/tool)', skill: 'Execution', difficulty: 'Medium', month: 6, resource: 'No-code tools (Webflow, Bubble)', completed: false },
        { action: 'Intern at a startup as PM intern', skill: 'Industry Exposure', difficulty: 'Medium', month: 9, resource: 'Internshala / AngelList', completed: false },
      ],
    },
  ];
}

export default function CareerPage() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [selectedPathIdx, setSelectedPathIdx] = useState(0);
  const [markingMilestone, setMarkingMilestone] = useState(null);

  // Load demo data directly
  const student = DEMO_STUDENTS[user?.studentId] || DEMO_STUDENTS['stu_priya'];
  const [career, setCareer] = useState({ paths: buildDemoPaths(student) });

  useEffect(() => { setCareer({ paths: buildDemoPaths(student) }); }, [user?.studentId]);

  const generateRoadmap = async () => {
    setGenerating(true);
    try {
      const { data } = await API.post('/api/career/generate', { studentId: user.studentId });
      setCareer(data);
    } catch {
      // Demo fallback: regenerate from local data
      setCareer({ paths: buildDemoPaths(student) });
    } finally { setGenerating(false); }
  };

  const selectPath = (idx) => setSelectedPathIdx(idx);

  const markMilestoneComplete = (milestoneIndex) => {
    setMarkingMilestone(milestoneIndex);
    setTimeout(() => {
      const updatedPaths = career.paths.map((p, pi) => {
        if (pi !== selectedPathIdx) return p;
        return { ...p, milestones: p.milestones.map((m, mi) => mi === milestoneIndex ? { ...m, completed: true, completedAt: new Date() } : m) };
      });
      setCareer({ ...career, paths: updatedPaths });
      setMarkingMilestone(null);
    }, 400);
  };

  const activePath = career?.paths?.[selectedPathIdx];

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', fontFamily: "'Nunito', sans-serif" }}>
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/student" style={{ color: '#00BFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← Dashboard</Link>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', margin: 0 }}>🎯 Career Navigator</h1>
        </div>
        <button onClick={generateRoadmap} disabled={generating}
          style={{ padding: '10px 20px', background: generating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#8B5CF6,#6D28D9)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: generating ? 'not-allowed' : 'pointer', fontFamily: "'Nunito', sans-serif", boxShadow: generating ? 'none' : '0 4px 16px rgba(139,92,246,0.4)' }}>
          {generating ? '⏳ Generating...' : '🤖 Generate New Paths'}
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {!career || !career.paths?.length ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <div style={{ fontSize: '80px', marginBottom: '24px', animation: 'float 3s ease-in-out infinite' }}>🚀</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '32px', margin: '0 0 16px' }}>Discover Your Future</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', maxWidth: '400px', margin: '0 auto 32px', lineHeight: 1.7 }}>Gemini AI will analyze your grades and interests to generate 3 personalized career roadmaps with 24-month milestones.</p>
            <button onClick={generateRoadmap} disabled={generating}
              style={{ padding: '16px 32px', background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 800, fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 30px rgba(139,92,246,0.4)', fontFamily: "'Nunito', sans-serif" }}>
              {generating ? '⏳ Generating with Gemini...' : '🤖 Generate My 3 Career Paths'}
            </button>
          </div>
        ) : (
          <>
            {/* Path selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {career.paths.map((path, idx) => (
                <div key={idx} onClick={() => selectPath(idx)}
                  style={{ background: selectedPathIdx === idx ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)', border: `2px solid ${selectedPathIdx === idx ? '#8B5CF6' : 'rgba(255,255,255,0.08)'}`, borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>{path.icon}</div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', color: selectedPathIdx === idx ? '#A78BFA' : 'white', marginBottom: '6px' }}>{path.title}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>{path.industry}</div>
                  {/* Probability bar */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                      <span>Success Probability</span>
                      <span style={{ fontWeight: 700, color: '#A78BFA' }}>{path.successProbability}%</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${path.successProbability}%`, borderRadius: '99px', background: 'linear-gradient(90deg,#8B5CF6,#6D28D9)' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#A78BFA', fontWeight: 700 }}>{path.salaryRange}</div>
                  {selectedPathIdx === idx && <div style={{ marginTop: '10px', color: '#A78BFA', fontSize: '13px', fontWeight: 700 }}>✓ Selected Path</div>}
                </div>
              ))}
            </div>

            {/* Active path detail */}
            {activePath && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
                {/* Left: Milestones + Why */}
                <div>
                  {/* Why this student */}
                  <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', color: '#A78BFA', margin: '0 0 12px' }}>🧬 Why This Career Fits You</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, margin: 0 }}>{activePath.whyThisStudent}</p>
                  </div>

                  {/* Milestones — vertical timeline */}
                  <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', marginBottom: '20px' }}>📍 24-Month Roadmap</h3>
                  <div style={{ position: 'relative' }}>
                    {(activePath.milestones || []).map((m, mi) => (
                      <div key={mi} style={{ position: 'relative' }}>
                        <MilestoneLine milestone={m} index={mi} />
                        {!m.completed && (
                          <button onClick={() => markMilestoneComplete(mi)} disabled={markingMilestone === mi}
                            style={{ position: 'absolute', right: 0, top: '8px', padding: '4px 12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10B981', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
                            {markingMilestone === mi ? '...' : '✓ Mark Done'} +50 XP
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Stats + Certs + Growth */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Quick stats */}
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                    <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '16px', margin: '0 0 16px' }}>📊 Quick Stats</h4>
                    {[
                      { label: '✅ Milestones Done', value: (activePath.milestones || []).filter(m => m.completed).length },
                      { label: '📍 Remaining', value: (activePath.milestones || []).filter(m => !m.completed).length },
                      { label: '💰 Salary Range', value: activePath.salaryRange }
                    ].map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#A78BFA' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Strong areas */}
                  {activePath.strongAreas?.length > 0 && (
                    <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '20px' }}>
                      <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '15px', color: '#10B981', margin: '0 0 12px' }}>💪 Your Strong Areas</h4>
                      {activePath.strongAreas.map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px', color: '#6ee7b7' }}>
                          <span>★</span>{a}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Gap areas */}
                  {activePath.gapAreas?.length > 0 && (
                    <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '20px' }}>
                      <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '15px', color: '#F59E0B', margin: '0 0 12px' }}>📈 Gap Areas to Fill</h4>
                      {activePath.gapAreas.map((a, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px', color: '#FDE68A' }}>
                          <span>→</span>{a}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Certifications */}
                  {activePath.certifications?.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                      <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '15px', margin: '0 0 12px', color: '#FFD700' }}>🎓 Recommended Certifications</h4>
                      {activePath.certifications.map((c, i) => (
                        <a key={i} href={c.link} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '10px 12px', background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '10px', marginBottom: '8px', textDecoration: 'none', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,215,0,0.15)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,215,0,0.07)'; }}>
                          <div style={{ fontWeight: 700, color: '#FDE68A', fontSize: '13px' }}>{c.name}</div>
                          <div style={{ color: '#FFD700', fontSize: '12px', marginTop: '2px' }}>{c.cost} →</div>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Growth quote */}
                  {activePath.growthProjection && (
                    <div style={{ background: 'rgba(0,191,255,0.06)', border: '1px solid rgba(0,191,255,0.2)', borderRadius: '16px', padding: '20px' }}>
                      <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '15px', color: '#00BFFF', margin: '0 0 10px' }}>📈 Industry Outlook</h4>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{activePath.growthProjection}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
