-- Create table for TikTok events tracking
CREATE TABLE public.tiktok_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.telegram_customers(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- ClickButton, ViewContent, InitiateCheckout, CompletePayment
  event_id TEXT NOT NULL, -- TikTok event_id for deduplication
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  utm_campaign TEXT,
  value DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  ttclid TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tiktok_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own TikTok events"
ON public.tiktok_events
FOR SELECT
USING (client_id = public.get_my_client_id());

CREATE POLICY "Service role can insert TikTok events"
ON public.tiktok_events
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_tiktok_events_client_id ON public.tiktok_events(client_id);
CREATE INDEX idx_tiktok_events_event_type ON public.tiktok_events(event_type);
CREATE INDEX idx_tiktok_events_created_at ON public.tiktok_events(created_at);