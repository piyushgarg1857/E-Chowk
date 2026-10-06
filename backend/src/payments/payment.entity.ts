import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid' }) job_id!: string;
  @Column({ type: 'uuid' }) payer_id!: string;
  @Column({ type: 'uuid' }) payee_id!: string;
  @Column('decimal', { precision: 12, scale: 2 }) amount!: number;
  @Column({ length: 20, default: 'pending' }) status!: string;
  @Column({ length: 40, default: 'manual' }) provider!: string;
  @Column({ length: 120, nullable: true }) provider_reference!: string | null;
  @CreateDateColumn() created_at!: Date;
}
