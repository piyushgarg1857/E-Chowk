import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import Groq from 'groq-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobsService } from '../jobs/jobs.service';
import { UsersService } from '../users/users.service';
import { ConversationSession } from './conversation-session.entity';

type ChatMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string; tool_call_id?: string; name?: string };

@Injectable()
export class AgentService {
  private readonly groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
  constructor(
    private readonly jobs: JobsService,
    private readonly users: UsersService,
    @InjectRepository(ConversationSession)
    private readonly sessions: Repository<ConversationSession>,
  ) {}

  async chatForPhone(phone: string, message: string, channel = 'voice') {
    const user = await this.users.findOrCreateByPhone(phone);

    // Fast entity extraction safety net
    const updatePayload: any = {};
    const nameMatch = message.match(/(?:mera naam|naam|main)\s+([A-Za-z\u0900-\u097F]+)(?:\s+hoon|\s+hai|\s+bol|$)/i);
    if (nameMatch && nameMatch[1] && !['ek', 'karigar', 'thekedar', 'worker', 'employer', 'jaipur', 'delhi', 'kaam'].includes(nameMatch[1].toLowerCase())) {
      updatePayload.full_name = nameMatch[1].trim();
    }

    const detectedSkill = this.normalizeSkill(message);
    if (detectedSkill && detectedSkill.toLowerCase() !== message.toLowerCase().trim()) {
      updatePayload.skill_category = detectedSkill;
    }

    const cityMatch = message.match(/(jaipur|delhi|mumbai|ahmedabad|kota|jodhpur|udaipur|ajmer|bikaner|alwar|sikar|noida|gurugram|ghaziabad|faridabad|lucknow|kanpur|patna|bhopal|indore|जयपुर|दिल्ली|मुंबई|कोटा|जोधपुर|उदयपुर|अजमेर)/i);
    if (cityMatch && cityMatch[1]) {
      const cityMap: Record<string, string> = {
        'जयपुर': 'Jaipur', 'दिल्ली': 'Delhi', 'मुंबई': 'Mumbai', 'कोटा': 'Kota',
        'जोधपुर': 'Jodhpur', 'उदयपुर': 'Udaipur', 'अजमेर': 'Ajmer'
      };
      const rawCity = cityMatch[1];
      updatePayload.current_location = cityMap[rawCity] || (rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase());
    }

    if (/kaam chahiye|job chahiye|naukri chahiye|rojgar|karigar|majdoor|mistri/i.test(message)) {
      updatePayload.role = 'worker';
    } else if (/kaam karwana|worker chahiye|bande chahiye|thekedar|hire karna|mistri chahiye/i.test(message)) {
      updatePayload.role = 'employer';
    }

    if (Object.keys(updatePayload).length > 0) {
      console.log(`[Fast Extraction] Updating user ${user.id} (${phone}) with:`, updatePayload);
      try {
        await this.users.update(user.id, updatePayload);
      } catch (err: any) {
        console.error('[Fast Extraction Error]', err.message);
      }
    }

    return this.chat(user.id, message, channel);
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.sessions.findOne({ where: { id: sessionId, user_id: userId } });
    if (!session) throw new NotFoundException('Conversation session not found');
    return session;
  }

  async chatInSession(userId: string, sessionId: string, message: string) {
    await this.getSession(userId, sessionId);
    return this.chat(userId, message, 'app', sessionId);
  }

  async chat(userId: string, message: string, channel = 'app', sessionId?: string) {
    if (!process.env.GROQ_API_KEY) throw new BadRequestException('AI service is not configured');

    let session = await this.sessions.findOne({
      where: sessionId ? { id: sessionId, user_id: userId } : { user_id: userId, channel },
      order: { updated_at: 'DESC' },
    });
    const history: ChatMessage[] = Array.isArray(session?.messages)
      ? (session!.messages as ChatMessage[])
      : [];
    if (!history.length) history.push({ role: 'system', content: this.systemPrompt() });
    if (!session) {
      session = this.sessions.create({
        user_id: userId,
        channel,
        state: {},
        messages: [],
      });
    }
    history.push({ role: 'user', content: message });

    for (let step = 0; step < 4; step++) {
      const completion: any = await this.groq.chat.completions.create({
        model: process.env.GROQ_AGENT_MODEL?.trim() || 'openai/gpt-oss-20b',
        messages: history as any,
        tools: this.tools(),
        tool_choice: 'auto',
        temperature: 0.2,
        max_tokens: 500,
      });

      const assistant = completion.choices?.[0]?.message;
      if (!assistant) throw new BadRequestException('AI returned no response');
      history.push(assistant);

      if (!assistant.tool_calls?.length) {
        session.messages = history.slice(-20);
        session.last_message_at = new Date();
        await this.sessions.save(session);
        return { reply: assistant.content ?? '', session_id: session.id };
      }

      for (const call of assistant.tool_calls) {
        const result = await this.executeTool(userId, call.function.name, JSON.parse(call.function.arguments || '{}'));
        history.push({
          role: 'tool',
          tool_call_id: call.id,
          name: call.function.name,
          content: JSON.stringify(result),
        });
      }
    }

    session.messages = history.slice(-20);
    session.last_message_at = new Date();
    await this.sessions.save(session);
    return {
      reply: 'Maaf kijiye, main is request ko abhi complete nahi kar paaya. Kripya dobara batayein.',
      session_id: session.id,
    };
  }

  private normalizeSkill(input: string): string {
    const raw = (input || '').trim().toLowerCase();
    const map: Record<string, string> = {
      'carpenter': 'Carpenter',
      'बढ़ई': 'Carpenter',
      'कारपेंटर': 'Carpenter',
      'लकड़ी': 'Carpenter',
      'furniture': 'Carpenter',
      'plumber': 'Plumber',
      'प्लंबर': 'Plumber',
      'नल': 'Plumber',
      'पाइप': 'Plumber',
      'electrician': 'Electrician',
      'इलेक्ट्रीशियन': 'Electrician',
      'इलेक्ट्रिशियन': 'Electrician',
      'बिजली': 'Electrician',
      'वायरिंग': 'Electrician',
      'painter': 'Painter',
      'पेंटर': 'Painter',
      'रंगसाज': 'Painter',
      'रंगाई': 'Painter',
      'रंग': 'Painter',
      'mason': 'Mason',
      'राजमिस्त्री': 'Mason',
      'मिस्त्री': 'Mason',
      'चिनाई': 'Mason',
      'driver': 'Driver',
      'ड्राइवर': 'Driver',
      'चालक': 'Driver',
      'गाड़ी': 'Driver',
      'helper': 'Helper',
      'हेल्पर': 'Helper',
      'मजदूर': 'Helper',
      'मजदूरी': 'Helper',
      'लेबर': 'Helper',
      'labor': 'Helper',
      'welder': 'Welder',
      'वेल्डर': 'Welder',
      'वेल्डिंग': 'Welder',
      'mechanic': 'Mechanic',
      'मैकेनिक': 'Mechanic',
      'cleaner': 'Cleaner',
      'सफाईकर्मी': 'Cleaner',
      'सफाई': 'Cleaner',
      'झाड़ू': 'Cleaner',
    };
    for (const [key, val] of Object.entries(map)) {
      if (raw.includes(key) || key.includes(raw)) return val;
    }
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  private tools() {
    return [
      { type: 'function', function: { name: 'get_current_user', description: 'Get the current user profile.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
      { type: 'function', function: { name: 'update_worker_profile', description: 'Update user profile (name, skill, city/location, wage, availability, role). Use whenever user shares or updates their info.', parameters: { type: 'object', properties: { full_name: { type: 'string' }, skill_category: { type: 'string' }, current_location: { type: 'string' }, daily_wage: { type: 'number' }, is_available: { type: 'boolean' }, role: { type: 'string', enum: ['worker', 'employer'] } }, additionalProperties: false } } },
      { type: 'function', function: { name: 'set_user_role', description: 'Switch user role to worker (finding work) or employer (hiring workers).', parameters: { type: 'object', properties: { role: { type: 'string', enum: ['worker', 'employer'] } }, required: ['role'], additionalProperties: false } } },
      { type: 'function', function: { name: 'update_availability', description: 'Change worker availability.', parameters: { type: 'object', properties: { is_available: { type: 'boolean' } }, required: ['is_available'], additionalProperties: false } } },
      { type: 'function', function: { name: 'search_jobs', description: 'Search open jobs by skill and/or location.', parameters: { type: 'object', properties: { skill: { type: 'string' }, location: { type: 'string' }, limit: { type: 'integer' } }, additionalProperties: false } } },
      { type: 'function', function: { name: 'get_job', description: 'Get a job by ID.', parameters: { type: 'object', properties: { job_id: { type: 'string' } }, required: ['job_id'], additionalProperties: false } } },
      { type: 'function', function: { name: 'apply_for_job', description: 'Apply for a job ONLY after the user explicitly confirms the application.', parameters: { type: 'object', properties: { job_id: { type: 'string' }, confirmed: { type: 'boolean' } }, required: ['job_id', 'confirmed'], additionalProperties: false } } },
      { type: 'function', function: { name: 'get_application_status', description: 'Get current application status for the worker.', parameters: { type: 'object', properties: { job_id: { type: 'string' } }, required: ['job_id'], additionalProperties: false } } },
      { type: 'function', function: { name: 'decide_application', description: 'Accept or reject a worker application. ONLY after the employer explicitly confirms.', parameters: { type: 'object', properties: { application_id: { type: 'string' }, status: { type: 'string', enum: ['accepted', 'rejected'] }, confirmed: { type: 'boolean' } }, required: ['application_id', 'status', 'confirmed'], additionalProperties: false } } },
      { type: 'function', function: { name: 'start_job', description: 'Start an assigned job. ONLY after the worker explicitly confirms.', parameters: { type: 'object', properties: { job_id: { type: 'string' }, confirmed: { type: 'boolean' } }, required: ['job_id', 'confirmed'], additionalProperties: false } } },
      { type: 'function', function: { name: 'complete_job', description: 'Complete an in-progress job. ONLY after the worker explicitly confirms.', parameters: { type: 'object', properties: { job_id: { type: 'string' }, confirmed: { type: 'boolean' } }, required: ['job_id', 'confirmed'], additionalProperties: false } } },
      { type: 'function', function: { name: 'create_job', description: 'Create an employer job ONLY after the employer explicitly confirms all details.', parameters: { type: 'object', properties: { required_skill: { type: 'string' }, location: { type: 'string' }, description: { type: 'string' }, offered_wage: { type: 'number' }, duration_days: { type: 'integer' }, confirmed: { type: 'boolean' } }, required: ['required_skill', 'location', 'confirmed'], additionalProperties: false } } },
    ];
  }

  private async executeTool(userId: string, name: string, args: any) {
    switch (name) {
      case 'get_current_user': return this.users.getById(userId);
      case 'update_worker_profile': {
        const payload: any = {};
        const fullName = args.full_name || args.name;
        if (fullName) payload.full_name = fullName;

        const skill = args.skill_category || args.skill;
        if (skill) payload.skill_category = this.normalizeSkill(skill);

        const location = args.current_location || args.city || args.location;
        if (location) {
          const cityMap: Record<string, string> = {
            'जयपुर': 'Jaipur', 'दिल्ली': 'Delhi', 'मुंबई': 'Mumbai', 'कोटा': 'Kota',
            'जोधपुर': 'Jodhpur', 'उदयपुर': 'Udaipur', 'अजमेर': 'Ajmer'
          };
          payload.current_location = cityMap[location] || (location.charAt(0).toUpperCase() + location.slice(1));
        }

        if (args.daily_wage !== undefined || args.wage !== undefined) {
          payload.daily_wage = Number(args.daily_wage || args.wage);
        }
        if (args.is_available !== undefined) {
          payload.is_available = Boolean(args.is_available);
        }
        if (args.role) {
          payload.role = args.role;
        }

        console.log(`[update_worker_profile tool] User ${userId}:`, payload);
        return this.users.update(userId, payload);
      }
      case 'set_user_role': return this.users.setRole(userId, args.role);
      case 'update_availability': return this.users.update(userId, { is_available: args.is_available });
      case 'search_jobs': {
        if (args.skill) args.skill = this.normalizeSkill(args.skill);
        return this.jobs.search(args);
      }
      case 'get_job': return this.jobs.get(args.job_id);
      case 'get_application_status': return this.jobs.applicationStatus(userId, args.job_id);
      case 'apply_for_job':
        if (args.confirmed !== true) return { requires_confirmation: true, message: 'Ask the worker to explicitly confirm before applying.' };
        return this.jobs.apply(userId, args.job_id);
      case 'decide_application':
        if (args.confirmed !== true) return { requires_confirmation: true, message: 'Ask the employer to explicitly confirm the application decision.' };
        return this.jobs.decide(userId, args.application_id, args.status);
      case 'start_job':
        if (args.confirmed !== true) return { requires_confirmation: true, message: 'Ask the worker to explicitly confirm starting the job.' };
        return this.jobs.start(userId, args.job_id);
      case 'complete_job':
        if (args.confirmed !== true) return { requires_confirmation: true, message: 'Ask the worker to explicitly confirm completing the job.' };
        return this.jobs.complete(userId, args.job_id);
      case 'create_job':
        if (args.confirmed !== true) return { requires_confirmation: true, message: 'Ask the employer to explicitly confirm before publishing.' };
        if (args.required_skill) args.required_skill = this.normalizeSkill(args.required_skill);
        return this.jobs.create(userId, args);
      default: throw new BadRequestException('Unknown AI tool');
    }
  }

  private systemPrompt() {
    return `You are E-Chowk's Hindi/Hinglish marketplace AI voice and chat agent.
Understand the user's intent and ALWAYS use tools instead of inventing data.
The backend is authoritative: never claim a profile/job change happened unless a tool returned success.
Keep responses concise, warm, and natural in simple conversational Hindi (1-2 sentences for phone calls).

RULES FOR PROFILE AND ROLE UPDATES:
1. When the user tells you their name, skill, or city/location, immediately call 'update_worker_profile' with the extracted full_name, skill_category, and current_location.
2. If the user indicates they want to work, are seeking jobs, or are registering as a worker/karigar, call 'update_worker_profile' (or 'set_user_role') with role='worker'.
3. If the user wants to hire workers, post jobs, or is an employer/thekedar, call 'set_user_role' with role='employer'.
4. For skills, normalize to standard English names: Carpenter, Electrician, Plumber, Painter, Mason, Driver, Helper, Welder, Mechanic, Cleaner.
5. For locations, normalize to clean city name (e.g. Jaipur, Delhi, Mumbai).

For consequential actions (applying for jobs, publishing jobs, accepting/rejecting applications, starting/completing jobs), collect missing details, summarize, ask for explicit confirmation, and only call the tool when confirmed=true.
Never treat vague replies like "okay" as confirmation unless they clearly refer to the immediately proposed action.
If information is missing, ask one clear question at a time.
`;
  }
}
