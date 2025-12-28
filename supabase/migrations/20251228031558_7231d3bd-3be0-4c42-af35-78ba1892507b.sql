-- Create notification templates table
CREATE TABLE public.notification_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  icon text DEFAULT '💰',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage notification templates
CREATE POLICY "Admins can manage notification templates"
  ON public.notification_templates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role can read (for edge functions)
CREATE POLICY "Service role can read notification templates"
  ON public.notification_templates
  FOR SELECT
  USING (true);

-- Insert default templates
INSERT INTO public.notification_templates (event_type, title, body, icon) VALUES
  ('sale', '💰 Nova Venda!', 'Você recebeu um pagamento de {amount}', '💰'),
  ('order_created', '🛒 Novo Pedido', 'Um novo pedido de {amount} foi criado', '🛒'),
  ('delivery', '📦 Produto Entregue', 'O produto {product} foi entregue ao cliente', '📦'),
  ('cart_abandoned', '🛒 Carrinho Abandonado', 'Um cliente abandonou o carrinho de {amount}', '🛒'),
  ('refund', '↩️ Reembolso', 'Um pedido de {amount} foi reembolsado', '↩️');

-- Trigger for updated_at
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();