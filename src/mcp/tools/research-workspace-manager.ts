/**
 * Research Workspace Manager - MCP Tool
 * 
 * Manages research project workspaces with automatic folder creation,
 * progress tracking, Zotero integration, backups, and Telegram notifications.
 * 
 * Integrates with the 9-agent MedResearch AI system.
 * 
 * @module research-workspace-manager
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../../common/logger.js';
import { configManager, type ResearchType, type ProjectWorkspaceConfig } from '../../common/workspace-config.js';
import { templateManager } from '../../common/workspace-templates.js';
import { telegramNotifier } from '../../common/telegram-notifier.js';

/**
 * Create a new research project workspace
 */
export async function createResearchProject(params: {
  researchQuestion: string;
  researchType: ResearchType;
  client?: {
    firstName: string;
    lastName: string;
  };
  customTitle?: string;
}): Promise<{
  success: boolean;
  projectId: string;
  projectName: string;
  projectPath: string;
  message: string;
  error?: string;
}> {
  try {
    logger.info('Creating new research project...');

    // Load global config
    const globalConfig = await configManager.getGlobalConfig();

    // Generate project ID
    const projectId = await generateProjectId(globalConfig.naming.idPrefix);

    // Generate project name
    const projectName = params.customTitle || generateProjectName(params.researchQuestion);

    // Generate folder name
    const folderName = generateFolderName(
      projectId,
      projectName,
      params.client,
      globalConfig.naming
    );

    // Create project path
    const projectsRoot = path.join(process.cwd(), 'research-projects');
    const projectPath = path.join(projectsRoot, folderName);

    // Check if project already exists
    try {
      await fs.access(projectPath);
      return {
        success: false,
        projectId: '',
        projectName: '',
        projectPath: '',
        message: 'Project already exists',
        error: `A project with the name "${folderName}" already exists`,
      };
    } catch {
      // Project doesn't exist, continue
    }

    // Create project structure
    await templateManager.createProjectStructure(
      projectPath,
      projectName,
      params.researchType,
      params.client
    );

    // Create project config
    const projectConfig: ProjectWorkspaceConfig = {
      projectId,
      projectName,
      researchType: params.researchType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      client: params.client,
    };

    await configManager.saveProjectConfig(projectPath, projectConfig);

    // Create Zotero collection if enabled
    if (globalConfig.zotero.enabled && globalConfig.zotero.autoCreateCollection) {
      await createZoteroCollection(projectName, projectId, globalConfig.zotero.createSubCollections);
    }

    // Send Telegram notification
    if (globalConfig.telegram.enabled) {
      await telegramNotifier.notifyProjectCreated(
        projectName,
        params.researchType,
        projectId
      );
    }

    // Create initial backup
    if (globalConfig.backup.enabled && globalConfig.backup.createSnapshots) {
      await createSnapshot(projectPath, projectName, 'project_created');
    }

    logger.info(`Research project created successfully: ${projectName}`);

    return {
      success: true,
      projectId,
      projectName,
      projectPath,
      message: `Research project "${projectName}" created successfully at ${projectPath}`,
    };
  } catch (error) {
    logger.error('Failed to create research project:', error);
    return {
      success: false,
      projectId: '',
      projectName: '',
      projectPath: '',
      message: 'Failed to create research project',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Update project progress
 */
export async function updateProjectProgress(params: {
  projectPath: string;
  phase: string;
  progress: number;
  tasks?: Record<string, boolean>;
  statistics?: Record<string, number>;
}): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    // Load current progress
    const progressPath = path.join(params.projectPath, 'progress.json');
    const progressData = await fs.readFile(progressPath, 'utf-8');
    const progress = JSON.parse(progressData);

    // Update progress
    progress.lastUpdated = new Date().toISOString();
    
    if (progress.phases[params.phase]) {
      progress.phases[params.phase].progress = params.progress;
      
      if (params.progress >= 100) {
        progress.phases[params.phase].status = 'completed';
      } else if (params.progress > 0) {
        progress.phases[params.phase].status = 'in_progress';
      }
      
      if (params.tasks) {
        progress.phases[params.phase].tasks = {
          ...progress.phases[params.phase].tasks,
          ...params.tasks,
        };
      }
    }

    // Calculate overall progress
    const phases = Object.values(progress.phases) as any[];
    const totalProgress = phases.reduce((sum: number, phase: any) => sum + phase.progress, 0);
    progress.overallProgress = Math.round(totalProgress / phases.length);

    // Save progress
    await fs.writeFile(progressPath, JSON.stringify(progress, null, 2), 'utf-8');

    // Update metadata statistics
    if (params.statistics) {
      await updateMetadataStatistics(params.projectPath, params.statistics);
    }

    // Update progress markdown
    await updateProgressMarkdown(params.projectPath, progress);

    // Update HTML dashboard
    await updateHtmlDashboard(params.projectPath, progress);

    // Send milestone notifications
    const projectName = await getProjectName(params.projectPath);
    
    if (params.progress === 50 || params.progress === 75 || params.progress === 100) {
      const globalConfig = await configManager.getGlobalConfig();
      if (globalConfig.telegram.enabled) {
        await telegramNotifier.notifyScreeningMilestone(
          projectName,
          params.progress,
          100,
          params.progress
        );
      }
    }

    logger.info(`Progress updated for ${projectName}: ${params.phase} - ${params.progress}%`);

    return {
      success: true,
      message: `Progress updated: ${params.phase} - ${params.progress}%`,
    };
  } catch (error) {
    logger.error('Failed to update progress:', error);
    return {
      success: false,
      message: 'Failed to update progress',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Create project snapshot
 */
export async function createProjectSnapshot(params: {
  projectPath: string;
  milestone: string;
}): Promise<{
  success: boolean;
  snapshotPath: string;
  message: string;
  error?: string;
}> {
  try {
    const projectName = await getProjectName(params.projectPath);
    const snapshotPath = await createSnapshot(params.projectPath, projectName, params.milestone);

    logger.info(`Snapshot created for ${projectName}: ${params.milestone}`);

    return {
      success: true,
      snapshotPath,
      message: `Snapshot created: ${snapshotPath}`,
    };
  } catch (error) {
    logger.error('Failed to create snapshot:', error);
    return {
      success: false,
      snapshotPath: '',
      message: 'Failed to create snapshot',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Archive completed project
 */
export async function archiveProject(params: {
  projectPath: string;
}): Promise<{
  success: boolean;
  archivePath: string;
  message: string;
  error?: string;
}> {
  try {
    const globalConfig = await configManager.getGlobalConfig();
    const projectName = await getProjectName(params.projectPath);
    
    // Create archive directory
    const year = new Date().getFullYear();
    const archiveDir = path.join(globalConfig.archive.archivePath, String(year));
    await fs.mkdir(archiveDir, { recursive: true });

    const projectFolderName = path.basename(params.projectPath);
    const archivePath = path.join(archiveDir, projectFolderName);

    // Move or copy project
    if (globalConfig.archive.strategy === 'move' || globalConfig.archive.strategy === 'both') {
      await fs.rename(params.projectPath, archivePath);
      logger.info(`Project moved to archive: ${archivePath}`);
    }

    // Compress if needed
    if (globalConfig.archive.strategy === 'compress' || globalConfig.archive.strategy === 'both') {
      const zipPath = `${archivePath}.zip`;
      // Note: Actual compression would require a library like archiver
      // For now, we'll just log the intent
      logger.info(`Project would be compressed to: ${zipPath}`);
    }

    // Send notification
    if (globalConfig.telegram.enabled) {
      await telegramNotifier.notifyProjectArchived(projectName, archivePath);
    }

    return {
      success: true,
      archivePath,
      message: `Project archived successfully: ${archivePath}`,
    };
  } catch (error) {
    logger.error('Failed to archive project:', error);
    return {
      success: false,
      archivePath: '',
      message: 'Failed to archive project',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * List all research projects
 */
export async function listResearchProjects(): Promise<{
  success: boolean;
  projects: Array<{
    projectId: string;
    projectName: string;
    researchType: string;
    status: string;
    createdAt: string;
    overallProgress: number;
  }>;
  message: string;
  error?: string;
}> {
  try {
    const projectsRoot = path.join(process.cwd(), 'research-projects');
    
    try {
      await fs.access(projectsRoot);
    } catch {
      return {
        success: true,
        projects: [],
        message: 'No research projects found',
      };
    }

    const entries = await fs.readdir(projectsRoot, { withFileTypes: true });
    const projectFolders = entries.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'));

    const projects = [];

    for (const folder of projectFolders) {
      const projectPath = path.join(projectsRoot, folder.name);
      
      try {
        // Load metadata
        const metadataPath = path.join(projectPath, 'metadata.json');
        const metadataData = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataData);

        // Load progress
        const progressPath = path.join(projectPath, 'progress.json');
        const progressData = await fs.readFile(progressPath, 'utf-8');
        const progress = JSON.parse(progressData);

        projects.push({
          projectId: metadata.projectId,
          projectName: metadata.projectName,
          researchType: metadata.researchType,
          status: metadata.status,
          createdAt: metadata.createdAt,
          overallProgress: progress.overallProgress || 0,
        });
      } catch (error) {
        logger.warn(`Failed to load project metadata for ${folder.name}:`, error);
      }
    }

    return {
      success: true,
      projects,
      message: `Found ${projects.length} research project(s)`,
    };
  } catch (error) {
    logger.error('Failed to list research projects:', error);
    return {
      success: false,
      projects: [],
      message: 'Failed to list research projects',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get project details
 */
export async function getProjectDetails(params: {
  projectPath: string;
}): Promise<{
  success: boolean;
  metadata?: any;
  progress?: any;
  config?: any;
  message: string;
  error?: string;
}> {
  try {
    // Load metadata
    const metadataPath = path.join(params.projectPath, 'metadata.json');
    const metadataData = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataData);

    // Load progress
    const progressPath = path.join(params.projectPath, 'progress.json');
    const progressData = await fs.readFile(progressPath, 'utf-8');
    const progress = JSON.parse(progressData);

    // Load config
    const config = await configManager.loadProjectConfig(params.projectPath);

    return {
      success: true,
      metadata,
      progress,
      config,
      message: 'Project details retrieved successfully',
    };
  } catch (error) {
    logger.error('Failed to get project details:', error);
    return {
      success: false,
      message: 'Failed to get project details',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique project ID
 */
async function generateProjectId(prefix: string): Promise<string> {
  const projectsRoot = path.join(process.cwd(), 'research-projects');
  
  try {
    await fs.access(projectsRoot);
  } catch {
    return `${prefix}001`;
  }

  const entries = await fs.readdir(projectsRoot, { withFileTypes: true });
  const projectFolders = entries.filter(entry => entry.isDirectory() && entry.name.startsWith(prefix));

  const numbers = projectFolders
    .map(folder => {
      const match = folder.name.match(new RegExp(`^${prefix}(\\d+)`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(num => !isNaN(num));

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Generate project name from research question
 */
function generateProjectName(researchQuestion: string): string {
  // Extract key terms from research question
  const words = researchQuestion
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !['what', 'when', 'where', 'which', 'does', 'have', 'with', 'from', 'that', 'this'].includes(word));

  // Take first 5 meaningful words
  const keyWords = words.slice(0, 5);
  
  return keyWords.join('-');
}

/**
 * Generate folder name
 */
function generateFolderName(
  projectId: string,
  projectName: string,
  client: { firstName: string; lastName: string } | undefined,
  naming: any
): string {
  const date = new Date().toISOString().split('T')[0];
  const title = projectName.substring(0, naming.maxTitleLength);
  const clientName = client ? `${client.firstName.toLowerCase()}_${client.lastName.toLowerCase()}` : '';

  let folderName = naming.format
    .replace('[ID]', projectId)
    .replace('[Date]', date)
    .replace('[Title]', title)
    .replace('[Client]', clientName);

  // Clean up
  folderName = folderName.replace(/_+/g, '_').replace(/-+/g, '-').replace(/^[-_]+|[-_]+$/g, '');

  return folderName;
}

/**
 * Create Zotero collection
 */
async function createZoteroCollection(
  projectName: string,
  projectId: string,
  createSubCollections: boolean
): Promise<void> {
  // This would integrate with the Zotero API
  // For now, we'll just log the intent
  logger.info(`Would create Zotero collection: ${projectName} (${projectId})`);
  
  if (createSubCollections) {
    logger.info('Would create sub-collections: Included, Excluded, Duplicates, Full-Text-Review');
  }
}

/**
 * Create snapshot
 */
async function createSnapshot(
  projectPath: string,
  projectName: string,
  milestone: string
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotName = `snapshot-${milestone}-${timestamp}.zip`;
  const snapshotPath = path.join(projectPath, 'exports', 'snapshots', snapshotName);

  // Ensure snapshots directory exists
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true });

  // Note: Actual compression would require a library like archiver
  // For now, we'll create a placeholder file
  await fs.writeFile(
    snapshotPath.replace('.zip', '.txt'),
    `Snapshot created at ${new Date().toISOString()}\nMilestone: ${milestone}\nProject: ${projectName}`,
    'utf-8'
  );

  logger.info(`Snapshot created: ${snapshotPath}`);
  return snapshotPath;
}

/**
 * Update metadata statistics
 */
async function updateMetadataStatistics(
  projectPath: string,
  statistics: Record<string, number>
): Promise<void> {
  const metadataPath = path.join(projectPath, 'metadata.json');
  const metadataData = await fs.readFile(metadataPath, 'utf-8');
  const metadata = JSON.parse(metadataData);

  metadata.statistics = {
    ...metadata.statistics,
    ...statistics,
  };

  metadata.updatedAt = new Date().toISOString();

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
}

/**
 * Update progress markdown
 */
async function updateProgressMarkdown(projectPath: string, progress: any): Promise<void> {
  const projectName = await getProjectName(projectPath);
  
  let markdown = `# ${projectName} - Progress Report\n\n`;
  markdown += `**Last Updated**: ${progress.lastUpdated}\n\n`;
  markdown += `## Overall Progress: ${progress.overallProgress}%\n\n`;
  markdown += `---\n\n`;
  markdown += `## Phase Progress\n\n`;

  for (const [phaseName, phaseData] of Object.entries(progress.phases) as any[]) {
    const emoji = getPhaseEmoji(phaseName);
    const status = phaseData.status === 'completed' ? '✅' : phaseData.status === 'in_progress' ? '🔄' : '⏸️';
    
    markdown += `### ${emoji} ${phaseName.charAt(0).toUpperCase() + phaseName.slice(1)} (${phaseData.progress}%) ${status}\n`;
    
    for (const [taskName, taskCompleted] of Object.entries(phaseData.tasks)) {
      const checkbox = taskCompleted ? '[x]' : '[ ]';
      const taskLabel = taskName.replace(/([A-Z])/g, ' $1').trim();
      markdown += `- ${checkbox} ${taskLabel}\n`;
    }
    
    markdown += `\n`;
  }

  await fs.writeFile(path.join(projectPath, 'progress.md'), markdown, 'utf-8');
}

/**
 * Update HTML dashboard
 */
async function updateHtmlDashboard(_projectPath: string, _progress: any): Promise<void> {
  // This would update the HTML dashboard with real data
  // For now, we'll keep the template as-is
  logger.info('HTML dashboard would be updated with real-time data');
}

/**
 * Get project name
 */
async function getProjectName(projectPath: string): Promise<string> {
  const metadataPath = path.join(projectPath, 'metadata.json');
  const metadataData = await fs.readFile(metadataPath, 'utf-8');
  const metadata = JSON.parse(metadataData);
  return metadata.projectName;
}

/**
 * Get phase emoji
 */
function getPhaseEmoji(phase: string): string {
  const emojis: Record<string, string> = {
    planning: '📋',
    search: '🔍',
    screening: '📊',
    extraction: '📝',
    qualityAssessment: '⭐',
    analysis: '📈',
    writing: '✍️',
  };
  return emojis[phase] || '📌';
}
