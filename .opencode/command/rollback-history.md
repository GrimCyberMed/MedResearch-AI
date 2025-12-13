---
description: Show command history for MedResearch-AI project
---

# Command History

Display the complete command execution history for the MedResearch-AI project.

## Usage

Type `/rollback-history` or `/rollback-history 50` to show specific number of commands.

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Prompts for number of commands to show (default: 20)
3. Runs `npm run rollback -- history <limit>`
4. Displays commands in reverse chronological order
5. Shows status, duration, and errors
6. Provides statistics summary

## Example

```
User: /rollback-history
Assistant: How many commands would you like to see? (default: 20)
User: 10
Assistant: Command History (last 10 commands):

[✓] abc123-def456-789
  Type:        tool-execution
  Description: Execute NLP data extraction
  Timestamp:   2025-12-05 11:30:00
  Status:      completed
  Duration:    1.2s

[✓] def456-ghi789-012
  Type:        database-query
  Description: Query PubMed
  Timestamp:   2025-12-05 11:25:00
  Status:      completed
  Duration:    850ms

[✗] ghi789-jkl012-345
  Type:        file-operation
  Description: Update configuration
  Timestamp:   2025-12-05 11:20:00
  Status:      failed
  Error:       File not found

[↶] jkl012-mno345-678
  Type:        cache-update
  Description: Clear cache
  Timestamp:   2025-12-05 11:15:00
  Status:      undone

Summary:
  Total commands: 10
  Completed: 7
  Failed: 2
  Undone: 1
  Average duration: 950ms
```

## Status Indicators

- **[✓]** - Completed successfully (green)
- **[✗]** - Failed with error (red)
- **[↶]** - Undone (yellow)
- **[⟳]** - Currently executing (blue)
- **[○]** - Pending (gray)

## Information Displayed

For each command:
- **ID** - Unique command identifier
- **Type** - Command type/category
- **Description** - What the command does
- **Timestamp** - When it was executed
- **Status** - Current status
- **Duration** - How long it took
- **Error** - Error message (if failed)
- **Restore Point** - Associated restore point (if any)

## When to Use

- Reviewing recent operations
- Finding a specific command to rollback to
- Debugging issues
- Understanding what happened
- Identifying failed operations
- Planning rollback strategy

## Filtering Options

You can specify how many commands to show:
- `/rollback-history` - Default 20 commands
- `/rollback-history 10` - Last 10 commands
- `/rollback-history 50` - Last 50 commands
- `/rollback-history 100` - Last 100 commands

## Using with Rollback

Common workflow:
1. `/rollback-history` - See what happened
2. Find the command or time to rollback to
3. `/rollback-time` or `/rollback` - Execute rollback
4. `/rollback-history` - Verify rollback

## Related Commands

- `/rollback` - Interactive rollback menu
- `/rollback-time` - Rollback to timestamp
- `/undo` - Undo last command
- `/restore-stats` - Restore point statistics

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
