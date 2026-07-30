import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import axios from 'axios';

export interface DiagnosticInput {
  variantId: string;
  screenDefect: boolean;
  bodyDefect: boolean;
  batteryDefect: boolean;
  cameraDefect: boolean;
  networkDefect: boolean;
}

export interface SchedulePickupInput extends DiagnosticInput {
  userId?: string;
  pickupAddress: string;
  pickupDate: string;
  offeredPrice: number;
}

@Injectable()
export class TradeInService {
  constructor(private prisma: PrismaService) {}

  async calculateQuote(input: DiagnosticInput): Promise<{ offeredPrice: number; basePrice: number }> {
    const { variantId, screenDefect, bodyDefect, batteryDefect, cameraDefect, networkDefect } = input;

    // Find the variant base price in database
    const skus = await this.prisma.sKU.findMany({
      where: { variantId }
    });
    if (!skus.length) {
      throw new NotFoundException(`No SKUs found for variant ID ${variantId}`);
    }

    const baseSku = skus.find((s: any) => s.grade === 'LIKE_NEW') || skus[0];
    const basePrice = baseSku.basePrice * 0.75; // Buyback is roughly 75% of retail price

    let deductionPercentage = 0;
    if (screenDefect) deductionPercentage += 0.25; // 25% deduction
    if (bodyDefect) deductionPercentage += 0.15;   // 15% deduction
    if (batteryDefect) deductionPercentage += 0.12;  // 12% deduction
    if (cameraDefect) deductionPercentage += 0.18;   // 18% deduction
    if (networkDefect) deductionPercentage += 0.20;  // 20% deduction

    let offeredPrice = basePrice * (1 - deductionPercentage);
    
    const minPrice = basePrice * 0.10;
    if (offeredPrice < minPrice) {
      offeredPrice = minPrice;
    }

    return {
      offeredPrice: Math.round(offeredPrice),
      basePrice: Math.round(basePrice),
    };
  }

  async schedulePickup(input: SchedulePickupInput): Promise<{ success: boolean; quoteId: string }> {
    const validatedQuote = await this.calculateQuote({
      variantId: input.variantId,
      screenDefect: input.screenDefect,
      bodyDefect: input.bodyDefect,
      batteryDefect: input.batteryDefect,
      cameraDefect: input.cameraDefect,
      networkDefect: input.networkDefect,
    });

    if (Math.abs(validatedQuote.offeredPrice - input.offeredPrice) > 5) {
      throw new BadRequestException('Discrepancy detected in pricing calculations. Quote recalculated.');
    }

    const pickupDateObj = new Date(input.pickupDate);
    if (pickupDateObj <= new Date()) {
      throw new BadRequestException('Pickup date must be scheduled in the future');
    }

    const tradeInQuote = await this.prisma.tradeInQuote.create({
      data: {
        userId: input.userId || null,
        variantId: input.variantId,
        screenDefect: input.screenDefect,
        bodyDefect: input.bodyDefect,
        batteryDefect: input.batteryDefect,
        cameraDefect: input.cameraDefect,
        networkDefect: input.networkDefect,
        offeredPrice: validatedQuote.offeredPrice,
        pickupAddress: input.pickupAddress,
        pickupDate: pickupDateObj,
        status: 'SCHEDULED',
      }
    });

    // Call webhooks (lead dispatch)
    try {
      const activeWebhooks = await this.prisma.webhookConfig.findMany({
        where: { active: true }
      });
      for (const hook of activeWebhooks) {
        await axios.post(hook.url, {
          event: 'tradein.pickup_scheduled',
          timestamp: new Date().toISOString(),
          data: tradeInQuote,
        });
      }
      console.log(`[Notification Alert] SMS notification scheduled to client for doorstep pickup on ${input.pickupDate}`);
    } catch (err) {
      console.error('Failed to notify system webhook channels:', err.message);
    }

    return {
      success: true,
      quoteId: tradeInQuote.id,
    };
  }

  async getQuotes(userId?: string): Promise<any[]> {
    if (userId) {
      return this.prisma.tradeInQuote.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    }
    return this.prisma.tradeInQuote.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const validStatus = status.toUpperCase() as any;
    return this.prisma.tradeInQuote.update({
      where: { id },
      data: { status: validStatus }
    });
  }
}
