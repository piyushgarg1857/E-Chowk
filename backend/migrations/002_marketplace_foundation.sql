-- E-Chowk marketplace foundation (additive migration)
-- Apply after the existing users/jobs/job_applications tables exist.
-- TypeORM synchronize remains disabled; this migration is intentionally explicit.

CREATE TABLE IF NOT EXISTS worker_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name varchar(80) NOT NULL,
  proficiency varchar(20) NOT NULL DEFAULT 'basic',
  years_experience numeric(4,1),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT worker_skills_unique UNIQUE (worker_id, skill_name),
  CONSTRAINT worker_skills_proficiency_check CHECK (proficiency IN ('basic','intermediate','advanced'))
);

CREATE INDEX IF NOT EXISTS idx_worker_skills_name ON worker_skills (lower(skill_name));
CREATE INDEX IF NOT EXISTS idx_worker_skills_worker ON worker_skills (worker_id);

CREATE TABLE IF NOT EXISTS job_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  application_id uuid REFERENCES job_applications(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  status varchar(20) NOT NULL DEFAULT 'assigned',
  CONSTRAINT job_assignments_status_check CHECK (status IN ('assigned','in_progress','completed','cancelled')),
  CONSTRAINT job_assignments_job_unique UNIQUE (job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_assignments_worker_status ON job_assignments (worker_id, status);

CREATE TABLE IF NOT EXISTS conversation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel varchar(20) NOT NULL DEFAULT 'app',
  title varchar(160),
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_updated
  ON conversation_sessions (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS voice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  provider varchar(30) NOT NULL,
  provider_call_id varchar(160),
  direction varchar(20) NOT NULL DEFAULT 'outbound',
  status varchar(30) NOT NULL DEFAULT 'initiated',
  language varchar(20) NOT NULL DEFAULT 'hi-IN',
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT voice_sessions_direction_check CHECK (direction IN ('inbound','outbound'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_voice_sessions_provider_call
  ON voice_sessions(provider, provider_call_id)
  WHERE provider_call_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  key varchar(180) NOT NULL,
  route varchar(180) NOT NULL,
  request_hash varchar(128) NOT NULL,
  response_status integer,
  response_body jsonb,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT idempotency_keys_unique UNIQUE (actor_id, key, route)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expiry ON idempotency_keys (expires_at);

CREATE TABLE IF NOT EXISTS refresh_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash varchar(128) NOT NULL UNIQUE,
  device_label varchar(120),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user ON refresh_sessions (user_id, revoked_at);

CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider varchar(40) NOT NULL,
  external_event_id varchar(180) NOT NULL,
  event_type varchar(120),
  payload jsonb NOT NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT webhook_events_unique UNIQUE (provider, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_unprocessed
  ON webhook_events(provider, processed_at)
  WHERE processed_at IS NULL;

-- Safe cleanup for expired idempotency records can be scheduled externally.
