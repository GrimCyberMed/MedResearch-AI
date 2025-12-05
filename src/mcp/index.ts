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
import { verifyCitationsBatch } from './tools/citation-verification.js';
import { screenCitationsML } from './tools/ml-screening.js';
import { checkGrammarAdvanced } from './tools/grammar-checking.js';
import { checkPRISMACompliance } from './tools/prisma-compliance.js';
import { createProjectDashboard } from './tools/project-dashboard.js';
// Phase 2 Tools (v5.1.0)
import { extractDataNLP } from './tools/nlp-data-extraction.js';
import { detectDuplicates } from './tools/duplicate-detection.js';
import { assessStudyQuality } from './tools/study-quality-assessment.js';
import { formatCitations } from './tools/citation-formatting.js';
import { generateReferences } from './tools/reference-list-generation.js';
import { generateManuscriptTemplate } from './tools/manuscript-templates.js';
import { scoreResearchQuestion } from './tools/research-question-scoring.js';
import { extractPICO } from './tools/pico-extraction.js';
import { identifyGaps } from './tools/literature-gap-identification.js';
import { predictTimeline } from './tools/ml-timeline-prediction.js';

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

  // Phase 1 Tools (v5.0.0)
  {
    name: 'verify_citations_batch',
    description: 'Batch verification of citations (DOIs/PMIDs) against PubMed, CrossRef, and RetractionWatch with comprehensive verification reports',
    inputSchema: {
      type: 'object',
      properties: {
        citations: {
          type: 'array',
          description: 'Array of citations to verify',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['doi', 'pmid', 'pmcid'], description: 'Citation type' },
              id: { type: 'string', description: 'Citation identifier' },
            },
            required: ['type', 'id'],
          },
        },
        check_retractions: {
          type: 'boolean',
          description: 'Check for retraction notices',
          default: true,
        },
        check_corrections: {
          type: 'boolean',
          description: 'Check for correction notices',
          default: true,
        },
      },
      required: ['citations'],
    },
  },
  {
    name: 'screen_citations_ml',
    description: 'ML-based citation screening using TF-IDF relevance scoring for automated prioritization and time savings',
    inputSchema: {
      type: 'object',
      properties: {
        citations: {
          type: 'array',
          description: 'Array of citations to screen',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              abstract: { type: 'string' },
              authors: { type: 'array', items: { type: 'string' } },
              journal: { type: 'string' },
              year: { type: 'number' },
              keywords: { type: 'array', items: { type: 'string' } },
            },
            required: ['id', 'title'],
          },
        },
        inclusion_criteria: {
          type: 'array',
          items: { type: 'string' },
          description: 'Inclusion criteria keywords/phrases',
        },
        exclusion_criteria: {
          type: 'array',
          items: { type: 'string' },
          description: 'Exclusion criteria keywords/phrases',
        },
        relevance_threshold: {
          type: 'number',
          description: 'Relevance score threshold (0-1)',
          default: 0.3,
        },
      },
      required: ['citations', 'inclusion_criteria'],
    },
  },
  {
    name: 'check_grammar',
    description: 'Academic medical writing style enforcement with grammar, spelling, and clarity checking',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to check for grammar and style issues',
        },
        style: {
          type: 'string',
          enum: ['academic', 'medical', 'scientific'],
          description: 'Writing style to enforce',
          default: 'medical',
        },
        severity_filter: {
          type: 'string',
          enum: ['error', 'warning', 'suggestion', 'all'],
          description: 'Minimum severity level to report',
          default: 'warning',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'check_prisma_compliance',
    description: 'PRISMA 2020 automated compliance checking with 27-item checklist validation and scoring',
    inputSchema: {
      type: 'object',
      properties: {
        manuscript_text: {
          type: 'string',
          description: 'Full manuscript text to check for PRISMA compliance',
        },
        guideline: {
          type: 'string',
          enum: ['PRISMA_2020', 'PRISMA_P', 'CONSORT', 'STROBE'],
          description: 'Reporting guideline to check against',
          default: 'PRISMA_2020',
        },
        sections: {
          type: 'object',
          description: 'Manuscript sections (title, abstract, introduction, methods, results, discussion)',
          properties: {
            title: { type: 'string' },
            abstract: { type: 'string' },
            introduction: { type: 'string' },
            methods: { type: 'string' },
            results: { type: 'string' },
            discussion: { type: 'string' },
          },
        },
      },
      required: ['manuscript_text'],
    },
  },
  {
    name: 'create_project_dashboard',
    description: 'Create real-time HTML dashboard with Chart.js for project progress visualization and metrics tracking',
    inputSchema: {
      type: 'object',
      properties: {
        project_path: {
          type: 'string',
          description: 'Path to project directory',
        },
        project_name: {
          type: 'string',
          description: 'Project name',
        },
        metrics: {
          type: 'object',
          description: 'Project metrics',
          properties: {
            phase_progress: {
              type: 'object',
              description: 'Progress by phase (0-100%)',
            },
            citations_screened: { type: 'number' },
            citations_included: { type: 'number' },
            data_extracted: { type: 'number' },
            quality_score: { type: 'number', description: 'Overall quality score (0-100)' },
            timeline_status: {
              type: 'string',
              enum: ['on_track', 'ahead', 'delayed', 'unknown'],
            },
          },
        },
        output_path: {
          type: 'string',
          description: 'Output path for dashboard HTML file',
        },
        auto_refresh: {
          type: 'boolean',
          description: 'Enable auto-refresh every 30 seconds',
          default: false,
        },
      },
      required: ['project_path', 'project_name', 'metrics', 'output_path'],
    },
  },

  // Phase 2 Tools (v5.1.0) - Research Agent
  {
    name: 'extract_data_nlp',
    description: 'Extract study characteristics (PICO, sample size, outcomes) from full-text articles using NLP',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Full-text article or abstract to extract data from' },
        extract_pico: { type: 'boolean', description: 'Extract PICO elements (default: true)', default: true },
        extract_characteristics: { type: 'boolean', description: 'Extract study characteristics (default: true)', default: true },
        extract_outcomes: { type: 'boolean', description: 'Extract outcome data (default: true)', default: true },
        extract_tables: { type: 'boolean', description: 'Count tables and figures (default: true)', default: true },
        min_confidence: { type: 'number', description: 'Minimum confidence threshold (0-1, default: 0.3)', default: 0.3 },
      },
      required: ['text'],
    },
  },
  {
    name: 'detect_duplicates',
    description: 'Detect duplicate citations across databases using fuzzy matching and identifier cross-referencing',
    inputSchema: {
      type: 'object',
      properties: {
        citations: {
          type: 'array',
          description: 'Array of citations to check for duplicates',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              authors: { type: 'array', items: { type: 'string' } },
              year: { type: 'number' },
              journal: { type: 'string' },
              doi: { type: 'string' },
              pmid: { type: 'string' },
              pmcid: { type: 'string' },
              database: { type: 'string' },
            },
            required: ['id', 'title', 'authors', 'year', 'database'],
          },
        },
        min_confidence: { type: 'number', description: 'Minimum confidence threshold (0-1, default: 0.5)', default: 0.5 },
        check_identifiers: { type: 'boolean', description: 'Check DOI/PMID/PMCID (default: true)', default: true },
        check_title: { type: 'boolean', description: 'Check title similarity (default: true)', default: true },
        check_authors: { type: 'boolean', description: 'Check author overlap (default: true)', default: true },
        check_year: { type: 'boolean', description: 'Check publication year (default: true)', default: true },
      },
      required: ['citations'],
    },
  },
  {
    name: 'assess_study_quality',
    description: 'Automated risk of bias assessment using Cochrane RoB 2.0 and GRADE quality assessment',
    inputSchema: {
      type: 'object',
      properties: {
        study_text: { type: 'string', description: 'Full text or abstract of the study to assess' },
        study_type: {
          type: 'string',
          enum: ['rct', 'cohort', 'case_control', 'cross_sectional', 'systematic_review'],
          description: 'Type of study design',
        },
        assess_rob2: { type: 'boolean', description: 'Perform Cochrane RoB 2.0 assessment (default: true)', default: true },
        assess_grade: { type: 'boolean', description: 'Perform GRADE quality assessment (default: true)', default: true },
        detect_bias: { type: 'boolean', description: 'Detect bias indicators (default: true)', default: true },
      },
      required: ['study_text', 'study_type'],
    },
  },

  // Phase 2 Tools (v5.1.0) - Writer Agent
  {
    name: 'format_citations',
    description: 'Format citations in various styles (APA, Vancouver, Harvard, AMA, etc.) with in-text citation generation',
    inputSchema: {
      type: 'object',
      properties: {
        citations: {
          type: 'array',
          description: 'Array of citations to format',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              metadata: {
                type: 'object',
                properties: {
                  authors: { type: 'array', items: { type: 'string' } },
                  title: { type: 'string' },
                  journal: { type: 'string' },
                  year: { type: 'number' },
                  volume: { type: 'string' },
                  issue: { type: 'string' },
                  pages: { type: 'string' },
                  doi: { type: 'string' },
                  pmid: { type: 'string' },
                  url: { type: 'string' },
                },
                required: ['authors', 'title', 'journal', 'year'],
              },
            },
            required: ['id', 'metadata'],
          },
        },
        style: {
          type: 'string',
          enum: ['apa', 'vancouver', 'harvard', 'ama', 'chicago', 'mla', 'nature', 'science', 'nejm', 'jama'],
          description: 'Citation style to use',
        },
        include_doi: { type: 'boolean', description: 'Include DOI (default: true)', default: true },
        include_url: { type: 'boolean', description: 'Include URL (default: true)', default: true },
      },
      required: ['citations', 'style'],
    },
  },
  {
    name: 'generate_references',
    description: 'Auto-generate formatted reference lists with sorting, duplicate removal, and style-specific formatting',
    inputSchema: {
      type: 'object',
      properties: {
        citations: {
          type: 'array',
          description: 'Array of citations to include in reference list',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              metadata: {
                type: 'object',
                properties: {
                  authors: { type: 'array', items: { type: 'string' } },
                  title: { type: 'string' },
                  journal: { type: 'string' },
                  year: { type: 'number' },
                  volume: { type: 'string' },
                  issue: { type: 'string' },
                  pages: { type: 'string' },
                  doi: { type: 'string' },
                  pmid: { type: 'string' },
                },
                required: ['authors', 'title', 'journal', 'year'],
              },
            },
            required: ['id', 'metadata'],
          },
        },
        style: {
          type: 'string',
          enum: ['apa', 'vancouver', 'harvard', 'ama', 'chicago', 'mla', 'nature', 'science', 'nejm', 'jama'],
          description: 'Citation style to use',
        },
        sort_order: {
          type: 'string',
          enum: ['alphabetical', 'citation_order', 'chronological'],
          description: 'Sort order for references (default: alphabetical)',
          default: 'alphabetical',
        },
        remove_duplicates: { type: 'boolean', description: 'Remove duplicate citations (default: true)', default: true },
        include_doi: { type: 'boolean', description: 'Include DOI in references (default: true)', default: true },
        numbering: {
          type: 'string',
          enum: ['none', 'numeric', 'bracketed'],
          description: 'Numbering style for references (default: none)',
          default: 'none',
        },
      },
      required: ['citations', 'style'],
    },
  },
  {
    name: 'generate_manuscript_template',
    description: 'Generate journal-specific manuscript templates with PRISMA, CONSORT, or STROBE compliance',
    inputSchema: {
      type: 'object',
      properties: {
        template_type: {
          type: 'string',
          enum: ['prisma', 'consort', 'strobe', 'moose', 'arrive', 'care'],
          description: 'Type of reporting guideline template',
        },
        journal: {
          type: 'string',
          enum: ['jama', 'nejm', 'bmj', 'lancet', 'plos', 'nature', 'science', 'cochrane', 'generic'],
          description: 'Target journal',
        },
        title: { type: 'string', description: 'Manuscript title (optional)' },
        include_checklist: { type: 'boolean', description: 'Include checklist items (default: true)', default: true },
        include_word_counts: { type: 'boolean', description: 'Include word count limits (default: true)', default: true },
      },
      required: ['template_type', 'journal'],
    },
  },

  // Phase 2 Tools (v5.1.0) - Question Agent
  {
    name: 'score_research_question',
    description: 'Evaluate research questions using FINER criteria and PICO/SPIDER completeness scoring',
    inputSchema: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'Research question to evaluate' },
        context: { type: 'string', description: 'Additional context about the research (optional)' },
        framework: {
          type: 'string',
          enum: ['pico', 'spider', 'finer'],
          description: 'Evaluation framework (default: pico)',
          default: 'pico',
        },
      },
      required: ['question'],
    },
  },
  {
    name: 'extract_pico',
    description: 'Extract PICO elements (Population, Intervention, Comparator, Outcome) from research questions and abstracts',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Research question or abstract to extract PICO from' },
        generate_search_terms: { type: 'boolean', description: 'Generate search terms from PICO elements (default: true)', default: true },
        validate_completeness: { type: 'boolean', description: 'Validate PICO completeness (default: true)', default: true },
      },
      required: ['text'],
    },
  },
  {
    name: 'identify_gaps',
    description: 'Systematically identify research gaps through topic clustering, temporal analysis, and methodological gap detection',
    inputSchema: {
      type: 'object',
      properties: {
        studies: {
          type: 'array',
          description: 'Array of studies to analyze for gaps',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              abstract: { type: 'string' },
              year: { type: 'number' },
              study_design: { type: 'string' },
              population: { type: 'string' },
              intervention: { type: 'string' },
              outcome: { type: 'string' },
              geographic_location: { type: 'string' },
            },
            required: ['id', 'title', 'abstract', 'year', 'study_design'],
          },
        },
        min_confidence: { type: 'number', description: 'Minimum confidence threshold (0-1, default: 0.5)', default: 0.5 },
        identify_temporal_gaps: { type: 'boolean', description: 'Identify temporal gaps (default: true)', default: true },
        identify_methodological_gaps: { type: 'boolean', description: 'Identify methodological gaps (default: true)', default: true },
        identify_population_gaps: { type: 'boolean', description: 'Identify population gaps (default: true)', default: true },
        identify_geographic_gaps: { type: 'boolean', description: 'Identify geographic gaps (default: true)', default: true },
      },
      required: ['studies'],
    },
  },

  // Phase 2 Tools (v5.1.0) - Planner Agent
  {
    name: 'predict_timeline',
    description: 'Machine learning-based project timeline forecasting for systematic reviews with risk identification',
    inputSchema: {
      type: 'object',
      properties: {
        project_params: {
          type: 'object',
          properties: {
            total_citations: { type: 'number', description: 'Total number of citations to screen' },
            databases_searched: { type: 'number', description: 'Number of databases searched' },
            reviewers_count: { type: 'number', description: 'Number of reviewers on the team' },
            study_type: {
              type: 'string',
              enum: ['rct', 'observational', 'mixed', 'qualitative'],
              description: 'Primary study type',
            },
            meta_analysis_planned: { type: 'boolean', description: 'Whether meta-analysis is planned' },
            team_experience: {
              type: 'string',
              enum: ['novice', 'intermediate', 'expert'],
              description: 'Team experience level',
            },
            complexity: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Project complexity level',
            },
          },
          required: ['total_citations', 'databases_searched', 'reviewers_count', 'study_type', 'meta_analysis_planned', 'team_experience', 'complexity'],
        },
        include_confidence_intervals: { type: 'boolean', description: 'Include confidence intervals (default: true)', default: true },
        identify_risks: { type: 'boolean', description: 'Identify risk factors (default: true)', default: true },
        suggest_resources: { type: 'boolean', description: 'Suggest resource allocations (default: true)', default: true },
      },
      required: ['project_params'],
    },
  },
];

/**
 * Initialize MCP server
 */
const server = new Server(
  {
    name: 'medresearch-ai-mcp',
    version: '5.1.0',
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

      // Phase 1 Tools (v5.0.0)
      case 'verify_citations_batch':
        return await verifyCitationsBatch(args as any);
      case 'screen_citations_ml':
        return await screenCitationsML(args as any);
      case 'check_grammar':
        return await checkGrammarAdvanced(args as any);
      case 'check_prisma_compliance':
        return await checkPRISMACompliance(args as any);
      case 'create_project_dashboard':
        return await createProjectDashboard(args as any);

      // Phase 2 Tools (v5.1.0)
      case 'extract_data_nlp':
        return await extractDataNLP(args as any);
      case 'detect_duplicates':
        return await detectDuplicates(args as any);
      case 'assess_study_quality':
        return await assessStudyQuality(args as any);
      case 'format_citations':
        return await formatCitations(args as any);
      case 'generate_references':
        return await generateReferences(args as any);
      case 'generate_manuscript_template':
        return await generateManuscriptTemplate(args as any);
      case 'score_research_question':
        return await scoreResearchQuestion(args as any);
      case 'extract_pico':
        return await extractPICO(args as any);
      case 'identify_gaps':
        return await identifyGaps(args as any);
      case 'predict_timeline':
        return await predictTimeline(args as any);

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
