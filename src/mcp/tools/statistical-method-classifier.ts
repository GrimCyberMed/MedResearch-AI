/**
 * Statistical Method Classifier for Study Design Detection
 * 
 * Classifies study designs based on statistical methods and reporting guidelines mentioned.
 * Certain statistical methods are strong indicators of specific study designs.
 */

import { StudyDesignType } from '../../common/study-design-taxonomy.js';
import { logger } from '../../common/logger.js';

/**
 * Statistical method patterns and their associated study designs
 */
export interface StatisticalPattern {
  pattern: RegExp;
  designs: StudyDesignType[];
  weight: number; // 1-10 (10 = very strong indicator)
  description: string;
}

/**
 * Statistical method patterns
 */
export const STATISTICAL_PATTERNS: StatisticalPattern[] = [
  // RCT indicators
  {
    pattern: /\b(random(ly)?\s+(allocat|assign)|randomiz|randomis)/i,
    designs: [
      StudyDesignType.RCT_PARALLEL,
      StudyDesignType.RCT_CROSSOVER,
      StudyDesignType.RCT_CLUSTER,
      StudyDesignType.RCT_FACTORIAL,
    ],
    weight: 9,
    description: 'Randomization mentioned',
  },
  {
    pattern: /\b(double[-\s]blind|triple[-\s]blind|single[-\s]blind|mask(ed|ing))/i,
    designs: [StudyDesignType.RCT_PARALLEL, StudyDesignType.RCT_CROSSOVER],
    weight: 8,
    description: 'Blinding mentioned',
  },
  {
    pattern: /\b(placebo[-\s]control|placebo\s+group)/i,
    designs: [StudyDesignType.RCT_PARALLEL],
    weight: 8,
    description: 'Placebo control',
  },
  {
    pattern: /\b(intention[-\s]to[-\s]treat|ITT\s+analysis|per[-\s]protocol)/i,
    designs: [StudyDesignType.RCT_PARALLEL],
    weight: 7,
    description: 'ITT/per-protocol analysis',
  },
  
  // Cohort indicators
  {
    pattern: /\b(hazard\s+ratio|HR|cox\s+(proportional\s+)?hazard|cox\s+regression)/i,
    designs: [StudyDesignType.COHORT_PROSPECTIVE, StudyDesignType.COHORT_RETROSPECTIVE],
    weight: 9,
    description: 'Hazard ratio / Cox regression',
  },
  {
    pattern: /\b(kaplan[-\s]meier|survival\s+(curve|analysis)|time[-\s]to[-\s]event)/i,
    designs: [StudyDesignType.COHORT_PROSPECTIVE, StudyDesignType.COHORT_RETROSPECTIVE],
    weight: 8,
    description: 'Survival analysis',
  },
  {
    pattern: /\b(incidence\s+rate|person[-\s]years|follow[-\s]up\s+(time|period))/i,
    designs: [StudyDesignType.COHORT_PROSPECTIVE],
    weight: 7,
    description: 'Incidence / follow-up',
  },
  {
    pattern: /\b(relative\s+risk|RR|risk\s+ratio)/i,
    designs: [StudyDesignType.COHORT_PROSPECTIVE, StudyDesignType.COHORT_RETROSPECTIVE],
    weight: 7,
    description: 'Relative risk',
  },
  
  // Case-control indicators
  {
    pattern: /\b(odds\s+ratio|OR|logistic\s+regression)/i,
    designs: [StudyDesignType.CASE_CONTROL],
    weight: 7,
    description: 'Odds ratio / logistic regression',
  },
  {
    pattern: /\b(match(ed|ing)\s+(case|control)|conditional\s+logistic)/i,
    designs: [StudyDesignType.CASE_CONTROL],
    weight: 8,
    description: 'Matched case-control',
  },
  
  // Cross-sectional indicators
  {
    pattern: /\b(prevalence|chi[-\s]square|χ2|fisher'?s?\s+exact)/i,
    designs: [StudyDesignType.CROSS_SECTIONAL],
    weight: 6,
    description: 'Prevalence / chi-square',
  },
  
  // Meta-analysis indicators
  {
    pattern: /\b(forest\s+plot|funnel\s+plot|meta[-\s]analysis)/i,
    designs: [StudyDesignType.META_ANALYSIS],
    weight: 10,
    description: 'Forest/funnel plot',
  },
  {
    pattern: /\b(heterogeneity|I\s*²|I[-\s]squared|tau\s*²|Q\s+statistic)/i,
    designs: [StudyDesignType.META_ANALYSIS],
    weight: 9,
    description: 'Heterogeneity assessment',
  },
  {
    pattern: /\b(fixed[-\s]effect|random[-\s]effect|pooled\s+(estimate|analysis))/i,
    designs: [StudyDesignType.META_ANALYSIS],
    weight: 8,
    description: 'Meta-analysis models',
  },
  {
    pattern: /\b(publication\s+bias|egger'?s?\s+test|begg'?s?\s+test)/i,
    designs: [StudyDesignType.META_ANALYSIS],
    weight: 7,
    description: 'Publication bias assessment',
  },
  
  // Diagnostic accuracy indicators
  {
    pattern: /\b(sensitivity|specificity|ROC\s+curve|AUC|area\s+under\s+(the\s+)?curve)/i,
    designs: [StudyDesignType.DIAGNOSTIC_ACCURACY],
    weight: 9,
    description: 'Diagnostic accuracy metrics',
  },
  {
    pattern: /\b(positive\s+predictive\s+value|PPV|negative\s+predictive\s+value|NPV)/i,
    designs: [StudyDesignType.DIAGNOSTIC_ACCURACY],
    weight: 8,
    description: 'Predictive values',
  },
  {
    pattern: /\b(gold\s+standard|reference\s+standard)/i,
    designs: [StudyDesignType.DIAGNOSTIC_ACCURACY],
    weight: 7,
    description: 'Reference standard',
  },
  
  // Cluster RCT indicators
  {
    pattern: /\b(intra[-\s]?cluster\s+correlation|ICC|design\s+effect|cluster[-\s]adjusted)/i,
    designs: [StudyDesignType.RCT_CLUSTER],
    weight: 9,
    description: 'Cluster RCT methods',
  },
  
  // Crossover RCT indicators
  {
    pattern: /\b(washout\s+period|carryover\s+effect|period\s+effect|sequence\s+effect)/i,
    designs: [StudyDesignType.RCT_CROSSOVER],
    weight: 9,
    description: 'Crossover RCT methods',
  },
];

/**
 * Reporting guideline patterns
 */
export const REPORTING_GUIDELINE_PATTERNS: StatisticalPattern[] = [
  {
    pattern: /\bCONSORT\b/i,
    designs: [
      StudyDesignType.RCT_PARALLEL,
      StudyDesignType.RCT_CROSSOVER,
      StudyDesignType.RCT_CLUSTER,
      StudyDesignType.RCT_FACTORIAL,
    ],
    weight: 9,
    description: 'CONSORT guideline',
  },
  {
    pattern: /\bPRISMA\b/i,
    designs: [StudyDesignType.SYSTEMATIC_REVIEW, StudyDesignType.META_ANALYSIS],
    weight: 10,
    description: 'PRISMA guideline',
  },
  {
    pattern: /\bSTROBE\b/i,
    designs: [
      StudyDesignType.COHORT_PROSPECTIVE,
      StudyDesignType.COHORT_RETROSPECTIVE,
      StudyDesignType.CASE_CONTROL,
      StudyDesignType.CROSS_SECTIONAL,
    ],
    weight: 8,
    description: 'STROBE guideline',
  },
  {
    pattern: /\bSTARD\b/i,
    designs: [StudyDesignType.DIAGNOSTIC_ACCURACY],
    weight: 9,
    description: 'STARD guideline',
  },
  {
    pattern: /\bTRIPOD\b/i,
    designs: [StudyDesignType.PREDICTION_MODEL],
    weight: 9,
    description: 'TRIPOD guideline',
  },
  {
    pattern: /\bCORE[-\s]?Q\b/i,
    designs: [
      StudyDesignType.PHENOMENOLOGY,
      StudyDesignType.GROUNDED_THEORY,
      StudyDesignType.ETHNOGRAPHY,
      StudyDesignType.QUALITATIVE_DESCRIPTIVE,
    ],
    weight: 8,
    description: 'COREQ guideline',
  },
  {
    pattern: /\bCARE\b/i,
    designs: [StudyDesignType.CASE_REPORT],
    weight: 9,
    description: 'CARE guideline',
  },
  {
    pattern: /\bMOOSE\b/i,
    designs: [StudyDesignType.META_ANALYSIS],
    weight: 8,
    description: 'MOOSE guideline',
  },
];

/**
 * Statistical method classifier
 */
export class StatisticalMethodClassifier {
  /**
   * Classify based on statistical methods mentioned in text
   */
  classify(text: string): Map<StudyDesignType, number> {
    logger.info('Classifying using statistical methods', {
      text_length: text.length,
    });
    
    const scores = new Map<StudyDesignType, number>();
    
    // Initialize all scores to 0
    Object.values(StudyDesignType).forEach((design) => {
      scores.set(design, 0);
    });
    
    // Check statistical patterns
    for (const pattern of STATISTICAL_PATTERNS) {
      if (pattern.pattern.test(text)) {
        pattern.designs.forEach((design) => {
          scores.set(design, (scores.get(design) || 0) + pattern.weight);
        });
        
        logger.info('Statistical pattern match', {
          description: pattern.description,
          designs: pattern.designs,
          weight: pattern.weight,
        });
      }
    }
    
    // Check reporting guidelines
    for (const guideline of REPORTING_GUIDELINE_PATTERNS) {
      if (guideline.pattern.test(text)) {
        guideline.designs.forEach((design) => {
          scores.set(design, (scores.get(design) || 0) + guideline.weight);
        });
        
        logger.info('Reporting guideline match', {
          description: guideline.description,
          designs: guideline.designs,
          weight: guideline.weight,
        });
      }
    }
    
    return scores;
  }
  
  /**
   * Get confidence from statistical method scores
   */
  getConfidence(scores: Map<StudyDesignType, number>): number {
    const values = Array.from(scores.values());
    if (values.length === 0) return 0;
    
    const maxScore = Math.max(...values);
    
    if (maxScore === 0 || !isFinite(maxScore)) return 0;
    
    // Statistical methods are reliable indicators
    // Score of 10 = 0.90 confidence
    // Score of 20 = 0.95 confidence
    // Score of 30+ = 0.98 confidence
    
    const confidence = Math.min(0.98, 0.5 + (maxScore / 40));
    
    return confidence;
  }
  
  /**
   * Get matched patterns for transparency
   */
  getMatchedPatterns(text: string): Array<{
    description: string;
    designs: StudyDesignType[];
    weight: number;
  }> {
    const matched: Array<{
      description: string;
      designs: StudyDesignType[];
      weight: number;
    }> = [];
    
    // Check statistical patterns
    for (const pattern of STATISTICAL_PATTERNS) {
      if (pattern.pattern.test(text)) {
        matched.push({
          description: pattern.description,
          designs: pattern.designs,
          weight: pattern.weight,
        });
      }
    }
    
    // Check reporting guidelines
    for (const guideline of REPORTING_GUIDELINE_PATTERNS) {
      if (guideline.pattern.test(text)) {
        matched.push({
          description: guideline.description,
          designs: guideline.designs,
          weight: guideline.weight,
        });
      }
    }
    
    return matched;
  }
}
