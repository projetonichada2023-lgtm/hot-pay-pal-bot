-- Add downsell_product_id column to products table
ALTER TABLE public.products 
ADD COLUMN downsell_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_products_downsell ON public.products(downsell_product_id);