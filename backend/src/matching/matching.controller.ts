import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, CurrentUser } from '../auth/auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MatchingService } from './matching.service';

@Controller('matching')
@UseGuards(AuthGuard, RolesGuard)
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Get('jobs/:jobId/workers')
  workers(@Param('jobId') jobId: string) { return this.matching.workersForJob(jobId); }

  @Get('workers')
  workersForQuery(@Query('jobId') jobId?: string) {
    if (!jobId) return [];
    return this.matching.workersForJob(jobId);
  }

  @Get('jobs')
  jobs(@CurrentUser() user: { sub: string }, @Query('workerId') workerId?: string, @Query('limit') limit?: string) {
    return this.matching.jobsForWorker(workerId || user.sub, Number(limit) || 20);
  }
}