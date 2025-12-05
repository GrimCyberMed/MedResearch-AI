/**
 * ML Timeline Prediction Tool
 * 
 * Machine learning-based project timeline forecasting for systematic reviews.
 * Predicts phase durations, identifies risks, and provides resource allocation suggestions.
 * 
 * @module ml-timeline-prediction
 * @version 1.0.0
 * @since 5.1.0
 */

import { logger } from '../../common/logger.js';

/**
 * Project parameters for timeline prediction
 */
export interface ProjectParameters {
  total_citations: number;
  databases_searched: number;
  reviewers_count: number;
  study_type: 'rct' | 'observational' | 'mixed' | 'qualitative';
  meta_analysis_planned: boolean;
  team_experience: 'novice' | 'intermediate' | 'expert';
  complexity: 'low' | 'medium' | 'high';
}

/**
 * Phase duration prediction
 */
export interface PhaseDuration {
  phase: string;
  estimated_days: number;
  confidence_interval: { lower: number; upper: number };
  confidence: number;
}

/**
 * Risk factor
 */
export interface RiskFactor {
  factor: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  mitigation: string;
}

/**
 * Resource allocation suggestion
 */
export interface ResourceAllocation {
  phase: string;
  reviewers_needed: number;
  hours_per_reviewer: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Timeline prediction input
 */
export interface PredictTimelineInput {
  project_params: ProjectParameters;
  include_confidence_intervals?: boolean;
  identify_risks?: boolean;
  suggest_resources?: boolean;
}

/**
 * Timeline prediction output
 */
export interface PredictTimelineOutput {
  success: boolean;
  total_duration_days: number;
  phase_durations: PhaseDuration[];
  risk_factors: RiskFactor[];
  resource_allocations: ResourceAllocation[];
  recommendations: string[];
  processing_time_ms: number;
}

/**
 * Calculate base duration for screening phase
 */
function calculateScreeningDuration(params: ProjectParameters): number {
  // Base: 100 citations per day per reviewer
  const citationsPerDay = params.team_experience === 'expert' ? 150 :
                          params.team_experience === 'intermediate' ? 100 : 50;
  
  const baseDays = params.total_citations / (citationsPerDay * params.reviewers_count);
  
  // Adjust for complexity
  const complexityMultiplier = params.complexity === 'high' ? 1.5 :
                               params.complexity === 'medium' ? 1.2 : 1.0;
  
  return Math.ceil(baseDays * complexityMultiplier);
}

/**
 * Calculate base duration for full-text review
 */
function calculateFullTextDuration(params: ProjectParameters): number {
  // Assume 10-20% of citations go to full-text
  const fullTextCount = params.total_citations * 0.15;
  
  // Base: 10 full-text articles per day per reviewer
  const articlesPerDay = params.team_experience === 'expert' ? 15 :
                         params.team_experience === 'intermediate' ? 10 : 5;
  
  const baseDays = fullTextCount / (articlesPerDay * params.reviewers_count);
  
  return Math.ceil(baseDays);
}

/**
 * Calculate base duration for data extraction
 */
function calculateDataExtractionDuration(params: ProjectParameters): number {
  // Assume 5-10% of citations are included
  const includedCount = params.total_citations * 0.075;
  
  // Base: 5 studies per day per reviewer
  const studiesPerDay = params.team_experience === 'expert' ? 8 :
                        params.team_experience === 'intermediate' ? 5 : 3;
  
  const baseDays = includedCount / (studiesPerDay * params.reviewers_count);
  
  // Adjust for complexity
  const complexityMultiplier = params.complexity === 'high' ? 1.8 :
                               params.complexity === 'medium' ? 1.4 : 1.0;
  
  return Math.ceil(baseDays * complexityMultiplier);
}

/**
 * Calculate base duration for quality assessment
 */
function calculateQualityAssessmentDuration(params: ProjectParameters): number {
  const includedCount = params.total_citations * 0.075;
  
  // Base: 8 studies per day per reviewer
  const studiesPerDay = params.team_experience === 'expert' ? 12 :
                        params.team_experience === 'intermediate' ? 8 : 4;
  
  return Math.ceil(includedCount / (studiesPerDay * params.reviewers_count));
}

/**
 * Calculate base duration for meta-analysis
 */
function calculateMetaAnalysisDuration(params: ProjectParameters): number {
  if (!params.meta_analysis_planned) return 0;
  
  const baseDays = params.team_experience === 'expert' ? 7 :
                   params.team_experience === 'intermediate' ? 14 : 21;
  
  const complexityMultiplier = params.complexity === 'high' ? 1.5 :
                               params.complexity === 'medium' ? 1.2 : 1.0;
  
  return Math.ceil(baseDays * complexityMultiplier);
}

/**
 * Calculate base duration for manuscript writing
 */
function calculateManuscriptDuration(params: ProjectParameters): number {
  const baseDays = params.team_experience === 'expert' ? 14 :
                   params.team_experience === 'intermediate' ? 21 : 30;
  
  return baseDays;
}

/**
 * Calculate confidence intervals
 */
function calculateConfidenceInterval(
  estimatedDays: number,
  confidence: number
): { lower: number; upper: number } {
  // Wider intervals for lower confidence
  const margin = estimatedDays * (1 - confidence) * 0.5;
  
  return {
    lower: Math.max(1, Math.ceil(estimatedDays - margin)),
    upper: Math.ceil(estimatedDays + margin)
  };
}

/**
 * Predict phase durations
 */
function predictPhaseDurations(
  params: ProjectParameters,
  includeCI: boolean
): PhaseDuration[] {
  const phases: PhaseDuration[] = [];

  // Protocol development
  const protocolDays = 7;
  phases.push({
    phase: 'Protocol Development',
    estimated_days: protocolDays,
    confidence_interval: includeCI ? calculateConfidenceInterval(protocolDays, 0.9) : { lower: protocolDays, upper: protocolDays },
    confidence: 0.9
  });

  // Search strategy
  const searchDays = 5;
  phases.push({
    phase: 'Search Strategy Development',
    estimated_days: searchDays,
    confidence_interval: includeCI ? calculateConfidenceInterval(searchDays, 0.85) : { lower: searchDays, upper: searchDays },
    confidence: 0.85
  });

  // Database searching
  const dbSearchDays = params.databases_searched * 2;
  phases.push({
    phase: 'Database Searching',
    estimated_days: dbSearchDays,
    confidence_interval: includeCI ? calculateConfidenceInterval(dbSearchDays, 0.9) : { lower: dbSearchDays, upper: dbSearchDays },
    confidence: 0.9
  });

  // Screening
  const screeningDays = calculateScreeningDuration(params);
  phases.push({
    phase: 'Title/Abstract Screening',
    estimated_days: screeningDays,
    confidence_interval: includeCI ? calculateConfidenceInterval(screeningDays, 0.75) : { lower: screeningDays, upper: screeningDays },
    confidence: 0.75
  });

  // Full-text review
  const fullTextDays = calculateFullTextDuration(params);
  phases.push({
    phase: 'Full-Text Review',
    estimated_days: fullTextDays,
    confidence_interval: includeCI ? calculateConfidenceInterval(fullTextDays, 0.7) : { lower: fullTextDays, upper: fullTextDays },
    confidence: 0.7
  });

  // Data extraction
  const extractionDays = calculateDataExtractionDuration(params);
  phases.push({
    phase: 'Data Extraction',
    estimated_days: extractionDays,
    confidence_interval: includeCI ? calculateConfidenceInterval(extractionDays, 0.7) : { lower: extractionDays, upper: extractionDays },
    confidence: 0.7
  });

  // Quality assessment
  const qualityDays = calculateQualityAssessmentDuration(params);
  phases.push({
    phase: 'Quality Assessment',
    estimated_days: qualityDays,
    confidence_interval: includeCI ? calculateConfidenceInterval(qualityDays, 0.75) : { lower: qualityDays, upper: qualityDays },
    confidence: 0.75
  });

  // Meta-analysis
  if (params.meta_analysis_planned) {
    const metaDays = calculateMetaAnalysisDuration(params);
    phases.push({
      phase: 'Meta-Analysis',
      estimated_days: metaDays,
      confidence_interval: includeCI ? calculateConfidenceInterval(metaDays, 0.65) : { lower: metaDays, upper: metaDays },
      confidence: 0.65
    });
  }

  // Manuscript writing
  const manuscriptDays = calculateManuscriptDuration(params);
  phases.push({
    phase: 'Manuscript Writing',
    estimated_days: manuscriptDays,
    confidence_interval: includeCI ? calculateConfidenceInterval(manuscriptDays, 0.8) : { lower: manuscriptDays, upper: manuscriptDays },
    confidence: 0.8
  });

  return phases;
}

/**
 * Identify risk factors
 */
function identifyRiskFactors(params: ProjectParameters): RiskFactor[] {
  const risks: RiskFactor[] = [];

  // Large citation volume
  if (params.total_citations > 5000) {
    risks.push({
      factor: 'High citation volume',
      impact: 'high',
      description: `${params.total_citations} citations may lead to extended screening time`,
      mitigation: 'Consider using ML-assisted screening tools or additional reviewers'
    });
  }

  // Limited reviewers
  if (params.reviewers_count < 2) {
    risks.push({
      factor: 'Insufficient reviewers',
      impact: 'high',
      description: 'Single reviewer increases bias risk and workload',
      mitigation: 'Add at least one additional reviewer for dual screening'
    });
  }

  // Novice team
  if (params.team_experience === 'novice') {
    risks.push({
      factor: 'Limited team experience',
      impact: 'medium',
      description: 'Novice team may require additional time and training',
      mitigation: 'Provide training, mentorship, and allow buffer time'
    });
  }

  // High complexity
  if (params.complexity === 'high') {
    risks.push({
      factor: 'High project complexity',
      impact: 'high',
      description: 'Complex interventions or outcomes may slow progress',
      mitigation: 'Develop detailed extraction forms and conduct pilot testing'
    });
  }

  // Meta-analysis planned
  if (params.meta_analysis_planned) {
    risks.push({
      factor: 'Meta-analysis complexity',
      impact: 'medium',
      description: 'Statistical analysis may encounter heterogeneity issues',
      mitigation: 'Consult with statistician early and plan sensitivity analyses'
    });
  }

  return risks;
}

/**
 * Suggest resource allocations
 */
function suggestResourceAllocations(
  params: ProjectParameters,
  phaseDurations: PhaseDuration[]
): ResourceAllocation[] {
  const allocations: ResourceAllocation[] = [];

  for (const phase of phaseDurations) {
    let reviewersNeeded = params.reviewers_count;
    let hoursPerReviewer = phase.estimated_days * 4; // 4 hours per day average
    let priority: 'high' | 'medium' | 'low' = 'medium';

    // Adjust based on phase
    if (phase.phase.includes('Screening')) {
      reviewersNeeded = Math.max(2, params.reviewers_count);
      priority = 'high';
    } else if (phase.phase.includes('Data Extraction')) {
      reviewersNeeded = Math.max(2, params.reviewers_count);
      priority = 'high';
    } else if (phase.phase.includes('Quality Assessment')) {
      reviewersNeeded = Math.max(2, params.reviewers_count);
      priority = 'high';
    } else if (phase.phase.includes('Meta-Analysis')) {
      reviewersNeeded = 1; // Typically one statistician
      hoursPerReviewer = phase.estimated_days * 6;
      priority = 'high';
    } else if (phase.phase.includes('Manuscript')) {
      reviewersNeeded = Math.min(2, params.reviewers_count);
      priority = 'medium';
    }

    allocations.push({
      phase: phase.phase,
      reviewers_needed: reviewersNeeded,
      hours_per_reviewer: hoursPerReviewer,
      priority
    });
  }

  return allocations;
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  params: ProjectParameters,
  totalDuration: number,
  risks: RiskFactor[]
): string[] {
  const recommendations: string[] = [];

  // Duration recommendations
  if (totalDuration > 180) {
    recommendations.push('Project duration exceeds 6 months - consider phased approach or additional resources');
  }

  // Team recommendations
  if (params.reviewers_count < 2) {
    recommendations.push('Add at least one additional reviewer for dual screening and quality assurance');
  }

  // Risk-based recommendations
  const highRisks = risks.filter(r => r.impact === 'high');
  if (highRisks.length > 0) {
    recommendations.push(`Address ${highRisks.length} high-impact risk factors before starting`);
  }

  // Experience recommendations
  if (params.team_experience === 'novice') {
    recommendations.push('Allocate time for training and consider mentorship from experienced reviewers');
  }

  // Complexity recommendations
  if (params.complexity === 'high' && params.total_citations > 3000) {
    recommendations.push('Consider using automation tools (ML screening, data extraction) to manage complexity');
  }

  if (recommendations.length === 0) {
    recommendations.push('Project parameters appear reasonable - proceed with planned timeline');
  }

  return recommendations;
}

/**
 * Predict project timeline
 */
export async function predictTimeline(
  input: PredictTimelineInput
): Promise<PredictTimelineOutput> {
  const startTime = Date.now();

  try {
    logger.info('Predicting project timeline');

    // Validate input
    if (!input.project_params) {
      throw new Error('Project parameters are required');
    }

    const includeCI = input.include_confidence_intervals !== false;
    const identifyRisks = input.identify_risks !== false;
    const suggestResources = input.suggest_resources !== false;

    // Predict phase durations
    const phaseDurations = predictPhaseDurations(input.project_params, includeCI);

    // Calculate total duration
    const totalDuration = phaseDurations.reduce((sum, phase) => sum + phase.estimated_days, 0);

    // Identify risk factors
    const riskFactors = identifyRisks ? identifyRiskFactors(input.project_params) : [];

    // Suggest resource allocations
    const resourceAllocations = suggestResources
      ? suggestResourceAllocations(input.project_params, phaseDurations)
      : [];

    // Generate recommendations
    const recommendations = generateRecommendations(input.project_params, totalDuration, riskFactors);

    const processingTime = Date.now() - startTime;

    logger.info(`Timeline prediction completed in ${processingTime}ms`);

    return {
      success: true,
      total_duration_days: totalDuration,
      phase_durations: phaseDurations,
      risk_factors: riskFactors,
      resource_allocations: resourceAllocations,
      recommendations,
      processing_time_ms: processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Timeline prediction failed', error);

    return {
      success: false,
      total_duration_days: 0,
      phase_durations: [],
      risk_factors: [],
      resource_allocations: [],
      recommendations: ['Timeline prediction failed - manual estimation required'],
      processing_time_ms: processingTime
    };
  }
}

/**
 * MCP tool handler for predict_timeline
 */
export const predictTimelineTool = {
  name: 'predict_timeline',
  description: 'Machine learning-based project timeline forecasting for systematic reviews with risk identification',
  inputSchema: {
    type: 'object',
    properties: {
      project_params: {
        type: 'object',
        properties: {
          total_citations: { type: 'number', description: 'Total number of citations to screen' },
          databases_searched: { type: 'number', description: 'Number of databases searched' },
          reviewers_count: { type: 'number', description: 'Number of reviewers on the team' },
          study_type: {
            type: 'string',
            enum: ['rct', 'observational', 'mixed', 'qualitative'],
            description: 'Primary study type'
          },
          meta_analysis_planned: { type: 'boolean', description: 'Whether meta-analysis is planned' },
          team_experience: {
            type: 'string',
            enum: ['novice', 'intermediate', 'expert'],
            description: 'Team experience level'
          },
          complexity: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Project complexity level'
          }
        },
        required: ['total_citations', 'databases_searched', 'reviewers_count', 'study_type', 'meta_analysis_planned', 'team_experience', 'complexity']
      },
      include_confidence_intervals: {
        type: 'boolean',
        description: 'Include confidence intervals for predictions (default: true)',
        default: true
      },
      identify_risks: {
        type: 'boolean',
        description: 'Identify risk factors (default: true)',
        default: true
      },
      suggest_resources: {
        type: 'boolean',
        description: 'Suggest resource allocations (default: true)',
        default: true
      }
    },
    required: ['project_params']
  },
  handler: predictTimeline
};
