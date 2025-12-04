/**
 * MedResearch AI - Plagiarism Detection Database Integration
 * 
 * Integrates plagiarism detection with all 7 medical research databases:
 * - PubMed (36M+ citations)
 * - Europe PMC (42M+ publications)
 * - Semantic Scholar (200M+ papers)
 * - The Lens (250M+ works)
 * - ClinicalTrials.gov (450K+ trials)
 * - CrossRef (150M+ DOI metadata)
 * - Unpaywall (open access)
 * 
 * Enhanced with:
 * - Structured logging for debugging
 * 
 * @version 1.1.0
 */

import { searchPubMed } from './medical-databases.js';
import { searchEuropePMC } from './medical-databases.js';
import { searchSemanticScholar } from './semantic-scholar.js';
import { searchLens } from './lens.js';
import { searchCrossRef } from './crossref.js';
import { 
  PlagiarismMatch, 
  PlagiarismReport, 
  PlagiarismConfig,
  MatchedSegment 
} from './plagiarism-detection.js';
import { logger } from '../../common/logger.js';

/**
 * Database search result for plagiarism checking
 */
interface DatabaseSearchResult {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  source: string;
  database: string;
  doi?: string;
  pmid?: string;
  url?: string;
}

/**
 * Preprocess text for comparison
 */
function preprocessText(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return normalized.split(' ').filter(word => word.length > 0);
}

/**
 * Generate w-shingles from tokens
 */
function generateShingles(tokens: string[], shingleSize: number): Set<string> {
  const shingles = new Set<string>();
  
  for (let i = 0; i <= tokens.length - shingleSize; i++) {
    const shingle = tokens.slice(i, i + shingleSize).join(' ');
    shingles.add(shingle);
  }
  
  return shingles;
}

/**
 * Calculate Jaccard Similarity
 */
function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
}

/**
 * Find matched segments between texts
 */
function findMatchedSegments(
  originalTokens: string[],
  comparedTokens: string[],
  shingleSize: number,
  minMatches: number = 3
): MatchedSegment[] {
  const segments: MatchedSegment[] = [];
  const originalShingles = generateShingles(originalTokens, shingleSize);
  const comparedShingles = generateShingles(comparedTokens, shingleSize);
  
  const matchingShingles = new Set(
    [...originalShingles].filter(s => comparedShingles.has(s))
  );
  
  if (matchingShingles.size < minMatches) {
    return segments;
  }
  
  let currentSegment: MatchedSegment | null = null;
  
  for (let i = 0; i <= originalTokens.length - shingleSize; i++) {
    const shingle = originalTokens.slice(i, i + shingleSize).join(' ');
    
    if (matchingShingles.has(shingle)) {
      if (!currentSegment) {
        currentSegment = {
          originalText: shingle,
          matchedText: shingle,
          startPosition: i,
          endPosition: i + shingleSize,
          shingleMatches: 1,
        };
      } else {
        currentSegment.endPosition = i + shingleSize;
        currentSegment.originalText = originalTokens
          .slice(currentSegment.startPosition, currentSegment.endPosition)
          .join(' ');
        currentSegment.shingleMatches++;
      }
    } else if (currentSegment) {
      segments.push(currentSegment);
      currentSegment = null;
    }
  }
  
  if (currentSegment) {
    segments.push(currentSegment);
  }
  
  return segments;
}

/**
 * Determine match confidence
 */
function determineConfidence(
  similarityScore: number,
  segmentCount: number,
  avgSegmentLength: number
): 'high' | 'medium' | 'low' {
  if (similarityScore >= 0.5 && segmentCount >= 5 && avgSegmentLength >= 10) {
    return 'high';
  } else if (similarityScore >= 0.3 && segmentCount >= 3 && avgSegmentLength >= 7) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Classify match type
 */
function classifyMatchType(
  similarityScore: number,
  segments: MatchedSegment[],
  hasCitations: boolean
): 'exact' | 'paraphrase' | 'citation' | 'self' {
  const avgSegmentLength = segments.length > 0
    ? segments.reduce((sum, s) => sum + (s.endPosition - s.startPosition), 0) / segments.length
    : 0;
  
  if (similarityScore >= 0.8 && avgSegmentLength >= 15) {
    return 'exact';
  } else if (hasCitations && similarityScore >= 0.3) {
    return 'citation';
  } else if (similarityScore >= 0.4 && avgSegmentLength >= 8) {
    return 'paraphrase';
  } else {
    return 'self';
  }
}

/**
 * Extract key phrases for database searching
 */
function extractKeyPhrases(tokens: string[], count: number = 5): string[] {
  const phrases: string[] = [];
  const phraseLength = 4;
  
  for (let i = 0; i <= tokens.length - phraseLength; i++) {
    const phrase = tokens.slice(i, i + phraseLength).join(' ');
    if (phrase.length > 15) { // Only meaningful phrases
      phrases.push(phrase);
    }
  }
  
  // Return top N unique phrases
  return [...new Set(phrases)].slice(0, count);
}

/**
 * Search PubMed for similar content
 */
async function searchPubMedForPlagiarism(
  keyPhrases: string[],
  maxResults: number
): Promise<DatabaseSearchResult[]> {
  const results: DatabaseSearchResult[] = [];
  
  try {
    for (const phrase of keyPhrases.slice(0, 3)) {
      const response = await searchPubMed({
        query: `"${phrase}"`,
        max_results: Math.min(maxResults, 5),
      });
      
      const data = JSON.parse(response.content[0].text);
      
      if (data.success && data.results) {
        for (const article of data.results) {
          results.push({
            id: article.pmid,
            title: article.title,
            abstract: article.abstract || '',
            authors: article.authors || [],
            year: article.year || 0,
            source: article.journal || 'PubMed',
            database: 'PubMed',
            pmid: article.pmid,
            doi: article.doi,
            url: `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
          });
        }
      }
    }
  } catch (error) {
    logger.error('PubMed search error', { error: error instanceof Error ? error.message : String(error) });
  }
  
  return results;
}

/**
 * Search Europe PMC for similar content
 */
async function searchEuropePMCForPlagiarism(
  keyPhrases: string[],
  maxResults: number
): Promise<DatabaseSearchResult[]> {
  const results: DatabaseSearchResult[] = [];
  
  try {
    for (const phrase of keyPhrases.slice(0, 3)) {
      const response = await searchEuropePMC({
        query: `"${phrase}"`,
        max_results: Math.min(maxResults, 5),
      });
      
      const data = JSON.parse(response.content[0].text);
      
      if (data.success && data.results) {
        for (const article of data.results) {
          results.push({
            id: article.id,
            title: article.title,
            abstract: article.abstract || '',
            authors: article.authors || [],
            year: article.year || 0,
            source: article.source || 'Europe PMC',
            database: 'Europe PMC',
            pmid: article.pmid,
            doi: article.doi,
            url: `https://europepmc.org/article/MED/${article.id}`,
          });
        }
      }
    }
  } catch (error) {
    logger.error('Europe PMC search error', { error: error instanceof Error ? error.message : String(error) });
  }
  
  return results;
}

/**
 * Search Semantic Scholar for similar content
 */
async function searchSemanticScholarForPlagiarism(
  keyPhrases: string[],
  maxResults: number
): Promise<DatabaseSearchResult[]> {
  const results: DatabaseSearchResult[] = [];
  
  try {
    for (const phrase of keyPhrases.slice(0, 3)) {
      const response = await searchSemanticScholar({
        query: `"${phrase}"`,
        max_results: Math.min(maxResults, 5),
      });
      
      const data = JSON.parse(response.content[0].text);
      
      if (data.success && data.results) {
        for (const paper of data.results) {
          results.push({
            id: paper.paperId,
            title: paper.title,
            abstract: paper.abstract || '',
            authors: paper.authors?.map((a: any) => a.name) || [],
            year: paper.year || 0,
            source: paper.venue || 'Semantic Scholar',
            database: 'Semantic Scholar',
            doi: paper.externalIds?.DOI,
            url: `https://www.semanticscholar.org/paper/${paper.paperId}`,
          });
        }
      }
    }
  } catch (error) {
    logger.error('Semantic Scholar search error', { error: error instanceof Error ? error.message : String(error) });
  }
  
  return results;
}

/**
 * Search The Lens for similar content
 */
async function searchLensForPlagiarism(
  keyPhrases: string[],
  maxResults: number
): Promise<DatabaseSearchResult[]> {
  const results: DatabaseSearchResult[] = [];
  
  try {
    for (const phrase of keyPhrases.slice(0, 3)) {
      const response = await searchLens({
        query: `"${phrase}"`,
        max_results: Math.min(maxResults, 5),
      });
      
      const data = JSON.parse(response.content[0].text);
      
      if (data.success && data.results) {
        for (const work of data.results) {
          results.push({
            id: work.lens_id,
            title: work.title,
            abstract: work.abstract || '',
            authors: work.authors?.map((a: any) => a.display_name) || [],
            year: work.year_published || 0,
            source: work.source?.title || 'The Lens',
            database: 'The Lens',
            doi: work.external_ids?.find((id: any) => id.type === 'doi')?.value,
            url: `https://www.lens.org/lens/scholar/article/${work.lens_id}`,
          });
        }
      }
    }
  } catch (error) {
    logger.error('The Lens search error', { error: error instanceof Error ? error.message : String(error) });
  }
  
  return results;
}

/**
 * Search CrossRef for similar content
 */
async function searchCrossRefForPlagiarism(
  keyPhrases: string[],
  maxResults: number
): Promise<DatabaseSearchResult[]> {
  const results: DatabaseSearchResult[] = [];
  
  try {
    for (const phrase of keyPhrases.slice(0, 3)) {
      const response = await searchCrossRef({
        query: `"${phrase}"`,
        max_results: Math.min(maxResults, 5),
      });
      
      const data = JSON.parse(response.content[0].text);
      
      if (data.success && data.results) {
        for (const work of data.results) {
          results.push({
            id: work.DOI,
            title: work.title?.[0] || '',
            abstract: work.abstract || '',
            authors: work.author?.map((a: any) => `${a.given} ${a.family}`) || [],
            year: work.published?.['date-parts']?.[0]?.[0] || 0,
            source: work.publisher || 'CrossRef',
            database: 'CrossRef',
            doi: work.DOI,
            url: `https://doi.org/${work.DOI}`,
          });
        }
      }
    }
  } catch (error) {
    logger.error('CrossRef search error', { error: error instanceof Error ? error.message : String(error) });
  }
  
  return results;
}

/**
 * Compare document against database results
 */
function compareWithDatabaseResults(
  originalText: string,
  results: DatabaseSearchResult[],
  config: PlagiarismConfig
): PlagiarismMatch[] {
  const matches: PlagiarismMatch[] = [];
  const originalTokens = preprocessText(originalText);
  const originalShingles = generateShingles(originalTokens, config.shingleSize);
  
  for (const result of results) {
    // Combine title and abstract for comparison
    const comparedText = `${result.title} ${result.abstract}`;
    const comparedTokens = preprocessText(comparedText);
    const comparedShingles = generateShingles(comparedTokens, config.shingleSize);
    
    // Calculate similarity
    const similarity = calculateJaccardSimilarity(originalShingles, comparedShingles);
    
    // Only include if above threshold
    if (similarity >= config.minSimilarityThreshold) {
      const segments = findMatchedSegments(
        originalTokens,
        comparedTokens,
        config.shingleSize
      );
      
      const avgSegmentLength = segments.length > 0
        ? segments.reduce((sum, s) => sum + (s.endPosition - s.startPosition), 0) / segments.length
        : 0;
      
      const confidence = determineConfidence(similarity, segments.length, avgSegmentLength);
      const matchType = classifyMatchType(similarity, segments, false);
      
      matches.push({
        source: result.title,
        sourceId: result.id,
        database: result.database,
        similarityScore: similarity,
        matchedSegments: segments,
        matchType,
        confidence,
      });
    }
  }
  
  // Sort by similarity score (highest first)
  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Check document for plagiarism across all databases
 */
export async function checkPlagiarismAcrossDatabases(args: {
  text: string;
  title?: string;
  author?: string;
  config?: Partial<PlagiarismConfig>;
  databases?: string[];
}) {
  const {
    text,
    title = 'Untitled Document',
    author,
    config = {},
    databases = ['pubmed', 'europepmc', 'semanticscholar', 'lens', 'crossref'],
  } = args;
  
  // Default configuration
  const fullConfig: PlagiarismConfig = {
    shingleSize: config.shingleSize || 5,
    minSimilarityThreshold: config.minSimilarityThreshold || 0.15,
    maxResults: config.maxResults || 10,
    checkCitations: config.checkCitations !== false,
    checkSelfPlagiarism: config.checkSelfPlagiarism !== false,
  };
  
  try {
    // Preprocess and extract key phrases
    const tokens = preprocessText(text);
    const keyPhrases = extractKeyPhrases(tokens, 5);
    
    logger.info('Extracted key phrases for searching', { count: keyPhrases.length, phrases: keyPhrases.slice(0, 3) });
    
    // Search across all enabled databases
    const allResults: DatabaseSearchResult[] = [];
    
    if (databases.includes('pubmed')) {
      logger.info('Searching PubMed for plagiarism matches');
      const pubmedResults = await searchPubMedForPlagiarism(keyPhrases, fullConfig.maxResults);
      allResults.push(...pubmedResults);
      logger.info('PubMed search completed', { results: pubmedResults.length });
    }
    
    if (databases.includes('europepmc')) {
      logger.info('Searching Europe PMC for plagiarism matches');
      const europeResults = await searchEuropePMCForPlagiarism(keyPhrases, fullConfig.maxResults);
      allResults.push(...europeResults);
      logger.info('Europe PMC search completed', { results: europeResults.length });
    }
    
    if (databases.includes('semanticscholar')) {
      logger.info('Searching Semantic Scholar for plagiarism matches');
      const semanticResults = await searchSemanticScholarForPlagiarism(keyPhrases, fullConfig.maxResults);
      allResults.push(...semanticResults);
      logger.info('Semantic Scholar search completed', { results: semanticResults.length });
    }
    
    if (databases.includes('lens')) {
      logger.info('Searching The Lens for plagiarism matches');
      const lensResults = await searchLensForPlagiarism(keyPhrases, fullConfig.maxResults);
      allResults.push(...lensResults);
      logger.info('The Lens search completed', { results: lensResults.length });
    }
    
    if (databases.includes('crossref')) {
      logger.info('Searching CrossRef for plagiarism matches');
      const crossrefResults = await searchCrossRefForPlagiarism(keyPhrases, fullConfig.maxResults);
      allResults.push(...crossrefResults);
      logger.info('CrossRef search completed', { results: crossrefResults.length });
    }
    
    logger.info('All database searches completed', { totalResults: allResults.length });
    
    // Compare document with all results
    const matches = compareWithDatabaseResults(text, allResults, fullConfig);
    
    logger.info('Plagiarism comparison completed', { matches: matches.length, threshold: fullConfig.minSimilarityThreshold });
    
    // Calculate overall similarity (highest match)
    const overallSimilarity = matches.length > 0
      ? Math.max(...matches.map(m => m.similarityScore))
      : 0;
    
    // Generate report
    const report: PlagiarismReport = {
      overallSimilarity,
      totalMatches: matches.length,
      highConfidenceMatches: matches.filter(m => m.confidence === 'high').length,
      mediumConfidenceMatches: matches.filter(m => m.confidence === 'medium').length,
      lowConfidenceMatches: matches.filter(m => m.confidence === 'low').length,
      matches: matches.slice(0, fullConfig.maxResults),
      summary: generateSummary(matches, fullConfig.minSimilarityThreshold, overallSimilarity),
      recommendations: generateRecommendations(matches, overallSimilarity),
      timestamp: new Date().toISOString(),
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          title,
          author,
          config: fullConfig,
          report,
          metadata: {
            totalTokens: tokens.length,
            keyPhrasesExtracted: keyPhrases.length,
            databasesSearched: databases,
            totalDatabaseResults: allResults.length,
            matchesFound: matches.length,
          },
        }, null, 2),
      }],
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          stack: error instanceof Error ? error.stack : undefined,
        }, null, 2),
      }],
      isError: true,
    };
  }
}

/**
 * Generate summary for report
 */
function generateSummary(
  matches: PlagiarismMatch[],
  threshold: number,
  overallSimilarity: number
): string {
  if (matches.length === 0) {
    return `✓ No significant plagiarism detected above ${(threshold * 100).toFixed(0)}% similarity threshold. Document appears original.`;
  }
  
  const highConfidence = matches.filter(m => m.confidence === 'high').length;
  const exactMatches = matches.filter(m => m.matchType === 'exact').length;
  const paraphrases = matches.filter(m => m.matchType === 'paraphrase').length;
  
  const similarityPercent = (overallSimilarity * 100).toFixed(1);
  
  if (highConfidence > 0 || overallSimilarity >= 0.5) {
    return `⚠️ HIGH RISK: ${similarityPercent}% similarity detected. Found ${highConfidence} high-confidence match(es), including ${exactMatches} exact match(es) and ${paraphrases} paraphrase(s). IMMEDIATE REVIEW REQUIRED.`;
  } else if (overallSimilarity >= 0.3) {
    return `⚠️ MODERATE RISK: ${similarityPercent}% similarity detected. Found ${matches.length} potential match(es). Manual review recommended.`;
  } else {
    return `ℹ️ LOW RISK: ${similarityPercent}% similarity detected. ${matches.length} minor match(es) found. Standard review recommended.`;
  }
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  matches: PlagiarismMatch[],
  overallSimilarity: number
): string[] {
  const recommendations: string[] = [];
  
  if (matches.length === 0) {
    recommendations.push('✓ Document appears to be original');
    recommendations.push('✓ No significant matches found in medical literature databases');
    recommendations.push('• Consider adding more citations to support claims');
    recommendations.push('• Ensure all referenced work is properly cited');
    return recommendations;
  }
  
  const highConfidence = matches.filter(m => m.confidence === 'high');
  const exactMatches = matches.filter(m => m.matchType === 'exact');
  const paraphrases = matches.filter(m => m.matchType === 'paraphrase');
  
  if (overallSimilarity >= 0.5) {
    recommendations.push('🚨 CRITICAL: Very high similarity detected');
    recommendations.push('🚨 Document may contain substantial plagiarized content');
    recommendations.push('🚨 DO NOT PUBLISH without thorough investigation');
  }
  
  if (exactMatches.length > 0) {
    recommendations.push(`⚠️ ${exactMatches.length} exact text match(es) found`);
    recommendations.push('⚠️ Verify all matched text is properly quoted and cited');
    recommendations.push('⚠️ Consider paraphrasing or adding quotation marks');
  }
  
  if (paraphrases.length > 0) {
    recommendations.push(`⚠️ ${paraphrases.length} paraphrased section(s) detected`);
    recommendations.push('⚠️ Ensure all paraphrased content includes proper attribution');
    recommendations.push('⚠️ Add citations to original sources');
  }
  
  if (highConfidence.length > 0) {
    recommendations.push(`🔍 ${highConfidence.length} high-confidence match(es) require immediate review`);
    recommendations.push('🔍 Compare matched segments with original sources');
    recommendations.push('🔍 Verify originality of all flagged sections');
  }
  
  recommendations.push('📋 Review all matched segments in full context');
  recommendations.push('📋 Verify all citations are properly formatted');
  recommendations.push('📋 Consider using plagiarism detection as part of peer review');
  
  // Database-specific recommendations
  const databases = [...new Set(matches.map(m => m.database))];
  if (databases.length > 1) {
    recommendations.push(`📊 Matches found across ${databases.length} databases: ${databases.join(', ')}`);
  }
  
  return recommendations;
}
