// Enhanced authentication utilities
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AppError, ERROR_CODES } = require('./error');
const { logger } = require('./log');

// JWT Configuration - Removed fallback secret for security
const JWT_SECRET = process.env.JWT_SECRET; // Removed fallback for security
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Session Configuration
const SESSION_CONFIG = {
  maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
  refreshTokenMaxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Validate JWT secret is provided
if (!JWT_SECRET) {
  logger.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// Generate JWT token
const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    logger.error('Error generating JWT token', { error: error.message });
    throw new AppError('Failed to generate authentication token', ERROR_CODES.SERVER_ERROR);
  }
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  } catch (error) {
    logger.error('Error generating refresh token', { error: error.message });
    throw new AppError('Failed to generate refresh token', ERROR_CODES.SERVER_ERROR);
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', ERROR_CODES.AUTH_REQUIRED, 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', ERROR_CODES.AUTH_REQUIRED, 401);
    } else {
      logger.error('Error verifying token', { error: error.message });
      throw new AppError('Failed to verify token', ERROR_CODES.SERVER_ERROR);
    }
  }
};

// Hash password
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    logger.error('Error hashing password', { error: error.message });
    throw new AppError('Failed to hash password', ERROR_CODES.SERVER_ERROR);
  }
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error comparing passwords', { error: error.message });
    throw new AppError('Failed to compare passwords', ERROR_CODES.SERVER_ERROR);
  }
};

// Permission checking functions
const hasPermission = (user, requiredPermission) => {
  // Implementation would depend on your permission system
  return user && user.role === 'teacher'; // Simplified for now
};

const hasPermissionLevel = (user, requiredRole) => {
  const roleHierarchy = {
    student: 1,
    guardian: 2,
    teacher: 3
  };

  if (!user || !user.role) return false;
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

// Session middleware - Authentication middleware
const sessionMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: ERROR_CODES.AUTH_REQUIRED 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Token verification failed', { error: error.message });
      return res.status(401).json({ 
        error: error.message || 'Invalid or expired token',
        code: ERROR_CODES.AUTH_REQUIRED 
      });
    }
  } catch (error) {
    logger.error('Session middleware error', { error: error.message });
    return res.status(500).json({ 
      error: 'Authentication error',
      code: ERROR_CODES.SERVER_ERROR 
    });
  }
};

// Role middleware - Authorization middleware
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: ERROR_CODES.AUTH_REQUIRED 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied', { 
        userId: req.user.id,
        userRole: req.user.role,
        allowedRoles 
      });
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        code: ERROR_CODES.FORBIDDEN 
      });
    }

    next();
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword,
  hasPermission,
  hasPermissionLevel,
  sessionMiddleware,
  roleMiddleware,
  SESSION_CONFIG
};