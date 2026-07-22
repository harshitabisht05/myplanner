const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorMiddleware');

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

// Security HTTP Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// CORS configuration with credentials
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS Policy: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
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

// 404 Route
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
