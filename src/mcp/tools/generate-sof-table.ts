/**
 * Summary of Findings (SoF) Table Generation
 * 
 * Generates GRADE Summary of Findings tables for systematic reviews.
 * Presents key outcomes with quality of evidence ratings.
 * 
 * Reference: GRADE Working Group (Guyatt et al., BMJ 2008)
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Quality of evidence (GRADE)
 */
export type EvidenceQuality = 'high' | 'moderate' | 'low' | 'very_low';

/**
 * Outcome data for SoF table
 */
export interface SoFOutcome {
  outcome_name: string;
  num_participants: number;
  num_studies: number;
  effect_estimate: string;
  ci_95: string;
  quality_of_evidence: EvidenceQuality;
  comments: string;
}

/**
 * SoF table configuration
 */
export interface SoFTableConfig {
  comparison: string;
  population: string;
  setting: string;
  intervention: string;
  control: string;
}

/**
 * SoF table result
 */
export interface SoFTableResult {
  table: string;
  summary: {
    total_outcomes: number;
    high_quality_count: number;
    moderate_quality_count: number;
    low_quality_count: number;
    very_low_quality_count: number;
  };
  interpretation: string;
}

/**
 * Get quality symbol
 */
function getQualitySymbol(quality: EvidenceQuality): string {
  switch (quality) {
    case 'high':
      return '⊕⊕⊕⊕';
    case 'moderate':
      return '⊕⊕⊕○';
    case 'low':
      return '⊕⊕○○';
    case 'very_low':
      return '⊕○○○';
    default:
      return '○○○○';
  }
}

/**
 * Get quality text
 */
function getQualityText(quality: EvidenceQuality): string {
  switch (quality) {
    case 'high':
      return 'HIGH';
    case 'moderate':
      return 'MODERATE';
    case 'low':
      return 'LOW';
    case 'very_low':
      return 'VERY LOW';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Create table header
 */
function createTableHeader(config: SoFTableConfig): string[] {
  const lines: string[] = [];
  
  lines.push('');
  lines.push('═'.repeat(120));
  lines.push('                           SUMMARY OF FINDINGS TABLE');
  lines.push('═'.repeat(120));
  lines.push('');
  lines.push(`Population: ${config.population}`);
  lines.push(`Setting: ${config.setting}`);
  lines.push(`Intervention: ${config.intervention}`);
  lines.push(`Comparison: ${config.control}`);
  lines.push('');
  lines.push('─'.repeat(120));
  
  // Column headers
  const header = 
    'Outcome'.padEnd(25) + ' │ ' +
    'Participants'.padEnd(15) + ' │ ' +
    'Effect Estimate'.padEnd(20) + ' │ ' +
    'Quality'.padEnd(15) + ' │ ' +
    'Comments'.padEnd(30);
  
  lines.push(header);
  lines.push('─'.repeat(120));
  
  return lines;
}

/**
 * Create outcome row
 */
function createOutcomeRow(outcome: SoFOutcome): string {
  const outcomeName = outcome.outcome_name.length > 23
    ? outcome.outcome_name.substring(0, 20) + '...'
    : outcome.outcome_name;
  
  const participants = `${outcome.num_participants} (${outcome.num_studies} RCTs)`;
  const participantsText = participants.length > 13
    ? participants.substring(0, 10) + '...'
    : participants;
  
  const effectText = `${outcome.effect_estimate} ${outcome.ci_95}`;
  const effectDisplay = effectText.length > 18
    ? effectText
    : effectText;
  
  const qualitySymbol = getQualitySymbol(outcome.quality_of_evidence);
  const qualityText = getQualityText(outcome.quality_of_evidence);
  const quality = `${qualitySymbol} ${qualityText}`;
  
  const comments = outcome.comments.length > 28
    ? outcome.comments.substring(0, 25) + '...'
    : outcome.comments;
  
  const row = 
    outcomeName.padEnd(25) + ' │ ' +
    participantsText.padEnd(15) + ' │ ' +
    effectDisplay.padEnd(20) + ' │ ' +
    quality.padEnd(15) + ' │ ' +
    comments.padEnd(30);
  
  return row;
}

/**
 * Create footer
 */
function createFooter(): string[] {
  const lines: string[] = [];
  
  lines.push('─'.repeat(120));
  lines.push('');
  lines.push('GRADE Working Group grades of evidence:');
  lines.push('⊕⊕⊕⊕ HIGH: We are very confident that the true effect lies close to that of the estimate');
  lines.push('⊕⊕⊕○ MODERATE: We are moderately confident in the effect estimate');
  lines.push('⊕⊕○○ LOW: Our confidence in the effect estimate is limited');
  lines.push('⊕○○○ VERY LOW: We have very little confidence in the effect estimate');
  lines.push('');
  lines.push('═'.repeat(120));
  
  return lines;
}

/**
 * Generate Summary of Findings table
 */
export function generateSoFTable(
  outcomes: SoFOutcome[],
  config: SoFTableConfig
): SoFTableResult {
  logger.info('Generating Summary of Findings table', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    outcome_count: outcomes.length,
  });
  
  if (outcomes.length === 0) {
    return {
      table: 'No outcomes to display',
      summary: {
        total_outcomes: 0,
        high_quality_count: 0,
        moderate_quality_count: 0,
        low_quality_count: 0,
        very_low_quality_count: 0,
      },
      interpretation: 'No outcomes available for Summary of Findings table.',
    };
  }
  
  // Build table
  const tableLines: string[] = [];
  
  // Header
  tableLines.push(...createTableHeader(config));
  
  // Outcome rows
  for (const outcome of outcomes) {
    tableLines.push(createOutcomeRow(outcome));
  }
  
  // Footer
  tableLines.push(...createFooter());
  
  // Calculate summary
  let highQualityCount = 0;
  let moderateQualityCount = 0;
  let lowQualityCount = 0;
  let veryLowQualityCount = 0;
  
  for (const outcome of outcomes) {
    if (outcome.quality_of_evidence === 'high') highQualityCount++;
    else if (outcome.quality_of_evidence === 'moderate') moderateQualityCount++;
    else if (outcome.quality_of_evidence === 'low') lowQualityCount++;
    else if (outcome.quality_of_evidence === 'very_low') veryLowQualityCount++;
  }
  
  // Generate interpretation
  const interpretation = generateInterpretation(
    outcomes.length,
    highQualityCount,
    moderateQualityCount,
    lowQualityCount,
    veryLowQualityCount
  );
  
  const result: SoFTableResult = {
    table: tableLines.join('\n'),
    summary: {
      total_outcomes: outcomes.length,
      high_quality_count: highQualityCount,
      moderate_quality_count: moderateQualityCount,
      low_quality_count: lowQualityCount,
      very_low_quality_count: veryLowQualityCount,
    },
    interpretation,
  };
  
  logger.info('Summary of Findings table generated', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    total_outcomes: outcomes.length,
    high_quality: highQualityCount,
  });
  
  return result;
}

/**
 * Generate interpretation
 */
function generateInterpretation(
  totalOutcomes: number,
  highQualityCount: number,
  moderateQualityCount: number,
  lowQualityCount: number,
  veryLowQualityCount: number
): string {
  const parts: string[] = [];
  
  parts.push(`Summary of Findings table includes ${totalOutcomes} outcome(s).`);
  
  // Quality distribution
  const highPct = ((highQualityCount / totalOutcomes) * 100).toFixed(0);
  const moderatePct = ((moderateQualityCount / totalOutcomes) * 100).toFixed(0);
  const lowPct = ((lowQualityCount / totalOutcomes) * 100).toFixed(0);
  const veryLowPct = ((veryLowQualityCount / totalOutcomes) * 100).toFixed(0);
  
  parts.push(`Quality of evidence: ${highQualityCount} (${highPct}%) high, ${moderateQualityCount} (${moderatePct}%) moderate, ${lowQualityCount} (${lowPct}%) low, ${veryLowQualityCount} (${veryLowPct}%) very low.`);
  
  // Overall assessment
  if (highQualityCount >= totalOutcomes / 2) {
    parts.push('Overall confidence in the evidence is high.');
  } else if (highQualityCount + moderateQualityCount >= totalOutcomes / 2) {
    parts.push('Overall confidence in the evidence is moderate.');
  } else {
    parts.push('Overall confidence in the evidence is limited.');
  }
  
  return parts.join(' ');
}
