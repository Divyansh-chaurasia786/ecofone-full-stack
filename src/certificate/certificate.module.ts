import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService, PrismaService],
  exports: [CertificateService],
})
export class CertificateModule {}
