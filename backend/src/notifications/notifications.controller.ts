import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}
  @Get() list(@CurrentUser() user: { sub: string }) { return this.notifications.list(user.sub); }
  @Patch('read-all')
  readAll(@CurrentUser() user: { sub: string }) { return this.notifications.markAllRead(user.sub); }

  @Patch(':id/read') read(@CurrentUser() user: { sub: string }, @Param('id') id: string) { return this.notifications.markRead(user.sub, id); }
}
