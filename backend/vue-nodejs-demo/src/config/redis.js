import dotenv from 'dotenv';

dotenv.config();

// Redis connection configuration
// Returns null if Redis is not available, application will fallback to in-memory operations
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || null,
};

// Redis client wrapper with fallback
let redisClient = null;

export async function initRedis() {
  try {
    // Dynamically import redis (optional dependency)
    const { createClient } = await import('redis');
    redisClient = createClient({
      url: `redis://${redisConfig.host}:${redisConfig.port}`,
      password: redisConfig.password,
    });

    redisClient.on('error', (err) => {
      console.log('Redis client error (falling back to memory):', err.message);
      redisClient = null;
    });

    await redisClient.connect();
    console.log('Redis connected successfully');
    return redisClient;
  } catch (err) {
    console.log('Redis not available, using fallback mode');
    redisClient = null;
    return null;
  }
}

// Simple in-memory cache as fallback
const memoryCache = new Map();

export async function cacheGet(key) {
  if (redisClient) {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }
  const item = memoryCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.value;
  }
  memoryCache.delete(key);
  return null;
}

export async function cacheSet(key, value, ttlSeconds = 3600) {
  if (redisClient) {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } else {
    memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }
}

export async function cacheDel(key) {
  if (redisClient) {
    await redisClient.del(key);
  } else {
    memoryCache.delete(key);
  }
}

export { redisClient };
