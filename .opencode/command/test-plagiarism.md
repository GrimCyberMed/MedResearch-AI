---
description: Test plagiarism detection for MedResearch-AI project
---

# Test Plagiarism Detection

Test the plagiarism detection system including document comparison, similarity detection, and citation checking.

## Usage

Just type `/test-plagiarism`

## What This Command Does

1. Navigates to MedResearch-AI project directory: `C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
2. Builds the project if needed
3. Runs `npm run test:plagiarism`
4. Tests plagiarism detection algorithms
5. Verifies similarity thresholds
6. Reports test results

## Example

```
User: /test-plagiarism
Assistant: Testing MedResearch-AI plagiarism detection...

Building project...
✅ Build successful

Running plagiarism detection tests:

1. Document Comparison
   ✅ Identical documents: 100% similarity detected
   ✅ Similar documents: 85% similarity detected
   ✅ Different documents: 5% similarity detected
   ✅ Shingle size optimization: OK
   Duration: 1.2s

2. Similarity Detection
   ✅ Jaccard similarity: OK
   ✅ Cosine similarity: OK
   ✅ Threshold detection (15%): OK
   ✅ Partial matching: OK
   Duration: 0.8s

3. Citation Checking
   ✅ Proper citations: Not flagged
   ✅ Missing citations: Flagged correctly
   ✅ Self-plagiarism: Detected
   ✅ Paraphrasing: Detected
   Duration: 1.5s

4. Database Integration
   ✅ PubMed comparison: OK
   ✅ Europe PMC comparison: OK
   ✅ Semantic Scholar comparison: OK
   Duration: 2.3s

5. Performance Tests
   ✅ Small documents (<1000 words): <100ms
   ✅ Medium documents (1000-5000 words): <500ms
   ✅ Large documents (>5000 words): <2s
   ✅ Batch processing: OK
   Duration: 3.1s

Test Summary:
  Total tests: 18
  Passed: 18
  Failed: 0
  Total duration: 8.9s

✅ All plagiarism detection tests passed!
```

## Features Tested

### Document Comparison
- Shingle-based comparison
- Configurable shingle size (2-20)
- Similarity percentage calculation
- Threshold detection

### Similarity Algorithms
- Jaccard similarity coefficient
- Cosine similarity
- Levenshtein distance
- N-gram matching

### Citation Verification
- Proper citation detection
- Missing citation flagging
- Self-plagiarism detection
- Paraphrasing detection

### Database Comparison
- Compare against PubMed articles
- Compare against Europe PMC
- Compare against Semantic Scholar
- Batch comparison support

### Performance Metrics
- Processing speed by document size
- Memory usage optimization
- Batch processing efficiency
- Cache effectiveness

## When to Use

- After updating plagiarism detection code
- Testing new similarity algorithms
- Verifying threshold accuracy
- Performance optimization
- Before processing large document sets
- Quality assurance checks

## Test Cases

### Positive Cases (Should Detect)
- Identical text
- High similarity (>80%)
- Missing citations
- Self-plagiarism
- Paraphrased content

### Negative Cases (Should Not Flag)
- Properly cited quotes
- Common phrases
- Low similarity (<15%)
- Different topics
- Original content

## Common Issues

### False Positives
```
⚠️ Common phrases flagged as plagiarism
Fix: Adjust similarity threshold or add exclusions
```

### Performance Issues
```
⚠️ Large documents taking too long
Fix: Optimize shingle size or use batch processing
```

### Database Connectivity
```
❌ Cannot compare against PubMed
Fix: Check API keys and network connection
```

## Related Commands

- `/test-med` - Run all tests
- `/test-databases` - Test database integrations
- `/test-meta` - Test meta-analysis tools
- `/med-build` - Build project

## Project Path

`C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI`
