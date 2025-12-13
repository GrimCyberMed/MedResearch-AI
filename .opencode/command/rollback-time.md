---
description: Rollback MedResearch-AI project to a specific timestamp
---

# Rollback to Timestamp

Rollback the MedResearch-AI project to a specific point in time by undoing all commands executed after that timestamp.

## Usage

Type `/rollback-time` and provide the timestamp when prompted.

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Prompts for target timestamp
3. Shows all commands that will be undone
4. Asks for confirmation
5. Runs `npm run rollback -- to-time "<timestamp>"`
6. Reports rollback results
7. Provides recommendations

## Example

```
User: /rollback-time
Assistant: Enter the timestamp to rollback to (YYYY-MM-DDTHH:MM:SS):
User: 2025-12-05T10:30:00
Assistant: Commands to be undone (after 2025-12-05 10:30:00):

[✓] abc123 - NLP data extraction (11:30:00)
[✓] def456 - Database query (11:25:00)
[✓] ghi789 - File operation (11:20:00)
[✓] jkl012 - Cache update (10:45:00)
[✓] mno345 - Config change (10:35:00)

Total: 5 commands will be undone

⚠️ WARNING: This will undo all commands after the specified time!
⚠️ This operation cannot be easily reversed.

Are you sure you want to continue? (yes/no)
User: yes
Assistant: Rolling back to: 2025-12-05 10:30:00
✅ Rollback completed successfully!
  Commands undone: 5
  Duration:        3.2s

Recommended next steps:
1. Run /test-med to verify functionality
2. Check /rollback-history to confirm state
3. Create restore point: /create-restore
```

## Timestamp Format

**Required format:** `YYYY-MM-DDTHH:MM:SS`

**Examples:**
- `2025-12-05T10:30:00` - December 5, 2025 at 10:30 AM
- `2025-12-05T14:45:30` - December 5, 2025 at 2:45:30 PM
- `2025-11-20T09:00:00` - November 20, 2025 at 9:00 AM

**Tips:**
- Use 24-hour format (14:00 not 2:00 PM)
- Include seconds (even if :00)
- Use T to separate date and time
- No spaces in timestamp

## When to Use

- "Go back 1 hour" scenarios
- Reverting a series of related changes
- Recovering from a sequence of errors
- Testing different approaches
- Debugging time-based issues

## Safety Features

- Shows all commands that will be undone
- Requires explicit confirmation
- Reports exactly what was undone
- Handles errors gracefully
- Provides post-rollback guidance

## Alternative Methods

If timestamp rollback doesn't work:
- `/rollback` - Interactive menu with all options
- `/restore-to` - Restore from snapshot (faster, safer)
- `/undo` - Just undo last command

## Related Commands

- `/rollback-history` - See command timestamps
- `/rollback` - Interactive rollback menu
- `/restore-to` - Restore to specific point
- `/create-restore` - Create restore point first

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
