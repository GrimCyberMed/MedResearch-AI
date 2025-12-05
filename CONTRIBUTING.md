# Contributing to MedResearch AI

Thank you for your interest in contributing to MedResearch AI! This document provides guidelines for contributing to the project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation](#documentation)
8. [Pull Request Process](#pull-request-process)
9. [Issue Reporting](#issue-reporting)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, trolling, or insulting comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Git
- TypeScript knowledge
- Understanding of systematic reviews (helpful)

### First-Time Contributors

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Make your changes**
5. **Test thoroughly**
6. **Submit a pull request**

---

## 💻 Development Setup

### 1. Clone the Repository

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/MedResearch-AI.git
cd MedResearch-AI

# Add upstream remote
git remote add upstream https://github.com/GrimCyberMed/MedResearch-AI.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
```

### 4. Build Project

```bash
npm run build
```

### 5. Run Tests

```bash
npm test
```

---

## 🔧 How to Contribute

### Types of Contributions

We welcome various types of contributions:

1. **Bug Fixes** - Fix issues in existing code
2. **New Features** - Add new MCP tools or functionality
3. **Documentation** - Improve or add documentation
4. **Tests** - Add or improve test coverage
5. **Performance** - Optimize existing code
6. **Refactoring** - Improve code quality

### Contribution Workflow

1. **Check existing issues** - See if someone is already working on it
2. **Create an issue** - Discuss your idea before starting
3. **Fork and branch** - Create a feature branch
4. **Develop** - Write code following our standards
5. **Test** - Ensure all tests pass
6. **Document** - Update relevant documentation
7. **Submit PR** - Create a pull request

---

## 📝 Coding Standards

### TypeScript Style Guide

```typescript
// Use explicit types
function calculateScore(value: number): number {
  return value * 2;
}

// Use interfaces for objects
interface StudyData {
  id: string;
  title: string;
  year: number;
}

// Use async/await for promises
async function fetchData(): Promise<StudyData> {
  const response = await fetch(url);
  return response.json();
}

// Use descriptive names
const isValidCitation = true; // Good
const x = true; // Bad

// Add JSDoc comments
/**
 * Calculate the relevance score for a citation
 * @param citation - Citation to score
 * @param criteria - Scoring criteria
 * @returns Relevance score (0-1)
 */
function calculateRelevance(citation: Citation, criteria: Criteria): number {
  // Implementation
}
```

### File Organization

```
src/
├── mcp/
│   ├── tools/           # MCP tool implementations
│   │   ├── tool-name.ts
│   │   └── ...
│   └── index.ts         # MCP server
├── common/              # Shared utilities
│   ├── logger.ts
│   ├── cache.ts
│   └── validation.ts
└── types/               # Type definitions
    └── index.ts
```

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `nlp-data-extraction.ts`)
- **Functions**: `camelCase` (e.g., `extractDataNLP`)
- **Interfaces**: `PascalCase` (e.g., `ExtractDataNLPInput`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Private variables**: `_camelCase` (e.g., `_internalCache`)

### Code Quality

- **No `any` types** - Use proper TypeScript types
- **Error handling** - Always use try-catch for async operations
- **Logging** - Use Winston logger for all operations
- **Input validation** - Validate all inputs
- **Performance** - Consider performance implications
- **Security** - Never expose API keys or secrets

---

## 🧪 Testing Guidelines

### Test Structure

```typescript
// tests/test-tool-name.js
import { toolFunction } from '../src/mcp/tools/tool-name.js';

describe('Tool Name Tests', () => {
  test('should handle valid input', async () => {
    const input = { /* test data */ };
    const result = await toolFunction(input);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('should handle invalid input', async () => {
    const input = { /* invalid data */ };
    const result = await toolFunction(input);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('should meet performance target', async () => {
    const start = Date.now();
    await toolFunction(validInput);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // 5s target
  });
});
```

### Test Coverage

- **Unit tests** - Test individual functions
- **Integration tests** - Test tool interactions
- **Performance tests** - Verify performance targets
- **Error handling** - Test error scenarios

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test-tool-name.js

# Run with coverage
npm test -- --coverage
```

---

## 📚 Documentation

### Documentation Requirements

All contributions must include:

1. **Code comments** - JSDoc for all public functions
2. **README updates** - If adding features
3. **API documentation** - For new tools
4. **Examples** - Usage examples for new features

### Documentation Style

```typescript
/**
 * Extract PICO elements from research question
 * 
 * @param input - Extraction input parameters
 * @param input.text - Research question or abstract text
 * @param input.generate_search_terms - Generate search terms (default: true)
 * @returns Extraction result with PICO elements
 * 
 * @example
 * ```typescript
 * const result = await extractPICO({
 *   text: "Does aspirin reduce cardiovascular events in adults?",
 *   generate_search_terms: true
 * });
 * ```
 */
export async function extractPICO(
  input: ExtractPICOInput
): Promise<ExtractPICOOutput> {
  // Implementation
}
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] Commit messages are clear
- [ ] Branch is up to date with master

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Performance impact considered

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks** - CI/CD runs tests
2. **Code review** - Maintainers review code
3. **Feedback** - Address review comments
4. **Approval** - Get approval from maintainers
5. **Merge** - Maintainers merge PR

### Commit Message Format

```
type(scope): brief description

Detailed description of changes

Fixes #123
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Examples**:
```
feat(nlp): add PICO extraction tool

Implements automated PICO element extraction from research questions
using pattern matching and NLP techniques.

Closes #45
```

---

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Actual behavior**
What actually happened

**Environment**
- OS: [e.g., Windows 11]
- Node.js version: [e.g., v20.0.0]
- MedResearch AI version: [e.g., v5.1.0]

**Additional context**
Any other relevant information
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired solution

**Describe alternatives you've considered**
Alternative solutions considered

**Additional context**
Any other relevant information
```

---

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## 📞 Getting Help

- **Documentation**: Check [README.md](./README.md) and [docs/](./docs/)
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers (if applicable)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You

Thank you for contributing to MedResearch AI! Your contributions help researchers worldwide conduct better systematic reviews.

---

**Last Updated**: December 5, 2025  
**Version**: 1.0  
**Maintainers**: @GrimCyberMed
