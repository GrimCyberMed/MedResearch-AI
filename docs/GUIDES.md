# User Guides

Complete user documentation for MedResearch AI.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Database Search Guide](#database-search-guide)
3. [Plagiarism Detection Guide](#plagiarism-detection-guide)
4. [Meta-Analysis Guide](#meta-analysis-guide)
5. [Citation Management](#citation-management)
6. [Document Generation](#document-generation)
7. [VSCode Integration](#vscode-integration)
8. [Status Dashboard](#status-dashboard)

---

## Quick Start

### Installation

```bash
# Navigate to project
cd C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI

# Install dependencies
npm install

# Build project
npm run build
```

### First Search

```bash
# Start OpenCode with Master Agent
opencode --agent .opencode/agent/medresearch/master-agent.md

# Or use the command
/start-research
```

### Basic Workflow

1. **Define Research Question**
   - Use Question Agent to refine your question
   - Example: "What is the effect of exercise on diabetes management?"

2. **Create Search Strategy**
   - Use Planner Agent to create PICO/SPIDER protocol
   - Define inclusion/exclusion criteria

3. **Search Databases**
   - Use Research Agent to search multiple databases
   - PubMed, Europe PMC, Semantic Scholar, etc.

4. **Screen Results**
   - Title/abstract screening
   - Full-text screening
   - Data extraction

5. **Analyze Data**
   - Meta-analysis with R
   - Generate forest plots
   - Calculate effect sizes

6. **Write Manuscript**
   - Use Writer Agent
   - PRISMA 2020 compliant
   - Export to DOCX/PDF

---

## Database Search Guide

### PubMed Search

**Basic Search:**
```
Query: "diabetes AND exercise"
Max Results: 100
Sort: relevance
```

**Advanced Search with Filters:**
```
Query: "diabetes[MeSH] AND exercise[tiab]"
Filters:
  - Date Range: 2020-2025
  - Article Types: Clinical Trial, Meta-Analysis
  - Languages: English
```

**MeSH Terms:**
- `[MeSH]` - Medical Subject Heading
- `[tiab]` - Title/Abstract
- `[au]` - Author
- `[ta]` - Journal

**Boolean Operators:**
- `AND` - Both terms must appear
- `OR` - Either term can appear
- `NOT` - Exclude term

**Example Queries:**
```
# Diabetes and exercise
"diabetes mellitus"[MeSH] AND "exercise"[MeSH]

# COVID-19 vaccines
"COVID-19 Vaccines"[MeSH] AND "efficacy"[tiab]

# Hypertension treatment
"hypertension"[MeSH] AND ("treatment"[tiab] OR "therapy"[tiab])
```

### Europe PMC Search

**Basic Search:**
```
Query: "diabetes AND exercise"
Max Results: 100
Include Preprints: true
```

**Preprint Filtering:**
```
# Exclude preprints
Query: "diabetes AND exercise NOT (SRC:PPR)"

# Only preprints
Query: "diabetes AND exercise AND (SRC:PPR)"
```

### Semantic Scholar

**AI-Powered Search:**
```
Query: "machine learning in medical diagnosis"
Max Results: 50
Fields of Study: Medicine, Computer Science
```

**Features:**
- Semantic search (understands context)
- Citation network analysis
- Influential citations
- Open access detection

### The Lens

**Patent & Scholarly Search:**
```
Query: "CRISPR gene editing"
Max Results: 100
```

**Features:**
- 250M+ scholarly works
- Patent database
- Citation analysis
- Free and open

### ClinicalTrials.gov

**Trial Search:**
```
Condition: "Diabetes Mellitus"
Intervention: "Exercise"
Status: Recruiting, Completed
```

**Search Fields:**
- Condition/Disease
- Intervention/Treatment
- Study Status
- Location
- Age Group

### CrossRef

**DOI Metadata:**
```
Query: "diabetes exercise"
Max Results: 100
```

**Features:**
- 150M+ DOI records
- Citation metadata
- Publisher information
- Free API

### Unpaywall

**Open Access Finder:**
```
DOI: "10.1001/jama.2020.1234"
```

**Features:**
- Finds legal OA versions
- 30M+ articles
- Publisher and repository versions
- Free API

---

## Plagiarism Detection Guide

### Basic Plagiarism Check

```javascript
{
  text: "Your manuscript text here...",
  title: "Your Paper Title",
  author: "Your Name",
  databases: ["pubmed", "europepmc", "semanticscholar"]
}
```

### Configuration Options

```javascript
{
  config: {
    shingleSize: 5,              // 5-word sequences
    minSimilarityThreshold: 0.15, // 15% similarity
    maxResults: 10,               // Top 10 matches
    checkCitations: true,         // Verify citations
    checkSelfPlagiarism: true     // Check your own work
  }
}
```

### Understanding Results

**Similarity Score:**
- 0-15%: Low (acceptable)
- 15-30%: Medium (review needed)
- 30-50%: High (significant overlap)
- 50%+: Very High (likely plagiarism)

**Match Types:**
- **Exact**: Word-for-word copying
- **Paraphrase**: Reworded but same meaning
- **Citation**: Properly cited material
- **Self**: Your own previous work

**Confidence Levels:**
- **High**: Strong evidence (>50% similarity)
- **Medium**: Moderate evidence (30-50%)
- **Low**: Weak evidence (15-30%)

### Best Practices

1. **Check Early**: Run before submission
2. **Review Matches**: Investigate all high-confidence matches
3. **Proper Citation**: Cite all sources
4. **Paraphrase**: Don't copy verbatim
5. **Self-Citation**: Cite your own work

### Cross-Database Check

Searches across all 7 databases:
- PubMed (36M+ citations)
- Europe PMC (42M+ publications)
- Semantic Scholar (200M+ papers)
- The Lens (250M+ works)
- CrossRef (150M+ DOIs)

---

## Meta-Analysis Guide

### Running Meta-Analysis

**Input Data:**
```javascript
{
  studies: [
    {
      study_id: "Study1",
      effect_size: 0.5,
      standard_error: 0.1,
      sample_size: 100
    },
    // ... more studies
  ],
  model: "random",  // or "fixed"
  measure: "SMD"    // Standardized Mean Difference
}
```

**Effect Size Measures:**
- **SMD**: Standardized Mean Difference
- **OR**: Odds Ratio
- **RR**: Risk Ratio
- **MD**: Mean Difference

**Models:**
- **Fixed**: Assumes one true effect size
- **Random**: Allows variation between studies

### Generating Forest Plots

```javascript
{
  meta_analysis_results: { /* results from meta-analysis */ },
  title: "Effect of Exercise on Diabetes",
  output_file: "forest-plot.png"
}
```

**Customization:**
- Title and labels
- Confidence intervals
- Study weights
- Summary diamond

### Interpreting Results

**Pooled Effect Size:**
- Magnitude of overall effect
- Confidence interval
- P-value

**Heterogeneity:**
- **I²**: Percentage of variation due to heterogeneity
  - 0-25%: Low
  - 25-50%: Moderate
  - 50-75%: Substantial
  - 75-100%: Considerable
- **τ²**: Between-study variance
- **Q statistic**: Test for heterogeneity

**Publication Bias:**
- Funnel plot
- Egger's test
- Trim and fill

---

## Citation Management

### Verifying Citations

```javascript
{
  citations: [
    "Smith J, et al. JAMA. 2020;323(1):1-10.",
    "Jones A, et al. Lancet. 2021;397(10270):99-111."
  ]
}
```

**Verification Process:**
1. Parse citation
2. Search databases (PubMed, CrossRef)
3. Match metadata
4. Verify accuracy
5. Flag discrepancies

### Exporting Bibliography

```javascript
{
  citations: [ /* citation list */ ],
  format: "apa",  // or "vancouver", "harvard", "chicago"
  output_file: "references.txt"
}
```

**Supported Formats:**
- **APA**: American Psychological Association
- **Vancouver**: ICMJE style
- **Harvard**: Author-date
- **Chicago**: Notes and bibliography

### Citation Styles

**APA Example:**
```
Smith, J., Jones, A., & Brown, B. (2020). Title of article. 
Journal Name, 323(1), 1-10. https://doi.org/10.1001/jama.2020.1234
```

**Vancouver Example:**
```
1. Smith J, Jones A, Brown B. Title of article. Journal Name. 
   2020;323(1):1-10.
```

---

## Document Generation

### Generating DOCX

```javascript
{
  title: "Systematic Review Title",
  authors: ["Author 1", "Author 2"],
  abstract: "Abstract text...",
  sections: [
    {
      heading: "Introduction",
      content: "Introduction text..."
    },
    {
      heading: "Methods",
      content: "Methods text..."
    }
  ],
  references: [ /* citation list */ ],
  output_file: "manuscript.docx"
}
```

**PRISMA 2020 Template:**
- Title page
- Abstract (structured)
- Introduction
- Methods
- Results
- Discussion
- References
- Tables and figures

### Converting to PDF

```javascript
{
  docx_file: "manuscript.docx",
  output_file: "manuscript.pdf"
}
```

**Requirements:**
- LibreOffice or Microsoft Word installed
- Proper fonts and formatting

---

## VSCode Integration

### Setup

1. **Install OpenCode Extension**
   - Open VSCode
   - Install "OpenCode" extension
   - Restart VSCode

2. **Configure MCP Server**
   ```json
   {
     "opencode.mcp.servers": {
       "medresearch-ai": {
         "command": "node",
         "args": ["dist/mcp/index.js"],
         "cwd": "${workspaceFolder}"
       }
     }
   }
   ```

3. **Start Agent**
   - Press `Ctrl+Shift+P`
   - Type "OpenCode: Start Agent"
   - Select "Master Agent"

### Keyboard Shortcuts

- `Ctrl+Shift+P`: Command palette
- `Ctrl+K Ctrl+O`: Open agent
- `Ctrl+K Ctrl+R`: Resume research
- `Ctrl+K Ctrl+S`: Save checkpoint

### Commands

```
/start-research     - Start new systematic review
/resume-research    - Resume from checkpoint
/search-databases   - Search medical databases
/check-plagiarism   - Run plagiarism detection
/run-meta-analysis  - Execute meta-analysis
/generate-document  - Create manuscript
```

---

## Status Dashboard

### Running Dashboard

```bash
npm run dashboard

# Watch mode (auto-refresh)
npm run dashboard:watch
```

### Dashboard Features

**System Status:**
- Memory usage
- Cache statistics
- Log file sizes
- Database connectivity

**Research Progress:**
- Current phase
- Completed tasks
- Pending tasks
- Time tracking

**Quality Metrics:**
- Citation accuracy
- Plagiarism scores
- Confidence levels
- Anti-hallucination checks

**Performance Metrics:**
- Cache hit rate
- API response times
- Retry success rate
- Error rates

### Interpreting Dashboard

**Green Indicators:**
- System healthy
- All checks passing
- Performance optimal

**Yellow Indicators:**
- Minor issues
- Performance degraded
- Review recommended

**Red Indicators:**
- Critical issues
- System errors
- Immediate action needed

---

## Tips & Best Practices

### Search Strategy

1. **Start Broad**: Use general terms first
2. **Refine Gradually**: Add filters and MeSH terms
3. **Multiple Databases**: Search 3+ databases
4. **Document Everything**: Save search strings
5. **Use Boolean**: Combine terms effectively

### Screening

1. **Two Reviewers**: Independent screening
2. **Pilot Test**: Test criteria on 10 papers
3. **Resolve Conflicts**: Discuss disagreements
4. **Document Reasons**: Record exclusion reasons
5. **PRISMA Flow**: Create flow diagram

### Data Extraction

1. **Standardized Form**: Use consistent template
2. **Pilot Test**: Test on 5 papers
3. **Double Extract**: Two reviewers extract
4. **Quality Assessment**: Risk of bias tool
5. **Contact Authors**: For missing data

### Meta-Analysis

1. **Check Heterogeneity**: I² statistic
2. **Sensitivity Analysis**: Remove outliers
3. **Subgroup Analysis**: Explore differences
4. **Publication Bias**: Funnel plot
5. **GRADE**: Assess evidence quality

### Writing

1. **PRISMA 2020**: Follow checklist
2. **Clear Language**: Avoid jargon
3. **Transparent**: Report all steps
4. **Limitations**: Acknowledge weaknesses
5. **Implications**: Clinical relevance

---

## Troubleshooting

### Common Issues

**Problem:** No search results

- Check query syntax
- Verify database connectivity
- Check API keys in `.env`
- Try simpler query

**Problem:** Slow searches

- Check internet connection
- Verify cache is working
- Reduce max_results
- Use specific terms

**Problem:** Plagiarism false positives

- Review matched segments
- Check citation format
- Adjust similarity threshold
- Verify source accuracy

**Problem:** Meta-analysis errors

- Check data format
- Verify effect sizes
- Check for missing values
- Review R installation

---

## Getting Help

### Documentation

- `README.md` - Project overview
- `docs/CHANGELOG.md` - Version history
- `docs/DEVELOPMENT.md` - Developer guide
- `docs/TESTING.md` - Testing guide
- `docs/GUIDES.md` - This file

### Support Channels

1. Check documentation
2. Search existing issues
3. Ask in team chat
4. Create new issue

### Reporting Issues

Include:
- What you were trying to do
- What happened
- What you expected
- Error messages
- Steps to reproduce

---

## Resources

### Medical Databases
- [PubMed](https://pubmed.ncbi.nlm.nih.gov/)
- [Europe PMC](https://europepmc.org/)
- [Semantic Scholar](https://www.semanticscholar.org/)
- [The Lens](https://www.lens.org/)
- [ClinicalTrials.gov](https://clinicaltrials.gov/)

### Guidelines
- [PRISMA 2020](http://www.prisma-statement.org/)
- [Cochrane Handbook](https://training.cochrane.org/handbook)
- [GRADE](https://www.gradeworkinggroup.org/)

### Tools
- [RevMan](https://training.cochrane.org/online-learning/core-software/revman) - Cochrane review manager
- [Covidence](https://www.covidence.org/) - Screening tool
- [Rayyan](https://www.rayyan.ai/) - Screening tool

---

*Last Updated: December 4, 2025*
