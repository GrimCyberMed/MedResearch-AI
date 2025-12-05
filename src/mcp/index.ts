/**
 * MedResearch AI - MCP Server
 * 
 * Model Context Protocol server providing tools for systematic reviews and biostatistics:
 * - Medical database searching (PubMed, Europe PMC, Semantic Scholar, The Lens, ClinicalTrials.gov, CrossRef)
 * - R statistics integration (meta-analysis, statistical test selection, assumption checking, power analysis, comprehensive analysis workflows)
 * - Citation management (Zotero)
 * - Document generation (DOCX, PDF)
 * - Open access finder (Unpaywall)
 * - Plagiarism detection (cross-database checking)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../common/logger.js';

// Import tool implementations
import { searchPubMed, searchEuropePMC } from './tools/medical-databases.js';
import { searchSemanticScholar, getSemanticScholarPaper } from './tools/semantic-scholar.js';
import { searchLens, getLensWork } from './tools/lens.js';
import { searchClinicalTrials, getClinicalTrial } from './tools/clinicaltrials.js';
import { searchCrossRef, getCrossRefWork } from './tools/crossref.js';
import { 
  runMetaAnalysis, 
  generateForestPlot,
  selectStatisticalTest,
  checkAssumptions,
  validateData,
  calculatePower,
  runComprehensiveAnalysis
} from './tools/r-statistics.js';
import { manageCitations, exportBibliography } from './tools/citation-manager.js';
import { generateDocument, exportToPDF } from './tools/document-generator.js';
import { findOpenAccess } from './tools/unpaywall.js';
import { checkPlagiarism, compareDocuments } from './tools/plagiarism-detection.js';
import { checkPlagiarismAcrossDatabases } from './tools/plagiarism-database-integration.js';

/**
 * Tool definitions for MCP
 */
const TOOLS: Tool[] = [
  // Medical Database Tools
  {
    name: 'search_pubmed',
    description: 'Search PubMed/MEDLINE database using advanced search syntax with MeSH terms, field tags, and filters',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'PubMed search query with MeSH terms, field tags ([tiab], [MeSH], etc.), and Boolean operators',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (default: 100, max: 10000)',
          default: 100,
        },
        sort: {
          type: 'string',
          enum: ['relevance', 'date', 'author'],
          description: 'Sort order for results',
          default: 'relevance',
        },
        filters: {
          type: 'object',
          properties: {
            date_from: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
            date_to: { type: 'string', description: 'End date (YYYY-MM-DD)' },
            article_types: { type: 'array', items: { type: 'string' }, description: 'Article types (e.g., "randomized controlled trial")' },
            languages: { type: 'array', items: { type: 'string' }, description: 'Language codes (e.g., "eng")' },
          },
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_europe_pmc',
    description: 'Search Europe PMC database with full-text search capability, includes preprints and patents',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Europe PMC search query (supports TITLE:, ABSTRACT:, AUTH:, etc.)',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (default: 100, max: 10000)',
          default: 100,
        },
        include_preprints: {
          type: 'boolean',
          description: 'Include preprints from bioRxiv/medRxiv',
          default: true,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_semantic_scholar',
    description: 'Search Semantic Scholar database with 200M+ papers, AI-powered relevance ranking, and citation context',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (supports year:, fieldsOfStudy:, publicationTypes: filters)',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (default: 100, max: 10000)',
          default: 100,
        },
        year_from: {
          type: 'number',
          description: 'Start year for publication date filter',
        },
        year_to: {
          type: 'number',
          description: 'End year for publication date filter',
        },
        fields_of_study: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields of study filter (e.g., ["Medicine", "Biology"])',
        },
        publication_types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Publication types (e.g., ["JournalArticle", "Review"])',
        },
        open_access_only: {
          type: 'boolean',
          description: 'Return only open access papers',
          default: false,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_semantic_scholar_paper',
    description: 'Get detailed paper information from Semantic Scholar by ID (DOI, PMID, ArXiv, or Semantic Scholar ID)',
    inputSchema: {
      type: 'object',
      properties: {
        paper_id: {
          type: 'string',
          description: 'Paper identifier (DOI, PMID, ArXiv ID, or Semantic Scholar ID)',
        },
      },
      required: ['paper_id'],
    },
  },
  {
    name: 'search_lens',
    description: 'Search The Lens database with 250M+ scholarly works, patents, and clinical trials',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (default: 100, max: 1000)',
          default: 100,
        },
        year_from: {
          type: 'number',
          description: 'Start year for publication date filter',
        },
        year_to: {
          type: 'number',
          description: 'End year for publication date filter',
        },
        include_patents: {
          type: 'boolean',
          description: 'Include patents in results',
          default: false,
        },
        open_access_only: {
          type: 'boolean',
          description: 'Return only open access works',
          default: false,
        },
        source_types: {
          type: 'array',
          items: { type: 'string', enum: ['journal', 'conference', 'book', 'preprint', 'other'] },
          description: 'Source types to include',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_lens_work',
    description: 'Get detailed work information from The Lens by Lens ID',
    inputSchema: {
      type: 'object',
      properties: {
        lens_id: {
          type: 'string',
          description: 'The Lens work identifier',
        },
      },
      required: ['lens_id'],
    },
  },
  {
    name: 'search_clinicaltrials',
    description: 'Search ClinicalTrials.gov database with 450K+ clinical trials worldwide',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (condition, intervention, or disease)',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (default: 100, max: 10000)',
          default: 100,
        },
        status: {
          type: 'array',
          items: { type: 'string', enum: ['RECRUITING', 'NOT_YET_RECRUITING', 'COMPLETED', 'TERMINATED', 'SUSPENDED', 'WITHDRAWN'] },
          description: 'Trial status filter',
        },
        phase: {
          type: 'array',
          items: { type: 'string', enum: ['EARLY_PHASE1', 'PHASE1', 'PHASE2', 'PHASE3', 'PHASE4'] },
          description: 'Trial phase filter',
        },
        study_type: {
          type: 'array',
          items: { type: 'string', enum: ['INTERVENTIONAL', 'OBSERVATIONAL', 'EXPANDED_ACCESS'] },
          description: 'Study type filter',
        },
        country: {
          type: 'string',
          description: 'Country filter (e.g., "United States")',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_clinical_trial',
    description: 'Get detailed clinical trial information by NCT ID',
    inputSchema: {
      type: 'object',
      properties: {
        nct_id: {
          type: 'string',
          description: 'ClinicalTrials.gov NCT identifier (e.g., NCT04280705)',
        },
      },
      required: ['nct_id'],
    },
  },
  {
    name: 'search_crossref',
    description: 'Search CrossRef database with 150M+ DOI metadata and citation information',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (default: 100, max: 10000)',
          default: 100,
        },
        year_from: {
          type: 'number',
          description: 'Start year for publication date filter',
        },
        year_to: {
          type: 'number',
          description: 'End year for publication date filter',
        },
        type: {
          type: 'array',
          items: { type: 'string', enum: ['journal-article', 'book-chapter', 'proceedings-article', 'dataset', 'preprint'] },
          description: 'Publication type filter',
        },
        has_full_text: {
          type: 'boolean',
          description: 'Return only works with full text',
          default: false,
        },
        has_abstract: {
          type: 'boolean',
          description: 'Return only works with abstract',
          default: false,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_crossref_work',
    description: 'Get detailed work information from CrossRef by DOI',
    inputSchema: {
      type: 'object',
      properties: {
        doi: {
          type: 'string',
          description: 'DOI identifier',
        },
      },
      required: ['doi'],
    },
  },

  // R Statistics Tools
  {
    name: 'run_meta_analysis',
    description: 'Execute meta-analysis using R meta package with effect size calculation, heterogeneity assessment, and forest plot generation',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          description: 'Array of study data with effect sizes and standard errors',
          items: {
            type: 'object',
            properties: {
              study_id: { type: 'string' },
              effect_size: { type: 'number' },
              standard_error: { type: 'number' },
              sample_size: { type: 'number' },
            },
            required: ['study_id', 'effect_size', 'standard_error'],
          },
        },
        effect_measure: {
          type: 'string',
          enum: ['SMD', 'MD', 'RR', 'OR', 'HR'],
          description: 'Effect measure type',
        },
        model: {
          type: 'string',
          enum: ['random', 'fixed'],
          description: 'Meta-analysis model',
          default: 'random',
        },
        method: {
          type: 'string',
          enum: ['REML', 'DL', 'PM', 'ML'],
          description: 'Method for estimating between-study variance (tau²)',
          default: 'REML',
        },
      },
      required: ['data', 'effect_measure'],
    },
  },
  {
    name: 'generate_forest_plot',
    description: 'Generate forest plot visualization from meta-analysis results',
    inputSchema: {
      type: 'object',
      properties: {
        meta_analysis_result: {
          type: 'object',
          description: 'Meta-analysis result object from run_meta_analysis',
        },
        output_path: {
          type: 'string',
          description: 'Output file path for forest plot (PNG or PDF)',
        },
        title: {
          type: 'string',
          description: 'Plot title',
        },
        show_prediction_interval: {
          type: 'boolean',
          description: 'Show 95% prediction interval',
          default: true,
        },
      },
      required: ['meta_analysis_result', 'output_path'],
    },
  },
  {
    name: 'select_statistical_test',
    description: 'Intelligently select appropriate statistical test based on research question, data types, and study design. Includes automatic assumption checking and power assessment.',
    inputSchema: {
      type: 'object',
      properties: {
        research_question: {
          type: 'string',
          description: 'Research question or hypothesis to test',
        },
        outcome_type: {
          type: 'string',
          enum: ['continuous', 'binary', 'categorical', 'count', 'time-to-event'],
          description: 'Type of outcome variable',
        },
        predictor_type: {
          type: 'string',
          enum: ['continuous', 'binary', 'categorical'],
          description: 'Type of predictor/exposure variable',
        },
        num_groups: {
          type: 'number',
          description: 'Number of groups to compare (for group comparisons)',
        },
        paired: {
          type: 'boolean',
          description: 'Whether observations are paired/matched',
          default: false,
        },
        sample_size: {
          type: 'number',
          description: 'Total sample size',
        },
        data_file: {
          type: 'string',
          description: 'Path to CSV data file for automatic assumption checking',
        },
        outcome_variable: {
          type: 'string',
          description: 'Name of outcome variable in data file',
        },
        group_variable: {
          type: 'string',
          description: 'Name of grouping variable in data file',
        },
      },
      required: ['research_question', 'outcome_type'],
    },
  },
  {
    name: 'check_assumptions',
    description: 'Comprehensive statistical assumption checking with diagnostic plots. Tests normality, homogeneity of variance, linearity, independence, and identifies outliers/influential points.',
    inputSchema: {
      type: 'object',
      properties: {
        data_file: {
          type: 'string',
          description: 'Path to CSV data file',
        },
        test_type: {
          type: 'string',
          enum: ['t-test', 'anova', 'regression', 'correlation', 'chi-square'],
          description: 'Type of statistical test to check assumptions for',
        },
        outcome_variable: {
          type: 'string',
          description: 'Name of outcome variable',
        },
        predictor_variable: {
          type: 'string',
          description: 'Name of predictor variable (for regression/correlation)',
        },
        group_variable: {
          type: 'string',
          description: 'Name of grouping variable (for t-test/ANOVA)',
        },
        output_dir: {
          type: 'string',
          description: 'Directory to save diagnostic plots',
        },
      },
      required: ['data_file', 'test_type', 'outcome_variable'],
    },
  },
  {
    name: 'validate_data',
    description: 'Comprehensive data quality assessment including missing data analysis, outlier detection, duplicate checking, and descriptive statistics.',
    inputSchema: {
      type: 'object',
      properties: {
        data_file: {
          type: 'string',
          description: 'Path to CSV data file',
        },
        variable_specs: {
          type: 'array',
          description: 'Variable specifications for validation',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Variable name' },
              type: { type: 'string', enum: ['numeric', 'categorical', 'binary'], description: 'Variable type' },
              required: { type: 'boolean', description: 'Whether variable is required' },
              min: { type: 'number', description: 'Minimum allowed value (numeric only)' },
              max: { type: 'number', description: 'Maximum allowed value (numeric only)' },
              allowed_values: { type: 'array', items: { type: 'string' }, description: 'Allowed values (categorical only)' },
            },
            required: ['name', 'type'],
          },
        },
        check_missing: {
          type: 'boolean',
          description: 'Perform missing data analysis',
          default: true,
        },
        check_outliers: {
          type: 'boolean',
          description: 'Detect outliers using IQR method',
          default: true,
        },
        check_duplicates: {
          type: 'boolean',
          description: 'Check for duplicate rows',
          default: true,
        },
      },
      required: ['data_file'],
    },
  },
  {
    name: 'calculate_power',
    description: 'Statistical power analysis for sample size planning or post-hoc power assessment. Supports t-test, ANOVA, correlation, chi-square, and regression.',
    inputSchema: {
      type: 'object',
      properties: {
        test_type: {
          type: 'string',
          enum: ['t-test', 'anova', 'correlation', 'chi-square', 'regression'],
          description: 'Type of statistical test',
        },
        effect_size: {
          type: 'number',
          description: 'Expected effect size (Cohen\'s d for t-test, f for ANOVA, r for correlation, w for chi-square, f2 for regression)',
        },
        sample_size: {
          type: 'number',
          description: 'Sample size per group',
        },
        power: {
          type: 'number',
          description: 'Desired statistical power (typically 0.80)',
          default: 0.8,
        },
        alpha: {
          type: 'number',
          description: 'Significance level (typically 0.05)',
          default: 0.05,
        },
        calculate: {
          type: 'string',
          enum: ['power', 'sample_size', 'effect_size'],
          description: 'What to calculate (given the other parameters)',
        },
        num_groups: {
          type: 'number',
          description: 'Number of groups (for ANOVA)',
        },
        alternative: {
          type: 'string',
          enum: ['two.sided', 'greater', 'less'],
          description: 'Alternative hypothesis',
          default: 'two.sided',
        },
      },
      required: ['test_type', 'calculate'],
    },
  },
  {
    name: 'run_comprehensive_analysis',
    description: 'End-to-end statistical analysis workflow: data validation → baseline characteristics table → test selection → assumption checking → analysis → effect sizes → interpretation. Study design aware (RCT, cohort, case-control, cross-sectional).',
    inputSchema: {
      type: 'object',
      properties: {
        data_file: {
          type: 'string',
          description: 'Path to CSV data file',
        },
        research_question: {
          type: 'string',
          description: 'Research question or hypothesis',
        },
        outcome_variable: {
          type: 'string',
          description: 'Name of primary outcome variable',
        },
        predictor_variables: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of predictor/exposure variables',
        },
        group_variable: {
          type: 'string',
          description: 'Name of grouping variable (for group comparisons)',
        },
        covariates: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of covariates for adjustment',
        },
        study_design: {
          type: 'string',
          enum: ['rct', 'cohort', 'case-control', 'cross-sectional'],
          description: 'Study design type',
        },
        output_dir: {
          type: 'string',
          description: 'Directory to save outputs (tables, plots, reports)',
        },
        generate_report: {
          type: 'boolean',
          description: 'Generate comprehensive Word report',
          default: true,
        },
      },
      required: ['data_file', 'research_question', 'outcome_variable', 'study_design'],
    },
  },

  // Citation Management Tools
  {
    name: 'manage_citations',
    description: 'Manage citations using Zotero API: add, retrieve, verify, and organize references',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['add', 'get', 'verify', 'search', 'delete'],
          description: 'Citation management action',
        },
        identifier: {
          type: 'string',
          description: 'Citation identifier (PMID, DOI, or Zotero item ID)',
        },
        collection: {
          type: 'string',
          description: 'Zotero collection name',
        },
        citation_data: {
          type: 'object',
          description: 'Citation metadata for adding new references',
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'export_bibliography',
    description: 'Export bibliography in various formats (APA, Vancouver, Harvard, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        collection: {
          type: 'string',
          description: 'Zotero collection name to export',
        },
        format: {
          type: 'string',
          enum: ['apa', 'vancouver', 'harvard', 'chicago', 'bibtex'],
          description: 'Citation format',
          default: 'apa',
        },
        output_path: {
          type: 'string',
          description: 'Output file path',
        },
      },
      required: ['collection', 'output_path'],
    },
  },

  // Document Generation Tools
  {
    name: 'generate_document',
    description: 'Generate DOCX manuscript from markdown with PRISMA-compliant formatting, tables, and figures',
    inputSchema: {
      type: 'object',
      properties: {
        markdown_content: {
          type: 'string',
          description: 'Markdown content of manuscript',
        },
        output_path: {
          type: 'string',
          description: 'Output DOCX file path',
        },
        template: {
          type: 'string',
          enum: ['prisma', 'cochrane', 'bmj', 'jama', 'generic'],
          description: 'Document template',
          default: 'prisma',
        },
        metadata: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            authors: { type: 'array', items: { type: 'string' } },
            affiliations: { type: 'array', items: { type: 'string' } },
            keywords: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      required: ['markdown_content', 'output_path'],
    },
  },
  {
    name: 'export_to_pdf',
    description: 'Convert DOCX manuscript to PDF with proper formatting',
    inputSchema: {
      type: 'object',
      properties: {
        docx_path: {
          type: 'string',
          description: 'Input DOCX file path',
        },
        pdf_path: {
          type: 'string',
          description: 'Output PDF file path',
        },
      },
      required: ['docx_path', 'pdf_path'],
    },
  },

  // Open Access Tools
  {
    name: 'find_open_access',
    description: 'Find open access versions of articles using Unpaywall API',
    inputSchema: {
      type: 'object',
      properties: {
        identifiers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of DOIs or PMIDs to check for OA versions',
        },
        email: {
          type: 'string',
          description: 'Email address for Unpaywall API (required)',
        },
      },
      required: ['identifiers', 'email'],
    },
  },

  // Plagiarism Detection Tools
  {
    name: 'check_plagiarism',
    description: 'Check document for plagiarism using w-shingling, Jaccard similarity, and text fingerprinting algorithms',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Document text to check for plagiarism',
        },
        title: {
          type: 'string',
          description: 'Document title (optional)',
        },
        author: {
          type: 'string',
          description: 'Document author (optional)',
        },
        config: {
          type: 'object',
          properties: {
            shingleSize: {
              type: 'number',
              description: 'Size of text shingles (n-grams) for comparison (default: 5)',
              default: 5,
            },
            minSimilarityThreshold: {
              type: 'number',
              description: 'Minimum similarity threshold (0-1) to report matches (default: 0.15)',
              default: 0.15,
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of matches to return (default: 10)',
              default: 10,
            },
            checkCitations: {
              type: 'boolean',
              description: 'Check for citation patterns (default: true)',
              default: true,
            },
            checkSelfPlagiarism: {
              type: 'boolean',
              description: 'Check for self-plagiarism (default: true)',
              default: true,
            },
          },
        },
        databases: {
          type: 'array',
          items: { type: 'string', enum: ['pubmed', 'europepmc', 'semanticscholar', 'lens', 'crossref'] },
          description: 'Databases to search for matches (default: all)',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'compare_documents',
    description: 'Compare two documents directly for similarity using Jaccard coefficient and matched segment analysis',
    inputSchema: {
      type: 'object',
      properties: {
        document1: {
          type: 'string',
          description: 'First document text',
        },
        document2: {
          type: 'string',
          description: 'Second document text',
        },
        shingleSize: {
          type: 'number',
          description: 'Size of text shingles (n-grams) for comparison (default: 5)',
          default: 5,
        },
      },
      required: ['document1', 'document2'],
    },
  },
  {
    name: 'check_plagiarism_databases',
    description: 'Check document for plagiarism across all 7 medical research databases (PubMed, Europe PMC, Semantic Scholar, The Lens, ClinicalTrials.gov, CrossRef, Unpaywall)',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Document text to check for plagiarism',
        },
        title: {
          type: 'string',
          description: 'Document title (optional)',
        },
        author: {
          type: 'string',
          description: 'Document author (optional)',
        },
        config: {
          type: 'object',
          properties: {
            shingleSize: {
              type: 'number',
              description: 'Size of text shingles (n-grams) for comparison (default: 5)',
              default: 5,
            },
            minSimilarityThreshold: {
              type: 'number',
              description: 'Minimum similarity threshold (0-1) to report matches (default: 0.15)',
              default: 0.15,
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of matches to return (default: 10)',
              default: 10,
            },
            checkCitations: {
              type: 'boolean',
              description: 'Check for citation patterns (default: true)',
              default: true,
            },
            checkSelfPlagiarism: {
              type: 'boolean',
              description: 'Check for self-plagiarism (default: true)',
              default: true,
            },
          },
        },
        databases: {
          type: 'array',
          items: { type: 'string', enum: ['pubmed', 'europepmc', 'semanticscholar', 'lens', 'crossref'] },
          description: 'Databases to search for matches (default: all)',
        },
      },
      required: ['text'],
    },
  },
];

/**
 * Initialize MCP server
 */
const server = new Server(
  {
    name: 'medresearch-ai-mcp',
    version: '4.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handle tool list requests
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Medical Database Tools
      case 'search_pubmed':
        return await searchPubMed(args as any);
      case 'search_europe_pmc':
        return await searchEuropePMC(args as any);
      case 'search_semantic_scholar':
        return await searchSemanticScholar(args as any);
      case 'get_semantic_scholar_paper':
        return await getSemanticScholarPaper(args as any);
      case 'search_lens':
        return await searchLens(args as any);
      case 'get_lens_work':
        return await getLensWork(args as any);
      case 'search_clinicaltrials':
        return await searchClinicalTrials(args as any);
      case 'get_clinical_trial':
        return await getClinicalTrial(args as any);
      case 'search_crossref':
        return await searchCrossRef(args as any);
      case 'get_crossref_work':
        return await getCrossRefWork(args as any);

      // R Statistics Tools
      case 'run_meta_analysis':
        return await runMetaAnalysis(args as any);
      case 'generate_forest_plot':
        return await generateForestPlot(args as any);
      case 'select_statistical_test':
        return await selectStatisticalTest(args as any);
      case 'check_assumptions':
        return await checkAssumptions(args as any);
      case 'validate_data':
        return await validateData(args as any);
      case 'calculate_power':
        return await calculatePower(args as any);
      case 'run_comprehensive_analysis':
        return await runComprehensiveAnalysis(args as any);

      // Citation Management Tools
      case 'manage_citations':
        return await manageCitations(args as any);
      case 'export_bibliography':
        return await exportBibliography(args as any);

      // Document Generation Tools
      case 'generate_document':
        return await generateDocument(args as any);
      case 'export_to_pdf':
        return await exportToPDF(args as any);

      // Open Access Tools
      case 'find_open_access':
        return await findOpenAccess(args as any);

      // Plagiarism Detection Tools
      case 'check_plagiarism':
        return await checkPlagiarism(args as any);
      case 'compare_documents':
        return await compareDocuments(args as any);
      case 'check_plagiarism_databases':
        return await checkPlagiarismAcrossDatabases(args as any);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MedResearch AI MCP server running on stdio');
}

main().catch((error) => {
  logger.error('Fatal error in main()', { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined });
  console.error('Fatal error in main():', error);
  process.exit(1);
});
