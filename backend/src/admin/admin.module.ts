import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { User } from '../auth/user.entity';
import { Job } from '../jobs/job.entity';
import { JobApplication } from '../jobs/application.entity';
import { Rating } from '../trust/rating.entity';
import { AuditEvent } from '../audit/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Job, JobApplication, Rating, AuditEvent])],
  controllers: [AdminController],
})
export class AdminModule {}
