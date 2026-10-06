# E-Chowk Development Plan

> Branch: development  
> Purpose: Professional product development, integration, testing and validation before promotion to main.

## 1. Product objective

E-Chowk is an AI-first labour marketplace designed around one core idea:

**A worker or employer should be able to complete useful marketplace tasks through natural conversation, a mobile/web interface, or a phone call.**

The system must support three access channels backed by one platform:

1. **Phone AI Agent** — inbound/outbound phone calls using natural Hindi/Hinglish.
2. **Mobile App** — Flutter experience for workers and employers.
3. **Web** — responsive operational/admin/employer experience.

All channels use the same identity, profile, jobs, matching, application, notification and audit systems.

## 2. Non-negotiable product principles

- **AI is an agent, not a form parser.** The LLM understands intent, maintains context and calls backend tools.
- **Backend owns truth.** The LLM never directly writes SQL or changes protected data.
- **Tool calling over regex JSON.** Structured actions must use validated tools/functions.
- **One identity.** Phone number is a verified login/contact attribute; internal UUID is the primary identity.
- **Hindi-first, not Hindi-only.** Support simple Hindi/Hinglish first and design the system for regional languages.
- **Human confirmation for consequential actions.** Hiring, cancellation, wage/payment changes and profile-critical changes require confirmation.
- **Every AI action is observable.** Store traceable session/action/audit metadata without unnecessarily storing sensitive audio/transcripts.
- **Production status must be honest.** A feature is not "done" until its acceptance criteria and tests pass.

## 3. Target architecture

~~~text
                         E-CHOWK PLATFORM
                              |
        +---------------------+---------------------+
        |                     |                     |
     PHONE AI               MOBILE                 WEB
   Twilio/Telephony        Flutter            Responsive UI
        |                     |                     |
        +---------------------+---------------------+
                              |
                         API / BFF Layer
                         NestJS Backend
                              |
          +-------------------+-------------------+
          |                   |                   |
       AI Agent          Marketplace          Identity
          |                   |                   |
     LLM + Tools       Jobs/Matching        OTP/Auth/RBAC
          |                   |                   |
          +-------------------+-------------------+
                              |
                       PostgreSQL Database
                              |
              +---------------+---------------+
              |               |               |
          Notifications     Observability    Audit
~~~

### AI Agent loop

~~~text
User speech/message
      ↓
STT / text input
      ↓
Conversation state + user profile
      ↓
LLM / Agent
      ↓
Intent + tool selection
      ↓
Validated backend tool
      ↓
Database / marketplace service
      ↓
Tool result
      ↓
LLM generates natural response
      ↓
TTS / text response
~~~

## 4. Canonical user journeys

### Journey A — Worker phone onboarding

~~~text
Call E-Chowk number
→ Verify/identify phone
→ AI greets worker
→ Collect name
→ Collect skill(s)
→ Collect city/location
→ Collect wage expectation
→ Collect availability
→ Read summary back
→ Worker confirms/corrects
→ save_worker_profile()
→ Registration complete
~~~

Acceptance:
- Worker can speak naturally instead of following rigid prompts.
- Missing/uncertain information is clarified.
- AI never invents profile values.
- Worker hears a confirmation before final save.
- Existing worker is recognized and offered update flow.

### Journey B — Worker finds a job by phone

Example:

> "Mujhe kal Jaipur mein plumber ka kaam chahiye."

Agent should infer:
- intent = find_job
- skill = plumber
- location = Jaipur
- availability/date = tomorrow

Then:

~~~text
search_jobs()
→ rank matches
→ tell top matches
→ worker selects
→ apply_for_job()
→ confirmation
→ notification
~~~

### Journey C — Employer creates a job

~~~text
Employer login
→ Create Job
→ skill
→ location
→ wage
→ date/duration
→ description
→ review
→ publish
→ matching engine
~~~

The same job must be creatable through web/app and eventually phone AI.

### Journey D — Employer hires worker

~~~text
Job
→ matching candidates
→ worker profile
→ select worker
→ send request
→ worker accepts/rejects
→ job assigned
→ both sides notified
~~~

### Journey E — Completion

~~~text
Assigned
→ worker starts/accepts work
→ job completed
→ employer confirms
→ worker/employer rating
→ payment record
→ audit trail
~~~

## 5. Development phases

### Phase 0 — Foundation & safety
- [ ] Define environments: local / staging / production
- [ ] Define environment variables and secrets policy
- [ ] Add API error contract
- [ ] Add structured logging
- [ ] Add request validation
- [ ] Add RBAC
- [ ] Add database migrations strategy
- [ ] Remove hard-coded production-like URLs/secrets
- [ ] Establish branch/PR rules

**Exit criteria:** application can run locally from documented setup and sensitive configuration is environment-driven.

### Phase 1 — Identity & profile
- [ ] Phone OTP authentication
- [ ] User UUID identity
- [ ] Worker profile CRUD
- [ ] Employer profile CRUD
- [ ] Skill taxonomy
- [ ] Location model
- [ ] Availability model
- [ ] Profile confirmation
- [ ] Profile edit through app/web/API

**Exit criteria:** one verified phone maps to one account and profile data is consistent across all clients.

### Phase 2 — AI Agent Core
- [ ] Agent service abstraction
- [ ] Conversation/session model
- [ ] System prompt/version management
- [ ] Tool registry
- [ ] Tool schemas with validation
- [ ] Tool authorization
- [ ] Conversation memory
- [ ] Durable user profile memory
- [ ] Confirmation policy
- [ ] Fallback/error recovery
- [ ] AI evaluation dataset

**Core tools:**
- [ ] get_current_user()
- [ ] get_worker_profile()
- [ ] update_worker_profile()
- [ ] search_jobs()
- [ ] get_job()
- [ ] create_job()
- [ ] apply_for_job()
- [ ] get_application_status()
- [ ] accept_job_request()
- [ ] reject_job_request()
- [ ] update_availability()

**Exit criteria:** AI can complete a multi-turn task by calling tools, not by emitting regex-parsed JSON.

### Phase 3 — Phone Voice Agent
- [ ] Inbound phone number
- [ ] Outbound calling
- [ ] STT
- [ ] LLM agent
- [ ] TTS
- [ ] Streaming/realtime path evaluation
- [ ] Call session persistence
- [ ] Hang-up/retry handling
- [ ] Silence handling
- [ ] Hindi/Hinglish evaluation
- [ ] Noise/accent testing
- [ ] Consent/privacy notice

**Exit criteria:** a worker can complete registration and a simple job-search task end-to-end by phone.

### Phase 4 — Marketplace
- [ ] Job creation
- [ ] Job search
- [ ] Skill/location/availability filters
- [ ] Candidate ranking
- [ ] Applications
- [ ] Employer request
- [ ] Worker accept/reject
- [ ] Assignment state machine
- [ ] Cancellation
- [ ] Completion
- [ ] Ratings

**Exit criteria:** Worker → Job → Employer → Hire → Complete works without manual database intervention.

### Phase 5 — Mobile app
- [ ] Production API configuration
- [ ] Worker dashboard
- [ ] Worker profile
- [ ] Job feed
- [ ] Job details
- [ ] Applications
- [ ] Requests
- [ ] Job status
- [ ] Notifications
- [ ] Employer dashboard
- [ ] Create/manage jobs
- [ ] Candidate matching
- [ ] Accessibility and Hindi-first UX

**Exit criteria:** core marketplace journeys are usable without developer tools.

### Phase 6 — Web
- [ ] Responsive web app
- [ ] Employer console
- [ ] Worker/admin operations
- [ ] Job management
- [ ] Candidate search
- [ ] AI conversation/interaction history where appropriate
- [ ] Role-based access
- [ ] Audit views

**Exit criteria:** web can perform all operational marketplace functions required for MVP.

### Phase 7 — WhatsApp
- [ ] WhatsApp Cloud API integration
- [ ] Identity linking
- [ ] Worker notifications
- [ ] Job alerts
- [ ] Accept/reject actions
- [ ] Availability updates
- [ ] Fallback to phone/app

**Exit criteria:** WhatsApp is an additional channel over the same backend, not a separate database/workflow.

### Phase 8 — Matching intelligence

Start rules-based, then evolve.

**V1 score:**
~~~text
match_score =
  skill_match
+ location_match
+ availability_match
+ wage_compatibility
+ distance
+ rating
+ reliability
~~~

- [ ] Explainable ranking
- [ ] Distance calculation
- [ ] Availability fit
- [ ] Skill synonym normalization
- [ ] Worker reliability signal
- [ ] Feedback loop
- [ ] Offline evaluation set

**Exit criteria:** top candidates are relevant and ranking is explainable.

### Phase 9 — Trust, payments & production
- [ ] Verification strategy
- [ ] Consent/privacy flows
- [ ] Abuse prevention
- [ ] Rate limiting
- [ ] Fraud controls
- [ ] Payment provider evaluation
- [ ] Payment ledger
- [ ] Refund/dispute model
- [ ] Monitoring/alerts
- [ ] Backup/restore
- [ ] Production deployment
- [ ] Security review
- [ ] Load testing

**Exit criteria:** MVP is safe to expose to controlled real users.

### Phase 10 — AI specialization

Do this only after real usage data exists.

- [ ] Collect consented conversations
- [ ] Remove/redact sensitive data
- [ ] Label intents/entities/tool outcomes
- [ ] Build Hindi/Hinglish evaluation set
- [ ] Measure baseline model
- [ ] Fine-tune only if it beats the baseline
- [ ] Regression evaluation
- [ ] Model/version rollback

**Important:** Do not train an LLM from scratch for E-Chowk. First optimize the agent, tools, memory, retrieval and prompts. Fine-tune only when evidence shows a benefit.

## 5.5 Execution status — development branch

The planned engineering phases have now been implemented to the extent possible inside the repository:

- **Phase 0 — Foundation:** implemented; CI/release hardening remains deployment-specific.
- **Phase 1 — Identity & profile:** implemented with phone OTP, UUID identity, role selection, protected profile APIs.
- **Phase 2 — AI Agent Core:** implemented with Groq tool calling, session memory, tool authorization boundaries, confirmation policy and evaluation dataset.
- **Phase 3 — Phone Voice Agent:** implemented with Twilio webhooks, Hindi speech flow, agent-backed phone path and webhook signature validation.
- **Phase 4 — Marketplace:** implemented with jobs, applications, accept/reject, start, completion, notifications, matching and ratings.
- **Phase 5 — Mobile:** authenticated API session, configurable API URL, worker availability persistence and real worker registration call.
- **Phase 6 — Web:** Flutter web remains the shared client surface; production deployment/operational console hardening remains environment-specific.
- **Phase 7 — WhatsApp:** implemented as a Twilio webhook channel over the same Agent + backend.
- **Phase 8 — Matching:** explainable V1 skill/location/rating scoring implemented.
- **Phase 9 — Trust/payments/production:** audit logging, notifications, ratings and payment ledger abstraction implemented; real payment settlement, load testing, backups and deployment require external infrastructure.
- **Phase 10 — AI specialization:** evaluation assets and specialization policy implemented; fine-tuning is intentionally deferred until real consented data exists.

The repository must not claim external infrastructure is live until the production release gate is actually passed.

## 6. AI tool contract

The LLM must never directly execute SQL.

Example:

~~~json
{
  "name": "search_jobs",
  "description": "Find jobs matching a worker's requirements",
  "parameters": {
    "skill": "string",
    "location": "string",
    "available_from": "date",
    "max_distance_km": "number"
  }
}
~~~

Backend validates:
1. authenticated user
2. role
3. schema
4. permissions
5. business rules
6. database operation

Then returns a typed result to the agent.

## 7. State machines

### Job

~~~text
DRAFT → OPEN → ASSIGNED → IN_PROGRESS → COMPLETED
           ↓        ↓           ↓
       CANCELLED  CANCELLED   CANCELLED
~~~

### Application

~~~text
PENDING → ACCEPTED
   ↓
REJECTED

ACCEPTED → COMPLETED
~~~

All state transitions must be validated by the backend.

## 8. Testing strategy

Every phase uses the same gate.

### Code
- [ ] Build passes
- [ ] Lint/type checks pass
- [ ] Unit tests pass
- [ ] API tests pass

### Product
- [ ] Happy path works
- [ ] Invalid input handled
- [ ] Retry works
- [ ] Unauthorized action blocked
- [ ] Data persisted correctly

### AI
- [ ] Intent accuracy measured
- [ ] Entity extraction measured
- [ ] Tool selection measured
- [ ] Hallucination cases tested
- [ ] Confirmation behavior tested
- [ ] Hindi/Hinglish tested
- [ ] Noise/ASR errors tested

### Release gate
- [ ] No P0/P1 defects
- [ ] Acceptance criteria checked
- [ ] Regression suite passed
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Rollback path known

## 9. Definition of Done

A feature is **DONE** only when:

- [ ] Code exists
- [ ] API contract documented
- [ ] Database changes migrated
- [ ] Authentication/authorization checked
- [ ] UI connected
- [ ] Error states handled
- [ ] Unit/integration tests added
- [ ] AI behavior evaluated if applicable
- [ ] Manual acceptance test passed
- [ ] README/status updated
- [ ] No secrets committed
- [ ] Changes reviewed
- [ ] Feature can be demonstrated end-to-end

## 10. Current baseline

The development branch starts from the current main implementation.

Already present:
- [x] Flutter application shell
- [x] Phone OTP prototype
- [x] Worker/employer role selection
- [x] Worker dashboard prototype
- [x] Employer worker-discovery prototype
- [x] NestJS backend
- [x] PostgreSQL schema
- [x] Twilio voice integration prototype
- [x] Groq LLM integration prototype
- [x] Hindi TTS/STT flow prototype
- [x] Worker persistence from voice flow

Not yet considered production-complete:
- [ ] Proper LLM tool calling
- [ ] Durable agent memory
- [ ] Complete job marketplace workflow
- [ ] Robust matching engine
- [ ] Production authentication
- [ ] Web production workflow
- [ ] WhatsApp integration
- [ ] Payments
- [ ] Production observability/security
- [ ] Full AI evaluation suite

## 11. Branch policy

- main = stable/releasable branch.
- development = integration and active product development.
- Feature branches may be created from development for risky or isolated work.
- No direct experimental work should be pushed to main.
- Merge to main only after development exit criteria are satisfied.

## 12. Documentation map

- README.md — product overview, architecture, status and quick start.
- DEVELOPMENT_PLAN.md — phases, acceptance criteria and development rules.
- ARCHITECTURE.md — target technical architecture and data/agent boundaries.
- TESTING_CHECKLIST.md — repeatable QA and release checklist.

## 13. Working rule

**Build the smallest complete end-to-end workflow first.**

Do not build isolated AI demos, isolated screens or isolated APIs indefinitely. Every major feature should eventually connect:

~~~text
Interface → Backend → Agent/Business Logic → Database → Notification → User-visible result
~~~
