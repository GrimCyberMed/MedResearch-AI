---
description: Start error monitoring dashboard for MedResearch-AI project
---

# Error Monitoring Dashboard

Start the real-time error monitoring dashboard for the MedResearch-AI project to track crashes, errors, API failures, and performance issues.

## Usage

Just type `/monitor-errors`

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Runs `npm run monitor`
3. Displays real-time error statistics
4. Shows recent errors and crashes
5. Monitors log file sizes
6. Auto-refreshes every 10 seconds

## Example

```
User: /monitor-errors
Assistant: Starting MedResearch-AI error monitoring dashboard...

╔════════════════════════════════════════════════════════════╗
║         MedResearch AI - Error Monitoring Dashboard        ║
║                    Last Updated: 12:30:45                  ║
╚════════════════════════════════════════════════════════════╝

📊 ERROR STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Crashes:        2
  Total Errors:         15
  API Errors:           3
  Tool Errors:          5
  Performance Issues:   7

📁 LOG FILE SIZES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  crashes/crash.log:           245 KB
  errors/error.log:            1.2 MB
  api/api-errors.log:          156 KB
  tools/tool-errors.log:       423 KB
  performance/performance.log: 890 KB
  combined.log:                3.4 MB

🔴 RECENT ERRORS (Last 5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[12:28:15] API Error - PubMed: Rate limit exceeded
[12:25:03] Tool Error - NLP extraction: Invalid input format
[12:20:45] Performance - Database query: 3.2s (threshold: 2s)
[12:15:22] Error - Cache: Failed to write cache entry
[12:10:08] API Error - Semantic Scholar: Connection timeout

💡 RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⚠️  API rate limits detected - Consider implementing backoff
  ⚠️  Performance issues in database queries - Review indexes
  ✅  Error rate is within acceptable limits
  ℹ️  Log rotation recommended (combined.log > 3 MB)

Press Ctrl+C to stop monitoring...
[Auto-refresh in 10 seconds]
```

## Dashboard Sections

### 1. Error Statistics
- **Total Crashes** - Critical system failures
- **Total Errors** - All logged errors
- **API Errors** - External API failures
- **Tool Errors** - MCP tool failures
- **Performance Issues** - Slow operations

### 2. Log File Sizes
- Real-time file size monitoring
- Alerts when files exceed thresholds
- Rotation recommendations
- Storage usage tracking

### 3. Recent Errors
- Last 5-10 errors with timestamps
- Error type and source
- Brief error message
- Color-coded severity

### 4. Recommendations
- Automated issue detection
- Actionable suggestions
- Health status indicators
- Maintenance reminders

## Features

- **Real-time Updates** - Refreshes every 10 seconds
- **Color Coding** - Visual severity indicators
- **Trend Analysis** - Error rate tracking
- **Smart Alerts** - Proactive issue detection
- **Log Rotation** - Size-based recommendations

## When to Use

- During active development
- Debugging production issues
- Performance monitoring
- Health checks
- Before/after deployments
- Long-running operations

## Monitoring Modes

### Standard Mode (default)
```
/monitor-errors
```
- 10-second refresh
- Last 5 errors
- Basic statistics

### Watch Mode (continuous)
```
/monitor-watch
```
- 5-second refresh
- Last 10 errors
- Detailed statistics
- Trend graphs

## Stopping the Dashboard

Press `Ctrl+C` to stop monitoring and return to normal operation.

## Related Commands

- `/monitor-watch` - Enhanced monitoring mode
- `/test-med` - Run tests to check health
- `/rollback-history` - Review command history
- `/restore-stats` - Check restore point health

## Log Locations

All logs stored in:
`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI\logs\`

- `crashes/` - Critical crashes
- `errors/` - All errors
- `api/` - API-specific errors
- `tools/` - Tool-specific errors
- `performance/` - Performance issues

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
