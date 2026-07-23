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
  { path: '/dailynote', handler: dailyNoteRoutes }
];

apiRoutes.forEach(({ path, handler }) => {
  app.use(`/api${path}`, handler);
  app.use(path, handler);
});

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling
app.use(errorMiddleware);

module.exports = app;
