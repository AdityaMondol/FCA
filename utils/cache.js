
const redis = require('redis');
const { logger } = require('./log');

// In-memory fallback cache when Redis is unavailable
const memoryCache = new Map();

let redisAvailable = false;
let client = null;

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Only attempt Redis connection if explicitly configured
if (process.env.REDIS_URL) {
  client = redis.createClient({
    url: redisUrl
  });

  client.on('error', () => {
    // Silently handle Redis errors - fall back to memory cache
    redisAvailable = false;
  });

  client.on('connect', () => {
    redisAvailable = true;
    logger.info('✅ Redis cache connected');
  });

  client.connect().catch(() => {
    // Silently fall back to memory cache
    redisAvailable = false;
  });
} else {
  // Use memory cache by default (no Redis warnings)
  logger.info('💾 Using in-memory cache (Redis not configured)');
}

const get = async (key) => {
  try {
    if (redisAvailable && client) {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      // Fallback to memory cache
      const data = memoryCache.get(key);
      if (data && data.expiry > Date.now()) {
        return data.value;
      }
      if (data) {
        memoryCache.delete(key);
      }
      return null;
    }
  } catch (err) {
    // Fallback to memory cache on error
    const data = memoryCache.get(key);
    return data && data.expiry > Date.now() ? data.value : null;
  }
};

const set = async (key, value, ttl) => {
  try {
    if (redisAvailable && client) {
      await client.set(key, JSON.stringify(value), {
        EX: ttl
      });
    } else {
      // Fallback to memory cache
      memoryCache.set(key, {
        value,
        expiry: Date.now() + (ttl * 1000)
      });
    }
  } catch (err) {
    // Fallback to memory cache on error
    memoryCache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
  }
};

const del = async (key) => {
  try {
    if (redisAvailable && client) {
      await client.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (err) {
    memoryCache.delete(key);
  }
};

module.exports = {
  get,
  set,
  del
};
