import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { Job } from '../jobs/job.entity';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Job) private readonly jobs: Repository<Job>,
  ) {}

  async workersForJob(jobId: string) {
    const job = await this.jobs.findOne({ where: { id: jobId } });
    if (!job) return [];
    const workers = await this.users.find({
      where: { role: 'worker', is_active: true },
      select: ['id', 'full_name', 'skill_category', 'current_location', 'is_available', 'rating', 'daily_wage', 'phone_number'],
      take: 100,
    });
    const skill = (job.required_skill || '').toLowerCase();
    const location = (job.location || '').toLowerCase();
    return workers.map(worker => {
      const workerSkill = (worker.skill_category || '').toLowerCase();
      const workerLocation = (worker.current_location || '').toLowerCase();
      const skillScore = (workerSkill && (workerSkill.includes(skill) || skill.includes(workerSkill))) ? 60 : 10;
      const locationScore = (workerLocation && (workerLocation.includes(location) || location.includes(workerLocation))) ? 25 : 10;
      const availScore = worker.is_available ? 15 : 0;
      const ratingScore = Math.min(Number(worker.rating || 0) * 3, 15);
      return { ...worker, match_score: skillScore + locationScore + availScore + ratingScore };
    }).sort((a, b) => b.match_score - a.match_score);
  }

  async jobsForWorker(workerId: string, limit = 20) {
    const worker = await this.users.findOne({ where: { id: workerId, role: 'worker' } });
    if (!worker) return [];
    const qb = this.jobs.createQueryBuilder('job')
      .where('job.status = :status', { status: 'open' });
    if (worker.skill_category) {
      qb.andWhere('(LOWER(job.required_skill) LIKE LOWER(:skill) OR LOWER(:skill) LIKE LOWER(job.required_skill))', { skill: '%' + worker.skill_category + '%' });
    }
    if (worker.current_location) {
      qb.andWhere('(LOWER(job.location) LIKE LOWER(:location) OR LOWER(:location) LIKE LOWER(job.location))', { location: '%' + worker.current_location + '%' });
    }
    let matched = await qb.orderBy('job.created_at', 'DESC').take(Math.min(Math.max(limit, 1), 50)).getMany();
    if (!matched.length) {
      // Fallback: return open jobs so worker always has opportunities to view
      matched = await this.jobs.find({
        where: { status: 'open' },
        order: { created_at: 'DESC' },
        take: Math.min(Math.max(limit, 1), 50),
      });
    }
    return matched;
  }
}