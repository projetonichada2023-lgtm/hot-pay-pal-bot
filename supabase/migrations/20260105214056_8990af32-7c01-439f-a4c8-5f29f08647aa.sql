-- Create facebook_events table for tracking
CREATE TABLE IF NOT EXISTS public.facebook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL,
  customer_id UUID REFERENCES public.telegram_customers(id),
  product_id UUID REFERENCES public.products(id),
  order_id UUID REFERENCES public.orders(id),
  value NUMERIC,
  currency TEXT DEFAULT 'BRL',
  ttclid TEXT,
  utm_campaign TEXT,
  api_status TEXT DEFAULT 'pending',
  api_response_code INTEGER,
  api_error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.facebook_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Service role can insert Facebook events"
ON public.facebook_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own Facebook events"
ON public.facebook_events
FOR SELECT
USING (client_id = get_my_client_id());

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.facebook_events;