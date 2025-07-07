import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka, Producer, Consumer } from "kafkajs";
import { KafkaMessage } from "../../common/interfaces/event.interface";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>("kafka.clientId"),
      brokers: this.configService.get<string[]>("kafka.brokers") ?? [],
      retry: {
        initialRetryTime: 100,
        retries: 8,
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
      await this.producer.connect();
      this.logger.log("Kafka producer connected successfully");
    } catch (error) {
      this.logger.error("Failed to connect Kafka producer", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();

      // Disconnect all consumers
      for (const [groupId, consumer] of this.consumers) {
        await consumer.disconnect();
        this.logger.log(`Kafka consumer ${groupId} disconnected`);
      }

      this.logger.log("Kafka connections closed");
    } catch (error) {
      this.logger.error("Error disconnecting Kafka", error);
    }
  }

  async publish(topic: string, message: KafkaMessage): Promise<void> {
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
      throw error;
    }
  }

  async createConsumer(groupId: string): Promise<Consumer> {
    const consumer = this.kafka.consumer({ groupId });
    this.consumers.set(groupId, consumer);

    await consumer.connect();
    this.logger.log(`Kafka consumer created for group: ${groupId}`);

    return consumer;
  }

  getTopics() {
    return this.configService.get("kafka.topics");
  }
}
