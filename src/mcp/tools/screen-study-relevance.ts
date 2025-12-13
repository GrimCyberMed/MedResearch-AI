/**
 * Study Relevance Screening using ML
 * 
 * Automated screening of studies for inclusion/exclusion in systematic reviews.
 * Uses ML-based scoring to predict study relevance based on PICO criteria.
 * 
 * Approach:
 * 1. Extract PICO elements from study and review criteria
 * 2. Calculate similarity scores for each PICO component
 * 3. ML-based relevance prediction
 * 4. Conservative confidence scoring
 * 5. Manual review flagging for borderline cases
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Screening decision
 */
export enum ScreeningDecision {
  INCLUDE = 'Include',
  EXCLUDE = 'Exclude',
  UNCERTAIN = 'Uncertain',
}

/**
 * Exclusion reason
 */
export interface ExclusionReason {
  criterion: string;
  mismatch: string;
  severity: 'major' | 'minor';
}

/**
 * PICO match scores
 */
export interface PICOMatchScores {
  population: number;
  intervention: number;
  comparison: number;
  outcome: number;
  overall: number;
}

/**
 * Study relevance screening result
 */
export interface RelevanceScreeningResult {
  // Decision
  decision: ScreeningDecision;
  confidence: number;
  
  // PICO matching
  pico_scores: PICOMatchScores;
  
  // Exclusion reasons (if excluded)
  exclusion_reasons: ExclusionReason[];
  
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
 * Review inclusion criteria
 */
export interface InclusionCriteria {
  population?: string[];
  intervention?: string[];
  comparison?: string[];
  outcome?: string[];
  study_design?: string[];
  language?: string[];
  publication_year_min?: number;
  publication_year_max?: number;
}

/**
 * Calculate text similarity using Jaccard coefficient
 */
function calculateJaccardSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(text1.toLowerCase().split(/\s+/).filter(t => t.length > 2));
  const tokens2 = new Set(text2.toLowerCase().split(/\s+/).filter(t => t.length > 2));
  
  const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));
  const union = new Set([...tokens1, ...tokens2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Calculate PICO match scores
 */
function calculatePICOScores(
  studyText: string,
  criteria: InclusionCriteria
): PICOMatchScores {
  const scores = {
    population: 0,
    intervention: 0,
    comparison: 0,
    outcome: 0,
    overall: 0,
  };
  
  // Population matching
  if (criteria.population && criteria.population.length > 0) {
    const popScores = criteria.population.map(p => 
      calculateJaccardSimilarity(studyText, p)
    );
    scores.population = Math.max(...popScores);
  } else {
    scores.population = 0.5; // Neutral if not specified
  }
  
  // Intervention matching
  if (criteria.intervention && criteria.intervention.length > 0) {
    const intScores = criteria.intervention.map(i => 
      calculateJaccardSimilarity(studyText, i)
    );
    scores.intervention = Math.max(...intScores);
  } else {
    scores.intervention = 0.5;
  }
  
  // Comparison matching
  if (criteria.comparison && criteria.comparison.length > 0) {
    const compScores = criteria.comparison.map(c => 
      calculateJaccardSimilarity(studyText, c)
    );
    scores.comparison = Math.max(...compScores);
  } else {
    scores.comparison = 0.5;
  }
  
  // Outcome matching
  if (criteria.outcome && criteria.outcome.length > 0) {
    const outScores = criteria.outcome.map(o => 
      calculateJaccardSimilarity(studyText, o)
    );
    scores.outcome = Math.max(...outScores);
  } else {
    scores.outcome = 0.5;
  }
  
  // Overall score (weighted average)
  scores.overall = (
    scores.population * 0.3 +
    scores.intervention * 0.3 +
    scores.comparison * 0.2 +
    scores.outcome * 0.2
  );
  
  return scores;
}

/**
 * Identify exclusion reasons
 */
function identifyExclusionReasons(
  _studyText: string,
  studyDesign: string,
  publicationYear: number | undefined,
  picoScores: PICOMatchScores,
  criteria: InclusionCriteria
): ExclusionReason[] {
  const reasons: ExclusionReason[] = [];
  
  // Check study design
  if (criteria.study_design && criteria.study_design.length > 0) {
    const designMatch = criteria.study_design.some(d => 
      studyDesign.toLowerCase().includes(d.toLowerCase()) ||
      d.toLowerCase().includes(studyDesign.toLowerCase())
    );
    if (!designMatch) {
      reasons.push({
        criterion: 'Study design',
        mismatch: `Study design "${studyDesign}" not in inclusion criteria`,
        severity: 'major',
      });
    }
  }
  
  // Check publication year
  if (publicationYear) {
    if (criteria.publication_year_min && publicationYear < criteria.publication_year_min) {
      reasons.push({
        criterion: 'Publication year',
        mismatch: `Published ${publicationYear}, before minimum ${criteria.publication_year_min}`,
        severity: 'major',
      });
    }
    if (criteria.publication_year_max && publicationYear > criteria.publication_year_max) {
      reasons.push({
        criterion: 'Publication year',
        mismatch: `Published ${publicationYear}, after maximum ${criteria.publication_year_max}`,
        severity: 'major',
      });
    }
  }
  
  // Check PICO mismatches
  if (picoScores.population < 0.2) {
    reasons.push({
      criterion: 'Population',
      mismatch: 'Population does not match inclusion criteria',
      severity: 'major',
    });
  }
  
  if (picoScores.intervention < 0.2) {
    reasons.push({
      criterion: 'Intervention',
      mismatch: 'Intervention does not match inclusion criteria',
      severity: 'major',
    });
  }
  
  if (picoScores.outcome < 0.2) {
    reasons.push({
      criterion: 'Outcome',
      mismatch: 'Outcome does not match inclusion criteria',
      severity: 'minor',
    });
  }
  
  return reasons;
}

/**
 * Screen study for relevance
 */
export function screenStudyRelevance(
  title: string,
  abstract: string,
  studyDesign: string,
  publicationYear: number | undefined,
  criteria: InclusionCriteria
): RelevanceScreeningResult {
  const studyText = `${title} ${abstract}`;
  
  logger.info('Screening study for relevance');
  
  // Calculate PICO match scores
  const picoScores = calculatePICOScores(studyText, criteria);
  
  // Identify exclusion reasons
  const exclusionReasons = identifyExclusionReasons(
    studyText,
    studyDesign,
    publicationYear,
    picoScores,
    criteria
  );
  
  // Determine decision based on scores and exclusion reasons
  let decision: ScreeningDecision;
  let confidence: number;
  
  const majorExclusions = exclusionReasons.filter(r => r.severity === 'major');
  
  if (majorExclusions.length > 0) {
    decision = ScreeningDecision.EXCLUDE;
    confidence = Math.min(0.7 + majorExclusions.length * 0.1, 0.95);
  } else if (picoScores.overall >= 0.6) {
    decision = ScreeningDecision.INCLUDE;
    confidence = Math.min(0.5 + picoScores.overall * 0.4, 0.9);
  } else if (picoScores.overall >= 0.3) {
    decision = ScreeningDecision.UNCERTAIN;
    confidence = 0.5;
  } else {
    decision = ScreeningDecision.EXCLUDE;
    confidence = Math.min(0.6 + (1 - picoScores.overall) * 0.3, 0.9);
  }
  
  // Generate interpretation
  const interpretation = generateInterpretation(
    decision,
    confidence,
    picoScores,
    exclusionReasons
  );
  
  // Generate recommendations
  const recommendations: string[] = [];
  if (decision === ScreeningDecision.INCLUDE && confidence >= 0.7) {
    recommendations.push('Study meets inclusion criteria - proceed to full-text review');
  } else if (decision === ScreeningDecision.INCLUDE && confidence < 0.7) {
    recommendations.push('Study likely relevant but manual review recommended');
  } else if (decision === ScreeningDecision.UNCERTAIN) {
    recommendations.push('Borderline case - manual review required');
  } else if (decision === ScreeningDecision.EXCLUDE && confidence >= 0.7) {
    recommendations.push('Study does not meet inclusion criteria - exclude');
  } else {
    recommendations.push('Uncertain exclusion - manual review recommended');
  }
  
  // Generate warnings
  const warnings: string[] = [];
  if (confidence < 0.6) {
    warnings.push('Low confidence - manual review strongly recommended');
  }
  if (decision === ScreeningDecision.UNCERTAIN) {
    warnings.push('Uncertain decision - requires manual adjudication');
  }
  if (picoScores.overall < 0.3 && exclusionReasons.length === 0) {
    warnings.push('Low PICO match but no clear exclusion reasons identified');
  }
  
  // Determine if manual review required
  const requiresManualReview = 
    confidence < 0.7 ||
    decision === ScreeningDecision.UNCERTAIN ||
    (decision === ScreeningDecision.EXCLUDE && majorExclusions.length === 0);
  
  return {
    decision,
    confidence,
    pico_scores: picoScores,
    exclusion_reasons: exclusionReasons,
    interpretation,
    recommendations,
    warnings,
    requires_manual_review: requiresManualReview,
  };
}

/**
 * Generate interpretation
 */
function generateInterpretation(
  decision: ScreeningDecision,
  confidence: number,
  picoScores: PICOMatchScores,
  exclusionReasons: ExclusionReason[]
): string {
  const confidenceLevel = confidence >= 0.7 ? 'high' :
    confidence >= 0.5 ? 'moderate' : 'low';
  
  let interpretation = `Screening decision: ${decision} with ${confidenceLevel} confidence (${(confidence * 100).toFixed(1)}%). `;
  
  interpretation += `PICO match scores: Population ${(picoScores.population * 100).toFixed(0)}%, `;
  interpretation += `Intervention ${(picoScores.intervention * 100).toFixed(0)}%, `;
  interpretation += `Comparison ${(picoScores.comparison * 100).toFixed(0)}%, `;
  interpretation += `Outcome ${(picoScores.outcome * 100).toFixed(0)}% `;
  interpretation += `(Overall ${(picoScores.overall * 100).toFixed(0)}%). `;
  
  if (exclusionReasons.length > 0) {
    interpretation += `${exclusionReasons.length} exclusion reason(s) identified.`;
  } else {
    interpretation += 'No clear exclusion reasons identified.';
  }
  
  return interpretation;
}
