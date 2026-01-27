-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('course-thumbnails', 'course-thumbnails', true),
  ('videos', 'videos', false), 
  ('course-materials', 'course-materials', false),
  ('audio-files', 'audio-files', false),
  ('certificates', 'certificates', false)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

-- Remove ALTER TABLE command as it requires ownership and RLS is already enabled

-- Policies for 'course-thumbnails'
DROP POLICY IF EXISTS "Public Access Thumbnails" ON storage.objects;
CREATE POLICY "Public Access Thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Auth Upload Thumbnails" ON storage.objects;
CREATE POLICY "Auth Upload Thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-thumbnails' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Update Thumbnails" ON storage.objects;
CREATE POLICY "Auth Update Thumbnails" ON storage.objects FOR UPDATE USING (bucket_id = 'course-thumbnails' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Thumbnails" ON storage.objects;
CREATE POLICY "Auth Delete Thumbnails" ON storage.objects FOR DELETE USING (bucket_id = 'course-thumbnails' AND auth.role() = 'authenticated');

-- Policies for 'avatars'
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
CREATE POLICY "Auth Update Avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Policies for 'videos'
DROP POLICY IF EXISTS "Auth Read Videos" ON storage.objects;
CREATE POLICY "Auth Read Videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Upload Videos" ON storage.objects;
CREATE POLICY "Auth Upload Videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');
