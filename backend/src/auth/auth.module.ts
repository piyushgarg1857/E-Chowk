import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './user.entity';
import { AuthTokenService } from './auth-token.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, AuthTokenService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthTokenService, AuthGuard],
})
export class AuthModule {}
