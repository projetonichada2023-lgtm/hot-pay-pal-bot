import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TelegramMessage {
  id: string;
  client_id: string;
  customer_id: string | null;
  telegram_chat_id: number;
  telegram_message_id: number | null;
  direction: 'incoming' | 'outgoing';
  message_type: string;
  message_content: string | null;
  created_at: string;
  customer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    telegram_username: string | null;
  } | null;
}

export interface ChatConversation {
  customer_id: string;
  telegram_chat_id: number;
  customer_name: string;
  customer_username: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  messages: TelegramMessage[];
}

export function useTelegramConversations(clientId: string) {
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    if (!clientId) return;

    console.log('Setting up realtime subscription for telegram_messages');
    
    const channel = supabase
      .channel('telegram-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telegram_messages',
          filter: `client_id=eq.${clientId}`,
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Fetch the customer data for the new message
          const newMessage = payload.new as any;
          let customer = null;
          
          if (newMessage.customer_id) {
            const { data: customerData } = await supabase
              .from('telegram_customers')
              .select('id, first_name, last_name, telegram_username')
              .eq('id', newMessage.customer_id)
              .maybeSingle();
            customer = customerData;
          }

          // Update the query cache with the new message
          queryClient.setQueryData(
            ['telegram-conversations', clientId],
            (oldData: ChatConversation[] | undefined) => {
              if (!oldData) return oldData;

              const messageWithCustomer: TelegramMessage = {
                ...newMessage,
                customer,
              };

              const key = newMessage.customer_id || `chat_${newMessage.telegram_chat_id}`;
              const existingConvIndex = oldData.findIndex(c => c.customer_id === key);

              if (existingConvIndex >= 0) {
                // Update existing conversation
                const updatedConversations = [...oldData];
                const conv = { ...updatedConversations[existingConvIndex] };
                conv.messages = [...conv.messages, messageWithCustomer];
                conv.last_message = newMessage.message_content;
                conv.last_message_at = newMessage.created_at;
                updatedConversations[existingConvIndex] = conv;

                // Re-sort by most recent message
                updatedConversations.sort(
                  (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
                );

                return updatedConversations;
              } else {
                // Create new conversation
                const customerName = customer
                  ? [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'Usuário'
                  : 'Usuário Desconhecido';

                const newConv: ChatConversation = {
                  customer_id: key,
                  telegram_chat_id: newMessage.telegram_chat_id,
                  customer_name: customerName,
                  customer_username: customer?.telegram_username || null,
                  last_message: newMessage.message_content,
                  last_message_at: newMessage.created_at,
                  unread_count: 0,
                  messages: [messageWithCustomer],
                };

                return [newConv, ...oldData];
              }
            }
          );
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [clientId, queryClient]);

  return useQuery({
    queryKey: ['telegram-conversations', clientId],
    queryFn: async () => {
      // Fetch all messages with customer info
      const { data: messages, error } = await supabase
        .from('telegram_messages')
        .select(`
          *,
          customer:telegram_customers(id, first_name, last_name, telegram_username)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      // Group by customer/chat
      const conversationsMap = new Map<string, ChatConversation>();

      for (const msg of messages || []) {
        const key = msg.customer_id || `chat_${msg.telegram_chat_id}`;
        
        if (!conversationsMap.has(key)) {
          const customer = msg.customer;
          conversationsMap.set(key, {
            customer_id: msg.customer_id || key,
            telegram_chat_id: msg.telegram_chat_id,
            customer_name: customer 
              ? [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'Usuário'
              : 'Usuário Desconhecido',
            customer_username: customer?.telegram_username || null,
            last_message: msg.message_content,
            last_message_at: msg.created_at,
            unread_count: 0,
            messages: [],
          });
        }

        const conv = conversationsMap.get(key)!;
        conv.messages.push(msg as TelegramMessage);
      }

      // Sort messages within each conversation (oldest first for display)
      for (const conv of conversationsMap.values()) {
        conv.messages.reverse();
      }

      // Return as array sorted by most recent message
      return Array.from(conversationsMap.values()).sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
    },
    enabled: !!clientId,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

export function useTelegramChatMessages(clientId: string, chatId: number | null) {
  return useQuery({
    queryKey: ['telegram-chat-messages', clientId, chatId],
    queryFn: async () => {
      if (!chatId) return [];

      const { data, error } = await supabase
        .from('telegram_messages')
        .select(`
          *,
          customer:telegram_customers(id, first_name, last_name, telegram_username)
        `)
        .eq('client_id', clientId)
        .eq('telegram_chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data as TelegramMessage[];
    },
    enabled: !!clientId && !!chatId,
  });
}
