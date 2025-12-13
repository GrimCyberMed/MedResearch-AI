/**
 * Quality Assessment Framework
 * 
 * Modular framework for assessing study quality using various tools:
 * - Cochrane RoB 2.0 (RCTs)
 * - Newcastle-Ottawa Scale (Cohort/Case-Control)
 * - QUADAS-2 (Diagnostic Accuracy)
 * - CASP (Qualitative)
 * - JBI Critical Appraisal (Cross-sectional, Case Reports)
 * - AMSTAR-2 (Systematic Reviews)
 * 
 * @version 6.0.0-beta
 */

import { StudyDesignType } from './study-design-taxonomy.js';

/**
 * Risk of bias levels (standard across most tools)
 */
export enum RiskLevel {
  LOW = 'low',
  UNCLEAR = 'unclear',
  HIGH = 'high',
  SOME_CONCERNS = 'some_concerns', // RoB 2.0 specific
}

/**
 * Quality rating (for tools that use ratings instead of risk)
 */
export enum QualityRating {
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICALLY_LOW = 'critically_low', // AMSTAR-2
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
}

/**
 * Response options for quality items
 */
export enum ResponseOption {
  YES = 'yes',
  NO = 'no',
  UNCLEAR = 'unclear',
  NOT_APPLICABLE = 'not_applicable',
  PARTIAL_YES = 'partial_yes', // AMSTAR-2
}

/**
 * Supporting evidence for a judgment
 */
export interface Evidence {
  /** Quote from the study text */
  quote: string;
  
  /** Location in the study (abstract, methods, results, etc.) */
  location: 'title' | 'abstract' | 'methods' | 'results' | 'discussion' | 'full_text';
  
  /** Confidence in this evidence (0-1) */
  confidence: number;
  
  /** Why this evidence supports the judgment */
  rationale?: string;
}

/**
 * A single quality assessment item/question
 */
export interface QualityItem {
  /** Unique identifier for this item */
  id: string;
  
  /** The question/criterion being assessed */
  question: string;
  
  /** Detailed guidance for answering this question */
  guidance?: string;
  
  /** Response to this item */
  response: ResponseOption;
  
  /** Risk level or quality rating for this item */
  risk?: RiskLevel;
  rating?: QualityRating;
  
  /** Supporting evidence from the study */
  evidence: Evidence[];
  
  /** Reviewer's notes/comments */
  notes?: string;
  
  /** Whether this item was auto-assessed or manual */
  auto_assessed: boolean;
  
  /** Confidence in the auto-assessment (0-1) */
  confidence?: number;
}

/**
 * A domain/section of a quality assessment tool
 * (e.g., "Randomization process" in RoB 2.0)
 */
export interface QualityDomain {
  /** Unique identifier for this domain */
  id: string;
  
  /** Domain name */
  name: string;
  
  /** Domain description */
  description?: string;
  
  /** Items/questions in this domain */
  items: QualityItem[];
  
  /** Overall risk/rating for this domain */
  overall_risk?: RiskLevel;
  overall_rating?: QualityRating;
  
  /** Rationale for the overall judgment */
  rationale?: string;
  
  /** Whether this domain is applicable to this study */
  applicable: boolean;
}

/**
 * Complete quality assessment for a study
 */
export interface QualityAssessment {
  /** Study identifier */
  study_id: string;
  
  /** Study design type */
  study_design: StudyDesignType;
  
  /** Quality assessment tool used */
  tool: QualityTool;
  
  /** Version of the tool */
  tool_version: string;
  
  /** Domains assessed */
  domains: QualityDomain[];
  
  /** Overall quality judgment */
  overall_risk?: RiskLevel;
  overall_rating?: QualityRating;
  overall_score?: number; // For tools that use numeric scores (e.g., Newcastle-Ottawa)
  
  /** Overall rationale */
  overall_rationale?: string;
  
  /** Reviewer information */
  reviewer?: string;
  review_date?: Date;
  
  /** Whether this was auto-assessed */
  auto_assessed: boolean;
  
  /** Confidence in auto-assessment (0-1) */
  confidence?: number;
  
  /** Flags for manual review */
  requires_review: boolean;
  review_reasons?: string[];
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Quality assessment tools
 */
export enum QualityTool {
  // RCT tools
  ROB2 = 'rob2', // Cochrane Risk of Bias 2.0
  JADAD = 'jadad', // Jadad scale
  
  // Observational tools
  NEWCASTLE_OTTAWA_COHORT = 'newcastle_ottawa_cohort',
  NEWCASTLE_OTTAWA_CASE_CONTROL = 'newcastle_ottawa_case_control',
  
  // Diagnostic tools
  QUADAS2 = 'quadas2', // Quality Assessment of Diagnostic Accuracy Studies
  
  // Qualitative tools
  CASP_QUALITATIVE = 'casp_qualitative', // Critical Appraisal Skills Programme
  
  // JBI tools
  JBI_CROSS_SECTIONAL = 'jbi_cross_sectional',
  JBI_CASE_REPORT = 'jbi_case_report',
  JBI_CASE_SERIES = 'jbi_case_series',
  
  // Review tools
  AMSTAR2 = 'amstar2', // A MeaSurement Tool to Assess systematic Reviews
  ROBIS = 'robis', // Risk Of Bias In Systematic reviews
  
  // Other
  GRADE = 'grade', // Grading of Recommendations Assessment
}

/**
 * Mapping of study designs to recommended quality tools
 */
export const QUALITY_TOOL_MAPPING: Record<StudyDesignType, QualityTool[]> = {
  // RCTs
  [StudyDesignType.RCT_PARALLEL]: [QualityTool.ROB2, QualityTool.JADAD],
  [StudyDesignType.RCT_CROSSOVER]: [QualityTool.ROB2],
  [StudyDesignType.RCT_CLUSTER]: [QualityTool.ROB2],
  [StudyDesignType.RCT_FACTORIAL]: [QualityTool.ROB2],
  [StudyDesignType.RCT_ADAPTIVE]: [QualityTool.ROB2],
  [StudyDesignType.RCT_STEPPED_WEDGE]: [QualityTool.ROB2],
  
  // Quasi-experimental
  [StudyDesignType.QUASI_EXPERIMENTAL]: [QualityTool.NEWCASTLE_OTTAWA_COHORT],
  [StudyDesignType.N_OF_1]: [QualityTool.ROB2],
  
  // Observational
  [StudyDesignType.COHORT_PROSPECTIVE]: [QualityTool.NEWCASTLE_OTTAWA_COHORT],
  [StudyDesignType.COHORT_RETROSPECTIVE]: [QualityTool.NEWCASTLE_OTTAWA_COHORT],
  [StudyDesignType.CASE_CONTROL]: [QualityTool.NEWCASTLE_OTTAWA_CASE_CONTROL],
  [StudyDesignType.CROSS_SECTIONAL]: [QualityTool.JBI_CROSS_SECTIONAL],
  [StudyDesignType.CASE_REPORT]: [QualityTool.JBI_CASE_REPORT],
  [StudyDesignType.CASE_SERIES]: [QualityTool.JBI_CASE_SERIES],
  [StudyDesignType.ECOLOGICAL]: [QualityTool.JBI_CROSS_SECTIONAL],
  
  // Reviews
  [StudyDesignType.SYSTEMATIC_REVIEW]: [QualityTool.AMSTAR2, QualityTool.ROBIS],
  [StudyDesignType.META_ANALYSIS]: [QualityTool.AMSTAR2],
  [StudyDesignType.NETWORK_META_ANALYSIS]: [QualityTool.AMSTAR2],
  [StudyDesignType.SCOPING_REVIEW]: [QualityTool.AMSTAR2],
  [StudyDesignType.UMBRELLA_REVIEW]: [QualityTool.AMSTAR2],
  [StudyDesignType.RAPID_REVIEW]: [QualityTool.AMSTAR2],
  [StudyDesignType.NARRATIVE_REVIEW]: [], // No standard tool
  
  // Qualitative
  [StudyDesignType.PHENOMENOLOGY]: [QualityTool.CASP_QUALITATIVE],
  [StudyDesignType.GROUNDED_THEORY]: [QualityTool.CASP_QUALITATIVE],
  [StudyDesignType.ETHNOGRAPHY]: [QualityTool.CASP_QUALITATIVE],
  [StudyDesignType.QUALITATIVE_DESCRIPTIVE]: [QualityTool.CASP_QUALITATIVE],
  
  // Mixed methods
  [StudyDesignType.CONVERGENT]: [QualityTool.CASP_QUALITATIVE], // Assess qualitative component
  [StudyDesignType.EXPLANATORY_SEQUENTIAL]: [QualityTool.CASP_QUALITATIVE],
  [StudyDesignType.EXPLORATORY_SEQUENTIAL]: [QualityTool.CASP_QUALITATIVE],
  
  // Diagnostic/Prognostic
  [StudyDesignType.DIAGNOSTIC_ACCURACY]: [QualityTool.QUADAS2],
  [StudyDesignType.PROGNOSTIC_FACTOR]: [QualityTool.NEWCASTLE_OTTAWA_COHORT],
  [StudyDesignType.PREDICTION_MODEL]: [QualityTool.NEWCASTLE_OTTAWA_COHORT],
  
  // Unknown
  [StudyDesignType.UNKNOWN]: [],
};

/**
 * Get recommended quality tools for a study design
 */
export function getRecommendedQualityTools(design: StudyDesignType): QualityTool[] {
  return QUALITY_TOOL_MAPPING[design] || [];
}

/**
 * Base class for quality assessment tools
 */
export abstract class QualityAssessmentTool {
  /** Tool identifier */
  abstract readonly tool: QualityTool;
  
  /** Tool version */
  abstract readonly version: string;
  
  /** Tool name */
  abstract readonly name: string;
  
  /** Tool description */
  abstract readonly description: string;
  
  /** Applicable study designs */
  abstract readonly applicableDesigns: StudyDesignType[];
  
  /**
   * Assess study quality
   */
  abstract assess(study: {
    id: string;
    design: StudyDesignType;
    title: string;
    abstract?: string;
    methods?: string;
    results?: string;
    discussion?: string;
    full_text?: string;
  }): Promise<QualityAssessment>;
  
  /**
   * Validate that this tool is applicable to the study design
   */
  protected validateDesign(design: StudyDesignType): void {
    if (!this.applicableDesigns.includes(design)) {
      throw new Error(
        `${this.name} is not applicable to ${design}. ` +
        `Applicable designs: ${this.applicableDesigns.join(', ')}`
      );
    }
  }
  
  /**
   * Extract evidence from study text
   */
  protected extractEvidence(
    text: string,
    keywords: string[],
    location: Evidence['location']
  ): Evidence[] {
    const evidence: Evidence[] = [];
    
    // Simple keyword-based extraction (can be enhanced with NLP)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      for (const keyword of keywords) {
        if (lowerSentence.includes(keyword.toLowerCase())) {
          evidence.push({
            quote: sentence.trim(),
            location,
            confidence: 0.7, // Moderate confidence for keyword matching
            rationale: `Contains keyword: "${keyword}"`,
          });
        }
      }
    }
    
    return evidence;
  }
  
  /**
   * Calculate overall risk from domain risks
   */
  protected calculateOverallRisk(domains: QualityDomain[]): RiskLevel {
    const risks = domains
      .filter(d => d.applicable && d.overall_risk)
      .map(d => d.overall_risk!);
    
    // If any domain is high risk, overall is high
    if (risks.includes(RiskLevel.HIGH)) {
      return RiskLevel.HIGH;
    }
    
    // If any domain has some concerns, overall has some concerns
    if (risks.includes(RiskLevel.SOME_CONCERNS)) {
      return RiskLevel.SOME_CONCERNS;
    }
    
    // If any domain is unclear, overall is unclear
    if (risks.includes(RiskLevel.UNCLEAR)) {
      return RiskLevel.UNCLEAR;
    }
    
    // All domains are low risk
    return RiskLevel.LOW;
  }
  
  /**
   * Determine if manual review is needed
   */
  protected requiresReview(assessment: QualityAssessment): boolean {
    // Review needed if:
    // 1. Low confidence in auto-assessment
    if (assessment.confidence && assessment.confidence < 0.7) {
      return true;
    }
    
    // 2. High risk of bias
    if (assessment.overall_risk === RiskLevel.HIGH) {
      return true;
    }
    
    // 3. Many unclear judgments
    const unclearCount = assessment.domains
      .flatMap(d => d.items)
      .filter(i => i.response === ResponseOption.UNCLEAR).length;
    
    if (unclearCount > 2) {
      return true;
    }
    
    return false;
  }
}

/**
 * Helper function to create a quality item
 */
export function createQualityItem(
  id: string,
  question: string,
  response: ResponseOption = ResponseOption.UNCLEAR,
  options?: {
    guidance?: string;
    risk?: RiskLevel;
    rating?: QualityRating;
    evidence?: Evidence[];
    notes?: string;
    auto_assessed?: boolean;
    confidence?: number;
  }
): QualityItem {
  return {
    id,
    question,
    guidance: options?.guidance,
    response,
    risk: options?.risk,
    rating: options?.rating,
    evidence: options?.evidence || [],
    notes: options?.notes,
    auto_assessed: options?.auto_assessed ?? false,
    confidence: options?.confidence,
  };
}

/**
 * Helper function to create a quality domain
 */
export function createQualityDomain(
  id: string,
  name: string,
  items: QualityItem[],
  options?: {
    description?: string;
    overall_risk?: RiskLevel;
    overall_rating?: QualityRating;
    rationale?: string;
    applicable?: boolean;
  }
): QualityDomain {
  return {
    id,
    name,
    description: options?.description,
    items,
    overall_risk: options?.overall_risk,
    overall_rating: options?.overall_rating,
    rationale: options?.rationale,
    applicable: options?.applicable ?? true,
  };
}
