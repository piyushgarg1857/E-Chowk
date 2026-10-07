import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { ConversationSession } from './conversation-session.entity';

@Module({
  imports: [JobsModule, UsersModule, TypeOrmModule.forFeature([ConversationSession])],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
