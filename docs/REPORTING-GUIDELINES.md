# Reporting Guidelines for Medical Research

**MedResearch AI - CONSORT, STROBE, and PRISMA Reporting Standards**

This guide provides comprehensive checklists and guidance for reporting medical research studies according to international standards.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [CONSORT - Randomized Controlled Trials](#consort---randomized-controlled-trials)
3. [STROBE - Observational Studies](#strobe---observational-studies)
4. [PRISMA - Systematic Reviews](#prisma---systematic-reviews)
5. [Statistical Reporting Standards](#statistical-reporting-standards)
6. [Common Reporting Mistakes](#common-reporting-mistakes)

---

## Overview

### Why Use Reporting Guidelines?

**Benefits**:
- ✅ Improves transparency and reproducibility
- ✅ Facilitates critical appraisal
- ✅ Enables evidence synthesis (meta-analysis)
- ✅ Required by most journals
- ✅ Reduces research waste

**Consequences of poor reporting**:
- ❌ Cannot assess study quality
- ❌ Cannot replicate findings
- ❌ Cannot include in systematic reviews
- ❌ Manuscript rejection

### Which Guideline to Use?

| Study Design | Guideline | Checklist Items |
|--------------|-----------|-----------------|
| Randomized Controlled Trial | **CONSORT** | 25 items |
| Cohort Study | **STROBE** | 22 items |
| Case-Control Study | **STROBE** | 22 items |
| Cross-Sectional Study | **STROBE** | 22 items |
| Systematic Review | **PRISMA** | 27 items |
| Diagnostic Accuracy | STARD | 30 items |
| Prognostic Study | TRIPOD | 22 items |

---

## CONSORT - Randomized Controlled Trials

**CONSORT** = Consolidated Standards of Reporting Trials

**Current Version**: CONSORT 2010

**Website**: http://www.consort-statement.org/

### CONSORT Checklist (Essential Items)

#### **Title and Abstract**

**Item 1a**: Identification as randomized trial in title

✅ **Good**: "Effect of Drug X on Blood Pressure: A Randomized Controlled Trial"

❌ **Bad**: "Effect of Drug X on Blood Pressure: A Clinical Study"

**Item 1b**: Structured abstract (background, methods, results, conclusions)

**Required elements**:
- Trial design (parallel, crossover, factorial)
- Participants (eligibility, setting)
- Interventions
- Primary outcome
- Randomization method
- Blinding
- Results (numbers analyzed, effect size, CI, p-value)
- Conclusion
- Trial registration number

#### **Introduction**

**Item 2a**: Scientific background and rationale

**Item 2b**: Specific objectives or hypotheses

✅ **Good**: "We hypothesized that Drug X would reduce systolic blood pressure by ≥10 mmHg compared to placebo in hypertensive patients."

#### **Methods - Participants**

**Item 3a**: Eligibility criteria

**Required**:
- Inclusion criteria (specific, measurable)
- Exclusion criteria
- Setting (hospital, community, etc.)
- Recruitment period

✅ **Example**:
> "Inclusion: Adults aged 18-75 with systolic BP 140-180 mmHg. Exclusion: Secondary hypertension, pregnancy, severe renal impairment (eGFR <30). Recruited from 3 outpatient clinics, January 2023-December 2023."

**Item 3b**: Settings and locations where data collected

#### **Methods - Interventions**

**Item 4a**: Interventions for each group (sufficient detail for replication)

**Required**:
- Exact dose, route, timing
- Duration of treatment
- Concomitant medications allowed/prohibited
- Adherence monitoring

✅ **Example**:
> "Drug X 10mg orally once daily for 12 weeks. Placebo identical in appearance. Participants instructed to take medication at same time each day. Adherence assessed by pill count at each visit."

**Item 4b**: How and when interventions were administered

#### **Methods - Outcomes**

**Item 5**: Primary and secondary outcomes

**Required**:
- Clearly designate primary outcome
- Define how and when measured
- Specify any changes after trial commencement

✅ **Example**:
> "Primary outcome: Change in systolic BP from baseline to 12 weeks, measured by automated oscillometric device (Omron HEM-907) after 5 minutes rest, average of 3 readings."

#### **Methods - Sample Size**

**Item 6a**: How sample size determined

**Required**:
- Effect size assumption
- Power (typically 80%)
- Alpha (typically 0.05)
- Calculation method
- Attrition allowance

✅ **Example**:
> "Sample size calculated to detect 10 mmHg difference (SD=15) with 80% power, two-sided alpha=0.05, requiring 37 per group. Inflated to 44 per group (88 total) for 15% attrition."

**Item 6b**: Interim analyses and stopping guidelines (if applicable)

#### **Methods - Randomization**

**Item 7a**: Method of random sequence generation

✅ **Good**: "Computer-generated random sequence (1:1 allocation) using permuted blocks of 4."

❌ **Bad**: "Participants were randomized."

**Item 7b**: Type of randomization (simple, stratified, blocked)

**Item 8a**: Mechanism of allocation concealment

✅ **Good**: "Sequentially numbered, opaque, sealed envelopes."

❌ **Bad**: "Allocation concealed." (how?)

**Item 8b**: Who generated sequence, enrolled participants, assigned interventions

#### **Methods - Blinding**

**Item 9**: Who was blinded (participants, care providers, outcome assessors)

**Options**:
- Open-label (no blinding)
- Single-blind (participants blinded)
- Double-blind (participants + investigators blinded)
- Triple-blind (participants + investigators + outcome assessors blinded)

✅ **Example**:
> "Double-blind: Participants and investigators blinded to allocation. Outcome assessors and statistician blinded until analysis complete. Placebo identical in appearance to active drug."

#### **Methods - Statistical Methods**

**Item 10a**: Statistical methods for primary and secondary outcomes

**Required**:
- Test used (t-test, ANOVA, regression, etc.)
- Assumptions checked
- Handling of missing data
- Adjustment for multiple comparisons (if applicable)

✅ **Example**:
> "Primary analysis: Independent t-test comparing change in systolic BP between groups. Assumptions checked (normality, homogeneity). Missing data handled by multiple imputation (10 datasets). Two-sided alpha=0.05. Analysis by intention-to-treat."

**Item 10b**: Methods for additional analyses (subgroup, adjusted)

#### **Results - Participant Flow**

**Item 11a**: Flow diagram (CONSORT flow diagram)

**Required elements**:
```
Assessed for eligibility (n=)
    ↓
Excluded (n=)
  - Not meeting criteria (n=)
  - Declined (n=)
  - Other reasons (n=)
    ↓
Randomized (n=)
    ↓
    ├─→ Allocated to intervention (n=)
    │     - Received intervention (n=)
    │     - Did not receive (n=, reasons)
    │   
    └─→ Allocated to control (n=)
          - Received control (n=)
          - Did not receive (n=, reasons)
    ↓
Lost to follow-up (n=, reasons)
Discontinued intervention (n=, reasons)
    ↓
Analyzed (n=)
Excluded from analysis (n=, reasons)
```

**Item 11b**: Losses and exclusions after randomization

#### **Results - Baseline Data**

**Item 12**: Baseline characteristics (Table 1)

**Required**:
- Age (mean ± SD or median [IQR])
- Sex (n, %)
- Key prognostic factors
- Baseline outcome values
- **NO p-values** (groups should differ only by chance)

✅ **Example Table 1**:

| Characteristic | Drug X (n=44) | Placebo (n=44) |
|----------------|---------------|----------------|
| Age, years | 58.3 ± 10.2 | 56.7 ± 11.5 |
| Male, n (%) | 26 (59%) | 28 (64%) |
| Baseline SBP, mmHg | 152.4 ± 8.3 | 151.8 ± 9.1 |

**Note**: No p-values in Table 1!

#### **Results - Numbers Analyzed**

**Item 13**: Number of participants analyzed for each outcome

**Required**:
- ITT (intention-to-treat) population
- Per-protocol population
- Reasons for exclusions

#### **Results - Outcomes and Estimation**

**Item 14a**: Results for primary and secondary outcomes

**Required**:
- Effect size (mean difference, OR, RR, HR)
- 95% confidence interval
- Exact p-value (not just p<0.05)

✅ **Example**:
> "Mean change in systolic BP: Drug X -18.5 mmHg (95% CI: -22.3 to -14.7), Placebo -6.2 mmHg (95% CI: -10.1 to -2.3). Mean difference: -12.3 mmHg (95% CI: -17.8 to -6.8), p<0.001."

**Item 14b**: Binary outcomes: absolute and relative effect sizes

✅ **Example**:
> "Adverse events: Drug X 12/44 (27%), Placebo 5/44 (11%). Risk difference: 16% (95% CI: 1% to 31%). Relative risk: 2.4 (95% CI: 0.9 to 6.2), p=0.07."

#### **Results - Harms**

**Item 15**: All important adverse events or side effects

**Required**:
- Frequency in each group
- Severity
- Relationship to intervention

#### **Discussion**

**Item 16**: Interpretation consistent with results, balancing benefits and harms

**Item 17**: Generalizability (external validity)

**Item 18**: Overall evidence interpretation

#### **Other Information**

**Item 19**: Trial registration number and name of registry

✅ **Example**: "ClinicalTrials.gov NCT04280705"

**Item 20**: Where full protocol can be accessed

**Item 21**: Sources of funding and role of funders

---

## STROBE - Observational Studies

**STROBE** = Strengthening the Reporting of Observational Studies in Epidemiology

**Current Version**: STROBE 2007

**Website**: https://www.strobe-statement.org/

**Applies to**: Cohort, case-control, and cross-sectional studies

### STROBE Checklist (Essential Items)

#### **Title and Abstract**

**Item 1**: Indicate study design in title or abstract

✅ **Good**: "Smoking and Lung Cancer Risk: A Prospective Cohort Study"

❌ **Bad**: "Smoking and Lung Cancer Risk: An Epidemiological Study"

#### **Introduction**

**Item 2**: Background and rationale

**Item 3**: Objectives (specific, including pre-specified hypotheses)

#### **Methods - Study Design**

**Item 4**: Study design with timing of data collection

**Required**:
- Cohort: Prospective or retrospective?
- Case-control: Incident or prevalent cases?
- Cross-sectional: Point or period prevalence?
- Timing of exposure and outcome assessment

✅ **Example (Cohort)**:
> "Prospective cohort study. Smoking status assessed at baseline (2010). Participants followed for lung cancer incidence through 2020 (10-year follow-up)."

✅ **Example (Case-Control)**:
> "Hospital-based case-control study. Incident lung cancer cases diagnosed 2018-2020. Controls matched 1:2 by age and sex from same hospitals."

#### **Methods - Setting**

**Item 5**: Setting, locations, dates (recruitment, exposure, follow-up)

#### **Methods - Participants**

**Item 6a**: Eligibility criteria (cohort: exposed/unexposed; case-control: cases/controls)

**Item 6b**: Sources and methods of selection

**Item 6c**: Matching criteria (case-control)

#### **Methods - Variables**

**Item 7**: Clearly define outcomes, exposures, predictors, confounders

**Required**:
- Operational definitions
- Measurement methods
- Timing of assessment

✅ **Example**:
> "Smoking status: Never-smoker (<100 lifetime cigarettes), former smoker (quit ≥1 year), current smoker. Assessed by standardized questionnaire at baseline."

#### **Methods - Data Sources**

**Item 8**: Data sources and measurement methods for each variable

#### **Methods - Bias**

**Item 9**: Efforts to address potential sources of bias

**Common biases**:
- Selection bias (non-response, loss to follow-up)
- Information bias (recall bias, measurement error)
- Confounding

✅ **Example**:
> "To minimize recall bias, medical records were reviewed to verify self-reported diagnoses. Loss to follow-up (12%) was similar between exposed and unexposed groups."

#### **Methods - Study Size**

**Item 10**: How study size determined

**For cohort/case-control**:
- Sample size calculation (if done)
- Or justify sample size (convenience, available data)

#### **Methods - Quantitative Variables**

**Item 11**: How quantitative variables handled (continuous, categorized, cut-points)

✅ **Example**:
> "BMI analyzed as continuous variable and categorized as normal (<25), overweight (25-29.9), obese (≥30) kg/m²."

#### **Methods - Statistical Methods**

**Item 12a**: Statistical methods

**Required**:
- Tests used
- Confounders adjusted for
- Handling of missing data
- Subgroup analyses

✅ **Example (Cohort)**:
> "Cox proportional hazards regression to estimate hazard ratios for lung cancer. Adjusted for age, sex, occupational exposure, family history. Proportional hazards assumption checked with Schoenfeld residuals."

✅ **Example (Case-Control)**:
> "Conditional logistic regression (matched design) to estimate odds ratios. Adjusted for education, occupational exposure, family history."

**Item 12b**: Subgroup and interaction analyses

**Item 12c**: Sensitivity analyses

#### **Results - Participants**

**Item 13a**: Numbers at each stage (eligible, included, follow-up, analyzed)

**Item 13b**: Reasons for non-participation at each stage

**Item 13c**: Flow diagram (recommended)

#### **Results - Descriptive Data**

**Item 14a**: Characteristics of participants

**For cohort**: By exposure status

**For case-control**: By case/control status

**For cross-sectional**: Overall or by outcome

✅ **Example Table 1 (Cohort)**:

| Characteristic | Smokers (n=500) | Non-smokers (n=500) |
|----------------|-----------------|---------------------|
| Age, years | 52.3 ± 10.2 | 51.8 ± 11.5 |
| Male, n (%) | 320 (64%) | 280 (56%) |
| Pack-years | 25.4 ± 12.3 | 0 |

**Item 14b**: Number of participants with missing data

**Item 14c**: Follow-up time (cohort)

#### **Results - Outcome Data**

**Item 15**: Report numbers in each exposure category, or summary measures

**For cohort**: Incidence rates

**For case-control**: Exposure prevalence

✅ **Example (Cohort)**:
> "Lung cancer incidence: Smokers 45/500 (9.0%), Non-smokers 8/500 (1.6%). Incidence rate: Smokers 9.5 per 1000 person-years, Non-smokers 1.7 per 1000 person-years."

#### **Results - Main Results**

**Item 16a**: Unadjusted and adjusted estimates with confidence intervals

✅ **Example (Cohort)**:
> "Unadjusted HR: 5.62 (95% CI: 2.65 to 11.92), p<0.001. Adjusted HR: 4.52 (95% CI: 2.10 to 9.73), p<0.001 (adjusted for age, sex, occupational exposure, family history)."

**Item 16b**: Category boundaries for quantitative exposures

**Item 16c**: Translate relative risk to absolute risk (if relevant)

✅ **Example**:
> "10-year absolute risk: Smokers 9.0%, Non-smokers 1.6%. Absolute risk difference: 7.4% (95% CI: 5.2% to 9.6%)."

#### **Results - Other Analyses**

**Item 17**: Other analyses (subgroup, interaction, sensitivity)

#### **Discussion**

**Item 18**: Key results with reference to objectives

**Item 19**: Limitations (sources of bias, imprecision)

**Item 20**: Interpretation (causality, generalizability)

**Item 21**: Generalizability (external validity)

#### **Other Information**

**Item 22**: Funding sources and role of funders

---

## PRISMA - Systematic Reviews

**PRISMA** = Preferred Reporting Items for Systematic Reviews and Meta-Analyses

**Current Version**: PRISMA 2020

**Website**: http://www.prisma-statement.org/

### PRISMA Checklist (Essential Items)

#### **Title**

**Item 1**: Identify as systematic review, meta-analysis, or both

✅ **Good**: "Effect of Drug X on Blood Pressure: A Systematic Review and Meta-Analysis"

#### **Abstract**

**Item 2**: Structured abstract (background, methods, results, conclusions)

**Required elements**:
- Objectives
- Eligibility criteria
- Information sources
- Risk of bias assessment
- Number of studies and participants
- Summary of results (effect size, CI, heterogeneity)
- Interpretation
- Registration number

#### **Introduction**

**Item 3**: Rationale

**Item 4**: Objectives (PICO format)

✅ **Example**:
> "**P**opulation: Adults with hypertension. **I**ntervention: Drug X. **C**omparison: Placebo. **O**utcome: Change in systolic blood pressure."

#### **Methods - Eligibility Criteria**

**Item 5**: Eligibility criteria (PICO)

**Required**:
- Population
- Intervention/Exposure
- Comparator
- Outcomes
- Study design
- Language restrictions
- Date restrictions

#### **Methods - Information Sources**

**Item 6**: Information sources (databases, dates, search strategy)

✅ **Example**:
> "Searched PubMed, Embase, Cochrane CENTRAL from inception to December 2023. No language restrictions. Search strategy in Appendix 1."

#### **Methods - Search Strategy**

**Item 7**: Full search strategy for at least one database

**Required**: Include in appendix or supplementary material

#### **Methods - Selection Process**

**Item 8**: Methods for study selection

✅ **Example**:
> "Two reviewers independently screened titles/abstracts, then full texts. Disagreements resolved by third reviewer. Cohen's kappa for agreement: 0.85."

#### **Methods - Data Collection**

**Item 9**: Methods for data extraction

**Required**:
- Data extraction form (pilot tested)
- Number of reviewers
- Handling of disagreements

#### **Methods - Data Items**

**Item 10**: Data items sought (outcomes, effect modifiers)

#### **Methods - Risk of Bias**

**Item 11**: Methods for assessing risk of bias

**For RCTs**: Cochrane Risk of Bias tool (RoB 2)

**For observational**: Newcastle-Ottawa Scale or ROBINS-I

✅ **Example**:
> "Risk of bias assessed using Cochrane RoB 2 tool. Domains: randomization, deviations from protocol, missing data, outcome measurement, selective reporting. Two independent reviewers."

#### **Methods - Effect Measures**

**Item 12**: Effect measures (RR, OR, MD, SMD, HR)

#### **Methods - Synthesis Methods**

**Item 13a**: Methods for synthesis

**Required**:
- Meta-analysis model (random-effects, fixed-effect)
- Method for tau² (REML, DL)
- Software used

✅ **Example**:
> "Random-effects meta-analysis using DerSimonian-Laird method. Heterogeneity assessed with I² statistic. Meta-analysis performed in R (metafor package)."

**Item 13b**: Methods for exploring heterogeneity

**Options**:
- Subgroup analysis
- Meta-regression
- Sensitivity analysis

**Item 13c**: Sensitivity analyses

**Item 13d**: Assessment of publication bias

**If ≥10 studies**:
- Funnel plot
- Egger's test
- Trim-and-fill

#### **Results - Study Selection**

**Item 14**: PRISMA flow diagram

**Required elements**:
```
Records identified from databases (n=)
Records removed before screening (duplicates, etc.) (n=)
    ↓
Records screened (n=)
Records excluded (n=)
    ↓
Reports sought for retrieval (n=)
Reports not retrieved (n=)
    ↓
Reports assessed for eligibility (n=)
Reports excluded (n=, reasons)
    ↓
Studies included in review (n=)
Studies included in meta-analysis (n=)
```

#### **Results - Study Characteristics**

**Item 15**: Characteristics of included studies (table)

**Required**:
- Author, year
- Country
- Study design
- Sample size
- Population characteristics
- Intervention details
- Outcomes measured
- Follow-up duration

#### **Results - Risk of Bias**

**Item 16**: Risk of bias assessment (table or figure)

**Typical presentation**:
- Traffic light plot (red/yellow/green)
- Summary: % low/unclear/high risk

#### **Results - Results of Syntheses**

**Item 17**: Results of syntheses (forest plot)

**Required**:
- Forest plot for each outcome
- Pooled effect estimate with 95% CI
- Heterogeneity statistics (I², τ², Q, p-value)
- Prediction interval (if random-effects)

✅ **Example**:
> "Pooled mean difference: -12.5 mmHg (95% CI: -18.2 to -6.8), p<0.001. Heterogeneity: I²=65%, τ²=25.3, Q=34.2 (p=0.002). 95% prediction interval: -28.4 to 3.4 mmHg."

#### **Results - Publication Bias**

**Item 18**: Assessment of publication bias

**If ≥10 studies**:
- Funnel plot (visual inspection)
- Egger's test (p-value)
- Trim-and-fill (adjusted estimate)

✅ **Example**:
> "Funnel plot showed asymmetry. Egger's test: p=0.03, suggesting publication bias. Trim-and-fill imputed 3 studies; adjusted estimate: -10.2 mmHg (95% CI: -15.8 to -4.6)."

#### **Discussion**

**Item 19**: Interpretation (strength of evidence, limitations)

**Item 20**: Limitations (study level, review level)

**Item 21**: Implications (practice, policy, research)

#### **Other Information**

**Item 22**: Registration (PROSPERO number)

✅ **Example**: "PROSPERO CRD42023123456"

**Item 23**: Protocol availability

**Item 24**: Conflicts of interest

**Item 25**: Funding

---

## Statistical Reporting Standards

### General Principles

**Always report**:
1. ✅ **Effect sizes** (not just p-values)
2. ✅ **Confidence intervals** (95% CI)
3. ✅ **Exact p-values** (not just p<0.05)
4. ✅ **Sample sizes** (for each analysis)
5. ✅ **Missing data** (how handled)

### Reporting Effect Sizes

#### Continuous Outcomes

✅ **Good**:
> "Mean difference: -12.5 mmHg (95% CI: -18.2 to -6.8), p<0.001, Cohen's d = 0.61 (medium effect)."

❌ **Bad**:
> "Significant difference (p<0.05)."

#### Binary Outcomes

✅ **Good**:
> "Risk ratio: 2.4 (95% CI: 1.3 to 4.5), p=0.006. Absolute risk: Intervention 12%, Control 5%, Risk difference: 7% (95% CI: 2% to 12%). NNT: 14 (95% CI: 8 to 50)."

❌ **Bad**:
> "Significant increase in risk (p<0.01)."

### Reporting p-values

✅ **Good**:
- p = 0.03
- p = 0.12
- p < 0.001 (if very small)

❌ **Bad**:
- p < 0.05 (not informative)
- NS (not significant) - always give exact p
- p = 0.000 (impossible)

### Reporting Confidence Intervals

✅ **Format**: "Mean difference: -12.5 mmHg (95% CI: -18.2 to -6.8)"

**Interpretation**:
- CI excludes 0 → Statistically significant
- CI includes 0 → Not statistically significant
- Width of CI → Precision of estimate

### Reporting Missing Data

✅ **Good**:
> "Missing data: Baseline 0%, 12-week follow-up 15% (Drug X: 7/44, Placebo: 6/44). Missing data handled by multiple imputation (10 datasets, predictive mean matching). Sensitivity analysis using complete cases showed similar results."

❌ **Bad**:
> "Some participants had missing data."

### Reporting Assumptions

✅ **Good**:
> "Normality assessed by Shapiro-Wilk test (p>0.05 for both groups) and Q-Q plots. Homogeneity of variance confirmed by Levene's test (p=0.67). No outliers detected (IQR method)."

❌ **Bad**:
> "Assumptions were met."

---

## Common Reporting Mistakes

### Mistake 1: Not Specifying Study Design in Title

❌ **Bad**: "Effect of Drug X on Blood Pressure"

✅ **Good**: "Effect of Drug X on Blood Pressure: A Randomized Controlled Trial"

### Mistake 2: Reporting Only p-values

❌ **Bad**: "Significant difference (p<0.05)"

✅ **Good**: "Mean difference: -12.5 mmHg (95% CI: -18.2 to -6.8), p<0.001"

### Mistake 3: P-values in Table 1 (RCTs)

❌ **Bad**: Including p-values comparing baseline characteristics

✅ **Good**: No p-values (groups should differ only by chance)

**Rationale**: Randomization ensures balance. P-values test null hypothesis that groups are identical, which is not the research question.

### Mistake 4: Not Reporting Effect Sizes

❌ **Bad**: "Significant improvement (p=0.02)"

✅ **Good**: "Mean improvement: 8.5 points (95% CI: 1.2 to 15.8), p=0.02, Cohen's d = 0.45 (small-medium effect)"

### Mistake 5: Selective Reporting

❌ **Bad**: Only reporting significant results

✅ **Good**: Report all pre-specified outcomes, significant or not

### Mistake 6: Not Reporting Confidence Intervals

❌ **Bad**: "OR = 2.4, p=0.006"

✅ **Good**: "OR = 2.4 (95% CI: 1.3 to 4.5), p=0.006"

### Mistake 7: Vague Methods

❌ **Bad**: "Statistical analysis was performed."

✅ **Good**: "Independent t-test used to compare groups. Assumptions checked (normality: Shapiro-Wilk p>0.05; homogeneity: Levene's p=0.67). Two-sided alpha=0.05. Analysis by intention-to-treat."

### Mistake 8: Not Reporting Sample Size Calculation

❌ **Bad**: "We recruited 100 participants."

✅ **Good**: "Sample size calculated to detect 10 mmHg difference (SD=15) with 80% power, alpha=0.05, requiring 37 per group. Inflated to 44 per group for 15% attrition."

### Mistake 9: Not Reporting Missing Data

❌ **Bad**: "Data were analyzed."

✅ **Good**: "Missing data: 15% at follow-up. Handled by multiple imputation. Sensitivity analysis with complete cases showed similar results."

### Mistake 10: Confusing Statistical and Clinical Significance

❌ **Bad**: "Highly significant difference (p<0.001)"

✅ **Good**: "Statistically significant difference (p<0.001). Mean difference of 2.5 mmHg is below the clinically meaningful threshold of 5 mmHg."

---

## Summary Checklists

### Before Submitting Manuscript

#### **All Studies**
- [ ] Study design in title
- [ ] Structured abstract
- [ ] Clear objectives/hypotheses
- [ ] Eligibility criteria specified
- [ ] Sample size justification
- [ ] Statistical methods described
- [ ] Effect sizes reported
- [ ] Confidence intervals reported
- [ ] Exact p-values reported
- [ ] Missing data addressed
- [ ] Limitations discussed
- [ ] Funding disclosed

#### **RCTs (CONSORT)**
- [ ] Trial registration number
- [ ] CONSORT flow diagram
- [ ] Randomization method
- [ ] Allocation concealment
- [ ] Blinding described
- [ ] Table 1 (no p-values)
- [ ] ITT analysis
- [ ] Adverse events reported

#### **Observational (STROBE)**
- [ ] Study design clearly stated
- [ ] Exposure/outcome definitions
- [ ] Confounders identified
- [ ] Adjusted analyses
- [ ] Bias addressed
- [ ] Generalizability discussed

#### **Systematic Reviews (PRISMA)**
- [ ] PROSPERO registration
- [ ] PRISMA flow diagram
- [ ] Search strategy (appendix)
- [ ] Risk of bias assessment
- [ ] Forest plots
- [ ] Heterogeneity reported (I²)
- [ ] Publication bias assessed (if ≥10 studies)

---

## Additional Resources

- **CONSORT**: http://www.consort-statement.org/
- **STROBE**: https://www.strobe-statement.org/
- **PRISMA**: http://www.prisma-statement.org/
- **EQUATOR Network**: https://www.equator-network.org/ (all guidelines)

### Related Guides
- [STATISTICAL-METHODS-GUIDE.md](./STATISTICAL-METHODS-GUIDE.md) - Statistical analysis methods
- [ASSUMPTION-CHECKING-GUIDE.md](./ASSUMPTION-CHECKING-GUIDE.md) - Checking assumptions
- [POWER-ANALYSIS-GUIDE.md](./POWER-ANALYSIS-GUIDE.md) - Sample size planning
- [DATA-ANALYSIS-AGENT-RESEARCH.md](./DATA-ANALYSIS-AGENT-RESEARCH.md) - Comprehensive research

---

**Version**: 4.2.0  
**Last Updated**: December 4, 2025  
**Author**: MedResearch AI Team
