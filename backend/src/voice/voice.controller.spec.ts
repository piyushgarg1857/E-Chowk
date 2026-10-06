import { Test, TestingModule } from '@nestjs/testing';
import { VoiceController } from './voice.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { AgentService } from '../agent/agent.service';

describe('VoiceController', () => {
  let controller: VoiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoiceController],
      providers: [
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: AgentService, useValue: { chatForPhone: jest.fn() } },
      ],
    }).compile();

    controller = module.get<VoiceController>(VoiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
