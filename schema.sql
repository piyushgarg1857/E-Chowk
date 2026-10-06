-- E-Chowk canonical PostgreSQL schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) CHECK (role IN ('worker','employer','admin')) NOT NULL DEFAULT 'worker',
  skill_category VARCHAR(50),
  daily_wage DECIMAL(10,2),
  is_available BOOLEAN NOT NULL DEFAULT true,
  rating FLOAT NOT NULL DEFAULT 0,
  current_location VARCHAR(200),
  registration_source VARCHAR(20) CHECK (registration_source IN ('voice','whatsapp','app')),
  phone_verified_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS otp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) NOT NULL,
  otp_code VARCHAR(6),
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  required_skill VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(200) NOT NULL,
  offered_wage DECIMAL(10,2),
  duration_days INT NOT NULL DEFAULT 1,
  starts_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('draft','open','assigned','in_progress','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','completed')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  completed_at TIMESTAMPTZ,
  UNIQUE(job_id, worker_id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel VARCHAR(30) NOT NULL,
  session_id VARCHAR(120) NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_users_role_location ON users(role, current_location);
CREATE INDEX IF NOT EXISTS idx_users_skill ON users(skill_category);
CREATE INDEX IF NOT EXISTS idx_jobs_status_skill ON jobs(status, required_skill);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_status ON jobs(employer_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_actor_created ON audit_events(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_session ON agent_conversations(session_id, created_at);
