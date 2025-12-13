---
description: Test meta-analysis tools for MedResearch-AI project
---

# Test Meta-Analysis Tools

Test the meta-analysis and biostatistics tools including statistical calculations, forest plots, heterogeneity analysis, and publication bias detection.

## Usage

Just type `/test-meta`

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Builds the project if needed
3. Runs `npm run test:meta`
4. Tests statistical calculations
5. Verifies visualization generation
6. Reports test results

## Example

```
User: /test-meta
Assistant: Testing MedResearch-AI meta-analysis tools...

Building project...
✅ Build successful

Running meta-analysis tests:

1. Effect Size Calculations
   ✅ Odds ratio: OK
   ✅ Risk ratio: OK
   ✅ Risk difference: OK
   ✅ Standardized mean difference: OK
   ✅ Confidence intervals: OK
   Duration: 0.5s

2. Meta-Analysis Models
   ✅ Fixed-effect model: OK
   ✅ Random-effects model: OK
   ✅ DerSimonian-Laird: OK
   ✅ Inverse variance: OK
   Duration: 0.8s

3. Heterogeneity Analysis
   ✅ I² statistic: OK (calculated: 45.2%)
   ✅ Q statistic: OK (p=0.023)
   ✅ Tau² estimation: OK
   ✅ Prediction intervals: OK
   Duration: 0.6s

4. Publication Bias
   ✅ Funnel plot generation: OK
   ✅ Egger's test: OK (p=0.156)
   ✅ Begg's test: OK (p=0.234)
   ✅ Trim-and-fill: OK
   Duration: 1.2s

5. Forest Plot Generation
   ✅ Plot creation: OK
   ✅ Subgroup analysis: OK
   ✅ Sensitivity analysis: OK
   ✅ Export to PNG: OK
   Duration: 2.1s

6. Power Analysis
   ✅ Sample size calculation: OK
   ✅ Power calculation: OK
   ✅ Effect size detection: OK
   Duration: 0.4s

7. Advanced Statistics
   ✅ Meta-regression: OK
   ✅ Subgroup analysis: OK
   ✅ Cumulative meta-analysis: OK
   ✅ Network meta-analysis: OK
   Duration: 1.8s

Test Summary:
  Total tests: 28
  Passed: 28
  Failed: 0
  Total duration: 7.4s

✅ All meta-analysis tests passed!
```

## Features Tested

### Effect Size Calculations
- Odds ratio (OR)
- Risk ratio (RR)
- Risk difference (RD)
- Standardized mean difference (SMD)
- Confidence intervals (95% CI)
- Variance calculations

### Meta-Analysis Models
- Fixed-effect model
- Random-effects model
- DerSimonian-Laird method
- Inverse variance weighting
- Mantel-Haenszel method

### Heterogeneity Assessment
- I² statistic (0-100%)
- Q statistic (Cochran's Q)
- Tau² estimation
- Prediction intervals
- Subgroup heterogeneity

### Publication Bias Detection
- Funnel plot visualization
- Egger's regression test
- Begg's rank correlation
- Trim-and-fill method
- Contour-enhanced funnel plots

### Visualization
- Forest plots
- Funnel plots
- Radial plots
- L'Abbé plots
- Galbraith plots

### Power Analysis
- Sample size calculation
- Statistical power estimation
- Effect size detection
- Alpha/beta error rates

### Advanced Methods
- Meta-regression
- Subgroup analysis
- Cumulative meta-analysis
- Network meta-analysis
- Bayesian meta-analysis

## When to Use

- After updating statistical code
- Testing new analysis methods
- Verifying calculation accuracy
- Before running systematic reviews
- Quality assurance
- Performance testing

## Test Data

Tests use validated datasets:
- Cochrane review data
- Published meta-analyses
- Simulated study data
- Edge cases and extremes

## Common Issues

### Calculation Errors
```
❌ I² statistic calculation failed
Fix: Check input data format and variance calculations
```

### Visualization Errors
```
❌ Forest plot generation failed
Fix: Verify plotting library installation
```

### Performance Issues
```
⚠️ Large meta-analysis taking too long
Fix: Optimize calculation algorithms
```

## Validation

All calculations validated against:
- RevMan (Cochrane)
- Comprehensive Meta-Analysis (CMA)
- R metafor package
- Stata meta commands

## Related Commands

- `/test-med` - Run all tests
- `/test-databases` - Test database integrations
- `/test-plagiarism` - Test plagiarism detection
- `/med-build` - Build project

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
