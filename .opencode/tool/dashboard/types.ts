/**
 * Status Dashboard Types
 * 
 * Type definitions for the real-time status dashboard
 */

export interface DashboardStatus {
  timestamp: string;
  system: SystemStatus;
  mcpTools: MCPToolStatus[];
  memory: MemoryStatus;
  progress: ProgressStatus;
  recentActivity: ActivityLog[];
  alerts: Alert[];
}

export interface SystemStatus {
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

export interface MCPToolStatus {
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

export interface MemoryStatus {
  shortTerm: {
    count: number;
    sessions: number;
    lastUpdated?: string;
  };
  working: {
    count: number;
    phases: string[];
    lastUpdated?: string;
  };
  longTerm: {
    count: number;
    categories: Record<string, number>;
    lastUpdated?: string;
  };
  episodic: {
    count: number;
    decisions: number;
    lastUpdated?: string;
  };
  checkpoints: {
    count: number;
    latest?: string;
    autoSaveEnabled: boolean;
  };
  citations: {
    count: number;
    verified: number;
    unverified: number;
  };
  todos: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    blocked: number;
  };
}

export interface ProgressStatus {
  currentPhase?: string;
  currentTask?: string;
  phases: PhaseProgress[];
  overallProgress: number; // 0-100
  estimatedCompletion?: string;
}

export interface PhaseProgress {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  tasks: {
    total: number;
    completed: number;
  };
  qualityGatePassed?: boolean;
}

export interface ActivityLog {
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'mcp' | 'memory' | 'progress' | 'user';
  message: string;
  details?: Record<string, any>;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'system' | 'mcp' | 'memory' | 'progress' | 'user';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  details?: Record<string, any>;
}

export interface DashboardConfig {
  refreshInterval: number; // milliseconds
  maxActivityLogs: number;
  maxAlerts: number;
  enableAutoRefresh: boolean;
  showDetailedStats: boolean;
}
