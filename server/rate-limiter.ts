/**
 * Rate Limiting Utility
 * Implements token bucket algorithm for API rate limiting
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (identifier: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  tokens: number;
  resetTime: number;
  requestCount: number;
  failureCount: number;
}

/**
 * Rate Limiter Class
 */
export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      keyGenerator: config.keyGenerator || ((id) => id),
      skipSuccessfulRequests: config.skipSuccessfulRequests ?? false,
      skipFailedRequests: config.skipFailedRequests ?? false,
    };

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string, isSuccess: boolean = true): boolean {
    const key = this.config.keyGenerator(identifier);
    const now = Date.now();

    let entry = this.store.get(key);

    // Create new entry if doesn't exist
    if (!entry) {
      entry = {
        tokens: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        requestCount: 0,
        failureCount: 0,
      };
      this.store.set(key, entry);
    }

    // Reset tokens if window expired
    if (now >= entry.resetTime) {
      entry.tokens = this.config.maxRequests;
      entry.resetTime = now + this.config.windowMs;
      entry.requestCount = 0;
      entry.failureCount = 0;
    }

    // Skip counting based on success/failure
    if (isSuccess && this.config.skipSuccessfulRequests) {
      return true;
    }
    if (!isSuccess && this.config.skipFailedRequests) {
      return true;
    }

    // Check if tokens available
    if (entry.tokens > 0) {
      entry.tokens--;
      entry.requestCount++;
      return true;
    }

    entry.failureCount++;
    return false;
  }

  /**
   * Get rate limit info
   */
  getInfo(identifier: string): {
    remaining: number;
    limit: number;
    resetTime: number;
    retryAfter: number;
  } {
    const key = this.config.keyGenerator(identifier);
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry) {
      return {
        remaining: this.config.maxRequests,
        limit: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
        retryAfter: 0,
      };
    }

    const resetTime = entry.resetTime;
    const retryAfter = Math.max(0, resetTime - now);

    return {
      remaining: entry.tokens,
      limit: this.config.maxRequests,
      resetTime,
      retryAfter: Math.ceil(retryAfter / 1000), // In seconds
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator(identifier);
    this.store.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.store.clear();
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.store.forEach((entry, key) => {
      if (now >= entry.resetTime + this.config.windowMs) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.store.delete(key));
  }

  /**
   * Get stats
   */
  getStats(): {
    activeKeys: number;
    totalRequests: number;
    totalFailures: number;
  } {
    let totalRequests = 0;
    let totalFailures = 0;

    this.store.forEach((entry) => {
      totalRequests += entry.requestCount;
      totalFailures += entry.failureCount;
    });

    return {
      activeKeys: this.store.size,
      totalRequests,
      totalFailures,
    };
  }
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  // General API rate limiter: 100 requests per minute
  api: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
  }),

  // Auth rate limiter: 5 requests per minute
  auth: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 5,
  }),

  // Upload rate limiter: 10 requests per hour
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  }),

  // Search rate limiter: 30 requests per minute
  search: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30,
  }),

  // Strict rate limiter: 10 requests per minute
  strict: new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
  }),
};

/**
 * Express middleware for rate limiting
 */
export function createRateLimitMiddleware(
  limiter: RateLimiter,
  keyGenerator: (req: any) => string = (req) => req.ip || 'unknown'
) {
  return (req: any, res: any, next: any) => {
    const key = keyGenerator(req);
    const isAllowed = limiter.isAllowed(key);

    const info = limiter.getInfo(key);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', info.limit);
    res.setHeader('X-RateLimit-Remaining', info.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(info.resetTime / 1000));

    if (!isAllowed) {
      res.setHeader('Retry-After', info.retryAfter);
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: info.retryAfter,
      });
    }

    next();
  };
}
