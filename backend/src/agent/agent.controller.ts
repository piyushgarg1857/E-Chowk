import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { AgentMessageDto } from './agent.dto';
import { AgentService } from './agent.service';

@Controller('agent')
@UseGuards(AuthGuard)
export class AgentController {
  constructor(private readonly agent: AgentService) {}

  @Post('message')
  chat(@CurrentUser() user: { sub: string }, @Body() dto: AgentMessageDto) {
    return this.agent.chat(user.sub, dto.message);
  }
}
