# E-Chowk Production Release Gate

## Required
- [ ] Secrets only in environment/secret manager
- [ ] AUTH_TOKEN_SECRET is long and random
- [ ] Database migrations applied
- [ ] Database backups configured
- [ ] HTTPS/TLS enabled
- [ ] Twilio webhook signature validation enabled
- [ ] CORS restricted to known origins
- [ ] Rate limits enabled at edge/API
- [ ] OTP abuse protection enabled
- [ ] Structured logs and request IDs
- [ ] Audit events for consequential actions
- [ ] P0/P1 test failures = 0
- [ ] AI evaluation passes
- [ ] No fake/demo data in production
- [ ] Payment provider configured and reconciled
- [ ] Rollback procedure tested

## Payment policy
The current payments table is a ledger abstraction with a manual provider. It is intentionally not presented as a live money-transfer integration. A real payment provider must be added behind a provider interface and verified with sandbox tests before enabling settlement.

## Voice policy
Production phone webhooks must use a stable HTTPS PUBLIC_BASE_URL; local ngrok fallback is not allowed.
