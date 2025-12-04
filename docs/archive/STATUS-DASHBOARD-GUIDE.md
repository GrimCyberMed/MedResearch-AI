# Status Dashboard Guide

## 📊 Overview

The MedResearch AI Status Dashboard provides real-time monitoring of all system components, including:

- **System Health**: Database connectivity, uptime, version info
- **MCP Tools**: Availability status of all 9 tools with dependency checking
- **Memory System**: Statistics across all 4 memory tiers
- **Progress Tracking**: Phase completion, task status, overall progress
- **Recent Activity**: Last 20 system events
- **Active Alerts**: Warnings and errors requiring attention

---

## 🚀 Quick Start

### Basic Usage

```bash
# Display dashboard once
npm run dashboard

# Auto-refresh every 5 seconds
npm run dashboard:watch

# Custom refresh interval (10 seconds)
node dashboard.js --watch --interval=10000
```

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--watch` or `-w` | Enable auto-refresh | false |
| `--interval=<ms>` | Refresh interval in milliseconds | 5000 |
| `<path>` | Project path | current directory |

---

## 📋 Dashboard Sections

### 1. System Status 🖥️

**Shows**:
- System version (4.0.1)
- Environment (development/production)
- Database connection status
- Database size and path
- System uptime

**Health Indicators**:
- ✅ **HEALTHY**: All systems operational
- ⚠️ **DEGRADED**: Some issues detected
- ❌ **ERROR**: Critical failures

---

### 2. MCP Tools Status 🔧

**Categories**:
1. **Medical Databases**
   - PubMed Search
   - Europe PMC Search

2. **Citation Management**
   - Unpaywall
   - Citation Manager

3. **Statistical Analysis**
   - Meta-Analysis (requires R)
   - Forest Plot Generator (requires R)

4. **Document Generation**
   - Document Generator
   - PDF Export (requires Pandoc)

**Status Indicators**:
- ✅ **AVAILABLE**: Tool ready to use
- ❌ **UNAVAILABLE**: Missing dependencies
- ⚠️ **DEGRADED**: Partial functionality
- ❓ **UNKNOWN**: Status check failed

**Dependency Checking**:
- Automatically checks for R installation
- Automatically checks for Pandoc installation
- Shows which dependencies are missing
- Provides helpful error messages

---

### 3. Memory System Status 🧠

**4-Tier Memory Architecture**:

1. **Short-term Memory**
   - Current conversation items
   - Active sessions count
   - Last updated timestamp

2. **Working Memory**
   - Current phase context
   - Active phases list
   - Item count

3. **Long-term Memory**
   - Complete project history
   - Items by category
   - Total count

4. **Episodic Memory**
   - Decision history
   - Total decisions count

**Additional Stats**:
- **Checkpoints**: Saved checkpoints count, auto-save status
- **Citations**: Total, verified, unverified counts
- **Todo List**: Total, pending, in progress, completed, blocked

---

### 4. Progress Status 📈

**Shows**:
- Overall progress percentage
- Current phase name
- Current task description
- Phase-by-phase breakdown

**Phase Information**:
- Phase name
- Status (pending/in_progress/completed/failed)
- Progress percentage
- Task completion (X/Y tasks)
- Quality gate status

**Progress Bar**:
- Visual progress indicator
- Color-coded by completion:
  - 🟢 Green: 75-100%
  - 🟡 Yellow: 50-74%
  - 🟠 Orange: 25-49%
  - 🔴 Red: 0-24%

---

### 5. Recent Activity 📋

**Shows**:
- Last 20 system events
- Timestamp for each event
- Event type (info/warning/error/success)
- Event category (system/mcp/memory/progress/user)
- Event message

**Event Types**:
- ✅ **Success**: Successful operations
- ℹ️ **Info**: Informational messages
- ⚠️ **Warning**: Non-critical issues
- ❌ **Error**: Critical failures

---

### 6. Active Alerts 🚨

**Shows**:
- Unacknowledged alerts
- Alert severity
- Alert category
- Alert message
- Timestamp

**Severity Levels**:
- 🔴 **CRITICAL**: Immediate action required
- ❌ **ERROR**: System errors
- ⚠️ **WARNING**: Potential issues
- ℹ️ **INFO**: Informational alerts

**When No Alerts**:
- ✅ "No active alerts - All systems operational"

---

## 🎨 Color Coding

The dashboard uses colors to make information easy to scan:

- **Green**: Healthy, available, successful
- **Yellow**: Degraded, warnings, partial
- **Red**: Errors, unavailable, critical
- **Cyan**: Headers, highlights
- **Gray**: Secondary information

---

## 💻 Programmatic Usage

### Import Dashboard

```typescript
import { StatusDashboard } from './dist/.opencode/tool/dashboard/index.js';

// Create dashboard
const dashboard = new StatusDashboard('./path/to/project', {
  refreshInterval: 5000,
  maxActivityLogs: 20,
  maxAlerts: 10,
  enableAutoRefresh: false,
  showDetailedStats: true,
});

// Initialize
await dashboard.initialize('my-session-id');

// Display once
await dashboard.display();

// Start auto-refresh
await dashboard.startAutoRefresh();

// Log activity
dashboard.logActivity('info', 'user', 'User performed action');

// Create alert
dashboard.createAlert('warning', 'system', 'Low disk space');

// Get status programmatically
const status = await dashboard.getStatus();
console.log(status);

// Stop and cleanup
dashboard.close();
```

### Custom Rendering

```typescript
import { DashboardCollector, DashboardRenderer } from './dist/.opencode/tool/dashboard/index.js';

// Create collector
const collector = new DashboardCollector('./path/to/project');
await collector.initialize('session-id');

// Collect data
const status = await collector.collect();

// Custom rendering
const renderer = new DashboardRenderer(true); // true = use colors
const output = renderer.render(status);
console.log(output);

// Or access raw data
console.log('MCP Tools:', status.mcpTools);
console.log('Memory:', status.memory);
console.log('Progress:', status.progress);
```

---

## 📊 Data Model

### DashboardStatus

```typescript
interface DashboardStatus {
  timestamp: string;
  system: SystemStatus;
  mcpTools: MCPToolStatus[];
  memory: MemoryStatus;
  progress: ProgressStatus;
  recentActivity: ActivityLog[];
  alerts: Alert[];
}
```

### SystemStatus

```typescript
interface SystemStatus {
  status: 'healthy' | 'degraded' | 'error';
  uptime: number; // milliseconds
  version: string;
  environment: 'development' | 'production' | 'test';
  database: {
    connected: boolean;
    size: number; // bytes
    path: string;
  };
}
```

### MCPToolStatus

```typescript
interface MCPToolStatus {
  name: string;
  category: 'database' | 'citation' | 'statistics' | 'document' | 'quality';
  status: 'available' | 'unavailable' | 'degraded' | 'unknown';
  lastChecked: string;
  responseTime?: number; // milliseconds
  errorMessage?: string;
  dependencies: {
    name: string;
    available: boolean;
    version?: string;
  }[];
}
```

### MemoryStatus

```typescript
interface MemoryStatus {
  shortTerm: { count: number; sessions: number; lastUpdated?: string };
  working: { count: number; phases: string[]; lastUpdated?: string };
  longTerm: { count: number; categories: Record<string, number>; lastUpdated?: string };
  episodic: { count: number; decisions: number; lastUpdated?: string };
  checkpoints: { count: number; latest?: string; autoSaveEnabled: boolean };
  citations: { count: number; verified: number; unverified: number };
  todos: { total: number; pending: number; inProgress: number; completed: number; blocked: number };
}
```

---

## 🔧 Configuration

### Dashboard Config

```typescript
interface DashboardConfig {
  refreshInterval: number; // milliseconds (default: 5000)
  maxActivityLogs: number; // max logs to keep (default: 20)
  maxAlerts: number; // max alerts to keep (default: 10)
  enableAutoRefresh: boolean; // auto-refresh on/off (default: false)
  showDetailedStats: boolean; // show detailed stats (default: true)
}
```

### Environment Variables

```bash
# Set environment
NODE_ENV=production  # or development, test

# Database path (optional, auto-detected)
DB_PATH=./custom/path/to/project-memory.db
```

---

## 🧪 Testing

### Manual Testing

```bash
# Test dashboard display
npm run dashboard

# Test auto-refresh
npm run dashboard:watch

# Test with custom interval
node dashboard.js --watch --interval=10000
```

### Automated Testing

```bash
# Run dashboard tests (when implemented)
npm test -- test-dashboard.js
```

---

## 🐛 Troubleshooting

### Dashboard Won't Start

**Error**: `Cannot find module`
- **Solution**: Run `npm run build` first to compile TypeScript

**Error**: `Database not initialized`
- **Solution**: Ensure `.memory/project-memory.db` exists
- **Solution**: Run memory system initialization first

### MCP Tools Show as Unavailable

**R Tools (Meta-Analysis, Forest Plot)**:
- **Issue**: R not installed or not in PATH
- **Solution**: Install R from https://www.r-project.org/
- **Solution**: Add R to system PATH
- **Verify**: Run `Rscript --version` in terminal

**PDF Export**:
- **Issue**: Pandoc not installed
- **Solution**: Install Pandoc from https://pandoc.org/installing.html
- **Verify**: Run `pandoc --version` in terminal

### Auto-Refresh Not Working

**Issue**: Dashboard doesn't update
- **Solution**: Check refresh interval (must be > 0)
- **Solution**: Ensure `--watch` flag is used
- **Solution**: Check for JavaScript errors in console

### Colors Not Showing

**Issue**: ANSI colors not displayed
- **Solution**: Use a terminal that supports ANSI colors
- **Solution**: On Windows, use Windows Terminal or PowerShell
- **Solution**: Set `useColors: false` in DashboardRenderer

---

## 📈 Performance

### Resource Usage

- **Memory**: ~10-20 MB
- **CPU**: < 1% (idle), ~5% (refreshing)
- **Disk I/O**: Minimal (reads only)

### Refresh Intervals

- **Recommended**: 5000ms (5 seconds)
- **Minimum**: 1000ms (1 second)
- **Maximum**: No limit (60000ms = 1 minute recommended)

### Optimization Tips

1. **Increase refresh interval** for lower resource usage
2. **Disable auto-refresh** when not actively monitoring
3. **Reduce maxActivityLogs** to save memory
4. **Use programmatic access** for custom monitoring

---

## 🔐 Security

### Data Privacy

- Dashboard only reads local database
- No external API calls for status checks
- No data sent to external services
- All data stays on local machine

### Access Control

- Dashboard requires file system access to project directory
- Database file must be readable
- No authentication required (local tool)

---

## 🚀 Future Enhancements

### Planned Features

1. **Web Interface**: Browser-based dashboard
2. **Export Reports**: JSON, CSV, PDF exports
3. **Historical Data**: Track metrics over time
4. **Custom Alerts**: User-defined alert rules
5. **Email Notifications**: Alert notifications via email
6. **Slack Integration**: Post alerts to Slack
7. **Performance Metrics**: Response time tracking
8. **Resource Monitoring**: CPU, memory, disk usage

### Contribution

To contribute dashboard enhancements:

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

---

## 📚 API Reference

See TypeScript type definitions in:
- `.opencode/tool/dashboard/types.ts`
- `.opencode/tool/dashboard/collector.ts`
- `.opencode/tool/dashboard/renderer.ts`
- `.opencode/tool/dashboard/index.ts`

---

## 📝 Examples

### Example 1: Basic Monitoring

```bash
# Start dashboard with auto-refresh
npm run dashboard:watch

# Leave running in terminal
# Monitor system while working
```

### Example 2: Pre-Deployment Check

```bash
# Check system status before deployment
npm run dashboard

# Verify:
# - All MCP tools available
# - Database connected
# - No active alerts
# - Memory system healthy
```

### Example 3: Debugging

```bash
# Start dashboard with fast refresh
node dashboard.js --watch --interval=1000

# Watch for:
# - Error messages in activity log
# - Tool status changes
# - Memory usage patterns
# - Alert generation
```

### Example 4: Programmatic Monitoring

```typescript
import { StatusDashboard } from './dist/.opencode/tool/dashboard/index.js';

const dashboard = new StatusDashboard('./');
await dashboard.initialize();

// Check every minute
setInterval(async () => {
  const status = await dashboard.getStatus();
  
  // Check for critical issues
  if (status.system.status === 'error') {
    console.error('CRITICAL: System error detected!');
    // Send notification, trigger alert, etc.
  }
  
  // Check MCP tool availability
  const unavailable = status.mcpTools.filter(t => t.status === 'unavailable');
  if (unavailable.length > 0) {
    console.warn(`WARNING: ${unavailable.length} tools unavailable`);
  }
}, 60000);
```

---

## ✅ Checklist

Before using dashboard in production:

- [ ] Run `npm run build` to compile TypeScript
- [ ] Test dashboard display: `npm run dashboard`
- [ ] Test auto-refresh: `npm run dashboard:watch`
- [ ] Verify all MCP tools show correct status
- [ ] Check memory statistics are accurate
- [ ] Confirm progress tracking works
- [ ] Review activity log format
- [ ] Test alert generation
- [ ] Verify colors display correctly
- [ ] Check performance with auto-refresh

---

**Version**: 1.0.0  
**Last Updated**: December 3, 2025  
**Status**: ✅ Production Ready
