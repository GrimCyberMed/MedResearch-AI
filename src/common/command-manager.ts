/**
 * Command Manager for MedResearch AI
 * 
 * Implements Command Pattern for undo/redo and rollback capabilities.
 * Provides operation tracking, validation, and batch rollback support.
 * 
 * Features:
 * - Command pattern for all operations
 * - Undo/redo support
 * - Batch rollback capability
 * - Pre-rollback validation
 * - Operation history tracking
 * - Atomic operations with compensation
 * 
 * @version 3.0.0
 * @since 5.1.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { restorePointManager, RestorePointType } from './restore-point-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Command history directory
const commandsDir = path.join(__dirname, '../../logs/commands');

// Ensure directory exists
if (!fs.existsSync(commandsDir)) {
  fs.mkdirSync(commandsDir, { recursive: true });
}

/**
 * Command interface
 */
export interface Command {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  executor: string;
  params: any;
  result?: any;
  error?: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'undone';
  undoable: boolean;
  restorePointId?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Command execution context
 */
export interface CommandContext {
  userId?: string;
  sessionId?: string;
  phase?: string;
  tags?: string[];
  createRestorePoint?: boolean;
  validateBefore?: boolean;
  [key: string]: any;
}

/**
 * Command executor interface
 */
export interface CommandExecutor {
  execute(params: any, context: CommandContext): Promise<any>;
  undo(params: any, result: any, context: CommandContext): Promise<void>;
  validate?(params: any, context: CommandContext): Promise<boolean>;
  compensate?(params: any, error: Error, context: CommandContext): Promise<void>;
}

/**
 * Rollback result
 */
export interface RollbackResult {
  success: boolean;
  commandsUndone: number;
  errors: Array<{ commandId: string; error: string }>;
  restoredToPoint?: string;
  duration: number;
}

/**
 * Command Manager Class
 */
export class CommandManager {
  private executors: Map<string, CommandExecutor> = new Map();
  private commandHistory: Command[] = [];
  private undoneCommands: Command[] = [];
  private maxHistorySize: number = 1000;
  private currentBatch: Command[] | null = null;

  constructor(maxHistorySize: number = 1000) {
    this.maxHistorySize = maxHistorySize;
    this.loadCommandHistory();
  }

  /**
   * Register a command executor
   */
  registerExecutor(type: string, executor: CommandExecutor): void {
    this.executors.set(type, executor);
    console.log(`✅ Registered command executor: ${type}`);
  }

  /**
   * Execute a command
   */
  async executeCommand(
    type: string,
    params: any,
    context: CommandContext = {}
  ): Promise<any> {
    const executor = this.executors.get(type);

    if (!executor) {
      throw new Error(`No executor registered for command type: ${type}`);
    }

    const command: Command = {
      id: uuidv4(),
      type,
      timestamp: new Date().toISOString(),
      description: context.description || `Execute ${type}`,
      executor: type,
      params,
      status: 'pending',
      undoable: true,
      metadata: context
    };

    const startTime = Date.now();

    try {
      // Create restore point if requested
      if (context.createRestorePoint) {
        const restorePoint = await restorePointManager.createRestorePoint(
          RestorePointType.PRE_OPERATION,
          `Before ${type}`,
          { phase: context.phase, tags: context.tags }
        );
        command.restorePointId = restorePoint.id;
      }

      // Validate before execution
      if (context.validateBefore && executor.validate) {
        const isValid = await executor.validate(params, context);
        if (!isValid) {
          throw new Error('Command validation failed');
        }
      }

      // Execute command
      command.status = 'executing';
      const result = await executor.execute(params, context);

      // Mark as completed
      command.status = 'completed';
      command.result = result;
      command.duration = Date.now() - startTime;

      // Add to history
      this.addToHistory(command);

      // Clear undone commands (can't redo after new command)
      this.undoneCommands = [];

      console.log(`✅ Command executed: ${command.id} (${command.duration}ms)`);

      return result;
    } catch (error) {
      command.status = 'failed';
      command.error = error instanceof Error ? error.message : String(error);
      command.duration = Date.now() - startTime;

      // Add to history even if failed
      this.addToHistory(command);

      // Try compensation if available
      if (executor.compensate) {
        try {
          await executor.compensate(params, error as Error, context);
          console.log(`✅ Command compensated: ${command.id}`);
        } catch (compensationError) {
          console.error(`❌ Compensation failed:`, compensationError);
        }
      }

      throw error;
    }
  }

  /**
   * Undo last command
   */
  async undo(): Promise<void> {
    if (this.commandHistory.length === 0) {
      throw new Error('No commands to undo');
    }

    const command = this.commandHistory[this.commandHistory.length - 1];

    if (!command.undoable) {
      throw new Error(`Command ${command.id} is not undoable`);
    }

    if (command.status !== 'completed') {
      throw new Error(`Cannot undo command with status: ${command.status}`);
    }

    const executor = this.executors.get(command.type);

    if (!executor) {
      throw new Error(`No executor found for command type: ${command.type}`);
    }

    try {
      await executor.undo(command.params, command.result, command.metadata || {});

      command.status = 'undone';
      this.commandHistory.pop();
      this.undoneCommands.push(command);

      console.log(`✅ Command undone: ${command.id}`);
    } catch (error) {
      console.error(`❌ Failed to undo command ${command.id}:`, error);
      throw error;
    }
  }

  /**
   * Redo last undone command
   */
  async redo(): Promise<any> {
    if (this.undoneCommands.length === 0) {
      throw new Error('No commands to redo');
    }

    const command = this.undoneCommands.pop()!;
    const executor = this.executors.get(command.type);

    if (!executor) {
      throw new Error(`No executor found for command type: ${command.type}`);
    }

    try {
      const result = await executor.execute(command.params, command.metadata || {});

      command.status = 'completed';
      command.result = result;
      this.commandHistory.push(command);

      console.log(`✅ Command redone: ${command.id}`);

      return result;
    } catch (error) {
      console.error(`❌ Failed to redo command ${command.id}:`, error);
      throw error;
    }
  }

  /**
   * Rollback to a specific point in time
   */
  async rollbackToTimestamp(timestamp: string): Promise<RollbackResult> {
    const startTime = Date.now();
    const targetTime = new Date(timestamp).getTime();
    const errors: Array<{ commandId: string; error: string }> = [];

    // Find commands to undo
    const commandsToUndo = this.commandHistory.filter(
      cmd => new Date(cmd.timestamp).getTime() > targetTime && cmd.status === 'completed'
    ).reverse();

    console.log(`🔄 Rolling back ${commandsToUndo.length} commands...`);

    let commandsUndone = 0;

    for (const command of commandsToUndo) {
      try {
        const executor = this.executors.get(command.type);

        if (!executor) {
          errors.push({
            commandId: command.id,
            error: `No executor found for type: ${command.type}`
          });
          continue;
        }

        if (!command.undoable) {
          errors.push({
            commandId: command.id,
            error: 'Command is not undoable'
          });
          continue;
        }

        await executor.undo(command.params, command.result, command.metadata || {});
        command.status = 'undone';
        commandsUndone++;
      } catch (error) {
        errors.push({
          commandId: command.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Remove undone commands from history
    this.commandHistory = this.commandHistory.filter(
      cmd => new Date(cmd.timestamp).getTime() <= targetTime
    );

    const duration = Date.now() - startTime;

    return {
      success: errors.length === 0,
      commandsUndone,
      errors,
      duration
    };
  }

  /**
   * Rollback to a specific command
   */
  async rollbackToCommand(commandId: string): Promise<RollbackResult> {
    const command = this.commandHistory.find(cmd => cmd.id === commandId);

    if (!command) {
      throw new Error(`Command not found: ${commandId}`);
    }

    return this.rollbackToTimestamp(command.timestamp);
  }

  /**
   * Rollback using restore point
   */
  async rollbackToRestorePoint(restorePointId: string): Promise<RollbackResult> {
    const startTime = Date.now();

    try {
      // Restore from restore point
      await restorePointManager.restore(restorePointId);

      // Clear command history after restore point
      const restorePoint = await restorePointManager.listRestorePoints();
      const point = restorePoint.find(rp => rp.id === restorePointId);

      if (point) {
        this.commandHistory = this.commandHistory.filter(
          cmd => new Date(cmd.timestamp).getTime() <= new Date(point.timestamp).getTime()
        );
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        commandsUndone: 0,
        errors: [],
        restoredToPoint: restorePointId,
        duration
      };
    } catch (error) {
      throw new Error(`Failed to rollback to restore point: ${error}`);
    }
  }

  /**
   * Batch command execution
   */
  async executeBatch(
    commands: Array<{ type: string; params: any }>,
    context: CommandContext = {}
  ): Promise<any[]> {
    this.currentBatch = [];
    const results: any[] = [];

    try {
      // Create restore point before batch
      if (context.createRestorePoint) {
        await restorePointManager.createRestorePoint(
          RestorePointType.PRE_OPERATION,
          'Before batch execution',
          { phase: context.phase, tags: context.tags }
        );
      }

      // Execute all commands
      for (const cmd of commands) {
        const result = await this.executeCommand(cmd.type, cmd.params, {
          ...context,
          createRestorePoint: false // Don't create individual restore points
        });
        results.push(result);
      }

      this.currentBatch = null;
      return results;
    } catch (error) {
      // Rollback batch on error
      console.error('❌ Batch execution failed, rolling back...');

      if (this.currentBatch) {
        for (const command of this.currentBatch.reverse()) {
          try {
            const executor = this.executors.get(command.type);
            if (executor && command.undoable) {
              await executor.undo(command.params, command.result, command.metadata || {});
            }
          } catch (undoError) {
            console.error(`Failed to undo command ${command.id}:`, undoError);
          }
        }
      }

      this.currentBatch = null;
      throw error;
    }
  }

  /**
   * Get command history
   */
  getHistory(limit?: number): Command[] {
    const history = [...this.commandHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get command by ID
   */
  getCommand(commandId: string): Command | undefined {
    return this.commandHistory.find(cmd => cmd.id === commandId);
  }

  /**
   * Get commands by type
   */
  getCommandsByType(type: string): Command[] {
    return this.commandHistory.filter(cmd => cmd.type === type);
  }

  /**
   * Get commands by time range
   */
  getCommandsByTimeRange(startTime: string, endTime: string): Command[] {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    return this.commandHistory.filter(cmd => {
      const cmdTime = new Date(cmd.timestamp).getTime();
      return cmdTime >= start && cmdTime <= end;
    });
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.commandHistory = [];
    this.undoneCommands = [];
    console.log('✅ Command history cleared');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalCommands: number;
    completedCommands: number;
    failedCommands: number;
    undoneCommands: number;
    averageDuration: number;
    commandsByType: Record<string, number>;
  } {
    const completed = this.commandHistory.filter(cmd => cmd.status === 'completed');
    const failed = this.commandHistory.filter(cmd => cmd.status === 'failed');
    const undone = this.commandHistory.filter(cmd => cmd.status === 'undone');

    const durations = this.commandHistory
      .filter(cmd => cmd.duration !== undefined)
      .map(cmd => cmd.duration!);

    const averageDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const commandsByType: Record<string, number> = {};
    for (const cmd of this.commandHistory) {
      commandsByType[cmd.type] = (commandsByType[cmd.type] || 0) + 1;
    }

    return {
      totalCommands: this.commandHistory.length,
      completedCommands: completed.length,
      failedCommands: failed.length,
      undoneCommands: undone.length,
      averageDuration: Math.round(averageDuration),
      commandsByType
    };
  }

  /**
   * Add command to history
   */
  private addToHistory(command: Command): void {
    this.commandHistory.push(command);

    // Add to current batch if in batch mode
    if (this.currentBatch) {
      this.currentBatch.push(command);
    }

    // Trim history if too large
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }

    // Save to disk
    this.saveCommandHistory();
  }

  /**
   * Save command history to disk
   */
  private saveCommandHistory(): void {
    try {
      const historyFile = path.join(commandsDir, 'command-history.json');
      const data = {
        timestamp: new Date().toISOString(),
        commands: this.commandHistory.slice(-100) // Save last 100 commands
      };

      fs.writeFileSync(historyFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save command history:', error);
    }
  }

  /**
   * Load command history from disk
   */
  private loadCommandHistory(): void {
    try {
      const historyFile = path.join(commandsDir, 'command-history.json');

      if (fs.existsSync(historyFile)) {
        const data = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
        this.commandHistory = data.commands || [];
        console.log(`✅ Loaded ${this.commandHistory.length} commands from history`);
      }
    } catch (error) {
      console.error('Failed to load command history:', error);
      this.commandHistory = [];
    }
  }

  /**
   * Export command history
   */
  exportHistory(outputPath?: string): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      statistics: this.getStatistics(),
      commands: this.commandHistory,
      undoneCommands: this.undoneCommands
    };

    const exportPath = outputPath || path.join(
      commandsDir,
      `command-history-export-${Date.now()}.json`
    );

    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log(`✅ Command history exported to ${exportPath}`);
    return exportPath;
  }
}

// Export singleton instance
export const commandManager = new CommandManager();

export default commandManager;
