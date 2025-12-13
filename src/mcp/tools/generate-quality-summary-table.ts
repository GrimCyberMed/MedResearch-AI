/**
 * Quality Assessment Summary Table Generation
 * 
 * Generates summary tables for risk of bias and quality assessments.
 * Creates ASCII tables with color-coded risk levels.
 * 
 * Supports:
 * - Cochrane RoB 2.0 (RCTs)
 * - Newcastle-Ottawa Scale (Observational)
 * - QUADAS-2 (Diagnostic accuracy)
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
 * Study quality assessment
 */
export interface StudyQualityAssessment {
  study_id: string;
  study_name: string;
  domains: DomainAssessment[];
  overall_judgment: RiskLevel;
}

/**
 * Quality summary table result
 */
export interface QualitySummaryTableResult {
  table: string;
  summary: {
    total_studies: number;
    low_risk_count: number;
    some_concerns_count: number;
    high_risk_count: number;
    unclear_count: number;
    domain_summaries: Record<string, {
      low: number;
      some_concerns: number;
      high: number;
      unclear: number;
    }>;
  };
  interpretation: string;
}

/**
 * Get symbol for risk level
 */
function getRiskSymbol(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return '✓'; // Green checkmark
    case 'some_concerns':
      return '?'; // Yellow question mark
    case 'high':
      return '✗'; // Red X
    case 'unclear':
      return '−'; // Gray dash
    default:
      return '?';
  }
}

/**
 * Get text representation for risk level
 */
function getRiskText(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return 'Low';
    case 'some_concerns':
      return 'Some concerns';
    case 'high':
      return 'High';
    case 'unclear':
      return 'Unclear';
    default:
      return 'Unknown';
  }
}

/**
 * Create table header
 */
function createTableHeader(domains: string[], maxStudyNameLength: number): string[] {
  const lines: string[] = [];
  
  // Top border
  const colWidth = 12;
  const studyColWidth = Math.max(maxStudyNameLength + 2, 20);
  const totalWidth = studyColWidth + (domains.length * colWidth) + colWidth + 3 + domains.length;
  
  lines.push('┌' + '─'.repeat(totalWidth - 2) + '┐');
  
  // Title
  const title = 'Risk of Bias Summary';
  const titlePadding = totalWidth - 4 - title.length;
  const titleLeftPad = Math.floor(titlePadding / 2);
  const titleRightPad = titlePadding - titleLeftPad;
  lines.push('│ ' + ' '.repeat(titleLeftPad) + title + ' '.repeat(titleRightPad) + ' │');
  
  lines.push('├' + '─'.repeat(totalWidth - 2) + '┤');
  
  // Column headers
  let headerLine = '│ ' + 'Study'.padEnd(studyColWidth - 2) + ' │';
  for (const domain of domains) {
    const shortDomain = domain.length > colWidth - 2 
      ? domain.substring(0, colWidth - 5) + '...' 
      : domain;
    headerLine += ' ' + shortDomain.padEnd(colWidth - 2) + ' │';
  }
  headerLine += ' ' + 'Overall'.padEnd(colWidth - 2) + ' │';
  
  lines.push(headerLine);
  lines.push('├' + '─'.repeat(totalWidth - 2) + '┤');
  
  return lines;
}

/**
 * Create table row for a study
 */
function createTableRow(
  study: StudyQualityAssessment,
  domainNames: string[],
  maxStudyNameLength: number
): string {
  const colWidth = 12;
  const studyColWidth = Math.max(maxStudyNameLength + 2, 20);
  
  // Study name
  const studyName = study.study_name.length > studyColWidth - 4
    ? study.study_name.substring(0, studyColWidth - 7) + '...'
    : study.study_name;
  
  let row = '│ ' + studyName.padEnd(studyColWidth - 2) + ' │';
  
  // Domain judgments
  for (const domainName of domainNames) {
    const domain = study.domains.find(d => d.domain === domainName);
    const judgment = domain ? domain.judgment : 'unclear';
    const symbol = getRiskSymbol(judgment);
    const text = getRiskText(judgment);
    const cellContent = `${symbol} ${text}`;
    row += ' ' + cellContent.padEnd(colWidth - 2) + ' │';
  }
  
  // Overall judgment
  const overallSymbol = getRiskSymbol(study.overall_judgment);
  const overallText = getRiskText(study.overall_judgment);
  const overallContent = `${overallSymbol} ${overallText}`;
  row += ' ' + overallContent.padEnd(colWidth - 2) + ' │';
  
  return row;
}

/**
 * Create summary row
 */
function createSummaryRow(
  domainSummaries: Record<string, { low: number; some_concerns: number; high: number; unclear: number }>,
  domainNames: string[],
  totalStudies: number,
  maxStudyNameLength: number
): string[] {
  const lines: string[] = [];
  const colWidth = 12;
  const studyColWidth = Math.max(maxStudyNameLength + 2, 20);
  const totalWidth = studyColWidth + (domainNames.length * colWidth) + colWidth + 3 + domainNames.length;
  
  lines.push('├' + '─'.repeat(totalWidth - 2) + '┤');
  
  // Low risk row
  let lowRow = '│ ' + '✓ Low risk'.padEnd(studyColWidth - 2) + ' │';
  for (const domainName of domainNames) {
    const count = domainSummaries[domainName]?.low || 0;
    const percentage = totalStudies > 0 ? ((count / totalStudies) * 100).toFixed(0) : '0';
    const cellContent = `${count} (${percentage}%)`;
    lowRow += ' ' + cellContent.padEnd(colWidth - 2) + ' │';
  }
  lowRow += ' '.repeat(colWidth + 2) + '│';
  lines.push(lowRow);
  
  // Some concerns row
  let concernsRow = '│ ' + '? Some concerns'.padEnd(studyColWidth - 2) + ' │';
  for (const domainName of domainNames) {
    const count = domainSummaries[domainName]?.some_concerns || 0;
    const percentage = totalStudies > 0 ? ((count / totalStudies) * 100).toFixed(0) : '0';
    const cellContent = `${count} (${percentage}%)`;
    concernsRow += ' ' + cellContent.padEnd(colWidth - 2) + ' │';
  }
  concernsRow += ' '.repeat(colWidth + 2) + '│';
  lines.push(concernsRow);
  
  // High risk row
  let highRow = '│ ' + '✗ High risk'.padEnd(studyColWidth - 2) + ' │';
  for (const domainName of domainNames) {
    const count = domainSummaries[domainName]?.high || 0;
    const percentage = totalStudies > 0 ? ((count / totalStudies) * 100).toFixed(0) : '0';
    const cellContent = `${count} (${percentage}%)`;
    highRow += ' ' + cellContent.padEnd(colWidth - 2) + ' │';
  }
  highRow += ' '.repeat(colWidth + 2) + '│';
  lines.push(highRow);
  
  return lines;
}

/**
 * Generate quality assessment summary table
 */
export function generateQualitySummaryTable(
  studies: StudyQualityAssessment[]
): QualitySummaryTableResult {
  logger.info('Generating quality assessment summary table', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    study_count: studies.length,
  });
  
  if (studies.length === 0) {
    return {
      table: 'No studies to display',
      summary: {
        total_studies: 0,
        low_risk_count: 0,
        some_concerns_count: 0,
        high_risk_count: 0,
        unclear_count: 0,
        domain_summaries: {},
      },
      interpretation: 'No studies available for quality assessment.',
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
  
  // Calculate max study name length
  const maxStudyNameLength = Math.max(...studies.map(s => s.study_name.length));
  
  // Build table
  const tableLines: string[] = [];
  
  // Header
  tableLines.push(...createTableHeader(domainNames, maxStudyNameLength));
  
  // Study rows
  for (const study of studies) {
    tableLines.push(createTableRow(study, domainNames, maxStudyNameLength));
  }
  
  // Calculate domain summaries
  const domainSummaries: Record<string, { low: number; some_concerns: number; high: number; unclear: number }> = {};
  
  for (const domainName of domainNames) {
    domainSummaries[domainName] = {
      low: 0,
      some_concerns: 0,
      high: 0,
      unclear: 0,
    };
    
    for (const study of studies) {
      const domain = study.domains.find(d => d.domain === domainName);
      const judgment = domain ? domain.judgment : 'unclear';
      
      if (judgment === 'low') domainSummaries[domainName].low++;
      else if (judgment === 'some_concerns') domainSummaries[domainName].some_concerns++;
      else if (judgment === 'high') domainSummaries[domainName].high++;
      else domainSummaries[domainName].unclear++;
    }
  }
  
  // Summary rows
  tableLines.push(...createSummaryRow(domainSummaries, domainNames, studies.length, maxStudyNameLength));
  
  // Bottom border
  const colWidth = 12;
  const studyColWidth = Math.max(maxStudyNameLength + 2, 20);
  const totalWidth = studyColWidth + (domainNames.length * colWidth) + colWidth + 3 + domainNames.length;
  tableLines.push('└' + '─'.repeat(totalWidth - 2) + '┘');
  
  // Calculate overall summary
  let lowRiskCount = 0;
  let someConcernsCount = 0;
  let highRiskCount = 0;
  let unclearCount = 0;
  
  for (const study of studies) {
    if (study.overall_judgment === 'low') lowRiskCount++;
    else if (study.overall_judgment === 'some_concerns') someConcernsCount++;
    else if (study.overall_judgment === 'high') highRiskCount++;
    else unclearCount++;
  }
  
  // Generate interpretation
  const interpretation = generateInterpretation(
    studies.length,
    lowRiskCount,
    someConcernsCount,
    highRiskCount,
    unclearCount,
    domainSummaries
  );
  
  const result: QualitySummaryTableResult = {
    table: tableLines.join('\n'),
    summary: {
      total_studies: studies.length,
      low_risk_count: lowRiskCount,
      some_concerns_count: someConcernsCount,
      high_risk_count: highRiskCount,
      unclear_count: unclearCount,
      domain_summaries: domainSummaries,
    },
    interpretation,
  };
  
  logger.info('Quality assessment summary table generated', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    total_studies: studies.length,
    low_risk: lowRiskCount,
    high_risk: highRiskCount,
  });
  
  return result;
}

/**
 * Generate interpretation
 */
function generateInterpretation(
  totalStudies: number,
  lowRiskCount: number,
  someConcernsCount: number,
  highRiskCount: number,
  _unclearCount: number,
  domainSummaries: Record<string, { low: number; some_concerns: number; high: number; unclear: number }>
): string {
  const parts: string[] = [];
  
  parts.push(`Assessed ${totalStudies} studies.`);
  
  // Overall risk distribution
  const lowPct = ((lowRiskCount / totalStudies) * 100).toFixed(0);
  const concernsPct = ((someConcernsCount / totalStudies) * 100).toFixed(0);
  const highPct = ((highRiskCount / totalStudies) * 100).toFixed(0);
  
  parts.push(`Overall: ${lowRiskCount} (${lowPct}%) low risk, ${someConcernsCount} (${concernsPct}%) some concerns, ${highRiskCount} (${highPct}%) high risk.`);
  
  // Identify problematic domains
  const problematicDomains: string[] = [];
  for (const [domain, summary] of Object.entries(domainSummaries)) {
    const highRiskPct = (summary.high / totalStudies) * 100;
    if (highRiskPct >= 50) {
      problematicDomains.push(domain);
    }
  }
  
  if (problematicDomains.length > 0) {
    parts.push(`Domains with high risk in ≥50% of studies: ${problematicDomains.join(', ')}.`);
  }
  
  return parts.join(' ');
}
