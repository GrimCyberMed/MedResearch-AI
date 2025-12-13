---
description: Start enhanced error monitoring dashboard with watch mode for MedResearch-AI
---

# Enhanced Error Monitoring (Watch Mode)

Start the enhanced error monitoring dashboard with faster refresh rate, detailed statistics, and trend analysis for the MedResearch-AI project.

## Usage

Just type `/monitor-watch`

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Runs `npm run dashboard:watch`
3. Displays comprehensive error statistics
4. Shows last 10 errors with full details
5. Displays error rate trends
6. Auto-refreshes every 5 seconds

## Example

```
User: /monitor-watch
Assistant: Starting enhanced error monitoring dashboard...

╔════════════════════════════════════════════════════════════╗
║    MedResearch AI - Enhanced Monitoring Dashboard (WATCH)  ║
║                    Last Updated: 12:30:45                  ║
╚════════════════════════════════════════════════════════════╝

📊 DETAILED ERROR STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Crashes:        2  (↓ 0 from last check)
  Total Errors:         15 (↑ 1 from last check)
  API Errors:           3  (→ 0 from last check)
  Tool Errors:          5  (→ 0 from last check)
  Performance Issues:   7  (↑ 1 from last check)

📈 ERROR RATE TRENDS (Last Hour)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  12:00-12:15  ▂▂▂▃▃  (5 errors)
  12:15-12:30  ▃▄▅▆▇  (12 errors) ⚠️ Spike detected
  12:30-12:45  ▃▃▂▂▁  (6 errors)
  12:45-13:00  ▂▁▁▁▁  (2 errors)

📁 LOG FILE SIZES & GROWTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  crashes/crash.log:           245 KB  (+2 KB/min)
  errors/error.log:            1.2 MB  (+15 KB/min)
  api/api-errors.log:          156 KB  (+3 KB/min)
  tools/tool-errors.log:       423 KB  (+8 KB/min)
  performance/performance.log: 890 KB  (+12 KB/min)
  combined.log:                3.4 MB  (+25 KB/min)

🔴 RECENT ERRORS (Last 10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[12:30:15] 🔴 CRITICAL - Crash: Unhandled exception
  Location: src/mcp/tools/nlp-data-extraction.ts:145
  Message:  Cannot read property 'text' of undefined
  Stack:    at extractData (nlp-data-extraction.ts:145:23)

[12:28:15] 🟠 ERROR - API: PubMed rate limit exceeded
  Endpoint: /esearch.fcgi
  Status:   429
  Retry:    60 seconds

[12:25:03] 🟡 WARNING - Tool: NLP extraction slow
  Duration: 3.2s (threshold: 2s)
  Input:    15 documents
  
[12:20:45] 🟠 ERROR - Performance: Database query timeout
  Query:    SELECT * FROM studies WHERE...
  Duration: 5.1s (timeout: 5s)

[12:15:22] 🟡 WARNING - Cache: Write failed
  Key:      pubmed_search_abc123
  Reason:   Disk full

... (5 more errors)

💡 SMART RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 URGENT: Unhandled exception detected - Review nlp-data-extraction.ts
  ⚠️  ERROR SPIKE: 12:15-12:30 had 2x normal rate - Investigate cause
  ⚠️  API RATE LIMITS: PubMed hitting limits - Implement exponential backoff
  ⚠️  PERFORMANCE: Database queries slow - Review indexes and query optimization
  ⚠️  STORAGE: Disk space low - Clean up old logs or increase storage
  ✅  Overall system health: FAIR (15 errors in last hour)

🎯 QUICK ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. /rollback-time "2025-12-05T12:15:00" - Rollback to before spike
  2. /create-restore - Create restore point before fixes
  3. /test-med - Run tests to verify current state
  4. View crash dump: logs/crashes/crash-1733400615.json

Press Ctrl+C to stop monitoring...
[Auto-refresh in 5 seconds]
```

## Enhanced Features

### 1. Trend Analysis
- Error rate graphs (last hour)
- Spike detection
- Pattern recognition
- Predictive alerts

### 2. Detailed Error Display
- Full stack traces
- Source file locations
- Error context
- Severity color coding

### 3. Growth Tracking
- Log file growth rates
- Storage predictions
- Rotation recommendations
- Disk space alerts

### 4. Smart Recommendations
- Automated issue detection
- Prioritized action items
- Quick fix suggestions
- Related command suggestions

### 5. Quick Actions
- One-click rollback commands
- Direct links to crash dumps
- Test execution shortcuts
- Restore point creation

## Severity Levels

- 🔴 **CRITICAL** - System crashes, data loss
- 🟠 **ERROR** - Operation failures, exceptions
- 🟡 **WARNING** - Performance issues, deprecations
- 🔵 **INFO** - Normal operations, state changes
- ⚪ **DEBUG** - Detailed diagnostic information

## Refresh Rate

- **Standard Mode** (`/monitor-errors`): 10 seconds
- **Watch Mode** (`/monitor-watch`): 5 seconds
- **Custom**: Configurable in dashboard settings

## When to Use

- **Active debugging** - Real-time issue tracking
- **Performance tuning** - Monitoring optimizations
- **Production monitoring** - Continuous health checks
- **Incident response** - Rapid issue identification
- **Load testing** - Tracking system under stress

## Stopping the Dashboard

Press `Ctrl+C` to stop monitoring and return to normal operation.

## Export Options

While monitoring, you can:
- Press `E` to export current statistics
- Press `S` to save error snapshot
- Press `C` to clear error counters
- Press `H` to show help

## Related Commands

- `/monitor-errors` - Standard monitoring mode
- `/test-med` - Run comprehensive tests
- `/rollback-time` - Rollback to specific time
- `/create-restore` - Create restore point

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
