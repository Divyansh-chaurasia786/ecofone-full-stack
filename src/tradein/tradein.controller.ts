import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { TradeInService } from './tradein.service';
import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { RolesGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

export class CalculateQuoteDto {
  @IsNotEmpty()
  @IsString()
  variantId: string;

  @IsNotEmpty()
  @IsBoolean()
  screenDefect: boolean;

  @IsNotEmpty()
  @IsBoolean()
  bodyDefect: boolean;

  @IsNotEmpty()
  @IsBoolean()
  batteryDefect: boolean;

  @IsNotEmpty()
  @IsBoolean()
  cameraDefect: boolean;

  @IsNotEmpty()
  @IsBoolean()
  networkDefect: boolean;
}

export class SchedulePickupDto extends CalculateQuoteDto {
  @IsNotEmpty()
  @IsString()
  pickupAddress: string;

  @IsNotEmpty()
  @IsString()
  pickupDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  offeredPrice: number;
}

@Controller('tradein')
export class TradeInController {
  constructor(private tradeInService: TradeInService) {}

  @Post('quote')
  async getQuote(@Body() body: CalculateQuoteDto) {
    return this.tradeInService.calculateQuote(body);
  }

  @Post('schedule')
  async schedulePickup(@Body() body: SchedulePickupDto, @Req() req: any) {
    // Read optional authorization header to bind to user profile if logged in
    const authHeader = req.headers.authorization;
    let userId: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.decode(token);
        userId = decoded?.id;
      } catch {}
    }

    return this.tradeInService.schedulePickup({
      ...body,
      userId,
    });
  }

  @Get('quotes')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async getQuotes(@Req() req: any) {
    // If Admin, fetch all, otherwise only user specific trade-ins
    const user = req.user;
    if (user.role === Role.ADMIN) {
      return this.tradeInService.getQuotes();
    }
    return this.tradeInService.getQuotes(user.id);
  }

  @Patch('quotes/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateQuoteStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.tradeInService.updateStatus(id, status);
  }
}
