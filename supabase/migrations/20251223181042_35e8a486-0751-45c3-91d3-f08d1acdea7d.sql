-- Add offer_product_id column to cart_recovery_messages table
ALTER TABLE public.cart_recovery_messages 
ADD COLUMN offer_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

-- Add offer_message column for custom offer text
ALTER TABLE public.cart_recovery_messages 
ADD COLUMN offer_message text;