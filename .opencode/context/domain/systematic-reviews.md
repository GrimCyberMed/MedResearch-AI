# Systematic Reviews - Domain Knowledge

## Overview
A systematic review is a rigorous, transparent, and reproducible method for identifying, evaluating, and synthesizing all available research evidence on a specific question. It follows a predefined protocol to minimize bias and ensure comprehensive coverage.

## PRISMA 2020 Guidelines

### The 27-Item Checklist

**Title (1)**
- Identify the report as a systematic review

**Abstract (2)**
- Structured summary: background, objectives, methods, results, conclusions, registration

**Introduction**
- Rationale (3): Describe the rationale in context of existing knowledge
- Objectives (4): Provide explicit statement of questions (PICO/SPIDER)

**Methods**
- Eligibility criteria (5): Specify inclusion/exclusion with rationale
- Information sources (6): Databases, registers, websites, dates searched
- Search strategy (7): Full search strategy for at least one database
- Selection process (8): How studies were selected (screening stages, reviewers)
- Data collection (9): Methods for extracting data, verification process
- Data items (10a): All variables collected, assumptions made
- Study risk of bias (10b): Tools used to assess bias
- Effect measures (11): Specify for each outcome (RR, OR, MD, SMD)
- Synthesis methods (12): Methods for combining results, heterogeneity assessment
- Reporting bias (13): Methods to assess publication bias (funnel plots, Egger's test)
- Certainty assessment (14): Methods for assessing certainty (GRADE)

**Results**
- Study selection (15): Results with reasons for exclusions (PRISMA flow diagram)
- Study characteristics (16): Cite each study, present characteristics
- Risk of bias (17): Present assessments for each study
- Results of syntheses (18): For each synthesis, present summary statistics, forest plots
- Reporting biases (19): Present assessments of publication bias
- Certainty of evidence (20): Present certainty ratings (GRADE)

**Discussion**
- Discussion (21a): Interpret results in context of other evidence
- Limitations (21b): Discuss limitations at study and review level
- Implications (22): Implications for practice, policy, future research

**Other Information**
- Registration (23): Registration number and name of registry
- Protocol (24): Where protocol can be accessed
- Support (25): Sources of financial/non-financial support
- Competing interests (26): Declare conflicts of interest
- Availability of data (27): State which data are publicly available

## Types of Systematic Reviews

### 1. Intervention Reviews
- **Purpose**: Assess effectiveness of interventions (treatments, programs, policies)
- **Framework**: PICO (Population, Intervention, Comparison, Outcome)
- **Analysis**: Often includes meta-analysis with pooled effect sizes
- **Example**: "Effectiveness of cognitive behavioral therapy for depression in adults"

### 2. Diagnostic Test Accuracy Reviews
- **Purpose**: Evaluate accuracy of diagnostic tests
- **Framework**: PICO adapted (Index test, Reference standard, Target condition)
- **Analysis**: Sensitivity, specificity, likelihood ratios, ROC curves
- **Tools**: QUADAS-2 for risk of bias assessment

### 3. Prognostic Reviews
- **Purpose**: Identify factors associated with future outcomes
- **Framework**: PICOTS (adds Time and Setting)
- **Analysis**: Hazard ratios, survival curves
- **Tools**: QUIPS for risk of bias assessment

### 4. Qualitative Evidence Synthesis
- **Purpose**: Synthesize qualitative research findings
- **Framework**: SPIDER (Sample, Phenomenon of Interest, Design, Evaluation, Research type)
- **Analysis**: Thematic synthesis, meta-ethnography, framework synthesis
- **Tools**: CASP for quality assessment

### 5. Mixed Methods Reviews
- **Purpose**: Integrate quantitative and qualitative evidence
- **Framework**: Combined PICO + SPIDER
- **Analysis**: Convergent, sequential, or embedded synthesis

## Key Methodological Concepts

### Search Strategy Development
1. **Concept Identification**: Break question into key concepts
2. **Synonym Generation**: List all possible terms (MeSH, keywords, variants)
3. **Boolean Logic**: Combine with AND/OR/NOT
4. **Field Tags**: Use [tiab], [MeSH], [All Fields] appropriately
5. **Filters**: Language, date, publication type, species
6. **Validation**: Should retrieve known relevant studies

**Example Search Structure**:
```
(depression OR depressive disorder OR major depressive disorder[MeSH])
AND
(cognitive behavioral therapy OR CBT OR cognitive therapy[MeSH])
AND
(randomized controlled trial[pt] OR randomized[tiab] OR placebo[tiab])
```

### Study Selection Process
1. **Deduplication**: Remove duplicate records across databases
2. **Title/Abstract Screening**: Two independent reviewers, conflicts resolved
3. **Full-Text Review**: Assess against eligibility criteria
4. **Exclusion Documentation**: Record reasons for exclusion
5. **PRISMA Flow Diagram**: Visual representation of selection process

### Data Extraction
**Essential Elements**:
- Study identifiers (authors, year, DOI/PMID)
- Study design (RCT, cohort, case-control, etc.)
- Population characteristics (n, age, sex, condition severity)
- Intervention/exposure details (dose, duration, delivery)
- Comparison/control details
- Outcomes (measures, timepoints, results)
- Risk of bias domains
- Funding sources

**Best Practices**:
- Use standardized extraction forms
- Pilot test on 3-5 studies
- Two independent extractors
- Contact authors for missing data
- Extract from most complete source (often supplementary materials)

### Risk of Bias Assessment

**For RCTs - Cochrane RoB 2 Tool**:
1. Randomization process
2. Deviations from intended interventions
3. Missing outcome data
4. Measurement of the outcome
5. Selection of the reported result

**Judgments**: Low risk / Some concerns / High risk

**For Observational Studies - ROBINS-I**:
1. Confounding
2. Selection of participants
3. Classification of interventions
4. Deviations from intended interventions
5. Missing data
6. Measurement of outcomes
7. Selection of reported results

### Certainty of Evidence - GRADE

**Four Levels**:
- **High**: Very confident in effect estimate
- **Moderate**: Moderately confident; true effect likely close to estimate
- **Low**: Limited confidence; true effect may differ substantially
- **Very Low**: Very little confidence; true effect likely substantially different

**Factors Decreasing Certainty**:
- Risk of bias (-1 or -2)
- Inconsistency/heterogeneity (-1 or -2)
- Indirectness (-1 or -2)
- Imprecision (-1 or -2)
- Publication bias (-1)

**Factors Increasing Certainty** (observational studies only):
- Large effect (+1 or +2)
- Dose-response gradient (+1)
- All plausible confounding would reduce effect (+1)

## Common Pitfalls to Avoid

### Search-Related
❌ **Single database search**: Always search ≥2 databases
❌ **No grey literature**: Include conference abstracts, dissertations, trial registries
❌ **Overly restrictive**: Avoid unnecessary language/date restrictions
❌ **No search validation**: Test if known studies are retrieved

### Selection-Related
❌ **Single reviewer**: Always use ≥2 independent reviewers
❌ **No conflict resolution**: Define process for disagreements
❌ **Post-hoc criteria changes**: Stick to protocol or document deviations

### Analysis-Related
❌ **Inappropriate pooling**: Don't meta-analyze if I² >75% without investigation
❌ **Ignoring heterogeneity**: Always assess and explain heterogeneity
❌ **Cherry-picking outcomes**: Report all pre-specified outcomes
❌ **No sensitivity analysis**: Test robustness of findings

### Reporting-Related
❌ **Incomplete PRISMA**: Must complete all 27 items
❌ **No protocol registration**: Register on PROSPERO before starting
❌ **Selective reporting**: Report all outcomes, even non-significant
❌ **No data availability**: Share extraction data when possible

## Registration and Protocol

### PROSPERO Registration
- **When**: Before starting data extraction (ideally before screening)
- **Required Elements**:
  - Review question (PICO/SPIDER)
  - Searches (databases, dates, restrictions)
  - Eligibility criteria
  - Data extraction plan
  - Risk of bias assessment method
  - Synthesis method
  - Dissemination plans

### Protocol Deviations
- **Document all changes**: Date, rationale, impact
- **Report in manuscript**: Transparent reporting of deviations
- **Avoid post-hoc changes**: Especially to eligibility criteria or outcomes

## Quality Indicators

### High-Quality Systematic Review Characteristics
✅ Registered protocol (PROSPERO)
✅ Comprehensive search (≥3 databases + grey literature)
✅ Duplicate screening and extraction
✅ Risk of bias assessment with validated tool
✅ GRADE certainty assessment
✅ Complete PRISMA reporting
✅ Sensitivity analyses performed
✅ Publication bias assessed (if ≥10 studies)
✅ Conflicts of interest declared
✅ Data sharing statement

### Red Flags
🚩 No protocol or registration
🚩 Single database searched
🚩 Single reviewer for screening/extraction
🚩 No risk of bias assessment
🚩 Pooling highly heterogeneous studies without explanation
🚩 Selective outcome reporting
🚩 Industry funding without independent analysis

## Timeline Expectations

**Typical Systematic Review Timeline**:
- Protocol development: 2-4 weeks
- Search execution: 1-2 weeks
- Deduplication: 1-3 days
- Title/Abstract screening: 2-6 weeks (depends on n)
- Full-text review: 2-4 weeks
- Data extraction: 4-8 weeks
- Risk of bias assessment: 2-4 weeks
- Analysis: 2-4 weeks
- Manuscript writing: 4-8 weeks
- **Total**: 4-8 months (average 6 months)

**Factors Affecting Timeline**:
- Number of included studies (10 vs 100+)
- Complexity of interventions/outcomes
- Availability of full texts
- Need to contact authors
- Team size and availability

## Resources and Tools

### Essential Databases
- **PubMed/MEDLINE**: Biomedical literature (free)
- **Embase**: Broader coverage, especially European journals (subscription)
- **Cochrane CENTRAL**: Controlled trials (free)
- **Web of Science**: Citation tracking (subscription)
- **Scopus**: Multidisciplinary (subscription)
- **PsycINFO**: Psychology literature (subscription)

### Free Alternatives
- **Europe PMC**: Similar to PubMed with full-text access
- **Google Scholar**: Broad coverage but less precise
- **OpenAlex**: Open bibliographic database
- **Lens.org**: Patent and scholarly literature

### Grey Literature Sources
- **ClinicalTrials.gov**: Trial registry
- **WHO ICTRP**: International trial registry
- **ProQuest Dissertations**: Theses and dissertations
- **OpenGrey**: Grey literature in Europe
- **Conference proceedings**: Specialty society websites

### Reference Management
- **Zotero**: Free, open-source
- **Mendeley**: Free, cloud-based
- **EndNote**: Comprehensive (subscription)
- **Covidence**: Systematic review-specific (subscription)

### Screening and Extraction Tools
- **Rayyan**: Free web-based screening
- **Covidence**: End-to-end review management (subscription)
- **DistillerSR**: Advanced features (subscription)
- **EPPI-Reviewer**: Comprehensive (subscription)

### Statistical Analysis
- **RevMan**: Cochrane's free meta-analysis software
- **R (meta package)**: Flexible, powerful, free
- **Stata**: Comprehensive (subscription)
- **Comprehensive Meta-Analysis**: User-friendly (subscription)

## Citation Requirements

### Every Statement Must Be Traceable
✅ **Correct**: "CBT reduces depression symptoms (SMD -0.42, 95% CI -0.58 to -0.26) [Source: PMID:12345678]"

❌ **Incorrect**: "CBT is effective for depression" (no citation, no effect size)

### Citation Format
- **Primary studies**: [Source: PMID:12345678] or [Source: DOI:10.1234/example]
- **Systematic reviews**: [Source: Cochrane:CD012345] or [Source: PMID:87654321]
- **Guidelines**: [Source: NICE NG222] or [Source: APA 2020]
- **Grey literature**: [Source: ClinicalTrials.gov NCT01234567]

### Confidence Thresholds
- **High confidence (0.9+)**: Multiple high-quality RCTs, consistent results
- **Moderate confidence (0.8-0.89)**: Some RCTs, minor inconsistency
- **Low confidence (0.6-0.79)**: Observational studies, significant heterogeneity
- **Very low confidence (<0.6)**: Single studies, high risk of bias

**Medical-grade threshold**: ≥0.8 confidence required for clinical recommendations

## Version Control
- **Version**: 1.0
- **Last Updated**: 2025-12-03
- **Maintained By**: MedResearch AI System
- **Review Cycle**: Quarterly updates to align with PRISMA, Cochrane, GRADE updates
