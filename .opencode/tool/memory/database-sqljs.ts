/**
 * Memory Database (sql.js version - no native compilation required)
 * 
 * SQLite database initialization and schema management using sql.js
 */

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

export class MemoryDatabase {
  private db: SqlJsDatabase | null = null;
  private dbPath: string;
  private SQL: any;

  constructor(projectPath: string) {
    
    // Ensure .memory directory exists
    const memoryDir = join(projectPath, '.memory');
    if (!existsSync(memoryDir)) {
      mkdirSync(memoryDir, { recursive: true });
    }

    this.dbPath = join(memoryDir, 'project-memory.db');
  }

  /**
   * Initialize the database
   */
  async initialize(): Promise<void> {
    // Initialize sql.js
    this.SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (existsSync(this.dbPath)) {
      const buffer = readFileSync(this.dbPath);
      this.db = new this.SQL.Database(buffer);
    } else {
      this.db = new this.SQL.Database();
    }
    
    // Initialize schema
    this.initializeSchema();
    
    // Save to disk
    this.save();
  }

  private initializeSchema(): void {
    if (!this.db) throw new Error('Database not initialized');

    // Short-term memory (conversation)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS short_term_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        message_type TEXT CHECK(message_type IN ('user', 'assistant', 'system')),
        content TEXT,
        agent_name TEXT,
        metadata TEXT
      );
    `);
    this.db.run('CREATE INDEX IF NOT EXISTS idx_short_term_session ON short_term_memory(session_id);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_short_term_timestamp ON short_term_memory(timestamp);');

    // Working memory (current phase)
    this.db.run(`
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
    `);
    this.db.run('CREATE INDEX IF NOT EXISTS idx_working_phase ON working_memory(phase_name);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_working_importance ON working_memory(importance);');

    // Long-term memory (project history)
    this.db.run(`
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
        archived INTEGER DEFAULT 0
      );
    `);
    this.db.run('CREATE INDEX IF NOT EXISTS idx_long_term_category ON long_term_memory(category);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_long_term_phase ON long_term_memory(phase_name);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_long_term_archived ON long_term_memory(archived);');

    // Episodic memory (decision history)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS episodic_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        decision_type TEXT NOT NULL,
        context TEXT,
        decision TEXT,
        rationale TEXT,
        outcome TEXT,
        user_approved INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    this.db.run('CREATE INDEX IF NOT EXISTS idx_episodic_type ON episodic_memory(decision_type);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_episodic_timestamp ON episodic_memory(timestamp);');

    // Todo list (persistent)
    this.db.run(`
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
    `);
    this.db.run('CREATE INDEX IF NOT EXISTS idx_todo_phase ON todo_list(phase_name);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_todo_status ON todo_list(status);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_todo_priority ON todo_list(priority);');

    // Phase progress tracking
    this.db.run(`
      CREATE TABLE IF NOT EXISTS phase_progress (
        phase_name TEXT PRIMARY KEY,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
        started_at DATETIME,
        completed_at DATETIME,
        quality_gate_passed INTEGER DEFAULT 0,
        critique_report_path TEXT,
        notes TEXT
      );
    `);

    // Session checkpoints (for resumption)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS session_checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        checkpoint_type TEXT CHECK(checkpoint_type IN ('auto', 'manual', 'phase_boundary')),
        phase_name TEXT,
        full_state TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT
      );
    `);
    this.db.run('CREATE INDEX IF NOT EXISTS idx_checkpoint_type ON session_checkpoints(checkpoint_type);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_checkpoint_created ON session_checkpoints(created_at);');

    // Citation tracking (anti-hallucination)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS citation_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        citation_key TEXT UNIQUE NOT NULL,
        citation_type TEXT CHECK(citation_type IN ('doi', 'pmid', 'pmcid', 'url')),
        full_citation TEXT,
        bibtex TEXT,
        verified INTEGER DEFAULT 0,
        verification_date DATETIME,
        used_in_phases TEXT,
        metadata TEXT
      );
    `);
    this.db.run('CREATE INDEX IF NOT EXISTS idx_citation_key ON citation_registry(citation_key);');
    this.db.run('CREATE INDEX IF NOT EXISTS idx_citation_verified ON citation_registry(verified);');
  }

  /**
   * Save database to disk
   */
  save(): void {
    if (!this.db) throw new Error('Database not initialized');
    const data = this.db.export();
    const buffer = Buffer.from(data);
    writeFileSync(this.dbPath, buffer);
  }

  /**
   * Get the database instance
   */
  getDatabase(): SqlJsDatabase {
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');
    return this.db;
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.save(); // Save before closing
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Execute a raw SQL query
   */
  exec(sql: string): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run(sql);
    this.save();
  }

  /**
   * Run a query and return results
   */
  run(sql: string, params: any[] = []): { lastInsertRowid: number; changes: number } {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run(sql, params);
    this.save();
    
    // Get last insert rowid
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const lastInsertRowid = result[0]?.values[0]?.[0] as number || 0;
    
    return { lastInsertRowid, changes: 1 };
  }

  /**
   * Get single row
   */
  get(sql: string, params: any[] = []): any {
    if (!this.db) throw new Error('Database not initialized');
    const result = this.db.exec(sql, params);
    if (result.length === 0 || result[0].values.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    const row: any = {};
    
    columns.forEach((col, i) => {
      row[col] = values[i];
    });
    
    return row;
  }

  /**
   * Get all rows
   */
  all(sql: string, params: any[] = []): any[] {
    if (!this.db) throw new Error('Database not initialized');
    const result = this.db.exec(sql, params);
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const rows: any[] = [];
    
    result[0].values.forEach(values => {
      const row: any = {};
      columns.forEach((col, i) => {
        row[col] = values[i];
      });
      rows.push(row);
    });
    
    return rows;
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
    return {
      shortTermCount: this.get('SELECT COUNT(*) as count FROM short_term_memory')?.count || 0,
      workingMemoryCount: this.get('SELECT COUNT(*) as count FROM working_memory')?.count || 0,
      longTermCount: this.get('SELECT COUNT(*) as count FROM long_term_memory WHERE archived = 0')?.count || 0,
      episodicCount: this.get('SELECT COUNT(*) as count FROM episodic_memory')?.count || 0,
      todoCount: this.get('SELECT COUNT(*) as count FROM todo_list WHERE status != "completed"')?.count || 0,
      checkpointCount: this.get('SELECT COUNT(*) as count FROM session_checkpoints')?.count || 0,
      citationCount: this.get('SELECT COUNT(*) as count FROM citation_registry')?.count || 0,
    };
  }
}
