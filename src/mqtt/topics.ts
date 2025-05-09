// MQTT Topics definition

// Base topic for this device
const BASE_TOPIC = 'raspberry/monitor';

// Topics for publishing system metrics
export const PUBLISH = {
  SYSTEM_METRICS: `${BASE_TOPIC}/metrics`,
  FAN_STATUS: `${BASE_TOPIC}/fan/status`,
  TELEGRAM_STATUS: `${BASE_TOPIC}/telegram/status`,
};

// Topics for subscribing to commands
export const SUBSCRIBE = {
  FAN_CONTROL: `${BASE_TOPIC}/fan/control`,
  TELEGRAM_CONTROL: `${BASE_TOPIC}/telegram/control`,
};

// Create an array of all topics to subscribe to
export const ALL_SUBSCRIBE_TOPICS = Object.values(SUBSCRIBE);
