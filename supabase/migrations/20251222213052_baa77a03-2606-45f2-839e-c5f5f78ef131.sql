-- Drop existing tables to rebuild with multi-tenant structure
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS bot_settings CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create order status and payment method enums
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'delivered', 'cancelled', 'refunded');
CREATE TYPE public.payment_method AS ENUM ('pix', 'card', 'boleto');

-- Clients table (stores/businesses using the platform)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  telegram_bot_token TEXT,
  telegram_bot_username TEXT,
  webhook_configured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'client',
  UNIQUE(user_id, role)
);

-- Bot messages configuration (customizable by each client)
CREATE TABLE public.bot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  message_type TEXT NOT NULL, -- welcome, payment_instructions, success, cart_reminder, upsell, support, order_cancelled, etc.
  message_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, message_type)
);

-- Bot settings per client
CREATE TABLE public.client_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL UNIQUE,
  auto_delivery BOOLEAN DEFAULT true,
  cart_reminder_enabled BOOLEAN DEFAULT false,
  cart_reminder_hours INTEGER DEFAULT 24,
  upsell_enabled BOOLEAN DEFAULT false,
  support_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products table (per client)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  file_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_hot BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Telegram customers (end users buying from bots)
CREATE TABLE public.telegram_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  telegram_id BIGINT NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, telegram_id)
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.telegram_customers(id),
  product_id UUID REFERENCES public.products(id),
  amount NUMERIC NOT NULL,
  status order_status DEFAULT 'pending',
  payment_method payment_method DEFAULT 'pix',
  pix_code TEXT,
  pix_qrcode TEXT,
  payment_id TEXT,
  telegram_message_id BIGINT,
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user's client_id
CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.clients WHERE user_id = auth.uid()
$$;

-- RLS Policies for clients
CREATE POLICY "Users can view their own client" ON public.clients
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own client" ON public.clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own client" ON public.clients
  FOR UPDATE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bot_messages
CREATE POLICY "Clients can view their own messages" ON public.bot_messages
  FOR SELECT USING (client_id = public.get_my_client_id() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can insert their own messages" ON public.bot_messages
  FOR INSERT WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "Clients can update their own messages" ON public.bot_messages
  FOR UPDATE USING (client_id = public.get_my_client_id());

CREATE POLICY "Clients can delete their own messages" ON public.bot_messages
  FOR DELETE USING (client_id = public.get_my_client_id());

-- RLS Policies for client_settings
CREATE POLICY "Clients can view their own settings" ON public.client_settings
  FOR SELECT USING (client_id = public.get_my_client_id() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can insert their own settings" ON public.client_settings
  FOR INSERT WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "Clients can update their own settings" ON public.client_settings
  FOR UPDATE USING (client_id = public.get_my_client_id());

-- RLS Policies for products
CREATE POLICY "Clients can view their own products" ON public.products
  FOR SELECT USING (client_id = public.get_my_client_id() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can insert their own products" ON public.products
  FOR INSERT WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "Clients can update their own products" ON public.products
  FOR UPDATE USING (client_id = public.get_my_client_id());

CREATE POLICY "Clients can delete their own products" ON public.products
  FOR DELETE USING (client_id = public.get_my_client_id());

-- RLS Policies for telegram_customers
CREATE POLICY "Clients can view their own customers" ON public.telegram_customers
  FOR SELECT USING (client_id = public.get_my_client_id() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can insert their own customers" ON public.telegram_customers
  FOR INSERT WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "Clients can update their own customers" ON public.telegram_customers
  FOR UPDATE USING (client_id = public.get_my_client_id());

-- RLS Policies for orders
CREATE POLICY "Clients can view their own orders" ON public.orders
  FOR SELECT USING (client_id = public.get_my_client_id() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (client_id = public.get_my_client_id());

CREATE POLICY "Clients can update their own orders" ON public.orders
  FOR UPDATE USING (client_id = public.get_my_client_id());

-- Triggers for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_messages_updated_at
  BEFORE UPDATE ON public.bot_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_settings_updated_at
  BEFORE UPDATE ON public.client_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_telegram_customers_updated_at
  BEFORE UPDATE ON public.telegram_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default messages for new client
CREATE OR REPLACE FUNCTION public.create_default_bot_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default messages
  INSERT INTO public.bot_messages (client_id, message_type, message_content) VALUES
    (NEW.id, 'welcome', 'Olá! 👋 Bem-vindo à nossa loja! Use /produtos para ver nosso catálogo.'),
    (NEW.id, 'payment_instructions', 'Escaneie o QR Code ou copie o código PIX para realizar o pagamento.'),
    (NEW.id, 'payment_success', '✅ Pagamento confirmado! Seu produto será entregue em instantes.'),
    (NEW.id, 'order_created', '🛒 Pedido criado com sucesso! Efetue o pagamento para receber seu produto.'),
    (NEW.id, 'order_cancelled', '❌ Pedido cancelado.'),
    (NEW.id, 'cart_reminder', '🛒 Você tem um pedido pendente! Complete seu pagamento para receber seu produto.'),
    (NEW.id, 'upsell', '🔥 Que tal aproveitar e levar mais um produto com desconto especial?'),
    (NEW.id, 'support', '💬 Precisa de ajuda? Estamos aqui para te atender!'),
    (NEW.id, 'product_delivered', '📦 Produto entregue! Obrigado pela compra!'),
    (NEW.id, 'no_products', '😕 Nenhum produto disponível no momento.');
  
  -- Insert default settings
  INSERT INTO public.client_settings (client_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger to create default messages when client is created
CREATE TRIGGER on_client_created
  AFTER INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.create_default_bot_messages();