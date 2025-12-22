-- Add telegram_group_id column to products table for VIP group functionality
ALTER TABLE public.products 
ADD COLUMN telegram_group_id text DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.products.telegram_group_id IS 'Telegram group/channel ID where the bot will add customers after purchase';