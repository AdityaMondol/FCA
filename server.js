const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
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
const { logger, httpLogger, errorLogger } = require('./utils/log');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security enhancements
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development_only';
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'fallback_secret_key_for_development_only') {
  logger.warn('WARNING: Using fallback JWT secret in production. Please set JWT_SECRET in environment variables.');
}

// Add security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Add startup logging
logger.info('🚀 Farid Cadet Academy Backend Server Starting', {
  port: PORT,
  environment: process.env.NODE_ENV || 'development',
  nodeVersion: process.version
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'your_supabase_url_here';
const supabaseKey = process.env.SUPABASE_KEY || 'your_supabase_key_here';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be service role key
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

logger.info('🔐 Supabase Configuration', {
  url: supabaseUrl.substring(0, 30) + '...',
  frontendUrl: FRONTEND_URL
});

if (!supabaseServiceRoleKey) {
  logger.error('❌ SUPABASE_SERVICE_ROLE_KEY is NOT set. Admin operations (like delete account) will fail.');
} else if (supabaseServiceRoleKey === supabaseKey) {
  logger.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY appears to be the anon key. Please set the Service Role key for admin operations.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
// Admin client with service role key - bypasses RLS for administrative operations
const supabaseAdmin = supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

// Test database connection
logger.info('🔌 Testing database connection...');
supabase
  .from('users')
  .select('count')
  .then(({ data, error }) => {
    if (error) {
      logger.error('❌ Database connection failed', { error: error.message });
    } else {
      logger.info('✅ Database connection successful');
    }
  });

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Local backend
    'https://farid-cadet.netlify.app', // Production frontend
    FRONTEND_URL
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply HTTP logging middleware
app.use(httpLogger);

// Request logging middleware
app.use((req, res, next) => {
  const userAgent = req.get('User-Agent') || 'Unknown';
  const origin = req.get('Origin') || 'Direct';
  
  // Log additional details for better debugging
  logger.debug('📥 Request received', {
    method: req.method,
    path: req.path,
    origin,
    userAgent: userAgent.substring(0, 50) + (userAgent.length > 50 ? '...' : '')
  });
  
  // Log request body for POST/PUT requests (limit size for readability)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body && Object.keys(req.body).length > 0) {
    const bodyKeys = Object.keys(req.body);
    logger.debug('📦 Request body', {
      method: req.method,
      path: req.path,
      keys: bodyKeys,
      bodySize: JSON.stringify(req.body).length
    });
  }
  
  // Log query parameters if present
  if (Object.keys(req.query).length > 0) {
    logger.debug('🔍 Query parameters', {
      method: req.method,
      path: req.path,
      queryKeys: Object.keys(req.query)
    });
  }
  
  // Mark request start time
  req._startTime = Date.now();
  next();
});

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Rate limiting for role change endpoint
const roleChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    error: 'Too many role change attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to role change endpoint
app.use('/api/change-role', roleChangeLimiter);

// Configure multer for file uploads with enhanced options
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: FILE_SIZE_LIMITS.media }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

// Enhanced profile photo upload with image processing
const uploadProfilePhoto = uploadMiddlewares.profilePhoto.single('profile_photo');

// Enhanced media upload with processing
const uploadMedia = uploadMiddlewares.media.single('file');

// Enhanced authorization middleware for role-based access control
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('Authentication required', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermission(req.user.role, allowedRoles)) {
      logger.warn('Insufficient permissions', {
        path: req.path,
        method: req.method,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        userId: req.user.id
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Enhanced input validation middleware
const validateInput = (req, res, next) => {
  // Sanitize all input first
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  
  // Check for potentially malicious input
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript URLs
    /on\w+\s*=/gi, // Event handlers
    /data:/gi, // Data URLs
    /vbscript:/gi, // VBScript
    /expression\(/gi // CSS expressions
  ];
  
  // Additional validation for SQL injection patterns
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH)\b)/gi,
    /(;|\bOR\b|\bAND\b).*?=.*?/gi
  ];
  
  const checkObject = (obj) => {
    if (typeof obj === 'string') {
      // Check for malicious patterns
      for (const pattern of maliciousPatterns) {
        if (pattern.test(obj)) {
          logger.warn('Malicious input detected', {
            input: obj.substring(0, 100) + (obj.length > 100 ? '...' : ''),
            pattern: pattern.toString()
          });
          return false;
        }
      }
      
      // Check for SQL injection patterns
      for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(obj)) {
          logger.warn('SQL injection pattern detected', {
            input: obj.substring(0, 100) + (obj.length > 100 ? '...' : ''),
            pattern: pattern.toString()
          });
          return false;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (!checkObject(obj[key])) {
          return false;
        }
      }
    }
    return true;
  };
  
  if (!checkObject(req.body) || !checkObject(req.query) || !checkObject(req.params)) {
    logger.warn('Invalid input detected', {
      path: req.path,
      method: req.method
    });
    return res.status(400).json({ error: 'Invalid input detected' });
  }
  
  next();
};

// Enhanced Supabase Auth middleware with session management
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  logger.debug('🔐 Auth attempt', {
    path: req.path,
    method: req.method,
    tokenProvided: !!token
  });

  if (!token) {
    logger.warn('❌ Auth failed - No token provided', {
      path: req.path,
      method: req.method
    });
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify JWT token first
    const { valid, payload, error } = verifyToken(token);
    
    if (!valid) {
      logger.warn('❌ Auth failed - Invalid token', {
        path: req.path,
        method: req.method,
        error
      });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify Supabase JWT token
    const { data: { user }, error: supabaseError } = await supabase.auth.getUser(token);
    
    if (supabaseError || !user) {
      logger.warn('❌ Auth failed - Supabase verification failed', {
        path: req.path,
        method: req.method,
        error: supabaseError?.message || 'No user found'
      });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Get user profile with role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.warn('⚠️ Profile fetch error', {
        userId: user.id,
        error: profileError.message
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: userProfile?.role || 'student',
      ...userProfile,
      ...payload // Include JWT payload
    };
    
    logger.info('✅ Auth successful', {
      path: req.path,
      method: req.method,
      userEmail: user.email,
      userRole: userProfile?.role || 'student'
    });
    next();
  } catch (error) {
    logger.error('❌ Auth error', {
      path: req.path,
      method: req.method,
      error: error.message
    });
    return res.status(403).json({ error: 'Authentication failed' });
  }
};

// Apply input validation to all routes
app.use(validateInput);

// Apply error logging middleware
app.use(errorLogger);

// ============= API ROUTES =============

// Health check endpoint
app.get('/api/health', (req, res) => {
  logger.info('Health check endpoint called');
  res.json({ 
    status: 'healthy',
    message: 'Farid Cadet Academy Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  logger.info('Test endpoint called');
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Test Supabase connection endpoint
app.get('/api/test/supabase', async (req, res) => {
  try {
    // Test 1: Check if we can query users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count');
    
    // Test 2: Check if we can query notices table
    const { data: notices, error: noticesError } = await supabase
      .from('notices')
      .select('count');
    
    // Test 3: Check if we can query media table
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('count');

    res.json({
      success: true,
      supabaseUrl: supabaseUrl.substring(0, 30) + '...',
      tests: {
        usersTable: usersError ? '❌ Error: ' + usersError.message : '✅ Connected',
        noticesTable: noticesError ? '❌ Error: ' + noticesError.message : '✅ Connected',
        mediaTable: mediaError ? '❌ Error: ' + mediaError.message : '✅ Connected'
      },
      note: 'This app uses custom JWT authentication, not Supabase Auth. No verification emails will be sent.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      note: 'Check your SUPABASE_URL and SUPABASE_KEY in .env file'
    });
  }
});

// Get academy information
app.get('/api/academy-info', (req, res) => {
  res.json({
    name: "Farid Cadet Academy",
    location: "Walton More, Mymensingh road, Tangail Sadar, Tangail",
    objective: "To prepare students for competitive entrance examinations into cadet colleges in Bangladesh",
    targetLevel: "Students from Class 4 to Class 6",
    academicOfferings: [
      "Bengali (Bangla)",
      "English",
      "Mathematics",
      "General Knowledge"
    ],
    classSchedule: [
      "Day Coaching",
      "Night Coaching",
      "Residential"
    ],
    operationalHistory: "The academy has been active since at least 2022",
    notableAchievement: {
      year: 2023,
      candidatesPrepared: 18,
      applicants: 16
    },
    faculty: "Qualified educators",
    admissionStatus: "Admissions are ongoing",
    contactInfo: [
      "01715-000090",
      "01928-268993",
      "01674-455000"
    ],
    branding: "Bold visual branding with dominant use of red and yellow colors"
  });
});

// Get all notices (requires authentication)
app.get('/api/notices', authenticateToken, async (req, res) => {
  try {
    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('notices')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

// Get all media items with pagination
app.get('/api/media', async (req, res) => {
  try {
    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('media')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Submit contact form with proper validation
app.post('/api/contact', async (req, res) => {
  try {
    // Validate input
    const validation = validate('contactForm', req.body);
    if (!validation.isValid) {
      logger.warn('Contact form validation failed', {
        errors: validation.errors
      });
      return res.status(400).json({ error: validation.errors[0] });
    }

    const { name, email, phone, message } = req.body;

    const startTime = Date.now();
    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          message,
          created_at: new Date().toISOString()
        }
      ]);
    
    const duration = Date.now() - startTime;
    logger.database('INSERT', 'contacts', duration, error);

    if (error) throw error;

    logger.info('Contact form submitted successfully', {
      email,
      name
    });

    res.json({ success: true, message: 'Contact form submitted successfully' });
  } catch (error) {
    logger.error('Error submitting contact form', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// ============= AUTHENTICATION ROUTES =============

// Login (using Supabase Auth) with proper validation
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info('🔐 Login attempt', { email });

    // Validate input
    const validation = validate('login', req.body);
    if (!validation.isValid) {
      logger.warn('Login validation failed', {
        email,
        errors: validation.errors
      });
      return res.status(400).json({ error: validation.errors[0] });
    }

    // Use Supabase Auth to sign in
    const startTime = Date.now();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    const duration = Date.now() - startTime;
    logger.auth('LOGIN_ATTEMPT', null, email, !authError, authError);

    if (authError) {
      logger.warn('Login failed', {
        email,
        error: authError.message
      });
      // Provide more specific error messages
      if (authError.message.includes('Invalid login credentials')) {
        return res.status(401).json({ error: 'Invalid email or password' });
      } else if (authError.message.includes('Email not confirmed')) {
        return res.status(401).json({ error: 'Please verify your email address before logging in' });
      } else {
        return res.status(401).json({ error: authError.message });
      }
    }

    // Get user profile from public.users table
    const profileStartTime = Date.now();
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    const profileDuration = Date.now() - profileStartTime;
    logger.database('SELECT', 'users', profileDuration, profileError);

    if (profileError) {
      logger.warn('Profile fetch error', {
        email,
        userId: authData.user.id,
        error: profileError.message
      });
    }

    logger.info('✅ Login successful', {
      email,
      userId: authData.user.id,
      userRole: userProfile?.role || 'student'
    });
    
    res.json({
      session: authData.session,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: userProfile?.name || '',
        role: userProfile?.role || 'student',
        phone: userProfile?.phone,
        profile_photo_url: userProfile?.profile_photo_url
      }
    });
  } catch (error) {
    logger.error('Error logging in', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
});

// Register (using Supabase Auth with email verification) with proper validation
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, phone, teacherCode } = req.body;

    // Validate input
    const validation = validate('registration', req.body);
    if (!validation.isValid) {
      logger.warn('Registration validation failed', {
        email,
        errors: validation.errors
      });
      return res.status(400).json({ error: validation.errors[0] });
    }

    // Validate teacher code if role is teacher
    if (role === 'teacher') {
      logger.info('Validating teacher code', { email, role });
      
      const codeStartTime = Date.now();
      const { data: codeData, error: codeError } = await supabase
        .from('teacher_verification_codes')
        .select('*')
        .eq('code', teacherCode)
        .eq('is_active', true)
        .single();
      
      const codeDuration = Date.now() - codeStartTime;
      logger.database('SELECT', 'teacher_verification_codes', codeDuration, codeError);

      if (codeError || !codeData) {
        logger.warn('Invalid teacher verification code', {
          email,
          teacherCode: teacherCode ? 'provided' : 'missing'
        });
        return res.status(400).json({ error: 'Invalid teacher verification code. Please contact the school administration.' });
      }
      
      // Check if code has usage limit and if it's exceeded
      if (codeData.max_usage && codeData.usage_count >= codeData.max_usage) {
        logger.warn('Teacher verification code expired', {
          email,
          codeId: codeData.id,
          usageCount: codeData.usage_count,
          maxUsage: codeData.max_usage
        });
        return res.status(400).json({ error: 'Teacher verification code has expired. Please contact the school administration for a new code.' });
      }
    }

    // Use Supabase Auth to create user (will send verification email)
    logger.info('Creating user with Supabase Auth', { email, role });
    
    const authStartTime = Date.now();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          phone: phone || null
        },
        emailRedirectTo: FRONTEND_URL
      }
    });
    
    const authDuration = Date.now() - authStartTime;
    logger.auth('REGISTER', authData?.user?.id, email, !authError, authError);

    if (authError) {
      logger.error('Supabase Auth registration failed', {
        email,
        error: authError.message
      });
      // Provide more specific error messages
      if (authError.message.includes('already been registered')) {
        return res.status(400).json({ error: 'This email is already registered. Please use a different email or login.' });
      } else {
        return res.status(400).json({ error: authError.message });
      }
    }

    // Create or update user profile in public.users table (using upsert)
    logger.info('Creating user profile', { 
      email, 
      userId: authData.user.id,
      role 
    });
    
    const profileStartTime = Date.now();
    const { error: profileError } = await supabase
      .from('users')
      .upsert([
        {
          id: authData.user.id,
          email,
          name,
          role,
          phone: phone || null,
          verification_code_used: role === 'teacher' ? teacherCode : null
        }
      ], {
        // Use a single unique column for conflict handling to match the DB constraint
        onConflict: 'email'
      });
    
    const profileDuration = Date.now() - profileStartTime;
    logger.database('UPSERT', 'users', profileDuration, profileError);

    if (profileError) {
      logger.error('Error creating user profile', {
        email,
        userId: authData.user.id,
        error: profileError.message
      });
      // Don't fail registration if profile creation fails
    }

    // If teacher, create teacher profile entry and update code usage
    if (role === 'teacher') {
      logger.info('Creating teacher profile', { 
        email, 
        userId: authData.user.id
      });
      
      const teacherProfileStartTime = Date.now();
      const { error: teacherProfileError } = await supabase
        .from('teacher_profiles')
        .insert([
          {
            user_id: authData.user.id,
            display_order: 0
          }
        ]);
      
      const teacherProfileDuration = Date.now() - teacherProfileStartTime;
      logger.database('INSERT', 'teacher_profiles', teacherProfileDuration, teacherProfileError);

      if (teacherProfileError) {
        logger.error('Error creating teacher profile', {
          email,
          userId: authData.user.id,
          error: teacherProfileError.message
        });
      }
      
      // Update teacher code usage count
      const codeUpdateStartTime = Date.now();
      const { error: codeUpdateError } = await supabase
        .from('teacher_verification_codes')
        .update({ usage_count: codeData.usage_count + 1 })
        .eq('code', teacherCode);
      
      const codeUpdateDuration = Date.now() - codeUpdateStartTime;
      logger.database('UPDATE', 'teacher_verification_codes', codeUpdateDuration, codeUpdateError);
        
      if (codeUpdateError) {
        logger.error('Error updating teacher code usage', {
          email,
          code: teacherCode,
          error: codeUpdateError.message
        });
      }
    }

    logger.info('✅ Registration successful', {
      email,
      userId: authData.user.id,
      role
    });

    res.json({ 
      success: true, 
      message: 'Registration successful! Please check your email to verify your account.',
      emailSent: true
    });
  } catch (error) {
    logger.error('Error registering user', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Registration failed. Please try again later.' });
  }
});

// Get teachers for public display with caching
let teachersCache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes cache
};

app.get('/api/teachers', async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (teachersCache.data && (now - teachersCache.timestamp) < teachersCache.ttl) {
      console.log('✅ Returning cached teachers data');
      return res.json(teachersCache.data);
    }
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        description,
        profile_photo_url,
        teacher_profiles (
          subject_specialization,
          experience_years,
          education_background,
          achievements,
          display_order
        )
      `)
      .eq('role', 'teacher')
      .eq('is_active', true)
      .order('teacher_profiles.display_order', { ascending: true });

    if (error) {
      console.error('Error fetching teachers:', error);
      return res.status(500).json({ error: 'Failed to fetch teachers' });
    }

    // Transform data to flatten teacher profiles
    const teachers = data.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      description: teacher.description,
      profile_photo_url: teacher.profile_photo_url,
      subject_specialization: teacher.teacher_profiles?.[0]?.subject_specialization,
      experience_years: teacher.teacher_profiles?.[0]?.experience_years,
      education_background: teacher.teacher_profiles?.[0]?.education_background,
      achievements: teacher.teacher_profiles?.[0]?.achievements
    }));

    // Update cache
    teachersCache.data = teachers;
    teachersCache.timestamp = now;
    
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Get user profile (protected)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        description,
        profile_photo_url,
        teacher_profiles (
          subject_specialization,
          experience_years,
          education_background,
          achievements
        )
      `)
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Flatten teacher profile data
    const profile = {
      ...userData,
      subject_specialization: userData.teacher_profiles?.[0]?.subject_specialization || '',
      experience_years: userData.teacher_profiles?.[0]?.experience_years || '',
      education_background: userData.teacher_profiles?.[0]?.education_background || '',
      achievements: userData.teacher_profiles?.[0]?.achievements || ''
    };

    delete profile.teacher_profiles;
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (protected) with enhanced file upload
app.put('/api/profile', authenticateToken, uploadProfilePhoto, async (req, res) => {
  try {
    // Validate input
    const validation = validate('profileUpdate', req.body);
    if (!validation.isValid) {
      logger.warn('Profile update validation failed', {
        userId: req.user.id,
        errors: validation.errors
      });
      return res.status(400).json({ error: validation.errors[0] });
    }

    const {
      name,
      phone,
      description,
      subject_specialization,
      experience_years,
      education_background,
      achievements
    } = req.body;

    let profile_photo_url = null;

    // Handle file upload if present
    if (req.file) {
      logger.info('Processing profile photo upload', {
        userId: req.user.id,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });
      
      // Process image for optimization
      const processStartTime = Date.now();
      const processedImage = await processImage(req.file.buffer, IMAGE_PROCESSING_OPTIONS.profilePhotos);
      const processDuration = Date.now() - processStartTime;
      
      logger.file('PROCESS', req.file.originalname, processDuration, 
        processedImage.success ? null : new Error(processedImage.error));
      
      if (!processedImage.success) {
        logger.error('Image processing error', {
          userId: req.user.id,
          error: processedImage.error
        });
        return res.status(400).json({ error: 'Failed to process profile photo' });
      }

      // Generate file name
      const fileName = generateFileName(req.file.originalname, `profile_${req.user.id}_`);
      
      // Upload to Supabase Storage
      const uploadStartTime = Date.now();
      const uploadResult = await uploadToSupabase(
        supabase, 
        'profile-photos', 
        fileName, 
        processedImage.buffer, 
        req.file.mimetype
      );
      const uploadDuration = Date.now() - uploadStartTime;
      
      logger.file('UPLOAD', fileName, uploadDuration, 
        uploadResult.success ? null : new Error(uploadResult.error));

      if (!uploadResult.success) {
        logger.error('Upload error', {
          userId: req.user.id,
          error: uploadResult.error
        });
        return res.status(400).json({ error: 'Failed to upload profile photo' });
      }

      profile_photo_url = uploadResult.url;
      logger.info('Profile photo uploaded successfully', {
        userId: req.user.id,
        url: profile_photo_url
      });
    }

    // Update user table
    const updateData = {
      name,
      phone,
      description
    };

    if (profile_photo_url) {
      updateData.profile_photo_url = profile_photo_url;
    }

    logger.info('Updating user profile', {
      userId: req.user.id,
      fields: Object.keys(updateData)
    });
    
    const updateStartTime = Date.now();
    const { error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id);
    
    const updateDuration = Date.now() - updateStartTime;
    logger.database('UPDATE', 'users', updateDuration, userError);

    if (userError) {
      logger.error('User update error', {
        userId: req.user.id,
        error: userError.message
      });
      return res.status(400).json({ error: 'Failed to update profile' });
    }

    // Update teacher profile if user is a teacher
    if (req.user.role === 'teacher') {
      const teacherProfileData = {
        subject_specialization,
        experience_years: experience_years ? parseInt(experience_years) : null,
        education_background,
        achievements
      };

      logger.info('Updating teacher profile', {
        userId: req.user.id
      });
      
      const teacherProfileStartTime = Date.now();
      const { error: profileError } = await supabase
        .from('teacher_profiles')
        .upsert({
          user_id: req.user.id,
          ...teacherProfileData
        });
      
      const teacherProfileDuration = Date.now() - teacherProfileStartTime;
      logger.database('UPSERT', 'teacher_profiles', teacherProfileDuration, profileError);

      if (profileError) {
        logger.error('Teacher profile update error', {
          userId: req.user.id,
          error: profileError.message
        });
        return res.status(400).json({ error: 'Failed to update teacher profile' });
      }
    }

    // Clear profile cache
    const cacheKey = `profile_${req.user.id}`;
    if (typeof profileCache !== 'undefined') {
      profileCache.delete(cacheKey);
    }

    logger.info('✅ Profile updated successfully', {
      userId: req.user.id
    });

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Error updating profile', {
      userId: req.user.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change user role (protected)
app.put('/api/change-role', authenticateToken, async (req, res) => {
  try {
    const { role, teacherCode } = req.body;

    if (!role || !['student', 'guardian', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Validate teacher code if changing to teacher
    if (role === 'teacher') {
      if (!teacherCode) {
        return res.status(400).json({ error: 'Teacher verification code is required' });
      }

      const { data: codeData, error: codeError } = await supabase
        .from('teacher_verification_codes')
        .select('*')
        .eq('code', teacherCode)
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        return res.status(400).json({ error: 'Invalid teacher verification code. Please contact the school administration.' });
      }
      
      // Check if code has usage limit and if it's exceeded
      if (codeData.max_usage && codeData.usage_count >= codeData.max_usage) {
        return res.status(400).json({ error: 'Teacher verification code has expired. Please contact the school administration for a new code.' });
      }
    }

    // Update user role
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        role,
        verification_code_used: role === 'teacher' ? teacherCode : null
      })
      .eq('id', req.user.id);

    if (updateError) {
      console.error('Role update error:', updateError);
      return res.status(400).json({ error: 'Failed to update role. Please try again later.' });
    }

    // If changing to teacher, create teacher profile
    if (role === 'teacher') {
      const { error: profileError } = await supabase
        .from('teacher_profiles')
        .upsert({
          user_id: req.user.id,
          display_order: 0
        });

      if (profileError) {
        console.error('Teacher profile creation error:', profileError);
      }
      
      // Update teacher code usage count
      const { error: codeUpdateError } = await supabase
        .from('teacher_verification_codes')
        .update({ usage_count: codeData.usage_count + 1 })
        .eq('code', teacherCode);
        
      if (codeUpdateError) {
        console.error('Error updating teacher code usage:', codeUpdateError);
      }
    }

    res.json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error changing role:', error);
    res.status(500).json({ error: 'Failed to change role. Please try again later.' });
  }
});

// Delete user account (protected)
app.delete('/api/delete-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🗑️ Starting account deletion for user ID: ${userId}`);

    // Additional security check - require password confirmation for account deletion
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password confirmation required for account deletion' });
    }

    // Verify password before proceeding with deletion
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: password
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid password. Account deletion cancelled.' });
    }

    if (!supabaseAdmin) {
      console.error('❌ Supabase Admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY configuration.');
      return res.status(500).json({ error: 'Server not configured for account deletion. Missing SUPABASE_SERVICE_ROLE_KEY.' });
    }

    // First, verify the user exists using admin client
    console.log(`🔍 Checking if user exists: ${userId}`);
    const { data: userExists, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('id', userId)
      .single();

    if (userCheckError || !userExists) {
      console.error('User not found for deletion:', userCheckError);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`📧 Deleting account for: ${userExists.email} (${userExists.name})`);

    // Delete user data in correct order (respecting foreign key constraints)
    // Using admin client to bypass RLS policies
    
    // 1. Delete teacher profile if exists
    console.log('🔄 Deleting teacher profile...');
    const { error: profileError } = await supabaseAdmin
      .from('teacher_profiles')
      .delete()
      .eq('user_id', userId);
    
    if (profileError) {
      console.error('❌ Teacher profile deletion error:', profileError);
      return res.status(500).json({ 
        error: 'Failed to delete teacher profile', 
        details: profileError.message 
      });
    }
    console.log('✅ Teacher profile deleted (if existed)');

    // 2. Delete notices created by user
    console.log('🔄 Deleting user notices...');
    const { error: noticesError } = await supabaseAdmin
      .from('notices')
      .delete()
      .eq('created_by', userId);
      
    if (noticesError) {
      console.error('❌ Notices deletion error:', noticesError);
      return res.status(500).json({ 
        error: 'Failed to delete notices', 
        details: noticesError.message 
      });
    }
    console.log('✅ User notices deleted');

    // 3. Delete media uploaded by user
    console.log('🔄 Deleting user media...');
    const { error: mediaError } = await supabaseAdmin
      .from('media')
      .delete()
      .eq('uploaded_by', userId);
      
    if (mediaError) {
      console.error('❌ Media deletion error:', mediaError);
      return res.status(500).json({ 
        error: 'Failed to delete media', 
        details: mediaError.message 
      });
    }
    console.log('✅ User media deleted');

    // 4. Delete from custom users table
    console.log('🔄 Deleting from users table...');
    const { error: userDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (userDeleteError) {
      console.error('❌ User table deletion failed:', userDeleteError);
      return res.status(500).json({ 
        error: 'Failed to delete user from users table', 
        details: userDeleteError.message 
      });
    }
    console.log('✅ User deleted from users table');

    // 5. CRITICAL: Delete from Supabase Auth (auth.users) - this is the main account
    console.log('🔄 Deleting from Supabase Auth...');
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('❌ Supabase Auth deletion failed:', authDeleteError);
      return res.status(500).json({ 
        error: 'Failed to delete authentication account', 
        details: authDeleteError.message 
      });
    }
    console.log('✅ User deleted from Supabase Auth (auth.users)');

    console.log('✅✅✅ Account COMPLETELY deleted from all tables');
    res.json({ success: true, message: 'Account permanently deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account', details: error.message });
  }
});

// Test endpoint to check if user still exists (for debugging)
app.get('/api/check-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.json({ exists: false, message: 'User not found' });
    }

    res.json({ 
      exists: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ error: 'Failed to check user' });
  }
});

// ============= PROTECTED ROUTES (Teacher only) =============

// Create notice (Teacher only) with validation
app.post('/api/notices', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    // Validate input
    const validation = validate('noticeCreation', req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors[0] });
    }

    const { title_en, title_bn, content_en, content_bn, priority } = req.body;

    const { data, error } = await supabase
      .from('notices')
      .insert([
        {
          title_en,
          title_bn,
          content_en,
          content_bn,
          priority: priority || 'medium',
          date: new Date().toISOString(),
          created_by: req.user.id
        }
      ]);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

// Upload media (Teacher only)
app.post('/api/media', authenticateToken, authorizeRole('teacher', 'admin'), uploadMedia, async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      logger.warn('Media upload failed - no file provided', {
        userId: req.user.id
      });
      return res.status(400).json({ error: 'File is required' });
    }

    logger.info('Processing media upload', {
      userId: req.user.id,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    // Process image if it's an image file
    let fileBuffer = file.buffer;
    let fileMimeType = file.mimetype;
    
    if (file.mimetype.startsWith('image/')) {
      logger.debug('Processing image file', {
        userId: req.user.id,
        fileName: file.originalname
      });
      
      const processStartTime = Date.now();
      const processedImage = await processImage(file.buffer, IMAGE_PROCESSING_OPTIONS.media);
      const processDuration = Date.now() - processStartTime;
      
      logger.file('PROCESS', file.originalname, processDuration, 
        processedImage.success ? null : new Error(processedImage.error));
      
      if (processedImage.success) {
        fileBuffer = processedImage.buffer;
        // Update mime type if format changed
        if (processedImage.info.format) {
          fileMimeType = `image/${processedImage.info.format}`;
        }
      }
    }

    // Generate file name
    const fileName = generateFileName(file.originalname);
    
    // Upload to Supabase Storage
    const uploadStartTime = Date.now();
    const uploadResult = await uploadToSupabase(
      supabase, 
      'media', 
      fileName, 
      fileBuffer, 
      fileMimeType
    );
    const uploadDuration = Date.now() - uploadStartTime;
    
    logger.file('UPLOAD', fileName, uploadDuration, 
      uploadResult.success ? null : new Error(uploadResult.error));

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    // Save metadata to database
    const fileType = file.mimetype.startsWith('image/') ? 'image' : 
                   file.mimetype.startsWith('video/') ? 'video' : 'other';
                   
    logger.info('Saving media metadata', {
      userId: req.user.id,
      fileName,
      fileType
    });
    
    const dbStartTime = Date.now();
    const { data, error } = await supabase
      .from('media')
      .insert([
        {
          title,
          description,
          url: uploadResult.url,
          type: fileType,
          date: new Date().toISOString(),
          uploaded_by: req.user.id
        }
      ]);
    
    const dbDuration = Date.now() - dbStartTime;
    logger.database('INSERT', 'media', dbDuration, error);

    if (error) throw error;

    // Clear media cache
    if (typeof mediaCache !== 'undefined') {
      mediaCache.data = null;
      mediaCache.timestamp = 0;
    }

    logger.info('✅ Media uploaded successfully', {
      userId: req.user.id,
      mediaId: data?.[0]?.id,
      url: uploadResult.url
    });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error uploading media', {
      userId: req.user.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Delete notice (Teacher only)
app.delete('/api/notices/:id', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

// Delete media (Teacher only)
app.delete('/api/media/:id', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // First get the media item to get the file path
    const { data: mediaItem, error: fetchError } = await supabase
      .from('media')
      .select('url')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch media item: ${fetchError.message}`);
    }

    if (!mediaItem) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    // Extract file name from URL
    const urlParts = mediaItem.url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Delete from Supabase Storage
    const deleteResult = await deleteFromSupabase(supabase, 'media', fileName);
    
    if (!deleteResult.success) {
      console.warn('Failed to delete file from storage:', deleteResult.error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Clear media cache
    if (typeof mediaCache !== 'undefined') {
      mediaCache.data = null;
      mediaCache.timestamp = 0;
    }

    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Get all contact submissions (Teacher only)
app.get('/api/contacts', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// ============= SERVE FRONTEND (Development Only) =============

// Serve frontend for all other routes (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
} else {
  // In production, just return API info for unknown routes
  app.get('*', (req, res) => {
    res.json({ 
      message: 'Farid Cadet Academy API Server', 
      version: '1.0.0',
      frontend: 'Deployed separately on Netlify'
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       Farid Cadet Academy - Server Running                ║
║                                                           ║
║       🌐 Server: http://localhost:${PORT}                    ║
║       📚 Academy: Farid Cadet Academy                     ║
║       📍 Location: Tangail, Bangladesh                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});