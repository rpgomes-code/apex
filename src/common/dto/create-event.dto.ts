import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
} from "class-validator";

export enum EventType {
  COMMAND_EXECUTION = "COMMAND_EXECUTION",
  INTERACTION_EXECUTION = "INTERACTION_EXECUTION",
  ANALYTICS_METRIC = "ANALYTICS_METRIC",
  PERFORMANCE_METRIC = "PERFORMANCE_METRIC",
  PLUGIN_LOADED = "PLUGIN_LOADED",
  MODERATION_ACTION = "MODERATION_ACTION",
}

export enum EventIntent {
  TRACK = "TRACK",
  ANALYZE = "ANALYZE",
  CONFIG = "CONFIG",
  MODERATE = "MODERATE",
}

export class CreateEventDto {
  @IsEnum(EventType)
  @IsNotEmpty()
  eventType: EventType;

  @IsString()
  @IsNotEmpty()
  stream: string;

  @IsEnum(EventIntent)
  @IsNotEmpty()
  intent: EventIntent;

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsObject()
  @IsOptional()
  metadata?: {
    botVersion?: string;
    environment?: string;
    sapphireVersion?: string;
    correlation_id?: string;
  };

  @IsObject()
  @IsNotEmpty()
  data: any;
}
