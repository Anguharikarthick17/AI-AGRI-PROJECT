-- Run this in your Supabase SQL Editor

-- 1. Add document columns to applications table
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS document_url TEXT,
  ADD COLUMN IF NOT EXISTS document_name TEXT;

-- 2. Create the 'documents' storage bucket (public)
-- You can also do this manually in Supabase > Storage > New Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Make the 'documents' bucket publicly accessible
CREATE POLICY "Public read access on documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Allow anon uploads to documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');
