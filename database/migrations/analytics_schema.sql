-- ============================================================================
-- HBM ACADEMY ANALYTICS DATABASE SCHEMA
-- PostgreSQL / Supabase
-- Comprehensive schema for hospitality training analytics
-- ============================================================================

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Users table (extends existing schema)
-- ALTER TABLE IF NOT EXISTS users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- ============================================================================
-- ENROLLMENT & PROGRAMS
-- ============================================================================

-- Note: enrollments table already exists in main schema with student_id
-- We only add new columns needed for analytics

-- Add analytics-specific columns to existing enrollments table
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS role_type VARCHAR(50);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS cohort_id VARCHAR(100);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Update role_type with default values if NULL
UPDATE enrollments SET role_type = 'fb_service' WHERE role_type IS NULL;

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_enrollments_role_type ON enrollments(role_type);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_cohort_id ON enrollments(cohort_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_completed_at ON enrollments(completed_at);

-- ============================================================================
-- COURSES & COMPLETIONS
-- ============================================================================

-- Course Completions
CREATE TABLE IF NOT EXISTS course_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL, -- references courses(id) but FK might be optional depending on exact schema
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  satisfaction_rating DECIMAL(2, 1) CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  CONSTRAINT course_completions_student_course_unique UNIQUE (student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_completions_student_id ON course_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_course_completions_course_id ON course_completions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_completions_completed_at ON course_completions(completed_at);

-- ============================================================================
-- ASSESSMENTS
-- ============================================================================

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'knowledge_quiz', 'practical_demo', 'simulation', 'portfolio', 'role_play'
  title VARCHAR(255) NOT NULL,
  passing_score DECIMAL(5, 2) DEFAULT 70.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_course_id ON assessments(course_id);
CREATE INDEX idx_assessments_type ON assessments(type);

-- Assessment Attempts
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  score DECIMAL(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  status VARCHAR(50) NOT NULL, -- 'passed', 'failed'
  attempt_number INT DEFAULT 1,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessment_attempts_student_id ON assessment_attempts(student_id);
CREATE INDEX idx_assessment_attempts_assessment_id ON assessment_attempts(assessment_id);
CREATE INDEX idx_assessment_attempts_attempted_at ON assessment_attempts(attempted_at);
CREATE INDEX idx_assessment_attempts_status ON assessment_attempts(status);

-- ============================================================================
-- COMPETENCIES
-- ============================================================================

-- Competency Definitions
CREATE TABLE IF NOT EXISTS competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Competency Progress
CREATE TABLE IF NOT EXISTS student_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  mastery_level DECIMAL(5, 2) NOT NULL CHECK (mastery_level >= 0 AND mastery_level <= 100),
  achieved_at TIMESTAMPTZ,
  days_to_master INT,
  last_assessed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT student_competencies_student_competency_unique UNIQUE (student_id, competency_id)
);

CREATE INDEX idx_student_competencies_student_id ON student_competencies(student_id);
CREATE INDEX idx_student_competencies_competency_id ON student_competencies(competency_id);
CREATE INDEX idx_student_competencies_mastery_level ON student_competencies(mastery_level);

-- ============================================================================
-- SOFT SKILLS
-- ============================================================================

-- Soft Skills Assessments
CREATE TABLE IF NOT EXISTS soft_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_type VARCHAR(50) NOT NULL, -- 'customer_service', 'communication', 'teamwork', 'emotional_intelligence', 'professionalism'
  pre_score DECIMAL(5, 2) NOT NULL CHECK (pre_score >= 0 AND pre_score <= 100),
  post_score DECIMAL(5, 2) CHECK (post_score >= 0 AND post_score <= 100),
  measured_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_soft_skills_student_id ON soft_skills(student_id);
CREATE INDEX idx_soft_skills_skill_type ON soft_skills(skill_type);
CREATE INDEX idx_soft_skills_measured_at ON soft_skills(measured_at);

-- ============================================================================
-- ATTENDANCE & ENGAGEMENT
-- ============================================================================

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'present', 'absent', 'late', 'excused'
  punctual BOOLEAN DEFAULT true,
  participated BOOLEAN DEFAULT false,
  session_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_session_id ON attendance(session_id);
CREATE INDEX idx_attendance_session_date ON attendance(session_date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- ============================================================================
-- CERTIFICATIONS
-- ============================================================================

-- Certification Types
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(100) NOT NULL, -- 'tesda_nc2_housekeeping', 'tesda_nc2_fb', 'food_safety', 'first_aid', 'cpr'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Certifications
CREATE TABLE IF NOT EXISTS student_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- 'eligible', 'in_progress', 'passed', 'failed'
  attempt_number INT DEFAULT 1,
  issued_at TIMESTAMPTZ,
  expiry_at TIMESTAMPTZ,
  CONSTRAINT student_certifications_student_cert_unique UNIQUE (student_id, certification_id)
);

CREATE INDEX idx_student_certifications_student_id ON student_certifications(student_id);
CREATE INDEX idx_student_certifications_certification_id ON student_certifications(certification_id);
CREATE INDEX idx_student_certifications_status ON student_certifications(status);

-- ============================================================================
-- EMPLOYMENT OUTCOMES
-- ============================================================================

-- Employers
CREATE TABLE IF NOT EXISTS employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employment Outcomes
CREATE TABLE IF NOT EXISTS employment_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employed BOOLEAN DEFAULT false,
  job_title VARCHAR(255),
  salary_range VARCHAR(100), -- e.g., '15000-20000'
  salary_amount DECIMAL(10, 2),
  employer_id UUID REFERENCES employers(id),
  hired_at TIMESTAMPTZ,
  still_employed BOOLEAN DEFAULT true,
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employment_outcomes_student_id ON employment_outcomes(student_id);
CREATE INDEX idx_employment_outcomes_employer_id ON employment_outcomes(employer_id);
CREATE INDEX idx_employment_outcomes_hired_at ON employment_outcomes(hired_at);
CREATE INDEX idx_employment_outcomes_employed ON employment_outcomes(employed);

-- Employer Feedback
CREATE TABLE IF NOT EXISTS employer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  nps_score INT CHECK (nps_score >= 0 AND nps_score <= 10),
  feedback TEXT,
  skills_gaps JSONB, -- Array of skill gaps identified
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employer_feedback_student_id ON employer_feedback(student_id);
CREATE INDEX idx_employer_feedback_employer_id ON employer_feedback(employer_id);
CREATE INDEX idx_employer_feedback_nps_score ON employer_feedback(nps_score);

-- ============================================================================
-- DATABASE VIEWS FOR PERFORMANCE
-- ============================================================================

-- View: Student Analytics Summary
CREATE OR REPLACE VIEW student_analytics_summary AS
SELECT 
  u.id as student_id,
  u.email,
  u.name as full_name,
  e.role_type,
  e.cohort_id,
  e.enrolled_at,
  e.completed_at,
  e.status as enrollment_status,
  COUNT(DISTINCT CASE WHEN p.is_completed THEN l.id END) as lessons_completed,
  AVG(aa.score) as avg_assessment_score,
  COUNT(DISTINCT CASE WHEN aa.status = 'passed' THEN aa.assessment_id END)::DECIMAL / 
    NULLIF(COUNT(DISTINCT aa.assessment_id), 0) * 100 as pass_rate,
  AVG(ss.post_score) as soft_skills_average,
  AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100 as attendance_rate,
  eo.employed,
  eo.job_title,
  eo.hired_at
FROM users u
LEFT JOIN enrollments e ON u.id = e.student_id
LEFT JOIN progress p ON e.id = p.enrollment_id
LEFT JOIN lessons l ON p.lesson_id = l.id
LEFT JOIN assessment_attempts aa ON u.id = aa.student_id
LEFT JOIN soft_skills ss ON u.id = ss.student_id
LEFT JOIN attendance a ON u.id = a.student_id
LEFT JOIN employment_outcomes eo ON u.id = eo.student_id
WHERE u.role = 'student'
GROUP BY u.id, u.email, u.name, e.role_type, e.cohort_id, e.enrolled_at, 
         e.completed_at, e.status, eo.employed, eo.job_title, eo.hired_at;

-- View: Competency Mastery Summary
CREATE OR REPLACE VIEW competency_mastery_summary AS
SELECT 
  c.id as competency_id,
  c.name as competency_name,
  c.category,
  c.is_critical,
  COUNT(DISTINCT sc.student_id) as students_attempted,
  COUNT(DISTINCT CASE WHEN sc.mastery_level >= 80 THEN sc.student_id END) as students_mastered,
  COUNT(DISTINCT CASE WHEN sc.mastery_level >= 80 THEN sc.student_id END)::DECIMAL / 
    NULLIF(COUNT(DISTINCT sc.student_id), 0) * 100 as mastery_percentage,
  AVG(sc.days_to_master) as avg_days_to_master
FROM competencies c
LEFT JOIN student_competencies sc ON c.id = sc.competency_id
GROUP BY c.id, c.name, c.category, c.is_critical;

-- ============================================================================
-- SAMPLE DATA INSERTS (FOR TESTING)
-- ============================================================================

-- Insert sample competencies
INSERT INTO competencies (name, category, is_critical) VALUES
  ('Guest Service Excellence', 'Service', true),
  ('Food Safety & Hygiene', 'Safety', true),
  ('Room Preparation Standards', 'Housekeeping', true),
  ('PMS Operations', 'Technology', true),
  ('Communication Skills', 'Soft Skills', false),
  ('Teamwork & Collaboration', 'Soft Skills', false)
ON CONFLICT (name) DO NOTHING;

-- Insert sample certifications
INSERT INTO certifications (name, type) VALUES
  ('TESDA NC II - Housekeeping', 'tesda_nc2_housekeeping'),
  ('TESDA NC II - F&B Service', 'tesda_nc2_fb'),
  ('TESDA NC II - Front Office', 'tesda_nc2_front_office'),
  ('Food Safety Certification', 'food_safety'),
  ('First Aid & CPR', 'first_aid')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Composite indexes for common queries
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_enrollments_student_course ON enrollments(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_assessment ON assessment_attempts(student_id, assessment_id);
CREATE INDEX IF NOT EXISTS idx_student_competencies_student_competency ON student_competencies(student_id, competency_id);

-- ============================================================================
-- PERMISSIONS (Row Level Security)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE soft_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_feedback ENABLE ROW LEVEL SECURITY;

-- Admin can see all data
CREATE POLICY "Admins can view all analytics data" ON enrollments
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Apply same policy to other tables (repeat for each table)
-- ... (similar policies for other tables)

-- ============================================================================
-- NOTES
-- ============================================================================

-- This schema provides:
-- 1. Complete tracking of student progress across all hospitality roles
-- 2. Competency mastery measurement
-- 3. Soft skills pre/post assessment
-- 4. Attendance and engagement metrics
-- 5. Assessment performance by type
-- 6. Industry certification tracking
-- 7. Employment outcome tracking with employer feedback
-- 8. Cohort analysis capabilities
-- 9. Performance-optimized views and indexes
--
-- To use this schema:
-- 1. Run in Supabase SQL editor
-- 2. Verify all tables created successfully
-- 3. Check indexes are in place
-- 4. Test with sample data inserts
-- 5. Update API routes to use these tables
