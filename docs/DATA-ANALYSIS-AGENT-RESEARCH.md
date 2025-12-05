# Data Analysis Agent - Comprehensive Research & Design

**Research Date:** December 4, 2025  
**Objective:** Design a world-class Data Analysis Agent with expertise in epidemiology, biostatistics, and medical research methodology.

---

## Table of Contents

1. [Statistical Test Selection Framework](#statistical-test-selection-framework)
2. [Epidemiological Study Designs](#epidemiological-study-designs)
3. [Biostatistical Best Practices](#biostatistical-best-practices)
4. [Data Preparation & Validation](#data-preparation--validation)
5. [Software & Tool Integration](#software--tool-integration)
6. [Quality Assurance Framework](#quality-assurance-framework)
7. [Agent Architecture Design](#agent-architecture-design)
8. [Methodology Explanation System](#methodology-explanation-system)
9. [Implementation Recommendations](#implementation-recommendations)
10. [Future Enhancements](#future-enhancements)

---

## 1. Statistical Test Selection Framework

### 1.1 Decision Tree for Test Selection

The agent must follow a systematic decision tree based on:

#### **Step 1: Identify Research Question Type**
- **Comparison** (e.g., treatment vs control)
- **Association** (e.g., risk factors and disease)
- **Prediction** (e.g., prognostic models)
- **Agreement** (e.g., inter-rater reliability)
- **Survival** (e.g., time-to-event analysis)

#### **Step 2: Determine Data Characteristics**

**A. Number of Variables:**
- Univariate (1 variable)
- Bivariate (2 variables)
- Multivariate (3+ variables)

**B. Variable Types:**
- **Continuous** (e.g., age, weight, blood pressure)
- **Ordinal** (e.g., pain scale 1-10, disease stage)
- **Nominal** (e.g., gender, ethnicity, treatment group)
- **Binary** (e.g., yes/no, alive/dead)
- **Count** (e.g., number of events)
- **Time-to-event** (e.g., survival time)

**C. Number of Groups:**
- 1 group (one-sample)
- 2 groups (two-sample)
- 3+ groups (multi-group)
- Paired/matched data

**D. Data Distribution:**
- Normal (parametric tests)
- Non-normal (non-parametric tests)
- Check with: Shapiro-Wilk, Kolmogorov-Smirnov, Q-Q plots

**E. Sample Size:**
- Small (n < 30): Non-parametric preferred
- Medium (30 ≤ n < 100): Check assumptions
- Large (n ≥ 100): Central limit theorem applies

#### **Step 3: Check Assumptions**

**Parametric Test Assumptions:**
1. **Normality**: Data follows normal distribution
2. **Homogeneity of variance**: Equal variances across groups
3. **Independence**: Observations are independent
4. **Linearity**: Linear relationship (for regression)
5. **No outliers**: Extreme values handled appropriately

**Tests for Assumptions:**
- Normality: Shapiro-Wilk, Anderson-Darling, Q-Q plot
- Homogeneity: Levene's test, Bartlett's test
- Independence: Durbin-Watson test
- Outliers: Box plots, Z-scores, Cook's distance

### 1.2 Comprehensive Test Selection Matrix

#### **Comparing Means**

| Scenario | Parametric | Non-Parametric | Notes |
|----------|------------|----------------|-------|
| 1 group vs population | One-sample t-test | Wilcoxon signed-rank | Check normality |
| 2 independent groups | Independent t-test | Mann-Whitney U | Check equal variance |
| 2 paired groups | Paired t-test | Wilcoxon signed-rank | Matched/repeated measures |
| 3+ independent groups | One-way ANOVA | Kruskal-Wallis | Post-hoc: Tukey, Bonferroni |
| 3+ paired groups | Repeated measures ANOVA | Friedman test | Sphericity: Mauchly's test |
| 2+ groups + covariates | ANCOVA | - | Adjust for confounders |
| 2+ factors | Two-way ANOVA | - | Interaction effects |

#### **Comparing Proportions**

| Scenario | Test | Notes |
|----------|------|-------|
| 1 proportion vs expected | One-sample proportion test | Binomial test |
| 2 independent proportions | Chi-square test | Fisher's exact if n<5 |
| 2 paired proportions | McNemar's test | Matched data |
| 3+ proportions | Chi-square test | Post-hoc: pairwise comparisons |
| Trend in proportions | Cochran-Armitage trend test | Ordinal exposure |

#### **Association & Correlation**

| Scenario | Test | Range | Interpretation |
|----------|------|-------|----------------|
| 2 continuous (normal) | Pearson correlation | -1 to +1 | Linear relationship |
| 2 continuous (non-normal) | Spearman correlation | -1 to +1 | Monotonic relationship |
| 2 ordinal | Spearman/Kendall tau | -1 to +1 | Rank correlation |
| Categorical association | Chi-square test | - | Independence test |
| Agreement (continuous) | Intraclass correlation (ICC) | 0 to 1 | Reliability |
| Agreement (categorical) | Cohen's kappa | -1 to +1 | Beyond chance |

#### **Regression Analysis**

| Outcome Type | Predictor Type | Method | Software |
|--------------|----------------|--------|----------|
| Continuous | Continuous/categorical | Linear regression | R: lm() |
| Binary | Any | Logistic regression | R: glm(family=binomial) |
| Count | Any | Poisson regression | R: glm(family=poisson) |
| Overdispersed count | Any | Negative binomial | R: MASS::glm.nb() |
| Ordinal | Any | Ordinal logistic | R: MASS::polr() |
| Time-to-event | Any | Cox proportional hazards | R: survival::coxph() |
| Clustered data | Any | Mixed-effects models | R: lme4::lmer() |
| Repeated measures | Any | GEE or mixed models | R: geepack::geeglm() |

#### **Survival Analysis**

| Scenario | Method | Purpose |
|----------|--------|---------|
| Survival curves | Kaplan-Meier | Estimate survival function |
| Compare survival | Log-rank test | Compare 2+ groups |
| Adjusted survival | Cox regression | Adjust for covariates |
| Parametric survival | Weibull, exponential | Assume distribution |
| Competing risks | Fine-Gray model | Multiple endpoints |
| Time-varying covariates | Extended Cox | Covariates change over time |

#### **Meta-Analysis**

| Data Type | Method | Heterogeneity |
|-----------|--------|---------------|
| Continuous outcomes | Standardized mean difference | I², τ², Q statistic |
| Binary outcomes | Odds ratio, risk ratio | I², τ², Q statistic |
| Fixed effects | Inverse variance | Assumes one true effect |
| Random effects | DerSimonian-Laird | Allows between-study variation |
| Meta-regression | Regression on study characteristics | Explore heterogeneity |

### 1.3 Power Analysis & Sample Size

**Agent must calculate:**

1. **A priori power analysis** (before study):
   - Required sample size for desired power (typically 80%)
   - Given: effect size, alpha (0.05), power (0.80)

2. **Post-hoc power analysis** (after study):
   - Achieved power given sample size and effect
   - Interpret non-significant results

3. **Effect size interpretation**:
   - **Cohen's d** (mean difference): Small (0.2), Medium (0.5), Large (0.8)
   - **Odds ratio**: <1.5 (small), 1.5-3 (medium), >3 (large)
   - **Correlation**: <0.3 (small), 0.3-0.5 (medium), >0.5 (large)

**Software:** G*Power, R (pwr package)

---

## 2. Epidemiological Study Designs

### 2.1 Study Design Classification

#### **Observational Studies**

**1. Cross-Sectional Studies**
- **Design**: Snapshot at one time point
- **Analysis**: Prevalence, associations
- **Tests**: Chi-square, logistic regression
- **Limitations**: Cannot establish causality
- **Example**: Survey of diabetes prevalence

**2. Case-Control Studies**
- **Design**: Compare cases (disease) vs controls (no disease)
- **Analysis**: Odds ratio, logistic regression
- **Tests**: Chi-square, conditional logistic regression
- **Limitations**: Recall bias, selection bias
- **Example**: Smoking and lung cancer

**3. Cohort Studies**
- **Design**: Follow exposed vs unexposed over time
- **Analysis**: Risk ratio, incidence rate
- **Tests**: Cox regression, Kaplan-Meier
- **Limitations**: Time-consuming, expensive
- **Example**: Framingham Heart Study

**4. Ecological Studies**
- **Design**: Population-level data
- **Analysis**: Correlation, regression
- **Tests**: Ecological regression
- **Limitations**: Ecological fallacy
- **Example**: Country-level smoking rates and lung cancer

#### **Experimental Studies**

**1. Randomized Controlled Trials (RCTs)**
- **Design**: Random assignment to treatment/control
- **Analysis**: Intention-to-treat, per-protocol
- **Tests**: t-test, ANOVA, survival analysis
- **Reporting**: CONSORT guidelines
- **Example**: Drug efficacy trial

**2. Cluster Randomized Trials**
- **Design**: Randomize groups (e.g., hospitals)
- **Analysis**: Mixed-effects models, GEE
- **Tests**: Account for clustering (ICC)
- **Reporting**: CONSORT extension
- **Example**: School-based intervention

**3. Crossover Trials**
- **Design**: Each participant receives all treatments
- **Analysis**: Paired tests, mixed models
- **Tests**: Account for period and carryover effects
- **Reporting**: CONSORT extension
- **Example**: Drug comparison with washout

**4. Factorial Trials**
- **Design**: Test multiple interventions simultaneously
- **Analysis**: Factorial ANOVA, interaction effects
- **Tests**: Main effects and interactions
- **Reporting**: CONSORT extension
- **Example**: 2x2 design (drug A, drug B, both, neither)

### 2.2 Bias & Confounding Control

#### **Types of Bias**

**1. Selection Bias**
- **Definition**: Systematic difference in who is included
- **Control**: Random sampling, matching
- **Analysis**: Sensitivity analysis

**2. Information Bias**
- **Definition**: Systematic error in measurement
- **Types**: Recall bias, observer bias, misclassification
- **Control**: Blinding, validated instruments
- **Analysis**: Quantitative bias analysis

**3. Confounding**
- **Definition**: Third variable affects both exposure and outcome
- **Control**: Randomization, restriction, matching
- **Analysis**: Stratification, multivariable regression

#### **Confounding Control Methods**

**1. Study Design Phase:**
- **Randomization**: RCTs eliminate confounding
- **Restriction**: Limit to specific subgroup
- **Matching**: Match cases and controls on confounders

**2. Analysis Phase:**
- **Stratification**: Analyze within strata of confounder
- **Multivariable regression**: Adjust for multiple confounders
- **Propensity score**: Match or weight by probability of exposure
- **Instrumental variables**: Use proxy for exposure

**3. Sensitivity Analysis:**
- **Quantitative bias analysis**: Model impact of unmeasured confounding
- **E-value**: Minimum strength of unmeasured confounder

### 2.3 Causal Inference

#### **Bradford Hill Criteria** (Agent should assess):

1. **Strength of association**: Strong associations more likely causal
2. **Consistency**: Replicated across studies
3. **Specificity**: Specific exposure → specific outcome
4. **Temporality**: Exposure precedes outcome (essential)
5. **Biological gradient**: Dose-response relationship
6. **Plausibility**: Biologically plausible mechanism
7. **Coherence**: Consistent with existing knowledge
8. **Experiment**: Experimental evidence supports
9. **Analogy**: Similar exposures have similar effects

#### **Directed Acyclic Graphs (DAGs)**

Agent should:
- Identify confounders, mediators, colliders
- Determine minimal adjustment set
- Avoid collider bias
- Software: R (dagitty package)

---

## 3. Biostatistical Best Practices

### 3.1 Reporting Guidelines

#### **CONSORT (RCTs)**
- 25-item checklist
- Flow diagram (enrollment → allocation → follow-up → analysis)
- Report: randomization, blinding, sample size, outcomes
- Extensions: cluster, non-inferiority, pragmatic trials

#### **STROBE (Observational Studies)**
- 22-item checklist
- Report: design, setting, participants, variables, bias, analysis
- Extensions: case-control, cohort, cross-sectional

#### **PRISMA (Systematic Reviews)**
- 27-item checklist
- Flow diagram (identification → screening → eligibility → included)
- Report: search, selection, data extraction, synthesis

#### **STARD (Diagnostic Accuracy)**
- 30-item checklist
- Report: test methods, reference standard, results

#### **TRIPOD (Prediction Models)**
- 22-item checklist
- Report: development, validation, performance

### 3.2 Statistical Reporting Standards

**Agent must report:**

1. **Descriptive Statistics**:
   - Mean ± SD (normal data)
   - Median [IQR] (non-normal data)
   - n (%) for categorical
   - Range or 95% CI

2. **Inferential Statistics**:
   - Test statistic (t, F, χ², z)
   - Degrees of freedom
   - P-value (exact, not "p<0.05")
   - Effect size with 95% CI
   - Sample size per group

3. **Regression Results**:
   - Coefficient (β) or OR/RR/HR
   - 95% CI
   - P-value
   - Model fit (R², AIC, BIC)
   - Assumptions checked

4. **Survival Analysis**:
   - Median survival with 95% CI
   - Hazard ratio with 95% CI
   - Log-rank p-value
   - Number at risk table

5. **Meta-Analysis**:
   - Pooled effect with 95% CI
   - Heterogeneity (I², τ², Q, p-value)
   - Publication bias (funnel plot, Egger's test)
   - Sensitivity analysis

### 3.3 Multiple Testing Correction

**When to correct:**
- Multiple comparisons (post-hoc tests)
- Multiple outcomes
- Subgroup analyses
- Interim analyses

**Methods:**

| Method | Use Case | Conservativeness |
|--------|----------|------------------|
| Bonferroni | Few comparisons | Very conservative |
| Holm-Bonferroni | Few comparisons | Less conservative |
| Benjamini-Hochberg (FDR) | Many comparisons | Controls false discovery rate |
| Tukey HSD | Post-hoc ANOVA | Balanced |
| Dunnett | Compare to control | Moderate |

**Agent decision rule:**
- <5 comparisons: Bonferroni
- 5-20 comparisons: Holm-Bonferroni
- >20 comparisons: Benjamini-Hochberg

### 3.4 Missing Data Handling

#### **Types of Missingness**

1. **MCAR (Missing Completely At Random)**:
   - Missingness unrelated to any variable
   - Complete case analysis valid
   - Test: Little's MCAR test

2. **MAR (Missing At Random)**:
   - Missingness related to observed variables
   - Multiple imputation valid
   - Most common assumption

3. **MNAR (Missing Not At Random)**:
   - Missingness related to unobserved values
   - Requires sensitivity analysis
   - Most problematic

#### **Handling Methods**

| Method | When to Use | Pros | Cons |
|--------|-------------|------|------|
| Complete case analysis | MCAR, <5% missing | Simple | Loses power, biased if not MCAR |
| Mean imputation | Never recommended | Simple | Underestimates variance |
| Last observation carried forward | Longitudinal data | Simple | Biased |
| Multiple imputation | MAR, >5% missing | Unbiased, preserves variance | Complex |
| Maximum likelihood | MAR | Unbiased | Requires model |
| Sensitivity analysis | MNAR | Assess robustness | Complex |

**Agent recommendation:**
- <5% missing + MCAR: Complete case
- 5-20% missing + MAR: Multiple imputation (m=5-10)
- >20% missing: Sensitivity analysis + report limitations

---

## 4. Data Preparation & Validation

### 4.1 Data Cleaning Pipeline

#### **Step 1: Data Import & Inspection**

```r
# Agent should check:
- File format (CSV, Excel, SPSS, SAS, Stata)
- Encoding (UTF-8, Latin-1)
- Delimiter (comma, tab, semicolon)
- Missing value codes (NA, ., 99, -999)
- Variable names (valid, descriptive)
- Data types (numeric, character, factor, date)
```

**Checks:**
- `str()` - Structure
- `summary()` - Summary statistics
- `head()` / `tail()` - First/last rows
- `dim()` - Dimensions
- `names()` - Variable names

#### **Step 2: Missing Data Assessment**

```r
# Agent should report:
- Percentage missing per variable
- Pattern of missingness (MCAR, MAR, MNAR)
- Visualize: VIM::aggr(), naniar::vis_miss()
- Test: MissMech::TestMCARNormality()
```

#### **Step 3: Outlier Detection**

**Methods:**
1. **Univariate**:
   - Z-score: |z| > 3
   - IQR: < Q1 - 1.5×IQR or > Q3 + 1.5×IQR
   - Box plots

2. **Multivariate**:
   - Mahalanobis distance
   - Cook's distance (regression)
   - Leverage (regression)

**Agent decision:**
- Investigate outliers (data entry error?)
- Report outliers
- Sensitivity analysis (with/without outliers)
- Transform data if appropriate

#### **Step 4: Data Transformation**

**When to transform:**
- Non-normal data for parametric tests
- Heteroscedasticity (unequal variance)
- Non-linear relationships

**Common transformations:**

| Transformation | When to Use | Effect |
|----------------|-------------|--------|
| Log (ln or log10) | Right-skewed, multiplicative | Reduces right skew |
| Square root | Count data, Poisson | Stabilizes variance |
| Reciprocal | Extreme right skew | Strong transformation |
| Box-Cox | Optimize normality | Data-driven |
| Logit | Proportions (0-1) | Unbounded |
| Rank | Non-parametric alternative | Removes distribution |

**Agent should:**
- Check normality before/after transformation
- Report transformation used
- Interpret results on original scale if possible

#### **Step 5: Variable Recoding**

**Continuous → Categorical:**
- Clinical cutoffs (e.g., BMI categories)
- Quantiles (tertiles, quartiles)
- Avoid: Median split (loses power)

**Categorical → Dummy:**
- Create k-1 dummy variables for k categories
- Choose reference category (most common or control)

**Date/Time:**
- Calculate age from date of birth
- Calculate follow-up time
- Handle censoring

### 4.2 Data Validation Rules

#### **Range Checks**

```r
# Agent should validate:
- Age: 0-120 years
- Blood pressure: Systolic 70-250, Diastolic 40-150
- BMI: 10-80 kg/m²
- Lab values: Within physiological range
- Dates: Logical sequence (birth < enrollment < outcome)
```

#### **Consistency Checks**

```r
# Agent should check:
- Male patients not pregnant
- Death date after birth date
- Treatment after diagnosis
- Outcome after baseline
- Sum of categories = total
```

#### **Completeness Checks**

```r
# Agent should verify:
- Required variables present
- Key variables not missing
- Outcome variable complete
- Exposure variable complete
```

### 4.3 Data Quality Report

**Agent should generate:**

1. **Summary Statistics Table**:
   - Variable name, type, n, missing %, mean/median, SD/IQR, range

2. **Missing Data Report**:
   - Pattern visualization
   - MCAR test result
   - Imputation method (if used)

3. **Outlier Report**:
   - Number of outliers per variable
   - Method used for detection
   - Action taken (kept, removed, transformed)

4. **Transformation Report**:
   - Variables transformed
   - Method used
   - Before/after normality tests

5. **Validation Report**:
   - Range violations
   - Consistency violations
   - Action taken

---

## 5. Software & Tool Integration

### 5.1 Statistical Software Comparison

| Software | Strengths | Weaknesses | MCP Integration |
|----------|-----------|------------|-----------------|
| **R** | Free, extensive packages, reproducible | Steep learning curve | ✅ Existing (r-statistics.ts) |
| **Python** | General purpose, ML libraries | Less statistical focus | ✅ Possible (Python MCP) |
| **SPSS** | User-friendly, point-and-click | Expensive, limited flexibility | ⚠️ Via syntax files |
| **SAS** | Industry standard, robust | Very expensive, proprietary | ⚠️ Via batch mode |
| **Stata** | Epidemiology focus, good docs | Expensive, limited graphics | ⚠️ Via do-files |
| **JASP** | Free, Bayesian, GUI | Limited advanced features | ⚠️ Via R integration |
| **jamovi** | Free, R-based, GUI | Limited advanced features | ⚠️ Via R integration |

**Recommendation:** **R as primary**, Python as secondary

### 5.2 Essential R Packages

#### **Core Statistics**
```r
- stats: Base statistical functions
- MASS: Advanced statistics
- car: Regression diagnostics
- lme4: Mixed-effects models
- survival: Survival analysis
- metafor: Meta-analysis
```

#### **Epidemiology**
```r
- epiR: Epidemiological analysis
- Epi: Epidemiological tools
- epitools: Epidemiology tools
- epiDisplay: Epidemiology display
```

#### **Data Manipulation**
```r
- dplyr: Data manipulation
- tidyr: Data tidying
- data.table: Fast data manipulation
```

#### **Visualization**
```r
- ggplot2: Publication-quality graphics
- ggpubr: Publication-ready plots
- survminer: Survival plots
- forestplot: Forest plots
```

#### **Reporting**
```r
- gtsummary: Summary tables
- table1: Baseline tables
- knitr: Dynamic reports
- rmarkdown: Reproducible reports
```

#### **Power Analysis**
```r
- pwr: Power analysis
- simr: Power for mixed models
```

#### **Missing Data**
```r
- mice: Multiple imputation
- VIM: Visualization of missing data
- naniar: Missing data tools
```

#### **Assumptions Testing**
```r
- nortest: Normality tests
- lawstat: Homogeneity tests
```

### 5.3 MCP Server Integration Architecture

#### **Proposed MCP Servers**

**1. R Statistics Server** (Existing - Enhance)
```typescript
// Current: src/mcp/tools/r-statistics.ts
// Enhancements needed:
- Add comprehensive test selection
- Add assumption checking
- Add data validation
- Add power analysis
- Add effect size calculation
- Add diagnostic plots
```

**2. Python Data Science Server** (New)
```typescript
// Proposed: src/mcp/tools/python-datascience.ts
// Features:
- scikit-learn: ML models
- scipy.stats: Statistical tests
- statsmodels: Regression, time series
- pandas: Data manipulation
- seaborn: Visualization
```

**3. Data Validation Server** (New)
```typescript
// Proposed: src/mcp/tools/data-validation.ts
// Features:
- Schema validation (JSON Schema, Zod)
- Range checks
- Consistency checks
- Missing data analysis
- Outlier detection
- Data quality report
```

**4. Statistical Consulting Server** (New)
```typescript
// Proposed: src/mcp/tools/statistical-consulting.ts
// Features:
- Test selection wizard
- Assumption checking
- Power analysis
- Sample size calculation
- Effect size interpretation
- Methodology explanation
```

**5. Epidemiology Server** (New)
```typescript
// Proposed: src/mcp/tools/epidemiology.ts
// Features:
- Study design classification
- Bias assessment
- Confounding analysis
- Causal inference (DAGs)
- Risk/odds ratio calculation
- Standardization (direct, indirect)
```

**6. Reporting Server** (New)
```typescript
// Proposed: src/mcp/tools/statistical-reporting.ts
// Features:
- CONSORT checklist
- STROBE checklist
- Summary tables (Table 1)
- Results formatting
- APA/Vancouver style
- Reproducible reports (R Markdown)
```

### 5.4 External Tool Integration

#### **Data Quality Tools**

**1. Great Expectations** (Python)
- Data validation framework
- Automated testing
- Data documentation
- Integration: Python MCP server

**2. DataCleaner** (Java)
- Data profiling
- Data quality assessment
- Integration: Via command line

**3. OpenRefine** (Java)
- Data cleaning
- Data transformation
- Integration: Via API

#### **Statistical Software**

**1. G*Power**
- Power analysis
- Sample size calculation
- Integration: Via command line (Windows)

**2. JASP / jamovi**
- GUI-based statistics
- Bayesian analysis
- Integration: Via R backend

**3. Jupyter Notebooks**
- Interactive analysis
- Reproducible research
- Integration: Via Python MCP

#### **Visualization Tools**

**1. Tableau / Power BI**
- Interactive dashboards
- Business intelligence
- Integration: Via data export

**2. D3.js / Plotly**
- Interactive web visualizations
- Integration: Via JavaScript/Python

**3. GraphPad Prism**
- Publication-quality graphs
- Integration: Via data export

---

## 6. Quality Assurance Framework

### 6.1 Reproducibility Standards

#### **FAIR Principles**

**Findable:**
- Persistent identifiers (DOI)
- Rich metadata
- Indexed in searchable resource

**Accessible:**
- Open access when possible
- Clear access protocols
- Metadata accessible even if data restricted

**Interoperable:**
- Standard formats (CSV, JSON)
- Standard vocabularies (SNOMED, ICD)
- Linked data

**Reusable:**
- Clear license (CC-BY, CC0)
- Detailed provenance
- Community standards

#### **Reproducible Analysis Checklist**

**Agent must ensure:**

1. **Data:**
   - ✅ Raw data preserved
   - ✅ Data dictionary provided
   - ✅ Data cleaning steps documented
   - ✅ Missing data handling documented

2. **Code:**
   - ✅ Analysis scripts provided
   - ✅ Software versions documented
   - ✅ Package versions documented
   - ✅ Random seeds set

3. **Results:**
   - ✅ All results reproducible
   - ✅ Figures reproducible
   - ✅ Tables reproducible
   - ✅ Statistical tests reproducible

4. **Documentation:**
   - ✅ README file
   - ✅ Analysis plan (pre-registered if possible)
   - ✅ Deviations from plan documented
   - ✅ Sensitivity analyses documented

### 6.2 Statistical Review Checklist

**Agent should perform self-review:**

#### **Study Design**
- [ ] Research question clearly stated
- [ ] Study design appropriate for question
- [ ] Sample size justified (power analysis)
- [ ] Randomization described (if RCT)
- [ ] Blinding described (if applicable)

#### **Data Quality**
- [ ] Data cleaning steps documented
- [ ] Missing data assessed and handled
- [ ] Outliers identified and handled
- [ ] Assumptions checked
- [ ] Transformations justified

#### **Statistical Methods**
- [ ] Tests appropriate for data type
- [ ] Tests appropriate for research question
- [ ] Assumptions met or addressed
- [ ] Multiple testing corrected
- [ ] Effect sizes reported with CI

#### **Results Reporting**
- [ ] Descriptive statistics complete
- [ ] Test statistics reported (t, F, χ², p)
- [ ] Effect sizes with 95% CI
- [ ] Sample sizes per group
- [ ] Figures clear and labeled
- [ ] Tables formatted correctly

#### **Interpretation**
- [ ] Results interpreted correctly
- [ ] Limitations acknowledged
- [ ] Causality not overstated
- [ ] Clinical significance discussed
- [ ] Generalizability discussed

### 6.3 Peer Review Simulation

**Agent should anticipate reviewer questions:**

1. **Why did you choose this test?**
   - Explain decision tree
   - Show assumption checks
   - Justify if assumptions violated

2. **Did you correct for multiple testing?**
   - List all comparisons
   - State correction method
   - Show adjusted p-values

3. **How did you handle missing data?**
   - Report % missing
   - Test MCAR assumption
   - Describe imputation method
   - Sensitivity analysis

4. **Are there confounders?**
   - List potential confounders
   - Show DAG
   - Describe adjustment method
   - Sensitivity to unmeasured confounding

5. **What about outliers?**
   - Show outlier detection method
   - Report number of outliers
   - Sensitivity analysis (with/without)

6. **Is the sample size adequate?**
   - Show power analysis
   - Report achieved power
   - Discuss if underpowered

---

## 7. Agent Architecture Design

### 7.1 Agent Capabilities

**The Data Analysis Agent should have:**

#### **Core Competencies**

1. **Statistical Expertise**
   - Master's/PhD level biostatistics knowledge
   - Epidemiology expertise
   - Clinical trial methodology
   - Meta-analysis expertise

2. **Software Proficiency**
   - R (advanced)
   - Python (intermediate)
   - SPSS/SAS/Stata (basic)
   - SQL (data extraction)

3. **Domain Knowledge**
   - Medical terminology
   - Clinical research
   - Public health
   - Regulatory requirements (FDA, EMA)

4. **Communication Skills**
   - Explain complex statistics simply
   - Write methods sections
   - Create publication-quality tables/figures
   - Respond to reviewer comments

#### **Decision-Making Framework**

```
User Input: Research question + Data
    ↓
Agent Analysis:
    1. Classify study design
    2. Identify variable types
    3. Check data quality
    4. Determine appropriate tests
    5. Check assumptions
    6. Run analysis
    7. Interpret results
    8. Generate report
    ↓
Agent Output: 
    - Statistical analysis
    - Methodology explanation
    - Results interpretation
    - Publication-ready tables/figures
    - Reproducible code
```

### 7.2 Agent Workflow

#### **Phase 1: Data Understanding**

```
Input: Dataset + Research question

Agent Actions:
1. Load and inspect data
   - Check format, encoding, structure
   - Identify variables (outcome, exposure, covariates)
   - Classify variable types
   
2. Generate data summary
   - Descriptive statistics
   - Missing data report
   - Outlier detection
   - Distribution plots

3. Assess data quality
   - Range checks
   - Consistency checks
   - Completeness checks
   - Generate quality report

Output: Data quality report + recommendations
```

#### **Phase 2: Study Design Classification**

```
Input: Research question + Study description

Agent Actions:
1. Classify study design
   - Observational vs experimental
   - Cross-sectional, case-control, cohort, RCT
   - Identify design-specific considerations

2. Identify potential biases
   - Selection bias
   - Information bias
   - Confounding

3. Determine reporting guidelines
   - CONSORT, STROBE, PRISMA, etc.

Output: Study design classification + bias assessment
```

#### **Phase 3: Statistical Test Selection**

```
Input: Research question + Data characteristics

Agent Actions:
1. Follow decision tree
   - Number of variables
   - Variable types
   - Number of groups
   - Data distribution
   - Sample size

2. Check assumptions
   - Normality (Shapiro-Wilk)
   - Homogeneity (Levene's test)
   - Independence
   - Linearity (if regression)

3. Select appropriate test
   - Primary test
   - Alternative if assumptions violated
   - Post-hoc tests if needed
   - Multiple testing correction

4. Calculate power
   - A priori or post-hoc
   - Effect size
   - Interpret adequacy

Output: Test selection with justification
```

#### **Phase 4: Data Preparation**

```
Input: Raw data + Test requirements

Agent Actions:
1. Handle missing data
   - Assess missingness pattern
   - Choose imputation method
   - Perform imputation
   - Sensitivity analysis

2. Handle outliers
   - Detect outliers
   - Investigate (data error?)
   - Decide: keep, remove, transform
   - Sensitivity analysis

3. Transform data (if needed)
   - Choose transformation
   - Apply transformation
   - Check assumptions again

4. Create analysis dataset
   - Select variables
   - Recode variables
   - Create derived variables
   - Final validation

Output: Clean analysis dataset + documentation
```

#### **Phase 5: Statistical Analysis**

```
Input: Clean dataset + Selected test

Agent Actions:
1. Run descriptive statistics
   - Overall and by group
   - Create Table 1

2. Run inferential tests
   - Primary analysis
   - Sensitivity analyses
   - Subgroup analyses (if planned)

3. Generate effect sizes
   - Calculate effect size
   - Calculate 95% CI
   - Interpret magnitude

4. Create visualizations
   - Distribution plots
   - Comparison plots
   - Forest plots (if meta-analysis)
   - Survival curves (if survival analysis)

Output: Statistical results + visualizations
```

#### **Phase 6: Results Interpretation**

```
Input: Statistical results

Agent Actions:
1. Interpret statistical significance
   - P-value interpretation
   - Avoid "significant" vs "non-significant" dichotomy
   - Consider clinical significance

2. Interpret effect size
   - Magnitude (small, medium, large)
   - Clinical relevance
   - Precision (CI width)

3. Assess limitations
   - Sample size
   - Missing data
   - Confounding
   - Generalizability

4. Generate conclusions
   - Answer research question
   - Acknowledge limitations
   - Suggest future research

Output: Interpretation + conclusions
```

#### **Phase 7: Report Generation**

```
Input: All analysis results

Agent Actions:
1. Write methods section
   - Study design
   - Participants
   - Variables
   - Statistical analysis
   - Software used

2. Write results section
   - Descriptive statistics
   - Inferential statistics
   - Tables and figures
   - Follow reporting guidelines

3. Create tables
   - Table 1: Baseline characteristics
   - Table 2+: Main results
   - APA/Vancouver formatting

4. Create figures
   - Publication-quality
   - Clear labels
   - Appropriate colors
   - High resolution

5. Generate reproducible report
   - R Markdown or Jupyter Notebook
   - Include all code
   - Include session info

Output: Complete statistical report
```

### 7.3 Agent Personality & Communication Style

**The agent should communicate like a senior biostatistician:**

**Characteristics:**
- **Pedagogical**: Explains concepts clearly
- **Cautious**: Acknowledges limitations
- **Precise**: Uses exact terminology
- **Transparent**: Shows reasoning
- **Collaborative**: Asks clarifying questions
- **Ethical**: Refuses p-hacking or data dredging

**Example Interactions:**

**User:** "Run a t-test on this data."

**Agent:** "I'd be happy to help with your analysis. Before running a t-test, let me check a few things:

1. **Research Question**: What are you comparing? (e.g., treatment vs control)
2. **Data Structure**: Are these independent groups or paired measurements?
3. **Assumptions**: Let me check if your data meets t-test assumptions:
   - Normality: [runs Shapiro-Wilk test]
   - Equal variance: [runs Levene's test]
   - Sample size: n₁=30, n₂=28

**Results of assumption checks:**
- Normality: Both groups normally distributed (p>0.05)
- Equal variance: Variances are equal (p=0.42)
- Sample size: Adequate for t-test

**Recommendation**: Independent samples t-test is appropriate.

**Alternative**: If assumptions were violated, I would recommend Mann-Whitney U test.

Shall I proceed with the t-test?"

---

**User:** "Why is my result not significant?"

**Agent:** "Let me help you understand your results. A non-significant result (p>0.05) doesn't mean 'no effect' - it means we don't have enough evidence to conclude there's an effect. Let me analyze:

**Your Results:**
- Mean difference: 2.3 units
- 95% CI: [-0.5, 5.1]
- p-value: 0.09
- Sample size: n=25 per group
- Effect size (Cohen's d): 0.42 (medium)

**Interpretation:**
1. **Statistical significance**: p=0.09 is close to 0.05, suggesting a trend
2. **Clinical significance**: A 2.3 unit difference may be clinically meaningful
3. **Confidence interval**: Includes zero, but also includes potentially important effects
4. **Power**: Let me calculate... [runs power analysis]
   - Achieved power: 52%
   - This means you had only a 52% chance of detecting this effect

**Conclusion**: Your study may be **underpowered**. The effect size is medium (d=0.42), but your sample size was too small to detect it reliably.

**Recommendations:**
1. Don't conclude 'no effect' - say 'no statistically significant difference detected'
2. Report the effect size and CI
3. Consider this a pilot study
4. For a future study with 80% power, you'd need n=90 per group

Would you like me to run a sensitivity analysis or explore other factors?"

---

## 8. Methodology Explanation System

### 8.1 Explanation Framework

**Agent should explain at 3 levels:**

#### **Level 1: Executive Summary** (for non-statisticians)

```
Example:
"I compared the average blood pressure between the treatment and control groups using a statistical test called an independent t-test. The treatment group had significantly lower blood pressure (mean difference: 8.2 mmHg, 95% CI: 3.1-13.3, p=0.003). This means we can be 95% confident the true difference is between 3.1 and 13.3 mmHg, and this result is unlikely to be due to chance (p=0.003)."
```

#### **Level 2: Methods Section** (for researchers)

```
Example:
"Continuous variables were assessed for normality using the Shapiro-Wilk test and visual inspection of Q-Q plots. Between-group comparisons of normally distributed continuous variables were performed using independent samples t-tests. For non-normally distributed variables, Mann-Whitney U tests were used. Homogeneity of variance was assessed using Levene's test. Effect sizes were calculated as Cohen's d with 95% confidence intervals. All tests were two-tailed with α=0.05. Multiple comparisons were adjusted using the Holm-Bonferroni method. Statistical analyses were performed using R version 4.3.0 (R Core Team, 2023)."
```

#### **Level 3: Technical Details** (for statisticians/reviewers)

```
Example:
"The independent samples t-test assumes: (1) independence of observations, (2) normality of the dependent variable within each group, and (3) homogeneity of variance between groups. 

Assumption checks:
- Independence: Satisfied by study design (random assignment)
- Normality: Shapiro-Wilk test for treatment group (W=0.97, p=0.42) and control group (W=0.96, p=0.31) indicated no significant departure from normality. Q-Q plots showed good fit to normal distribution.
- Homogeneity: Levene's test (F=0.68, p=0.41) indicated equal variances.

Given that all assumptions were satisfied, the independent samples t-test was appropriate. The test statistic was t(58)=3.15, p=0.003 (two-tailed). The effect size (Cohen's d=0.82, 95% CI: 0.28-1.35) indicated a large effect. Post-hoc power analysis indicated 89% power to detect this effect size.

Sensitivity analysis excluding 2 outliers (>3 SD from mean) yielded similar results (t(56)=2.98, p=0.004), confirming robustness of findings."
```

### 8.2 Decision Justification Template

**For every analysis decision, agent should explain:**

```
Decision: [What was decided]
Rationale: [Why this decision was made]
Alternatives: [What other options were considered]
Implications: [How this affects interpretation]
```

**Example:**

```
Decision: Used Mann-Whitney U test instead of t-test

Rationale: 
- Shapiro-Wilk test indicated non-normal distribution (p=0.02)
- Q-Q plot showed heavy right tail
- Sample size was small (n=18 per group)
- Transformation did not improve normality

Alternatives considered:
1. Log transformation + t-test: Did not achieve normality
2. Proceed with t-test: Risky with small sample and non-normality
3. Bootstrap t-test: More complex, similar power to Mann-Whitney

Implications:
- Mann-Whitney tests for difference in medians, not means
- Slightly less power than t-test if data were truly normal
- More robust to outliers and non-normality
- Results reported as median difference with 95% CI
```

### 8.3 Assumption Violation Handling

**Agent should explain when assumptions are violated:**

```
Assumption: Normality
Status: VIOLATED
Evidence: 
- Shapiro-Wilk test: W=0.89, p=0.008
- Q-Q plot: Deviation in tails
- Histogram: Right-skewed

Options:
1. Transform data (log, sqrt, Box-Cox)
2. Use non-parametric test (Mann-Whitney, Kruskal-Wallis)
3. Use robust methods (trimmed means, bootstrap)
4. Proceed with parametric test (if n>30, CLT applies)

Recommendation: [Agent's choice with justification]

Action taken: [What was actually done]

Impact on results: [How this affects interpretation]
```

---

## 9. Implementation Recommendations

### 9.1 Priority 1: Enhance Existing R Statistics Tool

**File:** `src/mcp/tools/r-statistics.ts`

**Current Capabilities:**
- Meta-analysis (metafor)
- Forest plots

**Enhancements Needed:**

1. **Add Test Selection Function**
```typescript
export async function selectStatisticalTest(args: {
  research_question: string;
  outcome_type: 'continuous' | 'binary' | 'ordinal' | 'count' | 'time-to-event';
  predictor_type: 'continuous' | 'binary' | 'categorical';
  num_groups: number;
  paired: boolean;
  sample_size: number;
  data_file?: string; // Optional: for assumption checking
}) {
  // R code to:
  // 1. Classify research question
  // 2. Follow decision tree
  // 3. Check assumptions (if data provided)
  // 4. Recommend test(s)
  // 5. Explain rationale
}
```

2. **Add Assumption Checking Function**
```typescript
export async function checkAssumptions(args: {
  data_file: string;
  test_type: 't-test' | 'anova' | 'regression' | 'chi-square';
  variables: {
    outcome: string;
    predictors?: string[];
    groups?: string;
  };
}) {
  // R code to:
  // 1. Test normality (Shapiro-Wilk, Q-Q plot)
  // 2. Test homogeneity (Levene's test)
  // 3. Test independence (Durbin-Watson)
  // 4. Detect outliers (box plots, Cook's distance)
  // 5. Generate diagnostic plots
  // 6. Provide recommendations
}
```

3. **Add Data Validation Function**
```typescript
export async function validateData(args: {
  data_file: string;
  variable_specs: {
    name: string;
    type: 'continuous' | 'categorical' | 'date';
    range?: [number, number];
    allowed_values?: string[];
  }[];
}) {
  // R code to:
  // 1. Check data types
  // 2. Check ranges
  // 3. Check missing data
  // 4. Check outliers
  // 5. Check consistency
  // 6. Generate quality report
}
```

4. **Add Power Analysis Function**
```typescript
export async function calculatePower(args: {
  test_type: string;
  effect_size?: number;
  sample_size?: number;
  power?: number;
  alpha?: number;
  calculate: 'power' | 'sample_size' | 'effect_size';
}) {
  // R code using pwr package:
  // 1. Calculate requested parameter
  // 2. Generate power curve
  // 3. Interpret results
  // 4. Provide recommendations
}
```

5. **Add Comprehensive Analysis Function**
```typescript
export async function runComprehensiveAnalysis(args: {
  data_file: string;
  research_question: string;
  outcome: string;
  predictors: string[];
  covariates?: string[];
  study_design: 'cross-sectional' | 'case-control' | 'cohort' | 'rct';
  reporting_guideline?: 'CONSORT' | 'STROBE' | 'PRISMA';
}) {
  // R code to:
  // 1. Validate data
  // 2. Generate descriptive statistics (Table 1)
  // 3. Select appropriate tests
  // 4. Check assumptions
  // 5. Run analyses
  // 6. Calculate effect sizes
  // 7. Generate plots
  // 8. Create reproducible report (R Markdown)
  // 9. Export results
}
```

### 9.2 Priority 2: Create Statistical Consulting Agent

**File:** `.opencode/agent/medresearch/statistician-agent-v2.md`

**Enhanced Capabilities:**

```markdown
# Statistician Agent v2.0 - Expert Data Analysis

## Role
You are a senior biostatistician with expertise in:
- Epidemiology
- Clinical trials
- Meta-analysis
- Causal inference
- Regulatory statistics (FDA/EMA)

## Expertise Level
- PhD in Biostatistics
- 15+ years experience
- Published 100+ papers
- Reviewed for top journals (NEJM, Lancet, JAMA)

## Core Responsibilities

### 1. Statistical Consultation
- Understand research question
- Classify study design
- Recommend appropriate methods
- Explain statistical concepts clearly

### 2. Test Selection
- Follow systematic decision tree
- Check all assumptions
- Justify test choice
- Provide alternatives

### 3. Data Quality Assessment
- Validate data
- Handle missing data
- Detect outliers
- Transform if needed

### 4. Analysis Execution
- Run appropriate tests
- Calculate effect sizes
- Generate visualizations
- Perform sensitivity analyses

### 5. Results Interpretation
- Explain statistical significance
- Interpret effect sizes
- Assess clinical significance
- Acknowledge limitations

### 6. Reporting
- Write methods section
- Create results tables
- Generate figures
- Follow reporting guidelines (CONSORT, STROBE)

## Decision-Making Framework

[Include full decision tree from research document]

## Communication Style

- Pedagogical: Explain concepts clearly
- Cautious: Acknowledge limitations
- Precise: Use exact terminology
- Transparent: Show reasoning
- Collaborative: Ask clarifying questions
- Ethical: Refuse p-hacking

## Tools Available

[List all MCP tools with descriptions]

## Workflow

[Include 7-phase workflow from research document]

## Quality Checks

[Include statistical review checklist]

## Example Interactions

[Include example dialogues showing expertise]
```

### 9.3 Priority 3: Create New MCP Tools

**1. Data Validation Tool**
```typescript
// src/mcp/tools/data-validation.ts

export async function validateDataset(args: {
  data_file: string;
  schema: DataSchema;
  checks: ValidationCheck[];
}) {
  // Validate data against schema
  // Run range checks
  // Run consistency checks
  // Generate quality report
}

export async function assessMissingData(args: {
  data_file: string;
  variables: string[];
}) {
  // Calculate % missing per variable
  // Test MCAR assumption
  // Visualize missing patterns
  // Recommend imputation method
}

export async function detectOutliers(args: {
  data_file: string;
  variables: string[];
  method: 'zscore' | 'iqr' | 'mahalanobis';
}) {
  // Detect outliers
  // Generate diagnostic plots
  // Recommend action
}
```

**2. Epidemiology Tool**
```typescript
// src/mcp/tools/epidemiology.ts

export async function classifyStudyDesign(args: {
  description: string;
  features: StudyFeatures;
}) {
  // Classify study design
  // Identify potential biases
  // Recommend reporting guideline
}

export async function calculateRiskMeasures(args: {
  data: ContingencyTable;
  measure: 'risk_ratio' | 'odds_ratio' | 'risk_difference';
}) {
  // Calculate risk measures
  // Calculate 95% CI
  // Interpret results
}

export async function createDAG(args: {
  exposure: string;
  outcome: string;
  variables: string[];
  relationships: Relationship[];
}) {
  // Create DAG
  // Identify confounders
  // Identify mediators
  // Identify colliders
  // Recommend adjustment set
}
```

**3. Statistical Reporting Tool**
```typescript
// src/mcp/tools/statistical-reporting.ts

export async function generateTable1(args: {
  data_file: string;
  variables: string[];
  group_by?: string;
  style: 'apa' | 'vancouver' | 'nejm';
}) {
  // Generate baseline characteristics table
  // Format according to style
  // Export to Word/LaTeX
}

export async function generateMethodsSection(args: {
  study_design: string;
  analyses: Analysis[];
  software: string[];
}) {
  // Write methods section
  // Include all statistical details
  // Follow reporting guidelines
}

export async function checkReportingGuideline(args: {
  guideline: 'CONSORT' | 'STROBE' | 'PRISMA';
  manuscript: string;
}) {
  // Check against checklist
  // Identify missing items
  // Provide recommendations
}
```

### 9.4 Priority 4: Integration with External Tools

**1. Integrate with Jupyter Notebooks**
```typescript
// Allow Python-based analysis
// Interactive exploration
// Machine learning integration
```

**2. Integrate with Great Expectations**
```typescript
// Automated data validation
// Data quality monitoring
// Expectation suites
```

**3. Integrate with DVC (Data Version Control)**
```typescript
// Version control for data
// Reproducible pipelines
// Experiment tracking
```

**4. Integrate with MLflow**
```typescript
// Track experiments
// Model registry
// Reproducibility
```

---

## 10. Future Enhancements

### 10.1 Advanced Statistical Methods

**1. Bayesian Analysis**
- Prior specification
- MCMC sampling (Stan, JAGS)
- Posterior interpretation
- Bayes factors

**2. Machine Learning**
- Prediction models
- Feature selection
- Cross-validation
- Model interpretation (SHAP, LIME)

**3. Causal Inference**
- Propensity score methods
- Instrumental variables
- Difference-in-differences
- Regression discontinuity

**4. Advanced Survival Analysis**
- Competing risks
- Multi-state models
- Recurrent events
- Cure models

**5. Longitudinal Data Analysis**
- Mixed-effects models
- GEE
- Growth curve models
- Time series

### 10.2 AI-Assisted Features

**1. Automated Test Selection**
- ML model trained on expert decisions
- Natural language processing of research questions
- Automatic assumption checking

**2. Intelligent Data Cleaning**
- Anomaly detection
- Automated imputation
- Smart transformation suggestions

**3. Results Interpretation**
- Natural language generation
- Context-aware explanations
- Automated literature comparison

**4. Peer Review Simulation**
- Anticipate reviewer questions
- Generate responses
- Identify weaknesses

### 10.3 Collaboration Features

**1. Multi-User Support**
- Shared analysis workspace
- Version control for analyses
- Comment and review system

**2. Real-Time Consultation**
- Chat with statistician agent
- Interactive analysis
- Live code execution

**3. Teaching Mode**
- Step-by-step explanations
- Interactive tutorials
- Practice datasets

---

## Summary & Recommendations

### Immediate Actions (Week 1-2)

1. **Enhance R Statistics Tool**
   - Add test selection function
   - Add assumption checking
   - Add data validation
   - Add power analysis

2. **Update Statistician Agent**
   - Add decision tree
   - Add methodology explanation
   - Add quality checks
   - Add example interactions

3. **Create Documentation**
   - Statistical methods guide
   - Test selection flowchart
   - Assumption checking guide
   - Reporting guidelines

### Short-Term (Month 1)

4. **Create New MCP Tools**
   - Data validation tool
   - Epidemiology tool
   - Statistical reporting tool

5. **Integration**
   - Python data science server
   - Jupyter notebook integration
   - Great Expectations integration

6. **Testing**
   - Create test datasets
   - Validate against known results
   - User acceptance testing

### Medium-Term (Quarter 1)

7. **Advanced Features**
   - Bayesian analysis
   - Machine learning integration
   - Causal inference tools

8. **Quality Assurance**
   - Automated testing
   - Peer review simulation
   - Reproducibility checks

9. **Documentation**
   - Comprehensive user guide
   - Video tutorials
   - Case studies

### Long-Term (Year 1)

10. **AI Enhancement**
    - Automated test selection
    - Intelligent data cleaning
    - Natural language results

11. **Collaboration**
    - Multi-user support
    - Real-time consultation
    - Teaching mode

12. **Validation**
    - External validation studies
    - Comparison with expert statisticians
    - Publication in methods journal

---

**This research document provides the foundation for creating a world-class Data Analysis Agent that rivals expert biostatisticians in capability, rigor, and communication.**

*Research completed: December 4, 2025*  
*Next step: Implementation planning*
