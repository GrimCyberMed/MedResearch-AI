/**
 * Dashboard Renderer
 * 
 * Renders the status dashboard to console with colors and formatting
 */

import { DashboardStatus } from './types.js';

export class DashboardRenderer {
  private useColors: boolean;

  constructor(useColors: boolean = true) {
    this.useColors = useColors;
  }

  /**
   * Render full dashboard
   */
  render(status: DashboardStatus): string {
    const sections: string[] = [];

    sections.push(this.renderHeader(status));
    sections.push(this.renderSystemStatus(status));
    sections.push(this.renderMCPTools(status));
    sections.push(this.renderMemoryStatus(status));
    sections.push(this.renderProgressStatus(status));
    sections.push(this.renderRecentActivity(status));
    sections.push(this.renderAlerts(status));

    return sections.join('\n\n');
  }

  /**
   * Render header
   */
  private renderHeader(status: DashboardStatus): string {
    const lines: string[] = [];
    lines.push(this.color('═'.repeat(80), 'cyan'));
    lines.push(this.color('  📊 MedResearch AI - Status Dashboard', 'cyan', 'bold'));
    lines.push(this.color('═'.repeat(80), 'cyan'));
    lines.push('');
    lines.push(`  Last Updated: ${this.formatTimestamp(status.timestamp)}`);
    lines.push(`  System Status: ${this.getStatusBadge(status.system.status)}`);
    lines.push(`  Uptime: ${this.formatUptime(status.system.uptime)}`);
    
    return lines.join('\n');
  }

  /**
   * Render system status
   */
  private renderSystemStatus(status: DashboardStatus): string {
    const lines: string[] = [];
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push(this.color('  🖥️  System Status', 'white', 'bold'));
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push('');
    lines.push(`  Version: ${status.system.version}`);
    lines.push(`  Environment: ${status.system.environment}`);
    lines.push(`  Database: ${status.system.database.connected ? '✅ Connected' : '❌ Disconnected'}`);
    lines.push(`  Database Size: ${this.formatBytes(status.system.database.size)}`);
    lines.push(`  Database Path: ${status.system.database.path}`);

    return lines.join('\n');
  }

  /**
   * Render MCP tools status
   */
  private renderMCPTools(status: DashboardStatus): string {
    const lines: string[] = [];
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push(this.color('  🔧 MCP Tools Status', 'white', 'bold'));
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push('');

    // Group by category
    const categories = {
      database: 'Medical Databases',
      citation: 'Citation Management',
      statistics: 'Statistical Analysis',
      document: 'Document Generation',
      quality: 'Quality Assessment',
    };

    for (const [category, label] of Object.entries(categories)) {
      const tools = status.mcpTools.filter(t => t.category === category);
      if (tools.length === 0) continue;

      lines.push(`  ${label}:`);
      for (const tool of tools) {
        const statusIcon = this.getToolStatusIcon(tool.status);
        const statusText = this.color(tool.status.toUpperCase(), this.getToolStatusColor(tool.status));
        lines.push(`    ${statusIcon} ${tool.name.padEnd(25)} ${statusText}`);
        
        if (tool.errorMessage) {
          lines.push(`       ${this.color('⚠️  ' + tool.errorMessage, 'yellow')}`);
        }
        
        // Show dependencies
        const unavailableDeps = tool.dependencies.filter(d => !d.available);
        if (unavailableDeps.length > 0) {
          lines.push(`       Dependencies: ${unavailableDeps.map(d => d.name).join(', ')} (missing)`);
        }
      }
      lines.push('');
    }

    // Summary
    const available = status.mcpTools.filter(t => t.status === 'available').length;
    const total = status.mcpTools.length;
    lines.push(`  Summary: ${available}/${total} tools available (${Math.round((available/total)*100)}%)`);

    return lines.join('\n');
  }

  /**
   * Render memory status
   */
  private renderMemoryStatus(status: DashboardStatus): string {
    const lines: string[] = [];
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push(this.color('  🧠 Memory System Status', 'white', 'bold'));
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push('');

    const mem = status.memory;

    lines.push(`  Short-term Memory:  ${mem.shortTerm.count.toString().padStart(6)} items (${mem.shortTerm.sessions} sessions)`);
    lines.push(`  Working Memory:     ${mem.working.count.toString().padStart(6)} items (${mem.working.phases.length} phases)`);
    lines.push(`  Long-term Memory:   ${mem.longTerm.count.toString().padStart(6)} items`);
    lines.push(`  Episodic Memory:    ${mem.episodic.count.toString().padStart(6)} decisions`);
    lines.push('');
    lines.push(`  Checkpoints:        ${mem.checkpoints.count.toString().padStart(6)} saved`);
    lines.push(`  Auto-save:          ${mem.checkpoints.autoSaveEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    lines.push('');
    lines.push(`  Citations:          ${mem.citations.count.toString().padStart(6)} total (${mem.citations.verified} verified)`);
    lines.push('');
    lines.push(`  Todo List:`);
    lines.push(`    Total:            ${mem.todos.total.toString().padStart(6)}`);
    lines.push(`    Pending:          ${mem.todos.pending.toString().padStart(6)}`);
    lines.push(`    In Progress:      ${mem.todos.inProgress.toString().padStart(6)}`);
    lines.push(`    Completed:        ${mem.todos.completed.toString().padStart(6)}`);
    lines.push(`    Blocked:          ${mem.todos.blocked.toString().padStart(6)}`);

    return lines.join('\n');
  }

  /**
   * Render progress status
   */
  private renderProgressStatus(status: DashboardStatus): string {
    const lines: string[] = [];
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push(this.color('  📈 Progress Status', 'white', 'bold'));
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push('');

    const prog = status.progress;

    lines.push(`  Overall Progress: ${this.renderProgressBar(prog.overallProgress, 40)} ${prog.overallProgress}%`);
    lines.push('');

    if (prog.currentPhase) {
      lines.push(`  Current Phase: ${this.color(prog.currentPhase, 'cyan', 'bold')}`);
    }
    if (prog.currentTask) {
      lines.push(`  Current Task:  ${prog.currentTask}`);
    }
    lines.push('');

    if (prog.phases.length > 0) {
      lines.push('  Phases:');
      for (const phase of prog.phases) {
        const statusIcon = this.getPhaseStatusIcon(phase.status);
        const progressBar = this.renderProgressBar(phase.progress, 20);
        lines.push(`    ${statusIcon} ${phase.name.padEnd(20)} ${progressBar} ${phase.progress}% (${phase.tasks.completed}/${phase.tasks.total} tasks)`);
      }
    } else {
      lines.push('  No phases defined yet');
    }

    return lines.join('\n');
  }

  /**
   * Render recent activity
   */
  private renderRecentActivity(status: DashboardStatus): string {
    const lines: string[] = [];
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push(this.color('  📋 Recent Activity', 'white', 'bold'));
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push('');

    if (status.recentActivity.length === 0) {
      lines.push('  No recent activity');
    } else {
      for (const activity of status.recentActivity.slice(0, 10)) {
        const icon = this.getActivityIcon(activity.type);
        const time = this.formatTimestamp(activity.timestamp, true);
        const category = this.color(`[${activity.category}]`, 'gray');
        lines.push(`  ${icon} ${time} ${category} ${activity.message}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Render alerts
   */
  private renderAlerts(status: DashboardStatus): string {
    const lines: string[] = [];
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push(this.color('  🚨 Active Alerts', 'white', 'bold'));
    lines.push(this.color('─'.repeat(80), 'gray'));
    lines.push('');

    if (status.alerts.length === 0) {
      lines.push(this.color('  ✅ No active alerts - All systems operational', 'green'));
    } else {
      for (const alert of status.alerts) {
        const icon = this.getAlertIcon(alert.severity);
        const time = this.formatTimestamp(alert.timestamp, true);
        const severity = this.color(alert.severity.toUpperCase(), this.getAlertColor(alert.severity));
        lines.push(`  ${icon} ${time} ${severity} ${alert.message}`);
      }
    }

    lines.push('');
    lines.push(this.color('═'.repeat(80), 'cyan'));

    return lines.join('\n');
  }

  /**
   * Render progress bar
   */
  private renderProgressBar(progress: number, width: number = 20): string {
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    let color: string;
    if (progress >= 75) color = 'green';
    else if (progress >= 50) color = 'yellow';
    else if (progress >= 25) color = 'orange';
    else color = 'red';

    return this.color(`[${bar}]`, color);
  }

  /**
   * Get status badge
   */
  private getStatusBadge(status: string): string {
    switch (status) {
      case 'healthy':
        return this.color('✅ HEALTHY', 'green', 'bold');
      case 'degraded':
        return this.color('⚠️  DEGRADED', 'yellow', 'bold');
      case 'error':
        return this.color('❌ ERROR', 'red', 'bold');
      default:
        return this.color('❓ UNKNOWN', 'gray', 'bold');
    }
  }

  /**
   * Get tool status icon
   */
  private getToolStatusIcon(status: string): string {
    switch (status) {
      case 'available': return '✅';
      case 'unavailable': return '❌';
      case 'degraded': return '⚠️';
      default: return '❓';
    }
  }

  /**
   * Get tool status color
   */
  private getToolStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'green';
      case 'unavailable': return 'red';
      case 'degraded': return 'yellow';
      default: return 'gray';
    }
  }

  /**
   * Get phase status icon
   */
  private getPhaseStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  }

  /**
   * Get activity icon
   */
  private getActivityIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '•';
    }
  }

  /**
   * Get alert icon
   */
  private getAlertIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  }

  /**
   * Get alert color
   */
  private getAlertColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'red';
      case 'error': return 'red';
      case 'warning': return 'yellow';
      case 'info': return 'cyan';
      default: return 'gray';
    }
  }

  /**
   * Format timestamp
   */
  private formatTimestamp(timestamp: string, short: boolean = false): string {
    const date = new Date(timestamp);
    if (short) {
      return date.toLocaleTimeString();
    }
    return date.toLocaleString();
  }

  /**
   * Format uptime
   */
  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Format bytes
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Apply color to text
   */
  private color(text: string, color: string, style?: string): string {
    if (!this.useColors) return text;

    const colors: Record<string, string> = {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      dim: '\x1b[2m',
      // Foreground colors
      black: '\x1b[30m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      orange: '\x1b[33m', // Same as yellow in terminal
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      gray: '\x1b[90m',
    };

    let result = '';
    if (style && colors[style]) result += colors[style];
    if (colors[color]) result += colors[color];
    result += text;
    result += colors.reset;

    return result;
  }
}
