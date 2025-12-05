#!/usr/bin/env node

/**
 * Error Monitoring Script
 * 
 * Monitors error logs and provides real-time statistics
 * Run: node scripts/monitor-errors.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../logs');
const crashDir = path.join(logsDir, 'crashes');
const errorDir = path.join(logsDir, 'errors');
const apiDir = path.join(logsDir, 'api');
const toolsDir = path.join(logsDir, 'tools');

// Ensure directories exist
[logsDir, crashDir, errorDir, apiDir, toolsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Count lines in a file
 */
function countLines(filePath) {
  try {
    if (!fs.existsSync(filePath)) return 0;
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').filter(line => line.trim()).length;
  } catch (error) {
    return 0;
  }
}

/**
 * Get file size in MB
 */
function getFileSize(filePath) {
  try {
    if (!fs.existsSync(filePath)) return 0;
    const stats = fs.statSync(filePath);
    return (stats.size / 1024 / 1024).toFixed(2);
  } catch (error) {
    return 0;
  }
}

/**
 * Get recent errors from log file
 */
function getRecentErrors(filePath, count = 5) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    return lines.slice(-count).map(line => {
      try {
        const parsed = JSON.parse(line);
        return {
          timestamp: parsed.timestamp,
          message: parsed.message,
          level: parsed.level
        };
      } catch {
        return { message: line.substring(0, 100) };
      }
    });
  } catch (error) {
    return [];
  }
}

/**
 * Get error statistics
 */
function getErrorStats() {
  const crashFiles = fs.existsSync(crashDir) 
    ? fs.readdirSync(crashDir).filter(f => f.endsWith('.json'))
    : [];
  
  const errorLog = path.join(errorDir, 'error.log');
  const apiLog = path.join(apiDir, 'api-errors.log');
  const toolLog = path.join(toolsDir, 'tool-errors.log');
  const combinedLog = path.join(logsDir, 'combined.log');
  
  return {
    crashes: crashFiles.length,
    errors: countLines(errorLog),
    apiErrors: countLines(apiLog),
    toolErrors: countLines(toolLog),
    totalLogs: countLines(combinedLog),
    logSizes: {
      combined: getFileSize(combinedLog),
      errors: getFileSize(errorLog),
      api: getFileSize(apiLog),
      tools: getFileSize(toolLog)
    }
  };
}

/**
 * Display dashboard
 */
function displayDashboard() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         MedResearch AI - Error Monitoring Dashboard        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const stats = getErrorStats();
  const now = new Date().toLocaleString();
  
  console.log(`📅 Last Updated: ${now}`);
  console.log('');
  
  console.log('📊 ERROR STATISTICS');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`💥 Crashes:        ${stats.crashes.toString().padStart(6)}`);
  console.log(`❌ Errors:         ${stats.errors.toString().padStart(6)}`);
  console.log(`🔌 API Errors:     ${stats.apiErrors.toString().padStart(6)}`);
  console.log(`🔧 Tool Errors:    ${stats.toolErrors.toString().padStart(6)}`);
  console.log(`📝 Total Logs:     ${stats.totalLogs.toString().padStart(6)}`);
  console.log('');
  
  console.log('💾 LOG FILE SIZES');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(`Combined:  ${stats.logSizes.combined} MB`);
  console.log(`Errors:    ${stats.logSizes.errors} MB`);
  console.log(`API:       ${stats.logSizes.api} MB`);
  console.log(`Tools:     ${stats.logSizes.tools} MB`);
  console.log('');
  
  // Alerts
  if (stats.crashes > 0) {
    console.log('⚠️  ALERT: Crashes detected! Check logs/crashes/');
  }
  if (stats.errors > 100) {
    console.log('⚠️  WARNING: High error count (>100)');
  }
  if (stats.apiErrors > 50) {
    console.log('⚠️  WARNING: High API error count (>50)');
  }
  
  // Recent errors
  console.log('');
  console.log('📋 RECENT ERRORS (Last 5)');
  console.log('─────────────────────────────────────────────────────────────');
  const errorLog = path.join(errorDir, 'error.log');
  const recentErrors = getRecentErrors(errorLog, 5);
  
  if (recentErrors.length === 0) {
    console.log('✅ No recent errors');
  } else {
    recentErrors.forEach((error, i) => {
      console.log(`${i + 1}. ${error.timestamp || 'N/A'}`);
      console.log(`   ${error.message.substring(0, 70)}...`);
    });
  }
  
  console.log('');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('Press Ctrl+C to exit | Refreshing every 10 seconds...');
  console.log('');
}

/**
 * Main monitoring loop
 */
function startMonitoring() {
  displayDashboard();
  
  // Refresh every 10 seconds
  setInterval(() => {
    displayDashboard();
  }, 10000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Monitoring stopped');
  process.exit(0);
});

// Start monitoring
console.log('🚀 Starting error monitoring...\n');
startMonitoring();
