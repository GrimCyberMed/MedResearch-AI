# Meta-Analysis - Domain Knowledge

## Overview
Meta-analysis is a statistical technique for combining quantitative results from multiple independent studies to produce a single pooled estimate of effect. It increases statistical power, resolves uncertainty when studies disagree, and provides more precise estimates than individual studies.

## When to Conduct Meta-Analysis

### Appropriate Scenarios ✅
- **Clinical homogeneity**: Studies address same question (PICO)
- **Methodological similarity**: Comparable study designs
- **Outcome consistency**: Same or similar outcome measures
- **Sufficient studies**: Generally ≥3 studies (preferably ≥5)
- **Acceptable heterogeneity**: I² <75% or explainable heterogeneity

### Inappropriate Scenarios ❌
- **Apples and oranges**: Different populations, interventions, or outcomes
- **Extreme heterogeneity**: I² >75% with no clear explanation
- **High risk of bias**: All studies have critical flaws
- **Single study**: No pooling possible
- **Incompatible metrics**: Cannot convert to common effect measure

## Effect Measures

### Binary Outcomes

#### 1. Risk Ratio (RR) / Relative Risk
- **Formula**: RR = (a/(a+b)) / (c/(c+d))
- **Interpretation**: RR=2 means 2× risk in intervention vs control
- **Range**: 0 to ∞ (RR=1 is null effect)
- **Use**: Cohort studies, RCTs with common outcomes
- **Example**: RR=0.75 means 25% risk reduction

#### 2. Odds Ratio (OR)
- **Formula**: OR = (a/b) / (c/d) = ad/bc
- **Interpretation**: OR=2 means 2× odds in intervention vs control
- **Range**: 0 to ∞ (OR=1 is null effect)
- **Use**: Case-control studies, logistic regression, rare outcomes
- **Note**: Approximates RR when outcome is rare (<10%)

#### 3. Risk Difference (RD)
- **Formula**: RD = (a/(a+b)) - (c/(c+d))
- **Interpretation**: Absolute difference in risk
- **Range**: -1 to +1 (RD=0 is null effect)
- **Use**: When absolute effects are important (NNT calculation)
- **Example**: RD=-0.10 means 10% absolute risk reduction

**Number Needed to Treat (NNT)**:
- NNT = 1 / |RD|
- Example: RD=-0.10 → NNT=10 (treat 10 to prevent 1 event)

### Continuous Outcomes

#### 1. Mean Difference (MD)
- **Formula**: MD = Mean₁ - Mean₂
- **Interpretation**: Difference in means on original scale
- **Use**: Same outcome measure across studies (e.g., all use Beck Depression Inventory)
- **Example**: MD=-5.2 points on BDI-II scale

#### 2. Standardized Mean Difference (SMD)
- **Formula**: SMD = (Mean₁ - Mean₂) / Pooled SD
- **Common metrics**:
  - **Cohen's d**: Uses pooled SD
  - **Hedges' g**: Bias-corrected for small samples
  - **Glass's Δ**: Uses control group SD only
- **Interpretation** (Cohen's benchmarks):
  - Small: 0.2
  - Medium: 0.5
  - Large: 0.8
- **Use**: Different scales measuring same construct (e.g., various depression scales)
- **Example**: SMD=-0.42 is small-to-medium effect

### Time-to-Event Outcomes

#### Hazard Ratio (HR)
- **Interpretation**: Instantaneous risk over time
- **Range**: 0 to ∞ (HR=1 is null effect)
- **Use**: Survival analysis, time-to-event data
- **Example**: HR=0.70 means 30% reduction in hazard

### Correlation Outcomes

#### Correlation Coefficient (r)
- **Range**: -1 to +1 (r=0 is null effect)
- **Transformation**: Fisher's z for meta-analysis
- **Use**: Association studies, validation studies

## Meta-Analysis Models

### Fixed-Effect Model

**Assumption**: All studies estimate the **same true effect**
- Differences between studies are due to sampling error only
- One true effect size exists

**Weighting**: Inverse variance (larger studies get more weight)
- Weight = 1 / SE²

**When to Use**:
- Studies are nearly identical (same population, intervention, setting)
- I² = 0% (no heterogeneity)
- Narrow question with homogeneous studies

**Formula** (inverse variance method):
```
Pooled Effect = Σ(Effect_i × Weight_i) / Σ(Weight_i)
SE = 1 / √(Σ Weight_i)
```

### Random-Effects Model

**Assumption**: Studies estimate **different but related effects**
- True effects vary across studies (heterogeneity)
- Studies are a random sample from a distribution of effects

**Weighting**: Inverse variance + between-study variance (τ²)
- Weight = 1 / (SE² + τ²)
- Gives more equal weight to studies than fixed-effect

**When to Use**:
- Studies differ in populations, interventions, or settings
- I² > 0% (heterogeneity present)
- Broad question with diverse studies
- **Default choice** for most meta-analyses

**Methods for Estimating τ²**:
1. **DerSimonian-Laird (DL)**: Classic, simple, but underestimates τ²
2. **Restricted Maximum Likelihood (REML)**: More accurate, recommended
3. **Paule-Mandel**: Robust to outliers
4. **Hartung-Knapp-Sidik-Jonkman (HKSJ)**: Better CI coverage for small n

**Formula**:
```
Pooled Effect = Σ(Effect_i × Weight_i*) / Σ(Weight_i*)
where Weight_i* = 1 / (SE_i² + τ²)
```

### Model Selection

| Scenario | Model | Rationale |
|----------|-------|-----------|
| I² = 0%, identical studies | Fixed-effect | No heterogeneity |
| I² > 0%, diverse studies | Random-effects | Heterogeneity present |
| Uncertain | Random-effects | Conservative, wider CIs |
| Very few studies (n<5) | Fixed-effect + sensitivity | Random-effects may be unstable |

**Best Practice**: Report both models and compare results

## Heterogeneity Assessment

### Why It Matters
Heterogeneity indicates variability in true effects across studies. High heterogeneity suggests:
- Studies are too different to pool
- Subgroup effects may exist
- Meta-analysis result may not be meaningful

### Measures of Heterogeneity

#### 1. Cochran's Q Test
- **Null hypothesis**: All studies share the same true effect
- **Interpretation**: p < 0.10 suggests significant heterogeneity
- **Limitation**: Low power with few studies, high power with many studies

#### 2. I² Statistic (Most Important)
- **Formula**: I² = ((Q - df) / Q) × 100%
- **Interpretation**:
  - **0-40%**: Might not be important
  - **30-60%**: May represent moderate heterogeneity
  - **50-90%**: May represent substantial heterogeneity
  - **75-100%**: Considerable heterogeneity
- **Advantages**: Not affected by number of studies
- **Note**: Thresholds are tentative; consider context

#### 3. Tau² (τ²)
- **Meaning**: Variance of true effects across studies
- **Interpretation**: Absolute measure of heterogeneity
- **Use**: Quantifies between-study variance in random-effects model

#### 4. Prediction Interval
- **Meaning**: Range where true effect in a new study would fall (95% probability)
- **Interpretation**: Wide interval = high heterogeneity
- **Use**: Shows uncertainty in applying results to new settings
- **Formula**: Pooled effect ± t × √(SE² + τ²)

### Investigating Heterogeneity

**Step 1: Visual Inspection**
- Forest plot: Look for non-overlapping CIs
- Check for outliers

**Step 2: Subgroup Analysis**
- Pre-specified characteristics (age, sex, disease severity, intervention dose)
- Test for subgroup differences (Q_between)
- **Caution**: Post-hoc subgroups are exploratory only

**Step 3: Meta-Regression**
- Continuous moderators (year, dose, duration)
- **Requirement**: ≥10 studies per covariate
- **Caution**: Observational, prone to confounding

**Step 4: Sensitivity Analysis**
- Exclude high risk of bias studies
- Exclude outliers
- Change meta-analysis model
- Use different effect measures

## Publication Bias

### What It Is
Tendency for studies with positive/significant results to be published more than studies with negative/null results. This distorts meta-analysis results.

### Detection Methods

#### 1. Funnel Plot
- **X-axis**: Effect size
- **Y-axis**: Precision (1/SE) or sample size
- **Expected**: Symmetric inverted funnel
- **Asymmetry suggests**: Publication bias, heterogeneity, or chance
- **Limitation**: Subjective, requires ≥10 studies

#### 2. Egger's Test
- **Method**: Regression of effect size on precision
- **Null hypothesis**: No small-study effects
- **Interpretation**: p < 0.10 suggests asymmetry
- **Limitation**: Low power with <10 studies, affected by heterogeneity

#### 3. Trim-and-Fill
- **Method**: Imputes missing studies to make funnel plot symmetric
- **Output**: Adjusted pooled effect
- **Interpretation**: Large change suggests publication bias
- **Limitation**: Assumes asymmetry is due to publication bias only

#### 4. PET-PEESE
- **PET**: Precision-Effect Test (regression on SE)
- **PEESE**: Precision-Effect Estimate with Standard Error (regression on SE²)
- **Use**: Corrects for small-study effects
- **Recommendation**: Use PEESE if PET shows significant effect

### Prevention Strategies
✅ Search trial registries (ClinicalTrials.gov, WHO ICTRP)
✅ Include grey literature (conference abstracts, dissertations)
✅ Contact authors for unpublished data
✅ Search regulatory documents (FDA, EMA)
✅ Check for selective outcome reporting

## Forest Plots

### Components
1. **Study labels**: Author, year
2. **Effect estimates**: Squares (size ∝ weight)
3. **Confidence intervals**: Horizontal lines
4. **Pooled estimate**: Diamond (width = 95% CI)
5. **Line of no effect**: Vertical line at RR=1 or MD=0
6. **Heterogeneity statistics**: I², τ², Q, p-value
7. **Weights**: Percentage contribution of each study

### Interpretation
- **Squares left of line**: Favors intervention
- **Squares right of line**: Favors control
- **CI crosses line**: Not statistically significant
- **Diamond crosses line**: Pooled effect not significant
- **Non-overlapping CIs**: Suggests heterogeneity

### Best Practices
- Order studies by year, weight, or effect size
- Use log scale for ratio measures (RR, OR, HR)
- Include prediction interval if heterogeneity present
- Label axes clearly
- Report I² and τ² on plot

## Sensitivity Analysis

### Purpose
Test robustness of findings to methodological decisions

### Common Sensitivity Analyses

1. **Risk of Bias**
   - Exclude high/unclear risk of bias studies
   - Compare low vs high risk of bias subgroups

2. **Study Design**
   - RCTs only vs all study types
   - Published vs unpublished

3. **Statistical Model**
   - Fixed-effect vs random-effects
   - Different τ² estimators (DL vs REML)

4. **Effect Measure**
   - RR vs OR vs RD
   - Different SMD formulas (Cohen's d vs Hedges' g)

5. **Outliers**
   - Exclude studies with extreme effects
   - Use influence analysis (leave-one-out)

6. **Missing Data**
   - Best-case vs worst-case scenarios
   - Complete case vs imputed data

### Reporting
- Pre-specify key sensitivity analyses in protocol
- Report all planned analyses (even if results unchanged)
- Interpret cautiously if results change substantially

## Subgroup Analysis

### Pre-Specification
✅ Define subgroups in protocol before seeing data
✅ Limit to 3-5 pre-specified subgroups
✅ Base on biological/clinical rationale

### Statistical Testing
- **Test for subgroup differences**: Q_between, p-value
- **Interpretation**: p < 0.10 suggests subgroup effect
- **Caution**: Observational, prone to false positives

### Credibility Criteria (ICEMAN)
1. **I**ndirect: Is comparison within-study or between-study?
2. **C**onsistency: Is effect consistent across studies?
3. **E**ffect size: Is subgroup difference large?
4. **M**agnitude: Are effects in opposite directions?
5. **A**priori: Was subgroup pre-specified?
6. **N**umber: Were few subgroups tested?

**High credibility**: Meets most criteria
**Low credibility**: Post-hoc, many subgroups, small difference

## Meta-Regression

### Purpose
Explore sources of heterogeneity using continuous or categorical moderators

### Requirements
- **Minimum studies**: ≥10 per covariate (some say ≥6)
- **Sufficient variability**: Moderator must vary across studies
- **Avoid overfitting**: Limit covariates to avoid spurious findings

### Methods
- **Fixed-effects meta-regression**: Assumes no residual heterogeneity
- **Random-effects meta-regression**: Allows residual heterogeneity (more common)
- **Mixed-effects model**: Combines subgroup analysis and meta-regression

### Interpretation
- **Coefficient**: Change in effect per unit change in moderator
- **R²**: Proportion of heterogeneity explained
- **p-value**: Significance of moderator

### Limitations
- **Ecological fallacy**: Study-level associations ≠ individual-level
- **Confounding**: Moderators may be correlated
- **Low power**: Requires many studies
- **Observational**: Cannot infer causation

## Network Meta-Analysis (NMA)

### Purpose
Compare multiple interventions simultaneously, including indirect comparisons

### Example
- Direct evidence: A vs B, B vs C
- Indirect evidence: A vs C (through B)
- Network estimate: Combines direct + indirect

### Assumptions
- **Transitivity**: Populations are similar across comparisons
- **Consistency**: Direct and indirect evidence agree

### Methods
- **Frequentist**: Multivariate meta-analysis
- **Bayesian**: MCMC estimation

### Outputs
- **League table**: All pairwise comparisons
- **SUCRA**: Surface Under Cumulative Ranking curve (ranking interventions)
- **Network plot**: Visual representation of evidence network

### Software
- R: netmeta, gemtc packages
- Stata: network, mvmeta commands
- WinBUGS/OpenBUGS: Bayesian NMA

## Software and Implementation

### R Packages

#### meta (Recommended)
```r
library(meta)

# Binary outcomes
m <- metabin(event.e, n.e, event.c, n.c,
             studlab = study,
             data = mydata,
             sm = "RR",
             method = "MH",
             random = TRUE,
             method.tau = "REML")

# Continuous outcomes
m <- metacont(n.e, mean.e, sd.e, n.c, mean.c, sd.c,
              studlab = study,
              data = mydata,
              sm = "SMD",
              random = TRUE,
              method.tau = "REML")

# Forest plot
forest(m, sortvar = TE, prediction = TRUE)

# Funnel plot
funnel(m)
metabias(m, method = "Egger")
```

#### metafor
```r
library(metafor)

# Calculate effect sizes
dat <- escalc(measure = "SMD",
              m1i = mean.e, sd1i = sd.e, n1i = n.e,
              m2i = mean.c, sd2i = sd.c, n2i = n.c,
              data = mydata)

# Random-effects model
res <- rma(yi, vi, data = dat, method = "REML")

# Meta-regression
res <- rma(yi, vi, mods = ~ year + dose, data = dat)

# Influence analysis
inf <- influence(res)
plot(inf)
```

### RevMan (Cochrane)
- User-friendly GUI
- Integrated with Cochrane reviews
- Limited customization
- Free download

### Stata
```stata
* Binary outcomes
metan events_e total_e events_c total_c, rr random
forest

* Continuous outcomes
metan mean_e sd_e n_e mean_c sd_c n_c, cohen random
forest

* Meta-regression
metareg effect moderator, wsse(se)
```

## Reporting Standards

### PRISMA 2020 Meta-Analysis Items
- **Methods**: Effect measure, synthesis method, heterogeneity assessment, sensitivity analyses
- **Results**: Forest plot, heterogeneity statistics (I², τ², Q), sensitivity analysis results, publication bias assessment
- **Discussion**: Certainty of evidence (GRADE), limitations, implications

### Essential Statistics to Report
1. **Pooled effect**: Estimate + 95% CI
2. **Heterogeneity**: I², τ², Q, p-value
3. **Prediction interval**: If heterogeneity present
4. **Number of studies and participants**: k studies, N participants
5. **Model used**: Fixed-effect or random-effects
6. **Publication bias**: Egger's test p-value, trim-and-fill result

### Example Reporting
> "We pooled data from 15 RCTs (N=2,847 participants) using a random-effects model (REML). CBT significantly reduced depression symptoms compared to control (SMD -0.42, 95% CI -0.58 to -0.26, p<0.001). Heterogeneity was moderate (I²=45%, τ²=0.04, Q=25.5, p=0.04). The 95% prediction interval ranged from -0.72 to -0.12, suggesting consistent benefit across settings. Egger's test showed no evidence of publication bias (p=0.32). Sensitivity analysis excluding high risk of bias studies yielded similar results (SMD -0.39, 95% CI -0.57 to -0.21)."

## Common Pitfalls

### Statistical Errors
❌ Using fixed-effect when heterogeneity present (I² >0%)
❌ Pooling incompatible outcomes (different scales, timepoints)
❌ Ignoring unit-of-analysis errors (multiple arms, repeated measures)
❌ Not assessing publication bias (when k≥10)
❌ Over-interpreting subgroup analyses (especially post-hoc)

### Interpretation Errors
❌ Confusing statistical significance with clinical importance
❌ Ignoring wide prediction intervals
❌ Claiming "no effect" when CI is wide (absence of evidence ≠ evidence of absence)
❌ Generalizing beyond included populations

### Reporting Errors
❌ Not reporting heterogeneity statistics
❌ Cherry-picking sensitivity analyses
❌ Not showing forest plot
❌ Failing to report GRADE certainty

## Advanced Topics

### Individual Participant Data (IPD) Meta-Analysis
- **Gold standard**: Analyze raw data from all studies
- **Advantages**: Standardized analysis, subgroup analysis, time-to-event
- **Challenges**: Requires data sharing, resource-intensive

### Multivariate Meta-Analysis
- **Purpose**: Multiple correlated outcomes
- **Example**: Systolic and diastolic blood pressure
- **Method**: Account for within-study correlation

### Dose-Response Meta-Analysis
- **Purpose**: Relationship between dose and effect
- **Methods**: Fractional polynomial, restricted cubic spline
- **Output**: Dose-response curve

### Meta-Analysis of Diagnostic Test Accuracy
- **Outcomes**: Sensitivity and specificity (correlated)
- **Methods**: Bivariate model, HSROC model
- **Plot**: SROC curve

## Quality Checklist

### Before Meta-Analysis
✅ Studies are sufficiently similar (PICO)
✅ Outcome measures are comparable
✅ Data are extractable or obtainable
✅ Risk of bias assessed for all studies

### During Meta-Analysis
✅ Appropriate effect measure chosen
✅ Random-effects model used (unless I²=0%)
✅ Heterogeneity assessed and investigated
✅ Sensitivity analyses conducted
✅ Publication bias assessed (if k≥10)

### After Meta-Analysis
✅ Forest plot created and checked
✅ All statistics reported (effect, CI, I², τ², Q, p)
✅ Prediction interval reported (if heterogeneity)
✅ GRADE certainty assessed
✅ Limitations discussed

## Version Control
- **Version**: 1.0
- **Last Updated**: 2025-12-03
- **Maintained By**: MedResearch AI System
- **Review Cycle**: Quarterly updates to align with Cochrane Handbook updates
