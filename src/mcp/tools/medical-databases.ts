/**
 * Medical Database Tools
 * 
 * Tools for searching PubMed/MEDLINE and Europe PMC databases
 * 
 * Enhanced with:
 * - Retry logic for transient failures
 * - Caching for improved performance
 * - Input validation with Zod
 * - Structured logging
 * 
 * @version 4.1.0
 */

import https from 'https';
import { URLSearchParams } from 'url';
import dotenv from 'dotenv';
import { logger } from '../../common/logger.js';
import { withRetry } from '../../common/retry.js';
import { defaultCache, generateCacheKey } from '../../common/cache.js';
import { DatabaseSchemas, validateSafe } from '../../common/validation.js';

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
 * Make HTTPS request helper with retry logic
 */
async function httpsRequest(url: string): Promise<string> {
  return withRetry(
    () => new Promise<string>((resolve, reject) => {
      const startTime = Date.now();
      
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => data += chunk);
        
        res.on('end', () => {
          const duration = Date.now() - startTime;
          logger.debug('HTTPS request completed', { 
            url: url.substring(0, 100), 
            duration,
            statusCode: res.statusCode 
          });
          resolve(data);
        });
      }).on('error', (error) => {
        logger.error('HTTPS request failed', { 
          url: url.substring(0, 100), 
          error: error.message 
        });
        reject(error);
      });
    }),
    { maxRetries: 3, initialDelay: 1000 }
  );
}

/**
 * Search PubMed/MEDLINE database
 * Enhanced with validation, caching, retry logic, and logging
 */
export async function searchPubMed(args: PubMedSearchArgs) {
  const startTime = Date.now();
  
  // Validate inputs with Zod
  const validation = validateSafe(DatabaseSchemas.pubmedSearch, args);
  if (!validation.success) {
    logger.warn('PubMed search validation failed', { error: validation.error });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: validation.error,
        }, null, 2),
      }],
      isError: true,
    };
  }
  
  const { query, max_results = 100, sort = 'relevance', filters = {} } = validation.data;
  
  // Generate cache key
  const cacheKey = generateCacheKey('pubmed', { query, max_results, sort, filters });
  
  // Try cache first
  const cached = defaultCache.get(cacheKey);
  if (cached) {
    logger.info('PubMed search cache hit', { query: query.substring(0, 50), cacheKey });
    return cached as any;
  }
  
  logger.info('PubMed search started', { query: query.substring(0, 50), max_results });

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

    const response = {
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
    
    // Cache the response (5 minutes TTL)
    defaultCache.set(cacheKey, response, 300);
    
    const duration = Date.now() - startTime;
    logger.info('PubMed search completed', { 
      query: query.substring(0, 50),
      count: totalCount,
      retrieved: results.length,
      duration,
      cached: true
    });
    
    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('PubMed search failed', { 
      query: query.substring(0, 50),
      error: errorMessage,
      duration
    });
    
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
 * Enhanced with validation, caching, retry logic, and logging
 */
export async function searchEuropePMC(args: EuropePMCSearchArgs) {
  const startTime = Date.now();
  
  // Validate inputs with Zod
  const validation = validateSafe(DatabaseSchemas.europePmcSearch, args);
  if (!validation.success) {
    logger.warn('Europe PMC search validation failed', { error: validation.error });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: validation.error,
        }, null, 2),
      }],
      isError: true,
    };
  }
  
  const { query, max_results = 100, include_preprints = true } = validation.data;
  
  // Generate cache key
  const cacheKey = generateCacheKey('europepmc', { query, max_results, include_preprints });
  
  // Try cache first
  const cached = defaultCache.get(cacheKey);
  if (cached) {
    logger.info('Europe PMC search cache hit', { query: query.substring(0, 50), cacheKey });
    return cached as any;
  }
  
  logger.info('Europe PMC search started', { query: query.substring(0, 50), max_results });

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

    const response = {
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
    
    // Cache the response (5 minutes TTL)
    defaultCache.set(cacheKey, response, 300);
    
    const duration = Date.now() - startTime;
    logger.info('Europe PMC search completed', { 
      query: query.substring(0, 50),
      count: totalCount,
      retrieved: results.length,
      duration,
      cached: true
    });
    
    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Europe PMC search failed', { 
      query: query.substring(0, 50),
      error: errorMessage,
      duration
    });
    
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
