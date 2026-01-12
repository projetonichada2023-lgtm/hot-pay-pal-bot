-- =============================================
-- PHASE 1: Create client_bots table
-- =============================================

CREATE TABLE public.client_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Bot Principal',
  telegram_bot_token TEXT,
  telegram_bot_username TEXT,
  webhook_configured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_bot_token UNIQUE (telegram_bot_token),
  CONSTRAINT unique_bot_username UNIQUE (telegram_bot_username)
);

-- Enable RLS
ALTER TABLE public.client_bots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_bots
CREATE POLICY "Clients can view their own bots"
  ON public.client_bots FOR SELECT
  USING (client_id = get_my_client_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can insert their own bots"
  ON public.client_bots FOR INSERT
  WITH CHECK (client_id = get_my_client_id());

CREATE POLICY "Clients can update their own bots"
  ON public.client_bots FOR UPDATE
  USING (client_id = get_my_client_id());

CREATE POLICY "Clients can delete their own bots"
  ON public.client_bots FOR DELETE
  USING (client_id = get_my_client_id());

-- Service role policies for edge functions
CREATE POLICY "Service role can manage bots"
  ON public.client_bots FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_client_bots_updated_at
  BEFORE UPDATE ON public.client_bots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- PHASE 2: Add bot_id to related tables
-- =============================================

-- Add bot_id to products
ALTER TABLE public.products
ADD COLUMN bot_id UUID REFERENCES public.client_bots(id) ON DELETE CASCADE;

-- Add bot_id to bot_messages
ALTER TABLE public.bot_messages
ADD COLUMN bot_id UUID REFERENCES public.client_bots(id) ON DELETE CASCADE;

-- Add bot_id to cart_recovery_messages
ALTER TABLE public.cart_recovery_messages
ADD COLUMN bot_id UUID REFERENCES public.client_bots(id) ON DELETE CASCADE;

-- Add bot_id to orders
ALTER TABLE public.orders
ADD COLUMN bot_id UUID REFERENCES public.client_bots(id) ON DELETE SET NULL;

-- Add bot_id to telegram_customers
ALTER TABLE public.telegram_customers
ADD COLUMN bot_id UUID REFERENCES public.client_bots(id) ON DELETE SET NULL;

-- Add bot_id to telegram_messages
ALTER TABLE public.telegram_messages
ADD COLUMN bot_id UUID REFERENCES public.client_bots(id) ON DELETE SET NULL;

-- Add bot_id to ttclid_mappings
ALTER TABLE public.ttclid_mappings
ADD COLUMN bot_id UUID REFERENCES public.client_bots(id) ON DELETE SET NULL;

-- Add bot_id to facebook_events
ALTER TABLE public.facebook_events
ADD COLUMN bot_id UUID REFERENCES public.client_bots(id) ON DELETE SET NULL;

-- Add bot_id to tiktok_events
ALTER TABLE public.tiktok_events
ADD COLUMN bot_id UUID REFERENCES public.client_bots(id) ON DELETE SET NULL;

-- =============================================
-- PHASE 3: Create helper function
-- =============================================

CREATE OR REPLACE FUNCTION public.get_my_bot_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.client_bots WHERE client_id = get_my_client_id()
$$;

-- =============================================
-- PHASE 4: Migrate existing data (handling duplicates)
-- =============================================

-- Create bot entries from existing clients, using DISTINCT ON to handle duplicate tokens
INSERT INTO public.client_bots (client_id, name, telegram_bot_token, telegram_bot_username, webhook_configured, is_primary, is_active)
SELECT DISTINCT ON (telegram_bot_token)
  id,
  'Bot Principal',
  telegram_bot_token,
  telegram_bot_username,
  COALESCE(webhook_configured, false),
  true,
  true
FROM public.clients
WHERE telegram_bot_token IS NOT NULL AND telegram_bot_token != ''
ORDER BY telegram_bot_token, created_at DESC;

-- Update products with bot_id from the primary bot
UPDATE public.products p
SET bot_id = cb.id
FROM public.client_bots cb
WHERE cb.client_id = p.client_id AND cb.is_primary = true;

-- Update bot_messages with bot_id from the primary bot
UPDATE public.bot_messages bm
SET bot_id = cb.id
FROM public.client_bots cb
WHERE cb.client_id = bm.client_id AND cb.is_primary = true;

-- Update cart_recovery_messages with bot_id from the primary bot
UPDATE public.cart_recovery_messages crm
SET bot_id = cb.id
FROM public.client_bots cb
WHERE cb.client_id = crm.client_id AND cb.is_primary = true;

-- Update orders with bot_id from the primary bot
UPDATE public.orders o
SET bot_id = cb.id
FROM public.client_bots cb
WHERE cb.client_id = o.client_id AND cb.is_primary = true;

-- Update telegram_customers with bot_id from the primary bot
UPDATE public.telegram_customers tc
SET bot_id = cb.id
FROM public.client_bots cb
WHERE cb.client_id = tc.client_id AND cb.is_primary = true;

-- Update telegram_messages with bot_id from the primary bot
UPDATE public.telegram_messages tm
SET bot_id = cb.id
FROM public.client_bots cb
WHERE cb.client_id = tm.client_id AND cb.is_primary = true;

-- Update ttclid_mappings with bot_id from the primary bot
UPDATE public.ttclid_mappings ttm
SET bot_id = cb.id
FROM public.client_bots cb
WHERE cb.client_id = ttm.client_id AND cb.is_primary = true;

-- Update facebook_events with bot_id from the primary bot
UPDATE public.facebook_events fe
SET bot_id = cb.id
FROM public.client_bots cb
WHERE cb.client_id = fe.client_id AND cb.is_primary = true;

-- Update tiktok_events with bot_id from the primary bot
UPDATE public.tiktok_events te
SET bot_id = cb.id
FROM public.client_bots cb
WHERE cb.client_id = te.client_id AND cb.is_primary = true;

-- =============================================
-- PHASE 5: Create indexes for performance
-- =============================================

CREATE INDEX idx_client_bots_client_id ON public.client_bots(client_id);
CREATE INDEX idx_client_bots_token ON public.client_bots(telegram_bot_token);
CREATE INDEX idx_products_bot_id ON public.products(bot_id);
CREATE INDEX idx_bot_messages_bot_id ON public.bot_messages(bot_id);
CREATE INDEX idx_cart_recovery_messages_bot_id ON public.cart_recovery_messages(bot_id);
CREATE INDEX idx_orders_bot_id ON public.orders(bot_id);
CREATE INDEX idx_telegram_customers_bot_id ON public.telegram_customers(bot_id);
CREATE INDEX idx_telegram_messages_bot_id ON public.telegram_messages(bot_id);

-- =============================================
-- PHASE 6: Create trigger for default bot messages
-- =============================================

CREATE OR REPLACE FUNCTION public.create_default_bot_messages_for_bot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert default messages for the new bot
  INSERT INTO public.bot_messages (client_id, bot_id, message_type, message_content) VALUES
    (NEW.client_id, NEW.id, 'welcome', 'Olá! 👋 Bem-vindo à nossa loja! Use /produtos para ver nosso catálogo.'),
    (NEW.client_id, NEW.id, 'payment_instructions', 'Escaneie o QR Code ou copie o código PIX para realizar o pagamento.'),
    (NEW.client_id, NEW.id, 'payment_success', '✅ Pagamento confirmado! Seu produto será entregue em instantes.'),
    (NEW.client_id, NEW.id, 'order_created', '🛒 Pedido criado com sucesso! Efetue o pagamento para receber seu produto.'),
    (NEW.client_id, NEW.id, 'order_cancelled', '❌ Pedido cancelado.'),
    (NEW.client_id, NEW.id, 'cart_reminder', '🛒 Você tem um pedido pendente! Complete seu pagamento para receber seu produto.'),
    (NEW.client_id, NEW.id, 'upsell', '🔥 Que tal aproveitar e levar mais um produto com desconto especial?'),
    (NEW.client_id, NEW.id, 'support', '💬 Precisa de ajuda? Estamos aqui para te atender!'),
    (NEW.client_id, NEW.id, 'product_delivered', '📦 Produto entregue! Obrigado pela compra!'),
    (NEW.client_id, NEW.id, 'no_products', '😕 Nenhum produto disponível no momento.');
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create default messages for new bots
CREATE TRIGGER create_bot_default_messages
  AFTER INSERT ON public.client_bots
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_bot_messages_for_bot();

-- =============================================
-- PHASE 7: Add max_bots to plan_limits
-- =============================================

ALTER TABLE public.plan_limits
ADD COLUMN max_bots INTEGER NOT NULL DEFAULT 1;