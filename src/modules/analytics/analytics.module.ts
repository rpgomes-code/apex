import { Module } from '@nestjs/common';
import { PerformanceService } from './performance/performance.service';
import { UsageService } from './usage/usage.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  providers: [PerformanceService, UsageService, AnalyticsService],
  controllers: [AnalyticsController]
})
export class AnalyticsModule {}
