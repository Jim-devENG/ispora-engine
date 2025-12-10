-- Create Storage Buckets and Policies
-- This migration creates all necessary storage buckets and access policies

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Project files bucket (documents, images, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/*']
)
ON CONFLICT (id) DO NOTHING;

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Voice notes bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-notes',
  'voice-notes',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
)
ON CONFLICT (id) DO NOTHING;

-- Recordings bucket (video recordings)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  false, -- Private bucket
  104857600, -- 100MB limit
  ARRAY['video/webm', 'video/mp4', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- Deliverables bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deliverables',
  'deliverables',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- Learning content bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'learning-content',
  'learning-content',
  false, -- Private bucket
  104857600, -- 100MB limit
  ARRAY['application/pdf', 'video/*', 'audio/*', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- Research documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'research-documents',
  'research-documents',
  false, -- Private bucket
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/*']
)
ON CONFLICT (id) DO NOTHING;

-- Campaign assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-assets',
  'campaign-assets',
  true, -- Public bucket (campaign assets are usually public)
  10485760, -- 10MB limit
  ARRAY['image/*', 'application/pdf', 'video/*']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Project Files Policies
CREATE POLICY "Project members can upload project files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can view project files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can delete project files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-files' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

-- Avatars Policies (public read, authenticated write)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Voice Notes Policies
CREATE POLICY "Project members can upload voice notes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-notes' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can view voice notes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'voice-notes' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can delete voice notes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'voice-notes' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

-- Recordings Policies
CREATE POLICY "Project members can upload recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recordings' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can view recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'recordings' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can delete recordings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recordings' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

-- Deliverables Policies
CREATE POLICY "Project members can upload deliverables"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deliverables' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can view deliverables"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deliverables' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can delete deliverables"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'deliverables' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

-- Learning Content Policies
CREATE POLICY "Project members can upload learning content"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'learning-content' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can view learning content"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'learning-content' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can delete learning content"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'learning-content' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

-- Research Documents Policies
CREATE POLICY "Project members can upload research documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'research-documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can view research documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'research-documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

CREATE POLICY "Project members can delete research documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'research-documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM projects
      WHERE author_id = auth.uid() OR
      auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
    )
  );

-- Campaign Assets Policies (public read, authenticated write)
CREATE POLICY "Anyone can view campaign assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'campaign-assets');

CREATE POLICY "Authenticated users can upload campaign assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'campaign-assets' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Campaign creators can delete campaign assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'campaign-assets' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM campaigns
      WHERE author_id = auth.uid()
    )
  );

