import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}
  @Get('khata') khata(@CurrentUser() user: { sub: string }) { return this.payments.listForUser(user.sub); }
  @Get() list(@CurrentUser() user: { sub: string }) { return this.payments.listForUser(user.sub); }
  @Get(':id') get(@CurrentUser() user: { sub: string }, @Param('id') id: string) { return this.payments.get(user.sub, id); }
  @Post() create(@CurrentUser() user: { sub: string }, @Body() body: { job_id: string; payee_id: string; amount: number; provider?: string }) { return this.payments.create(user.sub, body); }
  @Post(':id/confirm') confirm(@CurrentUser() user: { sub: string }, @Param('id') id: string, @Body() body: { provider_reference?: string }) { return this.payments.confirm(user.sub, id, body.provider_reference); }
}