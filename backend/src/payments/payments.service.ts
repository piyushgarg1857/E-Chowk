import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(Payment) private readonly payments: Repository<Payment>) {}
  listForUser(userId: string) {
    return this.payments.createQueryBuilder('payment')
      .where('payment.payer_id = :id OR payment.payee_id = :id', { id: userId })
      .orderBy('payment.created_at', 'DESC').take(50).getMany();
  }
}
