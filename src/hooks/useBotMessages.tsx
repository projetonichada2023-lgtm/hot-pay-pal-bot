import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BotMessage {
  id: string;
  client_id: string;
  message_type: string;
  message_content: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useBotMessages = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['bot_messages', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bot_messages')
        .select('*')
        .eq('client_id', clientId!)
        .order('message_type')
        .order('display_order');

      if (error) throw error;
      return data as BotMessage[];
    },
    enabled: !!clientId,
  });
};

export const useUpdateBotMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, message_content, is_active }: { id: string; message_content?: string; is_active?: boolean }) => {
      const updates: Partial<BotMessage> = {};
      if (message_content !== undefined) updates.message_content = message_content;
      if (is_active !== undefined) updates.is_active = is_active;

      const { error } = await supabase
        .from('bot_messages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot_messages'] });
    },
  });
};

export const useCreateBotMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      client_id, 
      message_type, 
      message_content, 
      display_order 
    }: { 
      client_id: string; 
      message_type: string; 
      message_content: string; 
      display_order: number;
    }) => {
      const { data, error } = await supabase
        .from('bot_messages')
        .insert({
          client_id,
          message_type,
          message_content,
          display_order,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot_messages'] });
    },
  });
};

export const useDeleteBotMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bot_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot_messages'] });
    },
  });
};

export const useReorderBotMessages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messages: { id: string; display_order: number }[]) => {
      for (const msg of messages) {
        const { error } = await supabase
          .from('bot_messages')
          .update({ display_order: msg.display_order })
          .eq('id', msg.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot_messages'] });
    },
  });
};
