---
description: Restore MedResearch-AI project to a specific restore point
---

# Restore to Point

Restore the MedResearch-AI project to a previous state using a restore point.

## Usage

Type `/restore-to` and provide the restore point ID when prompted.

## What This Command Does

1. Lists available restore points
2. Prompts for restore point ID
3. Shows warning about data loss
4. Asks for confirmation
5. Runs `npm run restore -- restore <id>`
6. Verifies restoration success
7. Recommends running tests

## Example

```
User: /restore-to
Assistant: Available restore points:
[SNAPSHOT] abc123-def456-789 - Phase 2 completion (2025-12-05 10:30:00)
[DELTA] ghi789-jkl012-345 - Added new tools (2025-12-05 11:15:00)

Which restore point ID would you like to restore to?
User: abc123-def456-789
Assistant: ⚠️ WARNING: This will restore your project to a previous state.
All changes after this restore point will be lost.

Are you sure you want to continue? (yes/no)
User: yes
Assistant: Restoring to point: abc123-def456-789
✅ Project restored successfully!
  Files restored: 127
  Timestamp:      2025-12-05 10:30:00
  Version:        5.1.0

Recommended next steps:
1. Run /test-med to verify functionality
2. Check for any missing files
3. Review recent changes
```

## Safety Features

- Shows warning before restoration
- Requires explicit confirmation
- Lists what will be restored
- Verifies restoration success
- Provides post-restore recommendations

## When to Use

- Recovering from failed operations
- Reverting unwanted changes
- Testing different approaches
- Disaster recovery
- Debugging issues

## Related Commands

- `/list-restores` - List all restore points
- `/create-restore` - Create new restore point
- `/rollback` - Alternative rollback methods
- `/test-med` - Test after restoration

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
