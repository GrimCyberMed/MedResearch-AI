/**
 * Funnel Plot Rendering (SVG)
 * 
 * Generates SVG funnel plots for publication bias assessment.
 * Plots effect size vs. standard error with funnel overlay.
 * 
 * Reference: Cochrane Handbook Chapter 13 (Page et al., 2023)
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Study data for funnel plot
 */
export interface FunnelPlotStudy {
  study_id: string;
  study_name: string;
  effect_size: number;
  standard_error: number;
}

/**
 * Funnel plot configuration
 */
export interface FunnelPlotConfig {
  width?: number;
  height?: number;
  measure_type?: 'OR' | 'RR' | 'MD' | 'SMD';
  show_funnel?: boolean;
  show_contours?: boolean;
}

/**
 * Funnel plot SVG result
 */
export interface FunnelPlotSVGResult {
  svg: string;
  metadata: {
    width: number;
    height: number;
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
    total_studies: number;
    asymmetry_detected: boolean;
  };
  interpretation: string;
}

/**
 * Calculate plot dimensions
 */
function calculateDimensions(config: FunnelPlotConfig): {
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
} {
  const width = config.width || 600;
  const height = config.height || 500;
  const marginTop = 60;
  const marginBottom = 60;
  const marginLeft = 80;
  const marginRight = 40;
  
  return { width, height, marginTop, marginBottom, marginLeft, marginRight };
}

/**
 * Calculate axis ranges
 */
function calculateRanges(
  studies: FunnelPlotStudy[]
): { xMin: number; xMax: number; yMin: number; yMax: number } {
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = 0;
  let yMax = -Infinity;
  
  for (const study of studies) {
    xMin = Math.min(xMin, study.effect_size);
    xMax = Math.max(xMax, study.effect_size);
    yMax = Math.max(yMax, study.standard_error);
  }
  
  // Add padding
  const xRange = xMax - xMin;
  xMin -= xRange * 0.2;
  xMax += xRange * 0.2;
  yMax += yMax * 0.1;
  
  return { xMin, xMax, yMin, yMax };
}

/**
 * Create SVG header
 */
function createSVGHeader(width: number, height: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .axis-label { font-family: Arial, sans-serif; font-size: 12px; fill: #666; }
      .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #000; }
      .study-point { fill: #2563eb; stroke: #1e40af; stroke-width: 1; }
      .funnel-line { stroke: #999; stroke-width: 1; stroke-dasharray: 3,3; fill: none; }
      .center-line { stroke: #333; stroke-width: 1.5; }
    </style>
  </defs>
`;
}

/**
 * Create title
 */
function createTitle(width: number): string {
  return `  <text x="${width / 2}" y="30" class="title" text-anchor="middle">Funnel Plot</text>\n`;
}

/**
 * Create axes
 */
function createAxes(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  marginLeft: number,
  marginRight: number,
  marginTop: number,
  marginBottom: number,
  width: number,
  height: number,
  measureType: string
): string {
  let svg = '';
  
  const plotWidth = width - marginLeft - marginRight;
  const plotHeight = height - marginTop - marginBottom;
  
  // X-axis
  const xAxisY = height - marginBottom;
  svg += `  <line x1="${marginLeft}" y1="${xAxisY}" x2="${width - marginRight}" y2="${xAxisY}" stroke="#333" stroke-width="1"/>\n`;
  
  // X-axis ticks and labels
  const numXTicks = 5;
  for (let i = 0; i <= numXTicks; i++) {
    const value = xMin + (xMax - xMin) * (i / numXTicks);
    const x = marginLeft + (value - xMin) / (xMax - xMin) * plotWidth;
    
    svg += `  <line x1="${x}" y1="${xAxisY}" x2="${x}" y2="${xAxisY + 5}" stroke="#333" stroke-width="1"/>\n`;
    svg += `  <text x="${x}" y="${xAxisY + 20}" class="axis-label" text-anchor="middle">${value.toFixed(2)}</text>\n`;
  }
  
  // X-axis label
  const xLabel = measureType || 'Effect Size';
  svg += `  <text x="${width / 2}" y="${height - 10}" class="axis-label" text-anchor="middle">${xLabel}</text>\n`;
  
  // Y-axis (inverted - smaller SE at top)
  const yAxisX = marginLeft;
  svg += `  <line x1="${yAxisX}" y1="${marginTop}" x2="${yAxisX}" y2="${xAxisY}" stroke="#333" stroke-width="1"/>\n`;
  
  // Y-axis ticks and labels
  const numYTicks = 5;
  for (let i = 0; i <= numYTicks; i++) {
    const value = yMin + (yMax - yMin) * (i / numYTicks);
    const y = marginTop + (1 - (value - yMin) / (yMax - yMin)) * plotHeight; // Inverted
    
    svg += `  <line x1="${yAxisX - 5}" y1="${y}" x2="${yAxisX}" y2="${y}" stroke="#333" stroke-width="1"/>\n`;
    svg += `  <text x="${yAxisX - 10}" y="${y + 5}" class="axis-label" text-anchor="end">${value.toFixed(2)}</text>\n`;
  }
  
  // Y-axis label
  svg += `  <text x="20" y="${height / 2}" class="axis-label" text-anchor="middle" transform="rotate(-90, 20, ${height / 2})">Standard Error</text>\n`;
  
  return svg;
}

/**
 * Create funnel overlay
 */
function createFunnel(
  xMin: number,
  xMax: number,
  _yMin: number,
  yMax: number,
  marginLeft: number,
  marginTop: number,
  marginBottom: number,
  width: number,
  height: number,
  pooledEffect: number
): string {
  let svg = '';
  
  const plotWidth = width - marginLeft - 40;
  
  // Center line at pooled effect
  const centerX = marginLeft + (pooledEffect - xMin) / (xMax - xMin) * plotWidth;
  svg += `  <line x1="${centerX}" y1="${marginTop}" x2="${centerX}" y2="${height - marginBottom}" class="center-line"/>\n`;
  
  // Funnel lines (95% CI)
  const funnelWidth = 1.96; // 95% CI
  
  // Left funnel line
  const leftTopX = centerX;
  const leftTopY = marginTop;
  const leftBottomX = marginLeft + (pooledEffect - funnelWidth * yMax - xMin) / (xMax - xMin) * plotWidth;
  const leftBottomY = height - marginBottom;
  
  svg += `  <line x1="${leftTopX}" y1="${leftTopY}" x2="${leftBottomX}" y2="${leftBottomY}" class="funnel-line"/>\n`;
  
  // Right funnel line
  const rightTopX = centerX;
  const rightTopY = marginTop;
  const rightBottomX = marginLeft + (pooledEffect + funnelWidth * yMax - xMin) / (xMax - xMin) * plotWidth;
  const rightBottomY = height - marginBottom;
  
  svg += `  <line x1="${rightTopX}" y1="${rightTopY}" x2="${rightBottomX}" y2="${rightBottomY}" class="funnel-line"/>\n`;
  
  return svg;
}

/**
 * Create study points
 */
function createStudyPoints(
  studies: FunnelPlotStudy[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  marginLeft: number,
  marginTop: number,
  marginBottom: number,
  width: number,
  height: number
): string {
  let svg = '';
  
  const plotWidth = width - marginLeft - 40;
  const plotHeight = height - marginTop - marginBottom;
  
  for (const study of studies) {
    const x = marginLeft + (study.effect_size - xMin) / (xMax - xMin) * plotWidth;
    const y = marginTop + (1 - (study.standard_error - yMin) / (yMax - yMin)) * plotHeight; // Inverted
    
    svg += `  <circle cx="${x}" cy="${y}" r="4" class="study-point"/>\n`;
  }
  
  return svg;
}

/**
 * Detect asymmetry
 */
function detectAsymmetry(studies: FunnelPlotStudy[], pooledEffect: number): boolean {
  // Simple asymmetry detection: check if studies are balanced around pooled effect
  let leftCount = 0;
  let rightCount = 0;
  
  for (const study of studies) {
    if (study.effect_size < pooledEffect) {
      leftCount++;
    } else {
      rightCount++;
    }
  }
  
  // Asymmetry if imbalance > 2:1
  const ratio = Math.max(leftCount, rightCount) / Math.min(leftCount, rightCount);
  return ratio > 2 && Math.abs(leftCount - rightCount) >= 3;
}

/**
 * Generate interpretation
 */
function generateInterpretation(
  totalStudies: number,
  asymmetryDetected: boolean
): string {
  const parts: string[] = [];
  
  parts.push(`Funnel plot of ${totalStudies} studies.`);
  
  if (asymmetryDetected) {
    parts.push('Visual inspection suggests potential asymmetry, which may indicate publication bias or small-study effects.');
    parts.push('Formal statistical tests (Egger, Begg) recommended.');
  } else {
    parts.push('Visual inspection suggests reasonable symmetry.');
    parts.push('However, formal statistical tests should be performed to confirm absence of publication bias.');
  }
  
  return parts.join(' ');
}

/**
 * Generate funnel plot SVG
 */
export function generateFunnelPlotSVG(
  studies: FunnelPlotStudy[],
  pooledEffect: number,
  config: FunnelPlotConfig = {}
): FunnelPlotSVGResult {
  logger.info('Generating funnel plot SVG', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    study_count: studies.length,
  });
  
  // Set defaults
  const measureType = config.measure_type || 'Effect Size';
  const showFunnel = config.show_funnel !== false;
  
  // Calculate dimensions
  const dims = calculateDimensions(config);
  const { xMin, xMax, yMin, yMax } = calculateRanges(studies);
  
  // Build SVG
  let svg = createSVGHeader(dims.width, dims.height);
  
  // Title
  svg += createTitle(dims.width);
  
  // Axes
  svg += createAxes(
    xMin, xMax, yMin, yMax,
    dims.marginLeft, dims.marginRight, dims.marginTop, dims.marginBottom,
    dims.width, dims.height, measureType
  );
  
  // Funnel overlay
  if (showFunnel) {
    svg += createFunnel(
      xMin, xMax, yMin, yMax,
      dims.marginLeft, dims.marginTop, dims.marginBottom,
      dims.width, dims.height, pooledEffect
    );
  }
  
  // Study points
  svg += createStudyPoints(
    studies, xMin, xMax, yMin, yMax,
    dims.marginLeft, dims.marginTop, dims.marginBottom,
    dims.width, dims.height
  );
  
  // Close SVG
  svg += '</svg>';
  
  // Detect asymmetry
  const asymmetryDetected = detectAsymmetry(studies, pooledEffect);
  
  // Generate interpretation
  const interpretation = generateInterpretation(studies.length, asymmetryDetected);
  
  const result: FunnelPlotSVGResult = {
    svg,
    metadata: {
      width: dims.width,
      height: dims.height,
      x_min: xMin,
      x_max: xMax,
      y_min: yMin,
      y_max: yMax,
      total_studies: studies.length,
      asymmetry_detected: asymmetryDetected,
    },
    interpretation,
  };
  
  logger.info('Funnel plot SVG generated', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    total_studies: studies.length,
    asymmetry_detected: asymmetryDetected,
  });
  
  return result;
}
