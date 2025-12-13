---
description: Cleanup old restore points for MedResearch-AI project
---

# Cleanup Restore Points

Remove restore points older than 30 days to free up storage space.

## Usage

Just type `/cleanup-restores`

## What This Command Does

1. Navigates to MedResearch-AI project directory
2. Shows current restore point statistics
3. Identifies restore points older than 30 days
4. Asks for confirmation before deletion
5. Runs `npm run restore -- cleanup`
6. Reports cleanup results
7. Shows updated statistics

## Example

```
User: /cleanup-restores
Assistant: Current restore points: 15 (12.5 MB)
Found 3 restore points older than 30 days (2.8 MB)

Restore points to be deleted:
- abc123-def456-789 (2025-10-05) - "Old phase 1 backup"
- def456-ghi789-012 (2025-10-12) - "Test snapshot"
- ghi789-jkl012-345 (2025-10-20) - "Pre-refactor"

Are you sure you want to delete these? (yes/no)
User: yes
Assistant: Cleaning up old restore points...
✅ Cleanup completed
  Deleted: 3 restore points
  Freed:   2.8 MB
  
Updated statistics:
  Total restore points: 12
  Total size:           9.7 MB
```

## Safety Features

- Shows what will be deleted before confirmation
- Requires explicit confirmation
- Never deletes points less than 30 days old
- Reports exactly what was deleted
- Shows updated statistics

## Retention Policy

- **Default retention**: 30 days
- **Automatic cleanup**: Runs during restore point creation
- **Manual cleanup**: Use this command anytime
- **Protected points**: Recent points are never deleted

## When to Use

- Storage space is running low
- Too many old restore points
- Regular maintenance
- Before creating many new restore points
- After completing major project phases

## Related Commands

- `/restore-stats` - Check storage usage first
- `/list-restores` - See all restore points
- `/create-restore` - Create new restore point

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
