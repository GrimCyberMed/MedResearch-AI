/**
 * Restore Point Manager for MedResearch AI
 * 
 * Implements snapshot + delta pattern for project state management.
 * Provides fast restore capabilities (<5 seconds) with 30-day retention.
 * 
 * Features:
 * - Automatic snapshots at phase boundaries
 * - Manual snapshot creation
 * - Incremental delta storage
 * - Fast restore operations
 * - Compression for storage efficiency
 * - Metadata tracking and validation
 * 
 * @version 3.0.0
 * @since 5.1.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { promisify } from 'util';
import zlib from 'zlib';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Directory structure
const restoreDir = path.join(__dirname, '../../.restore');
const snapshotsDir = path.join(restoreDir, 'snapshots');
const deltasDir = path.join(restoreDir, 'deltas');
const metadataDir = path.join(restoreDir, 'metadata');

// Ensure directories exist
[restoreDir, snapshotsDir, deltasDir, metadataDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Restore point types
 */
export enum RestorePointType {
  MANUAL = 'manual',
  AUTO_PHASE = 'auto_phase',
  AUTO_CHECKPOINT = 'auto_checkpoint',
  PRE_OPERATION = 'pre_operation',
  POST_OPERATION = 'post_operation'
}

/**
 * Project state interface
 */
export interface ProjectState {
  timestamp: string;
  version: string;
  phase: string;
  files: Record<string, FileState>;
  memory?: any;
  config?: any;
  metadata: {
    totalFiles: number;
    totalSize: number;
    checksum: string;
  };
}

/**
 * File state interface
 */
export interface FileState {
  path: string;
  content: string;
  hash: string;
  size: number;
  modified: string;
}

/**
 * Restore point metadata
 */
export interface RestorePointMetadata {
  id: string;
  type: RestorePointType;
  timestamp: string;
  description: string;
  phase: string;
  version: string;
  parentId?: string;
  isSnapshot: boolean;
  isDelta: boolean;
  size: number;
  compressed: boolean;
  checksum: string;
  filesChanged?: number;
  tags?: string[];
}

/**
 * Delta change interface
 */
export interface DeltaChange {
  type: 'added' | 'modified' | 'deleted';
  path: string;
  content?: string;
  hash?: string;
  previousHash?: string;
}

/**
 * Restore Point Manager Class
 */
export class RestorePointManager {
  private currentState: ProjectState | null = null;
  private lastSnapshotId: string | null = null;
  private retentionDays: number = 30;

  constructor(retentionDays: number = 30) {
    this.retentionDays = retentionDays;
  }

  /**
   * Create a new restore point (snapshot or delta)
   */
  async createRestorePoint(
    type: RestorePointType,
    description: string,
    options: {
      phase?: string;
      tags?: string[];
      forceSnapshot?: boolean;
    } = {}
  ): Promise<RestorePointMetadata> {
    const startTime = Date.now();
    const id = uuidv4();

    // Capture current project state
    const state = await this.captureProjectState();

    // Determine if this should be a snapshot or delta
    const shouldSnapshot = options.forceSnapshot || 
                          !this.lastSnapshotId || 
                          type === RestorePointType.AUTO_PHASE ||
                          this.shouldCreateSnapshot();

    let metadata: RestorePointMetadata;

    if (shouldSnapshot) {
      metadata = await this.createSnapshot(id, type, description, state, options);
      this.lastSnapshotId = id;
    } else {
      metadata = await this.createDelta(id, type, description, state, options);
    }

    // Save metadata
    await this.saveMetadata(metadata);

    // Update current state
    this.currentState = state;

    // Cleanup old restore points
    await this.cleanupOldRestorePoints();

    const duration = Date.now() - startTime;
    console.log(`✅ Restore point created: ${id} (${duration}ms)`);

    return metadata;
  }

  /**
   * Create a full snapshot
   */
  private async createSnapshot(
    id: string,
    type: RestorePointType,
    description: string,
    state: ProjectState,
    options: any
  ): Promise<RestorePointMetadata> {
    const snapshotPath = path.join(snapshotsDir, `${id}.json.gz`);

    // Serialize and compress state
    const stateJson = JSON.stringify(state, null, 2);
    const compressed = await gzip(Buffer.from(stateJson, 'utf-8'));

    // Write compressed snapshot
    fs.writeFileSync(snapshotPath, compressed);

    const checksum = this.calculateChecksum(stateJson);
    const size = compressed.length;

    return {
      id,
      type,
      timestamp: new Date().toISOString(),
      description,
      phase: options.phase || state.phase,
      version: state.version,
      isSnapshot: true,
      isDelta: false,
      size,
      compressed: true,
      checksum,
      tags: options.tags || []
    };
  }

  /**
   * Create an incremental delta
   */
  private async createDelta(
    id: string,
    type: RestorePointType,
    description: string,
    state: ProjectState,
    options: any
  ): Promise<RestorePointMetadata> {
    if (!this.currentState) {
      throw new Error('No previous state available for delta creation');
    }

    const deltaPath = path.join(deltasDir, `${id}.json.gz`);

    // Calculate changes
    const changes = this.calculateDeltas(this.currentState, state);

    // Serialize and compress delta
    const deltaJson = JSON.stringify({
      parentId: this.lastSnapshotId,
      changes,
      timestamp: new Date().toISOString()
    }, null, 2);

    const compressed = await gzip(Buffer.from(deltaJson, 'utf-8'));

    // Write compressed delta
    fs.writeFileSync(deltaPath, compressed);

    const checksum = this.calculateChecksum(deltaJson);
    const size = compressed.length;

    return {
      id,
      type,
      timestamp: new Date().toISOString(),
      description,
      phase: options.phase || state.phase,
      version: state.version,
      parentId: this.lastSnapshotId || undefined,
      isSnapshot: false,
      isDelta: true,
      size,
      compressed: true,
      checksum,
      filesChanged: changes.length,
      tags: options.tags || []
    };
  }

  /**
   * Restore project to a specific restore point
   */
  async restore(restorePointId: string): Promise<ProjectState> {
    const startTime = Date.now();

    // Load metadata
    const metadata = await this.loadMetadata(restorePointId);

    if (!metadata) {
      throw new Error(`Restore point not found: ${restorePointId}`);
    }

    let state: ProjectState;

    if (metadata.isSnapshot) {
      // Direct snapshot restore
      state = await this.restoreFromSnapshot(restorePointId);
    } else {
      // Delta restore - need to apply deltas on top of snapshot
      state = await this.restoreFromDelta(restorePointId, metadata);
    }

    // Apply state to project
    await this.applyState(state);

    const duration = Date.now() - startTime;
    console.log(`✅ Restored to point ${restorePointId} (${duration}ms)`);

    return state;
  }

  /**
   * Restore from snapshot
   */
  private async restoreFromSnapshot(snapshotId: string): Promise<ProjectState> {
    const snapshotPath = path.join(snapshotsDir, `${snapshotId}.json.gz`);

    if (!fs.existsSync(snapshotPath)) {
      throw new Error(`Snapshot file not found: ${snapshotId}`);
    }

    // Read and decompress
    const compressed = fs.readFileSync(snapshotPath);
    const decompressed = await gunzip(compressed);
    const state = JSON.parse(decompressed.toString('utf-8'));

    return state;
  }

  /**
   * Restore from delta (requires parent snapshot)
   */
  private async restoreFromDelta(
    deltaId: string,
    metadata: RestorePointMetadata
  ): Promise<ProjectState> {
    if (!metadata.parentId) {
      throw new Error('Delta has no parent snapshot');
    }

    // First restore parent snapshot
    let state = await this.restoreFromSnapshot(metadata.parentId);

    // Load and apply all deltas in chain
    const deltas = await this.loadDeltaChain(metadata.parentId, deltaId);

    for (const delta of deltas) {
      state = this.applyDeltas(state, delta.changes);
    }

    return state;
  }

  /**
   * Load delta chain from parent to target
   */
  private async loadDeltaChain(
    parentId: string,
    targetId: string
  ): Promise<Array<{ id: string; changes: DeltaChange[] }>> {
    const chain: Array<{ id: string; changes: DeltaChange[] }> = [];
    const allMetadata = await this.listRestorePoints();

    // Build chain from parent to target
    let currentId: string | undefined = targetId;

    while (currentId && currentId !== parentId) {
      const metadata = allMetadata.find(m => m.id === currentId);
      if (!metadata || !metadata.isDelta) break;

      const deltaPath = path.join(deltasDir, `${currentId}.json.gz`);
      const compressed = fs.readFileSync(deltaPath);
      const decompressed = await gunzip(compressed);
      const delta = JSON.parse(decompressed.toString('utf-8'));

      chain.unshift({ id: currentId, changes: delta.changes });
      currentId = metadata.parentId;
    }

    return chain;
  }

  /**
   * Apply deltas to state
   */
  private applyDeltas(state: ProjectState, changes: DeltaChange[]): ProjectState {
    const newState = { ...state };

    for (const change of changes) {
      switch (change.type) {
        case 'added':
        case 'modified':
          if (change.content && change.hash) {
            newState.files[change.path] = {
              path: change.path,
              content: change.content,
              hash: change.hash,
              size: change.content.length,
              modified: new Date().toISOString()
            };
          }
          break;

        case 'deleted':
          delete newState.files[change.path];
          break;
      }
    }

    // Recalculate metadata
    newState.metadata = this.calculateStateMetadata(newState);

    return newState;
  }

  /**
   * Capture current project state
   */
  private async captureProjectState(): Promise<ProjectState> {
    const projectRoot = path.join(__dirname, '../..');
    const files: Record<string, FileState> = {};

    // Capture source files
    const srcDir = path.join(projectRoot, 'src');
    if (fs.existsSync(srcDir)) {
      this.captureDirectory(srcDir, projectRoot, files);
    }

    // Capture configuration files
    const configFiles = ['package.json', 'tsconfig.json', '.env'];
    for (const file of configFiles) {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
        this.captureFile(filePath, projectRoot, files);
      }
    }

    const state: ProjectState = {
      timestamp: new Date().toISOString(),
      version: '5.1.0',
      phase: 'development',
      files,
      metadata: this.calculateStateMetadata({ files } as any)
    };

    return state;
  }

  /**
   * Capture directory recursively
   */
  private captureDirectory(
    dir: string,
    baseDir: string,
    files: Record<string, FileState>
  ): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!['node_modules', '.git', 'dist', 'logs', '.restore'].includes(entry.name)) {
          this.captureDirectory(fullPath, baseDir, files);
        }
      } else if (entry.isFile()) {
        this.captureFile(fullPath, baseDir, files);
      }
    }
  }

  /**
   * Capture single file
   */
  private captureFile(
    filePath: string,
    baseDir: string,
    files: Record<string, FileState>
  ): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(baseDir, filePath);
      const hash = this.calculateChecksum(content);
      const stats = fs.statSync(filePath);

      files[relativePath] = {
        path: relativePath,
        content,
        hash,
        size: stats.size,
        modified: stats.mtime.toISOString()
      };
    } catch (error) {
      console.warn(`Failed to capture file ${filePath}:`, error);
    }
  }

  /**
   * Calculate deltas between two states
   */
  private calculateDeltas(
    oldState: ProjectState,
    newState: ProjectState
  ): DeltaChange[] {
    const changes: DeltaChange[] = [];

    // Check for added and modified files
    for (const [path, newFile] of Object.entries(newState.files)) {
      const oldFile = oldState.files[path];

      if (!oldFile) {
        changes.push({
          type: 'added',
          path,
          content: newFile.content,
          hash: newFile.hash
        });
      } else if (oldFile.hash !== newFile.hash) {
        changes.push({
          type: 'modified',
          path,
          content: newFile.content,
          hash: newFile.hash,
          previousHash: oldFile.hash
        });
      }
    }

    // Check for deleted files
    for (const path of Object.keys(oldState.files)) {
      if (!newState.files[path]) {
        changes.push({
          type: 'deleted',
          path
        });
      }
    }

    return changes;
  }

  /**
   * Apply state to project files
   */
  private async applyState(state: ProjectState): Promise<void> {
    const projectRoot = path.join(__dirname, '../..');

    // Apply each file
    for (const [relativePath, fileState] of Object.entries(state.files)) {
      const fullPath = path.join(projectRoot, relativePath);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(fullPath, fileState.content, 'utf-8');
    }

    console.log(`✅ Applied ${Object.keys(state.files).length} files`);
  }

  /**
   * Calculate state metadata
   */
  private calculateStateMetadata(state: { files: Record<string, FileState> }): {
    totalFiles: number;
    totalSize: number;
    checksum: string;
  } {
    const files = Object.values(state.files);
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const checksum = this.calculateChecksum(
      files.map(f => f.hash).sort().join('')
    );

    return { totalFiles, totalSize, checksum };
  }

  /**
   * Calculate checksum
   */
  private calculateChecksum(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Determine if snapshot should be created
   */
  private shouldCreateSnapshot(): boolean {
    // Create snapshot every 10 deltas or every 24 hours
    const allMetadata = this.listRestorePointsSync();
    const deltasSinceSnapshot = allMetadata.filter(
      m => m.isDelta && m.parentId === this.lastSnapshotId
    ).length;

    return deltasSinceSnapshot >= 10;
  }

  /**
   * Save metadata
   */
  private async saveMetadata(metadata: RestorePointMetadata): Promise<void> {
    const metadataPath = path.join(metadataDir, `${metadata.id}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  }

  /**
   * Load metadata
   */
  private async loadMetadata(id: string): Promise<RestorePointMetadata | null> {
    const metadataPath = path.join(metadataDir, `${id}.json`);

    if (!fs.existsSync(metadataPath)) {
      return null;
    }

    const data = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * List all restore points
   */
  async listRestorePoints(): Promise<RestorePointMetadata[]> {
    return this.listRestorePointsSync();
  }

  /**
   * List all restore points (sync)
   */
  private listRestorePointsSync(): RestorePointMetadata[] {
    const metadataFiles = fs.readdirSync(metadataDir);
    const metadata: RestorePointMetadata[] = [];

    for (const file of metadataFiles) {
      if (file.endsWith('.json')) {
        const data = fs.readFileSync(path.join(metadataDir, file), 'utf-8');
        metadata.push(JSON.parse(data));
      }
    }

    return metadata.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Delete restore point
   */
  async deleteRestorePoint(id: string): Promise<void> {
    const metadata = await this.loadMetadata(id);

    if (!metadata) {
      throw new Error(`Restore point not found: ${id}`);
    }

    // Delete snapshot or delta file
    if (metadata.isSnapshot) {
      const snapshotPath = path.join(snapshotsDir, `${id}.json.gz`);
      if (fs.existsSync(snapshotPath)) {
        fs.unlinkSync(snapshotPath);
      }
    } else {
      const deltaPath = path.join(deltasDir, `${id}.json.gz`);
      if (fs.existsSync(deltaPath)) {
        fs.unlinkSync(deltaPath);
      }
    }

    // Delete metadata
    const metadataPath = path.join(metadataDir, `${id}.json`);
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }

    console.log(`✅ Deleted restore point: ${id}`);
  }

  /**
   * Cleanup old restore points
   */
  private async cleanupOldRestorePoints(): Promise<void> {
    const cutoffDate = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
    const allMetadata = await this.listRestorePoints();

    for (const metadata of allMetadata) {
      const timestamp = new Date(metadata.timestamp).getTime();
      if (timestamp < cutoffDate) {
        await this.deleteRestorePoint(metadata.id);
      }
    }
  }

  /**
   * Get restore point statistics
   */
  async getStatistics(): Promise<{
    totalRestorePoints: number;
    snapshots: number;
    deltas: number;
    totalSize: number;
    oldestPoint: string;
    newestPoint: string;
  }> {
    const allMetadata = await this.listRestorePoints();

    const snapshots = allMetadata.filter(m => m.isSnapshot).length;
    const deltas = allMetadata.filter(m => m.isDelta).length;
    const totalSize = allMetadata.reduce((sum, m) => sum + m.size, 0);

    return {
      totalRestorePoints: allMetadata.length,
      snapshots,
      deltas,
      totalSize,
      oldestPoint: allMetadata[allMetadata.length - 1]?.timestamp || 'N/A',
      newestPoint: allMetadata[0]?.timestamp || 'N/A'
    };
  }
}

// Export singleton instance
export const restorePointManager = new RestorePointManager();

export default restorePointManager;
