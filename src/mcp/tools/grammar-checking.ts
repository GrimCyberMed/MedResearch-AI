/**
 * Advanced Grammar and Style Checking Tool
 * 
 * Provides comprehensive grammar, spelling, punctuation, and style checking
 * for academic medical writing. Optimized for systematic review manuscripts.
 * 
 * Phase 1 Implementation: Rule-based checking with academic style rules
 * Phase 2 Enhancement: LanguageTool API integration (optional)
 * 
 * @module grammar-checking
 * @version 1.0.0
 * @since 5.0.0
 */

import { logger } from '../../common/logger.js';

/**
 * Error types
 */
export type ErrorType = 'grammar' | 'spelling' | 'style' | 'punctuation' | 'clarity';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'error' | 'warning' | 'suggestion';

/**
 * Grammar/style error
 */
export interface GrammarError {
  type: ErrorType;
  original: string;
  correction: string;
  explanation: string;
  position: {
    start: number;
    end: number;
    line?: number;
    column?: number;
  };
  severity: ErrorSeverity;
  rule_id: string;
}

/**
 * Grammar checking input
 */
export interface CheckGrammarInput {
  text: string;
  style?: 'academic_medical' | 'general';
  check_types?: ErrorType[];
  language?: string; // Default: 'en-US'
}

/**
 * Grammar checking output
 */
export interface CheckGrammarOutput {
  success: boolean;
  errors: GrammarError[];
  corrected_text: string;
  grammar_score: number; // 0-1 scale
  statistics: {
    total_errors: number;
    errors_by_type: Record<ErrorType, number>;
    errors_by_severity: Record<ErrorSeverity, number>;
    word_count: number;
    sentence_count: number;
    avg_sentence_length: number;
  };
  processing_time_ms: number;
}

/**
 * Academic medical writing style rules
 */
const ACADEMIC_STYLE_RULES = [
  {
    id: 'avoid_contractions',
    pattern: /\b(don't|doesn't|didn't|won't|wouldn't|can't|couldn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't)\b/gi,
    type: 'style' as ErrorType,
    severity: 'warning' as ErrorSeverity,
    explanation: 'Avoid contractions in academic writing',
    getCorrection: (match: string) => {
      const expansions: Record<string, string> = {
        "don't": "do not", "doesn't": "does not", "didn't": "did not",
        "won't": "will not", "wouldn't": "would not",
        "can't": "cannot", "couldn't": "could not",
        "isn't": "is not", "aren't": "are not",
        "wasn't": "was not", "weren't": "were not",
        "haven't": "have not", "hasn't": "has not", "hadn't": "had not",
      };
      return expansions[match.toLowerCase()] || match;
    },
  },
  {
    id: 'avoid_first_person',
    pattern: /\b(I|we|our|us|my|mine)\b/g,
    type: 'style' as ErrorType,
    severity: 'suggestion' as ErrorSeverity,
    explanation: 'Consider using third person in academic writing (e.g., "The authors" instead of "We")',
    getCorrection: (match: string) => {
      const replacements: Record<string, string> = {
        'I': 'the author',
        'we': 'the authors',
        'our': 'the',
        'us': 'the authors',
        'my': 'the author\'s',
        'mine': 'the author\'s',
      };
      return replacements[match.toLowerCase()] || match;
    },
  },
  {
    id: 'avoid_passive_voice_excessive',
    pattern: /\b(was|were|been|being)\s+\w+ed\b/gi,
    type: 'style' as ErrorType,
    severity: 'suggestion' as ErrorSeverity,
    explanation: 'Consider using active voice for clarity (passive voice detected)',
    getCorrection: (match: string) => match, // Keep original, just suggest
  },
  {
    id: 'avoid_informal_language',
    pattern: /\b(a lot of|lots of|kind of|sort of|pretty much|basically|actually|really|very|quite)\b/gi,
    type: 'style' as ErrorType,
    severity: 'warning' as ErrorSeverity,
    explanation: 'Avoid informal language in academic writing',
    getCorrection: (match: string) => {
      const replacements: Record<string, string> = {
        'a lot of': 'many', 'lots of': 'many',
        'kind of': 'somewhat', 'sort of': 'somewhat',
        'pretty much': 'approximately', 'basically': '',
        'actually': '', 'really': '', 'very': '', 'quite': '',
      };
      return replacements[match.toLowerCase()] || '';
    },
  },
  {
    id: 'avoid_vague_terms',
    pattern: /\b(things|stuff|something|somehow|somewhat|various|several|numerous)\b/gi,
    type: 'clarity' as ErrorType,
    severity: 'suggestion' as ErrorSeverity,
    explanation: 'Be more specific instead of using vague terms',
    getCorrection: (_match: string) => '[be more specific]',
  },
  {
    id: 'check_double_spaces',
    pattern: /  +/g,
    type: 'punctuation' as ErrorType,
    severity: 'error' as ErrorSeverity,
    explanation: 'Remove extra spaces',
    getCorrection: () => ' ',
  },
  {
    id: 'check_comma_before_and',
    pattern: /,\s+and\s+/gi,
    type: 'punctuation' as ErrorType,
    severity: 'suggestion' as ErrorSeverity,
    explanation: 'Consider Oxford comma usage (style-dependent)',
    getCorrection: (match: string) => match, // Keep original
  },
  {
    id: 'avoid_split_infinitives',
    pattern: /\bto\s+\w+ly\s+\w+\b/gi,
    type: 'style' as ErrorType,
    severity: 'suggestion' as ErrorSeverity,
    explanation: 'Avoid split infinitives (e.g., "to boldly go" → "to go boldly")',
    getCorrection: (match: string) => match, // Keep original, just suggest
  },
  {
    id: 'check_sentence_start_capitalization',
    pattern: /\.\s+[a-z]/g,
    type: 'grammar' as ErrorType,
    severity: 'error' as ErrorSeverity,
    explanation: 'Capitalize first letter after period',
    getCorrection: (match: string) => match.toUpperCase(),
  },
  {
    id: 'avoid_redundant_phrases',
    pattern: /\b(in order to|due to the fact that|at this point in time|for the purpose of)\b/gi,
    type: 'clarity' as ErrorType,
    severity: 'suggestion' as ErrorSeverity,
    explanation: 'Simplify redundant phrases',
    getCorrection: (match: string) => {
      const replacements: Record<string, string> = {
        'in order to': 'to',
        'due to the fact that': 'because',
        'at this point in time': 'now',
        'for the purpose of': 'to',
      };
      return replacements[match.toLowerCase()] || match;
    },
  },
];

/**
 * Common spelling errors in medical writing
 */
const COMMON_MEDICAL_SPELLING_ERRORS: Record<string, string> = {
  'occured': 'occurred',
  'recieve': 'receive',
  'seperate': 'separate',
  'definately': 'definitely',
  'accomodate': 'accommodate',
  'acheive': 'achieve',
  'beleive': 'believe',
  'concious': 'conscious',
  'existance': 'existence',
  'independant': 'independent',
  'occassion': 'occasion',
  'persistant': 'persistent',
  'prevelant': 'prevalent',
  'reccomend': 'recommend',
  'refered': 'referred',
  'relevent': 'relevant',
  'resistence': 'resistance',
  'seperation': 'separation',
  'succesful': 'successful',
  'untill': 'until',
};

/**
 * Calculate position information (line and column)
 */
function calculatePosition(text: string, index: number): { line: number; column: number } {
  const lines = text.substring(0, index).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

/**
 * Check for common spelling errors
 */
function checkSpelling(text: string): GrammarError[] {
  const errors: GrammarError[] = [];
  
  for (const [incorrect, correct] of Object.entries(COMMON_MEDICAL_SPELLING_ERRORS)) {
    const pattern = new RegExp(`\\b${incorrect}\\b`, 'gi');
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const position = calculatePosition(text, match.index);
      
      errors.push({
        type: 'spelling',
        original: match[0],
        correction: correct,
        explanation: `Spelling error: "${match[0]}" should be "${correct}"`,
        position: {
          start: match.index,
          end: match.index + match[0].length,
          line: position.line,
          column: position.column,
        },
        severity: 'error',
        rule_id: 'spelling_error',
      });
    }
  }
  
  return errors;
}

/**
 * Check for style and grammar issues using academic rules
 */
function checkAcademicStyle(text: string): GrammarError[] {
  const errors: GrammarError[] = [];
  
  for (const rule of ACADEMIC_STYLE_RULES) {
    let match;
    const pattern = new RegExp(rule.pattern);
    
    while ((match = pattern.exec(text)) !== null) {
      const position = calculatePosition(text, match.index);
      const correction = rule.getCorrection(match[0]);
      
      // Skip if correction is same as original (for suggestion-only rules)
      if (correction === match[0] && rule.severity === 'suggestion') {
        errors.push({
          type: rule.type,
          original: match[0],
          correction: match[0],
          explanation: rule.explanation,
          position: {
            start: match.index,
            end: match.index + match[0].length,
            line: position.line,
            column: position.column,
          },
          severity: rule.severity,
          rule_id: rule.id,
        });
      } else if (correction !== match[0]) {
        errors.push({
          type: rule.type,
          original: match[0],
          correction,
          explanation: rule.explanation,
          position: {
            start: match.index,
            end: match.index + match[0].length,
            line: position.line,
            column: position.column,
          },
          severity: rule.severity,
          rule_id: rule.id,
        });
      }
    }
  }
  
  return errors;
}

/**
 * Apply corrections to text
 */
function applyCorrections(text: string, errors: GrammarError[]): string {
  // Sort errors by position (reverse order to maintain indices)
  const sortedErrors = [...errors]
    .filter(e => e.correction !== e.original && e.severity === 'error')
    .sort((a, b) => b.position.start - a.position.start);
  
  let correctedText = text;
  
  for (const error of sortedErrors) {
    correctedText =
      correctedText.substring(0, error.position.start) +
      error.correction +
      correctedText.substring(error.position.end);
  }
  
  return correctedText;
}

/**
 * Calculate grammar score based on errors
 */
function calculateGrammarScore(
  errors: GrammarError[],
  wordCount: number
): number {
  // Base score
  let score = 1.0;
  
  // Deduct points based on error severity and frequency
  const errorWeight = {
    error: 0.05,
    warning: 0.02,
    suggestion: 0.01,
  };
  
  for (const error of errors) {
    score -= errorWeight[error.severity] / Math.max(1, wordCount / 100);
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate text statistics
 */
function calculateStatistics(text: string, errors: GrammarError[]): CheckGrammarOutput['statistics'] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const errorsByType: Record<ErrorType, number> = {
    grammar: 0,
    spelling: 0,
    style: 0,
    punctuation: 0,
    clarity: 0,
  };
  
  const errorsBySeverity: Record<ErrorSeverity, number> = {
    error: 0,
    warning: 0,
    suggestion: 0,
  };
  
  for (const error of errors) {
    errorsByType[error.type]++;
    errorsBySeverity[error.severity]++;
  }
  
  return {
    total_errors: errors.length,
    errors_by_type: errorsByType,
    errors_by_severity: errorsBySeverity,
    word_count: words.length,
    sentence_count: sentences.length,
    avg_sentence_length: words.length / Math.max(1, sentences.length),
  };
}

/**
 * Check grammar, spelling, and style
 * 
 * @param input - Text to check with options
 * @returns Grammar checking results with errors and corrections
 */
export async function checkGrammarAdvanced(
  input: CheckGrammarInput
): Promise<CheckGrammarOutput> {
  const startTime = Date.now();
  
  try {
    logger.info(`Starting grammar check for ${input.text.length} characters`);
    
    const style = input.style || 'academic_medical';
    const checkTypes = input.check_types || ['grammar', 'spelling', 'style', 'punctuation', 'clarity'];
    
    let allErrors: GrammarError[] = [];
    
    // Check spelling
    if (checkTypes.includes('spelling')) {
      const spellingErrors = checkSpelling(input.text);
      allErrors.push(...spellingErrors);
      logger.info(`Found ${spellingErrors.length} spelling errors`);
    }
    
    // Check academic style
    if (style === 'academic_medical') {
      const styleErrors = checkAcademicStyle(input.text);
      // Filter by requested check types
      const filteredStyleErrors = styleErrors.filter(e => checkTypes.includes(e.type));
      allErrors.push(...filteredStyleErrors);
      logger.info(`Found ${filteredStyleErrors.length} style/grammar issues`);
    }
    
    // Sort errors by position
    allErrors.sort((a, b) => a.position.start - b.position.start);
    
    // Apply corrections (only for errors, not warnings/suggestions)
    const correctedText = applyCorrections(input.text, allErrors);
    
    // Calculate statistics
    const statistics = calculateStatistics(input.text, allErrors);
    
    // Calculate grammar score
    const grammarScore = calculateGrammarScore(allErrors, statistics.word_count);
    
    const output: CheckGrammarOutput = {
      success: true,
      errors: allErrors,
      corrected_text: correctedText,
      grammar_score: grammarScore,
      statistics,
      processing_time_ms: Date.now() - startTime,
    };
    
    logger.info(`Grammar check complete: ${allErrors.length} issues found, score: ${(grammarScore * 100).toFixed(1)}%`);
    
    return output;
  } catch (error) {
    logger.error('Error in grammar checking:', error);
    throw error;
  }
}

/**
 * Generate grammar report in markdown format
 */
export function generateGrammarReport(output: CheckGrammarOutput): string {
  let report = `# Grammar and Style Check Report\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Grammar Score**: ${(output.grammar_score * 100).toFixed(1)}%\n`;
  report += `- **Total Issues**: ${output.statistics.total_errors}\n`;
  report += `- **Word Count**: ${output.statistics.word_count}\n`;
  report += `- **Sentence Count**: ${output.statistics.sentence_count}\n`;
  report += `- **Avg Sentence Length**: ${output.statistics.avg_sentence_length.toFixed(1)} words\n\n`;
  
  report += `## Issues by Type\n\n`;
  for (const [type, count] of Object.entries(output.statistics.errors_by_type)) {
    if (count > 0) {
      report += `- **${type.charAt(0).toUpperCase() + type.slice(1)}**: ${count}\n`;
    }
  }
  report += `\n`;
  
  report += `## Issues by Severity\n\n`;
  for (const [severity, count] of Object.entries(output.statistics.errors_by_severity)) {
    if (count > 0) {
      const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : '💡';
      report += `- ${icon} **${severity.charAt(0).toUpperCase() + severity.slice(1)}**: ${count}\n`;
    }
  }
  report += `\n`;
  
  // Group errors by severity
  const errorsBySeverity = {
    error: output.errors.filter(e => e.severity === 'error'),
    warning: output.errors.filter(e => e.severity === 'warning'),
    suggestion: output.errors.filter(e => e.severity === 'suggestion'),
  };
  
  // Report errors
  if (errorsBySeverity.error.length > 0) {
    report += `## ❌ Errors (${errorsBySeverity.error.length})\n\n`;
    errorsBySeverity.error.forEach((error, i) => {
      report += `### ${i + 1}. ${error.type.toUpperCase()} - Line ${error.position.line}\n\n`;
      report += `**Original**: \`${error.original}\`\n\n`;
      report += `**Correction**: \`${error.correction}\`\n\n`;
      report += `**Explanation**: ${error.explanation}\n\n`;
    });
  }
  
  // Report warnings
  if (errorsBySeverity.warning.length > 0) {
    report += `## ⚠️ Warnings (${errorsBySeverity.warning.length})\n\n`;
    errorsBySeverity.warning.slice(0, 10).forEach((error, i) => {
      report += `### ${i + 1}. ${error.type.toUpperCase()} - Line ${error.position.line}\n\n`;
      report += `**Found**: \`${error.original}\`\n\n`;
      report += `**Suggestion**: \`${error.correction}\`\n\n`;
      report += `**Explanation**: ${error.explanation}\n\n`;
    });
    if (errorsBySeverity.warning.length > 10) {
      report += `*... and ${errorsBySeverity.warning.length - 10} more warnings*\n\n`;
    }
  }
  
  // Report suggestions (limit to 5)
  if (errorsBySeverity.suggestion.length > 0) {
    report += `## 💡 Suggestions (${errorsBySeverity.suggestion.length})\n\n`;
    errorsBySeverity.suggestion.slice(0, 5).forEach((error) => {
      report += `- **Line ${error.position.line}**: ${error.explanation}\n`;
    });
    if (errorsBySeverity.suggestion.length > 5) {
      report += `\n*... and ${errorsBySeverity.suggestion.length - 5} more suggestions*\n`;
    }
    report += `\n`;
  }
  
  report += `---\n\n`;
  report += `**Processing Time**: ${output.processing_time_ms}ms\n`;
  report += `**Generated by**: MedResearch AI v5.0.0 - Grammar Checking Tool\n`;
  
  return report;
}
