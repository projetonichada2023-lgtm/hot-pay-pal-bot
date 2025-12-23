-- Add buttons column to store custom inline keyboard buttons
ALTER TABLE public.bot_messages 
ADD COLUMN IF NOT EXISTS buttons jsonb DEFAULT '[]'::jsonb;