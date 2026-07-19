import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { FranchiseModule } from './franchise/franchise.module';
import { TradeInModule } from './tradein/tradein.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { CmsModule } from './cms/cms.module';
import { SubAdminModule } from './sub-admin/sub-admin.module';
import { SystemLogModule } from './system-log/system-log.module';
import { CertificateModule } from './certificate/certificate.module';
import { XssMiddleware } from './common/middleware/xss.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AuthModule,
    FranchiseModule,
    TradeInModule,
    EcommerceModule,
    CmsModule,
    SubAdminModule,
    SystemLogModule,
    CertificateModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security XSS middleware to all routes globally
    consumer.apply(XssMiddleware).forRoutes('*');
  }
}
