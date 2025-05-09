import express, { Request, Response } from 'express';
import path from 'path';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import config from '../config';
import logger from '../utils/logger';
import { getSystemMetrics } from '../system/metrics';
import { getTelegramBotsStatus } from '../system/telegram';
import { setFanMode, setFanState } from '../system/fan';
import { controlTelegramBot } from '../system/telegram';


// Глобальные переменные для хранения последних значений
let lastMetrics: any = null;
let lastFanStatus: any = null;
let lastTelegramStatus: any = null;

// Функция для обновления данных
export function updateWebData(type: string, data: any): void {
  switch (type) {
    case 'metrics':
      lastMetrics = data;
      break;
    case 'fan':
      lastFanStatus = data;
      break;
    case 'telegram':
      lastTelegramStatus = data;
      break;
  }
  
  // Отправить обновление через WebSocket, если он инициализирован
  if (io) {
    io.emit('data-update', { type, data });
  }
}

// Настройка Express
const app = express();
const server = http.createServer(app);
let io: SocketIOServer | null = null;

// Статические файлы
app.use(express.static(path.join(__dirname, '../../public')));

// API маршруты
app.get('/api/metrics', async (req: Request, res: Response) => {
  try {
    if (!lastMetrics) {
      // Если нет кэшированных данных, получить новые
      lastMetrics = await getSystemMetrics();
    }
    res.json(lastMetrics);
  } catch (error) {
    logger.error(`Error getting metrics: ${error}`);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

app.get('/api/fan', (req: Request, res: Response) => {
  if (lastFanStatus) {
    res.json(lastFanStatus);
  } else {
    res.status(404).json({ error: 'Fan status not available yet' });
  }
});

app.get('/api/telegram', async (req: Request, res: Response) => {
  try {
    if (!lastTelegramStatus) {
      // Если нет кэшированных данных, получить новые
      lastTelegramStatus = await getTelegramBotsStatus();
    }
    res.json(lastTelegramStatus);
  } catch (error) {
    logger.error(`Error getting Telegram status: ${error}`);
    res.status(500).json({ error: 'Failed to get Telegram status' });
  }
});

app.post('/api/fan/control', express.json(), (req: Request, res: Response) => {
  try {
    const { mode, state } = req.body;
    
    if (mode) {
      setFanMode(mode === 'auto');
      logger.info(`Fan mode set to ${mode} via API`);
    }
    
    if (state && mode !== 'auto') {
      setFanState(state === 'on');
      logger.info(`Fan state set to ${state} via API`);
    }
    
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error controlling fan via API: ${error}`);
    res.status(500).json({ error: 'Failed to control fan' });
  }
});

// API маршрут для управления Telegram ботами
app.post('/api/telegram/control', (req: Request, res: Response) => {
  try {
    const { bot, action } = req.query as { bot?: string; action?: string };
    
    if (bot && (action === 'start' || action === 'stop')) {
      controlTelegramBot(bot, action);
      logger.info(`Telegram bot ${bot} ${action} command received via API`);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid parameters' });
    }
  } catch (error) {
    logger.error(`Error controlling Telegram bot via API: ${error}`);
    res.status(500).json({ error: 'Failed to control Telegram bot' });
  }
});

export function startWebServer(port: number = 3000): void {
  // Настройка Socket.IO
  io = new SocketIOServer(server);
  
  io.on('connection', (socket: Socket) => {
    logger.info(`New client connected: ${socket.id}`);
    
    // Отправить последние данные при подключении
    if (lastMetrics) socket.emit('data-update', { type: 'metrics', data: lastMetrics });
    if (lastFanStatus) socket.emit('data-update', { type: 'fan', data: lastFanStatus });
    if (lastTelegramStatus) socket.emit('data-update', { type: 'telegram', data: lastTelegramStatus });
    
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
  
  // Запуск сервера
  server.listen(port, () => {
    logger.info(`Web server running on http://localhost:${port}`);
  });
}