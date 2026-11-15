import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class TwilioSignatureGuard implements CanActivate {
  private readonly logger = new Logger(TwilioSignatureGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = process.env.TWILIO_AUTH_TOKEN;
    const enforce = process.env.ENFORCE_TWILIO_SIGNATURE === 'true';

    if (!token) {
      if (enforce) throw new UnauthorizedException('Twilio signature validation is not configured');
      return true;
    }

    const signature = request.headers['x-twilio-signature'];
    if (typeof signature !== 'string') {
      this.logger.warn(`Missing Twilio signature for ${request.originalUrl}`);
      if (enforce) throw new UnauthorizedException('Missing Twilio signature');
      return true;
    }

    const baseUrl = process.env.PUBLIC_BASE_URL || 'https://echowk-dev-api.azurewebsites.net';
    const url = new URL(request.originalUrl, baseUrl).toString();
    const valid = twilio.validateRequest(token, signature, url, request.body || {});

    if (!valid) {
      this.logger.warn(`Twilio signature mismatch for ${url}`);
      if (enforce) throw new UnauthorizedException('Invalid Twilio signature');
    }

    return true;
  }
}
