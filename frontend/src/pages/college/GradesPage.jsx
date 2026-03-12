import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_STUDENTS } from '../../data/demoData';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(BarElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const GRADE_COLORS = { 'A+': '#10B981', 'A': '#10B981', 'B+': '#3B82F6', 'B': '#3B82F6', 'C': '#F59E0B', 'D': '#F97316', 'F': '#EF4444' };
const COMPETENCY_COLORS = { mastered: '#10B981', achieved: '#3B82F6', developing: '#F59E0B', notAchieved: '#EF4444' };
const COMPETENCY_LABELS = { mastered: '⭐ Mastered', achieved: '✅ Achieved', developing: '📈 Developing', notAchieved: '❌ Not Achieved' };

function GradeCard({ grade }) {
  const [expanded, setExpanded] = useState(false);
  const gc = GRADE_COLORS[grade.grade] || '#9CA3AF';
  const cc = COMPETENCY_COLORS[grade.competencyLevel] || '#9CA3AF';
  return (
    <div onClick={() => setExpanded(!expanded)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '14px', padding: '18px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: `4px solid ${gc}` }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '15px', color: 'white', marginBottom: '4px' }}>{grade.subject}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>{grade.subjectCode} · Semester {grade.semester}</div>
          <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ height: '100%', width: `${grade.percentage}%`, borderRadius: '99px', background: `linear-gradient(90deg, ${gc}, ${gc}88)`, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: `${cc}20`, color: cc, border: `1px solid ${cc}40`, borderRadius: '99px', padding: '2px 10px', fontSize: '11px', fontWeight: 700 }}>{COMPETENCY_LABELS[grade.competencyLevel]}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', marginLeft: '16px' }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '36px', color: gc, lineHeight: 1 }}>{grade.grade}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{grade.percentage}%</div>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Internal Marks', value: grade.internalMarks },
            { label: 'External Marks', value: grade.externalMarks },
            { label: 'Total', value: `${grade.totalMarks} / ${grade.maxMarks}` }
          ].map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, color: 'white' }}>{item.value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: 600 }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Derive grade letter and competency level from percentage
function gradeFromPct(pct) {
  if (pct >= 90) return { grade: 'A+', competencyLevel: 'mastered' };
  if (pct >= 80) return { grade: 'A',  competencyLevel: 'mastered' };
  if (pct >= 70) return { grade: 'B+', competencyLevel: 'achieved' };
  if (pct >= 60) return { grade: 'B',  competencyLevel: 'achieved' };
  if (pct >= 55) return { grade: 'C',  competencyLevel: 'developing' };
  if (pct >= 48) return { grade: 'D',  competencyLevel: 'developing' };
  return { grade: 'F', competencyLevel: 'notAchieved' };
}

export default function GradesPage() {
  const { user } = useAuth();
  const [selectedSem, setSelectedSem] = useState('all');

  // Load demo data directly
  const student = DEMO_STUDENTS[user?.studentId] || DEMO_STUDENTS['stu_aarav'];
  const semSummary = student.grades?.semesterSummary || [];

  // Transform demoData subjects → grade card objects
  const allGrades = (student.subjects || []).map((s, i) => {
    const { grade, competencyLevel } = gradeFromPct(s.grade);
    return {
      subject: s.name,
      subjectCode: s.code,
      semester: student.semester,
      percentage: s.grade,
      grade,
      competencyLevel,
      internalMarks: Math.round(s.grade * 0.4),
      externalMarks: Math.round(s.grade * 0.6),
      totalMarks: s.grade,
      maxMarks: 100,
    };
  });

  const summary = {
    overall: allGrades.length ? Math.round(allGrades.reduce((a, g) => a + g.percentage, 0) / allGrades.length) : 0,
    semesterSummary: semSummary,
  };

  const semesters = [...new Set(allGrades.map(g => g.semester))].sort();
  const filtered = selectedSem === 'all' ? allGrades : allGrades.filter(g => g.semester === parseInt(selectedSem));
  const best = [...allGrades].sort((a, b) => b.percentage - a.percentage)[0];
  const worst = [...allGrades].sort((a, b) => a.percentage - b.percentage)[0];

  const chartData = {
    labels: (summary?.semesterSummary || []).map(s => `Sem ${s.semester}`),
    datasets: [{
      label: 'Average (%)',
      data: (summary?.semesterSummary || []).map(s => s.average),
      backgroundColor: (summary?.semesterSummary || []).map(s => s.average >= 75 ? 'rgba(16,185,129,0.6)' : s.average >= 60 ? 'rgba(59,130,246,0.6)' : 'rgba(239,68,68,0.6)'),
      borderRadius: 8, borderSkipped: false
    }]
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', fontFamily: "'Nunito', sans-serif" }}>
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/student" style={{ color: '#00BFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← Dashboard</Link>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', color: 'white', margin: 0 }}>📊 My Grades</h1>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Overall Average', value: `${summary?.overall || 0}%`, icon: '📊', color: '#00BFFF' },
                { label: 'Total Subjects', value: allGrades.length, icon: '📚', color: '#8B5CF6' },
                { label: 'Best Subject', value: best?.grade || 'N/A', icon: '⭐', color: '#10B981', sub: best?.subject },
                { label: 'Needs Work', value: worst?.grade || 'N/A', icon: '📈', color: '#F59E0B', sub: worst?.subject }
              ].map((c, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{c.icon}</div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '28px', color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: '4px' }}>{c.label}</div>
                  {c.sub && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{c.sub}</div>}
                </div>
              ))}
            </div>

            {/* Trend chart */}
            {(summary?.semesterSummary?.length || 0) > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', margin: '0 0 20px' }}>Semester Performance Trend</h3>
                <div style={{ height: '200px' }}>
                  <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } }, x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } } } }} />
                </div>
              </div>
            )}

{/* Semester filter */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['all', ...semesters.map(String)].map(s => (
                <button key={s} onClick={() => setSelectedSem(s)}
                  style={{ padding: '8px 18px', borderRadius: '99px', border: 'none', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: selectedSem === s ? '#00BFFF' : 'rgba(255,255,255,0.08)', color: selectedSem === s ? '#0A1628' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }}>
                  {s === 'all' ? 'All Semesters' : `Semester ${s}`}
                </button>
              ))}
            </div>

            {/* Grade cards */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>No grades recorded yet</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filtered.map((g, i) => <GradeCard key={i} grade={g} />)}
              </div>
            )}
        </>
      </div>
    </div>
  );
}
