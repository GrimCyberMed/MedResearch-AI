# Research Workflow - Process Guide

## Overview
This document defines the end-to-end workflow for conducting systematic reviews and meta-analyses using the MedResearch AI system. It integrates the 4-tier memory system, agent orchestration, and quality gates.

## Workflow Stages

### Stage 0: Initialization
**Agent**: Master Agent
**Duration**: 5-10 minutes
**Memory**: Short-term + Working

**Steps**:
1. **Session Creation**
   - Generate unique session ID
   - Initialize 4-tier memory system
   - Create checkpoint (state: initialized)

2. **User Input Collection**
   - Research question (initial version)
   - Review type (intervention, diagnostic, qualitative, etc.)
   - Timeline expectations
   - Resource constraints

3. **Context Loading**
   - Load relevant domain knowledge (@systematic-reviews, @meta-analysis)
   - Load university profile (if specified)
   - Load previous session (if resuming)

4. **Agent Delegation**
   - Route to Question Agent for refinement

**Outputs**:
- Session ID
- Initial memory state
- Checkpoint file

**Quality Gate**: Session initialized successfully, memory system operational

---

### Stage 1: Question Refinement
**Agent**: Question Agent
**Duration**: 15-30 minutes
**Memory**: Short-term + Working

**Steps**:
1. **Question Analysis**
   - Parse initial question
   - Identify key concepts
   - Assess clarity and specificity

2. **PICO/SPIDER Development**
   - **For Intervention Reviews**: PICO
     - **P**opulation: Who? (age, condition, setting)
     - **I**ntervention: What treatment/program?
     - **C**omparison: Compared to what?
     - **O**utcome: What outcome measures?
   
   - **For Qualitative Reviews**: SPIDER
     - **S**ample: Who?
     - **P**henomenon of Interest: What experience/phenomenon?
     - **D**esign: What study designs?
     - **E**valuation: What outcomes/themes?
     - **R**esearch type: Qualitative/mixed methods?

3. **Refinement Iterations**
   - Present PICO/SPIDER to user
   - Gather feedback
   - Refine until approved (max 3 iterations)

4. **Feasibility Check**
   - Scoping search (PubMed, 5-minute limit)
   - Estimate number of studies (too few? too many?)
   - Assess data availability

5. **Final Question Formulation**
   - Structured research question
   - PICO/SPIDER framework
   - Inclusion/exclusion criteria (preliminary)

**Outputs**:
- Refined research question
- PICO/SPIDER framework
- Scoping search results (n studies)
- Feasibility assessment

**Memory Storage**:
- Working memory: PICO/SPIDER, refined question
- Long-term memory: Question refinement rationale

**Quality Gate**: 
- ✅ Question is specific and answerable
- ✅ PICO/SPIDER complete
- ✅ Scoping search yields 10-500 studies (feasible range)
- ✅ User approval obtained

**Checkpoint**: Save state (stage: question_refined)

---

### Stage 2: Protocol Development
**Agent**: Protocol Agent
**Duration**: 1-2 hours
**Memory**: Working + Long-term

**Steps**:
1. **Eligibility Criteria**
   - Inclusion criteria (based on PICO/SPIDER)
   - Exclusion criteria (with rationale)
   - Study design requirements

2. **Search Strategy Design**
   - Database selection (≥2 required)
   - MeSH term identification
   - Keyword generation
   - Boolean logic structure
   - Search validation plan

3. **Data Extraction Plan**
   - Study characteristics to extract
   - Outcome data to extract
   - Risk of bias domains
   - Extraction form design

4. **Analysis Plan**
   - Effect measures (RR, OR, SMD, etc.)
   - Meta-analysis model (fixed vs random)
   - Heterogeneity assessment plan
   - Subgroup analyses (pre-specified)
   - Sensitivity analyses (pre-specified)

5. **PROSPERO Registration Preparation**
   - All required fields completed
   - Review team identified
   - Timeline estimated

6. **Protocol Document Generation**
   - Structured protocol (PROSPERO format)
   - Appendices (search strategies, extraction forms)

**Outputs**:
- Complete protocol document
- PROSPERO registration form (ready to submit)
- Search strategies (all databases)
- Data extraction form

**Memory Storage**:
- Working memory: Protocol details, eligibility criteria
- Long-term memory: Protocol document, search strategies
- Episodic memory: Protocol development decisions

**Quality Gate**:
- ✅ Eligibility criteria clear and justified
- ✅ Search strategy comprehensive (≥2 databases)
- ✅ Data extraction plan complete
- ✅ Analysis plan pre-specified
- ✅ User approval obtained

**Checkpoint**: Save state (stage: protocol_complete)

**User Action Required**: Submit protocol to PROSPERO (external)

---

### Stage 3: Literature Search
**Agent**: Research Agent → Search Sub-Agent
**Duration**: 2-4 hours (execution) + 1-2 weeks (full-text retrieval)
**Memory**: Working + Long-term

**Steps**:
1. **Search Execution** (Search Sub-Agent)
   - Execute searches in all databases
   - Document results (n per database)
   - Export citations to reference manager
   - Save search history

2. **Grey Literature Search**
   - ClinicalTrials.gov
   - WHO ICTRP
   - Conference proceedings
   - Dissertation databases

3. **Citation Management**
   - Import to reference manager (Zotero)
   - Deduplication
   - Document PRISMA flow (identification stage)

4. **Full-Text Retrieval**
   - Identify full texts needed
   - Access via open access (PMC, repositories)
   - Use Unpaywall for OA versions
   - Document unavailable full texts

**Outputs**:
- Citation library (deduplicated)
- Search results summary (n per database)
- PRISMA flow diagram (identification stage)
- Full-text availability report

**Memory Storage**:
- Working memory: Citation count, search results
- Long-term memory: Citation library, search documentation
- Episodic memory: Search execution log

**Quality Gate**:
- ✅ All planned databases searched
- ✅ Grey literature searched
- ✅ Deduplication completed
- ✅ Search documented (reproducible)
- ✅ PRISMA flow updated

**Checkpoint**: Save state (stage: search_complete)

---

### Stage 4: Study Selection
**Agent**: Research Agent → Screening Sub-Agent
**Duration**: 2-6 weeks (depends on n)
**Memory**: Working + Long-term

**Steps**:
1. **Title/Abstract Screening** (Screening Sub-Agent)
   - Dual independent screening (simulated or user-assisted)
   - Apply inclusion/exclusion criteria
   - Resolve conflicts (third reviewer or consensus)
   - Document exclusions (reasons)
   - Update PRISMA flow (screening stage)

2. **Full-Text Review**
   - Retrieve full texts for included citations
   - Dual independent review
   - Apply detailed eligibility criteria
   - Document exclusions with reasons
   - Update PRISMA flow (eligibility stage)

3. **Final Inclusion Set**
   - List of included studies (n)
   - Characteristics table (preliminary)
   - Exclusion log (with reasons)

**Outputs**:
- Included studies list (n studies)
- Excluded studies log (with reasons)
- PRISMA flow diagram (complete)
- Characteristics table (preliminary)

**Memory Storage**:
- Working memory: Included/excluded studies, screening progress
- Long-term memory: Final inclusion set, exclusion log
- Episodic memory: Screening decisions, conflict resolutions

**Quality Gate**:
- ✅ Dual screening completed
- ✅ Conflicts resolved
- ✅ Exclusions documented with reasons
- ✅ PRISMA flow complete
- ✅ Inclusion set approved by user

**Checkpoint**: Save state (stage: selection_complete)

---

### Stage 5: Data Extraction
**Agent**: Research Agent → Extraction Sub-Agent
**Duration**: 4-8 weeks (depends on n)
**Memory**: Working + Long-term

**Steps**:
1. **Pilot Extraction** (Extraction Sub-Agent)
   - Test extraction form on 3-5 studies
   - Refine form if needed
   - Train extractors (if human-assisted)

2. **Full Extraction**
   - Dual independent extraction
   - Extract study characteristics
   - Extract outcome data
   - Extract risk of bias data
   - Resolve discrepancies

3. **Missing Data Handling**
   - Identify missing data
   - Contact authors (email template)
   - Document responses
   - Plan for missing data in analysis

4. **Data Verification**
   - Check for errors (outliers, inconsistencies)
   - Verify calculations (effect sizes, SEs)
   - Cross-check with published reports

**Outputs**:
- Extraction database (all studies)
- Study characteristics table
- Risk of bias assessments
- Author contact log
- Data verification report

**Memory Storage**:
- Working memory: Extraction progress, missing data
- Long-term memory: Extraction database, characteristics table
- Episodic memory: Extraction decisions, author contacts

**Quality Gate**:
- ✅ Dual extraction completed
- ✅ Discrepancies resolved
- ✅ Missing data documented
- ✅ Data verified (no obvious errors)
- ✅ Risk of bias assessed for all studies

**Checkpoint**: Save state (stage: extraction_complete)

---

### Stage 6: Risk of Bias Assessment
**Agent**: Research Agent → Extraction Sub-Agent
**Duration**: 2-4 weeks
**Memory**: Working + Long-term

**Steps**:
1. **Tool Selection**
   - **RCTs**: Cochrane RoB 2
   - **Observational**: ROBINS-I
   - **Diagnostic**: QUADAS-2
   - **Qualitative**: CASP

2. **Assessment Execution**
   - Dual independent assessment
   - Domain-by-domain judgments
   - Support judgments with quotes/page numbers
   - Resolve disagreements

3. **Summary Tables**
   - Risk of bias table (all studies)
   - Risk of bias graph (domain-level)
   - Overall risk of bias summary

**Outputs**:
- Risk of bias assessments (all studies)
- Risk of bias summary table
- Risk of bias graph
- Supporting evidence (quotes, page numbers)

**Memory Storage**:
- Working memory: RoB assessments
- Long-term memory: RoB table, graph
- Episodic memory: RoB decisions, disagreements

**Quality Gate**:
- ✅ Appropriate tool used
- ✅ Dual assessment completed
- ✅ Judgments supported by evidence
- ✅ Summary table/graph created

**Checkpoint**: Save state (stage: rob_complete)

---

### Stage 7: Data Analysis & Synthesis
**Agent**: Statistician Agent
**Duration**: 2-4 weeks
**Memory**: Working + Long-term

**Steps**:
1. **Descriptive Synthesis**
   - Study characteristics summary
   - Population characteristics
   - Intervention characteristics
   - Outcome measures used

2. **Meta-Analysis** (if appropriate)
   - Effect size calculation
   - Model selection (fixed vs random)
   - Heterogeneity assessment (I², τ², Q)
   - Forest plot generation
   - Prediction interval calculation

3. **Subgroup Analysis**
   - Pre-specified subgroups only
   - Test for subgroup differences
   - Interpret cautiously

4. **Sensitivity Analysis**
   - Exclude high risk of bias studies
   - Change meta-analysis model
   - Exclude outliers
   - Compare results

5. **Publication Bias Assessment** (if k≥10)
   - Funnel plot
   - Egger's test
   - Trim-and-fill
   - Interpret cautiously

6. **GRADE Assessment**
   - Rate certainty of evidence
   - Consider: risk of bias, inconsistency, indirectness, imprecision, publication bias
   - Assign rating: High, Moderate, Low, Very Low

**Outputs**:
- Descriptive synthesis
- Meta-analysis results (pooled effects, CIs)
- Forest plots
- Heterogeneity statistics
- Subgroup analysis results
- Sensitivity analysis results
- Publication bias assessment
- GRADE evidence profile

**Memory Storage**:
- Working memory: Analysis results, statistics
- Long-term memory: Forest plots, GRADE table
- Episodic memory: Analysis decisions, model choices

**Quality Gate**:
- ✅ Appropriate effect measures used
- ✅ Heterogeneity assessed and interpreted
- ✅ Pre-specified analyses conducted
- ✅ GRADE assessment completed
- ✅ Results verified (no calculation errors)

**Checkpoint**: Save state (stage: analysis_complete)

---

### Stage 8: Manuscript Writing
**Agent**: Writer Agent
**Duration**: 4-8 weeks
**Memory**: Working + Long-term + Episodic

**Steps**:
1. **Outline Generation**
   - PRISMA 2020 structure
   - Section headings
   - Key messages per section

2. **Section Writing** (Citation-First Approach)
   - **Title**: Identify as systematic review
   - **Abstract**: Structured (Background, Methods, Results, Conclusions)
   - **Introduction**: Rationale, objectives (PICO)
   - **Methods**: All PRISMA items (eligibility, search, selection, extraction, synthesis)
   - **Results**: PRISMA flow, study characteristics, RoB, synthesis results
   - **Discussion**: Summary, limitations, implications
   - **Conclusion**: Key findings, certainty of evidence

3. **Citation Management** (Bibliography Agent)
   - Verify all citations
   - Format references (journal style)
   - Check for citation errors
   - Generate bibliography

4. **Tables and Figures**
   - PRISMA flow diagram
   - Study characteristics table
   - Risk of bias table/graph
   - Forest plots
   - GRADE evidence profile

5. **Appendices**
   - Search strategies (all databases)
   - Excluded studies list
   - Data extraction form
   - Additional forest plots

**Outputs**:
- Complete manuscript (PRISMA-compliant)
- Tables and figures
- Appendices
- Bibliography
- PRISMA checklist (completed)

**Memory Storage**:
- Working memory: Manuscript sections, writing progress
- Long-term memory: Final manuscript, tables, figures
- Episodic memory: Writing decisions, revisions

**Quality Gate**:
- ✅ All PRISMA items addressed (27/27)
- ✅ Citation-first approach used (every claim cited)
- ✅ All citations verified
- ✅ Tables/figures complete and accurate
- ✅ PRISMA checklist completed

**Checkpoint**: Save state (stage: manuscript_complete)

---

### Stage 9: Quality Assurance
**Agent**: Critique Agent
**Duration**: 1-2 weeks
**Memory**: All tiers (comprehensive review)

**Steps**:
1. **PRISMA Compliance Check**
   - Verify all 27 items addressed
   - Check completeness of reporting
   - Identify gaps

2. **Anti-Hallucination Audit**
   - Verify every claim has citation
   - Check citation accuracy (PMID/DOI valid)
   - Verify confidence scores (≥0.8 threshold)
   - Flag unsupported statements

3. **Methodological Review**
   - Search strategy adequacy
   - Selection process rigor
   - Data extraction quality
   - Analysis appropriateness
   - GRADE assessment accuracy

4. **Statistical Review**
   - Verify calculations
   - Check forest plots
   - Assess heterogeneity interpretation
   - Review sensitivity analyses

5. **Writing Quality**
   - Clarity and conciseness
   - Logical flow
   - Grammar and style
   - Consistency

6. **Issue Report Generation**
   - Critical issues (must fix)
   - Major issues (should fix)
   - Minor issues (consider fixing)
   - Suggestions (optional)

**Outputs**:
- QA report (issues by severity)
- PRISMA compliance checklist
- Anti-hallucination audit results
- Recommendations for revision

**Memory Storage**:
- Working memory: QA findings
- Long-term memory: QA report
- Episodic memory: QA process, issues identified

**Quality Gate**:
- ✅ No critical issues
- ✅ PRISMA compliance ≥95%
- ✅ Anti-hallucination audit passed (≥0.8 confidence)
- ✅ Statistical review passed

**Checkpoint**: Save state (stage: qa_complete)

---

### Stage 10: Revision & Finalization
**Agent**: Writer Agent + Critique Agent
**Duration**: 1-2 weeks
**Memory**: Working + Long-term

**Steps**:
1. **Address QA Issues**
   - Fix critical issues (required)
   - Fix major issues (recommended)
   - Consider minor issues and suggestions

2. **Re-Review**
   - Critique Agent re-checks revised sections
   - Verify issues resolved

3. **Final Formatting**
   - Journal-specific formatting
   - Reference style
   - Table/figure formatting
   - Supplementary materials

4. **Final Checks**
   - Spell check
   - Grammar check
   - Citation verification (final)
   - PRISMA checklist (final)

**Outputs**:
- Final manuscript (publication-ready)
- Supplementary materials
- PRISMA checklist (completed)
- Cover letter (if needed)

**Memory Storage**:
- Long-term memory: Final manuscript, all materials
- Episodic memory: Revision process, final decisions

**Quality Gate**:
- ✅ All QA issues addressed
- ✅ Final review passed
- ✅ Manuscript formatted correctly
- ✅ User approval obtained

**Checkpoint**: Save state (stage: finalized)

---

### Stage 11: Session Closure
**Agent**: Master Agent
**Duration**: 5-10 minutes
**Memory**: All tiers (archival)

**Steps**:
1. **Final Checkpoint**
   - Save complete session state
   - Archive all memory tiers
   - Generate session summary

2. **Deliverables Package**
   - Final manuscript
   - Supplementary materials
   - Data extraction database
   - Analysis scripts (R code)
   - PRISMA checklist
   - Session summary

3. **Archive Creation**
   - Compress all files
   - Generate manifest
   - Store in long-term memory

4. **Session Report**
   - Timeline summary
   - Key decisions
   - Challenges encountered
   - Recommendations for future reviews

**Outputs**:
- Complete deliverables package
- Session archive
- Session report

**Memory Storage**:
- Long-term memory: Complete archive
- Episodic memory: Full session history

**Quality Gate**:
- ✅ All deliverables complete
- ✅ Archive created successfully
- ✅ Session report generated
- ✅ User satisfaction confirmed

**Checkpoint**: Save state (stage: closed)

---

## Session Resumption

### When to Resume
- Session interrupted (user unavailable, technical issues)
- Multi-day/multi-week reviews
- Awaiting external inputs (author responses, full texts)

### How to Resume

**Step 1: Load Checkpoint**
```
Master Agent loads most recent checkpoint
Restores memory state (all tiers)
Identifies current stage
```

**Step 2: Context Refresh**
```
Review episodic memory (what happened before)
Load working memory (current tasks)
Refresh long-term memory (key decisions, data)
```

**Step 3: Status Update**
```
Present summary to user:
- Current stage
- Completed tasks
- Pending tasks
- Next steps
```

**Step 4: Continue Workflow**
```
Resume from current stage
Proceed with next steps
```

### Resumption Example

**User**: "Resume session ABC123"

**Master Agent**:
> "Resuming session ABC123 (started 2025-11-15)
> 
> **Current Stage**: Data Extraction (Stage 5)
> 
> **Completed**:
> - Question refined: "Effectiveness of CBT for depression in adults"
> - Protocol developed and registered (PROSPERO CRD42024123456)
> - Search completed: 1,247 citations identified
> - Screening completed: 23 studies included
> - Pilot extraction completed (5 studies)
> 
> **In Progress**:
> - Full data extraction: 5/23 studies completed
> 
> **Next Steps**:
> - Complete extraction for remaining 18 studies
> - Contact authors for missing data
> - Verify extracted data
> 
> Ready to continue?"

---

## Timeline Estimates

| Stage | Duration | Depends On |
|-------|----------|------------|
| 0. Initialization | 5-10 min | - |
| 1. Question Refinement | 15-30 min | Complexity of question |
| 2. Protocol Development | 1-2 hours | Review type, complexity |
| 3. Literature Search | 2-4 hours + 1-2 weeks | Number of databases, full-text access |
| 4. Study Selection | 2-6 weeks | Number of citations |
| 5. Data Extraction | 4-8 weeks | Number of studies, complexity |
| 6. Risk of Bias | 2-4 weeks | Number of studies |
| 7. Analysis | 2-4 weeks | Complexity, meta-analysis |
| 8. Manuscript Writing | 4-8 weeks | Length, complexity |
| 9. Quality Assurance | 1-2 weeks | Number of issues |
| 10. Revision | 1-2 weeks | Number of issues |
| 11. Closure | 5-10 min | - |
| **Total** | **4-8 months** | **Typical: 6 months** |

---

## Quality Gates Summary

Each stage has specific quality gates that must be passed before proceeding:

✅ **Stage 1**: Question specific, PICO/SPIDER complete, feasible, user approved
✅ **Stage 2**: Protocol complete, comprehensive, pre-specified, user approved
✅ **Stage 3**: All databases searched, documented, deduplicated
✅ **Stage 4**: Dual screening, conflicts resolved, PRISMA flow complete
✅ **Stage 5**: Dual extraction, verified, missing data documented
✅ **Stage 6**: Appropriate tool, dual assessment, evidence-supported
✅ **Stage 7**: Appropriate methods, heterogeneity assessed, GRADE complete
✅ **Stage 8**: PRISMA-compliant, citation-first, all items addressed
✅ **Stage 9**: No critical issues, ≥0.8 confidence, PRISMA ≥95%
✅ **Stage 10**: All issues addressed, final review passed, user approved
✅ **Stage 11**: All deliverables complete, archive created

**Failure to pass quality gate**: STOP → Report issues → Propose fix → Request approval → Fix → Re-check

---

## Agent Handoffs

### Master Agent → Question Agent
**Trigger**: User provides initial research question
**Handoff**: Research question, review type, user preferences
**Return**: Refined question, PICO/SPIDER, feasibility assessment

### Master Agent → Protocol Agent
**Trigger**: Question refinement approved
**Handoff**: PICO/SPIDER, refined question, user preferences
**Return**: Complete protocol, search strategies, extraction form

### Master Agent → Research Agent
**Trigger**: Protocol approved
**Handoff**: Protocol, search strategies, eligibility criteria
**Return**: Citation library, screening results, extraction database

### Research Agent → Search Sub-Agent
**Trigger**: Search execution needed
**Handoff**: Search strategies, database list
**Return**: Citation library, search documentation

### Research Agent → Screening Sub-Agent
**Trigger**: Screening needed
**Handoff**: Citation library, eligibility criteria
**Return**: Included studies, exclusion log, PRISMA flow

### Research Agent → Extraction Sub-Agent
**Trigger**: Extraction needed
**Handoff**: Included studies, extraction form
**Return**: Extraction database, characteristics table, RoB assessments

### Master Agent → Statistician Agent
**Trigger**: Extraction complete
**Handoff**: Extraction database, analysis plan
**Return**: Analysis results, forest plots, GRADE table

### Master Agent → Writer Agent
**Trigger**: Analysis complete
**Handoff**: All data, analysis results, protocol
**Return**: Complete manuscript, tables, figures

### Writer Agent → Bibliography Agent
**Trigger**: Citation management needed
**Handoff**: Citation list, manuscript
**Return**: Verified citations, formatted bibliography

### Master Agent → Critique Agent
**Trigger**: Manuscript complete
**Handoff**: Complete manuscript, all materials
**Return**: QA report, issue list, recommendations

### Critique Agent → Writer Agent
**Trigger**: Revisions needed
**Handoff**: QA report, issue list
**Return**: Revised manuscript

---

## Version Control
- **Version**: 1.0
- **Last Updated**: 2025-12-03
- **Maintained By**: MedResearch AI System
- **Review Cycle**: Quarterly updates to align with workflow improvements
