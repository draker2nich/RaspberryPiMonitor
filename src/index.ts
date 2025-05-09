import config from './config';
import logger from './utils/logger';
import mqttClient from './mqtt/client';
import { setupMqttHandlers } from './mqtt/handlers';
import { getSystemMetrics } from './system/metrics';
import { initializeFan, updateFanBasedOnTemperature, cleanupFan } from './system/fan';
import { publishTelegramBotsStatus } from './system/telegram';
import { PUBLISH } from './mqtt/topics';
import { startWebServer, updateWebData } from './web/server'; // Добавляем импорт веб-сервера

// Флаг для индикации завершения работы приложения
let isShuttingDown = false;

// Инициализация приложения
async function initialize(): Promise<void> {
  try {
    logger.info('Starting Raspberry Pi monitoring server');
    
    // Инициализация управления вентилятором
    initializeFan();
    
    // Настройка обработчиков сообщений MQTT
    setupMqttHandlers();
    
    // Запуск веб-сервера (на порту 3000)
    startWebServer(3000);
    
    // Запуск цикла мониторинга
    startMonitoringLoop();
    
    // Настройка корректного завершения работы
    setupGracefulShutdown();
    
    logger.info('Raspberry Pi monitoring server started successfully');
  } catch (error) {
    logger.error(`Error initializing application: ${error}`);
    process.exit(1);
  }
}

// Запуск цикла мониторинга
function startMonitoringLoop(): void {
  logger.info(`Starting monitoring loop with interval ${config.monitoring.interval}ms`);
  
  // Сразу собираем и публикуем метрики при запуске
  collectAndPublishMetrics();
  
  // Устанавливаем интервал для регулярного сбора и публикации метрик
  setInterval(() => {
    if (!isShuttingDown) {
      collectAndPublishMetrics();
    }
  }, config.monitoring.interval);
}

// Сбор и публикация системных метрик
async function collectAndPublishMetrics(): Promise<void> {
  try {
    // Получаем системные метрики
    const metrics = await getSystemMetrics();
    
    // Публикуем системные метрики в MQTT
    mqttClient.publish(PUBLISH.SYSTEM_METRICS, metrics);
    
    // Обновляем веб-интерфейс с новыми метриками
    updateWebData('metrics', metrics);
    
    // Обновляем вентилятор в зависимости от температуры CPU (если в автоматическом режиме)
    updateFanBasedOnTemperature(metrics.cpu.temperature);
    
    // Публикуем статус Telegram ботов
    const telegramStatus = await publishTelegramBotsStatus();
    
    // Обновляем веб-интерфейс со статусом Telegram ботов
    updateWebData('telegram', telegramStatus);
    
    logger.debug('System metrics collected and published');
  } catch (error) {
    logger.error(`Error collecting or publishing metrics: ${error}`);
  }
}

// Настройка корректного завершения работы
function setupGracefulShutdown(): void {
  // Обработка сигналов завершения процесса
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      if (!isShuttingDown) {
        isShuttingDown = true;
        shutdown()
          .then(() => process.exit(0))
          .catch(error => {
            logger.error(`Error during shutdown: ${error}`);
            process.exit(1);
          });
      }
    });
  });
  
  // Обработка необработанных исключений
  process.on('uncaughtException', error => {
    logger.error(`Uncaught exception: ${error}`);
    if (!isShuttingDown) {
      isShuttingDown = true;
      shutdown()
        .then(() => process.exit(1))
        .catch(() => process.exit(1));
    }
  });
  
  // Обработка необработанных отклонений промисов
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled promise rejection at: ${promise}, reason: ${reason}`);
  });
}

// Корректное завершение работы приложения
async function shutdown(): Promise<void> {
  logger.info('Shutting down application');
  
  // Выключаем вентилятор
  cleanupFan();
  
  // Отключаем MQTT клиент
  mqttClient.disconnect();
  
  logger.info('Application shutdown complete');
}

// Запуск приложения
initialize().catch(error => {
  logger.error(`Fatal error during initialization: ${error}`);
  process.exit(1);
});