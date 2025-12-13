---
description: List all restore points for MedResearch-AI project
---

# List Restore Points

Display all available restore points with details including type, timestamp, size, and description.

## Usage

Just type `/list-restores`

## What This Command Does

1. Navigates to MedResearch-AI project directory
2. Runs `npm run restore -- list`
3. Displays all restore points in chronological order
4. Shows snapshot vs delta indicators
5. Displays size, timestamp, and description for each point

## Example Output

```
[SNAPSHOT] abc123-def456-789
  Description: Phase 2 completion
  Timestamp:   2025-12-05 10:30:00
  Phase:       phase-2
  Size:        2.5 MB

[DELTA] ghi789-jkl012-345
  Description: Added new tools
  Timestamp:   2025-12-05 11:15:00
  Phase:       phase-2
  Size:        150 KB
  Files:       5 changed
```

## Understanding Output

- **[SNAPSHOT]** - Full project backup (green)
- **[DELTA]** - Incremental changes (blue)
- **Description** - User-provided description
- **Timestamp** - When restore point was created
- **Phase** - Project phase at creation time
- **Size** - Compressed size on disk
- **Files** - Number of files changed (deltas only)

## Related Commands

- `/create-restore` - Create new restore point
- `/restore-to` - Restore to a specific point
- `/restore-stats` - Show statistics
- `/cleanup-restores` - Cleanup old points

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
