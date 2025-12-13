/**
 * PICO Extraction from Research Questions
 * 
 * Extracts PICO elements from user-provided research questions:
 * - P: Population/Patient/Problem
 * - I: Intervention/Exposure
 * - C: Comparison/Control
 * - O: Outcome
 * 
 * Helps researchers formulate systematic review search strategies.
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * PICO elements extracted from research question
 */
export interface PICOFromQuestion {
  population: {
    description: string;
    keywords: string[];
    confidence: number;
  };
  intervention: {
    description: string;
    keywords: string[];
    confidence: number;
  };
  comparison: {
    description: string;
    keywords: string[];
    confidence: number;
  };
  outcome: {
    description: string;
    keywords: string[];
    confidence: number;
  };
  original_question: string;
  structured_question: string;
  search_terms: string[];
  overall_confidence: number;
}

/**
 * Extract population from research question
 */
function extractPopulation(question: string): { description: string; keywords: string[]; confidence: number } {
  // Common population patterns
  const patterns = [
    /(?:in|among|for)\s+([^?]+?)\s+(?:with|who|diagnosed|suffering)/i,
    /(?:patients?|participants?|adults?|children|individuals?)\s+(?:with|who have|diagnosed with)\s+([^?,]+)/i,
    /([^?]+?)\s+(?:patients?|participants?|adults?|children)/i,
  ];
  
  let description = '';
  const keywords: string[] = [];
  
  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      description = match[1]?.trim() || match[0].trim();
      break;
    }
  }
  
  // Extract keywords
  if (description) {
    // Look for age groups
    const ageMatch = description.match(/\b(adult|child|infant|elderly|adolescent|pediatric|geriatric)\b/i);
    if (ageMatch) keywords.push(ageMatch[1].toLowerCase());
    
    // Look for conditions
    const conditionMatch = description.match(/\b(diabetes|hypertension|cancer|depression|asthma|copd|heart disease|stroke)\b/i);
    if (conditionMatch) keywords.push(conditionMatch[1].toLowerCase());
    
    // Look for gender
    const genderMatch = description.match(/\b(male|female|men|women)\b/i);
    if (genderMatch) keywords.push(genderMatch[1].toLowerCase());
  }
  
  const confidence = description ? 0.7 : 0.3;
  
  return {
    description: description || 'Not clearly specified',
    keywords,
    confidence,
  };
}

/**
 * Extract intervention from research question
 */
function extractIntervention(question: string): { description: string; keywords: string[]; confidence: number } {
  // Common intervention patterns
  const patterns = [
    /(?:does|can|will|is)\s+([^?]+?)\s+(?:reduce|improve|increase|decrease|prevent|treat|affect|effective)/i,
    /(?:effect|efficacy|effectiveness|impact)\s+of\s+([^?]+?)\s+(?:on|in|for)/i,
    /(?:treatment with|therapy with|use of|administration of)\s+([^?,]+)/i,
    /([a-z\s]+?)\s+(?:versus|vs\.?|compared to|more effective than)/i,
    /(?:is|are)\s+([a-z\s]+?)\s+(?:effective|better)/i,
  ];
  
  let description = '';
  const keywords: string[] = [];
  
  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      description = match[1]?.trim() || '';
      break;
    }
  }
  
  // Extract keywords
  if (description) {
    // Look for drug names (simple heuristic)
    const drugMatch = description.match(/\b([a-z]{4,}(?:in|ol|ide|ate|ine))\b/i);
    if (drugMatch) keywords.push(drugMatch[1].toLowerCase());
    
    // Look for intervention types
    const typeMatch = description.match(/\b(surgery|therapy|counseling|exercise|diet|medication|drug)\b/i);
    if (typeMatch) keywords.push(typeMatch[1].toLowerCase());
  }
  
  const confidence = description ? 0.7 : 0.3;
  
  return {
    description: description || 'Not clearly specified',
    keywords,
    confidence,
  };
}

/**
 * Extract comparison from research question
 */
function extractComparison(question: string): { description: string; keywords: string[]; confidence: number } {
  // Common comparison patterns
  const patterns = [
    /(?:versus|vs\.?|compared to|compared with)\s+([^?]+?)(?:\s+in|\s+on|\s+for|\?|$)/i,
    /(?:than)\s+([^?]+?)(?:\s+for|\s+in|\?|$)/i,
    /(?:over)\s+([^?]+?)(?:\s+in|\s+on|\s+for|\?|$)/i,
  ];
  
  let description = '';
  const keywords: string[] = [];
  
  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      description = match[1]?.trim() || '';
      break;
    }
  }
  
  // Check for common comparators
  if (!description) {
    if (/placebo/i.test(question)) {
      description = 'placebo';
      keywords.push('placebo');
    } else if (/standard care|usual care/i.test(question)) {
      description = 'standard care';
      keywords.push('standard care');
    } else if (/control/i.test(question)) {
      description = 'control';
      keywords.push('control');
    }
  }
  
  const confidence = description ? 0.7 : 0.3;
  
  return {
    description: description || 'Not clearly specified',
    keywords,
    confidence,
  };
}

/**
 * Extract outcome from research question
 */
function extractOutcome(question: string): { description: string; keywords: string[]; confidence: number } {
  // Common outcome patterns
  const patterns = [
    /(?:reduce|improve|increase|decrease|prevent|affect)\s+([^?]+?)(?:\s+in|\s+among|$)/i,
    /(?:on|for)\s+([^?]+?)(?:\s+in|\s+among|$)/i,
    /(?:outcome|endpoint|measure)(?:s)?[:\s]+([^?]+)/i,
  ];
  
  let description = '';
  const keywords: string[] = [];
  
  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      description = match[1]?.trim() || '';
      // Clean up common trailing words
      description = description.replace(/\s+(in|among|for|with)$/, '');
      break;
    }
  }
  
  // Extract keywords
  if (description) {
    // Look for clinical outcomes
    const outcomeMatch = description.match(/\b(mortality|morbidity|survival|quality of life|pain|function|events?|rate|risk)\b/i);
    if (outcomeMatch) keywords.push(outcomeMatch[1].toLowerCase());
  }
  
  const confidence = description ? 0.7 : 0.3;
  
  return {
    description: description || 'Not clearly specified',
    keywords,
    confidence,
  };
}

/**
 * Generate search terms from PICO elements
 */
function generateSearchTerms(pico: PICOFromQuestion): string[] {
  const terms: string[] = [];
  
  // Add all keywords
  terms.push(...pico.population.keywords);
  terms.push(...pico.intervention.keywords);
  terms.push(...pico.comparison.keywords);
  terms.push(...pico.outcome.keywords);
  
  // Add main descriptions (split into words)
  const addWords = (text: string) => {
    if (text && text !== 'Not clearly specified') {
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3); // Filter short words
      terms.push(...words);
    }
  };
  
  addWords(pico.population.description);
  addWords(pico.intervention.description);
  addWords(pico.comparison.description);
  addWords(pico.outcome.description);
  
  // Remove duplicates and return
  return [...new Set(terms)];
}

/**
 * Create structured question from PICO elements
 */
function createStructuredQuestion(pico: PICOFromQuestion): string {
  const parts: string[] = [];
  
  if (pico.population.description !== 'Not clearly specified') {
    parts.push(`In ${pico.population.description}`);
  }
  
  if (pico.intervention.description !== 'Not clearly specified') {
    parts.push(`does ${pico.intervention.description}`);
  }
  
  if (pico.comparison.description !== 'Not clearly specified') {
    parts.push(`compared to ${pico.comparison.description}`);
  }
  
  if (pico.outcome.description !== 'Not clearly specified') {
    parts.push(`affect ${pico.outcome.description}`);
  }
  
  return parts.length > 0 ? parts.join(', ') + '?' : pico.original_question;
}

/**
 * Extract PICO elements from research question
 */
export function extractPICOFromQuestion(question: string): PICOFromQuestion {
  const population = extractPopulation(question);
  const intervention = extractIntervention(question);
  const comparison = extractComparison(question);
  const outcome = extractOutcome(question);
  
  const overallConfidence = (
    population.confidence +
    intervention.confidence +
    comparison.confidence +
    outcome.confidence
  ) / 4;
  
  const result: PICOFromQuestion = {
    population,
    intervention,
    comparison,
    outcome,
    original_question: question,
    structured_question: '',
    search_terms: [],
    overall_confidence: overallConfidence,
  };
  
  result.structured_question = createStructuredQuestion(result);
  result.search_terms = generateSearchTerms(result);
  
  return result;
}

/**
 * MCP tool interface for PICO extraction from questions
 */
export async function extractPICOFromQuestionMCP(args: {
  question: string;
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Extracting PICO from research question', {
      question_length: args.question.length,
    });
    
    const pico = extractPICOFromQuestion(args.question);
    
    logger.info('PICO extraction complete', {
      overall_confidence: pico.overall_confidence,
      search_terms_count: pico.search_terms.length,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(pico, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('Error extracting PICO from question', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error extracting PICO: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
