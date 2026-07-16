import { Module } from '@nestjs/common';
import { EcommerceController } from './ecommerce.controller';
import { EcommerceService } from './ecommerce.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [EcommerceController],
  providers: [EcommerceService, PrismaService],
})
export class EcommerceModule {}
