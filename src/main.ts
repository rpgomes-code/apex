import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: configService.get('nodeEnv') === 'production',
    }),
  );

  // Set global prefix
  app.setGlobalPrefix(configService.get<string>('api.prefix') || '');
  
  // Enable CORS for development
  if (configService.get('nodeEnv') !== 'production') {
    app.enableCors();
  }

  const port = configService.get('port');
  await app.listen(port);
  
  console.log(`🚀 Apex API is running on: http://localhost:${port}/${configService.get('api.prefix')}`);
  console.log(`📊 Environment: ${configService.get('nodeEnv')}`);
  console.log(`📡 Kafka Brokers: ${configService.get('kafka.brokers').join(', ')}`);
}

bootstrap();