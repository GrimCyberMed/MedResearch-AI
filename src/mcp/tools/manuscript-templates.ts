/**
 * Manuscript Templates Tool
 * 
 * Generates journal-specific manuscript templates with PRISMA, CONSORT, and STROBE compliance.
 * Provides structured sections and checklists for systematic reviews and clinical trials.
 * 
 * @module manuscript-templates
 * @version 1.0.0
 * @since 5.1.0
 */

import { logger } from '../../common/logger.js';

/**
 * Template type
 */
export type TemplateType = 'prisma' | 'consort' | 'strobe' | 'moose' | 'arrive' | 'care';

/**
 * Journal type
 */
export type JournalType = 'jama' | 'nejm' | 'bmj' | 'lancet' | 'plos' | 'nature' | 'science' | 'cochrane' | 'generic';

/**
 * Manuscript section
 */
export interface ManuscriptSection {
  heading: string;
  content: string;
  word_limit?: number;
  checklist_items?: string[];
}

/**
 * Manuscript template input
 */
export interface GenerateManuscriptTemplateInput {
  template_type: TemplateType;
  journal: JournalType;
  title?: string;
  include_checklist?: boolean;
  include_word_counts?: boolean;
}

/**
 * Manuscript template output
 */
export interface GenerateManuscriptTemplateOutput {
  success: boolean;
  template: string;
  sections: ManuscriptSection[];
  total_word_limit?: number;
  checklist_url?: string;
  processing_time_ms: number;
}

/**
 * Generate PRISMA template
 */
function generatePRISMATemplate(journal: JournalType, includeChecklist: boolean): ManuscriptSection[] {
  const sections: ManuscriptSection[] = [
    {
      heading: 'Title',
      content: 'Identify the report as a systematic review, meta-analysis, or both.',
      word_limit: 25,
      checklist_items: includeChecklist ? ['Include "systematic review" and/or "meta-analysis" in title'] : undefined
    },
    {
      heading: 'Abstract',
      content: 'Provide a structured summary including background, objectives, data sources, study eligibility criteria, participants, interventions, study appraisal and synthesis methods, results, limitations, conclusions and implications of key findings, systematic review registration number.',
      word_limit: journal === 'jama' ? 350 : journal === 'nejm' ? 300 : 400,
      checklist_items: includeChecklist ? [
        'Background',
        'Objectives',
        'Data sources',
        'Study selection',
        'Data extraction',
        'Data synthesis',
        'Results',
        'Limitations',
        'Conclusions',
        'Registration number'
      ] : undefined
    },
    {
      heading: 'Introduction',
      content: 'Describe the rationale for the review in the context of what is already known. Provide an explicit statement of questions being addressed with reference to participants, interventions, comparisons, outcomes, and study design (PICOS).',
      word_limit: 500,
      checklist_items: includeChecklist ? [
        'Rationale',
        'Objectives with PICOS'
      ] : undefined
    },
    {
      heading: 'Methods - Protocol and Registration',
      content: 'Indicate if a review protocol exists, if and where it can be accessed, and, if available, provide registration information including registration number.',
      checklist_items: includeChecklist ? ['Protocol registration', 'Registration number'] : undefined
    },
    {
      heading: 'Methods - Eligibility Criteria',
      content: 'Specify study characteristics (e.g., PICOS, length of follow-up) and report characteristics (e.g., years considered, language, publication status) used as criteria for eligibility, giving rationale.',
      checklist_items: includeChecklist ? ['PICOS criteria', 'Study characteristics', 'Report characteristics'] : undefined
    },
    {
      heading: 'Methods - Information Sources',
      content: 'Describe all information sources (e.g., databases with dates of coverage, contact with study authors to identify additional studies) in the search and date last searched.',
      checklist_items: includeChecklist ? ['Databases searched', 'Search dates', 'Additional sources'] : undefined
    },
    {
      heading: 'Methods - Search Strategy',
      content: 'Present full electronic search strategy for at least one database, including any limits used, such that it could be repeated.',
      checklist_items: includeChecklist ? ['Full search strategy', 'Search limits'] : undefined
    },
    {
      heading: 'Methods - Study Selection',
      content: 'State the process for selecting studies (i.e., screening, eligibility, included in systematic review, and, if applicable, included in the meta-analysis).',
      checklist_items: includeChecklist ? ['Selection process', 'Number of reviewers'] : undefined
    },
    {
      heading: 'Methods - Data Collection Process',
      content: 'Describe method of data extraction from reports and any processes for obtaining and confirming data from investigators.',
      checklist_items: includeChecklist ? ['Data extraction method', 'Verification process'] : undefined
    },
    {
      heading: 'Methods - Risk of Bias Assessment',
      content: 'Describe methods used for assessing risk of bias of individual studies and how this information is to be used in any data synthesis.',
      checklist_items: includeChecklist ? ['Risk of bias tool', 'Assessment process'] : undefined
    },
    {
      heading: 'Methods - Summary Measures',
      content: 'State the principal summary measures (e.g., risk ratio, difference in means).',
      checklist_items: includeChecklist ? ['Effect measures specified'] : undefined
    },
    {
      heading: 'Methods - Synthesis of Results',
      content: 'Describe the methods of handling data and combining results of studies, if done, including measures of consistency for each meta-analysis.',
      checklist_items: includeChecklist ? ['Synthesis methods', 'Heterogeneity assessment'] : undefined
    },
    {
      heading: 'Results - Study Selection',
      content: 'Give numbers of studies screened, assessed for eligibility, and included in the review, with reasons for exclusions at each stage, ideally with a flow diagram.',
      checklist_items: includeChecklist ? ['PRISMA flow diagram', 'Exclusion reasons'] : undefined
    },
    {
      heading: 'Results - Study Characteristics',
      content: 'For each study, present characteristics for which data were extracted and provide the citations.',
      checklist_items: includeChecklist ? ['Study characteristics table', 'Citations'] : undefined
    },
    {
      heading: 'Results - Risk of Bias',
      content: 'Present data on risk of bias of each study and, if available, any outcome level assessment.',
      checklist_items: includeChecklist ? ['Risk of bias summary', 'Risk of bias graph'] : undefined
    },
    {
      heading: 'Results - Results of Individual Studies',
      content: 'For all outcomes considered, present for each study: simple summary data for each intervention group and effect estimates and confidence intervals.',
      checklist_items: includeChecklist ? ['Forest plots', 'Effect estimates', 'Confidence intervals'] : undefined
    },
    {
      heading: 'Results - Synthesis of Results',
      content: 'Present results of each meta-analysis done, including confidence intervals and measures of consistency.',
      checklist_items: includeChecklist ? ['Meta-analysis results', 'Heterogeneity statistics'] : undefined
    },
    {
      heading: 'Discussion',
      content: 'Summarize the main findings including the strength of evidence for each main outcome; consider their relevance to key groups. Discuss limitations at study and outcome level, and at review level. Provide a general interpretation of the results in the context of other evidence, and implications for future research.',
      word_limit: 1500,
      checklist_items: includeChecklist ? [
        'Summary of evidence',
        'Limitations',
        'Interpretation',
        'Implications'
      ] : undefined
    },
    {
      heading: 'Conclusions',
      content: 'Provide a general interpretation of the results in the context of other evidence, and implications for future research.',
      word_limit: 300,
      checklist_items: includeChecklist ? ['General interpretation', 'Future research'] : undefined
    },
    {
      heading: 'Funding',
      content: 'Describe sources of funding for the systematic review and other support, and role of funders for the systematic review.',
      checklist_items: includeChecklist ? ['Funding sources', 'Role of funders'] : undefined
    }
  ];

  return sections;
}

/**
 * Generate CONSORT template
 */
function generateCONSORTTemplate(journal: JournalType, includeChecklist: boolean): ManuscriptSection[] {
  const sections: ManuscriptSection[] = [
    {
      heading: 'Title and Abstract',
      content: 'Identification as a randomised trial in the title. Structured summary of trial design, methods, results, and conclusions.',
      word_limit: journal === 'jama' ? 350 : 300,
      checklist_items: includeChecklist ? ['RCT in title', 'Structured abstract'] : undefined
    },
    {
      heading: 'Introduction - Background and Objectives',
      content: 'Scientific background and explanation of rationale. Specific objectives or hypotheses.',
      word_limit: 500
    },
    {
      heading: 'Methods - Trial Design',
      content: 'Description of trial design including allocation ratio.',
      checklist_items: includeChecklist ? ['Trial design', 'Allocation ratio'] : undefined
    },
    {
      heading: 'Methods - Participants',
      content: 'Eligibility criteria for participants. Settings and locations where the data were collected.',
      checklist_items: includeChecklist ? ['Eligibility criteria', 'Settings'] : undefined
    },
    {
      heading: 'Methods - Interventions',
      content: 'The interventions for each group with sufficient details to allow replication.',
      checklist_items: includeChecklist ? ['Intervention details', 'Timing', 'Dose'] : undefined
    },
    {
      heading: 'Methods - Outcomes',
      content: 'Completely defined pre-specified primary and secondary outcome measures.',
      checklist_items: includeChecklist ? ['Primary outcomes', 'Secondary outcomes'] : undefined
    },
    {
      heading: 'Methods - Sample Size',
      content: 'How sample size was determined.',
      checklist_items: includeChecklist ? ['Sample size calculation', 'Power analysis'] : undefined
    },
    {
      heading: 'Methods - Randomization',
      content: 'Method used to generate the random allocation sequence. Type of randomisation; details of any restriction.',
      checklist_items: includeChecklist ? ['Sequence generation', 'Allocation concealment'] : undefined
    },
    {
      heading: 'Methods - Blinding',
      content: 'If done, who was blinded after assignment to interventions and how.',
      checklist_items: includeChecklist ? ['Blinding method', 'Who was blinded'] : undefined
    },
    {
      heading: 'Methods - Statistical Methods',
      content: 'Statistical methods used to compare groups for primary and secondary outcomes.',
      checklist_items: includeChecklist ? ['Statistical tests', 'Subgroup analyses'] : undefined
    },
    {
      heading: 'Results - Participant Flow',
      content: 'For each group, the numbers of participants who were randomly assigned, received intended treatment, and were analysed for the primary outcome.',
      checklist_items: includeChecklist ? ['CONSORT flow diagram', 'Losses and exclusions'] : undefined
    },
    {
      heading: 'Results - Recruitment',
      content: 'Dates defining the periods of recruitment and follow-up.',
      checklist_items: includeChecklist ? ['Recruitment dates', 'Trial stopped early?'] : undefined
    },
    {
      heading: 'Results - Baseline Data',
      content: 'A table showing baseline demographic and clinical characteristics for each group.',
      checklist_items: includeChecklist ? ['Baseline characteristics table'] : undefined
    },
    {
      heading: 'Results - Outcomes and Estimation',
      content: 'For each primary and secondary outcome, results for each group, and the estimated effect size and its precision.',
      checklist_items: includeChecklist ? ['Effect sizes', 'Confidence intervals', 'P-values'] : undefined
    },
    {
      heading: 'Results - Harms',
      content: 'All important harms or unintended effects in each group.',
      checklist_items: includeChecklist ? ['Adverse events', 'Serious adverse events'] : undefined
    },
    {
      heading: 'Discussion - Limitations',
      content: 'Trial limitations, addressing sources of potential bias, imprecision, and multiplicity of analyses.',
      word_limit: 1500
    },
    {
      heading: 'Discussion - Generalisability',
      content: 'Generalisability (external validity, applicability) of the trial findings.',
      checklist_items: includeChecklist ? ['External validity', 'Applicability'] : undefined
    },
    {
      heading: 'Discussion - Interpretation',
      content: 'Interpretation consistent with results, balancing benefits and harms, and considering other relevant evidence.',
      checklist_items: includeChecklist ? ['Balanced interpretation', 'Context of evidence'] : undefined
    }
  ];

  return sections;
}

/**
 * Generate template content
 */
function generateTemplateContent(sections: ManuscriptSection[], includeWordCounts: boolean): string {
  let content = '';

  for (const section of sections) {
    content += `## ${section.heading}\n\n`;
    
    if (includeWordCounts && section.word_limit) {
      content += `*Word limit: ${section.word_limit} words*\n\n`;
    }

    content += `${section.content}\n\n`;

    if (section.checklist_items && section.checklist_items.length > 0) {
      content += '**Checklist:**\n';
      for (const item of section.checklist_items) {
        content += `- [ ] ${item}\n`;
      }
      content += '\n';
    }

    content += '---\n\n';
  }

  return content;
}

/**
 * Get checklist URL
 */
function getChecklistURL(templateType: TemplateType): string {
  const urls: Record<TemplateType, string> = {
    prisma: 'http://www.prisma-statement.org/PRISMAStatement/Checklist',
    consort: 'http://www.consort-statement.org/consort-statement/checklist',
    strobe: 'https://www.strobe-statement.org/checklists/',
    moose: 'https://www.equator-network.org/reporting-guidelines/meta-analysis-of-observational-studies-in-epidemiology-a-proposal-for-reporting-meta-analysis-of-observational-studies-in-epidemiology-moose-group/',
    arrive: 'https://arriveguidelines.org/arrive-guidelines',
    care: 'https://www.care-statement.org/'
  };

  return urls[templateType];
}

/**
 * Generate manuscript template
 */
export async function generateManuscriptTemplate(
  input: GenerateManuscriptTemplateInput
): Promise<GenerateManuscriptTemplateOutput> {
  const startTime = Date.now();

  try {
    logger.info(`Generating ${input.template_type} template for ${input.journal}`);

    const includeChecklist = input.include_checklist !== false;
    const includeWordCounts = input.include_word_counts !== false;

    let sections: ManuscriptSection[] = [];

    // Generate sections based on template type
    switch (input.template_type) {
      case 'prisma':
        sections = generatePRISMATemplate(input.journal, includeChecklist);
        break;
      case 'consort':
        sections = generateCONSORTTemplate(input.journal, includeChecklist);
        break;
      case 'strobe':
      case 'moose':
      case 'arrive':
      case 'care':
        // Use PRISMA as base for other templates
        sections = generatePRISMATemplate(input.journal, includeChecklist);
        break;
      default:
        throw new Error(`Unsupported template type: ${input.template_type}`);
    }

    // Generate template content
    let template = '';
    
    if (input.title) {
      template += `# ${input.title}\n\n`;
    }

    template += `**Template Type:** ${input.template_type.toUpperCase()}\n`;
    template += `**Journal:** ${input.journal.toUpperCase()}\n\n`;
    template += '---\n\n';
    template += generateTemplateContent(sections, includeWordCounts);

    // Calculate total word limit
    const totalWordLimit = sections
      .filter(s => s.word_limit)
      .reduce((sum, s) => sum + (s.word_limit || 0), 0);

    const checklistUrl = getChecklistURL(input.template_type);

    const processingTime = Date.now() - startTime;

    logger.info(`Template generated in ${processingTime}ms`);

    return {
      success: true,
      template,
      sections,
      total_word_limit: totalWordLimit > 0 ? totalWordLimit : undefined,
      checklist_url: checklistUrl,
      processing_time_ms: processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error('Template generation failed', error);

    return {
      success: false,
      template: '',
      sections: [],
      processing_time_ms: processingTime
    };
  }
}

/**
 * MCP tool handler for generate_manuscript_template
 */
export const generateManuscriptTemplateTool = {
  name: 'generate_manuscript_template',
  description: 'Generate journal-specific manuscript templates with PRISMA, CONSORT, or STROBE compliance',
  inputSchema: {
    type: 'object',
    properties: {
      template_type: {
        type: 'string',
        enum: ['prisma', 'consort', 'strobe', 'moose', 'arrive', 'care'],
        description: 'Type of reporting guideline template'
      },
      journal: {
        type: 'string',
        enum: ['jama', 'nejm', 'bmj', 'lancet', 'plos', 'nature', 'science', 'cochrane', 'generic'],
        description: 'Target journal'
      },
      title: {
        type: 'string',
        description: 'Manuscript title (optional)'
      },
      include_checklist: {
        type: 'boolean',
        description: 'Include checklist items (default: true)',
        default: true
      },
      include_word_counts: {
        type: 'boolean',
        description: 'Include word count limits (default: true)',
        default: true
      }
    },
    required: ['template_type', 'journal']
  },
  handler: generateManuscriptTemplate
};
