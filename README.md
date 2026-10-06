# E-Chowk

> **AI-first labour marketplace for India — voice, phone, mobile and web in one system.**

E-Chowk is being developed as a multi-channel AI labour marketplace where a worker or employer can interact through **natural voice conversation, phone calls, mobile app or web**, while every channel uses the same backend, identity, marketplace data and AI agent.

**Development branch:** \`development\`  
**Stable branch:** \`main\`

[![Branch](https://img.shields.io/badge/branch-development-blue)](https://github.com/piyushgarg1857/E-Chowk/tree/development)
[![Status](https://img.shields.io/badge/status-active%20development-orange)](https://github.com/piyushgarg1857/E-Chowk)
[![Flutter](https://img.shields.io/badge/mobile-Flutter-02569B)](https://flutter.dev/)
[![Backend](https://img.shields.io/badge/backend-NestJS-E0234E)](https://nestjs.com/)
[![Database](https://img.shields.io/badge/database-PostgreSQL-336791)](https://www.postgresql.org/)

---

## 1. What E-Chowk is

The goal is simple:

> **A worker should be able to say what work they need. An employer should be able to say what worker they need. E-Chowk's AI should understand the request and operate the marketplace.**

Example worker conversation:

> **Worker:** "Bhai mujhe kal Jaipur mein plumber ka kaam chahiye."

The AI should understand:

~~~text
intent        = find_job
skill         = plumber
location      = Jaipur
availability  = tomorrow
~~~

Then it should call the marketplace backend, find relevant jobs, explain the best options and, after confirmation, apply on the worker's behalf.

The same task should eventually work through:

~~~text
📞 Phone AI
   ↓
📱 Flutter App
   ↓
🌐 Web
   ↓
💬 WhatsApp
   ↓
        ONE E-CHOWK BACKEND
~~~

---

# 2. Product architecture

~~~text
                         E-CHOWK
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
       📞 PHONE           📱 APP            🌐 WEB
       AI Agent          Flutter          Responsive
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                     NestJS Backend
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    🤖 AI AGENT        🧰 MARKETPLACE        🔐 AUTH
        │                   │                   │
    LLM + Tools       Jobs / Matching       OTP / RBAC
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                     PostgreSQL
                            │
             ┌──────────────┼──────────────┐
             │              │              │
        Notifications    Audit/Logs    Observability
~~~

### Golden rule

**LLM decides what the user means. Backend decides what the system is allowed to do.**

The LLM must never directly execute SQL or bypass authorization.

---

# 3. AI agent model

E-Chowk is **not** being designed as:

~~~text
User → Form → Data → AI → Fixed Response
~~~

It is being designed as:

~~~text
User
 ↓
Natural conversation
 ↓
STT / text
 ↓
AI Agent
 ↓
Context + user memory
 ↓
Intent understanding
 ↓
Tool selection
 ↓
Backend validation
 ↓
Marketplace / Database
 ↓
Tool result
 ↓
AI response
 ↓
TTS / text
 ↓
User
~~~

### Core agent tools

- [ ] \`get_current_user()\`
- [ ] \`get_worker_profile()\`
- [ ] \`update_worker_profile()\`
- [ ] \`search_jobs()\`
- [ ] \`get_job()\`
- [ ] \`create_job()\`
- [ ] \`apply_for_job()\`
- [ ] \`get_application_status()\`
- [ ] \`accept_job_request()\`
- [ ] \`reject_job_request()\`
- [ ] \`update_availability()\`

Tool calls will be schema-validated and permission-checked by the backend.

---

# 4. Main user workflows

## Worker

~~~text
Phone / App / Web
       ↓
Login / identify
       ↓
Worker profile
       ↓
Available for work
       ↓
Find job
       ↓
AI / search / matching
       ↓
Job details
       ↓
Apply
       ↓
Employer response
       ↓
Accepted
       ↓
Work
       ↓
Completed
       ↓
Rating / payment record
~~~

## Employer

~~~text
Login
 ↓
Employer profile
 ↓
Create job
 ↓
Skill + location + wage + date
 ↓
Publish
 ↓
AI / matching engine
 ↓
Candidate workers
 ↓
Select worker
 ↓
Send request
 ↓
Worker accepts
 ↓
Job assigned
 ↓
Completed
 ↓
Rating / payment record
~~~

## Phone AI onboarding

~~~text
Worker calls E-Chowk
       ↓
Phone identified
       ↓
AI: "Namaste! Aapka naam?"
       ↓
Name
       ↓
Skill
       ↓
City
       ↓
Wage / availability
       ↓
AI reads summary
       ↓
Worker confirms/corrects
       ↓
Tool: save_worker_profile()
       ↓
Database
       ↓
Registration complete
~~~

---

# 5. Development status

Status is tracked with a strict rule:

- [x] **Baseline exists** — code/prototype is present.
- [~] **In development** — implementation is active but not accepted as complete.
- [ ] **Not started / incomplete** — no production-ready implementation yet.

| Area | Status | Current meaning |
|---|:---:|---|
| Flutter shell | [x] | Existing |
| Phone OTP prototype | [x] | Existing |
| Worker UI | [x] | Prototype |
| Employer UI | [x] | Prototype |
| NestJS backend | [x] | Existing |
| PostgreSQL schema | [x] | Existing |
| Twilio voice prototype | [x] | Existing |
| Groq LLM prototype | [x] | Existing |
| Hindi voice flow | [x] | Prototype |
| Proper AI tool calling | [ ] | Next AI core task |
| Agent memory | [ ] | Required |
| Worker profile service | [~] | Needs production workflow |
| Job creation | [ ] | Required |
| Job search | [ ] | Required |
| Matching engine | [ ] | Required |
| Application workflow | [ ] | Required |
| Hiring workflow | [ ] | Required |
| Job completion | [ ] | Required |
| Production mobile workflow | [ ] | Required |
| Production web workflow | [ ] | Required |
| WhatsApp | [ ] | Later phase |
| Payments | [ ] | Later phase |
| Production security/observability | [ ] | Required before real users |
| AI evaluation suite | [ ] | Required |

**Important:** Existing prototype code is not automatically considered production-complete.

---

# 6. Development roadmap

## Phase 0 — Foundation & safety
- [ ] Environment separation
- [ ] Secrets/config management
- [ ] API error contract
- [ ] Request validation
- [ ] RBAC
- [ ] Logging
- [ ] Migration strategy
- [ ] API URL configuration
- [ ] Development/testing rules

**Gate:** local setup is reproducible and sensitive configuration is not hard-coded.

## Phase 1 — Identity & profiles
- [ ] Phone OTP
- [ ] UUID identity
- [ ] Worker profile
- [ ] Employer profile
- [ ] Skills
- [ ] Location
- [ ] Availability
- [ ] Profile confirmation
- [ ] Profile editing

**Gate:** one verified user identity works consistently across app, web and agent.

## Phase 2 — AI Agent Core
- [ ] Agent service
- [ ] Session model
- [ ] Prompt/version management
- [ ] Tool registry
- [ ] Tool validation
- [ ] Authorization
- [ ] Memory
- [ ] Confirmation policy
- [ ] Error recovery
- [ ] Evaluation dataset

**Gate:** multi-turn AI task completes using real backend tools.

## Phase 3 — Phone AI
- [ ] Inbound calls
- [ ] Outbound calls
- [ ] STT
- [ ] Agent
- [ ] TTS
- [ ] Call sessions
- [ ] Silence/retry
- [ ] Hindi/Hinglish testing
- [ ] Noise/accent testing
- [ ] Privacy/consent

**Gate:** worker registration + simple job search works entirely by phone.

## Phase 4 — Marketplace
- [ ] Jobs
- [ ] Applications
- [ ] Matching
- [ ] Employer requests
- [ ] Worker accept/reject
- [ ] Assignment
- [ ] Cancellation
- [ ] Completion
- [ ] Ratings

**Gate:** Worker → Job → Employer → Hire → Complete works without manual DB changes.

## Phase 5 — Mobile
- [ ] Worker dashboard
- [ ] Worker profile
- [ ] Job feed
- [ ] Job details
- [ ] Applications
- [ ] Requests
- [ ] Notifications
- [ ] Employer dashboard
- [ ] Job creation
- [ ] Candidate matching
- [ ] Hindi-first accessibility

**Gate:** core journeys are usable without developer tools.

## Phase 6 — Web
- [ ] Responsive web app
- [ ] Employer console
- [ ] Operations/admin
- [ ] Job management
- [ ] Candidate search
- [ ] Role-based routes
- [ ] Audit views

**Gate:** web supports required MVP operations.

## Phase 7 — WhatsApp
- [ ] Identity linking
- [ ] Notifications
- [ ] Job alerts
- [ ] Accept/reject
- [ ] Availability updates
- [ ] Phone/app fallback

**Gate:** WhatsApp uses the same backend workflow.

## Phase 8 — Matching intelligence
- [ ] Skill normalization
- [ ] Location/distance
- [ ] Availability
- [ ] Wage compatibility
- [ ] Rating
- [ ] Reliability
- [ ] Explainable score
- [ ] Evaluation dataset

**Gate:** relevant candidates are ranked consistently and explainably.

## Phase 9 — Trust, payments & production
- [ ] Verification strategy
- [ ] Privacy/consent
- [ ] Abuse prevention
- [ ] Rate limiting
- [ ] Fraud controls
- [ ] Payment ledger
- [ ] Disputes/refunds
- [ ] Monitoring
- [ ] Backups
- [ ] Security review
- [ ] Load testing

**Gate:** controlled real-user MVP readiness.

## Phase 10 — E-Chowk AI specialization
- [ ] Consent-based conversation dataset
- [ ] Redaction
- [ ] Intent/entity labels
- [ ] Hindi/Hinglish benchmark
- [ ] Baseline evaluation
- [ ] Fine-tuning decision
- [ ] Regression tests
- [ ] Model rollback

**Rule:** do not train an LLM from scratch. First improve the agent, tools, memory, retrieval and prompts. Fine-tune only when evaluation proves it is useful.

---

# 7. Testing system

Every feature follows:

~~~text
BUILD
 ↓
UNIT TEST
 ↓
INTEGRATION TEST
 ↓
AI TEST (if applicable)
 ↓
MANUAL E2E
 ↓
ACCEPTANCE CRITERIA
 ↓
DOCUMENT STATUS
 ↓
READY
~~~

### Universal checklist

- [ ] Code builds
- [ ] Unit tests pass
- [ ] API tests pass
- [ ] Database behavior verified
- [ ] Authentication verified
- [ ] Authorization verified
- [ ] Error state verified
- [ ] Retry verified
- [ ] AI behavior evaluated
- [ ] Hindi/Hinglish tested where relevant
- [ ] Manual E2E passed
- [ ] Documentation updated
- [ ] No secrets committed

See **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** for the complete QA gate.

---

# 8. Definition of Done

A feature cannot be marked complete until:

- [ ] Code implemented
- [ ] API contract documented
- [ ] Database migration completed
- [ ] Auth/RBAC checked
- [ ] UI connected
- [ ] Error states handled
- [ ] Tests added
- [ ] AI evaluated where applicable
- [ ] Manual acceptance test passed
- [ ] Documentation updated
- [ ] No secrets committed
- [ ] End-to-end demo works

---

# 9. Documentation

| Document | Purpose |
|---|---|
| **README.md** | Product overview, status, roadmap and quick context |
| **DEVELOPMENT_PLAN.md** | Detailed phases, acceptance criteria and engineering rules |
| **ARCHITECTURE.md** | Technical architecture, agent boundaries, memory and security |
| **TESTING_CHECKLIST.md** | QA, AI testing, security and release gates |

---

# 10. Branch strategy

~~~text
main
 │
 │ stable / releasable
 │
 └──── development
          │
          ├── feature/agent-core
          ├── feature/jobs
          ├── feature/matching
          ├── feature/phone-agent
          └── feature/web
~~~

### Rules

- **main** = stable/releasable.
- **development** = active integration/testing.
- Feature branches may be created from development.
- Experimental code should not go directly into main.
- Main is updated only after development gates pass.

---

# 11. Current development priority

Do **not** start by polishing every screen.

The priority is:

~~~text
1. Foundation
      ↓
2. AI Agent + Tool Calling
      ↓
3. Worker Profile
      ↓
4. Jobs
      ↓
5. Matching
      ↓
6. Application
      ↓
7. Hiring
      ↓
8. Completion
      ↓
9. Mobile/Web polish
      ↓
10. WhatsApp + Payments
~~~

The first major milestone is:

> **A worker can use E-Chowk through phone/app, find a real job, apply, and complete the hiring workflow while an employer can create and fill that job.**

That is the first real product milestone—not merely a working AI demo.

---

# 12. Current prototype → target system

### Current

~~~text
Twilio
 ↓
SpeechResult
 ↓
Groq LLM
 ↓
Regex JSON
 ↓
PostgreSQL
~~~

### Target

~~~text
Phone
 ↓
Streaming STT
 ↓
E-Chowk AI Agent
 ↓
Context + Memory
 ↓
Validated Tool Call
 ↓
NestJS Service
 ↓
PostgreSQL
 ↓
Tool Result
 ↓
AI Response
 ↓
Streaming TTS
 ↓
Worker
~~~

The existing prototype should be evolved incrementally rather than thrown away.

---

# 13. Product quality standard

E-Chowk should feel:

- **Simple** for workers.
- **Fast** for employers.
- **Natural** in Hindi/Hinglish.
- **Trustworthy** when AI performs actions.
- **Consistent** across phone, app and web.
- **Observable** for developers/operators.
- **Secure** with personal information.
- **Professional** enough to become a real product.

---

## Quick links

- [Development Plan](DEVELOPMENT_PLAN.md)
- [Architecture](ARCHITECTURE.md)
- [Testing Checklist](TESTING_CHECKLIST.md)
- [Main Branch](https://github.com/piyushgarg1857/E-Chowk/tree/main)
- [Development Branch](https://github.com/piyushgarg1857/E-Chowk/tree/development)

---

## Project owner

**Piyush Garg**  
B.Tech — Artificial Intelligence & Data Science  
Global Institute of Technology, Jaipur

E-Chowk is an independent ongoing project exploring AI-powered, accessible labour-market technology.

> **Build the smallest complete workflow. Test it. Measure it. Then scale it.**
