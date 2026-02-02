-- Create affiliate status enum
CREATE TYPE public.affiliate_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Create affiliates table
CREATE TABLE public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    pix_key TEXT,
    pix_key_type TEXT,
    commission_rate NUMERIC NOT NULL DEFAULT 10,
    status affiliate_status NOT NULL DEFAULT 'pending',
    approved_at TIMESTAMP WITH TIME ZONE,
    total_earnings NUMERIC DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Create affiliate links table
CREATE TABLE public.affiliate_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES public.client_bots(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create affiliate commissions table
CREATE TABLE public.affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    affiliate_link_id UUID REFERENCES public.affiliate_links(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- Function to get affiliate id for current user
CREATE OR REPLACE FUNCTION public.get_my_affiliate_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.affiliates WHERE user_id = auth.uid()
$$;

-- RLS Policies for affiliates
CREATE POLICY "Users can view their own affiliate profile"
ON public.affiliates FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own affiliate profile"
ON public.affiliates FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own affiliate profile"
ON public.affiliates FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all affiliates"
ON public.affiliates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for affiliate links
CREATE POLICY "Affiliates can view their own links"
ON public.affiliate_links FOR SELECT
USING (affiliate_id = get_my_affiliate_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Affiliates can insert their own links"
ON public.affiliate_links FOR INSERT
WITH CHECK (affiliate_id = get_my_affiliate_id());

CREATE POLICY "Affiliates can update their own links"
ON public.affiliate_links FOR UPDATE
USING (affiliate_id = get_my_affiliate_id());

CREATE POLICY "Affiliates can delete their own links"
ON public.affiliate_links FOR DELETE
USING (affiliate_id = get_my_affiliate_id());

-- RLS Policies for affiliate commissions
CREATE POLICY "Affiliates can view their own commissions"
ON public.affiliate_commissions FOR SELECT
USING (affiliate_id = get_my_affiliate_id() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert commissions"
ON public.affiliate_commissions FOR INSERT
WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_links_updated_at
BEFORE UPDATE ON public.affiliate_links
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_commissions_updated_at
BEFORE UPDATE ON public.affiliate_commissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();