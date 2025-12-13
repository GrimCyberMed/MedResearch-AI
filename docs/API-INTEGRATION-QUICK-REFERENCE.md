# API Integration Quick Reference Guide

**Quick Start Guide for Implementing Real APIs in MedResearch-AI**

---

## TL;DR - Executive Summary

**Status:** 4 out of 7 APIs are production-ready with free access  
**Total Cost:** $0/month for all APIs  
**Development Time:** 2-3 weeks  
**Priority:** Start with PubMed (1-2 days) and Semantic Scholar enhancement (1 day)

---

## Quick Comparison Table

| API | Status | Free? | Rate Limit | Priority | Effort |
|-----|--------|-------|------------|----------|--------|
| **PubMed** | ✅ Ready | Yes | 3/sec (10 with key) | ⭐⭐⭐⭐⭐ | 1-2 days |
| **Semantic Scholar** | ✅ Implemented | Yes | 1/sec (100 with key) | ⭐⭐⭐⭐ | 1 day |
| **Europe PMC** | ✅ Partial | Yes | 10/sec | ⭐⭐⭐ | 1-2 days |
| **Zotero** | ⚠️ OAuth needed | Yes | 10/sec | ⭐⭐⭐⭐ | 3-4 days |
| **Cochrane** | ❌ No API | N/A | N/A | ⭐ | Keep mock |
| **PROSPERO** | ❌ No API | N/A | N/A | ⭐⭐ | Keep validation |
| **Mendeley** | ❌ Deprecated | N/A | N/A | - | Remove |

---

## 5-Minute Action Plan

### Step 1: Register for API Keys (15 minutes)

```bash
# PubMed (optional but recommended)
https://www.ncbi.nlm.nih.gov/account/
→ Increases rate limit from 3/sec to 10/sec

# Semantic Scholar (highly recommended)
https://www.semanticscholar.org/product/api
→ Increases rate limit from 1/sec to 100/sec (100x!)

# Zotero (required for integration)
https://www.zotero.org/settings/keys
→ Required for reference management
```

### Step 2: Update .env File

```bash
# Add to .env
PUBMED_API_KEY=your_key_here
PUBMED_EMAIL=your_email@example.com
SEMANTIC_SCHOLAR_API_KEY=your_key_here
ZOTERO_API_KEY=your_key_here
ZOTERO_LIBRARY_ID=12345
ZOTERO_LIBRARY_TYPE=user
```

### Step 3: Install Dependencies

```bash
# For Zotero integration
npm install zotero-sync

# Already have these:
# - fast-xml-parser (for PubMed XML)
# - node-cache (for caching)
```

### Step 4: Implement (Priority Order)

1. **Week 1:** PubMed + Semantic Scholar
2. **Week 2-3:** Zotero + Europe PMC
3. **Week 4:** Testing + Documentation

---

## Code Template: PubMed E-utilities

**File:** `src/mcp/tools/integrate-pubmed-api.ts`

```typescript
import https from 'https';
import { XMLParser } from 'fast-xml-parser';

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const API_KEY = process.env.PUBMED_API_KEY || '';

export async function searchPubMed(params: PubMedSearchParams) {
  // 1. ESearch - Get PMIDs
  const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${params.query}&retmode=json&api_key=${API_KEY}`;
  const searchData = await httpsRequest(searchUrl);
  const pmids = JSON.parse(searchData).esearchresult.idlist;
  
  // 2. EFetch - Get article details
  const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml&api_key=${API_KEY}`;
  const xmlData = await httpsRequest(fetchUrl);
  
  // 3. Parse XML
  const parser = new XMLParser();
  const articles = parser.parse(xmlData);
  
  return { articles, total: pmids.length };
}
```

---

## Code Template: Semantic Scholar Enhancement

**File:** `src/mcp/tools/semantic-scholar.ts`

```typescript
// Add API key support (ONE LINE CHANGE!)
const headers = {
  'User-Agent': 'MedResearch-AI/6.0.0',
  ...(process.env.SEMANTIC_SCHOLAR_API_KEY && {
    'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY
  })
};
```

---

## Code Template: Zotero Integration

**File:** `src/mcp/tools/integrate-reference-manager.ts`

```typescript
import { Zotero } from 'zotero-sync';

const client = new Zotero({
  apiKey: process.env.ZOTERO_API_KEY,
  libraryID: process.env.ZOTERO_LIBRARY_ID,
  libraryType: process.env.ZOTERO_LIBRARY_TYPE,
});

export async function importFromZotero() {
  const items = await client.items().get({ limit: 100 });
  return items.map(transformZoteroItem);
}
```

---

## Rate Limits Quick Reference

| API | Without Key | With Key | Get Key At |
|-----|------------|----------|------------|
| PubMed | 3/sec | 10/sec | ncbi.nlm.nih.gov/account |
| Semantic Scholar | 1/sec | 100/sec | semanticscholar.org/product/api |
| Europe PMC | 10/sec | 10/sec | No key needed |
| Zotero | 10/sec | 10/sec | zotero.org/settings/keys |

---

## Testing Checklist

```bash
# Unit tests
npm test

# Integration tests (requires API keys)
PUBMED_API_KEY=xxx npm run test:integration

# Rate limit tests
npm run test:rate-limits

# End-to-end workflow tests
npm run test:e2e
```

---

## Common Issues & Solutions

### Issue 1: Rate Limit Exceeded

**Error:** `HTTP 429: Too Many Requests`

**Solution:**
```typescript
// Add rate limiter
const RATE_LIMIT_MS = API_KEY ? 100 : 334; // 10/sec or 3/sec
await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
```

### Issue 2: XML Parsing Errors

**Error:** `Unexpected token < in JSON`

**Solution:**
```typescript
// Use XMLParser instead of JSON.parse
import { XMLParser } from 'fast-xml-parser';
const parser = new XMLParser();
const result = parser.parse(xmlData);
```

### Issue 3: Zotero OAuth Errors

**Error:** `Invalid API key`

**Solution:**
- Verify key at https://www.zotero.org/settings/keys
- Check permissions (read + write library)
- Ensure correct library ID and type

---

## Performance Optimization

```typescript
// 1. Cache results (1 hour TTL)
import { cache } from '../../common/cache.js';
const cached = cache.get(cacheKey);
if (cached) return cached;

// 2. Batch operations
const pmids = ['12345', '67890', '11111'];
const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}`;

// 3. Retry with exponential backoff
const result = await retryWithBackoff(
  () => searchPubMed(params),
  { maxRetries: 3, baseDelay: 1000 }
);
```

---

## Migration Checklist

- [ ] Register API keys
- [ ] Update .env file
- [ ] Install dependencies (zotero-sync)
- [ ] Implement PubMed E-utilities
- [ ] Enhance Semantic Scholar
- [ ] Implement Zotero integration
- [ ] Remove Mendeley code
- [ ] Write tests
- [ ] Update documentation
- [ ] Test rate limiting
- [ ] Deploy to production

---

## Support & Resources

**Documentation:**
- Full report: `docs/API-INTEGRATION-RESEARCH-REPORT.md`
- PubMed docs: https://www.ncbi.nlm.nih.gov/books/NBK25501/
- Semantic Scholar docs: https://api.semanticscholar.org/api-docs/
- Zotero docs: https://www.zotero.org/support/dev/web_api/v3/start

**Get Help:**
- PubMed: https://support.nlm.nih.gov/
- Semantic Scholar: https://www.semanticscholar.org/faq
- Zotero: https://forums.zotero.org/

---

## Next Steps

1. **Read full report:** `docs/API-INTEGRATION-RESEARCH-REPORT.md`
2. **Register for API keys** (15 minutes)
3. **Start with PubMed** (highest priority, 1-2 days)
4. **Test thoroughly** before moving to next API
5. **Document as you go** for future reference

---

**Last Updated:** December 13, 2025  
**Version:** 1.0
