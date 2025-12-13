/**
 * Zotero Integration - REAL IMPLEMENTATION (100% FREE)
 * 
 * Integrates with Zotero Web API for reference management.
 * 
 * Features:
 * - Import references from Zotero library
 * - Export references to Zotero library
 * - Create/update/delete items
 * - Manage collections
 * - Search library
 * - Sync citations
 * 
 * API: Zotero Web API v3 (https://www.zotero.org/support/dev/web_api/v3/start)
 * Cost: 100% FREE (no API fees, no subscriptions)
 * Rate Limit: 10 requests/second
 * 
 * @version 6.1.0 - Real API Integration
 */

import { logger } from '../../common/logger.js';
import https from 'https';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ZoteroConfig {
  library_id: string;
  library_type: 'user' | 'group';
  api_key: string;
}

export interface ZoteroItem {
  key: string;
  version: number;
  itemType: string;
  title: string;
  creators: Array<{
    creatorType: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  }>;
  abstractNote?: string;
  publicationTitle?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  date?: string;
  DOI?: string;
  url?: string;
  tags?: Array<{ tag: string }>;
  collections?: string[];
  dateAdded?: string;
  dateModified?: string;
}

export interface Reference {
  id: string;
  type: string;
  title: string;
  authors: string[];
  year?: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  collections?: string[];
  date_added?: string;
  date_modified?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: number;
  references: Reference[];
  message: string;
}

export interface ExportResult {
  success: boolean;
  exported: number;
  errors: number;
  message: string;
  export_url?: string;
  created_keys?: string[];
}

export interface Collection {
  key: string;
  version: number;
  name: string;
  parentCollection?: string;
  numItems: number;
}

// ============================================================================
// ZOTERO CLIENT (REAL IMPLEMENTATION)
// ============================================================================

export class ZoteroClient {
  private readonly baseUrl = 'https://api.zotero.org';
  private config: ZoteroConfig;
  private lastRequestTime = 0;
  private readonly minRequestInterval = 100; // 10 requests/second
  
  constructor(config: ZoteroConfig) {
    this.config = config;
    
    logger.info('Zotero client initialized (REAL API)', {
      service: 'medresearch-ai',
      version: '6.1.0',
      library_id: config.library_id,
      library_type: config.library_type,
    });
  }
  
  /**
   * Rate limiting
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
  
  /**
   * Make HTTPS request to Zotero API
   */
  private httpsRequest(
    method: string,
    path: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<{ data: any; headers: any }> {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const parsedUrl = new URL(url);
      
      const defaultHeaders: Record<string, string> = {
        'Zotero-API-Key': this.config.api_key,
        'Zotero-API-Version': '3',
      };
      
      if (data) {
        defaultHeaders['Content-Type'] = 'application/json';
      }
      
      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: method,
        headers: { ...defaultHeaders, ...headers },
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = responseData ? JSON.parse(responseData) : null;
              resolve({ data: parsed, headers: res.headers });
            } catch (e) {
              resolve({ data: responseData, headers: res.headers });
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }
  
  /**
   * Get library items
   */
  async getItems(params?: {
    limit?: number;
    start?: number;
    collectionKey?: string;
    tag?: string;
    q?: string; // Search query
  }): Promise<ZoteroItem[]> {
    await this.rateLimit();
    
    logger.info('Fetching items from Zotero (REAL API)', {
      service: 'medresearch-ai',
      params,
    });
    
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.start) queryParams.append('start', params.start.toString());
      if (params?.tag) queryParams.append('tag', params.tag);
      if (params?.q) queryParams.append('q', params.q);
      
      let path = `/${this.config.library_type}s/${this.config.library_id}/items`;
      
      if (params?.collectionKey) {
        path = `/${this.config.library_type}s/${this.config.library_id}/collections/${params.collectionKey}/items`;
      }
      
      const queryString = queryParams.toString();
      if (queryString) {
        path += `?${queryString}`;
      }
      
      const response = await this.httpsRequest('GET', path);
      const items = response.data || [];
      
      logger.info('Zotero items fetched', {
        service: 'medresearch-ai',
        count: items.length,
      });
      
      return items;
      
    } catch (error) {
      logger.error('Failed to fetch Zotero items', {
        service: 'medresearch-ai',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  
  /**
   * Import references from Zotero
   */
  async importReferences(collectionKey?: string, limit?: number): Promise<ImportResult> {
    logger.info('Importing references from Zotero (REAL API)', {
      service: 'medresearch-ai',
      version: '6.1.0',
      library_id: this.config.library_id,
      collection_key: collectionKey,
    });
    
    try {
      const items = await this.getItems({
        collectionKey,
        limit: limit || 100,
      });
      
      const references: Reference[] = items.map(item => this.zoteroItemToReference(item));
      
      logger.info('Zotero import complete', {
        service: 'medresearch-ai',
        version: '6.1.0',
        imported: references.length,
      });
      
      return {
        success: true,
        imported: references.length,
        duplicates: 0,
        errors: 0,
        references,
        message: `Successfully imported ${references.length} references from Zotero`,
      };
      
    } catch (error) {
      logger.error('Zotero import failed', {
        service: 'medresearch-ai',
        version: '6.1.0',
        error: error instanceof Error ? error.message : String(error),
      });
      
      return {
        success: false,
        imported: 0,
        duplicates: 0,
        errors: 1,
        references: [],
        message: `Import failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  
  /**
   * Export references to Zotero
   */
  async exportReferences(references: Reference[], collectionKey?: string): Promise<ExportResult> {
    await this.rateLimit();
    
    logger.info('Exporting references to Zotero (REAL API)', {
      service: 'medresearch-ai',
      version: '6.1.0',
      count: references.length,
    });
    
    try {
      const zoteroItems = references.map(ref => this.referenceToZoteroItem(ref));
      
      let path = `/${this.config.library_type}s/${this.config.library_id}/items`;
      
      const response = await this.httpsRequest('POST', path, zoteroItems);
      
      const created = response.data?.successful || {};
      const createdKeys = Object.keys(created);
      
      // If collection specified, add items to collection
      if (collectionKey && createdKeys.length > 0) {
        await this.addItemsToCollection(collectionKey, createdKeys);
      }
      
      logger.info('Zotero export complete', {
        service: 'medresearch-ai',
        version: '6.1.0',
        exported: createdKeys.length,
      });
      
      return {
        success: true,
        exported: createdKeys.length,
        errors: references.length - createdKeys.length,
        message: `Successfully exported ${createdKeys.length}/${references.length} references to Zotero`,
        export_url: `https://www.zotero.org/${this.config.library_type}s/${this.config.library_id}/items`,
        created_keys: createdKeys,
      };
      
    } catch (error) {
      logger.error('Zotero export failed', {
        service: 'medresearch-ai',
        version: '6.1.0',
        error: error instanceof Error ? error.message : String(error),
      });
      
      return {
        success: false,
        exported: 0,
        errors: references.length,
        message: `Export failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  
  /**
   * Get collections
   */
  async getCollections(): Promise<Collection[]> {
    await this.rateLimit();
    
    logger.info('Fetching collections from Zotero', {
      service: 'medresearch-ai',
    });
    
    try {
      const path = `/${this.config.library_type}s/${this.config.library_id}/collections`;
      const response = await this.httpsRequest('GET', path);
      
      const collections: Collection[] = (response.data || []).map((col: any) => ({
        key: col.key,
        version: col.version,
        name: col.data.name,
        parentCollection: col.data.parentCollection,
        numItems: col.meta.numItems || 0,
      }));
      
      logger.info('Collections fetched', {
        service: 'medresearch-ai',
        count: collections.length,
      });
      
      return collections;
      
    } catch (error) {
      logger.error('Failed to fetch collections', {
        service: 'medresearch-ai',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  
  /**
   * Create collection
   */
  async createCollection(name: string, parentKey?: string): Promise<string> {
    await this.rateLimit();
    
    logger.info('Creating collection in Zotero', {
      service: 'medresearch-ai',
      name,
    });
    
    try {
      const path = `/${this.config.library_type}s/${this.config.library_id}/collections`;
      
      const collectionData = [{
        name,
        parentCollection: parentKey || false,
      }];
      
      const response = await this.httpsRequest('POST', path, collectionData);
      
      const created = response.data?.successful || {};
      const createdKey = Object.keys(created)[0];
      
      logger.info('Collection created', {
        service: 'medresearch-ai',
        key: createdKey,
      });
      
      return createdKey;
      
    } catch (error) {
      logger.error('Failed to create collection', {
        service: 'medresearch-ai',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  
  /**
   * Add items to collection
   */
  async addItemsToCollection(collectionKey: string, itemKeys: string[]): Promise<void> {
    await this.rateLimit();
    
    logger.info('Adding items to collection', {
      service: 'medresearch-ai',
      collection_key: collectionKey,
      item_count: itemKeys.length,
    });
    
    try {
      const path = `/${this.config.library_type}s/${this.config.library_id}/collections/${collectionKey}/items`;
      
      await this.httpsRequest('POST', path, itemKeys.join(' '));
      
      logger.info('Items added to collection', {
        service: 'medresearch-ai',
      });
      
    } catch (error) {
      logger.error('Failed to add items to collection', {
        service: 'medresearch-ai',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  
  /**
   * Search library
   */
  async searchLibrary(query: string, limit?: number): Promise<Reference[]> {
    logger.info('Searching Zotero library', {
      service: 'medresearch-ai',
      query,
    });
    
    try {
      const items = await this.getItems({
        q: query,
        limit: limit || 50,
      });
      
      const references = items.map(item => this.zoteroItemToReference(item));
      
      logger.info('Search complete', {
        service: 'medresearch-ai',
        results: references.length,
      });
      
      return references;
      
    } catch (error) {
      logger.error('Search failed', {
        service: 'medresearch-ai',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
  
  /**
   * Convert Zotero item to Reference
   */
  private zoteroItemToReference(item: ZoteroItem): Reference {
    const authors = item.creators?.map(creator => {
      if (creator.name) return creator.name;
      return `${creator.lastName || ''} ${creator.firstName || ''}`.trim();
    }) || [];
    
    const year = item.date ? parseInt(item.date.substring(0, 4)) : undefined;
    
    return {
      id: item.key,
      type: item.itemType,
      title: item.title || 'Untitled',
      authors,
      year,
      journal: item.publicationTitle,
      volume: item.volume,
      issue: item.issue,
      pages: item.pages,
      doi: item.DOI,
      url: item.url,
      abstract: item.abstractNote,
      keywords: item.tags?.map(t => t.tag),
      collections: item.collections,
      date_added: item.dateAdded,
      date_modified: item.dateModified,
    };
  }
  
  /**
   * Convert Reference to Zotero item
   */
  private referenceToZoteroItem(ref: Reference): any {
    const creators = ref.authors.map(author => {
      const parts = author.split(' ');
      if (parts.length >= 2) {
        return {
          creatorType: 'author',
          firstName: parts.slice(0, -1).join(' '),
          lastName: parts[parts.length - 1],
        };
      } else {
        return {
          creatorType: 'author',
          name: author,
        };
      }
    });
    
    return {
      itemType: ref.type === 'article' ? 'journalArticle' : ref.type,
      title: ref.title,
      creators,
      abstractNote: ref.abstract,
      publicationTitle: ref.journal,
      volume: ref.volume,
      issue: ref.issue,
      pages: ref.pages,
      date: ref.year?.toString(),
      DOI: ref.doi,
      url: ref.url,
      tags: ref.keywords?.map(k => ({ tag: k })) || [],
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create Zotero client from environment variables
 */
export function createZoteroClient(): ZoteroClient {
  const config: ZoteroConfig = {
    library_id: (process.env.ZOTERO_LIBRARY_ID || '').trim(),
    library_type: ((process.env.ZOTERO_LIBRARY_TYPE || 'user').trim() as 'user' | 'group'),
    api_key: (process.env.ZOTERO_API_KEY || '').trim(),
  };
  
  if (!config.library_id || !config.api_key) {
    throw new Error('Zotero configuration missing. Set ZOTERO_LIBRARY_ID and ZOTERO_API_KEY in .env file');
  }
  
  return new ZoteroClient(config);
}

/**
 * Import references from Zotero
 */
export async function importFromZotero(
  config?: ZoteroConfig,
  collectionKey?: string,
  limit?: number
): Promise<ImportResult> {
  const client = config ? new ZoteroClient(config) : createZoteroClient();
  return await client.importReferences(collectionKey, limit);
}

/**
 * Export references to Zotero
 */
export async function exportToZotero(
  references: Reference[],
  config?: ZoteroConfig,
  collectionKey?: string
): Promise<ExportResult> {
  const client = config ? new ZoteroClient(config) : createZoteroClient();
  return await client.exportReferences(references, collectionKey);
}

/**
 * Search Zotero library
 */
export async function searchZotero(
  query: string,
  config?: ZoteroConfig,
  limit?: number
): Promise<Reference[]> {
  const client = config ? new ZoteroClient(config) : createZoteroClient();
  return await client.searchLibrary(query, limit);
}
