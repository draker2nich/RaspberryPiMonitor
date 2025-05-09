import { Gpio } from 'onoff';
import config from '../config';
import logger from '../utils/logger';
import { PUBLISH } from '../mqtt/topics';
import mqttClient from '../mqtt/client';
import { updateWebData } from '../web/server'; // Добавлен импорт

// Fan status interface
export interface FanStatus {
  mode: 'auto' | 'manual';
  state: 'on' | 'off';
  lastStateChange: number;
  currentTemperature: number;
}

// Create a Gpio instance for fan control
let fanGpio: Gpio;

// Fan state variables
let fanStatus: FanStatus = {
  mode: config.fan.autoMode.enabled ? 'auto' : 'manual',
  state: 'off',
  lastStateChange: Date.now(),
  currentTemperature: 0,
};

// Initialize the fan control
export function initializeFan(): void {
  try {
    // Initialize GPIO
    fanGpio = new Gpio(config.fan.gpioPin, 'out');
    
    // Set initial state to off
    fanGpio.writeSync(0);
    
    logger.info(`Fan initialized on GPIO pin ${config.fan.gpioPin}`);
    
    // Publish initial fan status
    publishFanStatus();
  } catch (error) {
    logger.error(`Error initializing fan: ${error}`);
  }
}

// Set the fan state (on or off)
export function setFanState(on: boolean): void {
  try {
    // Set GPIO pin state
    fanGpio.writeSync(on ? 1 : 0);
    
    // Update fan status
    fanStatus.state = on ? 'on' : 'off';
    fanStatus.lastStateChange = Date.now();
    
    // Publish updated status
    publishFanStatus();
    
    logger.info(`Fan turned ${on ? 'on' : 'off'}`);
  } catch (error) {
    logger.error(`Error setting fan state: ${error}`);
  }
}

// Set the fan mode (auto or manual)
export function setFanMode(auto: boolean): void {
  fanStatus.mode = auto ? 'auto' : 'manual';
  
  // Publish updated status
  publishFanStatus();
  
  logger.info(`Fan mode set to ${auto ? 'auto' : 'manual'}`);
}

// Update fan based on temperature (for auto mode)
export function updateFanBasedOnTemperature(temperature: number): void {
  // Update current temperature in fan status
  fanStatus.currentTemperature = temperature;
  
  // If not in auto mode, do nothing
  if (fanStatus.mode !== 'auto') {
    return;
  }
  
  try {
    const { onTemperature, offTemperature } = config.fan.autoMode;
    
    if (temperature >= onTemperature && fanStatus.state === 'off') {
      // Turn fan on if temperature exceeds threshold
      setFanState(true);
      logger.info(`Auto: Fan turned on due to high temperature (${temperature}°C)`);
    } else if (temperature <= offTemperature && fanStatus.state === 'on') {
      // Turn fan off if temperature drops below threshold
      setFanState(false);
      logger.info(`Auto: Fan turned off due to temperature drop (${temperature}°C)`);
    }
  } catch (error) {
    logger.error(`Error updating fan based on temperature: ${error}`);
  }
}

// Publish fan status to MQTT
function publishFanStatus(): void {
  mqttClient.publish(PUBLISH.FAN_STATUS, fanStatus);
  // Добавлено: обновление веб-интерфейса
  updateWebData('fan', fanStatus);
}

// Cleanup GPIO on application exit
export function cleanupFan(): void {
  if (fanGpio) {
    fanGpio.unexport();
    logger.info('Fan GPIO pin unexported');
  }
}

// Получить текущий статус вентилятора
export function getFanStatus(): FanStatus {
  return { ...fanStatus };
}