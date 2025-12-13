/**
 * PDF Report Generation
 * 
 * Generates comprehensive PDF reports for systematic reviews.
 * Combines PRISMA flowcharts, quality tables, forest plots, and SoF tables.
 * 
 * Note: This generates a text-based report structure. For actual PDF generation,
 * integrate with a PDF library like pdfkit or jsPDF.
 * 
 * @version 6.0.0-beta
 */

import { logger } from '../../common/logger.js';

/**
 * Report section
 */
export interface ReportSection {
  title: string;
  content: string;
  type: 'text' | 'table' | 'figure';
}

/**
 * Report metadata
 */
export interface ReportMetadata {
  title: string;
  authors: string[];
  date: string;
  version: string;
  protocol_registration?: string;
}

/**
 * Report configuration
 */
export interface ReportConfig {
  include_toc?: boolean;
  include_appendices?: boolean;
  include_references?: boolean;
}

/**
 * PDF report result
 */
export interface PDFReportResult {
  report: string;
  metadata: {
    total_sections: number;
    total_pages_estimated: number;
    word_count: number;
  };
  sections: string[];
}

/**
 * Create report header
 */
function createReportHeader(metadata: ReportMetadata): string[] {
  const lines: string[] = [];
  
  lines.push('');
  lines.push('═'.repeat(100));
  lines.push('');
  lines.push(`                    ${metadata.title.toUpperCase()}`);
  lines.push('');
  lines.push('                    SYSTEMATIC REVIEW AND META-ANALYSIS');
  lines.push('');
  lines.push('═'.repeat(100));
  lines.push('');
  lines.push(`Authors: ${metadata.authors.join(', ')}`);
  lines.push(`Date: ${metadata.date}`);
  lines.push(`Version: ${metadata.version}`);
  
  if (metadata.protocol_registration) {
    lines.push(`Protocol Registration: ${metadata.protocol_registration}`);
  }
  
  lines.push('');
  lines.push('─'.repeat(100));
  lines.push('');
  
  return lines;
}

/**
 * Create table of contents
 */
function createTableOfContents(sections: ReportSection[]): string[] {
  const lines: string[] = [];
  
  lines.push('TABLE OF CONTENTS');
  lines.push('');
  
  let sectionNumber = 1;
  for (const section of sections) {
    lines.push(`${sectionNumber}. ${section.title}`);
    sectionNumber++;
  }
  
  lines.push('');
  lines.push('─'.repeat(100));
  lines.push('');
  
  return lines;
}

/**
 * Create section
 */
function createSection(section: ReportSection, sectionNumber: number): string[] {
  const lines: string[] = [];
  
  lines.push('');
  lines.push(`${sectionNumber}. ${section.title.toUpperCase()}`);
  lines.push('─'.repeat(100));
  lines.push('');
  lines.push(section.content);
  lines.push('');
  
  return lines;
}

/**
 * Create abstract section
 */
function createAbstract(
  background: string,
  objectives: string,
  methods: string,
  results: string,
  conclusions: string
): ReportSection {
  const content = [
    'BACKGROUND',
    background,
    '',
    'OBJECTIVES',
    objectives,
    '',
    'METHODS',
    methods,
    '',
    'RESULTS',
    results,
    '',
    'CONCLUSIONS',
    conclusions,
  ].join('\n');
  
  return {
    title: 'Abstract',
    content,
    type: 'text',
  };
}

/**
 * Create methods section
 */
function createMethodsSection(
  searchStrategy: string,
  selectionCriteria: string,
  dataExtraction: string,
  qualityAssessment: string,
  dataAnalysis: string
): ReportSection {
  const content = [
    'Search Strategy',
    '─'.repeat(80),
    searchStrategy,
    '',
    'Selection Criteria',
    '─'.repeat(80),
    selectionCriteria,
    '',
    'Data Extraction',
    '─'.repeat(80),
    dataExtraction,
    '',
    'Quality Assessment',
    '─'.repeat(80),
    qualityAssessment,
    '',
    'Data Analysis',
    '─'.repeat(80),
    dataAnalysis,
  ].join('\n');
  
  return {
    title: 'Methods',
    content,
    type: 'text',
  };
}

/**
 * Create results section
 */
function createResultsSection(
  studySelection: string,
  studyCharacteristics: string,
  qualityResults: string,
  synthesisResults: string
): ReportSection {
  const content = [
    'Study Selection',
    '─'.repeat(80),
    studySelection,
    '',
    'Study Characteristics',
    '─'.repeat(80),
    studyCharacteristics,
    '',
    'Quality Assessment Results',
    '─'.repeat(80),
    qualityResults,
    '',
    'Synthesis Results',
    '─'.repeat(80),
    synthesisResults,
  ].join('\n');
  
  return {
    title: 'Results',
    content,
    type: 'text',
  };
}

/**
 * Create discussion section
 */
function createDiscussionSection(
  summary: string,
  strengths: string,
  limitations: string,
  implications: string
): ReportSection {
  const content = [
    'Summary of Main Results',
    '─'.repeat(80),
    summary,
    '',
    'Strengths and Limitations',
    '─'.repeat(80),
    `Strengths:\n${strengths}`,
    '',
    `Limitations:\n${limitations}`,
    '',
    'Implications for Practice and Research',
    '─'.repeat(80),
    implications,
  ].join('\n');
  
  return {
    title: 'Discussion',
    content,
    type: 'text',
  };
}

/**
 * Estimate page count
 */
function estimatePageCount(report: string): number {
  const lines = report.split('\n').length;
  const linesPerPage = 50;
  
  return Math.ceil(lines / linesPerPage);
}

/**
 * Count words
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Generate PDF report
 */
export function generatePDFReport(
  metadata: ReportMetadata,
  sections: ReportSection[],
  config: ReportConfig = {}
): PDFReportResult {
  logger.info('Generating PDF report', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    section_count: sections.length,
  });
  
  // Set defaults
  const includeTOC = config.include_toc !== false;
  
  // Build report
  const reportLines: string[] = [];
  
  // Header
  reportLines.push(...createReportHeader(metadata));
  
  // Table of contents
  if (includeTOC) {
    reportLines.push(...createTableOfContents(sections));
  }
  
  // Sections
  let sectionNumber = 1;
  for (const section of sections) {
    reportLines.push(...createSection(section, sectionNumber));
    sectionNumber++;
  }
  
  // Footer
  reportLines.push('');
  reportLines.push('═'.repeat(100));
  reportLines.push('');
  reportLines.push(`Generated by MedResearch-AI v${metadata.version}`);
  reportLines.push(`Date: ${new Date().toISOString()}`);
  reportLines.push('');
  reportLines.push('═'.repeat(100));
  
  const report = reportLines.join('\n');
  
  // Calculate metadata
  const totalPages = estimatePageCount(report);
  const wordCount = countWords(report);
  const sectionTitles = sections.map(s => s.title);
  
  const result: PDFReportResult = {
    report,
    metadata: {
      total_sections: sections.length,
      total_pages_estimated: totalPages,
      word_count: wordCount,
    },
    sections: sectionTitles,
  };
  
  logger.info('PDF report generated', {
    service: 'medresearch-ai',
    version: '6.0.0-beta',
    total_sections: sections.length,
    total_pages: totalPages,
    word_count: wordCount,
  });
  
  return result;
}

/**
 * Helper: Create standard systematic review report
 */
export function createStandardSystematicReviewReport(
  metadata: ReportMetadata,
  abstract: {
    background: string;
    objectives: string;
    methods: string;
    results: string;
    conclusions: string;
  },
  methods: {
    searchStrategy: string;
    selectionCriteria: string;
    dataExtraction: string;
    qualityAssessment: string;
    dataAnalysis: string;
  },
  results: {
    studySelection: string;
    studyCharacteristics: string;
    qualityResults: string;
    synthesisResults: string;
  },
  discussion: {
    summary: string;
    strengths: string;
    limitations: string;
    implications: string;
  },
  additionalSections: ReportSection[] = []
): PDFReportResult {
  const sections: ReportSection[] = [];
  
  // Standard sections
  sections.push(createAbstract(
    abstract.background,
    abstract.objectives,
    abstract.methods,
    abstract.results,
    abstract.conclusions
  ));
  
  sections.push(createMethodsSection(
    methods.searchStrategy,
    methods.selectionCriteria,
    methods.dataExtraction,
    methods.qualityAssessment,
    methods.dataAnalysis
  ));
  
  sections.push(createResultsSection(
    results.studySelection,
    results.studyCharacteristics,
    results.qualityResults,
    results.synthesisResults
  ));
  
  sections.push(createDiscussionSection(
    discussion.summary,
    discussion.strengths,
    discussion.limitations,
    discussion.implications
  ));
  
  // Additional sections (figures, tables, appendices)
  sections.push(...additionalSections);
  
  return generatePDFReport(metadata, sections);
}
