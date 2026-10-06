import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid' }) user_id!: string;
  @Column({ length: 50 }) type!: string;
  @Column({ length: 200 }) title!: string;
  @Column({ type: 'text' }) body!: string;
  @Column({ type: 'timestamptz', nullable: true }) read_at!: Date | null;
  @CreateDateColumn() created_at!: Date;
}
