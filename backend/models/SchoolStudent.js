const mongoose = require('mongoose');

const careerMilestoneSchema = new mongoose.Schema({
  month:       { type: Number, required: true },
  action:      { type: String, required: true },
  detail:      { type: String },
  hours:       { type: Number, default: 0 },
  resources:   [String],
  completed:   { type: Boolean, default: false },
  completedAt: { type: Date },
}, { _id: false });

const moodJournalSchema = new mongoose.Schema({
  entry:     { type: String }, // stored but app treats as private
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  date:      { type: Date, default: Date.now },
}, { _id: false });

const nipunSchema = new mongoose.Schema({
  reading:     { type: Number, min: 1, max: 5, default: 1 }, // NIPUN Bharat reading fluency
  numberSense: { type: Number, min: 1, max: 5, default: 1 }, // Number sense
  oralComm:    { type: Number, min: 1, max: 5, default: 1 }, // Oral communication
  lastAssessed: { type: Date },
}, { _id: false });

const subjectSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  code:       { type: String },
  score:      { type: Number, default: 0 },    // latest score %
  trend:      { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  attendance: { type: Number, default: 0 },    // % attendance for this subject
  nepLevel:   { type: String, enum: ['Exploring', 'Developing', 'Achieving', 'Mastering'], default: 'Developing' },
}, { _id: false });

const schoolStudentSchema = new mongoose.Schema({
  // Core identity
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },
  rollNumber:   { type: String, unique: true },
  class:        { type: String, required: true },  // '3','4'...'12'
  section:      { type: String, default: 'A' },
  school:       { type: String, default: 'EduPulse School' },
  scmId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentEmail:  { type: String },

  // Academic data
  subjects:     [subjectSchema],
  gradeAverage: { type: Number, default: 0 },
  gradeTrend:   { type: Number, default: 0 },  // -10 to +10 delta
  academicHealthScore: { type: Number, default: 60 },
  attendancePercentage: { type: Number, default: 0 },

  // ML cluster
  cluster:      { type: String, enum: ['top', 'medium', 'below'], default: 'medium' },
  clusterHistory: [{
    cluster: String, score: Number,
    date: { type: Date, default: Date.now },
  }],

  // Gamification
  xpPoints:  { type: Number, default: 0 },
  level:     { type: Number, default: 1 },
  streakDays:{ type: Number, default: 0 },
  badges: [{
    id: String, name: String, icon: String,
    description: String, earnedAt: { type: Date, default: Date.now },
  }],

  // NIPUN Bharat (Class 3-5 only)
  nipunLevels: { type: nipunSchema, default: () => ({}) },

  // Mood
  moodToday:      { type: Number, min: 1, max: 5, default: 3 },
  averageMoodScore: { type: Number, default: 3 },
  moodSource:     { type: String, enum: ['checkin', 'opencv', 'none'], default: 'none' },

  // Career (Class 9-12)
  selectedStream:        { type: String, enum: ['Science', 'Commerce', 'Arts', ''] },
  streamRecommendation:  { type: mongoose.Schema.Types.Mixed },  // Gemini-generated
  selectedCareer:        { type: String },
  careerMilestones:      [careerMilestoneSchema],
  milestonesCompleted:   { type: Number, default: 0 },
  successProbability:    { type: Number, default: 50 },

  // Study plan
  studyPlanId:   { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan' },
  boardExamDates: [{
    subject: String, date: Date,
  }],

  // Mood journal (private)
  moodJournal:  [moodJournalSchema],

  // Academic DNA (8 dimensions, values 0-100)
  academicDNA: {
    focusPower:        { type: Number, default: 50 },
    pressurePerformer: { type: Number, default: 50 },
    teamPlayer:        { type: Number, default: 50 },
    selfNavigator:     { type: Number, default: 50 },
    comebackKid:       { type: Number, default: 50 },
    subjectExplorer:   { type: Number, default: 50 },
    quickResponder:    { type: Number, default: 50 },
    growthSeeker:      { type: Number, default: 50 },
  },

  // Career family affinity (0-100)
  careerFamilies: {
    scienceTech:    { type: Number, default: 50 },
    creativeArts:   { type: Number, default: 50 },
    business:       { type: Number, default: 50 },
    socialImpact:   { type: Number, default: 50 },
    sportsWellness: { type: Number, default: 50 },
  },

  // Learning style
  learningStyle: { type: String, enum: ['visual', 'auditory', 'kinesthetic', 'flexible'], default: 'visual' },

  // Quests
  questsCompleted: { type: Number, default: 0 },
  activeQuestIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
}, { timestamps: true });

module.exports = mongoose.model('SchoolStudent', schoolStudentSchema);
