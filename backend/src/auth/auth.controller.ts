import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { SetRoleDto } from './dto/role.dto';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) { return this.authService.sendOtp(dto.phone); }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) { return this.authService.verifyOtp(dto.phone, dto.otp); }

  @Patch('role')
  @UseGuards(AuthGuard)
  async setRole(@CurrentUser() user: { sub: string }, @Body() dto: SetRoleDto) {
    return this.authService.setRole(user.sub, dto.role);
  }
}
