import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import config from '../config';
import logger from '../utils/logger';
import { ALL_SUBSCRIBE_TOPICS } from './topics';

class MqttClientWrapper {
  private client: MqttClient | null = null;
  private messageHandlers: Map<string, ((topic: string, message: Buffer) => void)[]> = new Map();

  constructor() {
    this.setupClient();
  }

  private setupClient(): void {
    const options: IClientOptions = {
      clientId: config.mqtt.clientId,
      protocol: config.mqtt.protocol,
      host: config.mqtt.broker,
      port: config.mqtt.port,
      username: config.mqtt.username,
      password: config.mqtt.password,
      reconnectPeriod: config.mqtt.reconnectPeriod,
      rejectUnauthorized: true, // Use TLS
    };

    this.client = mqtt.connect(options);

    this.client.on('connect', () => {
      logger.info('Connected to MQTT broker');
      this.subscribeToTopics();
    });

    this.client.on('reconnect', () => {
      logger.info('Attempting to reconnect to MQTT broker');
    });

    this.client.on('error', (error) => {
      logger.error(`MQTT connection error: ${error.message}`);
    });

    this.client.on('message', (topic, message) => {
      logger.debug(`Received message on topic ${topic}: ${message.toString()}`);
      
      // Process the message using registered handlers
      if (this.messageHandlers.has(topic)) {
        const handlers = this.messageHandlers.get(topic);
        if (handlers) {
          handlers.forEach(handler => handler(topic, message));
        }
      }
    });

    this.client.on('close', () => {
      logger.info('MQTT connection closed');
    });
  }

  private subscribeToTopics(): void {
    if (!this.client) {
      logger.error('Cannot subscribe: MQTT client not initialized');
      return;
    }

    ALL_SUBSCRIBE_TOPICS.forEach(topic => {
      this.client!.subscribe(topic, (err) => {
        if (err) {
          logger.error(`Failed to subscribe to topic ${topic}: ${err.message}`);
        } else {
          logger.info(`Subscribed to topic: ${topic}`);
        }
      });
    });
  }

  public publish(topic: string, message: string | object): void {
    if (!this.client) {
      logger.error('Cannot publish: MQTT client not initialized');
      return;
    }

    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.client.publish(topic, messageStr, { qos: 1, retain: false }, (err) => {
      if (err) {
        logger.error(`Failed to publish to topic ${topic}: ${err.message}`);
      } else {
        logger.debug(`Published to topic ${topic}: ${messageStr}`);
      }
    });
  }

  public addMessageHandler(topic: string, handler: (topic: string, message: Buffer) => void): void {
    if (!this.messageHandlers.has(topic)) {
      this.messageHandlers.set(topic, []);
    }
    
    this.messageHandlers.get(topic)!.push(handler);
  }

  public disconnect(): void {
    if (this.client) {
      this.client.end();
      logger.info('MQTT client disconnected');
    }
  }
}

// Create and export a singleton instance
const mqttClient = new MqttClientWrapper();
export default mqttClient;
