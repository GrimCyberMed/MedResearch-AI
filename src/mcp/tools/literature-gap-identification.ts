/**
 * Literature Gap Identification Tool
 * 
 * Systematic identification of research gaps through topic clustering, temporal analysis,
 * and methodological gap detection.
 * 
 * @module literature-gap-identification
 * @version 1.0.0
 * @since 5.1.0
 */

import { logger } from '../../common/logger.js';

/**
 * Study metadata for gap analysis
 */
export interface StudyMetadata {
  id: string;
  title: string;
  abstract: string;
  year: number;
  study_design: string;
  population?: string;
  intervention?: string;
  outcome?: string;
  geographic_location?: string;
}

/**
 * Identified gap
 */
export interface IdentifiedGap {
  gap_type: 'temporal' | 'methodological' | 'population' | 'intervention' | 'outcome' | 'geographic';
  description: string;
  evidence: string[];
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

/**
 * Topic cluster
 */
export interface TopicCluster {
  topic: string;
  study_count: number;
  keywords: string[];
  year_range: { min: number; max: number };
}

/**
 * Literature gap identification input
 */
export interface IdentifyGapsInput {
  studies: StudyMetadata[];
  min_confidence?: number;
  identify_temporal_gaps?: boolean;
  identify_methodological_gaps?: boolean;
  identify_population_gaps?: boolean;
  identify_geographic_gaps?: boolean;
}

/**
 * Literature gap identification output
 */
export interface IdentifyGapsOutput {
  success: boolean;
  total_studies: number;
  gaps_identified: IdentifiedGap[];
  topic_clusters: TopicCluster[];
  recommendations: string[];
  processing_time_ms: number;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4);

  // Count word frequency
  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  // Return top keywords
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Cluster studies by topic
 */
function clusterByTopic(studies: StudyMetadata[]): TopicCluster[] {
  const clusters = new Map<string, StudyMetadata[]>();

  // Simple keyword-based clustering
  for (const study of studies) {
    const keywords = extractKeywords(study.title + ' ' + study.abstract);
    const primaryKeyword = keywords[0] || 'other';

    if (!clusters.has(primaryKeyword)) {
      clusters.set(primaryKeyword, []);
    }
    clusters.get(primaryKeyword)!.push(study);
  }

  // Convert to topic clusters
  const topicClusters: TopicCluster[] = [];

  for (const [topic, clusterStudies] of clusters.entries()) {
    const years = clusterStudies.map(s => s.year);
    const allKeywords = new Set<string>();

    for (const study of clusterStudies) {
      const keywords = extractKeywords(study.title + ' ' + study.abstract);
      keywords.slice(0, 5).forEach(k => allKeywords.add(k));
    }

    topicClusters.push({
      topic,
      study_count: clusterStudies.length,
      keywords: Array.from(allKeywords).slice(0, 10),
      year_range: {
        min: Math.min(...years),
        max: Math.max(...years)
      }
    });
  }

  return topicClusters.sort((a, b) => b.study_count - a.study_count);
}

/**
 * Identify temporal gaps
 */
function identifyTemporalGaps(studies: StudyMetadata[]): IdentifiedGap[] {
  const gaps: IdentifiedGap[] = [];

  if (studies.length === 0) return gaps;

  const years = studies.map(s => s.year).sort((a, b) => a - b);
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const currentYear = new Date().getFullYear();

  // Check for recent research (last 5 years)
  const recentStudies = studies.filter(s => s.year >= currentYear - 5);
  if (recentStudies.length < studies.length * 0.2) {
    gaps.push({
      gap_type: 'temporal',
      description: 'Limited recent research - most studies are older than 5 years',
      evidence: [`Only ${recentStudies.length} of ${studies.length} studies from last 5 years`],
      priority: 'high',
      confidence: 0.9
    });
  }

  // Check for publication gaps (years with no publications)
  const yearCounts = new Map<number, number>();
  for (const year of years) {
    yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
  }

  const gapYears: number[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    if (!yearCounts.has(year)) {
      gapYears.push(year);
    }
  }

  if (gapYears.length > 0 && gapYears.length < (maxYear - minYear) * 0.5) {
    gaps.push({
      gap_type: 'temporal',
      description: `Publication gaps detected in years: ${gapYears.slice(0, 5).join(', ')}${gapYears.length > 5 ? '...' : ''}`,
      evidence: [`${gapYears.length} years with no publications between ${minYear} and ${maxYear}`],
      priority: 'medium',
      confidence: 0.7
    });
  }

  return gaps;
}

/**
 * Identify methodological gaps
 */
function identifyMethodologicalGaps(studies: StudyMetadata[]): IdentifiedGap[] {
  const gaps: IdentifiedGap[] = [];

  if (studies.length === 0) return gaps;

  // Count study designs
  const designCounts = new Map<string, number>();
  for (const study of studies) {
    const design = study.study_design.toLowerCase();
    designCounts.set(design, (designCounts.get(design) || 0) + 1);
  }

  // Check for RCT gap
  const rctCount = Array.from(designCounts.entries())
    .filter(([design]) => design.includes('rct') || design.includes('randomized'))
    .reduce((sum, [, count]) => sum + count, 0);

  if (rctCount < studies.length * 0.2) {
    gaps.push({
      gap_type: 'methodological',
      description: 'Limited randomized controlled trials - most evidence from observational studies',
      evidence: [`Only ${rctCount} RCTs out of ${studies.length} total studies`],
      priority: 'high',
      confidence: 0.85
    });
  }

  // Check for systematic review gap
  const srCount = Array.from(designCounts.entries())
    .filter(([design]) => design.includes('systematic review') || design.includes('meta-analysis'))
    .reduce((sum, [, count]) => sum + count, 0);

  if (srCount === 0 && studies.length > 10) {
    gaps.push({
      gap_type: 'methodological',
      description: 'No systematic reviews or meta-analyses identified',
      evidence: ['Opportunity for evidence synthesis'],
      priority: 'medium',
      confidence: 0.9
    });
  }

  return gaps;
}

/**
 * Identify population gaps
 */
function identifyPopulationGaps(studies: StudyMetadata[]): IdentifiedGap[] {
  const gaps: IdentifiedGap[] = [];

  const studiesWithPopulation = studies.filter(s => s.population);
  if (studiesWithPopulation.length === 0) return gaps;

  // Extract population characteristics
  const populations = studiesWithPopulation.map(s => s.population!.toLowerCase());

  // Check for pediatric studies
  const pediatricCount = populations.filter(p =>
    p.includes('child') || p.includes('pediatric') || p.includes('adolescent')
  ).length;

  if (pediatricCount < studiesWithPopulation.length * 0.1) {
    gaps.push({
      gap_type: 'population',
      description: 'Limited research in pediatric populations',
      evidence: [`Only ${pediatricCount} of ${studiesWithPopulation.length} studies include children`],
      priority: 'medium',
      confidence: 0.75
    });
  }

  // Check for elderly studies
  const elderlyCount = populations.filter(p =>
    p.includes('elderly') || p.includes('older adult') || p.includes('geriatric')
  ).length;

  if (elderlyCount < studiesWithPopulation.length * 0.1) {
    gaps.push({
      gap_type: 'population',
      description: 'Limited research in elderly populations',
      evidence: [`Only ${elderlyCount} of ${studiesWithPopulation.length} studies include elderly`],
      priority: 'medium',
      confidence: 0.75
    });
  }

  return gaps;
}

/**
 * Identify geographic gaps
 */
function identifyGeographicGaps(studies: StudyMetadata[]): IdentifiedGap[] {
  const gaps: IdentifiedGap[] = [];

  const studiesWithLocation = studies.filter(s => s.geographic_location);
  if (studiesWithLocation.length === 0) return gaps;

  const locations = studiesWithLocation.map(s => s.geographic_location!.toLowerCase());

  // Check for LMIC representation
  const lmicKeywords = ['africa', 'asia', 'latin america', 'developing', 'low-income', 'middle-income'];
  const lmicCount = locations.filter(loc =>
    lmicKeywords.some(keyword => loc.includes(keyword))
  ).length;

  if (lmicCount < studiesWithLocation.length * 0.2) {
    gaps.push({
      gap_type: 'geographic',
      description: 'Limited research from low- and middle-income countries',
      evidence: [`Only ${lmicCount} of ${studiesWithLocation.length} studies from LMICs`],
      priority: 'high',
      confidence: 0.8
    });
  }

  return gaps;
}

/**
 * Generate recommendations
 */
function generateRecommendations(gaps: IdentifiedGap[]): string[] {
  const recommendations: string[] = [];

  const highPriorityGaps = gaps.filter(g => g.priority === 'high');
  if (highPriorityGaps.length > 0) {
    recommendations.push(`Address ${highPriorityGaps.length} high-priority gaps identified`);
  }

  const temporalGaps = gaps.filter(g => g.gap_type === 'temporal');
  if (temporalGaps.length > 0) {
    recommendations.push('Conduct updated research to address temporal gaps');
  }

  const methodologicalGaps = gaps.filter(g => g.gap_type === 'methodological');
  if (methodologicalGaps.length > 0) {
    recommendations.push('Consider higher-quality study designs (RCTs, systematic reviews)');
  }

  const populationGaps = gaps.filter(g => g.gap_type === 'population');
  if (populationGaps.length > 0) {
    recommendations.push('Expand research to underrepresented populations');
  }

  const geographicGaps = gaps.filter(g => g.gap_type === 'geographic');
  if (geographicGaps.length > 0) {
    recommendations.push('Include studies from diverse geographic regions');
  }

  if (recommendations.length === 0) {
    recommendations.push('Literature appears comprehensive with no major gaps identified');
  }

  return recommendations;
}

/**
 * Identify literature gaps
 */
export async function identifyGaps(
  input: IdentifyGapsInput
): Promise<IdentifyGapsOutput> {
  const startTime = Date.now();

  try {
    logger.info(`Identifying gaps in ${input.studies.length} studies`);

    // Validate input
    if (!input.studies || input.studies.length === 0) {
      throw new Error('Studies array is required and must not be empty');
    }

    const minConfidence = input.min_confidence ?? 0.5;
    const gaps: IdentifiedGap[] = [];

    // Identify temporal gaps
    if (input.identify_temporal_gaps !== false) {
      gaps.push(...identifyTemporalGaps(input.studies));
    }

    // Identify methodological gaps
    if (input.identify_methodological_gaps !== false) {
      gaps.push(...identifyMethodologicalGaps(input.studies));
    }

    // Identify population gaps
    if (input.identify_population_gaps !== false) {
      gaps.push(...identifyPopulationGaps(input.studies));
    }

    // Identify geographic gaps
    if (input.identify_geographic_gaps !== false) {
      gaps.push(...identifyGeographicGaps(input.studies));
    }

    // Filter by confidence
    const filteredGaps = gaps.filter(g => g.confidence >= minConfidence);

    // Cluster studies by topic
    const topicClusters = clusterByTopic(input.studies);

    // Generate recommendations
    const recommendations = generateRecommendations(filteredGaps);

    const processingTime = Date.now() - startTime;

    logger.info(`Gap identification completed in ${processingTime}ms`);

    return {
      success: true,
      total_studies: input.studies.length,
      gaps_identified: filteredGaps,
      topic_clusters: topicClusters,
      recommendations,
      processing_time_ms: processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Gap identification failed', error);

    return {
      success: false,
      total_studies: input.studies?.length || 0,
      gaps_identified: [],
      topic_clusters: [],
      recommendations: ['Gap identification failed - manual review required'],
      processing_time_ms: processingTime
    };
  }
}

/**
 * MCP tool handler for identify_gaps
 */
export const identifyGapsTool = {
  name: 'identify_gaps',
  description: 'Systematically identify research gaps through topic clustering, temporal analysis, and methodological gap detection',
  inputSchema: {
    type: 'object',
    properties: {
      studies: {
        type: 'array',
        description: 'Array of studies to analyze for gaps',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            abstract: { type: 'string' },
            year: { type: 'number' },
            study_design: { type: 'string' },
            population: { type: 'string' },
            intervention: { type: 'string' },
            outcome: { type: 'string' },
            geographic_location: { type: 'string' }
          },
          required: ['id', 'title', 'abstract', 'year', 'study_design']
        }
      },
      min_confidence: {
        type: 'number',
        description: 'Minimum confidence threshold for gaps (0-1, default: 0.5)',
        default: 0.5
      },
      identify_temporal_gaps: {
        type: 'boolean',
        description: 'Identify temporal gaps (default: true)',
        default: true
      },
      identify_methodological_gaps: {
        type: 'boolean',
        description: 'Identify methodological gaps (default: true)',
        default: true
      },
      identify_population_gaps: {
        type: 'boolean',
        description: 'Identify population gaps (default: true)',
        default: true
      },
      identify_geographic_gaps: {
        type: 'boolean',
        description: 'Identify geographic gaps (default: true)',
        default: true
      }
    },
    required: ['studies']
  },
  handler: identifyGaps
};
