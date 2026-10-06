import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthTokenService } from './auth-token.service';
import { User } from './user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokens: AuthTokenService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Bearer token required');

    const payload = this.tokens.verify(header.slice(7));
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user || !user.is_active) throw new UnauthorizedException('User account is inactive or missing');

    user.last_seen_at = new Date();
    await this.users.save(user);

    request.user = { ...payload, role: user.role };
    return true;
  }
}
