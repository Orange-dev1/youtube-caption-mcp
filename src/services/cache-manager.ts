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
      defaultTTL: 3600, // 1時間
      maxKeys: 1000,
      checkPeriod: 600, // 10分
      ...config,
    };

    this.cache = new NodeCache({
      stdTTL: this.config.defaultTTL,
      maxKeys: this.config.maxKeys,
      checkperiod: this.config.checkPeriod,
      useClones: false,
    });

    // キャッシュイベントのログ
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

  // キャッシュからデータを取得
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
      throw new CacheError(`キャッシュからの取得に失敗しました: ${key}`, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // キャッシュにデータを保存
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
      throw new CacheError(`キャッシュへの保存に失敗しました: ${key}`, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // キャッシュからデータを削除
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
      throw new CacheError(`キャッシュからの削除に失敗しました: ${key}`, {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // キャッシュをクリア
  clear(): void {
    try {
      this.cache.flushAll();
      // Cache cleared
    } catch (error) {
      console.error('Cache clear error:', error);
      throw new CacheError('キャッシュのクリアに失敗しました', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // キャッシュの統計情報を取得
  getStats() {
    return {
      keys: this.cache.keys().length,
      hits: this.cache.getStats().hits,
      misses: this.cache.getStats().misses,
      ksize: this.cache.getStats().ksize,
      vsize: this.cache.getStats().vsize,
    };
  }

  // キャッシュキーの生成
  static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  // 動画情報用のキャッシュキー
  static videoInfoKey(videoId: string): string {
    return this.generateKey('video_info', videoId);
  }

  // 字幕一覧用のキャッシュキー
  static captionsListKey(videoId: string): string {
    return this.generateKey('captions_list', videoId);
  }

  // 字幕データ用のキャッシュキー
  static captionsDataKey(videoId: string, lang: string, format: string): string {
    return this.generateKey('captions', videoId, lang, format);
  }

  // 検索結果用のキャッシュキー
  static searchKey(query: string, lang?: string): string {
    const queryHash = Buffer.from(query).toString('base64').substring(0, 16);
    return this.generateKey('search', queryHash, lang ?? 'all');
  }

  // TTL設定の定数
  static readonly TTL = {
    VIDEO_INFO: 3600, // 1時間
    CAPTIONS_LIST: 86400, // 24時間
    CAPTIONS_DATA: 86400, // 24時間
    SEARCH_RESULTS: 1800, // 30分
  } as const;
}

// デフォルトのキャッシュマネージャーインスタンス
export const defaultCacheManager = new CacheManager({
  enabled: process.env.CACHE_ENABLED !== 'false',
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),
  maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '1000'),
});
