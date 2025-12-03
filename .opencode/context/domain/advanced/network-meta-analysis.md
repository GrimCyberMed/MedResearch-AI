# Network Meta-Analysis - Advanced Methodology Guide

## Overview
Network meta-analysis (NMA), also called mixed treatment comparison or multiple treatment meta-analysis, allows simultaneous comparison of multiple interventions (3 or more) by combining direct and indirect evidence in a single coherent analysis.

## When to Use Network Meta-Analysis

### Appropriate Scenarios ✅
- **Multiple interventions**: ≥3 interventions to compare
- **Connected network**: All interventions connected through common comparators
- **Similar populations**: Studies address similar populations and outcomes
- **Clinical relevance**: Need to rank interventions or compare those not directly compared
- **Sufficient evidence**: Adequate number of studies for each comparison

### Example Research Questions
- "Which antidepressant is most effective for major depression?" (20+ antidepressants)
- "What is the best treatment for type 2 diabetes?" (multiple drug classes)
- "Which psychotherapy is most effective for PTSD?" (CBT, EMDR, exposure therapy, etc.)

## Key Concepts

### Direct vs Indirect Evidence

**Direct Evidence**:
- Head-to-head comparison in RCTs
- Example: Study comparing Drug A vs Drug B directly

**Indirect Evidence**:
- Inferred through common comparator
- Example: Drug A vs C inferred from A vs B and B vs C studies

**Network Estimate**:
- Combines direct + indirect evidence
- More precise than either alone
- Requires transitivity assumption

### Network Geometry

**Network Plot**:
- Nodes = Interventions
- Edges = Direct comparisons
- Edge thickness ∝ Number of studies
- Node size ∝ Total sample size

**Example Network**:
```
        Drug A
       /  |  \
      /   |   \
   Drug B-+-Drug C
      \   |   /
       \  |  /
      Placebo
```

**Connected Network**: All interventions linked (directly or indirectly)
**Disconnected Network**: Some interventions isolated (cannot be compared)

## Key Assumptions

### 1. Transitivity (Similarity)

**Definition**: Populations, study designs, and outcome measures are similar enough that indirect comparisons are valid.

**Assessment**:
- Compare study characteristics across comparisons
- Check for effect modifiers (age, severity, dose, duration)
- Examine distribution of potential confounders

**Example Violation**:
- Drug A vs B studies: Mild depression, outpatient
- Drug B vs C studies: Severe depression, inpatient
- **Problem**: Indirect A vs C comparison invalid (different populations)

**How to Check**:
```
Compare across comparisons:
- Population characteristics (age, sex, severity)
- Intervention characteristics (dose, duration, delivery)
- Study design (RCT quality, blinding, follow-up)
- Outcome measures (same scales, timepoints)
```

### 2. Consistency (Coherence)

**Definition**: Direct and indirect evidence agree (no statistical disagreement).

**Assessment**:
- **Node-splitting**: Compare direct vs indirect estimates for each comparison
- **Loop inconsistency**: Check closed loops (A-B-C-A) for consistency
- **Design-by-treatment interaction**: Global inconsistency test

**Interpretation**:
- **Consistent**: Direct ≈ Indirect (p > 0.10)
- **Inconsistent**: Direct ≠ Indirect (p < 0.10)

**Causes of Inconsistency**:
- Violation of transitivity
- Effect modification
- Heterogeneity
- Study quality differences
- Publication bias

**Actions if Inconsistent**:
1. Investigate sources (meta-regression, subgroup analysis)
2. Consider inconsistency model (allows disagreement)
3. Downgrade certainty of evidence (GRADE)
4. Report inconsistency clearly

## Statistical Methods

### Frequentist Approach

**Multivariate Meta-Analysis**:
- Extends standard meta-analysis to multiple treatments
- Accounts for correlations between comparisons
- Uses multivariate random-effects model

**Software**:
- R: `netmeta` package
- Stata: `network` command

**Advantages**:
- Familiar framework for meta-analysts
- Fast computation
- Straightforward interpretation

**Disadvantages**:
- Limited flexibility for complex models
- Difficult to incorporate prior information

### Bayesian Approach

**Markov Chain Monte Carlo (MCMC)**:
- Estimates posterior distributions of treatment effects
- Allows incorporation of prior information
- Flexible modeling of heterogeneity and inconsistency

**Software**:
- WinBUGS / OpenBUGS
- JAGS (Just Another Gibbs Sampler)
- R: `gemtc` package

**Advantages**:
- Flexible modeling
- Probabilistic statements (e.g., "95% probability Drug A is best")
- Can incorporate prior information

**Disadvantages**:
- Computationally intensive
- Requires understanding of Bayesian statistics
- Choice of priors can influence results

## Conducting Network Meta-Analysis

### Step 1: Define Network

**Identify Interventions**:
- List all interventions of interest
- Define nodes (e.g., individual drugs or drug classes)
- Specify reference treatment (usually placebo or standard care)

**Identify Comparisons**:
- Extract all pairwise comparisons from studies
- Multi-arm trials contribute multiple comparisons

**Create Network Plot**:
- Visualize connections
- Check for disconnected networks
- Identify closed loops (for consistency checking)

### Step 2: Assess Transitivity

**Compare Study Characteristics**:
```
Characteristic | A vs B | B vs C | A vs C
---------------|--------|--------|--------
Mean age       | 45     | 47     | 46
% Female       | 60%    | 58%    | 62%
Severity       | Moderate| Moderate| Moderate
Duration (wks) | 12     | 12     | 12
```

**Statistical Tests**:
- Not recommended (low power)
- Rely on clinical judgment

**Actions**:
- If similar: Proceed with NMA
- If different: Consider subgroup NMA or meta-regression
- If very different: Do not pool (pairwise MA only)

### Step 3: Fit Network Meta-Analysis Model

**Frequentist (R netmeta)**:
```r
library(netmeta)

# Prepare data (one row per comparison)
data <- data.frame(
  study = c("Study1", "Study1", "Study2", ...),
  treat1 = c("A", "B", "A", ...),
  treat2 = c("B", "C", "Placebo", ...),
  TE = c(-0.5, -0.3, -0.4, ...),  # Effect size
  seTE = c(0.15, 0.12, 0.18, ...)  # Standard error
)

# Run NMA
nma <- netmeta(
  TE = TE,
  seTE = seTE,
  treat1 = treat1,
  treat2 = treat2,
  studlab = study,
  data = data,
  sm = "SMD",
  reference.group = "Placebo",
  random = TRUE
)

# View results
summary(nma)
```

**Bayesian (R gemtc)**:
```r
library(gemtc)

# Prepare data
network <- mtc.network(data.ab = data)

# Fit model
model <- mtc.model(network, type = "consistency")
results <- mtc.run(model, n.adapt = 5000, n.iter = 20000)

# View results
summary(results)
```

### Step 4: Check Consistency

**Node-Splitting (netmeta)**:
```r
# Split each comparison into direct vs indirect
ns <- netsplit(nma)
print(ns)

# Visualize
forest(ns)
```

**Interpretation**:
- p > 0.10: Consistent (direct ≈ indirect)
- p < 0.10: Inconsistent (investigate)

**Loop Inconsistency**:
```r
# Check closed loops
decomp.design(nma)
```

### Step 5: Assess Heterogeneity

**Measures**:
- **τ² (tau-squared)**: Between-study variance
- **I²**: Percentage of variability due to heterogeneity

**Interpretation** (same as standard meta-analysis):
- I² = 0-40%: Might not be important
- I² = 30-60%: Moderate heterogeneity
- I² = 50-90%: Substantial heterogeneity
- I² = 75-100%: Considerable heterogeneity

**Actions**:
- Investigate with meta-regression or subgroup analysis
- Report heterogeneity clearly
- Consider prediction intervals

### Step 6: Rank Treatments

**Ranking Methods**:

**1. P-scores (Frequentist)**:
- Probability that treatment is better than average
- Range: 0 (worst) to 1 (best)
- Easy to interpret

```r
netrank(nma, small.values = "good")
```

**2. SUCRA (Surface Under Cumulative Ranking)**:
- Area under cumulative ranking curve
- Range: 0% (worst) to 100% (best)
- Similar to P-scores

**3. Posterior Probabilities (Bayesian)**:
- Probability each treatment is 1st, 2nd, 3rd, etc.
- Rankogram: Visual representation

```r
ranks <- rank.probability(results)
plot(ranks)
```

**Interpretation**:
- Rankings are probabilistic, not definitive
- Consider effect sizes and certainty of evidence
- High rank ≠ clinically important difference

### Step 7: Create League Table

**League Table**: Matrix showing all pairwise comparisons

**Example**:
```
           Drug A    Drug B    Drug C    Placebo
Drug A       -      0.15      0.30      0.50
                  (-0.05,0.35)(0.10,0.50)(0.30,0.70)
Drug B              -         0.15      0.35
                             (-0.05,0.35)(0.15,0.55)
Drug C                        -         0.20
                                       (0.00,0.40)
Placebo                                 -
```

**Interpretation**:
- Upper triangle: Effect sizes (95% CI)
- Positive values: Row treatment better than column treatment
- Bold: Statistically significant

### Step 8: Assess Certainty (GRADE for NMA)

**Domains**:
1. **Study Limitations**: Risk of bias in included studies
2. **Inconsistency**: Direct vs indirect disagreement
3. **Indirectness**: Differences from review question
4. **Imprecision**: Wide confidence intervals
5. **Publication Bias**: Selective reporting
6. **Intransitivity**: Violation of similarity assumption

**Rating**:
- Start at **High** (for RCTs)
- Downgrade for each domain (-1 or -2)
- Final rating: High, Moderate, Low, Very Low

**Special Considerations for NMA**:
- **Indirect comparisons**: Start at Moderate (inherent uncertainty)
- **Inconsistency**: Downgrade if p < 0.10 in node-splitting
- **Intransitivity**: Downgrade if important differences across comparisons

## Reporting Network Meta-Analysis

### PRISMA-NMA Extension

**Additional Items** (beyond standard PRISMA):

**Methods**:
- Describe network geometry
- Specify reference treatment
- Describe assessment of transitivity
- Specify statistical model (frequentist/Bayesian)
- Describe consistency assessment methods

**Results**:
- Present network plot
- Report all pairwise comparisons (league table)
- Present treatment rankings (with uncertainty)
- Report consistency assessment results
- Present GRADE certainty ratings

**Discussion**:
- Discuss transitivity assumption
- Interpret rankings cautiously
- Acknowledge limitations of indirect comparisons

### Essential Figures and Tables

**1. Network Plot**:
- Shows all interventions and connections
- Node size ∝ sample size
- Edge thickness ∝ number of studies

**2. Forest Plot** (for each comparison):
- Direct, indirect, and network estimates
- Confidence intervals

**3. League Table**:
- All pairwise comparisons
- Effect sizes and 95% CIs

**4. Rankogram** (Bayesian):
- Probability each treatment is 1st, 2nd, 3rd, etc.

**5. SUCRA/P-score Plot**:
- Bar chart of treatment rankings

**6. Inconsistency Plot**:
- Node-splitting results
- Direct vs indirect estimates

**7. GRADE Evidence Profile**:
- Certainty ratings for key comparisons

## Common Pitfalls

### Methodological Errors
❌ **Ignoring transitivity**: Pooling incomparable studies
❌ **Not checking consistency**: Missing important disagreements
❌ **Over-interpreting rankings**: Treating probabilistic ranks as definitive
❌ **Ignoring heterogeneity**: Assuming all studies are similar
❌ **Disconnected networks**: Trying to compare unconnected interventions

### Reporting Errors
❌ **No network plot**: Readers can't see connections
❌ **Only reporting rankings**: Ignoring effect sizes and certainty
❌ **Not reporting inconsistency**: Hiding important findings
❌ **Claiming superiority**: Based on rankings alone (ignore CIs)
❌ **No GRADE assessment**: Not rating certainty of evidence

### Interpretation Errors
❌ **Rank 1 = Best**: Rankings are probabilistic, not definitive
❌ **Ignoring clinical importance**: Small differences may not matter
❌ **Assuming transitivity**: Without checking
❌ **Trusting indirect evidence**: As much as direct evidence
❌ **Ignoring uncertainty**: Wide CIs mean low precision

## Software and Resources

### R Packages

**netmeta** (Frequentist):
```r
install.packages("netmeta")
library(netmeta)

# Comprehensive NMA package
# Easy to use
# Good documentation
```

**gemtc** (Bayesian):
```r
install.packages("gemtc")
library(gemtc)

# Bayesian NMA
# Requires JAGS
# Flexible modeling
```

**bnma** (Bayesian):
```r
install.packages("bnma")
library(bnma)

# Bayesian NMA with Stan
# Fast computation
# Modern Bayesian framework
```

### Stata

```stata
* Install network package
net install network, from(https://www.mtm.uoi.gr)

* Run NMA
network meta y se, studyvar(study) trtvar(treatment)
```

### WinBUGS / OpenBUGS

- Download: http://www.mrc-bsu.cam.ac.uk/software/bugs/
- Requires BUGS code (examples in Cochrane Handbook)
- Steep learning curve

### Online Tools

**CINeMA** (Confidence in Network Meta-Analysis):
- Web-based tool for GRADE assessment
- URL: https://cinema.ispm.unibe.ch/

## Example: Antidepressants for Depression

### Research Question
"Which antidepressant is most effective for major depressive disorder in adults?"

### Network
- **Interventions**: 21 antidepressants + placebo
- **Studies**: 522 RCTs
- **Participants**: 116,477

### Network Plot
```
      SSRI cluster
     /    |    \
    /     |     \
  SNRI - TCA - Placebo
    \     |     /
     \    |    /
      Other ADs
```

### Results (Example)
**League Table** (SMD vs Placebo):
- Amitriptyline: -0.50 (95% CI -0.65 to -0.35)
- Escitalopram: -0.45 (95% CI -0.58 to -0.32)
- Sertraline: -0.40 (95% CI -0.52 to -0.28)
- Fluoxetine: -0.35 (95% CI -0.48 to -0.22)

**Rankings** (SUCRA):
1. Amitriptyline (85%)
2. Escitalopram (78%)
3. Sertraline (65%)
4. Fluoxetine (52%)

**Consistency**: No significant inconsistency detected (all p > 0.10)

**GRADE Certainty**: Moderate (downgraded for heterogeneity)

### Interpretation
- All antidepressants more effective than placebo
- Amitriptyline and escitalopram ranked highest
- Differences between top-ranked drugs small (may not be clinically important)
- Moderate certainty due to heterogeneity
- Consider tolerability and side effects (not shown here)

## Quality Checklist

### Before NMA
- [ ] ≥3 interventions to compare
- [ ] Network is connected (all interventions linked)
- [ ] Transitivity plausible (similar studies)
- [ ] Sufficient studies for each comparison (≥2 preferred)
- [ ] Outcome measures comparable

### During NMA
- [ ] Network plot created
- [ ] Transitivity assessed (compare study characteristics)
- [ ] Consistency checked (node-splitting, loop inconsistency)
- [ ] Heterogeneity assessed (I², τ²)
- [ ] Sensitivity analyses conducted
- [ ] GRADE certainty assessed

### Reporting NMA
- [ ] PRISMA-NMA checklist completed
- [ ] Network plot included
- [ ] League table presented
- [ ] Rankings reported (with uncertainty)
- [ ] Consistency results reported
- [ ] GRADE evidence profile included
- [ ] Limitations discussed (transitivity, inconsistency)

## Version Control
- **Version**: 1.0
- **Last Updated**: 2025-12-03
- **Maintained By**: MedResearch AI System
- **Review Cycle**: Annual updates to align with PRISMA-NMA and Cochrane guidance
- **Key References**: 
  - PRISMA-NMA: Hutton et al. 2015
  - Cochrane Handbook Chapter 11
  - GRADE for NMA: Puhan et al. 2014
