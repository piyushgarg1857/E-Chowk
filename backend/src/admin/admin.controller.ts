import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../auth/user.entity';
import { Job } from '../jobs/job.entity';
import { JobApplication } from '../jobs/application.entity';
import { Rating } from '../trust/rating.entity';
import { AuditEvent } from '../audit/audit.entity';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Job) private readonly jobs: Repository<Job>,
    @InjectRepository(JobApplication) private readonly applications: Repository<JobApplication>,
    @InjectRepository(Rating) private readonly ratings: Repository<Rating>,
    @InjectRepository(AuditEvent) private readonly audit: Repository<AuditEvent>,
  ) {}

  @Get('overview')
  async overview() {
    const [users, workers, employers, activeJobs, applications, ratings, auditEvents] = await Promise.all([
      this.users.count(),
      this.users.count({ where: { role: 'worker', is_active: true } }),
      this.users.count({ where: { role: 'employer', is_active: true } }),
      this.jobs.count({ where: { status: 'open' } }),
      this.applications.count(),
      this.ratings.count(),
      this.audit.count(),
    ]);
    return {
      users, workers, employers, open_jobs: activeJobs,
      applications, ratings, audit_events: auditEvents,
      generated_at: new Date().toISOString(),
    };
  }

  @Get('jobs')
  jobsList() {
    return this.jobs.find({ order: { created_at: 'DESC' }, take: 100 });
  }

  @Get('users')
  usersList() {
    return this.users.find({
      select: ['id', 'phone_number', 'full_name', 'role', 'skill_category', 'is_available', 'rating', 'current_location', 'is_active', 'created_at'],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }
}
