-- ============================================================================
-- SEED DATA FOR STUDENT SUBMISSIONS
-- ============================================================================
-- This script creates sample submission data for testing
-- 
-- IMPORTANT: Before running this, you need to get actual IDs from your database
-- Run these queries first and copy the IDs:
--
-- 1. Get a student ID:
--    SELECT id, email FROM users WHERE role = 'student' LIMIT 1;
--
-- 2. Get a lesson ID:
--    SELECT id, title FROM lessons LIMIT 1;
--
-- 3. Get a course ID:
--    SELECT id, title FROM courses LIMIT 1;
--
-- Then replace the UUIDs below with your actual IDs
-- ============================================================================

-- Replace these with your actual IDs from the queries above
DO $$
DECLARE
  v_student_id UUID;
  v_lesson_id UUID;
  v_course_id UUID;
BEGIN
  -- Get existing IDs or create placeholder message
  SELECT id INTO v_student_id FROM users WHERE role = 'student' LIMIT 1;
  SELECT id INTO v_lesson_id FROM lessons LIMIT 1;
  SELECT id INTO v_course_id FROM courses LIMIT 1;

  -- Check if we have the required data
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'No students found in database. Please create a student user first.';
  END IF;

  IF v_lesson_id IS NULL THEN
    RAISE EXCEPTION 'No lessons found in database. Please create a lesson first.';
  END IF;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'No courses found in database. Please create a course first.';
  END IF;

  -- Insert assignment submissions
  INSERT INTO assignment_submissions (
    assignment_id,
    student_id,
    course_id,
    submitted_file_url,
    file_name,
    submitted_content,
    status,
    attempt_number,
    admin_feedback,
    submitted_at
  ) VALUES
  (
    v_lesson_id,
    v_student_id,
    v_course_id,
    'https://example.com/files/assignment1.pdf',
    'introduction-essay.pdf',
    'This is my completed assignment on the fundamentals of hospitality management.',
    'pending',
    1,
    NULL,
    NOW() - INTERVAL '2 days'
  ),
  (
    v_lesson_id,
    v_student_id,
    v_course_id,
    'https://example.com/files/assignment2.pdf',
    'customer-service-analysis.pdf',
    'Analysis of customer service best practices in the hospitality industry.',
    'approved',
    1,
    'Excellent work! Your analysis demonstrates a deep understanding of customer service principles.',
    NOW() - INTERVAL '5 days'
  ),
  (
    v_lesson_id,
    v_student_id,
    v_course_id,
    'https://example.com/files/assignment3.docx',
    'marketing-strategy.docx',
    'Marketing strategy for a boutique hotel.',
    'needs_revision',
    2,
    'Good start, but please expand on your target audience analysis and include more specific metrics.',
    NOW() - INTERVAL '3 days'
  ),
  (
    v_lesson_id,
    v_student_id,
    v_course_id,
    NULL,
    NULL,
    'Brief answer to the assignment question.',
    'rejected',
    1,
    'This submission does not meet the minimum requirements. Please review the assignment guidelines.',
    NOW() - INTERVAL '1 day'
  ),
  (
    v_lesson_id,
    v_student_id,
    v_course_id,
    'https://example.com/files/assignment5.pdf',
    'operational-efficiency.pdf',
    'Report on improving operational efficiency in hotel management.',
    'pending',
    1,
    NULL,
    NOW() - INTERVAL '6 hours'
  );

  -- Insert quiz attempts
  INSERT INTO quiz_attempts (
    quiz_id,
    student_id,
    course_id,
    started_at,
    completed_at,
    duration,
    total_points,
    earned_points,
    percentage,
    passing_percentage,
    is_passing,
    status,
    responses
  ) VALUES
  (
    v_lesson_id,
    v_student_id,
    v_course_id,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '15 minutes',
    900,
    100,
    85.5,
    85.5,
    70.0,
    true,
    'graded',
    '[
      {"questionId": "q1", "questionText": "What is the primary goal of hospitality management?", "questionType": "multiple_choice", "studentAnswer": "A", "correctAnswer": "A", "isCorrect": true, "pointsEarned": 10, "maxPoints": 10},
      {"questionId": "q2", "questionText": "Which of these is a key component of customer service excellence?", "questionType": "multiple_choice", "studentAnswer": "B", "correctAnswer": "B", "isCorrect": true, "pointsEarned": 10, "maxPoints": 10},
      {"questionId": "q3", "questionText": "What does OTA stand for in the hospitality industry?", "questionType": "multiple_choice", "studentAnswer": "C", "correctAnswer": "A", "isCorrect": false, "pointsEarned": 0, "maxPoints": 15},
      {"questionId": "q4", "questionText": "Describe the importance of first impressions in guest interactions.", "questionType": "short_answer", "studentAnswer": "D", "correctAnswer": "D", "isCorrect": true, "pointsEarned": 65.5, "maxPoints": 65}
    ]'::jsonb
  ),
  (
    v_lesson_id,
    v_student_id,
    v_course_id,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '20 minutes',
    1200,
    100,
    55.0,
    55.0,
    70.0,
    false,
    'graded',
    '[
      {"questionId": "q1", "questionText": "What is revenue management in hotels?", "questionType": "multiple_choice", "studentAnswer": "A", "correctAnswer": "A", "isCorrect": true, "pointsEarned": 20, "maxPoints": 20},
      {"questionId": "q2", "questionText": "Which metric is most important for hotel profitability?", "questionType": "multiple_choice", "studentAnswer": "B", "correctAnswer": "D", "isCorrect": false, "pointsEarned": 0, "maxPoints": 20},
      {"questionId": "q3", "questionText": "What does ADR stand for?", "questionType": "multiple_choice", "studentAnswer": "C", "correctAnswer": "C", "isCorrect": true, "pointsEarned": 15, "maxPoints": 15},
      {"questionId": "q4", "questionText": "True or False: Guest satisfaction directly impacts online reviews.", "questionType": "true_false", "studentAnswer": "True", "correctAnswer": "True", "isCorrect": true, "pointsEarned": 20, "maxPoints": 20}
    ]'::jsonb
  ),
  (
    v_lesson_id,
    v_student_id,
    v_course_id,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '12 minutes',
    720,
    100,
    98.0,
    98.0,
    70.0,
    true,
    'graded',
    '[
      {"questionId": "q1", "questionText": "What is the role of a concierge in luxury hotels?", "questionType": "multiple_choice", "studentAnswer": "A", "correctAnswer": "A", "isCorrect": true, "pointsEarned": 25, "maxPoints": 25},
      {"questionId": "q2", "questionText": "How do you handle an upset guest?", "questionType": "essay", "studentAnswer": "Listen empathetically, acknowledge their concerns, apologize sincerely, offer solutions, and follow up to ensure satisfaction.", "correctAnswer": "B", "isCorrect": true, "pointsEarned": 25, "maxPoints": 25},
      {"questionId": "q3", "questionText": "What is upselling in the context of hospitality?", "questionType": "multiple_choice", "studentAnswer": "C", "correctAnswer": "C", "isCorrect": true, "pointsEarned": 25, "maxPoints": 25},
      {"questionId": "q4", "questionText": "Define the term \"guest journey\".", "questionType": "short_answer", "studentAnswer": "The guest journey encompasses all touchpoints and experiences from initial booking through post-stay follow-up.", "correctAnswer": "D", "isCorrect": true, "pointsEarned": 23, "maxPoints": 25}
    ]'::jsonb
  );

  -- Insert practical assessments
  INSERT INTO practical_assessments (
    student_id,
    competency_name,
    role,
    submitted_at,
    evidence_url,
    status,
    rubric_scores,
    overall_score,
    admin_feedback,
    mastery_level
  ) VALUES
  (
    v_student_id,
    'Table Service Excellence',
    'F&B Service',
    NOW() - INTERVAL '1 day',
    'https://example.com/videos/table-service-demo.mp4',
    'pending',
    '{}'::jsonb,
    NULL,
    '{}'::jsonb,
    NULL
  ),
  (
    v_student_id,
    'Room Cleaning Standards',
    'Housekeeping',
    NOW() - INTERVAL '5 days',
    'https://example.com/videos/room-cleaning.mp4',
    'approved',
    '{"technique": 5, "efficiency": 5, "attention_to_detail": 5, "professionalism": 5}'::jsonb,
    5.0,
    '{"strengths": "Exceptional attention to detail, efficient workflow, professional demeanor throughout", "improvements": "Continue maintaining these high standards", "recommendations": "Ready for advanced housekeeping modules"}'::jsonb,
    'mastery'
  ),
  (
    v_student_id,
    'Guest Check-in Procedure',
    'Front Desk',
    NOW() - INTERVAL '3 days',
    'https://example.com/videos/checkin-demo.mp4',
    'needs_revision',
    '{"communication": 3, "efficiency": 2, "system_knowledge": 3, "professionalism": 4}'::jsonb,
    3.0,
    '{"strengths": "Good professional demeanor and welcoming attitude", "improvements": "Practice the PMS system more to improve speed. Work on clearer communication of hotel policies", "recommendations": "Review the check-in training video and practice with the simulation software"}'::jsonb,
    'needs_work'
  ),
  (
    v_student_id,
    'Cocktail Preparation',
    'Bar Service',
    NOW() - INTERVAL '2 days',
    'https://example.com/videos/cocktail-prep.mp4',
    'approved',
    '{"technique": 4, "presentation": 4, "knowledge": 4, "speed": 4}'::jsonb,
    4.0,
    '{"strengths": "Solid technique, good product knowledge, attractive presentation", "improvements": "Could improve speed during peak service times", "recommendations": "Ready to move to advanced mixology"}'::jsonb,
    'proficient'
  ),
  (
    v_student_id,
    'Event Setup and Breakdown',
    'Banquet Service',
    NOW() - INTERVAL '12 hours',
    'https://example.com/videos/banquet-setup.mp4',
    'pending',
    '{}'::jsonb,
    NULL,
    '{}'::jsonb,
    NULL
  );

  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Assignment submissions: %', (SELECT COUNT(*) FROM assignment_submissions);
  RAISE NOTICE 'Quiz attempts: %', (SELECT COUNT(*) FROM quiz_attempts);
  RAISE NOTICE 'Practical assessments: %', (SELECT COUNT(*) FROM practical_assessments);
END $$;
