export default () => ({
  port: parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(",") || ["kafka:9092"],
    clientId: process.env.KAFKA_CLIENT_ID || "apex-api",
    topics: {
      commands: "isomeg-commands",
      interactions: "isomeg-interactions",
      events: "isomeg-events",
      analytics: "isomeg-analytics",
      moderation: "isomeg-moderation",
      plugins: "isomeg-plugins",
    },
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
    password: process.env.REDIS_PASSWORD || "",
  },

  api: {
    version: "1.0.0",
    prefix: "api/v1",
  },
});