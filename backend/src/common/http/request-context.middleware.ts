import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incoming = req.header('x-correlation-id');
    const correlationId = incoming?.slice(0, 128) || randomUUID();
    res.setHeader('x-correlation-id', correlationId);
    (req as Request & { correlationId?: string }).correlationId = correlationId;
    const started = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - started;
      console.log(JSON.stringify({
        event: 'http_request',
        correlation_id: correlationId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: durationMs,
      }));
    });
    next();
  }
}
