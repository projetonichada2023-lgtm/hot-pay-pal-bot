-- Enable REPLICA IDENTITY FULL for orders table to capture complete row data
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Add orders table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable REPLICA IDENTITY FULL for telegram_messages table
ALTER TABLE public.telegram_messages REPLICA IDENTITY FULL;

-- Add telegram_messages table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.telegram_messages;