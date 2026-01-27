-- ============================================================================
-- STUDENT SUBMISSIONS & ASSESSMENT MANAGEMENT SCHEMA
-- ============================================================================

-- ============================================================================
-- 1. ASSIGNMENT SUBMISSIONS
-- ============================================================================

-- Enumeration for submission status
DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected', 'needs_revision');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Submission Contents
  submitted_file_url TEXT,
  file_name TEXT,
  submitted_content TEXT, -- For text-only submissions
  
  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status submission_status DEFAULT 'pending',
  attempt_number INTEGER DEFAULT 1,
  
  -- Grading & Feedback
  admin_feedback TEXT,
  admin_id UUID REFERENCES users(id), -- Reviewer
  reviewed_at TIMESTAMPTZ,
  
  -- History tracking (JSONB array of previous attempts)
  submission_history JSONB DEFAULT '[]'::JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Assignment Submissions
CREATE INDEX IF NOT EXISTS idx_as_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_as_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_as_course_id ON assignment_submissions(course_id);
CREATE INDEX IF NOT EXISTS idx_as_status ON assignment_submissions(status);

-- ============================================================================
-- 2. QUIZ RESULTS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE quiz_status AS ENUM ('in_progress', 'submitted', 'graded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration INTEGER DEFAULT 0, -- in seconds
  
  -- Scoring
  total_points INTEGER DEFAULT 0,
  earned_points DECIMAL(10, 2) DEFAULT 0,
  percentage DECIMAL(5, 2) DEFAULT 0,
  passing_percentage DECIMAL(5, 2) DEFAULT 70.0,
  is_passing BOOLEAN DEFAULT false,
  
  -- Status
  status quiz_status DEFAULT 'in_progress',
  
  -- Detailed Responses (Stored as JSONB for flexibility, or use child table)
  -- Structure: [{ questionId, studentAnswer, isCorrect, pointsEarned, ... }]
  responses JSONB DEFAULT '[]'::JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Quiz Attempts
CREATE INDEX IF NOT EXISTS idx_qa_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_qa_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_qa_status ON quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_qa_is_passing ON quiz_attempts(is_passing);

-- ============================================================================
-- 3. PRACTICAL ASSESSMENTS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE practical_status AS ENUM ('pending', 'approved', 'needs_revision');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mastery_level AS ENUM ('mastery', 'proficient', 'needs_work');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS practical_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Context
  competency_id UUID, -- Optional foreign key if linking to competencies table
  competency_name TEXT NOT NULL, -- Fallback name
  role TEXT NOT NULL, -- e.g. 'F&B Service', 'Housekeeping'
  
  -- Submission
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  evidence_url TEXT, -- Video or Photo URL
  status practical_status DEFAULT 'pending',
  
  -- Evaluation
  rubric_scores JSONB DEFAULT '{}'::JSONB, -- Key-Value: "Communication": 5
  overall_score DECIMAL(5, 2), -- Average or total
  
  -- Feedback
  admin_feedback JSONB DEFAULT '{}'::JSONB, -- { strengths, improvements, ... }
  mastery_level mastery_level,
  
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Practical Assessments
CREATE INDEX IF NOT EXISTS idx_pa_student_id ON practical_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_pa_role ON practical_assessments(role);
CREATE INDEX IF NOT EXISTS idx_pa_status ON practical_assessments(status);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_assessments ENABLE ROW LEVEL SECURITY;

-- ADMIN: Full Access
DROP POLICY IF EXISTS "Admins full access assignment_submissions" ON assignment_submissions;
CREATE POLICY "Admins full access assignment_submissions" ON assignment_submissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins full access quiz_attempts" ON quiz_attempts;
CREATE POLICY "Admins full access quiz_attempts" ON quiz_attempts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins full access practical_assessments" ON practical_assessments;
CREATE POLICY "Admins full access practical_assessments" ON practical_assessments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- STUDENTS: Read Own, Create Own
DROP POLICY IF EXISTS "Students read own assignment_submissions" ON assignment_submissions;
CREATE POLICY "Students read own assignment_submissions" ON assignment_submissions
  FOR SELECT USING (student_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Students create assignment_submissions" ON assignment_submissions;
CREATE POLICY "Students create assignment_submissions" ON assignment_submissions
  FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Students update own assignment_submissions" ON assignment_submissions;
CREATE POLICY "Students update own assignment_submissions" ON assignment_submissions
  FOR UPDATE USING (student_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Students read own quiz_attempts" ON quiz_attempts;
CREATE POLICY "Students read own quiz_attempts" ON quiz_attempts
  FOR SELECT USING (student_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Students create quiz_attempts" ON quiz_attempts;
CREATE POLICY "Students create quiz_attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Students update own quiz_attempts" ON quiz_attempts;
CREATE POLICY "Students update own quiz_attempts" ON quiz_attempts
  FOR UPDATE USING (student_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Students read own practical_assessments" ON practical_assessments;
CREATE POLICY "Students read own practical_assessments" ON practical_assessments
  FOR SELECT USING (student_id::text = auth.uid()::text);

DROP POLICY IF EXISTS "Students create practical_assessments" ON practical_assessments;
CREATE POLICY "Students create practical_assessments" ON practical_assessments
  FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);
