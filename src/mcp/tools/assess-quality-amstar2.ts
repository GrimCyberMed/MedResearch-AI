/**
 * AMSTAR-2 Quality Assessment Tool
 * 
 * A MeaSurement Tool to Assess systematic Reviews (AMSTAR-2)
 * Simplified implementation focusing on 7 critical domains
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
 * AMSTAR-2 implementation (simplified - 7 critical items)
 */
export class AMSTAR2Tool extends QualityAssessmentTool {
  readonly tool = QualityTool.AMSTAR2;
  readonly version = '2.0';
  readonly name = 'AMSTAR-2 (Simplified)';
  readonly description = 'Critical appraisal of systematic reviews - 7 critical items';
  
  readonly applicableDesigns = [
    StudyDesignType.SYSTEMATIC_REVIEW,
    StudyDesignType.META_ANALYSIS,
  ];
  
  /**
   * Assess systematic review quality using AMSTAR-2
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
    logger.info('Assessing systematic review quality using AMSTAR-2', {
      study_id: study.id,
      design: study.design,
    });
    
    this.validateDesign(study.design);
    
    const methods = study.methods || study.abstract || '';
    const results = study.results || '';
    
    // Assess 7 critical domains
    const domain1 = await this.assessProtocol(methods);
    const domain2 = await this.assessSearch(methods);
    const domain3 = await this.assessSelection(methods);
    const domain4 = await this.assessExtraction(methods);
    const domain5 = await this.assessRiskOfBias(methods);
    const domain6 = await this.assessMetaAnalysis(methods, results);
    const domain7 = await this.assessPublicationBias(methods, results);
    
    const domains = [domain1, domain2, domain3, domain4, domain5, domain6, domain7];
    
    // Calculate overall rating
    const overall_rating = this.calculateAMSTARRating(domains);
    const confidence = this.calculateConfidence(domains);
    
    const assessment: QualityAssessment = {
      study_id: study.id,
      study_design: study.design,
      tool: this.tool,
      tool_version: this.version,
      domains,
      overall_rating,
      overall_rationale: this.getRationale(overall_rating, domains),
      auto_assessed: true,
      confidence,
      requires_review: confidence < 0.5 || overall_rating === QualityRating.CRITICALLY_LOW,
      review_reasons: this.getReviewReasons(confidence, overall_rating, domains),
    };
    
    logger.info('AMSTAR-2 assessment complete', {
      study_id: study.id,
      overall_rating,
      confidence,
    });
    
    return assessment;
  }
  
  // Critical Item 1: Protocol and registration
  private async assessProtocol(methods: string) {
    const keywords = ['PROSPERO', 'registered', 'protocol', 'pre-specified', 'a priori'];
    const evidence = this.extractEvidence(methods, keywords, 'methods');
    
    const response = evidence.length >= 2 ? ResponseOption.YES :
                    evidence.length === 1 ? ResponseOption.PARTIAL_YES :
                    ResponseOption.NO;
    
    const item = createQualityItem('protocol', 'Was the review registered or protocol published?', response, {
      guidance: 'PROSPERO registration or published protocol',
      evidence,
      auto_assessed: true,
      confidence: evidence.length > 0 ? 0.7 : 0.3,
    });
    
    return createQualityDomain('item2', 'Protocol and registration', [item], {
      description: 'Was the review protocol established prior to conduct?',
      overall_rating: response === ResponseOption.YES ? QualityRating.GOOD : 
                     response === ResponseOption.PARTIAL_YES ? QualityRating.FAIR :
                     QualityRating.POOR,
    });
  }
  
  // Critical Item 2: Comprehensive search
  private async assessSearch(methods: string) {
    const keywords = ['PubMed', 'MEDLINE', 'Embase', 'Cochrane', 'grey literature', 'reference'];
    const evidence = this.extractEvidence(methods, keywords, 'methods');
    
    const response = evidence.length >= 3 ? ResponseOption.YES :
                    evidence.length >= 2 ? ResponseOption.PARTIAL_YES :
                    ResponseOption.NO;
    
    const item = createQualityItem('search', 'Was a comprehensive search strategy used?', response, {
      guidance: 'Multiple databases plus supplementary sources',
      evidence,
      auto_assessed: true,
      confidence: evidence.length > 0 ? 0.6 : 0.3,
    });
    
    return createQualityDomain('item4', 'Comprehensive literature search', [item], {
      description: 'Was a comprehensive search strategy used?',
      overall_rating: response === ResponseOption.YES ? QualityRating.GOOD :
                     response === ResponseOption.PARTIAL_YES ? QualityRating.FAIR :
                     QualityRating.POOR,
    });
  }
  
  // Critical Item 3: Duplicate study selection
  private async assessSelection(methods: string) {
    const keywords = ['two reviewers', 'independently', 'duplicate', 'screening'];
    const evidence = this.extractEvidence(methods, keywords, 'methods');
    
    const response = evidence.length >= 2 ? ResponseOption.YES : ResponseOption.NO;
    
    const item = createQualityItem('selection', 'Was study selection performed in duplicate?', response, {
      guidance: 'Two reviewers independently screened studies',
      evidence,
      auto_assessed: true,
      confidence: evidence.length > 0 ? 0.7 : 0.3,
    });
    
    return createQualityDomain('item5', 'Duplicate study selection', [item], {
      description: 'Was study selection performed in duplicate?',
      overall_rating: response === ResponseOption.YES ? QualityRating.GOOD : QualityRating.POOR,
    });
  }
  
  // Critical Item 4: Duplicate data extraction
  private async assessExtraction(methods: string) {
    const keywords = ['two reviewers', 'independently', 'data extraction', 'extracted'];
    const evidence = this.extractEvidence(methods, keywords, 'methods');
    
    const response = evidence.length >= 2 ? ResponseOption.YES : ResponseOption.NO;
    
    const item = createQualityItem('extraction', 'Was data extraction performed in duplicate?', response, {
      guidance: 'Two reviewers independently extracted data',
      evidence,
      auto_assessed: true,
      confidence: evidence.length > 0 ? 0.7 : 0.3,
    });
    
    return createQualityDomain('item6', 'Duplicate data extraction', [item], {
      description: 'Was data extraction performed in duplicate?',
      overall_rating: response === ResponseOption.YES ? QualityRating.GOOD : QualityRating.POOR,
    });
  }
  
  // Critical Item 5: Risk of bias assessment
  private async assessRiskOfBias(methods: string) {
    const keywords = ['risk of bias', 'Cochrane', 'RoB', 'Newcastle-Ottawa', 'quality assessment'];
    const evidence = this.extractEvidence(methods, keywords, 'methods');
    
    const response = evidence.length >= 2 ? ResponseOption.YES : ResponseOption.NO;
    
    const item = createQualityItem('rob', 'Was a satisfactory RoB assessment performed?', response, {
      guidance: 'Validated tool like Cochrane RoB or Newcastle-Ottawa',
      evidence,
      auto_assessed: true,
      confidence: evidence.length > 0 ? 0.7 : 0.3,
    });
    
    return createQualityDomain('item9', 'Risk of bias assessment', [item], {
      description: 'Was a satisfactory technique used to assess risk of bias?',
      overall_rating: response === ResponseOption.YES ? QualityRating.GOOD : QualityRating.POOR,
    });
  }
  
  // Critical Item 6: Meta-analysis methods (if applicable)
  private async assessMetaAnalysis(methods: string, results: string) {
    const text = methods + ' ' + results;
    const keywords = ['meta-analysis', 'random effects', 'fixed effects', 'heterogeneity', 'I²'];
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    // Check if meta-analysis was performed
    const hasMeta = /meta-analysis/i.test(text);
    
    if (!hasMeta) {
      const item = createQualityItem('meta', 'Meta-analysis methods', ResponseOption.NOT_APPLICABLE, {
        guidance: 'No meta-analysis performed',
        auto_assessed: true,
        confidence: 0.8,
      });
      
      return createQualityDomain('item11', 'Meta-analysis methods', [item], {
        description: 'Were appropriate methods used for meta-analysis?',
        overall_rating: QualityRating.GOOD, // N/A counts as good
        applicable: false,
      });
    }
    
    const response = evidence.length >= 2 ? ResponseOption.YES : ResponseOption.NO;
    
    const item = createQualityItem('meta', 'Were appropriate meta-analysis methods used?', response, {
      guidance: 'Random/fixed effects, heterogeneity assessment',
      evidence,
      auto_assessed: true,
      confidence: evidence.length > 0 ? 0.6 : 0.3,
    });
    
    return createQualityDomain('item11', 'Meta-analysis methods', [item], {
      description: 'Were appropriate methods used for meta-analysis?',
      overall_rating: response === ResponseOption.YES ? QualityRating.GOOD : QualityRating.POOR,
    });
  }
  
  // Critical Item 7: Publication bias
  private async assessPublicationBias(methods: string, results: string) {
    const text = methods + ' ' + results;
    const keywords = ['publication bias', 'funnel plot', 'Egger', 'asymmetry'];
    const evidence = this.extractEvidence(text, keywords, 'methods');
    
    const response = evidence.length >= 1 ? ResponseOption.YES : ResponseOption.NO;
    
    const item = createQualityItem('pub_bias', 'Was publication bias investigated?', response, {
      guidance: 'Funnel plot, Egger test, or similar',
      evidence,
      auto_assessed: true,
      confidence: evidence.length > 0 ? 0.6 : 0.3,
    });
    
    return createQualityDomain('item14', 'Publication bias assessment', [item], {
      description: 'Was publication bias investigated?',
      overall_rating: response === ResponseOption.YES ? QualityRating.GOOD : QualityRating.POOR,
    });
  }
  
  /**
   * Calculate AMSTAR-2 overall rating
   */
  private calculateAMSTARRating(domains: any[]): QualityRating {
    const criticalNo = domains.filter(d => 
      d.applicable !== false && d.overall_rating === QualityRating.POOR
    ).length;
    
    // AMSTAR-2 algorithm (simplified)
    if (criticalNo === 0) {
      return QualityRating.HIGH;
    } else if (criticalNo === 1) {
      return QualityRating.MODERATE;
    } else if (criticalNo === 2) {
      return QualityRating.LOW;
    } else {
      return QualityRating.CRITICALLY_LOW;
    }
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
   * Get rationale for rating
   */
  private getRationale(rating: QualityRating, domains: any[]): string {
    const criticalNo = domains.filter(d => 
      d.applicable !== false && d.overall_rating === QualityRating.POOR
    ).length;
    
    if (rating === QualityRating.HIGH) {
      return 'No critical weaknesses identified';
    } else if (rating === QualityRating.MODERATE) {
      return 'One critical weakness identified';
    } else if (rating === QualityRating.LOW) {
      return 'Two critical weaknesses identified';
    } else {
      return `${criticalNo} critical weaknesses identified`;
    }
  }
  
  /**
   * Get review reasons
   */
  private getReviewReasons(confidence: number, rating: QualityRating, domains: any[]): string[] {
    const reasons: string[] = [];
    
    if (confidence < 0.5) {
      reasons.push('Low confidence in auto-assessment (<50%)');
    }
    
    if (rating === QualityRating.CRITICALLY_LOW) {
      reasons.push('Critically low quality - multiple critical weaknesses');
    }
    
    const unclearCount = domains.reduce((count: number, d: any) => 
      count + d.items.filter((i: any) => i.response === ResponseOption.UNCLEAR).length, 0
    );
    
    if (unclearCount > 3) {
      reasons.push(`Many unclear responses (${unclearCount} items)`);
    }
    
    return reasons;
  }
}

/**
 * MCP tool interface for AMSTAR-2 assessment
 */
export async function assessQualityAMSTAR2(args: {
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
    const tool = new AMSTAR2Tool();
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
    logger.error('Error assessing systematic review quality with AMSTAR-2', {
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
