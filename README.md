# EduPulse - Academic and Career Navigator

## Overview
EduPulse is an AI-powered Full-Stack platform designed for College Students, School Students, Parents, SCMs (Student Counselors), and Admins. It solves the problem of silent student failure, late parent notifications, generic career guidance, and unmanageable SCM workloads.

## Features Built
1. **Multi-Role Dashboards (React, Vite, Tailwind)**: 
   - College Student, Class 3-5, Class 6-8, Class 9-12, Parent, SCM, and Admin.
2. **AI Integration (Gemini)**: 
   - Sparky Chat, Voice I/O, Career Path Generation, Insight Generation, Parent Email Generation.
3. **Machine Learning Microservice**: 
   - Python/Flask K-Means clustering for student grouping.
4. **Backend Architecture**: 
   - Node.js, Express, MongoDB, Socket.io for Real-time alerts.
5. **Gamification**: 
   - XP points, streaks, badges, academic DNA radar charts.

## Setup Instructions

### 1. Database & Environment Variables
Create a `.env` file in the `backend` folder:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edupulse
JWT_SECRET=your_jwt_secret_key_123
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_key_here
```

Create a `.env` file in the `frontend` folder:
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_key_here
```

### 2. Install Dependencies & Seed
```bash
# Backend
cd backend
npm install
node seed.js # To generate demo data -> prints credentials
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# ML Service
cd ml_service
pip install -r requirements.txt
python app.py
```

### 3. Demo Credentials
If you ran `node seed.js`, check the console output for the demo logins (Emails & PINs) for all roles.
