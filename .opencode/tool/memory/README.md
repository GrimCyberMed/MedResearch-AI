# Memory System Tool

**4-Tier Memory Architecture for MedResearch AI**

---

## Overview

The Memory System provides persistent storage and retrieval across research sessions, enabling:
- **Session Continuity**: Resume research after days/weeks
- **Context Preservation**: Never lose important decisions or progress
- **Audit Trail**: Complete history of all research activities
- **Anti-Hallucination**: Citation tracking and verification

---

## Architecture

### 4-Tier Memory

```
┌─────────────────────────────────────┐
│  TIER 1: SHORT-TERM MEMORY          │
│  - Current conversation             │
│  - Last 10 messages                 │
│  - Lifespan: Current session        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  TIER 2: WORKING MEMORY             │
│  - Current phase context            │
│  - Active agent outputs             │
│  - Lifespan: Until phase completion │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  TIER 3: LONG-TERM MEMORY           │
│  - Complete project history         │
│  - All phase outputs                │
│  - Lifespan: Entire project         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  TIER 4: EPISODIC MEMORY            │
│  - Decision rationales              │
│  - User preferences                 │
│  - Lifespan: Across all projects    │
└─────────────────────────────────────┘
```

---

## Files

- **`types.ts`** - TypeScript interfaces for all memory types
- **`database.ts`** - SQLite database initialization and schema
- **`index.ts`** - Main memory operations (save/retrieve/compress)
- **`checkpoint.ts`** - Checkpoint and resume system
- **`README.md`** - This file

---

## Usage

### Initialize Memory System

```typescript
import { MemorySystem } from './memory/index.js';

const memory = new MemorySystem(
  '/path/to/project',
  'session-id-123'
);
```

### Save to Memory

```typescript
// Save to short-term memory (conversation)
await memory.save({
  tier: 'short',
  key: 'user_message',
  value: 'What is the effectiveness of metformin?',
  metadata: { agent: 'user' }
});

// Save to working memory (current phase)
await memory.save({
  tier: 'working',
  key: 'search_results',
  value: { count: 1250, databases: ['PubMed', 'Europe PMC'] },
  metadata: { phase: 'search', importance: 8 }
});

// Save to long-term memory (project history)
await memory.save({
  tier: 'long',
  category: 'output',
  key: 'protocol_generated',
  value: '/path/to/protocol.docx',
  metadata: {
    phase: 'protocol',
    agent: 'protocol-agent',
    confidence: 0.95,
    citations: ['PMID:12345678']
  }
});
```

### Retrieve from Memory

```typescript
// Get recent conversation
const recentMessages = await memory.retrieve({
  tier: 'short',
  limit: 10
});

// Get current phase context
const phaseContext = await memory.retrieve({
  tier: 'working',
  phase: 'search'
});

// Get all decisions
const decisions = await memory.retrieve({
  tier: 'episodic',
  category: 'protocol_approval'
});
```

### Compress Working Memory

```typescript
// When phase completes, archive to long-term
await memory.compressWorkingMemory('search');
```

### Save Decision

```typescript
await memory.saveDecision({
  decision_type: 'protocol_approval',
  context: 'User reviewed PICO protocol',
  decision: 'Approved with minor modifications',
  rationale: 'Inclusion criteria too broad',
  user_approved: true
});
```

### Manage Todos

```typescript
// Create todo
const todoId = await memory.saveTodo({
  phase_name: 'search',
  task_description: 'Search PubMed database',
  status: 'pending',
  priority: 10,
  assigned_agent: 'search-agent'
});

// Update status
await memory.updateTodoStatus(todoId, 'in_progress');

// Get all todos
const todos = await memory.getTodos('search');
```

### Track Phase Progress

```typescript
await memory.savePhaseProgress({
  phase_name: 'search',
  status: 'in_progress',
  started_at: new Date(),
  quality_gate_passed: false
});
```

### Citation Tracking

```typescript
await memory.saveCitation({
  citation_key: 'PMID:12345678',
  citation_type: 'pmid',
  full_citation: 'Smith J, et al. Diabetes Care. 2023;46(1):123-130.',
  verified: true,
  verification_date: new Date(),
  used_in_phases: JSON.stringify(['search', 'screening'])
});

const citation = await memory.getCitation('PMID:12345678');
```

---

## Checkpoint System

### Create Checkpoint

```typescript
import { CheckpointSystem } from './memory/checkpoint.js';

const checkpoint = new CheckpointSystem(memory, '/path/to/project');

const state = {
  projectMetadata: { /* ... */ },
  currentPhase: 'search',
  currentTask: 'Searching PubMed',
  todoList: await memory.getTodos(),
  phaseProgress: await memory.getPhaseProgress(),
  recentDecisions: [],
  activeAgents: ['search-agent'],
  pendingApprovals: [],
  contextSummary: 'Searching 4 databases for diabetes studies',
  nextSteps: ['Complete search', 'Deduplicate results']
};

const checkpointId = await checkpoint.createCheckpoint('manual', state, 'Before lunch break');
```

### Auto-Save

```typescript
// Start auto-save (every 5 minutes)
checkpoint.startAutoSave(() => getCurrentState());

// Stop auto-save
checkpoint.stopAutoSave();
```

### Load Checkpoint

```typescript
// Load latest
const latest = await checkpoint.loadLatestCheckpoint();

// Load specific
const state = await checkpoint.loadCheckpoint(checkpointId);
```

### Cleanup Old Checkpoints

```typescript
// Keep last 10 checkpoints
const deleted = await checkpoint.cleanupOldCheckpoints(10);
console.log(`Deleted ${deleted} old checkpoints`);
```

---

## Database Schema

### Tables

1. **short_term_memory** - Conversation history
2. **working_memory** - Current phase context
3. **long_term_memory** - Project history
4. **episodic_memory** - Decision history
5. **todo_list** - Persistent task list
6. **phase_progress** - Phase tracking
7. **session_checkpoints** - Checkpoint storage
8. **citation_registry** - Citation tracking

### Storage Location

```
research-projects/[project-slug]/
├── .memory/
│   ├── project-memory.db        # SQLite database
│   └── checkpoints/
│       ├── checkpoint-1.json
│       ├── checkpoint-2.json
│       └── latest.json
└── .session/
    ├── current-state.json       # Current state
    ├── resume-prompt.md         # Resume prompt
    └── todo-list.json           # Todo list
```

---

## Statistics

```typescript
const stats = memory.getStats();
console.log(stats);
// {
//   shortTermCount: 45,
//   workingMemoryCount: 12,
//   longTermCount: 156,
//   episodicCount: 23,
//   todoCount: 8,
//   checkpointCount: 15,
//   citationCount: 234
// }
```

---

## Best Practices

1. **Save Important Decisions** - Always save to episodic memory
2. **Compress Regularly** - Compress working memory when phases complete
3. **Checkpoint at Boundaries** - Create checkpoints at phase transitions
4. **Clean Up** - Periodically clean old checkpoints
5. **Verify Citations** - Always verify citations before saving

---

## Anti-Hallucination Integration

The memory system integrates with anti-hallucination measures:

- **Citation Tracking**: All citations stored and verified
- **Confidence Scoring**: Every output has confidence score
- **Audit Trail**: Complete history of all claims
- **Source Verification**: Citations validated against PubMed/CrossRef

---

## Error Handling

```typescript
try {
  await memory.save({ /* ... */ });
} catch (error) {
  console.error('Failed to save to memory:', error);
  // Handle error (retry, log, notify user)
}
```

---

## Performance

- **SQLite WAL Mode**: Better concurrency
- **Indexed Queries**: Fast retrieval
- **Lazy Loading**: Only load what's needed
- **Compression**: Archive old data

---

## Testing

```bash
# Run memory system tests
npm run test:memory
```

---

**Version**: 4.0.0  
**Status**: ✅ Implemented  
**Last Updated**: December 3, 2025
