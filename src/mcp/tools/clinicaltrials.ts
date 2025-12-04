/**
 * ClinicalTrials.gov Integration Tool
 * 
 * Tool for searching ClinicalTrials.gov database (450K+ clinical trials)
 * API Documentation: https://clinicaltrials.gov/data-api/api
 */

import https from 'https';
import { URLSearchParams } from 'url';

interface ClinicalTrialsSearchArgs {
  query: string;
  max_results?: number;
  status?: ('RECRUITING' | 'NOT_YET_RECRUITING' | 'COMPLETED' | 'TERMINATED' | 'SUSPENDED' | 'WITHDRAWN')[];
  phase?: ('EARLY_PHASE1' | 'PHASE1' | 'PHASE2' | 'PHASE3' | 'PHASE4')[];
  study_type?: ('INTERVENTIONAL' | 'OBSERVATIONAL' | 'EXPANDED_ACCESS')[];
  country?: string;
}

interface ClinicalTrialResult {
  nct_id: string;
  title: string;
  status: string;
  phase?: string;
  study_type: string;
  conditions: string[];
  interventions: string[];
  sponsor: string;
  start_date?: string;
  completion_date?: string;
  enrollment?: number;
  locations?: Array<{
    facility: string;
    city: string;
    country: string;
  }>;
  brief_summary?: string;
  url: string;
}

/**
 * Make HTTPS request helper
 */
function httpsRequest(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Search ClinicalTrials.gov database
 */
export async function searchClinicalTrials(args: ClinicalTrialsSearchArgs) {
  const {
    query,
    max_results = 100,
    status = [],
    phase = [],
    study_type = [],
    country,
  } = args;

  // Validate inputs
  if (!query || query.trim() === '') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'Search query cannot be empty',
        }, null, 2),
      }],
      isError: true,
    };
  }

  if (max_results < 1 || max_results > 10000) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'max_results must be between 1 and 10000',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    // Build query parameters
    const params: any = {
      'query.cond': query,
      'pageSize': Math.min(max_results, 1000),
      'format': 'json',
    };

    // Add filters
    if (status.length > 0) {
      params['filter.overallStatus'] = status.join(',');
    }

    if (phase.length > 0) {
      params['filter.phase'] = phase.join(',');
    }

    if (study_type.length > 0) {
      params['filter.studyType'] = study_type.join(',');
    }

    if (country) {
      params['filter.geo'] = `country:${country}`;
    }

    const searchParams = new URLSearchParams(params);
    const searchUrl = `https://clinicaltrials.gov/api/v2/studies?${searchParams}`;

    const searchData = await httpsRequest(searchUrl);
    const searchResult = JSON.parse(searchData);

    if (!searchResult.studies || searchResult.studies.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            query,
            count: 0,
            retrieved: 0,
            results: [],
          }, null, 2),
        }],
      };
    }

    const results: ClinicalTrialResult[] = searchResult.studies.map((study: any) => {
      const protocolSection = study.protocolSection || {};
      const identificationModule = protocolSection.identificationModule || {};
      const statusModule = protocolSection.statusModule || {};
      const descriptionModule = protocolSection.descriptionModule || {};
      const conditionsModule = protocolSection.conditionsModule || {};
      const armsInterventionsModule = protocolSection.armsInterventionsModule || {};
      const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};
      const designModule = protocolSection.designModule || {};
      const contactsLocationsModule = protocolSection.contactsLocationsModule || {};

      return {
        nct_id: identificationModule.nctId,
        title: identificationModule.officialTitle || identificationModule.briefTitle,
        status: statusModule.overallStatus,
        phase: designModule.phases?.[0],
        study_type: designModule.studyType,
        conditions: conditionsModule.conditions || [],
        interventions: armsInterventionsModule.interventions?.map((i: any) => i.name) || [],
        sponsor: sponsorCollaboratorsModule.leadSponsor?.name,
        start_date: statusModule.startDateStruct?.date,
        completion_date: statusModule.completionDateStruct?.date,
        enrollment: statusModule.enrollmentInfo?.count,
        locations: contactsLocationsModule.locations?.slice(0, 5).map((loc: any) => ({
          facility: loc.facility,
          city: loc.city,
          country: loc.country,
        })),
        brief_summary: descriptionModule.briefSummary,
        url: `https://clinicaltrials.gov/study/${identificationModule.nctId}`,
      };
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          query,
          count: searchResult.totalCount || results.length,
          retrieved: results.length,
          results,
        }, null, 2),
      }],
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          query,
        }, null, 2),
      }],
      isError: true,
    };
  }
}

/**
 * Get clinical trial details by NCT ID
 */
export async function getClinicalTrial(args: { nct_id: string }) {
  const { nct_id } = args;

  if (!nct_id || nct_id.trim() === '') {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'nct_id is required (e.g., NCT04280705)',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    const url = `https://clinicaltrials.gov/api/v2/studies/${nct_id}`;
    const data = await httpsRequest(url);
    const result = JSON.parse(data);

    if (!result.protocolSection) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Clinical trial not found',
            nct_id,
          }, null, 2),
        }],
        isError: true,
      };
    }

    const protocolSection = result.protocolSection;
    const identificationModule = protocolSection.identificationModule || {};
    const statusModule = protocolSection.statusModule || {};
    const descriptionModule = protocolSection.descriptionModule || {};
    const conditionsModule = protocolSection.conditionsModule || {};
    const armsInterventionsModule = protocolSection.armsInterventionsModule || {};
    const outcomesModule = protocolSection.outcomesModule || {};
    const eligibilityModule = protocolSection.eligibilityModule || {};
    const contactsLocationsModule = protocolSection.contactsLocationsModule || {};
    const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};
    const designModule = protocolSection.designModule || {};

    const trial = {
      nct_id: identificationModule.nctId,
      title: identificationModule.officialTitle || identificationModule.briefTitle,
      brief_title: identificationModule.briefTitle,
      status: statusModule.overallStatus,
      phase: designModule.phases,
      study_type: designModule.studyType,
      conditions: conditionsModule.conditions,
      interventions: armsInterventionsModule.interventions,
      primary_outcomes: outcomesModule.primaryOutcomes,
      secondary_outcomes: outcomesModule.secondaryOutcomes,
      sponsor: sponsorCollaboratorsModule.leadSponsor,
      collaborators: sponsorCollaboratorsModule.collaborators,
      start_date: statusModule.startDateStruct,
      completion_date: statusModule.completionDateStruct,
      enrollment: statusModule.enrollmentInfo,
      eligibility: {
        criteria: eligibilityModule.eligibilityCriteria,
        gender: eligibilityModule.sex,
        minimum_age: eligibilityModule.minimumAge,
        maximum_age: eligibilityModule.maximumAge,
        healthy_volunteers: eligibilityModule.healthyVolunteers,
      },
      locations: contactsLocationsModule.locations,
      brief_summary: descriptionModule.briefSummary,
      detailed_description: descriptionModule.detailedDescription,
      study_design: designModule.designInfo,
      arms: armsInterventionsModule.armGroups,
      url: `https://clinicaltrials.gov/study/${identificationModule.nctId}`,
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          trial,
        }, null, 2),
      }],
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          nct_id,
        }, null, 2),
      }],
      isError: true,
    };
  }
}
