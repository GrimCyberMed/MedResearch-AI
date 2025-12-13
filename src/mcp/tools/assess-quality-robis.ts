/**
 * ROBIS Quality Assessment Tool
 * 
 * Risk Of Bias In Systematic reviews
 * Tool for assessing risk of bias in systematic reviews
 * 
 * Phase 1: Assess relevance (optional)
 * Phase 2: Identify concerns with review process (4 domains)
 * Phase 3: Judge risk of bias
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
 * ROBIS implementation (simplified - 4 domains)
 */
export class ROBISTool extends QualityAssessmentTool {
  readonly tool = QualityTool.ROBIS;
  readonly version = '1.0';
  readonly name = 'ROBIS';
  readonly description = 'Risk of bias in systematic reviews';
  
  readonly applicableDesigns = [
    StudyDesignType.SYSTEMATIC_REVIEW,
    StudyDesignType.META_ANALYSIS,
  ];
  
  /**
   * Assess systematic review bias using ROBIS
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
    logger.info('Assessing systematic review bias using ROBIS', {
      study_id: study.id,
      design: study.design,
    });
    
    this.validateDesign(study.design);
    
    const methods = study.methods || study.abstract || '';
    const results = study.results || '';
    
    // Phase 2: Assess 4 domains
    const domain1 = await this.assessDomain1Eligibility(methods);
    const domain2 = await this.assessDomain2Identification(methods);
    const domain3 = await this.assessDomain3DataCollection(methods);
    const domain4 = await this.assessDomain4Synthesis(methods, results);
    
    const domains = [domain1, domain2, domain3, domain4];
    
    // Phase 3: Calculate overall risk of bias
    const overall_risk = this.calculateOverallRisk(domains);
    const confidence = this.calculateConfidence(domains);
    
    const assessment: QualityAssessment = {
      study_id: study.id,
      study_design: study.design,
      tool: this.tool,
      tool_version: this.version,
      domains,
      overall_risk,
      overall_rationale: this.getRationale(overall_risk, domains),
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
      } as QualityAssessment),
      review_reasons: this.getReviewReasons(confidence, overall_risk, domains),
    };
    
    logger.info('ROBIS assessment complete', {
      study_id: study.id,
      overall_risk,
      confidence,
    });
    
    return assessment;
  }
  
  // Domain 1: Study eligibility criteria
  private async assessDomain1Eligibility(methods: string) {
    const keywords = [
      'inclusion criteria', 'exclusion criteria', 'eligibility', 
      'PICO', 'population', 'intervention', 'outcome'
    ];
    const evidence = this.extractEvidence(methods, keywords, 'methods');
    
    // High concern if criteria not clearly defined
    const response = evidence.length >= 3 ? ResponseOption.YES :
                    evidence.length >= 1 ? ResponseOption.UNCLEAR :
                    ResponseOption.NO;
    
    const risk = response === ResponseOption.YES ? RiskLevel.LOW :
                response === ResponseOption.UNCLEAR ? RiskLevel.UNCLEAR :
                RiskLevel.HIGH;
    
    const item = createQualityItem(
      'eligibility',
      'Were eligibility criteria appropriate and clearly defined?',
      response,
      {
        guidance: 'PICO components, inclusion/exclusion criteria clearly stated',
        risk,
        evidence,
        auto_assessed: true,
        confidence: evidence.length > 0 ? 0.6 : 0.3,
      }
    );
    
    return createQualityDomain('domain1', 'Study eligibility criteria', [item], {
      description: 'Concerns about specification of study eligibility criteria',
      overall_risk: risk,
    });
  }
  
  // Domain 2: Identification and selection of studies
  private async assessDomain2Identification(methods: string) {
    const searchKeywords = ['PubMed', 'MEDLINE', 'Embase', 'Cochrane', 'search strategy'];
    const selectionKeywords = ['two reviewers', 'independently', 'screening', 'duplicate'];
    
    const searchEvidence = this.extractEvidence(methods, searchKeywords, 'methods');
    const selectionEvidence = this.extractEvidence(methods, selectionKeywords, 'methods');
    
    // Need both comprehensive search AND duplicate selection
    const hasSearch = searchEvidence.length >= 2;
    const hasSelection = selectionEvidence.length >= 2;
    
    const response = (hasSearch && hasSelection) ? ResponseOption.YES :
                    (hasSearch || hasSelection) ? ResponseOption.UNCLEAR :
                    ResponseOption.NO;
    
    const risk = response === ResponseOption.YES ? RiskLevel.LOW :
                response === ResponseOption.UNCLEAR ? RiskLevel.UNCLEAR :
                RiskLevel.HIGH;
    
    const allEvidence = [...searchEvidence, ...selectionEvidence];
    
    const item = createQualityItem(
      'identification',
      'Were search and selection methods appropriate?',
      response,
      {
        guidance: 'Comprehensive search strategy and duplicate selection',
        risk,
        evidence: allEvidence,
        auto_assessed: true,
        confidence: allEvidence.length > 0 ? 0.6 : 0.3,
      }
    );
    
    return createQualityDomain('domain2', 'Identification and selection of studies', [item], {
      description: 'Concerns about methods used to identify and select studies',
      overall_risk: risk,
    });
  }
  
  // Domain 3: Data collection and study appraisal
  private async assessDomain3DataCollection(methods: string) {
    const extractionKeywords = ['data extraction', 'extracted', 'two reviewers', 'independently'];
    const appraisalKeywords = ['risk of bias', 'quality assessment', 'Cochrane', 'Newcastle-Ottawa'];
    
    const extractionEvidence = this.extractEvidence(methods, extractionKeywords, 'methods');
    const appraisalEvidence = this.extractEvidence(methods, appraisalKeywords, 'methods');
    
    const hasExtraction = extractionEvidence.length >= 2;
    const hasAppraisal = appraisalEvidence.length >= 2;
    
    const response = (hasExtraction && hasAppraisal) ? ResponseOption.YES :
                    (hasExtraction || hasAppraisal) ? ResponseOption.UNCLEAR :
                    ResponseOption.NO;
    
    const risk = response === ResponseOption.YES ? RiskLevel.LOW :
                response === ResponseOption.UNCLEAR ? RiskLevel.UNCLEAR :
                RiskLevel.HIGH;
    
    const allEvidence = [...extractionEvidence, ...appraisalEvidence];
    
    const item = createQualityItem(
      'data_collection',
      'Were data collection and study appraisal appropriate?',
      response,
      {
        guidance: 'Duplicate extraction and validated quality assessment tool',
        risk,
        evidence: allEvidence,
        auto_assessed: true,
        confidence: allEvidence.length > 0 ? 0.6 : 0.3,
      }
    );
    
    return createQualityDomain('domain3', 'Data collection and study appraisal', [item], {
      description: 'Concerns about methods used to collect data and appraise studies',
      overall_risk: risk,
    });
  }
  
  // Domain 4: Synthesis and findings
  private async assessDomain4Synthesis(methods: string, results: string) {
    const text = methods + ' ' + results;
    
    const synthesisKeywords = ['meta-analysis', 'synthesis', 'pooled', 'combined'];
    const heterogeneityKeywords = ['heterogeneity', 'I²', 'subgroup', 'sensitivity'];
    const biasKeywords = ['publication bias', 'funnel plot', 'Egger'];
    
    const synthesisEvidence = this.extractEvidence(text, synthesisKeywords, 'methods');
    const heterogeneityEvidence = this.extractEvidence(text, heterogeneityKeywords, 'methods');
    const biasEvidence = this.extractEvidence(text, biasKeywords, 'methods');
    
    // Check if meta-analysis was performed
    const hasMeta = /meta-analysis/i.test(text);
    
    if (!hasMeta) {
      // Narrative synthesis - less stringent requirements
      const response = synthesisEvidence.length >= 1 ? ResponseOption.YES : ResponseOption.UNCLEAR;
      const risk = response === ResponseOption.YES ? RiskLevel.LOW : RiskLevel.UNCLEAR;
      
      const item = createQualityItem(
        'synthesis',
        'Was the synthesis appropriate?',
        response,
        {
          guidance: 'Narrative synthesis with appropriate methods',
          risk,
          evidence: synthesisEvidence,
          auto_assessed: true,
          confidence: 0.5,
        }
      );
      
      return createQualityDomain('domain4', 'Synthesis and findings', [item], {
        description: 'Concerns about synthesis methods',
        overall_risk: risk,
      });
    }
    
    // Meta-analysis - need heterogeneity assessment and publication bias
    const hasSynthesis = synthesisEvidence.length >= 1;
    const hasHeterogeneity = heterogeneityEvidence.length >= 1;
    const hasBias = biasEvidence.length >= 1;
    
    const response = (hasSynthesis && hasHeterogeneity && hasBias) ? ResponseOption.YES :
                    (hasSynthesis && (hasHeterogeneity || hasBias)) ? ResponseOption.UNCLEAR :
                    ResponseOption.NO;
    
    const risk = response === ResponseOption.YES ? RiskLevel.LOW :
                response === ResponseOption.UNCLEAR ? RiskLevel.UNCLEAR :
                RiskLevel.HIGH;
    
    const allEvidence = [...synthesisEvidence, ...heterogeneityEvidence, ...biasEvidence];
    
    const item = createQualityItem(
      'synthesis',
      'Was the meta-analysis synthesis appropriate?',
      response,
      {
        guidance: 'Appropriate methods, heterogeneity assessment, publication bias',
        risk,
        evidence: allEvidence,
        auto_assessed: true,
        confidence: allEvidence.length > 0 ? 0.6 : 0.3,
      }
    );
    
    return createQualityDomain('domain4', 'Synthesis and findings', [item], {
      description: 'Concerns about synthesis and findings',
      overall_risk: risk,
    });
  }
  
  /**
   * Calculate confidence
   */
  protected calculateConfidence(domains: any[]): number {
    const allItems = domains.flatMap((d: any) => d.items);
    const confidences = allItems
      .map((item: any) => item.confidence || 0)
      .filter((c: number) => c > 0);
    
    if (confidences.length === 0) return 0.3;
    
    return confidences.reduce((sum: number, c: number) => sum + c, 0) / confidences.length;
  }
  
  /**
   * Get rationale for overall risk
   */
  private getRationale(risk: RiskLevel, domains: any[]): string {
    const highRiskDomains = domains.filter(d => d.overall_risk === RiskLevel.HIGH);
    const unclearDomains = domains.filter(d => d.overall_risk === RiskLevel.UNCLEAR);
    
    if (risk === RiskLevel.LOW) {
      return 'Low risk of bias across all domains';
    } else if (risk === RiskLevel.HIGH) {
      return `High risk of bias in ${highRiskDomains.length} domain(s): ${highRiskDomains.map((d: any) => d.name).join(', ')}`;
    } else {
      return `Unclear risk in ${unclearDomains.length} domain(s), no high risk domains`;
    }
  }
  
  /**
   * Get review reasons
   */
  private getReviewReasons(confidence: number, risk: RiskLevel, domains: any[]): string[] {
    const reasons: string[] = [];
    
    if (confidence < 0.5) {
      reasons.push('Low confidence in auto-assessment (<50%)');
    }
    
    if (risk === RiskLevel.HIGH) {
      reasons.push('High risk of bias identified');
    }
    
    const unclearCount = domains.reduce((count: number, d: any) => 
      count + d.items.filter((i: any) => i.response === ResponseOption.UNCLEAR).length, 0
    );
    
    if (unclearCount > 2) {
      reasons.push(`Many unclear responses (${unclearCount} items)`);
    }
    
    return reasons;
  }
}

/**
 * MCP tool interface for ROBIS assessment
 */
export async function assessQualityROBIS(args: {
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
    const tool = new ROBISTool();
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
    logger.error('Error assessing systematic review bias with ROBIS', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Error assessing bias: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
