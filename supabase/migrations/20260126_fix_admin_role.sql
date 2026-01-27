-- 1. Promote 'shehabtaha00@gmail.com' to admin
UPDATE users
SET role = 'admin'
WHERE email = 'shehabtaha00@gmail.com';

-- 2. Fallback: If no admin exists (e.g. email mismatch), promote the most recent user
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin') THEN
        UPDATE users
        SET role = 'admin'
        WHERE id = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1);
    END IF;
END $$;

-- 3. Verify
SELECT id, email, role FROM users WHERE role = 'admin';
