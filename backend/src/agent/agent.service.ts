import { BadRequestException, Injectable } from '@nestjs/common';
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

  async chatForPhone(phone: string, message: string) {
    const user = await this.users.findOrCreateByPhone(phone);
    return this.chat(user.id, message);
  }

  async chat(userId: string, message: string) {
    if (!process.env.GROQ_API_KEY) throw new BadRequestException('AI service is not configured');

    let session = await this.sessions.findOne({
      where: { user_id: userId, channel: 'app' },
      order: { updated_at: 'DESC' },
    });
    const history: ChatMessage[] = Array.isArray(session?.messages)
      ? (session!.messages as ChatMessage[])
      : [];
    if (!history.length) history.push({ role: 'system', content: this.systemPrompt() });
    if (!session) {
      session = this.sessions.create({
        user_id: userId,
        channel: 'app',
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

  private tools() {
    return [
      { type: 'function', function: { name: 'get_current_user', description: 'Get the current user profile.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
      { type: 'function', function: { name: 'update_worker_profile', description: 'Update the current worker profile. Use only fields the user explicitly supplied.', parameters: { type: 'object', properties: { full_name: { type: 'string' }, skill_category: { type: 'string' }, current_location: { type: 'string' }, daily_wage: { type: 'number' }, is_available: { type: 'boolean' } }, additionalProperties: false } } },
      { type: 'function', function: { name: 'update_availability', description: 'Change worker availability.', parameters: { type: 'object', properties: { is_available: { type: 'boolean' } }, required: ['is_available'], additionalProperties: false } } },
      { type: 'function', function: { name: 'search_jobs', description: 'Search open jobs by skill and/or location.', parameters: { type: 'object', properties: { skill: { type: 'string' }, location: { type: 'string' }, limit: { type: 'integer' } }, additionalProperties: false } } },
      { type: 'function', function: { name: 'get_job', description: 'Get a job by ID.', parameters: { type: 'object', properties: { job_id: { type: 'string' } }, required: ['job_id'], additionalProperties: false } } },
      { type: 'function', function: { name: 'apply_for_job', description: 'Apply for a job ONLY after the user explicitly confirms the application.', parameters: { type: 'object', properties: { job_id: { type: 'string' }, confirmed: { type: 'boolean' } }, required: ['job_id', 'confirmed'], additionalProperties: false } } },
      { type: 'function', function: { name: 'get_application_status', description: 'Get current application status for the worker.', parameters: { type: 'object', properties: { job_id: { type: 'string' } }, required: ['job_id'], additionalProperties: false } } },
      { type: 'function', function: { name: 'create_job', description: 'Create an employer job ONLY after the employer explicitly confirms all details.', parameters: { type: 'object', properties: { required_skill: { type: 'string' }, location: { type: 'string' }, description: { type: 'string' }, offered_wage: { type: 'number' }, duration_days: { type: 'integer' }, confirmed: { type: 'boolean' } }, required: ['required_skill', 'location', 'confirmed'], additionalProperties: false } } },
    ];
  }

  private async executeTool(userId: string, name: string, args: any) {
    switch (name) {
      case 'get_current_user': return this.users.getById(userId);
      case 'update_worker_profile': return this.users.update(userId, args);
      case 'update_availability': return this.users.update(userId, { is_available: args.is_available });
      case 'search_jobs': return this.jobs.search(args);
      case 'get_job': return this.jobs.get(args.job_id);
      case 'get_application_status': return this.jobs.applicationStatus(userId, args.job_id);
      case 'apply_for_job':
        if (args.confirmed !== true) return { requires_confirmation: true, message: 'Ask the worker to explicitly confirm before applying.' };
        return this.jobs.apply(userId, args.job_id);
      case 'create_job':
        if (args.confirmed !== true) return { requires_confirmation: true, message: 'Ask the employer to explicitly confirm before publishing.' };
        return this.jobs.create(userId, args);
      default: throw new BadRequestException('Unknown AI tool');
    }
  }

  private systemPrompt() {
    return `You are E-Chowk's Hindi/Hinglish marketplace AI agent.
Understand the user's intent and use tools instead of inventing data.
The backend is authoritative: never claim a job/profile change happened unless a tool returned success.
Keep responses concise and natural for Indian users.
For consequential actions (applying to a job or publishing a job), collect missing details, summarize them, ask for explicit confirmation, and only then call the tool with confirmed=true.
Never expose internal IDs unless needed.
If information is missing, ask one clear question at a time.
`;
  }
}
