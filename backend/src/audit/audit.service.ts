import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditEvent) private readonly events: Repository<AuditEvent>) {}

  record(actorUserId: string | null, action: string, entityType?: string, entityId?: string, metadata: Record<string, unknown> = {}) {
    return this.events.save(this.events.create({
      actor_user_id: actorUserId,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      metadata,
    }));
  }
}
