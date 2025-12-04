/**
 * Semantic Scholar Integration Tool
 * 
 * Tool for searching Semantic Scholar's 200M+ paper database
 * API Documentation: https://api.semanticscholar.org/api-docs/
 */

import https from 'https';
import { URLSearchParams } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface SemanticScholarSearchArgs {
  query: string;
  max_results?: number;
  year_from?: number;
  year_to?: number;
  fields_of_study?: string[];
  publication_types?: string[];
  open_access_only?: boolean;
}

interface SemanticScholarResult {
  paperId: string;
  externalIds?: {
    DOI?: string;
    PubMed?: string;
    ArXiv?: string;
  };
  title: string;
  authors: Array<{
    authorId?: string;
    name: string;
  }>;
  year?: number;
  venue?: string;
  abstract?: string;
  citationCount?: number;
  influentialCitationCount?: number;
  isOpenAccess?: boolean;
  openAccessPdf?: {
    url: string;
    status: string;
  };
  fieldsOfStudy?: string[];
  publicationTypes?: string[];
  url: string;
}

/**
 * Make HTTPS request with headers
 */
function httpsRequest(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'MedResearch-AI/4.0',
        ...headers,
      },
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 429) {
          reject(new Error('Rate limit exceeded. Semantic Scholar allows 1 request/second.'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Search Semantic Scholar database
 */
export async function searchSemanticScholar(args: SemanticScholarSearchArgs) {
  const {
    query,
    max_results = 100,
    year_from,
    year_to,
    fields_of_study = [],
    publication_types = [],
    open_access_only = false,
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

  // Check for API key
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  if (!apiKey) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'Semantic Scholar API key not found',
          note: 'Please set SEMANTIC_SCHOLAR_API_KEY in .env file',
          get_key_at: 'https://www.semanticscholar.org/product/api',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    // Build search query with filters
    let fullQuery = query;

    if (year_from || year_to) {
      const yearFrom = year_from || 1900;
      const yearTo = year_to || new Date().getFullYear();
      fullQuery += ` year:${yearFrom}-${yearTo}`;
    }

    if (fields_of_study.length > 0) {
      fullQuery += ` fieldsOfStudy:${fields_of_study.join(',')}`;
    }

    if (publication_types.length > 0) {
      fullQuery += ` publicationTypes:${publication_types.join(',')}`;
    }

    if (open_access_only) {
      fullQuery += ' isOpenAccess:true';
    }

    // Semantic Scholar API parameters
    const searchParams = new URLSearchParams({
      query: fullQuery,
      limit: String(Math.min(max_results, 100)), // API max is 100 per request
      fields: 'paperId,externalIds,title,authors,year,venue,abstract,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,publicationTypes,url',
    });

    const searchUrl = `https://api.semanticscholar.org/graph/v1/paper/search?${searchParams}`;
    
    // Add API key to headers
    const headers = {
      'x-api-key': apiKey,
    };

    const searchData = await httpsRequest(searchUrl, headers);
    const searchResult = JSON.parse(searchData);

    if (!searchResult.data || searchResult.data.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            query: fullQuery,
            count: 0,
            retrieved: 0,
            results: [],
          }, null, 2),
        }],
      };
    }

    const results: SemanticScholarResult[] = searchResult.data.map((paper: any) => ({
      paperId: paper.paperId,
      externalIds: paper.externalIds,
      title: paper.title,
      authors: paper.authors || [],
      year: paper.year,
      venue: paper.venue,
      abstract: paper.abstract,
      citationCount: paper.citationCount,
      influentialCitationCount: paper.influentialCitationCount,
      isOpenAccess: paper.isOpenAccess,
      openAccessPdf: paper.openAccessPdf,
      fieldsOfStudy: paper.fieldsOfStudy,
      publicationTypes: paper.publicationTypes,
      url: `https://www.semanticscholar.org/paper/${paper.paperId}`,
    }));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          query: fullQuery,
          count: searchResult.total || results.length,
          retrieved: results.length,
          rate_limit_note: 'Semantic Scholar allows 1 request/second',
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
          note: 'Rate limit: 1 request/second. If you hit the limit, wait 1 second and retry.',
        }, null, 2),
      }],
      isError: true,
    };
  }
}

/**
 * Get paper details by ID (DOI, PMID, ArXiv, or Semantic Scholar ID)
 */
export async function getSemanticScholarPaper(args: { paper_id: string }) {
  const { paper_id } = args;

  if (!paper_id || paper_id.trim() === '') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'paper_id is required (DOI, PMID, ArXiv ID, or Semantic Scholar ID)',
        }, null, 2),
      }],
      isError: true,
    };
  }

  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  if (!apiKey) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'Semantic Scholar API key not found',
          note: 'Please set SEMANTIC_SCHOLAR_API_KEY in .env file',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    // Detect ID type and format URL
    let paperId = paper_id;
    
    // If it's a DOI, prefix with DOI:
    if (paper_id.includes('10.')) {
      paperId = `DOI:${paper_id.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')}`;
    }
    // If it's a PMID (all digits), prefix with PMID:
    else if (/^\d+$/.test(paper_id)) {
      paperId = `PMID:${paper_id}`;
    }
    // If it's an ArXiv ID, prefix with ArXiv:
    else if (/^\d{4}\.\d{4,5}(v\d+)?$/.test(paper_id)) {
      paperId = `ArXiv:${paper_id}`;
    }

    const searchParams = new URLSearchParams({
      fields: 'paperId,externalIds,title,authors,year,venue,abstract,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,publicationTypes,url,references,citations',
    });

    const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(paperId)}?${searchParams}`;
    
    const headers = {
      'x-api-key': apiKey,
    };

    const data = await httpsRequest(url, headers);
    const paper = JSON.parse(data);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          paper: {
            paperId: paper.paperId,
            externalIds: paper.externalIds,
            title: paper.title,
            authors: paper.authors,
            year: paper.year,
            venue: paper.venue,
            abstract: paper.abstract,
            citationCount: paper.citationCount,
            influentialCitationCount: paper.influentialCitationCount,
            isOpenAccess: paper.isOpenAccess,
            openAccessPdf: paper.openAccessPdf,
            fieldsOfStudy: paper.fieldsOfStudy,
            publicationTypes: paper.publicationTypes,
            url: paper.url,
            referenceCount: paper.references?.length || 0,
            citationCount_detailed: paper.citations?.length || 0,
          },
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
          paper_id,
        }, null, 2),
      }],
      isError: true,
    };
  }
}
