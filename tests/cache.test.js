const { cacheManager, CACHE_KEYS, CACHE_TTL } = require('../utils/cache');

describe('Cache Manager', () => {
  beforeAll(async () => {
    await cacheManager.connect();
  });

  afterAll(async () => {
    await cacheManager.disconnect();
  });

  afterEach(async () => {
    if (cacheManager.isConnected) {
      await cacheManager.client.flushDb();
    }
  });

  describe('Basic Operations', () => {
    it('should set and get a value', async () => {
      const key = 'test:key';
      const value = { data: 'test data' };

      await cacheManager.set(key, value, 3600);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should delete a key', async () => {
      const key = 'test:delete';
      const value = { data: 'to delete' };

      await cacheManager.set(key, value, 3600);
      await cacheManager.del(key);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toBeNull();
    });

    it('should return null for non-existent key', async () => {
      const retrieved = await cacheManager.get('non:existent:key');
      expect(retrieved).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should set and get session data', async () => {
      const sessionId = 'test-session-123';
      const sessionData = { userId: 1, role: 'student' };

      await cacheManager.setSession(sessionId, sessionData);
      const retrieved = await cacheManager.getSession(sessionId);

      expect(retrieved).toEqual(sessionData);
    });

    it('should delete session', async () => {
      const sessionId = 'test-session-456';
      const sessionData = { userId: 2, role: 'teacher' };

      await cacheManager.setSession(sessionId, sessionData);
      await cacheManager.deleteSession(sessionId);
      const retrieved = await cacheManager.getSession(sessionId);

      expect(retrieved).toBeNull();
    });
  });

  describe('Rate Limiting', () => {
    it('should track rate limit correctly', async () => {
      const key = 'rate:limit:test';
      const limit = 5;
      const window = 60;

      for (let i = 1; i <= limit; i++) {
        const result = await cacheManager.checkRateLimit(key, limit, window);
        expect(result.allowed).toBe(true);
        expect(result.current).toBe(i);
      }

      const result = await cacheManager.checkRateLimit(key, limit, window);
      expect(result.allowed).toBe(false);
      expect(result.current).toBe(limit + 1);
    });
  });

  describe('Tag-based Invalidation', () => {
    it('should add key to tag and retrieve', async () => {
      const tag = 'test-tag';
      const key1 = 'key:1';
      const key2 = 'key:2';

      await cacheManager.addToTag(tag, key1);
      await cacheManager.addToTag(tag, key2);

      const keys = await cacheManager.client.sMembers(`tag:${tag}`);
      expect(keys).toContain(key1);
      expect(keys).toContain(key2);
    });

    it('should invalidate all keys with tag', async () => {
      const tag = 'invalidate-tag';
      const key1 = 'key:inv:1';
      const key2 = 'key:inv:2';
      const value = { data: 'test' };

      await cacheManager.set(key1, value, 3600);
      await cacheManager.set(key2, value, 3600);
      await cacheManager.addToTag(tag, key1);
      await cacheManager.addToTag(tag, key2);

      await cacheManager.invalidateTag(tag);

      const retrieved1 = await cacheManager.get(key1);
      const retrieved2 = await cacheManager.get(key2);

      expect(retrieved1).toBeNull();
      expect(retrieved2).toBeNull();
    });
  });

  describe('Health Check', () => {
    it('should return true for healthy connection', async () => {
      const isHealthy = await cacheManager.healthCheck();
      expect(isHealthy).toBe(true);
    });
  });

  describe('Cache with Invalidation', () => {
    it('should cache data and return it', async () => {
      const key = 'cache:with:invalidation';
      let callCount = 0;

      const fetchFunction = async () => {
        callCount++;
        return { data: 'fetched data', count: callCount };
      };

      const result1 = await cacheManager.cacheWithInvalidation(key, fetchFunction, 3600);
      const result2 = await cacheManager.cacheWithInvalidation(key, fetchFunction, 3600);

      expect(result1).toEqual(result2);
      expect(callCount).toBe(1);
    });

    it('should handle fetch function errors gracefully', async () => {
      const key = 'cache:error:test';
      const fetchFunction = async () => {
        throw new Error('Fetch failed');
      };

      await expect(cacheManager.cacheWithInvalidation(key, fetchFunction, 3600))
        .rejects.toThrow('Fetch failed');
    });
  });
});
