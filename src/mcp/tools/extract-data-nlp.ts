/**
 * NLP Data Extraction Tool
 * 
 * Automated extraction of study characteristics from full-text articles:
 * - PICO elements (Population, Intervention, Comparison, Outcome)
 * - Sample size and demographics
 * - Outcome data and statistical measures
 * - Study design features
 * 
 * Uses pattern-based NLP with confidence scoring
 * 
 * @version 6.0.0-beta
 */

import { StudyDesignType } from '../../common/study-design-taxonomy.js';
import { logger } from '../../common/logger.js';

/**
 * Extracted PICO elements
 */
export interface PICOElements {
  population: {
    description: string;
    age_range?: string;
    gender?: string;
    condition?: string;
    confidence: number;
  };
  intervention: {
    description: string;
    type?: string;
    dosage?: string;
    duration?: string;
    confidence: number;
  };
  comparison: {
    description: string;
    type?: string;
    confidence: number;
  };
  outcome: {
    primary: string[];
    secondary: string[];
    confidence: number;
  };
}

/**
 * Sample size information
 */
export interface SampleSize {
  total: number;
  intervention_group?: number;
  control_group?: number;
  analyzed?: number;
  lost_to_followup?: number;
  confidence: number;
}

/**
 * Outcome data
 */
export interface OutcomeData {
  outcome_name: string;
  intervention_result: string;
  control_result: string;
  effect_size?: string;
  p_value?: string;
  confidence_interval?: string;
  statistical_significance: boolean;
  confidence: number;
}

/**
 * Complete data extraction result
 */
export interface DataExtractionResult {
  study_id: string;
  study_design: StudyDesignType;
  pico: PICOElements;
  sample_size: SampleSize;
  outcomes: OutcomeData[];
  demographics: {
    mean_age?: number;
    age_range?: string;
    gender_distribution?: string;
    ethnicity?: string;
    confidence: number;
  };
  overall_confidence: number;
  extraction_timestamp: string;
  requires_manual_review: boolean;
  review_reasons: string[];
}

/**
 * Extract PICO elements from study text
 */
function extractPICO(title: string, abstract: string, methods: string): PICOElements {
  const combinedText = `${title} ${abstract} ${methods}`.toLowerCase();
  
  // Extract Population
  let populationDesc = '';
  let ageRange = '';
  let gender = '';
  let condition = '';
  
  // Extract age
  const ageMatch = combinedText.match(/aged? (\d+(?:-\d+)?)|(\d+(?:-\d+)?)\s*years?/i);
  if (ageMatch) {
    ageRange = ageMatch[1] || ageMatch[2];
  }
  
  // Extract gender
  if (/\bmale\b/i.test(combinedText) && /\bfemale\b/i.test(combinedText)) {
    gender = 'both';
  } else if (/\bmale\b/i.test(combinedText)) {
    gender = 'male';
  } else if (/\bfemale\b/i.test(combinedText)) {
    gender = 'female';
  }
  
  // Extract condition
  const conditionMatch = combinedText.match(/(?:patients?|participants?) with ([^.,]+)/i);
  if (conditionMatch) {
    condition = conditionMatch[1].trim();
    populationDesc = `Patients with ${condition}`;
  }
  
  const populationConfidence = (populationDesc ? 0.7 : 0.3) + (ageRange ? 0.1 : 0) + (gender ? 0.1 : 0);
  
  // Extract Intervention
  const interventionPatterns = [
    // Match drug name with dosage: "aspirin 100mg"
    /(?:receive|received|administered|treated with|given)\s+([a-z0-9\-]+(?:\s+\d+\s*(?:mg|g|ml|mcg))?)/i,
    // Match "treatment consisted of X" but stop before "versus"
    /treatment consisted of ([^.,]+?)(?:\s+versus|\s+vs\.?)/i,
    // Match "intervention: X" or "treatment: X"
    /(?:intervention|treatment)[:\s]+([^.,]+?)(?:\s+versus|\s+vs\.?|[,.])/i,
    // Match surgical procedures
    /(?:received|underwent)\s+(laparoscop\w+|surgery|appendectomy|[a-z]+ectomy)/i,
    // Match therapy types (full phrase)
    /(?:received|underwent)\s+(cognitive\s+behavioral\s+therapy|cbt|psychotherapy|counseling)/i,
    // Match exposure in cohort studies
    /(?:participants?|patients?)\s+with\s+([^.,]+?)(?:\s+were|\s+history)/i,
  ];
  
  let interventionDesc = '';
  let interventionType = '';
  
  for (const pattern of interventionPatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      interventionDesc = match[1].trim();
      // Skip if it's just generic words
      if (!/^(group|intervention|treatment|consisted)$/i.test(interventionDesc)) {
        break;
      }
    }
  }
  
  // Determine intervention type by checking the full text context
  const fullContext = interventionDesc + ' ' + combinedText;
  if (/\b(drug|medication|pharmaceutical|aspirin|ibuprofen|statin|antibiotic|mg|mcg)\b/i.test(fullContext)) {
    interventionType = 'pharmacological';
  } else if (/\b(surgery|surgical|operation|laparoscop|appendectomy|procedure)\b/i.test(fullContext)) {
    interventionType = 'surgical';
  } else if (/\b(therapy|counseling|behavioral|cognitive|psychotherapy|cbt)\b/i.test(fullContext)) {
    interventionType = 'behavioral';
  }
  
  const interventionConfidence = interventionDesc ? 0.7 : 0.3;
  
  // Extract Comparison
  let comparisonDesc = '';
  const comparisonPatterns = [
    /(?:compared to|versus|vs\.?|control) ([^.,]+)/i,
    /placebo/i,
    /standard care/i,
  ];
  
  for (const pattern of comparisonPatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      comparisonDesc = match[0].trim();
      break;
    }
  }
  
  const comparisonConfidence = comparisonDesc ? 0.7 : 0.3;
  
  // Extract Outcomes
  const primaryOutcomes: string[] = [];
  const secondaryOutcomes: string[] = [];
  
  const primaryMatch = combinedText.match(/primary outcome[:\s]+([^.,]+)/i);
  if (primaryMatch) {
    primaryOutcomes.push(primaryMatch[1].trim());
  }
  
  const secondaryMatch = combinedText.match(/secondary outcome[:\s]+([^.,]+)/i);
  if (secondaryMatch) {
    secondaryOutcomes.push(secondaryMatch[1].trim());
  }
  
  // If no explicit primary/secondary, extract general outcomes
  if (primaryOutcomes.length === 0) {
    const outcomeMatch = combinedText.match(/outcome[:\s]+([^.,]+)/i);
    if (outcomeMatch) {
      primaryOutcomes.push(outcomeMatch[1].trim());
    }
  }
  
  const outcomeConfidence = primaryOutcomes.length > 0 ? 0.7 : 0.3;
  
  return {
    population: {
      description: populationDesc || 'Not clearly specified',
      age_range: ageRange,
      gender,
      condition,
      confidence: populationConfidence,
    },
    intervention: {
      description: interventionDesc || 'Not clearly specified',
      type: interventionType,
      confidence: interventionConfidence,
    },
    comparison: {
      description: comparisonDesc || 'Not clearly specified',
      confidence: comparisonConfidence,
    },
    outcome: {
      primary: primaryOutcomes.length > 0 ? primaryOutcomes : ['Not clearly specified'],
      secondary: secondaryOutcomes,
      confidence: outcomeConfidence,
    },
  };
}

/**
 * Extract sample size from study text
 */
function extractSampleSize(abstract: string, methods: string, results: string): SampleSize {
  const combinedText = `${abstract} ${methods} ${results}`.toLowerCase();
  
  let total = 0;
  let interventionGroup: number | undefined;
  let controlGroup: number | undefined;
  let analyzed: number | undefined;
  let lostToFollowup: number | undefined;
  
  // Extract total sample size
  const totalPatterns = [
    /(\d+)\s+(?:patients?|participants?|subjects?)/i,
    /n\s*=\s*(\d+)/i,
    /sample size[:\s]+(\d+)/i,
    /enrolled (\d+)/i,
  ];
  
  for (const pattern of totalPatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      const num = parseInt(match[1]);
      if (num > total) total = num; // Take the largest number found
    }
  }
  
  // Extract intervention group size
  const interventionMatch = combinedText.match(/intervention group[:\s]+(?:n\s*=\s*)?(\d+)/i) ||
                           combinedText.match(/treatment group[:\s]+(?:n\s*=\s*)?(\d+)/i);
  if (interventionMatch) {
    interventionGroup = parseInt(interventionMatch[1]);
  }
  
  // Extract control group size
  const controlMatch = combinedText.match(/control group[:\s]+(?:n\s*=\s*)?(\d+)/i) ||
                       combinedText.match(/placebo group[:\s]+(?:n\s*=\s*)?(\d+)/i);
  if (controlMatch) {
    controlGroup = parseInt(controlMatch[1]);
  }
  
  // Extract analyzed
  const analyzedMatch = combinedText.match(/analyzed[:\s]+(?:n\s*=\s*)?(\d+)/i) ||
                       combinedText.match(/(\d+)\s+(?:patients?|participants?)\s+(?:were\s+)?analyzed/i) ||
                       combinedText.match(/(\d+)\s+(?:were|was)\s+analyzed/i);
  if (analyzedMatch) {
    analyzed = parseInt(analyzedMatch[1]);
  }
  
  // Extract lost to follow-up
  const lostMatch = combinedText.match(/lost to follow(?:-|\s)?up[:\s]+(?:n\s*=\s*)?(\d+)/i) ||
                   combinedText.match(/(\d+)\s+(?:were|patients?) lost/i);
  if (lostMatch) {
    lostToFollowup = parseInt(lostMatch[1]);
  }
  
  const confidence = total > 0 ? 0.8 : 0.2;
  
  return {
    total,
    intervention_group: interventionGroup,
    control_group: controlGroup,
    analyzed,
    lost_to_followup: lostToFollowup,
    confidence,
  };
}

/**
 * Extract outcome data from results
 */
function extractOutcomes(results: string): OutcomeData[] {
  const outcomes: OutcomeData[] = [];
  
  const sentences = results.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    // Look for p-values
    const pValueMatch = sentence.match(/p\s*[<>=]\s*(0?\.\d+|0\.0+\d+)/i);
    const ciMatch = sentence.match(/95%?\s*ci[:\s]+([\d.]+[-–]\s*[\d.]+)/i);
    
    if (pValueMatch || ciMatch) {
      // Extract outcome name (usually at start of sentence)
      const outcomeName = sentence.substring(0, 50).trim();
      
      const pValue = pValueMatch ? pValueMatch[1] : undefined;
      const ci = ciMatch ? ciMatch[1] : undefined;
      const significant = pValue ? parseFloat(pValue) < 0.05 : false;
      
      outcomes.push({
        outcome_name: outcomeName,
        intervention_result: 'See results',
        control_result: 'See results',
        p_value: pValue,
        confidence_interval: ci,
        statistical_significance: significant,
        confidence: 0.6,
      });
    }
  }
  
  return outcomes;
}

/**
 * MCP tool interface for data extraction
 */
export async function extractDataNLP(args: {
  study_id: string;
  design: StudyDesignType;
  title: string;
  abstract?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  full_text?: string;
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Extracting data using NLP', {
      study_id: args.study_id,
      design: args.design,
    });
    
    const abstract = args.abstract || '';
    const methods = args.methods || '';
    const results = args.results || '';
    
    // Extract PICO
    const pico = extractPICO(args.title, abstract, methods);
    
    // Extract sample size
    const sampleSize = extractSampleSize(abstract, methods, results);
    
    // Extract outcomes
    const outcomes = extractOutcomes(results);
    
    // Extract demographics
    const demographics = {
      mean_age: undefined,
      age_range: pico.population.age_range,
      gender_distribution: pico.population.gender,
      confidence: 0.5,
    };
    
    // Calculate overall confidence
    const confidences = [
      pico.population.confidence,
      pico.intervention.confidence,
      pico.comparison.confidence,
      pico.outcome.confidence,
      sampleSize.confidence,
    ];
    const overallConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    
    // Determine if manual review needed
    const requiresReview = overallConfidence < 0.6 || sampleSize.total === 0;
    const reviewReasons: string[] = [];
    
    if (overallConfidence < 0.6) {
      reviewReasons.push('Low confidence in automated extraction (<60%)');
    }
    if (sampleSize.total === 0) {
      reviewReasons.push('Sample size not detected');
    }
    if (pico.population.description === 'Not clearly specified') {
      reviewReasons.push('Population not clearly specified');
    }
    
    const extraction: DataExtractionResult = {
      study_id: args.study_id,
      study_design: args.design,
      pico,
      sample_size: sampleSize,
      outcomes,
      demographics,
      overall_confidence: overallConfidence,
      extraction_timestamp: new Date().toISOString(),
      requires_manual_review: requiresReview,
      review_reasons: reviewReasons,
    };
    
    logger.info('Data extraction complete', {
      study_id: args.study_id,
      confidence: overallConfidence,
      requires_review: requiresReview,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(extraction, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('Error extracting data', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error extracting data: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
