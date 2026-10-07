import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { VoiceGateway } from './voice.gateway';
import { User } from '../auth/user.entity';
import { AgentModule } from '../agent/agent.module';
import { ExotelModule } from '../exotel/exotel.module';
import { VoiceSession } from './voice-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, VoiceSession]), AgentModule, ExotelModule],
  controllers: [VoiceController],
  providers: [VoiceService, VoiceGateway],
})
export class VoiceModule {}
