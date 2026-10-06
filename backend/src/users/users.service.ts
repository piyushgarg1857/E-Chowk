import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { UpdateProfileDto } from './profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async findOrCreateByPhone(phone: string) {
    let user = await this.users.findOne({ where: { phone_number: phone } });
    if (!user) user = await this.users.save(this.users.create({ phone_number: phone, role: 'worker', registration_source: 'voice' }));
    return user;
  }

  async getById(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.publicUser(user);
  }

  async update(id: string, dto: UpdateProfileDto) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    return this.publicUser(await this.users.save(user));
  }

  async setRole(id: string, role: 'worker' | 'employer') {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    return this.publicUser(await this.users.save(user));
  }

  private publicUser(user: User) {
    const { phone_number, ...safe } = user;
    return { ...safe, phone_verified: true };
  }
}
