-- Create user_emails table
CREATE TABLE IF NOT EXISTS user_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false NOT NULL,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, email)
);

-- Ensure emails are unique across the whole platform
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_emails_email ON user_emails(email);

-- Backfill existing primary emails from the users table
INSERT INTO user_emails (user_id, email, is_primary, is_verified)
SELECT id, email, true, is_email_verified
FROM users
ON CONFLICT DO NOTHING;

-- Add RLS
ALTER TABLE user_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own emails" ON user_emails
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own emails" ON user_emails
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own emails" ON user_emails
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own emails" ON user_emails
  FOR DELETE USING (auth.uid()::text = user_id::text);
