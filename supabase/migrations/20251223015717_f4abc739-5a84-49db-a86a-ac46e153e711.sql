-- Create table for multiple upsells per product
CREATE TABLE public.product_upsells (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  upsell_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  upsell_message TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, upsell_product_id)
);

-- Enable RLS
ALTER TABLE public.product_upsells ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Clients can view their own product upsells"
  ON public.product_upsells FOR SELECT
  USING (
    product_id IN (SELECT id FROM public.products WHERE client_id = get_my_client_id())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Clients can insert their own product upsells"
  ON public.product_upsells FOR INSERT
  WITH CHECK (
    product_id IN (SELECT id FROM public.products WHERE client_id = get_my_client_id())
  );

CREATE POLICY "Clients can update their own product upsells"
  ON public.product_upsells FOR UPDATE
  USING (
    product_id IN (SELECT id FROM public.products WHERE client_id = get_my_client_id())
  );

CREATE POLICY "Clients can delete their own product upsells"
  ON public.product_upsells FOR DELETE
  USING (
    product_id IN (SELECT id FROM public.products WHERE client_id = get_my_client_id())
  );

-- Create indexes
CREATE INDEX idx_product_upsells_product_id ON public.product_upsells(product_id);
CREATE INDEX idx_product_upsells_display_order ON public.product_upsells(product_id, display_order);

-- Add trigger for updated_at
CREATE TRIGGER update_product_upsells_updated_at
  BEFORE UPDATE ON public.product_upsells
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();