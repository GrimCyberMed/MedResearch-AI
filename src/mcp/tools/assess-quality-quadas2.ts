/**
 * QUADAS-2 Quality Assessment Tool
 * 
 * Quality Assessment of Diagnostic Accuracy Studies - Version 2
 * 
 * Assesses risk of bias and applicability concerns in diagnostic accuracy studies
 * across 4 domains: Patient Selection, Index Test, Reference Standard, Flow and Timing
 * 
 * @see https://www.bristol.ac.uk/population-health-sciences/projects/quadas/quadas-2/
 * @version 6.0.0-beta
 */

import {
  QualityAssessmentTool,
  QualityAssessment,
  createQualityDomain,
  createQualityItem,
  ResponseOption,
  QualityRating,
  RiskLevel,
  QualityTool,
} from '../../common/quality-assessment-framework.js';
import { StudyDesignType } from '../../common/study-design-taxonomy.js';
import { logger } from '../../common/logger.js';

/**
 * QUADAS-2 Tool for Diagnostic Accuracy Studies
 */
export class QUADAS2Tool extends QualityAssessmentTool {
  readonly tool = QualityTool.QUADAS2;
  readonly version = '1.0';
  readonly name = 'QUADAS-2 (Quality Assessment of Diagnostic Accuracy Studies)';
  readonly description = 'Risk of bias and applicability assessment for diagnostic accuracy studies';
  
  readonly applicableDesigns = [
    StudyDesignType.DIAGNOSTIC_ACCURACY,
    StudyDesignType.CROSS_SECTIONAL, // Often used for diagnostic studies
  ];
  
  async assess(study: {
    id: string;
    design: StudyDesignType;
    title: string;
    abstract?: string;
    methods?: string;
    results?: string;
    discussion?: string;
    full_text?: string;
  }): Promise<QualityAssessment> {
    logger.info('Assessing diagnostic accuracy study quality using QUADAS-2', {
      study_id: study.id,
      design: study.design,
    });
    
    this.validateDesign(study.design);
    
    const combinedText = [
      study.title,
      study.abstract || '',
      study.methods || '',
      study.results || '',
      study.full_text || '',
    ].join(' ');
    
    // Assess 4 domains
    const patientSelectionDomain = await this.assessPatientSelection(combinedText, study.methods || study.abstract || '');
    const indexTestDomain = await this.assessIndexTest(combinedText, study.methods || study.abstract || '');
    const referenceStandardDomain = await this.assessReferenceStandard(combinedText, study.methods || study.abstract || '');
    const flowTimingDomain = await this.assessFlowTiming(combinedText, study.methods || study.abstract || '');
    
    const domains = [
      patientSelectionDomain,
      indexTestDomain,
      referenceStandardDomain,
      flowTimingDomain,
    ];
    
    // Calculate overall risk of bias
    const overallRisk = this.calculateOverallRisk(domains);
    const confidence = this.calculateConfidence(domains);
    
    const assessment: QualityAssessment = {
      study_id: study.id,
      study_design: study.design,
      tool: this.tool,
      tool_version: this.version,
      domains,
      overall_score: 0, // QUADAS-2 doesn't use numeric scores
      overall_risk: overallRisk,
      overall_rating: this.riskToRating(overallRisk),
      overall_rationale: `Overall risk of bias: ${overallRisk}`,
      auto_assessed: true,
      confidence,
      requires_review: this.requiresReview({
        study_id: study.id,
        study_design: study.design,
        tool: this.tool,
        tool_version: this.version,
        domains,
        overall_score: 0,
        overall_rating: this.riskToRating(overallRisk),
        auto_assessed: true,
        confidence,
        requires_review: false,
      }),
      review_reasons: this.getReviewReasons(overallRisk, confidence),
    };
    
    logger.info('QUADAS-2 assessment complete', {
      study_id: study.id,
      overall_risk: overallRisk,
      confidence,
    });
    
    return assessment;
  }
  
  /**
   * Domain 1: Patient Selection
   * Risk of Bias + Applicability Concerns
   */
  private async assessPatientSelection(_fullText: string, methodsText: string) {
    // Risk of Bias signaling questions
    const q1 = this.assessConsecutiveEnrollment(methodsText);
    const q2 = this.assessCaseControlAvoidance(methodsText);
    const q3 = this.assessInappropriateExclusions(methodsText);
    
    // Applicability concern
    const applicability = this.assessPatientApplicability(methodsText);
    
    const items = [q1, q2, q3, applicability];
    
    // Determine risk of bias (based on first 3 questions)
    const riskItems = [q1, q2, q3];
    const highRiskCount = riskItems.filter(i => i.response === ResponseOption.NO).length;
    const unclearCount = riskItems.filter(i => i.response === ResponseOption.UNCLEAR).length;
    
    let risk: RiskLevel;
    if (highRiskCount > 0) {
      risk = RiskLevel.HIGH;
    } else if (unclearCount > 0) {
      risk = RiskLevel.SOME_CONCERNS;
    } else {
      risk = RiskLevel.LOW;
    }
    
    return createQualityDomain(
      'patient_selection',
      'Patient Selection',
      items,
      {
        description: 'Risk of bias and applicability in patient selection',
        overall_risk: risk,
        overall_rating: this.riskToRating(risk),
        rationale: `Risk of bias: ${risk}`,
        applicable: true,
      }
    );
  }
  
  private assessConsecutiveEnrollment(text: string) {
    const keywords = [
      'consecutive',
      'consecutive patients',
      'consecutive enrollment',
      'all patients',
      'all eligible',
      'random sample',
      'randomly selected',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'ps_q1',
      'Was a consecutive or random sample of patients enrolled?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Consecutive or random sampling reduces selection bias',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessCaseControlAvoidance(text: string) {
    const caseControlKeywords = [
      'case-control',
      'cases and controls',
      'matched controls',
    ];
    
    const evidence = this.extractEvidence(text, caseControlKeywords, 'methods');
    
    // For QUADAS-2, case-control design is HIGH RISK
    const confidence = evidence.length > 0 ? 0.7 : 0.4;
    
    return createQualityItem(
      'ps_q2',
      'Was a case-control design avoided?',
      evidence.length > 0 ? ResponseOption.NO : ResponseOption.YES,
      {
        guidance: 'Case-control designs can introduce spectrum bias',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessInappropriateExclusions(text: string) {
    const exclusionKeywords = [
      'exclusion criteria',
      'excluded',
      'exclusions',
    ];
    
    const appropriateKeywords = [
      'appropriate exclusion',
      'justified exclusion',
      'pre-specified',
    ];
    
    const exclusions = this.extractEvidence(text, exclusionKeywords, 'methods');
    const appropriate = this.extractEvidence(text, appropriateKeywords, 'methods');
    
    let response = ResponseOption.UNCLEAR;
    let confidence = 0.3;
    
    if (appropriate.length > 0) {
      response = ResponseOption.YES;
      confidence = 0.6;
    } else if (exclusions.length > 0) {
      response = ResponseOption.UNCLEAR;
      confidence = 0.4;
    } else {
      response = ResponseOption.YES; // No exclusions mentioned = likely appropriate
      confidence = 0.5;
    }
    
    return createQualityItem(
      'ps_q3',
      'Did the study avoid inappropriate exclusions?',
      response,
      {
        guidance: 'Inappropriate exclusions can affect generalizability',
        evidence: [...exclusions, ...appropriate],
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessPatientApplicability(text: string) {
    // This is subjective - we can only flag if there are obvious issues
    const keywords = [
      'representative',
      'typical',
      'real-world',
      'clinical practice',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length > 0 ? 0.5 : 0.3;
    
    return createQualityItem(
      'ps_applicability',
      'Are there concerns that the included patients do not match the review question?',
      evidence.length > 0 ? ResponseOption.NO : ResponseOption.UNCLEAR,
      {
        guidance: 'Applicability concern - requires manual review',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  /**
   * Domain 2: Index Test
   * Risk of Bias + Applicability Concerns
   */
  private async assessIndexTest(_fullText: string, methodsText: string) {
    const q1 = this.assessIndexTestInterpretation(methodsText);
    const q2 = this.assessIndexTestThreshold(methodsText);
    const applicability = this.assessIndexTestApplicability(methodsText);
    
    const items = [q1, q2, applicability];
    
    const riskItems = [q1, q2];
    const highRiskCount = riskItems.filter(i => i.response === ResponseOption.NO).length;
    const unclearCount = riskItems.filter(i => i.response === ResponseOption.UNCLEAR).length;
    
    let risk: RiskLevel;
    if (highRiskCount > 0) {
      risk = RiskLevel.HIGH;
    } else if (unclearCount > 0) {
      risk = RiskLevel.SOME_CONCERNS;
    } else {
      risk = RiskLevel.LOW;
    }
    
    return createQualityDomain(
      'index_test',
      'Index Test',
      items,
      {
        description: 'Risk of bias and applicability in index test conduct and interpretation',
        overall_risk: risk,
        overall_rating: this.riskToRating(risk),
        rationale: `Risk of bias: ${risk}`,
        applicable: true,
      }
    );
  }
  
  private assessIndexTestInterpretation(text: string) {
    const keywords = [
      'blinded',
      'blind to',
      'without knowledge',
      'independent',
      'masked',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'it_q1',
      'Were the index test results interpreted without knowledge of the reference standard?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Blinding prevents review bias',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessIndexTestThreshold(text: string) {
    const keywords = [
      'pre-specified',
      'predetermined',
      'threshold',
      'cut-off',
      'cutoff',
      'a priori',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'it_q2',
      'If a threshold was used, was it pre-specified?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Pre-specified thresholds prevent data-driven optimization',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessIndexTestApplicability(text: string) {
    const keywords = [
      'standard',
      'routine',
      'clinical practice',
      'validated',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length > 0 ? 0.5 : 0.3;
    
    return createQualityItem(
      'it_applicability',
      'Are there concerns that the index test, its conduct, or interpretation differ from the review question?',
      evidence.length > 0 ? ResponseOption.NO : ResponseOption.UNCLEAR,
      {
        guidance: 'Applicability concern - requires manual review',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  /**
   * Domain 3: Reference Standard
   * Risk of Bias + Applicability Concerns
   */
  private async assessReferenceStandard(_fullText: string, methodsText: string) {
    const q1 = this.assessReferenceStandardCorrect(methodsText);
    const q2 = this.assessReferenceStandardBlinding(methodsText);
    const applicability = this.assessReferenceStandardApplicability(methodsText);
    
    const items = [q1, q2, applicability];
    
    const riskItems = [q1, q2];
    const highRiskCount = riskItems.filter(i => i.response === ResponseOption.NO).length;
    const unclearCount = riskItems.filter(i => i.response === ResponseOption.UNCLEAR).length;
    
    let risk: RiskLevel;
    if (highRiskCount > 0) {
      risk = RiskLevel.HIGH;
    } else if (unclearCount > 0) {
      risk = RiskLevel.SOME_CONCERNS;
    } else {
      risk = RiskLevel.LOW;
    }
    
    return createQualityDomain(
      'reference_standard',
      'Reference Standard',
      items,
      {
        description: 'Risk of bias and applicability in reference standard',
        overall_risk: risk,
        overall_rating: this.riskToRating(risk),
        rationale: `Risk of bias: ${risk}`,
        applicable: true,
      }
    );
  }
  
  private assessReferenceStandardCorrect(text: string) {
    const keywords = [
      'gold standard',
      'reference standard',
      'biopsy',
      'histopathology',
      'pathology',
      'confirmed',
      'verified',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'rs_q1',
      'Is the reference standard likely to correctly classify the target condition?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Reference standard should be the best available method',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessReferenceStandardBlinding(text: string) {
    const keywords = [
      'blinded',
      'blind to index',
      'without knowledge of index',
      'independent',
      'masked',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'rs_q2',
      'Were the reference standard results interpreted without knowledge of the index test?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Blinding prevents review bias',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessReferenceStandardApplicability(text: string) {
    const keywords = [
      'appropriate',
      'standard',
      'accepted',
      'validated',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length > 0 ? 0.5 : 0.3;
    
    return createQualityItem(
      'rs_applicability',
      'Are there concerns that the target condition as defined by the reference standard does not match the review question?',
      evidence.length > 0 ? ResponseOption.NO : ResponseOption.UNCLEAR,
      {
        guidance: 'Applicability concern - requires manual review',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  /**
   * Domain 4: Flow and Timing
   * Risk of Bias only (no applicability concerns)
   */
  private async assessFlowTiming(_fullText: string, methodsText: string) {
    const q1 = this.assessAppropriateInterval(methodsText);
    const q2 = this.assessAllPatientsReceived(methodsText);
    const q3 = this.assessAllPatientsIncluded(methodsText);
    
    const items = [q1, q2, q3];
    
    const highRiskCount = items.filter(i => i.response === ResponseOption.NO).length;
    const unclearCount = items.filter(i => i.response === ResponseOption.UNCLEAR).length;
    
    let risk: RiskLevel;
    if (highRiskCount > 0) {
      risk = RiskLevel.HIGH;
    } else if (unclearCount > 0) {
      risk = RiskLevel.SOME_CONCERNS;
    } else {
      risk = RiskLevel.LOW;
    }
    
    return createQualityDomain(
      'flow_timing',
      'Flow and Timing',
      items,
      {
        description: 'Risk of bias in patient flow and timing of tests',
        overall_risk: risk,
        overall_rating: this.riskToRating(risk),
        rationale: `Risk of bias: ${risk}`,
        applicable: true,
      }
    );
  }
  
  private assessAppropriateInterval(text: string) {
    const keywords = [
      'same day',
      'within',
      'interval',
      'time between',
      'simultaneously',
      'concurrent',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length > 0 ? 0.6 : 0.3;
    
    return createQualityItem(
      'ft_q1',
      'Was there an appropriate interval between index test and reference standard?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Short interval prevents disease progression bias',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessAllPatientsReceived(text: string) {
    const keywords = [
      'all patients',
      'all participants',
      'all subjects',
      'same reference',
      'same standard',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'ft_q2',
      'Did all patients receive the same reference standard?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Differential verification can introduce bias',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessAllPatientsIncluded(text: string) {
    // Look for exclusions or missing data
    const exclusionKeywords = [
      'excluded',
      'missing',
      'incomplete',
      'lost',
    ];
    
    const inclusionKeywords = [
      'all patients included',
      'complete data',
      'no exclusions',
    ];
    
    const exclusions = this.extractEvidence(text, exclusionKeywords, 'methods');
    const inclusions = this.extractEvidence(text, inclusionKeywords, 'methods');
    
    let response = ResponseOption.UNCLEAR;
    let confidence = 0.3;
    
    if (inclusions.length > 0) {
      response = ResponseOption.YES;
      confidence = 0.6;
    } else if (exclusions.length > 0) {
      response = ResponseOption.NO;
      confidence = 0.5;
    }
    
    return createQualityItem(
      'ft_q3',
      'Were all patients included in the analysis?',
      response,
      {
        guidance: 'Selective exclusions can introduce bias',
        evidence: [...exclusions, ...inclusions],
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  /**
   * Helper methods
   */
  private riskToRating(risk: RiskLevel): QualityRating {
    switch (risk) {
      case RiskLevel.LOW:
        return QualityRating.GOOD;
      case RiskLevel.SOME_CONCERNS:
        return QualityRating.FAIR;
      case RiskLevel.HIGH:
        return QualityRating.POOR;
      default:
        return QualityRating.POOR;
    }
  }
  
  private calculateConfidence(domains: any[]): number {
    const itemConfidences = domains
      .flatMap(d => d.items)
      .map(i => i.confidence || 0);
    
    if (itemConfidences.length === 0) return 0;
    
    return itemConfidences.reduce((a, b) => a + b, 0) / itemConfidences.length;
  }
  
  private getReviewReasons(risk: RiskLevel, confidence: number): string[] {
    const reasons: string[] = [];
    
    if (confidence < 0.5) {
      reasons.push('Low confidence in auto-assessment (<50%)');
    }
    
    if (risk === RiskLevel.HIGH) {
      reasons.push('High risk of bias detected');
    }
    
    if (risk === RiskLevel.SOME_CONCERNS) {
      reasons.push('Some concerns about bias detected');
    }
    
    return reasons;
  }
}

/**
 * MCP tool interface for QUADAS-2
 */
export async function assessQualityQUADAS2(args: {
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
    const tool = new QUADAS2Tool();
    
    const assessment = await tool.assess({
      id: args.study_id,
      design: args.design,
      title: args.title,
      abstract: args.abstract,
      methods: args.methods,
      results: args.results,
      discussion: args.discussion,
      full_text: args.full_text,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(assessment, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('Error assessing quality with QUADAS-2', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error assessing quality: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
