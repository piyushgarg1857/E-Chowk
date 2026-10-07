import { Body, Controller, Get, Param, Post, UseGuards, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  @Get('sessions/:sessionId')
  async session(@CurrentUser() user: { sub: string }, @Param('sessionId') sessionId: string) {
    return this.agent.getSession(user.sub, sessionId);
  }

  @Post('sessions/:sessionId/messages')
  async sessionMessage(@CurrentUser() user: { sub: string }, @Param('sessionId') sessionId: string, @Body() dto: AgentMessageDto) {
    return this.agent.chatInSession(user.sub, sessionId, dto.message);
  }
}