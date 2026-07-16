import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { XssMiddleware } from './common/middleware/xss.middleware';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefixes
  app.setGlobalPrefix('api/v1');

  // Serve static uploaded files locally
  const path = require('path');
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // Request body parsing and XSS protection middleware registration
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Register security headers/cors
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe with class-validator settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global custom error handler
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`EcoFone NestJS backend listening on http://localhost:${port}/api/v1`);
}
bootstrap();
