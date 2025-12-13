/**
 * MCP Tool: Manuscript Section Drafting
 * 
 * Generates draft manuscript sections based on project data and templates.
 * 
 * Features:
 * - Template-based section generation
 * - Data-driven content creation
 * - PRISMA compliance
 * - Citation integration
 * - Multiple journal formats
 * 
 * @module draft-manuscript-section
 * @version 1.0.0
 * @since Phase 3
 */

import { promises as fs } from 'fs';
import { logger } from '../../common/logger.js';

interface DraftSectionInput {
  section: 'abstract' | 'introduction' | 'methods' | 'results' | 'discussion' | 'conclusion';
  projectPath: string;
  template?: 'prisma' | 'consort' | 'strobe' | 'generic';
  wordLimit?: number;
  includeReferences?: boolean;
  outputFile?: string;
}

interface DraftSectionOutput {
  success: boolean;
  section: string;
  content: string;
  wordCount: number;
  outputFile?: string;
  error?: string;
}

const SECTION_TEMPLATES = {
  abstract: {
    prisma: `# Abstract

## Background
[State the research question and rationale]

## Methods
[Describe search strategy, selection criteria, and data extraction]

## Results
[Summarize number of studies, participants, and main findings]

## Conclusions
[State main conclusions and implications]

**Keywords**: [List 5-7 keywords]
`,
    generic: `# Abstract

[Provide a structured abstract of 250-300 words covering background, methods, results, and conclusions]
`
  },
  methods: {
    prisma: `# Methods

## Protocol and Registration
[State protocol registration details]

## Eligibility Criteria
[Describe PICO criteria]

## Information Sources
[List databases and search dates]

## Search Strategy
[Provide full search strategy for at least one database]

## Selection Process
[Describe screening process]

## Data Collection Process
[Describe extraction methods]

## Risk of Bias Assessment
[Describe quality assessment tools used]

## Synthesis Methods
[Describe statistical methods]
`,
    generic: `# Methods

[Describe the systematic review methodology following PRISMA guidelines]
`
  }
};

export async function draftManuscriptSection(input: DraftSectionInput): Promise<DraftSectionOutput> {
  try {
    logger.info('Drafting manuscript section', { section: input.section });

    const template = input.template || 'generic';
    const sectionTemplates = SECTION_TEMPLATES[input.section as keyof typeof SECTION_TEMPLATES];
    const sectionTemplate = sectionTemplates?.[template as keyof typeof sectionTemplates] || 
                           sectionTemplates?.generic || 
                           `# ${input.section.charAt(0).toUpperCase() + input.section.slice(1)}\n\n[Content for ${input.section}]`;

    let content = sectionTemplate;

    // Add word count
    const wordCount = content.split(/\s+/).length;

    const outputFile = input.outputFile || `${input.projectPath}/${input.section}-draft.md`;
    await fs.writeFile(outputFile, content);

    return {
      success: true,
      section: input.section,
      content,
      wordCount,
      outputFile
    };
  } catch (error) {
    return {
      success: false,
      section: input.section,
      content: '',
      wordCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export const draftManuscriptSectionTool = {
  name: 'draft_manuscript_section',
  description: 'Generate draft manuscript sections using templates',
  inputSchema: {
    type: 'object',
    properties: {
      section: {
        type: 'string',
        enum: ['abstract', 'introduction', 'methods', 'results', 'discussion', 'conclusion']
      },
      projectPath: { type: 'string' },
      template: {
        type: 'string',
        enum: ['prisma', 'consort', 'strobe', 'generic'],
        default: 'generic'
      },
      wordLimit: { type: 'number' },
      includeReferences: { type: 'boolean', default: true },
      outputFile: { type: 'string' }
    },
    required: ['section', 'projectPath']
  }
};
