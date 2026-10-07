import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { JobApplication } from './application.entity';
import { JobAssignment } from './assignment.entity';
import { CreateJobDto, SearchJobsDto } from './job.dto';
import { User } from '../auth/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobs: Repository<Job>,
    @InjectRepository(JobApplication) private readonly applications: Repository<JobApplication>,
    @InjectRepository(JobAssignment) private readonly assignments: Repository<JobAssignment>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
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
    const saved = await this.jobs.save(job);
    await this.audit.record(employerId, 'job.created', 'job', saved.id, { required_skill: saved.required_skill, location: saved.location });
    return saved;
  }

  async mine(employerId: string) {
    return this.jobs.find({ where: { employer_id: employerId }, order: { created_at: 'DESC' } });
  }

  async myWork(workerId: string) {
    const assignments = await this.assignments.find({
      where: { worker_id: workerId },
      order: { assigned_at: 'DESC' },
    });
    if (!assignments.length) return [];
    const jobs = await Promise.all(assignments.map((a) => this.get(a.job_id)));
    return jobs;
  }

  async myApplications(workerId: string) {
    return this.applications.find({ where: { worker_id: workerId }, order: { applied_at: 'DESC' } });
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
    await this.audit.record(workerId, 'job.application_created', 'job_application', application.id, { job_id: jobId });
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
      if (job.status !== 'open') throw new BadRequestException('Only open jobs can be assigned');
      const existingAssignment = await this.assignments.findOne({ where: { job_id: job.id } });
      if (existingAssignment) throw new BadRequestException('Job already assigned');
      const accepted = await this.applications.find({ where: { job_id: job.id, status: 'accepted' } });
      if (accepted.length) throw new BadRequestException('Job already assigned');
      app.status = 'accepted';
      job.status = 'assigned';
      await this.jobs.save(job);
      await this.assignments.save(this.assignments.create({
        job_id: job.id,
        worker_id: app.worker_id,
        application_id: app.id,
        status: 'assigned',
        started_at: null,
        completed_at: null,
      }));
      await this.applications
        .createQueryBuilder()
        .update(JobApplication)
        .set({ status: 'rejected' })
        .where('job_id = :jobId AND id != :id AND status = :status', { jobId: job.id, id: app.id, status: 'pending' })
        .execute();
    } else {
      if (app.status !== 'pending') throw new BadRequestException('Only pending applications can be rejected');
      app.status = 'rejected';
    }
    const saved = await this.applications.save(app);
    await this.audit.record(employerId, 'job.application_decided', 'job_application', saved.id, { status });
    await this.notifications.create(app.worker_id, 'application_update', 'Application update', status === 'accepted' ? 'Your application was accepted.' : 'Your application was rejected.');
    return saved;
  }

  async start(workerId: string, jobId: string) {
    const app = await this.applications.findOne({ where: { job_id: jobId, worker_id: workerId, status: 'accepted' } });
    if (!app) throw new ForbiddenException('Accepted assignment not found');
    const job = await this.get(jobId);
    if (job.status !== 'assigned') throw new BadRequestException('Job must be assigned before starting');
    const assignment = await this.assignments.findOne({ where: { job_id: jobId, worker_id: workerId } });
    if (!assignment || assignment.status !== 'assigned') throw new ForbiddenException('Assignment is not startable');
    assignment.status = 'in_progress';
    assignment.started_at = new Date();
    job.status = 'in_progress';
    await this.assignments.save(assignment);
    await this.jobs.save(job);
    await this.audit.record(workerId, 'job.started', 'job', job.id);
    return job;
  }

  async complete(workerId: string, jobId: string) {
    const app = await this.applications.findOne({ where: { job_id: jobId, worker_id: workerId, status: 'accepted' } });
    if (!app) throw new ForbiddenException('Accepted assignment not found');
    const job = await this.get(jobId);
    if (job.status !== 'in_progress') throw new BadRequestException('Job must be in progress before completion');
    const assignment = await this.assignments.findOne({ where: { job_id: jobId, worker_id: workerId } });
    if (!assignment || assignment.status !== 'in_progress') throw new ForbiddenException('Assignment is not completable');
    assignment.status = 'completed';
    assignment.completed_at = new Date();
    job.status = 'completed';
    app.status = 'completed';
    app.completed_at = new Date();
    await this.assignments.save(assignment);
    await this.jobs.save(job);
    const saved = await this.applications.save(app);
    await this.notifications.create(job.employer_id, 'job_completed', 'Job completed', 'The assigned worker marked the job completed.');
    await this.audit.record(workerId, 'job.completed', 'job', job.id);
    return saved;
  }
}
