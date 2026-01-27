-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in seconds
  file_size INTEGER NOT NULL, -- in bytes
  file_url TEXT NOT NULL, -- Supabase Storage URL
  thumbnail_url TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_public BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb, -- Array of tag strings
  usage_count INTEGER DEFAULT 0,
  metadata JSONB, -- {videoCodec, audioCodec, resolution, frameRate, uploadedAt}
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for videos
CREATE INDEX IF NOT EXISTS idx_videos_instructor_id ON videos(instructor_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_usage_count ON videos(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING GIN(tags);

-- RLS Policies for videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Instructors can see their own videos + public videos
CREATE POLICY "instructors_see_own_and_public" ON videos
  FOR SELECT USING (
    instructor_id = auth.uid() OR is_public = true OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Instructors can manage their own videos
CREATE POLICY "instructors_insert_own" ON videos
  FOR INSERT WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "instructors_update_own" ON videos
  FOR UPDATE USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "instructors_delete_own" ON videos
  FOR DELETE USING (instructor_id = auth.uid());

-- Admins can see all (redundant with first policy but good for clarity if role check gets complex)
-- CREATE POLICY "admins_see_all" ON videos
--   FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


-- Create lesson_videos junction table
CREATE TABLE IF NOT EXISTS lesson_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(lesson_id, video_id)
);

-- Indexes for lesson_videos
CREATE INDEX IF NOT EXISTS idx_lesson_videos_lesson_id ON lesson_videos(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_videos_video_id ON lesson_videos(video_id);

-- RLS Policies for lesson_videos
ALTER TABLE lesson_videos ENABLE ROW LEVEL SECURITY;

-- Allow access if user can access the lesson
CREATE POLICY "lesson_video_access" ON lesson_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons l
      JOIN sections s ON l.section_id = s.id
      JOIN courses c ON s.course_id = c.id
      WHERE l.id = lesson_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "lesson_video_insert" ON lesson_videos
  FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM lessons l
        JOIN sections s ON l.section_id = s.id
        JOIN courses c ON s.course_id = c.id
        WHERE l.id = lesson_id AND c.instructor_id = auth.uid()
    )
  );
  
CREATE POLICY "lesson_video_delete" ON lesson_videos
  FOR DELETE USING (
     EXISTS (
        SELECT 1 FROM lessons l
        JOIN sections s ON l.section_id = s.id
        JOIN courses c ON s.course_id = c.id
        WHERE l.id = lesson_id AND c.instructor_id = auth.uid()
    )
  );


-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, created_at, updated_at, owner, owner_id)
VALUES ('lecture-videos', 'lecture-videos', true, now(), now(), auth.uid(), auth.uid())
ON CONFLICT (id) DO NOTHING;

-- RLS Object Policies

-- Only authenticated users can upload
CREATE POLICY "authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'lecture-videos' AND auth.role() = 'authenticated');

-- Owner can update and delete their files
CREATE POLICY "owner_update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'lecture-videos' AND owner = auth.uid());

CREATE POLICY "owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'lecture-videos' AND owner = auth.uid());

-- Public read access (for video delivery)
CREATE POLICY "public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'lecture-videos');
