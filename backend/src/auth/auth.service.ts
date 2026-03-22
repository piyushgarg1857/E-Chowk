import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as twilio from 'twilio';

@Injectable()
export class AuthService {
  private twilioClient: twilio.Twilio;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    // We get these from the .env file
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    // Fallback error to warn if env is missing
    if (!accountSid || !authToken) {
      console.warn("⚠️ TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is missing in .env!");
    } else {
      this.twilioClient = new twilio.Twilio(accountSid, authToken);
    }
  }

  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
      
      if (!this.twilioClient || !verifyServiceSid) {
        throw new Error("Twilio Client or Service SID is not configured!");
      }

      // Ensure phone number has country code (like +91)
      const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;

      // 1. Call Twilio Verify API to perfectly send a real SMS code
      const verification = await this.twilioClient.verify.v2
        .services(verifyServiceSid)
        .verifications.create({ to: formattedPhone, channel: 'sms' });

      return { 
        success: true, 
        message: `असली OTP '${formattedPhone}' पर भेज दिया गया है! Status: ${verification.status}` 
      };

    } catch (error) {
      console.error("Twilio Send Error:", error);
      return { success: false, message: 'Twilio से OTP भेजने में गलती हुई: ' + error.message };
    }
  }

  async verifyOtp(phone: string, otp: string) {
    try {
      const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
      const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;

      // 1. Call Twilio Verify API to perfectly check if the SMS code is correct
      const verificationCheck = await this.twilioClient.verify.v2
        .services(verifyServiceSid!)
        .verificationChecks.create({ to: formattedPhone, code: otp });

      if (verificationCheck.status !== 'approved') {
        throw new BadRequestException('Invalid or expired OTP (Twilio Verify failed)');
      }

      // 2. Focus perfectly on E-Chowk User Creation if Twilio Approved
      let user = await this.userRepository.findOne({ where: { phone_number: formattedPhone } });
      if (!user) {
        user = this.userRepository.create({ phone_number: formattedPhone, role: 'worker' }); // Default role
        await this.userRepository.save(user);
      }

      // TODO: Generate and Return JWT Bearer token here
      return { success: true, message: 'OTP Verified (via Twilio) & Login successful!', data: user };
      
    } catch (error) {
      console.error("Twilio Check Error:", error);
      throw new BadRequestException('OTP वेरिफिकेशन फेल हो गया: ' + error.message);
    }
  }
}
