import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SystemLogService {
  constructor(private prisma: PrismaService) {}

  async create(data: { action: string; operator: string; role: string }) {
    return this.prisma.systemLog.create({
      data: {
        action: data.action,
        operator: data.operator,
        role: data.role,
      },
    });
  }

  async findAll() {
    return this.prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 latest logs
    });
  }

  async deleteLogs(filterType: string) {
    const now = new Date();

    if (filterType === 'all') {
      await this.prisma.systemLog.deleteMany();
      return { success: true, message: 'All logs cleared.' };
    }

    if (filterType === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      await this.prisma.systemLog.deleteMany({
        where: { createdAt: { gte: startOfToday } },
      });
      return { success: true, message: "Today's logs cleared." };
    }

    if (filterType === 'yesterday') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      await this.prisma.systemLog.deleteMany({
        where: {
          createdAt: {
            gte: startOfYesterday,
            lt: startOfToday,
          },
        },
      });
      return { success: true, message: "Yesterday's logs cleared." };
    }

    if (filterType === '1month') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      await this.prisma.systemLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      return { success: true, message: 'Logs older than 1 month cleared.' };
    }

    if (filterType === '3months') {
      const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      await this.prisma.systemLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      return { success: true, message: 'Logs older than 3 months cleared.' };
    }

    throw new BadRequestException(`Invalid filter type: ${filterType}`);
  }
}
