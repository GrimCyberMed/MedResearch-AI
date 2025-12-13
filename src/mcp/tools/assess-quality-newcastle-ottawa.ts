/**
 * Newcastle-Ottawa Scale (NOS)
 * 
 * Quality assessment for observational studies (cohort and case-control).
 * Uses a star rating system with maximum of 9 stars.
 * 
 * Cohort Studies:
 * - Selection (4 stars max)
 * - Comparability (2 stars max)
 * - Outcome (3 stars max)
 * 
 * Case-Control Studies:
 * - Selection (4 stars max)
 * - Comparability (2 stars max)
 * - Exposure (3 stars max)
 * 
 * Quality Rating:
 * - Good: 7-9 stars
 * - Fair: 4-6 stars
 * - Poor: 0-3 stars
 * 
 * Reference: http://www.ohri.ca/programs/clinical_epidemiology/oxford.asp
 * 
 * @version 6.0.0-beta
 */

import {
  QualityAssessmentTool,
  QualityAssessment,
  QualityTool,
  QualityRating,
  ResponseOption,
  createQualityItem,
  createQualityDomain,
} from '../../common/quality-assessment-framework.js';
import { StudyDesignType } from '../../common/study-design-taxonomy.js';
import { logger } from '../../common/logger.js';

/**
 * Newcastle-Ottawa Scale for Cohort Studies
 */
export class NewcastleOttawaCohortTool extends QualityAssessmentTool {
  readonly tool = QualityTool.NEWCASTLE_OTTAWA_COHORT;
  readonly version = '1.0';
  readonly name = 'Newcastle-Ottawa Scale (Cohort Studies)';
  readonly description = 'Quality assessment for cohort studies using star rating system';
  
  readonly applicableDesigns = [
    StudyDesignType.COHORT_PROSPECTIVE,
    StudyDesignType.COHORT_RETROSPECTIVE,
    StudyDesignType.QUASI_EXPERIMENTAL,
    StudyDesignType.PROGNOSTIC_FACTOR,
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
    logger.info('Assessing cohort study quality using Newcastle-Ottawa Scale', {
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
    
    // Assess domains
    const selectionDomain = await this.assessSelection(combinedText, study.methods || study.abstract || '');
    const comparabilityDomain = await this.assessComparability(combinedText, study.methods || study.abstract || '');
    const outcomeDomain = await this.assessOutcome(combinedText, study.methods || study.abstract || '');
    
    const domains = [selectionDomain, comparabilityDomain, outcomeDomain];
    
    // Calculate total stars
    const totalStars = this.calculateTotalStars(domains);
    const overall_rating = this.determineQualityRating(totalStars);
    const confidence = this.calculateConfidence(domains);
    
    const assessment: QualityAssessment = {
      study_id: study.id,
      study_design: study.design,
      tool: this.tool,
      tool_version: this.version,
      domains,
      overall_score: totalStars,
      overall_rating,
      overall_rationale: `Total score: ${totalStars}/9 stars (${overall_rating} quality)`,
      auto_assessed: true,
      confidence,
      requires_review: this.requiresReview({
        study_id: study.id,
        study_design: study.design,
        tool: this.tool,
        tool_version: this.version,
        domains,
        overall_score: totalStars,
        overall_rating,
        auto_assessed: true,
        confidence,
        requires_review: false,
      }),
      review_reasons: this.getReviewReasons(totalStars, confidence),
    };
    
    logger.info('Newcastle-Ottawa assessment complete', {
      study_id: study.id,
      total_stars: totalStars,
      rating: overall_rating,
      confidence,
    });
    
    return assessment;
  }
  
  /**
   * Selection Domain (4 stars max)
   */
  private async assessSelection(_fullText: string, methodsText: string) {
    const item1 = this.assessRepresentativeness(methodsText);
    const item2 = this.assessNonExposedCohort(methodsText);
    const item3 = this.assessExposureAscertainment(methodsText);
    const item4 = this.assessOutcomeNotPresent(methodsText);
    
    const items = [item1, item2, item3, item4];
    const stars = items.filter(i => i.response === ResponseOption.YES).length;
    
    return createQualityDomain(
      'selection',
      'Selection',
      items,
      {
        description: 'Assessment of cohort selection and exposure ascertainment',
        overall_rating: stars >= 3 ? QualityRating.GOOD : stars >= 2 ? QualityRating.FAIR : QualityRating.POOR,
        rationale: `${stars}/4 stars for selection`,
        applicable: true,
      }
    );
  }
  
  private assessRepresentativeness(text: string) {
    const keywords = [
      'representative',
      'population-based',
      'community',
      'general population',
      'consecutive',
      'random sample',
      'randomly selected',
      'recruited from',
      'hospital records',
      'clinic patients',
      'registry',
      'database',
      'all patients',
      'all participants',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'selection1',
      'Representativeness of the exposed cohort',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Truly representative (1 star) or somewhat representative (1 star) vs selected group (0 stars)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessNonExposedCohort(text: string) {
    const keywords = [
      'same community',
      'same source',
      'same population',
      'matched',
      'control group',
      'matched control',
      'non-diabetic',
      'without',
      'unexposed',
      'comparison group',
      'control cohort',
      'same hospital',
      'same clinic',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'selection2',
      'Selection of the non-exposed cohort',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Drawn from the same community as exposed cohort (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessExposureAscertainment(text: string) {
    const keywords = [
      'medical record',
      'medical records',
      'hospital records',
      'structured interview',
      'validated',
      'objective',
      'blinded assessment',
      'independent',
      'diagnosed',
      'newly diagnosed',
      'confirmed',
      'verified',
      'documented',
      'registry data',
      'database records',
      'clinical assessment',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'selection3',
      'Ascertainment of exposure',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Secure record or structured interview (1 star) vs self-report (0 stars)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessOutcomeNotPresent(text: string) {
    const keywords = [
      'baseline',
      'outcome not present',
      'free of outcome',
      'no history',
      'excluded prevalent',
      'without disease',
      'disease-free',
      'no prior',
      'no previous',
      'excluded patients with',
      'participants were followed',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'selection4',
      'Demonstration that outcome of interest was not present at start of study',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Outcome not present at baseline (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  /**
   * Comparability Domain (2 stars max)
   */
  private async assessComparability(_fullText: string, methodsText: string) {
    const item1 = this.assessComparabilityDesign(methodsText);
    const item2 = this.assessComparabilityAnalysis(methodsText);
    
    const items = [item1, item2];
    const stars = items.filter(i => i.response === ResponseOption.YES).length;
    
    return createQualityDomain(
      'comparability',
      'Comparability',
      items,
      {
        description: 'Assessment of comparability of cohorts on basis of design or analysis',
        overall_rating: stars === 2 ? QualityRating.GOOD : stars === 1 ? QualityRating.FAIR : QualityRating.POOR,
        rationale: `${stars}/2 stars for comparability`,
        applicable: true,
      }
    );
  }
  
  private assessComparabilityDesign(text: string) {
    const keywords = [
      'matched',
      'matching',
      'stratified',
      'adjusted',
      'controlled for',
      'confound',
      'matched for age',
      'matched for sex',
      'matched for',
      'age-matched',
      'sex-matched',
      'baseline characteristics',
      'well-balanced',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'comparability1',
      'Comparability of cohorts on the basis of the design or analysis',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Study controls for most important factor (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessComparabilityAnalysis(text: string) {
    const keywords = [
      'multivariable',
      'multivariate',
      'regression',
      'adjusted for',
      'controlling for',
      'propensity score',
      'cox regression',
      'logistic regression',
      'adjusted analysis',
      'covariate',
      'confounders',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'comparability2',
      'Comparability of cohorts on the basis of the design or analysis (additional factor)',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Study controls for any additional factor (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  /**
   * Outcome Domain (3 stars max)
   */
  private async assessOutcome(fullText: string, methodsText: string) {
    const item1 = this.assessOutcomeAssessment(methodsText);
    const item2 = this.assessFollowUpLength(methodsText);
    const item3 = this.assessFollowUpAdequacy(fullText);
    
    const items = [item1, item2, item3];
    const stars = items.filter(i => i.response === ResponseOption.YES).length;
    
    return createQualityDomain(
      'outcome',
      'Outcome',
      items,
      {
        description: 'Assessment of outcome ascertainment and follow-up',
        overall_rating: stars === 3 ? QualityRating.GOOD : stars >= 2 ? QualityRating.FAIR : QualityRating.POOR,
        rationale: `${stars}/3 stars for outcome`,
        applicable: true,
      }
    );
  }
  
  private assessOutcomeAssessment(text: string) {
    const keywords = [
      'independent',
      'blind',
      'blinded',
      'objective',
      'record linkage',
      'validated',
      'adjudicated',
      'standardized criteria',
      'clinical assessment',
      'cardiologist',
      'physician',
      'expert',
      'committee',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'outcome1',
      'Assessment of outcome',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Independent blind assessment or record linkage (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessFollowUpLength(text: string) {
    // Look for follow-up duration - multiple patterns
    const patterns = [
      /follow(?:-|\s)?up.*?(\d+)\s*(year|month|week)/i,
      /(\d+)\s*(year|month|week).*?follow(?:-|\s)?up/i,
      /followed for (\d+)\s*(year|month|week)/i,
      /(\d+)(?:-|\s)(year|month|week) follow(?:-|\s)?up/i,
    ];
    
    let response = ResponseOption.UNCLEAR;
    let confidence = 0.3;
    let durationMatch = null;
    
    for (const pattern of patterns) {
      durationMatch = text.match(pattern);
      if (durationMatch) break;
    }
    
    if (durationMatch) {
      const duration = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      
      // Consider adequate if >= 1 year or >= 12 months or >= 52 weeks
      if ((unit === 'year' && duration >= 1) || 
          (unit === 'month' && duration >= 12) ||
          (unit === 'week' && duration >= 52)) {
        response = ResponseOption.YES;
        confidence = 0.8;
      } else {
        response = ResponseOption.NO;
        confidence = 0.6;
      }
    }
    
    return createQualityItem(
      'outcome2',
      'Was follow-up long enough for outcomes to occur',
      response,
      {
        guidance: 'Follow-up long enough for outcomes to occur (1 star)',
        evidence: durationMatch ? [{
          quote: durationMatch[0],
          location: 'methods',
          confidence,
          rationale: 'Follow-up duration mentioned',
        }] : [],
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessFollowUpAdequacy(text: string) {
    // Look for loss to follow-up or attrition - multiple patterns
    const patterns = [
      /loss to follow(?:-|\s)?up.*?(\d+)%/i,
      /attrition.*?(\d+)%/i,
      /(\d+)%.*?lost/i,
      /follow(?:-|\s)?up rate.*?(\d+)%/i,
      /(\d+)%.*?follow(?:-|\s)?up/i,
      /(\d+)%.*?completion/i,
      /retention.*?(\d+)%/i,
    ];
    
    let response = ResponseOption.UNCLEAR;
    let confidence = 0.3;
    let attritionMatch = null;
    
    for (const pattern of patterns) {
      attritionMatch = text.match(pattern);
      if (attritionMatch) break;
    }
    
    if (attritionMatch) {
      const value = parseInt(attritionMatch[1]);
      
      // Check if it's a follow-up rate (high is good) or loss rate (low is good)
      const isFollowUpRate = /follow(?:-|\s)?up rate|completion|retention/i.test(attritionMatch[0]);
      
      if (isFollowUpRate) {
        // Follow-up rate: >= 80% is good
        if (value >= 80) {
          response = ResponseOption.YES;
          confidence = 0.8;
        } else {
          response = ResponseOption.NO;
          confidence = 0.7;
        }
      } else {
        // Loss rate: < 20% is good
        if (value < 20) {
          response = ResponseOption.YES;
          confidence = 0.8;
        } else {
          response = ResponseOption.NO;
          confidence = 0.7;
        }
      }
    }
    
    return createQualityItem(
      'outcome3',
      'Adequacy of follow up of cohorts',
      response,
      {
        guidance: 'Complete follow-up or <20% loss (1 star)',
        evidence: attritionMatch ? [{
          quote: attritionMatch[0],
          location: 'results',
          confidence,
          rationale: 'Attrition rate mentioned',
        }] : [],
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private calculateTotalStars(domains: any[]): number {
    return domains.reduce((total, domain) => {
      const stars = domain.items.filter((i: any) => i.response === ResponseOption.YES).length;
      return total + stars;
    }, 0);
  }
  
  private determineQualityRating(stars: number): QualityRating {
    if (stars >= 7) return QualityRating.GOOD;
    if (stars >= 4) return QualityRating.FAIR;
    return QualityRating.POOR;
  }
  
  private calculateConfidence(domains: any[]): number {
    const itemConfidences = domains
      .flatMap(d => d.items)
      .map(i => i.confidence || 0);
    
    if (itemConfidences.length === 0) return 0;
    
    return itemConfidences.reduce((a, b) => a + b, 0) / itemConfidences.length;
  }
  
  private getReviewReasons(stars: number, confidence: number): string[] {
    const reasons: string[] = [];
    
    if (confidence < 0.5) {
      reasons.push('Low confidence in auto-assessment (<50%)');
    }
    
    if (stars < 4) {
      reasons.push(`Poor quality (${stars}/9 stars)`);
    }
    
    return reasons;
  }
}

/**
 * Newcastle-Ottawa Scale for Case-Control Studies
 */
export class NewcastleOttawaCaseControlTool extends QualityAssessmentTool {
  readonly tool = QualityTool.NEWCASTLE_OTTAWA_CASE_CONTROL;
  readonly version = '1.0';
  readonly name = 'Newcastle-Ottawa Scale (Case-Control Studies)';
  readonly description = 'Quality assessment for case-control studies using star rating system';
  
  readonly applicableDesigns = [
    StudyDesignType.CASE_CONTROL,
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
    logger.info('Assessing case-control study quality using Newcastle-Ottawa Scale', {
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
    
    // Assess domains
    const selectionDomain = await this.assessSelection(combinedText, study.methods || study.abstract || '');
    const comparabilityDomain = await this.assessComparability(combinedText, study.methods || study.abstract || '');
    const exposureDomain = await this.assessExposure(combinedText, study.methods || study.abstract || '');
    
    const domains = [selectionDomain, comparabilityDomain, exposureDomain];
    
    // Calculate total stars
    const totalStars = this.calculateTotalStars(domains);
    const overall_rating = this.determineQualityRating(totalStars);
    const confidence = this.calculateConfidence(domains);
    
    const assessment: QualityAssessment = {
      study_id: study.id,
      study_design: study.design,
      tool: this.tool,
      tool_version: this.version,
      domains,
      overall_score: totalStars,
      overall_rating,
      overall_rationale: `Total score: ${totalStars}/9 stars (${overall_rating} quality)`,
      auto_assessed: true,
      confidence,
      requires_review: this.requiresReview({
        study_id: study.id,
        study_design: study.design,
        tool: this.tool,
        tool_version: this.version,
        domains,
        overall_score: totalStars,
        overall_rating,
        auto_assessed: true,
        confidence,
        requires_review: false,
      }),
      review_reasons: this.getReviewReasons(totalStars, confidence),
    };
    
    logger.info('Newcastle-Ottawa assessment complete', {
      study_id: study.id,
      total_stars: totalStars,
      rating: overall_rating,
      confidence,
    });
    
    return assessment;
  }
  
  /**
   * Selection Domain (4 stars max)
   */
  private async assessSelection(_fullText: string, methodsText: string) {
    const item1 = this.assessCaseDefinition(methodsText);
    const item2 = this.assessCaseRepresentativeness(methodsText);
    const item3 = this.assessControlSelection(methodsText);
    const item4 = this.assessControlDefinition(methodsText);
    
    const items = [item1, item2, item3, item4];
    const stars = items.filter(i => i.response === ResponseOption.YES).length;
    
    return createQualityDomain(
      'selection',
      'Selection',
      items,
      {
        description: 'Assessment of case and control selection',
        overall_rating: stars >= 3 ? QualityRating.GOOD : stars >= 2 ? QualityRating.FAIR : QualityRating.POOR,
        rationale: `${stars}/4 stars for selection`,
        applicable: true,
      }
    );
  }
  
  private assessCaseDefinition(text: string) {
    const keywords = [
      'independent validation',
      'validated',
      'objective criteria',
      'diagnostic criteria',
      'confirmed',
      'histologically confirmed',
      'pathologically confirmed',
      'biopsy-proven',
      'diagnosed',
      'verified',
      'standardized criteria',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'selection1',
      'Is the case definition adequate?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Independent validation or record linkage (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessCaseRepresentativeness(text: string) {
    const keywords = [
      'consecutive',
      'representative',
      'population-based',
      'community',
      'unselected',
      'all patients',
      'all cases',
      'hospital-based',
      'clinic-based',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'selection2',
      'Representativeness of the cases',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Consecutive or representative series of cases (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessControlSelection(text: string) {
    const keywords = [
      'community control',
      'population control',
      'same community',
      'same source',
      'same hospital',
      'same clinic',
      'matched',
      'control group',
      'without cancer',
      'without disease',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'selection3',
      'Selection of Controls',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Community controls (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessControlDefinition(text: string) {
    const keywords = [
      'no history',
      'free of disease',
      'excluded',
      'without disease',
      'disease-free',
      'no prior',
      'no previous',
      'healthy controls',
      'cancer-free',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'selection4',
      'Definition of Controls',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'No history of disease (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  /**
   * Comparability Domain (2 stars max)
   */
  private async assessComparability(_fullText: string, methodsText: string) {
    const item1 = this.assessComparabilityMain(methodsText);
    const item2 = this.assessComparabilityAdditional(methodsText);
    
    const items = [item1, item2];
    const stars = items.filter(i => i.response === ResponseOption.YES).length;
    
    return createQualityDomain(
      'comparability',
      'Comparability',
      items,
      {
        description: 'Assessment of comparability of cases and controls',
        overall_rating: stars === 2 ? QualityRating.GOOD : stars === 1 ? QualityRating.FAIR : QualityRating.POOR,
        rationale: `${stars}/2 stars for comparability`,
        applicable: true,
      }
    );
  }
  
  private assessComparabilityMain(text: string) {
    const keywords = [
      'matched',
      'matching',
      'adjusted',
      'controlled for',
      'stratified',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    return createQualityItem(
      'comparability1',
      'Comparability of cases and controls on the basis of the design or analysis',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Study controls for most important factor (1 star)',
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.7 : 0.3,
      }
    );
  }
  
  private assessComparabilityAdditional(text: string) {
    const keywords = [
      'multivariable',
      'multivariate',
      'regression',
      'adjusted for',
      'controlling for',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    return createQualityItem(
      'comparability2',
      'Comparability of cases and controls on the basis of the design or analysis (additional factor)',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Study controls for any additional factor (1 star)',
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.7 : 0.3,
      }
    );
  }
  
  /**
   * Exposure Domain (3 stars max)
   */
  private async assessExposure(fullText: string, methodsText: string) {
    const item1 = this.assessExposureAscertainment(methodsText);
    const item2 = this.assessExposureMethod(methodsText);
    const item3 = this.assessNonResponseRate(fullText);
    
    const items = [item1, item2, item3];
    const stars = items.filter(i => i.response === ResponseOption.YES).length;
    
    return createQualityDomain(
      'exposure',
      'Exposure',
      items,
      {
        description: 'Assessment of exposure ascertainment',
        overall_rating: stars === 3 ? QualityRating.GOOD : stars >= 2 ? QualityRating.FAIR : QualityRating.POOR,
        rationale: `${stars}/3 stars for exposure`,
        applicable: true,
      }
    );
  }
  
  private assessExposureAscertainment(text: string) {
    const keywords = [
      'medical record',
      'medical records',
      'structured interview',
      'blinded',
      'validated',
      'objective',
      'trained interviewer',
      'standardized questionnaire',
      'blind to case',
      'blind to status',
      'reviewed',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'exposure1',
      'Ascertainment of exposure',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Secure record or structured interview where blind to case/control status (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessExposureMethod(text: string) {
    const keywords = [
      'same method',
      'same ascertainment',
      'standardized',
      'identical',
      'uniform',
      'consistent',
      'same questionnaire',
      'same interview',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Higher confidence if multiple indicators found
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'exposure2',
      'Same method of ascertainment for cases and controls',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.NO,
      {
        guidance: 'Same method for cases and controls (1 star)',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessNonResponseRate(text: string) {
    // Look for response rate or non-response rate - multiple patterns
    const patterns = [
      /response rate.*?(\d+)%/i,
      /(\d+)%.*?response/i,
      /non-response.*?(\d+)%/i,
      /(\d+)%.*?non-response/i,
      /participation rate.*?(\d+)%/i,
    ];
    
    let response = ResponseOption.UNCLEAR;
    let confidence = 0.3;
    let responseMatch = null;
    
    for (const pattern of patterns) {
      responseMatch = text.match(pattern);
      if (responseMatch) break;
    }
    
    if (responseMatch) {
      const rate = parseInt(responseMatch[1]);
      
      // Check if it's a non-response rate (low is good) or response rate (high is good)
      const isNonResponse = /non-response/i.test(responseMatch[0]);
      
      if (isNonResponse) {
        // Non-response rate: < 20% is good
        if (rate < 20) {
          response = ResponseOption.YES;
          confidence = 0.8;
        } else {
          response = ResponseOption.NO;
          confidence = 0.7;
        }
      } else {
        // Response rate: >= 80% is good
        if (rate >= 80) {
          response = ResponseOption.YES;
          confidence = 0.8;
        } else {
          response = ResponseOption.NO;
          confidence = 0.7;
        }
      }
    }
    
    return createQualityItem(
      'exposure3',
      'Non-Response rate',
      response,
      {
        guidance: 'Same rate for both groups (1 star)',
        evidence: responseMatch ? [{
          quote: responseMatch[0],
          location: 'results',
          confidence,
          rationale: 'Response rate mentioned',
        }] : [],
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private calculateTotalStars(domains: any[]): number {
    return domains.reduce((total, domain) => {
      const stars = domain.items.filter((i: any) => i.response === ResponseOption.YES).length;
      return total + stars;
    }, 0);
  }
  
  private determineQualityRating(stars: number): QualityRating {
    if (stars >= 7) return QualityRating.GOOD;
    if (stars >= 4) return QualityRating.FAIR;
    return QualityRating.POOR;
  }
  
  private calculateConfidence(domains: any[]): number {
    const itemConfidences = domains
      .flatMap(d => d.items)
      .map(i => i.confidence || 0);
    
    if (itemConfidences.length === 0) return 0;
    
    return itemConfidences.reduce((a, b) => a + b, 0) / itemConfidences.length;
  }
  
  private getReviewReasons(stars: number, confidence: number): string[] {
    const reasons: string[] = [];
    
    if (confidence < 0.5) {
      reasons.push('Low confidence in auto-assessment (<50%)');
    }
    
    if (stars < 4) {
      reasons.push(`Poor quality (${stars}/9 stars)`);
    }
    
    return reasons;
  }
}

/**
 * MCP tool interface for Newcastle-Ottawa Scale
 */
export async function assessQualityNewcastleOttawa(args: {
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
    // Select appropriate tool based on design
    let tool;
    if (args.design === StudyDesignType.CASE_CONTROL) {
      tool = new NewcastleOttawaCaseControlTool();
    } else {
      tool = new NewcastleOttawaCohortTool();
    }
    
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
    logger.error('Error assessing quality with Newcastle-Ottawa Scale', {
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
