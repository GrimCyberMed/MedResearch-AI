/**
 * Cochrane Risk of Bias 2.0 (RoB 2) Tool
 * 
 * Gold-standard quality assessment for randomized controlled trials.
 * 
 * Domains:
 * 1. Bias arising from the randomization process
 * 2. Bias due to deviations from intended interventions
 * 3. Bias due to missing outcome data
 * 4. Bias in measurement of the outcome
 * 5. Bias in selection of the reported result
 * 
 * Reference: https://www.riskofbias.info/welcome/rob-2-0-tool
 * 
 * @version 6.0.0-beta
 */

import {
  QualityAssessmentTool,
  QualityAssessment,
  QualityTool,
  RiskLevel,
  ResponseOption,
  createQualityItem,
  createQualityDomain,
} from '../../common/quality-assessment-framework.js';
import { StudyDesignType } from '../../common/study-design-taxonomy.js';
import { logger } from '../../common/logger.js';

/**
 * Cochrane RoB 2.0 implementation
 */
export class RoB2Tool extends QualityAssessmentTool {
  readonly tool = QualityTool.ROB2;
  readonly version = '2.0';
  readonly name = 'Cochrane Risk of Bias 2.0';
  readonly description = 'Risk of bias assessment for randomized controlled trials';
  
  readonly applicableDesigns = [
    StudyDesignType.RCT_PARALLEL,
    StudyDesignType.RCT_CROSSOVER,
    StudyDesignType.RCT_CLUSTER,
    StudyDesignType.RCT_FACTORIAL,
    StudyDesignType.RCT_ADAPTIVE,
    StudyDesignType.RCT_STEPPED_WEDGE,
    StudyDesignType.N_OF_1,
  ];
  
  /**
   * Assess RCT quality using RoB 2.0
   */
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
    logger.info('Assessing RCT quality using RoB 2.0', {
      study_id: study.id,
      design: study.design,
      has_full_text: !!study.full_text,
    });
    
    // Validate study design
    this.validateDesign(study.design);
    
    // Combine text for evidence extraction
    const combinedText = [
      study.title,
      study.abstract || '',
      study.methods || '',
      study.results || '',
      study.discussion || '',
      study.full_text || '',
    ].join(' ');
    
    // Assess each domain
    const domain1 = await this.assessDomain1Randomization(combinedText, study.methods || study.abstract || '');
    const domain2 = await this.assessDomain2Deviations(combinedText, study.methods || study.abstract || '');
    const domain3 = await this.assessDomain3MissingData(combinedText, study.results || study.abstract || '');
    const domain4 = await this.assessDomain4Measurement(combinedText, study.methods || study.abstract || '');
    const domain5 = await this.assessDomain5Reporting(combinedText, study.results || study.abstract || '');
    
    const domains = [domain1, domain2, domain3, domain4, domain5];
    
    // Calculate overall risk
    const overall_risk = this.calculateOverallRisk(domains);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(domains);
    
    // Build assessment
    const assessment: QualityAssessment = {
      study_id: study.id,
      study_design: study.design,
      tool: this.tool,
      tool_version: this.version,
      domains,
      overall_risk,
      overall_rationale: this.generateOverallRationale(domains, overall_risk),
      auto_assessed: true,
      confidence,
      requires_review: this.requiresReview({
        study_id: study.id,
        study_design: study.design,
        tool: this.tool,
        tool_version: this.version,
        domains,
        overall_risk,
        auto_assessed: true,
        confidence,
        requires_review: false,
      }),
      review_reasons: this.getReviewReasons(domains, confidence),
    };
    
    logger.info('RoB 2.0 assessment complete', {
      study_id: study.id,
      overall_risk,
      confidence,
      requires_review: assessment.requires_review,
    });
    
    return assessment;
  }
  
  /**
   * Domain 1: Bias arising from the randomization process
   */
  private async assessDomain1Randomization(fullText: string, methodsText: string) {
    // Signaling questions
    const sq1 = this.assessRandomizationSequence(methodsText);
    const sq2 = this.assessAllocationConcealment(methodsText);
    const sq3 = this.assessBaselineImbalances(fullText);
    
    const items = [sq1, sq2, sq3];
    
    // Determine domain risk
    const overall_risk = this.determineDomain1Risk(items);
    
    return createQualityDomain(
      'domain1',
      'Bias arising from the randomization process',
      items,
      {
        description: 'Assessment of the randomization process and baseline balance',
        overall_risk,
        rationale: this.generateDomain1Rationale(items, overall_risk),
        applicable: true,
      }
    );
  }
  
  /**
   * SQ 1.1: Was the allocation sequence random?
   */
  private assessRandomizationSequence(text: string) {
    const keywords = [
      'random number',
      'computer-generated',
      'random allocation',
      'randomization sequence',
      'random sequence',
      'permuted block',
      'stratified randomization',
      'minimization',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (evidence.length > 0) {
      response = ResponseOption.YES;
      risk = RiskLevel.LOW;
    } else if (text.toLowerCase().includes('quasi-random') || 
               text.toLowerCase().includes('alternate allocation')) {
      response = ResponseOption.NO;
      risk = RiskLevel.HIGH;
    }
    
    return createQualityItem(
      'sq1.1',
      'Was the allocation sequence random?',
      response,
      {
        guidance: 'Look for computer-generated random numbers, random number tables, or other truly random methods',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.8 : 0.3,
      }
    );
  }
  
  /**
   * SQ 1.2: Was the allocation sequence concealed until participants were enrolled and assigned?
   */
  private assessAllocationConcealment(text: string) {
    const keywords = [
      'allocation concealment',
      'concealed allocation',
      'sealed envelope',
      'central randomization',
      'pharmacy-controlled',
      'sequentially numbered',
      'opaque envelope',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (evidence.length > 0) {
      response = ResponseOption.YES;
      risk = RiskLevel.LOW;
    } else if (text.toLowerCase().includes('open allocation') ||
               text.toLowerCase().includes('unconcealed')) {
      response = ResponseOption.NO;
      risk = RiskLevel.HIGH;
    }
    
    return createQualityItem(
      'sq1.2',
      'Was the allocation sequence concealed until participants were enrolled and assigned?',
      response,
      {
        guidance: 'Look for central randomization, sealed opaque envelopes, or pharmacy-controlled allocation',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.8 : 0.3,
      }
    );
  }
  
  /**
   * SQ 1.3: Did baseline differences suggest a problem with randomization?
   */
  private assessBaselineImbalances(text: string) {
    const balanceKeywords = [
      'baseline characteristics',
      'no significant difference',
      'groups were similar',
      'well-balanced',
      'comparable at baseline',
    ];
    
    const imbalanceKeywords = [
      'baseline imbalance',
      'significant difference at baseline',
      'groups differed',
    ];
    
    const balanceEvidence = this.extractEvidence(text, balanceKeywords, 'results');
    const imbalanceEvidence = this.extractEvidence(text, imbalanceKeywords, 'results');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (balanceEvidence.length > 0) {
      response = ResponseOption.NO; // No problems
      risk = RiskLevel.LOW;
    } else if (imbalanceEvidence.length > 0) {
      response = ResponseOption.YES; // Problems detected
      risk = RiskLevel.HIGH;
    }
    
    return createQualityItem(
      'sq1.3',
      'Did baseline differences between groups suggest a problem with the randomization process?',
      response,
      {
        guidance: 'Look for baseline tables showing balance or imbalance between groups',
        risk,
        evidence: [...balanceEvidence, ...imbalanceEvidence],
        auto_assessed: true,
        confidence: (balanceEvidence.length + imbalanceEvidence.length) > 0 ? 0.7 : 0.3,
      }
    );
  }
  
  /**
   * Determine Domain 1 overall risk
   */
  private determineDomain1Risk(items: any[]): RiskLevel {
    const [sq1, sq2, sq3] = items;
    
    // High risk if:
    // - SQ1 = No OR SQ2 = No OR SQ3 = Yes
    if (sq1.response === ResponseOption.NO ||
        sq2.response === ResponseOption.NO ||
        sq3.response === ResponseOption.YES) {
      return RiskLevel.HIGH;
    }
    
    // Low risk if:
    // - SQ1 = Yes AND SQ2 = Yes AND SQ3 = No
    if (sq1.response === ResponseOption.YES &&
        sq2.response === ResponseOption.YES &&
        sq3.response === ResponseOption.NO) {
      return RiskLevel.LOW;
    }
    
    // Some concerns otherwise
    return RiskLevel.SOME_CONCERNS;
  }
  
  /**
   * Domain 2: Bias due to deviations from intended interventions
   */
  private async assessDomain2Deviations(fullText: string, methodsText: string) {
    const sq1 = this.assessBlinding(methodsText);
    const sq2 = this.assessDeviations(fullText);
    const sq3 = this.assessITTAnalysis(fullText);
    
    const items = [sq1, sq2, sq3];
    const overall_risk = this.determineDomain2Risk(items);
    
    return createQualityDomain(
      'domain2',
      'Bias due to deviations from intended interventions',
      items,
      {
        description: 'Assessment of blinding and protocol deviations',
        overall_risk,
        rationale: this.generateDomain2Rationale(items, overall_risk),
        applicable: true,
      }
    );
  }
  
  /**
   * SQ 2.1: Were participants and personnel blind to intervention?
   */
  private assessBlinding(text: string) {
    const keywords = [
      'double-blind',
      'double blind',
      'triple-blind',
      'blinded',
      'masked',
      'placebo-controlled',
      'identical placebo',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (evidence.length > 0) {
      response = ResponseOption.YES;
      risk = RiskLevel.LOW;
    } else if (text.toLowerCase().includes('open-label') ||
               text.toLowerCase().includes('unblinded')) {
      response = ResponseOption.NO;
      risk = RiskLevel.HIGH;
    }
    
    return createQualityItem(
      'sq2.1',
      'Were participants and those delivering the interventions aware of intervention assignments?',
      response,
      {
        guidance: 'Look for double-blind, placebo-controlled, or masking procedures',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.8 : 0.3,
      }
    );
  }
  
  /**
   * SQ 2.2: Were there deviations from intended interventions?
   */
  private assessDeviations(text: string) {
    const keywords = [
      'protocol deviation',
      'protocol violation',
      'crossover',
      'switched treatment',
      'discontinued',
      'non-compliance',
      'adherence',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'results');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (evidence.length > 0) {
      response = ResponseOption.YES;
      risk = RiskLevel.SOME_CONCERNS;
    }
    
    return createQualityItem(
      'sq2.2',
      'Were there deviations from the intended intervention that arose because of the trial context?',
      response,
      {
        guidance: 'Look for protocol deviations, crossovers, or treatment switches',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.6 : 0.3,
      }
    );
  }
  
  /**
   * SQ 2.3: Was intention-to-treat analysis used?
   */
  private assessITTAnalysis(text: string) {
    const keywords = [
      'intention-to-treat',
      'intention to treat',
      'ITT',
      'modified ITT',
      'mITT',
      'all randomized participants',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (evidence.length > 0) {
      response = ResponseOption.YES;
      risk = RiskLevel.LOW;
    } else if (text.toLowerCase().includes('per-protocol') ||
               text.toLowerCase().includes('as-treated')) {
      response = ResponseOption.NO;
      risk = RiskLevel.HIGH;
    }
    
    return createQualityItem(
      'sq2.3',
      'Was an appropriate analysis used to estimate the effect of assignment to intervention?',
      response,
      {
        guidance: 'Look for intention-to-treat (ITT) or modified ITT analysis',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.8 : 0.3,
      }
    );
  }
  
  /**
   * Determine Domain 2 overall risk
   */
  private determineDomain2Risk(items: any[]): RiskLevel {
    const [sq1, sq2, sq3] = items;
    
    // High risk if unblinded AND (deviations OR no ITT)
    if (sq1.response === ResponseOption.NO &&
        (sq2.response === ResponseOption.YES || sq3.response === ResponseOption.NO)) {
      return RiskLevel.HIGH;
    }
    
    // Low risk if blinded AND ITT
    if (sq1.response === ResponseOption.YES && sq3.response === ResponseOption.YES) {
      return RiskLevel.LOW;
    }
    
    return RiskLevel.SOME_CONCERNS;
  }
  
  /**
   * Domain 3: Bias due to missing outcome data
   */
  private async assessDomain3MissingData(fullText: string, resultsText: string) {
    const sq1 = this.assessAttrition(resultsText);
    const sq2 = this.assessMissingDataBias(fullText);
    
    const items = [sq1, sq2];
    const overall_risk = this.determineDomain3Risk(items);
    
    return createQualityDomain(
      'domain3',
      'Bias due to missing outcome data',
      items,
      {
        description: 'Assessment of attrition and missing data handling',
        overall_risk,
        rationale: this.generateDomain3Rationale(items, overall_risk),
        applicable: true,
      }
    );
  }
  
  /**
   * SQ 3.1: Were data available for all participants?
   */
  private assessAttrition(text: string) {
    const keywords = [
      'loss to follow-up',
      'dropout',
      'withdrawal',
      'attrition',
      'missing data',
      'complete data',
      'all participants',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'results');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    // Look for low attrition
    if (text.match(/loss to follow-up.*?(\d+)%/i)) {
      const match = text.match(/loss to follow-up.*?(\d+)%/i);
      const attrition = match ? parseInt(match[1]) : 0;
      
      if (attrition < 5) {
        response = ResponseOption.YES;
        risk = RiskLevel.LOW;
      } else if (attrition > 20) {
        response = ResponseOption.NO;
        risk = RiskLevel.HIGH;
      } else {
        response = ResponseOption.PARTIAL_YES;
        risk = RiskLevel.SOME_CONCERNS;
      }
    }
    
    return createQualityItem(
      'sq3.1',
      'Were data for this outcome available for all, or nearly all, participants randomized?',
      response,
      {
        guidance: 'Look for attrition rates <5% (low risk) or >20% (high risk)',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.7 : 0.3,
      }
    );
  }
  
  /**
   * SQ 3.2: Could missing data bias results?
   */
  private assessMissingDataBias(text: string) {
    const keywords = [
      'missing at random',
      'imputation',
      'sensitivity analysis',
      'worst-case',
      'complete case',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (evidence.length > 0) {
      response = ResponseOption.NO; // Unlikely to bias
      risk = RiskLevel.LOW;
    }
    
    return createQualityItem(
      'sq3.2',
      'Is there evidence that the result was not biased by missing outcome data?',
      response,
      {
        guidance: 'Look for appropriate handling of missing data (imputation, sensitivity analysis)',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.6 : 0.3,
      }
    );
  }
  
  /**
   * Determine Domain 3 overall risk
   */
  private determineDomain3Risk(items: any[]): RiskLevel {
    const [sq1, sq2] = items;
    
    // High risk if high attrition AND likely bias
    if (sq1.response === ResponseOption.NO) {
      return RiskLevel.HIGH;
    }
    
    // Low risk if complete data OR appropriate handling
    if (sq1.response === ResponseOption.YES || sq2.response === ResponseOption.NO) {
      return RiskLevel.LOW;
    }
    
    return RiskLevel.SOME_CONCERNS;
  }
  
  /**
   * Domain 4: Bias in measurement of the outcome
   */
  private async assessDomain4Measurement(_fullText: string, methodsText: string) {
    const sq1 = this.assessOutcomeMeasurement(methodsText);
    const sq2 = this.assessOutcomeAssessorBlinding(methodsText);
    
    const items = [sq1, sq2];
    const overall_risk = this.determineDomain4Risk(items);
    
    return createQualityDomain(
      'domain4',
      'Bias in measurement of the outcome',
      items,
      {
        description: 'Assessment of outcome measurement and assessor blinding',
        overall_risk,
        rationale: this.generateDomain4Rationale(items, overall_risk),
        applicable: true,
      }
    );
  }
  
  /**
   * SQ 4.1: Was outcome measurement appropriate?
   */
  private assessOutcomeMeasurement(text: string) {
    const keywords = [
      'validated',
      'objective',
      'standardized',
      'reliable',
      'valid measure',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (evidence.length > 0) {
      response = ResponseOption.YES;
      risk = RiskLevel.LOW;
    }
    
    return createQualityItem(
      'sq4.1',
      'Was the method of measuring the outcome inappropriate?',
      response,
      {
        guidance: 'Look for validated, objective, or standardized outcome measures',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.7 : 0.3,
      }
    );
  }
  
  /**
   * SQ 4.2: Were outcome assessors blinded?
   */
  private assessOutcomeAssessorBlinding(text: string) {
    const keywords = [
      'assessor blind',
      'blinded assessment',
      'masked assessment',
      'independent assessor',
      'objective outcome',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (evidence.length > 0) {
      response = ResponseOption.YES;
      risk = RiskLevel.LOW;
    }
    
    return createQualityItem(
      'sq4.2',
      'Could measurement or ascertainment of the outcome have differed between groups?',
      response,
      {
        guidance: 'Look for blinded outcome assessment or objective outcomes',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.7 : 0.3,
      }
    );
  }
  
  /**
   * Determine Domain 4 overall risk
   */
  private determineDomain4Risk(items: any[]): RiskLevel {
    const [sq1, sq2] = items;
    
    // High risk if inappropriate measurement OR unblinded assessment
    if (sq1.response === ResponseOption.NO || sq2.response === ResponseOption.YES) {
      return RiskLevel.HIGH;
    }
    
    // Low risk if appropriate AND blinded
    if (sq1.response === ResponseOption.YES && sq2.response === ResponseOption.NO) {
      return RiskLevel.LOW;
    }
    
    return RiskLevel.SOME_CONCERNS;
  }
  
  /**
   * Domain 5: Bias in selection of the reported result
   */
  private async assessDomain5Reporting(fullText: string, resultsText: string) {
    const sq1 = this.assessPrespecification(fullText);
    const sq2 = this.assessSelectiveReporting(resultsText);
    
    const items = [sq1, sq2];
    const overall_risk = this.determineDomain5Risk(items);
    
    return createQualityDomain(
      'domain5',
      'Bias in selection of the reported result',
      items,
      {
        description: 'Assessment of outcome reporting and selective reporting',
        overall_risk,
        rationale: this.generateDomain5Rationale(items, overall_risk),
        applicable: true,
      }
    );
  }
  
  /**
   * SQ 5.1: Were outcomes pre-specified?
   */
  private assessPrespecification(text: string) {
    const keywords = [
      'pre-specified',
      'prespecified',
      'protocol',
      'registered',
      'clinicaltrials.gov',
      'primary outcome',
      'secondary outcome',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (evidence.length > 0) {
      response = ResponseOption.YES;
      risk = RiskLevel.LOW;
    }
    
    return createQualityItem(
      'sq5.1',
      'Were the data that produced this result analyzed in accordance with a pre-specified analysis plan?',
      response,
      {
        guidance: 'Look for trial registration, protocol, or pre-specified outcomes',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.7 : 0.3,
      }
    );
  }
  
  /**
   * SQ 5.2: Is there evidence of selective reporting?
   */
  private assessSelectiveReporting(text: string) {
    const keywords = [
      'all outcomes reported',
      'no selective reporting',
      'protocol outcomes',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'results');
    
    let response = ResponseOption.UNCLEAR;
    let risk = RiskLevel.UNCLEAR;
    
    if (evidence.length > 0) {
      response = ResponseOption.NO; // No selective reporting
      risk = RiskLevel.LOW;
    }
    
    return createQualityItem(
      'sq5.2',
      'Is the numerical result being assessed likely to have been selected on the basis of results from multiple analyses?',
      response,
      {
        guidance: 'Look for evidence that all pre-specified outcomes were reported',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.6 : 0.3,
      }
    );
  }
  
  /**
   * Determine Domain 5 overall risk
   */
  private determineDomain5Risk(items: any[]): RiskLevel {
    const [sq1, sq2] = items;
    
    // High risk if not pre-specified OR selective reporting
    if (sq1.response === ResponseOption.NO || sq2.response === ResponseOption.YES) {
      return RiskLevel.HIGH;
    }
    
    // Low risk if pre-specified AND no selective reporting
    if (sq1.response === ResponseOption.YES && sq2.response === ResponseOption.NO) {
      return RiskLevel.LOW;
    }
    
    return RiskLevel.SOME_CONCERNS;
  }
  
  /**
   * Calculate overall confidence in auto-assessment
   */
  private calculateConfidence(domains: any[]): number {
    const itemConfidences = domains
      .flatMap(d => d.items)
      .map(i => i.confidence || 0);
    
    if (itemConfidences.length === 0) return 0;
    
    const avgConfidence = itemConfidences.reduce((a, b) => a + b, 0) / itemConfidences.length;
    return avgConfidence;
  }
  
  /**
   * Generate rationale for overall judgment
   */
  private generateOverallRationale(domains: any[], overall_risk: RiskLevel): string {
    const highRiskDomains = domains.filter(d => d.overall_risk === RiskLevel.HIGH);
    const someConcernsDomains = domains.filter(d => d.overall_risk === RiskLevel.SOME_CONCERNS);
    
    if (overall_risk === RiskLevel.HIGH) {
      return `High risk of bias due to: ${highRiskDomains.map(d => d.name).join(', ')}`;
    } else if (overall_risk === RiskLevel.SOME_CONCERNS) {
      return `Some concerns about bias in: ${someConcernsDomains.map(d => d.name).join(', ')}`;
    } else {
      return 'Low risk of bias across all domains';
    }
  }
  
  /**
   * Generate domain-specific rationales
   */
  private generateDomain1Rationale(_items: any[], risk: RiskLevel): string {
    if (risk === RiskLevel.LOW) {
      return 'Adequate randomization sequence generation and allocation concealment with balanced baseline characteristics';
    } else if (risk === RiskLevel.HIGH) {
      return 'Problems with randomization process or significant baseline imbalances';
    }
    return 'Insufficient information about randomization process';
  }
  
  private generateDomain2Rationale(_items: any[], risk: RiskLevel): string {
    if (risk === RiskLevel.LOW) {
      return 'Adequate blinding and intention-to-treat analysis';
    } else if (risk === RiskLevel.HIGH) {
      return 'Lack of blinding with protocol deviations or per-protocol analysis';
    }
    return 'Some concerns about blinding or analysis approach';
  }
  
  private generateDomain3Rationale(_items: any[], risk: RiskLevel): string {
    if (risk === RiskLevel.LOW) {
      return 'Complete or nearly complete outcome data with appropriate handling of missing data';
    } else if (risk === RiskLevel.HIGH) {
      return 'High attrition rate with potential for bias';
    }
    return 'Some missing data with unclear impact on results';
  }
  
  private generateDomain4Rationale(_items: any[], risk: RiskLevel): string {
    if (risk === RiskLevel.LOW) {
      return 'Appropriate outcome measurement with blinded assessment';
    } else if (risk === RiskLevel.HIGH) {
      return 'Inappropriate outcome measurement or unblinded assessment';
    }
    return 'Unclear outcome measurement methods or assessor blinding';
  }
  
  private generateDomain5Rationale(_items: any[], risk: RiskLevel): string {
    if (risk === RiskLevel.LOW) {
      return 'Pre-specified outcomes with no evidence of selective reporting';
    } else if (risk === RiskLevel.HIGH) {
      return 'Outcomes not pre-specified or evidence of selective reporting';
    }
    return 'Unclear whether outcomes were pre-specified';
  }
  
  /**
   * Get reasons for manual review
   */
  private getReviewReasons(domains: any[], confidence: number): string[] {
    const reasons: string[] = [];
    
    if (confidence < 0.5) {
      reasons.push('Low confidence in auto-assessment (<50%)');
    }
    
    const highRiskDomains = domains.filter(d => d.overall_risk === RiskLevel.HIGH);
    if (highRiskDomains.length > 0) {
      reasons.push(`High risk of bias in: ${highRiskDomains.map(d => d.name).join(', ')}`);
    }
    
    const unclearItems = domains.flatMap(d => d.items).filter(i => i.response === ResponseOption.UNCLEAR);
    if (unclearItems.length > 5) {
      reasons.push(`Many unclear responses (${unclearItems.length} items)`);
    }
    
    return reasons;
  }
}

/**
 * MCP tool interface for RoB 2.0 assessment
 */
export async function assessQualityRoB2(args: {
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
    const tool = new RoB2Tool();
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
    logger.error('Error assessing RCT quality with RoB 2.0', {
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
