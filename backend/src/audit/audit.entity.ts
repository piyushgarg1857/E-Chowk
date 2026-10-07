import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_events')
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid', nullable: true }) actor_user_id!: string | null;
  @Column({ type: 'varchar', length: 100 }) action!: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) entity_type!: string | null;
  @Column({ type: 'uuid', nullable: true }) entity_id!: string | null;
  @Column({ type: 'jsonb', default: {} }) metadata!: Record<string, unknown>;
  @CreateDateColumn({ type: 'timestamptz' }) created_at!: Date;
}
