import { Module } from '@nestjs/common';
import { SystemLogService } from './system-log.service';
import { SystemLogController } from './system-log.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [SystemLogService, PrismaService],
  controllers: [SystemLogController],
  exports: [SystemLogService],
})
export class SystemLogModule {}
