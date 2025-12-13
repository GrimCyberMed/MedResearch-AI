# Quality Assessment Framework Guide

**Version**: 6.0.0-beta  
**Date**: December 6, 2025  
**Status**: Phase 2.1 - Architecture Complete

---

## 🎯 Overview

The Quality Assessment Framework provides a modular, extensible system for assessing study quality using various validated tools. It automatically selects the appropriate tool based on study design and extracts evidence from study text to support quality judgments.

---

## 🏗️ Architecture

### Core Components

1. **Base Framework** (`quality-assessment-framework.ts`)
   - Common interfaces and types
   - Base class for all quality tools
   - Evidence extraction utilities
   - Risk calculation logic

2. **Quality Tools** (Individual implementations)
   - Cochrane RoB 2.0 (RCTs)
   - Newcastle-Ottawa Scale (Cohort/Case-Control)
   - QUADAS-2 (Diagnostic Accuracy)
   - CASP (Qualitative)
   - JBI Critical Appraisal (Cross-sectional, Case Reports)
   - AMSTAR-2 (Systematic Reviews)

3. **Visualization** (`generate-quality-plots.ts`)
   - Traffic light plots
   - Risk of bias summary
   - Risk of bias graph
   - Export to RevMan format

---

## 📊 Data Model

### Quality Assessment Structure

```typescript
QualityAssessment
├── study_id: string
├── study_design: StudyDesignType
├── tool: QualityTool
├── tool_version: string
├── domains: QualityDomain[]
│   ├── id: string
│   ├── name: string
│   ├── items: QualityItem[]
│   │   ├── id: string
│   │   ├── question: string
│   │   ├── response: ResponseOption (yes/no/unclear)
│   │   ├── risk: RiskLevel (low/unclear/high)
│   │   ├── evidence: Evidence[]
│   │   │   ├── quote: string
│   │   │   ├── location: string
│   │   │   ├── confidence: number
│   │   │   └── rationale: string
│   │   └── auto_assessed: boolean
│   └── overall_risk: RiskLevel
├── overall_risk: RiskLevel
├── overall_rating: QualityRating
├── requires_review: boolean
└── confidence: number
```

---

## 🔧 Risk Levels

### Standard Risk Levels
- **LOW**: Low risk of bias
- **UNCLEAR**: Unclear risk of bias (insufficient information)
- **HIGH**: High risk of bias
- **SOME_CONCERNS**: Some concerns about bias (RoB 2.0 specific)

### Quality Ratings (Alternative to Risk)
- **GOOD**: High quality
- **FAIR**: Moderate quality
- **POOR**: Low quality
- **CRITICALLY_LOW**: Critically low quality (AMSTAR-2)

---

## 🛠️ Supported Quality Tools

### 1. Cochrane RoB 2.0 (RCTs)

**Applicable to**: All RCT designs

**Domains** (5):
1. Randomization process
2. Deviations from intended interventions
3. Missing outcome data
4. Measurement of the outcome
5. Selection of the reported result

**Output**: Low / Some concerns / High risk

**Reference**: https://www.riskofbias.info/welcome/rob-2-0-tool

---

### 2. Newcastle-Ottawa Scale (Observational)

**Applicable to**: Cohort and case-control studies

**Cohort Version** (8 items, 9 stars max):
- **Selection** (4 stars max)
  - Representativeness of exposed cohort
  - Selection of non-exposed cohort
  - Ascertainment of exposure
  - Outcome not present at start
  
- **Comparability** (2 stars max)
  - Comparability of cohorts
  
- **Outcome** (3 stars max)
  - Assessment of outcome
  - Follow-up length
  - Adequacy of follow-up

**Case-Control Version** (8 items, 9 stars max):
- **Selection** (4 stars max)
  - Case definition
  - Representativeness of cases
  - Selection of controls
  - Definition of controls
  
- **Comparability** (2 stars max)
  - Comparability of cases and controls
  
- **Exposure** (3 stars max)
  - Ascertainment of exposure
  - Same method for cases and controls
  - Non-response rate

**Output**: Good (7-9 stars) / Fair (4-6 stars) / Poor (0-3 stars)

**Reference**: http://www.ohri.ca/programs/clinical_epidemiology/oxford.asp

---

### 3. QUADAS-2 (Diagnostic Accuracy)

**Applicable to**: Diagnostic accuracy studies

**Domains** (4):
1. Patient selection
2. Index test
3. Reference standard
4. Flow and timing

**Each domain assessed for**:
- Risk of bias (low/unclear/high)
- Applicability concerns (low/unclear/high)

**Output**: Risk of bias and applicability for each domain

**Reference**: https://www.bristol.ac.uk/population-health-sciences/projects/quadas/quadas-2/

---

### 4. CASP Qualitative

**Applicable to**: All qualitative designs

**Items** (10):
1. Clear statement of aims
2. Appropriate qualitative methodology
3. Appropriate research design
4. Appropriate recruitment strategy
5. Appropriate data collection
6. Researcher-participant relationship considered
7. Ethical issues considered
8. Rigorous data analysis
9. Clear statement of findings
10. Value of the research

**Output**: Yes / Can't tell / No for each item

**Reference**: https://casp-uk.net/casp-tools-checklists/

---

### 5. JBI Critical Appraisal

**Applicable to**: Cross-sectional, case reports, case series

**Cross-Sectional** (8 items):
1. Clear inclusion criteria
2. Subjects and setting described
3. Valid and reliable exposure measurement
4. Objective standard criteria
5. Confounders identified
6. Strategies to deal with confounders
7. Valid and reliable outcome measurement
8. Appropriate statistical analysis

**Case Report** (8 items):
1. Clear patient demographics
2. Patient history clearly described
3. Current clinical condition clearly described
4. Diagnostic tests/methods clearly described
5. Intervention clearly described
6. Post-intervention condition clearly described
7. Adverse events reported
8. Take-away lessons clearly stated

**Output**: Yes / No / Unclear / Not applicable for each item

**Reference**: https://jbi.global/critical-appraisal-tools

---

### 6. AMSTAR-2 (Systematic Reviews)

**Applicable to**: Systematic reviews and meta-analyses

**Items** (16):
1. PICO components in research question
2. Protocol registered before commencement
3. Study design selection explained
4. Comprehensive literature search
5. Duplicate study selection
6. Duplicate data extraction
7. List of excluded studies
8. Included studies described in detail
9. Satisfactory technique for RoB assessment
10. Sources of funding reported
11. Appropriate meta-analysis methods
12. RoB considered in interpretation
13. RoB accounted for in discussion
14. Heterogeneity discussed
15. Publication bias investigated
16. Conflicts of interest reported

**Critical domains**: 2, 4, 7, 9, 11, 13, 15

**Output**: High / Moderate / Low / Critically low quality

**Reference**: https://amstar.ca/Amstar-2.php

---

## 🔄 Workflow Integration

### Automatic Tool Selection

```typescript
// Step 1: Classify study design
const classification = await classifyStudyDesign({
  title: study.title,
  abstract: study.abstract,
});

// Step 2: Get recommended quality tools
const tools = getRecommendedQualityTools(classification.primary_design);
// → [QualityTool.ROB2] for RCTs
// → [QualityTool.NEWCASTLE_OTTAWA_COHORT] for cohort studies

// Step 3: Assess quality
const assessment = await assessQuality({
  study_id: study.id,
  design: classification.primary_design,
  tool: tools[0],
  title: study.title,
  abstract: study.abstract,
  full_text: study.full_text,
});

// Step 4: Review if needed
if (assessment.requires_review) {
  // Flag for manual review
  console.log('Manual review needed:', assessment.review_reasons);
}
```

---

## 📈 Evidence Extraction

### How It Works

1. **Keyword Matching**: Search for domain-specific keywords in study text
2. **Sentence Extraction**: Extract sentences containing keywords
3. **Confidence Scoring**: Assign confidence based on match quality
4. **Location Tracking**: Track where evidence was found (abstract, methods, etc.)

### Example

**Domain**: Randomization process  
**Keywords**: ["random", "randomized", "randomization", "allocation"]

**Study Text**: "Patients were randomly assigned to treatment or control groups using computer-generated random numbers."

**Extracted Evidence**:
```json
{
  "quote": "Patients were randomly assigned to treatment or control groups using computer-generated random numbers",
  "location": "methods",
  "confidence": 0.9,
  "rationale": "Contains keywords: random, randomly, randomized, randomization"
}
```

---

## 🎨 Visualization

### Traffic Light Plots

Visual representation of risk of bias across studies:

```
Study 1:  🟢 🟢 🟢 🟢 🟢  → Low risk
Study 2:  🟢 🟡 🟢 🟢 🟡  → Some concerns
Study 3:  🔴 🟢 🟡 🟢 🟢  → High risk
Study 4:  🟢 🟢 🟢 🟢 🟢  → Low risk
```

### Risk of Bias Summary

Table showing percentage of studies with each risk level per domain:

| Domain | Low | Unclear | High |
|--------|-----|---------|------|
| Randomization | 75% | 15% | 10% |
| Deviations | 80% | 10% | 10% |
| Missing data | 70% | 20% | 10% |
| Measurement | 85% | 10% | 5% |
| Reporting | 65% | 25% | 10% |

---

## 🔍 Auto-Assessment Confidence

### Confidence Levels

- **High (≥0.8)**: Strong evidence found, clear judgment
- **Medium (0.6-0.8)**: Moderate evidence, some uncertainty
- **Low (<0.6)**: Weak evidence, requires manual review

### Factors Affecting Confidence

1. **Evidence Quality**: Clear vs ambiguous text
2. **Evidence Quantity**: Multiple vs single supporting quotes
3. **Keyword Matches**: Exact vs partial matches
4. **Text Completeness**: Full text vs abstract only

---

## 🚨 Manual Review Triggers

Assessment flagged for manual review if:

1. **Low Confidence**: Overall confidence <0.7
2. **High Risk**: Any domain has high risk of bias
3. **Many Unclear**: >2 items marked as unclear
4. **Missing Text**: Abstract only (no full text)
5. **Conflicting Evidence**: Evidence supports multiple judgments

---

## 📚 Best Practices

### 1. Always Provide Full Text
- Abstract-only assessments have lower confidence
- Full text enables better evidence extraction
- Methods section is critical for most domains

### 2. Review Auto-Assessments
- Auto-assessment is a starting point, not final judgment
- Always review flagged studies manually
- Verify supporting quotes are relevant

### 3. Use Appropriate Tools
- Follow tool recommendations for each study design
- Don't force a tool on an inappropriate design
- Consider using multiple tools for comprehensive assessment

### 4. Document Rationale
- Add notes explaining unclear judgments
- Document why evidence was insufficient
- Explain deviations from standard criteria

### 5. Export for Verification
- Export to RevMan for independent verification
- Share traffic light plots with team
- Maintain audit trail of all assessments

---

## 🔧 API Reference

### Main Functions

```typescript
// Get recommended tools for a study design
getRecommendedQualityTools(design: StudyDesignType): QualityTool[]

// Assess quality using a specific tool
assessQuality(params: {
  study_id: string;
  design: StudyDesignType;
  tool: QualityTool;
  title: string;
  abstract?: string;
  methods?: string;
  results?: string;
  full_text?: string;
}): Promise<QualityAssessment>

// Generate quality plots
generateQualityPlots(assessments: QualityAssessment[]): Promise<{
  traffic_light: string; // SVG
  summary_table: string; // HTML
  rob_graph: string; // SVG
}>
```

### Helper Functions

```typescript
// Create a quality item
createQualityItem(
  id: string,
  question: string,
  response: ResponseOption,
  options?: {...}
): QualityItem

// Create a quality domain
createQualityDomain(
  id: string,
  name: string,
  items: QualityItem[],
  options?: {...}
): QualityDomain
```

---

## 📖 Examples

### Example 1: Assess RCT Quality

```typescript
import { classifyStudyDesign } from './classify-study-design.js';
import { assessQualityRoB2 } from './assess-quality-rct-rob2.js';

// Classify study
const classification = await classifyStudyDesign({
  title: 'Efficacy of Drug X: A Randomized Controlled Trial',
  abstract: '...',
});

// Assess quality
const assessment = await assessQualityRoB2({
  study_id: 'study-001',
  design: classification.primary_design,
  title: 'Efficacy of Drug X: A Randomized Controlled Trial',
  abstract: '...',
  full_text: '...',
});

console.log('Overall risk:', assessment.overall_risk);
console.log('Requires review:', assessment.requires_review);
```

### Example 2: Batch Assessment

```typescript
const studies = [...]; // Array of studies

const assessments = await Promise.all(
  studies.map(study => assessQuality({
    study_id: study.id,
    design: study.design,
    tool: getRecommendedQualityTools(study.design)[0],
    title: study.title,
    full_text: study.full_text,
  }))
);

// Generate plots
const plots = await generateQualityPlots(assessments);
```

---

## 🎯 Next Steps

### Phase 2.2: Implement Cochrane RoB 2.0
- 5 domains for RCTs
- Automated evidence extraction
- Risk classification logic

### Phase 2.3: Implement Newcastle-Ottawa Scale
- Cohort and case-control versions
- Star rating system
- Quality categorization

### Phase 2.4: Implement Additional Tools
- QUADAS-2, CASP, JBI tools

### Phase 2.5: Build Visualization System
- Traffic light plots
- Summary tables
- Export to RevMan

---

**Status**: ✅ Architecture Complete  
**Next**: Implement Cochrane RoB 2.0 (Phase 2.2)
