-- Add button text column for fee confirmation button
ALTER TABLE public.product_fees 
ADD COLUMN IF NOT EXISTS button_text text DEFAULT 'Paguei a Taxa ✅';