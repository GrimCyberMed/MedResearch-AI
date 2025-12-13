/**
 * ML-Based Study Design Classifier (Phase 1.1.3)
 * 
 * Machine learning classifier using TF-IDF features and Random Forest
 * for study design classification with 87% target accuracy.
 * 
 * Approach:
 * 1. TF-IDF feature extraction from title + abstract + methods
 * 2. Additional features: MeSH terms, statistical keywords, design indicators
 * 3. Random Forest classifier trained on 1000+ labeled studies per design
 * 4. Probability calibration for confidence scores
 */

import { StudyDesignType, getStudyDesignMetadata } from '../../common/study-design-taxonomy.js';
import { ClassificationInput, ClassificationResult } from './classify-study-design.js';
import { logger } from '../../common/logger.js';

/**
 * Training data format
 */
export interface TrainingExample {
  id: string;
  title: string;
  abstract?: string;
  methods?: string;
  full_text?: string;
  
  // Labels
  study_design: StudyDesignType;
  
  // Optional metadata
  pmid?: string;
  doi?: string;
  mesh_terms?: string[];
  publication_type?: string;
  year?: number;
}

/**
 * Feature vector for ML model
 */
export interface FeatureVector {
  // TF-IDF features (sparse vector)
  tfidf: Map<string, number>;
  
  // Additional features
  has_randomization: boolean;
  has_blinding: boolean;
  has_control_group: boolean;
  has_prospective: boolean;
  has_retrospective: boolean;
  has_cohort: boolean;
  has_case_control: boolean;
  has_cross_sectional: boolean;
  has_systematic_review: boolean;
  has_meta_analysis: boolean;
  has_qualitative: boolean;
  
  // Statistical method indicators
  has_hazard_ratio: boolean;
  has_odds_ratio: boolean;
  has_relative_risk: boolean;
  has_forest_plot: boolean;
  has_heterogeneity: boolean;
  
  // Study flow indicators
  has_consort: boolean;
  has_prisma: boolean;
  has_strobe: boolean;
  
  // Text length features
  title_length: number;
  abstract_length: number;
  methods_length: number;
}

/**
 * TF-IDF Vectorizer
 * 
 * Converts text to TF-IDF feature vectors
 */
export class TFIDFVectorizer {
  private vocabulary: Map<string, number>; // word -> index
  private idf: Map<string, number>; // word -> IDF score
  private maxFeatures: number;
  
  constructor(maxFeatures: number = 1000) {
    this.vocabulary = new Map();
    this.idf = new Map();
    this.maxFeatures = maxFeatures;
  }
  
  /**
   * Fit the vectorizer on training data
   */
  fit(documents: string[]): void {
    logger.info('Fitting TF-IDF vectorizer', {
      num_documents: documents.length,
      max_features: this.maxFeatures,
    });
    
    // Count document frequencies
    const documentFrequency = new Map<string, number>();
    const totalDocs = documents.length;
    
    for (const doc of documents) {
      const words = this.tokenize(doc);
      const uniqueWords = new Set(words);
      
      for (const word of uniqueWords) {
        documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1);
      }
    }
    
    // Calculate IDF scores
    for (const [word, df] of documentFrequency.entries()) {
      const idf = Math.log((totalDocs + 1) / (df + 1)) + 1;
      this.idf.set(word, idf);
    }
    
    // Select top features by IDF score
    const sortedWords = Array.from(this.idf.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.maxFeatures);
    
    // Build vocabulary
    sortedWords.forEach(([word, _], index) => {
      this.vocabulary.set(word, index);
    });
    
    logger.info('TF-IDF vectorizer fitted', {
      vocabulary_size: this.vocabulary.size,
    });
  }
  
  /**
   * Transform text to TF-IDF vector
   */
  transform(text: string): Map<string, number> {
    const words = this.tokenize(text);
    const termFrequency = new Map<string, number>();
    
    // Calculate term frequency
    for (const word of words) {
      if (this.vocabulary.has(word)) {
        termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
      }
    }
    
    // Calculate TF-IDF
    const tfidf = new Map<string, number>();
    const totalWords = words.length;
    
    for (const [word, tf] of termFrequency.entries()) {
      const idf = this.idf.get(word) || 0;
      const tfidfScore = (tf / totalWords) * idf;
      tfidf.set(word, tfidfScore);
    }
    
    return tfidf;
  }
  
  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // Remove punctuation except hyphens
      .split(/\s+/)
      .filter((word) => word.length > 2) // Remove short words
      .filter((word) => !this.isStopWord(word)); // Remove stop words
  }
  
  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'we', 'they', 'it', 'its', 'their', 'our', 'your',
    ]);
    
    return stopWords.has(word);
  }
  
  /**
   * Get vocabulary
   */
  getVocabulary(): Map<string, number> {
    return this.vocabulary;
  }
  
  /**
   * Serialize vectorizer
   */
  toJSON(): any {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      idf: Array.from(this.idf.entries()),
      maxFeatures: this.maxFeatures,
    };
  }
  
  /**
   * Deserialize vectorizer
   */
  static fromJSON(json: any): TFIDFVectorizer {
    const vectorizer = new TFIDFVectorizer(json.maxFeatures);
    vectorizer.vocabulary = new Map(json.vocabulary);
    vectorizer.idf = new Map(json.idf);
    return vectorizer;
  }
}

/**
 * Feature extractor
 * 
 * Extracts features from study text for ML classification
 */
export class FeatureExtractor {
  private vectorizer: TFIDFVectorizer;
  
  constructor(vectorizer: TFIDFVectorizer) {
    this.vectorizer = vectorizer;
  }
  
  /**
   * Extract features from classification input
   */
  extract(input: ClassificationInput): FeatureVector {
    // Combine text
    const combinedText = [
      input.title,
      input.abstract || '',
      input.methods || '',
    ].join(' ');
    
    // TF-IDF features
    const tfidf = this.vectorizer.transform(combinedText);
    
    // Text for feature detection
    const lowerText = combinedText.toLowerCase();
    
    // Extract binary features
    const features: FeatureVector = {
      tfidf,
      
      // Design indicators
      has_randomization: /random(iz|is)(ed|ation)|rct/i.test(lowerText),
      has_blinding: /blind(ed|ing)|mask(ed|ing)/i.test(lowerText),
      has_control_group: /control\s+(group|arm)|placebo/i.test(lowerText),
      has_prospective: /prospective/i.test(lowerText),
      has_retrospective: /retrospective/i.test(lowerText),
      has_cohort: /cohort/i.test(lowerText),
      has_case_control: /case[-\s]control/i.test(lowerText),
      has_cross_sectional: /cross[-\s]sectional/i.test(lowerText),
      has_systematic_review: /systematic\s+review/i.test(lowerText),
      has_meta_analysis: /meta[-\s]analysis/i.test(lowerText),
      has_qualitative: /qualitative|phenomenolog|grounded\s+theory|ethnograph/i.test(lowerText),
      
      // Statistical methods
      has_hazard_ratio: /hazard\s+ratio|HR|cox\s+regression/i.test(lowerText),
      has_odds_ratio: /odds\s+ratio|OR/i.test(lowerText),
      has_relative_risk: /relative\s+risk|RR/i.test(lowerText),
      has_forest_plot: /forest\s+plot/i.test(lowerText),
      has_heterogeneity: /heterogeneity|I\s*²|I-squared/i.test(lowerText),
      
      // Reporting guidelines
      has_consort: /CONSORT/i.test(lowerText),
      has_prisma: /PRISMA/i.test(lowerText),
      has_strobe: /STROBE/i.test(lowerText),
      
      // Text lengths
      title_length: input.title.length,
      abstract_length: input.abstract?.length || 0,
      methods_length: input.methods?.length || 0,
    };
    
    return features;
  }
}

/**
 * Random Forest Classifier (Simplified Implementation)
 * 
 * Note: This is a simplified implementation for demonstration.
 * In production, you would use a proper ML library or train models in Python
 * and load them here.
 */
export class RandomForestClassifier {
  private trees: DecisionTree[];
  private numTrees: number;
  
  constructor(numTrees: number = 100) {
    this.numTrees = numTrees;
    this.trees = [];
  }
  
  /**
   * Train the classifier
   * 
   * Note: This is a placeholder. In production, you would:
   * 1. Train the model in Python using scikit-learn
   * 2. Export the model (e.g., to ONNX or JSON)
   * 3. Load the model here for inference
   */
  train(features: FeatureVector[], labels: StudyDesignType[]): void {
    logger.info('Training Random Forest classifier', {
      num_samples: features.length,
      num_trees: this.numTrees,
    });
    
    // TODO: Implement training or load pre-trained model
    // For now, this is a placeholder
    
    throw new Error('Random Forest training not yet implemented. Use pre-trained model.');
  }
  
  /**
   * Predict study design
   */
  predict(features: FeatureVector): {
    prediction: StudyDesignType;
    probabilities: Map<StudyDesignType, number>;
  } {
    // TODO: Implement prediction using trained model
    // For now, return placeholder
    
    throw new Error('Random Forest prediction not yet implemented. Use pre-trained model.');
  }
  
  /**
   * Load pre-trained model
   */
  static load(modelPath: string): RandomForestClassifier {
    // TODO: Implement model loading
    throw new Error('Model loading not yet implemented');
  }
}

/**
 * Decision Tree (component of Random Forest)
 */
class DecisionTree {
  // Simplified decision tree implementation
  // In production, this would be much more sophisticated
  
  predict(_features: FeatureVector): StudyDesignType {
    // Placeholder
    return StudyDesignType.UNKNOWN;
  }
}

/**
 * ML-based classifier
 */
export class MLClassifier {
  private vectorizer: TFIDFVectorizer;
  private featureExtractor: FeatureExtractor;
  private model: RandomForestClassifier;
  private confidenceThreshold: number;
  
  constructor(
    vectorizer: TFIDFVectorizer,
    model: RandomForestClassifier,
    confidenceThreshold: number = 0.7
  ) {
    this.vectorizer = vectorizer;
    this.featureExtractor = new FeatureExtractor(vectorizer);
    this.model = model;
    this.confidenceThreshold = confidenceThreshold;
  }
  
  /**
   * Classify study design using ML
   */
  classify(input: ClassificationInput): ClassificationResult {
    logger.info('Starting ML-based classification', {
      title: input.title.substring(0, 100),
    });
    
    try {
      // Extract features
      const features = this.featureExtractor.extract(input);
      
      // Predict
      const { prediction, probabilities } = this.model.predict(features);
      
      // Get confidence (probability of predicted class)
      const confidence = probabilities.get(prediction) || 0;
      
      // Get alternatives (sorted by probability)
      const alternatives = Array.from(probabilities.entries())
        .filter(([design, _]) => design !== prediction)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([design, prob]) => ({
          design,
          confidence: prob,
        }));
      
      // Get metadata
      const metadata = getStudyDesignMetadata(prediction);
      
      // Build result
      const result: ClassificationResult = {
        primary_design: prediction,
        primary_confidence: confidence,
        
        alternatives,
        
        category: metadata.category,
        metadata,
        
        method: 'ml',
        
        matched_keywords: [], // ML doesn't use keywords
        
        requires_review: confidence < this.confidenceThreshold,
        ambiguous: alternatives.length > 0 && alternatives[0].confidence > confidence * 0.8,
        
        quality_tools: metadata.quality_tools,
        reporting_guidelines: metadata.reporting_guidelines,
      };
      
      logger.info('ML classification complete', {
        primary_design: result.primary_design,
        confidence: result.primary_confidence,
      });
      
      return result;
    } catch (error) {
      logger.error('ML classification failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }
  
  /**
   * Load pre-trained ML classifier
   */
  static load(modelPath: string): MLClassifier {
    // TODO: Implement model loading
    // This would load:
    // 1. TF-IDF vectorizer (vocabulary + IDF scores)
    // 2. Random Forest model (tree structure + parameters)
    
    throw new Error('ML classifier loading not yet implemented (Phase 1.1.3)');
  }
}

/**
 * Training data loader
 */
export class TrainingDataLoader {
  /**
   * Load training data from file
   */
  static async load(filePath: string): Promise<TrainingExample[]> {
    // TODO: Implement data loading
    // This would load labeled training data in JSON/CSV format
    
    throw new Error('Training data loading not yet implemented');
  }
  
  /**
   * Split data into train/test sets
   */
  static split(
    data: TrainingExample[],
    testSize: number = 0.2
  ): {
    train: TrainingExample[];
    test: TrainingExample[];
  } {
    const shuffled = data.sort(() => Math.random() - 0.5);
    const splitIndex = Math.floor(data.length * (1 - testSize));
    
    return {
      train: shuffled.slice(0, splitIndex),
      test: shuffled.slice(splitIndex),
    };
  }
}
