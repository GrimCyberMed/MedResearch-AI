/**
 * Dashboard Data Collector
 * 
 * Collects real-time status data from all system components
 */

import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { MemorySystem } from '../memory/index.js';
import {
  DashboardStatus,
  SystemStatus,
  MCPToolStatus,
  MemoryStatus,
  ProgressStatus,
  PhaseProgress,
  ActivityLog,
  Alert,
} from './types.js';

export class DashboardCollector {
  private projectPath: string;
  private memory: MemorySystem | null = null;
  private activityLogs: ActivityLog[] = [];
  private alerts: Alert[] = [];
  private startTime: number;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.startTime = Date.now();
  }

  /**
   * Initialize memory system connection
   */
  async initialize(sessionId: string): Promise<void> {
    this.memory = new MemorySystem(this.projectPath, sessionId);
    await this.memory['db'].initialize();
  }

  /**
   * Collect all dashboard data
   */
  async collect(): Promise<DashboardStatus> {
    const timestamp = new Date().toISOString();

    return {
      timestamp,
      system: await this.collectSystemStatus(),
      mcpTools: await this.collectMCPToolStatus(),
      memory: await this.collectMemoryStatus(),
      progress: await this.collectProgressStatus(),
      recentActivity: this.getRecentActivity(20),
      alerts: this.getActiveAlerts(),
    };
  }

  /**
   * Collect system status
   */
  private async collectSystemStatus(): Promise<SystemStatus> {
    const dbPath = join(this.projectPath, '.memory', 'project-memory.db');
    const dbExists = existsSync(dbPath);
    const dbSize = dbExists ? statSync(dbPath).size : 0;

    return {
      status: dbExists ? 'healthy' : 'degraded',
      uptime: Date.now() - this.startTime,
      version: '4.0.1',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      database: {
        connected: dbExists,
        size: dbSize,
        path: dbPath,
      },
    };
  }

  /**
   * Collect MCP tool status
   */
  private async collectMCPToolStatus(): Promise<MCPToolStatus[]> {
    const tools: MCPToolStatus[] = [
      // Medical Database Tools
      {
        name: 'PubMed Search',
        category: 'database',
        status: 'available',
        lastChecked: new Date().toISOString(),
        dependencies: [
          { name: 'PubMed E-utilities API', available: true },
        ],
      },
      {
        name: 'Europe PMC Search',
        category: 'database',
        status: 'available',
        lastChecked: new Date().toISOString(),
        dependencies: [
          { name: 'Europe PMC REST API', available: true },
        ],
      },
      // Citation Tools
      {
        name: 'Unpaywall',
        category: 'citation',
        status: 'available',
        lastChecked: new Date().toISOString(),
        dependencies: [
          { name: 'Unpaywall API', available: true },
        ],
      },
      {
        name: 'Citation Manager',
        category: 'citation',
        status: 'available',
        lastChecked: new Date().toISOString(),
        dependencies: [
          { name: 'CrossRef API', available: true },
          { name: 'PubMed API', available: true },
        ],
      },
      // Statistics Tools
      {
        name: 'Meta-Analysis',
        category: 'statistics',
        status: await this.checkRAvailability() ? 'available' : 'unavailable',
        lastChecked: new Date().toISOString(),
        dependencies: [
          { 
            name: 'R', 
            available: await this.checkRAvailability(),
          },
          { 
            name: 'meta package', 
            available: await this.checkRAvailability(),
          },
        ],
        errorMessage: await this.checkRAvailability() ? undefined : 'R not installed or not in PATH',
      },
      {
        name: 'Forest Plot Generator',
        category: 'statistics',
        status: await this.checkRAvailability() ? 'available' : 'unavailable',
        lastChecked: new Date().toISOString(),
        dependencies: [
          { 
            name: 'R', 
            available: await this.checkRAvailability(),
          },
        ],
        errorMessage: await this.checkRAvailability() ? undefined : 'R not installed or not in PATH',
      },
      // Document Tools
      {
        name: 'Document Generator',
        category: 'document',
        status: 'available',
        lastChecked: new Date().toISOString(),
        dependencies: [
          { name: 'File System', available: true },
        ],
      },
      {
        name: 'PDF Export',
        category: 'document',
        status: await this.checkPandocAvailability() ? 'available' : 'degraded',
        lastChecked: new Date().toISOString(),
        dependencies: [
          { 
            name: 'Pandoc', 
            available: await this.checkPandocAvailability(),
          },
        ],
        errorMessage: await this.checkPandocAvailability() ? undefined : 'Pandoc not installed (optional)',
      },
    ];

    return tools;
  }

  /**
   * Collect memory status
   */
  private async collectMemoryStatus(): Promise<MemoryStatus> {
    if (!this.memory) {
      return this.getEmptyMemoryStatus();
    }

    try {
      const stats = this.memory.getStats();
      const todos = await this.memory.getTodos();

      // Get unique phases from working memory
      const workingPhases: string[] = [];
      
      // Count todos by status
      const todosByStatus = {
        pending: todos.filter(t => t.status === 'pending').length,
        inProgress: todos.filter(t => t.status === 'in_progress').length,
        completed: todos.filter(t => t.status === 'completed').length,
        blocked: todos.filter(t => t.status === 'blocked').length,
      };

      return {
        shortTerm: {
          count: stats.shortTermCount,
          sessions: 1, // Current session
          lastUpdated: new Date().toISOString(),
        },
        working: {
          count: stats.workingMemoryCount,
          phases: workingPhases,
          lastUpdated: new Date().toISOString(),
        },
        longTerm: {
          count: stats.longTermCount,
          categories: {
            decision: 0,
            output: 0,
            validation: 0,
            user_input: 0,
            claim: 0,
          },
          lastUpdated: new Date().toISOString(),
        },
        episodic: {
          count: stats.episodicCount,
          decisions: stats.episodicCount,
          lastUpdated: new Date().toISOString(),
        },
        checkpoints: {
          count: stats.checkpointCount,
          latest: stats.checkpointCount > 0 ? new Date().toISOString() : undefined,
          autoSaveEnabled: true,
        },
        citations: {
          count: stats.citationCount,
          verified: 0,
          unverified: stats.citationCount,
        },
        todos: {
          total: todos.length,
          pending: todosByStatus.pending,
          inProgress: todosByStatus.inProgress,
          completed: todosByStatus.completed,
          blocked: todosByStatus.blocked,
        },
      };
    } catch (error) {
      this.logActivity('error', 'memory', 'Failed to collect memory status', { error });
      return this.getEmptyMemoryStatus();
    }
  }

  /**
   * Collect progress status
   */
  private async collectProgressStatus(): Promise<ProgressStatus> {
    if (!this.memory) {
      return {
        phases: [],
        overallProgress: 0,
      };
    }

    try {
      const phases = await this.memory.getPhaseProgress();
      const todos = await this.memory.getTodos();

      const phaseProgress: PhaseProgress[] = phases.map(phase => {
        const phaseTodos = todos.filter(t => t.phase_name === phase.phase_name);
        const completedTodos = phaseTodos.filter(t => t.status === 'completed').length;
        const progress = phaseTodos.length > 0 
          ? Math.round((completedTodos / phaseTodos.length) * 100)
          : 0;

        return {
          name: phase.phase_name,
          status: phase.status as 'pending' | 'in_progress' | 'completed' | 'failed',
          progress,
          startedAt: phase.started_at ? phase.started_at.toString() : undefined,
          completedAt: phase.completed_at ? phase.completed_at.toString() : undefined,
          tasks: {
            total: phaseTodos.length,
            completed: completedTodos,
          },
          qualityGatePassed: phase.quality_gate_passed ? true : false,
        };
      });

      const completedPhases = phases.filter(p => p.status === 'completed').length;
      const overallProgress = phases.length > 0
        ? Math.round((completedPhases / phases.length) * 100)
        : 0;

      const currentPhase = phases.find(p => p.status === 'in_progress');
      const currentTodo = todos.find(t => t.status === 'in_progress');

      return {
        currentPhase: currentPhase?.phase_name,
        currentTask: currentTodo?.task_description,
        phases: phaseProgress,
        overallProgress,
      };
    } catch (error) {
      this.logActivity('error', 'progress', 'Failed to collect progress status', { error });
      return {
        phases: [],
        overallProgress: 0,
      };
    }
  }

  /**
   * Check if R is available
   */
  private async checkRAvailability(): Promise<boolean> {
    try {
      const { spawn } = await import('child_process');
      return new Promise((resolve) => {
        const rProcess = spawn('Rscript', ['--version']);
        rProcess.on('error', () => resolve(false));
        rProcess.on('close', (code) => resolve(code === 0));
        setTimeout(() => {
          rProcess.kill();
          resolve(false);
        }, 1000);
      });
    } catch {
      return false;
    }
  }

  /**
   * Check if Pandoc is available
   */
  private async checkPandocAvailability(): Promise<boolean> {
    try {
      const { spawn } = await import('child_process');
      return new Promise((resolve) => {
        const pandocProcess = spawn('pandoc', ['--version']);
        pandocProcess.on('error', () => resolve(false));
        pandocProcess.on('close', (code) => resolve(code === 0));
        setTimeout(() => {
          pandocProcess.kill();
          resolve(false);
        }, 1000);
      });
    } catch {
      return false;
    }
  }

  /**
   * Log activity
   */
  logActivity(
    type: 'info' | 'warning' | 'error' | 'success',
    category: 'system' | 'mcp' | 'memory' | 'progress' | 'user',
    message: string,
    details?: Record<string, any>
  ): void {
    const log: ActivityLog = {
      timestamp: new Date().toISOString(),
      type,
      category,
      message,
      details,
    };

    this.activityLogs.unshift(log);

    // Keep only last 100 logs
    if (this.activityLogs.length > 100) {
      this.activityLogs = this.activityLogs.slice(0, 100);
    }

    // Create alert for errors
    if (type === 'error') {
      this.createAlert('error', category, message, details);
    }
  }

  /**
   * Create alert
   */
  createAlert(
    severity: 'info' | 'warning' | 'error' | 'critical',
    category: 'system' | 'mcp' | 'memory' | 'progress' | 'user',
    message: string,
    details?: Record<string, any>
  ): void {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      category,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      details,
    };

    this.alerts.unshift(alert);

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }
  }

  /**
   * Get recent activity logs
   */
  getRecentActivity(limit: number = 20): ActivityLog[] {
    return this.activityLogs.slice(0, limit);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Get empty memory status
   */
  private getEmptyMemoryStatus(): MemoryStatus {
    return {
      shortTerm: { count: 0, sessions: 0 },
      working: { count: 0, phases: [] },
      longTerm: { count: 0, categories: {} },
      episodic: { count: 0, decisions: 0 },
      checkpoints: { count: 0, autoSaveEnabled: false },
      citations: { count: 0, verified: 0, unverified: 0 },
      todos: { total: 0, pending: 0, inProgress: 0, completed: 0, blocked: 0 },
    };
  }

  /**
   * Close connections
   */
  close(): void {
    if (this.memory) {
      this.memory.close();
    }
  }
}
