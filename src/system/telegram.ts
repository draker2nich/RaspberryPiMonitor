import { exec } from 'child_process';
import { promisify } from 'util';
import config from '../config';
import logger from '../utils/logger';
import { PUBLISH } from '../mqtt/topics';
import mqttClient from '../mqtt/client';

const execAsync = promisify(exec);

// Telegram bot status interface
export interface TelegramBotStatus {
  name: string;
  status: 'running' | 'stopped';
  lastStatusChange: number;
}

// Get status of all Telegram bots
export async function getTelegramBotsStatus(): Promise<TelegramBotStatus[]> {
  const botsStatus: TelegramBotStatus[] = [];
  
  for (const bot of config.telegram.bots) {
    try {
      // Check if the bot process is running
      const { stdout } = await execAsync(`pgrep -f ${bot.processName}`);
      
      // If stdout is not empty, process is running
      const isRunning = stdout.trim() !== '';
      
      botsStatus.push({
        name: bot.name,
        status: isRunning ? 'running' : 'stopped',
        lastStatusChange: Date.now(), // Ideally, we'd store this in a persistent way
      });
    } catch (error) {
      // pgrep returns non-zero exit code if process not found
      botsStatus.push({
        name: bot.name,
        status: 'stopped',
        lastStatusChange: Date.now(),
      });
    }
  }
  
  return botsStatus;
}

// Publish Telegram bots status to MQTT
export async function publishTelegramBotsStatus(): Promise<void> {
  try {
    const botsStatus = await getTelegramBotsStatus();
    mqttClient.publish(PUBLISH.TELEGRAM_STATUS, botsStatus);
  } catch (error) {
    logger.error(`Error publishing Telegram bots status: ${error}`);
  }
}

// Control Telegram bot (start or stop)
export async function controlTelegramBot(botName: string, action: 'start' | 'stop'): Promise<void> {
  // Find the bot configuration
  const botConfig = config.telegram.bots.find(bot => bot.name === botName);
  
  if (!botConfig) {
    logger.error(`Bot ${botName} not found in configuration`);
    return;
  }
  
  try {
    if (action === 'start') {
      // Start the bot process (this assumes there's a script to start the bot)
      await execAsync(`systemctl --user start ${botConfig.processName}`);
      logger.info(`Started Telegram bot ${botName}`);
    } else {
      // Stop the bot process
      await execAsync(`systemctl --user stop ${botConfig.processName}`);
      logger.info(`Stopped Telegram bot ${botName}`);
    }
    
    // Publish updated status
    await publishTelegramBotsStatus();
  } catch (error) {
    logger.error(`Error ${action}ing Telegram bot ${botName}: ${error}`);
  }
}
