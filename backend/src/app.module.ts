import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { VoiceModule } from './voice/voice.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { AgentModule } from './agent/agent.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { MatchingModule } from './matching/matching.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TrustModule } from './trust/trust.module';
import { PaymentsModule } from './payments/payments.module';
import { AuditModule } from './audit/audit.module';
import { ExotelModule } from './exotel/exotel.module';

@Module({
  imports: [
    // 1. Load Environment Variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 2. Connect to Azure PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        ssl: {
          rejectUnauthorized: false,
        },
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    
    AuthModule,
    VoiceModule,
    HealthModule,
    UsersModule,
    JobsModule,
    AgentModule,
    WhatsappModule,
    MatchingModule,
    NotificationsModule,
    TrustModule,
    PaymentsModule,
    AuditModule,
    ExotelModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
