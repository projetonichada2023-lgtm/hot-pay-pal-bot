-- Add custom upsell and downsell messages to products table
ALTER TABLE public.products 
ADD COLUMN upsell_message text,
ADD COLUMN downsell_message text;