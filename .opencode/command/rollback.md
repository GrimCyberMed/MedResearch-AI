---
description: Interactive rollback menu for MedResearch-AI project
---

# Interactive Rollback

Interactive menu for rolling back MedResearch-AI project to a previous state.

## Usage

Just type `/rollback`

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Shows available rollback options
3. Displays recent command history
4. Lists available restore points
5. Prompts for rollback method
6. Executes selected rollback
7. Verifies success

## Example

```
User: /rollback
Assistant: MedResearch-AI Rollback Menu

Recent Commands (last 10):
[✓] abc123 - NLP data extraction (11:30:00)
[✓] def456 - Database query (11:25:00)
[✓] ghi789 - File operation (11:20:00)
...

Available Restore Points:
[SNAPSHOT] xyz789 - Phase 2 completion (10:30:00)
[DELTA] uvw456 - Added new tools (11:15:00)

Rollback Options:
1. Undo last command
2. Rollback to specific time
3. Rollback to specific command
4. Rollback to restore point
5. Cancel

Select option (1-5):
User: 2
Assistant: Enter timestamp (YYYY-MM-DDTHH:MM:SS):
User: 2025-12-05T11:00:00
Assistant: ⚠️ This will undo all commands after 2025-12-05 11:00:00
Commands to be undone: 5

Are you sure? (yes/no)
User: yes
Assistant: Rolling back...
✅ Rollback completed successfully!
  Commands undone: 5
  Duration:        3.2s
```

## Rollback Methods

### 1. Undo Last Command
- Quick undo of most recent operation
- Same as `/undo` command
- Fastest method

### 2. Rollback to Specific Time
- Undo all commands after timestamp
- Format: `YYYY-MM-DDTHH:MM:SS`
- Example: `2025-12-05T10:30:00`

### 3. Rollback to Specific Command
- Undo all commands after a specific command ID
- Precise control over rollback point
- Useful when you know the exact command

### 4. Rollback to Restore Point
- Full project restoration from snapshot
- Safest method for major rollbacks
- Fastest restoration time

## Safety Features

- Shows what will be affected before rollback
- Requires explicit confirmation
- Displays number of commands to be undone
- Verifies rollback success
- Provides post-rollback recommendations

## When to Use

- Need to choose between multiple rollback methods
- Unsure which rollback method to use
- Want to see all options at once
- Complex rollback scenario
- Comparing different rollback points

## Related Commands

- `/undo` - Quick undo last command
- `/rollback-time` - Direct time-based rollback
- `/rollback-history` - Show command history
- `/restore-to` - Restore to specific point

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
