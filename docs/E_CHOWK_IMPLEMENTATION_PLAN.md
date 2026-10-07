# E-Chowk Implementation Plan

## Approved UI
- Mobile-first bilingual experience
- Deep navy navigation/trust
- Emerald actions/availability
- Restrained saffron highlights
- Worker and employer dashboards
- Voice AI and AI Assistant as separate experiences
- OTP authentication and role-based flows

## Backend
- NestJS API
- PostgreSQL
- Auth/RBAC
- Jobs and applications
- Matching
- AI agent with backend-authorized tools
- Voice provider adapters
- Notifications
- Ratings/trust
- Payments
- Audit logging

## Security principle
LLM decides what the user means. Backend decides what the system is allowed to do.

## Implementation rule
The Flutter client remains a client of the NestJS API. No second mock backend should be introduced.
