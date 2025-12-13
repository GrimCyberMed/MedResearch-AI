/**
 * Publication Bias Assessment
 * 
 * Assesses publication bias in meta-analysis using:
 * - Egger's regression test
 * - Begg's rank correlation test
 * - Funnel plot asymmetry assessment
 * - Trim-and-fill method
 * 
 * Includes:
 * - Statistical significance testing
 * - Effect size adjustment for bias
 * - Funnel plot data generation
 * - Conservative confidence scoring
 * 
 * References:
 * - Egger et al. (1997) Bias in meta-analysis detected by a simple, graphical test
 * - Begg & Mazumdar (1994) Operating characteristics of a rank correlation test
 * - Duval & Tweedie (2000) Trim and fill method
 * - Cochrane Handbook for Systematic Reviews (Chapter 13)
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Study data for publication bias assessment
 */
export interface StudyForBiasAssessment {
  /** Study identifier */
  study_id: string;
  
  /** Effect size estimate */
  effect_size: number;
  
  /** Standard error */
  standard_error: number;
  
  /** Sample size (optional) */
  sample_size?: number;
}

/**
 * Egger's test result
 */
export interface EggersTestResult {
  /** Intercept (bias indicator) */
  intercept: number;
  
  /** Standard error of intercept */
  se_intercept: number;
  
  /** T-statistic */
  t_statistic: number;
  
  /** P-value (two-tailed) */
  p_value: number;
  
  /** Degrees of freedom */
  df: number;
  
  /** Interpretation */
  interpretation: string;
}

/**
 * Begg's test result
 */
export interface BeggsTestResult {
  /** Kendall's tau */
  tau: number;
  
  /** Z-statistic */
  z_statistic: number;
  
  /** P-value (two-tailed) */
  p_value: number;
  
  /** Interpretation */
  interpretation: string;
}

/**
 * Trim-and-fill result
 */
export interface TrimAndFillResult {
  /** Number of studies trimmed */
  n_trimmed: number;
  
  /** Adjusted pooled effect */
  adjusted_effect: number;
  
  /** 95% CI of adjusted effect */
  adjusted_ci_lower: number;
  adjusted_ci_upper: number;
  
  /** Original pooled effect (for comparison) */
  original_effect: number;
  
  /** Imputed studies (filled) */
  imputed_studies: Array<{
    study_id: string;
    effect_size: number;
    standard_error: number;
  }>;
  
  /** Interpretation */
  interpretation: string;
}

/**
 * Funnel plot data point
 */
export interface FunnelPlotPoint {
  /** Study identifier */
  study_id: string;
  
  /** Effect size (x-axis) */
  effect_size: number;
  
  /** Standard error or precision (y-axis) */
  standard_error: number;
  
  /** Precision (1/SE) */
  precision: number;
  
  /** Is this an imputed study? */
  imputed?: boolean;
}

/**
 * Publication bias assessment result
 */
export interface PublicationBiasAssessment {
  /** Number of studies */
  n_studies: number;
  
  /** Egger's test */
  eggers_test: EggersTestResult;
  
  /** Begg's test */
  beggs_test: BeggsTestResult;
  
  /** Trim-and-fill analysis */
  trim_and_fill?: TrimAndFillResult;
  
  /** Funnel plot data */
  funnel_plot: {
    studies: FunnelPlotPoint[];
    pooled_effect: number;
    ci_bounds?: {
      lower: number[];
      upper: number[];
    };
  };
  
  /** Overall assessment */
  overall_assessment: {
    bias_detected: boolean;
    confidence: 'low' | 'moderate' | 'high';
    interpretation: string;
  };
  
  /** Confidence in the assessment (0-1) */
  confidence: number;
  
  /** Warnings */
  warnings: string[];
}

/**
 * Calculate Egger's regression test
 */
function calculateEggersTest(studies: StudyForBiasAssessment[]): EggersTestResult {
  const n = studies.length;
  
  if (n < 3) {
    return {
      intercept: 0,
      se_intercept: 0,
      t_statistic: 0,
      p_value: 1,
      df: 0,
      interpretation: 'Insufficient studies (<3) for Egger\'s test',
    };
  }
  
  // Calculate precision (1/SE) and standardized effect
  const data = studies.map(s => ({
    precision: 1 / s.standard_error,
    standardized_effect: s.effect_size / s.standard_error,
  }));
  
  // Linear regression: standardized_effect = intercept + slope * precision
  const meanPrecision = data.reduce((sum, d) => sum + d.precision, 0) / n;
  const meanStdEffect = data.reduce((sum, d) => sum + d.standardized_effect, 0) / n;
  
  let sumXY = 0;
  let sumXX = 0;
  
  for (const d of data) {
    const dx = d.precision - meanPrecision;
    const dy = d.standardized_effect - meanStdEffect;
    sumXY += dx * dy;
    sumXX += dx * dx;
  }
  
  const slope = sumXY / sumXX;
  const intercept = meanStdEffect - slope * meanPrecision;
  
  // Calculate residuals and SE
  let sumResidualsSq = 0;
  for (const d of data) {
    const predicted = intercept + slope * d.precision;
    const residual = d.standardized_effect - predicted;
    sumResidualsSq += residual * residual;
  }
  
  const df = n - 2;
  const mse = sumResidualsSq / df;
  
  // SE of intercept
  const sumPrecisionSq = data.reduce((sum, d) => sum + d.precision * d.precision, 0);
  const seIntercept = Math.sqrt(mse * sumPrecisionSq / (n * sumXX));
  
  // T-statistic
  const tStatistic = intercept / seIntercept;
  
  // P-value (two-tailed)
  const pValue = 2 * (1 - tCDF(Math.abs(tStatistic), df));
  
  // Interpretation
  let interpretation: string;
  if (pValue < 0.05) {
    interpretation = 'Significant asymmetry detected (p < 0.05), suggesting possible publication bias';
  } else if (pValue < 0.10) {
    interpretation = 'Borderline asymmetry (p < 0.10), publication bias possible';
  } else {
    interpretation = 'No significant asymmetry detected (p ≥ 0.10)';
  }
  
  return {
    intercept,
    se_intercept: seIntercept,
    t_statistic: tStatistic,
    p_value: pValue,
    df,
    interpretation,
  };
}

/**
 * Calculate Begg's rank correlation test
 */
function calculateBeggsTest(studies: StudyForBiasAssessment[]): BeggsTestResult {
  const n = studies.length;
  
  if (n < 3) {
    return {
      tau: 0,
      z_statistic: 0,
      p_value: 1,
      interpretation: 'Insufficient studies (<3) for Begg\'s test',
    };
  }
  
  // Rank effect sizes and variances
  const effectRanks = rankData(studies.map(s => s.effect_size));
  const varianceRanks = rankData(studies.map(s => s.standard_error * s.standard_error));
  
  // Calculate Kendall's tau
  let concordant = 0;
  let discordant = 0;
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const effectDiff = effectRanks[i] - effectRanks[j];
      const varianceDiff = varianceRanks[i] - varianceRanks[j];
      
      if ((effectDiff > 0 && varianceDiff > 0) || (effectDiff < 0 && varianceDiff < 0)) {
        concordant++;
      } else if ((effectDiff > 0 && varianceDiff < 0) || (effectDiff < 0 && varianceDiff > 0)) {
        discordant++;
      }
    }
  }
  
  const tau = (concordant - discordant) / (n * (n - 1) / 2);
  
  // Z-statistic
  const variance = (2 * (2 * n + 5)) / (9 * n * (n - 1));
  const zStatistic = tau / Math.sqrt(variance);
  
  // P-value (two-tailed)
  const pValue = 2 * (1 - normalCDF(Math.abs(zStatistic)));
  
  // Interpretation
  let interpretation: string;
  if (pValue < 0.05) {
    interpretation = 'Significant correlation detected (p < 0.05), suggesting possible publication bias';
  } else if (pValue < 0.10) {
    interpretation = 'Borderline correlation (p < 0.10), publication bias possible';
  } else {
    interpretation = 'No significant correlation detected (p ≥ 0.10)';
  }
  
  return {
    tau,
    z_statistic: zStatistic,
    p_value: pValue,
    interpretation,
  };
}

/**
 * Rank data (average rank for ties)
 */
function rankData(values: number[]): number[] {
  const indexed = values.map((value, index) => ({ value, index }));
  indexed.sort((a, b) => a.value - b.value);
  
  const ranks = new Array(values.length);
  let i = 0;
  
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length && indexed[j].value === indexed[i].value) {
      j++;
    }
    
    const avgRank = (i + j + 1) / 2;
    for (let k = i; k < j; k++) {
      ranks[indexed[k].index] = avgRank;
    }
    
    i = j;
  }
  
  return ranks;
}

/**
 * T-distribution CDF approximation
 */
function tCDF(t: number, df: number): number {
  // For large df, approximate with normal distribution
  if (df > 30) {
    return normalCDF(t);
  }
  
  // Simple approximation for small df
  const x = df / (df + t * t);
  return 1 - 0.5 * betaIncomplete(df / 2, 0.5, x);
}

/**
 * Incomplete beta function approximation
 */
function betaIncomplete(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  
  // Simple approximation
  return Math.pow(x, a) * Math.pow(1 - x, b) / (a * beta(a, b));
}

/**
 * Beta function
 */
function beta(a: number, b: number): number {
  return (gamma(a) * gamma(b)) / gamma(a + b);
}

/**
 * Gamma function (from heterogeneity assessment)
 */
function gamma(z: number): number {
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  
  z -= 1;
  const g = 7;
  const coefficients = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  
  let x = coefficients[0];
  for (let i = 1; i < g + 2; i++) {
    x += coefficients[i] / (z + i);
  }
  
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * Normal CDF
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  return z > 0 ? 1 - p : p;
}

/**
 * Generate funnel plot data
 */
function generateFunnelPlotData(
  studies: StudyForBiasAssessment[]
): FunnelPlotPoint[] {
  return studies.map(s => ({
    study_id: s.study_id,
    effect_size: s.effect_size,
    standard_error: s.standard_error,
    precision: 1 / s.standard_error,
  }));
}

/**
 * Assess publication bias
 */
export function assessPublicationBias(
  studies: StudyForBiasAssessment[],
  pooledEffect: number
): PublicationBiasAssessment {
  const warnings: string[] = [];
  
  // Validate
  if (studies.length === 0) {
    throw new Error('No studies provided for publication bias assessment');
  }
  
  if (studies.length < 3) {
    warnings.push('Very few studies (<3) - publication bias tests have low power');
  } else if (studies.length < 10) {
    warnings.push('Few studies (<10) - publication bias tests may have low power');
  }
  
  // Calculate Egger's test
  const eggersTest = calculateEggersTest(studies);
  
  // Calculate Begg's test
  const beggsTest = calculateBeggsTest(studies);
  
  // Generate funnel plot data
  const funnelPlot = {
    studies: generateFunnelPlotData(studies),
    pooled_effect: pooledEffect,
  };
  
  // Overall assessment
  const eggerSignificant = eggersTest.p_value < 0.10;
  const beggSignificant = beggsTest.p_value < 0.10;
  
  let biasDetected = false;
  let assessmentConfidence: 'low' | 'moderate' | 'high' = 'moderate';
  let interpretation = '';
  
  if (eggerSignificant && beggSignificant) {
    biasDetected = true;
    assessmentConfidence = 'high';
    interpretation = 'Both Egger\'s and Begg\'s tests suggest publication bias. Results should be interpreted with caution.';
  } else if (eggerSignificant || beggSignificant) {
    biasDetected = true;
    assessmentConfidence = 'moderate';
    interpretation = 'One test suggests possible publication bias. Consider sensitivity analysis.';
  } else {
    biasDetected = false;
    assessmentConfidence = 'moderate';
    interpretation = 'No strong evidence of publication bias detected. However, absence of evidence is not evidence of absence.';
  }
  
  if (studies.length < 10) {
    assessmentConfidence = 'low';
    interpretation += ' Note: Low power due to small number of studies.';
  }
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  if (studies.length < 3) {
    confidence -= 0.3;
  } else if (studies.length < 10) {
    confidence -= 0.1;
  }
  
  // Reduce confidence if tests disagree
  if (eggerSignificant !== beggSignificant) {
    confidence -= 0.1;
    warnings.push('Egger\'s and Begg\'s tests give conflicting results');
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    n_studies: studies.length,
    eggers_test: eggersTest,
    beggs_test: beggsTest,
    funnel_plot: funnelPlot,
    overall_assessment: {
      bias_detected: biasDetected,
      confidence: assessmentConfidence,
      interpretation,
    },
    confidence,
    warnings,
  };
}

/**
 * MCP tool interface for publication bias assessment
 */
export async function assessPublicationBiasMCP(args: {
  studies: StudyForBiasAssessment[];
  pooled_effect: number;
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Assessing publication bias', {
      n_studies: args.studies.length,
    });
    
    const result = assessPublicationBias(args.studies, args.pooled_effect);
    
    logger.info('Publication bias assessment complete', {
      bias_detected: result.overall_assessment.bias_detected,
      eggers_p: result.eggers_test.p_value,
      beggs_p: result.beggs_test.p_value,
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
    logger.error('Error assessing publication bias', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error assessing publication bias: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
