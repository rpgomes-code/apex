import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { KafkaMessage } from '../../common/interfaces/event.interface';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService.get<string[]>('kafka.brokers') || [
      'kafka:9092',
    ];
    this.logger.log(`Initializing Kafka with brokers: ${brokers.join(', ')}`);

    this.kafka = new Kafka({
      clientId: this.configService.get<string>('kafka.clientId') || 'apex-api',
      brokers,
      retry: {
        initialRetryTime: 1000,
        retries: 3,
        maxRetryTime: 5000,
      },
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Attempting to connect to Kafka...');
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log('✅ Kafka producer connected successfully');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn(
        '⚠️  Failed to connect to Kafka - continuing without Kafka functionality',
      );
      this.logger.warn(`Kafka error: ${error.message}`);
      // Don't throw - allow app to start
    }
  }

  async onModuleDestroy() {
    try {
      if (this.isConnected) {
        await this.producer.disconnect();
      }
      this.logger.log('Kafka connections closed');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka', error);
    }
  }

  async publish(topic: string, message: KafkaMessage): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(
        `Kafka not connected - skipping publish to topic: ${topic}`,
      );
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.key,
            value: message.value,
            headers: message.headers,
            timestamp: Date.now().toString(),
          },
        ],
      });

      this.logger.debug(`Message published to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to topic ${topic}`, error);
    }
  }

  isKafkaConnected(): boolean {
    return this.isConnected;
  }
}
