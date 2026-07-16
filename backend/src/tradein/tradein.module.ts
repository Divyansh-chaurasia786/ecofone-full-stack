import { Module } from '@nestjs/common';
import { TradeInController } from './tradein.controller';
import { TradeInService } from './tradein.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TradeInController],
  providers: [TradeInService, PrismaService],
})
export class TradeInModule {}
