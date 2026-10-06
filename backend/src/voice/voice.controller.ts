import { Controller, Post, Get, Body, Req, Res, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import * as TwilioSDK from 'twilio';
const twilio = (TwilioSDK as any).default || TwilioSDK;
import Groq from 'groq-sdk';
import { AgentService } from '../agent/agent.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, CurrentUser } from '../auth/auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UseGuards } from '@nestjs/common';
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// In-memory conversation store (keyed by CallSid)
const conversations: Record<string, { role: 'user' | 'assistant'; content: string }[]> = {};

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
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
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

      // Get our Twilio number
      const numbers = await twilioClient.incomingPhoneNumbers.list({ limit: 1 });
      const fromNumber = numbers[0]?.phoneNumber;
      if (!fromNumber) throw new Error('No Twilio number available');

      // Twilio must use an explicitly configured public HTTPS URL.
      // Never fall back to a hard-coded tunnel URL.
      const webhookUrl = process.env.PUBLIC_BASE_URL?.replace(/\\/$/, '');
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
    } catch (err) {
      console.error('[Call Error]', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // New agent-backed phone conversation. This is the target voice path.
  @Post('agent-incoming')
  agentIncoming(@Req() req: any, @Res() res: any) {
    const callSid = req.body?.CallSid;
    const from = req.body?.From;
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Namaste! E-Chowk mein aapka swagat hai. Main aapki madad karunga. Aap kya karna chahte hain?');
    response.gather({ input: ['speech'], action: `/voice/agent-respond?callSid=${callSid}`, method: 'POST', language: 'hi-IN', speechTimeout: 'auto', timeout: 10 });
    res.type('text/xml').send(response.toString());
    void from;
  }

  @Post('agent-respond')
  async agentRespond(@Req() req: any, @Res() res: any) {
    const callSid = req.query?.callSid || req.body?.CallSid;
    const from = req.body?.From;
    const speech = req.body?.SpeechResult?.trim();
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    if (!from || !speech) {
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Maaf kijiye, mujhe sunai nahi diya. Kripya dobara batayein.');
      response.gather({ input: ['speech'], action: `/voice/agent-respond?callSid=${callSid}`, method: 'POST', language: 'hi-IN', speechTimeout: 'auto', timeout: 10 });
      return res.type('text/xml').send(response.toString());
    }
    try {
      const result = await this.agent.chatForPhone(from, speech);
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, result.reply || 'Ji, batayein.');
      response.gather({ input: ['speech'], action: `/voice/agent-respond?callSid=${callSid}`, method: 'POST', language: 'hi-IN', speechTimeout: 'auto', timeout: 10 });
    } catch (error) {
      console.error('[Agent Voice Error]', error);
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Maaf kijiye, technical dikkat aa gayi hai. Kripya thodi der baad dobara call karein.');
    }
    return res.type('text/xml').send(response.toString());
  }

  // Step 1: Twilio calls this when a call comes in
  @Post('incoming')
  incomingCall(@Req() req: any, @Res() res: any) {
    console.log('\n🔥 [CALL INCOMING] CallSid:', req.body?.CallSid);
    const callSid = req.body?.CallSid;
    
    conversations[callSid] = [];

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    response.say({
      voice: 'Polly.Aditi',
      language: 'hi-IN',
    }, 'Namaste! E-Chowk mein aapka swagat hai. Aapka naam kya hai?');

    response.gather({
      input: ['speech'],
      action: `/voice/respond?callSid=${callSid}`,
      method: 'POST',
      language: 'hi-IN',
      speechTimeout: 'auto',
      enhanced: true,
      timeout: 10,
    });

    res.type('text/xml');
    res.send(response.toString());
  }

  // Step 2: Called every time the user finishes saying something
  @Post('respond')
  async handleResponse(@Req() req: any, @Res() res: any) {
    const callSid = req.query?.callSid || req.body?.CallSid;
    const userSpeech = req.body?.SpeechResult || '';
    const confidence = req.body?.Confidence || 0;
    
    // Twilio natively sends caller phone number!
    const callerPhone = req.body?.From || '+910000000000'; 

    console.log(`\n👤 [Worker Said] (${Math.round(confidence * 100)}% confidence): "${userSpeech}"`);

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    if (!userSpeech) {
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Maafi kijiye, mujhe sunai nahi diya. Kripya dobara bataiye.');
      response.gather({
        input: ['speech'],
        action: `/voice/respond?callSid=${callSid}`,
        method: 'POST',
        language: 'hi-IN',
        speechTimeout: 'auto',
        timeout: 10,
      });
      res.type('text/xml');
      return res.send(response.toString());
    }

    if (!conversations[callSid]) conversations[callSid] = [];
    conversations[callSid].push({ role: 'user', content: userSpeech });

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversations[callSid],
        ],
        max_tokens: 150,
      });

      let aiResponse = completion.choices[0]?.message?.content || 'Maafi kijiye, kuch gadbad ho gayi.';
      let isDone = false;

      // Extract JSON if AI decided it has all info
      const jsonMatch = aiResponse.match(/\[JSON_DATA:\s*({.*?})\s*\]/is);
      if (jsonMatch) {
        try {
          const extractedData = JSON.parse(jsonMatch[1]);
          console.log(`\n📥 [AI EXTRACTED DATA]:`, extractedData);
          
          // Save to Azure PostgreSQL!
          await this.saveWorkerToDatabase(callerPhone, extractedData);
          
          isDone = true;
          // Remove the JSON block so Twilio doesn't speak "bracket bracket Name"
          aiResponse = aiResponse.replace(/\[JSON_DATA:\s*({.*?})\s*\]/is, '').trim();
          
        } catch (e) {
          console.error('[JSON Parse Error]', e);
        }
      }

      conversations[callSid].push({ role: 'assistant', content: aiResponse });
      console.log(`🤖 [AI Response]: ${aiResponse}`);

      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, aiResponse);

      if (!isDone) {
        response.gather({
          input: ['speech'],
          action: `/voice/respond?callSid=${callSid}`,
          method: 'POST',
          language: 'hi-IN',
          speechTimeout: 'auto',
          timeout: 10,
        });
      } else {
        console.log(`✅ [Registration Complete] Call dropped automatically.`);
        delete conversations[callSid];
      }

    } catch (err) {
      console.error('[Server Error]', err);
      response.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Maafi kijiye, kuch takneeki gadbad ho gayi. Thodi der baad call karein.');
    }

    res.type('text/xml');
    res.send(response.toString());
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
    } catch (error) {
      console.error(`\n❌ [DATABASE ERROR] Could not save to Azure DB (Check IP Firewall).`, error.message);
    }
  }
}
