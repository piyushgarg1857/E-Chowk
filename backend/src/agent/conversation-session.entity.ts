import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('conversation_sessions')
export class ConversationSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 20, default: 'app' })
  channel!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  title!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  state!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  messages!: unknown[];

  @Column({ type: 'timestamptz', nullable: true })
  last_message_at!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
