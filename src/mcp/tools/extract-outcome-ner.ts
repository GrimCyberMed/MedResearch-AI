/**
 * Outcome Extraction with Named Entity Recognition (NER)
 * 
 * Advanced outcome extraction using rule-based NER for medical outcomes.
 * Extracts and classifies outcome measures with measurement tools and timepoints.
 * 
 * Approach:
 * 1. Outcome entity recognition (primary, secondary, safety, efficacy)
 * 2. Measurement tool identification (scales, questionnaires, biomarkers)
 * 3. Time point extraction (baseline, follow-up periods)
 * 4. Outcome-measurement linking
 * 5. Confidence scoring based on entity matches and context
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Outcome entity types
 */
export enum OutcomeEntityType {
  PRIMARY_OUTCOME = 'primary_outcome',
  SECONDARY_OUTCOME = 'secondary_outcome',
  SAFETY_OUTCOME = 'safety_outcome',
  EFFICACY_OUTCOME = 'efficacy_outcome',
  MEASUREMENT_TOOL = 'measurement_tool',
  TIME_POINT = 'time_point',
  EFFECT_SIZE = 'effect_size',
}

/**
 * Named entity for outcomes
 */
export interface OutcomeEntity {
  text: string;
  type: OutcomeEntityType;
  start: number;
  end: number;
  confidence: number;
  context?: string;
}

/**
 * Extracted outcome with metadata
 */
export interface ExtractedOutcome {
  text: string;
  type: 'primary' | 'secondary' | 'safety' | 'efficacy';
  entities: OutcomeEntity[];
  measurement_tools: string[];
  time_points: string[];
  effect_sizes: string[];
  confidence: number;
  evidence: string[];
}

/**
 * Outcome extraction result
 */
export interface OutcomeExtractionResult {
  study_id: string;
  
  // Extracted outcomes
  primary_outcomes: ExtractedOutcome[];
  secondary_outcomes: ExtractedOutcome[];
  safety_outcomes: ExtractedOutcome[];
  efficacy_outcomes: ExtractedOutcome[];
  
  // Measurement tools
  measurement_tools: string[];
  
  // Time points
  time_points: string[];
  
  // Overall metrics
  total_outcomes: number;
  entities_found: number;
  overall_confidence: number;
  
  // Quality indicators
  has_primary_outcome: boolean;
  has_measurement_tools: boolean;
  has_time_points: boolean;
  
  // Interpretation
  interpretation: string;
  
  // Recommendations
  recommendations: string[];
  
  // Warnings
  warnings: string[];
  
  // Metadata
  requires_review: boolean;
  extraction_timestamp: string;
}

/**
 * Entity patterns for outcome extraction
 */
const OUTCOME_PATTERNS = {
  // Primary outcomes
  primary: [
    /primary\s+outcome/gi,
    /primary\s+endpoint/gi,
    /main\s+outcome/gi,
    /principal\s+outcome/gi,
    /primary\s+measure/gi,
  ],
  
  // Secondary outcomes
  secondary: [
    /secondary\s+outcome/gi,
    /secondary\s+endpoint/gi,
    /additional\s+outcome/gi,
    /exploratory\s+outcome/gi,
  ],
  
  // Safety outcomes
  safety: [
    /adverse\s+event/gi,
    /adverse\s+effect/gi,
    /side\s+effect/gi,
    /safety/gi,
    /tolerability/gi,
    /toxicity/gi,
    /serious\s+adverse\s+event/gi,
    /treatment-related\s+adverse\s+event/gi,
  ],
  
  // Efficacy outcomes
  efficacy: [
    /efficacy/gi,
    /effectiveness/gi,
    /response\s+rate/gi,
    /clinical\s+response/gi,
    /therapeutic\s+response/gi,
    /treatment\s+success/gi,
  ],
  
  // Measurement tools and scales
  measurement_tools: [
    /measured\s+using/gi,
    /assessed\s+with/gi,
    /evaluated\s+using/gi,
    /scale/gi,
    /questionnaire/gi,
    /inventory/gi,
    /index/gi,
    /score/gi,
    /\b(VAS|visual\s+analog\s+scale)\b/gi,
    /\b(SF-36|short\s+form\s+36)\b/gi,
    /\b(HADS|hospital\s+anxiety\s+and\s+depression\s+scale)\b/gi,
    /\b(PHQ-9|patient\s+health\s+questionnaire)\b/gi,
    /\b(GAD-7|generalized\s+anxiety\s+disorder)\b/gi,
    /\b(MMSE|mini-mental\s+state\s+examination)\b/gi,
    /\b(WOMAC|western\s+ontario\s+and\s+mcmaster)\b/gi,
    /\b(HAM-D|hamilton\s+depression\s+rating\s+scale)\b/gi,
    /\b(MADRS|montgomery-asberg\s+depression\s+rating\s+scale)\b/gi,
    /\b(PANSS|positive\s+and\s+negative\s+syndrome\s+scale)\b/gi,
    /\b(UPDRS|unified\s+parkinson'?s\s+disease\s+rating\s+scale)\b/gi,
    /\b(EDSS|expanded\s+disability\s+status\s+scale)\b/gi,
    /\b(FEV1|forced\s+expiratory\s+volume)\b/gi,
    /\b(HbA1c|glycated\s+hemoglobin)\b/gi,
    /\b(BMI|body\s+mass\s+index)\b/gi,
    /\b(blood\s+pressure|systolic|diastolic)\b/gi,
    /\b(cholesterol|LDL|HDL|triglycerides)\b/gi,
  ],
  
  // Time points
  time_points: [
    /at\s+\d+\s+(weeks?|months?|years?|days?|hours?)/gi,
    /after\s+\d+\s+(weeks?|months?|years?|days?|hours?)/gi,
    /baseline/gi,
    /follow-up/gi,
    /end\s+of\s+treatment/gi,
    /post-treatment/gi,
    /at\s+discharge/gi,
    /at\s+\d+\s+and\s+\d+\s+(weeks?|months?)/gi,
  ],
  
  // Effect sizes and statistics
  effect_sizes: [
    /mean\s+difference/gi,
    /standardized\s+mean\s+difference/gi,
    /odds\s+ratio/gi,
    /risk\s+ratio/gi,
    /hazard\s+ratio/gi,
    /relative\s+risk/gi,
    /\b(OR|RR|HR|SMD|MD)\s*[=:]\s*[\d.]+/gi,
    /p\s*[=<]\s*[\d.]+/gi,
    /95%\s*CI/gi,
    /confidence\s+interval/gi,
  ],
};

/**
 * Common measurement scales and their abbreviations
 */
const MEASUREMENT_SCALES = [
  'VAS', 'SF-36', 'HADS', 'PHQ-9', 'GAD-7', 'MMSE', 'WOMAC',
  'HAM-D', 'MADRS', 'PANSS', 'UPDRS', 'EDSS', 'FEV1', 'HbA1c',
  'BMI', 'Visual Analog Scale', 'Short Form 36',
  'Hospital Anxiety and Depression Scale', 'Patient Health Questionnaire',
  'Generalized Anxiety Disorder', 'Mini-Mental State Examination',
];

/**
 * Extract measurement tools from text
 */
function extractMeasurementTools(text: string): string[] {
  const tools = new Set<string>();
  
  // Extract using patterns
  for (const pattern of OUTCOME_PATTERNS.measurement_tools) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => tools.add(match.trim()));
    }
  }
  
  // Look for known scales
  for (const scale of MEASUREMENT_SCALES) {
    const regex = new RegExp(`\\b${scale}\\b`, 'gi');
    if (regex.test(text)) {
      tools.add(scale);
    }
  }
  
  return Array.from(tools);
}

/**
 * Extract time points from text
 */
function extractTimePoints(text: string): string[] {
  const timePoints = new Set<string>();
  
  for (const pattern of OUTCOME_PATTERNS.time_points) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => timePoints.add(match.trim()));
    }
  }
  
  return Array.from(timePoints);
}

/**
 * Extract effect sizes from text
 */
function extractEffectSizes(text: string): string[] {
  const effectSizes = new Set<string>();
  
  for (const pattern of OUTCOME_PATTERNS.effect_sizes) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => effectSizes.add(match.trim()));
    }
  }
  
  return Array.from(effectSizes);
}

/**
 * Extract outcomes of a specific type
 */
function extractOutcomesByType(
  text: string,
  type: 'primary' | 'secondary' | 'safety' | 'efficacy',
  allMeasurementTools: string[],
  allTimePoints: string[],
  allEffectSizes: string[]
): ExtractedOutcome[] {
  const outcomes: ExtractedOutcome[] = [];
  const patterns = OUTCOME_PATTERNS[type];
  
  // Find all mentions of this outcome type
  const mentions: Array<{ text: string; index: number }> = [];
  for (const pattern of patterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(text)) !== null) {
      mentions.push({
        text: match[0],
        index: match.index,
      });
    }
  }
  
  // For each mention, extract surrounding context and details
  for (const mention of mentions) {
    // Extract context (200 chars after the mention)
    const contextStart = mention.index;
    const contextEnd = Math.min(text.length, mention.index + 200);
    const context = text.substring(contextStart, contextEnd);
    
    // Extract entities from context
    const entities: OutcomeEntity[] = [];
    
    // Add the outcome mention itself
    entities.push({
      text: mention.text,
      type: type === 'primary' ? OutcomeEntityType.PRIMARY_OUTCOME :
            type === 'secondary' ? OutcomeEntityType.SECONDARY_OUTCOME :
            type === 'safety' ? OutcomeEntityType.SAFETY_OUTCOME :
            OutcomeEntityType.EFFICACY_OUTCOME,
      start: mention.index,
      end: mention.index + mention.text.length,
      confidence: 0.8,
      context: context.trim(),
    });
    
    // Find measurement tools in context
    const contextTools = allMeasurementTools.filter(tool =>
      context.toLowerCase().includes(tool.toLowerCase())
    );
    
    // Find time points in context
    const contextTimePoints = allTimePoints.filter(tp =>
      context.toLowerCase().includes(tp.toLowerCase())
    );
    
    // Find effect sizes in context
    const contextEffectSizes = allEffectSizes.filter(es =>
      context.toLowerCase().includes(es.toLowerCase())
    );
    
    // Calculate confidence based on completeness
    let confidence = 0.5; // Base confidence
    if (contextTools.length > 0) confidence += 0.2;
    if (contextTimePoints.length > 0) confidence += 0.15;
    if (contextEffectSizes.length > 0) confidence += 0.15;
    
    outcomes.push({
      text: context.trim(),
      type,
      entities,
      measurement_tools: contextTools,
      time_points: contextTimePoints,
      effect_sizes: contextEffectSizes,
      confidence: Math.min(confidence, 0.85), // Cap at 85%
      evidence: [context.trim()],
    });
  }
  
  return outcomes;
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(
  primaryOutcomes: ExtractedOutcome[],
  secondaryOutcomes: ExtractedOutcome[],
  safetyOutcomes: ExtractedOutcome[],
  efficacyOutcomes: ExtractedOutcome[],
  measurementTools: string[],
  timePoints: string[]
): number {
  let confidence = 0.3; // Base confidence
  
  // Primary outcomes are critical
  if (primaryOutcomes.length > 0) {
    confidence += 0.25;
    // Bonus for well-defined primary outcomes
    const avgPrimaryConfidence = primaryOutcomes.reduce((sum, o) => sum + o.confidence, 0) / primaryOutcomes.length;
    confidence += avgPrimaryConfidence * 0.15;
  }
  
  // Secondary outcomes add value
  if (secondaryOutcomes.length > 0) confidence += 0.1;
  
  // Safety outcomes are important
  if (safetyOutcomes.length > 0) confidence += 0.1;
  
  // Efficacy outcomes add value
  if (efficacyOutcomes.length > 0) confidence += 0.05;
  
  // Measurement tools are critical
  if (measurementTools.length > 0) confidence += 0.15;
  
  // Time points add clarity
  if (timePoints.length > 0) confidence += 0.1;
  
  return Math.min(confidence, 0.85); // Cap at 85% (conservative)
}

/**
 * Generate interpretation
 */
function generateInterpretation(
  primaryOutcomes: ExtractedOutcome[],
  secondaryOutcomes: ExtractedOutcome[],
  safetyOutcomes: ExtractedOutcome[],
  efficacyOutcomes: ExtractedOutcome[],
  measurementTools: string[],
  timePoints: string[],
  overallConfidence: number
): string {
  const parts: string[] = [];
  
  // Outcome summary
  const totalOutcomes = primaryOutcomes.length + secondaryOutcomes.length + 
                        safetyOutcomes.length + efficacyOutcomes.length;
  parts.push(`Extracted ${totalOutcomes} outcome(s)`);
  
  if (primaryOutcomes.length > 0) {
    parts.push(`${primaryOutcomes.length} primary`);
  }
  if (secondaryOutcomes.length > 0) {
    parts.push(`${secondaryOutcomes.length} secondary`);
  }
  if (safetyOutcomes.length > 0) {
    parts.push(`${safetyOutcomes.length} safety`);
  }
  if (efficacyOutcomes.length > 0) {
    parts.push(`${efficacyOutcomes.length} efficacy`);
  }
  
  let interpretation = parts.join(', ') + '.';
  
  // Measurement tools
  if (measurementTools.length > 0) {
    interpretation += ` Identified ${measurementTools.length} measurement tool(s).`;
  }
  
  // Time points
  if (timePoints.length > 0) {
    interpretation += ` Found ${timePoints.length} time point(s).`;
  }
  
  // Confidence assessment
  if (overallConfidence >= 0.7) {
    interpretation += ' High confidence extraction.';
  } else if (overallConfidence >= 0.5) {
    interpretation += ' Moderate confidence extraction.';
  } else {
    interpretation += ' Low confidence extraction - manual review recommended.';
  }
  
  return interpretation;
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  primaryOutcomes: ExtractedOutcome[],
  measurementTools: string[],
  timePoints: string[]
): string[] {
  const recommendations: string[] = [];
  
  if (primaryOutcomes.length === 0) {
    recommendations.push('No primary outcome identified - verify study design');
  }
  
  if (primaryOutcomes.length > 3) {
    recommendations.push('Multiple primary outcomes detected - verify if truly primary or secondary');
  }
  
  if (measurementTools.length === 0) {
    recommendations.push('No measurement tools identified - manual extraction recommended');
  }
  
  if (timePoints.length === 0) {
    recommendations.push('No time points identified - check methods section');
  }
  
  // Check for well-defined primary outcomes
  const wellDefinedPrimary = primaryOutcomes.filter(o => 
    o.measurement_tools.length > 0 && o.time_points.length > 0
  );
  
  if (primaryOutcomes.length > 0 && wellDefinedPrimary.length === 0) {
    recommendations.push('Primary outcomes lack measurement tools or time points');
  }
  
  return recommendations;
}

/**
 * Generate warnings
 */
function generateWarnings(
  primaryOutcomes: ExtractedOutcome[],
  overallConfidence: number
): string[] {
  const warnings: string[] = [];
  
  if (overallConfidence < 0.5) {
    warnings.push('Low confidence extraction - manual review required');
  }
  
  if (primaryOutcomes.length === 0) {
    warnings.push('No primary outcome detected - critical information missing');
  }
  
  return warnings;
}

/**
 * Extract outcomes from study text using NER
 */
export function extractOutcomeNER(
  studyId: string,
  abstractText: string,
  methodsText?: string
): OutcomeExtractionResult {
  logger.info('Extracting outcomes using NER', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    study_id: studyId,
  });
  
  // Combine text sources
  const fullText = [abstractText, methodsText].filter(Boolean).join('\n\n');
  
  // Extract all measurement tools, time points, and effect sizes first
  const allMeasurementTools = extractMeasurementTools(fullText);
  const allTimePoints = extractTimePoints(fullText);
  const allEffectSizes = extractEffectSizes(fullText);
  
  // Extract outcomes by type
  const primaryOutcomes = extractOutcomesByType(
    fullText, 'primary', allMeasurementTools, allTimePoints, allEffectSizes
  );
  const secondaryOutcomes = extractOutcomesByType(
    fullText, 'secondary', allMeasurementTools, allTimePoints, allEffectSizes
  );
  const safetyOutcomes = extractOutcomesByType(
    fullText, 'safety', allMeasurementTools, allTimePoints, allEffectSizes
  );
  const efficacyOutcomes = extractOutcomesByType(
    fullText, 'efficacy', allMeasurementTools, allTimePoints, allEffectSizes
  );
  
  // Calculate metrics
  const totalOutcomes = primaryOutcomes.length + secondaryOutcomes.length + 
                        safetyOutcomes.length + efficacyOutcomes.length;
  const entitiesFound = totalOutcomes + allMeasurementTools.length + allTimePoints.length;
  
  const overallConfidence = calculateOverallConfidence(
    primaryOutcomes, secondaryOutcomes, safetyOutcomes, efficacyOutcomes,
    allMeasurementTools, allTimePoints
  );
  
  // Generate interpretation and recommendations
  const interpretation = generateInterpretation(
    primaryOutcomes, secondaryOutcomes, safetyOutcomes, efficacyOutcomes,
    allMeasurementTools, allTimePoints, overallConfidence
  );
  
  const recommendations = generateRecommendations(
    primaryOutcomes, allMeasurementTools, allTimePoints
  );
  
  const warnings = generateWarnings(primaryOutcomes, overallConfidence);
  
  const result: OutcomeExtractionResult = {
    study_id: studyId,
    primary_outcomes: primaryOutcomes,
    secondary_outcomes: secondaryOutcomes,
    safety_outcomes: safetyOutcomes,
    efficacy_outcomes: efficacyOutcomes,
    measurement_tools: allMeasurementTools,
    time_points: allTimePoints,
    total_outcomes: totalOutcomes,
    entities_found: entitiesFound,
    overall_confidence: overallConfidence,
    has_primary_outcome: primaryOutcomes.length > 0,
    has_measurement_tools: allMeasurementTools.length > 0,
    has_time_points: allTimePoints.length > 0,
    interpretation,
    recommendations,
    warnings,
    requires_review: overallConfidence < 0.5 || primaryOutcomes.length === 0,
    extraction_timestamp: new Date().toISOString(),
  };
  
  logger.info('Outcome extraction complete', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    study_id: studyId,
    total_outcomes: totalOutcomes,
    confidence: overallConfidence,
    requires_review: result.requires_review,
  });
  
  return result;
}
