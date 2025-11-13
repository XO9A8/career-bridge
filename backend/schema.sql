-- Create custom enum types
CREATE TYPE experience_level AS ENUM ('fresher', 'junior', 'mid');
CREATE TYPE career_track AS ENUM ('web_development', 'data', 'design', 'marketing');
CREATE TYPE job_type AS ENUM ('internship', 'part_time', 'full_time', 'freelance');
CREATE TYPE cost_indicator AS ENUM ('free', 'paid');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    avatar_url TEXT,
    education_level VARCHAR(255),
    experience_level experience_level,
    preferred_track career_track,
    skills TEXT[] NOT NULL DEFAULT '{}',
    projects TEXT[] NOT NULL DEFAULT '{}',
    target_roles TEXT[] NOT NULL DEFAULT '{}',
    profile_completed BOOLEAN DEFAULT FALSE,
    raw_cv_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    experience_level experience_level NOT NULL,
    job_type job_type NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create learning_resources table
CREATE TABLE learning_resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    platform VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    related_skills TEXT[] NOT NULL DEFAULT '{}',
    cost cost_indicator NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create application_tracking table
CREATE TABLE application_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'applied',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(user_id, job_id)
);

-- Create user_progress table
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    completion_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, resource_id)
);

-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create skill_assessments table
CREATE TABLE skill_assessments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 10),
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_application_tracking_user_id ON application_tracking(user_id);
CREATE INDEX idx_application_tracking_status ON application_tracking(status);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_skill_assessments_user_id ON skill_assessments(user_id);
