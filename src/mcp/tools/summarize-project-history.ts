/**
 * MCP Tool: Project History Summarization
 * 
 * Analyzes project memory and generates comprehensive summaries of project
 * history, including timeline, milestones, decisions, and progress metrics.
 * 
 * Features:
 * - Timeline analysis with key events
 * - Milestone tracking and completion
 * - Decision history and rationale
 * - Progress metrics by phase
 * - Agent activity analysis
 * - Trend identification
 * 
 * @module summarize-project-history
 * @version 1.0.0
 * @since Phase 3
 */

import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../../common/logger.js';

/**
 * Memory entry structure
 */
interface MemoryEntry {
  id: string;
  timestamp: string;
  type: 'decision' | 'finding' | 'note' | 'milestone' | 'error' | 'warning';
  content: string;
  tags: string[];
  metadata: Record<string, any>;
  phase?: string;
  agent?: string;
}

/**
 * Timeline event
 */
interface TimelineEvent {
  date: string;
  type: string;
  description: string;
  phase?: string;
  agent?: string;
  importance: 'high' | 'medium' | 'low';
}

/**
 * Phase summary
 */
interface PhaseSummary {
  phase: string;
  startDate: string;
  endDate?: string;
  duration?: number;
  milestones: number;
  decisions: number;
  findings: number;
  issues: number;
  status: 'completed' | 'in_progress' | 'not_started';
  keyEvents: string[];
}

/**
 * Agent activity summary
 */
interface AgentActivity {
  agent: string;
  totalActions: number;
  decisions: number;
  findings: number;
  notes: number;
  lastActive: string;
  phases: string[];
}

/**
 * Input schema
 */
interface SummarizeHistoryInput {
  projectPath: string;
  format?: 'markdown' | 'json' | 'html';
  includeTimeline?: boolean;
  includeMilestones?: boolean;
  includeDecisions?: boolean;
  includeMetrics?: boolean;
  dateFrom?: string;
  dateTo?: string;
  phases?: string[];
}

/**
 * Output schema
 */
interface SummarizeHistoryOutput {
  success: boolean;
  projectName: string;
  summary: string;
  timeline?: TimelineEvent[];
  phases?: PhaseSummary[];
  agents?: AgentActivity[];
  metrics?: {
    totalEntries: number;
    totalDecisions: number;
    totalMilestones: number;
    totalFindings: number;
    totalIssues: number;
    projectDuration: number;
    activeDays: number;
    averageEntriesPerDay: number;
  };
  outputFile?: string;
  error?: string;
}

/**
 * Load memory entries from project
 */
async function loadMemoryEntries(projectPath: string): Promise<MemoryEntry[]> {
  const memoryPath = path.join(projectPath, '.memory');
  const entries: MemoryEntry[] = [];

  try {
    await fs.access(memoryPath);
    const files = await fs.readdir(memoryPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(memoryPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
          entries.push(...data);
        } else {
          entries.push(data);
        }
      }
    }
  } catch (error) {
    logger.warn(`Memory directory not found at ${memoryPath}`);
  }

  return entries;
}

/**
 * Filter entries by date range and phases
 */
function filterEntries(
  entries: MemoryEntry[],
  dateFrom?: string,
  dateTo?: string,
  phases?: string[]
): MemoryEntry[] {
  return entries.filter(entry => {
    if (dateFrom && entry.timestamp < dateFrom) return false;
    if (dateTo && entry.timestamp > dateTo) return false;
    if (phases && phases.length > 0 && entry.phase && !phases.includes(entry.phase)) return false;
    return true;
  });
}

/**
 * Build timeline from entries
 */
function buildTimeline(entries: MemoryEntry[]): TimelineEvent[] {
  const timeline: TimelineEvent[] = [];

  for (const entry of entries) {
    const importance = 
      entry.type === 'milestone' ? 'high' :
      entry.type === 'decision' ? 'high' :
      entry.type === 'error' ? 'medium' :
      'low';

    timeline.push({
      date: entry.timestamp,
      type: entry.type,
      description: entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : ''),
      phase: entry.phase,
      agent: entry.agent,
      importance
    });
  }

  // Sort by date
  timeline.sort((a, b) => a.date.localeCompare(b.date));

  return timeline;
}

/**
 * Analyze phases
 */
function analyzePhases(entries: MemoryEntry[]): PhaseSummary[] {
  const phaseMap = new Map<string, MemoryEntry[]>();

  // Group entries by phase
  for (const entry of entries) {
    if (entry.phase) {
      if (!phaseMap.has(entry.phase)) {
        phaseMap.set(entry.phase, []);
      }
      phaseMap.get(entry.phase)!.push(entry);
    }
  }

  const summaries: PhaseSummary[] = [];

  for (const [phase, phaseEntries] of phaseMap.entries()) {
    const timestamps = phaseEntries.map(e => e.timestamp).sort();
    const startDate = timestamps[0];
    const endDate = timestamps[timestamps.length - 1];
    
    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const milestones = phaseEntries.filter(e => e.type === 'milestone').length;
    const decisions = phaseEntries.filter(e => e.type === 'decision').length;
    const findings = phaseEntries.filter(e => e.type === 'finding').length;
    const issues = phaseEntries.filter(e => e.type === 'error' || e.type === 'warning').length;

    // Determine status
    const hasMilestone = milestones > 0;
    const status = hasMilestone ? 'completed' : 'in_progress';

    // Extract key events
    const keyEvents = phaseEntries
      .filter(e => e.type === 'milestone' || e.type === 'decision')
      .slice(0, 3)
      .map(e => e.content.substring(0, 80) + (e.content.length > 80 ? '...' : ''));

    summaries.push({
      phase,
      startDate,
      endDate,
      duration,
      milestones,
      decisions,
      findings,
      issues,
      status,
      keyEvents
    });
  }

  // Sort by start date
  summaries.sort((a, b) => a.startDate.localeCompare(b.startDate));

  return summaries;
}

/**
 * Analyze agent activity
 */
function analyzeAgents(entries: MemoryEntry[]): AgentActivity[] {
  const agentMap = new Map<string, MemoryEntry[]>();

  // Group entries by agent
  for (const entry of entries) {
    if (entry.agent) {
      if (!agentMap.has(entry.agent)) {
        agentMap.set(entry.agent, []);
      }
      agentMap.get(entry.agent)!.push(entry);
    }
  }

  const activities: AgentActivity[] = [];

  for (const [agent, agentEntries] of agentMap.entries()) {
    const decisions = agentEntries.filter(e => e.type === 'decision').length;
    const findings = agentEntries.filter(e => e.type === 'finding').length;
    const notes = agentEntries.filter(e => e.type === 'note').length;

    const timestamps = agentEntries.map(e => e.timestamp).sort();
    const lastActive = timestamps[timestamps.length - 1];

    const phases = [...new Set(agentEntries.map(e => e.phase).filter(Boolean))];

    activities.push({
      agent,
      totalActions: agentEntries.length,
      decisions,
      findings,
      notes,
      lastActive,
      phases: phases as string[]
    });
  }

  // Sort by total actions (descending)
  activities.sort((a, b) => b.totalActions - a.totalActions);

  return activities;
}

/**
 * Calculate project metrics
 */
function calculateMetrics(entries: MemoryEntry[]): any {
  const totalEntries = entries.length;
  const totalDecisions = entries.filter(e => e.type === 'decision').length;
  const totalMilestones = entries.filter(e => e.type === 'milestone').length;
  const totalFindings = entries.filter(e => e.type === 'finding').length;
  const totalIssues = entries.filter(e => e.type === 'error' || e.type === 'warning').length;

  // Calculate project duration
  const timestamps = entries.map(e => e.timestamp).sort();
  const startDate = new Date(timestamps[0]);
  const endDate = new Date(timestamps[timestamps.length - 1]);
  const projectDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate active days (days with at least one entry)
  const uniqueDays = new Set(timestamps.map(ts => ts.substring(0, 10)));
  const activeDays = uniqueDays.size;

  const averageEntriesPerDay = totalEntries / activeDays;

  return {
    totalEntries,
    totalDecisions,
    totalMilestones,
    totalFindings,
    totalIssues,
    projectDuration,
    activeDays,
    averageEntriesPerDay: Math.round(averageEntriesPerDay * 10) / 10
  };
}

/**
 * Generate markdown summary
 */
function generateMarkdownSummary(
  projectName: string,
  timeline?: TimelineEvent[],
  phases?: PhaseSummary[],
  agents?: AgentActivity[],
  metrics?: any
): string {
  let md = `# Project History Summary: ${projectName}\n\n`;
  md += `**Generated**: ${new Date().toISOString()}\n\n`;
  md += `---\n\n`;

  // Executive Summary
  md += `## Executive Summary\n\n`;
  if (metrics) {
    md += `- **Total Entries**: ${metrics.totalEntries}\n`;
    md += `- **Project Duration**: ${metrics.projectDuration} days\n`;
    md += `- **Active Days**: ${metrics.activeDays}\n`;
    md += `- **Decisions Made**: ${metrics.totalDecisions}\n`;
    md += `- **Milestones Reached**: ${metrics.totalMilestones}\n`;
    md += `- **Findings Recorded**: ${metrics.totalFindings}\n`;
    md += `- **Issues Encountered**: ${metrics.totalIssues}\n`;
    md += `- **Average Activity**: ${metrics.averageEntriesPerDay} entries/day\n\n`;
  }

  // Timeline
  if (timeline && timeline.length > 0) {
    md += `## Timeline\n\n`;
    const importantEvents = timeline.filter(e => e.importance === 'high').slice(0, 10);
    for (const event of importantEvents) {
      const date = new Date(event.date).toLocaleDateString();
      md += `- **${date}** [${event.type}] ${event.description}\n`;
    }
    md += `\n`;
  }

  // Phases
  if (phases && phases.length > 0) {
    md += `## Phase Summary\n\n`;
    for (const phase of phases) {
      md += `### ${phase.phase}\n\n`;
      md += `- **Status**: ${phase.status}\n`;
      md += `- **Duration**: ${phase.duration} days\n`;
      md += `- **Milestones**: ${phase.milestones}\n`;
      md += `- **Decisions**: ${phase.decisions}\n`;
      md += `- **Findings**: ${phase.findings}\n`;
      if (phase.issues > 0) {
        md += `- **Issues**: ${phase.issues}\n`;
      }
      if (phase.keyEvents.length > 0) {
        md += `\n**Key Events**:\n`;
        for (const event of phase.keyEvents) {
          md += `- ${event}\n`;
        }
      }
      md += `\n`;
    }
  }

  // Agent Activity
  if (agents && agents.length > 0) {
    md += `## Agent Activity\n\n`;
    md += `| Agent | Actions | Decisions | Findings | Phases |\n`;
    md += `|-------|---------|-----------|----------|--------|\n`;
    for (const agent of agents) {
      md += `| ${agent.agent} | ${agent.totalActions} | ${agent.decisions} | ${agent.findings} | ${agent.phases.join(', ')} |\n`;
    }
    md += `\n`;
  }

  return md;
}

/**
 * Summarize project history
 */
export async function summarizeProjectHistory(
  input: SummarizeHistoryInput
): Promise<SummarizeHistoryOutput> {
  try {
    logger.info('Starting project history summarization', { projectPath: input.projectPath });

    // Load entries
    const allEntries = await loadMemoryEntries(input.projectPath);
    
    if (allEntries.length === 0) {
      return {
        success: true,
        projectName: path.basename(input.projectPath),
        summary: 'No project history found. Start using the system to build memory.',
        metrics: {
          totalEntries: 0,
          totalDecisions: 0,
          totalMilestones: 0,
          totalFindings: 0,
          totalIssues: 0,
          projectDuration: 0,
          activeDays: 0,
          averageEntriesPerDay: 0
        }
      };
    }

    // Filter entries
    const entries = filterEntries(allEntries, input.dateFrom, input.dateTo, input.phases);

    const projectName = path.basename(input.projectPath);
    const format = input.format || 'markdown';

    // Build components
    const timeline = input.includeTimeline !== false ? buildTimeline(entries) : undefined;
    const phases = analyzePhases(entries);
    const agents = analyzeAgents(entries);
    const metrics = input.includeMetrics !== false ? calculateMetrics(entries) : undefined;

    // Generate summary
    let summary = '';
    let outputFile: string | undefined;

    if (format === 'markdown') {
      summary = generateMarkdownSummary(projectName, timeline, phases, agents, metrics);
      
      // Save to file
      outputFile = path.join(input.projectPath, 'project-history-summary.md');
      await fs.writeFile(outputFile, summary);
    } else if (format === 'json') {
      const jsonData = {
        projectName,
        timeline,
        phases,
        agents,
        metrics
      };
      summary = JSON.stringify(jsonData, null, 2);
      
      outputFile = path.join(input.projectPath, 'project-history-summary.json');
      await fs.writeFile(outputFile, summary);
    } else if (format === 'html') {
      // Simple HTML format
      summary = `<!DOCTYPE html>
<html>
<head>
  <title>Project History: ${projectName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
  </style>
</head>
<body>
  <h1>Project History: ${projectName}</h1>
  ${metrics ? `
  <h2>Metrics</h2>
  <ul>
    <li>Total Entries: ${metrics.totalEntries}</li>
    <li>Project Duration: ${metrics.projectDuration} days</li>
    <li>Decisions: ${metrics.totalDecisions}</li>
    <li>Milestones: ${metrics.totalMilestones}</li>
  </ul>
  ` : ''}
</body>
</html>`;
      
      outputFile = path.join(input.projectPath, 'project-history-summary.html');
      await fs.writeFile(outputFile, summary);
    }

    logger.info('Project history summarization completed', {
      projectName,
      totalEntries: entries.length,
      format
    });

    return {
      success: true,
      projectName,
      summary,
      timeline,
      phases,
      agents,
      metrics,
      outputFile
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Project history summarization failed', { error: errorMessage });

    return {
      success: false,
      projectName: path.basename(input.projectPath),
      summary: '',
      error: errorMessage
    };
  }
}

/**
 * MCP tool definition
 */
export const summarizeProjectHistoryTool = {
  name: 'summarize_project_history',
  description: 'Generate comprehensive summary of project history from memory',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to project directory'
      },
      format: {
        type: 'string',
        enum: ['markdown', 'json', 'html'],
        description: 'Output format (default: markdown)',
        default: 'markdown'
      },
      includeTimeline: {
        type: 'boolean',
        description: 'Include timeline of events (default: true)',
        default: true
      },
      includeMilestones: {
        type: 'boolean',
        description: 'Include milestone tracking (default: true)',
        default: true
      },
      includeDecisions: {
        type: 'boolean',
        description: 'Include decision history (default: true)',
        default: true
      },
      includeMetrics: {
        type: 'boolean',
        description: 'Include project metrics (default: true)',
        default: true
      },
      dateFrom: {
        type: 'string',
        description: 'Filter entries from this date (ISO format)'
      },
      dateTo: {
        type: 'string',
        description: 'Filter entries until this date (ISO format)'
      },
      phases: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by specific phases'
      }
    },
    required: ['projectPath']
  }
};
