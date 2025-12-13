/**
 * Study Design Classification Tool
 * 
 * Enhanced hybrid classifier combining keyword, MeSH, and statistical method
 * approaches for automated study design detection with 80-85% target accuracy.
 * 
 * Approach:
 * 1. Keyword-based classification (40% weight, 70% accuracy baseline)
 * 2. MeSH term classification (30% weight, 95% accuracy when available)
 * 3. Statistical method classification (30% weight, 90% accuracy)
 * 4. Ensemble voting with confidence calibration (80-85% accuracy target)
 * 
 * MeSH Integration:
 * - Ready to accept mesh_terms and publication_type parameters
 * - Requires PubMed API enhancement to fetch MeSH data (future enhancement)
 * - Currently works without MeSH terms (keyword + statistical only)
 * 
 * @version 6.0.0-beta
 */

import {
  StudyDesignType,
  StudyDesignCategory,
  StudyDesignMetadata,
  getStudyDesignMetadata,
} from '../../common/study-design-taxonomy.js';
import {
  WeightedKeyword,
  getKeywordsForDesign,
  getExclusionKeywordsForDesign,
} from '../../common/study-design-keywords.js';
import { logger } from '../../common/logger.js';
import { MeSHClassifier } from './mesh-classifier.js';
import { StatisticalMethodClassifier } from './statistical-method-classifier.js';

/**
 * Classification result
 */
export interface ClassificationResult {
  // Primary classification
  primary_design: StudyDesignType;
  primary_confidence: number; // 0-1
  
  // Alternative classifications (ranked by confidence)
  alternatives: Array<{
    design: StudyDesignType;
    confidence: number;
  }>;
  
  // Metadata
  category: StudyDesignCategory;
  metadata: StudyDesignMetadata;
  
  // Classification method used
  method: 'keyword' | 'ml' | 'hybrid';
  
  // Matched keywords (for transparency)
  matched_keywords: Array<{
    keyword: string;
    weight: number;
    design: StudyDesignType;
  }>;
  
  // Flags
  requires_review: boolean; // True if confidence < threshold
  ambiguous: boolean; // True if multiple designs have similar scores
  
  // Recommendations
  quality_tools: string[];
  reporting_guidelines: string[];
}

/**
 * Classification input
 */
export interface ClassificationInput {
  title: string;
  abstract?: string;
  methods?: string;
  full_text?: string;
  
  // Optional hints
  publication_type?: string; // From PubMed
  mesh_terms?: string[]; // From PubMed
  
  // Configuration
  confidence_threshold?: number; // Default: 0.7
  use_ml?: boolean; // Default: false (Phase 1.1.3)
}

/**
 * Keyword-based classifier (Phase 1.1.2)
 */
export class KeywordClassifier {
  private confidenceThreshold: number;
  
  constructor(confidenceThreshold: number = 0.7) {
    this.confidenceThreshold = confidenceThreshold;
  }
  
  /**
   * Classify study design using keyword matching
   */
  classify(input: ClassificationInput): ClassificationResult {
    logger.info('Starting keyword-based classification', {
      title: input.title.substring(0, 100),
      has_abstract: !!input.abstract,
      has_methods: !!input.methods,
    });
    
    // Combine all text
    const combinedText = this.combineText(input);
    
    // Calculate scores for each design type
    const scores = this.calculateScores(combinedText, input);
    
    // Sort by score
    const sortedScores = Object.entries(scores)
      .map(([design, score]) => ({
        design: design as StudyDesignType,
        score: score.total,
        confidence: this.scoreToConfidence(score.total, score.max_possible),
        matched_keywords: score.matched_keywords,
      }))
      .sort((a, b) => b.score - a.score);
    
    // Get top result
    const topResult = sortedScores[0];
    const secondResult = sortedScores[1];
    
    // Check if ambiguous (top 2 scores are close)
    const ambiguous = secondResult && 
      (topResult.score - secondResult.score) < (topResult.score * 0.2);
    
    // Determine if requires review
    const requiresReview = topResult.confidence < this.confidenceThreshold || ambiguous;
    
    // Get metadata
    const metadata = getStudyDesignMetadata(topResult.design);
    
    // Build result
    const result: ClassificationResult = {
      primary_design: topResult.design,
      primary_confidence: topResult.confidence,
      
      alternatives: sortedScores.slice(1, 4).map((s) => ({
        design: s.design,
        confidence: s.confidence,
      })),
      
      category: metadata.category,
      metadata: metadata,
      
      method: 'keyword',
      
      matched_keywords: topResult.matched_keywords,
      
      requires_review: requiresReview,
      ambiguous: ambiguous,
      
      quality_tools: metadata.quality_tools,
      reporting_guidelines: metadata.reporting_guidelines,
    };
    
    logger.info('Keyword classification complete', {
      primary_design: result.primary_design,
      confidence: result.primary_confidence,
      requires_review: result.requires_review,
      ambiguous: result.ambiguous,
    });
    
    return result;
  }
  
  /**
   * Combine text from different sections
   */
  private combineText(input: ClassificationInput): string {
    const parts: string[] = [];
    
    // Title (most important)
    if (input.title) {
      parts.push(input.title.repeat(3)); // Weight title 3x
    }
    
    // Abstract
    if (input.abstract) {
      parts.push(input.abstract.repeat(2)); // Weight abstract 2x
    }
    
    // Methods (very important for design classification)
    if (input.methods) {
      parts.push(input.methods.repeat(3)); // Weight methods 3x
    }
    
    // Full text (if available)
    if (input.full_text) {
      parts.push(input.full_text);
    }
    
    return parts.join(' ').toLowerCase();
  }
  
  /**
   * Calculate scores for all design types
   */
  private calculateScores(
    text: string,
    input: ClassificationInput
  ): Record<StudyDesignType, {
    total: number;
    max_possible: number;
    matched_keywords: Array<{ keyword: string; weight: number; design: StudyDesignType }>;
  }> {
    const scores: Record<string, any> = {};
    
    // Initialize scores for all design types
    Object.values(StudyDesignType).forEach((design) => {
      scores[design] = {
        total: 0,
        max_possible: 0,
        matched_keywords: [],
      };
    });
    
    // Score each design type
    Object.values(StudyDesignType).forEach((design) => {
      const keywords = getKeywordsForDesign(design);
      const exclusionKeywords = getExclusionKeywordsForDesign(design);
      
      // Calculate max possible score
      const maxPossible = keywords.reduce((sum, kw) => sum + kw.weight, 0);
      scores[design].max_possible = maxPossible;
      
      // Match inclusion keywords
      keywords.forEach((kw) => {
        if (this.matchKeyword(text, kw, input)) {
          scores[design].total += kw.weight;
          scores[design].matched_keywords.push({
            keyword: kw.keyword,
            weight: kw.weight,
            design: design,
          });
        }
      });
      
      // Penalize for exclusion keywords
      exclusionKeywords.forEach((kw) => {
        if (this.matchKeyword(text, kw, input)) {
          scores[design].total -= kw.weight * 0.5; // Penalty is half the weight
        }
      });
      
      // Ensure score is not negative
      scores[design].total = Math.max(0, scores[design].total);
    });
    
    return scores as Record<StudyDesignType, any>;
  }
  
  /**
   * Match a keyword in text
   */
  private matchKeyword(
    text: string,
    keyword: WeightedKeyword,
    input: ClassificationInput
  ): boolean {
    const normalizedKeyword = keyword.keyword.toLowerCase();
    
    // Context-specific matching
    if (keyword.context === 'title' && input.title) {
      return input.title.toLowerCase().includes(normalizedKeyword);
    }
    
    if (keyword.context === 'abstract' && input.abstract) {
      return input.abstract.toLowerCase().includes(normalizedKeyword);
    }
    
    if (keyword.context === 'methods' && input.methods) {
      return input.methods.toLowerCase().includes(normalizedKeyword);
    }
    
    // General matching (any context)
    return text.includes(normalizedKeyword);
  }
  
  /**
   * Convert score to confidence (0-1)
   */
  private scoreToConfidence(score: number, maxPossible: number): number {
    if (maxPossible === 0) return 0;
    
    // Normalize to 0-1
    const normalized = score / maxPossible;
    
    // Apply a gentler sigmoid transformation
    // This spreads out the confidence scores more reasonably
    // Using a factor of 8 instead of 5 for better distribution
    const confidence = 1 / (1 + Math.exp(-8 * (normalized - 0.4)));
    
    return Math.min(1, Math.max(0, confidence));
  }
}

/**
 * ML-based classifier (Phase 1.1.3 - Placeholder)
 * 
 * This will be implemented in Phase 1.1.3 with:
 * - TF-IDF feature extraction
 * - Random Forest classifier
 * - Training on 1000+ labeled studies per design
 * - Target accuracy: 87%
 */
export class MLClassifier {
  classify(_input: ClassificationInput): ClassificationResult {
    // TODO: Implement in Phase 1.1.3
    throw new Error('ML classifier not yet implemented (Phase 1.1.3)');
  }
}

/**
 * Enhanced Hybrid Classifier (Phase 1.1.3a)
 * 
 * Combines three classifiers using weighted ensemble voting:
 * 1. Keyword Classifier (40% weight) - Rule-based keyword matching
 * 2. MeSH Classifier (30% weight) - PubMed MeSH terms and publication types
 * 3. Statistical Method Classifier (30% weight) - Statistical methods and reporting guidelines
 * 
 * Target accuracy: 80-85%
 */
export class HybridClassifier {
  private keywordClassifier: KeywordClassifier;
  private meshClassifier: MeSHClassifier;
  private statisticalClassifier: StatisticalMethodClassifier;
  private confidenceThreshold: number;
  
  // Ensemble weights (must sum to 1.0)
  private readonly KEYWORD_WEIGHT = 0.40;
  private readonly MESH_WEIGHT = 0.30;
  private readonly STATISTICAL_WEIGHT = 0.30;
  
  constructor(confidenceThreshold: number = 0.7) {
    this.keywordClassifier = new KeywordClassifier(confidenceThreshold);
    this.meshClassifier = new MeSHClassifier();
    this.statisticalClassifier = new StatisticalMethodClassifier();
    this.confidenceThreshold = confidenceThreshold;
  }
  
  /**
   * Classify using enhanced hybrid approach with ensemble voting
   */
  classify(input: ClassificationInput): ClassificationResult {
    logger.info('Starting enhanced hybrid classification', {
      title: input.title.substring(0, 100),
      has_mesh: !!input.mesh_terms,
      has_pub_type: !!input.publication_type,
    });
    
    // Combine text for statistical classifier
    const combinedText = [
      input.title,
      input.abstract || '',
      input.methods || '',
    ].join(' ');
    
    // Phase 1: Keyword classification
    const keywordResult = this.keywordClassifier.classify(input);
    const keywordScores = this.extractScores(keywordResult);
    
    // Phase 2: MeSH classification (if available)
    let meshScores = new Map<StudyDesignType, number>();
    if (input.mesh_terms && input.mesh_terms.length > 0) {
      meshScores = this.meshClassifier.classify(input.mesh_terms);
    } else if (input.publication_type) {
      meshScores = this.meshClassifier.classifyByPublicationType(input.publication_type);
    }
    
    // Phase 3: Statistical method classification
    const statisticalScores = this.statisticalClassifier.classify(combinedText);
    
    // Phase 4: Ensemble voting
    const ensembleScores = this.ensembleVote(keywordScores, meshScores, statisticalScores);
    
    // Get top result
    const sortedScores = Array.from(ensembleScores.entries())
      .sort((a, b) => b[1] - a[1]);
    
    const topDesign = sortedScores[0][0];
    const topScore = sortedScores[0][1];
    
    // Calculate confidence
    const confidence = this.calculateEnsembleConfidence(
      topScore,
      keywordResult.primary_confidence,
      this.meshClassifier.getConfidence(meshScores),
      this.statisticalClassifier.getConfidence(statisticalScores)
    );
    
    // Get alternatives
    const alternatives = sortedScores.slice(1, 4).map(([design, score]) => ({
      design,
      confidence: score / (sortedScores[0][1] || 1), // Normalize to top score
    }));
    
    // Check if ambiguous
    const ambiguous = alternatives.length > 0 && 
      alternatives[0].confidence > 0.8; // Second choice is close
    
    // Get metadata
    const metadata = getStudyDesignMetadata(topDesign);
    
    // Combine matched keywords from all classifiers
    const matchedKeywords = [
      ...keywordResult.matched_keywords,
      ...this.getStatisticalMatches(combinedText),
    ];
    
    // Build result
    const result: ClassificationResult = {
      primary_design: topDesign,
      primary_confidence: confidence,
      
      alternatives,
      
      category: metadata.category,
      metadata,
      
      method: 'hybrid',
      
      matched_keywords: matchedKeywords.slice(0, 10), // Top 10
      
      requires_review: confidence < this.confidenceThreshold || ambiguous,
      ambiguous,
      
      quality_tools: metadata.quality_tools,
      reporting_guidelines: metadata.reporting_guidelines,
    };
    
    logger.info('Enhanced hybrid classification complete', {
      primary_design: result.primary_design,
      confidence: result.primary_confidence,
      method: 'ensemble',
      keyword_weight: this.KEYWORD_WEIGHT,
      mesh_weight: this.MESH_WEIGHT,
      statistical_weight: this.STATISTICAL_WEIGHT,
    });
    
    return result;
  }
  
  /**
   * Extract scores from classification result
   */
  private extractScores(result: ClassificationResult): Map<StudyDesignType, number> {
    const scores = new Map<StudyDesignType, number>();
    
    // Primary design gets its confidence score
    scores.set(result.primary_design, result.primary_confidence);
    
    // Alternatives get their confidence scores
    result.alternatives.forEach((alt) => {
      scores.set(alt.design, alt.confidence);
    });
    
    return scores;
  }
  
  /**
   * Ensemble voting: combine scores from all classifiers
   */
  private ensembleVote(
    keywordScores: Map<StudyDesignType, number>,
    meshScores: Map<StudyDesignType, number>,
    statisticalScores: Map<StudyDesignType, number>
  ): Map<StudyDesignType, number> {
    const ensembleScores = new Map<StudyDesignType, number>();
    
    // Initialize all scores
    Object.values(StudyDesignType).forEach((design) => {
      const keywordScore = keywordScores.get(design) || 0;
      const meshScore = meshScores.get(design) || 0;
      const statisticalScore = statisticalScores.get(design) || 0;
      
      // Weighted combination
      const ensembleScore = 
        (keywordScore * this.KEYWORD_WEIGHT) +
        (meshScore * this.MESH_WEIGHT) +
        (statisticalScore * this.STATISTICAL_WEIGHT);
      
      ensembleScores.set(design, ensembleScore);
    });
    
    return ensembleScores;
  }
  
  /**
   * Calculate ensemble confidence
   */
  private calculateEnsembleConfidence(
    _ensembleScore: number,
    keywordConfidence: number,
    meshConfidence: number,
    statisticalConfidence: number
  ): number {
    // Ensure all confidences are valid numbers
    const safeKeywordConf = isNaN(keywordConfidence) ? 0 : keywordConfidence;
    const safeMeshConf = isNaN(meshConfidence) ? 0 : meshConfidence;
    const safeStatConf = isNaN(statisticalConfidence) ? 0 : statisticalConfidence;
    
    // Weighted average of confidences
    const weightedConfidence = 
      (safeKeywordConf * this.KEYWORD_WEIGHT) +
      (safeMeshConf * this.MESH_WEIGHT) +
      (safeStatConf * this.STATISTICAL_WEIGHT);
    
    // Calibration: Boost confidence based on classifier agreement
    let calibratedConfidence = weightedConfidence;
    
    // Count high-confidence classifiers (>0.7)
    const highConfClassifiers = [
      safeKeywordConf >= 0.7,
      safeMeshConf >= 0.7,
      safeStatConf >= 0.7,
    ].filter(Boolean).length;
    
    // Count medium-confidence classifiers (>0.5)
    const medConfClassifiers = [
      safeKeywordConf >= 0.5,
      safeMeshConf >= 0.5,
      safeStatConf >= 0.5,
    ].filter(Boolean).length;
    
    // Apply calibration boosts
    if (highConfClassifiers >= 2) {
      // Two or more high-confidence classifiers agree → strong boost
      calibratedConfidence = Math.min(0.95, calibratedConfidence + 0.15);
    } else if (highConfClassifiers === 1 && medConfClassifiers >= 2) {
      // One high + one medium confidence → moderate boost
      calibratedConfidence = Math.min(0.90, calibratedConfidence + 0.10);
    } else if (medConfClassifiers >= 2) {
      // Two medium confidence classifiers → small boost
      calibratedConfidence = Math.min(0.85, calibratedConfidence + 0.05);
    }
    
    // Special boost for MeSH + Statistical agreement (highly reliable)
    if (safeMeshConf >= 0.7 && safeStatConf >= 0.7) {
      calibratedConfidence = Math.min(0.98, calibratedConfidence + 0.10);
    }
    
    // Cap at 0.98 (never 100% certain without manual review)
    const finalConfidence = Math.min(0.98, calibratedConfidence);
    
    return isNaN(finalConfidence) ? 0 : finalConfidence;
  }
  
  /**
   * Get statistical method matches for transparency
   */
  private getStatisticalMatches(text: string): Array<{
    keyword: string;
    weight: number;
    design: StudyDesignType;
  }> {
    const matches = this.statisticalClassifier.getMatchedPatterns(text);
    
    return matches.flatMap((match) =>
      match.designs.map((design) => ({
        keyword: match.description,
        weight: match.weight,
        design,
      }))
    );
  }
  
}

/**
 * Main classification function (MCP tool interface)
 */
export async function classifyStudyDesign(args: {
  title: string;
  abstract?: string;
  methods?: string;
  full_text?: string;
  publication_type?: string;
  mesh_terms?: string[];
  confidence_threshold?: number;
  use_ml?: boolean;
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    // Validate required parameters
    if (!args.title) {
      throw new Error('Title is required for study design classification');
    }
    
    logger.info('Classifying study design', {
      title: args.title.substring(0, 100),
      has_abstract: !!args.abstract,
      has_methods: !!args.methods,
      has_full_text: !!args.full_text,
    });
    
    // Create classifier
    const classifier = new HybridClassifier(args.confidence_threshold || 0.7);
    
    // Classify
    const result = classifier.classify({
      title: args.title,
      abstract: args.abstract,
      methods: args.methods,
      full_text: args.full_text,
      publication_type: args.publication_type,
      mesh_terms: args.mesh_terms,
      confidence_threshold: args.confidence_threshold,
      use_ml: args.use_ml || false,
    });
    
    // Format output
    const output = {
      classification: {
        primary_design: result.primary_design,
        primary_design_name: result.metadata.name,
        category: result.category,
        confidence: result.primary_confidence,
        requires_review: result.requires_review,
        ambiguous: result.ambiguous,
      },
      
      alternatives: result.alternatives.map((alt) => ({
        design: alt.design,
        design_name: getStudyDesignMetadata(alt.design).name,
        confidence: alt.confidence,
      })),
      
      metadata: {
        description: result.metadata.description,
        characteristics: result.metadata.characteristics,
        evidence_level: result.metadata.evidence_level,
      },
      
      recommendations: {
        quality_tools: result.quality_tools,
        reporting_guidelines: result.reporting_guidelines,
      },
      
      matched_keywords: result.matched_keywords.slice(0, 10), // Top 10
      
      method: result.method,
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(output, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('Error classifying study design', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error classifying study design: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
