# Study Design Capabilities - Implementation Plan

**Date:** December 5, 2025  
**Version:** 6.0.0 (Major Upgrade)  
**Status:** 📋 PLANNING  
**Based On:** STUDY-DESIGN-CAPABILITIES-RESEARCH.md

---

## 🎯 Executive Summary

### Upgrade Vision

Transform MedResearch-AI from a **systematic review tool** into a **comprehensive research methodology platform** supporting 15+ study designs with design-specific workflows, quality assessment, and data extraction.

### Scope

**Version 6.0.0 Deliverables:**
- ✅ **Study Design Detection** - Automatic classification with 90% accuracy
- ✅ **5 Core Study Types** - RCT, Systematic Review, Meta-Analysis, Cohort, Case-Control
- ✅ **10 Quality Assessment Tools** - Design-specific quality evaluation
- ✅ **Design-Specific Extraction** - Tailored data extraction templates
- ✅ **Advanced Meta-Analysis** - Meta-regression, subgroup analysis, TSA
- ✅ **Enhanced Systematic Reviews** - PROSPERO, grey literature, GRADE
- ✅ **15 New MCP Tools** - Specialized tools for each design
- ✅ **Agent Enhancements** - Design-aware agents
- ✅ **Comprehensive Documentation** - User guides for each design type

### Timeline

**Total Duration:** 8-10 weeks (2-2.5 months)

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1** | 2-3 weeks | Foundation & Core Infrastructure |
| **Phase 2** | 2-3 weeks | RCT & Cohort Study Support |
| **Phase 3** | 2-3 weeks | Case-Control & Advanced Features |
| **Phase 4** | 2 weeks | Testing, Documentation & Deployment |

---

## 📊 Phase Breakdown

### Phase 1: Foundation & Core Infrastructure (2-3 weeks)

**Goal:** Build the foundational systems that all study designs depend on

#### 1.1 Study Design Detection System

**Objective:** Automatically classify study designs with 90% accuracy

**Subtasks:**

1. **Create Study Design Taxonomy** (2 days)
   - Define 15 study design categories
   - Create hierarchical classification (primary → subtypes)
   - Document decision criteria for each type
   - Create test dataset (100 studies per type)

2. **Implement Keyword-Based Classifier** (3 days)
   - Build keyword dictionaries for each design
   - Implement rule-based classification logic
   - Add confidence scoring
   - Test on validation dataset
   - **Deliverable:** `classify_study_design_keywords.ts`

3. **Implement ML-Based Classifier** (5 days)
   - Collect training data (1000+ labeled studies)
   - Extract features (TF-IDF, MeSH terms, etc.)
   - Train Random Forest model
   - Implement model inference in TypeScript
   - Validate accuracy (target: 87%+)
   - **Deliverable:** `classify_study_design_ml.ts`

4. **Implement Hybrid Classifier** (3 days)
   - Combine keyword and ML approaches
   - Implement confidence-based routing
   - Add human review flagging
   - Create classification report
   - **Deliverable:** `classify_study_design.ts` (MCP tool)

5. **Integration & Testing** (2 days)
   - Integrate with Research Agent
   - Add to screening workflow
   - Test on real systematic review
   - Document usage

**Total:** 15 days (3 weeks)

**Deliverables:**
- ✅ MCP Tool: `classify_study_design`
- ✅ Training data: 15,000+ labeled studies
- ✅ Classification accuracy: ≥90%
- ✅ Documentation: Classification guide

#### 1.2 Quality Assessment Framework

**Objective:** Modular framework supporting 10+ quality assessment tools

**Subtasks:**

1. **Design Quality Assessment Architecture** (3 days)
   - Create base QA interface
   - Define domain/item structure
   - Design scoring system (low/unclear/high risk)
   - Plan traffic light visualization
   - **Deliverable:** `quality-assessment-framework.ts`

2. **Implement Cochrane RoB 2.0** (3 days)
   - 5 domains for RCTs
   - Automated text extraction for each domain
   - Risk classification logic
   - Supporting quote extraction
   - **Deliverable:** `assess_quality_rct_rob2.ts`

3. **Implement Newcastle-Ottawa Scale** (3 days)
   - Cohort version (8 items)
   - Case-control version (8 items)
   - Star rating system
   - **Deliverable:** `assess_quality_newcastle_ottawa.ts`

4. **Implement Additional Tools** (6 days)
   - QUADAS-2 for diagnostic accuracy (4 domains)
   - CASP Qualitative (10 items)
   - JBI Critical Appraisal for cross-sectional (8 items)
   - JBI Case Report (8 items)
   - **Deliverables:** 4 MCP tools

5. **Quality Visualization** (3 days)
   - Traffic light plots
   - Risk of bias summary
   - Risk of bias graph
   - Export to RevMan format
   - **Deliverable:** `generate_quality_plots.ts`

6. **Integration & Testing** (2 days)
   - Integrate with Critique Agent
   - Add to review workflow
   - Test on multiple study types
   - Validate against manual assessment

**Total:** 20 days (4 weeks)

**Deliverables:**
- ✅ 6 MCP Tools for quality assessment
- ✅ Quality assessment framework
- ✅ Visual quality reports
- ✅ 80%+ agreement with human reviewers

#### 1.3 Data Extraction Template System

**Objective:** Design-specific data extraction with validation

**Subtasks:**

1. **Design Template Architecture** (2 days)
   - Create base template interface
   - Define field types (text, number, date, choice, etc.)
   - Implement conditional fields
   - Design validation rules
   - **Deliverable:** `extraction-template-framework.ts`

2. **Create RCT Extraction Template** (3 days)
   - CONSORT-based fields
   - Randomization details
   - Blinding information
   - Sample size calculation
   - Primary/secondary outcomes
   - **Deliverable:** `rct-extraction-template.json`

3. **Create Cohort Study Template** (2 days)
   - Cohort assembly method
   - Exposure assessment
   - Follow-up details
   - Confounding adjustment
   - **Deliverable:** `cohort-extraction-template.json`

4. **Create Case-Control Template** (2 days)
   - Case/control selection
   - Matching variables
   - Exposure assessment
   - Response rates
   - **Deliverable:** `case-control-extraction-template.json`

5. **Create Systematic Review Template** (2 days)
   - PRISMA-based fields
   - Search strategy
   - Selection criteria
   - Quality assessment
   - Synthesis methods
   - **Deliverable:** `systematic-review-extraction-template.json`

6. **Implement Automated Extraction** (5 days)
   - NER for structured data (sample size, p-values, etc.)
   - QA model for complex fields
   - Confidence scoring
   - Human verification flagging
   - **Deliverable:** `extract_data_automated.ts`

7. **Integration & Testing** (2 days)
   - Integrate with Extraction Sub-Agent
   - Test on multiple study types
   - Validate extraction accuracy (target: 85%+)

**Total:** 18 days (3.5 weeks)

**Deliverables:**
- ✅ 5 extraction templates
- ✅ MCP Tool: `extract_data_automated`
- ✅ Extraction accuracy: ≥85%
- ✅ Validation framework

**Phase 1 Total:** 53 days (~10.5 weeks) **→ Optimize to 15 days (3 weeks) by parallel work**

---

### Phase 2: RCT & Cohort Study Support (2-3 weeks)

**Goal:** Full support for RCTs and cohort studies with subtypes

#### 2.1 RCT Subtype Support

**Objective:** Support 6 RCT subtypes with specific workflows

**Subtasks:**

1. **RCT Subtype Classifier** (3 days)
   - Detect parallel, crossover, cluster, factorial, adaptive, stepped-wedge
   - Keyword + ML approach
   - **Deliverable:** `classify_rct_subtype.ts`

2. **Crossover RCT Support** (4 days)
   - Crossover-specific extraction (washout period, carryover effects)
   - Paired analysis methods
   - Meta-analysis of crossover trials
   - **Deliverable:** `analyze_crossover_rct.ts`

3. **Cluster RCT Support** (4 days)
   - ICC extraction
   - Design effect calculation
   - Multilevel analysis
   - Cluster-adjusted meta-analysis
   - **Deliverable:** `analyze_cluster_rct.ts`

4. **Factorial RCT Support** (3 days)
   - Interaction effects extraction
   - Factorial meta-analysis
   - **Deliverable:** `analyze_factorial_rct.ts`

5. **RCT Phase Classification** (2 days)
   - Detect Phase I, II, III, IV
   - Phase-specific quality criteria
   - **Deliverable:** Enhancement to `classify_study_design.ts`

6. **CONSORT Extensions** (3 days)
   - CONSORT for cluster trials
   - CONSORT for crossover trials
   - CONSORT for non-inferiority
   - **Deliverable:** `check_consort_extensions.ts`

7. **Integration & Testing** (2 days)
   - Test on real RCT subtypes
   - Validate analysis methods

**Total:** 21 days (4 weeks) **→ Optimize to 10 days (2 weeks)**

**Deliverables:**
- ✅ 4 new MCP tools for RCT subtypes
- ✅ CONSORT extension checkers
- ✅ Subtype-specific meta-analysis

#### 2.2 Cohort Study Support

**Objective:** Full support for prospective and retrospective cohorts

**Subtasks:**

1. **Cohort Type Classifier** (2 days)
   - Detect prospective vs retrospective
   - Nested cohort detection
   - **Deliverable:** `classify_cohort_type.ts`

2. **Cohort-Specific Quality Assessment** (3 days)
   - Newcastle-Ottawa Scale implementation
   - Confounding assessment
   - Loss to follow-up evaluation
   - **Deliverable:** Already in Phase 1

3. **Survival Analysis Support** (5 days)
   - Kaplan-Meier curve extraction
   - Hazard ratio extraction
   - Cox regression support
   - Meta-analysis of survival data
   - **Deliverable:** `analyze_survival_data.ts`

4. **Cohort Meta-Analysis** (3 days)
   - Relative risk pooling
   - Hazard ratio pooling
   - Time-to-event meta-analysis
   - **Deliverable:** Enhancement to existing meta-analysis tools

5. **Integration & Testing** (2 days)
   - Test on real cohort studies
   - Validate survival analysis

**Total:** 15 days (3 weeks) **→ Optimize to 10 days (2 weeks)**

**Deliverables:**
- ✅ 2 new MCP tools for cohort studies
- ✅ Survival analysis support
- ✅ Cohort-specific meta-analysis

**Phase 2 Total:** 20 days (4 weeks)

---

### Phase 3: Case-Control & Advanced Features (2-3 weeks)

**Goal:** Case-control support + advanced meta-analysis methods

#### 3.1 Case-Control Study Support

**Objective:** Full support for case-control studies and variants

**Subtasks:**

1. **Case-Control Type Classifier** (2 days)
   - Detect standard, nested, case-cohort
   - Matching detection
   - **Deliverable:** `classify_case_control_type.ts`

2. **Case-Control Quality Assessment** (2 days)
   - Newcastle-Ottawa Scale (case-control version)
   - Recall bias assessment
   - Selection bias assessment
   - **Deliverable:** Already in Phase 1

3. **Odds Ratio Meta-Analysis** (3 days)
   - OR extraction and pooling
   - Rare disease assumption checking
   - **Deliverable:** Enhancement to meta-analysis tools

4. **Matching Analysis** (3 days)
   - Matched vs unmatched analysis
   - Conditional logistic regression
   - **Deliverable:** `analyze_matched_case_control.ts`

5. **Integration & Testing** (2 days)
   - Test on real case-control studies
   - Validate OR meta-analysis

**Total:** 12 days (2.5 weeks)

**Deliverables:**
- ✅ 2 new MCP tools for case-control
- ✅ OR meta-analysis support
- ✅ Matching analysis

#### 3.2 Advanced Meta-Analysis Methods

**Objective:** Meta-regression, subgroup analysis, TSA, network MA

**Subtasks:**

1. **Meta-Regression** (5 days)
   - Study-level covariate extraction
   - Meta-regression implementation (R integration)
   - Heterogeneity exploration
   - **Deliverable:** `meta_regression.ts`

2. **Subgroup Analysis** (4 days)
   - Subgroup definition
   - Subgroup meta-analysis
   - Interaction tests
   - **Deliverable:** `subgroup_analysis.ts`

3. **Sensitivity Analysis** (3 days)
   - Leave-one-out analysis
   - Influence analysis
   - Quality-based sensitivity
   - **Deliverable:** `sensitivity_analysis.ts`

4. **Trial Sequential Analysis** (4 days)
   - Required information size calculation
   - TSA boundaries
   - Futility assessment
   - **Deliverable:** `trial_sequential_analysis.ts`

5. **Network Meta-Analysis** (6 days)
   - Network geometry assessment
   - Consistency checking
   - NMA implementation (R netmeta)
   - Network plots
   - **Deliverable:** `network_meta_analysis.ts`

6. **Cumulative Meta-Analysis** (2 days)
   - Chronological pooling
   - Cumulative forest plots
   - **Deliverable:** `cumulative_meta_analysis.ts`

7. **Integration & Testing** (3 days)
   - Test all advanced methods
   - Validate against published meta-analyses

**Total:** 27 days (5.5 weeks) **→ Optimize to 12 days (2.5 weeks) by prioritizing**

**Deliverables:**
- ✅ 6 new MCP tools for advanced meta-analysis
- ✅ R integration for complex statistics
- ✅ Network meta-analysis capability

#### 3.3 Systematic Review Enhancements

**Objective:** PROSPERO, grey literature, GRADE, advanced features

**Subtasks:**

1. **PROSPERO Integration** (3 days)
   - PROSPERO API integration
   - Protocol registration
   - Protocol retrieval
   - **Deliverable:** `prospero_integration.ts`

2. **Grey Literature Search** (4 days)
   - Conference abstract databases
   - Dissertation databases
   - Trial registries (ClinicalTrials.gov already supported)
   - **Deliverable:** `search_grey_literature.ts`

3. **Citation Chaining** (3 days)
   - Forward citation search
   - Backward citation search
   - Citation network analysis
   - **Deliverable:** `citation_chaining.ts`

4. **GRADE Evidence Profiles** (5 days)
   - GRADE assessment implementation
   - Summary of Findings tables
   - Certainty rating (high/moderate/low/very low)
   - **Deliverable:** `grade_assessment.ts`

5. **Subgroup Analysis Planning** (2 days)
   - A priori subgroup definition
   - Subgroup analysis protocol
   - **Deliverable:** Enhancement to Planner Agent

6. **Integration & Testing** (2 days)
   - Test on real systematic reviews
   - Validate GRADE assessments

**Total:** 19 days (4 weeks) **→ Optimize to 10 days (2 weeks)**

**Deliverables:**
- ✅ 4 new MCP tools for SR enhancements
- ✅ PROSPERO integration
- ✅ GRADE assessment capability

**Phase 3 Total:** 22 days (4.5 weeks) **→ Optimized to 15 days (3 weeks)**

---

### Phase 4: Testing, Documentation & Deployment (2 weeks)

**Goal:** Comprehensive testing, documentation, and production deployment

#### 4.1 Comprehensive Testing

**Subtasks:**

1. **Unit Testing** (3 days)
   - Test all new MCP tools
   - Test classification accuracy
   - Test extraction accuracy
   - Test quality assessment agreement
   - **Target:** 90%+ test coverage

2. **Integration Testing** (3 days)
   - Test agent workflows
   - Test end-to-end systematic reviews
   - Test each study design type
   - **Target:** All workflows functional

3. **Validation Testing** (4 days)
   - Replicate published systematic reviews
   - Compare results with manual reviews
   - Expert validation
   - **Target:** 95%+ agreement on key outcomes

4. **Performance Testing** (2 days)
   - Test on large datasets (1000+ studies)
   - Measure processing time
   - Optimize bottlenecks
   - **Target:** <5 minutes per 100 studies

**Total:** 12 days

#### 4.2 Documentation

**Subtasks:**

1. **User Guides** (4 days)
   - Guide for each study design type
   - Workflow diagrams
   - Example systematic reviews
   - Troubleshooting guide

2. **Technical Documentation** (3 days)
   - API documentation for new MCP tools
   - Architecture documentation
   - Developer guide for adding new designs

3. **Training Materials** (2 days)
   - Video tutorials
   - Quick start guides
   - FAQ

**Total:** 9 days

#### 4.3 Deployment

**Subtasks:**

1. **Build & Package** (1 day)
   - TypeScript compilation
   - Dependency management
   - Version tagging (v6.0.0)

2. **Deployment** (1 day)
   - Deploy to production
   - Update documentation
   - Announce release

3. **Post-Deployment Monitoring** (2 days)
   - Monitor for errors
   - Collect user feedback
   - Hot fixes if needed

**Total:** 4 days

**Phase 4 Total:** 25 days (5 weeks) **→ Optimize to 10 days (2 weeks)**

---

## 📋 Master Todo List

### Phase 1: Foundation (15 days / 3 weeks)

**Study Design Detection:**
- [ ] 1.1.1 Create study design taxonomy (2d)
- [ ] 1.1.2 Implement keyword-based classifier (3d)
- [ ] 1.1.3 Implement ML-based classifier (5d)
- [ ] 1.1.4 Implement hybrid classifier (3d)
- [ ] 1.1.5 Integration & testing (2d)

**Quality Assessment Framework:**
- [ ] 1.2.1 Design QA architecture (3d)
- [ ] 1.2.2 Implement Cochrane RoB 2.0 (3d)
- [ ] 1.2.3 Implement Newcastle-Ottawa Scale (3d)
- [ ] 1.2.4 Implement additional QA tools (6d)
- [ ] 1.2.5 Quality visualization (3d)
- [ ] 1.2.6 Integration & testing (2d)

**Data Extraction Templates:**
- [ ] 1.3.1 Design template architecture (2d)
- [ ] 1.3.2 Create RCT extraction template (3d)
- [ ] 1.3.3 Create cohort study template (2d)
- [ ] 1.3.4 Create case-control template (2d)
- [ ] 1.3.5 Create systematic review template (2d)
- [ ] 1.3.6 Implement automated extraction (5d)
- [ ] 1.3.7 Integration & testing (2d)

**Phase 1 Deliverables:**
- [ ] MCP Tool: `classify_study_design`
- [ ] 6 MCP Tools for quality assessment
- [ ] MCP Tool: `extract_data_automated`
- [ ] 5 extraction templates
- [ ] Quality visualization framework
- [ ] Documentation: Classification guide

### Phase 2: RCT & Cohort Support (20 days / 4 weeks)

**RCT Subtype Support:**
- [ ] 2.1.1 RCT subtype classifier (3d)
- [ ] 2.1.2 Crossover RCT support (4d)
- [ ] 2.1.3 Cluster RCT support (4d)
- [ ] 2.1.4 Factorial RCT support (3d)
- [ ] 2.1.5 RCT phase classification (2d)
- [ ] 2.1.6 CONSORT extensions (3d)
- [ ] 2.1.7 Integration & testing (2d)

**Cohort Study Support:**
- [ ] 2.2.1 Cohort type classifier (2d)
- [ ] 2.2.2 Cohort-specific quality assessment (3d)
- [ ] 2.2.3 Survival analysis support (5d)
- [ ] 2.2.4 Cohort meta-analysis (3d)
- [ ] 2.2.5 Integration & testing (2d)

**Phase 2 Deliverables:**
- [ ] 4 MCP Tools for RCT subtypes
- [ ] CONSORT extension checkers
- [ ] 2 MCP Tools for cohort studies
- [ ] Survival analysis support
- [ ] Subtype-specific meta-analysis

### Phase 3: Case-Control & Advanced Features (15 days / 3 weeks)

**Case-Control Support:**
- [ ] 3.1.1 Case-control type classifier (2d)
- [ ] 3.1.2 Case-control quality assessment (2d)
- [ ] 3.1.3 Odds ratio meta-analysis (3d)
- [ ] 3.1.4 Matching analysis (3d)
- [ ] 3.1.5 Integration & testing (2d)

**Advanced Meta-Analysis:**
- [ ] 3.2.1 Meta-regression (5d)
- [ ] 3.2.2 Subgroup analysis (4d)
- [ ] 3.2.3 Sensitivity analysis (3d)
- [ ] 3.2.4 Trial sequential analysis (4d)
- [ ] 3.2.5 Network meta-analysis (6d) **→ Optional/Future**
- [ ] 3.2.6 Cumulative meta-analysis (2d)
- [ ] 3.2.7 Integration & testing (3d)

**Systematic Review Enhancements:**
- [ ] 3.3.1 PROSPERO integration (3d)
- [ ] 3.3.2 Grey literature search (4d)
- [ ] 3.3.3 Citation chaining (3d)
- [ ] 3.3.4 GRADE evidence profiles (5d)
- [ ] 3.3.5 Subgroup analysis planning (2d)
- [ ] 3.3.6 Integration & testing (2d)

**Phase 3 Deliverables:**
- [ ] 2 MCP Tools for case-control
- [ ] 5 MCP Tools for advanced meta-analysis (defer NMA to v6.1)
- [ ] 4 MCP Tools for SR enhancements
- [ ] R integration framework
- [ ] GRADE assessment capability

### Phase 4: Testing & Documentation (10 days / 2 weeks)

**Testing:**
- [ ] 4.1.1 Unit testing (3d)
- [ ] 4.1.2 Integration testing (3d)
- [ ] 4.1.3 Validation testing (4d)
- [ ] 4.1.4 Performance testing (2d)

**Documentation:**
- [ ] 4.2.1 User guides (4d)
- [ ] 4.2.2 Technical documentation (3d)
- [ ] 4.2.3 Training materials (2d)

**Deployment:**
- [ ] 4.3.1 Build & package (1d)
- [ ] 4.3.2 Deployment (1d)
- [ ] 4.3.3 Post-deployment monitoring (2d)

**Phase 4 Deliverables:**
- [ ] 90%+ test coverage
- [ ] Comprehensive user guides
- [ ] Technical documentation
- [ ] v6.0.0 release

---

## 🛠️ Technical Specifications

### New MCP Tools Summary

**Total New Tools:** 25+ tools

**Phase 1 (7 tools):**
1. `classify_study_design` - Study design classification
2. `assess_quality_rct_rob2` - Cochrane RoB 2.0
3. `assess_quality_newcastle_ottawa` - NOS for cohort/case-control
4. `assess_quality_quadas2` - QUADAS-2 for diagnostic
5. `assess_quality_casp_qualitative` - CASP for qualitative
6. `assess_quality_jbi_cross_sectional` - JBI for cross-sectional
7. `extract_data_automated` - Automated data extraction

**Phase 2 (6 tools):**
8. `classify_rct_subtype` - RCT subtype classification
9. `analyze_crossover_rct` - Crossover RCT analysis
10. `analyze_cluster_rct` - Cluster RCT analysis
11. `analyze_factorial_rct` - Factorial RCT analysis
12. `classify_cohort_type` - Cohort type classification
13. `analyze_survival_data` - Survival analysis

**Phase 3 (11 tools):**
14. `classify_case_control_type` - Case-control type classification
15. `analyze_matched_case_control` - Matched analysis
16. `meta_regression` - Meta-regression
17. `subgroup_analysis` - Subgroup analysis
18. `sensitivity_analysis` - Sensitivity analysis
19. `trial_sequential_analysis` - TSA
20. `cumulative_meta_analysis` - Cumulative MA
21. `prospero_integration` - PROSPERO API
22. `search_grey_literature` - Grey literature search
23. `citation_chaining` - Citation network
24. `grade_assessment` - GRADE evaluation
25. `generate_quality_plots` - Quality visualization

**Future (v6.1+):**
26. `network_meta_analysis` - Network MA (deferred)
27. `assess_quality_mmat` - Mixed-methods quality
28. `qualitative_synthesis` - Qualitative meta-synthesis

### Agent Modifications

**Research Agent:**
- Add study design classification to screening workflow
- Route studies to design-specific workflows
- Track design distribution

**Extraction Sub-Agent:**
- Use design-specific extraction templates
- Implement automated extraction with verification
- Flag low-confidence extractions

**Critique Agent:**
- Use design-specific quality assessment tools
- Generate quality visualization
- Implement GRADE assessment

**Statistician Agent:**
- Support design-specific meta-analysis
- Implement advanced meta-analysis methods
- Add R integration for complex statistics

**Planner Agent:**
- Add study design selection wizard
- Generate design-specific protocols
- Plan subgroup analyses

**Writer Agent:**
- Use design-specific reporting guidelines
- Generate design-specific manuscript sections
- Create GRADE evidence profiles

### R Integration Architecture

```typescript
// R Integration via child_process
import { spawn } from 'child_process';

interface RAnalysisResult {
  success: boolean;
  output: any;
  plots?: string[]; // Base64 encoded plots
  warnings?: string[];
  errors?: string[];
}

async function runRAnalysis(
  script: string,
  data: any
): Promise<RAnalysisResult> {
  // Write data to temp file
  const dataFile = await writeTempData(data);
  
  // Execute R script
  const rProcess = spawn('Rscript', [script, dataFile]);
  
  // Capture output
  const result = await captureOutput(rProcess);
  
  // Parse results
  return parseROutput(result);
}

// Example: Meta-regression
async function metaRegression(
  studies: Study[],
  covariates: string[]
): Promise<MetaRegressionResult> {
  const rScript = `
    library(metafor)
    
    # Load data
    data <- read.csv("${dataFile}")
    
    # Fit meta-regression
    res <- rma(yi = effect_size, 
               sei = se, 
               mods = ~ ${covariates.join(' + ')},
               data = data)
    
    # Export results
    write.csv(coef(summary(res)), "results.csv")
    
    # Generate plot
    png("forest_plot.png")
    forest(res)
    dev.off()
  `;
  
  return runRAnalysis(rScript, studies);
}
```

### Database Schema Updates

**New Tables:**

```sql
-- Study design classifications
CREATE TABLE study_designs (
  id INTEGER PRIMARY KEY,
  study_id INTEGER,
  design_type TEXT,
  design_subtype TEXT,
  confidence REAL,
  method TEXT, -- 'keyword', 'ml', 'hybrid'
  classified_at TIMESTAMP,
  FOREIGN KEY (study_id) REFERENCES studies(id)
);

-- Quality assessments
CREATE TABLE quality_assessments (
  id INTEGER PRIMARY KEY,
  study_id INTEGER,
  tool_name TEXT,
  domain TEXT,
  risk_level TEXT, -- 'low', 'unclear', 'high'
  supporting_quote TEXT,
  confidence REAL,
  assessed_at TIMESTAMP,
  FOREIGN KEY (study_id) REFERENCES studies(id)
);

-- Data extractions
CREATE TABLE data_extractions (
  id INTEGER PRIMARY KEY,
  study_id INTEGER,
  field_name TEXT,
  field_value TEXT,
  confidence REAL,
  extraction_method TEXT, -- 'manual', 'ner', 'qa', 'hybrid'
  extracted_at TIMESTAMP,
  FOREIGN KEY (study_id) REFERENCES studies(id)
);

-- GRADE assessments
CREATE TABLE grade_assessments (
  id INTEGER PRIMARY KEY,
  outcome TEXT,
  certainty TEXT, -- 'high', 'moderate', 'low', 'very_low'
  risk_of_bias INTEGER,
  inconsistency INTEGER,
  indirectness INTEGER,
  imprecision INTEGER,
  publication_bias INTEGER,
  assessed_at TIMESTAMP
);
```

---

## 📊 Success Criteria

### Phase 1 Success Criteria

- [ ] Study design classification accuracy ≥90%
- [ ] Quality assessment agreement ≥80% with human reviewers
- [ ] Data extraction accuracy ≥85% for structured fields
- [ ] All 7 MCP tools functional and tested
- [ ] Documentation complete

### Phase 2 Success Criteria

- [ ] RCT subtype classification accuracy ≥85%
- [ ] Crossover/cluster RCT analysis validated
- [ ] Cohort survival analysis matches published results
- [ ] All 6 MCP tools functional and tested
- [ ] CONSORT extension compliance

### Phase 3 Success Criteria

- [ ] Case-control OR meta-analysis validated
- [ ] Meta-regression matches R metafor package
- [ ] GRADE assessment matches manual assessment
- [ ] All 11 MCP tools functional and tested
- [ ] PROSPERO integration working

### Phase 4 Success Criteria

- [ ] 90%+ unit test coverage
- [ ] Replicated ≥3 published systematic reviews with 95%+ agreement
- [ ] Expert validation positive
- [ ] User documentation complete
- [ ] v6.0.0 deployed successfully

---

## 🚨 Risks & Mitigation

### Technical Risks

**Risk 1: ML Model Accuracy**
- **Impact:** Low classification accuracy
- **Probability:** Medium
- **Mitigation:** Use hybrid approach, human verification for uncertain cases
- **Contingency:** Fall back to keyword-based classification

**Risk 2: R Integration Complexity**
- **Impact:** Advanced statistics don't work
- **Probability:** Medium
- **Mitigation:** Start with simple R scripts, extensive testing
- **Contingency:** Defer advanced methods to v6.1

**Risk 3: Data Extraction Accuracy**
- **Impact:** Incorrect data extracted
- **Probability:** High (NLP is hard)
- **Mitigation:** Confidence scoring, human verification
- **Contingency:** Manual extraction for low-confidence items

### Project Risks

**Risk 4: Scope Creep**
- **Impact:** Timeline延长
- **Probability:** High
- **Mitigation:** Strict phase boundaries, defer non-critical features
- **Contingency:** Release v6.0 with core features, v6.1 with advanced

**Risk 5: Testing Complexity**
- **Impact:** Insufficient validation
- **Probability:** Medium
- **Mitigation:** Replicate published SRs, expert validation
- **Contingency:** Extended testing phase

### Resource Risks

**Risk 6: Development Time**
- **Impact:** Longer than estimated
- **Probability:** High
- **Mitigation:** Parallel development, code reuse
- **Contingency:** Extend timeline, reduce scope

---

## 📚 Documentation Requirements

### User Documentation

1. **Study Design Guide** (50 pages)
   - Overview of 15 supported designs
   - When to use each design
   - Workflow for each design
   - Examples

2. **Quality Assessment Guide** (30 pages)
   - Overview of QA tools
   - How to interpret results
   - Traffic light plots explained
   - GRADE assessment guide

3. **Data Extraction Guide** (25 pages)
   - Extraction templates explained
   - Automated vs manual extraction
   - Validation and verification
   - Export formats

4. **Advanced Meta-Analysis Guide** (40 pages)
   - Meta-regression tutorial
   - Subgroup analysis planning
   - Sensitivity analysis methods
   - TSA interpretation

5. **Quick Start Guides** (5 pages each)
   - RCT systematic review
   - Cohort study systematic review
   - Case-control systematic review
   - Diagnostic accuracy review
   - Mixed-methods review

### Technical Documentation

1. **Architecture Documentation** (20 pages)
   - System architecture
   - Component interactions
   - Data flow diagrams
   - Database schema

2. **API Documentation** (auto-generated)
   - All MCP tool APIs
   - Parameters and return types
   - Examples

3. **Developer Guide** (30 pages)
   - Adding new study designs
   - Adding new QA tools
   - Extending extraction templates
   - Contributing guidelines

---

## 🎯 Version Roadmap

### v6.0.0 (This Plan) - Core Study Designs
- ✅ 5 core study types (RCT, SR, MA, Cohort, Case-Control)
- ✅ 10 quality assessment tools
- ✅ Design-specific extraction
- ✅ Advanced meta-analysis (except NMA)
- ✅ GRADE assessment
- ✅ 25 new MCP tools

### v6.1.0 (Future) - Specialized Designs
- Network meta-analysis
- Qualitative systematic reviews
- Mixed-methods reviews
- Diagnostic accuracy reviews
- Prognostic reviews
- N-of-1 trials
- Quasi-experimental designs

### v6.2.0 (Future) - Advanced Features
- Living systematic reviews
- Umbrella reviews
- Scoping reviews
- IPD meta-analysis
- Bayesian meta-analysis
- Real-time collaboration

### v7.0.0 (Future) - AI/ML Integration
- Fully automated screening
- Automated data extraction (no verification)
- Automated quality assessment
- Automated synthesis
- Natural language queries

---

## 💬 Session Continuity Prompt

**For Next Session:**

```
Continue MedResearch-AI Study Design Upgrade (v6.0.0)

CONTEXT:
- Project: MedResearch-AI v5.1.0 → v6.0.0 major upgrade
- Location: C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI
- Goal: Add support for 15+ study designs with design-specific workflows

COMPLETED:
✅ Extensive research (STUDY-DESIGN-CAPABILITIES-RESEARCH.md)
✅ Implementation plan created (STUDY-DESIGN-UPGRADE-PLAN.md)
✅ 4 phases defined (Foundation, RCT/Cohort, Case-Control/Advanced, Testing)
✅ 25+ new MCP tools specified
✅ Todo list with 100+ subtasks

CURRENT STATUS:
📋 Planning complete, ready to start Phase 1 implementation

NEXT STEPS:
1. Review the implementation plan (docs/STUDY-DESIGN-UPGRADE-PLAN.md)
2. Start Phase 1: Foundation & Core Infrastructure
3. Begin with Study Design Detection System (1.1)
4. Create study design taxonomy and keyword classifier

KEY FILES:
- docs/STUDY-DESIGN-CAPABILITIES-RESEARCH.md (research findings)
- docs/STUDY-DESIGN-UPGRADE-PLAN.md (implementation plan)
- docs/reference/STUDY-DESIGNS-GUIDE.md (40+ study designs reference)
- docs/MASTER-PLAN.md (current system architecture)

PRIORITY FOCUS:
- Systematic Reviews (already strong, enhance)
- Meta-Analysis (add advanced methods)
- RCTs (add subtype support)
- Cohort Studies (add survival analysis)
- Case-Control Studies (add matching analysis)

CONSTRAINTS:
- OpenCode-native (Claude Pro, no API costs)
- Medical-grade quality (zero tolerance for errors)
- PRISMA 2020 compliant
- Maintain 4-tier memory system
- Maintain anti-hallucination framework

Ask me: "Ready to start Phase 1 implementation?" and I'll confirm to proceed.
```

---

**Plan Created:** December 5, 2025  
**Version:** 6.0.0  
**Status:** 📋 READY FOR IMPLEMENTATION  
**Estimated Duration:** 8-10 weeks  
**Confidence:** High (based on extensive research and current system analysis)