-- Create table for TikTok ttclid short code mappings
CREATE TABLE public.ttclid_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  short_code TEXT UNIQUE NOT NULL,
  ttclid TEXT NOT NULL,
  utm_campaign TEXT,
  utm_source TEXT DEFAULT 'tiktok',
  utm_medium TEXT DEFAULT 'cpc',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  used_at TIMESTAMPTZ,
  customer_id UUID REFERENCES public.telegram_customers(id)
);

-- Index for fast lookups
CREATE INDEX idx_ttclid_mappings_short_code ON public.ttclid_mappings(short_code);
CREATE INDEX idx_ttclid_mappings_client_id ON public.ttclid_mappings(client_id);
CREATE INDEX idx_ttclid_mappings_expires_at ON public.ttclid_mappings(expires_at);

-- Enable RLS
ALTER TABLE public.ttclid_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients can view their own mappings" 
ON public.ttclid_mappings 
FOR SELECT 
USING (client_id = get_my_client_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can insert their own mappings" 
ON public.ttclid_mappings 
FOR INSERT 
WITH CHECK (client_id = get_my_client_id());

CREATE POLICY "Service role can insert mappings" 
ON public.ttclid_mappings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update mappings" 
ON public.ttclid_mappings 
FOR UPDATE 
USING (true);

CREATE POLICY "Service role can select mappings" 
ON public.ttclid_mappings 
FOR SELECT 
USING (true);