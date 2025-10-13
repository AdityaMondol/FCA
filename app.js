const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const { validate, sanitizeInput } = require('./utils/validate');
const { 
  verifyToken, 
  hasPermission, 
  hasPermissionLevel, 
  SESSION_CONFIG 
} = require('./utils/auth');
const { 
  processImage, 
  generateFileName, 
  uploadToSupabase, 
  deleteFromSupabase, 
  uploadMiddlewares,
  FILE_SIZE_LIMITS,
  IMAGE_PROCESSING_OPTIONS
} = require('./utils/upload');
const { logger, httpLogger } = require('./utils/log');
const { validateEnv } = require('./utils/env');

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

const app = express();

// Trust proxy - REQUIRED for Render/Heroku/behind reverse proxy
app.set('trust proxy', 1);

// Security enhancements


// Add security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'your_supabase_url_here';
const supabaseKey = process.env.SUPABASE_KEY || 'your_supabase_key_here';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be service role key
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Supabase Configuration
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

supabase
  .from('users')
  .select('count')
  .then(({ data, error }) => {
    if (error) {
      logger.error('Database connection failed', { error: error.message });
    } else {
      logger.info('Database connected successfully');
    }
  })
  .catch((error) => {
    logger.error('Database connection failed', { error: error.message });
  });

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply HTTP logging middleware
app.use(httpLogger);

// Minimal request logging middleware
app.use((req, res, next) => {
  // Mark request start time for performance tracking
  req._startTime = Date.now();
  next();
});

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20, // limit each IP to 20 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check and status endpoints
    return req.path === '/api/health';
  }
});

// Apply rate limiting to auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Rate limiting for role change endpoint
const roleChangeLimiter = rateLimit({
  windowMs: parseInt(process.env.ROLE_CHANGE_RATE_LIMIT_WINDOW_MS, 10) || 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.ROLE_CHANGE_RATE_LIMIT_MAX, 10) || 3, // limit each IP to 3 requests per windowMs
  message: {
    error: 'Too many role change attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to role change endpoint
app.use('/api/change-role', roleChangeLimiter);

// Routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const noticesRoutes = require('./routes/notices');
const mediaRoutes = require('./routes/media');
const teachersRoutes = require('./routes/teachers');
const contactRoutes = require('./routes/contact');
const mainRoutes = require('./routes/main');

app.use('/api/auth', authRoutes);
app.use('/api', usersRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', mainRoutes);

// Error handling
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Handle non-API routes
// Since frontend is deployed on Netlify, redirect users who access backend URL directly
if (process.env.NODE_ENV === 'production') {
  // Redirect root and non-API routes to Netlify frontend
  app.get('/', (req, res) => {
    res.redirect(FRONTEND_URL);
  });
  
  // For any other non-API route, return info or redirect
  app.get('*', (req, res) => {
    // If it's an API route that doesn't exist, return 404
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.path
      });
    } else {
      res.redirect(FRONTEND_URL);
    }
  });
}

module.exports = app;
