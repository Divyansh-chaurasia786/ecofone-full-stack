import { Controller, Post, Get, Body, Query, Req, UseGuards, Param, Headers, HttpCode } from '@nestjs/common';
import { EcommerceService } from './ecommerce.service';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { RolesGuard } from '../auth/guards/rbac.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

export class CatalogFilterDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  ram?: string;

  @IsOptional()
  @IsString()
  storage?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}

export class CheckoutDto {
  @IsNotEmpty()
  @IsString()
  skuId: string;

  @IsOptional()
  @IsString()
  storeId?: string;
}

export class PaymentVerifyDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  razorpayPaymentId: string;

  @IsNotEmpty()
  @IsString()
  razorpaySignature: string;
}

@Controller('ecommerce')
export class EcommerceController {
  constructor(private ecommerceService: EcommerceService) {}

  @Get('catalog')
  async getCatalog(@Query() query: CatalogFilterDto) {
    return this.ecommerceService.getCatalog(query);
  }

  @Get('sku/:skuId')
  async getSkuDetails(@Param('skuId') skuId: string) {
    return this.ecommerceService.getSkuDetails(skuId);
  }

  @Post('checkout')
  @UseGuards(RolesGuard)
  @Roles(Role.CUSTOMER, Role.ADMIN)
  async initiateCheckout(@Body() body: CheckoutDto, @Req() req: any) {
    return this.ecommerceService.initiateCheckout({
      customerId: req.user.id,
      skuId: body.skuId,
      storeId: body.storeId,
    });
  }

  @Post('verify-payment')
  @HttpCode(200)
  async verifyPayment(@Body() body: PaymentVerifyDto) {
    return this.ecommerceService.verifyPayment(
      body.orderId,
      body.razorpayPaymentId,
      body.razorpaySignature
    );
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() payload: any, @Headers('x-razorpay-signature') signature: string) {
    return this.ecommerceService.handleWebhook(payload, signature);
  }
}
