import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('voice_sessions')
export class VoiceSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  user_id!: string | null;

  @Column({ type: 'varchar', length: 30 })
  provider!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  provider_call_id!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'inbound' })
  direction!: string;

  @Column({ type: 'varchar', length: 30, default: 'initiated' })
  status!: string;

  @Column({ type: 'varchar', length: 20, default: 'hi-IN' })
  language!: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  transcript!: unknown[];

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  started_at!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  ended_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
