/**
 * MedResearch AI - Structured Logging
 * 
 * Winston-based logging system with JSON format for production
 * and human-readable format for development.
 * 
 * @version 1.0.0
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

/**
 * Logger instance with multiple transports
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'medresearch-ai',
    version: '4.1.0'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for non-production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        
        // Add metadata if present
        const metaKeys = Object.keys(metadata).filter(key => 
          key !== 'service' && key !== 'version'
        );
        
        if (metaKeys.length > 0) {
          msg += ` ${JSON.stringify(metadata, null, 2)}`;
        }
        
        return msg;
      })
    ),
  }));
}

/**
 * Helper function to log with context
 */
export function logWithContext(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context?: Record<string, any>
): void {
  logger.log(level, message, context);
}

/**
 * Helper function to log errors with full stack trace
 */
export function logError(
  error: Error,
  context?: Record<string, any>
): void {
  logger.error(error.message, {
    ...context,
    stack: error.stack,
    name: error.name,
  });
}

/**
 * Helper function to log performance metrics
 */
export function logPerformance(
  operation: string,
  duration: number,
  context?: Record<string, any>
): void {
  logger.info(`Performance: ${operation}`, {
    ...context,
    duration_ms: duration,
    operation,
  });
}

export default logger;
