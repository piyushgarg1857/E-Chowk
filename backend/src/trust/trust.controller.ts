import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { CreateRatingDto } from './rating.dto';
import { TrustService } from './trust.service';

@Controller('trust')
@UseGuards(AuthGuard)
export class TrustController {
  constructor(private readonly trust: TrustService) {}
  @Post('jobs/:jobId/rating')
  rate(@CurrentUser() user: { sub: string }, @Param('jobId') jobId: string, @Body() dto: CreateRatingDto) {
    return this.trust.rate(user.sub, jobId, dto);
  }
}
