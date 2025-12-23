-- Add columns to track upsell/downsell orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_upsell boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_downsell boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_order_id uuid REFERENCES public.orders(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_parent_order_id ON public.orders(parent_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_is_upsell ON public.orders(is_upsell) WHERE is_upsell = true;
CREATE INDEX IF NOT EXISTS idx_orders_is_downsell ON public.orders(is_downsell) WHERE is_downsell = true;