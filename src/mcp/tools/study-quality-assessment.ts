/**
 * Study Quality Assessment Tool
 * 
 * Automated risk of bias assessment using Cochrane Risk of Bias 2.0 (RoB 2.0) and GRADE.
 * Evaluates study quality across multiple domains with evidence-based scoring.
 * 
 * @module study-quality-assessment
 * @version 1.0.0
 * @since 5.1.0
 */

import { logger } from '../../common/logger.js';

/**
 * Risk of Bias 2.0 domain assessment
 */
export interface RoB2Domain {
  domain: string;
  rating: 'low' | 'some_concerns' | 'high';
  justification: string;
  confidence: number;
}

/**
 * Complete RoB 2.0 assessment
 */
export interface RoB2Assessment {
  overall_rating: 'low' | 'some_concerns' | 'high';
  domains: RoB2Domain[];
  summary: string;
}

/**
 * GRADE quality assessment
 */
export interface GRADEAssessment {
  quality: 'high' | 'moderate' | 'low' | 'very_low';
  factors: {
    risk_of_bias: number;
    inconsistency: number;
    indirectness: number;
    imprecision: number;
    publication_bias: number;
  };
  summary: string;
}

/**
 * Study quality assessment input
 */
export interface AssessStudyQualityInput {
  study_text: string;
  study_type: 'rct' | 'cohort' | 'case_control' | 'cross_sectional' | 'systematic_review';
  assess_rob2?: boolean;
  assess_grade?: boolean;
  detect_bias?: boolean;
}

/**
 * Study quality assessment output
 */
export interface AssessStudyQualityOutput {
  success: boolean;
  study_type: string;
  rob2_assessment?: RoB2Assessment;
  grade_assessment?: GRADEAssessment;
  bias_indicators: string[];
  quality_score: number;
  recommendations: string[];
  processing_time_ms: number;
}

/**
 * Assess randomization process (RoB 2.0 Domain 1)
 */
function assessRandomization(text: string): RoB2Domain {
  const keywords = {
    low: ['random sequence generation', 'computer-generated', 'random number table', 'allocation concealment', 'sealed envelopes'],
    high: ['quasi-random', 'alternation', 'date of birth', 'hospital number', 'no randomization']
  };

  let lowCount = 0;
  let highCount = 0;

  for (const keyword of keywords.low) {
    if (text.toLowerCase().includes(keyword)) lowCount++;
  }

  for (const keyword of keywords.high) {
    if (text.toLowerCase().includes(keyword)) highCount++;
  }

  let rating: 'low' | 'some_concerns' | 'high';
  let justification: string;
  let confidence: number;

  if (highCount > 0) {
    rating = 'high';
    justification = 'Inadequate randomization method detected';
    confidence = 0.8;
  } else if (lowCount >= 2) {
    rating = 'low';
    justification = 'Adequate randomization and allocation concealment';
    confidence = 0.9;
  } else if (lowCount === 1) {
    rating = 'some_concerns';
    justification = 'Randomization mentioned but details unclear';
    confidence = 0.6;
  } else {
    rating = 'some_concerns';
    justification = 'No clear information about randomization';
    confidence = 0.5;
  }

  return {
    domain: 'Randomization process',
    rating,
    justification,
    confidence
  };
}

/**
 * Assess deviations from intended interventions (RoB 2.0 Domain 2)
 */
function assessDeviations(text: string): RoB2Domain {
  const keywords = {
    low: ['intention-to-treat', 'ITT analysis', 'per-protocol', 'no deviations', 'protocol adherence'],
    high: ['protocol violations', 'crossover', 'contamination', 'non-adherence']
  };

  let lowCount = 0;
  let highCount = 0;

  for (const keyword of keywords.low) {
    if (text.toLowerCase().includes(keyword)) lowCount++;
  }

  for (const keyword of keywords.high) {
    if (text.toLowerCase().includes(keyword)) highCount++;
  }

  let rating: 'low' | 'some_concerns' | 'high';
  let justification: string;
  let confidence: number;

  if (highCount > 0) {
    rating = 'high';
    justification = 'Significant protocol deviations detected';
    confidence = 0.8;
  } else if (lowCount >= 1) {
    rating = 'low';
    justification = 'Appropriate analysis and minimal deviations';
    confidence = 0.8;
  } else {
    rating = 'some_concerns';
    justification = 'Unclear information about protocol adherence';
    confidence = 0.5;
  }

  return {
    domain: 'Deviations from intended interventions',
    rating,
    justification,
    confidence
  };
}

/**
 * Assess missing outcome data (RoB 2.0 Domain 3)
 */
function assessMissingData(text: string): RoB2Domain {
  const keywords = {
    low: ['no missing data', 'complete follow-up', 'all participants analyzed', 'no dropouts'],
    high: ['high attrition', 'lost to follow-up', 'missing data', 'incomplete outcome']
  };

  let lowCount = 0;
  let highCount = 0;

  // Check for dropout rates
  const dropoutMatch = text.match(/(\d+)%?\s+(?:dropout|attrition|lost to follow-up)/i);
  if (dropoutMatch) {
    const rate = parseInt(dropoutMatch[1]);
    if (rate > 20) highCount += 2;
    else if (rate > 10) highCount += 1;
    else lowCount += 1;
  }

  for (const keyword of keywords.low) {
    if (text.toLowerCase().includes(keyword)) lowCount++;
  }

  for (const keyword of keywords.high) {
    if (text.toLowerCase().includes(keyword)) highCount++;
  }

  let rating: 'low' | 'some_concerns' | 'high';
  let justification: string;
  let confidence: number;

  if (highCount >= 2) {
    rating = 'high';
    justification = 'Substantial missing outcome data';
    confidence = 0.8;
  } else if (lowCount >= 1) {
    rating = 'low';
    justification = 'Complete or near-complete outcome data';
    confidence = 0.8;
  } else {
    rating = 'some_concerns';
    justification = 'Unclear information about missing data';
    confidence = 0.5;
  }

  return {
    domain: 'Missing outcome data',
    rating,
    justification,
    confidence
  };
}

/**
 * Assess measurement of outcome (RoB 2.0 Domain 4)
 */
function assessMeasurement(text: string): RoB2Domain {
  const keywords = {
    low: ['blinded assessment', 'objective outcome', 'validated instrument', 'standardized measurement'],
    high: ['unblinded', 'subjective outcome', 'non-validated', 'assessor aware']
  };

  let lowCount = 0;
  let highCount = 0;

  for (const keyword of keywords.low) {
    if (text.toLowerCase().includes(keyword)) lowCount++;
  }

  for (const keyword of keywords.high) {
    if (text.toLowerCase().includes(keyword)) highCount++;
  }

  let rating: 'low' | 'some_concerns' | 'high';
  let justification: string;
  let confidence: number;

  if (highCount > 0) {
    rating = 'high';
    justification = 'Risk of biased outcome measurement';
    confidence = 0.7;
  } else if (lowCount >= 2) {
    rating = 'low';
    justification = 'Appropriate outcome measurement methods';
    confidence = 0.8;
  } else if (lowCount === 1) {
    rating = 'some_concerns';
    justification = 'Some concerns about measurement validity';
    confidence = 0.6;
  } else {
    rating = 'some_concerns';
    justification = 'Unclear information about outcome measurement';
    confidence = 0.5;
  }

  return {
    domain: 'Measurement of the outcome',
    rating,
    justification,
    confidence
  };
}

/**
 * Assess selection of reported result (RoB 2.0 Domain 5)
 */
function assessReporting(text: string): RoB2Domain {
  const keywords = {
    low: ['pre-registered', 'protocol published', 'all outcomes reported', 'registered trial'],
    high: ['selective reporting', 'outcomes not reported', 'post-hoc analysis', 'data dredging']
  };

  let lowCount = 0;
  let highCount = 0;

  for (const keyword of keywords.low) {
    if (text.toLowerCase().includes(keyword)) lowCount++;
  }

  for (const keyword of keywords.high) {
    if (text.toLowerCase().includes(keyword)) highCount++;
  }

  let rating: 'low' | 'some_concerns' | 'high';
  let justification: string;
  let confidence: number;

  if (highCount > 0) {
    rating = 'high';
    justification = 'Evidence of selective outcome reporting';
    confidence = 0.8;
  } else if (lowCount >= 1) {
    rating = 'low';
    justification = 'Pre-registered with complete outcome reporting';
    confidence = 0.8;
  } else {
    rating = 'some_concerns';
    justification = 'Unclear if all outcomes were reported';
    confidence = 0.5;
  }

  return {
    domain: 'Selection of the reported result',
    rating,
    justification,
    confidence
  };
}

/**
 * Perform RoB 2.0 assessment
 */
function performRoB2Assessment(text: string, studyType: string): RoB2Assessment {
  const domains: RoB2Domain[] = [];

  if (studyType === 'rct') {
    domains.push(assessRandomization(text));
    domains.push(assessDeviations(text));
    domains.push(assessMissingData(text));
    domains.push(assessMeasurement(text));
    domains.push(assessReporting(text));
  } else {
    // For non-RCTs, assess relevant domains
    domains.push(assessMissingData(text));
    domains.push(assessMeasurement(text));
    domains.push(assessReporting(text));
  }

  // Determine overall rating (worst domain determines overall)
  let overallRating: 'low' | 'some_concerns' | 'high' = 'low';
  
  for (const domain of domains) {
    if (domain.rating === 'high') {
      overallRating = 'high';
      break;
    } else if (domain.rating === 'some_concerns' && overallRating === 'low') {
      overallRating = 'some_concerns';
    }
  }

  const summary = `Overall risk of bias: ${overallRating.toUpperCase()}. ${domains.length} domains assessed.`;

  return {
    overall_rating: overallRating,
    domains,
    summary
  };
}

/**
 * Perform GRADE assessment
 */
function performGRADEAssessment(text: string, rob2?: RoB2Assessment): GRADEAssessment {
  const factors = {
    risk_of_bias: 0,
    inconsistency: 0,
    indirectness: 0,
    imprecision: 0,
    publication_bias: 0
  };

  // Risk of bias (from RoB 2.0 if available)
  if (rob2) {
    if (rob2.overall_rating === 'high') factors.risk_of_bias = -2;
    else if (rob2.overall_rating === 'some_concerns') factors.risk_of_bias = -1;
  }

  // Inconsistency (check for heterogeneity mentions)
  if (text.toLowerCase().includes('heterogeneity') || text.toLowerCase().includes('inconsistent')) {
    factors.inconsistency = -1;
  }

  // Indirectness (check for indirect evidence)
  if (text.toLowerCase().includes('indirect') || text.toLowerCase().includes('surrogate')) {
    factors.indirectness = -1;
  }

  // Imprecision (check for wide confidence intervals or small sample)
  if (text.toLowerCase().includes('wide confidence interval') || text.toLowerCase().includes('small sample')) {
    factors.imprecision = -1;
  }

  // Publication bias
  if (text.toLowerCase().includes('publication bias') || text.toLowerCase().includes('funnel plot asymmetry')) {
    factors.publication_bias = -1;
  }

  // Calculate overall quality (start at high, downgrade)
  const totalDowngrades = Math.abs(
    factors.risk_of_bias +
    factors.inconsistency +
    factors.indirectness +
    factors.imprecision +
    factors.publication_bias
  );

  let quality: 'high' | 'moderate' | 'low' | 'very_low';
  if (totalDowngrades === 0) quality = 'high';
  else if (totalDowngrades === 1) quality = 'moderate';
  else if (totalDowngrades === 2) quality = 'low';
  else quality = 'very_low';

  const summary = `GRADE quality: ${quality.toUpperCase()}. Total downgrades: ${totalDowngrades}.`;

  return {
    quality,
    factors,
    summary
  };
}

/**
 * Detect bias indicators
 */
function detectBiasIndicators(text: string): string[] {
  const indicators: string[] = [];

  const biasPatterns = [
    { pattern: /conflict of interest|financial disclosure|funding/i, indicator: 'Potential funding bias' },
    { pattern: /industry sponsored|pharmaceutical company/i, indicator: 'Industry sponsorship detected' },
    { pattern: /small sample|underpowered/i, indicator: 'Small sample size concerns' },
    { pattern: /post-hoc|exploratory analysis/i, indicator: 'Post-hoc analysis detected' },
    { pattern: /selective reporting|outcomes not reported/i, indicator: 'Selective outcome reporting' },
    { pattern: /unblinded|open-label/i, indicator: 'Lack of blinding' },
    { pattern: /high dropout|lost to follow-up/i, indicator: 'High attrition rate' }
  ];

  for (const { pattern, indicator } of biasPatterns) {
    if (pattern.test(text)) {
      indicators.push(indicator);
    }
  }

  return indicators;
}

/**
 * Generate quality recommendations
 */
function generateRecommendations(
  rob2?: RoB2Assessment,
  grade?: GRADEAssessment,
  biasIndicators?: string[]
): string[] {
  const recommendations: string[] = [];

  if (rob2 && rob2.overall_rating === 'high') {
    recommendations.push('Consider excluding this study due to high risk of bias');
  }

  if (rob2 && rob2.overall_rating === 'some_concerns') {
    recommendations.push('Perform sensitivity analysis excluding studies with concerns');
  }

  if (grade && (grade.quality === 'low' || grade.quality === 'very_low')) {
    recommendations.push('Interpret results with caution due to low quality evidence');
  }

  if (biasIndicators && biasIndicators.length > 3) {
    recommendations.push('Multiple bias indicators detected - careful interpretation required');
  }

  if (recommendations.length === 0) {
    recommendations.push('Study appears to meet quality standards for inclusion');
  }

  return recommendations;
}

/**
 * Assess study quality
 */
export async function assessStudyQuality(
  input: AssessStudyQualityInput
): Promise<AssessStudyQualityOutput> {
  const startTime = Date.now();

  try {
    logger.info(`Starting quality assessment for ${input.study_type} study`);

    // Validate input
    if (!input.study_text || input.study_text.trim().length === 0) {
      throw new Error('Study text is required');
    }

    const assessRoB2 = input.assess_rob2 !== false;
    const assessGRADE = input.assess_grade !== false;
    const detectBias = input.detect_bias !== false;

    // Perform RoB 2.0 assessment
    let rob2Assessment: RoB2Assessment | undefined;
    if (assessRoB2) {
      rob2Assessment = performRoB2Assessment(input.study_text, input.study_type);
    }

    // Perform GRADE assessment
    let gradeAssessment: GRADEAssessment | undefined;
    if (assessGRADE) {
      gradeAssessment = performGRADEAssessment(input.study_text, rob2Assessment);
    }

    // Detect bias indicators
    const biasIndicators = detectBias ? detectBiasIndicators(input.study_text) : [];

    // Calculate overall quality score (0-100)
    let qualityScore = 100;
    if (rob2Assessment) {
      if (rob2Assessment.overall_rating === 'high') qualityScore -= 40;
      else if (rob2Assessment.overall_rating === 'some_concerns') qualityScore -= 20;
    }
    if (gradeAssessment) {
      if (gradeAssessment.quality === 'very_low') qualityScore -= 30;
      else if (gradeAssessment.quality === 'low') qualityScore -= 20;
      else if (gradeAssessment.quality === 'moderate') qualityScore -= 10;
    }
    qualityScore -= biasIndicators.length * 5;
    qualityScore = Math.max(0, qualityScore);

    // Generate recommendations
    const recommendations = generateRecommendations(rob2Assessment, gradeAssessment, biasIndicators);

    const processingTime = Date.now() - startTime;

    logger.info(`Quality assessment completed in ${processingTime}ms`);

    return {
      success: true,
      study_type: input.study_type,
      rob2_assessment: rob2Assessment,
      grade_assessment: gradeAssessment,
      bias_indicators: biasIndicators,
      quality_score: qualityScore,
      recommendations,
      processing_time_ms: processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Quality assessment failed', error);

    return {
      success: false,
      study_type: input.study_type,
      bias_indicators: [],
      quality_score: 0,
      recommendations: ['Assessment failed - manual review required'],
      processing_time_ms: processingTime
    };
  }
}

/**
 * MCP tool handler for assess_study_quality
 */
export const assessStudyQualityTool = {
  name: 'assess_study_quality',
  description: 'Automated risk of bias assessment using Cochrane RoB 2.0 and GRADE quality assessment',
  inputSchema: {
    type: 'object',
    properties: {
      study_text: {
        type: 'string',
        description: 'Full text or abstract of the study to assess'
      },
      study_type: {
        type: 'string',
        enum: ['rct', 'cohort', 'case_control', 'cross_sectional', 'systematic_review'],
        description: 'Type of study design'
      },
      assess_rob2: {
        type: 'boolean',
        description: 'Perform Cochrane RoB 2.0 assessment (default: true)',
        default: true
      },
      assess_grade: {
        type: 'boolean',
        description: 'Perform GRADE quality assessment (default: true)',
        default: true
      },
      detect_bias: {
        type: 'boolean',
        description: 'Detect bias indicators (default: true)',
        default: true
      }
    },
    required: ['study_text', 'study_type']
  },
  handler: assessStudyQuality
};
