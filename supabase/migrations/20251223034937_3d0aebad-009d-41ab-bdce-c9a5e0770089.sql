-- Add media columns to bot_messages
ALTER TABLE public.bot_messages 
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS media_type text;

-- Create storage bucket for bot media
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('bot-media', 'bot-media', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to bot-media bucket
CREATE POLICY "Users can upload bot media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bot-media' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to bot media
CREATE POLICY "Public can view bot media"
ON storage.objects FOR SELECT
USING (bucket_id = 'bot-media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete bot media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bot-media' 
  AND auth.role() = 'authenticated'
);