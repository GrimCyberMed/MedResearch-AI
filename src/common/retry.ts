/**
 * MedResearch AI - Retry Logic with Exponential Backoff
 * 
 * Implements retry logic for transient failures with:
 * - Exponential backoff
 * - Jitter to prevent thundering herd
 * - Configurable retry attempts
 * - Selective retry based on error type
 * 
 * @version 1.0.0
 */

import { logger } from './logger.js';

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Error codes that should trigger retry */
  retryableErrors?: string[];
  /** Whether to add jitter to delay (default: true) */
  useJitter?: boolean;
}

/**
 * Default retry configuration
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'NETWORK_ERROR',
    'TIMEOUT',
    'RATE_LIMIT_ERROR',
  ],
  useJitter: true,
};

/**
 * Check if error is retryable
 */
function isRetryableError(
  error: any,
  retryableErrors: string[]
): boolean {
  if (!error) return false;
  
  // Check error code
  if (error.code && retryableErrors.includes(error.code)) {
    return true;
  }
  
  // Check error message
  if (error.message) {
    const message = error.message.toLowerCase();
    return retryableErrors.some(code => 
      message.includes(code.toLowerCase())
    );
  }
  
  // Check HTTP status codes (5xx are retryable)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }
  
  // Check for 429 (Too Many Requests)
  if (error.status === 429) {
    return true;
  }
  
  return false;
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  useJitter: boolean
): number {
  // Exponential backoff: delay = initialDelay * (multiplier ^ attempt)
  let delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  
  // Cap at max delay
  delay = Math.min(delay, maxDelay);
  
  // Add jitter (random value between 0 and delay)
  if (useJitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }
  
  return Math.floor(delay);
}

/**
 * Execute operation with retry logic
 * 
 * @param operation - Async function to execute
 * @param options - Retry configuration
 * @returns Result of the operation
 * @throws Last error if all retries fail
 * 
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetch('https://api.example.com/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  let lastError: Error | undefined;
  let delay = config.initialDelay;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Execute operation
      const result = await operation();
      
      // Log success if this was a retry
      if (attempt > 0) {
        logger.info('Operation succeeded after retry', {
          attempt,
          totalAttempts: attempt + 1,
        });
      }
      
      return result;
      
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry
      const shouldRetry = isRetryableError(error, config.retryableErrors);
      
      // Don't retry on last attempt or non-retryable errors
      if (attempt === config.maxRetries || !shouldRetry) {
        logger.error('Operation failed after retries', {
          attempt,
          totalAttempts: attempt + 1,
          error: lastError.message,
          retryable: shouldRetry,
        });
        break;
      }
      
      // Calculate delay for next attempt
      delay = calculateDelay(
        attempt,
        config.initialDelay,
        config.maxDelay,
        config.backoffMultiplier,
        config.useJitter
      );
      
      // Log retry attempt
      logger.warn('Operation failed, retrying', {
        attempt: attempt + 1,
        maxRetries: config.maxRetries,
        nextDelay: delay,
        error: lastError.message,
      });
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed
  throw lastError;
}

/**
 * Retry decorator for class methods
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @retry({ maxRetries: 3 })
 *   async fetchData() {
 *     return await fetch('https://api.example.com/data');
 *   }
 * }
 * ```
 */
export function retry(options: RetryOptions = {}) {
  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return withRetry(
        () => originalMethod.apply(this, args),
        options
      );
    };
    
    return descriptor;
  };
}

export default withRetry;
