import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { Line, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, CategoryScale, LinearScale, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertSent, setAlertSent] = useState('');
  const [sendingAlert, setSendingAlert] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  const [sessionSaved, setSessionSaved] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [sRes, gRes, aRes] = await Promise.all([
        API.get(`/api/students/${id}`),
        API.get(`/api/grades/${id}/summary`),
        API.get(`/api/attendance/${id}/summary`)
      ]);
      setStudent(sRes.data);
      setGrades(gRes.data?.semesterSummary || []);
      setAttendance(aRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const sendAlert = async (alertType) => {
    setSendingAlert(true);
    try {
      await API.post('/api/alerts/send', {
        studentId: id,
        alertType,
        triggerReason: alertType === 'attendance'
          ? `Attendance at ${attendance?.overall || student?.attendancePercentage}% — below threshold`
          : `Academic health score dropped to ${student?.academicHealthScore}`
      });
      setAlertSent(`✅ Alert sent to parent`);
      setTimeout(() => setAlertSent(''), 3000);
    } catch { setAlertSent('❌ Failed to send'); }
    finally { setSendingAlert(false); }
  };

  const saveSession = async () => {
    try {
      await API.post(`/api/scm/${user._id}/session`, { studentId: id, notes: sessionNote });
      setSessionSaved(true);
      setSessionNote('');
      setTimeout(() => setSessionSaved(false), 3000);
    } catch {}
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px' }}>⏳</div><div style={{ marginTop: '16px', color: '#64748b' }}>Loading student profile...</div></div>
    </div>
  );

  if (!student) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px' }}>🤷</div><div style={{ marginTop: '16px', color: '#64748b' }}>Student not found</div><Link to="/scm" style={{ color: '#2563EB', display: 'block', marginTop: '12px' }}>← Back to SCM</Link></div>
    </div>
  );

  const hScore = student.academicHealthScore;
  const attendancePct = attendance?.overall ?? student.attendancePercentage ?? 0;
  const clusterColor = { top: '#10B981', medium: '#F59E0B', below: '#EF4444' };

  const dnaValues = [hScore, attendancePct, 60, 55, 65, 70, 45, ((student.moodToday || 3) / 5) * 100];
  const radarData = {
    labels: ['Academics', 'Attendance', 'Engagement', 'Consistency', 'Social', 'Resilience', 'Career', 'Wellbeing'],
    datasets: [{ label: student.name, data: dnaValues, backgroundColor: 'rgba(37,99,235,0.1)', borderColor: '#2563EB', pointBackgroundColor: '#2563EB', borderWidth: 2, pointRadius: 3 }]
  };

  const gradeLineData = {
    labels: grades.map(g => `Sem ${g.semester}`),
    datasets: [{ label: 'Average %', data: grades.map(g => g.average), fill: true, borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.08)', tension: 0.4, pointRadius: 5 }]
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Nunito', sans-serif", color: '#0f172a' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <Link to="/scm" style={{ color: '#2563EB', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← SCM Dashboard</Link>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', margin: 0, color: '#0f172a' }}>Student Profile</h1>
      </nav>

      {alertSent && <div style={{ background: alertSent.startsWith('✅') ? '#d1fae5' : '#fee2e2', color: alertSent.startsWith('✅') ? '#065f46' : '#991b1b', padding: '10px 24px', fontWeight: 700, fontSize: '14px', textAlign: 'center' }}>{alertSent}</div>}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Header card */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', border: '2px solid #dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink: 0 }}>
            {student.userId?.avatar || '🧑'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '6px' }}>
              <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '26px', margin: 0 }}>{student.name}</h2>
              <span style={{ background: `${clusterColor[student.cluster] || '#94a3b8'}15`, color: clusterColor[student.cluster] || '#94a3b8', border: `1px solid ${clusterColor[student.cluster] || '#94a3b8'}40`, borderRadius: '99px', padding: '4px 14px', fontSize: '13px', fontWeight: 800 }}>
                {student.cluster?.toUpperCase()} CLUSTER
              </span>
            </div>
            <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>{student.rollNumber} · {student.department} · Semester {student.semester} · Section {student.section}</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                { icon: '📊', label: 'Health', value: hScore, color: hScore >= 70 ? '#10B981' : hScore >= 50 ? '#F59E0B' : '#EF4444' },
                { icon: '📅', label: 'Attendance', value: `${attendancePct}%`, color: attendancePct >= 85 ? '#10B981' : attendancePct >= 75 ? '#F59E0B' : '#EF4444' },
                { icon: '😊', label: 'Mood Today', value: ['', '😰', '😢', '😐', '😊', '🤩'][student.moodToday || 3], color: '#FB923C' },
                { icon: '🎓', label: 'Level', value: `Lvl ${student.level || 1}`, color: '#8B5CF6' }
              ].map((s, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: '12px', padding: '10px 16px', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
            <button onClick={() => sendAlert('performance')} disabled={sendingAlert}
              style={{ padding: '10px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#EF4444', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              {sendingAlert ? '...' : '📧 Alert Parent (Academic)'}
            </button>
            <button onClick={() => sendAlert('attendance')} disabled={sendingAlert}
              style={{ padding: '10px 18px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', color: '#92400e', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              📅 Alert Parent (Attendance)
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Radar chart */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#0f172a', margin: '0 0 16px' }}>🧬 Academic DNA</h3>
            <div style={{ height: '260px' }}>
              <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, grid: { color: '#f1f5f9' }, ticks: { display: false }, pointLabels: { color: '#64748b', font: { size: 11 } } } }, plugins: { legend: { display: false } } }} />
            </div>
          </div>

          {/* Grade trend */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#0f172a', margin: '0 0 16px' }}>📊 Grade Trend</h3>
            <div style={{ height: '260px' }}>
              {grades.length > 0 ? (
                <Line data={gradeLineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 11 } } }, x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } } } }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>No grade data</div>
              )}
            </div>
          </div>

          {/* Attendance by subject */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#0f172a', margin: '0 0 16px' }}>📅 Subject Attendance</h3>
            {(attendance?.summary || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: '4px' }}>{s.subject}</div>
                  <div style={{ height: '6px', borderRadius: '99px', background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.percentage}%`, borderRadius: '99px', background: s.percentage >= 85 ? '#10B981' : s.percentage >= 75 ? '#F59E0B' : '#EF4444' }} />
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: s.percentage >= 85 ? '#10B981' : s.percentage >= 75 ? '#F59E0B' : '#EF4444', minWidth: '40px', textAlign: 'right' }}>{s.percentage}%</div>
              </div>
            ))}
            {!(attendance?.summary?.length) && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>No attendance data</div>}
          </div>

          {/* Counseling session notes */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#0f172a', margin: '0 0 16px' }}>📝 Record Session</h3>
            <textarea value={sessionNote} onChange={e => setSessionNote(e.target.value)}
              rows={5} placeholder={`Record counseling session notes for ${student.name}...`}
              style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', fontSize: '14px', fontFamily: "'Nunito', sans-serif", resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            {sessionSaved && <div style={{ color: '#10B981', fontWeight: 700, fontSize: '14px', marginTop: '8px' }}>✅ Session saved!</div>}
            <button onClick={saveSession} disabled={!sessionNote.trim()}
              style={{ marginTop: '12px', padding: '10px 24px', background: sessionNote.trim() ? '#2563EB' : '#e2e8f0', border: 'none', borderRadius: '10px', color: sessionNote.trim() ? 'white' : '#94a3b8', fontWeight: 700, fontSize: '14px', cursor: sessionNote.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Nunito', sans-serif" }}>
              💾 Save Session Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
