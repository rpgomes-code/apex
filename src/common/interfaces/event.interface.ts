export interface BaseIsomegEvent {
  eventId: string;
  eventType: string;
  stream: string;
  intent: string;
  timestamp: string;
  publishedAt: string;
  metadata: {
    botVersion: string;
    environment: string;
    sapphireVersion: string;
    correlation_id: string;
  };
}

export interface KafkaMessage {
  key: string;
  value: string;
  headers: Record<string, string>;
}
