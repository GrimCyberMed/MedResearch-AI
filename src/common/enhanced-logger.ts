/**
 * Enhanced Logging System for MedResearch AI
 * 
 * Comprehensive error tracking, crash recovery, and monitoring system.
 * Captures bugs, errors, API failures, tool crashes, and MCP server issues.
 * 
 * @version 2.0.0
 * @since 5.1.0
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory structure
const logsDir = path.join(__dirname, '../../logs');
const crashDir = path.join(logsDir, 'crashes');
const errorDir = path.join(logsDir, 'errors');
const apiDir = path.join(logsDir, 'api');
const toolsDir = path.join(logsDir, 'tools');
const performanceDir = path.join(logsDir, 'performance');

// Ensure all directories exist
[logsDir, crashDir, errorDir, apiDir, toolsDir, performanceDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Custom log format with enhanced metadata
 */
const enhancedFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format.json()
);

/**
 * Enhanced logger with multiple specialized transports
 */
export const enhancedLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: enhancedFormat,
  defaultMeta: {
    service: 'medresearch-ai',
    version: '5.1.0',
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'localhost'
  },
  transports: [
    // 1. CRITICAL ERRORS - Crashes and fatal errors
    new winston.transports.File({
      filename: path.join(crashDir, 'crash.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      format: winston.format.combine(
        enhancedFormat,
        winston.format.printf(info => {
          return JSON.stringify({
            ...info,
            severity: 'CRITICAL',
            alert: true
          }, null, 2);
        })
      )
    }),

    // 2. ERROR LOG - All errors
    new winston.transports.File({
      filename: path.join(errorDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10
    }),

    // 3. API ERRORS - API key issues, rate limits, timeouts
    new winston.transports.File({
      filename: path.join(apiDir, 'api-errors.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        enhancedFormat,
        winston.format((info: any) => {
          // Only log API-related messages
          if (info.metadata?.api || info.metadata?.apiKey || info.message?.includes('API')) {
            return info;
          }
          return false;
        })()
      )
    }),

    // 4. TOOL ERRORS - Individual tool failures
    new winston.transports.File({
      filename: path.join(toolsDir, 'tool-errors.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        enhancedFormat,
        winston.format((info: any) => {
          // Only log tool-related messages
          if (info.metadata?.tool || info.metadata?.toolName) {
            return info;
          }
          return false;
        })()
      )
    }),

    // 5. PERFORMANCE LOG - Slow operations
    new winston.transports.File({
      filename: path.join(performanceDir, 'performance.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        enhancedFormat,
        winston.format((info: any) => {
          // Only log performance-related messages
          if (info.metadata?.duration_ms || info.metadata?.performance) {
            return info;
          }
          return false;
        })()
      )
    }),

    // 6. COMBINED LOG - Everything
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10
    }),

    // 7. DAILY ROTATING LOG
    new winston.transports.File({
      filename: path.join(logsDir, `medresearch-${new Date().toISOString().split('T')[0]}.log`),
      maxsize: 10485760, // 10MB
      maxFiles: 30 // Keep 30 days
    })
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(crashDir, 'exceptions.log'),
      maxsize: 10485760,
      maxFiles: 10
    })
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(crashDir, 'rejections.log'),
      maxsize: 10485760,
      maxFiles: 10
    })
  ]
});

// Add console transport for non-production
if (process.env.NODE_ENV !== 'production') {
  enhancedLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, metadata }: any) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        
        // Add important metadata
        if (metadata) {
          const important = ['tool', 'api', 'error', 'duration_ms', 'status'];
          const relevantMeta = Object.keys(metadata)
            .filter(key => important.includes(key))
            .reduce((obj: Record<string, any>, key) => {
              obj[key] = metadata[key];
              return obj;
            }, {} as Record<string, any>);
          
          if (Object.keys(relevantMeta).length > 0) {
            msg += ` ${JSON.stringify(relevantMeta)}`;
          }
        }
        
        return msg;
      })
    )
  }));
}

/**
 * Enhanced error logging with full context
 */
export function logError(
  error: Error | unknown,
  context?: {
    tool?: string;
    operation?: string;
    input?: any;
    api?: string;
    apiKey?: string;
    userId?: string;
    [key: string]: any;
  }
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  enhancedLogger.error(errorObj.message, {
    error: {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
      cause: (errorObj as any).cause
    },
    ...context,
    timestamp: new Date().toISOString(),
    severity: 'ERROR'
  });
}

/**
 * Log critical crashes that require immediate attention
 */
export function logCrash(
  error: Error | unknown,
  context?: {
    tool?: string;
    operation?: string;
    state?: any;
    [key: string]: any;
  }
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  enhancedLogger.error(`CRASH: ${errorObj.message}`, {
    error: {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack
    },
    ...context,
    timestamp: new Date().toISOString(),
    severity: 'CRITICAL',
    alert: true,
    requiresAction: true
  });
  
  // Write crash dump
  const crashDump = {
    timestamp: new Date().toISOString(),
    error: {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack
    },
    context,
    process: {
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      version: process.version
    }
  };
  
  const crashFile = path.join(crashDir, `crash-${Date.now()}.json`);
  fs.writeFileSync(crashFile, JSON.stringify(crashDump, null, 2));
}

/**
 * Log API-related errors (key issues, rate limits, timeouts)
 */
export function logAPIError(
  api: string,
  error: Error | unknown,
  context?: {
    endpoint?: string;
    statusCode?: number;
    rateLimit?: boolean;
    timeout?: boolean;
    invalidKey?: boolean;
    [key: string]: any;
  }
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  enhancedLogger.error(`API Error: ${api}`, {
    api,
    error: {
      message: errorObj.message,
      stack: errorObj.stack
    },
    ...context,
    timestamp: new Date().toISOString(),
    category: 'API_ERROR'
  });
}

/**
 * Log tool-specific errors
 */
export function logToolError(
  toolName: string,
  error: Error | unknown,
  context?: {
    input?: any;
    operation?: string;
    phase?: string;
    [key: string]: any;
  }
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  enhancedLogger.error(`Tool Error: ${toolName}`, {
    tool: toolName,
    error: {
      message: errorObj.message,
      stack: errorObj.stack
    },
    ...context,
    timestamp: new Date().toISOString(),
    category: 'TOOL_ERROR'
  });
}

/**
 * Log MCP server errors
 */
export function logMCPError(
  error: Error | unknown,
  context?: {
    request?: any;
    toolName?: string;
    [key: string]: any;
  }
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  enhancedLogger.error(`MCP Server Error`, {
    error: {
      message: errorObj.message,
      stack: errorObj.stack
    },
    ...context,
    timestamp: new Date().toISOString(),
    category: 'MCP_ERROR',
    severity: 'HIGH'
  });
}

/**
 * Log performance issues (slow operations)
 */
export function logPerformanceIssue(
  operation: string,
  duration: number,
  threshold: number,
  context?: Record<string, any>
): void {
  if (duration > threshold) {
    enhancedLogger.warn(`Performance Issue: ${operation}`, {
      operation,
      duration_ms: duration,
      threshold_ms: threshold,
      exceeded_by_ms: duration - threshold,
      exceeded_by_percent: ((duration - threshold) / threshold * 100).toFixed(1),
      ...context,
      timestamp: new Date().toISOString(),
      category: 'PERFORMANCE'
    });
  }
}

/**
 * Log with full context
 */
export function logWithContext(
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context?: Record<string, any>
): void {
  enhancedLogger.log(level, message, {
    ...context,
    timestamp: new Date().toISOString()
  });
}

/**
 * Log successful operations (for audit trail)
 */
export function logSuccess(
  operation: string,
  context?: Record<string, any>
): void {
  enhancedLogger.info(`Success: ${operation}`, {
    operation,
    ...context,
    timestamp: new Date().toISOString(),
    status: 'SUCCESS'
  });
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  crashes: number;
  errors: number;
  apiErrors: number;
  toolErrors: number;
  lastError?: string;
} {
  try {
    const crashFiles = fs.readdirSync(crashDir).filter(f => f.endsWith('.json'));
    const errorLog = path.join(errorDir, 'error.log');
    const apiLog = path.join(apiDir, 'api-errors.log');
    const toolLog = path.join(toolsDir, 'tool-errors.log');
    
    const countLines = (file: string): number => {
      try {
        if (!fs.existsSync(file)) return 0;
        return fs.readFileSync(file, 'utf-8').split('\n').filter(l => l.trim()).length;
      } catch {
        return 0;
      }
    };
    
    return {
      crashes: crashFiles.length,
      errors: countLines(errorLog),
      apiErrors: countLines(apiLog),
      toolErrors: countLines(toolLog)
    };
  } catch (error) {
    return {
      crashes: 0,
      errors: 0,
      apiErrors: 0,
      toolErrors: 0
    };
  }
}

/**
 * Clear old logs (cleanup)
 */
export function cleanupOldLogs(daysToKeep: number = 30): void {
  const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  
  const cleanDirectory = (dir: string) => {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs < cutoffDate) {
          fs.unlinkSync(filePath);
          enhancedLogger.info(`Cleaned up old log: ${file}`);
        }
      });
    } catch (error) {
      enhancedLogger.error(`Error cleaning directory ${dir}:`, error);
    }
  };
  
  [crashDir, errorDir, apiDir, toolsDir, performanceDir].forEach(cleanDirectory);
}

/**
 * Export crash report for debugging
 */
export function exportCrashReport(outputPath?: string): string {
  const stats = getErrorStats();
  const report = {
    timestamp: new Date().toISOString(),
    statistics: stats,
    recentCrashes: [],
    recentErrors: [],
    systemInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  const reportPath = outputPath || path.join(logsDir, `crash-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  enhancedLogger.info(`Crash report exported to ${reportPath}`);
  return reportPath;
}

// Setup process handlers
process.on('uncaughtException', (error: Error) => {
  logCrash(error, {
    type: 'uncaughtException',
    fatal: true
  });
  // Give time for logs to flush
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logCrash(new Error(`Unhandled Rejection: ${reason}`), {
    type: 'unhandledRejection',
    reason: String(reason),
    promise: String(promise)
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  enhancedLogger.info('SIGTERM received, shutting down gracefully');
  enhancedLogger.end();
});

process.on('SIGINT', () => {
  enhancedLogger.info('SIGINT received, shutting down gracefully');
  enhancedLogger.end();
});

export default enhancedLogger;
