
// Simple in-memory cache implementation
// No external dependencies - lightweight and fast

const { logger } = require('./log');

// In-memory cache store
const cache = new Map();

// Automatic cache cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Start automatic cleanup
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [key, data] of cache.entries()) {
    if (data.expiry && data.expiry < now) {
      cache.delete(key);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    logger.debug(`🧹 Cache cleanup: removed ${cleanedCount} expired items`);
  }
}, CLEANUP_INTERVAL);

// Prevent the cleanup interval from keeping the process alive
cleanupInterval.unref();

logger.info('💾 In-memory cache initialized');

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null if not found/expired
 */
const get = async (key) => {
  try {
    const data = cache.get(key);
    
    if (!data) {
      return null;
    }
    
    // Check if expired
    if (data.expiry && data.expiry < Date.now()) {
      cache.delete(key);
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
    cache.set(key, {
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
    cache.delete(key);
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
    cache.clear();
    logger.info('🧹 Cache cleared');
  } catch (err) {
    logger.error('Cache clear error', { error: err.message });
  }
};

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
const stats = () => {
  let expiredCount = 0;
  const now = Date.now();
  
  for (const [key, data] of cache.entries()) {
    if (data.expiry && data.expiry < now) {
      expiredCount++;
    }
  }
  
  return {
    size: cache.size,
    expired: expiredCount,
    active: cache.size - expiredCount
  };
};

module.exports = {
  get,
  set,
  del,
  clear,
  stats
};
