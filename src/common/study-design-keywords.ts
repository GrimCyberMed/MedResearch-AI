/**
 * Study Design Keywords for Classification
 * 
 * Comprehensive keyword dictionaries for rule-based study design classification.
 * Keywords are organized by study design type with weighted importance.
 */

import { StudyDesignType } from './study-design-taxonomy.js';

/**
 * Keyword with weight (importance)
 */
export interface WeightedKeyword {
  keyword: string;
  weight: number; // 1-10 (10 = highly specific, 1 = weak indicator)
  context?: 'title' | 'abstract' | 'methods' | 'any'; // Where keyword is most relevant
}

/**
 * Keyword dictionary for each study design
 */
export const STUDY_DESIGN_KEYWORDS: Record<StudyDesignType, WeightedKeyword[]> = {
  // ========================================
  // EXPERIMENTAL DESIGNS
  // ========================================
  
  [StudyDesignType.RCT_PARALLEL]: [
    { keyword: 'randomized controlled trial', weight: 10, context: 'any' },
    { keyword: 'randomised controlled trial', weight: 10, context: 'any' },
    { keyword: 'RCT', weight: 9, context: 'any' },
    { keyword: 'randomly assigned', weight: 8, context: 'methods' },
    { keyword: 'randomly allocated', weight: 8, context: 'methods' },
    { keyword: 'random allocation', weight: 8, context: 'methods' },
    { keyword: 'randomization', weight: 7, context: 'methods' },
    { keyword: 'randomisation', weight: 7, context: 'methods' },
    { keyword: 'placebo-controlled', weight: 7, context: 'any' },
    { keyword: 'double-blind', weight: 6, context: 'methods' },
    { keyword: 'triple-blind', weight: 6, context: 'methods' },
    { keyword: 'parallel group', weight: 6, context: 'methods' },
    { keyword: 'parallel-group', weight: 6, context: 'methods' },
    { keyword: 'treatment arm', weight: 5, context: 'methods' },
    { keyword: 'control arm', weight: 5, context: 'methods' },
    { keyword: 'intervention group', weight: 4, context: 'methods' },
    { keyword: 'control group', weight: 4, context: 'methods' },
    { keyword: 'CONSORT', weight: 8, context: 'any' },
  ],
  
  [StudyDesignType.RCT_CROSSOVER]: [
    { keyword: 'crossover', weight: 10, context: 'any' },
    { keyword: 'cross-over', weight: 10, context: 'any' },
    { keyword: 'crossover trial', weight: 10, context: 'any' },
    { keyword: 'washout period', weight: 9, context: 'methods' },
    { keyword: 'washout', weight: 8, context: 'methods' },
    { keyword: 'within-subject', weight: 7, context: 'methods' },
    { keyword: 'within subject', weight: 7, context: 'methods' },
    { keyword: 'carryover effect', weight: 7, context: 'methods' },
    { keyword: 'carry-over effect', weight: 7, context: 'methods' },
    { keyword: 'period effect', weight: 6, context: 'methods' },
    { keyword: 'sequence effect', weight: 6, context: 'methods' },
    { keyword: 'treatment order', weight: 5, context: 'methods' },
    { keyword: 'AB/BA design', weight: 9, context: 'methods' },
  ],
  
  [StudyDesignType.RCT_CLUSTER]: [
    { keyword: 'cluster randomized', weight: 10, context: 'any' },
    { keyword: 'cluster randomised', weight: 10, context: 'any' },
    { keyword: 'cluster RCT', weight: 10, context: 'any' },
    { keyword: 'cluster trial', weight: 9, context: 'any' },
    { keyword: 'group randomized', weight: 9, context: 'any' },
    { keyword: 'group-randomized', weight: 9, context: 'any' },
    { keyword: 'intracluster correlation', weight: 8, context: 'methods' },
    { keyword: 'ICC', weight: 7, context: 'methods' },
    { keyword: 'design effect', weight: 7, context: 'methods' },
    { keyword: 'cluster size', weight: 6, context: 'methods' },
    { keyword: 'community randomized', weight: 8, context: 'any' },
    { keyword: 'place randomized', weight: 8, context: 'any' },
  ],
  
  [StudyDesignType.RCT_FACTORIAL]: [
    { keyword: 'factorial', weight: 10, context: 'any' },
    { keyword: 'factorial design', weight: 10, context: 'any' },
    { keyword: 'factorial trial', weight: 10, context: 'any' },
    { keyword: '2x2 factorial', weight: 10, context: 'any' },
    { keyword: '2×2 factorial', weight: 10, context: 'any' },
    { keyword: 'interaction effect', weight: 7, context: 'methods' },
    { keyword: 'main effect', weight: 6, context: 'methods' },
    { keyword: 'multiple intervention', weight: 6, context: 'any' },
  ],
  
  [StudyDesignType.RCT_ADAPTIVE]: [
    { keyword: 'adaptive', weight: 9, context: 'any' },
    { keyword: 'adaptive design', weight: 10, context: 'any' },
    { keyword: 'adaptive trial', weight: 10, context: 'any' },
    { keyword: 'adaptive randomization', weight: 9, context: 'methods' },
    { keyword: 'response-adaptive', weight: 9, context: 'methods' },
    { keyword: 'interim analysis', weight: 7, context: 'methods' },
    { keyword: 'sample size re-estimation', weight: 8, context: 'methods' },
    { keyword: 'seamless design', weight: 8, context: 'any' },
    { keyword: 'seamless phase', weight: 8, context: 'any' },
  ],
  
  [StudyDesignType.RCT_STEPPED_WEDGE]: [
    { keyword: 'stepped wedge', weight: 10, context: 'any' },
    { keyword: 'stepped-wedge', weight: 10, context: 'any' },
    { keyword: 'stepped wedge design', weight: 10, context: 'any' },
    { keyword: 'sequential rollout', weight: 8, context: 'methods' },
    { keyword: 'staggered implementation', weight: 7, context: 'methods' },
  ],
  
  [StudyDesignType.QUASI_EXPERIMENTAL]: [
    { keyword: 'quasi-experimental', weight: 10, context: 'any' },
    { keyword: 'quasi experimental', weight: 10, context: 'any' },
    { keyword: 'non-randomized trial', weight: 8, context: 'any' },
    { keyword: 'non-randomised trial', weight: 8, context: 'any' },
    { keyword: 'interrupted time series', weight: 9, context: 'any' },
    { keyword: 'ITS', weight: 8, context: 'any' },
    { keyword: 'regression discontinuity', weight: 9, context: 'any' },
    { keyword: 'before-after', weight: 6, context: 'methods' },
    { keyword: 'pre-post', weight: 6, context: 'methods' },
    { keyword: 'controlled before-after', weight: 7, context: 'any' },
  ],
  
  [StudyDesignType.N_OF_1]: [
    { keyword: 'n-of-1', weight: 10, context: 'any' },
    { keyword: 'n of 1', weight: 10, context: 'any' },
    { keyword: 'single-patient trial', weight: 10, context: 'any' },
    { keyword: 'single patient trial', weight: 10, context: 'any' },
    { keyword: 'single-case', weight: 8, context: 'any' },
    { keyword: 'single case experimental', weight: 9, context: 'any' },
  ],
  
  // ========================================
  // OBSERVATIONAL DESIGNS
  // ========================================
  
  [StudyDesignType.COHORT_PROSPECTIVE]: [
    { keyword: 'prospective cohort', weight: 10, context: 'any' },
    { keyword: 'cohort study', weight: 8, context: 'any' },
    { keyword: 'longitudinal study', weight: 7, context: 'any' },
    { keyword: 'follow-up study', weight: 7, context: 'any' },
    { keyword: 'followed prospectively', weight: 8, context: 'methods' },
    { keyword: 'incidence', weight: 6, context: 'any' },
    { keyword: 'hazard ratio', weight: 7, context: 'any' },
    { keyword: 'relative risk', weight: 7, context: 'any' },
    { keyword: 'survival analysis', weight: 6, context: 'methods' },
    { keyword: 'Kaplan-Meier', weight: 6, context: 'methods' },
    { keyword: 'Cox regression', weight: 6, context: 'methods' },
    { keyword: 'loss to follow-up', weight: 5, context: 'methods' },
  ],
  
  [StudyDesignType.COHORT_RETROSPECTIVE]: [
    { keyword: 'retrospective cohort', weight: 10, context: 'any' },
    { keyword: 'historical cohort', weight: 9, context: 'any' },
    { keyword: 'non-concurrent cohort', weight: 9, context: 'any' },
    { keyword: 'medical record review', weight: 6, context: 'methods' },
    { keyword: 'chart review', weight: 6, context: 'methods' },
    { keyword: 'database study', weight: 5, context: 'methods' },
  ],
  
  [StudyDesignType.CASE_CONTROL]: [
    { keyword: 'case-control', weight: 10, context: 'any' },
    { keyword: 'case control', weight: 10, context: 'any' },
    { keyword: 'case-control study', weight: 10, context: 'any' },
    { keyword: 'odds ratio', weight: 8, context: 'any' },
    { keyword: 'OR', weight: 6, context: 'any' },
    { keyword: 'matched controls', weight: 8, context: 'methods' },
    { keyword: 'matching', weight: 6, context: 'methods' },
    { keyword: 'cases and controls', weight: 8, context: 'any' },
    { keyword: 'case-referent', weight: 9, context: 'any' },
    { keyword: 'recall bias', weight: 6, context: 'any' },
  ],
  
  [StudyDesignType.CROSS_SECTIONAL]: [
    { keyword: 'cross-sectional', weight: 10, context: 'any' },
    { keyword: 'cross sectional', weight: 10, context: 'any' },
    { keyword: 'prevalence study', weight: 9, context: 'any' },
    { keyword: 'prevalence', weight: 7, context: 'any' },
    { keyword: 'survey', weight: 6, context: 'any' },
    { keyword: 'questionnaire study', weight: 5, context: 'methods' },
    { keyword: 'point prevalence', weight: 8, context: 'any' },
  ],
  
  [StudyDesignType.CASE_REPORT]: [
    { keyword: 'case report', weight: 10, context: 'any' },
    { keyword: 'case study', weight: 8, context: 'any' },
    { keyword: 'single case', weight: 7, context: 'any' },
    { keyword: 'we report', weight: 6, context: 'abstract' },
    { keyword: 'we present', weight: 6, context: 'abstract' },
    { keyword: 'we describe', weight: 5, context: 'abstract' },
    { keyword: 'rare presentation', weight: 7, context: 'any' },
    { keyword: 'unusual case', weight: 7, context: 'any' },
    { keyword: 'unique case', weight: 7, context: 'any' },
    { keyword: 'interesting case', weight: 6, context: 'any' },
    { keyword: 'patient presented', weight: 5, context: 'abstract' },
    { keyword: 'year-old patient', weight: 5, context: 'abstract' },
    { keyword: 'clinical case', weight: 6, context: 'any' },
    { keyword: 'case presentation', weight: 7, context: 'any' },
  ],
  
  [StudyDesignType.CASE_SERIES]: [
    { keyword: 'case series', weight: 10, context: 'any' },
    { keyword: 'series of cases', weight: 9, context: 'any' },
    { keyword: 'consecutive cases', weight: 7, context: 'methods' },
    { keyword: 'case collection', weight: 8, context: 'any' },
  ],
  
  [StudyDesignType.ECOLOGICAL]: [
    { keyword: 'ecological study', weight: 10, context: 'any' },
    { keyword: 'ecological', weight: 7, context: 'any' },
    { keyword: 'aggregate data', weight: 7, context: 'methods' },
    { keyword: 'population-level', weight: 7, context: 'any' },
    { keyword: 'geographic variation', weight: 6, context: 'any' },
  ],
  
  // ========================================
  // REVIEW DESIGNS
  // ========================================
  
  [StudyDesignType.SYSTEMATIC_REVIEW]: [
    { keyword: 'systematic review', weight: 10, context: 'any' },
    { keyword: 'systematic literature review', weight: 10, context: 'any' },
    { keyword: 'PRISMA', weight: 9, context: 'any' },
    { keyword: 'comprehensive search', weight: 7, context: 'methods' },
    { keyword: 'search strategy', weight: 6, context: 'methods' },
    { keyword: 'inclusion criteria', weight: 5, context: 'methods' },
    { keyword: 'exclusion criteria', weight: 5, context: 'methods' },
    { keyword: 'quality assessment', weight: 6, context: 'methods' },
    { keyword: 'risk of bias', weight: 6, context: 'methods' },
    { keyword: 'data extraction', weight: 6, context: 'methods' },
    { keyword: 'Cochrane', weight: 8, context: 'any' },
  ],
  
  [StudyDesignType.META_ANALYSIS]: [
    { keyword: 'meta-analysis', weight: 10, context: 'any' },
    { keyword: 'meta analysis', weight: 10, context: 'any' },
    { keyword: 'pooled analysis', weight: 9, context: 'any' },
    { keyword: 'forest plot', weight: 8, context: 'any' },
    { keyword: 'heterogeneity', weight: 7, context: 'any' },
    { keyword: 'I-squared', weight: 7, context: 'any' },
    { keyword: 'I²', weight: 7, context: 'any' },
    { keyword: 'random effects', weight: 6, context: 'methods' },
    { keyword: 'fixed effects', weight: 6, context: 'methods' },
    { keyword: 'funnel plot', weight: 7, context: 'any' },
    { keyword: 'publication bias', weight: 6, context: 'any' },
    { keyword: 'pooled estimate', weight: 7, context: 'any' },
  ],
  
  [StudyDesignType.NETWORK_META_ANALYSIS]: [
    { keyword: 'network meta-analysis', weight: 10, context: 'any' },
    { keyword: 'network meta analysis', weight: 10, context: 'any' },
    { keyword: 'NMA', weight: 9, context: 'any' },
    { keyword: 'mixed treatment comparison', weight: 9, context: 'any' },
    { keyword: 'multiple treatment meta-analysis', weight: 9, context: 'any' },
    { keyword: 'indirect comparison', weight: 8, context: 'any' },
    { keyword: 'network plot', weight: 8, context: 'any' },
    { keyword: 'transitivity', weight: 7, context: 'methods' },
    { keyword: 'inconsistency', weight: 6, context: 'methods' },
  ],
  
  [StudyDesignType.SCOPING_REVIEW]: [
    { keyword: 'scoping review', weight: 10, context: 'any' },
    { keyword: 'scoping study', weight: 9, context: 'any' },
    { keyword: 'evidence map', weight: 8, context: 'any' },
    { keyword: 'mapping review', weight: 8, context: 'any' },
    { keyword: 'PRISMA-ScR', weight: 9, context: 'any' },
  ],
  
  [StudyDesignType.UMBRELLA_REVIEW]: [
    { keyword: 'umbrella review', weight: 10, context: 'any' },
    { keyword: 'overview of reviews', weight: 10, context: 'any' },
    { keyword: 'review of reviews', weight: 9, context: 'any' },
    { keyword: 'meta-review', weight: 8, context: 'any' },
  ],
  
  [StudyDesignType.RAPID_REVIEW]: [
    { keyword: 'rapid review', weight: 10, context: 'any' },
    { keyword: 'rapid evidence assessment', weight: 9, context: 'any' },
    { keyword: 'rapid systematic review', weight: 10, context: 'any' },
    { keyword: 'streamlined review', weight: 7, context: 'any' },
  ],
  
  [StudyDesignType.NARRATIVE_REVIEW]: [
    { keyword: 'narrative review', weight: 10, context: 'any' },
    { keyword: 'literature review', weight: 7, context: 'any' },
    { keyword: 'traditional review', weight: 8, context: 'any' },
    { keyword: 'non-systematic review', weight: 8, context: 'any' },
  ],
  
  // ========================================
  // QUALITATIVE DESIGNS
  // ========================================
  
  [StudyDesignType.PHENOMENOLOGY]: [
    { keyword: 'phenomenology', weight: 10, context: 'any' },
    { keyword: 'phenomenological', weight: 10, context: 'any' },
    { keyword: 'lived experience', weight: 8, context: 'any' },
    { keyword: 'essence of experience', weight: 8, context: 'any' },
    { keyword: 'interpretive phenomenological', weight: 9, context: 'any' },
    { keyword: 'IPA', weight: 7, context: 'any' },
  ],
  
  [StudyDesignType.GROUNDED_THEORY]: [
    { keyword: 'grounded theory', weight: 10, context: 'any' },
    { keyword: 'GT', weight: 7, context: 'any' },
    { keyword: 'theoretical sampling', weight: 8, context: 'methods' },
    { keyword: 'constant comparison', weight: 8, context: 'methods' },
    { keyword: 'theoretical saturation', weight: 8, context: 'methods' },
    { keyword: 'open coding', weight: 7, context: 'methods' },
    { keyword: 'axial coding', weight: 7, context: 'methods' },
    { keyword: 'selective coding', weight: 7, context: 'methods' },
  ],
  
  [StudyDesignType.ETHNOGRAPHY]: [
    { keyword: 'ethnography', weight: 10, context: 'any' },
    { keyword: 'ethnographic', weight: 10, context: 'any' },
    { keyword: 'participant observation', weight: 8, context: 'methods' },
    { keyword: 'fieldwork', weight: 7, context: 'methods' },
    { keyword: 'cultural', weight: 5, context: 'any' },
    { keyword: 'immersion', weight: 6, context: 'methods' },
  ],
  
  [StudyDesignType.QUALITATIVE_DESCRIPTIVE]: [
    { keyword: 'qualitative descriptive', weight: 10, context: 'any' },
    { keyword: 'descriptive qualitative', weight: 10, context: 'any' },
    { keyword: 'qualitative study', weight: 6, context: 'any' },
    { keyword: 'thematic analysis', weight: 7, context: 'methods' },
    { keyword: 'content analysis', weight: 7, context: 'methods' },
  ],
  
  // ========================================
  // MIXED METHODS DESIGNS
  // ========================================
  
  [StudyDesignType.CONVERGENT]: [
    { keyword: 'convergent', weight: 9, context: 'any' },
    { keyword: 'convergent design', weight: 10, context: 'any' },
    { keyword: 'concurrent triangulation', weight: 9, context: 'any' },
    { keyword: 'parallel mixed methods', weight: 9, context: 'any' },
    { keyword: 'mixed methods', weight: 7, context: 'any' },
    { keyword: 'triangulation', weight: 6, context: 'methods' },
    { keyword: 'quantitative and qualitative', weight: 8, context: 'any' },
    { keyword: 'qualitative and quantitative', weight: 8, context: 'any' },
    { keyword: 'survey and interview', weight: 7, context: 'methods' },
    { keyword: 'questionnaire and interview', weight: 7, context: 'methods' },
    { keyword: 'collected in parallel', weight: 7, context: 'methods' },
    { keyword: 'concurrent data collection', weight: 8, context: 'methods' },
    { keyword: 'integrated analysis', weight: 6, context: 'methods' },
    { keyword: 'merging data', weight: 7, context: 'methods' },
  ],
  
  [StudyDesignType.EXPLANATORY_SEQUENTIAL]: [
    { keyword: 'explanatory sequential', weight: 10, context: 'any' },
    { keyword: 'sequential explanatory', weight: 10, context: 'any' },
    { keyword: 'mixed methods', weight: 7, context: 'any' },
    { keyword: 'quantitative followed by qualitative', weight: 8, context: 'methods' },
  ],
  
  [StudyDesignType.EXPLORATORY_SEQUENTIAL]: [
    { keyword: 'exploratory sequential', weight: 10, context: 'any' },
    { keyword: 'sequential exploratory', weight: 10, context: 'any' },
    { keyword: 'mixed methods', weight: 7, context: 'any' },
    { keyword: 'qualitative followed by quantitative', weight: 8, context: 'methods' },
  ],
  
  // ========================================
  // DIAGNOSTIC DESIGNS
  // ========================================
  
  [StudyDesignType.DIAGNOSTIC_ACCURACY]: [
    { keyword: 'diagnostic accuracy', weight: 10, context: 'any' },
    { keyword: 'diagnostic test accuracy', weight: 10, context: 'any' },
    { keyword: 'DTA', weight: 8, context: 'any' },
    { keyword: 'sensitivity', weight: 7, context: 'any' },
    { keyword: 'specificity', weight: 7, context: 'any' },
    { keyword: 'ROC curve', weight: 8, context: 'any' },
    { keyword: 'AUC', weight: 7, context: 'any' },
    { keyword: 'area under curve', weight: 7, context: 'any' },
    { keyword: 'gold standard', weight: 7, context: 'methods' },
    { keyword: 'reference standard', weight: 7, context: 'methods' },
    { keyword: 'STARD', weight: 8, context: 'any' },
  ],
  
  // ========================================
  // PROGNOSTIC DESIGNS
  // ========================================
  
  [StudyDesignType.PROGNOSTIC_FACTOR]: [
    { keyword: 'prognostic factor', weight: 10, context: 'any' },
    { keyword: 'prognostic study', weight: 9, context: 'any' },
    { keyword: 'prognosis', weight: 7, context: 'any' },
    { keyword: 'risk factor', weight: 6, context: 'any' },
    { keyword: 'survival', weight: 5, context: 'any' },
    { keyword: 'outcome prediction', weight: 7, context: 'any' },
  ],
  
  [StudyDesignType.PREDICTION_MODEL]: [
    { keyword: 'prediction model', weight: 10, context: 'any' },
    { keyword: 'prognostic model', weight: 10, context: 'any' },
    { keyword: 'risk prediction', weight: 9, context: 'any' },
    { keyword: 'clinical prediction rule', weight: 9, context: 'any' },
    { keyword: 'risk score', weight: 8, context: 'any' },
    { keyword: 'TRIPOD', weight: 9, context: 'any' },
    { keyword: 'model development', weight: 7, context: 'methods' },
    { keyword: 'model validation', weight: 7, context: 'methods' },
  ],
  
  // ========================================
  // OTHER
  // ========================================
  
  [StudyDesignType.UNKNOWN]: [],
};

/**
 * Exclusion keywords (indicate NOT a certain design)
 */
export const EXCLUSION_KEYWORDS: Record<StudyDesignType, WeightedKeyword[]> = {
  [StudyDesignType.RCT_PARALLEL]: [
    { keyword: 'crossover', weight: 8, context: 'any' },
    { keyword: 'cluster', weight: 7, context: 'any' },
    { keyword: 'factorial', weight: 7, context: 'any' },
    { keyword: 'observational', weight: 9, context: 'any' },
    { keyword: 'non-randomized', weight: 9, context: 'any' },
  ],
  
  [StudyDesignType.RCT_CROSSOVER]: [
    { keyword: 'parallel', weight: 7, context: 'methods' },
    { keyword: 'between-subject', weight: 7, context: 'methods' },
  ],
  
  [StudyDesignType.COHORT_PROSPECTIVE]: [
    { keyword: 'randomized', weight: 9, context: 'any' },
    { keyword: 'case-control', weight: 9, context: 'any' },
    { keyword: 'cross-sectional', weight: 8, context: 'any' },
  ],
  
  [StudyDesignType.CASE_CONTROL]: [
    { keyword: 'randomized', weight: 9, context: 'any' },
    { keyword: 'cohort', weight: 8, context: 'any' },
    { keyword: 'prospective', weight: 7, context: 'any' },
  ],
  
  [StudyDesignType.SYSTEMATIC_REVIEW]: [
    { keyword: 'narrative review', weight: 8, context: 'any' },
    { keyword: 'non-systematic', weight: 9, context: 'any' },
  ],
  
  // Default: no exclusions for other types
  [StudyDesignType.RCT_CLUSTER]: [],
  [StudyDesignType.RCT_FACTORIAL]: [],
  [StudyDesignType.RCT_ADAPTIVE]: [],
  [StudyDesignType.RCT_STEPPED_WEDGE]: [],
  [StudyDesignType.QUASI_EXPERIMENTAL]: [],
  [StudyDesignType.N_OF_1]: [],
  [StudyDesignType.COHORT_RETROSPECTIVE]: [],
  [StudyDesignType.CROSS_SECTIONAL]: [],
  [StudyDesignType.CASE_REPORT]: [],
  [StudyDesignType.CASE_SERIES]: [],
  [StudyDesignType.ECOLOGICAL]: [],
  [StudyDesignType.META_ANALYSIS]: [],
  [StudyDesignType.NETWORK_META_ANALYSIS]: [],
  [StudyDesignType.SCOPING_REVIEW]: [],
  [StudyDesignType.UMBRELLA_REVIEW]: [],
  [StudyDesignType.RAPID_REVIEW]: [],
  [StudyDesignType.NARRATIVE_REVIEW]: [],
  [StudyDesignType.PHENOMENOLOGY]: [],
  [StudyDesignType.GROUNDED_THEORY]: [],
  [StudyDesignType.ETHNOGRAPHY]: [],
  [StudyDesignType.QUALITATIVE_DESCRIPTIVE]: [],
  [StudyDesignType.CONVERGENT]: [
    { keyword: 'sequential', weight: 8, context: 'any' },
    { keyword: 'followed by', weight: 7, context: 'methods' },
  ],
  [StudyDesignType.EXPLANATORY_SEQUENTIAL]: [
    { keyword: 'parallel', weight: 7, context: 'methods' },
    { keyword: 'concurrent', weight: 7, context: 'methods' },
    { keyword: 'triangulation', weight: 6, context: 'methods' },
  ],
  [StudyDesignType.EXPLORATORY_SEQUENTIAL]: [
    { keyword: 'parallel', weight: 7, context: 'methods' },
    { keyword: 'concurrent', weight: 7, context: 'methods' },
    { keyword: 'triangulation', weight: 6, context: 'methods' },
  ],
  [StudyDesignType.DIAGNOSTIC_ACCURACY]: [],
  [StudyDesignType.PROGNOSTIC_FACTOR]: [],
  [StudyDesignType.PREDICTION_MODEL]: [],
  [StudyDesignType.UNKNOWN]: [],
};

/**
 * Get keywords for a study design type
 */
export function getKeywordsForDesign(type: StudyDesignType): WeightedKeyword[] {
  return STUDY_DESIGN_KEYWORDS[type] || [];
}

/**
 * Get exclusion keywords for a study design type
 */
export function getExclusionKeywordsForDesign(type: StudyDesignType): WeightedKeyword[] {
  return EXCLUSION_KEYWORDS[type] || [];
}

/**
 * Get all keywords (flattened)
 */
export function getAllKeywords(): string[] {
  const allKeywords = new Set<string>();
  
  Object.values(STUDY_DESIGN_KEYWORDS).forEach((keywords) => {
    keywords.forEach((kw) => allKeywords.add(kw.keyword.toLowerCase()));
  });
  
  return Array.from(allKeywords);
}
