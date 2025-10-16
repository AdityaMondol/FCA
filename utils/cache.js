const redis = require('redis');
const { logger } = require('./log');

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.memoryCache = new Map();
  }

  async connect() {
    try {
      // Skip Redis if not configured
      if (!process.env.REDIS_URL) {
        logger.warn('Redis URL not configured - using in-memory cache');
        this.isConnected = false;
        return true;
      }

      // Redis configuration with fallback
      const redisConfig = {
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > this.maxRetries) {
              logger.error('Redis max retries reached');
              return new Error('Max retries exceeded');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      };

      this.client = redis.createClient(redisConfig);

      this.client.on('error', (err) => {
        logger.warn('Redis Client Error (non-critical):', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
        this.retryAttempts = 0;
      });

      this.client.on('ready', () => {
        logger.info('Redis Client Ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        logger.warn('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      logger.info('Redis connected successfully');
      return true;
    } catch (error) {
      logger.warn('Redis connection failed - using in-memory cache:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis Client Disconnected');
    }
  }

  // Enhanced get with error handling
  async get(key) {
    try {
      // Try Redis first
      if (this.isConnected && this.client) {
        const value = await this.client.get(key);
        if (value) {
          return JSON.parse(value);
        }
      }
      
      // Fallback to in-memory cache
      const cached = this.memoryCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }
      
      // Clean up expired entry
      if (cached) {
        this.memoryCache.delete(key);
      }
      
      return null;
    } catch (error) {
      logger.warn('Cache GET error, using memory fallback:', error.message);
      const cached = this.memoryCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
      }
      return null;
    }
  }

  // Enhanced set with TTL and error handling
  async set(key, value, ttl = 3600) {
    try {
      // Try Redis first
      if (this.isConnected && this.client) {
        const serialized = JSON.stringify(value);
        await this.client.setEx(key, ttl, serialized);
        return true;
      }
      
      // Fallback to in-memory cache
      this.memoryCache.set(key, {
        value,
        expiresAt: Date.now() + (ttl * 1000)
      });
      return true;
    } catch (error) {
      logger.warn('Cache SET error, using memory fallback:', error.message);
      // Store in memory as fallback
      this.memoryCache.set(key, {
        value,
        expiresAt: Date.now() + (ttl * 1000)
      });
      return true;
    }
  }

  // Delete cache entry
  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Redis DEL pattern error:', error);
      return false;
    }
  }

  // Cache with automatic invalidation
  async cacheWithInvalidation(key, fetchFunction, ttl = 3600, tags = []) {
    try {
      // Try to get from cache first
      let data = await this.get(key);
      
      if (data) {
        return data;
      }

      // Fetch fresh data
      data = await fetchFunction();
      
      if (data) {
        // Store in cache
        await this.set(key, data, ttl);
        
        // Store tags for invalidation
        for (const tag of tags) {
          await this.addToTag(tag, key);
        }
      }

      return data;
    } catch (error) {
      logger.error('Cache with invalidation error:', error);
      // Fallback to direct function call
      return await fetchFunction();
    }
  }

  // Add key to tag for group invalidation
  async addToTag(tag, key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.sAdd(`tag:${tag}`, key);
      return true;
    } catch (error) {
      logger.error('Redis add to tag error:', error);
      return false;
    }
  }

  // Invalidate all keys with specific tag
  async invalidateTag(tag) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.sMembers(`tag:${tag}`);
      if (keys.length > 0) {
        await this.client.del(keys);
        await this.client.del(`tag:${tag}`);
      }
      return true;
    } catch (error) {
      logger.error('Redis invalidate tag error:', error);
      return false;
    }
  }

  // Session management
  async setSession(sessionId, data, ttl = 86400) {
    return await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession(sessionId) {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async checkRateLimit(key, limit, window) {
    if (!this.isConnected || !this.client) {
      return { allowed: true, remaining: limit };
    }

    try {
      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, window);
      }

      const remaining = Math.max(0, limit - current);
      const allowed = current <= limit;

      return { allowed, remaining, current };
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      return { allowed: true, remaining: limit };
    }
  }

  // Health check
  async healthCheck() {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check error:', error);
      return false;
    }
  }

  // Get cache statistics
  async getStats() {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const info = await this.client.info('memory');
      const keyspace = await this.client.info('keyspace');
      
      return {
        connected: this.isConnected,
        memory: info,
        keyspace: keyspace
      };
    } catch (error) {
      logger.error('Redis stats error:', error);
      return null;
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Cache key generators
const CACHE_KEYS = {
  USER_PROFILE: (userId) => `user:profile:${userId}`,
  USER_SESSION: (sessionId) => `session:${sessionId}`,
  NOTICES_LIST: (page, limit) => `notices:list:${page}:${limit}`,
  NOTICES_PUBLIC: () => 'notices:public',
  MEDIA_GALLERY: (category, page) => `media:${category}:${page}`,
  MEDIA_PUBLIC: () => 'media:public',
  TEACHERS_LIST: () => 'teachers:list',
  ACADEMY_INFO: () => 'academy:info',
  CONTACT_SUBMISSIONS: (page) => `contacts:${page}`,
  ANALYTICS_DATA: (type, period) => `analytics:${type}:${period}`,
  RATE_LIMIT: (ip, endpoint) => `rate:${ip}:${endpoint}`
};

// Cache TTL settings (in seconds)
const CACHE_TTL = {
  USER_PROFILE: 3600,      // 1 hour
  USER_SESSION: 86400,     // 24 hours
  NOTICES: 1800,           // 30 minutes
  MEDIA: 3600,             // 1 hour
  TEACHERS: 7200,          // 2 hours
  ACADEMY_INFO: 86400,     // 24 hours
  ANALYTICS: 900,          // 15 minutes
  RATE_LIMIT: 3600         // 1 hour
};

// Cache tags for invalidation
const CACHE_TAGS = {
  NOTICES: 'notices',
  MEDIA: 'media',
  USERS: 'users',
  TEACHERS: 'teachers',
  ACADEMY: 'academy'
};

module.exports = {
  cacheManager,
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_TAGS
};