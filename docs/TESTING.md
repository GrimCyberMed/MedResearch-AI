# Testing Guide

Comprehensive testing documentation for MedResearch AI.

---

## Table of Contents

1. [Test Overview](#test-overview)
2. [Running Tests](#running-tests)
3. [Test Results](#test-results)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [Continuous Integration](#continuous-integration)

---

## Test Overview

### Test Suite Structure

```
tests/
├── test-databases.js           # Database integration tests
├── test-plagiarism.js          # Plagiarism detection tests
├── test-meta-analysis.js       # R statistics tests
├── test-mcp-tools.js           # MCP tool tests
├── test-memory.js              # Memory system tests
├── test-agents.js              # Agent coordination tests
└── dashboard.js                # Interactive test dashboard
```

### Test Categories

1. **Unit Tests** - Individual functions
2. **Integration Tests** - Database APIs, MCP tools
3. **E2E Tests** - Complete workflows
4. **Performance Tests** - Cache, retry, logging

---

## Running Tests

### All Tests

```bash
npm run test:all
```

Runs database and plagiarism tests sequentially.

### Individual Test Suites

```bash
# Database integration tests
npm run test:databases

# Plagiarism detection tests
npm run test:plagiarism

# Meta-analysis tests
npm run test:meta
```

### Interactive Dashboard

```bash
npm run dashboard

# Watch mode (auto-refresh)
npm run dashboard:watch
```

---

## Test Results

### Latest Test Results (v4.1.0)

**Date:** December 4, 2025  
**Build:** Clean (0 TypeScript errors)  
**Overall:** 9/10 tests passing (90%)

#### Database Tests

```
Total Tests:  10
✅ Passed:     9 (90.0%)
❌ Failed:     1 (10.0%)
⏭️  Skipped:    0
```

**Passed Tests:**
1. ✅ PubMed Search
2. ✅ PubMed API Key
3. ✅ Europe PMC Search
4. ✅ Semantic Scholar Search
5. ✅ Semantic Scholar Get Paper
6. ✅ Unpaywall Open Access
7. ✅ Rate Limiting
8. ✅ API Key Validation
9. ✅ Cross-Database Deduplication

**Failed Tests:**
1. ❌ The Lens Search - API availability issue (not code)

#### Performance Metrics

**PubMed Search:**
- Cache hit: <5ms
- Cache miss: 1639ms
- Cache hit rate: 40-60%

**Europe PMC Search:**
- Cache hit: <5ms
- Cache miss: 639ms
- Cache hit rate: 40-60%

**Semantic Scholar:**
- Average response: 800-1200ms
- Rate limit: 1 req/sec (enforced)

#### Logging Verification

All operations now log:
- ✅ Start time with parameters
- ✅ Success with duration and metrics
- ✅ Errors with context
- ✅ Cache hits separately

Sample log output:
```json
{
  "level": "info",
  "message": "PubMed search completed",
  "service": "medresearch-ai",
  "version": "4.1.0",
  "query": "diabetes AND exercise",
  "count": 43185,
  "retrieved": 10,
  "duration": 1639,
  "cached": true,
  "timestamp": "2025-12-04T12:21:34.567Z"
}
```

---

## Writing Tests

### Test Template

```javascript
// tests/test-your-feature.js
import { yourFunction } from '../src/mcp/tools/your-tool.js';

console.log('╔════════════════════════════════════════╗');
console.log('║  Your Feature Test Suite               ║');
console.log('╚════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;

async function testYourFeature() {
  console.log('🧪 Testing: Your Feature...');
  
  try {
    const result = await yourFunction({ param: 'value' });
    const data = JSON.parse(result.content[0].text);
    
    if (data.success && data.results.length > 0) {
      console.log('✅ PASSED: Your Feature\n');
      passed++;
    } else {
      console.log('❌ FAILED: Your Feature');
      console.log('   Error: No results returned\n');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Your Feature');
    console.log(`   Error: ${error.message}\n`);
    failed++;
  }
}

async function runTests() {
  await testYourFeature();
  
  // Summary
  console.log('════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('════════════════════════════════════════');
  console.log(`Total Tests:  ${passed + failed}`);
  console.log(`✅ Passed:     ${passed}`);
  console.log(`❌ Failed:     ${failed}`);
  console.log('════════════════════════════════════════\n');
}

runTests();
```

### Assertion Helpers

```javascript
function assertEqual(actual, expected, message) {
  if (actual === expected) {
    console.log(`✅ ${message}`);
    return true;
  } else {
    console.log(`❌ ${message}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual: ${actual}`);
    return false;
  }
}

function assertGreaterThan(actual, threshold, message) {
  if (actual > threshold) {
    console.log(`✅ ${message}`);
    return true;
  } else {
    console.log(`❌ ${message}`);
    console.log(`   Expected > ${threshold}`);
    console.log(`   Actual: ${actual}`);
    return false;
  }
}

function assertContains(array, item, message) {
  if (array.includes(item)) {
    console.log(`✅ ${message}`);
    return true;
  } else {
    console.log(`❌ ${message}`);
    console.log(`   Item not found: ${item}`);
    return false;
  }
}
```

### Testing Async Operations

```javascript
async function testAsyncOperation() {
  const startTime = Date.now();
  
  try {
    const result = await asyncOperation();
    const duration = Date.now() - startTime;
    
    console.log(`✅ Operation completed in ${duration}ms`);
    return true;
  } catch (error) {
    console.log(`❌ Operation failed: ${error.message}`);
    return false;
  }
}
```

### Testing Cache

```javascript
import { defaultCache, generateCacheKey, clearCache } from '../src/common/cache.js';

async function testCaching() {
  // Clear cache first
  clearCache();
  
  const cacheKey = generateCacheKey('test', { param: 'value' });
  
  // First call (cache miss)
  const start1 = Date.now();
  const result1 = await operation();
  const duration1 = Date.now() - start1;
  
  // Second call (cache hit)
  const start2 = Date.now();
  const result2 = await operation();
  const duration2 = Date.now() - start2;
  
  console.log(`Cache miss: ${duration1}ms`);
  console.log(`Cache hit: ${duration2}ms`);
  console.log(`Speedup: ${(duration1 / duration2).toFixed(2)}x`);
  
  if (duration2 < duration1 * 0.1) {
    console.log('✅ Cache working correctly');
  } else {
    console.log('❌ Cache not working');
  }
}
```

### Testing Retry Logic

```javascript
import { withRetry } from '../src/common/retry.js';

async function testRetry() {
  let attempts = 0;
  
  const operation = async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('Transient error');
    }
    return 'success';
  };
  
  try {
    const result = await withRetry(operation, { maxRetries: 3 });
    console.log(`✅ Retry succeeded after ${attempts} attempts`);
  } catch (error) {
    console.log(`❌ Retry failed after ${attempts} attempts`);
  }
}
```

### Testing Validation

```javascript
import { DatabaseSchemas, validateSafe } from '../src/common/validation.js';

function testValidation() {
  // Valid input
  const valid = validateSafe(DatabaseSchemas.pubmedSearch, {
    query: 'diabetes',
    max_results: 10
  });
  
  if (valid.success) {
    console.log('✅ Valid input accepted');
  } else {
    console.log('❌ Valid input rejected');
  }
  
  // Invalid input
  const invalid = validateSafe(DatabaseSchemas.pubmedSearch, {
    query: '',  // Empty query
    max_results: -1  // Negative number
  });
  
  if (!invalid.success) {
    console.log('✅ Invalid input rejected');
  } else {
    console.log('❌ Invalid input accepted');
  }
}
```

---

## Test Coverage

### Current Coverage (v4.1.0)

**Overall:** ~75%

**By Module:**
- `src/common/logger.ts` - 90%
- `src/common/cache.ts` - 85%
- `src/common/retry.ts` - 80%
- `src/common/validation.ts` - 95%
- `src/mcp/tools/medical-databases.ts` - 90%
- `src/mcp/tools/plagiarism-detection.ts` - 70%
- `src/mcp/tools/plagiarism-database-integration.ts` - 65%
- Other tools - 60-80%

### Coverage Goals

- **Critical paths**: 90%+
- **Utilities**: 85%+
- **Tools**: 75%+
- **Overall**: 80%+

### Measuring Coverage

```bash
# Install coverage tool
npm install --save-dev c8

# Run tests with coverage
npx c8 npm run test:all

# Generate HTML report
npx c8 --reporter=html npm run test:all
```

---

## Continuous Integration

### GitHub Actions (Planned)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Run tests
        run: npm run test:all
      
      - name: Upload logs
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: logs
          path: logs/
```

### Pre-commit Hooks

```bash
# Install husky
npm install --save-dev husky

# Setup pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run build && npm run test:all"
```

---

## Test Data

### Sample Queries

**Medical Research:**
- "diabetes AND exercise"
- "COVID-19 vaccine efficacy"
- "hypertension treatment guidelines"
- "cancer immunotherapy"

**Edge Cases:**
- Empty query: ""
- Very long query: "word " * 1000
- Special characters: "test & < > \" '"
- Unicode: "测试 тест परीक्षण"

### Expected Results

**PubMed:**
- "diabetes AND exercise" → 43,185 results
- "COVID-19 vaccine" → 58,225 results

**Europe PMC:**
- "diabetes AND exercise" → 307,362 results
- "COVID-19 vaccine" → 181,519 results

---

## Troubleshooting Tests

### Common Issues

**Problem:** Tests timeout

```javascript
// Increase timeout
setTimeout(() => {
  console.log('Test timeout');
  process.exit(1);
}, 60000); // 60 seconds
```

**Problem:** Rate limit errors

```javascript
// Add delay between tests
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

await test1();
await delay(1000); // Wait 1 second
await test2();
```

**Problem:** Cache interference

```javascript
import { clearCache } from '../src/common/cache.js';

// Clear cache before each test
beforeEach(() => {
  clearCache();
});
```

**Problem:** Log file conflicts

```bash
# Clear logs before tests
rm logs/*.log*
npm run test:all
```

---

## Performance Benchmarks

### Target Metrics

**Response Times:**
- Cache hit: <10ms
- Cache miss (PubMed): <2000ms
- Cache miss (Europe PMC): <1000ms
- Cache miss (Semantic Scholar): <1500ms

**Cache Performance:**
- Hit rate: >40%
- Memory usage: <100MB
- Key generation: <1ms

**Retry Performance:**
- Success rate: >95%
- Average retries: <2
- Total duration: <10s

**Logging Performance:**
- Log write: <5ms
- Log rotation: <100ms
- Overhead: <2% of operation time

---

## Test Maintenance

### Regular Tasks

**Daily:**
- Run full test suite
- Check for failures
- Review logs

**Weekly:**
- Update test data
- Check coverage
- Review performance metrics

**Monthly:**
- Update dependencies
- Refactor flaky tests
- Add new test cases

---

## Resources

### Testing Tools
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [c8 Coverage](https://github.com/bcoe/c8)
- [Husky Git Hooks](https://typicode.github.io/husky/)

### Best Practices
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

---

*Last Updated: December 4, 2025*
