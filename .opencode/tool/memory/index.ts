/**
 * Memory System - Main Module
 * 
 * 4-Tier Memory Architecture for MedResearch AI
 * - Short-term: Current conversation
 * - Working: Current phase context
 * - Long-term: Complete project history
 * - Episodic: Decision history across projects
 */

import { MemoryDatabase } from './database.js';
import {
  MemoryTier,
  MemorySaveOptions,
  MemoryQuery,
  MemoryItem,
  ShortTermMemory,
  WorkingMemory,
  LongTermMemory,
  EpisodicMemory,
  Todo,
  PhaseProgress,
  Citation,
} from './types.js';

export class MemorySystem {
  private db: MemoryDatabase;
  private projectPath: string;
  private sessionId: string;

  constructor(projectPath: string, sessionId: string) {
    this.projectPath = projectPath;
    this.sessionId = sessionId;
    this.db = new MemoryDatabase(projectPath);
  }

  /**
   * Save to memory
   */
  async save(options: MemorySaveOptions): Promise<void> {
    const { tier, category, key, value, metadata } = options;

    switch (tier) {
      case 'short':
        await this.saveShortTerm({
          session_id: this.sessionId,
          message_type: metadata?.agent ? 'assistant' : 'user',
          content: typeof value === 'string' ? value : JSON.stringify(value),
          agent_name: metadata?.agent,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
        });
        break;

      case 'working':
        await this.saveWorking({
          phase_name: metadata?.phase || 'unknown',
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          value_type: typeof value === 'string' ? 'string' : 'json',
          importance: metadata?.importance || 5,
        });
        break;

      case 'long':
        await this.saveLongTerm({
          category: (category as any) || 'output',
          phase_name: metadata?.phase,
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          source_agent: metadata?.agent,
          confidence_score: metadata?.confidence,
          citations: metadata?.citations ? JSON.stringify(metadata.citations) : undefined,
        });
        break;

      case 'episodic':
        // Episodic memory requires specific structure
        throw new Error('Use saveDecision() for episodic memory');

      default:
        throw new Error(`Unknown memory tier: ${tier}`);
    }
  }

  /**
   * Retrieve from memory
   */
  async retrieve(query: MemoryQuery): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];
    const tiers = query.tier === 'all' ? ['short', 'working', 'long', 'episodic'] : [query.tier || 'all'];

    for (const tier of tiers) {
      switch (tier) {
        case 'short':
          const shortTermResults = await this.retrieveShortTerm(query);
          results.push(...shortTermResults.map(data => ({ tier: 'short' as MemoryTier, data })));
          break;

        case 'working':
          const workingResults = await this.retrieveWorking(query);
          results.push(...workingResults.map(data => ({ tier: 'working' as MemoryTier, data })));
          break;

        case 'long':
          const longTermResults = await this.retrieveLongTerm(query);
          results.push(...longTermResults.map(data => ({ tier: 'long' as MemoryTier, data })));
          break;

        case 'episodic':
          const episodicResults = await this.retrieveEpisodic(query);
          results.push(...episodicResults.map(data => ({ tier: 'episodic' as MemoryTier, data })));
          break;
      }
    }

    return results;
  }

  /**
   * Compress working memory to long-term (when phase completes)
   */
  async compressWorkingMemory(phaseName: string): Promise<void> {
    const database = this.db.getDatabase();

    // Get all working memory for this phase
    const workingItems = database
      .prepare('SELECT * FROM working_memory WHERE phase_name = ?')
      .all(phaseName) as WorkingMemory[];

    // Archive to long-term memory
    const insertLongTerm = database.prepare(`
      INSERT INTO long_term_memory (category, phase_name, key, value, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of workingItems) {
      insertLongTerm.run(
        'output',
        phaseName,
        item.key,
        item.value,
        item.created_at
      );
    }

    // Clear working memory for this phase
    database.prepare('DELETE FROM working_memory WHERE phase_name = ?').run(phaseName);
  }

  /**
   * Save decision to episodic memory
   */
  async saveDecision(decision: Omit<EpisodicMemory, 'id' | 'timestamp'>): Promise<void> {
    const database = this.db.getDatabase();
    const stmt = database.prepare(`
      INSERT INTO episodic_memory (decision_type, context, decision, rationale, outcome, user_approved)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      decision.decision_type,
      decision.context,
      decision.decision,
      decision.rationale,
      decision.outcome || null,
      decision.user_approved ? 1 : 0
    );
  }

  /**
   * Save/update todo
   */
  async saveTodo(todo: Omit<Todo, 'id'>): Promise<number> {
    const database = this.db.getDatabase();
    const stmt = database.prepare(`
      INSERT INTO todo_list (phase_name, task_description, status, priority, assigned_agent, dependencies, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      todo.phase_name,
      todo.task_description,
      todo.status,
      todo.priority || 5,
      todo.assigned_agent || null,
      todo.dependencies || null,
      todo.notes || null
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Update todo status
   */
  async updateTodoStatus(todoId: number, status: Todo['status']): Promise<void> {
    const database = this.db.getDatabase();
    const stmt = database.prepare(`
      UPDATE todo_list 
      SET status = ?, completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = ?
    `);

    stmt.run(status, status, todoId);
  }

  /**
   * Get all todos
   */
  async getTodos(phaseName?: string): Promise<Todo[]> {
    const database = this.db.getDatabase();
    const query = phaseName
      ? 'SELECT * FROM todo_list WHERE phase_name = ? ORDER BY priority DESC, created_at ASC'
      : 'SELECT * FROM todo_list ORDER BY priority DESC, created_at ASC';

    const stmt = database.prepare(query);
    return phaseName ? stmt.all(phaseName) as Todo[] : stmt.all() as Todo[];
  }

  /**
   * Save/update phase progress
   */
  async savePhaseProgress(progress: PhaseProgress): Promise<void> {
    const database = this.db.getDatabase();
    const stmt = database.prepare(`
      INSERT OR REPLACE INTO phase_progress 
      (phase_name, status, started_at, completed_at, quality_gate_passed, critique_report_path, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      progress.phase_name,
      progress.status,
      progress.started_at || null,
      progress.completed_at || null,
      progress.quality_gate_passed ? 1 : 0,
      progress.critique_report_path || null,
      progress.notes || null
    );
  }

  /**
   * Get phase progress
   */
  async getPhaseProgress(phaseName?: string): Promise<PhaseProgress[]> {
    const database = this.db.getDatabase();
    const query = phaseName
      ? 'SELECT * FROM phase_progress WHERE phase_name = ?'
      : 'SELECT * FROM phase_progress';

    const stmt = database.prepare(query);
    return phaseName ? stmt.all(phaseName) as PhaseProgress[] : stmt.all() as PhaseProgress[];
  }

  /**
   * Save citation
   */
  async saveCitation(citation: Omit<Citation, 'id'>): Promise<void> {
    const database = this.db.getDatabase();
    const stmt = database.prepare(`
      INSERT OR REPLACE INTO citation_registry 
      (citation_key, citation_type, full_citation, bibtex, verified, verification_date, used_in_phases, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      citation.citation_key,
      citation.citation_type,
      citation.full_citation || null,
      citation.bibtex || null,
      citation.verified ? 1 : 0,
      citation.verification_date || null,
      citation.used_in_phases || null,
      citation.metadata || null
    );
  }

  /**
   * Get citation
   */
  async getCitation(citationKey: string): Promise<Citation | null> {
    const database = this.db.getDatabase();
    const stmt = database.prepare('SELECT * FROM citation_registry WHERE citation_key = ?');
    return stmt.get(citationKey) as Citation | null;
  }

  /**
   * Get database statistics
   */
  getStats() {
    return this.db.getStats();
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }

  // Private helper methods

  private async saveShortTerm(memory: Omit<ShortTermMemory, 'id' | 'timestamp'>): Promise<void> {
    const database = this.db.getDatabase();
    const stmt = database.prepare(`
      INSERT INTO short_term_memory (session_id, message_type, content, agent_name, metadata)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      memory.session_id,
      memory.message_type,
      memory.content,
      memory.agent_name || null,
      memory.metadata || null
    );
  }

  private async saveWorking(memory: Omit<WorkingMemory, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const database = this.db.getDatabase();
    const stmt = database.prepare(`
      INSERT OR REPLACE INTO working_memory (phase_name, key, value, value_type, importance)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      memory.phase_name,
      memory.key,
      memory.value,
      memory.value_type,
      memory.importance || 5
    );
  }

  private async saveLongTerm(memory: Omit<LongTermMemory, 'id' | 'created_at' | 'archived'>): Promise<void> {
    const database = this.db.getDatabase();
    const stmt = database.prepare(`
      INSERT INTO long_term_memory (category, phase_name, key, value, source_agent, confidence_score, citations)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      memory.category,
      memory.phase_name || null,
      memory.key,
      memory.value,
      memory.source_agent || null,
      memory.confidence_score || null,
      memory.citations || null
    );
  }

  private async retrieveShortTerm(query: MemoryQuery): Promise<ShortTermMemory[]> {
    const database = this.db.getDatabase();
    let sql = 'SELECT * FROM short_term_memory WHERE session_id = ?';
    const params: any[] = [this.sessionId];

    if (query.timeRange) {
      sql += ' AND timestamp BETWEEN ? AND ?';
      params.push(query.timeRange.start, query.timeRange.end);
    }

    sql += ' ORDER BY timestamp DESC';

    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
    }

    const stmt = database.prepare(sql);
    return stmt.all(...params) as ShortTermMemory[];
  }

  private async retrieveWorking(query: MemoryQuery): Promise<WorkingMemory[]> {
    const database = this.db.getDatabase();
    let sql = 'SELECT * FROM working_memory WHERE 1=1';
    const params: any[] = [];

    if (query.phase) {
      sql += ' AND phase_name = ?';
      params.push(query.phase);
    }

    if (query.key) {
      sql += ' AND key = ?';
      params.push(query.key);
    }

    sql += ' ORDER BY importance DESC, created_at DESC';

    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
    }

    const stmt = database.prepare(sql);
    return stmt.all(...params) as WorkingMemory[];
  }

  private async retrieveLongTerm(query: MemoryQuery): Promise<LongTermMemory[]> {
    const database = this.db.getDatabase();
    let sql = 'SELECT * FROM long_term_memory WHERE archived = 0';
    const params: any[] = [];

    if (query.category) {
      sql += ' AND category = ?';
      params.push(query.category);
    }

    if (query.phase) {
      sql += ' AND phase_name = ?';
      params.push(query.phase);
    }

    if (query.key) {
      sql += ' AND key = ?';
      params.push(query.key);
    }

    sql += ' ORDER BY created_at DESC';

    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
    }

    const stmt = database.prepare(sql);
    return stmt.all(...params) as LongTermMemory[];
  }

  private async retrieveEpisodic(query: MemoryQuery): Promise<EpisodicMemory[]> {
    const database = this.db.getDatabase();
    let sql = 'SELECT * FROM episodic_memory WHERE 1=1';
    const params: any[] = [];

    if (query.category) {
      sql += ' AND decision_type = ?';
      params.push(query.category);
    }

    sql += ' ORDER BY timestamp DESC';

    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
    }

    const stmt = database.prepare(sql);
    return stmt.all(...params) as EpisodicMemory[];
  }
}

// Export types
export * from './types.js';
export { MemoryDatabase } from './database.js';
