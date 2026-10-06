import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { CreateJobDto, SearchJobsDto, ApplicationDecisionDto } from './job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
@UseGuards(AuthGuard)
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get()
  search(@Query() dto: SearchJobsDto) { return this.jobs.search(dto); }

  @Get(':id')
  get(@Param('id') id: string) { return this.jobs.get(id); }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateJobDto) {
    return this.jobs.create(user.sub, dto);
  }

  @Post(':id/applications')
  apply(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.jobs.apply(user.sub, id);
  }

  @Get(':id/applications')
  applications(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.jobs.listApplications(user.sub, id);
  }

  @Patch('applications/:applicationId')
  decide(@CurrentUser() user: { sub: string }, @Param('applicationId') applicationId: string, @Body() dto: ApplicationDecisionDto) {
    return this.jobs.decide(user.sub, applicationId, dto.status);
  }

  @Post(':id/complete')
  complete(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.jobs.complete(user.sub, id);
  }
}
