import { Module } from '@nestjs/common';
import { SubAdminController } from './sub-admin.controller';
import { SubAdminService } from './sub-admin.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SubAdminController],
  providers: [SubAdminService, PrismaService],
  exports: [SubAdminService],
})
export class SubAdminModule {}
