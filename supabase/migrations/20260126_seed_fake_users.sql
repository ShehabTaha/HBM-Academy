-- Create a dedicated instructor first
INSERT INTO users (id, email, name, password, role, is_email_verified, created_at, updated_at)
VALUES
('a0000000-0000-0000-0000-000000000001', 'instructor@hbm-academy.com', 'HBM Instructor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lecturer', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Seed Student Users (Password is 'password')
INSERT INTO users (email, name, password, role, is_email_verified, created_at, updated_at)
VALUES
('alice@example.com', 'Alice Johnson', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, NOW(), NOW()),
('bob@example.com', 'Bob Smith', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', false, NOW(), NOW()),
('charlie@example.com', 'Charlie Brown', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, NOW(), NOW()),
('diana@example.com', 'Diana Prince', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, NOW(), NOW()),
('evan@example.com', 'Evan Wright', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', false, NOW(), NOW()),
('fiona@example.com', 'Fiona Gallagher', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, NOW(), NOW()),
('george@example.com', 'George Martin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, NOW(), NOW()),
('hannah@example.com', 'Hannah Abbout', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, NOW(), NOW()),
('ian@example.com', 'Ian Somerhalder', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', false, NOW(), NOW()),
('julia@example.com', 'Julia Roberts', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Seed Courses using the dedicated instructor
INSERT INTO courses (title, slug, description, instructor_id, price, is_published, created_at, updated_at, payment_type, duration)
VALUES 
('Intro to Web Development', 'intro-web-dev', 'Learn the basics of HTML, CSS, and JS', 'a0000000-0000-0000-0000-000000000001', 0, true, NOW(), NOW(), 'one-time', 120),
('Advanced React Patterns', 'adv-react', 'Master React hooks and patterns', 'a0000000-0000-0000-0000-000000000001', 49, true, NOW(), NOW(), 'one-time', 240)
ON CONFLICT (slug) DO NOTHING;

-- Seed Enrollments (using student emails to find their IDs)
DO $$
DECLARE
    alice_id uuid;
    bob_id uuid;
    charlie_id uuid;
    diana_id uuid;
    course1_id uuid;
    course2_id uuid;
BEGIN
    -- Get user IDs
    SELECT id INTO alice_id FROM users WHERE email = 'alice@example.com';
    SELECT id INTO bob_id FROM users WHERE email = 'bob@example.com';
    SELECT id INTO charlie_id FROM users WHERE email = 'charlie@example.com';
    SELECT id INTO diana_id FROM users WHERE email = 'diana@example.com';
    
    -- Get course IDs
    SELECT id INTO course1_id FROM courses WHERE slug = 'intro-web-dev';
    SELECT id INTO course2_id FROM courses WHERE slug = 'adv-react';
    
    -- Insert enrollments if users and courses exist
    IF alice_id IS NOT NULL AND course1_id IS NOT NULL THEN
        INSERT INTO enrollments (student_id, course_id, enrolled_at, progress_percentage)
        VALUES (alice_id, course1_id, NOW(), 10)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF alice_id IS NOT NULL AND course2_id IS NOT NULL THEN
        INSERT INTO enrollments (student_id, course_id, enrolled_at, progress_percentage)
        VALUES (alice_id, course2_id, NOW(), 50)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF bob_id IS NOT NULL AND course1_id IS NOT NULL THEN
        INSERT INTO enrollments (student_id, course_id, enrolled_at, progress_percentage)
        VALUES (bob_id, course1_id, NOW(), 0)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF charlie_id IS NOT NULL AND course1_id IS NOT NULL THEN
        INSERT INTO enrollments (student_id, course_id, enrolled_at, progress_percentage)
        VALUES (charlie_id, course1_id, NOW(), 100)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF diana_id IS NOT NULL AND course2_id IS NOT NULL THEN
        INSERT INTO enrollments (student_id, course_id, enrolled_at, progress_percentage)
        VALUES (diana_id, course2_id, NOW(), 25)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
