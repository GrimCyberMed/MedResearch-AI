# Medical Databases - Domain Knowledge

## Overview
Medical databases are essential for comprehensive systematic reviews. This guide covers free databases, search strategies, MeSH terms, and best practices for literature searching.

## Primary Free Databases

### 1. PubMed / MEDLINE

**Coverage**: 36+ million citations, biomedical literature from 1946-present
**Provider**: U.S. National Library of Medicine (NLM)
**Access**: https://pubmed.ncbi.nlm.nih.gov (free)
**Update Frequency**: Daily

**Strengths**:
- Comprehensive biomedical coverage
- MeSH (Medical Subject Headings) indexing
- Advanced search features (filters, field tags)
- Links to full text when available
- PubMed Central (PMC) integration for open access

**Search Features**:
- **Field tags**: [tiab], [MeSH], [au], [pt], [dp]
- **Filters**: Article type, species, language, date
- **Boolean operators**: AND, OR, NOT
- **Proximity operators**: "phrase searching"
- **Truncation**: * (e.g., depress* finds depression, depressive, depressed)

**Example Search**:
```
("depressive disorder"[MeSH] OR depression[tiab] OR depressive[tiab])
AND
("cognitive behavioral therapy"[MeSH] OR CBT[tiab] OR "cognitive therapy"[tiab])
AND
(randomized controlled trial[pt] OR randomized[tiab] OR RCT[tiab])
AND
2015:2025[dp]
```

**Filters for Study Types**:
- RCTs: `randomized controlled trial[pt]`
- Systematic reviews: `systematic review[pt]`
- Meta-analyses: `meta-analysis[pt]`
- Clinical trials: `clinical trial[pt]`
- Humans only: `humans[MeSH]`

### 2. Europe PMC (PubMed Central Europe)

**Coverage**: 42+ million citations, includes PubMed + additional European sources
**Provider**: European Bioinformatics Institute (EMBL-EBI)
**Access**: https://europepmc.org (free)
**Update Frequency**: Daily

**Strengths**:
- Broader coverage than PubMed (includes preprints, patents)
- Full-text search capability
- Links to clinical guidelines
- Grant information
- Similar search syntax to PubMed

**Unique Features**:
- Preprints from bioRxiv, medRxiv
- Full-text mining
- SciLite annotations (highlights key concepts)
- Links to EMA (European Medicines Agency) documents

**Example Search**:
```
(TITLE:"cognitive behavioral therapy" OR ABSTRACT:CBT)
AND
(TITLE:depression OR ABSTRACT:depression)
AND
PUB_TYPE:"randomized controlled trial"
AND
FIRST_PDATE:[2015 TO 2025]
```

### 3. Cochrane Library

**Coverage**: Cochrane Database of Systematic Reviews (CDSR) + CENTRAL (trials register)
**Provider**: Cochrane Collaboration
**Access**: https://www.cochranelibrary.com (free abstracts, some countries have full access)
**Update Frequency**: Monthly

**Components**:
1. **CDSR**: High-quality systematic reviews (gold standard)
2. **CENTRAL**: Controlled trials register (700,000+ trials)
3. **Cochrane Clinical Answers**: Evidence summaries
4. **Cochrane Methodology Register**: Methods studies

**Strengths**:
- Highest quality systematic reviews
- Comprehensive trial register
- Standardized methodology
- Regular updates

**When to Use**:
- Check if review already exists (avoid duplication)
- Identify relevant trials for your review
- Learn from high-quality review methods
- Use as citation source for established evidence

### 4. OpenAlex

**Coverage**: 250+ million scholarly works across all disciplines
**Provider**: OurResearch (nonprofit)
**Access**: https://openalex.org (free, open API)
**Update Frequency**: Weekly

**Strengths**:
- Massive coverage (broader than PubMed)
- Open data (downloadable, API access)
- Citation network analysis
- Author disambiguation
- Institution tracking

**Unique Features**:
- Concept tagging (AI-generated topics)
- Open Access status tracking
- Citation counts
- Author H-index
- Institutional affiliations

**API Example**:
```
https://api.openalex.org/works?filter=title.search:depression,concepts.id:C71924100&per-page=200
```

**Use Cases**:
- Broad multidisciplinary searches
- Citation network analysis
- Identifying open access versions
- Tracking research trends

### 5. Lens.org

**Coverage**: 270+ million scholarly works + 130+ million patents
**Provider**: Cambia (nonprofit)
**Access**: https://www.lens.org (free with registration)
**Update Frequency**: Weekly

**Strengths**:
- Combines scholarly literature + patents
- Advanced filtering (open access, funding, institutions)
- Citation analysis
- Export to reference managers
- API access (free tier)

**Unique Features**:
- Patent-to-paper links
- Funding organization tracking
- Clinical trial links
- Sequence data links (genomics)

**Search Example**:
```
(title:(cognitive behavioral therapy) OR abstract:(CBT))
AND
(title:(depression) OR abstract:(depression))
AND
publication_type:"journal article"
AND
year:[2015 TO 2025]
```

## Secondary Free Databases

### 6. Google Scholar

**Coverage**: Broad scholarly literature, all disciplines
**Access**: https://scholar.google.com (free)

**Strengths**:
- Very broad coverage
- Finds grey literature (theses, conference papers)
- Citation tracking ("Cited by")
- Alerts for new citations

**Limitations**:
- No advanced search syntax
- Cannot export large result sets
- Inconsistent indexing
- No quality filters

**Best Practices**:
- Use for supplementary searching
- Find grey literature
- Track citations of key papers
- Verify coverage of known studies

### 7. CORE (COnnecting REpositories)

**Coverage**: 200+ million open access papers from repositories
**Access**: https://core.ac.uk (free)

**Strengths**:
- Aggregates institutional repositories
- Full-text access
- Preprints and working papers

**Use Cases**:
- Find open access versions
- Access grey literature
- Identify preprints

### 8. Semantic Scholar

**Coverage**: 200+ million papers, AI-powered
**Provider**: Allen Institute for AI
**Access**: https://www.semanticscholar.org (free)

**Unique Features**:
- AI-generated summaries (TL;DR)
- Influential citations (not just count)
- Paper recommendations
- Citation context (why paper was cited)

**Use Cases**:
- Quick paper summaries
- Find highly influential papers
- Discover related work

## Trial Registries (Essential for Grey Literature)

### 9. ClinicalTrials.gov

**Coverage**: 450,000+ clinical trials worldwide
**Provider**: U.S. National Library of Medicine
**Access**: https://clinicaltrials.gov (free)

**Search Features**:
- Condition, intervention, sponsor
- Study status (recruiting, completed, terminated)
- Results available (yes/no)
- Study phase (I, II, III, IV)

**Why Search**:
- Find unpublished trials (publication bias)
- Access trial results (even if not published)
- Identify ongoing trials
- Contact investigators for data

**Example Search**:
```
Condition: Depression
Intervention: Cognitive Behavioral Therapy
Study Type: Interventional
Status: Completed
Results Available: Yes
```

### 10. WHO ICTRP (International Clinical Trials Registry Platform)

**Coverage**: Aggregates 20+ trial registries worldwide
**Access**: https://trialsearch.who.int (free)

**Strengths**:
- International coverage (beyond ClinicalTrials.gov)
- Includes registries from China, India, Europe, etc.
- Standardized search interface

## Grey Literature Sources

### 11. ProQuest Dissertations & Theses

**Coverage**: 5+ million dissertations and theses
**Access**: https://www.proquest.com/pqdtglobal (free preview, full text may require subscription)

**Free Alternative**: Search university repositories directly

### 12. OpenGrey

**Coverage**: Grey literature from Europe
**Access**: http://www.opengrey.eu (free)
**Status**: No longer updated (last update 2020), but archive still searchable

### 13. Conference Proceedings

**Sources**:
- Specialty society websites (APA, AMA, etc.)
- Conference organizer sites
- Google Scholar (search "conference proceedings")

**Why Important**:
- Unpublished studies
- Preliminary results
- Negative findings more likely

## MeSH (Medical Subject Headings)

### What is MeSH?

MeSH is NLM's controlled vocabulary for indexing biomedical literature. Each article is tagged with relevant MeSH terms, enabling precise searching.

**Structure**:
- Hierarchical tree (broad → specific)
- Main headings + subheadings
- Entry terms (synonyms)

**Example Hierarchy**:
```
Mental Disorders [C]
  └─ Mood Disorders [C.F03.600]
      └─ Depressive Disorder [C.F03.600.300]
          └─ Depressive Disorder, Major [C.F03.600.300.300]
```

### Using MeSH Browser

**Access**: https://meshb.nlm.nih.gov

**Steps**:
1. Search for concept (e.g., "depression")
2. Review MeSH tree
3. Select appropriate term
4. Check subheadings (e.g., /therapy, /diagnosis)
5. Include entry terms (synonyms)

### MeSH Subheadings

Common subheadings for systematic reviews:

- **/therapy**: Treatment, intervention
- **/diagnosis**: Diagnostic methods
- **/epidemiology**: Incidence, prevalence
- **/etiology**: Causes, risk factors
- **/prevention & control**: Prevention strategies
- **/drug therapy**: Pharmacological treatment
- **/psychology**: Psychological aspects

**Example**:
```
"Depressive Disorder"[MeSH] AND "Cognitive Behavioral Therapy"[MeSH:NoExp]
```
- `[MeSH]` includes all narrower terms (explosion)
- `[MeSH:NoExp]` searches only that specific term (no explosion)

### Building MeSH-Based Search

**Step 1**: Identify key concepts
- Population: Adults with depression
- Intervention: Cognitive behavioral therapy
- Outcome: Depression symptoms

**Step 2**: Find MeSH terms
- Depression → "Depressive Disorder"[MeSH]
- CBT → "Cognitive Behavioral Therapy"[MeSH]
- Adults → "Adult"[MeSH]

**Step 3**: Add entry terms (keywords)
```
("Depressive Disorder"[MeSH] OR depression[tiab] OR "major depressive disorder"[tiab])
AND
("Cognitive Behavioral Therapy"[MeSH] OR CBT[tiab] OR "cognitive therapy"[tiab])
```

**Step 4**: Add study design filter
```
AND (randomized controlled trial[pt] OR randomized[tiab])
```

## Search Strategy Development

### PICO Framework

**P**opulation: Who?
**I**ntervention: What treatment?
**C**omparison: Compared to what?
**O**utcome: What outcome?

**Example**:
- **P**: Adults with major depressive disorder
- **I**: Cognitive behavioral therapy
- **C**: Usual care or waitlist
- **O**: Depression symptom reduction

### Building Comprehensive Search

**Step 1: Concept Blocks**

Create separate blocks for each PICO element:

**Block 1 (Population)**:
```
("Depressive Disorder"[MeSH] OR depression[tiab] OR "major depressive disorder"[tiab] OR MDD[tiab] OR "depressive symptoms"[tiab])
```

**Block 2 (Intervention)**:
```
("Cognitive Behavioral Therapy"[MeSH] OR CBT[tiab] OR "cognitive therapy"[tiab] OR "behavior therapy"[tiab] OR "cognitive behavioral"[tiab])
```

**Block 3 (Study Design)**:
```
(randomized controlled trial[pt] OR controlled clinical trial[pt] OR randomized[tiab] OR placebo[tiab] OR "clinical trials as topic"[MeSH] OR randomly[tiab] OR trial[ti])
NOT (animals[MeSH] NOT humans[MeSH])
```

**Step 2: Combine with AND**
```
Block 1 AND Block 2 AND Block 3
```

**Step 3: Add Filters**
- Date range: 2015-2025
- Language: English (if justified)
- Humans only

### Sensitivity vs Precision

**Sensitive Search** (broad, few false negatives):
- Use OR extensively
- Include many synonyms
- Use truncation (depress*)
- Avoid restrictive filters
- **Use for**: Systematic reviews (must find all studies)

**Precise Search** (narrow, few false positives):
- Use AND extensively
- Limit to MeSH terms
- Add restrictive filters
- **Use for**: Clinical questions (need best evidence quickly)

**Systematic reviews require SENSITIVE searches**

### Search Validation

**Test if search retrieves known relevant studies**:

1. Identify 3-5 key studies (from scoping search or prior reviews)
2. Run search strategy
3. Check if all key studies are retrieved
4. If missing, revise search (add synonyms, broaden terms)
5. Document validation in protocol

**Example**:
> "Search strategy was validated by confirming retrieval of 5 key RCTs identified in a prior systematic review (Smith 2020, Jones 2019, etc.)."

## Database-Specific Search Syntax

### PubMed

| Feature | Syntax | Example |
|---------|--------|---------|
| MeSH term | [MeSH] | "Depressive Disorder"[MeSH] |
| Title/Abstract | [tiab] | depression[tiab] |
| Title only | [ti] | depression[ti] |
| Author | [au] | Smith J[au] |
| Publication type | [pt] | randomized controlled trial[pt] |
| Date | [dp] | 2020:2025[dp] |
| Truncation | * | depress* |
| Phrase | "quotes" | "cognitive behavioral therapy" |
| Boolean | AND, OR, NOT | depression AND therapy |

### Europe PMC

| Feature | Syntax | Example |
|---------|--------|---------|
| Title | TITLE: | TITLE:"depression" |
| Abstract | ABSTRACT: | ABSTRACT:CBT |
| Author | AUTH: | AUTH:"Smith J" |
| Publication type | PUB_TYPE: | PUB_TYPE:"randomized controlled trial" |
| Date | FIRST_PDATE: | FIRST_PDATE:[2020 TO 2025] |
| Boolean | AND, OR, NOT | depression AND therapy |

### Cochrane CENTRAL

| Feature | Syntax | Example |
|---------|--------|---------|
| MeSH | [mh] | depression[mh] |
| Title/Abstract | [tiab] | CBT[tiab] |
| All text | [all] | therapy[all] |
| Boolean | AND, OR, NOT | depression AND CBT |

### OpenAlex API

| Feature | Syntax | Example |
|---------|--------|---------|
| Title search | title.search: | title.search:depression |
| Concept | concepts.id: | concepts.id:C71924100 |
| Year | publication_year: | publication_year:2020 |
| Open access | is_oa: | is_oa:true |
| Boolean | , (AND) \| (OR) | title.search:depression,concepts.id:C71924100 |

## Search Documentation

### What to Document

**For Protocol/Methods Section**:

1. **Databases searched**: Names, platforms, dates
   - Example: "PubMed (via NLM), Europe PMC, Cochrane CENTRAL (searched 2025-12-03)"

2. **Date ranges**: Inception to search date
   - Example: "Inception to December 3, 2025"

3. **Language restrictions**: If any (justify)
   - Example: "English only (due to lack of translation resources)"

4. **Full search strategy**: For at least one database
   - Include all search terms, Boolean operators, filters
   - Use line-by-line format

5. **Search validation**: How strategy was tested
   - Example: "Strategy validated by retrieving 5 key studies from prior review"

6. **Grey literature sources**: Trial registries, conference proceedings
   - Example: "ClinicalTrials.gov, WHO ICTRP, conference abstracts from APA 2020-2025"

### Example Documentation

**Appendix: Search Strategy for PubMed (searched 2025-12-03)**

```
#1 "Depressive Disorder"[MeSH]
#2 depression[tiab]
#3 "major depressive disorder"[tiab]
#4 MDD[tiab]
#5 "depressive symptoms"[tiab]
#6 #1 OR #2 OR #3 OR #4 OR #5

#7 "Cognitive Behavioral Therapy"[MeSH]
#8 CBT[tiab]
#9 "cognitive therapy"[tiab]
#10 "behavior therapy"[tiab]
#11 "cognitive behavioral"[tiab]
#12 #7 OR #8 OR #9 OR #10 OR #11

#13 randomized controlled trial[pt]
#14 controlled clinical trial[pt]
#15 randomized[tiab]
#16 placebo[tiab]
#17 randomly[tiab]
#18 trial[ti]
#19 #13 OR #14 OR #15 OR #16 OR #17 OR #18
#20 animals[MeSH] NOT humans[MeSH]
#21 #19 NOT #20

#22 #6 AND #12 AND #21
#23 #22 AND 2015:2025[dp]

Results: 1,247 citations
```

## Deduplication

### Why It Matters
Searching multiple databases creates duplicates. Must remove before screening.

### Methods

**1. Reference Manager Tools**:
- Zotero: Duplicate Items feature
- Mendeley: Check for Duplicates
- EndNote: Find Duplicates

**2. Specialized Tools**:
- **Rayyan**: Automatic deduplication during import
- **Covidence**: Built-in deduplication
- **ASReview**: Deduplication feature

**3. Manual Checks**:
- Same title + authors + year = duplicate
- Check for different versions (preprint vs published)
- Keep most complete version

### Best Practices
✅ Deduplicate before screening (saves time)
✅ Document number removed (for PRISMA flow diagram)
✅ Keep record of duplicates (in case needed later)
✅ Check for near-duplicates (same study, different reports)

## Search Update

### When to Update
- Before final analysis (if >6 months since original search)
- Before submission (if >12 months since original search)
- If review process is delayed

### How to Update
1. Re-run original search strategy
2. Apply same date filter (from last search date to present)
3. Screen new citations
4. Integrate new studies into review
5. Document update in methods

**Example**:
> "Original search conducted 2024-06-15. Updated search conducted 2025-12-03, yielding 47 additional citations. After screening, 2 new studies met inclusion criteria and were added to the review."

## Common Pitfalls

### Search Strategy Errors
❌ Single database (always search ≥2)
❌ No MeSH terms (misses indexed articles)
❌ No keywords (misses recent unindexed articles)
❌ Overly restrictive (misses relevant studies)
❌ No validation (may miss key studies)

### Documentation Errors
❌ Not recording search date
❌ Not saving full search strategy
❌ Not documenting number of results
❌ Not reporting deduplication

### Grey Literature Errors
❌ Not searching trial registries
❌ Ignoring conference abstracts
❌ Not contacting authors for unpublished data

## Quick Reference: Database Selection

| Review Type | Essential Databases | Supplementary |
|-------------|-------------------|---------------|
| **Medical/Clinical** | PubMed, Cochrane CENTRAL, ClinicalTrials.gov | Europe PMC, Lens.org |
| **Multidisciplinary** | PubMed, OpenAlex, Lens.org | Google Scholar, CORE |
| **Diagnostic** | PubMed, Cochrane CENTRAL | Europe PMC |
| **Qualitative** | PubMed, OpenAlex, CORE | Google Scholar |
| **Public Health** | PubMed, Europe PMC, OpenAlex | WHO databases |

## Version Control
- **Version**: 1.0
- **Last Updated**: 2025-12-03
- **Maintained By**: MedResearch AI System
- **Review Cycle**: Quarterly updates for new databases and search features
