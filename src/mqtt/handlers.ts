import mqttClient from './client';
import { SUBSCRIBE } from './topics';
import { setFanMode, setFanState } from '../system/fan';
import { controlTelegramBot } from '../system/telegram';
import logger from '../utils/logger';

export function setupMqttHandlers(): void {
  // Fan control handler
  mqttClient.addMessageHandler(SUBSCRIBE.FAN_CONTROL, (topic, message) => {
    try {
      const command = JSON.parse(message.toString());
      
      if (command.mode !== undefined) {
        // Set fan mode (auto or manual)
        setFanMode(command.mode === 'auto');
        logger.info(`Fan mode set to ${command.mode}`);
      }
      
      if (command.state !== undefined && command.mode !== 'auto') {
        // Set fan state (on or off) in manual mode
        setFanState(command.state === 'on');
        logger.info(`Fan state set to ${command.state}`);
      }
    } catch (error) {
      logger.error(`Error processing fan control command: ${error}`);
    }
  });

  // Telegram bot control handler
  mqttClient.addMessageHandler(SUBSCRIBE.TELEGRAM_CONTROL, (topic, message) => {
    try {
      const command = JSON.parse(message.toString());
      
      if (command.bot && (command.action === 'start' || command.action === 'stop')) {
        controlTelegramBot(command.bot, command.action);
        logger.info(`Telegram bot ${command.bot} ${command.action} command received`);
      }
    } catch (error) {
      logger.error(`Error processing Telegram control command: ${error}`);
    }
  });
}
