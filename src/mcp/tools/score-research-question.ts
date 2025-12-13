/**
 * Research Question Quality Scoring Tool
 * 
 * Scores research questions using FINER criteria:
 * - F: Feasible (adequate subjects, technical expertise, time, money)
 * - I: Interesting (to investigator, colleagues, community)
 * - N: Novel (confirms/refutes/extends previous findings)
 * - E: Ethical (approval obtainable)
 * - R: Relevant (to scientific knowledge, clinical practice, policy)
 * 
 * Helps researchers evaluate and improve their research questions.
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * FINER criteria assessment
 */
export interface FINERAssessment {
  feasible: {
    score: number; // 0-100
    adequate_subjects: boolean;
    technical_expertise: boolean;
    affordable: boolean;
    manageable_scope: boolean;
    rationale: string;
    confidence: number;
  };
  interesting: {
    score: number; // 0-100
    novel_topic: boolean;
    addresses_gap: boolean;
    potential_impact: boolean;
    rationale: string;
    confidence: number;
  };
  novel: {
    score: number; // 0-100
    new_knowledge: boolean;
    extends_previous: boolean;
    unique_approach: boolean;
    rationale: string;
    confidence: number;
  };
  ethical: {
    score: number; // 0-100
    no_harm: boolean;
    informed_consent: boolean;
    privacy_protected: boolean;
    rationale: string;
    confidence: number;
  };
  relevant: {
    score: number; // 0-100
    clinical_relevance: boolean;
    scientific_value: boolean;
    policy_impact: boolean;
    rationale: string;
    confidence: number;
  };
}

/**
 * Research question quality score
 */
export interface ResearchQuestionScore {
  question: string;
  finer: FINERAssessment;
  overall_score: number; // 0-100
  overall_rating: 'excellent' | 'good' | 'fair' | 'poor';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * Assess feasibility of research question
 */
function assessFeasibility(question: string): FINERAssessment['feasible'] {
  // Check for feasibility indicators
  const hasTimeframe = /\d+\s+(?:years?|months?|weeks?)/i.test(question);
  const hasSpecificPopulation = /(?:in|among)\s+[a-z\s]+(?:patients?|adults?|children)/i.test(question);
  const hasCommonCondition = /(?:diabetes|hypertension|cancer|depression|asthma)/i.test(question);
  const hasStandardIntervention = /(?:aspirin|metformin|therapy|surgery|exercise|diet)/i.test(question);
  
  let score = 50; // Base score
  let adequate_subjects = false;
  let technical_expertise = true; // Assume true unless complex
  let affordable = true; // Assume true unless expensive
  let manageable_scope = true;
  
  // Positive indicators
  if (hasSpecificPopulation) {
    score += 10;
    adequate_subjects = true;
  }
  if (hasCommonCondition) {
    score += 10;
    adequate_subjects = true;
  }
  if (hasStandardIntervention) {
    score += 10;
    affordable = true;
  }
  if (hasTimeframe && /\d+\s+(?:months?|weeks?)/i.test(question)) {
    score += 10;
    manageable_scope = true;
  }
  
  // Negative indicators
  if (/rare|uncommon|novel|experimental/i.test(question)) {
    score -= 15;
    adequate_subjects = false;
    technical_expertise = false;
  }
  if (/genome|proteome|advanced imaging|novel biomarker/i.test(question)) {
    score -= 10;
    affordable = false;
    technical_expertise = false;
  }
  if (/long-term|longitudinal|10 years|20 years/i.test(question)) {
    score -= 10;
    manageable_scope = false;
  }
  
  score = Math.max(0, Math.min(100, score));
  
  const rationale = score >= 70 
    ? 'Question appears feasible with adequate resources'
    : score >= 50
    ? 'Question is moderately feasible but may require significant resources'
    : 'Question may face feasibility challenges';
  
  return {
    score,
    adequate_subjects,
    technical_expertise,
    affordable,
    manageable_scope,
    rationale,
    confidence: 0.6,
  };
}

/**
 * Assess if question is interesting
 */
function assessInteresting(question: string): FINERAssessment['interesting'] {
  let score = 50;
  let novel_topic = false;
  let addresses_gap = false;
  let potential_impact = false;
  
  // Check for interesting indicators
  if (/novel|new|innovative|first/i.test(question)) {
    score += 15;
    novel_topic = true;
  }
  if (/mortality|survival|quality of life|major outcome/i.test(question)) {
    score += 15;
    potential_impact = true;
  }
  if (/compared to|versus|vs\./i.test(question)) {
    score += 10;
    addresses_gap = true;
  }
  if (/effect|impact|efficacy|effectiveness/i.test(question)) {
    score += 10;
    addresses_gap = true;
  }
  
  // Common/important conditions increase interest
  if (/diabetes|cancer|heart disease|stroke|depression/i.test(question)) {
    score += 10;
    potential_impact = true;
  }
  
  score = Math.max(0, Math.min(100, score));
  
  const rationale = score >= 70
    ? 'Question addresses an interesting and important topic'
    : score >= 50
    ? 'Question has moderate interest to the research community'
    : 'Question may have limited interest';
  
  return {
    score,
    novel_topic,
    addresses_gap,
    potential_impact,
    rationale,
    confidence: 0.5,
  };
}

/**
 * Assess novelty of research question
 */
function assessNovelty(question: string): FINERAssessment['novel'] {
  let score = 50;
  let new_knowledge = false;
  let extends_previous = false;
  let unique_approach = false;
  
  // Novelty indicators
  if (/novel|new|first|innovative|emerging/i.test(question)) {
    score += 20;
    new_knowledge = true;
  }
  if (/compared to|versus|alternative/i.test(question)) {
    score += 10;
    extends_previous = true;
  }
  if (/mechanism|pathway|biomarker|genetic/i.test(question)) {
    score += 15;
    unique_approach = true;
  }
  
  // Well-established topics reduce novelty
  if (/aspirin.*cardiovascular|metformin.*diabetes/i.test(question)) {
    score -= 10;
  }
  
  score = Math.max(0, Math.min(100, score));
  
  const rationale = score >= 70
    ? 'Question explores novel territory or unique approach'
    : score >= 50
    ? 'Question extends existing knowledge'
    : 'Question may replicate existing research';
  
  return {
    score,
    new_knowledge,
    extends_previous,
    unique_approach,
    rationale,
    confidence: 0.5,
  };
}

/**
 * Assess ethical considerations
 */
function assessEthical(question: string): FINERAssessment['ethical'] {
  let score = 80; // Assume ethical unless red flags
  let no_harm = true;
  let informed_consent = true;
  let privacy_protected = true;
  
  // Red flags
  if (/placebo.*(?:cancer|life-threatening|emergency)/i.test(question)) {
    score -= 30;
    no_harm = false;
  }
  if (/children.*experimental|vulnerable population.*novel/i.test(question)) {
    score -= 20;
    informed_consent = false;
  }
  if (/genetic.*identifiable|biobank.*individual/i.test(question)) {
    score -= 10;
    privacy_protected = false;
  }
  
  // Positive indicators
  if (/standard care|approved treatment|established therapy/i.test(question)) {
    score = Math.min(100, score + 10);
  }
  
  score = Math.max(0, Math.min(100, score));
  
  const rationale = score >= 80
    ? 'No major ethical concerns identified'
    : score >= 60
    ? 'Some ethical considerations require attention'
    : 'Significant ethical concerns need addressing';
  
  return {
    score,
    no_harm,
    informed_consent,
    privacy_protected,
    rationale,
    confidence: 0.6,
  };
}

/**
 * Assess relevance of research question
 */
function assessRelevance(question: string): FINERAssessment['relevant'] {
  let score = 50;
  let clinical_relevance = false;
  let scientific_value = false;
  let policy_impact = false;
  
  // Clinical relevance
  if (/mortality|survival|quality of life|morbidity|adverse events/i.test(question)) {
    score += 20;
    clinical_relevance = true;
  }
  if (/treatment|therapy|prevention|diagnosis/i.test(question)) {
    score += 10;
    clinical_relevance = true;
  }
  
  // Scientific value
  if (/mechanism|pathway|biomarker|risk factor/i.test(question)) {
    score += 10;
    scientific_value = true;
  }
  
  // Policy impact
  if (/cost|access|disparities|public health|screening/i.test(question)) {
    score += 15;
    policy_impact = true;
  }
  
  // High-burden conditions
  if (/diabetes|cancer|heart disease|stroke|depression|obesity/i.test(question)) {
    score += 10;
    clinical_relevance = true;
    policy_impact = true;
  }
  
  score = Math.max(0, Math.min(100, score));
  
  const rationale = score >= 70
    ? 'Question is highly relevant to clinical practice and/or policy'
    : score >= 50
    ? 'Question has moderate relevance'
    : 'Question may have limited practical relevance';
  
  return {
    score,
    clinical_relevance,
    scientific_value,
    policy_impact,
    rationale,
    confidence: 0.6,
  };
}

/**
 * Score research question using FINER criteria
 */
export function scoreResearchQuestion(question: string): ResearchQuestionScore {
  const finer: FINERAssessment = {
    feasible: assessFeasibility(question),
    interesting: assessInteresting(question),
    novel: assessNovelty(question),
    ethical: assessEthical(question),
    relevant: assessRelevance(question),
  };
  
  // Calculate overall score (weighted average)
  const overall_score = (
    finer.feasible.score * 0.25 +
    finer.interesting.score * 0.20 +
    finer.novel.score * 0.15 +
    finer.ethical.score * 0.20 +
    finer.relevant.score * 0.20
  );
  
  // Determine rating
  let overall_rating: 'excellent' | 'good' | 'fair' | 'poor';
  if (overall_score >= 80) overall_rating = 'excellent';
  else if (overall_score >= 65) overall_rating = 'good';
  else if (overall_score >= 50) overall_rating = 'fair';
  else overall_rating = 'poor';
  
  // Identify strengths
  const strengths: string[] = [];
  if (finer.feasible.score >= 70) strengths.push('Feasible with available resources');
  if (finer.interesting.score >= 70) strengths.push('Addresses interesting and important topic');
  if (finer.novel.score >= 70) strengths.push('Explores novel territory');
  if (finer.ethical.score >= 80) strengths.push('No major ethical concerns');
  if (finer.relevant.score >= 70) strengths.push('Highly relevant to practice/policy');
  
  // Identify weaknesses
  const weaknesses: string[] = [];
  if (finer.feasible.score < 60) weaknesses.push('May face feasibility challenges');
  if (finer.interesting.score < 60) weaknesses.push('Limited interest to research community');
  if (finer.novel.score < 60) weaknesses.push('May replicate existing research');
  if (finer.ethical.score < 70) weaknesses.push('Ethical considerations need attention');
  if (finer.relevant.score < 60) weaknesses.push('Limited practical relevance');
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (finer.feasible.score < 60) {
    recommendations.push('Consider narrowing scope or identifying more accessible population');
  }
  if (finer.novel.score < 60) {
    recommendations.push('Review recent literature to ensure novelty and identify gaps');
  }
  if (finer.ethical.score < 80) {
    recommendations.push('Consult with ethics committee early in planning');
  }
  if (finer.relevant.score < 60) {
    recommendations.push('Strengthen connection to clinical practice or policy implications');
  }
  if (strengths.length === 0) {
    recommendations.push('Consider refining research question to address FINER criteria');
  }
  
  // Calculate overall confidence
  const confidence = (
    finer.feasible.confidence +
    finer.interesting.confidence +
    finer.novel.confidence +
    finer.ethical.confidence +
    finer.relevant.confidence
  ) / 5;
  
  return {
    question,
    finer,
    overall_score: Math.round(overall_score * 10) / 10,
    overall_rating,
    strengths,
    weaknesses,
    recommendations,
    confidence,
  };
}

/**
 * MCP tool interface for research question scoring
 */
export async function scoreResearchQuestionMCP(args: {
  question: string;
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Scoring research question', {
      question_length: args.question.length,
    });
    
    const score = scoreResearchQuestion(args.question);
    
    logger.info('Research question scoring complete', {
      overall_score: score.overall_score,
      overall_rating: score.overall_rating,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(score, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('Error scoring research question', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error scoring research question: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
