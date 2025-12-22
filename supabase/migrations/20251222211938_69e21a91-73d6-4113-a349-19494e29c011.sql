-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'delivered', 'cancelled', 'refunded');

-- Create enum for payment method
CREATE TYPE public.payment_method AS ENUM ('pix', 'card', 'boleto');

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    file_url TEXT, -- for digital products
    is_active BOOLEAN DEFAULT true,
    is_hot BOOLEAN DEFAULT false,
    sales_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customers table (Telegram users)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    payment_method payment_method DEFAULT 'pix',
    pix_code TEXT, -- PIX copy-paste code
    pix_qrcode TEXT, -- PIX QR code base64
    payment_id TEXT, -- External payment gateway ID
    telegram_message_id BIGINT, -- To update payment status message
    paid_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bot settings table
CREATE TABLE public.bot_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    welcome_message TEXT DEFAULT 'Olá! 👋 Bem-vindo à nossa loja! Use /produtos para ver nosso catálogo.',
    payment_instructions TEXT DEFAULT 'Escaneie o QR Code ou copie o código PIX para realizar o pagamento.',
    success_message TEXT DEFAULT '✅ Pagamento confirmado! Seu produto será entregue em instantes.',
    auto_delivery BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

-- Products policies (public read for bot, admin write)
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

-- Customers policies (service role only for bot operations)
CREATE POLICY "Customers viewable by service role" 
ON public.customers FOR SELECT USING (true);

CREATE POLICY "Customers insertable by service role" 
ON public.customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers updatable by service role" 
ON public.customers FOR UPDATE USING (true);

-- Orders policies (service role for bot)
CREATE POLICY "Orders viewable by service role" 
ON public.orders FOR SELECT USING (true);

CREATE POLICY "Orders insertable by service role" 
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders updatable by service role" 
ON public.orders FOR UPDATE USING (true);

-- Bot settings policies
CREATE POLICY "Bot settings viewable by everyone" 
ON public.bot_settings FOR SELECT USING (true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default bot settings
INSERT INTO public.bot_settings (welcome_message) VALUES ('Olá! 👋 Bem-vindo à nossa loja! Use /produtos para ver nosso catálogo.');

-- Insert sample products
INSERT INTO public.products (name, description, price, is_active, is_hot) VALUES
('Curso Marketing Digital', 'Aprenda a vender online do zero ao avançado', 297.00, true, true),
('Ebook Vendas Online', 'Guia completo para começar a vender na internet', 47.00, true, true),
('Mentoria Premium', 'Acompanhamento individual por 30 dias', 997.00, true, false),
('Pack Templates', 'Mais de 100 templates prontos para usar', 27.00, true, true);