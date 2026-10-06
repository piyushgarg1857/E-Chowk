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
      where: { role: 'worker', is_available: true, is_active: true },
      select: ['id', 'full_name', 'skill_category', 'current_location', 'is_available', 'rating'],
      take: 100,
    });

    const skill = job.required_skill.toLowerCase();
    const location = job.location.toLowerCase();
    return workers
      .map(worker => {
        const workerSkill = (worker.skill_category || '').toLowerCase();
        const workerLocation = (worker.current_location || '').toLowerCase();
        const skillScore = workerSkill.includes(skill) || skill.includes(workerSkill) ? 60 : 0;
        const locationScore = workerLocation.includes(location) || location.includes(workerLocation) ? 25 : 0;
        const ratingScore = Math.min(Number(worker.rating || 0) * 3, 15);
        return { ...worker, match_score: skillScore + locationScore + ratingScore };
      })
      .sort((a, b) => b.match_score - a.match_score);
  }
}
