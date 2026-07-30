import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class BotProtectionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'] || '';

    // 1. Detect known automated scraping User-Agents on API routes
    const maliciousBotPattern = /python-requests|scrapy|http-client|zgrab|masscan|sqlmap/i;
    if (maliciousBotPattern.test(userAgent)) {
      throw new ForbiddenException('Automated script traffic rejected');
    }

    // 2. Cross-Site request verification for state-changing endpoints
    const secFetchSite = req.headers['sec-fetch-site'];
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && secFetchSite === 'cross-site') {
      // Reject unauthorized cross-site automated submissions
      const origin = req.headers['origin'] || req.headers['referer'];
      if (!origin || (!origin.includes('ecofone.co.in') && !origin.includes('localhost') && !origin.includes('vercel.app'))) {
        throw new ForbiddenException('Cross-site submission blocked');
      }
    }

    next();
  }
}
