/**
 * MeSH Term Classifier for Study Design Detection
 * 
 * Uses PubMed MeSH (Medical Subject Headings) terms and publication types
 * to classify study designs with high confidence.
 * 
 * MeSH terms are controlled vocabulary used by PubMed to index articles.
 * Publication types are particularly reliable for study design classification.
 */

import { StudyDesignType } from '../../common/study-design-taxonomy.js';
import { logger } from '../../common/logger.js';

/**
 * MeSH publication type mappings to study designs
 * 
 * Based on NLM's official publication type list:
 * https://www.nlm.nih.gov/mesh/pubtypes.html
 */
export const MESH_PUBLICATION_TYPES: Record<string, StudyDesignType[]> = {
  // RCT types
  'Randomized Controlled Trial': [StudyDesignType.RCT_PARALLEL],
  'Controlled Clinical Trial': [StudyDesignType.RCT_PARALLEL],
  'Pragmatic Clinical Trial': [StudyDesignType.RCT_PARALLEL],
  'Adaptive Clinical Trial': [StudyDesignType.RCT_ADAPTIVE],
  'Equivalence Trial': [StudyDesignType.RCT_PARALLEL],
  'Non-Inferiority Trial': [StudyDesignType.RCT_PARALLEL],
  
  // Observational types
  'Observational Study': [
    StudyDesignType.COHORT_PROSPECTIVE,
    StudyDesignType.COHORT_RETROSPECTIVE,
    StudyDesignType.CASE_CONTROL,
    StudyDesignType.CROSS_SECTIONAL,
  ],
  'Cohort Studies': [StudyDesignType.COHORT_PROSPECTIVE, StudyDesignType.COHORT_RETROSPECTIVE],
  'Longitudinal Studies': [StudyDesignType.COHORT_PROSPECTIVE],
  'Prospective Studies': [StudyDesignType.COHORT_PROSPECTIVE],
  'Retrospective Studies': [StudyDesignType.COHORT_RETROSPECTIVE],
  'Case-Control Studies': [StudyDesignType.CASE_CONTROL],
  'Cross-Sectional Studies': [StudyDesignType.CROSS_SECTIONAL],
  'Prevalence Studies': [StudyDesignType.CROSS_SECTIONAL],
  
  // Case reports
  'Case Reports': [StudyDesignType.CASE_REPORT],
  
  // Review types
  'Systematic Review': [StudyDesignType.SYSTEMATIC_REVIEW],
  'Meta-Analysis': [StudyDesignType.META_ANALYSIS],
  'Review': [StudyDesignType.NARRATIVE_REVIEW],
  'Scoping Review': [StudyDesignType.SCOPING_REVIEW],
  
  // Qualitative
  'Qualitative Research': [
    StudyDesignType.PHENOMENOLOGY,
    StudyDesignType.GROUNDED_THEORY,
    StudyDesignType.ETHNOGRAPHY,
    StudyDesignType.QUALITATIVE_DESCRIPTIVE,
  ],
  
  // Diagnostic
  'Diagnostic Study': [StudyDesignType.DIAGNOSTIC_ACCURACY],
  'Validation Study': [StudyDesignType.DIAGNOSTIC_ACCURACY, StudyDesignType.PREDICTION_MODEL],
};

/**
 * MeSH term patterns for study designs
 * 
 * These are MeSH terms (not publication types) that indicate study design
 */
export const MESH_TERM_PATTERNS: Record<StudyDesignType, string[]> = {
  // RCT
  [StudyDesignType.RCT_PARALLEL]: [
    'Random Allocation',
    'Double-Blind Method',
    'Single-Blind Method',
    'Placebos',
    'Treatment Outcome',
  ],
  
  [StudyDesignType.RCT_CROSSOVER]: [
    'Cross-Over Studies',
    'Crossover Studies',
  ],
  
  [StudyDesignType.RCT_CLUSTER]: [
    'Cluster Analysis',
  ],
  
  [StudyDesignType.RCT_FACTORIAL]: [],
  [StudyDesignType.RCT_ADAPTIVE]: [],
  [StudyDesignType.RCT_STEPPED_WEDGE]: [],
  
  // Observational
  [StudyDesignType.COHORT_PROSPECTIVE]: [
    'Prospective Studies',
    'Follow-Up Studies',
    'Incidence',
    'Survival Analysis',
    'Proportional Hazards Models',
  ],
  
  [StudyDesignType.COHORT_RETROSPECTIVE]: [
    'Retrospective Studies',
    'Medical Records',
    'Electronic Health Records',
  ],
  
  [StudyDesignType.CASE_CONTROL]: [
    'Case-Control Studies',
    'Odds Ratio',
    'Logistic Models',
  ],
  
  [StudyDesignType.CROSS_SECTIONAL]: [
    'Cross-Sectional Studies',
    'Prevalence',
    'Surveys and Questionnaires',
  ],
  
  [StudyDesignType.CASE_REPORT]: [
    'Case Reports',
  ],
  
  [StudyDesignType.CASE_SERIES]: [],
  [StudyDesignType.ECOLOGICAL]: [],
  
  // Quasi-experimental
  [StudyDesignType.QUASI_EXPERIMENTAL]: [
    'Interrupted Time Series Analysis',
  ],
  
  [StudyDesignType.N_OF_1]: [],
  
  // Reviews
  [StudyDesignType.SYSTEMATIC_REVIEW]: [
    'Systematic Review',
    'Meta-Analysis as Topic',
    'Evidence-Based Medicine',
  ],
  
  [StudyDesignType.META_ANALYSIS]: [
    'Meta-Analysis',
    'Meta-Analysis as Topic',
  ],
  
  [StudyDesignType.NETWORK_META_ANALYSIS]: [
    'Network Meta-Analysis',
  ],
  
  [StudyDesignType.SCOPING_REVIEW]: [],
  [StudyDesignType.UMBRELLA_REVIEW]: [],
  [StudyDesignType.RAPID_REVIEW]: [],
  [StudyDesignType.NARRATIVE_REVIEW]: [],
  
  // Qualitative
  [StudyDesignType.PHENOMENOLOGY]: [
    'Qualitative Research',
  ],
  
  [StudyDesignType.GROUNDED_THEORY]: [
    'Qualitative Research',
    'Grounded Theory',
  ],
  
  [StudyDesignType.ETHNOGRAPHY]: [
    'Qualitative Research',
    'Anthropology, Cultural',
  ],
  
  [StudyDesignType.QUALITATIVE_DESCRIPTIVE]: [
    'Qualitative Research',
  ],
  
  // Mixed methods
  [StudyDesignType.CONVERGENT]: [],
  [StudyDesignType.EXPLANATORY_SEQUENTIAL]: [],
  [StudyDesignType.EXPLORATORY_SEQUENTIAL]: [],
  
  // Diagnostic
  [StudyDesignType.DIAGNOSTIC_ACCURACY]: [
    'Sensitivity and Specificity',
    'ROC Curve',
    'Predictive Value of Tests',
    'Diagnostic Tests, Routine',
  ],
  
  // Prognostic
  [StudyDesignType.PROGNOSTIC_FACTOR]: [
    'Prognosis',
    'Risk Factors',
    'Risk Assessment',
  ],
  
  [StudyDesignType.PREDICTION_MODEL]: [
    'Predictive Value of Tests',
    'Risk Assessment',
    'Decision Support Techniques',
  ],
  
  // Unknown
  [StudyDesignType.UNKNOWN]: [],
};

/**
 * MeSH-based classifier
 */
export class MeSHClassifier {
  /**
   * Classify based on MeSH terms
   */
  classify(meshTerms: string[]): Map<StudyDesignType, number> {
    logger.info('Classifying using MeSH terms', {
      num_terms: meshTerms.length,
      terms: meshTerms.slice(0, 5),
    });
    
    const scores = new Map<StudyDesignType, number>();
    
    // Initialize all scores to 0
    Object.values(StudyDesignType).forEach((design) => {
      scores.set(design, 0);
    });
    
    // Normalize MeSH terms (lowercase, trim)
    const normalizedTerms = meshTerms.map((term) => term.toLowerCase().trim());
    
    // Check publication types (high confidence)
    for (const [pubType, designs] of Object.entries(MESH_PUBLICATION_TYPES)) {
      const normalizedPubType = pubType.toLowerCase();
      
      if (normalizedTerms.includes(normalizedPubType)) {
        // Publication type match = very high confidence
        designs.forEach((design) => {
          scores.set(design, (scores.get(design) || 0) + 10);
        });
        
        logger.info('MeSH publication type match', {
          publication_type: pubType,
          designs: designs,
        });
      }
    }
    
    // Check MeSH term patterns (medium confidence)
    for (const [design, patterns] of Object.entries(MESH_TERM_PATTERNS)) {
      for (const pattern of patterns) {
        const normalizedPattern = pattern.toLowerCase();
        
        if (normalizedTerms.includes(normalizedPattern)) {
          scores.set(design as StudyDesignType, (scores.get(design as StudyDesignType) || 0) + 5);
          
          logger.info('MeSH term pattern match', {
            pattern: pattern,
            design: design,
          });
        }
      }
    }
    
    return scores;
  }
  
  /**
   * Classify based on publication type string
   */
  classifyByPublicationType(publicationType: string): Map<StudyDesignType, number> {
    const scores = new Map<StudyDesignType, number>();
    
    // Initialize all scores to 0
    Object.values(StudyDesignType).forEach((design) => {
      scores.set(design, 0);
    });
    
    const normalizedPubType = publicationType.toLowerCase().trim();
    
    // Check publication types
    for (const [pubType, designs] of Object.entries(MESH_PUBLICATION_TYPES)) {
      const normalizedMeshPubType = pubType.toLowerCase();
      
      if (normalizedPubType.includes(normalizedMeshPubType) || 
          normalizedMeshPubType.includes(normalizedPubType)) {
        designs.forEach((design) => {
          scores.set(design, (scores.get(design) || 0) + 10);
        });
        
        logger.info('Publication type match', {
          publication_type: pubType,
          designs: designs,
        });
      }
    }
    
    return scores;
  }
  
  /**
   * Get confidence from MeSH scores
   */
  getConfidence(scores: Map<StudyDesignType, number>): number {
    const values = Array.from(scores.values());
    if (values.length === 0) return 0;
    
    const maxScore = Math.max(...values);
    
    if (maxScore === 0 || !isFinite(maxScore)) return 0;
    
    // MeSH terms are highly reliable
    // Score of 10 (publication type match) = 0.95 confidence
    // Score of 5 (term match) = 0.75 confidence
    // Score of 15 (both) = 0.98 confidence
    
    const confidence = Math.min(0.98, 0.5 + (maxScore / 20));
    
    return confidence;
  }
}
