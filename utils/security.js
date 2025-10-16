const crypto = require('crypto');
const { logger } = require('./log');

class SecurityManager {
  constructor() {
    this.suspiciousPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|onerror|onload)\b)/gi,
      /(<script|<iframe|<object|<embed|javascript:|on\w+\s*=)/gi,
      /(%27)|(\')|(--)|(;)|(\/\*)|(\*\/)/gi
    ];
  }

  // Detect SQL injection attempts
  detectSQLInjection(input) {
    if (typeof input !== 'string') return false;
    
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(--)|(;)|(\/\*)|(\*\/)/gi,
      /(')|(")/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Detect XSS attempts
  detectXSS(input) {
    if (typeof input !== 'string') return false;
    
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*onerror/gi,
      /<svg[^>]*onload/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Detect path traversal attempts
  detectPathTraversal(input) {
    if (typeof input !== 'string') return false;
    
    const pathTraversalPatterns = [
      /\.\.\//g,
      /\.\.\\/g,
      /%2e%2e\//gi,
      /\.\.%2f/gi
    ];

    return pathTraversalPatterns.some(pattern => pattern.test(input));
  }

  // Comprehensive input validation
  validateInput(input, type = 'string') {
    const threats = [];

    if (this.detectSQLInjection(input)) {
      threats.push('SQL_INJECTION');
    }

    if (this.detectXSS(input)) {
      threats.push('XSS');
    }

    if (this.detectPathTraversal(input)) {
      threats.push('PATH_TRAVERSAL');
    }

    return {
      isSafe: threats.length === 0,
      threats
    };
  }

  // Generate CSRF token
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Verify CSRF token
  verifyCSRFToken(token, storedToken) {
    if (!token || !storedToken) return false;
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(storedToken)
    );
  }

  // Hash sensitive data
  hashData(data, algorithm = 'sha256') {
    return crypto
      .createHash(algorithm)
      .update(data)
      .digest('hex');
  }

  // Generate random token
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Encrypt data
  encryptData(data, key) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Encryption error:', error);
      return null;
    }
  }

  // Decrypt data
  decryptData(encryptedData, key) {
    try {
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
      
      let decrypted = decipher.update(parts[1], 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      return null;
    }
  }

  // Sanitize file path
  sanitizeFilePath(filePath) {
    // Remove null bytes
    let sanitized = filePath.replace(/\0/g, '');
    
    // Remove path traversal attempts
    sanitized = sanitized.replace(/\.\.\//g, '');
    sanitized = sanitized.replace(/\.\.\\/g, '');
    
    // Remove leading slashes
    sanitized = sanitized.replace(/^\/+/, '');
    
    return sanitized;
  }

  // Validate file upload
  validateFileUpload(file, allowedMimes = [], maxSize = 5 * 1024 * 1024) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
    }

    // Check MIME type
    if (allowedMimes.length > 0 && !allowedMimes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    // Check file extension
    const ext = file.originalname.split('.').pop().toLowerCase();
    const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar'];
    if (dangerousExtensions.includes(ext)) {
      errors.push(`File extension .${ext} is not allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Rate limit check (simplified - use Redis for production)
  checkRateLimit(key, limit, window) {
    // This is a placeholder - implement with Redis in production
    return {
      allowed: true,
      remaining: limit
    };
  }

  // Generate security headers
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  // Audit log
  auditLog(action, userId, details = {}) {
    logger.info(`AUDIT: ${action}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // Check password strength
  checkPasswordStrength(password) {
    const strength = {
      score: 0,
      feedback: []
    };

    if (password.length >= 8) strength.score++;
    else strength.feedback.push('Password should be at least 8 characters');

    if (password.length >= 12) strength.score++;
    else strength.feedback.push('Password should be at least 12 characters for better security');

    if (/[a-z]/.test(password)) strength.score++;
    else strength.feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) strength.score++;
    else strength.feedback.push('Add uppercase letters');

    if (/\d/.test(password)) strength.score++;
    else strength.feedback.push('Add numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength.score++;
    else strength.feedback.push('Add special characters');

    return {
      score: strength.score,
      strength: strength.score <= 2 ? 'weak' : strength.score <= 4 ? 'medium' : 'strong',
      feedback: strength.feedback
    };
  }
}

const securityManager = new SecurityManager();

module.exports = {
  securityManager,
  SecurityManager
};
