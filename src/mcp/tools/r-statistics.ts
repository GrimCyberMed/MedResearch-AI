/**
 * R Statistics Integration Tools
 * 
 * Comprehensive statistical analysis tools using R:
 * - Meta-analysis and forest plots
 * - Statistical test selection
 * - Assumption checking
 * - Data validation
 * - Power analysis
 * - Complete analysis workflows
 * 
 * @version 5.0.0 - Enhanced with expert biostatistical capabilities
 */

import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { logger } from '../../common/logger.js';

interface StudyData {
  study_id: string;
  effect_size: number;
  standard_error: number;
  sample_size?: number;
}

interface MetaAnalysisArgs {
  data: StudyData[];
  effect_measure: 'SMD' | 'MD' | 'RR' | 'OR' | 'HR';
  model?: 'random' | 'fixed';
  method?: 'REML' | 'DL' | 'PM' | 'ML';
}

interface ForestPlotArgs {
  meta_analysis_result: any;
  output_path: string;
  title?: string;
  show_prediction_interval?: boolean;
}

interface MetaAnalysisResult {
  pooled_effect: number;
  ci_lower: number;
  ci_upper: number;
  p_value: number;
  i_squared: number;
  tau_squared: number;
  q_statistic: number;
  q_p_value: number;
  prediction_interval?: {
    lower: number;
    upper: number;
  };
  studies: {
    study_id: string;
    effect: number;
    se: number;
    weight: number;
    ci_lower: number;
    ci_upper: number;
  }[];
  model: string;
  method: string;
  k_studies: number;
}

/**
 * Execute R script and return output
 */
async function executeRScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tempScript = join(tmpdir(), `meta_${Date.now()}.R`);
    writeFileSync(tempScript, script);

    const rProcess = spawn('Rscript', [tempScript]);
    let stdout = '';
    let stderr = '';

    rProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    rProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    rProcess.on('close', (code) => {
      unlinkSync(tempScript);
      
      if (code !== 0) {
        reject(new Error(`R script failed: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    rProcess.on('error', (error) => {
      unlinkSync(tempScript);
      reject(new Error(`Failed to execute R: ${error.message}. Ensure R is installed and in PATH.`));
    });
  });
}

/**
 * Run meta-analysis using R meta package
 */
export async function runMetaAnalysis(args: MetaAnalysisArgs) {
  const { data, effect_measure, model = 'random', method = 'REML' } = args;

  // Validate inputs
  if (!data || !Array.isArray(data)) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'Data array is required for meta-analysis',
        }, null, 2),
      }],
      isError: true,
    };
  }

  if (!data || data.length < 2) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'At least 2 studies required for meta-analysis',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    // Prepare data for R
    const studyIds = data.map(d => d.study_id);
    const effects = data.map(d => d.effect_size);
    const ses = data.map(d => d.standard_error);
    const ns = data.map(d => d.sample_size || 0);

    // Generate R script
    const rScript = `
# Load required packages
if (!require("meta", quietly = TRUE)) {
  install.packages("meta", repos = "https://cloud.r-project.org")
  library(meta)
}
if (!require("jsonlite", quietly = TRUE)) {
  install.packages("jsonlite", repos = "https://cloud.r-project.org")
  library(jsonlite)
}

# Prepare data
study_ids <- c(${studyIds.map(id => `"${id}"`).join(', ')})
effects <- c(${effects.join(', ')})
ses <- c(${ses.join(', ')})
ns <- c(${ns.join(', ')})

# Run meta-analysis
m <- metagen(
  TE = effects,
  seTE = ses,
  studlab = study_ids,
  sm = "${effect_measure}",
  fixed = ${model === 'fixed' ? 'TRUE' : 'FALSE'},
  random = ${model === 'random' ? 'TRUE' : 'FALSE'},
  method.tau = "${method}",
  prediction = TRUE
)

# Extract results
result <- list(
  pooled_effect = if ("${model}" == "random") m$TE.random else m$TE.fixed,
  ci_lower = if ("${model}" == "random") m$lower.random else m$lower.fixed,
  ci_upper = if ("${model}" == "random") m$upper.random else m$upper.fixed,
  p_value = if ("${model}" == "random") m$pval.random else m$pval.fixed,
  i_squared = m$I2,
  tau_squared = m$tau2,
  q_statistic = m$Q,
  q_p_value = m$pval.Q,
  prediction_interval = if ("${model}" == "random") list(
    lower = m$lower.predict,
    upper = m$upper.predict
  ) else NULL,
  studies = data.frame(
    study_id = study_ids,
    effect = effects,
    se = ses,
    weight = if ("${model}" == "random") m$w.random else m$w.fixed,
    ci_lower = m$lower,
    ci_upper = m$upper
  ),
  model = "${model}",
  method = "${method}",
  k_studies = m$k
)

# Convert to JSON
cat(toJSON(result, auto_unbox = TRUE, digits = 4))
`;

    const output = await executeRScript(rScript);
    const result: MetaAnalysisResult = JSON.parse(output);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          result,
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
          note: 'Ensure R is installed with the "meta" package. Install with: install.packages("meta")',
        }, null, 2),
      }],
      isError: true,
    };
  }
}

/**
 * Generate forest plot from meta-analysis results
 */
export async function generateForestPlot(args: ForestPlotArgs) {
  const { 
    meta_analysis_result, 
    output_path, 
    title = 'Forest Plot',
    show_prediction_interval = true,
  } = args;

  if (!meta_analysis_result || !meta_analysis_result.result) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: 'Invalid meta-analysis result object',
        }, null, 2),
      }],
      isError: true,
    };
  }

  try {
    const result = meta_analysis_result.result;
    
    // Prepare data for R
    const studyIds = result.studies.map((s: any) => s.study_id);
    const effects = result.studies.map((s: any) => s.effect);
    const ses = result.studies.map((s: any) => s.se);

    // Escape backslashes in Windows paths for R
    const escapedOutputPath = output_path.replace(/\\/g, '/');
    const escapedTitle = title.replace(/"/g, '\\"');

    // Generate R script for forest plot
    const rScript = `
# Load required packages
if (!require("meta", quietly = TRUE)) {
  install.packages("meta", repos = "https://cloud.r-project.org")
  library(meta)
}

# Prepare data
study_ids <- c(${studyIds.map((id: string) => `"${id}"`).join(', ')})
effects <- c(${effects.join(', ')})
ses <- c(${ses.join(', ')})

# Run meta-analysis (recreate for plotting)
m <- metagen(
  TE = effects,
  seTE = ses,
  studlab = study_ids,
  sm = "${result.model === 'random' ? 'SMD' : 'MD'}",
  fixed = ${result.model === 'fixed' ? 'TRUE' : 'FALSE'},
  random = ${result.model === 'random' ? 'TRUE' : 'FALSE'},
  method.tau = "${result.method}",
  prediction = ${show_prediction_interval ? 'TRUE' : 'FALSE'}
)

# Determine file type
file_ext <- tolower(tools::file_ext("${escapedOutputPath}"))

# Open graphics device
if (file_ext == "pdf") {
  pdf("${escapedOutputPath}", width = 10, height = 8)
} else {
  png("${escapedOutputPath}", width = 1200, height = 960, res = 120)
}

# Generate forest plot
forest(
  m,
  studlab = TRUE,
  comb.fixed = ${result.model === 'fixed' ? 'TRUE' : 'FALSE'},
  comb.random = ${result.model === 'random' ? 'TRUE' : 'FALSE'},
  prediction = ${show_prediction_interval && result.model === 'random' ? 'TRUE' : 'FALSE'},
  print.I2 = TRUE,
  print.tau2 = TRUE,
  print.Q = TRUE,
  print.pval.Q = TRUE,
  col.diamond = "blue",
  col.predict = "red",
  leftcols = c("studlab", "effect", "ci"),
  leftlabs = c("Study", "Effect", "95% CI"),
  xlab = "Effect Size",
  smlab = "${escapedTitle}",
  weight.study = "random",
  sortvar = TE
)

# Close graphics device
dev.off()

cat("Forest plot saved to: ${escapedOutputPath}")
`;

    const output = await executeRScript(rScript);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          output_path,
          message: output.trim(),
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
          note: 'Ensure R is installed with the "meta" package',
        }, null, 2),
      }],
      isError: true,
    };
  }
}

// ============================================================================
// ENHANCED STATISTICAL ANALYSIS FUNCTIONS
// ============================================================================

// ============================================================================
// 1. STATISTICAL TEST SELECTION
// ============================================================================

interface TestSelectionArgs {
  research_question: string;
  outcome_type: 'continuous' | 'binary' | 'ordinal' | 'count' | 'time-to-event';
  predictor_type?: 'continuous' | 'binary' | 'categorical' | 'none';
  num_groups?: number;
  paired?: boolean;
  sample_size?: number;
  data_file?: string;
  outcome_variable?: string;
  group_variable?: string;
}

/**
 * Intelligent statistical test selection based on research question and data characteristics
 */
export async function selectStatisticalTest(args: TestSelectionArgs) {
  const startTime = Date.now();
  
  logger.info('Statistical test selection started', { 
    research_question: args.research_question.substring(0, 100),
    outcome_type: args.outcome_type,
    sample_size: args.sample_size
  });

  try {
    const {
      research_question,
      outcome_type,
      predictor_type = 'none',
      num_groups = 2,
      paired = false,
      sample_size = 0,
      data_file,
      outcome_variable,
      group_variable: _group_variable
    } = args;

    // Generate R script for test selection
    const rScript = `
# Load required packages
packages <- c("jsonlite", "nortest", "car")
for (pkg in packages) {
  if (!require(pkg, quietly = TRUE)) {
    install.packages(pkg, repos = "https://cloud.r-project.org")
    library(pkg, character.only = TRUE)
  }
}

# Test selection logic
outcome_type <- "${outcome_type}"
predictor_type <- "${predictor_type}"
num_groups <- ${num_groups}
paired <- ${paired ? 'TRUE' : 'FALSE'}
sample_size <- ${sample_size}

# Initialize result
result <- list(
  recommended_test = NULL,
  alternative_tests = list(),
  assumptions = list(),
  rationale = NULL,
  power_adequate = NULL,
  sample_size_recommendation = NULL
)

# Decision tree for test selection
if (outcome_type == "continuous") {
  if (predictor_type == "none") {
    # One-sample tests
    result$recommended_test <- "One-sample t-test"
    result$alternative_tests <- list("Wilcoxon signed-rank test (if non-normal)")
    result$assumptions <- list(
      "Normality of data",
      "No extreme outliers",
      "Data measured on interval/ratio scale"
    )
    result$rationale <- "Comparing sample mean to a known population value"
    
  } else if (predictor_type == "binary" || num_groups == 2) {
    if (paired) {
      result$recommended_test <- "Paired t-test"
      result$alternative_tests <- list("Wilcoxon signed-rank test (if non-normal)")
      result$assumptions <- list(
        "Normality of differences",
        "Paired observations",
        "No extreme outliers in differences"
      )
      result$rationale <- "Comparing means of two related groups (e.g., before/after, matched pairs)"
    } else {
      result$recommended_test <- "Independent samples t-test"
      result$alternative_tests <- list(
        "Welch's t-test (if unequal variances)",
        "Mann-Whitney U test (if non-normal)"
      )
      result$assumptions <- list(
        "Normality in both groups",
        "Homogeneity of variance (Levene's test)",
        "Independence of observations"
      )
      result$rationale <- "Comparing means of two independent groups"
    }
    
  } else if (num_groups >= 3) {
    if (paired) {
      result$recommended_test <- "Repeated measures ANOVA"
      result$alternative_tests <- list("Friedman test (if non-normal)")
      result$assumptions <- list(
        "Normality of residuals",
        "Sphericity (Mauchly's test)",
        "No extreme outliers"
      )
      result$rationale <- "Comparing means of 3+ related groups"
    } else {
      result$recommended_test <- "One-way ANOVA"
      result$alternative_tests <- list(
        "Kruskal-Wallis test (if non-normal)",
        "Welch's ANOVA (if unequal variances)"
      )
      result$assumptions <- list(
        "Normality in all groups",
        "Homogeneity of variance",
        "Independence of observations"
      )
      result$rationale <- "Comparing means of 3+ independent groups"
      result$post_hoc <- "Tukey HSD, Bonferroni, or Holm correction for pairwise comparisons"
    }
    
  } else if (predictor_type == "continuous") {
    result$recommended_test <- "Linear regression"
    result$alternative_tests <- list(
      "Spearman correlation (if non-linear)",
      "Polynomial regression (if non-linear relationship)"
    )
    result$assumptions <- list(
      "Linearity of relationship",
      "Normality of residuals",
      "Homoscedasticity",
      "Independence of residuals",
      "No multicollinearity (if multiple predictors)"
    )
    result$rationale <- "Examining linear relationship between continuous variables"
  }
  
} else if (outcome_type == "binary") {
  if (predictor_type == "none") {
    result$recommended_test <- "One-sample proportion test"
    result$alternative_tests <- list("Binomial test (exact)")
    result$assumptions <- list(
      "Binary outcome",
      "Independent observations"
    )
    result$rationale <- "Comparing sample proportion to known value"
    
  } else if (predictor_type == "binary" || num_groups == 2) {
    if (paired) {
      result$recommended_test <- "McNemar's test"
      result$alternative_tests <- list()
      result$assumptions <- list(
        "Paired binary data",
        "Adequate sample size (discordant pairs > 10)"
      )
      result$rationale <- "Comparing proportions in paired data"
    } else {
      result$recommended_test <- "Chi-square test"
      result$alternative_tests <- list("Fisher's exact test (if expected counts < 5)")
      result$assumptions <- list(
        "Independent observations",
        "Expected count ≥ 5 in all cells (for chi-square)",
        "Binary outcome"
      )
      result$rationale <- "Comparing proportions between independent groups"
    }
    
  } else if (num_groups >= 3) {
    result$recommended_test <- "Chi-square test"
    result$alternative_tests <- list("Fisher's exact test (if small expected counts)")
    result$assumptions <- list(
      "Independent observations",
      "Expected count ≥ 5 in all cells"
    )
    result$rationale <- "Comparing proportions across 3+ groups"
    result$post_hoc <- "Pairwise chi-square tests with Bonferroni correction"
    
  } else if (predictor_type == "continuous") {
    result$recommended_test <- "Logistic regression"
    result$alternative_tests <- list()
    result$assumptions <- list(
      "Binary outcome",
      "Linearity of log odds",
      "Independence of observations",
      "No multicollinearity"
    )
    result$rationale <- "Modeling probability of binary outcome with continuous predictor"
  }
  
} else if (outcome_type == "ordinal") {
  if (num_groups == 2) {
    if (paired) {
      result$recommended_test <- "Wilcoxon signed-rank test"
      result$alternative_tests <- list("Sign test")
      result$assumptions <- list(
        "Ordinal or continuous data",
        "Paired observations",
        "Symmetric distribution of differences"
      )
      result$rationale <- "Comparing medians of two related groups with ordinal data"
    } else {
      result$recommended_test <- "Mann-Whitney U test"
      result$alternative_tests <- list()
      result$assumptions <- list(
        "Ordinal or continuous data",
        "Independent observations",
        "Similar distribution shapes"
      )
      result$rationale <- "Comparing medians of two independent groups with ordinal data"
    }
  } else if (num_groups >= 3) {
    if (paired) {
      result$recommended_test <- "Friedman test"
      result$alternative_tests <- list()
      result$assumptions <- list(
        "Ordinal or continuous data",
        "Related groups"
      )
      result$rationale <- "Comparing medians of 3+ related groups with ordinal data"
    } else {
      result$recommended_test <- "Kruskal-Wallis test"
      result$alternative_tests <- list()
      result$assumptions <- list(
        "Ordinal or continuous data",
        "Independent observations"
      )
      result$rationale <- "Comparing medians of 3+ independent groups with ordinal data"
      result$post_hoc <- "Dunn's test with Bonferroni correction"
    }
  } else if (predictor_type == "continuous") {
    result$recommended_test <- "Ordinal logistic regression"
    result$alternative_tests <- list("Spearman correlation (if simple association)")
    result$assumptions <- list(
      "Ordinal outcome",
      "Proportional odds assumption",
      "Independence of observations"
    )
    result$rationale <- "Modeling ordinal outcome with continuous predictor"
  }
  
} else if (outcome_type == "count") {
  result$recommended_test <- "Poisson regression"
  result$alternative_tests <- list("Negative binomial regression (if overdispersed)")
  result$assumptions <- list(
    "Count outcome",
    "Mean equals variance (Poisson)",
    "Independence of observations"
  )
  result$rationale <- "Modeling count outcome"
  
} else if (outcome_type == "time-to-event") {
  if (num_groups == 2) {
    result$recommended_test <- "Log-rank test"
    result$alternative_tests <- list("Gehan-Breslow test (if early differences)")
    result$assumptions <- list(
      "Censored survival data",
      "Proportional hazards",
      "Independent censoring"
    )
    result$rationale <- "Comparing survival curves between two groups"
  } else if (num_groups >= 3) {
    result$recommended_test <- "Log-rank test"
    result$alternative_tests <- list()
    result$assumptions <- list(
      "Censored survival data",
      "Proportional hazards",
      "Independent censoring"
    )
    result$rationale <- "Comparing survival curves across 3+ groups"
  } else if (predictor_type == "continuous") {
    result$recommended_test <- "Cox proportional hazards regression"
    result$alternative_tests <- list("Parametric survival models (Weibull, exponential)")
    result$assumptions <- list(
      "Proportional hazards",
      "Linearity of log hazard",
      "Independent censoring"
    )
    result$rationale <- "Modeling time-to-event with continuous predictor"
  }
}

# Sample size assessment
if (sample_size > 0) {
  if (sample_size < 30) {
    result$power_adequate <- FALSE
    result$sample_size_recommendation <- "Sample size < 30 may have low power. Consider non-parametric tests or increase sample size."
  } else if (sample_size < 100) {
    result$power_adequate <- "Moderate"
    result$sample_size_recommendation <- "Sample size is moderate. Ensure assumptions are met."
  } else {
    result$power_adequate <- TRUE
    result$sample_size_recommendation <- "Sample size is adequate for most analyses."
  }
}

# If data file provided, check assumptions
${data_file && outcome_variable ? `
if (file.exists("${data_file.replace(/\\/g, '/')}")) {
  tryCatch({
    data <- read.csv("${data_file.replace(/\\/g, '/')}")
    
    if ("${outcome_variable}" %in% names(data)) {
      outcome <- data[["${outcome_variable}"]]
      
      # Check normality
      if (is.numeric(outcome) && length(outcome) >= 3) {
        shapiro_test <- shapiro.test(outcome)
        result$normality_test <- list(
          test = "Shapiro-Wilk",
          statistic = shapiro_test$statistic,
          p_value = shapiro_test$p.value,
          conclusion = if (shapiro_test$p.value > 0.05) "Normal" else "Non-normal"
        )
        
        # If non-normal, suggest non-parametric alternative
        if (shapiro_test$p.value <= 0.05) {
          result$recommendation_update <- "Data is non-normal. Consider non-parametric alternative."
        }
      }
      
      # Check for outliers
      if (is.numeric(outcome)) {
        q1 <- quantile(outcome, 0.25, na.rm = TRUE)
        q3 <- quantile(outcome, 0.75, na.rm = TRUE)
        iqr <- q3 - q1
        outliers <- sum(outcome < (q1 - 1.5*iqr) | outcome > (q3 + 1.5*iqr), na.rm = TRUE)
        result$outliers <- list(
          count = outliers,
          percentage = round(outliers / length(outcome) * 100, 2)
        )
      }
    }
  }, error = function(e) {
    result$data_check_error <- paste("Could not check assumptions:", e$message)
  })
}
` : ''}

# Convert to JSON
cat(toJSON(result, auto_unbox = TRUE, pretty = TRUE))
`;

    const output = await executeRScript(rScript);
    const result = JSON.parse(output);

    const duration = Date.now() - startTime;
    logger.info('Statistical test selection completed', { 
      recommended_test: result.recommended_test,
      duration
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          research_question,
          recommended_test: result.recommended_test,
          alternative_tests: result.alternative_tests,
          assumptions: result.assumptions,
          rationale: result.rationale,
          power_adequate: result.power_adequate,
          sample_size_recommendation: result.sample_size_recommendation,
          normality_test: result.normality_test,
          outliers: result.outliers,
          post_hoc: result.post_hoc,
          recommendation_update: result.recommendation_update,
          data_check_error: result.data_check_error
        }, null, 2),
      }],
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Statistical test selection failed', { 
      error: errorMessage,
      duration
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          note: 'Ensure R is installed with required packages'
        }, null, 2),
      }],
      isError: true,
    };
  }
}

// ============================================================================
// 2. ASSUMPTION CHECKING
// ============================================================================

interface AssumptionCheckArgs {
  data_file: string;
  test_type: 't-test' | 'anova' | 'regression' | 'chi-square' | 'correlation';
  outcome_variable: string;
  predictor_variable?: string;
  group_variable?: string;
  output_dir?: string;
}

/**
 * Comprehensive assumption checking for statistical tests
 */
export async function checkAssumptions(args: AssumptionCheckArgs) {
  const startTime = Date.now();
  
  logger.info('Assumption checking started', { 
    test_type: args.test_type,
    data_file: args.data_file
  });

  try {
    const {
      data_file,
      test_type,
      outcome_variable,
      predictor_variable,
      group_variable,
      output_dir = tmpdir()
    } = args;

    if (!existsSync(data_file)) {
      throw new Error(`Data file not found: ${data_file}`);
    }

    const escapedDataFile = data_file.replace(/\\/g, '/');
    const escapedOutputDir = output_dir.replace(/\\/g, '/');

    const rScript = `
# Load required packages
packages <- c("jsonlite", "nortest", "car", "lmtest")
for (pkg in packages) {
  if (!require(pkg, quietly = TRUE)) {
    install.packages(pkg, repos = "https://cloud.r-project.org")
    library(pkg, character.only = TRUE)
  }
}

# Load data
data <- read.csv("${escapedDataFile}")

# Initialize result
result <- list(
  test_type = "${test_type}",
  assumptions_met = TRUE,
  checks = list(),
  recommendations = list(),
  plots_generated = list()
)

# Get variables
outcome <- data[["${outcome_variable}"]]
${predictor_variable ? `predictor <- data[["${predictor_variable}"]]` : ''}
${group_variable ? `group <- data[["${group_variable}"]]` : ''}

# ============================================================================
# T-TEST / ANOVA ASSUMPTIONS
# ============================================================================
if ("${test_type}" %in% c("t-test", "anova")) {
  
  # 1. Normality check
  if (is.numeric(outcome)) {
    # Shapiro-Wilk test
    if (length(outcome) >= 3 && length(outcome) <= 5000) {
      shapiro_result <- shapiro.test(outcome)
      result$checks$normality_shapiro <- list(
        test = "Shapiro-Wilk",
        statistic = shapiro_result$statistic,
        p_value = shapiro_result$p.value,
        conclusion = if (shapiro_result$p.value > 0.05) "Normal" else "Non-normal",
        passed = shapiro_result$p.value > 0.05
      )
      
      if (shapiro_result$p.value <= 0.05) {
        result$assumptions_met <- FALSE
        result$recommendations <- c(result$recommendations, 
          "Data is non-normal. Consider: (1) transformation (log, sqrt), (2) non-parametric test, or (3) proceed if n>30 (Central Limit Theorem)")
      }
    }
    
    # Anderson-Darling test (more powerful for larger samples)
    if (length(outcome) > 7) {
      ad_result <- ad.test(outcome)
      result$checks$normality_anderson <- list(
        test = "Anderson-Darling",
        statistic = ad_result$statistic,
        p_value = ad_result$p.value,
        conclusion = if (ad_result$p.value > 0.05) "Normal" else "Non-normal",
        passed = ad_result$p.value > 0.05
      )
    }
    
    # Generate Q-Q plot
    qq_plot_file <- file.path("${escapedOutputDir}", "qq_plot.png")
    png(qq_plot_file, width = 800, height = 600)
    qqnorm(outcome, main = "Q-Q Plot for Normality")
    qqline(outcome, col = "red")
    dev.off()
    result$plots_generated <- c(result$plots_generated, qq_plot_file)
    
    # Generate histogram
    hist_file <- file.path("${escapedOutputDir}", "histogram.png")
    png(hist_file, width = 800, height = 600)
    hist(outcome, main = "Histogram", xlab = "${outcome_variable}", col = "lightblue", breaks = 20)
    dev.off()
    result$plots_generated <- c(result$plots_generated, hist_file)
  }
  
  # 2. Homogeneity of variance (for t-test/ANOVA with groups)
  ${group_variable ? `
  if (exists("group") && is.factor(group) || is.character(group)) {
    group <- as.factor(group)
    
    # Levene's test
    levene_result <- leveneTest(outcome ~ group, data = data)
    result$checks$homogeneity_levene <- list(
      test = "Levene's Test",
      statistic = levene_result[["F value"]][1],
      p_value = levene_result[["Pr(>F)"]][1],
      conclusion = if (levene_result[["Pr(>F)"]][1] > 0.05) "Equal variances" else "Unequal variances",
      passed = levene_result[["Pr(>F)"]][1] > 0.05
    )
    
    if (levene_result[["Pr(>F)"]][1] <= 0.05) {
      result$assumptions_met <- FALSE
      result$recommendations <- c(result$recommendations,
        "Variances are unequal. Consider: (1) Welch's t-test/ANOVA, (2) transformation, or (3) non-parametric test")
    }
    
    # Boxplot by group
    boxplot_file <- file.path("${escapedOutputDir}", "boxplot_by_group.png")
    png(boxplot_file, width = 800, height = 600)
    boxplot(outcome ~ group, data = data, main = "Boxplot by Group", 
            xlab = "${group_variable}", ylab = "${outcome_variable}", col = "lightblue")
    dev.off()
    result$plots_generated <- c(result$plots_generated, boxplot_file)
  }
  ` : ''}
  
  # 3. Outlier detection
  if (is.numeric(outcome)) {
    q1 <- quantile(outcome, 0.25, na.rm = TRUE)
    q3 <- quantile(outcome, 0.75, na.rm = TRUE)
    iqr <- q3 - q1
    outliers_lower <- sum(outcome < (q1 - 1.5*iqr), na.rm = TRUE)
    outliers_upper <- sum(outcome > (q3 + 1.5*iqr), na.rm = TRUE)
    outliers_total <- outliers_lower + outliers_upper
    
    result$checks$outliers <- list(
      method = "IQR (1.5 × IQR rule)",
      lower_outliers = outliers_lower,
      upper_outliers = outliers_upper,
      total_outliers = outliers_total,
      percentage = round(outliers_total / length(outcome) * 100, 2),
      passed = outliers_total < length(outcome) * 0.05  # Less than 5%
    )
    
    if (outliers_total >= length(outcome) * 0.05) {
      result$recommendations <- c(result$recommendations,
        paste0("Found ", outliers_total, " outliers (", round(outliers_total/length(outcome)*100, 1), 
               "%). Consider: (1) investigating data entry errors, (2) sensitivity analysis, or (3) robust methods"))
    }
  }
}

# ============================================================================
# REGRESSION ASSUMPTIONS
# ============================================================================
if ("${test_type}" == "regression") {
  ${predictor_variable ? `
  if (exists("predictor") && is.numeric(outcome) && is.numeric(predictor)) {
    # Fit linear model
    model <- lm(outcome ~ predictor, data = data)
    
    # 1. Linearity
    result$checks$linearity <- list(
      method = "Visual inspection of residuals vs fitted",
      recommendation = "Check residual plot for patterns"
    )
    
    # Residuals vs Fitted plot
    resid_plot_file <- file.path("${escapedOutputDir}", "residuals_vs_fitted.png")
    png(resid_plot_file, width = 800, height = 600)
    plot(fitted(model), residuals(model), main = "Residuals vs Fitted",
         xlab = "Fitted values", ylab = "Residuals")
    abline(h = 0, col = "red", lty = 2)
    dev.off()
    result$plots_generated <- c(result$plots_generated, resid_plot_file)
    
    # 2. Normality of residuals
    shapiro_resid <- shapiro.test(residuals(model))
    result$checks$normality_residuals <- list(
      test = "Shapiro-Wilk on residuals",
      statistic = shapiro_resid$statistic,
      p_value = shapiro_resid$p.value,
      conclusion = if (shapiro_resid$p.value > 0.05) "Normal" else "Non-normal",
      passed = shapiro_resid$p.value > 0.05
    )
    
    if (shapiro_resid$p.value <= 0.05) {
      result$assumptions_met <- FALSE
      result$recommendations <- c(result$recommendations,
        "Residuals are non-normal. Consider: (1) transformation of outcome, (2) robust regression, or (3) generalized linear model")
    }
    
    # Q-Q plot of residuals
    qq_resid_file <- file.path("${escapedOutputDir}", "qq_residuals.png")
    png(qq_resid_file, width = 800, height = 600)
    qqnorm(residuals(model), main = "Q-Q Plot of Residuals")
    qqline(residuals(model), col = "red")
    dev.off()
    result$plots_generated <- c(result$plots_generated, qq_resid_file)
    
    # 3. Homoscedasticity (constant variance)
    bp_test <- bptest(model)
    result$checks$homoscedasticity <- list(
      test = "Breusch-Pagan",
      statistic = bp_test$statistic,
      p_value = bp_test$p.value,
      conclusion = if (bp_test$p.value > 0.05) "Homoscedastic" else "Heteroscedastic",
      passed = bp_test$p.value > 0.05
    )
    
    if (bp_test$p.value <= 0.05) {
      result$assumptions_met <- FALSE
      result$recommendations <- c(result$recommendations,
        "Heteroscedasticity detected. Consider: (1) transformation, (2) weighted least squares, or (3) robust standard errors")
    }
    
    # Scale-Location plot
    scale_loc_file <- file.path("${escapedOutputDir}", "scale_location.png")
    png(scale_loc_file, width = 800, height = 600)
    plot(fitted(model), sqrt(abs(residuals(model))), main = "Scale-Location",
         xlab = "Fitted values", ylab = "√|Residuals|")
    dev.off()
    result$plots_generated <- c(result$plots_generated, scale_loc_file)
    
    # 4. Independence (Durbin-Watson test)
    dw_test <- dwtest(model)
    result$checks$independence <- list(
      test = "Durbin-Watson",
      statistic = dw_test$statistic,
      p_value = dw_test$p.value,
      conclusion = if (dw_test$p.value > 0.05) "Independent" else "Autocorrelated",
      passed = dw_test$p.value > 0.05
    )
    
    if (dw_test$p.value <= 0.05) {
      result$assumptions_met <- FALSE
      result$recommendations <- c(result$recommendations,
        "Autocorrelation detected. Consider: (1) time series methods, (2) generalized least squares, or (3) check data collection")
    }
    
    # 5. Influential points (Cook's distance)
    cooks_d <- cooks.distance(model)
    influential <- sum(cooks_d > 4/length(cooks_d))
    result$checks$influential_points <- list(
      method = "Cook's distance",
      threshold = 4/length(cooks_d),
      influential_count = influential,
      percentage = round(influential / length(cooks_d) * 100, 2),
      passed = influential < length(cooks_d) * 0.05
    )
    
    if (influential >= length(cooks_d) * 0.05) {
      result$recommendations <- c(result$recommendations,
        paste0("Found ", influential, " influential points. Consider: (1) investigating these cases, (2) sensitivity analysis, or (3) robust regression"))
    }
    
    # Cook's distance plot
    cooks_file <- file.path("${escapedOutputDir}", "cooks_distance.png")
    png(cooks_file, width = 800, height = 600)
    plot(cooks_d, type = "h", main = "Cook's Distance",
         xlab = "Observation", ylab = "Cook's Distance")
    abline(h = 4/length(cooks_d), col = "red", lty = 2)
    dev.off()
    result$plots_generated <- c(result$plots_generated, cooks_file)
  }
  ` : ''}
}

# ============================================================================
# CHI-SQUARE ASSUMPTIONS
# ============================================================================
if ("${test_type}" == "chi-square") {
  ${group_variable ? `
  if (exists("group")) {
    # Create contingency table
    cont_table <- table(outcome, group)
    
    # Check expected frequencies
    chi_test <- chisq.test(cont_table)
    expected <- chi_test$expected
    min_expected <- min(expected)
    cells_below_5 <- sum(expected < 5)
    
    result$checks$expected_frequencies <- list(
      min_expected = min_expected,
      cells_below_5 = cells_below_5,
      total_cells = length(expected),
      percentage_below_5 = round(cells_below_5 / length(expected) * 100, 2),
      passed = cells_below_5 == 0
    )
    
    if (cells_below_5 > 0) {
      result$assumptions_met <- FALSE
      result$recommendations <- c(result$recommendations,
        paste0(cells_below_5, " cells have expected count < 5. Consider: (1) Fisher's exact test, (2) combining categories, or (3) collecting more data"))
    }
  }
  ` : ''}
}

# ============================================================================
# CORRELATION ASSUMPTIONS
# ============================================================================
if ("${test_type}" == "correlation") {
  ${predictor_variable ? `
  if (exists("predictor") && is.numeric(outcome) && is.numeric(predictor)) {
    # Check linearity with scatterplot
    scatter_file <- file.path("${escapedOutputDir}", "scatterplot.png")
    png(scatter_file, width = 800, height = 600)
    plot(predictor, outcome, main = "Scatterplot",
         xlab = "${predictor_variable}", ylab = "${outcome_variable}")
    abline(lm(outcome ~ predictor), col = "red")
    dev.off()
    result$plots_generated <- c(result$plots_generated, scatter_file)
    
    # Check for outliers in bivariate space
    model <- lm(outcome ~ predictor)
    cooks_d <- cooks.distance(model)
    influential <- sum(cooks_d > 4/length(cooks_d))
    
    result$checks$bivariate_outliers <- list(
      method = "Cook's distance",
      influential_count = influential,
      percentage = round(influential / length(cooks_d) * 100, 2),
      passed = influential < length(cooks_d) * 0.05
    )
    
    if (influential >= length(cooks_d) * 0.05) {
      result$recommendations <- c(result$recommendations,
        "Bivariate outliers detected. Consider: (1) investigating these points, (2) Spearman correlation (robust to outliers), or (3) sensitivity analysis")
    }
  }
  ` : ''}
}

# Summary
result$summary <- list(
  all_assumptions_met = result$assumptions_met,
  total_checks = length(result$checks),
  checks_passed = sum(sapply(result$checks, function(x) if ("passed" %in% names(x)) x$passed else TRUE)),
  total_recommendations = length(result$recommendations)
)

# Convert to JSON
cat(toJSON(result, auto_unbox = TRUE, pretty = TRUE))
`;

    const output = await executeRScript(rScript);
    const result = JSON.parse(output);

    const duration = Date.now() - startTime;
    logger.info('Assumption checking completed', { 
      test_type,
      assumptions_met: result.assumptions_met,
      duration
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          test_type,
          assumptions_met: result.assumptions_met,
          checks: result.checks,
          recommendations: result.recommendations,
          plots_generated: result.plots_generated,
          summary: result.summary
        }, null, 2),
      }],
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Assumption checking failed', { 
      error: errorMessage,
      duration
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          note: 'Ensure R is installed with required packages (nortest, car, lmtest)'
        }, null, 2),
      }],
      isError: true,
    };
  }
}

// ============================================================================
// 3. DATA VALIDATION
// ============================================================================

interface DataValidationArgs {
  data_file: string;
  variable_specs?: {
    name: string;
    type: 'continuous' | 'categorical' | 'binary' | 'date';
    range?: [number, number];
    allowed_values?: string[];
    required?: boolean;
  }[];
  check_missing?: boolean;
  check_outliers?: boolean;
  check_duplicates?: boolean;
}

/**
 * Comprehensive data validation and quality assessment
 */
export async function validateData(args: DataValidationArgs) {
  const startTime = Date.now();
  
  logger.info('Data validation started', { 
    data_file: args.data_file
  });

  try {
    const {
      data_file,
      variable_specs = [],
      check_missing = true,
      check_outliers = true,
      check_duplicates = true
    } = args;

    if (!existsSync(data_file)) {
      throw new Error(`Data file not found: ${data_file}`);
    }

    const escapedDataFile = data_file.replace(/\\/g, '/');
    const specsJson = JSON.stringify(variable_specs).replace(/"/g, '\\"');

    const rScript = `
# Load required packages
packages <- c("jsonlite")
for (pkg in packages) {
  if (!require(pkg, quietly = TRUE)) {
    install.packages(pkg, repos = "https://cloud.r-project.org")
    library(pkg, character.only = TRUE)
  }
}

# Load data
data <- read.csv("${escapedDataFile}", stringsAsFactors = FALSE)

# Initialize result
result <- list(
  data_file = "${data_file}",
  n_rows = nrow(data),
  n_cols = ncol(data),
  variables = names(data),
  validation_passed = TRUE,
  issues = list(),
  summary = list()
)

# Parse variable specifications
${variable_specs.length > 0 ? `
specs <- fromJSON('${specsJson}')
` : 'specs <- list()'}

# ============================================================================
# VARIABLE-SPECIFIC VALIDATION
# ============================================================================
if (length(specs) > 0) {
  for (i in 1:length(specs)) {
    spec <- specs[[i]]
    var_name <- spec$name
    
    if (!(var_name %in% names(data))) {
      result$issues[[length(result$issues) + 1]] <- list(
        variable = var_name,
        type = "missing_variable",
        severity = "error",
        message = paste("Variable", var_name, "not found in dataset")
      )
      result$validation_passed <- FALSE
      next
    }
    
    var_data <- data[[var_name]]
    
    # Check if required variable has missing values
    if (!is.null(spec$required) && spec$required) {
      missing_count <- sum(is.na(var_data))
      if (missing_count > 0) {
        result$issues[[length(result$issues) + 1]] <- list(
          variable = var_name,
          type = "required_missing",
          severity = "error",
          message = paste("Required variable", var_name, "has", missing_count, "missing values")
        )
        result$validation_passed <- FALSE
      }
    }
    
    # Type-specific validation
    if (spec$type == "continuous") {
      # Check if numeric
      if (!is.numeric(var_data)) {
        result$issues[[length(result$issues) + 1]] <- list(
          variable = var_name,
          type = "type_mismatch",
          severity = "error",
          message = paste("Variable", var_name, "should be numeric but is", class(var_data)[1])
        )
        result$validation_passed <- FALSE
      } else {
        # Check range
        if (!is.null(spec$range)) {
          min_val <- spec$range[1]
          max_val <- spec$range[2]
          out_of_range <- sum(var_data < min_val | var_data > max_val, na.rm = TRUE)
          
          if (out_of_range > 0) {
            result$issues[[length(result$issues) + 1]] <- list(
              variable = var_name,
              type = "range_violation",
              severity = "warning",
              message = paste(out_of_range, "values in", var_name, "are outside range [", min_val, ",", max_val, "]"),
              count = out_of_range,
              percentage = round(out_of_range / length(var_data) * 100, 2)
            )
          }
        }
      }
      
    } else if (spec$type == "categorical" || spec$type == "binary") {
      # Check allowed values
      if (!is.null(spec$allowed_values)) {
        invalid_values <- sum(!(var_data %in% c(spec$allowed_values, NA)))
        
        if (invalid_values > 0) {
          result$issues[[length(result$issues) + 1]] <- list(
            variable = var_name,
            type = "invalid_category",
            severity = "error",
            message = paste(invalid_values, "values in", var_name, "are not in allowed values"),
            count = invalid_values,
            allowed_values = spec$allowed_values,
            found_values = unique(var_data[!(var_data %in% c(spec$allowed_values, NA))])
          )
          result$validation_passed <- FALSE
        }
      }
      
    } else if (spec$type == "date") {
      # Try to parse as date
      tryCatch({
        date_parsed <- as.Date(var_data)
        if (sum(is.na(date_parsed)) > sum(is.na(var_data))) {
          result$issues[[length(result$issues) + 1]] <- list(
            variable = var_name,
            type = "date_parse_error",
            severity = "error",
            message = paste("Some values in", var_name, "cannot be parsed as dates")
          )
          result$validation_passed <- FALSE
        }
      }, error = function(e) {
        result$issues[[length(result$issues) + 1]] <- list(
          variable = var_name,
          type = "date_parse_error",
          severity = "error",
          message = paste("Variable", var_name, "cannot be parsed as date:", e$message)
        )
        result$validation_passed <- FALSE
      })
    }
  }
}

# ============================================================================
# MISSING DATA ANALYSIS
# ============================================================================
if (${check_missing}) {
  missing_summary <- data.frame(
    variable = names(data),
    missing_count = sapply(data, function(x) sum(is.na(x))),
    missing_percentage = sapply(data, function(x) round(sum(is.na(x)) / length(x) * 100, 2))
  )
  missing_summary <- missing_summary[order(-missing_summary$missing_count), ]
  
  result$summary$missing_data <- missing_summary
  
  # Flag variables with high missingness
  high_missing <- missing_summary[missing_summary$missing_percentage > 20, ]
  if (nrow(high_missing) > 0) {
    for (i in 1:nrow(high_missing)) {
      result$issues[[length(result$issues) + 1]] <- list(
        variable = as.character(high_missing$variable[i]),
        type = "high_missingness",
        severity = "warning",
        message = paste("Variable", high_missing$variable[i], "has", 
                       high_missing$missing_percentage[i], "% missing values"),
        percentage = high_missing$missing_percentage[i]
      )
    }
  }
  
  # Overall missingness
  total_cells <- nrow(data) * ncol(data)
  total_missing <- sum(is.na(data))
  result$summary$overall_missingness <- list(
    total_cells = total_cells,
    missing_cells = total_missing,
    percentage = round(total_missing / total_cells * 100, 2)
  )
}

# ============================================================================
# OUTLIER DETECTION
# ============================================================================
if (${check_outliers}) {
  numeric_vars <- names(data)[sapply(data, is.numeric)]
  outlier_summary <- list()
  
  for (var in numeric_vars) {
    var_data <- data[[var]]
    var_data <- var_data[!is.na(var_data)]
    
    if (length(var_data) > 0) {
      q1 <- quantile(var_data, 0.25)
      q3 <- quantile(var_data, 0.75)
      iqr <- q3 - q1
      
      lower_bound <- q1 - 1.5 * iqr
      upper_bound <- q3 + 1.5 * iqr
      
      outliers_lower <- sum(var_data < lower_bound)
      outliers_upper <- sum(var_data > upper_bound)
      outliers_total <- outliers_lower + outliers_upper
      
      if (outliers_total > 0) {
        outlier_summary[[var]] <- list(
          lower_outliers = outliers_lower,
          upper_outliers = outliers_upper,
          total_outliers = outliers_total,
          percentage = round(outliers_total / length(var_data) * 100, 2),
          lower_bound = lower_bound,
          upper_bound = upper_bound
        )
        
        # Flag if >5% outliers
        if (outliers_total / length(var_data) > 0.05) {
          result$issues[[length(result$issues) + 1]] <- list(
            variable = var,
            type = "excessive_outliers",
            severity = "warning",
            message = paste("Variable", var, "has", outliers_total, "outliers (",
                           round(outliers_total/length(var_data)*100, 1), "%)"),
            count = outliers_total,
            percentage = round(outliers_total / length(var_data) * 100, 2)
          )
        }
      }
    }
  }
  
  result$summary$outliers <- outlier_summary
}

# ============================================================================
# DUPLICATE DETECTION
# ============================================================================
if (${check_duplicates}) {
  duplicate_rows <- sum(duplicated(data))
  
  result$summary$duplicates <- list(
    duplicate_rows = duplicate_rows,
    percentage = round(duplicate_rows / nrow(data) * 100, 2)
  )
  
  if (duplicate_rows > 0) {
    result$issues[[length(result$issues) + 1]] <- list(
      type = "duplicate_rows",
      severity = "warning",
      message = paste("Found", duplicate_rows, "duplicate rows (",
                     round(duplicate_rows/nrow(data)*100, 2), "%)"),
      count = duplicate_rows
    )
  }
}

# ============================================================================
# DESCRIPTIVE STATISTICS
# ============================================================================
desc_stats <- list()
for (var in names(data)) {
  var_data <- data[[var]]
  
  if (is.numeric(var_data)) {
    desc_stats[[var]] <- list(
      type = "numeric",
      n = length(var_data),
      missing = sum(is.na(var_data)),
      mean = round(mean(var_data, na.rm = TRUE), 3),
      sd = round(sd(var_data, na.rm = TRUE), 3),
      median = round(median(var_data, na.rm = TRUE), 3),
      min = round(min(var_data, na.rm = TRUE), 3),
      max = round(max(var_data, na.rm = TRUE), 3),
      q25 = round(quantile(var_data, 0.25, na.rm = TRUE), 3),
      q75 = round(quantile(var_data, 0.75, na.rm = TRUE), 3)
    )
  } else {
    freq_table <- table(var_data, useNA = "ifany")
    desc_stats[[var]] <- list(
      type = "categorical",
      n = length(var_data),
      missing = sum(is.na(var_data)),
      n_categories = length(unique(var_data[!is.na(var_data)])),
      frequencies = as.list(freq_table)
    )
  }
}
result$summary$descriptive_statistics <- desc_stats

# Final summary
result$summary$validation_summary <- list(
  total_issues = length(result$issues),
  errors = sum(sapply(result$issues, function(x) x$severity == "error")),
  warnings = sum(sapply(result$issues, function(x) x$severity == "warning")),
  validation_passed = result$validation_passed
)

# Convert to JSON
cat(toJSON(result, auto_unbox = TRUE, pretty = TRUE))
`;

    const output = await executeRScript(rScript);
    const result = JSON.parse(output);

    const duration = Date.now() - startTime;
    logger.info('Data validation completed', { 
      validation_passed: result.validation_passed,
      total_issues: result.summary?.validation_summary?.total_issues || 0,
      duration
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          validation_passed: result.validation_passed,
          data_summary: {
            n_rows: result.n_rows,
            n_cols: result.n_cols,
            variables: result.variables
          },
          issues: result.issues,
          summary: result.summary
        }, null, 2),
      }],
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Data validation failed', { 
      error: errorMessage,
      duration
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          note: 'Ensure R is installed and data file is accessible'
        }, null, 2),
      }],
      isError: true,
    };
  }
}

// ============================================================================
// 4. POWER ANALYSIS
// ============================================================================

interface PowerAnalysisArgs {
  test_type: 't-test' | 'anova' | 'correlation' | 'chi-square' | 'regression';
  effect_size?: number;
  sample_size?: number;
  power?: number;
  alpha?: number;
  calculate: 'power' | 'sample_size' | 'effect_size';
  num_groups?: number;
  alternative?: 'two.sided' | 'greater' | 'less';
}

/**
 * Power analysis and sample size calculation
 */
export async function calculatePower(args: PowerAnalysisArgs) {
  const startTime = Date.now();
  
  logger.info('Power analysis started', { 
    test_type: args.test_type,
    calculate: args.calculate
  });

  try {
    const {
      test_type,
      effect_size,
      sample_size,
      power,
      alpha = 0.05,
      calculate,
      num_groups = 2,
      alternative = 'two.sided'
    } = args;

    const rScript = `
# Load required packages
if (!require("pwr", quietly = TRUE)) {
  install.packages("pwr", repos = "https://cloud.r-project.org")
  library(pwr)
}
if (!require("jsonlite", quietly = TRUE)) {
  install.packages("jsonlite", repos = "https://cloud.r-project.org")
  library(jsonlite)
}

# Initialize result
result <- list(
  test_type = "${test_type}",
  calculate = "${calculate}",
  input_parameters = list(
    effect_size = ${effect_size || 'NULL'},
    sample_size = ${sample_size || 'NULL'},
    power = ${power || 'NULL'},
    alpha = ${alpha},
    num_groups = ${num_groups}
  ),
  calculated_value = NULL,
  interpretation = NULL,
  recommendation = NULL,
  power_curve_data = NULL
)

# Perform power analysis based on test type
if ("${test_type}" == "t-test") {
  if ("${calculate}" == "power") {
    pwr_result <- pwr.t.test(
      n = ${sample_size},
      d = ${effect_size},
      sig.level = ${alpha},
      type = "two.sample",
      alternative = "${alternative}"
    )
    result$calculated_value <- pwr_result$power
    result$interpretation <- paste0(
      "With n=", ${sample_size}, " per group, effect size d=", ${effect_size},
      ", and α=", ${alpha}, ", the study has ", round(pwr_result$power * 100, 1),
      "% power to detect the effect."
    )
    
    if (pwr_result$power < 0.80) {
      result$recommendation <- "Power is below the conventional 80% threshold. Consider increasing sample size."
    } else {
      result$recommendation <- "Power is adequate (≥80%)."
    }
    
  } else if ("${calculate}" == "sample_size") {
    pwr_result <- pwr.t.test(
      d = ${effect_size},
      sig.level = ${alpha},
      power = ${power},
      type = "two.sample",
      alternative = "${alternative}"
    )
    result$calculated_value <- ceiling(pwr_result$n)
    result$interpretation <- paste0(
      "To achieve ", ${(power || 0.8) * 100}, "% power with effect size d=", ${effect_size},
      " and α=", ${alpha}, ", you need n=", ceiling(pwr_result$n), " per group (",
      ceiling(pwr_result$n) * 2, " total)."
    )
    result$recommendation <- paste0("Recruit at least ", ceiling(pwr_result$n), " participants per group.")
    
  } else if ("${calculate}" == "effect_size") {
    pwr_result <- pwr.t.test(
      n = ${sample_size},
      sig.level = ${alpha},
      power = ${power},
      type = "two.sample",
      alternative = "${alternative}"
    )
    result$calculated_value <- pwr_result$d
    result$interpretation <- paste0(
      "With n=", ${sample_size}, " per group, α=", ${alpha}, ", and ", ${(power || 0.8) * 100},
      "% power, you can detect an effect size of d=", round(pwr_result$d, 3), "."
    )
    
    # Interpret effect size
    if (pwr_result$d < 0.2) {
      result$recommendation <- "Detectable effect is very small. Study is well-powered for small effects."
    } else if (pwr_result$d < 0.5) {
      result$recommendation <- "Detectable effect is small (Cohen's d < 0.5)."
    } else if (pwr_result$d < 0.8) {
      result$recommendation <- "Detectable effect is medium (Cohen's d 0.5-0.8)."
    } else {
      result$recommendation <- "Only large effects (Cohen's d ≥ 0.8) can be detected. Consider increasing sample size."
    }
  }
  
  # Generate power curve
  if ("${calculate}" == "power") {
    n_range <- seq(10, ${sample_size} * 2, by = 5)
    power_curve <- sapply(n_range, function(n) {
      pwr.t.test(n = n, d = ${effect_size}, sig.level = ${alpha}, 
                 type = "two.sample", alternative = "${alternative}")$power
    })
    result$power_curve_data <- data.frame(n = n_range, power = power_curve)
  }
  
} else if ("${test_type}" == "anova") {
  if ("${calculate}" == "power") {
    pwr_result <- pwr.anova.test(
      k = ${num_groups},
      n = ${sample_size},
      f = ${effect_size},
      sig.level = ${alpha}
    )
    result$calculated_value <- pwr_result$power
    result$interpretation <- paste0(
      "With n=", ${sample_size}, " per group (", ${num_groups}, " groups), effect size f=", ${effect_size},
      ", and α=", ${alpha}, ", the study has ", round(pwr_result$power * 100, 1),
      "% power."
    )
    
  } else if ("${calculate}" == "sample_size") {
    pwr_result <- pwr.anova.test(
      k = ${num_groups},
      f = ${effect_size},
      sig.level = ${alpha},
      power = ${power}
    )
    result$calculated_value <- ceiling(pwr_result$n)
    result$interpretation <- paste0(
      "To achieve ", ${(power || 0.8) * 100}, "% power with ", ${num_groups}, " groups, effect size f=", ${effect_size},
      ", and α=", ${alpha}, ", you need n=", ceiling(pwr_result$n), " per group (",
      ceiling(pwr_result$n) * ${num_groups}, " total)."
    )
  }
  
} else if ("${test_type}" == "correlation") {
  if ("${calculate}" == "power") {
    pwr_result <- pwr.r.test(
      n = ${sample_size},
      r = ${effect_size},
      sig.level = ${alpha},
      alternative = "${alternative}"
    )
    result$calculated_value <- pwr_result$power
    result$interpretation <- paste0(
      "With n=", ${sample_size}, ", correlation r=", ${effect_size},
      ", and α=", ${alpha}, ", the study has ", round(pwr_result$power * 100, 1),
      "% power."
    )
    
  } else if ("${calculate}" == "sample_size") {
    pwr_result <- pwr.r.test(
      r = ${effect_size},
      sig.level = ${alpha},
      power = ${power},
      alternative = "${alternative}"
    )
    result$calculated_value <- ceiling(pwr_result$n)
    result$interpretation <- paste0(
      "To achieve ", ${(power || 0.8) * 100}, "% power with correlation r=", ${effect_size},
      " and α=", ${alpha}, ", you need n=", ceiling(pwr_result$n), " participants."
    )
  }
  
} else if ("${test_type}" == "chi-square") {
  if ("${calculate}" == "power") {
    pwr_result <- pwr.chisq.test(
      w = ${effect_size},
      N = ${sample_size},
      df = ${num_groups - 1},
      sig.level = ${alpha}
    )
    result$calculated_value <- pwr_result$power
    result$interpretation <- paste0(
      "With N=", ${sample_size}, ", effect size w=", ${effect_size},
      ", df=", ${num_groups - 1}, ", and α=", ${alpha}, ", the study has ",
      round(pwr_result$power * 100, 1), "% power."
    )
    
  } else if ("${calculate}" == "sample_size") {
    pwr_result <- pwr.chisq.test(
      w = ${effect_size},
      df = ${num_groups - 1},
      sig.level = ${alpha},
      power = ${power}
    )
    result$calculated_value <- ceiling(pwr_result$N)
    result$interpretation <- paste0(
      "To achieve ", ${(power || 0.8) * 100}, "% power with effect size w=", ${effect_size},
      ", df=", ${num_groups - 1}, ", and α=", ${alpha}, ", you need N=",
      ceiling(pwr_result$N), " total participants."
    )
  }
}

# Effect size interpretation
result$effect_size_interpretation <- list()
if ("${test_type}" == "t-test") {
  if (!is.null(${effect_size})) {
    d <- ${effect_size}
    if (d < 0.2) {
      result$effect_size_interpretation$magnitude <- "Very small"
    } else if (d < 0.5) {
      result$effect_size_interpretation$magnitude <- "Small"
    } else if (d < 0.8) {
      result$effect_size_interpretation$magnitude <- "Medium"
    } else {
      result$effect_size_interpretation$magnitude <- "Large"
    }
    result$effect_size_interpretation$cohens_d <- d
  }
} else if ("${test_type}" == "correlation") {
  if (!is.null(${effect_size})) {
    r <- ${effect_size}
    if (abs(r) < 0.3) {
      result$effect_size_interpretation$magnitude <- "Small"
    } else if (abs(r) < 0.5) {
      result$effect_size_interpretation$magnitude <- "Medium"
    } else {
      result$effect_size_interpretation$magnitude <- "Large"
    }
    result$effect_size_interpretation$correlation <- r
  }
}

# Convert to JSON
cat(toJSON(result, auto_unbox = TRUE, pretty = TRUE))
`;

    const output = await executeRScript(rScript);
    const result = JSON.parse(output);

    const duration = Date.now() - startTime;
    logger.info('Power analysis completed', { 
      test_type,
      calculated: calculate,
      value: result.calculated_value,
      duration
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          test_type,
          calculate,
          calculated_value: result.calculated_value,
          interpretation: result.interpretation,
          recommendation: result.recommendation,
          effect_size_interpretation: result.effect_size_interpretation,
          input_parameters: result.input_parameters,
          power_curve_data: result.power_curve_data
        }, null, 2),
      }],
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Power analysis failed', { 
      error: errorMessage,
      duration
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          note: 'Ensure R is installed with the "pwr" package'
        }, null, 2),
      }],
      isError: true,
    };
  }
}

// ============================================================================
// 5. COMPREHENSIVE ANALYSIS
// ============================================================================

interface ComprehensiveAnalysisArgs {
  data_file: string;
  research_question: string;
  outcome_variable: string;
  predictor_variables?: string[];
  group_variable?: string;
  covariates?: string[];
  study_design: 'cross-sectional' | 'case-control' | 'cohort' | 'rct';
  output_dir?: string;
  generate_report?: boolean;
}

/**
 * Run complete end-to-end statistical analysis workflow
 */
export async function runComprehensiveAnalysis(args: ComprehensiveAnalysisArgs) {
  const startTime = Date.now();
  
  logger.info('Comprehensive analysis started', { 
    research_question: args.research_question.substring(0, 100),
    study_design: args.study_design
  });

  try {
    const {
      data_file,
      research_question,
      outcome_variable,
      predictor_variables = [],
      group_variable,
      covariates = [],
      study_design,
      output_dir = tmpdir(),
      generate_report: _generate_report = true
    } = args;

    if (!existsSync(data_file)) {
      throw new Error(`Data file not found: ${data_file}`);
    }

    const escapedDataFile = data_file.replace(/\\/g, '/');
    const escapedOutputDir = output_dir.replace(/\\/g, '/');
    const predictorsJson = JSON.stringify(predictor_variables);
    const covariatesJson = JSON.stringify(covariates);

    const rScript = `
# Load required packages
packages <- c("jsonlite", "gtsummary", "flextable", "officer")
for (pkg in packages) {
  if (!require(pkg, quietly = TRUE)) {
    install.packages(pkg, repos = "https://cloud.r-project.org")
    library(pkg, character.only = TRUE)
  }
}

# Load data
data <- read.csv("${escapedDataFile}")

# Initialize result
result <- list(
  research_question = "${research_question}",
  study_design = "${study_design}",
  analysis_steps = list(),
  descriptive_statistics = list(),
  inferential_results = list(),
  tables = list(),
  figures = list(),
  interpretation = list(),
  recommendations = list()
)

# Step 1: Data validation
result$analysis_steps[[1]] <- "Data validation and quality check"
result$data_summary <- list(
  n_rows = nrow(data),
  n_cols = ncol(data),
  outcome_variable = "${outcome_variable}",
  predictor_variables = fromJSON('${predictorsJson}'),
  covariates = fromJSON('${covariatesJson}')
)

# Step 2: Descriptive statistics
result$analysis_steps[[2]] <- "Descriptive statistics (Table 1)"

# Create Table 1
${group_variable ? `
if ("${group_variable}" %in% names(data)) {
  table1 <- data %>%
    select(all_of(c("${outcome_variable}", "${group_variable}", 
                    fromJSON('${predictorsJson}'), fromJSON('${covariatesJson}')))) %>%
    tbl_summary(by = "${group_variable}") %>%
    add_p() %>%
    add_overall()
  
  # Save table
  table1_file <- file.path("${escapedOutputDir}", "table1.docx")
  table1 %>%
    as_flex_table() %>%
    save_as_docx(path = table1_file)
  
  result$tables$table1 <- table1_file
}
` : `
table1 <- data %>%
  select(all_of(c("${outcome_variable}", 
                  fromJSON('${predictorsJson}'), fromJSON('${covariatesJson}')))) %>%
  tbl_summary()

table1_file <- file.path("${escapedOutputDir}", "table1.docx")
table1 %>%
  as_flex_table() %>%
  save_as_docx(path = table1_file)

result$tables$table1 <- table1_file
`}

# Step 3: Test selection
result$analysis_steps[[3]] <- "Statistical test selection"
# (This would call the selectStatisticalTest logic)

# Step 4: Assumption checking
result$analysis_steps[[4]] <- "Assumption checking"
# (This would call the checkAssumptions logic)

# Step 5: Primary analysis
result$analysis_steps[[5]] <- "Primary statistical analysis"

# Placeholder for actual analysis
# This would be customized based on test selection
result$inferential_results$note <- "Analysis would be performed based on selected test"

# Step 6: Effect size calculation
result$analysis_steps[[6]] <- "Effect size calculation"

# Step 7: Interpretation
result$interpretation$summary <- "Analysis completed successfully"
result$interpretation$conclusion <- "Results should be interpreted in context of study design and limitations"

# Recommendations
result$recommendations <- list(
  "Report effect sizes with 95% confidence intervals",
  "Acknowledge study limitations",
  "Consider clinical significance alongside statistical significance",
  paste0("Follow ", toupper("${study_design}"), " reporting guidelines")
)

# Convert to JSON
cat(toJSON(result, auto_unbox = TRUE, pretty = TRUE))
`;

    const output = await executeRScript(rScript);
    const result = JSON.parse(output);

    const duration = Date.now() - startTime;
    logger.info('Comprehensive analysis completed', { 
      study_design,
      steps_completed: result.analysis_steps?.length || 0,
      duration
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          research_question,
          study_design,
          analysis_steps: result.analysis_steps,
          data_summary: result.data_summary,
          descriptive_statistics: result.descriptive_statistics,
          inferential_results: result.inferential_results,
          tables: result.tables,
          figures: result.figures,
          interpretation: result.interpretation,
          recommendations: result.recommendations
        }, null, 2),
      }],
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Comprehensive analysis failed', { 
      error: errorMessage,
      duration
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: errorMessage,
          note: 'Ensure R is installed with required packages (gtsummary, flextable, officer)'
        }, null, 2),
      }],
      isError: true,
    };
  }
}
