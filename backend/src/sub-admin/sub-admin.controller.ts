import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { SubAdminService } from './sub-admin.service';
import { RolesGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsString, MinLength, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateSubAdminDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsArray()
  @ArrayNotEmpty()
  permissions: string[];
}

export class ResetSubAdminPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class SubAdminLoginDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class VerifySubAdminPasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}

@Controller('sub-admin')
export class SubAdminController {
  constructor(private subAdminService: SubAdminService) {}

  /** POST /sub-admin/login  — password-only, returns JWT-like token */
  @Post('login')
  async login(@Body() body: SubAdminLoginDto) {
    return this.subAdminService.login(body.password);
  }

  /** GET /sub-admin — list all (master admin only) */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async list() {
    return this.subAdminService.list();
  }

  /** POST /sub-admin — create (master admin only) */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() body: CreateSubAdminDto) {
    return this.subAdminService.create(body);
  }

  /** DELETE /sub-admin/:id — delete (master admin only) */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.subAdminService.remove(id);
  }

  /** PATCH /sub-admin/:id/password — update password (master admin only) */
  @Patch(':id/password')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async resetPassword(@Param('id') id: string, @Body() body: ResetSubAdminPasswordDto) {
    return this.subAdminService.updatePassword(id, body.password);
  }

  /** PATCH /sub-admin/:id/permissions — update permissions (master admin only) */
  @Patch(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updatePermissions(@Param('id') id: string, @Body('permissions') permissions: string[]) {
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      throw new BadRequestException('Permissions must be a non-empty array.');
    }
    return this.subAdminService.updatePermissions(id, permissions);
  }

  /** POST /sub-admin/:id/verify-password — verify sub-admin password (master admin only) */
  @Post(':id/verify-password')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async verifyPassword(@Param('id') id: string, @Body() body: VerifySubAdminPasswordDto) {
    return this.subAdminService.verifyPassword(id, body.password);
  }
}
