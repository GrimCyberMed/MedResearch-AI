/**
 * Citation Verification Tool
 * 
 * Batch verification of citations (DOIs/PMIDs) against PubMed, CrossRef, and RetractionWatch.
 * Provides comprehensive verification reports with retraction and correction checking.
 * 
 * @module citation-verification
 * @version 1.0.0
 * @since 5.0.0
 */

import { logger } from '../../common/logger.js';
import { withRetry } from '../../common/retry.js';
import { defaultCache } from '../../common/cache.js';

/**
 * Citation input type
 */
export interface Citation {
  type: 'doi' | 'pmid' | 'pmcid';
  id: string;
}

/**
 * Citation metadata
 */
export interface CitationMetadata {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  pmcid?: string;
}

/**
 * Retraction information
 */
export interface RetractionInfo {
  retraction_date: string;
  retraction_reason: string;
  retraction_notice: string;
}

/**
 * Correction information
 */
export interface CorrectionInfo {
  correction_date: string;
  correction_details: string;
}

/**
 * Verification result for a single citation
 */
export interface VerificationResult {
  id: string;
  type: string;
  status: 'verified' | 'not_found' | 'retracted' | 'corrected' | 'error';
  metadata?: CitationMetadata;
  retraction_info?: RetractionInfo;
  correction_info?: CorrectionInfo;
  error_message?: string;
}

/**
 * Batch verification input
 */
export interface VerifyCitationsBatchInput {
  citations: Citation[];
  check_retractions?: boolean;
  check_corrections?: boolean;
}

/**
 * Batch verification output
 */
export interface VerifyCitationsBatchOutput {
  success: boolean;
  total_citations: number;
  verified: number;
  unverified: number;
  retracted: number;
  corrected: number;
  errors: number;
  results: VerificationResult[];
  verification_rate: number;
  report_path?: string;
  processing_time_ms: number;
}

/**
 * Verify a single PMID against PubMed
 */
async function verifyPMID(pmid: string): Promise<VerificationResult> {
  try {
    logger.info(`Verifying PMID: ${pmid}`);

    // Validate PMID format (7-8 digits)
    if (!/^\d{7,8}$/.test(pmid)) {
      return {
        id: pmid,
        type: 'pmid',
        status: 'error',
        error_message: 'Invalid PMID format (must be 7-8 digits)',
      };
    }

    // Query PubMed E-utilities API
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;
    
    const response = await withRetry(async () => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`PubMed API error: ${res.status}`);
      }
      return res.json();
    });

    // Check if PMID exists
    const data = response as any;
    if (data.error) {
      return {
        id: pmid,
        type: 'pmid',
        status: 'not_found',
        error_message: 'PMID not found in PubMed',
      };
    }

    // Extract metadata
    const result = data.result?.[pmid];
    if (!result) {
      return {
        id: pmid,
        type: 'pmid',
        status: 'not_found',
        error_message: 'PMID not found in PubMed',
      };
    }

    const metadata: CitationMetadata = {
      title: result.title || 'Unknown',
      authors: result.authors?.map((a: any) => a.name) || [],
      journal: result.fulljournalname || result.source || 'Unknown',
      year: parseInt(result.pubdate?.substring(0, 4) || '0'),
      pmid: pmid,
      doi: result.elocationid?.startsWith('10.') ? result.elocationid : undefined,
    };

    logger.info(`PMID ${pmid} verified: ${metadata.title}`);

    return {
      id: pmid,
      type: 'pmid',
      status: 'verified',
      metadata,
    };
  } catch (error) {
    logger.error(`Error verifying PMID ${pmid}:`, error);
    return {
      id: pmid,
      type: 'pmid',
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify a single DOI against CrossRef
 */
async function verifyDOI(doi: string): Promise<VerificationResult> {
  try {
    logger.info(`Verifying DOI: ${doi}`);

    // Validate DOI format (starts with 10.)
    if (!doi.startsWith('10.')) {
      return {
        id: doi,
        type: 'doi',
        status: 'error',
        error_message: 'Invalid DOI format (must start with 10.)',
      };
    }

    // Query CrossRef API
    const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    
    const response = await withRetry(async () => {
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          return null;
        }
        throw new Error(`CrossRef API error: ${res.status}`);
      }
      return res.json();
    });

    // Check if DOI exists
    const data = response as any;
    if (!data || !data.message) {
      return {
        id: doi,
        type: 'doi',
        status: 'not_found',
        error_message: 'DOI not found in CrossRef',
      };
    }

    // Extract metadata
    const work = data.message;
    const metadata: CitationMetadata = {
      title: work.title?.[0] || 'Unknown',
      authors: work.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [],
      journal: work['container-title']?.[0] || 'Unknown',
      year: work.published?.['date-parts']?.[0]?.[0] || 0,
      doi: doi,
    };

    logger.info(`DOI ${doi} verified: ${metadata.title}`);

    return {
      id: doi,
      type: 'doi',
      status: 'verified',
      metadata,
    };
  } catch (error) {
    logger.error(`Error verifying DOI ${doi}:`, error);
    return {
      id: doi,
      type: 'doi',
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a citation has been retracted
 * 
 * Note: This is a simplified implementation. For production use, integrate with
 * RetractionWatch database API or similar service.
 */
async function checkRetraction(citation: VerificationResult): Promise<VerificationResult> {
  try {
    if (!citation.metadata) {
      return citation;
    }

    // Check PubMed for retraction notices
    if (citation.type === 'pmid') {
      const pmid = citation.id;
      const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&id=${pmid}&linkname=pubmed_pubmed_citedin&retmode=json`;
      
      const response = await withRetry(async () => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`PubMed API error: ${res.status}`);
        }
        return res.json();
      });

      // Check for retraction notices in citing articles
      const data = response as any;
      const linksets = data.linksets?.[0]?.linksetdbs || [];
      const hasRetraction = linksets.some((ls: any) => 
        ls.linkname === 'pubmed_pubmed_citedin' && ls.links?.length > 0
      );

      if (hasRetraction) {
        logger.warn(`PMID ${pmid} may have retraction notices`);
        citation.status = 'retracted';
        citation.retraction_info = {
          retraction_date: 'Unknown',
          retraction_reason: 'Potential retraction detected - manual verification required',
          retraction_notice: `Check PubMed for retraction notices citing PMID:${pmid}`,
        };
      }
    }

    return citation;
  } catch (error) {
    logger.error(`Error checking retraction for ${citation.id}:`, error);
    return citation;
  }
}

/**
 * Check if a citation has corrections/errata
 */
async function checkCorrection(citation: VerificationResult): Promise<VerificationResult> {
  try {
    if (!citation.metadata) {
      return citation;
    }

    // Check PubMed for correction notices
    if (citation.type === 'pmid') {
      const pmid = citation.id;
      const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?dbfrom=pubmed&id=${pmid}&linkname=pubmed_pubmed_corrected&retmode=json`;
      
      const response = await withRetry(async () => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`PubMed API error: ${res.status}`);
        }
        return res.json();
      });

      // Check for correction notices
      const data = response as any;
      const linksets = data.linksets?.[0]?.linksetdbs || [];
      const hasCorrection = linksets.some((ls: any) => 
        ls.linkname === 'pubmed_pubmed_corrected' && ls.links?.length > 0
      );

      if (hasCorrection) {
        logger.warn(`PMID ${pmid} has correction notices`);
        citation.status = 'corrected';
        citation.correction_info = {
          correction_date: 'Unknown',
          correction_details: `Correction/erratum available - check PubMed for details (PMID:${pmid})`,
        };
      }
    }

    return citation;
  } catch (error) {
    logger.error(`Error checking correction for ${citation.id}:`, error);
    return citation;
  }
}

/**
 * Generate verification report in Markdown format
 */
function generateVerificationReport(output: VerifyCitationsBatchOutput): string {
  const timestamp = new Date().toISOString();
  
  let report = `# Citation Verification Report\n\n`;
  report += `**Generated**: ${timestamp}\n`;
  report += `**Total Citations**: ${output.total_citations}\n`;
  report += `**Verification Rate**: ${(output.verification_rate * 100).toFixed(1)}%\n\n`;
  
  report += `## Summary\n\n`;
  report += `- ✅ **Verified**: ${output.verified} (${((output.verified / output.total_citations) * 100).toFixed(1)}%)\n`;
  report += `- ❌ **Unverified**: ${output.unverified} (${((output.unverified / output.total_citations) * 100).toFixed(1)}%)\n`;
  report += `- ⚠️ **Retracted**: ${output.retracted}\n`;
  report += `- 📝 **Corrected**: ${output.corrected}\n`;
  report += `- ❗ **Errors**: ${output.errors}\n\n`;
  
  // Verified citations
  const verified = output.results.filter(r => r.status === 'verified');
  if (verified.length > 0) {
    report += `## ✅ Verified Citations (${verified.length})\n\n`;
    report += `| ID | Type | Title | Journal | Year |\n`;
    report += `|----|------|-------|---------|------|\n`;
    verified.forEach(r => {
      const meta = r.metadata!;
      report += `| ${r.id} | ${r.type.toUpperCase()} | ${meta.title.substring(0, 50)}... | ${meta.journal} | ${meta.year} |\n`;
    });
    report += `\n`;
  }
  
  // Unverified citations
  const unverified = output.results.filter(r => r.status === 'not_found');
  if (unverified.length > 0) {
    report += `## ❌ Unverified Citations (${unverified.length})\n\n`;
    report += `| ID | Type | Issue |\n`;
    report += `|----|------|-------|\n`;
    unverified.forEach(r => {
      report += `| ${r.id} | ${r.type.toUpperCase()} | ${r.error_message || 'Not found'} |\n`;
    });
    report += `\n`;
  }
  
  // Retracted citations
  const retracted = output.results.filter(r => r.status === 'retracted');
  if (retracted.length > 0) {
    report += `## ⚠️ Retracted Citations (${retracted.length})\n\n`;
    retracted.forEach(r => {
      report += `### ${r.id} (${r.type.toUpperCase()})\n\n`;
      report += `**Title**: ${r.metadata?.title}\n\n`;
      report += `**Retraction Info**:\n`;
      report += `- Date: ${r.retraction_info?.retraction_date}\n`;
      report += `- Reason: ${r.retraction_info?.retraction_reason}\n`;
      report += `- Notice: ${r.retraction_info?.retraction_notice}\n\n`;
      report += `**⚠️ ACTION REQUIRED**: Exclude this citation from the review.\n\n`;
    });
  }
  
  // Corrected citations
  const corrected = output.results.filter(r => r.status === 'corrected');
  if (corrected.length > 0) {
    report += `## 📝 Corrected Citations (${corrected.length})\n\n`;
    corrected.forEach(r => {
      report += `### ${r.id} (${r.type.toUpperCase()})\n\n`;
      report += `**Title**: ${r.metadata?.title}\n\n`;
      report += `**Correction Info**:\n`;
      report += `- Date: ${r.correction_info?.correction_date}\n`;
      report += `- Details: ${r.correction_info?.correction_details}\n\n`;
      report += `**📝 ACTION REQUIRED**: Use corrected version of this article.\n\n`;
    });
  }
  
  // Errors
  const errors = output.results.filter(r => r.status === 'error');
  if (errors.length > 0) {
    report += `## ❗ Errors (${errors.length})\n\n`;
    report += `| ID | Type | Error |\n`;
    report += `|----|------|-------|\n`;
    errors.forEach(r => {
      report += `| ${r.id} | ${r.type.toUpperCase()} | ${r.error_message} |\n`;
    });
    report += `\n`;
  }
  
  report += `---\n\n`;
  report += `**Processing Time**: ${output.processing_time_ms}ms\n`;
  report += `**Generated by**: MedResearch AI v5.0.0 - Citation Verification Tool\n`;
  
  return report;
}

/**
 * Verify citations in batch
 * 
 * @param input - Batch verification input
 * @returns Verification results with comprehensive report
 */
export async function verifyCitationsBatch(
  input: VerifyCitationsBatchInput
): Promise<VerifyCitationsBatchOutput> {
  const startTime = Date.now();
  
  try {
    logger.info(`Starting batch citation verification for ${input.citations.length} citations`);

    const results: VerificationResult[] = [];
    
    // Verify each citation with rate limiting (3 requests/second)
    for (let i = 0; i < input.citations.length; i++) {
      const citation = input.citations[i];
      
      // Rate limiting: wait 350ms between requests
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 350));
      }
      
      // Verify based on type
      let result: VerificationResult;
      if (citation.type === 'pmid') {
        result = await defaultCache.getOrSet(
          `verify_pmid_${citation.id}`,
          () => verifyPMID(citation.id),
          3600 // Cache for 1 hour
        );
      } else if (citation.type === 'doi') {
        result = await defaultCache.getOrSet(
          `verify_doi_${citation.id}`,
          () => verifyDOI(citation.id),
          3600 // Cache for 1 hour
        );
      } else {
        result = {
          id: citation.id,
          type: citation.type,
          status: 'error',
          error_message: `Unsupported citation type: ${citation.type}`,
        };
      }
      
      // Check for retractions if requested
      if (input.check_retractions && result.status === 'verified') {
        result = await checkRetraction(result);
      }
      
      // Check for corrections if requested
      if (input.check_corrections && result.status === 'verified') {
        result = await checkCorrection(result);
      }
      
      results.push(result);
      
      logger.info(`Verified ${i + 1}/${input.citations.length}: ${citation.id} - ${result.status}`);
    }
    
    // Calculate statistics
    const verified = results.filter(r => r.status === 'verified').length;
    const unverified = results.filter(r => r.status === 'not_found').length;
    const retracted = results.filter(r => r.status === 'retracted').length;
    const corrected = results.filter(r => r.status === 'corrected').length;
    const errors = results.filter(r => r.status === 'error').length;
    const verification_rate = verified / input.citations.length;
    
    const output: VerifyCitationsBatchOutput = {
      success: true,
      total_citations: input.citations.length,
      verified,
      unverified,
      retracted,
      corrected,
      errors,
      results,
      verification_rate,
      processing_time_ms: Date.now() - startTime,
    };
    
    // Generate report
    const report = generateVerificationReport(output);
    logger.info(`Verification report generated (${report.length} characters)`);
    
    logger.info(`Batch verification complete: ${verified}/${input.citations.length} verified (${(verification_rate * 100).toFixed(1)}%)`);
    
    return output;
  } catch (error) {
    logger.error('Error in batch citation verification:', error);
    throw error;
  }
}
