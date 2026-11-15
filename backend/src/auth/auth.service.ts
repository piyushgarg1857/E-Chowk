import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as twilio from 'twilio';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthService {
  private readonly twilioClient?: twilio.Twilio;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly tokens: AuthTokenService,
  ) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) this.twilioClient = new twilio.Twilio(accountSid, authToken);
  }

  async sendOtp(phone: string) {
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!this.twilioClient || !verifyServiceSid) {
      throw new BadRequestException('OTP service is not configured');
    }
    const formattedPhone = this.normalizePhone(phone);
    let verification; try { verification = await this.twilioClient.verify.v2.services(verifyServiceSid).verifications.create({ to: formattedPhone, channel: 'sms' }); } catch (err: any) { console.error('Twilio Send OTP error:', err); throw new BadRequestException('Twilio OTP error: ' + (err.message || err.status || 'Failed to send SMS')); }
    return { success: true, message: 'OTP sent', status: verification.status };
  }

  async verifyOtp(phone: string, otp: string) {
    if (!this.twilioClient || !process.env.TWILIO_VERIFY_SERVICE_SID) {
      throw new BadRequestException('OTP service is not configured');
    }

    const formattedPhone = this.normalizePhone(phone);
    try {
      const result = await this.twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: formattedPhone, code: otp });

      if (result.status !== 'approved') throw new UnauthorizedException('Invalid or expired OTP');

      let user = await this.userRepository.findOne({ where: { phone_number: formattedPhone } });
      if (!user) user = this.userRepository.create({ phone_number: formattedPhone, role: 'worker' });
      user.phone_verified_at = new Date();
      user.last_seen_at = new Date();
      user.is_active = true;
      user = await this.userRepository.save(user);

      return {
        success: true,
        access_token: this.tokens.sign({ sub: user.id, role: user.role }),
        user: this.publicUser(user),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException('OTP verification failed');
    }
  }

  async setRole(id: string, role: 'worker' | 'employer') {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException('User not found');
    user.role = role;
    const saved = await this.userRepository.save(user);
    return {
      success: true,
      access_token: this.tokens.sign({ sub: saved.id, role: saved.role }),
      user: this.publicUser(saved),
    };
  }

  private normalizePhone(phone: string) {
    return phone.startsWith('+') ? phone : '+91' + phone;
  }

  private publicUser(user: User) {
    return { ...user, phone_verified: true };
  }
}

