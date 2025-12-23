-- Add public key column to client_settings
ALTER TABLE public.client_settings 
ADD COLUMN IF NOT EXISTS fastsoft_public_key text;