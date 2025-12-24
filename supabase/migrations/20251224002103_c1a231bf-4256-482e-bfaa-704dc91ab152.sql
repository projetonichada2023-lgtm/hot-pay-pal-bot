-- Create plan_limits table for defining limits per subscription plan
CREATE TABLE public.plan_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type public.subscription_plan NOT NULL UNIQUE,
    max_products integer NOT NULL DEFAULT 10,
    max_orders_per_month integer NOT NULL DEFAULT 100,
    max_recovery_messages integer NOT NULL DEFAULT 3,
    upsell_enabled boolean NOT NULL DEFAULT false,
    cart_recovery_enabled boolean NOT NULL DEFAULT false,
    custom_messages_enabled boolean NOT NULL DEFAULT false,
    priority_support boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Only admins can manage plan limits
CREATE POLICY "Admins can manage plan limits"
ON public.plan_limits
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Everyone can view plan limits (needed for client-side checks)
CREATE POLICY "Anyone can view plan limits"
ON public.plan_limits
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_plan_limits_updated_at
BEFORE UPDATE ON public.plan_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default limits for each plan
INSERT INTO public.plan_limits (plan_type, max_products, max_orders_per_month, max_recovery_messages, upsell_enabled, cart_recovery_enabled, custom_messages_enabled, priority_support)
VALUES 
    ('free', 5, 50, 1, false, false, false, false),
    ('basic', 20, 200, 3, true, false, true, false),
    ('pro', 100, 1000, 5, true, true, true, false),
    ('enterprise', -1, -1, -1, true, true, true, true);

-- Create admin_settings table for global platform settings
CREATE TABLE public.admin_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key text NOT NULL UNIQUE,
    setting_value text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage admin settings"
ON public.admin_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES 
    ('trial_days', '7', 'Número de dias do período de teste'),
    ('default_plan', 'free', 'Plano padrão para novos clientes'),
    ('notify_new_client', 'true', 'Notificar admin sobre novos clientes'),
    ('notify_expiring_trial', 'true', 'Notificar sobre trials expirando'),
    ('min_order_value', '0', 'Valor mínimo de pedido');