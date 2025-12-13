# 🏗️ MedResearch AI - Multi-Agent System Master Plan v4.0

**Version**: 4.0.0  
**Date**: December 3, 2025  
**Type**: OpenCode-Native Multi-Agent System with Memory & Anti-Hallucination  
**Status**: Ready for Implementation

---

## 🆕 **What's New in v4.0**

### **Major Additions**

1. ✅ **Memory System** - 4-tier architecture for session continuity
2. ✅ **Anti-Hallucination Framework** - 5-layer defense for medical accuracy
3. ✅ **Session Continuity Protocol** - Resume research across multiple days
4. ✅ **Citation-First Architecture** - Every claim must have source
5. ✅ **Quality Assurance Enhanced** - Automated fact-checking workflows

### **Why These Additions?**

**Problem**: Medical research requires:
- **Zero tolerance for fabricated citations** - Lives depend on accuracy
- **Multi-day research sessions** - Systematic reviews take weeks
- **Context preservation** - Can't lose progress between sessions
- **Audit trails** - Every decision must be traceable

**Solution**: Comprehensive memory and anti-hallucination infrastructure

---

## 📋 **Table of Contents**

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Memory System Design](#memory-system-design) ⭐ **NEW**
4. [Anti-Hallucination Framework](#anti-hallucination-framework) ⭐ **NEW**
5. [Session Continuity Protocol](#session-continuity-protocol) ⭐ **NEW**
6. [Agent Specifications](#agent-specifications)
7. [MCP Server Designs](#mcp-server-designs)
8. [Technology Stack](#technology-stack)
9. [Project Structure](#project-structure)
10. [Implementation Phases](#implementation-phases)
11. [Quality Assurance](#quality-assurance)
12. [Enhanced Session Prompt](#enhanced-session-prompt)

---

## 🎯 **Executive Summary**

### **Project Vision**

Create an **intelligent multi-agent system** powered by Claude (via OpenCode CLI) that automates the entire systematic review and meta-analysis workflow, with **enterprise-grade memory** and **medical-grade anti-hallucination measures**.

### **Key Objectives**

1. ✅ **Fully Automated Workflow** - From question to publication
2. ✅ **High Quality Output** - University-grade research
3. ✅ **Cost-Effective** - Uses Claude Pro subscription (no API costs)
4. ✅ **Session Continuity** - Resume research across days/weeks ⭐ **NEW**
5. ✅ **Zero Hallucinations** - Citation-first architecture ⭐ **NEW**
6. ✅ **Complete Audit Trail** - Every decision logged ⭐ **NEW**
7. ✅ **Organized** - Clean folder structure per research project
8. ✅ **Flexible** - Configurable for different universities
9. ✅ **Reliable** - Quality gates and validation at each step

### **Core Innovation**

**9-Agent Orchestrated System** with **4-Tier Memory** and **5-Layer Anti-Hallucination Defense**:

1. **Master Agent** - Orchestrator (you chat with this)
2. **Question Agent** - Research question refinement
3. **Planner Agent** - Research plan creation
4. **Protocol Agent** - PICO/SPIDER protocol generation
5. **Research Agent** - Database search & screening
6. **Writer Agent** - Manuscript writing
7. **Statistician Agent** - Data analysis & meta-analysis
8. **Bibliography Agent** - Citation management
9. **Critique Agent** - Quality assurance

**Plus**:
- **Memory System** - Never lose context
- **Anti-Hallucination** - Every claim verified
- **Session Continuity** - Resume anytime

---

## 🏗️ **System Architecture**

### **High-Level Architecture with Memory**

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Chat Interface)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    OPENCODE CLI                              │
│              (Claude Pro Integration)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    MASTER AGENT                              │
│  - Session Management                                        │
│  - Agent Orchestration                                       │
│  - Memory & Context ⭐ NEW                                   │
│  - Anti-Hallucination Enforcement ⭐ NEW                     │
│  - Project Organization                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  SPECIALIZED  │  │  SPECIALIZED  │  │  SPECIALIZED  │
│    AGENTS     │  │    AGENTS     │  │    AGENTS     │
│   (1-9)       │  │   (1-9)       │  │   (1-9)       │
└───────────────┘  └───────────────┘  └───────────────┘
        ↓                   ↓                   ↓
┌─────────────────────────────────────────────────────────────┐
│              MEMORY SYSTEM ⭐ NEW                            │
│  - Short-term Memory (current session)                       │
│  - Working Memory (active research phase)                    │
│  - Long-term Memory (entire project)                         │
│  - Episodic Memory (decision history)                        │
└─────────────────────────────────────────────────────────────┘
        ↓                   ↓                   ↓
┌─────────────────────────────────────────────────────────────┐
│         ANTI-HALLUCINATION LAYER ⭐ NEW                      │
│  - Citation Enforcement                                      │
│  - Fact Verification                                         │
│  - Confidence Scoring                                        │
│  - Contradiction Detection                                   │
│  - Human-in-the-Loop Gates                                   │
└─────────────────────────────────────────────────────────────┘
        ↓                   ↓                   ↓
┌─────────────────────────────────────────────────────────────┐
│                    MCP SERVERS (Tools)                       │
│  - Medical Databases                                         │
│  - R Statistics                                              │
│  - Citation Management                                       │
│  - Document Generation                                       │
│  - Unpaywall (PDF Finder)                                    │
└─────────────────────────────────────────────────────────────┘
        ↓                   ↓                   ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  - Project Folders                                           │
│  - SQLite Database (Memory Storage) ⭐ NEW                   │
│  - File Storage                                              │
│  - Audit Logs ⭐ NEW                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 **Memory System Design** ⭐ **NEW**

### **Why Memory Matters**

**Problem**: Systematic reviews take weeks/months. OpenCode sessions are ephemeral.

**Solution**: 4-tier persistent memory system that preserves:
- Research context and decisions
- Todo lists and phase progress
- Agent outputs and validations
- User preferences and approvals

### **4-Tier Memory Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 1: SHORT-TERM MEMORY                                   │
│  - Current conversation (last 10 messages)                   │
│  - Active task context                                       │
│  - Immediate decisions                                       │
│  - Lifespan: Current session only                            │
│  - Storage: In-memory (OpenCode native)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓ (Promote important items)
┌─────────────────────────────────────────────────────────────┐
│  TIER 2: WORKING MEMORY                                      │
│  - Current research phase context                            │
│  - Active agent outputs                                      │
│  - Phase-specific decisions                                  │
│  - Lifespan: Until phase completion                          │
│  - Storage: SQLite + JSON files                              │
└─────────────────────────────────────────────────────────────┘
                            ↓ (Compress and archive)
┌─────────────────────────────────────────────────────────────┐
│  TIER 3: LONG-TERM MEMORY                                    │
│  - Complete project history                                  │
│  - All phase outputs                                         │
│  - Quality gate results                                      │
│  - Lifespan: Entire project                                  │
│  - Storage: SQLite + File system                             │
└─────────────────────────────────────────────────────────────┘
                            ↓ (Extract patterns)
┌─────────────────────────────────────────────────────────────┐
│  TIER 4: EPISODIC MEMORY                                     │
│  - Decision rationales                                       │
│  - User preferences                                          │
│  - Lessons learned                                           │
│  - Lifespan: Across all projects                             │
│  - Storage: SQLite (global database)                         │
└─────────────────────────────────────────────────────────────┘
```

### **Memory Storage Schema**

**SQLite Database**: `research-projects/[project-slug]/.memory/project-memory.db`

```sql
-- Short-term memory (conversation)
CREATE TABLE short_term_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    message_type TEXT, -- 'user' | 'assistant' | 'system'
    content TEXT,
    agent_name TEXT,
    metadata JSON
);

-- Working memory (current phase)
CREATE TABLE working_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phase_name TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    value_type TEXT, -- 'string' | 'json' | 'file_path'
    importance INTEGER DEFAULT 5, -- 1-10 scale
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(phase_name, key)
);

-- Long-term memory (project history)
CREATE TABLE long_term_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL, -- 'decision' | 'output' | 'validation' | 'user_input'
    phase_name TEXT,
    key TEXT NOT NULL,
    value TEXT,
    source_agent TEXT,
    confidence_score REAL,
    citations TEXT, -- JSON array of sources
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT 0
);

-- Episodic memory (decision history)
CREATE TABLE episodic_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    decision_type TEXT NOT NULL,
    context TEXT,
    decision TEXT,
    rationale TEXT,
    outcome TEXT,
    user_approved BOOLEAN,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Todo list (persistent)
CREATE TABLE todo_list (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phase_name TEXT NOT NULL,
    task_description TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed' | 'blocked'
    priority INTEGER DEFAULT 5, -- 1-10
    assigned_agent TEXT,
    dependencies TEXT, -- JSON array of task IDs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    notes TEXT
);

-- Phase progress tracking
CREATE TABLE phase_progress (
    phase_name TEXT PRIMARY KEY,
    status TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed' | 'failed'
    started_at DATETIME,
    completed_at DATETIME,
    quality_gate_passed BOOLEAN DEFAULT 0,
    critique_report_path TEXT,
    notes TEXT
);

-- Session checkpoints (for resumption)
CREATE TABLE session_checkpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    checkpoint_type TEXT, -- 'auto' | 'manual' | 'phase_boundary'
    phase_name TEXT,
    full_state JSON, -- Complete serialized state
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Citation tracking (anti-hallucination)
CREATE TABLE citation_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citation_key TEXT UNIQUE NOT NULL, -- DOI, PMID, etc.
    citation_type TEXT, -- 'doi' | 'pmid' | 'pmcid' | 'url'
    full_citation TEXT,
    bibtex TEXT,
    verified BOOLEAN DEFAULT 0,
    verification_date DATETIME,
    used_in_phases TEXT, -- JSON array
    metadata JSON
);
```

### **Memory Operations**

**1. Save to Memory**
```typescript
interface MemorySaveOptions {
  tier: 'short' | 'working' | 'long' | 'episodic';
  category: string;
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

async function saveToMemory(options: MemorySaveOptions): Promise<void> {
  // Implementation saves to appropriate tier
}
```

**2. Retrieve from Memory**
```typescript
interface MemoryQuery {
  tier?: 'short' | 'working' | 'long' | 'episodic' | 'all';
  category?: string;
  key?: string;
  phase?: string;
  timeRange?: { start: Date; end: Date };
  limit?: number;
}

async function retrieveFromMemory(query: MemoryQuery): Promise<MemoryItem[]> {
  // Implementation retrieves from specified tier(s)
}
```

**3. Memory Compression**
```typescript
async function compressWorkingMemory(phaseName: string): Promise<void> {
  // When phase completes:
  // 1. Archive working memory to long-term
  // 2. Extract key decisions to episodic
  // 3. Clear working memory for next phase
}
```

### **Session Continuity Files**

**Location**: `research-projects/[project-slug]/.session/`

**1. Current State** (`current-state.json`)
```json
{
  "project_id": "uuid",
  "project_slug": "metformin-vs-sulfonylureas-t2dm",
  "current_phase": "analysis",
  "current_task": "Performing meta-analysis",
  "last_updated": "2025-12-03T14:30:00Z",
  "session_id": "ses_abc123",
  "active_agents": ["statistician-agent"],
  "pending_approvals": [],
  "context_summary": "Extracted data from 18 RCTs. Ready for meta-analysis.",
  "next_steps": [
    "Complete meta-analysis",
    "Generate forest plots",
    "Run heterogeneity tests"
  ]
}
```

**2. Resume Prompt** (`resume-prompt.md`)
```markdown
# Resume Research: Metformin vs Sulfonylureas in T2DM

## Project Context
- **Research Question**: What is the effectiveness of metformin compared to sulfonylureas in reducing HbA1c levels in adults with type 2 diabetes?
- **Current Phase**: Analysis (Phase 7 of 9)
- **Progress**: 75% complete

## What We've Done
✅ Phase 1: Question Refinement - COMPLETE
✅ Phase 2: Research Planning - COMPLETE
✅ Phase 3: Protocol Generation - COMPLETE
✅ Phase 4: Database Search - COMPLETE (1,250 citations found)
✅ Phase 5: Screening - COMPLETE (18 studies included)
✅ Phase 6: Data Extraction - COMPLETE (18 RCTs extracted)
🔄 Phase 7: Statistical Analysis - IN PROGRESS
⏳ Phase 8: Manuscript Writing - PENDING
⏳ Phase 9: Presentation - PENDING

## Current Task
Performing meta-analysis on 18 included RCTs:
- Primary outcome: HbA1c reduction
- Effect measure: Mean Difference (MD)
- Model: Random effects (expecting heterogeneity)

## Key Decisions Made
1. **Inclusion criteria**: RCTs only, adults 18+, minimum 12 weeks follow-up
2. **Databases searched**: PubMed (450), Europe PMC (380), Lens.org (320), OpenAlex (100)
3. **Quality assessment**: Risk of Bias 2.0 completed for all 18 studies
4. **Statistical approach**: Random-effects meta-analysis using R metafor package

## Files Generated
- Protocol: `00-protocol/protocol-v1.docx`
- Search results: `01-search/deduplicated-citations.bib`
- Screening: `02-screening/included-citations.csv`
- Extracted data: `03-data-extraction/extracted-data.csv`
- Quality assessment: `03-data-extraction/quality-assessment-rob2.csv`

## Next Steps
1. Run meta-analysis (R script ready)
2. Generate forest plot
3. Assess heterogeneity (I², τ², Q)
4. Test for publication bias
5. Proceed to manuscript writing

## Important Notes
- University: European University of Cyprus
- Citation style: Vancouver
- All quality gates passed so far
- User approved protocol on 2025-12-01

## Resume Command
Continue with statistical analysis using Statistician Agent.
```

**3. Todo List** (`todo-list.json`)
```json
{
  "project_id": "uuid",
  "last_updated": "2025-12-03T14:30:00Z",
  "todos": [
    {
      "id": "todo-001",
      "phase": "analysis",
      "task": "Run meta-analysis",
      "status": "in_progress",
      "priority": 10,
      "assigned_agent": "statistician-agent",
      "dependencies": [],
      "created_at": "2025-12-03T14:00:00Z",
      "notes": "Using random-effects model"
    },
    {
      "id": "todo-002",
      "phase": "analysis",
      "task": "Generate forest plot",
      "status": "pending",
      "priority": 9,
      "assigned_agent": "statistician-agent",
      "dependencies": ["todo-001"],
      "created_at": "2025-12-03T14:00:00Z"
    },
    {
      "id": "todo-003",
      "phase": "analysis",
      "task": "Assess heterogeneity",
      "status": "pending",
      "priority": 9,
      "assigned_agent": "statistician-agent",
      "dependencies": ["todo-001"],
      "created_at": "2025-12-03T14:00:00Z"
    },
    {
      "id": "todo-004",
      "phase": "manuscript",
      "task": "Write manuscript",
      "status": "pending",
      "priority": 8,
      "assigned_agent": "writer-agent",
      "dependencies": ["todo-001", "todo-002", "todo-003"],
      "created_at": "2025-12-03T14:00:00Z"
    }
  ]
}
```

---

## 🛡️ **Anti-Hallucination Framework** ⭐ **NEW**

### **Why Anti-Hallucination Matters**

**Medical Research Requirements**:
- ❌ **Zero tolerance for fabricated citations** - Can't cite studies that don't exist
- ❌ **Zero tolerance for false data** - Can't make up statistics
- ❌ **Zero tolerance for unsupported claims** - Every statement needs evidence

**Consequences of Hallucinations**:
- Research gets rejected
- University reputation damaged
- Potential harm to patients if false findings are used

### **5-Layer Anti-Hallucination Defense**

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: GROUNDING (Source-First Architecture)              │
│  - Every claim must cite source BEFORE being written         │
│  - RAG-based retrieval from verified databases               │
│  - No generation without grounding                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: FACT VERIFICATION (Automated Checking)             │
│  - Citation validation (DOI/PMID exists?)                    │
│  - Data consistency checks                                   │
│  - Cross-reference verification                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: PLAN VALIDATION (Think Before Acting)              │
│  - Agent must propose plan before execution                  │
│  - Plan must include sources                                 │
│  - User/Critique Agent approves plan                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: CONFIDENCE SCORING (Uncertainty Quantification)    │
│  - Every output has confidence score (0-1)                   │
│  - Low confidence triggers human review                      │
│  - Medical research threshold: 0.8 minimum                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5: HUMAN-IN-THE-LOOP (Final Safety Net)               │
│  - Critical decisions require user approval                  │
│  - Quality gates at each phase                               │
│  - Critique Agent validates everything                       │
└─────────────────────────────────────────────────────────────┘
```

### **Citation-First Architecture**

**Principle**: Never generate a claim without a source.

**Implementation**:

**1. Prompt Engineering** (All Agents)
```
CRITICAL ANTI-HALLUCINATION RULES:

1. CITATION REQUIREMENT:
   - Every factual claim MUST include [Source: DOI/PMID]
   - If you don't have a source, say "I don't have sufficient evidence"
   - NEVER make up citations
   - NEVER approximate or guess

2. UNCERTAINTY HANDLING:
   - If uncertain, say so explicitly
   - Provide confidence score (0-1)
   - Suggest how to verify

3. DATA ACCURACY:
   - Only use data from extracted files
   - Never estimate or round without stating so
   - Preserve exact values from sources

4. VERIFICATION:
   - Cross-check claims against multiple sources
   - Flag contradictions
   - Prefer systematic reviews over single studies

EXAMPLE GOOD OUTPUT:
"Metformin reduced HbA1c by 0.8% (95% CI: 0.6-1.0%) compared to sulfonylureas [Source: PMID:12345678]."

EXAMPLE BAD OUTPUT:
"Metformin is better than sulfonylureas." (No source, vague claim)
```

**2. Citation Validation**
```typescript
interface Citation {
  type: 'doi' | 'pmid' | 'pmcid' | 'url';
  identifier: string;
  verified: boolean;
  verificationDate?: Date;
  fullCitation?: string;
}

async function validateCitation(citation: Citation): Promise<boolean> {
  // 1. Check if identifier exists in our database
  const existsInDB = await checkCitationRegistry(citation.identifier);
  
  if (existsInDB) {
    return true;
  }
  
  // 2. Verify with external API
  let verified = false;
  
  if (citation.type === 'doi') {
    verified = await verifyDOI(citation.identifier);
  } else if (citation.type === 'pmid') {
    verified = await verifyPMID(citation.identifier);
  }
  
  // 3. Save to registry
  if (verified) {
    await saveToCitationRegistry(citation);
  }
  
  return verified;
}

async function verifyDOI(doi: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.crossref.org/works/${doi}`);
    return response.ok;
  } catch {
    return false;
  }
}

async function verifyPMID(pmid: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`
    );
    const data = await response.json();
    return data.result?.[pmid] !== undefined;
  } catch {
    return false;
  }
}
```

**3. Fabrication Detection**
```typescript
interface FabricationCheck {
  text: string;
  citations: Citation[];
  suspiciousPatterns: string[];
}

async function detectFabrication(check: FabricationCheck): Promise<{
  isSuspicious: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];
  
  // Pattern 1: Citation format looks fake
  for (const citation of check.citations) {
    if (citation.type === 'pmid' && !/^\d{7,8}$/.test(citation.identifier)) {
      reasons.push(`Suspicious PMID format: ${citation.identifier}`);
    }
    
    if (citation.type === 'doi' && !citation.identifier.startsWith('10.')) {
      reasons.push(`Suspicious DOI format: ${citation.identifier}`);
    }
  }
  
  // Pattern 2: Citation doesn't verify
  for (const citation of check.citations) {
    const verified = await validateCitation(citation);
    if (!verified) {
      reasons.push(`Citation not found: ${citation.identifier}`);
    }
  }
  
  // Pattern 3: Suspiciously round numbers
  const roundNumberPattern = /\b(exactly|precisely)\s+\d+\.0+\b/gi;
  if (roundNumberPattern.test(check.text)) {
    reasons.push('Suspiciously precise round numbers detected');
  }
  
  // Pattern 4: Vague citations
  const vagueCitationPattern = /\[Source:\s*(et al|various|multiple studies)\]/gi;
  if (vagueCitationPattern.test(check.text)) {
    reasons.push('Vague citation detected');
  }
  
  return {
    isSuspicious: reasons.length > 0,
    reasons
  };
}
```

### **Confidence Scoring**

**Formula**:
```typescript
interface ConfidenceFactors {
  sourceQuality: number; // 0-1 (systematic review=1, case report=0.3)
  citationVerified: boolean; // +0.2 if verified
  dataConsistency: number; // 0-1 (cross-checked with other sources)
  agentCertainty: number; // 0-1 (agent's self-assessment)
  userValidated: boolean; // +0.1 if user approved
}

function calculateConfidence(factors: ConfidenceFactors): number {
  let score = 0;
  
  // Base score from source quality (40% weight)
  score += factors.sourceQuality * 0.4;
  
  // Citation verification (20% weight)
  score += factors.citationVerified ? 0.2 : 0;
  
  // Data consistency (20% weight)
  score += factors.dataConsistency * 0.2;
  
  // Agent certainty (15% weight)
  score += factors.agentCertainty * 0.15;
  
  // User validation (5% weight)
  score += factors.userValidated ? 0.05 : 0;
  
  return Math.min(score, 1.0);
}

// Thresholds
const CONFIDENCE_THRESHOLDS = {
  medical_research: 0.8, // High bar for medical claims
  general_claim: 0.7,
  exploratory: 0.6
};

function shouldTriggerReview(confidence: number, context: string): boolean {
  if (context === 'medical_research') {
    return confidence < CONFIDENCE_THRESHOLDS.medical_research;
  }
  return confidence < CONFIDENCE_THRESHOLDS.general_claim;
}
```

### **Contradiction Detection**

```typescript
interface Claim {
  text: string;
  source: Citation;
  phase: string;
  agent: string;
  timestamp: Date;
}

async function detectContradictions(newClaim: Claim): Promise<{
  hasContradiction: boolean;
  contradictingClaims: Claim[];
}> {
  // 1. Retrieve similar claims from memory
  const similarClaims = await retrieveFromMemory({
    tier: 'long',
    category: 'claim',
    // Semantic similarity search would go here
  });
  
  // 2. Check for contradictions
  const contradictions: Claim[] = [];
  
  for (const existingClaim of similarClaims) {
    // Simple contradiction detection (would use NLP in production)
    if (isContradictory(newClaim.text, existingClaim.text)) {
      contradictions.push(existingClaim);
    }
  }
  
  return {
    hasContradiction: contradictions.length > 0,
    contradictingClaims: contradictions
  };
}

function isContradictory(claim1: string, claim2: string): boolean {
  // Simplified - would use semantic analysis in production
  const negationWords = ['not', 'no', 'never', 'opposite', 'contrary'];
  
  // Check if claims are about same topic but with negation
  // This is a placeholder - real implementation would use NLP
  return false;
}
```

### **Quality Gates with Anti-Hallucination**

**Every phase output must pass**:

```typescript
interface QualityGateCheck {
  phase: string;
  output: any;
  checks: {
    allClaimsCited: boolean;
    allCitationsVerified: boolean;
    noContradictions: boolean;
    confidenceAboveThreshold: boolean;
    userApproved: boolean;
  };
}

async function runQualityGate(phase: string, output: any): Promise<{
  passed: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  // Check 1: All claims have citations
  const claimsWithoutCitations = findUnciatedClaims(output);
  if (claimsWithoutCitations.length > 0) {
    issues.push(`${claimsWithoutCitations.length} claims without citations`);
  }
  
  // Check 2: All citations verify
  const citations = extractCitations(output);
  for (const citation of citations) {
    const verified = await validateCitation(citation);
    if (!verified) {
      issues.push(`Citation not verified: ${citation.identifier}`);
    }
  }
  
  // Check 3: No contradictions
  const claims = extractClaims(output);
  for (const claim of claims) {
    const { hasContradiction, contradictingClaims } = await detectContradictions(claim);
    if (hasContradiction) {
      issues.push(`Contradiction detected: "${claim.text}"`);
    }
  }
  
  // Check 4: Confidence above threshold
  const confidence = calculateOutputConfidence(output);
  if (confidence < CONFIDENCE_THRESHOLDS.medical_research) {
    issues.push(`Confidence too low: ${confidence.toFixed(2)} < 0.8`);
  }
  
  return {
    passed: issues.length === 0,
    issues
  };
}
```

---

## 🔄 **Session Continuity Protocol** ⭐ **NEW**

### **The Problem**

Systematic reviews take **weeks to months**:
- Week 1: Protocol development
- Week 2-3: Database searches
- Week 4-5: Screening (hundreds of citations)
- Week 6-7: Data extraction
- Week 8-9: Analysis
- Week 10-12: Writing

**OpenCode sessions are ephemeral** - context is lost when you close the session.

### **The Solution**

**Automatic checkpointing** + **Smart resumption** = **Seamless multi-day research**

### **Checkpoint System**

**Auto-save every 5 minutes** + **Manual checkpoints** + **Phase boundary checkpoints**

```typescript
interface Checkpoint {
  id: string;
  type: 'auto' | 'manual' | 'phase_boundary';
  timestamp: Date;
  phase: string;
  state: {
    projectMetadata: ProjectMetadata;
    currentPhase: string;
    currentTask: string;
    todoList: Todo[];
    phaseProgress: PhaseProgress[];
    recentDecisions: Decision[];
    activeAgents: string[];
    pendingApprovals: Approval[];
    contextSummary: string;
    nextSteps: string[];
  };
}

// Auto-save every 5 minutes
setInterval(async () => {
  await createCheckpoint('auto');
}, 5 * 60 * 1000);

// Manual checkpoint
async function createCheckpoint(type: 'auto' | 'manual' | 'phase_boundary'): Promise<void> {
  const checkpoint: Checkpoint = {
    id: generateCheckpointId(),
    type,
    timestamp: new Date(),
    phase: getCurrentPhase(),
    state: await captureFullState()
  };
  
  // Save to database
  await saveCheckpoint(checkpoint);
  
  // Generate resume prompt
  await generateResumePrompt(checkpoint);
  
  // Update current-state.json
  await updateCurrentState(checkpoint.state);
}
```

### **Resume Workflow**

**When starting a new session**:

```
1. User opens OpenCode
   ↓
2. Master Agent detects existing project
   ↓
3. Loads latest checkpoint
   ↓
4. Presents resume prompt to user
   ↓
5. User confirms or modifies
   ↓
6. Session resumes exactly where it left off
```

**Resume Prompt Template**:

```markdown
# 🔄 Resume Research Session

## Project: {project_title}

**Last Session**: {last_session_date}  
**Current Phase**: {current_phase} ({progress}% complete)  
**Time Since Last Session**: {time_elapsed}

---

## 📊 Quick Status

✅ **Completed Phases**: {completed_phases}
🔄 **Current Phase**: {current_phase}
⏳ **Remaining Phases**: {remaining_phases}

---

## 🎯 Where We Left Off

**Last Task**: {last_task}

**What We Were Doing**:
{context_summary}

**Files Generated**:
{list_of_files}

---

## 📋 Todo List

**In Progress**:
{in_progress_todos}

**Pending**:
{pending_todos}

**Blocked**:
{blocked_todos}

---

## 🔑 Key Decisions Made

{recent_decisions}

---

## 📁 Important Files

{important_files_list}

---

## ⏭️ Next Steps

{next_steps}

---

## ❓ Before We Continue

1. Do you want to continue where we left off?
2. Do you want to review any previous phase?
3. Do you want to modify the plan?

**Type 'continue' to resume, or ask me anything about the project.**
```

### **State Restoration**

```typescript
async function restoreSession(checkpointId: string): Promise<void> {
  // 1. Load checkpoint from database
  const checkpoint = await loadCheckpoint(checkpointId);
  
  // 2. Restore project metadata
  await restoreProjectMetadata(checkpoint.state.projectMetadata);
  
  // 3. Restore phase progress
  await restorePhaseProgress(checkpoint.state.phaseProgress);
  
  // 4. Restore todo list
  await restoreTodoList(checkpoint.state.todoList);
  
  // 5. Restore memory tiers
  await restoreMemory(checkpoint);
  
  // 6. Restore active agents
  await restoreActiveAgents(checkpoint.state.activeAgents);
  
  // 7. Load context into short-term memory
  await loadContextIntoMemory(checkpoint.state.contextSummary);
  
  // 8. Present resume prompt to user
  await presentResumePrompt(checkpoint);
}
```

### **Cross-Day Resumption Example**

**Day 1** (Friday, 5pm):
```
User: "I want to research diabetes treatments"
Master Agent: Creates project, runs through phases 1-3
User: "I need to stop for the weekend. Save progress."
Master Agent: Creates checkpoint, generates resume prompt
```

**Day 4** (Monday, 9am):
```
User: Opens OpenCode
Master Agent: "Welcome back! I found your diabetes research project.
              Last session: Friday at 5pm
              Current phase: Protocol Generation (completed)
              Next phase: Database Search
              
              Would you like to continue?"
User: "Yes, continue"
Master Agent: Restores full context, resumes with Database Search
```

---

## 🤖 **Agent Specifications** (Updated with Memory & Anti-Hallucination)

### **Master Agent** (Updated)

**New Responsibilities**:
- ✅ Memory management (save/retrieve/compress)
- ✅ Session checkpointing (auto + manual)
- ✅ Session resumption
- ✅ Anti-hallucination enforcement
- ✅ Citation registry management

**New Prompting**:
```
You are the Master Research Coordinator with MEMORY and ANTI-HALLUCINATION capabilities.

MEMORY MANAGEMENT:
- Save important decisions to long-term memory
- Create checkpoints at phase boundaries
- Generate resume prompts for session continuity
- Compress working memory when phases complete

ANTI-HALLUCINATION:
- Enforce citation-first architecture
- Validate all citations before accepting
- Run quality gates at each phase
- Reject outputs without proper sources

CURRENT SESSION:
- Project: {project_name}
- Phase: {current_phase}
- Last checkpoint: {last_checkpoint_time}
- Todo list: {active_todos}

MEMORY CONTEXT:
{relevant_memory_items}

USER REQUEST: {user_message}

INSTRUCTIONS:
1. Check if this is a new session (load checkpoint if needed)
2. Understand user intent
3. Delegate to appropriate agent
4. Enforce anti-hallucination rules
5. Save important outputs to memory
6. Create checkpoint if significant progress made
```

### **All Agents** (Anti-Hallucination Prompts)

**Added to every agent**:
```
CRITICAL ANTI-HALLUCINATION RULES:

1. CITATION REQUIREMENT:
   - Every factual claim MUST include [Source: DOI/PMID]
   - Format: "Claim text [Source: PMID:12345678]"
   - If no source available, say "I don't have sufficient evidence"
   - NEVER fabricate citations

2. UNCERTAINTY HANDLING:
   - If uncertain, explicitly state: "I'm uncertain about..."
   - Provide confidence score: [Confidence: 0.7]
   - Suggest verification steps

3. DATA ACCURACY:
   - Only use data from provided files
   - Never estimate without stating so
   - Preserve exact values from sources
   - Cross-check against multiple sources

4. VERIFICATION:
   - Cross-reference claims
   - Flag contradictions
   - Prefer systematic reviews over single studies

5. OUTPUT FORMAT:
   Every output must include:
   - Main content
   - Citations list
   - Confidence score
   - Verification status

EXAMPLE OUTPUT:
{
  "content": "Metformin reduced HbA1c by 0.8% (95% CI: 0.6-1.0%) compared to sulfonylureas [Source: PMID:12345678].",
  "citations": [
    {
      "type": "pmid",
      "identifier": "12345678",
      "verified": true
    }
  ],
  "confidence": 0.9,
  "verification_status": "all_citations_verified"
}
```

---

## 📁 **Project Structure** (Updated with Memory)

```
research-projects/
└── [project-slug]/
    ├── .memory/                          ⭐ NEW
    │   ├── project-memory.db             (SQLite database)
    │   └── checkpoints/
    │       ├── checkpoint-001.json
    │       ├── checkpoint-002.json
    │       └── latest.json
    │
    ├── .session/                         ⭐ NEW
    │   ├── current-state.json
    │   ├── resume-prompt.md
    │   ├── todo-list.json
    │   └── audit-log.jsonl
    │
    ├── 00-protocol/
    ├── 01-search/
    ├── 02-screening/
    ├── 03-data-extraction/
    ├── 04-analysis/
    ├── 05-manuscript/
    ├── 06-presentation/
    ├── 07-pdfs/
    ├── 08-quality-checks/
    │   ├── critique-reports/
    │   ├── anti-hallucination-reports/  ⭐ NEW
    │   │   ├── phase1-citations.json
    │   │   ├── phase2-citations.json
    │   │   └── ...
    │   └── confidence-scores/            ⭐ NEW
    │       ├── phase1-scores.json
    │       └── ...
    │
    ├── 09-submission/
    ├── project-metadata.json
    ├── research-log.md
    └── README.md
```

---

## 🚀 **Implementation Phases** (Updated)

### **Phase 1: Foundation + Memory (Week 1-2)** ⭐ UPDATED

**Objective**: Set up OpenCode agent system with memory infrastructure

**Tasks**:
1. ✅ Create `.opencode/` directory structure
2. ✅ Set up SQLite memory database
3. ✅ Implement 4-tier memory system
4. ✅ Create checkpoint system
5. ✅ Define all 9 agents (XML files)
6. ✅ Add anti-hallucination prompts to all agents
7. ✅ Create university profile system
8. ✅ Set up project template structure
9. ✅ Implement master agent orchestration
10. ✅ Test memory save/retrieve
11. ✅ Test session resumption

**Deliverables**:
- 9 agent XML files (with anti-hallucination prompts)
- Memory system (SQLite + TypeScript)
- Checkpoint system
- Resume prompt generator
- University profiles
- Project structure template

### **Phase 2: MCP Servers + Citation Validation (Week 3)** ⭐ UPDATED

**Objective**: Build all MCP servers with citation verification

**Tasks**:
1. ✅ Medical Databases MCP (with citation validation)
2. ✅ R Statistics MCP
3. ✅ Citation Management MCP (with verification)
4. ✅ Document Generation MCP
5. ✅ Unpaywall MCP
6. ✅ Citation validation service (DOI/PMID verification)
7. ✅ Fabrication detection service

**Deliverables**:
- 5 working MCP servers
- Citation validation service
- Fabrication detection
- Test suites

### **Phase 3-6**: (Same as v3.0, with memory integration)

---

## 📝 **Enhanced Session Prompt** ⭐ UPDATED

**Copy this to start a new session**:

```markdown
# MedResearch AI - Multi-Agent System with Memory & Anti-Hallucination

I'm building an intelligent multi-agent system for systematic reviews and meta-analyses, powered by Claude via OpenCode CLI, with **enterprise-grade memory** and **medical-grade anti-hallucination measures**.

---

## 📁 Project Location

```
C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI\
```

**CRITICAL FILES**:
1. `MEDRESEARCH-AI-MASTER-PLAN-V4.md` - Complete specifications (THIS FILE)
2. `.session/resume-prompt.md` - Resume existing research
3. `.memory/project-memory.db` - Memory database

---

## 🆕 What's New in v4.0

### **Memory System** ⭐
- **4-Tier Architecture**: Short-term, Working, Long-term, Episodic
- **Auto-checkpointing**: Every 5 minutes + phase boundaries
- **Session Resumption**: Continue research across days/weeks
- **Never lose context**: Full state preservation

### **Anti-Hallucination Framework** ⭐
- **Citation-First**: Every claim must have source [Source: PMID:xxx]
- **5-Layer Defense**: Grounding, Verification, Validation, Confidence, Human-in-Loop
- **Zero Tolerance**: Fabricated citations = instant rejection
- **Medical-Grade**: 0.8 confidence threshold (higher than general AI)

### **Session Continuity** ⭐
- **Resume Anytime**: Pick up exactly where you left off
- **Todo Persistence**: Never forget what's next
- **Phase Tracking**: Always know your progress
- **Audit Trail**: Every decision logged

---

## 🎯 System Overview

**9-Agent Architecture**:
1. Master Agent (orchestrator + memory manager)
2. Question Agent (research question refinement)
3. Planner Agent (research planning)
4. Protocol Agent (PICO/SPIDER protocol)
5. Research Agent (database search & screening)
6. Writer Agent (manuscript writing)
7. Statistician Agent (meta-analysis)
8. Bibliography Agent (citation management)
9. Critique Agent (quality assurance + anti-hallucination)

**5 MCP Servers**:
1. Medical Databases (PubMed, Europe PMC, Lens, OpenAlex)
2. R Statistics (meta-analysis, plots)
3. Citation Management (BibTeX, RIS, verification)
4. Document Generation (DOCX, PPTX)
5. Unpaywall (legal PDF access)

**Memory System**:
- Short-term (current session)
- Working (current phase)
- Long-term (entire project)
- Episodic (decision history)

**Anti-Hallucination**:
- Citation enforcement
- Fact verification
- Confidence scoring
- Contradiction detection
- Human-in-the-loop gates

---

## 🚀 Getting Started

### **New Research Project**
```
User: "I want to research diabetes treatments"
Master Agent: Creates project, initializes memory, starts Phase 1
```

### **Resume Existing Project**
```
User: "Continue my diabetes research"
Master Agent: Loads checkpoint, presents resume prompt, continues
```

---

## 📋 Key Requirements

- ✅ OpenCode-native (Claude Pro subscription, no API costs)
- ✅ Free databases only (PubMed, Europe PMC, Lens.org, OpenAlex)
- ✅ Local deployment (Windows)
- ✅ Memory persistence (SQLite)
- ✅ Session continuity (resume anytime)
- ✅ Anti-hallucination (citation-first, verification)
- ✅ PRISMA 2020 compliant
- ✅ University-configurable (European University of Cyprus primary)

---

## 🎯 Implementation Phases

### **Phase 1: Foundation + Memory (Week 1-2)** ← START HERE

**Objective**: Set up OpenCode agents with memory system

**Tasks**:
1. Create `.opencode/` directory structure
2. Set up SQLite memory database
3. Implement 4-tier memory system
4. Create checkpoint system
5. Define all 9 agents (XML files with anti-hallucination prompts)
6. Create university profile system
7. Set up project template structure
8. Test memory save/retrieve
9. Test session resumption

**Deliverables**:
- 9 agent XML files
- Memory system (SQLite + TypeScript)
- Checkpoint system
- Resume prompt generator
- University profiles
- Project structure template

---

## 🔑 Critical Success Factors

1. **Memory Works**: Can resume research after days/weeks
2. **Zero Hallucinations**: Every citation verified, no fabrications
3. **Quality Gates Pass**: PRISMA 2020 compliance, university guidelines
4. **User Experience**: Natural language, clear progress, helpful errors
5. **Reliability**: No data loss, stable, reproducible

---

## ❓ Questions Before Starting

1. Have you read the complete master plan (v4.0)?
2. Do you understand the 4-tier memory architecture?
3. Do you understand the anti-hallucination framework?
4. Do you understand session continuity?
5. Any clarifications needed?
6. Any suggestions for improvements?

---

## ✅ Ready to Start?

**Phase 1 Tasks**:
1. Create directory structure
2. Set up SQLite database
3. Implement memory system
4. Create checkpoint system
5. Define agents with anti-hallucination prompts
6. Test everything

**Let's build this systematically and professionally!** 🚀

---

**Project**: MedResearch AI Multi-Agent System  
**Version**: 4.0.0  
**Status**: Ready for Implementation  
**Timeline**: 7-8 weeks to completion  
**Current Phase**: Phase 1 - Foundation + Memory

---

**COPY THIS ENTIRE PROMPT TO START A NEW SESSION**
```

---

## 🎉 **Conclusion**

### **What We've Built**

**v4.0 adds critical infrastructure**:
1. ✅ **4-Tier Memory System** - Never lose context
2. ✅ **Anti-Hallucination Framework** - Medical-grade accuracy
3. ✅ **Session Continuity** - Resume research anytime
4. ✅ **Citation Verification** - Every source validated
5. ✅ **Audit Trail** - Complete decision history

### **Why This Matters**

**Medical research is different**:
- ❌ Can't afford hallucinations (lives at stake)
- ❌ Can't lose progress (weeks of work)
- ❌ Can't skip verification (reputation at stake)

**This system ensures**:
- ✅ Every claim has verified source
- ✅ Every session can be resumed
- ✅ Every decision is logged
- ✅ Every output is validated

### **Next Steps**

1. ✅ Review this master plan (v4.0)
2. ✅ Ask any questions
3. ✅ Use the enhanced session prompt
4. ✅ Start implementation Phase 1

**Estimated Timeline**: 7-8 weeks to full deployment

**Status**: ✅ **READY FOR IMPLEMENTATION**

---

**Created**: December 3, 2025  
**Version**: 4.0.0  
**Author**: AI Assistant  
**License**: MIT

---

## 📚 **Appendix: Research Sources**

This plan incorporates best practices from:

1. **Elicit.org** - AI research assistant (99.4% extraction accuracy)
2. **Scite.ai** - Smart Citations (1.5B+ classifications)
3. **OpenAgents v2.0.0** - Existing memory system
4. **AutoGen** - Multi-agent memory patterns
5. **LangGraph** - State management
6. **Medical AI Standards** - PRISMA, Cochrane, RoB 2.0, GRADE
7. **Anti-Hallucination Research** - RAG, grounding, verification

---

**END OF MASTER PLAN v4.0**
