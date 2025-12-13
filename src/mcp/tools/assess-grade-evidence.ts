/**
 * GRADE Evidence Assessment
 * 
 * Implements the GRADE (Grading of Recommendations Assessment, Development and Evaluation)
 * framework for assessing quality of evidence and strength of recommendations:
 * 
 * - Starting quality based on study design
 * - 5 downgrading factors (risk of bias, inconsistency, indirectness, imprecision, publication bias)
 * - 3 upgrading factors (large effect, dose-response, confounders)
 * - Final quality rating (High/Moderate/Low/Very Low)
 * - Recommendation strength (Strong/Weak)
 * 
 * References:
 * - Guyatt et al. (2008) GRADE: an emerging consensus on rating quality of evidence
 * - Balshem et al. (2011) GRADE guidelines: 3. Rating the quality of evidence
 * - GRADE Working Group (2004) Grading quality of evidence and strength of recommendations
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Study design types for GRADE
 */
export type GRADEStudyDesign = 
  | 'randomized_trial'
  | 'observational'
  | 'case_series'
  | 'case_report';

/**
 * GRADE quality levels
 */
export type GRADEQuality = 'high' | 'moderate' | 'low' | 'very_low';

/**
 * GRADE recommendation strength
 */
export type GRADERecommendationStrength = 'strong' | 'weak';

/**
 * Downgrading severity
 */
export type DowngradeSeverity = 'none' | 'serious' | 'very_serious';

/**
 * Upgrading level
 */
export type UpgradeLevel = 'none' | 'one_level' | 'two_levels';

/**
 * Risk of bias assessment for GRADE
 */
export interface GRADERiskOfBias {
  /** Overall risk of bias */
  overall_risk: 'low' | 'unclear' | 'high';
  
  /** Downgrade decision */
  downgrade: DowngradeSeverity;
  
  /** Rationale */
  rationale: string;
  
  /** Supporting evidence */
  evidence?: string[];
}

/**
 * Inconsistency assessment
 */
export interface GRADEInconsistency {
  /** I² statistic (if available) */
  i_squared?: number;
  
  /** Confidence intervals overlap? */
  ci_overlap: boolean;
  
  /** Point estimates similar? */
  point_estimates_similar: boolean;
  
  /** Downgrade decision */
  downgrade: DowngradeSeverity;
  
  /** Rationale */
  rationale: string;
}

/**
 * Indirectness assessment
 */
export interface GRADEIndirectness {
  /** Population matches PICO? */
  population_match: boolean;
  
  /** Intervention matches PICO? */
  intervention_match: boolean;
  
  /** Comparison matches PICO? */
  comparison_match: boolean;
  
  /** Outcome matches PICO? */
  outcome_match: boolean;
  
  /** Downgrade decision */
  downgrade: DowngradeSeverity;
  
  /** Rationale */
  rationale: string;
}

/**
 * Imprecision assessment
 */
export interface GRADEImprecision {
  /** Sample size adequate? */
  adequate_sample_size: boolean;
  
  /** Confidence interval width */
  ci_width?: 'narrow' | 'wide' | 'very_wide';
  
  /** Crosses null effect? */
  crosses_null: boolean;
  
  /** Optimal information size met? */
  ois_met: boolean;
  
  /** Downgrade decision */
  downgrade: DowngradeSeverity;
  
  /** Rationale */
  rationale: string;
}

/**
 * Publication bias assessment
 */
export interface GRADEPublicationBias {
  /** Funnel plot asymmetry? */
  funnel_asymmetry: boolean;
  
  /** Egger's test significant? */
  eggers_significant?: boolean;
  
  /** Industry funding? */
  industry_funded: boolean;
  
  /** Downgrade decision */
  downgrade: DowngradeSeverity;
  
  /** Rationale */
  rationale: string;
}

/**
 * Large effect upgrading
 */
export interface GRADELargeEffect {
  /** Effect size magnitude */
  effect_magnitude: 'small' | 'moderate' | 'large' | 'very_large';
  
  /** RR or OR value (if applicable) */
  ratio_value?: number;
  
  /** Upgrade decision */
  upgrade: UpgradeLevel;
  
  /** Rationale */
  rationale: string;
}

/**
 * Dose-response gradient
 */
export interface GRADEDoseResponse {
  /** Dose-response present? */
  gradient_present: boolean;
  
  /** Upgrade decision */
  upgrade: UpgradeLevel;
  
  /** Rationale */
  rationale: string;
}

/**
 * Confounders assessment
 */
export interface GRADEConfounders {
  /** All plausible confounders would reduce effect? */
  would_reduce_effect: boolean;
  
  /** Upgrade decision */
  upgrade: UpgradeLevel;
  
  /** Rationale */
  rationale: string;
}

/**
 * GRADE evidence assessment result
 */
export interface GRADEAssessment {
  /** Outcome being assessed */
  outcome: string;
  
  /** Study design */
  study_design: GRADEStudyDesign;
  
  /** Starting quality */
  starting_quality: GRADEQuality;
  
  /** Downgrading factors */
  downgrading: {
    risk_of_bias: GRADERiskOfBias;
    inconsistency: GRADEInconsistency;
    indirectness: GRADEIndirectness;
    imprecision: GRADEImprecision;
    publication_bias: GRADEPublicationBias;
  };
  
  /** Upgrading factors (only for observational studies) */
  upgrading?: {
    large_effect: GRADELargeEffect;
    dose_response: GRADEDoseResponse;
    confounders: GRADEConfounders;
  };
  
  /** Total downgrades */
  total_downgrades: number;
  
  /** Total upgrades */
  total_upgrades: number;
  
  /** Final quality */
  final_quality: GRADEQuality;
  
  /** Quality of evidence explanation */
  quality_explanation: string;
  
  /** Recommendation strength (if applicable) */
  recommendation?: {
    strength: GRADERecommendationStrength;
    rationale: string;
  };
  
  /** Confidence in the assessment (0-1) */
  confidence: number;
  
  /** Warnings */
  warnings: string[];
}

/**
 * Determine starting quality based on study design
 */
function getStartingQuality(design: GRADEStudyDesign): GRADEQuality {
  switch (design) {
    case 'randomized_trial':
      return 'high';
    case 'observational':
      return 'low';
    case 'case_series':
    case 'case_report':
      return 'very_low';
    default:
      return 'low';
  }
}

/**
 * Calculate total downgrades
 */
function calculateTotalDowngrades(downgrading: GRADEAssessment['downgrading']): number {
  let total = 0;
  
  const factors = [
    downgrading.risk_of_bias.downgrade,
    downgrading.inconsistency.downgrade,
    downgrading.indirectness.downgrade,
    downgrading.imprecision.downgrade,
    downgrading.publication_bias.downgrade,
  ];
  
  for (const factor of factors) {
    if (factor === 'serious') total += 1;
    if (factor === 'very_serious') total += 2;
  }
  
  return total;
}

/**
 * Calculate total upgrades
 */
function calculateTotalUpgrades(upgrading?: GRADEAssessment['upgrading']): number {
  if (!upgrading) return 0;
  
  let total = 0;
  
  const factors = [
    upgrading.large_effect.upgrade,
    upgrading.dose_response.upgrade,
    upgrading.confounders.upgrade,
  ];
  
  for (const factor of factors) {
    if (factor === 'one_level') total += 1;
    if (factor === 'two_levels') total += 2;
  }
  
  return total;
}

/**
 * Calculate final quality
 */
function calculateFinalQuality(
  startingQuality: GRADEQuality,
  downgrades: number,
  upgrades: number,
  studyDesign: GRADEStudyDesign
): GRADEQuality {
  const qualityLevels: GRADEQuality[] = ['very_low', 'low', 'moderate', 'high'];
  
  let currentLevel = qualityLevels.indexOf(startingQuality);
  
  // Apply downgrades
  currentLevel -= downgrades;
  
  // Clamp after downgrades
  currentLevel = Math.max(0, Math.min(3, currentLevel));
  
  // Apply upgrades (only for observational studies)
  if (studyDesign === 'observational') {
    currentLevel += upgrades;
  }
  
  // Clamp to valid range
  currentLevel = Math.max(0, Math.min(3, currentLevel));
  
  return qualityLevels[currentLevel];
}

/**
 * Generate quality explanation
 */
function generateQualityExplanation(
  startingQuality: GRADEQuality,
  finalQuality: GRADEQuality,
  downgrades: number,
  upgrades: number,
  downgrading: GRADEAssessment['downgrading']
): string {
  let explanation = `Started at ${startingQuality} quality. `;
  
  if (downgrades > 0) {
    explanation += `Downgraded ${downgrades} level(s) due to: `;
    const reasons: string[] = [];
    
    if (downgrading.risk_of_bias.downgrade !== 'none') {
      reasons.push(`risk of bias (${downgrading.risk_of_bias.downgrade})`);
    }
    if (downgrading.inconsistency.downgrade !== 'none') {
      reasons.push(`inconsistency (${downgrading.inconsistency.downgrade})`);
    }
    if (downgrading.indirectness.downgrade !== 'none') {
      reasons.push(`indirectness (${downgrading.indirectness.downgrade})`);
    }
    if (downgrading.imprecision.downgrade !== 'none') {
      reasons.push(`imprecision (${downgrading.imprecision.downgrade})`);
    }
    if (downgrading.publication_bias.downgrade !== 'none') {
      reasons.push(`publication bias (${downgrading.publication_bias.downgrade})`);
    }
    
    explanation += reasons.join(', ') + '. ';
  }
  
  if (upgrades > 0) {
    explanation += `Upgraded ${upgrades} level(s). `;
  }
  
  explanation += `Final quality: ${finalQuality}.`;
  
  return explanation;
}

/**
 * Assess evidence quality using GRADE
 */
export function assessGRADEEvidence(
  outcome: string,
  studyDesign: GRADEStudyDesign,
  downgrading: GRADEAssessment['downgrading'],
  upgrading?: GRADEAssessment['upgrading']
): GRADEAssessment {
  const warnings: string[] = [];
  
  // Determine starting quality
  const startingQuality = getStartingQuality(studyDesign);
  
  // Calculate total downgrades and upgrades
  const totalDowngrades = calculateTotalDowngrades(downgrading);
  const totalUpgrades = calculateTotalUpgrades(upgrading);
  
  // Upgrading only applies to observational studies
  if (upgrading && studyDesign === 'randomized_trial') {
    warnings.push('Upgrading factors do not apply to randomized trials');
  }
  
  // Calculate final quality
  const finalQuality = calculateFinalQuality(startingQuality, totalDowngrades, totalUpgrades, studyDesign);
  
  // Generate explanation
  const qualityExplanation = generateQualityExplanation(
    startingQuality,
    finalQuality,
    totalDowngrades,
    totalUpgrades,
    downgrading
  );
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Reduce confidence if many "unclear" assessments
  const unclearCount = [
    downgrading.risk_of_bias.overall_risk === 'unclear' ? 1 : 0,
    !downgrading.inconsistency.ci_overlap && !downgrading.inconsistency.point_estimates_similar ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  
  if (unclearCount > 1) {
    confidence -= 0.1;
    warnings.push('Multiple unclear assessments - consider additional review');
  }
  
  // Reduce confidence for very low quality
  if (finalQuality === 'very_low') {
    confidence -= 0.1;
    warnings.push('Very low quality evidence - interpret with extreme caution');
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    outcome,
    study_design: studyDesign,
    starting_quality: startingQuality,
    downgrading,
    upgrading: studyDesign === 'observational' ? upgrading : undefined,
    total_downgrades: totalDowngrades,
    total_upgrades: totalUpgrades,
    final_quality: finalQuality,
    quality_explanation: qualityExplanation,
    confidence,
    warnings,
  };
}

/**
 * Determine recommendation strength
 */
export function determineRecommendationStrength(
  evidenceQuality: GRADEQuality,
  balanceOfBenefitsAndHarms: 'clearly_favors' | 'probably_favors' | 'uncertain',
  valuesAndPreferences: 'consistent' | 'variable',
  resourceUse: 'low' | 'moderate' | 'high'
): {
  strength: GRADERecommendationStrength;
  rationale: string;
} {
  // Strong recommendation criteria:
  // - High quality evidence
  // - Benefits clearly outweigh harms
  // - Consistent values and preferences
  
  if (
    evidenceQuality === 'high' &&
    balanceOfBenefitsAndHarms === 'clearly_favors' &&
    valuesAndPreferences === 'consistent'
  ) {
    return {
      strength: 'strong',
      rationale: 'High quality evidence, benefits clearly outweigh harms, consistent values and preferences',
    };
  }
  
  // Weak recommendation for:
  // - Lower quality evidence
  // - Uncertain balance
  // - Variable preferences
  // - High resource use
  
  const weakReasons: string[] = [];
  
  if (evidenceQuality === 'low' || evidenceQuality === 'very_low') {
    weakReasons.push('low quality evidence');
  }
  
  if (balanceOfBenefitsAndHarms !== 'clearly_favors') {
    weakReasons.push('uncertain balance of benefits and harms');
  }
  
  if (valuesAndPreferences === 'variable') {
    weakReasons.push('variable patient values and preferences');
  }
  
  if (resourceUse === 'high') {
    weakReasons.push('high resource use');
  }
  
  if (weakReasons.length > 0) {
    return {
      strength: 'weak',
      rationale: `Weak recommendation due to: ${weakReasons.join(', ')}`,
    };
  }
  
  // Default to weak if not clearly strong
  return {
    strength: 'weak',
    rationale: 'Moderate quality evidence with probably favorable balance',
  };
}

/**
 * MCP tool interface for GRADE evidence assessment
 */
export async function assessGRADEEvidenceMCP(args: {
  outcome: string;
  study_design: GRADEStudyDesign;
  downgrading: GRADEAssessment['downgrading'];
  upgrading?: GRADEAssessment['upgrading'];
  recommendation_inputs?: {
    balance_of_benefits_and_harms: 'clearly_favors' | 'probably_favors' | 'uncertain';
    values_and_preferences: 'consistent' | 'variable';
    resource_use: 'low' | 'moderate' | 'high';
  };
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Assessing GRADE evidence quality', {
      outcome: args.outcome,
      study_design: args.study_design,
    });
    
    const result = assessGRADEEvidence(
      args.outcome,
      args.study_design,
      args.downgrading,
      args.upgrading
    );
    
    // Add recommendation if inputs provided
    if (args.recommendation_inputs) {
      result.recommendation = determineRecommendationStrength(
        result.final_quality,
        args.recommendation_inputs.balance_of_benefits_and_harms,
        args.recommendation_inputs.values_and_preferences,
        args.recommendation_inputs.resource_use
      );
    }
    
    logger.info('GRADE assessment complete', {
      final_quality: result.final_quality,
      total_downgrades: result.total_downgrades,
      total_upgrades: result.total_upgrades,
      confidence: result.confidence,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('Error assessing GRADE evidence', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error assessing GRADE evidence: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
