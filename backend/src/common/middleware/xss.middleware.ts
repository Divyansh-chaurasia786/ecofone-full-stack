import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class XssMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) req.body = this.sanitize(req.body);
    if (req.query) req.query = this.sanitize(req.query);
    if (req.params) req.params = this.sanitize(req.params);
    next();
  }

  private sanitize(input: any): any {
    if (typeof input === 'string') {
      return this.cleanString(input);
    }
    if (Array.isArray(input)) {
      return input.map((item) => this.sanitize(item));
    }
    if (typeof input === 'object' && input !== null) {
      const cleanObj: any = {};
      for (const key of Object.keys(input)) {
        cleanObj[key] = this.sanitize(input[key]);
      }
      return cleanObj;
    }
    return input;
  }

  private cleanString(str: string): string {
    // Basic sanitization replacing <script> tags and HTML tags to prevent XSS injections
    return str
      .replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, '')
      .replace(/<\/?[^>]+(>|$)/g, '');
  }
}
