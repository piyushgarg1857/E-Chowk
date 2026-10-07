import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notifications: Repository<Notification>) {}
  create(userId: string, type: string, title: string, body: string) {
    return this.notifications.save(this.notifications.create({ user_id: userId, type, title, body }));
  }
  list(userId: string) { return this.notifications.find({ where: { user_id: userId }, order: { created_at: 'DESC' }, take: 50 }); }
  async markAllRead(userId: string) {
    await this.notifications
      .createQueryBuilder()
      .update(Notification)
      .set({ read_at: new Date() })
      .where('user_id = :userId AND read_at IS NULL', { userId })
      .execute();
    return { success: true };
  }

  async markRead(userId: string, id: string) {
    const notification = await this.notifications.findOne({ where: { id, user_id: userId } });
    if (!notification) return null;
    notification.read_at = new Date();
    return this.notifications.save(notification);
  }
}
