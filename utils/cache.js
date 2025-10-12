
const redis = require('redis');
const { logger } = require('./log');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = redis.createClient({
  url: redisUrl
});

client.on('error', (err) => {
  logger.error('Redis Error:', err);
});

client.connect();

const get = async (key) => {
  try {
    const data = await client.get(key);
    return JSON.parse(data);
  } catch (err) {
    logger.error('Redis GET Error:', err);
    return null;
  }
};

const set = async (key, value, ttl) => {
  try {
    await client.set(key, JSON.stringify(value), {
      EX: ttl
    });
  } catch (err) {
    logger.error('Redis SET Error:', err);
  }
};

const del = async (key) => {
  try {
    await client.del(key);
  } catch (err) {
    logger.error('Redis DEL Error:', err);
  }
};

module.exports = {
  get,
  set,
  del
};
