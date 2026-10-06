import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { Job } from '../jobs/job.entity';
import { JobApplication } from '../jobs/application.entity';
import { TrustController } from './trust.controller';
import { TrustService } from './trust.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Job, JobApplication])],
  controllers: [TrustController],
  providers: [TrustService],
})
export class TrustModule {}
