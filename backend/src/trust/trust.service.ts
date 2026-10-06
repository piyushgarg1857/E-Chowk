import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { Job } from '../jobs/job.entity';
import { JobApplication } from '../jobs/application.entity';
import { CreateRatingDto } from './rating.dto';

@Injectable()
export class TrustService {
  constructor(
    @InjectRepository(Rating) private readonly ratings: Repository<Rating>,
    @InjectRepository(Job) private readonly jobs: Repository<Job>,
    @InjectRepository(JobApplication) private readonly applications: Repository<JobApplication>,
  ) {}

  async rate(userId: string, jobId: string, dto: CreateRatingDto) {
    const job = await this.jobs.findOne({ where: { id: jobId } });
    if (!job || job.status !== 'completed') throw new BadRequestException('Only completed jobs can be rated');
    const app = await this.applications.findOne({ where: { job_id: jobId, status: 'completed' } });
    if (!app) throw new NotFoundException('Completed assignment not found');
    const toUser = userId === job.employer_id ? app.worker_id : job.employer_id;
    const existing = await this.ratings.findOne({ where: { job_id: jobId, from_user_id: userId } });
    if (existing) throw new BadRequestException('You already rated this job');
    return this.ratings.save(this.ratings.create({
      job_id: jobId, from_user_id: userId, to_user_id: toUser,
      score: dto.score, comment: dto.comment ?? null,
    }));
  }
}
