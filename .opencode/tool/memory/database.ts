/**
 * Memory Database
 * 
 * SQLite database initialization and schema management
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export class MemoryDatabase {
  private db: Database.Database;
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    
    // Ensure .memory directory exists
    const memoryDir = join(projectPath, '.memory');
    if (!existsSync(memoryDir)) {
      mkdirSync(memoryDir, { recursive: true });
    }

    // Initialize database
    const dbPath = join(memoryDir, 'project-memory.db');
    this.db = new Database(dbPath);
    
    // Enable foreign keys and WAL mode for better concurrency
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('journal_mode = WAL');
    
    // Initialize schema
    this.initializeSchema();
  }

  private initializeSchema(): void {
    // Short-term memory (conversation)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS short_term_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        message_type TEXT CHECK(message_type IN ('user', 'assistant', 'system')),
        content TEXT,
        agent_name TEXT,
        metadata JSON
      );
      CREATE INDEX IF NOT EXISTS idx_short_term_session ON short_term_memory(session_id);
      CREATE INDEX IF NOT EXISTS idx_short_term_timestamp ON short_term_memory(timestamp);
    `);

    // Working memory (current phase)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS working_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phase_name TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        value_type TEXT CHECK(value_type IN ('string', 'json', 'file_path')),
        importance INTEGER DEFAULT 5 CHECK(importance BETWEEN 1 AND 10),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(phase_name, key)
      );
      CREATE INDEX IF NOT EXISTS idx_working_phase ON working_memory(phase_name);
      CREATE INDEX IF NOT EXISTS idx_working_importance ON working_memory(importance);
    `);

    // Long-term memory (project history)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS long_term_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL CHECK(category IN ('decision', 'output', 'validation', 'user_input', 'claim')),
        phase_name TEXT,
        key TEXT NOT NULL,
        value TEXT,
        source_agent TEXT,
        confidence_score REAL CHECK(confidence_score BETWEEN 0 AND 1),
        citations TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        archived BOOLEAN DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_long_term_category ON long_term_memory(category);
      CREATE INDEX IF NOT EXISTS idx_long_term_phase ON long_term_memory(phase_name);
      CREATE INDEX IF NOT EXISTS idx_long_term_archived ON long_term_memory(archived);
    `);

    // Episodic memory (decision history)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS episodic_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        decision_type TEXT NOT NULL,
        context TEXT,
        decision TEXT,
        rationale TEXT,
        outcome TEXT,
        user_approved BOOLEAN,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_episodic_type ON episodic_memory(decision_type);
      CREATE INDEX IF NOT EXISTS idx_episodic_timestamp ON episodic_memory(timestamp);
    `);

    // Todo list (persistent)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS todo_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phase_name TEXT NOT NULL,
        task_description TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'blocked')),
        priority INTEGER DEFAULT 5 CHECK(priority BETWEEN 1 AND 10),
        assigned_agent TEXT,
        dependencies TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        notes TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_todo_phase ON todo_list(phase_name);
      CREATE INDEX IF NOT EXISTS idx_todo_status ON todo_list(status);
      CREATE INDEX IF NOT EXISTS idx_todo_priority ON todo_list(priority);
    `);

    // Phase progress tracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS phase_progress (
        phase_name TEXT PRIMARY KEY,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
        started_at DATETIME,
        completed_at DATETIME,
        quality_gate_passed BOOLEAN DEFAULT 0,
        critique_report_path TEXT,
        notes TEXT
      );
    `);

    // Session checkpoints (for resumption)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS session_checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        checkpoint_type TEXT CHECK(checkpoint_type IN ('auto', 'manual', 'phase_boundary')),
        phase_name TEXT,
        full_state JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_checkpoint_type ON session_checkpoints(checkpoint_type);
      CREATE INDEX IF NOT EXISTS idx_checkpoint_created ON session_checkpoints(created_at);
    `);

    // Citation tracking (anti-hallucination)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS citation_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        citation_key TEXT UNIQUE NOT NULL,
        citation_type TEXT CHECK(citation_type IN ('doi', 'pmid', 'pmcid', 'url')),
        full_citation TEXT,
        bibtex TEXT,
        verified BOOLEAN DEFAULT 0,
        verification_date DATETIME,
        used_in_phases TEXT,
        metadata JSON
      );
      CREATE INDEX IF NOT EXISTS idx_citation_key ON citation_registry(citation_key);
      CREATE INDEX IF NOT EXISTS idx_citation_verified ON citation_registry(verified);
    `);
  }

  /**
   * Get the database instance
   */
  getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }

  /**
   * Execute a raw SQL query
   */
  exec(sql: string): void {
    this.db.exec(sql);
  }

  /**
   * Prepare a statement
   */
  prepare(sql: string): Database.Statement {
    return this.db.prepare(sql);
  }

  /**
   * Begin a transaction
   */
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  /**
   * Vacuum the database (optimize storage)
   */
  vacuum(): void {
    this.db.exec('VACUUM');
  }

  /**
   * Get database statistics
   */
  getStats(): {
    shortTermCount: number;
    workingMemoryCount: number;
    longTermCount: number;
    episodicCount: number;
    todoCount: number;
    checkpointCount: number;
    citationCount: number;
  } {
    const stats = {
      shortTermCount: this.db.prepare('SELECT COUNT(*) as count FROM short_term_memory').get() as { count: number },
      workingMemoryCount: this.db.prepare('SELECT COUNT(*) as count FROM working_memory').get() as { count: number },
      longTermCount: this.db.prepare('SELECT COUNT(*) as count FROM long_term_memory WHERE archived = 0').get() as { count: number },
      episodicCount: this.db.prepare('SELECT COUNT(*) as count FROM episodic_memory').get() as { count: number },
      todoCount: this.db.prepare('SELECT COUNT(*) as count FROM todo_list WHERE status != "completed"').get() as { count: number },
      checkpointCount: this.db.prepare('SELECT COUNT(*) as count FROM session_checkpoints').get() as { count: number },
      citationCount: this.db.prepare('SELECT COUNT(*) as count FROM citation_registry').get() as { count: number },
    };

    return {
      shortTermCount: stats.shortTermCount.count,
      workingMemoryCount: stats.workingMemoryCount.count,
      longTermCount: stats.longTermCount.count,
      episodicCount: stats.episodicCount.count,
      todoCount: stats.todoCount.count,
      checkpointCount: stats.checkpointCount.count,
      citationCount: stats.citationCount.count,
    };
  }
}
