# E-Chowk Architecture

## 1. Architecture goal

E-Chowk is a multi-channel AI labour marketplace. Phone, mobile and web are interfaces over one backend and one source of truth.

## 2. Components

### Clients
- Flutter mobile app
- Responsive web client
- Phone/telephony interface
- Future WhatsApp interface

### Backend
NestJS modules should be separated by business capability:

~~~text
auth
users
workers
employers
jobs
applications
matching
notifications
voice
agent
audit
health
~~~

The current repository already has authentication and voice modules. New marketplace capabilities should be added as independent modules instead of growing one controller indefinitely.

### Agent service

The agent is responsible for:
- understanding natural language
- maintaining conversational context
- deciding when to call a tool
- asking clarification questions
- communicating tool results naturally

The agent is NOT responsible for:
- direct SQL
- authorization decisions
- payment settlement
- irreversible actions without confirmation
- inventing unavailable data

## 3. Tool layer

Recommended boundary:

~~~text
LLM
 ↓
Agent Tool
 ↓
Application Service
 ↓
Repository / Database
~~~

Example:

~~~text
search_jobs()
  → JobService.search()
  → validated SQL query
  → ranked Job[]
  → Agent
  → Hindi response
~~~

## 4. Memory

Use three layers:

1. **Turn memory** — current user/assistant messages.
2. **Session memory** — the current phone/app conversation.
3. **Durable profile memory** — verified user facts stored in PostgreSQL.

Do not blindly store every model-generated statement as a fact. Profile changes should be explicitly extracted, validated and confirmed where needed.

## 5. Data model

Core entities:

~~~text
User
 ├── WorkerProfile
 └── EmployerProfile

Employer
 └── Job
       └── Application
              └── Worker

Job
 ├── Assignment
 ├── StatusHistory
 └── Rating

User
 ├── Conversation
 ├── Notification
 └── AuditEvent
~~~

The existing users, jobs and job_applications tables are the starting point. Evolve them through migrations rather than destructive manual edits.

## 6. Identity and authorization

- Internal UUID is the primary identifier.
- Phone number is a unique verified contact/login attribute.
- Roles: worker, employer, admin.
- Backend enforces permissions.
- Client-side role checks are UX only, never security boundaries.

## 7. Voice architecture

Current prototype:

~~~text
Twilio
 ↓
SpeechResult
 ↓
Groq LLM
 ↓
regex JSON extraction
 ↓
PostgreSQL
 ↓
Twilio TTS
~~~

Target architecture:

~~~text
Phone
 ↓
Telephony / media stream
 ↓
Streaming STT
 ↓
E-Chowk Agent
 ├── session memory
 ├── user profile
 └── tools
       ↓
    Backend
       ↓
 PostgreSQL
       ↓
Tool result
 ↓
Agent
 ↓
Streaming TTS
 ↓
Phone
~~~

The prototype should be kept working while the target architecture is implemented incrementally.

## 8. API principles

- Version public APIs.
- Validate every request.
- Return consistent error objects.
- Never expose database exceptions directly.
- Add request IDs.
- Apply rate limits to auth, voice and sensitive endpoints.
- Keep provider credentials server-side.
- Use idempotency for actions that may be retried.

## 9. Observability

Every important agent action should be traceable:

~~~text
request_id
user_id
session_id
agent_version
model
tool_name
tool_arguments_hash / safe metadata
tool_result_status
latency
error_code
~~~

Avoid logging raw phone numbers, OTPs, credentials or unnecessary sensitive conversation content.

## 10. Security baseline

- Secrets only through environment/secret manager.
- OTPs must expire and be single-use.
- Authentication endpoints rate-limited.
- Authorization enforced server-side.
- Input validation on every API boundary.
- SQL parameterization/ORM.
- Sensitive logs redacted.
- Webhooks verified where supported.
- CORS configured intentionally.
- Production database not exposed publicly without controls.

## 11. Provider abstraction

Avoid hard-coding the product to one AI/telephony provider.

Create interfaces around:
- LLM
- STT
- TTS
- Telephony
- WhatsApp
- Payment

This allows provider evaluation without rewriting business logic.

## 12. AI evaluation

Maintain a versioned dataset containing:
- Hindi
- Hinglish
- incomplete answers
- corrections
- ambiguous skills
- city variations
- background noise transcripts
- low-confidence speech
- job requests
- cancellation requests
- adversarial/unsafe requests

Measure:
- intent accuracy
- slot/entity accuracy
- tool-call accuracy
- task completion
- unnecessary questions
- hallucination rate
- latency
- failure recovery

## 13. Golden rule

**The LLM decides what the user means. The backend decides what the system is allowed to do.**

## Implemented development modules

The current development branch includes these backend boundaries:

- auth — OTP, UUID identity, signed access tokens, role selection and guards
- users — protected profile and availability APIs
- jobs — job creation/search, applications and lifecycle transitions
- matching — explainable candidate ranking
- agent — Groq tool-calling agent with confirmation policy
- voice — Twilio phone integration and signature validation
- whatsapp — Twilio WhatsApp channel using the same agent
- notifications — user notification inbox
- trust — post-completion ratings
- payments — payment ledger abstraction
- audit — consequential action audit events
- health — operational health endpoint

External provider credentials and production infrastructure remain environment/deployment concerns.
