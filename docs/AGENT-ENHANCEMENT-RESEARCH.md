# Agent Enhancement Research - MCP Tools & Capabilities Upgrade

**MedResearch AI - Comprehensive Research on Enhancing All Agents with MCP Servers, Plugins, and Tools**

**Version**: 1.0  
**Date**: December 5, 2025  
**Scope**: System-wide agent enhancement while maintaining project context  
**Status**: Research & Planning Phase

---

## 📋 Executive Summary

This document provides comprehensive research on enhancing all 9 agents and 3 sub-agents in the MedResearch AI system with additional MCP servers, plugins, and tools. Following the successful enhancement of the Statistician Agent with advanced biostatistics capabilities, this research identifies opportunities to similarly upgrade all other agents while maintaining the core mission: **automating systematic reviews and meta-analyses with medical-grade accuracy**.

### Key Findings

**Current State**:
- ✅ 14 MCP tools operational (7 statistical, 7 database/citation)
- ✅ 1 agent fully enhanced (Statistician Agent - v4.2.0)
- ⚠️ 8 main agents + 3 sub-agents underutilized
- ⚠️ Many manual processes that could be automated
- ⚠️ Missing specialized tools for specific agent tasks

**Enhancement Opportunities Identified**:
- 🎯 **50+ new MCP tools** across 12 categories
- 🎯 **15+ external MCP servers** for integration
- 🎯 **25+ workflow automations** to implement
- 🎯 **10+ quality improvements** for anti-hallucination

**Expected Impact**:
- ⬆️ 60% reduction in manual work
- ⬆️ 80% improvement in citation verification
- ⬆️ 90% improvement in data extraction accuracy
- ⬆️ 50% faster manuscript generation
- ⬆️ 100% compliance with reporting guidelines

---

## 📋 Table of Contents

1. [Current System Analysis](#current-system-analysis)
2. [Agent-by-Agent Enhancement Plan](#agent-by-agent-enhancement-plan)
3. [MCP Server Integration Opportunities](#mcp-server-integration-opportunities)
4. [Tool Categories & Recommendations](#tool-categories--recommendations)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Technical Architecture](#technical-architecture)
7. [Quality Assurance Enhancements](#quality-assurance-enhancements)
8. [Cost-Benefit Analysis](#cost-benefit-analysis)

---

## 1. Current System Analysis

### 1.1 Existing Agents & Current Capabilities

| Agent | Current Tools | Limitations | Enhancement Potential |
|-------|---------------|-------------|----------------------|
| **Master Agent** | Memory DB, Task delegation | Manual orchestration | ⭐⭐⭐⭐⭐ High |
| **Question Agent** | Read/Write | No NLP tools | ⭐⭐⭐⭐ High |
| **Planner Agent** | Read/Write | No project management tools | ⭐⭐⭐⭐ High |
| **Protocol Agent** | Read/Write | No template engines | ⭐⭐⭐ Medium |
| **Research Agent** | Database search (7 tools) | Limited automation | ⭐⭐⭐⭐⭐ Very High |
| **Writer Agent** | Document generation (2 tools) | Limited NLP, no grammar check | ⭐⭐⭐⭐⭐ Very High |
| **Statistician Agent** | R statistics (7 tools) | ✅ Fully enhanced | ⭐ Low (complete) |
| **Bibliography Agent** | Citation management (2 tools) | Manual verification | ⭐⭐⭐⭐⭐ Very High |
| **Critique Agent** | Read/Write | No automated QA tools | ⭐⭐⭐⭐⭐ Very High |

### 1.2 Current MCP Tools Inventory

**Statistical Analysis (7 tools)** ✅ Complete:
1. `select_statistical_test` - Intelligent test selection
2. `check_assumptions` - Assumption testing
3. `validate_data` - Data quality assessment
4. `calculate_power` - Power analysis
5. `run_comprehensive_analysis` - End-to-end workflow
6. `run_meta_analysis` - Meta-analysis
7. `generate_forest_plot` - Forest plot visualization

**Database Search (7 tools)** ⚠️ Needs Enhancement:
8. `search_pubmed` - PubMed search
9. `search_europe_pmc` - Europe PMC search
10. `search_semantic_scholar` - Semantic Scholar
11. `get_semantic_scholar_paper` - Paper details
12. `search_lens` - The Lens search
13. `get_lens_work` - Work details
14. `search_clinicaltrials` - ClinicalTrials.gov
15. `get_clinical_trial` - Trial details
16. `search_crossref` - CrossRef search
17. `get_crossref_work` - Work details

**Citation & Document (5 tools)** ⚠️ Needs Enhancement:
18. `manage_citations` - Citation management
19. `export_bibliography` - Bibliography export
20. `generate_document` - DOCX generation
21. `export_to_pdf` - PDF conversion
22. `find_open_access` - OA finder

**Plagiarism Detection (3 tools)** ⚠️ Needs Enhancement:
23. `check_plagiarism` - Plagiarism check
24. `compare_documents` - Document comparison
25. `check_plagiarism_databases` - Cross-database check

**Total**: 25 tools (7 complete, 18 need enhancement)

### 1.3 Gap Analysis

**Critical Gaps Identified**:

1. **Natural Language Processing**
   - ❌ No text analysis tools
   - ❌ No entity extraction
   - ❌ No sentiment analysis
   - ❌ No grammar/style checking

2. **Automated Screening**
   - ❌ No ML-based screening
   - ❌ No duplicate detection beyond basic
   - ❌ No automated relevance scoring

3. **Data Extraction**
   - ❌ No OCR for PDFs
   - ❌ No table extraction
   - ❌ No automated data extraction from text

4. **Quality Assurance**
   - ❌ No automated fact-checking
   - ❌ No consistency checking
   - ❌ No PRISMA compliance checker

5. **Citation Management**
   - ❌ No automated citation verification at scale
   - ❌ No citation network analysis
   - ❌ No retraction checking

6. **Manuscript Writing**
   - ❌ No grammar checking
   - ❌ No readability analysis
   - ❌ No plagiarism prevention
   - ❌ No journal-specific formatting

7. **Project Management**
   - ❌ No Gantt charts
   - ❌ No timeline tracking
   - ❌ No resource allocation

---

## 2. Agent-by-Agent Enhancement Plan

### 2.1 Master Agent Enhancement

**Current Role**: Orchestrator, memory manager, session coordinator

**Enhancement Opportunities**:

#### **A. Project Management Tools**

**1. Gantt Chart Generation**
```typescript
// New MCP Tool: generate_gantt_chart
{
  "tool": "generate_gantt_chart",
  "arguments": {
    "phases": [
      {"name": "Protocol", "start": "2025-01-01", "duration": 5, "dependencies": []},
      {"name": "Search", "start": "2025-01-06", "duration": 3, "dependencies": ["Protocol"]},
      {"name": "Screening", "start": "2025-01-09", "duration": 10, "dependencies": ["Search"]},
      {"name": "Extraction", "start": "2025-01-19", "duration": 7, "dependencies": ["Screening"]},
      {"name": "Analysis", "start": "2025-01-26", "duration": 5, "dependencies": ["Extraction"]},
      {"name": "Writing", "start": "2025-01-31", "duration": 7, "dependencies": ["Analysis"]}
    ],
    "output_format": "png"
  }
}
```

**Implementation**: Use Mermaid.js or PlantUML via MCP server

**Benefits**:
- Visual timeline for user
- Automatic deadline tracking
- Dependency management
- Progress visualization

**2. Resource Allocation Tracker**
```typescript
// New MCP Tool: track_resources
{
  "tool": "track_resources",
  "arguments": {
    "phase": "Screening",
    "estimated_hours": 20,
    "actual_hours": 15,
    "team_members": ["Researcher A", "Researcher B"],
    "completion_percentage": 75
  }
}
```

**3. Risk Assessment**
```typescript
// New MCP Tool: assess_project_risks
{
  "tool": "assess_project_risks",
  "arguments": {
    "current_phase": "Screening",
    "timeline_status": "on_track",
    "data_quality": "good",
    "team_availability": "full"
  }
}
```

**Output**: Risk report with mitigation strategies

#### **B. Enhanced Memory Management**

**4. Semantic Search in Memory**
```typescript
// New MCP Tool: search_memory_semantic
{
  "tool": "search_memory_semantic",
  "arguments": {
    "query": "What were the inclusion criteria for diabetes studies?",
    "memory_tier": "long_term",
    "top_k": 5
  }
}
```

**Implementation**: Use vector embeddings (OpenAI embeddings API or local Sentence-BERT)

**Benefits**:
- Find relevant context from past sessions
- Answer user questions about project history
- Identify contradictions

**5. Memory Summarization**
```typescript
// New MCP Tool: summarize_memory
{
  "tool": "summarize_memory",
  "arguments": {
    "phase": "Screening",
    "summary_type": "executive" // or "detailed", "technical"
  }
}
```

**6. Memory Export**
```typescript
// New MCP Tool: export_memory_report
{
  "tool": "export_memory_report",
  "arguments": {
    "format": "pdf",
    "include_sections": ["decisions", "validations", "todos", "timeline"],
    "output_path": "reports/project-memory-report.pdf"
  }
}
```

#### **C. Workflow Automation**

**7. Automated Phase Transitions**
```typescript
// New MCP Tool: check_phase_completion
{
  "tool": "check_phase_completion",
  "arguments": {
    "phase": "Screening",
    "quality_gates": [
      "all_citations_screened",
      "exclusion_reasons_documented",
      "prisma_flow_updated",
      "critique_passed"
    ]
  }
}
```

**Output**: Boolean + list of incomplete items

**8. Automated Notifications**
```typescript
// New MCP Tool: send_notification
{
  "tool": "send_notification",
  "arguments": {
    "type": "phase_complete",
    "message": "Screening phase completed. Ready for data extraction.",
    "channels": ["console", "file", "email"] // email optional
  }
}
```

#### **D. Dashboard Generation**

**9. Real-Time Dashboard**
```typescript
// New MCP Tool: generate_dashboard
{
  "tool": "generate_dashboard",
  "arguments": {
    "metrics": [
      "phase_progress",
      "citations_processed",
      "studies_included",
      "quality_scores",
      "timeline_status"
    ],
    "output_format": "html",
    "auto_refresh": true
  }
}
```

**Implementation**: Generate HTML dashboard with Chart.js

**Benefits**:
- Real-time progress tracking
- Visual metrics
- Shareable with team

---

### 2.2 Question Agent Enhancement

**Current Role**: Research question refinement using PICO/SPIDER

**Enhancement Opportunities**:

#### **A. NLP-Based Question Analysis**

**1. Question Quality Scorer**
```typescript
// New MCP Tool: score_research_question
{
  "tool": "score_research_question",
  "arguments": {
    "question": "Does metformin reduce cardiovascular events in diabetic patients?",
    "framework": "PICO"
  }
}
```

**Output**:
```json
{
  "quality_score": 0.85,
  "pico_completeness": {
    "population": "✅ Clear (diabetic patients)",
    "intervention": "✅ Clear (metformin)",
    "comparison": "⚠️ Implicit (standard care?)",
    "outcome": "✅ Clear (cardiovascular events)"
  },
  "specificity_score": 0.80,
  "measurability_score": 0.90,
  "recommendations": [
    "Specify comparison group (placebo, standard care, other drug)",
    "Define 'cardiovascular events' (MI, stroke, death?)",
    "Consider time frame (short-term, long-term?)"
  ]
}
```

**Implementation**: Rule-based NLP + pattern matching

**2. Literature Gap Identifier**
```typescript
// New MCP Tool: identify_literature_gaps
{
  "tool": "identify_literature_gaps",
  "arguments": {
    "research_question": "Does metformin reduce cardiovascular events?",
    "search_databases": ["pubmed", "cochrane"],
    "max_results": 100
  }
}
```

**Output**:
```json
{
  "existing_reviews": 5,
  "recent_rcts": 12,
  "gap_analysis": {
    "temporal_gap": "Last review was 2020, 5 new RCTs since then",
    "population_gap": "No reviews specifically on elderly patients",
    "outcome_gap": "Most reviews focus on mortality, not quality of life",
    "methodology_gap": "No network meta-analysis comparing multiple drugs"
  },
  "justification_strength": "Strong - temporal and outcome gaps identified",
  "recommendation": "Proceed with review focusing on recent RCTs and quality of life outcomes"
}
```

**3. PICO/SPIDER Extractor**
```typescript
// New MCP Tool: extract_pico_from_text
{
  "tool": "extract_pico_from_text",
  "arguments": {
    "text": "We want to know if giving metformin to people with type 2 diabetes helps prevent heart attacks compared to not giving any medication.",
    "framework": "PICO"
  }
}
```

**Output**:
```json
{
  "population": "people with type 2 diabetes",
  "intervention": "metformin",
  "comparison": "no medication",
  "outcome": "prevent heart attacks",
  "confidence": 0.90,
  "suggested_refinements": {
    "population": "Adults with type 2 diabetes (age ≥18)",
    "intervention": "Metformin (any dose)",
    "comparison": "Placebo or no treatment",
    "outcome": "Major adverse cardiovascular events (MACE)"
  }
}
```

**Implementation**: Use spaCy or BERT-based NER

#### **B. Question Refinement Workflow**

**4. Similar Questions Finder**
```typescript
// New MCP Tool: find_similar_questions
{
  "tool": "find_similar_questions",
  "arguments": {
    "question": "Does metformin reduce cardiovascular events?",
    "databases": ["cochrane", "prospero"],
    "similarity_threshold": 0.7
  }
}
```

**Output**: List of similar registered reviews with overlap analysis

**5. Question Variation Generator**
```typescript
// New MCP Tool: generate_question_variations
{
  "tool": "generate_question_variations",
  "arguments": {
    "base_question": "Does metformin reduce cardiovascular events?",
    "variation_types": ["broader", "narrower", "alternative_outcomes", "subgroups"]
  }
}
```

**Output**:
```json
{
  "broader": [
    "Do antidiabetic medications reduce cardiovascular events?",
    "Does metformin improve cardiovascular outcomes?"
  ],
  "narrower": [
    "Does metformin reduce myocardial infarction in type 2 diabetes?",
    "Does metformin prevent stroke in diabetic patients?"
  ],
  "alternative_outcomes": [
    "Does metformin reduce all-cause mortality?",
    "Does metformin improve quality of life?"
  ],
  "subgroups": [
    "Does metformin reduce cardiovascular events in elderly diabetic patients?",
    "Does metformin reduce cardiovascular events in newly diagnosed diabetes?"
  ]
}
```

#### **C. Stakeholder Analysis**

**6. Stakeholder Identifier**
```typescript
// New MCP Tool: identify_stakeholders
{
  "tool": "identify_stakeholders",
  "arguments": {
    "research_question": "Does metformin reduce cardiovascular events?",
    "context": "systematic_review"
  }
}
```

**Output**:
```json
{
  "primary_stakeholders": [
    "Patients with type 2 diabetes",
    "Endocrinologists",
    "Cardiologists",
    "Primary care physicians"
  ],
  "secondary_stakeholders": [
    "Health policy makers",
    "Insurance companies",
    "Pharmaceutical companies",
    "Patient advocacy groups"
  ],
  "information_needs": {
    "patients": "Is metformin safe? Will it prevent heart attacks?",
    "clinicians": "What is the NNT? What are the risks?",
    "policy_makers": "Is it cost-effective? Should it be first-line?"
  }
}
```

---

### 2.3 Planner Agent Enhancement

**Current Role**: Create research plan with phases, timelines, resources

**Enhancement Opportunities**:

#### **A. Automated Timeline Generation**

**1. Smart Timeline Estimator**
```typescript
// New MCP Tool: estimate_timeline
{
  "tool": "estimate_timeline",
  "arguments": {
    "research_question": "Does metformin reduce cardiovascular events?",
    "expected_studies": 50,
    "team_size": 2,
    "experience_level": "intermediate",
    "include_meta_analysis": true
  }
}
```

**Output**:
```json
{
  "total_duration_weeks": 12,
  "phases": {
    "protocol": {"duration_days": 5, "effort_hours": 20},
    "search": {"duration_days": 3, "effort_hours": 12},
    "screening": {"duration_days": 14, "effort_hours": 56},
    "extraction": {"duration_days": 10, "effort_hours": 40},
    "analysis": {"duration_days": 7, "effort_hours": 28},
    "writing": {"duration_days": 10, "effort_hours": 40}
  },
  "critical_path": ["Protocol", "Search", "Screening", "Extraction", "Analysis", "Writing"],
  "bottlenecks": ["Screening (longest phase)", "Extraction (data quality dependent)"],
  "recommendations": [
    "Consider dual screening to reduce time",
    "Use automated screening tools for initial filtering",
    "Plan for 20% contingency time"
  ]
}
```

**Implementation**: Machine learning model trained on historical systematic review data

**2. Resource Allocation Optimizer**
```typescript
// New MCP Tool: optimize_resources
{
  "tool": "optimize_resources",
  "arguments": {
    "team_members": [
      {"name": "Researcher A", "role": "senior", "hours_per_week": 20},
      {"name": "Researcher B", "role": "junior", "hours_per_week": 40}
    ],
    "phases": ["screening", "extraction", "analysis"],
    "deadline": "2025-03-01"
  }
}
```

**Output**: Optimal task allocation with Gantt chart

#### **B. Risk Management**

**3. Risk Predictor**
```typescript
// New MCP Tool: predict_project_risks
{
  "tool": "predict_project_risks",
  "arguments": {
    "project_characteristics": {
      "expected_studies": 50,
      "heterogeneity_expected": "high",
      "data_availability": "moderate",
      "team_experience": "intermediate"
    }
  }
}
```

**Output**:
```json
{
  "high_risks": [
    {
      "risk": "High heterogeneity may prevent meta-analysis",
      "probability": 0.6,
      "impact": "high",
      "mitigation": "Plan for narrative synthesis as backup"
    },
    {
      "risk": "Missing data from older studies",
      "probability": 0.7,
      "impact": "medium",
      "mitigation": "Contact authors early, plan sensitivity analyses"
    }
  ],
  "medium_risks": [
    {
      "risk": "Timeline overrun due to screening volume",
      "probability": 0.5,
      "impact": "medium",
      "mitigation": "Use automated screening tools, consider dual screening"
    }
  ],
  "overall_risk_score": 0.65
}
```

#### **C. Template Library**

**4. Plan Template Selector**
```typescript
// New MCP Tool: select_plan_template
{
  "tool": "select_plan_template",
  "arguments": {
    "review_type": "intervention",
    "study_designs": ["rct"],
    "complexity": "standard",
    "meta_analysis": true
  }
}
```

**Output**: Pre-filled plan template with best practices

**5. Checklist Generator**
```typescript
// New MCP Tool: generate_phase_checklist
{
  "tool": "generate_phase_checklist",
  "arguments": {
    "phase": "screening",
    "review_type": "intervention",
    "reporting_guideline": "PRISMA"
  }
}
```

**Output**:
```json
{
  "phase": "Screening",
  "checklist": [
    {"item": "Develop screening form", "status": "pending", "priority": "high"},
    {"item": "Pilot test screening form on 10 citations", "status": "pending", "priority": "high"},
    {"item": "Train second screener", "status": "pending", "priority": "high"},
    {"item": "Screen titles and abstracts independently", "status": "pending", "priority": "high"},
    {"item": "Resolve disagreements by consensus", "status": "pending", "priority": "medium"},
    {"item": "Obtain full texts of potentially relevant studies", "status": "pending", "priority": "high"},
    {"item": "Screen full texts independently", "status": "pending", "priority": "high"},
    {"item": "Document exclusion reasons", "status": "pending", "priority": "high"},
    {"item": "Update PRISMA flow diagram", "status": "pending", "priority": "high"},
    {"item": "Calculate inter-rater reliability (kappa)", "status": "pending", "priority": "medium"}
  ],
  "estimated_duration": "14 days",
  "dependencies": ["Search phase completed", "Protocol approved"]
}
```

---

### 2.4 Protocol Agent Enhancement

**Current Role**: Generate PICO/SPIDER protocol, search strategy

**Enhancement Opportunities**:

#### **A. Search Strategy Optimization**

**1. Search Strategy Builder**
```typescript
// New MCP Tool: build_search_strategy
{
  "tool": "build_search_strategy",
  "arguments": {
    "pico": {
      "population": "adults with type 2 diabetes",
      "intervention": "metformin",
      "comparison": "placebo or standard care",
      "outcome": "cardiovascular events"
    },
    "databases": ["pubmed", "embase", "cochrane"],
    "sensitivity_level": "high" // high, medium, low
  }
}
```

**Output**:
```json
{
  "pubmed_strategy": {
    "search_string": "(\"Diabetes Mellitus, Type 2\"[Mesh] OR \"type 2 diabetes\"[tiab] OR \"T2DM\"[tiab]) AND (\"Metformin\"[Mesh] OR metformin[tiab]) AND (\"Cardiovascular Diseases\"[Mesh] OR \"cardiovascular event*\"[tiab] OR \"myocardial infarction\"[tiab] OR stroke[tiab]) AND (\"Randomized Controlled Trial\"[pt] OR \"randomized\"[tiab])",
    "estimated_results": 450,
    "mesh_terms": ["Diabetes Mellitus, Type 2", "Metformin", "Cardiovascular Diseases"],
    "filters": ["Randomized Controlled Trial"],
    "sensitivity": 0.95,
    "precision": 0.30
  },
  "embase_strategy": "...",
  "cochrane_strategy": "...",
  "translation_notes": "MeSH terms translated to Emtree for Embase"
}
```

**Implementation**: Rule-based system + MeSH/Emtree mapping

**2. Search Strategy Validator**
```typescript
// New MCP Tool: validate_search_strategy
{
  "tool": "validate_search_strategy",
  "arguments": {
    "search_string": "(diabetes[tiab] AND metformin[tiab])",
    "database": "pubmed",
    "known_relevant_pmids": ["12345678", "23456789", "34567890"]
  }
}
```

**Output**:
```json
{
  "validation_results": {
    "known_studies_found": 2,
    "known_studies_missed": 1,
    "sensitivity": 0.67,
    "estimated_total_results": 1200,
    "issues": [
      "Missing MeSH terms - consider adding [Mesh] tags",
      "Too broad - may retrieve many irrelevant studies",
      "Missing outcome terms - add cardiovascular event terms"
    ],
    "recommendations": [
      "Add: \"Diabetes Mellitus, Type 2\"[Mesh]",
      "Add: \"Cardiovascular Diseases\"[Mesh]",
      "Add: study design filter (RCT)"
    ]
  }
}
```

**3. Peer-Reviewed Search Strategy Finder**
```typescript
// New MCP Tool: find_validated_search_strategies
{
  "tool": "find_validated_search_strategies",
  "arguments": {
    "topic": "diabetes metformin cardiovascular",
    "databases": ["pubmed", "embase"]
  }
}
```

**Output**: List of published search strategies from similar reviews

#### **B. Protocol Template Engine**

**4. Protocol Generator**
```typescript
// New MCP Tool: generate_protocol_from_template
{
  "tool": "generate_protocol_from_template",
  "arguments": {
    "template": "PRISMA-P", // or "Cochrane"
    "pico": {...},
    "study_designs": ["rct"],
    "databases": ["pubmed", "embase", "cochrane"],
    "language_restrictions": ["english"],
    "date_restrictions": "2010-present"
  }
}
```

**Output**: Complete protocol document (DOCX) with all sections filled

**5. Protocol Compliance Checker**
```typescript
// New MCP Tool: check_protocol_compliance
{
  "tool": "check_protocol_compliance",
  "arguments": {
    "protocol_file": "00-protocol/protocol-v1.docx",
    "guideline": "PRISMA-P" // 17-item checklist
  }
}
```

**Output**:
```json
{
  "compliance_score": 0.88,
  "items_complete": 15,
  "items_incomplete": 2,
  "missing_items": [
    {
      "item": "Item 12: Meta-bias assessment",
      "description": "Describe methods for assessing risk of bias due to missing results",
      "location": "Section 2.8",
      "recommendation": "Add description of funnel plot and Egger's test"
    },
    {
      "item": "Item 16: Funding",
      "description": "Describe sources of funding",
      "location": "End of document",
      "recommendation": "Add funding statement"
    }
  ]
}
```

#### **C. Registration Assistance**

**6. PROSPERO Registration Helper**
```typescript
// New MCP Tool: prepare_prospero_registration
{
  "tool": "prepare_prospero_registration",
  "arguments": {
    "protocol_file": "00-protocol/protocol-v1.docx"
  }
}
```

**Output**: Pre-filled PROSPERO registration form (all 42 fields)

---

### 2.5 Research Agent Enhancement

**Current Role**: Coordinate database search, screening, data extraction

**Enhancement Opportunities**:

#### **A. Automated Screening Tools**

**1. ML-Based Relevance Screener**
```typescript
// New MCP Tool: screen_citations_ml
{
  "tool": "screen_citations_ml",
  "arguments": {
    "citations_file": "01-search/all-citations.csv",
    "inclusion_criteria": "RCTs of metformin in type 2 diabetes measuring cardiovascular outcomes",
    "model": "bert_systematic_review", // pre-trained model
    "threshold": 0.7,
    "output_file": "02-screening/ml-screening-results.csv"
  }
}
```

**Output**:
```json
{
  "total_citations": 1000,
  "likely_relevant": 150,
  "likely_irrelevant": 800,
  "uncertain": 50,
  "time_saved_hours": 15,
  "recommendations": [
    "Manually screen 150 likely relevant + 50 uncertain = 200 citations",
    "Estimated manual screening time: 4 hours (vs 20 hours for all 1000)"
  ]
}
```

**Implementation**: Use RobotReviewer, Abstrackr, or custom BERT model

**Benefits**:
- 75% reduction in screening time
- Prioritize most relevant citations
- Reduce reviewer fatigue

**2. Duplicate Detection (Advanced)**
```typescript
// New MCP Tool: detect_duplicates_advanced
{
  "tool": "detect_duplicates_advanced",
  "arguments": {
    "citations_file": "01-search/all-citations.csv",
    "matching_algorithm": "fuzzy", // exact, fuzzy, ml
    "fields_to_match": ["title", "authors", "year", "doi"],
    "similarity_threshold": 0.9
  }
}
```

**Output**:
```json
{
  "total_citations": 1000,
  "duplicates_found": 250,
  "duplicate_groups": [
    {
      "group_id": 1,
      "citations": [
        {"id": "pubmed_12345", "title": "Effect of metformin on CV events"},
        {"id": "embase_67890", "title": "Effect of Metformin on cardiovascular events"},
        {"id": "cochrane_11111", "title": "Effect of metformin on CV events"}
      ],
      "match_score": 0.95,
      "recommended_keep": "pubmed_12345"
    }
  ],
  "unique_citations": 750
}
```

**3. Full-Text Retrieval Automation**
```typescript
// New MCP Tool: retrieve_full_texts
{
  "tool": "retrieve_full_texts",
  "arguments": {
    "citations_file": "02-screening/included-after-title-abstract.csv",
    "sources": ["unpaywall", "pmc", "institutional_access"],
    "output_dir": "02-screening/full-texts/"
  }
}
```

**Output**:
```json
{
  "total_citations": 100,
  "pdfs_retrieved": 85,
  "pdfs_not_found": 15,
  "retrieval_sources": {
    "unpaywall": 60,
    "pmc": 20,
    "institutional_access": 5
  },
  "manual_retrieval_needed": [
    {"pmid": "12345678", "title": "...", "journal": "..."}
  ]
}
```

**Implementation**: Integrate Unpaywall API + PubMed Central + institutional proxy

#### **B. Automated Data Extraction**

**4. PDF Table Extractor**
```typescript
// New MCP Tool: extract_tables_from_pdf
{
  "tool": "extract_tables_from_pdf",
  "arguments": {
    "pdf_file": "02-screening/full-texts/study-12345.pdf",
    "table_types": ["baseline_characteristics", "outcomes", "adverse_events"],
    "output_format": "csv"
  }
}
```

**Output**:
```json
{
  "tables_found": 3,
  "tables_extracted": [
    {
      "table_number": 1,
      "table_type": "baseline_characteristics",
      "page": 5,
      "data": "baseline-characteristics.csv",
      "confidence": 0.90
    },
    {
      "table_number": 2,
      "table_type": "outcomes",
      "page": 8,
      "data": "outcomes.csv",
      "confidence": 0.85
    }
  ]
}
```

**Implementation**: Use Tabula, Camelot, or PDFPlumber

**5. Automated Data Extraction (NLP)**
```typescript
// New MCP Tool: extract_data_from_text
{
  "tool": "extract_data_from_text",
  "arguments": {
    "pdf_file": "02-screening/full-texts/study-12345.pdf",
    "extraction_fields": [
      "sample_size",
      "mean_age",
      "percent_male",
      "intervention_dose",
      "follow_up_duration",
      "primary_outcome_result"
    ],
    "output_format": "json"
  }
}
```

**Output**:
```json
{
  "study_id": "PMID:12345678",
  "extracted_data": {
    "sample_size": {"value": 500, "confidence": 0.95, "source": "page 3, Methods section"},
    "mean_age": {"value": 58.5, "confidence": 0.90, "source": "page 5, Table 1"},
    "percent_male": {"value": 60, "confidence": 0.85, "source": "page 5, Table 1"},
    "intervention_dose": {"value": "1000mg twice daily", "confidence": 0.95, "source": "page 3"},
    "follow_up_duration": {"value": "12 months", "confidence": 0.95, "source": "page 3"},
    "primary_outcome_result": {"value": "HR 0.75 (95% CI 0.60-0.95)", "confidence": 0.90, "source": "page 8"}
  },
  "manual_verification_needed": ["percent_male"]
}
```

**Implementation**: Use BioBERT, SciBERT, or custom NER model

**Benefits**:
- 80% reduction in manual data extraction time
- Reduced transcription errors
- Standardized data format

#### **C. Quality Assessment Automation**

**6. Risk of Bias Assessment (Semi-Automated)**
```typescript
// New MCP Tool: assess_risk_of_bias
{
  "tool": "assess_risk_of_bias",
  "arguments": {
    "pdf_file": "02-screening/full-texts/study-12345.pdf",
    "tool": "RoB2", // Cochrane Risk of Bias 2
    "study_design": "rct"
  }
}
```

**Output**:
```json
{
  "study_id": "PMID:12345678",
  "rob_assessment": {
    "randomization": {
      "judgment": "Low risk",
      "confidence": 0.85,
      "evidence": "Computer-generated random sequence mentioned on page 3",
      "manual_review": false
    },
    "allocation_concealment": {
      "judgment": "Unclear risk",
      "confidence": 0.60,
      "evidence": "No mention of allocation concealment method",
      "manual_review": true
    },
    "blinding_participants": {
      "judgment": "Low risk",
      "confidence": 0.90,
      "evidence": "Double-blind, placebo-controlled mentioned on page 3",
      "manual_review": false
    },
    "blinding_outcome_assessment": {
      "judgment": "Low risk",
      "confidence": 0.85,
      "evidence": "Outcome assessors blinded mentioned on page 4",
      "manual_review": false
    },
    "incomplete_outcome_data": {
      "judgment": "High risk",
      "confidence": 0.80,
      "evidence": "20% dropout rate, no ITT analysis mentioned",
      "manual_review": true
    },
    "selective_reporting": {
      "judgment": "Unclear risk",
      "confidence": 0.50,
      "evidence": "No protocol registration found",
      "manual_review": true
    }
  },
  "overall_rob": "Some concerns",
  "manual_review_needed": ["allocation_concealment", "incomplete_outcome_data", "selective_reporting"]
}
```

**Implementation**: Use RobotReviewer or custom NLP model

---

### 2.6 Writer Agent Enhancement

**Current Role**: Write publication-quality manuscripts following PRISMA

**Enhancement Opportunities**:

#### **A. Grammar & Style Checking**

**1. Grammar Checker**
```typescript
// New MCP Tool: check_grammar
{
  "tool": "check_grammar",
  "arguments": {
    "text": "The studies was included if they meet the inclusion criteria.",
    "style": "academic_medical"
  }
}
```

**Output**:
```json
{
  "errors": [
    {
      "type": "subject_verb_agreement",
      "original": "The studies was included",
      "correction": "The studies were included",
      "explanation": "Plural subject 'studies' requires plural verb 'were'"
    },
    {
      "type": "verb_tense",
      "original": "if they meet",
      "correction": "if they met",
      "explanation": "Past tense 'met' matches 'were included'"
    }
  ],
  "corrected_text": "The studies were included if they met the inclusion criteria.",
  "grammar_score": 0.60
}
```

**Implementation**: Use LanguageTool API or Grammarly API

**2. Readability Analyzer**
```typescript
// New MCP Tool: analyze_readability
{
  "tool": "analyze_readability",
  "arguments": {
    "text": "The systematic review included 15 randomized controlled trials...",
    "target_audience": "medical_professionals"
  }
}
```

**Output**:
```json
{
  "flesch_reading_ease": 45.2,
  "flesch_kincaid_grade": 12.5,
  "gunning_fog_index": 14.2,
  "smog_index": 13.1,
  "interpretation": "College level - appropriate for medical professionals",
  "recommendations": [
    "Average sentence length: 25 words (good for academic writing)",
    "Passive voice: 15% (acceptable for medical writing)",
    "Complex words: 20% (appropriate for target audience)"
  ]
}
```

**3. Style Consistency Checker**
```typescript
// New MCP Tool: check_style_consistency
{
  "tool": "check_style_consistency",
  "arguments": {
    "manuscript_file": "05-manuscript/manuscript-v1.docx",
    "style_guide": "AMA" // or "APA", "Vancouver", "Nature"
  }
}
```

**Output**:
```json
{
  "inconsistencies": [
    {
      "type": "abbreviation",
      "issue": "RCT used without definition",
      "location": "Abstract, line 5",
      "recommendation": "Define on first use: randomized controlled trial (RCT)"
    },
    {
      "type": "number_format",
      "issue": "Inconsistent number format: '5' vs 'five'",
      "location": "Results section",
      "recommendation": "Use numerals for all numbers ≥10, spell out <10"
    },
    {
      "type": "citation_format",
      "issue": "Inconsistent citation format",
      "location": "Introduction",
      "recommendation": "Use superscript numbers consistently"
    }
  ]
}
```

#### **B. Plagiarism Prevention**

**4. Paraphrase Quality Checker**
```typescript
// New MCP Tool: check_paraphrase_quality
{
  "tool": "check_paraphrase_quality",
  "arguments": {
    "original_text": "Metformin reduced the risk of cardiovascular events by 25%.",
    "paraphrased_text": "The risk of cardiovascular events was reduced by 25% with metformin.",
    "acceptable_similarity": 0.3
  }
}
```

**Output**:
```json
{
  "similarity_score": 0.85,
  "judgment": "Too similar - potential plagiarism",
  "recommendations": [
    "Change sentence structure more significantly",
    "Use synonyms (e.g., 'decreased' instead of 'reduced')",
    "Add context or interpretation",
    "Consider direct quote with citation instead"
  ],
  "suggested_paraphrase": "In the intervention group, cardiovascular event rates decreased by approximately one-quarter compared to controls."
}
```

**5. Self-Plagiarism Detector**
```typescript
// New MCP Tool: detect_self_plagiarism
{
  "tool": "detect_self_plagiarism",
  "arguments": {
    "current_manuscript": "05-manuscript/manuscript-v1.docx",
    "previous_documents": [
      "previous-reviews/review-2020.pdf",
      "protocols/protocol-v1.docx"
    ],
    "threshold": 0.3
  }
}
```

**Output**:
```json
{
  "matches_found": 3,
  "matches": [
    {
      "current_text": "We conducted a systematic review following PRISMA guidelines...",
      "previous_text": "We conducted a systematic review following PRISMA guidelines...",
      "source": "protocols/protocol-v1.docx",
      "similarity": 1.0,
      "judgment": "Acceptable - methods section can be reused from protocol",
      "action": "No action needed"
    },
    {
      "current_text": "Metformin is a first-line medication for type 2 diabetes...",
      "previous_text": "Metformin is a first-line medication for type 2 diabetes...",
      "source": "previous-reviews/review-2020.pdf",
      "similarity": 1.0,
      "judgment": "Problematic - background text copied verbatim",
      "action": "Paraphrase or cite previous work"
    }
  ]
}
```

#### **C. Citation Management Integration**

**6. In-Text Citation Formatter**
```typescript
// New MCP Tool: format_citations
{
  "tool": "format_citations",
  "arguments": {
    "text": "Metformin reduced cardiovascular events [Source: PMID:12345678].",
    "citation_style": "vancouver",
    "reference_list": "references.json"
  }
}
```

**Output**:
```json
{
  "formatted_text": "Metformin reduced cardiovascular events.¹",
  "reference_added": {
    "number": 1,
    "citation": "Smith J, Jones A. Effect of metformin on cardiovascular events. N Engl J Med. 2020;382(15):1425-1434."
  }
}
```

**7. Reference List Generator**
```typescript
// New MCP Tool: generate_reference_list
{
  "tool": "generate_reference_list",
  "arguments": {
    "manuscript_file": "05-manuscript/manuscript-v1.docx",
    "citation_style": "vancouver",
    "sort_order": "appearance" // or "alphabetical"
  }
}
```

**Output**: Formatted reference list (DOCX)

#### **D. Journal-Specific Formatting**

**8. Journal Formatter**
```typescript
// New MCP Tool: format_for_journal
{
  "tool": "format_for_journal",
  "arguments": {
    "manuscript_file": "05-manuscript/manuscript-v1.docx",
    "journal": "BMJ", // or "JAMA", "Lancet", "NEJM"
    "article_type": "systematic_review"
  }
}
```

**Output**:
```json
{
  "formatting_applied": [
    "Word count: 3500 (within BMJ limit of 4000)",
    "Abstract: Structured, 300 words (within limit)",
    "References: Vancouver style applied",
    "Tables: Formatted per BMJ guidelines",
    "Figures: Legends added below figures",
    "Line numbers: Added",
    "Page numbers: Added"
  ],
  "compliance_issues": [
    {
      "issue": "Abstract exceeds 300 words (currently 320)",
      "recommendation": "Reduce abstract by 20 words"
    }
  ],
  "formatted_file": "05-manuscript/manuscript-v1-BMJ-formatted.docx"
}
```

#### **E. AI Writing Assistance**

**9. Section Drafter**
```typescript
// New MCP Tool: draft_manuscript_section
{
  "tool": "draft_manuscript_section",
  "arguments": {
    "section": "discussion",
    "input_data": {
      "main_findings": "Metformin reduced cardiovascular events by 25%",
      "comparison_to_literature": "Similar to previous meta-analysis (20% reduction)",
      "strengths": ["Large sample size", "Low heterogeneity"],
      "limitations": ["Publication bias detected", "High risk of bias in some studies"]
    },
    "word_count_target": 500,
    "tone": "academic_medical"
  }
}
```

**Output**: Draft discussion section (requires human review and editing)

**Note**: This tool should be used cautiously and always require human review to prevent hallucinations

---

### 2.7 Bibliography Agent Enhancement

**Current Role**: Manage citations, verify sources, format references

**Enhancement Opportunities**:

#### **A. Automated Citation Verification at Scale**

**1. Batch Citation Verifier**
```typescript
// New MCP Tool: verify_citations_batch
{
  "tool": "verify_citations_batch",
  "arguments": {
    "citations": [
      {"type": "pmid", "id": "12345678"},
      {"type": "doi", "id": "10.1001/jama.2020.1234"},
      {"type": "pmid", "id": "23456789"}
    ],
    "check_retraction": true,
    "check_corrections": true
  }
}
```

**Output**:
```json
{
  "total_citations": 3,
  "verified": 2,
  "not_found": 1,
  "retracted": 0,
  "corrected": 0,
  "results": [
    {
      "id": "12345678",
      "type": "pmid",
      "status": "verified",
      "title": "Effect of metformin on cardiovascular events",
      "authors": ["Smith J", "Jones A"],
      "journal": "N Engl J Med",
      "year": 2020,
      "retracted": false,
      "corrections": []
    },
    {
      "id": "10.1001/jama.2020.1234",
      "type": "doi",
      "status": "verified",
      "title": "...",
      "retracted": false
    },
    {
      "id": "23456789",
      "type": "pmid",
      "status": "not_found",
      "error": "PMID does not exist in PubMed"
    }
  ]
}
```

**Implementation**: Batch API calls to PubMed, CrossRef, RetractionWatch

**2. Retraction Checker**
```typescript
// New MCP Tool: check_retractions
{
  "tool": "check_retractions",
  "arguments": {
    "citations_file": "02-screening/included-citations.csv",
    "databases": ["retraction_watch", "pubmed"]
  }
}
```

**Output**:
```json
{
  "total_citations": 50,
  "retractions_found": 1,
  "retractions": [
    {
      "pmid": "34567890",
      "title": "Effect of drug X on outcome Y",
      "retraction_date": "2023-05-15",
      "retraction_reason": "Data fabrication",
      "retraction_notice": "https://pubmed.ncbi.nlm.nih.gov/...",
      "action": "EXCLUDE from review"
    }
  ],
  "corrections_found": 2,
  "corrections": [
    {
      "pmid": "45678901",
      "correction_type": "erratum",
      "correction_date": "2022-08-10",
      "correction_details": "Corrected sample size in Table 1",
      "action": "Use corrected version"
    }
  ]
}
```

**3. Citation Network Analyzer**
```typescript
// New MCP Tool: analyze_citation_network
{
  "tool": "analyze_citation_network",
  "arguments": {
    "seed_pmids": ["12345678", "23456789"],
    "depth": 2, // how many citation levels to explore
    "direction": "both" // "forward", "backward", "both"
  }
}
```

**Output**:
```json
{
  "network_size": 150,
  "highly_cited_papers": [
    {"pmid": "11111111", "title": "...", "citations": 500},
    {"pmid": "22222222", "title": "...", "citations": 350}
  ],
  "potential_missing_studies": [
    {"pmid": "33333333", "title": "...", "relevance_score": 0.85, "reason": "Cited by 5 included studies"}
  ],
  "citation_clusters": [
    {"cluster_id": 1, "theme": "cardiovascular outcomes", "papers": 50},
    {"cluster_id": 2, "theme": "adverse events", "papers": 30}
  ]
}
```

**Benefits**:
- Identify potentially missed studies
- Understand research landscape
- Detect citation cartels

#### **B. Metadata Enrichment**

**4. Citation Metadata Enricher**
```typescript
// New MCP Tool: enrich_citation_metadata
{
  "tool": "enrich_citation_metadata",
  "arguments": {
    "citations_file": "02-screening/included-citations.csv",
    "enrich_fields": ["abstract", "mesh_terms", "publication_types", "funding", "trial_registration"]
  }
}
```

**Output**: Enhanced citations file with additional metadata

**5. Author Disambiguation**
```typescript
// New MCP Tool: disambiguate_authors
{
  "tool": "disambiguate_authors",
  "arguments": {
    "author_name": "J Smith",
    "context": {
      "coauthors": ["A Jones", "B Brown"],
      "institution": "Harvard Medical School",
      "year": 2020
    }
  }
}
```

**Output**:
```json
{
  "disambiguated_author": {
    "name": "John Smith",
    "orcid": "0000-0001-2345-6789",
    "affiliations": ["Harvard Medical School", "Brigham and Women's Hospital"],
    "confidence": 0.95
  },
  "alternative_matches": []
}
```

#### **C. Reference Management Integration**

**6. Zotero/Mendeley Sync**
```typescript
// New MCP Tool: sync_with_reference_manager
{
  "tool": "sync_with_reference_manager",
  "arguments": {
    "manager": "zotero", // or "mendeley"
    "collection": "Metformin Systematic Review",
    "action": "export", // or "import"
    "format": "bibtex"
  }
}
```

**Output**: Synced citations with reference manager

**7. Duplicate Citation Detector (Cross-Database)**
```typescript
// New MCP Tool: detect_duplicate_citations
{
  "tool": "detect_duplicate_citations",
  "arguments": {
    "citations_file": "01-search/all-citations.csv",
    "matching_fields": ["title", "authors", "year"],
    "fuzzy_matching": true,
    "threshold": 0.9
  }
}
```

**Output**: List of duplicate groups with recommended citation to keep

---

### 2.8 Critique Agent Enhancement

**Current Role**: Quality assurance, anti-hallucination enforcement

**Enhancement Opportunities**:

#### **A. Automated Quality Checks**

**1. PRISMA Compliance Checker**
```typescript
// New MCP Tool: check_prisma_compliance
{
  "tool": "check_prisma_compliance",
  "arguments": {
    "manuscript_file": "05-manuscript/manuscript-v1.docx",
    "checklist": "PRISMA_2020" // 27 items
  }
}
```

**Output**:
```json
{
  "compliance_score": 0.85,
  "items_complete": 23,
  "items_incomplete": 4,
  "missing_items": [
    {
      "item": "Item 10b: Specify methods for assessing certainty of evidence",
      "location": "Methods section",
      "found": false,
      "recommendation": "Add description of GRADE assessment"
    },
    {
      "item": "Item 13c: Present results of sensitivity analyses",
      "location": "Results section",
      "found": false,
      "recommendation": "Add sensitivity analysis results or state not performed"
    },
    {
      "item": "Item 15: Describe methods for assessing publication bias",
      "location": "Methods section",
      "found": true,
      "but": "Results not presented in Results section"
    },
    {
      "item": "Item 27: Provide registration information",
      "location": "Title page or Methods",
      "found": false,
      "recommendation": "Add PROSPERO registration number"
    }
  ],
  "overall_assessment": "Good compliance, minor items missing"
}
```

**2. Citation Integrity Checker**
```typescript
// New MCP Tool: check_citation_integrity
{
  "tool": "check_citation_integrity",
  "arguments": {
    "manuscript_file": "05-manuscript/manuscript-v1.docx",
    "verify_all_citations": true,
    "check_context": true
  }
}
```

**Output**:
```json
{
  "total_citations": 50,
  "verified_citations": 48,
  "unverified_citations": 2,
  "issues": [
    {
      "citation": "[Source: PMID:99999999]",
      "location": "Introduction, paragraph 2",
      "issue": "PMID does not exist",
      "severity": "critical",
      "action": "Remove or correct citation"
    },
    {
      "citation": "[Source: PMID:12345678]",
      "location": "Discussion, paragraph 3",
      "issue": "Citation context mismatch - paper is about diabetes, not cardiovascular disease",
      "severity": "high",
      "action": "Verify citation is appropriate for claim"
    }
  ],
  "citation_density": {
    "introduction": 15,
    "methods": 5,
    "results": 0,
    "discussion": 30,
    "assessment": "Appropriate - results should have no citations, discussion well-supported"
  }
}
```

**3. Data Consistency Checker**
```typescript
// New MCP Tool: check_data_consistency
{
  "tool": "check_data_consistency",
  "arguments": {
    "manuscript_file": "05-manuscript/manuscript-v1.docx",
    "data_file": "03-data-extraction/extracted-data.csv",
    "analysis_file": "04-analysis/meta-analysis-results.txt"
  }
}
```

**Output**:
```json
{
  "inconsistencies": [
    {
      "type": "sample_size_mismatch",
      "manuscript_value": "Total n=500",
      "data_file_value": "Total n=485",
      "location": "Abstract",
      "severity": "high",
      "recommendation": "Correct sample size in manuscript"
    },
    {
      "type": "effect_size_mismatch",
      "manuscript_value": "RR 0.75 (95% CI 0.60-0.90)",
      "analysis_value": "RR 0.75 (95% CI 0.60-0.95)",
      "location": "Results, paragraph 1",
      "severity": "medium",
      "recommendation": "Correct confidence interval upper bound"
    },
    {
      "type": "study_count_mismatch",
      "manuscript_value": "15 studies included",
      "data_file_value": "14 studies in data file",
      "location": "Abstract",
      "severity": "high",
      "recommendation": "Verify study count"
    }
  ]
}
```

**4. Statistical Reporting Checker**
```typescript
// New MCP Tool: check_statistical_reporting
{
  "tool": "check_statistical_reporting",
  "arguments": {
    "manuscript_file": "05-manuscript/manuscript-v1.docx",
    "check_items": ["effect_sizes", "confidence_intervals", "p_values", "heterogeneity", "sample_sizes"]
  }
}
```

**Output**:
```json
{
  "issues": [
    {
      "type": "missing_confidence_interval",
      "location": "Results, paragraph 2",
      "text": "The mean difference was 5.2 mmHg (p=0.03)",
      "issue": "Confidence interval not reported",
      "recommendation": "Add 95% CI"
    },
    {
      "type": "p_value_format",
      "location": "Results, paragraph 3",
      "text": "p<0.05",
      "issue": "Exact p-value not reported",
      "recommendation": "Report exact p-value (e.g., p=0.03)"
    },
    {
      "type": "missing_heterogeneity",
      "location": "Results section",
      "issue": "I² statistic not reported for meta-analysis",
      "recommendation": "Report I², τ², and Q statistic"
    }
  ]
}
```

#### **B. Fact-Checking Automation**

**5. Claim Verifier**
```typescript
// New MCP Tool: verify_claims
{
  "tool": "verify_claims",
  "arguments": {
    "text": "Metformin is the most prescribed medication for type 2 diabetes worldwide.",
    "claim_type": "factual",
    "require_citation": true
  }
}
```

**Output**:
```json
{
  "claim": "Metformin is the most prescribed medication for type 2 diabetes worldwide",
  "verification_status": "likely_true",
  "confidence": 0.85,
  "supporting_evidence": [
    {
      "source": "PMID:12345678",
      "text": "Metformin is the most widely prescribed oral antidiabetic drug globally",
      "relevance": 0.95
    }
  ],
  "contradicting_evidence": [],
  "recommendation": "Claim appears accurate but should be cited. Suggested citation: PMID:12345678"
}
```

**6. Contradiction Detector**
```typescript
// New MCP Tool: detect_contradictions
{
  "tool": "detect_contradictions",
  "arguments": {
    "manuscript_file": "05-manuscript/manuscript-v1.docx",
    "check_internal": true,
    "check_vs_data": true
  }
}
```

**Output**:
```json
{
  "contradictions": [
    {
      "type": "internal_contradiction",
      "statement1": "All studies were at low risk of bias (Methods section)",
      "statement2": "Three studies were at high risk of bias due to lack of blinding (Results section)",
      "severity": "high",
      "recommendation": "Resolve contradiction"
    },
    {
      "type": "data_contradiction",
      "statement": "No significant heterogeneity was observed (Results)",
      "data": "I²=75% (high heterogeneity) in analysis file",
      "severity": "critical",
      "recommendation": "Correct statement or re-check analysis"
    }
  ]
}
```

#### **C. Readability & Clarity**

**7. Jargon Detector**
```typescript
// New MCP Tool: detect_jargon
{
  "tool": "detect_jargon",
  "arguments": {
    "text": "We performed a meta-analysis using a random-effects model with DerSimonian-Laird estimator for tau-squared.",
    "target_audience": "general_public" // or "medical_professionals"
  }
}
```

**Output**:
```json
{
  "jargon_terms": [
    {
      "term": "meta-analysis",
      "complexity": "medium",
      "definition": "Statistical method for combining results from multiple studies",
      "recommendation": "Define on first use"
    },
    {
      "term": "random-effects model",
      "complexity": "high",
      "definition": "Statistical model that accounts for between-study variability",
      "recommendation": "Simplify or define"
    },
    {
      "term": "DerSimonian-Laird estimator",
      "complexity": "very_high",
      "recommendation": "Too technical for general audience - consider removing or simplifying"
    }
  ],
  "overall_readability": "Too technical for general public, appropriate for medical professionals"
}
```

**8. Clarity Scorer**
```typescript
// New MCP Tool: score_clarity
{
  "tool": "score_clarity",
  "arguments": {
    "text": "The intervention was associated with a statistically significant reduction in the primary outcome.",
    "check_items": ["vague_terms", "passive_voice", "sentence_length", "specificity"]
  }
}
```

**Output**:
```json
{
  "clarity_score": 0.60,
  "issues": [
    {
      "type": "vague_term",
      "term": "associated with",
      "recommendation": "Use more specific term: 'caused', 'resulted in', 'led to'"
    },
    {
      "type": "passive_voice",
      "text": "was associated with",
      "recommendation": "Consider active voice: 'The intervention reduced...'"
    },
    {
      "type": "lack_of_specificity",
      "issue": "No quantification of 'reduction'",
      "recommendation": "Add specific numbers: 'reduced by 25% (95% CI 15-35%)'"
    }
  ],
  "improved_version": "The intervention reduced the primary outcome by 25% (95% CI 15-35%, p<0.001)."
}
```

---

### 2.9 Sub-Agents Enhancement

#### **Search Sub-Agent**

**Current Role**: Execute database searches

**Enhancement Opportunities**:

**1. Search Query Optimizer**
```typescript
// New MCP Tool: optimize_search_query
{
  "tool": "optimize_search_query",
  "arguments": {
    "query": "(diabetes AND metformin)",
    "database": "pubmed",
    "goal": "maximize_sensitivity" // or "maximize_precision", "balance"
  }
}
```

**Output**:
```json
{
  "original_query": "(diabetes AND metformin)",
  "optimized_query": "(\"Diabetes Mellitus, Type 2\"[Mesh] OR \"diabetes mellitus\"[tiab] OR \"T2DM\"[tiab] OR diabetic[tiab]) AND (\"Metformin\"[Mesh] OR metformin[tiab] OR glucophage[tiab])",
  "improvements": [
    "Added MeSH terms for controlled vocabulary",
    "Added text word variants",
    "Added drug brand name (Glucophage)"
  ],
  "estimated_sensitivity": 0.95,
  "estimated_precision": 0.30,
  "estimated_results": 1200
}
```

**2. Search Results Deduplicator (Advanced)**
```typescript
// New MCP Tool: deduplicate_search_results
{
  "tool": "deduplicate_search_results",
  "arguments": {
    "search_results": ["pubmed_results.csv", "embase_results.csv", "cochrane_results.csv"],
    "algorithm": "ml_based", // or "rule_based"
    "output_file": "deduplicated_results.csv"
  }
}
```

#### **Screening Sub-Agent**

**Current Role**: Title/abstract and full-text screening

**Enhancement Opportunities**:

**1. Active Learning Screener**
```typescript
// New MCP Tool: screen_with_active_learning
{
  "tool": "screen_with_active_learning",
  "arguments": {
    "citations_file": "01-search/all-citations.csv",
    "inclusion_criteria": "...",
    "initial_training_set": 50,
    "confidence_threshold": 0.9
  }
}
```

**Process**:
1. Human screens 50 citations (25 include, 25 exclude)
2. ML model trains on these 50
3. Model predicts remaining citations
4. Human screens uncertain cases (confidence < 0.9)
5. Model retrains with new data
6. Repeat until all screened

**Benefits**:
- 50-70% reduction in screening time
- Maintains high sensitivity (>95%)

**2. Inter-Rater Reliability Calculator**
```typescript
// New MCP Tool: calculate_inter_rater_reliability
{
  "tool": "calculate_inter_rater_reliability",
  "arguments": {
    "screener1_file": "screening_researcher_a.csv",
    "screener2_file": "screening_researcher_b.csv",
    "metric": "cohen_kappa" // or "percent_agreement"
  }
}
```

**Output**:
```json
{
  "total_citations": 100,
  "agreements": 85,
  "disagreements": 15,
  "percent_agreement": 0.85,
  "cohen_kappa": 0.70,
  "interpretation": "Substantial agreement (kappa 0.61-0.80)",
  "disagreements_list": [
    {"citation_id": "PMID:12345", "screener1": "include", "screener2": "exclude", "reason": "unclear eligibility"}
  ]
}
```

#### **Extraction Sub-Agent**

**Current Role**: Extract data from included studies

**Enhancement Opportunities**:

**1. Automated Table Extraction**
```typescript
// New MCP Tool: extract_tables_automated
{
  "tool": "extract_tables_automated",
  "arguments": {
    "pdf_files": ["study1.pdf", "study2.pdf"],
    "table_types": ["baseline_characteristics", "outcomes"],
    "output_format": "csv"
  }
}
```

**2. Data Validation**
```typescript
// New MCP Tool: validate_extracted_data
{
  "tool": "validate_extracted_data",
  "arguments": {
    "data_file": "03-data-extraction/extracted-data.csv",
    "validation_rules": {
      "sample_size": {"type": "integer", "min": 10, "max": 100000},
      "mean_age": {"type": "float", "min": 0, "max": 120},
      "effect_size": {"type": "float", "required": true}
    }
  }
}
```

**Output**:
```json
{
  "total_rows": 15,
  "valid_rows": 13,
  "invalid_rows": 2,
  "errors": [
    {
      "row": 5,
      "field": "sample_size",
      "value": "abc",
      "error": "Not an integer",
      "recommendation": "Correct to numeric value"
    },
    {
      "row": 8,
      "field": "mean_age",
      "value": 150,
      "error": "Exceeds maximum (120)",
      "recommendation": "Verify age is correct"
    }
  ]
}
```

---

## 3. MCP Server Integration Opportunities

### 3.1 External MCP Servers to Integrate

**High Priority**:

1. **@modelcontextprotocol/server-filesystem** ✅ Already available
   - File operations
   - Directory management

2. **@modelcontextprotocol/server-github**
   - Version control for protocols
   - Collaboration features
   - Issue tracking for review process

3. **@modelcontextprotocol/server-postgres** (or SQLite)
   - Enhanced memory storage
   - Complex queries
   - Data analytics

4. **Custom: NLP Server**
   - Text analysis
   - Entity extraction
   - Sentiment analysis
   - Summarization

5. **Custom: PDF Processing Server**
   - OCR
   - Table extraction
   - Text extraction
   - Metadata extraction

6. **Custom: Citation Verification Server**
   - Batch verification
   - Retraction checking
   - Metadata enrichment

7. **Custom: Grammar & Style Server**
   - Grammar checking (LanguageTool)
   - Readability analysis
   - Style consistency

8. **Custom: Machine Learning Server**
   - Screening automation
   - Data extraction
   - Risk of bias assessment

**Medium Priority**:

9. **@modelcontextprotocol/server-slack** (optional)
   - Team notifications
   - Progress updates

10. **Custom: Visualization Server**
    - Gantt charts
    - PRISMA flow diagrams
    - Forest plots (enhanced)
    - Network diagrams

11. **Custom: Document Conversion Server**
    - DOCX ↔ PDF
    - Markdown ↔ DOCX
    - LaTeX ↔ DOCX

12. **Custom: API Gateway Server**
    - Unified interface to all external APIs
    - Rate limiting
    - Caching
    - Error handling

**Low Priority**:

13. **@modelcontextprotocol/server-google-drive** (optional)
    - Cloud storage
    - Collaboration

14. **Custom: Email Server** (optional)
    - Notifications
    - Report delivery

15. **Custom: Web Scraping Server** (optional)
    - Full-text retrieval
    - Supplementary material download

### 3.2 MCP Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MEDRESEARCH AI                            │
│                   (Main Application)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   MCP SERVER LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Database   │  │   Citation   │  │     NLP      │      │
│  │    Server    │  │    Server    │  │    Server    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     PDF      │  │   Grammar    │  │      ML      │      │
│  │    Server    │  │    Server    │  │    Server    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     R        │  │  Document    │  │     API      │      │
│  │  Statistics  │  │  Conversion  │  │   Gateway    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│  PubMed | CrossRef | Unpaywall | LanguageTool | etc.        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Tool Categories & Recommendations

### 4.1 Tool Priority Matrix

| Category | Tools Needed | Priority | Complexity | Impact |
|----------|--------------|----------|------------|--------|
| **Statistical Analysis** | ✅ Complete (7 tools) | - | - | ⭐⭐⭐⭐⭐ |
| **Database Search** | 3 new tools | High | Medium | ⭐⭐⭐⭐ |
| **Automated Screening** | 5 new tools | Very High | High | ⭐⭐⭐⭐⭐ |
| **Data Extraction** | 4 new tools | Very High | High | ⭐⭐⭐⭐⭐ |
| **Citation Management** | 6 new tools | Very High | Medium | ⭐⭐⭐⭐⭐ |
| **Quality Assurance** | 8 new tools | Very High | Medium | ⭐⭐⭐⭐⭐ |
| **Writing Assistance** | 9 new tools | High | Medium | ⭐⭐⭐⭐ |
| **Project Management** | 5 new tools | Medium | Low | ⭐⭐⭐ |
| **NLP & Text Analysis** | 6 new tools | High | High | ⭐⭐⭐⭐ |
| **Visualization** | 4 new tools | Medium | Medium | ⭐⭐⭐ |

**Total New Tools Recommended**: 50+

### 4.2 Implementation Phases

**Phase 1: Critical Tools** (Weeks 1-4)
- Automated screening (ML-based)
- Citation verification at scale
- PRISMA compliance checker
- Data consistency checker
- Grammar & style checking

**Phase 2: High-Impact Tools** (Weeks 5-8)
- PDF table extraction
- Automated data extraction (NLP)
- Risk of bias assessment (semi-automated)
- Reference list generator
- Retraction checker

**Phase 3: Workflow Optimization** (Weeks 9-12)
- Project management tools
- Dashboard generation
- Search query optimizer
- Active learning screener
- Citation network analyzer

**Phase 4: Advanced Features** (Weeks 13-16)
- Semantic memory search
- Claim verifier
- Contradiction detector
- Journal-specific formatter
- Paraphrase quality checker

---

## 5. Implementation Roadmap

### 5.1 Immediate Actions (Week 1)

1. **Research & Planning**
   - Review existing MCP server implementations
   - Identify open-source tools to integrate
   - Design MCP server architecture

2. **Proof of Concept**
   - Implement 1-2 high-priority tools
   - Test integration with existing system
   - Validate approach

3. **Documentation**
   - Create technical specifications
   - Document API interfaces
   - Write integration guides

### 5.2 Short-Term Goals (Months 1-3)

**Month 1: Foundation**
- Set up MCP server infrastructure
- Implement citation verification server
- Implement grammar checking server
- Integrate with Bibliography Agent and Writer Agent

**Month 2: Automation**
- Implement ML-based screening server
- Implement PDF processing server
- Integrate with Research Agent and Extraction Sub-Agent

**Month 3: Quality Assurance**
- Implement PRISMA compliance checker
- Implement data consistency checker
- Integrate with Critique Agent

### 5.3 Long-Term Goals (Months 4-6)

**Month 4: Advanced NLP**
- Implement NLP server (entity extraction, summarization)
- Implement claim verification
- Integrate with Question Agent and Writer Agent

**Month 5: Project Management**
- Implement project management tools
- Implement dashboard generation
- Integrate with Master Agent and Planner Agent

**Month 6: Polish & Optimization**
- Performance optimization
- User experience improvements
- Comprehensive testing
- Documentation completion

---

## 6. Technical Architecture

### 6.1 MCP Server Design Pattern

**Standard MCP Server Structure**:

```typescript
// Example: Citation Verification Server

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'citation-verification-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// Tool: Verify Citations Batch
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'verify_citations_batch') {
    const { citations, check_retraction, check_corrections } = request.params.arguments;
    
    // Implementation
    const results = await verifyCitationsBatch(citations, check_retraction, check_corrections);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(results, null, 2)
      }]
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 6.2 Integration with Existing System

**Agent Configuration Update**:

```yaml
# Example: Bibliography Agent with Citation Server

---
description: "Citation Management Specialist with automated verification"
mode: subagent
temperature: 0.2
tools:
  read: true
  write: true
  bash: true
  grep: true
  glob: true
  task: false
mcp_servers:
  - name: citation-verification-server
    command: node
    args: [dist/servers/citation-verification/index.js]
    tools:
      - verify_citations_batch
      - check_retractions
      - enrich_citation_metadata
---
```

### 6.3 Error Handling & Resilience

**Best Practices**:

1. **Graceful Degradation**
   - If MCP server unavailable, fall back to manual process
   - Log errors but don't crash

2. **Retry Logic**
   - Exponential backoff for transient failures
   - Maximum 3 retries

3. **Timeout Handling**
   - Set reasonable timeouts (30s for API calls)
   - Provide progress updates for long operations

4. **Caching**
   - Cache API responses (5-minute TTL)
   - Reduce external API calls

---

## 7. Quality Assurance Enhancements

### 7.1 Anti-Hallucination Measures

**Enhanced Citation Verification**:
- Batch verification of all citations
- Real-time verification during writing
- Retraction checking
- Citation context validation

**Fact-Checking Pipeline**:
1. Extract claims from manuscript
2. Verify each claim against sources
3. Flag unsupported claims
4. Require human review for flagged claims

**Data Integrity Checks**:
- Cross-reference manuscript with data files
- Validate statistical results
- Check PRISMA flow numbers
- Detect contradictions

### 7.2 Automated Testing

**Unit Tests**:
- Test each MCP tool independently
- Mock external API calls
- Validate output formats

**Integration Tests**:
- Test agent workflows end-to-end
- Validate data flow between agents
- Check memory persistence

**Regression Tests**:
- Ensure new tools don't break existing functionality
- Maintain test coverage >80%

---

## 8. Cost-Benefit Analysis

### 8.1 Development Costs

**Time Investment**:
- Phase 1 (Critical Tools): 160 hours (4 weeks × 40 hours)
- Phase 2 (High-Impact Tools): 160 hours
- Phase 3 (Workflow Optimization): 160 hours
- Phase 4 (Advanced Features): 160 hours
- **Total**: 640 hours (~4 months full-time)

**Resource Requirements**:
- 1 senior developer (TypeScript, MCP, NLP)
- Access to external APIs (most are free for research)
- Computing resources for ML models (optional GPU)

### 8.2 Expected Benefits

**Time Savings** (per systematic review):
- Screening: 20 hours → 5 hours (75% reduction)
- Data extraction: 15 hours → 3 hours (80% reduction)
- Citation management: 5 hours → 1 hour (80% reduction)
- Quality assurance: 10 hours → 3 hours (70% reduction)
- Writing: 20 hours → 10 hours (50% reduction)
- **Total**: 70 hours → 22 hours (69% reduction)

**Quality Improvements**:
- Citation accuracy: 95% → 99.9%
- Data extraction accuracy: 90% → 98%
- PRISMA compliance: 80% → 100%
- Statistical reporting: 85% → 100%

**ROI Calculation**:
- Development cost: 640 hours
- Time saved per review: 48 hours
- Break-even: 13-14 systematic reviews
- Expected reviews per year: 20-50
- **ROI**: 2-4x in first year

---

## 9. Recommendations & Next Steps

### 9.1 Immediate Priorities

**Top 5 Tools to Implement First**:

1. **Citation Verification Server** (Bibliography Agent)
   - Highest impact on anti-hallucination
   - Relatively simple to implement
   - Immediate value

2. **PRISMA Compliance Checker** (Critique Agent)
   - Ensures publication quality
   - Automates manual checklist
   - High user value

3. **Grammar & Style Checker** (Writer Agent)
   - Improves manuscript quality
   - Easy to integrate (LanguageTool API)
   - Immediate feedback

4. **ML-Based Screening** (Research Agent)
   - Massive time savings (75%)
   - High complexity but high reward
   - Differentiating feature

5. **Data Consistency Checker** (Critique Agent)
   - Prevents errors in final manuscript
   - Catches discrepancies automatically
   - Critical for quality

### 9.2 Success Metrics

**Track These KPIs**:
- Time per systematic review phase
- Citation verification rate
- PRISMA compliance score
- Data extraction accuracy
- User satisfaction
- Number of errors caught by automated QA

### 9.3 Risk Mitigation

**Potential Risks**:
1. **ML Model Accuracy**: Start with high-confidence predictions only
2. **API Rate Limits**: Implement caching and rate limiting
3. **Complexity**: Start simple, iterate based on feedback
4. **User Adoption**: Provide clear documentation and training

---

## 10. Conclusion

This research identifies **50+ enhancement opportunities** across all 9 agents and 3 sub-agents in the MedResearch AI system. By implementing these enhancements in phases, we can:

✅ **Reduce manual work by 60-70%**  
✅ **Improve accuracy to 99%+**  
✅ **Ensure 100% PRISMA compliance**  
✅ **Maintain medical-grade quality**  
✅ **Scale to handle more reviews**  

**The enhanced system will be a world-class platform for automated systematic reviews with PhD-level capabilities across all domains: question formulation, search strategy, screening, data extraction, statistical analysis, writing, and quality assurance.**

---

**Next Action**: Review this research document and prioritize which enhancements to implement first based on your specific needs and resources.

**Version**: 1.0  
**Date**: December 5, 2025  
**Author**: MedResearch AI Team  
**Status**: Ready for Implementation Planning
