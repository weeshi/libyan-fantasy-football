import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter, rateLimiters } from './rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      windowMs: 1000,
      maxRequests: 5,
    });
  });

  describe('isAllowed', () => {
    it('should allow requests within limit', () => {
      for (let i = 0; i < 5; i++) {
        expect(limiter.isAllowed('user1')).toBe(true);
      }
    });

    it('should deny requests exceeding limit', () => {
      for (let i = 0; i < 5; i++) {
        limiter.isAllowed('user1');
      }
      expect(limiter.isAllowed('user1')).toBe(false);
    });

    it('should track different users separately', () => {
      for (let i = 0; i < 5; i++) {
        limiter.isAllowed('user1');
      }
      expect(limiter.isAllowed('user1')).toBe(false);
      expect(limiter.isAllowed('user2')).toBe(true);
    });

    it('should reset after window expires', () => {
      vi.useFakeTimers();

      for (let i = 0; i < 5; i++) {
        limiter.isAllowed('user1');
      }
      expect(limiter.isAllowed('user1')).toBe(false);

      vi.advanceTimersByTime(1001);

      expect(limiter.isAllowed('user1')).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('getInfo', () => {
    it('should return correct info', () => {
      limiter.isAllowed('user1');
      limiter.isAllowed('user1');

      const info = limiter.getInfo('user1');

      expect(info.remaining).toBe(3);
      expect(info.limit).toBe(5);
      expect(info.retryAfter).toBeGreaterThan(0);
    });

    it('should return full limit for new user', () => {
      const info = limiter.getInfo('newuser');

      expect(info.remaining).toBe(5);
      expect(info.limit).toBe(5);
      expect(info.retryAfter).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset specific user', () => {
      for (let i = 0; i < 5; i++) {
        limiter.isAllowed('user1');
      }
      expect(limiter.isAllowed('user1')).toBe(false);

      limiter.reset('user1');

      expect(limiter.isAllowed('user1')).toBe(true);
    });
  });

  describe('resetAll', () => {
    it('should reset all users', () => {
      for (let i = 0; i < 5; i++) {
        limiter.isAllowed('user1');
        limiter.isAllowed('user2');
      }

      limiter.resetAll();

      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user2')).toBe(true);
    });
  });

  describe('skipSuccessfulRequests', () => {
    it('should skip successful requests', () => {
      const limiter2 = new RateLimiter({
        windowMs: 1000,
        maxRequests: 5,
        skipSuccessfulRequests: true,
      });

      for (let i = 0; i < 10; i++) {
        expect(limiter2.isAllowed('user1', true)).toBe(true);
      }
    });

    it('should count failed requests', () => {
      const limiter2 = new RateLimiter({
        windowMs: 1000,
        maxRequests: 5,
        skipSuccessfulRequests: true,
      });

      for (let i = 0; i < 5; i++) {
        limiter2.isAllowed('user1', false);
      }
      expect(limiter2.isAllowed('user1', false)).toBe(false);
    });
  });

  describe('skipFailedRequests', () => {
    it('should skip failed requests', () => {
      const limiter2 = new RateLimiter({
        windowMs: 1000,
        maxRequests: 5,
        skipFailedRequests: true,
      });

      for (let i = 0; i < 10; i++) {
        expect(limiter2.isAllowed('user1', false)).toBe(true);
      }
    });

    it('should count successful requests', () => {
      const limiter2 = new RateLimiter({
        windowMs: 1000,
        maxRequests: 5,
        skipFailedRequests: true,
      });

      for (let i = 0; i < 5; i++) {
        limiter2.isAllowed('user1', true);
      }
      expect(limiter2.isAllowed('user1', true)).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return correct stats', () => {
      limiter.isAllowed('user1');
      limiter.isAllowed('user1');
      limiter.isAllowed('user2');

      const stats = limiter.getStats();

      expect(stats.activeKeys).toBe(2);
      expect(stats.totalRequests).toBe(3);
    });
  });

  describe('Pre-configured limiters', () => {
    it('should have api limiter', () => {
      expect(rateLimiters.api).toBeDefined();
    });

    it('should have auth limiter', () => {
      expect(rateLimiters.auth).toBeDefined();
    });

    it('should have upload limiter', () => {
      expect(rateLimiters.upload).toBeDefined();
    });

    it('should have search limiter', () => {
      expect(rateLimiters.search).toBeDefined();
    });

    it('should have strict limiter', () => {
      expect(rateLimiters.strict).toBeDefined();
    });
  });

  describe('keyGenerator', () => {
    it('should use custom key generator', () => {
      const customLimiter = new RateLimiter({
        windowMs: 1000,
        maxRequests: 2,
        keyGenerator: (id) => `custom_${id}`,
      });

      customLimiter.isAllowed('user1');
      customLimiter.isAllowed('user1');

      expect(customLimiter.isAllowed('user1')).toBe(false);

      const info = customLimiter.getInfo('user1');
      expect(info.remaining).toBe(0);
    });
  });
});
