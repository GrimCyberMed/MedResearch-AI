/**
 * Telegram Notification System
 * 
 * Sends real-time notifications to Telegram for research project events.
 * Supports rich formatting, error handling, and rate limiting.
 * 
 * @module telegram-notifier
 * @version 1.0.0
 */

import https from 'https';
import { logger } from './logger.js';

/**
 * Notification event types
 */
export type NotificationEvent =
  | 'project_created'
  | 'search_completed'
  | 'screening_milestone'
  | 'extraction_completed'
  | 'analysis_completed'
  | 'figures_generated'
  | 'backup_completed'
  | 'project_archived'
  | 'error'
  | 'warning'
  | 'info'
  | 'success';

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Notification message interface
 */
export interface TelegramNotification {
  event: NotificationEvent;
  title: string;
  message: string;
  priority?: NotificationPriority;
  data?: Record<string, any>;
  timestamp?: string;
}

/**
 * Telegram API response
 */
interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
  error_code?: number;
}

/**
 * Telegram Notifier Class
 */
export class TelegramNotifier {
  private botToken: string;
  private chatId: string;
  private enabled: boolean;
  private rateLimitDelay: number = 1000; // 1 second between messages
  private lastMessageTime: number = 0;

  constructor(botToken?: string, chatId?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = chatId || process.env.TELEGRAM_CHAT_ID || '';
    this.enabled = !!(this.botToken && this.chatId);

    if (!this.enabled) {
      logger.warn('Telegram notifications disabled: Missing bot token or chat ID');
    }
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send a notification
   */
  async notify(notification: TelegramNotification): Promise<boolean> {
    if (!this.enabled) {
      logger.debug('Telegram notification skipped (disabled):', notification.title);
      return false;
    }

    try {
      // Rate limiting
      await this.enforceRateLimit();

      // Format message
      const formattedMessage = this.formatMessage(notification);

      // Send to Telegram
      const success = await this.sendMessage(formattedMessage);

      if (success) {
        logger.info(`Telegram notification sent: ${notification.title}`);
      }

      return success;
    } catch (error) {
      logger.error('Failed to send Telegram notification:', error);
      return false;
    }
  }

  /**
   * Send project created notification
   */
  async notifyProjectCreated(
    projectName: string,
    researchType: string,
    projectId: string
  ): Promise<boolean> {
    return this.notify({
      event: 'project_created',
      title: '🎉 New Research Project Created',
      message: `**Project**: ${projectName}\n**Type**: ${researchType}\n**ID**: ${projectId}`,
      priority: 'medium',
      data: { projectName, researchType, projectId },
    });
  }

  /**
   * Send search completed notification
   */
  async notifySearchCompleted(
    projectName: string,
    totalResults: number,
    databases: string[]
  ): Promise<boolean> {
    return this.notify({
      event: 'search_completed',
      title: '🔍 Literature Search Completed',
      message: `**Project**: ${projectName}\n**Results**: ${totalResults} citations\n**Databases**: ${databases.join(', ')}`,
      priority: 'high',
      data: { projectName, totalResults, databases },
    });
  }

  /**
   * Send screening milestone notification
   */
  async notifyScreeningMilestone(
    projectName: string,
    screened: number,
    total: number,
    percentage: number
  ): Promise<boolean> {
    const emoji = percentage >= 100 ? '✅' : percentage >= 75 ? '📊' : percentage >= 50 ? '📈' : '📉';
    
    return this.notify({
      event: 'screening_milestone',
      title: `${emoji} Screening Progress: ${percentage}%`,
      message: `**Project**: ${projectName}\n**Progress**: ${screened}/${total} citations screened`,
      priority: percentage >= 100 ? 'high' : 'medium',
      data: { projectName, screened, total, percentage },
    });
  }

  /**
   * Send extraction completed notification
   */
  async notifyExtractionCompleted(
    projectName: string,
    studiesExtracted: number
  ): Promise<boolean> {
    return this.notify({
      event: 'extraction_completed',
      title: '📝 Data Extraction Completed',
      message: `**Project**: ${projectName}\n**Studies**: ${studiesExtracted} studies extracted`,
      priority: 'high',
      data: { projectName, studiesExtracted },
    });
  }

  /**
   * Send analysis completed notification
   */
  async notifyAnalysisCompleted(
    projectName: string,
    analysisType: string,
    results: string
  ): Promise<boolean> {
    return this.notify({
      event: 'analysis_completed',
      title: '📈 Analysis Completed',
      message: `**Project**: ${projectName}\n**Type**: ${analysisType}\n**Results**: ${results}`,
      priority: 'high',
      data: { projectName, analysisType, results },
    });
  }

  /**
   * Send figures generated notification
   */
  async notifyFiguresGenerated(
    projectName: string,
    figureTypes: string[],
    count: number
  ): Promise<boolean> {
    return this.notify({
      event: 'figures_generated',
      title: '📊 Figures Generated',
      message: `**Project**: ${projectName}\n**Figures**: ${count} generated\n**Types**: ${figureTypes.join(', ')}`,
      priority: 'medium',
      data: { projectName, figureTypes, count },
    });
  }

  /**
   * Send backup completed notification
   */
  async notifyBackupCompleted(
    projectName: string,
    backupType: string,
    backupPath: string
  ): Promise<boolean> {
    return this.notify({
      event: 'backup_completed',
      title: '💾 Backup Completed',
      message: `**Project**: ${projectName}\n**Type**: ${backupType}\n**Location**: ${backupPath}`,
      priority: 'low',
      data: { projectName, backupType, backupPath },
    });
  }

  /**
   * Send project archived notification
   */
  async notifyProjectArchived(
    projectName: string,
    archivePath: string
  ): Promise<boolean> {
    return this.notify({
      event: 'project_archived',
      title: '📦 Project Archived',
      message: `**Project**: ${projectName}\n**Location**: ${archivePath}`,
      priority: 'medium',
      data: { projectName, archivePath },
    });
  }

  /**
   * Send error notification
   */
  async notifyError(
    projectName: string,
    errorMessage: string,
    errorDetails?: string
  ): Promise<boolean> {
    return this.notify({
      event: 'error',
      title: '❌ Error Occurred',
      message: `**Project**: ${projectName}\n**Error**: ${errorMessage}${errorDetails ? `\n**Details**: ${errorDetails}` : ''}`,
      priority: 'critical',
      data: { projectName, errorMessage, errorDetails },
    });
  }

  /**
   * Send warning notification
   */
  async notifyWarning(
    projectName: string,
    warningMessage: string
  ): Promise<boolean> {
    return this.notify({
      event: 'warning',
      title: '⚠️ Warning',
      message: `**Project**: ${projectName}\n**Warning**: ${warningMessage}`,
      priority: 'medium',
      data: { projectName, warningMessage },
    });
  }

  /**
   * Send info notification
   */
  async notifyInfo(
    projectName: string,
    infoMessage: string
  ): Promise<boolean> {
    return this.notify({
      event: 'info',
      title: 'ℹ️ Information',
      message: `**Project**: ${projectName}\n${infoMessage}`,
      priority: 'low',
      data: { projectName, infoMessage },
    });
  }

  /**
   * Send success notification
   */
  async notifySuccess(
    projectName: string,
    successMessage: string
  ): Promise<boolean> {
    return this.notify({
      event: 'success',
      title: '✅ Success',
      message: `**Project**: ${projectName}\n${successMessage}`,
      priority: 'medium',
      data: { projectName, successMessage },
    });
  }

  /**
   * Format notification message
   */
  private formatMessage(notification: TelegramNotification): string {
    const timestamp = notification.timestamp || new Date().toLocaleString();
    const priorityEmoji = this.getPriorityEmoji(notification.priority || 'medium');
    
    let message = `${notification.title}\n\n`;
    message += notification.message;
    message += `\n\n${priorityEmoji} Priority: ${notification.priority || 'medium'}`;
    message += `\n🕐 ${timestamp}`;
    
    return message;
  }

  /**
   * Get emoji for priority level
   */
  private getPriorityEmoji(priority: NotificationPriority): string {
    const emojis: Record<NotificationPriority, string> = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    };
    return emojis[priority];
  }

  /**
   * Enforce rate limiting
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastMessage = now - this.lastMessageTime;
    
    if (timeSinceLastMessage < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastMessage;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastMessageTime = Date.now();
  }

  /**
   * Send message to Telegram API
   */
  private async sendMessage(text: string): Promise<boolean> {
    return new Promise((resolve) => {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const data = JSON.stringify({
        chat_id: this.chatId,
        text: text,
        parse_mode: 'Markdown',
      });

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      };

      const req = https.request(url, options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const response: TelegramResponse = JSON.parse(responseData);
            
            if (response.ok) {
              resolve(true);
            } else {
              logger.error('Telegram API error:', response.description);
              resolve(false);
            }
          } catch (error) {
            logger.error('Failed to parse Telegram response:', error);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        logger.error('Telegram request error:', error);
        resolve(false);
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.enabled) {
      logger.warn('Cannot test connection: Telegram notifications disabled');
      return false;
    }

    try {
      const success = await this.sendMessage(
        '🤖 **MedResearch AI**\n\nTelegram notifications are working correctly!\n\n✅ Connection test successful'
      );
      
      if (success) {
        logger.info('Telegram connection test successful');
      } else {
        logger.error('Telegram connection test failed');
      }
      
      return success;
    } catch (error) {
      logger.error('Telegram connection test error:', error);
      return false;
    }
  }
}

/**
 * Export singleton instance
 */
export const telegramNotifier = new TelegramNotifier();

/**
 * Helper function to send quick notifications
 */
export async function sendTelegramNotification(
  title: string,
  message: string,
  event: NotificationEvent = 'info',
  priority: NotificationPriority = 'medium'
): Promise<boolean> {
  return telegramNotifier.notify({
    event,
    title,
    message,
    priority,
  });
}
