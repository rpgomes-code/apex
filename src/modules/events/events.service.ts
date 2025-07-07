import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { KafkaService } from "../kafka/kafka.service";
import { CreateEventDto } from "../../common/dto/create-event.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly kafkaService: KafkaService) {}

  async publishEvent(eventDto: CreateEventDto) {
    const eventId = uuidv4();
    const { topic, stream } = this.getTopicAndStreamFromEvent(eventDto);

    if (!topic) {
      throw new BadRequestException(`Unknown stream: ${eventDto.stream}`);
    }

    const kafkaMessage = {
      key: this.generateMessageKey(eventDto),
      value: JSON.stringify({
        eventId,
        ...eventDto,
        publishedAt: new Date().toISOString(),
      }),
      headers: {
        "event-type": eventDto.eventType,
        stream: stream,
        intent: eventDto.intent,
        source: "apex-api",
        version: "1.0.0",
        "correlation-id": eventDto.metadata?.correlation_id || eventId,
        "sapphire-version": eventDto.metadata?.sapphireVersion || "unknown",
      },
    };

    await this.kafkaService.publish(topic, kafkaMessage);

    this.logger.log(
      `Published ${eventDto.eventType} to ${topic}/${stream} with intent ${eventDto.intent}`
    );

    return {
      eventId,
      topic,
      stream,
      intent: eventDto.intent,
      success: true,
    };
  }

  private getTopicAndStreamFromEvent(eventDto: CreateEventDto): {
    topic: string | null;
    stream: string;
  } {
    const streamToTopicMapping = {
      // Command streams
      "commands.slash": "isomeg-commands",
      "commands.context": "isomeg-commands",
      "commands.autocomplete": "isomeg-commands",
      "commands.precondition": "isomeg-commands",

      // Interaction streams
      "interactions.button": "isomeg-interactions",
      "interactions.modal": "isomeg-interactions",
      "interactions.select": "isomeg-interactions",
      "interactions.message": "isomeg-interactions",

      // Event streams
      "events.guild": "isomeg-events",
      "events.member": "isomeg-events",
      "events.message": "isomeg-events",
      "events.voice": "isomeg-events",

      // Analytics streams
      "analytics.performance": "isomeg-analytics",
      "analytics.usage": "isomeg-analytics",
      "analytics.errors": "isomeg-analytics",
      "analytics.metrics": "isomeg-analytics",

      // Moderation streams
      "moderation.automod": "isomeg-moderation",
      "moderation.manual": "isomeg-moderation",
      "moderation.appeals": "isomeg-moderation",
      "moderation.logs": "isomeg-moderation",

      // Plugin streams
      "plugins.lifecycle": "isomeg-plugins",
      "plugins.config": "isomeg-plugins",
      "plugins.errors": "isomeg-plugins",
      "plugins.custom": "isomeg-plugins",
    };

    const topic = streamToTopicMapping[eventDto.stream] || null;
    return { topic, stream: eventDto.stream };
  }

  private generateMessageKey(eventDto: CreateEventDto): string {
    // Generate partition key based on event type and stream
    const keyParts = [
      eventDto.eventType,
      eventDto.stream.split(".")[0], // Get main category (commands, interactions, etc.)
      eventDto.data?.userId || eventDto.data?.interactionId || "system",
    ];

    return keyParts.join("-");
  }
}
