/**
 * Checkpoint System
 * 
 * Auto-save and manual checkpoint creation for session resumption
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { MemorySystem } from './index.js';
import {
  CheckpointState,
  CheckpointType,
  SessionCheckpoint,
  CurrentState,
} from './types.js';

export class CheckpointSystem {
  private memory: MemorySystem;
  private projectPath: string;
  private checkpointDir: string;
  private sessionDir: string;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor(memory: MemorySystem, projectPath: string) {
    this.memory = memory;
    this.projectPath = projectPath;
    this.checkpointDir = join(projectPath, '.memory', 'checkpoints');
    this.sessionDir = join(projectPath, '.session');

    // Ensure directories exist
    if (!existsSync(this.checkpointDir)) {
      mkdirSync(this.checkpointDir, { recursive: true });
    }
    if (!existsSync(this.sessionDir)) {
      mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  /**
   * Create a checkpoint
   */
  async createCheckpoint(
    type: CheckpointType,
    state: CheckpointState,
    description?: string
  ): Promise<number> {
    const database = this.memory['db'].getDatabase();
    
    // Save to database
    const stmt = database.prepare(`
      INSERT INTO session_checkpoints (checkpoint_type, phase_name, full_state, description)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      type,
      state.currentPhase,
      JSON.stringify(state),
      description || null
    );

    const checkpointId = result.lastInsertRowid as number;

    // Save to file system for quick access
    const checkpointFile = join(this.checkpointDir, `checkpoint-${checkpointId}.json`);
    writeFileSync(checkpointFile, JSON.stringify(state, null, 2));

    // Update latest checkpoint
    const latestFile = join(this.checkpointDir, 'latest.json');
    writeFileSync(latestFile, JSON.stringify({ checkpointId, state }, null, 2));

    // Update current state
    await this.updateCurrentState(state);

    // Generate resume prompt
    await this.generateResumePrompt(state);

    return checkpointId;
  }

  /**
   * Load latest checkpoint
   */
  async loadLatestCheckpoint(): Promise<{ checkpointId: number; state: CheckpointState } | null> {
    const latestFile = join(this.checkpointDir, 'latest.json');
    
    if (!existsSync(latestFile)) {
      return null;
    }

    try {
      const content = readFileSync(latestFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load latest checkpoint:', error);
      return null;
    }
  }

  /**
   * Load specific checkpoint
   */
  async loadCheckpoint(checkpointId: number): Promise<CheckpointState | null> {
    const checkpointFile = join(this.checkpointDir, `checkpoint-${checkpointId}.json`);
    
    if (!existsSync(checkpointFile)) {
      // Try loading from database
      const database = this.memory['db'].getDatabase();
      const stmt = database.prepare('SELECT full_state FROM session_checkpoints WHERE id = ?');
      const result = stmt.get(checkpointId) as SessionCheckpoint | undefined;
      
      if (result) {
        return JSON.parse(result.full_state);
      }
      
      return null;
    }

    try {
      const content = readFileSync(checkpointFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load checkpoint:', error);
      return null;
    }
  }

  /**
   * Start auto-save (every 5 minutes)
   */
  startAutoSave(getStateCallback: () => CheckpointState): void {
    // Clear existing interval if any
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // Auto-save every 5 minutes
    this.autoSaveInterval = setInterval(async () => {
      try {
        const state = getStateCallback();
        await this.createCheckpoint('auto', state, 'Auto-save checkpoint');
        console.log('[Checkpoint] Auto-save completed');
      } catch (error) {
        console.error('[Checkpoint] Auto-save failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    console.log('[Checkpoint] Auto-save started (every 5 minutes)');
  }

  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('[Checkpoint] Auto-save stopped');
    }
  }

  /**
   * Update current state file
   */
  private async updateCurrentState(state: CheckpointState): Promise<void> {
    const currentState: CurrentState = {
      project_id: state.projectMetadata.project_id,
      project_slug: state.projectMetadata.project_slug,
      current_phase: state.currentPhase,
      current_task: state.currentTask,
      last_updated: new Date().toISOString(),
      session_id: this.memory['sessionId'],
      active_agents: state.activeAgents,
      pending_approvals: state.pendingApprovals,
      context_summary: state.contextSummary,
      next_steps: state.nextSteps,
    };

    const currentStateFile = join(this.sessionDir, 'current-state.json');
    writeFileSync(currentStateFile, JSON.stringify(currentState, null, 2));
  }

  /**
   * Generate resume prompt
   */
  private async generateResumePrompt(state: CheckpointState): Promise<void> {
    const todos = await this.memory.getTodos();
    const phaseProgress = await this.memory.getPhaseProgress();

    const inProgressTodos = todos.filter(t => t.status === 'in_progress');
    const pendingTodos = todos.filter(t => t.status === 'pending');
    const blockedTodos = todos.filter(t => t.status === 'blocked');

    const completedPhases = phaseProgress.filter(p => p.status === 'completed');
    const remainingPhases = phaseProgress.filter(p => p.status === 'pending');

    const lastUpdated = new Date(state.projectMetadata.last_updated);
    const now = new Date();
    const timeSinceLastSession = this.formatTimeDifference(lastUpdated, now);

    const resumePrompt = `# 🔄 Resume Research Session

## Project: ${state.projectMetadata.project_title}

**Last Session**: ${lastUpdated.toLocaleString()}  
**Current Phase**: ${state.currentPhase} (${this.calculateProgress(phaseProgress)}% complete)  
**Time Since Last Session**: ${timeSinceLastSession}

---

## 📊 Quick Status

✅ **Completed Phases**: ${completedPhases.map(p => p.phase_name).join(', ') || 'None'}
🔄 **Current Phase**: ${state.currentPhase}
⏳ **Remaining Phases**: ${remainingPhases.map(p => p.phase_name).join(', ') || 'None'}

---

## 🎯 Where We Left Off

**Last Task**: ${state.currentTask}

**What We Were Doing**:
${state.contextSummary}

---

## 📋 Todo List

${inProgressTodos.length > 0 ? `**In Progress**:
${inProgressTodos.map(t => `- [ ] ${t.task_description} (${t.assigned_agent || 'unassigned'})`).join('\n')}
` : ''}
${pendingTodos.length > 0 ? `**Pending**:
${pendingTodos.slice(0, 10).map(t => `- [ ] ${t.task_description} (Priority: ${t.priority})`).join('\n')}
${pendingTodos.length > 10 ? `\n... and ${pendingTodos.length - 10} more` : ''}
` : ''}
${blockedTodos.length > 0 ? `**Blocked**:
${blockedTodos.map(t => `- [ ] ${t.task_description} (${t.notes || 'No reason specified'})`).join('\n')}
` : ''}

---

## 🔑 Key Decisions Made

${state.recentDecisions.slice(0, 5).map(d => 
  `- **${d.decision_type}**: ${d.decision} (${d.user_approved ? '✅ Approved' : '⏳ Pending'})`
).join('\n') || 'No recent decisions'}

---

## ⏭️ Next Steps

${state.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

---

## ❓ Before We Continue

1. Do you want to continue where we left off?
2. Do you want to review any previous phase?
3. Do you want to modify the plan?

**Type 'continue' to resume, or ask me anything about the project.**

---

**Project ID**: ${state.projectMetadata.project_id}  
**University**: ${state.projectMetadata.university}  
**Research Question**: ${state.projectMetadata.research_question}
`;

    const resumePromptFile = join(this.sessionDir, 'resume-prompt.md');
    writeFileSync(resumePromptFile, resumePrompt);
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(phaseProgress: any[]): number {
    if (phaseProgress.length === 0) return 0;
    const completed = phaseProgress.filter(p => p.status === 'completed').length;
    return Math.round((completed / phaseProgress.length) * 100);
  }

  /**
   * Format time difference
   */
  private formatTimeDifference(from: Date, to: Date): string {
    const diffMs = to.getTime() - from.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  /**
   * Get all checkpoints
   */
  async getAllCheckpoints(): Promise<SessionCheckpoint[]> {
    const database = this.memory['db'].getDatabase();
    const stmt = database.prepare('SELECT * FROM session_checkpoints ORDER BY created_at DESC');
    return stmt.all() as SessionCheckpoint[];
  }

  /**
   * Delete old checkpoints (keep last N)
   */
  async cleanupOldCheckpoints(keepLast: number = 10): Promise<number> {
    const database = this.memory['db'].getDatabase();
    
    // Get checkpoint IDs to delete
    const stmt = database.prepare(`
      SELECT id FROM session_checkpoints 
      ORDER BY created_at DESC 
      LIMIT -1 OFFSET ?
    `);
    const toDelete = stmt.all(keepLast) as { id: number }[];

    if (toDelete.length === 0) {
      return 0;
    }

    // Delete from database
    const deleteStmt = database.prepare('DELETE FROM session_checkpoints WHERE id = ?');
    for (const { id } of toDelete) {
      deleteStmt.run(id);
      
      // Delete file if exists
      const checkpointFile = join(this.checkpointDir, `checkpoint-${id}.json`);
      if (existsSync(checkpointFile)) {
        try {
          require('fs').unlinkSync(checkpointFile);
        } catch (error) {
          console.error(`Failed to delete checkpoint file ${id}:`, error);
        }
      }
    }

    return toDelete.length;
  }
}
