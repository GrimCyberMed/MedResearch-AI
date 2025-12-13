/**
 * PubMed/MEDLINE API Integration - REAL IMPLEMENTATION
 * 
 * Integrates with NCBI E-utilities API for PubMed/MEDLINE searches.
 * Enables automated literature search and citation retrieval.
 * 
 * Reference: NCBI E-utilities API (https://www.ncbi.nlm.nih.gov/books/NBK25501/)
 * 
 * @version 6.1.0 - Real API Integration
 */

import { logger } from '../../common/logger.js';
import https from 'https';
import { XMLParser } from 'fast-xml-parser';

/**
 * PubMed search parameters
 */
export interface PubMedSearchParams {
  query: string;
  max_results?: number;
  start_date?: string;
  end_date?: string;
  publication_types?: string[];
  filters?: Record<string, string>;
  retstart?: number; // For pagination
}

/**
 * PubMed article
 */
export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  publication_date: string;
  abstract: string;
  doi?: string;
  publication_types: string[];
  mesh_terms: string[];
}

/**
 * PubMed search result
 */
export interface PubMedSearchResult {
  query: string;
  total_results: number;
  articles: PubMedArticle[];
  search_metadata: {
    search_date: string;
    database: string;
    api_version: string;
  };
  warnings: string[];
}

/**
 * E-utilities configuration
 */
const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const API_KEY = process.env.PUBMED_API_KEY || '';
const EMAIL = process.env.PUBMED_EMAIL || 'cybermedgrim@gmail.com';
const TOOL_NAME = 'MedResearch-AI';

// Rate limiting: 3/sec without key, 10/sec with key
const RATE_LIMIT_MS = API_KEY ? 100 : 334; // milliseconds between requests
let lastRequestTime = 0;

/**
 * Rate limiter - ensures we don't exceed API limits
 */
async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Make HTTPS request to E-utilities
 */
function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Search PubMed database using ESearch
 */
export async function searchPubMed(params: PubMedSearchParams): Promise<PubMedSearchResult> {
  logger.info('Searching PubMed database (REAL API)', {
    service: 'medresearch-ai',
    version: '6.1.0',
    query: params.query,
    max_results: params.max_results,
  });
  
  const maxResults = Math.min(params.max_results || 100, 10000);
  const retstart = params.retstart || 0;
  const warnings: string[] = [];
  
  // Validate parameters
  if (!params.query || params.query.trim().length === 0) {
    throw new Error('Empty query provided');
  }
  
  if (maxResults > 10000) {
    warnings.push('Max results capped at 10,000 per NCBI policy');
  }
  
  try {
    // Step 1: ESearch - Get PMIDs
    await rateLimit();
    
    let searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(params.query)}&retmode=json&retmax=${maxResults}&retstart=${retstart}&tool=${TOOL_NAME}&email=${EMAIL}`;
    
    if (API_KEY) {
      searchUrl += `&api_key=${API_KEY}`;
    }
    
    // Add date filters
    if (params.start_date || params.end_date) {
      const mindate = params.start_date || '1900/01/01';
      const maxdate = params.end_date || '3000/12/31';
      searchUrl += `&mindate=${mindate}&maxdate=${maxdate}&datetype=pdat`;
    }
    
    logger.debug('ESearch URL', { url: searchUrl.replace(API_KEY, 'REDACTED') });
    
    const searchData = await httpsRequest(searchUrl);
    const searchResult = JSON.parse(searchData);
    
    if (!searchResult.esearchresult) {
      throw new Error('Invalid ESearch response');
    }
    
    const pmids: string[] = searchResult.esearchresult.idlist || [];
    const totalResults = parseInt(searchResult.esearchresult.count || '0');
    
    logger.info('ESearch complete', {
      service: 'medresearch-ai',
      total_results: totalResults,
      pmids_returned: pmids.length,
    });
    
    if (pmids.length === 0) {
      return {
        query: params.query,
        total_results: 0,
        articles: [],
        search_metadata: {
          search_date: new Date().toISOString(),
          database: 'PubMed',
          api_version: 'E-utilities 2.0',
        },
        warnings: ['No results found'],
      };
    }
    
    // Step 2: EFetch - Get article details
    const articles = await batchFetchArticles(pmids);
    
    // Apply publication type filters (post-fetch)
    let filteredArticles = articles;
    if (params.publication_types && params.publication_types.length > 0) {
      filteredArticles = articles.filter(article =>
        article.publication_types.some(type =>
          params.publication_types!.some(filterType =>
            type.toLowerCase().includes(filterType.toLowerCase())
          )
        )
      );
    }
    
    const searchResultFinal: PubMedSearchResult = {
      query: params.query,
      total_results: totalResults,
      articles: filteredArticles,
      search_metadata: {
        search_date: new Date().toISOString(),
        database: 'PubMed',
        api_version: 'E-utilities 2.0',
      },
      warnings,
    };
    
    logger.info('PubMed search complete', {
      service: 'medresearch-ai',
      version: '6.1.0',
      total_results: totalResults,
      returned_results: filteredArticles.length,
    });
    
    return searchResultFinal;
    
  } catch (error) {
    logger.error('PubMed search failed', {
      service: 'medresearch-ai',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Fetch article by PMID using EFetch
 */
export async function fetchArticleByPMID(pmid: string): Promise<PubMedArticle | null> {
  logger.info('Fetching article by PMID (REAL API)', {
    service: 'medresearch-ai',
    version: '6.1.0',
    pmid,
  });
  
  try {
    await rateLimit();
    
    let fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml&tool=${TOOL_NAME}&email=${EMAIL}`;
    
    if (API_KEY) {
      fetchUrl += `&api_key=${API_KEY}`;
    }
    
    const xmlData = await httpsRequest(fetchUrl);
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    
    const result = parser.parse(xmlData);
    
    if (!result.PubmedArticleSet || !result.PubmedArticleSet.PubmedArticle) {
      logger.warn('Article not found', { pmid });
      return null;
    }
    
    const pubmedArticle = result.PubmedArticleSet.PubmedArticle;
    const medlineCitation = pubmedArticle.MedlineCitation;
    const article = medlineCitation.Article;
    
    // Extract title
    const title = article.ArticleTitle || 'No title available';
    
    // Extract authors
    const authorList = article.AuthorList?.Author || [];
    const authors = Array.isArray(authorList) ? authorList : [authorList];
    const authorNames = authors.map((author: any) => {
      if (author.LastName && author.ForeName) {
        return `${author.LastName} ${author.ForeName.charAt(0)}`;
      } else if (author.CollectiveName) {
        return author.CollectiveName;
      }
      return 'Unknown';
    }).filter((name: string) => name !== 'Unknown');
    
    // Extract journal
    const journal = article.Journal?.Title || article.Journal?.ISOAbbreviation || 'Unknown Journal';
    
    // Extract publication date
    const pubDate = article.Journal?.JournalIssue?.PubDate || {};
    const year = pubDate.Year || '0000';
    const month = pubDate.Month || '01';
    const day = pubDate.Day || '01';
    const publicationDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Extract abstract
    const abstractTexts = article.Abstract?.AbstractText || [];
    const abstractArray = Array.isArray(abstractTexts) ? abstractTexts : [abstractTexts];
    const abstract = abstractArray.map((text: any) => {
      if (typeof text === 'string') return text;
      if (text['#text']) return text['#text'];
      return '';
    }).join(' ').trim() || 'No abstract available';
    
    // Extract DOI
    const articleIds = pubmedArticle.PubmedData?.ArticleIdList?.ArticleId || [];
    const articleIdArray = Array.isArray(articleIds) ? articleIds : [articleIds];
    const doiObj = articleIdArray.find((id: any) => id['@_IdType'] === 'doi');
    const doi = doiObj ? (typeof doiObj === 'string' ? doiObj : doiObj['#text']) : undefined;
    
    // Extract publication types
    const pubTypeList = article.PublicationTypeList?.PublicationType || [];
    const pubTypeArray = Array.isArray(pubTypeList) ? pubTypeList : [pubTypeList];
    const publicationTypes = pubTypeArray.map((type: any) => 
      typeof type === 'string' ? type : type['#text'] || 'Unknown'
    );
    
    // Extract MeSH terms
    const meshHeadingList = medlineCitation.MeshHeadingList?.MeshHeading || [];
    const meshArray = Array.isArray(meshHeadingList) ? meshHeadingList : [meshHeadingList];
    const meshTerms = meshArray.map((mesh: any) => {
      const descriptor = mesh.DescriptorName;
      return typeof descriptor === 'string' ? descriptor : descriptor?.['#text'] || '';
    }).filter((term: string) => term !== '');
    
    const pubmedArticleResult: PubMedArticle = {
      pmid,
      title,
      authors: authorNames,
      journal,
      publication_date: publicationDate,
      abstract,
      doi,
      publication_types: publicationTypes,
      mesh_terms: meshTerms,
    };
    
    logger.info('Article fetched successfully', {
      service: 'medresearch-ai',
      pmid,
      title: title.substring(0, 50) + '...',
    });
    
    return pubmedArticleResult;
    
  } catch (error) {
    logger.error('Failed to fetch article', {
      service: 'medresearch-ai',
      pmid,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Batch fetch articles by PMIDs
 */
export async function batchFetchArticles(pmids: string[]): Promise<PubMedArticle[]> {
  logger.info('Batch fetching articles (REAL API)', {
    service: 'medresearch-ai',
    version: '6.1.0',
    count: pmids.length,
  });
  
  if (pmids.length === 0) {
    return [];
  }
  
  // Batch fetch up to 200 articles at once (NCBI limit)
  const batchSize = 200;
  const articles: PubMedArticle[] = [];
  
  for (let i = 0; i < pmids.length; i += batchSize) {
    const batchPmids = pmids.slice(i, i + batchSize);
    
    try {
      await rateLimit();
      
      let fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${batchPmids.join(',')}&retmode=xml&tool=${TOOL_NAME}&email=${EMAIL}`;
      
      if (API_KEY) {
        fetchUrl += `&api_key=${API_KEY}`;
      }
      
      const xmlData = await httpsRequest(fetchUrl);
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
      });
      
      const result = parser.parse(xmlData);
      
      if (!result.PubmedArticleSet || !result.PubmedArticleSet.PubmedArticle) {
        continue;
      }
      
      const pubmedArticles = Array.isArray(result.PubmedArticleSet.PubmedArticle)
        ? result.PubmedArticleSet.PubmedArticle
        : [result.PubmedArticleSet.PubmedArticle];
      
      for (const pubmedArticle of pubmedArticles) {
        try {
          const medlineCitation = pubmedArticle.MedlineCitation;
          const article = medlineCitation.Article;
          const pmid = medlineCitation.PMID?.['#text'] || medlineCitation.PMID || '';
          
          // Extract all fields (same as fetchArticleByPMID)
          const title = article.ArticleTitle || 'No title available';
          
          const authorList = article.AuthorList?.Author || [];
          const authors = Array.isArray(authorList) ? authorList : [authorList];
          const authorNames = authors.map((author: any) => {
            if (author.LastName && author.ForeName) {
              return `${author.LastName} ${author.ForeName.charAt(0)}`;
            } else if (author.CollectiveName) {
              return author.CollectiveName;
            }
            return 'Unknown';
          }).filter((name: string) => name !== 'Unknown');
          
          const journal = article.Journal?.Title || article.Journal?.ISOAbbreviation || 'Unknown Journal';
          
          const pubDate = article.Journal?.JournalIssue?.PubDate || {};
          const year = pubDate.Year || '0000';
          const month = pubDate.Month || '01';
          const day = pubDate.Day || '01';
          const publicationDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          
          const abstractTexts = article.Abstract?.AbstractText || [];
          const abstractArray = Array.isArray(abstractTexts) ? abstractTexts : [abstractTexts];
          const abstract = abstractArray.map((text: any) => {
            if (typeof text === 'string') return text;
            if (text['#text']) return text['#text'];
            return '';
          }).join(' ').trim() || 'No abstract available';
          
          const articleIds = pubmedArticle.PubmedData?.ArticleIdList?.ArticleId || [];
          const articleIdArray = Array.isArray(articleIds) ? articleIds : [articleIds];
          const doiObj = articleIdArray.find((id: any) => id['@_IdType'] === 'doi');
          const doi = doiObj ? (typeof doiObj === 'string' ? doiObj : doiObj['#text']) : undefined;
          
          const pubTypeList = article.PublicationTypeList?.PublicationType || [];
          const pubTypeArray = Array.isArray(pubTypeList) ? pubTypeList : [pubTypeList];
          const publicationTypes = pubTypeArray.map((type: any) => 
            typeof type === 'string' ? type : type['#text'] || 'Unknown'
          );
          
          const meshHeadingList = medlineCitation.MeshHeadingList?.MeshHeading || [];
          const meshArray = Array.isArray(meshHeadingList) ? meshHeadingList : [meshHeadingList];
          const meshTerms = meshArray.map((mesh: any) => {
            const descriptor = mesh.DescriptorName;
            return typeof descriptor === 'string' ? descriptor : descriptor?.['#text'] || '';
          }).filter((term: string) => term !== '');
          
          articles.push({
            pmid,
            title,
            authors: authorNames,
            journal,
            publication_date: publicationDate,
            abstract,
            doi,
            publication_types: publicationTypes,
            mesh_terms: meshTerms,
          });
        } catch (parseError) {
          logger.warn('Failed to parse article in batch', {
            error: parseError instanceof Error ? parseError.message : String(parseError),
          });
        }
      }
      
    } catch (error) {
      logger.error('Batch fetch failed for batch', {
        service: 'medresearch-ai',
        batch_start: i,
        batch_size: batchPmids.length,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  logger.info('Batch fetch complete', {
    service: 'medresearch-ai',
    version: '6.1.0',
    requested: pmids.length,
    found: articles.length,
  });
  
  return articles;
}

/**
 * Build advanced search query
 */
export function buildAdvancedQuery(params: {
  terms: string[];
  authors?: string[];
  journal?: string;
  year_start?: number;
  year_end?: number;
  publication_types?: string[];
}): string {
  const queryParts: string[] = [];
  
  // Add search terms
  if (params.terms && params.terms.length > 0) {
    const termsQuery = params.terms.map(t => `"${t}"`).join(' AND ');
    queryParts.push(`(${termsQuery})`);
  }
  
  // Add authors
  if (params.authors && params.authors.length > 0) {
    const authorsQuery = params.authors.map(a => `${a}[Author]`).join(' OR ');
    queryParts.push(`(${authorsQuery})`);
  }
  
  // Add journal
  if (params.journal) {
    queryParts.push(`"${params.journal}"[Journal]`);
  }
  
  // Add year range
  if (params.year_start && params.year_end) {
    queryParts.push(`${params.year_start}:${params.year_end}[Publication Date]`);
  } else if (params.year_start) {
    queryParts.push(`${params.year_start}:3000[Publication Date]`);
  } else if (params.year_end) {
    queryParts.push(`1900:${params.year_end}[Publication Date]`);
  }
  
  // Add publication types
  if (params.publication_types && params.publication_types.length > 0) {
    const typesQuery = params.publication_types.map(t => `"${t}"[Publication Type]`).join(' OR ');
    queryParts.push(`(${typesQuery})`);
  }
  
  return queryParts.join(' AND ');
}

/**
 * Convert PubMed article to citation format
 */
export function formatCitation(article: PubMedArticle, format: 'APA' | 'Vancouver' | 'Harvard' = 'APA'): string {
  const authors = article.authors.slice(0, 3).join(', ');
  const moreAuthors = article.authors.length > 3 ? ', et al.' : '';
  const year = article.publication_date.substring(0, 4);
  
  switch (format) {
    case 'APA':
      return `${authors}${moreAuthors} (${year}). ${article.title}. ${article.journal}. ${article.doi ? `https://doi.org/${article.doi}` : `PMID: ${article.pmid}`}`;
    
    case 'Vancouver':
      return `${authors}${moreAuthors}. ${article.title}. ${article.journal}. ${year}. PMID: ${article.pmid}.`;
    
    case 'Harvard':
      return `${authors}${moreAuthors} ${year}, '${article.title}', ${article.journal}.`;
    
    default:
      return `${authors}${moreAuthors} (${year}). ${article.title}. ${article.journal}.`;
  }
}
