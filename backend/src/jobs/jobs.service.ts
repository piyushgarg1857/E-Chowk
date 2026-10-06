import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { JobApplication } from './application.entity';
import { CreateJobDto, SearchJobsDto } from './job.dto';
import { User } from '../auth/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobs: Repository<Job>,
    @InjectRepository(JobApplication) private readonly applications: Repository<JobApplication>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly notifications: NotificationsService,
  ) {}

  async create(employerId: string, dto: CreateJobDto) {
    const employer = await this.users.findOne({ where: { id: employerId } });
    if (!employer || employer.role !== 'employer') throw new ForbiddenException('Employer role required');
    const job = this.jobs.create({
      employer_id: employerId,
      required_skill: dto.required_skill,
      description: dto.description ?? null,
      location: dto.location,
      offered_wage: dto.offered_wage ?? null,
      duration_days: dto.duration_days ?? 1,
      starts_at: dto.starts_at ? new Date(dto.starts_at) : null,
      status: 'open',
    });
    return this.jobs.save(job);
  }

  async search(dto: SearchJobsDto) {
    const qb = this.jobs.createQueryBuilder('job').where('job.status = :status', { status: 'open' });
    if (dto.skill) qb.andWhere('LOWER(job.required_skill) LIKE LOWER(:skill)', { skill: '%' + dto.skill + '%' });
    if (dto.location) qb.andWhere('LOWER(job.location) LIKE LOWER(:location)', { location: '%' + dto.location + '%' });
    return qb.orderBy('job.created_at', 'DESC').take(dto.limit ?? 20).getMany();
  }

  async get(id: string) {
    const job = await this.jobs.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async apply(workerId: string, jobId: string) {
    const worker = await this.users.findOne({ where: { id: workerId } });
    if (!worker || worker.role !== 'worker') throw new ForbiddenException('Worker role required');
    const job = await this.get(jobId);
    if (job.status !== 'open') throw new BadRequestException('Job is not open');

    const existing = await this.applications.findOne({ where: { job_id: jobId, worker_id: workerId } });
    if (existing) return existing;
    const application = await this.applications.save(this.applications.create({ job_id: jobId, worker_id: workerId, status: 'pending' }));
    await this.notifications.create(job.employer_id, 'job_application', 'New worker application', 'A worker applied for your job.');
    return application;
  }

  async applicationStatus(workerId: string, jobId: string) {
    const application = await this.applications.findOne({ where: { worker_id: workerId, job_id: jobId } });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async listApplications(employerId: string, jobId: string) {
    const job = await this.get(jobId);
    if (job.employer_id !== employerId) throw new ForbiddenException('Not your job');
    return this.applications.find({ where: { job_id: jobId }, order: { applied_at: 'DESC' } });
  }

  async decide(employerId: string, applicationId: string, status: 'accepted' | 'rejected') {
    const app = await this.applications.findOne({ where: { id: applicationId } });
    if (!app) throw new NotFoundException('Application not found');
    const job = await this.get(app.job_id);
    if (job.employer_id !== employerId) throw new ForbiddenException('Not your job');
    if (status === 'accepted') {
      const accepted = await this.applications.find({ where: { job_id: job.id, status: 'accepted' } });
      if (accepted.length) throw new BadRequestException('Job already assigned');
      job.status = 'assigned';
      app.status = 'accepted';
      await this.jobs.save(job);
    } else {
      app.status = 'rejected';
    }
    const saved = await this.applications.save(app);
    await this.notifications.create(app.worker_id, 'application_update', 'Application update', status === 'accepted' ? 'Your application was accepted.' : 'Your application was rejected.');
    return saved;
  }

  async start(workerId: string, jobId: string) {
    const app = await this.applications.findOne({ where: { job_id: jobId, worker_id: workerId, status: 'accepted' } });
    if (!app) throw new ForbiddenException('Accepted assignment not found');
    const job = await this.get(jobId);
    job.status = 'in_progress';
    await this.jobs.save(job);
    return job;
  }

  async complete(workerId: string, jobId: string) {
    const app = await this.applications.findOne({ where: { job_id: jobId, worker_id: workerId, status: 'accepted' } });
    if (!app) throw new ForbiddenException('Accepted assignment not found');
    const job = await this.get(jobId);
    job.status = 'completed';
    app.status = 'completed';
    app.completed_at = new Date();
    await this.jobs.save(job);
    const saved = await this.applications.save(app);
    await this.notifications.create(job.employer_id, 'job_completed', 'Job completed', 'The assigned worker marked the job completed.');
    return saved;
  }
}
