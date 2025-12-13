/**
 * Tool Caching Wrapper
 * 
 * Provides caching utilities for MCP tools with configurable TTL
 * and automatic cache key generation.
 * 
 * @version 1.0.0
 */

import { defaultCache, generateCacheKey } from './cache.js';
import { logger } from './logger.js';

/**
 * Cache configuration for different tool categories
 */
export const CACHE_TTL = {
  QUALITY_ASSESSMENT: 600,    // 10 minutes
  STATISTICAL: 300,            // 5 minutes
  VISUALIZATION: 1800,         // 30 minutes
  INTEGRATION_READ: 900,       // 15 minutes
  INTEGRATION_WRITE: 0,        // No cache
  OCR: 3600,                   // 60 minutes
  CLASSIFICATION: 1800,        // 30 minutes
  RANKING: 1800,               // 30 minutes
};

/**
 * Wrap a tool function with caching
 */
export async function withCache<T>(
  toolName: string,
  params: any,
  factory: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  // Generate cache key
  const cacheKey = generateCacheKey(toolName, params);
  
  // Try to get from cache
  const startTime = Date.now();
  const result = await defaultCache.getOrSet(cacheKey, factory, ttl);
  const duration = Date.now() - startTime;
  
  // Log cache performance
  const cached = duration < 10; // If very fast, likely from cache
  logger.debug('Tool execution', {
    tool: toolName,
    cached,
    duration,
    cacheKey: cacheKey.substring(0, 50),
  });
  
  return result;
}

/**
 * Wrap a synchronous tool function with caching
 */
export function withCacheSync<T>(
  toolName: string,
  params: any,
  factory: () => T,
  ttl: number = 300
): T {
  // Generate cache key
  const cacheKey = generateCacheKey(toolName, params);
  
  // Try to get from cache
  const cached = defaultCache.get<T>(cacheKey);
  if (cached !== undefined) {
    logger.debug('Cache hit (sync)', { tool: toolName, cacheKey: cacheKey.substring(0, 50) });
    return cached;
  }
  
  // Execute and cache
  const startTime = Date.now();
  const result = factory();
  const duration = Date.now() - startTime;
  
  defaultCache.set(cacheKey, result, ttl);
  
  logger.debug('Cache miss (sync)', {
    tool: toolName,
    duration,
    cacheKey: cacheKey.substring(0, 50),
  });
  
  return result;
}

/**
 * Clear cache for a specific tool
 */
export function clearToolCache(toolName: string): void {
  const keys = defaultCache.keys();
  const toolKeys = keys.filter(key => key.startsWith(toolName));
  
  toolKeys.forEach(key => defaultCache.delete(key));
  
  logger.info('Tool cache cleared', { tool: toolName, keysCleared: toolKeys.length });
}

/**
 * Get cache statistics for a specific tool
 */
export function getToolCacheStats(toolName: string): {
  keys: number;
  totalKeys: number;
  hitRate: number;
} {
  const allStats = defaultCache.getStats();
  const keys = defaultCache.keys();
  const toolKeys = keys.filter(key => key.startsWith(toolName));
  
  return {
    keys: toolKeys.length,
    totalKeys: allStats.keys,
    hitRate: allStats.hitRate,
  };
}
