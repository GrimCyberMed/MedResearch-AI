/**
 * Project Dashboard Generator Tool
 * 
 * Generates real-time HTML dashboards for systematic review projects with
 * interactive charts, progress tracking, and key metrics visualization.
 * 
 * Uses Chart.js for visualizations and responsive HTML/CSS for layout.
 * 
 * @module project-dashboard
 * @version 1.0.0
 * @since 5.0.0
 */

import { logger } from '../../common/logger.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Dashboard metrics
 */
export interface DashboardMetrics {
  phase_progress: Record<string, number>; // Phase name -> completion %
  citations_processed: number;
  studies_included: number;
  studies_excluded: number;
  quality_scores: Record<string, number>; // Metric name -> score
  timeline_status: 'on_track' | 'delayed' | 'ahead' | 'unknown';
  days_elapsed: number;
  estimated_days_remaining: number;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  title: string;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
}

/**
 * Dashboard input
 */
export interface CreateDashboardInput {
  project_path: string;
  project_name: string;
  metrics: DashboardMetrics;
  charts?: ChartConfig[];
  output_path?: string;
  auto_refresh?: boolean; // Auto-refresh every 60 seconds
  theme?: 'light' | 'dark';
}

/**
 * Dashboard output
 */
export interface CreateDashboardOutput {
  success: boolean;
  dashboard_path: string;
  metrics: DashboardMetrics;
  charts_generated: number;
  processing_time_ms: number;
}

/**
 * Generate HTML dashboard template
 */
function generateDashboardHTML(input: CreateDashboardInput): string {
  const { project_name, metrics, charts = [], auto_refresh = false, theme = 'light' } = input;
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#e0e0e0' : '#333333';
  const cardBg = isDark ? '#2d2d2d' : '#f8f9fa';
  const borderColor = isDark ? '#404040' : '#dee2e6';
  
  // Calculate overall progress
  const phaseValues = Object.values(metrics.phase_progress);
  const overallProgress = phaseValues.length > 0
    ? phaseValues.reduce((a, b) => a + b, 0) / phaseValues.length
    : 0;
  
  // Timeline status color
  const timelineColors = {
    on_track: '#28a745',
    ahead: '#17a2b8',
    delayed: '#dc3545',
    unknown: '#6c757d',
  };
  const timelineColor = timelineColors[metrics.timeline_status];
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project_name} - Dashboard</title>
    ${auto_refresh ? '<meta http-equiv="refresh" content="60">' : ''}
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: ${bgColor};
            color: ${textColor};
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: ${cardBg};
            border: 1px solid ${borderColor};
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .metric-label {
            font-size: 0.9em;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
        }
        
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        
        .metric-subtitle {
            font-size: 0.9em;
            color: #6c757d;
            margin-top: 5px;
        }
        
        .progress-bar-container {
            background: ${borderColor};
            border-radius: 10px;
            height: 30px;
            overflow: hidden;
            margin-top: 10px;
        }
        
        .progress-bar {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
            transition: width 0.5s ease;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .chart-card {
            background: ${cardBg};
            border: 1px solid ${borderColor};
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .chart-title {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 20px;
            color: ${textColor};
        }
        
        .chart-container {
            position: relative;
            height: 300px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-on-track {
            background: #d4edda;
            color: #155724;
        }
        
        .status-ahead {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        .status-delayed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-unknown {
            background: #e2e3e5;
            color: #383d41;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 0.9em;
            border-top: 1px solid ${borderColor};
            margin-top: 30px;
        }
        
        .timestamp {
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 1.8em;
            }
            
            .metric-value {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 ${project_name}</h1>
            <p>Systematic Review Dashboard - Real-time Progress Tracking</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Overall Progress</div>
                <div class="metric-value">${overallProgress.toFixed(0)}%</div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${overallProgress}%">
                        ${overallProgress.toFixed(0)}%
                    </div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Citations Processed</div>
                <div class="metric-value">${metrics.citations_processed.toLocaleString()}</div>
                <div class="metric-subtitle">Total citations screened</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Studies Included</div>
                <div class="metric-value">${metrics.studies_included}</div>
                <div class="metric-subtitle">${metrics.studies_excluded} excluded</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Timeline Status</div>
                <div class="metric-value">
                    <span class="status-badge status-${metrics.timeline_status}">
                        ${metrics.timeline_status.replace('_', ' ')}
                    </span>
                </div>
                <div class="metric-subtitle">
                    ${metrics.days_elapsed} days elapsed, 
                    ${metrics.estimated_days_remaining} days remaining
                </div>
            </div>
        </div>
        
        ${charts.length > 0 ? `
        <div class="charts-grid">
            ${charts.map((chart, index) => `
            <div class="chart-card">
                <div class="chart-title">${chart.title}</div>
                <div class="chart-container">
                    <canvas id="chart-${index}"></canvas>
                </div>
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="footer">
            <p class="timestamp">Last updated: ${new Date().toLocaleString()}</p>
            <p>Generated by MedResearch AI v5.0.0 - Project Dashboard Tool</p>
            ${auto_refresh ? '<p>⟳ Auto-refreshing every 60 seconds</p>' : ''}
        </div>
    </div>
    
    <script>
        // Chart.js configuration
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '${textColor}';
        
        ${charts.map((chart, index) => `
        // Chart ${index + 1}: ${chart.title}
        new Chart(document.getElementById('chart-${index}'), {
            type: '${chart.type}',
            data: ${JSON.stringify(chart.data)},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        enabled: true
                    }
                },
                ${chart.type === 'bar' || chart.type === 'line' ? `
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '${borderColor}'
                        }
                    },
                    x: {
                        grid: {
                            color: '${borderColor}'
                        }
                    }
                }
                ` : ''}
            }
        });
        `).join('\n')}
    </script>
</body>
</html>`;
  
  return html;
}

/**
 * Generate default charts from metrics
 */
function generateDefaultCharts(metrics: DashboardMetrics): ChartConfig[] {
  const charts: ChartConfig[] = [];
  
  // Chart 1: Phase Progress
  if (Object.keys(metrics.phase_progress).length > 0) {
    const phases = Object.keys(metrics.phase_progress);
    const progress = Object.values(metrics.phase_progress);
    
    charts.push({
      type: 'bar',
      title: 'Phase Progress',
      data: {
        labels: phases,
        datasets: [{
          label: 'Completion %',
          data: progress,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
        }],
      },
    });
  }
  
  // Chart 2: Study Selection
  if (metrics.studies_included > 0 || metrics.studies_excluded > 0) {
    charts.push({
      type: 'doughnut',
      title: 'Study Selection',
      data: {
        labels: ['Included', 'Excluded'],
        datasets: [{
          label: 'Studies',
          data: [metrics.studies_included, metrics.studies_excluded],
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',
            'rgba(220, 53, 69, 0.8)',
          ],
          borderColor: [
            'rgba(40, 167, 69, 1)',
            'rgba(220, 53, 69, 1)',
          ],
          borderWidth: 2,
        }],
      },
    });
  }
  
  // Chart 3: Quality Scores
  if (Object.keys(metrics.quality_scores).length > 0) {
    const scoreNames = Object.keys(metrics.quality_scores);
    const scoreValues = Object.values(metrics.quality_scores);
    
    charts.push({
      type: 'radar',
      title: 'Quality Scores',
      data: {
        labels: scoreNames,
        datasets: [{
          label: 'Score',
          data: scoreValues,
          backgroundColor: 'rgba(118, 75, 162, 0.2)',
          borderColor: 'rgba(118, 75, 162, 1)',
          borderWidth: 2,
        }],
      },
    });
  }
  
  return charts;
}

/**
 * Create project dashboard
 * 
 * @param input - Dashboard configuration and metrics
 * @returns Dashboard generation results
 */
export async function createProjectDashboard(
  input: CreateDashboardInput
): Promise<CreateDashboardOutput> {
  const startTime = Date.now();
  
  try {
    logger.info(`Creating project dashboard for ${input.project_name}`);
    
    // Generate charts if not provided
    const charts = input.charts && input.charts.length > 0
      ? input.charts
      : generateDefaultCharts(input.metrics);
    
    logger.info(`Generating ${charts.length} charts`);
    
    // Generate HTML
    const html = generateDashboardHTML({
      ...input,
      charts,
    });
    
    // Determine output path
    const outputPath = input.output_path || path.join(
      input.project_path,
      'dashboard.html'
    );
    
    // Write HTML file
    await fs.writeFile(outputPath, html, 'utf-8');
    
    logger.info(`Dashboard saved to ${outputPath}`);
    
    const output: CreateDashboardOutput = {
      success: true,
      dashboard_path: outputPath,
      metrics: input.metrics,
      charts_generated: charts.length,
      processing_time_ms: Date.now() - startTime,
    };
    
    logger.info(`Dashboard created successfully in ${output.processing_time_ms}ms`);
    
    return output;
  } catch (error) {
    logger.error('Error creating project dashboard:', error);
    throw error;
  }
}

/**
 * Update existing dashboard with new metrics
 * 
 * @param dashboardPath - Path to existing dashboard
 * @param metrics - Updated metrics
 * @returns Update results
 */
export async function updateDashboard(
  dashboardPath: string,
  metrics: DashboardMetrics
): Promise<CreateDashboardOutput> {
  try {
    logger.info(`Updating dashboard at ${dashboardPath}`);
    
    // Extract project info from path
    const projectPath = path.dirname(dashboardPath);
    const projectName = path.basename(projectPath);
    
    // Recreate dashboard with new metrics
    return await createProjectDashboard({
      project_path: projectPath,
      project_name,
      metrics,
      output_path: dashboardPath,
      auto_refresh: true,
    });
  } catch (error) {
    logger.error('Error updating dashboard:', error);
    throw error;
  }
}
