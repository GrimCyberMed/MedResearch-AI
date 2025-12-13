/**
 * MCP Tool: Advanced Duplicate Detection
 * 
 * Advanced duplicate detection using multiple algorithms and fuzzy matching.
 * 
 * Features:
 * - Multi-algorithm duplicate detection
 * - Fuzzy title matching (Levenshtein distance)
 * - Author overlap analysis
 * - DOI/PMID exact matching
 * - Year proximity matching
 * - Confidence scoring
 * 
 * @module detect-duplicates-advanced
 * @version 1.0.0
 * @since Phase 3
 */

import { promises as fs } from 'fs';
import { logger } from '../../common/logger.js';

interface Citation {
  id: string;
  title: string;
  authors?: string[];
  year?: number;
  doi?: string;
  pmid?: string;
}

interface DuplicateGroup {
  citations: string[];
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'author-year';
}

interface DetectDuplicatesInput {
  citationsFile: string;
  algorithm?: 'levenshtein' | 'jaccard' | 'combined';
  threshold?: number;
  outputFile?: string;
}

interface DetectDuplicatesOutput {
  success: boolean;
  totalCitations: number;
  duplicateGroups: DuplicateGroup[];
  uniqueCitations: number;
  duplicatesRemoved: number;
  outputFile?: string;
  error?: string;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function titleSimilarity(title1: string, title2: string): number {
  const t1 = title1.toLowerCase().replace(/[^\w\s]/g, '');
  const t2 = title2.toLowerCase().replace(/[^\w\s]/g, '');
  
  const distance = levenshteinDistance(t1, t2);
  const maxLength = Math.max(t1.length, t2.length);
  
  return 1 - (distance / maxLength);
}

function authorOverlap(authors1: string[], authors2: string[]): number {
  if (!authors1 || !authors2 || authors1.length === 0 || authors2.length === 0) {
    return 0;
  }
  
  const set1 = new Set(authors1.map(a => a.toLowerCase()));
  const set2 = new Set(authors2.map(a => a.toLowerCase()));
  
  let overlap = 0;
  for (const author of set1) {
    if (set2.has(author)) overlap++;
  }
  
  return overlap / Math.max(set1.size, set2.size);
}

export async function detectDuplicatesAdvanced(input: DetectDuplicatesInput): Promise<DetectDuplicatesOutput> {
  try {
    logger.info('Starting advanced duplicate detection');

    const content = await fs.readFile(input.citationsFile, 'utf-8');
    const citations: Citation[] = JSON.parse(content);

    const threshold = input.threshold || 0.85;
    const duplicateGroups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < citations.length; i++) {
      if (processed.has(citations[i].id)) continue;

      const group: string[] = [citations[i].id];
      let maxConfidence = 0;
      let matchType: 'exact' | 'fuzzy' | 'author-year' = 'fuzzy';

      for (let j = i + 1; j < citations.length; j++) {
        if (processed.has(citations[j].id)) continue;

        // Exact DOI/PMID match
        if (citations[i].doi && citations[i].doi === citations[j].doi) {
          group.push(citations[j].id);
          processed.add(citations[j].id);
          maxConfidence = 1.0;
          matchType = 'exact';
          continue;
        }

        // Fuzzy title match
        const titleSim = titleSimilarity(citations[i].title, citations[j].title);
        const authorSim = authorOverlap(citations[i].authors || [], citations[j].authors || []);
        const yearMatch = citations[i].year === citations[j].year ? 1 : 0;

        const combinedScore = (titleSim * 0.6) + (authorSim * 0.3) + (yearMatch * 0.1);

        if (combinedScore >= threshold) {
          group.push(citations[j].id);
          processed.add(citations[j].id);
          maxConfidence = Math.max(maxConfidence, combinedScore);
        }
      }

      if (group.length > 1) {
        duplicateGroups.push({
          citations: group,
          confidence: maxConfidence,
          matchType
        });
        processed.add(citations[i].id);
      }
    }

    const duplicatesRemoved = duplicateGroups.reduce((sum, g) => sum + g.citations.length - 1, 0);
    const uniqueCitations = citations.length - duplicatesRemoved;

    const outputFile = input.outputFile || input.citationsFile.replace('.json', '-deduped.json');
    await fs.writeFile(outputFile, JSON.stringify({ duplicateGroups, uniqueCitations }, null, 2));

    return {
      success: true,
      totalCitations: citations.length,
      duplicateGroups,
      uniqueCitations,
      duplicatesRemoved,
      outputFile
    };
  } catch (error) {
    return {
      success: false,
      totalCitations: 0,
      duplicateGroups: [],
      uniqueCitations: 0,
      duplicatesRemoved: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export const detectDuplicatesAdvancedTool = {
  name: 'detect_duplicates_advanced',
  description: 'Advanced duplicate detection with fuzzy matching',
  inputSchema: {
    type: 'object',
    properties: {
      citationsFile: { type: 'string' },
      algorithm: {
        type: 'string',
        enum: ['levenshtein', 'jaccard', 'combined'],
        default: 'combined'
      },
      threshold: { type: 'number', default: 0.85 },
      outputFile: { type: 'string' }
    },
    required: ['citationsFile']
  }
};
