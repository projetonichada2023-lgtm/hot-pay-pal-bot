import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MessageButton {
  text: string;
  action: 'callback' | 'url';
  value: string; // callback_data or URL
}

export interface BotMessage {
  id: string;
  client_id: string;
  message_type: string;
  message_content: string;
  is_active: boolean;
  display_order: number;
  media_url: string | null;
  media_type: string | null;
  buttons: MessageButton[];
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
      return (data || []).map(msg => ({
        ...msg,
        buttons: Array.isArray(msg.buttons) ? (msg.buttons as unknown as MessageButton[]) : [],
      })) as BotMessage[];
    },
    enabled: !!clientId,
  });
};

export const useUpdateBotMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      message_content, 
      is_active, 
      media_url, 
      media_type,
      buttons,
    }: { 
      id: string; 
      message_content?: string; 
      is_active?: boolean;
      media_url?: string | null;
      media_type?: string | null;
      buttons?: MessageButton[];
    }) => {
      const updates: Record<string, unknown> = {};
      if (message_content !== undefined) updates.message_content = message_content;
      if (is_active !== undefined) updates.is_active = is_active;
      if (media_url !== undefined) updates.media_url = media_url;
      if (media_type !== undefined) updates.media_type = media_type;
      if (buttons !== undefined) updates.buttons = buttons;

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
      display_order,
      media_url,
      media_type,
      buttons,
    }: { 
      client_id: string; 
      message_type: string; 
      message_content: string; 
      display_order: number;
      media_url?: string | null;
      media_type?: string | null;
      buttons?: MessageButton[];
    }) => {
      const insertData = {
        client_id,
        message_type,
        message_content,
        display_order,
        is_active: true,
        media_url: media_url || null,
        media_type: media_type || null,
        buttons: (buttons || []) as unknown,
      };
      
      const { data, error } = await supabase
        .from('bot_messages')
        .insert(insertData as any)
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
