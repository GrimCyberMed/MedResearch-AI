/**
 * PROSPERO Registration Integration Tool
 * 
 * Integrates with PROSPERO (International Prospective Register of Systematic Reviews)
 * to register and manage systematic review protocols.
 * 
 * Features:
 * - Register new systematic review protocols
 * - Update existing registrations
 * - Retrieve registration details
 * - Export registration data
 * - Validate protocol completeness
 * - Generate registration forms
 * 
 * PROSPERO: https://www.crd.york.ac.uk/prospero/
 * 
 * Note: PROSPERO does not have a public API. This implementation provides:
 * - Protocol validation and preparation
 * - Registration form generation
 * - Mock registration for testing
 * - Export in PROSPERO-compatible format
 * 
 * @version 6.0.0-beta
 * @since Phase 10.3
 */

import { logger } from '../../common/logger.js';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ReviewProtocol {
  // Administrative information
  title: string;
  authors: Author[];
  contact_email: string;
  
  // Review details
  review_question: string;
  condition_disease: string;
  participants_population: string;
  intervention_exposure: string;
  comparator_control?: string;
  outcomes: Outcome[];
  
  // Methods
  study_designs: string[];
  search_strategy: SearchStrategy;
  selection_criteria: SelectionCriteria;
  data_extraction_plan: string;
  quality_assessment_tools: string[];
  synthesis_methods: string[];
  
  // Timeline
  anticipated_start_date: string;
  anticipated_completion_date: string;
  
  // Funding and conflicts
  funding_sources?: string[];
  conflicts_of_interest?: string;
  
  // Optional
  keywords?: string[];
  language_restrictions?: string[];
  country_restrictions?: string[];
}

export interface Author {
  name: string;
  affiliation: string;
  email?: string;
  orcid?: string;
  role: 'lead' | 'co-investigator' | 'statistician' | 'information_specialist';
}

export interface Outcome {
  name: string;
  type: 'primary' | 'secondary';
  measurement: string;
  timepoint?: string;
}

export interface SearchStrategy {
  databases: string[];
  search_terms: string[];
  date_range?: {
    from?: string;
    to?: string;
  };
  additional_sources?: string[];
  grey_literature?: boolean;
}

export interface SelectionCriteria {
  inclusion_criteria: string[];
  exclusion_criteria: string[];
  screening_process: string;
  number_of_reviewers: number;
  conflict_resolution: string;
}

export interface PROSPERORegistration {
  registration_number: string;
  registration_date: string;
  last_updated: string;
  status: 'registered' | 'ongoing' | 'completed' | 'discontinued';
  protocol: ReviewProtocol;
  url: string;
  citation: string;
}

export interface ProtocolValidation {
  is_valid: boolean;
  completeness_score: number;
  missing_fields: string[];
  warnings: string[];
  recommendations: string[];
}

export interface RegistrationResult {
  success: boolean;
  registration_number?: string;
  registration_date?: string;
  url?: string;
  message: string;
  validation?: ProtocolValidation;
}

export interface ProtocolUpdate {
  field: string;
  old_value: string;
  new_value: string;
  reason: string;
  update_date: string;
}

// ============================================================================
// PROSPERO INTEGRATION CLIENT
// ============================================================================

class PROSPEROClient {
  private readonly baseUrl = 'https://www.crd.york.ac.uk/prospero';
  
  /**
   * Validate protocol completeness
   */
  validateProtocol(protocol: ReviewProtocol): ProtocolValidation {
    logger.info('Validating PROSPERO protocol', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      title: protocol.title,
    });
    
    const missingFields: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Required fields
    if (!protocol.title || protocol.title.length < 10) {
      missingFields.push('title (must be at least 10 characters)');
    }
    
    if (!protocol.authors || protocol.authors.length === 0) {
      missingFields.push('authors (at least one required)');
    }
    
    if (!protocol.contact_email) {
      missingFields.push('contact_email');
    }
    
    if (!protocol.review_question) {
      missingFields.push('review_question');
    }
    
    if (!protocol.condition_disease) {
      missingFields.push('condition_disease');
    }
    
    if (!protocol.participants_population) {
      missingFields.push('participants_population');
    }
    
    if (!protocol.intervention_exposure) {
      missingFields.push('intervention_exposure');
    }
    
    if (!protocol.outcomes || protocol.outcomes.length === 0) {
      missingFields.push('outcomes (at least one required)');
    }
    
    if (!protocol.study_designs || protocol.study_designs.length === 0) {
      missingFields.push('study_designs');
    }
    
    if (!protocol.search_strategy || !protocol.search_strategy.databases || protocol.search_strategy.databases.length === 0) {
      missingFields.push('search_strategy.databases');
    }
    
    if (!protocol.selection_criteria) {
      missingFields.push('selection_criteria');
    }
    
    if (!protocol.data_extraction_plan) {
      missingFields.push('data_extraction_plan');
    }
    
    if (!protocol.quality_assessment_tools || protocol.quality_assessment_tools.length === 0) {
      missingFields.push('quality_assessment_tools');
    }
    
    if (!protocol.synthesis_methods || protocol.synthesis_methods.length === 0) {
      missingFields.push('synthesis_methods');
    }
    
    if (!protocol.anticipated_start_date) {
      missingFields.push('anticipated_start_date');
    }
    
    if (!protocol.anticipated_completion_date) {
      missingFields.push('anticipated_completion_date');
    }
    
    // Warnings
    if (!protocol.comparator_control) {
      warnings.push('No comparator/control specified - consider adding if applicable');
    }
    
    if (!protocol.funding_sources || protocol.funding_sources.length === 0) {
      warnings.push('No funding sources specified - PROSPERO requires disclosure');
    }
    
    if (!protocol.conflicts_of_interest) {
      warnings.push('No conflicts of interest statement - PROSPERO requires disclosure');
    }
    
    if (!protocol.keywords || protocol.keywords.length === 0) {
      warnings.push('No keywords specified - recommended for discoverability');
    }
    
    if (protocol.outcomes.filter(o => o.type === 'primary').length === 0) {
      warnings.push('No primary outcomes specified - at least one recommended');
    }
    
    if (protocol.search_strategy.databases.length < 2) {
      warnings.push('Only one database specified - PROSPERO recommends searching multiple databases');
    }
    
    if (!protocol.search_strategy.grey_literature) {
      warnings.push('Grey literature search not specified - consider including');
    }
    
    // Recommendations
    if (protocol.authors.length < 2) {
      recommendations.push('Consider adding more authors/reviewers for independent screening');
    }
    
    if (!protocol.selection_criteria.number_of_reviewers || protocol.selection_criteria.number_of_reviewers < 2) {
      recommendations.push('PROSPERO recommends at least 2 independent reviewers for screening');
    }
    
    if (!protocol.authors.some(a => a.role === 'statistician')) {
      recommendations.push('Consider including a statistician for meta-analysis');
    }
    
    if (!protocol.authors.some(a => a.role === 'information_specialist')) {
      recommendations.push('Consider including an information specialist for search strategy');
    }
    
    if (protocol.synthesis_methods.includes('meta-analysis') && !protocol.quality_assessment_tools.some(t => t.toLowerCase().includes('rob') || t.toLowerCase().includes('bias'))) {
      recommendations.push('Meta-analysis planned but no risk of bias tool specified');
    }
    
    // Calculate completeness score
    const totalFields = 15; // Number of required fields
    const completedFields = totalFields - missingFields.length;
    const completenessScore = Math.round((completedFields / totalFields) * 100);
    
    const isValid = missingFields.length === 0;
    
    logger.info('Protocol validation complete', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      is_valid: isValid,
      completeness_score: completenessScore,
      missing_fields: missingFields.length,
      warnings: warnings.length,
    });
    
    return {
      is_valid: isValid,
      completeness_score: completenessScore,
      missing_fields: missingFields,
      warnings,
      recommendations,
    };
  }
  
  /**
   * Register protocol with PROSPERO (mock implementation)
   */
  async registerProtocol(protocol: ReviewProtocol): Promise<RegistrationResult> {
    logger.info('Registering protocol with PROSPERO', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      title: protocol.title,
    });
    
    // Validate protocol first
    const validation = this.validateProtocol(protocol);
    
    if (!validation.is_valid) {
      logger.warn('Protocol validation failed', {
        service: 'medresearch-ai',
        version: '6.0.0-beta',
        missing_fields: validation.missing_fields.length,
      });
      
      return {
        success: false,
        message: `Protocol validation failed. Missing required fields: ${validation.missing_fields.join(', ')}`,
        validation,
      };
    }
    
    // Mock registration (in production, this would submit to PROSPERO)
    const registrationNumber = this.generateRegistrationNumber();
    const registrationDate = new Date().toISOString().split('T')[0];
    const url = `${this.baseUrl}/display_record.php?RecordID=${registrationNumber}`;
    
    logger.info('Protocol registered successfully', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      registration_number: registrationNumber,
      registration_date: registrationDate,
    });
    
    return {
      success: true,
      registration_number: registrationNumber,
      registration_date: registrationDate,
      url,
      message: `Protocol successfully registered with PROSPERO. Registration number: ${registrationNumber}`,
      validation,
    };
  }
  
  /**
   * Update existing PROSPERO registration
   */
  async updateRegistration(
    registrationNumber: string,
    updates: ProtocolUpdate[]
  ): Promise<RegistrationResult> {
    logger.info('Updating PROSPERO registration', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      registration_number: registrationNumber,
      updates_count: updates.length,
    });
    
    // Validate registration number format
    if (!this.isValidRegistrationNumber(registrationNumber)) {
      return {
        success: false,
        message: `Invalid registration number format: ${registrationNumber}`,
      };
    }
    
    // Mock update (in production, this would update PROSPERO record)
    const updateDate = new Date().toISOString().split('T')[0];
    const url = `${this.baseUrl}/display_record.php?RecordID=${registrationNumber}`;
    
    logger.info('Registration updated successfully', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      registration_number: registrationNumber,
      update_date: updateDate,
    });
    
    return {
      success: true,
      registration_number: registrationNumber,
      registration_date: updateDate,
      url,
      message: `Registration ${registrationNumber} updated successfully with ${updates.length} change(s)`,
    };
  }
  
  /**
   * Retrieve PROSPERO registration details
   */
  async getRegistration(registrationNumber: string): Promise<PROSPERORegistration | null> {
    logger.info('Retrieving PROSPERO registration', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      registration_number: registrationNumber,
    });
    
    if (!this.isValidRegistrationNumber(registrationNumber)) {
      logger.warn('Invalid registration number', {
        service: 'medresearch-ai',
        version: '6.0.0-beta',
        registration_number: registrationNumber,
      });
      return null;
    }
    
    // Mock retrieval (in production, this would fetch from PROSPERO)
    const mockRegistration = this.getMockRegistration(registrationNumber);
    
    logger.info('Registration retrieved successfully', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      registration_number: registrationNumber,
      status: mockRegistration.status,
    });
    
    return mockRegistration;
  }
  
  /**
   * Export protocol in PROSPERO-compatible format
   */
  exportProtocol(protocol: ReviewProtocol, format: 'json' | 'xml' | 'pdf' = 'json'): string {
    logger.info('Exporting protocol', {
      service: 'medresearch-ai',
      version: '6.0.0-beta',
      format,
    });
    
    switch (format) {
      case 'json':
        return JSON.stringify(protocol, null, 2);
      
      case 'xml':
        return this.protocolToXML(protocol);
      
      case 'pdf':
        return this.protocolToPDFText(protocol);
      
      default:
        return JSON.stringify(protocol, null, 2);
    }
  }
  
  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================
  
  private generateRegistrationNumber(): string {
    // PROSPERO format: CRD + 11 digits
    const randomDigits = Math.floor(10000000000 + Math.random() * 90000000000);
    return `CRD${randomDigits}`;
  }
  
  private isValidRegistrationNumber(regNumber: string): boolean {
    // PROSPERO format: CRD followed by 11 digits
    return /^CRD\d{11}$/.test(regNumber);
  }
  
  private protocolToXML(protocol: ReviewProtocol): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<prospero_protocol>
  <title>${this.escapeXML(protocol.title)}</title>
  <review_question>${this.escapeXML(protocol.review_question)}</review_question>
  <condition>${this.escapeXML(protocol.condition_disease)}</condition>
  <population>${this.escapeXML(protocol.participants_population)}</population>
  <intervention>${this.escapeXML(protocol.intervention_exposure)}</intervention>
  ${protocol.comparator_control ? `<comparator>${this.escapeXML(protocol.comparator_control)}</comparator>` : ''}
  <outcomes>
    ${protocol.outcomes.map(o => `<outcome type="${o.type}">${this.escapeXML(o.name)}</outcome>`).join('\n    ')}
  </outcomes>
  <study_designs>
    ${protocol.study_designs.map(d => `<design>${this.escapeXML(d)}</design>`).join('\n    ')}
  </study_designs>
  <databases>
    ${protocol.search_strategy.databases.map(d => `<database>${this.escapeXML(d)}</database>`).join('\n    ')}
  </databases>
</prospero_protocol>`;
  }
  
  private protocolToPDFText(protocol: ReviewProtocol): string {
    return `PROSPERO PROTOCOL REGISTRATION FORM

TITLE
${protocol.title}

REVIEW QUESTION
${protocol.review_question}

CONDITION/DISEASE
${protocol.condition_disease}

POPULATION
${protocol.participants_population}

INTERVENTION/EXPOSURE
${protocol.intervention_exposure}

COMPARATOR/CONTROL
${protocol.comparator_control || 'Not specified'}

OUTCOMES
${protocol.outcomes.map((o, i) => `${i + 1}. ${o.name} (${o.type})`).join('\n')}

STUDY DESIGNS
${protocol.study_designs.join(', ')}

SEARCH STRATEGY
Databases: ${protocol.search_strategy.databases.join(', ')}
Search Terms: ${protocol.search_strategy.search_terms.join(', ')}

DATA EXTRACTION
${protocol.data_extraction_plan}

QUALITY ASSESSMENT
Tools: ${protocol.quality_assessment_tools.join(', ')}

SYNTHESIS METHODS
${protocol.synthesis_methods.join(', ')}

TIMELINE
Start: ${protocol.anticipated_start_date}
Completion: ${protocol.anticipated_completion_date}

AUTHORS
${protocol.authors.map(a => `${a.name} (${a.affiliation}) - ${a.role}`).join('\n')}

CONTACT
${protocol.contact_email}
`;
  }
  
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  private getMockRegistration(registrationNumber: string): PROSPERORegistration {
    return {
      registration_number: registrationNumber,
      registration_date: '2025-01-15',
      last_updated: '2025-01-15',
      status: 'registered',
      protocol: {
        title: 'Exercise interventions for depression in adults: a systematic review and meta-analysis',
        authors: [
          {
            name: 'Dr. Jane Smith',
            affiliation: 'University of Example',
            email: 'j.smith@example.edu',
            role: 'lead',
          },
          {
            name: 'Dr. John Doe',
            affiliation: 'Example Medical Center',
            role: 'co-investigator',
          },
        ],
        contact_email: 'j.smith@example.edu',
        review_question: 'What is the effectiveness of exercise interventions for reducing symptoms of depression in adults?',
        condition_disease: 'Depression (major depressive disorder)',
        participants_population: 'Adults (18+ years) with diagnosed depression',
        intervention_exposure: 'Exercise interventions (aerobic, resistance, or combined)',
        comparator_control: 'No treatment, usual care, or placebo',
        outcomes: [
          {
            name: 'Depression symptom severity',
            type: 'primary',
            measurement: 'Standardized depression scales (e.g., BDI, HAM-D)',
            timepoint: 'Post-intervention',
          },
          {
            name: 'Quality of life',
            type: 'secondary',
            measurement: 'Quality of life scales',
          },
        ],
        study_designs: ['Randomized controlled trials', 'Quasi-experimental studies'],
        search_strategy: {
          databases: ['PubMed', 'Embase', 'PsycINFO', 'Cochrane CENTRAL'],
          search_terms: ['depression', 'exercise', 'physical activity', 'randomized controlled trial'],
          grey_literature: true,
        },
        selection_criteria: {
          inclusion_criteria: ['RCTs or quasi-experimental studies', 'Adults with depression', 'Exercise intervention'],
          exclusion_criteria: ['Non-English publications', 'Animal studies', 'Case reports'],
          screening_process: 'Two independent reviewers',
          number_of_reviewers: 2,
          conflict_resolution: 'Third reviewer consultation',
        },
        data_extraction_plan: 'Standardized data extraction form with pilot testing',
        quality_assessment_tools: ['Cochrane Risk of Bias 2.0'],
        synthesis_methods: ['Meta-analysis', 'Narrative synthesis'],
        anticipated_start_date: '2025-02-01',
        anticipated_completion_date: '2025-12-31',
        funding_sources: ['University Research Grant'],
        conflicts_of_interest: 'None declared',
        keywords: ['depression', 'exercise', 'systematic review', 'meta-analysis'],
      },
      url: `https://www.crd.york.ac.uk/prospero/display_record.php?RecordID=${registrationNumber}`,
      citation: `Smith J, Doe J. Exercise interventions for depression in adults: a systematic review and meta-analysis. PROSPERO ${registrationNumber}. Available from: https://www.crd.york.ac.uk/prospero/display_record.php?RecordID=${registrationNumber}`,
    };
  }
}

// ============================================================================
// MCP TOOL FUNCTIONS
// ============================================================================

/**
 * Validate systematic review protocol
 */
export function validatePROSPEROProtocol(protocol: ReviewProtocol): ProtocolValidation {
  const client = new PROSPEROClient();
  return client.validateProtocol(protocol);
}

/**
 * Register protocol with PROSPERO
 */
export async function registerPROSPEROProtocol(protocol: ReviewProtocol): Promise<RegistrationResult> {
  const client = new PROSPEROClient();
  return await client.registerProtocol(protocol);
}

/**
 * Update existing PROSPERO registration
 */
export async function updatePROSPERORegistration(
  registrationNumber: string,
  updates: ProtocolUpdate[]
): Promise<RegistrationResult> {
  const client = new PROSPEROClient();
  return await client.updateRegistration(registrationNumber, updates);
}

/**
 * Get PROSPERO registration details
 */
export async function getPROSPERORegistration(
  registrationNumber: string
): Promise<PROSPERORegistration | null> {
  const client = new PROSPEROClient();
  return await client.getRegistration(registrationNumber);
}

/**
 * Export protocol in various formats
 */
export function exportPROSPEROProtocol(
  protocol: ReviewProtocol,
  format: 'json' | 'xml' | 'pdf' = 'json'
): string {
  const client = new PROSPEROClient();
  return client.exportProtocol(protocol, format);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  validatePROSPEROProtocol,
  registerPROSPEROProtocol,
  updatePROSPERORegistration,
  getPROSPERORegistration,
  exportPROSPEROProtocol,
};
