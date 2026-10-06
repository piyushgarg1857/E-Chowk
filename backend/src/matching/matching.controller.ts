import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, CurrentUser } from '../auth/auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MatchingService } from './matching.service';

@Controller('matching')
@UseGuards(AuthGuard, RolesGuard)
@Roles('employer', 'admin')
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Get('jobs/:jobId/workers')
  workers(@Param('jobId') jobId: string) { return this.matching.workersForJob(jobId); }
}
