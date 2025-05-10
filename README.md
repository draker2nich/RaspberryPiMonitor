# Raspberry Pi Monitor

A comprehensive Raspberry Pi monitoring and fan control system with a web interface and MQTT integration.

## Features

### System Monitoring
- **CPU**: Temperature and load monitoring with status indicators (green/yellow/red)
- **Memory**: Usage tracking with percentage visualization
- **Disk**: Storage utilization monitoring
- **Network**: Connection status monitoring

### Fan Control
- **Automatic Mode**: Temperature-based control with configurable thresholds
- **Manual Mode**: Direct control through web interface or MQTT
- **GPIO Integration**: Hardware control for cooling fans

### Web Interface
- **Real-time Dashboard**: Live system metrics visualization
- **Interactive Controls**: Fan management through an intuitive UI
- **Historical Data**: Temperature and CPU load history graph
- **Responsive Design**: Works on desktop and mobile devices

### MQTT Integration
- **Publish System Metrics**: Share monitoring data with other systems
- **Remote Control**: Manage the fan from any MQTT client
- **Status Updates**: Get real-time fan and system status updates

### Telegram Bot Management
- **Status Monitoring**: Track running/stopped status of Telegram bots
- **Remote Control**: Start/stop bots through the web interface or MQTT

## Architecture

The system is built with a modern TypeScript stack:

- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.IO for instant updates
- **Hardware Access**: GPIO control via onoff library
- **System Information**: Hardware metrics via systeminformation
- **Messaging**: MQTT client for IoT integration
- **Logging**: Winston for comprehensive logging

## Installation

### Prerequisites
- Raspberry Pi running Raspberry Pi OS (formerly Raspbian)
- Node.js 16 or higher
- npm or yarn
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/raspberry-monitor.git
cd raspberry-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root (use the example below as reference):
```
# MQTT Configuration
MQTT_BROKER=your-mqtt-broker.example.com
MQTT_PORT=8883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password

# Monitoring Configuration
MONITORING_INTERVAL=60000
TEMP_GREEN=50
TEMP_YELLOW=70

# Fan Control Configuration
FAN_GPIO_PIN=17
FAN_AUTO_MODE=true
FAN_ON_TEMP=70
FAN_OFF_TEMP=60

# Web Server Configuration
WEB_ENABLED=true
WEB_PORT=3000

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/raspberry-monitor.log

# Telegram Bot Configuration (if applicable)
TELEGRAM_BOT1_PROCESS=telegramBot1
TELEGRAM_BOT2_PROCESS=telegramBot2
```

4. Build the TypeScript code:
```bash
npm run build
```

5. Start the application:
```bash
npm start
```

## Usage

### Web Interface
Access the web interface by navigating to `http://[raspberry-pi-ip]:3000` in your browser.

### MQTT Topics
- **Publish**:
  - `raspberry/monitor/metrics`: System metrics
  - `raspberry/monitor/fan/status`: Fan status
  - `raspberry/monitor/telegram/status`: Telegram bots status

- **Subscribe**:
  - `raspberry/monitor/fan/control`: Fan control commands
  - `raspberry/monitor/telegram/control`: Telegram bot control commands

### API Endpoints
- `GET /api/metrics`: Get current system metrics
- `GET /api/fan`: Get current fan status
- `GET /api/telegram`: Get Telegram bots status
- `POST /api/fan/control`: Control the fan
- `POST /api/telegram/control`: Control Telegram bots

## Running as a Service

To run the application as a service on boot:

1. Create a systemd service file:
```bash
sudo nano /etc/systemd/system/raspberry-monitor.service
```

2. Add the following configuration:
```
[Unit]
Description=Raspberry Pi Monitor
After=network.target

[Service]
ExecStart=/usr/bin/node /path/to/raspberry-monitor/dist/index.js
WorkingDirectory=/path/to/raspberry-monitor
StandardOutput=inherit
StandardError=inherit
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:
```bash
sudo systemctl enable raspberry-monitor
sudo systemctl start raspberry-monitor
```

## Development

- Run in development mode with live reloading:
```bash
npm run dev
```

- Run tests:
```bash
npm test
```

- Lint the code:
```bash
npm run lint
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

# Мониторинг Raspberry Pi

Комплексная система мониторинга и управления вентилятором для Raspberry Pi с веб-интерфейсом и интеграцией MQTT.

## Возможности

### Мониторинг системы
- **CPU**: Отслеживание температуры и загрузки с индикаторами статуса (зеленый/желтый/красный)
- **Память**: Контроль использования с визуализацией процентов
- **Диск**: Мониторинг использования хранилища
- **Сеть**: Отслеживание статуса подключения

### Управление вентилятором
- **Автоматический режим**: Контроль на основе температуры с настраиваемыми порогами
- **Ручной режим**: Прямое управление через веб-интерфейс или MQTT
- **Интеграция GPIO**: Аппаратное управление охлаждающими вентиляторами

### Веб-интерфейс
- **Панель мониторинга в реальном времени**: Визуализация системных метрик
- **Интерактивное управление**: Управление вентилятором через интуитивно понятный интерфейс
- **Исторические данные**: График истории температуры и нагрузки CPU
- **Адаптивный дизайн**: Работает на настольных компьютерах и мобильных устройствах

### Интеграция MQTT
- **Публикация системных метрик**: Обмен данными мониторинга с другими системами
- **Удаленное управление**: Управление вентилятором с любого MQTT-клиента
- **Обновления статуса**: Получение обновлений статуса вентилятора и системы в реальном времени

### Управление Telegram-ботами
- **Мониторинг статуса**: Отслеживание статуса работы Telegram-ботов (запущен/остановлен)
- **Удаленное управление**: Запуск/остановка ботов через веб-интерфейс или MQTT

## Архитектура

Система построена на современном стеке TypeScript:

- **Бэкенд**: Node.js с Express
- **Коммуникация в реальном времени**: Socket.IO для мгновенных обновлений
- **Доступ к оборудованию**: Управление GPIO через библиотеку onoff
- **Системная информация**: Метрики оборудования через systeminformation
- **Обмен сообщениями**: MQTT-клиент для IoT-интеграции
- **Логирование**: Winston для подробного ведения журналов

## Установка

### Требования
- Raspberry Pi с операционной системой Raspberry Pi OS (ранее Raspbian)
- Node.js 16 или выше
- npm или yarn
- Git

### Настройка

1. Клонирование репозитория:
```bash
git clone https://github.com/yourusername/raspberry-monitor.git
cd raspberry-monitor
```

2. Установка зависимостей:
```bash
npm install
```

3. Создание файла `.env` в корне проекта (используйте пример ниже как образец):
```
# Конфигурация MQTT
MQTT_BROKER=your-mqtt-broker.example.com
MQTT_PORT=8883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password

# Конфигурация мониторинга
MONITORING_INTERVAL=60000
TEMP_GREEN=50
TEMP_YELLOW=70

# Конфигурация управления вентилятором
FAN_GPIO_PIN=17
FAN_AUTO_MODE=true
FAN_ON_TEMP=70
FAN_OFF_TEMP=60

# Конфигурация веб-сервера
WEB_ENABLED=true
WEB_PORT=3000

# Конфигурация логирования
LOG_LEVEL=info
LOG_FILE=logs/raspberry-monitor.log

# Конфигурация Telegram-ботов (если применимо)
TELEGRAM_BOT1_PROCESS=telegramBot1
TELEGRAM_BOT2_PROCESS=telegramBot2
```

4. Сборка TypeScript-кода:
```bash
npm run build
```

5. Запуск приложения:
```bash
npm start
```

## Использование

### Веб-интерфейс
Доступ к веб-интерфейсу осуществляется через `http://[raspberry-pi-ip]:3000` в вашем браузере.

### Темы MQTT
- **Публикация**:
  - `raspberry/monitor/metrics`: Системные метрики
  - `raspberry/monitor/fan/status`: Статус вентилятора
  - `raspberry/monitor/telegram/status`: Статус Telegram-ботов

- **Подписка**:
  - `raspberry/monitor/fan/control`: Команды управления вентилятором
  - `raspberry/monitor/telegram/control`: Команды управления Telegram-ботами

### API-эндпоинты
- `GET /api/metrics`: Получение текущих системных метрик
- `GET /api/fan`: Получение текущего статуса вентилятора
- `GET /api/telegram`: Получение статуса Telegram-ботов
- `POST /api/fan/control`: Управление вентилятором
- `POST /api/telegram/control`: Управление Telegram-ботами

## Запуск в качестве службы

Для запуска приложения как службы при загрузке:

1. Создайте файл службы systemd:
```bash
sudo nano /etc/systemd/system/raspberry-monitor.service
```

2. Добавьте следующую конфигурацию:
```
[Unit]
Description=Raspberry Pi Monitor
After=network.target

[Service]
ExecStart=/usr/bin/node /path/to/raspberry-monitor/dist/index.js
WorkingDirectory=/path/to/raspberry-monitor
StandardOutput=inherit
StandardError=inherit
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

3. Включите и запустите службу:
```bash
sudo systemctl enable raspberry-monitor
sudo systemctl start raspberry-monitor
```

## Разработка

- Запуск в режиме разработки с автоматической перезагрузкой:
```bash
npm run dev
```

- Запуск тестов:
```bash
npm test
```

- Проверка кода:
```bash
npm run lint
```

## Лицензия

Этот проект распространяется под лицензией MIT - подробности см. в файле LICENSE.

## Вклад в проект

Вклады приветствуются! Не стесняйтесь отправлять Pull Request.

1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте ваши изменения (`git commit -m 'Добавлена удивительная функция'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request
