import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class TwilioSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!token) {
      if (process.env.NODE_ENV === 'production') throw new UnauthorizedException('Twilio signature validation is not configured');
      return true;
    }

    const signature = request.headers['x-twilio-signature'];
    if (typeof signature !== 'string') throw new UnauthorizedException('Missing Twilio signature');

    const baseUrl = process.env.PUBLIC_BASE_URL;
    const url = new URL(request.originalUrl, baseUrl || 'http://localhost').toString();
    const valid = twilio.validateRequest(token, signature, url, request.body || {});
    if (!valid) throw new UnauthorizedException('Invalid Twilio signature');
    return true;
  }
}
