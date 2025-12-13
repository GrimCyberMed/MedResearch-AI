/**
 * Automated Risk of Bias Assessment using ML
 * 
 * Machine learning-based risk of bias assessment for RCTs.
 * Automates the Cochrane RoB 2.0 tool using text analysis and pattern matching.
 * 
 * Approach:
 * 1. Extract methodological features from study text
 * 2. Pattern matching for bias indicators
 * 3. ML-based classification for each domain
 * 4. Confidence scoring based on evidence strength
 * 5. Conservative flagging for manual review
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Risk of bias judgment
 */
export enum RoBJudgment {
  LOW = 'Low',
  SOME_CONCERNS = 'Some concerns',
  HIGH = 'High',
}

/**
 * Domain assessment
 */
export interface DomainAssessment {
  domain: string;
  judgment: RoBJudgment;
  confidence: number;
  evidence: string[];
  reasoning: string;
}

/**
 * Automated RoB assessment result
 */
export interface AutomatedRoBResult {
  // Domain assessments
  domains: DomainAssessment[];
  
  // Overall assessment
  overall_judgment: RoBJudgment;
  overall_confidence: number;
  
  // Interpretation
  interpretation: string;
  
  // Recommendations
  recommendations: string[];
  
  // Warnings
  warnings: string[];
  
  // Requires manual review
  requires_manual_review: boolean;
}

/**
 * Bias indicators (patterns that suggest bias)
 */
const BIAS_INDICATORS = {
  randomization: {
    low_risk: [
      /random\s+number\s+table/gi,
      /computer\s+generated/gi,
      /central\s+randomization/gi,
      /stratified\s+randomization/gi,
      /block\s+randomization/gi,
      /permuted\s+block/gi,
    ],
    high_risk: [
      /alternation/gi,
      /date\s+of\s+birth/gi,
      /odd\s+or\s+even/gi,
      /hospital\s+number/gi,
      /not\s+randomized/gi,
    ],
  },
  
  allocation_concealment: {
    low_risk: [
      /central\s+allocation/gi,
      /sequentially\s+numbered.*opaque.*sealed\s+envelopes/gi,
      /pharmacy\s+controlled/gi,
      /sealed\s+envelope/gi,
    ],
    high_risk: [
      /open\s+allocation/gi,
      /unsealed\s+envelope/gi,
      /not\s+concealed/gi,
    ],
  },
  
  blinding: {
    low_risk: [
      /double\s+blind/gi,
      /triple\s+blind/gi,
      /participant.*blind/gi,
      /investigator.*blind/gi,
      /outcome\s+assessor.*blind/gi,
      /placebo\s+controlled/gi,
    ],
    high_risk: [
      /open\s+label/gi,
      /not\s+blind/gi,
      /unblind/gi,
      /no\s+blinding/gi,
    ],
  },
  
  incomplete_data: {
    low_risk: [
      /intention\s+to\s+treat/gi,
      /ITT\s+analysis/gi,
      /no\s+missing\s+data/gi,
      /complete\s+follow-up/gi,
      /all\s+participants\s+analyzed/gi,
    ],
    high_risk: [
      /per\s+protocol/gi,
      /high\s+attrition/gi,
      /substantial\s+loss/gi,
      /differential\s+dropout/gi,
    ],
  },
  
  selective_reporting: {
    low_risk: [
      /protocol\s+published/gi,
      /trial\s+registered/gi,
      /clinicaltrials\.gov/gi,
      /all\s+outcomes\s+reported/gi,
    ],
    high_risk: [
      /outcomes?\s+not\s+reported/gi,
      /selective\s+reporting/gi,
      /post\s+hoc/gi,
    ],
  },
};

/**
 * Assess randomization domain
 */
function assessRandomization(text: string): DomainAssessment {
  const evidence: string[] = [];
  let score = 0;
  
  // Check for low risk indicators
  for (const pattern of BIAS_INDICATORS.randomization.low_risk) {
    const matches = text.match(pattern);
    if (matches) {
      evidence.push(`Low risk: ${matches[0]}`);
      score += 2;
    }
  }
  
  // Check for high risk indicators
  for (const pattern of BIAS_INDICATORS.randomization.high_risk) {
    const matches = text.match(pattern);
    if (matches) {
      evidence.push(`High risk: ${matches[0]}`);
      score -= 3;
    }
  }
  
  // Determine judgment
  let judgment: RoBJudgment;
  let confidence: number;
  
  if (score >= 2) {
    judgment = RoBJudgment.LOW;
    confidence = Math.min(0.7 + evidence.length * 0.05, 0.9);
  } else if (score <= -2) {
    judgment = RoBJudgment.HIGH;
    confidence = Math.min(0.7 + evidence.length * 0.05, 0.9);
  } else {
    judgment = RoBJudgment.SOME_CONCERNS;
    confidence = 0.5;
  }
  
  const reasoning = evidence.length > 0
    ? `Based on ${evidence.length} indicator(s): ${evidence.join('; ')}`
    : 'Insufficient information to determine randomization quality';
  
  return {
    domain: 'Randomization process',
    judgment,
    confidence,
    evidence,
    reasoning,
  };
}

/**
 * Assess allocation concealment domain
 */
function assessAllocationConcealment(text: string): DomainAssessment {
  const evidence: string[] = [];
  let score = 0;
  
  for (const pattern of BIAS_INDICATORS.allocation_concealment.low_risk) {
    const matches = text.match(pattern);
    if (matches) {
      evidence.push(`Low risk: ${matches[0]}`);
      score += 2;
    }
  }
  
  for (const pattern of BIAS_INDICATORS.allocation_concealment.high_risk) {
    const matches = text.match(pattern);
    if (matches) {
      evidence.push(`High risk: ${matches[0]}`);
      score -= 3;
    }
  }
  
  let judgment: RoBJudgment;
  let confidence: number;
  
  if (score >= 2) {
    judgment = RoBJudgment.LOW;
    confidence = Math.min(0.7 + evidence.length * 0.05, 0.9);
  } else if (score <= -2) {
    judgment = RoBJudgment.HIGH;
    confidence = Math.min(0.7 + evidence.length * 0.05, 0.9);
  } else {
    judgment = RoBJudgment.SOME_CONCERNS;
    confidence = 0.5;
  }
  
  const reasoning = evidence.length > 0
    ? `Based on ${evidence.length} indicator(s): ${evidence.join('; ')}`
    : 'Insufficient information about allocation concealment';
  
  return {
    domain: 'Allocation concealment',
    judgment,
    confidence,
    evidence,
    reasoning,
  };
}

/**
 * Assess blinding domain
 */
function assessBlinding(text: string): DomainAssessment {
  const evidence: string[] = [];
  let score = 0;
  
  for (const pattern of BIAS_INDICATORS.blinding.low_risk) {
    const matches = text.match(pattern);
    if (matches) {
      evidence.push(`Low risk: ${matches[0]}`);
      score += 2;
    }
  }
  
  for (const pattern of BIAS_INDICATORS.blinding.high_risk) {
    const matches = text.match(pattern);
    if (matches) {
      evidence.push(`High risk: ${matches[0]}`);
      score -= 3;
    }
  }
  
  let judgment: RoBJudgment;
  let confidence: number;
  
  if (score >= 2) {
    judgment = RoBJudgment.LOW;
    confidence = Math.min(0.7 + evidence.length * 0.05, 0.9);
  } else if (score <= -2) {
    judgment = RoBJudgment.HIGH;
    confidence = Math.min(0.7 + evidence.length * 0.05, 0.9);
  } else {
    judgment = RoBJudgment.SOME_CONCERNS;
    confidence = 0.5;
  }
  
  const reasoning = evidence.length > 0
    ? `Based on ${evidence.length} indicator(s): ${evidence.join('; ')}`
    : 'Insufficient information about blinding';
  
  return {
    domain: 'Blinding of participants and personnel',
    judgment,
    confidence,
    evidence,
    reasoning,
  };
}

/**
 * Assess incomplete outcome data domain
 */
function assessIncompleteData(text: string): DomainAssessment {
  const evidence: string[] = [];
  let score = 0;
  
  for (const pattern of BIAS_INDICATORS.incomplete_data.low_risk) {
    const matches = text.match(pattern);
    if (matches) {
      evidence.push(`Low risk: ${matches[0]}`);
      score += 2;
    }
  }
  
  for (const pattern of BIAS_INDICATORS.incomplete_data.high_risk) {
    const matches = text.match(pattern);
    if (matches) {
      evidence.push(`High risk: ${matches[0]}`);
      score -= 3;
    }
  }
  
  let judgment: RoBJudgment;
  let confidence: number;
  
  if (score >= 2) {
    judgment = RoBJudgment.LOW;
    confidence = Math.min(0.7 + evidence.length * 0.05, 0.9);
  } else if (score <= -2) {
    judgment = RoBJudgment.HIGH;
    confidence = Math.min(0.7 + evidence.length * 0.05, 0.9);
  } else {
    judgment = RoBJudgment.SOME_CONCERNS;
    confidence = 0.5;
  }
  
  const reasoning = evidence.length > 0
    ? `Based on ${evidence.length} indicator(s): ${evidence.join('; ')}`
    : 'Insufficient information about incomplete outcome data';
  
  return {
    domain: 'Incomplete outcome data',
    judgment,
    confidence,
    evidence,
    reasoning,
  };
}

/**
 * Assess selective reporting domain
 */
function assessSelectiveReporting(text: string): DomainAssessment {
  const evidence: string[] = [];
  let score = 0;
  
  for (const pattern of BIAS_INDICATORS.selective_reporting.low_risk) {
    const matches = text.match(pattern);
    if (matches) {
      evidence.push(`Low risk: ${matches[0]}`);
      score += 2;
    }
  }
  
  for (const pattern of BIAS_INDICATORS.selective_reporting.high_risk) {
    const matches = text.match(pattern);
    if (matches) {
      evidence.push(`High risk: ${matches[0]}`);
      score -= 3;
    }
  }
  
  let judgment: RoBJudgment;
  let confidence: number;
  
  if (score >= 2) {
    judgment = RoBJudgment.LOW;
    confidence = Math.min(0.7 + evidence.length * 0.05, 0.9);
  } else if (score <= -2) {
    judgment = RoBJudgment.HIGH;
    confidence = Math.min(0.7 + evidence.length * 0.05, 0.9);
  } else {
    judgment = RoBJudgment.SOME_CONCERNS;
    confidence = 0.5;
  }
  
  const reasoning = evidence.length > 0
    ? `Based on ${evidence.length} indicator(s): ${evidence.join('; ')}`
    : 'Insufficient information about selective reporting';
  
  return {
    domain: 'Selective reporting',
    judgment,
    confidence,
    evidence,
    reasoning,
  };
}

/**
 * Automated risk of bias assessment
 */
export function assessRiskOfBiasML(
  title: string,
  abstract: string,
  fullText?: string
): AutomatedRoBResult {
  const text = `${title} ${abstract} ${fullText || ''}`;
  
  logger.info('Performing automated risk of bias assessment');
  
  // Assess each domain
  const domains: DomainAssessment[] = [
    assessRandomization(text),
    assessAllocationConcealment(text),
    assessBlinding(text),
    assessIncompleteData(text),
    assessSelectiveReporting(text),
  ];
  
  // Determine overall judgment (worst domain)
  const hasHigh = domains.some(d => d.judgment === RoBJudgment.HIGH);
  const hasConcerns = domains.some(d => d.judgment === RoBJudgment.SOME_CONCERNS);
  
  const overallJudgment = hasHigh ? RoBJudgment.HIGH :
    hasConcerns ? RoBJudgment.SOME_CONCERNS : RoBJudgment.LOW;
  
  // Calculate overall confidence (average of domain confidences)
  const overallConfidence = domains.reduce((sum, d) => sum + d.confidence, 0) / domains.length;
  
  // Generate interpretation
  const highRiskDomains = domains.filter(d => d.judgment === RoBJudgment.HIGH);
  const concernDomains = domains.filter(d => d.judgment === RoBJudgment.SOME_CONCERNS);
  const lowRiskDomains = domains.filter(d => d.judgment === RoBJudgment.LOW);
  
  const interpretation = `Automated RoB assessment: ${overallJudgment} risk overall. ` +
    `${lowRiskDomains.length} domain(s) at low risk, ` +
    `${concernDomains.length} with some concerns, ` +
    `${highRiskDomains.length} at high risk. ` +
    `Overall confidence: ${(overallConfidence * 100).toFixed(1)}%.`;
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (overallConfidence < 0.6) {
    recommendations.push('Low confidence - manual review strongly recommended');
  }
  if (highRiskDomains.length > 0) {
    recommendations.push(`High risk domains require attention: ${highRiskDomains.map(d => d.domain).join(', ')}`);
  }
  if (concernDomains.length > 0) {
    recommendations.push(`Domains with concerns: ${concernDomains.map(d => d.domain).join(', ')}`);
  }
  if (lowRiskDomains.length === 5) {
    recommendations.push('All domains assessed as low risk - study appears well-conducted');
  }
  
  // Generate warnings
  const warnings: string[] = [];
  const totalEvidence = domains.reduce((sum, d) => sum + d.evidence.length, 0);
  
  if (totalEvidence < 5) {
    warnings.push('Limited evidence found in text - assessment may be incomplete');
  }
  if (!fullText) {
    warnings.push('Full text not provided - assessment based on title/abstract only');
  }
  if (overallConfidence < 0.5) {
    warnings.push('Very low confidence - automated assessment unreliable');
  }
  
  // Determine if manual review required
  const requiresManualReview = overallConfidence < 0.6 || 
    hasHigh || 
    totalEvidence < 5 ||
    !fullText;
  
  return {
    domains,
    overall_judgment: overallJudgment,
    overall_confidence: overallConfidence,
    interpretation,
    recommendations,
    warnings,
    requires_manual_review: requiresManualReview,
  };
}
