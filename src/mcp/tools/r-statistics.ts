/**
 * R Statistics Integration Tools
 * 
 * Tools for running meta-analyses and generating forest plots using R
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

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
file_ext <- tolower(tools::file_ext("${output_path}"))

# Open graphics device
if (file_ext == "pdf") {
  pdf("${output_path}", width = 10, height = 8)
} else {
  png("${output_path}", width = 1200, height = 960, res = 120)
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
  smlab = "${title}",
  weight.study = "random",
  sortvar = TE
)

# Close graphics device
dev.off()

cat("Forest plot saved to: ${output_path}")
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
