/**
 * Pooled Effect Size Calculation
 * 
 * Pools effect sizes across multiple studies using:
 * - Fixed-effect model (inverse variance)
 * - Random-effects model (DerSimonian-Laird)
 * 
 * Includes:
 * - Automatic model selection based on heterogeneity
 * - 95% confidence intervals
 * - Z-scores and p-values
 * - Study weights
 * - Conservative confidence scoring
 * 
 * References:
 * - Cochrane Handbook for Systematic Reviews (Chapter 10)
 * - Borenstein et al. (2009) Introduction to Meta-Analysis
 * - DerSimonian & Laird (1986) Meta-analysis in clinical trials
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Study effect size for pooling
 */
export interface StudyEffect {
  /** Study identifier */
  study_id: string;
  
  /** Effect size estimate */
  effect_size: number;
  
  /** Standard error */
  standard_error?: number;
  
  /** 95% confidence interval (alternative to SE) */
  ci_lower?: number;
  ci_upper?: number;
  
  /** Sample size (optional, for additional context) */
  sample_size?: number;
}

/**
 * Pooled effect size result
 */
export interface PooledEffect {
  /** Pooling model used */
  model: 'fixed' | 'random';
  
  /** Pooled effect size estimate */
  pooled_effect: number;
  
  /** 95% confidence interval */
  ci_lower: number;
  ci_upper: number;
  
  /** Standard error of pooled effect */
  standard_error: number;
  
  /** Z-score */
  z_score: number;
  
  /** Two-tailed p-value */
  p_value: number;
  
  /** Study weights (normalized to sum to 100%) */
  weights: Array<{
    study_id: string;
    weight: number;
    weight_percent: number;
  }>;
  
  /** Number of studies pooled */
  n_studies: number;
  
  /** Total sample size (if available) */
  total_sample_size?: number;
  
  /** Heterogeneity statistics (calculated separately, but included for context) */
  heterogeneity?: {
    tau_squared: number; // Between-study variance (random-effects only)
    q_statistic: number;
    i_squared: number;
  };
  
  /** Model selection rationale */
  model_rationale: string;
  
  /** Confidence in the pooled estimate (0-1) */
  confidence: number;
  
  /** Warnings about the pooling */
  warnings: string[];
}

/**
 * Validate study effects
 */
function validateStudyEffects(studies: StudyEffect[]): string[] {
  const errors: string[] = [];
  
  if (studies.length === 0) {
    errors.push('No studies provided for pooling');
    return errors;
  }
  
  for (let i = 0; i < studies.length; i++) {
    const study = studies[i];
    
    if (!study.study_id) {
      errors.push(`Study ${i + 1}: Missing study_id`);
    }
    
    if (!isFinite(study.effect_size)) {
      errors.push(`Study ${study.study_id || i + 1}: Effect size must be finite`);
    }
    
    // Must have either SE or CI
    if (!study.standard_error && (!study.ci_lower || !study.ci_upper)) {
      errors.push(`Study ${study.study_id || i + 1}: Must provide either standard_error or confidence interval`);
    }
    
    // If CI provided, check validity
    if (study.ci_lower !== undefined && study.ci_upper !== undefined) {
      if (study.ci_lower > study.ci_upper) {
        errors.push(`Study ${study.study_id || i + 1}: CI lower bound cannot exceed upper bound`);
      }
    }
  }
  
  return errors;
}

/**
 * Calculate SE from 95% CI if not provided
 */
function calculateSEFromCI(ci_lower: number, ci_upper: number): number {
  // SE = (upper - lower) / (2 * 1.96)
  return (ci_upper - ci_lower) / (2 * 1.96);
}

/**
 * Ensure all studies have SE
 */
function ensureStandardErrors(studies: StudyEffect[]): Array<StudyEffect & { standard_error: number }> {
  return studies.map(study => {
    if (study.standard_error) {
      return study as StudyEffect & { standard_error: number };
    }
    
    // Calculate SE from CI
    const se = calculateSEFromCI(study.ci_lower!, study.ci_upper!);
    return {
      ...study,
      standard_error: se,
    };
  });
}

/**
 * Calculate Q statistic for heterogeneity
 */
function calculateQStatistic(
  studies: Array<StudyEffect & { standard_error: number }>,
  pooledEffect: number
): number {
  let q = 0;
  
  for (const study of studies) {
    const weight = 1 / (study.standard_error * study.standard_error);
    const diff = study.effect_size - pooledEffect;
    q += weight * diff * diff;
  }
  
  return q;
}

/**
 * Calculate I² statistic for heterogeneity
 */
function calculateISquared(q: number, df: number): number {
  if (df <= 0) return 0;
  
  const iSquared = ((q - df) / q) * 100;
  return Math.max(0, iSquared); // I² cannot be negative
}

/**
 * Calculate tau² (between-study variance) using DerSimonian-Laird method
 */
function calculateTauSquared(
  studies: Array<StudyEffect & { standard_error: number }>,
  pooledEffectFixed: number
): number {
  const k = studies.length;
  if (k <= 1) return 0;
  
  // Calculate Q
  const q = calculateQStatistic(studies, pooledEffectFixed);
  const df = k - 1;
  
  // If Q <= df, no heterogeneity
  if (q <= df) return 0;
  
  // Calculate sum of weights and sum of squared weights
  let sumW = 0;
  let sumW2 = 0;
  
  for (const study of studies) {
    const w = 1 / (study.standard_error * study.standard_error);
    sumW += w;
    sumW2 += w * w;
  }
  
  // DerSimonian-Laird estimator
  const c = sumW - (sumW2 / sumW);
  const tauSquared = (q - df) / c;
  
  return Math.max(0, tauSquared); // Tau² cannot be negative
}

/**
 * Pool effect sizes using fixed-effect model (inverse variance)
 */
export function poolFixedEffect(studies: StudyEffect[]): PooledEffect {
  const warnings: string[] = [];
  
  // Validate
  const validationErrors = validateStudyEffects(studies);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid study effects: ${validationErrors.join(', ')}`);
  }
  
  // Ensure all studies have SE
  const studiesWithSE = ensureStandardErrors(studies);
  
  // Calculate weights (inverse variance)
  let sumWeights = 0;
  let sumWeightedEffects = 0;
  
  const weights: Array<{ study_id: string; weight: number; weight_percent: number }> = [];
  
  for (const study of studiesWithSE) {
    const variance = study.standard_error * study.standard_error;
    const weight = 1 / variance;
    
    sumWeights += weight;
    sumWeightedEffects += weight * study.effect_size;
    
    weights.push({
      study_id: study.study_id,
      weight,
      weight_percent: 0, // Will be calculated after
    });
  }
  
  // Calculate pooled effect
  const pooledEffect = sumWeightedEffects / sumWeights;
  
  // Calculate SE of pooled effect
  const sePooled = Math.sqrt(1 / sumWeights);
  
  // Calculate 95% CI
  const z = 1.96;
  const ciLower = pooledEffect - z * sePooled;
  const ciUpper = pooledEffect + z * sePooled;
  
  // Calculate Z-score and p-value
  const zScore = pooledEffect / sePooled;
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
  
  // Normalize weights to percentages
  for (const weight of weights) {
    weight.weight_percent = (weight.weight / sumWeights) * 100;
  }
  
  // Calculate heterogeneity statistics
  const q = calculateQStatistic(studiesWithSE, pooledEffect);
  const df = studiesWithSE.length - 1;
  const iSquared = calculateISquared(q, df);
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Reduce confidence for few studies
  if (studiesWithSE.length < 3) {
    confidence -= 0.2;
    warnings.push('Very few studies (<3) for pooling');
  } else if (studiesWithSE.length < 5) {
    confidence -= 0.1;
    warnings.push('Few studies (<5) for pooling');
  }
  
  // Reduce confidence for high heterogeneity (fixed-effect may not be appropriate)
  if (iSquared > 75) {
    confidence -= 0.2;
    warnings.push('High heterogeneity (I² > 75%) - consider random-effects model');
  } else if (iSquared > 50) {
    confidence -= 0.1;
    warnings.push('Moderate heterogeneity (I² > 50%) - consider random-effects model');
  }
  
  // Reduce confidence for wide CI
  if (ciUpper - ciLower > 2 * Math.abs(pooledEffect)) {
    confidence -= 0.1;
    warnings.push('Wide confidence interval');
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  // Calculate total sample size if available
  const totalSampleSize = studiesWithSE
    .filter(s => s.sample_size !== undefined)
    .reduce((sum, s) => sum + s.sample_size!, 0);
  
  return {
    model: 'fixed',
    pooled_effect: pooledEffect,
    ci_lower: ciLower,
    ci_upper: ciUpper,
    standard_error: sePooled,
    z_score: zScore,
    p_value: pValue,
    weights,
    n_studies: studiesWithSE.length,
    total_sample_size: totalSampleSize > 0 ? totalSampleSize : undefined,
    heterogeneity: {
      tau_squared: 0, // Fixed-effect assumes tau² = 0
      q_statistic: q,
      i_squared: iSquared,
    },
    model_rationale: 'Fixed-effect model assumes all studies estimate the same true effect',
    confidence,
    warnings,
  };
}

/**
 * Pool effect sizes using random-effects model (DerSimonian-Laird)
 */
export function poolRandomEffects(studies: StudyEffect[]): PooledEffect {
  const warnings: string[] = [];
  
  // Validate
  const validationErrors = validateStudyEffects(studies);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid study effects: ${validationErrors.join(', ')}`);
  }
  
  // Ensure all studies have SE
  const studiesWithSE = ensureStandardErrors(studies);
  
  // First, calculate fixed-effect pooled estimate to get tau²
  const fixedResult = poolFixedEffect(studies);
  const tauSquared = calculateTauSquared(studiesWithSE, fixedResult.pooled_effect);
  
  // Calculate random-effects weights (inverse variance + tau²)
  let sumWeights = 0;
  let sumWeightedEffects = 0;
  
  const weights: Array<{ study_id: string; weight: number; weight_percent: number }> = [];
  
  for (const study of studiesWithSE) {
    const variance = study.standard_error * study.standard_error;
    const weight = 1 / (variance + tauSquared);
    
    sumWeights += weight;
    sumWeightedEffects += weight * study.effect_size;
    
    weights.push({
      study_id: study.study_id,
      weight,
      weight_percent: 0, // Will be calculated after
    });
  }
  
  // Calculate pooled effect
  const pooledEffect = sumWeightedEffects / sumWeights;
  
  // Calculate SE of pooled effect
  const sePooled = Math.sqrt(1 / sumWeights);
  
  // Calculate 95% CI
  const z = 1.96;
  const ciLower = pooledEffect - z * sePooled;
  const ciUpper = pooledEffect + z * sePooled;
  
  // Calculate Z-score and p-value
  const zScore = pooledEffect / sePooled;
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
  
  // Normalize weights to percentages
  for (const weight of weights) {
    weight.weight_percent = (weight.weight / sumWeights) * 100;
  }
  
  // Use heterogeneity from fixed-effect calculation
  const iSquared = fixedResult.heterogeneity!.i_squared;
  const q = fixedResult.heterogeneity!.q_statistic;
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Reduce confidence for few studies
  if (studiesWithSE.length < 3) {
    confidence -= 0.2;
    warnings.push('Very few studies (<3) for pooling');
  } else if (studiesWithSE.length < 5) {
    confidence -= 0.1;
    warnings.push('Few studies (<5) for pooling');
  }
  
  // Note heterogeneity (but don't penalize for random-effects)
  if (iSquared > 75) {
    warnings.push('High heterogeneity (I² > 75%) detected');
  } else if (iSquared > 50) {
    warnings.push('Moderate heterogeneity (I² > 50%) detected');
  }
  
  // Reduce confidence for very high tau²
  if (tauSquared > 1) {
    confidence -= 0.1;
    warnings.push('Large between-study variance (tau² > 1)');
  }
  
  // Reduce confidence for wide CI
  if (ciUpper - ciLower > 2 * Math.abs(pooledEffect)) {
    confidence -= 0.1;
    warnings.push('Wide confidence interval');
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  // Calculate total sample size if available
  const totalSampleSize = studiesWithSE
    .filter(s => s.sample_size !== undefined)
    .reduce((sum, s) => sum + s.sample_size!, 0);
  
  return {
    model: 'random',
    pooled_effect: pooledEffect,
    ci_lower: ciLower,
    ci_upper: ciUpper,
    standard_error: sePooled,
    z_score: zScore,
    p_value: pValue,
    weights,
    n_studies: studiesWithSE.length,
    total_sample_size: totalSampleSize > 0 ? totalSampleSize : undefined,
    heterogeneity: {
      tau_squared: tauSquared,
      q_statistic: q,
      i_squared: iSquared,
    },
    model_rationale: 'Random-effects model accounts for between-study heterogeneity',
    confidence,
    warnings,
  };
}

/**
 * Automatically select pooling model based on heterogeneity
 */
export function poolEffectAuto(studies: StudyEffect[]): PooledEffect {
  // Calculate fixed-effect first to assess heterogeneity
  const fixedResult = poolFixedEffect(studies);
  const iSquared = fixedResult.heterogeneity!.i_squared;
  
  // Use random-effects if I² > 50%
  if (iSquared > 50) {
    const randomResult = poolRandomEffects(studies);
    randomResult.model_rationale = 
      `Random-effects model selected due to moderate/high heterogeneity (I² = ${iSquared.toFixed(1)}%)`;
    return randomResult;
  }
  
  // Use fixed-effect if I² ≤ 50%
  fixedResult.model_rationale = 
    `Fixed-effect model selected due to low heterogeneity (I² = ${iSquared.toFixed(1)}%)`;
  return fixedResult;
}

/**
 * Calculate pooled effect size
 */
export function calculatePooledEffect(
  studies: StudyEffect[],
  model: 'fixed' | 'random' | 'auto' = 'auto'
): PooledEffect {
  switch (model) {
    case 'fixed':
      return poolFixedEffect(studies);
    case 'random':
      return poolRandomEffects(studies);
    case 'auto':
      return poolEffectAuto(studies);
    default:
      throw new Error(`Unknown pooling model: ${model}`);
  }
}

/**
 * Normal CDF approximation (for p-value calculation)
 */
function normalCDF(z: number): number {
  // Approximation using error function
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  return z > 0 ? 1 - p : p;
}

/**
 * MCP tool interface for pooled effect calculation
 */
export async function calculatePooledEffectMCP(args: {
  studies: StudyEffect[];
  model?: 'fixed' | 'random' | 'auto';
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Calculating pooled effect', {
      model: args.model || 'auto',
      n_studies: args.studies.length,
    });
    
    const result = calculatePooledEffect(args.studies, args.model);
    
    logger.info('Pooled effect calculation complete', {
      model: result.model,
      pooled_effect: result.pooled_effect,
      p_value: result.p_value,
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
    logger.error('Error calculating pooled effect', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error calculating pooled effect: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
