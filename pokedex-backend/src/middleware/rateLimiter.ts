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
        connectTimeout: 5000
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

// Custom rate limit handler for consistent error responses
const createRateLimitHandler = (limitType: string, retryAfter: string) => {
  return (req: any, res: any) => {
    const resetTime = new Date(Date.now() + res.getHeader('RateLimit-Reset') * 1000);

    // Log rate limit violation
    console.warn(`Rate limit exceeded for ${limitType}:`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      limit: res.getHeader('RateLimit-Limit'),
      remaining: res.getHeader('RateLimit-Remaining'),
      resetTime: resetTime.toISOString(),
      timestamp: new Date().toISOString()
    });

    res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many ${limitType} requests from this IP address. Please try again later.`,
      details: {
        limit: parseInt(res.getHeader('RateLimit-Limit')) || 0,
        remaining: parseInt(res.getHeader('RateLimit-Remaining')) || 0,
        resetTime: resetTime.toISOString(),
        retryAfter: retryAfter,
        requestsAllowed: `${res.getHeader('RateLimit-Limit')} requests per ${retryAfter}`
      },
      statusCode: 429,
      timestamp: new Date().toISOString()
    });
  };
};

// General API rate limiter - 300 requests per 10 minutes per IP (more lenient in test/dev)
export const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 300, // Higher limit for testing
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new RedisStore('general:'),
  handler: createRateLimitHandler('general API', '10 minutes'),
  skip: (req) => {
    // Skip rate limiting for health checks only
    const isHealthCheck = req.path === '/health' || req.path === '/health/ready';
    return isHealthCheck;
  }
});

// Search API rate limiter - 30 requests per 5 minutes per IP
export const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Limit each IP to 30 search requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('search:'),
  handler: createRateLimitHandler('search', '5 minutes'),
});

// Suggestions API rate limiter - 60 requests per 5 minutes per IP
export const suggestionsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60, // Limit each IP to 60 suggestion requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('suggestions:'),
  handler: createRateLimitHandler('suggestion', '5 minutes'),
});

// Seed API rate limiter - Very strict, only 3 requests per hour
export const seedLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 seed requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('seed:'),
  handler: createRateLimitHandler('seed', '1 hour'),
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