import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import axios from 'axios';

export interface RoiParams {
  locationTier: 'TIER_A' | 'TIER_B' | 'TIER_C';
  investmentSize: number;
  expectedDailyFootfall: number;
  businessModel?: 'FIFO' | 'FICO';
}

@Injectable()
export class FranchiseService {
  constructor(private prisma: PrismaService) {}

  async apply(data: any): Promise<{ success: boolean; id: string }> {
    const application = await this.prisma.franchiseApplication.create({
      data: {
        applicantName: data.applicantName,
        email: data.email,
        phone: data.phone,
        locationPreference: data.locationPreference,
        investmentCapacity: Number(data.investmentCapacity),
        experienceDesc: data.experienceDesc,
        status: 'PENDING',
      }
    });

    // Call webhook pipeline to sync leads to CRMs (HubSpot / Custom webhook)
    try {
      const activeWebhooks = await this.prisma.webhookConfig.findMany({
        where: { active: true }
      });
      for (const hook of activeWebhooks) {
        await axios.post(hook.url, {
          event: 'franchise.application_created',
          timestamp: new Date().toISOString(),
          data: application,
        });
      }

      // Sync to default sales notification channel (mock)
      console.log(`[Notification Alert] SMS/WhatsApp sent to Franchise Relations team: New application by ${data.applicantName} (${data.phone})`);
    } catch (err) {
      console.error('Failed to dispatch webhook lead sync pipeline:', err.message);
    }

    return { success: true, id: application.id };
  }

  async getApplications(): Promise<any[]> {
    return this.prisma.franchiseApplication.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  calculateRoi(params: RoiParams) {
    const { locationTier, investmentSize, expectedDailyFootfall, businessModel } = params;
    const model = businessModel || 'FIFO';

    // Constants based on location tier
    let rent = 0;
    let staffSalaries = 0;
    let avgSellingPrice = 18000; // Refurbished device average
    let conversionRate = 0.025; // 2.5% of store footfall makes a purchase/trade-in
    let grossMargin = 0.22; // 22% gross profit margin per device
    let operatingExpenses = 0;

    switch (locationTier) {
      case 'TIER_A':
        rent = 120000; // Rs. 1.2 Lakh / month
        staffSalaries = 90000; // 3 staff members
        operatingExpenses = 40000; // Electricity, marketing, software
        break;
      case 'TIER_B':
        rent = 60000;
        staffSalaries = 60000;
        operatingExpenses = 25000;
        break;
      case 'TIER_C':
        rent = 30000;
        staffSalaries = 30000;
        operatingExpenses = 15000;
        break;
    }

    // Calculations
    const monthlyFootfall = expectedDailyFootfall * 30;
    const monthlySalesVolume = Math.round(monthlyFootfall * conversionRate);
    const monthlyRevenue = monthlySalesVolume * avgSellingPrice;
    
    // Cost of Goods Sold (COGS)
    const monthlyCogs = monthlyRevenue * (1 - grossMargin);
    const monthlyGrossProfit = monthlyRevenue - monthlyCogs;
    
    let monthlyRoyalty = 0;
    let monthlyExpenses = 0;
    let monthlyNetProfit = 0;

    if (model === 'FIFO') {
      // FIFO: Franchisee earns a net profit margin of 15% of revenue
      monthlyNetProfit = monthlyRevenue * 0.15;
      monthlyRoyalty = monthlyRevenue * 0.05; // 5% royalty to brand
      monthlyExpenses = monthlyRevenue - monthlyNetProfit;
    } else {
      // FICO: Passive investor earns a flat 3% of revenue as net profit
      // The brand operates the store and covers all expenses
      monthlyNetProfit = monthlyRevenue * 0.03;
      monthlyRoyalty = 0;
      monthlyExpenses = monthlyRevenue - monthlyNetProfit;
    }

    const annualNetProfit = monthlyNetProfit * 12;

    // Payback period in months (rounded to nearest whole month)
    const paybackPeriodMonths = monthlyNetProfit > 0 ? Math.round(investmentSize / monthlyNetProfit) : 999;
    const netProfitMargin = monthlyRevenue > 0 ? Number(((monthlyNetProfit / monthlyRevenue) * 100).toFixed(1)) : 0;

    // Generate 3-year cash flow projections (assuming 12% YoY growth)
    const projections = [];
    let currentRevenue = monthlyRevenue * 12;
    let currentProfit = monthlyNetProfit * 12;
    let cumulativeCashFlow = -investmentSize;

    for (let year = 1; year <= 3; year++) {
      if (year > 1) {
        currentRevenue = currentRevenue * 1.12;
        currentProfit = currentProfit * 1.12;
      }
      cumulativeCashFlow += currentProfit;
      const annualExpenses = currentRevenue - currentProfit;
      
      projections.push({
        year,
        revenue: Math.round(currentRevenue),
        expenses: Math.round(annualExpenses),
        netProfit: Math.round(currentProfit),
        cumulativeCashFlow: Math.round(cumulativeCashFlow),
      });
    }

    return {
      monthlyMetrics: {
        footfall: monthlyFootfall,
        salesVolume: monthlySalesVolume,
        revenue: Math.round(monthlyRevenue),
        grossProfit: Math.round(monthlyGrossProfit),
        expenses: Math.round(monthlyExpenses),
        netProfit: Math.round(monthlyNetProfit),
        netProfitMargin,
      },
      paybackPeriodMonths,
      projections,
    };
  }

  async updateStatus(id: string, status: string): Promise<any> {
    let validStatus = status.toUpperCase();
    if (validStatus === 'CLOSED') {
      validStatus = 'APPROVED';
    }
    
    // Fallback to PENDING if invalid status value is supplied
    if (validStatus !== 'PENDING' && validStatus !== 'APPROVED' && validStatus !== 'REJECTED') {
      validStatus = 'PENDING';
    }

    return this.prisma.franchiseApplication.update({
      where: { id },
      data: { status: validStatus as any }
    });
  }

  async deleteApplications(targetType: string, filterType: string, startDate?: string, endDate?: string): Promise<{ count: number }> {
    const now = new Date();
    let cutOffDate: Date | null = null;
    let customStart: Date | null = null;
    let customEnd: Date | null = null;

    if (filterType === '1month') {
      cutOffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (filterType === '3months') {
      cutOffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (filterType === '1year') {
      cutOffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    } else if (filterType === 'custom' && startDate && endDate) {
      customStart = new Date(startDate);
      customEnd = new Date(endDate);
      customEnd.setHours(23, 59, 59, 999);
    }

    const where: any = {};

    if (cutOffDate) {
      where.createdAt = { lt: cutOffDate };
    } else if (filterType === 'custom' && customStart && customEnd) {
      where.createdAt = {
        gte: customStart,
        lte: customEnd,
      };
    }

    if (targetType === 'franchise') {
      where.locationPreference = { not: 'Lucknow HQ Inquiry' };
    } else if (targetType === 'contact') {
      where.locationPreference = 'Lucknow HQ Inquiry';
    }

    const result = await this.prisma.franchiseApplication.deleteMany({
      where
    });

    return { count: result.count };
  }
}
