-- Add media columns to cart_recovery_messages
ALTER TABLE public.cart_recovery_messages 
ADD COLUMN media_url TEXT,
ADD COLUMN media_type TEXT;

-- Add time_unit column to specify minutes, hours, or days
ALTER TABLE public.cart_recovery_messages 
ADD COLUMN time_unit TEXT DEFAULT 'minutes' CHECK (time_unit IN ('minutes', 'hours', 'days'));