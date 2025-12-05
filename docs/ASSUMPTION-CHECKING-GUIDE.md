# Assumption Checking Guide

**MedResearch AI - Comprehensive Guide to Statistical Assumptions**

This guide provides detailed instructions for checking, interpreting, and handling violations of statistical assumptions in medical research.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Why Check Assumptions?](#why-check-assumptions)
3. [Assumptions by Test Type](#assumptions-by-test-type)
4. [Normality Testing](#normality-testing)
5. [Homogeneity of Variance](#homogeneity-of-variance)
6. [Linearity](#linearity)
7. [Independence](#independence)
8. [Homoscedasticity](#homoscedasticity)
9. [Multicollinearity](#multicollinearity)
10. [Outliers and Influential Points](#outliers-and-influential-points)
11. [Diagnostic Plots Interpretation](#diagnostic-plots-interpretation)
12. [Handling Violations](#handling-violations)
13. [Decision Trees](#decision-trees)

---

## Overview

Statistical tests make assumptions about the data. Violating these assumptions can lead to:
- **Incorrect p-values** (Type I or Type II errors)
- **Biased estimates** (effect sizes, confidence intervals)
- **Invalid conclusions**

**Golden Rule**: Always check assumptions before interpreting results.

---

## Why Check Assumptions?

### Consequences of Violations

| Assumption Violated | Consequence | Severity |
|---------------------|-------------|----------|
| Normality | Inflated Type I error (if severe) | Moderate (robust with large n) |
| Homogeneity of variance | Inflated Type I error | Moderate to High |
| Independence | Severely inflated Type I error | **Critical** |
| Linearity | Biased estimates, wrong model | High |
| Homoscedasticity | Inefficient estimates, wrong SE | Moderate |
| No multicollinearity | Unstable estimates, inflated SE | High |

### When Assumptions Matter Most

- **Small sample sizes** (n < 30 per group): Violations more problematic
- **Unequal group sizes**: Homogeneity violations more serious
- **Extreme violations**: Even large samples affected

---

## Assumptions by Test Type

### Independent Samples t-test

**Assumptions**:
1. ✅ **Normality**: Outcome normally distributed in each group
2. ✅ **Homogeneity of variance**: Equal variances across groups
3. ✅ **Independence**: Observations independent

**Robustness**:
- Robust to normality violations with n ≥ 30 per group (Central Limit Theorem)
- NOT robust to variance inequality with unequal n

**Alternatives if violated**:
- Normality violated → Mann-Whitney U test
- Variance inequality → Welch's t-test
- Both violated → Mann-Whitney U test

### Paired t-test

**Assumptions**:
1. ✅ **Normality of differences**: Difference scores normally distributed
2. ✅ **Independence of pairs**: Each pair independent

**Alternatives if violated**:
- Normality violated → Wilcoxon signed-rank test

### One-Way ANOVA

**Assumptions**:
1. ✅ **Normality**: Outcome normally distributed in each group
2. ✅ **Homogeneity of variance**: Equal variances across all groups
3. ✅ **Independence**: Observations independent

**Alternatives if violated**:
- Normality violated → Kruskal-Wallis test
- Variance inequality → Welch's ANOVA
- Both violated → Kruskal-Wallis test

### Linear Regression

**Assumptions**:
1. ✅ **Linearity**: Linear relationship between X and Y
2. ✅ **Normality of residuals**: Residuals normally distributed
3. ✅ **Homoscedasticity**: Constant variance of residuals
4. ✅ **Independence**: Residuals independent (no autocorrelation)
5. ✅ **No multicollinearity**: Predictors not highly correlated (VIF < 10)
6. ✅ **No influential outliers**: No points with excessive influence

**Alternatives if violated**:
- Non-linearity → Polynomial regression, splines, transformations
- Heteroscedasticity → Robust standard errors, weighted least squares
- Non-normal residuals → Robust regression, transformations
- Multicollinearity → Remove predictors, ridge regression

### Correlation (Pearson)

**Assumptions**:
1. ✅ **Linearity**: Linear relationship between variables
2. ✅ **Bivariate normality**: Both variables normally distributed
3. ✅ **No extreme outliers**: Outliers can distort correlation

**Alternatives if violated**:
- Non-linearity or non-normality → Spearman's rho
- Outliers present → Spearman's rho or robust correlation

### Chi-Square Test

**Assumptions**:
1. ✅ **Expected frequencies ≥ 5**: All cells have expected count ≥ 5
2. ✅ **Independence**: Observations independent

**Alternatives if violated**:
- Expected frequencies < 5 → Fisher's exact test
- Small sample → Fisher's exact test

---

## Normality Testing

### Why Test Normality?

Parametric tests (t-test, ANOVA, Pearson correlation) assume normal distribution. Violations can lead to incorrect p-values.

### Methods to Assess Normality

#### 1. Visual Methods (Primary)

**Q-Q Plot (Quantile-Quantile Plot)**
- **Best method** for assessing normality
- Plots observed quantiles vs theoretical normal quantiles
- **Interpretation**:
  - Points follow diagonal line → Normal
  - S-shaped curve → Skewed distribution
  - Curved ends → Heavy or light tails
  - Points far from line → Outliers

**Histogram**
- Shows distribution shape
- **Interpretation**:
  - Bell-shaped, symmetric → Normal
  - Skewed left/right → Non-normal
  - Multiple peaks → Bimodal/multimodal
  - Flat → Uniform distribution

**Boxplot**
- Shows median, quartiles, outliers
- **Interpretation**:
  - Symmetric box → Likely normal
  - Skewed box → Non-normal
  - Many outliers → Non-normal

#### 2. Statistical Tests (Secondary)

**Shapiro-Wilk Test**
- **Most powerful** normality test
- **Null hypothesis**: Data is normally distributed
- **Interpretation**:
  - p > 0.05 → Normal distribution (fail to reject H0)
  - p ≤ 0.05 → Non-normal distribution (reject H0)
- **Limitation**: Very sensitive with large n (may detect trivial deviations)

**Anderson-Darling Test**
- More sensitive to tails than Shapiro-Wilk
- **Interpretation**: Same as Shapiro-Wilk
- **Use**: When tail behavior is important

**Kolmogorov-Smirnov Test**
- Less powerful than Shapiro-Wilk
- **Not recommended** for small samples
- **Use**: Large samples only

### Example: Interpreting Normality Tests

```json
{
  "normality": {
    "group1": {
      "shapiro_wilk_p": 0.23,
      "anderson_darling_p": 0.18,
      "interpretation": "Normal distribution (p > 0.05)"
    },
    "group2": {
      "shapiro_wilk_p": 0.03,
      "anderson_darling_p": 0.02,
      "interpretation": "Non-normal distribution (p < 0.05)"
    }
  }
}
```

**Decision**:
- Group 1: Normal → Can use parametric test
- Group 2: Non-normal → Consider non-parametric test OR check Q-Q plot

**Important**: Always look at Q-Q plot! Statistical tests can be overly sensitive with large n.

### Sample Size Considerations

| Sample Size | Recommendation |
|-------------|----------------|
| n < 15 | Normality critical; use non-parametric if violated |
| n = 15-30 | Check normality; parametric tests somewhat robust |
| n = 30-50 | Parametric tests fairly robust to mild violations |
| n > 50 | Parametric tests robust to moderate violations (CLT) |
| n > 100 | Parametric tests very robust; focus on Q-Q plot |

**Central Limit Theorem**: With large samples (n ≥ 30), sampling distribution of mean is approximately normal even if data is not.

---

## Homogeneity of Variance

### Why Test Homogeneity?

t-tests and ANOVA assume equal variances across groups. Violations can inflate Type I error, especially with unequal group sizes.

### Levene's Test

**Purpose**: Test equality of variances across groups

**Null hypothesis**: Variances are equal across groups

**Interpretation**:
- p > 0.05 → Equal variances (homogeneity met)
- p ≤ 0.05 → Unequal variances (homogeneity violated)

**Example**:
```json
{
  "homogeneity_of_variance": {
    "levene_test_p": 0.67,
    "interpretation": "Equal variances (p > 0.05)",
    "met": true
  }
}
```

**Decision**: Homogeneity met → Use standard t-test or ANOVA

```json
{
  "homogeneity_of_variance": {
    "levene_test_p": 0.02,
    "interpretation": "Unequal variances (p < 0.05)",
    "met": false
  }
}
```

**Decision**: Homogeneity violated → Use Welch's t-test or Welch's ANOVA

### Variance Ratio Rule of Thumb

**Quick check**: Ratio of largest to smallest variance

- Ratio < 2:1 → Homogeneity likely OK
- Ratio 2:1 to 4:1 → Borderline; check Levene's test
- Ratio > 4:1 → Homogeneity likely violated

**Example**:
- Group 1: SD = 10, Variance = 100
- Group 2: SD = 15, Variance = 225
- Ratio = 225/100 = 2.25:1 → Borderline

### When Violations Matter Most

**Most problematic**:
- Unequal group sizes + unequal variances
- Larger variance in smaller group → Inflated Type I error
- Larger variance in larger group → Reduced power

**Less problematic**:
- Equal group sizes (ANOVA is robust)
- Large samples (more robust)

---

## Linearity

### Why Test Linearity?

Linear regression assumes linear relationship between X and Y. Non-linear relationships lead to biased estimates and poor predictions.

### Methods to Assess Linearity

#### 1. Scatterplot

**Best method** for assessing linearity

**Interpretation**:
- Points follow straight line → Linear relationship
- Curved pattern → Non-linear relationship
- No pattern → No relationship

**Example patterns**:
```
Linear:           Non-linear:       No relationship:
    *                 *                 *  *
  *   *             *   *               *    *
*       *         *       *           *  *    *
          *     *           *           *  *
```

#### 2. Residual vs Fitted Plot

**Purpose**: Check linearity and homoscedasticity simultaneously

**Interpretation**:
- Random scatter around 0 → Linear relationship
- Curved pattern → Non-linear relationship
- Funnel shape → Heteroscedasticity

**Example**:
```json
{
  "linearity": {
    "scatterplot": "Linear pattern observed",
    "residual_plot": "Random scatter around 0",
    "interpretation": "Linear relationship",
    "met": true
  }
}
```

### Handling Non-Linearity

**Options**:
1. **Transform variables**: Log, square root, reciprocal
2. **Polynomial regression**: Add X², X³ terms
3. **Splines**: Flexible non-linear modeling
4. **Non-parametric methods**: Spearman correlation, loess

---

## Independence

### Why Test Independence?

Independence is the **most critical** assumption. Violations severely inflate Type I error and cannot be fixed by transformations.

### Common Violations

1. **Clustered data**: Patients within hospitals, students within schools
2. **Repeated measures**: Multiple measurements per subject
3. **Time series**: Autocorrelation over time
4. **Matched pairs**: Paired observations

### Durbin-Watson Test (for Regression)

**Purpose**: Detect autocorrelation in residuals

**Interpretation**:
- DW ≈ 2.0 → No autocorrelation (independence met)
- DW < 1.5 → Positive autocorrelation (violation)
- DW > 2.5 → Negative autocorrelation (violation)

**Example**:
```json
{
  "independence": {
    "durbin_watson": 1.98,
    "interpretation": "No autocorrelation (DW ≈ 2)",
    "met": true
  }
}
```

### Handling Violations

**Solutions**:
1. **Mixed models**: Account for clustering (random effects)
2. **GEE**: Generalized Estimating Equations
3. **Time series methods**: ARIMA, autoregressive models
4. **Paired tests**: Use paired t-test, repeated measures ANOVA

**Important**: Independence violations cannot be ignored. Must use appropriate methods.

---

## Homoscedasticity

### Why Test Homoscedasticity?

Regression assumes constant variance of residuals. Violations lead to inefficient estimates and incorrect standard errors.

### Breusch-Pagan Test

**Purpose**: Test constant variance of residuals

**Null hypothesis**: Homoscedasticity (constant variance)

**Interpretation**:
- p > 0.05 → Homoscedasticity (constant variance)
- p ≤ 0.05 → Heteroscedasticity (non-constant variance)

**Example**:
```json
{
  "homoscedasticity": {
    "breusch_pagan_p": 0.56,
    "interpretation": "Constant variance of residuals",
    "met": true
  }
}
```

### Visual Assessment

**Residual vs Fitted Plot**:
- Random scatter → Homoscedasticity
- Funnel shape (increasing/decreasing spread) → Heteroscedasticity

**Scale-Location Plot**:
- Horizontal line with random scatter → Homoscedasticity
- Trend (increasing/decreasing) → Heteroscedasticity

### Handling Violations

**Options**:
1. **Robust standard errors**: Sandwich estimators (HC0, HC1, HC3)
2. **Weighted least squares**: Weight by inverse variance
3. **Transform outcome**: Log, square root
4. **Generalized linear models**: Use appropriate distribution

---

## Multicollinearity

### Why Test Multicollinearity?

High correlation between predictors leads to:
- Unstable regression coefficients
- Inflated standard errors
- Difficulty interpreting individual effects

### Variance Inflation Factor (VIF)

**Purpose**: Quantify multicollinearity

**Formula**: VIF = 1 / (1 - R²)

**Interpretation**:
- VIF = 1 → No correlation with other predictors
- VIF < 5 → Acceptable
- VIF 5-10 → Moderate multicollinearity (caution)
- VIF > 10 → High multicollinearity (problematic)

**Example**:
```json
{
  "multicollinearity": {
    "age": {"vif": 1.2, "interpretation": "No multicollinearity"},
    "bmi": {"vif": 2.3, "interpretation": "Acceptable"},
    "weight": {"vif": 12.5, "interpretation": "High multicollinearity"},
    "height": {"vif": 11.8, "interpretation": "High multicollinearity"}
  },
  "recommendation": "Remove weight or height (highly correlated)"
}
```

### Handling Multicollinearity

**Options**:
1. **Remove predictors**: Drop one of correlated variables
2. **Combine predictors**: Create composite score (e.g., BMI from weight/height)
3. **Ridge regression**: Penalized regression
4. **Principal components**: Reduce dimensionality

---

## Outliers and Influential Points

### Why Identify Outliers?

Outliers can:
- Distort means and standard deviations
- Violate normality assumption
- Inflate/deflate correlations
- Bias regression estimates

### Types of Outliers

1. **Univariate outliers**: Extreme values on single variable
2. **Bivariate outliers**: Unusual combination of two variables
3. **Influential points**: Disproportionate impact on regression

### Detection Methods

#### 1. IQR Method (Univariate)

**Formula**:
- Lower bound = Q1 - 1.5 × IQR
- Upper bound = Q3 + 1.5 × IQR
- Outliers: Values outside bounds

**Example**:
```json
{
  "outliers": {
    "age": {
      "q1": 45,
      "q3": 65,
      "iqr": 20,
      "lower_bound": 15,
      "upper_bound": 95,
      "outliers": [105, 102],
      "outlier_rows": [185, 192],
      "interpretation": "2 outliers detected"
    }
  }
}
```

#### 2. Z-Score Method

**Formula**: z = (x - mean) / SD

**Interpretation**:
- |z| > 3 → Extreme outlier
- |z| > 2.5 → Potential outlier

#### 3. Cook's Distance (Influential Points)

**Purpose**: Identify influential points in regression

**Interpretation**:
- Cook's D > 1.0 → Highly influential
- Cook's D > 0.5 → Potentially influential
- Cook's D > 4/n → Worth investigating

**Example**:
```json
{
  "influential_points": {
    "cooks_distance_threshold": 0.5,
    "influential_observations": [45, 67, 123],
    "max_cooks_d": 0.82,
    "interpretation": "3 influential points detected"
  }
}
```

### Handling Outliers

**Decision Tree**:

```
Is outlier a data entry error?
├── YES → Correct or remove
└── NO → Is it biologically plausible?
    ├── NO → Remove (document reason)
    └── YES → Keep, but perform sensitivity analysis
```

**Options**:
1. **Investigate**: Check data entry, measurement error
2. **Keep**: If legitimate and plausible
3. **Remove**: If error or implausible (document!)
4. **Sensitivity analysis**: Analyze with and without outliers
5. **Robust methods**: Use median, IQR, non-parametric tests
6. **Transform**: Log transformation can reduce outlier impact

**Important**: NEVER remove outliers without justification. Always report outlier handling.

---

## Diagnostic Plots Interpretation

### 1. Q-Q Plot (Normality)

**What it shows**: Observed quantiles vs theoretical normal quantiles

**Interpretation Guide**:

```
Perfect Normal:        Skewed Right:         Skewed Left:
    *                      *                     *
  *   *                  *                         *
*       *              *                             *
          *          *                                 *

Heavy Tails:          Light Tails:          Outliers:
  *                       *                     *
*   *                   *   *                 *   *
*     *               *       *             *       *
  *                       *                     *    * *
```

**Decision**:
- Points follow line → Normal (proceed with parametric test)
- Slight deviation → Check sample size (robust if n > 30)
- Severe deviation → Use non-parametric test

### 2. Histogram

**What it shows**: Distribution shape

**Interpretation**:
- Bell-shaped, symmetric → Normal
- Skewed → Non-normal (consider transformation)
- Bimodal → Two subgroups? (investigate)
- Uniform → Non-normal

### 3. Boxplot

**What it shows**: Median, quartiles, outliers

**Interpretation**:
- Symmetric box, median centered → Normal
- Skewed box → Non-normal
- Many outliers → Non-normal or data quality issues

### 4. Residual vs Fitted Plot

**What it shows**: Residuals vs predicted values

**Interpretation**:

```
Good (Random):        Non-linear:           Heteroscedastic:
  * *   *               *                      *
*   *     *           *   *                  *   *
  *   * *           *       *              *       *
*     *           *           *          *           *
```

**Decision**:
- Random scatter → Assumptions met
- Curved pattern → Non-linearity (add polynomial terms)
- Funnel shape → Heteroscedasticity (use robust SE)

### 5. Scale-Location Plot

**What it shows**: Sqrt(|residuals|) vs fitted values

**Interpretation**:
- Horizontal line → Homoscedasticity
- Trend → Heteroscedasticity

### 6. Cook's Distance Plot

**What it shows**: Influence of each observation

**Interpretation**:
- All bars below 0.5 → No influential points
- Bars > 0.5 → Investigate these observations
- Bars > 1.0 → Highly influential (consider removing)

---

## Handling Violations

### Decision Tree: What to Do When Assumptions Violated

```
Which assumption is violated?

├── NORMALITY
│   ├── Sample size < 30?
│   │   ├── YES → Use non-parametric test
│   │   └── NO → Check Q-Q plot severity
│   │       ├── Severe → Use non-parametric test
│   │       └── Mild → Proceed (robust with large n)
│   └── Try transformation (log, sqrt)
│
├── HOMOGENEITY OF VARIANCE
│   ├── For t-test → Use Welch's t-test
│   ├── For ANOVA → Use Welch's ANOVA
│   └── Or use non-parametric test
│
├── INDEPENDENCE
│   ├── Clustered data → Use mixed models
│   ├── Repeated measures → Use repeated measures ANOVA
│   ├── Time series → Use time series methods
│   └── CANNOT IGNORE THIS VIOLATION
│
├── LINEARITY
│   ├── Try transformation (log, sqrt, reciprocal)
│   ├── Add polynomial terms (X², X³)
│   ├── Use splines
│   └── Or use non-parametric methods
│
├── HOMOSCEDASTICITY
│   ├── Use robust standard errors
│   ├── Use weighted least squares
│   ├── Transform outcome variable
│   └── Or use GLM with appropriate distribution
│
├── MULTICOLLINEARITY
│   ├── Remove one of correlated predictors
│   ├── Combine predictors (composite score)
│   ├── Use ridge regression
│   └── Or use principal components
│
└── OUTLIERS
    ├── Data entry error? → Correct or remove
    ├── Implausible? → Remove (document)
    ├── Legitimate? → Keep + sensitivity analysis
    └── Use robust methods (median, IQR)
```

### Transformation Guide

| Problem | Transformation | When to Use |
|---------|----------------|-------------|
| Right skew | Log(x) | Income, biomarkers, counts |
| Right skew (mild) | √x | Counts, reaction times |
| Left skew | x² | Proportions near 1 |
| Heteroscedasticity | Log(y) | Variance increases with mean |
| Non-linearity | Log(x) or log(y) | Exponential relationships |

**Important**: After transformation, re-check assumptions!

---

## Decision Trees

### Decision Tree 1: Choosing Between Parametric and Non-Parametric Tests

```
START: Check assumptions

Is outcome continuous?
├── NO → Use appropriate test for data type
│   ├── Binary → Chi-square, Fisher's, logistic regression
│   ├── Categorical → Chi-square, multinomial regression
│   └── Count → Poisson, negative binomial
│
└── YES → Check normality
    ├── Normal in all groups?
    │   ├── YES → Check homogeneity of variance
    │   │   ├── Equal variances?
    │   │   │   ├── YES → Use parametric test
    │   │   │   │   ├── 2 groups → Independent t-test
    │   │   │   │   └── 3+ groups → ANOVA
    │   │   │   └── NO → Use Welch's test
    │   │   │       ├── 2 groups → Welch's t-test
    │   │   │       └── 3+ groups → Welch's ANOVA
    │   │
    │   └── NO → Use non-parametric test
    │       ├── 2 groups → Mann-Whitney U
    │       └── 3+ groups → Kruskal-Wallis
    │
    └── Sample size ≥ 30 per group?
        ├── YES → Parametric tests robust (CLT)
        │   └── Check Q-Q plot for severe violations
        └── NO → Use non-parametric test
```

### Decision Tree 2: Handling Regression Assumption Violations

```
START: Check regression assumptions

Linearity violated?
├── YES → Try transformations or polynomial terms
└── NO → Continue

Normality of residuals violated?
├── YES → Check sample size
│   ├── n < 50 → Try transformation or robust regression
│   └── n ≥ 50 → Proceed (robust with large n)
└── NO → Continue

Homoscedasticity violated?
├── YES → Use robust standard errors or WLS
└── NO → Continue

Independence violated?
├── YES → STOP! Use mixed models or GEE
└── NO → Continue

Multicollinearity (VIF > 10)?
├── YES → Remove or combine predictors
└── NO → Continue

Influential points (Cook's D > 0.5)?
├── YES → Investigate and perform sensitivity analysis
└── NO → Proceed with analysis
```

---

## Practical Examples

### Example 1: Complete Assumption Checking for t-test

**Scenario**: Compare blood pressure between drug and placebo groups

**Step 1: Check normality**
```json
{
  "normality": {
    "drug_group": {
      "shapiro_wilk_p": 0.23,
      "qq_plot": "Points follow diagonal line",
      "interpretation": "Normal"
    },
    "placebo_group": {
      "shapiro_wilk_p": 0.45,
      "qq_plot": "Points follow diagonal line",
      "interpretation": "Normal"
    }
  }
}
```
✅ **Decision**: Normality met

**Step 2: Check homogeneity of variance**
```json
{
  "homogeneity": {
    "levene_test_p": 0.67,
    "variance_ratio": 1.3,
    "interpretation": "Equal variances"
  }
}
```
✅ **Decision**: Homogeneity met

**Step 3: Check outliers**
```json
{
  "outliers": {
    "drug_group": [],
    "placebo_group": [45],
    "interpretation": "1 outlier in placebo group"
  }
}
```
⚠️ **Decision**: Investigate outlier, perform sensitivity analysis

**Final Decision**: Proceed with independent t-test, report sensitivity analysis with/without outlier

### Example 2: Regression Assumption Checking

**Scenario**: Predict cholesterol from age

**Step 1: Check linearity**
```json
{
  "linearity": {
    "scatterplot": "Linear pattern",
    "residual_plot": "Random scatter",
    "interpretation": "Linear relationship"
  }
}
```
✅ **Decision**: Linearity met

**Step 2: Check normality of residuals**
```json
{
  "normality_of_residuals": {
    "shapiro_wilk_p": 0.34,
    "qq_plot": "Points follow line",
    "interpretation": "Normal residuals"
  }
}
```
✅ **Decision**: Normality met

**Step 3: Check homoscedasticity**
```json
{
  "homoscedasticity": {
    "breusch_pagan_p": 0.56,
    "residual_plot": "Random scatter, no funnel",
    "interpretation": "Constant variance"
  }
}
```
✅ **Decision**: Homoscedasticity met

**Step 4: Check independence**
```json
{
  "independence": {
    "durbin_watson": 1.98,
    "interpretation": "No autocorrelation"
  }
}
```
✅ **Decision**: Independence met

**Step 5: Check influential points**
```json
{
  "influential_points": {
    "max_cooks_d": 0.32,
    "influential_observations": [],
    "interpretation": "No influential points"
  }
}
```
✅ **Decision**: No influential points

**Final Decision**: All assumptions met. Proceed with linear regression.

---

## Summary Checklist

### Before Running t-test/ANOVA
- [ ] Check normality (Q-Q plot + Shapiro-Wilk)
- [ ] Check homogeneity of variance (Levene's test)
- [ ] Check for outliers (boxplot + IQR method)
- [ ] Verify independence (study design)
- [ ] If violations: Use Welch's test or non-parametric alternative

### Before Running Linear Regression
- [ ] Check linearity (scatterplot)
- [ ] Check normality of residuals (Q-Q plot)
- [ ] Check homoscedasticity (residual vs fitted plot + Breusch-Pagan)
- [ ] Check independence (Durbin-Watson)
- [ ] Check multicollinearity (VIF)
- [ ] Check influential points (Cook's distance)
- [ ] If violations: Transform, use robust SE, or alternative methods

### Before Running Correlation
- [ ] Check linearity (scatterplot)
- [ ] Check bivariate normality (Q-Q plots for both variables)
- [ ] Check for outliers (scatterplot)
- [ ] If violations: Use Spearman's rho

---

## Additional Resources

- [STATISTICAL-METHODS-GUIDE.md](./STATISTICAL-METHODS-GUIDE.md) - Complete guide to all statistical functions
- [POWER-ANALYSIS-GUIDE.md](./POWER-ANALYSIS-GUIDE.md) - Sample size planning
- [REPORTING-GUIDELINES.md](./REPORTING-GUIDELINES.md) - CONSORT/STROBE/PRISMA
- [DATA-ANALYSIS-AGENT-RESEARCH.md](./DATA-ANALYSIS-AGENT-RESEARCH.md) - Comprehensive research

---

**Version**: 4.2.0  
**Last Updated**: December 4, 2025  
**Author**: MedResearch AI Team
