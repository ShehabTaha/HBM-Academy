-- ============================================================================
-- SEED DATA FOR ANALYTICS DASHBOARD
-- Run this in Supabase SQL Editor to populate your dashboard with realistic data
-- ============================================================================

-- 1. Create Instructor User (Required for Course FK)
-- UUID prefix 'b' for users
INSERT INTO users (id, email, name, role, is_email_verified, password, created_at, updated_at)
VALUES
 ('b0000000-0000-0000-0000-000000000000', 'instructor@hbmacademy.com', 'System Instructor', 'admin', true, '$2b$10$EpRnTzVlqHNP0.fKbX9vx.tMgD/WjdbZ5Q7.u8.jP.gN8.gN8.gN8', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Create Sample Courses with proper IDs
-- UUID prefix 'c' for courses (Valid hex)
INSERT INTO courses (id, title, slug, description, instructor_id, price, duration, is_published, payment_type, created_at)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'F&B Service Mastery', 'fb-service-mastery', 'Complete F&B training', 'b0000000-0000-0000-0000-000000000000', 99, 40, true, 'one-time', NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'Housekeeping Professional', 'housekeeping-pro', 'Standard room prep', 'b0000000-0000-0000-0000-000000000000', 99, 30, true, 'one-time', NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'Front Office Operations', 'front-office-ops', 'Guest relations', 'b0000000-0000-0000-0000-000000000000', 149, 50, true, 'one-time', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Create Sample Competencies
-- UUID prefix 'a' for competencies (replaced 'k')
INSERT INTO competencies (id, name, category, is_critical)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Guest Service Excellence', 'Service', true),
  ('a0000000-0000-0000-0000-000000000002', 'Food Safety & Hygiene', 'Safety', true),
  ('a0000000-0000-0000-0000-000000000003', 'Room Preparation Standards', 'Housekeeping', true),
  ('a0000000-0000-0000-0000-000000000004', 'PMS Operations', 'Technology', true),
  ('a0000000-0000-0000-0000-000000000005', 'Communication Skills', 'Soft Skills', false),
  ('a0000000-0000-0000-0000-000000000006', 'Conflict Resolution', 'Soft Skills', true)
ON CONFLICT (name) DO UPDATE SET id = EXCLUDED.id; 

-- 4. Create Sample Students
-- UUID prefix 'b' for users (replaced 'u')
INSERT INTO users (id, email, name, role, is_email_verified, password, created_at, updated_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'student1@example.com', 'Alice Cruz', 'student', true, '$2b$10$EpRnTzVlqHNP0.fKbX9vx.tMgD/WjdbZ5Q7.u8.jP.gN8.gN8.gN8', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000002', 'student2@example.com', 'Bob Santos', 'student', true, '$2b$10$EpRnTzVlqHNP0.fKbX9vx.tMgD/WjdbZ5Q7.u8.jP.gN8.gN8.gN8', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000003', 'student3@example.com', 'Charlie Reyes', 'student', true, '$2b$10$EpRnTzVlqHNP0.fKbX9vx.tMgD/WjdbZ5Q7.u8.jP.gN8.gN8.gN8', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000004', 'student4@example.com', 'Diana Lim', 'student', true, '$2b$10$EpRnTzVlqHNP0.fKbX9vx.tMgD/WjdbZ5Q7.u8.jP.gN8.gN8.gN8', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000005', 'student5@example.com', 'Eddie Garcia', 'student', true, '$2b$10$EpRnTzVlqHNP0.fKbX9vx.tMgD/WjdbZ5Q7.u8.jP.gN8.gN8.gN8', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000006', 'student6@example.com', 'Fiona Yap', 'student', true, '$2b$10$EpRnTzVlqHNP0.fKbX9vx.tMgD/WjdbZ5Q7.u8.jP.gN8.gN8.gN8', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000007', 'student7@example.com', 'George Tan', 'student', true, '$2b$10$EpRnTzVlqHNP0.fKbX9vx.tMgD/WjdbZ5Q7.u8.jP.gN8.gN8.gN8', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000008', 'student8@example.com', 'Hannah Dy', 'student', true, '$2b$10$EpRnTzVlqHNP0.fKbX9vx.tMgD/WjdbZ5Q7.u8.jP.gN8.gN8.gN8', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET id = users.id;

-- 5. Create Enrollments with Roles
INSERT INTO enrollments (student_id, course_id, role_type, status, enrolled_at)
VALUES
  -- F&B Students
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'fb_service', 'active', NOW() - INTERVAL '3 months'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'fb_service', 'active', NOW() - INTERVAL '2 months'),
  -- Housekeeping Students
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'housekeeping', 'active', NOW() - INTERVAL '4 months'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'housekeeping', 'completed', NOW() - INTERVAL '5 months'),
  -- Front Office Students
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'front_office', 'active', NOW() - INTERVAL '1 month'),
  ('b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'front_office', 'active', NOW() - INTERVAL '2 months')
ON CONFLICT DO NOTHING;

-- 6. Create Student Competency Data (Historical for Trends)

-- Guest Service Excellence (Improving Trend)
INSERT INTO student_competencies (student_id, competency_id, mastery_level, days_to_master, last_assessed_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 85, 12, NOW()), -- Current
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 75, 15, NOW() - INTERVAL '1 month'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 65, 20, NOW() - INTERVAL '2 months'),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 60, 25, NOW() - INTERVAL '3 months'),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 95, 10, NOW());

-- Food Safety (Stable High)
INSERT INTO student_competencies (student_id, competency_id, mastery_level, days_to_master, last_assessed_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 90, 8, NOW()),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 88, 9, NOW() - INTERVAL '1 month'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 92, 7, NOW() - INTERVAL '2 months');

-- PMS Operations (Needs work)
INSERT INTO student_competencies (student_id, competency_id, mastery_level, days_to_master, last_assessed_at) VALUES
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 55, 30, NOW()),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 45, 35, NOW());

-- 7. Insert Certification Data (For KPI Cards)
INSERT INTO student_certifications (student_id, certification_id, status, issued_at)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', (SELECT id FROM certifications LIMIT 1), 'passed', NOW()),
  ('b0000000-0000-0000-0000-000000000003', (SELECT id FROM certifications LIMIT 1), 'passed', NOW());

-- 8. Insert Attendance Data
INSERT INTO attendance (student_id, session_id, status, session_date)
VALUES
 ('b0000000-0000-0000-0000-000000000001', gen_random_uuid(), 'present', NOW()),
 ('b0000000-0000-0000-0000-000000000002', gen_random_uuid(), 'present', NOW()),
 ('b0000000-0000-0000-0000-000000000003', gen_random_uuid(), 'late', NOW());
