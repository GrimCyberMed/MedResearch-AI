/**
 * CASP Qualitative Checklist
 * 
 * Critical Appraisal Skills Programme - Qualitative Research Checklist
 * 
 * 10-item checklist for assessing the quality of qualitative research studies
 * including phenomenology, grounded theory, ethnography, and qualitative descriptive studies.
 * 
 * @see https://casp-uk.net/casp-tools-checklists/
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
 * CASP Qualitative Tool
 */
export class CASPQualitativeTool extends QualityAssessmentTool {
  readonly tool = QualityTool.CASP_QUALITATIVE;
  readonly version = '1.0';
  readonly name = 'CASP Qualitative Research Checklist';
  readonly description = 'Critical appraisal of qualitative research studies';
  
  readonly applicableDesigns = [
    StudyDesignType.PHENOMENOLOGY,
    StudyDesignType.GROUNDED_THEORY,
    StudyDesignType.ETHNOGRAPHY,
    StudyDesignType.QUALITATIVE_DESCRIPTIVE,
    StudyDesignType.CONVERGENT,
    StudyDesignType.EXPLANATORY_SEQUENTIAL,
    StudyDesignType.EXPLORATORY_SEQUENTIAL,
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
    logger.info('Assessing qualitative study quality using CASP', {
      study_id: study.id,
      design: study.design,
    });
    
    this.validateDesign(study.design);
    
    const combinedText = [
      study.title,
      study.abstract || '',
      study.methods || '',
      study.results || '',
      study.discussion || '',
      study.full_text || '',
    ].join(' ');
    
    // CASP has 3 sections
    const screeningDomain = await this.assessScreening(combinedText, study.methods || study.abstract || '');
    const rigorDomain = await this.assessRigor(combinedText, study.methods || study.abstract || '');
    const resultsDomain = await this.assessResults(combinedText, study.results || study.abstract || '');
    
    const domains = [screeningDomain, rigorDomain, resultsDomain];
    
    // Calculate overall quality
    const totalYes = domains
      .flatMap(d => d.items)
      .filter(i => i.response === ResponseOption.YES).length;
    
    const totalQuestions = domains.flatMap(d => d.items).length;
    const percentageYes = (totalYes / totalQuestions) * 100;
    
    let overallRating: QualityRating;
    if (percentageYes >= 80) {
      overallRating = QualityRating.GOOD;
    } else if (percentageYes >= 60) {
      overallRating = QualityRating.FAIR;
    } else {
      overallRating = QualityRating.POOR;
    }
    
    const confidence = this.calculateConfidence(domains);
    
    const assessment: QualityAssessment = {
      study_id: study.id,
      study_design: study.design,
      tool: this.tool,
      tool_version: this.version,
      domains,
      overall_score: totalYes,
      overall_rating: overallRating,
      overall_rationale: `${totalYes}/${totalQuestions} criteria met (${percentageYes.toFixed(0)}%)`,
      auto_assessed: true,
      confidence,
      requires_review: this.requiresReview({
        study_id: study.id,
        study_design: study.design,
        tool: this.tool,
        tool_version: this.version,
        domains,
        overall_score: totalYes,
        overall_rating: overallRating,
        auto_assessed: true,
        confidence,
        requires_review: false,
      }),
      review_reasons: this.getReviewReasons(overallRating, confidence),
    };
    
    logger.info('CASP assessment complete', {
      study_id: study.id,
      score: `${totalYes}/${totalQuestions}`,
      rating: overallRating,
      confidence,
    });
    
    return assessment;
  }
  
  /**
   * Section A: Screening Questions (2 questions)
   * These determine if the study is worth continuing
   */
  private async assessScreening(_fullText: string, methodsText: string) {
    const q1 = this.assessClearAims(methodsText);
    const q2 = this.assessAppropriateMethodology(methodsText);
    
    const items = [q1, q2];
    const yesCount = items.filter(i => i.response === ResponseOption.YES).length;
    
    return createQualityDomain(
      'screening',
      'Screening Questions',
      items,
      {
        description: 'Is the study worth continuing? (Aims and methodology)',
        overall_rating: yesCount === 2 ? QualityRating.GOOD : yesCount === 1 ? QualityRating.FAIR : QualityRating.POOR,
        rationale: `${yesCount}/2 screening criteria met`,
        applicable: true,
      }
    );
  }
  
  private assessClearAims(text: string) {
    const keywords = [
      'aim',
      'aims',
      'objective',
      'objectives',
      'purpose',
      'goal',
      'research question',
      'explore',
      'understand',
      'investigate',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'q1',
      'Was there a clear statement of the aims of the research?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'What was the goal of the research? Why was it thought important?',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessAppropriateMethodology(text: string) {
    const qualitativeKeywords = [
      'qualitative',
      'interview',
      'focus group',
      'thematic analysis',
      'grounded theory',
      'phenomenology',
      'ethnography',
      'narrative',
      'content analysis',
      'participant observation',
    ];
    
    const evidence = this.extractEvidence(text, qualitativeKeywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'q2',
      'Is a qualitative methodology appropriate?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'If the research seeks to interpret or illuminate the actions/subjective experiences of research participants',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  /**
   * Section B: Detailed Questions - Is it worth continuing? (6 questions)
   */
  private async assessRigor(_fullText: string, methodsText: string) {
    const q3 = this.assessResearchDesign(methodsText);
    const q4 = this.assessRecruitmentStrategy(methodsText);
    const q5 = this.assessDataCollection(methodsText);
    const q6 = this.assessResearcherParticipantRelationship(methodsText);
    const q7 = this.assessEthicalIssues(methodsText);
    const q8 = this.assessDataAnalysis(methodsText);
    
    const items = [q3, q4, q5, q6, q7, q8];
    const yesCount = items.filter(i => i.response === ResponseOption.YES).length;
    
    return createQualityDomain(
      'rigor',
      'Methodological Rigor',
      items,
      {
        description: 'Was the research design appropriate and rigorous?',
        overall_rating: yesCount >= 5 ? QualityRating.GOOD : yesCount >= 3 ? QualityRating.FAIR : QualityRating.POOR,
        rationale: `${yesCount}/6 rigor criteria met`,
        applicable: true,
      }
    );
  }
  
  private assessResearchDesign(text: string) {
    const keywords = [
      'research design',
      'methodology',
      'approach',
      'phenomenological',
      'grounded theory',
      'ethnographic',
      'case study',
      'justified',
      'appropriate',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q3',
      'Was the research design appropriate to address the aims of the research?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Has the researcher justified the research design (e.g., have they discussed how they decided which method to use)?',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessRecruitmentStrategy(text: string) {
    const keywords = [
      'recruitment',
      'sampling',
      'purposive',
      'theoretical sampling',
      'snowball',
      'convenience',
      'participants',
      'recruited',
      'selected',
      'inclusion criteria',
      'exclusion criteria',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q4',
      'Was the recruitment strategy appropriate to the aims of the research?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Has the researcher explained how participants were selected? Was this appropriate?',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessDataCollection(text: string) {
    const keywords = [
      'data collection',
      'interview',
      'focus group',
      'observation',
      'field notes',
      'audio recorded',
      'video recorded',
      'transcribed',
      'saturation',
      'data saturation',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q5',
      'Was the data collected in a way that addressed the research issue?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Has the researcher justified the methods chosen? Is it clear how data were collected?',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessResearcherParticipantRelationship(text: string) {
    const keywords = [
      'reflexivity',
      'researcher role',
      'researcher position',
      'bias',
      'assumptions',
      'influence',
      'relationship',
      'rapport',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.6 : evidence.length === 1 ? 0.4 : 0.3;
    
    return createQualityItem(
      'q6',
      'Has the relationship between researcher and participants been adequately considered?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Has the researcher critically examined their own role, potential bias and influence?',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessEthicalIssues(text: string) {
    const keywords = [
      'ethical',
      'ethics',
      'informed consent',
      'consent',
      'confidentiality',
      'anonymity',
      'ethics committee',
      'IRB',
      'institutional review board',
      'ethical approval',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.8 : evidence.length === 1 ? 0.6 : 0.3;
    
    return createQualityItem(
      'q7',
      'Have ethical issues been taken into consideration?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Has ethical approval been sought? Have the researchers discussed issues raised by the study?',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessDataAnalysis(text: string) {
    const keywords = [
      'analysis',
      'thematic analysis',
      'coding',
      'themes',
      'categories',
      'constant comparison',
      'framework analysis',
      'content analysis',
      'rigorous',
      'systematic',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'methods');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q8',
      'Was the data analysis sufficiently rigorous?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Is there an in-depth description of the analysis process? Has sufficient data been presented to support the findings?',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  /**
   * Section C: Results (2 questions)
   */
  private async assessResults(_fullText: string, resultsText: string) {
    const q9 = this.assessClearFindings(resultsText);
    const q10 = this.assessValueOfResearch(resultsText);
    
    const items = [q9, q10];
    const yesCount = items.filter(i => i.response === ResponseOption.YES).length;
    
    return createQualityDomain(
      'results',
      'Results and Value',
      items,
      {
        description: 'Are the findings clear and valuable?',
        overall_rating: yesCount === 2 ? QualityRating.GOOD : yesCount === 1 ? QualityRating.FAIR : QualityRating.POOR,
        rationale: `${yesCount}/2 results criteria met`,
        applicable: true,
      }
    );
  }
  
  private assessClearFindings(text: string) {
    const keywords = [
      'findings',
      'results',
      'themes',
      'emerged',
      'identified',
      'participants described',
      'participants reported',
      'quotes',
      'quotations',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'results');
    const confidence = evidence.length >= 2 ? 0.7 : evidence.length === 1 ? 0.5 : 0.3;
    
    return createQualityItem(
      'q9',
      'Is there a clear statement of findings?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Are the findings explicit? Is there adequate discussion of the evidence?',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  private assessValueOfResearch(text: string) {
    const keywords = [
      'implications',
      'contribution',
      'significance',
      'important',
      'valuable',
      'clinical practice',
      'policy',
      'future research',
      'recommendations',
    ];
    
    const evidence = this.extractEvidence(text, keywords, 'results');
    const confidence = evidence.length >= 2 ? 0.6 : evidence.length === 1 ? 0.4 : 0.3;
    
    return createQualityItem(
      'q10',
      'How valuable is the research?',
      evidence.length > 0 ? ResponseOption.YES : ResponseOption.UNCLEAR,
      {
        guidance: 'Does the research contribute to existing knowledge or understanding? Are the findings transferable?',
        evidence,
        auto_assessed: true,
        confidence,
      }
    );
  }
  
  /**
   * Helper methods
   */
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
    
    if (rating === QualityRating.FAIR) {
      reasons.push('Fair quality - manual review recommended');
    }
    
    return reasons;
  }
}

/**
 * MCP tool interface for CASP Qualitative
 */
export async function assessQualityCASP(args: {
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
    const tool = new CASPQualitativeTool();
    
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
    logger.error('Error assessing quality with CASP', {
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
