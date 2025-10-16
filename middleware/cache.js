const { cacheManager, CACHE_KEYS, CACHE_TTL } = require('../utils/cache');
const { logger } = require('../utils/log');

// Cache middleware for API responses
const cacheMiddleware = (ttl = CACHE_TTL.NOTICES, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req) 
        : `api:${req.originalUrl}:${JSON.stringify(req.query)}`;

      // Try to get from cache
      const cachedData = await cacheManager.get(cacheKey);
      
      if (cachedData) {
        logger.debug(`Cache HIT for key: ${cacheKey}`);
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      logger.debug(`Cache MISS for key: ${cacheKey}`);
      res.setHeader('X-Cache', 'MISS');

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function(data) {
        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheManager.set(cacheKey, data, ttl).catch(err => {
            logger.error('Failed to cache response:', err);
          });
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Rate limiting middleware with Redis
const rateLimitMiddleware = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
    keyGenerator = (req) => req.ip,
    skip = () => false
  } = options;

  return async (req, res, next) => {
    if (skip(req)) {
      return next();
    }

    try {
      const key = CACHE_KEYS.RATE_LIMIT(keyGenerator(req), req.route?.path || req.path);
      const window = Math.floor(windowMs / 1000);
      
      const result = await cacheManager.checkRateLimit(key, max, window);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs));

      if (!result.allowed) {
        logger.warn(`Rate limit exceeded for ${keyGenerator(req)}: ${result.current}/${max}`);
        return res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limit middleware error:', error);
      // Allow request on error
      next();
    }
  };
};

// Session middleware with Redis
const sessionMiddleware = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    if (sessionId) {
      const sessionData = await cacheManager.getSession(sessionId);
      if (sessionData) {
        req.session = sessionData;
        req.sessionId = sessionId;
      }
    }

    // Add session helper methods
    req.saveSession = async (data) => {
      if (req.sessionId) {
        await cacheManager.setSession(req.sessionId, data, CACHE_TTL.USER_SESSION);
        req.session = data;
      }
    };

    req.destroySession = async () => {
      if (req.sessionId) {
        await cacheManager.deleteSession(req.sessionId);
        req.session = null;
        req.sessionId = null;
      }
    };

    next();
  } catch (error) {
    logger.error('Session middleware error:', error);
    next();
  }
};

// Cache invalidation middleware
const invalidateCacheMiddleware = (tags = []) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to invalidate cache on successful mutations
    const invalidateOnSuccess = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Invalidate cache tags asynchronously
        Promise.all(tags.map(tag => cacheManager.invalidateTag(tag)))
          .catch(err => logger.error('Cache invalidation error:', err));
      }
      return data;
    };

    res.json = function(data) {
      const result = invalidateOnSuccess(data);
      return originalJson.call(this, result);
    };

    res.send = function(data) {
      invalidateOnSuccess(data);
      return originalSend.call(this, data);
    };

    next();
  };
};

// Conditional caching based on user role
const conditionalCacheMiddleware = (conditions = {}) => {
  return (req, res, next) => {
    const {
      publicTTL = CACHE_TTL.NOTICES,
      privateTTL = 300, // 5 minutes for authenticated users
      adminTTL = 60,    // 1 minute for admins
      keyPrefix = 'api'
    } = conditions;

    // Determine TTL based on user role
    let ttl = publicTTL;
    let keyModifier = 'public';

    if (req.user) {
      if (req.user.role === 'teacher') {
        ttl = adminTTL;
        keyModifier = 'admin';
      } else {
        ttl = privateTTL;
        keyModifier = 'user';
      }
    }

    // Generate role-specific cache key
    const keyGenerator = (req) => {
      return `${keyPrefix}:${keyModifier}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    };

    return cacheMiddleware(ttl, keyGenerator)(req, res, next);
  };
};

module.exports = {
  cacheMiddleware,
  rateLimitMiddleware,
  sessionMiddleware,
  invalidateCacheMiddleware,
  conditionalCacheMiddleware
};