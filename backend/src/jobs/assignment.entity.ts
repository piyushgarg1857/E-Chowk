import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('job_assignments')
export class JobAssignment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid', unique: true }) job_id!: string;
  @Column({ type: 'uuid' }) worker_id!: string;
  @Column({ type: 'uuid', nullable: true }) application_id!: string | null;
  @CreateDateColumn({ type: 'timestamptz' }) assigned_at!: Date;
  @Column({ type: 'timestamptz', nullable: true }) started_at!: Date | null;
  @Column({ type: 'timestamptz', nullable: true }) completed_at!: Date | null;
  @Column({ type: 'varchar', length: 20, default: 'assigned' }) status!: string;
}
