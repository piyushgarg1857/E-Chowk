import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 15 })
  phone_number: string;

  @Column({ length: 100, nullable: true })
  full_name: string;

  @Column({ length: 20, default: 'worker' })
  role: string; // 'worker', 'employer', 'admin'

  // Specific to workers
  @Column({ length: 50, nullable: true })
  skill_category: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  daily_wage: number;

  @Column({ default: true })
  is_available: boolean;

  @Column('float', { default: 0.0 })
  rating: number;

  // Common properties
  @Column({ length: 200, nullable: true })
  current_location: string;

  @Column({ length: 20, nullable: true })
  registration_source: string;

  @Column({ type: 'timestamptz', nullable: true })
  phone_verified_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  last_seen_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
