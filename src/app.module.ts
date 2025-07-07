import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventsModule } from "./modules/events/events.module";
import { KafkaModule } from "./modules/kafka/kafka.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [".env.local", ".env"],
    }),
    KafkaModule,
    EventsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
