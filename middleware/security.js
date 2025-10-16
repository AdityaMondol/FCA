const { securityManager } = require('../utils/security');
const { logger } = require('../utils/log');

// Input validation middleware
const validateInput = (req, res, next) => {
  const checkValue = (value) => {
    if (typeof value === 'string') {
      const validation = securityManager.validateInput(value);
      if (!validation.isSafe) {
        logger.warn('Suspicious input detected', {
          threats: validation.threats,
          ip: req.ip,
          path: req.path
        });
        return false;
      }
    } else if (typeof value === 'object' && value !== null) {
      return Object.values(value).every(checkValue);
    }
    return true;
  };

  // Check query parameters
  if (req.query && !checkValue(req.query)) {
    return res.status(400).json({
      error: 'Invalid input detected',
      message: 'Your input contains potentially malicious content'
    });
  }

  // Check body parameters
  if (req.body && !checkValue(req.body)) {
    return res.status(400).json({
      error: 'Invalid input detected',
      message: 'Your input contains potentially malicious content'
    });
  }

  // Check URL parameters
  if (req.params && !checkValue(req.params)) {
    return res.status(400).json({
      error: 'Invalid input detected',
      message: 'Your input contains potentially malicious content'
    });
  }

  next();
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Generate CSRF token for GET requests
  if (req.method === 'GET') {
    const token = securityManager.generateCSRFToken();
    req.csrfToken = token;
    res.setHeader('X-CSRF-Token', token);
    return next();
  }

  // Verify CSRF token for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body?.csrfToken;
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken) {
      logger.warn('CSRF token missing', { ip: req.ip, path: req.path });
      return res.status(403).json({
        error: 'CSRF token missing or invalid'
      });
    }

    try {
      if (!securityManager.verifyCSRFToken(token, sessionToken)) {
        logger.warn('CSRF token verification failed', { ip: req.ip });
        return res.status(403).json({
          error: 'CSRF token verification failed'
        });
      }
    } catch (error) {
      logger.error('CSRF verification error:', error);
      return res.status(403).json({
        error: 'CSRF token verification failed'
      });
    }
  }

  next();
};

// File upload validation middleware
const validateFileUpload = (allowedMimes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const validation = securityManager.validateFileUpload(req.file, allowedMimes, maxSize);

    if (!validation.isValid) {
      logger.warn('File upload validation failed', {
        errors: validation.errors,
        ip: req.ip
      });
      return res.status(400).json({
        error: 'File upload validation failed',
        errors: validation.errors
      });
    }

    // Sanitize filename
    req.file.originalname = securityManager.sanitizeFilePath(req.file.originalname);

    next();
  };
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  const headers = securityManager.getSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
};

// Rate limiting middleware (enhanced)
const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests',
    keyGenerator = (req) => req.ip,
    skip = () => false
  } = options;

  const store = new Map();

  return (req, res, next) => {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!store.has(key)) {
      store.set(key, []);
    }

    const requests = store.get(key).filter(time => time > windowStart);
    requests.push(now);
    store.set(key, requests);

    const remaining = Math.max(0, max - requests.length);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    if (requests.length > max) {
      logger.warn('Rate limit exceeded', {
        ip: key,
        requests: requests.length,
        limit: max
      });

      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    next();
  };
};

// Request size limit middleware
const requestSizeLimit = (maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        req.connection.destroy();
        logger.warn('Request size limit exceeded', {
          ip: req.ip,
          size,
          limit: maxSize
        });
      }
    });

    next();
  };
};

// Audit logging middleware
const auditLog = (action) => {
  return (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        securityManager.auditLog(action, req.user?.id || 'anonymous', {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  validateInput,
  csrfProtection,
  validateFileUpload,
  securityHeaders,
  rateLimit,
  requestSizeLimit,
  auditLog
};
