import { Controller, Post, Get, Body, Req, Res, HttpCode, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { ExotelService } from './exotel.service';
import { AgentService } from '../agent/agent.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, CurrentUser } from '../auth/auth.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('exotel')
export class ExotelController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly exotelService: ExotelService,
    private readonly agentService: AgentService,
  ) {}

  @Post('register-call')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('worker')
  async registerCall(@CurrentUser() user: { sub: string }, @Res() res: any) {
    const worker = await this.userRepository.findOne({ where: { id: user.sub } });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    try {
      const webhookUrl = (process.env.PUBLIC_BASE_URL || 'https://echowk-dev-api.azurewebsites.net').replace(/\/$/, '');
      const callData = await this.exotelService.connectCall({
        from: worker.phone_number,
        url: webhookUrl + '/exotel/agent-incoming',
      });
      return res.json({ success: true, callData, message: 'Exotel AI registration call started' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Unable to start Exotel AI call' });
    }
  }

  @Post('call-worker')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('employer', 'admin')
  @HttpCode(200)
  async callWorker(@Body() body: { phone: string }, @Res() res: any) {
    const targetPhone = body.phone;
    if (!targetPhone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    try {
      const webhookUrl = (process.env.PUBLIC_BASE_URL || 'https://echowk-dev-api.azurewebsites.net').replace(/\/$/, '');
      const callData = await this.exotelService.connectCall({
        from: targetPhone,
        url: webhookUrl + '/exotel/incoming',
      });
      return res.json({ success: true, callData, message: 'Calling ' + targetPhone + ' via Exotel' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  @Get('incoming')
  @Post('incoming')
  handleIncoming(@Req() req: any, @Res() res: any) {
    const responseText = 'Namaste! E-Chowk Exotel voice service mein aapka swagat hai.';
    return res.type('text/plain').send(responseText);
  }

  @Get('agent-incoming')
  @Post('agent-incoming')
  handleAgentIncoming(@Req() req: any, @Res() res: any) {
    const responseText = 'Namaste! E-Chowk AI Agent mein aapka swagat hai. Main aapko register karne mein madad karunga.';
    return res.type('text/plain').send(responseText);
  }

  @Get('agent-respond')
  @Post('agent-respond')
  async handleAgentRespond(@Req() req: any, @Res() res: any) {
    const from = req.body?.From || req.query?.From || '';
    const speech = req.body?.Digits || req.body?.SpeechResult || req.query?.SpeechResult || '';

    if (!from || !speech) {
      return res.type('text/plain').send('Maaf kijiye, mujhe sunai nahi diya.');
    }

    try {
      const result = await this.agentService.chatForPhone(from, String(speech));
      return res.type('text/plain').send(result.reply || 'Ji, batayein.');
    } catch (error: any) {
      return res.type('text/plain').send('Maaf kijiye, technical dikkat aa gayi hai.');
    }
  }
}
