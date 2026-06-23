/**
 * Caching Utility for Static Data
 * Implements localStorage and in-memory caching with TTL
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default: 1 hour
  storage?: 'memory' | 'local';
}

const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
const CACHE_PREFIX = 'app_cache_';

/**
 * In-memory cache store
 */
const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Cache Manager Class
 */
export class CacheManager {
  /**
   * Set cache value
   */
  static set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): void {
    const ttl = options.ttl ?? DEFAULT_TTL;
    const storage = options.storage ?? 'memory';

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    if (storage === 'local') {
      try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to set localStorage cache:', error);
        // Fallback to memory cache
        memoryCache.set(key, entry);
      }
    } else {
      memoryCache.set(key, entry);
    }
  }

  /**
   * Get cache value
   */
  static get<T>(key: string, storage: 'memory' | 'local' = 'memory'): T | null {
    let entry: CacheEntry<T> | null = null;

    if (storage === 'local') {
      try {
        const item = localStorage.getItem(CACHE_PREFIX + key);
        if (item) {
          entry = JSON.parse(item) as CacheEntry<T>;
        }
      } catch (error) {
        console.warn('Failed to get localStorage cache:', error);
      }
    } else {
      entry = memoryCache.get(key) ?? null;
    }

    if (!entry) {
      return null;
    }

    // Check if cache has expired
    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.remove(key, storage);
      return null;
    }

    return entry.data;
  }

  /**
   * Remove cache value
   */
  static remove(key: string, storage: 'memory' | 'local' = 'memory'): void {
    if (storage === 'local') {
      try {
        localStorage.removeItem(CACHE_PREFIX + key);
      } catch (error) {
        console.warn('Failed to remove localStorage cache:', error);
      }
    } else {
      memoryCache.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  static clear(storage: 'memory' | 'local' | 'all' = 'all'): void {
    if (storage === 'memory' || storage === 'all') {
      memoryCache.clear();
    }

    if (storage === 'local' || storage === 'all') {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear localStorage cache:', error);
      }
    }
  }

  /**
   * Get or set cache value (lazy evaluation)
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache
    const cached = this.get<T>(key, options.storage);
    if (cached !== null) {
      return cached;
    }

    // Fetch new data
    const data = await fetcher();

    // Store in cache
    this.set(key, data, options);

    return data;
  }

  /**
   * Get cache stats
   */
  static getStats(): {
    memorySize: number;
    localStorageSize: number;
  } {
    let localStorageSize = 0;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorageSize += localStorage.getItem(key)?.length ?? 0;
        }
      });
    } catch (error) {
      console.warn('Failed to get localStorage stats:', error);
    }

    return {
      memorySize: memoryCache.size,
      localStorageSize,
    };
  }
}

/**
 * Hook for React components
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  options: CacheOptions = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = React.useState<T | null>(() => {
    return CacheManager.get<T>(key, options.storage);
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await CacheManager.getOrSet(key, fetcher, options);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, options]);

  React.useEffect(() => {
    if (data === null) {
      refresh();
    }
  }, []);

  return { data, isLoading, error, refresh };
}

// Import React for the hook
import React from 'react';
