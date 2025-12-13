/**
 * Continuous Effect Size Calculation
 * 
 * Calculates effect sizes for continuous outcomes:
 * - Mean Difference (MD)
 * - Standardized Mean Difference (SMD / Hedges' g)
 * 
 * Includes:
 * - 95% confidence intervals
 * - Standard errors
 * - Weights for meta-analysis
 * - Hedges' g bias correction for small samples
 * - Conservative confidence scoring
 * 
 * References:
 * - Cochrane Handbook for Systematic Reviews (Chapter 6)
 * - Borenstein et al. (2009) Introduction to Meta-Analysis
 * - Hedges & Olkin (1985) Statistical Methods for Meta-Analysis
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Continuous outcome data
 */
export interface ContinuousData {
  /** Mean in intervention group */
  mean_intervention: number;
  
  /** Standard deviation in intervention group */
  sd_intervention: number;
  
  /** Sample size in intervention group */
  n_intervention: number;
  
  /** Mean in control group */
  mean_control: number;
  
  /** Standard deviation in control group */
  sd_control: number;
  
  /** Sample size in control group */
  n_control: number;
}

/**
 * Effect size result for continuous outcomes
 */
export interface ContinuousEffectSize {
  /** Effect measure used */
  measure: 'MD' | 'SMD';
  
  /** Effect size estimate */
  effect_size: number;
  
  /** 95% confidence interval */
  ci_lower: number;
  ci_upper: number;
  
  /** Standard error */
  standard_error: number;
  
  /** Weight for meta-analysis (inverse variance) */
  weight: number;
  
  /** Pooled standard deviation (for SMD) */
  pooled_sd?: number;
  
  /** Hedges' g correction factor (for SMD) */
  correction_factor?: number;
  
  /** Input data */
  data: ContinuousData;
  
  /** Confidence in the calculation (0-1) */
  confidence: number;
  
  /** Warnings about the data */
  warnings: string[];
  
  /** Calculation details */
  details: {
    mean_difference: number;
    sample_size_total: number;
    variance_ratio?: number; // SD_intervention / SD_control
  };
}

/**
 * Validate continuous data
 */
function validateContinuousData(data: ContinuousData): string[] {
  const errors: string[] = [];
  
  // Check for invalid values
  if (!isFinite(data.mean_intervention)) errors.push('Mean in intervention group must be finite');
  if (!isFinite(data.mean_control)) errors.push('Mean in control group must be finite');
  if (data.sd_intervention < 0) errors.push('SD in intervention group cannot be negative');
  if (data.sd_control < 0) errors.push('SD in control group cannot be negative');
  if (data.n_intervention <= 0) errors.push('Sample size in intervention group must be positive');
  if (data.n_control <= 0) errors.push('Sample size in control group must be positive');
  
  // Check for non-integer sample sizes
  if (!Number.isInteger(data.n_intervention)) {
    errors.push('Sample size in intervention must be integer');
  }
  if (!Number.isInteger(data.n_control)) {
    errors.push('Sample size in control must be integer');
  }
  
  // Check for zero SD
  if (data.sd_intervention === 0) errors.push('SD in intervention group cannot be zero');
  if (data.sd_control === 0) errors.push('SD in control group cannot be zero');
  
  return errors;
}

/**
 * Calculate pooled standard deviation
 */
function calculatePooledSD(data: ContinuousData): number {
  const variance_intervention = data.sd_intervention * data.sd_intervention;
  const variance_control = data.sd_control * data.sd_control;
  
  const pooled_variance = 
    ((data.n_intervention - 1) * variance_intervention + 
     (data.n_control - 1) * variance_control) /
    (data.n_intervention + data.n_control - 2);
  
  return Math.sqrt(pooled_variance);
}

/**
 * Calculate Hedges' g correction factor
 * Corrects for small sample bias in SMD
 */
function calculateHedgesCorrectionFactor(n: number): number {
  // J = 1 - 3/(4*df - 1)
  // where df = n - 2 for two groups
  const df = n - 2;
  return 1 - (3 / (4 * df - 1));
}

/**
 * Calculate Mean Difference (MD) with 95% CI
 */
export function calculateMeanDifference(data: ContinuousData): ContinuousEffectSize {
  const warnings: string[] = [];
  
  // Validate data
  const validationErrors = validateContinuousData(data);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid continuous data: ${validationErrors.join(', ')}`);
  }
  
  // Calculate mean difference
  const md = data.mean_intervention - data.mean_control;
  
  // Calculate SE
  const variance_intervention = (data.sd_intervention * data.sd_intervention) / data.n_intervention;
  const variance_control = (data.sd_control * data.sd_control) / data.n_control;
  const seMD = Math.sqrt(variance_intervention + variance_control);
  
  // Calculate 95% CI
  const z = 1.96; // 95% CI
  const ciLower = md - z * seMD;
  const ciUpper = md + z * seMD;
  
  // Calculate weight (inverse variance)
  const weight = 1 / (seMD * seMD);
  
  // Check for unequal variances
  const varianceRatio = data.sd_intervention / data.sd_control;
  if (varianceRatio > 2 || varianceRatio < 0.5) {
    warnings.push(`Unequal variances detected (ratio: ${varianceRatio.toFixed(2)})`);
  }
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Reduce confidence for small samples
  const totalSample = data.n_intervention + data.n_control;
  if (totalSample < 30) {
    confidence -= 0.2;
    warnings.push('Small sample size (<30 total participants)');
  } else if (totalSample < 100) {
    confidence -= 0.1;
    warnings.push('Moderate sample size (<100 total participants)');
  }
  
  // Reduce confidence for very wide CI
  const ciWidth = ciUpper - ciLower;
  const meanScale = Math.abs(data.mean_intervention) + Math.abs(data.mean_control);
  if (meanScale > 0 && ciWidth / meanScale > 1) {
    confidence -= 0.1;
    warnings.push('Wide confidence interval relative to mean values');
  }
  
  // Reduce confidence for unequal variances
  if (varianceRatio > 2 || varianceRatio < 0.5) {
    confidence -= 0.1;
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    measure: 'MD',
    effect_size: md,
    ci_lower: ciLower,
    ci_upper: ciUpper,
    standard_error: seMD,
    weight,
    data,
    confidence,
    warnings,
    details: {
      mean_difference: md,
      sample_size_total: totalSample,
      variance_ratio: varianceRatio,
    },
  };
}

/**
 * Calculate Standardized Mean Difference (SMD / Hedges' g) with 95% CI
 */
export function calculateSMD(data: ContinuousData): ContinuousEffectSize {
  const warnings: string[] = [];
  
  // Validate data
  const validationErrors = validateContinuousData(data);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid continuous data: ${validationErrors.join(', ')}`);
  }
  
  // Calculate pooled SD
  const pooledSD = calculatePooledSD(data);
  
  // Calculate Cohen's d (uncorrected SMD)
  const meanDiff = data.mean_intervention - data.mean_control;
  const cohensD = meanDiff / pooledSD;
  
  // Apply Hedges' g correction for small samples
  const totalN = data.n_intervention + data.n_control;
  const correctionFactor = calculateHedgesCorrectionFactor(totalN);
  const hedgesG = cohensD * correctionFactor;
  
  // Calculate SE
  const n1 = data.n_intervention;
  const n2 = data.n_control;
  const seSMD = Math.sqrt(
    (n1 + n2) / (n1 * n2) + 
    (hedgesG * hedgesG) / (2 * (n1 + n2))
  );
  
  // Calculate 95% CI
  const z = 1.96; // 95% CI
  const ciLower = hedgesG - z * seSMD;
  const ciUpper = hedgesG + z * seSMD;
  
  // Calculate weight (inverse variance)
  const weight = 1 / (seSMD * seSMD);
  
  // Check for unequal variances
  const varianceRatio = data.sd_intervention / data.sd_control;
  if (varianceRatio > 2 || varianceRatio < 0.5) {
    warnings.push(`Unequal variances detected (ratio: ${varianceRatio.toFixed(2)})`);
  }
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Reduce confidence for small samples
  if (totalN < 30) {
    confidence -= 0.2;
    warnings.push('Small sample size (<30 total participants)');
  } else if (totalN < 100) {
    confidence -= 0.1;
    warnings.push('Moderate sample size (<100 total participants)');
  }
  
  // Reduce confidence for very wide CI
  if (ciUpper - ciLower > 2) {
    confidence -= 0.1;
    warnings.push('Wide confidence interval (>2 SD units)');
  }
  
  // Reduce confidence for unequal variances
  if (varianceRatio > 2 || varianceRatio < 0.5) {
    confidence -= 0.1;
  }
  
  // Note if correction was substantial
  if (Math.abs(cohensD - hedgesG) > 0.05) {
    warnings.push(`Small sample correction applied (Cohen's d: ${cohensD.toFixed(3)}, Hedges' g: ${hedgesG.toFixed(3)})`);
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    measure: 'SMD',
    effect_size: hedgesG,
    ci_lower: ciLower,
    ci_upper: ciUpper,
    standard_error: seSMD,
    weight,
    pooled_sd: pooledSD,
    correction_factor: correctionFactor,
    data,
    confidence,
    warnings,
    details: {
      mean_difference: meanDiff,
      sample_size_total: totalN,
      variance_ratio: varianceRatio,
    },
  };
}

/**
 * Calculate continuous effect size (auto-select measure)
 */
export function calculateContinuousEffectSize(
  data: ContinuousData,
  measure: 'MD' | 'SMD' = 'SMD'
): ContinuousEffectSize {
  switch (measure) {
    case 'MD':
      return calculateMeanDifference(data);
    case 'SMD':
      return calculateSMD(data);
    default:
      throw new Error(`Unknown effect measure: ${measure}`);
  }
}

/**
 * MCP tool interface for continuous effect size calculation
 */
export async function calculateContinuousEffectSizeMCP(args: {
  mean_intervention: number;
  sd_intervention: number;
  n_intervention: number;
  mean_control: number;
  sd_control: number;
  n_control: number;
  measure?: 'MD' | 'SMD';
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Calculating continuous effect size', {
      measure: args.measure || 'SMD',
      total_sample: args.n_intervention + args.n_control,
    });
    
    const data: ContinuousData = {
      mean_intervention: args.mean_intervention,
      sd_intervention: args.sd_intervention,
      n_intervention: args.n_intervention,
      mean_control: args.mean_control,
      sd_control: args.sd_control,
      n_control: args.n_control,
    };
    
    const result = calculateContinuousEffectSize(data, args.measure);
    
    logger.info('Continuous effect size calculation complete', {
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
    logger.error('Error calculating continuous effect size', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error calculating continuous effect size: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
