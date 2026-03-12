const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(prompt, systemPrompt = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured');
  }
  
  const response = await axios.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      contents: [{
        parts: [{
          text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    }
  );
  
  return response.data.candidates[0].content.parts[0].text;
}

async function sparkyChatResponse({ message, studentName, semester, cluster, attendancePercentage, moodToday, chatHistory = [] }) {
  const systemPrompt = `You are Sparky 🤖, a friendly and encouraging AI academic buddy for students at EduPulse.
Student info: Name: ${studentName}, Semester: ${semester}, Cluster: ${cluster || 'medium'}, Attendance: ${attendancePercentage}%, Current mood score: ${moodToday || 3}/5.
Be warm, use emojis, keep responses under 3 sentences. Always encouraging. If mood is low (1-2), prioritize emotional support over academics.
Never be negative or critical. Always end on a positive note.`;
  
  return await callGemini(message, systemPrompt);
}

async function generateCareerRoadmap({ student, grades, interests = [] }) {
  const gradesSummary = grades.slice(0, 10).map(g => `${g.subject}: ${g.percentage}%`).join(', ');
  
  const prompt = `Generate exactly 3 distinct career paths for this Indian student.
Student Profile:
- Name: ${student.name}
- Department: ${student.department || 'Computer Science'}
- Semester: ${student.semester || 3}
- Academic Health Score: ${student.academicHealthScore}/100
- Attendance: ${student.attendancePercentage}%
- Grades: ${gradesSummary || 'Not yet recorded'}
- Interests: ${interests.join(', ') || 'Technology, Problem-solving'}
- Learning Style: ${student.learningStyle || 'flexible'}

For each career path, provide a JSON object with:
- title: career title
- industry: industry name
- icon: single emoji representing the career
- whyThisStudent: 2 sentences explaining why this suits this specific student (reference their actual data)
- successProbability: number 0-100 based on their profile
- strongAreas: array of 3 subjects/skills they already have
- gapAreas: array of 3 skills they need to develop
- milestones: array of 6 monthly milestones, each with: month(number), action(string), skill(string), difficulty("Easy"/"Medium"/"Hard"), resource(string)
- certifications: array of 3 objects with name, link(URL), cost(string in INR or "Free")
- salaryRange: "₹X LPA - ₹Y LPA" format
- growthProjection: one sentence about 5-year growth

Return ONLY a valid JSON array of exactly 3 path objects. No markdown, no explanation, just the JSON array.`;
  
  try {
    const response = await callGemini(prompt);
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    // Return fallback career paths if Gemini fails
    return getFallbackCareerPaths(student);
  }
}

async function generateParentAlert({ studentName, parentName, semester, department, triggerReason, alertType, attendancePercentage, academicHealthScore, language }) {
  const langNote = language === 'hi' ? 'Write the email in Hindi (Devanagari script).' : 
                   language === 'mr' ? 'Write the email in Marathi (Devanagari script).' : 
                   'Write in English.';
  
  const prompt = `Generate a warm, empathetic parent alert email for ${parentName} about their child ${studentName}.
${langNote}

Student Info:
- Semester: ${semester}, Department: ${department}
- Trigger: ${triggerReason}
- Attendance: ${attendancePercentage}%
- Academic Health Score: ${academicHealthScore}/100

The email MUST have exactly three clearly labeled sections:
1. WHAT IS HAPPENING: Clear plain language explanation with specific numbers
2. WHAT YOU CAN DO: 3 specific actionable steps for the parent at home
3. WHAT TO AVOID: 2 things parents should NOT do to avoid increasing anxiety

Tone: Warm, caring, supportive. Never alarming or accusatory.
Keep it under 300 words. Start with "Dear ${parentName},"`;
  
  return await callGemini(prompt);
}

async function parseVoiceCommand(voiceText) {
  const prompt = `Parse this voice command from an SCM (Student Counselor and Mentor) dashboard user.
Command: "${voiceText}"

Available actions and their parameters:
- filter_students: {cluster: "top"/"medium"/"below", attendance_threshold: number}
- generate_report: {type: "progress"/"attendance"/"cluster", semester: number}
- send_alert: {target: "below_average"/"low_attendance"/"all_at_risk"}
- show_attendance: {threshold: number, subject: string}
- book_session: {studentName: string}
- show_dashboard: {section: "priority"/"clusters"/"analytics"}

Return ONLY valid JSON: {"action": string, "parameters": object, "confirmationMessage": string}
No markdown, no explanation.`;
  
  try {
    const response = await callGemini(prompt);
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    return { action: 'show_dashboard', parameters: { section: 'priority' }, confirmationMessage: 'Showing priority queue...' };
  }
}

async function generateWeeklyInsight({ studentName, gradeAvg, attendancePercentage, streakDays, moodAvg, cluster }) {
  const prompt = `Generate a 2-sentence personalized weekly insight for ${studentName}.
Weekly data: Grade average: ${gradeAvg}%, Attendance: ${attendancePercentage}%, Login streak: ${streakDays} days, Mood average: ${moodAvg}/5, Cluster: ${cluster}.
Be specific, encouraging, actionable. Use ONE emoji. Under 50 words total.`;
  
  return await callGemini(prompt);
}

function getFallbackCareerPaths(student) {
  return [
    {
      title: 'Software Development Engineer',
      industry: 'Technology',
      icon: '💻',
      whyThisStudent: 'Your technical background provides a strong foundation for software development. Your analytical mindset aligns well with problem-solving in this field.',
      successProbability: 72,
      strongAreas: ['Problem Solving', 'Technical Aptitude', 'Mathematics'],
      gapAreas: ['System Design', 'Cloud Platforms', 'Open Source Contribution'],
      milestones: [
        { month: 1, action: 'Learn Data Structures deeply', skill: 'DSA', difficulty: 'Medium', resource: 'LeetCode + GeeksforGeeks' },
        { month: 3, action: 'Build 2 full-stack projects', skill: 'Web Development', difficulty: 'Medium', resource: 'The Odin Project' },
        { month: 6, action: 'Contribute to open source', skill: 'Collaboration', difficulty: 'Easy', resource: 'GitHub' },
        { month: 9, action: 'Prepare for coding interviews', skill: 'Interview Prep', difficulty: 'Hard', resource: 'InterviewBit' },
        { month: 12, action: 'Apply to top tech companies', skill: 'Job Search', difficulty: 'Medium', resource: 'LinkedIn, Naukri' },
        { month: 18, action: 'Specialize in a cloud platform', skill: 'Cloud Computing', difficulty: 'Hard', resource: 'AWS Free Tier' }
      ],
      certifications: [
        { name: 'Google Associate Cloud Engineer', link: 'https://cloud.google.com/certification', cost: '₹15,000' },
        { name: 'AWS Certified Developer', link: 'https://aws.amazon.com/certification', cost: '₹18,000' },
        { name: 'Meta Frontend Developer', link: 'https://www.coursera.org/professional-certificates/meta-front-end-developer', cost: 'Free (Coursera)' }
      ],
      salaryRange: '₹5 LPA - ₹25 LPA',
      growthProjection: 'With India\'s tech sector growing 15% annually, SDE roles are projected to see 40% salary increase in 5 years.'
    },
    {
      title: 'Data Scientist',
      industry: 'Analytics & AI',
      icon: '📊',
      whyThisStudent: 'Your quantitative subjects show strong analytical ability ideal for data science. The AI/ML field is booming and your background positions you well.',
      successProbability: 65,
      strongAreas: ['Mathematics', 'Statistical Thinking', 'Analytical Skills'],
      gapAreas: ['Python Advanced', 'Machine Learning', 'SQL Databases'],
      milestones: [
        { month: 1, action: 'Master Python and Pandas', skill: 'Python', difficulty: 'Easy', resource: 'Kaggle Learn' },
        { month: 3, action: 'Complete ML foundations course', skill: 'Machine Learning', difficulty: 'Medium', resource: 'Andrew Ng Coursera' },
        { month: 6, action: 'Compete in 3 Kaggle competitions', skill: 'Practical ML', difficulty: 'Hard', resource: 'Kaggle.com' },
        { month: 9, action: 'Build data science portfolio', skill: 'Portfolio', difficulty: 'Medium', resource: 'GitHub Pages' },
        { month: 12, action: 'Apply for data analyst roles', skill: 'Job Search', difficulty: 'Medium', resource: 'LinkedIn, AngelList' },
        { month: 18, action: 'Specialize in Deep Learning', skill: 'Deep Learning', difficulty: 'Hard', resource: 'FastAI' }
      ],
      certifications: [
        { name: 'IBM Data Science Professional', link: 'https://www.coursera.org/professional-certificates/ibm-data-science', cost: 'Free (Coursera)' },
        { name: 'Google Data Analytics', link: 'https://grow.google/certificates/data-analytics/', cost: 'Free' },
        { name: 'Tableau Desktop Specialist', link: 'https://www.tableau.com/learn/certification', cost: '₹20,000' }
      ],
      salaryRange: '₹6 LPA - ₹30 LPA',
      growthProjection: 'Data Science is India\'s fastest growing field with 85,000 unfilled positions and 45% salary premium over traditional IT roles.'
    },
    {
      title: 'Product Manager',
      industry: 'Business & Technology',
      icon: '🚀',
      whyThisStudent: 'Your balanced skill set across technical and communication domains makes PM a natural fit. Your ability to bridge tech and business is rare and highly valued.',
      successProbability: 60,
      strongAreas: ['Communication', 'Problem Definition', 'Cross-functional Thinking'],
      gapAreas: ['Market Research', 'Agile/Scrum', 'Product Analytics'],
      milestones: [
        { month: 1, action: 'Study PM fundamentals', skill: 'Product Thinking', difficulty: 'Easy', resource: 'Lenny\'s Podcast + PM School' },
        { month: 3, action: 'Build and ship a side project', skill: 'Product Building', difficulty: 'Medium', resource: 'No-code tools' },
        { month: 6, action: 'Intern at a startup as APM', skill: 'Real-world PM', difficulty: 'Hard', resource: 'LinkedIn, Internshala' },
        { month: 9, action: 'Get Google PM certification', skill: 'Formal PM Skills', difficulty: 'Medium', resource: 'Google Project Management' },
        { month: 12, action: 'Create PM portfolio case studies', skill: 'Portfolio', difficulty: 'Medium', resource: 'Medium, Notion' },
        { month: 18, action: 'Apply for APM programs at tech companies', skill: 'Job Search', difficulty: 'Hard', resource: 'LinkedIn, company careers pages' }
      ],
      certifications: [
        { name: 'Google Project Management', link: 'https://grow.google/certificates/project-management/', cost: 'Free' },
        { name: 'Product School PM Certificate', link: 'https://productschool.com', cost: '₹45,000' },
        { name: 'CSPO (Certified Scrum Product Owner)', link: 'https://www.scrumalliance.org/get-certified/product-owner-track/cspo', cost: '₹30,000' }
      ],
      salaryRange: '₹8 LPA - ₹35 LPA',
      growthProjection: 'PM roles in India have seen 70% growth in 3 years with top-tier PMs at unicorns earning ₹50+ LPA.'
    }
  ];
}

module.exports = {
  sparkyChatResponse,
  generateCareerRoadmap,
  generateParentAlert,
  parseVoiceCommand,
  generateWeeklyInsight
};
