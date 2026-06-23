import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheManager } from './cache';

describe('CacheManager', () => {
  beforeEach(() => {
    CacheManager.clear('all');
    localStorage.clear();
  });

  afterEach(() => {
    CacheManager.clear('all');
    localStorage.clear();
  });

  describe('set and get', () => {
    it('should set and get value from memory cache', () => {
      const key = 'test_key';
      const data = { name: 'Test', value: 123 };

      CacheManager.set(key, data);
      const result = CacheManager.get(key);

      expect(result).toEqual(data);
    });

    it('should set and get value from localStorage', () => {
      const key = 'test_key';
      const data = { name: 'Test', value: 123 };

      CacheManager.set(key, data, { storage: 'local' });
      const result = CacheManager.get(key, 'local');

      expect(result).toEqual(data);
    });

    it('should return null for non-existent key', () => {
      const result = CacheManager.get('non_existent');
      expect(result).toBeNull();
    });
  });

  describe('TTL and expiration', () => {
    it('should expire cache after TTL', () => {
      const key = 'test_key';
      const data = { name: 'Test' };
      const ttl = 100; // 100ms

      CacheManager.set(key, data, { ttl });

      // Should exist immediately
      expect(CacheManager.get(key)).toEqual(data);

      // Wait for expiration
      vi.useFakeTimers();
      vi.advanceTimersByTime(ttl + 1);

      // Should be expired
      expect(CacheManager.get(key)).toBeNull();

      vi.useRealTimers();
    });

    it('should use default TTL', () => {
      const key = 'test_key';
      const data = { name: 'Test' };

      CacheManager.set(key, data); // No TTL specified

      // Should exist immediately
      expect(CacheManager.get(key)).toEqual(data);
    });
  });

  describe('remove', () => {
    it('should remove value from memory cache', () => {
      const key = 'test_key';
      CacheManager.set(key, { data: 'test' });

      expect(CacheManager.get(key)).not.toBeNull();

      CacheManager.remove(key);

      expect(CacheManager.get(key)).toBeNull();
    });

    it('should remove value from localStorage', () => {
      const key = 'test_key';
      CacheManager.set(key, { data: 'test' }, { storage: 'local' });

      expect(CacheManager.get(key, 'local')).not.toBeNull();

      CacheManager.remove(key, 'local');

      expect(CacheManager.get(key, 'local')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear memory cache', () => {
      CacheManager.set('key1', { data: 'test1' });
      CacheManager.set('key2', { data: 'test2' });

      expect(CacheManager.get('key1')).not.toBeNull();
      expect(CacheManager.get('key2')).not.toBeNull();

      CacheManager.clear('memory');

      expect(CacheManager.get('key1')).toBeNull();
      expect(CacheManager.get('key2')).toBeNull();
    });

    it('should clear all caches', () => {
      CacheManager.set('key1', { data: 'test1' });
      CacheManager.set('key2', { data: 'test2' }, { storage: 'local' });

      CacheManager.clear('all');

      expect(CacheManager.get('key1')).toBeNull();
      expect(CacheManager.get('key2', 'local')).toBeNull();
    });
  });

  describe('getOrSet', async () => {
    it('should return cached value if exists', async () => {
      const key = 'test_key';
      const data = { name: 'Test' };
      const fetcher = vi.fn();

      CacheManager.set(key, data);

      const result = await CacheManager.getOrSet(key, fetcher);

      expect(result).toEqual(data);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should fetch and cache value if not exists', async () => {
      const key = 'test_key';
      const data = { name: 'Test' };
      const fetcher = vi.fn().mockResolvedValue(data);

      const result = await CacheManager.getOrSet(key, fetcher);

      expect(result).toEqual(data);
      expect(fetcher).toHaveBeenCalled();
      expect(CacheManager.get(key)).toEqual(data);
    });

    it('should handle sync fetcher', async () => {
      const key = 'test_key';
      const data = { name: 'Test' };
      const fetcher = vi.fn().mockReturnValue(data);

      const result = await CacheManager.getOrSet(key, fetcher);

      expect(result).toEqual(data);
      expect(CacheManager.get(key)).toEqual(data);
    });
  });

  describe('getStats', () => {
    it('should return cache stats', () => {
      CacheManager.set('key1', { data: 'test1' });
      CacheManager.set('key2', { data: 'test2' }, { storage: 'local' });

      const stats = CacheManager.getStats();

      expect(stats.memorySize).toBe(1);
      expect(stats.localStorageSize).toBeGreaterThan(0);
    });
  });

  describe('storage fallback', () => {
    it('should fallback to memory cache if localStorage fails', () => {
      const key = 'test_key';
      const data = { name: 'Test' };

      // Mock localStorage to throw error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage error');
      });

      CacheManager.set(key, data, { storage: 'local' });

      // Should still be accessible from memory cache
      expect(CacheManager.get(key)).toEqual(data);

      setItemSpy.mockRestore();
    });
  });
});
