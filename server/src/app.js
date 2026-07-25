const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const habitRoutes = require('./routes/habitRoutes');
const noteRoutes = require('./routes/noteRoutes');
const goalRoutes = require('./routes/goalRoutes');
const eventRoutes = require('./routes/eventRoutes');
const moodRoutes = require('./routes/moodRoutes');
const reflectionRoutes = require('./routes/reflectionRoutes');
const brainDumpRoutes = require('./routes/brainDumpRoutes');
const dailyNoteRoutes = require('./routes/dailyNoteRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const focusSessionRoutes = require('./routes/focusSessionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Workspace Module Route imports
const workspaceRoutes = require('./routes/workspaceRoutes');
const projectRoutes = require('./routes/projectRoutes');
const workspaceTaskRoutes = require('./routes/workspaceTaskRoutes');
const sprintRoutes = require('./routes/sprintRoutes');
const chatRoutes = require('./routes/chatRoutes');
const fileRoutes = require('./routes/fileRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Trust proxy for Vercel deployment
app.set('trust proxy', 1);

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Database connection middleware for Vercel Serverless
app.use(async (req, res, next) => {
  if (req.url === '/api/health' || req.url === '/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Database connection failure. Please check MONGODB_URI in Vercel environment variables.'
    });
  }
});

// Path normalization for Vercel Serverless Function rewrites
app.use((req, res, next) => {
  req.url = req.url.replace(/^\/api\/api/, '/api');
  next();
});

// Nested Workspace Routers
workspaceRoutes.use('/:workspaceId/projects', projectRoutes);
workspaceRoutes.use('/:workspaceId/tasks', workspaceTaskRoutes);
workspaceRoutes.use('/:workspaceId/sprints', sprintRoutes);
workspaceRoutes.use('/:workspaceId/chat', chatRoutes);
workspaceRoutes.use('/:workspaceId/files', fileRoutes);
workspaceRoutes.use('/:workspaceId/activity', activityRoutes);

// API Routes - registered with both /api/path and /path for Vercel compatibility
const apiRoutes = [
  { path: '/auth', handler: authRoutes },
  { path: '/tasks', handler: taskRoutes },
  { path: '/habits', handler: habitRoutes },
  { path: '/notes', handler: noteRoutes },
  { path: '/goals', handler: goalRoutes },
  { path: '/events', handler: eventRoutes },
  { path: '/moods', handler: moodRoutes },
  { path: '/reflections', handler: reflectionRoutes },
  { path: '/braindump', handler: brainDumpRoutes },
  { path: '/dailynote', handler: dailyNoteRoutes },
  { path: '/categories', handler: categoryRoutes },
  { path: '/focus', handler: focusSessionRoutes },
  { path: '/notifications', handler: notificationRoutes },
  { path: '/workspaces', handler: workspaceRoutes }
];

apiRoutes.forEach(({ path, handler }) => {
  app.use(`/api${path}`, handler);
  app.use(path, handler);
});

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Direct link redirect for email invitations opening backend URL
app.get(['/accept-invite', '/api/accept-invite'], (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const token = req.query.token || '';
  res.redirect(`${clientUrl.replace(/\/$/, '')}/accept-invite?token=${token}`);
});

// Centralized error handling
app.use(errorMiddleware);

module.exports = app;
