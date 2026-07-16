import { Controller, Post, Get, Delete, Body, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { SystemLogService } from './system-log.service';
import { RolesGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSystemLogDto {
  @IsNotEmpty()
  @IsString()
  action: string;
}

@Controller('system-log')
@UseGuards(RolesGuard)
export class SystemLogController {
  constructor(private readonly systemLogService: SystemLogService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Request() req: any, @Body() body: CreateSystemLogDto) {
    const user = req.user;
    const operator = user?.role === 'ADMIN' ? 'Master Admin' : (user?.username || 'Unknown Operator');
    const role = user?.role === 'ADMIN' ? 'master' : 'sub-admin';

    return this.systemLogService.create({
      action: body.action,
      operator,
      role,
    });
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.systemLogService.findAll();
  }

  @Delete()
  @Roles(Role.ADMIN)
  async deleteLogs(@Query('filterType') filterType: string) {
    if (!filterType) {
      throw new BadRequestException('Filter type is required.');
    }
    return this.systemLogService.deleteLogs(filterType);
  }
}
