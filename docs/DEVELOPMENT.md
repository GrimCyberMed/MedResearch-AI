# Development Guide

Complete guide for developers working on MedResearch AI.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- **VSCode** (recommended)
- **R** (optional, for meta-analysis features)

### Initial Setup

```bash
# Clone repository
cd C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm run test:all
```

### Environment Variables

Create `.env` file in project root:

```env
# Optional: PubMed API Key (increases rate limit from 3 to 10 req/sec)
PUBMED_API_KEY=your_key_here

# Optional: Semantic Scholar API Key (increases rate limit)
SEMANTIC_SCHOLAR_API_KEY=your_key_here

# Optional: The Lens API Token
LENS_API_TOKEN=your_token_here

# Optional: Log Level (debug, info, warn, error)
LOG_LEVEL=info

# Optional: Node Environment
NODE_ENV=development
```

---

## Project Structure

```
MedResearch-AI/
├── src/                          # Source code
│   ├── common/                   # Shared utilities
│   │   ├── logger.ts            # Winston logging
│   │   ├── cache.ts             # NodeCache caching
│   │   ├── retry.ts             # Retry logic
│   │   └── validation.ts        # Zod schemas
│   └── mcp/                      # MCP server
│       ├── index.ts             # Server entry point
│       ├── README.md            # MCP documentation
│       └── tools/               # MCP tools
│           ├── medical-databases.ts
│           ├── semantic-scholar.ts
│           ├── lens.ts
│           ├── clinicaltrials.ts
│           ├── crossref.ts
│           ├── unpaywall.ts
│           ├── plagiarism-detection.ts
│           ├── plagiarism-database-integration.ts
│           ├── r-statistics.ts
│           ├── citation-manager.ts
│           └── document-generator.ts
├── tests/                        # Test files
│   ├── test-databases.js
│   ├── test-plagiarism.js
│   ├── test-meta-analysis.js
│   ├── test-mcp-tools.js
│   ├── test-memory.js
│   ├── test-agents.js
│   └── dashboard.js             # Test dashboard
├── docs/                         # Documentation
│   ├── CHANGELOG.md
│   ├── DEVELOPMENT.md           # This file
│   ├── TESTING.md
│   ├── GUIDES.md
│   └── archive/                 # Old session files
├── assets/                       # Images, plots
├── logs/                         # Runtime logs
│   ├── combined.log
│   └── error.log
├── .memory/                      # Runtime memory
│   └── project-memory.db
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit TypeScript files in `src/` directory.

### 3. Build

```bash
npm run build
```

### 4. Test

```bash
# Run all tests
npm run test:all

# Run specific test
npm run test:databases
npm run test:plagiarism
npm run test:meta
```

### 5. Lint & Format

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### 6. Commit

```bash
git add .
git commit -m "feat: your feature description"
```

### 7. Push

```bash
git push origin feature/your-feature-name
```

---

## Code Standards

### TypeScript

- **Strict mode enabled** - All type errors must be resolved
- **No `any` types** - Use proper types or `unknown`
- **Interfaces over types** - Prefer interfaces for object shapes
- **Async/await** - Use async/await instead of promises

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `medical-databases.ts`)
- **Classes**: `PascalCase` (e.g., `MemoryManager`)
- **Functions**: `camelCase` (e.g., `searchPubMed`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Interfaces**: `PascalCase` (e.g., `SearchResult`)

### Code Organization

```typescript
// 1. Imports
import { logger } from '../../common/logger.js';
import { defaultCache } from '../../common/cache.js';

// 2. Interfaces/Types
interface SearchArgs {
  query: string;
  max_results?: number;
}

// 3. Constants
const DEFAULT_MAX_RESULTS = 100;

// 4. Helper functions (private)
async function httpsRequest(url: string): Promise<string> {
  // ...
}

// 5. Exported functions (public)
export async function searchDatabase(args: SearchArgs) {
  // ...
}
```

### Error Handling

```typescript
try {
  // Operation
  const result = await operation();
  logger.info('Operation completed', { duration });
  return result;
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error('Operation failed', { error: errorMessage, duration });
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ success: false, error: errorMessage }, null, 2)
    }],
    isError: true
  };
}
```

### Logging

```typescript
import { logger } from '../../common/logger.js';

// Info logging
logger.info('Operation started', { query, maxResults });

// Error logging
logger.error('Operation failed', { error: error.message, duration });

// Debug logging
logger.debug('Cache hit', { cacheKey });

// Warning logging
logger.warn('Rate limit approaching', { remaining: 10 });
```

### Caching

```typescript
import { defaultCache, generateCacheKey } from '../../common/cache.js';

// Generate cache key
const cacheKey = generateCacheKey('prefix', { param1, param2 });

// Check cache
const cached = defaultCache.get(cacheKey);
if (cached) return cached as any;

// Set cache (5 minutes TTL)
defaultCache.set(cacheKey, response, 300);
```

### Validation

```typescript
import { DatabaseSchemas, validateSafe } from '../../common/validation.js';

// Validate input
const validation = validateSafe(DatabaseSchemas.pubmedSearch, args);
if (!validation.success) {
  logger.warn('Validation failed', { error: validation.error });
  return errorResponse(validation.error);
}

// Use validated data
const { query, max_results } = validation.data;
```

---

## Testing

### Running Tests

```bash
# All tests
npm run test:all

# Database tests
npm run test:databases

# Plagiarism tests
npm run test:plagiarism

# Meta-analysis tests
npm run test:meta

# Test dashboard (interactive)
npm run dashboard
```

### Writing Tests

Create test file in `tests/` directory:

```javascript
// tests/test-your-feature.js
import { searchPubMed } from '../src/mcp/tools/medical-databases.js';

async function testYourFeature() {
  console.log('Testing your feature...');
  
  try {
    const result = await searchPubMed({
      query: 'test query',
      max_results: 5
    });
    
    const data = JSON.parse(result.content[0].text);
    
    if (data.success && data.results.length > 0) {
      console.log('✅ PASSED');
    } else {
      console.log('❌ FAILED');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

testYourFeature();
```

### Test Coverage

Aim for:
- **Unit tests**: 80%+ coverage
- **Integration tests**: All MCP tools
- **E2E tests**: Critical workflows

---

## Debugging

### VSCode Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/tests/test-databases.js",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug MCP Server",
      "program": "${workspaceFolder}/src/mcp/index.ts",
      "preLaunchTask": "npm: build",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Logging Levels

Set `LOG_LEVEL` in `.env`:

```env
# Development
LOG_LEVEL=debug

# Production
LOG_LEVEL=info
```

### View Logs

```bash
# Error logs only
cat logs/error.log

# All logs
cat logs/combined.log

# Follow logs in real-time
tail -f logs/combined.log
```

### Cache Debugging

```typescript
import { getCacheStats, clearCache } from '../../common/cache.js';

// View cache statistics
console.log(getCacheStats());
// { hits: 1234, misses: 567, hitRate: 68.5, keys: 42 }

// Clear cache
clearCache();
```

---

## Common Tasks

### Adding a New Database Tool

1. **Create tool file** in `src/mcp/tools/`:

```typescript
// src/mcp/tools/your-database.ts
import { logger } from '../../common/logger.js';
import { defaultCache, generateCacheKey } from '../../common/cache.js';
import { withRetry } from '../../common/retry.js';

export async function searchYourDatabase(args: { query: string }) {
  const startTime = Date.now();
  const { query } = args;
  
  // Generate cache key
  const cacheKey = generateCacheKey('yourdb', { query });
  
  // Check cache
  const cached = defaultCache.get(cacheKey);
  if (cached) {
    logger.info('Cache hit', { query });
    return cached as any;
  }
  
  logger.info('Search started', { query });
  
  try {
    // Your search logic here
    const results = await fetchFromAPI(query);
    
    const response = {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, results }, null, 2)
      }]
    };
    
    // Cache response
    defaultCache.set(cacheKey, response, 300);
    
    const duration = Date.now() - startTime;
    logger.info('Search completed', { query, count: results.length, duration });
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Search failed', { query, error: error.message, duration });
    return errorResponse(error);
  }
}
```

2. **Add to MCP server** in `src/mcp/index.ts`:

```typescript
// Import
import { searchYourDatabase } from './tools/your-database.js';

// Add to TOOLS array
{
  name: 'search_your_database',
  description: 'Search your database',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' }
    },
    required: ['query']
  }
}

// Add to switch statement
case 'search_your_database':
  return await searchYourDatabase(args as any);
```

3. **Add Zod schema** in `src/common/validation.ts`:

```typescript
export const DatabaseSchemas = {
  // ... existing schemas
  yourDatabaseSearch: z.object({
    query: z.string().min(1, 'Query is required'),
    max_results: z.number().int().positive().max(1000).optional()
  })
};
```

4. **Write tests** in `tests/test-your-database.js`

5. **Update documentation**

### Adding a New Utility

1. Create file in `src/common/`
2. Export functions
3. Add tests
4. Update documentation

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages
npm update

# Rebuild
npm run build

# Test
npm run test:all
```

---

## Troubleshooting

### Build Errors

**Problem**: TypeScript compilation errors

```bash
# Clean build
rm -rf dist/
npm run build
```

**Problem**: Module not found

```bash
# Reinstall dependencies
rm -rf node_modules/
npm install
npm run build
```

### Test Failures

**Problem**: API rate limits

- Add API keys to `.env`
- Increase delays between tests
- Use caching to reduce API calls

**Problem**: Network timeouts

- Check internet connection
- Increase timeout in test files
- Use retry logic

### Cache Issues

**Problem**: Stale cache data

```typescript
import { clearCache } from './src/common/cache.js';
clearCache();
```

**Problem**: Cache not working

- Check cache TTL settings
- Verify cache key generation
- Check memory limits

### Log Issues

**Problem**: Logs not appearing

- Check `LOG_LEVEL` in `.env`
- Verify `logs/` directory exists
- Check file permissions

**Problem**: Log files too large

```bash
# Clear logs
rm logs/*.log*
```

---

## Performance Optimization

### Caching Strategy

- **Short TTL** (1-5 min): Frequently changing data
- **Medium TTL** (5-30 min): Semi-static data
- **Long TTL** (30+ min): Static data

### Retry Strategy

- **Transient errors**: Retry with backoff
- **Permanent errors**: Fail fast
- **Rate limits**: Exponential backoff with jitter

### Logging Strategy

- **Production**: `info` level, JSON format
- **Development**: `debug` level, colored console
- **Performance**: Log duration for all operations

---

## Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new database integration
fix: resolve cache invalidation bug
docs: update API documentation
test: add unit tests for validation
refactor: simplify retry logic
perf: optimize cache key generation
chore: update dependencies
```

### Branch Naming

```
feature/database-integration
bugfix/cache-invalidation
hotfix/critical-security-issue
docs/api-documentation
```

---

## Resources

### Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Zod Documentation](https://zod.dev/)

### Tools
- [VSCode](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) - API testing
- [Git](https://git-scm.com/)

---

## Support

### Getting Help

1. Check documentation in `docs/`
2. Search existing issues on GitHub
3. Ask in team chat
4. Create new issue with details

### Reporting Bugs

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages
- Environment (OS, Node version)
- Logs from `logs/error.log`

---

*Last Updated: December 4, 2025*
