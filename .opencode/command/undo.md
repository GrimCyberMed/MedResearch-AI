---
description: Undo the last command in MedResearch-AI project
---

# Undo Last Command

Undo the most recent command executed in the MedResearch-AI project.

## Usage

Just type `/undo`

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Shows the last command that will be undone
3. Asks for confirmation
4. Runs `npm run rollback -- undo`
5. Verifies the undo was successful
6. Shows what was undone

## Example

```
User: /undo
Assistant: Last command in history:
[✓] abc123-def456-789
  Type:        tool-execution
  Description: Execute NLP data extraction
  Timestamp:   2025-12-05 11:30:00
  Status:      completed
  Duration:    1.2s

Are you sure you want to undo this command? (yes/no)
User: yes
Assistant: Undoing last command...
✅ Command undone successfully

The following operation was reversed:
- NLP data extraction on 15 documents
- Results removed from cache
- State restored to 11:29:58
```

## When to Use

- Made a mistake in the last operation
- Want to try a different approach
- Testing different parameters
- Quick recovery from errors
- Iterative development

## Safety Features

- Shows what will be undone before confirmation
- Requires explicit confirmation
- Only undoes completed commands
- Cannot undo failed commands (use `/restore-to` instead)
- Preserves undo history for redo

## Limitations

- Only works on undoable commands
- Cannot undo if command is not in history
- Some operations may not be fully reversible
- For major rollbacks, use `/rollback` or `/restore-to`

## Related Commands

- `/redo` - Redo last undone command
- `/rollback` - Interactive rollback menu
- `/rollback-history` - Show full command history
- `/restore-to` - Restore to specific point

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
