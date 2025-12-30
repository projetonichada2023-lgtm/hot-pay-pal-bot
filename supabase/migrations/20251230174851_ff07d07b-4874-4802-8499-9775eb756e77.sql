-- Add TikTok tracking fields to client_settings
ALTER TABLE public.client_settings
ADD COLUMN IF NOT EXISTS tiktok_pixel_code text,
ADD COLUMN IF NOT EXISTS tiktok_access_token text,
ADD COLUMN IF NOT EXISTS tiktok_tracking_enabled boolean DEFAULT false;

-- Add UTM tracking fields to telegram_customers
ALTER TABLE public.telegram_customers
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS ttclid text;