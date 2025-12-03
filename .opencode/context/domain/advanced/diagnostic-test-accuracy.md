# Diagnostic Test Accuracy Reviews - Advanced Methodology Guide

## Overview
Diagnostic test accuracy (DTA) reviews evaluate how well a test identifies or rules out a target condition. Unlike intervention reviews, DTA reviews assess test performance (sensitivity, specificity) rather than treatment effects.

## Key Concepts

### Diagnostic Accuracy Measures

**2×2 Table**:
```
                Target Condition
                Present | Absent
Test    Positive   TP   |   FP
Result  Negative   FN   |   TN
```

**Primary Measures**:
- **Sensitivity (Se)**: TP / (TP + FN) - Proportion of diseased correctly identified
- **Specificity (Sp)**: TN / (TN + FP) - Proportion of non-diseased correctly identified

**Secondary Measures**:
- **Positive Predictive Value (PPV)**: TP / (TP + FP)
- **Negative Predictive Value (NPV)**: TN / (TN + FP)
- **Likelihood Ratio Positive (LR+)**: Se / (1 - Sp)
- **Likelihood Ratio Negative (LR-)**: (1 - Se) / Sp
- **Diagnostic Odds Ratio (DOR)**: (TP × TN) / (FP × FN)

### Reference Standard

**Definition**: The best available method for determining presence/absence of target condition (gold standard).

**Requirements**:
- Highly accurate (ideally 100% sensitivity and specificity)
- Applied to all participants
- Interpreted independently of index test

**Examples**:
- Biopsy for cancer
- Angiography for coronary artery disease
- Clinical follow-up for prognosis

## Research Question Framework

### PICO Adaptation for DTA

**P**opulation: Who is being tested?
- Age, sex, disease prevalence
- Clinical setting (primary care, hospital)
- Symptoms or risk factors

**I**ndex Test: What test is being evaluated?
- Test name, manufacturer
- Threshold/cut-off value
- Test procedure

**C**omparator: What is the reference standard?
- Gold standard test
- How it's performed
- Interpretation criteria

**O**utcome: What is the target condition?
- Disease or condition being diagnosed
- Severity or stage

**Example**:
- **P**: Adults with suspected coronary artery disease
- **I**: Exercise ECG (ST depression ≥1mm)
- **C**: Coronary angiography (≥50% stenosis)
- **O**: Significant coronary artery disease

## Eligibility Criteria

### Study Designs
**Include**:
- Cross-sectional studies
- Cohort studies (if all receive reference standard)
- Diagnostic case-control studies (with caution)

**Exclude**:
- Case-control studies (inflated accuracy)
- Studies without reference standard
- Studies with partial verification

### Participants
- Specify target population
- Define disease spectrum (early vs advanced)
- Specify setting (primary care vs specialist)

### Index Test
- Clearly define test and threshold
- Specify if threshold pre-specified or data-driven
- Include test execution details

### Reference Standard
- Must be clearly defined
- Should be same for all participants
- Interpreted blind to index test

## Risk of Bias Assessment

### QUADAS-2 Tool

**Domain 1: Patient Selection**
- Risk of bias: Was selection appropriate?
- Applicability: Do patients match review question?

**Signaling Questions**:
- Consecutive or random sample?
- Case-control design avoided?
- Inappropriate exclusions avoided?

**Domain 2: Index Test**
- Risk of bias: Could index test introduce bias?
- Applicability: Does test match review question?

**Signaling Questions**:
- Threshold pre-specified?
- Interpreted without knowledge of reference standard?

**Domain 3: Reference Standard**
- Risk of bias: Could reference standard introduce bias?
- Applicability: Does reference standard match review question?

**Signaling Questions**:
- Likely to correctly classify target condition?
- Interpreted without knowledge of index test?

**Domain 4: Flow and Timing**
- Risk of bias: Could patient flow introduce bias?

**Signaling Questions**:
- Appropriate interval between tests?
- All patients received same reference standard?
- All patients included in analysis?

**Judgments**: Low / High / Unclear risk

## Meta-Analysis of DTA Studies

### Challenges

**Threshold Effect**:
- Different studies use different thresholds
- Higher threshold → Higher Sp, Lower Se
- Creates negative correlation between Se and Sp

**Heterogeneity**:
- Variation in populations, test execution, thresholds
- Cannot pool Se and Sp separately (correlated)

### Statistical Methods

**1. Summary ROC (SROC) Curve**
- Plots sensitivity vs (1 - specificity) for each study
- Fits curve through points
- Shows trade-off between Se and Sp

**2. Bivariate Model** (Recommended)
- Jointly models Se and Sp
- Accounts for correlation
- Provides summary Se and Sp with 95% confidence region

**3. Hierarchical SROC (HSROC)**
- Models underlying ROC curve
- Allows for threshold variation
- Provides summary accuracy and shape parameters

**Software**:
- R: `mada` package (bivariate model)
- R: `meta4diag` package (HSROC)
- Stata: `metandi` command
- SAS: PROC NLMIXED

### Example (R mada package)

```r
library(mada)

# Prepare data
data <- data.frame(
  study = c("Study1", "Study2", ...),
  TP = c(80, 75, ...),
  FP = c(10, 15, ...),
  FN = c(20, 25, ...),
  TN = c(90, 85, ...)
)

# Fit bivariate model
fit <- reitsma(data)

# Summary estimates
summary(fit)

# SROC plot
plot(fit, sroclwd = 2)

# Forest plots
forest(madad(data), type = "sens")
forest(madad(data), type = "spec")
```

## Interpreting Results

### Summary Estimates
- **Summary Sensitivity**: Average Se across studies
- **Summary Specificity**: Average Sp across studies
- **95% Confidence Region**: Uncertainty in summary point
- **95% Prediction Region**: Range for new study

### Clinical Interpretation

**Likelihood Ratios**:
- **LR+ > 10**: Large increase in probability (rule in)
- **LR+ 5-10**: Moderate increase
- **LR+ 2-5**: Small increase
- **LR+ 1-2**: Minimal increase
- **LR- < 0.1**: Large decrease in probability (rule out)
- **LR- 0.1-0.2**: Moderate decrease
- **LR- 0.2-0.5**: Small decrease
- **LR- 0.5-1**: Minimal decrease

**Example**:
- Pre-test probability: 30% (prevalence)
- LR+ = 10
- Post-test probability: ~80% (if test positive)

### Heterogeneity

**Measures**:
- Visual inspection of forest plots and SROC
- I² for sensitivity and specificity separately
- Prediction region width

**Investigation**:
- Meta-regression (if ≥10 studies)
- Subgroup analysis (pre-specified)
- Sensitivity analysis

**Covariates to Explore**:
- Disease spectrum (early vs advanced)
- Setting (primary care vs hospital)
- Test threshold
- Reference standard quality
- Study quality (QUADAS-2 domains)

## Reporting Standards

### STARD (Standards for Reporting Diagnostic Accuracy)

**Title/Abstract**:
- Identify as diagnostic accuracy study
- Structured abstract

**Introduction**:
- Clinical role of test
- Study objectives

**Methods**:
- Participants (inclusion/exclusion, setting)
- Test methods (index test, reference standard)
- Analysis (how Se/Sp calculated)

**Results**:
- Participant flow diagram
- Baseline characteristics
- 2×2 table for each study
- Estimates of diagnostic accuracy (Se, Sp, LR, etc.)

**Discussion**:
- Clinical applicability
- Limitations
- Implications

### PRISMA-DTA Extension

**Additional Items**:
- Describe index test and reference standard
- Report QUADAS-2 assessments
- Present SROC curve
- Report summary Se and Sp with 95% regions
- Discuss heterogeneity and threshold effects

## Common Pitfalls

❌ **Case-control design**: Inflates accuracy (avoid or analyze separately)
❌ **Partial verification**: Not all receive reference standard (verification bias)
❌ **Differential verification**: Different reference standards for positive/negative (bias)
❌ **Incorporation bias**: Index test part of reference standard
❌ **Pooling Se and Sp separately**: Ignores correlation (use bivariate model)
❌ **Ignoring threshold variation**: Causes heterogeneity
❌ **Not assessing applicability**: Results may not apply to target population

## Quality Checklist

### Before Meta-Analysis
- [ ] QUADAS-2 assessment completed for all studies
- [ ] 2×2 tables extracted for all studies
- [ ] Threshold variation documented
- [ ] Reference standard consistent across studies

### During Meta-Analysis
- [ ] Bivariate or HSROC model used (not separate pooling)
- [ ] SROC curve created
- [ ] Heterogeneity assessed
- [ ] Sensitivity analyses conducted
- [ ] Subgroup analyses (if pre-specified and ≥10 studies)

### Reporting
- [ ] STARD and PRISMA-DTA checklists completed
- [ ] Participant flow diagram included
- [ ] QUADAS-2 summary presented
- [ ] Forest plots for Se and Sp included
- [ ] SROC curve with confidence and prediction regions
- [ ] Summary Se, Sp, LR+, LR- reported
- [ ] Clinical interpretation provided
- [ ] Limitations discussed

## Version Control
- **Version**: 1.0
- **Last Updated**: 2025-12-03
- **Maintained By**: MedResearch AI System
- **Key References**: STARD 2015, PRISMA-DTA, QUADAS-2, Cochrane Handbook Chapter 10
