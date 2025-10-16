const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
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
const { cacheManager } = require('./utils/cache');
const { 
  cacheMiddleware, 
  rateLimitMiddleware, 
  sessionMiddleware,
  conditionalCacheMiddleware 
} = require('./middleware/cache');
const {
  validateInput,
  securityHeaders,
  auditLog
} = require('./middleware/security');

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

// Initialize Redis cache
cacheManager.connect().catch(err => {
  logger.error('Failed to connect to Redis:', err);
});

const app = express();

// Trust proxy - REQUIRED for Render/Heroku/behind reverse proxy
app.set('trust proxy', 1);

// Enhanced security with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co", "https://fca-3oz1.onrender.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  dnsPrefetchControl: { allow: true },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// Add security headers
app.use(securityHeaders);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'your_supabase_url_here';
const supabaseKey = process.env.SUPABASE_KEY || 'your_supabase_key_here';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be service role key
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Validate Supabase configuration
if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here') {
  logger.error('SUPABASE_URL is not configured properly');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

if (!supabaseKey || supabaseKey === 'your_supabase_key_here') {
  logger.error('SUPABASE_KEY is not configured properly');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Supabase Configuration
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

// Test database connection
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
// Compression middleware for better performance
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// CORS configuration from environment variables
let corsOptions;
if (process.env.CORS_ORIGIN) {
  const origins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  corsOptions = {
    origin: origins,
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400 // Cache preflight for 24 hours
  };
} else {
  // Default CORS configuration
  corsOptions = {
    origin: FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400
  };
}

app.use(cors(corsOptions));

// Body parsing middleware with security limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(sessionMiddleware);

// Apply HTTP logging middleware
app.use(httpLogger);

// Input validation middleware (security check)
app.use(validateInput);

// Request sanitization middleware
app.use((req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  
  // Sanitize body parameters
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  
  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  
  next();
});

// Request validation middleware
app.use((req, res, next) => {
  // Check for excessively long URLs
  if (req.url.length > 2048) {
    return res.status(414).json({ error: 'Request URI too long' });
  }
  
  // Check for excessively large headers
  const headerSize = JSON.stringify(req.headers).length;
  if (headerSize > 8192) {
    return res.status(431).json({ error: 'Request header fields too large' });
  }
  
  next();
});

// Rate limiting configuration from environment variables
const authRateLimitWindowMs = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 minutes
const authRateLimitMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20;

const roleChangeRateLimitWindowMs = parseInt(process.env.ROLE_CHANGE_RATE_LIMIT_WINDOW_MS, 10) || 60 * 60 * 1000; // 1 hour
const roleChangeRateLimitMax = parseInt(process.env.ROLE_CHANGE_RATE_LIMIT_MAX, 10) || 3;

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: authRateLimitWindowMs,
  max: authRateLimitMax,
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
  windowMs: roleChangeRateLimitWindowMs,
  max: roleChangeRateLimitMax,
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
const mfaRoutes = require('./routes/mfa');
const analyticsRoutes = require('./routes/analytics');
const realtimeRoutes = require('./routes/realtime');
const searchRoutes = require('./routes/search');
const mainRoutes = require('./routes/main');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', mainRoutes);

// Error handling
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Handle non-API routes
// Since frontend is deployed on Vercel, redirect users who access backend URL directly
if (process.env.NODE_ENV === 'production') {
  // Redirect root and non-API routes to Vercel frontend
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