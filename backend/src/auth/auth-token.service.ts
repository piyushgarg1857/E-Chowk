import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

export interface AuthTokenPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthTokenService {
  private readonly secret = process.env.AUTH_TOKEN_SECRET || 'development-only-change-me';

  sign(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>, ttlSeconds = 60 * 60 * 24 * 7): string {
    const header = this.encode({ alg: 'HS256', typ: 'JWT' });
    const now = Math.floor(Date.now() / 1000);
    const body = this.encode({ ...payload, iat: now, exp: now + ttlSeconds });
    const unsigned = header + '.' + body;
    const signature = this.signValue(unsigned);
    return unsigned + '.' + signature;
  }

  verify(token: string): AuthTokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new UnauthorizedException('Invalid authentication token');
    const [header, body, signature] = parts;
    const expected = this.signValue(header + '.' + body);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid authentication token');
    }
    const payload = this.decode(body) as AuthTokenPayload;
    if (!payload?.sub || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Authentication token expired');
    }
    return payload;
  }

  private signValue(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  private encode(value: object): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private decode(value: string): unknown {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  }
}
