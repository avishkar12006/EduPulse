const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const authRoutes    = require('./routes/auth');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const gradeRoutes   = require('./routes/grades');
const scmRoutes     = require('./routes/scm');
const alertRoutes   = require('./routes/alerts');
const careerRoutes  = require('./routes/career');
const aiRoutes      = require('./routes/ai');
const clusterRoutes = require('./routes/cluster');
const schoolRoutes  = require('./routes/school');

connectDB();



const app    = express();
const server = http.createServer(app);

// ── CORS ──────────────────────────────────────────────
// In production set FRONTEND_URL=https://your-app.vercel.app
// In dev it defaults to * so Vite proxy works
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5174', 'http://localhost:5173']
  : ['*'];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

// ── Socket.io ─────────────────────────────────────────
const io = new Server(server, { cors: { origin: allowedOrigins.includes('*') ? '*' : allowedOrigins, methods: ['GET','POST'] } });

// ── Middlewares ───────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health ────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'EduPulse Backend', version: '2.0.0', timestamp: new Date() })
);

// ── API Routes ────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/students',   studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades',     gradeRoutes);
app.use('/api/scm',        scmRoutes);
app.use('/api/alerts',     alertRoutes);
app.use('/api/career',     careerRoutes);
app.use('/api/ai',         aiRoutes);
app.use('/api/cluster',    clusterRoutes);
app.use('/api/school',     schoolRoutes);

// ── Socket.io events ──────────────────────────────────
io.on('connection', socket => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('join_room',         userId => socket.join(userId));
  socket.on('attendance_update', data   => io.emit('attendance_updated', data));
  socket.on('alert_sent',        data   => {
    io.to(data.parentId).emit('new_alert', data);
    io.to(data.scmId).emit('alert_notification', data);
  });
  socket.on('cluster_updated',   data   => io.emit('cluster_refresh', data));
  socket.on('disconnect',        ()     => console.log(`🔌 Disconnected: ${socket.id}`));
});

// ── Error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

// ── Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`\n🚀 EduPulse Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n✅ API Ready at http://localhost:${PORT}/api`);
  console.log(`🏥 Health:  http://localhost:${PORT}/health\n`);
});


module.exports = { app, io };


