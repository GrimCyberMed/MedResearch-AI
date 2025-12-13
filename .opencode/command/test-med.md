---
description: Run all tests for MedResearch-AI project
---

# Test MedResearch-AI

Run the complete testing suite for the MedResearch-AI project including database tests, plagiarism detection, and meta-analysis tools.

## Usage

Just type `/test-med`

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Runs TypeScript build: `npm run build`
3. Runs all tests: `npm run test:all`
4. Reports test results
5. Shows any failures with details
6. Provides recommendations if tests fail

## Example

```
User: /test-med
Assistant: Running MedResearch-AI test suite...

Step 1/3: Building TypeScript...
✅ Build successful (3.2s)

Step 2/3: Testing database integrations...
✅ PubMed integration: PASSED
✅ Europe PMC integration: PASSED
✅ Semantic Scholar integration: PASSED
✅ The Lens integration: PASSED
✅ ClinicalTrials.gov integration: PASSED
✅ CrossRef integration: PASSED
✅ Unpaywall integration: PASSED

Step 3/3: Testing plagiarism detection...
✅ Document comparison: PASSED
✅ Similarity detection: PASSED
✅ Citation checking: PASSED

Test Summary:
  Total tests: 15
  Passed: 15
  Failed: 0
  Duration: 12.5s

✅ All tests passed!
```

## Test Coverage

### Database Integration Tests
- PubMed search and retrieval
- Europe PMC search
- Semantic Scholar API
- The Lens search
- ClinicalTrials.gov queries
- CrossRef metadata
- Unpaywall access

### Plagiarism Detection Tests
- Document similarity comparison
- Shingle-based detection
- Citation verification
- Self-plagiarism checking

### Meta-Analysis Tests
- Statistical calculations
- Forest plot generation
- Heterogeneity analysis
- Publication bias detection

## When to Use

- After making code changes
- Before committing changes
- After pulling updates
- After restoring from backup
- Before deployment
- Regular quality checks

## If Tests Fail

The command will:
1. Show which tests failed
2. Display error messages
3. Provide stack traces
4. Suggest fixes
5. Recommend rollback if needed

Example failure handling:
```
❌ Test failed: PubMed integration
Error: API key not configured
Location: src/mcp/tools/pubmed-search.ts:45

Recommendations:
1. Check .env file for PUBMED_API_KEY
2. Verify API key is valid
3. Check network connectivity
4. Review recent changes to pubmed-search.ts

Would you like to rollback recent changes? (yes/no)
```

## Related Commands

- `/test-databases` - Test only database integrations
- `/test-plagiarism` - Test only plagiarism detection
- `/test-meta` - Test only meta-analysis tools
- `/med-build` - Build without testing
- `/rollback` - Rollback if tests fail

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
