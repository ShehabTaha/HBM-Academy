-- ============================================================
-- HBM Academy — Student Side Migration
-- 002_student_side.sql
-- Run this in your Supabase SQL editor (Project > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. ALTER existing tables
-- ============================================================

-- Confirm lesson_type enum includes all 6 types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'video' AND enumtypid = 'lesson_type'::regtype) THEN
    ALTER TYPE lesson_type ADD VALUE 'video';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'audio' AND enumtypid = 'lesson_type'::regtype) THEN
    ALTER TYPE lesson_type ADD VALUE 'audio';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pdf' AND enumtypid = 'lesson_type'::regtype) THEN
    ALTER TYPE lesson_type ADD VALUE 'pdf';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'text' AND enumtypid = 'lesson_type'::regtype) THEN
    ALTER TYPE lesson_type ADD VALUE 'text';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'quiz' AND enumtypid = 'lesson_type'::regtype) THEN
    ALTER TYPE lesson_type ADD VALUE 'quiz';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'practical' AND enumtypid = 'lesson_type'::regtype) THEN
    ALTER TYPE lesson_type ADD VALUE 'practical';
  END IF;
END $$;

-- Add student-specific columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS specialization TEXT
    CHECK (specialization IN ('f_and_b','housekeeping','front_office','management','culinary')),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '/default-avatar.svg',
  ADD COLUMN IF NOT EXISTS supabase_uid UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar'));

UPDATE users SET avatar = '/default-avatar.svg' WHERE avatar IS NULL OR avatar = '';

-- Add Stripe fields to enrollments table
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Create certificates table if it doesn't exist (in case it was missed in earlier migrations)
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  certificate_url TEXT
);

-- Add share_token and extra URL fields to certificates
ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS png_url TEXT;

-- ============================================================
-- 2. New Tables
-- ============================================================

-- quiz_questions: individual questions belonging to a quiz lesson
CREATE TABLE IF NOT EXISTS quiz_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  option_a        TEXT NOT NULL,
  option_b        TEXT NOT NULL,
  option_c        TEXT,
  option_d        TEXT,
  correct_option  TEXT NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  explanation     TEXT,
  order_index     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE;

-- quiz_attempts: each time a student submits a quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  answers         JSONB NOT NULL,
  score           INTEGER NOT NULL,
  passed          BOOLEAN NOT NULL GENERATED ALWAYS AS (score = 100) STORED,
  attempt_number  INTEGER NOT NULL DEFAULT 1,
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_lesson
  ON quiz_attempts(student_id, lesson_id);

-- practical_submissions: student work uploaded for admin review
CREATE TABLE IF NOT EXISTS practical_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_url        TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  file_size       INTEGER,
  notes           TEXT,
  attempt_number  INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  admin_feedback  TEXT,
  reviewed_by     UUID REFERENCES users(id),
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);
ALTER TABLE practical_submissions ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_practical_submissions_student_lesson
  ON practical_submissions(student_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_practical_submissions_status
  ON practical_submissions(status);

-- discussion_posts: per-lesson threaded discussion
CREATE TABLE IF NOT EXISTS discussion_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id       UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  is_pinned       BOOLEAN DEFAULT FALSE,
  is_deleted      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE discussion_posts ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_discussion_posts_lesson
  ON discussion_posts(lesson_id);

-- conversations: student <-> admin inbox thread
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- messages: individual messages within a conversation
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id),
  sender_role     TEXT NOT NULL CHECK (sender_role IN ('student','admin')),
  body            TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(conversation_id);

-- student_subscriptions: Stripe subscription for category access
CREATE TABLE IF NOT EXISTS student_subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT NOT NULL UNIQUE,
  stripe_customer_id      TEXT NOT NULL,
  category                 TEXT,
  status                  TEXT NOT NULL CHECK (status IN ('active','cancelled','past_due','trialing')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- submissions storage bucket. Policies are managed in Supabase storage.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submissions',
  'submissions',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. DB Trigger — Auto-create user record on Supabase Auth signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_supabase_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    supabase_uid,
    email,
    name,
    password,
    role,
    is_email_verified,
    avatar,
    language
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'supabase_auth',
    'student',
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '/default-avatar.svg'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  )
  ON CONFLICT (supabase_uid) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_supabase_user();

-- ============================================================
-- 4. DB Trigger — Auto-complete lesson when practical is approved
-- ============================================================

CREATE OR REPLACE FUNCTION handle_practical_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Ensure progress table has lesson_id to prevent column does not exist errors
    INSERT INTO progress (enrollment_id, lesson_id, is_completed, completed_at)
    SELECT e.id, NEW.lesson_id, true, NOW()
    FROM enrollments e
    JOIN lessons l ON l.id = NEW.lesson_id
    JOIN sections s ON s.id = l.section_id
    WHERE e.student_id = NEW.student_id
      AND e.course_id = s.course_id
    ON CONFLICT (enrollment_id, lesson_id)
    DO UPDATE SET is_completed = true, completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_practical_approved ON practical_submissions;
CREATE TRIGGER on_practical_approved
  AFTER UPDATE ON practical_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
  EXECUTE FUNCTION handle_practical_approval();

-- ============================================================
-- 5. Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE quiz_questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages               ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subscriptions  ENABLE ROW LEVEL SECURITY;

-- quiz_questions: enrolled students can read
DROP POLICY IF EXISTS "Enrolled students can read quiz questions" ON quiz_questions;
CREATE POLICY "Enrolled students can read quiz questions"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN lessons l ON l.id = quiz_questions.lesson_id
      JOIN sections s ON s.id = l.section_id
      WHERE e.course_id = s.course_id
        AND e.student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid())
    )
  );

-- quiz_attempts: students see only their own
DROP POLICY IF EXISTS "Students manage their own quiz attempts" ON quiz_attempts;
CREATE POLICY "Students manage their own quiz attempts"
  ON quiz_attempts FOR ALL
  USING (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- practical_submissions: students see only their own
DROP POLICY IF EXISTS "Students manage their own submissions" ON practical_submissions;
CREATE POLICY "Students manage their own submissions"
  ON practical_submissions FOR ALL
  USING (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- discussion_posts: enrolled students can read all, write their own
DROP POLICY IF EXISTS "Enrolled students can read discussion posts" ON discussion_posts;
CREATE POLICY "Enrolled students can read discussion posts"
  ON discussion_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN lessons l ON l.id = discussion_posts.lesson_id
      JOIN sections s ON s.id = l.section_id
      WHERE e.course_id = s.course_id
        AND e.student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Students can insert their own posts" ON discussion_posts;
CREATE POLICY "Students can insert their own posts"
  ON discussion_posts FOR INSERT
  WITH CHECK (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));

DROP POLICY IF EXISTS "Students can update their own posts" ON discussion_posts;
CREATE POLICY "Students can update their own posts"
  ON discussion_posts FOR UPDATE
  USING (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()))
  WITH CHECK (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- conversations: students see only their own
DROP POLICY IF EXISTS "Students see their own conversations" ON conversations;
CREATE POLICY "Students see their own conversations"
  ON conversations FOR ALL
  USING (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- messages: students see messages in their conversations only
DROP POLICY IF EXISTS "Students see messages in their conversations" ON messages;
CREATE POLICY "Students see messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Students can send messages in their conversations" ON messages;
CREATE POLICY "Students can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT id FROM users WHERE supabase_uid = auth.uid())
    AND sender_role = 'student'
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid())
    )
  );

-- student_subscriptions: students see only their own
DROP POLICY IF EXISTS "Students see their own subscriptions" ON student_subscriptions;
CREATE POLICY "Students see their own subscriptions"
  ON student_subscriptions FOR SELECT
  USING (student_id = (SELECT id FROM users WHERE supabase_uid = auth.uid()));

-- ============================================================
-- 6. Stripe Connect settings
-- ============================================================

INSERT INTO platform_settings (setting_key, setting_value, category, description, is_sensitive)
VALUES
  ('stripe_connect_account_id', 'null', 'payment', 'Stripe Connect account id for platform payouts', true),
  ('stripe_connect_mode', '"test"', 'payment', 'Stripe Connect account mode', false),
  ('stripe_connect_status', '"not_started"', 'payment', 'Stripe Connect onboarding status', false),
  ('stripe_connect_charges_enabled', 'false', 'payment', 'Stripe Connect charges enabled flag', false),
  ('stripe_connect_payouts_enabled', 'false', 'payment', 'Stripe Connect payouts enabled flag', false),
  ('stripe_connect_details_submitted', 'false', 'payment', 'Stripe Connect details submitted flag', false),
  ('stripe_connect_requirements_due', '[]', 'payment', 'Stripe Connect currently due requirements', false)
ON CONFLICT (setting_key) DO NOTHING;
