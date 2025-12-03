/**
 * Unpaywall Integration Tool
 * 
 * Tool for finding open access versions of articles using Unpaywall API
 */

import https from 'https';

interface UnpaywallArgs {
  identifiers: string[];
  email: string;
}

interface OAResult {
  doi: string;
  is_oa: boolean;
  oa_status?: 'gold' | 'hybrid' | 'bronze' | 'green' | 'closed';
  oa_url?: string;
  oa_location?: {
    url: string;
    url_for_pdf?: string;
    version?: string;
    license?: string;
    host_type?: string;
  };
  publisher?: string;
  journal?: string;
  title?: string;
  year?: number;
  error?: string;
}

/**
 * Make HTTPS request helper
 */
function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 404) {
          resolve(JSON.stringify({ error: 'DOI not found' }));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Convert PMID to DOI using PubMed API
 */
async function pmidToDOI(pmid: string): Promise<string | null> {
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;
    const data = await httpsRequest(url);
    const result = JSON.parse(data);
    
    if (result.result?.[pmid]) {
      const article = result.result[pmid];
      const doiObj = article.articleids?.find((id: any) => id.idtype === 'doi');
      return doiObj?.value || null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Query Unpaywall API for a single DOI
 */
async function queryUnpaywall(doi: string, email: string): Promise<OAResult> {
  try {
    const url = `https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=${encodeURIComponent(email)}`;
    const data = await httpsRequest(url);
    const result = JSON.parse(data);

    if (result.error) {
      return {
        doi,
        is_oa: false,
        error: result.error,
      };
    }

    // Extract best OA location
    const bestOA = result.best_oa_location;

    return {
      doi: result.doi,
      is_oa: result.is_oa,
      oa_status: result.oa_status,
      oa_url: bestOA?.url,
      oa_location: bestOA ? {
        url: bestOA.url,
        url_for_pdf: bestOA.url_for_pdf,
        version: bestOA.version,
        license: bestOA.license,
        host_type: bestOA.host_type,
      } : undefined,
      publisher: result.publisher,
      journal: result.journal_name,
      title: result.title,
      year: result.year,
    };

  } catch (error) {
    return {
      doi,
      is_oa: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Find open access versions of articles
 */
export async function findOpenAccess(args: UnpaywallArgs) {
  const { identifiers, email } = args;

  if (!email || !email.includes('@')) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'Valid email address required for Unpaywall API',
          note: 'Unpaywall requires an email address for API access (free, no registration needed)',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    const results: OAResult[] = [];

    for (const identifier of identifiers) {
      let doi = identifier;

      // Check if identifier is PMID and convert to DOI
      if (/^\d+$/.test(identifier)) {
        const convertedDOI = await pmidToDOI(identifier);
        if (!convertedDOI) {
          results.push({
            doi: `PMID:${identifier}`,
            is_oa: false,
            error: 'Could not convert PMID to DOI',
          });
          continue;
        }
        doi = convertedDOI;
      }

      // Clean DOI (remove URL prefix if present)
      doi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '');

      // Query Unpaywall
      const result = await queryUnpaywall(doi, email);
      results.push(result);

      // Rate limiting: Unpaywall allows 100,000 requests/day, but be polite
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary statistics
    const oaCount = results.filter(r => r.is_oa).length;
    const oaByStatus = results.reduce((acc, r) => {
      if (r.oa_status) {
        acc[r.oa_status] = (acc[r.oa_status] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          total: results.length,
          open_access: oaCount,
          closed_access: results.length - oaCount,
          oa_percentage: ((oaCount / results.length) * 100).toFixed(1),
          oa_by_status: oaByStatus,
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
        }, null, 2),
      }],
      isError: true,
    };
  }
}
