# Power Analysis Guide

**MedResearch AI - Comprehensive Guide to Statistical Power and Sample Size Planning**

This guide provides detailed instructions for conducting power analysis, calculating sample sizes, and interpreting power calculations for medical research studies.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Types of Power Analysis](#types-of-power-analysis)
4. [Effect Sizes](#effect-sizes)
5. [Sample Size Calculations](#sample-size-calculations)
6. [Power Calculations](#power-calculations)
7. [Study Design Considerations](#study-design-considerations)
8. [Practical Examples](#practical-examples)
9. [Common Mistakes](#common-mistakes)
10. [Decision Trees](#decision-trees)

---

## Overview

### What is Statistical Power?

**Statistical Power** is the probability of detecting a true effect when it exists.

**Formula**: Power = 1 - β (where β = Type II error rate)

**Typical Target**: 80% power (0.80)
- Means 80% chance of detecting true effect
- 20% chance of missing true effect (Type II error)

### Why is Power Important?

**Underpowered studies** (power < 80%):
- ❌ Waste resources (time, money, participants)
- ❌ May miss clinically important effects
- ❌ Contribute to publication bias (null results unpublished)
- ❌ Ethical concerns (exposing participants without adequate chance of detecting effect)

**Overpowered studies** (power > 95%):
- ⚠️ Waste resources (recruiting more than needed)
- ⚠️ May detect trivial effects as "significant"
- ⚠️ Opportunity cost (could run multiple smaller studies)

**Optimal Power**: 80-90%
- Good balance between detecting effects and resource use
- Standard in most fields
- Acceptable to funding agencies and ethics committees

---

## Core Concepts

### The Four Key Parameters

Power analysis involves **four interconnected parameters**. If you know any three, you can calculate the fourth.

| Parameter | Symbol | Typical Value | Description |
|-----------|--------|---------------|-------------|
| **Sample Size** | n | ? | Number of participants needed |
| **Effect Size** | d, f, r, w | Varies | Magnitude of difference/relationship |
| **Alpha (α)** | α | 0.05 | Type I error rate (false positive) |
| **Power** | 1-β | 0.80 | Probability of detecting true effect |

### Type I and Type II Errors

|  | **H0 True** (No effect) | **H0 False** (Effect exists) |
|---|---|---|
| **Reject H0** | Type I Error (α) | ✅ Correct (Power) |
| **Fail to Reject H0** | ✅ Correct | Type II Error (β) |

**Type I Error (α)**: False positive
- Conclude effect exists when it doesn't
- Typically set at 0.05 (5% chance)

**Type II Error (β)**: False negative
- Miss true effect
- Typically set at 0.20 (20% chance)
- Power = 1 - β = 0.80

### Factors Affecting Power

**Power increases with**:
- ✅ Larger sample size
- ✅ Larger effect size
- ✅ Higher alpha (but more Type I errors)
- ✅ Lower variability (smaller SD)
- ✅ One-tailed test (vs two-tailed)

**Power decreases with**:
- ❌ Smaller sample size
- ❌ Smaller effect size
- ❌ Lower alpha (more conservative)
- ❌ Higher variability (larger SD)
- ❌ Two-tailed test (vs one-tailed)

---

## Types of Power Analysis

### 1. A Priori Power Analysis (Before Study)

**Purpose**: Calculate required sample size

**When**: Study planning, grant applications

**Given**: Effect size, power (0.80), alpha (0.05)

**Calculate**: Sample size needed

**Example**:
```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "effect_size": 0.5,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "sample_size"
  }
}
```

**Result**: n = 64 per group (128 total)

### 2. Post-Hoc Power Analysis (After Study)

**Purpose**: Calculate achieved power

**When**: After data collection, interpreting null results

**Given**: Sample size, effect size, alpha (0.05)

**Calculate**: Achieved power

**Example**:
```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "effect_size": 0.5,
    "sample_size": 50,
    "alpha": 0.05,
    "calculate": "power"
  }
}
```

**Result**: Power = 0.70 (70%)

**Interpretation**: Study was underpowered (< 80%)

### 3. Sensitivity Analysis

**Purpose**: Calculate detectable effect size

**When**: Fixed sample size, want to know what can be detected

**Given**: Sample size, power (0.80), alpha (0.05)

**Calculate**: Minimum detectable effect size

**Example**:
```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "sample_size": 40,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "effect_size"
  }
}
```

**Result**: d = 0.64 (medium-large effect)

**Interpretation**: Can only detect medium-to-large effects with this sample size

---

## Effect Sizes

### What is Effect Size?

**Effect size** quantifies the magnitude of a difference or relationship, independent of sample size.

**Why important**:
- Indicates clinical/practical significance
- Needed for power analysis
- Allows comparison across studies
- More informative than p-values alone

### Cohen's d (Standardized Mean Difference)

**Used for**: t-tests, comparing means

**Formula**: d = (M₁ - M₂) / SD_pooled

**Interpretation**:
- **Small**: d = 0.2 (means differ by 0.2 SD)
- **Medium**: d = 0.5 (means differ by 0.5 SD)
- **Large**: d = 0.8 (means differ by 0.8 SD)

**Examples**:
- d = 0.2: Height difference between 15 and 16 year olds
- d = 0.5: IQ difference between PhDs and general population
- d = 0.8: Height difference between 13 and 18 year olds

**How to estimate**:
1. **From pilot data**: Calculate from observed means and SDs
2. **From literature**: Use effect sizes from similar studies
3. **Clinical judgment**: What difference is clinically meaningful?
4. **Cohen's guidelines**: Use 0.2, 0.5, or 0.8 if no other info

### Cohen's f (ANOVA)

**Used for**: ANOVA, comparing 3+ groups

**Formula**: f = √(η² / (1 - η²))

**Interpretation**:
- **Small**: f = 0.10
- **Medium**: f = 0.25
- **Large**: f = 0.40

**Relationship to d**:
- f = d / 2 (for 2 groups)
- f = 0.25 ≈ d = 0.5

### Correlation (r)

**Used for**: Pearson/Spearman correlation

**Range**: -1 to +1

**Interpretation**:
- **Small**: r = 0.10 (1% variance explained)
- **Medium**: r = 0.30 (9% variance explained)
- **Large**: r = 0.50 (25% variance explained)

**Examples**:
- r = 0.10: Height and IQ
- r = 0.30: Personality and job performance
- r = 0.50: Height and weight

### Cohen's w (Chi-Square)

**Used for**: Chi-square tests, categorical data

**Interpretation**:
- **Small**: w = 0.10
- **Medium**: w = 0.30
- **Large**: w = 0.50

### Cohen's f² (Multiple Regression)

**Used for**: Multiple regression

**Formula**: f² = R² / (1 - R²)

**Interpretation**:
- **Small**: f² = 0.02 (R² = 0.02)
- **Medium**: f² = 0.15 (R² = 0.13)
- **Large**: f² = 0.35 (R² = 0.26)

### Odds Ratio / Risk Ratio

**Used for**: Logistic regression, case-control, cohort studies

**Interpretation**:
- OR/RR = 1.0: No effect
- OR/RR = 1.5: Small effect
- OR/RR = 2.0: Medium effect
- OR/RR = 3.0+: Large effect

**Converting OR to d**:
- d ≈ ln(OR) × √3 / π
- OR = 1.5 → d ≈ 0.23 (small)
- OR = 2.0 → d ≈ 0.40 (small-medium)
- OR = 3.0 → d ≈ 0.63 (medium-large)

### Estimating Effect Sizes

#### Method 1: From Pilot Data

**Example**: Pilot study of blood pressure drug
- Drug group: M = 130, SD = 15
- Placebo group: M = 140, SD = 18
- d = (130 - 140) / √((15² + 18²) / 2) = -10 / 16.6 = 0.60

#### Method 2: From Literature

**Steps**:
1. Search for similar studies
2. Extract effect sizes or calculate from reported statistics
3. Use median or mean effect size
4. Consider adjusting for publication bias (reduce by 10-20%)

**Example**: Meta-analysis shows d = 0.45 for similar interventions
- Use d = 0.40 (conservative estimate accounting for bias)

#### Method 3: Clinical Judgment

**Question**: What difference is clinically meaningful?

**Example**: Blood pressure study
- Clinically meaningful reduction: 10 mmHg
- Expected SD: 15 mmHg
- d = 10 / 15 = 0.67 (medium-large effect)

#### Method 4: Cohen's Conventions

**When to use**: No pilot data, no literature, no clinical anchor

**Recommendation**: Use **medium effect size** (d = 0.5, f = 0.25, r = 0.30)
- Conservative (not too optimistic)
- Reasonable for many interventions
- Justifiable to reviewers

**Caution**: Don't use small effect sizes (d = 0.2) unless justified
- Requires very large samples
- May not be clinically meaningful

---

## Sample Size Calculations

### General Principles

**Factors to consider**:
1. **Primary outcome**: Power for main research question
2. **Effect size**: Realistic estimate
3. **Alpha**: Usually 0.05 (two-tailed)
4. **Power**: Usually 0.80 (80%)
5. **Attrition**: Add 10-20% for dropouts
6. **Subgroup analyses**: May need larger n

### Independent Samples t-test

**Formula**: n = 2(Z_α/2 + Z_β)² × (SD² / Δ²)

**Simplified**: Use power analysis tool

**Example**:
```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "effect_size": 0.5,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "sample_size",
    "alternative": "two.sided"
  }
}
```

**Result**: n = 64 per group (128 total)

**With 15% attrition**: n = 64 / 0.85 = 75 per group (150 total)

### Effect Size Lookup Table (t-test, α=0.05, power=0.80)

| Effect Size (d) | n per group | Total n | Interpretation |
|-----------------|-------------|---------|----------------|
| 0.2 (small) | 394 | 788 | Very large sample needed |
| 0.3 | 176 | 352 | Large sample needed |
| 0.4 | 100 | 200 | Moderate sample needed |
| 0.5 (medium) | 64 | 128 | Reasonable sample |
| 0.6 | 45 | 90 | Reasonable sample |
| 0.7 | 34 | 68 | Small sample |
| 0.8 (large) | 26 | 52 | Small sample |
| 1.0 | 17 | 34 | Very small sample |

**Key insight**: Small effects require large samples!

### Paired t-test

**Advantage**: Requires fewer participants than independent t-test

**Correlation matters**: Higher correlation → smaller n needed

**Example**:
```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "effect_size": 0.5,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "sample_size"
  }
}
```

**Result**: n = 34 pairs (vs 128 total for independent)

**Efficiency**: Paired design ~50% more efficient

### One-Way ANOVA

**Example**: 3 groups, medium effect (f = 0.25)

```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "anova",
    "effect_size": 0.25,
    "power": 0.80,
    "alpha": 0.05,
    "num_groups": 3,
    "calculate": "sample_size"
  }
}
```

**Result**: n = 52 per group (156 total)

### Effect Size Lookup Table (ANOVA, 3 groups, α=0.05, power=0.80)

| Effect Size (f) | n per group | Total n |
|-----------------|-------------|---------|
| 0.10 (small) | 322 | 966 |
| 0.25 (medium) | 52 | 156 |
| 0.40 (large) | 21 | 63 |

### Correlation

**Example**: Detect r = 0.30 with 80% power

```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "correlation",
    "effect_size": 0.30,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "sample_size"
  }
}
```

**Result**: n = 84

### Effect Size Lookup Table (Correlation, α=0.05, power=0.80)

| Effect Size (r) | Total n |
|-----------------|---------|
| 0.10 (small) | 783 |
| 0.20 | 194 |
| 0.30 (medium) | 84 |
| 0.40 | 46 |
| 0.50 (large) | 29 |

### Chi-Square Test

**Example**: 2×2 table, medium effect (w = 0.30)

```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "chi-square",
    "effect_size": 0.30,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "sample_size"
  }
}
```

**Result**: n = 88 total

### Multiple Regression

**Example**: 5 predictors, f² = 0.15 (medium)

```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "regression",
    "effect_size": 0.15,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "sample_size"
  }
}
```

**Result**: n = 92

**Rule of thumb**: n ≥ 10-15 per predictor (minimum)

---

## Power Calculations

### Post-Hoc Power (After Study)

**Scenario**: Study completed with n=50 per group, observed d=0.45

```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "effect_size": 0.45,
    "sample_size": 50,
    "alpha": 0.05,
    "calculate": "power"
  }
}
```

**Result**: Power = 0.68 (68%)

**Interpretation**:
- Study was underpowered (< 80%)
- Had only 68% chance of detecting effect
- Null result may be due to insufficient power
- Should report as exploratory/pilot study

### Interpreting Low Power

**If p > 0.05 and power < 80%**:
- Cannot conclude "no effect"
- May be Type II error (false negative)
- Need larger study to definitively test hypothesis

**Reporting**:
> "The study was underpowered (68% power) to detect the observed effect size (d = 0.45). The non-significant result (p = 0.12) may reflect insufficient sample size rather than absence of effect. A larger study (n = 78 per group) would be needed to achieve 80% power."

### Power Curves

**Purpose**: Visualize relationship between sample size and power

**Example**: Power curve for d = 0.5

```
Power
1.0 |                    ___________
    |                ___/
0.8 |            ___/  ← 80% power at n=64
    |        ___/
0.6 |    ___/
    |___/
0.4 |
    +----+----+----+----+----+----+----
    0   20   40   60   80  100  120  n
```

**Interpretation**:
- Steep rise initially (small increases in n → large power gains)
- Plateau after 80% (diminishing returns)
- Optimal n at 80% power (balance efficiency and power)

---

## Study Design Considerations

### Randomized Controlled Trial (RCT)

**Sample size considerations**:
- **Parallel groups**: Standard calculations apply
- **Crossover**: Smaller n needed (each participant is own control)
- **Cluster randomization**: Inflate n by design effect (1 + (m-1)×ICC)
  - m = cluster size
  - ICC = intraclass correlation

**Example**: Cluster RCT
- Standard n = 64 per group
- Cluster size = 20 patients per clinic
- ICC = 0.05
- Design effect = 1 + (20-1)×0.05 = 1.95
- Required n = 64 × 1.95 = 125 per group

**Attrition**: Add 10-20% for dropouts

### Cohort Study

**Sample size considerations**:
- **Exposure groups**: Calculate as independent groups
- **Time-to-event**: Use survival analysis power calculations
- **Loss to follow-up**: Add 20-30% (longer follow-up → more loss)

**Example**: Cohort study of smoking and lung cancer
- Expected incidence: 2% (non-smokers), 6% (smokers)
- RR = 3.0
- Convert to OR ≈ 3.1
- Convert to d ≈ 0.63
- Required n ≈ 80 per group

### Case-Control Study

**Sample size considerations**:
- **Matching**: Reduces required n (accounts for confounders)
- **Rare outcomes**: More efficient than cohort
- **Control:case ratio**: Can use 2:1 or 3:1 for efficiency

**Example**: Case-control study
- Expected OR = 2.5
- 1:1 matching
- Required n = 100 cases, 100 controls

**With 2:1 matching**:
- Required n = 85 cases, 170 controls (more efficient)

### Cross-Sectional Study

**Sample size considerations**:
- Similar to independent groups
- Prevalence ratios instead of risk ratios
- Cannot establish causality (descriptive)

---

## Practical Examples

### Example 1: Planning an RCT

**Scenario**: Testing new drug for hypertension

**Step 1: Define research question**
- Does Drug X reduce systolic BP more than placebo?

**Step 2: Determine primary outcome**
- Change in systolic BP from baseline to 12 weeks

**Step 3: Estimate effect size**
- Clinically meaningful reduction: 10 mmHg
- Expected SD: 15 mmHg
- d = 10 / 15 = 0.67

**Step 4: Calculate sample size**
```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "effect_size": 0.67,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "sample_size"
  }
}
```

**Result**: n = 37 per group (74 total)

**Step 5: Adjust for attrition**
- Expected dropout: 15%
- Adjusted n = 37 / 0.85 = 44 per group (88 total)

**Final sample size**: 44 per group (88 total)

### Example 2: Interpreting Null Results

**Scenario**: RCT completed, p = 0.15 (non-significant)

**Data**:
- n = 40 per group
- Observed d = 0.35
- p = 0.15

**Step 1: Calculate achieved power**
```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "effect_size": 0.35,
    "sample_size": 40,
    "alpha": 0.05,
    "calculate": "power"
  }
}
```

**Result**: Power = 0.42 (42%)

**Step 2: Interpret**
- Study was severely underpowered (42% vs 80% target)
- Had only 42% chance of detecting observed effect
- Null result likely due to insufficient power, not absence of effect

**Step 3: Calculate required n**
```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "effect_size": 0.35,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "sample_size"
  }
}
```

**Result**: n = 130 per group needed for 80% power

**Conclusion**: Study should be considered exploratory. Larger study needed.

### Example 3: Sensitivity Analysis

**Scenario**: Fixed budget allows n = 50 per group

**Question**: What effect size can we detect?

```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "sample_size": 50,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "effect_size"
  }
}
```

**Result**: d = 0.57 (medium effect)

**Interpretation**:
- Can detect medium effects (d ≥ 0.57) with 80% power
- Cannot reliably detect small effects (d < 0.5)
- Study appropriate for medium-to-large effects only

**Decision**: Proceed if expecting medium+ effect, or increase budget for larger n

### Example 4: ANOVA Sample Size

**Scenario**: Compare 4 treatment groups

**Step 1: Estimate effect size**
- Expect medium effect (f = 0.25)

**Step 2: Calculate sample size**
```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "anova",
    "effect_size": 0.25,
    "power": 0.80,
    "alpha": 0.05,
    "num_groups": 4,
    "calculate": "sample_size"
  }
}
```

**Result**: n = 45 per group (180 total)

**Step 3: Adjust for attrition**
- Expected dropout: 20%
- Adjusted n = 45 / 0.80 = 56 per group (224 total)

**Final sample size**: 56 per group (224 total)

### Example 5: Correlation Study

**Scenario**: Examine relationship between exercise and depression

**Step 1: Estimate effect size**
- Literature suggests r = 0.30 (medium)

**Step 2: Calculate sample size**
```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "correlation",
    "effect_size": 0.30,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "sample_size"
  }
}
```

**Result**: n = 84

**Step 3: Adjust for missing data**
- Expected missing: 10%
- Adjusted n = 84 / 0.90 = 93

**Final sample size**: 93 participants

---

## Common Mistakes

### Mistake 1: Using Observed Effect Size for Post-Hoc Power

**Problem**: Observed effect size is biased (especially if p < 0.05)

**Why wrong**: Circular reasoning
- Significant result → large observed effect → high post-hoc power
- Non-significant result → small observed effect → low post-hoc power
- Post-hoc power perfectly correlated with p-value!

**Correct approach**:
- Use **a priori** effect size (from literature, pilot, clinical judgment)
- Report confidence interval around effect size
- Discuss whether study was adequately powered for expected effect

### Mistake 2: Ignoring Attrition

**Problem**: Not accounting for dropouts

**Example**:
- Calculate n = 64 per group
- Recruit exactly 64 per group
- 15% dropout → Final n = 54 per group
- Now underpowered!

**Correct approach**:
- Add 10-20% for expected attrition
- n = 64 / 0.85 = 75 per group

### Mistake 3: Using Small Effect Sizes Without Justification

**Problem**: Assuming d = 0.2 without evidence

**Why problematic**:
- Requires very large samples (n = 394 per group)
- May not be clinically meaningful
- Difficult to justify to funders/ethics

**Correct approach**:
- Use medium effect (d = 0.5) as default
- Only use small effect if:
  - Literature supports it
  - Clinically meaningful
  - Resources available for large sample

### Mistake 4: Powering for Multiple Outcomes

**Problem**: Calculating power for secondary outcomes

**Correct approach**:
- Power for **primary outcome only**
- Secondary outcomes are exploratory
- If multiple primary outcomes, adjust alpha (Bonferroni)

### Mistake 5: Ignoring Design Effects

**Problem**: Using simple formulas for complex designs

**Examples**:
- Cluster randomization (inflate by design effect)
- Repeated measures (reduce n needed)
- Matching (reduce n needed)

**Correct approach**:
- Use appropriate formulas for design
- Consult statistician for complex designs

### Mistake 6: Confusing Statistical and Clinical Significance

**Problem**: Detecting tiny effects with huge samples

**Example**:
- n = 10,000 per group
- d = 0.05 (trivial effect)
- p < 0.001 (highly significant)
- But clinically meaningless!

**Correct approach**:
- Always report effect sizes
- Interpret clinical significance separately
- Large samples can detect trivial effects

---

## Decision Trees

### Decision Tree 1: Which Type of Power Analysis?

```
START: What stage is your study?

Planning stage (before data collection)?
├── YES → A Priori Power Analysis
│   └── Calculate required sample size
│       ├── Have pilot data? → Use observed effect size
│       ├── Have literature? → Use meta-analytic effect size
│       ├── Have clinical anchor? → Calculate from meaningful difference
│       └── No information? → Use medium effect size (d=0.5)
│
└── NO → Data already collected?
    ├── YES → Post-Hoc Power Analysis
    │   ├── Result significant (p<0.05)?
    │   │   ├── YES → Don't calculate post-hoc power (not informative)
    │   │   └── NO → Calculate power with a priori effect size
    │   │       ├── Power < 80%? → Study underpowered, interpret cautiously
    │   │       └── Power ≥ 80%? → Adequate power, null result meaningful
    │   │
    │   └── Fixed sample size?
    │       └── YES → Sensitivity Analysis
    │           └── Calculate minimum detectable effect size
    │               └── Is this clinically meaningful?
    │                   ├── YES → Proceed with study
    │                   └── NO → Need larger sample or different design
```

### Decision Tree 2: Estimating Effect Size

```
START: How to estimate effect size?

Have pilot data?
├── YES → Calculate effect size from pilot
│   └── Use conservative estimate (reduce by 10-20%)
│
└── NO → Have literature?
    ├── YES → Extract effect sizes from similar studies
    │   ├── Single study? → Use that effect size (conservative)
    │   ├── Multiple studies? → Use median or meta-analytic estimate
    │   └── Adjust for publication bias (reduce by 10-20%)
    │
    └── NO → Have clinical anchor?
        ├── YES → Calculate from clinically meaningful difference
        │   └── d = (meaningful difference) / SD
        │
        └── NO → Use Cohen's conventions
            ├── Expect large effect? → Use d=0.8, f=0.4, r=0.5
            ├── Expect medium effect? → Use d=0.5, f=0.25, r=0.3 ← DEFAULT
            └── Expect small effect? → Use d=0.2, f=0.1, r=0.1
                └── WARNING: Requires very large sample!
```

### Decision Tree 3: Interpreting Power Analysis Results

```
START: Interpret power analysis results

A Priori (planning)?
├── YES → Required sample size feasible?
│   ├── YES → Proceed with study
│   │   └── Add 10-20% for attrition
│   │
│   └── NO → Options:
│       ├── Increase budget/resources
│       ├── Use more efficient design (paired, matched)
│       ├── Collaborate (multi-site study)
│       ├── Accept lower power (70-75%) if exploratory
│       └── Abandon study (not feasible)
│
└── NO → Post-Hoc (after study)?
    ├── Result significant (p<0.05)?
    │   ├── YES → Don't report post-hoc power
    │   │   └── Report effect size with CI
    │   │
    │   └── NO → Calculate power with a priori effect size
    │       ├── Power ≥ 80%?
    │       │   ├── YES → Study adequately powered
    │       │   │   └── Null result is meaningful
    │       │   │       └── Can conclude "no effect" (within CI)
    │       │   │
    │       │   └── NO → Study underpowered
    │       │       └── Cannot conclude "no effect"
    │       │           └── Report as exploratory
    │       │               └── Calculate required n for future study
```

---

## Summary Checklist

### Before Starting Study (A Priori)
- [ ] Define primary research question
- [ ] Identify primary outcome measure
- [ ] Estimate effect size (pilot, literature, clinical judgment)
- [ ] Set alpha (typically 0.05, two-tailed)
- [ ] Set power (typically 0.80)
- [ ] Calculate required sample size
- [ ] Add 10-20% for expected attrition
- [ ] Verify sample size is feasible
- [ ] Document all assumptions in protocol

### After Study Completion (Post-Hoc)
- [ ] If p < 0.05: Report effect size with CI (don't calculate post-hoc power)
- [ ] If p ≥ 0.05: Calculate power using a priori effect size
- [ ] If underpowered: Report as exploratory, calculate required n for future
- [ ] If adequately powered: Null result is meaningful
- [ ] Always report effect sizes and confidence intervals
- [ ] Discuss clinical significance separately from statistical significance

### For Grant Applications
- [ ] Clearly state primary outcome
- [ ] Justify effect size estimate (pilot, literature, clinical)
- [ ] Show power calculation with all parameters
- [ ] Include power curve or table
- [ ] Account for attrition
- [ ] Account for design effects (clustering, matching)
- [ ] Justify sample size is adequate but not excessive

---

## Additional Resources

- [STATISTICAL-METHODS-GUIDE.md](./STATISTICAL-METHODS-GUIDE.md) - Complete guide to statistical functions
- [ASSUMPTION-CHECKING-GUIDE.md](./ASSUMPTION-CHECKING-GUIDE.md) - Checking statistical assumptions
- [REPORTING-GUIDELINES.md](./REPORTING-GUIDELINES.md) - CONSORT/STROBE/PRISMA
- [DATA-ANALYSIS-AGENT-RESEARCH.md](./DATA-ANALYSIS-AGENT-RESEARCH.md) - Comprehensive research

---

**Version**: 4.2.0  
**Last Updated**: December 4, 2025  
**Author**: MedResearch AI Team
