# 📚 Medical Database Integrations

**MedResearch AI v4.0.0**  
**Updated**: December 3, 2025

---

## 🎯 OVERVIEW

MedResearch AI now integrates with **5 major medical databases**, providing access to over **500 million scholarly works**, including:
- Peer-reviewed journal articles
- Preprints (bioRxiv, medRxiv)
- Clinical trials
- Patents (optional)
- Open access papers

---

## 📊 AVAILABLE DATABASES

### **1. PubMed/MEDLINE** ✅
- **Coverage**: 36+ million citations
- **Focus**: Biomedical and life sciences literature
- **API**: NCBI E-utilities (free)
- **API Key**: Optional (recommended)
- **Rate Limit**: 
  - Without key: 3 requests/second
  - With key: 10 requests/second
- **Status**: ✅ Fully implemented

**Features**:
- Advanced search with MeSH terms
- Field tags ([tiab], [MeSH], [au], etc.)
- Date range filters
- Article type filters (RCT, Meta-Analysis, etc.)
- Language filters
- Returns: PMID, DOI, title, authors, journal, year, abstract

**Example Usage**:
```typescript
// Search for diabetes AND exercise studies
{
  "query": "diabetes[MeSH] AND exercise[tiab]",
  "max_results": 100,
  "sort": "date",
  "filters": {
    "date_from": "2020-01-01",
    "date_to": "2025-12-31",
    "article_types": ["randomized controlled trial", "meta-analysis"],
    "languages": ["eng"]
  }
}
```

---

### **2. Europe PMC** ✅
- **Coverage**: 42+ million publications
- **Focus**: Life sciences, includes preprints
- **API**: Europe PMC REST API (free)
- **API Key**: Not required
- **Rate Limit**: No strict limit (be polite)
- **Status**: ✅ Fully implemented

**Features**:
- Full-text search
- Includes preprints (bioRxiv, medRxiv)
- Can exclude preprints
- Returns: PMID, DOI, title, authors, journal, year, abstract, article type

**Example Usage**:
```typescript
// Search with preprints included
{
  "query": "SARS-CoV-2 AND vaccine",
  "max_results": 100,
  "include_preprints": true
}
```

---

### **3. Semantic Scholar** ✅ NEW!
- **Coverage**: 200+ million papers (all sciences)
- **Focus**: AI-powered relevance, citation context
- **API**: Semantic Scholar API (free)
- **API Key**: **REQUIRED** ✅ Configured
- **Rate Limit**: 1 request/second
- **Status**: ✅ Newly implemented

**Features**:
- AI-powered relevance ranking
- Citation counts (total + influential)
- Citation context (how papers cite each other)
- Open access detection
- Direct PDF links when available
- Fields of study classification
- Returns: Paper ID, DOI, PMID, title, authors, year, venue, abstract, citations, OA status

**Example Usage**:
```typescript
// Search with filters
{
  "query": "machine learning in medical diagnosis",
  "max_results": 100,
  "year_from": 2020,
  "year_to": 2025,
  "fields_of_study": ["Medicine", "Computer Science"],
  "open_access_only": true
}

// Get paper details by DOI
{
  "paper_id": "10.1001/jama.2020.12839"
}
```

**Unique Features**:
- **Influential Citations**: Not just citation count, but *influential* citations
- **Citation Context**: See how papers cite each other
- **Paper Recommendations**: AI suggests related papers
- **Author Profiles**: Track researcher output

---

### **4. The Lens** ✅ NEW!
- **Coverage**: 250+ million scholarly works + 130+ million patents
- **Focus**: Scholarly works, patents, clinical trials
- **API**: The Lens API (free for academic)
- **API Key**: **REQUIRED** ✅ Configured
- **Rate Limit**: 50 requests/minute, 10,000/month (free tier)
- **Status**: ✅ Newly implemented

**Features**:
- Scholarly articles + patents + clinical trials
- Advanced filtering
- Citation analysis (scholarly + patent citations)
- Open access detection
- Fields of study classification
- Returns: Lens ID, DOI, PMID, title, authors, year, source, abstract, citations, OA status

**Example Usage**:
```typescript
// Search scholarly works only
{
  "query": "CRISPR gene editing",
  "max_results": 100,
  "year_from": 2015,
  "year_to": 2025,
  "include_patents": false,
  "open_access_only": false,
  "source_types": ["journal", "conference"]
}

// Search including patents
{
  "query": "mRNA vaccine",
  "include_patents": true
}
```

**Unique Features**:
- **Patents**: Search 130M+ patents alongside scholarly works
- **Clinical Trials**: Integrated clinical trial data
- **Patent Citations**: See how patents cite scholarly works
- **Biological Sequences**: Link to biological sequence data

---

### **5. Unpaywall** ✅
- **Coverage**: Open access versions of articles
- **Focus**: Finding free, legal full-text PDFs
- **API**: Unpaywall API (free)
- **API Key**: Not required (email only)
- **Rate Limit**: 100,000 requests/day
- **Status**: ✅ Fully implemented

**Features**:
- Checks if article is open access
- OA status (gold, hybrid, bronze, green, closed)
- Direct PDF links
- Converts PMID to DOI automatically
- Returns: DOI, OA status, OA URL, PDF URL, license, publisher

**Example Usage**:
```typescript
{
  "identifiers": [
    "10.1001/jama.2020.12839",  // DOI
    "32780793"                   // PMID (auto-converted to DOI)
  ],
  "email": "researcher@institution.edu"
}
```

---

## 🔑 API KEY CONFIGURATION

### **Current Status**

All API keys are configured in `.env` file:

```env
# PubMed API Key (optional but recommended)
PUBMED_API_KEY=66bc6082338a4df6eb079c464339a57a8108

# Semantic Scholar API Key (required)
SEMANTIC_SCHOLAR_API_KEY=Us44NMPWt9Feqvp03cLn2XPn5q1IXr97jM5GuZ53

# The Lens API Key (required)
LENS_API_KEY=82HhOSPlUTrd8MZPPYFeYGHaDEc2urGCkUQoBMBUaCCfxpelBAnw

# Unpaywall (email only, no API key)
UNPAYWALL_EMAIL=user@example.com
```

### **How to Get API Keys**

#### **PubMed API Key** (Optional)
1. Visit: https://www.ncbi.nlm.nih.gov/account/
2. Create NCBI account (free)
3. Go to Settings → API Key Management
4. Generate API key
5. Add to `.env` file

**Benefits**: Increases rate limit from 3 to 10 requests/second

#### **Semantic Scholar API Key** (Required)
1. Visit: https://www.semanticscholar.org/product/api
2. Sign up with email
3. Request API key (instant approval)
4. Add to `.env` file

**Rate Limit**: 1 request/second

#### **The Lens API Key** (Required)
1. Visit: https://www.lens.org/lens/user/subscriptions
2. Create account
3. Select "Academic/Non-Profit" plan (free)
4. Request API key (may take 1-2 days for approval)
5. Add to `.env` file

**Rate Limit**: 50 requests/minute, 10,000/month (free tier)

---

## 📈 COMPARISON TABLE

| Database | Coverage | API Key? | Cost | Rate Limit | Medical Focus | Unique Features |
|----------|----------|----------|------|------------|---------------|-----------------|
| **PubMed** | 36M+ | Optional | Free | 3-10 req/s | ⭐⭐⭐⭐⭐ | MeSH terms, MEDLINE indexing |
| **Europe PMC** | 42M+ | No | Free | Unlimited* | ⭐⭐⭐⭐⭐ | Preprints, full-text search |
| **Semantic Scholar** | 200M+ | **Yes** | Free | 1 req/s | ⭐⭐⭐⭐⭐ | AI relevance, citation context |
| **The Lens** | 250M+ | **Yes** | Free** | 50 req/min | ⭐⭐⭐⭐⭐ | Patents, clinical trials |
| **Unpaywall** | OA only | Email | Free | 100K/day | ⭐⭐⭐⭐ | Open access PDFs |

*No official limit, but be polite  
**Free for academic/non-profit use

---

## 🎯 RECOMMENDED SEARCH STRATEGY

For comprehensive systematic reviews, use this multi-database approach:

### **Phase 1: Core Medical Literature**
1. **PubMed** - Start here for MEDLINE-indexed medical literature
2. **Europe PMC** - Add preprints and broader coverage

### **Phase 2: Expand Coverage**
3. **Semantic Scholar** - AI-powered relevance, find related papers
4. **The Lens** - Add patents, clinical trials, broader scholarly works

### **Phase 3: Access Full Text**
5. **Unpaywall** - Find open access versions of all identified papers

### **Example Workflow**:
```typescript
// 1. Search PubMed for core medical literature
const pubmedResults = await searchPubMed({
  query: "diabetes[MeSH] AND exercise[tiab]",
  max_results: 500,
  filters: {
    date_from: "2015-01-01",
    article_types: ["randomized controlled trial", "meta-analysis"]
  }
});

// 2. Search Europe PMC for preprints and broader coverage
const europePMCResults = await searchEuropePMC({
  query: "diabetes AND exercise",
  max_results: 500,
  include_preprints: true
});

// 3. Search Semantic Scholar for AI-powered relevance
const semanticResults = await searchSemanticScholar({
  query: "diabetes exercise intervention",
  max_results: 500,
  year_from: 2015,
  fields_of_study: ["Medicine"],
  open_access_only: false
});

// 4. Search The Lens for comprehensive coverage
const lensResults = await searchLens({
  query: "diabetes exercise",
  max_results: 500,
  year_from: 2015,
  include_patents: false
});

// 5. Find open access versions
const allDOIs = [...pubmedResults, ...europePMCResults, ...semanticResults, ...lensResults]
  .map(r => r.doi)
  .filter(Boolean);

const oaResults = await findOpenAccess({
  identifiers: allDOIs,
  email: "researcher@institution.edu"
});
```

---

## 🔧 MCP TOOL NAMES

Use these tool names in your MCP client:

### **Search Tools**
- `search_pubmed` - Search PubMed/MEDLINE
- `search_europe_pmc` - Search Europe PMC
- `search_semantic_scholar` - Search Semantic Scholar (NEW!)
- `search_lens` - Search The Lens (NEW!)

### **Detail Tools**
- `get_semantic_scholar_paper` - Get paper details by ID (NEW!)
- `get_lens_work` - Get work details by Lens ID (NEW!)

### **Open Access Tools**
- `find_open_access` - Find OA versions via Unpaywall

---

## 📊 RATE LIMITING

To avoid hitting rate limits, the system implements automatic rate limiting:

```env
# Rate limits (requests per second or minute)
PUBMED_RATE_LIMIT=10              # With API key
SEMANTIC_SCHOLAR_RATE_LIMIT=1     # 1 request/second
LENS_RATE_LIMIT=50                # 50 requests/minute
EUROPE_PMC_RATE_LIMIT=5           # Be polite
UNPAYWALL_RATE_LIMIT=10           # Well below daily limit
```

**Best Practices**:
1. Use batch searches when possible
2. Cache results to avoid re-querying
3. Respect rate limits (system enforces automatically)
4. For large searches, spread across multiple databases

---

## 🚀 USAGE EXAMPLES

### **Example 1: Comprehensive Diabetes Research Search**

```typescript
// Search all databases for diabetes research
const databases = [
  { name: 'PubMed', tool: 'search_pubmed' },
  { name: 'Europe PMC', tool: 'search_europe_pmc' },
  { name: 'Semantic Scholar', tool: 'search_semantic_scholar' },
  { name: 'The Lens', tool: 'search_lens' }
];

const query = "type 2 diabetes AND metformin";
const results = {};

for (const db of databases) {
  results[db.name] = await callTool(db.tool, {
    query: query,
    max_results: 100
  });
}

// Deduplicate by DOI
const uniquePapers = deduplicateByDOI(results);
console.log(`Found ${uniquePapers.length} unique papers across all databases`);
```

### **Example 2: Find Open Access Papers**

```typescript
// 1. Search PubMed
const pubmedResults = await searchPubMed({
  query: "COVID-19 vaccine efficacy",
  max_results: 100
});

// 2. Extract DOIs
const dois = pubmedResults.results.map(r => r.doi).filter(Boolean);

// 3. Find open access versions
const oaResults = await findOpenAccess({
  identifiers: dois,
  email: "researcher@institution.edu"
});

// 4. Filter for open access only
const openAccessPapers = oaResults.results.filter(r => r.is_oa);
console.log(`${openAccessPapers.length} out of ${dois.length} are open access`);
```

### **Example 3: Citation Analysis with Semantic Scholar**

```typescript
// Get paper details with citations
const paper = await getSemanticScholarPaper({
  paper_id: "10.1001/jama.2020.12839"
});

console.log(`Title: ${paper.title}`);
console.log(`Citations: ${paper.citationCount}`);
console.log(`Influential Citations: ${paper.influentialCitationCount}`);
console.log(`Open Access: ${paper.isOpenAccess ? 'Yes' : 'No'}`);
```

### **Example 4: Patent Search with The Lens**

```typescript
// Search for mRNA vaccine patents
const lensResults = await searchLens({
  query: "mRNA vaccine",
  max_results: 100,
  include_patents: true,  // Include patents
  year_from: 2015
});

// Separate scholarly works and patents
const scholarlyWorks = lensResults.results.filter(r => !r.is_patent);
const patents = lensResults.results.filter(r => r.is_patent);

console.log(`Scholarly works: ${scholarlyWorks.length}`);
console.log(`Patents: ${patents.length}`);
```

---

## 🔒 SECURITY & PRIVACY

### **API Key Protection**
- ✅ API keys stored in `.env` file (not committed to git)
- ✅ `.gitignore` configured to exclude `.env`
- ✅ `.env.example` provided as template (no real keys)

### **Data Privacy**
- ✅ All searches are private (not shared with third parties)
- ✅ No user data collected by MedResearch AI
- ✅ API providers may log requests (see their privacy policies)

### **Best Practices**
1. Never commit `.env` file to git
2. Use institutional email for Unpaywall (not personal)
3. Don't share API keys publicly
4. Rotate API keys periodically
5. Use environment-specific `.env` files for different deployments

---

## 📚 ADDITIONAL RESOURCES

### **API Documentation**
- **PubMed**: https://www.ncbi.nlm.nih.gov/books/NBK25501/
- **Europe PMC**: https://europepmc.org/RestfulWebService
- **Semantic Scholar**: https://api.semanticscholar.org/api-docs/
- **The Lens**: https://docs.api.lens.org/
- **Unpaywall**: https://unpaywall.org/products/api

### **Search Syntax Guides**
- **PubMed**: https://pubmed.ncbi.nlm.nih.gov/help/
- **Europe PMC**: https://europepmc.org/Help#mostofsearch
- **Semantic Scholar**: https://www.semanticscholar.org/faq#search-operators
- **The Lens**: https://www.lens.org/lens/search/scholar/structured

---

## 🎯 NEXT STEPS

### **Recommended Enhancements**
1. **ClinicalTrials.gov Integration** - Add clinical trials database (no API key needed)
2. **Cochrane Library** - Add systematic reviews (via Europe PMC)
3. **bioRxiv/medRxiv Direct** - Direct preprint search (currently via Europe PMC)
4. **CrossRef** - Add DOI metadata and citation linking
5. **ORCID** - Add author identification and tracking

### **Advanced Features**
1. **Automatic Deduplication** - Remove duplicate papers across databases
2. **Citation Network Analysis** - Build citation graphs
3. **Author Tracking** - Track researcher output across databases
4. **Alert System** - Email alerts for new papers matching queries
5. **Export to Reference Managers** - Direct export to Zotero, Mendeley, EndNote

---

## ✅ SUMMARY

**MedResearch AI now provides access to:**
- ✅ **500+ million scholarly works** across 5 databases
- ✅ **PubMed** (36M) - Medical literature gold standard
- ✅ **Europe PMC** (42M) - Preprints and full-text
- ✅ **Semantic Scholar** (200M) - AI-powered relevance
- ✅ **The Lens** (250M) - Patents and clinical trials
- ✅ **Unpaywall** - Open access PDFs

**All API keys configured and ready to use!** 🚀

---

**Last Updated**: December 3, 2025  
**Version**: 4.0.0  
**Status**: ✅ Production Ready
