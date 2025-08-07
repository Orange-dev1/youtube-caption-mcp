import NodeCache from 'node-cache';
import { CacheError } from '../types/errors.js';

export interface CacheConfig {
  enabled: boolean;
  defaultTTL: number;
  maxKeys: number;
  checkPeriod: number;
}

export class CacheManager {
  private cache: NodeCache;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: true,
      defaultTTL: 3600, // 1 hour
      maxKeys: 1000,
      checkPeriod: 600, // 10 minutes
      ...config,
    };

    this.cache = new NodeCache({
      stdTTL: this.config.defaultTTL,
      maxKeys: this.config.maxKeys,
      checkperiod: this.config.checkPeriod,
      useClones: false,
    });

    // Cache event logging
    this.cache.on('set', (key, value) => {
      // Cache SET: ${key}
    });

    this.cache.on('del', (key, value) => {
      // Cache DEL: ${key}
    });

    this.cache.on('expired', (key, value) => {
      // Cache EXPIRED: ${key}
    });
  }

  // Get data from cache
  get<T>(key: string): T | undefined {
    if (!this.config.enabled) {
      return undefined;
    }

    try {
      const value = this.cache.get<T>(key);
      if (value !== undefined) {
        // Cache HIT: ${key}
      } else {
        // Cache MISS: ${key}
      }
      return value;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      throw new CacheError(`Failed to retrieve from cache: ${key}`, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Save data to cache
  set<T>(key: string, value: T, ttl?: number): boolean {
    if (!this.config.enabled) {
      return false;
    }

    try {
      const success = this.cache.set(key, value, ttl || this.config.defaultTTL);
      if (success) {
        // Cache SET success: ${key} (TTL: ${ttl || this.config.defaultTTL}s)
      } else {
        console.warn(`Cache SET failed: ${key}`);
      }
      return success;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      throw new CacheError(`Failed to save to cache: ${key}`, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Delete data from cache
  del(key: string): number {
    if (!this.config.enabled) {
      return 0;
    }

    try {
      const deleted = this.cache.del(key);
      // Cache DEL: ${key} (deleted: ${deleted})
      return deleted;
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
      throw new CacheError(`Failed to delete from cache: ${key}`, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Clear cache
  clear(): void {
    try {
      this.cache.flushAll();
      // Cache cleared
    } catch (error) {
      console.error('Cache clear error:', error);
      throw new CacheError('Failed to clear cache', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Get cache statistics
  getStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize,
    };
  }

  // Generate cache key
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  // Cache key for video info
  static videoInfoKey(videoId: string): string {
    return this.generateKey('video_info', videoId);
  }

  // Cache key for captions list
  static captionsListKey(videoId: string): string {
    return this.generateKey('captions_list', videoId);
  }

  // Cache key for captions data
  static captionsDataKey(videoId: string, lang: string, format: string): string {
    return this.generateKey('captions', videoId, lang, format);
  }

  // Cache key for search results
  static searchKey(query: string, lang?: string): string {
    const queryHash = Buffer.from(query).toString('base64').substring(0, 16);
    return this.generateKey('search', queryHash, lang ?? 'all');
  }

  // TTL constants
  static readonly TTL = {
    VIDEO_INFO: 3600, // 1 hour
    CAPTIONS_LIST: 86400, // 24 hours
    CAPTIONS_DATA: 86400, // 24 hours
    SEARCH_RESULTS: 1800, // 30 minutes
  } as const;
}

// Default cache manager instance
export const defaultCacheManager = new CacheManager({
  enabled: process.env.CACHE_ENABLED !== 'false',
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),
  maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '1000'),
});
