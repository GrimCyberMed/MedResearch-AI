/**
 * Heterogeneity Assessment
 * 
 * Assesses statistical heterogeneity in meta-analysis using:
 * - Q statistic (Cochran's Q test)
 * - I² statistic (percentage of variation due to heterogeneity)
 * - τ² (tau-squared - between-study variance)
 * - H² statistic
 * - Prediction intervals
 * 
 * Includes:
 * - Statistical significance testing
 * - Interpretation guidelines
 * - Conservative confidence scoring
 * 
 * References:
 * - Cochrane Handbook for Systematic Reviews (Chapter 10)
 * - Higgins & Thompson (2002) Quantifying heterogeneity in meta-analysis
 * - Borenstein et al. (2009) Introduction to Meta-Analysis
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Study effect size for heterogeneity assessment
 */
export interface StudyEffectForHeterogeneity {
  /** Study identifier */
  study_id: string;
  
  /** Effect size estimate */
  effect_size: number;
  
  /** Standard error */
  standard_error?: number;
  
  /** 95% confidence interval (alternative to SE) */
  ci_lower?: number;
  ci_upper?: number;
  
  /** Sample size (optional) */
  sample_size?: number;
}

/**
 * Heterogeneity assessment result
 */
export interface HeterogeneityAssessment {
  /** Number of studies */
  n_studies: number;
  
  /** Cochran's Q statistic */
  q_statistic: number;
  
  /** Degrees of freedom for Q */
  df: number;
  
  /** P-value for Q test */
  q_p_value: number;
  
  /** I² statistic (0-100%) */
  i_squared: number;
  
  /** I² interpretation */
  i_squared_interpretation: 'low' | 'moderate' | 'substantial' | 'considerable';
  
  /** τ² (tau-squared) - between-study variance */
  tau_squared: number;
  
  /** τ (tau) - between-study standard deviation */
  tau: number;
  
  /** H² statistic */
  h_squared: number;
  
  /** Prediction interval (95%) */
  prediction_interval?: {
    lower: number;
    upper: number;
  };
  
  /** Pooled effect (for prediction interval calculation) */
  pooled_effect?: number;
  
  /** Recommended model */
  recommended_model: 'fixed' | 'random';
  
  /** Interpretation and recommendations */
  interpretation: string;
  
  /** Confidence in the assessment (0-1) */
  confidence: number;
  
  /** Warnings */
  warnings: string[];
}

/**
 * Calculate SE from 95% CI if not provided
 */
function calculateSEFromCI(ci_lower: number, ci_upper: number): number {
  return (ci_upper - ci_lower) / (2 * 1.96);
}

/**
 * Ensure all studies have SE
 */
function ensureStandardErrors(
  studies: StudyEffectForHeterogeneity[]
): Array<StudyEffectForHeterogeneity & { standard_error: number }> {
  return studies.map(study => {
    if (study.standard_error) {
      return study as StudyEffectForHeterogeneity & { standard_error: number };
    }
    
    const se = calculateSEFromCI(study.ci_lower!, study.ci_upper!);
    return {
      ...study,
      standard_error: se,
    };
  });
}

/**
 * Calculate pooled effect (fixed-effect) for heterogeneity assessment
 */
function calculatePooledEffectFixed(
  studies: Array<StudyEffectForHeterogeneity & { standard_error: number }>
): number {
  let sumWeights = 0;
  let sumWeightedEffects = 0;
  
  for (const study of studies) {
    const variance = study.standard_error * study.standard_error;
    const weight = 1 / variance;
    
    sumWeights += weight;
    sumWeightedEffects += weight * study.effect_size;
  }
  
  return sumWeightedEffects / sumWeights;
}

/**
 * Calculate Cochran's Q statistic
 */
function calculateQStatistic(
  studies: Array<StudyEffectForHeterogeneity & { standard_error: number }>,
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
 * Calculate p-value for Q statistic using chi-square distribution
 */
function calculateQPValue(q: number, df: number): number {
  if (df <= 0) return 1;
  
  // Approximation using incomplete gamma function
  // For chi-square distribution with df degrees of freedom
  return 1 - gammaLowerIncomplete(df / 2, q / 2);
}

/**
 * Incomplete gamma function (lower) approximation
 */
function gammaLowerIncomplete(s: number, x: number): number {
  if (x <= 0) return 0;
  if (x > 100) return 1; // Approximation for large x
  
  // Series expansion
  let sum = 0;
  let term = 1 / s;
  sum += term;
  
  for (let n = 1; n < 100; n++) {
    term *= x / (s + n);
    sum += term;
    
    if (Math.abs(term) < 1e-10) break;
  }
  
  return (Math.pow(x, s) * Math.exp(-x) * sum) / gamma(s);
}

/**
 * Gamma function approximation
 */
function gamma(z: number): number {
  // Stirling's approximation for gamma function
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  
  z -= 1;
  const g = 7;
  const coefficients = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  
  let x = coefficients[0];
  for (let i = 1; i < g + 2; i++) {
    x += coefficients[i] / (z + i);
  }
  
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * Calculate I² statistic
 */
function calculateISquared(q: number, df: number): number {
  if (df <= 0) return 0;
  
  const iSquared = ((q - df) / q) * 100;
  return Math.max(0, Math.min(100, iSquared)); // Clamp to [0, 100]
}

/**
 * Interpret I² value
 */
function interpretISquared(iSquared: number): 'low' | 'moderate' | 'substantial' | 'considerable' {
  if (iSquared < 25) return 'low';
  if (iSquared < 50) return 'moderate';
  if (iSquared < 75) return 'substantial';
  return 'considerable';
}

/**
 * Calculate τ² (tau-squared) using DerSimonian-Laird method
 */
function calculateTauSquared(
  studies: Array<StudyEffectForHeterogeneity & { standard_error: number }>,
  pooledEffect: number
): number {
  const k = studies.length;
  if (k <= 1) return 0;
  
  const q = calculateQStatistic(studies, pooledEffect);
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
  
  return Math.max(0, tauSquared);
}

/**
 * Calculate H² statistic
 */
function calculateHSquared(q: number, df: number): number {
  if (df <= 0) return 1;
  return Math.max(1, q / df);
}

/**
 * Calculate prediction interval
 */
function calculatePredictionInterval(
  pooledEffect: number,
  tauSquared: number,
  sePooled: number,
  df: number
): { lower: number; upper: number } | undefined {
  if (df <= 0) return undefined;
  
  // Prediction interval SE includes both within-study and between-study variance
  const sePrediction = Math.sqrt(sePooled * sePooled + tauSquared);
  
  // Use t-distribution for small number of studies
  // Approximation: t ≈ 2 for df > 10, otherwise use larger value
  const tValue = df > 10 ? 1.96 : 2.5;
  
  return {
    lower: pooledEffect - tValue * sePrediction,
    upper: pooledEffect + tValue * sePrediction,
  };
}

/**
 * Assess heterogeneity in meta-analysis
 */
export function assessHeterogeneity(
  studies: StudyEffectForHeterogeneity[]
): HeterogeneityAssessment {
  const warnings: string[] = [];
  
  // Validate
  if (studies.length === 0) {
    throw new Error('No studies provided for heterogeneity assessment');
  }
  
  if (studies.length === 1) {
    warnings.push('Only one study - heterogeneity cannot be assessed');
    
    return {
      n_studies: 1,
      q_statistic: 0,
      df: 0,
      q_p_value: 1,
      i_squared: 0,
      i_squared_interpretation: 'low',
      tau_squared: 0,
      tau: 0,
      h_squared: 1,
      recommended_model: 'fixed',
      interpretation: 'Only one study available. Heterogeneity cannot be assessed.',
      confidence: 0.5,
      warnings,
    };
  }
  
  // Ensure all studies have SE
  const studiesWithSE = ensureStandardErrors(studies);
  
  // Calculate pooled effect (fixed-effect)
  const pooledEffect = calculatePooledEffectFixed(studiesWithSE);
  
  // Calculate Q statistic
  const q = calculateQStatistic(studiesWithSE, pooledEffect);
  const df = studiesWithSE.length - 1;
  const qPValue = calculateQPValue(q, df);
  
  // Calculate I²
  const iSquared = calculateISquared(q, df);
  const iSquaredInterpretation = interpretISquared(iSquared);
  
  // Calculate τ²
  const tauSquared = calculateTauSquared(studiesWithSE, pooledEffect);
  const tau = Math.sqrt(tauSquared);
  
  // Calculate H²
  const hSquared = calculateHSquared(q, df);
  
  // Calculate pooled effect SE for prediction interval
  let sumWeights = 0;
  for (const study of studiesWithSE) {
    sumWeights += 1 / (study.standard_error * study.standard_error);
  }
  const sePooled = Math.sqrt(1 / sumWeights);
  
  // Calculate prediction interval
  const predictionInterval = calculatePredictionInterval(pooledEffect, tauSquared, sePooled, df);
  
  // Recommend model
  const recommendedModel = iSquared > 50 ? 'random' : 'fixed';
  
  // Generate interpretation
  let interpretation = `Heterogeneity is ${iSquaredInterpretation} (I² = ${iSquared.toFixed(1)}%). `;
  
  if (qPValue < 0.05) {
    interpretation += `The Q test is statistically significant (p = ${qPValue.toFixed(4)}), indicating significant heterogeneity. `;
  } else {
    interpretation += `The Q test is not statistically significant (p = ${qPValue.toFixed(4)}). `;
  }
  
  if (iSquared > 75) {
    interpretation += 'Random-effects model is strongly recommended due to considerable heterogeneity. ';
    interpretation += 'Consider subgroup analysis or meta-regression to explore sources of heterogeneity.';
  } else if (iSquared > 50) {
    interpretation += 'Random-effects model is recommended due to substantial heterogeneity. ';
    interpretation += 'Consider exploring sources of heterogeneity.';
  } else if (iSquared > 25) {
    interpretation += 'Moderate heterogeneity detected. Either fixed-effect or random-effects model may be appropriate.';
  } else {
    interpretation += 'Low heterogeneity suggests studies are estimating similar effects. Fixed-effect model is appropriate.';
  }
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Reduce confidence for few studies
  if (studiesWithSE.length < 3) {
    confidence -= 0.2;
    warnings.push('Very few studies (<3) - heterogeneity estimates may be unreliable');
  } else if (studiesWithSE.length < 5) {
    confidence -= 0.1;
    warnings.push('Few studies (<5) - heterogeneity estimates have wide uncertainty');
  }
  
  // Note if Q test is borderline
  if (qPValue >= 0.05 && qPValue < 0.10) {
    warnings.push('Q test p-value is borderline (0.05-0.10) - interpret with caution');
  }
  
  // Note if I² is high but Q is not significant (can happen with few studies)
  if (iSquared > 50 && qPValue >= 0.05) {
    warnings.push('I² suggests heterogeneity but Q test is not significant - may be due to low power with few studies');
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    n_studies: studiesWithSE.length,
    q_statistic: q,
    df,
    q_p_value: qPValue,
    i_squared: iSquared,
    i_squared_interpretation: iSquaredInterpretation,
    tau_squared: tauSquared,
    tau,
    h_squared: hSquared,
    prediction_interval: predictionInterval,
    pooled_effect: pooledEffect,
    recommended_model: recommendedModel,
    interpretation,
    confidence,
    warnings,
  };
}

/**
 * MCP tool interface for heterogeneity assessment
 */
export async function assessHeterogeneityMCP(args: {
  studies: StudyEffectForHeterogeneity[];
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Assessing heterogeneity', {
      n_studies: args.studies.length,
    });
    
    const result = assessHeterogeneity(args.studies);
    
    logger.info('Heterogeneity assessment complete', {
      i_squared: result.i_squared,
      q_p_value: result.q_p_value,
      recommended_model: result.recommended_model,
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
    logger.error('Error assessing heterogeneity', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error assessing heterogeneity: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
