import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { Job } from '../jobs/job.entity';
import { JobApplication } from '../jobs/application.entity';
import { CreateRatingDto } from './rating.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TrustService {
  constructor(
    @InjectRepository(Rating) private readonly ratings: Repository<Rating>,
    @InjectRepository(Job) private readonly jobs: Repository<Job>,
    @InjectRepository(JobApplication) private readonly applications: Repository<JobApplication>,
    private readonly audit: AuditService,
  ) {}

  listForUser(userId: string) {
    return this.ratings.find({
      where: { to_user_id: userId },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async summary(userId: string) {
    const rows = await this.ratings
      .createQueryBuilder('rating')
      .select('COUNT(rating.id)', 'count')
      .addSelect('COALESCE(AVG(rating.score), 0)', 'average')
      .where('rating.to_user_id = :userId', { userId })
      .getRawOne();
    return {
      rating_count: Number(rows?.count ?? 0),
      average_rating: Number(rows?.average ?? 0),
    };
  }

  async rate(userId: string, jobId: string, dto: CreateRatingDto) {
    const job = await this.jobs.findOne({ where: { id: jobId } });
    if (!job || job.status !== 'completed') throw new BadRequestException('Only completed jobs can be rated');
    const app = await this.applications.findOne({ where: { job_id: jobId, status: 'completed' } });
    if (!app) throw new NotFoundException('Completed assignment not found');
    const isEmployer = userId === job.employer_id;
    const isWorker = userId === app.worker_id;
    if (!isEmployer && !isWorker) throw new BadRequestException('Only job participants can rate this job');
    const toUser = isEmployer ? app.worker_id : job.employer_id;
    const existing = await this.ratings.findOne({ where: { job_id: jobId, from_user_id: userId } });
    if (existing) throw new BadRequestException('You already rated this job');
    const saved = await this.ratings.save(this.ratings.create({
      job_id: jobId, from_user_id: userId, to_user_id: toUser,
      score: dto.score, comment: dto.comment ?? null,
    }));
    await this.audit.record(userId, 'rating.created', 'rating', saved.id, { job_id: jobId, to_user_id: toUser, score: dto.score });
    return saved;
  }
}
