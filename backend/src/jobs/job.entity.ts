import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid' }) employer_id!: string;
  @Column({ type: 'varchar', length: 50 }) required_skill!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ type: 'varchar', length: 200 }) location!: string;
  @Column('decimal', { precision: 10, scale: 2, nullable: true }) offered_wage!: number | null;
  @Column({ type: 'int', default: 1 }) duration_days!: number;
  @Column({ type: 'varchar', length: 20, default: 'open' }) status!: string;
  @Column({ type: 'timestamptz', nullable: true }) starts_at!: Date | null;
  @CreateDateColumn({ type: 'timestamptz' }) created_at!: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updated_at!: Date;
}
