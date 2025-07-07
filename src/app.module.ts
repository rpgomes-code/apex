import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EventsController } from "./modules/events/events.controller";
import { EventsService } from "./modules/events/events.service";
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
    AnalyticsModule,
  ],
  controllers: [AppController, EventsController],
  providers: [AppService, EventsService],
})
export class AppModule {}