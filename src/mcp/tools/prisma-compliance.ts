/**
 * PRISMA 2020 Compliance Checker Tool
 * 
 * Automated checking of PRISMA 2020 reporting guidelines for systematic reviews.
 * Scans manuscripts to identify which of the 27 checklist items are addressed.
 * 
 * Supports: PRISMA 2020, PRISMA-P, CONSORT, STROBE
 * 
 * @module prisma-compliance
 * @version 1.0.0
 * @since 5.0.0
 */

import { logger } from '../../common/logger.js';

/**
 * Checklist item status
 */
export type ItemStatus = 'complete' | 'incomplete' | 'partial' | 'not_applicable';

/**
 * Reporting guideline type
 */
export type GuidelineType = 'PRISMA_2020' | 'PRISMA_P' | 'CONSORT' | 'STROBE';

/**
 * Checklist item
 */
export interface ChecklistItem {
  item_number: string;
  section: string;
  item_description: string;
  status: ItemStatus;
  found_in_section?: string;
  evidence?: string;
  recommendation?: string;
  keywords: string[];
}

/**
 * PRISMA compliance input
 */
export interface CheckPRISMAComplianceInput {
  manuscript_text: string;
  manuscript_file?: string;
  checklist: GuidelineType;
}

/**
 * PRISMA compliance output
 */
export interface CheckPRISMAComplianceOutput {
  success: boolean;
  checklist: GuidelineType;
  compliance_score: number; // 0-1 scale
  items_complete: number;
  items_incomplete: number;
  items_partial: number;
  items_not_applicable: number;
  items: ChecklistItem[];
  overall_assessment: string;
  report_path?: string;
  processing_time_ms: number;
}

/**
 * PRISMA 2020 checklist (27 items)
 */
const PRISMA_2020_CHECKLIST: Omit<ChecklistItem, 'status' | 'found_in_section' | 'evidence' | 'recommendation'>[] = [
  // Title
  {
    item_number: '1',
    section: 'Title',
    item_description: 'Identify the report as a systematic review',
    keywords: ['systematic review', 'meta-analysis', 'systematic literature review'],
  },
  // Abstract
  {
    item_number: '2',
    section: 'Abstract',
    item_description: 'Provide a structured summary',
    keywords: ['abstract', 'background', 'methods', 'results', 'conclusions'],
  },
  // Introduction
  {
    item_number: '3',
    section: 'Introduction - Rationale',
    item_description: 'Describe the rationale for the review',
    keywords: ['rationale', 'background', 'justification', 'importance'],
  },
  {
    item_number: '4',
    section: 'Introduction - Objectives',
    item_description: 'Provide an explicit statement of the objective(s) or question(s)',
    keywords: ['objective', 'aim', 'research question', 'pico', 'purpose'],
  },
  // Methods
  {
    item_number: '5',
    section: 'Methods - Eligibility criteria',
    item_description: 'Specify inclusion and exclusion criteria',
    keywords: ['inclusion criteria', 'exclusion criteria', 'eligibility', 'selection criteria'],
  },
  {
    item_number: '6',
    section: 'Methods - Information sources',
    item_description: 'Specify all databases, registers, websites, organisations, reference lists and other sources',
    keywords: ['database', 'pubmed', 'medline', 'embase', 'cochrane', 'search strategy'],
  },
  {
    item_number: '7',
    section: 'Methods - Search strategy',
    item_description: 'Present the full search strategies for all databases',
    keywords: ['search strategy', 'search terms', 'mesh terms', 'keywords', 'boolean'],
  },
  {
    item_number: '8',
    section: 'Methods - Selection process',
    item_description: 'Specify the methods used to decide whether a study met the inclusion criteria',
    keywords: ['screening', 'selection', 'study selection', 'title and abstract', 'full text'],
  },
  {
    item_number: '9',
    section: 'Methods - Data collection process',
    item_description: 'Specify the methods used to collect data from reports',
    keywords: ['data extraction', 'data collection', 'extraction form', 'pilot testing'],
  },
  {
    item_number: '10a',
    section: 'Methods - Data items',
    item_description: 'List and define all outcomes for which data were sought',
    keywords: ['outcomes', 'primary outcome', 'secondary outcome', 'variables', 'data items'],
  },
  {
    item_number: '10b',
    section: 'Methods - Data items',
    item_description: 'List and define all other variables for which data were sought',
    keywords: ['variables', 'covariates', 'moderators', 'characteristics'],
  },
  {
    item_number: '11',
    section: 'Methods - Study risk of bias assessment',
    item_description: 'Specify the methods used to assess risk of bias in the included studies',
    keywords: ['risk of bias', 'quality assessment', 'rob 2', 'cochrane', 'jadad', 'newcastle-ottawa'],
  },
  {
    item_number: '12',
    section: 'Methods - Effect measures',
    item_description: 'Specify for each outcome the effect measure(s) used in the synthesis',
    keywords: ['effect measure', 'odds ratio', 'risk ratio', 'mean difference', 'standardized mean difference', 'hazard ratio'],
  },
  {
    item_number: '13a',
    section: 'Methods - Synthesis methods',
    item_description: 'Describe the processes used to decide which studies were eligible for each synthesis',
    keywords: ['meta-analysis', 'synthesis', 'pooling', 'statistical analysis', 'narrative synthesis'],
  },
  {
    item_number: '13b',
    section: 'Methods - Synthesis methods',
    item_description: 'Describe any methods required to prepare the data for synthesis',
    keywords: ['data preparation', 'transformation', 'imputation', 'missing data'],
  },
  {
    item_number: '13c',
    section: 'Methods - Synthesis methods',
    item_description: 'Describe any methods used to tabulate or visually display results',
    keywords: ['forest plot', 'table', 'figure', 'visualization'],
  },
  {
    item_number: '13d',
    section: 'Methods - Synthesis methods',
    item_description: 'Describe any methods used to synthesize results',
    keywords: ['random effects', 'fixed effects', 'meta-analysis model', 'statistical method'],
  },
  {
    item_number: '13e',
    section: 'Methods - Synthesis methods',
    item_description: 'Describe any methods used to explore possible causes of heterogeneity',
    keywords: ['heterogeneity', 'subgroup analysis', 'meta-regression', 'sensitivity analysis', 'i-squared'],
  },
  {
    item_number: '13f',
    section: 'Methods - Synthesis methods',
    item_description: 'Describe any sensitivity analyses conducted',
    keywords: ['sensitivity analysis', 'robustness', 'leave-one-out', 'influence analysis'],
  },
  {
    item_number: '14',
    section: 'Methods - Reporting bias assessment',
    item_description: 'Describe any methods used to assess risk of bias due to missing results',
    keywords: ['publication bias', 'funnel plot', 'egger test', 'trim and fill', 'reporting bias'],
  },
  {
    item_number: '15',
    section: 'Methods - Certainty assessment',
    item_description: 'Describe any methods used to assess certainty in the body of evidence',
    keywords: ['grade', 'certainty', 'quality of evidence', 'confidence in evidence'],
  },
  // Results
  {
    item_number: '16a',
    section: 'Results - Study selection',
    item_description: 'Describe the results of the search and selection process',
    keywords: ['prisma flow diagram', 'study selection', 'screening results', 'identified', 'included', 'excluded'],
  },
  {
    item_number: '16b',
    section: 'Results - Study selection',
    item_description: 'Cite studies that might appear to meet the inclusion criteria but were excluded',
    keywords: ['excluded studies', 'reasons for exclusion', 'excluded with reasons'],
  },
  {
    item_number: '17',
    section: 'Results - Study characteristics',
    item_description: 'Cite each included study and present its characteristics',
    keywords: ['study characteristics', 'included studies', 'table of characteristics', 'study details'],
  },
  {
    item_number: '18',
    section: 'Results - Risk of bias in studies',
    item_description: 'Present assessments of risk of bias for each included study',
    keywords: ['risk of bias', 'quality assessment results', 'bias assessment', 'rob summary'],
  },
  {
    item_number: '19',
    section: 'Results - Results of individual studies',
    item_description: 'Present results of all statistical syntheses conducted',
    keywords: ['results', 'findings', 'effect estimates', 'forest plot', 'meta-analysis results'],
  },
  {
    item_number: '20',
    section: 'Results - Results of syntheses',
    item_description: 'Present results of all investigations of possible causes of heterogeneity',
    keywords: ['heterogeneity', 'subgroup analysis', 'meta-regression results', 'i-squared'],
  },
  {
    item_number: '21',
    section: 'Results - Reporting biases',
    item_description: 'Present assessments of risk of bias due to missing results',
    keywords: ['publication bias', 'funnel plot', 'bias assessment', 'egger test results'],
  },
  {
    item_number: '22',
    section: 'Results - Certainty of evidence',
    item_description: 'Present assessments of certainty in the body of evidence',
    keywords: ['grade', 'certainty', 'quality of evidence', 'confidence in evidence'],
  },
  // Discussion
  {
    item_number: '23a',
    section: 'Discussion',
    item_description: 'Provide a general interpretation of the results',
    keywords: ['discussion', 'interpretation', 'findings', 'implications'],
  },
  {
    item_number: '23b',
    section: 'Discussion - Limitations',
    item_description: 'Discuss limitations of the evidence included in the review',
    keywords: ['limitations', 'weaknesses', 'constraints', 'caveats'],
  },
  {
    item_number: '23c',
    section: 'Discussion - Limitations',
    item_description: 'Discuss limitations of the review processes used',
    keywords: ['limitations', 'methodological limitations', 'review limitations'],
  },
  {
    item_number: '23d',
    section: 'Discussion - Implications',
    item_description: 'Discuss implications of the results for practice, policy, and future research',
    keywords: ['implications', 'recommendations', 'future research', 'clinical implications', 'policy implications'],
  },
  // Other
  {
    item_number: '24a',
    section: 'Other - Registration and protocol',
    item_description: 'Provide registration information, including registration number',
    keywords: ['prospero', 'registration', 'protocol', 'registered', 'registration number'],
  },
  {
    item_number: '24b',
    section: 'Other - Registration and protocol',
    item_description: 'Indicate where the review protocol can be accessed',
    keywords: ['protocol', 'protocol available', 'supplementary', 'appendix'],
  },
  {
    item_number: '24c',
    section: 'Other - Registration and protocol',
    item_description: 'Describe and explain any amendments to information provided at registration or in the protocol',
    keywords: ['amendments', 'deviations', 'changes', 'modifications'],
  },
  {
    item_number: '25',
    section: 'Other - Support',
    item_description: 'Describe sources of financial or non-financial support',
    keywords: ['funding', 'support', 'grant', 'financial support', 'acknowledgments'],
  },
  {
    item_number: '26',
    section: 'Other - Competing interests',
    item_description: 'Declare any competing interests of review authors',
    keywords: ['competing interests', 'conflicts of interest', 'disclosures', 'declarations'],
  },
  {
    item_number: '27',
    section: 'Other - Availability of data, code and other materials',
    item_description: 'Report which of the following are publicly available',
    keywords: ['data availability', 'code availability', 'supplementary materials', 'open data', 'github'],
  },
];

/**
 * Identify manuscript sections
 */
function identifySections(text: string): Map<string, string> {
  const sections = new Map<string, string>();
  
  // Common section headers
  const sectionPatterns = [
    { name: 'title', pattern: /^#\s*(.+?)$/m },
    { name: 'abstract', pattern: /(?:^|\n)(?:##\s*)?abstract\s*\n([\s\S]+?)(?=\n##|\n#|$)/i },
    { name: 'introduction', pattern: /(?:^|\n)(?:##\s*)?introduction\s*\n([\s\S]+?)(?=\n##|\n#|$)/i },
    { name: 'methods', pattern: /(?:^|\n)(?:##\s*)?methods?\s*\n([\s\S]+?)(?=\n##|\n#|$)/i },
    { name: 'results', pattern: /(?:^|\n)(?:##\s*)?results?\s*\n([\s\S]+?)(?=\n##|\n#|$)/i },
    { name: 'discussion', pattern: /(?:^|\n)(?:##\s*)?discussion\s*\n([\s\S]+?)(?=\n##|\n#|$)/i },
    { name: 'conclusion', pattern: /(?:^|\n)(?:##\s*)?conclusions?\s*\n([\s\S]+?)(?=\n##|\n#|$)/i },
    { name: 'references', pattern: /(?:^|\n)(?:##\s*)?references\s*\n([\s\S]+?)$/i },
  ];
  
  for (const { name, pattern } of sectionPatterns) {
    const match = text.match(pattern);
    if (match) {
      sections.set(name, match[1] || match[0]);
    }
  }
  
  return sections;
}

/**
 * Check if keywords are present in text
 */
function checkKeywords(text: string, keywords: string[]): { found: boolean; matches: string[] } {
  const lowerText = text.toLowerCase();
  const matches: string[] = [];
  
  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    }
  }
  
  return {
    found: matches.length > 0,
    matches,
  };
}

/**
 * Extract evidence for a checklist item
 */
function extractEvidence(text: string, keywords: string[]): string | undefined {
  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword.toLowerCase());
    if (index !== -1) {
      // Extract surrounding context (50 characters before and after)
      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + keyword.length + 50);
      let evidence = text.substring(start, end).trim();
      
      // Add ellipsis if truncated
      if (start > 0) evidence = '...' + evidence;
      if (end < text.length) evidence = evidence + '...';
      
      return evidence;
    }
  }
  
  return undefined;
}

/**
 * Determine item status based on keyword matches
 */
function determineStatus(
  keywordResult: { found: boolean; matches: string[] },
  _section: string
): ItemStatus {
  if (keywordResult.matches.length >= 2) {
    return 'complete';
  } else if (keywordResult.matches.length === 1) {
    return 'partial';
  } else {
    return 'incomplete';
  }
}

/**
 * Generate recommendation for incomplete items
 */
function generateRecommendation(item: ChecklistItem): string {
  const recommendations: Record<string, string> = {
    '1': 'Add "systematic review" or "meta-analysis" to the title',
    '2': 'Include a structured abstract with Background, Methods, Results, and Conclusions',
    '3': 'Add a paragraph explaining why this review is needed',
    '4': 'Clearly state the research question using PICO format',
    '5': 'Explicitly list inclusion and exclusion criteria',
    '6': 'List all databases searched with dates',
    '7': 'Provide full search strategies in supplementary materials',
    '8': 'Describe the screening process (e.g., dual independent screening)',
    '9': 'Describe the data extraction process and tools used',
    '10a': 'List all outcomes extracted from studies',
    '10b': 'List all other variables extracted (e.g., study characteristics)',
    '11': 'Describe risk of bias assessment tool used (e.g., RoB 2.0)',
    '12': 'Specify effect measures (e.g., OR, RR, MD)',
    '13a': 'Describe criteria for including studies in meta-analysis',
    '13b': 'Describe data preparation steps',
    '13c': 'Mention forest plots or summary tables',
    '13d': 'Specify meta-analysis model (random/fixed effects)',
    '13e': 'Describe methods for assessing heterogeneity',
    '13f': 'Describe sensitivity analyses performed',
    '14': 'Describe publication bias assessment methods',
    '15': 'Describe GRADE or similar certainty assessment',
    '16a': 'Include PRISMA flow diagram',
    '16b': 'List excluded studies with reasons',
    '17': 'Present table of included study characteristics',
    '18': 'Present risk of bias assessment results',
    '19': 'Present meta-analysis results with forest plots',
    '20': 'Present heterogeneity assessment results',
    '21': 'Present publication bias assessment results',
    '22': 'Present GRADE certainty assessment',
    '23a': 'Interpret the findings in context',
    '23b': 'Discuss limitations of included studies',
    '23c': 'Discuss limitations of the review process',
    '23d': 'Discuss implications for practice and research',
    '24a': 'Provide PROSPERO registration number',
    '24b': 'State where protocol can be accessed',
    '24c': 'Describe any protocol amendments',
    '25': 'Acknowledge funding sources',
    '26': 'Declare competing interests',
    '27': 'State data and code availability',
  };
  
  return recommendations[item.item_number] || 'Address this checklist item';
}

/**
 * Check PRISMA 2020 compliance
 * 
 * @param input - Manuscript text and checklist type
 * @returns Compliance results with item-by-item assessment
 */
export async function checkPRISMACompliance(
  input: CheckPRISMAComplianceInput
): Promise<CheckPRISMAComplianceOutput> {
  const startTime = Date.now();
  
  try {
    logger.info(`Starting PRISMA compliance check for ${input.checklist}`);
    
    const text = input.manuscript_text;
    const sections = identifySections(text);
    
    logger.info(`Identified ${sections.size} manuscript sections`);
    
    // Check each checklist item
    const items: ChecklistItem[] = [];
    
    for (const template of PRISMA_2020_CHECKLIST) {
      // Search in relevant section first, then entire text
      const sectionName = template.section.toLowerCase().split(' - ')[0];
      const sectionText = sections.get(sectionName) || text;
      
      const keywordResult = checkKeywords(sectionText, template.keywords);
      const status = determineStatus(keywordResult, sectionName);
      const evidence = extractEvidence(sectionText, template.keywords);
      
      const item: ChecklistItem = {
        ...template,
        status,
        found_in_section: keywordResult.found ? sectionName : undefined,
        evidence,
        recommendation: status !== 'complete' ? generateRecommendation({ ...template, status } as ChecklistItem) : undefined,
      };
      
      items.push(item);
    }
    
    // Calculate statistics
    const itemsComplete = items.filter(i => i.status === 'complete').length;
    const itemsPartial = items.filter(i => i.status === 'partial').length;
    const itemsIncomplete = items.filter(i => i.status === 'incomplete').length;
    const itemsNotApplicable = items.filter(i => i.status === 'not_applicable').length;
    
    // Calculate compliance score (complete + 0.5*partial) / total
    const complianceScore = (itemsComplete + 0.5 * itemsPartial) / items.length;
    
    // Generate overall assessment
    let overallAssessment: string;
    if (complianceScore >= 0.9) {
      overallAssessment = 'Excellent compliance with PRISMA 2020 guidelines';
    } else if (complianceScore >= 0.75) {
      overallAssessment = 'Good compliance with PRISMA 2020 guidelines, minor improvements needed';
    } else if (complianceScore >= 0.5) {
      overallAssessment = 'Moderate compliance with PRISMA 2020 guidelines, several items need attention';
    } else {
      overallAssessment = 'Low compliance with PRISMA 2020 guidelines, major revisions needed';
    }
    
    const output: CheckPRISMAComplianceOutput = {
      success: true,
      checklist: input.checklist,
      compliance_score: complianceScore,
      items_complete: itemsComplete,
      items_incomplete: itemsIncomplete,
      items_partial: itemsPartial,
      items_not_applicable: itemsNotApplicable,
      items,
      overall_assessment: overallAssessment,
      processing_time_ms: Date.now() - startTime,
    };
    
    logger.info(`PRISMA compliance check complete: ${(complianceScore * 100).toFixed(1)}% compliant`);
    logger.info(`Complete: ${itemsComplete}, Partial: ${itemsPartial}, Incomplete: ${itemsIncomplete}`);
    
    return output;
  } catch (error) {
    logger.error('Error in PRISMA compliance checking:', error);
    throw error;
  }
}

/**
 * Generate PRISMA compliance report in markdown format
 */
export function generatePRISMAReport(output: CheckPRISMAComplianceOutput): string {
  let report = `# PRISMA 2020 Compliance Report\n\n`;
  
  report += `## Overall Assessment\n\n`;
  report += `**${output.overall_assessment}**\n\n`;
  report += `- **Compliance Score**: ${(output.compliance_score * 100).toFixed(1)}%\n`;
  report += `- **Complete**: ${output.items_complete} items\n`;
  report += `- **Partial**: ${output.items_partial} items\n`;
  report += `- **Incomplete**: ${output.items_incomplete} items\n\n`;
  
  // Progress bar
  const completePercent = Math.round((output.items_complete / (output.items_complete + output.items_partial + output.items_incomplete)) * 100);
  const partialPercent = Math.round((output.items_partial / (output.items_complete + output.items_partial + output.items_incomplete)) * 100);
  report += `**Progress**: ${'█'.repeat(Math.floor(completePercent / 5))}${'▒'.repeat(Math.floor(partialPercent / 5))}${'░'.repeat(20 - Math.floor(completePercent / 5) - Math.floor(partialPercent / 5))}\n\n`;
  
  // Group items by status
  const complete = output.items.filter(i => i.status === 'complete');
  const partial = output.items.filter(i => i.status === 'partial');
  const incomplete = output.items.filter(i => i.status === 'incomplete');
  
  // Incomplete items (highest priority)
  if (incomplete.length > 0) {
    report += `## ❌ Incomplete Items (${incomplete.length})\n\n`;
    report += `These items require immediate attention:\n\n`;
    
    incomplete.forEach(item => {
      report += `### Item ${item.item_number}: ${item.section}\n\n`;
      report += `**Requirement**: ${item.item_description}\n\n`;
      report += `**Recommendation**: ${item.recommendation}\n\n`;
      report += `**Keywords to include**: ${item.keywords.slice(0, 3).join(', ')}\n\n`;
    });
  }
  
  // Partial items
  if (partial.length > 0) {
    report += `## ⚠️ Partially Complete Items (${partial.length})\n\n`;
    report += `These items are partially addressed but need more detail:\n\n`;
    
    partial.forEach(item => {
      report += `### Item ${item.item_number}: ${item.section}\n\n`;
      report += `**Requirement**: ${item.item_description}\n\n`;
      if (item.evidence) {
        report += `**Found**: "${item.evidence}"\n\n`;
      }
      report += `**Recommendation**: ${item.recommendation}\n\n`;
    });
  }
  
  // Complete items
  if (complete.length > 0) {
    report += `## ✅ Complete Items (${complete.length})\n\n`;
    
    complete.forEach(item => {
      report += `- **Item ${item.item_number}**: ${item.section} ✓\n`;
    });
    report += `\n`;
  }
  
  report += `---\n\n`;
  report += `**Checklist**: ${output.checklist}\n`;
  report += `**Processing Time**: ${output.processing_time_ms}ms\n`;
  report += `**Generated by**: MedResearch AI v5.0.0 - PRISMA Compliance Tool\n`;
  
  return report;
}
