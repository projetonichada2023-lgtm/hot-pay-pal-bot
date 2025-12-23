-- Add advanced settings columns to client_settings
ALTER TABLE public.client_settings
ADD COLUMN IF NOT EXISTS pix_key TEXT,
ADD COLUMN IF NOT EXISTS pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
ADD COLUMN IF NOT EXISTS pix_receiver_name TEXT,
ADD COLUMN IF NOT EXISTS opening_time TIME,
ADD COLUMN IF NOT EXISTS closing_time TIME,
ADD COLUMN IF NOT EXISTS working_days TEXT[] DEFAULT ARRAY['seg', 'ter', 'qua', 'qui', 'sex']::TEXT[];

-- Add business contact info to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS business_phone TEXT,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS business_description TEXT;