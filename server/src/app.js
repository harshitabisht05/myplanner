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
      // Allow requests with no origin (like mobile apps or curl) or matching origins
      callback(null, true);
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection middleware for Vercel Serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database middleware connection error:', err);
    res.status(500).json({ success: false, message: 'Database connection failure' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/braindump', brainDumpRoutes);
app.use('/api/dailynote', dailyNoteRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling
app.use(errorMiddleware);

module.exports = app;
