import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './profile.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: { sub: string }) { return this.users.getById(user.sub); }

  @Patch('me')
  update(@CurrentUser() user: { sub: string }, @Body() dto: UpdateProfileDto) {
    return this.users.update(user.sub, dto);
  }
}
