import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module';
import { UsersModule } from '../users/users.module';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';

@Module({
  imports: [JobsModule, UsersModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
