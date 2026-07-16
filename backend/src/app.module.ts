import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { FranchiseModule } from './franchise/franchise.module';
import { TradeInModule } from './tradein/tradein.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { CmsModule } from './cms/cms.module';
import { SubAdminModule } from './sub-admin/sub-admin.module';
import { SystemLogModule } from './system-log/system-log.module';
import { XssMiddleware } from './common/middleware/xss.middleware';

@Module({
  imports: [
    AuthModule,
    FranchiseModule,
    TradeInModule,
    EcommerceModule,
    CmsModule,
    SubAdminModule,
    SystemLogModule,
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
