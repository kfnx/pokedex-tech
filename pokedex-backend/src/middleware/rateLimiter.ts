import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';

// Redis client for rate limiting store
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL;

    // If no Redis URL is configured, don't attempt connection
    if (!redisUrl) {
      console.log('No REDIS_URL configured, falling back to memory-based rate limiting');
      return null;
    }

    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      // Don't throw, just log the error
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis for rate limiting');
    });

    try {
      await redisClient.connect();
    } catch (error) {
      console.error('Failed to connect to Redis, using memory fallback:', error);
      redisClient = null;
    }
  }

  return redisClient;
}

// Custom Redis store for express-rate-limit
class RedisStore {
  private client: ReturnType<typeof createClient> | null = null;
  private prefix: string;

  constructor(prefix: string = 'rl:') {
    this.prefix = prefix;
    // Don't eagerly initialize connection
  }

  private async ensureClient() {
    if (this.client === null && process.env.REDIS_URL) {
      this.client = await getRedisClient();
    }
    return this.client;
  }

  async increment(key: string): Promise<{ totalHits: number; timeToExpire?: number }> {
    const client = await this.ensureClient();
    if (!client) {
      // Fallback to memory-based counting if Redis is unavailable
      return { totalHits: 1 };
    }

    const redisKey = `${this.prefix}${key}`;

    try {
      const pipeline = client.multi();
      pipeline.incr(redisKey);
      pipeline.expire(redisKey, 900); // 15 minutes
      pipeline.ttl(redisKey);

      const results = await pipeline.exec();
      const totalHits = results?.[0] as number || 1;
      const timeToExpire = results?.[2] as number || undefined;

      return { totalHits, timeToExpire: timeToExpire > 0 ? timeToExpire * 1000 : undefined };
    } catch (error) {
      console.error('Redis increment error:', error);
      return { totalHits: 1 };
    }
  }

  async decrement(key: string): Promise<void> {
    const client = await this.ensureClient();
    if (!client) return;

    const redisKey = `${this.prefix}${key}`;

    try {
      await client.decr(redisKey);
    } catch (error) {
      console.error('Redis decrement error:', error);
    }
  }

  async resetKey(key: string): Promise<void> {
    const client = await this.ensureClient();
    if (!client) return;

    const redisKey = `${this.prefix}${key}`;

    try {
      await client.del(redisKey);
    } catch (error) {
      console.error('Redis reset error:', error);
    }
  }
}

// General API rate limiter - 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new RedisStore('general:'),
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/health/ready';
  }
});

// Search API rate limiter - 30 requests per 5 minutes per IP
export const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit each IP to 30 search requests per windowMs
  message: {
    error: 'Too many search requests from this IP, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('search:'),
});

// Suggestions API rate limiter - 60 requests per 5 minutes per IP
export const suggestionsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60, // Limit each IP to 60 suggestion requests per windowMs
  message: {
    error: 'Too many suggestion requests from this IP, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('suggestions:'),
});

// Seed API rate limiter - Very strict, only 3 requests per hour
export const seedLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 seed requests per hour
  message: {
    error: 'Seed endpoint is rate limited. Please wait before trying again.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('seed:'),
});

// Helper function to gracefully close Redis connection
export async function closeRedisConnection() {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
}