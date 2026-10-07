import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Job } from '../jobs/job.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Job) private readonly jobs: Repository<Job>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(userId: string, input: { job_id: string; payee_id: string; amount: number; provider?: string }) {
    const job = await this.jobs.findOne({ where: { id: input.job_id } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.employer_id !== userId) throw new ForbiddenException('Only the employer can create a payment');
    if (job.status !== 'completed') throw new BadRequestException('Payment is allowed after job completion');
    if (!Number.isFinite(Number(input.amount)) || Number(input.amount) <= 0) throw new BadRequestException('Amount must be greater than zero');
    const payee = await this.users.findOne({ where: { id: input.payee_id, role: 'worker' } });
    if (!payee) throw new NotFoundException('Worker not found');
    const existing = await this.payments.findOne({ where: { job_id: job.id, payer_id: userId, payee_id: input.payee_id } });
    if (existing) return existing;
    return this.payments.save(this.payments.create({
      job_id: job.id, payer_id: userId, payee_id: input.payee_id,
      amount: Number(input.amount), provider: input.provider || 'manual', status: 'pending',
    }));
  }

  async get(userId: string, id: string) {
    const payment = await this.payments.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.payer_id !== userId && payment.payee_id !== userId) throw new ForbiddenException('Payment access denied');
    return payment;
  }

  async confirm(userId: string, id: string, providerReference?: string) {
    const payment = await this.get(userId, id);
    if (payment.payer_id !== userId) throw new ForbiddenException('Only the payer can confirm payment');
    if (payment.status === 'confirmed') return payment;
    payment.status = 'paid';
    payment.provider_reference = providerReference || payment.provider_reference;
    return this.payments.save(payment);
  }

  listForUser(userId: string) {
    return this.payments.createQueryBuilder('payment')
      .where('payment.payer_id = :id OR payment.payee_id = :id', { id: userId })
      .orderBy('payment.created_at', 'DESC').take(50).getMany();
  }
}