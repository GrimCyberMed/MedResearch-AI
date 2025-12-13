/**
 * Export Formats Tool
 * 
 * Exports systematic review data in multiple formats:
 * - CSV: For spreadsheet analysis and data manipulation
 * - JSON: For data interchange and programmatic access
 * - XML: For Cochrane RevMan compatibility
 * 
 * Features:
 * - Export studies with metadata
 * - Export quality assessments
 * - Export meta-analysis results
 * - Export PICO elements
 * - RevMan XML format support
 * - Customizable field selection
 * - UTF-8 encoding support
 * 
 * @version 6.0.0-beta
 * @since Phase 10.6
 */

import { logger } from '../../common/logger.js';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Study {
  study_id: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  doi?: string;
  pmid?: string;
  study_design: string;
  population?: string;
  intervention?: string;
  comparison?: string;
  outcomes?: string[];
  sample_size?: number;
  quality_score?: number;
  risk_of_bias?: string;
}

export interface MetaAnalysisResult {
  outcome: string;
  measure: string;
  model: string;
  pooled_effect: number;
  ci_lower: number;
  ci_upper: number;
  p_value: number;
  i_squared: number;
  studies_included: number;
  total_participants: number;
}

export interface SystematicReviewData {
  review_title: string;
  review_authors: string[];
  review_date: string;
  studies: Study[];
  meta_analyses?: MetaAnalysisResult[];
  pico?: {
    population: string;
    intervention: string;
    comparison: string;
    outcomes: string[];
  };
}

export interface ExportOptions {
  include_metadata?: boolean;
  include_quality?: boolean;
  include_meta_analysis?: boolean;
  fields?: string[];
  delimiter?: string; // For CSV
  pretty_print?: boolean; // For JSON
}

export interface ExportResult {
  success: boolean;
  format: 'csv' | 'json' | 'xml';
  data: string;
  size_bytes: number;
  record_count: number;
  message: string;
}

// ============================================================================
// CSV EXPORT
// ============================================================================

class CSVExporter {
  /**
   * Export studies to CSV
   */
  exportStudies(studies: Study[], options: ExportOptions = {}): ExportResult {
    logger.info('Exporting studies to CSV', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      count: studies.length,
    });
    
    const delimiter = options.delimiter || ',';
    const fields = options.fields || [
      'study_id',
      'title',
      'authors',
      'year',
      'journal',
      'doi',
      'pmid',
      'study_design',
      'sample_size',
      'quality_score',
      'risk_of_bias',
    ];
    
    // Build CSV header
    const header = fields.join(delimiter);
    
    // Build CSV rows
    const rows = studies.map(study => {
      return fields.map(field => {
        let value = study[field as keyof Study];
        
        // Handle arrays (e.g., authors)
        if (Array.isArray(value)) {
          value = value.join('; ');
        }
        
        // Handle undefined/null
        if (value === undefined || value === null) {
          value = '';
        }
        
        // Escape quotes and wrap in quotes if contains delimiter or quotes
        const stringValue = String(value);
        if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      }).join(delimiter);
    });
    
    const csv = [header, ...rows].join('\n');
    
    logger.info('CSV export complete', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      records: studies.length,
      size: csv.length,
    });
    
    return {
      success: true,
      format: 'csv',
      data: csv,
      size_bytes: csv.length,
      record_count: studies.length,
      message: `Successfully exported ${studies.length} studies to CSV`,
    };
  }
  
  /**
   * Export meta-analysis results to CSV
   */
  exportMetaAnalyses(metaAnalyses: MetaAnalysisResult[], options: ExportOptions = {}): ExportResult {
    logger.info('Exporting meta-analyses to CSV', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      count: metaAnalyses.length,
    });
    
    const delimiter = options.delimiter || ',';
    const fields = [
      'outcome',
      'measure',
      'model',
      'pooled_effect',
      'ci_lower',
      'ci_upper',
      'p_value',
      'i_squared',
      'studies_included',
      'total_participants',
    ];
    
    const header = fields.join(delimiter);
    const rows = metaAnalyses.map(ma => {
      return fields.map(field => String(ma[field as keyof MetaAnalysisResult] || '')).join(delimiter);
    });
    
    const csv = [header, ...rows].join('\n');
    
    return {
      success: true,
      format: 'csv',
      data: csv,
      size_bytes: csv.length,
      record_count: metaAnalyses.length,
      message: `Successfully exported ${metaAnalyses.length} meta-analyses to CSV`,
    };
  }
}

// ============================================================================
// JSON EXPORT
// ============================================================================

class JSONExporter {
  /**
   * Export systematic review data to JSON
   */
  exportReview(reviewData: SystematicReviewData, options: ExportOptions = {}): ExportResult {
    logger.info('Exporting systematic review to JSON', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      studies: reviewData.studies.length,
    });
    
    const prettyPrint = options.pretty_print !== false; // Default to true
    const json = prettyPrint 
      ? JSON.stringify(reviewData, null, 2)
      : JSON.stringify(reviewData);
    
    logger.info('JSON export complete', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      size: json.length,
    });
    
    return {
      success: true,
      format: 'json',
      data: json,
      size_bytes: json.length,
      record_count: reviewData.studies.length,
      message: `Successfully exported systematic review to JSON`,
    };
  }
  
  /**
   * Export studies to JSON
   */
  exportStudies(studies: Study[], options: ExportOptions = {}): ExportResult {
    logger.info('Exporting studies to JSON', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      count: studies.length,
    });
    
    const prettyPrint = options.pretty_print !== false;
    const json = prettyPrint 
      ? JSON.stringify(studies, null, 2)
      : JSON.stringify(studies);
    
    return {
      success: true,
      format: 'json',
      data: json,
      size_bytes: json.length,
      record_count: studies.length,
      message: `Successfully exported ${studies.length} studies to JSON`,
    };
  }
}

// ============================================================================
// XML EXPORT (RevMan Format)
// ============================================================================

class XMLExporter {
  /**
   * Export systematic review to RevMan XML format
   */
  exportRevManXML(reviewData: SystematicReviewData, options: ExportOptions = {}): ExportResult {
    // Note: options parameter reserved for future use (e.g., XML formatting options)
    void options;
    
    logger.info('Exporting systematic review to RevMan XML', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      studies: reviewData.studies.length,
    });
    
    const xml = this.buildRevManXML(reviewData);
    
    logger.info('RevMan XML export complete', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      size: xml.length,
    });
    
    return {
      success: true,
      format: 'xml',
      data: xml,
      size_bytes: xml.length,
      record_count: reviewData.studies.length,
      message: `Successfully exported systematic review to RevMan XML`,
    };
  }
  
  /**
   * Build RevMan XML structure
   */
  private buildRevManXML(reviewData: SystematicReviewData): string {
    const escapedTitle = this.escapeXML(reviewData.review_title);
    const escapedAuthors = reviewData.review_authors.map(a => this.escapeXML(a)).join(', ');
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<COCHRANE_REVIEW>
  <COVER_SHEET>
    <TITLE>${escapedTitle}</TITLE>
    <CONTACT>
      <PERSON>${escapedAuthors}</PERSON>
    </CONTACT>
    <DATES>
      <LAST_UPDATE>${reviewData.review_date}</LAST_UPDATE>
    </DATES>
  </COVER_SHEET>
  
  <MAIN_TEXT>
    <SUMMARY>
      <TITLE>Plain language summary</TITLE>
`;
    
    // Add PICO if available
    if (reviewData.pico) {
      xml += `      <PICO>
        <POPULATION>${this.escapeXML(reviewData.pico.population)}</POPULATION>
        <INTERVENTION>${this.escapeXML(reviewData.pico.intervention)}</INTERVENTION>
        <COMPARISON>${this.escapeXML(reviewData.pico.comparison)}</COMPARISON>
        <OUTCOMES>
${reviewData.pico.outcomes.map(o => `          <OUTCOME>${this.escapeXML(o)}</OUTCOME>`).join('\n')}
        </OUTCOMES>
      </PICO>
`;
    }
    
    xml += `    </SUMMARY>
  </MAIN_TEXT>
  
  <STUDIES_AND_REFERENCES>
    <STUDIES>
`;
    
    // Add studies
    reviewData.studies.forEach(study => {
      xml += `      <STUDY>
        <STUDY_ID>${this.escapeXML(study.study_id)}</STUDY_ID>
        <TITLE>${this.escapeXML(study.title)}</TITLE>
        <AUTHORS>${this.escapeXML(study.authors.join(', '))}</AUTHORS>
        <YEAR>${study.year}</YEAR>
        ${study.journal ? `<JOURNAL>${this.escapeXML(study.journal)}</JOURNAL>` : ''}
        ${study.doi ? `<DOI>${this.escapeXML(study.doi)}</DOI>` : ''}
        ${study.pmid ? `<PMID>${study.pmid}</PMID>` : ''}
        <STUDY_DESIGN>${this.escapeXML(study.study_design)}</STUDY_DESIGN>
        ${study.sample_size ? `<SAMPLE_SIZE>${study.sample_size}</SAMPLE_SIZE>` : ''}
        ${study.risk_of_bias ? `<RISK_OF_BIAS>${this.escapeXML(study.risk_of_bias)}</RISK_OF_BIAS>` : ''}
      </STUDY>
`;
    });
    
    xml += `    </STUDIES>
  </STUDIES_AND_REFERENCES>
`;
    
    // Add meta-analyses if available
    if (reviewData.meta_analyses && reviewData.meta_analyses.length > 0) {
      xml += `  <DATA_AND_ANALYSES>
    <COMPARISONS>
`;
      
      reviewData.meta_analyses.forEach((ma, index) => {
        xml += `      <COMPARISON ID="CMP${index + 1}">
        <OUTCOME>${this.escapeXML(ma.outcome)}</OUTCOME>
        <MEASURE>${this.escapeXML(ma.measure)}</MEASURE>
        <MODEL>${this.escapeXML(ma.model)}</MODEL>
        <POOLED_EFFECT>${ma.pooled_effect}</POOLED_EFFECT>
        <CI_LOWER>${ma.ci_lower}</CI_LOWER>
        <CI_UPPER>${ma.ci_upper}</CI_UPPER>
        <P_VALUE>${ma.p_value}</P_VALUE>
        <I_SQUARED>${ma.i_squared}</I_SQUARED>
        <STUDIES_INCLUDED>${ma.studies_included}</STUDIES_INCLUDED>
        <TOTAL_PARTICIPANTS>${ma.total_participants}</TOTAL_PARTICIPANTS>
      </COMPARISON>
`;
      });
      
      xml += `    </COMPARISONS>
  </DATA_AND_ANALYSES>
`;
    }
    
    xml += `</COCHRANE_REVIEW>`;
    
    return xml;
  }
  
  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// ============================================================================
// MCP TOOL FUNCTIONS
// ============================================================================

/**
 * Export studies to CSV
 */
export function exportStudiesToCSV(studies: Study[], options: ExportOptions = {}): ExportResult {
  const exporter = new CSVExporter();
  return exporter.exportStudies(studies, options);
}

/**
 * Export meta-analyses to CSV
 */
export function exportMetaAnalysesToCSV(metaAnalyses: MetaAnalysisResult[], options: ExportOptions = {}): ExportResult {
  const exporter = new CSVExporter();
  return exporter.exportMetaAnalyses(metaAnalyses, options);
}

/**
 * Export systematic review to JSON
 */
export function exportReviewToJSON(reviewData: SystematicReviewData, options: ExportOptions = {}): ExportResult {
  const exporter = new JSONExporter();
  return exporter.exportReview(reviewData, options);
}

/**
 * Export studies to JSON
 */
export function exportStudiesToJSON(studies: Study[], options: ExportOptions = {}): ExportResult {
  const exporter = new JSONExporter();
  return exporter.exportStudies(studies, options);
}

/**
 * Export systematic review to RevMan XML
 */
export function exportReviewToRevManXML(reviewData: SystematicReviewData, options: ExportOptions = {}): ExportResult {
  const exporter = new XMLExporter();
  return exporter.exportRevManXML(reviewData, options);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  exportStudiesToCSV,
  exportMetaAnalysesToCSV,
  exportReviewToJSON,
  exportStudiesToJSON,
  exportReviewToRevManXML,
};
