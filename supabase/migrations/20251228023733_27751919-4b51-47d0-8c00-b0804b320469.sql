-- Tabela para armazenar push subscriptions dos clientes
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Clients can view their own subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (client_id = get_my_client_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can insert their own subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (client_id = get_my_client_id());

CREATE POLICY "Clients can delete their own subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (client_id = get_my_client_id());

-- Adicionar campo para habilitar push notifications na client_settings
ALTER TABLE public.client_settings 
ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT false;

-- Trigger para updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();