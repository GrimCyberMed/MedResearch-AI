/**
 * Duplicate Detection Tool
 * 
 * Cross-database duplicate identification using fuzzy matching and identifier cross-referencing.
 * Detects duplicate studies across PubMed, Embase, Web of Science, and other databases.
 * 
 * @module duplicate-detection
 * @version 1.0.0
 * @since 5.1.0
 */

import { logger } from '../../common/logger.js';

/**
 * Citation for duplicate detection
 */
export interface Citation {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  database: string;
}

/**
 * Duplicate match result
 */
export interface DuplicateMatch {
  citation1_id: string;
  citation2_id: string;
  match_type: 'exact' | 'high' | 'medium' | 'low';
  confidence: number;
  reasons: string[];
  title_similarity: number;
  author_similarity: number;
  year_match: boolean;
  identifier_match: boolean;
}

/**
 * Duplicate detection input
 */
export interface DetectDuplicatesInput {
  citations: Citation[];
  min_confidence?: number;
  check_identifiers?: boolean;
  check_title?: boolean;
  check_authors?: boolean;
  check_year?: boolean;
}

/**
 * Duplicate detection output
 */
export interface DetectDuplicatesOutput {
  success: boolean;
  total_citations: number;
  duplicates_found: number;
  unique_citations: number;
  matches: DuplicateMatch[];
  duplicate_groups: string[][];
  processing_time_ms: number;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity between two strings (0-1)
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLen;
}

/**
 * Normalize title for comparison
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate title similarity
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const norm1 = normalizeTitle(title1);
  const norm2 = normalizeTitle(title2);

  return stringSimilarity(norm1, norm2);
}

/**
 * Normalize author name
 */
function normalizeAuthor(author: string): string {
  return author
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate author similarity (Jaccard index)
 */
function calculateAuthorSimilarity(authors1: string[], authors2: string[]): number {
  if (authors1.length === 0 && authors2.length === 0) return 1.0;
  if (authors1.length === 0 || authors2.length === 0) return 0.0;

  const norm1 = authors1.map(normalizeAuthor);
  const norm2 = authors2.map(normalizeAuthor);

  const set1 = new Set(norm1);
  const set2 = new Set(norm2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Check if identifiers match
 */
function checkIdentifierMatch(citation1: Citation, citation2: Citation): boolean {
  // DOI match
  if (citation1.doi && citation2.doi) {
    const doi1 = citation1.doi.toLowerCase().trim();
    const doi2 = citation2.doi.toLowerCase().trim();
    if (doi1 === doi2) return true;
  }

  // PMID match
  if (citation1.pmid && citation2.pmid) {
    if (citation1.pmid === citation2.pmid) return true;
  }

  // PMCID match
  if (citation1.pmcid && citation2.pmcid) {
    if (citation1.pmcid === citation2.pmcid) return true;
  }

  return false;
}

/**
 * Detect if two citations are duplicates
 */
function detectDuplicate(
  citation1: Citation,
  citation2: Citation,
  options: {
    checkIdentifiers: boolean;
    checkTitle: boolean;
    checkAuthors: boolean;
    checkYear: boolean;
    minConfidence: number;
  }
): DuplicateMatch | null {
  const reasons: string[] = [];
  let confidence = 0;
  let titleSimilarity = 0;
  let authorSimilarity = 0;
  let yearMatch = false;
  let identifierMatch = false;

  // Check identifiers (highest priority)
  if (options.checkIdentifiers) {
    identifierMatch = checkIdentifierMatch(citation1, citation2);
    if (identifierMatch) {
      reasons.push('Matching identifier (DOI/PMID/PMCID)');
      confidence += 0.5;
    }
  }

  // Check title similarity
  if (options.checkTitle) {
    titleSimilarity = calculateTitleSimilarity(citation1.title, citation2.title);
    if (titleSimilarity >= 0.9) {
      reasons.push(`High title similarity (${(titleSimilarity * 100).toFixed(1)}%)`);
      confidence += 0.3;
    } else if (titleSimilarity >= 0.7) {
      reasons.push(`Moderate title similarity (${(titleSimilarity * 100).toFixed(1)}%)`);
      confidence += 0.15;
    }
  }

  // Check author similarity
  if (options.checkAuthors) {
    authorSimilarity = calculateAuthorSimilarity(citation1.authors, citation2.authors);
    if (authorSimilarity >= 0.7) {
      reasons.push(`High author overlap (${(authorSimilarity * 100).toFixed(1)}%)`);
      confidence += 0.15;
    } else if (authorSimilarity >= 0.5) {
      reasons.push(`Moderate author overlap (${(authorSimilarity * 100).toFixed(1)}%)`);
      confidence += 0.05;
    }
  }

  // Check year match
  if (options.checkYear) {
    yearMatch = citation1.year === citation2.year;
    if (yearMatch) {
      reasons.push('Same publication year');
      confidence += 0.05;
    }
  }

  // Determine match type
  let matchType: 'exact' | 'high' | 'medium' | 'low' = 'low';
  if (identifierMatch) {
    matchType = 'exact';
  } else if (confidence >= 0.7) {
    matchType = 'high';
  } else if (confidence >= 0.5) {
    matchType = 'medium';
  }

  // Return match if confidence exceeds threshold
  if (confidence >= options.minConfidence && reasons.length > 0) {
    return {
      citation1_id: citation1.id,
      citation2_id: citation2.id,
      match_type: matchType,
      confidence,
      reasons,
      title_similarity: titleSimilarity,
      author_similarity: authorSimilarity,
      year_match: yearMatch,
      identifier_match: identifierMatch
    };
  }

  return null;
}

/**
 * Group duplicates into clusters
 */
function groupDuplicates(matches: DuplicateMatch[]): string[][] {
  const groups: Map<string, Set<string>> = new Map();

  for (const match of matches) {
    const id1 = match.citation1_id;
    const id2 = match.citation2_id;

    // Find existing groups
    let group1 = groups.get(id1);
    let group2 = groups.get(id2);

    if (group1 && group2 && group1 !== group2) {
      // Merge groups
      for (const id of group2) {
        group1.add(id);
        groups.set(id, group1);
      }
    } else if (group1) {
      // Add to existing group
      group1.add(id2);
      groups.set(id2, group1);
    } else if (group2) {
      // Add to existing group
      group2.add(id1);
      groups.set(id1, group2);
    } else {
      // Create new group
      const newGroup = new Set([id1, id2]);
      groups.set(id1, newGroup);
      groups.set(id2, newGroup);
    }
  }

  // Convert to array of arrays (unique groups only)
  const uniqueGroups = new Set<Set<string>>();
  for (const group of groups.values()) {
    uniqueGroups.add(group);
  }

  return Array.from(uniqueGroups).map(group => Array.from(group));
}

/**
 * Detect duplicates in a list of citations
 */
export async function detectDuplicates(
  input: DetectDuplicatesInput
): Promise<DetectDuplicatesOutput> {
  const startTime = Date.now();

  try {
    logger.info(`Starting duplicate detection for ${input.citations.length} citations`);

    // Validate input
    if (!input.citations || input.citations.length === 0) {
      throw new Error('Citations array is required and must not be empty');
    }

    const minConfidence = input.min_confidence ?? 0.5;
    const checkIdentifiers = input.check_identifiers !== false;
    const checkTitle = input.check_title !== false;
    const checkAuthors = input.check_authors !== false;
    const checkYear = input.check_year !== false;

    const matches: DuplicateMatch[] = [];

    // Compare all pairs of citations
    for (let i = 0; i < input.citations.length; i++) {
      for (let j = i + 1; j < input.citations.length; j++) {
        const match = detectDuplicate(
          input.citations[i],
          input.citations[j],
          {
            checkIdentifiers,
            checkTitle,
            checkAuthors,
            checkYear,
            minConfidence
          }
        );

        if (match) {
          matches.push(match);
        }
      }
    }

    // Group duplicates
    const duplicateGroups = groupDuplicates(matches);

    // Count unique citations
    const duplicateIds = new Set<string>();
    for (const group of duplicateGroups) {
      for (const id of group) {
        duplicateIds.add(id);
      }
    }

    const uniqueCitations = input.citations.length - duplicateIds.size + duplicateGroups.length;

    const processingTime = Date.now() - startTime;

    logger.info(`Duplicate detection completed: ${matches.length} matches found in ${processingTime}ms`);

    return {
      success: true,
      total_citations: input.citations.length,
      duplicates_found: duplicateIds.size,
      unique_citations: uniqueCitations,
      matches,
      duplicate_groups: duplicateGroups,
      processing_time_ms: processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Duplicate detection failed', error);

    return {
      success: false,
      total_citations: input.citations?.length || 0,
      duplicates_found: 0,
      unique_citations: input.citations?.length || 0,
      matches: [],
      duplicate_groups: [],
      processing_time_ms: processingTime
    };
  }
}

/**
 * MCP tool handler for detect_duplicates
 */
export const detectDuplicatesTool = {
  name: 'detect_duplicates',
  description: 'Detect duplicate citations across databases using fuzzy matching and identifier cross-referencing',
  inputSchema: {
    type: 'object',
    properties: {
      citations: {
        type: 'array',
        description: 'Array of citations to check for duplicates',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            authors: { type: 'array', items: { type: 'string' } },
            year: { type: 'number' },
            journal: { type: 'string' },
            doi: { type: 'string' },
            pmid: { type: 'string' },
            pmcid: { type: 'string' },
            database: { type: 'string' }
          },
          required: ['id', 'title', 'authors', 'year', 'database']
        }
      },
      min_confidence: {
        type: 'number',
        description: 'Minimum confidence threshold for duplicate detection (0-1, default: 0.5)',
        default: 0.5
      },
      check_identifiers: {
        type: 'boolean',
        description: 'Check DOI/PMID/PMCID for exact matches (default: true)',
        default: true
      },
      check_title: {
        type: 'boolean',
        description: 'Check title similarity (default: true)',
        default: true
      },
      check_authors: {
        type: 'boolean',
        description: 'Check author overlap (default: true)',
        default: true
      },
      check_year: {
        type: 'boolean',
        description: 'Check publication year match (default: true)',
        default: true
      }
    },
    required: ['citations']
  },
  handler: detectDuplicates
};
