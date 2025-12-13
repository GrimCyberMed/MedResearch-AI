/**
 * Forest Plot Data Generation
 * 
 * Generates structured data for forest plot visualization in meta-analysis:
 * - Study-level effect sizes with confidence intervals
 * - Pooled effect (diamond)
 * - Study weights
 * - Heterogeneity statistics
 * - Subgroup organization
 * 
 * Includes:
 * - Automatic scaling and positioning
 * - Null line (effect = 0 or 1)
 * - Study ordering options
 * - Conservative confidence scoring
 * 
 * References:
 * - Cochrane Handbook for Systematic Reviews (Chapter 10)
 * - Lewis & Clarke (2001) Forest plots: trying to see the wood and the trees
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Study data for forest plot
 */
export interface ForestPlotStudy {
  /** Study identifier */
  study_id: string;
  
  /** Effect size estimate */
  effect_size: number;
  
  /** 95% confidence interval */
  ci_lower: number;
  ci_upper: number;
  
  /** Standard error */
  standard_error?: number;
  
  /** Study weight (percentage) */
  weight?: number;
  
  /** Sample size */
  sample_size?: number;
  
  /** Year of publication */
  year?: number;
  
  /** Subgroup (optional) */
  subgroup?: string;
  
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Pooled effect for forest plot
 */
export interface ForestPlotPooledEffect {
  /** Pooled effect size */
  pooled_effect: number;
  
  /** 95% confidence interval */
  ci_lower: number;
  ci_upper: number;
  
  /** Model used */
  model: 'fixed' | 'random';
  
  /** P-value */
  p_value?: number;
}

/**
 * Heterogeneity statistics for forest plot
 */
export interface ForestPlotHeterogeneity {
  /** I² statistic */
  i_squared: number;
  
  /** τ² (tau-squared) */
  tau_squared?: number;
  
  /** Q statistic */
  q_statistic?: number;
  
  /** Q p-value */
  q_p_value?: number;
}

/**
 * Study ordering options
 */
export type StudyOrdering = 'default' | 'year' | 'weight' | 'effect_size' | 'alphabetical';

/**
 * Effect measure type
 */
export type EffectMeasure = 'OR' | 'RR' | 'RD' | 'MD' | 'SMD' | 'HR' | 'generic';

/**
 * Forest plot data structure
 */
export interface ForestPlotData {
  /** Title of the forest plot */
  title: string;
  
  /** Effect measure */
  effect_measure: EffectMeasure;
  
  /** Studies data */
  studies: Array<ForestPlotStudy & {
    /** Y-axis position (0 = bottom) */
    y_position: number;
    
    /** Display order */
    display_order: number;
  }>;
  
  /** Pooled effect */
  pooled_effect: ForestPlotPooledEffect & {
    /** Y-axis position for diamond */
    y_position: number;
  };
  
  /** Heterogeneity statistics */
  heterogeneity?: ForestPlotHeterogeneity;
  
  /** Subgroups (if any) */
  subgroups?: Array<{
    name: string;
    studies: string[]; // study_ids
    pooled_effect?: ForestPlotPooledEffect;
  }>;
  
  /** X-axis configuration */
  x_axis: {
    /** Minimum value */
    min: number;
    
    /** Maximum value */
    max: number;
    
    /** Null effect value (0 for MD/SMD/RD, 1 for OR/RR/HR) */
    null_value: number;
    
    /** Log scale (for OR/RR/HR) */
    log_scale: boolean;
    
    /** Tick marks */
    ticks: number[];
  };
  
  /** Y-axis configuration */
  y_axis: {
    /** Total height (number of rows) */
    height: number;
    
    /** Labels */
    labels: Array<{
      y_position: number;
      text: string;
      type: 'study' | 'pooled' | 'subgroup' | 'header';
    }>;
  };
  
  /** Favors labels */
  favors: {
    left: string;
    right: string;
  };
  
  /** Confidence in the data quality (0-1) */
  confidence: number;
  
  /** Warnings */
  warnings: string[];
}

/**
 * Determine null value based on effect measure
 */
function getNullValue(measure: EffectMeasure): number {
  switch (measure) {
    case 'OR':
    case 'RR':
    case 'HR':
      return 1; // Ratio measures
    case 'RD':
    case 'MD':
    case 'SMD':
      return 0; // Difference measures
    case 'generic':
    default:
      return 0;
  }
}

/**
 * Determine if log scale should be used
 */
function useLogScale(measure: EffectMeasure): boolean {
  return ['OR', 'RR', 'HR'].includes(measure);
}

/**
 * Calculate X-axis range with padding
 */
function calculateXAxisRange(
  studies: ForestPlotStudy[],
  pooledEffect: ForestPlotPooledEffect,
  logScale: boolean
): { min: number; max: number; ticks: number[] } {
  // Collect all values
  const values: number[] = [];
  
  for (const study of studies) {
    values.push(study.effect_size, study.ci_lower, study.ci_upper);
  }
  
  values.push(pooledEffect.pooled_effect, pooledEffect.ci_lower, pooledEffect.ci_upper);
  
  // Filter out invalid values
  const validValues = values.filter(v => isFinite(v));
  
  if (validValues.length === 0) {
    return { min: 0, max: 1, ticks: [0, 0.5, 1] };
  }
  
  let min = Math.min(...validValues);
  let max = Math.max(...validValues);
  
  if (logScale) {
    // For log scale, ensure min > 0
    min = Math.max(0.01, min);
    
    // Add padding in log space
    const logMin = Math.log(min);
    const logMax = Math.log(max);
    const logRange = logMax - logMin;
    const logPadding = logRange * 0.1;
    
    min = Math.exp(logMin - logPadding);
    max = Math.exp(logMax + logPadding);
    
    // Generate ticks on log scale
    const ticks = generateLogTicks(min, max);
    
    return { min, max, ticks };
  } else {
    // Linear scale
    const range = max - min;
    const padding = range * 0.1;
    
    min = min - padding;
    max = max + padding;
    
    // Generate ticks on linear scale
    const ticks = generateLinearTicks(min, max);
    
    return { min, max, ticks };
  }
}

/**
 * Generate tick marks for log scale
 */
function generateLogTicks(min: number, max: number): number[] {
  const ticks: number[] = [];
  
  // Common values for ratio measures
  const commonValues = [0.01, 0.1, 0.2, 0.5, 1, 2, 5, 10, 100];
  
  for (const value of commonValues) {
    if (value >= min && value <= max) {
      ticks.push(value);
    }
  }
  
  // Ensure we have at least 3 ticks
  if (ticks.length < 3) {
    ticks.push(min, (min + max) / 2, max);
  }
  
  return ticks.sort((a, b) => a - b);
}

/**
 * Generate tick marks for linear scale
 */
function generateLinearTicks(min: number, max: number): number[] {
  const range = max - min;
  const roughStep = range / 5; // Aim for ~5 ticks
  
  // Round to nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;
  
  let niceStep: number;
  if (normalized < 1.5) {
    niceStep = magnitude;
  } else if (normalized < 3) {
    niceStep = 2 * magnitude;
  } else if (normalized < 7) {
    niceStep = 5 * magnitude;
  } else {
    niceStep = 10 * magnitude;
  }
  
  // Generate ticks
  const ticks: number[] = [];
  const start = Math.ceil(min / niceStep) * niceStep;
  
  for (let tick = start; tick <= max; tick += niceStep) {
    ticks.push(tick);
  }
  
  return ticks;
}

/**
 * Order studies based on ordering option
 */
function orderStudies(
  studies: ForestPlotStudy[],
  ordering: StudyOrdering
): ForestPlotStudy[] {
  const sorted = [...studies];
  
  switch (ordering) {
    case 'year':
      sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
      break;
    case 'weight':
      sorted.sort((a, b) => (b.weight || 0) - (a.weight || 0));
      break;
    case 'effect_size':
      sorted.sort((a, b) => a.effect_size - b.effect_size);
      break;
    case 'alphabetical':
      sorted.sort((a, b) => a.study_id.localeCompare(b.study_id));
      break;
    case 'default':
    default:
      // Keep original order
      break;
  }
  
  return sorted;
}

/**
 * Generate forest plot data
 */
export function generateForestPlotData(
  studies: ForestPlotStudy[],
  pooledEffect: ForestPlotPooledEffect,
  options: {
    title?: string;
    effect_measure?: EffectMeasure;
    heterogeneity?: ForestPlotHeterogeneity;
    ordering?: StudyOrdering;
    favors_left?: string;
    favors_right?: string;
  } = {}
): ForestPlotData {
  const warnings: string[] = [];
  
  // Validate
  if (studies.length === 0) {
    throw new Error('No studies provided for forest plot');
  }
  
  // Extract options
  const title = options.title || 'Forest Plot';
  const effectMeasure = options.effect_measure || 'generic';
  const ordering = options.ordering || 'default';
  const favorsLeft = options.favors_left || 'Favors treatment';
  const favorsRight = options.favors_right || 'Favors control';
  
  // Determine null value and log scale
  const nullValue = getNullValue(effectMeasure);
  const logScale = useLogScale(effectMeasure);
  
  // Order studies
  const orderedStudies = orderStudies(studies, ordering);
  
  // Calculate X-axis range
  const xAxisRange = calculateXAxisRange(orderedStudies, pooledEffect, logScale);
  const xAxis = {
    ...xAxisRange,
    null_value: nullValue,
    log_scale: logScale,
  };
  
  // Assign Y positions (bottom to top)
  let currentY = 0;
  const labels: Array<{
    y_position: number;
    text: string;
    type: 'study' | 'pooled' | 'subgroup' | 'header';
  }> = [];
  
  // Add header
  labels.push({
    y_position: currentY,
    text: 'Study',
    type: 'header',
  });
  currentY++;
  
  // Add studies
  const studiesWithPosition = orderedStudies.map((study, index) => {
    const yPos = currentY;
    currentY++;
    
    labels.push({
      y_position: yPos,
      text: study.study_id,
      type: 'study',
    });
    
    return {
      ...study,
      y_position: yPos,
      display_order: index,
    };
  });
  
  // Add pooled effect
  const pooledYPosition = currentY;
  currentY++;
  
  labels.push({
    y_position: pooledYPosition,
    text: `Overall (${pooledEffect.model})`,
    type: 'pooled',
  });
  
  const pooledWithPosition = {
    ...pooledEffect,
    y_position: pooledYPosition,
  };
  
  // Y-axis configuration
  const yAxis = {
    height: currentY,
    labels,
  };
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Reduce confidence for few studies
  if (studies.length < 3) {
    confidence -= 0.2;
    warnings.push('Very few studies (<3) - forest plot may not be informative');
  } else if (studies.length < 5) {
    confidence -= 0.1;
    warnings.push('Few studies (<5) - interpret with caution');
  }
  
  // Reduce confidence for very wide CIs
  const wideCI = studies.some(s => {
    const ciWidth = s.ci_upper - s.ci_lower;
    const effectSize = Math.abs(s.effect_size);
    return effectSize > 0 && ciWidth / effectSize > 5;
  });
  
  if (wideCI) {
    confidence -= 0.1;
    warnings.push('Some studies have very wide confidence intervals');
  }
  
  // Reduce confidence for extreme values
  const hasExtremeValues = studies.some(s => 
    !isFinite(s.effect_size) || !isFinite(s.ci_lower) || !isFinite(s.ci_upper)
  );
  
  if (hasExtremeValues) {
    confidence -= 0.2;
    warnings.push('Some studies have extreme or invalid values');
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    title,
    effect_measure: effectMeasure,
    studies: studiesWithPosition,
    pooled_effect: pooledWithPosition,
    heterogeneity: options.heterogeneity,
    x_axis: xAxis,
    y_axis: yAxis,
    favors: {
      left: favorsLeft,
      right: favorsRight,
    },
    confidence,
    warnings,
  };
}

/**
 * MCP tool interface for forest plot data generation
 */
export async function generateForestPlotDataMCP(args: {
  studies: ForestPlotStudy[];
  pooled_effect: ForestPlotPooledEffect;
  title?: string;
  effect_measure?: EffectMeasure;
  heterogeneity?: ForestPlotHeterogeneity;
  ordering?: StudyOrdering;
  favors_left?: string;
  favors_right?: string;
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Generating forest plot data', {
      n_studies: args.studies.length,
      effect_measure: args.effect_measure || 'generic',
    });
    
    const result = generateForestPlotData(args.studies, args.pooled_effect, {
      title: args.title,
      effect_measure: args.effect_measure,
      heterogeneity: args.heterogeneity,
      ordering: args.ordering,
      favors_left: args.favors_left,
      favors_right: args.favors_right,
    });
    
    logger.info('Forest plot data generation complete', {
      n_studies: result.studies.length,
      y_height: result.y_axis.height,
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
    logger.error('Error generating forest plot data', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error generating forest plot data: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
