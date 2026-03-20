-- ==============================================
-- 🛠️ E-Chowk: PostgreSQL Database Schema (Azure)
-- ==============================================

-- 1. Users Table (Workers & Employers combined for simplicity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('worker', 'employer', 'admin')) NOT NULL,
    
    -- Specific info for workers
    skill_category VARCHAR(50), 
    daily_wage DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT true,
    rating FLOAT DEFAULT 0.0,
    
    -- Common fields
    current_location VARCHAR(200),
    registration_source VARCHAR(20) CHECK (registration_source IN ('voice', 'whatsapp', 'app')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. OTP Sessions (For Custom Auth logic since we aren't using Supabase Auth anymore)
CREATE TABLE otp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Jobs Table (Employers posting requirements)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    required_skill VARCHAR(50) NOT NULL,
    description TEXT,
    location VARCHAR(200) NOT NULL,
    offered_wage DECIMAL(10, 2),
    duration_days INT DEFAULT 1,
    status VARCHAR(20) CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Job Applications / Matches (Linking Jobs with Workers)
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for fast searching based on location and skill
CREATE INDEX idx_users_role_location ON users(role, current_location);
CREATE INDEX idx_users_skill ON users(skill_category);
CREATE INDEX idx_jobs_status_skill ON jobs(status, required_skill);
