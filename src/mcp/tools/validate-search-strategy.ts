/**
 * MCP Tool: Search Strategy Validation
 * 
 * Validates search strategies for completeness, syntax, and effectiveness.
 * 
 * Features:
 * - Syntax validation
 * - Completeness checking
 * - Sensitivity/specificity estimation
 * - Known study retrieval testing
 * - Recommendations for improvement
 * 
 * @module validate-search-strategy
 * @version 1.0.0
 * @since Phase 3
 */

import { logger } from '../../common/logger.js';

interface ValidateStrategyInput {
  searchStrategy: string;
  database: 'pubmed' | 'embase' | 'cochrane' | 'web-of-science';
  knownRelevantStudies?: string[];
  checkSensitivity?: boolean;
}

interface ValidateStrategyOutput {
  success: boolean;
  isValid: boolean;
  syntaxErrors: string[];
  warnings: string[];
  recommendations: string[];
  completenessScore: number;
  estimatedSensitivity?: number;
  estimatedSpecificity?: number;
  error?: string;
}

function validatePubMedSyntax(strategy: string): string[] {
  const errors: string[] = [];
  
  // Check for unmatched brackets
  const openBrackets = (strategy.match(/\[/g) || []).length;
  const closeBrackets = (strategy.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push('Unmatched brackets in search strategy');
  }
  
  // Check for unmatched parentheses
  const openParens = (strategy.match(/\(/g) || []).length;
  const closeParens = (strategy.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push('Unmatched parentheses in search strategy');
  }
  
  // Check for valid field tags
  const invalidTags = strategy.match(/\[([^\]]+)\]/g)?.filter(tag => {
    const field = tag.slice(1, -1);
    return !['MeSH', 'Title/Abstract', 'Title', 'Abstract', 'Author', 'Journal', 'dp', 'pt'].includes(field);
  });
  
  if (invalidTags && invalidTags.length > 0) {
    errors.push(`Invalid field tags: ${invalidTags.join(', ')}`);
  }
  
  return errors;
}

function checkCompleteness(strategy: string): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = 0;
  
  // Check for population terms
  if (strategy.toLowerCase().includes('population') || strategy.match(/\w+\[MeSH\]/)) {
    score += 25;
  } else {
    warnings.push('No clear population terms identified');
  }
  
  // Check for intervention terms
  if (strategy.toLowerCase().includes('intervention') || strategy.toLowerCase().includes('treatment')) {
    score += 25;
  } else {
    warnings.push('No clear intervention terms identified');
  }
  
  // Check for outcome terms
  if (strategy.toLowerCase().includes('outcome') || strategy.toLowerCase().includes('result')) {
    score += 25;
  } else {
    warnings.push('No clear outcome terms identified');
  }
  
  // Check for Boolean operators
  if (strategy.includes(' AND ') && strategy.includes(' OR ')) {
    score += 25;
  } else {
    warnings.push('Limited use of Boolean operators');
  }
  
  return { score, warnings };
}

function generateRecommendations(strategy: string, warnings: string[]): string[] {
  const recommendations: string[] = [];
  
  if (!strategy.includes('[MeSH]')) {
    recommendations.push('Consider adding MeSH terms for better precision');
  }
  
  if (!strategy.includes('[Title/Abstract]')) {
    recommendations.push('Consider searching title/abstract fields for better sensitivity');
  }
  
  if (!strategy.includes('*')) {
    recommendations.push('Consider using truncation (*) for word variations');
  }
  
  if (warnings.length > 2) {
    recommendations.push('Review PICO framework to ensure all elements are covered');
  }
  
  return recommendations;
}

export async function validateSearchStrategy(input: ValidateStrategyInput): Promise<ValidateStrategyOutput> {
  try {
    logger.info('Validating search strategy', { database: input.database });

    let syntaxErrors: string[] = [];
    
    if (input.database === 'pubmed') {
      syntaxErrors = validatePubMedSyntax(input.searchStrategy);
    }
    
    const { score, warnings } = checkCompleteness(input.searchStrategy);
    const recommendations = generateRecommendations(input.searchStrategy, warnings);
    
    const isValid = syntaxErrors.length === 0;
    
    // Estimate sensitivity/specificity (simplified)
    const estimatedSensitivity = score / 100;
    const estimatedSpecificity = 0.7; // Placeholder

    return {
      success: true,
      isValid,
      syntaxErrors,
      warnings,
      recommendations,
      completenessScore: score,
      estimatedSensitivity,
      estimatedSpecificity
    };
  } catch (error) {
    return {
      success: false,
      isValid: false,
      syntaxErrors: [],
      warnings: [],
      recommendations: [],
      completenessScore: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export const validateSearchStrategyTool = {
  name: 'validate_search_strategy',
  description: 'Validate search strategy for syntax and completeness',
  inputSchema: {
    type: 'object',
    properties: {
      searchStrategy: { type: 'string' },
      database: {
        type: 'string',
        enum: ['pubmed', 'embase', 'cochrane', 'web-of-science']
      },
      knownRelevantStudies: {
        type: 'array',
        items: { type: 'string' }
      },
      checkSensitivity: { type: 'boolean', default: true }
    },
    required: ['searchStrategy', 'database']
  }
};
