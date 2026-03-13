import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_STUDENTS } from '../../data/demoData';

const BACKEND = import.meta.env.VITE_API_URL || '';


// ── Milestone timeline row
function MilestoneLine({ milestone }) {
  const done = milestone.completed;
  const diffColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };
  return (
    <div style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: '24px' }}>
      <div style={{ position: 'absolute', left: '19px', top: '40px', bottom: 0, width: '2px', background: done ? '#10B981' : 'rgba(255,255,255,0.1)' }} />
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, zIndex: 1, background: done ? 'linear-gradient(135deg,#10B981,#059669)' : 'rgba(255,255,255,0.08)', border: `2px solid ${done ? '#10B981' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: done ? '0 0 12px rgba(16,185,129,0.4)' : 'none' }}>
        {done ? '✅' : `${milestone.month}m`}
      </div>
      <div style={{ flex: 1, paddingTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: done ? '#6ee7b7' : 'white' }}>{milestone.action}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Skill: {milestone.skill}</div>
          </div>
          <span style={{ background: `${diffColor[milestone.difficulty] || '#888'}20`, color: diffColor[milestone.difficulty] || '#888', border: `1px solid ${diffColor[milestone.difficulty] || '#888'}40`, borderRadius: '99px', padding: '2px 10px', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
            {milestone.difficulty || 'Medium'}
          </span>
        </div>
        {milestone.resource && (
          <div style={{ background: 'rgba(0,191,255,0.07)', border: '1px solid rgba(0,191,255,0.15)', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', color: '#93C5FD' }}>
            📚 {milestone.resource}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fallback career paths from demoData
function buildDemoPaths(student) {
  const isStrong = (student?.academicHealthScore || 60) >= 70;
  const dept = student?.department || 'Computer Science';
  return [
    {
      title: isStrong ? 'Software Engineer @ FAANG' : 'Full-Stack Developer',
      industry: 'Technology', icon: '💻',
      successProbability: isStrong ? 78 : 52,
      salaryRange: isStrong ? '₹18–35 LPA' : '₹8–15 LPA',
      whyThisStudent: `Your ${dept} background is perfect for software development. ${isStrong ? 'Your strong academic score puts FAANG-level roles within reach.' : 'With focused upskilling, industry roles are very achievable.'}`,
      strongAreas: ['Problem Solving', 'Programming', 'Mathematics'],
      gapAreas: ['System Design', 'Cloud Platforms', 'Open Source'],
      growthProjection: 'India tech sector growing 25% p.a. High demand for full-stack and cloud skills.',
      certifications: [
        { name: 'AWS Cloud Practitioner', cost: 'Free tier', link: 'https://aws.amazon.com/certification/' },
        { name: 'Meta React Developer', cost: '₹4,200', link: 'https://www.coursera.org/' },
        { name: 'Google Associate Cloud Engineer', cost: '₹15,000', link: 'https://cloud.google.com/certification' },
      ],
      milestones: [
        { action: 'Complete DSA on LeetCode (150 problems)', skill: 'Problem Solving', difficulty: 'Medium', month: 2, resource: 'NeetCode 150', completed: false },
        { action: 'Build 2 full-stack projects', skill: 'Development', difficulty: 'Medium', month: 4, resource: 'GitHub Student Pack', completed: false },
        { action: 'First internship application', skill: 'Career Readiness', difficulty: 'Easy', month: 6, resource: 'LinkedIn / Internshala', completed: false },
        { action: 'System Design fundamentals', skill: 'Architecture', difficulty: 'Hard', month: 10, resource: 'Grokking System Design', completed: false },
        { action: 'Contribute to open source', skill: 'Collaboration', difficulty: 'Easy', month: 14, resource: 'GitHub Issues', completed: false },
        { action: 'Apply to target companies', skill: 'Job Search', difficulty: 'Medium', month: 18, resource: 'LinkedIn Premium', completed: false },
      ],
    },
    {
      title: 'Data Scientist / ML Engineer',
      industry: 'Artificial Intelligence', icon: '📊',
      successProbability: isStrong ? 71 : 55,
      salaryRange: '₹10–28 LPA',
      whyThisStudent: `Your quantitative aptitude and analytical skills map directly to data science. The AI/ML boom in India creates extraordinary demand for engineers who can build thoughtful models.`,
      strongAreas: ['Mathematics', 'Statistical Thinking', 'Analytical Reasoning'],
      gapAreas: ['Python/Pandas', 'Machine Learning', 'SQL & Databases'],
      growthProjection: 'India has 85,000+ unfilled data science positions. 45% salary premium over traditional IT.',
      certifications: [
        { name: 'IBM Data Science Professional', cost: 'Free (Coursera)', link: 'https://www.coursera.org/professional-certificates/ibm-data-science' },
        { name: 'Google Data Analytics', cost: 'Free', link: 'https://grow.google/certificates/data-analytics/' },
        { name: 'Tableau Desktop Specialist', cost: '₹20,000', link: 'https://www.tableau.com/learn/certification' },
      ],
      milestones: [
        { action: 'Master Python, NumPy and Pandas', skill: 'Python', difficulty: 'Easy', month: 1, resource: 'Kaggle Learn', completed: false },
        { action: 'Complete Andrew Ng ML Specialization', skill: 'Machine Learning', difficulty: 'Medium', month: 3, resource: 'Coursera', completed: false },
        { action: 'Win a Kaggle competition (bronze)', skill: 'Applied ML', difficulty: 'Hard', month: 6, resource: 'Kaggle.com', completed: false },
        { action: 'Build end-to-end ML pipeline project', skill: 'MLOps', difficulty: 'Medium', month: 10, resource: 'MLflow + FastAPI', completed: false },
        { action: 'Apply for Data Analyst / jr. Data Scientist', skill: 'Job Search', difficulty: 'Medium', month: 14, resource: 'LinkedIn, AngelList', completed: false },
        { action: 'Specialize in Deep Learning / LLMs', skill: 'Advanced AI', difficulty: 'Hard', month: 18, resource: 'FastAI / Hugging Face', completed: false },
      ],
    },
    {
      title: 'Product Manager',
      industry: 'Business & Technology', icon: '🚀',
      successProbability: isStrong ? 65 : 48,
      salaryRange: '₹12–40 LPA',
      whyThisStudent: `Your ability to bridge technical understanding with big-picture thinking is exactly what PMs need. The PM role in India's startup ecosystem is among the highest-impact careers.`,
      strongAreas: ['Communication', 'Cross-functional Thinking', 'User Empathy'],
      gapAreas: ['Market Research', 'Agile/Scrum', 'Product Analytics'],
      growthProjection: 'PM roles in India grew 70% in 3 years. Top-tier PMs at unicorns earn ₹50+ LPA.',
      certifications: [
        { name: 'Google Project Management', cost: 'Free', link: 'https://grow.google/certificates/project-management/' },
        { name: 'Product School PM Certificate', cost: '₹45,000', link: 'https://productschool.com' },
        { name: 'CSPO – Certified Scrum Product Owner', cost: '₹30,000', link: 'https://www.scrumalliance.org' },
      ],
      milestones: [
        { action: 'Study PM fundamentals (Lenny\'s Newsletter)', skill: 'Product Thinking', difficulty: 'Easy', month: 1, resource: 'Lenny\'s Podcast + PM School', completed: false },
        { action: 'Build and ship a side project', skill: 'Product Building', difficulty: 'Medium', month: 3, resource: 'No-code tools (Webflow, Bubble)', completed: false },
        { action: 'Intern at a startup as APM', skill: 'Real-world PM', difficulty: 'Hard', month: 6, resource: 'LinkedIn, Internshala', completed: false },
        { action: 'Complete Google PM certification', skill: 'Formal PM Skills', difficulty: 'Medium', month: 9, resource: 'Google Project Management', completed: false },
        { action: 'Create 3 PM portfolio case studies', skill: 'Portfolio', difficulty: 'Medium', month: 12, resource: 'Medium / Notion', completed: false },
        { action: 'Apply to APM programs at tech companies', skill: 'Job Search', difficulty: 'Hard', month: 18, resource: 'LinkedIn, company careers', completed: false },
      ],
    },
  ];
}

export default function CareerPage() {
  const { user } = useAuth();
  const student = DEMO_STUDENTS[user?.studentId] || DEMO_STUDENTS['stu_aarav'];

  const [generating, setGenerating] = useState(false);
  const [selectedPathIdx, setSelectedPathIdx] = useState(0);
  const [markingMilestone, setMarkingMilestone] = useState(null);
  const [generatingMsg, setGeneratingMsg] = useState('');
  const [career, setCareer] = useState({ paths: buildDemoPaths(student) });

  const generateRoadmap = async () => {
    setGenerating(true);
    setGeneratingMsg('🤖 Sending your profile to Gemini AI...');
    try {
      const studentProfile = {
        name: student.name,
        department: student.department,
        semester: student.semester,
        academicHealthScore: student.academicHealthScore,
        attendancePercentage: student.attendancePercentage,
        learningStyle: student.learningStyle || 'flexible',
        cluster: student.cluster,
      };
      const gradesArray = (student.subjects || []).map(s => ({
        subject: s.name,
        subjectCode: s.code || s.name,
        percentage: s.grade,
        semester: student.semester,
      }));

      setGeneratingMsg('✨ Gemini is analyzing your grades and interests...');

      const res = await fetch(`${BACKEND}/api/career/demo-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student: studentProfile, grades: gradesArray, interests: [] }),
      });

      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data = await res.json();

      if (data.paths && data.paths.length >= 2) {
        setCareer({ paths: data.paths });
        setGeneratingMsg('');
      } else {
        throw new Error('Invalid response from Gemini');
      }
    } catch {
      // Graceful fallback to demo paths
      setCareer({ paths: buildDemoPaths(student) });
      setGeneratingMsg('');
    } finally {
      setGenerating(false);
    }
  };

  const markMilestoneComplete = (milestoneIndex) => {
    setMarkingMilestone(milestoneIndex);
    setTimeout(() => {
      const updatedPaths = career.paths.map((p, pi) => {
        if (pi !== selectedPathIdx) return p;
        return {
          ...p,
          milestones: p.milestones.map((m, mi) =>
            mi === milestoneIndex ? { ...m, completed: true, completedAt: new Date() } : m
          ),
        };
      });
      setCareer({ ...career, paths: updatedPaths });
      setMarkingMilestone(null);
    }, 400);
  };

  const activePath = career?.paths?.[selectedPathIdx];

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Nav */}
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/student" style={{ color: '#00BFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← Dashboard</Link>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', margin: 0, color: 'white' }}>🎯 Career Navigator</h1>
          <div style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', color: '#A78BFA', fontWeight: 700 }}>
            Powered by Gemini AI
          </div>
        </div>
        <button onClick={generateRoadmap} disabled={generating}
          style={{ padding: '10px 20px', background: generating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#8B5CF6,#6D28D9)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: generating ? 'not-allowed' : 'pointer', fontFamily: "'Nunito', sans-serif", boxShadow: generating ? 'none' : '0 4px 16px rgba(139,92,246,0.4)', transition: 'all 0.3s', opacity: generating ? 0.7 : 1 }}>
          {generating ? '⏳ Generating...' : '🤖 Regenerate with Gemini'}
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Generating status */}
        {generatingMsg && (
          <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#C4B5FD' }}>
            <div style={{ width: '20px', height: '20px', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: '#8B5CF6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            {generatingMsg}
          </div>
        )}

        {/* Path selector cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {career.paths.map((path, idx) => (
            <div key={idx} onClick={() => setSelectedPathIdx(idx)}
              style={{ background: selectedPathIdx === idx ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)', border: `2px solid ${selectedPathIdx === idx ? '#8B5CF6' : 'rgba(255,255,255,0.08)'}`, borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>{path.icon || '🎯'}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '17px', color: selectedPathIdx === idx ? '#A78BFA' : 'white', marginBottom: '4px', lineHeight: 1.3 }}>{path.title}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '14px' }}>{path.industry}</div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                  <span>Success Probability</span>
                  <span style={{ fontWeight: 800, color: '#A78BFA' }}>{path.successProbability}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${path.successProbability}%`, borderRadius: '99px', background: 'linear-gradient(90deg,#8B5CF6,#6D28D9)', transition: 'width 1s ease' }} />
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#A78BFA', fontWeight: 800 }}>{path.salaryRange}</div>
              {selectedPathIdx === idx && <div style={{ marginTop: '10px', color: '#A78BFA', fontSize: '12px', fontWeight: 700 }}>✓ Active Path</div>}
            </div>
          ))}
        </div>

        {/* Active path detail */}
        {activePath && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
            {/* Left: Why + Milestones */}
            <div>
              {/* Why this student */}
              <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', color: '#A78BFA', margin: '0 0 12px' }}>🧬 Why This Career Fits You</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, margin: 0, fontSize: '15px' }}>{activePath.whyThisStudent}</p>
              </div>

              {/* Milestones */}
              <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', marginBottom: '20px', margin: '0 0 20px' }}>📍 {activePath.milestones?.length || 6}-Step Roadmap</h3>
              <div style={{ position: 'relative' }}>
                {(activePath.milestones || []).map((m, mi) => (
                  <div key={mi} style={{ position: 'relative' }}>
                    <MilestoneLine milestone={m} />
                    {!m.completed && (
                      <button onClick={() => markMilestoneComplete(mi)} disabled={markingMilestone === mi}
                        style={{ position: 'absolute', right: 0, top: '8px', padding: '4px 12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10B981', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
                        {markingMilestone === mi ? '✓' : '✓ Done'} +50 XP
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Quick stats */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '16px', margin: '0 0 16px' }}>📊 Quick Stats</h4>
                {[
                  { label: '✅ Done', value: (activePath.milestones || []).filter(m => m.completed).length },
                  { label: '📍 Remaining', value: (activePath.milestones || []).filter(m => !m.completed).length },
                  { label: '💰 Salary', value: activePath.salaryRange },
                  { label: '🏆 Probability', value: `${activePath.successProbability}%` },
                ].map((s, i, arr) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{s.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#A78BFA' }}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Strong areas */}
              {activePath.strongAreas?.length > 0 && (
                <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '20px' }}>
                  <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '15px', color: '#10B981', margin: '0 0 12px' }}>💪 Strong Areas</h4>
                  {activePath.strongAreas.map((a, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#6ee7b7', marginBottom: '6px' }}>★ {a}</div>
                  ))}
                </div>
              )}

              {/* Gap areas */}
              {activePath.gapAreas?.length > 0 && (
                <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '20px' }}>
                  <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '15px', color: '#F59E0B', margin: '0 0 12px' }}>📈 Gap Areas</h4>
                  {activePath.gapAreas.map((a, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#FDE68A', marginBottom: '6px' }}>→ {a}</div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {activePath.certifications?.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                  <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '15px', margin: '0 0 12px', color: '#FFD700' }}>🎓 Certifications</h4>
                  {activePath.certifications.map((c, i) => (
                    <a key={i} href={c.link} target="_blank" rel="noreferrer"
                      style={{ display: 'block', padding: '10px 12px', background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '10px', marginBottom: '8px', textDecoration: 'none', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,215,0,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,215,0,0.07)'}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFD700' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{c.cost}</div>
                    </a>
                  ))}
                </div>
              )}

              {/* Growth projection */}
              {activePath.growthProjection && (
                <div style={{ background: 'rgba(0,191,255,0.06)', border: '1px solid rgba(0,191,255,0.2)', borderRadius: '16px', padding: '20px' }}>
                  <h4 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '15px', color: '#00BFFF', margin: '0 0 10px' }}>📈 5-Year Outlook</h4>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>{activePath.growthProjection}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
