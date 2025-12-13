/**
 * Treatment Ranking
 * 
 * Ranks treatments in network meta-analysis using:
 * - SUCRA (Surface Under the Cumulative RAnking curve)
 * - P-scores
 * - Probability of being best
 * - Mean ranks
 * 
 * References:
 * - Salanti et al. (2011) Evaluating the quality of evidence from a network meta-analysis
 * - Rücker & Schwarzer (2015) Ranking treatments in frequentist network meta-analysis
 * - Chaimani et al. (2013) Graphical tools for network meta-analysis in STATA
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Treatment effect estimate
 */
export interface TreatmentEffect {
  /** Treatment name */
  treatment: string;
  
  /** Effect size estimate (vs reference) */
  effect_size: number;
  
  /** Standard error */
  standard_error: number;
  
  /** Is this the reference treatment? */
  is_reference?: boolean;
}

/**
 * Treatment ranking result
 */
export interface TreatmentRanking {
  /** Treatment name */
  treatment: string;
  
  /** SUCRA score (0-100%, higher is better) */
  sucra: number;
  
  /** P-score (0-1, higher is better) */
  p_score: number;
  
  /** Probability of being best (0-1) */
  prob_best: number;
  
  /** Mean rank (1 = best, higher = worse) */
  mean_rank: number;
  
  /** Median rank */
  median_rank: number;
  
  /** Rank probabilities (probability of being rank 1, 2, 3, ...) */
  rank_probabilities: number[];
}

/**
 * Treatment ranking assessment result
 */
export interface TreatmentRankingAssessment {
  /** Number of treatments */
  n_treatments: number;
  
  /** Rankings */
  rankings: TreatmentRanking[];
  
  /** Best treatment */
  best_treatment: {
    treatment: string;
    sucra: number;
    prob_best: number;
  };
  
  /** Worst treatment */
  worst_treatment: {
    treatment: string;
    sucra: number;
    prob_best: number;
  };
  
  /** Interpretation */
  interpretation: string;
  
  /** Recommendations */
  recommendations: string[];
  
  /** Confidence in the ranking (0-1) */
  confidence: number;
  
  /** Warnings */
  warnings: string[];
}

/**
 * Calculate rank probabilities using simulation
 */
function calculateRankProbabilities(
  effects: TreatmentEffect[],
  nSimulations: number = 10000
): Map<string, number[]> {
  const nTreatments = effects.length;
  const rankProbs = new Map<string, number[]>();
  
  // Initialize rank probabilities
  for (const effect of effects) {
    rankProbs.set(effect.treatment, new Array(nTreatments).fill(0));
  }
  
  // Simulate effect sizes
  for (let sim = 0; sim < nSimulations; sim++) {
    const simulated: Array<{ treatment: string; value: number }> = [];
    
    for (const effect of effects) {
      // Sample from normal distribution
      const value = effect.effect_size + randomNormal() * effect.standard_error;
      simulated.push({ treatment: effect.treatment, value });
    }
    
    // Sort by value (assuming higher is better)
    simulated.sort((a, b) => b.value - a.value);
    
    // Record ranks
    for (let rank = 0; rank < nTreatments; rank++) {
      const treatment = simulated[rank].treatment;
      rankProbs.get(treatment)![rank]++;
    }
  }
  
  // Convert counts to probabilities
  for (const [treatment, counts] of rankProbs.entries()) {
    rankProbs.set(treatment, counts.map(c => c / nSimulations));
  }
  
  return rankProbs;
}

/**
 * Generate random normal variable (Box-Muller transform)
 */
function randomNormal(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Calculate SUCRA from rank probabilities
 */
function calculateSUCRA(rankProbs: number[]): number {
  const nTreatments = rankProbs.length;
  
  // SUCRA = sum of cumulative probabilities / (n-1)
  let cumulativeSum = 0;
  
  for (let rank = 0; rank < nTreatments - 1; rank++) {
    // Cumulative probability of being in top (rank+1) treatments
    let cumProb = 0;
    for (let r = 0; r <= rank; r++) {
      cumProb += rankProbs[r];
    }
    cumulativeSum += cumProb;
  }
  
  const sucra = cumulativeSum / (nTreatments - 1);
  return sucra * 100; // Convert to percentage
}

/**
 * Calculate P-score (simplified version)
 */
function calculatePScore(rankProbs: number[]): number {
  // P-score is similar to SUCRA but uses different normalization
  // Simplified: use mean rank
  const meanRank = rankProbs.reduce((sum, prob, rank) => sum + prob * (rank + 1), 0);
  const nTreatments = rankProbs.length;
  
  // Convert to 0-1 scale (1 = best, 0 = worst)
  const pScore = (nTreatments - meanRank) / (nTreatments - 1);
  return Math.max(0, Math.min(1, pScore));
}

/**
 * Calculate mean rank
 */
function calculateMeanRank(rankProbs: number[]): number {
  return rankProbs.reduce((sum, prob, rank) => sum + prob * (rank + 1), 0);
}

/**
 * Calculate median rank
 */
function calculateMedianRank(rankProbs: number[]): number {
  let cumProb = 0;
  
  for (let rank = 0; rank < rankProbs.length; rank++) {
    cumProb += rankProbs[rank];
    if (cumProb >= 0.5) {
      return rank + 1;
    }
  }
  
  return rankProbs.length;
}

/**
 * Rank treatments
 */
export function rankTreatments(
  effects: TreatmentEffect[],
  options: {
    n_simulations?: number;
    higher_is_better?: boolean;
  } = {}
): TreatmentRankingAssessment {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Validate
  if (effects.length === 0) {
    throw new Error('No treatment effects provided for ranking');
  }
  
  if (effects.length < 2) {
    throw new Error('At least 2 treatments required for ranking');
  }
  
  const nSimulations = options.n_simulations || 10000;
  const higherIsBetter = options.higher_is_better !== false; // Default true
  
  // Adjust effect sizes if lower is better
  const adjustedEffects = higherIsBetter
    ? effects
    : effects.map(e => ({ ...e, effect_size: -e.effect_size }));
  
  // Calculate rank probabilities
  const rankProbs = calculateRankProbabilities(adjustedEffects, nSimulations);
  
  // Calculate rankings
  const rankings: TreatmentRanking[] = [];
  
  for (const effect of effects) {
    const probs = rankProbs.get(effect.treatment)!;
    
    rankings.push({
      treatment: effect.treatment,
      sucra: calculateSUCRA(probs),
      p_score: calculatePScore(probs),
      prob_best: probs[0],
      mean_rank: calculateMeanRank(probs),
      median_rank: calculateMedianRank(probs),
      rank_probabilities: probs,
    });
  }
  
  // Sort by SUCRA (descending)
  rankings.sort((a, b) => b.sucra - a.sucra);
  
  // Identify best and worst
  const best = rankings[0];
  const worst = rankings[rankings.length - 1];
  
  // Generate interpretation
  let interpretation = `Based on ${nSimulations.toLocaleString()} simulations, `;
  interpretation += `${best.treatment} ranks highest (SUCRA = ${best.sucra.toFixed(1)}%, `;
  interpretation += `${(best.prob_best * 100).toFixed(1)}% probability of being best). `;
  
  if (best.prob_best > 0.8) {
    interpretation += `There is strong evidence that ${best.treatment} is the best treatment. `;
  } else if (best.prob_best > 0.5) {
    interpretation += `${best.treatment} is likely the best treatment, but uncertainty remains. `;
  } else {
    interpretation += `Ranking is uncertain; multiple treatments have similar performance. `;
  }
  
  // Recommendations
  if (best.prob_best < 0.5) {
    warnings.push('No clear best treatment - rankings are uncertain');
    recommendations.push('Consider additional studies to reduce uncertainty');
  }
  
  if (best.sucra - worst.sucra < 20) {
    warnings.push('Small difference between best and worst treatments');
    recommendations.push('Treatments may have similar effectiveness; consider other factors (cost, safety, preferences)');
  }
  
  const uncertainTreatments = rankings.filter(r => r.mean_rank > 1 && r.mean_rank < effects.length).length;
  if (uncertainTreatments > effects.length / 2) {
    warnings.push('Many treatments have uncertain rankings');
    recommendations.push('Interpret middle-ranked treatments with caution');
  }
  
  if (effects.length < 3) {
    warnings.push('Only 2 treatments - ranking is trivial');
  }
  
  // Confidence scoring
  let confidence = 0.7; // Base confidence
  
  // Higher confidence if clear best treatment
  if (best.prob_best > 0.8) {
    confidence += 0.1;
  } else if (best.prob_best < 0.5) {
    confidence -= 0.2;
  }
  
  // Lower confidence for few treatments
  if (effects.length < 3) {
    confidence -= 0.2;
  }
  
  // Lower confidence if high uncertainty
  const avgSE = effects.reduce((sum, e) => sum + e.standard_error, 0) / effects.length;
  if (avgSE > 0.5) {
    confidence -= 0.1;
    warnings.push('High uncertainty in effect estimates');
  }
  
  // Ensure confidence is in valid range
  confidence = Math.max(0.1, Math.min(0.9, confidence));
  
  return {
    n_treatments: effects.length,
    rankings,
    best_treatment: {
      treatment: best.treatment,
      sucra: best.sucra,
      prob_best: best.prob_best,
    },
    worst_treatment: {
      treatment: worst.treatment,
      sucra: worst.sucra,
      prob_best: worst.prob_best,
    },
    interpretation,
    recommendations,
    confidence,
    warnings,
  };
}

/**
 * MCP tool interface for treatment ranking
 */
export async function rankTreatmentsMCP(args: {
  effects: TreatmentEffect[];
  n_simulations?: number;
  higher_is_better?: boolean;
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Ranking treatments', {
      n_treatments: args.effects.length,
      n_simulations: args.n_simulations || 10000,
    });
    
    const result = rankTreatments(args.effects, {
      n_simulations: args.n_simulations,
      higher_is_better: args.higher_is_better,
    });
    
    logger.info('Treatment ranking complete', {
      best_treatment: result.best_treatment.treatment,
      best_sucra: result.best_treatment.sucra,
      confidence: result.confidence,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error('Error ranking treatments', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error ranking treatments: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
