# 🔍 Error Tracking & Monitoring Guide

**Version**: 1.0  
**Last Updated**: December 5, 2025  
**Status**: Active

---

## 📋 Overview

MedResearch AI includes a comprehensive error tracking and monitoring system that captures:
- ✅ **Crashes** - Fatal errors and system crashes
- ✅ **Errors** - All error conditions
- ✅ **API Issues** - API key problems, rate limits, timeouts
- ✅ **Tool Failures** - Individual tool errors
- ✅ **MCP Server Issues** - Server-level problems
- ✅ **Performance Issues** - Slow operations
- ✅ **Audit Trail** - Successful operations

---

## 🗂️ Log Directory Structure

```
logs/
├── combined.log              # All logs
├── medresearch-YYYY-MM-DD.log # Daily logs
├── crashes/
│   ├── crash.log            # Critical crashes
│   ├── exceptions.log       # Uncaught exceptions
│   ├── rejections.log       # Unhandled promise rejections
│   └── crash-*.json         # Crash dumps with full context
├── errors/
│   └── error.log            # All errors
├── api/
│   └── api-errors.log       # API-specific errors
├── tools/
│   └── tool-errors.log      # Tool-specific errors
└── performance/
    └── performance.log      # Performance issues
```

---

## 🚨 Error Types & Logging

### 1. **Critical Crashes**

**When to use**: Fatal errors that crash the system

```typescript
import { logCrash } from '../common/enhanced-logger.js';

try {
  // Critical operation
} catch (error) {
  logCrash(error, {
    tool: 'nlp-data-extraction',
    operation: 'extractPICO',
    state: currentState
  });
  throw error; // Re-throw to stop execution
}
```

**Log Location**: `logs/crashes/crash.log` + `logs/crashes/crash-*.json`

**What's Captured**:
- Error message and stack trace
- Tool/operation context
- System state
- Process info (PID, memory, uptime)
- Timestamp

---

### 2. **General Errors**

**When to use**: Non-fatal errors that should be tracked

```typescript
import { logError } from '../common/enhanced-logger.js';

try {
  await riskyOperation();
} catch (error) {
  logError(error, {
    tool: 'duplicate-detection',
    operation: 'fuzzyMatch',
    input: sanitizedInput
  });
  return { success: false, error: 'Operation failed' };
}
```

**Log Location**: `logs/errors/error.log`

**What's Captured**:
- Error name, message, stack
- Tool and operation context
- Input data (sanitized)
- Timestamp

---

### 3. **API Errors**

**When to use**: API key issues, rate limits, timeouts

```typescript
import { logAPIError } from '../common/enhanced-logger.js';

try {
  const response = await fetch(pubmedUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
} catch (error) {
  logAPIError('PubMed', error, {
    endpoint: '/esearch.fcgi',
    statusCode: 429,
    rateLimit: true,
    query: sanitizedQuery
  });
}
```

**Log Location**: `logs/api/api-errors.log`

**What's Captured**:
- API name
- Endpoint
- Status code
- Rate limit/timeout flags
- Error details

**Common API Errors**:
- `401` - Invalid API key
- `429` - Rate limit exceeded
- `timeout` - Request timeout
- `ECONNREFUSED` - Connection refused

---

### 4. **Tool Errors**

**When to use**: Tool-specific failures

```typescript
import { logToolError } from '../common/enhanced-logger.js';

export async function extractDataNLP(input: ExtractDataNLPInput) {
  try {
    // Tool logic
  } catch (error) {
    logToolError('extract_data_nlp', error, {
      input: { textLength: input.text.length },
      operation: 'PICO extraction',
      phase: 'pattern matching'
    });
    return { success: false, error: 'Extraction failed' };
  }
}
```

**Log Location**: `logs/tools/tool-errors.log`

**What's Captured**:
- Tool name
- Operation/phase
- Input summary
- Error details

---

### 5. **MCP Server Errors**

**When to use**: MCP server-level issues

```typescript
import { logMCPError } from '../common/enhanced-logger.js';

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // Handle request
  } catch (error) {
    logMCPError(error, {
      request: request.params,
      toolName: request.params.name
    });
    return {
      content: [{ type: 'text', text: 'Server error' }],
      isError: true
    };
  }
});
```

**Log Location**: `logs/errors/error.log` (tagged as MCP_ERROR)

**What's Captured**:
- Request details
- Tool name
- Error details
- High severity flag

---

### 6. **Performance Issues**

**When to use**: Operations exceeding performance targets

```typescript
import { logPerformanceIssue } from '../common/enhanced-logger.js';

const startTime = Date.now();
const result = await slowOperation();
const duration = Date.now() - startTime;

logPerformanceIssue(
  'nlp-data-extraction',
  duration,
  5000, // 5s threshold
  {
    textLength: input.text.length,
    picoElements: result.pico.population.length
  }
);
```

**Log Location**: `logs/performance/performance.log`

**What's Captured**:
- Operation name
- Duration (ms)
- Threshold (ms)
- How much exceeded
- Context data

---

## 📊 Monitoring & Analysis

### **Check Error Statistics**

```typescript
import { getErrorStats } from '../common/enhanced-logger.js';

const stats = getErrorStats();
console.log(stats);
// {
//   crashes: 2,
//   errors: 45,
//   apiErrors: 12,
//   toolErrors: 8
// }
```

### **Export Crash Report**

```typescript
import { exportCrashReport } from '../common/enhanced-logger.js';

const reportPath = exportCrashReport();
// Creates: logs/crash-report-{timestamp}.json
```

**Report Contents**:
- Error statistics
- Recent crashes
- Recent errors
- System information
- Memory usage
- Process uptime

---

## 🔍 Log Analysis

### **View Recent Errors**

```bash
# Last 50 errors
tail -50 logs/errors/error.log

# Search for specific error
grep "PMID" logs/errors/error.log

# Count errors by type
grep -o '"category":"[^"]*"' logs/errors/error.log | sort | uniq -c
```

### **View Crashes**

```bash
# List all crash dumps
ls -lt logs/crashes/crash-*.json

# View latest crash
cat logs/crashes/crash-*.json | tail -1 | jq .

# Count crashes
ls logs/crashes/crash-*.json | wc -l
```

### **View API Errors**

```bash
# Recent API errors
tail -50 logs/api/api-errors.log

# Count by API
grep -o '"api":"[^"]*"' logs/api/api-errors.log | sort | uniq -c

# Find rate limit errors
grep "rateLimit" logs/api/api-errors.log
```

### **View Tool Errors**

```bash
# Recent tool errors
tail -50 logs/tools/tool-errors.log

# Count by tool
grep -o '"tool":"[^"]*"' logs/tools/tool-errors.log | sort | uniq -c

# Find specific tool errors
grep "extract_data_nlp" logs/tools/tool-errors.log
```

### **View Performance Issues**

```bash
# Recent slow operations
tail -50 logs/performance/performance.log

# Find operations over 10s
grep -E '"duration_ms":[0-9]{5,}' logs/performance/performance.log
```

---

## 🛠️ Troubleshooting Common Issues

### **Issue: API Key Errors**

**Symptoms**:
```
API Error: PubMed
statusCode: 401
invalidKey: true
```

**Solution**:
1. Check `.env` file for correct API key
2. Verify API key is active
3. Check API key permissions
4. Regenerate API key if needed

**Log Location**: `logs/api/api-errors.log`

---

### **Issue: Rate Limit Exceeded**

**Symptoms**:
```
API Error: PubMed
statusCode: 429
rateLimit: true
```

**Solution**:
1. Implement exponential backoff
2. Add delays between requests
3. Use caching to reduce API calls
4. Upgrade API tier if available

**Log Location**: `logs/api/api-errors.log`

---

### **Issue: Tool Crashes**

**Symptoms**:
```
Tool Error: extract_data_nlp
error: "Cannot read property 'length' of undefined"
```

**Solution**:
1. Check crash dump: `logs/crashes/crash-*.json`
2. Review input validation
3. Add null checks
4. Fix and test

**Log Location**: `logs/tools/tool-errors.log` + `logs/crashes/`

---

### **Issue: MCP Server Errors**

**Symptoms**:
```
MCP Server Error
toolName: "detect_duplicates"
severity: HIGH
```

**Solution**:
1. Check MCP server logs
2. Verify tool registration
3. Check input schema
4. Restart MCP server

**Log Location**: `logs/errors/error.log` (category: MCP_ERROR)

---

### **Issue: Performance Degradation**

**Symptoms**:
```
Performance Issue: nlp-data-extraction
duration_ms: 8500
threshold_ms: 5000
exceeded_by_percent: 70.0
```

**Solution**:
1. Review performance log
2. Identify bottleneck
3. Optimize algorithm
4. Add caching
5. Consider pagination

**Log Location**: `logs/performance/performance.log`

---

## 🔄 Log Rotation & Cleanup

### **Automatic Cleanup**

```typescript
import { cleanupOldLogs } from '../common/enhanced-logger.js';

// Clean logs older than 30 days
cleanupOldLogs(30);
```

### **Manual Cleanup**

```bash
# Delete logs older than 30 days
find logs/ -name "*.log" -mtime +30 -delete

# Archive old logs
tar -czf logs-archive-$(date +%Y%m%d).tar.gz logs/
```

### **Log Rotation Schedule**

- **Daily logs**: Kept for 30 days
- **Error logs**: Kept for 90 days
- **Crash dumps**: Kept indefinitely (manual cleanup)
- **Performance logs**: Kept for 30 days

---

## 📈 Monitoring Dashboard

### **Create Monitoring Script**

```typescript
// scripts/monitor.ts
import { getErrorStats, exportCrashReport } from '../src/common/enhanced-logger.js';

setInterval(() => {
  const stats = getErrorStats();
  
  console.log('=== Error Statistics ===');
  console.log(`Crashes: ${stats.crashes}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`API Errors: ${stats.apiErrors}`);
  console.log(`Tool Errors: ${stats.toolErrors}`);
  
  // Alert if too many errors
  if (stats.crashes > 5) {
    console.error('⚠️ HIGH CRASH COUNT!');
    exportCrashReport();
  }
  
  if (stats.errors > 100) {
    console.warn('⚠️ HIGH ERROR COUNT!');
  }
}, 60000); // Every minute
```

### **Run Monitor**

```bash
npm run monitor
```

---

## 🚨 Alert Configuration

### **Email Alerts** (Optional)

```typescript
import nodemailer from 'nodemailer';

function sendAlert(subject: string, body: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ALERT_EMAIL,
      pass: process.env.ALERT_PASSWORD
    }
  });
  
  transporter.sendMail({
    from: process.env.ALERT_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: `[MedResearch AI] ${subject}`,
    text: body
  });
}

// Use in crash handler
process.on('uncaughtException', (error) => {
  logCrash(error);
  sendAlert('CRITICAL: System Crash', error.stack);
});
```

---

## 📋 Best Practices

### **DO**
✅ Log all errors with context
✅ Use appropriate log levels
✅ Include tool/operation names
✅ Sanitize sensitive data
✅ Log performance metrics
✅ Review logs regularly
✅ Set up alerts for critical errors
✅ Clean up old logs

### **DON'T**
❌ Log passwords or API keys
❌ Log full user data
❌ Ignore error logs
❌ Let logs grow indefinitely
❌ Log at debug level in production
❌ Expose error details to users

---

## 🔗 Integration with Existing Code

### **Update Tool to Use Enhanced Logger**

```typescript
// Before
import { logger } from '../../common/logger.js';

try {
  // operation
} catch (error) {
  logger.error('Operation failed', error);
}

// After
import { logToolError } from '../../common/enhanced-logger.js';

try {
  // operation
} catch (error) {
  logToolError('tool-name', error, {
    operation: 'specific-operation',
    input: sanitizedInput
  });
}
```

---

## 📞 Support

If you encounter persistent errors:

1. **Check logs** in `logs/` directory
2. **Export crash report**: `exportCrashReport()`
3. **Create GitHub issue** with:
   - Error message
   - Stack trace
   - Crash report
   - Steps to reproduce
4. **Contact maintainers** via GitHub

---

## ✅ Checklist

### **Setup**
- [ ] Enhanced logger installed
- [ ] Log directories created
- [ ] Environment variables configured
- [ ] Log rotation configured

### **Monitoring**
- [ ] Review logs daily
- [ ] Check error statistics weekly
- [ ] Export crash reports monthly
- [ ] Clean up old logs monthly

### **Alerts**
- [ ] Configure email alerts (optional)
- [ ] Set up monitoring dashboard (optional)
- [ ] Define alert thresholds
- [ ] Test alert system

---

**Last Updated**: December 5, 2025  
**Version**: 1.0  
**Status**: Active
