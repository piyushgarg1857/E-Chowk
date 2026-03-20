import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body('phone') phone: string) {
    if (!phone) {
      return { success: false, message: 'Phone number is required' };
    }
    return this.authService.sendOtp(phone);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('phone') phone: string, @Body('otp') otp: string) {
    if (!phone || !otp) {
      return { success: false, message: 'Phone and OTP are required' };
    }
    return this.authService.verifyOtp(phone, otp);
  }
}
