import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid' }) job_id!: string;
  @Column({ type: 'uuid' }) worker_id!: string;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) status!: string;
  @CreateDateColumn({ type: 'timestamptz' }) applied_at!: Date;
  @Column({ type: 'timestamptz', nullable: true }) completed_at!: Date | null;
}
