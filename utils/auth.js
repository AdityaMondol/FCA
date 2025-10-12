// Enhanced authentication utilities
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development_only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Session configuration
const SESSION_CONFIG = {
  maxConcurrentSessions: 10, // Maximum number of concurrent sessions per user
  sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
  refreshTokenTimeout: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
};

// In-memory session store (lightweight and fast)
const sessionStore = new Map();

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return { valid: true, payload: jwt.verify(token, JWT_SECRET) };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Create session
const createSession = (userId, sessionId) => {
  const session = {
    userId,
    sessionId,
    createdAt: Date.now(),
    lastAccessed: Date.now()
  };
  
  // Store session
  sessionStore.set(sessionId, session);
  
  // Clean up old sessions for this user
  cleanupUserSessions(userId);
  
  return session;
};

// Validate session
const validateSession = (sessionId) => {
  const session = sessionStore.get(sessionId);
  
  if (!session) {
    return { valid: false, error: 'Session not found' };
  }
  
  // Check if session has expired
  if (Date.now() - session.createdAt > SESSION_CONFIG.sessionTimeout) {
    sessionStore.delete(sessionId);
    return { valid: false, error: 'Session expired' };
  }
  
  // Update last accessed time
  session.lastAccessed = Date.now();
  sessionStore.set(sessionId, session);
  
  return { valid: true, session };
};

// Cleanup user sessions
const cleanupUserSessions = (userId) => {
  const userSessions = [];
  
  // Find all sessions for this user
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      userSessions.push({ sessionId, session });
    }
  }
  
  // Sort by creation time (oldest first)
  userSessions.sort((a, b) => a.session.createdAt - b.session.createdAt);
  
  // Remove excess sessions
  if (userSessions.length > SESSION_CONFIG.maxConcurrentSessions) {
    const sessionsToRemove = userSessions.slice(0, userSessions.length - SESSION_CONFIG.maxConcurrentSessions);
    for (const { sessionId } of sessionsToRemove) {
      sessionStore.delete(sessionId);
    }
  }
};

// Invalidate session
const invalidateSession = (sessionId) => {
  sessionStore.delete(sessionId);
};

// Invalidate all user sessions
const invalidateAllUserSessions = (userId) => {
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessionStore.delete(sessionId);
    }
  }
};

// Get active sessions for user
const getUserSessions = (userId) => {
  const sessions = [];
  
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessions.push({
        sessionId,
        createdAt: session.createdAt,
        lastAccessed: session.lastAccessed
      });
    }
  }
  
  return sessions;
};

// Refresh token
const refreshToken = async (refreshToken) => {
  try {
    const { payload } = jwt.verify(refreshToken, JWT_SECRET);
    
    // Check if refresh token is still valid
    if (Date.now() - payload.iat * 1000 > SESSION_CONFIG.refreshTokenTimeout) {
      return { success: false, error: 'Refresh token expired' };
    }
    
    // Generate new tokens
    const newToken = generateToken({ 
      userId: payload.userId, 
      email: payload.email,
      role: payload.role
    });
    
    const newRefreshToken = generateRefreshToken({ 
      userId: payload.userId, 
      email: payload.email,
      role: payload.role
    });
    
    return { 
      success: true, 
      token: newToken, 
      refreshToken: newRefreshToken 
    };
  } catch (error) {
    return { success: false, error: 'Invalid refresh token' };
  }
};

// Role-based access control
const hasPermission = (userRole, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  
  return requiredRoles.includes(userRole);
};

// Permission levels
const PERMISSION_LEVELS = {
  student: 1,
  guardian: 2,
  teacher: 3,
  admin: 4
};

// Check if user has required permission level
const hasPermissionLevel = (userRole, requiredLevel) => {
  const userLevel = PERMISSION_LEVELS[userRole] || 0;
  const requiredLevelValue = PERMISSION_LEVELS[requiredLevel] || 0;
  
  return userLevel >= requiredLevelValue;
};

// Session middleware
const sessionMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const { valid, payload, error } = verifyToken(token);
  
  if (!valid) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
};

// Role-based middleware
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermission(req.user.role, allowedRoles)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Permission level middleware
const permissionLevelMiddleware = (requiredLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermissionLevel(req.user.role, requiredLevel)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
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
  createSession,
  validateSession,
  invalidateSession,
  invalidateAllUserSessions,
  getUserSessions,
  refreshToken,
  hasPermission,
  hasPermissionLevel,
  sessionMiddleware,
  roleMiddleware,
  permissionLevelMiddleware,
  SESSION_CONFIG
};