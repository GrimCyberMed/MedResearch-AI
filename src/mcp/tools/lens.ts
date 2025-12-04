/**
 * The Lens Integration Tool
 * 
 * Tool for searching The Lens's 250M+ scholarly works + patents + clinical trials
 * API Documentation: https://docs.api.lens.org/
 */

import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface LensSearchArgs {
  query: string;
  max_results?: number;
  year_from?: number;
  year_to?: number;
  include_patents?: boolean;
  open_access_only?: boolean;
  source_types?: ('journal' | 'conference' | 'book' | 'preprint' | 'other')[];
}

interface LensResult {
  lens_id: string;
  title: string;
  authors: Array<{
    first_name?: string;
    last_name?: string;
    display_name: string;
  }>;
  year_published?: number;
  source?: {
    title?: string;
    type?: string;
    publisher?: string;
  };
  abstract?: string;
  external_ids?: {
    doi?: string;
    pmid?: string;
    pmcid?: string;
  };
  is_open_access?: boolean;
  open_access_url?: string;
  citation_count?: number;
  scholarly_citations?: number;
  patent_citations?: number;
  fields_of_study?: string[];
  url: string;
}

/**
 * Make HTTPS POST request with JSON body
 */
function httpsPostRequest(
  hostname: string,
  path: string,
  body: any,
  headers: Record<string, string>
): Promise<string> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);

    const options = {
      hostname,
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 429) {
          reject(new Error('Rate limit exceeded. Free tier: 50 requests/minute, 10,000/month.'));
        } else if (res.statusCode === 401) {
          reject(new Error('Invalid API key. Check your LENS_API_KEY in .env file.'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Search The Lens database
 */
export async function searchLens(args: LensSearchArgs) {
  const {
    query,
    max_results = 100,
    year_from,
    year_to,
    include_patents = false,
    open_access_only = false,
    source_types = [],
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

  if (max_results < 1 || max_results > 1000) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'max_results must be between 1 and 1000',
        }, null, 2),
      }],
      isError: true,
    };
  }

  // Check for API key
  const apiKey = process.env.LENS_API_KEY;
  if (!apiKey) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'The Lens API key not found',
          note: 'Please set LENS_API_KEY in .env file',
          get_key_at: 'https://www.lens.org/lens/user/subscriptions',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    // Build query object using proper Elasticsearch syntax
    const mustClauses: any[] = [
      {
        query_string: {
          query: query,
        },
      },
    ];

    // Add filters
    if (year_from || year_to) {
      mustClauses.push({
        range: {
          year_published: {
            gte: year_from || 1900,
            lte: year_to || new Date().getFullYear(),
          },
        },
      });
    }

    if (open_access_only) {
      mustClauses.push({
        term: {
          is_open_access: true,
        },
      });
    }

    if (source_types.length > 0) {
      mustClauses.push({
        terms: {
          'source.type': source_types,
        },
      });
    }

    if (!include_patents) {
      // Exclude patents (search only scholarly works)
      mustClauses.push({
        term: {
          has_patent: false,
        },
      });
    }

    // Build request body with proper Elasticsearch query structure
    const requestBody = {
      query: {
        bool: {
          must: mustClauses,
        },
      },
      size: Math.min(max_results, 100), // API max is 100 per request
      include: [
        'lens_id',
        'title',
        'authors',
        'year_published',
        'source',
        'abstract',
        'external_ids',
        'is_open_access',
        'open_access',
        'scholarly_citations_count',
        'patent_citations_count',
        'fields_of_study',
      ],
    };

    // Make API request
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
    };

    const responseData = await httpsPostRequest(
      'api.lens.org',
      '/scholarly/search',
      requestBody,
      headers
    );

    const response = JSON.parse(responseData);

    if (!response.data || response.data.length === 0) {
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

    const results: LensResult[] = response.data.map((item: any) => ({
      lens_id: item.lens_id,
      title: item.title,
      authors: item.authors?.map((author: any) => ({
        first_name: author.first_name,
        last_name: author.last_name,
        display_name: author.display_name || `${author.first_name || ''} ${author.last_name || ''}`.trim(),
      })) || [],
      year_published: item.year_published,
      source: item.source ? {
        title: item.source.title,
        type: item.source.type,
        publisher: item.source.publisher,
      } : undefined,
      abstract: item.abstract,
      external_ids: item.external_ids ? {
        doi: item.external_ids.doi,
        pmid: item.external_ids.pmid,
        pmcid: item.external_ids.pmcid,
      } : undefined,
      is_open_access: item.is_open_access,
      open_access_url: item.open_access?.url,
      citation_count: (item.scholarly_citations_count || 0) + (item.patent_citations_count || 0),
      scholarly_citations: item.scholarly_citations_count,
      patent_citations: item.patent_citations_count,
      fields_of_study: item.fields_of_study,
      url: `https://www.lens.org/lens/scholar/article/${item.lens_id}`,
    }));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          query,
          count: response.total || results.length,
          retrieved: results.length,
          rate_limit_note: 'Free tier: 50 requests/minute, 10,000/month',
          includes_patents: include_patents,
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
          note: 'Rate limit: 50 requests/minute (free tier). If you hit the limit, wait 1 minute and retry.',
        }, null, 2),
      }],
      isError: true,
    };
  }
}

/**
 * Get scholarly work details by Lens ID
 */
export async function getLensWork(args: { lens_id: string }) {
  const { lens_id } = args;

  if (!lens_id || lens_id.trim() === '') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'lens_id is required',
        }, null, 2),
      }],
      isError: true,
    };
  }

  const apiKey = process.env.LENS_API_KEY;
  if (!apiKey) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'The Lens API key not found',
          note: 'Please set LENS_API_KEY in .env file',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    const requestBody = {
      query: {
        bool: {
          must: [
            {
              term: {
                lens_id: lens_id,
              },
            },
          ],
        },
      },
      size: 1,
      include: [
        'lens_id',
        'title',
        'authors',
        'year_published',
        'source',
        'abstract',
        'external_ids',
        'is_open_access',
        'open_access',
        'scholarly_citations_count',
        'patent_citations_count',
        'fields_of_study',
        'references',
        'citations',
      ],
    };

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
    };

    const responseData = await httpsPostRequest(
      'api.lens.org',
      '/scholarly/search',
      requestBody,
      headers
    );

    const response = JSON.parse(responseData);

    if (!response.data || response.data.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Work not found',
            lens_id,
          }, null, 2),
        }],
        isError: true,
      };
    }

    const work = response.data[0];

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          work: {
            lens_id: work.lens_id,
            title: work.title,
            authors: work.authors,
            year_published: work.year_published,
            source: work.source,
            abstract: work.abstract,
            external_ids: work.external_ids,
            is_open_access: work.is_open_access,
            open_access_url: work.open_access?.url,
            citation_count: (work.scholarly_citations_count || 0) + (work.patent_citations_count || 0),
            scholarly_citations: work.scholarly_citations_count,
            patent_citations: work.patent_citations_count,
            fields_of_study: work.fields_of_study,
            reference_count: work.references?.length || 0,
            cited_by_count: work.citations?.length || 0,
            url: `https://www.lens.org/lens/scholar/article/${work.lens_id}`,
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
          lens_id,
        }, null, 2),
      }],
      isError: true,
    };
  }
}
