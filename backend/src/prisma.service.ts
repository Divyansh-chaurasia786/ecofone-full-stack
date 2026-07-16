import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
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
