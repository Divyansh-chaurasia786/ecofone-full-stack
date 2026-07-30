import { Controller, Post, Get, Patch, Delete, Param, Body, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { FranchiseService, RoiParams } from './franchise.service';
import { IsNotEmpty, IsString, IsEmail, Matches, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { RolesGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

export class ApplyFranchiseDto {
  @IsNotEmpty()
  @IsString()
  applicantName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be E.164 formatted' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  locationPreference: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(500000, { message: 'Investment capacity must be at least Rs. 500,000' })
  investmentCapacity: number;

  @IsNotEmpty()
  @IsString()
  experienceDesc: string;
}

export enum LocationTier {
  TIER_A = 'TIER_A',
  TIER_B = 'TIER_B',
  TIER_C = 'TIER_C',
}

export class CalculateRoiDto {
  @IsNotEmpty()
  @IsEnum(LocationTier)
  locationTier: 'TIER_A' | 'TIER_B' | 'TIER_C';

  @IsNotEmpty()
  @IsNumber()
  @Min(100000)
  investmentSize: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  expectedDailyFootfall: number;

  @IsOptional()
  @IsString()
  @IsEnum(['FIFO', 'FICO'])
  businessModel?: 'FIFO' | 'FICO';
}

@Controller('franchise')
export class FranchiseController {
  constructor(private franchiseService: FranchiseService) {}

  @Post('apply')
  async apply(@Body() body: ApplyFranchiseDto) {
    return this.franchiseService.apply(body);
  }

  @Post('calculate-roi')
  async calculateRoi(@Body() body: CalculateRoiDto) {
    return this.franchiseService.calculateRoi(body);
  }

  @Get('applications')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getApplications() {
    return this.franchiseService.getApplications();
  }

  @Patch('applications/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateApplicationStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.franchiseService.updateStatus(id, status);
  }

  @Delete('applications')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteApplications(
    @Query('targetType') targetType: string,
    @Query('filterType') filterType: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    if (!targetType || !filterType) {
      throw new BadRequestException('Target type and filter type are required.');
    }
    return this.franchiseService.deleteApplications(targetType, filterType, startDate, endDate);
  }
}
