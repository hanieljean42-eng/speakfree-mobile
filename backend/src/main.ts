import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || '*',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(port);
  
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🚀 SpeakFree API Server Running        ║
  ║                                           ║
  ║   📍 URL: http://localhost:${port}          ║
  ║   🌐 Environment: ${configService.get('NODE_ENV')}       ║
  ║   📊 API Docs: http://localhost:${port}/api  ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `);
}

bootstrap();
