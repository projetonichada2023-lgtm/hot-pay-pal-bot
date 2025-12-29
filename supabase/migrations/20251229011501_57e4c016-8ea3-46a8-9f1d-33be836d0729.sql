
-- Add recovery tracking columns to telegram_customers for customers without orders
ALTER TABLE public.telegram_customers
ADD COLUMN IF NOT EXISTS recovery_messages_sent integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_recovery_sent_at timestamp with time zone;

-- Add comment
COMMENT ON COLUMN public.telegram_customers.recovery_messages_sent IS 'Number of recovery messages sent to this customer (for those who never ordered)';
COMMENT ON COLUMN public.telegram_customers.last_recovery_sent_at IS 'Timestamp of last recovery message sent to this customer';
