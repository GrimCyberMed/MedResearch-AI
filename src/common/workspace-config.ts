/**
 * Research Workspace Configuration System
 * 
 * Manages global and per-project configuration for research workspaces.
 * Supports hybrid configuration (global defaults + project-specific overrides).
 * 
 * @module workspace-config
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import path from 'path';
import { logger } from './logger.js';

/**
 * Research types supported by the system
 */
export type ResearchType =
  | 'intervention'
  | 'diagnostic'
  | 'prognostic'
  | 'qualitative'
  | 'mixed-methods'
  | 'scoping'
  | 'systematic-review'
  | 'meta-analysis';

/**
 * Template format types
 */
export type TemplateFormat = 'markdown' | 'docx' | 'xlsx' | 'pdf' | 'pptx';

/**
 * Archive strategy options
 */
export type ArchiveStrategy = 'move' | 'compress' | 'both' | 'keep';

/**
 * Backup frequency options
 */
export type BackupFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';

/**
 * Folder structure configuration
 */
export interface FolderStructure {
  citations: boolean;
  data: boolean;
  analysis: boolean;
  figures: boolean;
  tables: boolean;
  documents: boolean;
  exports: boolean;
  logs: boolean;
  customFolders?: string[];
}

/**
 * Naming convention configuration
 */
export interface NamingConvention {
  format: string; // e.g., "[ID]_[Date]_[Title]_[Client]"
  idPrefix: string; // e.g., "SR"
  idPadding: number; // e.g., 3 for SR001
  dateFormat: string; // e.g., "YYYY-MM-DD"
  autoGenerateTitle: boolean;
  maxTitleLength: number;
}

/**
 * Template configuration
 */
export interface TemplateConfig {
  useCustom: boolean;
  customPath: string;
  fallbackToDefault: boolean;
  formats: TemplateFormat[];
  autoLoad: string[]; // Templates to auto-load on project creation
}

/**
 * Zotero sync configuration
 */
export interface ZoteroConfig {
  enabled: boolean;
  autoCreateCollection: boolean;
  syncMode: 'real-time' | 'on-demand' | 'manual';
  createSubCollections: boolean;
  subCollections: string[]; // e.g., ['Included', 'Excluded', 'Duplicates']
}

/**
 * Progress tracking configuration
 */
export interface ProgressConfig {
  enabled: boolean;
  formats: ('json' | 'markdown' | 'html')[];
  autoUpdate: boolean;
  showPercentage: boolean;
  showStatus: boolean;
  metrics: string[];
}

/**
 * Backup configuration
 */
export interface BackupConfig {
  enabled: boolean;
  frequency: BackupFrequency;
  localPath: string;
  createSnapshots: boolean;
  snapshotMilestones: string[]; // e.g., ['search', 'screening', 'extraction']
  retentionDays: number;
}

/**
 * Archive configuration
 */
export interface ArchiveConfig {
  enabled: boolean;
  strategy: ArchiveStrategy;
  archivePath: string;
  compressAfterDays: number;
  readOnly: boolean;
}

/**
 * Telegram notification configuration
 */
export interface TelegramConfig {
  enabled: boolean;
  botToken?: string;
  chatId?: string;
  notifications: string[]; // Event types to notify
  frequency: 'real-time' | 'digest';
}

/**
 * Export configuration
 */
export interface ExportConfig {
  formats: string[]; // e.g., ['revman', 'covidence', 'distillersr', 'prospero']
  autoExport: boolean;
  exportPath: string;
}

/**
 * Research type specific configuration
 */
export interface ResearchTypeConfig {
  type: ResearchType;
  folderStructure: FolderStructure;
  templates: string[];
  requiredFields: string[];
}

/**
 * Global workspace configuration
 */
export interface GlobalWorkspaceConfig {
  version: string;
  defaultResearchType: ResearchType;
  folderStructure: FolderStructure;
  naming: NamingConvention;
  templates: TemplateConfig;
  zotero: ZoteroConfig;
  progress: ProgressConfig;
  backup: BackupConfig;
  archive: ArchiveConfig;
  telegram: TelegramConfig;
  exports: ExportConfig;
  researchTypes: Record<ResearchType, ResearchTypeConfig>;
}

/**
 * Project-specific workspace configuration
 */
export interface ProjectWorkspaceConfig {
  projectId: string;
  projectName: string;
  researchType: ResearchType;
  createdAt: string;
  updatedAt: string;
  client?: {
    firstName: string;
    lastName: string;
  };
  overrides?: Partial<GlobalWorkspaceConfig>;
}

/**
 * Default global configuration
 */
export const DEFAULT_GLOBAL_CONFIG: GlobalWorkspaceConfig = {
  version: '1.0.0',
  defaultResearchType: 'systematic-review',
  
  folderStructure: {
    citations: true,
    data: true,
    analysis: true,
    figures: true,
    tables: true,
    documents: true,
    exports: true,
    logs: true,
    customFolders: [],
  },
  
  naming: {
    format: '[ID]_[Date]_[Title]_[Client]',
    idPrefix: 'SR',
    idPadding: 3,
    dateFormat: 'YYYY-MM-DD',
    autoGenerateTitle: true,
    maxTitleLength: 50,
  },
  
  templates: {
    useCustom: false,
    customPath: './templates/custom',
    fallbackToDefault: true,
    formats: ['markdown', 'docx', 'xlsx', 'pdf'],
    autoLoad: [
      'prisma-checklist',
      'data-extraction',
      'quality-assessment',
      'protocol-template',
      'search-strategy',
    ],
  },
  
  zotero: {
    enabled: true,
    autoCreateCollection: true,
    syncMode: 'real-time',
    createSubCollections: true,
    subCollections: ['Included', 'Excluded', 'Duplicates', 'Full-Text-Review'],
  },
  
  progress: {
    enabled: true,
    formats: ['json', 'markdown', 'html'],
    autoUpdate: true,
    showPercentage: true,
    showStatus: true,
    metrics: [
      'search_progress',
      'screening_progress',
      'extraction_progress',
      'quality_assessment_progress',
      'analysis_status',
      'writing_progress',
    ],
  },
  
  backup: {
    enabled: true,
    frequency: 'hourly',
    localPath: './backups',
    createSnapshots: true,
    snapshotMilestones: [
      'project_created',
      'search_completed',
      'screening_completed',
      'extraction_completed',
      'analysis_completed',
      'manuscript_completed',
    ],
    retentionDays: 30,
  },
  
  archive: {
    enabled: true,
    strategy: 'both',
    archivePath: './research-projects/archive',
    compressAfterDays: 30,
    readOnly: false,
  },
  
  telegram: {
    enabled: false,
    notifications: [
      'project_created',
      'search_completed',
      'screening_milestone',
      'extraction_completed',
      'analysis_completed',
      'figures_generated',
      'backup_completed',
      'project_archived',
      'error',
      'warning',
    ],
    frequency: 'real-time',
  },
  
  exports: {
    formats: ['revman', 'covidence', 'distillersr', 'prospero', 'bibtex'],
    autoExport: false,
    exportPath: './exports',
  },
  
  researchTypes: {
    'intervention': {
      type: 'intervention',
      folderStructure: {
        citations: true,
        data: true,
        analysis: true,
        figures: true,
        tables: true,
        documents: true,
        exports: true,
        logs: true,
        customFolders: ['intervention-details', 'outcome-measures'],
      },
      templates: ['prisma-checklist', 'rob2-tool', 'intervention-extraction'],
      requiredFields: ['population', 'intervention', 'comparator', 'outcome'],
    },
    
    'diagnostic': {
      type: 'diagnostic',
      folderStructure: {
        citations: true,
        data: true,
        analysis: true,
        figures: true,
        tables: true,
        documents: true,
        exports: true,
        logs: true,
        customFolders: ['test-accuracy-data', 'sensitivity-specificity'],
      },
      templates: ['prisma-checklist', 'quadas-2-tool', 'diagnostic-extraction'],
      requiredFields: ['population', 'index_test', 'reference_standard', 'target_condition'],
    },
    
    'prognostic': {
      type: 'prognostic',
      folderStructure: {
        citations: true,
        data: true,
        analysis: true,
        figures: true,
        tables: true,
        documents: true,
        exports: true,
        logs: true,
        customFolders: ['prognostic-factors', 'risk-models'],
      },
      templates: ['prisma-checklist', 'probast-tool', 'prognostic-extraction'],
      requiredFields: ['population', 'prognostic_factors', 'outcomes', 'timing'],
    },
    
    'qualitative': {
      type: 'qualitative',
      folderStructure: {
        citations: true,
        data: true,
        analysis: true,
        figures: true,
        tables: true,
        documents: true,
        exports: true,
        logs: true,
        customFolders: ['themes', 'quotes', 'synthesis'],
      },
      templates: ['prisma-checklist', 'casp-qualitative', 'qualitative-extraction'],
      requiredFields: ['population', 'phenomenon_of_interest', 'context'],
    },
    
    'mixed-methods': {
      type: 'mixed-methods',
      folderStructure: {
        citations: true,
        data: true,
        analysis: true,
        figures: true,
        tables: true,
        documents: true,
        exports: true,
        logs: true,
        customFolders: ['quantitative-data', 'qualitative-data', 'integration'],
      },
      templates: ['prisma-checklist', 'mmat-tool', 'mixed-methods-extraction'],
      requiredFields: ['population', 'intervention', 'outcomes', 'qualitative_component'],
    },
    
    'scoping': {
      type: 'scoping',
      folderStructure: {
        citations: true,
        data: true,
        analysis: true,
        figures: true,
        tables: true,
        documents: true,
        exports: true,
        logs: true,
        customFolders: ['concept-mapping', 'charting'],
      },
      templates: ['prisma-scr-checklist', 'scoping-extraction'],
      requiredFields: ['concept', 'context', 'population'],
    },
    
    'systematic-review': {
      type: 'systematic-review',
      folderStructure: {
        citations: true,
        data: true,
        analysis: true,
        figures: true,
        tables: true,
        documents: true,
        exports: true,
        logs: true,
        customFolders: [],
      },
      templates: ['prisma-checklist', 'rob2-tool', 'data-extraction'],
      requiredFields: ['population', 'intervention', 'comparator', 'outcome'],
    },
    
    'meta-analysis': {
      type: 'meta-analysis',
      folderStructure: {
        citations: true,
        data: true,
        analysis: true,
        figures: true,
        tables: true,
        documents: true,
        exports: true,
        logs: true,
        customFolders: ['statistical-models', 'sensitivity-analysis'],
      },
      templates: ['prisma-checklist', 'rob2-tool', 'meta-analysis-extraction'],
      requiredFields: ['population', 'intervention', 'comparator', 'outcome', 'effect_measure'],
    },
  },
};

/**
 * Configuration manager class
 */
export class WorkspaceConfigManager {
  private globalConfigPath: string;
  private globalConfig: GlobalWorkspaceConfig | null = null;

  constructor(configPath?: string) {
    this.globalConfigPath = configPath || path.join(process.cwd(), 'research-config.json');
  }

  /**
   * Load global configuration
   */
  async loadGlobalConfig(): Promise<GlobalWorkspaceConfig> {
    try {
      const configData = await fs.readFile(this.globalConfigPath, 'utf-8');
      this.globalConfig = JSON.parse(configData);
      logger.info('Global workspace configuration loaded');
      return this.globalConfig!;
    } catch (error) {
      logger.warn('Global config not found, using defaults');
      this.globalConfig = DEFAULT_GLOBAL_CONFIG;
      return this.globalConfig;
    }
  }

  /**
   * Save global configuration
   */
  async saveGlobalConfig(config: GlobalWorkspaceConfig): Promise<void> {
    try {
      await fs.writeFile(
        this.globalConfigPath,
        JSON.stringify(config, null, 2),
        'utf-8'
      );
      this.globalConfig = config;
      logger.info('Global workspace configuration saved');
    } catch (error) {
      logger.error('Failed to save global config:', error);
      throw error;
    }
  }

  /**
   * Get global configuration (load if not cached)
   */
  async getGlobalConfig(): Promise<GlobalWorkspaceConfig> {
    if (!this.globalConfig) {
      return await this.loadGlobalConfig();
    }
    return this.globalConfig;
  }

  /**
   * Load project configuration
   */
  async loadProjectConfig(projectPath: string): Promise<ProjectWorkspaceConfig | null> {
    try {
      const configPath = path.join(projectPath, 'project-config.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      logger.info(`Project configuration loaded for: ${config.projectName}`);
      return config;
    } catch (error) {
      logger.warn('Project config not found');
      return null;
    }
  }

  /**
   * Save project configuration
   */
  async saveProjectConfig(
    projectPath: string,
    config: ProjectWorkspaceConfig
  ): Promise<void> {
    try {
      const configPath = path.join(projectPath, 'project-config.json');
      config.updatedAt = new Date().toISOString();
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
      logger.info(`Project configuration saved for: ${config.projectName}`);
    } catch (error) {
      logger.error('Failed to save project config:', error);
      throw error;
    }
  }

  /**
   * Get merged configuration (global + project overrides)
   */
  async getMergedConfig(
    projectPath: string
  ): Promise<GlobalWorkspaceConfig> {
    const globalConfig = await this.getGlobalConfig();
    const projectConfig = await this.loadProjectConfig(projectPath);

    if (!projectConfig || !projectConfig.overrides) {
      return globalConfig;
    }

    // Deep merge project overrides with global config
    return this.deepMerge(globalConfig, projectConfig.overrides);
  }

  /**
   * Deep merge two objects
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };
    
    for (const key in source) {
      const sourceValue = source[key];
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) && key in target) {
        output[key] = this.deepMerge(target[key] as any, sourceValue as any);
      } else {
        output[key] = sourceValue as any;
      }
    }
    
    return output;
  }

  /**
   * Get research type configuration
   */
  async getResearchTypeConfig(
    researchType: ResearchType
  ): Promise<ResearchTypeConfig> {
    const globalConfig = await this.getGlobalConfig();
    return globalConfig.researchTypes[researchType];
  }

  /**
   * Initialize default global configuration file
   */
  async initializeGlobalConfig(): Promise<void> {
    try {
      // Check if config already exists
      await fs.access(this.globalConfigPath);
      logger.info('Global config already exists');
    } catch {
      // Create default config
      await this.saveGlobalConfig(DEFAULT_GLOBAL_CONFIG);
      logger.info('Default global configuration created');
    }
  }

  /**
   * Validate configuration
   */
  validateConfig(config: GlobalWorkspaceConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate version
    if (!config.version) {
      errors.push('Configuration version is required');
    }

    // Validate naming convention
    if (!config.naming.format) {
      errors.push('Naming format is required');
    }

    // Validate research types
    for (const type in config.researchTypes) {
      const typeConfig = config.researchTypes[type as ResearchType];
      if (!typeConfig.templates || typeConfig.templates.length === 0) {
        errors.push(`Research type '${type}' must have at least one template`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Export singleton instance
 */
export const configManager = new WorkspaceConfigManager();
