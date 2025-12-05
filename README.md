# 🏥 MedResearch AI - Multi-Agent System v4.2

**Intelligent multi-agent system for systematic reviews and meta-analyses with PhD-level biostatistics, enterprise-grade memory, and medical-grade anti-hallucination measures.**

---

## 🆕 What's New in v4.2

### **Advanced Statistical Analysis** ⭐ NEW
- **Intelligent Test Selection**: Automatic recommendation based on data characteristics (50+ tests)
- **Comprehensive Assumption Checking**: Normality, homogeneity, linearity, outliers with diagnostic plots
- **Data Quality Validation**: Missing data analysis, outlier detection, duplicate checking
- **Statistical Power Analysis**: Sample size planning and post-hoc power assessment
- **End-to-End Workflows**: Complete analysis from validation to publication-ready reports
- **Study Design Aware**: Tailored for RCTs, cohort, case-control, cross-sectional studies
- **Reporting Guidelines**: CONSORT, STROBE, PRISMA compliance built-in

### **What's New in v4.1**

### **Production Hardening**
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
7. **Statistician Agent** - PhD-level biostatistics + meta-analysis
8. **Bibliography Agent** - Citation management
9. **Critique Agent** - Quality assurance + anti-hallucination

**Sub-Agents (3)**:
10. **Search Sub-Agent** - Database searching (PubMed, Europe PMC)
11. **Screening Sub-Agent** - Title/abstract and full-text screening
12. **Extraction Sub-Agent** - Data extraction and risk of bias assessment

### **14 MCP Tools**

**Statistical Analysis (7)**:
1. **select_statistical_test** - Intelligent test selection with decision tree
2. **check_assumptions** - Comprehensive assumption testing with diagnostic plots
3. **validate_data** - Data quality assessment and validation
4. **calculate_power** - Power analysis for sample size planning
5. **run_comprehensive_analysis** - End-to-end analysis workflow
6. **run_meta_analysis** - Execute meta-analysis using R
7. **generate_forest_plot** - Create forest plot visualizations

**Database & Citation (7)**:
8. **search_pubmed** - Search PubMed/MEDLINE database
9. **search_europe_pmc** - Search Europe PMC with preprints
10. **manage_citations** - Verify and retrieve citation metadata
11. **export_bibliography** - Export formatted bibliographies
12. **generate_document** - Generate DOCX manuscripts
13. **export_to_pdf** - Convert DOCX to PDF
14. **find_open_access** - Find OA versions via Unpaywall

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
├── src/                             # Source code
│   ├── common/                      # Shared utilities
│   │   ├── logger.ts               # Winston logging
│   │   ├── cache.ts                # NodeCache caching
│   │   ├── retry.ts                # Retry logic
│   │   └── validation.ts           # Zod schemas
│   └── mcp/                         # MCP server
│       ├── index.ts                # Server entry point
│       └── tools/                  # MCP tools (11 files)
│
├── tests/                           # Test files
│   ├── test-databases.js
│   ├── test-plagiarism.js
│   ├── test-meta-analysis.js
│   └── dashboard.js
│
├── docs/                            # Documentation
│   ├── CHANGELOG.md                # Version history
│   ├── DEVELOPMENT.md              # Developer guide
│   ├── TESTING.md                  # Testing guide
│   ├── GUIDES.md                   # User guides
│   └── archive/                    # Old session files
│
├── assets/                          # Images, plots
├── logs/                            # Runtime logs
├── .memory/                         # Runtime memory
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔑 Key Features

### **Core Capabilities**
- ✅ **OpenCode-native** - Uses Claude Pro (no API costs)
- ✅ **Free databases** - PubMed, Europe PMC, Lens, OpenAlex
- ✅ **Memory persistence** - SQLite, never lose context
- ✅ **Session continuity** - Resume after days/weeks
- ✅ **Anti-hallucination** - Citation-first, verification
- ✅ **PRISMA 2020 compliant** - All 27 checklist items
- ✅ **University-configurable** - European University of Cyprus (primary)
- ✅ **Quality gates** - Validation at each phase
- ✅ **Audit trail** - Every decision logged

### **Statistical Analysis** ⭐ NEW
- ✅ **Intelligent Test Selection** - Automatic recommendation (50+ tests)
- ✅ **Assumption Checking** - Normality, homogeneity, linearity, outliers
- ✅ **Data Validation** - Missing data, outliers, duplicates
- ✅ **Power Analysis** - Sample size planning, post-hoc power
- ✅ **Complete Workflows** - Validation → Table 1 → Analysis → Report
- ✅ **Study Design Aware** - RCT, cohort, case-control, cross-sectional
- ✅ **Reporting Standards** - CONSORT, STROBE, PRISMA
- ✅ **Publication Ready** - Table 1, diagnostic plots, Word reports

---

## 📚 Documentation

### **Core Documentation**
- **Master Plan**: `MEDRESEARCH-AI-MASTER-PLAN-V4.md` (200+ pages)
- **Session Prompt**: `ENHANCED-SESSION-PROMPT-V4.md`
- **Session Summary**: `SESSION-SUMMARY-DEC-3-2025.md`
- **Changelog**: `docs/CHANGELOG.md`

### **Statistical Analysis Guides** ⭐ NEW
- **Statistical Methods**: `docs/STATISTICAL-METHODS-GUIDE.md` (10,000+ words)
  - Complete guide to all 5 statistical functions
  - 20+ practical examples with expected outputs
  - Decision trees and troubleshooting
- **Assumption Checking**: `docs/ASSUMPTION-CHECKING-GUIDE.md` (5,000+ words)
  - Interpreting normality tests, Q-Q plots, diagnostic plots
  - Handling violations with decision trees
- **Power Analysis**: `docs/POWER-ANALYSIS-GUIDE.md` (6,000+ words)
  - Sample size planning and effect size estimation
  - A priori, post-hoc, and sensitivity analyses
- **Reporting Guidelines**: `docs/REPORTING-GUIDELINES.md` (5,000+ words)
  - CONSORT, STROBE, PRISMA checklists
  - Statistical reporting standards
- **Research Document**: `docs/DATA-ANALYSIS-AGENT-RESEARCH.md` (10,000+ words)
  - Comprehensive biostatistics research and frameworks

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

---

## 📚 Documentation

### Quick Links

- **[CHANGELOG.md](docs/CHANGELOG.md)** - Version history and release notes
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Developer guide and code standards
- **[TESTING.md](docs/TESTING.md)** - Testing guide and test results
- **[GUIDES.md](docs/GUIDES.md)** - User guides and tutorials

### Getting Started

1. **Installation** - See [Quick Start](#-quick-start) above
2. **First Search** - See [GUIDES.md](docs/GUIDES.md#database-search-guide)
3. **Running Tests** - See [TESTING.md](docs/TESTING.md#running-tests)
4. **Development** - See [DEVELOPMENT.md](docs/DEVELOPMENT.md#development-workflow)

### Key Documentation

**For Users:**
- Database search strategies
- Plagiarism detection guide
- Meta-analysis workflows
- Citation management
- Document generation

**For Developers:**
- Code standards and conventions
- Adding new database tools
- Writing tests
- Debugging and troubleshooting
- Performance optimization

---

**Created**: December 3, 2025  
**Last Updated**: December 4, 2025  
**Author**: MedResearch AI Team
