/**
 * Duplicate Detection Tool
 * 
 * Detects potential duplicate studies using fuzzy matching:
 * - Title similarity (Levenshtein distance, Jaro-Winkler)
 * - Author overlap (first author, full author list)
 * - Publication year matching
 * - DOI/PMID exact matching
 * - Abstract similarity (basic text comparison)
 * 
 * Returns similarity scores and duplicate flags with confidence levels.
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Study metadata for duplicate detection
 */
export interface StudyMetadata {
  study_id: string;
  title: string;
  authors?: string[];
  first_author?: string;
  publication_year?: number;
  doi?: string;
  pmid?: string;
  abstract?: string;
}

/**
 * Duplicate detection result
 */
export interface DuplicateMatch {
  study_a_id: string;
  study_b_id: string;
  similarity_score: number; // 0-100
  is_likely_duplicate: boolean;
  confidence: number; // 0-1
  match_details: {
    title_similarity: number;
    author_overlap: number;
    year_match: boolean;
    identifier_match: boolean;
    abstract_similarity?: number;
  };
  reasons: string[];
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity percentage using Levenshtein distance
 */
function levenshteinSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 100;
  return ((maxLen - distance) / maxLen) * 100;
}

/**
 * Calculate Jaro-Winkler similarity
 */
function jaroWinklerSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 100;
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  if (len1 === 0 || len2 === 0) return 0;
  
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0;
  
  // Find transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  
  // Jaro-Winkler bonus for common prefix
  let prefix = 0;
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  
  const jaroWinkler = jaro + prefix * 0.1 * (1 - jaro);
  return jaroWinkler * 100;
}

/**
 * Calculate title similarity using multiple algorithms
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  // Normalize titles
  const normalize = (str: string) => str.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const t1 = normalize(title1);
  const t2 = normalize(title2);
  
  // Use both algorithms and take the maximum
  const levenshtein = levenshteinSimilarity(t1, t2);
  const jaroWinkler = jaroWinklerSimilarity(t1, t2);
  
  return Math.max(levenshtein, jaroWinkler);
}

/**
 * Calculate author overlap percentage
 */
function calculateAuthorOverlap(authors1?: string[], authors2?: string[], firstAuthor1?: string, firstAuthor2?: string): number {
  // Check first author match
  if (firstAuthor1 && firstAuthor2) {
    const normalize = (name: string) => name.toLowerCase().replace(/[^\w\s]/g, '').trim();
    if (normalize(firstAuthor1) === normalize(firstAuthor2)) {
      return 100; // First author match is strong signal
    }
  }
  
  // Check full author list overlap
  if (authors1 && authors2 && authors1.length > 0 && authors2.length > 0) {
    const normalize = (name: string) => name.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const set1 = new Set(authors1.map(normalize));
    const set2 = new Set(authors2.map(normalize));
    
    let overlap = 0;
    for (const author of set1) {
      if (set2.has(author)) overlap++;
    }
    
    const maxAuthors = Math.max(authors1.length, authors2.length);
    return (overlap / maxAuthors) * 100;
  }
  
  return 0;
}

/**
 * Calculate abstract similarity using word overlap
 */
function calculateAbstractSimilarity(abstract1?: string, abstract2?: string): number {
  if (!abstract1 || !abstract2) return 0;
  
  // Tokenize and normalize
  const tokenize = (text: string) => {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3); // Filter short words
  };
  
  const words1 = tokenize(abstract1);
  const words2 = tokenize(abstract2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Calculate word overlap (simple Jaccard similarity)
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }
  
  const union = set1.size + set2.size - intersection;
  return (intersection / union) * 100;
}

/**
 * Detect if two studies are potential duplicates
 */
export function detectDuplicate(study1: StudyMetadata, study2: StudyMetadata): DuplicateMatch {
  const reasons: string[] = [];
  
  // 1. Check exact identifier matches (DOI, PMID)
  let identifierMatch = false;
  if (study1.doi && study2.doi && study1.doi.toLowerCase() === study2.doi.toLowerCase()) {
    identifierMatch = true;
    reasons.push('Exact DOI match');
  }
  if (study1.pmid && study2.pmid && study1.pmid === study2.pmid) {
    identifierMatch = true;
    reasons.push('Exact PMID match');
  }
  
  // 2. Calculate title similarity
  const titleSimilarity = calculateTitleSimilarity(study1.title, study2.title);
  if (titleSimilarity >= 90) {
    reasons.push(`Very high title similarity (${titleSimilarity.toFixed(1)}%)`);
  } else if (titleSimilarity >= 80) {
    reasons.push(`High title similarity (${titleSimilarity.toFixed(1)}%)`);
  }
  
  // 3. Calculate author overlap
  const authorOverlap = calculateAuthorOverlap(
    study1.authors,
    study2.authors,
    study1.first_author,
    study2.first_author
  );
  if (authorOverlap >= 80) {
    reasons.push(`High author overlap (${authorOverlap.toFixed(1)}%)`);
  }
  
  // 4. Check publication year
  let yearMatch = false;
  if (study1.publication_year && study2.publication_year) {
    const yearDiff = Math.abs(study1.publication_year - study2.publication_year);
    yearMatch = yearDiff <= 1; // Allow ±1 year for publication lag
    if (yearMatch) {
      reasons.push(`Publication year match (${study1.publication_year} ≈ ${study2.publication_year})`);
    }
  }
  
  // 5. Calculate abstract similarity (if available)
  let abstractSimilarity: number | undefined;
  if (study1.abstract && study2.abstract) {
    abstractSimilarity = calculateAbstractSimilarity(study1.abstract, study2.abstract);
    if (abstractSimilarity >= 70) {
      reasons.push(`High abstract similarity (${abstractSimilarity.toFixed(1)}%)`);
    }
  }
  
  // Calculate overall similarity score (weighted)
  let similarityScore = 0;
  let weights = 0;
  
  if (identifierMatch) {
    // Identifier match is definitive
    similarityScore = 100;
  } else {
    // Weight different factors
    similarityScore += titleSimilarity * 0.4; // 40% weight
    weights += 0.4;
    
    if (authorOverlap > 0) {
      similarityScore += authorOverlap * 0.3; // 30% weight
      weights += 0.3;
    }
    
    if (yearMatch) {
      similarityScore += 100 * 0.1; // 10% weight
      weights += 0.1;
    }
    
    if (abstractSimilarity !== undefined) {
      similarityScore += abstractSimilarity * 0.2; // 20% weight
      weights += 0.2;
    }
    
    // Normalize by actual weights used
    if (weights > 0) {
      similarityScore = similarityScore / weights;
    }
  }
  
  // Determine if likely duplicate
  const isLikelyDuplicate = identifierMatch || 
                           (titleSimilarity >= 85 && authorOverlap >= 50) ||
                           (titleSimilarity >= 90 && yearMatch) ||
                           similarityScore >= 80;
  
  // Calculate confidence
  let confidence = 0;
  if (identifierMatch) {
    confidence = 1.0; // 100% confidence on identifier match
  } else {
    // Base confidence on number of matching signals
    const signals = [
      titleSimilarity >= 80,
      authorOverlap >= 50,
      yearMatch,
      abstractSimilarity !== undefined && abstractSimilarity >= 70
    ].filter(Boolean).length;
    
    confidence = Math.min(0.3 + (signals * 0.2), 0.95);
  }
  
  if (reasons.length === 0) {
    reasons.push('Low similarity across all metrics');
  }
  
  return {
    study_a_id: study1.study_id,
    study_b_id: study2.study_id,
    similarity_score: Math.round(similarityScore * 10) / 10,
    is_likely_duplicate: isLikelyDuplicate,
    confidence,
    match_details: {
      title_similarity: Math.round(titleSimilarity * 10) / 10,
      author_overlap: Math.round(authorOverlap * 10) / 10,
      year_match: yearMatch,
      identifier_match: identifierMatch,
      abstract_similarity: abstractSimilarity !== undefined ? Math.round(abstractSimilarity * 10) / 10 : undefined,
    },
    reasons,
  };
}

/**
 * Find all potential duplicates in a list of studies
 */
export function findDuplicates(studies: StudyMetadata[], threshold: number = 80): DuplicateMatch[] {
  const duplicates: DuplicateMatch[] = [];
  
  // Compare each pair of studies
  for (let i = 0; i < studies.length; i++) {
    for (let j = i + 1; j < studies.length; j++) {
      const match = detectDuplicate(studies[i], studies[j]);
      
      // Only include matches above threshold
      if (match.similarity_score >= threshold) {
        duplicates.push(match);
      }
    }
  }
  
  // Sort by similarity score (highest first)
  duplicates.sort((a, b) => b.similarity_score - a.similarity_score);
  
  return duplicates;
}

/**
 * MCP tool interface for duplicate detection
 */
export async function detectDuplicatesMCP(args: {
  studies: StudyMetadata[];
  threshold?: number;
}): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  try {
    logger.info('Detecting duplicates', {
      study_count: args.studies.length,
      threshold: args.threshold || 80,
    });
    
    const threshold = args.threshold || 80;
    const duplicates = findDuplicates(args.studies, threshold);
    
    const result = {
      total_studies: args.studies.length,
      comparisons_made: (args.studies.length * (args.studies.length - 1)) / 2,
      duplicates_found: duplicates.length,
      threshold_used: threshold,
      matches: duplicates,
      summary: {
        high_confidence: duplicates.filter(d => d.confidence >= 0.8).length,
        medium_confidence: duplicates.filter(d => d.confidence >= 0.5 && d.confidence < 0.8).length,
        low_confidence: duplicates.filter(d => d.confidence < 0.5).length,
      },
    };
    
    logger.info('Duplicate detection complete', {
      duplicates_found: duplicates.length,
      high_confidence: result.summary.high_confidence,
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
    logger.error('Error detecting duplicates', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Error detecting duplicates: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
