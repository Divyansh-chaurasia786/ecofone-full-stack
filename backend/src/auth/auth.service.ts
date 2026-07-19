import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import axios from 'axios';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async sendOtp(phone: string): Promise<{ success: boolean; message: string; debugCode?: string }> {
    if (!phone || !phone.match(/^\+?[1-9]\d{1,14}$/)) {
      throw new BadRequestException('Invalid international phone number format (E.164)');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Upsert OTP record in database
    await this.prisma.otpRecord.upsert({
      where: { phone },
      update: {
        code: otpCode,
        expiresAt,
        verified: false,
      },
      create: {
        phone,
        code: otpCode,
        expiresAt,
        verified: false,
      },
    });

    // Call External SMS gateway (Twilio / MSG91) logic
    try {
      if (process.env.SMS_PROVIDER === 'msg91') {
        await axios.post('https://api.msg91.com/api/v5/flow/', {
          flow_id: process.env.MSG91_FLOW_ID,
          sender: process.env.MSG91_SENDER_ID,
          recipients: [{ mobiles: phone, otp: otpCode }]
        }, {
          headers: { authkey: process.env.MSG91_AUTH_KEY }
        });
      } else if (process.env.SMS_PROVIDER === 'twilio') {
        await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          new URLSearchParams({
            To: phone,
            From: process.env.TWILIO_PHONE_NUMBER || '',
            Body: `Your EcoFone verification OTP is: ${otpCode}. Valid for 5 minutes.`
          }).toString(),
          {
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
      }
    } catch (err) {
      console.warn('SMS Provider failed. Falling back to local logging. Error:', err.message);
    }

    return {
      success: true,
      message: `OTP sent successfully to ${phone}`,
      debugCode: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    };
  }

  async verifyOtp(phone: string, code: string): Promise<{ token: string; user: any }> {
    const record = await this.prisma.otpRecord.findUnique({
      where: { phone }
    });
    if (!record) {
      throw new BadRequestException('No OTP record found for this phone number');
    }

    if (record.verified) {
      throw new BadRequestException('OTP code already used');
    }

    if (new Date() > record.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    if (record.code !== code) {
      throw new BadRequestException('Incorrect OTP verification code');
    }

    // Mark as verified
    await this.prisma.otpRecord.update({
      where: { phone },
      data: { verified: true }
    });

    // Retrieve or register user
    let user = await this.prisma.user.findUnique({
      where: { phone }
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          name: `EcoFone Customer (${phone.slice(-4)})`,
          email: null,
          role: Role.CUSTOMER,
        }
      });
    }

    const token = this.generateToken(user);
    return { token, user };
  }

  async googleLogin(idToken: string): Promise<{ token: string; user: any }> {
    if (!idToken) {
      throw new BadRequestException('Google ID token is required');
    }

    try {
      const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      const payload = googleRes.data;
      
      const email = payload.email;
      const name = payload.name || payload.given_name || 'Google User';

      if (!email) {
        throw new BadRequestException('Failed to retrieve email from Google Account permissions');
      }

      let user = await this.prisma.user.findUnique({
        where: { email }
      });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            phone: `+910000000000`, // Default temporary phone
            name,
            email,
            role: Role.CUSTOMER,
          }
        });
      }

      const token = this.generateToken(user);
      return { token, user };
    } catch (err) {
      throw new UnauthorizedException('Google authentication failed. ID token might be invalid/expired.');
    }
  }

  private generateToken(user: any): string {
    const payload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is missing');
    }
    return jwt.sign(payload, secret, {
      expiresIn: '7d',
    });
  }

  masterAdminLogin(password: string): { token: string } {
    const masterPassword = this.configService.get<string>('MASTER_ADMIN_PASSWORD');
    if (!masterPassword) {
      throw new Error('MASTER_ADMIN_PASSWORD environment variable is missing');
    }
    if (password !== masterPassword) {
      throw new UnauthorizedException('Invalid master admin password.');
    }
    const payload = {
      id: 'master_admin',
      email: 'business@ecofone.co.in',
      phone: '+919919965499',
      role: 'ADMIN',
      username: 'admin',
    };
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is missing');
    }
    const token = jwt.sign(payload, secret, { expiresIn: '12h' });
    return { token };
  }
}
