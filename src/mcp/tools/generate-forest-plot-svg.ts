/**
 * Enhanced Forest Plot Rendering (SVG)
 * 
 * Generates publication-quality SVG forest plots for meta-analysis.
 * Creates scalable vector graphics with study names, effect sizes,
 * confidence intervals, and pooled estimates.
 * 
 * Reference: Cochrane Handbook Chapter 10 (Deeks et al., 2023)
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Study effect size data
 */
export interface StudyEffectSize {
  study_id: string;
  study_name: string;
  effect_size: number;
  ci_lower: number;
  ci_upper: number;
  weight: number;
}

/**
 * Pooled effect result
 */
export interface PooledEffect {
  effect_size: number;
  ci_lower: number;
  ci_upper: number;
  p_value: number;
}

/**
 * Heterogeneity statistics
 */
export interface HeterogeneityStats {
  i_squared: number;
  tau_squared: number;
  q_statistic: number;
  p_value: number;
}

/**
 * Forest plot configuration
 */
export interface ForestPlotConfig {
  width?: number;
  height?: number;
  measure_type?: 'OR' | 'RR' | 'MD' | 'SMD';
  favors_left?: string;
  favors_right?: string;
  show_weights?: boolean;
  show_heterogeneity?: boolean;
}

/**
 * Forest plot SVG result
 */
export interface ForestPlotSVGResult {
  svg: string;
  metadata: {
    width: number;
    height: number;
    x_min: number;
    x_max: number;
    null_value: number;
    total_studies: number;
  };
}

/**
 * Calculate plot dimensions
 */
function calculateDimensions(
  studies: StudyEffectSize[],
  config: ForestPlotConfig
): { width: number; height: number; rowHeight: number; marginTop: number; marginBottom: number; marginLeft: number; marginRight: number } {
  const rowHeight = 30;
  const marginTop = 80;
  const marginBottom = config.show_heterogeneity ? 120 : 80;
  const marginLeft = 200;
  const marginRight = 150;
  
  const plotHeight = studies.length * rowHeight + 100; // Extra space for pooled estimate
  const height = config.height || (plotHeight + marginTop + marginBottom);
  const width = config.width || 800;
  
  return { width, height, rowHeight, marginTop, marginBottom, marginLeft, marginRight };
}

/**
 * Calculate x-axis range
 */
function calculateXRange(
  studies: StudyEffectSize[],
  pooledEffect: PooledEffect,
  measureType: string
): { xMin: number; xMax: number; nullValue: number } {
  const nullValue = (measureType === 'OR' || measureType === 'RR') ? 1 : 0;
  
  // Find min and max values
  let minVal = pooledEffect.ci_lower;
  let maxVal = pooledEffect.ci_upper;
  
  for (const study of studies) {
    minVal = Math.min(minVal, study.ci_lower);
    maxVal = Math.max(maxVal, study.ci_upper);
  }
  
  // Add padding (20%)
  const range = maxVal - minVal;
  const padding = range * 0.2;
  
  const xMin = minVal - padding;
  const xMax = maxVal + padding;
  
  return { xMin, xMax, nullValue };
}

/**
 * Create SVG header
 */
function createSVGHeader(width: number, height: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .study-name { font-family: Arial, sans-serif; font-size: 12px; fill: #333; }
      .effect-size { font-family: Arial, sans-serif; font-size: 11px; fill: #666; }
      .axis-label { font-family: Arial, sans-serif; font-size: 11px; fill: #666; }
      .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #000; }
      .subtitle { font-family: Arial, sans-serif; font-size: 12px; fill: #666; }
      .ci-line { stroke: #333; stroke-width: 1.5; }
      .null-line { stroke: #999; stroke-width: 1; stroke-dasharray: 5,5; }
      .pooled-diamond { fill: #2563eb; stroke: #1e40af; stroke-width: 1.5; }
    </style>
  </defs>
`;
}

/**
 * Create title
 */
function createTitle(width: number, measureType: string): string {
  const title = `Forest Plot - ${measureType}`;
  return `  <text x="${width / 2}" y="30" class="title" text-anchor="middle">${title}</text>\n`;
}

/**
 * Create x-axis
 */
function createXAxis(
  xMin: number,
  xMax: number,
  _nullValue: number,
  marginLeft: number,
  marginRight: number,
  width: number,
  yPosition: number,
  measureType: string
): string {
  const plotWidth = width - marginLeft - marginRight;
  
  let svg = '';
  
  // Axis line
  svg += `  <line x1="${marginLeft}" y1="${yPosition}" x2="${width - marginRight}" y2="${yPosition}" stroke="#333" stroke-width="1"/>\n`;
  
  // Tick marks and labels
  const numTicks = 5;
  for (let i = 0; i <= numTicks; i++) {
    const value = xMin + (xMax - xMin) * (i / numTicks);
    const x = marginLeft + (value - xMin) / (xMax - xMin) * plotWidth;
    
    svg += `  <line x1="${x}" y1="${yPosition}" x2="${x}" y2="${yPosition + 5}" stroke="#333" stroke-width="1"/>\n`;
    svg += `  <text x="${x}" y="${yPosition + 20}" class="axis-label" text-anchor="middle">${value.toFixed(2)}</text>\n`;
  }
  
  // Axis label
  const axisLabel = (measureType === 'OR' || measureType === 'RR') ? measureType : 'Effect Size';
  svg += `  <text x="${width / 2}" y="${yPosition + 40}" class="axis-label" text-anchor="middle">${axisLabel}</text>\n`;
  
  return svg;
}

/**
 * Create null effect line
 */
function createNullLine(
  nullValue: number,
  xMin: number,
  xMax: number,
  marginLeft: number,
  marginRight: number,
  width: number,
  marginTop: number,
  plotHeight: number
): string {
  const plotWidth = width - marginLeft - marginRight;
  const x = marginLeft + (nullValue - xMin) / (xMax - xMin) * plotWidth;
  
  return `  <line x1="${x}" y1="${marginTop}" x2="${x}" y2="${marginTop + plotHeight}" class="null-line"/>\n`;
}

/**
 * Create study row
 */
function createStudyRow(
  study: StudyEffectSize,
  _index: number,
  xMin: number,
  xMax: number,
  marginLeft: number,
  marginRight: number,
  width: number,
  yPosition: number,
  showWeights: boolean
): string {
  const plotWidth = width - marginLeft - marginRight;
  
  let svg = '';
  
  // Study name
  svg += `  <text x="10" y="${yPosition + 5}" class="study-name">${study.study_name}</text>\n`;
  
  // Confidence interval line
  const ciLowerX = marginLeft + (study.ci_lower - xMin) / (xMax - xMin) * plotWidth;
  const ciUpperX = marginLeft + (study.ci_upper - xMin) / (xMax - xMin) * plotWidth;
  svg += `  <line x1="${ciLowerX}" y1="${yPosition}" x2="${ciUpperX}" y2="${yPosition}" class="ci-line"/>\n`;
  
  // Point estimate (square sized by weight)
  const pointX = marginLeft + (study.effect_size - xMin) / (xMax - xMin) * plotWidth;
  const squareSize = 5 + study.weight * 10; // Scale by weight
  svg += `  <rect x="${pointX - squareSize / 2}" y="${yPosition - squareSize / 2}" width="${squareSize}" height="${squareSize}" fill="#333"/>\n`;
  
  // Effect size and CI text
  const effectText = `${study.effect_size.toFixed(2)} [${study.ci_lower.toFixed(2)}, ${study.ci_upper.toFixed(2)}]`;
  svg += `  <text x="${width - marginRight + 10}" y="${yPosition + 5}" class="effect-size">${effectText}</text>\n`;
  
  // Weight (if shown)
  if (showWeights) {
    const weightText = `${(study.weight * 100).toFixed(1)}%`;
    svg += `  <text x="${width - 50}" y="${yPosition + 5}" class="effect-size">${weightText}</text>\n`;
  }
  
  return svg;
}

/**
 * Create pooled estimate (diamond)
 */
function createPooledDiamond(
  pooledEffect: PooledEffect,
  xMin: number,
  xMax: number,
  marginLeft: number,
  marginRight: number,
  width: number,
  yPosition: number
): string {
  const plotWidth = width - marginLeft - marginRight;
  
  let svg = '';
  
  // Label
  svg += `  <text x="10" y="${yPosition + 5}" class="study-name" font-weight="bold">Pooled Effect</text>\n`;
  
  // Diamond points
  const centerX = marginLeft + (pooledEffect.effect_size - xMin) / (xMax - xMin) * plotWidth;
  const leftX = marginLeft + (pooledEffect.ci_lower - xMin) / (xMax - xMin) * plotWidth;
  const rightX = marginLeft + (pooledEffect.ci_upper - xMin) / (xMax - xMin) * plotWidth;
  
  const diamondHeight = 10;
  const points = `${leftX},${yPosition} ${centerX},${yPosition - diamondHeight} ${rightX},${yPosition} ${centerX},${yPosition + diamondHeight}`;
  
  svg += `  <polygon points="${points}" class="pooled-diamond"/>\n`;
  
  // Effect size text
  const effectText = `${pooledEffect.effect_size.toFixed(2)} [${pooledEffect.ci_lower.toFixed(2)}, ${pooledEffect.ci_upper.toFixed(2)}]`;
  svg += `  <text x="${width - marginRight + 10}" y="${yPosition + 5}" class="effect-size" font-weight="bold">${effectText}</text>\n`;
  
  return svg;
}

/**
 * Create heterogeneity text
 */
function createHeterogeneityText(
  heterogeneity: HeterogeneityStats,
  yPosition: number
): string {
  let svg = '';
  
  svg += `  <text x="10" y="${yPosition}" class="subtitle">Heterogeneity: I² = ${heterogeneity.i_squared.toFixed(1)}%, τ² = ${heterogeneity.tau_squared.toFixed(3)}, Q = ${heterogeneity.q_statistic.toFixed(2)} (p = ${heterogeneity.p_value.toFixed(3)})</text>\n`;
  
  return svg;
}

/**
 * Create favors labels
 */
function createFavorsLabels(
  favorsLeft: string,
  favorsRight: string,
  marginLeft: number,
  marginRight: number,
  width: number,
  yPosition: number
): string {
  let svg = '';
  
  svg += `  <text x="${marginLeft}" y="${yPosition}" class="subtitle">Favors ${favorsLeft}</text>\n`;
  svg += `  <text x="${width - marginRight}" y="${yPosition}" class="subtitle" text-anchor="end">Favors ${favorsRight}</text>\n`;
  
  return svg;
}

/**
 * Generate forest plot SVG
 */
export function generateForestPlotSVG(
  studies: StudyEffectSize[],
  pooledEffect: PooledEffect,
  heterogeneity: HeterogeneityStats,
  config: ForestPlotConfig = {}
): ForestPlotSVGResult {
  logger.info('Generating forest plot SVG', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    study_count: studies.length,
  });
  
  // Set defaults
  const measureType = config.measure_type || 'OR';
  const favorsLeft = config.favors_left || 'Treatment';
  const favorsRight = config.favors_right || 'Control';
  const showWeights = config.show_weights !== false;
  const showHeterogeneity = config.show_heterogeneity !== false;
  
  // Calculate dimensions
  const dims = calculateDimensions(studies, config);
  const { xMin, xMax, nullValue } = calculateXRange(studies, pooledEffect, measureType);
  
  // Build SVG
  let svg = createSVGHeader(dims.width, dims.height);
  
  // Title
  svg += createTitle(dims.width, measureType);
  
  // Null effect line
  const plotHeight = studies.length * dims.rowHeight + 50;
  svg += createNullLine(nullValue, xMin, xMax, dims.marginLeft, dims.marginRight, dims.width, dims.marginTop, plotHeight);
  
  // Study rows
  for (let i = 0; i < studies.length; i++) {
    const yPosition = dims.marginTop + i * dims.rowHeight;
    svg += createStudyRow(studies[i], i, xMin, xMax, dims.marginLeft, dims.marginRight, dims.width, yPosition, showWeights);
  }
  
  // Pooled estimate
  const pooledY = dims.marginTop + studies.length * dims.rowHeight + 30;
  svg += createPooledDiamond(pooledEffect, xMin, xMax, dims.marginLeft, dims.marginRight, dims.width, pooledY);
  
  // X-axis
  const axisY = pooledY + 40;
  svg += createXAxis(xMin, xMax, nullValue, dims.marginLeft, dims.marginRight, dims.width, axisY, measureType);
  
  // Heterogeneity
  if (showHeterogeneity) {
    svg += createHeterogeneityText(heterogeneity, axisY + 60);
  }
  
  // Favors labels
  svg += createFavorsLabels(favorsLeft, favorsRight, dims.marginLeft, dims.marginRight, dims.width, axisY + 80);
  
  // Close SVG
  svg += '</svg>';
  
  const result: ForestPlotSVGResult = {
    svg,
    metadata: {
      width: dims.width,
      height: dims.height,
      x_min: xMin,
      x_max: xMax,
      null_value: nullValue,
      total_studies: studies.length,
    },
  };
  
  logger.info('Forest plot SVG generated', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    total_studies: studies.length,
    width: dims.width,
    height: dims.height,
  });
  
  return result;
}
