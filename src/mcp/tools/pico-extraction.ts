/**
 * PICO Extraction Tool
 * 
 * Automated extraction of PICO elements (Population, Intervention, Comparator, Outcome)
 * from research questions and study abstracts.
 * 
 * @module pico-extraction
 * @version 1.0.0
 * @since 5.1.0
 */

import { logger } from '../../common/logger.js';

/**
 * Extracted PICO elements
 */
export interface PICOElements {
  population: string[];
  intervention: string[];
  comparator: string[];
  outcome: string[];
}

/**
 * PICO extraction input
 */
export interface ExtractPICOInput {
  text: string;
  generate_search_terms?: boolean;
  validate_completeness?: boolean;
}

/**
 * PICO extraction output
 */
export interface ExtractPICOOutput {
  success: boolean;
  pico: PICOElements;
  search_terms?: string[];
  completeness: {
    population: boolean;
    intervention: boolean;
    comparator: boolean;
    outcome: boolean;
    score: number;
  };
  warnings: string[];
  processing_time_ms: number;
}

/**
 * Extract population from text
 */
function extractPopulation(text: string): string[] {
  const population: string[] = [];

  const patterns = [
    // Direct patterns
    /(?:in|among)\s+([^.,;]+?)\s+(?:patients?|participants?|subjects?|individuals?)/gi,
    /(?:patients?|participants?|subjects?|individuals?)\s+(?:with|having|diagnosed with|suffering from)\s+([^.,;]+)/gi,
    /(?:adults?|children|adolescents?|elderly|seniors?)\s+(?:with|having)\s+([^.,;]+)/gi,
    
    // Age groups
    /(?:aged?|age)\s+(\d+[-–]\d+\s+years?)/gi,
    /(?:aged?|age)\s+(>\s*\d+|<\s*\d+|\d+\+)\s+years?/gi,
    
    // Specific populations
    /(?:pregnant women|postmenopausal women|men|women|males?|females?)/gi,
    
    // Disease/condition
    /(?:diagnosed with|history of|presenting with)\s+([^.,;]+)/gi
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const value = (match[1] || match[0]).trim();
      if (value && value.length > 2 && value.length < 150) {
        population.push(value);
      }
    }
  }

  return [...new Set(population)];
}

/**
 * Extract intervention from text
 */
function extractIntervention(text: string): string[] {
  const intervention: string[] = [];

  const patterns = [
    // Treatment patterns
    /(?:treated with|treatment with|therapy with|receiving)\s+([^.,;]+)/gi,
    /(?:administered|given|prescribed)\s+([^.,;]+)/gi,
    /(?:intervention|treatment|therapy|drug|medication):\s*([^.,;]+)/gi,
    
    // Specific interventions
    /(?:surgery|surgical|operation|procedure):\s*([^.,;]+)/gi,
    /(?:chemotherapy|radiotherapy|immunotherapy)/gi,
    
    // Dosage patterns
    /([A-Z][a-z]+(?:\s+[a-z]+)?)\s+\d+\s*(?:mg|g|ml|mcg|units?)/gi,
    
    // General intervention
    /(?:use of|using|with)\s+([^.,;]+?)\s+(?:therapy|treatment|intervention)/gi
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const value = (match[1] || match[0]).trim();
      if (value && value.length > 2 && value.length < 150) {
        intervention.push(value);
      }
    }
  }

  return [...new Set(intervention)];
}

/**
 * Extract comparator from text
 */
function extractComparator(text: string): string[] {
  const comparator: string[] = [];

  const patterns = [
    // Comparison patterns
    /(?:compared to|compared with|versus|vs\.?)\s+([^.,;]+)/gi,
    /(?:relative to|in comparison to|against)\s+([^.,;]+)/gi,
    
    // Control patterns
    /(?:control group|placebo|standard care|usual care|no treatment)/gi,
    /(?:control|placebo):\s*([^.,;]+)/gi,
    
    // Alternative treatment
    /(?:alternative treatment|other treatment):\s*([^.,;]+)/gi
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const value = (match[1] || match[0]).trim();
      if (value && value.length > 2 && value.length < 150) {
        comparator.push(value);
      }
    }
  }

  return [...new Set(comparator)];
}

/**
 * Extract outcome from text
 */
function extractOutcome(text: string): string[] {
  const outcome: string[] = [];

  const patterns = [
    // Outcome patterns
    /(?:primary outcome|secondary outcome|endpoint|outcome):\s*([^.,;]+)/gi,
    /(?:effect on|impact on|influence on)\s+([^.,;]+)/gi,
    /(?:to reduce|to improve|to increase|to decrease)\s+([^.,;]+)/gi,
    
    // Specific outcomes
    /(?:mortality|survival|morbidity|quality of life|QoL)/gi,
    /(?:adverse events?|side effects?|complications?|toxicity)/gi,
    /(?:response rate|remission|recurrence|relapse)/gi,
    
    // Measured outcomes
    /(?:measured|assessed|evaluated)\s+([^.,;]+?)\s+(?:using|with|by)/gi,
    
    // Change in
    /(?:change in|reduction in|improvement in)\s+([^.,;]+)/gi
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const value = (match[1] || match[0]).trim();
      if (value && value.length > 2 && value.length < 150) {
        outcome.push(value);
      }
    }
  }

  return [...new Set(outcome)];
}

/**
 * Generate search terms from PICO elements
 */
function generateSearchTerms(pico: PICOElements): string[] {
  const searchTerms: string[] = [];

  // Add population terms
  for (const pop of pico.population) {
    searchTerms.push(pop);
    // Add MeSH-like variations
    const words = pop.split(/\s+/);
    if (words.length > 1) {
      searchTerms.push(...words.filter(w => w.length > 3));
    }
  }

  // Add intervention terms
  for (const int of pico.intervention) {
    searchTerms.push(int);
    const words = int.split(/\s+/);
    if (words.length > 1) {
      searchTerms.push(...words.filter(w => w.length > 3));
    }
  }

  // Add comparator terms
  for (const comp of pico.comparator) {
    searchTerms.push(comp);
  }

  // Add outcome terms
  for (const out of pico.outcome) {
    searchTerms.push(out);
    const words = out.split(/\s+/);
    if (words.length > 1) {
      searchTerms.push(...words.filter(w => w.length > 3));
    }
  }

  // Remove duplicates and common words
  const commonWords = new Set(['the', 'and', 'or', 'with', 'for', 'from', 'to', 'in', 'on', 'at', 'by']);
  const uniqueTerms = [...new Set(searchTerms)]
    .filter(term => !commonWords.has(term.toLowerCase()))
    .filter(term => term.length > 2);

  return uniqueTerms;
}

/**
 * Validate PICO completeness
 */
function validateCompleteness(pico: PICOElements): {
  population: boolean;
  intervention: boolean;
  comparator: boolean;
  outcome: boolean;
  score: number;
} {
  const hasPopulation = pico.population.length > 0;
  const hasIntervention = pico.intervention.length > 0;
  const hasComparator = pico.comparator.length > 0;
  const hasOutcome = pico.outcome.length > 0;

  const score = [hasPopulation, hasIntervention, hasComparator, hasOutcome]
    .filter(Boolean).length / 4;

  return {
    population: hasPopulation,
    intervention: hasIntervention,
    comparator: hasComparator,
    outcome: hasOutcome,
    score
  };
}

/**
 * Generate warnings
 */
function generateWarnings(completeness: ReturnType<typeof validateCompleteness>): string[] {
  const warnings: string[] = [];

  if (!completeness.population) {
    warnings.push('Population not clearly identified');
  }

  if (!completeness.intervention) {
    warnings.push('Intervention not clearly specified');
  }

  if (!completeness.comparator) {
    warnings.push('Comparator not identified - consider adding for stronger research design');
  }

  if (!completeness.outcome) {
    warnings.push('Outcome not clearly defined');
  }

  if (completeness.score < 0.5) {
    warnings.push('PICO elements are incomplete - consider refining the research question');
  }

  return warnings;
}

/**
 * Extract PICO elements
 */
export async function extractPICO(
  input: ExtractPICOInput
): Promise<ExtractPICOOutput> {
  const startTime = Date.now();

  try {
    logger.info('Extracting PICO elements');

    // Validate input
    if (!input.text || input.text.trim().length === 0) {
      throw new Error('Text input is required');
    }

    // Extract PICO elements
    const pico: PICOElements = {
      population: extractPopulation(input.text),
      intervention: extractIntervention(input.text),
      comparator: extractComparator(input.text),
      outcome: extractOutcome(input.text)
    };

    // Validate completeness
    const completeness = input.validate_completeness !== false
      ? validateCompleteness(pico)
      : {
          population: pico.population.length > 0,
          intervention: pico.intervention.length > 0,
          comparator: pico.comparator.length > 0,
          outcome: pico.outcome.length > 0,
          score: 0
        };

    // Generate search terms
    const searchTerms = input.generate_search_terms !== false
      ? generateSearchTerms(pico)
      : undefined;

    // Generate warnings
    const warnings = generateWarnings(completeness);

    const processingTime = Date.now() - startTime;

    logger.info(`PICO extraction completed in ${processingTime}ms`);

    return {
      success: true,
      pico,
      search_terms: searchTerms,
      completeness,
      warnings,
      processing_time_ms: processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('PICO extraction failed', error);

    return {
      success: false,
      pico: {
        population: [],
        intervention: [],
        comparator: [],
        outcome: []
      },
      completeness: {
        population: false,
        intervention: false,
        comparator: false,
        outcome: false,
        score: 0
      },
      warnings: [error instanceof Error ? error.message : 'Unknown error'],
      processing_time_ms: processingTime
    };
  }
}

/**
 * MCP tool handler for extract_pico
 */
export const extractPICOTool = {
  name: 'extract_pico',
  description: 'Extract PICO elements (Population, Intervention, Comparator, Outcome) from research questions and abstracts',
  inputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'Research question or abstract to extract PICO from'
      },
      generate_search_terms: {
        type: 'boolean',
        description: 'Generate search terms from PICO elements (default: true)',
        default: true
      },
      validate_completeness: {
        type: 'boolean',
        description: 'Validate PICO completeness (default: true)',
        default: true
      }
    },
    required: ['text']
  },
  handler: extractPICO
};
