---
description: Show restore point statistics for MedResearch-AI project
---

# Restore Point Statistics

Display comprehensive statistics about restore points including counts, sizes, and dates.

## Usage

Just type `/restore-stats`

## What This Command Does

1. Navigates to MedResearch-AI project directory
2. Runs `npm run restore -- stats`
3. Displays comprehensive statistics
4. Shows storage usage
5. Provides recommendations if needed

## Example Output

```
Restore Point Statistics:

  Total restore points: 15
  Snapshots:            5
  Deltas:               10
  Total size:           12.5 MB
  Oldest point:         2025-11-05 10:00:00
  Newest point:         2025-12-05 12:00:00

Storage Analysis:
  Average snapshot size: 2.5 MB
  Average delta size:    150 KB
  Compression ratio:     78%
  
Recommendations:
  ✅ Storage usage is healthy
  ✅ Retention policy active (30 days)
  ℹ️  Consider cleanup if storage exceeds 50 MB
```

## Statistics Explained

- **Total restore points** - All snapshots and deltas
- **Snapshots** - Full project backups
- **Deltas** - Incremental changes
- **Total size** - Compressed storage used
- **Oldest/Newest point** - Date range of restore points
- **Compression ratio** - Storage efficiency

## When to Use

- Monitoring storage usage
- Planning cleanup operations
- Understanding restore point distribution
- Verifying retention policy
- Troubleshooting restore issues

## Related Commands

- `/list-restores` - List all restore points
- `/cleanup-restores` - Cleanup old points
- `/create-restore` - Create new restore point

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
