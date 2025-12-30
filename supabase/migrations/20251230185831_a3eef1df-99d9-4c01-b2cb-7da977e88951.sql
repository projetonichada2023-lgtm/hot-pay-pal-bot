-- Add test_event_code column to client_settings for TikTok test events
ALTER TABLE public.client_settings 
ADD COLUMN IF NOT EXISTS tiktok_test_event_code text DEFAULT NULL;