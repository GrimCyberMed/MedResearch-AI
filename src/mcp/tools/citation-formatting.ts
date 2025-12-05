/**
 * Citation Formatting Tool
 * 
 * Automated citation style conversion supporting APA, Vancouver, Harvard, AMA, and more.
 * Formats citations and generates in-text citations with batch processing support.
 * 
 * @module citation-formatting
 * @version 1.0.0
 * @since 5.1.0
 */

import { logger } from '../../common/logger.js';

/**
 * Citation metadata
 */
export interface CitationMetadata {
  authors: string[];
  title: string;
  journal: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  url?: string;
}

/**
 * Formatted citation result
 */
export interface FormattedCitation {
  id: string;
  formatted: string;
  in_text: string;
  style: string;
}

/**
 * Citation formatting input
 */
export interface FormatCitationsInput {
  citations: Array<{ id: string; metadata: CitationMetadata }>;
  style: 'apa' | 'vancouver' | 'harvard' | 'ama' | 'chicago' | 'mla' | 'nature' | 'science' | 'nejm' | 'jama';
  include_doi?: boolean;
  include_url?: boolean;
}

/**
 * Citation formatting output
 */
export interface FormatCitationsOutput {
  success: boolean;
  formatted_citations: FormattedCitation[];
  style: string;
  total_citations: number;
  processing_time_ms: number;
}

/**
 * Format authors for different styles
 */
function formatAuthors(authors: string[], style: string, maxAuthors: number = 6): string {
  if (authors.length === 0) return '';

  switch (style) {
    case 'apa':
      if (authors.length <= maxAuthors) {
        return authors.map((a, i) => {
          const parts = a.split(' ');
          const lastName = parts[parts.length - 1];
          const initials = parts.slice(0, -1).map(p => p[0]).join('. ');
          return i === authors.length - 1 && authors.length > 1
            ? `& ${lastName}, ${initials}.`
            : `${lastName}, ${initials}.`;
        }).join(', ');
      } else {
        const first = authors[0].split(' ');
        return `${first[first.length - 1]}, ${first.slice(0, -1).map(p => p[0]).join('. ')}., et al.`;
      }

    case 'vancouver':
    case 'ama':
    case 'nejm':
    case 'jama':
      return authors.slice(0, maxAuthors).map(a => {
        const parts = a.split(' ');
        const lastName = parts[parts.length - 1];
        const initials = parts.slice(0, -1).map(p => p[0]).join('');
        return `${lastName} ${initials}`;
      }).join(', ') + (authors.length > maxAuthors ? ', et al' : '');

    case 'harvard':
      if (authors.length === 1) {
        const parts = authors[0].split(' ');
        return `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}`;
      } else if (authors.length === 2) {
        return authors.map(a => {
          const parts = a.split(' ');
          return `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')}`;
        }).join(' and ');
      } else {
        const parts = authors[0].split(' ');
        return `${parts[parts.length - 1]}, ${parts.slice(0, -1).join(' ')} et al.`;
      }

    case 'nature':
    case 'science':
      return authors.slice(0, maxAuthors).map(a => {
        const parts = a.split(' ');
        const lastName = parts[parts.length - 1];
        const initials = parts.slice(0, -1).map(p => `${p[0]}.`).join(' ');
        return `${lastName}, ${initials}`;
      }).join(', ') + (authors.length > maxAuthors ? ' et al.' : '');

    default:
      return authors.join(', ');
  }
}

/**
 * Format citation in APA style
 */
function formatAPA(metadata: CitationMetadata, includeDoi: boolean, includeUrl: boolean): string {
  const authors = formatAuthors(metadata.authors, 'apa');
  const year = metadata.year;
  const title = metadata.title;
  const journal = metadata.journal;
  const volume = metadata.volume || '';
  const issue = metadata.issue ? `(${metadata.issue})` : '';
  const pages = metadata.pages || '';
  const doi = includeDoi && metadata.doi ? ` https://doi.org/${metadata.doi}` : '';
  const url = includeUrl && !doi && metadata.url ? ` ${metadata.url}` : '';

  return `${authors} (${year}). ${title}. ${journal}, ${volume}${issue}, ${pages}.${doi}${url}`.trim();
}

/**
 * Format citation in Vancouver style
 */
function formatVancouver(metadata: CitationMetadata, includeDoi: boolean): string {
  const authors = formatAuthors(metadata.authors, 'vancouver');
  const title = metadata.title;
  const journal = metadata.journal;
  const year = metadata.year;
  const volume = metadata.volume || '';
  const issue = metadata.issue ? `(${metadata.issue})` : '';
  const pages = metadata.pages || '';
  const doi = includeDoi && metadata.doi ? ` doi: ${metadata.doi}` : '';

  return `${authors}. ${title}. ${journal}. ${year};${volume}${issue}:${pages}.${doi}`.trim();
}

/**
 * Format citation in Harvard style
 */
function formatHarvard(metadata: CitationMetadata): string {
  const authors = formatAuthors(metadata.authors, 'harvard');
  const year = metadata.year;
  const title = metadata.title;
  const journal = metadata.journal;
  const volume = metadata.volume || '';
  const issue = metadata.issue ? `(${metadata.issue})` : '';
  const pages = metadata.pages ? `, pp. ${metadata.pages}` : '';

  return `${authors} (${year}) '${title}', ${journal}, ${volume}${issue}${pages}.`;
}

/**
 * Format citation in AMA style
 */
function formatAMA(metadata: CitationMetadata, includeDoi: boolean): string {
  const authors = formatAuthors(metadata.authors, 'ama', 6);
  const title = metadata.title;
  const journal = metadata.journal;
  const year = metadata.year;
  const volume = metadata.volume || '';
  const issue = metadata.issue ? `(${metadata.issue})` : '';
  const pages = metadata.pages || '';
  const doi = includeDoi && metadata.doi ? ` doi:${metadata.doi}` : '';

  return `${authors}. ${title}. ${journal}. ${year};${volume}${issue}:${pages}.${doi}`.trim();
}

/**
 * Format citation in Nature style
 */
function formatNature(metadata: CitationMetadata): string {
  const authors = formatAuthors(metadata.authors, 'nature', 5);
  const title = metadata.title;
  const journal = metadata.journal;
  const volume = metadata.volume || '';
  const pages = metadata.pages || '';
  const year = metadata.year;

  return `${authors} ${title}. ${journal} ${volume}, ${pages} (${year}).`;
}

/**
 * Format citation in Science style
 */
function formatScience(metadata: CitationMetadata): string {
  const authors = formatAuthors(metadata.authors, 'science', 5);
  const title = metadata.title;
  const journal = metadata.journal;
  const volume = metadata.volume || '';
  const pages = metadata.pages || '';
  const year = metadata.year;

  return `${authors}, ${title}. ${journal} ${volume}, ${pages} (${year}).`;
}

/**
 * Generate in-text citation
 */
function generateInText(metadata: CitationMetadata, style: string, citationNumber?: number): string {
  switch (style) {
    case 'apa':
    case 'harvard':
      if (metadata.authors.length === 1) {
        const lastName = metadata.authors[0].split(' ').pop();
        return `(${lastName}, ${metadata.year})`;
      } else if (metadata.authors.length === 2) {
        const last1 = metadata.authors[0].split(' ').pop();
        const last2 = metadata.authors[1].split(' ').pop();
        return `(${last1} & ${last2}, ${metadata.year})`;
      } else {
        const lastName = metadata.authors[0].split(' ').pop();
        return `(${lastName} et al., ${metadata.year})`;
      }

    case 'vancouver':
    case 'ama':
    case 'nature':
    case 'science':
    case 'nejm':
    case 'jama':
      return citationNumber ? `[${citationNumber}]` : '[?]';

    default:
      return `(${metadata.authors[0]?.split(' ').pop()}, ${metadata.year})`;
  }
}

/**
 * Format citations
 */
export async function formatCitations(
  input: FormatCitationsInput
): Promise<FormatCitationsOutput> {
  const startTime = Date.now();

  try {
    logger.info(`Formatting ${input.citations.length} citations in ${input.style} style`);

    // Validate input
    if (!input.citations || input.citations.length === 0) {
      throw new Error('Citations array is required and must not be empty');
    }

    const includeDoi = input.include_doi !== false;
    const includeUrl = input.include_url !== false;

    const formattedCitations: FormattedCitation[] = [];

    for (let i = 0; i < input.citations.length; i++) {
      const { id, metadata } = input.citations[i];
      let formatted = '';

      // Format based on style
      switch (input.style) {
        case 'apa':
          formatted = formatAPA(metadata, includeDoi, includeUrl);
          break;
        case 'vancouver':
          formatted = formatVancouver(metadata, includeDoi);
          break;
        case 'harvard':
          formatted = formatHarvard(metadata);
          break;
        case 'ama':
          formatted = formatAMA(metadata, includeDoi);
          break;
        case 'nature':
          formatted = formatNature(metadata);
          break;
        case 'science':
          formatted = formatScience(metadata);
          break;
        case 'nejm':
        case 'jama':
          formatted = formatVancouver(metadata, includeDoi); // Similar to Vancouver
          break;
        default:
          formatted = formatAPA(metadata, includeDoi, includeUrl);
      }

      const inText = generateInText(metadata, input.style, i + 1);

      formattedCitations.push({
        id,
        formatted,
        in_text: inText,
        style: input.style
      });
    }

    const processingTime = Date.now() - startTime;

    logger.info(`Citation formatting completed in ${processingTime}ms`);

    return {
      success: true,
      formatted_citations: formattedCitations,
      style: input.style,
      total_citations: input.citations.length,
      processing_time_ms: processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Citation formatting failed', error);

    return {
      success: false,
      formatted_citations: [],
      style: input.style,
      total_citations: 0,
      processing_time_ms: processingTime
    };
  }
}

/**
 * MCP tool handler for format_citations
 */
export const formatCitationsTool = {
  name: 'format_citations',
  description: 'Format citations in various styles (APA, Vancouver, Harvard, AMA, etc.) with in-text citation generation',
  inputSchema: {
    type: 'object',
    properties: {
      citations: {
        type: 'array',
        description: 'Array of citations to format',
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
                pmid: { type: 'string' },
                url: { type: 'string' }
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
      include_doi: {
        type: 'boolean',
        description: 'Include DOI in formatted citation (default: true)',
        default: true
      },
      include_url: {
        type: 'boolean',
        description: 'Include URL in formatted citation (default: true)',
        default: true
      }
    },
    required: ['citations', 'style']
  },
  handler: formatCitations
};
