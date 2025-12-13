/**
 * JBI Critical Appraisal Tools
 * 
 * Joanna Briggs Institute Critical Appraisal Checklists for:
 * - Cross-sectional studies (8 questions)
 * - Case reports (8 questions)
 * - Case series (10 questions)
 * 
 * @see https://jbi.global/critical-appraisal-tools
 * @version 6.0.0-beta
 */

import {
  QualityAssessmentTool,
  QualityAssessment,
  createQualityDomain,
  createQualityItem,
  ResponseOption,
  QualityRating,
  QualityTool,
} from '../../common/quality-assessment-framework.js';
import { StudyDesignType } from '../../common/study-design-taxonomy.js';
import { logger } from '../../common/logger.js';

/**
 * JBI Cross-Sectional Studies Tool
 */
export class JBICrossSectionalTool extends QualityAssessmentTool {
  readonly tool = QualityTool.JBI_CROSS_SECTIONAL;
  readonly version = '1.0';
  readonly name = 'JBI Critical Appraisal Checklist for Analytical Cross Sectional Studies';
  readonly description = 'Quality assessment for cross-sectional studies';
  
  readonly applicableDesigns = [
    StudyDesignType.CROSS_SECTIONAL,
    StudyDesignType.ECOLOGICAL,
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
    logger.info('Assessing cross-sectional study quality using JBI', {
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
    
    const methodsText = study.methods || study.abstract || '';
    
    // 8 questions
    const q1 = this.assessInclusionCriteria(methodsText);
    const q2 = this.assessSubjectsAndSetting(methodsText);
    const q3 = this.assessExposureMeasurement(methodsText);
    const q4 = this.assessStandardCriteria(methodsText);
    const q5 = this.assessConfounders(methodsText);
    const q6 = this.assessConfoundersStrategy(methodsText);
    const q7 = this.assessOutcomeMeasurement(methodsText);
    const q8 = this.assessStatisticalAnalysis(combinedText);
    
    const items = [q1, q2, q3, q4, q5, q6, q7, q8];
    
    const domain = createQualityDomain(
      'quality',
      'Overall Quality',
      items,
      {
        description: 'JBI critical appraisal criteria',
        overall_rating: this.calculateRating(items),
        rationale: this.calculateRationale(items),
        applicable: true,
      }
    );
    
    const domains = [domain];
    const totalYes = items.filter(i => i.response === ResponseOption.YES).length;
    const confidence = this.calculateConfidence(domains);
    
    const assessment: QualityAssessment = {
      study_id: study.id,
      study_design: study.design,
      tool: this.tool,
      tool_version: this.version,
      domains,
      overall_score: totalYes,
      overall_rating: domain.overall_rating!,
      overall_rationale: domain.rationale!,
      auto_assessed: true,
      confidence,
      requires_review: this.requiresReview({
        study_id: study.id,
        study_design: study.design,
        tool: this.tool,
        tool_version: this.version,
        domains,
        overall_score: totalYes,
        overall_rating: domain.overall_rating!,
        auto_assessed: true,
        confidence,
        requires_review: false,
      }),
      review_reasons: this.getReviewReasons(domain.overall_rating!, confidence),
    };
    
    logger.info('JBI cross-sectional assessment complete', {
      study_id: study.id,
      score: `${totalYes}/8`,
      rating: domain.overall_rating,
      confidence,
    });
    
    return assessment;
  }
  
  private assessInclusionCriteria(text: string) {
    const keywords = [
      'inclusion criteria',
      'eligibility',
      'eligible',
      'included if',
      'criteria',
      'selection criteria',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'q1',
      'Were the criteria for inclusion in the sample clearly defined?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Clear inclusion/exclusion criteria should be stated',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessSubjectsAndSetting(text: string) {
    const keywords = [
      'participants',
      'subjects',
      'setting',
      'location',
      'hospital',
      'clinic',
      'community',
      'recruited from',
      'demographics',
      'characteristics',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 3 ? 0.8 : evidence.length >= 2 ? 0.6 : evidence.length === 1 ? 0.4 : 0.3;
    
    return createQualityItem(
      'q2',
      'Were the study subjects and the setting described in detail?',
      evidence.length >= 2 ? ResponseOption.YES : evidence.length === 1 ? ResponseOption.PARTIAL_YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Detailed description of participants and setting',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessExposureMeasurement(text: string) {
    const keywords = [
      'measured',
      'assessment',
      'validated',
      'reliable',
      'standardized',
      'questionnaire',
      'instrument',
      'tool',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q3',
      'Was the exposure measured in a valid and reliable way?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Valid and reliable measurement of exposure',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessStandardCriteria(text: string) {
    const keywords = [
      'objective',
      'standard',
      'criteria',
      'defined',
      'validated',
      'established',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q4',
      'Were objective, standard criteria used for measurement of the condition?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Objective and standardized outcome measurement',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessConfounders(text: string) {
    const keywords = [
      'confound',
      'confounding',
      'potential confounders',
      'covariates',
      'factors',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length > 0 ? 0.6 : 0.3;
    
    return createQualityItem(
      'q5',
      'Were confounding factors identified?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Identification of potential confounding factors',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessConfoundersStrategy(text: string) {
    const keywords = [
      'adjusted',
      'controlled for',
      'stratified',
      'matched',
      'multivariable',
      'multivariate',
      'regression',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q6',
      'Were strategies to deal with confounding factors stated?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Methods to control for confounding',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessOutcomeMeasurement(text: string) {
    const keywords = [
      'outcome',
      'measured',
      'validated',
      'reliable',
      'standardized',
      'objective',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q7',
      'Were the outcomes measured in a valid and reliable way?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Valid and reliable outcome measurement',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessStatisticalAnalysis(text: string) {
    const keywords = [
      'statistical',
      'analysis',
      'chi-square',
      't-test',
      'regression',
      'odds ratio',
      'prevalence ratio',
      'p-value',
      'confidence interval',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'q8',
      'Was appropriate statistical analysis used?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Appropriate statistical methods for cross-sectional data',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private calculateRating(items: any[]): QualityRating {
    const yesCount = items.filter(i => i.response === ResponseOption.YES).length;
    const total = items.length;
    const percentage = (yesCount / total) * 100;
    
    if (percentage >= 75) return QualityRating.GOOD;
    if (percentage >= 50) return QualityRating.FAIR;
    return QualityRating.POOR;
  }
  
  private calculateRationale(items: any[]): string {
    const yesCount = items.filter(i => i.response === ResponseOption.YES).length;
    const total = items.length;
    return `${yesCount}/${total} criteria met (${((yesCount / total) * 100).toFixed(0)}%)`;
  }
  
  private calculateConfidence(domains: any[]): number {
    const itemConfidences = domains
      .flatMap(d => d.items)
      .map(i => i.confidence || 0);
    
    if (itemConfidences.length === 0) return 0;
    
    return itemConfidences.reduce((a, b) => a + b, 0) / itemConfidences.length;
  }
  
  private getReviewReasons(rating: QualityRating, confidence: number): string[] {
    const reasons: string[] = [];
    
    if (confidence < 0.5) {
      reasons.push('Low confidence in auto-assessment (<50%)');
    }
    
    if (rating === QualityRating.POOR) {
      reasons.push('Poor quality study detected');
    }
    
    return reasons;
  }
}

/**
 * JBI Case Report Tool
 */
export class JBICaseReportTool extends QualityAssessmentTool {
  readonly tool = QualityTool.JBI_CASE_REPORT;
  readonly version = '1.0';
  readonly name = 'JBI Critical Appraisal Checklist for Case Reports';
  readonly description = 'Quality assessment for case reports';
  
  readonly applicableDesigns = [
    StudyDesignType.CASE_REPORT,
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
    logger.info('Assessing case report quality using JBI', {
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
    
    // 8 questions for case reports
    const q1 = this.assessDemographics(combinedText);
    const q2 = this.assessHistory(combinedText);
    const q3 = this.assessClinicalCondition(combinedText);
    const q4 = this.assessDiagnosticTests(combinedText);
    const q5 = this.assessIntervention(combinedText);
    const q6 = this.assessPostIntervention(combinedText);
    const q7 = this.assessAdverseEvents(combinedText);
    const q8 = this.assessLessonsLearned(combinedText);
    
    const items = [q1, q2, q3, q4, q5, q6, q7, q8];
    
    const domain = createQualityDomain(
      'quality',
      'Overall Quality',
      items,
      {
        description: 'JBI critical appraisal criteria for case reports',
        overall_rating: this.calculateRating(items),
        rationale: this.calculateRationale(items),
        applicable: true,
      }
    );
    
    const domains = [domain];
    const totalYes = items.filter(i => i.response === ResponseOption.YES).length;
    const confidence = this.calculateConfidence(domains);
    
    const assessment: QualityAssessment = {
      study_id: study.id,
      study_design: study.design,
      tool: this.tool,
      tool_version: this.version,
      domains,
      overall_score: totalYes,
      overall_rating: domain.overall_rating!,
      overall_rationale: domain.rationale!,
      auto_assessed: true,
      confidence,
      requires_review: this.requiresReview({
        study_id: study.id,
        study_design: study.design,
        tool: this.tool,
        tool_version: this.version,
        domains,
        overall_score: totalYes,
        overall_rating: domain.overall_rating!,
        auto_assessed: true,
        confidence,
        requires_review: false,
      }),
      review_reasons: this.getReviewReasons(domain.overall_rating!, confidence),
    };
    
    logger.info('JBI case report assessment complete', {
      study_id: study.id,
      score: `${totalYes}/8`,
      rating: domain.overall_rating,
      confidence,
    });
    
    return assessment;
  }
  
  private assessDemographics(text: string) {
    const keywords = [
      'age',
      'sex',
      'gender',
      'demographics',
      'patient',
      'year-old',
      'male',
      'female',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'q1',
      'Were patient demographic characteristics clearly described?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Age, sex, and other relevant demographics',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessHistory(text: string) {
    const keywords = [
      'history',
      'medical history',
      'past medical',
      'previous',
      'background',
      'comorbid',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q2',
      'Was the patient history clearly described and presented as a timeline?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Clear chronological history',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessClinicalCondition(text: string) {
    const keywords = [
      'presented',
      'presentation',
      'symptoms',
      'signs',
      'clinical',
      'examination',
      'findings',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q3',
      'Was the current clinical condition of the patient clearly described?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Clear description of presenting condition',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessDiagnosticTests(text: string) {
    const keywords = [
      'diagnostic',
      'test',
      'imaging',
      'laboratory',
      'biopsy',
      'CT',
      'MRI',
      'ultrasound',
      'blood test',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q4',
      'Were diagnostic tests or assessment methods clearly described?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Clear description of diagnostic workup',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessIntervention(text: string) {
    const keywords = [
      'treatment',
      'intervention',
      'therapy',
      'management',
      'procedure',
      'surgery',
      'medication',
      'drug',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q5',
      'Was the intervention or treatment procedure clearly described?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Detailed description of intervention',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessPostIntervention(text: string) {
    const keywords = [
      'outcome',
      'result',
      'follow-up',
      'recovery',
      'improved',
      'resolved',
      'response',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'results');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q6',
      'Was the post-intervention clinical condition clearly described?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Clear description of outcomes',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessAdverseEvents(text: string) {
    const keywords = [
      'adverse',
      'complication',
      'side effect',
      'event',
      'no complications',
      'well tolerated',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'results');
    const confidence = evidence.length > 0 ? 0.6 : 0.3;
    
    return createQualityItem(
      'q7',
      'Were adverse events or unanticipated events identified and described?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Documentation of adverse events',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessLessonsLearned(text: string) {
    const keywords = [
      'conclusion',
      'lesson',
      'learning',
      'important',
      'highlight',
      'demonstrate',
      'illustrate',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'discussion');
    const confidence = evidence.length >= 2 ? 0.6 : evidence.length === 1 ? 0.4 : 0.3;
    
    return createQualityItem(
      'q8',
      'Does the case report provide takeaway lessons?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Clear lessons or implications',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private calculateRating(items: any[]): QualityRating {
    const yesCount = items.filter(i => i.response === ResponseOption.YES).length;
    const total = items.length;
    const percentage = (yesCount / total) * 100;
    
    if (percentage >= 75) return QualityRating.GOOD;
    if (percentage >= 50) return QualityRating.FAIR;
    return QualityRating.POOR;
  }
  
  private calculateRationale(items: any[]): string {
    const yesCount = items.filter(i => i.response === ResponseOption.YES).length;
    const total = items.length;
    return `${yesCount}/${total} criteria met (${((yesCount / total) * 100).toFixed(0)}%)`;
  }
  
  private calculateConfidence(domains: any[]): number {
    const itemConfidences = domains
      .flatMap(d => d.items)
      .map(i => i.confidence || 0);
    
    if (itemConfidences.length === 0) return 0;
    
    return itemConfidences.reduce((a, b) => a + b, 0) / itemConfidences.length;
  }
  
  private getReviewReasons(rating: QualityRating, confidence: number): string[] {
    const reasons: string[] = [];
    
    if (confidence < 0.5) {
      reasons.push('Low confidence in auto-assessment (<50%)');
    }
    
    if (rating === QualityRating.POOR) {
      reasons.push('Poor quality case report detected');
    }
    
    return reasons;
  }
}

/**
 * MCP tool interfaces
 */
export async function assessQualityJBICrossSectional(args: {
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
    const tool = new JBICrossSectionalTool();
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
      content: [{ type: 'text', text: JSON.stringify(assessment, null, 2) }],
    };
  } catch (error) {
    logger.error('Error assessing quality with JBI Cross-Sectional', {
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function assessQualityJBICaseReport(args: {
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
    const tool = new JBICaseReportTool();
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
      content: [{ type: 'text', text: JSON.stringify(assessment, null, 2) }],
    };
  } catch (error) {
    logger.error('Error assessing quality with JBI Case Report', {
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}
