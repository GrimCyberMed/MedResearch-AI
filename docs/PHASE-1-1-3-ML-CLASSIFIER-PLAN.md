# Phase 1.1.3: ML-Based Classifier Implementation Plan

**Status**: In Progress  
**Target Accuracy**: 87%  
**Estimated Time**: 5 days

---

## 🎯 Objective

Implement a machine learning-based study design classifier that achieves 87% accuracy, improving upon the keyword-based classifier's 70% baseline.

---

## 📋 Implementation Approach

### Option 1: Full ML Implementation (Recommended for Production)

**Pros**:
- Highest accuracy (87%+ achievable)
- Learns complex patterns
- Improves with more data

**Cons**:
- Requires large training dataset (1000+ studies per design = 40,000+ total)
- Training time intensive
- Requires Python/scikit-learn for training
- Model deployment complexity

**Steps**:
1. Collect/label 40,000+ studies (15,000 minimum)
2. Train Random Forest in Python
3. Export model to ONNX or JSON
4. Load model in TypeScript for inference
5. Validate on test set

**Timeline**: 2-3 weeks (data collection is bottleneck)

---

### Option 2: Hybrid Rule-Based + Enhanced Keywords (Pragmatic)

**Pros**:
- No training data needed
- Fast implementation (2-3 days)
- Achieves 80-85% accuracy (close to target)
- Easier to maintain and debug

**Cons**:
- Not "true" ML
- May not reach 87% target
- Requires manual keyword tuning

**Steps**:
1. Enhance keyword dictionaries with more terms
2. Add context-aware weighting
3. Implement ensemble voting
4. Add MeSH term matching
5. Improve confidence calibration

**Timeline**: 2-3 days

---

### Option 3: Transfer Learning (Modern Approach)

**Pros**:
- Uses pre-trained models (PubMedBERT, BioBERT)
- Requires less training data (100-500 per design)
- State-of-the-art accuracy (90%+)

**Cons**:
- Requires GPU for inference (slow on CPU)
- Large model size (400MB+)
- Complex deployment
- Requires Python runtime or ONNX

**Steps**:
1. Fine-tune PubMedBERT on study design classification
2. Export to ONNX
3. Load in TypeScript with ONNX Runtime
4. Validate

**Timeline**: 1 week (with pre-trained model)

---

## 🚀 Recommended Path Forward

Given the constraints and timeline, I recommend **Option 2: Hybrid Rule-Based + Enhanced Keywords** for the following reasons:

1. **Pragmatic**: Can be implemented immediately
2. **Effective**: 80-85% accuracy is very good for a rule-based system
3. **Maintainable**: Easy to understand and debug
4. **Extensible**: Can add true ML later (Option 1 or 3) as Phase 1.1.3b

### Enhanced Hybrid Approach

**Components**:

1. **Enhanced Keyword Matching** (already done ✅)
   - 500+ weighted keywords
   - Context-aware matching
   - Exclusion rules

2. **MeSH Term Matching** (NEW)
   - Match against MeSH publication types
   - High confidence boost for MeSH matches

3. **Statistical Method Detection** (NEW)
   - Detect statistical methods (hazard ratio → cohort, odds ratio → case-control)
   - Reporting guideline mentions (CONSORT → RCT, PRISMA → SR)

4. **Ensemble Voting** (NEW)
   - Combine multiple classifiers
   - Keyword classifier (weight: 0.4)
   - MeSH classifier (weight: 0.3)
   - Statistical method classifier (weight: 0.3)

5. **Improved Confidence Calibration** (NEW)
   - Better sigmoid parameters
   - Confidence boosting for high-agreement cases

**Expected Accuracy**: 80-85%

---

## 📊 Implementation Plan (Enhanced Hybrid)

### Day 1: MeSH Term Classifier

**Tasks**:
- Create MeSH term mapping for each study design
- Implement MeSH-based classification
- Test on examples

**Deliverables**:
- `mesh-study-design-classifier.ts`
- MeSH term dictionary

### Day 2: Statistical Method Classifier

**Tasks**:
- Create statistical method patterns
- Implement method-based classification
- Test on examples

**Deliverables**:
- `statistical-method-classifier.ts`
- Statistical method patterns

### Day 3: Ensemble Classifier

**Tasks**:
- Implement weighted voting
- Combine all classifiers
- Tune weights

**Deliverables**:
- Enhanced `HybridClassifier`
- Ensemble voting logic

### Day 4: Confidence Calibration

**Tasks**:
- Improve confidence scoring
- Add agreement-based boosting
- Calibrate thresholds

**Deliverables**:
- Calibrated confidence scores
- Updated thresholds

### Day 5: Testing & Validation

**Tasks**:
- Test on 100+ real studies
- Measure accuracy
- Compare with keyword-only baseline
- Document results

**Deliverables**:
- Test results
- Accuracy report
- Performance comparison

---

## 🎯 Success Criteria

- ✅ Accuracy ≥ 80% (stretch goal: 85%)
- ✅ Confidence scores well-calibrated
- ✅ Faster than 500ms per classification
- ✅ No external dependencies (pure TypeScript)
- ✅ Comprehensive test coverage

---

## 📈 Future Enhancements (Phase 1.1.3b - Optional)

If we need to reach 87%+ accuracy later:

1. **Collect Training Data**
   - Scrape PubMed for labeled studies
   - Use publication type tags as labels
   - Aim for 1000+ per design

2. **Train Random Forest**
   - Use Python/scikit-learn
   - TF-IDF + additional features
   - Export to ONNX

3. **Deploy Model**
   - Load ONNX model in TypeScript
   - Use for inference
   - Fall back to hybrid if model fails

---

## 💬 Decision Point

**Question**: Should we proceed with:
- **Option A**: Enhanced Hybrid (2-3 days, 80-85% accuracy) ← **RECOMMENDED**
- **Option B**: Full ML (2-3 weeks, 87%+ accuracy)
- **Option C**: Transfer Learning (1 week, 90%+ accuracy, complex deployment)

**Recommendation**: Start with **Option A** (Enhanced Hybrid) to make immediate progress. We can always add true ML later if needed.

---

**Status**: Awaiting decision  
**Next**: Implement chosen approach
