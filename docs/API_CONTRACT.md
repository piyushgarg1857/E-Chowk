# E-Chowk API Contract

Base URL: `/api` (deployment may expose the NestJS app at root).

## Auth
- POST `/auth/send-otp` — request OTP
- POST `/auth/verify-otp` — verify OTP and receive access token
- PATCH `/auth/role` — set worker/employer role (authenticated)

## Users
- GET `/users/me`
- PATCH `/users/me`

## Jobs
- GET `/jobs?skill=&location=&limit=`
- GET `/jobs/:id`
- POST `/jobs`
- POST `/jobs/:id/applications`
- GET `/jobs/:id/applications`
- PATCH `/jobs/applications/:applicationId`
- POST `/jobs/:id/start`
- POST `/jobs/:id/complete`

## AI
- POST `/agent/message`
  - body: `{"message":"..." }`
  - returns `reply` and persistent `session_id`
  - AI may use only backend-authorized tools
  - consequential actions require explicit confirmation

## Voice
- POST `/voice/register-call`
- POST `/voice/call-worker`
- provider callbacks remain behind the voice adapter

## Notifications
- GET `/notifications`
- PATCH `/notifications/:id/read`
- POST `/notifications/read-all`

## Trust
- POST `/ratings`
- GET `/users/:id/ratings`
- GET `/users/:id/trust`

## Payments
- POST `/payments`
- GET `/payments/:id`
- POST `/payments/:id/confirm`
- provider webhooks must be signature-verified and idempotent

## Authorization
Every authenticated mutation follows:
1. DTO validation
2. authenticated actor identity
3. role/ownership authorization
4. domain state transition validation
5. audit event for consequential mutations

The LLM never accesses PostgreSQL directly and never decides authorization.
