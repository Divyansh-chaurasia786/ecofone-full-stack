import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
const { AppModule } = require('../dist/src/app.module');
const { HttpExceptionFilter } = require('../dist/src/common/filters/http-exception.filter');
const { ExpressAdapter } = require('@nestjs/platform-express');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

const server = express();

let app: any;
let isInitialized = false;

async function getApp() {
  if (!isInitialized) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server), { logger: false });
    app.setGlobalPrefix('api/v1');
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    isInitialized = true;
  }
  return server;
}

export default async function handler(req: any, res: any) {
  const expressApp = await getApp();
  expressApp(req, res);
}
