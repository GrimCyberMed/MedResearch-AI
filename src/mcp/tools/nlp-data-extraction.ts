/**
 * NLP Data Extraction Tool
 * 
 * Automated extraction of study characteristics from full-text articles using NLP.
 * Extracts PICO elements, sample sizes, outcomes, and results with confidence scoring.
 * 
 * @module nlp-data-extraction
 * @version 1.0.0
 * @since 5.1.0
 */

import { logger } from '../../common/logger.js';

/**
 * PICO elements extracted from text
 */
export interface PICOElements {
  population: string[];
  intervention: string[];
  comparator: string[];
  outcome: string[];
  confidence: number;
}

/**
 * Study characteristics extracted from text
 */
export interface StudyCharacteristics {
  sample_size?: number;
  study_design?: string;
  setting?: string;
  duration?: string;
  follow_up?: string;
  confidence: number;
}

/**
 * Outcome data extracted from text
 */
export interface OutcomeData {
  outcome_name: string;
  measure_type: string;
  value: string;
  unit?: string;
  confidence_interval?: string;
  p_value?: string;
  confidence: number;
}

/**
 * Extracted data result
 */
export interface ExtractionResult {
  pico: PICOElements;
  characteristics: StudyCharacteristics;
  outcomes: OutcomeData[];
  tables_found: number;
  figures_found: number;
  overall_confidence: number;
}

/**
 * Data extraction input
 */
export interface ExtractDataNLPInput {
  text: string;
  extract_pico?: boolean;
  extract_characteristics?: boolean;
  extract_outcomes?: boolean;
  extract_tables?: boolean;
  min_confidence?: number;
}

/**
 * Data extraction output
 */
export interface ExtractDataNLPOutput {
  success: boolean;
  extraction: ExtractionResult;
  warnings: string[];
  processing_time_ms: number;
}

/**
 * Extract PICO elements from text using pattern matching
 */
function extractPICO(text: string): PICOElements {
  const pico: PICOElements = {
    population: [],
    intervention: [],
    comparator: [],
    outcome: [],
    confidence: 0
  };

  // Population patterns
  const populationPatterns = [
    /(?:patients?|participants?|subjects?|individuals?|adults?|children|adolescents?)\s+(?:with|diagnosed with|suffering from|having)\s+([^.,;]+)/gi,
    /(?:in|among)\s+([^.,;]+?)\s+(?:patients?|participants?|subjects?)/gi,
    /(\d+)\s+(?:patients?|participants?|subjects?)/gi
  ];

  // Intervention patterns
  const interventionPatterns = [
    /(?:treated with|received|administered|given)\s+([^.,;]+)/gi,
    /(?:intervention|treatment|therapy|drug|medication):\s*([^.,;]+)/gi,
    /(?:using|with)\s+([\w\s-]+?)\s+(?:mg|g|ml|units?)/gi
  ];

  // Comparator patterns
  const comparatorPatterns = [
    /(?:compared to|versus|vs\.?|compared with)\s+([^.,;]+)/gi,
    /(?:control group|placebo|standard care):\s*([^.,;]+)/gi
  ];

  // Outcome patterns
  const outcomePatterns = [
    /(?:primary outcome|secondary outcome|endpoint):\s*([^.,;]+)/gi,
    /(?:measured|assessed|evaluated)\s+([^.,;]+?)\s+(?:using|with|by)/gi,
    /(?:mortality|survival|response rate|adverse events?|complications?)/gi
  ];

  let totalMatches = 0;

  // Extract population
  for (const pattern of populationPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const value = match[1]?.trim() || match[0].trim();
      if (value && value.length > 3 && value.length < 200) {
        pico.population.push(value);
        totalMatches++;
      }
    }
  }

  // Extract intervention
  for (const pattern of interventionPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const value = match[1]?.trim() || match[0].trim();
      if (value && value.length > 3 && value.length < 200) {
        pico.intervention.push(value);
        totalMatches++;
      }
    }
  }

  // Extract comparator
  for (const pattern of comparatorPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const value = match[1]?.trim() || match[0].trim();
      if (value && value.length > 3 && value.length < 200) {
        pico.comparator.push(value);
        totalMatches++;
      }
    }
  }

  // Extract outcomes
  for (const pattern of outcomePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const value = match[1]?.trim() || match[0].trim();
      if (value && value.length > 3 && value.length < 200) {
        pico.outcome.push(value);
        totalMatches++;
      }
    }
  }

  // Remove duplicates
  pico.population = [...new Set(pico.population)];
  pico.intervention = [...new Set(pico.intervention)];
  pico.comparator = [...new Set(pico.comparator)];
  pico.outcome = [...new Set(pico.outcome)];

  // Calculate confidence based on completeness
  const completeness = [
    pico.population.length > 0,
    pico.intervention.length > 0,
    pico.comparator.length > 0,
    pico.outcome.length > 0
  ].filter(Boolean).length;

  pico.confidence = (completeness / 4) * 0.9 + (totalMatches > 0 ? 0.1 : 0);

  return pico;
}

/**
 * Extract study characteristics from text
 */
function extractCharacteristics(text: string): StudyCharacteristics {
  const characteristics: StudyCharacteristics = {
    confidence: 0
  };

  let matchCount = 0;

  // Sample size patterns
  const sampleSizePatterns = [
    /(?:n\s*=\s*|sample size of\s+|total of\s+)(\d+)/gi,
    /(\d+)\s+(?:patients?|participants?|subjects?)\s+were\s+(?:enrolled|recruited|included)/gi
  ];

  for (const pattern of sampleSizePatterns) {
    const match = text.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+/);
      if (numbers) {
        characteristics.sample_size = parseInt(numbers[0]);
        matchCount++;
        break;
      }
    }
  }

  // Study design patterns
  const designPatterns = [
    /(?:randomized controlled trial|RCT|clinical trial|cohort study|case-control study|cross-sectional study|systematic review|meta-analysis)/gi
  ];

  for (const pattern of designPatterns) {
    const match = text.match(pattern);
    if (match) {
      characteristics.study_design = match[0];
      matchCount++;
      break;
    }
  }

  // Setting patterns
  const settingPatterns = [
    /(?:conducted in|performed at|carried out in)\s+([^.,;]+)/gi,
    /(?:hospital|clinic|community|primary care|tertiary care|academic center)/gi
  ];

  for (const pattern of settingPatterns) {
    const match = text.match(pattern);
    if (match) {
      characteristics.setting = match[1]?.trim() || match[0].trim();
      matchCount++;
      break;
    }
  }

  // Duration patterns
  const durationPatterns = [
    /(?:study duration|study period|intervention period):\s*([^.,;]+)/gi,
    /(?:over|during)\s+(\d+\s+(?:weeks?|months?|years?))/gi
  ];

  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match) {
      characteristics.duration = match[1]?.trim() || match[0].trim();
      matchCount++;
      break;
    }
  }

  // Follow-up patterns
  const followUpPatterns = [
    /(?:follow-up|followed up for)\s+(\d+\s+(?:weeks?|months?|years?))/gi,
    /(?:at|after)\s+(\d+\s+(?:weeks?|months?|years?))\s+follow-up/gi
  ];

  for (const pattern of followUpPatterns) {
    const match = text.match(pattern);
    if (match) {
      characteristics.follow_up = match[1]?.trim() || match[0].trim();
      matchCount++;
      break;
    }
  }

  // Calculate confidence
  characteristics.confidence = Math.min(matchCount / 5, 1.0);

  return characteristics;
}

/**
 * Extract outcome data from text
 */
function extractOutcomes(text: string): OutcomeData[] {
  const outcomes: OutcomeData[] = [];

  // Outcome patterns with statistical data
  const outcomePatterns = [
    /([^.,;]+?)\s+(?:was|were)\s+(\d+\.?\d*)\s*(%|mm Hg|mg\/dL|units?)?(?:\s+\(95%\s*CI[:\s]+([^)]+)\))?(?:\s*,?\s*p\s*[=<>]\s*([\d.]+))?/gi,
    /(?:mean|median|average)\s+([^.,;]+?)\s+(?:was|were)\s+(\d+\.?\d*)\s*([^.,;]*)/gi
  ];

  for (const pattern of outcomePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const outcome: OutcomeData = {
        outcome_name: match[1]?.trim() || 'Unknown outcome',
        measure_type: match[0].includes('mean') ? 'mean' : match[0].includes('median') ? 'median' : 'value',
        value: match[2]?.trim() || '',
        unit: match[3]?.trim(),
        confidence_interval: match[4]?.trim(),
        p_value: match[5]?.trim(),
        confidence: 0.8
      };

      if (outcome.value && outcome.outcome_name.length > 3 && outcome.outcome_name.length < 100) {
        outcomes.push(outcome);
      }
    }
  }

  return outcomes;
}

/**
 * Count tables and figures in text
 */
function countTablesAndFigures(text: string): { tables: number; figures: number } {
  const tableMatches = text.match(/\b(?:Table|TABLE)\s+\d+/g);
  const figureMatches = text.match(/\b(?:Figure|Fig\.|FIGURE)\s+\d+/g);

  return {
    tables: tableMatches ? tableMatches.length : 0,
    figures: figureMatches ? figureMatches.length : 0
  };
}

/**
 * Extract data from text using NLP
 */
export async function extractDataNLP(
  input: ExtractDataNLPInput
): Promise<ExtractDataNLPOutput> {
  const startTime = Date.now();
  const warnings: string[] = [];

  try {
    logger.info('Starting NLP data extraction');

    // Validate input
    if (!input.text || input.text.trim().length === 0) {
      throw new Error('Text input is required');
    }

    if (input.text.length < 100) {
      warnings.push('Text is very short (<100 characters), extraction may be incomplete');
    }

    const minConfidence = input.min_confidence ?? 0.3;

    // Extract PICO elements
    let pico: PICOElements = {
      population: [],
      intervention: [],
      comparator: [],
      outcome: [],
      confidence: 0
    };

    if (input.extract_pico !== false) {
      pico = extractPICO(input.text);
      if (pico.confidence < minConfidence) {
        warnings.push(`PICO extraction confidence (${pico.confidence.toFixed(2)}) below threshold (${minConfidence})`);
      }
    }

    // Extract study characteristics
    let characteristics: StudyCharacteristics = { confidence: 0 };

    if (input.extract_characteristics !== false) {
      characteristics = extractCharacteristics(input.text);
      if (characteristics.confidence < minConfidence) {
        warnings.push(`Characteristics extraction confidence (${characteristics.confidence.toFixed(2)}) below threshold (${minConfidence})`);
      }
    }

    // Extract outcomes
    let outcomes: OutcomeData[] = [];

    if (input.extract_outcomes !== false) {
      outcomes = extractOutcomes(input.text);
      if (outcomes.length === 0) {
        warnings.push('No outcomes extracted from text');
      }
    }

    // Count tables and figures
    const { tables, figures } = input.extract_tables !== false 
      ? countTablesAndFigures(input.text)
      : { tables: 0, figures: 0 };

    // Calculate overall confidence
    const confidenceScores = [
      pico.confidence,
      characteristics.confidence,
      outcomes.length > 0 ? 0.8 : 0
    ].filter(score => score > 0);

    const overallConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
      : 0;

    const extraction: ExtractionResult = {
      pico,
      characteristics,
      outcomes,
      tables_found: tables,
      figures_found: figures,
      overall_confidence: overallConfidence
    };

    const processingTime = Date.now() - startTime;

    logger.info(`NLP extraction completed in ${processingTime}ms`);

    return {
      success: true,
      extraction,
      warnings,
      processing_time_ms: processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('NLP extraction failed', error);

    return {
      success: false,
      extraction: {
        pico: { population: [], intervention: [], comparator: [], outcome: [], confidence: 0 },
        characteristics: { confidence: 0 },
        outcomes: [],
        tables_found: 0,
        figures_found: 0,
        overall_confidence: 0
      },
      warnings: [error instanceof Error ? error.message : 'Unknown error'],
      processing_time_ms: processingTime
    };
  }
}

/**
 * MCP tool handler for extract_data_nlp
 */
export const extractDataNLPTool = {
  name: 'extract_data_nlp',
  description: 'Extract study characteristics (PICO, sample size, outcomes) from full-text articles using NLP',
  inputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Full-text article or abstract to extract data from'
      },
      extract_pico: {
        type: 'boolean',
        description: 'Extract PICO elements (default: true)',
        default: true
      },
      extract_characteristics: {
        type: 'boolean',
        description: 'Extract study characteristics (default: true)',
        default: true
      },
      extract_outcomes: {
        type: 'boolean',
        description: 'Extract outcome data (default: true)',
        default: true
      },
      extract_tables: {
        type: 'boolean',
        description: 'Count tables and figures (default: true)',
        default: true
      },
      min_confidence: {
        type: 'number',
        description: 'Minimum confidence threshold (0-1, default: 0.3)',
        default: 0.3
      }
    },
    required: ['text']
  },
  handler: extractDataNLP
};
