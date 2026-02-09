
-- Add DuttyFy fields to client_settings
ALTER TABLE public.client_settings
ADD COLUMN IF NOT EXISTS duttyfy_api_key text,
ADD COLUMN IF NOT EXISTS duttyfy_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS active_payment_gateway text DEFAULT 'unipay';

-- active_payment_gateway: 'unipay' | 'duttyfy' to select which gateway to use
