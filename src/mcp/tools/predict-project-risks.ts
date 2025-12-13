/**
 * Project Risk Predictor
 * 
 * Predicts potential risks for systematic review projects and provides
 * mitigation strategies. Uses historical patterns, project characteristics,
 * and team capabilities to identify risks early.
 * 
 * Features:
 * - Risk identification across multiple categories
 * - Probability and impact assessment
 * - Mitigation strategy recommendations
 * - Early warning system
 * - Risk monitoring and tracking
 * - Contingency planning
 * 
 * @module predict-project-risks
 * @version 1.0.0
 */

import { logger } from '../../common/logger.js';

/**
 * Risk category types
 */
export type RiskCategory =
  | 'timeline'
  | 'resource'
  | 'quality'
  | 'scope'
  | 'technical'
  | 'stakeholder'
  | 'data'
  | 'regulatory';

/**
 * Risk severity levels
 */
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Risk probability levels
 */
export type RiskProbability = 'unlikely' | 'possible' | 'likely' | 'very_likely';

/**
 * Project phase
 */
export type ProjectPhase =
  | 'planning'
  | 'search'
  | 'screening'
  | 'extraction'
  | 'quality_assessment'
  | 'analysis'
  | 'writing'
  | 'review';

/**
 * Project characteristics for risk assessment
 */
export interface ProjectCharacteristics {
  project_id: string;
  project_name: string;
  research_type: 'intervention' | 'diagnostic' | 'prognostic' | 'qualitative' | 'mixed' | 'scoping';
  current_phase: ProjectPhase;
  team_size: number;
  team_experience_level: 'junior' | 'mixed' | 'senior' | 'expert';
  estimated_duration_weeks: number;
  deadline?: string;
  budget_available: boolean;
  expected_study_count: number;
  databases_to_search: number;
  has_protocol: boolean;
  has_registration: boolean;
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  previous_delays?: number; // days delayed so far
  resource_constraints?: string[];
}

/**
 * Identified risk
 */
export interface IdentifiedRisk {
  id: string;
  category: RiskCategory;
  title: string;
  description: string;
  probability: RiskProbability;
  impact: RiskSeverity;
  risk_score: number; // 1-100
  triggers: string[]; // Warning signs
  consequences: string[];
  affected_phases: ProjectPhase[];
  mitigation_strategies: {
    strategy: string;
    effort: 'low' | 'medium' | 'high';
    effectiveness: 'low' | 'medium' | 'high';
    timeline: string;
  }[];
  contingency_plan?: string;
  monitoring_metrics: string[];
}

/**
 * Risk prediction input
 */
export interface PredictProjectRisksInput {
  project_characteristics: ProjectCharacteristics;
  include_historical_analysis?: boolean;
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive';
}

/**
 * Risk prediction output
 */
export interface PredictProjectRisksOutput {
  success: boolean;
  project_id: string;
  project_name: string;
  assessment_date: string;
  overall_risk_level: RiskSeverity;
  overall_risk_score: number; // 0-100
  total_risks_identified: number;
  risks: IdentifiedRisk[];
  risk_summary: {
    by_category: Record<RiskCategory, number>;
    by_severity: Record<RiskSeverity, number>;
    by_probability: Record<RiskProbability, number>;
  };
  critical_risks: IdentifiedRisk[];
  immediate_actions: string[];
  monitoring_plan: {
    metric: string;
    frequency: string;
    threshold: string;
    action: string;
  }[];
  recommendations: string[];
  message: string;
  error?: string;
}

/**
 * Predict project risks
 */
export async function predictProjectRisks(
  input: PredictProjectRisksInput
): Promise<PredictProjectRisksOutput> {
  try {
    logger.info('Predicting project risks', {
      project_id: input.project_characteristics.project_id,
      phase: input.project_characteristics.current_phase,
      complexity: input.project_characteristics.complexity,
    });

    const risks: IdentifiedRisk[] = [];
    let riskIdCounter = 1;

    // Identify timeline risks
    risks.push(...identifyTimelineRisks(input.project_characteristics, riskIdCounter));
    riskIdCounter += risks.length;

    // Identify resource risks
    risks.push(...identifyResourceRisks(input.project_characteristics, riskIdCounter));
    riskIdCounter = riskIdCounter + 10;

    // Identify quality risks
    risks.push(...identifyQualityRisks(input.project_characteristics, riskIdCounter));
    riskIdCounter = riskIdCounter + 10;

    // Identify scope risks
    risks.push(...identifyScopeRisks(input.project_characteristics, riskIdCounter));
    riskIdCounter = riskIdCounter + 10;

    // Identify technical risks
    risks.push(...identifyTechnicalRisks(input.project_characteristics, riskIdCounter));
    riskIdCounter = riskIdCounter + 10;

    // Identify data risks
    risks.push(...identifyDataRisks(input.project_characteristics, riskIdCounter));

    // Calculate risk scores
    risks.forEach(risk => {
      risk.risk_score = calculateRiskScore(risk.probability, risk.impact);
    });

    // Sort by risk score (highest first)
    risks.sort((a, b) => b.risk_score - a.risk_score);

    // Calculate overall risk level
    const overallRiskScore = calculateOverallRiskScore(risks);
    const overallRiskLevel = getRiskSeverityFromScore(overallRiskScore);

    // Get critical risks
    const criticalRisks = risks.filter(r => r.impact === 'critical' || r.risk_score >= 75);

    // Generate risk summary
    const riskSummary = generateRiskSummary(risks);

    // Generate immediate actions
    const immediateActions = generateImmediateActions(criticalRisks, input.project_characteristics);

    // Generate monitoring plan
    const monitoringPlan = generateMonitoringPlan(risks, input.project_characteristics);

    // Generate recommendations
    const recommendations = generateRecommendations(
      risks,
      input.project_characteristics,
      input.risk_tolerance || 'moderate'
    );

    logger.info('Risk prediction complete', {
      project_id: input.project_characteristics.project_id,
      total_risks: risks.length,
      critical_risks: criticalRisks.length,
      overall_risk_score: overallRiskScore,
    });

    return {
      success: true,
      project_id: input.project_characteristics.project_id,
      project_name: input.project_characteristics.project_name,
      assessment_date: new Date().toISOString(),
      overall_risk_level: overallRiskLevel,
      overall_risk_score: overallRiskScore,
      total_risks_identified: risks.length,
      risks,
      risk_summary: riskSummary,
      critical_risks: criticalRisks,
      immediate_actions: immediateActions,
      monitoring_plan: monitoringPlan,
      recommendations,
      message: `Identified ${risks.length} potential risks (${criticalRisks.length} critical) for ${input.project_characteristics.project_name}`,
    };
  } catch (error) {
    logger.error('Risk prediction failed', { error });
    throw error;
  }
}

/**
 * Identify timeline risks
 */
function identifyTimelineRisks(
  project: ProjectCharacteristics,
  startId: number
): IdentifiedRisk[] {
  const risks: IdentifiedRisk[] = [];

  // Risk: Unrealistic timeline
  if (project.estimated_duration_weeks < 12 && project.complexity !== 'simple') {
    risks.push({
      id: `RISK-${startId}`,
      category: 'timeline',
      title: 'Unrealistic Project Timeline',
      description: `Estimated duration of ${project.estimated_duration_weeks} weeks may be insufficient for a ${project.complexity} systematic review`,
      probability: 'very_likely',
      impact: 'high',
      risk_score: 0,
      triggers: [
        'Phases taking longer than planned',
        'Team members reporting time pressure',
        'Quality compromises to meet deadlines',
      ],
      consequences: [
        'Missed deadline',
        'Rushed analysis leading to errors',
        'Incomplete literature search',
        'Poor quality output',
      ],
      affected_phases: ['search', 'screening', 'extraction', 'analysis'],
      mitigation_strategies: [
        {
          strategy: 'Extend project timeline by 4-8 weeks',
          effort: 'low',
          effectiveness: 'high',
          timeline: 'Immediate',
        },
        {
          strategy: 'Increase team size to parallelize work',
          effort: 'medium',
          effectiveness: 'high',
          timeline: '1-2 weeks',
        },
        {
          strategy: 'Reduce scope to focus on most critical outcomes',
          effort: 'medium',
          effectiveness: 'medium',
          timeline: 'Immediate',
        },
      ],
      contingency_plan: 'If deadline cannot be extended, prioritize core outcomes and plan for phased delivery',
      monitoring_metrics: [
        'Actual vs. planned progress per phase',
        'Team workload and overtime hours',
        'Quality metrics (errors, revisions needed)',
      ],
    });
  }

  // Risk: Approaching deadline with delays
  if (project.previous_delays && project.previous_delays > 7) {
    risks.push({
      id: `RISK-${startId + 1}`,
      category: 'timeline',
      title: 'Cumulative Project Delays',
      description: `Project is already ${project.previous_delays} days behind schedule`,
      probability: 'very_likely',
      impact: project.previous_delays > 30 ? 'critical' : 'high',
      risk_score: 0,
      triggers: [
        'Continued delays in current phase',
        'New unexpected issues arising',
        'Resource unavailability',
      ],
      consequences: [
        'Missed final deadline',
        'Stakeholder dissatisfaction',
        'Budget overruns',
        'Team burnout',
      ],
      affected_phases: [project.current_phase, 'analysis', 'writing'],
      mitigation_strategies: [
        {
          strategy: 'Conduct immediate project recovery planning session',
          effort: 'low',
          effectiveness: 'high',
          timeline: 'This week',
        },
        {
          strategy: 'Identify and remove non-critical tasks',
          effort: 'medium',
          effectiveness: 'high',
          timeline: 'Immediate',
        },
        {
          strategy: 'Add temporary resources to critical path activities',
          effort: 'high',
          effectiveness: 'high',
          timeline: '1-2 weeks',
        },
      ],
      contingency_plan: 'Negotiate deadline extension with stakeholders or deliver minimum viable product',
      monitoring_metrics: [
        'Daily progress tracking',
        'Burn-down chart',
        'Critical path analysis',
      ],
    });
  }

  return risks;
}

/**
 * Identify resource risks
 */
function identifyResourceRisks(
  project: ProjectCharacteristics,
  startId: number
): IdentifiedRisk[] {
  const risks: IdentifiedRisk[] = [];

  // Risk: Insufficient team size
  if (project.team_size < 3 && project.expected_study_count > 50) {
    risks.push({
      id: `RISK-${startId}`,
      category: 'resource',
      title: 'Insufficient Team Capacity',
      description: `Team of ${project.team_size} may struggle with ${project.expected_study_count} expected studies`,
      probability: 'likely',
      impact: 'high',
      risk_score: 0,
      triggers: [
        'Team members working overtime consistently',
        'Screening and extraction falling behind',
        'Quality issues due to fatigue',
      ],
      consequences: [
        'Project delays',
        'Team burnout',
        'High error rates',
        'Team member attrition',
      ],
      affected_phases: ['screening', 'extraction', 'quality_assessment'],
      mitigation_strategies: [
        {
          strategy: 'Recruit additional screeners and data extractors',
          effort: 'high',
          effectiveness: 'high',
          timeline: '2-4 weeks',
        },
        {
          strategy: 'Implement ML-assisted screening to reduce workload',
          effort: 'medium',
          effectiveness: 'medium',
          timeline: '1 week',
        },
        {
          strategy: 'Negotiate timeline extension',
          effort: 'low',
          effectiveness: 'medium',
          timeline: 'Immediate',
        },
      ],
      contingency_plan: 'Reduce scope or use single-reviewer screening with verification sampling',
      monitoring_metrics: [
        'Team utilization percentage',
        'Overtime hours per week',
        'Task completion velocity',
      ],
    });
  }

  // Risk: Inexperienced team
  if (project.team_experience_level === 'junior' && project.complexity !== 'simple') {
    risks.push({
      id: `RISK-${startId + 1}`,
      category: 'resource',
      title: 'Team Experience Gap',
      description: 'Junior team may lack experience for complex systematic review',
      probability: 'likely',
      impact: 'medium',
      risk_score: 0,
      triggers: [
        'Frequent questions about methodology',
        'Errors in screening or extraction',
        'Difficulty with statistical analysis',
      ],
      consequences: [
        'Quality issues',
        'Rework and delays',
        'Methodological errors',
        'Reduced confidence in results',
      ],
      affected_phases: ['planning', 'search', 'extraction', 'analysis'],
      mitigation_strategies: [
        {
          strategy: 'Engage experienced systematic review consultant',
          effort: 'medium',
          effectiveness: 'high',
          timeline: '1-2 weeks',
        },
        {
          strategy: 'Provide intensive training on systematic review methods',
          effort: 'medium',
          effectiveness: 'medium',
          timeline: '1 week',
        },
        {
          strategy: 'Implement peer review and double-checking processes',
          effort: 'low',
          effectiveness: 'medium',
          timeline: 'Immediate',
        },
      ],
      contingency_plan: 'Partner with experienced research group or hire senior researcher',
      monitoring_metrics: [
        'Error rates in screening and extraction',
        'Inter-rater reliability scores',
        'Time spent on rework',
      ],
    });
  }

  return risks;
}

/**
 * Identify quality risks
 */
function identifyQualityRisks(
  project: ProjectCharacteristics,
  startId: number
): IdentifiedRisk[] {
  const risks: IdentifiedRisk[] = [];

  // Risk: No protocol
  if (!project.has_protocol) {
    risks.push({
      id: `RISK-${startId}`,
      category: 'quality',
      title: 'Missing Study Protocol',
      description: 'Conducting systematic review without a pre-defined protocol',
      probability: 'very_likely',
      impact: 'high',
      risk_score: 0,
      triggers: [
        'Inconsistent methodology decisions',
        'Scope creep',
        'Difficulty justifying methods',
      ],
      consequences: [
        'Methodological bias',
        'Reduced credibility',
        'Difficulty publishing',
        'Inconsistent decision-making',
      ],
      affected_phases: ['planning', 'search', 'screening', 'extraction'],
      mitigation_strategies: [
        {
          strategy: 'Develop and register protocol immediately (PROSPERO)',
          effort: 'medium',
          effectiveness: 'high',
          timeline: '1-2 weeks',
        },
        {
          strategy: 'Document all methodology decisions retrospectively',
          effort: 'low',
          effectiveness: 'low',
          timeline: 'Ongoing',
        },
      ],
      contingency_plan: 'Clearly document all deviations and justify in methods section',
      monitoring_metrics: [
        'Protocol completion status',
        'Methodology consistency checks',
      ],
    });
  }

  // Risk: No registration
  if (!project.has_registration && project.research_type === 'intervention') {
    risks.push({
      id: `RISK-${startId + 1}`,
      category: 'quality',
      title: 'Unregistered Systematic Review',
      description: 'Intervention review not registered in PROSPERO or similar registry',
      probability: 'very_likely',
      impact: 'medium',
      risk_score: 0,
      triggers: [
        'Journal submission requirements',
        'Peer reviewer concerns',
        'Funding agency requirements',
      ],
      consequences: [
        'Publication rejection',
        'Reduced credibility',
        'Perceived bias',
        'Funding issues',
      ],
      affected_phases: ['planning'],
      mitigation_strategies: [
        {
          strategy: 'Register protocol in PROSPERO immediately',
          effort: 'low',
          effectiveness: 'high',
          timeline: '1 week',
        },
        {
          strategy: 'Document reasons for late registration',
          effort: 'low',
          effectiveness: 'low',
          timeline: 'Immediate',
        },
      ],
      contingency_plan: 'Acknowledge limitation in manuscript and justify timing',
      monitoring_metrics: ['Registration status'],
    });
  }

  return risks;
}

/**
 * Identify scope risks
 */
function identifyScopeRisks(
  project: ProjectCharacteristics,
  startId: number
): IdentifiedRisk[] {
  const risks: IdentifiedRisk[] = [];

  // Risk: Too many databases
  if (project.databases_to_search > 10) {
    risks.push({
      id: `RISK-${startId}`,
      category: 'scope',
      title: 'Excessive Database Searches',
      description: `Planning to search ${project.databases_to_search} databases may be excessive`,
      probability: 'likely',
      impact: 'medium',
      risk_score: 0,
      triggers: [
        'Search taking longer than planned',
        'Massive number of duplicates',
        'Diminishing returns from additional databases',
      ],
      consequences: [
        'Timeline delays',
        'Increased workload',
        'Resource waste',
        'Duplicate management challenges',
      ],
      affected_phases: ['search', 'screening'],
      mitigation_strategies: [
        {
          strategy: 'Focus on 4-6 core databases with highest yield',
          effort: 'low',
          effectiveness: 'high',
          timeline: 'Immediate',
        },
        {
          strategy: 'Use supplementary searches (citation tracking, grey literature) instead',
          effort: 'low',
          effectiveness: 'medium',
          timeline: 'Immediate',
        },
      ],
      contingency_plan: 'Prioritize databases and search sequentially, stopping when saturation reached',
      monitoring_metrics: [
        'Unique studies per database',
        'Incremental yield per database',
      ],
    });
  }

  return risks;
}

/**
 * Identify technical risks
 */
function identifyTechnicalRisks(
  project: ProjectCharacteristics,
  startId: number
): IdentifiedRisk[] {
  const risks: IdentifiedRisk[] = [];

  // Risk: Complex statistical analysis
  if (project.research_type === 'intervention' && project.team_experience_level !== 'expert') {
    risks.push({
      id: `RISK-${startId}`,
      category: 'technical',
      title: 'Statistical Analysis Complexity',
      description: 'Meta-analysis may require advanced statistical expertise',
      probability: 'possible',
      impact: 'medium',
      risk_score: 0,
      triggers: [
        'High heterogeneity in results',
        'Need for network meta-analysis',
        'Complex subgroup analyses required',
      ],
      consequences: [
        'Incorrect statistical methods',
        'Misinterpretation of results',
        'Publication rejection',
        'Project delays',
      ],
      affected_phases: ['analysis'],
      mitigation_strategies: [
        {
          strategy: 'Engage biostatistician early in project',
          effort: 'medium',
          effectiveness: 'high',
          timeline: 'Before analysis phase',
        },
        {
          strategy: 'Use validated statistical software (RevMan, R packages)',
          effort: 'low',
          effectiveness: 'medium',
          timeline: 'Immediate',
        },
        {
          strategy: 'Plan for statistical peer review before submission',
          effort: 'low',
          effectiveness: 'high',
          timeline: 'Analysis phase',
        },
      ],
      contingency_plan: 'Conduct narrative synthesis if meta-analysis not feasible',
      monitoring_metrics: [
        'Statistical analysis plan completion',
        'Heterogeneity levels',
      ],
    });
  }

  return risks;
}

/**
 * Identify data risks
 */
function identifyDataRisks(
  project: ProjectCharacteristics,
  startId: number
): IdentifiedRisk[] {
  const risks: IdentifiedRisk[] = [];

  // Risk: High expected study count
  if (project.expected_study_count > 100) {
    risks.push({
      id: `RISK-${startId}`,
      category: 'data',
      title: 'Large Volume of Studies',
      description: `Expected ${project.expected_study_count} studies may be difficult to manage`,
      probability: 'likely',
      impact: 'medium',
      risk_score: 0,
      triggers: [
        'Screening backlog building up',
        'Data extraction taking longer than planned',
        'Quality assessment falling behind',
      ],
      consequences: [
        'Timeline delays',
        'Team fatigue',
        'Increased error rates',
        'Data management challenges',
      ],
      affected_phases: ['screening', 'extraction', 'quality_assessment'],
      mitigation_strategies: [
        {
          strategy: 'Implement ML-assisted screening and prioritization',
          effort: 'medium',
          effectiveness: 'high',
          timeline: '1 week',
        },
        {
          strategy: 'Use systematic review management software (Covidence, DistillerSR)',
          effort: 'low',
          effectiveness: 'high',
          timeline: 'Immediate',
        },
        {
          strategy: 'Increase team size for screening and extraction',
          effort: 'high',
          effectiveness: 'high',
          timeline: '2-4 weeks',
        },
      ],
      contingency_plan: 'Implement sampling strategy or focus on most recent/highest quality studies',
      monitoring_metrics: [
        'Screening velocity (studies/day)',
        'Extraction completion rate',
        'Error rates',
      ],
    });
  }

  return risks;
}

/**
 * Calculate risk score from probability and impact
 */
function calculateRiskScore(probability: RiskProbability, impact: RiskSeverity): number {
  const probabilityScores: Record<RiskProbability, number> = {
    unlikely: 25,
    possible: 50,
    likely: 75,
    very_likely: 100,
  };

  const impactScores: Record<RiskSeverity, number> = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 100,
  };

  return Math.round((probabilityScores[probability] + impactScores[impact]) / 2);
}

/**
 * Calculate overall risk score
 */
function calculateOverallRiskScore(risks: IdentifiedRisk[]): number {
  if (risks.length === 0) return 0;

  // Weight critical risks more heavily
  const weightedSum = risks.reduce((sum, risk) => {
    const weight = risk.impact === 'critical' ? 2 : 1;
    return sum + risk.risk_score * weight;
  }, 0);

  const totalWeight = risks.reduce((sum, risk) => {
    return sum + (risk.impact === 'critical' ? 2 : 1);
  }, 0);

  return Math.round(weightedSum / totalWeight);
}

/**
 * Get risk severity from score
 */
function getRiskSeverityFromScore(score: number): RiskSeverity {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

/**
 * Generate risk summary
 */
function generateRiskSummary(risks: IdentifiedRisk[]): PredictProjectRisksOutput['risk_summary'] {
  const summary: PredictProjectRisksOutput['risk_summary'] = {
    by_category: {
      timeline: 0,
      resource: 0,
      quality: 0,
      scope: 0,
      technical: 0,
      stakeholder: 0,
      data: 0,
      regulatory: 0,
    },
    by_severity: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    by_probability: {
      unlikely: 0,
      possible: 0,
      likely: 0,
      very_likely: 0,
    },
  };

  risks.forEach(risk => {
    summary.by_category[risk.category]++;
    summary.by_severity[risk.impact]++;
    summary.by_probability[risk.probability]++;
  });

  return summary;
}

/**
 * Generate immediate actions
 */
function generateImmediateActions(
  criticalRisks: IdentifiedRisk[],
  _project: ProjectCharacteristics
): string[] {
  const actions: string[] = [];

  criticalRisks.forEach(risk => {
    // Get highest effectiveness, lowest effort mitigation
    const bestMitigation = risk.mitigation_strategies
      .filter(m => m.effectiveness === 'high')
      .sort((a, b) => {
        const effortOrder = { low: 1, medium: 2, high: 3 };
        return effortOrder[a.effort] - effortOrder[b.effort];
      })[0];

    if (bestMitigation) {
      actions.push(`${risk.title}: ${bestMitigation.strategy} (${bestMitigation.timeline})`);
    }
  });

  return actions;
}

/**
 * Generate monitoring plan
 */
function generateMonitoringPlan(
  risks: IdentifiedRisk[],
  _project: ProjectCharacteristics
): PredictProjectRisksOutput['monitoring_plan'] {
  const plan: PredictProjectRisksOutput['monitoring_plan'] = [];

  // Get unique monitoring metrics from high and critical risks
  const highRisks = risks.filter(r => r.impact === 'high' || r.impact === 'critical');
  const metrics = new Set<string>();

  highRisks.forEach(risk => {
    risk.monitoring_metrics.forEach(metric => metrics.add(metric));
  });

  metrics.forEach(metric => {
    plan.push({
      metric,
      frequency: 'Weekly',
      threshold: 'Deviation > 10% from plan',
      action: 'Escalate to project lead and implement mitigation',
    });
  });

  return plan;
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  risks: IdentifiedRisk[],
  project: ProjectCharacteristics,
  riskTolerance: string
): string[] {
  const recommendations: string[] = [];

  const criticalCount = risks.filter(r => r.impact === 'critical').length;
  const highCount = risks.filter(r => r.impact === 'high').length;

  if (criticalCount > 0) {
    recommendations.push(
      `URGENT: ${criticalCount} critical risk(s) identified. Immediate action required to prevent project failure.`
    );
  }

  if (highCount > 2) {
    recommendations.push(
      `${highCount} high-severity risks detected. Consider risk mitigation workshop with full team.`
    );
  }

  if (!project.has_protocol) {
    recommendations.push('Develop and register study protocol as highest priority.');
  }

  if (project.team_size < 3 && project.expected_study_count > 50) {
    recommendations.push('Increase team size or reduce scope to manageable level.');
  }

  if (riskTolerance === 'conservative') {
    recommendations.push('Given conservative risk tolerance, implement all high-effectiveness mitigation strategies.');
  }

  recommendations.push('Schedule weekly risk review meetings to monitor emerging risks.');
  recommendations.push('Maintain risk register and update after each project phase.');

  return recommendations;
}
