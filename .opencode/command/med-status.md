---
description: Show comprehensive status and health of MedResearch-AI project
---

# MedResearch-AI Status

Display comprehensive status information including build health, test results, error statistics, restore points, and system health.

## Usage

Just type `/med-status`

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Checks build status
3. Reviews recent test results
4. Analyzes error logs
5. Checks restore point health
6. Reviews command history
7. Provides overall health assessment

## Example

```
User: /med-status
Assistant: Analyzing MedResearch-AI project status...

╔════════════════════════════════════════════════════════════╗
║           MedResearch AI - Project Status Report           ║
║                   Generated: 2025-12-05 12:30              ║
╚════════════════════════════════════════════════════════════╝

📦 PROJECT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Name:           MedResearch AI
  Version:        5.1.0
  Location:       C:\...\MedResearch-AI
  Node Version:   v18.17.0
  Last Modified:  2025-12-05 11:45:23

🔨 BUILD STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Status:         ✅ PASSING
  Last Build:     2025-12-05 11:30:15
  Duration:       3.2s
  Files:          53 compiled
  Errors:         0
  Warnings:       0
  Output:         dist/ (12.5 MB)

🧪 TEST STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Last Run:       2025-12-05 10:15:30
  Status:         ✅ ALL PASSING
  Total Tests:    61
  Passed:         61
  Failed:         0
  Duration:       28.7s
  Coverage:       87.3%

  Test Suites:
    ✅ Database Integration (7/7)
    ✅ Plagiarism Detection (18/18)
    ✅ Meta-Analysis (28/28)
    ✅ Utilities (8/8)

🔴 ERROR STATISTICS (Last 24 Hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Crashes:        0  ✅
  Errors:         3  ⚠️
  API Errors:     1  ✅
  Tool Errors:    2  ✅
  Performance:    5  ⚠️
  
  Error Rate:     0.3 errors/hour (Normal)
  Trend:          ↓ Decreasing

💾 RESTORE POINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Points:   12
  Snapshots:      4
  Deltas:         8
  Total Size:     9.7 MB
  Oldest:         2025-11-10 (25 days ago)
  Newest:         2025-12-05 (today)
  
  Latest Restore Point:
    ID:           xyz789-abc123-456
    Description:  Phase 2 completion
    Type:         Snapshot
    Created:      2025-12-05 10:30:00

📜 COMMAND HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Commands: 127
  Completed:      120 (94.5%)
  Failed:         5 (3.9%)
  Undone:         2 (1.6%)
  
  Recent Activity:
    [11:30] Build project
    [11:25] Run database tests
    [11:20] Create restore point
    [11:15] Update configuration
    [11:10] Execute NLP extraction

💻 SYSTEM RESOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Disk Space:     45.2 GB free (of 250 GB)
  Memory Usage:   2.3 GB / 16 GB
  CPU Usage:      12%
  
  Log Storage:
    Total:        15.8 MB
    Crashes:      245 KB
    Errors:       1.2 MB
    API:          156 KB
    Tools:        423 KB
    Performance:  890 KB
    Combined:     3.4 MB

🎯 OVERALL HEALTH ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Status:         ✅ HEALTHY
  Score:          92/100
  
  ✅ Build passing
  ✅ All tests passing
  ✅ Low error rate
  ✅ Restore points available
  ⚠️  Some performance issues detected
  ✅ Adequate disk space
  ✅ Good memory usage

💡 RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. ⚠️  Review 5 performance issues in logs
  2. ✅  Create restore point before next major change
  3. ℹ️  Consider running /cleanup-restores (12 points)
  4. ✅  Test coverage is good (87.3%)
  5. ℹ️  Log rotation recommended in 2 days

🔗 QUICK ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /test-med          - Run all tests
  /create-restore    - Create restore point
  /monitor-errors    - Monitor errors
  /rollback-history  - View command history
  /cleanup-restores  - Cleanup old restore points
```

## Health Score Calculation

**Score Components:**
- Build Status (20 points)
- Test Results (20 points)
- Error Rate (20 points)
- Restore Points (15 points)
- System Resources (15 points)
- Code Quality (10 points)

**Score Ranges:**
- 90-100: ✅ HEALTHY
- 70-89: ⚠️ FAIR
- 50-69: ⚠️ NEEDS ATTENTION
- 0-49: 🔴 CRITICAL

## Status Categories

### 1. Project Information
- Basic project metadata
- Version information
- Location and timestamps

### 2. Build Status
- Compilation results
- Error/warning counts
- Build duration
- Output size

### 3. Test Status
- Test suite results
- Pass/fail counts
- Coverage metrics
- Last run timestamp

### 4. Error Statistics
- 24-hour error summary
- Error categorization
- Trend analysis
- Rate calculations

### 5. Restore Points
- Backup availability
- Storage usage
- Latest restore point
- Retention status

### 6. Command History
- Operation tracking
- Success/failure rates
- Recent activity
- Undo/redo status

### 7. System Resources
- Disk space
- Memory usage
- CPU utilization
- Log file sizes

### 8. Health Assessment
- Overall score
- Status indicators
- Issue summary
- Recommendations

## When to Use

- **Daily health checks** - Morning status review
- **Before major changes** - Pre-operation assessment
- **After deployments** - Post-deployment verification
- **Troubleshooting** - Understanding current state
- **Planning** - Capacity and maintenance planning
- **Reporting** - Status documentation

## Automated Checks

The status command automatically checks:
- ✅ Build compilation
- ✅ Test results
- ✅ Error logs
- ✅ Restore point availability
- ✅ Disk space
- ✅ Log file sizes
- ✅ Command history
- ✅ System resources

## Export Status

To export status report:
```
User: Export status report
Assistant: Exporting status to file...
✅ Status exported to: status-report-20251205-123045.md
```

## Related Commands

- `/med-build` - Build project
- `/test-med` - Run all tests
- `/monitor-errors` - Monitor errors
- `/restore-stats` - Restore point statistics
- `/rollback-history` - Command history

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
