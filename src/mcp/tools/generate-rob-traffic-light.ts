/**
 * Risk of Bias Traffic Light Plot Generation
 * 
 * Generates traffic light plots for risk of bias visualization.
 * Creates color-coded visual summaries of bias assessments.
 * 
 * Reference: Cochrane Handbook Chapter 7 (Higgins et al., 2023)
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Risk level
 */
export type RiskLevel = 'low' | 'some_concerns' | 'high' | 'unclear';

/**
 * Domain assessment
 */
export interface DomainAssessment {
  domain: string;
  judgment: RiskLevel;
  support: string;
}

/**
 * Study RoB assessment
 */
export interface StudyRoBAssessment {
  study_id: string;
  study_name: string;
  domains: DomainAssessment[];
  overall_judgment: RiskLevel;
}

/**
 * Traffic light plot result
 */
export interface TrafficLightPlotResult {
  plot: string;
  summary: {
    total_studies: number;
    total_domains: number;
    risk_distribution: {
      low: number;
      some_concerns: number;
      high: number;
      unclear: number;
    };
    domain_risk_percentages: Record<string, {
      low_pct: number;
      some_concerns_pct: number;
      high_pct: number;
      unclear_pct: number;
    }>;
  };
  interpretation: string;
}

/**
 * Get color symbol for risk level
 */
function getColorSymbol(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return '🟢'; // Green circle
    case 'some_concerns':
      return '🟡'; // Yellow circle
    case 'high':
      return '🔴'; // Red circle
    case 'unclear':
      return '⚪'; // White circle
    default:
      return '⚪';
  }
}

/**
 * Get ASCII symbol for risk level (fallback)
 */
function getAsciiSymbol(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return '+'; // Green
    case 'some_concerns':
      return '?'; // Yellow
    case 'high':
      return '-'; // Red
    case 'unclear':
      return '·'; // Gray
    default:
      return '·';
  }
}

/**
 * Create plot header
 */
function createPlotHeader(domains: string[]): string[] {
  const lines: string[] = [];
  
  lines.push('');
  lines.push('═'.repeat(80));
  lines.push('                    RISK OF BIAS TRAFFIC LIGHT PLOT');
  lines.push('═'.repeat(80));
  lines.push('');
  lines.push('Legend: 🟢 Low risk  🟡 Some concerns  🔴 High risk  ⚪ Unclear');
  lines.push('        (+)          (?)              (-)           (·)');
  lines.push('');
  lines.push('─'.repeat(80));
  
  // Domain headers
  const maxStudyWidth = 25;
  let headerLine = 'Study'.padEnd(maxStudyWidth) + ' │ ';
  
  for (const domain of domains) {
    const shortDomain = domain.length > 12 ? domain.substring(0, 9) + '...' : domain;
    headerLine += shortDomain.padEnd(12) + ' │ ';
  }
  headerLine += 'Overall';
  
  lines.push(headerLine);
  lines.push('─'.repeat(80));
  
  return lines;
}

/**
 * Create plot row for a study
 */
function createPlotRow(study: StudyRoBAssessment, domainNames: string[]): string {
  const maxStudyWidth = 25;
  
  // Study name
  const studyName = study.study_name.length > maxStudyWidth - 2
    ? study.study_name.substring(0, maxStudyWidth - 5) + '...'
    : study.study_name;
  
  let row = studyName.padEnd(maxStudyWidth) + ' │ ';
  
  // Domain judgments
  for (const domainName of domainNames) {
    const domain = study.domains.find(d => d.domain === domainName);
    const judgment = domain ? domain.judgment : 'unclear';
    const symbol = getColorSymbol(judgment);
    const asciiSymbol = getAsciiSymbol(judgment);
    const cell = `${symbol} (${asciiSymbol})`;
    row += cell.padEnd(12) + ' │ ';
  }
  
  // Overall judgment
  const overallSymbol = getColorSymbol(study.overall_judgment);
  const overallAscii = getAsciiSymbol(study.overall_judgment);
  row += `${overallSymbol} (${overallAscii})`;
  
  return row;
}

/**
 * Create summary section
 */
function createSummarySection(
  domainRiskPercentages: Record<string, {
    low_pct: number;
    some_concerns_pct: number;
    high_pct: number;
    unclear_pct: number;
  }>,
  domainNames: string[]
): string[] {
  const lines: string[] = [];
  
  lines.push('─'.repeat(80));
  lines.push('');
  lines.push('DOMAIN SUMMARY (% of studies at each risk level)');
  lines.push('');
  
  for (const domainName of domainNames) {
    const stats = domainRiskPercentages[domainName];
    const line = `${domainName.padEnd(30)} │ ` +
                 `🟢 ${stats.low_pct.toFixed(0)}%  ` +
                 `🟡 ${stats.some_concerns_pct.toFixed(0)}%  ` +
                 `🔴 ${stats.high_pct.toFixed(0)}%  ` +
                 `⚪ ${stats.unclear_pct.toFixed(0)}%`;
    lines.push(line);
  }
  
  lines.push('');
  lines.push('═'.repeat(80));
  
  return lines;
}

/**
 * Generate risk of bias traffic light plot
 */
export function generateRoBTrafficLight(
  studies: StudyRoBAssessment[]
): TrafficLightPlotResult {
  logger.info('Generating RoB traffic light plot', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    study_count: studies.length,
  });
  
  if (studies.length === 0) {
    return {
      plot: 'No studies to display',
      summary: {
        total_studies: 0,
        total_domains: 0,
        risk_distribution: {
          low: 0,
          some_concerns: 0,
          high: 0,
          unclear: 0,
        },
        domain_risk_percentages: {},
      },
      interpretation: 'No studies available for risk of bias assessment.',
    };
  }
  
  // Extract unique domain names
  const domainNamesSet = new Set<string>();
  for (const study of studies) {
    for (const domain of study.domains) {
      domainNamesSet.add(domain.domain);
    }
  }
  const domainNames = Array.from(domainNamesSet);
  
  // Build plot
  const plotLines: string[] = [];
  
  // Header
  plotLines.push(...createPlotHeader(domainNames));
  
  // Study rows
  for (const study of studies) {
    plotLines.push(createPlotRow(study, domainNames));
  }
  
  // Calculate domain risk percentages
  const domainRiskPercentages: Record<string, {
    low_pct: number;
    some_concerns_pct: number;
    high_pct: number;
    unclear_pct: number;
  }> = {};
  
  for (const domainName of domainNames) {
    let lowCount = 0;
    let someConcernsCount = 0;
    let highCount = 0;
    let unclearCount = 0;
    
    for (const study of studies) {
      const domain = study.domains.find(d => d.domain === domainName);
      const judgment = domain ? domain.judgment : 'unclear';
      
      if (judgment === 'low') lowCount++;
      else if (judgment === 'some_concerns') someConcernsCount++;
      else if (judgment === 'high') highCount++;
      else unclearCount++;
    }
    
    domainRiskPercentages[domainName] = {
      low_pct: (lowCount / studies.length) * 100,
      some_concerns_pct: (someConcernsCount / studies.length) * 100,
      high_pct: (highCount / studies.length) * 100,
      unclear_pct: (unclearCount / studies.length) * 100,
    };
  }
  
  // Summary section
  plotLines.push(...createSummarySection(domainRiskPercentages, domainNames));
  
  // Calculate overall risk distribution
  let totalLow = 0;
  let totalSomeConcerns = 0;
  let totalHigh = 0;
  let totalUnclear = 0;
  
  for (const study of studies) {
    for (const domain of study.domains) {
      if (domain.judgment === 'low') totalLow++;
      else if (domain.judgment === 'some_concerns') totalSomeConcerns++;
      else if (domain.judgment === 'high') totalHigh++;
      else totalUnclear++;
    }
  }
  
  // Generate interpretation
  const interpretation = generateInterpretation(
    studies.length,
    domainNames.length,
    domainRiskPercentages
  );
  
  const result: TrafficLightPlotResult = {
    plot: plotLines.join('\n'),
    summary: {
      total_studies: studies.length,
      total_domains: domainNames.length,
      risk_distribution: {
        low: totalLow,
        some_concerns: totalSomeConcerns,
        high: totalHigh,
        unclear: totalUnclear,
      },
      domain_risk_percentages: domainRiskPercentages,
    },
    interpretation,
  };
  
  logger.info('RoB traffic light plot generated', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    total_studies: studies.length,
    total_domains: domainNames.length,
  });
  
  return result;
}

/**
 * Generate interpretation
 */
function generateInterpretation(
  totalStudies: number,
  totalDomains: number,
  domainRiskPercentages: Record<string, {
    low_pct: number;
    some_concerns_pct: number;
    high_pct: number;
    unclear_pct: number;
  }>
): string {
  const parts: string[] = [];
  
  parts.push(`Assessed ${totalStudies} studies across ${totalDomains} domains.`);
  
  // Identify problematic domains
  const highRiskDomains: string[] = [];
  const lowRiskDomains: string[] = [];
  
  for (const [domain, stats] of Object.entries(domainRiskPercentages)) {
    if (stats.high_pct >= 50) {
      highRiskDomains.push(domain);
    }
    if (stats.low_pct >= 75) {
      lowRiskDomains.push(domain);
    }
  }
  
  if (lowRiskDomains.length > 0) {
    parts.push(`Domains with low risk in ≥75% of studies: ${lowRiskDomains.join(', ')}.`);
  }
  
  if (highRiskDomains.length > 0) {
    parts.push(`Domains with high risk in ≥50% of studies: ${highRiskDomains.join(', ')}.`);
  }
  
  if (highRiskDomains.length === 0 && lowRiskDomains.length >= totalDomains / 2) {
    parts.push('Overall quality appears good across most domains.');
  } else if (highRiskDomains.length >= totalDomains / 2) {
    parts.push('Significant methodological concerns identified across multiple domains.');
  }
  
  return parts.join(' ');
}
