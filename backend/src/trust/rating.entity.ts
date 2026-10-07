import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid' }) job_id!: string;
  @Column({ type: 'uuid' }) from_user_id!: string;
  @Column({ type: 'uuid' }) to_user_id!: string;
  @Column({ type: 'int' }) score!: number;
  @Column({ type: 'text', nullable: true }) comment!: string | null;
  @CreateDateColumn({ type: 'timestamptz' }) created_at!: Date;
}
