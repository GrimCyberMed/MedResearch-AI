/**
 * MedResearch AI - Input Validation Schemas
 * 
 * Zod schemas for validating all MCP tool inputs.
 * Provides runtime type safety and clear error messages.
 * 
 * @version 1.0.0
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  /** Non-empty string */
  nonEmptyString: z.string().min(1, 'Cannot be empty'),
  
  /** Positive integer */
  positiveInt: z.number().int().positive(),
  
  /** Non-negative integer */
  nonNegativeInt: z.number().int().min(0),
  
  /** Email address */
  email: z.string().email('Invalid email address'),
  
  /** DOI */
  doi: z.string().regex(/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, 'Invalid DOI format'),
  
  /** PMID */
  pmid: z.string().regex(/^\d+$/, 'Invalid PMID format'),
  
  /** Date string (YYYY-MM-DD) */
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)'),
};

/**
 * Plagiarism Detection Schemas
 */
export const PlagiarismSchemas = {
  /** Compare documents input */
  compareDocuments: z.object({
    document1: z.string().min(10, 'Document 1 must be at least 10 characters'),
    document2: z.string().min(10, 'Document 2 must be at least 10 characters'),
    shingleSize: z.number().int().min(2).max(20).default(5),
  }),
  
  /** Check plagiarism input */
  checkPlagiarism: z.object({
    text: z.string().min(10, 'Text must be at least 10 characters').max(1000000, 'Text exceeds maximum length'),
    title: z.string().optional(),
    author: z.string().optional(),
    config: z.object({
      shingleSize: z.number().int().min(2).max(20).default(5),
      minSimilarityThreshold: z.number().min(0).max(1).default(0.15),
      maxResults: z.number().int().min(1).max(100).default(10),
      checkCitations: z.boolean().default(true),
      checkSelfPlagiarism: z.boolean().default(true),
    }).optional(),
    databases: z.array(z.enum(['pubmed', 'europepmc', 'semanticscholar', 'lens', 'crossref'])).optional(),
  }),
};

/**
 * Database Search Schemas
 */
export const DatabaseSchemas = {
  /** PubMed search */
  pubmedSearch: z.object({
    query: CommonSchemas.nonEmptyString,
    max_results: z.number().int().min(1).max(10000).default(100),
    sort: z.enum(['relevance', 'date', 'author']).default('relevance'),
    filters: z.object({
      date_from: CommonSchemas.dateString.optional(),
      date_to: CommonSchemas.dateString.optional(),
      article_types: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
    }).optional(),
  }),
  
  /** Europe PMC search */
  europePmcSearch: z.object({
    query: CommonSchemas.nonEmptyString,
    max_results: z.number().int().min(1).max(10000).default(100),
    include_preprints: z.boolean().default(true),
  }),
  
  /** Semantic Scholar search */
  semanticScholarSearch: z.object({
    query: CommonSchemas.nonEmptyString,
    max_results: z.number().int().min(1).max(10000).default(100),
    year_from: z.number().int().min(1900).max(2100).optional(),
    year_to: z.number().int().min(1900).max(2100).optional(),
    fields_of_study: z.array(z.string()).optional(),
    publication_types: z.array(z.string()).optional(),
    open_access_only: z.boolean().default(false),
  }),
  
  /** The Lens search */
  lensSearch: z.object({
    query: CommonSchemas.nonEmptyString,
    max_results: z.number().int().min(1).max(1000).default(100),
    year_from: z.number().int().min(1900).max(2100).optional(),
    year_to: z.number().int().min(1900).max(2100).optional(),
    include_patents: z.boolean().default(false),
    open_access_only: z.boolean().default(false),
    source_types: z.array(z.enum(['journal', 'conference', 'book', 'preprint', 'other'])).optional(),
  }),
  
  /** ClinicalTrials.gov search */
  clinicalTrialsSearch: z.object({
    query: CommonSchemas.nonEmptyString,
    max_results: z.number().int().min(1).max(10000).default(100),
    status: z.array(z.enum(['RECRUITING', 'NOT_YET_RECRUITING', 'COMPLETED', 'TERMINATED', 'SUSPENDED', 'WITHDRAWN'])).optional(),
    phase: z.array(z.enum(['EARLY_PHASE1', 'PHASE1', 'PHASE2', 'PHASE3', 'PHASE4'])).optional(),
    study_type: z.array(z.enum(['INTERVENTIONAL', 'OBSERVATIONAL', 'EXPANDED_ACCESS'])).optional(),
    country: z.string().optional(),
  }),
  
  /** CrossRef search */
  crossRefSearch: z.object({
    query: CommonSchemas.nonEmptyString,
    max_results: z.number().int().min(1).max(10000).default(100),
    year_from: z.number().int().min(1900).max(2100).optional(),
    year_to: z.number().int().min(1900).max(2100).optional(),
    type: z.array(z.enum(['journal-article', 'book-chapter', 'proceedings-article', 'dataset', 'preprint'])).optional(),
    has_full_text: z.boolean().default(false),
    has_abstract: z.boolean().default(false),
  }),
  
  /** Unpaywall search */
  unpaywallSearch: z.object({
    identifiers: z.array(z.string()).min(1, 'At least one identifier required'),
    email: CommonSchemas.email,
  }),
};

/**
 * Validate input against schema
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data
 * @throws ZodError if validation fails
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validate input and return result with error handling
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Success result with data or error result
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format error message
  const errors = result.error.errors.map(err => 
    `${err.path.join('.')}: ${err.message}`
  ).join('; ');
  
  return { success: false, error: errors };
}

export default {
  CommonSchemas,
  PlagiarismSchemas,
  DatabaseSchemas,
  validate,
  validateSafe,
};
