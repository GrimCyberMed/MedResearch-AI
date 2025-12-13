/**
 * PRISMA Flowchart Generation
 * 
 * Generates PRISMA 2020 compliant flowcharts for systematic reviews.
 * Creates ASCII art representation of the study selection process.
 * 
 * Reference: PRISMA 2020 Statement (Page et al., BMJ 2021)
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * PRISMA identification data
 */
export interface PRISMAIdentification {
  database_records: number;
  register_records: number;
  other_sources: number;
  duplicates_removed: number;
}

/**
 * PRISMA screening data
 */
export interface PRISMAScreening {
  records_screened: number;
  records_excluded: number;
  exclusion_reasons: Record<string, number>;
}

/**
 * PRISMA eligibility data
 */
export interface PRISMAEligibility {
  full_text_assessed: number;
  full_text_excluded: number;
  exclusion_reasons: Record<string, number>;
}

/**
 * PRISMA included data
 */
export interface PRISMAIncluded {
  studies_included: number;
  studies_in_synthesis: number;
}

/**
 * Complete PRISMA flowchart data
 */
export interface PRISMAData {
  identification: PRISMAIdentification;
  screening: PRISMAScreening;
  eligibility: PRISMAEligibility;
  included: PRISMAIncluded;
}

/**
 * PRISMA flowchart result
 */
export interface PRISMAFlowchartResult {
  flowchart: string;
  summary: {
    total_identified: number;
    total_screened: number;
    total_assessed: number;
    total_included: number;
    total_in_synthesis: number;
    exclusion_rate_screening: number;
    exclusion_rate_eligibility: number;
  };
  validation: {
    is_valid: boolean;
    warnings: string[];
    errors: string[];
  };
  interpretation: string;
}

/**
 * Create a box for the flowchart
 */
function createBox(text: string, width: number = 60): string {
  const boxLines: string[] = [];
  
  // Top border
  boxLines.push('┌' + '─'.repeat(width - 2) + '┐');
  
  // Split by newlines first, then wrap each line
  const textLines = text.split('\n');
  
  for (const textLine of textLines) {
    const trimmedLine = textLine.trim();
    if (!trimmedLine) {
      // Empty line
      boxLines.push('│' + ' '.repeat(width - 2) + '│');
      continue;
    }
    
    // Split line into words and wrap
    const words = trimmedLine.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= width - 4) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          const padding = width - 4 - currentLine.length;
          const leftPad = Math.floor(padding / 2);
          const rightPad = padding - leftPad;
          boxLines.push('│ ' + ' '.repeat(leftPad) + currentLine + ' '.repeat(rightPad) + ' │');
        }
        currentLine = word;
      }
    }
    
    // Add last line
    if (currentLine) {
      const padding = width - 4 - currentLine.length;
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      boxLines.push('│ ' + ' '.repeat(leftPad) + currentLine + ' '.repeat(rightPad) + ' │');
    }
  }
  
  // Bottom border
  boxLines.push('└' + '─'.repeat(width - 2) + '┘');
  
  return boxLines.join('\n');
}

/**
 * Create an arrow
 */
function createArrow(height: number = 1): string {
  const lines: string[] = [];
  const center = 30; // Center position
  
  for (let i = 0; i < height; i++) {
    lines.push(' '.repeat(center) + '│');
  }
  lines.push(' '.repeat(center) + '▼');
  
  return lines.join('\n');
}

/**
 * Validate PRISMA data
 */
function validatePRISMAData(data: PRISMAData): { is_valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Calculate totals
  const totalIdentified = data.identification.database_records + 
                          data.identification.register_records + 
                          data.identification.other_sources;
  
  const afterDuplicates = totalIdentified - data.identification.duplicates_removed;
  
  // Validation checks
  if (totalIdentified === 0) {
    errors.push('No records identified');
  }
  
  if (data.screening.records_screened > afterDuplicates) {
    warnings.push('Records screened exceeds records after duplicate removal');
  }
  
  if (data.screening.records_screened < afterDuplicates) {
    warnings.push('Not all records after duplicate removal were screened');
  }
  
  const expectedAssessed = data.screening.records_screened - data.screening.records_excluded;
  if (data.eligibility.full_text_assessed > expectedAssessed) {
    warnings.push('Full-text assessed exceeds records passing screening');
  }
  
  const expectedIncluded = data.eligibility.full_text_assessed - data.eligibility.full_text_excluded;
  if (data.included.studies_included > expectedIncluded) {
    warnings.push('Studies included exceeds studies passing eligibility');
  }
  
  if (data.included.studies_in_synthesis > data.included.studies_included) {
    errors.push('Studies in synthesis cannot exceed studies included');
  }
  
  // Check exclusion reasons
  const screeningExclusionTotal = Object.values(data.screening.exclusion_reasons).reduce((a, b) => a + b, 0);
  if (screeningExclusionTotal !== data.screening.records_excluded) {
    warnings.push(`Screening exclusion reasons (${screeningExclusionTotal}) do not sum to total excluded (${data.screening.records_excluded})`);
  }
  
  const eligibilityExclusionTotal = Object.values(data.eligibility.exclusion_reasons).reduce((a, b) => a + b, 0);
  if (eligibilityExclusionTotal !== data.eligibility.full_text_excluded) {
    warnings.push(`Eligibility exclusion reasons (${eligibilityExclusionTotal}) do not sum to total excluded (${data.eligibility.full_text_excluded})`);
  }
  
  return {
    is_valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Generate PRISMA 2020 flowchart
 */
export function generatePRISMAFlowchart(data: PRISMAData): PRISMAFlowchartResult {
  logger.info('Generating PRISMA flowchart', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
  });
  
  // Validate data
  const validation = validatePRISMAData(data);
  
  // Calculate summary statistics
  const totalIdentified = data.identification.database_records + 
                          data.identification.register_records + 
                          data.identification.other_sources;
  
  const totalScreened = data.screening.records_screened;
  const totalAssessed = data.eligibility.full_text_assessed;
  const totalIncluded = data.included.studies_included;
  const totalInSynthesis = data.included.studies_in_synthesis;
  
  const exclusionRateScreening = totalScreened > 0 
    ? (data.screening.records_excluded / totalScreened) * 100 
    : 0;
  
  const exclusionRateEligibility = totalAssessed > 0 
    ? (data.eligibility.full_text_excluded / totalAssessed) * 100 
    : 0;
  
  // Build flowchart
  const flowchart: string[] = [];
  
  // Title
  flowchart.push('');
  flowchart.push('═'.repeat(70));
  flowchart.push('                    PRISMA 2020 FLOW DIAGRAM');
  flowchart.push('═'.repeat(70));
  flowchart.push('');
  
  // IDENTIFICATION
  flowchart.push('IDENTIFICATION');
  flowchart.push('─'.repeat(70));
  flowchart.push('');
  
  // Records identified
  flowchart.push(createBox(
    `Records identified from:\n` +
    `Databases (n = ${data.identification.database_records})\n` +
    `Registers (n = ${data.identification.register_records})\n` +
    `Other sources (n = ${data.identification.other_sources})`
  ));
  
  flowchart.push(createArrow(1));
  
  // Duplicates removed
  flowchart.push(createBox(
    `Records removed before screening:\n` +
    `Duplicate records (n = ${data.identification.duplicates_removed})`
  ));
  
  flowchart.push(createArrow(1));
  
  // SCREENING
  flowchart.push('');
  flowchart.push('SCREENING');
  flowchart.push('─'.repeat(70));
  flowchart.push('');
  
  flowchart.push(createBox(
    `Records screened (n = ${data.screening.records_screened})`
  ));
  
  flowchart.push(createArrow(1));
  
  // Screening exclusions
  const screeningReasons = Object.entries(data.screening.exclusion_reasons)
    .map(([reason, count]) => `  • ${reason} (n = ${count})`)
    .join('\n');
  
  flowchart.push(createBox(
    `Records excluded (n = ${data.screening.records_excluded})\n` +
    (screeningReasons ? `\nReasons:\n${screeningReasons}` : '')
  ));
  
  flowchart.push(createArrow(1));
  
  // ELIGIBILITY
  flowchart.push('');
  flowchart.push('ELIGIBILITY');
  flowchart.push('─'.repeat(70));
  flowchart.push('');
  
  flowchart.push(createBox(
    `Reports sought for retrieval (n = ${totalScreened - data.screening.records_excluded})`
  ));
  
  flowchart.push(createArrow(1));
  
  flowchart.push(createBox(
    `Reports assessed for eligibility (n = ${data.eligibility.full_text_assessed})`
  ));
  
  flowchart.push(createArrow(1));
  
  // Eligibility exclusions
  const eligibilityReasons = Object.entries(data.eligibility.exclusion_reasons)
    .map(([reason, count]) => `  • ${reason} (n = ${count})`)
    .join('\n');
  
  flowchart.push(createBox(
    `Reports excluded (n = ${data.eligibility.full_text_excluded})\n` +
    (eligibilityReasons ? `\nReasons:\n${eligibilityReasons}` : '')
  ));
  
  flowchart.push(createArrow(1));
  
  // INCLUDED
  flowchart.push('');
  flowchart.push('INCLUDED');
  flowchart.push('─'.repeat(70));
  flowchart.push('');
  
  flowchart.push(createBox(
    `Studies included in review (n = ${data.included.studies_included})`
  ));
  
  flowchart.push(createArrow(1));
  
  flowchart.push(createBox(
    `Studies included in synthesis (n = ${data.included.studies_in_synthesis})`
  ));
  
  flowchart.push('');
  flowchart.push('═'.repeat(70));
  
  // Generate interpretation
  const interpretation = generateInterpretation(
    totalIdentified,
    totalScreened,
    totalAssessed,
    totalIncluded,
    totalInSynthesis,
    exclusionRateScreening,
    exclusionRateEligibility
  );
  
  const result: PRISMAFlowchartResult = {
    flowchart: flowchart.join('\n'),
    summary: {
      total_identified: totalIdentified,
      total_screened: totalScreened,
      total_assessed: totalAssessed,
      total_included: totalIncluded,
      total_in_synthesis: totalInSynthesis,
      exclusion_rate_screening: exclusionRateScreening,
      exclusion_rate_eligibility: exclusionRateEligibility,
    },
    validation,
    interpretation,
  };
  
  logger.info('PRISMA flowchart generated', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    total_identified: totalIdentified,
    total_included: totalIncluded,
    is_valid: validation.is_valid,
  });
  
  return result;
}

/**
 * Generate interpretation
 */
function generateInterpretation(
  totalIdentified: number,
  totalScreened: number,
  totalAssessed: number,
  totalIncluded: number,
  totalInSynthesis: number,
  exclusionRateScreening: number,
  exclusionRateEligibility: number
): string {
  const parts: string[] = [];
  
  parts.push(`Identified ${totalIdentified} records from all sources.`);
  parts.push(`Screened ${totalScreened} records (${exclusionRateScreening.toFixed(1)}% excluded at screening).`);
  parts.push(`Assessed ${totalAssessed} full-text reports (${exclusionRateEligibility.toFixed(1)}% excluded at eligibility).`);
  parts.push(`Included ${totalIncluded} studies in the review, with ${totalInSynthesis} in quantitative synthesis.`);
  
  // Overall exclusion rate
  const overallExclusionRate = totalIdentified > 0 
    ? ((totalIdentified - totalIncluded) / totalIdentified) * 100 
    : 0;
  
  parts.push(`Overall exclusion rate: ${overallExclusionRate.toFixed(1)}%.`);
  
  return parts.join(' ');
}
