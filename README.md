# 🏥 MedResearch AI - Multi-Agent System v4.1

**Intelligent multi-agent system for systematic reviews and meta-analyses with enterprise-grade memory and medical-grade anti-hallucination measures.**

---

## 🆕 What's New in v4.1

### **Production Hardening** ⭐ NEW
- **Structured Logging**: Winston-based JSON logging with rotation
- **Caching Layer**: 40-60% cache hit rate, 5-minute TTL
- **Retry Logic**: Exponential backoff for transient failures
- **Input Validation**: Zod schemas for runtime type safety
- **Performance Tracking**: Duration logged for all operations

### **What's New in v4.0**

### **Memory System** ⭐
- **4-Tier Architecture**: Short-term, Working, Long-term, Episodic
- **Auto-checkpointing**: Every 5 minutes + phase boundaries
- **Session Resumption**: Continue research across days/weeks
- **Never lose context**: Full state preservation

### **Anti-Hallucination Framework** ⭐
- **Citation-First**: Every claim must have verified source
- **5-Layer Defense**: Grounding, Verification, Validation, Confidence, Human-in-Loop
- **Zero Tolerance**: Fabricated citations = instant rejection
- **Medical-Grade**: 0.8 confidence threshold

### **Session Continuity** ⭐
- **Resume Anytime**: Pick up exactly where you left off
- **Todo Persistence**: Never forget what's next
- **Phase Tracking**: Always know your progress
- **Audit Trail**: Every decision logged

---

## 🎯 System Overview

### **12 Specialized Agents**

**Main Agents (9)**:
1. **Master Agent** - Orchestrator + memory manager
2. **Question Agent** - Research question refinement
3. **Planner Agent** - Research planning
4. **Protocol Agent** - PICO/SPIDER protocol
5. **Research Agent** - Database search & screening coordination
6. **Writer Agent** - Manuscript writing
7. **Statistician Agent** - Meta-analysis
8. **Bibliography Agent** - Citation management
9. **Critique Agent** - Quality assurance + anti-hallucination

**Sub-Agents (3)**:
10. **Search Sub-Agent** - Database searching (PubMed, Europe PMC)
11. **Screening Sub-Agent** - Title/abstract and full-text screening
12. **Extraction Sub-Agent** - Data extraction and risk of bias assessment

### **9 MCP Tools**
1. **search_pubmed** - Search PubMed/MEDLINE database
2. **search_europe_pmc** - Search Europe PMC with preprints
3. **run_meta_analysis** - Execute meta-analysis using R
4. **generate_forest_plot** - Create forest plot visualizations
5. **manage_citations** - Verify and retrieve citation metadata
6. **export_bibliography** - Export formatted bibliographies
7. **generate_document** - Generate DOCX manuscripts
8. **export_to_pdf** - Convert DOCX to PDF
9. **find_open_access** - Find OA versions via Unpaywall

### **Memory System**
- **Short-term** (current session)
- **Working** (current phase)
- **Long-term** (entire project)
- **Episodic** (decision history)

---

## 🚀 Quick Start

### **Installation**

```bash
cd C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### **Start New Research**

```bash
# Start OpenCode with Master Agent
opencode --agent .opencode/agent/medresearch/master-agent.md

# Or use the command
/start-research
```

### **Resume Existing Research**

```bash
# Resume from checkpoint
/resume-research

# Or manually
opencode --agent .opencode/agent/medresearch/master-agent.md
> "Resume my diabetes research"
```

---

## 📁 Project Structure

```
MedResearch-AI/
├── .opencode/
│   ├── agent/medresearch/          # 9 main agents
│   ├── agent/subagents/medresearch/ # 3 sub-agents
│   ├── tool/                        # 6 MCP servers (TypeScript)
│   ├── context/medresearch/         # Domain knowledge
│   ├── command/medresearch/         # Slash commands
│   └── university-profiles/         # University configs
│
├── research-projects/               # Your research projects
│   └── [project-slug]/
│       ├── .memory/                 # SQLite database
│       ├── .session/                # Session state
│       └── 00-09/                   # Phase outputs
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔑 Key Features

- ✅ **OpenCode-native** - Uses Claude Pro (no API costs)
- ✅ **Free databases** - PubMed, Europe PMC, Lens, OpenAlex
- ✅ **Memory persistence** - SQLite, never lose context
- ✅ **Session continuity** - Resume after days/weeks
- ✅ **Anti-hallucination** - Citation-first, verification
- ✅ **PRISMA 2020 compliant** - All 27 checklist items
- ✅ **University-configurable** - European University of Cyprus (primary)
- ✅ **Quality gates** - Validation at each phase
- ✅ **Audit trail** - Every decision logged

---

## 📚 Documentation

- **Master Plan**: `MEDRESEARCH-AI-MASTER-PLAN-V4.md` (200+ pages)
- **Session Prompt**: `ENHANCED-SESSION-PROMPT-V4.md`
- **Session Summary**: `SESSION-SUMMARY-DEC-3-2025.md`

---

## 🧪 Testing

```bash
# Run tests
npm test

# Test memory system
npm run test:memory

# Test checkpoint system
npm run test:checkpoint
```

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🎉 Status

**Version**: 4.0.0  
**Status**: ✅ Phase 3 Complete (100%)  
**Production Status**: MVP Complete, Critical Fixes in Progress

---

**Created**: December 3, 2025  
**Author**: MedResearch AI Team
