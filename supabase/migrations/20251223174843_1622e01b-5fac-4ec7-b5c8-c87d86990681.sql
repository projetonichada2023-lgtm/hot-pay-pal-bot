-- Create table for cart recovery messages
CREATE TABLE public.cart_recovery_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  delay_minutes INTEGER NOT NULL DEFAULT 30,
  message_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cart_recovery_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients can view their own recovery messages"
ON public.cart_recovery_messages
FOR SELECT
USING (client_id = get_my_client_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can insert their own recovery messages"
ON public.cart_recovery_messages
FOR INSERT
WITH CHECK (client_id = get_my_client_id());

CREATE POLICY "Clients can update their own recovery messages"
ON public.cart_recovery_messages
FOR UPDATE
USING (client_id = get_my_client_id());

CREATE POLICY "Clients can delete their own recovery messages"
ON public.cart_recovery_messages
FOR DELETE
USING (client_id = get_my_client_id());

-- Add column to orders to track recovery messages sent
ALTER TABLE public.orders ADD COLUMN recovery_messages_sent INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN last_recovery_sent_at TIMESTAMP WITH TIME ZONE;

-- Create trigger for updated_at
CREATE TRIGGER update_cart_recovery_messages_updated_at
BEFORE UPDATE ON public.cart_recovery_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();