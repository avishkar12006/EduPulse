import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

export default function AttendanceMarking() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const SUBJECTS = [
    { name: 'Database Systems', code: 'CS301' },
    { name: 'Operating Systems', code: 'CS302' },
    { name: 'Computer Networks', code: 'CS303' },
    { name: 'Software Engineering', code: 'IT301' },
    { name: 'Engineering Mathematics', code: 'MA101' }
  ];

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await API.get(`/api/scm/${user._id}/students`);
      setStudents(data || []);
      const initAttendance = {};
      (data || []).forEach(s => { initAttendance[s._id] = 'present'; });
      setAttendance(initAttendance);
    } catch {}
    finally { setLoading(false); }
  };

  const setStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const next = {};
    students.forEach(s => { next[s._id] = status; });
    setAttendance(next);
  };

  const saveAttendance = async () => {
    if (!subject || !subjectCode) { alert('Please select a subject!'); return; }
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s._id, subject, subjectCode,
        date: selectedDate, status: attendance[s._id] || 'present'
      }));
      await API.post('/api/attendance/bulk', { records });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert('Failed to save attendance'); }
    finally { setSaving(false); }
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length;
  const lateCount = Object.values(attendance).filter(v => v === 'late').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Nunito', sans-serif", color: '#0f172a' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/scm" style={{ color: '#2563EB', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← SCM Dashboard</Link>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', margin: 0 }}>📅 Mark Attendance</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#10B981', fontWeight: 700, fontSize: '14px' }}>✅ {presentCount} Present</span>
          <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '14px' }}>❌ {absentCount} Absent</span>
          <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '14px' }}>⏰ {lateCount} Late</span>
          <button onClick={saveAttendance} disabled={saving || !subject}
            style={{ padding: '10px 24px', background: saving ? '#e2e8f0' : '#2563EB', border: 'none', borderRadius: '10px', color: saving ? '#94a3b8' : 'white', fontWeight: 800, fontSize: '14px', cursor: saving || !subject ? 'not-allowed' : 'pointer', fontFamily: "'Nunito', sans-serif" }}>
            {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Attendance'}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        {/* Controls */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>SUBJECT</label>
            <select value={subject} onChange={e => { const sel = SUBJECTS.find(s => s.name === e.target.value); setSubject(e.target.value); setSubjectCode(sel?.code || ''); }}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: "'Nunito', sans-serif", color: '#0f172a', cursor: 'pointer' }}>
              <option value="">— Select Subject —</option>
              {SUBJECTS.map(s => <option key={s.code} value={s.name}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>DATE</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              style={{ padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: "'Nunito', sans-serif", color: '#0f172a', cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => markAll('present')} style={{ padding: '10px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#10B981', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>✅ All Present</button>
            <button onClick={() => markAll('absent')} style={{ padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#EF4444', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>❌ All Absent</button>
          </div>
        </div>

        {/* Student list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading students...</div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <div style={{ color: '#64748b', fontWeight: 600 }}>No students assigned to you yet</div>
          </div>
        ) : (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
            {students.map((s, i) => {
              const status = attendance[s._id] || 'present';
              return (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderBottom: i < students.length - 1 ? '1px solid #f1f5f9' : 'none', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {s.userId?.avatar || '🧑'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.rollNumber} · Sem {s.semester}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['present', 'absent', 'late'].map(st => {
                      const colors = { present: { bg: '#f0fdf4', border: '#bbf7d0', color: '#10B981', active: '#10B981' }, absent: { bg: '#fef2f2', border: '#fecaca', color: '#EF4444', active: '#EF4444' }, late: { bg: '#fffbeb', border: '#fde68a', color: '#F59E0B', active: '#F59E0B' } };
                      const c = colors[st];
                      const isActive = status === st;
                      const icons = { present: '✅', absent: '❌', late: '⏰' };
                      return (
                        <button key={st} onClick={() => setStatus(s._id, st)}
                          style={{ width: '44px', height: '36px', border: `2px solid ${isActive ? c.active : '#e2e8f0'}`, borderRadius: '8px', background: isActive ? c.bg : 'white', cursor: 'pointer', fontSize: '16px', transition: 'all 0.15s' }}>
                          {icons[st]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
