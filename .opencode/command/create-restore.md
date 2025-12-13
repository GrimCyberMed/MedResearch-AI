---
description: Create a new restore point for MedResearch-AI project
---

# Create Restore Point

Create a snapshot of the current MedResearch-AI project state for later restoration.

## Usage

Just type `/create-restore` and provide a description when prompted.

## What This Command Does

1. Navigates to MedResearch-AI project directory
2. Prompts for a description of the restore point
3. Runs `npm run restore -- create "<description>"`
4. Shows the created restore point ID and details
5. Provides next steps and recommendations

## Example

```
User: /create-restore
Assistant: What description would you like for this restore point?
User: Before Phase 3 implementation
Assistant: Creating restore point...
✅ Restore point created: abc123-def456-789
  Type:      Snapshot
  Size:      2.3 MB
  Timestamp: 2025-12-05 12:00:00
```

## When to Use

- Before major refactoring
- Before upgrading dependencies
- Before deploying to production
- At phase boundaries
- Before risky operations
- After completing major features

## Related Commands

- `/list-restores` - List all restore points
- `/restore-to` - Restore to a specific point
- `/restore-stats` - Show statistics
- `/cleanup-restores` - Cleanup old points

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
