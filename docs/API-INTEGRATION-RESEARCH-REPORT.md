# API Integration Research Report for MedResearch-AI

**Report Date:** December 13, 2025  
**Project Version:** 6.0.0-beta  
**Current Status:** 44 MCP Tools, 438 Passing Tests, Mock APIs  
**Objective:** Research and analyze real API integration options to replace mock implementations

---

## Executive Summary

This report provides comprehensive research on replacing mock API implementations in MedResearch-AI with production-ready integrations. Based on analysis of 7 major APIs, we recommend a phased approach prioritizing **PubMed E-utilities** (high priority, free, well-documented) and **Semantic Scholar** (already implemented) first, followed by **Zotero** and **Europe PMC** integrations.

**Key Findings:**
- ✅ **PubMed E-utilities**: Free, no API key required, 3 requests/second limit
- ✅ **Semantic Scholar**: Already implemented with real API (API key optional but recommended)
- ✅ **Europe PMC**: Free REST API, well-documented, no authentication required
- ✅ **Zotero**: Free API with OAuth 2.0, excellent TypeScript libraries available
- ⚠️ **Cochrane Library**: No public API - web scraping or manual registration required
- ⚠️ **PROSPERO**: No public API - protocol validation and form generation only
- ❌ **Mendeley**: API deprecated (2023), recommend Zotero migration path

---

## Table of Contents

1. [API Availability Matrix](#1-api-availability-matrix)
2. [Implementation Complexity Analysis](#2-implementation-complexity-analysis)
3. [Recommended Libraries](#3-recommended-libraries)
4. [Implementation Priority](#4-implementation-priority)
5. [Detailed API Analysis](#5-detailed-api-analysis)
   - [5.1 PubMed E-utilities API](#51-pubmed-e-utilities-api)
   - [5.2 Semantic Scholar API](#52-semantic-scholar-api)
   - [5.3 Europe PMC API](#53-europe-pmc-api)
   - [5.4 Zotero API](#54-zotero-api)
   - [5.5 Cochrane Library](#55-cochrane-library)
   - [5.6 PROSPERO](#56-prospero)
   - [5.7 Mendeley API](#57-mendeley-api)
6. [Code Examples](#6-code-examples)
7. [Migration Strategy](#7-migration-strategy)
8. [Risk Assessment](#8-risk-assessment)
9. [Cost Analysis](#9-cost-analysis)
10. [Recommendations](#10-recommendations)

---

## 1. API Availability Matrix

| API | Public Access | Authentication | Rate Limits | Cost | Status |
|-----|---------------|----------------|-------------|------|--------|
| **PubMed E-utils** | ✅ Yes | None (optional key) | 3/sec (10/sec with key) | Free | Production-ready |
| **Semantic Scholar** | ✅ Yes | Optional API key | 1/sec (100/sec with key) | Free | **Already Implemented** |
| **Europe PMC** | ✅ Yes | None | 10/sec | Free | Production-ready |
| **Zotero** | ✅ Yes | OAuth 2.0 | 10/sec | Free (storage fees) | Production-ready |
| **Cochrane Library** | ❌ No | N/A | N/A | Subscription | No public API |
| **PROSPERO** | ❌ No | Manual registration | N/A | Free | No public API |
| **Mendeley** | ❌ Deprecated | N/A | N/A | N/A | Sunset 2023 |

### Key Findings:
- **4 out of 7 APIs** are publicly available and free
- **3 APIs** have no authentication requirements (easier integration)
- **1 API** (Semantic Scholar) is already implemented with real API calls
- **Semantic Scholar** offers 100x rate limit increase with free API key

---

## 2. Implementation Complexity Analysis

### Easy (1-2 days) 🟢

**PubMed E-utilities API**
- **Complexity:** Low
- **Effort:** 1-2 days
- **Current Code:** Mock implementation exists (`integrate-pubmed-api.ts`)
- **Changes Required:**
  - Replace mock database with real HTTP calls to NCBI
  - Implement proper rate limiting (3 req/sec)
  - Add XML parsing for PubMed responses
  - Implement ESearch → EFetch pipeline
- **Dependencies:** Built-in `https` module, `fast-xml-parser` (already in package.json)
- **Risk:** Very Low

**Europe PMC API**
- **Complexity:** Low
- **Effort:** 1-2 days
- **Current Code:** Real implementation exists (`medical-databases.ts`)
- **Changes Required:**
  - Enhance error handling
  - Add retry logic for transient failures
  - Implement result pagination
- **Dependencies:** Built-in `https` module
- **Risk:** Very Low

### Medium (3-5 days) 🟡

**Zotero API**
- **Complexity:** Medium
- **Effort:** 3-4 days
- **Current Code:** Mock implementation exists (`integrate-reference-manager.ts`)
- **Changes Required:**
  - Implement OAuth 2.0 flow for authentication
  - Replace mock functions with real API calls
  - Add collection management
  - Implement sync functionality
- **Dependencies:** `zotero-sync` (TypeScript library recommended)
- **Risk:** Medium (OAuth complexity)

**Semantic Scholar Enhancement**
- **Complexity:** Low-Medium
- **Effort:** 1 day
- **Current Code:** **Real API already implemented** (`semantic-scholar.ts`)
- **Changes Required:**
  - Add API key support (optional but recommended)
  - Implement batch operations
  - Add caching for frequently accessed papers
  - Enhance error handling
- **Dependencies:** Already in place
- **Risk:** Very Low

### Hard (1-2 weeks) 🔴

**Cochrane Library Integration**
- **Complexity:** High
- **Effort:** 1-2 weeks
- **Current Code:** Mock implementation (`integrate-cochrane-library.ts`)
- **Changes Required:**
  - **No public API available** - requires web scraping or manual processes
  - Implement Puppeteer/Playwright for automated searching
  - Add subscription authentication
  - Implement CAPTCHA handling
- **Dependencies:** `puppeteer` or `playwright`
- **Risk:** High (legal/ToS concerns, fragile implementation)
- **Recommendation:** Keep mock implementation, document manual workflow

**PROSPERO Integration**
- **Complexity:** Medium-High
- **Effort:** 1 week
- **Current Code:** Mock implementation (`integrate-prospero-registration.ts`)
- **Changes Required:**
  - **No public API** - protocol validation is primary use case
  - Generate PROSPERO registration forms (already implemented)
  - Add PDF export functionality
  - Implement manual submission workflow documentation
- **Dependencies:** None
- **Risk:** Medium
- **Recommendation:** Keep current implementation (validation + form generation)

---

## 3. Recommended Libraries

### PubMed E-utilities

**Option 1: Built-in Node.js HTTPS (Recommended)**
```typescript
import https from 'https';
```
- ✅ No additional dependencies
- ✅ Full control over requests
- ✅ Already familiar to team
- ❌ Requires manual URL construction

**Option 2: Axios**
```bash
npm install axios
```
- ✅ Cleaner syntax
- ✅ Automatic JSON parsing
- ❌ Additional dependency

**Recommendation:** Use built-in `https` module to minimize dependencies. The project already uses this approach in `semantic-scholar.ts`.

### Zotero API

**Option 1: zotero-sync (Recommended)**
```bash
npm install zotero-sync
```
- ✅ TypeScript native
- ✅ Type-safe API
- ✅ OAuth 2.0 built-in
- ✅ Active maintenance
- Repository: https://github.com/retorquere/zotero-sync

**Option 2: zotero-api-client**
```bash
npm install zotero-api-client
```
- ✅ Official-ish library
- ✅ Well-documented
- ❌ JavaScript (not TypeScript native)
- Repository: https://github.com/tnajdek/zotero-api-client

**Recommendation:** Use `zotero-sync` for TypeScript integration.

### XML Parsing (PubMed, Europe PMC)

**fast-xml-parser (Already Installed)**
```typescript
import { XMLParser } from 'fast-xml-parser';
```
- ✅ Already in package.json
- ✅ Fast and lightweight
- ✅ TypeScript support

### HTTP Client

**Built-in HTTPS Module (Recommended)**
- ✅ No dependencies
- ✅ Used in `semantic-scholar.ts`
- ✅ Sufficient for our needs

---

## 4. Implementation Priority

### Phase 1: Quick Wins (Week 1) 🚀

**Priority 1: PubMed E-utilities**
- **Impact:** High (primary literature database)
- **Effort:** Low (1-2 days)
- **Risk:** Very Low
- **Value:** Immediate production capability
- **Dependencies:** None

**Priority 2: Semantic Scholar Enhancement**
- **Impact:** Medium (already working, just optimize)
- **Effort:** Very Low (1 day)
- **Risk:** Very Low
- **Value:** Improved rate limits, better error handling
- **Dependencies:** None

### Phase 2: Medium-Term (Week 2-3) 📈

**Priority 3: Zotero API**
- **Impact:** High (reference management critical)
- **Effort:** Medium (3-4 days)
- **Risk:** Medium (OAuth complexity)
- **Value:** Professional reference management
- **Dependencies:** `zotero-sync` library

**Priority 4: Europe PMC Enhancement**
- **Impact:** Medium (alternative to PubMed)
- **Effort:** Low (1-2 days)
- **Risk:** Very Low
- **Value:** Additional literature coverage
- **Dependencies:** None

### Phase 3: Long-Term (Future) 🔮

**Priority 5: PROSPERO (Documentation Only)**
- **Impact:** Low (no API available)
- **Effort:** Low (1 day documentation)
- **Risk:** Low
- **Value:** Clear user workflow
- **Recommendation:** Document manual workflow, keep current validation

**Priority 6: Cochrane Library (No Action)**
- **Impact:** Low (subscription required)
- **Effort:** High (web scraping)
- **Risk:** High (legal/ToS)
- **Recommendation:** Keep mock implementation, document manual search process

**Priority 7: Mendeley Migration**
- **Impact:** Low (deprecated API)
- **Effort:** None
- **Risk:** None
- **Recommendation:** Remove Mendeley code, focus on Zotero

---

## 5. Detailed API Analysis

### 5.1 PubMed E-utilities API

**Official Documentation:** https://www.ncbi.nlm.nih.gov/books/NBK25501/

#### Overview
The Entrez Programming Utilities (E-utilities) provide access to 38 NCBI databases, including PubMed/MEDLINE with 33+ million citations.

#### Authentication
- **None required** for basic access
- **Optional API key** increases rate limit from 3/sec to 10/sec
- API key is free: https://www.ncbi.nlm.nih.gov/account/

#### Rate Limits
| Without API Key | With API Key | Recommendation |
|----------------|--------------|----------------|
| 3 requests/second | 10 requests/second | Use API key |
| Max 100 requests/session | No session limit | Add retry logic |

#### Available Endpoints

**1. ESearch** - Search PubMed database
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?
  db=pubmed&
  term=diabetes+mellitus&
  retmax=100&
  retmode=json&
  api_key=YOUR_KEY
```

**2. EFetch** - Fetch full article details
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?
  db=pubmed&
  id=33782619,32109013&
  retmode=xml&
  api_key=YOUR_KEY
```

**3. ESummary** - Get article summaries
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?
  db=pubmed&
  id=33782619&
  retmode=json&
  api_key=YOUR_KEY
```

**4. ELink** - Find related articles
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?
  dbfrom=pubmed&
  id=33782619&
  cmd=neighbor&
  api_key=YOUR_KEY
```

#### Best Practices
1. **Always include email in requests:** `&email=your_email@example.com`
2. **Use API key:** Register at https://www.ncbi.nlm.nih.gov/account/
3. **Implement rate limiting:** Max 3 req/sec (or 10 with key)
4. **Weekend/off-peak usage:** NCBI encourages large jobs on weekends
5. **Use EPost for large datasets:** Upload PMIDs to server for processing

#### Response Format
- **XML** (default): Full structured data
- **JSON**: Available for ESearch and ESummary
- **Text**: Plain text format

#### Current Implementation Status
- File: `src/mcp/tools/integrate-pubmed-api.ts`
- Status: **Mock implementation** with 3 hardcoded articles
- Lines: 311 (well-structured, ready for real API)

#### Migration Effort
- **Estimated Time:** 1-2 days
- **Complexity:** Low
- **Breaking Changes:** None (interface stays the same)

---

### 5.2 Semantic Scholar API

**Official Documentation:** https://api.semanticscholar.org/api-docs/

#### Overview
200M+ papers from computer science, biomedical science, and more. Includes citation graphs, paper recommendations, and full metadata.

#### Current Status
✅ **Already implemented with real API calls** in `src/mcp/tools/semantic-scholar.ts`

#### Authentication
- **Optional API key** (free)
- Without key: 1 request/second
- With key: 100 requests/second (100x increase!)
- Register: https://www.semanticscholar.org/product/api

#### Rate Limits
| Without API Key | With API Key |
|----------------|--------------|
| 1 req/sec | 100 req/sec |
| 100 req/day | No daily limit |

#### Available Endpoints

**1. Paper Search**
```
https://api.semanticscholar.org/graph/v1/paper/search?
  query=diabetes&
  limit=10&
  fields=paperId,title,authors,year,abstract
```

**2. Paper Details**
```
https://api.semanticscholar.org/graph/v1/paper/DOI:10.1038/s41591-021-01316-7?
  fields=paperId,title,authors,citations,references
```

**3. Batch Operations**
```
POST https://api.semanticscholar.org/graph/v1/paper/batch
Body: {"ids": ["PMID:33782619", "DOI:10.1056/NEJMoa2002032"]}
```

#### Enhancement Opportunities
1. **Add API key support** (100x rate limit increase)
2. **Implement caching** for frequently accessed papers
3. **Add batch operations** for multiple papers
4. **Improve error handling** with retry logic

#### Current Implementation Status
- File: `src/mcp/tools/semantic-scholar.ts`
- Status: ✅ **Real API implementation** (346 lines)
- Features:
  - Search by query
  - Get paper by ID (DOI, PMID, ArXiv)
  - Citation counts
  - Open access detection
  - Rate limiting (1 req/sec)

#### Enhancement Effort
- **Estimated Time:** 1 day
- **Complexity:** Low
- **Breaking Changes:** None

---

### 5.3 Europe PMC API

**Official Documentation:** https://europepmc.org/RestfulWebService

#### Overview
33+ million publications from PubMed, Agricola, EPO, and NICE. Includes 10.2M full-text articles and 6.5M open access.

#### Authentication
- **None required** - completely free and open

#### Rate Limits
- **10 requests/second** (generous limit)
- No daily limits
- No API key required

#### Available Endpoints

**1. Search**
```
https://www.ebi.ac.uk/europepmc/webservices/rest/search?
  query=diabetes&
  resultType=core&
  format=json&
  pageSize=100
```

**2. Article Details**
```
https://www.ebi.ac.uk/europepmc/webservices/rest/search?
  query=EXT_ID:33782619&
  format=json
```

**3. References**
```
https://www.ebi.ac.uk/europepmc/webservices/rest/MED/33782619/references/1/100/json
```

**4. Citations**
```
https://www.ebi.ac.uk/europepmc/webservices/rest/MED/33782619/citations/1/100/json
```

#### Features
- Full-text search in 10.2M articles
- Database cross-references (UniProt, ENA, etc.)
- Reference lists for 19.4M publications
- Citation networks
- Text-mined annotations (genes, proteins, diseases)
- MeSH terms and metadata

#### Result Types
- **idlist**: IDs and sources only
- **lite**: Key metadata (default)
- **core**: Full metadata including abstract, links, MeSH

#### Current Implementation Status
- File: `src/mcp/tools/medical-databases.ts`
- Status: **Real API implementation** (partially)
- Features:
  - Basic search
  - XML parsing
  - Error handling

#### Enhancement Opportunities
1. Add pagination support
2. Implement reference/citation retrieval
3. Add full-text access
4. Implement text-mining annotations API

#### Enhancement Effort
- **Estimated Time:** 1-2 days
- **Complexity:** Low
- **Breaking Changes:** None

---

### 5.4 Zotero API

**Official Documentation:** https://www.zotero.org/support/dev/web_api/v3/start

#### Overview
Open-source reference manager with robust API. Supports collections, tags, full-text indexing, and file attachments.

#### Authentication
**OAuth 2.0 Required**
- User grants permission to access their library
- Generates API key with specific permissions
- API keys can be library-specific or account-wide

**Permission Levels:**
- Read library
- Write library  
- Read notes
- Write notes
- Read groups
- Write groups

#### Rate Limits
- **10 requests/second** per API key
- Burst allowance: Up to 100 requests
- 429 status code when limit exceeded

#### Available Endpoints

**1. Get Items**
```
GET https://api.zotero.org/users/{userID}/items?
  limit=50&
  format=json
```

**2. Create Item**
```
POST https://api.zotero.org/users/{userID}/items
Headers: 
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json
Body: [{ "itemType": "journalArticle", "title": "..." }]
```

**3. Search Items**
```
GET https://api.zotero.org/users/{userID}/items?
  q=diabetes&
  qmode=everything
```

**4. Collections**
```
GET https://api.zotero.org/users/{userID}/collections
```

**5. File Uploads**
```
POST https://api.zotero.org/users/{userID}/items/{itemKey}/file
```

#### TypeScript Libraries

**zotero-sync (Recommended)**
```bash
npm install zotero-sync
```

Features:
- ✅ TypeScript native
- ✅ Full API coverage
- ✅ OAuth 2.0 built-in
- ✅ Type-safe
- ✅ Active maintenance

Example:
```typescript
import { Zotero } from 'zotero-sync';

const client = new Zotero({
  apiKey: 'YOUR_API_KEY',
  libraryID: 'USER_ID',
  libraryType: 'user'
});

const items = await client.items().get();
```

**zotero-api-client**
```bash
npm install zotero-api-client
```

Features:
- ✅ Official-ish library
- ✅ Well-documented
- ❌ JavaScript (not TypeScript)

#### OAuth 2.0 Flow

**Step 1: Register Application**
1. Visit https://www.zotero.org/oauth/apps
2. Create new app
3. Get client ID and secret

**Step 2: Authorization URL**
```
https://www.zotero.org/oauth/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_CALLBACK&
  scope=all
```

**Step 3: Exchange Code for Token**
```
POST https://www.zotero.org/oauth/access
Body: {
  code: AUTH_CODE,
  client_id: YOUR_CLIENT_ID,
  client_secret: YOUR_SECRET,
  redirect_uri: YOUR_CALLBACK,
  grant_type: authorization_code
}
```

#### Current Implementation Status
- File: `src/mcp/tools/integrate-reference-manager.ts`
- Status: **Mock implementation** (689 lines)
- Features (mocked):
  - Import from Zotero
  - Export to Zotero
  - Duplicate detection
  - Sync between systems

#### Migration Effort
- **Estimated Time:** 3-4 days
- **Complexity:** Medium (OAuth adds complexity)
- **Breaking Changes:** Requires user authentication flow

---

### 5.5 Cochrane Library

**Website:** https://www.cochranelibrary.com/

#### Overview
High-quality systematic reviews and clinical trials database. Gold standard for evidence-based medicine.

#### Public API Status
❌ **No public API available**

#### Access Methods

**Option 1: Subscription Required**
- Institutional subscription needed
- Web interface only
- No programmatic access

**Option 2: Web Scraping (Not Recommended)**
- Violates Terms of Service
- Fragile implementation
- Legal risks
- CAPTCHA challenges

**Option 3: Manual Workflow**
- Users search Cochrane manually
- Copy results to MedResearch-AI
- Import via RIS/BibTeX files

#### Current Implementation Status
- File: `src/mcp/tools/integrate-cochrane-library.ts`
- Status: **Mock implementation** (525 lines)
- Features (mocked):
  - Search Cochrane Library
  - Get review details
  - Export citations
  - Extract PICO elements

#### Recommendations

**Short-term:**
1. Keep mock implementation for testing
2. Document manual workflow for users
3. Add RIS/BibTeX import functionality

**Long-term:**
1. Contact Cochrane about API access
2. Explore partnership opportunities
3. Consider Cochrane CENTRAL (available via PubMed)

#### Alternative: Cochrane CENTRAL via PubMed
```
ESearch query:
"Cochrane Database Syst Rev"[Journal]
```

This provides access to Cochrane reviews indexed in PubMed.

#### Migration Effort
- **Estimated Time:** N/A (no API available)
- **Recommendation:** Keep mock, document manual workflow

---

### 5.6 PROSPERO

**Website:** https://www.crd.york.ac.uk/prospero/

#### Overview
International prospective register of systematic reviews. Allows researchers to register protocols before conducting reviews.

#### Public API Status
❌ **No public API available**

#### Access Methods

**Option 1: Web Form Submission**
- Manual registration via web interface
- No programmatic submission
- Requires email verification

**Option 2: Export Registration Form**
- Generate PDF/XML form
- Manual upload to PROSPERO
- Current implementation supports this

#### Current Implementation Status
- File: `src/mcp/tools/integrate-prospero-registration.ts`
- Status: **Mock implementation with validation** (675 lines)
- Features:
  - ✅ Protocol validation (comprehensive)
  - ✅ Form generation (JSON, XML, PDF text)
  - ✅ Completeness scoring
  - ✅ Missing field detection
  - ❌ Actual registration (not possible without API)

#### Validation Features (Already Implemented)
- 15 required fields validation
- Completeness scoring (0-100%)
- PROSPERO compliance checking
- Registration number generation
- Citation format generation

#### Recommendations

**Keep Current Implementation:**
The current implementation provides significant value even without API access:
1. **Protocol Validation** - ensures all required fields are present
2. **Form Generation** - creates PROSPERO-compatible forms
3. **Quality Checks** - warns about missing recommended fields
4. **Export** - generates JSON/XML for record-keeping

**Enhancement Suggestions:**
1. Add PDF export (using `pdfkit` or similar)
2. Generate step-by-step registration guide
3. Add email templates for protocol sharing
4. Implement version tracking for protocol updates

#### Migration Effort
- **Estimated Time:** 1 day (documentation + PDF export)
- **Complexity:** Low
- **Recommendation:** Enhance current implementation, document manual workflow

---

### 5.7 Mendeley API

**Previous Documentation:** https://dev.mendeley.com/ (deprecated)

#### Status
❌ **API Deprecated and Shut Down (2023)**

Mendeley (owned by Elsevier) discontinued their public API in 2023. The service is transitioning to a subscription-only model with no public API access.

#### Migration Path

**Recommended: Migrate to Zotero**
- Zotero is open-source
- Excellent API support
- Free tier is generous
- Better long-term sustainability

**Migration Steps:**
1. Users export Mendeley library to BibTeX/RIS
2. Import into Zotero
3. Use Zotero API going forward

#### Current Implementation Status
- File: `src/mcp/tools/integrate-reference-manager.ts`
- Status: **Mock implementation** (Mendeley section)
- Lines: ~100 lines of Mendeley code

#### Recommendations
1. **Remove Mendeley code** to reduce maintenance burden
2. **Focus on Zotero** as primary reference manager
3. **Document migration path** for users
4. **Add BibTeX/RIS import** for general compatibility

#### Migration Effort
- **Estimated Time:** 1 hour (code removal + documentation)
- **Complexity:** Very Low
- **Breaking Changes:** Remove Mendeley support

---

## 6. Code Examples

### 6.1 PubMed E-utilities Implementation

```typescript
/**
 * Real PubMed E-utilities implementation
 * Replaces mock in integrate-pubmed-api.ts
 */

import https from 'https';
import { XMLParser } from 'fast-xml-parser';
import { logger } from '../../common/logger.js';

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const API_KEY = process.env.PUBMED_API_KEY || '';
const EMAIL = process.env.PUBMED_EMAIL || 'research@example.com';
const RATE_LIMIT_MS = API_KEY ? 100 : 334; // 10/sec with key, 3/sec without

let lastRequestTime = 0;

/**
 * Rate limiter for PubMed requests
 */
async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => 
      setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
}

/**
 * Make HTTPS request to NCBI
 */
function makeRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Search PubMed database (ESearch)
 */
export async function searchPubMed(
  params: PubMedSearchParams
): Promise<PubMedSearchResult> {
  await rateLimit();
  
  logger.info('Searching PubMed', {
    service: 'medresearch-ai',
    query: params.query,
    max_results: params.max_results || 100,
  });
  
  // Build ESearch URL
  const searchParams = new URLSearchParams({
    db: 'pubmed',
    term: params.query,
    retmax: String(params.max_results || 100),
    retmode: 'json',
    email: EMAIL,
  });
  
  if (API_KEY) {
    searchParams.append('api_key', API_KEY);
  }
  
  if (params.start_date) {
    searchParams.append('mindate', params.start_date);
  }
  
  if (params.end_date) {
    searchParams.append('maxdate', params.end_date);
  }
  
  const searchUrl = `${EUTILS_BASE}/esearch.fcgi?${searchParams}`;
  
  try {
    const searchData = await makeRequest(searchUrl);
    const searchResult = JSON.parse(searchData);
    
    const pmids = searchResult.esearchresult.idlist;
    
    if (pmids.length === 0) {
      return {
        query: params.query,
        total_results: 0,
        articles: [],
        search_metadata: {
          search_date: new Date().toISOString(),
          database: 'PubMed',
          api_version: 'E-utilities 2.0',
        },
        warnings: [],
      };
    }
    
    // Fetch article details (EFetch)
    const articles = await fetchArticlesByPMIDs(pmids);
    
    return {
      query: params.query,
      total_results: parseInt(searchResult.esearchresult.count),
      articles,
      search_metadata: {
        search_date: new Date().toISOString(),
        database: 'PubMed',
        api_version: 'E-utilities 2.0',
      },
      warnings: [],
    };
    
  } catch (error) {
    logger.error('PubMed search failed', {
      service: 'medresearch-ai',
      error: error instanceof Error ? error.message : String(error),
    });
    
    throw error;
  }
}

/**
 * Fetch articles by PMIDs (EFetch)
 */
async function fetchArticlesByPMIDs(
  pmids: string[]
): Promise<PubMedArticle[]> {
  await rateLimit();
  
  const fetchParams = new URLSearchParams({
    db: 'pubmed',
    id: pmids.join(','),
    retmode: 'xml',
    email: EMAIL,
  });
  
  if (API_KEY) {
    fetchParams.append('api_key', API_KEY);
  }
  
  const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?${fetchParams}`;
  const xmlData = await makeRequest(fetchUrl);
  
  // Parse XML response
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  
  const result = parser.parse(xmlData);
  const articles: PubMedArticle[] = [];
  
  const pubmedArticles = Array.isArray(result.PubmedArticleSet.PubmedArticle)
    ? result.PubmedArticleSet.PubmedArticle
    : [result.PubmedArticleSet.PubmedArticle];
  
  for (const article of pubmedArticles) {
    const medlineCitation = article.MedlineCitation;
    const articleData = medlineCitation.Article;
    
    articles.push({
      pmid: medlineCitation.PMID['#text'] || medlineCitation.PMID,
      title: articleData.ArticleTitle,
      authors: extractAuthors(articleData.AuthorList),
      journal: articleData.Journal.Title,
      publication_date: extractPublicationDate(articleData),
      abstract: extractAbstract(articleData.Abstract),
      doi: extractDOI(article.PubmedData),
      publication_types: extractPublicationTypes(articleData),
      mesh_terms: extractMeSHTerms(medlineCitation.MeshHeadingList),
    });
  }
  
  return articles;
}

/**
 * Helper: Extract authors from XML
 */
function extractAuthors(authorList: any): string[] {
  if (!authorList || !authorList.Author) {
    return [];
  }
  
  const authors = Array.isArray(authorList.Author)
    ? authorList.Author
    : [authorList.Author];
  
  return authors.map((author: any) => {
    const lastName = author.LastName || '';
    const initials = author.Initials || '';
    return `${lastName} ${initials}`.trim();
  });
}

/**
 * Helper: Extract publication date
 */
function extractPublicationDate(articleData: any): string {
  const pubDate = articleData.Journal.JournalIssue.PubDate;
  
  const year = pubDate.Year || '';
  const month = pubDate.Month || '01';
  const day = pubDate.Day || '01';
  
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Helper: Extract abstract
 */
function extractAbstract(abstract: any): string {
  if (!abstract || !abstract.AbstractText) {
    return '';
  }
  
  if (typeof abstract.AbstractText === 'string') {
    return abstract.AbstractText;
  }
  
  if (Array.isArray(abstract.AbstractText)) {
    return abstract.AbstractText.join(' ');
  }
  
  return abstract.AbstractText['#text'] || '';
}

/**
 * Helper: Extract DOI
 */
function extractDOI(pubmedData: any): string | undefined {
  const articleIds = pubmedData?.ArticleIdList?.ArticleId;
  
  if (!articleIds) {
    return undefined;
  }
  
  const ids = Array.isArray(articleIds) ? articleIds : [articleIds];
  
  const doiId = ids.find((id: any) => id['@_IdType'] === 'doi');
  
  return doiId ? doiId['#text'] : undefined;
}

/**
 * Helper: Extract publication types
 */
function extractPublicationTypes(articleData: any): string[] {
  const typeList = articleData.PublicationTypeList?.PublicationType;
  
  if (!typeList) {
    return [];
  }
  
  const types = Array.isArray(typeList) ? typeList : [typeList];
  
  return types.map((type: any) => 
    typeof type === 'string' ? type : type['#text']
  );
}

/**
 * Helper: Extract MeSH terms
 */
function extractMeSHTerms(meshList: any): string[] {
  if (!meshList || !meshList.MeshHeading) {
    return [];
  }
  
  const headings = Array.isArray(meshList.MeshHeading)
    ? meshList.MeshHeading
    : [meshList.MeshHeading];
  
  return headings.map((heading: any) => {
    const descriptor = heading.DescriptorName;
    return typeof descriptor === 'string' ? descriptor : descriptor['#text'];
  });
}
```

**Environment Variables (.env):**
```bash
# PubMed E-utilities
PUBMED_API_KEY=your_api_key_here  # Optional but recommended
PUBMED_EMAIL=your_email@example.com  # Required by NCBI
```

**Usage:**
```typescript
const results = await searchPubMed({
  query: 'diabetes mellitus AND randomized controlled trial',
  max_results: 100,
  start_date: '2020/01/01',
  end_date: '2024/12/31',
  publication_types: ['Randomized Controlled Trial'],
});

console.log(`Found ${results.total_results} articles`);
results.articles.forEach(article => {
  console.log(`${article.pmid}: ${article.title}`);
});
```

---

### 6.2 Semantic Scholar Enhancement

```typescript
/**
 * Enhanced Semantic Scholar implementation
 * Adds API key support, caching, and batch operations
 */

import https from 'https';
import { logger } from '../../common/logger.js';
import { cache } from '../../common/cache.js';

const API_BASE = 'https://api.semanticscholar.org/graph/v1';
const API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;
const RATE_LIMIT_MS = API_KEY ? 10 : 1000; // 100/sec with key, 1/sec without

let lastRequestTime = 0;

/**
 * Rate limiter
 */
async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => 
      setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
}

/**
 * Make HTTPS request with API key
 */
function makeRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {
      'User-Agent': 'MedResearch-AI/6.0.0',
    };
    
    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }
    
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 429) {
          reject(new Error('Rate limit exceeded'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Search with caching
 */
export async function searchSemanticScholar(
  args: SemanticScholarSearchArgs
): Promise<any> {
  const cacheKey = `ss_search_${JSON.stringify(args)}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    logger.info('Semantic Scholar cache hit', {
      service: 'medresearch-ai',
      query: args.query,
    });
    return cached;
  }
  
  await rateLimit();
  
  // Build query with filters
  let fullQuery = args.query;
  
  if (args.year_from || args.year_to) {
    const yearFrom = args.year_from || 1900;
    const yearTo = args.year_to || new Date().getFullYear();
    fullQuery += ` year:${yearFrom}-${yearTo}`;
  }
  
  if (args.fields_of_study && args.fields_of_study.length > 0) {
    fullQuery += ` fieldsOfStudy:${args.fields_of_study.join(',')}`;
  }
  
  if (args.open_access_only) {
    fullQuery += ' isOpenAccess:true';
  }
  
  const searchParams = new URLSearchParams({
    query: fullQuery,
    limit: String(args.max_results || 100),
    fields: 'paperId,externalIds,title,authors,year,venue,abstract,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,publicationTypes,url',
  });
  
  const searchUrl = `${API_BASE}/paper/search?${searchParams}`;
  
  try {
    const searchData = await makeRequest(searchUrl);
    const result = JSON.parse(searchData);
    
    // Cache for 1 hour
    cache.set(cacheKey, result, 3600);
    
    logger.info('Semantic Scholar search complete', {
      service: 'medresearch-ai',
      query: args.query,
      count: result.total || 0,
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          query: fullQuery,
          count: result.total || result.data?.length || 0,
          retrieved: result.data?.length || 0,
          rate_limit_note: API_KEY 
            ? '100 requests/second (with API key)' 
            : '1 request/second (without API key - register at semanticscholar.org)',
          results: result.data || [],
        }, null, 2),
      }],
    };
    
  } catch (error) {
    logger.error('Semantic Scholar search failed', {
      service: 'medresearch-ai',
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
          query: args.query,
          note: 'Consider registering for API key at semanticscholar.org for 100x rate limit increase',
        }, null, 2),
      }],
      isError: true,
    };
  }
}

/**
 * Batch get papers
 */
export async function batchGetSemanticScholarPapers(
  paperIds: string[]
): Promise<any> {
  await rateLimit();
  
  logger.info('Batch fetching Semantic Scholar papers', {
    service: 'medresearch-ai',
    count: paperIds.length,
  });
  
  const headers: Record<string, string> = {
    'User-Agent': 'MedResearch-AI/6.0.0',
    'Content-Type': 'application/json',
  };
  
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }
  
  const postData = JSON.stringify({
    ids: paperIds,
  });
  
  return new Promise((resolve, reject) => {
    const req = https.request(
      `${API_BASE}/paper/batch`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}
```

**Environment Variables:**
```bash
# Semantic Scholar API (optional but recommended)
SEMANTIC_SCHOLAR_API_KEY=your_api_key_here  # Get at semanticscholar.org/product/api
```

---

### 6.3 Zotero Integration

```typescript
/**
 * Real Zotero API integration
 * Using zotero-sync library
 */

import { Zotero } from 'zotero-sync';
import { logger } from '../../common/logger.js';

/**
 * Initialize Zotero client
 */
function getZoteroClient(config: ZoteroConfig): Zotero {
  return new Zotero({
    apiKey: config.api_key,
    libraryID: config.library_id,
    libraryType: config.library_type,
  });
}

/**
 * Import references from Zotero
 */
export async function importFromZotero(
  config: ZoteroConfig,
  collectionKey?: string
): Promise<ImportResult> {
  logger.info('Importing references from Zotero', {
    service: 'medresearch-ai',
    library_id: config.library_id,
    library_type: config.library_type,
  });
  
  try {
    const client = getZoteroClient(config);
    
    // Get items (with collection filter if provided)
    const params: any = {
      limit: 100,
      format: 'json',
    };
    
    if (collectionKey) {
      params.collectionKey = collectionKey;
    }
    
    const items = await client.items().get(params);
    
    // Transform to our Reference format
    const references: Reference[] = items.map(transformZoteroItem);
    
    logger.info('Zotero import complete', {
      service: 'medresearch-ai',
      imported: references.length,
    });
    
    return {
      success: true,
      imported: references.length,
      duplicates: 0,
      errors: 0,
      references,
      message: `Successfully imported ${references.length} references from Zotero`,
    };
    
  } catch (error) {
    logger.error('Zotero import failed', {
      service: 'medresearch-ai',
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      success: false,
      imported: 0,
      duplicates: 0,
      errors: 1,
      references: [],
      message: `Import failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Export references to Zotero
 */
export async function exportToZotero(
  references: Reference[],
  config: ZoteroConfig,
  collectionKey?: string
): Promise<ExportResult> {
  logger.info('Exporting references to Zotero', {
    service: 'medresearch-ai',
    count: references.length,
  });
  
  try {
    const client = getZoteroClient(config);
    
    // Transform to Zotero format
    const zoteroItems = references.map(transformToZoteroFormat);
    
    // Create items
    const response = await client.items().post(zoteroItems);
    
    // Optionally add to collection
    if (collectionKey && response.success) {
      const itemKeys = response.successful.map((item: any) => item.key);
      await client.collections(collectionKey).items().post(itemKeys);
    }
    
    logger.info('Zotero export complete', {
      service: 'medresearch-ai',
      exported: response.successful?.length || 0,
      errors: response.failed?.length || 0,
    });
    
    return {
      success: true,
      exported: response.successful?.length || 0,
      errors: response.failed?.length || 0,
      message: `Successfully exported ${response.successful?.length || 0} references to Zotero`,
      export_url: `https://www.zotero.org/${config.library_type}s/${config.library_id}/items`,
    };
    
  } catch (error) {
    logger.error('Zotero export failed', {
      service: 'medresearch-ai',
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      success: false,
      exported: 0,
      errors: references.length,
      message: `Export failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Transform Zotero item to our Reference format
 */
function transformZoteroItem(zoteroItem: any): Reference {
  return {
    id: zoteroItem.key,
    type: mapZoteroType(zoteroItem.data.itemType),
    title: zoteroItem.data.title || '',
    authors: extractZoteroAuthors(zoteroItem.data.creators),
    year: zoteroItem.data.date ? extractYear(zoteroItem.data.date) : undefined,
    journal: zoteroItem.data.publicationTitle,
    volume: zoteroItem.data.volume,
    issue: zoteroItem.data.issue,
    pages: zoteroItem.data.pages,
    doi: zoteroItem.data.DOI,
    url: zoteroItem.data.url,
    abstract: zoteroItem.data.abstractNote,
    keywords: zoteroItem.data.tags?.map((tag: any) => tag.tag),
    notes: zoteroItem.data.extra,
    collections: zoteroItem.data.collections,
    date_added: zoteroItem.data.dateAdded,
    date_modified: zoteroItem.data.dateModified,
  };
}

/**
 * Transform our Reference to Zotero format
 */
function transformToZoteroFormat(reference: Reference): any {
  return {
    itemType: mapToZoteroType(reference.type),
    title: reference.title,
    creators: reference.authors.map(author => ({
      creatorType: 'author',
      name: author,
    })),
    date: reference.year?.toString(),
    publicationTitle: reference.journal,
    volume: reference.volume,
    issue: reference.issue,
    pages: reference.pages,
    DOI: reference.doi,
    url: reference.url,
    abstractNote: reference.abstract,
    tags: reference.keywords?.map(keyword => ({ tag: keyword })),
    extra: reference.notes,
  };
}

/**
 * Map Zotero item type to our type
 */
function mapZoteroType(zoteroType: string): Reference['type'] {
  const typeMap: Record<string, Reference['type']> = {
    journalArticle: 'article',
    book: 'book',
    bookSection: 'chapter',
    conferencePaper: 'conference',
    thesis: 'thesis',
    report: 'report',
    webpage: 'webpage',
  };
  
  return typeMap[zoteroType] || 'other';
}

/**
 * Map our type to Zotero type
 */
function mapToZoteroType(ourType: Reference['type']): string {
  const typeMap: Record<Reference['type'], string> = {
    article: 'journalArticle',
    book: 'book',
    chapter: 'bookSection',
    conference: 'conferencePaper',
    thesis: 'thesis',
    report: 'report',
    webpage: 'webpage',
    other: 'document',
  };
  
  return typeMap[ourType];
}

/**
 * Extract authors from Zotero creators
 */
function extractZoteroAuthors(creators?: any[]): string[] {
  if (!creators) {
    return [];
  }
  
  return creators
    .filter(creator => creator.creatorType === 'author')
    .map(creator => {
      if (creator.name) {
        return creator.name;
      }
      return `${creator.lastName}, ${creator.firstName}`;
    });
}

/**
 * Extract year from date string
 */
function extractYear(dateStr: string): number | undefined {
  const match = dateStr.match(/\d{4}/);
  return match ? parseInt(match[0]) : undefined;
}
```

**Installation:**
```bash
npm install zotero-sync
```

**Environment Variables:**
```bash
# Zotero API
ZOTERO_API_KEY=your_api_key_here  # Get from zotero.org/settings/keys
ZOTERO_LIBRARY_ID=12345  # Your user ID or group ID
ZOTERO_LIBRARY_TYPE=user  # "user" or "group"
```

**OAuth 2.0 Setup Guide:**
1. Register app: https://www.zotero.org/oauth/apps
2. Get client ID and secret
3. Implement authorization flow (see Zotero docs)
4. Store API key in environment variables

---

### 6.4 Error Handling & Retry Logic

```typescript
/**
 * Generic retry logic for API calls
 * Add to common/retry.ts
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryableStatusCodes?: number[];
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryableStatusCodes = [429, 500, 502, 503, 504],
  } = options;
  
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Check if error is retryable
      const statusCode = (error as any).statusCode;
      if (statusCode && !retryableStatusCodes.includes(statusCode)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt),
        maxDelay
      );
      
      logger.warn('API call failed, retrying', {
        service: 'medresearch-ai',
        attempt: attempt + 1,
        maxRetries,
        delay,
        error: lastError.message,
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Example usage
 */
export async function searchPubMedWithRetry(
  params: PubMedSearchParams
): Promise<PubMedSearchResult> {
  return retryWithBackoff(
    () => searchPubMed(params),
    {
      maxRetries: 3,
      baseDelay: 1000,
      retryableStatusCodes: [429, 500, 502, 503, 504],
    }
  );
}
```

---

## 7. Migration Strategy

### 7.1 Migration Phases

**Phase 1: Foundation (Week 1)**
1. **Set up API keys**
   - Register for PubMed API key (optional but recommended)
   - Register for Semantic Scholar API key (100x rate limit)
   - Document API key setup process

2. **Implement PubMed E-utilities**
   - Replace mock in `integrate-pubmed-api.ts`
   - Add rate limiting (3/sec or 10/sec with key)
   - Implement ESearch → EFetch pipeline
   - Add comprehensive error handling
   - Write integration tests

3. **Enhance Semantic Scholar**
   - Add API key support
   - Implement caching layer
   - Add batch operations
   - Improve error handling

**Phase 2: Reference Management (Week 2-3)**
1. **Zotero Integration**
   - Install `zotero-sync` library
   - Implement OAuth 2.0 authentication
   - Replace mock in `integrate-reference-manager.ts`
   - Add collection management
   - Test import/export workflows

2. **Remove Mendeley**
   - Remove Mendeley code from `integrate-reference-manager.ts`
   - Document migration path from Mendeley to Zotero
   - Add BibTeX/RIS import for compatibility

**Phase 3: Documentation & Testing (Week 3-4)**
1. **Update Documentation**
   - API key setup guides
   - Rate limit guidelines
   - Error handling best practices
   - Migration guides for users

2. **Comprehensive Testing**
   - Unit tests for each API
   - Integration tests for workflows
   - Rate limit testing
   - Error scenario testing

3. **Update .env.example**
   ```bash
   # PubMed E-utilities
   PUBMED_API_KEY=your_key_here  # Optional, register at ncbi.nlm.nih.gov
   PUBMED_EMAIL=your_email@example.com  # Required by NCBI
   
   # Semantic Scholar
   SEMANTIC_SCHOLAR_API_KEY=your_key_here  # Optional, get at semanticscholar.org
   
   # Zotero
   ZOTERO_API_KEY=your_key_here  # Get from zotero.org/settings/keys
   ZOTERO_LIBRARY_ID=12345
   ZOTERO_LIBRARY_TYPE=user  # or "group"
   ```

### 7.2 Backward Compatibility

**Strategy: Dual Implementation Period**
1. Keep mock implementations as fallback
2. Add environment variable to toggle real vs. mock
3. Allow gradual migration for users

**Example:**
```typescript
export async function searchPubMed(
  params: PubMedSearchParams
): Promise<PubMedSearchResult> {
  const useMock = process.env.PUBMED_USE_MOCK === 'true';
  
  if (useMock) {
    return searchPubMedMock(params);
  }
  
  return searchPubMedReal(params);
}
```

### 7.3 Testing Strategy

**Unit Tests**
- Test each API endpoint independently
- Mock HTTP responses
- Test error scenarios
- Validate response parsing

**Integration Tests**
- Test real API calls (in CI/CD with API keys)
- Test rate limiting
- Test retry logic
- Test cache functionality

**Example Test:**
```typescript
import { describe, it, expect } from '@jest/globals';
import { searchPubMed } from '../src/mcp/tools/integrate-pubmed-api.js';

describe('PubMed E-utilities Integration', () => {
  it('should search PubMed and return results', async () => {
    const results = await searchPubMed({
      query: 'diabetes mellitus',
      max_results: 10,
    });
    
    expect(results.success).toBe(true);
    expect(results.articles.length).toBeGreaterThan(0);
    expect(results.articles[0]).toHaveProperty('pmid');
    expect(results.articles[0]).toHaveProperty('title');
  }, 30000); // 30 second timeout for API call
  
  it('should handle rate limiting', async () => {
    // Make 4 requests rapidly (should trigger rate limiting)
    const promises = Array(4).fill(null).map(() =>
      searchPubMed({ query: 'test', max_results: 1 })
    );
    
    const results = await Promise.all(promises);
    
    // All should succeed (rate limiter should space them out)
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  }, 60000);
  
  it('should retry on transient failures', async () => {
    // Mock a transient failure scenario
    // ... test implementation
  });
});
```

### 7.4 Rollback Plan

**If Integration Fails:**
1. Revert to mock implementations
2. Keep API key configurations
3. Document issues for future attempts

**Git Strategy:**
```bash
# Create feature branch
git checkout -b feature/real-api-integration

# Implement changes incrementally
git commit -m "Add PubMed E-utilities implementation"
git commit -m "Add Semantic Scholar enhancements"

# If issues arise, easy to revert
git revert <commit-hash>
```

---

## 8. Risk Assessment

### 8.1 API-Specific Risks

**PubMed E-utilities**
- **Risk Level:** 🟢 Very Low
- **Risks:**
  - Rate limiting (3/sec without key)
  - XML parsing complexity
  - Service downtime (rare)
- **Mitigations:**
  - Register for API key (10/sec)
  - Use `fast-xml-parser` (already in project)
  - Implement retry logic
  - Cache results

**Semantic Scholar**
- **Risk Level:** 🟢 Very Low
- **Risks:**
  - Rate limiting (1/sec without key)
  - API changes
- **Mitigations:**
  - Register for API key (100/sec)
  - Version API endpoints
  - Monitor for deprecations

**Zotero**
- **Risk Level:** 🟡 Medium
- **Risks:**
  - OAuth complexity
  - User authentication flow
  - API key management
  - Library permission issues
- **Mitigations:**
  - Use `zotero-sync` library
  - Clear OAuth documentation
  - Secure API key storage
  - Handle permission errors gracefully

**Europe PMC**
- **Risk Level:** 🟢 Very Low
- **Risks:**
  - Service changes
  - Rate limiting
- **Mitigations:**
  - Monitor for API updates
  - Implement retry logic
  - Cache results

**Cochrane Library**
- **Risk Level:** 🔴 High
- **Risks:**
  - No public API
  - Web scraping violates ToS
  - Legal risks
  - CAPTCHA challenges
- **Mitigations:**
  - Keep mock implementation
  - Document manual workflow
  - Consider partnership with Cochrane

**PROSPERO**
- **Risk Level:** 🟡 Medium
- **Risks:**
  - No public API
  - Manual submission required
  - Form format changes
- **Mitigations:**
  - Keep current validation implementation
  - Generate exportable forms
  - Document manual workflow

### 8.2 General Risks

**Rate Limiting**
- **Risk:** API calls exceed rate limits
- **Impact:** Failed requests, degraded UX
- **Mitigation:**
  - Implement rate limiters for each API
  - Use API keys for higher limits
  - Add request queuing
  - Cache results

**Authentication Failures**
- **Risk:** Invalid or expired API keys
- **Impact:** All API calls fail
- **Mitigation:**
  - Validate API keys on startup
  - Clear error messages for users
  - Fallback to mock implementations
  - Document API key setup

**API Deprecations**
- **Risk:** API endpoints change or deprecate
- **Impact:** Breaking changes
- **Mitigation:**
  - Monitor API changelogs
  - Version API clients
  - Subscribe to developer newsletters
  - Maintain backward compatibility

**Network Failures**
- **Risk:** Transient network issues
- **Impact:** Failed requests
- **Mitigation:**
  - Implement retry logic with exponential backoff
  - Add timeout configurations
  - Clear error messages
  - Offline mode considerations

### 8.3 Risk Matrix

| Risk | Likelihood | Impact | Severity | Mitigation Priority |
|------|-----------|--------|----------|-------------------|
| PubMed rate limiting | Medium | Low | 🟡 Low | High |
| Semantic Scholar rate limiting | Low | Low | 🟢 Very Low | Medium |
| Zotero OAuth complexity | Medium | Medium | 🟡 Medium | High |
| Cochrane scraping legal issues | High | High | 🔴 High | Critical (Avoid) |
| API deprecation | Low | High | 🟡 Medium | Medium |
| Network failures | Medium | Medium | 🟡 Medium | High |
| Authentication failures | Low | Medium | 🟡 Medium | Medium |

---

## 9. Cost Analysis

### 9.1 API Costs

| API | Free Tier | Paid Tier | Our Usage | Monthly Cost |
|-----|-----------|-----------|-----------|--------------|
| **PubMed E-utilities** | Unlimited | N/A | Free | $0 |
| **Semantic Scholar** | 100 req/sec | N/A | Free | $0 |
| **Europe PMC** | Unlimited | N/A | Free | $0 |
| **Zotero** | 300 MB storage | $20/yr for 2GB | Free (API) | $0 |
| **Cochrane** | N/A | $30+/month | N/A | N/A |
| **PROSPERO** | Free | N/A | Free | $0 |

**Total API Costs: $0/month** 🎉

### 9.2 Development Costs

**Initial Implementation (One-Time)**
- PubMed E-utilities: 1-2 days × $500/day = $500-1,000
- Semantic Scholar Enhancement: 1 day × $500/day = $500
- Zotero Integration: 3-4 days × $500/day = $1,500-2,000
- Europe PMC Enhancement: 1-2 days × $500/day = $500-1,000
- Documentation & Testing: 3-4 days × $500/day = $1,500-2,000
- **Total: $4,500-7,000** (one-time)

**Ongoing Maintenance**
- Monitor API changes: 2 hours/month
- Update dependencies: 1 hour/month
- Fix issues: 2 hours/month (average)
- **Total: ~5 hours/month = ~$300/month**

### 9.3 Infrastructure Costs

**Minimal Additional Costs:**
- No additional server requirements
- Negligible bandwidth usage (API responses are small)
- Storage: Minimal (cache data only)

**Total Infrastructure: ~$0/month**

### 9.4 ROI Analysis

**Benefits:**
- ✅ Production-ready literature search
- ✅ Access to 33+ million PubMed articles
- ✅ Access to 200+ million Semantic Scholar papers
- ✅ Professional reference management (Zotero)
- ✅ Increased credibility and user trust
- ✅ Competitive advantage over mock implementations

**Opportunity Cost of NOT Implementing:**
- Lost users who discover mock APIs
- Reduced credibility in academic community
- Limited testing with real data
- Inability to use in production research

**Conclusion:** ROI is strongly positive. Free APIs with minimal development cost provide massive value.

---

## 10. Recommendations

### 10.1 Immediate Actions (Week 1)

**1. Register for API Keys**
```bash
# PubMed (optional but recommended)
https://www.ncbi.nlm.nih.gov/account/

# Semantic Scholar (highly recommended - 100x rate limit)
https://www.semanticscholar.org/product/api

# Zotero (required for integration)
https://www.zotero.org/settings/keys
```

**2. Implement PubMed E-utilities**
- Priority: ⭐⭐⭐⭐⭐ (Critical)
- Impact: High (primary literature database)
- Effort: 1-2 days
- File: `src/mcp/tools/integrate-pubmed-api.ts`
- Action: Replace mock with real API calls

**3. Enhance Semantic Scholar**
- Priority: ⭐⭐⭐⭐ (High)
- Impact: Medium (already working, optimize)
- Effort: 1 day
- File: `src/mcp/tools/semantic-scholar.ts`
- Action: Add API key, caching, batch operations

### 10.2 Short-term Actions (Week 2-3)

**4. Zotero Integration**
- Priority: ⭐⭐⭐⭐ (High)
- Impact: High (professional reference management)
- Effort: 3-4 days
- File: `src/mcp/tools/integrate-reference-manager.ts`
- Action: Install `zotero-sync`, implement OAuth

**5. Europe PMC Enhancement**
- Priority: ⭐⭐⭐ (Medium)
- Impact: Medium (alternative literature source)
- Effort: 1-2 days
- File: `src/mcp/tools/medical-databases.ts`
- Action: Enhance error handling, add pagination

### 10.3 Long-term Actions (Week 4+)

**6. Remove Mendeley Code**
- Priority: ⭐⭐ (Low)
- Impact: Low (cleanup)
- Effort: 1 hour
- File: `src/mcp/tools/integrate-reference-manager.ts`
- Action: Remove deprecated Mendeley code

**7. Document Manual Workflows**
- Priority: ⭐⭐⭐ (Medium)
- Impact: Medium (user guidance)
- Effort: 1 day
- Files: Create documentation
- Action: Document Cochrane and PROSPERO workflows

**8. Implement Comprehensive Testing**
- Priority: ⭐⭐⭐⭐ (High)
- Impact: High (reliability)
- Effort: 2-3 days
- Files: `tests/` directory
- Action: Write integration tests for all APIs

### 10.4 Do NOT Implement

**Cochrane Library Web Scraping**
- ❌ High legal risk (ToS violation)
- ❌ Fragile implementation
- ❌ CAPTCHA challenges
- ✅ Instead: Keep mock, document manual workflow
- ✅ Alternative: Use Cochrane CENTRAL via PubMed

**PROSPERO Automated Registration**
- ❌ No public API available
- ❌ Cannot automate submission
- ✅ Instead: Keep validation tools, generate forms
- ✅ Document manual submission process

---

## 11. Implementation Checklist

### Phase 1: Foundation ✅

- [ ] Set up API keys
  - [ ] Register PubMed API key
  - [ ] Register Semantic Scholar API key
  - [ ] Register Zotero API key
  - [ ] Update `.env.example`
  - [ ] Document API key setup process

- [ ] PubMed E-utilities Implementation
  - [ ] Create `searchPubMedReal()` function
  - [ ] Implement ESearch endpoint
  - [ ] Implement EFetch endpoint
  - [ ] Add XML parsing
  - [ ] Add rate limiting (3/sec or 10/sec)
  - [ ] Add retry logic
  - [ ] Add error handling
  - [ ] Write unit tests
  - [ ] Write integration tests
  - [ ] Update documentation

- [ ] Semantic Scholar Enhancement
  - [ ] Add API key support
  - [ ] Implement caching layer
  - [ ] Add batch operations
  - [ ] Improve error handling
  - [ ] Update tests
  - [ ] Update documentation

### Phase 2: Reference Management ✅

- [ ] Zotero Integration
  - [ ] Install `zotero-sync` library
  - [ ] Implement OAuth 2.0 flow
  - [ ] Replace `importFromZotero()` mock
  - [ ] Replace `exportToZotero()` mock
  - [ ] Add collection management
  - [ ] Add file attachment support
  - [ ] Write unit tests
  - [ ] Write integration tests
  - [ ] Create OAuth setup guide

- [ ] Mendeley Removal
  - [ ] Remove Mendeley code
  - [ ] Document migration path
  - [ ] Add BibTeX/RIS import
  - [ ] Update tests
  - [ ] Update documentation

### Phase 3: Documentation & Polish ✅

- [ ] Documentation Updates
  - [ ] API key setup guides
  - [ ] Rate limit guidelines
  - [ ] Error handling docs
  - [ ] User migration guides
  - [ ] Developer API docs
  - [ ] Update README.md

- [ ] Testing
  - [ ] Unit test coverage > 80%
  - [ ] Integration tests for all APIs
  - [ ] Rate limit tests
  - [ ] Error scenario tests
  - [ ] Performance tests

- [ ] Code Quality
  - [ ] TypeScript strict mode
  - [ ] ESLint compliance
  - [ ] Code review
  - [ ] Security audit
  - [ ] Performance optimization

---

## 12. Success Metrics

### 12.1 Technical Metrics

**API Integration**
- ✅ 100% real API implementations for available APIs
- ✅ < 1% API error rate
- ✅ < 2 second average response time
- ✅ > 80% cache hit rate (where applicable)

**Testing**
- ✅ > 80% unit test coverage
- ✅ 100% integration test coverage for APIs
- ✅ All tests passing in CI/CD

**Code Quality**
- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors
- ✅ All API functions documented

### 12.2 User Metrics

**Functionality**
- ✅ Users can search PubMed successfully
- ✅ Users can import/export Zotero references
- ✅ Users can access 33M+ PubMed articles
- ✅ Users can access 200M+ Semantic Scholar papers

**Performance**
- ✅ Search results in < 3 seconds
- ✅ Zotero sync in < 5 seconds (for 100 items)
- ✅ No rate limit errors with API keys

**Reliability**
- ✅ 99.9% uptime (API availability)
- ✅ Graceful error handling
- ✅ Clear error messages

---

## 13. Conclusion

### Summary of Findings

**Available APIs: 4/7 Ready for Production**
- ✅ PubMed E-utilities: Free, well-documented, production-ready
- ✅ Semantic Scholar: Already implemented, needs enhancement
- ✅ Europe PMC: Free, well-documented, partially implemented
- ✅ Zotero: Free API, requires OAuth implementation
- ❌ Cochrane Library: No public API, keep mock
- ❌ PROSPERO: No public API, keep validation tools
- ❌ Mendeley: Deprecated, remove code

### Recommended Approach

**Phase 1 (Week 1): Quick Wins** 🚀
1. Implement PubMed E-utilities (1-2 days)
2. Enhance Semantic Scholar (1 day)
3. Register for API keys

**Phase 2 (Week 2-3): Reference Management** 📚
1. Zotero integration (3-4 days)
2. Europe PMC enhancement (1-2 days)
3. Remove Mendeley code (1 hour)

**Phase 3 (Week 4): Polish** ✨
1. Comprehensive testing (2-3 days)
2. Documentation updates (1-2 days)
3. Security audit

### Expected Outcomes

**Technical:**
- Production-ready API integrations
- Access to 33M+ PubMed articles
- Access to 200M+ Semantic Scholar papers
- Professional reference management via Zotero
- 0% API costs

**Business:**
- Increased credibility in academic community
- Competitive advantage over mock implementations
- Ability to conduct real systematic reviews
- User trust and adoption

**Total Investment:**
- Development: $4,500-7,000 (one-time)
- Maintenance: ~$300/month
- API costs: $0/month
- **ROI: Extremely High** ✅

### Final Recommendation

**Proceed with phased implementation starting with PubMed E-utilities and Semantic Scholar enhancement.**

These provide the highest value with lowest risk and effort. The free tier of all recommended APIs makes this a low-risk, high-reward investment that will significantly enhance MedResearch-AI's production readiness.

---

## Appendix A: Additional Resources

### Official Documentation
- [PubMed E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- [Semantic Scholar API](https://api.semanticscholar.org/api-docs/)
- [Europe PMC RESTful API](https://europepmc.org/RestfulWebService)
- [Zotero Web API v3](https://www.zotero.org/support/dev/web_api/v3/start)
- [PROSPERO](https://www.crd.york.ac.uk/prospero/)
- [Cochrane Library](https://www.cochranelibrary.com/)

### TypeScript Libraries
- [zotero-sync](https://github.com/retorquere/zotero-sync) - TypeScript Zotero client
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) - XML parsing
- [node-cache](https://github.com/node-cache/node-cache) - Simple caching

### Development Tools
- [Postman](https://www.postman.com/) - API testing
- [curl](https://curl.se/) - Command-line API testing
- [jq](https://stedolan.github.io/jq/) - JSON parsing

### Community Support
- [PubMed Help](https://support.nlm.nih.gov/)
- [Semantic Scholar Forum](https://www.semanticscholar.org/faq)
- [Zotero Forums](https://forums.zotero.org/)
- [Europe PMC Forum](https://groups.google.com/a/ebi.ac.uk/forum/#!forum/epmc-webservices)

---

## Appendix B: Environment Variables Reference

```bash
# .env.example

# ============================================================================
# API KEYS & AUTHENTICATION
# ============================================================================

# PubMed E-utilities (optional but recommended)
# Register at: https://www.ncbi.nlm.nih.gov/account/
# Benefits: 10 req/sec (vs 3 req/sec without key)
PUBMED_API_KEY=your_api_key_here
PUBMED_EMAIL=your_email@example.com  # Required by NCBI

# Semantic Scholar (optional but highly recommended)
# Register at: https://www.semanticscholar.org/product/api
# Benefits: 100 req/sec (vs 1 req/sec without key)
SEMANTIC_SCHOLAR_API_KEY=your_api_key_here

# Zotero (required for reference management)
# Register at: https://www.zotero.org/settings/keys
ZOTERO_API_KEY=your_api_key_here
ZOTERO_LIBRARY_ID=12345  # Your user ID or group ID
ZOTERO_LIBRARY_TYPE=user  # "user" or "group"

# ============================================================================
# FEATURE FLAGS
# ============================================================================

# Toggle between real and mock implementations (for testing)
PUBMED_USE_MOCK=false
SEMANTIC_SCHOLAR_USE_MOCK=false
ZOTERO_USE_MOCK=false

# ============================================================================
# RATE LIMITING & PERFORMANCE
# ============================================================================

# Cache TTL (seconds)
CACHE_TTL=3600  # 1 hour

# Request timeout (milliseconds)
API_TIMEOUT=30000  # 30 seconds

# Max retries for failed requests
MAX_RETRIES=3

# ============================================================================
# LOGGING
# ============================================================================

LOG_LEVEL=info  # debug, info, warn, error
LOG_FORMAT=json  # json or text
```

---

**Report Prepared By:** MedResearch-AI Development Team  
**Report Version:** 1.0  
**Last Updated:** December 13, 2025

---

*This report provides comprehensive research on API integration options for MedResearch-AI. All recommendations are based on current API availability, documentation, and best practices as of December 2025.*
