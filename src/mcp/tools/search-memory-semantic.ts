/**
 * MCP Tool: Semantic Memory Search
 * 
 * Performs semantic search over project memory using TF-IDF vectorization
 * and cosine similarity. Enables intelligent retrieval of past decisions,
 * findings, and context.
 * 
 * Features:
 * - TF-IDF vectorization of memory entries
 * - Cosine similarity ranking
 * - Multi-field search (content, tags, metadata)
 * - Temporal filtering
 * - Relevance scoring
 * - Context extraction
 * 
 * @module search-memory-semantic
 * @version 1.0.0
 * @since Phase 3
 */

import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../../common/logger.js';

/**
 * Memory entry structure
 */
interface MemoryEntry {
  id: string;
  timestamp: string;
  type: 'decision' | 'finding' | 'note' | 'milestone' | 'error' | 'warning';
  content: string;
  tags: string[];
  metadata: Record<string, any>;
  phase?: string;
  agent?: string;
}

/**
 * Search result with relevance scoring
 */
interface SearchResult {
  entry: MemoryEntry;
  score: number;
  matchedFields: string[];
  snippet: string;
}

/**
 * Input schema for semantic memory search
 */
interface SemanticSearchInput {
  query: string;
  projectPath: string;
  limit?: number;
  minScore?: number;
  types?: Array<'decision' | 'finding' | 'note' | 'milestone' | 'error' | 'warning'>;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  phase?: string;
  agent?: string;
}

/**
 * Output schema for semantic memory search
 */
interface SemanticSearchOutput {
  success: boolean;
  query: string;
  totalResults: number;
  results: SearchResult[];
  searchTime: number;
  suggestions?: string[];
  error?: string;
}

/**
 * TF-IDF vectorizer for text
 */
class TFIDFVectorizer {
  private vocabulary: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  /**
   * Calculate term frequency
   */
  private calculateTF(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    const totalTokens = tokens.length;

    for (const token of tokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }

    // Normalize by document length
    for (const [token, count] of tf.entries()) {
      tf.set(token, count / totalTokens);
    }

    return tf;
  }

  /**
   * Fit the vectorizer on documents
   */
  fit(documents: string[]): void {
    const docFrequency = new Map<string, number>();

    // Build vocabulary and document frequency
    for (const doc of documents) {
      const tokens = new Set(this.tokenize(doc));
      for (const token of tokens) {
        docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, this.vocabulary.size);
        }
      }
    }

    // Calculate IDF
    const numDocs = documents.length;
    for (const [token, df] of docFrequency.entries()) {
      this.idf.set(token, Math.log(numDocs / df));
    }
  }

  /**
   * Transform text to TF-IDF vector
   */
  transform(text: string): number[] {
    const tokens = this.tokenize(text);
    const tf = this.calculateTF(tokens);
    const vector = new Array(this.vocabulary.size).fill(0);

    for (const [token, tfValue] of tf.entries()) {
      const idx = this.vocabulary.get(token);
      const idfValue = this.idf.get(token) || 0;
      if (idx !== undefined) {
        vector[idx] = tfValue * idfValue;
      }
    }

    return vector;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    return 0;
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Extract snippet around matched terms
 */
function extractSnippet(text: string, query: string, maxLength: number = 200): string {
  const queryTokens = query.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();
  
  // Find first match position
  let matchPos = -1;
  for (const token of queryTokens) {
    const pos = textLower.indexOf(token);
    if (pos !== -1) {
      matchPos = pos;
      break;
    }
  }

  if (matchPos === -1) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  // Extract context around match
  const start = Math.max(0, matchPos - 50);
  const end = Math.min(text.length, matchPos + maxLength - 50);
  
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Load memory entries from project
 */
async function loadMemoryEntries(projectPath: string): Promise<MemoryEntry[]> {
  const memoryPath = path.join(projectPath, '.memory');
  const entries: MemoryEntry[] = [];

  try {
    // Check if memory directory exists
    await fs.access(memoryPath);

    // Load from JSON files (fallback if SQLite not available)
    const files = await fs.readdir(memoryPath);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(memoryPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
          entries.push(...data);
        } else {
          entries.push(data);
        }
      }
    }

    // If no JSON files, create sample structure
    if (entries.length === 0) {
      logger.warn('No memory entries found, creating sample structure');
    }

  } catch (error) {
    logger.warn(`Memory directory not found at ${memoryPath}, creating...`);
    await fs.mkdir(memoryPath, { recursive: true });
  }

  return entries;
}

/**
 * Filter entries by criteria
 */
function filterEntries(
  entries: MemoryEntry[],
  filters: {
    types?: string[];
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
    phase?: string;
    agent?: string;
  }
): MemoryEntry[] {
  return entries.filter(entry => {
    // Filter by type
    if (filters.types && !filters.types.includes(entry.type)) {
      return false;
    }

    // Filter by date range
    if (filters.dateFrom && entry.timestamp < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && entry.timestamp > filters.dateTo) {
      return false;
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => entry.tags.includes(tag));
      if (!hasTag) return false;
    }

    // Filter by phase
    if (filters.phase && entry.phase !== filters.phase) {
      return false;
    }

    // Filter by agent
    if (filters.agent && entry.agent !== filters.agent) {
      return false;
    }

    return true;
  });
}

/**
 * Generate search suggestions based on query
 */
function generateSuggestions(query: string, entries: MemoryEntry[]): string[] {
  const suggestions: string[] = [];
  const queryLower = query.toLowerCase();

  // Extract common tags
  const tagCounts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      if (tag.toLowerCase().includes(queryLower)) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  // Sort tags by frequency
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  if (sortedTags.length > 0) {
    suggestions.push(...sortedTags.map(tag => `Try searching with tag: ${tag}`));
  }

  // Suggest common phases
  const phases = new Set(entries.map(e => e.phase).filter(Boolean));
  if (phases.size > 0) {
    suggestions.push(`Filter by phase: ${Array.from(phases).join(', ')}`);
  }

  return suggestions.slice(0, 3);
}

/**
 * Perform semantic search on project memory
 */
export async function searchMemorySemantic(
  input: SemanticSearchInput
): Promise<SemanticSearchOutput> {
  const startTime = Date.now();

  try {
    logger.info('Starting semantic memory search', { query: input.query });

    // Validate input
    if (!input.query || input.query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    if (!input.projectPath) {
      throw new Error('Project path is required');
    }

    const limit = input.limit || 10;
    const minScore = input.minScore || 0.1;

    // Load memory entries
    const allEntries = await loadMemoryEntries(input.projectPath);
    
    if (allEntries.length === 0) {
      return {
        success: true,
        query: input.query,
        totalResults: 0,
        results: [],
        searchTime: Date.now() - startTime,
        suggestions: ['No memory entries found. Start using the system to build memory.']
      };
    }

    // Filter entries
    const filteredEntries = filterEntries(allEntries, {
      types: input.types,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      tags: input.tags,
      phase: input.phase,
      agent: input.agent
    });

    if (filteredEntries.length === 0) {
      return {
        success: true,
        query: input.query,
        totalResults: 0,
        results: [],
        searchTime: Date.now() - startTime,
        suggestions: generateSuggestions(input.query, allEntries)
      };
    }

    // Prepare documents for TF-IDF
    const documents = filteredEntries.map(entry => {
      return `${entry.content} ${entry.tags.join(' ')} ${entry.type}`;
    });

    // Fit TF-IDF vectorizer
    const vectorizer = new TFIDFVectorizer();
    vectorizer.fit(documents);

    // Transform query
    const queryVector = vectorizer.transform(input.query);

    // Calculate similarities
    const results: SearchResult[] = [];
    
    for (let i = 0; i < filteredEntries.length; i++) {
      const docVector = vectorizer.transform(documents[i]);
      const score = cosineSimilarity(queryVector, docVector);

      if (score >= minScore) {
        const matchedFields: string[] = [];
        
        // Check which fields matched
        if (filteredEntries[i].content.toLowerCase().includes(input.query.toLowerCase())) {
          matchedFields.push('content');
        }
        if (filteredEntries[i].tags.some(tag => tag.toLowerCase().includes(input.query.toLowerCase()))) {
          matchedFields.push('tags');
        }

        results.push({
          entry: filteredEntries[i],
          score,
          matchedFields,
          snippet: extractSnippet(filteredEntries[i].content, input.query)
        });
      }
    }

    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);

    // Limit results
    const limitedResults = results.slice(0, limit);

    const searchTime = Date.now() - startTime;

    logger.info('Semantic search completed', {
      query: input.query,
      totalResults: results.length,
      returnedResults: limitedResults.length,
      searchTime
    });

    return {
      success: true,
      query: input.query,
      totalResults: results.length,
      results: limitedResults,
      searchTime,
      suggestions: results.length === 0 ? generateSuggestions(input.query, allEntries) : undefined
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Semantic search failed', { error: errorMessage });

    return {
      success: false,
      query: input.query,
      totalResults: 0,
      results: [],
      searchTime: Date.now() - startTime,
      error: errorMessage
    };
  }
}

/**
 * MCP tool definition
 */
export const searchMemorySemanticTool = {
  name: 'search_memory_semantic',
  description: 'Perform semantic search over project memory using TF-IDF and cosine similarity',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query (natural language)'
      },
      projectPath: {
        type: 'string',
        description: 'Path to project directory'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 10)',
        default: 10
      },
      minScore: {
        type: 'number',
        description: 'Minimum relevance score (0-1, default: 0.1)',
        default: 0.1
      },
      types: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['decision', 'finding', 'note', 'milestone', 'error', 'warning']
        },
        description: 'Filter by entry types'
      },
      dateFrom: {
        type: 'string',
        description: 'Filter entries from this date (ISO format)'
      },
      dateTo: {
        type: 'string',
        description: 'Filter entries until this date (ISO format)'
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by tags'
      },
      phase: {
        type: 'string',
        description: 'Filter by project phase'
      },
      agent: {
        type: 'string',
        description: 'Filter by agent name'
      }
    },
    required: ['query', 'projectPath']
  }
};
