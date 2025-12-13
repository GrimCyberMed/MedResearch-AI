# 🚀 Enhanced Session Prompt v4.0 - MedResearch AI Multi-Agent System

**COPY THIS ENTIRE PROMPT TO START A NEW SESSION WITHOUT LOSING CONTEXT**

---

# MedResearch AI - Multi-Agent System Implementation (v4.0)

I'm building an **intelligent multi-agent system** for systematic reviews and meta-analyses, powered by **Claude via OpenCode CLI**, with **enterprise-grade memory** and **medical-grade anti-hallucination measures**.

---

## 📁 **Project Location**

```
C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI\
```

---

## 📚 **CRITICAL: Read These Files First**

1. **`MEDRESEARCH-AI-MASTER-PLAN-V4.md`** - Complete specifications (200+ pages)
   - System architecture
   - Memory system design
   - Anti-hallucination framework
   - All agent specifications
   - Implementation phases

2. **`.session/resume-prompt.md`** - If resuming existing research
   - Project context
   - Current phase
   - Todo list
   - Next steps

3. **`.session/current-state.json`** - Current project state
   - Phase progress
   - Active tasks
   - Pending approvals

---

## 🆕 **What's New in v4.0**

### **1. Memory System** ⭐

**4-Tier Architecture**:
- **Short-term**: Current conversation (last 10 messages)
- **Working**: Current phase context
- **Long-term**: Complete project history
- **Episodic**: Decision history across all projects

**Storage**: SQLite database at `.memory/project-memory.db`

**Benefits**:
- ✅ Never lose context
- ✅ Resume research after days/weeks
- ✅ Full audit trail
- ✅ Decision history preserved

### **2. Anti-Hallucination Framework** ⭐

**5-Layer Defense**:
1. **Grounding**: Source-first architecture (RAG-based)
2. **Fact Verification**: Citation validation (DOI/PMID)
3. **Plan Validation**: Think before acting
4. **Confidence Scoring**: 0.8 threshold for medical research
5. **Human-in-the-Loop**: Quality gates at each phase

**Citation-First Architecture**:
- Every claim MUST include `[Source: PMID:xxx]`
- No generation without grounding
- Fabricated citations = instant rejection
- All citations verified against PubMed/CrossRef

**Benefits**:
- ✅ Zero fabricated citations
- ✅ Medical-grade accuracy
- ✅ Complete source traceability
- ✅ Confidence scoring on all outputs

### **3. Session Continuity** ⭐

**Auto-Checkpointing**:
- Every 5 minutes (auto)
- At phase boundaries (automatic)
- On user request (manual)

**Resume Workflow**:
```
1. Open OpenCode
2. Master Agent detects existing project
3. Loads latest checkpoint
4. Presents resume prompt
5. User confirms
6. Session resumes exactly where it left off
```

**Benefits**:
- ✅ Resume research anytime
- ✅ Never lose progress
- ✅ Todo list persists
- ✅ Phase tracking preserved

---

## 🎯 **Project Vision**

Create a **9-agent orchestrated system** that automates the entire systematic review workflow:

```
User: "I want to research diabetes treatments"
    ↓
Master Agent → Question Agent → Planner Agent → Protocol Agent →
Research Agent → Statistician Agent → Writer Agent → Bibliography Agent
    ↓ (Critique Agent validates each step)
    ↓ (Memory System preserves all context)
    ↓ (Anti-Hallucination ensures accuracy)
Final Output: Publication-ready manuscript + presentation
```

---

## 🤖 **System Architecture**

### **9 Specialized Agents**

1. **Master Agent** (Orchestrator + Memory Manager)
   - Chat interface
   - Agent delegation
   - Memory management (save/retrieve/compress)
   - Session checkpointing
   - Anti-hallucination enforcement
   - Project organization

2. **Question Agent** (Research Question Specialist)
   - Refines vague ideas into precise questions
   - Generates PICO framework
   - Creates research title
   - **Anti-hallucination**: Cites similar research

3. **Planner Agent** (Research Strategist)
   - Creates research plan
   - Sets inclusion/exclusion criteria
   - Defines timeline
   - **Anti-hallucination**: Evidence-based planning

4. **Protocol Agent** (Protocol Specialist)
   - Generates formal PICO/SPIDER protocol
   - University-compliant formatting
   - PROSPERO-ready
   - **Anti-hallucination**: Template-based, no fabrication

5. **Research Agent** (Database Search & Screening)
   - Searches free databases (PubMed, Europe PMC, Lens, OpenAlex)
   - Screens citations (title/abstract/full-text)
   - Extracts data
   - **Sub-agents**: Search, Screening, Extraction
   - **Anti-hallucination**: Only real citations, verified DOIs/PMIDs

6. **Writer Agent** (Medical Writing Specialist)
   - Writes publication-quality manuscript
   - Follows university guidelines
   - 3rd person, academic tone
   - Integrates citations
   - **Anti-hallucination**: Every claim cited, no unsupported statements

7. **Statistician Agent** (Data Analysis Specialist)
   - Performs meta-analysis (R integration)
   - Generates forest plots
   - Assesses heterogeneity
   - Tests publication bias
   - **Anti-hallucination**: Only uses extracted data, no estimation

8. **Bibliography Agent** (Citation Management)
   - Manages all citations
   - Formats references (APA, Vancouver, Harvard, etc.)
   - Exports to BibTeX/RIS (Mendeley-compatible)
   - **Anti-hallucination**: Verifies all citations exist

9. **Critique Agent** (Quality Assurance + Anti-Hallucination)
   - Validates each phase
   - PRISMA 2020 compliance
   - Citation verification
   - Confidence scoring
   - Contradiction detection
   - Quality gates

### **5 MCP Servers (Tools)**

1. **Medical Databases MCP**
   - PubMed, Europe PMC, Lens.org, Semantic Scholar, OpenAlex
   - Citation deduplication
   - **Citation verification** (DOI/PMID validation)

2. **R Statistics MCP**
   - Meta-analysis (random/fixed effects)
   - Forest plots, funnel plots
   - Heterogeneity tests
   - Publication bias tests

3. **Citation Management MCP**
   - BibTeX/RIS export
   - Citation formatting
   - Bibliography generation
   - **Citation verification service**

4. **Document Generation MCP**
   - DOCX generation (manuscript)
   - PPTX generation (presentation)
   - Template rendering

5. **Unpaywall MCP**
   - Legal PDF finding
   - Open access detection

### **Memory System**

**4-Tier Architecture**:

```
┌─────────────────────────────────────────┐
│  TIER 1: SHORT-TERM MEMORY              │
│  - Current conversation                 │
│  - Active task context                  │
│  - Lifespan: Current session            │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  TIER 2: WORKING MEMORY                 │
│  - Current phase context                │
│  - Active agent outputs                 │
│  - Lifespan: Until phase completion     │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  TIER 3: LONG-TERM MEMORY               │
│  - Complete project history             │
│  - All phase outputs                    │
│  - Lifespan: Entire project             │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  TIER 4: EPISODIC MEMORY                │
│  - Decision rationales                  │
│  - User preferences                     │
│  - Lifespan: Across all projects        │
└─────────────────────────────────────────┘
```

**Storage**: SQLite database + JSON files

### **Anti-Hallucination Framework**

**5-Layer Defense**:

```
┌─────────────────────────────────────────┐
│  LAYER 1: GROUNDING                     │
│  - Source-first architecture            │
│  - RAG-based retrieval                  │
│  - No generation without grounding      │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  LAYER 2: FACT VERIFICATION             │
│  - Citation validation (DOI/PMID)       │
│  - Data consistency checks              │
│  - Cross-reference verification         │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  LAYER 3: PLAN VALIDATION               │
│  - Propose plan before execution        │
│  - Plan must include sources            │
│  - User/Critique Agent approves         │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  LAYER 4: CONFIDENCE SCORING            │
│  - Every output has score (0-1)         │
│  - Medical threshold: 0.8 minimum       │
│  - Low confidence = human review        │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  LAYER 5: HUMAN-IN-THE-LOOP             │
│  - Critical decisions need approval     │
│  - Quality gates at each phase          │
│  - Critique Agent validates all         │
└─────────────────────────────────────────┘
```

---

## 📋 **Key Requirements**

### **Must-Have Features**

- ✅ **OpenCode-native** - Uses Claude Pro subscription (no API costs)
- ✅ **Free databases only** - PubMed, Europe PMC, Lens.org, OpenAlex
- ✅ **Local deployment** - Windows, runs locally
- ✅ **Memory persistence** - SQLite database, never lose context
- ✅ **Session continuity** - Resume research after days/weeks
- ✅ **Anti-hallucination** - Citation-first, verification, confidence scoring
- ✅ **University-configurable** - European University of Cyprus (primary)
- ✅ **PRISMA 2020 compliant** - All 27 checklist items
- ✅ **Quality gates** - Validation at each phase
- ✅ **Organized folders** - Clean project structure
- ✅ **Export formats** - DOCX (manuscript), PPTX (presentation)
- ✅ **Audit trail** - Every decision logged

### **Technical Constraints**

- ❌ **No API costs** - Use Claude Pro via OpenCode only
- ❌ **No paid databases** - Scopus/Elsevier not accessible
- ❌ **No Sci-Hub** - Use Unpaywall (legal alternative)
- ✅ **Free R** - Instead of SPSS
- ✅ **BibTeX/RIS export** - Instead of Mendeley API
- ✅ **SQLite** - Lightweight, portable, no server

---

## 📁 **Project Structure**

```
.opencode/
├── agents/
│   ├── master-agent.xml (with memory management)
│   ├── question-agent.xml (with anti-hallucination)
│   ├── planner-agent.xml (with anti-hallucination)
│   ├── protocol-agent.xml (with anti-hallucination)
│   ├── research-agent.xml (with anti-hallucination)
│   ├── writer-agent.xml (with anti-hallucination)
│   ├── statistician-agent.xml (with anti-hallucination)
│   ├── bibliography-agent.xml (with anti-hallucination)
│   └── critique-agent.xml (with anti-hallucination + verification)
│
├── subagents/
│   ├── search-subagent.xml
│   ├── screening-subagent.xml
│   └── extraction-subagent.xml
│
├── context/
│   ├── domain/
│   │   ├── systematic-reviews.md
│   │   ├── meta-analysis.md
│   │   ├── prisma-guidelines.md
│   │   └── anti-hallucination-rules.md ⭐ NEW
│   ├── processes/
│   │   ├── research-workflow.md
│   │   ├── quality-gates.md
│   │   ├── memory-management.md ⭐ NEW
│   │   └── session-continuity.md ⭐ NEW
│   └── templates/
│       ├── protocol-template.md
│       ├── manuscript-template.md
│       └── resume-prompt-template.md ⭐ NEW
│
├── university-profiles/
│   ├── european-university-cyprus.json
│   └── custom-template.json
│
└── mcp-servers/
    ├── medical-databases/
    ├── r-statistics/
    ├── citation-management/
    ├── document-generation/
    └── unpaywall/

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
    │   └── confidence-scores/            ⭐ NEW
    ├── 09-submission/
    ├── project-metadata.json
    ├── research-log.md
    └── README.md
```

---

## 🔄 **Complete Workflow**

```
1. User: "I want to research diabetes treatments"
   ↓
2. Master Agent: Creates project folder, initializes memory
   ↓
3. Question Agent: Refines to PICO question
   ↓ Critique Agent validates (anti-hallucination check)
   ↓ Save to memory (working + long-term)
   ↓ Checkpoint created
4. Planner Agent: Creates research plan
   ↓ Critique Agent validates
   ↓ Save to memory
   ↓ Checkpoint created
5. Protocol Agent: Generates formal protocol (DOCX)
   ↓ Critique Agent validates
   ↓ Save to memory
   ↓ Checkpoint created
6. USER APPROVAL: Reviews protocol
   ↓ Decision saved to episodic memory
7. Research Agent → Search Sub-Agent: Searches databases
   ↓ Citation verification (all DOIs/PMIDs validated)
   ↓ Critique Agent validates
   ↓ Save to memory
   ↓ Checkpoint created
8. Research Agent → Screening Sub-Agent: Screens citations
   ↓ Critique Agent validates
   ↓ Save to memory
   ↓ Checkpoint created
9. Research Agent → Extraction Sub-Agent: Extracts data
   ↓ Critique Agent validates
   ↓ Save to memory
   ↓ Checkpoint created
10. Statistician Agent: Performs meta-analysis (R)
    ↓ Confidence scoring on all results
    ↓ Critique Agent validates
    ↓ Save to memory
    ↓ Checkpoint created
11. Writer Agent: Writes manuscript (DOCX)
    ↓ Every claim cited [Source: PMID:xxx]
    ↓ Bibliography Agent formats references
    ↓ All citations verified
    ↓ Critique Agent validates
    ↓ Save to memory
    ↓ Checkpoint created
12. Writer Agent: Creates presentation (PPTX)
    ↓ Checkpoint created
13. Final Review: All quality gates passed
    ↓ Compress working memory to long-term
    ↓ Final checkpoint
14. Output: Submission-ready manuscript + presentation
```

**At any point**:
- User can stop and resume later
- Memory preserved in SQLite
- Resume prompt auto-generated
- Todo list persists
- Phase progress tracked

---

## 🎯 **Implementation Phases**

### **Phase 1: Foundation + Memory (Week 1-2)** ← START HERE

**Objective**: Set up OpenCode agent system with memory infrastructure

**Tasks**:
1. ✅ Create `.opencode/` directory structure
2. ✅ Set up SQLite memory database schema
3. ✅ Implement 4-tier memory system (TypeScript)
4. ✅ Create checkpoint system (auto + manual)
5. ✅ Create resume prompt generator
6. ✅ Define all 9 agents (XML files)
7. ✅ Add anti-hallucination prompts to all agents
8. ✅ Create university profile system
9. ✅ Set up project template structure
10. ✅ Implement master agent orchestration
11. ✅ Test memory save/retrieve
12. ✅ Test session resumption
13. ✅ Test checkpoint creation/restoration

**Deliverables**:
- 9 agent XML files (with anti-hallucination prompts)
- Memory system (SQLite + TypeScript)
- Checkpoint system
- Resume prompt generator
- University profiles (3+ templates)
- Project structure template
- Master agent working
- Test suite for memory system

**Success Criteria**:
- ✅ Can save to all 4 memory tiers
- ✅ Can retrieve from memory
- ✅ Can create checkpoints
- ✅ Can restore from checkpoint
- ✅ Resume prompt generates correctly
- ✅ Todo list persists
- ✅ Phase progress tracks

### **Phase 2: MCP Servers + Citation Validation (Week 3)**

**Objective**: Build all MCP servers with citation verification

**Tasks**:
1. ✅ Medical Databases MCP (with citation validation)
2. ✅ R Statistics MCP
3. ✅ Citation Management MCP (with verification)
4. ✅ Document Generation MCP
5. ✅ Unpaywall MCP
6. ✅ Citation validation service (DOI/PMID verification)
7. ✅ Fabrication detection service
8. ✅ Confidence scoring service

**Deliverables**:
- 5 working MCP servers
- Citation validation service
- Fabrication detection
- Confidence scoring
- Test suites

### **Phase 3: Core Agents (Week 4-5)**

**Objective**: Implement all 9 agents with memory integration

**Deliverables**:
- Fully functional agents
- Memory integration
- Anti-hallucination enforcement
- Prompt templates
- Test cases

### **Phase 4: Integration + Quality Gates (Week 6)**

**Objective**: Connect all components, implement quality gates

**Deliverables**:
- Complete workflow
- Quality gates at each phase
- Error handling
- Progress tracking
- Anti-hallucination validation

### **Phase 5: Testing (Week 7)**

**Objective**: Test with real research project

**Deliverables**:
- Completed test project
- Bug fixes
- Optimizations
- Memory system validation
- Session resumption testing

### **Phase 6: Documentation (Week 8)**

**Objective**: Finalize documentation

**Deliverables**:
- User guide
- Deployment package
- Troubleshooting guide

---

## 🚀 **What I Need From You**

### **Immediate Actions**

1. ✅ **Confirm Understanding**
   - Have you read the master plan v4.0?
   - Do you understand the 4-tier memory architecture?
   - Do you understand the anti-hallucination framework?
   - Do you understand session continuity?
   - Any questions before starting?

2. ✅ **Start Phase 1**
   - Create `.opencode/` directory structure
   - Set up SQLite memory database
   - Implement memory system (TypeScript)
   - Create checkpoint system
   - Define Master Agent (XML with memory management)
   - Test memory operations

3. ✅ **Follow Best Practices**
   - Use OpenCode's existing features
   - Don't rebuild what exists
   - Test each component
   - Maintain high quality
   - Document everything

### **Important Notes**

- 🎯 **Focus on Phase 1 first** - Don't jump ahead
- 🧪 **Test everything** - Memory, checkpoints, resumption
- 📚 **Follow master plan v4.0** - Specifications are detailed
- 💬 **Ask questions** - If anything is unclear
- ✅ **Quality over speed** - This is for academic research
- 🛡️ **Anti-hallucination is critical** - Medical research = zero tolerance

---

## 📚 **Reference Documents**

**Must Read**:
1. `MEDRESEARCH-AI-MASTER-PLAN-V4.md` - Complete specifications (200+ pages)

**Supporting Docs**:
- OpenCode documentation (for agent system)
- PRISMA 2020 guidelines
- University submission guidelines
- SQLite documentation
- Anti-hallucination research papers

---

## ❓ **Questions to Ask Before Starting**

1. Do you understand the 9-agent architecture?
2. Do you understand the 4-tier memory system?
3. Do you understand the anti-hallucination framework?
4. Do you understand how OpenCode agents work?
5. Do you understand the MCP server concept?
6. Do you understand session continuity?
7. Any clarifications needed on requirements?
8. Any suggestions for improvements?

---

## ✅ **Success Criteria**

**Phase 1 Complete When**:
- ✅ All 9 agent XML files created (with anti-hallucination prompts)
- ✅ SQLite memory database set up
- ✅ 4-tier memory system working
- ✅ Checkpoint system working (auto + manual)
- ✅ Resume prompt generator working
- ✅ Master agent can delegate to specialists
- ✅ Project folder structure auto-created
- ✅ University profiles working
- ✅ Memory save/retrieve tested
- ✅ Session resumption tested
- ✅ Todo list persistence tested

**Overall Project Complete When**:
- ✅ Can run complete research workflow
- ✅ Can resume research after days/weeks
- ✅ Zero fabricated citations
- ✅ All citations verified
- ✅ Generates publication-ready manuscript
- ✅ PRISMA 2020 100% compliant
- ✅ All quality gates pass
- ✅ University guidelines followed
- ✅ Tested with real research project
- ✅ Memory system reliable
- ✅ Anti-hallucination framework working

---

## 🎉 **Let's Build This!**

This is an ambitious project that will revolutionize how systematic reviews are conducted. Let's build it systematically, professionally, and with high quality standards.

**Ready to start Phase 1?**

Please confirm:
1. ✅ You've read the master plan v4.0
2. ✅ You understand the memory architecture
3. ✅ You understand the anti-hallucination framework
4. ✅ You're ready to implement Phase 1
5. ❓ Any questions or suggestions

Then let's begin! 🚀

---

**Project**: MedResearch AI Multi-Agent System  
**Version**: 4.0.0  
**Status**: Ready for Implementation  
**Timeline**: 7-8 weeks to completion  
**Current Phase**: Phase 1 - Foundation + Memory

---

## 🔑 **Key Innovations in v4.0**

1. **4-Tier Memory System** - Never lose context across sessions
2. **Citation-First Architecture** - Every claim must have verified source
3. **Auto-Checkpointing** - Every 5 minutes + phase boundaries
4. **Session Resumption** - Pick up exactly where you left off
5. **Confidence Scoring** - 0.8 threshold for medical research
6. **Fabrication Detection** - Pattern analysis for fake citations
7. **Audit Trail** - Complete decision history
8. **Quality Gates** - Anti-hallucination validation at each phase

---

## 📊 **What Makes This Different**

**vs. General AI Systems**:
- ✅ Medical-grade accuracy (0.8 vs 0.7 confidence threshold)
- ✅ Citation verification (every source validated)
- ✅ Session continuity (resume after weeks)
- ✅ Complete audit trail (every decision logged)

**vs. Existing Research Tools**:
- ✅ Free (no API costs, uses Claude Pro)
- ✅ Local (all data stays on your machine)
- ✅ Flexible (configurable for any university)
- ✅ Complete (end-to-end workflow)

---

**COPY THIS ENTIRE PROMPT TO START A NEW SESSION WITHOUT LOSING CONTEXT**

---

**END OF ENHANCED SESSION PROMPT v4.0**
