import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { RolesGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ThrottlerGuard } from '@nestjs/throttler';
import { IsNotEmpty, IsOptional, IsString, IsDateString, IsEmail, Matches, MaxLength } from 'class-validator';

export class CreateCertificateDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9\-]+$/, { message: 'UID must be alphanumeric and uppercase, optionally containing dashes (e.g. EVG-INT-2024-0001)' })
  uid?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  recipientName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  type: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  role: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsDateString()
  issueDate: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  authorizedSignatory: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  registeredOffice: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  website: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  cin: string;
}

@Controller('certificate')
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  /** POST /certificate - Create a certificate (Admin only) */
  @Post()
  @UseGuards(RolesGuard, ThrottlerGuard)
  @Roles(Role.ADMIN)
  async create(@Body() body: CreateCertificateDto) {
    return this.certificateService.create(body);
  }

  /** GET /certificate - List all certificates (Admin only) */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async list() {
    return this.certificateService.list();
  }

  /** DELETE /certificate/:id - Delete certificate (Admin only) */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return this.certificateService.delete(id);
  }

  /** GET /certificate/verify/:uid - Verify certificate (Public) */
  @Get('verify/:uid')
  @UseGuards(ThrottlerGuard)
  async verify(@Param('uid') uid: string) {
    return this.certificateService.verify(uid);
  }
}
