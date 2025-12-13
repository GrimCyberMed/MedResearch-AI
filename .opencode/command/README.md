# MedResearch-AI Custom Commands

**Version:** 3.0.0  
**Last Updated:** December 5, 2025  
**Total Commands:** 18

Complete reference for all custom slash commands available in the MedResearch-AI project.

---

## 📋 Table of Contents

1. [Restore Point Commands](#restore-point-commands) (5 commands)
2. [Rollback Commands](#rollback-commands) (5 commands)
3. [Testing Commands](#testing-commands) (4 commands)
4. [Monitoring Commands](#monitoring-commands) (2 commands)
5. [Utility Commands](#utility-commands) (2 commands)
6. [Quick Reference](#quick-reference)
7. [Common Workflows](#common-workflows)

---

## Restore Point Commands

Create, manage, and restore from project snapshots.

### `/create-restore`
**Description:** Create a new restore point  
**Usage:** `/create-restore`  
**Prompts for:** Description  
**Example:**
```
/create-restore
> "Before Phase 3 implementation"
```

### `/list-restores`
**Description:** List all restore points  
**Usage:** `/list-restores`  
**Shows:** All snapshots and deltas with details  

### `/restore-to`
**Description:** Restore to a specific point  
**Usage:** `/restore-to`  
**Prompts for:** Restore point ID  
**Warning:** ⚠️ Destructive operation - requires confirmation  

### `/restore-stats`
**Description:** Show restore point statistics  
**Usage:** `/restore-stats`  
**Shows:** Counts, sizes, dates, recommendations  

### `/cleanup-restores`
**Description:** Cleanup old restore points (>30 days)  
**Usage:** `/cleanup-restores`  
**Prompts for:** Confirmation  

---

## Rollback Commands

Undo operations and rollback to previous states.

### `/undo`
**Description:** Undo last command  
**Usage:** `/undo`  
**Prompts for:** Confirmation  
**Fast:** Quick single-command undo  

### `/redo`
**Description:** Redo last undone command  
**Usage:** `/redo`  
**Prompts for:** Confirmation  
**Note:** Redo history cleared after new command  

### `/rollback`
**Description:** Interactive rollback menu  
**Usage:** `/rollback`  
**Shows:** All rollback options  
**Options:**
1. Undo last command
2. Rollback to specific time
3. Rollback to specific command
4. Rollback to restore point
5. Cancel

### `/rollback-time`
**Description:** Rollback to specific timestamp  
**Usage:** `/rollback-time`  
**Prompts for:** Timestamp (YYYY-MM-DDTHH:MM:SS)  
**Example:**
```
/rollback-time
> 2025-12-05T10:30:00
```

### `/rollback-history`
**Description:** Show command history  
**Usage:** `/rollback-history` or `/rollback-history 50`  
**Default:** Last 20 commands  
**Shows:** Command details, status, duration  

---

## Testing Commands

Run tests for different components of MedResearch-AI.

### `/test-med`
**Description:** Run all tests  
**Usage:** `/test-med`  
**Runs:**
- TypeScript build
- Database integration tests
- Plagiarism detection tests
- Meta-analysis tests

### `/test-databases`
**Description:** Test database integrations  
**Usage:** `/test-databases`  
**Tests:**
- PubMed
- Europe PMC
- Semantic Scholar
- The Lens
- ClinicalTrials.gov
- CrossRef
- Unpaywall

### `/test-plagiarism`
**Description:** Test plagiarism detection  
**Usage:** `/test-plagiarism`  
**Tests:**
- Document comparison
- Similarity detection
- Citation checking
- Database integration
- Performance metrics

### `/test-meta`
**Description:** Test meta-analysis tools  
**Usage:** `/test-meta`  
**Tests:**
- Effect size calculations
- Meta-analysis models
- Heterogeneity analysis
- Publication bias detection
- Forest plot generation
- Power analysis

---

## Monitoring Commands

Monitor errors, performance, and system health.

### `/monitor-errors`
**Description:** Start error monitoring dashboard  
**Usage:** `/monitor-errors`  
**Refresh:** Every 10 seconds  
**Shows:**
- Error statistics
- Log file sizes
- Recent errors (last 5)
- Recommendations

### `/monitor-watch`
**Description:** Enhanced monitoring with watch mode  
**Usage:** `/monitor-watch`  
**Refresh:** Every 5 seconds  
**Shows:**
- Detailed error statistics
- Error rate trends
- Last 10 errors with full details
- Smart recommendations
- Quick actions

---

## Utility Commands

Build and status utilities.

### `/med-build`
**Description:** Build MedResearch-AI project  
**Usage:** `/med-build`  
**Runs:** `npm run build`  
**Shows:** Compilation results, errors, warnings  

### `/med-status`
**Description:** Show comprehensive project status  
**Usage:** `/med-status`  
**Shows:**
- Project information
- Build status
- Test status
- Error statistics
- Restore points
- Command history
- System resources
- Health assessment (score 0-100)

---

## Quick Reference

### Most Common Commands

| Command | Purpose | Frequency |
|---------|---------|-----------|
| `/test-med` | Run all tests | After changes |
| `/create-restore` | Create backup | Before major changes |
| `/undo` | Quick undo | After mistakes |
| `/med-status` | Check health | Daily |
| `/monitor-errors` | Watch errors | During development |

### Emergency Commands

| Situation | Command | Action |
|-----------|---------|--------|
| Tests failing | `/rollback-time` | Rollback to before failure |
| Major issue | `/restore-to` | Restore from snapshot |
| Need status | `/med-status` | Check overall health |
| Find problem | `/rollback-history` | Review what happened |

### Safety Commands

Always use before risky operations:
1. `/create-restore` - Create backup
2. `/med-status` - Verify current state
3. Perform operation
4. `/test-med` - Verify success

---

## Common Workflows

### Workflow 1: Before Major Changes

```
1. /med-status              # Check current health
2. /test-med                # Ensure tests pass
3. /create-restore          # Create backup
   > "Before [description]"
4. Make your changes
5. /med-build               # Build project
6. /test-med                # Verify tests still pass
7. /create-restore          # Create after backup
   > "After [description]"
```

### Workflow 2: Debugging Issues

```
1. /rollback-history        # See what happened
2. /monitor-errors          # Check error logs
3. /med-status              # Check overall health
4. Identify problem
5. /rollback-time           # Rollback to before issue
   > [timestamp]
6. /test-med                # Verify fix
```

### Workflow 3: Daily Development

```
Morning:
1. /med-status              # Check overnight status
2. /test-med                # Ensure clean start

During work:
3. /create-restore          # Before each major task
4. Make changes
5. /test-med                # After each task

End of day:
6. /med-status              # Final health check
7. /create-restore          # Daily backup
   > "End of day [date]"
```

### Workflow 4: Testing New Features

```
1. /create-restore          # Backup before testing
   > "Before testing [feature]"
2. /test-databases          # Test specific component
3. /test-plagiarism         # Test specific component
4. /test-meta               # Test specific component
5. /test-med                # Full test suite
6. /med-status              # Check overall impact
```

### Workflow 5: Recovery from Failure

```
1. /monitor-errors          # Identify errors
2. /rollback-history        # Find when it broke
3. /list-restores           # Check available backups
4. /restore-to              # Restore to working state
   > [restore-point-id]
5. /test-med                # Verify restoration
6. /med-status              # Confirm health
```

---

## Command Naming Conventions

### Prefixes
- **No prefix** - Core operations (undo, redo, rollback)
- **`restore-`** - Restore point operations
- **`rollback-`** - Rollback operations
- **`test-`** - Testing operations
- **`monitor-`** - Monitoring operations
- **`med-`** - General utilities

### Patterns
- **Action verbs** - create, list, cleanup
- **Descriptive** - Clear purpose from name
- **Consistent** - Similar operations use similar names

---

## Tips & Best Practices

### 1. Create Restore Points Frequently
- Before major refactoring
- Before upgrading dependencies
- At phase boundaries
- After completing features

### 2. Use Descriptive Names
✅ Good: "Before Phase 3 implementation"  
✅ Good: "After adding NLP tools"  
❌ Bad: "test"  
❌ Bad: "backup 1"  

### 3. Monitor Regularly
- Use `/monitor-errors` during active development
- Check `/med-status` daily
- Review `/rollback-history` weekly

### 4. Test After Changes
- Always run `/test-med` after changes
- Use specific tests (`/test-databases`) for targeted testing
- Create restore point before testing

### 5. Cleanup Regularly
- Run `/cleanup-restores` monthly
- Check `/restore-stats` for storage usage
- Keep 30-day retention policy

---

## Keyboard Shortcuts

When in OpenCode CLI:
- Type `/` to see command suggestions
- Use `Tab` for autocomplete
- Use `↑` `↓` arrows for command history
- Use `Ctrl+C` to cancel monitoring

---

## Troubleshooting

### Command Not Found
**Issue:** Command doesn't appear in suggestions  
**Fix:** Ensure you're in MedResearch-AI directory

### Command Fails
**Issue:** Command execution fails  
**Fix:** 
1. Check `/med-status` for project health
2. Run `/med-build` to ensure project compiles
3. Check error logs with `/monitor-errors`

### Slow Performance
**Issue:** Commands taking too long  
**Fix:**
1. Check `/restore-stats` for storage issues
2. Run `/cleanup-restores` to free space
3. Review `/monitor-errors` for performance issues

---

## Project Path

All commands operate in:
```
C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI
```

---

## Related Documentation

- **Restore & Rollback Guide:** `docs/RESTORE-ROLLBACK-GUIDE.md`
- **Error Tracking Guide:** `docs/ERROR-TRACKING-GUIDE.md`
- **Implementation Summary:** `docs/IMPLEMENTATION-SUMMARY-DEC-5-2025.md`
- **Development Guide:** `docs/DEVELOPMENT.md`

---

## Version History

### v3.0.0 (2025-12-05)
- ✅ Added 5 restore point commands
- ✅ Added 5 rollback commands
- ✅ Added 4 testing commands
- ✅ Added 2 monitoring commands
- ✅ Added 2 utility commands
- ✅ Total: 18 custom commands

---

**Maintained by:** MedResearch AI Team  
**Last Updated:** December 5, 2025  
**Status:** ✅ Production Ready
