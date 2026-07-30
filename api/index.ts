const HARDCODED_DB_URL = "postgresql://neondb_owner:npg_EB9knm7bFeCf@ep-blue-sun-adp2jl9q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

if (!process.env.POSTGRES_PRISMA_URL) {
  process.env.POSTGRES_PRISMA_URL = process.env.DATABASE_URL || HARDCODED_DB_URL;
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

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
