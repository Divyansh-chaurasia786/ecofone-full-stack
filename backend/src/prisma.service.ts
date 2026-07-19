import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || "postgresql://neondb_owner:npg_EB9knm7bFeCf@ep-blue-sun-adp2jl9q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
        }
      }
    });
  }

  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the PostgreSQL database via Prisma.');
    } catch (err) {
      this.logger.warn('Failed to connect to the PostgreSQL database. Please ensure DATABASE_URL in backend/.env is correct and database is active.');
      this.logger.warn(err.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
