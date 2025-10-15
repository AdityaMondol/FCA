// Enhanced cache implementation with Redis support
// Falls back to in-memory cache if Redis is not available

const { logger } = require('./log');

// Try to initialize Redis client
let redisClient = null;
let useRedis = false;

try {
  // Check if Redis environment variables are set
  if (process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDIS_PORT)) {
    const redis = require('redis');
    
    // Create Redis client based on environment variables
    if (process.env.REDIS_URL) {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });
    } else {
      redisClient = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
      });
    }
    
    // Connect to Redis
    redisClient.connect().then(() => {
      logger.info('💾 Redis cache initialized');
      useRedis = true;
    }).catch((err) => {
      logger.warn('Failed to connect to Redis, falling back to in-memory cache', { error: err.message });
      useRedis = false;
    });
    
    // Handle Redis errors
    redisClient.on('error', (err) => {
      logger.error('Redis error', { error: err.message });
      useRedis = false;
    });
  } else {
    logger.info('Redis not configured, using in-memory cache');
  }
} catch (err) {
  logger.warn('Redis not available, using in-memory cache', { error: err.message });
}

// In-memory cache store (fallback)
const memoryCache = new Map();

// Automatic cache cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Start automatic cleanup for in-memory cache
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [key, data] of memoryCache.entries()) {
    if (data.expiry && data.expiry < now) {
      memoryCache.delete(key);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    logger.debug(`🧹 In-memory cache cleanup: removed ${cleanedCount} expired items`);
  }
}, CLEANUP_INTERVAL);

// Prevent the cleanup interval from keeping the process alive
cleanupInterval.unref();

if (!useRedis) {
  logger.info('💾 In-memory cache initialized');
}

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null if not found/expired
 */
const get = async (key) => {
  try {
    if (useRedis && redisClient) {
      try {
        const value = await redisClient.get(key);
        if (value) {
          return JSON.parse(value);
        }
        return null;
      } catch (err) {
        logger.warn('Redis get error, falling back to in-memory cache', { key, error: err.message });
        useRedis = false;
      }
    }
    
    // Fallback to in-memory cache
    const data = memoryCache.get(key);
    
    if (!data) {
      return null;
    }
    
    // Check if expired
    if (data.expiry && data.expiry < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    
    return data.value;
  } catch (err) {
    logger.error('Cache get error', { key, error: err.message });
    return null;
  }
};

/**
 * Set value in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<void>}
 */
const set = async (key, value, ttl) => {
  try {
    if (useRedis && redisClient) {
      try {
        const stringValue = JSON.stringify(value);
        if (ttl) {
          await redisClient.setEx(key, ttl, stringValue);
        } else {
          await redisClient.set(key, stringValue);
        }
        return;
      } catch (err) {
        logger.warn('Redis set error, falling back to in-memory cache', { key, error: err.message });
        useRedis = false;
      }
    }
    
    // Fallback to in-memory cache
    memoryCache.set(key, {
      value,
      expiry: ttl ? Date.now() + (ttl * 1000) : null
    });
  } catch (err) {
    logger.error('Cache set error', { key, error: err.message });
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<void>}
 */
const del = async (key) => {
  try {
    if (useRedis && redisClient) {
      try {
        await redisClient.del(key);
        return;
      } catch (err) {
        logger.warn('Redis delete error, falling back to in-memory cache', { key, error: err.message });
        useRedis = false;
      }
    }
    
    // Fallback to in-memory cache
    memoryCache.delete(key);
  } catch (err) {
    logger.error('Cache delete error', { key, error: err.message });
  }
};

/**
 * Clear all cache entries
 * @returns {Promise<void>}
 */
const clear = async () => {
  try {
    if (useRedis && redisClient) {
      try {
        await redisClient.flushAll();
        logger.info('🧹 Redis cache cleared');
        return;
      } catch (err) {
        logger.warn('Redis clear error, falling back to in-memory cache', { error: err.message });
        useRedis = false;
      }
    }
    
    // Fallback to in-memory cache
    memoryCache.clear();
    logger.info('🧹 In-memory cache cleared');
  } catch (err) {
    logger.error('Cache clear error', { error: err.message });
  }
};

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
const stats = async () => {
  try {
    if (useRedis && redisClient) {
      try {
        const info = await redisClient.info();
        return {
          type: 'redis',
          info
        };
      } catch (err) {
        logger.warn('Redis stats error, falling back to in-memory cache stats', { error: err.message });
        useRedis = false;
      }
    }
    
    // Fallback to in-memory cache stats
    let expiredCount = 0;
    const now = Date.now();
    
    for (const [key, data] of memoryCache.entries()) {
      if (data.expiry && data.expiry < now) {
        expiredCount++;
      }
    }
    
    return {
      type: 'memory',
      size: memoryCache.size,
      expired: expiredCount,
      active: memoryCache.size - expiredCount
    };
  } catch (err) {
    logger.error('Cache stats error', { error: err.message });
    return {
      type: 'unknown',
      error: err.message
    };
  }
};

module.exports = {
  get,
  set,
  del,
  clear,
  stats
};