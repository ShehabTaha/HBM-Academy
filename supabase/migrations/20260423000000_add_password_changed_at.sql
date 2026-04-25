-- =============================================
-- Migration: Add password_changed_at to users
-- =============================================
-- Tracks when a user last successfully changed their password.
-- Used for audit logging and future "force re-login after password change" logic.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Back-fill existing rows with their updated_at as a reasonable default
UPDATE users
  SET password_changed_at = updated_at
  WHERE password_changed_at IS NULL;

-- Index for potential future queries (e.g. "users who haven't changed pw in 90 days")
CREATE INDEX IF NOT EXISTS idx_users_password_changed_at ON users (password_changed_at);

COMMENT ON COLUMN users.password_changed_at IS
  'Timestamp of the last successful password change. NULL means the password has never been explicitly changed via the change-password flow.';
