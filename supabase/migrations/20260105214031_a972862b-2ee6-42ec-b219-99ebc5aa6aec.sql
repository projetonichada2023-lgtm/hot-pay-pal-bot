-- Add Facebook tracking fields to client_settings
ALTER TABLE public.client_settings
ADD COLUMN IF NOT EXISTS facebook_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS facebook_access_token TEXT,
ADD COLUMN IF NOT EXISTS facebook_test_event_code TEXT,
ADD COLUMN IF NOT EXISTS facebook_tracking_enabled BOOLEAN DEFAULT false;