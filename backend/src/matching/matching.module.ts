import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { Job } from '../jobs/job.entity';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Job])],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}
