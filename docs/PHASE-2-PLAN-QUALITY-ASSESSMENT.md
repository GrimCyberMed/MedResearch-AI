# Phase 2: Quality Assessment Framework

**Project**: MedResearch-AI  
**Phase**: Phase 2 - Design-Specific Quality Assessment  
**Version**: 6.1.0 (planned)  
**Date**: December 6, 2025  
**Status**: 📋 PLANNING

---

## 🎯 Mission

Build a comprehensive quality assessment framework that automatically selects and applies the appropriate quality assessment tool based on the study design detected by the Phase 1 classifier.

---

## 📋 Overview

### What We're Building

A **design-specific quality assessment system** that:
1. Receives study design classification from Phase 1
2. Selects appropriate quality assessment tool (RoB 2, ROBINS-I, QUADAS-2, etc.)
3. Extracts relevant data from study text
4. Applies quality criteria
5. Generates quality scores and recommendations
6. Flags high-risk studies for exclusion

### Why This Matters

- **PRISMA 2020 Requirement**: Systematic reviews must assess study quality
- **Evidence Grading**: Quality assessment determines evidence strength
- **Bias Detection**: Identifies methodological flaws that could bias results
- **Transparency**: Provides clear rationale for including/excluding studies

---

## 🏗️ Architecture

### Integration with Phase 1

```
Study Input (Title + Abstract)
         ↓
Phase 1: Study Design Classifier
         ↓
Study Design Type (e.g., "rct_parallel")
         ↓
Phase 2: Quality Assessment Framework
         ↓
    ┌─────────────────────────────────┐
    │  Tool Selection Engine          │
    │  - RCT → RoB 2                  │
    │  - Cohort → ROBINS-I            │
    │  - Diagnostic → QUADAS-2        │
    │  - SR → AMSTAR-2                │
    └─────────────────────────────────┘
         ↓
    Selected Quality Tool
         ↓
    Data Extraction & Scoring
         ↓
    Quality Report + Risk Assessment
```

### Quality Tools by Design

| Study Design | Quality Tool | Domains | Output |
|--------------|-------------|---------|--------|
| RCT (all types) | RoB 2 | 5 domains | Low/Some concerns/High risk |
| Cohort, Case-Control | ROBINS-I | 7 domains | Low/Moderate/Serious/Critical risk |
| Cross-Sectional | Newcastle-Ottawa | 3 domains | 0-9 stars |
| Diagnostic Accuracy | QUADAS-2 | 4 domains | Low/High/Unclear risk |
| Systematic Review | AMSTAR-2 | 16 items | High/Moderate/Low/Critically low |
| Qualitative | CASP Qualitative | 10 items | Yes/No/Can't tell |
| Case Report/Series | JBI Critical Appraisal | 8-10 items | Yes/No/Unclear/Not applicable |

---

## 📊 Phase 2 Breakdown

### Phase 2.1: Tool Selection Engine (1 day)

**Goal**: Automatically select the appropriate quality assessment tool based on study design.

**Tasks**:
1. Create tool mapping configuration
2. Implement tool selection logic
3. Handle edge cases (unknown designs, multiple tools)
4. Add fallback mechanisms

**Deliverables**:
- `src/mcp/tools/quality-tool-selector.ts`
- Tool mapping configuration
- Unit tests (10+ test cases)

### Phase 2.2: RoB 2 Implementation (2 days)

**Goal**: Implement Cochrane Risk of Bias 2 tool for RCTs.

**RoB 2 Domains**:
1. Randomization process
2. Deviations from intended interventions
3. Missing outcome data
4. Measurement of the outcome
5. Selection of the reported result

**Tasks**:
1. Create RoB 2 domain extractors
2. Implement signaling questions
3. Build risk assessment algorithm
4. Generate structured output

**Deliverables**:
- `src/mcp/tools/quality/rob2-assessor.ts`
- Domain-specific extractors
- Risk calculation logic
- Test suite (20+ RCTs)

### Phase 2.3: ROBINS-I Implementation (2 days)

**Goal**: Implement ROBINS-I tool for observational studies.

**ROBINS-I Domains**:
1. Bias due to confounding
2. Bias in selection of participants
3. Bias in classification of interventions
4. Bias due to deviations from intended interventions
5. Bias due to missing data
6. Bias in measurement of outcomes
7. Bias in selection of the reported result

**Tasks**:
1. Create ROBINS-I domain extractors
2. Implement signaling questions
3. Build risk assessment algorithm
4. Generate structured output

**Deliverables**:
- `src/mcp/tools/quality/robins-i-assessor.ts`
- Domain-specific extractors
- Risk calculation logic
- Test suite (15+ observational studies)

### Phase 2.4: Additional Tools (3 days)

**Goal**: Implement remaining quality assessment tools.

**Tools to Implement**:
1. **QUADAS-2** (Diagnostic Accuracy) - 1 day
2. **AMSTAR-2** (Systematic Reviews) - 1 day
3. **Newcastle-Ottawa Scale** (Cross-Sectional) - 0.5 day
4. **CASP Qualitative** (Qualitative Studies) - 0.5 day

**Tasks**:
1. Implement each tool following RoB 2 pattern
2. Create domain extractors
3. Build assessment algorithms
4. Test on real studies

**Deliverables**:
- `src/mcp/tools/quality/quadas2-assessor.ts`
- `src/mcp/tools/quality/amstar2-assessor.ts`
- `src/mcp/tools/quality/newcastle-ottawa-assessor.ts`
- `src/mcp/tools/quality/casp-qualitative-assessor.ts`
- Test suites for each tool

### Phase 2.5: Integration & Testing (2 days)

**Goal**: Integrate all quality tools with Phase 1 classifier and test end-to-end.

**Tasks**:
1. Create unified quality assessment interface
2. Integrate with study design classifier
3. Build quality report generator
4. Test on diverse study types
5. Performance optimization

**Deliverables**:
- `src/mcp/tools/assess-study-quality.ts` (main MCP tool)
- Integration tests (50+ studies)
- Performance benchmarks
- Documentation

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tool Selection Accuracy | 95%+ | Correct tool for study design |
| Domain Extraction Accuracy | 80%+ | Correctly identify risk domains |
| Risk Assessment Agreement | 70%+ | Agreement with manual assessment |
| Performance | <500ms | Average assessment time |
| Coverage | 7+ tools | Number of quality tools implemented |
| Test Coverage | 100+ studies | Diverse study types tested |

---

## 📁 File Structure

```
src/mcp/tools/
├── assess-study-quality.ts          # Main MCP tool (unified interface)
├── quality-tool-selector.ts         # Tool selection engine
└── quality/
    ├── rob2-assessor.ts             # RoB 2 for RCTs
    ├── robins-i-assessor.ts         # ROBINS-I for observational
    ├── quadas2-assessor.ts          # QUADAS-2 for diagnostic
    ├── amstar2-assessor.ts          # AMSTAR-2 for systematic reviews
    ├── newcastle-ottawa-assessor.ts # Newcastle-Ottawa for cross-sectional
    ├── casp-qualitative-assessor.ts # CASP for qualitative
    ├── jbi-case-assessor.ts         # JBI for case reports/series
    └── quality-types.ts             # Shared types and interfaces

tests/
├── test-quality-tool-selector.js    # Tool selection tests
├── test-rob2-assessor.js            # RoB 2 tests
├── test-robins-i-assessor.js        # ROBINS-I tests
├── test-quality-integration.js      # End-to-end tests
└── test-quality-extended.js         # Extended test suite (100+ studies)

docs/
├── PHASE-2-COMPLETION-V6.1.0.md     # Phase 2 completion summary
├── PHASE-2-TEST-RESULTS-V6.1.0.md   # Detailed test results
└── QUALITY-ASSESSMENT-GUIDE.md      # User guide for quality assessment
```

---

## 🔧 Technical Approach

### 1. Tool Selection Engine

```typescript
interface QualityToolSelector {
  selectTool(studyDesign: StudyDesignType): QualityTool;
  getToolMetadata(tool: QualityTool): ToolMetadata;
  getSupportedDesigns(): StudyDesignType[];
}

enum QualityTool {
  ROB2 = 'rob2',
  ROBINS_I = 'robins_i',
  QUADAS2 = 'quadas2',
  AMSTAR2 = 'amstar2',
  NEWCASTLE_OTTAWA = 'newcastle_ottawa',
  CASP_QUALITATIVE = 'casp_qualitative',
  JBI_CASE = 'jbi_case',
}
```

### 2. Quality Assessor Interface

```typescript
interface QualityAssessor {
  assess(study: StudyInput): QualityAssessment;
  extractDomains(study: StudyInput): DomainData[];
  calculateRisk(domains: DomainData[]): RiskLevel;
  generateReport(assessment: QualityAssessment): string;
}

interface QualityAssessment {
  tool: QualityTool;
  overallRisk: RiskLevel;
  domains: DomainAssessment[];
  recommendations: string[];
  requiresReview: boolean;
  confidence: number;
}
```

### 3. Domain Extraction

```typescript
interface DomainExtractor {
  extractDomain(text: string, domain: Domain): DomainData;
  findSignalingQuestions(text: string): SignalingQuestion[];
  assessRisk(answers: SignalingQuestion[]): RiskLevel;
}
```

---

## 🎓 Quality Assessment Tools Reference

### RoB 2 (Cochrane Risk of Bias 2)
- **Purpose**: Assess bias in RCTs
- **Domains**: 5 (randomization, deviations, missing data, measurement, selection)
- **Output**: Low/Some concerns/High risk per domain + overall
- **Reference**: https://www.riskofbias.info/welcome/rob-2-0-tool

### ROBINS-I (Risk Of Bias In Non-randomized Studies - of Interventions)
- **Purpose**: Assess bias in observational studies
- **Domains**: 7 (confounding, selection, classification, deviations, missing data, measurement, selection)
- **Output**: Low/Moderate/Serious/Critical risk per domain + overall
- **Reference**: https://www.riskofbias.info/welcome/robins-i-tool

### QUADAS-2 (Quality Assessment of Diagnostic Accuracy Studies)
- **Purpose**: Assess bias in diagnostic accuracy studies
- **Domains**: 4 (patient selection, index test, reference standard, flow/timing)
- **Output**: Low/High/Unclear risk per domain
- **Reference**: https://www.bristol.ac.uk/population-health-sciences/projects/quadas/quadas-2/

### AMSTAR-2 (A MeaSurement Tool to Assess systematic Reviews)
- **Purpose**: Assess quality of systematic reviews
- **Items**: 16 (7 critical, 9 non-critical)
- **Output**: High/Moderate/Low/Critically low confidence
- **Reference**: https://amstar.ca/Amstar-2.php

---

## 📊 Expected Outcomes

### Phase 2 Deliverables

1. **7+ Quality Assessment Tools** implemented and tested
2. **Tool Selection Engine** with 95%+ accuracy
3. **100+ Test Cases** covering diverse study types
4. **Comprehensive Documentation** for each tool
5. **MCP Integration** seamless with Phase 1 classifier
6. **Performance** <500ms average assessment time

### Integration with Phase 1

```
Input: Study (Title + Abstract + Full Text)
         ↓
Phase 1: classify_study_design
         ↓
Output: { design: "rct_parallel", confidence: 0.85 }
         ↓
Phase 2: assess_study_quality
         ↓
Output: {
  tool: "rob2",
  overallRisk: "low",
  domains: [
    { name: "Randomization", risk: "low", confidence: 0.9 },
    { name: "Deviations", risk: "some_concerns", confidence: 0.7 },
    ...
  ],
  recommendations: [
    "Study has low risk of bias overall",
    "Some concerns about deviations from protocol"
  ]
}
```

---

## 🚀 Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 2.1: Tool Selection | 1 day | Tool selector + tests |
| 2.2: RoB 2 | 2 days | RoB 2 assessor + tests |
| 2.3: ROBINS-I | 2 days | ROBINS-I assessor + tests |
| 2.4: Additional Tools | 3 days | 4 more tools + tests |
| 2.5: Integration | 2 days | Integration + docs |
| **Total** | **10 days** | **7+ tools, 100+ tests** |

---

## 🎯 Success Criteria

- ✅ **Tool Selection**: 95%+ accuracy on study design → tool mapping
- ✅ **Domain Extraction**: 80%+ accuracy on identifying risk domains
- ✅ **Risk Assessment**: 70%+ agreement with manual assessment
- ✅ **Performance**: <500ms average assessment time
- ✅ **Coverage**: 7+ quality tools implemented
- ✅ **Testing**: 100+ diverse studies tested
- ✅ **Integration**: Seamless with Phase 1 classifier
- ✅ **Documentation**: Comprehensive guides for each tool

---

## 🔮 Future Enhancements (v6.2.0)

1. **Machine Learning**: Train ML models on expert assessments
2. **Confidence Scoring**: Improve confidence in domain extraction
3. **Multi-Language**: Support non-English studies
4. **Custom Tools**: Allow users to define custom quality criteria
5. **Batch Assessment**: Assess multiple studies in parallel
6. **Visual Reports**: Generate charts and graphs for quality assessment
7. **Export Formats**: Export to RevMan, Covidence, etc.

---

## 📚 References

1. Cochrane Risk of Bias 2: https://www.riskofbias.info/welcome/rob-2-0-tool
2. ROBINS-I: https://www.riskofbias.info/welcome/robins-i-tool
3. QUADAS-2: https://www.bristol.ac.uk/population-health-sciences/projects/quadas/quadas-2/
4. AMSTAR-2: https://amstar.ca/Amstar-2.php
5. Newcastle-Ottawa Scale: http://www.ohri.ca/programs/clinical_epidemiology/oxford.asp
6. CASP Checklists: https://casp-uk.net/casp-tools-checklists/
7. JBI Critical Appraisal: https://jbi.global/critical-appraisal-tools

---

**Prepared by**: AI Development Team  
**Date**: December 6, 2025  
**Version**: 6.1.0 (planned)  
**Status**: 📋 PLANNING - Ready to begin Phase 2.1
