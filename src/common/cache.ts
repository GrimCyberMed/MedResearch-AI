/**
 * MedResearch AI - Caching System
 * 
 * Simple in-memory caching using node-cache with:
 * - TTL (Time To Live) support
 * - Automatic cleanup
 * - Statistics tracking
 * - Cache key generation
 * 
 * @version 1.0.0
 */

import NodeCache from 'node-cache';
import crypto from 'crypto';
import { logger } from './logger.js';

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Default TTL in seconds (default: 300 = 5 minutes) */
  stdTTL?: number;
  /** Check period for expired keys in seconds (default: 60) */
  checkperiod?: number;
  /** Use clones for get/set (default: false for performance) */
  useClones?: boolean;
  /** Maximum number of keys (default: 1000) */
  maxKeys?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  ksize: number;
  vsize: number;
  hitRate: number;
}

/**
 * Simple caching service using NodeCache
 */
export class CacheService {
  private cache: NodeCache;
  private hits: number = 0;
  private misses: number = 0;
  
  constructor(options: CacheOptions = {}) {
    const config = {
      stdTTL: options.stdTTL || 300, // 5 minutes default
      checkperiod: options.checkperiod || 60,
      useClones: options.useClones || false,
      maxKeys: options.maxKeys || 1000,
    };
    
    this.cache = new NodeCache(config);
    
    // Log cache events
    this.cache.on('set', (key, value) => {
      logger.debug('Cache set', { key, size: JSON.stringify(value).length });
    });
    
    this.cache.on('del', (key) => {
      logger.debug('Cache delete', { key });
    });
    
    this.cache.on('expired', (key) => {
      logger.debug('Cache expired', { key });
    });
    
    logger.info('Cache service initialized', config);
  }
  
  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    
    if (value !== undefined) {
      this.hits++;
      logger.debug('Cache hit', { key });
      return value;
    }
    
    this.misses++;
    logger.debug('Cache miss', { key });
    return undefined;
  }
  
  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const success = this.cache.set(key, value, ttl || 0);
      
      if (success) {
        logger.debug('Cache set successful', { key, ttl });
      } else {
        logger.warn('Cache set failed', { key });
      }
      
      return success;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false;
    }
  }
  
  /**
   * Delete value from cache
   */
  delete(key: string): number {
    return this.cache.del(key);
  }
  
  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Get or set value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // Not in cache, fetch from source
    logger.debug('Cache miss, fetching from source', { key });
    const value = await factory();
    
    // Store in cache
    this.set(key, value, ttl);
    
    return value;
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.flushAll();
    this.hits = 0;
    this.misses = 0;
    logger.info('Cache cleared');
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const stats = this.cache.getStats();
    const total = this.hits + this.misses;
    
    return {
      hits: this.hits,
      misses: this.misses,
      keys: stats.keys,
      ksize: stats.ksize,
      vsize: stats.vsize,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
    };
  }
  
  /**
   * Get all cache keys
   */
  keys(): string[] {
    return this.cache.keys();
  }
  
  /**
   * Get TTL for a key
   */
  getTtl(key: string): number | undefined {
    return this.cache.getTtl(key);
  }
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, any>
): string {
  // Sort keys for consistent hashing
  const sortedKeys = Object.keys(params).sort();
  const normalized = sortedKeys.map(key => `${key}:${params[key]}`).join('|');
  
  // Create hash for long keys
  if (normalized.length > 100) {
    const hash = crypto
      .createHash('md5')
      .update(normalized)
      .digest('hex')
      .substring(0, 16);
    
    return `${prefix}:${hash}`;
  }
  
  return `${prefix}:${normalized}`;
}

/**
 * Default cache instance
 */
export const defaultCache = new CacheService({
  stdTTL: 300, // 5 minutes
  checkperiod: 60,
  maxKeys: 1000,
});

export default defaultCache;
