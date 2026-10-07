import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { ExotelService } from './exotel.service';
import { ExotelController } from './exotel.controller';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AgentModule],
  providers: [ExotelService],
  controllers: [ExotelController],
  exports: [ExotelService],
})
export class ExotelModule {}
