# E-Chowk Testing & Release Checklist

Use this file for every development milestone and release candidate.

## A. Environment
- [ ] Correct environment selected
- [ ] Required environment variables present
- [ ] No secrets in source code
- [ ] Database reachable
- [ ] Migrations applied
- [ ] Backend health endpoint passes
- [ ] Flutter/web points to intended API

## B. Authentication
- [ ] Valid phone accepted
- [ ] Invalid phone rejected
- [ ] OTP generated
- [ ] OTP expires
- [ ] OTP cannot be reused
- [ ] Wrong OTP rejected
- [ ] User receives stable UUID
- [ ] Role is enforced server-side
- [ ] Rate limiting tested

## C. Worker
- [ ] Register through app
- [ ] Register through phone AI
- [ ] Existing worker recognized
- [ ] Name update works
- [ ] Skill update works
- [ ] Location update works
- [ ] Wage update works
- [ ] Availability update works
- [ ] Profile confirmation works
- [ ] Correction in natural language works

## D. Employer
- [ ] Employer profile works
- [ ] Create draft job
- [ ] Validate required fields
- [ ] Publish job
- [ ] Edit job
- [ ] Cancel job
- [ ] View applications
- [ ] View matching workers

## E. Matching
- [ ] Skill match
- [ ] Location match
- [ ] Availability match
- [ ] Wage compatibility
- [ ] Distance ranking
- [ ] Rating signal
- [ ] Explainable ranking
- [ ] No duplicate application

## F. Hiring
- [ ] Employer requests worker
- [ ] Worker receives notification
- [ ] Worker accepts
- [ ] Worker rejects
- [ ] Job becomes assigned only after valid acceptance
- [ ] Duplicate requests blocked
- [ ] Cancellation rules enforced

## G. AI Agent
- [ ] Correct language
- [ ] Correct intent
- [ ] Correct entity extraction
- [ ] Correct tool selected
- [ ] Tool arguments validated
- [ ] Unauthorized tool action blocked
- [ ] Agent asks clarification when needed
- [ ] Agent does not invent facts
- [ ] Agent confirms consequential actions
- [ ] Agent handles tool failure
- [ ] Agent handles silence
- [ ] Agent handles ASR mistakes
- [ ] Agent maintains context
- [ ] Agent remembers verified profile data
- [ ] Agent can recover after correction

## H. Phone
- [ ] Inbound call
- [ ] Outbound call
- [ ] Hindi STT
- [ ] Hindi TTS
- [ ] Call timeout
- [ ] Silence
- [ ] Hang-up
- [ ] Retry
- [ ] Network/provider failure
- [ ] Call session cleanup
- [ ] No duplicate registration

## I. Mobile UI
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Offline/network failure state
- [ ] Hindi text renders correctly
- [ ] Accessibility
- [ ] Small screen layout
- [ ] Android test
- [ ] iOS test where applicable

## J. Web
- [ ] Responsive layout
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile browser
- [ ] Role-based routes
- [ ] Session expiry
- [ ] Form validation
- [ ] Error handling

## K. Security
- [ ] Authentication bypass tests
- [ ] IDOR tests
- [ ] Role escalation tests
- [ ] Rate limit tests
- [ ] Webhook verification
- [ ] Sensitive log review
- [ ] Dependency audit
- [ ] CORS review

## L. Release gate

### P0
Critical outage/security/data loss. **Must be zero.**

### P1
Core journey broken. **Must be zero before release.**

### P2
Non-critical defect. Can be released only with an explicit decision.

Final gate:
- [ ] All phase acceptance criteria complete
- [ ] Regression suite passes
- [ ] Manual E2E passes
- [ ] AI evaluation passes agreed threshold
- [ ] No P0/P1 issues
- [ ] Docs updated
- [ ] Rollback plan documented
- [ ] Demo completed
- [ ] Ready for merge to main

## Development CI commands

Backend:
- `npm install`
- `npm run typecheck`
- `npm test -- --runInBand`
- `npm run build`

Flutter:
- `flutter pub get`
- `flutter analyze`
- `flutter test`

## Implemented end-to-end acceptance flow

1. Phone OTP → authenticated user
2. Worker/employer role selection → persisted role
3. Worker profile/availability → protected API
4. Employer creates job → OPEN
5. Worker searches job → applies
6. Employer reviews application → accepts/rejects
7. Worker starts → IN_PROGRESS
8. Worker completes → COMPLETED
9. Notifications + audit event → recorded
10. Rating → trust record
11. Agent → tool call → same backend services
12. Phone/WhatsApp → same agent path
