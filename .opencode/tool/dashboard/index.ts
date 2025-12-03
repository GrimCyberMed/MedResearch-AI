/**
 * Status Dashboard - Main Module
 * 
 * Real-time status dashboard for MedResearch AI system
 */

export * from './types.js';
export { DashboardCollector } from './collector.js';
export { DashboardRenderer } from './renderer.js';

import { DashboardCollector } from './collector.js';
import { DashboardRenderer } from './renderer.js';
import { DashboardConfig } from './types.js';

export class StatusDashboard {
  private collector: DashboardCollector;
  private renderer: DashboardRenderer;
  private config: DashboardConfig;
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor(projectPath: string, config?: Partial<DashboardConfig>) {
    this.collector = new DashboardCollector(projectPath);
    this.renderer = new DashboardRenderer(true);
    this.config = {
      refreshInterval: 5000, // 5 seconds
      maxActivityLogs: 20,
      maxAlerts: 10,
      enableAutoRefresh: false,
      showDetailedStats: true,
      ...config,
    };
  }

  /**
   * Initialize dashboard
   */
  async initialize(sessionId: string = 'dashboard-session'): Promise<void> {
    await this.collector.initialize(sessionId);
    this.collector.logActivity('success', 'system', 'Dashboard initialized');
  }

  /**
   * Display dashboard once
   */
  async display(): Promise<void> {
    const status = await this.collector.collect();
    const output = this.renderer.render(status);
    console.clear();
    console.log(output);
  }

  /**
   * Start auto-refresh
   */
  async startAutoRefresh(): Promise<void> {
    if (this.refreshInterval) {
      return; // Already running
    }

    this.config.enableAutoRefresh = true;
    await this.display();

    this.refreshInterval = setInterval(async () => {
      await this.display();
    }, this.config.refreshInterval);

    this.collector.logActivity('info', 'system', `Auto-refresh started (${this.config.refreshInterval}ms interval)`);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      this.config.enableAutoRefresh = false;
      this.collector.logActivity('info', 'system', 'Auto-refresh stopped');
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
    this.collector.logActivity(type, category, message, details);
  }

  /**
   * Create alert
   */
  createAlert(
    severity: 'info' | 'warning' | 'error' | 'critical',
    category: 'system' | 'mcp' | 'memory' | 'progress',
    message: string,
    details?: Record<string, any>
  ): void {
    this.collector.createAlert(severity, category, message, details);
  }

  /**
   * Get current status
   */
  async getStatus() {
    return await this.collector.collect();
  }

  /**
   * Close dashboard
   */
  close(): void {
    this.stopAutoRefresh();
    this.collector.close();
  }
}
