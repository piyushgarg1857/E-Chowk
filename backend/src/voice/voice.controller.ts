import { Controller, Post, Get, All, Body, Req, Res, HttpCode, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import * as TwilioSDK from 'twilio';
const twilio = (TwilioSDK as any).default || TwilioSDK;
import { AgentService } from '../agent/agent.service';
import { VoiceSession } from './voice-session.entity';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, CurrentUser } from '../auth/auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TwilioSignatureGuard } from './twilio-signature.guard';
require('dotenv').config();

const SYSTEM_PROMPT = `You are the AI voice assistant for "E-Chowk", a platform connecting Indian daily wage laborers with employers.

RULES:
- Always respond in HINDI (simple, conversational Hindi).
- Keep responses very SHORT (1-2 sentences max). This is a phone call.
- Be warm and patient. Many workers are not educated.
- Your goal: collect the worker's name, main skill (carpenter, plumber, electrician, painter, driver, mason, etc.), and their city.
- Once you have all 3 pieces of information, you MUST prefix your final closing response with a JSON block. Format it EXACTLY like this:
[JSON_DATA: {"name": "extracted name", "skill": "extracted skill", "city": "extracted city"}] Bahut achha! Aapka naam... Aapki jaankari E-Chowk par save ho gayi hai. Dhanyavaad!
- Start by asking: "Namaste! Aapka naam kya hai?"`;

@Controller('voice')
export class VoiceController {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VoiceSession)
    private readonly voiceSessions: Repository<VoiceSession>,
    private readonly agent: AgentService,
  ) {}

  // ─── GET: Fetch all registered workers (for Employer Screen) ──────────
  @Get('workers')
  @UseGuards(AuthGuard)
  async getWorkers(@Res() res: any) {
    try {
      const workers = await this.userRepository.find({
        where: { role: 'worker' },
        select: ['id', 'full_name', 'skill_category', 'current_location', 'phone_number', 'is_available', 'rating', 'registration_source'],
        order: { created_at: 'DESC' },
      });
      return res.json({ success: true, workers });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  @Post('register-call')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('worker')
  async registerCall(@CurrentUser() user: { sub: string }, @Res() res: any) {
    const worker = await this.userRepository.findOne({ where: { id: user.sub } });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });
    try {
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      let fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!fromNumber) {
        const numbers = await twilioClient.incomingPhoneNumbers.list({ limit: 1 });
        fromNumber = numbers[0]?.phoneNumber;
      }
      const webhookUrl = process.env.PUBLIC_BASE_URL?.replace(/\/$/, '');
      if (!fromNumber || !webhookUrl) throw new Error(`Voice service configured improperly (From: ${fromNumber || 'missing'}, Webhook: ${webhookUrl || 'missing'})`);
      const call = await twilioClient.calls.create({
        to: worker.phone_number,
        from: fromNumber,
        url: `${webhookUrl}/voice/agent-incoming`,
      });
      return res.json({ success: true, callSid: call.sid, message: 'AI registration call started' });
    } catch (error: any) {
      console.error('[Register Call Error]', error);
      return res.status(500).json({ success: false, message: error.message || 'Unable to start AI registration call' });
    }
  }

  // ─── NEW: Flutter App triggers this to call a worker ──────────────────
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
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );

      let fromNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!fromNumber) {
        const numbers = await twilioClient.incomingPhoneNumbers.list({ limit: 1 });
        fromNumber = numbers[0]?.phoneNumber;
      }
      if (!fromNumber) throw new Error('No Twilio number available');

      const webhookUrl = process.env.PUBLIC_BASE_URL?.replace(/\/$/, '');
      if (!webhookUrl) {
        throw new Error('PUBLIC_BASE_URL is not configured for Twilio webhooks');
      }

      const call = await twilioClient.calls.create({
        to: targetPhone,
        from: fromNumber,
        url: `${webhookUrl}/voice/incoming`,
      });

      console.log(`\n📞 [OUTBOUND CALL] Calling ${targetPhone}... SID: ${call.sid}`);
      return res.json({ success: true, callSid: call.sid, message: `Calling ${targetPhone}` });
    } catch (err: any) {
      console.error('[Call Error]', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Webhook endpoint (supports both GET for testing and POST for Twilio webhooks)
  @All('webhook')
  handleWebhook(@Req() req: any, @Res() res: any) {
    const callSid = req.body?.CallSid || req.query?.CallSid || '';
    const baseUrl = (process.env.PUBLIC_BASE_URL || 'https://echowk-dev-api.azurewebsites.net').replace(/\/$/, '');
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Namaste! E-Chowk mein aapka swagat hai. Main aapki madad karunga.');
    response.gather({ input: ['speech'], action: `${baseUrl}/voice/agent-respond?callSid=${encodeURIComponent(callSid)}`, method: 'POST', language: 'hi-IN', speechTimeout: 'auto', timeout: 10 });
    return res.type('text/xml').send(response.toString());
  }

  // New agent-backed phone conversation. This is the target voice path.
  @All('agent-incoming')
  @UseGuards(TwilioSignatureGuard)
  agentIncoming(@Req() req: any, @Res() res: any) {
    const callSid = req.body?.CallSid || req.query?.CallSid || '';
    const baseUrl = (process.env.PUBLIC_BASE_URL || 'https://echowk-dev-api.azurewebsites.net').replace(/\/$/, '');
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Namaste! E-Chowk mein aapka swagat hai. Main aapki madad karunga. Aap kya karna chahte hain?');
    response.gather({ input: ['speech'], action: `${baseUrl}/voice/agent-respond?callSid=${encodeURIComponent(callSid)}`, method: 'POST', language: 'hi-IN', speechTimeout: 'auto', timeout: 10 });
    response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Kripya apna jawaab batayein.');
    return res.type('text/xml').send(response.toString());
  }

  @All('agent-respond')
  @UseGuards(TwilioSignatureGuard)
  async agentRespond(@Req() req: any, @Res() res: any) {
    const callSid = req.query?.callSid || req.body?.CallSid || '';
    const phone = req.body?.Direction === 'outbound-api' 
      ? (req.body?.To || req.body?.From) 
      : (req.body?.From || req.body?.To || req.query?.From || req.query?.To);
    const speech = (req.body?.SpeechResult || req.query?.SpeechResult || '').trim();
    const baseUrl = (process.env.PUBLIC_BASE_URL || 'https://echowk-dev-api.azurewebsites.net').replace(/\/$/, '');
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    if (!phone || !speech) {
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Maaf kijiye, mujhe sunai nahi diya. Kripya dobara batayein.');
      response.gather({ input: ['speech'], action: `${baseUrl}/voice/agent-respond?callSid=${encodeURIComponent(callSid)}`, method: 'POST', language: 'hi-IN', speechTimeout: 'auto', timeout: 10 });
      return res.type('text/xml').send(response.toString());
    }
    try {
      const result = await this.agent.chatForPhone(phone, speech);
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, result.reply || 'Ji, batayein.');
      response.gather({ input: ['speech'], action: `${baseUrl}/voice/agent-respond?callSid=${encodeURIComponent(callSid)}`, method: 'POST', language: 'hi-IN', speechTimeout: 'auto', timeout: 10 });
    } catch (error: any) {
      console.error('[Agent Voice Error]', error);
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Maaf kijiye, technical dikkat aa gayi hai. Kripya thodi der baad dobara call karein.');
    }
    return res.type('text/xml').send(response.toString());
  }

  // Step 1: Twilio calls this when an inbound call comes in
  @All('incoming')
  @UseGuards(TwilioSignatureGuard)
  async agentAliasIncoming(@Req() req: any, @Res() res: any) {
    const callSid = req.body?.CallSid || req.query?.CallSid || '';
    const from = req.body?.From || req.query?.From || null;
    const baseUrl = (process.env.PUBLIC_BASE_URL || 'https://echowk-dev-api.azurewebsites.net').replace(/\/$/, '');
    const user = from ? await this.userRepository.findOne({ where: { phone_number: from } }) : null;
    await this.voiceSessions.save(this.voiceSessions.create({
      user_id: user?.id ?? null,
      provider: 'twilio',
      provider_call_id: callSid || null,
      direction: 'inbound',
      status: 'active',
      language: 'hi-IN',
      started_at: new Date(),
    }));
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say({ voice: 'Polly.Aditi', language: 'hi-IN' },
      'Namaste! E-Chowk mein aapka swagat hai. Main aapki madad karunga. Aap kya karna chahte hain?');
    response.gather({
      input: ['speech'],
      action: `${baseUrl}/voice/respond?callSid=${encodeURIComponent(callSid)}`,
      method: 'POST',
      language: 'hi-IN',
      speechTimeout: 'auto',
      timeout: 10,
    });
    return res.type('text/xml').send(response.toString());
  }

  @All('respond')
  @UseGuards(TwilioSignatureGuard)
  async agentAliasRespond(@Req() req: any, @Res() res: any) {
    const callSid = req.query?.callSid || req.body?.CallSid || '';
    const phone = req.body?.Direction === 'outbound-api' 
      ? (req.body?.To || req.body?.From) 
      : (req.body?.From || req.body?.To || req.query?.From || req.query?.To);
    const speech = (req.body?.SpeechResult || req.query?.SpeechResult || '').trim();
    const baseUrl = (process.env.PUBLIC_BASE_URL || 'https://echowk-dev-api.azurewebsites.net').replace(/\/$/, '');
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    if (!phone || !speech) {
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' },
        'Maaf kijiye, mujhe sunai nahi diya. Kripya dobara batayein.');
      response.gather({
        input: ['speech'],
        action: `${baseUrl}/voice/respond?callSid=${encodeURIComponent(callSid)}`,
        method: 'POST',
        language: 'hi-IN',
        speechTimeout: 'auto',
        timeout: 10,
      });
      return res.type('text/xml').send(response.toString());
    }

    try {
      const result = await this.agent.chatForPhone(phone, speech);
      const session = await this.voiceSessions.findOne({ where: { provider: 'twilio', provider_call_id: callSid } });
      if (session) {
        const transcript = Array.isArray(session.transcript) ? session.transcript : [];
        transcript.push({ role: 'user', content: speech, at: new Date().toISOString() });
        transcript.push({ role: 'assistant', content: result.reply || '', at: new Date().toISOString() });
        session.transcript = transcript.slice(-40);
        await this.voiceSessions.save(session);
      }
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' },
        result.reply || 'Ji, batayein.');
      response.gather({
        input: ['speech'],
        action: `${baseUrl}/voice/respond?callSid=${encodeURIComponent(callSid)}`,
        method: 'POST',
        language: 'hi-IN',
        speechTimeout: 'auto',
        timeout: 10,
      });
    } catch (error: any) {
      console.error('[Agent Voice Error]', error);
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' },
        'Maaf kijiye, technical dikkat aa gayi hai. Kripya thodi der baad dobara call karein.');
    }
    return res.type('text/xml').send(response.toString());
  }

  // Database Save Logic
  async saveWorkerToDatabase(phone: string, data: { name: string, skill: string, city: string }) {
    try {
      // Find if user already exists
      let user = await this.userRepository.findOne({ where: { phone_number: phone } });
      
      if (!user) {
        user = this.userRepository.create({
          phone_number: phone,
          role: 'worker',
          registration_source: 'voice'
        });
      }

      user.full_name = data.name;
      user.skill_category = data.skill;
      user.current_location = data.city;
      
      await this.userRepository.save(user);
      console.log(`\n💾 [DATABASE SUCCESS] Worker ${data.name} saved to Azure PostgreSQL Database successfully! ✅\n`);
    } catch (error: any) {
      console.error(`\n❌ [DATABASE ERROR] Could not save to Azure DB (Check IP Firewall).`, error.message);
    }
  }
}
