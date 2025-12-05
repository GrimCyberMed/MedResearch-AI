# Statistical Methods Guide

**MedResearch AI - Advanced Statistical Analysis Tools**

This guide provides comprehensive instructions for using the 5 new statistical analysis functions in MedResearch AI. These tools provide PhD-level biostatistics capabilities for medical research.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Function 1: Select Statistical Test](#1-select-statistical-test)
3. [Function 2: Check Assumptions](#2-check-assumptions)
4. [Function 3: Validate Data](#3-validate-data)
5. [Function 4: Calculate Power](#4-calculate-power)
6. [Function 5: Run Comprehensive Analysis](#5-run-comprehensive-analysis)
7. [Complete Workflow Examples](#complete-workflow-examples)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Available Functions

| Function | Purpose | When to Use |
|----------|---------|-------------|
| `select_statistical_test` | Intelligent test selection | When unsure which test to use |
| `check_assumptions` | Comprehensive assumption testing | Before running parametric tests |
| `validate_data` | Data quality assessment | Before any analysis |
| `calculate_power` | Power analysis | Sample size planning or post-hoc power |
| `run_comprehensive_analysis` | End-to-end workflow | Complete analysis from start to finish |

### Required R Packages

These functions automatically install required packages:
- `jsonlite` - JSON handling
- `nortest` - Advanced normality tests
- `car` - Regression diagnostics
- `lmtest` - Linear model testing
- `pwr` - Power analysis
- `gtsummary` - Publication-ready tables
- `flextable` - Table formatting
- `officer` - Word document generation

---

## 1. Select Statistical Test

### Purpose
Automatically recommends the appropriate statistical test based on your research question, data types, and study design.

### When to Use
- Starting a new analysis
- Unsure which test is appropriate
- Want to verify your test selection
- Need to explain test choice to reviewers

### Input Parameters

```javascript
{
  "research_question": string,        // Required: Your research question
  "outcome_type": string,             // Required: "continuous", "binary", "categorical", "count", "time-to-event"
  "predictor_type": string,           // Optional: "continuous", "binary", "categorical"
  "num_groups": number,               // Optional: Number of groups to compare
  "paired": boolean,                  // Optional: Are observations paired? (default: false)
  "sample_size": number,              // Optional: Total sample size
  "data_file": string,                // Optional: Path to CSV for automatic assumption checking
  "outcome_variable": string,         // Optional: Name of outcome variable in data
  "group_variable": string            // Optional: Name of grouping variable in data
}
```

### Examples

#### Example 1: Compare 2 Independent Groups (Continuous Outcome)

**Scenario**: RCT comparing drug vs placebo on blood pressure

```javascript
{
  "tool": "select_statistical_test",
  "arguments": {
    "research_question": "Does Drug X reduce systolic blood pressure compared to placebo?",
    "outcome_type": "continuous",
    "predictor_type": "binary",
    "num_groups": 2,
    "paired": false,
    "sample_size": 100,
    "data_file": "data/rct-data.csv",
    "outcome_variable": "systolic_bp",
    "group_variable": "treatment"
  }
}
```

**Expected Output**:
```json
{
  "recommended_test": "Independent samples t-test",
  "alternative_tests": [
    "Mann-Whitney U test (if normality violated)",
    "Welch's t-test (if variances unequal)"
  ],
  "assumptions": [
    "Normality of outcome in each group",
    "Homogeneity of variance",
    "Independence of observations"
  ],
  "rationale": "Continuous outcome, 2 independent groups, assuming normal distribution",
  "sample_size_adequate": true,
  "power_estimate": 0.85,
  "assumption_check_results": {
    "normality": {
      "group1_p": 0.23,
      "group2_p": 0.45,
      "met": true
    },
    "homogeneity": {
      "levene_p": 0.67,
      "met": true
    }
  }
}
```

#### Example 2: Compare 3+ Groups (Continuous Outcome)

**Scenario**: Compare pain scores across 3 treatment groups

```javascript
{
  "tool": "select_statistical_test",
  "arguments": {
    "research_question": "Is there a difference in pain scores between 3 treatment groups?",
    "outcome_type": "continuous",
    "predictor_type": "categorical",
    "num_groups": 3,
    "paired": false,
    "sample_size": 90
  }
}
```

**Expected Output**:
```json
{
  "recommended_test": "One-way ANOVA",
  "alternative_tests": [
    "Kruskal-Wallis test (if normality violated)",
    "Welch's ANOVA (if variances unequal)"
  ],
  "assumptions": [
    "Normality of outcome in each group",
    "Homogeneity of variance across groups",
    "Independence of observations"
  ],
  "rationale": "Continuous outcome, 3+ independent groups",
  "sample_size_adequate": true,
  "post_hoc_tests": [
    "Tukey HSD (if equal variances)",
    "Games-Howell (if unequal variances)"
  ]
}
```

#### Example 3: Binary Outcome (2 Groups)

**Scenario**: Compare success rates between treatment and control

```javascript
{
  "tool": "select_statistical_test",
  "arguments": {
    "research_question": "Does treatment increase success rate compared to control?",
    "outcome_type": "binary",
    "predictor_type": "binary",
    "num_groups": 2,
    "sample_size": 200
  }
}
```

**Expected Output**:
```json
{
  "recommended_test": "Chi-square test of independence",
  "alternative_tests": [
    "Fisher's exact test (if expected frequencies <5)",
    "Logistic regression (for adjusted analysis)"
  ],
  "assumptions": [
    "Expected frequencies ≥5 in all cells",
    "Independence of observations"
  ],
  "rationale": "Binary outcome, 2 independent groups",
  "effect_measure": "Risk Ratio or Odds Ratio"
}
```

#### Example 4: Correlation (2 Continuous Variables)

**Scenario**: Relationship between age and cholesterol

```javascript
{
  "tool": "select_statistical_test",
  "arguments": {
    "research_question": "Is there a relationship between age and cholesterol level?",
    "outcome_type": "continuous",
    "predictor_type": "continuous",
    "sample_size": 150
  }
}
```

**Expected Output**:
```json
{
  "recommended_test": "Pearson correlation",
  "alternative_tests": [
    "Spearman correlation (if non-linear or non-normal)",
    "Linear regression (for prediction)"
  ],
  "assumptions": [
    "Linear relationship",
    "Bivariate normality",
    "No extreme outliers"
  ],
  "rationale": "Two continuous variables, assessing linear relationship"
}
```

#### Example 5: Paired Data

**Scenario**: Before-after comparison

```javascript
{
  "tool": "select_statistical_test",
  "arguments": {
    "research_question": "Does the intervention reduce symptoms from baseline to follow-up?",
    "outcome_type": "continuous",
    "num_groups": 2,
    "paired": true,
    "sample_size": 50
  }
}
```

**Expected Output**:
```json
{
  "recommended_test": "Paired t-test",
  "alternative_tests": [
    "Wilcoxon signed-rank test (if normality violated)"
  ],
  "assumptions": [
    "Normality of differences",
    "Independence of pairs"
  ],
  "rationale": "Continuous outcome, paired observations (before-after)"
}
```

---

## 2. Check Assumptions

### Purpose
Comprehensively tests statistical assumptions with diagnostic plots to determine if parametric tests are appropriate.

### When to Use
- Before running t-tests, ANOVA, or regression
- When reviewer questions assumption validity
- To decide between parametric vs non-parametric tests
- To identify outliers or influential points

### Input Parameters

```javascript
{
  "data_file": string,              // Required: Path to CSV data file
  "test_type": string,              // Required: "t-test", "anova", "regression", "correlation", "chi-square"
  "outcome_variable": string,       // Required: Name of outcome variable
  "predictor_variable": string,     // Optional: For regression/correlation
  "group_variable": string,         // Optional: For t-test/ANOVA
  "output_dir": string              // Optional: Directory for diagnostic plots (default: temp)
}
```

### Examples

#### Example 1: Check Assumptions for t-test

```javascript
{
  "tool": "check_assumptions",
  "arguments": {
    "data_file": "data/rct-data.csv",
    "test_type": "t-test",
    "outcome_variable": "systolic_bp",
    "group_variable": "treatment",
    "output_dir": "results/diagnostics/"
  }
}
```

**Expected Output**:
```json
{
  "test_type": "t-test",
  "assumptions_met": true,
  "normality": {
    "group1": {
      "shapiro_wilk_p": 0.23,
      "anderson_darling_p": 0.18,
      "interpretation": "Normal distribution (p > 0.05)"
    },
    "group2": {
      "shapiro_wilk_p": 0.45,
      "anderson_darling_p": 0.52,
      "interpretation": "Normal distribution (p > 0.05)"
    },
    "met": true
  },
  "homogeneity_of_variance": {
    "levene_test_p": 0.67,
    "interpretation": "Equal variances (p > 0.05)",
    "met": true
  },
  "outliers": {
    "group1_outliers": [],
    "group2_outliers": [45],
    "interpretation": "1 outlier detected in group 2 (row 45)"
  },
  "recommendation": "Assumptions met. Proceed with independent t-test.",
  "plots_generated": [
    "results/diagnostics/qq_plot_group1.png",
    "results/diagnostics/qq_plot_group2.png",
    "results/diagnostics/histogram_group1.png",
    "results/diagnostics/histogram_group2.png",
    "results/diagnostics/boxplot.png"
  ]
}
```

#### Example 2: Check Assumptions for ANOVA

```javascript
{
  "tool": "check_assumptions",
  "arguments": {
    "data_file": "data/pain-study.csv",
    "test_type": "anova",
    "outcome_variable": "pain_score",
    "group_variable": "treatment",
    "output_dir": "results/diagnostics/"
  }
}
```

**Expected Output**:
```json
{
  "test_type": "anova",
  "assumptions_met": false,
  "normality": {
    "group1": {"shapiro_wilk_p": 0.03, "met": false},
    "group2": {"shapiro_wilk_p": 0.12, "met": true},
    "group3": {"shapiro_wilk_p": 0.08, "met": true},
    "overall_met": false
  },
  "homogeneity_of_variance": {
    "levene_test_p": 0.45,
    "met": true
  },
  "recommendation": "Normality violated in group 1. Consider Kruskal-Wallis test instead of ANOVA.",
  "alternative_test": "Kruskal-Wallis test"
}
```

#### Example 3: Check Assumptions for Linear Regression

```javascript
{
  "tool": "check_assumptions",
  "arguments": {
    "data_file": "data/regression-data.csv",
    "test_type": "regression",
    "outcome_variable": "cholesterol",
    "predictor_variable": "age",
    "output_dir": "results/diagnostics/"
  }
}
```

**Expected Output**:
```json
{
  "test_type": "regression",
  "assumptions_met": true,
  "linearity": {
    "interpretation": "Linear relationship observed",
    "met": true
  },
  "normality_of_residuals": {
    "shapiro_wilk_p": 0.34,
    "interpretation": "Residuals normally distributed",
    "met": true
  },
  "homoscedasticity": {
    "breusch_pagan_p": 0.56,
    "interpretation": "Constant variance of residuals",
    "met": true
  },
  "independence": {
    "durbin_watson": 1.98,
    "interpretation": "No autocorrelation (DW ≈ 2)",
    "met": true
  },
  "influential_points": {
    "cooks_distance_threshold": 0.5,
    "influential_observations": [],
    "interpretation": "No influential points detected"
  },
  "recommendation": "All assumptions met. Proceed with linear regression.",
  "plots_generated": [
    "results/diagnostics/scatterplot.png",
    "results/diagnostics/residual_vs_fitted.png",
    "results/diagnostics/qq_plot_residuals.png",
    "results/diagnostics/scale_location.png",
    "results/diagnostics/cooks_distance.png"
  ]
}
```

### Interpreting Diagnostic Plots

#### Q-Q Plot (Quantile-Quantile Plot)
- **Purpose**: Check normality
- **Interpretation**: 
  - Points follow diagonal line → Normal distribution
  - Points deviate from line → Non-normal distribution
  - S-shaped curve → Skewed distribution
  - Curved ends → Heavy or light tails

#### Histogram
- **Purpose**: Visualize distribution shape
- **Interpretation**:
  - Bell-shaped → Normal distribution
  - Skewed left/right → Non-normal
  - Multiple peaks → Bimodal/multimodal

#### Boxplot
- **Purpose**: Identify outliers and compare distributions
- **Interpretation**:
  - Points beyond whiskers → Outliers
  - Box width → Spread of data
  - Median line position → Skewness

#### Residual vs Fitted Plot
- **Purpose**: Check linearity and homoscedasticity
- **Interpretation**:
  - Random scatter around 0 → Good
  - Pattern (curved, funnel) → Violation
  - Funnel shape → Heteroscedasticity

#### Cook's Distance Plot
- **Purpose**: Identify influential points
- **Interpretation**:
  - Cook's D > 0.5 → Potentially influential
  - Cook's D > 1.0 → Highly influential
  - Investigate influential points

---

## 3. Validate Data

### Purpose
Comprehensive data quality assessment including missing data analysis, outlier detection, duplicate checking, and descriptive statistics.

### When to Use
- Before any statistical analysis
- After data collection/entry
- To identify data quality issues
- For data cleaning documentation

### Input Parameters

```javascript
{
  "data_file": string,              // Required: Path to CSV data file
  "variable_specs": array,          // Optional: Variable specifications for validation
  "check_missing": boolean,         // Optional: Perform missing data analysis (default: true)
  "check_outliers": boolean,        // Optional: Detect outliers (default: true)
  "check_duplicates": boolean       // Optional: Check for duplicates (default: true)
}
```

### Examples

#### Example 1: Basic Data Validation

```javascript
{
  "tool": "validate_data",
  "arguments": {
    "data_file": "data/study-data.csv",
    "check_missing": true,
    "check_outliers": true,
    "check_duplicates": true
  }
}
```

**Expected Output**:
```json
{
  "total_rows": 200,
  "total_columns": 8,
  "missing_data": {
    "overall_missing_percent": 3.5,
    "variables": {
      "age": {"missing": 0, "percent": 0},
      "sex": {"missing": 0, "percent": 0},
      "baseline_bp": {"missing": 5, "percent": 2.5},
      "follow_up_bp": {"missing": 12, "percent": 6.0}
    },
    "mcar_test": {
      "littles_test_p": 0.45,
      "interpretation": "Data missing completely at random (MCAR)"
    }
  },
  "outliers": {
    "age": {
      "outliers": [185, 192],
      "values": [105, 102],
      "interpretation": "2 outliers detected (IQR method)"
    },
    "baseline_bp": {
      "outliers": [67],
      "values": [220],
      "interpretation": "1 outlier detected"
    }
  },
  "duplicates": {
    "duplicate_rows": 0,
    "interpretation": "No duplicate rows detected"
  },
  "descriptive_statistics": {
    "age": {
      "mean": 52.3,
      "sd": 12.5,
      "median": 51,
      "iqr": 18,
      "min": 22,
      "max": 105
    },
    "sex": {
      "Male": 98,
      "Female": 102
    }
  }
}
```

#### Example 2: Validation with Variable Specifications

```javascript
{
  "tool": "validate_data",
  "arguments": {
    "data_file": "data/rct-data.csv",
    "variable_specs": [
      {
        "name": "age",
        "type": "numeric",
        "required": true,
        "min": 18,
        "max": 100
      },
      {
        "name": "sex",
        "type": "categorical",
        "required": true,
        "allowed_values": ["Male", "Female"]
      },
      {
        "name": "treatment",
        "type": "categorical",
        "required": true,
        "allowed_values": ["Drug", "Placebo"]
      },
      {
        "name": "systolic_bp",
        "type": "numeric",
        "required": true,
        "min": 80,
        "max": 250
      }
    ]
  }
}
```

**Expected Output**:
```json
{
  "validation_results": {
    "age": {
      "valid": 195,
      "invalid": 5,
      "issues": [
        "Row 45: value 105 exceeds max (100)",
        "Row 67: value 15 below min (18)"
      ]
    },
    "sex": {
      "valid": 200,
      "invalid": 0
    },
    "treatment": {
      "valid": 198,
      "invalid": 2,
      "issues": [
        "Row 123: value 'drug' not in allowed values (case-sensitive)"
      ]
    },
    "systolic_bp": {
      "valid": 199,
      "invalid": 1,
      "issues": [
        "Row 67: value 300 exceeds max (250)"
      ]
    }
  },
  "overall_valid": false,
  "total_issues": 8,
  "recommendation": "Fix validation issues before analysis"
}
```

---

## 4. Calculate Power

### Purpose
Statistical power analysis for sample size planning (a priori) or post-hoc power assessment.

### When to Use
- **Before study**: Calculate required sample size
- **After study**: Assess achieved power
- **Grant applications**: Justify sample size
- **Null results**: Determine if underpowered

### Input Parameters

```javascript
{
  "test_type": string,              // Required: "t-test", "anova", "correlation", "chi-square", "regression"
  "effect_size": number,            // Optional: Expected effect size
  "sample_size": number,            // Optional: Sample size per group
  "power": number,                  // Optional: Desired power (default: 0.80)
  "alpha": number,                  // Optional: Significance level (default: 0.05)
  "calculate": string,              // Required: "power", "sample_size", "effect_size"
  "num_groups": number,             // Optional: For ANOVA
  "alternative": string             // Optional: "two.sided", "greater", "less" (default: "two.sided")
}
```

### Examples

#### Example 1: Calculate Required Sample Size (A Priori)

**Scenario**: Planning an RCT, expect medium effect (d=0.5), want 80% power

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

**Expected Output**:
```json
{
  "test_type": "t-test",
  "calculation_type": "sample_size",
  "input": {
    "effect_size": 0.5,
    "power": 0.80,
    "alpha": 0.05
  },
  "result": {
    "sample_size_per_group": 64,
    "total_sample_size": 128
  },
  "effect_size_interpretation": "Medium effect (Cohen's d = 0.5)",
  "power_adequate": true,
  "recommendation": "Recruit at least 64 participants per group (128 total) to detect a medium effect with 80% power.",
  "power_curve_saved": "power_curve.png"
}
```

#### Example 2: Calculate Achieved Power (Post-Hoc)

**Scenario**: Study completed with n=50 per group, observed effect d=0.45

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

**Expected Output**:
```json
{
  "test_type": "t-test",
  "calculation_type": "power",
  "input": {
    "effect_size": 0.45,
    "sample_size_per_group": 50,
    "alpha": 0.05
  },
  "result": {
    "power": 0.68
  },
  "power_adequate": false,
  "interpretation": "Study was underpowered (68% power). Recommended power is 80%.",
  "recommendation": "To achieve 80% power with effect size 0.45, would need 78 participants per group."
}
```

#### Example 3: Calculate Detectable Effect Size

**Scenario**: Have n=40 per group, want to know what effect size is detectable with 80% power

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

**Expected Output**:
```json
{
  "test_type": "t-test",
  "calculation_type": "effect_size",
  "input": {
    "sample_size_per_group": 40,
    "power": 0.80,
    "alpha": 0.05
  },
  "result": {
    "detectable_effect_size": 0.64
  },
  "effect_size_interpretation": "Medium to large effect (Cohen's d = 0.64)",
  "interpretation": "With 40 participants per group, can detect effects of d ≥ 0.64 with 80% power.",
  "recommendation": "Sample size adequate for detecting medium-to-large effects only."
}
```

#### Example 4: Power Analysis for ANOVA

**Scenario**: Planning study with 3 groups, expect medium effect (f=0.25)

```javascript
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "anova",
    "effect_size": 0.25,
    "power": 0.80,
    "alpha": 0.05,
    "calculate": "sample_size",
    "num_groups": 3
  }
}
```

**Expected Output**:
```json
{
  "test_type": "anova",
  "calculation_type": "sample_size",
  "input": {
    "effect_size": 0.25,
    "power": 0.80,
    "alpha": 0.05,
    "num_groups": 3
  },
  "result": {
    "sample_size_per_group": 52,
    "total_sample_size": 156
  },
  "effect_size_interpretation": "Medium effect (Cohen's f = 0.25)",
  "recommendation": "Recruit at least 52 participants per group (156 total) for 3-group ANOVA."
}
```

#### Example 5: Power Analysis for Correlation

**Scenario**: Planning correlation study, expect r=0.30

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

**Expected Output**:
```json
{
  "test_type": "correlation",
  "calculation_type": "sample_size",
  "input": {
    "effect_size": 0.30,
    "power": 0.80,
    "alpha": 0.05
  },
  "result": {
    "total_sample_size": 84
  },
  "effect_size_interpretation": "Medium correlation (r = 0.30)",
  "recommendation": "Recruit at least 84 participants to detect r = 0.30 with 80% power."
}
```

### Effect Size Guidelines

#### Cohen's d (t-test, mean differences)
- **Small**: d = 0.2
- **Medium**: d = 0.5
- **Large**: d = 0.8

#### Cohen's f (ANOVA)
- **Small**: f = 0.10
- **Medium**: f = 0.25
- **Large**: f = 0.40

#### Correlation (r)
- **Small**: r = 0.10
- **Medium**: r = 0.30
- **Large**: r = 0.50

#### Cohen's w (Chi-square)
- **Small**: w = 0.10
- **Medium**: w = 0.30
- **Large**: w = 0.50

#### Cohen's f² (Regression)
- **Small**: f² = 0.02
- **Medium**: f² = 0.15
- **Large**: f² = 0.35

---

## 5. Run Comprehensive Analysis

### Purpose
End-to-end statistical analysis workflow that automatically performs all steps from data validation to final report generation.

### When to Use
- **Primary analysis** of RCTs, cohort studies, case-control studies, or cross-sectional studies
- When you want a complete analysis with minimal manual steps
- For publication-ready output (Table 1, results, report)
- When following reporting guidelines (CONSORT, STROBE)

### Input Parameters

```javascript
{
  "data_file": string,              // Required: Path to CSV data file
  "research_question": string,      // Required: Research question or hypothesis
  "outcome_variable": string,       // Required: Name of primary outcome variable
  "predictor_variables": array,     // Optional: Names of predictor/exposure variables
  "group_variable": string,         // Optional: Name of grouping variable
  "covariates": array,              // Optional: Names of covariates for adjustment
  "study_design": string,           // Required: "rct", "cohort", "case-control", "cross-sectional"
  "output_dir": string,             // Optional: Directory for outputs (default: temp)
  "generate_report": boolean        // Optional: Generate Word report (default: true)
}
```

### Examples

#### Example 1: RCT Analysis (Complete Workflow)

**Scenario**: Analyze RCT comparing drug vs placebo on blood pressure

```javascript
{
  "tool": "run_comprehensive_analysis",
  "arguments": {
    "data_file": "data/rct-blood-pressure.csv",
    "research_question": "Does Drug X reduce systolic blood pressure compared to placebo in hypertensive patients?",
    "outcome_variable": "systolic_bp_change",
    "predictor_variables": ["treatment_group"],
    "covariates": ["baseline_bp", "age", "sex", "bmi"],
    "study_design": "rct",
    "output_dir": "results/rct-analysis/",
    "generate_report": true
  }
}
```

**Expected Output**:
```json
{
  "analysis_complete": true,
  "study_design": "rct",
  "reporting_guideline": "CONSORT",
  
  "step1_validation": {
    "total_participants": 200,
    "missing_data_percent": 2.5,
    "outliers_detected": 3,
    "data_quality": "Good"
  },
  
  "step2_baseline_characteristics": {
    "table1_generated": "results/rct-analysis/baseline-characteristics.docx",
    "groups_balanced": true,
    "p_values_all_gt_0.05": true
  },
  
  "step3_test_selection": {
    "recommended_test": "Independent samples t-test",
    "rationale": "Continuous outcome, 2 independent groups, normal distribution"
  },
  
  "step4_assumptions": {
    "normality_met": true,
    "homogeneity_met": true,
    "assumptions_satisfied": true
  },
  
  "step5_primary_analysis": {
    "test": "Independent t-test",
    "mean_difference": -12.5,
    "95_ci": [-18.2, -6.8],
    "t_statistic": -4.32,
    "df": 198,
    "p_value": 0.00003,
    "interpretation": "Statistically significant difference (p < 0.001)"
  },
  
  "step6_effect_sizes": {
    "cohens_d": 0.61,
    "95_ci": [0.33, 0.89],
    "interpretation": "Medium to large effect"
  },
  
  "step7_interpretation": {
    "clinical_significance": "Drug X reduced systolic BP by 12.5 mmHg (95% CI: 6.8 to 18.2), which is clinically meaningful.",
    "statistical_significance": "p < 0.001",
    "effect_size": "Medium to large (d = 0.61)",
    "conclusion": "Drug X is effective in reducing systolic blood pressure in hypertensive patients."
  },
  
  "files_generated": [
    "results/rct-analysis/baseline-characteristics.docx",
    "results/rct-analysis/diagnostic-plots/qq_plot.png",
    "results/rct-analysis/diagnostic-plots/boxplot.png",
    "results/rct-analysis/analysis-results.json",
    "results/rct-analysis/comprehensive-report.docx"
  ],
  
  "reporting_checklist": {
    "consort_items_addressed": [
      "Baseline characteristics (Table 1)",
      "Primary outcome analysis",
      "Effect size with CI",
      "Statistical methods described",
      "Assumptions checked"
    ]
  }
}
```

**Generated Files**:
1. **baseline-characteristics.docx** - Publication-ready Table 1
2. **diagnostic-plots/** - Assumption checking plots
3. **analysis-results.json** - Complete results in JSON format
4. **comprehensive-report.docx** - Full analysis report with interpretation

#### Example 2: Cohort Study Analysis

**Scenario**: Analyze cohort study on smoking and lung cancer

```javascript
{
  "tool": "run_comprehensive_analysis",
  "arguments": {
    "data_file": "data/cohort-smoking.csv",
    "research_question": "Is smoking associated with increased risk of lung cancer?",
    "outcome_variable": "lung_cancer",
    "predictor_variables": ["smoking_status"],
    "covariates": ["age", "sex", "occupational_exposure", "family_history"],
    "study_design": "cohort",
    "output_dir": "results/cohort-analysis/",
    "generate_report": true
  }
}
```

**Expected Output**:
```json
{
  "analysis_complete": true,
  "study_design": "cohort",
  "reporting_guideline": "STROBE",
  
  "step5_primary_analysis": {
    "test": "Logistic regression (adjusted)",
    "outcome": "Lung cancer (yes/no)",
    "exposure": "Smoking status",
    "adjusted_or": 4.52,
    "95_ci": [2.87, 7.12],
    "p_value": 0.00001,
    "interpretation": "Smokers have 4.52 times higher odds of lung cancer compared to non-smokers, after adjusting for age, sex, occupational exposure, and family history."
  },
  
  "confounders_adjusted": ["age", "sex", "occupational_exposure", "family_history"],
  
  "reporting_checklist": {
    "strobe_items_addressed": [
      "Study design clearly stated",
      "Baseline characteristics by exposure",
      "Adjusted analysis for confounders",
      "Effect measure with CI",
      "Statistical methods described"
    ]
  }
}
```

#### Example 3: Cross-Sectional Study

**Scenario**: Analyze relationship between BMI and diabetes prevalence

```javascript
{
  "tool": "run_comprehensive_analysis",
  "arguments": {
    "data_file": "data/cross-sectional-diabetes.csv",
    "research_question": "Is higher BMI associated with increased diabetes prevalence?",
    "outcome_variable": "diabetes",
    "predictor_variables": ["bmi_category"],
    "covariates": ["age", "sex", "physical_activity"],
    "study_design": "cross-sectional",
    "output_dir": "results/cross-sectional-analysis/",
    "generate_report": true
  }
}
```

**Expected Output**:
```json
{
  "analysis_complete": true,
  "study_design": "cross-sectional",
  "reporting_guideline": "STROBE",
  
  "step5_primary_analysis": {
    "test": "Chi-square test",
    "prevalence_by_bmi": {
      "normal": "5.2%",
      "overweight": "12.8%",
      "obese": "24.6%"
    },
    "chi_square": 45.67,
    "df": 2,
    "p_value": 0.00001,
    "interpretation": "Significant association between BMI category and diabetes prevalence (p < 0.001)"
  },
  
  "limitation_noted": "Cross-sectional design cannot establish temporal sequence or causality."
}
```

---

## Complete Workflow Examples

### Workflow 1: Manual Step-by-Step Analysis

**Scenario**: You want full control over each step

```javascript
// Step 1: Validate data
{
  "tool": "validate_data",
  "arguments": {
    "data_file": "data/study.csv",
    "check_missing": true,
    "check_outliers": true,
    "check_duplicates": true
  }
}

// Step 2: Select statistical test
{
  "tool": "select_statistical_test",
  "arguments": {
    "research_question": "Does treatment reduce symptoms?",
    "outcome_type": "continuous",
    "predictor_type": "binary",
    "num_groups": 2,
    "sample_size": 100
  }
}

// Step 3: Check assumptions
{
  "tool": "check_assumptions",
  "arguments": {
    "data_file": "data/study.csv",
    "test_type": "t-test",
    "outcome_variable": "symptom_score",
    "group_variable": "treatment",
    "output_dir": "diagnostics/"
  }
}

// Step 4: Calculate power
{
  "tool": "calculate_power",
  "arguments": {
    "test_type": "t-test",
    "effect_size": 0.5,
    "sample_size": 50,
    "calculate": "power"
  }
}

// Step 5: Perform analysis in R
// (Use R directly or other tools)
```

### Workflow 2: Automated Complete Analysis

**Scenario**: You want everything done automatically

```javascript
// Single tool call does everything
{
  "tool": "run_comprehensive_analysis",
  "arguments": {
    "data_file": "data/study.csv",
    "research_question": "Does treatment reduce symptoms compared to control?",
    "outcome_variable": "symptom_score",
    "predictor_variables": ["treatment"],
    "covariates": ["age", "sex", "baseline_score"],
    "study_design": "rct",
    "output_dir": "results/",
    "generate_report": true
  }
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "R not found" Error

**Problem**: R is not installed or not in PATH

**Solution**:
```bash
# Windows: Install R from https://cran.r-project.org/
# Add R to PATH: C:\Program Files\R\R-4.x.x\bin

# Linux/Mac:
sudo apt-get install r-base  # Ubuntu/Debian
brew install r                # Mac
```

#### Issue 2: "Package installation failed"

**Problem**: R package installation error

**Solution**:
```r
# Run in R console
install.packages(c("jsonlite", "nortest", "car", "lmtest", "pwr", 
                   "gtsummary", "flextable", "officer"),
                 repos = "https://cloud.r-project.org")
```

#### Issue 3: "Assumptions violated"

**Problem**: Normality or homogeneity assumptions not met

**Solution**:
- Use non-parametric alternative (Mann-Whitney U, Kruskal-Wallis)
- Transform data (log, square root)
- Use robust methods (Welch's t-test)
- Increase sample size

#### Issue 4: "Insufficient power"

**Problem**: Post-hoc power analysis shows <80% power

**Solution**:
- Report as exploratory/pilot study
- Calculate required sample size for future study
- Consider effect size - may still be clinically meaningful
- Combine with other studies in meta-analysis

#### Issue 5: "Missing data >10%"

**Problem**: High proportion of missing data

**Solution**:
- Analyze missing data patterns (MCAR, MAR, MNAR)
- Use multiple imputation if MAR
- Perform sensitivity analysis
- Report as limitation

#### Issue 6: "Outliers detected"

**Problem**: Outliers identified in data

**Solution**:
- Investigate outliers (data entry errors?)
- Perform analysis with and without outliers (sensitivity analysis)
- Use robust methods (median, IQR, non-parametric tests)
- Report outlier handling in methods

---

## Best Practices

### 1. Always Validate Data First
```javascript
// Start every analysis with data validation
validate_data() → check_assumptions() → analyze()
```

### 2. Check Power Before and After
```javascript
// Before study: Calculate required n
calculate_power(calculate="sample_size")

// After study: Calculate achieved power
calculate_power(calculate="power")
```

### 3. Use Comprehensive Analysis for Primary Outcomes
```javascript
// For main research question, use automated workflow
run_comprehensive_analysis()

// For exploratory analyses, use step-by-step
```

### 4. Always Check Assumptions
```javascript
// Never skip assumption checking
check_assumptions() before t-test/ANOVA/regression
```

### 5. Report Effect Sizes
```javascript
// Always report effect sizes with CI, not just p-values
// Cohen's d, odds ratio, correlation, etc.
```

### 6. Follow Reporting Guidelines
- **RCT**: CONSORT
- **Observational**: STROBE
- **Meta-analysis**: PRISMA

### 7. Save All Code and Output
```javascript
// Make analysis reproducible
// Save R code, output, plots, data
```

---

## Additional Resources

- [DATA-ANALYSIS-AGENT-RESEARCH.md](./DATA-ANALYSIS-AGENT-RESEARCH.md) - Comprehensive research document
- [ASSUMPTION-CHECKING-GUIDE.md](./ASSUMPTION-CHECKING-GUIDE.md) - Detailed assumption interpretation
- [POWER-ANALYSIS-GUIDE.md](./POWER-ANALYSIS-GUIDE.md) - Sample size planning guide
- [REPORTING-GUIDELINES.md](./REPORTING-GUIDELINES.md) - CONSORT/STROBE/PRISMA checklists

---

**Version**: 4.2.0  
**Last Updated**: December 4, 2025  
**Author**: MedResearch AI Team
