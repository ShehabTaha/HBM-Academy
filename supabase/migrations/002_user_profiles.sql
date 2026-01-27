-- Migration: Create user_profiles table
-- Description: Stores extended user profile information and preferences.

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  location TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  date_of_birth DATE,
  company TEXT,
  job_title TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{
    "notification_emails": true,
    "marketing_emails": false,
    "newsletter": false,
    "two_factor_enabled": false,
    "theme": "auto",
    "language": "en"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'users_see_own_profile'
    ) THEN
        CREATE POLICY "users_see_own_profile" ON user_profiles
          FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'users_update_own_profile'
    ) THEN
        CREATE POLICY "users_update_own_profile" ON user_profiles
          FOR UPDATE USING (user_id = auth.uid())
          WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'users_insert_own_profile'
    ) THEN
        CREATE POLICY "users_insert_own_profile" ON user_profiles
          FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'admins_see_all_profiles'
    ) THEN
        CREATE POLICY "admins_see_all_profiles" ON user_profiles
          FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END $$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at' AND tgrelid = 'user_profiles'::regclass) THEN
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
