import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { IsNotEmpty, IsString, Matches, MinLength, MaxLength, IsOptional } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be E.164 formatted (e.g. +919999999999)' })
  phone: string;

  /** Hidden honeypot field to detect and trap automated form submission scripts */
  @IsOptional()
  @IsString()
  website?: string;
}

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be E.164 formatted' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP verification code must be exactly 6 digits' })
  code: string;

  /** Hidden honeypot field */
  @IsOptional()
  @IsString()
  website?: string;
}

export class GoogleLoginDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;
}

export class MasterAdminLoginDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('otp/send')
  async sendOtp(@Body() body: SendOtpDto) {
    if (body.website && body.website.trim().length > 0) {
      // Honeypot field populated by bot script - reject request silently
      throw new BadRequestException('Request validation failed');
    }
    return this.authService.sendOtp(body.phone);
  }

  @Post('otp/verify')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    if (body.website && body.website.trim().length > 0) {
      throw new BadRequestException('Request validation failed');
    }
    return this.authService.verifyOtp(body.phone, body.code);
  }

  @Post('google')
  async googleLogin(@Body() body: GoogleLoginDto) {
    return this.authService.googleLogin(body.idToken);
  }

  @Post('admin/login')
  masterAdminLogin(@Body() body: MasterAdminLoginDto) {
    return this.authService.masterAdminLogin(body.password);
  }
}
