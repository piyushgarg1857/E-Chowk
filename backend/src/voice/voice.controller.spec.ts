import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VoiceController } from './voice.controller';
import { User } from '../auth/user.entity';
import { AgentService } from '../agent/agent.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { TwilioSignatureGuard } from './twilio-signature.guard';

describe('VoiceController', () => {
  let controller: VoiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceController],
      providers: [
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: AgentService, useValue: { chatForPhone: jest.fn() } },
        { provide: AuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
        { provide: TwilioSignatureGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    controller = module.get<VoiceController>(VoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
