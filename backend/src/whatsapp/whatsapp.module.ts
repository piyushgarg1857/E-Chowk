import { Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { WhatsappController } from './whatsapp.controller';

@Module({
  imports: [AgentModule],
  controllers: [WhatsappController],
})
export class WhatsappModule {}
