/**
 * Medical Database Tools
 * 
 * Tools for searching PubMed/MEDLINE and Europe PMC databases
 */

import https from 'https';
import { URLSearchParams } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface PubMedSearchArgs {
  query: string;
  max_results?: number;
  sort?: 'relevance' | 'date' | 'author';
  filters?: {
    date_from?: string;
    date_to?: string;
    article_types?: string[];
    languages?: string[];
  };
}

interface EuropePMCSearchArgs {
  query: string;
  max_results?: number;
  include_preprints?: boolean;
}

interface SearchResult {
  pmid?: string;
  doi?: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  abstract?: string;
  article_type?: string;
  url: string;
}

/**
 * Make HTTPS request helper
 */
function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Search PubMed/MEDLINE database
 */
export async function searchPubMed(args: PubMedSearchArgs) {
  const { query, max_results = 100, sort = 'relevance', filters = {} } = args;

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
    // Build search query with filters
    let fullQuery = query;

    if (filters.date_from || filters.date_to) {
      const dateFrom = filters.date_from || '1900/01/01';
      const dateTo = filters.date_to || new Date().toISOString().split('T')[0].replace(/-/g, '/');
      fullQuery += ` AND ${dateFrom}:${dateTo}[dp]`;
    }

    if (filters.article_types && filters.article_types.length > 0) {
      const types = filters.article_types.map(t => `${t}[pt]`).join(' OR ');
      fullQuery += ` AND (${types})`;
    }

    if (filters.languages && filters.languages.length > 0) {
      const langs = filters.languages.map(l => `${l}[la]`).join(' OR ');
      fullQuery += ` AND (${langs})`;
    }

    // Step 1: Search PubMed to get PMIDs
    const searchParams = new URLSearchParams({
      db: 'pubmed',
      term: fullQuery,
      retmax: String(max_results),
      retmode: 'json',
      sort: sort === 'date' ? 'pub_date' : sort === 'author' ? 'author' : 'relevance',
    });

    // Add API key if available (increases rate limit from 3 to 10 req/sec)
    if (process.env.PUBMED_API_KEY) {
      searchParams.append('api_key', process.env.PUBMED_API_KEY);
    }

    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`;
    const searchData = await httpsRequest(searchUrl);
    const searchResult = JSON.parse(searchData);

    if (!searchResult.esearchresult || !searchResult.esearchresult.idlist) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'No results found',
            query: fullQuery,
            count: 0,
            results: [],
          }, null, 2),
        }],
      };
    }

    const pmids = searchResult.esearchresult.idlist;
    const totalCount = parseInt(searchResult.esearchresult.count);

    if (pmids.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            query: fullQuery,
            count: 0,
            results: [],
          }, null, 2),
        }],
      };
    }

    // Step 2: Fetch details for PMIDs
    const fetchParams = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml',
    });

    // Add API key if available
    if (process.env.PUBMED_API_KEY) {
      fetchParams.append('api_key', process.env.PUBMED_API_KEY);
    }

    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${fetchParams}`;
    const fetchData = await httpsRequest(fetchUrl);

    // Parse XML (basic parsing - in production use proper XML parser)
    const results: SearchResult[] = [];
    const articles = fetchData.split('<PubmedArticle>').slice(1);

    for (const article of articles.slice(0, max_results)) {
      const pmidMatch = article.match(/<PMID[^>]*>(\d+)<\/PMID>/);
      const titleMatch = article.match(/<ArticleTitle>([^<]+)<\/ArticleTitle>/);
      const journalMatch = article.match(/<Title>([^<]+)<\/Title>/);
      const yearMatch = article.match(/<PubDate>.*?<Year>(\d{4})<\/Year>/);
      const abstractMatch = article.match(/<AbstractText[^>]*>([^<]+)<\/AbstractText>/);
      const doiMatch = article.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/);

      // Extract authors
      const authors: string[] = [];
      const authorMatches = article.matchAll(/<Author[^>]*>.*?<LastName>([^<]+)<\/LastName>.*?<ForeName>([^<]+)<\/ForeName>.*?<\/Author>/gs);
      for (const match of authorMatches) {
        authors.push(`${match[2]} ${match[1]}`);
      }

      if (pmidMatch && titleMatch) {
        results.push({
          pmid: pmidMatch[1],
          doi: doiMatch ? doiMatch[1] : undefined,
          title: titleMatch[1],
          authors: authors.length > 0 ? authors : ['Unknown'],
          journal: journalMatch ? journalMatch[1] : 'Unknown',
          year: yearMatch ? parseInt(yearMatch[1]) : 0,
          abstract: abstractMatch ? abstractMatch[1] : undefined,
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/`,
        });
      }
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          query: fullQuery,
          count: totalCount,
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
 * Search Europe PMC database
 */
export async function searchEuropePMC(args: EuropePMCSearchArgs) {
  const { query, max_results = 100, include_preprints = true } = args;

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
    // Build search query
    let fullQuery = query;
    
    if (!include_preprints) {
      fullQuery += ' NOT (SRC:PPR)'; // Exclude preprints
    }

    // Europe PMC REST API
    const searchParams = new URLSearchParams({
      query: fullQuery,
      format: 'json',
      pageSize: String(Math.min(max_results, 1000)),
      resultType: 'core',
    });

    const searchUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?${searchParams}`;
    const searchData = await httpsRequest(searchUrl);
    const searchResult = JSON.parse(searchData);

    if (!searchResult.resultList || !searchResult.resultList.result) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'No results found',
            query: fullQuery,
            count: 0,
            results: [],
          }, null, 2),
        }],
      };
    }

    const articles = searchResult.resultList.result;
    const totalCount = parseInt(searchResult.hitCount);

    const results: SearchResult[] = articles.map((article: any) => ({
      pmid: article.pmid,
      doi: article.doi,
      title: article.title,
      authors: article.authorString ? article.authorString.split(', ') : ['Unknown'],
      journal: article.journalTitle || article.bookTitle || 'Unknown',
      year: article.pubYear ? parseInt(article.pubYear) : 0,
      abstract: article.abstractText,
      article_type: article.pubType,
      url: `https://europepmc.org/article/${article.source}/${article.id}`,
    }));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          query: fullQuery,
          count: totalCount,
          retrieved: results.length,
          includes_preprints: include_preprints,
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
