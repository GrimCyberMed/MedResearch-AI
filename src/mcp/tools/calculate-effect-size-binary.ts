/**
 * Binary Effect Size Calculation
 * 
 * Calculates effect sizes for binary outcomes (2x2 tables):
 * - Odds Ratio (OR)
 * - Risk Ratio (RR)
 * - Risk Difference (RD)
 * 
 * Includes:
 * - 95% confidence intervals
 * - Standard errors
 * - Weights for meta-analysis
 * - Continuity correction for zero cells
 * - Conservative confidence scoring
 * 
 * References:
 * - Cochrane Handbook for Systematic Reviews (Chapter 6)
 * - Borenstein et al. (2009) Introduction to Meta-Analysis
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Binary outcome data (2x2 table)
 */
export interface BinaryData {
  /** Events in intervention group */
  events_intervention: number;
  
  /** Total participants in intervention group */
  total_intervention: number;
  
  /** Events in control group */
  events_control: number;
  
  /** Total participants in control group */
  total_control: number;
}

/**
 * Effect size result for binary outcomes
 */
export interface BinaryEffectSize {
  /** Effect measure used */
  measure: 'OR' | 'RR' | 'RD';
  
  /** Effect size estimate */
  effect_size: number;
  
  /** 95% confidence interval */
  ci_lower: number;
  ci_upper: number;
  
  /** Standard error */
  standard_error: number;
  
  /** Weight for meta-analysis (inverse variance) */
  weight: number;
  
  /** Log effect size (for OR and RR) */
  log_effect_size?: number;
  log_se?: number;
  
  /** Input data */
  data: BinaryData;
  
  /** Whether continuity correction was applied */
  continuity_correction_applied: boolean;
  
  /** Confidence in the calculation (0-1) */
  confidence: number;
  
  /** Warnings about the data */
  warnings: string[];
  
  /** Calculation details */
  details: {
    risk_intervention: number;
    risk_control: number;
    sample_size_total: number;
  };
}

/**
 * Validate binary data
 */
function validateBinaryData(data: BinaryData): string[] {
  const errors: string[] = [];
  
  // Check for negative values
  if (data.events_intervention < 0) errors.push('Events in intervention group cannot be negative');
  if (data.events_control < 0) errors.push('Events in control group cannot be negative');
  if (data.total_intervention <= 0) errors.push('Total in intervention group must be positive');
  if (data.total_control <= 0) errors.push('Total in control group must be positive');
  
  // Check that events don't exceed totals
  if (data.events_intervention > data.total_intervention) {
    errors.push('Events in intervention group cannot exceed total');
  }
  if (data.events_control > data.total_control) {
    errors.push('Events in control group cannot exceed total');
  }
  
  // Check for non-integer values
  if (!Number.isInteger(data.events_intervention)) errors.push('Events in intervention must be integer');
  if (!Number.isInteger(data.events_control)) errors.push('Events in control must be integer');
  if (!Number.isInteger(data.total_intervention)) errors.push('Total in intervention must be integer');
  if (!Number.isInteger(data.total_control)) errors.push('Total in control must be integer');
  
  return errors;
}

/**
 * Check if continuity correction is needed
 */
function needsContinuityCorrection(data: BinaryData): boolean {
  const nonEvents_intervention = data.total_intervention - data.events_intervention;
  const nonEvents_control = data.total_control - data.events_control;
  
  return (
    data.events_intervention === 0 ||
    data.events_control === 0 ||
    nonEvents_intervention === 0 ||
    nonEvents_control === 0
  );
}

/**
 * Apply continuity correction (add 0.5 to all cells)
 */
function applyContinuityCorrection(data: BinaryData): BinaryData {
  return {
    events_intervention: data.events_intervention + 0.5,
    total_intervention: data.total_intervention + 1,
    events_control: data.events_control + 0.5,
    total_control: data.total_control + 1,
  };
}

/**
 * Calculate Odds Ratio (OR) with 95% CI
 */
export function calculateOddsRatio(data: BinaryData): BinaryEffectSize {
  const warnings: string[] = [];
  
  // Validate data
  const validationErrors = validateBinaryData(data);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid binary data: ${validationErrors.join(', ')}`);
  }
  
  // Check for zero cells
  const needsCorrection = needsContinuityCorrection(data);
  const correctedData = needsCorrection ? applyContinuityCorrection(data) : data;
  
  if (needsCorrection) {
    warnings.push('Continuity correction (0.5) applied due to zero cells');
  }
  
  // Calculate non-events
  const nonEvents_intervention = correctedData.total_intervention - correctedData.events_intervention;
  const nonEvents_control = correctedData.total_control - correctedData.events_control;
  
  // Calculate OR
  const or = (correctedData.events_intervention * nonEvents_control) / 
             (correctedData.events_control * nonEvents_intervention);
  
  // Calculate log(OR) and SE
  const logOR = Math.log(or);
  const seLogOR = Math.sqrt(
    1 / correctedData.events_intervention +
    1 / nonEvents_intervention +
    1 / correctedData.events_control +
    1 / nonEvents_control
  );
  
  // Calculate 95% CI
  const z = 1.96; // 95% CI
  const ciLowerLog = logOR - z * seLogOR;
  const ciUpperLog = logOR + z * seLogOR;
  
  const ciLower = Math.exp(ciLowerLog);
  const ciUpper = Math.exp(ciUpperLog);
  
  // Calculate weight (inverse variance)
  const weight = 1 / (seLogOR * seLogOR);
  
  // Calculate risks
  const risk_intervention = data.events_intervention / data.total_intervention;
  const risk_control = data.events_control / data.total_control;
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Reduce confidence for small samples
  const totalSample = data.total_intervention + data.total_control;
  if (totalSample < 30) {
    confidence -= 0.2;
    warnings.push('Small sample size (<30 total participants)');
  } else if (totalSample < 100) {
    confidence -= 0.1;
    warnings.push('Moderate sample size (<100 total participants)');
  }
  
  // Reduce confidence for very wide CI
  if (ciUpper / ciLower > 10) {
    confidence -= 0.1;
    warnings.push('Very wide confidence interval (ratio > 10)');
  }
  
  // Reduce confidence if continuity correction was needed
  if (needsCorrection) {
    confidence -= 0.1;
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    measure: 'OR',
    effect_size: or,
    ci_lower: ciLower,
    ci_upper: ciUpper,
    standard_error: seLogOR,
    weight,
    log_effect_size: logOR,
    log_se: seLogOR,
    data,
    continuity_correction_applied: needsCorrection,
    confidence,
    warnings,
    details: {
      risk_intervention,
      risk_control,
      sample_size_total: totalSample,
    },
  };
}

/**
 * Calculate Risk Ratio (RR) with 95% CI
 */
export function calculateRiskRatio(data: BinaryData): BinaryEffectSize {
  const warnings: string[] = [];
  
  // Validate data
  const validationErrors = validateBinaryData(data);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid binary data: ${validationErrors.join(', ')}`);
  }
  
  // Check for zero cells
  const needsCorrection = needsContinuityCorrection(data);
  const correctedData = needsCorrection ? applyContinuityCorrection(data) : data;
  
  if (needsCorrection) {
    warnings.push('Continuity correction (0.5) applied due to zero cells');
  }
  
  // Calculate risks
  const risk_intervention = correctedData.events_intervention / correctedData.total_intervention;
  const risk_control = correctedData.events_control / correctedData.total_control;
  
  // Calculate RR
  const rr = risk_intervention / risk_control;
  
  // Calculate log(RR) and SE
  const logRR = Math.log(rr);
  const seLogRR = Math.sqrt(
    (1 / correctedData.events_intervention) - (1 / correctedData.total_intervention) +
    (1 / correctedData.events_control) - (1 / correctedData.total_control)
  );
  
  // Calculate 95% CI
  const z = 1.96; // 95% CI
  const ciLowerLog = logRR - z * seLogRR;
  const ciUpperLog = logRR + z * seLogRR;
  
  const ciLower = Math.exp(ciLowerLog);
  const ciUpper = Math.exp(ciUpperLog);
  
  // Calculate weight (inverse variance)
  const weight = 1 / (seLogRR * seLogRR);
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Reduce confidence for small samples
  const totalSample = data.total_intervention + data.total_control;
  if (totalSample < 30) {
    confidence -= 0.2;
    warnings.push('Small sample size (<30 total participants)');
  } else if (totalSample < 100) {
    confidence -= 0.1;
    warnings.push('Moderate sample size (<100 total participants)');
  }
  
  // Reduce confidence for very wide CI
  if (ciUpper / ciLower > 10) {
    confidence -= 0.1;
    warnings.push('Very wide confidence interval (ratio > 10)');
  }
  
  // Reduce confidence if continuity correction was needed
  if (needsCorrection) {
    confidence -= 0.1;
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    measure: 'RR',
    effect_size: rr,
    ci_lower: ciLower,
    ci_upper: ciUpper,
    standard_error: seLogRR,
    weight,
    log_effect_size: logRR,
    log_se: seLogRR,
    data,
    continuity_correction_applied: needsCorrection,
    confidence,
    warnings,
    details: {
      risk_intervention: data.events_intervention / data.total_intervention,
      risk_control: data.events_control / data.total_control,
      sample_size_total: totalSample,
    },
  };
}

/**
 * Calculate Risk Difference (RD) with 95% CI
 */
export function calculateRiskDifference(data: BinaryData): BinaryEffectSize {
  const warnings: string[] = [];
  
  // Validate data
  const validationErrors = validateBinaryData(data);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid binary data: ${validationErrors.join(', ')}`);
  }
  
  // Calculate risks
  const risk_intervention = data.events_intervention / data.total_intervention;
  const risk_control = data.events_control / data.total_control;
  
  // Calculate RD
  const rd = risk_intervention - risk_control;
  
  // Calculate SE
  const seRD = Math.sqrt(
    (risk_intervention * (1 - risk_intervention)) / data.total_intervention +
    (risk_control * (1 - risk_control)) / data.total_control
  );
  
  // Calculate 95% CI
  const z = 1.96; // 95% CI
  const ciLower = rd - z * seRD;
  const ciUpper = rd + z * seRD;
  
  // Calculate weight (inverse variance)
  const weight = 1 / (seRD * seRD);
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Reduce confidence for small samples
  const totalSample = data.total_intervention + data.total_control;
  if (totalSample < 30) {
    confidence -= 0.2;
    warnings.push('Small sample size (<30 total participants)');
  } else if (totalSample < 100) {
    confidence -= 0.1;
    warnings.push('Moderate sample size (<100 total participants)');
  }
  
  // Reduce confidence for very wide CI
  if (ciUpper - ciLower > 0.5) {
    confidence -= 0.1;
    warnings.push('Wide confidence interval (>0.5 absolute difference)');
  }
  
  // Check for zero cells (no continuity correction for RD, but flag it)
  if (needsContinuityCorrection(data)) {
    confidence -= 0.1;
    warnings.push('Zero cells present (no continuity correction applied for RD)');
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    measure: 'RD',
    effect_size: rd,
    ci_lower: ciLower,
    ci_upper: ciUpper,
    standard_error: seRD,
    weight,
    data,
    continuity_correction_applied: false, // RD doesn't use continuity correction
    confidence,
    warnings,
    details: {
      risk_intervention,
      risk_control,
      sample_size_total: totalSample,
    },
  };
}

/**
 * Calculate binary effect size (auto-select measure)
 */
export function calculateBinaryEffectSize(
  data: BinaryData,
  measure: 'OR' | 'RR' | 'RD' = 'OR'
): BinaryEffectSize {
  switch (measure) {
    case 'OR':
      return calculateOddsRatio(data);
    case 'RR':
      return calculateRiskRatio(data);
    case 'RD':
      return calculateRiskDifference(data);
    default:
      throw new Error(`Unknown effect measure: ${measure}`);
  }
}

/**
 * MCP tool interface for binary effect size calculation
 */
export async function calculateBinaryEffectSizeMCP(args: {
  events_intervention: number;
  total_intervention: number;
  events_control: number;
  total_control: number;
  measure?: 'OR' | 'RR' | 'RD';
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Calculating binary effect size', {
      measure: args.measure || 'OR',
      total_sample: args.total_intervention + args.total_control,
    });
    
    const data: BinaryData = {
      events_intervention: args.events_intervention,
      total_intervention: args.total_intervention,
      events_control: args.events_control,
      total_control: args.total_control,
    };
    
    const result = calculateBinaryEffectSize(data, args.measure);
    
    logger.info('Binary effect size calculation complete', {
      measure: result.measure,
      effect_size: result.effect_size,
      confidence: result.confidence,
      warnings_count: result.warnings.length,
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
    logger.error('Error calculating binary effect size', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error calculating binary effect size: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
