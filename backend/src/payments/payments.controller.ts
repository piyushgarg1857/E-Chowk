import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}
  @Get() list(@CurrentUser() user: { sub: string }) { return this.payments.listForUser(user.sub); }
}
