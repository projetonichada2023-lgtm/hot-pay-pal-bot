
-- Adicionar parent_affiliate_id e sub_commission_rate na tabela affiliates
ALTER TABLE public.affiliates 
  ADD COLUMN parent_affiliate_id uuid REFERENCES public.affiliates(id),
  ADD COLUMN sub_commission_rate numeric NOT NULL DEFAULT 2;

-- Adicionar source e sub_affiliate_id em affiliate_commissions
ALTER TABLE public.affiliate_commissions
  ADD COLUMN source text NOT NULL DEFAULT 'direct',
  ADD COLUMN sub_affiliate_id uuid REFERENCES public.affiliates(id);

-- RLS: afiliados podem ver seus subafiliados diretos
CREATE POLICY "Affiliates can view their sub-affiliates"
  ON public.affiliates FOR SELECT
  USING (parent_affiliate_id = get_my_affiliate_id());
