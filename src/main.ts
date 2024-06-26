import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AllExceptionsFilter } from './modules/common/utils/filter';
import { TransformInterceptor } from './modules/common/utils/interceptor';
import { CustomLoggerService } from './modules/common/utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useLogger(new CustomLoggerService());

  // Enable CORS for all requests.
  app.enableCors({
    origin: configService.get<string[]>('CORS_ALLOWED_ORIGINS'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Enable security headers.
  app.use(helmet());

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // for incoming requests validation against the DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      enableDebugMessages: true,
      whitelist: true, // Strip out any properties that are not defined in the DTO.
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are found.
    }),
  );

  // for consistent response structure
  app.useGlobalInterceptors(new TransformInterceptor());

  // for consistent error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(configService.get<string>('PORT') || 3000);
}
bootstrap();
