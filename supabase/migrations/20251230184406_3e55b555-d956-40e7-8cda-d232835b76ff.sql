-- Add columns to store TikTok API response status
ALTER TABLE public.tiktok_events 
ADD COLUMN IF NOT EXISTS api_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS api_response_code integer,
ADD COLUMN IF NOT EXISTS api_error_message text;