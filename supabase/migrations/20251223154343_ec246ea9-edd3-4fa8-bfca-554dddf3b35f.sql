-- Add FastSoft/UniPay payment gateway credentials to client_settings
ALTER TABLE public.client_settings
ADD COLUMN IF NOT EXISTS fastsoft_api_key TEXT,
ADD COLUMN IF NOT EXISTS fastsoft_webhook_secret TEXT,
ADD COLUMN IF NOT EXISTS fastsoft_enabled BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.client_settings.fastsoft_api_key IS 'FastSoft/UniPay API secret key for authentication';
COMMENT ON COLUMN public.client_settings.fastsoft_webhook_secret IS 'Secret for validating FastSoft webhook signatures';
COMMENT ON COLUMN public.client_settings.fastsoft_enabled IS 'Whether FastSoft payment gateway is enabled for this client';