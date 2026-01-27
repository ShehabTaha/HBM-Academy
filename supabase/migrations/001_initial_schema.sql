-- =============================================
-- HBM Academy Database Schema Migration
-- =============================================
-- Run this in your Supabase SQL Editor
-- This creates all tables, indexes, and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'admin');
CREATE TYPE lesson_type AS ENUM ('video', 'text', 'pdf', 'audio', 'quiz', 'survey', 'assignment');
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- =============================================
-- TABLES
-- =============================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role user_role DEFAULT 'student' NOT NULL,
  avatar TEXT,
  bio TEXT,
  is_email_verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT,
  level course_level DEFAULT 'beginner',
  price NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  duration INTEGER DEFAULT 0 NOT NULL, -- in minutes
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Sections table (course modules)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type lesson_type NOT NULL,
  content JSONB NOT NULL, -- Video URL, HTML, Quiz data, etc.
  description TEXT,
  downloadable_file TEXT,
  "order" INTEGER NOT NULL,
  duration INTEGER DEFAULT 0 NOT NULL, -- in minutes
  is_free_preview BOOLEAN DEFAULT false NOT NULL,
  is_prerequisite BOOLEAN DEFAULT false NOT NULL,
  enable_discussions BOOLEAN DEFAULT true NOT NULL,
  is_downloadable BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enrollments table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0 NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  UNIQUE(student_id, course_id) -- Prevent duplicate enrollments
);

-- Progress table
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  completed_at TIMESTAMPTZ,
  time_spent INTEGER DEFAULT 0 NOT NULL, -- in seconds
  last_position INTEGER DEFAULT 0 NOT NULL, -- for video/audio playback position
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(enrollment_id, lesson_id) -- One progress record per lesson per enrollment
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(course_id, student_id) -- One review per student per course
);

-- Certificates table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  certificate_url TEXT
);

-- =============================================
-- INDEXES
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Courses indexes
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_is_published ON courses(is_published);
CREATE INDEX idx_courses_category ON courses(category);

-- Sections indexes
CREATE INDEX idx_sections_course_id ON sections(course_id);
CREATE INDEX idx_sections_order ON sections(course_id, "order");

-- Lessons indexes
CREATE INDEX idx_lessons_section_id ON lessons(section_id);
CREATE INDEX idx_lessons_order ON lessons(section_id, "order");
CREATE INDEX idx_lessons_type ON lessons(type);

-- Enrollments indexes
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);

-- Progress indexes
CREATE INDEX idx_progress_enrollment_id ON progress(enrollment_id);
CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);

-- Reviews indexes
CREATE INDEX idx_reviews_course_id ON reviews(course_id);
CREATE INDEX idx_reviews_student_id ON reviews(student_id);

-- Certificates indexes
CREATE INDEX idx_certificates_enrollment_id ON certificates(enrollment_id);
CREATE INDEX idx_certificates_certificate_number ON certificates(certificate_number);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_progress_updated_at BEFORE UPDATE ON progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can read their own profile and other non-deleted users
CREATE POLICY "Users can read non-deleted users" ON users
  FOR SELECT USING (deleted_at IS NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Only admins can insert users (handled by auth system)
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Only admins can delete users
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- =============================================
-- COURSES TABLE POLICIES
-- =============================================

-- Anyone can read published courses
CREATE POLICY "Anyone can read published courses" ON courses
  FOR SELECT USING (is_published = true OR instructor_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'));

-- Lecturers and admins can create courses
CREATE POLICY "Lecturers can create courses" ON courses
  FOR INSERT WITH CHECK (
    instructor_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('lecturer', 'admin'))
  );

-- Instructors can update their own courses, admins can update all
CREATE POLICY "Instructors can update own courses" ON courses
  FOR UPDATE USING (
    instructor_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Instructors can delete their own courses, admins can delete all
CREATE POLICY "Instructors can delete own courses" ON courses
  FOR DELETE USING (
    instructor_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- =============================================
-- SECTIONS TABLE POLICIES
-- =============================================

-- Anyone can read sections of published courses
CREATE POLICY "Anyone can read sections of published courses" ON sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses WHERE id = sections.course_id AND (is_published = true OR instructor_id::text = auth.uid()::text)
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Course instructors can create sections
CREATE POLICY "Instructors can create sections" ON sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses WHERE id = sections.course_id AND (instructor_id::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'))
    )
  );

-- Course instructors can update/delete sections
CREATE POLICY "Instructors can update sections" ON sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM courses WHERE id = sections.course_id AND (instructor_id::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'))
    )
  );

CREATE POLICY "Instructors can delete sections" ON sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM courses WHERE id = sections.course_id AND (instructor_id::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'))
    )
  );

-- =============================================
-- LESSONS TABLE POLICIES
-- =============================================

-- Anyone can read free preview lessons, enrolled students can read all lessons
CREATE POLICY "Anyone can read lessons" ON lessons
  FOR SELECT USING (
    is_free_preview = true OR
    EXISTS (
      SELECT 1 FROM sections s
      JOIN courses c ON s.course_id = c.id
      WHERE s.id = lessons.section_id AND (
        c.instructor_id::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM enrollments WHERE student_id::text = auth.uid()::text AND course_id = c.id) OR
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
      )
    )
  );

-- Instructors can create lessons
CREATE POLICY "Instructors can create lessons" ON lessons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sections s
      JOIN courses c ON s.course_id = c.id
      WHERE s.id = lessons.section_id AND (
        c.instructor_id::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
      )
    )
  );

-- Instructors can update/delete lessons
CREATE POLICY "Instructors can update lessons" ON lessons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sections s
      JOIN courses c ON s.course_id = c.id
      WHERE s.id = lessons.section_id AND (
        c.instructor_id::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
      )
    )
  );

CREATE POLICY "Instructors can delete lessons" ON lessons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sections s
      JOIN courses c ON s.course_id = c.id
      WHERE s.id = lessons.section_id AND (
        c.instructor_id::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
      )
    )
  );

-- =============================================
-- ENROLLMENTS TABLE POLICIES
-- =============================================

-- Students can read their own enrollments
CREATE POLICY "Students can read own enrollments" ON enrollments
  FOR SELECT USING (
    student_id::text = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM courses WHERE id = enrollments.course_id AND instructor_id::text = auth.uid()::text
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Students can enroll themselves
CREATE POLICY "Students can enroll" ON enrollments
  FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);

-- Students can update their own enrollments (for completion)
CREATE POLICY "Students can update own enrollments" ON enrollments
  FOR UPDATE USING (student_id::text = auth.uid()::text);

-- =============================================
-- PROGRESS TABLE POLICIES
-- =============================================

-- Students can read their own progress
CREATE POLICY "Students can read own progress" ON progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments WHERE id = progress.enrollment_id AND student_id::text = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.id = progress.enrollment_id AND c.instructor_id::text = auth.uid()::text
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Students can create/update their own progress
CREATE POLICY "Students can create progress" ON progress
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments WHERE id = progress.enrollment_id AND student_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Students can update progress" ON progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM enrollments WHERE id = progress.enrollment_id AND student_id::text = auth.uid()::text
    )
  );

-- =============================================
-- REVIEWS TABLE POLICIES
-- =============================================

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

-- Students can create reviews for courses they're enrolled in
CREATE POLICY "Students can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    student_id::text = auth.uid()::text AND
    EXISTS (SELECT 1 FROM enrollments WHERE student_id::text = auth.uid()::text AND course_id = reviews.course_id)
  );

-- Students can update their own reviews
CREATE POLICY "Students can update own reviews" ON reviews
  FOR UPDATE USING (student_id::text = auth.uid()::text);

-- Students and admins can delete reviews
CREATE POLICY "Students can delete own reviews" ON reviews
  FOR DELETE USING (
    student_id::text = auth.uid()::text OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- =============================================
-- CERTIFICATES TABLE POLICIES
-- =============================================

-- Certificate owners can read their certificates
CREATE POLICY "Students can read own certificates" ON certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments WHERE id = certificates.enrollment_id AND student_id::text = auth.uid()::text
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );

-- Only system can create certificates (use service role)
CREATE POLICY "Service role can create certificates" ON certificates
  FOR INSERT WITH CHECK (true);

-- =============================================
-- STORAGE BUCKETS (Run separately in Storage UI or via API)
-- =============================================

-- Note: Create these buckets in Supabase Dashboard > Storage
-- 1. avatars - for user profile pictures
-- 2. course-thumbnails - for course cover images
-- 3. videos - for video lessons
-- 4. course-materials - for PDFs, documents
-- 5. audio-files - for audio lessons
-- 6. certificates - for generated certificates

-- =============================================
-- COMPLETED
-- =============================================

-- All tables, indexes, and RLS policies have been created
-- Next steps:
-- 1. Create storage buckets in Supabase Dashboard
-- 2. Configure storage bucket policies
-- 3. Test the setup with your application
