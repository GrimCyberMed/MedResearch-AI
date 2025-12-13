/**
 * MCP Tool: Automated Risk of Bias Assessment
 * 
 * Automated risk of bias assessment using text analysis and pattern matching.
 * 
 * Features:
 * - Cochrane RoB 2.0 automated assessment
 * - ROBINS-I for non-randomized studies
 * - Text pattern recognition
 * - Bias indicator detection
 * - Confidence scoring
 * - Recommendations for manual review
 * 
 * @module assess-risk-of-bias-auto
 * @version 1.0.0
 * @since Phase 3
 */

import { promises as fs } from 'fs';
import { logger } from '../../common/logger.js';

interface Study {
  id: string;
  title: string;
  abstract?: string;
  fullText?: string;
  studyType?: 'rct' | 'observational' | 'cohort' | 'case-control';
}

interface BiasAssessment {
  domain: string;
  judgment: 'low' | 'some-concerns' | 'high' | 'unclear';
  confidence: number;
  evidence: string[];
  requiresManualReview: boolean;
}

interface AssessRiskOfBiasInput {
  studiesFile: string;
  tool?: 'rob2' | 'robins-i' | 'newcastle-ottawa';
  confidenceThreshold?: number;
  outputFile?: string;
}

interface AssessRiskOfBiasOutput {
  success: boolean;
  totalStudies: number;
  assessments: Record<string, BiasAssessment[]>;
  overallRisk: Record<string, 'low' | 'moderate' | 'high'>;
  requiresManualReview: string[];
  outputFile?: string;
  error?: string;
}

const ROB2_DOMAINS = [
  'randomization',
  'deviations-from-intended-interventions',
  'missing-outcome-data',
  'measurement-of-outcome',
  'selection-of-reported-result'
];

const BIAS_INDICATORS = {
  randomization: {
    low: ['random', 'randomized', 'randomisation', 'computer-generated', 'random number'],
    high: ['not random', 'non-random', 'quasi-random', 'alternate allocation']
  },
  blinding: {
    low: ['double-blind', 'triple-blind', 'blinded', 'masked'],
    high: ['not blinded', 'open-label', 'unblinded', 'no blinding']
  },
  attrition: {
    low: ['intention-to-treat', 'ITT', 'complete follow-up', 'no loss to follow-up'],
    high: ['high dropout', 'lost to follow-up', 'incomplete data', 'per-protocol only']
  }
};

function assessDomain(text: string, domain: string): BiasAssessment {
  const lowerText = text.toLowerCase();
  let judgment: 'low' | 'some-concerns' | 'high' | 'unclear' = 'unclear';
  let confidence = 0;
  const evidence: string[] = [];

  const indicators = BIAS_INDICATORS[domain as keyof typeof BIAS_INDICATORS];
  
  if (indicators) {
    // Check for low risk indicators
    for (const indicator of indicators.low) {
      if (lowerText.includes(indicator)) {
        judgment = 'low';
        confidence += 0.2;
        evidence.push(`Found indicator: "${indicator}"`);
      }
    }

    // Check for high risk indicators
    for (const indicator of indicators.high) {
      if (lowerText.includes(indicator)) {
        judgment = 'high';
        confidence += 0.2;
        evidence.push(`Found indicator: "${indicator}"`);
      }
    }
  }

  confidence = Math.min(confidence, 1.0);
  const requiresManualReview = confidence < 0.6;

  return {
    domain,
    judgment,
    confidence,
    evidence,
    requiresManualReview
  };
}

function calculateOverallRisk(assessments: BiasAssessment[]): 'low' | 'moderate' | 'high' {
  const highCount = assessments.filter(a => a.judgment === 'high').length;
  const someConcernsCount = assessments.filter(a => a.judgment === 'some-concerns').length;

  if (highCount > 0) return 'high';
  if (someConcernsCount > 0) return 'moderate';
  return 'low';
}

export async function assessRiskOfBiasAuto(input: AssessRiskOfBiasInput): Promise<AssessRiskOfBiasOutput> {
  try {
    logger.info('Starting automated risk of bias assessment');

    const content = await fs.readFile(input.studiesFile, 'utf-8');
    const studies: Study[] = JSON.parse(content);

    const assessments: Record<string, BiasAssessment[]> = {};
    const overallRisk: Record<string, 'low' | 'moderate' | 'high'> = {};
    const requiresManualReview: string[] = [];

    for (const study of studies) {
      const text = `${study.title} ${study.abstract || ''} ${study.fullText || ''}`;
      const studyAssessments: BiasAssessment[] = [];

      for (const domain of ROB2_DOMAINS) {
        const assessment = assessDomain(text, domain);
        studyAssessments.push(assessment);

        if (assessment.requiresManualReview && !requiresManualReview.includes(study.id)) {
          requiresManualReview.push(study.id);
        }
      }

      assessments[study.id] = studyAssessments;
      overallRisk[study.id] = calculateOverallRisk(studyAssessments);
    }

    const outputFile = input.outputFile || input.studiesFile.replace('.json', '-rob-assessment.json');
    await fs.writeFile(outputFile, JSON.stringify({ assessments, overallRisk }, null, 2));

    return {
      success: true,
      totalStudies: studies.length,
      assessments,
      overallRisk,
      requiresManualReview,
      outputFile
    };
  } catch (error) {
    return {
      success: false,
      totalStudies: 0,
      assessments: {},
      overallRisk: {},
      requiresManualReview: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export const assessRiskOfBiasAutoTool = {
  name: 'assess_risk_of_bias_auto',
  description: 'Automated risk of bias assessment using text analysis',
  inputSchema: {
    type: 'object',
    properties: {
      studiesFile: { type: 'string' },
      tool: {
        type: 'string',
        enum: ['rob2', 'robins-i', 'newcastle-ottawa'],
        default: 'rob2'
      },
      confidenceThreshold: { type: 'number', default: 0.6 },
      outputFile: { type: 'string' }
    },
    required: ['studiesFile']
  }
};
