-- Create table for mandatory fees that must be paid before product delivery
CREATE TABLE public.product_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_fees ENABLE ROW LEVEL SECURITY;

-- Policies: clients can manage fees for their own products
CREATE POLICY "Clients can view their own product fees"
ON public.product_fees
FOR SELECT
USING (
  product_id IN (
    SELECT id FROM public.products WHERE client_id = get_my_client_id()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Clients can insert their own product fees"
ON public.product_fees
FOR INSERT
WITH CHECK (
  product_id IN (
    SELECT id FROM public.products WHERE client_id = get_my_client_id()
  )
);

CREATE POLICY "Clients can update their own product fees"
ON public.product_fees
FOR UPDATE
USING (
  product_id IN (
    SELECT id FROM public.products WHERE client_id = get_my_client_id()
  )
);

CREATE POLICY "Clients can delete their own product fees"
ON public.product_fees
FOR DELETE
USING (
  product_id IN (
    SELECT id FROM public.products WHERE client_id = get_my_client_id()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_product_fees_updated_at
BEFORE UPDATE ON public.product_fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add column to orders to track which fees have been paid
ALTER TABLE public.orders ADD COLUMN fees_paid JSONB DEFAULT '[]'::jsonb;

-- Add column to products to enable/disable mandatory fees
ALTER TABLE public.products ADD COLUMN require_fees_before_delivery BOOLEAN DEFAULT false;