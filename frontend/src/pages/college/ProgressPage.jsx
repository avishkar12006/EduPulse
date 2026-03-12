import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { Line, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, CategoryScale, LinearScale, Tooltip, Legend);

export default function ProgressPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sRes, gRes] = await Promise.all([
        API.get(`/api/students/${user.studentId}`),
        API.get(`/api/grades/${user.studentId}/summary`)
      ]);
      setStudent(sRes.data);
      setGrades(gRes.data?.semesterSummary || []);
    } catch {}
    finally { setLoading(false); }
  };

  const academicDNA = student?.academicDNA || {};
  const dnaLabels = ['Academics', 'Attendance', 'Engagement', 'Consistency', 'Social', 'Resilience', 'Career Clarity', 'Wellbeing'];
  const dnaValues = [
    academicDNA.academics || student?.academicHealthScore || 50,
    academicDNA.attendance || student?.attendancePercentage || 70,
    academicDNA.engagement || 60,
    academicDNA.consistency || 55,
    academicDNA.social || 65,
    academicDNA.resilience || 70,
    academicDNA.careerClarity || 45,
    academicDNA.wellbeing || ((student?.moodToday || 3) / 5) * 100
  ];

  const radarData = {
    labels: dnaLabels,
    datasets: [{
      label: 'Academic DNA',
      data: dnaValues,
      backgroundColor: 'rgba(0,191,255,0.15)',
      borderColor: '#00BFFF',
      pointBackgroundColor: '#00BFFF',
      pointRadius: 4,
      borderWidth: 2
    }]
  };

  const lineData = {
    labels: grades.map(g => `Sem ${g.semester}`),
    datasets: [{
      label: 'Grade Average',
      data: grades.map(g => g.average),
      fill: true,
      borderColor: '#00BFFF',
      backgroundColor: 'rgba(0,191,255,0.1)',
      tension: 0.4,
      pointBackgroundColor: '#00BFFF',
      pointRadius: 6
    }]
  };

  const chartOpts = (max = 100) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } }
    }
  });

  const clusterHistory = student?.clusterHistory || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', fontFamily: "'Nunito', sans-serif" }}>
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/student" style={{ color: '#00BFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← Dashboard</Link>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', margin: 0 }}>📈 My Progress</h1>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.4)' }}>Loading progress data...</div>
        ) : (
          <>
            {/* Academic DNA Radar */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', margin: '0 0 4px', color: '#00BFFF' }}>🧬 Academic DNA</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 20px' }}>8-dimensional profile of your learning</p>
              <div style={{ height: '280px' }}>
                <Radar data={radarData} options={{
                  responsive: true, maintainAspectRatio: false,
                  scales: {
                    r: {
                      min: 0, max: 100,
                      grid: { color: 'rgba(255,255,255,0.08)' },
                      ticks: { display: false },
                      pointLabels: { color: 'rgba(255,255,255,0.7)', font: { size: 11, family: 'Nunito' } }
                    }
                  },
                  plugins: { legend: { display: false } }
                }} />
              </div>
            </div>

            {/* Grade Trend */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', margin: '0 0 20px' }}>📊 Grade Trajectory</h3>
              <div style={{ height: '280px' }}>
                {grades.length > 0 ? (
                  <Line data={lineData} options={chartOpts()} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.3)' }}>No grade data yet</div>
                )}
              </div>
            </div>

            {/* Cluster History */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', margin: '0 0 20px' }}>🔬 Cluster History</h3>
              {clusterHistory.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px' }}>No history yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {clusterHistory.map((h, i) => {
                    const clusterColor = { top: '#10B981', medium: '#F59E0B', below: '#EF4444' };
                    const clusterLabel = { top: '⭐ Top', medium: '📈 Medium', below: '⚠️ Below' };
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: `1px solid ${clusterColor[h.cluster]}20` }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: clusterColor[h.cluster], flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: clusterColor[h.cluster], fontSize: '14px' }}>{clusterLabel[h.cluster]}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, color: clusterColor[h.cluster] }}>{h.score}</div>
                        {i > 0 && h.score !== clusterHistory[i - 1]?.score && (
                          <div style={{ fontSize: '14px', color: h.score > (clusterHistory[i - 1]?.score || 0) ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                            {h.score > (clusterHistory[i - 1]?.score || 0) ? '↑' : '↓'} {Math.abs(h.score - (clusterHistory[i - 1]?.score || 0))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stats Summary */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', margin: '0 0 20px' }}>🏅 My Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {[
                  { icon: '⚡', label: 'XP Points', value: student?.xpPoints || 0, color: '#FFD700' },
                  { icon: '🔥', label: 'Day Streak', value: `${student?.streakDays || 0} days`, color: '#EF4444' },
                  { icon: '🏆', label: 'Level', value: `Level ${student?.level || 1}`, color: '#8B5CF6' },
                  { icon: '🎖️', label: 'Badges Earned', value: student?.badges?.length || 0, color: '#10B981' },
                  { icon: '📊', label: 'Health Score', value: student?.academicHealthScore || 0, color: '#00BFFF' },
                  { icon: '📅', label: 'Attendance', value: `${student?.attendancePercentage || 0}%`, color: '#F59E0B' }
                ].map((stat, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '28px' }}>{stat.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '20px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
