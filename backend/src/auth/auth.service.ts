import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { OtpSession } from './otp-session.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(OtpSession) private otpRepository: Repository<OtpSession>,
  ) {}

  async sendOtp(phone: string): Promise<{ success: boolean; message: string; otp?: string }> {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Save OTP to DB
    const session = this.otpRepository.create({
      phone_number: phone,
      otp_code: otp,
      expires_at: expiresAt,
    });
    await this.otpRepository.save(session);

    // TODO: In production, integrate actual SMS gateway like Twilio or WhatsApp here
    return { success: true, message: 'OTP Sent successfully! (Test Mode)', otp }; // sending OTP back manually for testing UI
  }

  async verifyOtp(phone: string, otp: string) {
    // Check OTP validity in Database
    const session = await this.otpRepository.findOne({
      where: { phone_number: phone, otp_code: otp, is_used: false },
    });

    if (!session || session.expires_at < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark as used
    session.is_used = true;
    await this.otpRepository.save(session);

    // Find or Create user instantly linked to phone number
    let user = await this.userRepository.findOne({ where: { phone_number: phone } });
    if (!user) {
      user = this.userRepository.create({ phone_number: phone, role: 'worker' }); // Default role
      await this.userRepository.save(user);
    }

    // TODO: Generate and Return JWT Bearer token here
    return { success: true, message: 'OTP Verified & Login successful!', data: user };
  }
}
