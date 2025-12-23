-- Create table for storing Telegram messages
CREATE TABLE public.telegram_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.telegram_customers(id) ON DELETE SET NULL,
  telegram_chat_id BIGINT NOT NULL,
  telegram_message_id BIGINT,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  message_type TEXT NOT NULL DEFAULT 'text',
  message_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_telegram_messages_client_id ON public.telegram_messages(client_id);
CREATE INDEX idx_telegram_messages_customer_id ON public.telegram_messages(customer_id);
CREATE INDEX idx_telegram_messages_chat_id ON public.telegram_messages(telegram_chat_id);
CREATE INDEX idx_telegram_messages_created_at ON public.telegram_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients can view their own messages"
ON public.telegram_messages
FOR SELECT
USING (client_id = get_my_client_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can insert their own messages"
ON public.telegram_messages
FOR INSERT
WITH CHECK (client_id = get_my_client_id());