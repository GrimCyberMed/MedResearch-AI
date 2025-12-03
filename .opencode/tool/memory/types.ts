/**
 * Memory System Types
 * 
 * Defines all TypeScript interfaces for the 4-tier memory architecture
 */

export type MemoryTier = 'short' | 'working' | 'long' | 'episodic';
export type MessageType = 'user' | 'assistant' | 'system';
export type ValueType = 'string' | 'json' | 'file_path';
export type Category = 'decision' | 'output' | 'validation' | 'user_input' | 'claim';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type CheckpointType = 'auto' | 'manual' | 'phase_boundary';
export type CitationType = 'doi' | 'pmid' | 'pmcid' | 'url';

// Short-term memory (conversation)
export interface ShortTermMemory {
  id?: number;
  session_id: string;
  timestamp?: Date;
  message_type: MessageType;
  content: string;
  agent_name?: string;
  metadata?: string; // JSON string
}

// Working memory (current phase)
export interface WorkingMemory {
  id?: number;
  phase_name: string;
  key: string;
  value: string;
  value_type: ValueType;
  importance?: number; // 1-10 scale
  created_at?: Date;
  updated_at?: Date;
}

// Long-term memory (project history)
export interface LongTermMemory {
  id?: number;
  category: Category;
  phase_name?: string;
  key: string;
  value: string;
  source_agent?: string;
  confidence_score?: number;
  citations?: string; // JSON array of sources
  created_at?: Date;
  archived?: boolean;
}

// Episodic memory (decision history)
export interface EpisodicMemory {
  id?: number;
  decision_type: string;
  context: string;
  decision: string;
  rationale: string;
  outcome?: string;
  user_approved?: boolean;
  timestamp?: Date;
}

// Todo list (persistent)
export interface Todo {
  id?: number;
  phase_name: string;
  task_description: string;
  status: TaskStatus;
  priority?: number; // 1-10
  assigned_agent?: string;
  dependencies?: string; // JSON array of task IDs
  created_at?: Date;
  completed_at?: Date;
  notes?: string;
}

// Phase progress tracking
export interface PhaseProgress {
  phase_name: string;
  status: PhaseStatus;
  started_at?: Date;
  completed_at?: Date;
  quality_gate_passed?: boolean;
  critique_report_path?: string;
  notes?: string;
}

// Session checkpoints (for resumption)
export interface SessionCheckpoint {
  id?: number;
  checkpoint_type: CheckpointType;
  phase_name?: string;
  full_state: string; // JSON serialized state
  created_at?: Date;
  description?: string;
}

// Citation tracking (anti-hallucination)
export interface Citation {
  id?: number;
  citation_key: string; // DOI, PMID, etc.
  citation_type: CitationType;
  full_citation?: string;
  bibtex?: string;
  verified?: boolean;
  verification_date?: Date;
  used_in_phases?: string; // JSON array
  metadata?: string; // JSON
}

// Memory save options
export interface MemorySaveOptions {
  tier: MemoryTier;
  category?: string;
  key: string;
  value: any;
  metadata?: {
    agent?: string;
    phase?: string;
    importance?: number; // 1-10
    citations?: string[]; // DOIs/PMIDs
    confidence?: number; // 0-1
  };
}

// Memory query options
export interface MemoryQuery {
  tier?: MemoryTier | 'all';
  category?: string;
  key?: string;
  phase?: string;
  timeRange?: { start: Date; end: Date };
  limit?: number;
}

// Memory item (generic return type)
export interface MemoryItem {
  tier: MemoryTier;
  data: ShortTermMemory | WorkingMemory | LongTermMemory | EpisodicMemory;
}

// Project metadata
export interface ProjectMetadata {
  project_id: string;
  project_slug: string;
  project_title: string;
  research_question: string;
  university: string;
  created_at: Date;
  last_updated: Date;
  current_phase: string;
  status: string;
}

// Current state (for resumption)
export interface CurrentState {
  project_id: string;
  project_slug: string;
  current_phase: string;
  current_task: string;
  last_updated: string;
  session_id: string;
  active_agents: string[];
  pending_approvals: any[];
  context_summary: string;
  next_steps: string[];
}

// Full checkpoint state
export interface CheckpointState {
  projectMetadata: ProjectMetadata;
  currentPhase: string;
  currentTask: string;
  todoList: Todo[];
  phaseProgress: PhaseProgress[];
  recentDecisions: EpisodicMemory[];
  activeAgents: string[];
  pendingApprovals: any[];
  contextSummary: string;
  nextSteps: string[];
}
