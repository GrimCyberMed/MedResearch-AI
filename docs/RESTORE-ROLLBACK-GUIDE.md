# Restore Points & Rollback System Guide

**Version:** 3.0.0  
**Last Updated:** December 5, 2025

## 📋 Table of Contents

1. [Overview](#overview)
2. [Restore Points](#restore-points)
3. [Rollback Operations](#rollback-operations)
4. [CLI Usage](#cli-usage)
5. [Programmatic API](#programmatic-api)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The MedResearch AI Restore Points & Rollback System provides comprehensive project state management with:

- **Restore Points**: Snapshot + delta pattern for efficient state capture
- **Rollback Operations**: Command pattern for undo/redo and time-travel
- **Fast Recovery**: <5 second restore times
- **Automatic Retention**: 30-day retention with automatic cleanup
- **Compression**: Efficient storage using gzip compression

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Restore Point System                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │  Snapshots   │────────▶│    Deltas    │             │
│  │  (Full)      │         │ (Incremental)│             │
│  └──────────────┘         └──────────────┘             │
│         │                         │                     │
│         └─────────┬───────────────┘                     │
│                   ▼                                     │
│         ┌──────────────────┐                           │
│         │  Restore Manager │                           │
│         └──────────────────┘                           │
│                   │                                     │
│                   ▼                                     │
│         ┌──────────────────┐                           │
│         │ Command Manager  │                           │
│         │  (Undo/Redo)     │                           │
│         └──────────────────┘                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Restore Points

### What are Restore Points?

Restore points are snapshots of your project state at specific moments in time. They capture:

- All source files (`src/`)
- Configuration files (`package.json`, `tsconfig.json`, `.env`)
- Project metadata (version, phase, checksums)

### Types of Restore Points

#### 1. **Snapshots** (Full Backups)
- Complete project state
- Created automatically at phase boundaries
- Created manually on demand
- Larger size but faster restore

#### 2. **Deltas** (Incremental Changes)
- Only changed files since last snapshot
- Created automatically between snapshots
- Smaller size, requires parent snapshot
- Efficient for frequent saves

### Restore Point Types

```typescript
enum RestorePointType {
  MANUAL = 'manual',              // User-created
  AUTO_PHASE = 'auto_phase',      // Phase boundary
  AUTO_CHECKPOINT = 'auto_checkpoint', // Periodic
  PRE_OPERATION = 'pre_operation', // Before operation
  POST_OPERATION = 'post_operation' // After operation
}
```

### Storage Structure

```
.restore/
├── snapshots/          # Full project snapshots
│   ├── abc123.json.gz
│   └── def456.json.gz
├── deltas/             # Incremental changes
│   ├── ghi789.json.gz
│   └── jkl012.json.gz
└── metadata/           # Restore point metadata
    ├── abc123.json
    ├── def456.json
    ├── ghi789.json
    └── jkl012.json
```

---

## Rollback Operations

### Command Pattern

The system uses the Command Pattern to track all operations:

```typescript
interface Command {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  params: any;
  result?: any;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'undone';
  undoable: boolean;
  restorePointId?: string;
}
```

### Rollback Methods

#### 1. **Undo/Redo**
- Undo last command
- Redo last undone command
- Works on individual commands
- Fast and precise

#### 2. **Time-Based Rollback**
- Rollback to specific timestamp
- Undoes all commands after that time
- Useful for "go back 1 hour" scenarios

#### 3. **Command-Based Rollback**
- Rollback to specific command
- Undoes all commands after that command
- Precise control over rollback point

#### 4. **Restore Point Rollback**
- Restore entire project from snapshot
- Fastest and safest method
- Recommended for major rollbacks

---

## CLI Usage

### Restore Point CLI

#### List Restore Points

```bash
npm run restore -- list
```

**Output:**
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

#### Create Restore Point

```bash
npm run restore -- create "Before major refactor"
```

**Output:**
```
✅ Restore point created: xyz789-abc123-456
  Type:      Snapshot
  Size:      2.3 MB
  Timestamp: 2025-12-05 12:00:00
```

#### Restore to Point

```bash
npm run restore -- restore xyz789-abc123-456
```

**Output:**
```
⚠️  WARNING: This will restore your project to a previous state.
   All changes after this restore point will be lost.

ℹ️  Restoring to point: xyz789-abc123-456
✅ Project restored successfully!
  Files restored: 127
  Timestamp:      2025-12-05 12:00:00
  Version:        5.1.0
```

#### Delete Restore Point

```bash
npm run restore -- delete xyz789-abc123-456
```

#### Show Statistics

```bash
npm run restore -- stats
```

**Output:**
```
Restore Point Statistics:

  Total restore points: 15
  Snapshots:            5
  Deltas:               10
  Total size:           12.5 MB
  Oldest point:         2025-11-05 10:00:00
  Newest point:         2025-12-05 12:00:00
```

#### Cleanup Old Points

```bash
npm run restore -- cleanup
```

### Rollback CLI

#### Show Command History

```bash
npm run rollback -- history
npm run rollback -- history 50  # Show last 50 commands
```

**Output:**
```
[✓] abc123-def456-789
  Type:        tool-execution
  Description: Execute NLP data extraction
  Timestamp:   2025-12-05 11:30:00
  Status:      completed
  Duration:    1.2s

[✗] def456-ghi789-012
  Type:        database-query
  Description: Query PubMed
  Timestamp:   2025-12-05 11:35:00
  Status:      failed
  Error:       Connection timeout
```

#### Undo Last Command

```bash
npm run rollback -- undo
```

**Output:**
```
ℹ️  Undoing last command...
✅ Command undone successfully
```

#### Redo Last Command

```bash
npm run rollback -- redo
```

#### Rollback to Timestamp

```bash
npm run rollback -- to-time "2025-12-05T10:30:00"
```

**Output:**
```
⚠️  This will undo all commands after the specified time!
⚠️  This operation cannot be easily reversed.

ℹ️  Rolling back to: 2025-12-05 10:30:00
✅ Rollback completed successfully!
  Commands undone: 15
  Duration:        3.2s
```

#### Rollback to Command

```bash
npm run rollback -- to-command abc123-def456-789
```

#### Rollback to Restore Point

```bash
npm run rollback -- to-restore xyz789-abc123-456
```

**Output:**
```
⚠️  This will restore your project to a previous state!
⚠️  All changes after this restore point will be lost.

ℹ️  Rolling back to restore point: xyz789-abc123-456
✅ Rollback completed successfully!
  Restored to:     xyz789-abc123-456
  Duration:        2.8s
```

#### Show Statistics

```bash
npm run rollback -- stats
```

**Output:**
```
Command Statistics:

  Total commands:     150
  Completed:          142
  Failed:             5
  Undone:             3
  Average duration:   850ms

  Commands by type:
    tool-execution: 85
    database-query: 40
    file-operation: 25
```

---

## Programmatic API

### Restore Point Manager

#### Import

```typescript
import { restorePointManager, RestorePointType } from './src/common/restore-point-manager.js';
```

#### Create Restore Point

```typescript
const point = await restorePointManager.createRestorePoint(
  RestorePointType.MANUAL,
  'Before major changes',
  {
    phase: 'development',
    tags: ['manual', 'important'],
    forceSnapshot: true  // Force full snapshot
  }
);

console.log(`Created restore point: ${point.id}`);
```

#### Restore from Point

```typescript
const state = await restorePointManager.restore('xyz789-abc123-456');
console.log(`Restored ${Object.keys(state.files).length} files`);
```

#### List Restore Points

```typescript
const points = await restorePointManager.listRestorePoints();

for (const point of points) {
  console.log(`${point.id}: ${point.description}`);
  console.log(`  Type: ${point.isSnapshot ? 'Snapshot' : 'Delta'}`);
  console.log(`  Size: ${point.size} bytes`);
}
```

#### Delete Restore Point

```typescript
await restorePointManager.deleteRestorePoint('xyz789-abc123-456');
```

#### Get Statistics

```typescript
const stats = await restorePointManager.getStatistics();
console.log(`Total restore points: ${stats.totalRestorePoints}`);
console.log(`Snapshots: ${stats.snapshots}`);
console.log(`Deltas: ${stats.deltas}`);
```

### Command Manager

#### Import

```typescript
import { commandManager } from './src/common/command-manager.js';
```

#### Register Command Executor

```typescript
commandManager.registerExecutor('my-operation', {
  async execute(params, context) {
    // Perform operation
    return result;
  },
  
  async undo(params, result, context) {
    // Undo operation
  },
  
  async validate(params, context) {
    // Validate before execution
    return true;
  },
  
  async compensate(params, error, context) {
    // Handle errors
  }
});
```

#### Execute Command

```typescript
const result = await commandManager.executeCommand(
  'my-operation',
  { param1: 'value1' },
  {
    description: 'My custom operation',
    createRestorePoint: true,
    validateBefore: true,
    phase: 'development'
  }
);
```

#### Undo/Redo

```typescript
// Undo last command
await commandManager.undo();

// Redo last undone command
await commandManager.redo();
```

#### Rollback Operations

```typescript
// Rollback to timestamp
const result = await commandManager.rollbackToTimestamp('2025-12-05T10:30:00');
console.log(`Undone ${result.commandsUndone} commands`);

// Rollback to command
await commandManager.rollbackToCommand('abc123-def456-789');

// Rollback to restore point
await commandManager.rollbackToRestorePoint('xyz789-abc123-456');
```

#### Batch Execution

```typescript
const results = await commandManager.executeBatch([
  { type: 'operation-1', params: { a: 1 } },
  { type: 'operation-2', params: { b: 2 } },
  { type: 'operation-3', params: { c: 3 } }
], {
  createRestorePoint: true,
  phase: 'batch-operation'
});

// If any operation fails, all are automatically rolled back
```

#### Get Command History

```typescript
// Get last 20 commands
const history = commandManager.getHistory(20);

// Get specific command
const command = commandManager.getCommand('abc123-def456-789');

// Get commands by type
const toolCommands = commandManager.getCommandsByType('tool-execution');

// Get commands by time range
const commands = commandManager.getCommandsByTimeRange(
  '2025-12-05T10:00:00',
  '2025-12-05T12:00:00'
);
```

---

## Best Practices

### When to Create Restore Points

✅ **DO create restore points:**
- Before major refactoring
- Before upgrading dependencies
- Before deploying to production
- At phase boundaries
- Before risky operations
- After completing major features

❌ **DON'T create restore points:**
- After every small change
- During active development (use auto-checkpoints)
- For trivial edits

### Restore Point Naming

**Good names:**
```
"Before Phase 3 implementation"
"Pre-deployment v5.1.0"
"After completing all Phase 2 tools"
"Before major database refactor"
```

**Bad names:**
```
"test"
"backup"
"asdf"
"checkpoint 1"
```

### Rollback Strategy

1. **For small mistakes**: Use `undo`
2. **For recent changes**: Use time-based rollback
3. **For major issues**: Use restore point rollback
4. **For testing**: Create restore point first, then experiment

### Performance Tips

- Snapshots are created every 10 deltas automatically
- Manual snapshots are recommended before major changes
- Cleanup runs automatically (30-day retention)
- Restore operations are optimized for <5 second completion

### Safety Guidelines

⚠️ **Before rollback:**
1. Review what will be undone
2. Create a restore point of current state
3. Verify you have the correct restore point ID
4. Understand that rollback is hard to reverse

⚠️ **After rollback:**
1. Verify project state
2. Run tests to ensure functionality
3. Check for any missing files
4. Document what was rolled back

---

## Troubleshooting

### Common Issues

#### Issue: "Restore point not found"

**Cause:** Restore point was deleted or ID is incorrect

**Solution:**
```bash
# List all restore points
npm run restore -- list

# Use correct ID from list
npm run restore -- restore <correct-id>
```

#### Issue: "No executor found for command type"

**Cause:** Command executor not registered

**Solution:**
```typescript
// Register executor before using
commandManager.registerExecutor('my-type', executor);
```

#### Issue: "Cannot undo command with status: failed"

**Cause:** Trying to undo a failed command

**Solution:**
```bash
# Use restore point rollback instead
npm run rollback -- to-restore <restore-point-id>
```

#### Issue: "Restore taking too long"

**Cause:** Large project or many deltas

**Solution:**
- Force snapshot creation: `forceSnapshot: true`
- Cleanup old deltas: `npm run restore -- cleanup`
- Use most recent snapshot

#### Issue: "Delta has no parent snapshot"

**Cause:** Parent snapshot was deleted

**Solution:**
```bash
# Create new snapshot
npm run restore -- create "New baseline snapshot"
```

### Recovery Procedures

#### Complete System Recovery

If the restore system itself is corrupted:

1. **Locate backup files:**
   ```bash
   ls .restore/snapshots/
   ls .restore/metadata/
   ```

2. **Manual restore:**
   ```bash
   # Decompress snapshot manually
   gunzip -c .restore/snapshots/<id>.json.gz > snapshot.json
   
   # Review and manually restore files
   ```

3. **Rebuild from git:**
   ```bash
   git log --oneline
   git checkout <commit-hash>
   ```

#### Corrupted Restore Point

If a restore point is corrupted:

1. **Delete corrupted point:**
   ```bash
   npm run restore -- delete <corrupted-id>
   ```

2. **Create new baseline:**
   ```bash
   npm run restore -- create "New baseline after corruption"
   ```

3. **Verify integrity:**
   ```bash
   npm run restore -- stats
   ```

---

## Advanced Usage

### Custom Command Executors

```typescript
import { commandManager, CommandExecutor } from './src/common/command-manager.js';

const myExecutor: CommandExecutor = {
  async execute(params, context) {
    // Your operation logic
    const result = await performOperation(params);
    return result;
  },
  
  async undo(params, result, context) {
    // Undo logic
    await reverseOperation(params, result);
  },
  
  async validate(params, context) {
    // Pre-execution validation
    return params.isValid === true;
  },
  
  async compensate(params, error, context) {
    // Error compensation
    await cleanupAfterError(params);
  }
};

commandManager.registerExecutor('custom-operation', myExecutor);
```

### Automated Restore Points

```typescript
// Create restore point at phase boundaries
async function completePhase(phaseName: string) {
  await restorePointManager.createRestorePoint(
    RestorePointType.AUTO_PHASE,
    `Completed ${phaseName}`,
    { phase: phaseName, tags: ['auto', 'phase-complete'] }
  );
}

// Create restore point before risky operations
async function performRiskyOperation() {
  const point = await restorePointManager.createRestorePoint(
    RestorePointType.PRE_OPERATION,
    'Before risky operation',
    { tags: ['risky', 'auto'] }
  );
  
  try {
    await riskyOperation();
  } catch (error) {
    // Auto-rollback on error
    await restorePointManager.restore(point.id);
    throw error;
  }
}
```

### Integration with CI/CD

```yaml
# .github/workflows/deploy.yml
- name: Create pre-deployment restore point
  run: npm run restore -- create "Pre-deployment $(date +%Y%m%d-%H%M%S)"

- name: Deploy
  run: npm run deploy

- name: Rollback on failure
  if: failure()
  run: |
    LAST_POINT=$(npm run restore -- list | head -n 1 | awk '{print $2}')
    npm run restore -- restore $LAST_POINT
```

---

## Summary

The Restore Points & Rollback System provides:

✅ **Fast Recovery**: <5 second restore times  
✅ **Efficient Storage**: Snapshot + delta pattern with compression  
✅ **Flexible Rollback**: Undo, time-based, command-based, restore point  
✅ **Automatic Management**: 30-day retention with auto-cleanup  
✅ **Safety**: Pre-operation validation and compensation  
✅ **Observability**: Full command history and statistics  

**Key Commands:**
```bash
# Restore points
npm run restore -- list
npm run restore -- create "description"
npm run restore -- restore <id>
npm run restore -- stats

# Rollback
npm run rollback -- history
npm run rollback -- undo
npm run rollback -- to-time "timestamp"
npm run rollback -- to-restore <id>
```

For more information, see:
- [Advanced Logging Guide](./ADVANCED-LOGGING-GUIDE.md)
- [Error Tracking Guide](./ERROR-TRACKING-GUIDE.md)
- [Development Guide](./DEVELOPMENT.md)

---

**Version:** 3.0.0  
**Last Updated:** December 5, 2025  
**Maintained by:** MedResearch AI Team
