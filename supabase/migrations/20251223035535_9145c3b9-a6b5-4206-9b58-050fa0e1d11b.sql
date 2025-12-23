-- Remove the unique constraint that prevents multiple messages per type
ALTER TABLE public.bot_messages 
DROP CONSTRAINT IF EXISTS bot_messages_client_id_message_type_key;