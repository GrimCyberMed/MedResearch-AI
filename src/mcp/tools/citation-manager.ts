/**
 * Citation Management Tools
 * 
 * Tools for managing citations using Zotero API
 */

import https from 'https';
import { URLSearchParams } from 'url';

interface CitationManagementArgs {
  action: 'add' | 'get' | 'verify' | 'search' | 'delete';
  identifier?: string;
  collection?: string;
  citation_data?: any;
}

interface BibliographyExportArgs {
  collection: string;
  format?: 'apa' | 'vancouver' | 'harvard' | 'chicago' | 'bibtex';
  output_path: string;
}

/**
 * Make HTTPS request helper
 */
function httpsRequest(url: string, options?: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (options?.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * Fetch citation metadata from DOI or PMID
 */
async function fetchCitationMetadata(identifier: string): Promise<any> {
  // Check if identifier is DOI or PMID
  const isDOI = identifier.includes('/') || identifier.startsWith('10.');
  const isPMID = /^\d+$/.test(identifier);

  if (isDOI) {
    // Fetch from CrossRef
    const url = `https://api.crossref.org/works/${identifier}`;
    const data = await httpsRequest(url);
    const result = JSON.parse(data);
    
    if (result.message) {
      const msg = result.message;
      return {
        doi: msg.DOI,
        title: msg.title?.[0] || 'Unknown',
        authors: msg.author?.map((a: any) => `${a.given} ${a.family}`) || [],
        journal: msg['container-title']?.[0] || 'Unknown',
        year: msg.published?.['date-parts']?.[0]?.[0] || 0,
        volume: msg.volume,
        issue: msg.issue,
        pages: msg.page,
        type: msg.type,
      };
    }
  } else if (isPMID) {
    // Fetch from PubMed
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${identifier}&retmode=json`;
    const data = await httpsRequest(url);
    const result = JSON.parse(data);
    
    if (result.result?.[identifier]) {
      const article = result.result[identifier];
      return {
        pmid: identifier,
        title: article.title || 'Unknown',
        authors: article.authors?.map((a: any) => a.name) || [],
        journal: article.fulljournalname || 'Unknown',
        year: parseInt(article.pubdate?.split(' ')[0]) || 0,
        volume: article.volume,
        issue: article.issue,
        pages: article.pages,
        doi: article.articleids?.find((id: any) => id.idtype === 'doi')?.value,
      };
    }
  }

  throw new Error(`Unable to fetch metadata for identifier: ${identifier}`);
}

/**
 * Verify citation exists and is accessible
 */
async function verifyCitation(identifier: string): Promise<{ valid: boolean; metadata?: any; error?: string }> {
  try {
    const metadata = await fetchCitationMetadata(identifier);
    return {
      valid: true,
      metadata,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Manage citations (simplified implementation - in production would use Zotero API)
 */
export async function manageCitations(args: CitationManagementArgs) {
  const { action, identifier, collection, citation_data } = args;

  try {
    switch (action) {
      case 'verify':
        if (!identifier) {
          throw new Error('Identifier required for verify action');
        }
        const verification = await verifyCitation(identifier);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              action: 'verify',
              identifier,
              ...verification,
            }, null, 2),
          }],
        };

      case 'get':
        if (!identifier) {
          throw new Error('Identifier required for get action');
        }
        const metadata = await fetchCitationMetadata(identifier);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              action: 'get',
              identifier,
              metadata,
            }, null, 2),
          }],
        };

      case 'search':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Search action requires Zotero API integration',
              note: 'Use verify or get actions with specific identifiers (DOI/PMID)',
            }, null, 2),
          }],
        };

      case 'add':
      case 'delete':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `${action} action requires Zotero API integration`,
              note: 'This is a simplified implementation. For full Zotero integration, configure Zotero API credentials.',
            }, null, 2),
          }],
        };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          action,
        }, null, 2),
      }],
      isError: true,
    };
  }
}

/**
 * Export bibliography in various formats
 */
export async function exportBibliography(args: BibliographyExportArgs) {
  const { collection, format = 'apa', output_path } = args;

  try {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'Bibliography export requires Zotero API integration',
          note: 'This feature requires Zotero API credentials and collection access. Use citation verification tools for individual citations.',
          collection,
          format,
          output_path,
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
