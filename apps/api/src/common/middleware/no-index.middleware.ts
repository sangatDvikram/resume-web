import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Sets `X-Robots-Tag: noindex` on every response for /admin/** routes
 * so that search engines never index the admin dashboard.
 */
@Injectable()
export class NoIndexMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  }
}
