# Quality Gates - Process Guide

## Overview
Quality gates are checkpoints that ensure medical-grade accuracy, methodological rigor, and anti-hallucination compliance throughout the systematic review process. Every stage must pass its quality gate before proceeding.

## Anti-Hallucination Framework

### Core Principles

**1. Citation-First Approach**
Every factual claim must be supported by a verifiable citation **before** the claim is made.

✅ **Correct Process**:
1. Identify source (PMID, DOI, or other identifier)
2. Verify source content
3. Extract relevant information
4. Make claim with citation

❌ **Incorrect Process**:
1. Make claim
2. Search for supporting citation afterward
3. Risk of confirmation bias and hallucination

**Example**:

✅ **Correct**:
> "Cognitive behavioral therapy reduces depression symptoms with a standardized mean difference of -0.42 (95% CI -0.58 to -0.26) compared to control conditions [Source: PMID:12345678, Cuijpers et al., 2013]."

❌ **Incorrect**:
> "CBT is effective for depression." (no citation, no effect size, vague claim)

### Confidence Thresholds

Every statement must have an associated confidence score based on evidence quality:

| Confidence | Evidence Quality | Use Case |
|------------|------------------|----------|
| **0.95-1.0** | Multiple high-quality RCTs, consistent results, low RoB | Strong clinical recommendations |
| **0.8-0.94** | Some RCTs, minor inconsistency, moderate certainty | Standard clinical recommendations |
| **0.6-0.79** | Observational studies, significant heterogeneity, low certainty | Weak recommendations, research needed |
| **0.4-0.59** | Single studies, high RoB, very low certainty | Hypothesis-generating only |
| **<0.4** | Expert opinion, no empirical evidence | Not suitable for systematic review |

**Medical-Grade Threshold**: ≥0.8 confidence required for clinical recommendations

**Implementation**:
```
Every claim tagged with confidence:
"CBT reduces depression (SMD -0.42, 95% CI -0.58 to -0.26) [Source: PMID:12345678] [Confidence: 0.85]"
```

### Verification Requirements

**Level 1: Citation Exists**
- Every claim has [Source: PMID/DOI/identifier]
- No unsupported statements

**Level 2: Citation is Valid**
- PMID/DOI resolves to actual publication
- Publication is accessible (at least abstract)
- Publication is relevant to claim

**Level 3: Citation Supports Claim**
- Claim accurately reflects source content
- No misrepresentation or overinterpretation
- Effect sizes, CIs, p-values match source

**Level 4: Citation is High Quality**
- Source has low risk of bias
- Source is peer-reviewed (or reputable grey literature)
- Source is recent (unless historical context)

**Verification Process**:
1. Bibliography Agent checks all citations (Levels 1-2)
2. Critique Agent audits claim-citation alignment (Level 3)
3. Critique Agent assesses source quality (Level 4)

### Hallucination Detection

**Red Flags** (Critique Agent must flag):

🚩 **Unsupported Claims**
- Statement without citation
- Vague citation ("studies show...")
- Self-referential citation (citing the review itself)

🚩 **Misrepresented Evidence**
- Effect size doesn't match source
- Confidence interval incorrect
- Statistical significance misstated
- Selective reporting (cherry-picking)

🚩 **Overinterpretation**
- Claiming causation from correlation
- Generalizing beyond study population
- Ignoring study limitations
- Exaggerating effect sizes

🚩 **Fabricated Details**
- Specific numbers not in source
- Quotes not in source
- Study characteristics invented
- Outcomes not measured in source

🚩 **Outdated or Retracted**
- Citing retracted papers
- Ignoring more recent evidence
- Using superseded guidelines

**Action on Detection**:
1. **STOP** immediately
2. **FLAG** the issue (severity: critical)
3. **REPORT** to user with evidence
4. **PROPOSE** correction with proper citation
5. **REQUEST** approval before fixing
6. **VERIFY** fix resolves issue

### Citation Format Standards

**Primary Research**:
```
[Source: PMID:12345678]
[Source: DOI:10.1001/jama.2020.12345]
```

**Systematic Reviews**:
```
[Source: Cochrane:CD012345]
[Source: PMID:87654321, Systematic Review]
```

**Guidelines**:
```
[Source: NICE NG222]
[Source: APA Clinical Practice Guideline, 2020]
```

**Trial Registries**:
```
[Source: ClinicalTrials.gov NCT01234567]
[Source: WHO ICTRP ISRCTN12345678]
```

**Grey Literature**:
```
[Source: Conference Abstract, APA 2024, Smith et al.]
[Source: Dissertation, ProQuest ID 12345678]
```

**Multiple Sources** (for meta-analysis results):
```
[Source: Meta-analysis of k=15 studies, see Appendix A for full list]
```

---

## Stage-Specific Quality Gates

### Stage 1: Question Refinement

**Quality Gate Criteria**:

✅ **Specificity**
- Question is answerable (not too broad)
- PICO/SPIDER elements clearly defined
- No ambiguous terms

✅ **Feasibility**
- Scoping search yields 10-500 studies (feasible range)
- If <10: Question too narrow, consider broadening
- If >500: Question too broad, consider narrowing
- Data likely to be available

✅ **Relevance**
- Question addresses important clinical/research gap
- Outcomes are meaningful (patient-important)
- Population is well-defined

✅ **User Approval**
- User confirms question is what they want
- User approves PICO/SPIDER framework
- User agrees question is feasible

**Verification**:
- Question Agent presents PICO/SPIDER
- Scoping search results shown (n studies)
- User explicitly approves before proceeding

**Failure Actions**:
- If too broad: Refine PICO elements (narrow population, specific intervention)
- If too narrow: Broaden inclusion criteria
- If not feasible: Discuss alternative questions
- If user disapproves: Iterate refinement (max 3 iterations)

---

### Stage 2: Protocol Development

**Quality Gate Criteria**:

✅ **Completeness**
- All PROSPERO required fields completed
- Eligibility criteria clear and justified
- Search strategy comprehensive (≥2 databases)
- Data extraction plan detailed
- Analysis plan pre-specified

✅ **Rigor**
- Search strategy includes MeSH + keywords
- Search validated (retrieves known studies)
- Dual screening/extraction planned
- Risk of bias assessment planned
- GRADE assessment planned

✅ **Transparency**
- All decisions documented with rationale
- Deviations from standard methods justified
- Conflicts of interest declared
- Funding sources identified

✅ **User Approval**
- User reviews complete protocol
- User approves search strategy
- User approves analysis plan
- User commits to timeline

**Verification**:
- Protocol Agent generates PROSPERO-ready document
- Search strategy validated (test retrieval)
- User explicitly approves protocol

**Failure Actions**:
- If incomplete: Identify missing elements, complete them
- If search inadequate: Add databases, refine strategy
- If analysis plan vague: Specify effect measures, models, subgroups
- If user disapproves: Revise protocol, re-submit for approval

---

### Stage 3: Literature Search

**Quality Gate Criteria**:

✅ **Comprehensiveness**
- ≥2 databases searched (required)
- Grey literature searched (trial registries, conferences)
- Reference lists checked (of key studies)
- Search updated if >6 months old

✅ **Documentation**
- Search date recorded
- Search strategy saved (reproducible)
- Number of results per database documented
- Deduplication process documented

✅ **Quality**
- Search strategy executed as planned (no deviations)
- All databases accessible and searched successfully
- Results exported correctly (no data loss)
- PRISMA flow diagram started (identification stage)

**Verification**:
- Search Sub-Agent provides search log
- Citation count matches expected range (from scoping search)
- Deduplication completed (duplicates removed)
- PRISMA flow updated

**Failure Actions**:
- If database inaccessible: Use alternative (document substitution)
- If results unexpectedly low: Check search syntax, re-run
- If results unexpectedly high: Verify search strategy, consider refining
- If export fails: Retry, use alternative format

---

### Stage 4: Study Selection

**Quality Gate Criteria**:

✅ **Rigor**
- Dual independent screening (title/abstract)
- Dual independent full-text review
- Conflicts resolved (consensus or third reviewer)
- Exclusions documented with reasons

✅ **Transparency**
- PRISMA flow diagram complete (all stages)
- Exclusion reasons categorized (e.g., wrong population, wrong intervention)
- Inter-rater agreement reported (kappa statistic)
- Borderline cases discussed and documented

✅ **Completeness**
- All citations screened (none missed)
- All full texts reviewed (or documented as unavailable)
- Final inclusion set finalized
- Characteristics table started

**Verification**:
- Screening Sub-Agent provides inclusion/exclusion log
- PRISMA flow numbers add up correctly
- User reviews borderline cases
- Final inclusion set approved

**Failure Actions**:
- If low agreement: Re-train screeners, clarify criteria
- If many borderline cases: Refine eligibility criteria (document as protocol deviation)
- If full texts unavailable: Contact authors, search repositories, document as limitation
- If inclusion set unexpected: Review decisions, verify criteria applied correctly

---

### Stage 5: Data Extraction

**Quality Gate Criteria**:

✅ **Accuracy**
- Dual independent extraction
- Discrepancies resolved
- Data verified (cross-checked with source)
- Calculations checked (effect sizes, SEs)

✅ **Completeness**
- All pre-specified data items extracted
- Missing data documented (with reason)
- Authors contacted for missing data (if feasible)
- Responses documented

✅ **Quality**
- Extraction form piloted (3-5 studies)
- Extractors trained (if human-assisted)
- Data entered correctly (no typos, unit errors)
- Outliers investigated (verify not errors)

**Verification**:
- Extraction Sub-Agent provides extraction database
- Critique Agent spot-checks 10% of extractions
- Outliers flagged and verified
- User reviews characteristics table

**Failure Actions**:
- If discrepancies high: Re-train extractors, clarify form
- If missing data extensive: Contact authors, plan sensitivity analysis
- If errors found: Re-extract affected studies, verify corrections
- If outliers unexplained: Verify source, consider excluding (sensitivity analysis)

---

### Stage 6: Risk of Bias Assessment

**Quality Gate Criteria**:

✅ **Appropriate Tool**
- Correct tool for study design (RoB 2 for RCTs, ROBINS-I for observational, etc.)
- All domains assessed
- Judgments supported by evidence (quotes, page numbers)

✅ **Rigor**
- Dual independent assessment
- Disagreements resolved
- Overall risk of bias determined
- Summary table/graph created

✅ **Transparency**
- Judgments justified (not just "low/high" but why)
- Supporting evidence provided
- Unclear judgments explained
- Limitations acknowledged

**Verification**:
- Extraction Sub-Agent provides RoB assessments
- Critique Agent checks for unsupported judgments
- Summary table/graph reviewed
- User reviews high RoB studies

**Failure Actions**:
- If judgments unsupported: Provide evidence, re-assess if needed
- If disagreements unresolved: Third reviewer, consensus discussion
- If wrong tool used: Re-assess with correct tool
- If high RoB prevalent: Plan sensitivity analysis (exclude high RoB)

---

### Stage 7: Data Analysis & Synthesis

**Quality Gate Criteria**:

✅ **Appropriate Methods**
- Correct effect measure (RR, OR, SMD, etc.)
- Appropriate model (fixed vs random-effects)
- Heterogeneity assessed (I², τ², Q)
- Pre-specified analyses conducted

✅ **Statistical Rigor**
- Calculations verified (no errors)
- Forest plots accurate (match data)
- Confidence intervals correct
- P-values reported accurately

✅ **Transparency**
- Heterogeneity investigated (if I² >50%)
- Subgroup analyses pre-specified (or labeled exploratory)
- Sensitivity analyses conducted
- Publication bias assessed (if k≥10)

✅ **GRADE Assessment**
- Certainty rated for each outcome
- Ratings justified (risk of bias, inconsistency, etc.)
- Evidence profile created
- Summary of findings table created

**Verification**:
- Statistician Agent provides analysis report
- Critique Agent verifies calculations (spot-check)
- Forest plots checked against data
- GRADE ratings reviewed

**Failure Actions**:
- If calculation errors: Correct, re-run analysis
- If heterogeneity unexplained: Conduct meta-regression, subgroup analysis
- If GRADE ratings unjustified: Provide rationale, adjust if needed
- If publication bias suspected: Conduct trim-and-fill, discuss limitation

---

### Stage 8: Manuscript Writing

**Quality Gate Criteria**:

✅ **PRISMA Compliance**
- All 27 PRISMA items addressed
- PRISMA checklist completed (with page numbers)
- PRISMA flow diagram included
- Deviations from protocol documented

✅ **Citation-First Approach**
- Every claim has citation [Source: PMID/DOI]
- Citations verified (valid, accessible)
- Citations support claims (no misrepresentation)
- Confidence scores ≥0.8 (medical-grade)

✅ **Completeness**
- All sections complete (Title, Abstract, Intro, Methods, Results, Discussion)
- All tables/figures included
- All appendices included (search strategies, excluded studies, etc.)
- Bibliography complete

✅ **Quality**
- Clear and concise writing
- Logical flow
- No jargon (or defined)
- Grammar and spelling correct

**Verification**:
- Writer Agent provides complete manuscript
- Bibliography Agent verifies all citations
- Critique Agent checks PRISMA compliance
- Critique Agent audits citation-first approach

**Failure Actions**:
- If PRISMA items missing: Add missing items, update checklist
- If citations missing: Add citations, verify sources
- If citations invalid: Replace with valid sources or remove claim
- If writing unclear: Revise for clarity, simplify language

---

### Stage 9: Quality Assurance

**Quality Gate Criteria**:

✅ **No Critical Issues**
- No unsupported claims (all have citations)
- No invalid citations (all PMID/DOI resolve)
- No misrepresented evidence (claims match sources)
- No calculation errors (statistics verified)

✅ **PRISMA Compliance ≥95%**
- At least 26/27 PRISMA items addressed
- Any missing items justified (e.g., not applicable)
- PRISMA checklist complete

✅ **Anti-Hallucination Audit Passed**
- All claims have confidence ≥0.8 (or flagged as low-confidence)
- Citation-source alignment verified (spot-check 20%)
- No fabricated details detected
- No retracted papers cited

✅ **Methodological Soundness**
- Search strategy adequate
- Selection process rigorous
- Data extraction accurate
- Analysis appropriate
- GRADE assessment justified

**Verification**:
- Critique Agent provides QA report
- Issues categorized by severity (critical, major, minor)
- User reviews QA report
- Approval to proceed to revision

**Failure Actions**:
- If critical issues: STOP, fix immediately, re-check
- If major issues: Fix, re-check affected sections
- If minor issues: Fix or justify why not fixed
- If PRISMA <95%: Add missing items, update checklist

---

### Stage 10: Revision & Finalization

**Quality Gate Criteria**:

✅ **All Issues Addressed**
- Critical issues fixed (100%)
- Major issues fixed (≥90%)
- Minor issues considered (≥50% fixed or justified)

✅ **Final Review Passed**
- Critique Agent re-checks revised sections
- No new issues introduced
- All fixes verified

✅ **Formatting Complete**
- Journal-specific formatting applied
- Reference style correct
- Tables/figures formatted
- Supplementary materials complete

✅ **User Approval**
- User reviews final manuscript
- User approves for submission
- User confirms all requirements met

**Verification**:
- Writer Agent provides revised manuscript
- Critique Agent re-reviews
- User explicitly approves final version

**Failure Actions**:
- If issues remain: Continue revision, re-check
- If new issues introduced: Fix, re-check
- If formatting incorrect: Correct, verify against journal guidelines
- If user disapproves: Identify concerns, revise, re-submit

---

## Confidence Score Calculation

### Formula

```
Confidence = (Study Quality × Consistency × Directness × Precision × Publication Bias Adjustment)
```

**Components**:

1. **Study Quality** (0.6-1.0)
   - High quality (low RoB): 1.0
   - Moderate quality (some concerns): 0.85
   - Low quality (high RoB): 0.7
   - Very low quality (critical RoB): 0.6

2. **Consistency** (0.7-1.0)
   - I² = 0-40%: 1.0
   - I² = 41-60%: 0.9
   - I² = 61-75%: 0.8
   - I² = 76-100%: 0.7

3. **Directness** (0.8-1.0)
   - Direct evidence (exact PICO): 1.0
   - Mostly direct (minor differences): 0.95
   - Indirect (significant differences): 0.8

4. **Precision** (0.7-1.0)
   - Narrow CI, large sample: 1.0
   - Moderate CI, adequate sample: 0.9
   - Wide CI, small sample: 0.8
   - Very wide CI, very small sample: 0.7

5. **Publication Bias Adjustment** (0.8-1.0)
   - No evidence of bias: 1.0
   - Possible bias (Egger p=0.05-0.10): 0.95
   - Likely bias (Egger p<0.05): 0.9
   - Strong bias (asymmetric funnel, trim-and-fill changes result): 0.8

### Example Calculation

**Scenario**: Meta-analysis of CBT for depression
- Study Quality: 10 RCTs, mostly low RoB → 0.95
- Consistency: I² = 45% → 0.9
- Directness: Exact PICO match → 1.0
- Precision: SMD -0.42, 95% CI -0.58 to -0.26 (narrow) → 1.0
- Publication Bias: Egger p=0.32 (no bias) → 1.0

**Confidence** = 0.95 × 0.9 × 1.0 × 1.0 × 1.0 = **0.855**

**Interpretation**: High confidence (≥0.8), suitable for clinical recommendations

### Confidence Reporting

**In Manuscript**:
> "We have high confidence (0.86) that CBT reduces depression symptoms (SMD -0.42, 95% CI -0.58 to -0.26) based on 10 high-quality RCTs with consistent results and no evidence of publication bias [Source: Meta-analysis, see Appendix A]."

**In GRADE Table**:
| Outcome | Effect (95% CI) | Studies (n) | Certainty | Confidence |
|---------|----------------|-------------|-----------|------------|
| Depression symptoms | SMD -0.42 (-0.58 to -0.26) | 10 RCTs (2,847) | Moderate | 0.86 |

---

## Quality Assurance Checklist

### Pre-Analysis Checklist

- [ ] Research question is specific and answerable
- [ ] PICO/SPIDER framework complete
- [ ] Protocol registered (PROSPERO or equivalent)
- [ ] Search strategy comprehensive (≥2 databases)
- [ ] Search strategy validated (retrieves known studies)
- [ ] Eligibility criteria clear and justified
- [ ] Data extraction form piloted
- [ ] Risk of bias tool selected
- [ ] Analysis plan pre-specified

### Post-Analysis Checklist

- [ ] All planned databases searched
- [ ] Grey literature searched
- [ ] Deduplication completed
- [ ] Dual screening completed
- [ ] Dual extraction completed
- [ ] Risk of bias assessed for all studies
- [ ] Heterogeneity assessed and investigated
- [ ] Pre-specified analyses conducted
- [ ] GRADE assessment completed
- [ ] Publication bias assessed (if k≥10)

### Manuscript Checklist

- [ ] All 27 PRISMA items addressed
- [ ] PRISMA checklist completed
- [ ] PRISMA flow diagram included
- [ ] Every claim has citation
- [ ] All citations verified (valid PMID/DOI)
- [ ] All citations support claims
- [ ] Confidence scores ≥0.8 (or flagged)
- [ ] All tables/figures included
- [ ] All appendices included
- [ ] Bibliography complete and formatted

### Anti-Hallucination Checklist

- [ ] No unsupported claims
- [ ] No invalid citations
- [ ] No misrepresented evidence
- [ ] No fabricated details
- [ ] No retracted papers cited
- [ ] No overinterpretation
- [ ] No selective reporting
- [ ] Confidence scores calculated and reported

---

## Failure Response Protocol

### When Quality Gate Fails

**Step 1: STOP**
- Immediately halt workflow
- Do not proceed to next stage
- Do not attempt auto-fix

**Step 2: REPORT**
- Generate issue report
- Categorize severity (critical, major, minor)
- Provide evidence of issue
- Explain why it's a problem

**Step 3: PROPOSE FIX**
- Suggest specific correction
- Provide rationale for fix
- Estimate time/effort required
- Identify any risks

**Step 4: REQUEST APPROVAL**
- Present issue and proposed fix to user
- Wait for explicit approval
- Do not proceed without approval

**Step 5: FIX**
- Implement approved fix
- Document what was changed
- Verify fix resolves issue

**Step 6: RE-CHECK**
- Re-run quality gate
- Verify issue resolved
- Check for new issues introduced
- Proceed only if passed

### Example Failure Response

**Issue Detected**: Unsupported claim in Results section

**STOP**: Manuscript writing halted

**REPORT**:
> "Critical Issue Detected: Unsupported Claim
> 
> Location: Results section, paragraph 3
> 
> Claim: 'CBT is more effective than medication for depression.'
> 
> Problem: No citation provided, claim not supported by our meta-analysis
> 
> Evidence: Our meta-analysis compared CBT to control, not to medication. This claim is outside our scope and unsupported."

**PROPOSE FIX**:
> "Proposed Fix: Remove unsupported claim or replace with supported claim
> 
> Option 1: Remove sentence entirely
> Option 2: Replace with: 'CBT significantly reduces depression symptoms compared to control conditions (SMD -0.42, 95% CI -0.58 to -0.26) [Source: Meta-analysis, see Appendix A] [Confidence: 0.86]'
> 
> Recommendation: Option 2 (replace with supported claim)"

**REQUEST APPROVAL**:
> "Please approve proposed fix before I proceed."

**FIX** (after approval):
> "Fix implemented: Replaced unsupported claim with supported claim including citation and confidence score."

**RE-CHECK**:
> "Re-checked Results section: No unsupported claims detected. Quality gate passed."

---

## Version Control
- **Version**: 1.0
- **Last Updated**: 2025-12-03
- **Maintained By**: MedResearch AI System
- **Review Cycle**: Quarterly updates to align with quality standards
