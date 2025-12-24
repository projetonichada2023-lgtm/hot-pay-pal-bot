-- Create subscription plan types enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'basic', 'pro', 'enterprise');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial', 'pending');

-- Create billing cycle enum
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'yearly');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  plan_type subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'trial',
  price NUMERIC DEFAULT 0,
  billing_cycle billing_cycle DEFAULT 'monthly',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Clients can view their own subscription
CREATE POLICY "Clients can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (client_id = get_my_client_id() OR has_role(auth.uid(), 'admin'));

-- Only admins can insert subscriptions
CREATE POLICY "Admins can insert subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update subscriptions
CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete subscriptions
CREATE POLICY "Admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add admin policies to clients table for admins to view all
CREATE POLICY "Admins can view all clients"
ON public.clients
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add admin policies to orders table for admins to view all
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'));