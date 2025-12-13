/**
 * Study Design Taxonomy for MedResearch AI v6.0.0
 * 
 * Comprehensive taxonomy of 15+ study designs with hierarchical classification,
 * decision criteria, and metadata for automated classification.
 * 
 * Based on:
 * - Cochrane Handbook for Systematic Reviews
 * - STROBE Statement
 * - CONSORT Statement
 * - PRISMA 2020
 * - Medical research methodology literature
 */

/**
 * Study design categories (primary classification)
 */
export enum StudyDesignCategory {
  EXPERIMENTAL = 'experimental',
  OBSERVATIONAL = 'observational',
  REVIEW = 'review',
  QUALITATIVE = 'qualitative',
  MIXED_METHODS = 'mixed_methods',
  DIAGNOSTIC = 'diagnostic',
  PROGNOSTIC = 'prognostic',
  OTHER = 'other',
}

/**
 * Study design types (specific designs)
 */
export enum StudyDesignType {
  // Experimental
  RCT_PARALLEL = 'rct_parallel',
  RCT_CROSSOVER = 'rct_crossover',
  RCT_CLUSTER = 'rct_cluster',
  RCT_FACTORIAL = 'rct_factorial',
  RCT_ADAPTIVE = 'rct_adaptive',
  RCT_STEPPED_WEDGE = 'rct_stepped_wedge',
  QUASI_EXPERIMENTAL = 'quasi_experimental',
  N_OF_1 = 'n_of_1',
  
  // Observational
  COHORT_PROSPECTIVE = 'cohort_prospective',
  COHORT_RETROSPECTIVE = 'cohort_retrospective',
  CASE_CONTROL = 'case_control',
  CROSS_SECTIONAL = 'cross_sectional',
  CASE_REPORT = 'case_report',
  CASE_SERIES = 'case_series',
  ECOLOGICAL = 'ecological',
  
  // Review
  SYSTEMATIC_REVIEW = 'systematic_review',
  META_ANALYSIS = 'meta_analysis',
  NETWORK_META_ANALYSIS = 'network_meta_analysis',
  SCOPING_REVIEW = 'scoping_review',
  UMBRELLA_REVIEW = 'umbrella_review',
  RAPID_REVIEW = 'rapid_review',
  NARRATIVE_REVIEW = 'narrative_review',
  
  // Qualitative
  PHENOMENOLOGY = 'phenomenology',
  GROUNDED_THEORY = 'grounded_theory',
  ETHNOGRAPHY = 'ethnography',
  QUALITATIVE_DESCRIPTIVE = 'qualitative_descriptive',
  
  // Mixed Methods
  CONVERGENT = 'convergent',
  EXPLANATORY_SEQUENTIAL = 'explanatory_sequential',
  EXPLORATORY_SEQUENTIAL = 'exploratory_sequential',
  
  // Diagnostic
  DIAGNOSTIC_ACCURACY = 'diagnostic_accuracy',
  
  // Prognostic
  PROGNOSTIC_FACTOR = 'prognostic_factor',
  PREDICTION_MODEL = 'prediction_model',
  
  // Other
  UNKNOWN = 'unknown',
}

/**
 * RCT phase classification
 */
export enum RCTPhase {
  PHASE_0 = 'phase_0',
  PHASE_1 = 'phase_1',
  PHASE_2 = 'phase_2',
  PHASE_3 = 'phase_3',
  PHASE_4 = 'phase_4',
  NOT_APPLICABLE = 'not_applicable',
}

/**
 * Study design metadata
 */
export interface StudyDesignMetadata {
  type: StudyDesignType;
  category: StudyDesignCategory;
  name: string;
  description: string;
  aliases: string[];
  
  // Hierarchical classification
  parent?: StudyDesignType;
  subtypes?: StudyDesignType[];
  
  // Characteristics
  characteristics: {
    randomization: boolean;
    prospective: boolean;
    controlled: boolean;
    blinding_possible: boolean;
    intervention: boolean;
    longitudinal: boolean;
  };
  
  // Quality assessment tools
  quality_tools: string[];
  
  // Reporting guidelines
  reporting_guidelines: string[];
  
  // Typical use cases
  use_cases: string[];
  
  // Strengths and limitations
  strengths: string[];
  limitations: string[];
  
  // Evidence level (Oxford CEBM)
  evidence_level: number; // 1-5
}

/**
 * Complete study design taxonomy
 */
export const STUDY_DESIGN_TAXONOMY: Record<StudyDesignType, StudyDesignMetadata> = {
  // ========================================
  // EXPERIMENTAL DESIGNS
  // ========================================
  
  [StudyDesignType.RCT_PARALLEL]: {
    type: StudyDesignType.RCT_PARALLEL,
    category: StudyDesignCategory.EXPERIMENTAL,
    name: 'Randomized Controlled Trial (Parallel Group)',
    description: 'Participants are randomly allocated to intervention or control groups and followed concurrently',
    aliases: ['parallel RCT', 'parallel-group trial', 'two-arm RCT', 'randomized trial'],
    
    characteristics: {
      randomization: true,
      prospective: true,
      controlled: true,
      blinding_possible: true,
      intervention: true,
      longitudinal: true,
    },
    
    quality_tools: ['Cochrane RoB 2.0', 'Jadad Scale', 'PEDro Scale'],
    reporting_guidelines: ['CONSORT 2010'],
    
    use_cases: [
      'Drug efficacy trials',
      'Intervention effectiveness studies',
      'Treatment comparisons',
      'Prevention trials',
    ],
    
    strengths: [
      'Gold standard for causal inference',
      'Minimizes selection bias',
      'Allows blinding',
      'High internal validity',
    ],
    
    limitations: [
      'Expensive and time-consuming',
      'May have limited external validity',
      'Ethical constraints for some interventions',
      'Recruitment challenges',
    ],
    
    evidence_level: 1,
  },
  
  [StudyDesignType.RCT_CROSSOVER]: {
    type: StudyDesignType.RCT_CROSSOVER,
    category: StudyDesignCategory.EXPERIMENTAL,
    name: 'Crossover Randomized Controlled Trial',
    description: 'Each participant receives both intervention and control in random order, separated by washout period',
    aliases: ['crossover trial', 'cross-over RCT', 'within-subject trial'],
    parent: StudyDesignType.RCT_PARALLEL,
    
    characteristics: {
      randomization: true,
      prospective: true,
      controlled: true,
      blinding_possible: true,
      intervention: true,
      longitudinal: true,
    },
    
    quality_tools: ['Cochrane RoB 2.0 (crossover variant)', 'Jadad Scale'],
    reporting_guidelines: ['CONSORT 2010 (crossover extension)'],
    
    use_cases: [
      'Chronic stable conditions',
      'Short-term symptomatic treatments',
      'Pharmacokinetic studies',
      'Behavioral interventions',
    ],
    
    strengths: [
      'Each participant is own control',
      'Smaller sample size needed',
      'Eliminates between-subject variability',
      'More statistical power',
    ],
    
    limitations: [
      'Carryover effects possible',
      'Requires washout period',
      'Not suitable for curative treatments',
      'Longer study duration',
      'Dropout risk increases',
    ],
    
    evidence_level: 1,
  },
  
  [StudyDesignType.RCT_CLUSTER]: {
    type: StudyDesignType.RCT_CLUSTER,
    category: StudyDesignCategory.EXPERIMENTAL,
    name: 'Cluster Randomized Controlled Trial',
    description: 'Groups (clusters) rather than individuals are randomized to intervention or control',
    aliases: ['cluster RCT', 'group-randomized trial', 'place-randomized trial'],
    parent: StudyDesignType.RCT_PARALLEL,
    
    characteristics: {
      randomization: true,
      prospective: true,
      controlled: true,
      blinding_possible: false,
      intervention: true,
      longitudinal: true,
    },
    
    quality_tools: ['Cochrane RoB 2.0 (cluster variant)'],
    reporting_guidelines: ['CONSORT 2010 (cluster extension)'],
    
    use_cases: [
      'Community interventions',
      'School-based programs',
      'Hospital ward interventions',
      'Policy evaluations',
    ],
    
    strengths: [
      'Reduces contamination',
      'Suitable for community interventions',
      'Reflects real-world implementation',
      'Logistically easier in some settings',
    ],
    
    limitations: [
      'Requires larger sample size',
      'Intracluster correlation reduces power',
      'Complex statistical analysis',
      'Risk of selection bias',
    ],
    
    evidence_level: 1,
  },
  
  [StudyDesignType.RCT_FACTORIAL]: {
    type: StudyDesignType.RCT_FACTORIAL,
    category: StudyDesignCategory.EXPERIMENTAL,
    name: 'Factorial Randomized Controlled Trial',
    description: 'Tests two or more interventions simultaneously in a single trial',
    aliases: ['factorial trial', 'factorial design', '2x2 factorial'],
    parent: StudyDesignType.RCT_PARALLEL,
    
    characteristics: {
      randomization: true,
      prospective: true,
      controlled: true,
      blinding_possible: true,
      intervention: true,
      longitudinal: true,
    },
    
    quality_tools: ['Cochrane RoB 2.0'],
    reporting_guidelines: ['CONSORT 2010 (factorial extension)'],
    
    use_cases: [
      'Multiple intervention testing',
      'Interaction effect studies',
      'Combination therapy trials',
      'Efficiency in drug development',
    ],
    
    strengths: [
      'Tests multiple interventions efficiently',
      'Can assess interaction effects',
      'More cost-effective than separate trials',
      'Larger evidence base from single trial',
    ],
    
    limitations: [
      'Assumes no interaction (often violated)',
      'Complex interpretation if interactions exist',
      'Larger sample size needed',
      'Statistical complexity',
    ],
    
    evidence_level: 1,
  },
  
  [StudyDesignType.RCT_ADAPTIVE]: {
    type: StudyDesignType.RCT_ADAPTIVE,
    category: StudyDesignCategory.EXPERIMENTAL,
    name: 'Adaptive Randomized Controlled Trial',
    description: 'Trial design can be modified based on interim results while maintaining validity',
    aliases: ['adaptive trial', 'adaptive design', 'flexible trial'],
    parent: StudyDesignType.RCT_PARALLEL,
    
    characteristics: {
      randomization: true,
      prospective: true,
      controlled: true,
      blinding_possible: true,
      intervention: true,
      longitudinal: true,
    },
    
    quality_tools: ['Cochrane RoB 2.0'],
    reporting_guidelines: ['CONSORT 2010', 'ACE guidelines'],
    
    use_cases: [
      'Rare diseases',
      'Oncology trials',
      'Dose-finding studies',
      'Seamless Phase II/III trials',
    ],
    
    strengths: [
      'More efficient use of resources',
      'Ethical advantages (fewer on inferior arm)',
      'Faster decision-making',
      'Can stop early for efficacy/futility',
    ],
    
    limitations: [
      'Complex design and analysis',
      'Risk of bias if not properly controlled',
      'Regulatory challenges',
      'Requires careful planning',
    ],
    
    evidence_level: 1,
  },
  
  [StudyDesignType.RCT_STEPPED_WEDGE]: {
    type: StudyDesignType.RCT_STEPPED_WEDGE,
    category: StudyDesignCategory.EXPERIMENTAL,
    name: 'Stepped-Wedge Randomized Controlled Trial',
    description: 'Intervention is rolled out sequentially to clusters over time until all receive it',
    aliases: ['stepped wedge', 'stepped-wedge cluster trial'],
    parent: StudyDesignType.RCT_CLUSTER,
    
    characteristics: {
      randomization: true,
      prospective: true,
      controlled: true,
      blinding_possible: false,
      intervention: true,
      longitudinal: true,
    },
    
    quality_tools: ['Cochrane RoB 2.0 (cluster variant)'],
    reporting_guidelines: ['CONSORT 2010 (stepped-wedge extension)'],
    
    use_cases: [
      'Service delivery interventions',
      'Quality improvement programs',
      'Policy rollouts',
      'When withholding intervention is unethical',
    ],
    
    strengths: [
      'All clusters eventually receive intervention',
      'Ethically acceptable when intervention believed beneficial',
      'Controls for temporal trends',
      'Suitable for logistical constraints',
    ],
    
    limitations: [
      'Complex analysis',
      'Assumes no time-by-intervention interaction',
      'Longer duration',
      'Contamination risk',
    ],
    
    evidence_level: 1,
  },
  
  [StudyDesignType.QUASI_EXPERIMENTAL]: {
    type: StudyDesignType.QUASI_EXPERIMENTAL,
    category: StudyDesignCategory.EXPERIMENTAL,
    name: 'Quasi-Experimental Study',
    description: 'Intervention study without randomization (e.g., interrupted time series, regression discontinuity)',
    aliases: ['quasi-experiment', 'non-randomized trial', 'ITS', 'regression discontinuity'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: true,
      blinding_possible: false,
      intervention: true,
      longitudinal: true,
    },
    
    quality_tools: ['ROBINS-I', 'Newcastle-Ottawa Scale'],
    reporting_guidelines: ['TREND Statement'],
    
    use_cases: [
      'Policy evaluations',
      'Natural experiments',
      'When randomization not feasible',
      'Public health interventions',
    ],
    
    strengths: [
      'Feasible when RCT not possible',
      'Can evaluate real-world interventions',
      'Less expensive than RCT',
      'Larger sample sizes possible',
    ],
    
    limitations: [
      'Selection bias risk',
      'Confounding',
      'Weaker causal inference',
      'Temporal confounding',
    ],
    
    evidence_level: 2,
  },
  
  [StudyDesignType.N_OF_1]: {
    type: StudyDesignType.N_OF_1,
    category: StudyDesignCategory.EXPERIMENTAL,
    name: 'N-of-1 Trial',
    description: 'Single-patient crossover trial with multiple treatment periods',
    aliases: ['n-of-1', 'single-patient trial', 'single-case experimental design'],
    
    characteristics: {
      randomization: true,
      prospective: true,
      controlled: true,
      blinding_possible: true,
      intervention: true,
      longitudinal: true,
    },
    
    quality_tools: ['CENT criteria'],
    reporting_guidelines: ['CONSORT extension for N-of-1 trials'],
    
    use_cases: [
      'Personalized medicine',
      'Rare conditions',
      'Heterogeneous treatment response',
      'Chronic stable conditions',
    ],
    
    strengths: [
      'Individualized treatment optimization',
      'Patient is own control',
      'High internal validity for individual',
      'Ethical when standard treatment unclear',
    ],
    
    limitations: [
      'Limited generalizability',
      'Requires stable condition',
      'Carryover effects',
      'Time-consuming',
    ],
    
    evidence_level: 1,
  },
  
  // ========================================
  // OBSERVATIONAL DESIGNS
  // ========================================
  
  [StudyDesignType.COHORT_PROSPECTIVE]: {
    type: StudyDesignType.COHORT_PROSPECTIVE,
    category: StudyDesignCategory.OBSERVATIONAL,
    name: 'Prospective Cohort Study',
    description: 'Participants are followed forward in time from exposure to outcome',
    aliases: ['prospective cohort', 'concurrent cohort', 'longitudinal study', 'follow-up study'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: true,
    },
    
    quality_tools: ['Newcastle-Ottawa Scale', 'ROBINS-I'],
    reporting_guidelines: ['STROBE Statement'],
    
    use_cases: [
      'Risk factor identification',
      'Incidence studies',
      'Natural history of disease',
      'Rare exposures',
    ],
    
    strengths: [
      'Temporal sequence clear',
      'Multiple outcomes can be studied',
      'Incidence can be calculated',
      'Less recall bias',
    ],
    
    limitations: [
      'Expensive and time-consuming',
      'Loss to follow-up',
      'Not suitable for rare outcomes',
      'Confounding',
    ],
    
    evidence_level: 2,
  },
  
  [StudyDesignType.COHORT_RETROSPECTIVE]: {
    type: StudyDesignType.COHORT_RETROSPECTIVE,
    category: StudyDesignCategory.OBSERVATIONAL,
    name: 'Retrospective Cohort Study',
    description: 'Historical data used to identify exposure and follow participants to outcome',
    aliases: ['retrospective cohort', 'historical cohort', 'non-concurrent cohort'],
    parent: StudyDesignType.COHORT_PROSPECTIVE,
    
    characteristics: {
      randomization: false,
      prospective: false,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: true,
    },
    
    quality_tools: ['Newcastle-Ottawa Scale', 'ROBINS-I'],
    reporting_guidelines: ['STROBE Statement'],
    
    use_cases: [
      'Occupational exposures',
      'Medical record studies',
      'Faster than prospective cohort',
      'Rare exposures with long latency',
    ],
    
    strengths: [
      'Faster and cheaper than prospective',
      'Large sample sizes possible',
      'Good for rare exposures',
      'No loss to follow-up during data collection',
    ],
    
    limitations: [
      'Relies on existing records',
      'Missing data common',
      'Measurement bias',
      'Confounding',
    ],
    
    evidence_level: 2,
  },
  
  [StudyDesignType.CASE_CONTROL]: {
    type: StudyDesignType.CASE_CONTROL,
    category: StudyDesignCategory.OBSERVATIONAL,
    name: 'Case-Control Study',
    description: 'Participants with outcome (cases) compared to those without (controls) for past exposures',
    aliases: ['case-control', 'case-referent study', 'retrospective study'],
    
    characteristics: {
      randomization: false,
      prospective: false,
      controlled: true,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['Newcastle-Ottawa Scale', 'ROBINS-I'],
    reporting_guidelines: ['STROBE Statement'],
    
    use_cases: [
      'Rare diseases',
      'Diseases with long latency',
      'Outbreak investigations',
      'Multiple exposures for one outcome',
    ],
    
    strengths: [
      'Efficient for rare outcomes',
      'Relatively quick and inexpensive',
      'Small sample size needed',
      'Can study multiple exposures',
    ],
    
    limitations: [
      'Recall bias',
      'Selection bias in control selection',
      'Cannot calculate incidence',
      'Temporal ambiguity possible',
    ],
    
    evidence_level: 3,
  },
  
  [StudyDesignType.CROSS_SECTIONAL]: {
    type: StudyDesignType.CROSS_SECTIONAL,
    category: StudyDesignCategory.OBSERVATIONAL,
    name: 'Cross-Sectional Study',
    description: 'Exposure and outcome measured simultaneously at one point in time',
    aliases: ['cross-sectional', 'prevalence study', 'survey'],
    
    characteristics: {
      randomization: false,
      prospective: false,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['JBI Critical Appraisal Checklist', 'AXIS tool'],
    reporting_guidelines: ['STROBE Statement'],
    
    use_cases: [
      'Prevalence estimation',
      'Hypothesis generation',
      'Public health surveillance',
      'Needs assessment',
    ],
    
    strengths: [
      'Quick and inexpensive',
      'Good for prevalence',
      'Can study multiple outcomes/exposures',
      'Generates hypotheses',
    ],
    
    limitations: [
      'Cannot establish causality',
      'Temporal ambiguity',
      'Not suitable for rare conditions',
      'Survival bias',
    ],
    
    evidence_level: 4,
  },
  
  [StudyDesignType.CASE_REPORT]: {
    type: StudyDesignType.CASE_REPORT,
    category: StudyDesignCategory.OBSERVATIONAL,
    name: 'Case Report',
    description: 'Detailed report of a single patient case',
    aliases: ['case report', 'case study'],
    
    characteristics: {
      randomization: false,
      prospective: false,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['JBI Case Report Checklist', 'CARE checklist'],
    reporting_guidelines: ['CARE Guidelines'],
    
    use_cases: [
      'Novel diseases',
      'Rare adverse events',
      'Unusual presentations',
      'Hypothesis generation',
    ],
    
    strengths: [
      'Documents rare phenomena',
      'Generates hypotheses',
      'Educational value',
      'Quick to publish',
    ],
    
    limitations: [
      'No generalizability',
      'No statistical analysis',
      'Cannot establish causality',
      'Publication bias',
    ],
    
    evidence_level: 5,
  },
  
  [StudyDesignType.CASE_SERIES]: {
    type: StudyDesignType.CASE_SERIES,
    category: StudyDesignCategory.OBSERVATIONAL,
    name: 'Case Series',
    description: 'Descriptive study of a group of patients with similar condition',
    aliases: ['case series', 'case collection'],
    parent: StudyDesignType.CASE_REPORT,
    
    characteristics: {
      randomization: false,
      prospective: false,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['JBI Case Series Checklist'],
    reporting_guidelines: ['CARE Guidelines (adapted)'],
    
    use_cases: [
      'Rare diseases',
      'New surgical techniques',
      'Adverse event patterns',
      'Natural history description',
    ],
    
    strengths: [
      'Better than single case report',
      'Can identify patterns',
      'Useful for rare conditions',
      'Hypothesis generation',
    ],
    
    limitations: [
      'No control group',
      'Selection bias',
      'Cannot establish causality',
      'Limited generalizability',
    ],
    
    evidence_level: 4,
  },
  
  [StudyDesignType.ECOLOGICAL]: {
    type: StudyDesignType.ECOLOGICAL,
    category: StudyDesignCategory.OBSERVATIONAL,
    name: 'Ecological Study',
    description: 'Population-level analysis comparing groups rather than individuals',
    aliases: ['ecological study', 'aggregate study', 'population study'],
    
    characteristics: {
      randomization: false,
      prospective: false,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['Newcastle-Ottawa Scale (adapted)'],
    reporting_guidelines: ['STROBE Statement'],
    
    use_cases: [
      'Public health surveillance',
      'Hypothesis generation',
      'Policy evaluation',
      'Geographic variation studies',
    ],
    
    strengths: [
      'Uses existing data',
      'Inexpensive',
      'Large populations',
      'Generates hypotheses',
    ],
    
    limitations: [
      'Ecological fallacy',
      'Cannot infer individual-level associations',
      'Confounding',
      'Data quality issues',
    ],
    
    evidence_level: 4,
  },
  
  // ========================================
  // REVIEW DESIGNS
  // ========================================
  
  [StudyDesignType.SYSTEMATIC_REVIEW]: {
    type: StudyDesignType.SYSTEMATIC_REVIEW,
    category: StudyDesignCategory.REVIEW,
    name: 'Systematic Review',
    description: 'Comprehensive, reproducible synthesis of all available evidence on a specific question',
    aliases: ['systematic review', 'SR', 'evidence synthesis'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: true,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['AMSTAR 2', 'ROBIS'],
    reporting_guidelines: ['PRISMA 2020'],
    
    use_cases: [
      'Evidence-based guidelines',
      'Clinical decision-making',
      'Identifying research gaps',
      'Policy development',
    ],
    
    strengths: [
      'Comprehensive evidence synthesis',
      'Reproducible methods',
      'Reduces bias',
      'High-quality evidence',
    ],
    
    limitations: [
      'Time-consuming',
      'Resource-intensive',
      'Publication bias',
      'Heterogeneity challenges',
    ],
    
    evidence_level: 1,
  },
  
  [StudyDesignType.META_ANALYSIS]: {
    type: StudyDesignType.META_ANALYSIS,
    category: StudyDesignCategory.REVIEW,
    name: 'Meta-Analysis',
    description: 'Statistical synthesis of quantitative results from multiple studies',
    aliases: ['meta-analysis', 'quantitative synthesis', 'pooled analysis'],
    parent: StudyDesignType.SYSTEMATIC_REVIEW,
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: true,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['AMSTAR 2', 'ROBIS'],
    reporting_guidelines: ['PRISMA 2020'],
    
    use_cases: [
      'Pooling effect estimates',
      'Increasing statistical power',
      'Resolving controversies',
      'Subgroup analysis',
    ],
    
    strengths: [
      'Increased statistical power',
      'Precise effect estimates',
      'Can explore heterogeneity',
      'Objective synthesis',
    ],
    
    limitations: [
      'Garbage in, garbage out',
      'Publication bias',
      'Heterogeneity',
      'Requires similar studies',
    ],
    
    evidence_level: 1,
  },
  
  [StudyDesignType.NETWORK_META_ANALYSIS]: {
    type: StudyDesignType.NETWORK_META_ANALYSIS,
    category: StudyDesignCategory.REVIEW,
    name: 'Network Meta-Analysis',
    description: 'Simultaneous comparison of multiple interventions using direct and indirect evidence',
    aliases: ['network meta-analysis', 'NMA', 'mixed treatment comparison', 'multiple treatment meta-analysis'],
    parent: StudyDesignType.META_ANALYSIS,
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: true,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['AMSTAR 2', 'CINeMA'],
    reporting_guidelines: ['PRISMA-NMA'],
    
    use_cases: [
      'Comparing multiple treatments',
      'Ranking interventions',
      'Indirect comparisons',
      'Treatment guidelines',
    ],
    
    strengths: [
      'Compares multiple treatments simultaneously',
      'Uses all available evidence',
      'Can rank treatments',
      'Provides indirect comparisons',
    ],
    
    limitations: [
      'Assumes transitivity',
      'Complex methodology',
      'Inconsistency issues',
      'Requires specialized expertise',
    ],
    
    evidence_level: 1,
  },
  
  [StudyDesignType.SCOPING_REVIEW]: {
    type: StudyDesignType.SCOPING_REVIEW,
    category: StudyDesignCategory.REVIEW,
    name: 'Scoping Review',
    description: 'Maps the key concepts, evidence types, and gaps in a research area',
    aliases: ['scoping review', 'scoping study', 'evidence map'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['PRISMA-ScR checklist'],
    reporting_guidelines: ['PRISMA-ScR'],
    
    use_cases: [
      'Mapping research landscape',
      'Identifying research gaps',
      'Clarifying concepts',
      'Informing systematic reviews',
    ],
    
    strengths: [
      'Broad coverage',
      'Identifies gaps',
      'Flexible methodology',
      'Useful for emerging topics',
    ],
    
    limitations: [
      'No quality assessment',
      'No synthesis of findings',
      'Less rigorous than SR',
      'Cannot answer specific questions',
    ],
    
    evidence_level: 3,
  },
  
  [StudyDesignType.UMBRELLA_REVIEW]: {
    type: StudyDesignType.UMBRELLA_REVIEW,
    category: StudyDesignCategory.REVIEW,
    name: 'Umbrella Review',
    description: 'Systematic review of systematic reviews on a broad topic',
    aliases: ['umbrella review', 'overview of reviews', 'review of reviews'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: true,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['AMSTAR 2', 'ROBIS'],
    reporting_guidelines: ['PRIOR Statement'],
    
    use_cases: [
      'Broad topic synthesis',
      'Guideline development',
      'Identifying high-quality reviews',
      'Assessing evidence overlap',
    ],
    
    strengths: [
      'Comprehensive overview',
      'Identifies best evidence',
      'Assesses review quality',
      'Efficient for broad topics',
    ],
    
    limitations: [
      'Overlap between reviews',
      'Quality varies',
      'May miss primary studies',
      'Complex interpretation',
    ],
    
    evidence_level: 1,
  },
  
  [StudyDesignType.RAPID_REVIEW]: {
    type: StudyDesignType.RAPID_REVIEW,
    category: StudyDesignCategory.REVIEW,
    name: 'Rapid Review',
    description: 'Streamlined systematic review with shortcuts to produce evidence quickly',
    aliases: ['rapid review', 'rapid evidence assessment', 'quick review'],
    parent: StudyDesignType.SYSTEMATIC_REVIEW,
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['AMSTAR 2 (adapted)'],
    reporting_guidelines: ['PRISMA 2020 (adapted)'],
    
    use_cases: [
      'Urgent policy decisions',
      'Emerging health threats',
      'Preliminary evidence synthesis',
      'Resource-limited settings',
    ],
    
    strengths: [
      'Fast turnaround',
      'Less resource-intensive',
      'Timely evidence',
      'Pragmatic',
    ],
    
    limitations: [
      'Less comprehensive',
      'Higher bias risk',
      'May miss important studies',
      'Lower quality than full SR',
    ],
    
    evidence_level: 2,
  },
  
  [StudyDesignType.NARRATIVE_REVIEW]: {
    type: StudyDesignType.NARRATIVE_REVIEW,
    category: StudyDesignCategory.REVIEW,
    name: 'Narrative Review',
    description: 'Non-systematic overview of a topic based on author selection',
    aliases: ['narrative review', 'literature review', 'traditional review'],
    
    characteristics: {
      randomization: false,
      prospective: false,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: [],
    reporting_guidelines: [],
    
    use_cases: [
      'Educational purposes',
      'Background information',
      'Expert opinion',
      'Broad overviews',
    ],
    
    strengths: [
      'Flexible',
      'Quick to produce',
      'Broad coverage',
      'Expert perspective',
    ],
    
    limitations: [
      'Selection bias',
      'Not reproducible',
      'No quality assessment',
      'Subjective',
    ],
    
    evidence_level: 5,
  },
  
  // ========================================
  // QUALITATIVE DESIGNS
  // ========================================
  
  [StudyDesignType.PHENOMENOLOGY]: {
    type: StudyDesignType.PHENOMENOLOGY,
    category: StudyDesignCategory.QUALITATIVE,
    name: 'Phenomenology',
    description: 'Explores lived experiences and meanings of a phenomenon',
    aliases: ['phenomenology', 'phenomenological study'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['CASP Qualitative', 'COREQ'],
    reporting_guidelines: ['COREQ', 'SRQR'],
    
    use_cases: [
      'Understanding patient experiences',
      'Exploring meanings',
      'Healthcare experiences',
      'Illness narratives',
    ],
    
    strengths: [
      'Rich, deep understanding',
      'Patient-centered',
      'Captures complexity',
      'Generates new insights',
    ],
    
    limitations: [
      'Not generalizable',
      'Researcher bias',
      'Time-intensive',
      'Small samples',
    ],
    
    evidence_level: 4,
  },
  
  [StudyDesignType.GROUNDED_THEORY]: {
    type: StudyDesignType.GROUNDED_THEORY,
    category: StudyDesignCategory.QUALITATIVE,
    name: 'Grounded Theory',
    description: 'Develops theory grounded in systematically collected and analyzed data',
    aliases: ['grounded theory', 'GT'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['CASP Qualitative', 'COREQ'],
    reporting_guidelines: ['COREQ', 'SRQR'],
    
    use_cases: [
      'Theory development',
      'Process understanding',
      'Social interactions',
      'Behavior explanation',
    ],
    
    strengths: [
      'Generates new theory',
      'Systematic approach',
      'Explains processes',
      'Flexible',
    ],
    
    limitations: [
      'Time-intensive',
      'Requires expertise',
      'Not generalizable',
      'Researcher influence',
    ],
    
    evidence_level: 4,
  },
  
  [StudyDesignType.ETHNOGRAPHY]: {
    type: StudyDesignType.ETHNOGRAPHY,
    category: StudyDesignCategory.QUALITATIVE,
    name: 'Ethnography',
    description: 'Studies cultures and communities through immersion and observation',
    aliases: ['ethnography', 'ethnographic study'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: true,
    },
    
    quality_tools: ['CASP Qualitative', 'COREQ'],
    reporting_guidelines: ['COREQ', 'SRQR'],
    
    use_cases: [
      'Cultural understanding',
      'Healthcare settings',
      'Organizational culture',
      'Community practices',
    ],
    
    strengths: [
      'Holistic understanding',
      'Cultural context',
      'Rich data',
      'Real-world settings',
    ],
    
    limitations: [
      'Very time-intensive',
      'Researcher bias',
      'Not generalizable',
      'Ethical challenges',
    ],
    
    evidence_level: 4,
  },
  
  [StudyDesignType.QUALITATIVE_DESCRIPTIVE]: {
    type: StudyDesignType.QUALITATIVE_DESCRIPTIVE,
    category: StudyDesignCategory.QUALITATIVE,
    name: 'Qualitative Descriptive Study',
    description: 'Describes phenomena in everyday language without deep interpretation',
    aliases: ['qualitative descriptive', 'descriptive qualitative'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['CASP Qualitative', 'COREQ'],
    reporting_guidelines: ['COREQ', 'SRQR'],
    
    use_cases: [
      'Exploratory research',
      'Needs assessment',
      'Program evaluation',
      'Straightforward description',
    ],
    
    strengths: [
      'Straightforward',
      'Practical',
      'Less interpretive',
      'Accessible findings',
    ],
    
    limitations: [
      'Less theoretical depth',
      'Not generalizable',
      'May lack rigor',
      'Limited explanation',
    ],
    
    evidence_level: 4,
  },
  
  // ========================================
  // MIXED METHODS DESIGNS
  // ========================================
  
  [StudyDesignType.CONVERGENT]: {
    type: StudyDesignType.CONVERGENT,
    category: StudyDesignCategory.MIXED_METHODS,
    name: 'Convergent Mixed Methods',
    description: 'Quantitative and qualitative data collected in parallel and merged for comparison',
    aliases: ['convergent design', 'concurrent triangulation', 'parallel mixed methods'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['MMAT', 'Good Reporting of A Mixed Methods Study (GRAMMS)'],
    reporting_guidelines: ['GRAMMS'],
    
    use_cases: [
      'Triangulation',
      'Comprehensive understanding',
      'Validation',
      'Complementary insights',
    ],
    
    strengths: [
      'Comprehensive evidence',
      'Triangulation',
      'Efficient data collection',
      'Validates findings',
    ],
    
    limitations: [
      'Complex integration',
      'Resource-intensive',
      'Requires dual expertise',
      'Contradictory findings possible',
    ],
    
    evidence_level: 3,
  },
  
  [StudyDesignType.EXPLANATORY_SEQUENTIAL]: {
    type: StudyDesignType.EXPLANATORY_SEQUENTIAL,
    category: StudyDesignCategory.MIXED_METHODS,
    name: 'Explanatory Sequential Mixed Methods',
    description: 'Quantitative data collected first, followed by qualitative to explain results',
    aliases: ['explanatory sequential', 'sequential explanatory', 'quant → qual'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: true,
    },
    
    quality_tools: ['MMAT', 'GRAMMS'],
    reporting_guidelines: ['GRAMMS'],
    
    use_cases: [
      'Explaining quantitative findings',
      'Understanding mechanisms',
      'Exploring unexpected results',
      'Participant perspectives',
    ],
    
    strengths: [
      'Clear sequence',
      'Explains findings',
      'Straightforward',
      'Builds on quant results',
    ],
    
    limitations: [
      'Time-consuming',
      'Two-phase design',
      'Requires both expertise',
      'Longer duration',
    ],
    
    evidence_level: 3,
  },
  
  [StudyDesignType.EXPLORATORY_SEQUENTIAL]: {
    type: StudyDesignType.EXPLORATORY_SEQUENTIAL,
    category: StudyDesignCategory.MIXED_METHODS,
    name: 'Exploratory Sequential Mixed Methods',
    description: 'Qualitative data collected first to inform quantitative phase',
    aliases: ['exploratory sequential', 'sequential exploratory', 'qual → quant'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: true,
    },
    
    quality_tools: ['MMAT', 'GRAMMS'],
    reporting_guidelines: ['GRAMMS'],
    
    use_cases: [
      'Instrument development',
      'Taxonomy creation',
      'Intervention design',
      'Exploring new areas',
    ],
    
    strengths: [
      'Develops measures',
      'Grounded in qualitative',
      'Tests emerging theory',
      'Comprehensive',
    ],
    
    limitations: [
      'Very time-consuming',
      'Resource-intensive',
      'Complex',
      'Requires both expertise',
    ],
    
    evidence_level: 3,
  },
  
  // ========================================
  // DIAGNOSTIC DESIGNS
  // ========================================
  
  [StudyDesignType.DIAGNOSTIC_ACCURACY]: {
    type: StudyDesignType.DIAGNOSTIC_ACCURACY,
    category: StudyDesignCategory.DIAGNOSTIC,
    name: 'Diagnostic Accuracy Study',
    description: 'Evaluates how well a test identifies presence or absence of disease',
    aliases: ['diagnostic accuracy', 'diagnostic test accuracy', 'DTA'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: true,
      blinding_possible: true,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: ['QUADAS-2', 'STARD checklist'],
    reporting_guidelines: ['STARD 2015'],
    
    use_cases: [
      'Test evaluation',
      'Screening programs',
      'Diagnostic algorithms',
      'Biomarker validation',
    ],
    
    strengths: [
      'Direct test evaluation',
      'Sensitivity/specificity',
      'Clinical utility',
      'Evidence for practice',
    ],
    
    limitations: [
      'Requires gold standard',
      'Spectrum bias',
      'Verification bias',
      'Prevalence dependent',
    ],
    
    evidence_level: 2,
  },
  
  // ========================================
  // PROGNOSTIC DESIGNS
  // ========================================
  
  [StudyDesignType.PROGNOSTIC_FACTOR]: {
    type: StudyDesignType.PROGNOSTIC_FACTOR,
    category: StudyDesignCategory.PROGNOSTIC,
    name: 'Prognostic Factor Study',
    description: 'Identifies factors associated with future outcomes in people with a condition',
    aliases: ['prognostic factor', 'prognostic study', 'risk factor study'],
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: true,
    },
    
    quality_tools: ['QUIPS', 'PROBAST'],
    reporting_guidelines: ['REMARK', 'TRIPOD'],
    
    use_cases: [
      'Prognosis estimation',
      'Risk stratification',
      'Treatment decisions',
      'Biomarker studies',
    ],
    
    strengths: [
      'Informs prognosis',
      'Guides treatment',
      'Risk stratification',
      'Clinical utility',
    ],
    
    limitations: [
      'Confounding',
      'Overfitting',
      'Validation needed',
      'Generalizability',
    ],
    
    evidence_level: 2,
  },
  
  [StudyDesignType.PREDICTION_MODEL]: {
    type: StudyDesignType.PREDICTION_MODEL,
    category: StudyDesignCategory.PROGNOSTIC,
    name: 'Prediction Model Study',
    description: 'Develops or validates models to predict individual outcomes',
    aliases: ['prediction model', 'prognostic model', 'risk prediction'],
    parent: StudyDesignType.PROGNOSTIC_FACTOR,
    
    characteristics: {
      randomization: false,
      prospective: true,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: true,
    },
    
    quality_tools: ['PROBAST'],
    reporting_guidelines: ['TRIPOD'],
    
    use_cases: [
      'Risk calculators',
      'Clinical decision support',
      'Personalized medicine',
      'Screening decisions',
    ],
    
    strengths: [
      'Individualized predictions',
      'Clinical decision support',
      'Risk stratification',
      'Actionable',
    ],
    
    limitations: [
      'Overfitting risk',
      'Requires validation',
      'Implementation challenges',
      'May not generalize',
    ],
    
    evidence_level: 2,
  },
  
  // ========================================
  // OTHER
  // ========================================
  
  [StudyDesignType.UNKNOWN]: {
    type: StudyDesignType.UNKNOWN,
    category: StudyDesignCategory.OTHER,
    name: 'Unknown Study Design',
    description: 'Study design cannot be determined from available information',
    aliases: ['unknown', 'unclear', 'unclassified'],
    
    characteristics: {
      randomization: false,
      prospective: false,
      controlled: false,
      blinding_possible: false,
      intervention: false,
      longitudinal: false,
    },
    
    quality_tools: [],
    reporting_guidelines: [],
    
    use_cases: [],
    strengths: [],
    limitations: [],
    
    evidence_level: 5,
  },
};

/**
 * Get study design metadata by type
 */
export function getStudyDesignMetadata(type: StudyDesignType): StudyDesignMetadata {
  return STUDY_DESIGN_TAXONOMY[type];
}

/**
 * Get all study designs in a category
 */
export function getStudyDesignsByCategory(category: StudyDesignCategory): StudyDesignMetadata[] {
  return Object.values(STUDY_DESIGN_TAXONOMY).filter(
    (design) => design.category === category
  );
}

/**
 * Get study design hierarchy (parent-child relationships)
 */
export function getStudyDesignHierarchy(type: StudyDesignType): {
  parent?: StudyDesignMetadata;
  children: StudyDesignMetadata[];
} {
  const design = STUDY_DESIGN_TAXONOMY[type];
  
  return {
    parent: design.parent ? STUDY_DESIGN_TAXONOMY[design.parent] : undefined,
    children: design.subtypes
      ? design.subtypes.map((subtype) => STUDY_DESIGN_TAXONOMY[subtype])
      : [],
  };
}

/**
 * Search study designs by alias
 */
export function findStudyDesignByAlias(alias: string): StudyDesignMetadata | undefined {
  const normalizedAlias = alias.toLowerCase().trim();
  
  return Object.values(STUDY_DESIGN_TAXONOMY).find((design) =>
    design.aliases.some((a) => a.toLowerCase() === normalizedAlias)
  );
}
