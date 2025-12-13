---
description: Build the MedResearch-AI project
---

# Build MedResearch-AI

Compile the MedResearch-AI TypeScript project and verify build success.

## Usage

Just type `/med-build`

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Runs `npm run build`
3. Compiles all TypeScript files
4. Reports compilation results
5. Shows any errors or warnings
6. Verifies output files

## Example

```
User: /med-build
Assistant: Building MedResearch-AI project...

Compiling TypeScript files...

src/common/logger.ts
src/common/enhanced-logger.ts
src/common/validation.ts
src/common/cache.ts
src/common/retry.ts
src/common/restore-point-manager.ts
src/common/command-manager.ts
src/mcp/index.ts
src/mcp/tools/pubmed-search.ts
src/mcp/tools/europepmc-search.ts
... (46 more files)

✅ Build successful!

Compilation Summary:
  Files compiled: 53
  Errors: 0
  Warnings: 0
  Duration: 3.2s
  Output: dist/

Generated files:
  dist/common/*.js (7 files)
  dist/mcp/*.js (47 files)
  dist/mcp/tools/*.js (46 files)

Next steps:
  - Run /test-med to verify functionality
  - Use /monitor-errors to check for runtime issues
  - Create restore point: /create-restore
```

## Build Process

### 1. Type Checking
- Validates TypeScript types
- Checks for type errors
- Ensures type safety

### 2. Compilation
- Transpiles TypeScript to JavaScript
- Generates source maps
- Preserves module structure

### 3. Output Generation
- Creates `dist/` directory
- Maintains folder structure
- Generates `.js` and `.d.ts` files

## When to Use

- After making code changes
- Before running tests
- After pulling updates
- Before deployment
- Verifying code compiles
- Troubleshooting type errors

## Common Build Errors

### Type Errors
```
❌ Error TS2339: Property 'foo' does not exist on type 'Bar'
  Location: src/mcp/tools/example.ts:45
  
Fix: Add property to type definition or use type assertion
```

### Import Errors
```
❌ Error TS2307: Cannot find module './missing-file'
  Location: src/common/index.ts:12
  
Fix: Check file path and ensure file exists
```

### Syntax Errors
```
❌ Error TS1005: ';' expected
  Location: src/mcp/tools/example.ts:23
  
Fix: Add missing semicolon or check syntax
```

## Build Modes

### Development Build (default)
```
/med-build
```
- Source maps included
- No minification
- Fast compilation

### Production Build
```
User: Build for production
Assistant: Running production build...
npm run build -- --mode production
```
- Optimized output
- Minified code
- No source maps

## Build Output

```
dist/
├── common/
│   ├── logger.js
│   ├── enhanced-logger.js
│   ├── validation.js
│   ├── cache.js
│   ├── retry.js
│   ├── restore-point-manager.js
│   └── command-manager.js
└── mcp/
    ├── index.js
    └── tools/
        ├── pubmed-search.js
        ├── europepmc-search.js
        └── ... (44 more files)
```

## Cleaning Build

To clean build artifacts:
```
User: Clean build directory
Assistant: Removing dist/ directory...
✅ Build directory cleaned
```

## Related Commands

- `/test-med` - Run tests after building
- `/med-status` - Check project health
- `/create-restore` - Create restore point before build
- `/monitor-errors` - Monitor for build issues

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
