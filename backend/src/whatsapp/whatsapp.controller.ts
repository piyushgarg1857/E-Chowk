import { Controller, Post, Req, Res } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';
import * as TwilioSDK from 'twilio';
import { UseGuards } from '@nestjs/common';
import { TwilioSignatureGuard } from '../voice/twilio-signature.guard';
const twilio = (TwilioSDK as any).default || TwilioSDK;

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly agent: AgentService) {}

  @Post('incoming')
  @UseGuards(TwilioSignatureGuard)
  async incoming(@Req() req: any, @Res() res: any) {
    const from = String(req.body?.From || '').replace(/^whatsapp:/, '');
    const body = String(req.body?.Body || '').trim();
    const response = new twilio.twiml.MessagingResponse();

    if (!from || !body) {
      response.message('Namaste! E-Chowk mein aapka swagat hai. Aap kya karna chahte hain?');
      return res.type('text/xml').send(response.toString());
    }

    try {
      const result = await this.agent.chatForPhone(from, body);
      response.message(result.reply || 'Ji, batayein.');
    } catch (error) {
      console.error('[WhatsApp Agent Error]', error);
      response.message('Maaf kijiye, technical dikkat aa gayi hai. Kripya thodi der baad try karein.');
    }
    return res.type('text/xml').send(response.toString());
  }
}
