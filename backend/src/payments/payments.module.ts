import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Job } from '../jobs/job.entity';
import { User } from '../auth/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Job, User])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}