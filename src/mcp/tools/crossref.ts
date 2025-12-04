/**
 * CrossRef Integration Tool
 * 
 * Tool for searching CrossRef database (150M+ DOI metadata)
 * API Documentation: https://api.crossref.org/swagger-ui/index.html
 */

import https from 'https';
import { URLSearchParams } from 'url';

interface CrossRefSearchArgs {
  query: string;
  max_results?: number;
  year_from?: number;
  year_to?: number;
  type?: ('journal-article' | 'book-chapter' | 'proceedings-article' | 'dataset' | 'preprint')[];
  has_full_text?: boolean;
  has_abstract?: boolean;
}

interface CrossRefResult {
  doi: string;
  title: string;
  authors: Array<{
    given?: string;
    family?: string;
    name: string;
  }>;
  published_date?: {
    year?: number;
    month?: number;
    day?: number;
  };
  container_title?: string; // Journal name
  publisher?: string;
  type?: string;
  abstract?: string;
  is_referenced_by_count?: number; // Citation count
  references_count?: number;
  issn?: string[];
  isbn?: string[];
  url: string;
}

/**
 * Make HTTPS request helper
 */
function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'MedResearch-AI/4.0 (mailto:contact@medresearch-ai.org)',
      },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Search CrossRef database
 */
export async function searchCrossRef(args: CrossRefSearchArgs) {
  const {
    query,
    max_results = 100,
    year_from,
    year_to,
    type = [],
    has_full_text = false,
    has_abstract = false,
  } = args;

  // Validate inputs
  if (!query || query.trim() === '') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'Search query cannot be empty',
        }, null, 2),
      }],
      isError: true,
    };
  }

  if (max_results < 1 || max_results > 10000) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'max_results must be between 1 and 10000',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    // Build query parameters
    const params: any = {
      query: query,
      rows: Math.min(max_results, 1000),
    };

    // Add filters
    const filters: string[] = [];

    if (year_from || year_to) {
      const from = year_from || 1900;
      const to = year_to || new Date().getFullYear();
      filters.push(`from-pub-date:${from}`, `until-pub-date:${to}`);
    }

    if (type.length > 0) {
      filters.push(`type:${type.join(',')}`);
    }

    if (has_full_text) {
      filters.push('has-full-text:true');
    }

    if (has_abstract) {
      filters.push('has-abstract:true');
    }

    if (filters.length > 0) {
      params.filter = filters.join(',');
    }

    const searchParams = new URLSearchParams(params);
    const searchUrl = `https://api.crossref.org/works?${searchParams}`;

    const searchData = await httpsRequest(searchUrl);
    const searchResult = JSON.parse(searchData);

    if (!searchResult.message || !searchResult.message.items || searchResult.message.items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            query,
            count: 0,
            retrieved: 0,
            results: [],
          }, null, 2),
        }],
      };
    }

    const items = searchResult.message.items;
    const totalResults = searchResult.message['total-results'];

    const results: CrossRefResult[] = items.map((item: any) => {
      // Parse authors
      const authors = (item.author || []).map((author: any) => ({
        given: author.given,
        family: author.family,
        name: `${author.given || ''} ${author.family || ''}`.trim() || 'Unknown',
      }));

      // Parse publication date
      const pubDate = item.published || item['published-print'] || item['published-online'];
      const published_date = pubDate ? {
        year: pubDate['date-parts']?.[0]?.[0],
        month: pubDate['date-parts']?.[0]?.[1],
        day: pubDate['date-parts']?.[0]?.[2],
      } : undefined;

      return {
        doi: item.DOI,
        title: item.title?.[0] || 'Untitled',
        authors,
        published_date,
        container_title: item['container-title']?.[0],
        publisher: item.publisher,
        type: item.type,
        abstract: item.abstract,
        is_referenced_by_count: item['is-referenced-by-count'],
        references_count: item['references-count'],
        issn: item.ISSN,
        isbn: item.ISBN,
        url: `https://doi.org/${item.DOI}`,
      };
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          query,
          count: totalResults,
          retrieved: results.length,
          results,
        }, null, 2),
      }],
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          query,
        }, null, 2),
      }],
      isError: true,
    };
  }
}

/**
 * Get work details by DOI
 */
export async function getCrossRefWork(args: { doi: string }) {
  const { doi } = args;

  if (!doi || doi.trim() === '') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'DOI is required',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    // Clean DOI (remove URL prefix if present)
    const cleanDOI = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '');

    const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDOI)}`;
    const data = await httpsRequest(url);
    const result = JSON.parse(data);

    if (!result.message) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Work not found',
            doi: cleanDOI,
          }, null, 2),
        }],
        isError: true,
      };
    }

    const item = result.message;

    // Parse authors
    const authors = (item.author || []).map((author: any) => ({
      given: author.given,
      family: author.family,
      name: `${author.given || ''} ${author.family || ''}`.trim() || 'Unknown',
      orcid: author.ORCID,
      affiliation: author.affiliation,
    }));

    // Parse publication date
    const pubDate = item.published || item['published-print'] || item['published-online'];
    const published_date = pubDate ? {
      year: pubDate['date-parts']?.[0]?.[0],
      month: pubDate['date-parts']?.[0]?.[1],
      day: pubDate['date-parts']?.[0]?.[2],
    } : undefined;

    // Parse references
    const references = (item.reference || []).slice(0, 10).map((ref: any) => ({
      doi: ref.DOI,
      title: ref['article-title'],
      author: ref.author,
      year: ref.year,
    }));

    const work = {
      doi: item.DOI,
      title: item.title?.[0],
      subtitle: item.subtitle?.[0],
      authors,
      published_date,
      container_title: item['container-title']?.[0],
      publisher: item.publisher,
      type: item.type,
      abstract: item.abstract,
      is_referenced_by_count: item['is-referenced-by-count'],
      references_count: item['references-count'],
      references: references,
      issn: item.ISSN,
      isbn: item.ISBN,
      volume: item.volume,
      issue: item.issue,
      page: item.page,
      license: item.license,
      funder: item.funder,
      clinical_trial_number: item['clinical-trial-number'],
      url: `https://doi.org/${item.DOI}`,
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          work,
        }, null, 2),
      }],
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          doi,
        }, null, 2),
      }],
      isError: true,
    };
  }
}
