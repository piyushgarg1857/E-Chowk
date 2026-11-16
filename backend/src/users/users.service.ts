import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { UpdateProfileDto } from './profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  normalizePhone(phone: string): string {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return '';
    // If Indian number (starts with 91 or 10 digits)
    if (digits.length === 10) return '+91' + digits;
    if (digits.startsWith('91') && digits.length >= 12) {
      return '+91' + digits.slice(-10);
    }
    // US number (11 digits starting with 1)
    if (digits.length === 11 && digits.startsWith('1')) {
      return '+' + digits;
    }
    // General fallback for Indian numbers >= 10 digits
    if (digits.length >= 10) {
      return '+91' + digits.slice(-10);
    }
    return '+' + digits;
  }

  async findOrCreateByPhone(rawPhone: string) {
    const phone = this.normalizePhone(rawPhone);
    let user = await this.users.findOne({ where: { phone_number: phone } });
    if (!user) user = await this.users.save(this.users.create({ phone_number: phone, role: 'worker', registration_source: 'voice' }));
    return user;
  }

  async getById(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.selfUser(user);
  }

  async update(id: string, dto: UpdateProfileDto) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    return this.selfUser(await this.users.save(user));
  }

  async setRole(id: string, role: 'worker' | 'employer') {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    return this.selfUser(await this.users.save(user));
  }

  publicUser(user: User) {
    const { phone_number, ...safe } = user;
    return { ...safe, phone_verified: true };
  }

  private selfUser(user: User) {
    return { ...user, phone_verified: true };
  }
}
