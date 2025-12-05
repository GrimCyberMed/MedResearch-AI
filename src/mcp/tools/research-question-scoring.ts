/**
 * Research Question Scoring Tool
 * 
 * Evaluates research questions using FINER criteria (Feasible, Interesting, Novel, Ethical, Relevant)
 * and PICO/SPIDER completeness scoring.
 * 
 * @module research-question-scoring
 * @version 1.0.0
 * @since 5.1.0
 */

import { logger } from '../../common/logger.js';

/**
 * FINER criteria scores
 */
export interface FINERScores {
  feasible: number;
  interesting: number;
  novel: number;
  ethical: number;
  relevant: number;
  overall: number;
}

/**
 * PICO completeness
 */
export interface PICOCompleteness {
  population: boolean;
  intervention: boolean;
  comparator: boolean;
  outcome: boolean;
  completeness_score: number;
}

/**
 * Research question scoring input
 */
export interface ScoreResearchQuestionInput {
  question: string;
  context?: string;
  framework?: 'pico' | 'spider' | 'finer';
}

/**
 * Research question scoring output
 */
export interface ScoreResearchQuestionOutput {
  success: boolean;
  question: string;
  finer_scores: FINERScores;
  pico_completeness: PICOCompleteness;
  quality_rating: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
  processing_time_ms: number;
}

/**
 * Assess feasibility
 */
function assessFeasibility(question: string, context?: string): number {
  let score = 0.5; // Base score

  const text = (question + ' ' + (context || '')).toLowerCase();

  // Positive indicators
  const positiveIndicators = [
    'available data',
    'existing database',
    'published',
    'accessible',
    'feasible',
    'practical'
  ];

  // Negative indicators
  const negativeIndicators = [
    'rare',
    'difficult to measure',
    'expensive',
    'time-consuming',
    'complex intervention'
  ];

  for (const indicator of positiveIndicators) {
    if (text.includes(indicator)) score += 0.1;
  }

  for (const indicator of negativeIndicators) {
    if (text.includes(indicator)) score -= 0.1;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Assess interest/importance
 */
function assessInterest(question: string, context?: string): number {
  let score = 0.5;

  const text = (question + ' ' + (context || '')).toLowerCase();

  const importanceIndicators = [
    'mortality',
    'survival',
    'quality of life',
    'public health',
    'clinical significance',
    'patient-centered',
    'burden of disease',
    'cost-effective'
  ];

  for (const indicator of importanceIndicators) {
    if (text.includes(indicator)) score += 0.1;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Assess novelty
 */
function assessNovelty(question: string, context?: string): number {
  let score = 0.5;

  const text = (question + ' ' + (context || '')).toLowerCase();

  const noveltyIndicators = [
    'novel',
    'new',
    'innovative',
    'first',
    'unexplored',
    'gap in knowledge',
    'limited evidence'
  ];

  const lackOfNoveltyIndicators = [
    'well-established',
    'extensively studied',
    'well-known',
    'replicate'
  ];

  for (const indicator of noveltyIndicators) {
    if (text.includes(indicator)) score += 0.1;
  }

  for (const indicator of lackOfNoveltyIndicators) {
    if (text.includes(indicator)) score -= 0.1;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Assess ethical considerations
 */
function assessEthical(question: string, context?: string): number {
  let score = 0.8; // Assume ethical unless indicated otherwise

  const text = (question + ' ' + (context || '')).toLowerCase();

  const ethicalConcerns = [
    'vulnerable population',
    'children',
    'prisoners',
    'pregnant women',
    'invasive',
    'experimental',
    'placebo'
  ];

  const ethicalStrengths = [
    'observational',
    'retrospective',
    'secondary data',
    'approved',
    'ethical clearance'
  ];

  for (const concern of ethicalConcerns) {
    if (text.includes(concern)) score -= 0.1;
  }

  for (const strength of ethicalStrengths) {
    if (text.includes(strength)) score += 0.05;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Assess relevance
 */
function assessRelevance(question: string, context?: string): number {
  let score = 0.5;

  const text = (question + ' ' + (context || '')).toLowerCase();

  const relevanceIndicators = [
    'clinical practice',
    'patient care',
    'health policy',
    'guidelines',
    'standard of care',
    'treatment decision',
    'diagnosis',
    'prognosis'
  ];

  for (const indicator of relevanceIndicators) {
    if (text.includes(indicator)) score += 0.1;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate FINER scores
 */
function calculateFINERScores(question: string, context?: string): FINERScores {
  const feasible = assessFeasibility(question, context);
  const interesting = assessInterest(question, context);
  const novel = assessNovelty(question, context);
  const ethical = assessEthical(question, context);
  const relevant = assessRelevance(question, context);

  const overall = (feasible + interesting + novel + ethical + relevant) / 5;

  return {
    feasible,
    interesting,
    novel,
    ethical,
    relevant,
    overall
  };
}

/**
 * Assess PICO completeness
 */
function assessPICOCompleteness(question: string): PICOCompleteness {

  // Population indicators
  const populationPatterns = [
    /patients? with/i,
    /adults? with/i,
    /children with/i,
    /individuals? with/i,
    /people with/i,
    /in patients?/i,
    /among \w+/i
  ];

  const hasPopulation = populationPatterns.some(pattern => pattern.test(question));

  // Intervention indicators
  const interventionPatterns = [
    /treatment with/i,
    /therapy/i,
    /intervention/i,
    /use of/i,
    /administration of/i,
    /receiving/i
  ];

  const hasIntervention = interventionPatterns.some(pattern => pattern.test(question));

  // Comparator indicators
  const comparatorPatterns = [
    /compared to/i,
    /versus/i,
    /vs\.?/i,
    /compared with/i,
    /relative to/i,
    /against/i
  ];

  const hasComparator = comparatorPatterns.some(pattern => pattern.test(question));

  // Outcome indicators
  const outcomePatterns = [
    /effect on/i,
    /impact on/i,
    /reduce/i,
    /improve/i,
    /increase/i,
    /decrease/i,
    /mortality/i,
    /survival/i,
    /outcome/i
  ];

  const hasOutcome = outcomePatterns.some(pattern => pattern.test(question));

  const completenessScore = [
    hasPopulation,
    hasIntervention,
    hasComparator,
    hasOutcome
  ].filter(Boolean).length / 4;

  return {
    population: hasPopulation,
    intervention: hasIntervention,
    comparator: hasComparator,
    outcome: hasOutcome,
    completeness_score: completenessScore
  };
}

/**
 * Determine quality rating
 */
function determineQualityRating(finerScores: FINERScores, picoCompleteness: PICOCompleteness): 'excellent' | 'good' | 'fair' | 'poor' {
  const combinedScore = (finerScores.overall + picoCompleteness.completeness_score) / 2;

  if (combinedScore >= 0.8) return 'excellent';
  if (combinedScore >= 0.6) return 'good';
  if (combinedScore >= 0.4) return 'fair';
  return 'poor';
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  finerScores: FINERScores,
  picoCompleteness: PICOCompleteness
): string[] {
  const recommendations: string[] = [];

  // FINER recommendations
  if (finerScores.feasible < 0.5) {
    recommendations.push('Consider feasibility constraints - ensure adequate resources and data availability');
  }

  if (finerScores.interesting < 0.5) {
    recommendations.push('Strengthen clinical or public health significance of the question');
  }

  if (finerScores.novel < 0.5) {
    recommendations.push('Clarify the novel contribution or gap in existing knowledge');
  }

  if (finerScores.ethical < 0.6) {
    recommendations.push('Address potential ethical concerns and ensure appropriate approvals');
  }

  if (finerScores.relevant < 0.5) {
    recommendations.push('Enhance relevance to clinical practice or health policy');
  }

  // PICO recommendations
  if (!picoCompleteness.population) {
    recommendations.push('Specify the target population more clearly');
  }

  if (!picoCompleteness.intervention) {
    recommendations.push('Define the intervention or exposure explicitly');
  }

  if (!picoCompleteness.comparator) {
    recommendations.push('Include a comparator or control group');
  }

  if (!picoCompleteness.outcome) {
    recommendations.push('Specify the primary outcome of interest');
  }

  if (recommendations.length === 0) {
    recommendations.push('Research question meets quality standards');
  }

  return recommendations;
}

/**
 * Score research question
 */
export async function scoreResearchQuestion(
  input: ScoreResearchQuestionInput
): Promise<ScoreResearchQuestionOutput> {
  const startTime = Date.now();

  try {
    logger.info('Scoring research question');

    // Validate input
    if (!input.question || input.question.trim().length === 0) {
      throw new Error('Research question is required');
    }

    // Calculate FINER scores
    const finerScores = calculateFINERScores(input.question, input.context);

    // Assess PICO completeness
    const picoCompleteness = assessPICOCompleteness(input.question);

    // Determine quality rating
    const qualityRating = determineQualityRating(finerScores, picoCompleteness);

    // Generate recommendations
    const recommendations = generateRecommendations(finerScores, picoCompleteness);

    const processingTime = Date.now() - startTime;

    logger.info(`Research question scored in ${processingTime}ms`);

    return {
      success: true,
      question: input.question,
      finer_scores: finerScores,
      pico_completeness: picoCompleteness,
      quality_rating: qualityRating,
      recommendations,
      processing_time_ms: processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Research question scoring failed', error);

    return {
      success: false,
      question: input.question || '',
      finer_scores: {
        feasible: 0,
        interesting: 0,
        novel: 0,
        ethical: 0,
        relevant: 0,
        overall: 0
      },
      pico_completeness: {
        population: false,
        intervention: false,
        comparator: false,
        outcome: false,
        completeness_score: 0
      },
      quality_rating: 'poor',
      recommendations: ['Scoring failed - manual review required'],
      processing_time_ms: processingTime
    };
  }
}

/**
 * MCP tool handler for score_research_question
 */
export const scoreResearchQuestionTool = {
  name: 'score_research_question',
  description: 'Evaluate research questions using FINER criteria and PICO/SPIDER completeness scoring',
  inputSchema: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: 'Research question to evaluate'
      },
      context: {
        type: 'string',
        description: 'Additional context about the research (optional)'
      },
      framework: {
        type: 'string',
        enum: ['pico', 'spider', 'finer'],
        description: 'Evaluation framework (default: pico)',
        default: 'pico'
      }
    },
    required: ['question']
  },
  handler: scoreResearchQuestion
};
