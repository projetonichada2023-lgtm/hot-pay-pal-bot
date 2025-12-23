-- Add display_order column to bot_messages to support multiple messages of the same type
ALTER TABLE public.bot_messages 
ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 1;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_bot_messages_order 
ON public.bot_messages (client_id, message_type, display_order);