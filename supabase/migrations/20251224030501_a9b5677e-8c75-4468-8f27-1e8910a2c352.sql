-- Add custom message field to product_fees table
ALTER TABLE public.product_fees 
ADD COLUMN IF NOT EXISTS payment_message text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.product_fees.payment_message IS 'Custom message template for fee payment. Supports placeholders: {fee_name}, {fee_amount}, {fee_description}, {remaining_count}';