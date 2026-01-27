-- 1. Promote 'shehabtaha00@gmail.com' to admin
UPDATE users
SET role = 'admin'
WHERE email = 'shehabtaha00@gmail.com';

-- 2. Remove all other users
DELETE FROM users
WHERE email != 'shehabtaha00@gmail.com';

-- Verification: Output the remaining user
SELECT id, email, role FROM users;
