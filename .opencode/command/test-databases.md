---
description: Test database integrations for MedResearch-AI project
---

# Test Database Integrations

Test all database integrations including PubMed, Europe PMC, Semantic Scholar, The Lens, ClinicalTrials.gov, CrossRef, and Unpaywall.

## Usage

Just type `/test-databases`

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Builds the project if needed
3. Runs `npm run test:databases`
4. Tests each database integration
5. Reports results for each database
6. Shows overall success/failure

## Example

```
User: /test-databases
Assistant: Testing MedResearch-AI database integrations...

Building project...
✅ Build successful

Testing databases:

1. PubMed
   ✅ Connection: OK
   ✅ Search query: OK (returned 150 results)
   ✅ Article retrieval: OK
   ✅ Metadata parsing: OK
   Duration: 2.3s

2. Europe PMC
   ✅ Connection: OK
   ✅ Search query: OK (returned 200 results)
   ✅ Preprint support: OK
   Duration: 1.8s

3. Semantic Scholar
   ✅ Connection: OK
   ✅ Search query: OK (returned 180 results)
   ✅ Citation data: OK
   Duration: 2.1s

4. The Lens
   ✅ Connection: OK
   ✅ Search query: OK (returned 95 results)
   ✅ Patent data: OK
   Duration: 2.5s

5. ClinicalTrials.gov
   ✅ Connection: OK
   ✅ Trial search: OK (returned 45 trials)
   ✅ Status filtering: OK
   Duration: 1.9s

6. CrossRef
   ✅ Connection: OK
   ✅ DOI lookup: OK
   ✅ Metadata retrieval: OK
   Duration: 1.6s

7. Unpaywall
   ✅ Connection: OK
   ✅ OA status check: OK
   ✅ PDF link retrieval: OK
   Duration: 1.4s

Test Summary:
  Total databases: 7
  Passed: 7
  Failed: 0
  Total duration: 13.6s

✅ All database integrations working!
```

## Databases Tested

### 1. PubMed
- NCBI PubMed search
- Article metadata retrieval
- MeSH term handling
- Date filtering

### 2. Europe PMC
- European PubMed Central search
- Preprint inclusion
- Full-text availability
- Citation data

### 3. Semantic Scholar
- Academic paper search
- Citation graph
- Author information
- Field of study filtering

### 4. The Lens
- Scholarly works search
- Patent data integration
- Open access filtering
- Source type filtering

### 5. ClinicalTrials.gov
- Clinical trial search
- Status filtering
- Phase filtering
- Study type filtering

### 6. CrossRef
- DOI resolution
- Metadata retrieval
- Publication type filtering
- Full-text links

### 7. Unpaywall
- Open access status
- PDF link retrieval
- Repository information
- License data

## When to Use

- After updating database integrations
- Testing API connectivity
- Verifying API keys
- Troubleshooting search issues
- Before running systematic reviews
- Regular health checks

## Common Issues

### API Key Errors
```
❌ PubMed: API key not configured
Fix: Add PUBMED_API_KEY to .env file
```

### Network Errors
```
❌ Semantic Scholar: Connection timeout
Fix: Check internet connection and firewall
```

### Rate Limiting
```
⚠️ CrossRef: Rate limit exceeded
Fix: Wait 60 seconds or use API key
```

## Related Commands

- `/test-med` - Run all tests
- `/test-plagiarism` - Test plagiarism detection
- `/test-meta` - Test meta-analysis tools
- `/med-build` - Build project

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
