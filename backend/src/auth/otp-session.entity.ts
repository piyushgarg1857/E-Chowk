import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('otp_sessions')
export class OtpSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 15 })
  phone_number: string;

  @Column({ type: 'varchar', length: 6 })
  otp_code: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ default: false })
  is_used: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
