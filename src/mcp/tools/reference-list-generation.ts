/**
 * Reference List Generation Tool
 * 
 * Auto-generates formatted reference lists from citation databases with sorting,
 * duplicate removal, and style-specific formatting.
 * 
 * @module reference-list-generation
 * @version 1.0.0
 * @since 5.1.0
 */

import { logger } from '../../common/logger.js';
import { CitationMetadata, formatCitations } from './citation-formatting.js';

/**
 * Reference list generation input
 */
export interface GenerateReferencesInput {
  citations: Array<{ id: string; metadata: CitationMetadata }>;
  style: 'apa' | 'vancouver' | 'harvard' | 'ama' | 'chicago' | 'mla' | 'nature' | 'science' | 'nejm' | 'jama';
  sort_order?: 'alphabetical' | 'citation_order' | 'chronological';
  remove_duplicates?: boolean;
  include_doi?: boolean;
  numbering?: 'none' | 'numeric' | 'bracketed';
}

/**
 * Reference list generation output
 */
export interface GenerateReferencesOutput {
  success: boolean;
  reference_list: string;
  total_references: number;
  duplicates_removed: number;
  style: string;
  processing_time_ms: number;
}

/**
 * Detect duplicate citations
 */
function detectDuplicates(citations: Array<{ id: string; metadata: CitationMetadata }>): string[] {
  const duplicateIds: string[] = [];
  const seen = new Map<string, string>();

  for (const citation of citations) {
    const { id, metadata } = citation;
    
    // Create a normalized key for comparison
    const key = `${metadata.title.toLowerCase().trim()}_${metadata.year}_${metadata.authors[0]?.toLowerCase().trim()}`;
    
    if (seen.has(key)) {
      duplicateIds.push(id);
    } else {
      seen.set(key, id);
    }
  }

  return duplicateIds;
}

/**
 * Remove duplicate citations
 */
function removeDuplicates(citations: Array<{ id: string; metadata: CitationMetadata }>): {
  unique: Array<{ id: string; metadata: CitationMetadata }>;
  removed: number;
} {
  const duplicateIds = new Set(detectDuplicates(citations));
  const unique = citations.filter(c => !duplicateIds.has(c.id));
  
  return {
    unique,
    removed: duplicateIds.size
  };
}

/**
 * Sort citations
 */
function sortCitations(
  citations: Array<{ id: string; metadata: CitationMetadata }>,
  sortOrder: 'alphabetical' | 'citation_order' | 'chronological'
): Array<{ id: string; metadata: CitationMetadata }> {
  const sorted = [...citations];

  switch (sortOrder) {
    case 'alphabetical':
      sorted.sort((a, b) => {
        const lastNameA = a.metadata.authors[0]?.split(' ').pop()?.toLowerCase() || '';
        const lastNameB = b.metadata.authors[0]?.split(' ').pop()?.toLowerCase() || '';
        return lastNameA.localeCompare(lastNameB);
      });
      break;

    case 'chronological':
      sorted.sort((a, b) => a.metadata.year - b.metadata.year);
      break;

    case 'citation_order':
      // Keep original order
      break;
  }

  return sorted;
}

/**
 * Format reference list with numbering
 */
function formatReferenceList(
  formattedCitations: Array<{ id: string; formatted: string }>,
  numbering: 'none' | 'numeric' | 'bracketed'
): string {
  return formattedCitations
    .map((citation, index) => {
      const number = index + 1;
      
      switch (numbering) {
        case 'numeric':
          return `${number}. ${citation.formatted}`;
        case 'bracketed':
          return `[${number}] ${citation.formatted}`;
        case 'none':
        default:
          return citation.formatted;
      }
    })
    .join('\n\n');
}

/**
 * Generate reference list
 */
export async function generateReferences(
  input: GenerateReferencesInput
): Promise<GenerateReferencesOutput> {
  const startTime = Date.now();

  try {
    logger.info(`Generating reference list for ${input.citations.length} citations`);

    // Validate input
    if (!input.citations || input.citations.length === 0) {
      throw new Error('Citations array is required and must not be empty');
    }

    let citations = [...input.citations];
    let duplicatesRemoved = 0;

    // Remove duplicates if requested
    if (input.remove_duplicates !== false) {
      const result = removeDuplicates(citations);
      citations = result.unique;
      duplicatesRemoved = result.removed;
      
      if (duplicatesRemoved > 0) {
        logger.info(`Removed ${duplicatesRemoved} duplicate citations`);
      }
    }

    // Sort citations
    const sortOrder = input.sort_order || 'alphabetical';
    citations = sortCitations(citations, sortOrder);

    // Format citations using the citation-formatting tool
    const formatResult = await formatCitations({
      citations,
      style: input.style,
      include_doi: input.include_doi,
      include_url: false
    });

    if (!formatResult.success) {
      throw new Error('Citation formatting failed');
    }

    // Format reference list with numbering
    const numbering = input.numbering || 'none';
    const referenceList = formatReferenceList(formatResult.formatted_citations, numbering);

    const processingTime = Date.now() - startTime;

    logger.info(`Reference list generated in ${processingTime}ms`);

    return {
      success: true,
      reference_list: referenceList,
      total_references: citations.length,
      duplicates_removed: duplicatesRemoved,
      style: input.style,
      processing_time_ms: processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Reference list generation failed', error);

    return {
      success: false,
      reference_list: '',
      total_references: 0,
      duplicates_removed: 0,
      style: input.style,
      processing_time_ms: processingTime
    };
  }
}

/**
 * MCP tool handler for generate_references
 */
export const generateReferencesTool = {
  name: 'generate_references',
  description: 'Auto-generate formatted reference lists with sorting, duplicate removal, and style-specific formatting',
  inputSchema: {
    type: 'object',
    properties: {
      citations: {
        type: 'array',
        description: 'Array of citations to include in reference list',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            metadata: {
              type: 'object',
              properties: {
                authors: { type: 'array', items: { type: 'string' } },
                title: { type: 'string' },
                journal: { type: 'string' },
                year: { type: 'number' },
                volume: { type: 'string' },
                issue: { type: 'string' },
                pages: { type: 'string' },
                doi: { type: 'string' },
                pmid: { type: 'string' }
              },
              required: ['authors', 'title', 'journal', 'year']
            }
          },
          required: ['id', 'metadata']
        }
      },
      style: {
        type: 'string',
        enum: ['apa', 'vancouver', 'harvard', 'ama', 'chicago', 'mla', 'nature', 'science', 'nejm', 'jama'],
        description: 'Citation style to use'
      },
      sort_order: {
        type: 'string',
        enum: ['alphabetical', 'citation_order', 'chronological'],
        description: 'Sort order for references (default: alphabetical)',
        default: 'alphabetical'
      },
      remove_duplicates: {
        type: 'boolean',
        description: 'Remove duplicate citations (default: true)',
        default: true
      },
      include_doi: {
        type: 'boolean',
        description: 'Include DOI in references (default: true)',
        default: true
      },
      numbering: {
        type: 'string',
        enum: ['none', 'numeric', 'bracketed'],
        description: 'Numbering style for references (default: none)',
        default: 'none'
      }
    },
    required: ['citations', 'style']
  },
  handler: generateReferences
};
