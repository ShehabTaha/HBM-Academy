-- ============================================================
-- MIGRATION: Fix & rebuild user_sessions table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Drop the old table completely (safe, since sessions are transient)
DROP TABLE IF EXISTS user_sessions;

-- 2. Recreate with the correct schema
CREATE TABLE user_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT        UNIQUE NOT NULL,
  device_name   TEXT,
  device_type   TEXT        CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser       TEXT,
  os            TEXT,
  ip_address    TEXT,
  city          TEXT,
  country       TEXT,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- 3. Indexes for fast lookups
CREATE INDEX idx_user_sessions_user_id     ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token       ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at  ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_active ON user_sessions(user_id, last_activity DESC);

-- 4. Auto-cleanup function: remove expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$;

-- 5. Enable Row Level Security
--    NOTE: All API routes use the SERVICE_ROLE_KEY which bypasses RLS.
--    RLS only matters if you ever query from the client directly.
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Drop old policies (idempotent)
DROP POLICY IF EXISTS "users_see_own_sessions"    ON user_sessions;
DROP POLICY IF EXISTS "users_delete_own_sessions" ON user_sessions;
DROP POLICY IF EXISTS "service_role_full_access"  ON user_sessions;

-- 7. Service role bypass (for Next.js API routes)
CREATE POLICY "service_role_full_access" ON user_sessions
  FOR ALL
  USING     (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- Done! Verify with:
-- SELECT * FROM user_sessions LIMIT 10;
