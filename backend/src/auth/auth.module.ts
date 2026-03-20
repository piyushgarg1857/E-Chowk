import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './user.entity';
import { OtpSession } from './otp-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, OtpSession])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
