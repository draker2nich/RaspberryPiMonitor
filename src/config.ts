import dotenv from 'dotenv';
import path from 'path';

// Загрузка переменных окружения из файла .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface Config {
  // MQTT Configuration
  mqtt: {
    broker: string;
    port: number;
    clientId: string;
    username: string;
    password: string;
    protocol: 'mqtt' | 'mqtts';
    reconnectPeriod: number;
  };
  
  // System Monitoring Configuration
  monitoring: {
    interval: number; // in milliseconds
    cpuTemperature: {
      thresholds: {
        green: number; // Temperature below this value is considered "green" (normal)
        yellow: number; // Temperature below this value but above green is "yellow" (warning)
        // Above yellow is considered "red" (critical)
      };
    };
  };
  
  // Fan Control Configuration
  fan: {
    gpioPin: number;
    autoMode: {
      enabled: boolean;
      onTemperature: number; // Temperature to turn on the fan
      offTemperature: number; // Temperature to turn off the fan (hysteresis)
    };
  };
  
  // Telegram Bot Configuration
  telegram: {
    bots: Array<{
      name: string;
      processName: string; // Process name to check if the bot is running
    }>;
  };
  
  // Web Server Configuration (добавлено)
  web: {
    enabled: boolean;
    port: number;
  };
  
  // Logging Configuration
  logging: {
    level: string;
    file: string;
  };
}

const config: Config = {
  mqtt: {
    broker: process.env.MQTT_BROKER || 'xxx.hivemq.cloud',
    port: parseInt(process.env.MQTT_PORT || '8883', 10),
    clientId: process.env.MQTT_CLIENT_ID || `raspberry-pi-${Math.random().toString(16).slice(2, 10)}`,
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    protocol: 'mqtts',
    reconnectPeriod: 5000,
  },
  
  monitoring: {
    interval: parseInt(process.env.MONITORING_INTERVAL || '60000', 10), // Default: 60 seconds
    cpuTemperature: {
      thresholds: {
        green: parseInt(process.env.TEMP_GREEN || '50', 10), // Below 50°C is green
        yellow: parseInt(process.env.TEMP_YELLOW || '70', 10), // Below 70°C is yellow, above is red
      },
    },
  },
  
  fan: {
    gpioPin: parseInt(process.env.FAN_GPIO_PIN || '17', 10), // GPIO pin for fan control
    autoMode: {
      enabled: process.env.FAN_AUTO_MODE === 'true', // Default to auto mode
      onTemperature: parseInt(process.env.FAN_ON_TEMP || '70', 10), // Turn on at 70°C
      offTemperature: parseInt(process.env.FAN_OFF_TEMP || '60', 10), // Turn off at 60°C
    },
  },
  
  telegram: {
    bots: [
      {
        name: 'Bot1',
        processName: process.env.TELEGRAM_BOT1_PROCESS || 'telegramBot1',
      },
      {
        name: 'Bot2',
        processName: process.env.TELEGRAM_BOT2_PROCESS || 'telegramBot2',
      },
    ],
  },
  
  // Добавлена конфигурация веб-сервера
  web: {
    enabled: process.env.WEB_ENABLED === 'true', // Включен ли веб-сервер
    port: parseInt(process.env.WEB_PORT || '3000', 10), // Порт веб-сервера
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/raspberry-monitor.log',
  },
};

export default config;